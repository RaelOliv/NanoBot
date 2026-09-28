const fs = require("fs");
const path = require("path");
const axios = require("axios");

require("dotenv").config();

const { parentPort } = require("worker_threads");

const api = require("../api");
const { activatePause } = require("./pauseManager");

// ======================================================
// CONFIGURAÇÕES
// ======================================================

const TELEGRAM_TOKEN =
  process.env.TELEGRAM_TOKEN;

const TELEGRAM_API =
  TELEGRAM_TOKEN
    ? `https://api.telegram.org/bot${TELEGRAM_TOKEN}`
    : null;

const SLDIA =
  parseFloat(
    process.env.SLDIA || "-10"
  );

const TPDIA =
  parseFloat(
    process.env.TPDIA || "10"
  );

// ======================================================
// DIRETÓRIO DE CACHE
// ======================================================

const WORKER_CACHE_DIR =
  path.resolve(
    __dirname,
    "cache"
  );

// ======================================================
// ARQUIVOS
// ======================================================

const BALANCE_FILE =
  path.join(
    WORKER_CACHE_DIR,
    "Balance.json"
  );

const OLD_BALANCE_FILE =
  path.join(
    WORKER_CACHE_DIR,
    "oldBalance.json"
  );

const BALANCE_HIST_FILE =
  path.join(
    WORKER_CACHE_DIR,
    "BalanceHist.json"
  );

const RESET_COUNT_FILE =
  path.join(
    WORKER_CACHE_DIR,
    "ResetCount.json"
  );

const RESET_HIST_FILE =
  path.join(
    WORKER_CACHE_DIR,
    "ResetHist.json"
  );

// ======================================================
// TELEGRAM
// ======================================================
//
// users.json:
//
// {
//   "6133697652": {
//     "first_name": ".",
//     "username": null,
//     "active": true
//   }
// }
//
// telegramMarginMessages.json:
//
// {
//   "6133697652": {
//     "messageId": 120,
//     "createdAt": 123456789,
//     "updatedAt": 123456789
//   }
// }
//
// Também aceita o formato antigo:
//
// {
//   "6133697652": 120
// }
//
// ======================================================

const USERS_FILE =
  path.join(
    WORKER_CACHE_DIR,
    "users.json"
  );

const TELEGRAM_MESSAGES_FILE =
  path.join(
    WORKER_CACHE_DIR,
    "telegramMarginMessages.json"
  );

// ======================================================
// CONTROLE DO WORKER
// ======================================================

let workerRunning = false;

let serverTimeOffset = 0;

// ======================================================
// CONTROLE TELEGRAM
// ======================================================

const telegramLastText =
  new Map();

const telegramLastUpdate =
  new Map();

const TELEGRAM_MIN_UPDATE_INTERVAL =
  parseInt(
    process.env.TELEGRAM_MARGIN_UPDATE_INTERVAL ||
    "5000",
    10
  );

// ======================================================
// GARANTE DIRETÓRIO
// ======================================================

function garantirCacheDir() {

  try {

    fs.mkdirSync(
      WORKER_CACHE_DIR,
      {
        recursive: true
      }
    );

  } catch (erro) {

    console.error(
      "[margWorker] Erro criando diretório de cache:",
      erro.message
    );
  }
}

garantirCacheDir();

// ======================================================
// SALVAR JSON
// ======================================================

function salvarJson(
  arquivo,
  dados
) {

  try {

    garantirCacheDir();

    const temporario =
      `${arquivo}.tmp`;

    fs.writeFileSync(
      temporario,
      JSON.stringify(
        dados,
        null,
        2
      ),
      "utf8"
    );

    fs.renameSync(
      temporario,
      arquivo
    );

    return true;

  } catch (erro) {

    console.error(
      `[margWorker] Erro salvando ${arquivo}:`,
      erro.message
    );

    return false;
  }
}

// ======================================================
// LER JSON
// ======================================================

function lerJson(
  arquivo,
  padrao = null
) {

  try {

    if (
      !fs.existsSync(
        arquivo
      )
    ) {

      return padrao;
    }

    const conteudo =
      fs.readFileSync(
        arquivo,
        "utf8"
      ).trim();

    if (
      !conteudo
    ) {

      return padrao;
    }

    return JSON.parse(
      conteudo
    );

  } catch (erro) {

    console.error(
      `[margWorker] Erro lendo ${arquivo}:`,
      erro.message
    );

    return padrao;
  }
}

// ======================================================
// NÚMERO
// ======================================================

function numero(
  valor,
  casas = 8
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

// ======================================================
// PERCENTUAL
// ======================================================

function calcularPercentual(
  inicial,
  atual
) {

  const i =
    Number(inicial);

  const a =
    Number(atual);

  if (
    !Number.isFinite(i) ||
    !Number.isFinite(a) ||
    i === 0
  ) {

    return 0;
  }

  return (
    ((a - i) / i) *
    100
  );
}

// ======================================================
// FORMATA NÚMERO
// ======================================================

function formatarNumero(
  valor,
  casas = 2
) {

  const n =
    Number(valor);

  if (
    !Number.isFinite(n)
  ) {

    return "0.00";
  }

  return n.toLocaleString(
    "en-US",
    {
      minimumFractionDigits:
        casas,

      maximumFractionDigits:
        casas
    }
  );
}

// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHtml(
  valor
) {

  return String(
    valor
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    );
}

