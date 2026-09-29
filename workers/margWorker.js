// ============================================================
// margWorker.js
// ============================================================

const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const {
    parentPort
} = require('worker_threads');

require('dotenv').config();

const api = require('../api');

const {
    activatePause
} = require('./pauseManager');

// ============================================================
// CONFIGURAÇÕES
// ============================================================

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.SECRET_KEY;

const BASE_URL = 'https://fapi.binance.com';

const TELEGRAM_TOKEN =
    process.env.TELEGRAM_TOKEN;

const TELEGRAM_API =
    TELEGRAM_TOKEN
        ? `https://api.telegram.org/bot${TELEGRAM_TOKEN}`
        : null;

// Intervalo do monitoramento
const MONITOR_INTERVAL =
    parseInt(
        process.env.MARG_MONITOR_INTERVAL || '10000',
        10
    );

// Timeout
const GLOBAL_AXIOS_TIMEOUT =
    parseInt(
        process.env.GLOBAL_AXIOS_TIMEOUT || '1000',
        10
    );

axios.defaults.timeout =
    GLOBAL_AXIOS_TIMEOUT;

// ============================================================
// CACHE
// ============================================================

const CACHE_DIR =
    path.resolve(
        __dirname,
        'cache'
    );

if (!fs.existsSync(CACHE_DIR)) {

    fs.mkdirSync(
        CACHE_DIR,
        {
            recursive: true
        }
    );

}

// ============================================================
// ARQUIVOS
// ============================================================

const USERS_FILE =
    path.join(
        CACHE_DIR,
        'users.json'
    );

const TELEGRAM_MARGIN_MESSAGES_FILE =
    path.join(
        CACHE_DIR,
        'telegramMarginMessages.json'
    );

// ============================================================
// ESTADO
// ============================================================

let offset = 0;

let workerRunning = false;

let ultimoTextoTelegram = null;

let ultimoEnvioTelegram = 0;

// ============================================================
// LOG
// ============================================================

function log(...args) {

    console.log(
        '[margWorker]',
        ...args
    );

}

// ============================================================
// COMUNICAÇÃO COM PROCESSO PAI
// ============================================================

function enviarPai(message) {

    try {

        if (parentPort) {

            parentPort.postMessage(
                message
            );

        }

    } catch (error) {

        console.error(
            '[margWorker] Erro parentPort:',
            error.message
        );

    }

}

// ============================================================
// CACHE - SALVAR
// ============================================================

async function salvarCache(
    cache,
    nomeArquivo
) {

    try {

        const filePath =
            path.join(
                CACHE_DIR,
                `${nomeArquivo}.json`
            );

        await fs.promises.writeFile(
            filePath,
            JSON.stringify(
                cache,
                null,
                2
            ),
            'utf8'
        );

        return true;

    } catch (error) {

        console.error(
            `[margWorker] Erro ao salvar ${nomeArquivo}:`,
            error.message
        );

        return false;

    }

}

// ============================================================
// CACHE - CARREGAR
// ============================================================

async function carregarCache(
    nomeArquivo
) {

    try {

        const filePath =
            path.join(
                CACHE_DIR,
                `${nomeArquivo}.json`
            );

        if (
            !fs.existsSync(
                filePath
            )
        ) {

            return {};

        }

        const content =
            await fs.promises.readFile(
                filePath,
                'utf8'
            );

        if (
            !content.trim()
        ) {

            return {};

        }

        return JSON.parse(
            content
        );

    } catch (error) {

        console.error(
            `[margWorker] Erro ao carregar ${nomeArquivo}:`,
            error.message
        );

        return {};

    }

}

// ============================================================
// NÚMERO
// ============================================================

function numero(
    valor,
    padrao = 0
) {

    const n =
        Number(valor);

    return Number.isFinite(n)
        ? n
        : padrao;

}

// ============================================================
// NÚMERO VÁLIDO
// ============================================================

function numeroValido(
    valor
) {

    return Number.isFinite(
        Number(valor)
    );

}

// ============================================================
// ARREDONDAMENTO
// ============================================================

function arredondar(
    valor,
    casas = 2
) {

    const n =
        Number(valor);

    if (
        !Number.isFinite(n)
    ) {

        return 0;

    }

    return Number(
        n.toFixed(casas)
    );

}

// ============================================================
// PERCENTUAL
// ============================================================

function percentage(
    valorAntigo,
    valorNovo
) {

    const antigo =
        Number(valorAntigo);

    const novo =
        Number(valorNovo);

    if (
        !Number.isFinite(antigo) ||
        !Number.isFinite(novo) ||
        antigo === 0
    ) {

        return 0;

    }

    return (
        (
            (novo - antigo) /
            antigo
        ) * 100
    );

}

// ============================================================
// DATA / HORA
// ============================================================

