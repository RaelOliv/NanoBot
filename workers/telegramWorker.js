const fs = require("fs");
const path = require("path");
const axios = require("axios");
const crypto = require("crypto");
require("dotenv").config();

// ============================================================
// CONFIGURAÇÕES
// ============================================================

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;
const BINANCE_API = "https://fapi.binance.com";

const CACHE_DIR = path.resolve(__dirname, "cache");
const CACHE_PATH = path.resolve(CACHE_DIR, "cachepos.json");
const USERS_PATH = path.resolve(CACHE_DIR, "users.json");
const MESSAGES_PATH = path.resolve(CACHE_DIR, "telegramMessages.json");

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

if (!fs.existsSync(USERS_PATH)) {
  fs.writeFileSync(USERS_PATH, "{}");
}

if (!fs.existsSync(MESSAGES_PATH)) {
  fs.writeFileSync(MESSAGES_PATH, "{}");
}

// ============================================================
// CONFIGURAÇÃO DO DEBOUNCE
// ============================================================

// Quantas leituras consecutivas são necessárias para aceitar
// um estado suspeito.
//
// Exemplo:
// leitura 1 -> PNL real
// leitura 2 -> 0       <- ignorada
// leitura 3 -> PNL real
//
// O Telegram nunca recebe o zero.
//
// Se o zero persistir:
// leitura 1 -> 0
// leitura 2 -> 0
// leitura 3 -> 0
//
// então o estado poderá ser aceito.
const DEBOUNCE_LEITURAS = 3;

// Intervalo principal do monitoramento.
const INTERVALO_MONITORAMENTO = 4000;

// ============================================================
// ESTADOS EM MEMÓRIA
// ============================================================

let ultimoCache = carregarCache();
let usuarios = {};
let verificacaoEmAndamento = false;

// Controle das mensagens já criadas no Telegram.
//
// Estrutura:
//
// {
//   "BTCUSDT": {
//      "123456789": {
//          "message_id": 123
//      }
//   }
// }
let mensagensAtivas = carregarMensagens();

// Controle do debounce.
//
// {
//   "BTCUSDT": {
//      tipo: "zero",
//      contador: 2,
//      ultimaPosicao: {...}
//   }
// }
const estadosDebounce = {};

// ============================================================
// CACHE
// ============================================================

function carregarCache() {
  try {
    if (!fs.existsSync(CACHE_PATH)) {
      return {};
    }

    const data = fs.readFileSync(CACHE_PATH, "utf8");

    if (!data.trim()) {
      return {};
    }

    return JSON.parse(data);
  } catch (err) {
    console.error(
      "[telegramWorker] Erro ao carregar cache:",
      err.message
    );

    return {};
  }
}

// ============================================================
// USUÁRIOS
// ============================================================

