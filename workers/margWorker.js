const WebSocket = require("ws");
const axios = require("axios");
const axiosRetry = require("axios-retry").default;
const crypto = require("crypto");
const notifier = require("node-notifier");
const { exec } = require("child_process");
const {
  parentPort,
  workerData
} = require("worker_threads");

const fs = require("fs");
const path = require("path");

require("dotenv").config();

const EMA = require("technicalindicators").EMA;
const SMA = require("technicalindicators").SMA;

const api = require("../api");
const { activatePause } = require("./pauseManager");

// ======================================================
// CONFIGURAÇÕES
// ======================================================

const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

const TELEGRAM_API = TELEGRAM_TOKEN
  ? `https://api.telegram.org/bot${TELEGRAM_TOKEN}`
  : null;

const BASE_URL =
  process.env.BASE_URL || "https://fapi.binance.com";

const CACHE_DIR = path.resolve(
  __dirname,
  "cache"
);

// ======================================================
// ARQUIVOS DE CACHE
// ======================================================

const BALANCE_FILE = path.join(
  CACHE_DIR,
  "Balance.json"
);

const OLD_BALANCE_FILE = path.join(
  CACHE_DIR,
  "oldBalance.json"
);

const BALANCE_HIST_FILE = path.join(
  CACHE_DIR,
  "BalanceHist.json"
);

const RESET_COUNT_FILE = path.join(
  CACHE_DIR,
  "ResetCount.json"
);

const RESET_HIST_FILE = path.join(
  CACHE_DIR,
  "ResetHist.json"
);

// Arquivo responsável por manter o message_id
// das mensagens do Telegram após reinicialização.
const TELEGRAM_MESSAGES_FILE = path.join(
  CACHE_DIR,
  "telegramMarginMessages.json"
);

// ======================================================
// CONFIGURAÇÕES DE MARGEM
// ======================================================

const SLDIA = parseFloat(
  process.env.SLDIA || "-10"
);

const TPDIA = parseFloat(
  process.env.TPDIA || "10"
);

const PMARG = parseFloat(
  process.env.PMARG || "0"
);

// ======================================================
// CONTROLE DO WORKER
// ======================================================

let workerRunning = false;

let serverTimeOffset = 0;

// ======================================================
// CONTROLE TELEGRAM
// ======================================================

const telegramLastText = new Map();

const telegramLastUpdate = new Map();

const TELEGRAM_MIN_UPDATE_INTERVAL =
  parseInt(
    process.env.TELEGRAM_MARGIN_UPDATE_INTERVAL || "5000",
    10
  );

// ======================================================
// GARANTE DIRETÓRIO
// ======================================================

function garantirCacheDir() {
  try {
    fs.mkdirSync(
      CACHE_DIR,
      {
        recursive: true
      }
    );
  } catch (erro) {
    console.error(
      "[margWorker] Erro criando diretório cache:",
      erro.message
    );
  }
}

garantirCacheDir();

// ======================================================
// FUNÇÕES DE ARQUIVO
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


function lerJson(
  arquivo,
  padrao = null
) {
  try {

    if (!fs.existsSync(arquivo)) {
      return padrao;
    }

    const conteudo =
      fs.readFileSync(
        arquivo,
        "utf8"
      ).trim();

    if (!conteudo) {
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
// TELEGRAM - ARQUIVO DE MESSAGE IDS
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


function salvarMensagensTelegram(
  dados
) {
  return salvarJson(
    TELEGRAM_MESSAGES_FILE,
    dados
  );
}


// ======================================================
// TELEGRAM - USUÁRIOS
// ======================================================

function carregarUsuariosTelegram() {

  const arquivoUsuarios =
    path.join(
      CACHE_DIR,
      "users.json"
    );

  const dados =
    lerJson(
      arquivoUsuarios,
      []
    );

  if (Array.isArray(dados)) {
    return dados;
  }

  if (
    dados &&
    Array.isArray(dados.users)
  ) {
    return dados.users;
  }

  if (
    dados &&
    Array.isArray(dados.usuarios)
  ) {
    return dados.usuarios;
  }

  if (
    dados &&
    typeof dados === "object"
  ) {

    return Object.values(
      dados
    );
  }

  return [];
}


// ======================================================
// TELEGRAM - OBTÉM CHAT ID
// ======================================================

function obterChatId(
  usuario
) {

  if (
    usuario === null ||
    usuario === undefined
  ) {
    return null;
  }

  if (
    typeof usuario === "string" ||
    typeof usuario === "number"
  ) {
    return String(
      usuario
    );
  }

  if (
    typeof usuario !== "object"
  ) {
    return null;
  }

  const possiveis = [
    usuario.chatId,
    usuario.chat_id,
    usuario.telegramChatId,
    usuario.telegram_chat_id,
    usuario.id
  ];

  for (
    const valor of possiveis
  ) {

    if (
      valor !== undefined &&
      valor !== null &&
      String(valor).trim() !== ""
    ) {

      return String(
        valor
      );
    }
  }

  return null;
}


// ======================================================
// TELEGRAM - FORMATA NÚMERO
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
// TELEGRAM - FORMATA VALOR
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
      minimumFractionDigits: casas,
      maximumFractionDigits: casas
    }
  );
}