function formatTime(
    timestamp
) {

    const date =
        new Date(timestamp);

    const dia =
        String(
            date.getDate()
        ).padStart(2, '0');

    const mes =
        String(
            date.getMonth() + 1
        ).padStart(2, '0');

    const ano =
        date.getFullYear();

    const hora =
        String(
            date.getHours()
        ).padStart(2, '0');

    const minuto =
        String(
            date.getMinutes()
        ).padStart(2, '0');

    const segundo =
        String(
            date.getSeconds()
        ).padStart(2, '0');

    return (
        `${dia}/${mes}/${ano} ` +
        `${hora}:${minuto}:${segundo}`
    );

}

// ============================================================
// DIA ATUAL
// ============================================================

function getCurrentDay() {

    const date =
        new Date();

    const dia =
        String(
            date.getDate()
        ).padStart(2, '0');

    const mes =
        String(
            date.getMonth() + 1
        ).padStart(2, '0');

    const ano =
        date.getFullYear();

    return (
        `${ano}-${mes}-${dia}`
    );

}

// ============================================================
// TELEGRAM
// ============================================================

/*
 * IMPORTANTE:
 *
 * Esta função agora retorna um objeto estruturado em caso
 * de erro, em vez de simplesmente retornar null.
 *
 * Isso permite diferenciar:
 *
 * - mensagem realmente inexistente;
 * - erro temporário;
 * - rate limit;
 * - erro de servidor;
 * - timeout;
 * - mensagem não modificada.
 */

async function telegramRequest(
    method,
    payload = {}
) {

    if (!TELEGRAM_API) {

        console.error(
            '[margWorker] TELEGRAM_TOKEN não configurado.'
        );

        return {

            ok: false,

            type:
                'configuration',

            errorCode:
                null,

            description:
                'TELEGRAM_TOKEN não configurado.'

        };

    }

    try {

        const response =
            await axios({

                method: 'POST',

                url:
                    `${TELEGRAM_API}/${method}`,

                data:
                    payload,

                timeout:
                    5000

            });

        if (
            response.data &&
            response.data.ok
        ) {

            return {

                ok: true,

                result:
                    response.data.result

            };

        }

        const errorCode =
            response.data?.error_code ??
            null;

        const description =
            response.data?.description ??
            'Erro desconhecido do Telegram.';

        console.error(
            `[margWorker] Telegram ${method}:`,
            response.data
        );

        return {

            ok: false,

            type:
                'telegram',

            errorCode,

            description

        };

    } catch (error) {

        const errorCode =
            error.response?.data?.error_code ??
            error.response?.status ??
            null;

        const description =
            error.response?.data?.description ||
            error.message ||
            'Erro desconhecido.';

        console.error(
            `[margWorker] Telegram ${method}:`,
            error.response?.data ||
            error.message
        );

        return {

            ok: false,

            type:
                'network',

            errorCode,

            description,

            networkCode:
                error.code || null

        };

    }

}

// ============================================================
// VERIFICAR SE MENSAGEM REALMENTE NÃO EXISTE
// ============================================================

function telegramMensagemNaoEncontrada(
    resposta
) {

    if (
        !resposta ||
        resposta.ok
    ) {

        return false;

    }

    const description =
        String(
            resposta.description ||
            ''
        ).toLowerCase();

    /*
     * SOMENTE erros explicitamente relacionados à mensagem
     * inexistente entram aqui.
     *
     * Não tratamos qualquer erro 400 como mensagem apagada.
     */

    return (
        description.includes(
            'message to edit not found'
        ) ||

        description.includes(
            'message identifier is not specified'
        ) ||

        description.includes(
            'message not found'
        )
    );

}

// ============================================================
// VERIFICAR MENSAGEM NÃO MODIFICADA
// ============================================================

function telegramMensagemNaoModificada(
    resposta
) {

    if (
        !resposta ||
        resposta.ok
    ) {

        return false;

    }

    const description =
        String(
            resposta.description ||
            ''
        ).toLowerCase();

    return (
        description.includes(
            'message is not modified'
        )
    );

}

// ============================================================
// VERIFICAR ERRO TEMPORÁRIO
// ============================================================

function telegramErroTemporario(
    resposta
) {

    if (
        !resposta ||
        resposta.ok
    ) {

        return false;

    }

    const code =
        Number(
            resposta.errorCode
        );

    const description =
        String(
            resposta.description ||
            ''
        ).toLowerCase();

    const networkCode =
        String(
            resposta.networkCode ||
            ''
        ).toUpperCase();

    // --------------------------------------------------------
    // Rate limit
    // --------------------------------------------------------

    if (
        code === 429
    ) {

        return true;

    }

    // --------------------------------------------------------
    // Erros de servidor Telegram
    // --------------------------------------------------------

    if (
        code >= 500 &&
        code <= 599
    ) {

        return true;

    }

    // --------------------------------------------------------
    // Erros comuns de rede
    // --------------------------------------------------------

    if (
        networkCode === 'ECONNRESET' ||
        networkCode === 'ETIMEDOUT' ||
        networkCode === 'ECONNABORTED' ||
        networkCode === 'EAI_AGAIN' ||
        networkCode === 'ENOTFOUND' ||
        networkCode === 'EPIPE'
    ) {

        return true;

    }

    // --------------------------------------------------------
    // Descrições de timeout/conexão
    // --------------------------------------------------------

    if (
        description.includes('timeout') ||
        description.includes('timed out') ||
        description.includes('network') ||
        description.includes('socket') ||
        description.includes('connection')
    ) {

        return true;

    }

    return false;

}

