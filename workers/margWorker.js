//Considere o worker nodejs abaixo

const WebSocket = require('ws');
const axios = require('axios');
const axiosRetry = require('axios-retry').default;
const crypto = require('crypto');
const notifier = require('node-notifier');
const { exec } = require('child_process');
const { parentPort, workerData } = require('worker_threads');
require('dotenv').config();
const EMA = require('technicalindicators').EMA;
const SMA = require('technicalindicators').SMA;

parentPort.postMessage(`✅ MargWorker iniciado.`);

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.SECRET_KEY;
const pMarg = process.env.PMARG;
const BASE_URL = 'https://fapi.binance.com';
//const symbol = workerData.symbol.toUpperCase();
//const wsSymbol = symbol.toLowerCase();
const api = require('../api');// worker.js
//const PnlManager = require('./marginManager');

const { activatePause } = require("./pauseManager");


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

let candles3m = [];
let candles5m = [];
let candles15m = [];
let candles1h = [];
let ema50 = [];
let ema60 = [];
let medias3m = null;
let medias5m = null;
let medias15m = null;
let medias1h = null;
let ultimaPosicao = undefined;
let posicaoAberta = undefined;
let ordemAtiva = undefined;
let takeAtivo = undefined;
let stopAtivo = undefined;
let anterior2 = null;
let alvoAtual = null;
let alvoAnterior = null;
let oldStop = null;
let oldStop2 = null;
let novoStop = null;
let liquidationPrice = null;
let sideOrd = undefined;
let gatilhoAtivado = false;
let monitoramentoAtivado = false;
let preco_atual = undefined;
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

let maiorMedia3m = undefined;
let menorMedia3m = undefined;
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

// const { setLock, getLock, hasAnyLock, countLocks, releaseLock } = require("../lockManager");

const fs = require('fs');
const path = require('path');
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
    throw new Error("Tipo de trade inválido! Use 'C' para compra ou 'V' para venda.");
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

  var objema = parseFloat(emaList[emaList.length - 1].toFixed(precisions.pricePrecision));

  const adjustedPrice = adjustPrice(objema, tickSize);


  return parseFloat(parseFloat(adjustedPrice).toFixed(precisions.pricePrecision));
}

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
  parentPort.postMessage('[ getBalance_Start ]');

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