// ======================================================
// TELEGRAM
// CARREGAR USUÁRIOS
// ======================================================

function carregarUsuariosTelegram() {

  console.log(
    `[Telegram] Arquivo de usuários: ${USERS_FILE}`
  );

  const dados =
    lerJson(
      USERS_FILE,
      {}
    );

  if (
    !dados ||
    typeof dados !== "object" ||
    Array.isArray(dados)
  ) {

    console.log(
      "[Telegram] Nenhum usuário disponível."
    );

    return [];
  }

  const usuarios = [];

  for (
    const [chatId, usuario] of Object.entries(dados)
  ) {

    if (
      !usuario ||
      typeof usuario !== "object"
    ) {

      continue;
    }

    if (
      usuario.active === false
    ) {

      continue;
    }

    usuarios.push({

      chatId:
        String(chatId),

      ...usuario

    });
  }

  console.log(
    `[Telegram] Usuários encontrados: ${usuarios.length}`
  );

  return usuarios;
}

// ======================================================
// TELEGRAM
// OBTER CHAT ID
// ======================================================

function obterChatId(
  usuario
) {

  if (
    !usuario ||
    typeof usuario !== "object"
  ) {

    return null;
  }

  if (
    usuario.chatId !== undefined &&
    usuario.chatId !== null &&
    String(
      usuario.chatId
    ).trim() !== ""
  ) {

    return String(
      usuario.chatId
    );
  }

  if (
    usuario.chat_id !== undefined &&
    usuario.chat_id !== null &&
    String(
      usuario.chat_id
    ).trim() !== ""
  ) {

    return String(
      usuario.chat_id
    );
  }

  if (
    usuario.telegramChatId !== undefined &&
    usuario.telegramChatId !== null
  ) {

    return String(
      usuario.telegramChatId
    );
  }

  if (
    usuario.telegram_chat_id !== undefined &&
    usuario.telegram_chat_id !== null
  ) {

    return String(
      usuario.telegram_chat_id
    );
  }

  return null;
}

// ======================================================
// TELEGRAM
// CARREGAR MESSAGE IDS
// ======================================================

function carregarMensagensTelegram() {

  const dados =
    lerJson(
      TELEGRAM_MESSAGES_FILE,
      {}
    );

  if (
    !dados ||
    typeof dados !== "object" ||
    Array.isArray(dados)
  ) {

    return {};
  }

  return dados;
}

// ======================================================
// TELEGRAM
// OBTER MESSAGE ID
// ======================================================

function obterMessageId(
  registro
) {

  if (
    registro === undefined ||
    registro === null
  ) {

    return null;
  }

  // Formato antigo
  if (
    typeof registro === "number" ||
    typeof registro === "string"
  ) {

    const id =
      Number(
        registro
      );

    if (
      Number.isFinite(id) &&
      id > 0
    ) {

      return id;
    }

    return null;
  }

  // Formato atual
  if (
    typeof registro === "object"
  ) {

    const id =
      Number(
        registro.messageId
      );

    if (
      Number.isFinite(id) &&
      id > 0
    ) {

      return id;
    }
  }

  return null;
}

// ======================================================
// TELEGRAM
// SALVAR MESSAGE IDS
// ======================================================

function salvarMensagensTelegram(
  dados
) {

  return salvarJson(
    TELEGRAM_MESSAGES_FILE,
    dados
  );
}

// ======================================================
// TELEGRAM
// IDENTIFICAR MENSAGEM NÃO EXISTENTE
// ======================================================

function mensagemNaoExisteMais(
  erro
) {

  const status =
    erro?.response?.status;

  const descricao =
    erro?.response?.data?.description ||
    erro?.message ||
    "";

  const texto =
    String(
      descricao
    ).toLowerCase();

  console.log(
    `[Telegram] 🔎 Erro Telegram status=${status || "?"} ` +
    `descricao="${descricao}"`
  );

  // ====================================================
  // ERROS EXPLÍCITOS
  // ====================================================

  if (
    texto.includes(
      "message to edit not found"
    )
  ) {

    return true;
  }

  if (
    texto.includes(
      "message identifier is not valid"
    )
  ) {

    return true;
  }

  if (
    texto.includes(
      "message identifier is not specified"
    )
  ) {

    return true;
  }

  if (
    texto.includes(
      "message can't be edited"
    )
  ) {

    return true;
  }

  if (
    texto.includes(
      "message not found"
    )
  ) {

    return true;
  }

  if (
    texto.includes(
      "message_id_invalid"
    )
  ) {

    return true;
  }

  // ====================================================
  // ERROS 400 RELACIONADOS À MENSAGEM
  // ====================================================

  if (
    status === 400 &&
    texto.includes("message") &&
    (
      texto.includes("edit") ||
      texto.includes("identifier") ||
      texto.includes("not found") ||
      texto.includes("can't be edited") ||
      texto.includes("cannot be edited")
    )
  ) {

    return true;
  }

  return false;
}