// ============================================================
// USUÁRIOS TELEGRAM
// ============================================================

async function carregarUsuariosTelegram() {

    try {

        if (
            !fs.existsSync(
                USERS_FILE
            )
        ) {

            console.log(
                '[margWorker] users.json não encontrado.'
            );

            return [];

        }

        const content =
            await fs.promises.readFile(
                USERS_FILE,
                'utf8'
            );

        if (
            !content.trim()
        ) {

            return [];

        }

        const data =
            JSON.parse(
                content
            );

        // ----------------------------------------------------
        // ARRAY
        // ----------------------------------------------------

        if (
            Array.isArray(data)
        ) {

            return data
                .map(user => {

                    if (
                        typeof user ===
                        'string' ||
                        typeof user ===
                        'number'
                    ) {

                        return {

                            chatId:
                                String(user)

                        };

                    }

                    if (
                        !user ||
                        typeof user !==
                        'object'
                    ) {

                        return null;

                    }

                    const chatId =
                        user.chatId ??
                        user.chat_id ??
                        user.telegramId ??
                        user.id;

                    if (
                        chatId === undefined ||
                        chatId === null
                    ) {

                        return null;

                    }

                    return {

                        ...user,

                        chatId:
                            String(chatId)

                    };

                })
                .filter(Boolean);

        }

        // ----------------------------------------------------
        // OBJETO
        // ----------------------------------------------------

        if (
            data &&
            typeof data ===
            'object'
        ) {

            return Object.entries(
                data
            )
                .map(
                    ([key, user]) => {

                        if (
                            user &&
                            typeof user ===
                            'object'
                        ) {

                            const chatId =
                                user.chatId ??
                                user.chat_id ??
                                user.telegramId ??
                                user.id ??
                                key;

                            return {

                                ...user,

                                chatId:
                                    String(chatId)

                            };

                        }

                        return {

                            chatId:
                                String(key)

                        };

                    }
                );

        }

        return [];

    } catch (error) {

        console.error(
            '[margWorker] Erro users.json:',
            error.message
        );

        return [];

    }

}

// ============================================================
// MESSAGE IDS DO TELEGRAM
// ============================================================

async function carregarTelegramMarginMessages() {

    try {

        if (
            !fs.existsSync(
                TELEGRAM_MARGIN_MESSAGES_FILE
            )
        ) {

            return {};

        }

        const content =
            await fs.promises.readFile(
                TELEGRAM_MARGIN_MESSAGES_FILE,
                'utf8'
            );

        if (
            !content.trim()
        ) {

            return {};

        }

        const data =
            JSON.parse(
                content
            );

        if (
            !data ||
            typeof data !==
            'object' ||
            Array.isArray(data)
        ) {

            return {};

        }

        return data;

    } catch (error) {

        console.error(
            '[margWorker] Erro message IDs:',
            error.message
        );

        return {};

    }

}

// ============================================================

async function salvarTelegramMarginMessages(
    data
) {

    try {

        await fs.promises.writeFile(

            TELEGRAM_MARGIN_MESSAGES_FILE,

            JSON.stringify(
                data,
                null,
                2
            ),

            'utf8'

        );

        return true;

    } catch (error) {

        console.error(
            '[margWorker] Erro ao salvar message IDs:',
            error.message
        );

        return false;

    }

}

// ============================================================
// FORMATAÇÃO TELEGRAM
// ============================================================

function formatarPercentual(
    valor
) {

    const n =
        Number(valor);

    if (
        !Number.isFinite(n)
    ) {

        return '0.00%';

    }

    if (
        n > 0
    ) {

        return (
            `+${n.toFixed(2)}%`
        );

    }

    return (
        `${n.toFixed(2)}%`
    );

}

// ============================================================

function formatarDinheiro(
    valor
) {

    const n =
        Number(valor);

    if (
        !Number.isFinite(n)
    ) {

        return '$ 0.00';

    }

    return (
        `$ ${n.toFixed(2)}`
    );

}

// ============================================================

function emojiResultado(
    resultado
) {

    if (
        !resultado
    ) {

        return '⚪';

    }

    const texto =
        String(
            resultado
        ).toLowerCase();

    if (
        texto.includes('positivo') ||
        texto.includes('positive') ||
        texto.includes('profit') ||
        texto.includes('lucro')
    ) {

        return '🟢';

    }

    if (
        texto.includes('negativo') ||
        texto.includes('negative') ||
        texto.includes('loss') ||
        texto.includes('preju')
    ) {

        return '🔴';

    }

    return '⚪';

}

