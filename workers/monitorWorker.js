
//Considere o worker nodejs abaixo

const WebSocket = require('ws');
const axios = require('axios');
const axiosRetry = require('axios-retry').default;
const crypto = require('crypto');
const notifier = require('node-notifier');
const { exec } = require('child_process');
const { parentPort, workerData } = require('worker_threads');

const positionCache = require('./positionCache.js');

let { acquireLock } = require('./lockManager.js'); // caminho ajustado conforme a estrutura
//import path from 'path';

require('dotenv').config();
const EMA = require('technicalindicators').EMA;
const SMA = require('technicalindicators').SMA;
const StochasticRSI = require('technicalindicators').StochasticRSI;

parentPort.postMessage(`✅ Worker iniciado para o symbol: ${workerData.symbol} `);

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.SECRET_KEY;
const pMarg = process.env.PMARG;
const BASE_URL = 'https://fapi.binance.com';
const symbol = workerData.symbol.toUpperCase();
const wsSymbol = symbol.toLowerCase();
const api = require('../api');// worker.js

// workers/positionWorker.js
const { isPaused, activatePause } = require("./pauseManager");




//const PnlManager = require('./marginManager');

//const apiKey = process.env.BINANCE_API_KEY;
//const apiSecret = process.env.BINANCE_API_SECRET;

//const monitor = new MarginMonitor(API_KEY, API_SECRET);

//(async () => {
//await monitor.monitor();
//})();

// const PnlManager = require('./pnlManagerClean');

// const apiKey = process.env.BINANCE_API_KEY;
// const apiSecret = process.env.BINANCE_API_SECRET;



/*
setInterval(async () => {
    await monitorPnLAndClose(10); // 10% de lucro
}, 30_000); // verifica a cada 30s
*/

let candles1m = [];
let candles3m = [];
let candles5m = [];
let candles15m = [];
let candles30m = [];
let candles1h = [];
let candles4h = [];
let medias1m = null;
let medias3m = null;
let m20p3m = null;
let medias5m = null;
let medias15m = null;
let medias1h = null;
let ultimaPosicao = undefined;
let posicaoAberta = 0;
let ordemAtiva = undefined;
let takeAtivo = undefined;
let oldTake = null;
let oldTake2 = null;
let novoTake = null;
let anterior2 = null;
let alvoAtual = null;
let alvoAnterior = null;
let stopAtivo = undefined;
let oldStop = null;
let oldStop2 = null;
let novoStop = null;
let liquidationPrice = null;
let sideOrd = undefined;
let gatilhoAtivado = false;
let monitoramentoAtivado = false;
let preco_atual = undefined;
let preco_anterior = undefined;
let quantity = null;
let margemInsuf = false;
let unRealizedProfitArred = undefined;
let isolatedWalletArred = undefined;
//let roi = undefined;
let precisions = undefined;
let tickSize = undefined;
let sideM = undefined;
let candle1m = undefined;
let maxleverage = undefined;
let percStpPrice = undefined;

let maiorMedia1m = undefined;
let menorMedia1m = undefined;
let maiorMedia3m = undefined;
let menorMedia3m = undefined;

let ema1m5p = undefined;
let ema1m10p = undefined;
let sma1m100p = undefined;
let ema1m100p = undefined;
let sma1m400p = undefined;
let ema1m400p = undefined;

let ema1m5p_2 = undefined;
let ema1m10p_2 = undefined;

let ema3m5p = undefined;
let ema3m10p = undefined;
let sma3m400p = undefined;
let ema3m400p = undefined;
let ema3m5p_2 = undefined;
let ema3m10p_2 = undefined;
let maiorM3m20p = undefined;
let menorM3m20p = undefined;
let maiorMReg1m = undefined;
let menorMReg1m = undefined;
let maiorMReg3m = undefined;
let menorMReg3m = undefined;
let maiorMRegIn3m = undefined;
let menorMRegIn3m = undefined;
let maiorMedia5m = undefined;
let menorMedia5m = undefined;
let maiorMedia15m = undefined;
let menorMedia15m = undefined;
let maiorMedia1h = undefined;
let menorMedia1h = undefined;

let maiorMedia = undefined;
let menorMedia = undefined;
let maiorMedia2 = undefined;
let menorMedia2 = undefined;

let reducPrice = undefined;
let reetrPrice = undefined;

let posicionando = false;
let nLocks = 0;
let contPos = 0;

let zigZag1m = null; // Defina o threshold adequado
let fibo1m = null;
let ltaltb1m = null;

let zigZag3m = null; // Defina o threshold adequado
let fibo3m = null;
let ltaltb3m = null;

let zigZag5m = null; // Defina o threshold adequado
let fibo5m = null;
let ltaltb5m = null;

let zigZag15m = null; // Defina o threshold adequado
let fibo15m = null;
let ltaltb15m = null;

let zigZag30m = null; // Defina o threshold adequado
let fibo30m = null;
let ltaltb30m = null;

let zigZag1h = null; // Defina o threshold adequado
let fibo1h = null;
let ltaltb1h = null;

let stochRsi1m = null;
let stochRsi3m = null;
let stochRsi5m = null;
let stochRsi15m = null;
let stochRsi30m = null;
let stochRsi1h = null;
let stochRsi4h = null;

let plus = 0;

const { setLock, getLock, hasAnyLock, countLocks, releaseLock } = require("../lockManager");

const roiTracker = require('../roiTracker');

/*
// abrir posição
roiTracker.initPosition("BTCUSDT", 0.5);

// monitorar
roiTracker.updateRoi("BTCUSDT", 1.3);
roiTracker.updateRoi("BTCUSDT", -0.4);
roiTracker.updateRoi("BTCUSDT", 0.9);

// fechar
const hist = roiTracker.closePosition("BTCUSDT");
console.log("Fechada:", hist);

// histórico geral
console.log("Histórico:", roiTracker.getHistory());

// Consultar posição aberta
const aberta = roiTracker.getRoi("BTCUSDT");
console.log("Posição aberta:", aberta);
*/



const fs = require('fs');
const path = require('path');
const e = require('express');
//const cacheFilePath = path.join(__dirname, 'cache.json');
var cacheFilePath = null;

//var cacheJson = {};

var cacheJson = {
  houveReducao: 0,
  houveAdicao: 0
}
// await salvarCache(cacheJson, symbol);

/*     
var cacheRisk = {
timestampIni: 0,
posicionando: false,
margemInicial: 0,
Roi24h: 0,
updated: 0
}
*/
var cacheRisk = {};
/*
cacheRisk[symbol] = {
  roiAtual: null,
  posicionando: false
  
};
*/
// Configuração de axios com retries infinitos
const apiAxios = axios.create({
  baseURL: 'https://fapi.binance.com',
  timeout: 15000
});
axiosRetry(apiAxios, {
  retries: Infinity,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET' || error.response?.status === 429 || error.response?.status >= 500
});

const apiAxiosSpot = axios.create({
  baseURL: 'https://api.binance.com',
  timeout: 15000
});
axiosRetry(apiAxiosSpot, {
  retries: Infinity,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET' || error.response?.status === 429 || error.response?.status >= 500
});

//const res = undefined;
/*
(async () => {
  res = await apiAxiosSpot.get('/api/v3/time');
})();
*/
var offset = undefined;


/*
//Exemplo de uso:
(async () => {
  precisions = await getSymbolPrecisions(symbol);
  console.log(precisions);
})();
console.log(precisions);
*/

// worker.js

/*
// Simulação de operação
function monitorarROI(symbol) {
    // Aqui iria a lógica real de ROI
    const roi = Math.floor(Math.random() * 150); // Simulação 0–150%

    if (roi < 100) {
        setLock(symbol, true); // Lock
        console.log(`🔒 Lock aplicado em ${symbol} ROI=${roi}%`);
    } else {
        setLock(symbol, false); // Unlock
        console.log(`🔓 Lock removido em ${symbol} ROI=${roi}%`);
    }
}
*/