// ======================================================
// TELEGRAM
// MENSAGEM NÃO MODIFICADA
// ======================================================

function mensagemNaoModificada(
  erro
) {

  const descricao =
    erro?.response?.data?.description ||
    erro?.message ||
    "";

  const texto =
    String(
      descricao
    ).toLowerCase();

  return texto.includes(
    "message is not modified"
  );
}

// ======================================================
// TELEGRAM
// VERIFICAR BOT
// ======================================================

async function verificarBotTelegram() {

  if (
    !TELEGRAM_API
  ) {

    return;
  }

  try {

    const resposta =
      await axios.get(
        `${TELEGRAM_API}/getMe`,
        {
          timeout: 15000
        }
      );

    if (
      resposta.data?.ok
    ) {

      const bot =
        resposta.data.result;

      console.log(
        "[Telegram] 🤖 Bot conectado:"
      );

      console.log(
        JSON.stringify(
          {
            id:
              bot?.id,

            is_bot:
              bot?.is_bot,

            first_name:
              bot?.first_name,

            username:
              bot?.username
          },
          null,
          2
        )
      );

    } else {

      console.error(
        "[Telegram] ❌ getMe retornou resposta inválida:",
        resposta.data
      );
    }

  } catch (erro) {

    console.error(
      "[Telegram] ❌ Erro verificando bot:",
      erro.response?.data ||
      erro.message
    );
  }
}

// ======================================================
// TELEGRAM
// VERIFICAR CHAT
// ======================================================

async function verificarChatTelegram(
  chatId
) {

  if (
    !TELEGRAM_API ||
    !chatId
  ) {

    return;
  }

  try {

    const resposta =
      await axios.get(
        `${TELEGRAM_API}/getChat`,
        {
          params: {
            chat_id:
              chatId
          },

          timeout:
            15000
        }
      );

    if (
      resposta.data?.ok
    ) {

      const chat =
        resposta.data.result;

      console.log(
        `[Telegram] 💬 Chat confirmado: ` +
        `id=${chat?.id} ` +
        `type=${chat?.type} ` +
        `username=${chat?.username || "-"}` 
      );

    } else {

      console.warn(
        `[Telegram] ⚠️ Não foi possível confirmar chat ${chatId}:`,
        resposta.data
      );
    }

  } catch (erro) {

    console.error(
      `[Telegram] ❌ Erro verificando chat ${chatId}:`,
      erro.response?.data ||
      erro.message
    );
  }
}

// ======================================================
// TELEGRAM
// CRIAR NOVA MENSAGEM
// ======================================================

async function criarMensagemTelegram(
  chatId,
  texto
) {

  if (
    !TELEGRAM_API
  ) {

    console.error(
      "[Telegram] TELEGRAM_TOKEN não configurado."
    );

    return {

      ok:
        false,

      messageId:
        null
    };
  }

  try {

    console.log(
      `[Telegram] 📤 Criando nova mensagem para ${chatId}...`
    );

    const resposta =
      await axios.post(
        `${TELEGRAM_API}/sendMessage`,
        {
          chat_id:
            chatId,

          text:
            texto,

          parse_mode:
            "HTML",

          disable_web_page_preview:
            true
        },
        {
          timeout:
            15000
        }
      );

    console.log(
      "[Telegram] 📩 Retorno sendMessage:",
      JSON.stringify(
        resposta.data,
        null,
        2
      )
    );

    if (
      !resposta.data ||
      !resposta.data.ok
    ) {

      console.error(
        `[Telegram] ❌ Falha no sendMessage para ${chatId}:`,
        resposta.data
      );

      return {

        ok:
          false,

        messageId:
          null
      };
    }

    const message =
      resposta.data?.result;

    const messageId =
      Number(
        message?.message_id
      );

    if (
      !Number.isFinite(
        messageId
      ) ||
      messageId <= 0
    ) {

      console.error(
        `[Telegram] ❌ Telegram não retornou message_id válido para ${chatId}.`
      );

      return {

        ok:
          false,

        messageId:
          null
      };
    }

    const chatRetornado =
      String(
        message?.chat?.id
      );

    console.log(
      `[Telegram] ✅ Nova mensagem criada. ` +
      `chat=${chatId} message_id=${messageId}`
    );

    console.log(
      `[Telegram] 📌 Chat retornado pelo Telegram: ${chatRetornado}`
    );

    return {

      ok:
        true,

      messageId
    };

  } catch (erro) {

    console.error(
      `[Telegram] ❌ Erro no sendMessage para ${chatId}:`,
      erro.response?.data ||
      erro.message
    );

    return {

      ok:
        false,

      messageId:
        null
    };
  }
}

// ======================================================
// TELEGRAM
// EDITAR MENSAGEM
// ======================================================