// ============================================================
// MENSAGEM DE STATUS
// ============================================================

function montarMensagemMargem(
    data
) {

    const variation =
        formatarPercentual(
            data.variation
        );

    const variationReal =
        formatarPercentual(
            data.variationReal
        );

    const maxPercent =
        formatarPercentual(
            data.maxPercent
        );

    const minPercent =
        formatarPercentual(
            data.minPercent
        );

    const resultado =
        data.lastResult ||
        'Nenhum';

    const emoji =
        emojiResultado(
            resultado
        );

    return (

        `━━━━━━━━━━━━━━━\n` +

        `💰 <b>STATUS DA MARGEM</b>\n` +

        `━━━━━━━━━━━━━━━\n\n` +

        `🎯 <b>Saldo base:</b> ` +
        `${formatarDinheiro(data.baseBalance)}\n\n` +

        `💵 <b>Margem:</b> ` +
        `${formatarDinheiro(data.marginBalance)}\n` +

        `💰 <b>Carteira:</b> ` +
        `${formatarDinheiro(data.walletBalance)}\n` +

        `💳 <b>Disponível:</b> ` +
        `${formatarDinheiro(data.availableBalance)}\n\n` +

        `📊 <b>Variação:</b> ` +
        `${variation}\n` +

        `📈 <b>Variação real:</b> ` +
        `${variationReal}\n\n` +

        `🔼 <b>Máximo:</b> ` +
        `${maxPercent}\n` +

        `🔽 <b>Mínimo:</b> ` +
        `${minPercent}\n\n` +

        `🔄 <b>Reinícios:</b> ` +
        `${data.resetCount}\n` +

        `🟢 <b>Positivos:</b> ` +
        `${data.positiveCount}\n` +

        `🔴 <b>Negativos:</b> ` +
        `${data.negativeCount}\n` +

        `${emoji} <b>Último resultado:</b> ` +
        `${resultado}\n\n` +

        `⏱ <b>Atualizado:</b>\n` +
        `${data.updatedAtFormatted}\n` +

        `━━━━━━━━━━━━━━━`

    );

}

// ============================================================
// VALIDAÇÃO DO STATUS
// ============================================================

function statusMargemValido(
    data
) {

    if (!data) {

        return false;

    }

    if (
        !numeroValido(
            data.marginBalance
        )
    ) {

        return false;

    }

    if (
        !numeroValido(
            data.walletBalance
        )
    ) {

        return false;

    }

    if (
        !numeroValido(
            data.baseBalance
        )
    ) {

        return false;

    }

    return true;

}

// ============================================================
// ATUALIZAR TELEGRAM
// ============================================================

