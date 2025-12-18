// workers/positionWorker.js
const WebSocket = require('ws');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const { parentPort, workerData } = require('worker_threads');


const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;
const BASE_URL = 'https://fapi.binance.com';

if (!API_KEY || !SECRET_KEY) {
  console.error('[positionsWorker] ERRO: API_KEY e SECRET_KEY devem estar no .env');
  process.exit(1);
}

let ws = null;
let listenKey = null;
let periodicStarted = false;
let listenKeyRenewTimer = null;

// Caminho do cache
const CACHE_DIR = path.resolve(__dirname, 'cache');
const CACHE_PATH = path.resolve(CACHE_DIR, 'cachepos.json');

// Garante que a pasta e o arquivo existam
function garantirCache() {
  try {
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
    if (!fs.existsSync(CACHE_PATH)) fs.writeFileSync(CACHE_PATH, '{}');
  } catch (err) {
    console.error('[positionsWorker] Erro ao garantir cache:', err.message);
  }
}
garantirCache();

let positions = {};
let lastPNL = null;

// Carrega cache existente
function carregarCacheLocal() {
  try {
    const data = fs.readFileSync(CACHE_PATH, 'utf8');
    positions = JSON.parse(data || '{}');
    console.log(`[positionsWorker] Cache local carregado (${Object.keys(positions).length} posições).`);
  } catch (err) {
    console.error('[positionsWorker] Erro ao carregar cache local:', err.message);
    positions = {};
  }
}

// Read cache from disk safely and parse JSON
function readCacheFromFile() {
  try {
    const raw = fs.readFileSync(CACHE_PATH, 'utf8');
    return JSON.parse(raw || '{}');
  } catch (err) {
    return {};
  }
}

// Get persisted plus/minus values for a symbol from memory cache first then disk
function getCachedPlusMinus(symbol) {
  try {
    if (positions && positions[symbol]) {
      return {
        plus: positions[symbol].plus || 0,
        minus: positions[symbol].minus || 0,
        percent: parseFloat(positions[symbol].percent) || 0,
        maxPercent: parseFloat(positions[symbol].maxPercent) || 0,
        minPercent: parseFloat(positions[symbol].minPercent) || 0
      };
    }
    const disk = readCacheFromFile();
    if (disk && disk[symbol]) {
      return {
        plus: disk[symbol].plus || 0,
        minus: disk[symbol].minus || 0,
        percent: parseFloat(disk[symbol].percent) || 0,
        maxPercent: parseFloat(disk[symbol].maxPercent) || 0,
        minPercent: parseFloat(disk[symbol].minPercent) || 0
      };
    }
  } catch (err) {
    // ignore
  }
  return { plus: 0, minus: 0, percent: 0, maxPercent: 0, minPercent: 0 };
}

// Salva cache
function salvarCache() {
  try {
    fs.writeFileSync(CACHE_PATH, JSON.stringify(positions, null, 2));
  } catch (err) {
    console.error('[positionsWorker] Erro ao salvar cache:', err.message);
  }
}