function salvarCache(cache, currencyPair) {
  cacheFilePath = path.join(__dirname, `cache/${currencyPair}.json`);
  try {
    fs.writeFileSync(cacheFilePath, JSON.stringify(cache), { flag: 'w' });
  } catch (err) {
    console.error("Erro ao salvar cache:", err);
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


function calcPnlFutBinance(precoEntrada, precoSaida, tamanhoPosicao, side) {
  // 1. Calcular a margem inicial
  const margemInicial = (precoEntrada * tamanhoPosicao) / maxleverage;


  // 2. Calcular o PNL (Lucro ou Perda)
  let pnl;
  if (side === 'C' || side === 'BUY') {
    pnl = (precoSaida - precoEntrada) * tamanhoPosicao;
  } else if (side === 'V' || side === 'SELL') {
    pnl = (precoEntrada - precoSaida) * tamanhoPosicao;
  } else {
    console.log("Tipo de trade inválido! Use 'C' para compra ou 'V' para venda.");

    return null;
    //throw new Error("Tipo de trade inválido! Use 'C' para compra ou 'V' para venda.");
  }

  // 3. Calcular o ROI (Return on Investment)
  const roi = (pnl / margemInicial) * 100;

  // Retornar os resultados
  return {
    margemInicial: margemInicial.toFixed(2),
    pnl: pnl.toFixed(2),
    roi: roi.toFixed(2)
  };
}

async function precoAlvoPorPercent(side, percent, precoEntrada, cryptSymbol) {

  var alavancagem = maxleverage;
  console.log(`calcularPrecoAlvo[${cryptSymbol}]`);

  let decimais = precisions.pricePrecision;

  var perc = parseFloat(percent) / 100;

  try {
    // Verifica se as variáveis são números válidos
    if (isNaN(precoEntrada) || isNaN(alavancagem) /*|| isNaN(margemInicial)*/) {
      throw new Error('Todos os valores de entrada devem ser numéricos.');
    }
    // Verifica se alavancagem e margem inicial são positivos
    if (alavancagem <= 0 /*|| margemInicial <= 0*/) {
      throw new Error('Alavancagem e margem inicial devem ser maiores que zero.');
    }

    // Converte para float e calcula o preço de venda com base em 50% de lucro
    let precoAlvo = null;
    if (side == "C" || side == "BUY") {

      precoAlvo = (precoEntrada * (1 + (perc / alavancagem))).toFixed(decimais);

    } else if (side == "V" || side == "SELL") {

      precoAlvo = (precoEntrada * (1 - (perc / alavancagem))).toFixed(decimais);

    }

    return parseFloat(precoAlvo);

  } catch (erro) {
    // Tratamento de erro caso alguma das variáveis esteja incorreta
    console.error('Erro no cálculo do Alvo:', erro.message);
    return null;
  }
}

async function getLiquidationPrice(symbol) {
  try {

    let timestamp = Date.now() + offset;

    const baseUrl = "https://fapi.binance.com";

    const queryString = `timestamp=${timestamp}`;
    const signature = sign(queryString, API_SECRET);

    const url = `${baseUrl}/fapi/v2/positionRisk?${queryString}&signature=${signature}`;

    const response = await axios.get(url, {
      headers: {
        "X-MBX-APIKEY": API_KEY,
      },
    });

    const positions = response.data;

    // Filtra posição do símbolo desejado
    const position = positions.find(
      (pos) => pos.symbol === symbol && parseFloat(pos.positionAmt) !== 0
    );

    if (position) {
      console.log(`Preço de liquidação para ${symbol}: ${position.liquidationPrice}`);
      return parseFloat(position.liquidationPrice);
    } else {
      console.log(`Nenhuma posição aberta em ${symbol}.`);
      return null;
    }
  } catch (error) {
    console.error("Erro ao buscar preço de liquidação:", error.response?.data || error.message);
    return null;
  }
}

function gerarAssinatura(params) {
  const query = new URLSearchParams(params).toString();
  return crypto.createHmac('sha256', API_SECRET).update(query).digest('hex');
}

function sign(query, secret) {
  return crypto
    .createHmac("sha256", secret)
    .update(query)
    .digest("hex");
}

function calcularSMA(periodo, candles) {
  var candlesCloseSma = [];
  //for (let i = 30; i < candles.length-4; i++) {

  for (let i = 0; i < candles.length; i++) {
    candlesCloseSma.push(parseFloat(candles[i].close.toFixed(precisions.pricePrecision)));
  }

  const smaList = SMA.calculate({ period: periodo, values: candlesCloseSma });

  var objsma = parseFloat(smaList[smaList.length - 1].toFixed(precisions.pricePrecision));

  const adjustedPrice = adjustPrice(objsma, tickSize);


  return parseFloat(parseFloat(adjustedPrice).toFixed(precisions.pricePrecision));
}

function calcularEMA(periodo, candles) {
  var candlesClose = [];
  //for (let i = 30; i < candles.length-4; i++) {
  for (let i = 0; i < candles.length; i++) {
    candlesClose.push(parseFloat(candles[i].close.toFixed(precisions.pricePrecision)));
  }

  const emaList = EMA.calculate({ period: periodo, values: candlesClose });
  //const emaList = calcEMA(periodo, candlesClose);

  var objema = parseFloat(emaList[emaList.length - 1].toFixed(precisions.pricePrecision));

  const adjustedPrice = adjustPrice(objema, tickSize);


  return parseFloat(parseFloat(adjustedPrice).toFixed(precisions.pricePrecision));
}
/*
function calcEMA_old(period, values) {
    const k = 2 / (period + 1);
    let emaArray = [];
    let emaPrevious;

    // Calcula a SMA inicial e define como o primeiro EMA
    const sma = values.slice(0, period).reduce((acc, val) => acc + val, 0) / period;
    emaArray[period - 1] = sma;
    emaPrevious = sma;

    // Calcula o EMA para os períodos subsequentes
    for (let i = period; i < values.length; i++) {
        const emaCurrent = (values[i] * k) + (emaPrevious * (1 - k));
        emaArray.push(emaCurrent);
        emaPrevious = emaCurrent;
    }

    return emaArray;
}
function calcEMA_old2(period, values) {
    if (!Array.isArray(values)) throw new Error('values precisa ser um array');
    if (period <= 0) throw new Error('period tem que ser > 0');
    const n = values.length;
    if (n < period) return [];

    const k = 2 / (period + 1);
    const result = [];

    // SMA inicial
    let sum = 0;
    for (let i = 0; i < period; i++) sum += values[i];
    let prev = sum / period;
    result.push(prev); // corresponde ao índice period-1

    // EMA subsequente
    for (let i = period; i < n; i++) {
        const current = (values[i] * k) + (prev * (1 - k));
        result.push(current);
        prev = current;
    }

    return result;
}
function calcEMA(period, values) {
    if (!Array.isArray(values)) throw new Error('values precisa ser um array');
    if (period <= 0) throw new Error('period tem que ser > 0');
    const n = values.length;
    if (n < period) return Array(n).fill(null); // ou retornar [] dependendo do que você quer

    const k = 2 / (period + 1);
    const ema = new Array(n).fill(null);

    // SMA inicial
    let sum = 0;
    for (let i = 0; i < period; i++) sum += values[i];
    const sma = sum / period;
    ema[period - 1] = sma;

    // EMA subsequente
    let prev = sma;
    for (let i = period; i < n; i++) {
        const current = (values[i] * k) + (prev * (1 - k));
        ema[i] = current;
        prev = current;
    }

    return ema;
}
*/
function formatTime(timestamp) {

  var date = new Date(timestamp);
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();

  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();

  /*switch(hours){
      case 0 :
          hours = 24;
          break;
      case 1 :
          hours = 25;
          break;
      case 2 :
          hours = 26;
          break;
      case 3 :
          hours = 27;
          break;
  
  }*/
  //var x = hours-3;
  //hours = x;
  //var x = hours-3;
  //hours = hours-3;
  minutes = minutes;
  seconds = seconds;

  if (hours < 10) {
    //var edited = "0"+hours;
    hours = "0" + hours;
  }

  if (minutes < 10) {
    minutes = "0" + minutes;
  }

  if (seconds < 10) {
    seconds = "0" + seconds;
  }

  if (day < 10) {
    day = "0" + day;
  }

  if (month < 10) {
    month = "0" + month;
  }

  //var formattedTime = hours + ':' + minutes + ':' + seconds;
  var formattedTime = day + '/' + month + '/' + year + '   ' + hours + ':' + minutes + ':' + seconds;

  return formattedTime;
}

function calcularTempoRestante(agora, timeValidate) {
  //const agora = new Date().getTime();
  const dataDesejada = new Date(timeValidate).getTime();
  var diferenca = dataDesejada - agora;
  if (dataDesejada < agora) {
    diferenca = agora - dataDesejada;
  }
  const minutos = Math.floor(diferenca / 60000);
  const horas = Math.floor(minutos / 60);
  const minutosRestantes = minutos % 60;

  //parentPort.postMessage('agora',agora);
  //parentPort.postMessage('dataDesejada',dataDesejada);
  //parentPort.postMessage('diferenca',diferenca);
  //parentPort.postMessage('minutos',minutos);

  if (dataDesejada < agora) {
    return `Passaram-se ${Math.abs(horas)} horas e ${Math.abs(minutosRestantes)} minutos`;
  } else {
    return `Restam ${horas} horas e ${minutosRestantes} minutos`;
  }
}

async function getSymbolPrecisions(symbol) {
  try {
    const url = 'https://fapi.binance.com/fapi/v1/exchangeInfo';
    const response = await axios.get(url);
    const symbols = response.data.symbols;

    const symbolInfo = symbols.find(s => s.symbol === symbol.toUpperCase());

    if (!symbolInfo) {
      throw new Error(`Símbolo ${symbol} não encontrado!`);
    }

    return {
      pricePrecision: symbolInfo.pricePrecision,
      quantityPrecision: symbolInfo.quantityPrecision
    };

  } catch (error) {
    console.error('Erro ao buscar precisões:', error.message);
    throw error;
  }
}

async function getTickSize(symbol) {
  const url = 'https://fapi.binance.com/fapi/v1/exchangeInfo';
  const res = await axios.get(url);
  const info = res.data.symbols.find(s => s.symbol === symbol);
  if (!info) throw new Error(`Símbolo ${symbol} não encontrado.`);

  const priceFilter = info.filters.find(f => f.filterType === 'PRICE_FILTER');
  return priceFilter.tickSize;
}

function adjustPrice(price, tickSize) {
  if (!tickSize) {
    console.log("tickSize undefined. Retornando preço original:", price);
    return price;
  }

  const precision = tickSize.indexOf('.') >= 0
    ? tickSize.split('.')[1].length
    : 0;

  const tickSizeNum = parseFloat(tickSize);

  const adjusted = Math.floor(price / tickSizeNum) * tickSizeNum;

  return Number(adjusted.toFixed(precisions.pricePrecision));
}

async function getBalance() {

  parentPort.postMessage('');
  parentPort.postMessage('[ getQntbyBalance_Start ]');

  const carteira = await api.accountFutures(Date.now());

  if (carteira !== undefined) {
    var coin = undefined;

    coin = await carteira.assets.filter(b => b.asset === 'USDT'); // || b.asset === 'USDT');

    parentPort.postMessage('');
    parentPort.postMessage('[ coin0 ]: ', coin[0]);

    //var symbol = process.env.SYMBOL;

    var availableBalance = coin[0].availableBalance;
    var balance = coin[0].walletBalance;

    return coin[0];

  } else {
    return null;
  }

}

async function getQntbyBalance() {

  parentPort.postMessage('');
  parentPort.postMessage('[ getQntbyBalance_Start ]');

  var coin = undefined;

  coin = await getBalance();

  if (coin !== null && coin !== undefined) {

    var availableBalance = coin.availableBalance;
    var balance = coin.walletBalance;
    var qnttyX = null;

    qnttyX = parseFloat(balance) / 20;
    //qnttyX = parseFloat(availableBalance) / 15;
    //qnttyX = parseFloat(availableBalance);

    //var qntty = Math.round((qnttyX / preco_atual) * maxleverage);
    //var qntty = Math.ceil((qnttyX / preco_atual) * maxleverage);
    var qntty = (qnttyX / preco_atual) * maxleverage;
    if (parseFloat(qntty) < parseFloat(0.1)) {
      qntty = parseFloat(0.1);
    }

    parentPort.postMessage('');
    //parentPort.postMessage(`availableBalance: ${availableBalance}`);
    parentPort.postMessage(`symbol: ${symbol}`);
    parentPort.postMessage(`maxleverage: ${maxleverage}`);
    parentPort.postMessage(`preco_atual: ${preco_atual}`);
    parentPort.postMessage(`balance: ${balance}`);
    parentPort.postMessage(`qnttyX: ${qnttyX}`);
    parentPort.postMessage(`qntty: ${qntty}`);
    parentPort.postMessage('');

    parentPort.postMessage('[ getQntbyBalance_End ]');

    return qntty * pMarg;

  } else {

    parentPort.postMessage('[ getQntbyBalance_End ]');
    return null;
  }

}

async function obterAlavancagem(symbol) {


  let timestamp = Date.now() + offset;

  //const timestamp = Date.now();
  const params = new URLSearchParams({ timestamp: timestamp.toString() });
  const signature = gerarAssinatura(params);
  params.append('signature', signature);

  try {
    const { data } = await apiAxios.get(`/fapi/v2/positionRisk?${params.toString()}`, {
      headers: { 'X-MBX-APIKEY': API_KEY }
    });

    const pos = data.find(p => p.symbol === symbol);
    return pos ? parseFloat(pos.leverage) : 1;
  } catch (err) {
    console.error(`Erro ao buscar alavancagem de ${symbol}:`, err.response?.data || err.message);
    return 1;
  }
}

async function notificWin(preco_atualiz, cryptSymbol, op, side = '', roi) {

  //player.play('foo.mp3', { afplay: ['-v', 5 ] /* lower volume for afplay on OSX */ }, function(err){
  //    if (err) throw err
  //});

  //sound.play();
  /*
      load('foo.wav').then(play)
      .catch(err => {
        console.log('Erro ao carregar ou tocar o áudio:', err);
      });
  */

  var cachePosit = [];
  var cacheSimul = [];
  var options = undefined;
  var entryPrice = undefined;
  var take = undefined;
  var stop = undefined;



  var symbolNotifId = getSymbolId(symbol);
  //cacheSimul = await carregarCache('SIMUL');
  //cachePosit = await carregarCache('POSITIONS');
  /*
  if (cacheSimul[`${cryptSymbol}`] !== undefined) {
      entryPrice = cacheSimul[`${cryptSymbol}`].position.entryPrice;
      take = cacheSimul[`${cryptSymbol}`].position.take;
      stop = cacheSimul[`${cryptSymbol}`].position.stop;
      pnl = cacheSimul[`${cryptSymbol}`].position.pnl;
      roi = cacheSimul[`${cryptSymbol}`].position.roi;
  }
  
  */

  if (op == 'descon') {

    options = {
      title: 'Sistema Offline',
      message: `Sistema desconectado`,
      sound: true, // Isso fará com que um som seja tocado
    };

  }
  if (op == 'slow') {

    options = {
      title: 'Sistema lento',
      message: `Verifique !!!!`,
      sound: true, // Isso fará com que um som seja tocado
    };

  }
  if (op == 'monitAtv') {
    options = {
      title: `[${cryptSymbol}] Monitoramento Ativado`,
      message: `Monitorando entrada  ${cryptSymbol}: ${alvoAtual}
            ${formatTime(Date.now())}`,
      id: "10" + symbolNotifId,
      sound: true, // Isso fará com que um som seja tocado
    };
  } else if (op == 'open') {

    //var roi = ( parseFloat(posicaoAberta.unRealizedProfit).toFixed(2) / isolatedWalletArred) * 100;

    options = {
      title: `[${cryptSymbol}] Posição (${side}): ${parseFloat(roi).toFixed(2)}% `,
      message: `($ ${isolatedWalletArred}): $ ${unRealizedProfitArred}( ${parseFloat(roi).toFixed(2)}% )
            P:${parseFloat(preco_atual).toFixed(precisions.pricePrecision)} E: ${parseFloat(posicaoAberta.entryPrice).toFixed(precisions.pricePrecision)} S: ${parseFloat(novoStop).toFixed(precisions.pricePrecision)}
            
            ${formatTime(Date.now())}`,
      id: "10" + symbolNotifId //,
      //sound: false, // Isso fará com que um som seja tocado
    };
  } else if (op == 'close') {
    options = {
      title: 'Posição Fechada',
      message: `Posição foi fechada em ${cryptSymbol}: ${preco_atualiz}`,
      id: "10" + symbolNotifId,
      sound: true, // Isso fará com que um som seja tocado
    };
  } else if (op == 'smlOpen') {

    options = {
      title: `Posição Aberta(${side}): ${entryPrice}`,
      message: `
                (${cryptSymbol}) T:${take} S:${stop}
                `,
      sound: true, // Isso fará com que um som seja tocado
    };


  } else if (op == 'smlClose') {
    options = {
      title: `Posição Fechada: ${preco_atualiz}`,
      message: `Posição foi fechada em ${cryptSymbol}: `,
      sound: true, // Isso fará com que um som seja tocado
    };
  } else if (op == 'Gain' || op == 'GainLT' || op == 'GainRG' || op == 'Loss' || op == 'LossRG') {
    options = {
      title: `(${side})Posição Fechada(${op}): ${preco_atualiz}`,
      message: `Posição foi fechada em ${cryptSymbol}
            E: ${entryPrice}
            T: ${take} <- S: ${stop}
            P: ${pnl} <-> R: ${roi}`,
      sound: true, // Isso fará com que um som seja tocado
    };
  } else if (op == 'smlLoss') {
    options = {
      title: `(${side})Posição Fechada(Loss): ${preco_atualiz}`,
      message: `Posição foi fechada em ${cryptSymbol}
            E: ${entryPrice}
            T: ${take} -> S: ${stop}
            P: ${pnl} <-> R: ${roi}`,
      sound: true, // Isso fará com que um som seja tocado
    };
  } else if (op == 'smlReverC') {
    options = {
      title: `(${side})Posição Fechada(ReverC): ${preco_atualiz}`,
      message: `Posição foi fechada em ${cryptSymbol}
            E: ${entryPrice}
            P: ${pnl} <-> R: ${roi}`,
      sound: true, // Isso fará com que um som seja tocado
    };
  } else if (op == 'smlReverV') {
    options = {
      title: `(${side})Posição Fechada(ReverV): ${preco_atualiz}`,
      message: `Posição foi fechada em ${cryptSymbol}
            E: ${entryPrice}
            P: ${pnl} <-> R: ${roi}`,
      sound: true, // Isso fará com que um som seja tocado
    };
  }
  notifier.notify(options);
  //const { exec } = require('child_process');

  exec(`termux-notification --id ${options.id} --title "${options.title}" --content "${options.message}"`, (err, stdout, stderr) => {
    if (err) {
      console.error(`Erro: ${err}`);
      return;
    }
    console.log('Notificação enviada!');
  });

}

function floorDecimal(num, decimalPlaces) {
  const factor = 10 ** decimalPlaces;
  return Math.floor(num * factor) / factor;
}

function getSymbolId(symbol) {
  let result = "";
  let symbolNotif = "";

  // Remove 'USDT' do final, se existir
  if (symbol.endsWith("USDT")) {
    symbolNotif = symbol.slice(0, -4);
  }

  for (let i = 0; i < symbol.length; i++) {
    let char = symbol[i].toUpperCase();

    if (char >= 'A' && char <= 'Z') {
      // A=1, B=2, ..., Z=26
      result += (char.charCodeAt(0) - 64).toString();
    } else if (char >= '0' && char <= '9') {
      result += char;
    }
  }

  return result;
}

function inverterLista(lista) {
  let novaLista = [];
  for (let i = lista.length - 1; i >= 0; i--) {
    novaLista.push(lista[i]);
  }
  return novaLista;
}

function unificarSequencia(pontosZigZag) {
  let novoZigZag = [];
  let i = 0;
  while (i < pontosZigZag.length) {
    let pontoAtual = pontosZigZag[i];
    novoZigZag.push(pontoAtual);
    let j = i + 1;
    while (j < pontosZigZag.length && pontosZigZag[j].tipo === pontoAtual.tipo) {
      if (pontosZigZag[j].tipo === 'fundo') {
        if (parseFloat(pontosZigZag[j].valor) <= parseFloat(pontoAtual.valor)) {
          novoZigZag.pop();
          pontoAtual = pontosZigZag[j];
          novoZigZag.push(pontoAtual);
        }
      } else if (pontosZigZag[j].tipo === 'topo') {
        if (parseFloat(pontosZigZag[j].valor) >= parseFloat(pontoAtual.valor)) {
          novoZigZag.pop();
          pontoAtual = pontosZigZag[j];
          novoZigZag.push(pontoAtual);
        }
      }
      j++;
    }
    i = j;
  }
  return novoZigZag;
}

function tpfdListGen(zzList) {

  let tpList = [];
  let fdList = [];
  //for (let i = zzList.length - 1; i >= 0; i--) {
  for (let i = 0; i <= zzList.length - 1; i++) {

    //novaLista.push(lista[i]);
    if (zzList[i].tipo == 'topo') {
      let obj = { high: parseFloat(zzList[i].valor), index: zzList[i].index }
      tpList.push(obj);
      //tpList.push(zzList[i]);
    }
    if (zzList[i].tipo == 'fundo') {
      let obj = { low: parseFloat(zzList[i].valor), index: zzList[i].index }
      fdList.push(obj);
      //fdList.push(zzList[i]);

    }

  }
  return { tpList: tpList, fdList: fdList };
  //return { topos: doisTopos, fundos: doisFundos, topos2: doisTopos2, fundos2: doisFundos2 , tpList: topos, fdList: fundos };


}

function calcularZigZag(candlesParam) {

  if (candlesParam === undefined || candlesParam === null) {
    return null;
  }

  var pontos = [];
  var candles = candlesParam;
  //var candlesI = inverterLista(candlesP);
  var listaInvertida = [];
  var listaUnificada = [];
  let tipo = '';
  if (candles !== undefined) {
    for (let i = 9; i < candles.length - 2; i++) {
      //for (let i = candles.length - 14; i > 3; i--) {
      const anterior = candles[i - 1];
      const anterior2 = candles[i - 2];
      const anterior3 = candles[i - 3];
      const anterior4 = candles[i - 4];
      const anterior5 = candles[i - 5];
      const anterior6 = candles[i - 6];
      const anterior7 = candles[i - 7];
      const anterior8 = candles[i - 8];
      const anterior9 = candles[i - 9];
      //const anterior10 = candles[i - 10];
      //const anterior11 = candles[i - 11];
      //const anterior12 = candles[i - 12];
      //const anterior13 = candles[i - 13];
      //const anterior14 = candles[i - 14];
      const atual = candles[i];
      const proximo = candles[i + 1];
      const proximo2 = candles[i + 2];
      //const proximo3 = candles[i + 3];

      // Verificar se o candle atual é menor que o topo anterior
      //if (atual.high < Math.max(...pontos.map(p => p.valor))) {
      if (atual.high >= anterior.high && atual.high >= proximo.high
        && atual.high >= anterior2.high && atual.high >= proximo2.high
        && atual.high >= anterior3.high //&& atual.high >= proximo3.high
        && atual.high >= anterior4.high // && atual.high >= proximo4.high 
        && atual.high >= anterior5.high // && atual.high >= proximo5.high 
        && atual.high >= anterior6.high // && atual.high >= proximo5.high 
        && atual.high >= anterior7.high // && atual.high >= proximo5.high 
        && atual.high >= anterior8.high // && atual.high >= proximo5.high 
        && atual.high >= anterior9.high // && atual.high >= proximo5.high 
      ) {
        if (pontos.length !== 0) {
          if ((parseFloat(pontos[pontos.length - 1].valor) !== parseFloat(atual.high)) && pontos[pontos.length - 1].tipo == 'topo' && pontos[pontos.length - 1].valor < atual.high) {
            pontos.pop(pontos[pontos.length - 1]);
            pontos.push({ index: i, valor: atual.high, tipo: 'topo' });
          }
        }
        pontos.push({ index: i, valor: atual.high, tipo: 'topo' });
        //  tipo = 'fundo'; // Mudar para tipo "fundo" após encontrar novo topo
      }

      else if (atual.low <= anterior.low && atual.low <= proximo.low
        && atual.low <= anterior2.low && atual.low <= proximo2.low
        && atual.low <= anterior3.low //&& atual.low <= proximo3.low
        && atual.low <= anterior4.low
        && atual.low <= anterior5.low
        && atual.low <= anterior6.low
        && atual.low <= anterior7.low
        && atual.low <= anterior8.low
        && atual.low <= anterior9.low
      ) {
        if (pontos.length !== 0) {
          if ((parseFloat(pontos[pontos.length - 1].valor) !== parseFloat(atual.low)) && pontos[pontos.length - 1].tipo == 'fundo' && pontos[pontos.length - 1].valor < atual.low) {
            pontos.pop(pontos[pontos.length - 1]);
            pontos.push({ index: i, valor: atual.low, tipo: 'fundo' });
          }
        }
        pontos.push({ index: i, valor: atual.low, tipo: 'fundo' });

        //  tipo = 'fundo'; // Mudar para tipo "fundo" após encontrar novo topo
      }
    }

    listaInvertida = inverterLista(pontos);

    var pontosUnificados = unificarSequencia(listaInvertida);

    //pontosUnificados.shift();

    // Retornar os últimos 4 pontos encontrados
    //return pontos.slice(-4);

    if (pontosUnificados[0] === undefined || pontosUnificados[0] === null) {
      return null;
    }

    const dir = parseFloat(pontosUnificados[0].valor) < parseFloat(pontosUnificados[1].valor) ? -1 : 1;

    var tpfdList = tpfdListGen(pontosUnificados);
    //var zigzag = getLastTwoZigZags(tpfdList.tpList, tpfdList.fdList);
    var zigzag = {
      p1: parseFloat(pontosUnificados[1].valor),
      p2: parseFloat(pontosUnificados[0].valor),
      dir: dir

    };

    //console.log("tpfdList.tpList:", tpfdList.tpList);

    var topos = [];
    var fundos = [];
    var topos2 = [];
    var fundos2 = [];

    topos.push(tpfdList.tpList[0]);
    topos.push(tpfdList.tpList[1]);

    topos2.push(tpfdList.tpList[1]);
    topos2.push(tpfdList.tpList[2]);

    fundos.push(tpfdList.fdList[0]);
    fundos.push(tpfdList.fdList[1]);

    fundos2.push(tpfdList.fdList[1]);
    fundos2.push(tpfdList.fdList[2]);
  }
  return { topos: topos, topos2: topos2, fundos: fundos, fundos2: fundos2, zigzag: zigzag, tpfdList: tpfdList, pontosUnificados: pontosUnificados };
  //return { topos: doisTopos, fundos: doisFundos, topos2: doisTopos2, fundos2: doisFundos2 , tpList: topos, fdList: fundos };

}
/*
function calcularLinhasTendencia_old(candlesParam, topos, fundos) {

  var precoLinhaFundo = null;
  var precoLinhaTopo = null;

  // Cálculo da linha de tendência dos topos
  if (topos.length >= 2) {
    const x1 = topos[0].index;
    const y1 = topos[0].high;
    const x2 = topos[1].index;
    const y2 = topos[1].high;
    const mTopo = (y2 - y1) / (x2 - x1);
    const bTopo = y1 - mTopo * x1;
    const xAtual = candlesParam.length - 1;
    precoLinhaTopo = mTopo * xAtual + bTopo;
    //console.log('Preço atual da linha de tendência dos topos:', precoLinhaTopo);
  }

  // Cálculo da linha de tendência dos fundos
  if (fundos.length >= 2) {
    const x1 = fundos[0].index;
    const y1 = fundos[0].low;
    const x2 = fundos[1].index;
    const y2 = fundos[1].low;
    const mFundo = (y2 - y1) / (x2 - x1);
    const bFundo = y1 - mFundo * x1;
    const xAtual = candlesParam.length - 1;
    precoLinhaFundo = mFundo * xAtual + bFundo;
    //console.log('Preço atual da linha de tendência dos fundos:', precoLinhaFundo);
  }

  return { ltb: precoLinhaTopo, lta: precoLinhaFundo };
}
*/
function calcularLinhasTendencia(candlesParam) {
  if (!candlesParam || candlesParam.length < 3) return { ltb: null, lta: null, pontos: { topos: null, fundos: null } };

  // LTB: do maior index para o menor
  let pontoBTopo = null;
  for (let i = candlesParam.length - 2; i > 0; i--) {
    let high = candlesParam[i].high;
    if (high > candlesParam[i - 1].high && high > candlesParam[i + 1].high) {
      // Verifica se os 2 candles anteriores não superam esse high
      if (candlesParam[i - 1].high < high && candlesParam[i - 2].high < high) {
        pontoBTopo = { index: i, high };
        break;
      }
    }
  }

  let pontoATopo = null;
  let precoLinhaTopo = null;
  if (pontoBTopo) {
    // Busca ponto A: high mais distante que não atravessa candles até B
    for (let j = 0; j < pontoBTopo.index; j++) {
      let highA = candlesParam[j].high;
      // Traça linha de j até pontoBTopo
      let m = (pontoBTopo.high - highA) / (pontoBTopo.index - j);
      let b = highA - m * j;
      let atravessa = false;
      for (let k = j + 1; k < pontoBTopo.index; k++) {
        const yLinha = m * k + b;
        if (yLinha < candlesParam[k].high) {
          atravessa = true;
          break;
        }
      }
      if (!atravessa) {
        pontoATopo = { index: j, high: highA };
        // Calcula o valor da linha no último candle (em formação)
        let xUltimo = candlesParam.length - 1;
        precoLinhaTopo = m * xUltimo + b;
        break;
      }
    }
  }

  // LTA: do maior index para o menor
  let pontoBFundo = null;
  for (let i = candlesParam.length - 2; i > 0; i--) {
    let low = candlesParam[i].low;
    if (low < candlesParam[i - 1].low && low < candlesParam[i + 1].low) {
      // Verifica se os 2 candles anteriores não superam esse low
      if (candlesParam[i - 1].low > low && candlesParam[i - 2].low > low) {
        pontoBFundo = { index: i, low };
        break;
      }
    }
  }

  let pontoAFundo = null;
  let precoLinhaFundo = null;
  if (pontoBFundo) {
    // Busca ponto A: low mais distante que não atravessa candles até B
    for (let j = 0; j < pontoBFundo.index; j++) {
      let lowA = candlesParam[j].low;
      // Traça linha de j até pontoBFundo
      let m = (pontoBFundo.low - lowA) / (pontoBFundo.index - j);
      let b = lowA - m * j;
      let atravessa = false;
      for (let k = j + 1; k < pontoBFundo.index; k++) {
        let yLinha = m * k + b;
        if (yLinha > candlesParam[k].low) {
          atravessa = true;
          break;
        }
      }
      if (!atravessa) {
        pontoAFundo = { index: j, low: lowA };
        // Calcula o valor da linha no último candle (em formação)
        let xUltimo = candlesParam.length - 1;
        precoLinhaFundo = m * xUltimo + b;
        break;
      }
    }
  }

  return {
    ltb: precoLinhaTopo,
    lta: precoLinhaFundo,
    pontos: {
      topos: pontoATopo && pontoBTopo ? [pontoATopo, pontoBTopo] : null,
      fundos: pontoAFundo && pontoBFundo ? [pontoAFundo, pontoBFundo] : null
    }
  };
}

function calcularRetracoesFibonacci(pontosUnificados) {
  const high = parseFloat(pontosUnificados[1].valor);
  const low = parseFloat(pontosUnificados[0].valor);
  const dir = parseFloat(pontosUnificados[0].valor) < parseFloat(pontosUnificados[1].valor) ? -1 : 1;

  var pontoZero = parseFloat(pontosUnificados[0].valor);
  var pontoUm = parseFloat(pontosUnificados[1].valor);

  const fibonacciLevels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1, 1.618, 2.618, 3.618, 4.236, -0.618, -1.618, -2.618, -3.236];
  const priceRange = pontoZero - pontoUm;

  const fibonacciRetracements = fibonacciLevels.map(level => {
    const retracement = pontoZero - (priceRange * level);
    return parseFloat(retracement.toFixed(5));
  });

  const retr0 = fibonacciRetracements[0];
  const retr0236 = fibonacciRetracements[1];
  const retr0382 = fibonacciRetracements[2];
  const retr05 = fibonacciRetracements[3];
  const retr0618 = fibonacciRetracements[4];
  const retr0786 = fibonacciRetracements[5];
  const retr1 = fibonacciRetracements[6];
  const retr1618 = fibonacciRetracements[7];
  const retr2618 = fibonacciRetracements[8];
  const retr3618 = fibonacciRetracements[9];
  const retr4236 = fibonacciRetracements[10];
  const retr0618Neg = fibonacciRetracements[11];
  const retr1618Neg = fibonacciRetracements[12];
  const retr2618Neg = fibonacciRetracements[13];
  const retr3236Neg = fibonacciRetracements[14];

  return {
    retrac: fibonacciRetracements,
    dir: dir,
    retr0: retr0,
    retr0236: retr0236,
    retr0382: retr0382,
    retr05: retr05,
    retr0618: retr0618,
    retr0786: retr0786,
    retr1: retr1,
    retr1618: retr1618,
    retr2618: retr2618,
    retr3618: retr3618,
    retr4236: retr4236,
    retr0618Neg: retr0618Neg,
    retr1618Neg: retr1618Neg,
    retr2618Neg: retr2618Neg,
    retr3236Neg: retr3236Neg
  };
}

async function carregarCandlesHistoricos() {

  precisions = await getSymbolPrecisions(symbol);
  console.log(precisions);
  tickSize = await getTickSize(symbol);


  try {
    const response = await apiAxios.get('/fapi/v1/klines', {
      params: {
        symbol: symbol,
        interval: '1m',
        limit: 400,
        recvWindow: 15000
      }
    });

    let i1m = 0;

    response.data.forEach(k => {
      candles1m.push({
        index: i1m++,
        timestamp: k[0],
        timestampHD: formatTime(k[0]),
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        isFinal: true
      });
    });

    parentPort.postMessage(`✅ ${symbol} - Histórico de 400 candles1m carregado com sucesso.`);




    sma1m400p = calcularSMA(400, candles1m);

    ema1m100p = calcularEMA(100, candles1m);
    sma1m100p = calcularSMA(100, candles1m);

    const s100 = calcularSMA(100, candles1m);
    const s110 = calcularSMA(110, candles1m);
    const e100 = calcularEMA(100, candles1m);
    const e110 = calcularEMA(110, candles1m);

    if (s100 && s110 && e100 && e110) {
      medias1m = [s100, s110, e100, e110];
    }

  } catch (err) {
    parentPort.postMessage(`❌ Erro ao carregar histórico de candles1m: ${JSON.stringify(err.message)}`);
  }

  try {
    const response = await apiAxios.get('/fapi/v1/klines', {
      params: {
        symbol: symbol,
        interval: '3m',
        limit: 400,
        recvWindow: 15000
      }
    });

    let i3m = 0;

    response.data.forEach(k => {
      candles3m.push({
        index: i3m++,
        timestamp: k[0],
        timestampHD: formatTime(k[0]),
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        isFinal: true
      });
    });

    parentPort.postMessage(`✅ ${symbol} - Histórico de 400 candles3m carregado com sucesso.`);

    ema1m400p = calcularEMA(135, candles3m); // equevalente a 400p 1m

    ema3m5p = calcularEMA(5, candles3m);
    ema3m10p = calcularEMA(10, candles3m);

    sma3m400p = calcularSMA(400, candles3m);
    ema3m400p = calcularEMA(400, candles3m);

    const s20 = calcularSMA(20, candles3m);
    const e20 = calcularEMA(20, candles3m);

    const s100 = calcularSMA(100, candles3m);
    const e100 = calcularEMA(100, candles3m);

    const s110 = calcularSMA(110, candles3m);
    const e110 = calcularEMA(110, candles3m);

    if (s100 && s110 && e100 && e110) {
      medias3m = [s100, s110, e100, e110];
    }

    if (s20 && e20) {
      m20p3m = [s20, e20];
    }

  } catch (err) {
    parentPort.postMessage(`❌ Erro ao carregar histórico de candles3m: ${JSON.stringify(err.message)}`);
  }

  try {
    const response = await apiAxios.get('/fapi/v1/klines', {
      params: {
        symbol: symbol,
        interval: '5m',
        limit: 400,
        recvWindow: 15000
      }
    });

    let i5m = 0;

    response.data.forEach(k => {
      candles5m.push({
        index: i5m++,
        timestamp: k[0],
        timestampHD: formatTime(k[0]),
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        isFinal: true
      });
    });

    parentPort.postMessage(`✅ ${symbol} - Histórico de 400 candles5m carregado com sucesso.`);

    const s100 = calcularSMA(100, candles5m);
    const s110 = calcularSMA(110, candles5m);
    const e100 = calcularEMA(100, candles5m);
    const e110 = calcularEMA(110, candles5m);

    if (s100 && s110 && e100 && e110) {
      medias5m = [s100, s110, e100, e110];
    }

  } catch (err) {
    parentPort.postMessage(`❌ Erro ao carregar histórico de candles5m: ${JSON.stringify(err.message)}`);
  }

  try {
    const response = await apiAxios.get('/fapi/v1/klines', {
      params: {
        symbol: symbol,
        interval: '15m',
        limit: 400,
        recvWindow: 15000
      }
    });

    let i15m = 0;

    response.data.forEach(k => {
      candles15m.push({
        index: i15m++,
        timestamp: k[0],
        timestampHD: formatTime(k[0]),
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        isFinal: true
      });
    });

    parentPort.postMessage(`✅ ${symbol} - Histórico de 400 candles15m carregado com sucesso.`);

    const s100 = calcularSMA(100, candles15m);
    const s110 = calcularSMA(110, candles15m);
    const e100 = calcularEMA(100, candles15m);
    const e110 = calcularEMA(110, candles15m);

    if (s100 && s110 && e100 && e110) {
      medias15m = [s100, s110, e100, e110];
    }

  } catch (err) {
    parentPort.postMessage(`❌ Erro ao carregar histórico de candles15m: ${JSON.stringify(err.message)}`);
  }

  try {
    const response = await apiAxios.get('/fapi/v1/klines', {
      params: {
        symbol: symbol,
        interval: '1h',
        limit: 400,
        recvWindow: 15000
      }
    });

    let i1h = 0;

    response.data.forEach(k => {
      candles1h.push({
        index: i1h++,
        timestamp: k[0],
        timestampHD: formatTime(k[0]),
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        isFinal: true
      });
    });

    parentPort.postMessage(`✅ ${symbol} - Histórico de 400 candles1h carregado com sucesso.`);
    /*
        const s100 = calcularSMA(100, candles1h);
        const s110 = calcularSMA(110, candles1h);
        const e100 = calcularEMA(100, candles1h);
        const e110 = calcularEMA(110, candles1h);
    
        if (s100 && s110 && e100 && e110) {
          medias1h = [s100, s110, e100, e110];
        }
    */
  } catch (err) {
    parentPort.postMessage(`❌ Erro ao carregar histórico de candles1h: ${JSON.stringify(err.message)}`);
  }

  try {
    const response = await apiAxios.get('/fapi/v1/klines', {
      params: {
        symbol: symbol,
        interval: '30m',
        limit: 400,
        recvWindow: 15000
      }
    });

    let i30m = 0;

    response.data.forEach(k => {
      candles30m.push({
        index: i30m++,
        timestamp: k[0],
        timestampHD: formatTime(k[0]),
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        isFinal: true
      });
    });

    parentPort.postMessage(`✅ ${symbol} - Histórico de 400 candles30m carregado com sucesso.`);
    /*
        const s100 = calcularSMA(100, candles30m);
        const s110 = calcularSMA(110, candles30m);
        const e100 = calcularEMA(100, candles30m);
        const e110 = calcularEMA(110, candles30m);
    
        if (s100 && s110 && e100 && e110) {
          medias30m = [s100, s110, e100, e110];
        }
    */
  } catch (err) {
    parentPort.postMessage(`❌ Erro ao carregar histórico de candles30m: ${JSON.stringify(err.message)}`);
  }
  /*
      try {
        const response = await apiAxios.get('/fapi/v1/klines', {
          params: {
            symbol: symbol,
            interval: '4h',
            limit: 400,
            recvWindow: 15000
          }
        });
    
        let i4h = 0;
    
        response.data.forEach(k => {
          candles4h.push({
            index: i4h++,
            timestamp: k[0],
            timestampHD: formatTime(k[0]),
            open: parseFloat(k[1]),
            high: parseFloat(k[2]),
            low: parseFloat(k[3]),
            close: parseFloat(k[4]),
            isFinal: true
          });
        });
    
        parentPort.postMessage(`✅ ${symbol} - Histórico de 400 candles4h carregado com sucesso.`);
        *
            const s100 = calcularSMA(100, candles4h);
            const s110 = calcularSMA(110, candles4h);
            const e100 = calcularEMA(100, candles4h);
            const e110 = calcularEMA(110, candles4h);
        
            if (s100 && s110 && e100 && e110) {
              medias4h = [s100, s110, e100, e110];
            }
        *
      } catch (err) {
        parentPort.postMessage(`❌ Erro ao carregar histórico de candles4h: ${JSON.stringify(err.message)}`);
      }
    */

}

async function criarOrdem(side, stopPrice /* price */) {

  parentPort.postMessage(`✅ Worker - criarOrdem`);

  ordemAtiva = await verificarOrdemAberta();
  if (ordemAtiva) { return; }

  posicaoAberta = await verificarSeTemPosicao();
  if (posicaoAberta) { return; }

  let timestamp = Date.now() + offset;
  //const adjustedPrice = adjustPrice(price, tickSize);
  /*
    console.log({
      originalPrice: price,
      tickSize,
      adjustedPrice
    });
    */
  quantity = await getQntbyBalance();

  let price = undefined;
  if (side == "BUY") {
    price = parseFloat(stopPrice + (tickSize * 3)).toFixed(precisions.pricePrecision);
  } else if (side == "SELL") {
    price = parseFloat(stopPrice - (tickSize * 3)).toFixed(precisions.pricePrecision);
  }

  console.log({
    side: side,
    stopPrice: parseFloat(stopPrice).toFixed(precisions.pricePrecision),
    price: parseFloat(price).toFixed(precisions.pricePrecision),
    quantity: parseFloat(quantity.toFixed(precisions.quantityPrecision)),
    PrecisPrice: precisions.pricePrecision,
    PrecisQtt: precisions.quantityPrecision
  });

  const params = {
    symbol,
    side,
    //type: 'LIMIT',
    type: 'STOP',
    timeInForce: 'GTC',
    //timeInForce: 'GTD',
    quantity: parseFloat(quantity.toFixed(precisions.quantityPrecision)),
    //price: adjustedPrice.toFixed(precisions.pricePrecision),
    stopPrice: parseFloat(stopPrice).toFixed(precisions.pricePrecision),
    price: /*Number(*/parseFloat(price).toFixed(precisions.pricePrecision), //),
    timestamp: timestamp,
    recvWindow: 15000
  };
  params.signature = gerarAssinatura(params);

  try {
    const res = await axios.post('https://fapi.binance.com/fapi/v1/order', null, {
      params,
      headers: { 'X-MBX-APIKEY': API_KEY }
    });
    parentPort.postMessage(`✅ Ordem ${side} criada @ ${stopPrice}`);

    return { orderId: res.data.orderId, side, price: stopPrice, quantity };
  } catch (err) {
    if (err.response.data.code == -4164 ||
      err.response.data.code == -2019) {
      margemInsuf = true;
    }

    const errorData = err.response?.data;

    if (errorData?.code === -2021) {
      parentPort.postMessage(`⚠️ Erro -2021(open): Order would immediately trigger. Fechando posição imediatamente.`);
      await abrirPosicao(sideOrd, quantity);
    }

    parentPort.postMessage(`❌ Erro criando ordem: ${JSON.stringify(err.response?.data || err.message, null, 2)}`);

    return null;
  }
}

async function criarTakeProfit(takePrice) {
  parentPort.postMessage(`✅ Worker - criarTakeProfit`);
  let oppositeSide = sideOrd === 'BUY' ? 'SELL' : 'BUY';

  takeAtivo = await verificarTakeAtivo();

  if (takeAtivo !== undefined && takeAtivo !== null) {
    if (parseFloat(parseFloat(takeAtivo.price).toFixed(precisions.pricePrecision)) === parseFloat(parseFloat(takePrice).toFixed(precisions.pricePrecision))) return;
  }


  if (ordemAtiva) {
    quantity = Math.abs(ordemAtiva.quantity);
    oppositeSide = ordemAtiva.side === 'BUY' ? 'SELL' : 'BUY';
  }

  if (posicaoAberta) {
    quantity = Math.abs(posicaoAberta.positionAmt);
    oppositeSide = parseFloat(posicaoAberta.positionAmt) > parseFloat(0.0) ? 'SELL' : 'BUY';

  }

  let timestamp = Date.now() + offset;

  const params = {
    symbol,
    side: oppositeSide,
    algotype: 'CONDITIONAL',
    type: 'TAKE_PROFIT_MARKET',
    //stopPrice: adjustedStop.toFixed(precisions.pricePrecision),
    triggerPrice: parseFloat(parseFloat(takePrice).toFixed(precisions.pricePrecision)),
    //quantity: parseFloat(parseFloat(quantity).toFixed(precisions.quantityPrecision)),
    timestamp: timestamp,
    closePosition: true,
    recvWindow: 15000
  };
  params.signature = gerarAssinatura(params);

  try {
    /*
        const res = await axios.post('https://fapi.binance.com/fapi/v1/algoOrder', null, {
          params,
          headers: { 'X-MBX-APIKEY': API_KEY }
        });
        parentPort.postMessage(`✅ Take (${oppositeSide}) criado @ ${takePrice}`);
        return res.data;
    */
    return undefined;
  } catch (err) {
    parentPort.postMessage(`❌ Erro criando Take: ${JSON.stringify(err.response?.data || err.message)}`);

    const errorData = err.response?.data;

    if (errorData?.code === -2021) {
      parentPort.postMessage(`⚠️ Erro -2021(Take): Order would immediately trigger. Fechando posição imediatamente.`);
      await fecharPosicao(sideOrd, Math.abs(posicaoAberta.positionAmt));
    }
    return null;
  }
}

async function criarStopLoss(stopPrice) {
  parentPort.postMessage(`✅ Worker - criarStopLoss`);
  let oppositeSide = sideOrd === 'BUY' ? 'SELL' : 'BUY';

  stopAtivo = await verificarStopAtivo();

  if (stopAtivo !== undefined && stopAtivo !== null) {
    if (parseFloat(parseFloat(stopAtivo.price).toFixed(precisions.pricePrecision)) === parseFloat(parseFloat(stopPrice).toFixed(precisions.pricePrecision))) return;
  }

  if (ordemAtiva) {
    quantity = Math.abs(ordemAtiva.quantity);
    oppositeSide = ordemAtiva.side === 'BUY' ? 'SELL' : 'BUY';
  }

  if (posicaoAberta) {
    quantity = Math.abs(posicaoAberta.positionAmt);
    oppositeSide = parseFloat(posicaoAberta.positionAmt) > parseFloat(0.0) ? 'SELL' : 'BUY';

    // (async () => {

    //console.log("Liquidation Price:", liquidationPrice);
    //})();
  }

  let timestamp = Date.now() + offset;

  const params = {
    symbol,
    side: oppositeSide,
    algotype: 'CONDITIONAL',
    type: 'STOP_MARKET',
    //stopPrice: adjustedStop.toFixed(precisions.pricePrecision),
    triggerPrice: parseFloat(parseFloat(stopPrice).toFixed(precisions.pricePrecision)),
    //quantity: parseFloat(parseFloat(quantity).toFixed(precisions.quantityPrecision)),
    timestamp: timestamp,
    closePosition: true,
    recvWindow: 15000
  };
  params.signature = gerarAssinatura(params);

  try {

    const res = await axios.post('https://fapi.binance.com/fapi/v1/algoOrder', null, {
      params,
      headers: { 'X-MBX-APIKEY': API_KEY }
    });
    parentPort.postMessage(`✅ Stop (${oppositeSide}) criado @ ${stopPrice}`);
    return res.data;

    //return undefined;
  } catch (err) {
    parentPort.postMessage(`❌ Erro criando Stop: ${JSON.stringify(err.response?.data || err.message)}`);

    const errorData = err.response?.data;

    if (errorData?.code === -2021) {
      parentPort.postMessage(`⚠️ Erro -2021(Stop): Order would immediately trigger. Fechando posição imediatamente.`);
      await fecharPosicao(sideOrd, Math.abs(posicaoAberta.positionAmt));
    }

    if (errorData?.code === -4045) {
      parentPort.postMessage(`⚠️ Erro -4045(Stop): Order Maxim de stops atngido, removendo excesso.`);
      await limparStops(symbol, sideOrd);
    }



    return null;
  }
}

async function cancelarOrdem(orderId) {
  parentPort.postMessage(`✅ Worker - cancelarOrdem`);

  let timestamp = Date.now() + offset;

  const params = {
    symbol,
    orderId,
    timestamp: timestamp,
    recvWindow: 15000
  };
  params.signature = gerarAssinatura(params);

  try {
    await axios.delete('https://fapi.binance.com/fapi/v1/order', {
      params,
      headers: { 'X-MBX-APIKEY': API_KEY }
    });
    parentPort.postMessage(`🛑 Ordem ${orderId} cancelada`);
    return true;
  } catch (err) {
    parentPort.postMessage(`❌ Erro ao cancelar ordem: ${JSON.stringify(err.response?.data || err.message)}`);
    parentPort.postMessage(`❌ Parametros: ${JSON.stringify(params)}`);
    return false;
  }
}

async function cancelarTodasOrdens() {


  let timestamp = Date.now() + offset;

  const params = {
    symbol,
    timestamp: timestamp,
    recvWindow: 15000
  };
  params.signature = gerarAssinatura(params);

  try {
    const res = await axios.delete('https://fapi.binance.com/fapi/v1/allOpenOrders', {
      params,
      headers: { 'X-MBX-APIKEY': API_KEY }
    });

    parentPort.postMessage(`🧹 Todas as ordens abertas foram canceladas para ${symbol}`);
    return true;
  } catch (err) {
    parentPort.postMessage(`❌ Erro ao cancelar todas as ordens: ${JSON.stringify(err.response?.data || err.message)}`);
    return false;
  }
}
/*
async function abrirPosicao(side, quantityX) {
  parentPort.postMessage(`✅ Worker - abrirPosicao`);

  // Lado oposto para fechar a posição
  //const oppositeSide = side === 'BUY' ? 'SELL' : 'BUY';

  posicaoAberta = await verificarSeTemPosicao(1);

  if (posicaoAberta) {
    parentPort.postMessage(`⚠️ Já existe uma posição aberta para ${symbol}. Abortando abertura de nova posição.`);
    return null;
  }

  let timestamp = Date.now() + offset;

  const params = {
    symbol,
    side: side,
    type: 'MARKET',
    quantity: parseFloat(quantityX.toFixed(precisions.qtyPrecision)),
    //reduceOnly: true,
    timestamp: timestamp,
    recvWindow: 15000
  };
  console.log(params);
  params.signature = gerarAssinatura(params);

  try {
    const res = await apiAxios.post('/fapi/v1/order', null, {
      params,
      headers: { 'X-MBX-APIKEY': API_KEY }
    });

    parentPort.postMessage(`✅ Posição aberta via Market Ordem: ${JSON.stringify(res.data)}`);
    return res.data;

  } catch (err) {
    parentPort.postMessage(`❌ Erro ao abrir posição: ${JSON.stringify(err.response?.data || err.message)}`);
    return null;
  }
}
*/

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function abrirPosicao(side, quantityX, type = 0) {

  if (type == 0) {

    if (!canTrade(symbol)) {
      console.log(`[BLOCK] ${symbol} foi usado nos últimos 5 trades. Operação cancelada.`);
      return null;
    }

    if (isPaused()) {
      console.log("Worker pausado temporariamente...");
      await new Promise(resolve => setTimeout(resolve, 60000));
      return null;
    }
    activatePause(3); // pausa por 3 min

    parentPort.postMessage(`🔒 Tentando adquirir lock para ${symbol}`);

    const release = await acquireLock(symbol); // <-- trava única por símbolo
    parentPort.postMessage(`✅ Lock adquirido para ${symbol}`);

  }
  try {

    const delay = Math.floor(Math.random() * 5000) + 1000; // 1 a 5 s
    console.log(`Aguardando ${delay} ms antes de abrir posição ${side} em ${symbol}...`);

    await sleep(delay);

    const posicaoAberta = await verificarSeTemPosicao(1);

    if (type == 0 && posicaoAberta) {
      parentPort.postMessage(`⚠️ Já existe uma posição aberta para ${symbol}. Abortando nova abertura.`);
      return null;
    }

    await sleep(delay);

    let balance = await carregarCache('Balance');
    let oldBalance = await carregarCache('oldBalance');

    let perc = percentage(
      toFixedNumber(oldBalance.marginBalance),
      toFixedNumber(balance.marginBalance)
    );

    const contPos = await verificarSeTemPosicao(2);

    if (type == 0 && contPos >= parseFloat(process.env.TRDSIMULT)) {
      parentPort.postMessage(`⚠️ Já existem tres posições abertas. Abortando nova abertura.`);
      return null;
    }


    /*
    const amtPos = await verificarSeTemPosicao(3);
    
          if (type == 0 && ((amtPos > 0 && side == 'BUY') || (amtPos < 0 && side == 'SELL'))){
            parentPort.postMessage(`⚠️ Já existem posições abertas na mesma direção. Abortando nova abertura.`);
          return null;
          }
    */
    const timestamp = Date.now() + offset;
    const params = {
      symbol,
      side,
      type: 'MARKET',
      quantity: parseFloat(quantityX.toFixed(precisions.qtyPrecision)),
      timestamp,
      recvWindow: 15000,
    };

    params.signature = gerarAssinatura(params);
    if ((type == 0 && /*(contPos < 2
      && (parseFloat(perc) >= parseFloat(2.5) || parseFloat(perc) <= parseFloat(-10.0))
      
      ) || */ contPos < parseFloat(process.env.TRDSIMULT)) || type == 1 || type == 2) {
      const res = await apiAxios.post('/fapi/v1/order', null, {
        params,
        headers: { 'X-MBX-APIKEY': API_KEY },
      });
      parentPort.postMessage(`✅ Posição aberta via Market Ordem: ${JSON.stringify(res.data)}`);
      return res.data;
    }
    else {
      return null;
    }

  } catch (err) {
    parentPort.postMessage(`❌ Erro ao abrir posição: ${JSON.stringify(err.response?.data || err.message)}`);
    return null;
  } finally {
    if (type == 0) {
      release(); // 🔓 libera o lock
      parentPort.postMessage(`🔓 Lock liberado para ${symbol}`);
    }
  }
}

async function fecharPosicao(side, quantityY) {
  parentPort.postMessage(`✅ Worker - fecharPosicao`);

  // Lado oposto para fechar a posição
  const oppositeSide = side === 'BUY' ? 'SELL' : 'BUY';

  let timestamp = Date.now() + offset;

  const params = {
    symbol,
    side: oppositeSide,
    type: 'MARKET',
    quantity: parseFloat(quantityY.toFixed(precisions.qtyPrecision)),
    reduceOnly: true,
    timestamp: timestamp,
    recvWindow: 15000
  };
  console.log('quantityY', quantityY);
  console.log('precisions.qtyPrecision', precisions.qtyPrecision);
  console.log('params', params);
  params.signature = gerarAssinatura(params);

  try {
    const res = await apiAxios.post('/fapi/v1/order', null, {
      params,
      headers: { 'X-MBX-APIKEY': API_KEY }
    });

    parentPort.postMessage(`✅ Posição encerrada via Market Order. Ordem: ${JSON.stringify(res.data)}`);
    return res.data;

  } catch (err) {
    parentPort.postMessage(`❌ Erro ao fechar posição: ${JSON.stringify(err.response?.data || err.message)}`);
    return null;
  }
}

async function verificarStatusOrdem(orderId) {
  parentPort.postMessage(`✅ Worker - verificarStatusOrdem`);

  let timestamp = Date.now() + offset;

  var recvWindow = 15000;
  const params = { symbol, orderId, timestamp: timestamp, recvWindow };
  params.signature = gerarAssinatura(params);

  try {
    const res = await apiAxios.get('/fapi/v1/order', {
      params,
      headers: { 'X-MBX-APIKEY': API_KEY }
    });
    return res.data.status;
  } catch (err) {
    parentPort.postMessage(`❌ Erro ao verificar status: ${JSON.stringify(err.response?.data || err.message)}`), err.response?.data;
    return null;
  }
}

async function verificarOrdemAberta() {

  let timestamp = Date.now() + offset;

  const params = {
    symbol,
    timestamp: timestamp,
    recvWindow: 15000
  };
  params.signature = gerarAssinatura(params);

  try {
    const res = await apiAxios.get('/fapi/v1/openOrders', {
      params,
      headers: { 'X-MBX-APIKEY': API_KEY }
    });

    const ordem = res.data.find(o => o.symbol === symbol && o.status === 'NEW' && (o.type === 'STOP' || o.type === 'LIMIT'));

    if (ordem) {
      return {
        orderId: ordem.orderId,
        price: parseFloat(ordem.price),
        side: ordem.side,
        quantity: parseFloat(ordem.origQty),
        type: ordem.type
      };
    }

    return null;
  } catch (err) {
    parentPort.postMessage(`❌ Erro ao verificar ordem aberta: ${JSON.stringify(err.response?.data || err.message)}`);
    return null;
  }
}

async function verificarStopAtivo() {

  let stopLss = undefined;
  let timestamp = Date.now() + offset;

  const params = {
    symbol,
    timestamp: timestamp,
    recvWindow: 15000
  };
  params.signature = gerarAssinatura(params);

  try {
    const res = await apiAxios.get('/fapi/v1/openOrders', {
      params,
      headers: { 'X-MBX-APIKEY': API_KEY }
    });

    //const stopLss = res.data.find(o => o.symbol === symbol && o.status === 'NEW' && o.type === 'STOP_MARKET');

    if (sideOrd == "BUY") {
      stopLss = res.data
        .filter(o => o.symbol === symbol && o.status === 'NEW' && o.type === 'STOP_MARKET')
        .reduce((max, obj) => parseFloat(obj.stopPrice) > parseFloat(max.stopPrice) ? obj : max, { stopPrice: '-Infinity' });
    }

    if (sideOrd == "SELL") {
      stopLss = res.data
        .filter(o => o.symbol === symbol && o.status === 'NEW' && o.type === 'STOP_MARKET')
        .reduce((min, obj) => parseFloat(obj.stopPrice) < parseFloat(min.stopPrice) ? obj : min, { stopPrice: 'Infinity' });
    }

    if (stopLss) {
      //	if (stopLss.stopPrice !== null && stopLss.stopPrice !== '-Infinity'  && stopLss.stopPrice !== 'Infinity' ){
      let stopAtvAux = {
        orderId: stopLss.orderId,
        price: parseFloat(stopLss.stopPrice),
        side: stopLss.side,
        quantity: parseFloat(stopLss.origQty),
        type: stopLss.type
      };

      if (stopAtvAux.price == null) {
        return null;
      } else {
        return stopAtvAux;
      }
      // }
    }

    return null;
  } catch (err) {
    parentPort.postMessage(`❌ Erro ao verificar stop ativo: ${JSON.stringify(err.response?.data || err.message, null, 2)}`);
    return null;
  }
}

async function verificarTakeAtivo() {
  let takeProfit = undefined;
  let timestamp = Date.now() + offset;

  const params = {
    symbol,
    timestamp: timestamp,
    recvWindow: 15000
  };
  params.signature = gerarAssinatura(params);

  try {
    const res = await apiAxios.get('/fapi/v1/openOrders', {
      params,
      headers: { 'X-MBX-APIKEY': API_KEY }
    });

    if (sideOrd == "BUY") {
      takeProfit = res.data
        .filter(o => o.symbol === symbol && o.status === 'NEW' && o.type === 'TAKE_PROFIT_MARKET')
        .reduce((max, obj) => parseFloat(obj.stopPrice) > parseFloat(max.stopPrice) ? obj : max, { stopPrice: '-Infinity' });
    }

    if (sideOrd == "SELL") {
      takeProfit = res.data
        .filter(o => o.symbol === symbol && o.status === 'NEW' && o.type === 'TAKE_PROFIT_MARKET')
        .reduce((min, obj) => parseFloat(obj.stopPrice) < parseFloat(min.stopPrice) ? obj : min, { stopPrice: 'Infinity' });
    }

    if (takeProfit) {
      let takeAtvAux = {
        orderId: takeProfit.orderId,
        price: parseFloat(takeProfit.stopPrice),
        side: takeProfit.side,
        quantity: parseFloat(takeProfit.origQty),
        type: takeProfit.type
      };

      if (takeAtvAux.price == null || isNaN(takeAtvAux.price)) {
        return null;
      } else {
        return takeAtvAux;
      }
    }
    return null;
  } catch (err) {
    console.error('Erro ao verificar take ativo:', err);
    return null;
  }
}
/*
async function verificarSeTemPosicao(type = 1) {

  parentPort.postMessage(`✅ Worker - verificarSeTemPosicao`);

  let timestamp = Date.now() + offset;

  var recvWindow = 15000;
  const params = { timestamp: timestamp, recvWindow };
  params.signature = gerarAssinatura(params);

  try {
    const res = await apiAxios.get('/fapi/v2/positionRisk', {
      params,
      headers: { 'X-MBX-APIKEY': API_KEY }
    });

    const pos = res.data.find(p => p.symbol === symbol && parseFloat(p.positionAmt) !== parseFloat(0.0));
    // Filtra apenas posições abertas
    const openPositions = res.data.filter(pos => parseFloat(pos.positionAmt) !== 0);

    // Faz a contagem  
    const count = openPositions.length;


    if (type == 1) {

      //pos.cont = count;  
      if (pos === undefined || pos === null || pos === '') {
        return 0;
      } else {
        return pos;
      }
    } else if (type == 2) {
      return count;
    }

  } catch (err) {
    parentPort.postMessage(`❌ Erro ao verificar posição: ${JSON.stringify(err.response?.data || err.message)} `);
    return false;
  }
}
*/

const CACHE_PATH = path.resolve(__dirname, 'cache/cachepos.json');

// Garante que o arquivo exista
function garantirCache() {
  if (!fs.existsSync(CACHE_PATH)) {
    fs.writeFileSync(CACHE_PATH, '{}');
    console.log('[monitorWorker] cachepos.json criado.');
  }
}


/**
 * Verifica se há posição aberta para o símbolo informado,
 * lendo diretamente do cachepos.json (atualizado pelo positionWorker)
 * 
 * @param {number} type 1 = retornar posição específica, 2 = retornar contagem total
 * @returns {object|number|false}
 */
/**
 * Verifica se há posição aberta no símbolo especificado
 * lendo os dados do cachepos.json (atualizado via WebSocket pelo positionWorker)
 *
 * @param {number} type - 1 = retorna a posição específica, 2 = retorna o número total de posições
 * @returns {object|number|0|false}
 */

async function verificarSeTemPosicao(type = 1) {
  try {
    const raw = fs.readFileSync(CACHE_PATH, 'utf8');
    const cache = JSON.parse(raw || '{}');
    //const pos = cache[symbol];
    //const amt = parseFloat(pos?.positionAmt || 0);
    //const temPos = pos && Math.abs(amt) > 0;

    const pos = Object.values(cache).find(p => p.symbol === symbol && parseFloat(p.positionAmt) !== parseFloat(0.0));
    // Filtra apenas posições abertas
    const openPositions = Object.values(cache).filter(pos => parseFloat(pos.positionAmt) !== 0);

    // Faz a contagem  
    const count = openPositions.length;

    if (type == 1) {
      //pos.cont = count;  
      if (pos === undefined || pos === null || pos === '') {
        return 0;
      } else {
        return pos;
      }
    } else if (type == 2) {
      return count;
    } else if (type == 3) {
      return openPositions[0].positionAmt;
    }
  } catch (err) {
    parentPort?.postMessage(`❌ Erro ao verificar posição: ${err.message}`);
    return false;
  }
}


async function atualizarStop(side, novoStop) {
  parentPort.postMessage(`✅ Worker - atualizarStop`);
  const oppositeSide = side === 'BUY' ? 'SELL' : 'BUY';

  stopAtivo = await verificarStopAtivo();

  if (stopAtivo !== undefined && stopAtivo !== null) {
    if (stopAtivo.price === novoStop) return;
  }
  if (oldStop !== undefined && oldStop !== null) {
    if (oldStop.price === novoStop) return;
  }

  if (sideOrd == 'BUY') {
    //  if(preco_atual <= novoStop)return;
  } else if (sideOrd == 'SELL') {
    // if(preco_atual >= novoStop)return;
  }

  oldStop2 = oldStop;
  oldStop = stopAtivo;

  stopAtivo = await criarStopLoss(novoStop);
  /*
    if(stopAtivo === undefined || stopAtivo === null){
  stopAtivo = await criarStopLoss(sideOrd, novoStop);
  }
  
      if(stopAtivo === undefined || stopAtivo === null){
  stopAtivo = await criarStopLoss(sideOrd, novoStop);
  }
  */
  await limparStops(symbol, sideOrd);
  /*
    
  if (stopAtivo !== undefined && stopAtivo !== null &&
  oldStop !== undefined && oldStop !== null &&
  oldStop2 !== undefined && oldStop2 !== null ) {
    
  await cancelarOrdem(oldStop2.orderId);
    oldStop2 = undefined;
    }
    
  */

}

async function limparStops(symbol, side) {

  let timestamp = Date.now() + offset;

  const params = {
    symbol,
    timestamp: timestamp,
    recvWindow: 15000
  };
  params.signature = gerarAssinatura(params);


  try {
    // Obtém todas as ordens abertas
    const res = await apiAxios.get('/fapi/v1/openOrders', {
      params,
      headers: { 'X-MBX-APIKEY': API_KEY }
    });

    // Filtra apenas ordens STOP_MARKET do lado correto
    const stops = res.data.filter(o =>
      o.symbol === symbol &&
      o.status === 'NEW' &&
      o.type === 'STOP_MARKET' //&&
      // o.side === side
    );

    if (stops.length <= 2) return; // Nada a fazer

    // Ordena por stopPrice
    const ordenadas = stops.sort((a, b) => {
      const spA = parseFloat(a.stopPrice);
      const spB = parseFloat(b.stopPrice);
      return side === 'BUY' ? spB - spA : spA - spB; // BUY = maiores, SELL = menores
    });

    // Mantém os dois primeiros
    const manter = ordenadas.slice(0, 2);
    const cancelar = ordenadas.slice(2); // Excedentes

    // Cancela as ordens excedentes
    for (const ordem in cancelar) {
      await cancelarOrdem(cancelar[ordem].orderId);
      console.log(`Ordem ${cancelar[ordem].orderId} cancelada (stopPrice ${cancelar[ordem].stopPrice})`);
    }

    console.log(`Mantidas as ordens:`, manter.map(o => o.orderId));
  } catch (err) {
    console.error('Erro ao gerenciar stops:', err);
  }
}

async function atualizarTake(side, novoTake) {
  parentPort.postMessage(`✅ Worker - atualizarTake`);
  const oppositeSide = side === 'BUY' ? 'SELL' : 'BUY';

  takeAtivo = await verificarTakeAtivo();

  if (takeAtivo !== undefined && takeAtivo !== null) {
    if (takeAtivo.price === novoTake) return;
  }
  if (oldTake !== undefined && oldTake !== null) {
    if (oldTake.price === novoTake) return;
  }

  oldTake2 = oldTake;
  oldTake = takeAtivo;

  takeAtivo = await criarTakeProfit(novoTake);
  await limparTakes(symbol, side);
}

async function limparTakes(symbol, side) {
  let timestamp = Date.now() + offset;
  const params = {
    symbol,
    timestamp: timestamp,
    recvWindow: 15000
  };
  params.signature = gerarAssinatura(params);

  try {
    // Obtém todas as ordens abertas
    const res = await apiAxios.get('/fapi/v1/openOrders', {
      params,
      headers: { 'X-MBX-APIKEY': API_KEY }
    });

    // Filtra apenas ordens TAKE_PROFIT do lado correto
    const takes = res.data.filter(o =>
      o.symbol === symbol &&
      o.status === 'NEW' &&
      o.type === 'TAKE_PROFIT_MARKET' //&&
      // o.side === side
    );

    if (takes.length <= 2) return; // Nada a fazer

    // Ordena por takeProfitPrice
    const ordenadas = takes.sort((a, b) => {
      const tpA = parseFloat(a.stopPrice || a.takeProfitPrice);
      const tpB = parseFloat(b.stopPrice || b.takeProfitPrice);
      return side === 'BUY' ? tpA - tpB : tpB - tpA; // BUY = maiores, SELL = menores
    });

    // Mantém os dois primeiros
    const manter = ordenadas.slice(0, 2);
    const cancelar = ordenadas.slice(2); // Excedentes

    // Cancela as ordens excedentes
    for (const ordem of cancelar) {
      await cancelarOrdem(ordem.orderId);
      console.log(`Ordem ${ordem.orderId} cancelada (takeProfitPrice ${ordem.takeProfitPrice})`);
    }

    console.log(`Mantidas as ordens:`, manter.map(o => o.orderId));
  } catch (err) {
    console.error('Erro ao gerenciar takes:', err);
  }
}

function iniciarWebSocketcandles1m() {

  parentPort.postMessage(`✅ Worker iniciarWebSocketCandles1m: ${workerData.symbol}`);

  const ws = new WebSocket(`wss://fstream.binance.com/ws/${wsSymbol}@kline_1m`);

  ws.on('message', (data) => {
    const json = JSON.parse(data);
    const k = json.k;

    const candle1m = {

      index: candles1m.length + 1,
      timestamp: k.t,
      timestampHD: formatTime(k.t),
      time: k.t,
      open: parseFloat(k.o),
      high: parseFloat(k.h),
      low: parseFloat(k.l),
      close: parseFloat(k.c),
      isFinal: k.x

    };

    if (candle1m.isFinal) {
      candles1m.push(candle1m);

      //if (candles1m.length > 400) candles1m.shift();

      ema1m5p_2 = ema1m5p;
      ema1m10p_2 = ema1m10p;

      ema1m5p = calcularEMA(5, candles1m);
      ema1m10p = calcularEMA(10, candles1m);
      ema1m400p = calcularEMA(135, candles3m); // equivalrntr a 400p 1m
      sma1m400p = calcularSMA(400, candles1m);

      ema1m100p = calcularEMA(100, candles1m);
      sma1m100p = calcularSMA(100, candles1m);

      const s50 = calcularSMA(50, candles1m);
      const s60 = calcularSMA(60, candles1m);
      const e50 = calcularEMA(50, candles1m);
      const e60 = calcularEMA(60, candles1m);

      if (s50 && s60 && e50 && e60) {
        medias1m = [s50, s60, e50, e60];
      }


      const s100 = calcularSMA(100, candles1m);
      const s110 = calcularSMA(110, candles1m);
      const e100 = calcularEMA(100, candles1m);
      const e110 = calcularEMA(110, candles1m);

      if (s100 && s110 && e100 && e110) {
        medias1m = [s100, s110, e100, e110];
      }

    }
    //parentPort.postMessage("medias1m", medias1m);
  });

  ws.on('close', (code, reason) => {
    parentPort.postMessage(`[${symbol}] WebSocket1m fechado. Código: ${code}, Motivo: ${reason}`);
    setTimeout(iniciarWebSocketcandles1m, 5000);
  });

  ws.on('error', (err) => {
    parentPort.postMessage(`[${symbol}] WebSocket1m erro: ${err.message}`);
    ws.terminate();
    setTimeout(iniciarWebSocketcandles1m, 5000);
  });
}

function iniciarWebSocketcandles3m() {

  parentPort.postMessage(`✅ Worker iniciarWebSocketCandles3m: ${workerData.symbol}`);

  const ws = new WebSocket(`wss://fstream.binance.com/ws/${wsSymbol}@kline_3m`);

  ws.on('message', (data) => {
    const json = JSON.parse(data);
    const k = json.k;

    const candle3m = {

      index: candles3m.length + 1,
      timestamp: k.t,
      timestampHD: formatTime(k.t),
      time: k.t,
      open: parseFloat(k.o),
      high: parseFloat(k.h),
      low: parseFloat(k.l),
      close: parseFloat(k.c),
      isFinal: k.x

    };

    if (candle3m.isFinal) {
      candles3m.push(candle3m);

      //if (candles3m.length > 400) candles3m.shift();
      /*
      const s50 = calcularSMA(50, candles3m);  
      const s60 = calcularSMA(60, candles3m);  
      const e50 = calcularEMA(50, candles3m);  
      const e60 = calcularEMA(60, candles3m);  
      
      if (s50 && s60 && e50 && e60) {  
        medias3m = [s50, s60, e50, e60];  
      }  
      */

      ema3m5p_2 = ema3m5p;
      ema3m10p_2 = ema3m10p;

      ema3m5p = calcularEMA(5, candles3m);
      ema3m10p = calcularEMA(10, candles3m);
      sma3m400p = calcularSMA(400, candles3m);
      ema3m400p = calcularEMA(400, candles3m);

      const s20 = calcularSMA(20, candles3m);
      const e20 = calcularEMA(20, candles3m);

      const s100 = calcularSMA(100, candles3m);
      const e100 = calcularEMA(100, candles3m);

      const s110 = calcularSMA(110, candles3m);
      const e110 = calcularEMA(110, candles3m);

      if (s100 && s110 && e100 && e110) {
        medias3m = [s100, s110, e100, e110];
      }

      if (s20 && e20) {
        m20p3m = [s20, e20];
      }

    }
    //parentPort.postMessage("medias3m", medias3m);
  });

  ws.on('close', (code, reason) => {
    parentPort.postMessage(`[${symbol}] WebSocket3m fechado. Código: ${code}, Motivo: ${reason}`);
    setTimeout(iniciarWebSocketcandles3m, 5000);
  });

  ws.on('error', (err) => {
    parentPort.postMessage(`[${symbol}] WebSocket3m erro: ${err.message}`);
    ws.terminate();
    setTimeout(iniciarWebSocketcandles3m, 5000);
  });
}

function iniciarWebSocketcandles5m() {

  parentPort.postMessage(`✅ Worker iniciarWebSocketCandles5m: ${workerData.symbol}`);

  const ws = new WebSocket(`wss://fstream.binance.com/ws/${wsSymbol}@kline_5m`);

  ws.on('message', (data) => {
    const json = JSON.parse(data);
    const k = json.k;

    const candle5m = {

      index: candles5m.length + 1,
      timestamp: k.t,
      timestampHD: formatTime(k.t),
      time: k.t,
      open: parseFloat(k.o),
      high: parseFloat(k.h),
      low: parseFloat(k.l),
      close: parseFloat(k.c),
      isFinal: k.x

    };

    if (candle5m.isFinal) {
      candles5m.push(candle5m);

      //if (candles5m.length > 400) candles5m.shift();
      /*
      const s50 = calcularSMA(50, candles5m);  
      const s60 = calcularSMA(60, candles5m);  
      const e50 = calcularEMA(50, candles5m);  
      const e60 = calcularEMA(60, candles5m);  
      
      if (s50 && s60 && e50 && e60) {  
        medias5m = [s50, s60, e50, e60];  
      }  
      *

      const s100 = calcularSMA(100, candles5m);
      const s110 = calcularSMA(110, candles5m);
      const e100 = calcularEMA(100, candles5m);
      const e110 = calcularEMA(110, candles5m);

      if (s100 && s110 && e100 && e110) {
        medias5m = [s100, s110, e100, e110];
      }

      */
    }
    //parentPort.postMessage("medias5m", medias5m);
  });

  ws.on('close', (code, reason) => {
    parentPort.postMessage(`[${symbol}] WebSocket5m fechado. Código: ${code}, Motivo: ${reason}`);
    setTimeout(iniciarWebSocketcandles5m, 5000);
  });

  ws.on('error', (err) => {
    parentPort.postMessage(`[${symbol}] WebSocket5m erro: ${err.message}`);
    ws.terminate();
    setTimeout(iniciarWebSocketcandles5m, 5000);
  });
}

function iniciarWebSocketcandles15m() {

  parentPort.postMessage(`✅ Worker iniciarWebSocketCandles15m: ${workerData.symbol}`);

  const ws = new WebSocket(`wss://fstream.binance.com/ws/${wsSymbol}@kline_15m`);

  ws.on('message', (data) => {
    const json = JSON.parse(data);
    const k = json.k;

    const candle15m = {

      index: candles15m.length + 1,
      timestamp: k.t,
      timestampHD: formatTime(k.t),
      time: k.t,
      open: parseFloat(k.o),
      high: parseFloat(k.h),
      low: parseFloat(k.l),
      close: parseFloat(k.c),
      isFinal: k.x

    };

    if (candle15m.isFinal) {
      candles15m.push(candle15m);

      //if (candles15m.length > 400) candles15m.shift();
      /*
      const s50 = calcularSMA(50, candles15m);  
      const s60 = calcularSMA(60, candles15m);  
      const e50 = calcularEMA(50, candles15m);  
      const e60 = calcularEMA(60, candles15m);  
      
      if (s50 && s60 && e50 && e60) {  
        medias15m = [s50, s60, e50, e60];  
      }  
      *

      const s100 = calcularSMA(100, candles15m);
      const s110 = calcularSMA(110, candles15m);
      const e100 = calcularEMA(100, candles15m);
      const e110 = calcularEMA(110, candles15m);

      if (s100 && s110 && e100 && e110) {
        medias15m = [s100, s110, e100, e110];
      }

      */
    }
    //parentPort.postMessage("medias15m", medias15m);
  });

  ws.on('close', (code, reason) => {
    parentPort.postMessage(`[${symbol}] WebSocket15m fechado. Código: ${code}, Motivo: ${reason}`);
    setTimeout(iniciarWebSocketcandles15m, 5000);
  });

  ws.on('error', (err) => {
    parentPort.postMessage(`[${symbol}] WebSocket15m erro: ${err.message}`);
    ws.terminate();
    setTimeout(iniciarWebSocketcandles15m, 5000);
  });
}

function iniciarWebSocketcandles30m() {

  parentPort.postMessage(`✅ Worker iniciarWebSocketCandles30m: ${workerData.symbol}`);

  const ws = new WebSocket(`wss://fstream.binance.com/ws/${wsSymbol}@kline_30m`);

  ws.on('message', (data) => {
    const json = JSON.parse(data);
    const k = json.k;

    const candle30m = {

      index: candles30m.length + 1,
      timestamp: k.t,
      timestampHD: formatTime(k.t),
      time: k.t,
      open: parseFloat(k.o),
      high: parseFloat(k.h),
      low: parseFloat(k.l),
      close: parseFloat(k.c),
      isFinal: k.x

    };

    if (candle30m.isFinal) {
      candles30m.push(candle30m);

      //if (candles30m.length > 400) candles30m.shift();
      /*
      const s50 = calcularSMA(50, candles30m);  
      const s60 = calcularSMA(60, candles30m);  
      const e50 = calcularEMA(50, candles30m);  
      const e60 = calcularEMA(60, candles30m);  
      
      if (s50 && s60 && e50 && e60) {  
        medias30m = [s50, s60, e50, e60];  
      }  
      *

      const s100 = calcularSMA(100, candles30m);
      const s110 = calcularSMA(110, candles30m);
      const e100 = calcularEMA(100, candles30m);
      const e110 = calcularEMA(110, candles30m);

      if (s100 && s110 && e100 && e110) {
        medias30m = [s100, s110, e100, e110];
      }

      */
    }
    //parentPort.postMessage("medias30m", medias30m);
  });

  ws.on('close', (code, reason) => {
    parentPort.postMessage(`[${symbol}] WebSocket30m fechado. Código: ${code}, Motivo: ${reason}`);
    setTimeout(iniciarWebSocketcandles30m, 5000);
  });

  ws.on('error', (err) => {
    parentPort.postMessage(`[${symbol}] WebSocket30m erro: ${err.message}`);
    ws.terminate();
    setTimeout(iniciarWebSocketcandles30m, 5000);
  });
}

function iniciarWebSocketcandles1h() {

  parentPort.postMessage(`✅ Worker iniciarWebSocketCandles1h: ${workerData.symbol}`);

  const ws = new WebSocket(`wss://fstream.binance.com/ws/${wsSymbol}@kline_1h`);

  ws.on('message', (data) => {
    const json = JSON.parse(data);
    const k = json.k;

    const candle1h = {

      index: candles1h.length + 1,
      timestamp: k.t,
      timestampHD: formatTime(k.t),
      time: k.t,
      open: parseFloat(k.o),
      high: parseFloat(k.h),
      low: parseFloat(k.l),
      close: parseFloat(k.c),
      isFinal: k.x

    };

    if (candle1h.isFinal) {
      candles1h.push(candle1h);

      //if (candles1h.length > 400) candles1h.shift();
      /*
      const s50 = calcularSMA(50, candles1h);  
      const s60 = calcularSMA(60, candles1h);  
      const e50 = calcularEMA(50, candles1h);  
      const e60 = calcularEMA(60, candles1h);  
      
      if (s50 && s60 && e50 && e60) {  
        medias1h = [s50, s60, e50, e60];  
      }  
      *

      const s100 = calcularSMA(100, candles1h);
      const s110 = calcularSMA(110, candles1h);
      const e100 = calcularEMA(100, candles1h);
      const e110 = calcularEMA(110, candles1h);

      if (s100 && s110 && e100 && e110) {
        medias1h = [s100, s110, e100, e110];
      }

      */

    }
    //parentPort.postMessage("medias1h", medias1h);
  });

  ws.on('close', (code, reason) => {
    parentPort.postMessage(`[${symbol}] WebSocket1h fechado. Código: ${code}, Motivo: ${reason}`);
    setTimeout(iniciarWebSocketcandles1h, 5000);
  });

  ws.on('error', (err) => {
    parentPort.postMessage(`[${symbol}] WebSocket1h erro: ${err.message}`);
    ws.terminate();
    setTimeout(iniciarWebSocketcandles1h, 5000);
  });
}

function iniciarWebSocketcandles4h() {

  parentPort.postMessage(`✅ Worker iniciarWebSocketCandles4h: ${workerData.symbol}`);

  const ws = new WebSocket(`wss://fstream.binance.com/ws/${wsSymbol}@kline_4h`);

  ws.on('message', (data) => {
    const json = JSON.parse(data);
    const k = json.k;

    const candle4h = {

      index: candles4h.length + 1,
      timestamp: k.t,
      timestampHD: formatTime(k.t),
      time: k.t,
      open: parseFloat(k.o),
      high: parseFloat(k.h),
      low: parseFloat(k.l),
      close: parseFloat(k.c),
      isFinal: k.x

    };

    if (candle4h.isFinal) {
      candles4h.push(candle4h);

      //if (candles4h.length > 400) candles4h.shift();
      /*
      const s50 = calcularSMA(50, candles4h);  
      const s60 = calcularSMA(60, candles4h);  
      const e50 = calcularEMA(50, candles4h);  
      const e60 = calcularEMA(60, candles4h);  
      
      if (s50 && s60 && e50 && e60) {  
        medias4h = [s50, s60, e50, e60];  
      }  
      *

      const s100 = calcularSMA(100, candles4h);
      const s110 = calcularSMA(110, candles4h);
      const e100 = calcularEMA(100, candles4h);
      const e110 = calcularEMA(110, candles4h);

      if (s100 && s110 && e100 && e110) {
        medias4h = [s100, s110, e100, e110];
      }

      */
    }
    //parentPort.postMessage("medias4h", medias4h);
  });

  ws.on('close', (code, reason) => {
    parentPort.postMessage(`[${symbol}] WebSocket4h fechado. Código: ${code}, Motivo: ${reason}`);
    setTimeout(iniciarWebSocketcandles4h, 5000);
  });

  ws.on('error', (err) => {
    parentPort.postMessage(`[${symbol}] WebSocket4h erro: ${err.message}`);
    ws.terminate();
    setTimeout(iniciarWebSocketcandles4h, 5000);
  });
}

function percentage(iniValue, finValue) {
  //return (100 * partialValue) / totalValue;
  return (((finValue - iniValue) / iniValue) * 100);
}

function toFixedNumber(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return 0.0;
  return parseFloat(parseFloat(value).toFixed(decimals));
}

function iniciarWebSocketMarkPrice() {

  //if (monitoramentoAtivado == false) return;

  parentPort.postMessage(`✅ Worker iniciarWebSocketMarkPrice: ${workerData.symbol}`);

  const ws = new WebSocket(`wss://fstream.binance.com/ws/${wsSymbol}@markPrice`);

  contPos = verificarSeTemPosicao(2);
  parentPort.postMessage(`🔎 Total de posições abertas_preOP: ${contPos}`);
  posicaoAberta = verificarSeTemPosicao(1);
  parentPort.postMessage(`🔎 Posição aberta_preOP: ${JSON.stringify(posicaoAberta)}`);


  ws.on('message', async (data) => {



    const json = JSON.parse(data);
    const markPrice = parseFloat(json.p);
    preco_anterior = preco_atual;
    preco_atual = markPrice;

    console.log(`Mark Price de ${symbol}: ${markPrice}  //  Time: ${formatTime(json.E)}`);

    //await gerenciarOrdemEStop(markPrice);
    //() => setTimeout(10000);
    maiorMedia3m = Math.max(...medias3m);
    menorMedia3m = Math.min(...medias3m);

    maiorM3m20p = Math.max(...m20p3m);
    menorM3m20p = Math.min(...m20p3m);

    maiorMReg3m = Math.max(maiorMedia3m, maiorM3m20p);
    menorMReg3m = Math.min(menorMedia3m, menorM3m20p);

    maiorMRegIn3m = Math.max(menorMedia3m, menorM3m20p);
    menorMRegIn3m = Math.min(maiorMedia3m, maiorM3m20p);

    //nLocks = countLocks();
    parentPort.postMessage(`sideOrd: ${sideOrd}`);
    parentPort.postMessage(`gatilhoAtivado: ${gatilhoAtivado}`);
    parentPort.postMessage(`ema1m100p: ${ema1m100p}`);
    parentPort.postMessage(`sma1m100p: ${sma1m100p}`);

    contPos = await verificarSeTemPosicao(2);
    parentPort.postMessage(`🔎 Total de posições abertas: ${contPos}`);



    posicaoAberta = await verificarSeTemPosicao(1);
    parentPort.postMessage(`🔎 Posição aberta: ${JSON.stringify(posicaoAberta)}`);

    parentPort.postMessage(`🔎 Plus ---:> ${plus}`);

    //let balance = await getBalance();
    let balance = await carregarCache('Balance');
    let oldBalance = await carregarCache('oldBalance');

    let perc = percentage(
      toFixedNumber(oldBalance.marginBalance),
      toFixedNumber(balance.marginBalance)
    );

    parentPort.postMessage(`🔎 unRealizedProfit: ${JSON.stringify(balance.unrealizedProfit)}`);

    parentPort.postMessage(`🔎 Perc: ${JSON.stringify(perc)}`);

    if (posicaoAberta !== 0) {

      if (posicaoAberta.positionAmt > 0) {
        sideM = 'C';
        sideOrd = 'BUY';
      } else if (posicaoAberta.positionAmt < 0) {
        sideM = 'V';
        sideOrd = 'SELL';
      }

      let cachepos = await carregarCache('cachepos');

      let pnlRoiAtual = await calcPnlFutBinance(posicaoAberta.entryPrice, preco_atual, Math.abs(posicaoAberta.positionAmt), sideOrd);
      if (pnlRoiAtual !== null || pnlRoiAtual !== undefined) {
        cachepos[symbol].percent = parseFloat(pnlRoiAtual.roi);
        cachepos[symbol].unRealizedProfit = parseFloat(posicaoAberta.unrealizedProfit);

        if (cachepos[symbol].maxPercent < parseFloat(pnlRoiAtual.roi)) {
          cachepos[symbol].maxPercent = parseFloat(pnlRoiAtual.roi);
        }

        if (cachepos[symbol].minPercent > parseFloat(pnlRoiAtual.roi)) {
          cachepos[symbol].minPercent = parseFloat(pnlRoiAtual.roi);
        }

        await salvarCache(cachepos, 'cachepos');
      }
    }
    /*
        stochRsi3m = StochasticRSI.calculate({
          values: candles3m.map(c => c.close),
          rsiPeriod: 14,
          stochasticPeriod: 14,
          kPeriod: 3,
          dPeriod: 3
        });
    
        stochRsi5m = StochasticRSI.calculate({
          values: candles5m.map(c => c.close),
          rsiPeriod: 14,
          stochasticPeriod: 14,
          kPeriod: 3,
          dPeriod: 3
        });
    */

    //let sRsiLast3m = stochRsi3m.slice(-1)[0];
    //let sRsiLast3m_2 = stochRsi3m.slice(-2)[0];
    /*
        let sRsiLast3m = null;
        let sRsiLast3m_2 = null;
    
        if (stochRsi3m !== null) {
          sRsiLast3m = stochRsi3m.slice(-1)[0];
          sRsiLast3m_2 = stochRsi3m.slice(-2)[0];
        }
    
        let sRsiLast5m = null;
        let sRsiLast5m_2 = null;
    
        if (stochRsi5m !== null) {
          sRsiLast5m = stochRsi5m.slice(-1)[0];
          sRsiLast5m_2 = stochRsi5m.slice(-2)[0];
        }
        /*
            let sRsiLast15m = null;
            let sRsiLast15m_2 = null;
        
            if (stochRsi15m !== null) {
              sRsiLast15m = stochRsi15m.slice(-1)[0];
              sRsiLast15m_2 = stochRsi15m.slice(-2)[0];
            }
        *
        let sRsiLast30m = null;
        let sRsiLast30m_2 = null;
    
        if (stochRsi30m !== null) {
          sRsiLast30m = stochRsi30m.slice(-1)[0];
          sRsiLast30m_2 = stochRsi30m.slice(-2)[0];
        }
    
        let sRsiLast1h = null;
        let sRsiLast1h_2 = null;
    
        if (stochRsi1h !== null) {
          sRsiLast1h = stochRsi1h.slice(-1)[0];
          sRsiLast1h_2 = stochRsi1h.slice(-2)[0];
        }
    
        let sRsiLast4h = null;
        let sRsiLast4h_2 = null;
    
        if (stochRsi4h !== null) {
          sRsiLast4h = stochRsi4h.slice(-1)[0];
          sRsiLast4h_2 = stochRsi4h.slice(-2)[0];
        }
    */
    /*
        zigZag15m = calcularZigZag(candles15m); // Defina o threshold adequado
        fibo15m = calcularRetracoesFibonacci(zigZag15m.pontosUnificados);
        ltaltb15m = calcularLinhasTendencia(candles15m, zigZag15m.topos, zigZag15m.fundos);
        */

    zigZag1m = calcularZigZag(candles1m); // Defina o threshold adequado
    fibo1m = calcularRetracoesFibonacci(zigZag1m.pontosUnificados);
    ltaltb1m = calcularLinhasTendencia(candles1m, zigZag1m.topos, zigZag1m.fundos);


    if (gatilhoAtivado === true
      && (
      /*
      (contPos < 2
      && (parseFloat(perc) >= parseFloat(2.5) || parseFloat(perc) <= parseFloat(-10.0))
      
      ) || */ contPos < parseFloat(process.env.TRDSIMULT))
    ) {

      //posicaoAberta = 0;

      //posicaoAberta = await verificarSeTemPosicao(1);
      parentPort.postMessage(`🔎 Posição aberta_preOP: ${JSON.stringify(posicaoAberta)}`);

      if (posicaoAberta === 0) {

        //releaseLock(symbol); // Unlock
        //console.log(`🔓 Lock inexistente em ${symbol}`);

        //const hist = roiTracker.closePosition(symbol);
        //console.log("Fechada:", hist);
        // let cacheRiskAux = await carregarCache('Risk');
        // quantity = await getQntbyBalance();

        //await notificWin(preco_atual, symbol, 'monitAtv', sideM);

        //let lock = hasAnyLock();
        // parentPort.postMessage(`hasAnyLock: ${JSON.stringify(lock)}`);

        if (
          (
            sideOrd == 'BUY' &&
            parseFloat(preco_atual) > parseFloat(preco_anterior)

            //parseFloat(preco_atual) <= parseFloat(ema3m5p) &&
            //parseFloat(preco_atual) >= parseFloat(ema3m10p) 
            ////////////////        
            //parseFloat(preco_atual) > parseFloat(ema3m5p) &&

            //parseFloat(preco_anterior) <= parseFloat(ema3m5p)
            ////////////////////
            /*
                       parseFloat(candles1m.slice(-2)[0].low) <= parseFloat(maiorM3m20p) && //+ (parseFloat(tickSize) * 3))
                       parseFloat(preco_atual) >= parseFloat(maiorM3m20p) // + parseFloat(tickSize) * 3))
           */
            //////////////////////
            //parseFloat(sRsiLast3m.k) >= parseFloat(30.0) &&
            //parseFloat(sRsiLast3m.k) <= parseFloat(70.0) &&
            //parseFloat(sRsiLast3m.k) >= parseFloat(sRsiLast3m_2.k) &&
            //parseFloat(sRsiLast3m.k) <= parseFloat(20.0) &&
            //parseFloat(sRsiLast1m.k) >= parseFloat(sRsiLast1m_2.k)&&

            /*
                        (
                          /*
            
                                                  (
                        fibo1h.dir == 1 &&
                        parseFloat(ltaltb5m.lta) <= parseFloat(fibo5m.retr0618) &&
                        parseFloat(ltaltb5m.lta) >= parseFloat(fibo5m.retr1)
                      ) || (
                        fibo1h.dir == -1 &&
                        parseFloat(ltaltb5m.lta) <= parseFloat(fibo5m.retr0382) &&
                        parseFloat(ltaltb5m.lta) >= parseFloat(fibo5m.retr0)
                      )
            *
                          (
                            parseFloat(candles1m.slice(-1)[0].low) <= parseFloat(ltaltb1m.lta) + (parseFloat(tickSize) * 5) &&
                            parseFloat(candles1m.slice(-1)[0].low) >= parseFloat(ltaltb1m.lta) - (parseFloat(tickSize) * 5) &&
                            parseFloat(preco_atual) >= parseFloat(candles1m.slice(-1)[0].close) //&&
                            //parseFloat(preco_atual) >= parseFloat(ltaltb1m.ltb) //&&
                          )
                          /*
                          || (
                            parseFloat(candles1m.slice(-1)[0].low) <= parseFloat(ltaltb1m.ltb) + (parseFloat(tickSize) * 3) &&
                            parseFloat(preco_atual) >= parseFloat(ltaltb1m.ltb) &&
                            parseFloat(preco_atual) >= parseFloat(ltaltb1m.ltb) //&&
                          )
                            *
                        )
                        */
          ) || (

            sideOrd == 'SELL' &&
            parseFloat(preco_atual) < parseFloat(preco_anterior) //&&

            //parseFloat(preco_atual) >= parseFloat(ema3m5p) &&
            //parseFloat(preco_atual) <= parseFloat(ema3m10p) 
            //////////////
            //parseFloat(preco_atual) <= parseFloat(ema3m5p) &&
            //parseFloat(preco_anterior) >= parseFloat(ema3m5p) 
            /////////////////////////
            /*
                        parseFloat(candles1m.slice(-2)[0].high) >= parseFloat(menorM3m20p) && //- (parseFloat(tickSize) * 3))
                        parseFloat(preco_atual) <= parseFloat(menorM3m20p) // - (parseFloat(tickSize) * 3))
                        
            */
            //////////////////////



            /*
            (

              parseFloat(sRsiLast3m.k) <= parseFloat(70.0) &&
              parseFloat(sRsiLast3m.k) >= parseFloat(30.0) &&
              parseFloat(sRsiLast3m.k) <= parseFloat(sRsiLast3m_2.k) &&
              //parseFloat(sRsiLast3m.k) >= parseFloat(80.0) &&
              //parseFloat(sRsiLast1m.k) >= parseFloat(sRsiLast1m_2.k)&&

              /*
              (
                parseFloat(candles1m.slice(-1)[0].high) >= parseFloat(ltaltb1m.lta) - (parseFloat(tickSize) * 3) &&
                parseFloat(preco_atual) <= parseFloat(ltaltb1m.lta) &&
                parseFloat(preco_atual) <= parseFloat(ltaltb1m.lta) //&&
              ) ||
              *
              (
                parseFloat(candles1m.slice(-1)[0].high) >= parseFloat(ltaltb1m.ltb) - (parseFloat(tickSize) * 5) &&
                parseFloat(candles1m.slice(-1)[0].high) <= parseFloat(ltaltb1m.ltb) + (parseFloat(tickSize) * 5) &&
                parseFloat(preco_atual) <= parseFloat(candles1m.slice(-1)[0].close) //&&
                //parseFloat(preco_atual) <= parseFloat(ltaltb1m.ltb) //&&
              )


            )
            */
          )

        ) {
          contPos = await verificarSeTemPosicao(2);
          parentPort.postMessage(`🔎 Total de posições abertas_preOP: ${contPos}`);

          if (
        /*
        (contPos < 2
      && (parseFloat(perc) >= parseFloat(2.5) || parseFloat(perc) <= parseFloat(-10.0))
      ) || */ contPos < parseFloat(process.env.TRDSIMULT)) {
            //if (contPos < 1) {
            cacheJson = {
              houveReducao: 0,
              houveAdicao: 0,
              maxRoi: 0,
              minRoi: 0
            }

            await salvarCache(cacheJson, symbol);

            parentPort.postMessage(`----> abrindo posição.`);

            quantity = await getQntbyBalance();

            ////////////invTr////////////////
            /*
            if (sideOrd == 'BUY') {
              sideOrd = 'SELL';
            } else if (sideOrd == 'SELL') {
              sideOrd = 'BUY';
            }
            */
            //////////////////////////////

            //await cancelarTodasOrdens();

            let returnPos = await abrirPosicao(sideOrd, quantity);

            /*
                        let novoStopMm = null;
                        if (sideOrd == 'BUY') {
                          novoStopMm = parseFloat(menorMedia3m) - parseFloat(tickSize * 10);
                        } else if (sideOrd == 'SELL') {
                          novoStopMm = parseFloat(maiorMedia3m) + parseFloat(tickSize * 10);
                        }
            
            
                        let novoStopCdl = null;
                        if (sideOrd == 'BUY') {
                          novoStopCdl = parseFloat(candles1m.slice(-1)[0].low) - parseFloat(tickSize * 10);
                        } else if (sideOrd == 'SELL') {
                          novoStopCdl = parseFloat(candles1m.slice(-1)[0].high) + parseFloat(tickSize * 10);
                        }
            
                        let novoTakeLt = null;
                        if (sideOrd == 'BUY') {
                          novoTakeLt = parseFloat(ltaltb5m.ltb) - parseFloat(tickSize * 3);
                        } else if (sideOrd == 'SELL') {
                          novoTakeLt = parseFloat(ltaltb5m.lta) + parseFloat(tickSize * 3);
                        }
            */


            //let novoStop = novoStop50;

            if (returnPos !== null && returnPos !== undefined) {
              await cancelarTodasOrdens();
              addTrade(symbol);

              gatilhoAtivado = false;
              ultimaPosicao = undefined;
              stopAtual = undefined;
              oldStop = undefined;
              novoStop = undefined;

              posicaoAberta = await verificarSeTemPosicao(1);

              if (posicaoAberta !== 0 && posicaoAberta !== null && posicaoAberta !== undefined && posicaoAberta !== false) {
                //let novoStop = await precoAlvoPorPercent(sideOrd, parseFloat(process.env.STOPLOSS), parseFloat(posicaoAberta.entryPrice), symbol);

                exec("pm2 restart nanobot");
                novoTake = await precoAlvoPorPercent(sideOrd, parseFloat(process.env.TAKEPROFIT), parseFloat(posicaoAberta.entryPrice), symbol);

                if (sideOrd == 'BUY') {
                  //novoStop = candles15m.slice(-2)[0].low - (parseFloat(tickSize) * 1);
                  novoStop = await precoAlvoPorPercent(sideOrd, parseFloat(process.env.STOPLOSS), parseFloat(posicaoAberta.entryPrice), symbol);

                } else if (sideOrd == 'SELL') {
                  //novoStop = candles15m.slice(-2)[0].high + (parseFloat(tickSize) * 1);
                  novoStop = await precoAlvoPorPercent(sideOrd, parseFloat(process.env.STOPLOSS), parseFloat(posicaoAberta.entryPrice), symbol);
                }

                stopAtivo = await criarStopLoss(novoStop);
                takeAtivo = await criarTakeProfit(novoTake);


              }
              //exec("pm2 restart nanobot");
            }

          } else {


            if (posicaoAberta !== 0 && posicaoAberta !== null && posicaoAberta !== undefined && posicaoAberta !== false) {

              await sleep(600000);

              if (posicaoAberta.positionAmt > 0) {
                sideM = 'C';
                sideOrd = 'BUY';
              } else if (posicaoAberta.positionAmt < 0) {
                sideM = 'V';
                sideOrd = 'SELL';
              }

              //let novoStop = null;

              //novoStop = novoStopMm;

              //novoStop = await precoAlvoPorPercent(sideOrd, parseFloat(process.env.STOPLOSS), parseFloat(posicaoAberta.entryPrice), symbol);
              novoTake = await precoAlvoPorPercent(sideOrd, parseFloat(process.env.TAKEPROFIT), parseFloat(posicaoAberta.entryPrice), symbol);
              if (sideOrd == 'BUY') {
                //novoStop = candles15m.slice(-2)[0].low - (parseFloat(tickSize) * 1);
                novoStop = await precoAlvoPorPercent(sideOrd, parseFloat(process.env.STOPLOSS), parseFloat(posicaoAberta.entryPrice), symbol);

              } else if (sideOrd == 'SELL') {
                //novoStop = candles15m.slice(-2)[0].high + (parseFloat(tickSize) * 1);
                novoStop = await precoAlvoPorPercent(sideOrd, parseFloat(process.env.STOPLOSS), parseFloat(posicaoAberta.entryPrice), symbol);
              }
              if (stopAtivo !== undefined && stopAtivo !== null) {
                if (stopAtivo.price == null) {
                  stopAtivo = await criarStopLoss(novoStop);
                }

              }

              if (stopAtivo === null || stopAtivo === undefined) {

                stopAtivo = await criarStopLoss(novoStop);

              }

              else if (stopAtivo !== null && stopAtivo !== undefined) {
                if (stopAtivo.price !== parseFloat(parseFloat(novoStop).toFixed(precisions.pricePrecision))) {
                  //await cancelarTodasOrdens();
                  if ((sideOrd == 'BUY' && stopAtivo.price < novoStop) ||
                    (sideOrd == 'SELL' && stopAtivo.price > novoStop)
                  ) {


                    console.log(`Stop alterado: ${stopAtivo.price} / ${novoStop}`);
                    await atualizarStop(sideOrd, novoStop);
                    if (stopAtivo.price !== null) {
                      //await abrirPosicao(sideOrd, (quantity / 4));
                    }
                  }
                }
              }

              if (takeAtivo !== undefined && takeAtivo !== null) {
                if (takeAtivo.price == null) {

                  takeAtivo = await criarTakeProfit(novoTake);

                }

              }
              if (takeAtivo === null || takeAtivo === undefined) {


                takeAtivo = await criarTakeProfit(novoTake);

              }
              else if (takeAtivo !== null && takeAtivo !== undefined) {
                if (parseFloat(takeAtivo.price).toFixed(precisions.pricePrecision) !== parseFloat(parseFloat(novoTake).toFixed(precisions.pricePrecision))) {
                  //await cancelarTodasOrdens();

                  console.log(`Take alterado: ${takeAtivo.price} / ${novoTake}`);
                  await atualizarTake(novoTake);

                }
              }

              parentPort.postMessage(`🔎 stopAtivo: ${JSON.stringify(stopAtivo)}`);
              parentPort.postMessage(`🔎 takeAtivo: ${JSON.stringify(takeAtivo)}`);
            }

          }
        }
      }
      else if (posicaoAberta !== 0 && posicaoAberta !== null && posicaoAberta !== undefined && posicaoAberta !== false) {

        //await sleep(600000);


      }
    }

    if (posicaoAberta !== 0 && posicaoAberta !== null && posicaoAberta !== undefined && posicaoAberta !== false) {



      if (
        //gatilhoAtivado == true && 
        posicaoAberta.positionAmt < 0
        //sideOrd == 'BUY' &&
        //parseFloat(ema1m400p) > parseFloat(sma1m400p)
        && parseFloat(ema1m5p) > parseFloat(maiorMReg1m)
        //parseFloat(preco_atual) > parseFloat(maiorMReg1m)
        && parseFloat(ema1m5p) > parseFloat(ema1m10p_2)


      ) {

        await fecharPosicao(sideOrd, Math.abs(posicaoAberta.positionAmt));
        sideM = '';
        sideOrd = '';
        return;
        //gatilhoAtivado = true;
        //let returnPos = await abrirPosicao(sideOrd, quantity);


      } else if (
        //gatilhoAtivado == true && 
        posicaoAberta.positionAmt > 0
        //sideOrd == 'SELL' &&
        //parseFloat(ema1m400p) < parseFloat(sma1m400p)
        && parseFloat(ema1m5p) < parseFloat(menorMReg1m)
        //parseFloat(preco_atual) < parseFloat(menorMReg1m)
        && parseFloat(ema1m5p) < parseFloat(ema1m10p_2)

      ) {

        await fecharPosicao(sideOrd, Math.abs(posicaoAberta.positionAmt));
        sideM = '';
        sideOrd = '';
        return;
        //gatilhoAtivado = true;
        //let returnPos = await abrirPosicao(sideOrd, quantity);

      }


      if (posicaoAberta.positionAmt > 0) {
        sideM = 'C';
        sideOrd = 'BUY';
      } else if (posicaoAberta.positionAmt < 0) {
        sideM = 'V';
        sideOrd = 'SELL';
      }

      let cachepos = await carregarCache('cachepos');

      // Fechar posição se atingir o limite negativo

      let percRangeStop = parseFloat(cachepos[symbol].maxPercent) - parseFloat(process.env.RANGE);

      parentPort.postMessage(`----> percRangeStop: ${percRangeStop}`);

      if (parseFloat(cachepos[symbol].percent) < parseFloat(percRangeStop)) {
        await fecharPosicao(sideOrd, Math.abs(posicaoAberta.positionAmt));
        sideM = '';
        sideOrd = '';
        return;
      }

      if (parseFloat(cachepos[symbol].percent) > parseFloat(15)
        && parseFloat(cachepos[symbol].plus) == parseFloat(0)) {
        cachepos[symbol].plus = 1;
        cachepos[symbol].Percent = 0;
        cachepos[symbol].maxPercent = 0;
        await salvarCache(cachepos, 'cachepos');

        //await abrirPosicao(sideOrd, Math.abs(posicaoAberta.positionAmt), 1);
      }

      if (parseFloat(cachepos[symbol].percent) > parseFloat(25)
        && cachepos[symbol].plus == 1) {
        cachepos[symbol].plus = 2;
        cachepos[symbol].Percent = 0;
        cachepos[symbol].maxPercent = 0;
        await salvarCache(cachepos, 'cachepos');

        //await abrirPosicao(sideOrd, Math.abs(posicaoAberta.positionAmt), 1);

      }

      //let posicaoAberta

      //////////////////////
      /*
    
      if(
        parseFloat(perc) >= parseFloat(2.0) && posicaoAberta.plus == 0
      ){
        let returnAddPos = await abrirPosicao(sideOrd, quantity, 1);
          
        if (returnAddPos !== null && returnAddPos !== undefined) {
          let cachepos = await carregarCache('cachepos');
          cachepos[symbol].plus = 1; 
          await salvarCache(cachepos, 'cachepos');
          posicaoAberta = await verificarSeTemPosicao(1);
        }
        
      }
      
      if(
        parseFloat(perc) <= parseFloat(-5.0) && posicaoAberta.minus == 0
      ){
        let returnReduPos = await fecharPosicao(sideOrd, (Math.abs(posicaoAberta.positionAmt)/2));
          
        if (returnReduPos !== null && returnReduPos !== undefined) {
          let cachepos = await carregarCache('cachepos');
          cachepos[symbol].minus = 1; 
          await salvarCache(cachepos, 'cachepos');
          posicaoAberta = await verificarSeTemPosicao(1);
        }
        
      }
      */

      ///////////////////////////////////

      //let novoStop = null;

      /*
            let novoStoplt = null;
            if (sideOrd == 'BUY') {
              novoStop = parseFloat(ltaltb5m.lta) - parseFloat(tickSize * 3);
            } else if (sideOrd == 'SELL') {
              novoStop = parseFloat(ltaltb5m.ltb) + parseFloat(tickSize * 3);
            }
      
      
            
                  let novoStopcdl = null;
                  if (sideOrd == 'BUY') {
                    novoStop = parseFloat(candles5m.slice(-2)[0].low) - parseFloat(tickSize * 3);
                  } else if (sideOrd == 'SELL') {
                    novoStop = parseFloat(candles5m.slice(-2)[0].high) + parseFloat(tickSize * 3);
                  }
            
            
            
                  let pnlRoiAtual = await calcPnlFutBinance(posicaoAberta.entryPrice, preco_atual, Math.abs(posicaoAberta.positionAmt), sideOrd);
                  parentPort.postMessage(`🔎 PnL/Roi atual: ${JSON.stringify(pnlRoiAtual)}`);
            
            
            
                  //let novoStop50 = await precoAlvoPorPercent(sideOrd, -50, parseFloat(posicaoAberta.entryPrice), symbol);
            
                  let novoStopMm = null;
                  if (sideOrd == 'BUY') {
                    //novoStopMm = parseFloat(menorMedia3m) - parseFloat(tickSize * 10);
            
                    if (parseFloat(novoStop) >= parseFloat(novoStop50)) {
                      novoStop = parseFloat(novoStop);
                    } else {
                      novoStop = parseFloat(novoStop50);
                    }
            
                    if (parseFloat(pnlRoiAtual.roi) >= parseFloat(30)) {
                      let novoStop30 = await precoAlvoPorPercent(sideOrd, -20, parseFloat(posicaoAberta.entryPrice), symbol);
                      if (parseFloat(novoStop30) >= parseFloat(novoStop)) {
                        if (plus == 0) {
                          let returnPlus = await abrirPosicao(sideOrd, quantity / 3);
                          if (returnPlus !== null && returnPlus !== undefined) {
                            plus = 1;
                            parentPort.postMessage(`----> abrindo +1.`);
                          }
                        }
                        novoStop = parseFloat(novoStop30);
                      }
                    }
            
                    if (parseFloat(pnlRoiAtual.roi) >= parseFloat(50)) {
                      let novoStop10 = await precoAlvoPorPercent(sideOrd, -10, parseFloat(posicaoAberta.entryPrice), symbol);
                      if (parseFloat(novoStop10) >= parseFloat(novoStop)) {
                        if (plus == 1) {
                          let returnPlus = await abrirPosicao(sideOrd, quantity / 3);
                          if (returnPlus !== null && returnPlus !== undefined) {
                            plus = 2;
                            parentPort.postMessage(`----> abrindo +2.`);
                          }
                        }
            
                        novoStop = parseFloat(novoStop10);
                      }
                    }
            
            
                    if (parseFloat(pnlRoiAtual.roi) >= parseFloat(100)) {
                      let novoStop030 = await precoAlvoPorPercent(sideOrd, 30, parseFloat(posicaoAberta.entryPrice), symbol);
                      if (parseFloat(novoStop030) >= parseFloat(novoStop)) {
            
                        novoStop = parseFloat(novoStop030);
                      }
                    }
            
                    if (parseFloat(pnlRoiAtual.roi) >= parseFloat(150)) {
                      let novoStop050 = await precoAlvoPorPercent(sideOrd, 50, parseFloat(posicaoAberta.entryPrice), symbol);
                      if (parseFloat(novoStop050) >= parseFloat(novoStop)) {
            
                        novoStop = parseFloat(novoStop050);
                      }
                    }
            
                    if (parseFloat(pnlRoiAtual.roi) >= parseFloat(200)) {
                      let novoStop100 = await precoAlvoPorPercent(sideOrd, 100, parseFloat(posicaoAberta.entryPrice), symbol);
                      if (parseFloat(novoStop100) >= parseFloat(novoStop)) {
            
                        novoStop = parseFloat(novoStop100);
                      }
                    }
            
            
                    if (parseFloat(pnlRoiAtual.roi) >= parseFloat(250)) {
                      let novoStop150 = await precoAlvoPorPercent(sideOrd, 150, parseFloat(posicaoAberta.entryPrice), symbol);
                      if (parseFloat(novoStop150) >= parseFloat(novoStop)) {
            
                        novoStop = parseFloat(novoStop150);
                      }
                    }
            
                    if (parseFloat(pnlRoiAtual.roi) >= parseFloat(300)) {
                      let novoStop200 = await precoAlvoPorPercent(sideOrd, 200, parseFloat(posicaoAberta.entryPrice), symbol);
                      if (parseFloat(novoStop200) >= parseFloat(novoStop)) {
            
                        novoStop = parseFloat(novoStop200);
                      }
                    }
            
                    if (parseFloat(pnlRoiAtual.roi) >= parseFloat(350)) {
                      let novoStop250 = await precoAlvoPorPercent(sideOrd, 250, parseFloat(posicaoAberta.entryPrice), symbol);
                      if (parseFloat(novoStop250) >= parseFloat(novoStop)) {
            
                        novoStop = parseFloat(novoStop250);
                      }
                    }
            
                    if (parseFloat(pnlRoiAtual.roi) >= parseFloat(400)) {
                      let novoStop250 = await precoAlvoPorPercent(sideOrd, 300, parseFloat(posicaoAberta.entryPrice), symbol);
                      if (parseFloat(novoStop250) >= parseFloat(novoStop)) {
            
                        novoStop = parseFloat(novoStop250);
                      }
                    }
            
            
                  } else if (sideOrd == 'SELL') {
                    //novoStopMm = parseFloat(maiorMedia3m) + parseFloat(tickSize * 10);
            
                    if (parseFloat(novoStop) <= parseFloat(novoStop50)) {
                      novoStop = parseFloat(novoStop);
                    } else {
                      novoStop = parseFloat(novoStop50);
                    }
            
                    if (parseFloat(pnlRoiAtual.roi) >= parseFloat(30)) {
                      let novoStop30 = await precoAlvoPorPercent(sideOrd, -20, parseFloat(posicaoAberta.entryPrice), symbol);
                      if (parseFloat(novoStop30) <= parseFloat(novoStop)) {
                        if (plus == 0) {
                          let returnPlus = await abrirPosicao(sideOrd, quantity / 3);
                          if (returnPlus !== null && returnPlus !== undefined) {
                            plus = 1;
                            parentPort.postMessage(`----> abrindo +1.`);
                          }
                        }
            
                        novoStop = parseFloat(novoStop30);
                      }
                    }
            
                    if (parseFloat(pnlRoiAtual.roi) >= parseFloat(50)) {
                      let novoStop10 = await precoAlvoPorPercent(sideOrd, -10, parseFloat(posicaoAberta.entryPrice), symbol);
                      if (parseFloat(novoStop10) <= parseFloat(novoStop)) {
                        if (plus == 1) {
                          let returnPlus = await abrirPosicao(sideOrd, quantity / 3);
                          if (returnPlus !== null && returnPlus !== undefined) {
                            plus = 2;
                            parentPort.postMessage(`----> abrindo +2.`);
                          }
                        }
            
                        novoStop = parseFloat(novoStop10);
                      }
                    }
            
            
                    if (parseFloat(pnlRoiAtual.roi) >= parseFloat(100)) {
                      let novoStop030 = await precoAlvoPorPercent(sideOrd, 30, parseFloat(posicaoAberta.entryPrice), symbol);
                      if (parseFloat(novoStop030) <= parseFloat(novoStop)) {
            
                        novoStop = parseFloat(novoStop030);
                      }
                    }
            
                    if (parseFloat(pnlRoiAtual.roi) >= parseFloat(150)) {
                      let novoStop050 = await precoAlvoPorPercent(sideOrd, 50, parseFloat(posicaoAberta.entryPrice), symbol);
                      if (parseFloat(novoStop050) <= parseFloat(novoStop)) {
            
                        novoStop = parseFloat(novoStop050);
                      }
                    }
            
                    if (parseFloat(pnlRoiAtual.roi) >= parseFloat(200)) {
                      let novoStop100 = await precoAlvoPorPercent(sideOrd, 100, parseFloat(posicaoAberta.entryPrice), symbol);
                      if (parseFloat(novoStop100) <= parseFloat(novoStop)) {
            
                        novoStop = parseFloat(novoStop100);
                      }
                    }
            
            
                    if (parseFloat(pnlRoiAtual.roi) >= parseFloat(250)) {
                      let novoStop150 = await precoAlvoPorPercent(sideOrd, 150, parseFloat(posicaoAberta.entryPrice), symbol);
                      if (parseFloat(novoStop150) <= parseFloat(novoStop)) {
            
                        novoStop = parseFloat(novoStop150);
                      }
                    }
            
                    if (parseFloat(pnlRoiAtual.roi) >= parseFloat(300)) {
                      let novoStop150 = await precoAlvoPorPercent(sideOrd, 200, parseFloat(posicaoAberta.entryPrice), symbol);
                      if (parseFloat(novoStop150) <= parseFloat(novoStop)) {
            
                        novoStop = parseFloat(novoStop150);
                      }
                    }
            
                    if (parseFloat(pnlRoiAtual.roi) >= parseFloat(350)) {
                      let novoStop250 = await precoAlvoPorPercent(sideOrd, 250, parseFloat(posicaoAberta.entryPrice), symbol);
                      if (parseFloat(novoStop250) <= parseFloat(novoStop)) {
            
                        novoStop = parseFloat(novoStop250);
                      }
                    }
            
                    if (parseFloat(pnlRoiAtual.roi) >= parseFloat(400)) {
                      let novoStop250 = await precoAlvoPorPercent(sideOrd, 300, parseFloat(posicaoAberta.entryPrice), symbol);
                      if (parseFloat(novoStop250) <= parseFloat(novoStop)) {
            
                        novoStop = parseFloat(novoStop250);
                      }
                    }
            
            
                  }
            */



      //novoStop = novoStopMm;

      //novoStop = await precoAlvoPorPercent(sideOrd, parseFloat(process.env.STOPLOSS), parseFloat(posicaoAberta.entryPrice), symbol);

      if (sideOrd == 'BUY') {
        //novoStop = candles15m.slice(-2)[0].low - (parseFloat(tickSize) * 1);
        novoStop = await precoAlvoPorPercent(sideOrd, parseFloat(process.env.STOPLOSS), parseFloat(posicaoAberta.entryPrice), symbol);

      } else if (sideOrd == 'SELL') {
        //novoStop = candles15m.slice(-2)[0].high + (parseFloat(tickSize) * 1);
        novoStop = await precoAlvoPorPercent(sideOrd, parseFloat(process.env.STOPLOSS), parseFloat(posicaoAberta.entryPrice), symbol);
      }

      novoTake = await precoAlvoPorPercent(sideOrd, parseFloat(process.env.TAKEPROFIT), parseFloat(posicaoAberta.entryPrice), symbol);
      /*()
              if (sideOrd == 'BUY') {
                novoStop = candles15m.slice(-2)[0].low - (parseFloat(tickSize) * 1);
      
              } else if (sideOrd == 'SELL') {
                novoStop = candles15m.slice(-2)[0].high + (parseFloat(tickSize) * 1);
      
              }
              */
      if (stopAtivo !== undefined && stopAtivo !== null) {
        if (stopAtivo.price == null) {
          stopAtivo = await criarStopLoss(novoStop);

        }

      }

      if (stopAtivo === null || stopAtivo === undefined) {

        //if (novoStop !== null && novoStop !== undefined) {

        //let novoStop = novoStoplt;
        //stopAtivo = await criarStopLoss(sideOrd, novoStop);

        stopAtivo = await criarStopLoss(novoStop);

        //}

      }

      else if (stopAtivo !== null && stopAtivo !== undefined) {
        if (parseFloat(parseFloat(stopAtivo.price).toFixed(precisions.pricePrecision)) !== parseFloat(parseFloat(novoStop).toFixed(precisions.pricePrecision))) {
          //await cancelarTodasOrdens();
          if ((sideOrd == 'BUY' && stopAtivo.price < novoStop) ||
            (sideOrd == 'SELL' && stopAtivo.price > novoStop)
          ) {


            console.log(`Stop alterado: ${stopAtivo.price} / ${novoStop}`);
            await atualizarStop(sideOrd, novoStop);
            //if (stopAtivo.price !== null) {
            //await abrirPosicao(sideOrd, (quantity / 4));
            //}
          }
        }
      }

      /*
            let novoTakeLt = null;
            if (sideOrd == 'BUY') {
              novoTakeLt = parseFloat(ltaltb15m.ltb) - parseFloat(tickSize * 3);
            } else if (sideOrd == 'SELL') {
              novoTakeLt = parseFloat(ltaltb15m.lta) + parseFloat(tickSize * 3);
            }
      */


      if (takeAtivo !== undefined && takeAtivo !== null) {
        if (takeAtivo.price == null) {
          takeAtivo = await criarTakeProfit(novoTake);

        }

      }
      if (takeAtivo === null || takeAtivo === undefined) {


        takeAtivo = await criarTakeProfit(novoTake);

      }
      else if (takeAtivo !== null && takeAtivo !== undefined) {
        if (parseFloat(takeAtivo.price).toFixed(precisions.pricePrecision) !== parseFloat(parseFloat(novoTake).toFixed(precisions.pricePrecision))) {
          //await cancelarTodasOrdens();

          console.log(`Take alterado: ${takeAtivo.price} / ${novoTake}`);
          await atualizarTake(novoTake);

        }
      }

      parentPort.postMessage(`🔎 stopAtivo: ${JSON.stringify(stopAtivo)}`);
      //parentPort.postMessage(`🔎 takeAtivo: ${JSON.stringify(takeAtivo)}`);
    }

    if (parseFloat(contPos) >= parseFloat(process.env.TRDSIMULT)) {
      activatePause(1);
      sleep(60000);
      parentPort.postMessage(`⚠️ Limite de posições simultâneas atingido: ${contPos}`);
      return;
    }


  }


  );

  ws.on('close', (code, reason) => {
    parentPort.postMessage(`[${symbol}] WebSocket fechado. Código: ${code}, Motivo: ${reason}`);
    setTimeout(iniciarWebSocketMarkPrice, 5000);
  });

  ws.on('error', (err) => {
    parentPort.postMessage(`[${symbol}] WebSocket erro: ${err.message}`);
    ws.terminate();
    setTimeout(iniciarWebSocketMarkPrice, 5000);
  });

}

async function gerenciarOrdemEStop(/*markPrice */) {

  if (monitoramentoAtivado == false) return;

  parentPort.postMessage(`✅ Worker - gerenciarOrdemEStop`);
  //parentPort.postMessage(`✅ markPrice: ${markPrice}`);

  const res = await apiAxiosSpot.get('/api/v3/time');
  const serverTime = res.data.serverTime;
  const localTime = Date.now();
  offset = serverTime - localTime;


  if (!medias3m) return;
  if (!medias15m) return;


  let side = null;

  //const quantity = 20;  
  /*
      if (markPrice > maiorMedia) {
        side = 'BUY';
        alvoAtual = maiorMedia;
        novoStop = menorMedia;
      } else if (markPrice < menorMedia) {
        side = 'SELL';
        alvoAtual = menorMedia;
        novoStop = maiorMedia;
      } else {
        return;
      }
  */
  /*
  if(sideOrd == 'BUY'){
    alvoAtual = maiorMedia;
        novoStop = menorMedia;
  }else if(sideOrd == 'SELL'){
    alvoAtual = menorMedia;
        novoStop = maiorMedia;
  }else{
    return;
  }
  */

  posicaoAberta = await verificarSeTemPosicao();
  parentPort.postMessage(`✅ gerenciarOrdemEStop / Posição: ${JSON.stringify(posicaoAberta, null, 2)} `);

  ordemAtiva = await verificarOrdemAberta();
  parentPort.postMessage(`gerenciarOrdemEStop / OrdemAtiva: ${JSON.stringify(ordemAtiva, null, 2)} `);

  stopAtivo = await verificarStopAtivo();
  parentPort.postMessage(`gerenciarOrdemEStop / StopAtivo: ${JSON.stringify(stopAtivo, null, 2)} `);

  if (ordemAtiva !== null && ordemAtiva !== undefined) {
    if (parseFloat(ordemAtiva.price) > parseFloat(alvoAtual + (tickSize * 4))
      || parseFloat(ordemAtiva.price) < parseFloat(alvoAtual - (tickSize * 4))
    ) {
      console.log(`Alvo alterado: ${ordemAtiva.price} / ${alvoAtual}`);
      await cancelarOrdem(ordemAtiva.orderId);
    }
  }
  parentPort.postMessage(`✅ gerenciarOrdemEStop / NovoStop: ${JSON.stringify(novoStop, null, 2)} `);
  if (stopAtivo !== null && stopAtivo !== undefined) {
    if (stopAtivo.price !== parseFloat(parseFloat(novoStop).toFixed(precisions.pricePrecision))) {

      //await cancelarTodasOrdens();
      //console.log(`Stop alterado: ${stopAtivo.price} // ${novoStop}`);
      //await atualizarStop(sideOrd, novoStop);  

    }
  }

  if (posicaoAberta !== null && posicaoAberta !== undefined) {
    if (stopAtivo === null || stopAtivo === undefined) {
      stopAtivo = await criarStopLoss(novoStop);

    } else if (stopAtivo !== null && stopAtivo !== undefined) {
      if (stopAtivo.price !== parseFloat(parseFloat(novoStop).toFixed(precisions.pricePrecision))) {
        //await cancelarTodasOrdens();
        console.log(`Stop alterado: ${stopAtivo.price} / ${novoStop}`);
        await atualizarStop(sideOrd, novoStop);

      }
    }

    if (takeAtivo === null || takeAtivo === undefined) {

      //let novoTake = await precoAlvoPorPercent(sideOrd, parseFloat(process.env.TAKEPROFIT), posicaoAberta.entryPrice, symbol)

      //takeAtivo = await criarTakeProfit(sideOrd, novoTake);

    }

    if (ordemAtiva !== null && ordemAtiva !== undefined && posicaoAberta.orderId !== ordemAtiva.orderId) {
      await cancelarOrdem(ordemAtiva.orderId);

    }

  }

  if ((ordemAtiva === null || ordemAtiva === undefined)
    && (posicaoAberta === null || posicaoAberta === undefined)
  ) {
    if (stopAtivo !== null && stopAtivo !== undefined) {
      //await cancelarTodasOrdens();
      await cancelarOrdem(stopAtivo.orderId);
    }
  }

  if (!ordemAtiva && posicaoAberta === undefined) {
    quantity = await getQntbyBalance();
    ordemAtiva = await criarOrdem(sideOrd, alvoAtual);
    if (ordemAtiva) {
      //stopAtivo = await criarStopLoss(sideOrd, novoStop);
    }

  }
}

async function monitorar30Minutos() {
  parentPort.postMessage(`✅ Worker - monitorar30Minutos`);

  const res = await apiAxiosSpot.get('/api/v3/time');
  const serverTime = res.data.serverTime;
  const localTime = Date.now();
  offset = serverTime - localTime;

  /*
  if(monitoramentoAtivado){
    monitoramentoAtivado = false;
  gatilhoAtivado = false;
  return;  }
  */
  monitoramentoAtivado = true;
  const inicio = Date.now();
  const intervalo = 5000;
  let virouPosicao = false;


  iniciarWebSocketMarkPrice();
  //await notificWin(preco_atual, symbol, 'monitAtv', sideM);
  quantity = await getQntbyBalance();
  while (true) {

    if (ordemAtiva && !virouPosicao) {
      const status = await verificarStatusOrdem(ordemAtiva.orderId);
      if (status === 'FILLED') {
        virouPosicao = true;
        parentPort.postMessage(`✅ ---> Posição aberta em ${ordemAtiva.side}`);
      }
    }


    var final = (inicio + 30 * 60 * 1000);
    var tempoRest = calcularTempoRestante(Date.now(), final);
    parentPort.postMessage(tempoRest);

    if (!posicaoAberta && (Date.now() - inicio > 30 * 60 * 1000)) {
      parentPort.postMessage(`⏰ 30 minutos acabaram.`);

      if (ordemAtiva) await cancelarOrdem(ordemAtiva.orderId);
      if (stopAtivo) await cancelarOrdem(stopAtivo.orderId);
      //process.exit(301);
      monitoramentoAtivado = false;
      gatilhoAtivado = false;
      stopAtual = undefined;
      oldStop = undefined;
      novoStop = null;
      return;
    }

    //if(Date.now() - inicio < 30 * 60 * 1000){
    posicaoAberta = await verificarSeTemPosicao();
    if (posicaoAberta) {

      if (stopAtivo === undefined || stopAtivo === null) {
        quantity = await getQntbyBalance();

        percStpPrice = await precoAlvoPorPercent(sideOrd, parseFloat(process.env.STOPLOSS), parseFloat(posicaoAberta.entryPrice), symbol);

        if (percStpPrice !== null && percStpPrice !== undefined) {
          if ((sideOrd == 'BUY' && menorMedia5m < maiorMedia15m) ||
            (sideOrd == 'SELL' && maiorMedia5m > menorMedia15m)) {

            novoStop = percStpPrice;

          }
        }

        if (sideOrd == 'BUY' &&
          menorMedia5m > maiorMedia15m
        ) {

          //novoStop = anterior2.low-(parseFloat(tickSize)*3);
          novoStop = menorMedia5m;
          //novoStop = menorMedia15m-(parseFloat(tickSize)*3);
          //novoStop = maiorMedia-(parseFloat(tickSize)*3);
          //novoStop = maiorMedia;
          //novoStop = menorMedia;
        } else if (sideOrd == 'SELL' &&
          maiorMedia5m < menorMedia15m
        ) {

          //novoStop = anterior2.high+(parseFloat(tickSize)*3);
          novoStop = maiorMedia5m;
          //novoStop = maiorMedia15m+(parseFloat(tickSize)*3);
          //novoStop = menorMedia+(parseFloat(tickSize)*3);
          //novoStop = menorMedia;
          //novoStop = maiorMedia;
        }

      }

      liquidationPrice = await getLiquidationPrice(symbol);
      if (sideOrd == 'BUY') {
        if (parseFloat(novoStop) <= (parseFloat(liquidationPrice) + (parseFloat(tickSize) * 5))) {
          novoStop = parseFloat(liquidationPrice) + (parseFloat(tickSize) * 5)
        }
      } else if (sideOrd == 'SELL') {
        if (parseFloat(novoStop) >= (parseFloat(liquidationPrice) - (parseFloat(tickSize) * 5))) {
          novoStop = parseFloat(liquidationPrice) - (parseFloat(tickSize) * 5)
        }
      }



      let pnlRoiAtual = await calcPnlFutBinance(posicaoAberta.entryPrice, preco_atual, Math.abs(posicaoAberta.positionAmt), sideOrd);

      unRealizedProfitArred = floorDecimal(posicaoAberta.unRealizedProfit, 2);
      isolatedWalletArred = floorDecimal(posicaoAberta.isolatedWallet, 2);

      //roi = ( unRealizedProfitArred / isolatedWalletArred) * 100;


      //await notificWin(posicaoAberta.entryPrice, symbol, 'open', sideM, pnlRoiAtual.roi);

      if (parseFloat(pnlRoiAtual.roi) > parseFloat(50)) {
        //await fecharPosicao(sideOrd, Math.abs(posicaoAberta.positionAmt*2))
      }
    } else {
      if (ordemAtiva) {
        //await notificWin(preco_atual, symbol, 'monitAtv', sideM);
      }
    }
    //}

    if (margemInsuf) {
      parentPort.postMessage(`----> Margem Insuficiente.`);
      //process.exit(302);
      if (!posicaoAberta) {
        monitoramentoAtivado = false;
        gatilhoAtivado = false;
        return;
      }
    }


    //if (virouPosicao) {  
    posicaoAberta = await verificarSeTemPosicao();
    //parentPort.postMessage(`✅ Posição:`,posicaoAberta);  

    if ((posicaoAberta == undefined && ultimaPosicao !== undefined) //||
      //  (sideOrd == 'BUY' && preco_atual < menorMedia15m) ||
      //  (sideOrd == 'SELL' && preco_atual >  maiorMedia15m)
    ) {
      parentPort.postMessage(`✅ Posição encerrada. Parando STOP.`);
      //process.exit(302);
      monitoramentoAtivado = false;
      gatilhoAtivado = false;
      sideOrd = undefined;
      ultimaPosicao = undefined;
      stopAtual = undefined;
      oldStop = undefined;
      novoStop = null;
      await cancelarTodasOrdens();
      return;
    }

    ultimaPosicao = posicaoAberta;

    //}  
    await gerenciarOrdemEStop();
    await new Promise(r => setTimeout(r, intervalo));

  }
}

async function monitorarGatilho() {

  parentPort.postMessage(`Conectando WebSocket gatilho para ${symbol.toUpperCase()}...`);

  // let percStpPrice = undefined;

  ws = new WebSocket(`wss://fstream.binance.com/ws/${symbol.toLowerCase()}@kline_1m`);

  ws.on('open', () => {
    parentPort.postMessage(`[${symbol}] WebSocket gatilho conectado.`);
  });

  //if (!medias3m) await carregarCandlesHistoricos();
  const res = await apiAxiosSpot.get('/api/v3/time');
  const serverTime = res.data.serverTime;
  const localTime = Date.now();
  offset = serverTime - localTime;

  maxleverage = await obterAlavancagem(symbol);
  tickSize = await getTickSize(symbol);

  maiorMedia3m = Math.max(...medias3m);
  menorMedia3m = Math.min(...medias3m);
  maiorMedia5m = Math.max(...medias5m);
  menorMedia5m = Math.min(...medias5m);
  maiorMedia15m = Math.max(...medias15m);
  menorMedia15m = Math.min(...medias15m);
  maiorMedia1h = Math.max(...medias1h);
  menorMedia1h = Math.min(...medias1h);

  maiorMedia = Math.max(maiorMedia3m, maiorMedia5m);
  menorMedia = Math.min(menorMedia3m, menorMedia5m);

  //var anterior2 = undefined;
  //var anterior = undefined;
  var anterior2 = candles3m[candles3m.length - 2];
  var anterior = candles3m[candles3m.length - 1];

  //let side = null;
  //let alvoAtual = null;
  //let novoStop = null;

  ordemAtiva = await verificarOrdemAberta();
  parentPort.postMessage(`gerenciarOrdemEStop / OrdemAtiva: ${JSON.stringify(ordemAtiva, null, 2)} `);

  posicaoAberta = await verificarSeTemPosicao();
  parentPort.postMessage(`✅ monitorarGatilho / Posição: ${JSON.stringify(posicaoAberta, null, 2)} `);

  if (posicaoAberta !== null && posicaoAberta !== undefined) {

    //await notificWin(posicaoAberta.entryPrice, symbol, 'open', sideM);
    //gatilhoAtivado = true;
    if (posicaoAberta.positionAmt > 0) {
      sideM = 'C';
      sideOrd = 'BUY';
    } else if (posicaoAberta.positionAmt < 0) {
      sideM = 'V';
      sideOrd = 'SELL';
    }

    percStpPrice = await precoAlvoPorPercent(sideOrd, parseFloat(process.env.STOPLOSS), parseFloat(posicaoAberta.entryPrice), symbol);

    if (sideOrd == 'BUY' &&
      menorMedia5m > maiorMedia15m
    ) {

      //novoStop = anterior2.low-(parseFloat(tickSize)*3);
      novoStop = menorMedia5m;
      //novoStop = menorMedia15m-(parseFloat(tickSize)*3);
      //novoStop = maiorMedia-(parseFloat(tickSize)*3);
      //novoStop = maiorMedia;
      //novoStop = menorMedia;
    } else if (sideOrd == 'SELL' &&
      maiorMedia5m < menorMedia15m
    ) {

      //novoStop = anterior2.high+(parseFloat(tickSize)*3);
      novoStop = maiorMedia5m;
      //novoStop = maiorMedia15m+(parseFloat(tickSize)*3);
      //novoStop = menorMedia+(parseFloat(tickSize)*3);
      //novoStop = menorMedia;
      //novoStop = maiorMedia;
    }

    if (percStpPrice !== null && percStpPrice !== undefined) {
      if ((sideOrd == 'BUY' && menorMedia5m < maiorMedia15m) ||
        (sideOrd == 'SELL' && maiorMedia5m > menorMedia15m)) {

        novoStop = percStpPrice;

      }
    }

    liquidationPrice = await getLiquidationPrice(symbol);

    if (sideOrd == 'BUY') {
      if (parseFloat(novoStop) <= (parseFloat(liquidationPrice) + (parseFloat(tickSize) * 5))) {
        novoStop = parseFloat(liquidationPrice) + (parseFloat(tickSize) * 5);
      }
    } else if (sideOrd == 'SELL') {
      if (parseFloat(novoStop) >= (parseFloat(liquidationPrice) - (parseFloat(tickSize) * 5))) {
        novoStop = parseFloat(liquidationPrice) - (parseFloat(tickSize) * 5);
      }
    }
    /*
  }
  
          if((ordemAtiva !== null && ordemAtiva !== undefined ) ||
          (posicaoAberta !== null && posicaoAberta !== undefined )
){ */
    if (monitoramentoAtivado == false) {

      /*     
 if(posicaoAberta.positionAmt > 0){
   sideM = 'C';
   sideOrd = 'BUY';
 } else if(posicaoAberta.positionAmt < 0){
   sideM = 'V';
   sideOrd = 'SELL';
 }
 */
      gatilhoAtivado = true;
      monitorar30Minutos();
    }
  }


  ws.on('message', (data) => {
    const payload = JSON.parse(data);
    const k = payload.k;

    if (k.x) {
      candle1m = {
        openTime: k.t,
        open: parseFloat(k.o),
        high: parseFloat(k.h),
        low: parseFloat(k.l),
        close: parseFloat(k.c),
        closeTime: k.T,
        isFinal: k.x
      };

      preco_atual = candle1m.close;

      maiorMedia5m = Math.max(...medias5m);
      menorMedia5m = Math.min(...medias5m);
      maiorMedia15m = Math.max(...medias15m);
      menorMedia15m = Math.min(...medias15m);

      maiorMedia = Math.max(maiorMedia5m, maiorMedia15m);
      menorMedia = Math.min(menorMedia5m, menorMedia15m);

      console.log("");
      parentPort.postMessage(`<___-----[${symbol}]-----___>`);
      parentPort.postMessage(`anterior2: ${JSON.stringify(anterior2, null, 2)}`);
      parentPort.postMessage(`anterior: ${JSON.stringify(anterior, null, 2)}`);
      //parentPort.postMessage(`candle1m: ${JSON.stringify(candle1m, null, 2)}`);
      parentPort.postMessage(`medias5m: ${medias5m}`);
      parentPort.postMessage(`medias15m: ${medias15m}`);
      parentPort.postMessage(`maiorMedia: ${maiorMedia}`);
      parentPort.postMessage(`menorMedia: ${menorMedia}`);
      parentPort.postMessage(`sideOrd: ${sideOrd}`);
      parentPort.postMessage(`Atualizado: ${formatTime(Date.now())}`);

      //if (candle1m.isFinal){
      anterior2 = candles3m[candles3m.length - 2];
      anterior = candles3m[candles3m.length - 1];
      //}
      if (anterior && anterior2) { //&& monitoramentoAtivado === false) {


        if ((
          //(menorMedia5m > maiorMedia15m ||
          //maiorMedia5m > menorMedia15m) &&
          menorMedia5m < maiorMedia15m &&
          anterior.low <= maiorMedia15m &&
          anterior.low >= menorMedia15m &&
          //anterior.open >= maiorMedia15m &&
          anterior.close >= maiorMedia15m &&
          anterior.close >= menorMedia5m //&&
          //anterior2.open >= maiorMedia &&
          //anterior2.close >= maiorMedia &&
          //anterior.open >= anterior2.low &&
          //anterior.close >= anterior2.low 
          //anterior.open >= anterior.low  &&
          //anterior.close >= anterior.low 
          //anterior.low >= anterior2.low
        ) || (
            menorMedia5m > maiorMedia15m &&
            anterior.low <= maiorMedia5m &&
            anterior.low >= menorMedia5m &&
            anterior.close >= maiorMedia5m //&&
            //anterior2.low > maiorMedia5m
          )

        ) {
          parentPort.postMessage({
            trigger: "buy",
            candle: anterior
          });
          gatilhoAtivado = true;
          if (monitoramentoAtivado == false) {
            sideM = 'C';
            sideOrd = 'BUY';

            alvoAtual = anterior.high + (parseFloat(tickSize) * 3);
            //(async () => {
            //novoStop = await precoAlvoPorPercent(sideOrd, parseFloat(process.env.STOPLOSS), parseFloat(alvoAtual), symbol) ;
            // })();
            //novoStop = anterior2.low-(parseFloat(tickSize)*3);
            //alvoAtual = maiorMedia;
            //novoStop = menorMedia5m;
            //novoStop = menorMedia15m-(parseFloat(tickSize)*3);
            //novoStop = maiorMedia-(parseFloat(tickSize)*3);
            //novoStop = menorMedia;
            alvoAnterior = alvoAtual;

          }

        } else if ((
          //(menorMedia5m < maiorMedia15m ||
          //maiorMedia5m < menorMedia15m) &&
          maiorMedia5m > menorMedia15m &&
          anterior.high <= maiorMedia15m &&
          anterior.high >= menorMedia15m &&
          //anterior.open <= menorMedia15m &&
          anterior.close <= menorMedia15m &&
          anterior.close <= maiorMedia5m //&&
          //anterior2.open <= menorMedia &&
          //anterior2.close <= menorMedia &&
          //anterior.open <= anterior2.high &&
          //anterior.close <= anterior2.high
          //anterior.open <= anterior2.high &&
          //anterior.close <= anterior2.high
          //anterior.high <= anterior2.high
        ) || (
            maiorMedia5m < menorMedia15m &&
            anterior.high <= maiorMedia5m &&
            anterior.high >= menorMedia5m &&
            anterior.close <= menorMedia5m //&& 
            //anterior2.high < menorMedia5m

          )
        ) {
          parentPort.postMessage({
            trigger: "sell",
            candle: anterior
          });
          gatilhoAtivado = true;
          if (monitoramentoAtivado == false) {
            sideM = 'V';
            sideOrd = 'SELL';
            alvoAtual = anterior.low - (parseFloat(tickSize) * 3);
            //(async () => {
            //novoStop = await precoAlvoPorPercent(sideOrd, parseFloat(process.env.STOPLOSS), parseFloat(alvoAtual), symbol) ;
            //})();
            //novoStop = anterior2.high+(parseFloat(tickSize)*3);
            //alvoAtual = menorMedia;
            //novoStop = maiorMedia5m;
            //novoStop = maiorMedia15m+(parseFloat(tickSize)*3);
            //novoStop = menorMedia+(parseFloat(tickSize)*3);
            //novoStop = maiorMedia;
            alvoAnterior = alvoAtual;

          }
        } else {
          //gatilhoAtivado = false;
        }
      }



      (async () => {
        posicaoAberta = await verificarSeTemPosicao();
        parentPort.postMessage(`✅ monitorarGatilho / Posição: ${JSON.stringify(posicaoAberta, null, 2)} `);

        if ((posicaoAberta == undefined || posicaoAberta == null || !posicaoAberta) &&
          monitoramentoAtivado === true) {
          if (sideOrd == 'BUY' && anterior.close >= maiorMedia) {

            alvoAtual = anterior.high + (parseFloat(tickSize) * 3);
            //alvoAtual = anterior.high;
            //alvoAtual = maiorMedia;
          } else if (sideOrd == 'SELL' && anterior.close <= menorMedia) {

            alvoAtual = anterior.low - (parseFloat(tickSize) * 3);
            //alvoAtual = anterior.low;
            //alvoAtual = menorMedia;
          }
        }

        if (alvoAnterior == undefined) {
          alvoAnterior = alvoAtual;
        }

        if (sideOrd == 'BUY') {
          if (alvoAtual > alvoAnterior) {
            alvoAtual = alvoAnterior;
          } else {
            alvoAnterior = alvoAtual;
          }
        } else if (sideOrd == 'SELL') {
          if (alvoAtual < alvoAnterior) {
            alvoAtual = alvoAnterior;
          } else {
            alvoAnterior = alvoAtual;
          }
        }
        // novoStop = await precoAlvoPorPercent(sideOrd, parseFloat(process.env.STOPLOSS), parseFloat(alvoAtual), symbol) ;

        if (posicaoAberta !== null && posicaoAberta !== undefined) {

          //await notificWin(posicaoAberta.entryPrice, symbol, 'open', sideM);
          gatilhoAtivado = true;
          if (posicaoAberta.positionAmt > 0) {
            sideM = 'C';
            sideOrd = 'BUY';
          } else if (posicaoAberta.positionAmt < 0) {
            sideM = 'V';
            sideOrd = 'SELL';
          }

          percStpPrice = await precoAlvoPorPercent(sideOrd, parseFloat(process.env.STOPLOSS), parseFloat(posicaoAberta.entryPrice), symbol);

          if (sideOrd == 'BUY' &&
            menorMedia5m > maiorMedia15m
          ) {

            if (

              menorMedia5m > maiorMedia15m &&
              anterior.low <= maiorMedia5m &&
              anterior.low >= menorMedia5m &&
              anterior.close >= maiorMedia5m &&
              anterior2.low > maiorMedia5m

            ) {

              quantity = await getQntbyBalance();
              await abrirPosicao(sideOrd, (quantity / 5));

            }


            //novoStop = anterior2.low-(parseFloat(tickSize)*3);
            novoStop = menorMedia5m;
            //novoStop = menorMedia15m-(parseFloat(tickSize)*3);
            //novoStop = maiorMedia-(parseFloat(tickSize)*3);
            //novoStop = maiorMedia;
            //novoStop = menorMedia;
          } else if (sideOrd == 'SELL' &&
            maiorMedia5m < menorMedia15m
          ) {

            if (

              maiorMedia5m < menorMedia15m &&
              anterior.high <= maiorMedia5m &&
              anterior.high >= menorMedia5m &&
              anterior.close <= menorMedia5m &&
              anterior2.high < menorMedia5m

            ) {

              quantity = await getQntbyBalance();
              await abrirPosicao(sideOrd, (quantity / 5));

            }

            //novoStop = anterior2.high+(parseFloat(tickSize)*3);
            novoStop = maiorMedia5m;
            //novoStop = maiorMedia15m+(parseFloat(tickSize)*3);
            //novoStop = menorMedia+(parseFloat(tickSize)*3);
            //novoStop = menorMedia;
            //novoStop = maiorMedia;
          }

          if (percStpPrice !== null && percStpPrice !== undefined) {
            if ((sideOrd == 'BUY' && menorMedia5m < maiorMedia15m) ||
              (sideOrd == 'SELL' && maiorMedia5m > menorMedia15m)) {

              novoStop = percStpPrice;

            }
          }


          liquidationPrice = await getLiquidationPrice(symbol);

          if (sideOrd == 'BUY') {
            if (parseFloat(novoStop) <= (parseFloat(liquidationPrice) + (parseFloat(tickSize) * 5))) {
              novoStop = parseFloat(liquidationPrice) + (parseFloat(tickSize) * 5)
            }
          } else if (sideOrd == 'SELL') {
            if (parseFloat(novoStop) >= (parseFloat(liquidationPrice) - (parseFloat(tickSize) * 5))) {
              novoStop = parseFloat(liquidationPrice) - (parseFloat(tickSize) * 5)
            }
          }
        }


      })();



      if (gatilhoAtivado == true && monitoramentoAtivado == false) {
        (async () => {

          if (ordemAtiva === undefined && posicaoAberta === undefined) {
            ordemAtiva = await criarOrdem(sideOrd, alvoAtual);
            if (ordemAtiva) {
              //stopAtivo = await criarStopLoss(sideOrd, novoStop);
            }
          }

        })();

        monitorar30Minutos();
      }

      //anterior2 = anterior;

    }
  });

  ws.on('close', (code, reason) => {
    parentPort.postMessage(`[${symbol}] WebSocket1m fechado. Código: ${code}, Motivo: ${reason}`);
    setTimeout(monitorarGatilho, 5000);
  });

  ws.on('error', (err) => {
    parentPort.postMessage(`[${symbol}] WebSocket1m erro: ${err.message}`);
    ws.terminate();
    setTimeout(monitorarGatilho, 5000);
  });

}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const controlePosicao = {};

async function checarReducao(symbol) {

  const fs = require('fs');
  const axios = require('axios');
  require('dotenv').config();

  const ENV_FILE = '.env';

  // Carrega o status do .env como objeto
  function carregarStatus() {
    const status = {};
    for (const [chave, valor] of Object.entries(process.env)) {
      if (chave.endsWith('_STATUS')) {
        const symbol = chave.replace('_STATUS', '');
        status[symbol] = valor;
      }
    }
    return status;
  }

  // Atualiza/reescreve o .env com novo status
  function salvarStatus(status) {
    const linhas = Object.entries(status).map(([symbol, etapa]) => `${symbol}_STATUS=${etapa}`);
    fs.writeFileSync(ENV_FILE, linhas.join('\n'), 'utf-8');
  }

  const statusMargem = carregarStatus();

  async function checarReducao(symbol) {

    let timestamp = Date.now() + offset;

    const params = {
      symbol,
      timestamp: timestamp,
      recvWindow: 15000
    };
    params.signature = gerarAssinatura(params);

    try {
      const res = await axios.get('https://fapi.binance.com/fapi/v2/positionRisk', {
        params,
        headers: { 'X-MBX-APIKEY': API_KEY },
      });

      const pos = res.data.find(p => p.symbol === symbol);
      const posAtual = Math.abs(parseFloat(pos.positionAmt));

      if (posAtual === 0) {
        console.log(`[${symbol}] Sem posição aberta.`);
        statusMargem[symbol] = 'NENHUMA';
        salvarStatus(statusMargem);
        return;
      }

      const statusAtual = statusMargem[symbol] || 'NENHUMA';

      if (statusAtual === 'NENHUMA' && posAtual <= 0.75) {
        console.log(`[${symbol}] Redução 25% detectada.`);
        statusMargem[symbol] = '25%';
        salvarStatus(statusMargem);
        // ação 1
      } else if (statusAtual === '25%' && posAtual <= 0.5) {
        console.log(`[${symbol}] Redução 50% detectada.`);
        statusMargem[symbol] = '50%';
        salvarStatus(statusMargem);
        // ação 2
      } else if (statusAtual === '50%' && posAtual <= 0.25) {
        console.log(`[${symbol}] Redução 75% detectada.`);
        statusMargem[symbol] = '75%';
        salvarStatus(statusMargem);
        // ação final
      } else {
        console.log(`[${symbol}] Sem alteração. Tamanho atual: ${posAtual}`);
      }

    } catch (err) {
      console.error('Erro ao consultar posição:', err.message);
      if (err.response?.data) console.error('Detalhes:', err.response.data);
    }
  }
}

async function getOpenPositions() {
  const baseURL = 'https://fapi.binance.com';
  const endpoint = '/fapi/v2/positionRisk';
  const timestamp = Date.now();
  const query = `timestamp=${timestamp}`;

  const signature = crypto
    .createHmac('sha256', API_SECRET)
    .update(query)
    .digest('hex');

  try {
    const res = await axios.get(`${baseURL}${endpoint}?${query}&signature=${signature}`, {
      headers: {
        'X-MBX-APIKEY': API_KEY,
      },
    });

    // Filtra apenas posições abertas
    const openPositions = res.data.filter(pos => parseFloat(pos.positionAmt) !== 0);

    // Faz a contagem
    const count = openPositions.length;

    console.log(`🔎 Total de posições abertas: ${count}`);
    return count;
  } catch (err) {
    console.error('Erro ao buscar posições:', err.response?.data || err.message);
  }
}

const historyPath = path.join(__dirname, "cache/tradeHistory.json");

function loadHistory() {
  try {
    return JSON.parse(fs.readFileSync(historyPath, "utf8"));
  } catch (err) {
    return { last5: [] };
  }
}

function saveHistory(history) {
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
}

function canTrade(symbol) {
  const history = loadHistory();

  // Verifica se o símbolo apareceu nos últimos 5 trades
  if (history.last5.includes(symbol)) {
    return false;
  }

  return true;
}

function addTrade(symbol) {
  const history = loadHistory();

  history.last5.unshift(symbol); // adiciona no início

  // mantém apenas os 5 mais recentes
  history.last5 = history.last5.slice(0, 5);

  saveHistory(history);
}


async function iniciarWebSocketContinuo() {

  // if (monitoramentoAtivado == false) return;

  parentPort.postMessage(`✅ Worker iniciarWebSocketContinuo: ${workerData.symbol}`);

  //const ws = new WebSocket(`wss://fstream.binance.com/ws/${wsSymbol}@markPrice`);

  const ws = new WebSocket(`wss://fstream.binance.com/ws/${symbol.toLowerCase()}@kline_1m`);

  const res = await apiAxiosSpot.get('/api/v3/time');
  const serverTime = res.data.serverTime;
  const localTime = Date.now();
  offset = serverTime - localTime;

  maxleverage = await obterAlavancagem(symbol);
  tickSize = await getTickSize(symbol);

  let cacheJsonAux = await carregarCache(symbol);

  if (cacheJsonAux[0] !== undefined) {
    cacheJson = cacheJsonAux;
  }

  //const pnlManager = new PnlManager(API_KEY, API_SECRET, 10);

  /*
      let cacheRiskAux = await carregarCache('Risk');
  
      if(cacheRiskAux[symbol][0] !== undefined){
               cacheRisk = cacheRiskAux;
            }
            */
  /*
  
  const objeto = {
    BTCUSDT: { posicionando: true },
    ETHUSDT: null,
    XRPUSDT: { posicionando: false },
    DOGEUSDT: undefined,
    SOLUSDT: { posicionando: true }
  };
  
  const countTrue = Object.values(objeto).filter(o => o?.posicionando === true).length;
  
  console.log(countTrue); // Saída: 2
  
  */

  posicaoAberta = await verificarSeTemPosicao(1);
  if (posicaoAberta === null || posicaoAberta === undefined) {

    stopAtivo = await verificarStopAtivo();
    parentPort.postMessage(`iniciarWebSocketContinuo / StopAtivo: ${JSON.stringify(stopAtivo, null, 2)} `);

    if (stopAtivo !== null && stopAtivo !== undefined) {
      //ultimaPosicao = undefined;
      stopAtual = undefined;
      oldStop = undefined;
      novoStop = undefined;
      //await cancelarTodasOrdens();
    }

    takeAtivo = await verificarTakeAtivo();
    parentPort.postMessage(`iniciarWebSocketContinuo / takeAtivo: ${JSON.stringify(stopAtivo, null, 2)} `);

  }

  ws.on('open', () => {
    parentPort.postMessage(` iniciarWebSocketContinuo conectado.`);
  });

  ws.on('message', async (data) => {

    /*
      try {
        await pnlManager.monitor(); // Executa uma única vez, sem intervalos
      } catch (err) {
        console.error('Erro no monitoramento PnL:', err.message);
      }
    */

    const payload = JSON.parse(data);
    const k = payload.k;

    if (k.x) {
      candle1m = {
        openTime: k.t,
        open: parseFloat(k.o),
        high: parseFloat(k.h),
        low: parseFloat(k.l),
        close: parseFloat(k.c),
        closeTime: k.T,
        isFinal: k.x
      };


      //preco_atual = candle1m.close;
      //preco_anterior = candles1m.slice(-2)[0].close;
      // const json = JSON.parse(data);
      // const markPrice = parseFloat(json.p);
      // preco_atual = markPrice;

      maiorMedia1m = Math.max(...medias1m);
      menorMedia1m = Math.min(...medias1m);
      maiorMedia3m = Math.max(...medias3m);
      menorMedia3m = Math.min(...medias3m);

      maiorMReg1m = Math.max(parseFloat(ema1m100p), parseFloat(sma1m100p));
      menorMReg1m = Math.min(parseFloat(ema1m100p), parseFloat(sma1m100p));

      maiorMRegIn3m = Math.max(menorMedia3m, menorM3m20p);
      menorMRegIn3m = Math.min(maiorMedia3m, maiorM3m20p);
      //maiorMedia5m = Math.max(...medias5m);
      //menorMedia5m = Math.min(...medias5m);
      //maiorMedia15m = Math.max(...medias15m);
      //menorMedia15m = Math.min(...medias15m);
      //maiorMedia1h = Math.max(...medias1h);
      //menorMedia1h = Math.min(...medias1h);

      //maiorMedia = Math.max(maiorMedia1h, maiorMedia15m);
      //menorMedia = Math.min(menorMedia1h, menorMedia15m);

      //maiorMedia2 = Math.max(maiorMedia3m, maiorMedia5m);
      //menorMedia2 = Math.min(menorMedia3m, menorMedia5m);

      //let balance = await getBalance();

      zigZag1m = calcularZigZag(candles1m); // Defina o threshold adequado
      fibo1m = calcularRetracoesFibonacci(zigZag1m.pontosUnificados);
      ltaltb1m = calcularLinhasTendencia(candles1m, zigZag1m.topos, zigZag1m.fundos);

      zigZag5m = calcularZigZag(candles5m); // Defina o threshold adequado
      fibo5m = calcularRetracoesFibonacci(zigZag5m.pontosUnificados);
      ltaltb5m = calcularLinhasTendencia(candles5m, zigZag5m.topos, zigZag5m.fundos);

      /*
            zigZag15m = calcularZigZag(candles15m); // Defina o threshold adequado
            fibo15m = calcularRetracoesFibonacci(zigZag15m.pontosUnificados);
            ltaltb15m = calcularLinhasTendencia(candles15m, zigZag15m.topos, zigZag15m.fundos);
      
      
            
            zigZag3m = calcularZigZag(candles3m); // Defina o threshold adequado
            fibo3m = calcularRetracoesFibonacci(zigZag3m.pontosUnificados);
            ltaltb3m = calcularLinhasTendencia(candles3m, zigZag3m.topos, zigZag3m.fundos);
      
      
      
            zigZag30m = calcularZigZag(candles30m); // Defina o threshold adequado
            fibo30m = calcularRetracoesFibonacci(zigZag30m.pontosUnificados);
            ltaltb30m = calcularLinhasTendencia(candles30m, zigZag30m.topos, zigZag30m.fundos);
      
            let zigZag1h = calcularZigZag(candles1h); // Defina o threshold adequado
            let fibo1h = calcularRetracoesFibonacci(zigZag1h.pontosUnificados);
            let ltaltb1h = calcularLinhasTendencia(candles1h, zigZag1h.topos, zigZag1h.fundos);
      */
      /*
            //let zigZag4h = calcularZigZag(candles4h); // Defina o threshold adequado
            //let fibo4h = calcularRetracoesFibonacci(zigZag4h.pontosUnificados);
            //let ltaltb4h = calcularLinhasTendencia(candles4h, zigZag4h.topos, zigZag4h.fundos);
      */

      const stochRsi1m = StochasticRSI.calculate({
        values: candles1m.map(c => c.close),
        rsiPeriod: 14,
        stochasticPeriod: 14,
        kPeriod: 3,
        dPeriod: 3
      });


      stochRsi3m = StochasticRSI.calculate({
        values: candles3m.map(c => c.close),
        rsiPeriod: 14,
        stochasticPeriod: 14,
        kPeriod: 3,
        dPeriod: 3
      });

      stochRsi5m = StochasticRSI.calculate({
        values: candles5m.map(c => c.close),
        rsiPeriod: 14,
        stochasticPeriod: 14,
        kPeriod: 3,
        dPeriod: 3
      });


      stochRsi15m = StochasticRSI.calculate({
        values: candles15m.map(c => c.close),
        rsiPeriod: 14,
        stochasticPeriod: 14,
        kPeriod: 3,
        dPeriod: 3
      });


      stochRsi30m = StochasticRSI.calculate({
        values: candles30m.map(c => c.close),
        rsiPeriod: 14,
        stochasticPeriod: 14,
        kPeriod: 3,
        dPeriod: 3
      });

      stochRsi1h = StochasticRSI.calculate({
        values: candles1h.map(c => c.close),
        rsiPeriod: 14,
        stochasticPeriod: 14,
        kPeriod: 3,
        dPeriod: 3
      });
      /*
            stochRsi4h = StochasticRSI.calculate({
              values: candles4h.map(c => c.close),
              rsiPeriod: 14,
              stochasticPeriod: 14,
              kPeriod: 3,
              dPeriod: 3
            });
      */
      //let sRsiLast1m = stochRsi1m.slice(-1)[0];

      //let sRsiLast1m = stochRsi1m.slice(-1)[0];
      //let sRsiLast1m_2 = stochRsi1m.slice(-2)[0];
      //let sRsiLast3m = stochRsi3m.slice(-1)[0];
      //let sRsiLast3m_2 = stochRsi3m.slice(-2)[0];

      let sRsiLast1m = null;
      let sRsiLast1m_2 = null;

      if (stochRsi1m !== null) {
        sRsiLast1m = stochRsi1m.slice(-1)[0];
        sRsiLast1m_2 = stochRsi1m.slice(-2)[0];
      }

      let sRsiLast3m = null;
      let sRsiLast3m_2 = null;

      if (stochRsi3m !== null) {
        sRsiLast3m = stochRsi3m.slice(-1)[0];
        sRsiLast3m_2 = stochRsi3m.slice(-2)[0];
      }

      let sRsiLast5m = null;
      let sRsiLast5m_2 = null;

      if (stochRsi5m !== null) {
        sRsiLast5m = stochRsi5m.slice(-1)[0];
        sRsiLast5m_2 = stochRsi5m.slice(-2)[0];
      }

      let sRsiLast15m = null;
      let sRsiLast15m_2 = null;

      if (stochRsi15m !== null) {
        sRsiLast15m = stochRsi15m.slice(-1)[0];
        sRsiLast15m_2 = stochRsi15m.slice(-2)[0];
      }

      let sRsiLast30m = null;
      let sRsiLast30m_2 = null;

      if (stochRsi30m !== null) {
        sRsiLast30m = stochRsi30m.slice(-1)[0];
        sRsiLast30m_2 = stochRsi30m.slice(-2)[0];
      }


      let sRsiLast1h = null;
      let sRsiLast1h_2 = null;

      if (stochRsi1h !== null) {
        sRsiLast1h = stochRsi1h.slice(-1)[0];
        sRsiLast1h_2 = stochRsi1h.slice(-2)[0];
      }

      /*
          let sRsiLast15m = null;
          let sRsiLast15m_2 = null;
      
          if (stochRsi15m !== null) {
            sRsiLast15m = stochRsi15m.slice(-1)[0];
            sRsiLast15m_2 = stochRsi15m.slice(-2)[0];
          }
      *


      
      let sRsiLast4h = null;
      let sRsiLast4h_2 = null;

      if (stochRsi4h !== null) {
        sRsiLast4h = stochRsi4h.slice(-1)[0];
        sRsiLast4h_2 = stochRsi4h.slice(-2)[0];
      }
*/


      //parseFloat(candles15m.slice(-1)[0].open) < parseFloat(candles15m.slice(-1)[0].close) &&
      if (

        /*
        (
          (
            fibo1h.dir == 1 &&
            parseFloat(ltaltb3m.lta) <= parseFloat(fibo1h.retr05) &&
            parseFloat(ltaltb3m.lta) >= parseFloat(fibo1h.retr1)
          ) || (
            fibo1h.dir == -1 &&
            parseFloat(ltaltb3m.lta) <= parseFloat(fibo1h.retr05) &&
            parseFloat(ltaltb3m.lta) >= parseFloat(fibo1h.retr0)
          )
        )

        &&

        (
          //parseFloat(sRsiLast1m.k) <= parseFloat(20.0) &&
          //parseFloat(sRsiLast3m.k) <= parseFloat(20.0) &&
          /*
          (
            parseFloat(sRsiLast30m.k) >= parseFloat(sRsiLast30m_2.k) ||
            parseFloat(sRsiLast30m.k) >= parseFloat(sRsiLast30m.d)

          ) &&
            parseFloat(sRsiLast30m.k) <= parseFloat(80.0) &&
*/
        //parseFloat(sRsiLast1m.k) >= parseFloat(sRsiLast1m.d) &&
        //parseFloat(sRsiLast3m.k) >= parseFloat(sRsiLast3m_2.k) &&

        //parseFloat(sRsiLast3m.k) >= parseFloat(sRsiLast3m.d) &&
        //parseFloat(sRsiLast5m.k) >= parseFloat(sRsiLast5m.d) &&
        /*
        parseFloat(sRsiLast5m.k) >= parseFloat(sRsiLast5m_2.k) &&
        parseFloat(sRsiLast30m.k) >= parseFloat(sRsiLast30m_2.k) &&
        parseFloat(sRsiLast1h.k) >= parseFloat(sRsiLast1h_2.k) &&
        (
          (
            fibo1h.dir == 1 &&
            parseFloat(preco_atual) <= parseFloat(fibo1h.retr0618) &&
            parseFloat(preco_atual) >= parseFloat(fibo1h.retr1)
          ) || (
            fibo1h.dir == -1 &&
            parseFloat(preco_atual) <= parseFloat(fibo1h.retr0382) &&
            parseFloat(preco_atual) >= parseFloat(fibo1h.retr0)
          )
        )

        &&
        
          (
            (
              parseFloat(sRsiLast30m.k) >= parseFloat(sRsiLast30m.d) &&
              parseFloat(sRsiLast30m.k) >= parseFloat(sRsiLast30m_2.k)
            ) ||
            parseFloat(sRsiLast30m.k) <= parseFloat(20.0)
          ) &&
 
      

        //parseFloat(sRsiLast1h.k) >= parseFloat(sRsiLast1h_2.k) &&
        //parseFloat(sRsiLast4h.k) >= parseFloat(sRsiLast4h.d) && parseFloat(sRsiLast4h.k) <= 20 &&
        //(parseFloat(candles3m.slice(-1)[0].low) <= parseFloat(maiorMedia3m) ||
        //  parseFloat(candles3m.slice(-2)[0].low) <= parseFloat(maiorMedia3m)) &&
        //parseFloat(preco_atual) >= parseFloat(menorMedia3m) &&
        //parseFloat(preco_atual) >= parseFloat(candles3m.slice(-1)[0].low)
        //parseFloat(preco_atual) >= parseFloat(ltaltb1h.lta) &&
        //parseFloat(preco_atual) >= parseFloat(ltaltb1h.ltb)

      )
*/
        // (
        /*
        (
          parseFloat(ltaltb1m.lta) <= parseFloat(maiorMedia3m) + parseFloat(tickSize * 10) &&
          parseFloat(ltaltb1m.lta) >= parseFloat(menorMedia3m) - parseFloat(tickSize * 10)
        ) || (
          parseFloat(ltaltb1m.ltb) <= parseFloat(maiorMedia3m) + parseFloat(tickSize * 10) &&
          parseFloat(ltaltb1m.ltb) >= parseFloat(menorMedia3m) - parseFloat(tickSize * 10)
        )
          *

        (
          fibo5m.dir == 1 &&
          parseFloat(ltaltb1m.lta) <= parseFloat(fibo5m.retr0618) &&
          parseFloat(ltaltb1m.lta) >= parseFloat(fibo5m.retr1)
        ) || (
          fibo5m.dir == -1 &&
          parseFloat(ltaltb1m.lta) <= parseFloat(fibo5m.retr0382) &&
          parseFloat(ltaltb1m.lta) >= parseFloat(fibo5m.retr0)
        )
*/
        // )
        // &&
        /*
        parseFloat(sRsiLast3m.k) >= parseFloat(30.0) &&
        parseFloat(sRsiLast3m.k) <= parseFloat(70.0) &&
        parseFloat(sRsiLast3m.k) >= parseFloat(sRsiLast3m_2.k) &&
        parseFloat(sRsiLast5m.k) >= parseFloat(30.0) &&
        parseFloat(sRsiLast5m.k) <= parseFloat(70.0) &&
        parseFloat(sRsiLast5m.k) >= parseFloat(sRsiLast5m_2.k) &&

        //parseFloat(sRsiLast15m.k) >= parseFloat(sRsiLast15m_2.k) &&
        //parseFloat(sRsiLast1h.k) >= parseFloat(sRsiLast1h_2.k) &&
        parseFloat(preco_atual) >= parseFloat(menorMedia3m)
*
        (
          parseFloat(sRsiLast4h.k) <= parseFloat(10.0) ||
          parseFloat(sRsiLast4h_2.k) <= parseFloat(10.0)
        ) &&
        (
          parseFloat(sRsiLast1h.k) <= parseFloat(10.0) ||
          parseFloat(sRsiLast1h_2.k) <= parseFloat(10.0)
        ) &&
        */

        //////////////////////
        /*
        
        (
          parseFloat(sRsiLast1h_2.k) <= parseFloat(20.0) &&
          parseFloat(sRsiLast1h.k) >= parseFloat(20.0) &&
          parseFloat(sRsiLast1h.k) >= parseFloat(sRsiLast1h.d) 
          ) &&
        */

        //(
        /*
        parseFloat(sRsiLast15m.k) <= parseFloat(50.0) 
          &&
          parseFloat(sRsiLast5m.k) >= parseFloat(60.0) 
          &&
          parseFloat(sRsiLast5m.k) <= parseFloat(80.0) 
          &&
          */
        //parseFloat(sRsiLast3m.k) >= parseFloat(20.0) &&
        //parseFloat(sRsiLast3m.k) <= parseFloat(60.0)

        //parseFloat(sRsiLast3m_2.k) <= parseFloat(20.0)


        //) &&
        //parseFloat(sRsiLast1m.k) >= parseFloat(sRsiLast1m.d) &&
        //parseFloat(sRsiLast3m.k) >= parseFloat(sRsiLast3m.d) &&
        //parseFloat(sRsiLast3m.k) >= parseFloat(sRsiLast3m_2.k) &&
        //parseFloat(sRsiLast5m.k) >= parseFloat(sRsiLast5m_2.k) &&
        //parseFloat(sRsiLast15m.k) >= parseFloat(sRsiLast15m_2.k) &&
        //parseFloat(sRsiLast5m.k) >= parseFloat(sRsiLast5m.d) &&
        //parseFloat(sRsiLast15m.k) >= parseFloat(sRsiLast15m.d) &&
        //parseFloat(candles3m.slice(-2)[0].open) >= parseFloat(candles3m.slice(-3)[0].close) &&
        //parseFloat(candles3m.slice(-2)[0].open) <= parseFloat(candles3m.slice(-2)[0].close) &&
        //parseFloat(candles1m.slice(-2)[0].close) >= parseFloat(maiorMedia3m) 
        /*
        parseFloat(candles1m.slice(-2)[0].low) <= parseFloat(maiorM3m20p) && //+ (parseFloat(tickSize) * 3))
        parseFloat(candles1m.slice(-2)[0].low) >= (parseFloat(menorM3m20p) - (parseFloat(tickSize) * 3)) &&

//////
//parseFloat(maiorM3m20p) >= parseFloat(menorMedia3m) &&
parseFloat(candles1m.slice(-2)[0].close) >= parseFloat(maiorM3m20p) 
//&&
//parseFloat(candles1m.slice(-2)[0].open) <= parseFloat(candles1m.slice(-2)[0].close)
*/
        //parseFloat(sRsiLast1m.k) >= parseFloat(50.0) &&
        //parseFloat(sRsiLast3m.k) >= parseFloat(sRsiLast3m.d) &&
        //parseFloat(ema3m5p) >= parseFloat(ema3m10p) 

        //&&
        // parseFloat(candles1m.slice(-2)[0].low) <= parseFloat(ema3m5p) &&
        //parseFloat(candles1m.slice(-1)[0].close) <= parseFloat(ema3m5p) &&
        //parseFloat(candles1m.slice(-2)[0].low) <= parseFloat(candles1m.slice(-1)[0].low)
        /*      
        parseFloat(sRsiLast1m.k) >= parseFloat(sRsiLast1m.d) 
        && parseFloat(sRsiLast3m.k) >= parseFloat(sRsiLast3m.d) 
        && parseFloat(sRsiLast3m.k) >= parseFloat(sRsiLast3m_2.k) 
        && parseFloat(sRsiLast5m.k) >= parseFloat(sRsiLast5m.d) 
        && parseFloat(sRsiLast15m.k) >= parseFloat(sRsiLast15m.d) 
        /*
        && parseFloat(sRsiLast15m.k) >= parseFloat(50)
        && parseFloat(sRsiLast15m.k) >= parseFloat(sRsiLast15m.d) 
        && parseFloat(sRsiLast15m.k) >= parseFloat(sRsiLast15m_2.k) 
        *
        
        && parseFloat(sRsiLast30m.k) >= parseFloat(50)
        && parseFloat(sRsiLast30m.k) >= parseFloat(sRsiLast30m.d) 
        && parseFloat(sRsiLast30m.k) >= parseFloat(sRsiLast30m_2.k) 
        /*
        && parseFloat(sRsiLast30m.k) >= parseFloat(20) 
        && parseFloat(sRsiLast30m.k) <= parseFloat(60) 
        && parseFloat(sRsiLast30m.k) >=  parseFloat(sRsiLast30m.d) 
        && parseFloat(sRsiLast30m.k) >= parseFloat(sRsiLast30m_2.k) 
        
        *
        && parseFloat(sRsiLast1h_2.k) <= parseFloat(20) 
        && parseFloat(sRsiLast1h_2.d) <= parseFloat(20) 
        && parseFloat(sRsiLast1h.k) >= parseFloat(20) 
        && parseFloat(sRsiLast1h.k) <= parseFloat(60) 
        && parseFloat(sRsiLast1h.k) >=  parseFloat(sRsiLast1h.d) 
        && parseFloat(sRsiLast1h.k) >= parseFloat(sRsiLast1h_2.k) 
        */
        /*
        parseFloat(sRsiLast1h.k) <= parseFloat(20)
        && parseFloat(sRsiLast1h.d) <= parseFloat(20) 
        && parseFloat(sRsiLast1h.k) >=  parseFloat(sRsiLast1h.d) 
        &&  parseFloat(sRsiLast5m_2.k) <= parseFloat(20) 
        && parseFloat(sRsiLast5m_2.d) <= parseFloat(20) 
        && parseFloat(sRsiLast5m.k) >= parseFloat(20) 
        //&& parseFloat(sRsiLast5m.k) <= parseFloat(60) 
        && parseFloat(sRsiLast5m.k) >=  parseFloat(sRsiLast5m.d) 
        && parseFloat(sRsiLast5m.k) >= parseFloat(sRsiLast5m_2.k) 
        
        //&& parseFloat(ema1m5p_2) < parseFloat(ema1m10p_2) 
        //&& parseFloat(ema1m5p) > parseFloat(ema1m10p) 
        //&& parseFloat(ema1m5p) > parseFloat(ema3m400p) 
        //
        */

        /*
        parseFloat(sRsiLast15m.k) <= parseFloat(20)
        && parseFloat(sRsiLast15m.d) <= parseFloat(20) 
        && parseFloat(sRsiLast5m_2.k) <= parseFloat(10)
        && parseFloat(sRsiLast5m_2.d) <= parseFloat(10) 
        && parseFloat(sRsiLast5m.k) >= parseFloat(10)
        && parseFloat(sRsiLast5m.k) >=  parseFloat(sRsiLast5m.d) 
        && parseFloat(sRsiLast3m.k) >=  parseFloat(sRsiLast3m.d) 
        && parseFloat(sRsiLast1m.k) >=  parseFloat(sRsiLast1m.d) 
        
        && parseFloat(ema3m400p) >= parseFloat(sma3m400p) 
        && parseFloat(ema1m5p) > parseFloat(sma3m400p) 
        */

        //parseFloat(ema1m400p) >= parseFloat(sma1m400p)
        //&& 
        parseFloat(ema1m5p) > parseFloat(ema1m5p_2)
        && parseFloat(ema1m10p) > parseFloat(ema1m10p_2)
        && (
          /*
          (
          parseFloat(ema1m5p_2) <= parseFloat(menorMReg1m)
          && parseFloat(ema1m5p) >= parseFloat(menorMReg1m)
          ) ||
          */
          (

            //parseFloat(ema1m5p_2) <= parseFloat(menorMReg1m)
            //&& parseFloat(ema1m5p) >= parseFloat(menorMReg1m)

            parseFloat(ema1m5p_2) <= parseFloat(menorMReg1m)
            && parseFloat(preco_atual) >= parseFloat(menorMReg1m)

            /*
             parseFloat(ema1m5p_2) <= parseFloat(ema1m10p_2)
             && parseFloat(ema1m5p) >= parseFloat(ema1m10p_2)
             && parseFloat(ema1m5p) >= parseFloat(menorMReg1m)
             */

          )
        )
        && parseFloat(candles15m.slice(-2)[0].low) <= parseFloat(candles15m.slice(-1)[0].low)
        //&& parseFloat(candles15m.slice(-1)[0].open) <= parseFloat(candles15m.slice(-1)[0].close)

      ) {

        //sideM = 'V';
        //sideOrd = 'SELL';
        sideM = 'C';
        sideOrd = 'BUY';
        gatilhoAtivado = true;

      } else if (
        /*
                (
                  (
                    fibo1h.dir == 1 &&
                    parseFloat(ltaltb3m.ltb) <= parseFloat(fibo1h.retr0) &&
                    parseFloat(ltaltb3m.ltb) >= parseFloat(fibo1h.retr05)
                  ) || (
                    fibo1h.dir == -1 &&
                    parseFloat(ltaltb3m.ltb) <= parseFloat(fibo1h.retr1) &&
                    parseFloat(ltaltb3m.ltb) >= parseFloat(fibo1h.retr05)
                  )
                ) &&
        
                (
        
                  //parseFloat(sRsiLast1m.k) >= parseFloat(80.0) &&
                  //parseFloat(sRsiLast3m.k) >= parseFloat(80.0) &&
                  /*
                  (
                    parseFloat(sRsiLast30m.k) <= parseFloat(sRsiLast30m_2.k) ||
                    parseFloat(sRsiLast30m.k) <= parseFloat(sRsiLast30m.d) 
                  
                  )&&
                    parseFloat(sRsiLast30m.k) >= parseFloat(20.0) &&
        */
        //parseFloat(sRsiLast1m.k) <= parseFloat(sRsiLast1m.d) &&
        //parseFloat(sRsiLast3m.k) <= parseFloat(sRsiLast3m_2.k) &&

        //parseFloat(sRsiLast3m.k) <= parseFloat(sRsiLast3m.d) &&
        /*
        parseFloat(sRsiLast5m.k) <= parseFloat(sRsiLast5m_2.k) &&
        parseFloat(sRsiLast30m.k) <= parseFloat(sRsiLast30m_2.k) &&
        parseFloat(sRsiLast1h.k) <= parseFloat(sRsiLast1h_2.k) &&

        (
          (
            fibo1h.dir == 1 &&
            parseFloat(preco_atual) <= parseFloat(fibo1h.retr0) &&
            parseFloat(preco_atual) >= parseFloat(fibo1h.retr0382)
          ) || (
            fibo1h.dir == -1 &&
            parseFloat(preco_atual) <= parseFloat(fibo1h.retr1) &&
            parseFloat(preco_atual) >= parseFloat(fibo1h.retr0618)
          )
        ) &&
        
                  (
                    (
                      parseFloat(sRsiLast30m.k) <= parseFloat(sRsiLast30m.d) &&
                      parseFloat(sRsiLast30m.k) <= parseFloat(sRsiLast30m_2.k)
                    ) ||
                    parseFloat(sRsiLast30m.k) >= parseFloat(80.0)
                  ) &&
        
                  
        //parseFloat(sRsiLast1h.k) <= parseFloat(sRsiLast1h_2.k) &&
        //parseFloat(sRsiLast4h.k) <= parseFloat(sRsiLast4h.d) && parseFloat(sRsiLast4h.k) >= 80 &&
        //(parseFloat(candles3m.slice(-1)[0].high) >= parseFloat(menorMedia3m) ||
        //parseFloat(candles3m.slice(-2)[0].high) >= parseFloat(menorMedia3m)) &&
        //parseFloat(preco_atual) <= parseFloat(maiorMedia3m) &&
        parseFloat(preco_atual) <= parseFloat(candles3m.slice(-1)[0].high)
        //parseFloat(preco_atual) <= parseFloat(ltaltb1h.lta) &&
        //parseFloat(preco_atual) <= parseFloat(ltaltb1h.ltb)


      )
*/
        //(
        /*
        (
          parseFloat(ltaltb1m.lta) <= parseFloat(maiorMedia3m) + parseFloat(tickSize * 10) &&
          parseFloat(ltaltb1m.lta) >= parseFloat(menorMedia3m) - parseFloat(tickSize * 10)
        ) || (
          parseFloat(ltaltb1m.ltb) <= parseFloat(maiorMedia3m) + parseFloat(tickSize * 10) &&
          parseFloat(ltaltb1m.ltb) >= parseFloat(menorMedia3m) - parseFloat(tickSize * 10)
        )
          *

        (
          fibo5m.dir == 1 &&
          parseFloat(ltaltb1m.ltb) <= parseFloat(fibo5m.retr0) &&
          parseFloat(ltaltb1m.ltb) >= parseFloat(fibo5m.retr0382)
        ) || (
          fibo5m.dir == -1 &&
          parseFloat(ltaltb1m.ltb) <= parseFloat(fibo5m.retr1) &&
          parseFloat(ltaltb1m.ltb) >= parseFloat(fibo5m.retr0618)
        )
*
        // )

        //&&
        parseFloat(sRsiLast3m.k) <= parseFloat(70.0) &&
        parseFloat(sRsiLast3m.k) >= parseFloat(30.0) &&
        parseFloat(sRsiLast3m.k) <= parseFloat(sRsiLast3m_2.k) &&
        parseFloat(sRsiLast5m.k) <= parseFloat(70.0) &&
        parseFloat(sRsiLast5m.k) >= parseFloat(30.0) &&
        parseFloat(sRsiLast5m.k) <= parseFloat(sRsiLast5m_2.k) &&

        //parseFloat(sRsiLast15m.k) <= parseFloat(sRsiLast15m_2.k) &&
        //parseFloat(sRsiLast1h.k) <= parseFloat(sRsiLast1h_2.k) &&
        parseFloat(preco_atual) <= parseFloat(maiorMedia3m)
*

        (
          parseFloat(sRsiLast4h.k) >= parseFloat(90.0) ||
          parseFloat(sRsiLast4h_2.k) >= parseFloat(90.0)
        ) &&
        (
          parseFloat(sRsiLast1h.k) >= parseFloat(90.0) ||
          parseFloat(sRsiLast1h_2.k) >= parseFloat(90.0)
        ) &&
*/
        ////////////////////////////////////////
        /*
        (
          parseFloat(sRsiLast1h_2.k) >= parseFloat(80.0) &&
          parseFloat(sRsiLast1h.k) <= parseFloat(80.0) &&
          parseFloat(sRsiLast1h.k) <= parseFloat(sRsiLast1h.d) 
          ) &&
          */

        // (
        /*
      parseFloat(sRsiLast15m.k) >= parseFloat(50.0) &&
      parseFloat(sRsiLast5m.k) >= parseFloat(20.0) &&
      parseFloat(sRsiLast5m.k) <= parseFloat(40.0) &&
      */
        //parseFloat(sRsiLast3m.k) <= parseFloat(80.0) &&
        //parseFloat(sRsiLast3m.k) >= parseFloat(40.0)

        //parseFloat(sRsiLast30m_2.k) >= parseFloat(80.0)

        //) &&

        //parseFloat(sRsiLast1m.k) <= parseFloat(sRsiLast1m.d) &&
        //parseFloat(sRsiLast3m.k) <= parseFloat(sRsiLast3m.d) &&
        //parseFloat(sRsiLast3m.k) <= parseFloat(sRsiLast3m_2.k) &&
        //parseFloat(sRsiLast5m.k) <= parseFloat(sRsiLast5m_2.k) &&
        //parseFloat(sRsiLast15m.k) <= parseFloat(sRsiLast15m_2.k) &&
        //parseFloat(sRsiLast5m.k) <= parseFloat(sRsiLast5m.d) &&
        //parseFloat(sRsiLast15m.k) <= parseFloat(sRsiLast15m.d) &&
        //parseFloat(candles3m.slice(-2)[0].open) <= parseFloat(candles3m.slice(-3)[0].close) &&
        //parseFloat(candles3m.slice(-2)[0].open) >= parseFloat(candles3m.slice(-2)[0].close) &&
        //parseFloat(candles1m.slice(-2)[0].close) <= parseFloat(menorMedia3m) 

        /*
        parseFloat(candles1m.slice(-2)[0].high) <= (parseFloat(maiorM3m20p) + (parseFloat(tickSize) * 3)) &&
        parseFloat(candles1m.slice(-2)[0].high) >= parseFloat(menorM3m20p) && 
        //- (parseFloat(tickSize) * 3))
///////////////////////////_______

//parseFloat(menorM3m20p) <= parseFloat(maiorMedia3m) &&
parseFloat(candles1m.slice(-2)[0].close) <= parseFloat(menorM3m20p) 
//&&
//parseFloat(candles1m.slice(-2)[0].open) >= parseFloat(candles1m.slice(-2)[0].close) 
*/
        //parseFloat(sRsiLast1m.k) <= parseFloat(50.0) &&
        //parseFloat(sRsiLast3m.k) <= parseFloat(sRsiLast3m.d) &&
        //parseFloat(ema3m5p) <= parseFloat(ema3m10p) 
        //&&
        //parseFloat(candles1m.slice(-2)[0].high) >= parseFloat(ema3m5p) &&
        //parseFloat(candles1m.slice(-1)[0].close) >= parseFloat(ema3m5p) &&
        //parseFloat(candles1m.slice(-2)[0].high) >= parseFloat(candles1m.slice(-1)[0].high)
        /*
        parseFloat(sRsiLast1m.k) <= parseFloat(sRsiLast1m.d) 
  && parseFloat(sRsiLast3m.k) <= parseFloat(sRsiLast3m.d) 
  && parseFloat(sRsiLast3m.k) <= parseFloat(sRsiLast3m_2.k) 
  && parseFloat(sRsiLast5m.k) <= parseFloat(sRsiLast5m.d) 
  && parseFloat(sRsiLast15m.k) <= parseFloat(sRsiLast15m.d) 
  /*
  && parseFloat(sRsiLast15m.k) <= parseFloat(50)
  && parseFloat(sRsiLast15m.k) <= parseFloat(sRsiLast15m.d) 
  && parseFloat(sRsiLast15m.k) <= parseFloat(sRsiLast15m_2.k) 
  *
  
  && parseFloat(sRsiLast30m.k) <= parseFloat(50)
  && parseFloat(sRsiLast30m.k) <= parseFloat(sRsiLast30m.d) 
  && parseFloat(sRsiLast30m.k) <= parseFloat(sRsiLast30m_2.k) 
  
  /*
  && parseFloat(sRsiLast30m.k) <= parseFloat(80) 
  && parseFloat(sRsiLast30m.k) >= parseFloat(40) 
  && parseFloat(sRsiLast30m.k) <=  parseFloat(sRsiLast30m.d) 
  && parseFloat(sRsiLast30m.k) <= parseFloat(sRsiLast30m_2.k) 
  *
  && parseFloat(sRsiLast1h_2.k) >= parseFloat(80) 
  && parseFloat(sRsiLast1h_2.d) >= parseFloat(80) 
  && parseFloat(sRsiLast1h.k) <= parseFloat(80) 
  && parseFloat(sRsiLast1h.k) >= parseFloat(40) 
  && parseFloat(sRsiLast1h.k) <=  parseFloat(sRsiLast1h.d) 
  && parseFloat(sRsiLast1h.k) <= parseFloat(sRsiLast1h_2.k) 
  */
        /*
        parseFloat(sRsiLast1h.k) >= parseFloat(80)
        && parseFloat(sRsiLast1h.d) >= parseFloat(80) 
        && parseFloat(sRsiLast1h.k) <=  parseFloat(sRsiLast1h.d) 
        && parseFloat(sRsiLast5m_2.k) >= parseFloat(80) 
        && parseFloat(sRsiLast5m_2.d) >= parseFloat(80) 
        && parseFloat(sRsiLast5m.k) <= parseFloat(80) 
        //&& parseFloat(sRsiLast5m.k) <= parseFloat(60) 
        && parseFloat(sRsiLast5m.k) <=  parseFloat(sRsiLast5m.d) 
        
        && parseFloat(sRsiLast5m.k) <= parseFloat(sRsiLast5m_2.k)
        
        //&& parseFloat(ema1m5p_2) > parseFloat(ema1m10p_2) 
        //&& parseFloat(ema1m5p) < parseFloat(ema1m10p) 
        // && parseFloat(ema1m5p) < parseFloat(ema3m400p) 
        */
        /*
        parseFloat(sRsiLast15m.k) >= parseFloat(80)
        && parseFloat(sRsiLast15m.d) >= parseFloat(80) 
        && parseFloat(sRsiLast5m_2.k) >= parseFloat(90)
        && parseFloat(sRsiLast5m_2.d) >= parseFloat(90) 
        && parseFloat(sRsiLast5m.k) <= parseFloat(90)
        && parseFloat(sRsiLast5m.k) <=  parseFloat(sRsiLast5m.d) 
        && parseFloat(sRsiLast3m.k) <=  parseFloat(sRsiLast3m.d) 
        && parseFloat(sRsiLast1m.k) <=  parseFloat(sRsiLast1m.d) 
        
        && parseFloat(ema3m400p) <= parseFloat(sma3m400p) 
        && parseFloat(ema1m5p) < parseFloat(sma3m400p) 
        */

        //parseFloat(ema1m400p) <= parseFloat(sma1m400p)
        //&& 
        parseFloat(ema1m5p) < parseFloat(ema1m5p_2)
        && parseFloat(ema1m10p) < parseFloat(ema1m10p_2)
        && (
          (

            //parseFloat(ema1m5p_2) >= parseFloat(maiorMReg1m)
            //&& parseFloat(ema1m5p) <= parseFloat(maiorMReg1m)

            parseFloat(ema1m5p_2) >= parseFloat(maiorMReg1m)
            && parseFloat(preco_atual) <= parseFloat(maiorMReg1m)

            /*
            parseFloat(ema1m5p_2) >= parseFloat(ema1m10p_2)
            && parseFloat(ema1m5p) <= parseFloat(ema1m10p_2)

            && parseFloat(ema1m5p) <= parseFloat(maiorMReg1m)
            */
          )
          /*
          || (
          parseFloat(ema1m5p_2) >= parseFloat(maiorMReg1m)
          && parseFloat(ema1m5p) <= parseFloat(maiorMReg1m)
          )
          */
        )
        && parseFloat(candles15m.slice(-2)[0].high) >= parseFloat(candles15m.slice(-1)[0].high)
        //&& parseFloat(candles15m.slice(-1)[0].open) >= parseFloat(candles15m.slice(-1)[0].close)

      ) {

        //sideM = 'C';
        //sideOrd = 'BUY';
        sideM = 'V';
        sideOrd = 'SELL';
        gatilhoAtivado = true;

      } else {

        gatilhoAtivado = false;
        sideM = '';
        sideOrd = '';

      }

      console.log("");
      parentPort.postMessage(`<___-----[${symbol}]-- --(${preco_atual})-----___>`);

      //console.log('zigZag4h', JSON.stringify(zigZag4h));
      parentPort.postMessage(`Candle: ${JSON.stringify(candles30m.slice(-2)[0], null, 2)}`);
      //parentPort.postMessage(`zigZag1h: ${JSON.stringify(zigZag1h.pontosUnificados, null, 2)}`);
      //parentPort.postMessage(`fibo1h: ${JSON.stringify(fibo1h, null, 2)}`);

      //parentPort.postMessage(`zigZag3m: ${JSON.stringify(zigZag3m.pontosUnificados, null, 2)}`);
      //parentPort.postMessage(`fibo1m: ${JSON.stringify(fibo1m, null, 2)}`);
      //parentPort.postMessage(`fibo3m: ${JSON.stringify(fibo3m, null, 2)}`);
      //parentPort.postMessage(`fibo5m: ${JSON.stringify(fibo5m, null, 2)}`);
      //parentPort.postMessage(`fibo15m: ${JSON.stringify(fibo15m, null, 2)}`);
      //parentPort.postMessage(`fibo30m: ${JSON.stringify(fibo30m, null, 2)}`);
      //parentPort.postMessage(`fibo1h: ${JSON.stringify(fibo1h, null, 2)}`);
      //parentPort.postMessage(`fibo4h: ${JSON.stringify(fibo4h, null, 2)}`);
      //parentPort.postMessage(`fibo1h_dir: ${JSON.stringify(fibo1h.dir, null, 2)}`);
      //parentPort.postMessage(`fibo1h_ret1: ${JSON.stringify(fibo1h.retr0, null, 2)}`);
      //parentPort.postMessage(`fibo1h_ret0: ${JSON.stringify(fibo1h.retr1, null, 2)}`);


      parentPort.postMessage(`sRsiLast1m: ${JSON.stringify(sRsiLast1m, null, 2)}`);
      parentPort.postMessage(`sRsiLast3m: ${JSON.stringify(sRsiLast3m, null, 2)}`);
      parentPort.postMessage(`sRsiLast5m: ${JSON.stringify(sRsiLast5m, null, 2)}`);
      parentPort.postMessage(`sRsiLast15m: ${JSON.stringify(sRsiLast15m, null, 2)}`);
      parentPort.postMessage(`sRsiLast30m: ${JSON.stringify(sRsiLast30m, null, 2)}`);
      parentPort.postMessage(`sRsiLast1h: ${JSON.stringify(sRsiLast1h, null, 2)}`);
      //parentPort.postMessage(`sRsiLast4h: ${JSON.stringify(sRsiLast4h, null, 2)}`);

      //parentPort.postMessage(`ltaltb1m: ${JSON.stringify(ltaltb1m, null, 2)}`);
      //parentPort.postMessage(`ltaltb3m: ${JSON.stringify(ltaltb3m, null, 2)}`);
      //parentPort.postMessage(`ltaltb5m: ${JSON.stringify(ltaltb5m, null, 2)}`);
      //parentPort.postMessage(`ltaltb15m: ${JSON.stringify(ltaltb15m, null, 2)}`);
      //parentPort.postMessage(`ltaltb1h: ${JSON.stringify(ltaltb1h, null, 2)}`);
      //parentPort.postMessage(`ltaltb4h: ${JSON.stringify(ltaltb4h, null, 2)}`);
      /*
      parentPort.postMessage("");

      parentPort.postMessage(`fibo5m.dir: ${JSON.stringify(fibo5m.dir, null, 2)}`);
      parentPort.postMessage(`fibo5m.retr0: ${JSON.stringify(fibo5m.retr0, null, 2)}`);
      parentPort.postMessage(`fibo5m.retr1: ${JSON.stringify(fibo5m.retr1, null, 2)}`);
      */
      parentPort.postMessage("");

      /*
      
        parentPort.postMessage(`fibo1h.dir: ${JSON.stringify(fibo1h.dir, null, 2)}`);
        parentPort.postMessage(`fibo1h.retr0: ${JSON.stringify(fibo1h.retr0, null, 2)}`);
        parentPort.postMessage(`fibo1h.retr1: ${JSON.stringify(fibo1h.retr1, null, 2)}`);
  
        parentPort.postMessage(`fibo4h.dir: ${JSON.stringify(fibo4h.dir, null, 2)}`);
        parentPort.postMessage(`fibo4h.retr0: ${JSON.stringify(fibo4h.retr0, null, 2)}`);
        parentPort.postMessage(`fibo4h.retr1: ${JSON.stringify(fibo4h.retr1, null, 2)}`);
  
        parentPort.postMessage(`zigZag1h.topos0: ${JSON.stringify(zigZag1h.topos[0], null, 2)}`);
        parentPort.postMessage(`zigZag1h.topos1: ${JSON.stringify(zigZag1h.topos[1], null, 2)}`);
        parentPort.postMessage(`zigZag1h.fundos0: ${JSON.stringify(zigZag1h.fundos[0], null, 2)}`);
        parentPort.postMessage(`zigZag1h.fundos1: ${JSON.stringify(zigZag1h.fundos[1], null, 2)}`);
  
        parentPort.postMessage(`zigZag4h.topos0: ${JSON.stringify(zigZag4h.topos[0], null, 2)}`);
        parentPort.postMessage(`zigZag4h.topos1: ${JSON.stringify(zigZag4h.topos[1], null, 2)}`);
        parentPort.postMessage(`zigZag4h.fundos0: ${JSON.stringify(zigZag4h.fundos[0], null, 2)}`);
        parentPort.postMessage(`zigZag4h.fundos1: ${JSON.stringify(zigZag4h.fundos[1], null, 2)}`);
  
        parentPort.postMessage(`ltaltb1h: ${JSON.stringify(ltaltb1h, null, 2)}`);
        parentPort.postMessage(`ltaltb1h: ${JSON.stringify(ltaltb1h, null, 2)}`);
        parentPort.postMessage(`ltaltb1h: ${JSON.stringify(ltaltb1h, null, 2)}`);
        parentPort.postMessage(`ltaltb4h: ${JSON.stringify(ltaltb4h, null, 2)}`);
      
      */

      //parentPort.postMessage(`Balance: ${JSON.stringify(balance, null, 2)}`);
      //parentPort.postMessage(`anterior: ${JSON.stringify(anterior, null, 2)}`);
      //parentPort.postMessage(`candle1m: ${JSON.stringify(candle1m, null, 2)}`);

      //parentPort.postMessage(`medias5m: ${medias5m}`);
      //parentPort.postMessage(`medias5m: ${medias5m}`);
      //parentPort.postMessage(`medias15m: ${medias15m}`);
      parentPort.postMessage(`maiorMedia3mRG: ${maiorMedia3m + parseFloat(tickSize * 10)}`);
      parentPort.postMessage(`maiorMedia3m ---:> ${maiorMedia3m}`);
      parentPort.postMessage(`menorMedia3m ---:> ${menorMedia3m}`);
      parentPort.postMessage(`menorMedia3mRG: ${menorMedia3m - parseFloat(tickSize * 10)}`);


      /////// parentPort.postMessage(`medias3m: ${medias3m}`);

      /////// parentPort.postMessage(`maiorMedia: ${maiorMedia3m}`);
      /////// parentPort.postMessage(`menorMedia: ${menorMedia3m}`);

      //parentPort.postMessage(`maiorMedia: ${maiorMedia3m}`);
      //parentPort.postMessage(`menorMedia: ${menorMedia3m}`);

      //parentPort.postMessage(`maiorMedia: ${maiorMedia5m}`);
      //parentPort.postMessage(`menorMedia: ${menorMedia5m}`);
      //parentPort.postMessage(`maiorMedia: ${maiorMedia15m}`);
      //parentPort.postMessage(`menorMedia: ${menorMedia15m}`);
      //parentPort.postMessage(`maiorMedia: ${maiorMedia1h}`);
      //parentPort.postMessage(`menorMedia: ${menorMedia1h}`);
      parentPort.postMessage(`sideOrd: ${sideOrd}`);
      parentPort.postMessage(`gatilhoAtivado: ${gatilhoAtivado}`);

      //nLocks = countLocks();
      //parentPort.postMessage(`countLocks: ${nLocks}`);

      // cacheJson.houveReducao++;
      // await salvarCache(cacheJson, symbol);

      //parentPort.postMessage(`cacheJson: ${JSON.stringify(cacheJson)}`);

      //parentPort.postMessage(`cacheRisk: ${JSON.stringify(cacheRisk)}`);

      // getOpenPositions();

      posicaoAberta = await verificarSeTemPosicao(1);

      // parentPort.postMessage(`✅ iniciarWebSocketContinuo / Posição: ${JSON.stringify(posicaoAberta, null, 2)} `);

      contPos = await verificarSeTemPosicao(2);

      parentPort.postMessage(`🔎 Total de posições abertas: ${contPos}`);



      const roiPosTr = roiTracker.getRoi(symbol, posicaoAberta);
      parentPort.postMessage(`roiTracker/Posição aberta: ${JSON.stringify(roiPosTr, null, 2)}`);

      parentPort.postMessage(`Atualizado: ${formatTime(Date.now())}`);

      if (posicaoAberta !== 0 && posicaoAberta !== null && posicaoAberta !== undefined) {

        if (posicaoAberta.positionAmt > 0) {
          sideM = 'C';
          sideOrd = 'BUY';
        } else if (posicaoAberta.positionAmt < 0) {
          sideM = 'V';
          sideOrd = 'SELL';
        }

        if (gatilhoAtivado == true && sideOrd == 'SELL' //&&
          //parseFloat(sRsiLast1m.k) >= parseFloat(sRsiLast1m.d) //&&
          //(preco_atual > (parseFloat(maiorMedia3m) + (parseFloat(tickSize) * 3)))
        ) {
          /*
            await fecharPosicao(sideOrd, Math.abs(posicaoAberta.positionAmt));
            sideM = 'C';
            sideOrd = 'BUY';
            gatilhoAtivado = true;

          */

        } else if (gatilhoAtivado == true && sideOrd == 'BUY' //&&
          //parseFloat(sRsiLast1m.k) <= parseFloat(sRsiLast1m.d) //&&
          //(preco_atual < (parseFloat(menorMedia3m) - (parseFloat(tickSize) * 3)))
        ) {
          /*
                  await fecharPosicao(sideOrd, Math.abs(posicaoAberta.positionAmt));
                  sideM = 'V';
                  sideOrd = 'SELL';
                  gatilhoAtivado = true;
          */

        }

        /*
                if (gatilhoAtivado == true && sideOrd == 'SELL' &&
                  parseFloat(sRsiLast1h.k) >= parseFloat(sRsiLast1h.d) &&
                  (preco_atual > (parseFloat(maiorMedia3m) + (parseFloat(tickSize) * 3)))
                ) {
        
                  await fecharPosicao(sideOrd, Math.abs(posicaoAberta.positionAmt));
        
                } else if (gatilhoAtivado == true && sideOrd == 'BUY' &&
                  parseFloat(sRsiLast1h.k) <= parseFloat(sRsiLast1h.d) &&
                  (preco_atual < (parseFloat(menorMedia3m) - (parseFloat(tickSize) * 3)))
                ) {
        
                  await fecharPosicao(sideOrd, Math.abs(posicaoAberta.positionAmt));
        
                }
        */

        let pnlRoiAtual = await calcPnlFutBinance(posicaoAberta.entryPrice, preco_atual, Math.abs(posicaoAberta.positionAmt), sideOrd);

        //roiTracker.updateRoi(symbol, pnlRoiAtual.roi);

        unRealizedProfitArred = floorDecimal(posicaoAberta.unRealizedProfit, 2);
        isolatedWalletArred = floorDecimal(posicaoAberta.isolatedWallet, 2);

        ///// await notificWin(posicaoAberta.entryPrice, symbol, 'open', sideM, pnlRoiAtual.roi);

        stopAtivo = await verificarStopAtivo();
        parentPort.postMessage(`iniciarWebSocketContinuo / StopAtivo: ${JSON.stringify(stopAtivo, null, 2)} `);
        takeAtivo = await verificarTakeAtivo();
        parentPort.postMessage(`iniciarWebSocketContinuo / takeAtivo: ${JSON.stringify(takeAtivo, null, 2)} `);

        liquidationPrice = await getLiquidationPrice(symbol);
        cacheJsonAux = await carregarCache(symbol);

        if (cacheJsonAux[0] !== undefined) {
          cacheJson = cacheJsonAux;
        }

        if (parseFloat(pnlRoiAtual.roi) > 0.0) {
          cacheJson.maxRoi = pnlRoiAtual.roi;
        } else if (parseFloat(pnlRoiAtual.roi) < 0.0) {
          cacheJson.minRoi = pnlRoiAtual.roi;
        }

        await salvarCache(cacheJson, symbol);

        // cacheRisk[symbol].roiAtual = parseFloat(pnlRoiAtual.roi);


        if (parseFloat(pnlRoiAtual.roi) > parseFloat(process.env.TAKEPROFIT)
          // || parseFloat(pnlRoiAtual.roi) < parseFloat(process.env.STOPLOSS)
        ) {
          //await fecharPosicao(sideOrd, Math.abs(posicaoAberta.positionAmt));
        }


        if (parseFloat(pnlRoiAtual.roi) > 75.0) {
          //cacheRisk[symbol].posicionando = false;
          //setLock(symbol, false); // Unlock
          console.log(`🔓 Lock removido em ${symbol} ROI=${pnlRoiAtual.roi}%`);

        } else if (parseFloat(pnlRoiAtual.roi) < 75.0) {
          //cacheRisk[symbol].posicionando = true;
          //setLock(symbol, true); // Lock
          console.log(`🔒 Lock aplicado em ${symbol} ROI=${pnlRoiAtual.roi}%`);
        }

        if (parseFloat(pnlRoiAtual.roi) <= -50.0) {
          //cacheRisk[symbol].posicionando = false;
          //setLock(symbol, false); // Unlock
          console.log(`🔓 Lock removido em ${symbol} ROI=${pnlRoiAtual.roi}%`);
          //await fecharPosicao(sideOrd, Math.abs(posicaoAberta.positionAmt));
        }

        await salvarCache(cacheRisk, 'Risk');

        let novoStop50 = await precoAlvoPorPercent(sideOrd, parseFloat(process.env.STOPLOSS), parseFloat(posicaoAberta.entryPrice), symbol);

        let stopRange50 = parseFloat(pnlRoiAtual.roi) - parseFloat(50.0);

        //let novoStop = await precoAlvoPorPercent(sideOrd, stopRange50, parseFloat(posicaoAberta.entryPrice), symbol);



        //novoStop = await precoAlvoPorPercent(sideOrd, stopRange50, parseFloat(posicaoAberta.entryPrice), symbol);

        //novoStop = novoStoplt;

        if (sideOrd == 'BUY') {

          /*
          if (fibo4h.dir == 1) {

            if (parseFloat(preco_atual) < parseFloat(fibo4h.retr0786) &&
              parseFloat(preco_atual) > parseFloat(fibo4h.retr1)
            ) {
              novoStop = parseFloat(fibo4h.retr1) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo4h.retr0618) &&
              parseFloat(preco_atual) > parseFloat(fibo4h.retr0786)
            ) {
              novoStop = parseFloat(fibo4h.retr0786) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo4h.retr05) &&
              parseFloat(preco_atual) > parseFloat(fibo4h.retr0618)
            ) {
              novoStop = parseFloat(fibo4h.retr0618) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo4h.retr0382) &&
              parseFloat(preco_atual) > parseFloat(fibo4h.retr05)
            ) {
              novoStop = parseFloat(fibo4h.retr05) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo4h.retr0236) &&
              parseFloat(preco_atual) > parseFloat(fibo4h.retr0382)
            ) {
              novoStop = parseFloat(fibo4h.retr0382) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo4h.retr0) &&
              parseFloat(preco_atual) > parseFloat(fibo4h.retr0236)
            ) {
              novoStop = parseFloat(fibo4h.retr0236) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo4h.retr0618Neg) &&
              parseFloat(preco_atual) > parseFloat(fibo4h.retr0)
            ) {
              novoStop = parseFloat(fibo4h.retr0) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo4h.retr1618Neg) &&
              parseFloat(preco_atual) > parseFloat(fibo4h.retr0618Neg)
            ) {
              novoStop = parseFloat(fibo4h.retr0618Neg) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo4h.retr2618Neg) &&
              parseFloat(preco_atual) > parseFloat(fibo4h.retr3236Neg)
            ) {
              novoStop = parseFloat(fibo4h.retr3236Neg) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo4h.retr3236Neg)) {
              novoStop = parseFloat(maiorMedia3m) - (parseFloat(tickSize) * 3);
            }

          } else if (fibo4h.dir == -1) {

            if (parseFloat(preco_atual) < parseFloat(fibo4h.retr0236) &&
              parseFloat(preco_atual) > parseFloat(fibo4h.retr0)
            ) {
              novoStop = parseFloat(fibo4h.retr0) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo4h.retr0382) &&
              parseFloat(preco_atual) > parseFloat(fibo4h.retr0236)
            ) {
              novoStop = parseFloat(fibo4h.retr0236) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo4h.retr05) &&
              parseFloat(preco_atual) > parseFloat(fibo4h.retr0382)
            ) {
              novoStop = parseFloat(fibo4h.retr0382) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo4h.retr0618) &&
              parseFloat(preco_atual) > parseFloat(fibo4h.retr05)
            ) {
              novoStop = parseFloat(fibo4h.retr05) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo4h.retr0786) &&
              parseFloat(preco_atual) > parseFloat(fibo4h.retr0618)
            ) {
              novoStop = parseFloat(fibo4h.retr0618) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo4h.retr1) &&
              parseFloat(preco_atual) > parseFloat(fibo4h.retr0786)
            ) {
              novoStop = parseFloat(fibo4h.retr0786) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo4h.retr1618) &&
              parseFloat(preco_atual) > parseFloat(fibo4h.retr1)
            ) {
              novoStop = parseFloat(fibo4h.retr1) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo4h.retr2618) &&
              parseFloat(preco_atual) > parseFloat(fibo4h.retr1618)
            ) {
              novoStop = parseFloat(fibo4h.retr1618) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo4h.retr3618) &&
              parseFloat(preco_atual) > parseFloat(fibo4h.retr2618)
            ) {
              novoStop = parseFloat(fibo4h.retr2618) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo4h.retr4236) &&
              parseFloat(preco_atual) > parseFloat(fibo4h.retr3618)
            ) {
              novoStop = parseFloat(fibo4h.retr3618) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo4h.retr4236)) {
              novoStop = parseFloat(menorMedia3m) - (parseFloat(tickSize) * 3);
            }

          }

          if (fibo1h.dir == 1) {

            if (parseFloat(preco_atual) < parseFloat(fibo1h.retr0786) &&
              parseFloat(preco_atual) > parseFloat(fibo1h.retr1)
            ) {
              novoStop = parseFloat(fibo1h.retr1) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo1h.retr0618) &&
              parseFloat(preco_atual) > parseFloat(fibo1h.retr0786)
            ) {
              novoStop = parseFloat(fibo1h.retr0786) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo1h.retr05) &&
              parseFloat(preco_atual) > parseFloat(fibo1h.retr0618)
            ) {
              novoStop = parseFloat(fibo1h.retr0618) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo1h.retr0382) &&
              parseFloat(preco_atual) > parseFloat(fibo1h.retr05)
            ) {
              novoStop = parseFloat(fibo1h.retr05) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo1h.retr0236) &&
              parseFloat(preco_atual) > parseFloat(fibo1h.retr0382)
            ) {
              novoStop = parseFloat(fibo1h.retr0382) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo1h.retr0) &&
              parseFloat(preco_atual) > parseFloat(fibo1h.retr0236)
            ) {
              novoStop = parseFloat(fibo1h.retr0236) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo1h.retr0618Neg) &&
              parseFloat(preco_atual) > parseFloat(fibo1h.retr0)
            ) {
              novoStop = parseFloat(fibo1h.retr0) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo1h.retr1618Neg) &&
              parseFloat(preco_atual) > parseFloat(fibo1h.retr0618Neg)
            ) {
              novoStop = parseFloat(fibo1h.retr0618Neg) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo1h.retr2618Neg) &&
              parseFloat(preco_atual) > parseFloat(fibo1h.retr3236Neg)
            ) {
              novoStop = parseFloat(fibo1h.retr3236Neg) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo1h.retr3236Neg)) {
              novoStop = parseFloat(maiorMedia3m) - (parseFloat(tickSize) * 3);
            }

          } else if (fibo1h.dir == -1) {

            if (parseFloat(preco_atual) < parseFloat(fibo1h.retr0236) &&
              parseFloat(preco_atual) > parseFloat(fibo1h.retr0)
            ) {
              novoStop = parseFloat(fibo1h.retr0) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo1h.retr0382) &&
              parseFloat(preco_atual) > parseFloat(fibo1h.retr0236)
            ) {
              novoStop = parseFloat(fibo1h.retr0236) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo1h.retr05) &&
              parseFloat(preco_atual) > parseFloat(fibo1h.retr0382)
            ) {
              novoStop = parseFloat(fibo1h.retr0382) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo1h.retr0618) &&
              parseFloat(preco_atual) > parseFloat(fibo1h.retr05)
            ) {
              novoStop = parseFloat(fibo1h.retr05) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo1h.retr0786) &&
              parseFloat(preco_atual) > parseFloat(fibo1h.retr0618)
            ) {
              novoStop = parseFloat(fibo1h.retr0618) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo1h.retr1) &&
              parseFloat(preco_atual) > parseFloat(fibo1h.retr0786)
            ) {
              novoStop = parseFloat(fibo1h.retr0786) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo1h.retr1618) &&
              parseFloat(preco_atual) > parseFloat(fibo1h.retr1)
            ) {
              novoStop = parseFloat(fibo1h.retr1) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo1h.retr2618) &&
              parseFloat(preco_atual) > parseFloat(fibo1h.retr1618)
            ) {
              novoStop = parseFloat(fibo1h.retr1618) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo1h.retr3618) &&
              parseFloat(preco_atual) > parseFloat(fibo1h.retr2618)
            ) {
              novoStop = parseFloat(fibo1h.retr2618) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo1h.retr4236) &&
              parseFloat(preco_atual) > parseFloat(fibo1h.retr3618)
            ) {
              novoStop = parseFloat(fibo1h.retr3618) - (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo1h.retr4236)) {
              novoStop = parseFloat(menorMedia3m) - (parseFloat(tickSize) * 3);
            }

          }
          */

          //novoStop = candles15m.slice(-2)[0].low;


          if (parseFloat(novoStop) <= (parseFloat(liquidationPrice) + (parseFloat(tickSize) * 10))) {
            novoStop = parseFloat(liquidationPrice) + (parseFloat(tickSize) * 10);
          }
          /*
                    if (parseFloat(novoStop) <= parseFloat(novoStop50)) {
                      novoStop = parseFloat(novoStop50);
                    }
          
                    if (parseFloat(pnlRoiAtual.roi) > 75.0) {
                      if (parseFloat(novoStop) <= parseFloat(posicaoAberta.entryPrice)) {
                        //novoStop = parseFloat(posicaoAberta.entryPrice);
                      }
                    }
                      */
        } else if (sideOrd == 'SELL') {

          /*
          if (fibo4h.dir == -1) {

            if (parseFloat(preco_atual) > parseFloat(fibo4h.retr0786) &&
              parseFloat(preco_atual) < parseFloat(fibo4h.retr1)
            ) {
              novoStop = parseFloat(fibo4h.retr1) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo4h.retr0618) &&
              parseFloat(preco_atual) < parseFloat(fibo4h.retr0786)
            ) {
              novoStop = parseFloat(fibo4h.retr0786) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo4h.retr05) &&
              parseFloat(preco_atual) < parseFloat(fibo4h.retr0618)
            ) {
              novoStop = parseFloat(fibo4h.retr0618) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo4h.retr0382) &&
              parseFloat(preco_atual) < parseFloat(fibo4h.retr05)
            ) {
              novoStop = parseFloat(fibo4h.retr05) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo4h.retr0236) &&
              parseFloat(preco_atual) < parseFloat(fibo4h.retr0382)
            ) {
              novoStop = parseFloat(fibo4h.retr0382) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo4h.retr0) &&
              parseFloat(preco_atual) < parseFloat(fibo4h.retr0236)
            ) {
              novoStop = parseFloat(fibo4h.retr0236) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo4h.retr0618Neg) &&
              parseFloat(preco_atual) < parseFloat(fibo4h.retr0)
            ) {
              novoStop = parseFloat(fibo4h.retr0) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo4h.retr1618Neg) &&
              parseFloat(preco_atual) < parseFloat(fibo4h.retr0618Neg)
            ) {
              novoStop = parseFloat(fibo4h.retr0618Neg) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo4h.retr2618Neg) &&
              parseFloat(preco_atual) < parseFloat(fibo4h.retr1618Neg)
            ) {
              novoStop = parseFloat(fibo4h.retr1618Neg) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo4h.retr3236Neg) &&
              parseFloat(preco_atual) < parseFloat(fibo4h.retr2618Neg)
            ) {
              novoStop = parseFloat(fibo4h.retr2618Neg) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo4h.retr3236Neg)) {
              novoStop = parseFloat(maiorMedia3m) + (parseFloat(tickSize) * 3);
            }

          } else if (fibo4h.dir == 1) {

            if (parseFloat(preco_atual) > parseFloat(fibo4h.retr0236) &&
              parseFloat(preco_atual) < parseFloat(fibo4h.retr0)
            ) {
              novoStop = parseFloat(fibo4h.retr0) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo4h.retr0382) &&
              parseFloat(preco_atual) < parseFloat(fibo4h.retr0236)
            ) {
              novoStop = parseFloat(fibo4h.retr0236) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo4h.retr05) &&
              parseFloat(preco_atual) < parseFloat(fibo4h.retr0382)
            ) {
              novoStop = parseFloat(fibo4h.retr0382) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo4h.retr0618) &&
              parseFloat(preco_atual) < parseFloat(fibo4h.retr05)
            ) {
              novoStop = parseFloat(fibo4h.retr05) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo4h.retr0786) &&
              parseFloat(preco_atual) < parseFloat(fibo4h.retr0618)
            ) {
              novoStop = parseFloat(fibo4h.retr0618) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo4h.retr1) &&
              parseFloat(preco_atual) < parseFloat(fibo4h.retr0786)
            ) {
              novoStop = parseFloat(fibo4h.retr0786) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo4h.retr1618) &&
              parseFloat(preco_atual) < parseFloat(fibo4h.retr1)
            ) {
              novoStop = parseFloat(fibo4h.retr1) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo4h.retr2618) &&
              parseFloat(preco_atual) < parseFloat(fibo4h.retr1618)
            ) {
              novoStop = parseFloat(fibo4h.retr1618) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo4h.retr3618) &&
              parseFloat(preco_atual) < parseFloat(fibo4h.retr2618)
            ) {
              novoStop = parseFloat(fibo4h.retr2618) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo4h.retr4236) &&
              parseFloat(preco_atual) < parseFloat(fibo4h.retr3618)
            ) {
              novoStop = parseFloat(fibo4h.retr3618) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo4h.retr4236)) {
              novoStop = parseFloat(maiorMedia3m) + (parseFloat(tickSize) * 3);
            }

          }

          if (fibo1h.dir == -1) {

            if (parseFloat(preco_atual) > parseFloat(fibo1h.retr0786) &&
              parseFloat(preco_atual) < parseFloat(fibo1h.retr1)
            ) {
              novoStop = parseFloat(fibo1h.retr1) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo1h.retr0618) &&
              parseFloat(preco_atual) < parseFloat(fibo1h.retr0786)
            ) {
              novoStop = parseFloat(fibo1h.retr0786) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo1h.retr05) &&
              parseFloat(preco_atual) < parseFloat(fibo1h.retr0618)
            ) {
              novoStop = parseFloat(fibo1h.retr0618) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo1h.retr0382) &&
              parseFloat(preco_atual) < parseFloat(fibo1h.retr05)
            ) {
              novoStop = parseFloat(fibo1h.retr05) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo1h.retr0236) &&
              parseFloat(preco_atual) < parseFloat(fibo1h.retr0382)
            ) {
              novoStop = parseFloat(fibo1h.retr0382) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo1h.retr0) &&
              parseFloat(preco_atual) < parseFloat(fibo1h.retr0236)
            ) {
              novoStop = parseFloat(fibo1h.retr0236) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo1h.retr0618Neg) &&
              parseFloat(preco_atual) < parseFloat(fibo1h.retr0)
            ) {
              novoStop = parseFloat(fibo1h.retr0) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo1h.retr1618Neg) &&
              parseFloat(preco_atual) < parseFloat(fibo1h.retr0618Neg)
            ) {
              novoStop = parseFloat(fibo1h.retr0618Neg) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo1h.retr2618Neg) &&
              parseFloat(preco_atual) < parseFloat(fibo1h.retr1618Neg)
            ) {
              novoStop = parseFloat(fibo1h.retr1618Neg) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo1h.retr3236Neg) &&
              parseFloat(preco_atual) < parseFloat(fibo1h.retr2618Neg)
            ) {
              novoStop = parseFloat(fibo1h.retr2618Neg) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo1h.retr3236Neg)) {
              novoStop = parseFloat(maiorMedia3m) + (parseFloat(tickSize) * 3);
            }

          } else if (fibo1h.dir == 1) {

            if (parseFloat(preco_atual) > parseFloat(fibo1h.retr0236) &&
              parseFloat(preco_atual) < parseFloat(fibo1h.retr0)
            ) {
              novoStop = parseFloat(fibo1h.retr0) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo1h.retr0382) &&
              parseFloat(preco_atual) < parseFloat(fibo1h.retr0236)
            ) {
              novoStop = parseFloat(fibo1h.retr0236) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo1h.retr05) &&
              parseFloat(preco_atual) < parseFloat(fibo1h.retr0382)
            ) {
              novoStop = parseFloat(fibo1h.retr0382) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo1h.retr0618) &&
              parseFloat(preco_atual) < parseFloat(fibo1h.retr05)
            ) {
              novoStop = parseFloat(fibo1h.retr05) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo1h.retr0786) &&
              parseFloat(preco_atual) < parseFloat(fibo1h.retr0618)
            ) {
              novoStop = parseFloat(fibo1h.retr0618) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo1h.retr1) &&
              parseFloat(preco_atual) < parseFloat(fibo1h.retr0786)
            ) {
              novoStop = parseFloat(fibo1h.retr0786) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo1h.retr1618) &&
              parseFloat(preco_atual) < parseFloat(fibo1h.retr1)
            ) {
              novoStop = parseFloat(fibo1h.retr1) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo1h.retr2618) &&
              parseFloat(preco_atual) < parseFloat(fibo1h.retr1618)
            ) {
              novoStop = parseFloat(fibo1h.retr1618) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo1h.retr3618) &&
              parseFloat(preco_atual) < parseFloat(fibo1h.retr2618)
            ) {
              novoStop = parseFloat(fibo1h.retr2618) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) > parseFloat(fibo1h.retr4236) &&
              parseFloat(preco_atual) < parseFloat(fibo1h.retr3618)
            ) {
              novoStop = parseFloat(fibo1h.retr3618) + (parseFloat(tickSize) * 3);
            }

            if (parseFloat(preco_atual) < parseFloat(fibo1h.retr4236)) {
              novoStop = parseFloat(maiorMedia3m) + (parseFloat(tickSize) * 3);
            }

          }
          */

          //novoStop = candles15m.slice(-2)[0].high;


          if (parseFloat(novoStop) >= (parseFloat(liquidationPrice) - (parseFloat(tickSize) * 10))) {
            novoStop = parseFloat(liquidationPrice) - (parseFloat(tickSize) * 10);
          }
          /*
                    if (parseFloat(novoStop) >= parseFloat(novoStop50)) {
                      novoStop = parseFloat(novoStop50);
                    }
                    if (parseFloat(pnlRoiAtual.roi) > 100.0) {
                      if (parseFloat(novoStop) >= parseFloat(posicaoAberta.entryPrice)) {
                        //novoStop = parseFloat(posicaoAberta.entryPrice);
                      }
                    }
                      */
        }
        /*
                let novoStoplt = null;
                if (sideOrd == 'BUY') {
                  novoStoplt = parseFloat(ltaltb3m.lta) - parseFloat(tickSize * 5);
                } else if (sideOrd == 'SELL') {
                  novoStoplt = parseFloat(ltaltb3m.ltb) + parseFloat(tickSize * 5);
                }
        
                let novoStopcdl = null;
                if (sideOrd == 'BUY') {
                  novoStopcdl = parseFloat(candles3m.slice(-1)[0].low) - parseFloat(tickSize * 3);
                } else if (sideOrd == 'SELL') {
                  novoStopcdl = parseFloat(candles3m.slice(-1)[0].high) + parseFloat(tickSize * 3);
                }
        */
        /*
                let novoStopMm = null;
                if (sideOrd == 'BUY') {
                  //novoStopMm = parseFloat(menorMedia3m) - parseFloat(tickSize * 10);
                  novoStop = candles15m.slice(-1)[0].low;
        
                } else if (sideOrd == 'SELL') {
                  //novoStopMm = parseFloat(maiorMedia3m) + parseFloat(tickSize * 10);
                  novoStop = candles15m.slice(-1)[0].high;
        
                }
        */
        if (sideOrd == 'BUY') {
          //novoStop = candles15m.slice(-2)[0].low - (parseFloat(tickSize) * 1);

        } else if (sideOrd == 'SELL') {
          //novoStop = candles15m.slice(-2)[0].high + (parseFloat(tickSize) * 1);

        }


        //novoStop = novoStopMm;

        //novoStop = await precoAlvoPorPercent(sideOrd, parseFloat(process.env.STOPLOSS), parseFloat(posicaoAberta.entryPrice), symbol);

        if (sideOrd == 'BUY') {
          //novoStop = candles15m.slice(-2)[0].low - (parseFloat(tickSize) * 1);
          novoStop = await precoAlvoPorPercent(sideOrd, parseFloat(process.env.STOPLOSS), parseFloat(menorM3m20p), symbol);

        } else if (sideOrd == 'SELL') {
          //novoStop = candles15m.slice(-2)[0].high + (parseFloat(tickSize) * 1);
          novoStop = await precoAlvoPorPercent(sideOrd, parseFloat(process.env.STOPLOSS), parseFloat(maiorM3m20p), symbol);
        }

        novoTake = await precoAlvoPorPercent(sideOrd, parseFloat(process.env.TAKEPROFIT), parseFloat(posicaoAberta.entryPrice), symbol);

        if (stopAtivo === null || stopAtivo === undefined) {

          //if (novoStop !== null && novoStop !== undefined) {

          //let novoStop = novoStoplt;
          //stopAtivo = await criarStopLoss(sideOrd, novoStop);

          ////stopAtivo = await criarStopLoss(novoStop);

          //}

        }
        else if (stopAtivo !== null && stopAtivo !== undefined) {
          if (parseFloat(parseFloat(stopAtivo.price).toFixed(precisions.pricePrecision)) !== parseFloat(parseFloat(novoStop).toFixed(precisions.pricePrecision))) {
            //await cancelarTodasOrdens();
            if ((sideOrd == 'BUY' && stopAtivo.price < novoStop) ||
              (sideOrd == 'SELL' && stopAtivo.price > novoStop)
            ) {


              console.log(`Stop alterado: ${stopAtivo.price} / ${novoStop}`);
              //await atualizarStop(sideOrd, novoStop);
              if (stopAtivo.price !== null) {
                //await abrirPosicao(sideOrd, (quantity / 4));
              }
            }
          }
        }

        if (takeAtivo !== undefined) {
          if (takeAtivo.price == null) {
            //takeAtivo = await criarTakeProfit(novoTake);

          }

        }
        if (takeAtivo === null || takeAtivo === undefined) {

          //takeAtivo = await criarTakeProfit(novoTake);
          //takeAtivo = await criarTakeProfit(novoTake);

        }
        else if (takeAtivo !== null && takeAtivo !== undefined) {
          if (parseFloat(takeAtivo.price).toFixed(precisions.pricePrecision) !== parseFloat(parseFloat(novoTake).toFixed(precisions.pricePrecision))) {
            //await cancelarTodasOrdens();

            console.log(`Take alterado: ${takeAtivo.price} / ${novoTake}`);
            //await atualizarTake(novoTake);
            //takeAtivo = await criarTakeProfit(novoTake);  
          }
        }


        //novoStop = await precoAlvoPorPercent(sideOrd, percent, parseFloat(posicaoAberta.entryPrice), symbol);
        /*
          if(parseFloat(roiPosTr.roiMax) >= 50
                //&& parseFloat(pnlRoiAtual.roi) < 100
                ){
                  
                  novoStop = await precoAlvoPorPercent(sideOrd, -30, parseFloat(posicaoAberta.entryPrice), symbol);
          
                  console.log(`Stop alterado: ${stopAtivo.price} / ${novoStop}`);
                 await atualizarStop(sideOrd, novoStop);  
                  
                  //await fecharPosicao(sideOrd, Math.abs(posicaoAberta.positionAmt)); 
                }
          if(parseFloat(roiPosTr.roiMax) >= 100
                //&& parseFloat(pnlRoiAtual.roi) < 100
                ){
                  
                  novoStop = await precoAlvoPorPercent(sideOrd, 25, parseFloat(posicaoAberta.entryPrice), symbol);
          
                  console.log(`Stop alterado: ${stopAtivo.price} / ${novoStop}`);
                 await atualizarStop(sideOrd, novoStop);  
                  
                  //await fecharPosicao(sideOrd, Math.abs(posicaoAberta.positionAmt)); 
                }
          if(parseFloat(roiPosTr.roiMax) >= 150
                //&& parseFloat(pnlRoiAtual.roi) < 100
                ){
                  
                  novoStop = await precoAlvoPorPercent(sideOrd, 100, parseFloat(posicaoAberta.entryPrice), symbol);
          
                  console.log(`Stop alterado: ${stopAtivo.price} / ${novoStop}`);
                 await atualizarStop(sideOrd, novoStop);  
                  
                  //await fecharPosicao(sideOrd, Math.abs(posicaoAberta.positionAmt)); 
                }
         if(parseFloat(roiPosTr.roiMax) >= 200
                //&& parseFloat(pnlRoiAtual.roi) < 200
                ){
                  
                  novoStop = await precoAlvoPorPercent(sideOrd, 150, parseFloat(posicaoAberta.entryPrice), symbol);
          
                  console.log(`Stop alterado: ${stopAtivo.price} / ${novoStop}`);
                  await atualizarStop(sideOrd, novoStop);  
                  
                }
          if(parseFloat(roiPosTr.roiMax) >= 250
                //&& parseFloat(pnlRoiAtual.roi) < 300
                ){
                  
                  novoStop = await precoAlvoPorPercent(sideOrd, 200, parseFloat(posicaoAberta.entryPrice), symbol);
          
                  console.log(`Stop alterado: ${stopAtivo.price} / ${novoStop}`);
                  await atualizarStop(sideOrd, novoStop);   
                  
                }
          if(parseFloat(roiPosTr.roiMax) >= 300
                //&& parseFloat(pnlRoiAtual.roi) < 400
                ){
                  
                  novoStop = await precoAlvoPorPercent(sideOrd, 250, parseFloat(posicaoAberta.entryPrice), symbol);
          
                  console.log(`Stop alterado: ${stopAtivo.price} / ${novoStop}`);
                  await atualizarStop(sideOrd, novoStop);   
                }
          if(parseFloat(roiPosTr.roiMax) >= 350
                //&& parseFloat(pnlRoiAtual.roi) < 500
                ){
                  
                  novoStop = await precoAlvoPorPercent(sideOrd, 300, parseFloat(posicaoAberta.entryPrice), symbol);
          
                  console.log(`Stop alterado: ${stopAtivo.price} / ${novoStop}`);
                  await atualizarStop(sideOrd, novoStop);   
                }
          if(parseFloat(roiPosTr.roiMax) >= 400
                //&& parseFloat(pnlRoiAtual.roi) < 600
                ){
                  
                  novoStop = await precoAlvoPorPercent(sideOrd, 350, parseFloat(posicaoAberta.entryPrice), symbol);
          
                  console.log(`Stop alterado: ${stopAtivo.price} / ${novoStop}`);
                  await atualizarStop(sideOrd, novoStop);   
                }
          if(parseFloat(roiPosTr.roiMax) >= 450
                //&& parseFloat(pnlRoiAtual.roi) < 700
                ){
                  novoStop = await precoAlvoPorPercent(sideOrd, 400, parseFloat(posicaoAberta.entryPrice), symbol);
          
                  console.log(`Stop alterado: ${stopAtivo.price} / ${novoStop}`);
                  await atualizarStop(sideOrd, novoStop);   
                }
          if(parseFloat(roiPosTr.roiMax) >= 500
                //&& parseFloat(pnlRoiAtual.roi) < 800
                ){
                  novoStop = await precoAlvoPorPercent(sideOrd, 450, parseFloat(posicaoAberta.entryPrice), symbol);
          
                  console.log(`Stop alterado: ${stopAtivo.price} / ${novoStop}`);
                  await atualizarStop(sideOrd, novoStop);   
                }
          if(parseFloat(roiPosTr.roiMax) >= 550
                // && parseFloat(pnlRoiAtual.roi) < 900
                ){
                  
                  novoStop = await precoAlvoPorPercent(sideOrd, 500, parseFloat(posicaoAberta.entryPrice), symbol);
          
                  console.log(`Stop alterado: ${stopAtivo.price} / ${novoStop}`);
                  await atualizarStop(sideOrd, novoStop);   
                }
          if(parseFloat(roiPosTr.roiMax) >= 600
                // && parseFloat(pnlRoiAtual.roi) < 900
                ){
                  
                  novoStop = await precoAlvoPorPercent(sideOrd, 550, parseFloat(posicaoAberta.entryPrice), symbol);
          
                  console.log(`Stop alterado: ${stopAtivo.price} / ${novoStop}`);
                  await atualizarStop(sideOrd, novoStop);   
                }
            if(parseFloat(roiPosTr.roiMax) >= 650
                // && parseFloat(pnlRoiAtual.roi) < 900
                ){
                  
                  novoStop = await precoAlvoPorPercent(sideOrd, 600, parseFloat(posicaoAberta.entryPrice), symbol);
          
                  console.log(`Stop alterado: ${stopAtivo.price} / ${novoStop}`);
                  await atualizarStop(sideOrd, novoStop);   
                }
          // await setTimeout(30000);
          // await delay(30000); // Espera 3 segundos
        */
      }
      /*
            posicaoAberta = await verificarSeTemPosicao();
            parentPort.postMessage(`✅ iniciarWebSocketContinuo / Posição: ${JSON.stringify(posicaoAberta, null, 2)} `);
      
            if (gatilhoAtivado === true) {
      
              if (posicaoAberta === null || posicaoAberta === undefined) {
      
                releaseLock(symbol); // Unlock
                console.log(`🔓 Lock inexistente em ${symbol}`);
      
                //const hist = roiTracker.closePosition(symbol);
                //console.log("Fechada:", hist);
                // let cacheRiskAux = await carregarCache('Risk');
                // quantity = await getQntbyBalance();
      
                await notificWin(preco_atual, symbol, 'monitAtv', sideM);
      
                //let lock = hasAnyLock();
      
                // parentPort.postMessage(`hasAnyLock: ${JSON.stringify(lock)}`);
      
                if (
                  (
                    sideOrd == 'BUY' &&
                    parseFloat(preco_atual) >= parseFloat(ltaltb5m.lta) &&
                    (
                      parseFloat(candles1m.slice(-1)[0].low) <= parseFloat(ltaltb1m.lta) + (parseFloat(tickSize) * 5) ||
                      parseFloat(candles1m.slice(-2)[0].low) <= parseFloat(ltaltb1m.lta) + (parseFloat(tickSize) * 5)
                    ) &&
                    parseFloat(preco_atual) >= parseFloat(ltaltb1m.lta) + (parseFloat(tickSize) * 5)
      
                  ) || (
      
                    sideOrd == 'SELL' &&
                    parseFloat(preco_atual) <= parseFloat(ltaltb5m.ltb) &&
                    (
                      parseFloat(candles1m.slice(-1)[0].high) <= parseFloat(ltaltb1m.ltb) - (parseFloat(tickSize) * 5) ||
                      parseFloat(candles1m.slice(-2)[0].high) <= parseFloat(ltaltb1m.ltb) - (parseFloat(tickSize) * 5)
                    ) &&
                    parseFloat(preco_atual) <= parseFloat(ltaltb1m.ltb) + (parseFloat(tickSize) * 5)
      
                  )
      
                ) {
      
                  if (nLocks < 10) {
                    cacheJson = {
                      houveReducao: 0,
                      houveAdicao: 0,
                      maxRoi: 0,
                      minRoi: 0
                    }
      
                    await salvarCache(cacheJson, symbol);
      
                    parentPort.postMessage(`----> abrindo posição.`);
      
                    quantity = await getQntbyBalance();
                    let returnPos = await abrirPosicao(sideOrd, quantity);
      
                    if (returnPos !== null && returnPos !== undefined) {
                      gatilhoAtivado = false;
                      setLock(symbol, true); // Lock
                      console.log(`🔒 Lock aplicado em ${symbol}.`);
      
                      if (sideOrd == 'BUY') {
                        //novoStop = parseFloat(menorMedia15m) - (parseFloat(tickSize) * 3);
                        if (parseFloat(novoStop) <= (parseFloat(liquidationPrice) + (parseFloat(tickSize) * 5))) {
                          //novoStop = parseFloat(liquidationPrice) + (parseFloat(tickSize) * 5);
                        }
                      } else if (sideOrd == 'SELL') {
                        //novoStop = parseFloat(maiorMedia15m) + (parseFloat(tickSize) * 3);
                        if (parseFloat(novoStop) >= (parseFloat(liquidationPrice) - (parseFloat(tickSize) * 5))) {
                          //novoStop = parseFloat(liquidationPrice) - (parseFloat(tickSize) * 5);
                        }
                      }
      
                      let novoStop = await precoAlvoPorPercent(sideOrd, -50, parseFloat(posicaoAberta.entryPrice), symbol);
      
                      //if (novoStop !== null && novoStop !== undefined) {
                      stopAtivo = await criarStopLoss(sideOrd, novoStop);
                      //}
                    }
                  } else {
                    //gatilhoAtivado = false;
                  }
                }
              }
            }
      */
    }

    if (posicaoAberta == 0 && ultimaPosicao !== 0 && ultimaPosicao !== undefined) {

      parentPort.postMessage(`✅ Posição encerrada. Parando STOP.`);

      const hist = roiTracker.closePosition(symbol);
      console.log("Fechada:", hist);

      ultimaPosicao = undefined;
      stopAtual = undefined;
      oldStop = undefined;
      novoStop = undefined;
      //await cancelarTodasOrdens();
    }

    ultimaPosicao = posicaoAberta;


  });

  ws.on('close', (code, reason) => {
    parentPort.postMessage(`[${symbol}] WebSocket fechado. Código: ${code}, Motivo: ${reason}`);
    setTimeout(iniciarWebSocketContinuo, 5000);
  });

  ws.on('error', (err) => {
    parentPort.postMessage(`[${symbol}] WebSocket erro: ${err.message}`);
    ws.terminate();
    setTimeout(iniciarWebSocketContinuo, 5000);
  });

}

async function startWorker() {

  const res = await apiAxiosSpot.get('/api/v3/time');
  const serverTime = res.data.serverTime;
  const localTime = Date.now();
  offset = serverTime - localTime;

  try {
    await carregarCandlesHistoricos();
    iniciarWebSocketcandles1m();
    iniciarWebSocketcandles3m();
    iniciarWebSocketcandles5m();
    iniciarWebSocketcandles15m();
    iniciarWebSocketcandles30m();
    iniciarWebSocketcandles1h();
    //iniciarWebSocketcandles4h();
    //   await monitorarGatilho();
    iniciarWebSocketMarkPrice();
    await iniciarWebSocketContinuo();
    //await monitorar30Minutos(); // se existir
  } catch (e) {
    parentPort.postMessage(`❌ Erro fatal no Worker: ${JSON.stringify(e.stack || e.message || e)}
 Reinício em 30s`);
    setTimeout(startWorker, 30000);
  }
}

(async () => {
  garantirCache();

  await startWorker();
  /*
  try {
    await carregarCandlesHistoricos();
    iniciarWebSocketcandles3m();
    iniciarWebSocketcandles15m();
    await monitorarGatilho();
    //iniciarWebSocketMarkPrice();
    //await monitorar30Minutos(); // se existir
  } catch (e) {
    parentPort.postMessage(`❌ Erro fatal no Worker: ${JSON.stringify(e.stack || e.message || e)}`);
    process.exit(1);
  }
  
  
  // Loop contínuo a cada X segundos
setInterval(() => {
  checarReducao( symbol);
}, 10000);
  
 */

})();


