const axios = require('axios');
// Global axios timeout for all requests (ms). Set via env GLOBAL_AXIOS_TIMEOUT.
const GLOBAL_AXIOS_TIMEOUT = parseInt(process.env.GLOBAL_AXIOS_TIMEOUT) || 50;
axios.defaults.timeout = GLOBAL_AXIOS_TIMEOUT;
//const retryAxios = require('retry-axios');
const queryString = require('querystring');
const crypto = require('crypto');

const apiKey = process.env.API_KEY;
const apiSecret = process.env.SECRET_KEY;

//const apiUrl = process.env.API_URL_SPOT;
//const apiUrlFut = process.env.API_URL_FUT;
//const symbol = process.env.SYMBOL;

const apiUrl = 'https://api.binance.com';
const apiUrlFut = 'https://fapi.binance.com';
const symbol = 'BTCUSDT';
/*
const https = require('https');

let conectado = true;

// Função para verificar conexão
async function verificarConexao(callback) {
  https.get('https://www.google.com', (res) => {
    callback(true);
  }).on('error', (err) => {
    callback(false);
  });
}
*/

const https = require('https');

let conectado = true;
// Verifica conexão com a internet
function verificarConexao() {
  return new Promise((resolve) => {
    https.get('https://www.google.com', (res) => {
      resolve(true);
    }).on('error', () => {
      resolve(false);
    });
  });
}

const Bottleneck = require('bottleneck');

// --- Bottleneck-based rate limiter to avoid Binance "too many requests" bans
// Defaults set to conservative values; override via env vars if needed
const BINANCE_MIN_TIME_MS = parseInt(process.env.BINANCE_MIN_TIME_MS) || 300; // ms between requests (controls RPS)
const BINANCE_RESERVOIR = parseInt(process.env.BINANCE_RESERVOIR) || 60; // requests per minute (adjust as needed)
const BINANCE_RESERVOIR_REFRESH_INTERVAL = 60 * 1000; // 1 minute
const BINANCE_STATS_LOG_INTERVAL_MS = process.env.BINANCE_STATS_LOG_INTERVAL_MS ? parseInt(process.env.BINANCE_STATS_LOG_INTERVAL_MS) : 60000; // set 0 to disable periodic logging

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: BINANCE_MIN_TIME_MS,
  reservoir: BINANCE_RESERVOIR,
  reservoirRefreshAmount: BINANCE_RESERVOIR,
  reservoirRefreshInterval: BINANCE_RESERVOIR_REFRESH_INTERVAL
});

// Simple in-memory metrics for monitoring
const rateMetrics = {
  requests: 0,
  retries: 0,
  rateLimit429: 0,
  rateLimit418: 0,
  last429At: null,
  last418At: null,
  lastError: null,
  lastRequestAt: null
};

// Helper that runs axios calls through the limiter and retries on rate-limit (418/429) / 5xx with backoff
async function requestWithRateLimit(opts, maxAttempts = 5) {
  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      const res = await limiter.schedule(() => axios(opts));
      // optional: observe weight headers
      const used = res.headers?.['x-mbx-used-weight'] || res.headers?.['x-mbx-used-weight-(apiKey)'];
      if (used) {
        // console.debug('Binance used weight:', used);
      }
      rateMetrics.requests++;
      rateMetrics.lastRequestAt = Date.now();
      return res;
    } catch (err) {
      attempts++;
      rateMetrics.retries++;
      const status = err.response?.status;
      // Rate limited by Binance (429 or 418 - some endpoints return 418 for bans)
      if (status === 429 || status === 418) {
        if (status === 429) {
          rateMetrics.rateLimit429++;
          rateMetrics.last429At = Date.now();
        } else {
          rateMetrics.rateLimit418++;
          rateMetrics.last418At = Date.now();
        }
        const retryAfter = parseInt(err.response.headers['retry-after'] || err.response.headers['Retry-After'] || '1', 10);
        const waitMs = (isNaN(retryAfter) ? 1000 : retryAfter * 1000) + Math.floor(Math.random() * 500);
        console.warn(`Binance ${status} - waiting ${waitMs}ms before retry (attempt ${attempts})`);
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }
      // Transient server/network errors -> exponential backoff
      if (status >= 500 || err.code === 'ETIMEDOUT' || err.code === 'ECONNRESET') {
        rateMetrics.lastError = err.message;
        const waitMs = Math.pow(2, attempts) * 250 + Math.floor(Math.random() * 250);
        console.warn(`Transient error (status: ${status || err.code}). Backing off ${waitMs}ms (attempt ${attempts})`);
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }
      rateMetrics.lastError = err.message;
      throw err;
    }
  }
  throw new Error('Max retries reached for request');
}

