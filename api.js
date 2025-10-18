const axios = require('axios');
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
  if(status){
    
    // Passo 1: pegar hora do servidor

const res = await axios.get('https://api.binance.com/api/v3/time');

const serverTime = res.data.serverTime; // ex.: 1659123456789

// Passo 2: calcular diferença com seu relógio local
const localTime = Date.now();
const offset = serverTime - localTime;

// Passo 3: corrigir timestamp nas próximas requisições
let timestamp = Date.now() + offset;
    
    try {
        const qs = data ? `?${queryString.stringify(data)}` : '';
        const result = await axios({
            method,
            url: `${apiUrl}${path}${qs}`
        });
        return result;
    } catch (err) {
        console.error(err);
    }
  }
}

async function publicFutCall(path, data, method = 'GET', headers = {}) {
var status = await verificarConexao();
  if(status){
    
    // Passo 1: pegar hora do servidor
const res = await axios.get('https://api.binance.com/api/v3/time');
const serverTime = res.data.serverTime; // ex.: 1659123456789

// Passo 2: calcular diferença com seu relógio local
const localTime = Date.now();
const offset = serverTime - localTime;

// Passo 3: corrigir timestamp nas próximas requisições
let timestamp = Date.now() + offset;
    
    try {
        const qs = data ? `?${queryString.stringify(data)}` : '';
        const result = await axios({
            method,
            url: `${apiUrlFut}${path}${qs}`
        });
        return result;
    } catch (err) {
        console.error(err);
    }
  }

}

async function privateCall(path, timestampOld, data = {}, method = 'GET') {
var status = await verificarConexao();
  if(status){
    
    // Passo 1: pegar hora do servidor
const res = await axios.get('https://api.binance.com/api/v3/time');
const serverTime = res.data.serverTime; // ex.: 1659123456789

// Passo 2: calcular diferença com seu relógio local
const localTime = Date.now();
const offset = serverTime - localTime;

// Passo 3: corrigir timestamp nas próximas requisições
let timestamp = Date.now() + offset;
    
    if (!apiKey || !apiSecret) {
        throw new Error('Preencha corretamente sua API KEY e SECRET KEY');
    }
    const type = "FUTURES";
    //const timestamp = (Date.now())-1000;
    const recvWindow = 50000;//máximo permitido, default 5000

    const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(`${queryString.stringify({ ...data, type, timestamp, recvWindow })}`)
        .digest('hex');

    const newData = { ...data, type, timestamp, recvWindow, signature };
    const qs = `?${queryString.stringify(newData)}`;

    try {
        const result = await axios({
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
  if(status){
    
    // Passo 1: pegar hora do servidor
const res = await axios.get('https://api.binance.com/api/v3/time');
const serverTime = res.data.serverTime; // ex.: 1659123456789

// Passo 2: calcular diferença com seu relógio local
const localTime = Date.now();
const offset = serverTime - localTime;

// Passo 3: corrigir timestamp nas próximas requisições
let timestamp = Date.now() + offset;
    
    if (!apiKey || !apiSecret) {
        throw new Error('Preencha corretamente sua API KEY e SECRET KEY');
    }
    const type = "FUTURES";
    //const timestamp = (Date.now())-1000;
    const recvWindow = 50000;//máximo permitido, default 5000

    const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(`${queryString.stringify({ ...data, type, timestamp, recvWindow })}`)
        .digest('hex');

    const newData = { ...data, type, timestamp, recvWindow, signature };
    const qs = `?${queryString.stringify(newData)}`;

    /*
       try {
           const response = await retryAxios(api, retryConfig)[method.toLowerCase()](path, {
             params: data,
             headers,
           });
           return response.data;
         } catch (error) {
           throw new Error(`Erro ao fazer requisição: ${error.message}`);
         }
   */

    try {
        const result = await axios({
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
  if(status){
    
    // Passo 1: pegar hora do servidor
const res = await axios.get('https://api.binance.com/api/v3/time');
const serverTime = res.data.serverTime; // ex.: 1659123456789

// Passo 2: calcular diferença com seu relógio local
const localTime = Date.now();
const offset = serverTime - localTime;

// Passo 3: corrigir timestamp nas próximas requisições
let timestamp = Date.now() + offset;
    
    if (!apiKey || !apiSecret) {
        throw new Error('Preencha corretamente sua API KEY e SECRET KEY');
    }
    //const type = "FUTURES";
    //const timestamp = (Date.now())-1000;
    const recvWindow = 50000;//máximo permitido, default 5000

    const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(`${queryString.stringify({ ...data, recvWindow, timestamp })}`)
        .digest('hex');

    const newData = { ...data, recvWindow, timestamp, signature };
    const qs = `?${queryString.stringify(newData)}`;

    try {
        const result = await axios({
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

module.exports = { time, depth, exchangeInfo, accountSnapshot, balance, accountFutures, klines, openOrders, allOrders, newOrderLimit, newOrderBuy, newOrderSell, newStopLossBuy, modifyStopLossBuy, newStopLossSell, modifyStopLossSell, newTakeProfitBuy, newTakeProfitSell, cancelOrder, cancelAllOrders, closePositionSell, closePositionBuy, closeAllsltpBySymbol, income, userTrades, newStopBuy, newStopSell, newTakeBuy, newTakeSell, getPositRisk, getMaxLeverage, setLeverage, setMargIsolated }

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