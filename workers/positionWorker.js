// workers/positionWorker.js
const WebSocket = require('ws');
const axios = require('axios');
const { parentPort } = require('worker_threads');
const positionCache = require('./positionCache.js');
require('dotenv').config();

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.SECRET_KEY;
const BASE_URL = 'https://fapi.binance.com';

async function criarListenKey() {
  const res = await axios.post(`${BASE_URL}/fapi/v1/listenKey`, null, {
    headers: { 'X-MBX-APIKEY': API_KEY }
  });
  return res.data.listenKey;
}

async function iniciarWs() {
  try {
    const listenKey = await criarListenKey();
    const ws = new WebSocket(`wss://fstream.binance.com/ws/${listenKey}`);

    ws.on('open', () => {
      console.log(`✅ positionWorker conectado ao User Data Stream`);
    });

    ws.on('message', (msg) => {
      const data = JSON.parse(msg);

      if (data.e === 'ACCOUNT_UPDATE') {
        const positions = data.a?.P || [];

        // Atualiza cache local
        let active = {};
        for (const p of positions) {
          if (parseFloat(p.pa) !== 0) {
            active[p.s] = p;
          }
        }
        positionCache.positions = active;
        positionCache.count = Object.keys(active).length;

        parentPort?.postMessage({
          type: 'positionsUpdated',
          count: positionCache.count,
          symbols: Object.keys(active)
        });
      }
    });

    ws.on('close', () => {
      console.log('⚠️ WS desconectado, tentando reconectar...');
      setTimeout(iniciarWs, 4000);
    });

    ws.on('error', (err) => {
      console.error('❌ Erro WS:', err.message);
    });
  } catch (err) {
    console.error('❌ Erro ao iniciar WS:', err.message);
    setTimeout(iniciarWs, 4000);
  }
}

iniciarWs();