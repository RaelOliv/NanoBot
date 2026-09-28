const fs = require("fs");
const path = require("path");
const axios = require("axios");

require("dotenv").config();

const {
  parentPort
} = require("worker_threads");

const api = require("../api");
const {
  activatePause
} = require("./pauseManager");

// ======================================================
// CONFIGURAÇÕES
// ======================================================

const TELEGRAM_TOKEN =
  process.env.TELEGRAM_TOKEN;

const TELEGRAM_API =
  TELEGRAM_TOKEN
    ? `https://api.telegram.org/bot${TELEGRAM_TOKEN}`
    : null;

const BASE_URL =
  process.env.BASE_URL ||
  "https://fapi.binance.com";

const SLDIA =
  parseFloat(
    process.env.SLDIA || "-10"
  );

const TPDIA =
  parseFloat(
    process.env.TPDIA || "10"
  );

// ======================================================
// DIRETÓRIOS
// ======================================================

// margWorker.js está em:
// NanoBot/workers/margWorker.js
//
// Cache deste worker:
// NanoBot/workers/cache/
//
// Cache global do sistema:
// NanoBot/cache/

const WORKER_CACHE_DIR =
  path.resolve(
    __dirname,
    "cache"
  );

const GLOBAL_CACHE_DIR =
  path.resolve(
    __dirname,
    "..",
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

// IMPORTANTE:
// users.json fica em:
//
// NanoBot/cache/users.json

const USERS_FILE =
  path.join(
    GLOBAL_CACHE_DIR,
    "users.json"
  );

// Este arquivo fica em:
//
// NanoBot/workers/cache/telegramMarginMessages.json

const TELEGRAM_MESSAGES_FILE =
  path.join(
    WORKER_CACHE_DIR,
    "telegramMarginMessages.json"
  );

// ======================================================
// CONTROLE
// ======================================================

let workerRunning = false;

let serverTimeOffset = 0;

// Controle individual por chat.
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
// GARANTE DIRETÓRIOS
// ======================================================

function garantirDiretorios() {

  try {

    fs.mkdirSync(
      WORKER_CACHE_DIR,
      {
        recursive: true
      }
    );

    fs.mkdirSync(
      GLOBAL_CACHE_DIR,
      {
        recursive: true
      }
    );

  } catch (erro) {

    console.error(
      "[margWorker] Erro criando diretórios:",
      erro.message
    );
  }
}

garantirDiretorios();

// ======================================================
// JSON - SALVAR
// ======================================================

function salvarJson(
  arquivo,
  dados
) {

  try {

    garantirDiretorios();

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
// JSON - LER
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
// CONVERTE NÚMERO
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
// TELEGRAM - CARREGAR USUÁRIOS
// ======================================================

function carregarUsuariosTelegram() {

  console.log(
    `[Telegram] Arquivo de usuários: ${USERS_FILE}`
  );

  const dados =
    lerJson(
      USERS_FILE,
      []
    );

  if (
    Array.isArray(dados)
  ) {

    console.log(
      `[Telegram] Usuários encontrados: ${dados.length}`
    );

    return dados;
  }

  if (
    dados &&
    Array.isArray(
      dados.users
    )
  ) {

    console.log(
      `[Telegram] Usuários encontrados: ${dados.users.length}`
    );

    return dados.users;
  }

  if (
    dados &&
    Array.isArray(
      dados.usuarios
    )
  ) {

    console.log(
      `[Telegram] Usuários encontrados: ${dados.usuarios.length}`
    );

    return dados.usuarios;
  }

  if (
    dados &&
    typeof dados === "object"
  ) {

    const usuarios =
      Object.values(
        dados
      );

    console.log(
      `[Telegram] Usuários encontrados: ${usuarios.length}`
    );

    return usuarios;
  }

  console.log(
    "[Telegram] Nenhum usuário encontrado."
  );

  return [];
}

// ======================================================
// TELEGRAM - CHAT ID
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

  const campos = [

    usuario.chatId,

    usuario.chat_id,

    usuario.telegramChatId,

    usuario.telegram_chat_id,

    usuario.id

  ];

  for (
    const valor of campos
  ) {

    if (
      valor !== undefined &&
      valor !== null &&
      String(
        valor
      ).trim() !== ""
    ) {

      return String(
        valor
      );
    }
  }

  return null;
}

// ======================================================
// TELEGRAM - CARREGA MESSAGE IDS
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
// TELEGRAM - SALVA MESSAGE IDS
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
// TELEGRAM - VERIFICA SE ERRO SIGNIFICA
// QUE A MENSAGEM NÃO EXISTE MAIS
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

  // Erros conhecidos do Telegram.
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

  // Alguns erros de Telegram relacionados
  // a identificador inválido vêm como 400.
  if (
    status === 400 &&
    (
      texto.includes(
        "message"
      ) &&
      (
        texto.includes(
          "edit"
        ) ||
        texto.includes(
          "identifier"
        )
      )
    )
  ) {

    return true;
  }

  return false;
}

// ======================================================
// TELEGRAM - CRIAR MENSAGEM
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

    return null;
  }

  try {

    console.log(
      `[Telegram] Criando nova mensagem para ${chatId}...`
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

    if (
      !resposta.data ||
      !resposta.data.ok
    ) {

      console.error(
        `[Telegram] Falha no sendMessage para ${chatId}:`,
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

    console.log(
      `[Telegram] Nova mensagem criada. ` +
      `chat=${chatId} message_id=${messageId}`
    );

    return messageId;

  } catch (erro) {

    console.error(
      `[Telegram] Erro no sendMessage para ${chatId}:`,
      erro.response?.data ||
      erro.message
    );

    return null;
  }
}

// ======================================================
// TELEGRAM - EDITAR MENSAGEM
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
      ok: false,
      mensagemNaoExiste: false
    };
  }

  try {

    console.log(
      `[Telegram] Editando mensagem ` +
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

    const descricao =
      erro?.response?.data?.description ||
      erro?.message ||
      "";

    console.warn(
      `[Telegram] Erro editando ` +
      `chat=${chatId} message_id=${messageId}: ` +
      `${descricao}`
    );

    return {
      ok: false,

      mensagemNaoExiste:
        mensagemNaoExisteMais(
          erro
        ),

      erro
    };
  }
}