async function atualizarMensagemMargemTelegram(
    data
) {

    if (
        !TELEGRAM_TOKEN
    ) {

        return;

    }

    if (
        !statusMargemValido(
            data
        )
    ) {

        console.log(
            '[margWorker] Dados inválidos. Telegram não atualizado.'
        );

        return;

    }

    const agora =
        Date.now();

    const texto =
        montarMensagemMargem(
            data
        );

    // --------------------------------------------------------
    // Evita chamadas desnecessárias
    // --------------------------------------------------------

    if (
        texto ===
        ultimoTextoTelegram &&
        agora -
        ultimoEnvioTelegram <
        9000
    ) {

        return;

    }

    const usuarios =
        await carregarUsuariosTelegram();

    if (
        !usuarios.length
    ) {

        return;

    }

    const messages =
        await carregarTelegramMarginMessages();

    let alterou =
        false;

    for (
        const user of usuarios
    ) {

        const chatId =
            String(
                user.chatId
            );

        if (
            !chatId ||
            chatId === 'undefined' ||
            chatId === 'null'
        ) {

            continue;

        }

        const registro =
            messages[chatId];

        // ====================================================
        // TENTAR EDITAR A MENSAGEM EXISTENTE
        // ====================================================

        if (
            registro &&
            registro.messageId
        ) {

            const respostaEdicao =
                await telegramRequest(
                    'editMessageText',
                    {

                        chat_id:
                            chatId,

                        message_id:
                            registro.messageId,

                        text:
                            texto,

                        parse_mode:
                            'HTML',

                        disable_web_page_preview:
                            true

                    }
                );

            // ------------------------------------------------
            // EDITOU COM SUCESSO
            // ------------------------------------------------

            if (
                respostaEdicao &&
                respostaEdicao.ok
            ) {

                messages[chatId] = {

                    messageId:
                        registro.messageId,

                    updatedAt:
                        Date.now()

                };

                alterou =
                    true;

                console.log(
                    `[margWorker] Mensagem ${registro.messageId} ` +
                    `atualizada para ${chatId}.`
                );

                continue;

            }

            // ------------------------------------------------
            // TELEGRAM DIZ QUE A MENSAGEM NÃO EXISTE
            //
            // SOMENTE neste caso vamos criar outra.
            // ------------------------------------------------

            if (
                telegramMensagemNaoEncontrada(
                    respostaEdicao
                )
            ) {

                console.log(
                    `[margWorker] Mensagem ${registro.messageId} ` +
                    `não encontrada para ${chatId}. ` +
                    `Será criada uma nova.`
                );

                delete messages[chatId];

                alterou =
                    true;

            }

            // ------------------------------------------------
            // MENSAGEM NÃO MODIFICADA
            //
            // Não é erro que justifique nova mensagem.
            // ------------------------------------------------

            else if (
                telegramMensagemNaoModificada(
                    respostaEdicao
                )
            ) {

                messages[chatId] = {

                    messageId:
                        registro.messageId,

                    updatedAt:
                        Date.now()

                };

                alterou =
                    true;

                console.log(
                    `[margWorker] Mensagem ${registro.messageId} ` +
                    `já possuía o mesmo conteúdo.`
                );

                continue;

            }

            // ------------------------------------------------
            // ERRO TEMPORÁRIO
            //
            // NÃO apagar messageId.
            // NÃO criar mensagem nova.
            // ------------------------------------------------

            else if (
                telegramErroTemporario(
                    respostaEdicao
                )
            ) {

                console.log(
                    `[margWorker] ⚠️ Falha temporária ao editar ` +
                    `mensagem ${registro.messageId} para ${chatId}. ` +
                    `MessageId será preservado.`
                );

                continue;

            }

            // ------------------------------------------------
            // ERRO DESCONHECIDO
            //
            // Por segurança, também NÃO criaremos outra
            // mensagem.
            //
            // Isso evita duplicações causadas por erros que
            // ainda não conhecemos.
            // ------------------------------------------------

            else {

                console.log(
                    `[margWorker] ⚠️ Falha ao editar mensagem ` +
                    `${registro.messageId} para ${chatId}. ` +
                    `MessageId preservado.`
                );

                continue;

            }

        }

        // ====================================================
        // CRIAR NOVA MENSAGEM
        //
        // Só chegamos aqui quando:
        //
        // 1. Não havia messageId salvo; OU
        // 2. Telegram confirmou que a mensagem anterior
        //    realmente não existe.
        // ====================================================

        const novaMensagem =
            await telegramRequest(
                'sendMessage',
                {

                    chat_id:
                        chatId,

                    text:
                        texto,

                    parse_mode:
                        'HTML',

                    disable_web_page_preview:
                        true

                }
            );

        if (
            novaMensagem &&
            novaMensagem.ok &&
            novaMensagem.result &&
            novaMensagem.result.message_id
        ) {

            const novoMessageId =
                novaMensagem.result.message_id;

            messages[chatId] = {

                messageId:
                    novoMessageId,

                updatedAt:
                    Date.now()

            };

            alterou =
                true;

            console.log(
                `[margWorker] Nova mensagem de margem criada ` +
                `para ${chatId}. ID=${novoMessageId}`
            );

        } else {

            console.log(
                `[margWorker] Não foi possível criar nova mensagem ` +
                `para ${chatId}.`
            );

        }

    }

    // ========================================================
    // SALVAR IDS
    // ========================================================

    if (
        alterou
    ) {

        await salvarTelegramMarginMessages(
            messages
        );

    }

    ultimoTextoTelegram =
        texto;

    ultimoEnvioTelegram =
        agora;

}

// ============================================================
// BALANCE FUTURES
// ============================================================

async function getBalance() {

    try {

        const resposta =
            await api.accountFutures(
                Date.now()
            );

        if (
            !resposta
        ) {

            console.log(
                '[margWorker] accountFutures retornou vazio.'
            );

            return null;

        }

        let usdt = null;

        if (
            Array.isArray(
                resposta
            )
        ) {

            usdt =
                resposta.find(
                    item =>
                        item.asset ===
                        'USDT'
                );

        } else if (
            Array.isArray(
                resposta.assets
            )
        ) {

            usdt =
                resposta.assets.find(
                    item =>
                        item.asset ===
                        'USDT'
                );

        }

        if (
            usdt
        ) {

            return {

                asset:
                    'USDT',

                walletBalance:
                    numero(
                        usdt.walletBalance
                    ),

                marginBalance:
                    numero(
                        usdt.marginBalance
                    ),

                availableBalance:
                    numero(
                        usdt.availableBalance
                    ),

                crossWalletBalance:
                    numero(
                        usdt.crossWalletBalance
                    ),

                unrealizedProfit:
                    numero(
                        usdt.unrealizedProfit
                    ),

                maxWithdrawAmount:
                    numero(
                        usdt.maxWithdrawAmount
                    )

            };

        }

        if (
            !Array.isArray(
                resposta
            ) &&
            (
                resposta.totalWalletBalance !==
                undefined ||
                resposta.totalMarginBalance !==
                undefined
            )
        ) {

            return {

                asset:
                    'USDT',

                walletBalance:
                    numero(
                        resposta.totalWalletBalance
                    ),

                marginBalance:
                    numero(
                        resposta.totalMarginBalance
                    ),

                availableBalance:
                    numero(
                        resposta.availableBalance
                    ),

                crossWalletBalance:
                    numero(
                        resposta.totalCrossWalletBalance
                    ),

                unrealizedProfit:
                    numero(
                        resposta.totalUnrealizedProfit
                    ),

                maxWithdrawAmount:
                    numero(
                        resposta.maxWithdrawAmount
                    )

            };

        }

        console.log(
            '[margWorker] USDT não encontrado.'
        );

        return null;

    } catch (error) {

        console.error(
            '[margWorker] Erro getBalance:',
            error.response?.data ||
            error.message
        );

        return null;

    }

}

