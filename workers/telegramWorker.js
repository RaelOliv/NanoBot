const fs = require("fs");
const path = require("path");
const axios = require("axios");
const crypto = require("crypto");

require("dotenv").config();

// =====================================================
// CONFIGURAÇÕES
// =====================================================

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

if (!TELEGRAM_TOKEN) {
  console.error("❌ TELEGRAM_TOKEN não definido no .env");
  process.exit(1);
}

const TELEGRAM_API =
  `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;

const BINANCE_API =
  process.env.BINANCE_FUTURES_URL || "https://fapi.binance.com";

const CACHE_DIR = path.resolve(__dirname, "cache");

const CACHE_PATH =
  path.resolve(CACHE_DIR, "cachepos.json");

const USERS_PATH =
  path.resolve(CACHE_DIR, "users.json");

// Guarda os IDs das mensagens do Telegram.
// Isso permite editar a mesma mensagem mesmo depois
// que o worker seja reiniciado.
const TELEGRAM_MESSAGES_PATH =
  path.resolve(CACHE_DIR, "telegramMessages.json");

// -----------------------------------------------------
// Debounce de fechamento
// -----------------------------------------------------

// Aguarda alguns segundos antes de considerar definitivamente
// que a posição foi encerrada.
//
// Isso evita o problema que tivemos anteriormente:
// o positionWorker atualiza o cache por um instante,
// o Telegram interpreta como fechamento e manda a mensagem
// antes que a posição esteja realmente encerrada na Binance.
const CLOSE_DEBOUNCE_MS = 5000;

// Intervalo principal do worker.
const CHECK_INTERVAL_MS = 4000;

// Margem utilizada na consulta aos trades da Binance.
const TRADE_TIME_BUFFER_MS = 5000;


// =====================================================
// PREPARAÇÃO DOS ARQUIVOS
// =====================================================

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

if (!fs.existsSync(USERS_PATH)) {
  fs.writeFileSync(USERS_PATH, "{}");
}

if (!fs.existsSync(TELEGRAM_MESSAGES_PATH)) {
  fs.writeFileSync(TELEGRAM_MESSAGES_PATH, "{}");
}


// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function numero(valor, padrao = 0) {
  const n = Number(valor);

  return Number.isFinite(n) ? n : padrao;
}


function formatarNumero(valor, casas = 4) {
  const n = numero(valor);

  return n.toFixed(casas);
}


function formatarUSDT(valor) {
  const n = numero(valor);

  if (n >= 0) {
    return `🟩 +${n.toFixed(4)} USDT`;
  }

  return `🟥 ${n.toFixed(4)} USDT`;
}


function formatarPercentual(valor) {
  const n = numero(valor);

  if (n >= 0) {
    return `📈 +${n.toFixed(2)}%`;
  }

  return `📉 ${n.toFixed(2)}%`;
}


function formatarDuracao(openedAt, closedAt) {
  const inicio = new Date(openedAt);
  const fim = new Date(closedAt);

  const durMs = fim - inicio;

  if (!Number.isFinite(durMs) || durMs < 0) {
    return "0min";
  }

  const durMin = Math.floor(durMs / 60000);

  const durHr = Math.floor(durMin / 60);

  if (durHr > 0) {
    return `${durHr}h ${durMin % 60}min`;
  }

  return `${durMin}min`;
}


// =====================================================
// CACHE
// =====================================================

function carregarCache() {
  try {
    if (!fs.existsSync(CACHE_PATH)) {
      return {};
    }

    const data =
      fs.readFileSync(CACHE_PATH, "utf8");

    return JSON.parse(data || "{}");

  } catch (err) {

    console.error(
      "[telegramWorker] Erro ao carregar cache:",
      err.message
    );

    return {};
  }
}


// =====================================================
// USUÁRIOS
// =====================================================

function carregarUsuarios() {
  try {

    const data =
      fs.readFileSync(USERS_PATH, "utf8");

    return JSON.parse(data || "{}");

  } catch (err) {

    console.error(
      "[telegramWorker] Erro ao carregar usuários:",
      err.message
    );

    return {};
  }
}


function salvarUsuarios(users) {
  try {

    fs.writeFileSync(
      USERS_PATH,
      JSON.stringify(users, null, 2)
    );

  } catch (err) {

    console.error(
      "[telegramWorker] Erro ao salvar usuários:",
      err.message
    );
  }
}


// =====================================================
// MENSAGENS DO TELEGRAM
// =====================================================

function carregarMensagensTelegram() {
  try {

    if (!fs.existsSync(TELEGRAM_MESSAGES_PATH)) {
      return {};
    }

    const data =
      fs.readFileSync(
        TELEGRAM_MESSAGES_PATH,
        "utf8"
      );

    return JSON.parse(data || "{}");

  } catch (err) {

    console.error(
      "[telegramWorker] Erro ao carregar mensagens:",
      err.message
    );

    return {};
  }
}


function salvarMensagensTelegram(messages) {
  try {

    fs.writeFileSync(
      TELEGRAM_MESSAGES_PATH,
      JSON.stringify(messages, null, 2)
    );

  } catch (err) {

    console.error(
      "[telegramWorker] Erro ao salvar mensagens:",
      err.message
    );
  }
}


let mensagensTelegram =
  carregarMensagensTelegram();


// =====================================================
// DETECTAR USUÁRIOS
// =====================================================

async function obterUsuarios() {

  try {

    const res =
      await axios.get(
        `${TELEGRAM_API}/getUpdates`,
        {
          timeout: 15000
        }
      );

    const updates =
      res.data?.result || [];

    const users =
      carregarUsuarios();

    for (const up of updates) {

      const msg = up.message;

      if (
        !msg ||
        !msg.chat ||
        !msg.chat.id
      ) {
        continue;
      }

      const id = msg.chat.id;

      if (!users[id]) {

        users[id] = {

          first_name:
            msg.chat.first_name ||
            "Usuário",

          username:
            msg.chat.username ||
            null,

          active: true
        };

        console.log(
          `👤 Novo usuário detectado: ` +
          `${users[id].first_name} (${id})`
        );
      }
    }

    salvarUsuarios(users);

    return users;

  } catch (err) {

    console.error(
      "[telegramWorker] Erro ao obter usuários:",
      err.message
    );

    return carregarUsuarios();
  }
}


// =====================================================
// TELEGRAM - ENVIAR
// =====================================================

async function enviarMensagem(
  uid,
  texto
) {

  try {

    const res =
      await axios.post(
        `${TELEGRAM_API}/sendMessage`,
        {
          chat_id: uid,
          text: texto,
          parse_mode: "HTML"
        },
        {
          timeout: 15000
        }
      );

    return res.data?.result || null;

  } catch (err) {

    const status =
      err.response?.status;

    if (
      status === 429 ||
      status === 418
    ) {

      const retryAfter =
        Number(
          err.response?.data
            ?.parameters
            ?.retry_after
        ) ||
        Number(
          err.response?.headers
            ?.["retry-after"]
        ) ||
        5;

      console.error(
        `[Telegram] Rate limit. ` +
        `Aguardando ${retryAfter}s.`
      );

      await sleep(
        (retryAfter + 1) * 1000
      );

      try {

        const retry =
          await axios.post(
            `${TELEGRAM_API}/sendMessage`,
            {
              chat_id: uid,
              text: texto,
              parse_mode: "HTML"
            },
            {
              timeout: 15000
            }
          );

        return retry.data?.result || null;

      } catch (retryErr) {

        console.error(
          `[Telegram] Falha no retry ` +
          `para ${uid}:`,
          retryErr.message
        );

        return null;
      }
    }

    console.error(
      `[Telegram] Falha ao enviar ` +
      `mensagem para ${uid}:`,
      err.message
    );

    return null;
  }
}


// =====================================================
// TELEGRAM - EDITAR
// =====================================================

async function editarMensagem(
  uid,
  messageId,
  texto
) {

  try {

    const res =
      await axios.post(
        `${TELEGRAM_API}/editMessageText`,
        {
          chat_id: uid,
          message_id: messageId,
          text: texto,
          parse_mode: "HTML"
        },
        {
          timeout: 15000
        }
      );

    return res.data;

  } catch (err) {

    const status =
      err.response?.status;

    // Quando o conteúdo é exatamente igual,
    // Telegram pode retornar "message is not modified".
    if (
      err.response?.data?.description
        ?.toLowerCase()
        ?.includes("message is not modified")
    ) {
      return null;
    }

    if (
      status === 429 ||
      status === 418
    ) {

      const retryAfter =
        Number(
          err.response?.data
            ?.parameters
            ?.retry_after
        ) ||
        Number(
          err.response?.headers
            ?.["retry-after"]
        ) ||
        5;

      console.error(
        `[Telegram] Rate limit ao editar. ` +
        `Aguardando ${retryAfter}s.`
      );

      await sleep(
        (retryAfter + 1) * 1000
      );

      try {

        return await axios.post(
          `${TELEGRAM_API}/editMessageText`,
          {
            chat_id: uid,
            message_id: messageId,
            text: texto,
            parse_mode: "HTML"
          },
          {
            timeout: 15000
          }
        );

      } catch (retryErr) {

        console.error(
          `[Telegram] Falha no retry ` +
          `da edição para ${uid}:`,
          retryErr.message
        );

        return null;
      }
    }

    console.error(
      `[Telegram] Falha ao editar ` +
      `mensagem ${messageId} ` +
      `para ${uid}:`,
      err.message
    );

    return null;
  }
}


// =====================================================
// ENVIAR PARA TODOS
// =====================================================

async function enviarMensagemParaTodos(
  usuarios,
  texto
) {

  for (
    const uid of Object.keys(usuarios)
  ) {

    const usuario =
      usuarios[uid];

    if (!usuario.active) {
      continue;
    }

    const mensagem =
      await enviarMensagem(
        uid,
        texto
      );

    if (mensagem?.message_id) {

      return mensagem;
    }
  }

  return null;
}


// =====================================================
// BINANCE - ASSINATURA
// =====================================================

function criarQueryAssinada(params) {

  const query =
    new URLSearchParams(params)
      .toString();

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
  openedAt,
  closedAt
) {

  if (!API_KEY || !SECRET_KEY) {

    console.error(
      "[telegramWorker] " +
      "API_KEY/SECRET_KEY não definidos."
    );

    return [];
  }

  try {

    const inicio =
      Math.max(
        0,
        new Date(openedAt).getTime() -
          TRADE_TIME_BUFFER_MS
      );

    const fim =
      new Date(closedAt).getTime() +
      TRADE_TIME_BUFFER_MS;

    const timestamp =
      Date.now();

    const query =
      criarQueryAssinada({

        symbol,

        startTime:
          Math.floor(inicio),

        endTime:
          Math.floor(fim),

        limit: 1000,

        recvWindow: 10000,

        timestamp
      });

    const url =
      `${BINANCE_API}/fapi/v1/userTrades?${query}`;

    const res =
      await axios.get(
        url,
        {
          headers: {
            "X-MBX-APIKEY": API_KEY
          },
          timeout: 15000
        }
      );

    return Array.isArray(res.data)
      ? res.data
      : [];

  } catch (err) {

    console.error(
      `[Binance] Erro ao buscar ` +
      `userTrades de ${symbol}:`,
      err.response?.data ||
      err.message
    );

    return [];
  }
}


// =====================================================
// CALCULAR DADOS REAIS DA OPERAÇÃO
// =====================================================

async function calcularResultadoReal(
  symbol,
  pos
) {

  const openedAt =
    pos.openedAt
      ? new Date(pos.openedAt)
      : new Date();

  const closedAt =
    pos.closedAt
      ? new Date(pos.closedAt)
      : new Date();

  const trades =
    await buscarUserTrades(
      symbol,
      openedAt,
      closedAt
    );

  if (!trades.length) {

    console.warn(
      `[Binance] Nenhum trade encontrado ` +
      `para ${symbol} no período da operação.`
    );

    return {
      encontrado: false,

      grossPnl:
        numero(
          pos.realizedPnl ||
          pos.pnl ||
          0
        ),

      commission: 0,

      netPnl:
        numero(
          pos.realizedPnl ||
          pos.pnl ||
          0
        ),

      exitPrice:
        numero(
          pos.markPrice ||
          pos.exitPrice ||
          pos.entryPrice
        ),

      closedAt
    };
  }


  // ---------------------------------------------------
  // P&L realizado
  // ---------------------------------------------------

  let grossPnl = 0;

  // ---------------------------------------------------
  // Comissão
  // ---------------------------------------------------

  let commissionUSDT = 0;

  // ---------------------------------------------------
  // Preço de saída ponderado
  // ---------------------------------------------------

  let exitQty = 0;

  let exitValue = 0;

  let lastTradeTime =
    closedAt.getTime();


  for (const trade of trades) {

    const realizedPnl =
      numero(
        trade.realizedPnl
      );

    grossPnl +=
      realizedPnl;


    // -----------------------------------------------
    // Comissão
    // -----------------------------------------------

    const commission =
      numero(
        trade.commission
      );

    const commissionAsset =
      trade.commissionAsset;

    if (
      commissionAsset === "USDT"
    ) {

      commissionUSDT +=
        commission;
    } else if (
      commission !== 0
    ) {

      console.warn(
        `[Binance] Comissão de ${symbol} ` +
        `em ${commissionAsset}: ${commission}. ` +
        `Não convertida para USDT.`
      );
    }


    // -----------------------------------------------
    // Horário
    // -----------------------------------------------

    const tradeTime =
      numero(
        trade.time
      );

    if (
      tradeTime >
      lastTradeTime
    ) {

      lastTradeTime =
        tradeTime;
    }


    // -----------------------------------------------
    // Identificação dos fills de fechamento
    //
    // realizedPnl diferente de zero indica que
    // aquele fill realizou PNL.
    // -----------------------------------------------

    if (
      Math.abs(realizedPnl) >
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

        exitQty += qty;

        exitValue +=
          price * qty;
      }
    }
  }


  let exitPrice =
    numero(
      pos.markPrice ||
      pos.exitPrice ||
      pos.entryPrice
    );


  if (
    exitQty > 0 &&
    exitValue > 0
  ) {

    exitPrice =
      exitValue /
      exitQty;
  }


  const netPnl =
    grossPnl -
    commissionUSDT;


  const realClosedAt =
    new Date(lastTradeTime);


  return {

    encontrado: true,

    trades,

    grossPnl,

    commission:
      commissionUSDT,

    netPnl,

    exitPrice,

    closedAt:
      realClosedAt
  };
}


// =====================================================
// MENSAGEM - POSIÇÃO ABERTA
// =====================================================

function gerarMensagemInicial(pos) {

  const entry =
    numero(
      pos.entryPrice
    );

  const qty =
    numero(
      pos.positionAmt
    );

  const leverage =
    numero(
      pos.leverage,
      1
    );

  return (

    `━━━━━━━━━━━━━━━\n` +

    `📊 <b>${pos.symbol}</b>\n` +

    `━━━━━━━━━━━━━━━\n` +

    `🟢 <b>Posição Aberta</b>\n` +

    `💵 Preço de entrada: ${entry}\n` +

    `📈 Lado: ${pos.positionSide || "BOTH"}\n` +

    `📊 Quantidade: ${qty}\n` +

    `⚙️ Alavancagem: ${leverage}x\n` +

    `🕒 Abertura: ` +

    `${new Date(pos.openedAt).toLocaleString()}\n` +

    `━━━━━━━━━━━━━━━`
  );
}


// =====================================================
// MENSAGEM - POSIÇÃO ATIVA
// =====================================================

function gerarMensagemAtiva(pos) {

  const entry =
    numero(
      pos.entryPrice
    );

  const mark =
    numero(
      pos.markPrice
    );

  const qty =
    numero(
      pos.positionAmt
    );

  const leverage =
    numero(
      pos.leverage,
      1
    );


  // ---------------------------------------------------
  // Mantemos o cálculo visual da posição ativa.
  // O resultado definitivo, no fechamento, vem da
  // Binance através de realizedPnl + commission.
  // ---------------------------------------------------

  const pnl =
    (
      mark -
      entry
    ) *
    qty *
    leverage;


  const pnlPct =
    entry !== 0
      ? (
          (mark - entry) /
          entry
        ) *
        100 *
        (qty >= 0 ? 1 : -1)
      : 0;


  const pnlFmt =
    formatarUSDT(
      pnl
    );

  const pctFmt =
    formatarPercentual(
      pnlPct
    );


  return (

    `━━━━━━━━━━━━━━━\n` +

    `📊 <b>${pos.symbol}</b>\n` +

    `━━━━━━━━━━━━━━━\n` +

    `🟡 <b>Posição Ativa</b>\n` +

    `💵 Entrada: ${entry}\n` +

    `💰 Preço atual: ${mark}\n` +

    `📊 Lucro atual: ${pnlFmt}\n` +

    `📉 Variação: ${pctFmt}\n` +

    `🕒 Abertura: ` +

    `${new Date(pos.openedAt).toLocaleString()}\n` +

    `━━━━━━━━━━━━━━━`
  );
}


// =====================================================
// MENSAGEM - POSIÇÃO ENCERRADA
// =====================================================

function gerarMensagemFinal(
  symbol,
  pos,
  resultado
) {

  const entry =
    numero(
      pos.entryPrice
    );

  const close =
    numero(
      resultado.exitPrice ||
      pos.markPrice ||
      entry
    );


  // ---------------------------------------------------
  // P&L bruto
  // ---------------------------------------------------

  const grossPnl =
    numero(
      resultado.grossPnl
    );


  // ---------------------------------------------------
  // Comissão
  // ---------------------------------------------------

  const commission =
    numero(
      resultado.commission
    );


  // ---------------------------------------------------
  // Resultado líquido
  // ---------------------------------------------------

  const netPnl =
    numero(
      resultado.netPnl
    );


  // ---------------------------------------------------
  // Variação percentual
  // ---------------------------------------------------

  const qty =
    numero(
      pos.positionAmt
    );


  const leverage =
    numero(
      pos.leverage,
      1
    );


  let pnlPct = 0;

  if (entry !== 0) {

    pnlPct =
      (
        (close - entry) /
        entry
      ) *
      100 *
      (qty >= 0 ? 1 : -1);
  }


  const openedAt =
    pos.openedAt
      ? new Date(pos.openedAt)
      : new Date();


  const closedAt =
    resultado.closedAt
      ? new Date(resultado.closedAt)
      : new Date();


  const durFmt =
    formatarDuracao(
      openedAt,
      closedAt
    );


  const grossFmt =
    formatarUSDT(
      grossPnl
    );


  const feeFmt =
    commission > 0
      ? `🔴 -${commission.toFixed(4)} USDT`
      : `🟢 0.0000 USDT`;


  const netFmt =
    formatarUSDT(
      netPnl
    );


  const pctFmt =
    formatarPercentual(
      pnlPct
    );


  return (

    `━━━━━━━━━━━━━━━\n` +

    `📊 <b>${symbol}</b>\n` +

    `━━━━━━━━━━━━━━━\n` +

    `⚫ <b>Posição Encerrada</b>\n` +

    `💵 Entrada: ${entry}\n` +

    `💸 Saída: ${close.toFixed(4)}\n` +

    `📊 P&L Bruto: ${grossFmt}\n` +

    `💳 Taxa Trading: ${feeFmt}\n` +

    `💰 <b>Resultado Líquido: ${netFmt}</b>\n` +

    `📉 Variação: ${pctFmt}\n` +

    `⏱️ Duração: ${durFmt}\n` +

    `🕒 Abertura: ${openedAt.toLocaleString()}\n` +

    `🕒 Fechamento: ${closedAt.toLocaleString()}\n` +

    `━━━━━━━━━━━━━━━`
  );
}


// =====================================================
// ESTADO DO WORKER
// =====================================================

let ultimoCache =
  carregarCache();

let usuarios = {};


// Evita que duas execuções de verificarAlteracoes()
// rodem simultaneamente.

let verificando = false;


// Timers de debounce por símbolo.

const timersFechamento =
  new Map();


// =====================================================
// IDENTIFICAR POSIÇÃO
// =====================================================

function chaveMensagem(
  uid,
  symbol
) {

  return `${uid}:${symbol}`;
}


// =====================================================
// SALVAR ID DA MENSAGEM
// =====================================================

function salvarMensagem(
  uid,
  symbol,
  messageId,
  estado
) {

  const chave =
    chaveMensagem(
      uid,
      symbol
    );

  mensagensTelegram[chave] = {

    message_id:
      messageId,

    state:
      estado,

    updatedAt:
      Date.now()
  };

  salvarMensagensTelegram(
    mensagensTelegram
  );
}


// =====================================================
// BUSCAR ID DA MENSAGEM
// =====================================================

function obterMensagem(
  uid,
  symbol
) {

  const chave =
    chaveMensagem(
      uid,
      symbol
    );

  return mensagensTelegram[chave];
}


// =====================================================
// REMOVER ID DA MENSAGEM
// =====================================================

function removerMensagem(
  uid,
  symbol
) {

  const chave =
    chaveMensagem(
      uid,
      symbol
    );

  delete mensagensTelegram[chave];

  salvarMensagensTelegram(
    mensagensTelegram
  );
}


// =====================================================
// ABRIR / ATUALIZAR POSIÇÃO
// =====================================================

async function processarPosicaoAtiva(
  symbol,
  pos
) {

  const textoInicial =
    gerarMensagemInicial(pos);

  const textoAtiva =
    gerarMensagemAtiva(pos);


  for (
    const uid of Object.keys(usuarios)
  ) {

    const usuario =
      usuarios[uid];

    if (!usuario.active) {
      continue;
    }


    const existente =
      obterMensagem(
        uid,
        symbol
      );


    // -------------------------------------------------
    // Ainda não existe mensagem
    // -------------------------------------------------

    if (!existente) {

      const mensagem =
        await enviarMensagem(
          uid,
          textoInicial
        );

      if (
        mensagem &&
        mensagem.message_id
      ) {

        salvarMensagem(
          uid,
          symbol,
          mensagem.message_id,
          "active"
        );
      }

      continue;
    }


    // -------------------------------------------------
    // Já existe mensagem.
    // Atualizamos a MESMA mensagem.
    // -------------------------------------------------

    if (
      existente.state === "active"
    ) {

      await editarMensagem(
        uid,
        existente.message_id,
        textoAtiva
      );

      salvarMensagem(
        uid,
        symbol,
        existente.message_id,
        "active"
      );
    }
  }
}


// =====================================================
// PROCESSAR FECHAMENTO
// =====================================================

async function processarFechamento(
  symbol,
  pos
) {

  // ---------------------------------------------------
  // Primeiro buscamos os dados reais da Binance.
  // ---------------------------------------------------

  const resultado =
    await calcularResultadoReal(
      symbol,
      pos
    );


  const textoFinal =
    gerarMensagemFinal(
      symbol,
      pos,
      resultado
    );


  for (
    const uid of Object.keys(usuarios)
  ) {

    const usuario =
      usuarios[uid];

    if (!usuario.active) {
      continue;
    }


    const existente =
      obterMensagem(
        uid,
        symbol
      );


    // -------------------------------------------------
    // Se a mensagem ativa existe,
    // EDITAMOS ela.
    // -------------------------------------------------

    if (
      existente &&
      existente.message_id
    ) {

      await editarMensagem(
        uid,
        existente.message_id,
        textoFinal
      );

      salvarMensagem(
        uid,
        symbol,
        existente.message_id,
        "closed"
      );

    } else {

      // ------------------------------------------------
      // Caso o worker tenha sido reiniciado e não tenha
      // o ID salvo, cria uma mensagem nova.
      // ------------------------------------------------

      const mensagem =
        await enviarMensagem(
          uid,
          textoFinal
        );

      if (
        mensagem &&
        mensagem.message_id
      ) {

        salvarMensagem(
          uid,
          symbol,
          mensagem.message_id,
          "closed"
        );
      }
    }
  }


  console.log(
    `🏁 ${symbol} encerrada | ` +
    `Bruto: ${resultado.grossPnl.toFixed(4)} | ` +
    `Taxa: ${resultado.commission.toFixed(4)} | ` +
    `Líquido: ${resultado.netPnl.toFixed(4)}`
  );
}


// =====================================================
// DEBOUNCE DE FECHAMENTO
// =====================================================

function agendarFechamento(
  symbol,
  pos
) {

  // Se já existe timer para esse símbolo,
  // não criamos outro.

  if (
    timersFechamento.has(symbol)
  ) {

    return;
  }


  console.log(
    `⏳ ${symbol}: possível fechamento detectado. ` +
    `Aguardando ${CLOSE_DEBOUNCE_MS / 1000}s...`
  );


  const timer =
    setTimeout(
      async () => {

        timersFechamento.delete(
          symbol
        );


        // ------------------------------------------------
        // Antes de confirmar o fechamento,
        // verificamos novamente o cache.
        // ------------------------------------------------

        const cacheAtual =
          carregarCache();


        const posAtual =
          cacheAtual[symbol];


        // ------------------------------------------------
        // Se voltou a ficar ativa, o fechamento era falso.
        // ------------------------------------------------

        if (
          posAtual &&
          posAtual.active
        ) {

          console.log(
            `↩️ ${symbol}: posição voltou a ficar ativa. ` +
            `Fechamento cancelado.`
          );

          return;
        }


        // ------------------------------------------------
        // Continua fechada.
        // ------------------------------------------------

        try {

          await processarFechamento(
            symbol,
            pos
          );

        } catch (err) {

          console.error(
            `[telegramWorker] Erro ao ` +
            `processar fechamento de ${symbol}:`,
            err.message
          );
        }

      },
      CLOSE_DEBOUNCE_MS
    );


  timersFechamento.set(
    symbol,
    timer
  );
}


// =====================================================
// CANCELAR DEBOUNCE
// =====================================================

function cancelarFechamento(
  symbol
) {

  const timer =
    timersFechamento.get(
      symbol
    );

  if (!timer) {
    return;
  }

  clearTimeout(timer);

  timersFechamento.delete(
    symbol
  );

  console.log(
    `↩️ ${symbol}: debounce de fechamento cancelado.`
  );
}


// =====================================================
// VERIFICAR ALTERAÇÕES
// =====================================================

async function verificarAlteracoes() {

  if (verificando) {
    return;
  }

  verificando = true;


  try {

    const novoCache =
      carregarCache();


    // =================================================
    // 1. POSIÇÕES QUE ESTÃO NO CACHE ATUAL
    // =================================================

    for (
      const symbol of Object.keys(novoCache)
    ) {

      const nova =
        novoCache[symbol];

      const antiga =
        ultimoCache[symbol];


      // -----------------------------------------------
      // POSIÇÃO ATIVA
      // -----------------------------------------------

      if (
        nova &&
        nova.active
      ) {

        // Se existia um debounce de fechamento,
        // cancelamos porque a posição está ativa.

        cancelarFechamento(
          symbol
        );


        // ---------------------------------------------
        // Nova posição
        // ---------------------------------------------

        if (
          !antiga ||
          !antiga.active
        ) {

          await processarPosicaoAtiva(
            symbol,
            nova
          );

          continue;
        }


        // ---------------------------------------------
        // Posição continua ativa.
        // Atualizamos a mesma mensagem.
        // ---------------------------------------------

        if (
          nova.markPrice !==
          antiga.markPrice
        ) {

          await processarPosicaoAtiva(
            symbol,
            nova
          );
        }


        continue;
      }


      // -----------------------------------------------
      // POSIÇÃO NÃO ESTÁ ATIVA
      // -----------------------------------------------

      if (
        antiga &&
        antiga.active &&
        (!nova || !nova.active)
      ) {

        agendarFechamento(
          symbol,
          antiga
        );
      }
    }


    // =================================================
    // 2. POSIÇÕES QUE SUMIRAM COMPLETAMENTE DO CACHE
    // =================================================

    for (
      const symbol of Object.keys(ultimoCache)
    ) {

      const antiga =
        ultimoCache[symbol];


      if (
        !antiga ||
        !antiga.active
      ) {
        continue;
      }


      if (
        !Object.prototype.hasOwnProperty.call(
          novoCache,
          symbol
        )
      ) {

        agendarFechamento(
          symbol,
          antiga
        );
      }
    }


    ultimoCache =
      novoCache;

  } catch (err) {

    console.error(
      "[telegramWorker] Erro em verificarAlteracoes:",
      err.message
    );

  } finally {

    verificando = false;
  }
}


// =====================================================
// INICIALIZAÇÃO
// =====================================================

(async () => {

  console.log(
    "🤖 Iniciando Telegram Worker..."
  );


  if (!API_KEY) {

    console.warn(
      "⚠️ API_KEY não definida. " +
      "O P&L/taxa reais da Binance não poderão ser consultados."
    );
  }


  if (!SECRET_KEY) {

    console.warn(
      "⚠️ SECRET_KEY não definida. " +
      "O cálculo de comissão via userTrades não funcionará."
    );
  }


  usuarios =
    await obterUsuarios();


  if (
    Object.keys(usuarios).length === 0
  ) {

    console.log(
      "⚠️ Nenhum usuário detectado."
    );

    console.log(
      "Envie uma mensagem ao bot no Telegram."
    );

    // Não encerramos o worker.
    // Ele continuará tentando encontrar usuários.
  }


  console.log(
    `✅ Telegram Worker iniciado ` +
    `(${Object.keys(usuarios).length} usuários)`
  );


  // ---------------------------------------------------
  // Primeira verificação imediatamente.
  // ---------------------------------------------------

  await verificarAlteracoes();


  // ---------------------------------------------------
  // Loop principal
  // ---------------------------------------------------

  setInterval(
    async () => {

      try {

        usuarios =
          await obterUsuarios();

        await verificarAlteracoes();

      } catch (err) {

        console.error(
          "[telegramWorker] Erro no ciclo:",
          err.message
        );
      }

    },
    CHECK_INTERVAL_MS
  );

})();