// ======================================================
// TELEGRAM - ATUALIZA UMA MENSAGEM
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
  // CARREGA O ESTADO DO DISCO
  // ====================================================

  let mensagens =
    carregarMensagensTelegram();

  let registro =
    mensagens[
      chatKey
    ];

  // ====================================================
  // NÃO CRIAR/EDITAR REPETIDAMENTE
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
    registro &&
    registro.messageId
  ) {

    const messageId =
      registro.messageId;

    const resultado =
      await editarMensagemTelegram(
        chatId,
        messageId,
        texto
      );

    // ==================================================
    // EDIÇÃO FUNCIONOU
    // ==================================================

    if (
      resultado.ok
    ) {

      mensagens[
        chatKey
      ] = {

        messageId,

        createdAt:
          registro.createdAt ||
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

      return;
    }

    // ==================================================
    // A MENSAGEM FOI APAGADA
    // ==================================================

    if (
      resultado.mensagemNaoExiste
    ) {

      console.log(
        `[Telegram] ❌ A mensagem ` +
        `${messageId} do chat ${chatId} não existe mais.`
      );

      console.log(
        `[Telegram] ♻️ Removendo ID inválido do cache.`
      );

      delete mensagens[
        chatKey
      ];

      salvarMensagensTelegram(
        mensagens
      );

      // Atualiza a variável local.
      registro = null;

    } else {

      // =================================================
      // OUTRO ERRO
      // =================================================

      console.warn(
        `[Telegram] ⚠️ Não foi possível editar ` +
        `a mensagem ${messageId}.`
      );

      return;
    }
  }

  // ====================================================
  // NÃO EXISTE MESSAGE ID
  //
  // OU A MENSAGEM ANTIGA FOI APAGADA
  // ====================================================

  console.log(
    `[Telegram] 📤 Criando mensagem para ${chatId}.`
  );

  const novoMessageId =
    await criarMensagemTelegram(
      chatId,
      texto
    );

  if (
    !novoMessageId
  ) {

    console.error(
      `[Telegram] ❌ Não foi possível criar ` +
      `nova mensagem para ${chatId}.`
    );

    return;
  }

  // ====================================================
  // SALVA IMEDIATAMENTE O NOVO ID
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
    !salvou
  ) {

    console.error(
      `[Telegram] ⚠️ A mensagem foi criada ` +
      `mas não foi possível salvar o message_id.`
    );

  } else {

    console.log(
      `[Telegram] ✅ Novo message_id salvo: ` +
      `${novoMessageId}`
    );
  }

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
// TELEGRAM - ATUALIZA TODOS OS USUÁRIOS
// ======================================================

async function atualizarTelegram(
  dados
) {

  if (
    !TELEGRAM_API
  ) {

    console.warn(
      "[Telegram] Telegram desativado: token não encontrado."
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
        "[Telegram] Usuário ignorado: chat_id não encontrado."
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
        `[Telegram] Erro no chat ${chatId}:`,
        erro.message
      );
    }
  }
}

// ======================================================
// FORMATA MENSAGEM
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

    // /fapi/v2/account
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
      "[margWorker] Erro sincronizando horário:",
      erro.message
    );
  }
}

// ======================================================
// HISTÓRICO
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

  // Limite para não crescer infinitamente.
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
  // SALVA BALANCE
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
  // ENVIA PARA PARENT
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
        "[margWorker] Erro no parentPort:",
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
  // TAKE
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
  // STOP
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
    `[margWorker] GLOBAL_CACHE_DIR: ${GLOBAL_CACHE_DIR}`
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

  // Primeira execução.
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