function carregarUsuarios() {
  try {
    if (!fs.existsSync(USERS_PATH)) {
      return {};
    }

    const data = fs.readFileSync(USERS_PATH, "utf8");

    if (!data.trim()) {
      return {};
    }

    return JSON.parse(data);
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

// ============================================================
// MENSAGENS ATIVAS
// ============================================================

function carregarMensagens() {
  try {
    if (!fs.existsSync(MESSAGES_PATH)) {
      return {};
    }

    const data = fs.readFileSync(MESSAGES_PATH, "utf8");

    if (!data.trim()) {
      return {};
    }

    return JSON.parse(data);
  } catch (err) {
    console.error(
      "[telegramWorker] Erro ao carregar mensagens:",
      err.message
    );

    return {};
  }
}

function salvarMensagens() {
  try {
    fs.writeFileSync(
      MESSAGES_PATH,
      JSON.stringify(mensagensAtivas, null, 2)
    );
  } catch (err) {
    console.error(
      "[telegramWorker] Erro ao salvar mensagens:",
      err.message
    );
  }
}

// ============================================================
// USUÁRIOS DO TELEGRAM
// ============================================================

async function obterUsuarios() {
  try {
    const res = await axios.get(
      `${TELEGRAM_API}/getUpdates`,
      {
        timeout: 10000
      }
    );

    const updates = res.data.result || [];
    const users = carregarUsuarios();

    for (const up of updates) {
      const msg = up.message;

      if (!msg || !msg.chat || !msg.chat.id) {
        continue;
      }

      const id = msg.chat.id;

      if (!users[id]) {
        users[id] = {
          first_name: msg.chat.first_name || "Usuário",
          username: msg.chat.username || null,
          active: true
        };

        console.log(
          `👤 Novo usuário detectado: ${users[id].first_name} (${id})`
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

// ============================================================
// AUXILIARES
// ============================================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function numero(valor, padrao = 0) {
  const n = Number(valor);

  return Number.isFinite(n) ? n : padrao;
}

function posicaoExiste(pos) {
  if (!pos) {
    return false;
  }

  const quantidade = numero(pos.positionAmt);

  return quantidade !== 0;
}

// ============================================================
// ASSINATURA BINANCE
// ============================================================

function criarAssinatura(queryString) {
  return crypto
    .createHmac("sha256", SECRET_KEY)
    .update(queryString)
    .digest("hex");
}

// ============================================================
// CONFIRMAR POSIÇÃO DIRETAMENTE NA BINANCE
// ============================================================

async function consultarPosicaoBinance(symbol) {
  if (!API_KEY || !SECRET_KEY) {
    return null;
  }

  try {
    const timestamp = Date.now();

    const query = `timestamp=${timestamp}&recvWindow=10000`;

    const signature = criarAssinatura(query);

    const res = await axios.get(
      `${BINANCE_API}/fapi/v2/positionRisk?${query}&signature=${signature}`,
      {
        headers: {
          "X-MBX-APIKEY": API_KEY
        },
        timeout: 10000
      }
    );

    const lista = Array.isArray(res.data)
      ? res.data
      : [];

    const encontrada = lista.find(
      p => p.symbol === symbol
    );

    return encontrada || null;

  } catch (err) {
    console.error(
      `[telegramWorker] Erro ao confirmar ${symbol} na Binance:`,
      err.response?.data || err.message
    );

    return null;
  }
}

// ============================================================
// TELEGRAM - ENVIAR
// ============================================================

async function enviarMensagem(uid, texto) {
  try {
    const res = await axios.post(
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

    const status = err.response?.status;

    if (status === 429 || status === 418) {

      const retryAfter =
        err.response?.data?.parameters?.retry_after ||
        parseInt(
          err.response?.headers?.["retry-after"] ||
          "5",
          10
        );

      console.error(
        `[Telegram] Rate limit para ${uid}. Aguardando ${retryAfter}s.`
      );

      await sleep((retryAfter + 1) * 1000);

      try {
        const retry = await axios.post(
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
          `[Telegram] Falha no reenvio para ${uid}:`,
          retryErr.message
        );
      }

    } else {
      console.error(
        `[Telegram] Falha ao enviar mensagem para ${uid}:`,
        err.response?.data || err.message
      );
    }

    return null;
  }
}

// ============================================================
// TELEGRAM - EDITAR
// ============================================================

async function editarMensagem(uid, messageId, texto) {
  try {

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

    return true;

  } catch (err) {

    const descricao =
      err.response?.data?.description ||
      err.message;

    // Isso pode acontecer quando o texto é exatamente igual
    // ao texto atual da mensagem.
    if (
      descricao.includes("message is not modified")
    ) {
      return true;
    }

    console.error(
      `[Telegram] Falha ao editar mensagem ${messageId} para ${uid}:`,
      descricao
    );

    return false;
  }
}

// ============================================================
// ENVIAR PARA TODOS
// ============================================================

async function enviarMensagemParaTodos(texto) {

  for (const uid of Object.keys(usuarios)) {

    const usuario = usuarios[uid];

    if (!usuario || usuario.active === false) {
      continue;
    }

    await enviarMensagem(uid, texto);
  }
}

// ============================================================
// MENSAGEM INICIAL
// ============================================================

function gerarMensagemInicial(pos) {

  const entry = numero(pos.entryPrice);
  const qty = numero(pos.positionAmt);
  const leverage = numero(pos.leverage, 1);

  return (
    `━━━━━━━━━━━━━━━\n` +
    `📊 <b>${pos.symbol}</b>\n` +
    `━━━━━━━━━━━━━━━\n` +
    `🟢 <b>Posição Aberta</b>\n` +
    `💵 Preço de entrada: ${entry}\n` +
    `📈 Lado: ${pos.positionSide || "BOTH"}\n` +
    `📊 Quantidade: ${qty}\n` +
    `⚙️ Alavancagem: ${leverage}x\n` +
    `🕒 Abertura: ${
      pos.openedAt
        ? new Date(pos.openedAt).toLocaleString()
        : new Date().toLocaleString()
    }\n` +
    `━━━━━━━━━━━━━━━`
  );
}

// ============================================================
// MENSAGEM ATIVA
// ============================================================

function gerarMensagemAtiva(pos) {

  const entry = numero(pos.entryPrice);
  const mark = numero(pos.markPrice);
  const qty = numero(pos.positionAmt);
  const leverage = numero(pos.leverage, 1);

  let pnl = 0;

  if (entry !== 0 && mark !== 0 && qty !== 0) {
    pnl =
      (mark - entry) *
      qty *
      leverage;
  }

  let pnlPct = 0;

  if (entry !== 0 && mark !== 0) {
    pnlPct =
      ((mark - entry) / entry) *
      100 *
      (qty > 0 ? 1 : -1);
  }

  const pnlFmt =
    pnl >= 0
      ? `🟩 +${pnl.toFixed(4)} USDT`
      : `🟥 ${pnl.toFixed(4)} USDT`;

  const pctFmt =
    pnlPct >= 0
      ? `📈 +${pnlPct.toFixed(2)}%`
      : `📉 ${pnlPct.toFixed(2)}%`;

  return (
    `━━━━━━━━━━━━━━━\n` +
    `📊 <b>${pos.symbol}</b>\n` +
    `━━━━━━━━━━━━━━━\n` +
    `🟡 <b>Posição Ativa</b>\n` +
    `💵 Entrada: ${entry}\n` +
    `💰 Preço atual: ${mark}\n` +
    `📊 Lucro atual: ${pnlFmt}\n` +
    `📉 Variação: ${pctFmt}\n` +
    `🕒 Abertura: ${
      pos.openedAt
        ? new Date(pos.openedAt).toLocaleString()
        : "-"
    }\n` +
    `━━━━━━━━━━━━━━━`
  );
}

// ============================================================
// MENSAGEM FINAL
// ============================================================

function gerarMensagemFinal(symbol, pos) {

  const entry = numero(pos.entryPrice);
  const close = numero(pos.markPrice, entry);
  const qty = numero(pos.positionAmt);
  const leverage = numero(pos.leverage, 1);

  const pnl =
    (close - entry) *
    qty *
    leverage;

  const pnlPct =
    entry !== 0
      ? ((close - entry) / entry) *
        100 *
        (qty > 0 ? 1 : -1)
      : 0;

  const openedAt =
    pos.openedAt
      ? new Date(pos.openedAt)
      : new Date();

  const closedAt = new Date();

  const durMs =
    closedAt.getTime() -
    openedAt.getTime();

  const durMin =
    Math.max(0, Math.floor(durMs / 60000));

  const durHr =
    Math.floor(durMin / 60);

  const durFmt =
    durHr > 0
      ? `${durHr}h ${durMin % 60}min`
      : `${durMin}min`;

  const pnlFmt =
    pnl >= 0
      ? `🟩 +${pnl.toFixed(4)} USDT`
      : `🟥 ${pnl.toFixed(4)} USDT`;

  const pctFmt =
    pnlPct >= 0
      ? `📈 +${pnlPct.toFixed(2)}%`
      : `📉 ${pnlPct.toFixed(2)}%`;

  return (
    `━━━━━━━━━━━━━━━\n` +
    `📊 <b>${symbol}</b>\n` +
    `━━━━━━━━━━━━━━━\n` +
    `⚫ <b>Posição Encerrada</b>\n` +
    `💵 Entrada: ${entry}\n` +
    `💸 Saída: ${close.toFixed(4)}\n` +
    `📊 Resultado: ${pnlFmt}\n` +
    `📉 Variação: ${pctFmt}\n` +
    `⏱️ Duração: ${durFmt}\n` +
    `🕒 Abertura: ${openedAt.toLocaleString()}\n` +
    `🕒 Fechamento: ${closedAt.toLocaleString()}\n` +
    `━━━━━━━━━━━━━━━`
  );
}

// ============================================================
// VERIFICAR SE O ESTADO É SUSPEITO
// ============================================================

function estadoSuspeito(pos) {

  if (!posicaoExiste(pos)) {
    return false;
  }

  const entry = numero(pos.entryPrice);
  const mark = numero(pos.markPrice);
  const qty = numero(pos.positionAmt);

  // Uma posição aberta não deveria ter preço de entrada,
  // preço atual ou quantidade inválidos.
  if (
    entry === 0 ||
    mark === 0 ||
    qty === 0
  ) {
    return true;
  }

  return false;
}

// ============================================================
// DEBOUNCE DE ESTADO SUSPEITO
// ============================================================

function aceitarEstado(symbol, pos) {

  const suspeito = estadoSuspeito(pos);

  // Estado normal:
  // limpa qualquer debounce anterior.
  if (!suspeito) {

    delete estadosDebounce[symbol];

    return true;
  }

  // Estado suspeito.
  const estado = estadosDebounce[symbol];

  if (!estado) {

    estadosDebounce[symbol] = {
      tipo: "suspeito",
      contador: 1,
      ultimaPosicao: pos
    };

    console.log(
      `[telegramWorker] ⚠️ Estado suspeito em ${symbol}: ` +
      `1/${DEBOUNCE_LEITURAS}`
    );

    return false;
  }

  estado.contador++;
  estado.ultimaPosicao = pos;

  console.log(
    `[telegramWorker] ⚠️ Estado suspeito em ${symbol}: ` +
    `${estado.contador}/${DEBOUNCE_LEITURAS}`
  );

  if (estado.contador >= DEBOUNCE_LEITURAS) {

    delete estadosDebounce[symbol];

    console.log(
      `[telegramWorker] ✅ Estado suspeito confirmado em ${symbol}.`
    );

    return true;
  }

  return false;
}

// ============================================================
// DEBOUNCE DE DESAPARECIMENTO DA POSIÇÃO
// ============================================================

async function confirmarEncerramento(symbol, posAnterior) {

  // Primeiro verifica diretamente na Binance.
  const posBinance =
    await consultarPosicaoBinance(symbol);

  // Se a Binance ainda informa posição aberta,
  // não podemos considerar encerrada.
  if (posBinance) {

    const quantidade =
      numero(posBinance.positionAmt);

    if (quantidade !== 0) {

      console.log(
        `[telegramWorker] 🔄 ${symbol} ainda está aberta na Binance.`
      );

      return false;
    }
  }

  const estado = estadosDebounce[symbol];

  if (!estado) {

    estadosDebounce[symbol] = {
      tipo: "fechamento",
      contador: 1,
      ultimaPosicao: posAnterior
    };

    console.log(
      `[telegramWorker] ⚠️ Possível encerramento ${symbol}: ` +
      `1/${DEBOUNCE_LEITURAS}`
    );

    return false;
  }

  if (estado.tipo !== "fechamento") {

    estadosDebounce[symbol] = {
      tipo: "fechamento",
      contador: 1,
      ultimaPosicao: posAnterior
    };

    return false;
  }

  estado.contador++;

  console.log(
    `[telegramWorker] ⚠️ Confirmando encerramento ${symbol}: ` +
    `${estado.contador}/${DEBOUNCE_LEITURAS}`
  );

  if (estado.contador >= DEBOUNCE_LEITURAS) {

    delete estadosDebounce[symbol];

    console.log(
      `[telegramWorker] 🔴 Encerramento confirmado: ${symbol}`
    );

    return true;
  }

  return false;
}

// ============================================================
// MENSAGEM ATIVA POR USUÁRIO
// ============================================================

async function criarMensagemAtivaParaUsuarios(
  symbol,
  pos,
  texto
) {

  if (!mensagensAtivas[symbol]) {
    mensagensAtivas[symbol] = {};
  }

  for (const uid of Object.keys(usuarios)) {

    const usuario = usuarios[uid];

    if (!usuario || usuario.active === false) {
      continue;
    }

    const mensagemExistente =
      mensagensAtivas[symbol][uid];

    // Já existe mensagem -> EDITA.
    if (mensagemExistente?.message_id) {

      await editarMensagem(
        uid,
        mensagemExistente.message_id,
        texto
      );

      continue;
    }

    // Não existe -> CRIA.
    const enviada =
      await enviarMensagem(
        uid,
        texto
      );

    if (enviada?.message_id) {

      mensagensAtivas[symbol][uid] = {
        message_id: enviada.message_id
      };

      salvarMensagens();
    }
  }
}

// ============================================================
// FINALIZAR MENSAGEM
// ============================================================

async function finalizarMensagem(
  symbol,
  pos
) {

  const texto =
    gerarMensagemFinal(symbol, pos);

  const mensagens =
    mensagensAtivas[symbol];

  if (!mensagens) {
    return;
  }

  for (const uid of Object.keys(mensagens)) {

    const messageId =
      mensagens[uid]?.message_id;

    if (!messageId) {
      continue;
    }

    await editarMensagem(
      uid,
      messageId,
      texto
    );
  }

  // A posição foi encerrada.
  // Removemos o controle da mensagem somente
  // depois de editar a mensagem final.
  delete mensagensAtivas[symbol];

  salvarMensagens();
}

// ============================================================
// PROCESSAR NOVA POSIÇÃO
// ============================================================

async function processarPosicao(
  symbol,
  nova,
  antiga
) {

  // ----------------------------------------------------------
  // POSIÇÃO ABERTA
  // ----------------------------------------------------------

  if (posicaoExiste(nova)) {

    // Se o estado recebido for suspeito,
    // não atualizamos o Telegram imediatamente.
    if (!aceitarEstado(symbol, nova)) {
      return;
    }

    const texto =
      !antiga || !posicaoExiste(antiga)
        ? gerarMensagemInicial(nova)
        : gerarMensagemAtiva(nova);

    await criarMensagemAtivaParaUsuarios(
      symbol,
      nova,
      texto
    );

    return;
  }

  // ----------------------------------------------------------
  // NÃO HÁ POSIÇÃO NO CACHE
  // ----------------------------------------------------------

  if (
    antiga &&
    posicaoExiste(antiga) &&
    !posicaoExiste(nova)
  ) {

    const confirmado =
      await confirmarEncerramento(
        symbol,
        antiga
      );

    if (!confirmado) {
      return;
    }

    await finalizarMensagem(
      symbol,
      antiga
    );
  }
}

// ============================================================
// PROCESSAR CACHE
// ============================================================

async function verificarAlteracoes() {

  if (verificacaoEmAndamento) {
    console.log(
      "[telegramWorker] ⏳ Verificação anterior ainda em andamento."
    );

    return;
  }

  verificacaoEmAndamento = true;

  try {

    const novoCache =
      carregarCache();

    const simbolos =
      new Set([
        ...Object.keys(ultimoCache),
        ...Object.keys(novoCache)
      ]);

    for (const symbol of simbolos) {

      const nova =
        novoCache[symbol];

      const antiga =
        ultimoCache[symbol];

      // Se o símbolo não existe mais no cache,
      // usamos um objeto vazio para permitir a confirmação
      // do desaparecimento.
      const estadoNovo =
        nova || {};

      await processarPosicao(
        symbol,
        estadoNovo,
        antiga
      );
    }

    ultimoCache =
      novoCache;

  } catch (err) {

    console.error(
      "[telegramWorker] Erro no monitoramento:",
      err.message
    );

  } finally {

    verificacaoEmAndamento = false;
  }
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================

(async () => {

  if (!TELEGRAM_TOKEN) {

    console.error(
      "❌ TELEGRAM_TOKEN não definido no .env"
    );

    process.exit(1);
  }

  usuarios =
    await obterUsuarios();

  if (Object.keys(usuarios).length === 0) {

    console.log(
      "⚠️ Nenhum usuário detectado. " +
      "Envie uma mensagem ao bot e reinicie."
    );

    process.exit(1);
  }

  console.log(
    `✅ Telegram Worker iniciado ` +
    `(${Object.keys(usuarios).length} usuários)`
  );

  console.log(
    `🛡️ Debounce configurado: ` +
    `${DEBOUNCE_LEITURAS} leituras consecutivas`
  );

  // Primeira verificação imediata.
  await verificarAlteracoes();

  // Monitoramento periódico.
  setInterval(async () => {

    usuarios =
      await obterUsuarios();

    await verificarAlteracoes();

  }, INTERVALO_MONITORAMENTO);

})();