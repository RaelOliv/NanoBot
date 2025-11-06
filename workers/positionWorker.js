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
const CACHE_PATH = path.resolve(__dirname, 'cachepos.json');

// Garante que o arquivo exista
function garantirCache() {
  if (!fs.existsSync(CACHE_PATH)) {
    fs.writeFileSync(CACHE_PATH, '{}');
    console.log('[positionsWorker] cachepos.json criado.');
  }
}
garantirCache();

let positions = {};

// Salva cache no disco
function salvarCache() {
  try {
    fs.writeFileSync(CACHE_PATH, JSON.stringify(positions, null, 2));
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

    ws.on('open', () => console.log('[positionsWorker] WebSocket conectado.'));

    ws.on('message', (msg) => {
      try {
        const data = JSON.parse(msg);

        // Evento de atualização de conta (posições)
        if (data.e === 'ACCOUNT_UPDATE') {
          const posicoes = data.a.P;
          const novas = {};

          for (const p of posicoes) {
            // Apenas posições abertas (positionAmt !== 0)
            if (parseFloat(p.pa) !== 0) {
              novas[p.s] = {
                symbol: p.s,                // Ex: BTCUSDT
                positionAmt: p.pa,          // Quantidade
                entryPrice: p.ep,           // Preço de entrada
                markPrice: p.mp || "0",     // Preço de marcação (se disponível)
                unRealizedProfit: p.up || "0",
                liquidationPrice: p.l || "0",
                leverage: p.cr || "0",
                marginType: p.mt || "isolated",
                isolatedMargin: p.iw || "0",
                positionSide: p.ps || "BOTH",
                updateTime: Date.now()
              };
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