// ======================================================
// TELEGRAM - PERCENTUAL
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
    ((a - i) / i) * 100
  );
}


// ======================================================
// TELEGRAM - ESCAPE HTML
// ======================================================

function escapeHtml(
  valor
) {

  return String(valor)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}


// ======================================================
// TELEGRAM - ERRO DE MENSAGEM APAGADA
// ======================================================

function mensagemTelegramNaoExiste(
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

  return (
    texto.includes(
      "message to edit not found"
    ) ||
    texto.includes(
      "message identifier is not valid"
    ) ||
    texto.includes(
      "message can't be edited"
    ) ||
    texto.includes(
      "message to delete not found"
    ) ||
    texto.includes(
      "message_id_invalid"
    ) ||
    texto.includes(
      "message not found"
    )
  );
}


// ======================================================
// TELEGRAM - ENVIA NOVA MENSAGEM
// ======================================================

async function criarMensagemTelegram(
  chatId,
  texto
) {

  if (!TELEGRAM_API) {

    console.warn(
      "[Telegram] TELEGRAM_TOKEN não configurado."
    );

    return null;
  }

  try {

    const resposta =
      await axios.post(
        `${TELEGRAM_API}/sendMessage`,
        {
          chat_id: chatId,
          text: texto,
          parse_mode: "HTML",
          disable_web_page_preview: true
        },
        {
          timeout: 10000
        }
      );

    if (
      !resposta.data ||
      !resposta.data.ok
    ) {

      console.error(
        `[Telegram] Telegram recusou envio para ${chatId}:`,
        resposta.data
      );

      return null;
    }

    const messageId =
      resposta.data?.result?.message_id;

    if (
      !messageId
    ) {

      console.error(
        `[Telegram] Telegram não retornou message_id para ${chatId}.`
      );

      return null;
    }

    return messageId;

  } catch (erro) {

    console.error(
      `[Telegram] Erro criando mensagem para ${chatId}:`,
      erro.response?.data ||
      erro.message
    );

    return null;
  }
}


// ======================================================
// TELEGRAM - EDITA MENSAGEM
// ======================================================

async function editarMensagemTelegram(
  chatId,
  messageId,
  texto
) {

  if (!TELEGRAM_API) {
    return {
      ok: false,
      mensagemNaoExiste: false
    };
  }

  try {

    const resposta =
      await axios.post(
        `${TELEGRAM_API}/editMessageText`,
        {
          chat_id: chatId,
          message_id: messageId,
          text: texto,
          parse_mode: "HTML",
          disable_web_page_preview: true
        },
        {
          timeout: 10000
        }
      );

    if (
      resposta.data?.ok
    ) {

      return {
        ok: true,
        mensagemNaoExiste: false
      };
    }

    return {
      ok: false,
      mensagemNaoExiste: false
    };

  } catch (erro) {

    return {
      ok: false,
      mensagemNaoExiste:
        mensagemTelegramNaoExiste(
          erro
        ),
      erro
    };
  }
}


// ======================================================
// TELEGRAM - ATUALIZA MENSAGEM
// ======================================================