async function editarMensagemTelegram(
  chatId,
  messageId,
  texto
) {

  if (
    !TELEGRAM_API
  ) {

    return {

      ok:
        false,

      mensagemNaoExiste:
        false,

      mensagemNaoModificada:
        false
    };
  }

  try {

    console.log(
      `[Telegram] ✏️ Editando mensagem ` +
      `chat=${chatId} message_id=${messageId}`
    );

    const resposta =
      await axios.post(
        `${TELEGRAM_API}/editMessageText`,
        {
          chat_id:
            chatId,

          message_id:
            messageId,

          text:
            texto,

          parse_mode:
            "HTML",

          disable_web_page_preview:
            true
        },
        {
          timeout:
            15000
        }
      );

    // ==================================================
    // MOSTRA RESPOSTA COMPLETA
    // ==================================================

    console.log(
      "[Telegram] 📩 Retorno editMessageText:",
      JSON.stringify(
        resposta.data,
        null,
        2
      )
    );

    // ==================================================
    // TELEGRAM NÃO RETORNOU OK
    // ==================================================

    if (
      !resposta.data?.ok
    ) {

      console.warn(
        `[Telegram] ⚠️ editMessageText retornou ok=false para ${messageId}.`
      );

      return {

        ok:
          false,

        mensagemNaoExiste:
          false,

        mensagemNaoModificada:
          false
      };
    }

    // ==================================================
    // RESULTADO DA MENSAGEM
    // ==================================================

    const mensagem =
      resposta.data?.result;

    /*
     * Para uma mensagem normal enviada pelo bot,
     * esperamos receber o objeto Message.
     */

    if (
      !mensagem
    ) {

      console.warn(
        `[Telegram] ⚠️ Telegram respondeu OK para ${messageId}, ` +
        `mas não retornou result.`
      );

      return {

        ok:
          false,

        mensagemNaoExiste:
          true,

        mensagemNaoModificada:
          false
      };
    }

    const idRetornado =
      Number(
        mensagem.message_id
      );

    const chatRetornado =
      String(
        mensagem.chat?.id
      );

    console.log(
      "[Telegram] 📌 Mensagem retornada:",
      JSON.stringify(
        {
          message_id:
            mensagem.message_id,

          chat_id:
            mensagem.chat?.id,

          chat_type:
            mensagem.chat?.type,

          text:
            mensagem.text
        },
        null,
        2
      )
    );

    // ==================================================
    // VALIDA ID
    // ==================================================

    if (
      idRetornado !==
      Number(messageId)
    ) {

      console.warn(
        `[Telegram] ⚠️ ID retornado pelo Telegram ` +
        `(${idRetornado}) é diferente do esperado (${messageId}).`
      );

      return {

        ok:
          false,

        mensagemNaoExiste:
          true,

        mensagemNaoModificada:
          false
      };
    }

    // ==================================================
    // VALIDA CHAT
    // ==================================================

    if (
      chatRetornado !==
      String(chatId)
    ) {

      console.warn(
        `[Telegram] ⚠️ Chat retornado pelo Telegram ` +
        `(${chatRetornado}) é diferente do esperado (${chatId}).`
      );

      return {

        ok:
          false,

        mensagemNaoExiste:
          true,

        mensagemNaoModificada:
          false
      };
    }

    // ==================================================
    // SUCESSO REAL
    // ==================================================

    console.log(
      `[Telegram] ✅ Mensagem ${messageId} atualizada e validada.`
    );

    return {

      ok:
        true,

      mensagemNaoExiste:
        false,

      mensagemNaoModificada:
        false
    };

  } catch (erro) {

    const descricao =
      erro?.response?.data?.description ||
      erro?.message ||
      "";

    // ==================================================
    // MESMO TEXTO
    // ==================================================

    if (
      mensagemNaoModificada(
        erro
      )
    ) {

      console.log(
        `[Telegram] ℹ️ Mensagem ${messageId} ` +
        `já possui o mesmo conteúdo.`
      );

      return {

        ok:
          true,

        mensagemNaoExiste:
          false,

        mensagemNaoModificada:
          true,

        erro
      };
    }

    // ==================================================
    // MENSAGEM INEXISTENTE
    // ==================================================

    const inexistente =
      mensagemNaoExisteMais(
        erro
      );

    console.warn(
      `[Telegram] ⚠️ Erro editando ` +
      `chat=${chatId} message_id=${messageId}: ` +
      `${descricao}`
    );

    return {

      ok:
        false,

      mensagemNaoExiste:
        inexistente,

      mensagemNaoModificada:
        false,

      erro
    };
  }
}

// ======================================================
// TELEGRAM
// ATUALIZAR MENSAGEM
// ======================================================