function getRateLimitStats() {
  return {
    requests: rateMetrics.requests,
    retries: rateMetrics.retries,
    rateLimit429: rateMetrics.rateLimit429,
    rateLimit418: rateMetrics.rateLimit418,
    last429At: rateMetrics.last429At,
    last418At: rateMetrics.last418At,
    lastError: rateMetrics.lastError,
    lastRequestAt: rateMetrics.lastRequestAt,
    minTimeMs: BINANCE_MIN_TIME_MS,
    reservoir: BINANCE_RESERVOIR,
    reservoirRefreshInterval: BINANCE_RESERVOIR_REFRESH_INTERVAL
  };
}

function resetRateLimitStats() {
  rateMetrics.requests = 0;
  rateMetrics.retries = 0;
  rateMetrics.rateLimit429 = 0;
  rateMetrics.rateLimit418 = 0;
  rateMetrics.last429At = null;
  rateMetrics.last418At = null;
  rateMetrics.lastError = null;
  rateMetrics.lastRequestAt = null;
}

function logRateLimitStats() {
  const s = getRateLimitStats();
  console.info(`[RateLimitStats] req=${s.requests} 429=${s.rateLimit429} retries=${s.retries} minTime=${s.minTimeMs} reservoir=${s.reservoir} last429=${s.last429At?new Date(s.last429At).toISOString():'-'} lastErr=${s.lastError||'-'}`);
}

if (BINANCE_STATS_LOG_INTERVAL_MS && BINANCE_STATS_LOG_INTERVAL_MS > 0) {
  setInterval(logRateLimitStats, BINANCE_STATS_LOG_INTERVAL_MS);
} 

/*
// Loop para checar conexão constantemente
setInterval(async () => {
  const status = await verificarConexao();

  if (status && !conectado) {
    console.log('Conexão restabelecida. Retomando...');
    conectado = true;
  } else if (!status && conectado) {
    console.log('Conexão perdida. Pausando...');
    conectado = false;
  }
}, 5000); // Verifica a cada 5 segundos

// Função principal assíncrona
async function tarefaPrincipal() {
  if (!conectado) {
    console.log('Sistema pausado aguardando internet...');
    return;
  }

  try {
    // Simulação de tarefa async (ex: chamada de API, leitura de arquivo etc)
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Tarefa executada com sucesso!');
  } catch (err) {
    console.error('Erro ao executar tarefa:', err.message);
  }
}

// Executa a função principal em loop
setInterval(() => {
  tarefaPrincipal();
}, 3000);

// Verifica conexão periodicamente
setInterval(() => {
  verificarConexao((status) => {
    if (status && !conectado) {
      console.log('Conexão restabelecida. Retomando operações...');
      conectado = true;
    } else if (!status && conectado) {
      console.log('Sem conexão com a internet. Pausando operações...');
      conectado = false;
    }
  });
}, 5000); // Checa a cada 5 segundos

// Simulação de operação contínua
setInterval(() => {
  if (!conectado) {
    console.log('Sistema pausado...');
    return;
  }

  // Aqui vai sua lógica principal que deve rodar quando há conexão
  console.log('Executando tarefa com internet...');
}, 2000);
*/




