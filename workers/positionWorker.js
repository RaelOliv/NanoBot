// workers/positionWorker.js
const WebSocket = require('ws');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://fapi.binance.com';
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

let ws = null;
let listenKey = null;
let positions = {};

// =======================
// 🔹 Funções de Cache
// =======================
const CACHE_DIR = path.resolve(__dirname, 'cache');
const CACHE_PATH = path.resolve(CACHE_DIR, 'cachepos.json');

function garantirCache() {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
  if (!fs.existsSync(CACHE_PATH)) fs.writeFileSync(CACHE_PATH, '{}');
}

function carregarCache() {
  try {
    const data = fs.readFileSync(CACHE_PATH, 'utf8');
    positions = JSON.parse(data || '{}');
    console.log(`[positionsWorker] Cache carregado (${Object.keys(positions).length} posições).`);
  } catch {
    positions = {};
  }
}

function salvarCache() {
  try {
    fs.writeFileSync(CACHE_PATH, JSON.stringify(positions, null, 2));
  } catch (err) {
    console.error('[positionsWorker] Erro ao salvar cache:', err.message);
  }
}

garantirCache();
carregarCache();

// =======================
// 🔹 Funções Telegram
// =======================
async function enviarMensagemInicial(pos) {
  try {
    const texto =
      `━━━━━━━━━━━━━━━\n` +
      `📊 <b>${pos.symbol}</b>\n` +
      `━━━━━━━━━━━━━━━\n` +
      `🟢 <b>Posição Aberta</b>\n` +
      `💵 Preço de entrada: ${pos.entryPrice}\n` +
      `📈 Lado: ${pos.positionSide}\n` +
      `📊 Quantidade: ${pos.positionAmt}\n` +
      `⚙️ Alavancagem: ${pos.leverage}x\n` +
      `🕒 Abertura: ${new Date(pos.openedAt).toLocaleString()}\n` +
      `━━━━━━━━━━━━━━━`;

    const res = await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: texto,
      parse_mode: "HTML"
    });

    return res.data.result.message_id;
  } catch (err) {
    console.error('[Telegram] Erro ao enviar msg inicial:', err.message);
    return null;
  }
}

async function atualizarMensagem(pos) {
  try {
    if (!pos.telegramMsgId) return;
    const entry = parseFloat(pos.entryPrice);
    const mark = parseFloat(pos.markPrice);
    const qty = parseFloat(pos.positionAmt);
    const leverage = parseFloat(pos.leverage || 1);

    const pnl = (mark - entry) * qty * leverage;
    const pnlPct = ((mark - entry) / entry) * 100 * (qty > 0 ? 1 : -1);
    const pnlFmt = pnl >= 0 ? `🟩 +${pnl.toFixed(4)} USDT` : `🟥 ${pnl.toFixed(4)} USDT`;
    const pctFmt = pnlPct >= 0 ? `📈 +${pnlPct.toFixed(2)}%` : `📉 ${pnlPct.toFixed(2)}%`;

    const texto =
      `━━━━━━━━━━━━━━━\n` +
      `📊 <b>${pos.symbol}</b>\n` +
      `━━━━━━━━━━━━━━━\n` +
      `🟡 <b>Posição Ativa</b>\n` +
      `💵 Entrada: ${entry}\n` +
      `💰 Preço atual: ${mark}\n` +
      `📊 Lucro atual: ${pnlFmt}\n` +
      `📉 Variação: ${pctFmt}\n` +
      `🕒 Abertura: ${new Date(pos.openedAt).toLocaleString()}\n` +
      `━━━━━━━━━━━━━━━`;

    await axios.post(`${TELEGRAM_API}/editMessageText`, {
      chat_id: TELEGRAM_CHAT_ID,
      message_id: pos.telegramMsgId,
      text: texto,
      parse_mode: "HTML"
    });
  } catch (err) {
    console.error('[Telegram] Erro ao atualizar mensagem:', err.message);
  }
}

async function finalizarMensagem(symbol, closedData) {
  try {
    const pos = positions[symbol];
    if (!pos || !pos.telegramMsgId) return;

    const entry = parseFloat(pos.entryPrice);
    const close = parseFloat(closedData.markPrice || pos.markPrice || entry);
    const qty = parseFloat(pos.positionAmt || closedData.pa || 0);
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

    const textoFinal =
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
      `━━━━━━━━━━━━━━━`;

    await axios.post(`${TELEGRAM_API}/editMessageText`, {
      chat_id: TELEGRAM_CHAT_ID,
      message_id: pos.telegramMsgId,
      text: textoFinal,
      parse_mode: "HTML"
    });

    pos.closedAt = closedAt;
    pos.active = false;
    pos.unRealizedProfit = pnl.toFixed(4);
    pos.pnlPct = pnlPct.toFixed(2);
    pos.duration = durFmt;
    salvarCache();
  } catch (err) {
    console.error('[Telegram] Falha ao finalizar msg:', err.message);
  }
}