async function atualizarMensagemTelegram(
  chatId,
  texto
) {

  if (
    !TELEGRAM_API
  ) {

    return;
  }

  const chatKey =
    String(
      chatId
    );

  const agora =
    Date.now();

  // ====================================================
  // CARREGA IDS
  // ====================================================

  let mensagens =
    carregarMensagensTelegram();

  let registro =
    mensagens[
      chatKey
    ];

  // ====================================================
  // OBTÉM ID
  // ====================================================

  let messageId =
    obterMessageId(
      registro
    );

  // ====================================================
  // EVITA ATUALIZAÇÕES DESNECESSÁRIAS
  // ====================================================

  const ultimoTexto =
    telegramLastText.get(
      chatKey
    );

  const ultimoUpdate =
    telegramLastUpdate.get(
      chatKey
    ) || 0;

  if (
    ultimoTexto === texto &&
    agora - ultimoUpdate <
      TELEGRAM_MIN_UPDATE_INTERVAL
  ) {

    return;
  }

  // ====================================================
  // EXISTE MESSAGE ID
  // ====================================================

  if (
    messageId
  ) {

    console.log(
      `[Telegram] 🔑 Message ID encontrado no cache: ` +
      `chat=${chatId} message_id=${messageId}`
    );

    const resultado =
      await editarMensagemTelegram(
        chatId,
        messageId,
        texto
      );

    // ==================================================
    // EDIÇÃO VALIDADA
    // ==================================================

    if (
      resultado.ok
    ) {

      mensagens[
        chatKey
      ] = {

        messageId,

        createdAt:
          registro &&
          typeof registro === "object"
            ? (
                registro.createdAt ||
                agora
              )
            : agora,

        updatedAt:
          agora
      };

      salvarMensagensTelegram(
        mensagens
      );

      telegramLastText.set(
        chatKey,
        texto
      );

      telegramLastUpdate.set(
        chatKey,
        agora
      );

      return;
    }

    // ==================================================
    // MENSAGEM NÃO EXISTE
    // ==================================================

    if (
      resultado.mensagemNaoExiste
    ) {

      console.log(
        `[Telegram] ❌ A mensagem ${messageId} ` +
        `do chat ${chatId} não existe mais.`
      );

      // ================================================
      // REMOVE DO CACHE
      // ================================================

      delete mensagens[
        chatKey
      ];

      const removeu =
        salvarMensagensTelegram(
          mensagens
        );

      if (
        removeu
      ) {

        console.log(
          `[Telegram] ♻️ message_id=${messageId} ` +
          `removido do cache.`
        );

      } else {

        console.error(
          `[Telegram] ❌ Não foi possível remover ` +
          `message_id=${messageId} do cache.`
        );
      }

      registro = null;
      messageId = null;

    } else {

      // =================================================
      // OUTRO ERRO
      // =================================================

      console.warn(
        `[Telegram] ⚠️ Não foi possível editar ` +
        `message_id=${messageId}. ` +
        `O ID será mantido para nova tentativa.`
      );

      return;
    }
  }

  // ====================================================
  // CRIA NOVA MENSAGEM
  // ====================================================

  console.log(
    `[Telegram] 📤 Nenhuma mensagem válida encontrada. ` +
    `Criando nova mensagem para ${chatId}.`
  );

  const nova =
    await criarMensagemTelegram(
      chatId,
      texto
    );

  if (
    !nova?.ok ||
    !nova?.messageId
  ) {

    console.error(
      `[Telegram] ❌ Falha ao criar nova mensagem para ${chatId}.`
    );

    return;
  }

  const novoMessageId =
    Number(
      nova.messageId
    );

  // ====================================================
  // SALVA NOVO MESSAGE ID
  // ====================================================

  mensagens[
    chatKey
  ] = {

    messageId:
      novoMessageId,

    createdAt:
      agora,

    updatedAt:
      agora
  };

  const salvou =
    salvarMensagensTelegram(
      mensagens
    );

  if (
    salvou
  ) {

    console.log(
      `[Telegram] 💾 Novo message_id salvo: ` +
      `${novoMessageId}`
    );

  } else {

    console.error(
      `[Telegram] ⚠️ Mensagem criada, ` +
      `mas o novo message_id não pôde ser salvo.`
    );
  }

  // ====================================================
  // CONTROLE EM MEMÓRIA
  // ====================================================

  telegramLastText.set(
    chatKey,
    texto
  );

  telegramLastUpdate.set(
    chatKey,
    agora
  );
}

// ======================================================
// TELEGRAM
// ATUALIZAR TODOS OS USUÁRIOS
// ======================================================

async function atualizarTelegram(
  dados
) {

  if (
    !TELEGRAM_API
  ) {

    console.warn(
      "[Telegram] Telegram desativado."
    );

    return;
  }

  const usuarios =
    carregarUsuariosTelegram();

  if (
    usuarios.length === 0
  ) {

    console.warn(
      "[Telegram] Nenhum usuário disponível."
    );

    return;
  }

  const texto =
    formatarMensagemMargem(
      dados
    );

  console.log(
    `[Telegram] Atualizando ${usuarios.length} usuário(s).`
  );

  for (
    const usuario of usuarios
  ) {

    const chatId =
      obterChatId(
        usuario
      );

    if (
      !chatId
    ) {

      console.warn(
        "[Telegram] Usuário sem chat_id válido."
      );

      continue;
    }

    try {

      await atualizarMensagemTelegram(
        chatId,
        texto
      );

    } catch (erro) {

      console.error(
        `[Telegram] Erro processando chat ${chatId}:`,
        erro.message
      );
    }
  }
}

// ======================================================
// FORMATA MENSAGEM DA MARGEM
// ======================================================

