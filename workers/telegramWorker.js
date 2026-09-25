const fs = require("fs");
const path = require("path");
const axios = require("axios");
require("dotenv").config();

// =======================
// 🔹 Configurações
// =======================
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

const CACHE_DIR = path.resolve(__dirname, "cache");
const CACHE_PATH = path.resolve(CACHE_DIR, "cachepos.json");
const USERS_PATH = path.resolve(CACHE_DIR, "users.json");

if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
if (!fs.existsSync(USERS_PATH)) fs.writeFileSync(USERS_PATH, "{}");

// =======================
// 🔹 Funções de Cache
// =======================
function carregarCache() {
  try {
    if (!fs.existsSync(CACHE_PATH)) return {};
    const data = fs.readFileSync(CACHE_PATH, "utf8");
    return JSON.parse(data || "{}");
  } catch (err) {
    console.error("[telegramWorker] Erro ao carregar cache:", err.message);
    return {};
  }
}

function carregarUsuarios() {
  try {
    const data = fs.readFileSync(USERS_PATH, "utf8");
    return JSON.parse(data || "{}");
  } catch (err) {
    console.error("[telegramWorker] Erro ao carregar usuários:", err.message);
    return {};
  }
}

function salvarUsuarios(users) {
  try {
    fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error("[telegramWorker] Erro ao salvar usuários:", err.message);
  }
}

// =======================
// 🔹 Detectar novos usuários automaticamente
// =======================
async function obterUsuarios() {
  try {
    const res = await axios.get(`${TELEGRAM_API}/getUpdates`);
    const updates = res.data.result;
    const users = carregarUsuarios();

    for (const up of updates) {
      const msg = up.message;
      if (!msg || !msg.chat || !msg.chat.id) continue;

      const id = msg.chat.id;
      if (!users[id]) {
        users[id] = {
          first_name: msg.chat.first_name || "Usuário",
          username: msg.chat.username || null,
          active: true,
        };
        console.log(`👤 Novo usuário detectado: ${users[id].first_name} (${id})`);
      }
    }

    salvarUsuarios(users);
    return users;
  } catch (err) {
    console.error("[telegramWorker] Erro ao obter usuários:", err.message);
    return carregarUsuarios();
  }
}

// =======================
// 🔹 Funções Telegram
// =======================
async function enviarMensagemParaTodos(usuarios, texto) {
  for (const uid of Object.keys(usuarios)) {
    const u = usuarios[uid];
    if (!u.active) continue;

    try {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: uid,
        text: texto,
        parse_mode: "HTML",
      });
    } catch (err) {
      
      
      if (err.response.status === 429 || err.response.status === 418) {
  // Telegram normalmente usa 429, mas aceite 418 também (alguma infra retorna 418 para 'rate limit')
  const retryAfter = err.response.data?.parameters?.retry_after || parseInt(err.response.headers['retry-after'] || err.response.headers['Retry-After'] || '5', 10);
  console.error(`Aguardar ${retryAfter} segundos antes de reenviar.`);
  console.error(`[Telegram] Falha ao enviar msg para ${u.first_name} (${uid}):`, err.message);
  await sleep((retryAfter + 1) * 1000);
  
}
    }
  }
}

async function editarMensagem(uid, msgId, texto) {
  try {
    await axios.post(`${TELEGRAM_API}/editMessageText`, {
      chat_id: uid,
      message_id: msgId,
      text: texto,
      parse_mode: "HTML",
    });
  } catch (err) {
    console.error(`[Telegram] Falha ao editar mensagem ${msgId} para ${uid}:`, err.message);
  }
}

// =======================
// 🔹 Mensagens de posição
// =======================
function gerarMensagemInicial(pos) {
  return (
    `━━━━━━━━━━━━━━━\n` +
    `📊 <b>${pos.symbol}</b>\n` +
    `━━━━━━━━━━━━━━━\n` +
    `🟢 <b>Posição Aberta</b>\n` +
    `💵 Preço de entrada: ${pos.entryPrice}\n` +
    `📈 Lado: ${pos.positionSide}\n` +
    `📊 Quantidade: ${pos.positionAmt}\n` +
    `⚙️ Alavancagem: ${pos.leverage}x\n` +
    `🕒 Abertura: ${new Date(pos.openedAt).toLocaleString()}\n` +
    `━━━━━━━━━━━━━━━`
  );
}