async function publicCall(path, data, method = 'GET', headers = {}) {
  var status = await verificarConexao();
  if (status) {
    try {
      // sync server time then perform request through rate-limiter
      const timeRes = await requestWithRateLimit({ method: 'get', url: `${apiUrl}/api/v3/time` });
      const serverTime = timeRes.data.serverTime; // ex.: 1659123456789
      const localTime = Date.now();
      const offset = serverTime - localTime;
      let timestamp = Date.now() + offset;

      const qs = data ? `?${queryString.stringify(data)}` : '';
      const result = await requestWithRateLimit({ method, url: `${apiUrl}${path}${qs}` });
      return result;
    } catch (err) {
      console.error(err);
    }
  }
} 

async function publicFutCall(path, data, method = 'GET', headers = {}) {
  var status = await verificarConexao();
  if (status) {
    try {
      const timeRes = await requestWithRateLimit({ method: 'get', url: `${apiUrl}/api/v3/time` });
      const serverTime = timeRes.data.serverTime; // ex.: 1659123456789
      const localTime = Date.now();
      const offset = serverTime - localTime;
      let timestamp = Date.now() + offset;

      const qs = data ? `?${queryString.stringify(data)}` : '';
      const result = await requestWithRateLimit({ method, url: `${apiUrlFut}${path}${qs}` });
      return result;
    } catch (err) {
      console.error(err);
    }
  }

} 

async function privateCall(path, timestampOld, data = {}, method = 'GET') {
  var status = await verificarConexao();
  if (status) {
    try {
      // sync time
      const timeRes = await requestWithRateLimit({ method: 'get', url: `${apiUrl}/api/v3/time` });
      const serverTime = timeRes.data.serverTime;
      const localTime = Date.now();
      const offset = serverTime - localTime;
      let timestamp = Date.now() + offset;

      if (!apiKey || !apiSecret) {
        throw new Error('Preencha corretamente sua API KEY e SECRET KEY');
      }
      const type = "FUTURES";
      const recvWindow = 50000;//máximo permitido, default 5000

      const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(`${queryString.stringify({ ...data, type, timestamp, recvWindow })}`)
        .digest('hex');

      const newData = { ...data, type, timestamp, recvWindow, signature };
      const qs = `?${queryString.stringify(newData)}`;

      const result = await requestWithRateLimit({
        method,
        url: `${apiUrl}${path}${qs}`,
        headers: { 'X-MBX-APIKEY': apiKey }
      });
      return result.data;
    } catch (err) {
      console.log(err);
    }
  }

} 

// Defina o número de retries e o tempo de espera entre retries
const retryConfig = {
    retries: 3,
    retryDelay: (retryCount) => {
        return retryCount * 1000; // 1 segundo, 2 segundos, 3 segundos
    },
};


async function privateFutCall(path, timestampOld, data = {}, method = 'GET') {
  var status = await verificarConexao();
  if (status) {
    try {
      const timeRes = await requestWithRateLimit({ method: 'get', url: `${apiUrl}/api/v3/time` });
      const serverTime = timeRes.data.serverTime;
      const localTime = Date.now();
      const offset = serverTime - localTime;
      let timestamp = Date.now() + offset;

      if (!apiKey || !apiSecret) {
        throw new Error('Preencha corretamente sua API KEY e SECRET KEY');
      }
      const type = "FUTURES";
      const recvWindow = 50000;//máximo permitido, default 5000

      const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(`${queryString.stringify({ ...data, type, timestamp, recvWindow })}`)
        .digest('hex');

      const newData = { ...data, type, timestamp, recvWindow, signature };
      const qs = `?${queryString.stringify(newData)}`;

      const result = await requestWithRateLimit({
        method,
        url: `${apiUrlFut}${path}${qs}`,
        headers: { 'X-MBX-APIKEY': apiKey }
      });
      return result.data;
    } catch (err) {
      console.log(err);
    }
  }

} 