function formatarMensagemMargem(
  dados
) {

  const wallet =
    numero(
      dados.walletBalance
    );

  const margin =
    numero(
      dados.marginBalance
    );

  const available =
    numero(
      dados.availableBalance
    );

  const percentual =
    numero(
      dados.percentual,
      4
    );

  const percentualReal =
    numero(
      dados.percentualReal,
      4
    );

  const max =
    numero(
      dados.maxPercentual,
      4
    );

  const min =
    numero(
      dados.minPercentual,
      4
    );

  let sinal =
    "⚪";

  if (
    percentual > 0
  ) {

    sinal =
      "🟢";

  } else if (
    percentual < 0
  ) {

    sinal =
      "🔴";
  }

  const atualizado =
    new Date()
      .toLocaleString(
        "pt-BR",
        {
          timeZone:
            "America/Sao_Paulo"
        }
      );

  return (
    `━━━━━━━━━━━━━━━\n` +
    `📊 <b>MARGEM DA CONTA</b>\n` +
    `━━━━━━━━━━━━━━━\n\n` +

    `💰 <b>Wallet Balance:</b> ` +
    `${formatarNumero(
      wallet,
      2
    )} USDT\n` +

    `💵 <b>Margin Balance:</b> ` +
    `${formatarNumero(
      margin,
      2
    )} USDT\n` +

    `💳 <b>Disponível:</b> ` +
    `${formatarNumero(
      available,
      2
    )} USDT\n\n` +

    `${sinal} <b>Variação:</b> ` +
    `${percentual >= 0 ? "+" : ""}` +
    `${percentual.toFixed(4)}%\n` +

    `📈 <b>Variação Real:</b> ` +
    `${percentualReal >= 0 ? "+" : ""}` +
    `${percentualReal.toFixed(4)}%\n\n` +

    `🔺 <b>Máxima:</b> ` +
    `${max >= 0 ? "+" : ""}` +
    `${max.toFixed(4)}%\n` +

    `🔻 <b>Mínima:</b> ` +
    `${min >= 0 ? "+" : ""}` +
    `${min.toFixed(4)}%\n\n` +

    `🕐 <b>Atualizado:</b> ` +
    `${escapeHtml(
      atualizado
    )}\n` +

    `━━━━━━━━━━━━━━━`
  );
}

// ======================================================
// OBTER BALANCE FUTURES
// ======================================================

async function getBalance() {

  try {

    const resposta =
      await api.accountFutures(
        Date.now()
      );

    if (
      !resposta
    ) {

      throw new Error(
        "accountFutures retornou vazio"
      );
    }

    let usdt = null;

    if (
      Array.isArray(
        resposta.assets
      )
    ) {

      usdt =
        resposta.assets.find(
          item =>
            item.asset === "USDT"
        );
    }

    if (
      !usdt
    ) {

      throw new Error(
        "USDT não encontrado em accountFutures"
      );
    }

    return {

      asset:
        "USDT",

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
          usdt.availableBalance ??
          resposta.availableBalance
        ),

      initialMargin:
        numero(
          usdt.initialMargin
        ),

      maintMargin:
        numero(
          usdt.maintMargin
        ),

      raw:
        usdt
    };

  } catch (erro) {

    console.error(
      "[margWorker] Erro obtendo saldo Futures:",
      erro.message
    );

    return null;
  }
}

// ======================================================
// SINCRONIZAR HORÁRIO
// ======================================================

async function sincronizarHorario() {

  try {

    const resposta =
      await api.time();

    if (
      resposta?.data?.serverTime
    ) {

      serverTimeOffset =
        resposta.data.serverTime -
        Date.now();

      return;
    }

    if (
      resposta?.serverTime
    ) {

      serverTimeOffset =
        resposta.serverTime -
        Date.now();
    }

  } catch (erro) {

    console.warn(
      "[margWorker] Erro sincronizando horário:",
      erro.message
    );
  }
}

// ======================================================
// HISTÓRICO DO BALANCE
// ======================================================

function obterHistoricoBalance() {

  const dados =
    lerJson(
      BALANCE_HIST_FILE,
      []
    );

  return Array.isArray(
    dados
  )
    ? dados
    : [];
}

// ======================================================
// MONITORAR MARGEM
// ======================================================