function gerarMensagemAtiva(pos) {
  const entry = parseFloat(pos.entryPrice);
  const mark = parseFloat(pos.markPrice);
  const qty = parseFloat(pos.positionAmt);
  const leverage = parseFloat(pos.leverage || 1);

  const pnl = (mark - entry) * qty * leverage;
  const pnlPct = ((mark - entry) / entry) * 100 * (qty > 0 ? 1 : -1);
  const pnlFmt = pnl >= 0 ? `🟩 +${pnl.toFixed(4)} USDT` : `🟥 ${pnl.toFixed(4)} USDT`;
  const pctFmt = pnlPct >= 0 ? `📈 +${pnlPct.toFixed(2)}%` : `📉 ${pnlPct.toFixed(2)}%`;

  return (
    `━━━━━━━━━━━━━━━\n` +
    `📊 <b>${pos.symbol}</b>\n` +
    `━━━━━━━━━━━━━━━\n` +
    `🟡 <b>Posição Ativa</b>\n` +
    `💵 Entrada: ${entry}\n` +
    `💰 Preço atual: ${mark}\n` +
    `📊 Lucro atual: ${pnlFmt}\n` +
    `📉 Variação: ${pctFmt}\n` +
    `🕒 Abertura: ${new Date(pos.openedAt).toLocaleString()}\n` +
    `━━━━━━━━━━━━━━━`
  );
}

function gerarMensagemFinal(symbol, pos) {
  const entry = parseFloat(pos.entryPrice);
  const close = parseFloat(pos.markPrice || entry);
  const qty = parseFloat(pos.positionAmt || 0);
  const leverage = parseFloat(pos.leverage || 1);

  const pnl = (close - entry) * qty * leverage;
  const pnlPct = ((close - entry) / entry) * 100 * (qty > 0 ? 1 : -1);
  const openedAt = pos.openedAt ? new Date(pos.openedAt) : new Date();
  const closedAt = new Date();
  const durMs = closedAt - openedAt;
  const durMin = Math.floor(durMs / 60000);
  const durHr = Math.floor(durMin / 60);
  const durFmt = durHr > 0 ? `${durHr}h ${durMin % 60}min` : `${durMin}min`;

  const pnlFmt = pnl >= 0 ? `🟩 +${pnl.toFixed(4)} USDT` : `🟥 ${pnl.toFixed(4)} USDT`;
  const pctFmt = pnlPct >= 0 ? `📈 +${pnlPct.toFixed(2)}%` : `📉 ${pnlPct.toFixed(2)}%`;

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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// =======================
// 🔹 Monitoramento de Cache
// =======================
let ultimoCache = carregarCache();
let usuarios = {};

async function verificarAlteracoes() {
  const novoCache = carregarCache();

  for (const symbol in novoCache) {
    const nova = novoCache[symbol];
    const antiga = ultimoCache[symbol];

  const delay = Math.floor(Math.random() * 5000) + 1000; // 1 a 5 s
  //console.log(`Aguardando ${delay} ms antes de abrir posição ${side} em ${symbol}...`);
  
  await sleep(delay);

    //if(){
      const texto = gerarMensagemAtiva(nova);
      //await enviarMensagemParaTodos(usuarios, texto);
    //}

    if (!antiga && nova.active) {
      const texto = gerarMensagemInicial(nova);
      await enviarMensagemParaTodos(usuarios, texto);
    }

    if (antiga && nova.active && antiga.markPrice !== nova.markPrice) {
      const texto = gerarMensagemAtiva(nova);
      await enviarMensagemParaTodos(usuarios, texto);
    }

    if (antiga && !nova.active) {
      const texto = gerarMensagemFinal(symbol, antiga);
      await enviarMensagemParaTodos(usuarios, texto);
    }
    
  }

  ultimoCache = novoCache;
}

// =======================
// 🔹 Inicialização
// =======================
(async () => {
  if (!TELEGRAM_TOKEN) {
    console.error("❌ TELEGRAM_TOKEN não definido no .env");
    process.exit(1);
  }

  usuarios = await obterUsuarios();

  if (Object.keys(usuarios).length === 0) {
    console.log("⚠️ Nenhum usuário detectado. Envie uma mensagem ao bot e reinicie.");
    process.exit(1);
  }

  console.log(`✅ Telegram Worker iniciado (${Object.keys(usuarios).length} usuários)`);
  setInterval(async () => {
    usuarios = await obterUsuarios(); // atualiza lista
    verificarAlteracoes();
  }, 4000);
})();