async function privateFutCall2(path, timestampOld, data = {}, method = 'GET') {
  var status = await verificarConexao();
  if (status) {
    try {
      const timeRes = await requestWithRateLimit({ method: 'get', url: `${apiUrl}/api/v3/time` });
      const serverTime = timeRes.data.serverTime;
      const localTime = Date.now();
      const offset = serverTime - localTime;
      let timestamp = Date.now() + offset;

      if (!apiKey || !apiSecret) {
        throw new Error('Preencha corretamente sua API KEY e SECRET KEY');
      }
      const recvWindow = 50000;//máximo permitido, default 5000

      const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(`${queryString.stringify({ ...data, recvWindow, timestamp })}`)
        .digest('hex');

      const newData = { ...data, recvWindow, timestamp, signature };
      const qs = `?${queryString.stringify(newData)}`;

      const result = await requestWithRateLimit({
        method,
        url: `${apiUrlFut}${path}${qs}`,
        headers: { 'X-MBX-APIKEY': apiKey }
      });
      return result.data;
    } catch (err) {
      console.log(err);
    }
  }

}

async function time() {
    return publicCall('/api/v3/time');
}

async function depth(symbol = 'BTCBRL', limit = 5) {
    return publicCall('/api/v3/depth', { symbol, limit });
}

async function exchangeInfo(symbol) {
    const result = await publicCall('/api/v3/exchangeInfo');
    return symbol ? result.symbols.find(s => s.symbol === symbol) : result.symbols;
}

async function accountInfo() {
    return privateCall('/v3/account');
}

async function accountSnapshot(timestamp) {

    return privateCall('/sapi/v1/accountSnapshot', timestamp);
}

async function balance(timestamp) {

    return privateFutCall('/fapi/v2/balance', timestamp);
}

async function accountFutures(timestamp) {

    return privateFutCall('/fapi/v2/account', timestamp);
}

async function klines(interval, symbol) {
    const limit = 401;
    //return publicCall('/api/v3/klines',{symbol, interval, limit});
    return publicFutCall('/fapi/v1/klines', { symbol, interval, limit });
}

async function openOrders(timestamp) {

    return privateFutCall('/fapi/v1/openOrders', timestamp);
}

async function allOrders(timestamp) {

    return privateFutCall('/fapi/v1/allOrders', timestamp);
}

async function cancelAllOrders(timestamp) {

    return privateFutCall2('/fapi/v1/allOpenOrders', timestamp, { symbol }, 'DELETE');
}

async function cancelOrder(symbol, orderId) {
    const timestamp = Date.now();
    return privateFutCall2('/fapi/v1/order', timestamp, { symbol, orderId }, 'DELETE');
}


/*
DELETE /fapi/v1/allOpenOrders (HMAC SHA256)

Weight: 1

Parameters:

Name	Type	Mandatory	Description
symbol	STRING	YES	
recvWindow	LONG	NO	
timestamp	LONG	YES
*/

/*
async function newOrder(timestamp, side, type = "TRAILING_STOP_MARKET", quantity = 0.003, callbackRate = 0.3){

    return privateFutCall2('/fapi/v1/order',timestamp, {symbol, side, type, quantity, callbackRate}, "POST");
}
*/

async function newStopLossBuy(timestamp, newClientOrderId, stopPrice, symbol) {
    const side = "BUY";
    const type = "STOP_MARKET";

    return privateFutCall2('/fapi/v1/order', timestamp, { symbol, newClientOrderId, side, type, stopPrice, closePosition: true/*, timeInForce:'GTC'*/ }, "POST");
}

async function modifyStopLossBuy(timestamp, orderId, price, symbol, quantity) {
    const side = "BUY";
    //const quantity = "1000";

    //const type = "STOP_MARKET";

    return privateFutCall2('/fapi/v1/order', timestamp, { symbol, orderId, side, /* type,*/ price, quantity, closePosition: true/*, timeInForce:'GTC'*/ }, "PUT");
}



async function newStopLossSell(timestamp, newClientOrderId, stopPrice, symbol) {
    const side = "SELL";
    const type = "STOP_MARKET";

    return privateFutCall2('/fapi/v1/order', timestamp, { symbol, newClientOrderId, side, type, stopPrice, closePosition: true/*, timeInForce:'GTC'*/ }, "POST");
}