async function atualizarMensagemTelegram(
  chatId,
  texto
) {

  if (!TELEGRAM_API) {
    return;
  }

  if (
    !chatId
  ) {
    return;
  }

  const agora =
    Date.now();

  const ultimoTexto =
    telegramLastText.get(
      String(chatId)
    );

  const ultimoUpdate =
    telegramLastUpdate.get(
      String(chatId)
    ) || 0;

  // Evita requisições desnecessárias.
  // Mas não bloqueia a criação inicial.
  if (
    ultimoTexto === texto &&
    agora - ultimoUpdate <
      TELEGRAM_MIN_UPDATE_INTERVAL
  ) {
    return;
  }

  const mensagens =
    carregarMensagensTelegram();

  const chatKey =
    String(chatId);

  const registro =
    mensagens[chatKey];

  // ====================================================
  // EXISTE MESSAGE_ID SALVO
  // ====================================================

  if (
    registro &&
    registro.messageId
  ) {

    const resultado =
      await editarMensagemTelegram(
        chatId,
        registro.messageId,
        texto
      );

    // ================================================
    // EDIÇÃO FUNCIONOU
    // ================================================

    if (
      resultado.ok
    ) {

      telegramLastText.set(
        chatKey,
        texto
      );

      telegramLastUpdate.set(
        chatKey,
        agora
      );

      mensagens[chatKey] = {
        ...registro,
        messageId:
          registro.messageId,
        updatedAt:
          agora
      };

      salvarMensagensTelegram(
        mensagens
      );

      return;
    }

    // ================================================
    // MENSAGEM NÃO EXISTE MAIS
    // ================================================

    if (
      resultado.mensagemNaoExiste
    ) {

      console.log(
        `[Telegram] Mensagem ${registro.messageId} ` +
        `do chat ${chatId} não existe mais.`
      );

      console.log(
        `[Telegram] Removendo message_id inválido ` +
        `e criando uma nova mensagem.`
      );

      delete mensagens[chatKey];

      salvarMensagensTelegram(
        mensagens
      );

    } else {

      // Outro erro.
      // Não devemos apagar o message_id,
      // porque o problema pode ser temporário.
      console.warn(
        `[Telegram] Não foi possível editar a mensagem ` +
        `${registro.messageId} do chat ${chatId}.`
      );

      return;
    }
  }

  // ====================================================
  // NÃO EXISTE MESSAGE_ID
  // OU O ANTIGO FOI APAGADO
  // ====================================================

  const novoMessageId =
    await criarMensagemTelegram(
      chatId,
      texto
    );

  if (
    !novoMessageId
  ) {
    return;
  }

  // ====================================================
  // SALVA NOVO MESSAGE_ID
  // ====================================================

  mensagens[chatKey] = {
    messageId:
      novoMessageId,
    createdAt:
      agora,
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

  console.log(
    `[Telegram] Nova mensagem criada para ${chatId}. ` +
    `message_id=${novoMessageId}`
  );
}


// ======================================================
// TELEGRAM - ENVIA PARA TODOS OS USUÁRIOS
// ======================================================

async function atualizarTelegram(
  dados
) {

  if (!TELEGRAM_API) {

    console.warn(
      "[Telegram] TELEGRAM_TOKEN não configurado."
    );

    return;
  }

  const usuarios =
    carregarUsuariosTelegram();

  if (
    !usuarios ||
    usuarios.length === 0
  ) {

    console.warn(
      "[Telegram] Nenhum usuário encontrado em users.json."
    );

    return;
  }

  const texto =
    formatarMensagemMargem(
      dados
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
// TELEGRAM - FORMATA MENSAGEM
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

  let sinal = "";

  if (
    percentual > 0
  ) {
    sinal = "🟢";
  } else if (
    percentual < 0
  ) {
    sinal = "🔴";
  } else {
    sinal = "⚪";
  }

  const atualizado =
    new Date()
      .toLocaleString(
        "pt-BR",
        {
          timeZone: "America/Sao_Paulo"
        }
      );

  return (
    `━━━━━━━━━━━━━━━\n` +
    `📊 <b>MARGEM DA CONTA</b>\n` +
    `━━━━━━━━━━━━━━━\n\n` +

    `💰 <b>Wallet Balance:</b> ` +
    `${formatarNumero(wallet, 2)} USDT\n` +

    `💵 <b>Margin Balance:</b> ` +
    `${formatarNumero(margin, 2)} USDT\n` +

    `💳 <b>Disponível:</b> ` +
    `${formatarNumero(available, 2)} USDT\n\n` +

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
    `${escapeHtml(atualizado)}\n` +

    `━━━━━━━━━━━━━━━`
  );
}


// ======================================================
// GET BALANCE FUTURES
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

    // ==================================================
    // FORMATO /fapi/v2/account
    // ==================================================

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

    const walletBalance =
      numero(
        usdt.walletBalance
      );

    const marginBalance =
      numero(
        usdt.marginBalance
      );

    const availableBalance =
      numero(
        usdt.availableBalance ??
        resposta.availableBalance
      );

    const initialMargin =
      numero(
        usdt.initialMargin
      );

    const maintMargin =
      numero(
        usdt.maintMargin
      );

    return {

      asset: "USDT",

      walletBalance,

      marginBalance,

      availableBalance,

      initialMargin,

      maintMargin,

      raw: usdt
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
// SINCRONIZA HORÁRIO
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
      "[margWorker] Não foi possível sincronizar horário:",
      erro.message
    );
  }
}