// ============================================================
// RESET DATA
// ============================================================

function normalizarResetData(
    data
) {

    if (
        !data ||
        typeof data !== 'object' ||
        Array.isArray(data)
    ) {

        return {

            lastResetDay:
                getCurrentDay(),

            resetCount:
                0,

            positiveCount:
                0,

            negativeCount:
                0,

            lastResult:
                null

        };

    }

    return {

        lastResetDay:
            data.lastResetDay ||
            getCurrentDay(),

        resetCount:
            numero(
                data.resetCount
            ),

        positiveCount:
            numero(
                data.positiveCount
            ),

        negativeCount:
            numero(
                data.negativeCount
            ),

        lastResult:
            data.lastResult ||
            null

    };

}

// ============================================================
// CRIAR NOVO SALDO BASE
// ============================================================

function criarNovoOldBalance(
    balance
) {

    const agora =
        Date.now();

    return {

        walletBalance:
            balance.walletBalance,

        marginBalance:
            balance.marginBalance,

        availableBalance:
            balance.availableBalance,

        percent:
            0,

        maxPercent:
            0,

        minPercent:
            0,

        lastUpdate:
            formatTime(
                agora
            ),

        resetAt:
            agora,

        resetAtFormatted:
            formatTime(
                agora
            )

    };

}

// ============================================================
// MONITORAR MARGEM
// ============================================================