// =======================
// 🔹 Inicialização Binance
// =======================
async function criarListenKey() {
  const res = await axios.post(`${BASE_URL}/fapi/v1/listenKey`, null, {
    headers: { 'X-MBX-APIKEY': API_KEY }
  });
  return res.data.listenKey;
}

function manterListenKey() {
  setInterval(async () => {
    try {
      await axios.put(`${BASE_URL}/fapi/v1/listenKey`, null, {
        headers: { 'X-MBX-APIKEY': API_KEY }
      });
    } catch (err) {
      console.error('[positionsWorker] Erro ao renovar listenKey:', err.message);
    }
  }, 25 * 60 * 1000);
}

// 🔸 NOVO: carregar posições já abertas ao iniciar
async function carregarPosicoesAtuais() {
  try {
    const res = await axios.get(`${BASE_URL}/fapi/v2/positionRisk`, {
      headers: { 'X-MBX-APIKEY': API_KEY }
    });

    const abertas = res.data.filter(p => parseFloat(p.positionAmt) !== 0);
    console.log(`[positionsWorker] Encontradas ${abertas.length} posições abertas.`);

    for (const p of abertas) {
      const symbol = p.symbol;
      const jaExistia = positions[symbol]?.telegramMsgId;

      positions[symbol] = {
        symbol,
        positionAmt: p.positionAmt,
        entryPrice: p.entryPrice,
        markPrice: p.markPrice,
        leverage: p.leverage,
        positionSide: p.positionSide,
        marginType: p.marginType,
        updateTime: Date.now(),
        openedAt: positions[symbol]?.openedAt || Date.now(),
        telegramMsgId: jaExistia || null,
        active: true
      };

      if (!jaExistia) {
        const msgId = await enviarMensagemInicial(positions[symbol]);
        positions[symbol].telegramMsgId = msgId;
      } else {
        await atualizarMensagem(positions[symbol]);
      }
    }
    salvarCache();
  } catch (err) {
    console.error('[positionsWorker] Erro ao carregar posições atuais:', err.message);
  }
}

// =======================
// 🔹 WebSocket Binance
// =======================
async function iniciarWs() {
  try {
    listenKey = await criarListenKey();
    const wsUrl = `wss://fstream.binance.com/ws/${listenKey}`;
    ws = new WebSocket(wsUrl);

    ws.on('open', async () => {
      console.log('[positionsWorker] WebSocket conectado.');
      await carregarPosicoesAtuais(); // 🔸 Garante sincronização inicial
    });

    ws.on('message', async (msg) => {
      try {
        const data = JSON.parse(msg);
        if (data.e !== 'ACCOUNT_UPDATE') return;

        const posicoes = data.a.P;
        for (const p of posicoes) {
          const symbol = p.s;
          const amt = parseFloat(p.pa);
          if (amt !== 0) {
            const jaExistia = !!positions[symbol];
            positions[symbol] = {
              ...positions[symbol],
              symbol,
              positionAmt: p.pa,
              entryPrice: p.ep,
              markPrice: p.mp || "0",
              leverage: p.cr || "0",
              positionSide: p.ps || "BOTH",
              marginType: p.mt || "isolated",
              updateTime: Date.now(),
              openedAt: positions[symbol]?.openedAt || Date.now(),
              active: true
            };
            salvarCache();

            if (!jaExistia) {
              const msgId = await enviarMensagemInicial(positions[symbol]);
              positions[symbol].telegramMsgId = msgId;
              salvarCache();
            } else {
              await atualizarMensagem(positions[symbol]);
            }
          } else if (positions[symbol]) {
            await finalizarMensagem(symbol, p);
            delete positions[symbol];
            salvarCache();
          }
        }
      } catch (err) {
        console.error('[positionsWorker] Erro WS:', err.message);
      }
    });

    ws.on('close', () => {
      console.log('[positionsWorker] WS fechado. Reabrindo...');
      setTimeout(iniciarWs, 4000);
    });

    ws.on('error', (err) => console.error('[positionsWorker] WS erro:', err.message));
    manterListenKey();
  } catch (err) {
    console.error('[positionsWorker] Erro ao iniciar:', err.message);
    setTimeout(iniciarWs, 5000);
  }
}

iniciarWs();