// ======================================================
// TIMESTAMP BINANCE
// ======================================================

function timestampBinance() {

  return (
    Date.now() +
    serverTimeOffset
  );
}


// ======================================================
// HISTÓRICO DE BALANÇO
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
// MONITORAMENTO DA MARGEM
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
  // BALANCE HIST
  // ====================================================

  let balanceHist =
    obterHistoricoBalance();

  balanceHist.push({
    timestamp: agora,
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

  // Limita o histórico para evitar crescimento infinito.
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

  // Primeira execução.
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

      timestamp:
        agora
    };

    salvarJson(
      OLD_BALANCE_FILE,
      oldBalance
    );
  }

  // ====================================================
  // CÁLCULO
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
  // MÁXIMO / MÍNIMO
  // ====================================================

  let maxPercentual =
    numero(
      oldBalance.maxPercentual,
      8
    );

  let minPercentual =
    numero(
      oldBalance.minPercentual,
      8
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

  if (
    balanceHist.length <= 1
  ) {

    maxPercentual =
      percentual;

    minPercentual =
      percentual;

  } else {

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
  }

  // ====================================================
  // SALVA BALANCE ATUAL
  // ====================================================

  salvarJson(
    BALANCE_FILE,
    {
      ...balance,
      percentual,
      percentualReal,
      maxPercentual,
      minPercentual,
      timestamp: agora
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

  // Mantém compatibilidade
  // com o processo principal.
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
        "[margWorker] Erro enviando status ao parent:",
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
  // VERIFICA STOP / TAKE
  // ====================================================

  const limiteStop =
    percentual <= SLDIA;

  const limiteTake =
    percentual >= TPDIA;

  const limiteEmergencia =
    percentual >= 90;

  // ====================================================
  // LIMITE DE EMERGÊNCIA
  // ====================================================

  if (
    limiteEmergencia
  ) {

    console.log(
      `[margWorker] ⚠️ Margem atingiu ` +
      `${percentual.toFixed(4)}%.`
    );

    resetCount.count++;

    resetHist.push({
      timestamp: agora,
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

    // Atualiza referência para impedir
    // que o próximo ciclo compare com
    // uma referência antiga.
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

    return;
  }

  // ====================================================
  // TAKE PROFIT DE MARGEM
  // ====================================================

  if (
    limiteTake
  ) {

    console.log(
      `[margWorker] 🟢 Take de margem atingido: ` +
      `${percentual.toFixed(4)}%`
    );

    resetCount.count++;

    resetHist.push({
      timestamp: agora,
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

    // Pausa os workers de entrada.
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

    // Importante:
    // O api.js fornecido não possui uma função
    // para listar e fechar todas as posições.
    //
    // Portanto não inventamos uma chamada aqui.
    // O fechamento global deve ser implementado
    // no api.js antes de ser utilizado.
    console.log(
      "[margWorker] Fechamento global não executado: " +
      "api.js não expõe função para fechar todas as posições."
    );

    // Atualiza referência.
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
  // STOP LOSS DE MARGEM
  // ====================================================

  if (
    limiteStop
  ) {

    console.log(
      `[margWorker] 🔴 Stop de margem atingido: ` +
      `${percentual.toFixed(4)}%`
    );

    resetCount.count++;

    resetHist.push({
      timestamp: agora,
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

    // Pausa os workers.
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

    // Assim como no take:
    // não existe no api.js atual uma função
    // segura para fechar todas as posições.
    console.log(
      "[margWorker] Fechamento global não executado: " +
      "api.js não expõe função para fechar todas as posições."
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
  // ATUALIZA REFERÊNCIA NORMAL
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
// MENSAGEM DO PARENT
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
          "[margWorker] Erro processando mensagem:",
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
    `[margWorker] Cache: ${CACHE_DIR}`
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

  // Primeira execução imediatamente.
  await startWorker();

  // ====================================================
  // CICLO DE 10 SEGUNDOS
  // ====================================================

  setInterval(
    async () => {

      await startWorker();

    },
    10000
  );

})();