async function monitorarMargem() {

    try {

        let balanceHist =
            await carregarCache(
                'BalanceHist'
            );

        if (
            !Array.isArray(
                balanceHist
            )
        ) {

            balanceHist = [];

        }

        // ====================================================
        // SALDO ATUAL
        // ====================================================

        const balance =
            await getBalance();

        if (
            !balance
        ) {

            console.log(
                '[margWorker] Saldo indisponível.'
            );

            return;

        }

        // ====================================================
        // VALIDAR DADOS CRÍTICOS
        // ====================================================

        if (
            !numeroValido(
                balance.walletBalance
            ) ||
            !numeroValido(
                balance.marginBalance
            )
        ) {

            console.log(
                '[margWorker] Saldo inválido. Ciclo ignorado.'
            );

            return;

        }

        // ====================================================
        // OLD BALANCE
        //
        // walletBalance representa o SALDO BASE.
        //
        // Ele NÃO é atualizado a cada ciclo.
        //
        // Só é substituído quando ocorre reset por TP/SL.
        // ====================================================

        let oldBalance =
            await carregarCache(
                'oldBalance'
            );

        if (
            !oldBalance ||
            typeof oldBalance !== 'object' ||
            Array.isArray(oldBalance) ||
            !numeroValido(
                oldBalance.walletBalance
            )
        ) {

            oldBalance =
                criarNovoOldBalance(
                    balance
                );

            await salvarCache(
                oldBalance,
                'oldBalance'
            );

            console.log(
                '[margWorker] Saldo base inicializado: ' +
                `${oldBalance.walletBalance}`
            );

        }

        // ====================================================
        // VARIAÇÕES
        // ====================================================

        const perc =
            percentage(
                oldBalance.walletBalance,
                balance.marginBalance
            );

        const percReal =
            percentage(
                oldBalance.walletBalance,
                balance.walletBalance
            );

        // ====================================================
        // MÁXIMO
        // ====================================================

        if (
            !numeroValido(
                oldBalance.maxPercent
            )
        ) {

            oldBalance.maxPercent =
                perc;

        }

        if (
            perc >
            Number(
                oldBalance.maxPercent
            )
        ) {

            oldBalance.maxPercent =
                perc;

        }

        // ====================================================
        // MÍNIMO
        // ====================================================

        if (
            !numeroValido(
                oldBalance.minPercent
            )
        ) {

            oldBalance.minPercent =
                perc;

        }

        if (
            perc <
            Number(
                oldBalance.minPercent
            )
        ) {

            oldBalance.minPercent =
                perc;

        }

        // ====================================================
        // ATUALIZAR APENAS DADOS DO CICLO
        // ====================================================

        oldBalance.percent =
            perc;

        oldBalance.lastUpdate =
            formatTime(
                Date.now()
            );

        // ====================================================
        // SALVAR BALANCE ATUAL
        // ====================================================

        await salvarCache(
            balance,
            'Balance'
        );

        // ====================================================
        // SALVAR OLD BALANCE
        // ====================================================

        await salvarCache(
            oldBalance,
            'oldBalance'
        );

        // ====================================================
        // HISTÓRICO
        // ====================================================

        balanceHist.push({

            timestamp:
                Date.now(),

            date:
                formatTime(
                    Date.now()
                ),

            baseBalance:
                oldBalance.walletBalance,

            walletBalance:
                balance.walletBalance,

            marginBalance:
                balance.marginBalance,

            availableBalance:
                balance.availableBalance,

            variation:
                perc,

            variationReal:
                percReal

        });

        if (
            balanceHist.length >
            5000
        ) {

            balanceHist =
                balanceHist.slice(
                    -5000
                );

        }

        await salvarCache(
            balanceHist,
            'BalanceHist'
        );

        // ====================================================
        // RESET COUNT
        // ====================================================

        let resetData =
            normalizarResetData(
                await carregarCache(
                    'ResetCount'
                )
            );

        const currentDay =
            getCurrentDay();

        if (
            resetData.lastResetDay !==
            currentDay
        ) {

            resetData = {

                lastResetDay:
                    currentDay,

                resetCount:
                    0,

                positiveCount:
                    0,

                negativeCount:
                    0,

                lastResult:
                    resetData.lastResult ||
                    null

            };

            await salvarCache(
                resetData,
                'ResetCount'
            );

        }

        // ====================================================
        // DADOS TELEGRAM
        // ====================================================

        const telegramData = {

            baseBalance:
                arredondar(
                    oldBalance.walletBalance,
                    2
                ),

            walletBalance:
                arredondar(
                    balance.walletBalance,
                    2
                ),

            marginBalance:
                arredondar(
                    balance.marginBalance,
                    2
                ),

            availableBalance:
                arredondar(
                    balance.availableBalance,
                    2
                ),

            variation:
                arredondar(
                    perc,
                    2
                ),

            variationReal:
                arredondar(
                    percReal,
                    2
                ),

            maxPercent:
                arredondar(
                    oldBalance.maxPercent,
                    2
                ),

            minPercent:
                arredondar(
                    oldBalance.minPercent,
                    2
                ),

            resetCount:
                Number(
                    resetData.resetCount
                ),

            positiveCount:
                Number(
                    resetData.positiveCount
                ),

            negativeCount:
                Number(
                    resetData.negativeCount
                ),

            lastResult:
                resetData.lastResult,

            updatedAt:
                Date.now(),

            updatedAtFormatted:
                formatTime(
                    Date.now()
                )

        };

        // ====================================================
        // TELEGRAM
        // ====================================================

        await atualizarMensagemMargemTelegram(
            telegramData
        );

        // ====================================================
        // PROCESSO PAI
        // ====================================================

        enviarPai({

            type:
                'MARGIN_STATUS',

            data:
                telegramData

        });

        // ====================================================
        // LOG
        // ====================================================

        console.log(
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
        );

        console.log(
            `[margWorker] 🎯 Saldo base: ` +
            `${oldBalance.walletBalance}`
        );

        console.log(
            `[margWorker] 💰 Margem: ` +
            `${balance.marginBalance}`
        );

        console.log(
            `[margWorker] 💵 Carteira: ` +
            `${balance.walletBalance}`
        );

        console.log(
            `[margWorker] 💳 Disponível: ` +
            `${balance.availableBalance}`
        );

        console.log(
            `[margWorker] 📊 Variação: ` +
            `${perc.toFixed(2)}%`
        );

        console.log(
            `[margWorker] 📈 Variação real: ` +
            `${percReal.toFixed(2)}%`
        );

        console.log(
            `[margWorker] 🔼 Máximo: ` +
            `${Number(oldBalance.maxPercent).toFixed(2)}%`
        );

        console.log(
            `[margWorker] 🔽 Mínimo: ` +
            `${Number(oldBalance.minPercent).toFixed(2)}%`
        );

        console.log(
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
        );

        // ====================================================
        // LIMITES
        // ====================================================

        const SLDIA =
            Number(
                process.env.SLDIA ||
                -100
            );

        const TPDIA =
            Number(
                process.env.TPDIA ||
                100
            );

        const atingiuLimite =
            perc <= SLDIA ||
            perc >= TPDIA ||
            perc >= 90;

        if (
            !atingiuLimite
        ) {

            return;

        }

        // ====================================================
        // REGISTRAR RESET
        // ====================================================

        resetData.resetCount++;

        let resultado =
            'neutro';

        if (
            perc > 0
        ) {

            resetData.positiveCount++;

            resultado =
                'positivo';

        } else if (
            perc < 0
        ) {

            resetData.negativeCount++;

            resultado =
                'negativo';

        }

        resetData.lastResult =
            resultado;

        resetData.lastResetDay =
            currentDay;

        await salvarCache(
            resetData,
            'ResetCount'
        );

        // ====================================================
        // RESET HISTORY
        // ====================================================

        let resetHist =
            await carregarCache(
                'ResetHist'
            );

        if (
            !Array.isArray(
                resetHist
            )
        ) {

            resetHist = [];

        }

        resetHist.push({

            date:
                formatTime(
                    Date.now()
                ),

            initialMargin:
                oldBalance.walletBalance,

            finalMargin:
                balance.marginBalance,

            percentChange:
                perc,

            result:
                resultado,

            dailyCounters: {

                resetCount:
                    resetData.resetCount,

                positiveCount:
                    resetData.positiveCount,

                negativeCount:
                    resetData.negativeCount

            }

        });

        if (
            resetHist.length >
            1000
        ) {

            resetHist =
                resetHist.slice(
                    -1000
                );

        }

        await salvarCache(
            resetHist,
            'ResetHist'
        );

        // ====================================================
        // TP >= 90%
        // ====================================================

        if (
            perc >= 90
        ) {

            console.log(
                '[margWorker] 🔥 Margem >= 90%.'
            );

            oldBalance =
                criarNovoOldBalance(
                    balance
                );

            await salvarCache(
                oldBalance,
                'oldBalance'
            );

            console.log(
                `[margWorker] 🎯 Novo saldo base: ` +
                `${oldBalance.walletBalance}`
            );

            return;

        }

        // ====================================================
        // TAKE PROFIT
        // ====================================================

        if (
            perc >= TPDIA &&
            perc < 90
        ) {

            console.log(
                `[margWorker] 🟢 Take Profit: ` +
                `${perc.toFixed(2)}%`
            );

            try {

                await activatePause(
                    30
                );

            } catch (error) {

                console.error(
                    '[margWorker] Erro activatePause:',
                    error.message
                );

            }

            oldBalance =
                criarNovoOldBalance(
                    balance
                );

            await salvarCache(
                oldBalance,
                'oldBalance'
            );

            console.log(
                `[margWorker] 🎯 Novo saldo base após TP: ` +
                `${oldBalance.walletBalance}`
            );

            return;

        }

        // ====================================================
        // STOP LOSS
        // ====================================================

        if (
            perc <= SLDIA &&
            perc >= -90
        ) {

            console.log(
                `[margWorker] 🔴 Stop Loss: ` +
                `${perc.toFixed(2)}%`
            );

            try {

                await activatePause(
                    30
                );

            } catch (error) {

                console.error(
                    '[margWorker] Erro activatePause:',
                    error.message
                );

            }

            oldBalance =
                criarNovoOldBalance(
                    balance
                );

            await salvarCache(
                oldBalance,
                'oldBalance'
            );

            console.log(
                `[margWorker] 🎯 Novo saldo base após SL: ` +
                `${oldBalance.walletBalance}`
            );

            return;

        }

    } catch (error) {

        console.error(
            '[margWorker] Erro monitorarMargem:',
            error.stack ||
            error.message
        );

    }

}