async function carregarCandlesHistoricos() {

  precisions = await getSymbolPrecisions(symbol);
  console.log(precisions);
  tickSize = await getTickSize(symbol);

  /*
   
 try {
 const response = await apiAxios.get('/fapi/v1/klines', {
 params: {
 symbol: symbol,
 interval: '3m',
 //interval: '3m',
 limit: 400,
 recvWindow: 15000
 }
 });
 
 response.data.forEach(k => {  
   candles3m.push({  
     time: k[0],  
     open: parseFloat(k[1]),  
     high: parseFloat(k[2]),  
     low: parseFloat(k[3]),  
     close: parseFloat(k[4]),  
     isFinal: true  
   });  
 });  
 
 parentPort.postMessage(`✅ ${symbol} - Histórico de 400 candles3m carregado com sucesso.`);  
 
 const s50 = calcularSMA(100, candles3m);  
   const s60 = calcularSMA(110, candles3m);  
   const e50 = calcularEMA(100, candles3m);  
   const e60 = calcularEMA(110, candles3m);  
 
   if (s50 && s60 && e50 && e60) {  
     medias3m = [s50, s60, e50, e60];  
   }
   
 } catch (err) {
 parentPort.postMessage(`❌ Erro ao carregar histórico de candles3m: ${JSON.stringify(err.message)}`);
 }
 */

  try {
    const response = await apiAxios.get('/fapi/v1/klines', {
      params: {
        symbol: symbol,
        interval: '5m',
        //interval: '5m',
        limit: 400,
        recvWindow: 15000
      }
    });

    response.data.forEach(k => {
      candles5m.push({
        time: k[0],
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
        //interval: '3m',
        limit: 400,
        recvWindow: 15000
      }
    });

    response.data.forEach(k => {
      candles15m.push({
        time: k[0],
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

  /*
  
  try {
  const response = await apiAxios.get('/fapi/v1/klines', {
  params: {
  symbol: symbol,
  interval: '1h',
  //interval: '3m',
  limit: 400,
  recvWindow: 15000
  }
  });
  
  response.data.forEach(k => {  
    candles1h.push({  
      time: k[0],  
      open: parseFloat(k[1]),  
      high: parseFloat(k[2]),  
      low: parseFloat(k[3]),  
      close: parseFloat(k[4]),  
      isFinal: true  
    });  
  });  
  
  parentPort.postMessage(`✅ ${symbol} - Histórico de 400 candles1h carregado com sucesso.`);  
  
  const s100 = calcularSMA(100, candles1h);  
    const s110 = calcularSMA(110, candles1h);  
    const e100 = calcularEMA(100, candles1h);  
    const e110 = calcularEMA(110, candles1h);  
  
    if (s100 && s110 && e100 && e110) {  
      medias1h = [s100, s110, e100, e110];  
    }
    
  } catch (err) {
  parentPort.postMessage(`❌ Erro ao carregar histórico de candles1h: ${JSON.stringify(err.message)}`);
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

async function criarTakeProfit(side, takePrice) {
  parentPort.postMessage(`✅ Worker - criarTakeProfit`);
  let oppositeSide = sideOrd === 'BUY' ? 'SELL' : 'BUY';

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
    type: 'TAKE_PROFIT_MARKET',
    //stopPrice: adjustedStop.toFixed(precisions.pricePrecision),
    stopPrice: parseFloat(parseFloat(takePrice).toFixed(precisions.pricePrecision)),
    //quantity: parseFloat(parseFloat(quantity).toFixed(precisions.quantityPrecision)),
    timestamp: timestamp,
    closePosition: true,
    recvWindow: 15000
  };
  params.signature = gerarAssinatura(params);

  try {
    const res = await axios.post('https://fapi.binance.com/fapi/v1/order', null, {
      params,
      headers: { 'X-MBX-APIKEY': API_KEY }
    });
    parentPort.postMessage(`✅ Take (${oppositeSide}) criado @ ${takePrice}`);
    return res.data;
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

async function criarStopLoss(side, stopPrice) {
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
    type: 'STOP_MARKET',
    //stopPrice: adjustedStop.toFixed(precisions.pricePrecision),
    stopPrice: parseFloat(parseFloat(stopPrice).toFixed(precisions.pricePrecision)),
    //quantity: parseFloat(parseFloat(quantity).toFixed(precisions.quantityPrecision)),
    timestamp: timestamp,
    closePosition: true,
    recvWindow: 15000
  };
  params.signature = gerarAssinatura(params);

  try {
    const res = await axios.post('https://fapi.binance.com/fapi/v1/order', null, {
      params,
      headers: { 'X-MBX-APIKEY': API_KEY }
    });
    parentPort.postMessage(`✅ Stop (${oppositeSide}) criado @ ${stopPrice}`);
    return res.data;
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

async function abrirPosicao(side, quantityX) {
  parentPort.postMessage(`✅ Worker - abrirPosicao`);

  // Lado oposto para fechar a posição
  //const oppositeSide = side === 'BUY' ? 'SELL' : 'BUY';

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
  console.log(params);
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


      return pos; // && parseFloat(pos.positionAmt) !== 0;  
    } else if (type == 2) {
      return count;
    }

  } catch (err) {
    parentPort.postMessage(`❌ Erro ao verificar posição: ${JSON.stringify(err.response?.data || err.message)} `);
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

  stopAtivo = await criarStopLoss(side, novoStop);
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

function assinatura(query) {
  return crypto.createHmac('sha256', API_SECRET).update(query).digest('hex');
}

async function fecharTodasPosicoes() {
  try {
    let timestamp = Date.now() + offset;
    const query = `timestamp=${timestamp}`;
    const sign = assinatura(query);

    // 1️⃣ Obter todas as posições
    const { data: posicoes } = await axios.get(`${BASE_URL}/fapi/v2/positionRisk?${query}&signature=${sign}`, {
      headers: { 'X-MBX-APIKEY': API_KEY }
    });

    for (const pos of posicoes) {
      const quantidade = parseFloat(pos.positionAmt);
      if (quantidade !== 0) {
        // Detecta direção contrária
        const side = quantidade > 0 ? 'SELL' : 'BUY';
        const symbol = pos.symbol;

        console.log(`Fechando ${symbol} - Qtd: ${quantidade} - Side: ${side}`);

        const ordQuery = `symbol=${symbol}&side=${side}&type=MARKET&quantity=${Math.abs(quantidade)}&reduceOnly=true&timestamp=${timestamp}`;
        const ordSign = assinatura(ordQuery);

        // 2️⃣ Enviar ordem de fechamento
        await axios.post(`${BASE_URL}/fapi/v1/order?${ordQuery}&signature=${ordSign}`, null, {
          headers: { 'X-MBX-APIKEY': API_KEY }
        });
      }
    }

    console.log('✅ Todas as posições foram fechadas.');

    return true;

  } catch (erro) {
    console.error('❌ Erro ao fechar posições:', erro.response?.data || erro.message);

    return false;
  }
}

function percentage(iniValue, finValue) {
  //return (100 * partialValue) / totalValue;
  return (((finValue - iniValue) / iniValue) * 100);
}

function toFixedNumber(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return 0.0;
  return parseFloat(parseFloat(value).toFixed(decimals));
}

async function transferir(asset, amount, type) {

  /*

MAIN_UMFUTURE : Spot -> USDⓈ-M Futures
MAIN_FUNDING : Spot -> Funding
UMFUTURE_MAIN : USDⓈ-M Futures -> Spot account
UMFUTURE_FUNDING : USDⓈ-M Futures -> Funding
FUNDING_MAIN : Funding -> Spot
FUNDING_UMFUTURE : Funding -> USDⓈ-M Futures

  */

  let timestamp = Date.now() + offset;

  const query = `type=${type}&asset=${asset}&amount=${amount}&timestamp=${timestamp}`;

  const sign = assinatura(query);

  const data = `${query}&signature=${sign}`;

  const params = new URLSearchParams();
  params.append("type", type);
  params.append("asset", asset);
  params.append("amount", amount);
  params.append("timestamp", timestamp);
  params.append("signature", sign);

  try {

    const res = await axios.post(`https://api.binance.com/sapi/v1/asset/transfer?`, params, {
      headers: { 'X-MBX-APIKEY': API_KEY }
    });

    const tranId = res.data?.tranId || null;
    console.log("✅ Transfer OK:", tranId);
    return tranId; // 🔥 retorna só o ID da transação
  } catch (err) {
    console.error("❌ Erro:", err.response?.data || err.message);
    return null; // 🔥 retorna null em caso de erro
  }
}

async function monitorarMargem() {

  parentPort.postMessage(`✅ [--- Worker monitorarMargem ---]`);

  // Função utilitária para data (formato AAAA-MM-DD)
  function getCurrentDay() {
    const d = new Date();
    return d.toISOString().split("T")[0];
  }

  // Função utilitária para normalizar floats
  function toFixedNumber(value, decimals = 2) {
    if (value === null || value === undefined || isNaN(value)) return 0.0;
    return parseFloat(parseFloat(value).toFixed(decimals));
  }

  let balanceHist = await carregarCache('BalanceHist');
  let balance = await getBalance();
  let oldBalance = undefined;

  if (balance == null || balance == undefined) return;

  oldBalance = await carregarCache('oldBalance');

  if ((oldBalance && Object.keys(oldBalance).length === 0) || oldBalance === null || oldBalance === undefined) {
    //balance.initResetMarg = balance.walletBalance;
    await salvarCache(balance, 'oldBalance');
  }
await salvarCache(balance, 'Balance');
  //if(oldBalance.percent === null){
  //await salvarCache(balance, 'Balance');
  //}

  let perc = percentage(
    toFixedNumber(oldBalance.marginBalance),
    toFixedNumber(balance.marginBalance)
  );

  let percReal = percentage(
    toFixedNumber(oldBalance.walletBalance),
    toFixedNumber(balance.walletBalance)
  );
  

  oldBalance.percent = toFixedNumber(perc, 2);

  if (oldBalance.hasOwnProperty("maxPercent") === false) {
    oldBalance.maxPercent = oldBalance.percent;
  }

  if (oldBalance.hasOwnProperty("minPercent") === false) {
    oldBalance.minPercent = oldBalance.percent;
  }

  if (oldBalance.percent > oldBalance.maxPercent) {
    oldBalance.maxPercent = oldBalance.percent;
  } else if (oldBalance.percent < oldBalance.minPercent) {
    oldBalance.minPercent = oldBalance.percent;
  }

  oldBalance.lastUpdate = formatTime(Date.now());

  if (oldBalance.hasOwnProperty("asset") === false) {
    await salvarCache(balance, 'oldBalance');
  } else {
    await salvarCache(oldBalance, 'oldBalance');
  }

  if (balanceHist == {} || balanceHist == null || balanceHist[0] == undefined) {
    balanceHist = [];
    oldBalance.newBalance = toFixedNumber(balance.marginBalance, 2);
    balanceHist.push(oldBalance);
    await salvarCache(balanceHist, 'BalanceHist');
  }

  let resetData = await carregarCache('ResetCount');

  let resetHist = await carregarCache('ResetHist');

  parentPort.postMessage(`resetHist(-5): ${JSON.stringify(resetHist[resetHist.length - 5], null, 2)}`);
  parentPort.postMessage(`resetHist(-4): ${JSON.stringify(resetHist[resetHist.length - 4], null, 2)}`);
  parentPort.postMessage(`resetHist(-3): ${JSON.stringify(resetHist[resetHist.length - 3], null, 2)}`);
  parentPort.postMessage(`resetHist(-2): ${JSON.stringify(resetHist[resetHist.length - 2], null, 2)}`);
  parentPort.postMessage(`resetHist(-1): ${JSON.stringify(resetHist[resetHist.length - 1], null, 2)}`);
  parentPort.postMessage(`OldBalance: ${JSON.stringify(oldBalance, null, 2)}`);
  parentPort.postMessage(`Balance: ${JSON.stringify(balance, null, 2)}`);
  parentPort.postMessage(`perc: ${JSON.stringify(perc, null, 2)}`);
  parentPort.postMessage(`resetData: ${JSON.stringify(resetData, null, 2)}`);
  parentPort.postMessage(`Atualizado: ${formatTime(Date.now())}`);

  // ---- GATILHOS DE STOP ----
  if (
    parseFloat(perc) <= parseFloat(-30.0) || parseFloat(perc) >= parseFloat(5.0 ) || parseFloat(perc) >= parseFloat(90.0) // || parseFloat(percReal) >= parseFloat(1.0)  
      /* || parseFloat(percReal) <= parseFloat(-1.0) */
    /*
    || 
    (oldBalance.maxPercent >= 60.0 && perc <= 50.0) ||
    (oldBalance.maxPercent >= 50.0 && perc <= 40.0) ||
    (oldBalance.maxPercent >= 40.0 && perc <= 30.0) ||
    (oldBalance.maxPercent >= 30.0 && perc <= 20.0) ||
    (oldBalance.maxPercent >= 45.0 && perc <= 30.0) ||
    (oldBalance.maxPercent >= 15.0 && perc <= 2.0)
    */
  ) {

    // --- CONTADOR DE 24H ---
    let resetData = await carregarCache('ResetCount');
    const today = getCurrentDay();

    if (!resetData || resetData.lastResetDay !== today) {
      resetData = {
        lastResetDay: today,
        resetCount: 0,
        positiveCount: 0,
        negativeCount: 0,
        lastResult: null
      };
    }

    resetData.resetCount++;

    // valores tratados
    const oldVal = toFixedNumber(oldBalance.marginBalance, 2);
    const newVal = toFixedNumber(balance.marginBalance, 2);
    const percChange = toFixedNumber(((newVal - oldVal) / oldVal) * 100, 2);

    let result = "neutro";
    if (newVal > oldVal) {
      resetData.positiveCount++;
      result = "positivo";
    } else if (newVal < oldVal) {
      resetData.negativeCount++;
      result = "negativo";
    }

    resetData.lastResult = result;

    await salvarCache(resetData, 'ResetCount');

    // --- HISTÓRICO DETALHADO ---
    let resetHist = await carregarCache('ResetHist');
    if (!Array.isArray(resetHist)) resetHist = [];

    resetHist.push({
      date: formatTime(Date.now()),
      initialMargin: oldVal,
      finalMargin: newVal,
      percentChange: percChange,
      result: result,
      dailyCounters: { ...resetData }
    });

    await salvarCache(resetHist, 'ResetHist');

    parentPort.postMessage(
      `🔄 Reinício registrado: ${result} | Δ ${percChange}% | ` +
      `Total hoje: ${resetData.resetCount} | Positivos: ${resetData.positiveCount} | Negativos: ${resetData.negativeCount}`
    );


    //}

    if (perc >= 90) {
      
      balance = await getBalance();
      await salvarCache(balance, 'oldBalance');
      
    }else if (perc >= 5.0 && perc < 90) {
      
      activatePause(5); // pausa por 30 min
      let res = await fecharTodasPosicoes();
      if (res == true) {
        
        balance = await getBalance();
        
        oldBalance.newBalance = toFixedNumber(balance.marginBalance, 2);
        balanceHist.push(oldBalance);
        
      let capitalIni = oldBalance.walletBalance;
      let pnlaReter = parseFloat(balance.marginBalance) - parseFloat(oldBalance.marginBalance);
      
      //await transferir("USDT", capitalIni, 'UMFUTURE_MAIN');
      await transferir("USDT", pnlaReter, 'UMFUTURE_FUNDING');
      
      balance = await getBalance();
        await salvarCache(balance, 'oldBalance');
        
        
      }
      
      
    } 
    /*
    else if (percReal < -1.0) {

      //let res = await fecharTodasPosicoes();
      //if (res == true) {
        oldBalance.newBalance = toFixedNumber(balance.marginBalance, 2);
        balanceHist.push(oldBalance);
        

      balance = await getBalance();
      //}
      await salvarCache(balance, 'oldBalance');
      //await transferir("USDT", parseFloat(balance.walletBalance), 'UMFUTURE_MAIN');
    }
*/
    else if (perc <= -30.0 && perc >= -90.0) {

      let res = await fecharTodasPosicoes();
      if (res == true) {
        oldBalance.newBalance = toFixedNumber(balance.marginBalance, 2);
        balanceHist.push(oldBalance);
        

      balance = await getBalance();
      }
      await salvarCache(balance, 'oldBalance');
      await transferir("USDT", parseFloat(balance.walletBalance), 'UMFUTURE_MAIN');
      await salvarCache(balanceHist, 'BalanceHist');
      activatePause(3); // pausa por 30 min
    }
    // salvar saldo/histórico de margem

    

  }
}

async function startWorker() {

  const res = await apiAxiosSpot.get('/api/v3/time');
  const serverTime = res.data.serverTime;
  const localTime = Date.now();
  offset = serverTime - localTime;

  try {
    await monitorarMargem();
    //await transferir("USDT", "5", 'MAIN_FUNDING');
    //iniciarWebSocketcandles3m();
    //iniciarWebSocketcandles5m();
    //iniciarWebSocketcandles15m();
    //iniciarWebSocketcandles1h();
    //await monitorarGatilho();
    //iniciarWebSocketMarkPrice();
    //await iniciarWebSocketContinuo();
    //await monitorar30Minutos(); // se existir
  } catch (e) {
    parentPort.postMessage(`❌ Erro fatal no Worker: ${JSON.stringify(e.stack || e.message || e)}
     Reinício em 30s`);
    setTimeout(startWorker, 1000);
  }
}

(async () => {
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
  */

  // Loop contínuo a cada X segundos
  setInterval(() => {
    startWorker();
  }, 3000);


})();