async function modifyStopLossSell(timestamp, orderId, price, symbol, quantity) {
    const side = "SELL";
    //const quantity = "0";
    //const type = "STOP_MARKET";

    return privateFutCall2('/fapi/v1/order', timestamp, { symbol, orderId, side, /* type,*/ price, quantity, closePosition: true/*, timeInForce:'GTC'*/ }, "PUT");
}



async function newTakeProfitBuy(timestamp, newClientOrderId, stopPrice, symbol) {
    const side = "BUY";
    const type = "TAKE_PROFIT_MARKET";

    return privateFutCall2('/fapi/v1/order', timestamp, { symbol, newClientOrderId, side, type, stopPrice, closePosition: true, timeInForce: 'GTC' }, "POST");
}

async function newTakeProfitSell(timestamp, newClientOrderId, stopPrice, symbol) {
    const side = "SELL";
    const type = "TAKE_PROFIT_MARKET";

    return privateFutCall2('/fapi/v1/order', timestamp, { symbol, newClientOrderId, side, type, stopPrice, closePosition: true, timeInForce: 'GTC' }, "POST");
}

// let params =  {type:'STOP_MARKET',closePosition:true,stopPrice:price,positionSide:type,timeInForce:'GTC',newClientOrderId:orderID}

async function newOrderLimit(side, timestamp, quantity, symbol, price) {
const agora = Date.now();

//const expiracao_5min = agora + (5 * 60 * 1000);     // +300000 ms
//const expiracao_10min = agora + (10 * 60 * 1000);   // +600000 ms
//const expiracao_15min = agora + (15 * 60 * 1000);   // +900000 ms
const expiracao_30min = agora + (30 * 60 * 1000);   // +900000 ms

//console.log('Expiração em 5 min:', expiracao_5min);
//console.log('Expiração em 10 min:', expiracao_10min);
//console.log('Expiração em 15 min:', expiracao_15min);
console.log('Expiração em 30 min:', expiracao_30min);
    const timeInForce = "GTD";
    //const side = "BUY";
    const type = "LIMIT";
    
    const goodTillDate = expiracao_30min;

    return privateFutCall2('/fapi/v1/order', timestamp, { symbol, side, type, quantity, price, timeInForce, goodTillDate}, "POST");
}

async function newOrderBuy(timestamp, quantity, symbol) {
    const side = "BUY";
    const type = "MARKET";

    return privateFutCall2('/fapi/v1/order', timestamp, { symbol, side, type, quantity }, "POST");
}

async function newOrderSell(timestamp, quantity, symbol) {
    const side = "SELL";
    const type = "MARKET";

    return privateFutCall2('/fapi/v1/order', timestamp, { symbol, side, type, quantity }, "POST");
}

async function newStopBuy(stop, timestamp) {

    const side = "SELL";
    const type = "STOP_MARKET";
    const closePosition = "true";
    const workingType = "MARK_PRICE";
    const stopPrice = stop;

    return privateFutCall2('/fapi/v1/order', timestamp, { symbol, side, type, closePosition, workingType, stopPrice }, "POST");
}

async function newStopSell(stop, timestamp) {
    const side = "BUY";
    const type = "STOP_MARKET";
    const closePosition = "true";
    const workingType = "MARK_PRICE";
    const stopPrice = stop;

    return privateFutCall2('/fapi/v1/order', timestamp, { symbol, side, type, closePosition, workingType, stopPrice }, "POST");
}

async function newTakeBuy(stop, timestamp) {

    const side = "SELL";
    const type = "TAKE_PROFIT_MARKET";
    const closePosition = "true";
    //const workingType = "MARK_PRICE";
    const stopPrice = stop;

    return privateFutCall2('/fapi/v1/order', timestamp, { symbol, side, type, closePosition, /*workingType,*/ stopPrice }, "POST");
}

async function newTakeSell(stop, timestamp) {
    const side = "BUY";
    const type = "TAKE_PROFIT_MARKET";
    const closePosition = "true";
    //const workingType = "MARK_PRICE";
    const stopPrice = stop;

    return privateFutCall2('/fapi/v1/order', timestamp, { symbol, side, type, closePosition, /*workingType,*/ stopPrice }, "POST");
}