// ============================================================
// SINCRONIZAR HORÁRIO
// ============================================================

async function sincronizarHorario() {

    try {

        const response =
            await axios.get(
                `${BASE_URL}/api/v3/time`,
                {
                    timeout:
                        GLOBAL_AXIOS_TIMEOUT
                }
            );

        if (
            response.data &&
            response.data.serverTime
        ) {

            offset =
                response.data.serverTime -
                Date.now();

            console.log(
                `[margWorker] ⏱ Offset Binance: ${offset}ms`
            );

        }

    } catch (error) {

        console.error(
            '[margWorker] Erro horário Binance:',
            error.message
        );

    }

}

// ============================================================
// START WORKER
// ============================================================

async function startWorker() {

    if (
        workerRunning
    ) {

        console.log(
            '[margWorker] Ciclo anterior ainda executando.'
        );

        return;

    }

    workerRunning =
        true;

    try {

        await sincronizarHorario();

        await monitorarMargem();

    } catch (error) {

        console.error(
            '[margWorker] Erro startWorker:',
            error.stack ||
            error.message
        );

    } finally {

        workerRunning =
            false;

    }

}

// ============================================================
// INICIALIZAÇÃO
// ============================================================

console.log(
    '[margWorker] 🚀 MargWorker iniciado.'
);

enviarPai(
    '✅ MargWorker iniciado.'
);

// ============================================================
// PRIMEIRO CICLO
// ============================================================

startWorker();

// ============================================================
// LOOP
// ============================================================

setInterval(
    () => {

        startWorker();

    },
    MONITOR_INTERVAL
);