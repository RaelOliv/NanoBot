// workers/positionWorker.js
const WebSocket = require('ws');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://fapi.binance.com';

let ws = null;
let listenKey = null;
let positions = {};

// =======================
// 🔹 Funções de Cache
// =======================
const CACHE_DIR = path.resolve(__dirname, 'cache');
const CACHE_PATH = path.resolve(CACHE_DIR, 'cachepos.json');
let salvarPendente = false;

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
  if (salvarPendente) return;
  salvarPendente = true;
  setTimeout(() => {
    fs.promises.writeFile(CACHE_PATH, JSON.stringify(positions, null, 2))
      .catch(err => console.error('[positionsWorker] Erro ao salvar cache:', err.message))
      .finally(() => salvarPendente = false);
  }, 1500);
}

garantirCache();
carregarCache();

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

// 🔸 Carregar posições abertas no início
async function carregarPosicoesAtuais() {
  try {
    const res = await axios.get(`${BASE_URL}/fapi/v2/positionRisk`, {
      headers: { 'X-MBX-APIKEY': API_KEY }
    });

    const abertas = res.data.filter(p => parseFloat(p.positionAmt) !== 0);
    console.log(`[positionsWorker] Encontradas ${abertas.length} posições abertas.`);

    // Remover do cache o que não está mais aberto
    const ativos = abertas.map(p => p.symbol);
    for (const symbol in positions) {
      if (!ativos.includes(symbol)) {
        console.log(`[positionsWorker] Limpando cache órfão de ${symbol}`);
        delete positions[symbol];
      }
    }

    for (const p of abertas) {
      const symbol = p.symbol;
      const jaExistia = !!positions[symbol];

      positions[symbol] = {
        ...positions[symbol],
        symbol,
        positionAmt: p.positionAmt,
        entryPrice: p.entryPrice,
        markPrice: p.markPrice,
        leverage: p.leverage,
        positionSide: p.positionSide,
        marginType: p.marginType,
        updateTime: Date.now(),
        openedAt: positions[symbol]?.openedAt || Date.now(),
        active: true,
      };

      console.log(`[positionsWorker][${symbol}] ${jaExistia ? 'Atualizada' : 'Aberta'}.`);
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
      setTimeout(() => carregarPosicoesAtuais(), 2000);
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
            console.log(`[positionsWorker][${symbol}] ${jaExistia ? 'Atualizada' : 'Aberta'}.`);
          } else if (positions[symbol]) {
            console.log(`[positionsWorker][${symbol}] Encerrada.`);
            positions[symbol].closedAt = Date.now();
            positions[symbol].active = false;
          }
          salvarCache();
        }
      } catch (err) {
        console.error('[positionsWorker] Erro WS:', err.message);
      }
    });

    ws.on('close', () => {
      console.log('[positionsWorker] WS fechado. Reabrindo...');
      try { ws.terminate(); } catch {}
      ws = null;
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