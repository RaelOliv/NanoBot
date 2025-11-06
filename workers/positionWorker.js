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

// Caminho do cache
const CACHE_DIR = path.resolve(__dirname, 'cache');
const CACHE_PATH = path.resolve(CACHE_DIR, 'cachepos.json');

// Garante que a pasta e o arquivo existam
function garantirCache() {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
      console.log('[positionsWorker] Pasta /cache criada.');
    }
    if (!fs.existsSync(CACHE_PATH)) {
      fs.writeFileSync(CACHE_PATH, '{}');
      console.log('[positionsWorker] cachepos.json criado.');
    }
  } catch (err) {
    console.error('[positionsWorker] Erro ao garantir cache:', err.message);
  }
}
garantirCache();

let positions = {};

// Carrega o cache existente
function carregarCache() {
  try {
    const data = fs.readFileSync(CACHE_PATH, 'utf8');
    positions = JSON.parse(data || '{}');
    console.log(`[positionsWorker] Cache carregado (${Object.keys(positions).length} posições).`);
  } catch (err) {
    console.error('[positionsWorker] Erro ao carregar cache:', err.message);
    positions = {};
  }
}

// Salva cache no disco, garantindo sincronização com o existente
function salvarCache() {
  try {
    // Recarrega o cache atual do disco
    let cacheAtual = {};
    try {
      const data = fs.readFileSync(CACHE_PATH, 'utf8');
      cacheAtual = JSON.parse(data || '{}');
    } catch (err) {
      cacheAtual = {};
    }

    // Remove posições que não existem mais
    for (const symbol in cacheAtual) {
      if (!positions[symbol]) delete cacheAtual[symbol];
    }

    // Atualiza com as posições novas
    for (const symbol in positions) {
      cacheAtual[symbol] = positions[symbol];
    }

    fs.writeFileSync(CACHE_PATH, JSON.stringify(cacheAtual, null, 2));
    positions = cacheAtual;
  } catch (err) {
    console.error('[positionsWorker] Erro ao salvar cache:', err.message);
  }
}

// Cria listenKey
async function criarListenKey() {
  const res = await axios.post(`${BASE_URL}/fapi/v1/listenKey`, null, {
    headers: { 'X-MBX-APIKEY': API_KEY }
  });
  return res.data.listenKey;
}

// Mantém listenKey ativa
function manterListenKey() {
  setInterval(async () => {
    try {
      await axios.put(`${BASE_URL}/fapi/v1/listenKey`, null, {
        headers: { 'X-MBX-APIKEY': API_KEY }
      });
      console.log('[positionsWorker] listenKey renovada.');
    } catch (err) {
      console.error('[positionsWorker] Erro ao renovar listenKey:', err.message);
    }
  }, 25 * 60 * 1000);
}

// Inicia WebSocket
async function iniciarWs() {
  try {
    listenKey = await criarListenKey();
    const wsUrl = `wss://fstream.binance.com/ws/${listenKey}`;
    ws = new WebSocket(wsUrl);

    ws.on('open', () => {
      console.log('[positionsWorker] WebSocket conectado.');
      carregarCache();
    });

    ws.on('message', (msg) => {
      try {
        const data = JSON.parse(msg);

        // Evento de atualização de conta (posições)
        if (data.e === 'ACCOUNT_UPDATE') {
          const posicoes = data.a.P;
          const novas = { ...positions }; // preserva posições existentes

          for (const p of posicoes) {
            const amt = parseFloat(p.pa);
            if (amt !== 0) {
              novas[p.s] = {
                symbol: p.s,
                positionAmt: p.pa,
                entryPrice: p.ep,
                markPrice: p.mp || "0",
                unRealizedProfit: p.up || "0",
                liquidationPrice: p.l || "0",
                leverage: p.cr || "0",
                marginType: p.mt || "isolated",
                isolatedMargin: p.iw || "0",
                positionSide: p.ps || "BOTH",
                updateTime: Date.now()
              };
            } else {
              delete novas[p.s];
            }
          }

          positions = novas;
          salvarCache();
          console.log(`[positionsWorker] Cache atualizado (${Object.keys(positions).length} posições).`);
        }
      } catch (err) {
        console.error('[positionsWorker] Erro ao processar WS:', err.message);
      }
    });

    ws.on('close', () => {
      console.log('[positionsWorker] WS fechado. Reabrindo...');
      listenKey = null;
      setTimeout(iniciarWs, 4000);
    });

    ws.on('error', (err) => {
      console.error('[positionsWorker] WS erro:', err.message);
    });

    manterListenKey();

  } catch (err) {
    console.error('[positionsWorker] Erro ao iniciar:', err.message);
    setTimeout(iniciarWs, 5000);
  }
}

iniciarWs();