// Função para carregar o cache de um arquivo
function carregarCache(currencyPair) {
  cacheFilePath = path.join(__dirname, `cache/${currencyPair}.json`);

  try {
    const data = fs.readFileSync(cacheFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}


// Helper: cria query string assinada
function signQuery(paramsObj, secret) {
  const params = new URLSearchParams(paramsObj).toString();
  const signature = crypto.createHmac('sha256', secret).update(params).digest('hex');
  return `${params}&signature=${signature}`;
}



// 🔍 Sincroniza cache com posições reais da conta (assinada)
async function sincronizarPosicoesAtuais() {
  if (!SECRET_KEY) {
    console.error('[positionsWorker] SECRET_KEY não encontrado - não é possível assinar requests.');
    return;
  }

  try {
    const timestamp = Date.now();
    const paramsObj = { timestamp }; // pode incluir recvWindow se quiser
    const q = signQuery(paramsObj, SECRET_KEY);

    const url = `${BASE_URL}/fapi/v2/positionRisk?${q}`;

    const res = await axios.get(url, {
      headers: { 'X-MBX-APIKEY': API_KEY },
      timeout: 15_000,
    });

    let cachepos = await carregarCache('cachepos');

    const todas = res.data || [];
    const abertas = todas.filter(p => parseFloat(p.positionAmt) !== 0);

    let novas = {};
    for (const p of abertas) {
      // calculate unrealized percent relative to isolatedMargin if possible;
      // if isolatedMargin is zero (cross margin) fallback to initial margin estimate
      const up = parseFloat(p.unRealizedProfit) || 0.0;
      const im = parseFloat(p.isolatedMargin) || 0.0;
      const amt = Math.abs(parseFloat(p.positionAmt) || 0.0);
      const ep = parseFloat(p.entryPrice) || 0.0;
      const lev = Math.abs(parseFloat(p.leverage) || 1.0);
      let initialMargin = 0.0;
      if (im > 0) {
        initialMargin = im;
      } else if (amt > 0 && ep > 0 && lev > 0) {
        initialMargin = (amt * ep) / lev;
      }
      let percent = 0.0;
      if (initialMargin > 0) percent = (up / initialMargin) * 100;
      const saved = getCachedPlusMinus(p.symbol);
      let maxPercent = saved.maxPercent ?? saved.percent ?? percent;
      let minPercent = saved.minPercent ?? saved.percent ?? percent;
      if (percent > maxPercent) maxPercent = percent;
      if (percent < minPercent) minPercent = percent;
      novas[p.symbol] = {
        symbol: p.symbol,
        positionAmt: p.positionAmt,
        entryPrice: p.entryPrice,
        markPrice: p.markPrice,
        unRealizedProfit: p.unRealizedProfit,
        liquidationPrice: p.liquidationPrice,
        leverage: p.leverage,
        marginType: p.marginType,
        isolatedMargin: p.isolatedMargin,
        percent: parseFloat(percent.toFixed(3)),
        maxPercent: parseFloat(maxPercent.toFixed(3)),
        minPercent: parseFloat(minPercent.toFixed(3)),
        positionSide: p.positionSide,
        plus: saved.plus || 0,
        minus: saved.minus || 0,
        updateTime: Date.now(),
      };

      if (cachepos[p.symbol]) {
        novas[p.symbol].plus = cachepos[p.symbol].plus;
      }
    }

    const antigos = Object.keys(positions);
    const novosKeys = Object.keys(novas);

    const removidos = antigos.filter(s => !novosKeys.includes(s));
    const adicionados = novosKeys.filter(s => !antigos.includes(s));

    // Persiste sempre os dados atualizados (inclui unRealizedProfit / percent)
    positions = novas;
    salvarCache();
    console.log(`[positionsWorker] 🔄 Sincronização REST concluída. Abertas: ${novosKeys.length}`);
    if (removidos.length) console.log(`  - Removidas: ${removidos.join(', ')}`);
    if (adicionados.length) console.log(`  - Novas: ${adicionados.join(', ')}`);
  } catch (err) {
    if (err.response && err.response.data) {
      console.error('[positionsWorker] Erro API:', err.response.status, JSON.stringify(err.response.data));
    } else {
      console.error('[positionsWorker] Erro ao sincronizar posições:', err.message);
    }
  }
}

// Mantém listenKey ativa (chamada PUT a cada 25 minutos)
function iniciarRenovacaoListenKey() {
  if (listenKeyRenewTimer) return;
  listenKeyRenewTimer = setInterval(async () => {
    if (!listenKey) return;
    try {
      await axios.put(`${BASE_URL}/fapi/v1/listenKey`, null, {
        headers: { 'X-MBX-APIKEY': API_KEY },
        timeout: 10_000,
      });
      console.log('[positionsWorker] listenKey renovada.');
    } catch (err) {
      console.error('[positionsWorker] Erro ao renovar listenKey:', err.message);
    }
  }, 25 * 60 * 1000); // 25 minutos
}

// Cria listenKey
async function criarListenKey() {
  try {
    const res = await axios.post(`${BASE_URL}/fapi/v1/listenKey`, null, {
      headers: { 'X-MBX-APIKEY': API_KEY },
      timeout: 10_000,
    });
    return res.data.listenKey;
  } catch (err) {
    if (err.response && err.response.data) {
      console.error('[positionsWorker] Erro criando listenKey:', err.response.status, JSON.stringify(err.response.data));
    } else {
      console.error('[positionsWorker] Erro criando listenKey:', err.message);
    }
    throw err;
  }
}

// ⏱️ Verificação automática de posições a cada intervalMinutes (inicia só uma vez)
function iniciarVerificacaoPeriodica(intervalMinutes = 1) {
  if (periodicStarted) return;
  periodicStarted = true;

  // schedule periódica
  setInterval(async () => {
    console.log('[positionsWorker] Executando verificação REST periódica...');
    await sincronizarPosicoesAtuais();
  }, intervalMinutes * 60 * 1000);

  console.log(`[positionsWorker] Verificação REST automática ativada (a cada ${intervalMinutes} minutos).`);
}

function gerarAssinatura(params) {
  const query = new URLSearchParams(params).toString();
  return crypto.createHmac('sha256', SECRET_KEY).update(query).digest('hex');
}

async function getLastClosedPositionPnL(symbol = null) {
  let timestamp = Date.now(); // + offset;
  let query = `timestamp=${timestamp}&limit=1000`;

  if (symbol) {
    query = `symbol=${symbol}&${query}`;
  }

  const signature = gerarAssinatura(query);
  const url = `${BASE_URL}/fapi/v1/userTrades?${query}&signature=${signature}`;

  const { data: trades } = await axios.get(url, {
    headers: {
      'X-MBX-APIKEY': process.env.API_KEY
    }
  });

  if (!Array.isArray(trades) || trades.length === 0) {
    return null;
  }

  // ordena por tempo (mais recente primeiro)
  trades.sort((a, b) => b.time - a.time);

  let pnl = 0;
  let positionQty = 0;
  let lastCloseTime = null;
  let tradeSymbol = null;

  for (const trade of trades) {
    const qty = Number(trade.qty);
    const realized = Number(trade.realizedPnl || 0);

    pnl += realized;

    positionQty += trade.side === 'BUY' ? qty : -qty;

    // posição zerou → posição fechada
    if (positionQty === 0 && pnl !== 0) {
      lastCloseTime = trade.time;
      tradeSymbol = trade.symbol;
      break;
    }
  }

  if (lastCloseTime === null) {
    return null;
  }

  return {
    symbol: tradeSymbol,
    pnl: Number(pnl.toFixed(4)),
    closedAt: new Date(lastCloseTime)
  };
}

// Inicia WebSocket
async function iniciarWs() {
  try {
    // fecha conexão anterior se existir
    if (ws) {
      try { ws.terminate(); } catch (e) { }
      ws = null;
    }

    listenKey = await criarListenKey();
    const wsUrl = `wss://fstream.binance.com/ws/${listenKey}`;
    ws = new WebSocket(wsUrl, { handshakeTimeout: 10_000 });

    ws.on('open', async () => {
      console.log('[positionsWorker] WebSocket conectado.');
      carregarCacheLocal();

      // sincronização inicial (REST assinada)
      await sincronizarPosicoesAtuais();
      lastPNL = await getLastClosedPositionPnL();
      // inicia renovação da listenKey e verificação periódica (apenas uma vez)
      iniciarRenovacaoListenKey();
      iniciarVerificacaoPeriodica(1);
    });

    ws.on('message', async (msg) => {
      try {
        const data = JSON.parse(msg);

        if (data.e === 'ACCOUNT_UPDATE') {
          const posicoes = data.a.P || [];
          const novas = { ...positions };

          let cachepos = carregarCache('cachepos');

          for (const p of posicoes) {
            const amt = parseFloat(p.pa);
            if (amt !== 0) {
              // compute percent relative to isolatedWallet (iw) if available
              const up = parseFloat(p.up) || 0.0;
              const iw = parseFloat(p.iw) || 0.0;
              const amt = Math.abs(parseFloat(p.pa) || 0.0);
              const ep = parseFloat(p.ep) || 0.0;
              const lev = Math.abs(parseFloat(p.cr) || 1.0);
              let initialMargin = 0.0;
              if (iw > 0) {
                initialMargin = iw;
              } else if (amt > 0 && ep > 0 && lev > 0) {
                initialMargin = (amt * ep) / lev;
              }
              let percent = 0.0;
              if (initialMargin > 0) percent = (up / initialMargin) * 100;
              const saved = getCachedPlusMinus(p.s);
              let maxPercent = saved.maxPercent ?? saved.percent ?? percent;
              let minPercent = saved.minPercent ?? saved.percent ?? percent;
              if (percent > maxPercent) maxPercent = percent;
              if (percent < minPercent) minPercent = percent;

              novas[p.s] = {
                symbol: p.s,
                positionAmt: p.pa,
                entryPrice: p.ep,
                markPrice: p.mp || '0',
                unRealizedProfit: p.up || '0',
                liquidationPrice: p.l || '0',
                leverage: p.cr || '0',
                marginType: p.mt || 'isolated',
                isolatedMargin: p.iw || '0',
                percent: parseFloat(percent.toFixed(3)),
                maxPercent: parseFloat(maxPercent.toFixed(3)),
                minPercent: parseFloat(minPercent.toFixed(3)),
                positionSide: p.ps || 'BOTH',
                plus: saved.plus || 0,
                minus: saved.minus || 0,
                updateTime: Date.now(),
              };

              if (cachepos[p.s]) {
                novas[p.s].plus = cachepos[p.s].plus;
              }

            } else {
              delete novas[p.s];
            }
          }

          positions = novas;
          salvarCache();
          console.log(`[positionsWorker] Cache atualizado via WS (${Object.keys(positions).length} posições).`);

          try {
            const res = await getLastClosedPositionPnL();
            if (res) {
              lastPNL = res;
              parentPort.postMessage(`lastPNL atualizado: ${JSON.stringify(lastPNL)}`);
            } else {
              parentPort.postMessage(`lastPNL: nenhum fechamento recente encontrado`);
            }
          } catch (err) {
            parentPort.postMessage(`erro ao obter lastPNL: ${err.message || err}`);
            console.error(`atualizarLastPnl error:`, err);
          }

        } else {
          // outros eventos podem ser tratados aqui, se necessário
          // console.log('[positionsWorker] Evento WS:', data.e);
        }
      } catch (err) {
        console.error('[positionsWorker] Erro ao processar WS:', err.message);
      }
    });

    ws.on('close', (code, reason) => {
      console.warn(`[positionsWorker] WS fechado (code=${code}). Reabrindo em 4s...`);
      listenKey = null;
      setTimeout(iniciarWs, 4000);
    });

    ws.on('error', (err) => {
      console.error('[positionsWorker] WS erro:', err.message || err);
      try { ws.terminate(); } catch (e) { }
    });

  } catch (err) {
    console.error('[positionsWorker] Erro ao iniciar WS:', err.message || err);
    setTimeout(iniciarWs, 5000);
  }
}

// Expose função para leitura programática (se outro worker quiser)
function getPositions() {
  return positions;
}

async function getLastPnL(){

          try {
            const res = await getLastClosedPositionPnL();
            if (res) {
              lastPNL = res;
              parentPort.postMessage(`lastPNL atualizado: ${JSON.stringify(lastPNL)}`);
            } else {
              parentPort.postMessage(`lastPNL: nenhum fechamento recente encontrado`);
            }
          } catch (err) {
            parentPort.postMessage(`erro ao obter lastPNL: ${err.message || err}`);
            console.error(`atualizarLastPnl error:`, err);
          }

  return lastPNL;
}

// inicia tudo
iniciarWs();

// Export (opcional se você quiser requerir este módulo)
module.exports = {
  getPositions, 
  getLastPnL
};