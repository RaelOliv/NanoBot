const fs = require("fs");
const path = require("path");
const axios = require("axios");
const crypto = require("crypto");

require("dotenv").config();

// =====================================================
// CONFIGURAÇÕES
// =====================================================

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

const TELEGRAM_API =
    `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;

const BINANCE_API =
    process.env.BINANCE_FUTURES_URL ||
    "https://fapi.binance.com";

const CACHE_DIR =
    path.resolve(__dirname, "cache");

const CACHE_PATH =
    path.resolve(CACHE_DIR, "cachepos.json");

const USERS_PATH =
    path.resolve(CACHE_DIR, "users.json");

const MESSAGES_PATH =
    path.resolve(
        CACHE_DIR,
        "telegramMessages.json"
    );


// =====================================================
// CONFIGURAÇÃO DO LOOP
// =====================================================

// Intervalo de leitura do cache.
const CHECK_INTERVAL_MS = 3000;

// Debounce para confirmar fechamento.
const CLOSE_DEBOUNCE_MS = 5000;

// Margem utilizada na consulta dos trades.
const TRADE_BUFFER_MS = 10000;


// =====================================================
// ESTADO
// =====================================================

let ultimoCache = {};

let verificando = false;

const fechamentosPendentes = new Map();

let mensagens = {};


// =====================================================
// PREPARAR DIRETÓRIOS
// =====================================================

if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(
        CACHE_DIR,
        {
            recursive: true
        }
    );
}


// =====================================================
// VALIDAR TELEGRAM
// =====================================================

if (!TELEGRAM_TOKEN) {

    console.error(
        "❌ TELEGRAM_TOKEN não definido no .env"
    );

    process.exit(1);
}


// =====================================================
// FUNÇÕES BÁSICAS
// =====================================================

function numero(valor, padrao = 0) {

    const n = Number(valor);

    return Number.isFinite(n)
        ? n
        : padrao;
}


function sleep(ms) {

    return new Promise(
        resolve => setTimeout(resolve, ms)
    );
}


function carregarJSON(
    arquivo,
    padrao
) {

    try {

        if (!fs.existsSync(arquivo)) {
            return padrao;
        }

        const conteudo =
            fs.readFileSync(
                arquivo,
                "utf8"
            );

        if (!conteudo.trim()) {
            return padrao;
        }

        return JSON.parse(conteudo);

    } catch (erro) {

        console.error(
            `❌ Erro lendo ${arquivo}:`,
            erro.message
        );

        return padrao;
    }
}


function salvarJSON(
    arquivo,
    dados
) {

    try {

        fs.writeFileSync(
            arquivo,
            JSON.stringify(
                dados,
                null,
                2
            )
        );

    } catch (erro) {

        console.error(
            `❌ Erro salvando ${arquivo}:`,
            erro.message
        );
    }
}


// =====================================================
// CACHE DE POSIÇÕES
// =====================================================

function carregarCache() {

    const cache =
        carregarJSON(
            CACHE_PATH,
            {}
        );

    return normalizarCache(cache);
}


// =====================================================
// NORMALIZAR CACHE
// =====================================================
//
// Aceita tanto:
//
// {
//   BTCUSDT: {...},
//   ETHUSDT: {...}
// }
//
// quanto:
//
// [
//   {...},
//   {...}
// ]
//
// Isso deixa o Telegram Worker mais resistente a
// pequenas diferenças no formato do cache.
// =====================================================

function normalizarCache(cache) {

    const resultado = {};

    if (Array.isArray(cache)) {

        for (const pos of cache) {

            if (!pos) {
                continue;
            }

            const symbol =
                pos.symbol ||
                pos.symbolName;

            if (!symbol) {
                continue;
            }

            resultado[symbol] =
                pos;
        }

        return resultado;
    }


    if (
        cache &&
        typeof cache === "object"
    ) {

        for (
            const [symbol, pos]
            of Object.entries(cache)
        ) {

            if (!pos) {
                continue;
            }

            // Caso o próprio objeto tenha symbol.
            if (
                typeof pos === "object"
            ) {

                resultado[symbol] = {

                    ...pos,

                    symbol:
                        pos.symbol ||
                        symbol
                };
            }
        }
    }

    return resultado;
}


// =====================================================
// USUÁRIOS
// =====================================================

function carregarUsuarios() {

    const dados =
        carregarJSON(
            USERS_PATH,
            {}
        );

    const usuarios = {};

    // -----------------------------------------------
    // users.json como array
    // -----------------------------------------------

    if (Array.isArray(dados)) {

        for (const usuario of dados) {

            if (!usuario) {
                continue;
            }

            const id =
                usuario.chat_id ||
                usuario.chatId ||
                usuario.id;

            if (!id) {
                continue;
            }

            usuarios[String(id)] =
                usuario;
        }

        return usuarios;
    }


    // -----------------------------------------------
    // users.json como objeto
    // -----------------------------------------------

    if (
        dados &&
        typeof dados === "object"
    ) {

        for (
            const [chave, usuario]
            of Object.entries(dados)
        ) {

            if (
                usuario &&
                typeof usuario === "object"
            ) {

                const id =
                    usuario.chat_id ||
                    usuario.chatId ||
                    usuario.id ||
                    chave;

                usuarios[String(id)] =
                    usuario;

            } else {

                usuarios[String(chave)] = {
                    chat_id: chave,
                    active: true
                };
            }
        }
    }

    return usuarios;
}


// =====================================================
// ATUALIZAR USUÁRIOS PELO TELEGRAM
// =====================================================

async function atualizarUsuarios() {

    const usuarios =
        carregarUsuarios();

    try {

        const resposta =
            await axios.get(
                `${TELEGRAM_API}/getUpdates`,
                {
                    timeout: 15000
                }
            );

        const updates =
            resposta.data?.result || [];


        for (const update of updates) {

            const mensagem =
                update.message ||
                update.edited_message;

            if (!mensagem) {
                continue;
            }

            const chat =
                mensagem.chat;

            if (
                !chat ||
                !chat.id
            ) {
                continue;
            }

            const id =
                String(chat.id);


            if (!usuarios[id]) {

                usuarios[id] = {

                    chat_id:
                        chat.id,

                    first_name:
                        chat.first_name ||
                        "",

                    username:
                        chat.username ||
                        "",

                    active: true
                };

                console.log(
                    `👤 Novo usuário Telegram: ${id}`
                );
            }
        }


        salvarJSON(
            USERS_PATH,
            usuarios
        );

    } catch (erro) {

        console.error(
            "⚠️ Erro obtendo usuários Telegram:",
            erro.response?.data ||
            erro.message
        );
    }

    return usuarios;
}


// =====================================================
// MENSAGENS
// =====================================================

function carregarMensagens() {

    return carregarJSON(
        MESSAGES_PATH,
        {}
    );
}


function salvarMensagens() {

    salvarJSON(
        MESSAGES_PATH,
        mensagens
    );
}


mensagens =
    carregarMensagens();


// =====================================================
// CHAVE DA MENSAGEM
// =====================================================

function chaveMensagem(
    chatId,
    symbol
) {

    return `${chatId}:${symbol}`;
}


// =====================================================
// TELEGRAM - ENVIAR
// =====================================================

async function enviarTelegram(
    chatId,
    texto
) {

    try {

        const resposta =
            await axios.post(
                `${TELEGRAM_API}/sendMessage`,
                {
                    chat_id: chatId,
                    text: texto,
                    parse_mode: "HTML"
                },
                {
                    timeout: 15000
                }
            );

        return resposta.data?.result;

    } catch (erro) {

        const dados =
            erro.response?.data;

        console.error(
            `❌ Erro enviando Telegram ` +
            `para ${chatId}:`,
            dados ||
            erro.message
        );

        return null;
    }
}


// =====================================================
// TELEGRAM - EDITAR
// =====================================================

async function editarTelegram(
    chatId,
    messageId,
    texto
) {

    try {

        const resposta =
            await axios.post(
                `${TELEGRAM_API}/editMessageText`,
                {
                    chat_id: chatId,
                    message_id: messageId,
                    text: texto,
                    parse_mode: "HTML"
                },
                {
                    timeout: 15000
                }
            );

        return resposta.data?.result;

    } catch (erro) {

        const descricao =
            erro.response?.data?.description ||
            "";

        // Telegram retorna isso quando o conteúdo
        // não mudou. Não é erro para nosso worker.
        if (
            descricao
                .toLowerCase()
                .includes(
                    "message is not modified"
                )
        ) {

            return null;
        }

        console.error(
            `❌ Erro editando mensagem ` +
            `${messageId} para ${chatId}:`,
            erro.response?.data ||
            erro.message
        );

        return null;
    }
}


// =====================================================
// SALVAR REFERÊNCIA DA MENSAGEM
// =====================================================

function registrarMensagem(
    chatId,
    symbol,
    messageId,
    estado
) {

    const chave =
        chaveMensagem(
            chatId,
            symbol
        );

    mensagens[chave] = {

        chat_id:
            chatId,

        message_id:
            messageId,

        symbol,

        estado,

        updatedAt:
            Date.now()
    };

    salvarMensagens();
}


// =====================================================
// OBTER REFERÊNCIA
// =====================================================

function obterMensagem(
    chatId,
    symbol
) {

    return mensagens[
        chaveMensagem(
            chatId,
            symbol
        )
    ];
}


// =====================================================
// BINANCE - ASSINATURA
// =====================================================

function assinaturaBinance(
    parametros
) {

    const query =
        new URLSearchParams(
            parametros
        ).toString();

    const signature =
        crypto
            .createHmac(
                "sha256",
                SECRET_KEY
            )
            .update(query)
            .digest("hex");

    return `${query}&signature=${signature}`;
}


// =====================================================
// BINANCE - USER TRADES
// =====================================================

async function buscarUserTrades(
    symbol,
    inicio,
    fim
) {

    if (
        !API_KEY ||
        !SECRET_KEY
    ) {

        console.error(
            "❌ API_KEY ou SECRET_KEY ausente."
        );

        return [];
    }


    try {

        const startTime =
            Math.max(
                0,
                new Date(inicio).getTime() -
                TRADE_BUFFER_MS
            );

        const endTime =
            new Date(fim).getTime() +
            TRADE_BUFFER_MS;


        const parametros = {

            symbol,

            startTime:
                Math.floor(
                    startTime
                ),

            endTime:
                Math.floor(
                    endTime
                ),

            limit: 1000,

            recvWindow: 10000,

            timestamp:
                Date.now()
        };


        const query =
            assinaturaBinance(
                parametros
            );


        const resposta =
            await axios.get(
                `${BINANCE_API}/fapi/v1/userTrades?${query}`,
                {
                    headers: {
                        "X-MBX-APIKEY":
                            API_KEY
                    },

                    timeout: 15000
                }
            );


        return Array.isArray(
            resposta.data
        )
            ? resposta.data
            : [];

    } catch (erro) {

        console.error(
            `❌ Erro Binance userTrades ` +
            `${symbol}:`,
            erro.response?.data ||
            erro.message
        );

        return [];
    }
}


// =====================================================
// CALCULAR RESULTADO REAL
// =====================================================

async function calcularResultado(
    symbol,
    posicao
) {

    const inicio =
        posicao.openedAt ||
        posicao.openTime ||
        new Date(
            Date.now() -
            24 * 60 * 60 * 1000
        );

    const fim =
        posicao.closedAt ||
        posicao.closeTime ||
        new Date();


    const trades =
        await buscarUserTrades(
            symbol,
            inicio,
            fim
        );


    let realizedPnl = 0;

    let commissionUSDT = 0;

    let quantidadeSaida = 0;

    let valorSaida = 0;

    let ultimoTradeTime = 0;


    for (const trade of trades) {

        const pnl =
            numero(
                trade.realizedPnl
            );

        realizedPnl += pnl;


        const commission =
            numero(
                trade.commission
            );

        const asset =
            trade.commissionAsset;


        if (
            asset === "USDT"
        ) {

            commissionUSDT +=
                commission;
        }


        const tradeTime =
            numero(
                trade.time
            );


        if (
            tradeTime >
            ultimoTradeTime
        ) {

            ultimoTradeTime =
                tradeTime;
        }


        // Fills que efetivamente realizaram PNL.
        if (
            Math.abs(pnl) >
            0.00000001
        ) {

            const qty =
                Math.abs(
                    numero(
                        trade.qty
                    )
                );

            const price =
                numero(
                    trade.price
                );


            if (
                qty > 0 &&
                price > 0
            ) {

                quantidadeSaida +=
                    qty;

                valorSaida +=
                    qty * price;
            }
        }
    }


    // -----------------------------------------------
    // Preço de saída
    // -----------------------------------------------

    let exitPrice =
        numero(
            posicao.exitPrice ||
            posicao.markPrice ||
            posicao.entryPrice
        );


    if (
        quantidadeSaida > 0 &&
        valorSaida > 0
    ) {

        exitPrice =
            valorSaida /
            quantidadeSaida;
    }


    // -----------------------------------------------
    // Se a Binance não retornou trades,
    // mantemos o PNL existente no cache.
    // -----------------------------------------------

    if (!trades.length) {

        realizedPnl =
            numero(
                posicao.realizedPnl ||
                posicao.pnl ||
                posicao.profit ||
                0
            );

        commissionUSDT =
            numero(
                posicao.commission ||
                posicao.fee ||
                0
            );
    }


    const resultadoLiquido =
        realizedPnl -
        commissionUSDT;


    const closedAt =
        ultimoTradeTime > 0
            ? new Date(
                ultimoTradeTime
            )
            : new Date();


    return {

        realizedPnl,

        commission:
            commissionUSDT,

        netPnl:
            resultadoLiquido,

        exitPrice,

        closedAt,

        trades
    };
}


// =====================================================
// FORMATAÇÃO
// =====================================================

function formatarData(data) {

    if (!data) {
        return "-";
    }

    const d =
        new Date(data);

    if (
        Number.isNaN(
            d.getTime()
        )
    ) {

        return "-";
    }

    return d.toLocaleString(
        "pt-BR"
    );
}


function formatarDuracao(
    inicio,
    fim
) {

    const a =
        new Date(inicio).getTime();

    const b =
        new Date(fim).getTime();


    if (
        !Number.isFinite(a) ||
        !Number.isFinite(b)
    ) {

        return "-";
    }


    const minutos =
        Math.max(
            0,
            Math.floor(
                (b - a) /
                60000
            )
        );


    const horas =
        Math.floor(
            minutos / 60
        );


    const mins =
        minutos % 60;


    if (horas > 0) {

        return `${horas}h ${mins}min`;
    }

    return `${mins}min`;
}


function sinal(valor) {

    return valor >= 0
        ? `+${valor.toFixed(4)}`
        : valor.toFixed(4);
}


// =====================================================
// MENSAGEM DE POSIÇÃO ABERTA
// =====================================================

function mensagemAberta(
    posicao
) {

    const symbol =
        posicao.symbol;

    const entry =
        numero(
            posicao.entryPrice
        );

    const quantidade =
        numero(
            posicao.positionAmt ||
            posicao.qty
        );

    const leverage =
        numero(
            posicao.leverage,
            1
        );


    return (

        `━━━━━━━━━━━━━━━\n` +

        `📊 <b>${symbol}</b>\n` +

        `━━━━━━━━━━━━━━━\n` +

        `🟢 <b>Posição Aberta</b>\n` +

        `💵 Entrada: ${entry}\n` +

        `📦 Quantidade: ${quantidade}\n` +

        `⚙️ Alavancagem: ${leverage}x\n` +

        `🕒 Abertura: ` +

        `${formatarData(
            posicao.openedAt ||
            posicao.openTime ||
            Date.now()
        )}\n` +

        `━━━━━━━━━━━━━━━`
    );
}


// =====================================================
// MENSAGEM DE POSIÇÃO ATIVA
// =====================================================

function mensagemAtiva(
    posicao
) {

    const symbol =
        posicao.symbol;

    const entry =
        numero(
            posicao.entryPrice
        );

    const mark =
        numero(
            posicao.markPrice ||
            posicao.currentPrice ||
            posicao.price ||
            entry
        );

    const quantidade =
        numero(
            posicao.positionAmt ||
            posicao.qty
        );

    const leverage =
        numero(
            posicao.leverage,
            1
        );


    let pnl = 0;

    if (
        entry > 0 &&
        mark > 0
    ) {

        pnl =
            (
                mark -
                entry
            ) *
            Math.abs(
                quantidade
            ) *
            leverage;

        if (
            quantidade < 0
        ) {

            pnl *= -1;
        }
    }


    let variacao = 0;

    if (entry > 0) {

        variacao =
            (
                (
                    mark -
                    entry
                ) /
                entry
            ) *
            100;

        if (
            quantidade < 0
        ) {

            variacao *= -1;
        }
    }


    const pnlTexto =
        pnl >= 0
            ? `🟢 +${pnl.toFixed(4)} USDT`
            : `🔴 ${pnl.toFixed(4)} USDT`;


    const variacaoTexto =
        variacao >= 0
            ? `📈 +${variacao.toFixed(2)}%`
            : `📉 ${variacao.toFixed(2)}%`;


    return (

        `━━━━━━━━━━━━━━━\n` +

        `📊 <b>${symbol}</b>\n` +

        `━━━━━━━━━━━━━━━\n` +

        `🟢 <b>Posição Aberta</b>\n` +

        `💵 Entrada: ${entry}\n` +

        `💰 Atual: ${mark}\n` +

        `📊 Resultado atual: ${pnlTexto}\n` +

        `📈 Variação: ${variacaoTexto}\n` +

        `⚙️ Alavancagem: ${leverage}x\n` +

        `🕒 Abertura: ` +

        `${formatarData(
            posicao.openedAt ||
            posicao.openTime
        )}\n` +

        `━━━━━━━━━━━━━━━`
    );
}


// =====================================================
// MENSAGEM DE POSIÇÃO ENCERRADA
// =====================================================

function mensagemEncerrada(
    posicao,
    resultado
) {

    const symbol =
        posicao.symbol;

    const entry =
        numero(
            posicao.entryPrice
        );

    const exit =
        numero(
            resultado.exitPrice
        );


    const gross =
        numero(
            resultado.realizedPnl
        );

    const commission =
        numero(
            resultado.commission
        );

    const net =
        numero(
            resultado.netPnl
        );


    // -----------------------------------------------
    // Percentual
    // -----------------------------------------------

    let variacao = 0;

    if (entry > 0) {

        variacao =
            (
                (
                    exit -
                    entry
                ) /
                entry
            ) *
            100;


        const quantidade =
            numero(
                posicao.positionAmt ||
                posicao.qty
            );


        if (
            quantidade < 0
        ) {

            variacao *= -1;
        }
    }


    const abertura =
        posicao.openedAt ||
        posicao.openTime;


    const fechamento =
        resultado.closedAt ||
        posicao.closedAt ||
        Date.now();


    const duracao =
        formatarDuracao(
            abertura,
            fechamento
        );


    const grossTexto =
        gross >= 0
            ? `🟢 +${gross.toFixed(4)} USDT`
            : `🔴 ${gross.toFixed(4)} USDT`;


    const taxaTexto =
        commission > 0
            ? `🔴 -${commission.toFixed(4)} USDT`
            : `⚪ 0.0000 USDT`;


    const netTexto =
        net >= 0
            ? `🟢 +${net.toFixed(4)} USDT`
            : `🔴 ${net.toFixed(4)} USDT`;


    const variacaoTexto =
        variacao >= 0
            ? `📈 +${variacao.toFixed(2)}%`
            : `📉 ${variacao.toFixed(2)}%`;


    return (

        `━━━━━━━━━━━━━━━\n` +

        `📊 <b>${symbol}</b>\n` +

        `━━━━━━━━━━━━━━━\n` +

        `⚫ <b>Posição Encerrada</b>\n` +

        `💵 Entrada: ${entry}\n` +

        `💸 Saída: ${exit}\n` +

        `📊 P&L Bruto: ${grossTexto}\n` +

        `💳 Taxa Trading: ${taxaTexto}\n` +

        `💰 <b>Resultado Líquido: ${netTexto}</b>\n` +

        `📈 Variação: ${variacaoTexto}\n` +

        `⏱️ Duração: ${duracao}\n` +

        `🕒 Abertura: ${formatarData(abertura)}\n` +

        `🕒 Fechamento: ${formatarData(fechamento)}\n` +

        `━━━━━━━━━━━━━━━`
    );
}


// =====================================================
// ENVIAR / ATUALIZAR POSIÇÃO ABERTA
// =====================================================

async function processarAberta(
    symbol,
    posicao,
    usuarios
) {

    const texto =
        mensagemAtiva(
            posicao
        );


    for (
        const [chatId, usuario]
        of Object.entries(usuarios)
    ) {

        if (
            usuario &&
            usuario.active === false
        ) {
            continue;
        }


        const existente =
            obterMensagem(
                chatId,
                symbol
            );


        // -------------------------------------------
        // Não existe mensagem:
        // ENVIAR
        // -------------------------------------------

        if (
            !existente ||
            !existente.message_id
        ) {

            console.log(
                `📤 Telegram: enviando ` +
                `${symbol} para ${chatId}`
            );


            const enviada =
                await enviarTelegram(
                    chatId,
                    texto
                );


            if (
                enviada &&
                enviada.message_id
            ) {

                registrarMensagem(
                    chatId,
                    symbol,
                    enviada.message_id,
                    "active"
                );
            }


            continue;
        }


        // -------------------------------------------
        // Já existe:
        // EDITAR
        // -------------------------------------------

        if (
            existente.estado === "active"
        ) {

            await editarTelegram(
                chatId,
                existente.message_id,
                texto
            );

            existente.updatedAt =
                Date.now();

            mensagens[
                chaveMensagem(
                    chatId,
                    symbol
                )
            ] =
                existente;

            salvarMensagens();
        }
    }
}


// =====================================================
// PROCESSAR FECHAMENTO
// =====================================================

async function processarFechamento(
    symbol,
    posicao,
    usuarios
) {

    console.log(
        `🔎 Telegram: confirmando fechamento ` +
        `${symbol}...`
    );


    // -----------------------------------------------
    // Lê novamente o cache ANTES de confirmar.
    // -----------------------------------------------

    const cacheAtual =
        carregarCache();


    const posAtual =
        cacheAtual[symbol];


    if (
        posAtual &&
        posAtual.active
    ) {

        console.log(
            `↩️ ${symbol}: posição voltou ` +
            `a ficar ativa. Cancelando fechamento.`
        );

        return;
    }


    // -----------------------------------------------
    // Consulta Binance
    // -----------------------------------------------

    const resultado =
        await calcularResultado(
            symbol,
            posicao
        );


    const texto =
        mensagemEncerrada(
            posicao,
            resultado
        );


    // -----------------------------------------------
    // Atualiza a mensagem existente.
    // -----------------------------------------------

    for (
        const [chatId, usuario]
        of Object.entries(usuarios)
    ) {

        if (
            usuario &&
            usuario.active === false
        ) {
            continue;
        }


        const existente =
            obterMensagem(
                chatId,
                symbol
            );


        if (
            existente &&
            existente.message_id
        ) {

            console.log(
                `✏️ Telegram: encerrando ` +
                `${symbol} na mensagem ` +
                `${existente.message_id}`
            );


            await editarTelegram(
                chatId,
                existente.message_id,
                texto
            );


            existente.estado =
                "closed";

            existente.updatedAt =
                Date.now();


            mensagens[
                chaveMensagem(
                    chatId,
                    symbol
                )
            ] =
                existente;


            salvarMensagens();

        } else {

            // -----------------------------------------
            // Se não existe mensagem, envia.
            // Isso cobre reinício do bot e perda do
            // arquivo de controle.
            // -----------------------------------------

            console.log(
                `📤 Telegram: enviando fechamento ` +
                `${symbol} para ${chatId}`
            );


            const enviada =
                await enviarTelegram(
                    chatId,
                    texto
                );


            if (
                enviada &&
                enviada.message_id
            ) {

                registrarMensagem(
                    chatId,
                    symbol,
                    enviada.message_id,
                    "closed"
                );
            }
        }
    }


    console.log(
        `✅ ${symbol} encerrada | ` +
        `Bruto: ${resultado.realizedPnl.toFixed(4)} | ` +
        `Taxa: ${resultado.commission.toFixed(4)} | ` +
        `Líquido: ${resultado.netPnl.toFixed(4)}`
    );
}


// =====================================================
// AGENDAR FECHAMENTO
// =====================================================

function agendarFechamento(
    symbol,
    posicao,
    usuarios
) {

    if (
        fechamentosPendentes.has(
            symbol
        )
    ) {
        return;
    }


    console.log(
        `⏳ ${symbol}: possível fechamento. ` +
        `Aguardando confirmação...`
    );


    const timer =
        setTimeout(
            async () => {

                fechamentosPendentes.delete(
                    symbol
                );


                try {

                    await processarFechamento(
                        symbol,
                        posicao,
                        usuarios
                    );

                } catch (erro) {

                    console.error(
                        `❌ Erro fechando ${symbol}:`,
                        erro.message
                    );
                }

            },
            CLOSE_DEBOUNCE_MS
        );


    fechamentosPendentes.set(
        symbol,
        timer
    );
}


// =====================================================
// CANCELAR FECHAMENTO
// =====================================================

function cancelarFechamento(
    symbol
) {

    const timer =
        fechamentosPendentes.get(
            symbol
        );


    if (!timer) {
        return;
    }


    clearTimeout(timer);

    fechamentosPendentes.delete(
        symbol
    );


    console.log(
        `↩️ ${symbol}: fechamento cancelado. ` +
        `Posição continua ativa.`
    );
}


// =====================================================
// VERIFICAR POSIÇÕES
// =====================================================

async function verificarPosicoes() {

    if (verificando) {
        return;
    }


    verificando = true;


    try {

        const novoCache =
            carregarCache();


        const usuarios =
            carregarUsuarios();


        // =================================================
        // POSIÇÕES ATUAIS
        // =================================================

        for (
            const [
                symbol,
                novaPosicao
            ]
            of Object.entries(novoCache)
        ) {

            if (!novaPosicao) {
                continue;
            }


            const ativa =
                novaPosicao.active === true ||
                novaPosicao.active === 1 ||
                novaPosicao.active === "true";


            const antigaPosicao =
                ultimoCache[symbol];


            const antigaAtiva =
                antigaPosicao &&
                (
                    antigaPosicao.active === true ||
                    antigaPosicao.active === 1 ||
                    antigaPosicao.active === "true"
                );


            // -------------------------------------------
            // POSIÇÃO ATIVA
            // -------------------------------------------

            if (ativa) {

                cancelarFechamento(
                    symbol
                );


                // Nova posição
                if (!antigaAtiva) {

                    console.log(
                        `🟢 Nova posição detectada: ${symbol}`
                    );

                    await processarAberta(
                        symbol,
                        novaPosicao,
                        usuarios
                    );

                } else {

                    // Posição continua ativa.
                    // Atualiza a mesma mensagem.
                    await processarAberta(
                        symbol,
                        novaPosicao,
                        usuarios
                    );
                }


                continue;
            }


            // -------------------------------------------
            // Existe no cache, mas ficou inactive
            // -------------------------------------------

            if (antigaAtiva) {

                agendarFechamento(
                    symbol,
                    antigaPosicao,
                    usuarios
                );
            }
        }


        // =================================================
        // POSIÇÕES QUE SUMIRAM DO CACHE
        // =================================================

        for (
            const [
                symbol,
                antigaPosicao
            ]
            of Object.entries(ultimoCache)
        ) {

            const antigaAtiva =
                antigaPosicao &&
                (
                    antigaPosicao.active === true ||
                    antigaPosicao.active === 1 ||
                    antigaPosicao.active === "true"
                );


            if (!antigaAtiva) {
                continue;
            }


            if (
                !Object.prototype.hasOwnProperty.call(
                    novoCache,
                    symbol
                )
            ) {

                console.log(
                    `⚠️ ${symbol}: posição ` +
                    `desapareceu do cache.`
                );


                agendarFechamento(
                    symbol,
                    antigaPosicao,
                    usuarios
                );
            }
        }


        // -----------------------------------------------
        // Atualiza snapshot
        // -----------------------------------------------

        ultimoCache =
            novoCache;

    } catch (erro) {

        console.error(
            "❌ Erro verificando posições:",
            erro.message
        );

    } finally {

        verificando = false;
    }
}


// =====================================================
// LOOP PRINCIPAL
// =====================================================

async function iniciar() {

    console.log(
        "🤖 Telegram Worker iniciado."
    );


    console.log(
        `📁 Cache: ${CACHE_PATH}`
    );

    console.log(
        `👥 Usuários: ${USERS_PATH}`
    );

    console.log(
        `💬 Mensagens: ${MESSAGES_PATH}`
    );


    if (!API_KEY) {

        console.warn(
            "⚠️ API_KEY não encontrada."
        );
    }


    if (!SECRET_KEY) {

        console.warn(
            "⚠️ SECRET_KEY não encontrada."
        );
    }


    // =================================================
    // IMPORTANTE:
    //
    // NÃO carregamos o cache atual em ultimoCache.
    //
    // Começamos vazio para que uma posição que já
    // esteja aberta quando o worker iniciar também
    // gere uma mensagem no Telegram.
    // =================================================

    ultimoCache = {};


    // -----------------------------------------------
    // Descobrir usuários
    // -----------------------------------------------

    await atualizarUsuarios();


    // -----------------------------------------------
    // Primeira execução
    // -----------------------------------------------

    await verificarPosicoes();


    // -----------------------------------------------
    // Loop
    // -----------------------------------------------

    setInterval(
        async () => {

            try {

                await atualizarUsuarios();

                await verificarPosicoes();

            } catch (erro) {

                console.error(
                    "❌ Erro no loop Telegram:",
                    erro.message
                );
            }

        },
        CHECK_INTERVAL_MS
    );
}


// =====================================================
// TRATAMENTO DE ERROS
// =====================================================

process.on(
    "uncaughtException",
    erro => {

        console.error(
            "❌ uncaughtException:",
            erro
        );
    }
);


process.on(
    "unhandledRejection",
    erro => {

        console.error(
            "❌ unhandledRejection:",
            erro
        );
    }
);


// =====================================================
// START
// =====================================================

iniciar();