async function monitorarMargem() {

  const balance =
    await getBalance();

  if (
    !balance
  ) {

    return;
  }

  const agora =
    Date.now();

  // ====================================================
  // HISTÓRICO
  // ====================================================

  let balanceHist =
    obterHistoricoBalance();

  balanceHist.push({

    timestamp:
      agora,

    date:
      new Date(
        agora
      ).toISOString(),

    walletBalance:
      balance.walletBalance,

    marginBalance:
      balance.marginBalance,

    availableBalance:
      balance.availableBalance
  });

  if (
    balanceHist.length > 5000
  ) {

    balanceHist =
      balanceHist.slice(
        -5000
      );
  }

  salvarJson(
    BALANCE_HIST_FILE,
    balanceHist
  );

  // ====================================================
  // OLD BALANCE
  // ====================================================

  let oldBalance =
    lerJson(
      OLD_BALANCE_FILE,
      null
    );

  if (
    !oldBalance ||
    !Number.isFinite(
      Number(
        oldBalance.walletBalance
      )
    )
  ) {

    oldBalance = {

      walletBalance:
        balance.walletBalance,

      marginBalance:
        balance.marginBalance,

      availableBalance:
        balance.availableBalance,

      maxPercentual:
        0,

      minPercentual:
        0,

      timestamp:
        agora
    };

    salvarJson(
      OLD_BALANCE_FILE,
      oldBalance
    );
  }

  // ====================================================
  // PERCENTUAIS
  // ====================================================

  const percentual =
    calcularPercentual(
      oldBalance.walletBalance,
      balance.marginBalance
    );

  const percentualReal =
    calcularPercentual(
      oldBalance.walletBalance,
      balance.walletBalance
    );

  // ====================================================
  // MAX / MIN
  // ====================================================

  let maxPercentual =
    Number(
      oldBalance.maxPercentual
    );

  let minPercentual =
    Number(
      oldBalance.minPercentual
    );

  if (
    !Number.isFinite(
      maxPercentual
    )
  ) {

    maxPercentual =
      percentual;
  }

  if (
    !Number.isFinite(
      minPercentual
    )
  ) {

    minPercentual =
      percentual;
  }

  maxPercentual =
    Math.max(
      maxPercentual,
      percentual
    );

  minPercentual =
    Math.min(
      minPercentual,
      percentual
    );

  // ====================================================
  // SALVAR BALANCE
  // ====================================================

  salvarJson(
    BALANCE_FILE,
    {

      ...balance,

      percentual,

      percentualReal,

      maxPercentual,

      minPercentual,

      timestamp:
        agora
    }
  );

  // ====================================================
  // TELEGRAM
  // ====================================================

  await atualizarTelegram({

    walletBalance:
      balance.walletBalance,

    marginBalance:
      balance.marginBalance,

    availableBalance:
      balance.availableBalance,

    percentual,

    percentualReal,

    maxPercentual,

    minPercentual,

    timestamp:
      agora
  });

  // ====================================================
  // ENVIAR STATUS PARA O PARENT
  // ====================================================

  if (
    parentPort
  ) {

    try {

      parentPort.postMessage({

        type:
          "MARGIN_STATUS",

        data: {

          walletBalance:
            balance.walletBalance,

          marginBalance:
            balance.marginBalance,

          availableBalance:
            balance.availableBalance,

          percentual,

          percentualReal,

          maxPercentual,

          minPercentual,

          timestamp:
            agora
        }
      });

    } catch (erro) {

      console.error(
        "[margWorker] Erro enviando MARGIN_STATUS:",
        erro.message
      );
    }
  }

  // ====================================================
  // RESET COUNT
  // ====================================================

  let resetCount =
    lerJson(
      RESET_COUNT_FILE,
      {
        count: 0
      }
    );

  if (
    !resetCount ||
    typeof resetCount !== "object"
  ) {

    resetCount = {
      count: 0
    };
  }

  let resetHist =
    lerJson(
      RESET_HIST_FILE,
      []
    );

  if (
    !Array.isArray(
      resetHist
    )
  ) {

    resetHist = [];
  }

  // ====================================================
  // LIMITES
  // ====================================================

  const limiteStop =
    percentual <= SLDIA;

  const limiteTake =
    percentual >= TPDIA;

  const limiteEmergencia =
    percentual >= 90;

  // ====================================================
  // EMERGÊNCIA
  // ====================================================

  if (
    limiteEmergencia
  ) {

    console.log(
      `[margWorker] ⚠️ Margem em ` +
      `${percentual.toFixed(4)}%`
    );

    resetCount.count++;

    resetHist.push({

      timestamp:
        agora,

      date:
        new Date(
          agora
        ).toISOString(),

      motivo:
        "LIMITE_EMERGENCIA",

      percentual,

      walletBalance:
        balance.walletBalance,

      marginBalance:
        balance.marginBalance
    });

    salvarJson(
      RESET_COUNT_FILE,
      resetCount
    );

    salvarJson(
      RESET_HIST_FILE,
      resetHist
    );

    oldBalance = {

      walletBalance:
        balance.walletBalance,

      marginBalance:
        balance.marginBalance,

      availableBalance:
        balance.availableBalance,

      maxPercentual:
        percentual,

      minPercentual:
        percentual,

      timestamp:
        agora
    };

    salvarJson(
      OLD_BALANCE_FILE,
      oldBalance
    );

    return;
  }

  // ====================================================
  // TAKE PROFIT
  // ====================================================

  if (
    limiteTake
  ) {

    console.log(
      `[margWorker] 🟢 Take de margem: ` +
      `${percentual.toFixed(4)}%`
    );

    resetCount.count++;

    resetHist.push({

      timestamp:
        agora,

      date:
        new Date(
          agora
        ).toISOString(),

      motivo:
        "TAKE_PROFIT_MARGEM",

      percentual,

      walletBalance:
        balance.walletBalance,

      marginBalance:
        balance.marginBalance
    });

    salvarJson(
      RESET_COUNT_FILE,
      resetCount
    );

    salvarJson(
      RESET_HIST_FILE,
      resetHist
    );

    try {

      activatePause(
        30
      );

      console.log(
        "[margWorker] ⏸️ Pausa de 30 minutos ativada."
      );

    } catch (erro) {

      console.error(
        "[margWorker] Erro ativando pausa:",
        erro.message
      );
    }

    console.log(
      "[margWorker] Fechamento global não executado: " +
      "api.js atual não possui função para listar/fechar todas as posições."
    );

    oldBalance = {

      walletBalance:
        balance.walletBalance,

      marginBalance:
        balance.marginBalance,

      availableBalance:
        balance.availableBalance,

      maxPercentual:
        percentual,

      minPercentual:
        percentual,

      timestamp:
        agora
    };

    salvarJson(
      OLD_BALANCE_FILE,
      oldBalance
    );

    return;
  }

  // ====================================================
  // STOP LOSS
  // ====================================================

  if (
    limiteStop
  ) {

    console.log(
      `[margWorker] 🔴 Stop de margem: ` +
      `${percentual.toFixed(4)}%`
    );

    resetCount.count++;

    resetHist.push({

      timestamp:
        agora,

      date:
        new Date(
          agora
        ).toISOString(),

      motivo:
        "STOP_LOSS_MARGEM",

      percentual,

      walletBalance:
        balance.walletBalance,

      marginBalance:
        balance.marginBalance
    });

    salvarJson(
      RESET_COUNT_FILE,
      resetCount
    );

    salvarJson(
      RESET_HIST_FILE,
      resetHist
    );

    try {

      activatePause(
        30
      );

      console.log(
        "[margWorker] ⏸️ Pausa de 30 minutos ativada."
      );

    } catch (erro) {

      console.error(
        "[margWorker] Erro ativando pausa:",
        erro.message
      );
    }

    console.log(
      "[margWorker] Fechamento global não executado: " +
      "api.js atual não possui função para listar/fechar todas as posições."
    );

    oldBalance = {

      walletBalance:
        balance.walletBalance,

      marginBalance:
        balance.marginBalance,

      availableBalance:
        balance.availableBalance,

      maxPercentual:
        percentual,

      minPercentual:
        percentual,

      timestamp:
        agora
    };

    salvarJson(
      OLD_BALANCE_FILE,
      oldBalance
    );

    return;
  }

  // ====================================================
  // ATUALIZA REFERÊNCIA
  // ====================================================

  oldBalance = {

    walletBalance:
      balance.walletBalance,

    marginBalance:
      balance.marginBalance,

    availableBalance:
      balance.availableBalance,

    maxPercentual,

    minPercentual,

    timestamp:
      agora
  };

  salvarJson(
    OLD_BALANCE_FILE,
    oldBalance
  );
}