async function closePositionBuy(timestamp, quantity, symbol) {
    const side = "SELL";
    const type = "MARKET";
    const reduceOnly = "true";
    quantity = parseFloat(quantity * 4);

    return privateFutCall2('/fapi/v1/order', timestamp, { symbol, side, type, quantity, reduceOnly }, "POST");
}

async function closePositionSell(timestamp, quantity, symbol) {
    const side = "BUY";
    const type = "MARKET";
    const reduceOnly = "true";
    quantity = parseFloat(quantity * 4);

    return privateFutCall2('/fapi/v1/order', timestamp, { symbol, side, type, quantity, reduceOnly }, "POST");
}

async function closeAllsltpBySymbol(timestamp, countdownTime, symbol) {

    return privateFutCall2('/fapi/v1/countdownCancelAll', timestamp, { symbol, countdownTime }, "POST");
}


async function income(timestamp) {

    return privateFutCall('/fapi/v1/income', timestamp);
}

async function userTrades(timestamp, symbol) {
    const limit = 50;
    return privateFutCall('/fapi/v1/userTrades', timestamp, { symbol, limit });
}

async function getPositRisk(symbol) {
    const timestamp = Date.now()-1000;
    const recvWindow = 10000;

    return privateFutCall2('/fapi/v2/positionRisk', timestamp, { symbol, recvWindow });
}

async function getMaxLeverage(symbol) {
    const timestamp = Date.now()-1000;
    
    return privateFutCall2('/fapi/v1/leverageBracket', timestamp, { symbol });
}

async function setLeverage(symbol, leverage) {
    const timestamp = Date.now();
    
    return privateFutCall2('/fapi/v1/leverage', timestamp, { symbol, leverage }, "POST");
}

async function setMargIsolated(symbol) {
    const timestamp = Date.now();
    //const marginType = "ISOLATED";
    const marginType = "CROSSED";

    return privateFutCall2('/fapi/v1/marginType', timestamp, { symbol, marginType }, "POST");
}

module.exports = { time, depth, exchangeInfo, accountSnapshot, balance, accountFutures, klines, openOrders, allOrders, newOrderLimit, newOrderBuy, newOrderSell, newStopLossBuy, modifyStopLossBuy, newStopLossSell, modifyStopLossSell, newTakeProfitBuy, newTakeProfitSell, cancelOrder, cancelAllOrders, closePositionSell, closePositionBuy, closeAllsltpBySymbol, income, userTrades, newStopBuy, newStopSell, newTakeBuy, newTakeSell, getPositRisk, getMaxLeverage, setLeverage, setMargIsolated, getRateLimitStats, resetRateLimitStats, logRateLimitStats }

/*
GET /sapi/v1/accountSnapshot (HMAC SHA256)

Weight(IP): 2400

Parameters:

Name	Type	Mandatory	Description
type	STRING	YES	"SPOT", "MARGIN", "FUTURES"
startTime	LONG	NO	
endTime	LONG	NO	
limit	INT	NO	min 7, max 30, default 7
recvWindow	LONG	NO	
timestamp	LONG	YES



GET /api/v3/klines

Kline/candlestick bars for a symbol.
Klines are uniquely identified by their open time.

Weight(IP): 1

Parameters:

Name	Type	Mandatory	Description
symbol	STRING	YES	
interval	ENUM	YES	
startTime	LONG	NO	
endTime	LONG	NO	
limit	INT	NO

[
  [
    1499040000000,      // Open time
    "0.01634790",       // Open
    "0.80000000",       // High
    "0.01575800",       // Low
    "0.01577100",       // Close
    "148976.11427815",  // Volume
    1499644799999,      // Close time
    "2434.19055334",    // Quote asset volume
    308,                // Number of trades
    "1756.87402397",    // Taker buy base asset volume
    "28.46694368",      // Taker buy quote asset volume
    "17928899.62484339" // Ignore.
  ]
]

*/