// ======================================================
// START WORKER
// ======================================================

async function startWorker() {

  if (
    workerRunning
  ) {

    console.log(
      "[margWorker] Ciclo anterior ainda está executando."
    );

    return;
  }

  workerRunning = true;

  try {

    await sincronizarHorario();

    await monitorarMargem();

  } catch (erro) {

    console.error(
      "[margWorker] Erro no ciclo:",
      erro
    );

  } finally {

    workerRunning = false;
  }
}

// ======================================================
// PARENT PORT
// ======================================================

if (
  parentPort
) {

  parentPort.on(
    "message",
    async (
      mensagem
    ) => {

      try {

        if (
          mensagem === "start" ||
          mensagem?.type === "start"
        ) {

          await startWorker();
        }

        if (
          mensagem === "check" ||
          mensagem?.type === "check"
        ) {

          await startWorker();
        }

      } catch (erro) {

        console.error(
          "[margWorker] Erro recebendo mensagem:",
          erro.message
        );
      }
    }
  );
}

// ======================================================
// INICIALIZAÇÃO
// ======================================================

(async () => {

  console.log(
    "================================================="
  );

  console.log(
    "💰 margWorker iniciado"
  );

  console.log(
    "📊 Monitoramento da margem Futures"
  );

  console.log(
    "📱 Telegram integrado diretamente ao margWorker"
  );

  console.log(
    "================================================="
  );

  console.log(
    `[margWorker] WORKER_CACHE_DIR: ${WORKER_CACHE_DIR}`
  );

  console.log(
    `[margWorker] USERS_FILE: ${USERS_FILE}`
  );

  console.log(
    `[margWorker] TELEGRAM_MESSAGES_FILE: ${TELEGRAM_MESSAGES_FILE}`
  );

  console.log(
    `[margWorker] Telegram: ${
      TELEGRAM_API
        ? "ATIVO"
        : "DESATIVADO"
    }`
  );

  console.log(
    `[margWorker] SLDIA: ${SLDIA}%`
  );

  console.log(
    `[margWorker] TPDIA: ${TPDIA}%`
  );

  // ====================================================
  // DIAGNÓSTICO TELEGRAM
  // ====================================================

  if (
    TELEGRAM_API
  ) {

    await verificarBotTelegram();

    const usuarios =
      carregarUsuariosTelegram();

    for (
      const usuario of usuarios
    ) {

      const chatId =
        obterChatId(
          usuario
        );

      if (
        chatId
      ) {

        await verificarChatTelegram(
          chatId
        );

      }
    }
  }

  // ====================================================
  // PRIMEIRA EXECUÇÃO
  // ====================================================

  await startWorker();

  // ====================================================
  // CICLO
  // ====================================================

  setInterval(
    async () => {

      await startWorker();

    },
    10000
  );

})();