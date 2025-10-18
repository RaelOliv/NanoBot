
//import { initializeApp } from 'firebase/app';
//import { getDatabase, ref, set, child, get } from "firebase/database";


// TIO AVô - José Augusto da Rocha

const initializeApp = require('firebase/app');
const db = require('firebase/database');

const StochasticRSI = require('technicalindicators').StochasticRSI;
const SMA = require('technicalindicators').SMA;
const EMA = require('technicalindicators').EMA;
const PSAR = require('technicalindicators').PSAR;
const IFR = require('technicalindicators').RSI;

const { Indicators } = require("@ixjb94/indicators");

const https = require('https');

var conectado = true;
//const { exec } = require('child_process');
// Função para verificar conexão
/*
function verificarConexao(callback) {
  https.get('https://www.google.com', (res) => {
    callback(true);
  }).on('error', (err) => {
    callback(false);
  });
}
*/



function verificarConexao() {

    return new Promise((resolve) => {

        https.get('https://www.google.com', (res) => {
            resolve(true);
        }).on('error', () => {
            resolve(false);
        });
    });
}


// Verifica conexão periodicamente
/*
setInterval(() => {
var status = await verificarConexao();
  //verificarConexao((status) => {
    if (status && !conectado) {
      console.log('Conexão restabelecida. Retomando operações...');
      conectado = true;
    } else if (!status && conectado) {
      console.log('Sem conexão com a internet. Pausando operações...');
      conectado = false;
    }
  //});
}, 5000); // Checa a cada 5 segundos
*/
/*
//Simulação de operação contínua
setInterval(() => {
  if (!conectado) {
    console.log('Sistema pausado...');
    return;
  }

  // Aqui vai sua lógica principal que deve rodar quando há conexão
  console.log('Executando tarefa com internet...');
}, 2000);
*/

//const priceChannel = require('technicalindicators').PriceChannel;
//const bollingerBands = require('technicalindicators').BollingerBands;
//const MACD = require('technicalindicators').MACD;
//import { MACD, MACDInput } from 'technicalindicators/macd';

const { ATR, bollingerbands, PriceChannel, psar } = require('technicalindicators');

//const Cooldown = require('node-cooldown');

//index.js
const api = require('./api');
//const ping = require('./ping');
const Big = require('big.js');
//const createTrend = require('trendline');

//const Decimal = require('decimal.js');

const readline = require('readline');

//const { exec } = require('child_process');
//const { spawn } = require('child_process');
//const { spawn } = require('child_process');

const { exec } = require('child_process');

const nodemon = require('nodemon');

const NodeCache = require("node-cache");

//const cache = new NodeCache();
/*
const findCacheDir = require('find-cache-dir');
const rimraf = require('rimraf');
const cacheDir = findCacheDir({ name: 'bot' }); // Substitua 'seu_app_nome' pelo nome do seu aplicativo
*/

const { Mutex } = require('async-mutex');
const mutex = new Mutex();



/*
const { exec } = require('child_process');

// Define o comando para reinício completo do servidor
const restartCommand = 'taskkill /F /IM node.exe && npm start';

// Calcula o tempo para reiniciar em milissegundos
//const restartTime = 60 * 60 * 1000; // 1 hora
const restartTime = 60 * 1000; // 1 min

// Agenda o reinício do servidor
setTimeout(() => {
  // Executa o comando para reinício completo do servidor
  exec(restartCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Erro ao reiniciar o servidor: ${error}`);
      return;
    }
    console.log('Servidor reiniciado com sucesso!');
  });
}, restartTime);
*/

/*
// Import the necessary modules
const nodemon = require('nodemon');

// Define the server script file
const serverFile = 'index.js';

// Start the server with nodemon
nodemon({
  script: serverFile,
});

// Calculate the time to restart in milliseconds
//const restartTime = 60 * 60 * 1000; // 1 hour
const restartTime = 60 * 1000; // 1 min

// Schedule the server restart
setTimeout(() => {
  // Restart the server using nodemon
  nodemon.restart();
}, restartTime);

*/

/*const SMA = require('technicalindicators').SMA;

const cryptSymbol = process.env.SYMBOL;

var timestampArr = [];
var dateArr = [];
var openArr = [];
var closeArr = [];
var highArr = [];
var lowArr = [];
var volArr = [];

var marketData = null;
*/

const firebaseConfig = {
    apiKey: "AIzaSyCCpzWIhst6gD7GHqLhIe2_N38T6cOwt6M",
    authDomain: "deadline-1997.firebaseapp.com",
    databaseURL: "https://deadline-1997-default-rtdb.firebaseio.com",
    projectId: "deadline-1997",
    storageBucket: "deadline-1997.appspot.com",
    messagingSenderId: "110864270922",
    appId: "1:110864270922:web:bd4984f9d157d4a685c8b3",
    measurementId: "G-M66C87Z9QT"
};

/*
const firebaseConfig = {
    apiKey: "AIzaSyBpdb8MioJMJXGPS0aVyhi0juoerdaX-Qk",
    authDomain: "dl88-43bb4.firebaseapp.com",
    databaseURL: "https://dl88-43bb4-default-rtdb.firebaseio.com",
    projectId: "dl88-43bb4",
    storageBucket: "dl88-43bb4.firebasestorage.app",
    messagingSenderId: "686866680397",
    appId: "1:686866680397:web:311d62618ae2bec547ea04",
    measurementId: "G-Z0S55FZD4J"
};
*/

const app = initializeApp.initializeApp(firebaseConfig);
const database = db.getDatabase(app);
const dbRef = db.ref(database);

let timestampArr1m = [];
let dateArr1m = [];
let openArr1m = [];
let closeArr1m = [];
let highArr1m = [];
let lowArr1m = [];
let volArr1m = [];
let marketData1m = [];
//let marketData1m = null;

//[`${cryptSymbol}`]



let timestampArr3m = [];
let dateArr3m = [];
let openArr3m = [];
let closeArr3m = [];
let highArr3m = [];
let lowArr3m = [];
let volArr3m = [];
let marketData3m = [];
//let marketData3m = null;

let timestampArr5m = [];
let dateArr5m = [];
let openArr5m = [];
let closeArr5m = [];
let highArr5m = [];
let lowArr5m = [];
let volArr5m = [];
let marketData5m = [];
//let marketData5m = null;

let timestampArr15m = [];
let dateArr15m = [];
let openArr15m = [];
let closeArr15m = [];
let highArr15m = [];
let lowArr15m = [];
let volArr15m = [];
let marketData15m = [];
//let marketData15m = null;

let timestampArr30m = [];
let dateArr30m = [];
let openArr30m = [];
let closeArr30m = [];
let highArr30m = [];
let lowArr30m = [];
let volArr30m = [];
let marketData30m = [];
//let marketData30m = null;

let timestampArr1h = [];
let dateArr1h = [];
let openArr1h = [];
let closeArr1h = [];
let highArr1h = [];
let lowArr1h = [];
let volArr1h = [];
let marketData1h = [];
//let marketData1h = null;

let timestampArr4h = [];
let dateArr4h = [];
let openArr4h = [];
let closeArr4h = [];
let highArr4h = [];
let lowArr4h = [];
let volArr4h = [];
let marketData4h = [];
//let marketData4h = null;

let timestampArr1d = [];
let dateArr1d = [];
let openArr1d = [];
let closeArr1d = [];
let highArr1d = [];
let lowArr1d = [];
let volArr1d = [];
let marketData1d = [];
//let marketData1d = null;

let timestampArr1w = [];
let dateArr1w = [];
let openArr1w = [];
let closeArr1w = [];
let highArr1w = [];
let lowArr1w = [];
let volArr1w = [];
let marketData1w = [];
//let marketData1w = null;


var preco_anterior_1m = null;
var preco_anterior2_1m = null;
var abertura_atual_1m = null;
var abertura_anterior_1m = null;
var abertura_anterior2_1m = null;
var max_atual_1m = null;
var max_anterior_1m = null;
var max_anterior2_1m = null;
var min_atual_1m = null;
var min_anterior_1m = null;
var min_anterior2_1m = null;

var preco_anterior_3m = null;
var preco_anterior2_3m = null;
var abertura_atual_3m = null;
var abertura_anterior_3m = null;
var abertura_anterior2_3m = null;
var max_atual_3m = null;
var max_anterior_3m = null;
var max_anterior2_3m = null;
var min_atual_3m = null;
var min_anterior_3m = null;
var min_anterior2_3m = null;

var preco_anterior_5m = null;
var preco_anterior2_5m = null;
var abertura_atual_5m = null;
var abertura_anterior_5m = null;
var abertura_anterior2_5m = null;
var max_atual_5m = null;
var max_anterior_5m = null;
var max_anterior2_5m = null;
var min_atual_5m = null;
var min_anterior_5m = null;
var min_anterior2_5m = null;


var preco_anterior_15m = null;
var preco_anterior2_15m = null;
var abertura_atual_15m = null;
var abertura_anterior_15m = null;
var abertura_anterior2_15m = null;
var max_atual_15m = null;
var max_anterior_15m = null;
var max_anterior2_15m = null;
var min_atual_15m = null;
var min_anterior_15m = null;
var min_anterior2_15m = null;

var preco_anterior_30m = null;
var preco_anterior2_30m = null;
var abertura_atual_30m = null;
var abertura_anterior_30m = null;
var abertura_anterior2_30m = null;
var max_atual_30m = null;
var max_anterior_30m = null;
var max_anterior2_30m = null;
var min_atual_30m = null;
var min_anterior_30m = null;
var min_anterior2_30m = null;

var preco_anterior_1d = null;
var preco_anterior2_1d = null;
var abertura_atual_1d = null;
var abertura_anterior_1d = null;
var abertura_anterior2_1d = null;
var max_atual_1d = null;
var max_anterior_1d = null;
var max_anterior2_1d = null;
var min_atual_1d = null;
var min_anterior_1d = null;
var min_anterior2_1d = null;

var zigzag = null;

// SMA List

var sma3p1m = null;
var sma5p1m = null;
var sma10p1m = null;
var sma20p1m = null;
var sma50p1m = null;
var sma60p1m = null;
var sma100p1m = null;
var sma200p1m = null;

var sma10p3m = null;
var sma20p3m = null;
var sma50p3m = null;
var sma100p3m = null;
var sma200p3m = null;

var sma10p5m = null;
var sma20p5m = null;
var sma50p5m = null;
var sma60p5m = null;
var sma100p5m = null;
var sma200p5m = null;

var sma10p15m = null;
var sma20p15m = null;
var sma50p15m = null;
var sma100p15m = null;
var sma200p15m = null;

var sma10p30m = null;
var sma20p30m = null;
var sma50p30m = null;
var sma100p30m = null;
var sma200p30m = null;

var sma10p1h = null;
var sma20p1h = null;
var sma50p1h = null;
var sma60p1h = null;
var sma100p1h = null;
var sma200p1h = null;

var sma10p4h = null;
var sma20p4h = null;
var sma50p4h = null;
var sma100p4h = null;
var sma200p4h = null;


var sma5p1mprev = null;
var sma10p1mprev = null;
var sma20p1mprev = null;
var sma50p1mprev = null;
var sma60p1mprev = null;
var sma100p1mprev = null;
var sma200p1mprev = null;

var sma10p3mprev = null;
var sma20p3mprev = null;
var sma50p3mprev = null;
var sma100p3mprev = null;
var sma200p3mprev = null;

var sma10p5mprev = null;
var sma20p5mprev = null;
var sma50p5mprev = null;
var sma60p5mprev = null;
var sma100p5mprev = null;
var sma200p5mprev = null;

var sma10p15mprev = null;
var sma20p15mprev = null;
var sma50p15mprev = null;
var sma100p15mprev = null;
var sma200p15mprev = null;

var sma10p30mprev = null;
var sma20p30mprev = null;
var sma50p30mprev = null;
var sma100p30mprev = null;
var sma200p30mprev = null;

var sma10p1hprev = null;
var sma20p1hprev = null;
var sma50p1hprev = null;
var sma60p1hprev = null;
var sma100p1hprev = null;
var sma200p1hprev = null;

var sma10p4hprev = null;
var sma20p4hprev = null;
var sma50p4hprev = null;
var sma100p4hprev = null;
var sma200p4hprev = null;

//SMA Prox

var sma1m3p = null;
var sma1m5p = null;
var sma1m10p = null;
var sma1m20p = null;
var sma1m50p = null;
var sma1m60p = null;
var sma1m100p = null;
var sma1m200p = null;

var sma3m10p = null;
var sma3m20p = null;
var sma3m50p = null;
var sma3m100p = null;
var sma3m200p = null;

var sma5m10p = null;
var sma5m20p = null;
var sma5m50p = null;
var sma5m60p = null;
var sma5m100p = null;
var sma5m200p = null;

var sma15m10p = null;
var sma15m20p = null;
var sma15m50p = null;
var sma15m100p = null;
var sma15m200p = null;

var sma30m10p = null;
var sma30m20p = null;
var sma30m50p = null;
var sma30m100p = null;
var sma30m200p = null;

var sma1h10p = null;
var sma1h20p = null;
var sma1h50p = null;
var sma1h60p = null;
var sma1h100p = null;
var sma1h200p = null;

var sma4h10p = null;
var sma4h20p = null;
var sma4h50p = null;
var sma4h100p = null;
var sma4h200p = null;

var sma1m5prev = null;
var sma1m10prev = null;
var sma1m20prev = null;
var sma1m50prev = null;
var sma1m60prev = null;
var sma1m100prev = null;
var sma1m200prev = null;

var sma3m10prev = null;
var sma3m20prev = null;
var sma3m50prev = null;
var sma3m100prev = null;
var sma3m200prev = null;

var sma5m10prev = null;
var sma5m20prev = null;
var sma5m50prev = null;
var sma5m60prev = null;
var sma5m100prev = null;
var sma5m200prev = null;

var sma15m10prev = null;
var sma15m20prev = null;
var sma15m50prev = null;
var sma15m100prev = null;
var sma15m200prev = null;

var sma30m10prev = null;
var sma30m20prev = null;
var sma30m50prev = null;
var sma30m100prev = null;
var sma30m200prev = null;

var sma1h10prev = null;
var sma1h20prev = null;
var sma1h50prev = null;
var sma1h60prev = null;
var sma1h100prev = null;
var sma1h200prev = null;

var sma4h10prev = null;
var sma4h20prev = null;
var sma4h50prev = null;
var sma4h100prev = null;
var sma4h200prev = null;

//EMA List


var ema5p1m = null;
var ema10p1m = null;
var ema20p1m = null;
var ema25p1m = null;
var ema50p1m = null;
var ema100p1m = null;
var ema120p1m = null;
var ema200p1m = null;

var ema10p3m = null;
var ema20p3m = null;
var ema50p3m = null;
var ema100p3m = null;
var ema120p3m = null;
var ema200p3m = null;

var ema10p5m = null;
var ema20p5m = null;
var ema25p5m = null;
var ema50p5m = null;
var ema60p5m = null;
var ema100p5m = null;
var ema200p5m = null;

var ema10p15m = null;
var ema20p15m = null;
var ema25p15m = null;
var ema50p15m = null;
var ema100p15m = null;
var ema200p15m = null;

var ema10p30m = null;
var ema20p30m = null;
var ema50p30m = null;
var ema100p30m = null;
var ema200p30m = null;

var ema10p1h = null;
var ema20p1h = null;
var ema25p1h = null;
var ema50p1h = null;
var ema60p1h = null;
var ema100p1h = null;
var ema120p1h = null;
var ema200p1h = null;

var ema10p4h = null;
var ema20p4h = null;
var ema50p4h = null;
var ema100p4h = null;
var ema200p4h = null;

var ema5p1mprev = null;
var ema10p1mprev = null;
var ema20p1mprev = null;
var ema25p1mprev = null;
var ema50p1mprev = null;
var ema100p1mprev = null;
var ema120p1mprev = null;
var ema200p1mprev = null;

var ema10p3mprev = null;
var ema20p3mprev = null;
var ema50p3mprev = null;
var ema100p3mprev = null;
var ema200p3mprev = null;

var ema10p5mprev = null;
var ema20p5mprev = null;
var ema25p5mprev = null;
var ema50p5mprev = null;
var ema60p5mprev = null;
var ema100p5mprev = null;
var ema200p5mprev = null;

var ema10p15mprev = null;
var ema20p15mprev = null;
var ema25p15mprev = null;
var ema50p15mprev = null;
var ema100p15mprev = null;
var ema200p15mprev = null;

var ema10p30mprev = null;
var ema20p30mprev = null;
var ema50p30mprev = null;
var ema100p30mprev = null;
var ema200p30mprev = null;

var ema10p1hprev = null;
var ema20p1hprev = null;
var ema50p1hprev = null;
var ema60p1hprev = null;
var ema100p1hprev = null;
var ema120p1hprev = null;
var ema200p1hprev = null;

var ema10p4hprev = null;
var ema20p4hprev = null;
var ema50p4hprev = null;
var ema100p4hprev = null;
var ema200p4hprev = null;

//EMA Prox

var ema1m5p = null;
var ema1m10p = null;
var ema1m20p = null;
var ema1m25p = null;
var ema1m50p = null;
var ema1m100p = null;
var ema1m120p = null;
var ema1m200p = null;

var ema3m10p = null;
var ema3m20p = null;
var ema3m50p = null;
var ema3m100p = null;
var ema3m120p = null;
var ema3m200p = null;

var ema5m10p = null;
var ema5m20p = null;
var ema5m25p = null;
var ema5m50p = null;
var ema5m60p = null;
var ema5m100p = null;
var ema5m200p = null;

var ema15m10p = null;
var ema15m20p = null;
var ema15m25p = null;
var ema15m50p = null;
var ema15m100p = null;
var ema15m200p = null;

var ema30m10p = null;
var ema30m20p = null;
var ema30m50p = null;
var ema30m100p = null;
var ema30m200p = null;

var ema1h10p = null;
var ema1h20p = null;
var ema1h25p = null;
var ema1h50p = null;
var ema1h60p = null;
var ema1h100p = null;
var ema1h120p = null;
var ema1h200p = null;

var ema4h10p = null;
var ema4h20p = null;
var ema4h50p = null;
var ema4h100p = null;
var ema4h200p = null;

var ema1m5prev = null;
var ema1m10prev = null;
var ema1m20prev = null;
var ema1m25prev = null;
var ema1m50prev = null;
var ema1m100prev = null;
var ema1m200prev = null;

var ema3m10prev = null;
var ema3m20prev = null;
var ema3m50prev = null;
var ema3m100prev = null;
var ema3m200prev = null;

var ema5m10prev = null;
var ema5m20prev = null;
var ema5m25prev = null;
var ema5m50prev = null;
var ema5m60prev = null;
var ema5m100prev = null;
var ema5m200prev = null;

var ema15m10prev = null;
var ema15m20prev = null;
var ema15m25prev = null;
var ema15m50prev = null;
var ema15m100prev = null;
var ema15m200prev = null;

var ema30m10prev = null;
var ema30m20prev = null;
var ema30m50prev = null;
var ema30m100prev = null;
var ema30m200prev = null;

var ema1h10prev = null;
var ema1h10prev = null;
var ema1h20prev = null;
var ema1h50prev = null;
var ema1h60prev = null;
var ema1h100prev = null;
var ema1h120prev = null;
var ema1h200prev = null;

var ema4h10prev = null;
var ema4h20prev = null;
var ema4h50prev = null;
var ema4h100prev = null;
var ema4h200prev = null;

///

var ltb4h = null;
var lta4h = null;
var ltb4h2 = null;
var lta4h2 = null;

var fibo0 = null;
var fibo236 = null;
var fibo382 = null;
var fibo50 = null;
var fibo618 = null;
var fibo786 = null;
var fibo1 = null;
var fibo1618 = null;
var fibo2618 = null;
var fibo3618 = null;
var fibo4236 = null;
var fibo_d1618 = null;
var fibo_d3618 = null;
var fibo_d3618 = null;
var fibo_d4236 = null;

var open1d_0 = null;
var open1d_1 = null;
var close1d_1 = null;
var close1d_2 = null;
var max1d_1 = null;
var max1d_2 = null;
var min1d_1 = null;
var min1d_2 = null;

let openOrders = null;

var lastUpdate = null;
var availableBalance = null;
var balance = null;
var unrealizedProfit = null;
var marginBalance = null;
var positions = null;
var timestamp = null;

//var objSendcalc = {};
//var objMarket = {};
//var objIndic = {};

var flag = "";
var flagpos = [];

var position = [];

var pnlHist = null;
//var userTradesObj = [];
//var userTrades = null;

/*
setInterval(() => {
    main();
}, process.env.CRAWLER_INTERVAL);
*/


const fs = require('fs');
const path = require('path');
//const cacheFilePath = path.join(__dirname, 'cache.json');
var cacheFilePath = null;

//var cryptSymbol = process.env.SYMBOL;
var cryptSymbol = undefined;

const cryptSymbols = {
    //aion: 'AIONUSDT',
    //algo: 'ALGOUSDT',
    
        aave: 'AAVEUSDT',
        ada: 'ADAUSDT',
        ain: 'AINUSDT',
        apt: 'APTUSDT',
        arb: 'ARBUSDT',
        bas: 'BASUSDT',
        bat: 'BATUSDT',
        bonk: '1000BONKUSDT',
        crv: 'CRVUSDT',
        cvx: 'CVXUSDT',
        dexe: 'DEXEUSDT',
        doge: 'DOGEUSDT',
        dot: 'DOTUSDT',
        ena: 'ENAUSDT',
        eth: 'ETHUSDT',
        gala: 'GALAUSDT',
        idol: 'IDOLUSDT',
        jellyjelly: 'JELLYJELLYUSDT',
        jto: 'JTOUSDT',
        jup: 'JUPUSDT',
        kaito: 'KAITOUSDT',
        layer: 'LAYERUSDT',
        ldo: 'LDOUSDT',
        m: 'MUSDT',
        near: 'NEARUSDT',
        neiroeth: 'NEIROETHUSDT',
        nmr: 'NMRUSDT',
        nxpc: 'NXPCUSDT',
        ondo: 'ONDOUSDT',
        paxg: 'PAXGUSDT',
        pepe: '1000PEPEUSDT',
        pump: 'PUMPUSDT',
        pyth: 'PYTHUSDT',
        sand: 'SANDUSDT',
        shib: '1000SHIBUSDT',
        sol: 'SOLUSDT',
        sui: 'SUIUSDT',
        syrup: 'SYRUPUSDT',
        ta: 'TAUSDT',
        tia: 'TIAUSDT',
        ton: 'TONUSDT',
        trx: 'TRXUSDT',
        uni: 'UNIUSDT',
        vet: 'VETUSDT',
        virtual: 'VIRTUALUSDT',
        w: 'WUSDT',
        wld: 'WLDUSDT',
        wlfi: 'WLFIUSDT',
        xpl: 'XPLUSDT',
        xrp: 'XRPUSDT'
        
/*
    bonk: '1000BONKUSDT',
    ondo: 'ONDOUSDT',
    layer: 'LAYERUSDT',
    near: 'NEARUSDT',
    ena: 'ENAUSDT',
    sol: 'SOLUSDT',
    shib: '1000SHIBUSDT',
    bat: 'BATUSDT',
    doge: 'DOGEUSDT',
    nxpc: 'NXPCUSDT',
    wld: 'WLDUSDT',
    ta: 'TAUSDT',
    vet: 'VETUSDT'
*/
};


/*
//btc: 'BTCUSDT',
bch: 'BCHUSDT',
bnb: 'BNBUSDT',
bsv: 'BSVUSDT',
busd: 'BUSDUSDT',
celo: 'CELOUSDT',
chz: 'CHZUSDT',
comp: 'COMPUSDT',
cro: 'CROUSDT',
dash: 'DASHUSDT',
dogs: 'DOGSUSDT',
dot: 'DOTUSDT',
dydx: 'DYDXUSDT',
ena: 'ENAUSDT',
enj: 'ENJUSDT',
ethw: 'ETHWUSDT',
fet: 'FETUSDT',
fil: 'FILUSDT',
flow: 'FLOWUSDT',
gmt: 'GMTUSDT',
grt: 'GRTUSDT',
hbar: 'HBARUSDT',
hive: 'HIVEUSDT',
hot: 'HOTUSDT',
iota: 'IOTAUSDT',
kava: 'KAVAUSDT',
ksm: 'KSMUSDT',
ltc: 'LTCUSDT',
luna: 'LUNAUSDT',
matic: 'MATICUSDT',
mkr: 'MKRUSDT',
mngo: 'MNGOUSDT',
movr: 'MOVRUSDT',
near: 'NEARUSDT',
neo: 'NEOUSDT',
okb: 'OKBUSDT',
omg: 'OMGUSDT',
ont: 'ONTUSDT',
*/



//layer: 'LAYERUSDT',     // 75x // 4 dec ** risk liquid
//ondo: 'ONDOUSDT',         // 75x // 4 dec ** risk liquid
//fet: 'FETUSDT',         // 75x // 4 decimais marg incomp
//avax: 'AVAXUSDT',       // 75x // 3 dec ** marg incomp
//wld: 'WLDUSDT',         // 75x // 4 dec ** risk liquid

//xmr: 'XMRUSDT',         // 75x // 2 dec ** marg incomp
//dogs: 'DOGSUSDT',  *""// 75x // 7 dec liquid
//uni: 'UNIUSDT',         // 75x // 3 dec ** margem desprop

//btc: 'BTCUSDT',         // 125x // 1 dec

//prom: 'PROMUSDT',       // 50x // 3 dec ** graf incomp
//hive: 'HIVEUSDT',       // 75x // 5 dec ** marg desprop

//grass: 'GRASSUSDT',      // 50x // 4 dec ** graf incomp
//swell: 'SWELLUSDT',     // 50x // 5 dec
//eth: 'ETHUSDT',         // 125x // 2 dec
//spx: 'SPXUSDT',         // 50x // 4 dec *" marg incomp
//ltc: 'LTCUSDT',         // 75x // 2 dec

//bnb: 'BNBUSDT',         // 75x // 2 dec
//sol: 'SOLUSDT',         // 100x // 2 dec ** marg incomp
//trx: 'TRXUSDT',       // 75x // 5 dec ** graf incomp
//gala: 'GALAUSDT',  ** // 75x // 5 dec liquid 
/*
troy: 'TROYUSDT',
safe: 'SAFEUSDT',
quick: 'QUICKUSDT',
nuls: 'NULSUSDT',
ray: 'RAYUSDT',
koma: 'KOMAUSDT',
virtual: 'VIRTUALUSDT',
spx: 'SPXUSDT',
sonic: 'SONICUSDT',
dia: 'DIAUSDT',
bera: 'BERAUSDT'
*/



//     

//dogs: 'DOGSUSDT',         //0,07
//wld: 'WLDUSDT',           //0,07
//shib: '1000SHIBUSDT',     //0,10

//xmr: 'XMRUSDT',           //0,10
//sand: 'SANDUSDT',

//xlm: 'XLMUSDT',            //0,07

//trx: 'TRXUSDT',            //0,25
//sui: 'SUIUSDT',            //0,25
//bio: 'BIOUSDT',            //0,25

function calcLeverage(symbol) {
    /*
    var cacheJson = [];
      cacheJson[`${symbol}`] = await carregarCache(symbol);
      
        var maxleverage = cacheJson[`${symbol}`].objSendcalc.objRisk.leverage;
    */
    var maxleverage = 0;

    if (symbol == "1000PEPEUSDT" || symbol == "KLAYUSDT" || symbol == "FLMUSDT" || symbol == "MTLUSDT" || symbol == "XTZUSDT") {

        maxleverage = 20;

    } else if (symbol == "XMRUSDT" || symbol == "SANDUSDT" || symbol == "VETUSDT" || symbol == "GALAUSDT" || symbol == "DOGSUSDT" || symbol == "AVAXUSDT" || symbol == "1000SHIBUSDT" || symbol == "XRPUSDT" || symbol == "UNIUSDT" || symbol == "ADAUSDT" || symbol == "WLDUSDT" || symbol == "HIVEUSDT" || symbol == "DOGEUSDT" || symbol == "LTCUSDT"
        || symbol == "BNBUSDT"
        || symbol == "TRXUSDT"
        || symbol == "FETUSDT"
        || symbol == "ONDOUSDT"
        || symbol == "TONUSDT"
        || symbol == "JTOUSDT"
        || symbol == "NXPCUSDT"
        || symbol == "NEARUSDT"
        || symbol == "KAITOUSDT"
        || symbol == "LAYERUSDT"
    ) {

        maxleverage = 75;

    } else if (symbol == "PROMUSDT" || symbol == "GRASSUSDT" || symbol == "SWELLUSDT" || symbol == "SPXUSDT") {

        maxleverage = 50;

    } else if (symbol == "SOLUSDT") {

        maxleverage = 100;

    } else if (symbol == "BTCUSDT" || symbol == "ETHUSDT") {

        maxleverage = 150;

    } else {
        maxleverage = 75;
    }


    if (maxleverage !== undefined) {
        return maxleverage;
    } else {
        return 75;
    }


}

function calcDecimais(symbol) {
    /*
      var cacheJson = [];
      cacheJson[`${cryptSymbol}`] = await carregarCache(cryptSymbol);
      
        var decimais = cacheJson[`${cryptSymbol}`].objSendcalc.objRisk.pricePrecision;
        */
    var decimais = 4;
    if (symbol == "BTCUSDT") {

        decimais = 1;

    } else if (symbol == "XMRUSDT" || symbol == "ETHUSDT"
        || symbol == "LTCUSDT"
        || symbol == "BNBUSDT"
        || symbol == "SOLUSDT"
        || symbol == "ETHUSDT"
    ) {

        decimais = 2;

    } else if (symbol == "UNIUSDT" || symbol == "PROMUSDT"
        || symbol == "AVAXUSDT"
        || symbol == "NEARUSDT"
    ) {

        decimais = 3;

    } else if (symbol == "ADAUSDT" || symbol == "XRPUSDT" || symbol == "WLDUSDT" || symbol == "GRASSUSDT"
        || symbol == "SPXUSDT"
        || symbol == "FETUSDT"
        || symbol == "ONDOUSDT"
        || symbol == "TONUSDT"
        || symbol == "JTOUSDT"
        || symbol == "KAITOUSDT"
        || symbol == "LAYERUSDT"

    ) {

        decimais = 4;

    } else if (symbol == "GALAUSDT" || symbol == "SANDUSDT" || symbol == "DOGEUSDT" || symbol == "HIVEUSDT"
        || symbol == "SWELLUSDT"
        || symbol == "TRXUSDT"
        || symbol == "NXPCUSDT"
    ) {

        decimais = 5;

    } else if (symbol == "VETUSDT" || symbol == "1000SHIBUSDT") {

        decimais = 6;

    } else if (symbol == "DOGSUSDT") {

        decimais = 7;

    } else {

        decimais = 2;

    }

    if (decimais !== undefined) {
        return decimais;
    } else {
        return 4;
    }
}


//for (const key in cryptSymbols) {
//const symbol = cryptSymbols[key];
//await initDados(symbol);
//}


/*
// Função para salvar o cache em um arquivo
function salvarCache(cache) {
    fs.writeFileSync(cacheFilePath, JSON.stringify(cache));
}

// Função para carregar o cache de um arquivo
function carregarCache() {
    try {
        const data = fs.readFileSync(cacheFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}
*/


function salvarCache(cache, currencyPair) {
    cacheFilePath = path.join(__dirname, `cache/cache_${currencyPair}.json`);
    try {
        fs.writeFileSync(cacheFilePath, JSON.stringify(cache), { flag: 'w' });
    } catch (err) {
        console.error("Erro ao salvar cache:", err);
    }
}

// Função para carregar o cache de um arquivo
function carregarCache(currencyPair) {
    cacheFilePath = path.join(__dirname, `cache/cache_${currencyPair}.json`);

    try {
        const data = fs.readFileSync(cacheFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}


function limparCache() {
    try {
        fs.unlinkSync(cacheFilePath);
        console.log('Cache limpo com sucesso.');
    } catch (error) {
        console.error('Erro ao limpar o cache:', error);
    }
}

//var cacheJson[`${cryptSymbol}`] = carregarCache(cryptSymbol);
//var cacheJson[`${cryptSymbol}`] = salvarCache(cryptSymbol);
var cacheJson = [];

for (const key in cryptSymbols) {
    const symbol = cryptSymbols[key];

    cacheJson[`${symbol}`] = {};
    cacheJson[`${symbol}`].preco_atual = 0.0;
    //await initDados(symbol);
}



const WebSocket = require('ws');
const { unzipSync } = require('zlib');
const { stringify } = require('querystring');
const { dir } = require('console');

//const WebSocket = require('ws');
var url = '';


//const url = 'wss://fstream.binance.com/ws/btcusdt_perpetual@continuousKline_5m';
let ws = null;
let reconnectInterval = 2000; // Intervalo de tempo em milissegundos entre as tentativas de reconexão

//const ws = new WebSocket('wss://fstream.binance.com/ws/btcusdt@kline_1m');
//var ws = new WebSocket('wss://fstream.binance.com/ws/1000pepeusdt_perpetual@continuousKline_5m');

var preco_atual = 0.0;
var flagLock = false;
var flagLockSimul = [];
var flagLockLive = [];

function connect(cryptSymbol) {
    if (cryptSymbol !== undefined) {
        let cryptSymbolLowC = cryptSymbol.toLowerCase();

        url = `wss://fstream.binance.com/ws/${cryptSymbolLowC}_perpetual@continuousKline_5m`;

        console.log('Tentando conectar ao WebSocket...');
        ws = new WebSocket(url);
    }
    ws.onopen = function () {
        console.log('Conexão estabelecida.');
        reconnectInterval = 2000; // Resetar o intervalo de tempo para a próxima tentativa de reconexão (caso ocorra uma desconexão posterior)
    };

    ws.addEventListener('message', function (event) {
        const json = JSON.parse(event.data);
        //console.log('Dados atualizados:', json);
        if (json.k !== undefined) {
            try {

                //console.log("json", json);

                //const json = JSON.parse(data);
                const candle = json.k;

                const message = {
                    time: candle.t / 1000,
                    open: parseFloat(candle.o),
                    high: parseFloat(candle.h),
                    low: parseFloat(candle.l),
                    close: parseFloat(candle.c),
                };

                preco_atual = parseFloat(candle.c);

                //cache.set("preco_atual", preco_atual);


                //if(cryptSymbolws){
                //  salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbolws);
                //}

                if (json.ps == cryptSymbol
                    && cacheJson[`${cryptSymbol}`] !== undefined
                ) {
                    cacheJson[`${cryptSymbol}`] = carregarCache(cryptSymbol);
                    cacheJson[`${cryptSymbol}`].preco_atual = preco_atual;

                    salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                }

                //const valor = cache.get("preco_atual");
                //console.log("valor:", valor);

                //console.log(message);

            } catch (error) {
                console.error(error);
            }
        }

    });

    /*
    ws.on('message', (data) => {
        try {
        const json = JSON.parse(data);
        const candle = json.k;

        const message = {
            time: candle.t / 1000,
            open: parseFloat(candle.o),
            high: parseFloat(candle.h),
            low: parseFloat(candle.l),
            close: parseFloat(candle.c),
        };

        preco_atual = parseFloat(candle.c);

        //console.log(message);
        } catch (error) {
        console.error(error);
        }
    });
    */

    ws.onerror = function (error) {
        console.error('Erro na conexão do WebSocket: ' + error);
    };

    ws.onclose = function (event) {
        console.log('Conexão fechada. Código: ' + event.code + ', motivo: ' + event.reason);
        reconnect();
    };

}

function reconnect() {
    console.log('Tentando reconectar em ' + reconnectInterval + 'ms...');
    setTimeout(connect, reconnectInterval);
    reconnectInterval *= 2; // Dobrar o intervalo de tempo a cada tentativa de reconexão (exponencial)
}

async function exeConnWS() {

    for (const key in cryptSymbols) {
        var cryptSymbolws = cryptSymbols[key];

        await new Promise(resolve => setTimeout(resolve, 500));

        connect(cryptSymbolws); // Iniciar a conexão WebSocket

    }
}

//exeConnWS();
/*
// Exemplo: Simular uma desconexão após 10 segundos
setTimeout(function() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close();
  }
}, 10000);
*/

//setTimeout(restartApp, 6 * 60 * 60 * 1000);
//setTimeout(restartApp, 1 * 60 * 1000);


console.log('Iniciando aplicação...');

/*
// Define o tempo em minutos para reiniciar a aplicação
const restartTime = 1;

// Define o tempo em milissegundos para reiniciar a aplicação
const restartTimeMs = restartTime * 60 * 1000;

// Define a função para reiniciar a aplicação
const restartApp = () => {

    console.clear();
    console.log('Reiniciando aplicação...');

    //nodemon.restart();

    cache.flushAll();
    clearTimeout(restartTimer);

    /*
    const app = spawn(process.argv[0], process.argv.slice(1), {
        detached: true,
        stdio: 'ignore'
    });
    app.unref();
    process.exit();

    *

};

// Define o temporizador para reiniciar a aplicação
const restartTimer = setTimeout(restartApp, restartTimeMs);
*/
// Cancela o temporizador quando a aplicação é encerrada
//process.on('exit', () => {
//clearTimeout(restartTimer);
//});

//limparCache();
var atr1m = null;
var atr_atual_1m = null;
var atr_anterior_1m = null;
var atr_anterior2_1m = null;

var atr3m = null;
var atr_atual_3m = null;
var atr_anterior_3m = null;
var atr_atual_5m = null;
var atr_anterior_5m = null;

//salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);

//const { Worker } = require('worker_threads');
const { ENOTEMPTY } = require('constants');
const { isUndefined, isString } = require('util');



//main();

/*

for (const key in cryptSymbols) {

    cryptSymbol = cryptSymbols[key];

    //timeout(2500); // 5s

        //setTimeout(main(cryptSymbol), 2500);



    main(cryptSymbol);



}*/
/*
//var player = require('play-sound')(opts = {});
const { Howl } = require('howler');

const play = require('audio-play');
const load = require('audio-loader');


const sound = new Howl({
    src: ['foo.wav']
  });
 
*/
async function simulateWalletController() {

    var sumPnlsimul = undefined;
    var cacheSimul = [];
    cacheSimul = await carregarCache('SIMUL');


    var sumPnlsimul = Object.values(cryptSymbols).reduce((acc, symbol) => {
        if (cacheSimul[symbol] && cacheSimul[symbol].position && cacheSimul[symbol].position.status === 'open') {
            return acc + parseFloat(cacheSimul[symbol].position.pnl);
        }
        return acc;
    }, 0);

    console.log('countsimul.sum:', sumPnlsimul);

    if (cacheSimul[`WALLET`] == undefined
        || cacheSimul[`WALLET`] == null
        || cacheSimul[`WALLET`] == {}
        || cacheSimul[`WALLET`].coin == []
    ) {

        cacheSimul[`WALLET`] = {};
        cacheSimul[`WALLET`].coin = [];

    } else if (cacheSimul[`WALLET`].coin[0] == undefined
    ) {

        cacheSimul[`WALLET`].coin[0] = {
            asset: 'USDT',
            walletBalanceInit: 10.00,
            walletBalance: 10.00,
            availableBalance: 10.00,
            walletBalanceROI: 0.00,
            unrealizedProfit: '0.00000000',
            /*
            marginBalance: '10.00',
            maintMargin: '0.00000000',
            initialMargin: '0.00000000',
            positionInitialMargin: '0.00000000',
            openOrderInitialMargin: '0.00000000',
            maxWithdrawAmount: '10.00',
            crossWalletBalance: '10.00',
            crossUnPnl: '0.00000000',
            */
            marginAvailable: true,
            updateTime: Date.now(),
            updateTimeF: formatTime(Date.now())
        }

    }
    //console.log("cacheSimul[`WALLET`].coin[0]", cacheSimul[`WALLET`].coin[0]);
    if (cacheSimul[`WALLET`].coin[0] !== undefined) {
        if (cacheSimul[`WALLET`].coin[0].updateTime !== undefined) {

            var walletBalanceInit = parseFloat(cacheSimul[`WALLET`].coin[0].walletBalanceInit);
            var walletBalance = parseFloat(cacheSimul[`WALLET`].coin[0].walletBalance);

            var wallRoi = ((walletBalance - walletBalanceInit) / walletBalanceInit) * 100;

            var sumPnlsimul = Object.values(cryptSymbols).reduce((acc, symbol) => {
                if (cacheSimul[symbol] && cacheSimul[symbol].position && cacheSimul[symbol].position.status === 'open') {
                    return acc + parseFloat(cacheSimul[symbol].position.pnl);
                }
                return acc;
            }, 0);

            cacheSimul[`WALLET`].coin[0].walletBalanceROI = wallRoi.toFixed(2);
            cacheSimul[`WALLET`].coin[0].unrealizedProfit = sumPnlsimul;
            cacheSimul[`WALLET`].coin[0].updateTime = Date.now();
            cacheSimul[`WALLET`].coin[0].updateTimeF = formatTime(Date.now());


        }
    }

    await salvarCache(cacheSimul, 'SIMUL');

}

async function simulateOpenPos(preco_atual, cryptSymbol, side = '', pontosMarg = 2) {

    var cacheSimul = [];
    var cacheJson = [];
    var calcTake = undefined;
    var calcStop = undefined;
    var mm4UP = undefined;
    var mm4DW = undefined;

    cacheSimul = await carregarCache('SIMUL');
    cacheJson[`${cryptSymbol}`] = await carregarCache(cryptSymbol);

    const alav = await calcLeverage(cryptSymbol);
    const qtt = await getQntbyBalance(preco_atual, cryptSymbol, true);
    const qttX = qtt * pontosMarg;
    var result = calcPnlFutBinance(preco_atual, preco_atual, alav, qttX, side);

    // if(cacheJson[`${cryptSymbol}`] !== undefined){
    mm4UP = cacheJson[`${cryptSymbol}`].objMarket.mm4UP;
    mm4DW = cacheJson[`${cryptSymbol}`].objMarket.mm4DW;

    calcTake = await calcularPrecoAlvo(side, parseFloat(process.env.TAKEPROFIT), parseFloat(preco_atual), cryptSymbol);

    //calcStop = await calcularPrecoAlvo(side, parseFloat(process.env.STOPLOSS), parseFloat(preco_atual), cryptSymbol);
    let calcPnlRoiMM4 = undefined;
    if (side == 'C') {

        calcPnlRoiMM4 = calcPnlFutBinance(preco_atual, mm4UP.preco, alav, qttX, side);
        calcStop = parseFloat(mm4DW.preco);

    }
    if (side == 'V') {

        calcPnlRoiMM4 = calcPnlFutBinance(preco_atual, mm4DW.preco, alav, qttX, side);

        calcStop = parseFloat(mm4UP.preco);
    }
    console.log("calcPnlRoiMM4", calcPnlRoiMM4);
    //calcStop = await calcularPrecoAlvo(side, parseFloat(calcPnlRoiMM4.roi), parseFloat(preco_atual), cryptSymbol);

    //}



    if (cacheSimul[`${cryptSymbol}`] == undefined
        || cacheSimul[`${cryptSymbol}`] == null
        || cacheSimul[`${cryptSymbol}`] == {}
        || cacheSimul[`${cryptSymbol}`].position == {}
    ) {

        let result = calcPnlFutBinance(preco_atual, preco_atual, alav, qttX, side);

        cacheSimul[`${cryptSymbol}`] = {};
        cacheSimul[`${cryptSymbol}`].position = {
            cryptSymbol: cryptSymbol,
            side: side,
            status: "open",
            margemInicial: result.margemInicial,
            qtt: qttX,
            leverage: alav,
            entryPrice: preco_atual,
            precoAtual: preco_atual,
            pnl: parseFloat(result.pnl),
            roi: parseFloat(result.roi),
            firstUpdate: formatTime(Date.now()), //Date.now(),
            lastUpdate: formatTime(Date.now()),
            takeIni: calcTake,
            stopIni: calcStop,
            take: calcTake,
            stop: calcStop,
            positMaxPercent: 0,
            positMinPercent: 0

        };

        var availableBalance = cacheSimul[`WALLET`].coin[0].availableBalance;
        cacheSimul[`WALLET`].coin[0].availableBalance = parseFloat(availableBalance) - parseFloat(result.margemInicial);

        cacheSimul[`WALLET`].coin[0].updateTime = Date.now();
        cacheSimul[`WALLET`].coin[0].updateTimeF = formatTime(Date.now());


        await salvarCache(cacheSimul, 'SIMUL');
        notificWin(preco_atual, cryptSymbol, 'smlOpen', side);

    } else if (cacheSimul[`${cryptSymbol}`] !== undefined) {

        let precoEntrada = cacheSimul[`${cryptSymbol}`].position.entryPrice;
        let qntty = cacheSimul[`${cryptSymbol}`].position.qtt;
        let precoSaida = preco_atual;

        let result = calcPnlFutBinance(precoEntrada, precoSaida, alav, qntty, side);

        cacheSimul[`${cryptSymbol}`].position.lastUpdate = formatTime(Date.now());
        cacheSimul[`${cryptSymbol}`].position.precoAtual = preco_atual;
        cacheSimul[`${cryptSymbol}`].position.pnl = result.pnl;
        cacheSimul[`${cryptSymbol}`].position.roi = result.roi;

        //cacheSimul[`WALLET`].coin[0].unrealizedProfit = parseFloat(result.pnl);

        await salvarCache(cacheSimul, 'SIMUL');

    }
    //var position = undefined;
    //position = cacheSimul[`${cryptSymbol}`].position;
    //cacheSimul['Hist'].push(position);
    //cacheSimul['Hist']?.push(position) ?? (cacheSimul['Hist'] = [position]);



    await salvarCache(cacheSimul, 'SIMUL');
    await timeout(10000);

}

async function initDadosMin(cryptSymbol, timestamp) {

    let min = 10000;
    let max = 30000;
    let randomInteger = Math.floor(Math.random() * (max - min + 1)) + min;
    //console.log(randomInteger);

    var initDControl = await carregarCache("initDControlMin");
    //console.log(`initDControl--->[${cryptSymbol}]:::: `, initDControl);
    if (initDControl == {}) {
        initDControl = [];
    }
    if (initDControl['flag'] == undefined) {
        initDControl['flag'] = false;
    }
    if (initDControl[cryptSymbol] == undefined) {
        initDControl[cryptSymbol] = {
            timestamp: Date.now(),
            lastTimestamp: Date.now(),
            timestampLimit: Date.now() + 3000 + randomInteger,
            cryptSymbol: cryptSymbol,
        }

        await salvarCache(initDControl, "initDControlMin");
    } else {
        var cont = initDControl[cryptSymbol].cont;
        if (cont == null) {
            initDControl[cryptSymbol].cont = 0;
            cont = 0;
            await salvarCache(initDControl, "initDControlMin");
        }

        const minCont = Math.min(
            ...Object.values(initDControl)
                .filter(item => typeof item === 'object' && item.cont !== undefined)
                .map(item => item.cont)
        );
        const maxCont = Math.max(
            ...Object.values(initDControl)
                .filter(item => typeof item === 'object' && item.cont !== undefined)
                .map(item => item.cont)
        );
        //console.log("Menor valor de cont:", minCont);
        if (Date.now() <= initDControl[cryptSymbol].timestampLimit) {
            console.log("");
            console.log(`!!! InitDadosMin-[${cryptSymbol}]: em StandBy !!!`)
            console.log("");
        } else if (Date.now() >= initDControl[cryptSymbol].timestampLimit
            && initDControl['flag'] == false
            && initDControl[cryptSymbol].cont == minCont
        ) {
            var lastTimestamp = initDControl[cryptSymbol].timestamp;
            initDControl[cryptSymbol] = {
                timestamp: Date.now(),
                timestampLimit: Date.now() + 3000 + randomInteger,
                cryptSymbol: cryptSymbol
            }
            initDControl[cryptSymbol].lastTimestamp = lastTimestamp;
            if (cont < maxCont - 2) {
                cont = maxCont - 1;
            }
            initDControl[cryptSymbol].cont = cont + 1;
            var timeDif = calcularTempoRestante(initDControl[cryptSymbol].timestamp, initDControl[cryptSymbol].lastTimestamp);
            initDControl[cryptSymbol].timeDif = timeDif;
            console.log("");
            console.log(`>>> initDadosMin[${cryptSymbol}] ::-:: em execução!! <<<`);
            console.log("");
            initDControl['flag'] = true;

            await salvarCache(initDControl, "initDControlMin");
            //conectado = await verificarConexao();
            if (conectado) {

                //var preco_atual = cacheJson[`${cryptSymbol}`].preco_atual;
                cacheJson[`${cryptSymbol}`] = await carregarCache(cryptSymbol);

                //const timeApi = await api.time();
                timestamp = await Date.now();
                //if (timeApi !== undefined) {
                if (timestamp !== undefined) {

                    //const carteira = await api.accountFutures(timeApi.data.serverTime);

                    console.log(">>>>>>>> timestamp:::::: ", timestamp);

                    const carteira = await api.accountFutures(timestamp);
                    //console.log(`TEST:  ${JSON.stringify(carteira.filter(b => b.asset === 'USDT'))}`);

                    for (let index = 1; index <= 3; index++) {
                        //console.log(`Positions loop: ${index}`);

                        await db.get(db.child(dbRef, `objData/${cryptSymbol}/positions/${cryptSymbol}`)).then((snapshot) => {
                            if (snapshot.exists()) {
                                const data = snapshot.val();

                                if (data) {
                                    position[`${cryptSymbol}`] = data;
                                    resultLog = `Ordem no par ${cryptSymbol} aberta`;
                                }

                            } else {

                                resultLog = "Nenhuma ordem aberta no momento";
                                //flagLock = false;
                                flag = "";
                                flagpos[`${cryptSymbol}`] = "";


                                //console.log("No data positions available");
                                //cacheJson[`${cryptSymbol}`] = await carregarCache(cryptSymbol);

                                /*
                                    if (cacheJson[`${cryptSymbol}`].positMaxPercent !== 0) {
                                        cacheJson[`${cryptSymbol}`].positMaxPercent = 0;
                                        salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                                    }
                                */


                            }
                        }).catch((error) => {
                            console.error(error);
                        });
                    }

                    //console.log(resultLog);
                    var cachePos = await carregarCache('POSITIONS');
                    var positions = undefined;

                    if (carteira !== undefined) {
                        //positions = await carteira.positions.filter(b => b.unrealizedProfit !== '0.00000000'); // || b.asset === 'USDT');
                        positions = await carteira.positions.filter(b => b.initialMargin !== '0'); // || b.asset === 'USDT');
                        //console.log(`TEST:positions[${cryptSymbol}]:  ${JSON.stringify(positions)}`);
                    }
                    if (positions !== undefined) {

                        position[`${cryptSymbol}`] = await positions.filter(b => b.symbol == cryptSymbol);
                        //console.log(`TEST:position:  ${JSON.stringify(position[`${cryptSymbol}`])}`);
                        //db.set(db.ref(database, `objData/${cryptSymbol}/positions/${symbol}`), obj);

                        cachePos[`${cryptSymbol}`] = position[`${cryptSymbol}`][0];
                        if (cachePos[`${cryptSymbol}`] !== undefined) {
                            if (cachePos[`${cryptSymbol}`].entryTime == undefined || cachePos[`${cryptSymbol}`].entryTime == 0) {
                                cachePos[`${cryptSymbol}`].entryTime = cachePos[`${cryptSymbol}`].updateTime;
                            }
                        } else {
                            cacheJson[`${cryptSymbol}`].positMaxPercent = parseFloat(0);
                            cacheJson[`${cryptSymbol}`].positMinPercent = parseFloat(0);
                            cacheJson[`${cryptSymbol}`].positLimitPercent = parseFloat(0);
                            if (simulation == false) {
                                var closedOrd0 = api.closeAllsltpBySymbol(timestamp, 10, cryptSymbol);
                                console.log('closedOrd---0-------------->>>>>', closedOrd0);
                            }
                        }
                        await salvarCache(cachePos, 'POSITIONS');
                    }

                }
                var objMarket = {

                    symbol: cryptSymbol,
                    max_atual_1m: null,
                    min_atual_1m: null,
                    max_anterior_1m: null,
                    min_anterior_1m: null,

                    max_atual_3m: null,
                    min_atual_3m: null,
                    max_anterior_3m: null,
                    min_anterior_3m: null,

                    max_atual_5m: null,
                    min_atual_5m: null,
                    max_anterior_5m: null,
                    min_anterior_5m: null,
                    resTend1h: null,
                    resTend4h: null,

                    klineRes3m: null,
                    klineRes1h: null,
                    klineRes4h: null,

                    /*
                    klineRes: result3m[`${cryptSymbol}`],
                    klineRes: result3m[`${cryptSymbol}`],
                    klineRes: result3m[`${cryptSymbol}`],
                    */

                    mm4UP: null,
                    mm4DW: null
                };

                var sma5m50p = cacheJson[`${cryptSymbol}`].objMarket.sma5m50p;
                var sma5m60p = cacheJson[`${cryptSymbol}`].objMarket.sma5m60p;
                var ema5m50p = cacheJson[`${cryptSymbol}`].objMarket.ema5m50p;
                var ema5m60p = cacheJson[`${cryptSymbol}`].objMarket.ema5m60p;

                var maiorMM = Math.max(parseFloat(sma5m50p.preco), parseFloat(sma5m60p.preco), parseFloat(ema5m50p.preco), parseFloat(ema5m60p.preco));

                var menorMM = Math.min(parseFloat(sma5m50p.preco), parseFloat(sma5m60p.preco), parseFloat(ema5m50p.preco), parseFloat(ema5m60p.preco));

                var mm4UP = estaProximoDaLinha(cryptSymbol, maiorMM, preco_atual);
                var mm4DW = estaProximoDaLinha(cryptSymbol, menorMM, preco_atual);

                if (cacheJson[`${cryptSymbol}`].objMarket !== undefined) {
                    objMarket = cacheJson[`${cryptSymbol}`].objMarket;
                }

                if (objMarket.mm4UP !== undefined) {
                    //objMarket.mm4UP = cacheJson[`${cryptSymbol}`].objMarket;
                    objMarket.mm4UP = mm4UP;
                }
                if (objMarket.mm4DW !== undefined) {
                    //objMarket.mm4DW = cacheJson[`${cryptSymbol}`].objMarket;
                    objMarket.mm4DW = mm4DW;
                }



                var result1m = [];
                result1m[`${cryptSymbol}`] = {
                    data: null
                }

                var result3m = [];
                result3m[`${cryptSymbol}`] = {
                    data: null
                }

                var result5m = [];
                result5m[`${cryptSymbol}`] = {
                    data: null
                }

                var result1h = [];
                result1h[`${cryptSymbol}`] = {
                    data: null
                }

                var result4h = [];
                result4h[`${cryptSymbol}`] = {
                    data: null
                }

                var marketData1m = [];
                var marketData3m = [];
                var marketData5m = [];
                var marketData1h = [];
                var marketData4h = [];

                //1m
                if (objMarket.klineRes1m !== null && objMarket.klineRes1m !== undefined) {
                    if (objMarket.klineRes1m.klineclose <= Date.now()) {

                        result1m[`${cryptSymbol}`].data = objMarket.klineRes1m.result1mdata;
                        //console.log(`initDadosMin/klineRes1m[${cryptSymbol}]: Dados do cache`);

                    } else {

                        result1m[`${cryptSymbol}`] = await api.klines("1m", cryptSymbol);
                        //console.log(`initDadosMin/klineRes1m[${cryptSymbol}]: Dados do API`);
                    }
                } else {

                    result1m[`${cryptSymbol}`] = await api.klines("1m", cryptSymbol);
                    //console.log(`initDadosMin/klineRes1m[${cryptSymbol}]: Dados do API`);
                }

                //3m
                if (objMarket.klineRes3m !== null && objMarket.klineRes3m !== undefined) {
                    if (objMarket.klineRes3m.klineclose <= Date.now()) {

                        result3m[`${cryptSymbol}`].data = objMarket.klineRes3m.result3mdata;
                        //console.log(`initDadosMin/klineRes3m[${cryptSymbol}]: Dados do cache`);

                    } else {

                        result3m[`${cryptSymbol}`] = await api.klines("3m", cryptSymbol);
                        //console.log(`initDadosMin/klineRes3m[${cryptSymbol}]: Dados do API`);
                    }
                } else {

                    result3m[`${cryptSymbol}`] = await api.klines("3m", cryptSymbol);
                    //console.log(`initDadosMin/klineRes3m[${cryptSymbol}]: Dados do API`);
                }

                //5m
                if (objMarket.klineRes5m !== null && objMarket.klineRes5m !== undefined) {
                    if (objMarket.klineRes5m.klineclose <= Date.now()) {

                        result5m[`${cryptSymbol}`].data = objMarket.klineRes5m.result5mdata;
                        //console.log(`initDadosMin/klineRes5m[${cryptSymbol}]: Dados do cache`);

                    } else {

                        result5m[`${cryptSymbol}`] = await api.klines("5m", cryptSymbol);
                        //console.log(`initDadosMin/klineRes5m[${cryptSymbol}]: Dados do API`);
                    }
                } else {

                    result5m[`${cryptSymbol}`] = await api.klines("5m", cryptSymbol);
                    //console.log(`initDadosMin/klineRes5m[${cryptSymbol}]: Dados do API`);
                }

                //1h
                if (objMarket.klineRes1h !== null && objMarket.klineRes1h !== undefined) {
                    if (objMarket.klineRes1h.klineclose >= Date.now()) {

                        result1h[`${cryptSymbol}`].data = objMarket.klineRes1h.result1hdata;
                        //console.log(`initDadosMin/klineRes1h[${cryptSymbol}]: Dados do cache`);

                    } else {

                        result1h[`${cryptSymbol}`] = await api.klines("1h", cryptSymbol);
                        //console.log(`initDadosMin/klineRes1h[${cryptSymbol}]: Dados do API`);
                    }
                } else {

                    result1h[`${cryptSymbol}`] = await api.klines("1h", cryptSymbol);
                    //console.log(`initDadosMin/klineRes1h[${cryptSymbol}]: Dados do API`);
                }

                //4h
                if (objMarket.klineRes4h !== null && objMarket.klineRes4h !== undefined) {
                    if (objMarket.klineRes4h.klineclose >= Date.now()) {

                        result4h[`${cryptSymbol}`].data = objMarket.klineRes4h.result4hdata;
                        //console.log(`initDadosMin/klineRes4h[${cryptSymbol}]: Dados do cache`);

                    } else {

                        result4h[`${cryptSymbol}`] = await api.klines("4h", cryptSymbol);
                        //console.log(`initDadosMin/klineRes4h[${cryptSymbol}]: Dados do API`);
                    }
                } else {

                    result4h[`${cryptSymbol}`] = await api.klines("4h", cryptSymbol);
                    //console.log(`initDadosMin/klineRes4h[${cryptSymbol}]: Dados do API`);
                }

                /*
                    result1h[`${cryptSymbol}`] = await api.klines("1h", cryptSymbol);
                    result4h[`${cryptSymbol}`] = await api.klines("4h", cryptSymbol);
                */
                //console.log('result3m', result3m);

                //1m
                if (result1m[`${cryptSymbol}`] !== undefined) {
                    criarObj1m(result1m[`${cryptSymbol}`].data, cryptSymbol);
                    marketData1m[`${cryptSymbol}`] = { date: dateArr1m[`${cryptSymbol}`], timestamp: timestampArr1m[`${cryptSymbol}`], open: openArr1m[`${cryptSymbol}`], close: closeArr1m[`${cryptSymbol}`], high: highArr1m[`${cryptSymbol}`], low: lowArr1m[`${cryptSymbol}`], volume: volArr1m[`${cryptSymbol}`] };
                }
                //3m
                if (result3m[`${cryptSymbol}`] !== undefined) {
                    criarObj3m(result3m[`${cryptSymbol}`].data, cryptSymbol);
                    marketData3m[`${cryptSymbol}`] = { date: dateArr3m[`${cryptSymbol}`], timestamp: timestampArr3m[`${cryptSymbol}`], open: openArr3m[`${cryptSymbol}`], close: closeArr3m[`${cryptSymbol}`], high: highArr3m[`${cryptSymbol}`], low: lowArr3m[`${cryptSymbol}`], volume: volArr3m[`${cryptSymbol}`] };
                }

                //5m
                if (result5m[`${cryptSymbol}`] !== undefined) {
                    criarObj5m(result5m[`${cryptSymbol}`].data, cryptSymbol);
                    marketData5m[`${cryptSymbol}`] = { date: dateArr5m[`${cryptSymbol}`], timestamp: timestampArr5m[`${cryptSymbol}`], open: openArr5m[`${cryptSymbol}`], close: closeArr5m[`${cryptSymbol}`], high: highArr5m[`${cryptSymbol}`], low: lowArr5m[`${cryptSymbol}`], volume: volArr5m[`${cryptSymbol}`] };
                }

                //1h
                if (result1h[`${cryptSymbol}`] !== undefined) {
                    criarObj1h(result1h[`${cryptSymbol}`].data, cryptSymbol);
                    marketData1h[`${cryptSymbol}`] = { date: dateArr1h[`${cryptSymbol}`], timestamp: timestampArr1h[`${cryptSymbol}`], open: openArr1h[`${cryptSymbol}`], close: closeArr1h[`${cryptSymbol}`], high: highArr1h[`${cryptSymbol}`], low: lowArr1h[`${cryptSymbol}`], volume: volArr1h[`${cryptSymbol}`] };
                }

                if (result4h[`${cryptSymbol}`] !== undefined) {
                    criarObj4h(result4h[`${cryptSymbol}`].data, cryptSymbol);
                    marketData4h[`${cryptSymbol}`] = { date: dateArr4h[`${cryptSymbol}`], timestamp: timestampArr4h[`${cryptSymbol}`], open: openArr4h[`${cryptSymbol}`], close: closeArr4h[`${cryptSymbol}`], high: highArr4h[`${cryptSymbol}`], low: lowArr4h[`${cryptSymbol}`], volume: volArr4h[`${cryptSymbol}`] };
                }

                if (marketData1m !== undefined
                    && marketData1m !== null
                    && marketData3m !== undefined
                    && marketData3m !== null
                    && marketData5m !== undefined
                    && marketData5m !== null
                    && marketData1h !== undefined
                    && marketData1h !== null
                    && marketData4h !== undefined
                    && marketData4h !== null
                ) {

                    if (
                        marketData1m[`${cryptSymbol}`] !== undefined
                        && marketData1m[`${cryptSymbol}`] !== null
                        && marketData3m[`${cryptSymbol}`] !== undefined
                        && marketData3m[`${cryptSymbol}`] !== null
                        && marketData5m[`${cryptSymbol}`] !== undefined
                        && marketData5m[`${cryptSymbol}`] !== null
                        && marketData1h[`${cryptSymbol}`] !== undefined
                        && marketData1h[`${cryptSymbol}`] !== null
                        && marketData4h[`${cryptSymbol}`] !== undefined
                        && marketData4h[`${cryptSymbol}`] !== null
                    ) {

                        var candles1h = obterUltimosCandles(marketData1h[`${cryptSymbol}`]);
                        var candles4h = obterUltimosCandles(marketData4h[`${cryptSymbol}`]);

                        var pontosZigZag5 = calcularZigZag(candles1h); // Defina o threshold adequado
                        var pontosZigZag6 = calcularZigZag(candles4h); // Defina o threshold adequado

                        const resTend4h = calcularLinhaTendencia(candles4h, pontosZigZag6.pontosUnificados);
                        const resTend1h = calcularLinhaTendencia(candles1h, pontosZigZag5.pontosUnificados);

                        //1m
                        var max_atual_1m = parseFloat(marketData1m[`${cryptSymbol}`].high[marketData1m[`${cryptSymbol}`].high.length - 1]);
                        var min_atual_1m = parseFloat(marketData1m[`${cryptSymbol}`].low[marketData1m[`${cryptSymbol}`].low.length - 1]);

                        var max_anterior_1m = parseFloat(marketData1m[`${cryptSymbol}`].high[marketData1m[`${cryptSymbol}`].high.length - 2]);
                        var min_anterior_1m = parseFloat(marketData1m[`${cryptSymbol}`].low[marketData1m[`${cryptSymbol}`].low.length - 2]);

                        //3m
                        var max_atual_3m = parseFloat(marketData3m[`${cryptSymbol}`].high[marketData3m[`${cryptSymbol}`].high.length - 1]);
                        var min_atual_3m = parseFloat(marketData3m[`${cryptSymbol}`].low[marketData3m[`${cryptSymbol}`].low.length - 1]);

                        var max_anterior_3m = parseFloat(marketData3m[`${cryptSymbol}`].high[marketData3m[`${cryptSymbol}`].high.length - 2]);
                        var min_anterior_3m = parseFloat(marketData3m[`${cryptSymbol}`].low[marketData3m[`${cryptSymbol}`].low.length - 2]);

                        //5m
                        var max_atual_5m = parseFloat(marketData5m[`${cryptSymbol}`].high[marketData5m[`${cryptSymbol}`].high.length - 1]);
                        var min_atual_5m = parseFloat(marketData5m[`${cryptSymbol}`].low[marketData5m[`${cryptSymbol}`].low.length - 1]);

                        var max_anterior_5m = parseFloat(marketData5m[`${cryptSymbol}`].high[marketData5m[`${cryptSymbol}`].high.length - 2]);
                        var min_anterior_5m = parseFloat(marketData5m[`${cryptSymbol}`].low[marketData5m[`${cryptSymbol}`].low.length - 2]);

                        //1m
                        objMarket.max_atual_1m = max_atual_1m;
                        objMarket.min_atual_1m = min_atual_1m;
                        objMarket.max_anterior_1m = max_anterior_1m;
                        objMarket.min_anterior_1m = min_anterior_1m;

                        //3m
                        objMarket.max_atual_3m = max_atual_3m;
                        objMarket.min_atual_3m = min_atual_3m;
                        objMarket.max_anterior_3m = max_anterior_3m;
                        objMarket.min_anterior_3m = min_anterior_3m;

                        //5m
                        objMarket.max_atual_5m = max_atual_5m;
                        objMarket.min_atual_5m = min_atual_5m;
                        objMarket.max_anterior_5m = max_anterior_5m;
                        objMarket.min_anterior_5m = min_anterior_5m;

                        objMarket.resTend1h = resTend1h;
                        objMarket.resTend4h = resTend4h;

                        var klineRes1m = {
                            klineclose: result1m[`${cryptSymbol}`].data[result1m[`${cryptSymbol}`].data.length - 1][6],
                            result1mdata: result1m[`${cryptSymbol}`].data
                        }

                        var klineRes3m = {
                            klineclose: result3m[`${cryptSymbol}`].data[result3m[`${cryptSymbol}`].data.length - 1][6],
                            result3mdata: result3m[`${cryptSymbol}`].data
                        }

                        var klineRes5m = {
                            klineclose: result5m[`${cryptSymbol}`].data[result5m[`${cryptSymbol}`].data.length - 1][6],
                            result5mdata: result5m[`${cryptSymbol}`].data
                        }

                        var klineRes1h = {
                            klineclose: result1h[`${cryptSymbol}`].data[result1h[`${cryptSymbol}`].data.length - 1][6],
                            result1hdata: result1h[`${cryptSymbol}`].data
                        }

                        var klineRes4h = {
                            klineclose: result4h[`${cryptSymbol}`].data[result4h[`${cryptSymbol}`].data.length - 1][6],
                            result4hdata: result4h[`${cryptSymbol}`].data
                        }

                        objMarket.klineRes1m = klineRes1m;
                        objMarket.klineRes3m = klineRes3m;
                        objMarket.klineRes5m = klineRes5m;
                        objMarket.klineRes1h = klineRes1h;
                        objMarket.klineRes4h = klineRes4h;

                        //objMarket.klineRes3m = result3m[`${cryptSymbol}`].data[result3m[`${cryptSymbol}`].data.length-1][6];
                        //objMarket.klineRes1h = result1h[`${cryptSymbol}`].data[result1h[`${cryptSymbol}`].data.length-1][6];
                        //objMarket.klineRes1h = result1h[`${cryptSymbol}`];
                        //objMarket.klineRes4h = result4h[`${cryptSymbol}`];

                        //if (objMarket.symbol == cryptSymbol) {
                        cacheJson[`${cryptSymbol}`].objMarket = objMarket;
                        //}

                        await salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                    }
                }

                //notificWin(preco_atual, cryptSymbol, 'smlOpen', 'C'); 

            } else {


                console.log('Sem conexão com a internet. Pausando operações...');
            }
            initDControl['flag'] = false;
            await salvarCache(initDControl, "initDControlMin");

        }
    }

};

async function simulatePositonController(cryptSymbol, preco_atual, type = 1, timestamp) {

    var cacheSimul = undefined;
    var cacheJson = [];

    var objMarket = {};

    var position = undefined;
    var calcTake = undefined;
    var calcStop = undefined;

    var min_atual_1m = undefined;
    var max_atual_1m = undefined;
    var min_anterior_1m = undefined;
    var max_anterior_1m = undefined;

    var min_atual_3m = undefined;
    var max_atual_3m = undefined;
    var min_anterior_3m = undefined;
    var max_anterior_3m = undefined;

    var resTend1h = undefined;
    var resTend4h = undefined;
    var mm4UP = undefined;
    var mm4DW = undefined;

    let alav = await calcLeverage(cryptSymbol);

    await simulateWalletController();

    cacheSimul = await carregarCache('SIMUL');
    cacheJson[`${cryptSymbol}`] = await carregarCache(cryptSymbol);


    if (cacheJson[`${cryptSymbol}`] !== undefined) {
        if (cacheJson[`${cryptSymbol}`].objMarket !== undefined) {

            preco_atual = cacheJson[`${cryptSymbol}`].preco_atual;

            //initDadosMin(cryptSymbol, timestamp);

            //var preco_anterior_1m = cacheJson[`${cryptSymbol}`].objMarket.preco_anterior_1m;
            //xvar preco_anterior2_1m = cacheJson[`${cryptSymbol}`].objMarket.preco_anterior2_1m;
            min_atual_1m = cacheJson[`${cryptSymbol}`].objMarket.min_atual_1m;
            max_atual_1m = cacheJson[`${cryptSymbol}`].objMarket.max_atual_1m;
            min_anterior_1m = cacheJson[`${cryptSymbol}`].objMarket.min_anterior_1m;
            //var min_anterior2_1m = cacheJson[`${cryptSymbol}`].objMarket.min_anterior2_1m;
            max_anterior_1m = cacheJson[`${cryptSymbol}`].objMarket.max_anterior_1m;
            //var max_anterior2_1m = cacheJson[`${cryptSymbol}`].objMarket.max_anterior2_1m;

            min_atual_3m = cacheJson[`${cryptSymbol}`].objMarket.min_atual_3m;
            max_atual_3m = cacheJson[`${cryptSymbol}`].objMarket.max_atual_3m;
            min_anterior_3m = cacheJson[`${cryptSymbol}`].objMarket.min_anterior_3m;
            max_anterior_3m = cacheJson[`${cryptSymbol}`].objMarket.max_anterior_3m;

            resTend1h = cacheJson[`${cryptSymbol}`].objMarket.resTend1h;
            resTend4h = cacheJson[`${cryptSymbol}`].objMarket.resTend4h;

            mm4UP = cacheJson[`${cryptSymbol}`].objMarket.mm4UP;
            mm4DW = cacheJson[`${cryptSymbol}`].objMarket.mm4DW;
        }
    }

    // function closePos(){

    // }

    //const precoEntrada = 0.55;
    //const precoSaida = 0.8;
    //const qtt = await getQntbyBalance(preco_atual, cryptSymbol, true);

    //const result = calcPnlFutBinance(precoEntrada, precoSaida, alav, qtt, 'C');

    //console.log('Resultado dos Cálculos:');
    //console.log('Margem Inicial:', result.margemInicial);
    //console.log('PNL:', result.pnl);
    //console.log('ROI:', result.roi);


    if (cacheSimul !== undefined) {
        if (cacheSimul[`${cryptSymbol}`] !== undefined) {
            cacheSimul[`${cryptSymbol}`].position.lastUpdate = formatTime(Date.now());

            position = cacheSimul[`${cryptSymbol}`].position;
            //cacheSimul[`${cryptSymbol}`].position.lastUpdate = formatTime(Date.now());
            //if (type == 1) {

            calcTake = parseFloat(cacheSimul[`${cryptSymbol}`].position.take);
            calcStop = parseFloat(cacheSimul[`${cryptSymbol}`].position.stop);
            //}



            let calcPnlRoiMM4 = undefined;
            if (cacheSimul[`${cryptSymbol}`].position.side == 'C') {

                //calcPnlRoiMM4 = calcPnlFutBinance(cacheSimul[`${cryptSymbol}`].position.entryPrice, mm4UP.preco, alav, cacheSimul[`${cryptSymbol}`].position.qtt, cacheSimul[`${cryptSymbol}`].position.side);

                calcStop = parseFloat(mm4DW.preco);
            }
            if (cacheSimul[`${cryptSymbol}`].position.side == 'V') {

                //calcPnlRoiMM4 = calcPnlFutBinance(cacheSimul[`${cryptSymbol}`].position.entryPrice, mm4DW.preco, alav, cacheSimul[`${cryptSymbol}`].position.qtt, cacheSimul[`${cryptSymbol}`].position.side);

                calcStop = parseFloat(mm4UP.preco);
            }

            console.log("calcPnlRoiMM4", calcPnlRoiMM4);
            await timeout(2000);
            //calcStop = await calcularPrecoAlvo(cacheSimul[`${cryptSymbol}`].position.side, parseFloat(calcPnlRoiMM4.roi), parseFloat(preco_atual), cryptSymbol);

            cacheSimul[`${cryptSymbol}`].position.stop = parseFloat(calcStop);

            await salvarCache(cacheSimul, 'SIMUL');


            /*
                if(parseFloat(resTend1h.ltb.valor) >= parseFloat(resTend1h.lta.valor)){
                    if (cacheSimul[`${cryptSymbol}`].position.side == 'C' 
                    &&(parseFloat(resTend1h.ltb.valor) >= parseFloat(cacheSimul[`${cryptSymbol}`].position.entryPrice))
                    
                    ) {
    
    
      
      calcTake = parseFloat(resTend1h.ltb.valor);
      cacheSimul[`${cryptSymbol}`].position.take = parseFloat(calcTake);
    
    
    
                        
    
                    }
                    if (cacheSimul[`${cryptSymbol}`].position.side == 'V'
                                    &&(parseFloat(resTend1h.lta.valor) <= parseFloat(cacheSimul[`${cryptSymbol}`].position.entryPrice))
                    ) {
    
                        calcTake = parseFloat(resTend1h.lta.valor);
    cacheSimul[`${cryptSymbol}`].position.take = parseFloat(calcTake);
                    }
    
    
                }
            */
            //calcStop = await calcularPrecoAlvo(cacheSimul[`${cryptSymbol}`].position.side, parseFloat(process.env.STOPLOSS), parseFloat(cacheSimul[`${cryptSymbol}`].position.entryPrice), cryptSymbol);

            //cacheSimul[`${cryptSymbol}`].position.Take = calcTake;
            //cacheSimul[`${cryptSymbol}`].position.Stop = calcStop;
            //await salvarCache(cacheSimul, 'SIMUL');

            //console.log('position:', position);


            cacheSimul[`${cryptSymbol}`].position.precoAtual = cacheJson[`${cryptSymbol}`].preco_atual;

            let result = await calcPnlFutBinance(cacheSimul[`${cryptSymbol}`].position.entryPrice, cacheJson[`${cryptSymbol}`].preco_atual, alav, cacheSimul[`${cryptSymbol}`].position.qtt, cacheSimul[`${cryptSymbol}`].position.side);
            cacheSimul[`${cryptSymbol}`].position.pnl = parseFloat(result.pnl);
            cacheSimul[`${cryptSymbol}`].position.roi = parseFloat(result.roi);


            if (parseFloat(cacheSimul[`${cryptSymbol}`].position.positMaxPercent) <= parseFloat(cacheSimul[`${cryptSymbol}`].position.roi)) {
                cacheSimul[`${cryptSymbol}`].position.positMaxPercent = parseFloat(cacheSimul[`${cryptSymbol}`].position.roi);

            }

            if (parseFloat(cacheSimul[`${cryptSymbol}`].position.positMinPercent) >= parseFloat(cacheSimul[`${cryptSymbol}`].position.roi)) {
                cacheSimul[`${cryptSymbol}`].position.positMinPercent = parseFloat(cacheSimul[`${cryptSymbol}`].position.roi);

            }


            // if(cacheJson[`${cryptSymbol}`] !== undefined){



            //calcTake = await calcularPrecoAlvo(side, parseFloat(process.env.TAKEPROFIT), parseFloat(preco_atual), cryptSymbol);

            //calcStop = await calcularPrecoAlvo(side, parseFloat(process.env.STOPLOSS), parseFloat(preco_atual), cryptSymbol);

            //}

            // calcStop = await calcularPrecoAlvo(side, parseFloat(process.env.rangeSTOPLOSS), parseFloat(preco_atual), cryptSymbol);
            /*
                        if(parseFloat(cacheSimul[`${cryptSymbol}`].position.positMaxPercent) > parseFloat(20)){
                       // calcStop = await calcularPrecoAlvo(cacheSimul[`${cryptSymbol}`].position.side, (parseFloat(cacheSimul[`${cryptSymbol}`].position.positMaxPercent)- parseFloat(process.env.RANGE)), parseFloat(cacheSimul[`${cryptSymbol}`].position.entryPrice), cryptSymbol);
                        calcStop = await calcularPrecoAlvo(cacheSimul[`${cryptSymbol}`].position.side, parseFloat(process.env.STOPLOSS), parseFloat(cacheSimul[`${cryptSymbol}`].position.entryPrice), cryptSymbol);
                        
                        cacheSimul[`${cryptSymbol}`].position.stop = parseFloat(calcStop);
                    }
            */
            await salvarCache(cacheSimul, 'SIMUL');


            if (cacheSimul[`WALLET`] !== undefined) {
                if (cacheSimul[`WALLET`].coin[0] !== undefined) {

                    var alvoTake = parseFloat(cacheJson[`${cryptSymbol}`].preco_atual);
                    var alvoStop = parseFloat(cacheJson[`${cryptSymbol}`].preco_atual);
                    var tagTake = "Gain";
                    var tagStop = "Loss";

                    if (cacheSimul[`${cryptSymbol}`].position.side == 'C'

                        && (
                            // (parseFloat(preco_atual) >= parseFloat(calcTake)
                            /*|| parseFloat(max_atual_1m) >= parseFloat(calcTake)*/ //)

                            // ||
                            ((parseFloat(preco_atual) < parseFloat(calcStop)
  /*|| parseFloat(min_atual_1m) <= parseFloat(calcStop)*/)
                                && parseFloat(cacheSimul[`${cryptSymbol}`].position.roi) > parseFloat(0)))
                    ) {

                        standBy = false;


                        if (parseFloat(preco_atual) >= parseFloat(calcTake)) {

                            alvoTake = parseFloat(cacheSimul[`${cryptSymbol}`].position.take);

                            if (parseFloat(cacheSimul[`${cryptSymbol}`].position.takeIni) !== parseFloat(cacheSimul[`${cryptSymbol}`].position.take)) {

                                tagTake = "GainLT";
                            }


                        } else if (parseFloat(preco_atual) < parseFloat(calcStop)) {

                            alvoTake = parseFloat(cacheSimul[`${cryptSymbol}`].position.stop);

                            if (parseFloat(cacheSimul[`${cryptSymbol}`].position.stopIni) !== parseFloat(cacheSimul[`${cryptSymbol}`].position.stop)) {

                                tagTake = "GainRG";
                            }


                        }

                        let result = calcPnlFutBinance(cacheSimul[`${cryptSymbol}`].position.entryPrice, alvoTake, alav, cacheSimul[`${cryptSymbol}`].position.qtt, cacheSimul[`${cryptSymbol}`].position.side);


                        cacheSimul[`${cryptSymbol}`].position.pnl = parseFloat(result.pnl);
                        cacheSimul[`${cryptSymbol}`].position.roi = parseFloat(result.roi);

                        cacheSimul[`${cryptSymbol}`].position.lastUpdate = formatTime(Date.now());
                        cacheSimul[`${cryptSymbol}`].position.status = tagTake;
                        cacheSimul['Hist']?.push(position) ?? (cacheSimul['Hist'] = [position]);



                        cacheSimul[`WALLET`].coin[0].walletBalance = parseFloat(cacheSimul[`WALLET`].coin[0].walletBalance) + parseFloat(cacheSimul[`${cryptSymbol}`].position.pnl);
                        cacheSimul[`WALLET`].coin[0].availableBalance = parseFloat(cacheSimul[`WALLET`].coin[0].availableBalance) + parseFloat(cacheSimul[`${cryptSymbol}`].position.margemInicial) + parseFloat(cacheSimul[`${cryptSymbol}`].position.pnl);




                        await salvarCache(cacheSimul, 'SIMUL');

                        await notificWin(preco_atual, cryptSymbol, tagTake, 'C');

                        cacheSimul[`${cryptSymbol}`] = undefined;
                        await salvarCache(cacheSimul, 'SIMUL');

                    } else if ((cacheSimul[`${cryptSymbol}`].position.side == 'V'

                        && (
                            //(parseFloat(preco_atual) <= parseFloat(calcTake)
                            //|| parseFloat(min_atual_1m) <= parseFloat(calcTake)
                            //)

                            //||
                            ((parseFloat(preco_atual) > parseFloat(calcStop)
                                //|| parseFloat(max_atual_1m) >= parseFloat(calcStop)
                            )
                                && parseFloat(cacheSimul[`${cryptSymbol}`].position.roi) > parseFloat(0)))
                    )) {



                        if (parseFloat(preco_atual) <= parseFloat(calcTake)) {

                            alvoTake = parseFloat(cacheSimul[`${cryptSymbol}`].position.take);

                            if (parseFloat(cacheSimul[`${cryptSymbol}`].position.takeIni) !== parseFloat(cacheSimul[`${cryptSymbol}`].position.take)) {

                                tagTake = "GainLT";
                            }


                        } else if (parseFloat(preco_atual) > parseFloat(calcStop)) {

                            alvoTake = parseFloat(cacheSimul[`${cryptSymbol}`].position.stop);

                            if (parseFloat(cacheSimul[`${cryptSymbol}`].position.stopIni) !== parseFloat(cacheSimul[`${cryptSymbol}`].position.stop)) {

                                tagTake = "GainRG";
                            }


                        }

                        let result = calcPnlFutBinance(cacheSimul[`${cryptSymbol}`].position.entryPrice, alvoTake, alav, cacheSimul[`${cryptSymbol}`].position.qtt, cacheSimul[`${cryptSymbol}`].position.side);

                        cacheSimul[`${cryptSymbol}`].position.pnl = parseFloat(result.pnl);
                        cacheSimul[`${cryptSymbol}`].position.roi = parseFloat(result.roi);

                        cacheSimul[`${cryptSymbol}`].position.lastUpdate = formatTime(Date.now());
                        cacheSimul[`${cryptSymbol}`].position.status = tagTake;
                        cacheSimul['Hist']?.push(position) ?? (cacheSimul['Hist'] = [position]);


                        cacheSimul[`WALLET`].coin[0].walletBalance = parseFloat(cacheSimul[`WALLET`].coin[0].walletBalance) + parseFloat(cacheSimul[`${cryptSymbol}`].position.pnl);
                        cacheSimul[`WALLET`].coin[0].availableBalance = parseFloat(cacheSimul[`WALLET`].coin[0].availableBalance) + parseFloat(cacheSimul[`${cryptSymbol}`].position.margemInicial) + parseFloat(cacheSimul[`${cryptSymbol}`].position.pnl);


                        await salvarCache(cacheSimul, 'SIMUL');

                        await notificWin(preco_atual, cryptSymbol, tagTake, 'V');

                        cacheSimul[`${cryptSymbol}`] = undefined;

                        await salvarCache(cacheSimul, 'SIMUL');


                    } else if (cacheSimul[`${cryptSymbol}`].position.side == 'C'
                        && (parseFloat(preco_atual) < parseFloat(calcStop)
                            //|| parseFloat(min_atual_1m) <= parseFloat(calcStop)
                        )
                        && parseFloat(cacheSimul[`${cryptSymbol}`].position.roi) < parseFloat(0)
                    ) {



                        alvoStop = parseFloat(cacheSimul[`${cryptSymbol}`].position.stop);

                        if (parseFloat(cacheSimul[`${cryptSymbol}`].position.stopIni) !== parseFloat(cacheSimul[`${cryptSymbol}`].position.stop)) {

                            tagStop = "LossRG";
                        }



                        let result = calcPnlFutBinance(cacheSimul[`${cryptSymbol}`].position.entryPrice, alvoStop, alav, cacheSimul[`${cryptSymbol}`].position.qtt, cacheSimul[`${cryptSymbol}`].position.side);


                        cacheSimul[`${cryptSymbol}`].position.pnl = parseFloat(result.pnl);
                        cacheSimul[`${cryptSymbol}`].position.roi = parseFloat(result.roi);

                        cacheSimul[`${cryptSymbol}`].position.lastUpdate = formatTime(Date.now());
                        cacheSimul[`${cryptSymbol}`].position.status = tagStop;
                        cacheSimul['Hist']?.push(position) ?? (cacheSimul['Hist'] = [position]);

                        cacheSimul[`WALLET`].coin[0].walletBalance = parseFloat(cacheSimul[`WALLET`].coin[0].walletBalance) + parseFloat(cacheSimul[`${cryptSymbol}`].position.pnl);
                        cacheSimul[`WALLET`].coin[0].availableBalance = parseFloat(cacheSimul[`WALLET`].coin[0].availableBalance) + parseFloat(cacheSimul[`${cryptSymbol}`].position.margemInicial) + parseFloat(cacheSimul[`${cryptSymbol}`].position.pnl);


                        await salvarCache(cacheSimul, 'SIMUL');

                        await notificWin(preco_atual, cryptSymbol, tagStop, 'C');

                        cacheSimul[`${cryptSymbol}`] = undefined;

                        await salvarCache(cacheSimul, 'SIMUL');

                    } else if (cacheSimul[`${cryptSymbol}`].position.side == 'V'
                        && (parseFloat(preco_atual) > parseFloat(calcStop)
                            //|| parseFloat(max_atual_1m) >= parseFloat(calcStop)
                        )
                        && parseFloat(cacheSimul[`${cryptSymbol}`].position.roi) < parseFloat(0)
                    ) {

                        alvoStop = parseFloat(cacheSimul[`${cryptSymbol}`].position.stop);

                        if (parseFloat(cacheSimul[`${cryptSymbol}`].position.stopIni) !== parseFloat(cacheSimul[`${cryptSymbol}`].position.stop)) {

                            tagStop = "LossRG";
                        }

                        let result = calcPnlFutBinance(cacheSimul[`${cryptSymbol}`].position.entryPrice, alvoStop, alav, cacheSimul[`${cryptSymbol}`].position.qtt, cacheSimul[`${cryptSymbol}`].position.side);


                        cacheSimul[`${cryptSymbol}`].position.pnl = parseFloat(result.pnl);
                        cacheSimul[`${cryptSymbol}`].position.roi = parseFloat(result.roi);

                        cacheSimul[`${cryptSymbol}`].position.lastUpdate = formatTime(Date.now());
                        cacheSimul[`${cryptSymbol}`].position.status = tagStop;
                        cacheSimul['Hist']?.push(position) ?? (cacheSimul['Hist'] = [position]);



                        cacheSimul[`WALLET`].coin[0].walletBalance = parseFloat(cacheSimul[`WALLET`].coin[0].walletBalance) + parseFloat(cacheSimul[`${cryptSymbol}`].position.pnl);
                        cacheSimul[`WALLET`].coin[0].availableBalance = parseFloat(cacheSimul[`WALLET`].coin[0].availableBalance) + parseFloat(cacheSimul[`${cryptSymbol}`].position.margemInicial) + parseFloat(cacheSimul[`${cryptSymbol}`].position.pnl);


                        await salvarCache(cacheSimul, 'SIMUL');

                        await notificWin(preco_atual, cryptSymbol, tagStop, 'V');

                        cacheSimul[`${cryptSymbol}`] = undefined;

                        await salvarCache(cacheSimul, 'SIMUL');

                    }
                }
            }
        }
        //console.log('position:', position);

        await salvarCache(cacheSimul, 'SIMUL');
    }
}
const notifier = require('node-notifier');

async function notificWin(preco_atual, cryptSymbol, op, side = '') {

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

    cacheSimul = await carregarCache('SIMUL');
    cachePosit = await carregarCache('POSITIONS');

    if (cacheSimul[`${cryptSymbol}`] !== undefined) {
        entryPrice = cacheSimul[`${cryptSymbol}`].position.entryPrice;
        take = cacheSimul[`${cryptSymbol}`].position.take;
        stop = cacheSimul[`${cryptSymbol}`].position.stop;
        pnl = cacheSimul[`${cryptSymbol}`].position.pnl;
        roi = cacheSimul[`${cryptSymbol}`].position.roi;
    }
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
    if (op == 'open') {
        options = {
            title: 'Posição Aberta',
            message: `Nova posição aberta em ${cryptSymbol}: ${preco_atual}`,
            sound: true, // Isso fará com que um som seja tocado
        };
    } else if (op == 'close') {
        options = {
            title: 'Posição Fechada',
            message: `Posição foi fechada em ${cryptSymbol}: ${preco_atual}`,
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
            title: `Posição Fechada: ${preco_atual}`,
            message: `Posição foi fechada em ${cryptSymbol}: `,
            sound: true, // Isso fará com que um som seja tocado
        };
    } else if (op == 'Gain' || op == 'GainLT' || op == 'GainRG' || op == 'Loss' || op == 'LossRG') {
        options = {
            title: `(${side})Posição Fechada(${op}): ${preco_atual}`,
            message: `Posição foi fechada em ${cryptSymbol}
            E: ${entryPrice}
            T: ${take} <- S: ${stop}
            P: ${pnl} <-> R: ${roi}`,
            sound: true, // Isso fará com que um som seja tocado
        };
    } else if (op == 'smlLoss') {
        options = {
            title: `(${side})Posição Fechada(Loss): ${preco_atual}`,
            message: `Posição foi fechada em ${cryptSymbol}
            E: ${entryPrice}
            T: ${take} -> S: ${stop}
            P: ${pnl} <-> R: ${roi}`,
            sound: true, // Isso fará com que um som seja tocado
        };
    } else if (op == 'smlReverC') {
        options = {
            title: `(${side})Posição Fechada(ReverC): ${preco_atual}`,
            message: `Posição foi fechada em ${cryptSymbol}
            E: ${entryPrice}
            P: ${pnl} <-> R: ${roi}`,
            sound: true, // Isso fará com que um som seja tocado
        };
    } else if (op == 'smlReverV') {
        options = {
            title: `(${side})Posição Fechada(ReverV): ${preco_atual}`,
            message: `Posição foi fechada em ${cryptSymbol}
            E: ${entryPrice}
            P: ${pnl} <-> R: ${roi}`,
            sound: true, // Isso fará com que um som seja tocado
        };
    }
    notifier.notify(options);
    //const { exec } = require('child_process');

    exec(`termux-notification --title "${options.title}" --content "${options.message}"`, (err, stdout, stderr) => {
        if (err) {
            console.error(`Erro: ${err}`);
            return;
        }
        console.log('Notificação enviada!');
    });

}
/*
setInterval(() => {
    const sessionStore = req.sessionStore; // Certifique-se de ter acesso ao `req`
    
    sessionStore.all((err, sessions) => {
      if (err) {
        console.error("Erro ao obter sessões:", err);
        return;
      }
      
      for (let sessionID in sessions) {
        sessionStore.destroy(sessionID, (err) => {
          if (err) {
            console.error("Erro ao remover sessão:", err);
          } else {
            console.log(`Sessão ${sessionID} removida`);
          }
        });
      }
    });
}, 1000); // 5 minutos em milissegundos

  //}, 5 * 60 * 1000); // 5 minutos em milissegundos
*/
var onOff = process.env.ONOFF;
var simulation = process.env.SIMULATION == "true" ? true : false;
var standBy = false;
var countSimulPos = undefined;
var countLivePos = undefined;
var simultPos = parseInt(process.env.TRDSIMULT);


//const path = require('path');
const { Worker } = require('worker_threads');

async function iniciarWorkerMon(symbol) {
    const worker = new Worker(path.join(__dirname, './workers/monitorWorker.js'), {
        workerData: { symbol }
    });

    worker.on('message', (msg) => {
        console.log(`[${symbol}]`, msg);
        console.log("");
    });

    worker.on('error', (err) => {
        console.error(`[${symbol}] Erro no Worker:`, err);
    });

    worker.on('exit', (code) => {
        console.log(`[${symbol}] Worker finalizou com código: ${code}.. Reiniciando em 30 seg..`);
        setTimeout(() => iniciarWorkerMon(symbol), 30000);
    });
}

async function iniciarWorkerMarg() {
    const worker = new Worker(path.join(__dirname, './workers/margWorker.js'), {
        workerData: {}
    });

    worker.on('message', (msg) => {
        console.log(`[Marg]`, msg);
        console.log("");
    });

    worker.on('error', (err) => {
        console.error(`Erro no Worker:`, err);
    });

    worker.on('exit', (code) => {
        console.log(`Worker finalizou com código: ${code}.. Reiniciando em 30 seg..`);
        setTimeout(() => iniciarWorkerMarg(), 30000);
    });
}

const symbolArg = process.argv[2];
if (!symbolArg) {
    console.error('❌ Você precisa passar o símbolo como argumento! Ex: node index.js BTCUSDT');
    process.exit(1);
}

//
async function executeMain() {

    var initDControl = await carregarCache("initDControl");
    var initDControlMin = await carregarCache("initDControlMin");

    if (initDControl == {}) {
        initDControl = [];
    }
    if (initDControlMin == {}) {
        initDControlMin = [];
    }

    initDControl['flag'] = false;
    await salvarCache(initDControl, "initDControl");

    initDControlMin['flag'] = false;
    await salvarCache(initDControlMin, "initDControlMin");

    for (const key in cryptSymbols) {

        cryptSymbol = cryptSymbols[key];

        await new Promise(resolve => setTimeout(resolve, 5000));

        await configRisk(cryptSymbol);
        //main(cryptSymbol);
        iniciarWorkerMon(cryptSymbols);
        await travaDeSeguranca(cryptSymbol);

    }

}


//executeMain();
async function execThreads() {
    iniciarWorkerMarg();
    for (const key in cryptSymbols) {

        cryptSymbol = cryptSymbols[key];

        //await new Promise(resolve => setTimeout(resolve, 2000));

        //await configRisk(cryptSymbol);
        //main(cryptSymbol);
        iniciarWorkerMon(cryptSymbol);
        //await travaDeSeguranca(cryptSymbol);

    }
    //iniciarWorker('KAITOUSDT');
    //iniciarWorker('1000SHIBUSDT');
    //iniciarWorker('LAYERUSDT');
}

execThreads();

//cryptSymbol = 'ADAUSDT';
//main(cryptSymbol);

//const trades = await require('./ADAUserTrades.yml');

// Controle global const agendamentosIniciados = {}; // Marca agendamentos por cripto let standBy = false; // Global
const agendamentosIniciados = {};
function agendarInitDados(cryptSymbol, getPrecoAtual, getStandBy) {
    if (agendamentosIniciados[cryptSymbol]) return;

    async function chamarInitDados() {
        if (!getStandBy()) {
            const precoAtual = getPrecoAtual();
            if (precoAtual !== undefined && precoAtual !== null) {
                console.log(`[initDados] Executando no minuto exato para ${cryptSymbol}`);
                initDados(cryptSymbol, precoAtual);
            }
        } else {
            console.log(`[initDados] Em standBy. Ignorando execução para ${cryptSymbol}`);
        }
    }

    const agora = new Date();
    const delay = (60 - agora.getSeconds()) * 1000 - agora.getMilliseconds();
    //setTimeout(() => {
    chamarInitDados();
    //setInterval(chamarInitDados, 60000);
    //}, delay);

    agendamentosIniciados[cryptSymbol] = true;

}



async function configRisk(cryptSymbol) {
    var positRisk = await api.getPositRisk(cryptSymbol);
    //console.log(`positRisk_MrgIsol-[${cryptSymbol}]`, positRisk[0].isolated);
    //console.log(`positRisk_Lev-[${cryptSymbol}]`, positRisk[0].leverage);

    var maxLev = await api.getMaxLeverage(cryptSymbol);
    //console.log(`maxLev-[${cryptSymbol}]`, maxLev[0].brackets[0].initialLeverage);

    if (parseInt(positRisk[0].leverage) !== parseInt(maxLev[0].brackets[0].initialLeverage)) {
        var setLev = await api.setLeverage(cryptSymbol, maxLev[0].brackets[0].initialLeverage);
        console.log(`setLeverage-[${cryptSymbol}]`, setLev);
    }

    if (positRisk[0].isolated == false) {
        var setMargIsolated = await api.setMargIsolated(cryptSymbol);
        console.log(`setMargIsolated-[${cryptSymbol}]`, setMargIsolated);
    }

}

async function main(cryptSymbol) {
    var number = 0; start_position: while (true) {
        //conectado = await verificarConexao();

        if (conectado) {
            await timeout(3000);

            console.time(`Main-[${cryptSymbol}]`);
            var mainTimePerfIn = Date.now();

            if (cryptSymbol) {

                var cacheTrv = [];
                cacheJson[cryptSymbol] = await carregarCache(cryptSymbol);
                cacheSimul = await carregarCache('SIMUL');
                cacheTrv = await carregarCache('TRAVA');

                console.log("");
                await travaDeSeguranca(cryptSymbol, simulation);
                const percent24h = cacheTrv.percent24h;
                const countSimulPos = position?.simulCount;
                const countLivePos = position?.liveCount;
                const simultPos = parseInt(process.env.TRDSIMULT);


                console.log('ONOFF:::::', onOff);
                console.log('SIMULATION:::::', simulation);
                console.log("");

                console.log('Meta do DIA (%) :', process.env.TPDIA);
                console.log('Limite de perdas do DIA (%):', process.env.SLDIA);


                console.log("");
                //console.log("CacheTrv : ", cacheTrv);
                if (cacheTrv.oldBalance !== undefined) {
                    console.log("Balanço inicial : ", cacheTrv.oldBalance.price);
                }
                console.log("Balanço atual : ", cacheTrv.balance);
                console.log('PnL em 24h (%): ', percent24h);
                console.log("");
                //console.log(`${cacheTrv.timeRest} para a proxima atualização de balanço.`);
                console.log(`proxima atualização: `, cacheTrv.timeRest);
                console.log("");
                // Atualiza standBy global
                if (
                    parseFloat(percent24h) >= parseFloat(process.env.TPDIA) ||
                    parseFloat(percent24h) <= parseFloat(process.env.SLDIA)
                ) {
                    //standBy = true;
                    console.log('>>> Sistema em standBy <<<');
                    console.log('>>> Limite de Take/Stop do dia atingido. <<<');
                    console.log("");
                    //await timeout(300000);
                    await timeout(120000);

                } else if (
                    (simulation && countSimulPos === simultPos) ||
                    (!simulation && countLivePos === simultPos)
                ) {
                    //standBy = true;
                    console.log('>>>> Sistema em standBy: limite de posições abertas atingido.');
                } else {
                    standBy = false;
                }
                console.log('StandBy:::::', standBy);
                // Agendar initDados sincronizado
                agendarInitDados(
                    cryptSymbol,
                    () => cacheJson[cryptSymbol]?.preco_atual,
                    () => standBy
                );


                if (!standBy && cacheSimul[cryptSymbol]) {
                    preco_atual = cacheJson[cryptSymbol].preco_atual;
                    await simulatePositonController(cryptSymbol, preco_atual, 1);
                }

                if (!standBy) {
                    const dados = cacheJson[cryptSymbol];
                    if (dados) {
                        objSendcalc = dados.objSendcalc;
                        objMarket = dados.objMarket;
                        objIndic = dados.objIndic;
                        preco_atual = dados.preco_atual;

                        if (!objSendcalc || Object.keys(objSendcalc).length === 0) {
                            await initDados(cryptSymbol, preco_atual);
                        } else {
                            await timeout(2000);
                            initDados(cryptSymbol, preco_atual);
                        }

                        //const timeApi = await api.time();
                        timestamp = await Date.now();


                        //if (timeApi && objSendcalc) {
                        if (timestamp && objSendcalc) {
                            //const signals = calcSignals(objSendcalc);
                            //objSendcalc.signals = signals;

                            await makeMoneyRain(timestamp, onOff, cryptSymbol, preco_atual, simulation);
                            await writeUserData(objSendcalc, cryptSymbol);
                            await histFix(timestamp, cryptSymbol);
                            var oldFlag = flag;
                            if (flag !== oldFlag && flag !== '') {
                                console.log(`\n${flag} ABERTO! (${preco_atual})\n`);
                            }
                        }
                    }
                }
            }

            const mainTimePerfOut = Date.now();
            const difTimePerfMain = mainTimePerfOut - mainTimePerfIn;
            if (difTimePerfMain >= 60000 && !standBy) {
                notificWin(preco_atual, cryptSymbol, 'slow', 'C');
            }
            console.timeEnd(`Main-[${cryptSymbol}]`);

        } else {
            notificWin(preco_atual, cryptSymbol, 'descon', 'C');
            console.log('Sem conexão com a internet. Pausando operações...');
            await timeout(10000);
        }

        if (number < 100) continue start_position;
        break;
    }

}



const SAR = (high, low, acceleration = 0.02, maximum = 0.2) => {
    let sar = high;
    let accelerationFactor = acceleration;
    let extremePrice = high;

    const calculateSAR = (newHigh, newLow) => {
        if (newHigh > extremePrice) {
            extremePrice = newHigh;
            accelerationFactor = Math.min(accelerationFactor + acceleration, maximum);
        } else if (newLow < extremePrice) {
            extremePrice = newLow;
            accelerationFactor = Math.min(accelerationFactor + acceleration, maximum);
        }

        sar = sar + accelerationFactor * (extremePrice - sar);
        return sar;
    };

    return calculateSAR;
};

function parabolicSAR(start, increment, maxValue, pHigh, pLow) {
    let sar = pLow[0]; // Inicializa o SAR com o primeiro valor de pLow
    let ep = pHigh[0]; // Inicializa o EP com o primeiro valor de pHigh
    let af = start; // Fator de aceleração inicial
    let uptrend = true; // Supondo que começamos com uma tendência de alta

    const sarValues = [sar];

    for (let i = 1; i < pHigh.length; i++) {
        if (uptrend) {
            sar = sar + af * (ep - sar);
            if (pLow[i] < sar) {
                uptrend = false;
                sar = ep;
                ep = pLow[i];
                af = start;
            } else {
                if (pHigh[i] > ep) {
                    ep = pHigh[i];
                    af = Math.min(af + increment, maxValue);
                }
            }
        } else {
            sar = sar - af * (sar - ep);
            if (pHigh[i] > sar) {
                uptrend = true;
                sar = ep;
                ep = pHigh[i];
                af = start;
            } else {
                if (pLow[i] < ep) {
                    ep = pLow[i];
                    af = Math.min(af + increment, maxValue);
                }
            }
        }
        sarValues.push(parseFloat(sar.toFixed(5)));
    }
    return sarValues;
}

function calcularParabolicSAR_old(precos, inicio = 0.02, incremento = 0.02, maxValue = 0.2) {

    const resultadosSAR = [];

    if (precos && precos.length > 0) {
        let sar = precos[0].low; // Inicializa o SAR com o menor preço inicial
        let ep = precos[0].high; // Inicializa o EP com o maior preço inicial
        let af = inicio; // Fator de aceleração inicial
        let tendenciaAlta = true; // Supondo que a tendência inicial é de alta

        for (let i = 1; i < precos.length; i++) {
            const { high, low } = precos[i];

            // Atualiza o SAR
            sar = sar + af * (ep - sar);

            if (tendenciaAlta) {
                // Ajusta o SAR se ele ultrapassar o preço mínimo atual ou anterior
                if (sar > low) {
                    tendenciaAlta = false;
                    sar = ep;
                    ep = low;
                    af = inicio;
                } else {
                    if (high > ep) {
                        ep = high;
                        af = Math.min(af + incremento, maxValue);
                    }
                }
            } else {
                // Ajusta o SAR se ele ultrapassar o preço máximo atual ou anterior
                if (sar < high) {
                    tendenciaAlta = true;
                    sar = ep;
                    ep = high;
                    af = inicio;
                } else {
                    if (low < ep) {
                        ep = low;
                        af = Math.min(af + incremento, maxValue);
                    }
                }
            }

            resultadosSAR.push(sar);
        }
    }
    return resultadosSAR;
}


function iniciarNovaAplicacao() {
    // Define o caminho para o arquivo da aplicação Node.js
    const appPath = './index.js';

    // Inicia a nova aplicação Node.js
    exec(`node ${appPath}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Erro ao iniciar a nova aplicação: ${error}`);
            return;
        }
        console.log(`Aplicação Node.js iniciada com sucesso`);
    });

    // Inicia a aplicação Node.js
    //child.start();
}


//}, process.env.CRAWLER_INTERVAL);
function calculateEMA(values, period) {

    var array3mClose = null;

    if (!Array.isArray(values)) {
        //throw new Error('values must be an array');
        array3mClose = Object.entries(marketData3m[`${cryptSymbol}`].close);

    }

    const k = 2 / (period + 1);
    return values.reduce((ema, value, index) => {
        if (index === 0) {
            return value;
        } else {
            return (value - ema) * k + ema;
        }
    }, 0);
}

function macdFunc(input) {

    const { values, fastPeriod, slowPeriod, signalPeriod } = input;
    //var resultList = [];
    const result = { MACD: undefined, signal: undefined, histogram: undefined, previousMACD: undefined };
    const result2 = { MACD: undefined, signal: undefined, histogram: undefined, previousMACD: undefined };

    //let previousMACD = undefined;

    var valuesCopy = values;

    for (let i = 1; i < values.length - 1; i++) {

        const fastEMA = calculateEMA(values, fastPeriod);
        const slowEMA = calculateEMA(values, slowPeriod);

        const macdLine = fastEMA - slowEMA;

        const signalValues = values.slice(slowPeriod - 1); // Start calculating signal line after slowPeriod - 1

        const signalEMA = calculateEMA(signalValues, signalPeriod);

        const signalLine = signalEMA;

        const histogram = signalLine !== undefined ? macdLine - signalLine : undefined;

        result.MACD = macdLine;
        result.signal = signalLine;
        result.histogram = histogram;

        //resultList.push(result);
    }

    //valuesCopy.pop();
    //var valuesC2 = valuesCopy;

    valuesCopy = values.slice(0, values.length - 1);

    for (let ii = 1; ii < valuesCopy.length - 1; ii++) {

        const fastEMA = calculateEMA(valuesCopy, fastPeriod);
        const slowEMA = calculateEMA(valuesCopy, slowPeriod);

        const macdLine = fastEMA - slowEMA;

        const signalValues = valuesCopy.slice(slowPeriod - 1); // Start calculating signal line after slowPeriod - 1

        const signalEMA = calculateEMA(signalValues, signalPeriod);

        const signalLine = signalEMA;

        const histogram = signalLine !== undefined ? macdLine - signalLine : undefined;

        result2.MACD = macdLine;
        result2.signal = signalLine;
        result2.histogram = histogram;
    }

    return { last: result, last2: result2 };
}
function invertList(list) {
    let reversedList = [];
    for (let i = list.length - 1; i >= 0; i--) {
        reversedList.push(list[i]);
    }
    return reversedList;
}
function calcEMA(period, values) {
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

// Exemplo de uso:
//const arrNumb1m_C = [/* array de preços de fechamento */];
//const ema1m5pList = calculateEMA(5, arrNumb1m_C);


async function initDados(cryptSymbol, preco_atual) {

    let min = 10000;
    let max = 30000;
    let randomInteger = Math.floor(Math.random() * (max - min + 1)) + min;
    //console.log(randomInteger);

    var initDControl = await carregarCache("initDControl");
    //console.log(`initDControl--->[${cryptSymbol}]:::: `, initDControl);
    if (initDControl == {}) {
        initDControl = [];
    }
    if (initDControl['flag'] == undefined) {
        initDControl['flag'] = false;
    }

    const SYMBOLS = Object.values(cryptSymbols);
    if (initDControl['queue'] == undefined) {

        initDControl['queue'] = SYMBOLS;
    } else {
        initDControl.queue = initDControl.queue.filter(symbol => SYMBOLS.includes(symbol));
    }

    // Opcional: salva imediatamente após limpar
    await salvarCache(initDControl, "initDControl");


    // Se outro símbolo estiver sendo processado, sai
    if (initDControl.processing && initDControl.queue[0] !== cryptSymbol) {
        console.log(`>> [${cryptSymbol}] aguardando na fila...`);
        return;
    }

    // Adiciona o símbolo na fila, se não existir
    if (!initDControl.queue.includes(cryptSymbol)) {
        initDControl.queue.push(cryptSymbol);
    }

    if (initDControl[cryptSymbol] == undefined) {
        initDControl[cryptSymbol] = {
            timestamp: Date.now(),
            lastTimestamp: Date.now(),
            timestampLimit: Date.now() + 5000 + randomInteger,
            cryptSymbol: cryptSymbol,
        }

        await salvarCache(initDControl, "initDControl");
    } else {
        var cont = initDControl[cryptSymbol].cont;
        if (cont == null) {
            initDControl[cryptSymbol].cont = 0;
            cont = 0;
            await salvarCache(initDControl, "initDControl");
        }
        //console.log(`initDControl[${initDControl.queue[0]}]`, initDControl[initDControl.queue[0]]);
        var minCont = 0;
        if (
            initDControl[`${initDControl.queue[0]}`] !== undefined
            && initDControl[`${initDControl.queue[1]}`] !== undefined
            && initDControl[`${initDControl.queue[2]}`] !== undefined
            && initDControl[`${initDControl.queue[3]}`] !== undefined
            && initDControl[`${initDControl.queue[4]}`] !== undefined
        ) {
            /*
            var contQ1 = initDControl[initDControl.queue[0]].cont;
            var contQ2 = initDControl[initDControl.queue[1]].cont;
            var contQ3 = initDControl[initDControl.queue[2]].cont;
            var contQ4 = initDControl[initDControl.queue[3]].cont;
            var contQ5 = initDControl[initDControl.queue[4]].cont;
            */

            var contQ1 = initDControl[initDControl.queue[0]].lastTimestamp;
            var contQ2 = initDControl[initDControl.queue[1]].lastTimestamp;
            var contQ3 = initDControl[initDControl.queue[2]].lastTimestamp;
            var contQ4 = initDControl[initDControl.queue[3]].lastTimestamp;
            var contQ5 = initDControl[initDControl.queue[4]].lastTimestamp;

            minCont = Math.min(contQ1, contQ2, contQ3, contQ4, contQ5);
        }
        /*
              const minCont = Math.min(
          ...Object.values(initDControl)
            .filter(item => typeof item === 'object' && item.cont !== undefined)
            .map(item => item.cont)
        );
        */
        const maxCont = Math.max(
            ...Object.values(initDControl)
                .filter(item => typeof item === 'object' && item.cont !== undefined)
                .map(item => item.cont)
        );
        //console.log("Menor valor de cont:", minCont);
        if (Date.now() <= initDControl[cryptSymbol].timestampLimit) {
            console.log("");
            console.log(`!!! InitDados[${cryptSymbol}] em StandBy !!!`)
            console.log("");
        } else if (Date.now() >= initDControl[cryptSymbol].timestampLimit //&& initDControl['flag'] == false
            //&& initDControl[cryptSymbol].cont == minCont
            && initDControl[cryptSymbol].lastTimestamp == minCont
            && (
                initDControl.queue[0] == cryptSymbol
                || initDControl.queue[1] == cryptSymbol
                || initDControl.queue[2] == cryptSymbol
                || initDControl.queue[3] == cryptSymbol
                || initDControl.queue[4] == cryptSymbol
            )
        ) {
            var lastTimestamp = initDControl[cryptSymbol].timestamp;
            initDControl[cryptSymbol] = {
                timestamp: Date.now(),
                timestampLimit: Date.now() + 5000 + randomInteger,
                cryptSymbol: cryptSymbol
            }
            initDControl[cryptSymbol].lastTimestamp = lastTimestamp;
            if (cont < maxCont - 2) {
                cont = maxCont - 1;
            }
            initDControl[cryptSymbol].cont = cont + 1;
            var timeDif = calcularTempoRestante(initDControl[cryptSymbol].timestamp, initDControl[cryptSymbol].lastTimestamp);
            initDControl[cryptSymbol].timeDif = timeDif;
            console.log("");
            console.log(`-->>> initDados[${cryptSymbol}]:::: em execução!! <<<--`);
            console.log("");
            initDControl['flag'] = true;

            await salvarCache(initDControl, "initDControl");
            //conectado = await verificarConexao();
            if (conectado) {
                console.log(`initDados_start[${cryptSymbol}]`);

                //await new Promise(resolve => setTimeout(resolve, 200));

                var objMarket = {};


                cacheJson[`${cryptSymbol}`] = await carregarCache(cryptSymbol);

                //console.log("cacheJson: ", cacheJson);

                preco_atual = cacheJson[`${cryptSymbol}`].preco_atual;

                //flagpos[`${cryptSymbol}`] = cacheJson[`${cryptSymbol}`].flagpos[`${cryptSymbol}`];

                //await db.get(db.child(dbRef, `objData/${cryptSymbol}/obj/flagpos/${cryptSymbol}`)).then((snapshot) => {    
                await db.get(db.child(dbRef, `objData/${cryptSymbol}/obj/flagpos`)).then((snapshot) => {

                    if (snapshot.exists()) {
                        const data = snapshot.val();

                        if (data) {

                            if ('undefined' in data) {
                                delete data.undefined;
                            }

                            //console.log("data: ", data);
                            flagpos = data;

                            if (flagpos !== undefined
                                && flagpos[`${cryptSymbol}`] !== undefined
                                && flagpos[`${cryptSymbol}`] !== ''
                                && cryptSymbol !== undefined
                                && cacheJson[`${cryptSymbol}`] !== undefined
                            ) {

                                flag = flagpos[`${cryptSymbol}`];
                                //cacheJson[`${cryptSymbol}`].flagpos = [];
                                cacheJson[`${cryptSymbol}`].flagpos[`${cryptSymbol}`] = flagpos[`${cryptSymbol}`];

                                salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                            }
                            //flag = data;               
                        }

                    } else {
                        console.log("No data flag available");
                    }

                }).catch((error) => {
                    console.error(error);
                });
                //console.log(">>>>> ANTES DO TIMESTAMP <<<<<");
                //const timeApi = await api.time();
                timestamp = await Date.now();
                //if (timeApi !== undefined) {
                if (timestamp !== undefined) {

                    //process.stdout.write('\033c');
                    console.log('');
                    //console.log(`serverTime: ${timeApi.data.serverTime}`);
                    //lastUpdate = formatTime(timeApi.data.serverTime);
                    lastUpdate = formatTime(timestamp);
                    //timestamp = timeApi.data.serverTime;
                    const updt = `--------------------------->>>> LastUpdate: ${lastUpdate}`;
                    //console.log(`--------------------------->>>> LastUpdate: ${lastUpdate}`);
                    console.log(updt);
                    console.log('');
                    //const carteira = await api.accountFutures(timeApi.data.serverTime);
                    const carteira = await api.accountFutures(timestamp);
                    //console.log(`TEST:  ${JSON.stringify(carteira.filter(b => b.asset === 'USDT'))}`);

                    if (carteira !== undefined) {
                        let resultLog = "";
                        const coin = await carteira.assets.filter(b => b.asset === 'USDT'); // || b.asset === 'USDT');
                        //console.log(`TEST:coin:  ${JSON.stringify(coin[0].availableBalance)}`);

                        for (let index = 1; index <= 3; index++) {
                            //console.log(`Positions loop: ${index}`);

                            await db.get(db.child(dbRef, `objData/${cryptSymbol}/positions/${cryptSymbol}`)).then((snapshot) => {
                                if (snapshot.exists()) {
                                    const data = snapshot.val();

                                    if (data) {
                                        position[`${cryptSymbol}`] = data;
                                        resultLog = `Ordem no par ${cryptSymbol} aberta`;
                                    }

                                } else {

                                    resultLog = "Nenhuma ordem aberta no momento";
                                    //flagLock = false;
                                    flag = "";
                                    flagpos[`${cryptSymbol}`] = "";
                                    //console.log("No data positions available");
                                    //cacheJson[`${cryptSymbol}`] = await carregarCache(cryptSymbol);
                                    /*
                                        if (cacheJson[`${cryptSymbol}`].positMaxPercent !== 0) {
                                            cacheJson[`${cryptSymbol}`].positMaxPercent = 0;
                                            salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                                        }
                                    */

                                }
                            }).catch((error) => {
                                console.error(error);
                            });
                        }

                        //console.log(resultLog);
                        var cachePos = await carregarCache('POSITIONS');

                        //positions = await carteira.positions.filter(b => b.unrealizedProfit !== '0.00000000'); // || b.asset === 'USDT');
                        var positions = await carteira.positions.filter(b => b.initialMargin !== '0'); // || b.asset === 'USDT');
                        //console.log(`TEST:positions[${cryptSymbol}]:  ${JSON.stringify(positions)}`);

                        //if(positions.length !== 0){

                        position[`${cryptSymbol}`] = await positions.filter(b => b.symbol == cryptSymbol);
                        //console.log(`TEST:position:  ${JSON.stringify(position[`${cryptSymbol}`])}`);
                        //db.set(db.ref(database, `objData/${cryptSymbol}/positions/${symbol}`), obj);
                        //}

                        if (position[`${cryptSymbol}`][0] == undefined || position[`${cryptSymbol}`][0] == null) {
                            flag = "";
                            flagpos[`${cryptSymbol}`] = "";
                            await api.cancelAllOrders(timestamp);
                            cacheJson[`${cryptSymbol}`].positMaxPercent = parseFloat(0);
                        } else {
                            position[`${cryptSymbol}`][0].flag = flag;

                            //calcStopEmerg(position[`${cryptSymbol}`][0]);
                            //calcTargetpercent(position[`${cryptSymbol}`][0]);
                        }

                        if (cachePos[`${cryptSymbol}`] !== undefined
                            && cachePos[`${cryptSymbol}`] !== null
                            && cachePos[`${cryptSymbol}`] !== position[`${cryptSymbol}`][0]
                            && position[`${cryptSymbol}`][0] == undefined) {

                            notificWin(preco_atual, cryptSymbol, 'close')
                        }

                        cachePos[`${cryptSymbol}`] = position[`${cryptSymbol}`][0];

                        if (cachePos[`${cryptSymbol}`] !== undefined) {
                            if (cachePos[`${cryptSymbol}`].entryTime == undefined || cachePos[`${cryptSymbol}`].entryTime == 0) {
                                cachePos[`${cryptSymbol}`].entryTime = cachePos[`${cryptSymbol}`].updateTime;
                            }
                        }

                        salvarCache(cachePos, 'POSITIONS');


                        availableBalance = coin[0].availableBalance;
                        balance = coin[0].walletBalance;
                        unrealizedProfit = coin[0].unrealizedProfit;
                        marginBalance = coin[0].marginBalance;
                    }

                    var count = null;

                    const countpos = Object.keys(position).filter(key => position[key] !== null).length;
                    const countpcrypt = Object.keys(cryptSymbols).filter(key => cryptSymbols[key] !== null).length;

                    if (countpos == countpcrypt) {
                        count = Object.keys(position).filter(key => position[key].length > 0).length;
                    }
                    console.log('initDados/count:', count);

                    var posSymb = undefined;

                    if (position[cryptSymbol] !== undefined) {
                        posSymb = position[cryptSymbol][0];
                    }

                    if (count == 0 || posSymb !== undefined) {
                        /*
                                    const result1m = [];
                                    const result3m = [];
                                    const result5m = [];
                                    const result15m = [];
                                    const result30m = [];
                                    const result1h = [];
                                    const result4h = [];
                                    const result1d = [];
                                    const result1w = [];
                        */

                        var result1m = [];
                        result1m[`${cryptSymbol}`] = {
                            data: null
                        }

                        var result3m = [];
                        result3m[`${cryptSymbol}`] = {
                            data: null
                        }

                        var result5m = [];
                        result5m[`${cryptSymbol}`] = {
                            data: null
                        }

                        var result15m = [];
                        result15m[`${cryptSymbol}`] = {
                            data: null
                        }

                        var result30m = [];
                        result30m[`${cryptSymbol}`] = {
                            data: null
                        }

                        var result1h = [];
                        result1h[`${cryptSymbol}`] = {
                            data: null
                        }

                        var result4h = [];
                        result4h[`${cryptSymbol}`] = {
                            data: null
                        }

                        var result1d = [];
                        result1d[`${cryptSymbol}`] = {
                            data: null
                        }

                        var result1w = [];
                        result1w[`${cryptSymbol}`] = {
                            data: null
                        }

                        if (cacheJson[`${cryptSymbol}`].objMarket !== undefined) {
                            objMarket = cacheJson[`${cryptSymbol}`].objMarket;
                        }


                        //1m
                        if (objMarket.klineRes1m !== null && objMarket.klineRes1m !== undefined) {
                            if (objMarket.klineRes1m.klineclose >= Date.now()) {

                                result1m[`${cryptSymbol}`].data = objMarket.klineRes1m.result1mdata;
                                //console.log(`initDados/klineRes1m[${cryptSymbol}]: Dados do cache`);

                            } else {

                                result1m[`${cryptSymbol}`] = await api.klines("1m", cryptSymbol);
                                //console.log(`initDados/klineRes1m[${cryptSymbol}]: Dados do API`);

                            }
                        } else {

                            result1m[`${cryptSymbol}`] = await api.klines("1m", cryptSymbol);
                            //console.log(`initDados/klineRes1m[${cryptSymbol}]: Dados do API`);
                        }


                        //3m
                        if (objMarket.klineRes3m !== null && objMarket.klineRes3m !== undefined) {
                            if (objMarket.klineRes3m.klineclose >= Date.now()) {

                                result3m[`${cryptSymbol}`].data = objMarket.klineRes3m.result3mdata;
                                //console.log(`initDados/klineRes3m[${cryptSymbol}]: Dados do cache`);

                            } else {

                                result3m[`${cryptSymbol}`] = await api.klines("3m", cryptSymbol);
                                //console.log(`initDados/klineRes3m[${cryptSymbol}]: Dados do API`);

                            }
                        } else {

                            result3m[`${cryptSymbol}`] = await api.klines("3m", cryptSymbol);
                            //console.log(`initDados/klineRes3m[${cryptSymbol}]: Dados do API`);
                        }

                        //5m
                        if (objMarket.klineRes5m !== null && objMarket.klineRes5m !== undefined) {
                            if (objMarket.klineRes5m.klineclose >= Date.now()) {

                                result5m[`${cryptSymbol}`].data = objMarket.klineRes5m.result5mdata;
                                //console.log(`initDados/klineRes5m[${cryptSymbol}]: Dados do cache`);

                            } else {

                                result5m[`${cryptSymbol}`] = await api.klines("5m", cryptSymbol);
                                //console.log(`initDados/klineRes5m[${cryptSymbol}]: Dados do API`);
                            }
                        } else {

                            result5m[`${cryptSymbol}`] = await api.klines("5m", cryptSymbol);
                            //console.log(`initDados/klineRes5m[${cryptSymbol}]: Dados do API`);
                        }

                        //15m
                        if (objMarket.klineRes15m !== null && objMarket.klineRes15m !== undefined) {
                            if (objMarket.klineRes15m.klineclose - 300000 >= Date.now()) {

                                result15m[`${cryptSymbol}`].data = objMarket.klineRes15m.result15mdata;
                                //console.log(`initDados/klineRes15m[${cryptSymbol}]: Dados do cache`);

                            } else {

                                result15m[`${cryptSymbol}`] = await api.klines("15m", cryptSymbol);
                                //console.log(`initDados/klineRes15m[${cryptSymbol}]: Dados do API`);
                            }
                        } else {

                            result15m[`${cryptSymbol}`] = await api.klines("15m", cryptSymbol);
                            //console.log(`initDados/klineRes15m[${cryptSymbol}]: Dados do API`);
                        }

                        //30m
                        if (objMarket.klineRes30m !== null && objMarket.klineRes30m !== undefined) {
                            if (objMarket.klineRes30m.klineclose - 1200000 >= Date.now()) {

                                result30m[`${cryptSymbol}`].data = objMarket.klineRes30m.result30mdata;
                                //console.log(`initDados/klineRes30m[${cryptSymbol}]: Dados do cache`);

                            } else {

                                result30m[`${cryptSymbol}`] = await api.klines("30m", cryptSymbol);
                                //console.log(`initDados/klineRes30m[${cryptSymbol}]: Dados do API`);

                            }
                        } else {

                            result30m[`${cryptSymbol}`] = await api.klines("30m", cryptSymbol);
                            //console.log(`initDados/klineRes30m[${cryptSymbol}]: Dados do API`);
                        }

                        //1h
                        if (objMarket.klineRes1h !== null && objMarket.klineRes1h !== undefined) {
                            if (objMarket.klineRes1h.klineclose >= Date.now()) {

                                result1h[`${cryptSymbol}`].data = objMarket.klineRes1h.result1hdata;
                                //console.log(`initDados/klineRes1h[${cryptSymbol}]: Dados do cache`);

                            } else {

                                result1h[`${cryptSymbol}`] = await api.klines("1h", cryptSymbol);
                                //console.log(`initDados/klineRes1h[${cryptSymbol}]: Dados do API`);
                            }
                        } else {

                            result1h[`${cryptSymbol}`] = await api.klines("1h", cryptSymbol);
                            //console.log(`initDados/klineRes1h[${cryptSymbol}]: Dados do API`);
                        }

                        //4h
                        if (objMarket.klineRes4h !== null && objMarket.klineRes4h !== undefined) {
                            if (objMarket.klineRes4h.klineclose >= Date.now()) {

                                result4h[`${cryptSymbol}`].data = objMarket.klineRes4h.result4hdata;
                                //console.log(`initDados/klineRes4h[${cryptSymbol}]: Dados do cache`);

                            } else {

                                result4h[`${cryptSymbol}`] = await api.klines("4h", cryptSymbol);
                                //console.log(`initDados/klineRes4h[${cryptSymbol}]: Dados do API`);
                            }
                        } else {

                            result4h[`${cryptSymbol}`] = await api.klines("4h", cryptSymbol);
                            //console.log(`initDados/klineRes4h[${cryptSymbol}]: Dados do API`);
                        }

                        // 1D
                        if (objMarket.klineRes1d !== null && objMarket.klineRes1d !== undefined) {
                            if (objMarket.klineRes1d.klineclose >= Date.now()) {

                                result1d[`${cryptSymbol}`].data = objMarket.klineRes1d.result1ddata;
                                //console.log(`initDados/klineRes1d[${cryptSymbol}]: Dados do cache`);

                            } else {

                                result1d[`${cryptSymbol}`] = await api.klines("1d", cryptSymbol);
                                //console.log(`initDados/klineRes1d[${cryptSymbol}]: Dados do API`);
                            }
                        } else {

                            result1d[`${cryptSymbol}`] = await api.klines("1d", cryptSymbol);
                            //console.log(`initDados/klineRes1d[${cryptSymbol}]: Dados do API`);
                        }

                        //1W
                        if (objMarket.klineRes1w !== null && objMarket.klineRes1w !== undefined) {
                            if (objMarket.klineRes1w.klineclose >= Date.now()) {

                                result1w[`${cryptSymbol}`].data = objMarket.klineRes1w.result1wdata;
                                //console.log(`initDados/klineRes1w[${cryptSymbol}]: Dados do cache`);

                            } else {

                                result1w[`${cryptSymbol}`] = await api.klines("1w", cryptSymbol);
                                //console.log(`initDados/klineRes1w[${cryptSymbol}]: Dados do API`);
                            }
                        } else {

                            result1w[`${cryptSymbol}`] = await api.klines("1w", cryptSymbol);
                            //console.log(`initDados/klineRes1w[${cryptSymbol}]: Dados do API`);
                        }


                        /*
                                    result1m[`${cryptSymbol}`] = await api.klines("1m", cryptSymbol);
                                    result3m[`${cryptSymbol}`] = await api.klines("3m", cryptSymbol);
                                    result5m[`${cryptSymbol}`] = await api.klines("5m", cryptSymbol);
                                    result15m[`${cryptSymbol}`] = await api.klines("15m", cryptSymbol);
                                    result30m[`${cryptSymbol}`] = await api.klines("30m", cryptSymbol);
                                    result1h[`${cryptSymbol}`] = await api.klines("1h", cryptSymbol);
                                    result4h[`${cryptSymbol}`] = await api.klines("4h", cryptSymbol);
                                    result1d[`${cryptSymbol}`] = await api.klines("1d", cryptSymbol);
                                    result1w[`${cryptSymbol}`] = await api.klines("1w", cryptSymbol);
                        */

                        if (result1m[`${cryptSymbol}`] !== undefined &&
                            result3m[`${cryptSymbol}`] !== undefined &&
                            result5m[`${cryptSymbol}`] !== undefined &&
                            result15m[`${cryptSymbol}`] !== undefined &&
                            result30m[`${cryptSymbol}`] !== undefined &&
                            result1h[`${cryptSymbol}`] !== undefined &&
                            result4h[`${cryptSymbol}`] !== undefined &&
                            result1d[`${cryptSymbol}`] !== undefined &&
                            result1w[`${cryptSymbol}`] !== undefined) {


                            //console.log('result1m.data.length: ', result1m[`${cryptSymbol}`].data.length);

                            criarObj1m(result1m[`${cryptSymbol}`].data, cryptSymbol);

                            for (let i = 0; i < result1m[`${cryptSymbol}`].data.length; i++) {
                                //criarObj1m(result1m[`${cryptSymbol}`].data[i], cryptSymbol);
                            }
                            //console.log("criarObj1mRES/dateArr1m", dateArr1m);

                            for (let i = 0; i < result3m[`${cryptSymbol}`].data.length; i++) {
                                criarObj3m(result3m[`${cryptSymbol}`].data, cryptSymbol);
                            }
                            for (let i = 0; i < result5m[`${cryptSymbol}`].data.length; i++) {
                                criarObj5m(result5m[`${cryptSymbol}`].data, cryptSymbol);
                            }
                            for (let i = 0; i < result15m[`${cryptSymbol}`].data.length; i++) {
                                criarObj15m(result15m[`${cryptSymbol}`].data, cryptSymbol);
                            }
                            for (let i = 0; i < result30m[`${cryptSymbol}`].data.length; i++) {
                                criarObj30m(result30m[`${cryptSymbol}`].data, cryptSymbol);
                            }
                            for (let i = 0; i < result1h[`${cryptSymbol}`].data.length; i++) {
                                criarObj1h(result1h[`${cryptSymbol}`].data, cryptSymbol);
                            }
                            for (let i = 0; i < result4h[`${cryptSymbol}`].data.length; i++) {
                                criarObj4h(result4h[`${cryptSymbol}`].data, cryptSymbol);
                            }
                            for (let i = 0; i < result1d[`${cryptSymbol}`].data.length; i++) {
                                criarObj1d(result1d[`${cryptSymbol}`].data, cryptSymbol);
                            }
                            for (let i = 0; i < result1w[`${cryptSymbol}`].data.length; i++) {
                                criarObj1w(result1w[`${cryptSymbol}`].data, cryptSymbol);
                            }
                            /*
                                            marketData1m = { date: dateArr1m[`${cryptSymbol}`], timestamp: timestampArr1m, open: openArr1m, close: closeArr1m, high: highArr1m, low: lowArr1m, volume: volArr1m };
                                            marketData3m = { date: dateArr3m, timestamp: timestampArr3m, open: openArr3m, close: closeArr3m, high: highArr3m, low: lowArr3m, volume: volArr3m };
                                            marketData5m = { date: dateArr5m, timestamp: timestampArr5m, open: openArr5m, close: closeArr5m, high: highArr5m, low: lowArr5m, volume: volArr5m };
                                            marketData15m = { date: dateArr15m, timestamp: timestampArr15m, open: openArr15m, close: closeArr15m, high: highArr15m, low: lowArr15m, volume: volArr15m };
                                            marketData30m = { date: dateArr30m, timestamp: timestampArr30m, open: openArr30m, close: closeArr30m, high: highArr30m, low: lowArr30m, volume: volArr30m };
                                            marketData1h = { date: dateArr1h, timestamp: timestampArr1h, open: openArr1h, close: closeArr1h, high: highArr1h, low: lowArr1h, volume: volArr1h };
                                            marketData4h = { date: dateArr4h, timestamp: timestampArr4h, open: openArr4h, close: closeArr4h, high: highArr4h, low: lowArr4h, volume: volArr4h };
                                            marketData1d = { date: dateArr1d, timestamp: timestampArr1d, open: openArr1d, close: closeArr1d, high: highArr1d, low: lowArr1d, volume: volArr1d };
                                            marketData1w = { date: dateArr1w, timestamp: timestampArr1w, open: openArr1w, close: closeArr1w, high: highArr1w, low: lowArr1w, volume: volArr1w };
                            
                            
                            var marketData1m = { date: dateArr1m[`${cryptSymbol}`], timestamp: timestampArr1m[`${cryptSymbol}`], open: openArr1m[`${cryptSymbol}`], close: closeArr1m[`${cryptSymbol}`], high: highArr1m[`${cryptSymbol}`], low: lowArr1m[`${cryptSymbol}`], volume: volArr1m[`${cryptSymbol}`] };
                            var marketData3m = { date: dateArr3m[`${cryptSymbol}`], timestamp: timestampArr3m[`${cryptSymbol}`], open: openArr3m[`${cryptSymbol}`], close: closeArr3m[`${cryptSymbol}`], high: highArr3m[`${cryptSymbol}`], low: lowArr3m[`${cryptSymbol}`], volume: volArr3m[`${cryptSymbol}`] };
                            var marketData5m = { date: dateArr5m[`${cryptSymbol}`], timestamp: timestampArr5m[`${cryptSymbol}`], open: openArr5m[`${cryptSymbol}`], close: closeArr5m[`${cryptSymbol}`], high: highArr5m[`${cryptSymbol}`], low: lowArr5m[`${cryptSymbol}`], volume: volArr5m[`${cryptSymbol}`] };
                            var marketData15m = { date: dateArr15m[`${cryptSymbol}`], timestamp: timestampArr15m[`${cryptSymbol}`], open: openArr15m[`${cryptSymbol}`], close: closeArr15m[`${cryptSymbol}`], high: highArr15m[`${cryptSymbol}`], low: lowArr15m[`${cryptSymbol}`], volume: volArr15m[`${cryptSymbol}`] };
                            var marketData30m = { date: dateArr30m[`${cryptSymbol}`], timestamp: timestampArr30m[`${cryptSymbol}`], open: openArr30m[`${cryptSymbol}`], close: closeArr30m[`${cryptSymbol}`], high: highArr30m[`${cryptSymbol}`], low: lowArr30m[`${cryptSymbol}`], volume: volArr30m[`${cryptSymbol}`] };
                            var marketData1h = { date: dateArr1h[`${cryptSymbol}`], timestamp: timestampArr1h[`${cryptSymbol}`], open: openArr1h[`${cryptSymbol}`], close: closeArr1h[`${cryptSymbol}`], high: highArr1h[`${cryptSymbol}`], low: lowArr1h[`${cryptSymbol}`], volume: volArr1h[`${cryptSymbol}`] };
                            var marketData4h = { date: dateArr4h[`${cryptSymbol}`], timestamp: timestampArr4h[`${cryptSymbol}`], open: openArr4h[`${cryptSymbol}`], close: closeArr4h[`${cryptSymbol}`], high: highArr4h[`${cryptSymbol}`], low: lowArr4h[`${cryptSymbol}`], volume: volArr4h[`${cryptSymbol}`] };
                            var marketData1d = { date: dateArr1d[`${cryptSymbol}`], timestamp: timestampArr1d[`${cryptSymbol}`], open: openArr1d[`${cryptSymbol}`], close: closeArr1d[`${cryptSymbol}`], high: highArr1d[`${cryptSymbol}`], low: lowArr1d[`${cryptSymbol}`], volume: volArr1d[`${cryptSymbol}`] };
                            var marketData1w = { date: dateArr1w[`${cryptSymbol}`], timestamp: timestampArr1w[`${cryptSymbol}`], open: openArr1w[`${cryptSymbol}`], close: closeArr1w[`${cryptSymbol}`], high: highArr1w[`${cryptSymbol}`], low: lowArr1w[`${cryptSymbol}`], volume: volArr1w[`${cryptSymbol}`] };
                            
                            */


                            //dateArr1m[`${cryptSymbol}`]

                            //console.log('');
                            //console.log(`dateArr1m[${cryptSymbol}]:`, dateArr1m[`${cryptSymbol}`]);


                            marketData1m[`${cryptSymbol}`] = { date: dateArr1m[`${cryptSymbol}`], timestamp: timestampArr1m[`${cryptSymbol}`], open: openArr1m[`${cryptSymbol}`], close: closeArr1m[`${cryptSymbol}`], high: highArr1m[`${cryptSymbol}`], low: lowArr1m[`${cryptSymbol}`], volume: volArr1m[`${cryptSymbol}`] };
                            marketData3m[`${cryptSymbol}`] = { date: dateArr3m[`${cryptSymbol}`], timestamp: timestampArr3m[`${cryptSymbol}`], open: openArr3m[`${cryptSymbol}`], close: closeArr3m[`${cryptSymbol}`], high: highArr3m[`${cryptSymbol}`], low: lowArr3m[`${cryptSymbol}`], volume: volArr3m[`${cryptSymbol}`] };
                            marketData5m[`${cryptSymbol}`] = { date: dateArr5m[`${cryptSymbol}`], timestamp: timestampArr5m[`${cryptSymbol}`], open: openArr5m[`${cryptSymbol}`], close: closeArr5m[`${cryptSymbol}`], high: highArr5m[`${cryptSymbol}`], low: lowArr5m[`${cryptSymbol}`], volume: volArr5m[`${cryptSymbol}`] };
                            marketData15m[`${cryptSymbol}`] = { date: dateArr15m[`${cryptSymbol}`], timestamp: timestampArr15m[`${cryptSymbol}`], open: openArr15m[`${cryptSymbol}`], close: closeArr15m[`${cryptSymbol}`], high: highArr15m[`${cryptSymbol}`], low: lowArr15m[`${cryptSymbol}`], volume: volArr15m[`${cryptSymbol}`] };
                            marketData30m[`${cryptSymbol}`] = { date: dateArr30m[`${cryptSymbol}`], timestamp: timestampArr30m[`${cryptSymbol}`], open: openArr30m[`${cryptSymbol}`], close: closeArr30m[`${cryptSymbol}`], high: highArr30m[`${cryptSymbol}`], low: lowArr30m[`${cryptSymbol}`], volume: volArr30m[`${cryptSymbol}`] };
                            marketData1h[`${cryptSymbol}`] = { date: dateArr1h[`${cryptSymbol}`], timestamp: timestampArr1h[`${cryptSymbol}`], open: openArr1h[`${cryptSymbol}`], close: closeArr1h[`${cryptSymbol}`], high: highArr1h[`${cryptSymbol}`], low: lowArr1h[`${cryptSymbol}`], volume: volArr1h[`${cryptSymbol}`] };
                            marketData4h[`${cryptSymbol}`] = { date: dateArr4h[`${cryptSymbol}`], timestamp: timestampArr4h[`${cryptSymbol}`], open: openArr4h[`${cryptSymbol}`], close: closeArr4h[`${cryptSymbol}`], high: highArr4h[`${cryptSymbol}`], low: lowArr4h[`${cryptSymbol}`], volume: volArr4h[`${cryptSymbol}`] };
                            marketData1d[`${cryptSymbol}`] = { date: dateArr1d[`${cryptSymbol}`], timestamp: timestampArr1d[`${cryptSymbol}`], open: openArr1d[`${cryptSymbol}`], close: closeArr1d[`${cryptSymbol}`], high: highArr1d[`${cryptSymbol}`], low: lowArr1d[`${cryptSymbol}`], volume: volArr1d[`${cryptSymbol}`] };
                            marketData1w[`${cryptSymbol}`] = { date: dateArr1w[`${cryptSymbol}`], timestamp: timestampArr1w[`${cryptSymbol}`], open: openArr1w[`${cryptSymbol}`], close: closeArr1w[`${cryptSymbol}`], high: highArr1w[`${cryptSymbol}`], low: lowArr1w[`${cryptSymbol}`], volume: volArr1w[`${cryptSymbol}`] };


                            //console.log('');
                            //console.log(`marketData.date(últimoCandle): ${JSON.stringify(marketData.date[result.data.length-2])}`);

                            const stochRsi1m = StochasticRSI.calculate({
                                values: marketData1m[`${cryptSymbol}`].close,
                                rsiPeriod: 14,
                                stochasticPeriod: 14,
                                kPeriod: 3,
                                dPeriod: 3
                            });

                            const stochRsi3m = StochasticRSI.calculate({
                                values: marketData3m[`${cryptSymbol}`].close,
                                rsiPeriod: 14,
                                stochasticPeriod: 14,
                                kPeriod: 3,
                                dPeriod: 3
                            });

                            const stochRsi5m = StochasticRSI.calculate({
                                values: marketData5m[`${cryptSymbol}`].close,
                                rsiPeriod: 14,
                                stochasticPeriod: 14,
                                kPeriod: 3,
                                dPeriod: 3
                            });

                            const stochRsi15m = StochasticRSI.calculate({
                                values: marketData15m[`${cryptSymbol}`].close,
                                rsiPeriod: 14,
                                stochasticPeriod: 14,
                                kPeriod: 3,
                                dPeriod: 3
                            });

                            const stochRsi30m = StochasticRSI.calculate({
                                values: marketData30m[`${cryptSymbol}`].close,
                                rsiPeriod: 14,
                                stochasticPeriod: 14,
                                kPeriod: 3,
                                dPeriod: 3
                            });

                            const stochRsi1h = StochasticRSI.calculate({
                                values: marketData1h[`${cryptSymbol}`].close,
                                rsiPeriod: 14,
                                stochasticPeriod: 14,
                                kPeriod: 3,
                                dPeriod: 3
                            });

                            const stochRsi4h = StochasticRSI.calculate({
                                values: marketData4h[`${cryptSymbol}`].close,
                                rsiPeriod: 14,
                                stochasticPeriod: 14,
                                kPeriod: 3,
                                dPeriod: 3
                            });

                            const stochRsi1d = StochasticRSI.calculate({
                                values: marketData1d[`${cryptSymbol}`].close,
                                rsiPeriod: 14,
                                stochasticPeriod: 14,
                                kPeriod: 3,
                                dPeriod: 3
                            });

                            const stochRsi1w = StochasticRSI.calculate({
                                values: marketData1w[`${cryptSymbol}`].close,
                                rsiPeriod: 14,
                                stochasticPeriod: 14,
                                kPeriod: 3,
                                dPeriod: 3
                            });

                            const ifr3m = IFR.calculate({
                                values: marketData3m[`${cryptSymbol}`].close,
                                period: 14
                            });

                            const ifr5m = IFR.calculate({
                                values: marketData5m[`${cryptSymbol}`].close,
                                period: 14
                            });

                            const ifr15m = IFR.calculate({
                                values: marketData15m[`${cryptSymbol}`].close,
                                period: 14
                            });



                            var period = 13

                            var input1m = {
                                high: marketData1m[`${cryptSymbol}`].high,
                                low: marketData1m[`${cryptSymbol}`].low,
                                close: marketData1m[`${cryptSymbol}`].close,
                                period: period
                            }

                            /*atr1m = ATR.calculate(input1m);
                            atr_atual_1m = atr1m[atr1m.length - 1];
                            atr_anterior_1m = atr1m[atr1m.length - 2];
                            atr_anterior2_1m = atr1m[atr1m.length - 3];*/
                            //console.log("atr_atual_1m:", atr_atual_1m);
                            //console.log("atr_anterior_1m:", atr_anterior_1m);


                            var input3m = {
                                high: marketData3m[`${cryptSymbol}`].high,
                                low: marketData3m[`${cryptSymbol}`].low,
                                close: marketData3m[`${cryptSymbol}`].close,
                                period: period
                            }


                            /*atr3m = ATR.calculate(input3m);
                            atr_atual_3m = atr3m[atr3m.length - 1];
                            atr_anterior_3m = atr3m[atr3m.length - 2];*/
                            //console.log("atr_atual_3m:", atr_atual_3m);
                            //console.log("atr_anterior_3m:", atr_anterior_3m);


                            // var BB = require('technicalindicators').BollingerBands
                            // ----- BB ------ 

                            // Supondo que você tenha um array de preços
                            const pricesbb = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

                            // Calculando as bandas de Bollinger
                            const periodbb = 20; // Período de cálculo
                            const deviation = 2; // Desvio padrão

                            /*const bollinger = new bollingerBands({
                                periodbb,
                                values: pricesbb,
                                deviation,
                            });*/

                            // Calculando as bandas de Bollinger
                            //const result = bollinger.getResult();

                            //console.log(result);

                            //var periodbb2 = 20

                            var inputInv = invertList(marketData3m[`${cryptSymbol}`].close);

                            var inputbb1m = {
                                period: 20,
                                values: marketData1m[`${cryptSymbol}`].close,
                                stdDev: 2
                            }

                            var inputbb3m = {
                                period: 20,
                                values: marketData3m[`${cryptSymbol}`].close,
                                stdDev: 2
                            }

                            var inputbb5m = {
                                period: 20,
                                values: marketData5m[`${cryptSymbol}`].close,
                                stdDev: 2
                            }

                            var inputbb15m = {
                                period: 20,
                                values: marketData15m[`${cryptSymbol}`].close,
                                stdDev: 2
                            }

                            var inputbb1h = {
                                period: 20,
                                values: marketData1h[`${cryptSymbol}`].close,
                                stdDev: 2
                            }

                            //var bollgrT = BB.calculate(inputbb);
                            //console.log(`Bollgr[${cryptSymbol}]:`, bollgrT);
                            /*
                                        var bollgr1m = bollingerbands(inputbb1m);
                                        var bollgr3m = bollingerbands(inputbb3m);
                                        var bollgr5m = bollingerbands(inputbb5m);
                                        var bollgr15m = bollingerbands(inputbb15m);
                                        var bollgr1h = bollingerbands(inputbb1h);
                            */
                            //var lastBB = bollgr3m[bollgr3m.length - 1];
                            //var lastBB2 = bollgr3m[bollgr3m.length - 2];
                            //console.log(`Bollgr0[${cryptSymbol}]:`, lastBB);
                            //console.log(`Bollgr1[${cryptSymbol}]:`, lastBB2);

                            /// ----- MACD --- 
                            // Supondo que você tenha um array de preços
                            const pricesmacd = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

                            // Calculando o MACD
                            const shortPeriod = 12; // Período curto
                            const longPeriod = 26; // Período longo
                            const signalPeriod = 9; // Período de sinal

                            /*
                                        const { macd, signal, histogram } = new MACD({
                                            values: pricesmacd,
                                            SimpleMAOscillator: false,
                                            SimpleMASignal: false,
                                            fastPeriod: shortPeriod,
                                            slowPeriod: longPeriod,
                                            signalPeriod: signalPeriod
                                        });
                            
                                        var inputmacd = {
                                            values: pricesmacd,
                                            SimpleMAOscillator: false,
                                            SimpleMASignal: false,
                                            fastPeriod: shortPeriod,
                                            slowPeriod: longPeriod,
                                            signalPeriod: signalPeriod
                                        };
                            
                            
                                        var macdVals = new MACD(inputmacd);
                                        console.log("macdVals:", macdVals);
                                        console.log("macdVals:", macd);
                            
                                        const input: MACDInput = {
                                            values: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
                                            fastPeriod: 12,
                                            slowPeriod: 26,
                                            signalPeriod: 9
                                        };
                            
                                        // Criar uma instância do MACD
                                        const macd = new MACD(input);
                            
                                        // Iterar sobre os resultados do MACD
                                        for (const result of macd) {
                                            console.log(result);
                                        }
                            */
                            // Exemplo de uso

                            var inputmacd3m = {
                                values: input3m.close,
                                fastPeriod: 12,
                                slowPeriod: 26,
                                signalPeriod: 9
                            };

                            var inputmacd15m = {
                                values: marketData15m[`${cryptSymbol}`].close,
                                fastPeriod: 12,
                                slowPeriod: 26,
                                signalPeriod: 9
                            };


                            //var macd3m = macdFunc(inputmacd3m);
                            //var macd15m = macdFunc(inputmacd3m);
                            //console.log(`Macd[${cryptSymbol}]:`, resultm);

                            //console.log(macd, signal, histogram);
                            /// ----- PRice Channel ---

                            const prices = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
                            const periodpc = 20;

                            //const result = priceChannel(prices, periodpc);
                            //const resultpc = priceChannel(input3m.close, periodpc);

                            //console.log(`resultpc[${cryptSymbol}]`, resultpc);
                            /*
                            console.log(`priceChannel/upperChannel0[${cryptSymbol}]`, resultpc.upperChannel[resultpc.upperChannel.length-1]); 
                            console.log(`priceChannel/upperChannel1[${cryptSymbol}]`, resultpc.upperChannel[resultpc.upperChannel.length-2]); 
                            console.log(`priceChannel/lowerChannel0[${cryptSymbol}]`, resultpc.lowerChannel[resultpc.lowerChannel.length-1]); 
                            console.log(`priceChannel/lowerChannel1[${cryptSymbol}]`, resultpc.lowerChannel[resultpc.lowerChannel.length-2]); 
                */

                            //marketData1m[`${cryptSymbol}`]
                            //console.log(`marketData1m[${cryptSymbol}]`, marketData1m[`${cryptSymbol}`]);

                            var candles1m = obterUltimosCandles(marketData1m[`${cryptSymbol}`]);
                            var candles3m = obterUltimosCandles(marketData3m[`${cryptSymbol}`]);
                            var candles5m = obterUltimosCandles(marketData5m[`${cryptSymbol}`]);
                            var candles15m = obterUltimosCandles(marketData15m[`${cryptSymbol}`]);
                            var candles30m = obterUltimosCandles(marketData30m[`${cryptSymbol}`]);

                            var candles1h = obterUltimosCandles(marketData1h[`${cryptSymbol}`]);
                            var candles4h = obterUltimosCandles(marketData4h[`${cryptSymbol}`]);

                            console.log(`candles1h${cryptSymbol}]`, candles1h[candles1h.length - 1].close);

                            //var candles5c = obterUltimos5CandlesCloses(marketData3m);

                            //console.log("candles[0]", candles[0]);
                            //console.log("candles[N]", candles[candles.length-1]);

                            // Exibindo o resultado
                            //console.log("obterUltimosDoisZigZags-Topos", result.topos);
                            //console.log("obterUltimosDoisZigZags-Topos", result.fundos);
                            //console.log("obterUltimosDoisZigZags", result);

                            preco_anterior_1m = parseFloat(marketData1m[`${cryptSymbol}`].close[marketData1m[`${cryptSymbol}`].close.length - 2]);
                            preco_anterior2_1m = parseFloat(marketData1m[`${cryptSymbol}`].close[marketData1m[`${cryptSymbol}`].close.length - 3]);
                            abertura_atual_1m = parseFloat(marketData1m[`${cryptSymbol}`].open[marketData1m[`${cryptSymbol}`].open.length - 1]);
                            abertura_anterior_1m = parseFloat(marketData1m[`${cryptSymbol}`].open[marketData1m[`${cryptSymbol}`].open.length - 2]);
                            abertura_anterior2_1m = parseFloat(marketData1m[`${cryptSymbol}`].open[marketData1m[`${cryptSymbol}`].open.length - 3]);
                            max_atual_1m = parseFloat(marketData1m[`${cryptSymbol}`].high[marketData1m[`${cryptSymbol}`].high.length - 1]);
                            max_anterior_1m = parseFloat(marketData1m[`${cryptSymbol}`].high[marketData1m[`${cryptSymbol}`].high.length - 2]);
                            max_anterior2_1m = parseFloat(marketData1m[`${cryptSymbol}`].high[marketData1m[`${cryptSymbol}`].high.length - 3]);
                            min_atual_1m = parseFloat(marketData1m[`${cryptSymbol}`].low[marketData1m[`${cryptSymbol}`].low.length - 1]);
                            min_anterior_1m = parseFloat(marketData1m[`${cryptSymbol}`].low[marketData1m[`${cryptSymbol}`].low.length - 2]);
                            min_anterior2_1m = parseFloat(marketData1m[`${cryptSymbol}`].low[marketData1m[`${cryptSymbol}`].low.length - 3]);

                            preco_anterior_3m = parseFloat(marketData3m[`${cryptSymbol}`].close[marketData3m[`${cryptSymbol}`].close.length - 2]);
                            preco_anterior2_3m = parseFloat(marketData3m[`${cryptSymbol}`].close[marketData3m[`${cryptSymbol}`].close.length - 3]);
                            abertura_atual_3m = parseFloat(marketData3m[`${cryptSymbol}`].open[marketData3m[`${cryptSymbol}`].open.length - 1]);
                            abertura_anterior_3m = parseFloat(marketData3m[`${cryptSymbol}`].open[marketData3m[`${cryptSymbol}`].open.length - 2]);
                            abertura_anterior2_3m = parseFloat(marketData3m[`${cryptSymbol}`].open[marketData3m[`${cryptSymbol}`].open.length - 3]);
                            max_atual_3m = parseFloat(marketData3m[`${cryptSymbol}`].high[marketData3m[`${cryptSymbol}`].high.length - 1]);
                            max_anterior_3m = parseFloat(marketData3m[`${cryptSymbol}`].high[marketData3m[`${cryptSymbol}`].high.length - 2]);
                            max_anterior2_3m = parseFloat(marketData3m[`${cryptSymbol}`].high[marketData3m[`${cryptSymbol}`].high.length - 3]);
                            min_atual_3m = parseFloat(marketData3m[`${cryptSymbol}`].low[marketData3m[`${cryptSymbol}`].low.length - 1]);
                            min_anterior_3m = parseFloat(marketData3m[`${cryptSymbol}`].low[marketData3m[`${cryptSymbol}`].low.length - 2]);
                            min_anterior2_3m = parseFloat(marketData3m[`${cryptSymbol}`].low[marketData3m[`${cryptSymbol}`].low.length - 3]);

                            preco_anterior_5m = parseFloat(marketData5m[`${cryptSymbol}`].close[marketData5m[`${cryptSymbol}`].close.length - 2]);
                            var preco_anterior2_5m = parseFloat(marketData5m[`${cryptSymbol}`].close[marketData5m[`${cryptSymbol}`].close.length - 3]);
                            abertura_atual_5m = parseFloat(marketData5m[`${cryptSymbol}`].open[marketData5m[`${cryptSymbol}`].open.length - 1]);
                            abertura_anterior_5m = parseFloat(marketData5m[`${cryptSymbol}`].open[marketData5m[`${cryptSymbol}`].open.length - 2]);
                            abertura_anterior2_5m = parseFloat(marketData5m[`${cryptSymbol}`].open[marketData5m[`${cryptSymbol}`].open.length - 3]);
                            max_atual_5m = parseFloat(marketData5m[`${cryptSymbol}`].high[marketData5m[`${cryptSymbol}`].high.length - 1]);
                            max_anterior_5m = parseFloat(marketData5m[`${cryptSymbol}`].high[marketData5m[`${cryptSymbol}`].high.length - 2]);
                            max_anterior2_5m = parseFloat(marketData5m[`${cryptSymbol}`].high[marketData5m[`${cryptSymbol}`].high.length - 3]);
                            min_atual_5m = parseFloat(marketData5m[`${cryptSymbol}`].low[marketData5m[`${cryptSymbol}`].low.length - 1]);
                            min_anterior_5m = parseFloat(marketData5m[`${cryptSymbol}`].low[marketData5m[`${cryptSymbol}`].low.length - 2]);
                            min_anterior2_5m = parseFloat(marketData5m[`${cryptSymbol}`].low[marketData5m[`${cryptSymbol}`].low.length - 3]);

                            preco_anterior_15m = parseFloat(marketData15m[`${cryptSymbol}`].close[marketData15m[`${cryptSymbol}`].close.length - 2]);
                            preco_anterior2_15m = parseFloat(marketData15m[`${cryptSymbol}`].close[marketData15m[`${cryptSymbol}`].close.length - 3]);
                            abertura_atual_15m = parseFloat(marketData15m[`${cryptSymbol}`].open[marketData15m[`${cryptSymbol}`].open.length - 1]);
                            abertura_anterior_15m = parseFloat(marketData15m[`${cryptSymbol}`].open[marketData15m[`${cryptSymbol}`].open.length - 2]);
                            abertura_anterior2_15m = parseFloat(marketData15m[`${cryptSymbol}`].open[marketData15m[`${cryptSymbol}`].open.length - 3]);
                            max_atual_15m = parseFloat(marketData15m[`${cryptSymbol}`].high[marketData15m[`${cryptSymbol}`].high.length - 1]);
                            max_anterior_15m = parseFloat(marketData15m[`${cryptSymbol}`].high[marketData15m[`${cryptSymbol}`].high.length - 2]);
                            max_anterior2_15m = parseFloat(marketData15m[`${cryptSymbol}`].high[marketData15m[`${cryptSymbol}`].high.length - 3]);
                            min_atual_15m = parseFloat(marketData15m[`${cryptSymbol}`].low[marketData15m[`${cryptSymbol}`].low.length - 1]);
                            min_anterior_15m = parseFloat(marketData15m[`${cryptSymbol}`].low[marketData15m[`${cryptSymbol}`].low.length - 2]);
                            min_anterior2_15m = parseFloat(marketData15m[`${cryptSymbol}`].low[marketData15m[`${cryptSymbol}`].low.length - 3]);

                            preco_anterior_30m = parseFloat(marketData30m[`${cryptSymbol}`].close[marketData30m[`${cryptSymbol}`].close.length - 2]);
                            preco_anterior2_30m = parseFloat(marketData30m[`${cryptSymbol}`].close[marketData30m[`${cryptSymbol}`].close.length - 3]);
                            abertura_atual_30m = parseFloat(marketData30m[`${cryptSymbol}`].open[marketData30m[`${cryptSymbol}`].open.length - 1]);
                            abertura_anterior_30m = parseFloat(marketData30m[`${cryptSymbol}`].open[marketData30m[`${cryptSymbol}`].open.length - 2]);
                            abertura_anterior2_30m = parseFloat(marketData30m[`${cryptSymbol}`].open[marketData30m[`${cryptSymbol}`].open.length - 3]);
                            max_atual_30m = parseFloat(marketData30m[`${cryptSymbol}`].high[marketData30m[`${cryptSymbol}`].high.length - 1]);
                            max_anterior_30m = parseFloat(marketData30m[`${cryptSymbol}`].high[marketData30m[`${cryptSymbol}`].high.length - 2]);
                            max_anterior2_30m = parseFloat(marketData30m[`${cryptSymbol}`].high[marketData30m[`${cryptSymbol}`].high.length - 3]);
                            min_atual_30m = parseFloat(marketData30m[`${cryptSymbol}`].low[marketData30m[`${cryptSymbol}`].low.length - 1]);
                            min_anterior_30m = parseFloat(marketData30m[`${cryptSymbol}`].low[marketData30m[`${cryptSymbol}`].low.length - 2]);
                            min_anterior2_30m = parseFloat(marketData30m[`${cryptSymbol}`].low[marketData30m[`${cryptSymbol}`].low.length - 3]);

                            preco_anterior_1d = parseFloat(marketData1d[`${cryptSymbol}`].close[marketData1d[`${cryptSymbol}`].close.length - 2]);
                            preco_anterior2_1d = parseFloat(marketData1d[`${cryptSymbol}`].close[marketData1d[`${cryptSymbol}`].close.length - 3]);
                            abertura_atual_1d = parseFloat(marketData1d[`${cryptSymbol}`].open[marketData1d[`${cryptSymbol}`].open.length - 1]);
                            abertura_anterior_1d = parseFloat(marketData1d[`${cryptSymbol}`].open[marketData1d[`${cryptSymbol}`].open.length - 2]);
                            abertura_anterior2_1d = parseFloat(marketData1d[`${cryptSymbol}`].open[marketData1d[`${cryptSymbol}`].open.length - 3]);
                            max_atual_1d = parseFloat(marketData1d[`${cryptSymbol}`].high[marketData1d[`${cryptSymbol}`].high.length - 1]);
                            max_anterior_1d = parseFloat(marketData1d[`${cryptSymbol}`].high[marketData1d[`${cryptSymbol}`].high.length - 2]);
                            max_anterior2_1d = parseFloat(marketData1d[`${cryptSymbol}`].high[marketData1d[`${cryptSymbol}`].high.length - 3]);
                            min_atual_1d = parseFloat(marketData1d[`${cryptSymbol}`].low[marketData1d[`${cryptSymbol}`].low.length - 1]);
                            min_anterior_1d = parseFloat(marketData1d[`${cryptSymbol}`].low[marketData1d[`${cryptSymbol}`].low.length - 2]);
                            min_anterior2_1d = parseFloat(marketData1d[`${cryptSymbol}`].low[marketData1d[`${cryptSymbol}`].low.length - 3]);


                            //console.log("pontosZigZag[0]:", pontosZigZag[0]);
                            //console.log("pontosZigZag[N]:", pontosZigZag[pontosZigZag.length-1]);
                            //console.log('');     

                            //console.log("pontosZigZag2[0]:", pontosZigZag2[0]);
                            //console.log("pontosZigZag2[N]:", pontosZigZag2[pontosZigZag.length-1]);
                            //console.log('');        


                            //candles1m
                            //console.log(`>>>--[candles1m]-->`, candles1m);
                            var pontosZigZag1 = calcularZigZag(candles1m); // Defina o threshold adequado
                            var pontosZigZag2 = calcularZigZag(candles3m); // Defina o threshold adequado
                            var pontosZigZag3 = calcularZigZag(candles5m); // Defina o threshold adequado
                            var pontosZigZag4 = calcularZigZag(candles15m); // Defina o threshold adequado
                            var pontosZigZag5 = calcularZigZag(candles1h); // Defina o threshold adequado
                            var pontosZigZag6 = calcularZigZag(candles4h); // Defina o threshold adequado

                            zigzag = pontosZigZag2.zigzag;

                            //console.log("zigzag", zigzag);

                            //console.log("pontosZigZag4.pontosUnificados:", pontosZigZag4.pontosUnificados);
                            //console.log('');
                            /*
                                            console.log("");
                                            console.log(`<--[${cryptSymbol}]-->`);
                                            console.log("");
                            
                                            console.log('candles1m[0].close', candles1m[0].close)
                                            console.log('marketData1m.close', marketData1m[`${cryptSymbol}`].close)
                                            console.log('');
                            */

                            const resTend4h = calcularLinhaTendencia(candles4h, pontosZigZag6.pontosUnificados);
                            const resTend1h = calcularLinhaTendencia(candles1h, pontosZigZag5.pontosUnificados);

                            const resTend15m = calcularLinhaTendencia(candles15m, pontosZigZag4.pontosUnificados);

                            const resTend5m = calcularLinhaTendencia(candles5m, pontosZigZag3.pontosUnificados);
                            const resTend3m = calcularLinhaTendencia(candles3m, pontosZigZag2.pontosUnificados);
                            const resTend1m = calcularLinhaTendencia(candles1m, pontosZigZag1.pontosUnificados);

                            //console.log("resTend1m:", resTend1m);
                            //console.log("resTend3m:", resTend3m);
                            //console.log("resTend5m:", resTend5m);

                            //console.log("resTend15m:", resTend15m);
                            //console.log("resTend1h:", resTend1h);
                            //console.log("resTend4h:", resTend4h);

                            //const resTend1h = calcularLinhaTendencia(candles1h, pontosZigZag.pontosUnificados);
                            //const resTend15m = calcularLinhaTendencia(candles15m, pontosZigZag2.pontosUnificados);
                            //const resTend1h = calcularLinhaTendencia(candles1h, pontosZigZag.pontosUnificados);
                            ///const resTend4h = calcularLinhaTendencia(candles1h, pontosZigZag.pontosUnificados);

                            //console.log('LinhaTendencia', resTend15m); // valor da linha de tendência no último candle gerado

                            var fibo = [];
                            //dir = [];
                            var dir = {};

                            const retracObj = calcularRetracoesFibonacci(pontosZigZag1.pontosUnificados);
                            const retracObj2 = calcularRetracoesFibonacci(pontosZigZag2.pontosUnificados);
                            const fiboRetrac = retracObj.retrac;
                            dir = retracObj.dir;
                            //console.log("retrações:", fiboRetrac);
                            //console.log("FIBO:", retracObj);

                            if (objMarket !== undefined) {
                                fibo = objMarket.fibo;
                                dir = objMarket.dir;
                            }

                            /*
                        
                            let linhaDeTendenciaAltos = zigZagLtb(candles, result.topos[1], result.topos[0]);
                            let linhaDeTendenciaBaixos = zigZagLta(candles, result.fundos[1], result.fundos[0]);
                        
                            let linhaDeTendenciaAltos2 = zigZagLtb(candles, result2.topos[1], result2.topos[0]);
                            let linhaDeTendenciaBaixos2 = zigZagLta(candles, result2.fundos[1], result2.fundos[0]);
                            
                            // */

                            //

                            const arrNumb1m_H = marketData1m[`${cryptSymbol}`].high.map((i) => Number(i));
                            const arrNumb3m_H = marketData3m[`${cryptSymbol}`].high.map((i) => Number(i));
                            const arrNumb5m_H = marketData5m[`${cryptSymbol}`].high.map((i) => Number(i));
                            const arrNumb15m_H = marketData15m[`${cryptSymbol}`].high.map((i) => Number(i));
                            const arrNumb30m_H = marketData30m[`${cryptSymbol}`].high.map((i) => Number(i));
                            //const arrNumb1h_H = marketData1h.high.map((i) => Number(i));
                            const arrNumb4h_H = marketData4h[`${cryptSymbol}`].high.map((i) => Number(i));

                            const arrNumb1m_L = marketData1m[`${cryptSymbol}`].low.map((i) => Number(i));
                            const arrNumb3m_L = marketData3m[`${cryptSymbol}`].low.map((i) => Number(i));
                            const arrNumb5m_L = marketData5m[`${cryptSymbol}`].low.map((i) => Number(i));
                            const arrNumb15m_L = marketData15m[`${cryptSymbol}`].low.map((i) => Number(i));
                            const arrNumb30m_L = marketData30m[`${cryptSymbol}`].low.map((i) => Number(i));

                            const arrNumb1h_L = marketData1h[`${cryptSymbol}`].low.map((i) => Number(i));
                            const arrNumb1h_H = marketData1h[`${cryptSymbol}`].high.map((i) => Number(i));

                            const arrNumb4h_L = marketData4h[`${cryptSymbol}`].low.map((i) => Number(i));

                            const arrNumb1m_C = marketData1m[`${cryptSymbol}`].close.map((i) => Number(i));
                            const arrNumb3m_C = marketData3m[`${cryptSymbol}`].close.map((i) => Number(i));
                            const arrNumb5m_C = marketData5m[`${cryptSymbol}`].close.map((i) => Number(i));
                            const arrNumb15m_C = marketData15m[`${cryptSymbol}`].close.map((i) => Number(i));
                            const arrNumb30m_C = marketData30m[`${cryptSymbol}`].close.map((i) => Number(i));
                            const arrNumb1h_C = marketData1h[`${cryptSymbol}`].close.map((i) => Number(i));
                            const arrNumb4h_C = marketData4h[`${cryptSymbol}`].close.map((i) => Number(i));

                            const sma1m3pList = SMA.calculate({ period: 3, values: arrNumb1m_C });
                            const sma1m5pList = SMA.calculate({ period: 5, values: arrNumb1m_C });
                            const sma1m10pList = SMA.calculate({ period: 10, values: arrNumb1m_C });
                            const sma1m20pList = SMA.calculate({ period: 20, values: arrNumb1m_C });
                            const sma1m50pList = SMA.calculate({ period: 10, values: arrNumb5m_C });
                            const sma1m60pList = SMA.calculate({ period: 12, values: arrNumb5m_C });
                            const sma1m100pList = SMA.calculate({ period: 100, values: arrNumb1m_C });
                            const sma1m200pList = SMA.calculate({ period: 200, values: arrNumb1m_C });

                            ////
                            const sma1m90pList = SMA.calculate({ period: 90, values: arrNumb1m_C });
                            const sma5m20pList = SMA.calculate({ period: 20, values: arrNumb5m_C });
                            const sma5m24pList = SMA.calculate({ period: 24, values: arrNumb5m_C });
                            ////

                            const sma3m10pList = SMA.calculate({ period: 10, values: arrNumb3m_C });
                            const sma3m20pList = SMA.calculate({ period: 20, values: arrNumb3m_C });
                            const sma3m50pList = SMA.calculate({ period: 50, values: arrNumb3m_C });
                            const sma3m100pList = SMA.calculate({ period: 100, values: arrNumb3m_C });
                            const sma3m200pList = SMA.calculate({ period: 200, values: arrNumb3m_C });

                            const sma5m10pList = SMA.calculate({ period: 10, values: arrNumb5m_C });
                            //const sma5m20pList = SMA.calculate({ period: 20, values: arrNumb5m_C });
                            //const sma5m24pList = SMA.calculate({ period: 24, values: arrNumb5m_C });
                            const sma5m50pList = SMA.calculate({ period: 50, values: arrNumb5m_C });
                            const sma5m60pList = SMA.calculate({ period: 60, values: arrNumb5m_C });
                            const sma5m100pList = SMA.calculate({ period: 100, values: arrNumb5m_C });
                            const sma5m200pList = SMA.calculate({ period: 200, values: arrNumb5m_C });

                            const sma15m10pList = SMA.calculate({ period: 3, values: arrNumb15m_C });
                            const sma15m20pList = SMA.calculate({ period: 20, values: arrNumb15m_C });
                            const sma15m50pList = SMA.calculate({ period: 50, values: arrNumb15m_C });
                            const sma15m100pList = SMA.calculate({ period: 100, values: arrNumb15m_C });
                            const sma15m200pList = SMA.calculate({ period: 200, values: arrNumb15m_C });

                            const sma30m10pList = SMA.calculate({ period: 10, values: arrNumb30m_C });
                            const sma30m20pList = SMA.calculate({ period: 20, values: arrNumb30m_C });
                            const sma30m50pList = SMA.calculate({ period: 50, values: arrNumb30m_C });
                            const sma30m100pList = SMA.calculate({ period: 100, values: arrNumb30m_C });
                            const sma30m200pList = SMA.calculate({ period: 200, values: arrNumb30m_C });

                            const sma1h10pList = SMA.calculate({ period: 10, values: arrNumb1h_C });
                            const sma1h20pList = SMA.calculate({ period: 20, values: arrNumb1h_C });
                            const sma1h25pList = SMA.calculate({ period: 25, values: arrNumb1h_C });
                            const sma1h50pList = SMA.calculate({ period: 50, values: arrNumb1h_C });
                            const sma1h60pList = SMA.calculate({ period: 60, values: arrNumb1h_C });
                            const sma1h100pList = SMA.calculate({ period: 100, values: arrNumb1h_C });
                            const sma1h200pList = SMA.calculate({ period: 200, values: arrNumb1h_C });

                            const sma4h10pList = SMA.calculate({ period: 10, values: arrNumb4h_C });
                            const sma4h20pList = SMA.calculate({ period: 20, values: arrNumb4h_C });
                            const sma4h50pList = SMA.calculate({ period: 50, values: arrNumb4h_C });
                            const sma4h100pList = SMA.calculate({ period: 100, values: arrNumb4h_C });
                            const sma4h200pList = SMA.calculate({ period: 200, values: arrNumb4h_C });

                            const ema1m5pList = EMA.calculate({ period: 5, values: arrNumb1m_C });
                            const ema1m10pList = EMA.calculate({ period: 10, values: arrNumb1m_C });
                            const ema1m20pList = EMA.calculate({ period: 20, values: arrNumb1m_C });
                            const ema1m25pList = EMA.calculate({ period: 25, values: arrNumb1m_C });
                            const ema1m50pList = EMA.calculate({ period: 50, values: arrNumb1m_C });

                            //const ema1m100pList = EMA.calculate({ period: 100, values: arrNumb1m_C });
                            //const ema1m120pList = EMA.calculate({ period: 120, values: arrNumb1m_C });

                            const ema1m100pList = calcEMA(100, arrNumb1m_C);
                            const ema1m120pList = calcEMA(120, arrNumb1m_C);

                            const ema1m200pList = EMA.calculate({ period: 200, values: arrNumb1m_C });

                            const ema3m10pList = EMA.calculate({ period: 10, values: arrNumb3m_C });
                            const ema3m20pList = EMA.calculate({ period: 20, values: arrNumb3m_C });
                            const ema3m50pList = EMA.calculate({ period: 50, values: arrNumb3m_C });
                            const ema3m100pList = EMA.calculate({ period: 100, values: arrNumb3m_C });
                            const ema3m120pList = EMA.calculate({ period: 120, values: arrNumb3m_C });
                            const ema3m200pList = EMA.calculate({ period: 200, values: arrNumb3m_C });

                            const ema5m10pList = EMA.calculate({ period: 10, values: arrNumb5m_C });
                            const ema5m20pList = EMA.calculate({ period: 20, values: arrNumb5m_C });
                            const ema5m25pList = EMA.calculate({ period: 25, values: arrNumb5m_C });
                            const ema5m50pList = EMA.calculate({ period: 50, values: arrNumb5m_C });
                            const ema5m60pList = EMA.calculate({ period: 60, values: arrNumb5m_C });
                            const ema5m100pList = EMA.calculate({ period: 100, values: arrNumb5m_C });
                            const ema5m200pList = EMA.calculate({ period: 200, values: arrNumb5m_C });

                            const ema15m10pList = EMA.calculate({ period: 3, values: arrNumb15m_C });
                            const ema15m20pList = EMA.calculate({ period: 20, values: arrNumb15m_C });
                            const ema15m25pList = EMA.calculate({ period: 25, values: arrNumb15m_C });
                            const ema15m50pList = EMA.calculate({ period: 50, values: arrNumb15m_C });
                            const ema15m100pList = EMA.calculate({ period: 100, values: arrNumb15m_C });
                            const ema15m200pList = EMA.calculate({ period: 200, values: arrNumb15m_C });

                            const ema30m10pList = EMA.calculate({ period: 10, values: arrNumb30m_C });
                            const ema30m20pList = EMA.calculate({ period: 20, values: arrNumb30m_C });
                            const ema30m50pList = EMA.calculate({ period: 50, values: arrNumb30m_C });
                            const ema30m100pList = EMA.calculate({ period: 100, values: arrNumb30m_C });
                            const ema30m200pList = EMA.calculate({ period: 200, values: arrNumb30m_C });

                            const ema1h10pList = EMA.calculate({ period: 10, values: arrNumb1h_C });
                            const ema1h20pList = EMA.calculate({ period: 20, values: arrNumb1h_C });
                            const ema1h25pList = EMA.calculate({ period: 25, values: arrNumb1h_C });
                            const ema1h50pList = EMA.calculate({ period: 50, values: arrNumb1h_C });
                            const ema1h60pList = EMA.calculate({ period: 60, values: arrNumb1h_C });
                            const ema1h100pList = EMA.calculate({ period: 100, values: arrNumb1h_C });
                            const ema1h120pList = EMA.calculate({ period: 120, values: arrNumb1h_C });
                            const ema1h200pList = EMA.calculate({ period: 200, values: arrNumb1h_C });

                            const ema4h10pList = EMA.calculate({ period: 10, values: arrNumb4h_C });
                            const ema4h20pList = EMA.calculate({ period: 20, values: arrNumb4h_C });
                            const ema4h50pList = EMA.calculate({ period: 50, values: arrNumb4h_C });
                            const ema4h100pList = EMA.calculate({ period: 100, values: arrNumb4h_C });
                            const ema4h200pList = EMA.calculate({ period: 200, values: arrNumb4h_C });

                            //let high = [82.15,81.89,83.03,83.30,83.85,83.90,83.33,84.30,84.84,85.00,75.90,76.58,76.98,78.00,70.87];
                            //let low = [81.29,80.64,81.31,82.65,83.07,83.11,82.49,82.30,84.15,84.11,74.03,75.39,75.76,77.17,70.01];

                            //let step = 0.02;
                            //let max = 0.2;

                            //var high = arrNumb5m_H;
                            //var low = arrNumb5m_L;

                            var high = arrNumb15m_H;
                            var low = arrNumb15m_L;

                            /*
                                        var step1 = parseFloat(0.6);
                                        var max1 = parseFloat(2.2);
                            
                                        var step2 = parseFloat(0.02);
                                        var max2 = parseFloat(0.09);
                            */

                            var step1 = parseFloat(0.6);
                            var max1 = parseFloat(2.2);
                            var size1 = parseFloat(1.502);

                            var step2 = parseFloat(0.02);
                            var max2 = parseFloat(0.09);
                            var size2 = parseFloat(0.03);

                            //var timeValidateClose = histObj.lastHists.last1[1].lastUpdate;
                            //const timeval = calcularTempoRestante(timestamp, timeValidateClose);

                            let ta = new Indicators();

                            const close = [1, 2, 3, 4, 5, 6];

                            var sarPar1_1 = null;
                            var sarPar1_2 = null;
                            var sarPar2_1 = null;
                            var sarPar2_2 = null;
                            var sarPar3_1 = null;
                            var sarPar3_2 = null;
                            var sarPar4_1 = null;
                            var sarPar4_2 = null;

                            var sarPar1_3 = null;

                            //console.log("sarPar1_1:_", sarPar1_1[sarPar1_1.length-1]);
                            /*
                                        await ta.psar(arrNumb5m_H, arrNumb5m_L, step2, max2).then(data => {
                                            console.log("data:_", data[data.length - 1]);
                                            sarPar1_1 = data[data.length - 1];
                                        });
                            
                                        await ta.psar(arrNumb15m_H, arrNumb15m_L, step2, max2).then(data2 => {
                                            console.log("data2:_", data2[data2.length - 1]);
                                            sarPar1_2 = data2[data2.length - 1];
                                        });
                            
                                        await ta.psar(arrNumb30m_H, arrNumb30m_L, step2, max2).then(data3 => {
                                            console.log("data3:_", data3[data3.length - 1]);
                                            sarPar1_3 = data3[data3.length - 1];
                                        });
                            */

                            await ta.psar(arrNumb5m_H, arrNumb5m_L, step2, max2, size1).then(data => {
                                //console.log("data:_", data[data.length - 1]);
                                sarPar1_1 = data[data.length - 1];
                            });

                            await ta.psar(arrNumb5m_H, arrNumb5m_L, step2, max2, size2).then(data2 => {
                                //console.log("data2:_", data2[data2.length - 1]);
                                sarPar1_2 = data2[data2.length - 1];
                            });

                            await ta.psar(arrNumb15m_H, arrNumb15m_L, step2, max2, size2).then(data3 => {
                                //console.log("data3:_", data3[data3.length - 1]);
                                sarPar1_3 = data3[data3.length - 1];
                            });

                            //sarPar1_1 = calcularParabolicSAR(precos, inicio = 0.02, incremento = 0.02, maxValue = 0.2) {

                            //console.log("sarPar1_1:_", sarPar1_1);
                            //console.log("sarPar1_2:_", sarPar1_2);
                            //console.log("sarPar1_3:_", sarPar1_3);

                            //var sarNew1 = parabolicSAR(0.06, 1.502, 2.2, arrNumb3m_H, arrNumb3m_L);
                            //var sarNew2 = parabolicSAR(0.02, 0.028, 0.09, arrNumb3m_H, arrNumb3m_L);
                            //var sarNew3 = parabolicSAR(0.02, 0.028, 0.09, arrNumb5m_H, arrNumb5m_L);

                            //var sarNew1 = parabolicSAR(0.02, 0.028, 0.09, arrNumb1m_H, arrNumb1m_L);
                            //var sarNew2 = parabolicSAR(0.02, 0.028, 0.09, arrNumb5m_H, arrNumb5m_L);
                            //var sarNew3 = parabolicSAR(0.02, 0.028, 0.09, arrNumb15m_H, arrNumb15m_L);

                            var sarNew1 = parabolicSAR(0.06, 1.502, 2.2, arrNumb1m_H, arrNumb1m_L);
                            var sarNew2 = parabolicSAR(0.02, 0.028, 0.09, arrNumb1m_H, arrNumb1m_L);

                            var sarNew3 = parabolicSAR(0.06, 1.502, 2.2, arrNumb3m_H, arrNumb3m_L);
                            var sarNew4 = parabolicSAR(0.02, 0.028, 0.09, arrNumb3m_H, arrNumb3m_L);

                            var sarNew5 = parabolicSAR(0.06, 1.502, 2.2, arrNumb5m_H, arrNumb5m_L);
                            var sarNew6 = parabolicSAR(0.02, 0.028, 0.09, arrNumb5m_H, arrNumb5m_L);

                            var sarNew7 = parabolicSAR(0.06, 1.502, 2.2, arrNumb15m_H, arrNumb15m_L);
                            var sarNew8 = parabolicSAR(0.02, 0.028, 0.09, arrNumb15m_H, arrNumb15m_L);



                            sarPar1_1 = sarNew1[sarNew1.length - 1];
                            sarPar1_2 = sarNew2[sarNew2.length - 1];

                            sarPar2_1 = sarNew3[sarNew3.length - 1];
                            sarPar2_2 = sarNew4[sarNew4.length - 1];

                            sarPar3_1 = sarNew5[sarNew5.length - 1];
                            sarPar3_2 = sarNew6[sarNew6.length - 1];

                            sarPar4_1 = sarNew7[sarNew7.length - 1];
                            sarPar4_2 = sarNew8[sarNew8.length - 1];

                            /*
                                        console.log("sarPar1_1:_", sarPar1_1);
                                        console.log("sarPar1_2:_", sarPar1_2);
                                        console.log("sarPar2_1:_", sarPar2_1);
                                        console.log("sarPar2_2:_", sarPar2_2);
                                        console.log("sarPar3_1:_", sarPar3_1);
                                        console.log("sarPar3_2:_", sarPar3_2);
                                        console.log("sarPar4_1:_", sarPar4_1);
                                        console.log("sarPar4_2:_", sarPar4_2);
                            
                                        /*
                                        sarPar1_1:_ 0.38706
                                        sarPar1_2:_ 0.38699
                                        sarPar2_1:_ 0.38706
                                        sarPar2_2:_ 0.38699
                                        sarPar3_1:_ 0.38706
                                        sarPar3_2:_ 0.38699
                                        sarPar4_1:_ 0.38706
                                        sarPar4_2:_ 0.38699
                                        */

                            //sarPar1_3 = sarNew3[sarNew3.length-1];


                            //console.log("sarNew1:_0", sarNew1[sarNew1.length-1]);
                            //console.log("sarNew1:_1", sarNew1[sarNew1.length-2]);
                            //console.log("sarNew1:_2", sarNew1[sarNew1.length-3]);


                            //ta.psar(high, low, step2, max2).then(data2 => console.log("data2:_", data2[data2.length-1]));

                            //ta.ema(close, 3).then(result => {
                            //console.log("result:_", result)
                            // output: [1, 1.5, 2.25, 3.125, 4.0625, 5.03125]
                            //});


                            //await timeout(20000);

                            var input = { high, low, step1, max1 };
                            //let input2 = { high, low, step2, max2 };

                            //var sarPar1_1 = calcularSarParabolico(candles5m, 0.02, 0.02, 0.3);

                            //var sarPar1_1 = PSAR.calculate({ input: input });
                            //var sarPar1_2 = PSAR.calculate({ input: input2 });

                            //console.log('sarPar1_1:', sarPar1_1[sarPar1_1.length-1]);

                            //it('should be able to calculate PSAR by using getResult', function() {
                            var psar = new PSAR(input);
                            //let psar2 = new PSAR(input2);
                            //assert.deepEqual(psar.getResult(),  expectResult, 'Wrong Results while calculating next bar');
                            //});
                            //console.log("sarPar1_1", sarPar1_1);
                            //console.log('>>>>>>>>>>>>>>> psar:', psar);
                            //console.log('>>>>>>>>>>>>>>> psar:', psar.result[psar.result.length-1]);
                            //console.log('>>>>>>>>>>>>>>> psar2:', psar2.result[psar2.result.length-2]);

                            var decimais = await calcDecimais(cryptSymbol);

                            sma3p1m = parseFloat(sma1m3pList[sma1m3pList.length - 1].toFixed(decimais));
                            sma5p1m = parseFloat(sma1m5pList[sma1m5pList.length - 1].toFixed(decimais));
                            sma10p1m = parseFloat(sma1m10pList[sma1m10pList.length - 1].toFixed(decimais));
                            sma20p1m = parseFloat(sma1m20pList[sma1m20pList.length - 1].toFixed(decimais));
                            sma50p1m = parseFloat(sma1m50pList[sma1m50pList.length - 1].toFixed(decimais));
                            sma60p1m = parseFloat(sma1m60pList[sma1m60pList.length - 1].toFixed(decimais));
                            sma100p1m = parseFloat(sma1m100pList[sma1m100pList.length - 1].toFixed(decimais));
                            sma200p1m = parseFloat(sma1m200pList[sma1m200pList.length - 1].toFixed(decimais));

                            sma10p3m = parseFloat(sma3m10pList[sma3m10pList.length - 1].toFixed(decimais));
                            sma20p3m = parseFloat(sma3m20pList[sma3m20pList.length - 1].toFixed(decimais));
                            sma50p3m = parseFloat(sma3m50pList[sma3m50pList.length - 1].toFixed(decimais));
                            sma100p3m = parseFloat(sma3m100pList[sma3m100pList.length - 1].toFixed(decimais));
                            sma200p3m = parseFloat(sma3m200pList[sma3m200pList.length - 1].toFixed(decimais));

                            sma10p5m = parseFloat(sma5m10pList[sma5m10pList.length - 1].toFixed(decimais));
                            sma20p5m = parseFloat(sma5m20pList[sma5m20pList.length - 1].toFixed(decimais));
                            sma50p5m = parseFloat(sma5m50pList[sma5m50pList.length - 1].toFixed(decimais));
                            sma60p5m = parseFloat(sma5m60pList[sma5m60pList.length - 1].toFixed(decimais));
                            sma100p5m = parseFloat(sma5m100pList[sma5m100pList.length - 1].toFixed(decimais));
                            sma200p5m = parseFloat(sma5m200pList[sma5m200pList.length - 1].toFixed(decimais));

                            sma10p15m = parseFloat(sma15m10pList[sma15m10pList.length - 1].toFixed(decimais));
                            sma20p15m = parseFloat(sma15m20pList[sma15m20pList.length - 1].toFixed(decimais));
                            sma50p15m = parseFloat(sma15m50pList[sma15m50pList.length - 1].toFixed(decimais));
                            sma100p15m = parseFloat(sma15m100pList[sma15m100pList.length - 1].toFixed(decimais));
                            sma200p15m = parseFloat(sma15m200pList[sma15m200pList.length - 1].toFixed(decimais));

                            sma10p30m = parseFloat(sma30m10pList[sma30m10pList.length - 1].toFixed(decimais));
                            sma20p30m = parseFloat(sma30m20pList[sma30m20pList.length - 1].toFixed(decimais));
                            sma50p30m = parseFloat(sma30m50pList[sma30m50pList.length - 1].toFixed(decimais));
                            sma100p30m = parseFloat(sma30m100pList[sma30m100pList.length - 1].toFixed(decimais));
                            sma200p30m = parseFloat(sma30m200pList[sma30m200pList.length - 1].toFixed(decimais));

                            sma10p1h = parseFloat(sma1h10pList[sma1h10pList.length - 1].toFixed(decimais));
                            sma20p1h = parseFloat(sma1h20pList[sma1h20pList.length - 1].toFixed(decimais));
                            sma50p1h = parseFloat(sma1h50pList[sma1h50pList.length - 1].toFixed(decimais));
                            sma60p1h = parseFloat(sma1h60pList[sma1h60pList.length - 1].toFixed(decimais));
                            sma100p1h = parseFloat(sma1h100pList[sma1h100pList.length - 1].toFixed(decimais));
                            sma200p1h = parseFloat(sma1h200pList[sma1h200pList.length - 1].toFixed(decimais));

                            sma10p4h = parseFloat(sma4h10pList[sma4h10pList.length - 1].toFixed(decimais));
                            sma20p4h = parseFloat(sma4h20pList[sma4h20pList.length - 1].toFixed(decimais));
                            sma50p4h = parseFloat(sma4h50pList[sma4h50pList.length - 1].toFixed(decimais));
                            sma100p4h = parseFloat(sma4h100pList[sma4h100pList.length - 1].toFixed(decimais));
                            sma200p4h = parseFloat(sma4h200pList[sma4h200pList.length - 1].toFixed(decimais));

                            sma5p1mprev = parseFloat(sma1m5pList[sma1m5pList.length - 2].toFixed(decimais));
                            sma10p1mprev = parseFloat(sma1m10pList[sma1m10pList.length - 2].toFixed(decimais));
                            sma20p1mprev = parseFloat(sma1m20pList[sma1m20pList.length - 2].toFixed(decimais));
                            sma50p1mprev = parseFloat(sma1m50pList[sma1m50pList.length - 2].toFixed(decimais));
                            sma60p1mprev = parseFloat(sma1m60pList[sma1m60pList.length - 2].toFixed(decimais));
                            sma100p1mprev = parseFloat(sma1m100pList[sma1m100pList.length - 2].toFixed(decimais));
                            sma200p1mprev = parseFloat(sma1m200pList[sma1m200pList.length - 2].toFixed(decimais));

                            sma10p3mprev = parseFloat(sma3m10pList[sma3m10pList.length - 2].toFixed(decimais));
                            sma20p3mprev = parseFloat(sma3m20pList[sma3m20pList.length - 2].toFixed(decimais));
                            sma50p3mprev = parseFloat(sma3m50pList[sma3m50pList.length - 2].toFixed(decimais));
                            sma100p3mprev = parseFloat(sma3m100pList[sma3m100pList.length - 2].toFixed(decimais));
                            sma200p3mprev = parseFloat(sma3m200pList[sma3m200pList.length - 2].toFixed(decimais));

                            sma10p5mprev = parseFloat(sma5m10pList[sma5m10pList.length - 2].toFixed(decimais));
                            sma20p5mprev = parseFloat(sma5m20pList[sma5m20pList.length - 2].toFixed(decimais));
                            sma50p5mprev = parseFloat(sma5m50pList[sma5m50pList.length - 2].toFixed(decimais));
                            sma60p5mprev = parseFloat(sma5m60pList[sma5m60pList.length - 2].toFixed(decimais));
                            sma100p5mprev = parseFloat(sma5m100pList[sma5m100pList.length - 2].toFixed(decimais));
                            sma200p5mprev = parseFloat(sma5m200pList[sma5m200pList.length - 2].toFixed(decimais));

                            sma10p15mprev = parseFloat(sma15m10pList[sma15m10pList.length - 2].toFixed(decimais));
                            sma20p15mprev = parseFloat(sma15m20pList[sma15m20pList.length - 2].toFixed(decimais));
                            sma50p15mprev = parseFloat(sma15m50pList[sma15m50pList.length - 2].toFixed(decimais));
                            sma100p15mprev = parseFloat(sma15m100pList[sma15m100pList.length - 2].toFixed(decimais));
                            sma200p15mprev = parseFloat(sma15m200pList[sma15m200pList.length - 2].toFixed(decimais));

                            sma10p30mprev = parseFloat(sma30m10pList[sma30m10pList.length - 2].toFixed(decimais));
                            sma20p30mprev = parseFloat(sma30m20pList[sma30m20pList.length - 2].toFixed(decimais));
                            sma50p30mprev = parseFloat(sma30m50pList[sma30m50pList.length - 2].toFixed(decimais));
                            sma100p30mprev = parseFloat(sma30m100pList[sma30m100pList.length - 2].toFixed(decimais));
                            sma200p30mprev = parseFloat(sma30m200pList[sma30m200pList.length - 2].toFixed(decimais));

                            sma10p1hprev = parseFloat(sma1h10pList[sma1h10pList.length - 2].toFixed(decimais));
                            sma20p1hprev = parseFloat(sma1h20pList[sma1h20pList.length - 2].toFixed(decimais));
                            sma50p1hprev = parseFloat(sma1h50pList[sma1h50pList.length - 2].toFixed(decimais));
                            sma60p1hprev = parseFloat(sma1h60pList[sma1h60pList.length - 2].toFixed(decimais));
                            sma100p1hprev = parseFloat(sma1h100pList[sma1h100pList.length - 2].toFixed(decimais));
                            sma200p1hprev = parseFloat(sma1h200pList[sma1h200pList.length - 2].toFixed(decimais));

                            sma10p4hprev = parseFloat(sma4h10pList[sma4h10pList.length - 2].toFixed(decimais));
                            sma20p4hprev = parseFloat(sma4h20pList[sma4h20pList.length - 2].toFixed(decimais));
                            sma50p4hprev = parseFloat(sma4h50pList[sma4h50pList.length - 2].toFixed(decimais));
                            sma100p4hprev = parseFloat(sma4h100pList[sma4h100pList.length - 2].toFixed(decimais));
                            sma200p4hprev = parseFloat(sma4h200pList[sma4h200pList.length - 2].toFixed(decimais));

                            ema5p1m = parseFloat(ema1m5pList[ema1m5pList.length - 1].toFixed(decimais));
                            ema10p1m = parseFloat(ema1m10pList[ema1m10pList.length - 1].toFixed(decimais));
                            ema20p1m = parseFloat(ema1m20pList[ema1m20pList.length - 1].toFixed(decimais));
                            ema25p1m = parseFloat(ema1m25pList[ema1m25pList.length - 1].toFixed(decimais));
                            ema50p1m = parseFloat(ema1m50pList[ema1m50pList.length - 1].toFixed(decimais));
                            ema100p1m = parseFloat(ema1m100pList[ema1m100pList.length - 1].toFixed(decimais));
                            ema120p1m = parseFloat(ema1m120pList[ema1m120pList.length - 1].toFixed(decimais));
                            ema200p1m = parseFloat(ema1m200pList[ema1m200pList.length - 1].toFixed(decimais));

                            ema10p3m = parseFloat(ema3m10pList[ema3m10pList.length - 1].toFixed(decimais));
                            ema20p3m = parseFloat(ema3m20pList[ema3m20pList.length - 1].toFixed(decimais));
                            ema50p3m = parseFloat(ema3m50pList[ema3m50pList.length - 1].toFixed(decimais));
                            ema100p3m = parseFloat(ema3m100pList[ema3m100pList.length - 1].toFixed(decimais));
                            ema120p3m = parseFloat(ema3m120pList[ema3m120pList.length - 1].toFixed(decimais));
                            ema200p3m = parseFloat(ema3m200pList[ema3m200pList.length - 1].toFixed(decimais));

                            ema10p5m = parseFloat(ema5m10pList[ema5m10pList.length - 1].toFixed(decimais));
                            ema20p5m = parseFloat(ema5m20pList[ema5m20pList.length - 1].toFixed(decimais));
                            ema25p5m = parseFloat(ema5m25pList[ema5m25pList.length - 1].toFixed(decimais));
                            ema50p5m = parseFloat(ema5m50pList[ema5m50pList.length - 1].toFixed(decimais));
                            ema60p5m = parseFloat(ema5m60pList[ema5m60pList.length - 1].toFixed(decimais));
                            ema100p5m = parseFloat(ema5m100pList[ema5m100pList.length - 1].toFixed(decimais));
                            ema200p5m = parseFloat(ema5m200pList[ema5m200pList.length - 1].toFixed(decimais));

                            ema10p15m = parseFloat(ema15m10pList[ema15m10pList.length - 1].toFixed(decimais));
                            ema20p15m = parseFloat(ema15m20pList[ema15m20pList.length - 1].toFixed(decimais));
                            ema25p15m = parseFloat(ema15m25pList[ema15m25pList.length - 1].toFixed(decimais));
                            ema50p15m = parseFloat(ema15m50pList[ema15m50pList.length - 1].toFixed(decimais));
                            ema100p15m = parseFloat(ema15m100pList[ema15m100pList.length - 1].toFixed(decimais));
                            ema200p15m = parseFloat(ema15m200pList[ema15m200pList.length - 1].toFixed(decimais));

                            ema10p30m = parseFloat(ema30m10pList[ema30m10pList.length - 1].toFixed(decimais));
                            ema20p30m = parseFloat(ema30m20pList[ema30m20pList.length - 1].toFixed(decimais));
                            ema50p30m = parseFloat(ema30m50pList[ema30m50pList.length - 1].toFixed(decimais));
                            ema100p30m = parseFloat(ema30m100pList[ema30m100pList.length - 1].toFixed(decimais));
                            ema200p30m = parseFloat(ema30m200pList[ema30m200pList.length - 1].toFixed(decimais));

                            ema10p1h = parseFloat(ema1h10pList[ema1h10pList.length - 1].toFixed(decimais));
                            ema20p1h = parseFloat(ema1h20pList[ema1h20pList.length - 1].toFixed(decimais));
                            ema25p1h = parseFloat(ema1h25pList[ema1h25pList.length - 1].toFixed(decimais));
                            ema50p1h = parseFloat(ema1h50pList[ema1h50pList.length - 1].toFixed(decimais));
                            ema60p1h = parseFloat(ema1h60pList[ema1h60pList.length - 1].toFixed(decimais));
                            ema100p1h = parseFloat(ema1h100pList[ema1h100pList.length - 1].toFixed(decimais));
                            ema120p1h = parseFloat(ema1h120pList[ema1h120pList.length - 1].toFixed(decimais));
                            ema200p1h = parseFloat(ema1h200pList[ema1h200pList.length - 1].toFixed(decimais));

                            ema10p4h = parseFloat(ema4h10pList[ema4h10pList.length - 1].toFixed(decimais));
                            ema20p4h = parseFloat(ema4h20pList[ema4h20pList.length - 1].toFixed(decimais));
                            ema50p4h = parseFloat(ema4h50pList[ema4h50pList.length - 1].toFixed(decimais));
                            ema100p4h = parseFloat(ema4h100pList[ema4h100pList.length - 1].toFixed(decimais));
                            ema200p4h = parseFloat(ema4h200pList[ema4h200pList.length - 1].toFixed(decimais));

                            ema5p1mprev = parseFloat(ema1m5pList[ema1m5pList.length - 2].toFixed(decimais));
                            ema10p1mprev = parseFloat(ema1m10pList[ema1m10pList.length - 2].toFixed(decimais));
                            ema20p1mprev = parseFloat(ema1m20pList[ema1m20pList.length - 2].toFixed(decimais));
                            ema25p1mprev = parseFloat(ema1m25pList[ema1m25pList.length - 2].toFixed(decimais));
                            ema50p1mprev = parseFloat(ema1m50pList[ema1m50pList.length - 2].toFixed(decimais));
                            ema100p1mprev = parseFloat(ema1m100pList[ema1m100pList.length - 2].toFixed(decimais));
                            ema120p1mprev = parseFloat(ema1m120pList[ema1m120pList.length - 2].toFixed(decimais));
                            ema200p1mprev = parseFloat(ema1m200pList[ema1m200pList.length - 2].toFixed(decimais));

                            ema10p3mprev = parseFloat(ema3m10pList[ema3m10pList.length - 2].toFixed(decimais));
                            ema20p3mprev = parseFloat(ema3m20pList[ema3m20pList.length - 2].toFixed(decimais));
                            ema50p3mprev = parseFloat(ema3m50pList[ema3m50pList.length - 2].toFixed(decimais));
                            ema100p3mprev = parseFloat(ema3m100pList[ema3m100pList.length - 2].toFixed(decimais));
                            ema200p3mprev = parseFloat(ema3m200pList[ema3m200pList.length - 2].toFixed(decimais));

                            ema10p5mprev = parseFloat(ema5m10pList[ema5m10pList.length - 2].toFixed(decimais));
                            ema20p5mprev = parseFloat(ema5m20pList[ema5m20pList.length - 2].toFixed(decimais));
                            ema25p5mprev = parseFloat(ema5m25pList[ema5m25pList.length - 2].toFixed(decimais));
                            ema50p5mprev = parseFloat(ema5m50pList[ema5m50pList.length - 2].toFixed(decimais));
                            ema60p5mprev = parseFloat(ema5m60pList[ema5m60pList.length - 2].toFixed(decimais));
                            ema100p5mprev = parseFloat(ema5m100pList[ema5m100pList.length - 2].toFixed(decimais));
                            ema200p5mprev = parseFloat(ema5m200pList[ema5m200pList.length - 2].toFixed(decimais));

                            ema10p15mprev = parseFloat(ema15m10pList[ema15m10pList.length - 2].toFixed(decimais));
                            ema20p15mprev = parseFloat(ema15m20pList[ema15m20pList.length - 2].toFixed(decimais));
                            ema25p15mprev = parseFloat(ema15m25pList[ema15m25pList.length - 2].toFixed(decimais));
                            ema50p15mprev = parseFloat(ema15m50pList[ema15m50pList.length - 2].toFixed(decimais));
                            ema100p15mprev = parseFloat(ema15m100pList[ema15m100pList.length - 2].toFixed(decimais));
                            ema200p15mprev = parseFloat(ema15m200pList[ema15m200pList.length - 2].toFixed(decimais));

                            ema10p30mprev = parseFloat(ema30m10pList[ema30m10pList.length - 2].toFixed(decimais));
                            ema20p30mprev = parseFloat(ema30m20pList[ema30m20pList.length - 2].toFixed(decimais));
                            ema50p30mprev = parseFloat(ema30m50pList[ema30m50pList.length - 2].toFixed(decimais));
                            ema100p30mprev = parseFloat(ema30m100pList[ema30m100pList.length - 2].toFixed(decimais));
                            ema200p30mprev = parseFloat(ema30m200pList[ema30m200pList.length - 2].toFixed(decimais));

                            ema10p1hprev = parseFloat(ema1h10pList[ema1h10pList.length - 2].toFixed(decimais));
                            ema20p1hprev = parseFloat(ema1h20pList[ema1h20pList.length - 2].toFixed(decimais));
                            var ema25p1hprev = parseFloat(ema1h25pList[ema1h25pList.length - 2].toFixed(decimais));
                            ema50p1hprev = parseFloat(ema1h50pList[ema1h50pList.length - 2].toFixed(decimais));
                            ema60p1hprev = parseFloat(ema1h60pList[ema1h60pList.length - 2].toFixed(decimais));
                            ema100p1hprev = parseFloat(ema1h100pList[ema1h100pList.length - 2].toFixed(decimais));
                            ema120p1hprev = parseFloat(ema1h120pList[ema1h120pList.length - 2].toFixed(decimais));
                            ema200p1hprev = parseFloat(ema1h200pList[ema1h200pList.length - 2].toFixed(decimais));

                            ema10p4hprev = parseFloat(ema4h10pList[ema4h10pList.length - 2].toFixed(decimais));
                            ema20p4hprev = parseFloat(ema4h20pList[ema4h20pList.length - 2].toFixed(decimais));
                            ema50p4hprev = parseFloat(ema4h50pList[ema4h50pList.length - 2].toFixed(decimais));
                            ema100p4hprev = parseFloat(ema4h100pList[ema4h100pList.length - 2].toFixed(decimais));
                            ema200p4hprev = parseFloat(ema4h200pList[ema4h200pList.length - 2].toFixed(decimais));

                            sma1m3p = estaProximoDaLinha(cryptSymbol, sma3p1m, preco_atual);
                            sma1m5p = estaProximoDaLinha(cryptSymbol, sma5p1m, preco_atual);
                            sma1m10p = estaProximoDaLinha(cryptSymbol, sma10p1m, preco_atual);
                            sma1m20p = estaProximoDaLinha(cryptSymbol, sma20p1m, preco_atual);
                            sma1m50p = estaProximoDaLinha(cryptSymbol, sma50p1m, preco_atual);
                            sma1m60p = estaProximoDaLinha(cryptSymbol, sma60p1m, preco_atual);
                            sma1m100p = estaProximoDaLinha(cryptSymbol, sma100p1m, preco_atual);
                            sma1m200p = estaProximoDaLinha(cryptSymbol, sma200p1m, preco_atual);

                            sma3m10p = estaProximoDaLinha(cryptSymbol, sma10p3m, preco_atual);
                            sma3m20p = estaProximoDaLinha(cryptSymbol, sma20p3m, preco_atual);
                            sma3m50p = estaProximoDaLinha(cryptSymbol, sma50p3m, preco_atual);
                            sma3m100p = estaProximoDaLinha(cryptSymbol, sma100p3m, preco_atual);
                            sma3m200p = estaProximoDaLinha(cryptSymbol, sma200p3m, preco_atual);

                            sma5m10p = estaProximoDaLinha(cryptSymbol, sma10p5m, preco_atual);
                            sma5m20p = estaProximoDaLinha(cryptSymbol, sma20p5m, preco_atual);
                            sma5m50p = estaProximoDaLinha(cryptSymbol, sma50p5m, preco_atual);
                            sma5m60p = estaProximoDaLinha(cryptSymbol, sma60p5m, preco_atual);
                            sma5m100p = estaProximoDaLinha(cryptSymbol, sma100p5m, preco_atual);
                            sma5m200p = estaProximoDaLinha(cryptSymbol, sma200p5m, preco_atual);

                            sma15m10p = estaProximoDaLinha(cryptSymbol, sma10p15m, preco_atual);
                            sma15m20p = estaProximoDaLinha(cryptSymbol, sma20p15m, preco_atual);
                            sma15m50p = estaProximoDaLinha(cryptSymbol, sma50p15m, preco_atual);
                            sma15m100p = estaProximoDaLinha(cryptSymbol, sma100p15m, preco_atual);
                            sma15m200p = estaProximoDaLinha(cryptSymbol, sma200p15m, preco_atual);

                            sma30m10p = estaProximoDaLinha(cryptSymbol, sma10p30m, preco_atual);
                            sma30m20p = estaProximoDaLinha(cryptSymbol, sma20p30m, preco_atual);
                            sma30m50p = estaProximoDaLinha(cryptSymbol, sma50p30m, preco_atual);
                            sma30m100p = estaProximoDaLinha(cryptSymbol, sma100p30m, preco_atual);
                            sma30m200p = estaProximoDaLinha(cryptSymbol, sma200p30m, preco_atual);

                            sma1h10p = estaProximoDaLinha(cryptSymbol, sma10p1h, preco_atual);
                            sma1h20p = estaProximoDaLinha(cryptSymbol, sma20p1h, preco_atual);
                            sma1h50p = estaProximoDaLinha(cryptSymbol, sma50p1h, preco_atual);
                            sma1h60p = estaProximoDaLinha(cryptSymbol, sma60p1h, preco_atual);
                            sma1h100p = estaProximoDaLinha(cryptSymbol, sma100p1h, preco_atual);
                            sma1h200p = estaProximoDaLinha(cryptSymbol, sma200p1h, preco_atual);

                            sma4h10p = estaProximoDaLinha(cryptSymbol, sma10p4h, preco_atual);
                            sma4h20p = estaProximoDaLinha(cryptSymbol, sma20p4h, preco_atual);
                            sma4h50p = estaProximoDaLinha(cryptSymbol, sma50p4h, preco_atual);
                            sma4h100p = estaProximoDaLinha(cryptSymbol, sma100p4h, preco_atual);
                            sma4h200p = estaProximoDaLinha(cryptSymbol, sma200p4h, preco_atual);

                            sma1m5prev = estaProximoDaLinha(cryptSymbol, sma5p1mprev, preco_atual);
                            sma1m10prev = estaProximoDaLinha(cryptSymbol, sma10p1mprev, preco_atual);
                            sma1m20prev = estaProximoDaLinha(cryptSymbol, sma20p1mprev, preco_atual);
                            sma1m50prev = estaProximoDaLinha(cryptSymbol, sma50p1mprev, preco_atual);
                            sma1m60prev = estaProximoDaLinha(cryptSymbol, sma60p1mprev, preco_atual);
                            sma1m100prev = estaProximoDaLinha(cryptSymbol, sma100p1mprev, preco_atual);
                            sma1m200prev = estaProximoDaLinha(cryptSymbol, sma200p1mprev, preco_atual);

                            sma3m10prev = estaProximoDaLinha(cryptSymbol, sma10p3mprev, preco_atual);
                            sma3m20prev = estaProximoDaLinha(cryptSymbol, sma20p3mprev, preco_atual);
                            sma3m50prev = estaProximoDaLinha(cryptSymbol, sma50p3mprev, preco_atual);
                            sma3m100prev = estaProximoDaLinha(cryptSymbol, sma100p3mprev, preco_atual);
                            sma3m200prev = estaProximoDaLinha(cryptSymbol, sma200p3mprev, preco_atual);

                            sma5m10prev = estaProximoDaLinha(cryptSymbol, sma10p5mprev, preco_atual);
                            sma5m20prev = estaProximoDaLinha(cryptSymbol, sma20p5mprev, preco_atual);
                            sma5m50prev = estaProximoDaLinha(cryptSymbol, sma50p5mprev, preco_atual);
                            sma5m60prev = estaProximoDaLinha(cryptSymbol, sma60p5mprev, preco_atual);
                            sma5m100prev = estaProximoDaLinha(cryptSymbol, sma100p5mprev, preco_atual);
                            sma5m200prev = estaProximoDaLinha(cryptSymbol, sma200p5mprev, preco_atual);

                            sma15m10prev = estaProximoDaLinha(cryptSymbol, sma10p15mprev, preco_atual);
                            sma15m20prev = estaProximoDaLinha(cryptSymbol, sma20p15mprev, preco_atual);
                            sma15m50prev = estaProximoDaLinha(cryptSymbol, sma50p15mprev, preco_atual);
                            sma15m100prev = estaProximoDaLinha(cryptSymbol, sma100p15mprev, preco_atual);
                            sma15m200prev = estaProximoDaLinha(cryptSymbol, sma200p15mprev, preco_atual);

                            sma30m10prev = estaProximoDaLinha(cryptSymbol, sma10p30mprev, preco_atual);
                            sma30m20prev = estaProximoDaLinha(cryptSymbol, sma20p30mprev, preco_atual);
                            sma30m50prev = estaProximoDaLinha(cryptSymbol, sma50p30mprev, preco_atual);
                            sma30m100prev = estaProximoDaLinha(cryptSymbol, sma100p30mprev, preco_atual);
                            sma30m200prev = estaProximoDaLinha(cryptSymbol, sma200p30mprev, preco_atual);

                            sma1h10prev = estaProximoDaLinha(cryptSymbol, sma10p1hprev, preco_atual);
                            sma1h20prev = estaProximoDaLinha(cryptSymbol, sma20p1hprev, preco_atual);
                            sma1h50prev = estaProximoDaLinha(cryptSymbol, sma50p1hprev, preco_atual);
                            sma1h60prev = estaProximoDaLinha(cryptSymbol, sma60p1hprev, preco_atual);
                            sma1h100prev = estaProximoDaLinha(cryptSymbol, sma100p1hprev, preco_atual);
                            sma1h200prev = estaProximoDaLinha(cryptSymbol, sma200p1hprev, preco_atual);

                            sma4h10prev = estaProximoDaLinha(cryptSymbol, sma10p4hprev, preco_atual);
                            sma4h20prev = estaProximoDaLinha(cryptSymbol, sma20p4hprev, preco_atual);
                            sma4h50prev = estaProximoDaLinha(cryptSymbol, sma50p4hprev, preco_atual);
                            sma4h100prev = estaProximoDaLinha(cryptSymbol, sma100p4hprev, preco_atual);
                            sma4h200prev = estaProximoDaLinha(cryptSymbol, sma200p4hprev, preco_atual);
                            ema1m5p = estaProximoDaLinha(cryptSymbol, ema5p1m, preco_atual);
                            ema1m10p = estaProximoDaLinha(cryptSymbol, ema10p1m, preco_atual);
                            ema1m20p = estaProximoDaLinha(cryptSymbol, ema20p1m, preco_atual);
                            ema1m25p = estaProximoDaLinha(cryptSymbol, ema25p1m, preco_atual);
                            ema1m50p = estaProximoDaLinha(cryptSymbol, ema50p1m, preco_atual);

                            //console.log("ema1m50p_init", ema1m50p);

                            ema1m100p = estaProximoDaLinha(cryptSymbol, ema100p1m, preco_atual);
                            ema1m120p = estaProximoDaLinha(cryptSymbol, ema120p1m, preco_atual);
                            ema1m200p = estaProximoDaLinha(cryptSymbol, ema200p1m, preco_atual);

                            ema3m10p = estaProximoDaLinha(cryptSymbol, ema10p3m, preco_atual);
                            ema3m20p = estaProximoDaLinha(cryptSymbol, ema20p3m, preco_atual);
                            ema3m50p = estaProximoDaLinha(cryptSymbol, ema50p3m, preco_atual);
                            var ema3m100p = estaProximoDaLinha(cryptSymbol, ema100p3m, preco_atual);
                            var ema3m120p = estaProximoDaLinha(cryptSymbol, ema120p3m, preco_atual);
                            ema3m200p = estaProximoDaLinha(cryptSymbol, ema200p3m, preco_atual);

                            ema5m10p = estaProximoDaLinha(cryptSymbol, ema10p5m, preco_atual);
                            ema5m20p = estaProximoDaLinha(cryptSymbol, ema20p5m, preco_atual);
                            ema5m25p = estaProximoDaLinha(cryptSymbol, ema25p5m, preco_atual);
                            ema5m50p = estaProximoDaLinha(cryptSymbol, ema50p5m, preco_atual);
                            ema5m60p = estaProximoDaLinha(cryptSymbol, ema60p5m, preco_atual);
                            ema5m100p = estaProximoDaLinha(cryptSymbol, ema100p5m, preco_atual);
                            ema5m200p = estaProximoDaLinha(cryptSymbol, ema200p5m, preco_atual);

                            ema15m10p = estaProximoDaLinha(cryptSymbol, ema10p15m, preco_atual);
                            ema15m20p = estaProximoDaLinha(cryptSymbol, ema20p15m, preco_atual);
                            ema15m25p = estaProximoDaLinha(cryptSymbol, ema25p15m, preco_atual);
                            ema15m50p = estaProximoDaLinha(cryptSymbol, ema50p15m, preco_atual);
                            ema15m100p = estaProximoDaLinha(cryptSymbol, ema100p15m, preco_atual);
                            ema15m200p = estaProximoDaLinha(cryptSymbol, ema200p15m, preco_atual);

                            ema30m10p = estaProximoDaLinha(cryptSymbol, ema10p30m, preco_atual);
                            ema30m20p = estaProximoDaLinha(cryptSymbol, ema20p30m, preco_atual);
                            ema30m50p = estaProximoDaLinha(cryptSymbol, ema50p30m, preco_atual);
                            ema30m100p = estaProximoDaLinha(cryptSymbol, ema100p30m, preco_atual);
                            ema30m200p = estaProximoDaLinha(cryptSymbol, ema200p30m, preco_atual);

                            ema1h10p = estaProximoDaLinha(cryptSymbol, ema10p1h, preco_atual);
                            ema1h20p = estaProximoDaLinha(cryptSymbol, ema20p1h, preco_atual);
                            ema1h25p = estaProximoDaLinha(cryptSymbol, ema25p1h, preco_atual);
                            ema1h50p = estaProximoDaLinha(cryptSymbol, ema50p1h, preco_atual);
                            ema1h60p = estaProximoDaLinha(cryptSymbol, ema60p1h, preco_atual);
                            ema1h100p = estaProximoDaLinha(cryptSymbol, ema100p1h, preco_atual);
                            ema1h120p = estaProximoDaLinha(cryptSymbol, ema120p1h, preco_atual);
                            ema1h200p = estaProximoDaLinha(cryptSymbol, ema200p1h, preco_atual);

                            ema4h10p = estaProximoDaLinha(cryptSymbol, ema10p4h, preco_atual);
                            ema4h20p = estaProximoDaLinha(cryptSymbol, ema20p4h, preco_atual);
                            ema4h50p = estaProximoDaLinha(cryptSymbol, ema50p4h, preco_atual);
                            ema4h100p = estaProximoDaLinha(cryptSymbol, ema100p4h, preco_atual);
                            ema4h200p = estaProximoDaLinha(cryptSymbol, ema200p4h, preco_atual);

                            ema1m5prev = estaProximoDaLinha(cryptSymbol, ema5p1mprev, preco_atual);
                            ema1m10prev = estaProximoDaLinha(cryptSymbol, ema10p1mprev, preco_atual);
                            ema1m20prev = estaProximoDaLinha(cryptSymbol, ema20p1mprev, preco_atual);
                            ema1m25prev = estaProximoDaLinha(cryptSymbol, ema25p1mprev, preco_atual);
                            ema1m50prev = estaProximoDaLinha(cryptSymbol, ema50p1mprev, preco_atual);
                            ema1m100prev = estaProximoDaLinha(cryptSymbol, ema100p1mprev, preco_atual);
                            ema1m200prev = estaProximoDaLinha(cryptSymbol, ema200p1mprev, preco_atual);

                            ema3m10prev = estaProximoDaLinha(cryptSymbol, ema10p3mprev, preco_atual);
                            ema3m20prev = estaProximoDaLinha(cryptSymbol, ema20p3mprev, preco_atual);
                            ema3m50prev = estaProximoDaLinha(cryptSymbol, ema50p3mprev, preco_atual);
                            ema3m100prev = estaProximoDaLinha(cryptSymbol, ema100p3mprev, preco_atual);
                            ema3m200prev = estaProximoDaLinha(cryptSymbol, ema200p3mprev, preco_atual);

                            ema5m10prev = estaProximoDaLinha(cryptSymbol, ema10p5mprev, preco_atual);
                            ema5m20prev = estaProximoDaLinha(cryptSymbol, ema20p5mprev, preco_atual);
                            ema5m25prev = estaProximoDaLinha(cryptSymbol, ema25p5mprev, preco_atual);
                            ema5m50prev = estaProximoDaLinha(cryptSymbol, ema50p5mprev, preco_atual);
                            ema5m60prev = estaProximoDaLinha(cryptSymbol, ema60p5mprev, preco_atual);
                            ema5m100prev = estaProximoDaLinha(cryptSymbol, ema100p5mprev, preco_atual);
                            ema5m200prev = estaProximoDaLinha(cryptSymbol, ema200p5mprev, preco_atual);

                            ema15m10prev = estaProximoDaLinha(cryptSymbol, ema10p15mprev, preco_atual);
                            ema15m20prev = estaProximoDaLinha(cryptSymbol, ema20p15mprev, preco_atual);
                            ema15m25prev = estaProximoDaLinha(cryptSymbol, ema25p15mprev, preco_atual);
                            ema15m50prev = estaProximoDaLinha(cryptSymbol, ema50p15mprev, preco_atual);
                            ema15m100prev = estaProximoDaLinha(cryptSymbol, ema100p15mprev, preco_atual);
                            ema15m200prev = estaProximoDaLinha(cryptSymbol, ema200p15mprev, preco_atual);

                            ema30m10prev = estaProximoDaLinha(cryptSymbol, ema10p30mprev, preco_atual);
                            ema30m20prev = estaProximoDaLinha(cryptSymbol, ema20p30mprev, preco_atual);
                            ema30m50prev = estaProximoDaLinha(cryptSymbol, ema50p30mprev, preco_atual);
                            ema30m100prev = estaProximoDaLinha(cryptSymbol, ema100p30mprev, preco_atual);
                            ema30m200prev = estaProximoDaLinha(cryptSymbol, ema200p30mprev, preco_atual);

                            ema1h10prev = estaProximoDaLinha(cryptSymbol, ema10p1hprev, preco_atual);
                            ema1h20prev = estaProximoDaLinha(cryptSymbol, ema20p1hprev, preco_atual);
                            var ema1h25prev = estaProximoDaLinha(cryptSymbol, ema25p1hprev, preco_atual);
                            ema1h50prev = estaProximoDaLinha(cryptSymbol, ema50p1hprev, preco_atual);
                            ema1h60prev = estaProximoDaLinha(cryptSymbol, ema60p1hprev, preco_atual);
                            ema1h100prev = estaProximoDaLinha(cryptSymbol, ema100p1hprev, preco_atual);
                            ema1h120prev = estaProximoDaLinha(cryptSymbol, ema120p1hprev, preco_atual);
                            ema1h200prev = estaProximoDaLinha(cryptSymbol, ema200p1hprev, preco_atual);

                            ema4h10prev = estaProximoDaLinha(cryptSymbol, ema10p4hprev, preco_atual);
                            ema4h20prev = estaProximoDaLinha(cryptSymbol, ema20p4hprev, preco_atual);
                            ema4h50prev = estaProximoDaLinha(cryptSymbol, ema50p4hprev, preco_atual);
                            ema4h100prev = estaProximoDaLinha(cryptSymbol, ema100p4hprev, preco_atual);
                            ema4h200prev = estaProximoDaLinha(cryptSymbol, ema200p4hprev, preco_atual);

                            //let linhaDeTendenciaAltos = zigZagLtb(candles4h, pontosZigZag.topos[0], pontosZigZag.topos[1]);
                            //let linhaDeTendenciaBaixos = zigZagLta(candles4h, pontosZigZag.fundos[0], pontosZigZag.fundos[1]);

                            //console.log("linhaDeTendenciaAltos:", linhaDeTendenciaAltos);
                            //console.log("linhaDeTendenciaBaixos:", linhaDeTendenciaBaixos);


                            // console.log("fibo:", fibo);
                            //  if(linhaDeTendenciaBaixos.precosLTA !== undefined && linhaDeTendenciaAltos.precosLTB !== undefined){

                            if (resTend1h.lta !== undefined && resTend1h.ltb !== undefined) {

                                /*
                                var ltaPrice = parseFloat(linhaDeTendenciaBaixos.precosLTA[linhaDeTendenciaBaixos.precosLTA.length-1]);
                                var ltbPrice = parseFloat(linhaDeTendenciaAltos.precosLTB[linhaDeTendenciaAltos.precosLTB.length-1]);
                                var lta2Price = parseFloat(linhaDeTendenciaBaixos2.precosLTA[linhaDeTendenciaBaixos2.precosLTA.length-1]);
                                var ltb2Price = parseFloat(linhaDeTendenciaAltos2.precosLTB[linhaDeTendenciaAltos2.precosLTB.length-1]);
                                *
                        
                                var ltaPrice = parseFloat(linhaDeTendenciaBaixos.precosLTA[0]);
                                var ltbPrice = parseFloat(linhaDeTendenciaAltos.precosLTB[0]);
                                var lta2Price = parseFloat(linhaDeTendenciaBaixos2.precosLTA[0]);
                                var ltb2Price = parseFloat(linhaDeTendenciaAltos2.precosLTB[0]);
                                
                                */

                                var ltaPrice = parseFloat(resTend1h.lta.valor.toFixed(5));
                                var ltbPrice = parseFloat(resTend1h.ltb.valor.toFixed(5));
                                //var lta2Price = parseFloat(resTend1h.lta2.valor.toFixed(5));
                                //var ltb2Price = parseFloat(resTend1h.ltb2.valor.toFixed(5));

                                //var lta = parseFloat(linhaDeTendenciaBaixos.precosLT[linhaDeTendenciaBaixos.precosLT.length-1]);
                                //var ltb = parseFloat(linhaDeTendenciaAltos.precosLT[linhaDeTendenciaAltos.precosLT.length-1]);

                                ltb4h = estaProximoDaLinha(cryptSymbol, ltbPrice, preco_atual);
                                lta4h = estaProximoDaLinha(cryptSymbol, ltaPrice, preco_atual);
                                //ltb4h2 = estaProximoDaLinha(cryptSymbol, ltb2Price, preco_atual);
                                //lta4h2 = estaProximoDaLinha(cryptSymbol, lta2Price, preco_atual);

                                //const cruzUP = calcularCruzamento(ltb, candles5c);
                                //const cruzDW = calcularCruzamento(lta, candles5c);

                                //console.log("fibo:", fibo);
                                if (fibo !== undefined) {
                                    fibo0 = estaProximoDaLinha(cryptSymbol, fibo[0], preco_atual);
                                    fibo236 = estaProximoDaLinha(cryptSymbol, fibo[1], preco_atual);
                                    fibo382 = estaProximoDaLinha(cryptSymbol, fibo[2], preco_atual);
                                    fibo50 = estaProximoDaLinha(cryptSymbol, fibo[3], preco_atual);
                                    fibo618 = estaProximoDaLinha(cryptSymbol, fibo[4], preco_atual);
                                    fibo786 = estaProximoDaLinha(cryptSymbol, fibo[5], preco_atual);
                                    fibo1 = estaProximoDaLinha(cryptSymbol, fibo[6], preco_atual);
                                    fibo1618 = estaProximoDaLinha(cryptSymbol, fibo[7], preco_atual);
                                    fibo2618 = estaProximoDaLinha(cryptSymbol, fibo[8], preco_atual);
                                    fibo3618 = estaProximoDaLinha(cryptSymbol, fibo[9], preco_atual);
                                    fibo4236 = estaProximoDaLinha(cryptSymbol, fibo[10], preco_atual);
                                    fibo_d1618 = estaProximoDaLinha(cryptSymbol, fibo[11], preco_atual);
                                    fibo_d3618 = estaProximoDaLinha(cryptSymbol, fibo[12], preco_atual);
                                    fibo_d3618 = estaProximoDaLinha(cryptSymbol, fibo[13], preco_atual);
                                    fibo_d4236 = estaProximoDaLinha(cryptSymbol, fibo[14], preco_atual);
                                }

                                open1d_0 = estaProximoDaLinha(cryptSymbol, abertura_atual_1d, preco_atual);
                                open1d_1 = estaProximoDaLinha(cryptSymbol, abertura_anterior_1d, preco_atual);
                                close1d_1 = estaProximoDaLinha(cryptSymbol, preco_anterior_1d, preco_atual);
                                close1d_2 = estaProximoDaLinha(cryptSymbol, preco_anterior2_1d, preco_atual);
                                max1d_1 = estaProximoDaLinha(cryptSymbol, max_anterior_1d, preco_atual);
                                max1d_2 = estaProximoDaLinha(cryptSymbol, max_anterior2_1d, preco_atual);
                                min1d_1 = estaProximoDaLinha(cryptSymbol, min_anterior_1d, preco_atual);
                                min1d_2 = estaProximoDaLinha(cryptSymbol, min_anterior2_1d, preco_atual);

                            }


                            if (zigzag !== undefined) {
                                //const retrac = calcularRetracoesFibonacci(zigzag.p1, zigzag.p2, zigzag.dir);
                                //const retracObj = calcularRetracoesFibonacci(pontosZigZag.pontosUnificados);
                                //const retrac = retracObj.retrac;
                                //const dir = retracObj.dir;
                                //console.log("retrações:", retrac);

                                //var fibo_d4236 = estaProximoDaLinha(cryptSymbol, fibo[14], preco_atual);

                                //console.log("positions:", positions);
                                //console.log("positions:", positions[0]);
                                if (positions !== undefined) {
                                    if (positions[0] !== undefined) {

                                        var auxPrice = parseFloat(preco_atual) - parseFloat(positions[0].entryPrice); //unrealizedProfit

                                        if (parseFloat(auxPrice) > parseFloat(0.000000) && parseFloat(unrealizedProfit) > parseFloat(0.001000)) {

                                            positions[0].side = "BUY";

                                        } else if (parseFloat(auxPrice) < parseFloat(0.000000) && parseFloat(unrealizedProfit) > parseFloat(0.001000)) {

                                            positions[0].side = "SELL";
                                        } else {

                                            positions[0].side = "side";

                                        }
                                    }
                                }
                                var objSendcalc = {

                                    symbol: cryptSymbol,
                                    lastUpdate: lastUpdate,
                                    balance: balance,
                                    availableBalance: availableBalance,
                                    marginBalance: marginBalance,
                                    unrealizedProfit: unrealizedProfit,
                                    //serverTimestamp: timeApi.data.serverTime,
                                    serverTimestamp: timestamp,
                                    tick: marketData1m[`${cryptSymbol}`].close[marketData1m[`${cryptSymbol}`].close.length - 1],
                                    tickprev: marketData1m[`${cryptSymbol}`].close[marketData1m[`${cryptSymbol}`].close.length - 2],
                                    flag: flag,
                                    flagpos: [],
                                    signals: {},

                                    /////////////////////  ENVIAR PAR OBJ MARKET

                                    lastUpdtMarket1m: marketData1m[`${cryptSymbol}`].date[marketData1m[`${cryptSymbol}`].date.length - 1],
                                    stoch1m: stochRsi1m[stochRsi1m.length - 1],
                                    stoch1mprev: stochRsi1m[stochRsi1m.length - 2],
                                    //sma5m10: sma5m10,

                                    lastUpdtMarket3m: marketData3m[`${cryptSymbol}`].date[marketData3m[`${cryptSymbol}`].date.length - 1],
                                    stoch3m: stochRsi3m[stochRsi3m.length - 1],
                                    stoch3mprev: stochRsi3m[stochRsi3m.length - 2],

                                    lastUpdtMarket5m: marketData5m[`${cryptSymbol}`].date[marketData5m[`${cryptSymbol}`].date.length - 1],
                                    stoch5m: stochRsi5m[stochRsi5m.length - 1],
                                    stoch5mprev: stochRsi5m[stochRsi5m.length - 2],

                                    lastUpdtMarket15m: marketData15m[`${cryptSymbol}`].date[marketData15m[`${cryptSymbol}`].date.length - 1],
                                    stoch15m: stochRsi15m[stochRsi15m.length - 1],
                                    stoch15mprev: stochRsi15m[stochRsi15m.length - 2],

                                    lastUpdtMarket30m: marketData30m[`${cryptSymbol}`].date[marketData30m[`${cryptSymbol}`].date.length - 1],
                                    stoch30m: stochRsi30m[stochRsi30m.length - 1],
                                    stoch30mprev: stochRsi30m[stochRsi30m.length - 2],

                                    lastUpdtMarket1h: marketData1h[`${cryptSymbol}`].date[marketData1h[`${cryptSymbol}`].date.length - 1],
                                    stoch1h: stochRsi1h[stochRsi1h.length - 1],
                                    stoch1hprev: stochRsi1h[stochRsi1h.length - 2],

                                    lastUpdtMarket4h: marketData4h[`${cryptSymbol}`].date[marketData4h[`${cryptSymbol}`].date.length - 1],
                                    stoch4h: stochRsi4h[stochRsi4h.length - 1],
                                    stoch4hprev: stochRsi4h[stochRsi4h.length - 2],

                                    //lastUpdtMarket1d: marketData1d.date[marketData1d.date.length - 1],
                                    //stoch1d: stochRsi1d[stochRsi1d.length - 1],
                                    //stoch1dprev: stochRsi1d[stochRsi1d.length - 2],

                                    //lastUpdtMarket1w: marketData1w.date[marketData1w.date.length - 1],
                                    //stoch1w: stochRsi1w[stochRsi1w.length - 1],
                                    //stoch1wprev: stochRsi1w[stochRsi1w.length - 2],

                                    //fibo: retrac,
                                    //atr: atr,
                                    positions: positions
                                    //openorders: openOrders,
                                    //pnlHist: pnlHist,
                                    //pnlHist: {}
                                    //allOrders: allOrders,
                                    //userTrades: userTrades

                                };
                                //var cacheJson[`${cryptSymbol}`] = await carregarCache(cryptSymbol);

                                //cacheJson[`${cryptSymbol}`].objMarket

                                var psarResult = psar.result;


                                var klineRes1m = {
                                    klineclose: result1m[`${cryptSymbol}`].data[result1m[`${cryptSymbol}`].data.length - 1][6],
                                    result1mdata: result1m[`${cryptSymbol}`].data
                                }

                                var klineRes3m = {
                                    klineclose: result3m[`${cryptSymbol}`].data[result3m[`${cryptSymbol}`].data.length - 1][6],
                                    result3mdata: result3m[`${cryptSymbol}`].data
                                }

                                var klineRes5m = {
                                    klineclose: result5m[`${cryptSymbol}`].data[result5m[`${cryptSymbol}`].data.length - 1][6],
                                    result5mdata: result5m[`${cryptSymbol}`].data
                                }

                                var klineRes15m = {
                                    klineclose: result15m[`${cryptSymbol}`].data[result15m[`${cryptSymbol}`].data.length - 1][6],
                                    result15mdata: result15m[`${cryptSymbol}`].data
                                }

                                var klineRes30m = {
                                    klineclose: result30m[`${cryptSymbol}`].data[result30m[`${cryptSymbol}`].data.length - 1][6],
                                    result30mdata: result30m[`${cryptSymbol}`].data
                                }

                                var klineRes1h = {
                                    klineclose: result1h[`${cryptSymbol}`].data[result1h[`${cryptSymbol}`].data.length - 1][6],
                                    result1hdata: result1h[`${cryptSymbol}`].data
                                }

                                var klineRes4h = {
                                    klineclose: result4h[`${cryptSymbol}`].data[result4h[`${cryptSymbol}`].data.length - 1][6],
                                    result4hdata: result4h[`${cryptSymbol}`].data
                                }

                                var klineRes1d = {
                                    klineclose: result1d[`${cryptSymbol}`].data[result1d[`${cryptSymbol}`].data.length - 1][6],
                                    result1ddata: result1d[`${cryptSymbol}`].data
                                }

                                var klineRes1w = {
                                    klineclose: result1w[`${cryptSymbol}`].data[result1w[`${cryptSymbol}`].data.length - 1][6],
                                    result1wdata: result1w[`${cryptSymbol}`].data
                                }

                                /*
                                objMarket.klineRes3m = klineRes3m;
                                objMarket.klineRes1h = klineRes1h;
                                objMarket.klineRes4h = klineRes4h;
                    */

                                var maiorMM = Math.max(parseFloat(sma5m50p.preco), parseFloat(sma5m60p.preco), parseFloat(ema5m50p.preco), parseFloat(ema5m60p.preco));

                                var menorMM = Math.min(parseFloat(sma5m50p.preco), parseFloat(sma5m60p.preco), parseFloat(ema5m50p.preco), parseFloat(ema5m60p.preco));

                                var mm4UP = estaProximoDaLinha(cryptSymbol, maiorMM, preco_atual);
                                var mm4DW = estaProximoDaLinha(cryptSymbol, menorMM, preco_atual);

                                var objMarket = {

                                    priceRefOp: null,
                                    priceRefOp2: null,
                                    symbol: cryptSymbol,
                                    lastUpdate: lastUpdate,
                                    fibo: retracObj,
                                    fibo2: retracObj2,
                                    dir: dir,
                                    //atr: atr,
                                    zigzag: zigzag,
                                    lastPnl: null,

                                    //stoch1m: stochRsi1m[stochRsi1m.length - 1],
                                    //stoch1mprev: stochRsi1m[stochRsi1m.length - 2],
                                    //ema1m50p: ema1m50p,
                                    mm4UP: mm4UP,
                                    mm4DW: mm4DW,
                                    preco_anterior_1m: preco_anterior_1m,
                                    preco_anterior2_1m: preco_anterior2_1m,
                                    abertura_atual_1m: abertura_atual_1m,
                                    abertura_anterior_1m: abertura_anterior_1m,
                                    abertura_anterior2_1m: abertura_anterior2_1m,
                                    max_atual_1m: max_atual_1m,
                                    max_anterior_1m: max_anterior_1m,
                                    max_anterior2_1m: max_anterior2_1m,
                                    min_atual_1m: min_atual_1m,
                                    min_anterior_1m: min_anterior_1m,
                                    min_anterior2_1m: min_anterior2_1m,

                                    preco_anterior_3m: preco_anterior_3m,
                                    preco_anterior2_3m: preco_anterior2_3m,
                                    abertura_atual_3m: abertura_atual_3m,
                                    abertura_anterior_3m: abertura_anterior_3m,
                                    abertura_anterior2_3m: abertura_anterior2_3m,
                                    max_atual_3m: max_atual_3m,
                                    max_anterior_3m: max_anterior_3m,
                                    max_anterior2_3m: max_anterior2_3m,
                                    min_atual_3m: min_atual_3m,
                                    min_anterior_3m: min_anterior_3m,
                                    min_anterior2_3m: min_anterior2_3m,

                                    preco_anterior_5m: preco_anterior_5m,
                                    preco_anterior2_5m: preco_anterior2_5m,
                                    abertura_atual_5m: abertura_atual_5m,
                                    abertura_anterior_5m: abertura_anterior_5m,
                                    abertura_anterior2_5m: abertura_anterior2_5m,
                                    max_atual_5m: max_atual_5m,
                                    max_anterior_5m: max_anterior_5m,
                                    max_anterior2_5m: max_anterior2_5m,
                                    min_atual_5m: min_atual_5m,
                                    min_anterior_5m: min_anterior_5m,
                                    min_anterior2_5m: min_anterior2_5m,

                                    preco_anterior_15m: preco_anterior_15m,
                                    preco_anterior2_15m: preco_anterior2_15m,
                                    abertura_atual_15m: abertura_atual_15m,
                                    abertura_anterior_15m: abertura_anterior_15m,
                                    abertura_anterior2_15m: abertura_anterior2_15m,
                                    max_atual_15m: max_atual_15m,
                                    max_anterior_15m: max_anterior_15m,
                                    max_anterior2_15m: max_anterior2_15m,
                                    min_atual_15m: min_atual_15m,
                                    min_anterior_15m: min_anterior_15m,
                                    min_anterior2_15m: min_anterior2_15m,

                                    preco_anterior_30m: preco_anterior_30m,
                                    preco_anterior2_30m: preco_anterior2_30m,
                                    abertura_atual_30m: abertura_atual_30m,
                                    abertura_anterior_30m: abertura_anterior_30m,
                                    abertura_anterior2_30m: abertura_anterior2_30m,
                                    max_atual_30m: max_atual_30m,
                                    max_anterior_30m: max_anterior_30m,
                                    max_anterior2_30m: max_anterior2_30m,
                                    min_atual_30m: min_atual_30m,
                                    min_anterior_30m: min_anterior_30m,
                                    min_anterior2_30m: min_anterior2_30m,

                                    lastUpdtMarket1m: marketData1m[`${cryptSymbol}`].date[marketData1m[`${cryptSymbol}`].date.length - 1],
                                    stoch1m: stochRsi1m[stochRsi1m.length - 1],
                                    stoch1mprev: stochRsi1m[stochRsi1m.length - 2],

                                    lastUpdtMarket3m: marketData3m[`${cryptSymbol}`].date[marketData3m[`${cryptSymbol}`].date.length - 1],
                                    stoch3m: stochRsi3m[stochRsi3m.length - 1],
                                    stoch3mprev: stochRsi3m[stochRsi3m.length - 2],

                                    lastUpdtMarket5m: marketData5m[`${cryptSymbol}`].date[marketData5m[`${cryptSymbol}`].date.length - 1],
                                    stoch5m: stochRsi5m[stochRsi5m.length - 1],
                                    stoch5mprev: stochRsi5m[stochRsi5m.length - 2],

                                    lastUpdtMarket15m: marketData15m[`${cryptSymbol}`].date[marketData15m[`${cryptSymbol}`].date.length - 1],
                                    stoch15m: stochRsi15m[stochRsi15m.length - 1],
                                    stoch15mprev: stochRsi15m[stochRsi15m.length - 2],

                                    lastUpdtMarket30m: marketData30m[`${cryptSymbol}`].date[marketData30m[`${cryptSymbol}`].date.length - 1],
                                    stoch30m: stochRsi30m[stochRsi30m.length - 1],
                                    stoch30mprev: stochRsi30m[stochRsi30m.length - 2],

                                    lastUpdtMarket1h: marketData1h[`${cryptSymbol}`].date[marketData1h[`${cryptSymbol}`].date.length - 1],
                                    stoch1h: stochRsi1h[stochRsi1h.length - 1],
                                    stoch1hprev: stochRsi1h[stochRsi1h.length - 2],

                                    ifr3m: ifr3m[ifr3m.length - 1],
                                    ifr5m: ifr5m[ifr5m.length - 1],
                                    ifr15m: ifr15m[ifr15m.length - 1],

                                    ifr3mprev: ifr3m[ifr3m.length - 2],
                                    ifr5mprev: ifr5m[ifr5m.length - 2],
                                    ifr15mprev: ifr15m[ifr15m.length - 2],

                                    sma1m3p: sma1m3p,
                                    sma1m5p: sma1m5p,
                                    sma1m10p: sma1m10p,
                                    sma1m20p: sma1m20p,
                                    sma1m50p: sma1m50p,
                                    sma1m60p: sma1m60p,
                                    sma1m100p: sma1m100p,
                                    sma1m200p: sma1m200p,

                                    sma1m10prev: sma1m10prev,
                                    sma1m20prev: sma1m20prev,
                                    sma1m50prev: sma1m50prev,
                                    sma1m60prev: sma1m60prev,
                                    sma1m100prev: sma1m100prev,
                                    sma1m200prev: sma1m200prev,

                                    ema1m10p: ema1m10p,
                                    ema1m20p: ema1m20p,
                                    ema1m25p: ema1m25p,
                                    ema1m50p: ema1m50p,
                                    ema1m100p: ema1m100p,
                                    ema1m120p: ema1m120p,
                                    ema1m200p: ema1m200p,

                                    ema1m10prev: ema1m10prev,
                                    ema1m20prev: ema1m20prev,
                                    ema1m25prev: ema1m25prev,
                                    ema1m50prev: ema1m50prev,
                                    ema1m100prev: ema1m100prev,
                                    ema1m200prev: ema1m200prev,

                                    sma3m10p: sma3m10p,
                                    sma3m20p: sma3m20p,
                                    sma3m50p: sma3m50p,
                                    sma3m100p: sma3m100p,
                                    sma3m200p: sma3m200p,

                                    sma3m10prev: sma3m10prev,
                                    sma3m20prev: sma3m20prev,
                                    sma3m50prev: sma3m50prev,
                                    sma3m100prev: sma3m100prev,
                                    sma3m200prev: sma3m200prev,

                                    ema3m10p: ema3m10p,
                                    ema3m20p: ema3m20p,
                                    ema3m50p: ema3m50p,
                                    ema3m100p: ema3m100p,
                                    ema3m120p: ema3m120p,
                                    ema3m200p: ema3m200p,

                                    ema3m10prev: ema3m10prev,
                                    ema3m20prev: ema3m20prev,
                                    ema3m50prev: ema3m50prev,
                                    ema3m100prev: ema3m100prev,
                                    ema3m200prev: ema3m200prev,

                                    //5m
                                    sma5m10p: sma5m10p,
                                    sma5m20p: sma5m20p,
                                    sma5m50p: sma5m50p,
                                    sma5m60p: sma5m60p,
                                    sma5m100p: sma5m100p,
                                    sma5m200p: sma5m200p,

                                    sma5m10prev: sma5m10prev,
                                    sma5m20prev: sma5m20prev,
                                    sma5m50prev: sma5m50prev,
                                    sma5m60prev: sma5m60prev,
                                    sma5m100prev: sma5m100prev,
                                    sma5m200prev: sma5m200prev,

                                    ema5m10p: ema5m10p,
                                    ema5m20p: ema5m20p,
                                    ema5m25p: ema5m25p,
                                    ema5m50p: ema5m50p,
                                    ema5m60p: ema5m60p,
                                    ema5m100p: ema5m100p,
                                    ema5m200p: ema5m200p,

                                    ema5m10prev: ema5m10prev,
                                    ema5m20prev: ema5m20prev,
                                    ema5m25prev: ema5m25prev,
                                    ema5m50prev: ema5m50prev,
                                    ema5m60prev: ema5m60prev,
                                    ema5m100prev: ema5m100prev,
                                    ema5m200prev: ema5m200prev,

                                    //15m
                                    sma15m10p: sma15m10p,
                                    sma15m20p: sma15m20p,
                                    sma15m50p: sma15m50p,
                                    //sma15m60p: sma15m60p,
                                    sma15m100p: sma15m100p,
                                    sma15m200p: sma15m200p,

                                    sma15m10prev: sma15m10prev,
                                    sma15m20prev: sma15m20prev,
                                    sma15m50prev: sma15m50prev,
                                    //sma15m60prev: sma15m60prev,
                                    sma15m100prev: sma15m100prev,
                                    sma15m200prev: sma15m200prev,

                                    ema15m10p: ema15m10p,
                                    ema15m20p: ema15m20p,
                                    ema15m25p: ema15m25p,
                                    ema15m50p: ema15m50p,
                                    ema15m100p: ema15m100p,
                                    ema15m200p: ema15m200p,

                                    ema15m10prev: ema15m10prev,
                                    ema15m20prev: ema15m20prev,
                                    ema15m25prev: ema15m25prev,
                                    ema15m50prev: ema15m50prev,
                                    ema15m100prev: ema15m100prev,
                                    ema15m200prev: ema15m200prev,

                                    //1h
                                    sma1h10p: sma1h10p,
                                    sma1h20p: sma1h20p,
                                    sma1h50p: sma1h50p,
                                    sma1h60p: sma1h60p,
                                    sma1h100p: sma1h100p,
                                    sma1h200p: sma1h200p,

                                    sma1h10prev: sma1h10prev,
                                    sma1h20prev: sma1h20prev,
                                    sma1h50prev: sma1h50prev,
                                    sma1h60prev: sma1h60prev,
                                    sma1h100prev: sma1h100prev,
                                    sma1h200prev: sma1h200prev,

                                    ema1h10p: ema1h10p,
                                    ema1h20p: ema1h20p,
                                    ema1h25p: ema1h25p,
                                    ema1h50p: ema1h50p,
                                    ema1h60p: ema1h60p,
                                    ema1h100p: ema1h100p,
                                    ema1h120p: ema1h120p,
                                    ema1h200p: ema1h200p,

                                    ema1h10prev: ema1h10prev,
                                    ema1h20prev: ema1h20prev,
                                    ema1h25prev: ema1h25prev,
                                    ema1h50prev: ema1h50prev,
                                    ema1h60prev: ema1h60prev,
                                    ema1h100prev: ema1h100prev,
                                    ema1h120prev: ema1h120prev,
                                    ema1h200prev: ema1h200prev,

                                    p1sar1: sarPar1_1,
                                    p1sar2: sarPar1_2,

                                    p2sar1: sarPar2_1,
                                    p2sar2: sarPar2_2,

                                    p3sar1: sarPar3_1,
                                    p3sar2: sarPar3_2,

                                    p4sar1: sarPar4_1,
                                    p4sar2: sarPar4_2,

                                    resTend4h: resTend4h,
                                    resTend1h: resTend1h,
                                    resTend15m: resTend15m,

                                    resTend5m: resTend5m,
                                    resTend3m: resTend3m,
                                    resTend1m: resTend1m,

                                    klineRes1m: klineRes1m,
                                    klineRes3m: klineRes3m,
                                    klineRes5m: klineRes5m,
                                    klineRes15m: klineRes15m,
                                    klineRes30m: klineRes30m,
                                    klineRes1h: klineRes1h,
                                    klineRes4h: klineRes4h,
                                    klineRes1d: klineRes1d,
                                    klineRes1w: klineRes1w,




                                    // psar.result[psar.result.length - 1],

                                    //psar2: psar2.result[psar2.result.length - 1],

                                    //BB
                                    /*
                                    bb1mLast: bollgr1m[bollgr1m.length - 1],
                                    bb1mLast2: bollgr1m[bollgr1m.length - 2],
                
                                    bb3mLast: bollgr3m[bollgr3m.length - 1],
                                    bb3mLast2: bollgr3m[bollgr3m.length - 2],
                
                                    bb5mLast: bollgr3m[bollgr5m.length - 1],
                                    bb5mLast2: bollgr3m[bollgr5m.length - 2],
                
                                    bb15mLast: bollgr3m[bollgr15m.length - 1],
                                    bb15mLast2: bollgr3m[bollgr15m.length - 2],
                
                                    bb1hLast: bollgr3m[bollgr1h.length - 1],
                                    bb1hLast2: bollgr3m[bollgr1h.length - 2],
                */
                                    //macd
                                    //macd3m: macd3m,
                                    //macd15m: macd15m,
                                    /*
                
                                    priceChannel: {
                
                                        upperLast: resultpc.upperChannelList[resultpc.upperChannelList.length - 1],
                                        upperLast2: resultpc.upperChannelList[resultpc.upperChannelList.length - 2],
                                        downLast: resultpc.lowerChannelList[resultpc.lowerChannelList.length - 1],
                                        downLast2: resultpc.lowerChannelList[resultpc.lowerChannelList.length - 2]
                
                                    }
                
                                        */

                                }

                                var objIndic = {

                                    symbol: cryptSymbol,
                                }

                                //await lastPnl();

                                if (cacheJson[`${cryptSymbol}`].objMarket !== undefined) {
                                    if (cacheJson[`${cryptSymbol}`].objMarket.priceRefOp !== null) {
                                        objMarket.priceRefOp = cacheJson[`${cryptSymbol}`].objMarket.priceRefOp;
                                    }
                                }
                                cacheJson[`${cryptSymbol}`].objIndic = null;
                                //cache.set("objSendcalc", objSendcalc);
                                var altCacheJson = [];
                                var altCacheTrvJson = [];
                                altCacheJson[`${cryptSymbol}`] = await carregarCache(cryptSymbol);
                                altCacheTrvJson['TRAVA'] = await carregarCache('TRAVA');

                                if (altCacheJson[`${cryptSymbol}`] !== undefined) {
                                    if (altCacheJson[`${cryptSymbol}`].objSendcalc !== undefined) {
                                        objSendcalc.flag = altCacheJson[`${cryptSymbol}`].objSendcalc.flag;
                                    }
                                    if (altCacheJson[`${cryptSymbol}`].priceRefOp !== undefined) {
                                        cacheJson[`${cryptSymbol}`].priceRefOp = altCacheJson[`${cryptSymbol}`].priceRefOp;
                                    }
                                    if (altCacheJson[`${cryptSymbol}`].oldBalance !== undefined) {
                                        cacheJson[`${cryptSymbol}`].oldBalance = altCacheJson[`${cryptSymbol}`].oldBalance;
                                    }
                                    if (altCacheTrvJson['TRAVA'].timeValidate !== undefined) {
                                        cacheJson[`${cryptSymbol}`].timeValidate = altCacheTrvJson['TRAVA'].timeValidate;
                                    }
                                }
                                //limparCache();
                                if (objMarket.symbol == cryptSymbol) {


                                    cacheJson[`${cryptSymbol}`].objMarket = objMarket;



                                }
                                if (objSendcalc.symbol == cryptSymbol) {

                                    cacheJson[`${cryptSymbol}`].objSendcalc = objSendcalc;
                                }
                                if (objIndic.symbol == cryptSymbol) {
                                    cacheJson[`${cryptSymbol}`].objIndic = objIndic;
                                }

                                salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                            }

                        }
                    }

                }


                console.log(`initDados_end[${cryptSymbol}]`);
            } else {
                console.log('Sem conexão com a internet. Pausando operações...');
            }

            // Remove qualquer ocorrência do cryptSymbol
            initDControl.queue = initDControl.queue.filter(s => s !== cryptSymbol);

            // Adiciona no final da fila
            initDControl.queue.push(cryptSymbol);


            //initDControl.lastProcessed = cryptSymbol;
            initDControl['flag'] = false;
            await salvarCache(initDControl, "initDControl");
            //console.timeEnd('initDados');
        }
    }
}

async function fixFlag(posit, cryptSymbol) {
    //console.log("posit", posit);
    //unrealizedProfit
    //entryPrice
    //preco_atual

    if (posit !== undefined
        && posit.initialMargin !== undefined
        && posit.unrealizedProfit !== undefined) {

        console.log("posit:", posit.initialMargin);
        console.log("posit:", posit.unrealizedProfit);

        var percent = percentage(posit.unrealizedProfit, posit.initialMargin).toFixed(2);

        cacheJson[`${cryptSymbol}`] = await carregarCache(cryptSymbol);
        if (cacheJson[`${cryptSymbol}`] !== undefined) {
            var flag = cacheJson[`${cryptSymbol}`].objSendcalc.flag;
            var objSendcalc = cacheJson[`${cryptSymbol}`].objSendcalc;
            var preco_atual = cacheJson[`${cryptSymbol}`].preco_atual;
            var flagLock = [];
            //var flagLock = cacheJson[`${cryptSymbol}`].flagLock;
            if (posit !== null && posit !== undefined) {
                flagLock = false;
                if (flag == "" || flag == null || flag == undefined) {
                    /*
                    if(parseFloat(preco_atual) == parseFloat(posit.entryPrice) && parseFloat(unrealizedProfit) == 0.00){
                        flag = "";
                    }
                    *
        
                    if(parseFloat(preco_atual) > parseFloat(posit.entryPrice) && parseFloat(unrealizedProfit) > 0.03000000){
                        //flagLock = "St02C";
                        flag = "St02C";
                    } else if(parseFloat(preco_atual) < parseFloat(posit.entryPrice) && parseFloat(unrealizedProfit) > 0.03000000){
                        flag = "St02V";
                    
                    } else if(parseFloat(preco_atual) > parseFloat(posit.entryPrice) && parseFloat(unrealizedProfit) < -0.03000000){
                        flag = "St02V";
                    } else if(parseFloat(preco_atual) < parseFloat(posit.entryPrice) && parseFloat(unrealizedProfit) < -0.03000000){
                        flag = "St02C";
                    }
        
                    */
                    //if(flag == "" || flag == null){
                    /*
                    if(parseFloat(preco_atual) > parseFloat(posit.entryPrice) && parseFloat(percent) > parseFloat(5.00)){
                        //flagLock = "St02C";
                        flag = "St02C";
                    } else if(parseFloat(preco_atual) < parseFloat(posit.entryPrice) && parseFloat(percent) > parseFloat(5.00)){
                        flag = "St02V";
                    } else if(parseFloat(preco_atual) > parseFloat(posit.entryPrice) && parseFloat(percent) < parseFloat(-5.00)){
                        flag = "St02V";
                    } else if(parseFloat(preco_atual) < parseFloat(posit.entryPrice) && parseFloat(percent) < parseFloat(-5.00)){
                        flag = "St02C";
                    }
                    *
    
    
                    if (parseFloat(marketData1m.close[marketData1m.close.length - 1]) > parseFloat(posit.entryPrice) && parseFloat(percent) > parseFloat(10.00)) {
                        //flagLock = "St02C";
                        flag = "St02C";
                    } else if (parseFloat(marketData1m.close[marketData1m.close.length - 1]) < parseFloat(posit.entryPrice) && parseFloat(percent) > parseFloat(10.00)) {
                        flag = "St02V";
                    } else if (parseFloat(marketData1m.close[marketData1m.close.length - 1]) > parseFloat(posit.entryPrice) && parseFloat(percent) < parseFloat(-10.00)) {
                        flag = "St02V";
                    } else if (parseFloat(marketData1m.close[marketData1m.close.length - 1]) < parseFloat(posit.entryPrice) && parseFloat(percent) < parseFloat(-10.00)) {
                        flag = "St02C";
                    }
    
    
                } else {
                    if (parseFloat(marketData1m.close[marketData1m.close.length - 1]) > parseFloat(posit.entryPrice) && parseFloat(percent) > parseFloat(20.00)) {
                        //flagLock = "St02C";
                        flag = "St02C";
                    } else if (parseFloat(marketData1m.close[marketData1m.close.length - 1]) < parseFloat(posit.entryPrice) && parseFloat(percent) > parseFloat(20.00)) {
                        flag = "St02V";
                    } else if (parseFloat(marketData1m.close[marketData1m.close.length - 1]) > parseFloat(posit.entryPrice) && parseFloat(percent) < parseFloat(-20.00)) {
                        flag = "St02V";
                    } else if (parseFloat(marketData1m.close[marketData1m.close.length - 1]) < parseFloat(posit.entryPrice) && parseFloat(percent) < parseFloat(-20.00)) {
                        flag = "St02C";
                    }
    
                }
    */

                    if (parseFloat(preco_atual) > parseFloat(posit.entryPrice) && parseFloat(percent) > parseFloat(11.00)) {
                        //flagLock = "St02C";
                        flag = "St02C";
                    } else if (parseFloat(preco_atual) < parseFloat(posit.entryPrice) && parseFloat(percent) > parseFloat(11.00)) {
                        flag = "St02V";
                    } else if (parseFloat(preco_atual) > parseFloat(posit.entryPrice) && parseFloat(percent) < parseFloat(-11.00)) {
                        flag = "St02V";
                    } else if (parseFloat(preco_atual) < parseFloat(posit.entryPrice) && parseFloat(percent) < parseFloat(-11.00)) {
                        flag = "St02C";
                    }


                } else {
                    if (parseFloat(preco_atual) > parseFloat(posit.entryPrice) && parseFloat(percent) > parseFloat(20.00)) {
                        //flagLock = "St02C";
                        flag = "St02C";
                    } else if (parseFloat(preco_atual) < parseFloat(posit.entryPrice) && parseFloat(percent) > parseFloat(20.00)) {
                        flag = "St02V";
                    } else if (parseFloat(preco_atual) > parseFloat(posit.entryPrice) && parseFloat(percent) < parseFloat(-20.00)) {
                        flag = "St02V";
                    } else if (parseFloat(preco_atual) < parseFloat(posit.entryPrice) && parseFloat(percent) < parseFloat(-20.00)) {
                        flag = "St02C";
                    }

                }



                //}
            } else {
                flag = "";
            }

            //objSendcalc.flag = flagLock;
            //objSendcalc.flagpos[`${cryptSymbol}`] = flagLock;
            objSendcalc.flag = flag;
            objSendcalc.flagpos[`${cryptSymbol}`] = flag;
            /*
            if(cacheJson[`${cryptSymbol}`].flagpos !== undefined){
                cacheJson[`${cryptSymbol}`].flagpos[`${cryptSymbol}`] = flag;
            }else{*/
            //}
            //if(cacheJson[`${cryptSymbol}`] !== undefined){
            //flagLock[`${cryptSymbol}`] = flag;

            //cacheJson[`${cryptSymbol}`].flagpos[`${cryptSymbol}`] = flagpos[`${cryptSymbol}`];
            cacheJson[`${cryptSymbol}`].flagLock = flagLock;
            cacheJson[`${cryptSymbol}`].objSendcalc = objSendcalc;

            //cacheJson[`${cryptSymbol}`].flagpos[`${cryptSymbol}`] = flag;


            salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);


            cacheJson[`${cryptSymbol}`] = await carregarCache(cryptSymbol);

            console.log(`FXcacheJson[${cryptSymbol}].flagpos`, cacheJson[`${cryptSymbol}`].objSendcalc.flagpos[`${cryptSymbol}`]);
            console.log(`FXcacheJson[${cryptSymbol}].flagLock`, cacheJson[`${cryptSymbol}`].flagLock);
            console.log(`FXflag`, flag);
        }

    }
    //await writeUserData(objSendcalc);

}

function priceChannel(prices, period, cryptSymbol) {

    if (lowerChannel !== undefined) {
        lowerChannel.splice(0, lowerChannel.length);
        middleChannel.splice(0, middleChannel.length);
        upperChannel.splice(0, upperChannel.length);
    }

    var upperChannel = [];
    var lowerChannel = [];
    var middleChannel = [];

    var upperChannelList = [];
    var lowerChannelList = [];
    var middleChannelList = [];

    upperChannel[`${cryptSymbol}`] = [];
    lowerChannel[`${cryptSymbol}`] = [];
    middleChannel[`${cryptSymbol}`] = [];

    //upperChannel[`${cryptSymbol}`].length = 0; 
    //lowerChannel[`${cryptSymbol}`].length = 0; 
    //middleChannel[`${cryptSymbol}`].length = 0; 

    // [`${cryptSymbol}`]

    for (let i = 0; i < prices.length; i++) {
        if (i < period) {
            upperChannel[`${cryptSymbol}`].push(null);
            lowerChannel[`${cryptSymbol}`].push(null);
            middleChannel[`${cryptSymbol}`].push(null);
        } else {
            const highestPrice = Math.max(...prices.slice(i - period, i));
            const lowestPrice = Math.min(...prices.slice(i - period, i));
            const middlePrice = prices[i];

            upperChannel[`${cryptSymbol}`].push(highestPrice);
            lowerChannel[`${cryptSymbol}`].push(lowestPrice);
            middleChannel[`${cryptSymbol}`].push(middlePrice);
        }
    }

    upperChannelList = upperChannel[`${cryptSymbol}`];
    lowerChannelList = lowerChannel[`${cryptSymbol}`];
    middleChannelList = middleChannel[`${cryptSymbol}`];


    return { upperChannelList, lowerChannelList, middleChannelList };
}

function getLastTwoZigZags(tpL, fdL) {

    var direction = null;
    var tp = null;
    var fd = null;
    var absTp = null;
    var absFd = null;

    //tp = tpL;
    //fd = fdL;

    //tpL[0]
    //console.log("tpL:",tpL.length);
    /*
    if (tpL !== undefined && fdL !== undefined
        && (Array.isArray(tpL) && tpL.length !== 0)
        && (Array.isArray(fdL) && fdL.length !== 0)) {        //console.log("tp:",tp);
    */
    //console.log("fd:",fd);
    tp = tpL[0];
    fd = fdL[0];

    //console.log("timestamp:",timestamp);

    absTp = timestamp - tpL[0].timestamp;
    absFd = timestamp - fdL[0].timestamp;

    if (absTp == absFd) {
        tp = tpL[0];
        fd = fdL[0];

    }
    else if (absTp > absFd) {
        tp = tpL[0];

        if (parseFloat(tpL[0].high) > parseFloat(fdL[0].low)) {
            if (fdL[0].timestamp >= tpL[1].timestamp) {
                fd = fdL[0];

            }
            if (fdL[1].timestamp >= tpL[1].timestamp) {
                fd = fdL[1];

            }
            if (fdL[2].timestamp >= tpL[1].timestamp) {
                fd = fdL[2];

            }
            if (fdL[3].timestamp >= tpL[1].timestamp) {
                fd = fdL[3];

            }
            if (fdL[4].timestamp >= tpL[1].timestamp) {
                fd = fdL[4];

            }

        }
    }
    else if (absTp < absFd) {
        fd = fdL[0];

        if (parseFloat(fdL[0].low < parseFloat(tpL[0].high))) {
            if (tpL[0].timestamp >= fdL[1].timestamp) {
                tp = tpL[0];

            }
            if (tpL[1].timestamp >= fdL[1].timestamp) {
                tp = tpL[1];

            }
            if (tpL[2].timestamp >= fdL[1].timestamp) {
                tp = tpL[2];

            }
            if (tpL[3].timestamp >= fdL[1].timestamp) {
                tp = tpL[3];

            }
            if (tpL[4].timestamp >= fdL[1].timestamp) {
                tp = tpL[4];

            }
        }
    }

    /*
        if(parseFloat(tpL[0].timestamp) == parseFloat(fdL[0].timestamp)){
            tp = tpL[0];
            fd = fdL[0];
            
        }else if(parseFloat(tpL[0].timestamp) > parseFloat(fdL[0].timestamp)){

            tp = tpL[0];
            if(parseFloat(tpL[0].timestamp) < parseFloat(fdL[0].timestamp)){

            } 

        }else if(parseFloat(tpL[0].timestamp) < parseFloat(fdL[0].timestamp)){
            
            fd = fdL[0];
            if(parseFloat(tpL[0].timestamp) < parseFloat(fdL[0].timestamp)){

            } 


        }
    */

    if (tp.timestamp >= fd.timestamp) {
        direction = 1;  //caindo
    } else {
        direction = -1;  //subindo
    }

    return {
        p1: tp.high,
        p2: fd.low,
        dir: direction
    }
    //}
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
/*
function calcularRetracoesFibonacci(pontosUnificados) {


    const high = parseFloat(pontosUnificados[1].valor);
    const low = parseFloat(pontosUnificados[0].valor);
    const dir = parseFloat(pontosUnificados[0].valor) < parseFloat(pontosUnificados[1].valor) ? -1 : 1;

    //console.log("DDDDDDDDDDdir:",dir);
    //console.log("HHHHHHHHHHHHHHhigh:",high);
    //console.log("LLLLLLLLLLLLLLlow:",low);

    // Restante do código permanece igual
    /*
  var pontoZero = null;
  var pontoUm = null;

  if (dir == 1){
      pontoZero = high;
      pontoUm = low;
  } else if (dir == -1){
      pontoZero = low;
      pontoUm = high;
  }

  *

    var pontoZero = parseFloat(pontosUnificados[0].valor);
    var pontoUm = parseFloat(pontosUnificados[1].valor);

    const fibonacciLevels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1, 1.618, 2.618, 3.618, 4.236, -0.618, -1.618, -2.618, -3.236];
    const priceRange = pontoZero - pontoUm;

    const fibonacciRetracements = fibonacciLevels.map(level => {
        const retracement = pontoZero - (priceRange * level);
        return parseFloat(retracement.toFixed(5));
    });

    return { retrac: fibonacciRetracements, dir: dir };
}
*/

function calcularRetracoesFibonacciOld(high, low, dir = 0) {

    var pontoZero = null;
    var pontoUm = null;

    if (dir == 1) {

        pontoZero = high;
        pontoUm = low;

    } else if (dir == -1) {

        pontoZero = low;
        pontoUm = high;

    }

    const fibonacciLevels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1, 1.618, 2.618, 3.618, 4.236, -0.618, -1.618, -2.618, -3.236];
    const priceRange = pontoZero - pontoUm;

    const fibonacciRetracements = fibonacciLevels.map(level => {
        const retracement = pontoZero - (priceRange * level);
        return parseFloat(retracement.toFixed(5));
    });

    return fibonacciRetracements;
}

function calcularPrecos(acimaAbaixo, precoAtual, retracoes) {
    const fibonacciLevels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1, 1.618, 2.618, 3.618, 4.236, -0.618, -1.618, -2.618, -3.236];

    // Faz uma cópia das retrações e converte para floats
    const retracoesFloat = retracoes.map(retracao => parseFloat(retracao));

    const precos = acimaAbaixo === 'acima' ? retracoesFloat.filter(retracao => retracao > precoAtual) : retracoesFloat.filter(retracao => retracao < precoAtual);

    // Faz a conversão do preçoAtual para float
    const precoAtualFloat = parseFloat(precoAtual);

    const priceRef = fibonacciLevels.find(nivel => Math.abs(nivel - precoAtualFloat) === Math.min(...precos.map(preco => Math.abs(nivel - preco))));
    const priceRef_name = priceRef !== undefined ? `Level ${fibonacciLevels.indexOf(priceRef)}` : 'Não encontrado';

    return {
        priceRef_name,
        priceRef
    };
}


function calcularTrendLowHigh(prices) {
    let trendLow = Number.POSITIVE_INFINITY;
    let trendHigh = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < prices.length; i++) {
        if (prices[i] < trendLow) {
            trendLow = prices[i];
        }
        if (prices[i] > trendHigh) {
            trendHigh = prices[i];
        }
    }

    return { trendLow, trendHigh };
}

function identificarSequenciasCandlesByClose(prices) {
    const sequencias = [];
    let sequenciaAtual = [];
    let candleAnterior = null;
    let isSequenciaVerde = null;

    for (let i = 0; i < prices.length; i++) {
        const candleAtual = prices[i];
        const isCandleVerde = candleAtual > candleAnterior;

        if (candleAnterior !== null) {
            if (isCandleVerde !== isSequenciaVerde) {
                // O tipo do candle atual é diferente da sequência atual
                if (sequenciaAtual.length > 0) {
                    sequencias.push(sequenciaAtual);
                }
                sequenciaAtual = [];
                isSequenciaVerde = isCandleVerde;
            }
        } else {
            isSequenciaVerde = isCandleVerde;
        }

        sequenciaAtual.push(candleAtual);
        candleAnterior = candleAtual;
    }

    // Armazena a última sequência
    if (sequenciaAtual.length > 0) {
        sequencias.push(sequenciaAtual);
    }

    return sequencias;
}

function identificarSequenciasCandles(input) {
    const { high, low, close, open } = input;
    const sequencias = [];
    let sequenciaAtual = [];
    let candleAnterior = null;
    let isSequenciaVerde = null;

    for (let i = 0; i < close.length; i++) {
        const candleAtual = {
            open: parseFloat(open[i]),
            high: parseFloat(high[i]),
            low: parseFloat(low[i]),
            close: parseFloat(close[i])
        };

        const isCandleVerde = candleAtual.close > candleAnterior;

        if (candleAnterior !== null) {
            if (isCandleVerde !== isSequenciaVerde) {
                // O tipo do candle atual é diferente da sequência atual
                if (sequenciaAtual.length > 0) {
                    sequencias.push(sequenciaAtual);
                }
                sequenciaAtual = [];
                isSequenciaVerde = isCandleVerde;
            }
        } else {
            isSequenciaVerde = isCandleVerde;
        }

        sequenciaAtual.push(candleAtual);
        candleAnterior = candleAtual.close;
    }

    // Armazena a última sequência
    if (sequenciaAtual.length > 0) {
        sequencias.push(sequenciaAtual);
    }

    return sequencias;

    /*

    Exemplo de Resposta:

    sequencias [
    [ { open: 0.315, high: 0.3156, low: 0.3127, close: 0.3129 } ],
    [ { open: 0.3128, high: 0.3142, low: 0.312, close: 0.3123 } ],
    [ { open: 0.3122, high: 0.313, low: 0.3113, close: 0.3128 } ],
    [ { open: 0.3128, high: 0.3133, low: 0.3121, close: 0.3122 } ],
    [ { open: 0.3123, high: 0.3143, low: 0.3122, close: 0.3141 } ],
    [
        { open: 0.3141, high: 0.3143, low: 0.3124, close: 0.313 },
        { open: 0.3131, high: 0.3133, low: 0.3126, close: 0.313 }
    ],
    [
        { open: 0.3129, high: 0.3135, low: 0.3128, close: 0.3134 },
        { open: 0.3135, high: 0.3151, low: 0.3126, close: 0.3151 }
    ],
    [ { open: 0.315, high: 0.3151, low: 0.31, close: 0.3119 } ],
    [ { open: 0.3118, high: 0.3129, low: 0.3107, close: 0.3127 } ],
    [ { open: 0.3127, high: 0.3134, low: 0.3109, close: 0.3114 } ],
    [
        { open: 0.3114, high: 0.3123, low: 0.3103, close: 0.3117 },
        { open: 0.3117, high: 0.3128, low: 0.311, close: 0.3119 }
    ],
    [
        { open: 0.312, high: 0.312, low: 0.31, close: 0.3105 },
        { open: 0.3106, high: 0.3115, low: 0.3077, close: 0.3093 },
        { open: 0.3092, high: 0.3102, low: 0.3071, close: 0.3087 },
        { open: 0.3087, high: 0.3096, low: 0.3065, close: 0.3071 },
        { open: 0.3071, high: 0.3077, low: 0.3061, close: 0.3068 }
    ],
    [
        { open: 0.3068, high: 0.3078, low: 0.3065, close: 0.3069 },
        { open: 0.3069, high: 0.3082, low: 0.3053, close: 0.3078 }
    ]
  
    */
}

function obterSequenciaMaiorRange(sequencias) {
    // Verifica se o array de sequências tem menos de 50 elementos
    if (sequencias.length <= 50) {
        // Retorna a última sequência
        return sequencias[sequencias.length - 1];
    }

    // Ordena as sequências em ordem decrescente com base no range
    const sequenciasOrdenadas = sequencias.sort((a, b) => {
        const rangeA = calcularRangeSequencia(a);
        const rangeB = calcularRangeSequencia(b);
        return rangeB - rangeA;
    });

    // Retorna a sequência com o maior range
    return sequenciasOrdenadas[0];
}

function calcularRangeSequencia(sequencia) {
    const precos = sequencia.map(candle => candle.close);
    const maximo = Math.max(...precos);
    const minimo = Math.min(...precos);

    return maximo - minimo;
}


function isSameColorCandle(closeA, closeB) {
    return (closeA > closeB) === (closeA > closeB);
}


function isAdjacentCandle(candleA, candleB) {
    return candleB.high >= candleA.low && candleB.low <= candleA.high;
}

function identificarMaiorSequenciaPorRange(sequences) {
    let maiorSequencia = [];
    let maiorRange = 0;
    var min4Range = null;
    var max4Range = null;

    for (let i = 0; i < sequences.length; i++) {
        const sequenceAtual = sequences[i];
        const lows = sequenceAtual.map(candle => candle.low);
        const highs = sequenceAtual.map(candle => candle.high);
        const min = Math.min(...lows);
        const max = Math.max(...highs);
        const range = max - min;

        if (range > maiorRange || maiorSequencia.length === 0) {
            maiorRange = range;
            maiorSequencia = sequenceAtual;
            min4Range = min;
            max4Range = max;
        }
    }

    return { maiorSequencia, maiorRange, min4Range, max4Range };
}

/////----------->>

function identificarMaiorSequencia(sequencias) {
    let maiorSequencia = [];

    for (let i = 0; i < sequencias.length; i++) {
        const sequenciaAtual = sequencias[i];

        if (sequenciaAtual.length > maiorSequencia.length) {
            maiorSequencia = sequenciaAtual;
        }
    }

    return maiorSequencia;
}

function identificarMaiorSequenciaPorRangeOld(sequencias) {
    let maiorSequencia = [];
    let maiorRange = 0;

    for (let i = 0; i < sequencias.length; i++) {
        const sequenciaAtual = sequencias[i];
        const min = Math.min(...sequenciaAtual);
        const max = Math.max(...sequenciaAtual);
        const range = max - min;

        if (range > maiorRange || maiorSequencia.length === 0) {
            maiorRange = range;
            maiorSequencia = sequenciaAtual;
        }
    }

    return maiorSequencia;
}

function restartAppold() {
    console.clear(); // Limpa o console
    console.log('Reiniciando a aplicação...');

    nodemon.restart();
    // Executa o comando para reiniciar a aplicação
    /*
    exec('npm start', (error, stdout, stderr) => {
      if (error) {
        console.error(`Erro ao reiniciar a aplicação: ${error}`);
        return;
      }
      console.log(`Aplicação reiniciada: ${stdout}`);
    });
    */
}

function clearConsole() {
    const blank = '\n'.repeat(process.stdout.rows);
    console.log(blank);

    readline.cursorTo(process.stdout, 0, 0);
    readline.clearScreenDown(process.stdout);

    console.log('Console limpo!');
}

function tracarLinhaTendencia(candles, type) {
    const precos = candles.map(candle => parseFloat(candle[type]));
    let ponto1 = null;
    let ponto2 = null;
    let inclinacao = null;

    // Encontrar o primeiro ponto mais alto
    for (let i = 0; i < precos.length; i++) {
        //for (let i = precos.length; i  0;  i++) {

        if (ponto1 === null || precos[i] >= ponto1[type]) {
            ponto1 = { index: i, highlow: precos[i] };
        }
    }

    // Verificar se o segundo ponto mais baixo deve ser usado em vez do primeiro
    if (ponto1.index + 3 >= precos.length) {
        var p1index = ponto1.index;
        ponto1 = null;
        for (let i = 0; i < p1index - 3; i++) {
            /*
            if (ponto1 !== null && ponto1.index + 2 < i) {
                break;
            }
            */

            if (ponto1 === null || precos[i] >= ponto1[type]) {
                ponto1 = { index: i, highlow: precos[i] };
            }
        }
    }

    // Encontrar o segundo ponto mais alto a partir do primeiro candle depois do primeiro ponto
    for (let i = ponto1.index + 1; i < precos.length - 2; i++) {
        if (ponto2 === null || precos[i] >= ponto2[type]) {
            ponto2 = { index: i, highlow: precos[i] };
        }
    }

    // Calcular a inclinação da linha entre os pontos
    if (ponto1 !== null && ponto2 !== null) {
        inclinacao = (ponto2[type] - ponto1[type]) / (ponto2.index - ponto1.index);

        // verifica se está atravessando candles
        var b = ponto1[type] - inclinacao * ponto1.index;
        for (let i = ponto1.index + 1; i <= precos.length - 3; i++) {
            b = ponto1[type] - inclinacao * ponto1.index;
            var preco = inclinacao * i + b;
            if (preco <= precos[i] || precos[i] > ponto2[type]) {
                ponto2 = { index: i, highlow: precos[i] };
                inclinacao = (ponto2[type] - ponto1[type]) / (ponto2.index - ponto1.index);
            }
        }

        // recalcular a inclinação da linha entre os pontos (para caso o ponto2 tenha mudado)
        //if (ponto1 !== null && ponto2 !== null) {
        inclinacao = (ponto2[type] - ponto1[type]) / (ponto2.index - ponto1.index);
    }

    /*
        //------------
        for (let i = ponto2.index; i <= precos[0]; i--) {
            b = ponto2[type] - inclinacao * ponto2.index;
            var preco = inclinacao * i + b;
            if (preco <= precos[i] || precos[i] >= ponto1[type]) {
              ponto1 = { index: i, highlow: precos[i] };
              inclinacao = (ponto2[type] - ponto1[type]) / (ponto2.index - ponto1.index);
            }
        }  
    
        // recalcular a inclinação da linha entre os pontos (para caso o ponto2 tenha mudado)
        if (ponto1 !== null && ponto2 !== null) {
            inclinacao = (ponto2[type] - ponto1[type]) / (ponto2.index - ponto1.index);
        }
    */

    // Imprimir os preços por onde a linha está passando
    var precosLT = [];
    if (ponto1 !== null && ponto2 !== null) {
        b = ponto1[type] - inclinacao * ponto1.index;
        const startIndex = ponto1.index > 0 ? 0 : ponto1.index;
        const endIndex = ponto2.index < precos.length - 1 ? precos.length - 1 : ponto2.index;
        for (let i = startIndex; i <= endIndex; i++) {
            const preco = inclinacao * i + b;
            //console.log("Preço:", preco.toFixed(5));
            precosLT.push(parseFloat(preco.toFixed(5)));
        }
    }

    return { ponto1, ponto2, inclinacao, precosLT };
}

function obterUltimosDoisZigZags(candles) {
    const topos = [];
    const fundos = [];
    const toposOrd = [];
    const fundosOrd = [];
    var direcaoLeitura = null;
    const doisTopos = [];
    const doisFundos = [];
    const doisTopos2 = [];
    const doisFundos2 = [];

    //for (let i = 10; i < candles.length-2; i++) {

    for (let i = candles.length - 2; i > 10; i--) {
        const candle = candles[i];
        //console.log("Elemento encontrado na lista candle:", candle);

        // teste de captura de candle //

        //console.log("i:", i);

        var candleHighPrev1 = candles[i - 1].high;
        var candleHighPrev2 = candles[i - 2].high;
        var candleHighPrev3 = candles[i - 3].high;
        var candleHighPrev4 = candles[i - 4].high;
        var candleHighPrev5 = candles[i - 5].high;
        var candleHighPrev6 = candles[i - 6].high;
        var candleHighPrev7 = candles[i - 7].high;
        var candleHighPrev8 = candles[i - 8].high;
        var candleHighPrev9 = candles[i - 9].high;

        var candleHighProx1 = candles[i + 1].high;
        //var candleHighProx2 = candles[i+2].high;

        var candleLowPrev1 = candles[i - 1].low;
        var candleLowPrev2 = candles[i - 2].low;
        var candleLowPrev3 = candles[i - 3].low;
        var candleLowPrev4 = candles[i - 4].low;
        var candleLowPrev5 = candles[i - 5].low;
        var candleLowPrev6 = candles[i - 6].low;
        var candleLowPrev7 = candles[i - 7].low;
        var candleLowPrev8 = candles[i - 8].low;
        var candleLowPrev9 = candles[i - 9].low;

        var candleLowProx1 = candles[i + 1].low;
        //var candleLowProx2 = candles[i+2].low;

        var ehTopo = null;
        if ((parseFloat(candle.high) >= parseFloat(candleHighPrev1) && parseFloat(candle.high) >= parseFloat(candleHighPrev2)
            && parseFloat(candle.high) >= parseFloat(candleHighPrev3) && parseFloat(candle.high) >= parseFloat(candleHighPrev4)
            && parseFloat(candle.high) >= parseFloat(candleHighPrev5) && parseFloat(candle.high) >= parseFloat(candleHighPrev6)
            // && parseFloat(candle.high) >= parseFloat(candleHighPrev7) && parseFloat(candle.high) >= parseFloat(candleHighPrev8) 
            // && parseFloat(candle.high) >= parseFloat(candleHighPrev9) 
            && parseFloat(candle.high) >= parseFloat(candleHighProx1)
        )) {
            ehTopo = true;
        } else {
            ehTopo = false;
        }

        var ehFundo = null;
        if ((parseFloat(candle.low) <= parseFloat(candleLowPrev1) && parseFloat(candle.low) <= parseFloat(candleLowPrev2)
            && parseFloat(candle.low) <= parseFloat(candleLowPrev3) && parseFloat(candle.low) <= parseFloat(candleLowPrev4)
            && parseFloat(candle.low) <= parseFloat(candleLowPrev5) && parseFloat(candle.low) <= parseFloat(candleLowPrev6)
            // && parseFloat(candle.low) <= parseFloat(candleLowPrev7) && parseFloat(candle.low) <= parseFloat(candleLowPrev8) 
            //&& parseFloat(candle.low) <= parseFloat(candleLowPrev9)
            && parseFloat(candle.low) <= parseFloat(candleLowProx1)
        )) {
            ehFundo = true;
        } else {
            ehFundo = false;
        }

        /*
                // Verifica se é um topo
                //let ehTopo = true;
                for (let j = i - 1; j <= i + 1; j++) {
                    if (j >= 0 && j < candles.length && parseFloat(candles[j].high) > parseFloat(candle.high)) {
                        ehTopo = false;
                        break;
                    }
                }
            
                // Verifica se é um fundo
                let ehFundo = true;
                for (let j = i - 1; j <= i + 1; j++) {
                    if (j >= 0 && j < candles.length && parseFloat(candles[j].low) < parseFloat(candle.low)) {
                        ehFundo = false;
                        break;
                    }
                }
        
        */

        if (ehTopo) {
            topos.push({ high: parseFloat(candle.high), index: i });
            toposOrd.push({ high: parseFloat(candle.high), index: i });

        }

        if (ehFundo) {
            fundos.push({ low: parseFloat(candle.low), index: i });
            fundosOrd.push({ low: parseFloat(candle.low), index: i });
        }
    }

    // Ordena os topos e fundos em ordem decrescente
    toposOrd.sort((a, b) => b.high - a.high);
    fundosOrd.sort((a, b) => a.low - b.low);

    /*
    var tptest = topos.slice(0, 2);
    var fdtest = fundos.slice(0, 2);
    //console.log("tptest:", tptest);
    if(tptest[0] !== undefined && tptest[1] !== undefined){
        if(tptest[0].index + 1 == tptest[1].index || tptest[1].index + 1 == tptest[0].index){
            //console.log("topos PROXIMOS!");
            tptest = topos.slice(1, 3);
        }
    }

    if(fdtest[0] !== undefined && fdtest[1] !== undefined){

        if(fdtest[0].index + 1 == fdtest[1].index || fdtest[1].index + 1 == fdtest[0].index){
            //console.log("topos PROXIMOS!");
            fdtest = fundos.slice(1, 3);
        }
    }
    */

    let firstTopo = null;
    let secondTopo = null;
    let terceiroTopo = null;

    if (topos.length >= 1) {


        firstTopo = {
            index: toposOrd[0].index,
            high: toposOrd[0].high

        };

        var elementoEncontrado = topos.find(function (elemento) {
            return elemento.index === toposOrd[0].index;
        });

        if (elementoEncontrado) {
            var indicetp = topos.indexOf(elementoEncontrado);
            //console.log("indicetp:", indicetp);
        } else {
            console.log("Indicetp não encontrado na lista.");
        }

        if (indicetp > 0) {

            direcaoLeitura = "R";

            secondTopo = {
                index: topos[0].index,
                high: topos[0].high

            };

            terceiroTopo = {
                index: topos[0].index,
                high: topos[0].high

            };


        } else {

            direcaoLeitura = "L";

            secondTopo = {
                index: toposOrd[1].index,
                high: toposOrd[1].high

            };

            terceiroTopo = {
                index: toposOrd[2].index,
                high: toposOrd[2].high

            };


        }

        /*

        secondTopo = { 
            index: toposOrd[1].index,
            high: toposOrd[1].high

        };

        */
        /*
         //for (let i = firstTopo + 1; i < candles.length; i++) {
         for (let i = 2; i < toposOrd.length; i++) {
             if (toposOrd[i].index > firstTopo.index && parseFloat(toposOrd[i].high) > parseFloat(secondTopo.high)) {
                 
                 secondTopo = { 
                     index: toposOrd[i].index,
                     high: toposOrd[i].high
         
                 };
                 break;
                 
             }
         }
         */

        doisTopos.push(firstTopo);

        let inclinacaotp = null;

        // Calcular a inclinação da linha entre os pontos
        if (firstTopo !== null && secondTopo !== null) {
            inclinacaotp = (secondTopo.high - firstTopo.high) / (secondTopo.index - firstTopo.index);
            var b = firstTopo.high - inclinacaotp * firstTopo.index;

            // verifica se está atravessando candles

            if (indicetp > 0) {
                //console.log(" ");
                //console.log("indicetp:", indicetp);

                for (let i = indicetp - 1; i >= 0; i--) {
                    b = firstTopo.high - inclinacaotp * firstTopo.index;
                    var preco = inclinacaotp * topos[i].index + b;

                    /*
                    console.log("index:", i);
                    console.log("preco:", preco);
                    console.log("topos[i].high:", topos[i].high);
                    console.log(" ");
                    */

                    if (parseFloat(preco) <= parseFloat(topos[i].high) /* || topos[i].high > secondTopo.high */) {
                        secondTopo = { index: topos[i].index, high: topos[i].high };
                        inclinacaotp = (secondTopo.high - firstTopo.high) / (secondTopo.index - firstTopo.index);

                        //console.log("secondTopo:", secondTopo);
                        //console.log(" ");

                    }
                }
            } else {
                for (let i = 1; i < topos.length; i++) {
                    b = firstTopo.high - inclinacaotp * firstTopo.index;
                    var preco = inclinacaotp * topos[i].index + b;
                    if (preco <= topos[i].high /* || topos[i].high > secondTopo.high */) {
                        secondTopo = { index: topos[i].index, high: topos[i].high };
                        inclinacaotp = (secondTopo.high - firstTopo.high) / (secondTopo.index - firstTopo.index);
                    }
                }
            }

            //inclinacao = (secondTopo.high - firstTopo.high) / (secondTopo.index - firstTopo.index);

        }

        doisTopos.push(secondTopo);

        /////////////////////////////////////////// teste de novo topo
        var elementoEncontrado2 = topos.find(function (elemento) {
            return elemento.index === secondTopo.index;
        });

        if (elementoEncontrado2) {
            var indicetp2 = topos.indexOf(elementoEncontrado2);
            //console.log("indicetp2:", indicetp2);
            //console.log("direcaoLeitura:", direcaoLeitura);

        } else {
            console.log("Indicetp2 não encontrado na lista.");
        }

        if (secondTopo !== null && terceiroTopo !== null) {
            inclinacaotp = (terceiroTopo.high - secondTopo.high) / (terceiroTopo.index - secondTopo.index);
            var b = secondTopo.high - inclinacaotp * secondTopo.index;

            // Verificar se está atravessando candles

            if (indicetp2 > 0) {
                //console.log(" ");
                //console.log("inclinacaotp:", inclinacaotp);

                for (let i = indicetp2 - 1; i >= 0; i--) {
                    b = secondTopo.high - inclinacaotp * secondTopo.index;
                    var preco = inclinacaotp * topos[i].index + b;

                    /*
                    console.log("index:", i);
                    console.log("preco:", preco);
                    console.log("topos[i].high:", topos[i].high);
                    console.log(" ");
                    */

                    if (/* parseFloat(inclinacaotp) > parseFloat(0.0) && */ parseFloat(preco) <= parseFloat(topos[i].high) /* || topos[i].high < terceiroTopo.high */) {
                        terceiroTopo = { index: topos[i].index, high: topos[i].high };
                        inclinacaotp = (terceiroTopo.high - secondTopo.high) / (terceiroTopo.index - secondTopo.index);
                        //i = indicetp2 - 1;
                        //console.log("terceiroTopo:", terceiroTopo);
                        //console.log(" ");


                    }
                }
            } else {
                for (let i = indicetp2 + 1; i < topos.length; i++) {
                    b = secondTopo.high - inclinacaotp * secondTopo.index;
                    var preco = inclinacaotp * topos[i].index + b;
                    if (preco <= topos[i].high /* || topos[i].high < terceiroTopo.high */) {
                        terceiroTopo = { index: topos[i].index, high: topos[i].high };
                        inclinacaotp = (terceiroTopo.high - secondTopo.high) / (terceiroTopo.index - secondTopo.index);
                    }
                }
            }

            //inclinacao = (terceiroTopo.high - secondTopo.high) / (terceiroTopo.index - secondTopo.index);
        }

        if (secondTopo.index == terceiroTopo.index) {
            secondTopo = firstTopo;
            terceiroTopo = topos[1];
        }

        doisTopos2.push(secondTopo);
        doisTopos2.push(terceiroTopo);
        //console.log("doisTopos2:", doisTopos2);

    }

    var firstFundo = null;
    var secondFundo = null;
    var terceiroFundo = null;

    if (fundos.length >= 1) {
        firstFundo = {
            index: fundosOrd[0].index,
            low: fundosOrd[0].low
        };

        var elementoEncontradofd = fundos.find(function (elemento) {
            return elemento.index === fundosOrd[0].index;
        });

        if (elementoEncontradofd) {
            var indicefd = fundos.indexOf(elementoEncontradofd);
            //console.log("indicefd:", indicefd);
        } else {
            console.log("Elemento não encontrado na lista.");
        }

        if (indicefd > 0) {
            secondFundo = {
                index: fundos[0].index,
                low: fundos[0].low

            };
            terceiroFundo = {
                index: fundos[0].index,
                low: fundos[0].low

            };
        } else {
            secondFundo = {
                index: fundosOrd[1].index,
                low: fundosOrd[1].low

            };
            terceiroFundo = {
                index: fundosOrd[2].index,
                low: fundosOrd[2].low

            };
        }

        /*
        secondFundo = { 
            index: fundos[0].index,
            low: fundos[0].low
        };
    
        for (let i = 2; i < fundosOrd.length; i++) {
            if (fundosOrd[i].index > firstFundo.index && parseFloat(fundosOrd[i].low) < parseFloat(secondFundo.low)) {
                secondFundo = { 
                    index: fundosOrd[i].index,
                    low: fundosOrd[i].low
                };
                break;
            }
        }
        */

        doisFundos.push(firstFundo);
        let inclinacaofd = null;

        // Calcular a inclinação da linha entre os fundos
        if (firstFundo !== null && secondFundo !== null) {
            inclinacaofd = (secondFundo.low - firstFundo.low) / (secondFundo.index - firstFundo.index);
            var b = firstFundo.low - inclinacaofd * firstFundo.index;

            // Verificar se está atravessando candles

            if (indicefd > 0) {
                //console.log(" ");
                //console.log("inclinacaofd:", inclinacaofd);

                for (let i = indicefd - 1; i >= 0; i--) {
                    b = firstFundo.low - inclinacaofd * firstFundo.index;
                    var preco = inclinacaofd * fundos[i].index + b;

                    /*
                    console.log("index:", i);
                    console.log("preco:", preco);
                    console.log("fundos[i].low:", fundos[i].low);
                    console.log(" ");
                    */

                    if (/* parseFloat(inclinacaofd) > parseFloat(0.0) && */ parseFloat(preco) >= parseFloat(fundos[i].low) /* || fundos[i].low < secondFundo.low */) {
                        secondFundo = { index: fundos[i].index, low: fundos[i].low };
                        inclinacaofd = (secondFundo.low - firstFundo.low) / (secondFundo.index - firstFundo.index);
                        //i = indicefd - 1;
                        //console.log("secondFundo:", secondFundo);
                        //console.log(" ");

                    }
                }
            } else {
                for (let i = 1; i < fundos.length; i++) {
                    b = firstFundo.low - inclinacaofd * firstFundo.index;
                    var preco = inclinacaofd * fundos[i].index + b;
                    if (preco >= fundos[i].low /* || fundos[i].low < secondFundo.low */) {
                        secondFundo = { index: fundos[i].index, low: fundos[i].low };
                        inclinacaofd = (secondFundo.low - firstFundo.low) / (secondFundo.index - firstFundo.index);
                    }
                }
            }

            // inclinacao = (secondFundo.low - firstFundo.low) / (secondFundo.index - firstFundo.index);
        }

        doisFundos.push(secondFundo);

        /////////////////////////////////// teste de novo fundo
        var elementoEncontradofd2 = fundos.find(function (elemento) {
            return elemento.index === secondFundo.index;
        });

        if (elementoEncontradofd2) {
            var indicefd2 = fundos.indexOf(elementoEncontradofd2);
            //console.log("indicefd2:", indicefd2);
            //console.log("direcaoLeitura:", direcaoLeitura);

        } else {
            console.log("Indicefd2 não encontrado na lista.");
        }

        if (secondFundo !== null && terceiroFundo !== null) {
            inclinacaofd = (terceiroFundo.low - secondFundo.low) / (terceiroFundo.index - secondFundo.index);
            var b = secondFundo.low - inclinacaofd * secondFundo.index;

            // Verificar se está atravessando candles

            if (indicefd2 > 0) {
                //console.log(" ");
                //console.log("inclinacaofd:", inclinacaofd);

                for (let i = indicefd2 - 1; i >= 0; i--) {
                    b = secondFundo.low - inclinacaofd * secondFundo.index;
                    var preco = inclinacaofd * fundos[i].index + b;

                    /*
                    console.log("index:", i);
                    console.log("preco:", preco);
                    console.log("fundos[i].low:", fundos[i].low);
                    console.log(" ");
                    */

                    if (/* parseFloat(inclinacaofd) > parseFloat(0.0) && */ parseFloat(preco) >= parseFloat(fundos[i].low) /* || fundos[i].low < terceiroFundo.low */) {
                        terceiroFundo = { index: fundos[i].index, low: fundos[i].low };
                        inclinacaofd = (terceiroFundo.low - secondFundo.low) / (terceiroFundo.index - secondFundo.index);
                        //i = indicefd2 - 1;
                        //console.log("terceiroFundo:", terceiroFundo);
                        //console.log(" ");


                    }
                }
            } else {
                terceiroFundo = fundos[1];
                secondFundo = firstFundo;
                inclinacaofd = (terceiroFundo.low - secondFundo.low) / (terceiroFundo.index - secondFundo.index);

                for (let i = 2; i < fundos.length; i++) {
                    //for (let i = indicefd2 - 2; i > 0; i--) {
                    b = secondFundo.low - inclinacaofd * secondFundo.index;
                    var preco = inclinacaofd * fundos[i].index + b;
                    if (parseFloat(preco) >= parseFloat(fundos[i].low) /* || fundos[i].low < terceiroFundo.low */) {
                        secondFundo = { index: fundos[i].index, low: fundos[i].low };
                        inclinacaofd = (terceiroFundo.low - secondFundo.low) / (terceiroFundo.index - secondFundo.index);

                        //console.log(" ");
                        //console.log("terceiroFundo:", secondFundo);
                        //console.log(" ");
                    }
                }
            }

            // inclinacao = (terceiroFundo.low - secondFundo.low) / (terceiroFundo.index - secondFundo.index);
        }

        if (secondFundo.index == terceiroFundo.index) {
            secondFundo = firstFundo;
            terceiroFundo = fundos[1];
        }

        doisFundos2.push(secondFundo);
        doisFundos2.push(terceiroFundo);
        //console.log("doisFundos2:", doisFundos2);

    }

    //console.log("topos:", topos);
    //console.log("fundos:", fundos);

    // Retorna os 2 últimos topos e fundos
    return { topos: doisTopos, fundos: doisFundos, topos2: doisTopos2, fundos2: doisFundos2, tpList: topos, fdList: fundos };
}

function calcInclAtravCandles() {

}

function zigZagLta(candles, ponto1, ponto2) {

    const precos = candles.map(candle => parseFloat(candle.low));
    //let ponto1 = null;
    //let ponto2 = null;
    let inclinacao = null;

    //ponto1 = { index: i, low: precos[i] };
    //ponto2 = { index: i, low: precos[i] };

    if (ponto1 !== null && ponto2 !== null && ponto1 !== undefined && ponto2 !== undefined) {
        inclinacao = (ponto2.low - ponto1.low) / (ponto2.index - ponto1.index);

        var precosLTA = [];
        if (ponto1 !== null && ponto2 !== null) {
            b = ponto1.low - inclinacao * ponto1.index;
            const startIndex = ponto1.index > 0 ? 0 : ponto1.index;
            const endIndex = ponto2.index < precos.length - 1 ? precos.length - 1 : ponto2.index;
            for (let i = startIndex; i <= endIndex; i++) {
                const preco = inclinacao * i + b;
                //console.log("Preço:", preco.toFixed(5));
                precosLTA.push(parseFloat(preco.toFixed(5)));
            }
        }
    }

    return { ponto1, ponto2, inclinacao, precosLTA };
}

function zigZagLtb(candles, ponto1, ponto2) {

    const precos = candles.map(candle => parseFloat(candle.high));
    //let ponto1 = null;
    //let ponto2 = null;
    let inclinacao = null;

    //ponto1 = { index: i, high: precos[i] };
    //ponto2 = { index: i, high: precos[i] };

    if (ponto1 !== null && ponto2 !== null && ponto1 !== undefined && ponto2 !== undefined) {
        inclinacao = (ponto2.high - ponto1.high) / (ponto2.index - ponto1.index);

        var precosLTB = [];
        if (ponto1 !== null && ponto2 !== null) {
            b = ponto1.high - inclinacao * ponto1.index;
            const startIndex = ponto1.index > 0 ? 0 : ponto1.index;
            const endIndex = ponto2.index < precos.length - 1 ? precos.length - 1 : ponto2.index;
            for (let i = startIndex; i <= endIndex; i++) {
                const preco = inclinacao * i + b;
                //console.log("Preço:", preco.toFixed(5));
                precosLTB.push(parseFloat(preco.toFixed(5)));
            }
        }
    }

    return { ponto1, ponto2, inclinacao, precosLTB };
}

function calcularLinhaTendencia(candles, pontosUnificados) {
    let fundos = [];
    let topos = [];

    for (const ponto of pontosUnificados) {
        if (ponto.tipo === 'topo') { //} && topos.length < 3) {
            topos.push(ponto);
        } else if (ponto.tipo === 'fundo') { // && fundos.length < 3) {
            fundos.push(ponto);
        }
        /*
        if (fundos.length === 3 && topos.length === 3) {
            break;
        }
        */
    }

    /*
        if (parseFloat(inclinacaoLTA) < parseFloat(0.00)) {
            ponto2LTA = fundos[2];
            inclinacaoLTA = calcularInclinacao(ponto1LTA, ponto2LTA);
            if (parseFloat(inclinacaoLTA) < parseFloat(0.00)) {
                ponto2LTA = fundos[2];
                inclinacaoLTA = calcularInclinacao(ponto1LTA, ponto2LTA);
                if (parseFloat(inclinacaoLTA) < parseFloat(0.00)) {
                    ponto2LTA = fundos[2];
                    inclinacaoLTA = calcularInclinacao(ponto1LTA, ponto2LTA);
                    if (parseFloat(inclinacaoLTA) < parseFloat(0.00)) {
                        ponto2LTA = fundos[2];
                        inclinacaoLTA = calcularInclinacao(ponto1LTA, ponto2LTA);
                
        }}}}
    */

    var ponto1LTA = fundos[1];
    var ponto2LTA = fundos[0];
    var inclinacaoLTA = calcularInclinacao(ponto1LTA, ponto2LTA);

    var i = 1;
    while (inclinacaoLTA <= 0 && i < fundos.length - 1) {
        ponto1LTA = fundos[++i];
        inclinacaoLTA = calcularInclinacao(ponto1LTA, ponto2LTA);
    }
    //inclinacaoLTA = calcularInclinacao(ponto1LTA, ponto2LTA);

    if (i == (fundos.length)) {
        inclinacaoLTA = 0.0;
        // Não foi encontrado um ponto com inclinação positiva
        console.log("Não foi encontrado um ponto com inclinação positiva para LTA");
        // Você pode retornar um valor padrão ou lançar uma exceção aqui
    }


    var ponto1LTB = topos[1];
    var ponto2LTB = topos[0];
    var inclinacaoLTB = calcularInclinacao(ponto1LTB, ponto2LTB);

    i = 1;
    while (inclinacaoLTB >= 0 && i < topos.length - 1) {
        ponto1LTB = topos[++i];
        inclinacaoLTB = calcularInclinacao(ponto1LTB, ponto2LTB);
    }
    if (i == (topos.length - 1)) {
        inclinacaoLTB = 0.0;
        // Não foi encontrado um ponto com inclinação negativa
        console.log("Não foi encontrado um ponto com inclinação negativa para LTB");
        // Você pode retornar um valor padrão ou lançar uma exceção aqui
    }

    /*
    let ponto1LTA2 = fundos[1];
    let ponto2LTA2 = fundos[0];
    let inclinacaoLTA2 = calcularInclinacao(ponto1LTA2, ponto2LTA2);

    let ponto1LTB2 = topos[1];
    let ponto2LTB2 = topos[0];
    let inclinacaoLTB2 = calcularInclinacao(ponto1LTB2, ponto2LTB2);
    */

    let valorLTA = inclinacaoLTA * candles.length + (parseFloat(ponto2LTA.valor) - inclinacaoLTA * ponto2LTA.index);
    //let valorLTB = inclinacaoLTB * candles.length + (parseFloat(ponto2LTB.valor) - inclinacaoLTB * ponto2LTB.index);
    let valorLTB = ponto2LTB.valor + inclinacaoLTB * (candles.length - ponto2LTB.index - 1);


    //let valorLTA2 = inclinacaoLTA2 * candles.length + (parseFloat(ponto2LTA2.valor) - inclinacaoLTA2 * ponto2LTA2.index);
    //let valorLTB2 = inclinacaoLTB2 * candles.length + (parseFloat(ponto2LTB2.valor) - inclinacaoLTB2 * ponto2LTB2.index);

    return {
        lta: {
            valor: valorLTA,
            ponto1val: parseFloat(ponto1LTA.valor),
            ponto2val: parseFloat(ponto2LTA.valor),
            inclinacao: inclinacaoLTA
        },
        ltb: {
            valor: valorLTB,
            ponto1val: parseFloat(ponto1LTB.valor),
            ponto2val: parseFloat(ponto2LTB.valor),
            inclinacao: inclinacaoLTB
        },
        calc: {
            length: candles.length,
            p1LTAindex: ponto1LTA.index,
            p2LTAindex: ponto2LTA.index,
            p1LTBindex: ponto1LTB.index,
            p2LTBindex: ponto2LTB.index
        }
        /*
        ,
        lta2: {
            valor: valorLTA2,
            ponto1val: parseFloat(ponto1LTA2.valor),
            ponto2val: parseFloat(ponto2LTA2.valor),
            inclinacao: inclinacaoLTA
        },
        ltb2: {
            valor: valorLTB2,
            ponto1val: parseFloat(ponto1LTB2.valor),
            ponto2val: parseFloat(ponto2LTB2.valor),
            inclinacao: inclinacaoLTB
        }
            */

    };
}

function calcularInclinacao(ponto1, ponto2) {

    if (ponto1 !== undefined && ponto2 !== undefined) {

        return ((parseFloat(ponto2.valor) - parseFloat(ponto1.valor)) / (ponto2.index - ponto1.index));

    }

}
function calcularZigZag(candlesParam) {
    var pontos = [];
    var candles = candlesParam;
    //var candlesI = inverterLista(candlesP);
    var listaInvertida = [];
    var listaUnificada = [];
    let tipo = '';
    if (candles !== undefined) {
        for (let i = 5; i < candles.length - 3; i++) {
            //for (let i = candles.length - 14; i > 3; i--) {
            const anterior = candles[i - 1];
            const anterior2 = candles[i - 2];
            const anterior3 = candles[i - 3];
            const anterior4 = candles[i - 4];
            const anterior5 = candles[i - 5];
            //const anterior6 = candles[i - 6];
            //const anterior7 = candles[i - 7];
            //const anterior8 = candles[i - 8];
            //const anterior9 = candles[i - 9];
            //const anterior10 = candles[i - 10];
            //const anterior11 = candles[i - 11];
            //const anterior12 = candles[i - 12];
            //const anterior13 = candles[i - 13];
            //const anterior14 = candles[i - 14];
            const atual = candles[i];
            const proximo = candles[i + 1];
            const proximo2 = candles[i + 2];
            const proximo3 = candles[i + 3];

            // Verificar se o candle atual é menor que o topo anterior
            //if (atual.high < Math.max(...pontos.map(p => p.valor))) {
            if (atual.high >= anterior.high && atual.high >= proximo.high
                && atual.high >= anterior2.high && atual.high >= proximo2.high
                && atual.high >= anterior3.high && atual.high >= proximo3.high
                && atual.high >= anterior4.high // && atual.high >= proximo4.high 
                && atual.high >= anterior5.high // && atual.high >= proximo5.high 
                //&& atual.high >= anterior6.high // && atual.high >= proximo5.high 
                //&& atual.high >= anterior7.high // && atual.high >= proximo5.high 
                //&& atual.high >= anterior8.high // && atual.high >= proximo5.high 
                //&& atual.high >= anterior9.high // && atual.high >= proximo5.high 
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
                && atual.low <= anterior3.low && atual.low <= proximo3.low
                && atual.low <= anterior4.low
                && atual.low <= anterior5.low
                //&& atual.low <= anterior6.low
                //&& atual.low <= anterior7.low
                //&& atual.low <= anterior8.low
                //&& atual.low <= anterior9.low
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

function inverterLista(lista) {
    let novaLista = [];
    for (let i = lista.length - 1; i >= 0; i--) {
        novaLista.push(lista[i]);
    }
    return novaLista;
}

function tpfdListGen(zzList) {

    let tpList = [];
    let fdList = [];
    //for (let i = zzList.length - 1; i >= 0; i--) {
    for (let i = 0; i <= zzList.length - 1; i++) {

        //novaLista.push(lista[i]);
        if (zzList[i].tipo == 'topo') {
            var obj = { high: parseFloat(zzList[i].valor), index: zzList[i].index }
            tpList.push(obj);
            //tpList.push(zzList[i]);
        }
        if (zzList[i].tipo == 'fundo') {
            var obj = { low: parseFloat(zzList[i].valor), index: zzList[i].index }
            fdList.push(obj);
            //fdList.push(zzList[i]);

        }

    }
    return { tpList: tpList, fdList: fdList };
    //return { topos: doisTopos, fundos: doisFundos, topos2: doisTopos2, fundos2: doisFundos2 , tpList: topos, fdList: fundos };


}

function unificarRepeticoes(lista) {
    let unificado = [];
    let fundo = {};
    let topo = {};

    //for (let i = 0; i < lista.length; i++) {
    for (let i = lista.length; i < 0; i--) {
        if (lista[i].tipo === 'fundo') {
            if (!fundo.valor || parseFloat(lista[i].valor) < parseFloat(fundo.valor)) {
                fundo = lista[i];
            }
        } else if (lista[i].tipo === 'topo') {
            if (!topo.valor || parseFloat(lista[i].valor) > parseFloat(topo.valor)) {
                topo = lista[i];
            }
        }

        if (i + 1 < lista.length && lista[i].index !== lista[i + 1].index) {
            if (fundo.valor) {
                unificado.push(fundo);
                fundo = {};
            }
            if (topo.valor) {
                unificado.push(topo);
                topo = {};
            }
        }
    }

    return unificado;
}

function tracarLinhaMaisBaixa(candles) {
    const precos = candles.map(candle => parseFloat(candle.low));
    let ponto1 = null;
    let ponto2 = null;
    let inclinacao = null;

    // Encontrar o primeiro ponto mais baixo
    for (let i = 0; i < precos.length; i++) {
        if (ponto1 === null || precos[i] <= ponto1.low) {
            ponto1 = { index: i, low: precos[i] };
        }
    }

    // Verificar se o segundo ponto mais baixo deve ser usado em vez do primeiro
    if (ponto1.index + 3 >= precos.length) {
        var p1index = ponto1.index;
        ponto1 = null;
        for (let i = 0; i < p1index - 3; i++) {
            /*
            if (ponto1 !== null && ponto1.index + 2 < i) {
                break;
            }
            */
            if (ponto1 === null || precos[i] <= ponto1.low) {
                ponto1 = { index: i, low: precos[i] };
            }
        }
    }

    // Encontrar o segundo ponto mais baixo a partir do primeiro candle depois do primeiro ponto
    for (let i = ponto1.index + 1; i < precos.length - 2; i++) {
        if (ponto2 === null || precos[i] <= ponto2.low) {
            ponto2 = { index: i, low: precos[i] };
        }
    }

    // Calcular a inclinação da linha entre os pontos
    if (ponto1 !== null && ponto2 !== null) {
        inclinacao = (ponto2.low - ponto1.low) / (ponto2.index - ponto1.index);

        // verifica se está atravessando candles
        var b = ponto1.low - inclinacao * ponto1.index;
        for (let i = ponto1.index + 1; i <= precos.length - 3; i++) {
            b = ponto1.low - inclinacao * ponto1.index;
            var preco = inclinacao * i + b;
            if (preco >= precos[i] || precos[i] < ponto2.low) {
                ponto2 = { index: i, low: precos[i] };
                inclinacao = (ponto2.low - ponto1.low) / (ponto2.index - ponto1.index);
            }
        }

        //--test
        for (let i = ponto2.index; i <= precos[0]; i--) {
            b = ponto2.low - inclinacao * ponto2.index;
            var preco = inclinacao * i + b;
            if (preco >= precos[i] || precos[i] < ponto1.low) {
                ponto1 = { index: i, low: precos[i] };
                inclinacao = (ponto2.low - ponto1.low) / (ponto2.index - ponto1.index);
            }
        }

        // recalcular a inclinação da linha entre os pontos (para caso o ponto2 tenha mudado)
        //if (ponto1 !== null && ponto2 !== null) {
        inclinacao = (ponto2.low - ponto1.low) / (ponto2.index - ponto1.index);
    }

    /*
    //------------
    for (let i = ponto2.index; i <= precos[0]; i--) {
        b = ponto2.low - inclinacao * ponto2.index;
        var preco = inclinacao * i + b;
        if (preco <= precos[i] || precos[i] >= ponto1.low) {
            ponto1 = { index: i, low: precos[i] };
            inclinacao = (ponto2.low - ponto1.low) / (ponto2.index - ponto1.index);
        }
    }  
    
    // recalcular a inclinação da linha entre os pontos (para caso o ponto2 tenha mudado)
    if (ponto1 !== null && ponto2 !== null) {
        inclinacao = (ponto2.low - ponto1.low) / (ponto2.index - ponto1.index);
    }
*/

    // Imprimir os preços por onde a linha está passando
    var precosLTA = [];
    if (ponto1 !== null && ponto2 !== null) {
        b = ponto1.low - inclinacao * ponto1.index;
        const startIndex = ponto1.index > 0 ? 0 : ponto1.index;
        const endIndex = ponto2.index < precos.length - 1 ? precos.length - 1 : ponto2.index;
        for (let i = startIndex; i <= endIndex; i++) {
            const preco = inclinacao * i + b;
            //console.log("Preço:", preco.toFixed(5));
            precosLTA.push(parseFloat(preco.toFixed(5)));
        }
    }

    return { ponto1, ponto2, inclinacao, precosLTA };
}

function tracarLinhaMaisAlta(candles) {
    const precos = candles.map(candle => parseFloat(candle.high));
    let ponto1 = null;
    let ponto2 = null;
    let inclinacao = null;

    // Encontrar o primeiro ponto mais alto
    for (let i = 0; i < precos.length; i++) {
        if (ponto1 === null || precos[i] >= ponto1.high) {
            ponto1 = { index: i, high: precos[i] };
        }
    }

    // Verificar se o segundo ponto mais baixo deve ser usado em vez do primeiro
    if (ponto1.index + 3 >= precos.length) {
        var p1index = ponto1.index;
        ponto1 = null;
        for (let i = 0; i < p1index - 3; i++) {
            /*
            if (ponto1 !== null && ponto1.index + 2 < i) {
                break;
            }
            */

            if (ponto1 === null || precos[i] >= ponto1.high) {
                ponto1 = { index: i, high: precos[i] };
            }
        }
    }

    // Encontrar o segundo ponto mais alto a partir do primeiro candle depois do primeiro ponto
    for (let i = ponto1.index + 1; i < precos.length - 2; i++) {
        if (ponto2 === null || precos[i] >= ponto2.high) {
            ponto2 = { index: i, high: precos[i] };
        }
    }

    // Calcular a inclinação da linha entre os pontos
    if (ponto1 !== null && ponto2 !== null) {
        inclinacao = (ponto2.high - ponto1.high) / (ponto2.index - ponto1.index);

        // verifica se está atravessando candles
        var b = ponto1.high - inclinacao * ponto1.index;
        for (let i = ponto1.index + 1; i <= precos.length - 3; i++) {
            b = ponto1.high - inclinacao * ponto1.index;
            var preco = inclinacao * i + b;
            if (preco <= precos[i] || precos[i] > ponto2.high) {
                ponto2 = { index: i, high: precos[i] };
                inclinacao = (ponto2.high - ponto1.high) / (ponto2.index - ponto1.index);
            }
        }

        //--test
        for (let i = ponto2.index; i <= precos[0]; i--) {
            b = ponto2.high - inclinacao * ponto2.index;
            var preco = inclinacao * i + b;
            if (preco >= precos[i] || precos[i] < ponto1.high) {
                ponto1 = { index: i, high: precos[i] };
                inclinacao = (ponto2.high - ponto1.high) / (ponto2.index - ponto1.index);
            }
        }

        // recalcular a inclinação da linha entre os pontos (para caso o ponto2 tenha mudado)
        //if (ponto1 !== null && ponto2 !== null) {
        inclinacao = (ponto2.high - ponto1.high) / (ponto2.index - ponto1.index);
    }

    /*
    //------------
    for (let i = ponto2.index; i <= precos[0]; i--) {
        b = ponto2.high - inclinacao * ponto2.index;
        var preco = inclinacao * i + b;
        if (preco <= precos[i] || precos[i] >= ponto1.high) {
          ponto1 = { index: i, high: precos[i] };
          inclinacao = (ponto2.high - ponto1.high) / (ponto2.index - ponto1.index);
        }
    }  

    // recalcular a inclinação da linha entre os pontos (para caso o ponto2 tenha mudado)
    if (ponto1 !== null && ponto2 !== null) {
        inclinacao = (ponto2.high - ponto1.high) / (ponto2.index - ponto1.index);
    }
*/

    // Imprimir os preços por onde a linha está passando
    var precosLTB = [];
    if (ponto1 !== null && ponto2 !== null) {
        b = ponto1.high - inclinacao * ponto1.index;
        const startIndex = ponto1.index > 0 ? 0 : ponto1.index;
        const endIndex = ponto2.index < precos.length - 1 ? precos.length - 1 : ponto2.index;
        for (let i = startIndex; i <= endIndex; i++) {
            const preco = inclinacao * i + b;
            //console.log("Preço:", preco.toFixed(5));
            precosLTB.push(parseFloat(preco.toFixed(5)));
        }
    }

    return { ponto1, ponto2, inclinacao, precosLTB };
}

function estaProximoDaLinha(cryptSyb, precoLinha, precoAtual) {


    const variações = {

        'BTCUSDT': 0.003,
        'ADAUSDT': 0.003,
        'UNIUSDT': 0.001,
        'XRPUSDT': 0.001,
        'XMRUSDT': 0.0015,
        'SANDUSDT': 0.001,
        'GALAUSDT': 0.004,
        'VETUSDT': 0.0015,
        'DOGSUSDT': 0.00018,
        'USTCUSDT': 0.00018,

        'MYROUSDT': 0.00018,

        'REZUSDT': 0.00018,

        'WLDUSDT': 0.00018,

        '1000SHIBUSDT': 0.00018,



    };

    var margemVariation = variações[cryptSyb];

    if (margemVariation == undefined) {
        margemVariation = 0.00018;
    }
    //console.log("cryptSyb", cryptSyb);
    //console.log("margemVariation", margemVariation);

    var newP = null;

    var margemSuperior = null;
    var margemInferior = null;

    var decimais = calcDecimais(cryptSyb);

    var newP = parseFloat(parseFloat(precoLinha).toFixed(decimais));
    const margem = parseFloat(margemVariation); // margem de 3%
    margemSuperior = (parseFloat(newP) * (1 + margem)).toFixed(decimais);
    margemInferior = (parseFloat(newP) * (1 - margem)).toFixed(decimais);
    /*
        if (cryptSyb == 'ADAUSDT' || cryptSyb == 'XRPUSDT' || cryptSyb == 'WLDUSDT') {
            var newP = parseFloat(parseFloat(precoLinha).toFixed(4));
            const margem = parseFloat(margemVariation); // margem de 3%
            margemSuperior = (parseFloat(newP) * (1 + margem)).toFixed(4);
            margemInferior = (parseFloat(newP) * (1 - margem)).toFixed(4);
    
        } else if (cryptSyb == 'BTCUSDT') {
            var newP = parseFloat(parseFloat(precoLinha).toFixed(1));
            const margem = parseFloat(margemVariation); // margem de 3%
            margemSuperior = (parseFloat(newP) * (1 + margem)).toFixed(1);
            margemInferior = (parseFloat(newP) * (1 - margem)).toFixed(1);
    
        }else {
            var newP = parseFloat(parseFloat(precoLinha).toFixed(5));
            const margem = parseFloat(margemVariation); // margem de 3%
            margemSuperior = (parseFloat(newP) * (1 + margem)).toFixed(5);
            margemInferior = (parseFloat(newP) * (1 - margem)).toFixed(5);
    
        }
    */

    //const margem = margemVariation; // margem de 3%
    //const margemSuperior = (parseFloat(newP) * (1 + margem)).toFixed(4);
    //const margemInferior = (parseFloat(newP) * (1 - margem)).toFixed(4);
    //const precoLinha = inclinacao * ponto.index + b;

    var estaProximo = false;
    if ((parseFloat(precoAtual) >= margemInferior && parseFloat(precoAtual) <= margemSuperior) || parseFloat(precoAtual) == margemSuperior) {
        estaProximo = true;
    } else {
        estaProximo = false;
    }

    return { estaProximo, margemSuperior, margemInferior, preco: newP };
}


function obterUltimosCandles(marketData) {
    var ultimosCandles = [];


    //console.log('obterUltimosCandles/marketData', marketData);

    /*
        const candles = [
      { timestamp: '12:00:00', high: '0.41390', low: '0.41110' },
      { timestamp: 1682004600000, high: '0.41240', low: '0.40500' },
      { timestamp: 1682006400000, high: '0.40640', low: '0.39310' },
      { timestamp: 1682008200000, high: '0.40500', low: '0.39800' },
      { timestamp: 1682010000000, high: '0.40210', low: '0.39520' },
      { timestamp: 1682011800000, high: '0.40200', low: '0.39690' },
      { timestamp: 1682013600000, high: '0.40020', low: '0.39660' },
      { timestamp: 1682015400000, high: '0.40100', low: '0.39630' },
      { timestamp: 1682017200000, high: '0.40060', low: '0.39640' },
      { timestamp: 1682019000000, high: '0.39880', low: '0.39580' },
      { timestamp: 1682020800000, high: '0.40400', low: '0.39540' },
      { timestamp: 1682022600000, high: '0.40420', low: '0.40180' },
      { timestamp: 1682024400000, high: '0.40370', low: '0.40140' },
      { timestamp: 1682026200000, high: '0.40300', low: '0.40120' },
      { timestamp: 1682028000000, high: '0.40560', low: '0.40190' },
      { timestamp: 1682029800000, high: '0.40400', low: '0.40160' },
      { timestamp: 1682031600000, high: '0.40350', low: '0.39930' },
      { timestamp: 1682033400000, high: '0.40100', low: '0.39920' },
      { timestamp: 1682035200000, high: '0.40260', low: '0.39860' },
      { timestamp: 1682037000000, high: '0.40400', low: '0.39890' },
      { timestamp: 1682038800000, high: '0.40300', low: '0.40060' },
      { timestamp: 1682040600000, high: '0.40240', low: '0.40050' },
      { timestamp: 1682042400000, high: '0.40140', low: '0.39960' },
      { timestamp: 1682044200000, high: '0.40160', low: '0.39900' },
      { timestamp: 1682046000000, high: '0.40330', low: '0.40130' },
      { timestamp: 1682047800000, high: '0.40370', low: '0.40210' },
      { timestamp: 1682049600000, high: '0.40470', low: '0.40310' },
      { timestamp: 1682051400000, high: '0.40470', low: '0.40210' },
      { timestamp: 1682053200000, high: '0.40360', low: '0.40180' },
      { timestamp: 1682055000000, high: '0.40500', low: '0.40240' },
      { timestamp: 1682056800000, high: '0.40660', low: '0.40280' },
      { timestamp: 1682058600000, high: '0.40610', low: '0.39840' },
      { timestamp: 1682060400000, high: '0.40250', low: '0.39980' },
      { timestamp: 1682062200000, high: '0.40620', low: '0.39980' },
      { timestamp: 1682064000000, high: '0.40710', low: '0.40330' },
      { timestamp: 1682065800000, high: '0.40500', low: '0.40300' },
      { timestamp: 1682067600000, high: '0.40610', low: '0.40350' },
      { timestamp: 1682069400000, high: '0.40680', low: '0.40460' },
      { timestamp: 1682071200000, high: '0.40590', low: '0.40330' },
      { timestamp: 1682073000000, high: '0.40520', low: '0.40130' },
      { timestamp: 1682074800000, high: '0.40260', low: '0.39910' },
      { timestamp: 1682076600000, high: '0.40190', low: '0.39910' },
      { timestamp: 1682078400000, high: '0.40100', low: '0.39550' },
      { timestamp: 1682080200000, high: '0.40160', low: '0.39970' },
      { timestamp: 1682082000000, high: '0.40250', low: '0.40060' },
      { timestamp: 1682083800000, high: '0.40460', low: '0.40020' },
      { timestamp: 1682085600000, high: '0.40190', low: '0.39810' },
      { timestamp: 1682087400000, high: '0.40210', low: '0.39910' },
      { timestamp: 1682089200000, high: '0.40150', low: '0.39850' },
      { timestamp: '12:30:00', high: '0.40080', low: '0.39900' }
    ];
    
    */

    var sequence = [];
    var i = 1;
    var index = 0;
    //var obj = {};

    //sequence.pop();
    if (marketData !== undefined) {
        for (var i = 1; i <= 400; i++) {
            //for (i = 400; i >= 1; i--) {

            index = marketData.length - (400 - i + 1);
            var obj = {
                index: i,
                timestamp: marketData.timestamp[i],
                timestampHD: formatTime(marketData.timestamp[i]),
                open: marketData.open[i],
                close: marketData.close[i],
                high: marketData.high[i],
                low: marketData.low[i]
            };
            sequence.push(obj);
        }

        //console.log('sequence', sequence);

        const candles = [
            { timestamp: formatTime(marketData.timestamp[marketData.timestamp.length - 100]), high: marketData.high[marketData.high.length - 100], low: marketData.low[marketData.low.length - 100] },

            { timestamp: marketData.timestamp[marketData.timestamp.length - 99], high: marketData.high[marketData.high.length - 99], low: marketData.low[marketData.low.length - 99] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 98], high: marketData.high[marketData.high.length - 98], low: marketData.low[marketData.low.length - 98] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 97], high: marketData.high[marketData.high.length - 97], low: marketData.low[marketData.low.length - 97] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 96], high: marketData.high[marketData.high.length - 96], low: marketData.low[marketData.low.length - 96] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 95], high: marketData.high[marketData.high.length - 95], low: marketData.low[marketData.low.length - 95] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 94], high: marketData.high[marketData.high.length - 94], low: marketData.low[marketData.low.length - 94] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 93], high: marketData.high[marketData.high.length - 93], low: marketData.low[marketData.low.length - 93] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 92], high: marketData.high[marketData.high.length - 92], low: marketData.low[marketData.low.length - 92] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 91], high: marketData.high[marketData.high.length - 91], low: marketData.low[marketData.low.length - 91] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 90], high: marketData.high[marketData.high.length - 90], low: marketData.low[marketData.low.length - 90] },

            { timestamp: marketData.timestamp[marketData.timestamp.length - 89], high: marketData.high[marketData.high.length - 89], low: marketData.low[marketData.low.length - 89] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 88], high: marketData.high[marketData.high.length - 88], low: marketData.low[marketData.low.length - 88] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 87], high: marketData.high[marketData.high.length - 87], low: marketData.low[marketData.low.length - 87] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 86], high: marketData.high[marketData.high.length - 86], low: marketData.low[marketData.low.length - 86] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 85], high: marketData.high[marketData.high.length - 85], low: marketData.low[marketData.low.length - 85] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 84], high: marketData.high[marketData.high.length - 84], low: marketData.low[marketData.low.length - 84] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 83], high: marketData.high[marketData.high.length - 83], low: marketData.low[marketData.low.length - 83] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 82], high: marketData.high[marketData.high.length - 82], low: marketData.low[marketData.low.length - 82] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 81], high: marketData.high[marketData.high.length - 81], low: marketData.low[marketData.low.length - 81] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 80], high: marketData.high[marketData.high.length - 80], low: marketData.low[marketData.low.length - 80] },

            { timestamp: marketData.timestamp[marketData.timestamp.length - 79], high: marketData.high[marketData.high.length - 79], low: marketData.low[marketData.low.length - 79] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 78], high: marketData.high[marketData.high.length - 78], low: marketData.low[marketData.low.length - 78] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 77], high: marketData.high[marketData.high.length - 77], low: marketData.low[marketData.low.length - 77] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 76], high: marketData.high[marketData.high.length - 76], low: marketData.low[marketData.low.length - 76] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 75], high: marketData.high[marketData.high.length - 75], low: marketData.low[marketData.low.length - 75] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 74], high: marketData.high[marketData.high.length - 74], low: marketData.low[marketData.low.length - 74] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 73], high: marketData.high[marketData.high.length - 73], low: marketData.low[marketData.low.length - 73] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 72], high: marketData.high[marketData.high.length - 72], low: marketData.low[marketData.low.length - 72] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 71], high: marketData.high[marketData.high.length - 71], low: marketData.low[marketData.low.length - 71] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 70], high: marketData.high[marketData.high.length - 70], low: marketData.low[marketData.low.length - 70] },

            { timestamp: marketData.timestamp[marketData.timestamp.length - 69], high: marketData.high[marketData.high.length - 69], low: marketData.low[marketData.low.length - 69] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 68], high: marketData.high[marketData.high.length - 68], low: marketData.low[marketData.low.length - 68] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 67], high: marketData.high[marketData.high.length - 67], low: marketData.low[marketData.low.length - 67] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 66], high: marketData.high[marketData.high.length - 66], low: marketData.low[marketData.low.length - 66] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 65], high: marketData.high[marketData.high.length - 65], low: marketData.low[marketData.low.length - 65] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 64], high: marketData.high[marketData.high.length - 64], low: marketData.low[marketData.low.length - 64] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 63], high: marketData.high[marketData.high.length - 63], low: marketData.low[marketData.low.length - 63] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 62], high: marketData.high[marketData.high.length - 62], low: marketData.low[marketData.low.length - 62] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 61], high: marketData.high[marketData.high.length - 61], low: marketData.low[marketData.low.length - 61] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 60], high: marketData.high[marketData.high.length - 60], low: marketData.low[marketData.low.length - 60] },

            { timestamp: marketData.timestamp[marketData.timestamp.length - 59], high: marketData.high[marketData.high.length - 59], low: marketData.low[marketData.low.length - 59] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 58], high: marketData.high[marketData.high.length - 58], low: marketData.low[marketData.low.length - 58] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 57], high: marketData.high[marketData.high.length - 57], low: marketData.low[marketData.low.length - 57] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 56], high: marketData.high[marketData.high.length - 56], low: marketData.low[marketData.low.length - 56] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 55], high: marketData.high[marketData.high.length - 55], low: marketData.low[marketData.low.length - 55] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 54], high: marketData.high[marketData.high.length - 54], low: marketData.low[marketData.low.length - 54] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 53], high: marketData.high[marketData.high.length - 53], low: marketData.low[marketData.low.length - 53] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 52], high: marketData.high[marketData.high.length - 52], low: marketData.low[marketData.low.length - 52] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 51], high: marketData.high[marketData.high.length - 51], low: marketData.low[marketData.low.length - 51] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 50], high: marketData.high[marketData.high.length - 50], low: marketData.low[marketData.low.length - 50] },

            { timestamp: marketData.timestamp[marketData.timestamp.length - 49], high: marketData.high[marketData.high.length - 49], low: marketData.low[marketData.low.length - 49] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 48], high: marketData.high[marketData.high.length - 48], low: marketData.low[marketData.low.length - 48] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 47], high: marketData.high[marketData.high.length - 47], low: marketData.low[marketData.low.length - 47] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 46], high: marketData.high[marketData.high.length - 46], low: marketData.low[marketData.low.length - 46] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 45], high: marketData.high[marketData.high.length - 45], low: marketData.low[marketData.low.length - 45] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 44], high: marketData.high[marketData.high.length - 44], low: marketData.low[marketData.low.length - 44] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 43], high: marketData.high[marketData.high.length - 43], low: marketData.low[marketData.low.length - 43] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 42], high: marketData.high[marketData.high.length - 42], low: marketData.low[marketData.low.length - 42] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 41], high: marketData.high[marketData.high.length - 41], low: marketData.low[marketData.low.length - 41] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 40], high: marketData.high[marketData.high.length - 40], low: marketData.low[marketData.low.length - 40] },

            { timestamp: marketData.timestamp[marketData.timestamp.length - 39], high: marketData.high[marketData.high.length - 39], low: marketData.low[marketData.low.length - 39] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 38], high: marketData.high[marketData.high.length - 38], low: marketData.low[marketData.low.length - 38] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 37], high: marketData.high[marketData.high.length - 37], low: marketData.low[marketData.low.length - 37] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 36], high: marketData.high[marketData.high.length - 36], low: marketData.low[marketData.low.length - 36] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 35], high: marketData.high[marketData.high.length - 35], low: marketData.low[marketData.low.length - 35] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 34], high: marketData.high[marketData.high.length - 34], low: marketData.low[marketData.low.length - 34] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 33], high: marketData.high[marketData.high.length - 33], low: marketData.low[marketData.low.length - 33] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 32], high: marketData.high[marketData.high.length - 32], low: marketData.low[marketData.low.length - 32] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 31], high: marketData.high[marketData.high.length - 31], low: marketData.low[marketData.low.length - 31] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 30], high: marketData.high[marketData.high.length - 30], low: marketData.low[marketData.low.length - 30] },

            { timestamp: marketData.timestamp[marketData.timestamp.length - 29], high: marketData.high[marketData.high.length - 29], low: marketData.low[marketData.low.length - 29] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 28], high: marketData.high[marketData.high.length - 28], low: marketData.low[marketData.low.length - 28] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 27], high: marketData.high[marketData.high.length - 27], low: marketData.low[marketData.low.length - 27] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 26], high: marketData.high[marketData.high.length - 26], low: marketData.low[marketData.low.length - 26] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 25], high: marketData.high[marketData.high.length - 25], low: marketData.low[marketData.low.length - 25] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 24], high: marketData.high[marketData.high.length - 24], low: marketData.low[marketData.low.length - 24] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 23], high: marketData.high[marketData.high.length - 23], low: marketData.low[marketData.low.length - 23] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 22], high: marketData.high[marketData.high.length - 22], low: marketData.low[marketData.low.length - 22] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 21], high: marketData.high[marketData.high.length - 21], low: marketData.low[marketData.low.length - 21] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 20], high: marketData.high[marketData.high.length - 20], low: marketData.low[marketData.low.length - 20] },

            { timestamp: marketData.timestamp[marketData.timestamp.length - 19], high: marketData.high[marketData.high.length - 19], low: marketData.low[marketData.low.length - 19] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 18], high: marketData.high[marketData.high.length - 18], low: marketData.low[marketData.low.length - 18] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 17], high: marketData.high[marketData.high.length - 17], low: marketData.low[marketData.low.length - 17] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 16], high: marketData.high[marketData.high.length - 16], low: marketData.low[marketData.low.length - 16] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 15], high: marketData.high[marketData.high.length - 15], low: marketData.low[marketData.low.length - 15] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 14], high: marketData.high[marketData.high.length - 14], low: marketData.low[marketData.low.length - 14] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 13], high: marketData.high[marketData.high.length - 13], low: marketData.low[marketData.low.length - 13] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 12], high: marketData.high[marketData.high.length - 12], low: marketData.low[marketData.low.length - 12] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 11], high: marketData.high[marketData.high.length - 11], low: marketData.low[marketData.low.length - 11] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 10], high: marketData.high[marketData.high.length - 10], low: marketData.low[marketData.low.length - 10] },

            { timestamp: marketData.timestamp[marketData.timestamp.length - 9], high: marketData.high[marketData.high.length - 9], low: marketData.low[marketData.low.length - 9] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 8], high: marketData.high[marketData.high.length - 8], low: marketData.low[marketData.low.length - 8] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 7], high: marketData.high[marketData.high.length - 7], low: marketData.low[marketData.low.length - 7] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 6], high: marketData.high[marketData.high.length - 6], low: marketData.low[marketData.low.length - 6] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 5], high: marketData.high[marketData.high.length - 5], low: marketData.low[marketData.low.length - 5] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 4], high: marketData.high[marketData.high.length - 4], low: marketData.low[marketData.low.length - 4] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 3], high: marketData.high[marketData.high.length - 3], low: marketData.low[marketData.low.length - 3] },
            { timestamp: marketData.timestamp[marketData.timestamp.length - 2], high: marketData.high[marketData.high.length - 2], low: marketData.low[marketData.low.length - 2] },
            { timestamp: formatTime(marketData.timestamp[marketData.timestamp.length - 1]), high: marketData.high[marketData.high.length - 1], low: marketData.low[marketData.low.length - 1] }
        ];


        // Começa a partir do índice length-20 para obter os últimos 20 elementos
        for (var i = 20; i < 1; i--) {
            ultimosCandles.push(marketData[i]);
        }

        return sequence;
    } else {
        return undefined
    }
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeMoneyRain(timestamp, onOff, cryptSymbol, preco_atual, simulation = false) {

    //console.time('makeMoneyRain');
    if (ws !== null
        && ws.readyState === WebSocket.OPEN

    ) {
        await timeout(200); // 1s

        let cryptSymbolLowC = cryptSymbol.toLowerCase();

        ws.send(JSON.stringify({ "method": "SUBSCRIBE", "params": [`${cryptSymbolLowC}_perpetual@continuousKline_5m`], "id": 1 }));

        //ws.send(JSON.stringify({ "method": "SUBSCRIBE", "params": [`btcusdt_perpetual@continuousKline_5m`], "id": 1 }));
    }



    //const sig = objSendcalc.signals;
    const sig = null;

    const oldFlag = flagpos[`${cryptSymbol}`];

    var posCalc = [];

    //console.log("position", position);
    if (position !== null
        && position !== undefined
        //&& position.length !== 0 
        && position[`${cryptSymbol}`] !== null
        && position[`${cryptSymbol}`] !== undefined
        //&& position[`${cryptSymbol}`].length !== 0
    ) {
        posCalc = position[`${cryptSymbol}`][0];
        await fixFlag(posCalc, cryptSymbol);
    }
    await timeout(2000); // 5s

    //await calcOpenPositionAll(posCalc, timestamp, sig, onOff);
    await calcOpenPositionElite(posCalc, timestamp, onOff, cryptSymbol, preco_atual, position, simulation);

    if (oldFlag == flagpos[`${cryptSymbol}`]) {
        if (position[`${cryptSymbol}`] !== undefined) {
            //await calcStopTake(position[`${cryptSymbol}`][0], sig);
        }
    }

    /*
    if(flag !== ""){
        await calcClosePosition(timestamp, sig, onOff);

    }else if(flag == ""){
        await calcOpenPosition(timestamp, sig, onOff);
    }
    */
    //console.timeEnd('makeMoneyRain');

}

function smaRibbon() {

    const arrNumb3m_C = marketData3m[`${cryptSymbol}`].close.map((i) => Number(i));
    const arrNumb5m_C = marketData3m[`${cryptSymbol}`].close.map((i) => Number(i));
    const arrNumb15m_C = marketData3m[`${cryptSymbol}`].close.map((i) => Number(i));
    const arrNumb30m_C = marketData3m[`${cryptSymbol}`].close.map((i) => Number(i));
    const arrNumb1h_C = marketData3m[`${cryptSymbol}`].close.map((i) => Number(i));
    const arrNumb4h_C = marketData3m[`${cryptSymbol}`].close.map((i) => Number(i));

    const arrSma3m20p = SMA.calculate({ period: 20, values: arrNumb3m_C });

    const sma3m20p_atual = parseFloat(arrSma3m20p[arrSma3m20p.length - 1].toFixed(5));
    const sma3m20p_anterior = parseFloat(arrSma3m20p[arrSma3m20p.length - 2].toFixed(5));


}

function identificarIntervaloHora() {
    const agora = new Date();
    const minutos = agora.getMinutes();

    // Verificar se estamos nos primeiros 10 minutos do intervalo
    if (minutos >= 0 && minutos <= 5) {
        return true;
    }
    // Verificar se estamos nos últimos 10 minutos do intervalo
    else if (minutos >= 25 && minutos <= 35) {
        return true;
    }

    else if (minutos >= 55 && minutos <= 59) {
        return true;
    }

    return false;
}

async function calcRangeProfitLoss(posit, cacheJson, cryptSymbol) {


    //var margem = Number.parseFloat(posit.positionInitialMargin).toFixed(2);

    var profit = Number.parseFloat(posit.unrealizedProfit).toFixed(2);
    var percent = percentage(posit.unrealizedProfit, posit.positionInitialMargin).toFixed(2);
    //var percentAbs = Math.abs(percent); 
    var range = parseFloat(40);
    cacheJson[`${cryptSymbol}`] = await carregarCache(cryptSymbol);

    var flag = cacheJson[`${cryptSymbol}`].objSendcalc.flag;
    //var objSendcalc = cacheJson[`${cryptSymbol}`].objSendcalc;

    var sma1m50p = cacheJson[`${cryptSymbol}`].objMarket.sma1m50p;
    var sma1m60p = cacheJson[`${cryptSymbol}`].objMarket.sma1m60p;
    var sma5m50p = cacheJson[`${cryptSymbol}`].objMarket.sma5m50p;
    var sma5m60p = cacheJson[`${cryptSymbol}`].objMarket.sma5m60p;

    var sma1m50prev = cacheJson[`${cryptSymbol}`].objMarket.sma1m50prev;
    var sma1m60prev = cacheJson[`${cryptSymbol}`].objMarket.sma1m60prev;
    var sma5m50prev = cacheJson[`${cryptSymbol}`].objMarket.sma5m50prev;
    var sma5m60prev = cacheJson[`${cryptSymbol}`].objMarket.sma5m60prev;

    var stoch5m = cacheJson[`${cryptSymbol}`].objMarket.stoch5m;
    var stoch5mprev = cacheJson[`${cryptSymbol}`].objMarket.stoch5mprev;
    var stoch30m = cacheJson[`${cryptSymbol}`].objMarket.stoch30m;
    var stoch30mprev = cacheJson[`${cryptSymbol}`].objMarket.stoch30mprev;

    var mediamovel = '';

    var mmUpRef2 = '';
    var mmDownRef2 = '';
    var mmUp2 = null;
    var mmDown2 = null;

    var preco_atual = cacheJson[`${cryptSymbol}`].preco_atual;


    /*
        var sobreJson = {
        timestamp: 1710681448847,
        price: 0.6797,
        priceAT: 0.6792,
        name: 'ltb4h',
        zzdir: 1,
        pontos: 3,
        plus: 1,
        momentum: 38.6,
        momentumPrice: 0.6794,
        stop: 8.600000000000001,
        refMMname: 'sma5m50p',
        refMMprice: 0.6741,
        stopMMname: 'sma5m50p',
        stopMMprice: 0.6738
        }
    
          cacheJson[`${cryptSymbol}`].priceRefOp = sobreJson;
          salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
    */

    if (cacheJson[`${cryptSymbol}`].objMarket !== undefined
        && cacheJson[`${cryptSymbol}`].objMarket !== null
    ) {
        if (sma1m50p !== undefined
            && sma1m60p !== undefined
            && sma5m50p !== undefined
            && sma5m60p !== undefined

            && sma1m50prev !== undefined
            && sma1m60prev !== undefined
            && sma5m50prev !== undefined
            && sma5m60prev !== undefined

            && stoch5m !== undefined
            && stoch5mprev !== undefined
            && stoch30m !== undefined
            && stoch30mprev !== undefined

        ) {



            if (
                sma1m50p.preco >= sma1m60p.preco
            ) {
                mmUp2 = estaProximoDaLinha(cryptSymbol, sma1m50p.preco, preco_atual);
                mmDown2 = estaProximoDaLinha(cryptSymbol, sma1m60p.preco, preco_atual);

                mmUpRef2 = 'sma1m50p';
                mmDownRef2 = 'sma1m60p';

            } else {
                mmUp2 = estaProximoDaLinha(cryptSymbol, sma1m60p.preco, preco_atual);
                mmDown2 = estaProximoDaLinha(cryptSymbol, sma1m50p.preco, preco_atual);

                mmUpRef2 = 'sma1m60p';
                mmDownRef2 = 'sma1m50p';

            }

            if (cacheJson[`${cryptSymbol}`] !== null && cacheJson[`${cryptSymbol}`] !== undefined
                && cacheJson[`${cryptSymbol}`].priceRefOp !== null && cacheJson[`${cryptSymbol}`].priceRefOp !== undefined
            ) {


                if (flag.charAt(4) == "C"
                    //&& parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.momentum) > parseFloat(50)
                    //&& cacheJson[`${cryptSymbol}`].plus >= 1

                ) {

                    /*
        
                    if (
                        sma5m50p.preco <= sma5m60p.preco
                    ) {
                        console.log("MMset: sma5m50p");
                        cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname = 'sma5m50p';
                        cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice = sma5m50p.preco;
        
                    } else {
                        console.log("MMset: sma5m60p");
                        cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname = 'sma5m60p';
                        cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice = sma5m60p.preco;
        
                    }
        
                    salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
        
                    */

                    /*
                    else if (
                        preco_atual > sma5m50p.margemSuperior
                        && preco_atual > sma5m60p.margemSuperior
                        && preco_atual > sma1m50p.margemSuperior
                        && preco_atual > sma1m60p.margemSuperior
                        && (sma1m50p.preco < sma5m50p.margemSuperior
                            || sma1m50p.preco < sma5m60p.margemSuperior
                            || sma1m60p.preco < sma5m50p.margemSuperior
                            || sma1m60p.preco < sma5m60p.margemSuperior)
                    ) {
        
                        if (
                            cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname !== 'sma1m50p'
                            && cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname !== 'sma1m60p'
                        ) {
        
                            if (
                                sma5m50p.preco <= sma5m60p.preco
                            ) {
                                console.log("MMset: sma5m50p");
                                cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname = 'sma5m50p';
                                cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice = sma5m50p.margemInferior;
        
                            } else {
                                console.log("MMset: sma5m60p");
                                cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname = 'sma5m60p';
                                cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice = sma5m60p.margemInferior;
        
                            }
                        }
        
                    } else if (
                        preco_atual > sma5m50p.margemSuperior
                        && preco_atual > sma5m60p.margemSuperior
                        && preco_atual < sma1m50p.margemSuperior
                        && preco_atual < sma1m60p.margemSuperior
                    ) {
                        if (
                            cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname !== 'sma1m50p'
                            && cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname !== 'sma1m60p'
                        ) {
        
                            if (
                                sma5m50p.preco <= sma5m60p.preco
                            ) {
                                console.log("MMset: sma5m50p");
                                cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname = 'sma5m50p';
                                cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice = sma5m50p.margemInferior;
        
                            } else {
                                console.log("MMset: sma5m60p");
                                cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname = 'sma5m60p';
                                cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice = sma5m60p.margemInferior;
        
                            }
                        }
        
                    }
                    */
                    //salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                }

                if (flag.charAt(4) == "V"
                    //&& parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.momentum) > parseFloat(50)
                    //&& cacheJson[`${cryptSymbol}`].plus >= 1

                ) {

                    /*
                        if (
                            sma5m50p.preco >= sma5m60p.preco
                        ) {
                            console.log("MMset: sma5m50p");
                            cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname = 'sma5m50p';
                            cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice = sma5m50p.preco;
            
                        } else {
                            console.log("MMset: sma5m60p");
                            cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname = 'sma5m60p';
                            cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice = sma5m60p.preco;
            
                        }
            
                        salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                        */

                    /*
                    else if (
                        preco_atual < sma5m50p.margemInferior
                        && preco_atual < sma5m60p.margemInferior
                        && preco_atual < sma1m50p.margemInferior
                        && preco_atual < sma1m60p.margemInferior
                        && (sma1m50p.preco > sma5m50p.margemInferior
                            || sma1m50p.preco > sma5m60p.margemInferior
                            || sma1m60p.preco > sma5m50p.margemInferior
                            || sma1m60p.preco > sma5m60p.margemInferior)
                    ) {
        
                        if (
                            cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname !== 'sma1m50p'
                            && cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname !== 'sma1m60p'
                        ) {
        
        
                            if (
                                sma5m50p.preco >= sma5m60p.preco
                            ) {
                                console.log("MMset: sma5m50p");
                                cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname = 'sma5m50p';
                                cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice = sma5m50p.margemSuperior;
        
                            } else {
                                console.log("MMset: sma5m60p");
                                cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname = 'sma5m60p';
                                cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice = sma5m60p.margemSuperior;
        
                            }
                        }
        
        
                    } else if (
                        preco_atual < sma5m50p.margemInferior
                        && preco_atual < sma5m60p.margemInferior
                        && preco_atual > sma1m50p.margemInferior
                        && preco_atual > sma1m60p.margemInferior
                    ) {
        
                        if (
                            cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname !== 'sma1m50p'
                            && cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname !== 'sma1m60p'
                        ) {
                            if (
                                sma5m50p.preco >= sma5m60p.preco
                            ) {
                                console.log("MMset: sma5m50p");
                                cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname = 'sma5m50p';
                                cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice = sma5m50p.margemSuperior;
        
                            } else {
                                console.log("MMset: sma5m60p");
                                cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname = 'sma5m60p';
                                cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice = sma5m60p.margemSuperior;
        
                            }
                        }
        
        
                    }
        
                    salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                    */
                }

                if ((cacheJson[`${cryptSymbol}`].plus == 0 || cacheJson[`${cryptSymbol}`].plus == 1 || cacheJson[`${cryptSymbol}`].plus == 2)
                    && parseFloat(percent) > 0.00) {
                    //cacheJson[`${cryptSymbol}`].priceRefOp.momentum = parseFloat(percent);

                }

                //if (parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(20)
                if (
                    parseFloat(percent) >= parseFloat(20000)
                    && cacheJson[`${cryptSymbol}`].priceRefOp.pontos <= 2
                    && sma1m20p.estaProximo
                    //(cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname == 'sma1m50p' || cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname == 'sma1m60p')
                    //&& parseFloat(percent) <= parseFloat(30.00)
                    //(sma1m10p.estaProximo || sma1m20p.estaProximo)
                    //&& ((sma1m50p.estaProximo || sma1m60p.estaProximo)
                    //    || (sma5m50p.estaProximo || sma5m60p.estaProximo))


                ) {
                    priceRefOp = cacheJson[`${cryptSymbol}`].priceRefOp;

                    //   if ((cacheJson[`${cryptSymbol}`].plus == 0 //|| cacheJson[`${cryptSymbol}`].plus == 1 || cacheJson[`${cryptSymbol}`].plus == 2 //|| cacheJson[`${cryptSymbol}`].plus == 3 // || cacheJson[`${cryptSymbol}`].plus == 4

                    if ((cacheJson[`${cryptSymbol}`].plus == 0 //|| cacheJson[`${cryptSymbol}`].plus == 1 || cacheJson[`${cryptSymbol}`].plus == 2 //|| cacheJson[`${cryptSymbol}`].plus == 3 // || cacheJson[`${cryptSymbol}`].plus == 4
                    )) {

                        if (flag.charAt(4) == "V"
                            //&& (preco_atual < sma1m50p.preco && preco_atual < sma1m60p.preco)
                            //&& (preco_atual < sma5m50p.preco && preco_atual < sma5m60p.preco)
                            //&& parseFloat(objSendcalc.stoch15m.k) < parseFloat(objSendcalc.stoch15mprev.k)

                            //&& (preco_atual < sma1m10p.preco && preco_atual < sma1m20p.preco)
                            //&& preco_atual < min_anterior_1m
                            //&& sma1m5p.preco <= sma1m5prev.preco
                            //&& sma1m10p.preco <= sma1m10prev.preco
                            //&& sma1m20p.preco <= sma1m20prev.preco
                            //&& max_atual_1m < sma1m20p.margemSuperior
                            //&& max_atual_1m > sma1m20p.margemInferior
                            //&& preco_atual < sma1m20p.margemInferior


                        ) {

                            var retOpV = await openPosition("V", preco_atual, 2, cryptSymbol, timestamp);
                            if (retOpV == "OK") {

                                cacheJson[`${cryptSymbol}`].priceRefOp.momentum = 0.00;

                                if (cacheJson[`${cryptSymbol}`].plus == 0) {

                                    cacheJson[`${cryptSymbol}`].plus = 1;
                                    //salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                                }
                                /*
                                else if (cacheJson[`${cryptSymbol}`].plus == 1) {
        
                                    cacheJson[`${cryptSymbol}`].plus = 2;
                                    //salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                                }
                                else if (cacheJson[`${cryptSymbol}`].plus == 2) {
        
                                    cacheJson[`${cryptSymbol}`].plus = 3;
                                    //salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                                }
                                /*
                                else if (cacheJson[`${cryptSymbol}`].plus == 3) {
        
                                    cacheJson[`${cryptSymbol}`].plus = 4;
                                    //salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                                }
                                /*
                                else if (cacheJson[`${cryptSymbol}`].plus == 4) {
        
                                    cacheJson[`${cryptSymbol}`].plus = 5;
                                    //salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                                }
                                */
                                console.log('+1');

                                if (cacheJson[`${cryptSymbol}`] !== undefined) {

                                    salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                                }
                            }

                        } else if (flag.charAt(4) == "C"
                            ///&& (preco_atual > sma1m50p.preco && preco_atual > sma1m60p.preco)
                            //&& (preco_atual > sma5m50p.preco && preco_atual > sma5m60p.preco)
                            //&& parseFloat(objSendcalc.stoch15m.k) >= parseFloat(objSendcalc.stoch15mprev.k)

                            //&& (preco_atual > sma1m10p.preco && preco_atual > sma1m20p.preco)
                            //&& preco_atual > max_anterior_1m
                            //&& sma1m5p.preco >= sma1m5prev.preco
                            //&& sma1m10p.preco >= sma1m10prev.preco
                            //&& sma1m20p.preco >= sma1m20prev.preco
                            //&& min_atual_1m > sma1m20p.margemInferior
                            //&& min_atual_1m < sma1m20p.margemSuperior
                            //&& preco_atual > sma1m20p.margemSuperior


                        ) {

                            var retOpC = await openPosition("C", preco_atual, 2, cryptSymbol, timestamp);
                            if (retOpC == "OK") {

                                cacheJson[`${cryptSymbol}`].priceRefOp.momentum = 0.00;

                                if (cacheJson[`${cryptSymbol}`].plus == 0) {

                                    cacheJson[`${cryptSymbol}`].plus = 1;
                                    //salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                                }
                                /*
                                else if (cacheJson[`${cryptSymbol}`].plus == 1) {
        
                                    cacheJson[`${cryptSymbol}`].plus = 2;
                                    //salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                                }
                                else if (cacheJson[`${cryptSymbol}`].plus == 2) {
        
                                    cacheJson[`${cryptSymbol}`].plus = 3;
                                    //salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                                }
                                /*
                                else if (cacheJson[`${cryptSymbol}`].plus == 3) {
        
                                    cacheJson[`${cryptSymbol}`].plus = 4;
                                    //salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                                }
                                /*
                                else if (cacheJson[`${cryptSymbol}`].plus == 4) {
        
                                    cacheJson[`${cryptSymbol}`].plus = 5;
                                    //salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                                }
                                */
                                console.log('+1');

                                if (cacheJson[`${cryptSymbol}`] !== undefined) {

                                    salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                                }

                            }
                        }

                        if (cacheJson[`${cryptSymbol}`] !== undefined) {

                            salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                        }

                    }
                }

                if (cacheJson[`${cryptSymbol}`].positMaxPercent == undefined) {

                    cacheJson[`${cryptSymbol}`].positMaxPercent = parseFloat(percent);
                    //salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);

                }

                if (cacheJson[`${cryptSymbol}`].positMinPercent == undefined) {

                    cacheJson[`${cryptSymbol}`].positMinPercent = parseFloat(percent);
                    //salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);

                }

                if (cacheJson[`${cryptSymbol}`].positLimitPercent == undefined) {

                    cacheJson[`${cryptSymbol}`].positLimitPercent = parseFloat(percent);
                    //salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);

                }




                if ((parseFloat(percent) > parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent))
                    && parseFloat(percent) > parseFloat(10)) {

                    cacheJson[`${cryptSymbol}`].priceRefOp.momentum = parseFloat(percent);
                    cacheJson[`${cryptSymbol}`].priceRefOp.momentumPrice = preco_atual;
                    cacheJson[`${cryptSymbol}`].positMaxPercent = parseFloat(percent);

                }

                if (parseFloat(percent) < parseFloat(cacheJson[`${cryptSymbol}`].positMinPercent)) {

                    cacheJson[`${cryptSymbol}`].priceRefOp.momentum = parseFloat(percent);
                    cacheJson[`${cryptSymbol}`].priceRefOp.momentumPrice = preco_atual;
                    cacheJson[`${cryptSymbol}`].positMinPercent = parseFloat(percent);

                }
                salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);

                if (parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) > parseFloat(15)
                    //&& cacheJson[`${cryptSymbol}`].plus >= 3
                ) {

                    //cacheJson[`${cryptSymbol}`].priceRefOp.stop = (parseFloat(-10.00));
                    cacheJson[`${cryptSymbol}`].positLimitPercent = parseFloat(-15.00);

                    var stopProb = (parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) - parseFloat(range));

                    //if (stopProb > cacheJson[`${cryptSymbol}`].priceRefOp.stop) {
                    if (stopProb > cacheJson[`${cryptSymbol}`].positLimitPercent) {

                        cacheJson[`${cryptSymbol}`].positLimitPercent = (parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) - parseFloat(range));
                    }


                }
                // */
                //cacheJson[`${cryptSymbol}`].priceRefOp.stop = (-30);

                //cacheJson[`${cryptSymbol}`].priceRefOp.stop = (parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.momentum) - parseFloat(range));
                salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);

            }
        }
    }


}
function inverterLista(lista) {
    const listaInvertida = [];
    for (let i = lista.length - 1; i >= 0; i--) {
        listaInvertida.push(lista[i]);
    }
    return listaInvertida;
}
async function travaDeSeguranca(cryptSymbol, simulation = false) {

    var histObj = await histFix(timestamp, cryptSymbol);
    var timelimOB = null;
    if (histObj !== undefined) {
        var Hlist = histObj.histList;

        //const timeApi = await api.time();
        timestamp = await Date.now();

        //if (timeApi !== undefined) {
        if (timestamp !== undefined) {
            //const carteira = await api.accountFutures(timeApi.data.serverTime);
            const carteira = await api.accountFutures(timestamp);
            if (
                //timeApi !== undefined
                timestamp !== undefined
                && carteira !== undefined
                && histObj !== undefined
                //&& histObj.lastHists !== undefined
                //&& histObj.lastHists.last1 !== undefined
            ) {

                var cacheSimul = undefined;
                var coin = undefined

                cacheSimul = await carregarCache('SIMUL');
                if (cacheSimul['WALLET'] !== undefined) {


                    if (simulation == true) {
                        coin = cacheSimul['WALLET'].coin;
                    } else if (simulation == false) {
                        coin = await carteira.assets.filter(b => b.asset === 'USDT'); // || b.asset === 'USDT');
                    }
                }

                var availableBalance = undefined;
                var balance = undefined;
                var unrealizedProfit = undefined;
                var marginBalance = undefined;

                if (coin !== undefined) {
                    availableBalance = coin[0].availableBalance;
                    balance = parseFloat(parseFloat(coin[0].walletBalance).toFixed(2));
                    unrealizedProfit = coin[0].unrealizedProfit;
                    marginBalance = coin[0].marginBalance;
                }
                //var oldBalance = {
                //   0.0;

                var percentEvo = [];
                var percentEvoInverse = [];

                var priceEvo = [];
                var priceEvoInverse = [];
                var Last24hOrd = [];
                var Last24hOrdInverse = [];

                const agora = new Date();
                const proximoDia = new Date(agora.getTime() + 24 * 60 * 60 * 1000); // adiciona um dia à data atual
                proximoDia.setHours(0, 0, 0, 0); // define a hora para 00h

                var range = 20.0;
                var cacheJson = [];
                cacheJson[`TRAVA`] = await carregarCache('TRAVA');

                //var flag = cacheJson[`TRAVA`].objSendcalc.flag;
                //var objSendcalc = cacheJson[`TRAVA`].objSendcalc;

                if (cacheJson[`TRAVA`] !== undefined) {

                    console.log("");

                    console.log(`<<<<-------TRAVSEG_[${cryptSymbol}]------->>>>`);

                    //console.log("Hlist:", histObj.histList);
                    console.log("");

                    //console.log("Last:", histObj.lastHists.last1[1]);
                    //console.log("LastUP:", histObj.lastHists.last1[1].lastUpdate);
                    //console.log("");

                    const now = Date.now();
                    const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
                    //var realizedPnlSum = 0;

                    var oldBalance = null;

                    if (cacheJson[`TRAVA`].oldBalance !== null
                        && cacheJson[`TRAVA`].oldBalance !== undefined
                        && cacheJson[`TRAVA`].timeValidate !== null
                        && cacheJson[`TRAVA`].timeValidate !== undefined
                    ) {
                        if (parseFloat(cacheJson[`TRAVA`].timeValidate) < parseFloat(cacheJson[`TRAVA`].oldBalance.timeLimit)
                            && cacheJson[`TRAVA`].timeValidate !== 0
                        ) {
                            //cacheJson[`TRAVA`].oldBalance.timeLimit = cacheJson[`TRAVA`].timeValidate;
                        }
                    }

                    oldBalance = cacheJson[`TRAVA`].oldBalance;

                    //zerarcontagem oldBalance
                    /*
                            oldBalance = {
                                price: balance,
                                //timeLimit: now + (1 * 60 * 1000)
                                timeLimit: now + (24 * 60 * 60 * 1000)
        
                            };
                    */
                    cacheJson[`TRAVA`].oldBalance = oldBalance;
                    await salvarCache(cacheJson[`TRAVA`], 'TRAVA');


                    if (
                        oldBalance == undefined
                        || cacheJson[`TRAVA`].oldBalance == null
                        || cacheJson[`TRAVA`].oldBalance == undefined
                        || cacheJson[`TRAVA`].oldBalance.timeLimit <= now

                    ) {

                        oldBalance = {
                            price: balance,
                            //timeLimit: now + (24 * 60 * 60 * 1000),
                            timeLimit: proximoDia.getTime(),
                            maiorPercentual: null,
                            menorPercentual: null,
                            maiorPreco: null,
                            menorPreco: null
                            //timeLimit: now + (3 * 60 * 1000)

                        };

                        cacheJson[`TRAVA`].oldBalance = oldBalance;
                        await salvarCache(cacheJson[`TRAVA`], 'TRAVA');

                        console.log("OldBalance mudado: ", oldBalance);

                    }
                    /*
                                        if (
                                            oldBalance == undefined
                                            || cacheJson[`TRAVA`].oldBalance == null
                                            || cacheJson[`TRAVA`].oldBalance == undefined
                                            || cacheJson[`TRAVA`].oldBalance.timeLimit <= now
                    
                                        ) {
                    
                                            oldBalance = {
                                                price: balance,
                                                //timeLimit: now + (24 * 60 * 60 * 1000),
                                                timeLimit: proximoDia.getTime(),
                                                maiorPercentual: null,
                                                menorPercentual: null,
                                                maiorPreco: null,
                                                menorPreco: null
                                                //timeLimit: now + (3 * 60 * 1000)
                    
                                            };
                    
                                            cacheJson[`TRAVA`].oldBalance = oldBalance;
                                            salvarCache(cacheJson[`TRAVA`], 'TRAVA');
                    
                                            console.log("OldBalance mudado: ", oldBalance);
                    
                                        }
                    */

                    for (const orderId in Hlist) {
                        const order = Hlist[orderId];
                        const lastUpdate = new Date(order.lastUpdate);

                        if (lastUpdate >= twentyFourHoursAgo) {
                            //realizedPnlSum += parseFloat(parseFloat(order.realizedPnl).toFixed(2));

                            Last24hOrd.push(order);

                            //oldBalance += parseFloat(parseFloat(order.realizedPnl).toFixed(2));

                            //percentEvo.push(oldBalance);

                            //console.log("parcialPnl:", parseFloat(parseFloat(order.realizedPnl).toFixed(2)));
                            //console.log("oldBalance:", oldBalance);


                        }
                    }

                    Last24hOrdInverse = inverterLista(Last24hOrd);

                    var percBal = parseFloat(parseFloat(balance).toFixed(2));

                    for (const orderId in Last24hOrdInverse) {
                        const order = Last24hOrdInverse[orderId];

                        var parcialPnl = parseFloat(parseFloat(order.realizedPnl).toFixed(2));
                        percBal -= parcialPnl;

                        //console.log("parcialPnl:", parcialPnl);
                        //console.log("secBalance:", percBal);

                        priceEvo.push(parseFloat(parseFloat(percBal).toFixed(2)));
                        //percentEvo.push(parcialPnl); 

                    }

                    //oldBalance = priceEvo[priceEvo.length - 1];
                    //oldBalance = maiorPreco;
                    if (oldBalance !== undefined) {

                        timelimOB = calcularTempoRestante(timestamp, oldBalance.timeLimit);

                        //console.log("oldBalanceL:", timelimOB);


                        //console.log("oldBalance:", oldBalance);

                        //console.log("oldBalanceP:", parseFloat(parseFloat(oldBalance.price)));

                    }
                    //console.log("balance:", balance);

                    priceEvoInverse = inverterLista(priceEvo);

                    priceEvoInverse.push(balance);

                    priceEvoInverse.forEach(element => {

                        //console.log("element:", element);

                        var difParc = element - oldBalance.price;
                        var percParc = parseFloat(percentage(difParc, oldBalance.price).toFixed(2));

                        percentEvo.push(percParc);
                    });
                    //}
                    //var percent24h = parseFloat(percentage(realizedPnlSum, balance).toFixed(2));
                    var percent24h = percentEvo[percentEvo.length - 1];
                    //console.log("percent24h:", percent24h);

                    cacheJson[`TRAVA`].percent24h = percent24h;
                    cacheJson[`TRAVA`].balance = balance;
                    cacheJson[`TRAVA`].timeRest = timelimOB;
                    //console.log(`cacheJson[TRAVA]: `, cacheJson[`TRAVA`]);

                    await salvarCache(cacheJson[`TRAVA`], 'TRAVA');

                    //console.log("Sum of realizedPnl within the last 24 hours:", realizedPnlSum);
                    //console.log("");

                    //console.log("Last24hOrd:", Last24hOrd);
                    //console.log("priceEvo:", priceEvo);
                    //console.log("priceEvoI:", priceEvoInverse);

                    //percentEvo.splice(-1);
                    //console.log("percentEvo:", percentEvo);

                    var maiorMarg = Math.max(...priceEvoInverse);
                    var menorMarg = Math.min(...priceEvoInverse);

                    var maiorPerc = Math.max(...percentEvo);
                    var menorPerc = Math.min(...percentEvo);

                    if (
                        cacheJson[`TRAVA`].oldBalance !== null
                        && cacheJson[`TRAVA`].oldBalance !== undefined
                        //&& cacheJson[`TRAVA`].oldBalance.timeLimit > now

                    ) {
                        if (cacheJson[`TRAVA`].oldBalance.maiorPreco == null
                            || maiorMarg > cacheJson[`TRAVA`].oldBalance.maiorPreco
                            //|| balance > maiorPreco

                        ) {
                            cacheJson[`TRAVA`].oldBalance.maiorPercentual = maiorPerc;
                            cacheJson[`TRAVA`].oldBalance.maiorPreco = maiorMarg;
                        }

                        /*
                        else {
                            maiorPerc = cacheJson[`TRAVA`].oldBalance.maiorPercentual;
                            maiorPreco = cacheJson[`TRAVA`].oldBalance.maiorPreco;
                        }
                        */

                        if (cacheJson[`TRAVA`].oldBalance.menorPreco == null
                            || menorMarg < cacheJson[`TRAVA`].oldBalance.menorPreco
                            //|| balance < menorPerc
                        ) {
                            cacheJson[`TRAVA`].oldBalance.menorPercentual = menorPerc;
                            cacheJson[`TRAVA`].oldBalance.menorPreco = menorMarg;
                        }

                        /*
                        else {
                            menorPerc = cacheJson[`TRAVA`].oldBalance.menorPercentual;
                            menorPreco = cacheJson[`TRAVA`].oldBalance.menorPreco;
                        }
                        */

                    }

                    if (parseFloat(maiorPerc) > parseFloat(20.0)) {
                        range = 20.0;
                    }
                    /*
                                        if (parseFloat(maiorPerc) > parseFloat(30.0)) {
                                            range = 10.0;
                                        }
                    */
                    var limitPerc = range;
                    if (maiorPerc > 0) {

                        limitPerc = maiorPerc - range;

                    } else {

                        limitPerc = -range;

                    }
                    /*
                    console.log('');

                    console.log("maiorMarg:", maiorMarg);
                    console.log("maiorPerc:", maiorPerc);

                    console.log('');

                    console.log("limitPerc:", limitPerc);

                    console.log('');

                    console.log("menorMarg:", menorMarg);
                    console.log("menorPerc:", menorPerc);
                    console.log('');
*/

                    if (histObj !== undefined && histObj !== null) {

                        if (histObj.histList !== undefined
                            && histObj.histList !== null
                        ) {
                            var copiaDaLista = Object.entries(histObj.histList); //.map(([chave, valor]) => ({chave, valor}));
                            //var copiaDaLista = Object.entries(histFixObj); //.map(([chave, valor]) => ({chave, valor}));
                            //var copiaComSort = Object.entries(histFixObj); //.map(([chave, valor]) => ({chave, valor}));

                            //console.log("copiaDaLista:", copiaDaLista);

                            const last1 = copiaDaLista.pop();
                            //const last2 = copiaDaLista.pop();

                            //console.log("limitPerc:", limitPerc);
                            //console.log("histObj:", histObj.histList); // [histList.length-1]);
                            //console.log("last1:", last1); // [histList.length-1]);
                            //console.log("last1[1].lastUpdate:", last1[1].lastUpdate); // [histList.length-1]);

                            //var timeValidateClose12h = histObj.lastHists.last1[1].lastUpdate + (12 * 60 * 60 * 1000) //12h
                            //var timeValidateClose = histObj.lastHists.last1[1].lastUpdate + (60 * 60 * 1000); //1h
                            //var timeValidateClose = last1[1].lastUpdate + (60 * 60 * 1000); //1h
                            //var timeValidateClose = last1[1].lastUpdate + (30 * 60 * 1000); //30m
                            //var timeValidateClose = last1[1].lastUpdate + (10 * 60 * 1000); //10m
                            //var timeValidateCloseTL = last1[1].lastUpdate + (15 * 60 * 1000); //1h

                            var timeValidateClose = Date.now() + (10 * 60 * 1000); //10m


                            //console.log("lastPNL:", parseFloat(last1[1].pnl));

                            ///var timeValidateClose = histObj.lastHists.last1[1].lastUpdate + (2 * 60 * 60 * 1000); //4h
                            ///////var timeValidateClose = histObj.lastHists.last1[1].lastUpdate + (60 * 60 * 1000); //1h

                            //console.log('proximoDia.getTime()', proximoDia.getTime());
                            //console.log(`TimeValCicl -- ${timevalCicl}`);

                            //var timeValidateClose = timestamp + (60 * 60); //60m
                            //var timeValidateClose = timestamp + (30 * 60); //30m
                            //////////////const timeval = calcularTempoRestante(timestamp, timeValidateClose);
                            //console.log(resultado);

                            ////////////////////////////////////////////////////

                            /*
                                                        if (parseFloat(last1[1].pnl) < 0.0) {
                            
                                                            cacheJson[`TRAVA`].timeValidate = timeValidateCloseTL;
                                                            const timevalCicl = calcularTempoRestante(agora.getTime(), timeValidateCloseTL);
                            
                                                            //cacheJson[`TRAVA`].timeValidate = timeValidateClose;
                            
                                                            console.log('');
                                                            console.log(`TimeVal(LOSS-TL) -- ${timevalCicl}`);
                            
                                                        }
                            */

                            if (percent24h > parseFloat(process.env.TPDIA)) {

                                cacheJson[`TRAVA`].timeValidate = proximoDia.getTime();
                                const timevalCicl = calcularTempoRestante(agora.getTime(), proximoDia.getTime());

                                //cacheJson[`TRAVA`].timeValidate = timeValidateClose;

                                console.log('');
                                console.log(`timelimOB(GAIN) -- ${timevalCicl}`);


                            } else if (percent24h < parseFloat(process.env.SLDIA)) {

                                cacheJson[`TRAVA`].timeValidate = proximoDia.getTime();
                                const timevalCicl = calcularTempoRestante(agora.getTime(), proximoDia.getTime());

                                //cacheJson[`TRAVA`].timeValidate = timeValidateClose;

                                console.log('');
                                console.log(`timelimOB(LOSS) -- ${timevalCicl}`);


                            }


                            /*else if (percent24h < -15.0) {
                                cacheJson[`TRAVA`].timeValidate = timeValidateClose;
                                const timevalCicl = calcularTempoRestante(agora.getTime(), timeValidateClose);

                                console.log('');
                                console.log(`TimeVal(LOSS-T) -- ${timevalCicl}`);

                            }*/
                            else {
                                cacheJson[`TRAVA`].timeValidate = 0;

                            }

                            //if (percentEvo[0] < limitPerc) {
                            //if (percentEvo[0] < maiorPerc) {

                            cacheJson[`TRAVA`].percent24h = percent24h;

                            await salvarCache(cacheJson[`TRAVA`], 'TRAVA');

                            //resultado = calcularTempoRestante(timestamp, cacheJson[`TRAVA`].timeValidate);

                            console.log('');
                            console.log(`<<<<-------TRAVSEG_[${cryptSymbol}]------->>>>`);
                            console.log('');

                        }
                    }
                } else {

                    cacheJson[`TRAVA`].timeValidate = null;
                    cacheJson[`TRAVA`].oldBalance = null;
                    await salvarCache(cacheJson[`TRAVA`], 'TRAVA');

                }
            }
        }
    }

}


async function calcularPrecoAlvo(side, percent, precoEntrada, cryptSymbol) {

    var alavancagem = await calcLeverage(cryptSymbol);
    console.log(`alavancagem[${cryptSymbol}]`, alavancagem);

    //var decimais = 6;
    var decimais = await calcDecimais(cryptSymbol);

    /*
     if (cryptSymbol == 'VETUSDT' || cryptSymbol == '1000SHIBUSDT') {
         decimais = 6;
 
 
     } else if (cryptSymbol == 'GALAUSDT' || cryptSymbol == 'SANDUSDT') {
         decimais = 5;
 
     } else if (cryptSymbol == 'WLDUSDT' || cryptSymbol == 'XRPUSDT' || cryptSymbol == 'ADAUSDT') {
         decimais = 4;
 
     } else if (cryptSymbol == 'UNIUSDT') {
         decimais = 3;
 
     } else if (cryptSymbol == 'BTCUSDT') {
         decimais = 1;
 
     } else {
       decimais = 4;
     }
     */
    //if (cacheJson[`${cryptSymbol}`][`${type}`] == undefined) {

    //}

    var perc = parseFloat(percent) / 100;
    if (cacheJson !== undefined) {
        //var orderId = cacheJson[`${cryptSymbol}`].objSendcalc.positions; //[0].orderId;

    }
    //console.log(`orderId[${cryptSymbol}]`, orderId);

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
            // Calcula o preço alvo quando a margem inicial atingir 150% do preço de venda
            //let margemInicialAtingida = (precoEntrada * (1 + (0.15 / alavancagem))).toFixed(2);
        } else if (side == "V" || side == "SELL") {

            precoAlvo = (precoEntrada * (1 - (perc / alavancagem))).toFixed(decimais);
            // Calcula o preço alvo quando a margem inicial atingir 150% do preço de venda
            //let margemInicialAtingida = (precoEntrada * (1 - (0.15 / alavancagem))).toFixed(2);

        }

        /*
                if (type == "SL") {
                    if (cacheJson[`${cryptSymbol}`][`${type}`] == undefined) {
        
        
        
                        /*
                        await timeout(2000);
                        var returnLoss = await api.newStopLossBuy(timestamp, orderId, stopPrice, cryptSymbol);
                        console.log('returnLoss', returnLoss);
            
                        var takePrice = await calcularPrecoAlvo(side, 80.0, parseFloat(orderPosition.entryPrice), parseFloat(orderPosition.leverage), parseFloat(orderPosition.initialMargin));
                        await timeout(2000);
                        var returnTake = await api.newTakeProfitBuy(timestamp, orderId, takePrice, cryptSymbol);
                        console.log('returnTake', returnTake);
                        *
        
                        var stopPrice = cacheJson[`${cryptSymbol}`].objSendcalc.objSendcalc.positions[0].orderId;
                        console.log(`stopPrice[${cryptSymbol}]`, stopPrice);
        
                        //var returnLoss = await api.newStopLossBuy(timestamp, orderId, stopPrice, cryptSymbol);
        
                        cacheJson[`${cryptSymbol}`][`${type}`] = precoAlvo;
                    }
        
                }*/
        // Retorna o preço alvo calculado
        return parseFloat(precoAlvo);
        /*return {
            precoAlvo: parseFloat(precoAlvo),
           // margemInicialAtingida: parseFloat(margemInicialAtingida)
        };*/
    } catch (erro) {
        // Tratamento de erro caso alguma das variáveis esteja incorreta
        console.error('Erro no cálculo:', erro.message);
        return null;
    }
}

// Testando a função
/*
let precoEntrada = parseFloat(56.876);
let alavancagem = 75;
let margemInicial = 100;
let result = calcularPrecoAlvo(precoEntrada, alavancagem, margemInicial);
if (result !== null) {
   console.log(`O preço alvo será: R$ ${result.precoAlvo}`);
   console.log(`Quando a margem inicial atingir 150%, o preço será: R$ ${result.margemInicialAtingida}`);
} else {
   console.log('Houve um erro no cálculo do preço alvo.');
}*/

/*  
async function precoMargem(posit, cryptSymbol, preco_atual) {

    const margemInicial = posit.initialMargin;
    const alavancagem = posit.leverage;
    const precoAtual = preco_atual;
    const precoAlvo = precoAtual * (1 + (0,5 / alavancagem));
    return precoAlvo;
  }
/*
function precoMargem(posit, cryptSymbol, preco_atual) {
    if (!posit || !posit.initialMargin) {
      throw new Error('Posição inválida ou margem inicial não definida');
    }
  
    const margemInicial = posit.initialMargin;
    const margemAlvo = margemInicial * 1.5; // 50% acima do valor da margem inicial
  
    if (margemAlvo <= margemInicial) {
      throw new Error('Margem alvo não pode ser menor ou igual à margem inicial');
    }
  
    try {
      const precoAtual = preco_atual;
      const percentualAlvo = (margemAlvo / margemInicial) - 1;
      const precoAlvo = precoAtual * (1 + percentualAlvo);
      return precoAlvo;
    } catch (error) {
      throw new Error(`Erro ao obter preço atual: ${error.message}`);
    }
    return null;
  }
  */


async function calcOpenPositionElite(posit, timestamp, onOff, cryptSymbol, preco_atual, positSimul, simulation = false) {
    //conectado = await verificarConexao();
    if (conectado) {
        console.log(`calcOpenPositionElite_start[${cryptSymbol}]`);

        var cacheJson = [];
        var cacheSimul = undefined;
        cacheSimul = await carregarCache('SIMUL');

        /*
          const timeApi = await api.time();
          if (timeApi !== undefined) {
            timestamp = timeApi.data.serverTime;
          }
        */
        var countx = null;

        countLivePos = Object.keys(position).filter(key => position[key][0] !== undefined).length;
        const countpcrypt = Object.keys(cryptSymbols).filter(key => cryptSymbols[key] !== null).length;

        if (countLivePos == countpcrypt) {
            countx = Object.keys(positSimul).filter(key => positSimul[key].length > 0).length;
        }
        console.log('calcOpenPositionElite/countLivePos:', countLivePos);

        var posSymb = undefined;

        if (positSimul[cryptSymbol] !== undefined) {
            posSymb = positSimul[cryptSymbol][0];
        }

        if (countLivePos !== undefined || posSymb !== undefined) {

            var stopbyprice = 0.0;

            var percentStop = parseFloat(process.env.STOPLOSS);
            var percentTake = parseFloat(process.env.TAKEPROFIT);

            var estaProximo = null;
            var priceRef = null;
            var priceRef_name = null;

            simultPos = parseInt(process.env.TRDSIMULT);
            var pontosMarg = parseInt(process.env.PMARG);  //total: 20
            var tsVariation = 0.0;

            var timeValidate = null;  //30m
            var timeValidateClose = null;

            /*
        
            if (cryptSymbol == 'ADAUSDT') {
                tsVariation = 0.0001;
            } else if (cryptSymbol == 'UNIUSDT') {
                tsVariation = 0.00002;
            } else if (cryptSymbol == 'DOGSUSDT') {
                tsVariation = 0.00002;
            } else if (cryptSymbol == 'GALAUSDT') {
                tsVariation = 0.00002;
            } else if (cryptSymbol == 'VETUSDT') {
                tsVariation = 0.00002;
            } else if (cryptSymbol == 'USTCUSDT') {
                tsVariation = 0.00002;
            } else if (cryptSymbol == 'MYROUSDT') {
                tsVariation = 0.00002;
            } else if (cryptSymbol == 'RENUSDT') {
                tsVariation = 0.00002;
            } else if (cryptSymbol == 'REZUSDT') {
                tsVariation = 0.00002;
            }
        
           */

            cacheJson[`${cryptSymbol}`] = await carregarCache(cryptSymbol);
            preco_atual = cacheJson[`${cryptSymbol}`].preco_atual;

            //cacheJson[`${cryptSymbol}`].preco_atual


            await simulatePositonController(cryptSymbol, cacheJson[`${cryptSymbol}`].preco_atual, timestamp);

            //await simulateOpenPos(cacheJson[`${cryptSymbol}`].preco_atual, cryptSymbol, 'V', pontosMarg);

            var flag = undefined;
            var objSendcalc = undefined;

            if (cacheJson[`${cryptSymbol}`].objSendcalc !== undefined) {

                flag = cacheJson[`${cryptSymbol}`].objSendcalc.flag;
                objSendcalc = cacheJson[`${cryptSymbol}`].objSendcalc;

                cacheJson[`${cryptSymbol}`].flagpos = flagpos[`${cryptSymbol}`];
            }

            //var flagLock = ;
            //var flagLock = cacheJson[`${cryptSymbol}`].flagLock;

            if (cacheJson[`${cryptSymbol}`][`${cryptSymbol}`]) {

                cacheJson[`${cryptSymbol}`][`${cryptSymbol}`] = undefined;
                salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);

            }
            //if(posit == undefined || posit == null){
            //cacheJson[`${cryptSymbol}`].objSendcalc.positions = [];
            //salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
            //}


            var histObj = await histFix(timestamp, cryptSymbol);
            if (cacheJson[`${cryptSymbol}`].objMarket !== undefined) {

                var fiboRetrac = cacheJson[`${cryptSymbol}`].objMarket.fibo;
                var fiboRetrac2 = cacheJson[`${cryptSymbol}`].objMarket.fibo2;

                var ema1m20p = cacheJson[`${cryptSymbol}`].objMarket.ema1m20p;
                var ema1m25p = cacheJson[`${cryptSymbol}`].objMarket.ema1m25p;
                var ema1m100p = cacheJson[`${cryptSymbol}`].objMarket.ema1m100p;
                var ema1m120p = cacheJson[`${cryptSymbol}`].objMarket.ema1m120p;

                var ema3m100p = cacheJson[`${cryptSymbol}`].objMarket.ema3m100p;
                var ema3m120p = cacheJson[`${cryptSymbol}`].objMarket.ema3m120p;

                var ema5m20p = cacheJson[`${cryptSymbol}`].objMarket.ema5m20p;
                var ema5m25p = cacheJson[`${cryptSymbol}`].objMarket.ema5m25p;

                var ema5m50p = cacheJson[`${cryptSymbol}`].objMarket.ema5m50p;
                var ema5m60p = cacheJson[`${cryptSymbol}`].objMarket.ema5m60p;

                var ema5m100p = cacheJson[`${cryptSymbol}`].objMarket.ema5m100p;


                var ema15m20p = cacheJson[`${cryptSymbol}`].objMarket.ema15m20p;
                var ema15m25p = cacheJson[`${cryptSymbol}`].objMarket.ema15m25p;
                var ema15m50p = cacheJson[`${cryptSymbol}`].objMarket.ema15m50p;
                var ema15m100p = cacheJson[`${cryptSymbol}`].objMarket.ema15m100p;

                var ema1h10p = cacheJson[`${cryptSymbol}`].objMarket.ema1h10p;
                var ema1h20p = cacheJson[`${cryptSymbol}`].objMarket.ema1h20p;
                var ema1h25p = cacheJson[`${cryptSymbol}`].objMarket.ema1h25p;
                var ema1h50p = cacheJson[`${cryptSymbol}`].objMarket.ema1h50p;
                var ema1h60p = cacheJson[`${cryptSymbol}`].objMarket.ema1h60p;
                var ema1h100p = cacheJson[`${cryptSymbol}`].objMarket.ema1h100p;
                var ema1h120p = cacheJson[`${cryptSymbol}`].objMarket.ema1h120p;

                //prev

                var ema1m20prev = cacheJson[`${cryptSymbol}`].objMarket.ema1m20prev;
                var ema1m25prev = cacheJson[`${cryptSymbol}`].objMarket.ema1m25prev;

                var ema5m20prev = cacheJson[`${cryptSymbol}`].objMarket.ema5m20prev;
                var ema5m25prev = cacheJson[`${cryptSymbol}`].objMarket.ema5m25prev;

                var ema1m10prev = cacheJson[`${cryptSymbol}`].objMarket.ema1m10prev;
                var ema5m100prev = cacheJson[`${cryptSymbol}`].objMarket.ema5m100prev;

                var ema15m20prev = cacheJson[`${cryptSymbol}`].objMarket.ema15m20prev;
                var ema15m25prev = cacheJson[`${cryptSymbol}`].objMarket.ema15m25prev;

                var ema1h20prev = cacheJson[`${cryptSymbol}`].objMarket.ema1h20prev;
                var ema1h25prev = cacheJson[`${cryptSymbol}`].objMarket.ema1h25prev;

                //// SMA

                var sma1m3p = cacheJson[`${cryptSymbol}`].objMarket.sma1m3p;
                var sma1m5p = cacheJson[`${cryptSymbol}`].objMarket.sma1m5p;

                var sma1m20p = cacheJson[`${cryptSymbol}`].objMarket.sma1m20p;
                var sma1m50p = cacheJson[`${cryptSymbol}`].objMarket.sma1m50p;
                var sma1m60p = cacheJson[`${cryptSymbol}`].objMarket.sma1m60p;
                var sma1m100p = cacheJson[`${cryptSymbol}`].objMarket.sma1m100p;

                var sma3m20p = cacheJson[`${cryptSymbol}`].objMarket.sma3m20p;

                var sma5m10p = cacheJson[`${cryptSymbol}`].objMarket.sma5m10p;
                var sma5m20p = cacheJson[`${cryptSymbol}`].objMarket.sma5m20p;

                var sma5m50p = cacheJson[`${cryptSymbol}`].objMarket.sma5m50p;
                var sma5m60p = cacheJson[`${cryptSymbol}`].objMarket.sma5m60p;
                var sma5m100p = cacheJson[`${cryptSymbol}`].objMarket.sma5m100p;

                var sma15m20p = cacheJson[`${cryptSymbol}`].objMarket.sma15m20p;

                var sma1h10p = cacheJson[`${cryptSymbol}`].objMarket.sma1h10p;
                var sma1h20p = cacheJson[`${cryptSymbol}`].objMarket.sma1h20p;

                var sma1m10prev = cacheJson[`${cryptSymbol}`].objMarket.sma1m10prev;
                var sma1m20prev = cacheJson[`${cryptSymbol}`].objMarket.sma1m20prev;
                var sma1m50prev = cacheJson[`${cryptSymbol}`].objMarket.sma1m50prev;
                var sma1m60prev = cacheJson[`${cryptSymbol}`].objMarket.sma1m60prev;

                var sma3m20prev = cacheJson[`${cryptSymbol}`].objMarket.sma3m20prev;

                var sma5m10prev = cacheJson[`${cryptSymbol}`].objMarket.sma5m10prev;
                var sma5m20prev = cacheJson[`${cryptSymbol}`].objMarket.sma5m20prev;
                var sma5m50prev = cacheJson[`${cryptSymbol}`].objMarket.sma5m50prev;
                var sma5m60prev = cacheJson[`${cryptSymbol}`].objMarket.sma5m60prev;
                var sma5m100prev = cacheJson[`${cryptSymbol}`].objMarket.sma5m100prev;

                var sma15m20prev = cacheJson[`${cryptSymbol}`].objMarket.sma15m20prev;

                var sma1h20prev = cacheJson[`${cryptSymbol}`].objMarket.sma1h20prev;
                var sma1h25prev = cacheJson[`${cryptSymbol}`].objMarket.sma1h25prev;
                var sma1m100prev = cacheJson[`${cryptSymbol}`].objMarket.sma1m100prev;

                var p1Sar1 = cacheJson[`${cryptSymbol}`].objMarket.p1sar1;
                var p1Sar2 = cacheJson[`${cryptSymbol}`].objMarket.p1sar2;
                var p2Sar1 = cacheJson[`${cryptSymbol}`].objMarket.p2sar1;
                var p2Sar2 = cacheJson[`${cryptSymbol}`].objMarket.p2sar2;
                var p3Sar1 = cacheJson[`${cryptSymbol}`].objMarket.p3sar1;
                var p3Sar2 = cacheJson[`${cryptSymbol}`].objMarket.p3sar2;
                var p4Sar1 = cacheJson[`${cryptSymbol}`].objMarket.p4sar1;
                var p4Sar2 = cacheJson[`${cryptSymbol}`].objMarket.p4sar2;

                var ifr3m = cacheJson[`${cryptSymbol}`].objMarket.ifr3m;
                var ifr5m = cacheJson[`${cryptSymbol}`].objMarket.ifr5m;
                var ifr15m = cacheJson[`${cryptSymbol}`].objMarket.ifr15m;

                var ifr3mprev = cacheJson[`${cryptSymbol}`].objMarket.ifr3mprev;
                var ifr5mprev = cacheJson[`${cryptSymbol}`].objMarket.ifr5mprev;
                var ifr15mprev = cacheJson[`${cryptSymbol}`].objMarket.ifr15mprev;

                var stoch1m = cacheJson[`${cryptSymbol}`].objMarket.stoch1m;
                var stoch1mprev = cacheJson[`${cryptSymbol}`].objMarket.stoch1mprev;
                var stoch3m = cacheJson[`${cryptSymbol}`].objMarket.stoch3m;
                var stoch3mprev = cacheJson[`${cryptSymbol}`].objMarket.stoch3mprev;
                var stoch5m = cacheJson[`${cryptSymbol}`].objMarket.stoch5m;
                var stoch5mprev = cacheJson[`${cryptSymbol}`].objMarket.stoch5mprev;
                var stoch15m = cacheJson[`${cryptSymbol}`].objMarket.stoch15m;
                var stoch15mprev = cacheJson[`${cryptSymbol}`].objMarket.stoch15mprev;
                var stoch30m = cacheJson[`${cryptSymbol}`].objMarket.stoch30m;
                var stoch30mprev = cacheJson[`${cryptSymbol}`].objMarket.stoch30mprev;
                var stoch1h = cacheJson[`${cryptSymbol}`].objMarket.stoch1h;
                var stoch1hprev = cacheJson[`${cryptSymbol}`].objMarket.stoch1hprev;


                var resTend4h = cacheJson[`${cryptSymbol}`].objMarket.resTend4h;
                var resTend1h = cacheJson[`${cryptSymbol}`].objMarket.resTend1h;
                var resTend15m = cacheJson[`${cryptSymbol}`].objMarket.resTend15m;


                var abertura_atual_1m = cacheJson[`${cryptSymbol}`].objMarket.abertura_atual_1m;

                var abertura_anterior_1m = cacheJson[`${cryptSymbol}`].objMarket.abertura_anterior_1m;

                var abertura_anterior2_1m = cacheJson[`${cryptSymbol}`].objMarket.abertura_anterior2_1m;


                var preco_anterior_1m = cacheJson[`${cryptSymbol}`].objMarket.preco_anterior_1m;
                var preco_anterior2_1m = cacheJson[`${cryptSymbol}`].objMarket.preco_anterior2_1m;
                var min_atual_1m = cacheJson[`${cryptSymbol}`].objMarket.min_atual_1m;
                var max_atual_1m = cacheJson[`${cryptSymbol}`].objMarket.max_atual_1m;
                var min_anterior_1m = cacheJson[`${cryptSymbol}`].objMarket.min_anterior_1m;
                var min_anterior2_1m = cacheJson[`${cryptSymbol}`].objMarket.min_anterior2_1m;
                var max_anterior_1m = cacheJson[`${cryptSymbol}`].objMarket.max_anterior_1m;
                var max_anterior2_1m = cacheJson[`${cryptSymbol}`].objMarket.max_anterior2_1m;



                var abertura_atual_3m = cacheJson[`${cryptSymbol}`].objMarket.abertura_atual_3m;

                var abertura_anterior_3m = cacheJson[`${cryptSymbol}`].objMarket.abertura_anterior_3m;

                var abertura_anterior2_3m = cacheJson[`${cryptSymbol}`].objMarket.abertura_anterior2_3m;



                var preco_anterior_3m = cacheJson[`${cryptSymbol}`].objMarket.preco_anterior_3m;
                var preco_anterior2_3m = cacheJson[`${cryptSymbol}`].objMarket.preco_anterior2_3m;
                var min_atual_3m = cacheJson[`${cryptSymbol}`].objMarket.min_atual_3m;
                var max_atual_3m = cacheJson[`${cryptSymbol}`].objMarket.max_atual_3m;
                var min_anterior_3m = cacheJson[`${cryptSymbol}`].objMarket.min_anterior_3m;
                var min_anterior2_3m = cacheJson[`${cryptSymbol}`].objMarket.min_anterior2_3m;
                var max_anterior_3m = cacheJson[`${cryptSymbol}`].objMarket.max_anterior_3m;
                var max_anterior2_3m = cacheJson[`${cryptSymbol}`].objMarket.max_anterior2_3m;

                var preco_anterior_5m = cacheJson[`${cryptSymbol}`].objMarket.preco_anterior_5m;
                var preco_anterior2_5m = cacheJson[`${cryptSymbol}`].objMarket.preco_anterior2_5m;
                var min_atual_5m = cacheJson[`${cryptSymbol}`].objMarket.min_atual_5m;
                var max_atual_5m = cacheJson[`${cryptSymbol}`].objMarket.max_atual_5m;
                var min_anterior_5m = cacheJson[`${cryptSymbol}`].objMarket.min_anterior_5m;
                var min_anterior2_5m = cacheJson[`${cryptSymbol}`].objMarket.min_anterior2_5m;
                var max_anterior_5m = cacheJson[`${cryptSymbol}`].objMarket.max_anterior_5m;
                var max_anterior2_5m = cacheJson[`${cryptSymbol}`].objMarket.max_anterior2_5m;
                var abertura_anterior_5m = cacheJson[`${cryptSymbol}`].objMarket.abertura_anterior_5m;
                var abertura_anterior2_5m = cacheJson[`${cryptSymbol}`].objMarket.abertura_anterior2_5m;

                var preco_anterior_15m = cacheJson[`${cryptSymbol}`].objMarket.preco_anterior_15m;
                var min_atual_15m = cacheJson[`${cryptSymbol}`].objMarket.min_atual_15m;
                var max_atual_15m = cacheJson[`${cryptSymbol}`].objMarket.max_atual_15m;
                var min_anterior_15m = cacheJson[`${cryptSymbol}`].objMarket.min_anterior_15m;
                var min_anterior2_15m = cacheJson[`${cryptSymbol}`].objMarket.min_anterior2_15m;
                var max_anterior_15m = cacheJson[`${cryptSymbol}`].objMarket.max_anterior_15m;
                var max_anterior2_15m = cacheJson[`${cryptSymbol}`].objMarket.max_anterior2_15m;

                var preco_anterior_30m = cacheJson[`${cryptSymbol}`].objMarket.preco_anterior_30m;
                var min_atual_30m = cacheJson[`${cryptSymbol}`].objMarket.min_atual_30m;
                var max_atual_30m = cacheJson[`${cryptSymbol}`].objMarket.max_atual_30m;
                var min_anterior_30m = cacheJson[`${cryptSymbol}`].objMarket.min_anterior_30m;
                var min_anterior2_30m = cacheJson[`${cryptSymbol}`].objMarket.min_anterior2_30m;
                var max_anterior_30m = cacheJson[`${cryptSymbol}`].objMarket.max_anterior_30m;
                var max_anterior2_30m = cacheJson[`${cryptSymbol}`].objMarket.max_anterior2_30m;

                /*
                var bb1mLast = cacheJson[`${cryptSymbol}`].objMarket.bb1mLast;
                var bb1mLast2 = cacheJson[`${cryptSymbol}`].objMarket.bb1mLast2;
            
                var bb3mLast = cacheJson[`${cryptSymbol}`].objMarket.bb3mLast;
                var bb3mLast2 = cacheJson[`${cryptSymbol}`].objMarket.bb3mLast2;
            
                var bb5mLast = cacheJson[`${cryptSymbol}`].objMarket.bb5mLast;
                var bb5mLast2 = cacheJson[`${cryptSymbol}`].objMarket.bb5mLast2;
            
                var bb15mLast = cacheJson[`${cryptSymbol}`].objMarket.bb15mLast;
                var bb15mLast2 = cacheJson[`${cryptSymbol}`].objMarket.bb15mLast2;
                */

                //var bb1hLast = cacheJson[`${cryptSymbol}`].objMarket.bb1hLast;
                //var bb1hLast2 = cacheJson[`${cryptSymbol}`].objMarket.bb1hLast2;

                //var macd3m = cacheJson[`${cryptSymbol}`].objMarket.macd3m;
                //var macd15m = cacheJson[`${cryptSymbol}`].objMarket.macd15m;
                //var pChann = cacheJson[`${cryptSymbol}`].objMarket.priceChannel;
            }
            var bb1mUpProx = null;
            var bb1mLowProx = null;

            var bb3mUpProx = null;
            var bb3mLowProx = null;

            var bb5mUpProx = null;
            var bb5mLowProx = null;

            var bb15mUpProx = null;
            var bb15mLowProx = null;

            var bb30mUpProx = null;
            var bb30mLowProx = null;

            var bb1hUpProx = null;
            var bb1hLowProx = null;

            //var sma5m60prev = cacheJson[`${cryptSymbol}`].objMarket.sma5m60prev;

            //console.log(`cacheJson[${cryptSymbol}]`, cacheJson[`${cryptSymbol}`]);

            //console.log(`bb1mLast[${cryptSymbol}]:`, bb1mLast);
            //console.log(`bb1mLast2[${cryptSymbol}]:`, bb1mLast2);

            //console.log(`bb3mLast[${cryptSymbol}]:`, bb3mLast);
            //console.log(`bb3mLast2[${cryptSymbol}]:`, bb3mLast2);

            //console.log(`bb5mLast[${cryptSymbol}]:`, bb5mLast);
            //console.log(`bb5mLast2[${cryptSymbol}]:`, bb5mLast2);

            //console.log(`bb15mLast[${cryptSymbol}]:`, bb15mLast);
            //console.log(`bb15mLast2[${cryptSymbol}]:`, bb15mLast2);

            //console.log(`bb1hLast[${cryptSymbol}]:`, bb1hLast);
            //console.log(`bb1hLast2[${cryptSymbol}]:`, bb1hLast2);

            //console.log(`Macd3m[${cryptSymbol}]:`, macd3m);
            //console.log(`Macd15m[${cryptSymbol}]:`, macd15m);
            //console.log(`pChann[${cryptSymbol}]:`, pChann);

            //var MacdProx = estaProximoDaLinha(cryptSymbol, macd.last.MACD, preco_atual);
            //console.log(`macdLast[${cryptSymbol}]:`, macd.last.MACD);
            //console.log(`macdLast2[${cryptSymbol}]:`, macd.last2.MACD);
            /*
                if (bb1mLast !== undefined && bb1mLast !== null) {
                    bb1mUpProx = estaProximoDaLinha(cryptSymbol, bb1mLast.upper, preco_atual);
                    console.log(`bb1mUpProx[${cryptSymbol}]:`, bb1mUpProx);
            
                    bb1mLowProx = estaProximoDaLinha(cryptSymbol, bb1mLast.lower, preco_atual);
                    console.log(`bb1mLowProx[${cryptSymbol}]:`, bb1mLowProx);
            
                    bb1hUpProx = estaProximoDaLinha(cryptSymbol, bb1hLast.upper, preco_atual);
                    console.log(`bb1mUpProx[${cryptSymbol}]:`, bb1mUpProx);
            
                    bb1hLowProx = estaProximoDaLinha(cryptSymbol, bb1hLast.lower, preco_atual);
                    console.log(`bb1mLowProx[${cryptSymbol}]:`, bb1mLowProx);
            
            
                }
            */
            //var pcUpProx = estaProximoDaLinha(cryptSymbol, pChann.upperLast, preco_atual);
            //console.log(`pcUpProx[${cryptSymbol}]:`, pcUpProx);

            //var pclowProx = estaProximoDaLinha(cryptSymbol, pChann.downLast, preco_atual);
            //console.log(`pclowProx[${cryptSymbol}]:`, pclowProx);

            //console.log(`priceChannel/upperChannel0[${cryptSymbol}]`, resultpc.upperChannel[resultpc.upperChannel.length-1]); 
            //console.log(`priceChannel/upperChannel1[${cryptSymbol}]`, resultpc.upperChannel[resultpc.upperChannel.length-2]); 
            //console.log(`priceChannel/lowerChannel0[${cryptSymbol}]`, resultpc.lowerChannel[resultpc.lowerChannel.length-1]); 
            //console.log(`priceChannel/lowerChannel1[${cryptSymbol}]`, resultpc.lowerChannel[resultpc.lowerChannel.length-2]); 

            if (cacheJson[`${cryptSymbol}`].objMarket !== undefined
                && cacheJson[`${cryptSymbol}`].objMarket !== null
                //&& sma1m100p !== undefined

                //&& ema1h120p !== undefined

                && sma1m5p !== undefined

                && resTend15m !== undefined

                && resTend1h.lta !== undefined

                && ema5m60p !== undefined

                /*
                && sma1m100p !== null
                && sma1h10p !== null
                && sma1h10prev !== null
        
                && ema1h10p !== null
                && ema1h10prev !== null
        
                && sma5m100p !== null
                && sma5m100prev !== null
        
                && sma1h100p !== null
                && ema1h25prev !== null
        
                && ema3m120p !== undefined
        
                && ema1m120p !== undefined
                && ema1h120p !== undefined
        
                // && sma15m20p !== undefined
                /*
                        && sma1m20p !== undefined
                        && sma3m20p !== undefined
                        && sma15m20p !== undefined
                        && sma1h20p !== undefined
                        && sma1m20p !== null
                        && sma1m50p !== undefined
                        && sma1m60p !== undefined
                        && sma5m50p !== undefined
                        && sma5m60p !== undefined
                        && sma1h20p !== undefined
                        && sma1h20p !== null
                
                        && sma1m50prev !== undefined
                        && sma1m60prev !== undefined
                        && sma5m50prev !== undefined
                        && sma5m60prev !== undefined
                
                        && stoch5m !== undefined
                        && stoch5mprev !== undefined
                        && stoch30m !== undefined
                
                        && bb1mUpProx !== undefined
                        && bb1mUpProx !== null
                
                        && macd3m !== undefined
                        && macd3m !== null
                        */
            ) {
                //flagLock = cacheJson[`${cryptSymbol}`].flagLock;

                //travaDeSeguranca(cryptSymbol, simulation);

                if (histObj !== undefined) {
                    //console.log(`histObj.histListBySymbol${cryptSymbol}`, histObj.lastHists);
                }

                if (histObj !== null
                    && histObj !== undefined
                ) {
                    if (histObj.lastHist !== null
                        && histObj.lastHist !== undefined
                        && histObj.lastHists !== undefined
                    ) {
                        /*
                                        if (histObj.lastHists.last9 !== undefined
                                            && histObj.lastHists.last9[1] !== undefined
                                        ) {
                        
                                            var percentHist = percentage(histObj.lastHists.last9[1].realizedPnl, histObj.lastHists.last9[1].isolatedMargin).toFixed(2);
                        
                                            if (parseFloat(percentHist) > parseFloat(30.00)) {
                                                pontos = 5;
                        
                                            }
                                        }
                        
                                        if (histObj.lastHists.last8 !== undefined
                                            && histObj.lastHists.last8[1] !== undefined
                                        ) {
                        
                                            var percentHist = percentage(histObj.lastHists.last8[1].realizedPnl, histObj.lastHists.last8[1].isolatedMargin).toFixed(2);
                        
                                            if (parseFloat(percentHist) > parseFloat(30.00)) {
                                                pontos = 5;
                        
                                            }
                                        }
                        
                        
                                        if (histObj.lastHists.last7 !== undefined
                                            && histObj.lastHists.last7[1] !== undefined
                                        ) {
                        
                                            var percentHist = percentage(histObj.lastHists.last7[1].realizedPnl, histObj.lastHists.last7[1].isolatedMargin).toFixed(2);
                        
                                            if (parseFloat(percentHist) > parseFloat(30.00)) {
                                                pontos = 4;
                        
                                            }
                                        }
                        
                        
                                        if (histObj.lastHists.last6 !== undefined
                                            && histObj.lastHists.last6[1] !== undefined
                                        ) {
                        
                                            var percentHist = percentage(histObj.lastHists.last6[1].realizedPnl, histObj.lastHists.last6[1].isolatedMargin).toFixed(2);
                        
                                            if (parseFloat(percentHist) > parseFloat(30.00)) {
                                                pontos = 4;
                        
                                            }
                                        }
                        
                                        if (histObj.lastHists.last5 !== undefined
                                            && histObj.lastHists.last5[1] !== undefined
                                        ) {
                        
                                            var percentHist = percentage(histObj.lastHists.last5[1].realizedPnl, histObj.lastHists.last5[1].isolatedMargin).toFixed(2);
                        
                                            if (parseFloat(percentHist) > parseFloat(30.00)) {
                                                pontos = 3;
                        
                                            }
                                        }
                        
                                        if (histObj.lastHists.last4 !== undefined
                                            && histObj.lastHists.last4[1] !== undefined
                                        ) {
                        
                                            var percentHist = percentage(histObj.lastHists.last4[1].realizedPnl, histObj.lastHists.last4[1].isolatedMargin).toFixed(2);
                        
                                            if (parseFloat(percentHist) > parseFloat(30.00)) {
                                                pontos = 3;
                        
                                            }
                                        }
                        
                                        if (histObj.lastHists.last3 !== undefined
                                            && histObj.lastHists.last3[1] !== undefined
                                        ) {
                        
                                            var percentHist = percentage(histObj.lastHists.last3[1].realizedPnl, histObj.lastHists.last3[1].isolatedMargin).toFixed(2);
                        
                                            if (parseFloat(percentHist) > parseFloat(30.00)) {
                                                pontos = 2;
                        
                                            }
                                        }
                        
                                        if (histObj.lastHists.last2 !== undefined
                                            && histObj.lastHists.last2[1] !== undefined
                                        ) {
                        
                                            var percentHist = percentage(histObj.lastHists.last2[1].realizedPnl, histObj.lastHists.last2[1].isolatedMargin).toFixed(2);
                        
                                            if (parseFloat(percentHist) > parseFloat(30.00)) {
                                                pontos = 2;
                        
                                            }
                                        }
                        
                                        if (histObj.lastHists.last1 !== undefined
                                            && histObj.lastHists.last1[1] !== undefined
                                        ) {
                        
                                            var percentHist = percentage(histObj.lastHists.last1[1].realizedPnl, histObj.lastHists.last1[1].isolatedMargin).toFixed(2);
                        
                                            if (parseFloat(percentHist) > parseFloat(30.00)) {
                                                pontos = 2;
                        
                                            }
                                        }
                        */

                    }


                    // Martin Galle atravez do historico
                    if (histObj.lastHist !== null
                        && histObj.lastHist !== undefined
                        && histObj.lastHists !== undefined
                        && histObj.lastHists.last1 !== undefined
                        && histObj.lastHists.last2 !== undefined
                        && histObj.lastHists.last1[1] !== undefined
                        && histObj.lastHists.last2[1] !== undefined

                    ) {
                        //console.log(`<<<<<<<<<<<<<<<<< histFixObjPnl: ${JSON.stringify(histObj)}`);

                        var percentHist = percentage(histObj.lastHists.last1[1].realizedPnl, histObj.lastHists.last1[1].isolatedMargin).toFixed(2);
                        var percentHist2 = percentage(histObj.lastHists.last2[1].realizedPnl, histObj.lastHists.last2[1].isolatedMargin).toFixed(2);

                        if (histObj.lastHists.last2 !== undefined) {

                            if (parseFloat(percentHist) > parseFloat(40.00)) {
                                //pontos = 1;

                            }
                            if (parseFloat(percentHist2) > parseFloat(40.00)) {
                                //pontos = 3;

                            }

                            /*
                            else if (parseFloat(percentHist1) < parseFloat(10.00)) {
                                //pontos = 5;
                            }
                
                            if (parseFloat(percentHist1) < parseFloat(11.00)) {
                                //pontos = 3;
                                if (parseFloat(percentHist2) < parseFloat(11.00)) {
                                    //pontos = 5;
                
                                }
                            }
                            */


                        }

                        if (histObj.lastHists.last2 !== undefined) {
                            if (parseFloat(histObj.lastHists.last1[1].realizedPnl) > 0.00
                                && parseFloat(histObj.lastHists.last2[1].realizedPnl) < 0.00) {
                                //pontos = 3;

                            }


                        }
                    }
                }
                //console.log("sma1m50p", sma1m50p);
                //if (ema1m50p !== null) {

                /*
                    if ( //ema5m20p.estaProximo || sma5m20p.estaProximo 
                        //ema5m10p.estaProximo || sma5m10p.estaProximo
                        ema1m50p.estaProximo || sma1m60p.estaProximo
                        //ema1m10p.estaProximo || sma1m10p.estaProximo
                        //ltb4h.estaProximo || lta4h.estaProximo || ltb4h2.estaProximo || lta4h2.estaProximo
                        //|| sma1m10p.estaProximo /*|| sma1m20p.estaProximo || sma1m50p.estaProximo || sma1m100p.estaProximo || sma1m200p.estaProximo
                        // sma5m10p.estaProximo //|| sma5m20p.estaProximo || sma5m50p.estaProximo || sma5m100p.estaProximo || sma5m200p.estaProximo
                        //|| sma15m10p.estaProximo || sma15m20p.estaProximo || sma15m50p.estaProximo || sma15m100p.estaProximo || sma15m200p.estaProximo
                        //|| sma30m10p.estaProximo || sma30m20p.estaProximo || sma30m50p.estaProximo || sma30m100p.estaProximo || sma30m200p.estaProximo
                        //|| sma1h10p.estaProximo || sma1h20p.estaProximo || sma1h50p.estaProximo || sma1h100p.estaProximo || sma1h200p.estaProximo
                        //|| sma4h10p.estaProximo || sma4h20p.estaProximo || sma4h50p.estaProximo || sma4h100p.estaProximo || sma4h200p.estaProximo
                        //|| fibo0.estaProximo || fibo236.estaProximo || fibo382.estaProximo || fibo50.estaProximo || fibo618.estaProximo || fibo786.estaProximo || fibo1.estaProximo 
                        //|| fibo1618.estaProximo || fibo2618.estaProximo ||fibo3618.estaProximo ||fibo4236.estaProximo 
                        //|| fibo_d1618.estaProximo || fibo_d3618.estaProximo || fibo_d3618.estaProximo || fibo_d4236.estaProximo 
                        //|| open1d_0.estaProximo || open1d_1.estaProximo || close1d_1.estaProximo || max1d_1.estaProximo || min1d_1.estaProximo || close1d_2.estaProximo // || max1d_2.estaProximo || min1d_2.estaProximo 
                    ) {
                        estaProximo = true;
                    }
            
            
                    if (fibo0.estaProximo || fibo236.estaProximo || fibo382.estaProximo || fibo50.estaProximo || fibo618.estaProximo || fibo786.estaProximo || fibo1.estaProximo
                        || fibo1618.estaProximo || fibo2618.estaProximo || fibo3618.estaProximo || fibo4236.estaProximo
                        || fibo_d1618.estaProximo || fibo_d3618.estaProximo || fibo_d3618.estaProximo || fibo_d4236.estaProximo
                    ) {
            
                        if (fibo0.estaProximo) {
                            priceRef = fibo0.preco;
                            priceRef_name = "fibo0";
            
                        }
                        else if (fibo236.estaProximo) {
                            priceRef = fibo236.preco;
                            priceRef_name = "fibo236";
            
                        }
            
                        else if (fibo1.estaProximo) {
                            priceRef = fibo1.preco;
                            priceRef_name = "fibo1";
            
                        }
                        else if (fibo786.estaProximo) {
                            priceRef = fibo786.preco;
                            priceRef_name = "fibo786";
            
                        }
            
                        else if (fibo618.estaProximo) {
                            priceRef = fibo618.preco;
                            priceRef_name = "fibo618";
            
                        }
                        else if (fibo50.estaProximo) {
                            priceRef = fibo50.preco;
                            priceRef_name = "fibo50";
            
                        }
                        else if (fibo382.estaProximo) {
                            priceRef = fibo382.preco;
                            priceRef_name = "fibo382";
            
                        }
            
            
                        else if (fibo1618.estaProximo) {
                            priceRef = fibo1618.preco;
                            priceRef_name = "fibo1618";
            
                        }
                        else if (fibo2618.estaProximo) {
                            priceRef = fibo2618.preco;
                            priceRef_name = "fibo2618";
            
                        }
                        else if (fibo3618.estaProximo) {
                            priceRef = fibo3618.preco;
                            priceRef_name = "fibo3618";
            
                        }
                        else if (fibo4236.estaProximo) {
                            priceRef = fibo4236.preco;
                            priceRef_name = "fibo4236";
            
                        }
                        else if (fibo_d1618.estaProximo) {
                            priceRef = fibo_d1618.preco;
                            priceRef_name = "fibo_d1618";
            
                        }
                        else if (fibo_d3618.estaProximo) {
                            priceRef = fibo_d3618.preco;
                            priceRef_name = "fibo_d3618";
            
                        }
                        else if (fibo_d3618.estaProximo) {
                            priceRef = fibo_d3618.preco;
                            priceRef_name = "fibo_d3618";
            
                        }
                        else if (fibo_d4236.estaProximo) {
                            priceRef = fibo_d4236.preco;
                            priceRef_name = "fibo_d4236";
            
                        }
            
            
                    }
            
                    else if (lta4h.estaProximo || ltb4h.estaProximo || lta4h2.estaProximo || ltb4h2.estaProximo) {
            
                        if (ltb4h.estaProximo) {
                            priceRef = ltb4h.preco;
                            priceRef_name = "ltb4h";
            
                        }
                        else if (lta4h.estaProximo) {
                            priceRef = lta4h.preco;
                            priceRef_name = "lta4h";
            
                        }
                        else if (lta4h2.estaProximo) {
                            priceRef = lta4h2.preco;
                            priceRef_name = "lta4h2";
            
                        }
                        else if (ltb4h2.estaProximo) {
                            priceRef = ltb4h2.preco;
                            priceRef_name = "ltb4h2";
            
                        }
            
                    }
            
                    if (sma1m10p.estaProximo || sma5m10p.estaProximo || sma5m20p.estaProximo || sma5m50p.estaProximo || sma5m100p.estaProximo || sma5m200p.estaProximo) {
            
                        if (sma1m10p.estaProximo) {
                            priceRef = sma1m10p.preco;
                            priceRef_name = "sma1m10p";
            
                        }
            
                        if (sma5m200p.estaProximo) {
                            priceRef = sma5m200p.preco;
                            priceRef_name = "sma5m200p";
            
                        }
            
                        else if (sma5m100p.estaProximo) {
                            priceRef = sma5m100p.preco;
                            priceRef_name = "sma5m100p";
            
                        }
                        else if (sma5m50p.estaProximo) {
                            priceRef = sma5m50p.preco;
                            priceRef_name = "sma5m50p";
            
                        }
                        else if (sma5m20p.estaProximo) {
                            priceRef = sma5m20p.preco;
                            priceRef_name = "sma5m20p";
            
                        }
                        else if (sma5m10p.estaProximo) {
                            priceRef = sma5m10p.preco;
                            priceRef_name = "sma5m10p";
            
                        }
            
            
                    }
            
                    if (sma15m10p.estaProximo || sma15m20p.estaProximo || sma15m50p.estaProximo || sma15m100p.estaProximo || sma15m200p.estaProximo) {
            
                        if (sma15m200p.estaProximo) {
                            priceRef = sma15m200p.preco;
                            priceRef_name = "sma15m200p";
            
                        }
                        else if (sma15m100p.estaProximo) {
                            priceRef = sma15m100p.preco;
                            priceRef_name = "sma15m100p";
            
                        }
                        else if (sma15m50p.estaProximo) {
                            priceRef = sma15m50p.preco;
                            priceRef_name = "sma15m50p";
            
                        }
                        else if (sma15m20p.estaProximo) {
                            priceRef = sma15m20p.preco;
                            priceRef_name = "sma15m20p";
            
                        }
                        else if (sma15m10p.estaProximo) {
                            priceRef = sma15m10p.preco;
                            priceRef_name = "sma15m10p";
            
                        }
            
            
                    }
            
                    if (sma30m10p.estaProximo || sma30m20p.estaProximo || sma30m50p.estaProximo || sma30m100p.estaProximo || sma30m200p.estaProximo) {
            
                        if (sma30m200p.estaProximo) {
                            priceRef = sma30m200p.preco;
                            priceRef_name = "sma30m200p";
            
                        }
                        else if (sma30m100p.estaProximo) {
                            priceRef = sma30m100p.preco;
                            priceRef_name = "sma30m100p";
            
                        }
                        else if (sma30m50p.estaProximo) {
                            priceRef = sma30m50p.preco;
                            priceRef_name = "sma30m50p";
            
                        }
                        else if (sma30m20p.estaProximo) {
                            priceRef = sma30m20p.preco;
                            priceRef_name = "sma30m20p";
            
                        }
                        else if (sma30m10p.estaProximo) {
                            priceRef = sma30m10p.preco;
                            priceRef_name = "sma30m10p";
            
                        }
            
            
                    }
            
                    if (sma1h10p.estaProximo || sma1h20p.estaProximo || sma1h50p.estaProximo || sma1h100p.estaProximo || sma1h200p.estaProximo) {
            
                        if (sma1h200p.estaProximo) {
                            priceRef = sma1h200p.preco;
                            priceRef_name = "sma1h200p";
            
                        }
                        else if (sma1h100p.estaProximo) {
                            priceRef = sma1h100p.preco;
                            priceRef_name = "sma1h100p";
            
                        }
                        else if (sma1h50p.estaProximo) {
                            priceRef = sma1h50p.preco;
                            priceRef_name = "sma1h50p";
            
                        }
                        else if (sma1h20p.estaProximo) {
                            priceRef = sma1h20p.preco;
                            priceRef_name = "sma1h20p";
            
                        }
                        else if (sma1h10p.estaProximo) {
                            priceRef = sma1h10p.preco;
                            priceRef_name = "sma1h10p";
            
                        }
            
            
                    }
            
                    if (sma4h10p.estaProximo || sma4h20p.estaProximo || sma4h50p.estaProximo || sma4h100p.estaProximo || sma4h200p.estaProximo) {
            
                        if (sma4h200p.estaProximo) {
                            priceRef = sma4h200p.preco;
                            priceRef_name = "sma4h200p";
            
                        }
                        else if (sma4h100p.estaProximo) {
                            priceRef = sma4h100p.preco;
                            priceRef_name = "sma4h100p";
            
                        }
                        else if (sma4h50p.estaProximo) {
                            priceRef = sma4h50p.preco;
                            priceRef_name = "sma4h50p";
            
                        }
                        else if (sma4h20p.estaProximo) {
                            priceRef = sma4h20p.preco;
                            priceRef_name = "sma4h20p";
            
                        }
                        else if (sma4h10p.estaProximo) {
                            priceRef = sma4h10p.preco;
                            priceRef_name = "sma4h10p";
            
                        }
            
            
                    }
            
                */

                //if (posit !== undefined) {

                //console.log(`posit: ${JSON.stringify(posit)}`);
                //var timeValidate = posit.updateTime + 0;  //0m
                //var timeValidate = posit.updateTime + 10000;  //10s
                //var timeValidate = posit.updateTime + 20000;  //20s
                //timeValidate = posit.updateTime + 30000;  //30s

                //cacheJson[`${cryptSymbol}`] = await carregarCache(cryptSymbol);

                timeValidate = cacheJson[`${cryptSymbol}`].timeValidate;
                if (histObj != undefined
                    && histObj.lastHist != null
                    && histObj.lastHist != undefined
                    && histObj.lastHist.last1 != undefined) {

                    timeValidateClose = histObj.lastHists.last1[1].lastUpdate + 1000;  //1s
                }

                //var timeValidate = posit.updateTime + 60000;  //1m
                //var timeValidate = posit.updateTime + 90000;  //1,5m
                //var timeValidate = posit.updateTime + 120000;  //2m
                //var timeValidate = posit.updateTime + 180000;  //3m
                //var timeValidate = posit.updateTime + 300000;  //5m
                //var timeValidate = posit.updateTime + 900000;  //15m
                //var timeValidate = posit.updateTime + 1800000;  //30m
                //var timeValidate = posit.updateTime + 3600000;  //1h
                //var timeValidate = posit.updateTime + 28800000; //4h 
                //}
                console.log('');

                //console.log(`ZIGZAG_DIR_FIBO: `, fiboRetrac);
                //console.log('');

                var fibo_0 = estaProximoDaLinha(cryptSymbol, fiboRetrac.retr0, preco_atual);
                var fibo_236 = estaProximoDaLinha(cryptSymbol, fiboRetrac.retr0236, preco_atual);
                var fibo_382 = estaProximoDaLinha(cryptSymbol, fiboRetrac.retr0382, preco_atual);
                var fibo_50 = estaProximoDaLinha(cryptSymbol, fiboRetrac.retr05, preco_atual);
                var fibo_618 = estaProximoDaLinha(cryptSymbol, fiboRetrac.retr0618, preco_atual);
                var fibo_786 = estaProximoDaLinha(cryptSymbol, fiboRetrac.retr0786, preco_atual);
                var fibo_1 = estaProximoDaLinha(cryptSymbol, fiboRetrac.retr1, preco_atual);
                var fibo_1618 = estaProximoDaLinha(cryptSymbol, fiboRetrac.retr1618, preco_atual);
                var fibo_2618 = estaProximoDaLinha(cryptSymbol, fiboRetrac.retr2618, preco_atual);
                var fibo_3618 = estaProximoDaLinha(cryptSymbol, fiboRetrac.retr3618, preco_atual);
                var fibo_4236 = estaProximoDaLinha(cryptSymbol, fiboRetrac.retr4236, preco_atual);
                var fibo_d1618 = estaProximoDaLinha(cryptSymbol, fiboRetrac.retr0618Neg, preco_atual);
                var fibo_d3618 = estaProximoDaLinha(cryptSymbol, fiboRetrac.retr1618Neg, preco_atual);
                var fibo_d3618 = estaProximoDaLinha(cryptSymbol, fiboRetrac.retr2618Neg, preco_atual);
                var fibo_d4236 = estaProximoDaLinha(cryptSymbol, fiboRetrac.retr3236Neg, preco_atual);


                var fibo2_0 = estaProximoDaLinha(cryptSymbol, fiboRetrac2.retr0, preco_atual);
                var fibo2_236 = estaProximoDaLinha(cryptSymbol, fiboRetrac2.retr0236, preco_atual);
                var fibo2_382 = estaProximoDaLinha(cryptSymbol, fiboRetrac2.retr0382, preco_atual);
                var fibo2_50 = estaProximoDaLinha(cryptSymbol, fiboRetrac2.retr05, preco_atual);
                var fibo2_618 = estaProximoDaLinha(cryptSymbol, fiboRetrac2.retr0618, preco_atual);
                var fibo2_786 = estaProximoDaLinha(cryptSymbol, fiboRetrac2.retr0786, preco_atual);
                var fibo2_1 = estaProximoDaLinha(cryptSymbol, fiboRetrac2.retr1, preco_atual);
                var fibo2_1618 = estaProximoDaLinha(cryptSymbol, fiboRetrac2.retr1618, preco_atual);
                var fibo2_2618 = estaProximoDaLinha(cryptSymbol, fiboRetrac2.retr2618, preco_atual);
                var fibo2_3618 = estaProximoDaLinha(cryptSymbol, fiboRetrac2.retr3618, preco_atual);
                var fibo2_4236 = estaProximoDaLinha(cryptSymbol, fiboRetrac2.retr4236, preco_atual);
                var fibo2_d1618 = estaProximoDaLinha(cryptSymbol, fiboRetrac2.retr0618Neg, preco_atual);
                var fibo2_d3618 = estaProximoDaLinha(cryptSymbol, fiboRetrac2.retr1618Neg, preco_atual);
                var fibo2_d3618 = estaProximoDaLinha(cryptSymbol, fiboRetrac2.retr2618Neg, preco_atual);
                var fibo2_d4236 = estaProximoDaLinha(cryptSymbol, fiboRetrac2.retr3236Neg, preco_atual);


                /*
                    console.log(`ZIGZAG_DIR: `, zigzag.dir);
                    //console.log(`ZIGZAG_DIR_OB: `, zigzag.dir);
                    //zigzag.dir
                    
                    console.log('');
                    console.log(`fibo-4.236 (${fibo_d4236.preco})`, fibo_d4236.estaProximo);
                    console.log(`fibo-3.618 (${fibo_d3618.preco})`, fibo_d3618.estaProximo);
                    console.log(`fibo-2.618 (${fibo_d3618.preco})`, fibo_d3618.estaProximo);
                    console.log(`fibo-1.618 (${fibo_d1618.preco})`, fibo_d1618.estaProximo);
                    console.log('-');
                    console.log(`fibo0 (${fibo0.preco})`, fibo0.estaProximo);
                    console.log(`fibo236 (${fibo236.preco})`, fibo236.estaProximo);
                    console.log(`fibo382 (${fibo382.preco})`, fibo382.estaProximo);
                    //console.log(`fibo50 (${fibo50.preco})`, fibo50.estaProximo);
                    console.log(`fibo618 (${fibo618.preco})`, fibo618.estaProximo);
                    console.log(`fibo786 (${fibo786.preco})`, fibo786.estaProximo);
                    console.log(`fibo1 (${fibo1.preco})`, fibo1.estaProximo);
                    console.log('-');
                    console.log(`fibo1.618 (${fibo1618.preco})`, fibo1618.estaProximo);
                    console.log(`fibo2.618 (${fibo2618.preco})`, fibo2618.estaProximo);
                    console.log(`fibo3.618 (${fibo3618.preco})`, fibo3618.estaProximo);
                    console.log(`fibo4.236 (${fibo4236.preco})`, fibo4236.estaProximo);
                    //console.log('');
                    console.log('');
                    console.log(`fibo1 (${fibo1.preco})`, fibo1.estaProximo, fibo1.margemSuperior, fibo1.margemInferior );
                    console.log('');
                
                    
                    if ( parseFloat(ema) > parseFloat(sma)){
                        console.log(`ema`, ema);
                        console.log(`sma`, sma);
                    } else{
                        console.log(`sma`, sma);
                        console.log(`ema`, ema);
                
                    }
                    
                    console.log('');
                
                    console.log(`lta4h (${lta4h.preco})`, lta4h.estaProximo);
                    console.log(`ltb4h (${ltb4h.preco})`, ltb4h.estaProximo);
                    console.log(`lta4h2 (${lta4h2.preco})`, lta4h2.estaProximo);
                    console.log(`ltb4h2 (${ltb4h2.preco})`, ltb4h2.estaProximo);
                
                    console.log('');
                */
                //console.log(`sma1m10p (${sma1m10p.preco})`, sma1m10p.estaProximo);
                //console.log(`sma5m10p (${sma5m10p.preco})`, sma5m10p.estaProximo);

                //cacheJson[`${cryptSymbol}`] = await carregarCache(cryptSymbol);

                console.log('');

                //var proxPriceRef = estaProximoDaLinha(cryptSymbol, cacheJson[`${cryptSymbol}`].ema1m5p.preco, preco_atual);
                var proxPriceRef2 = estaProximoDaLinha(cryptSymbol, sma1m50p.preco, preco_atual);
                var proxPriceRef3 = estaProximoDaLinha(cryptSymbol, sma1m60p.preco, preco_atual);
                var proxPriceRef4 = estaProximoDaLinha(cryptSymbol, sma5m50p.preco, preco_atual);
                var proxPriceRef5 = estaProximoDaLinha(cryptSymbol, sma5m60p.preco, preco_atual);
                //console.log(`prox_ema1m5p`, proxPriceRef);
                if (proxPriceRef2.estaProximo == true)
                    //console.log(`prox_sma1m50p[${cryptSymbol}]`, proxPriceRef2);
                    if (proxPriceRef3.estaProximo == true)
                        //console.log(`prox_sma1m60p[${cryptSymbol}]`, proxPriceRef3);
                        if (proxPriceRef4.estaProximo == true)
                            //console.log(`prox_sma5m50p[${cryptSymbol}]`, proxPriceRef4);
                            if (proxPriceRef5.estaProximo == true)
                                //console.log(`prox_sma5m60p[${cryptSymbol}]`, proxPriceRef5);
                                console.log('');

                console.log(`Preco_atual: [${cryptSymbol}]`, preco_atual);

                //console.log('marketData1m: ', marketData1m.close[marketData1m.close.length - 1]);
                console.log('');

                //console.log(`proxPriceRef`, proxPriceRef);
                //console.log(`priceRefOp`, priceRefOp);
                //console.log(`cacheJson[${cryptSymbol}].priceRefOp`, cacheJson[`${cryptSymbol}`].priceRefOp);
                console.log(`flagLock[${cryptSymbol}]`, flagLock);
                //console.log(`flag`, flag);
                //console.log(`cacheJson[`${cryptSymbol}`].flagpos`, cacheJson[`${cryptSymbol}`].flagpos[`${cryptSymbol}`]);
                //console.log(`cacheJson[`${cryptSymbol}`].flagLock`, cacheJson[`${cryptSymbol}`].flagLock[`${cryptSymbol}`]);



                /*
            
                console.log(`preco_atual: ${preco_atual}`);
                console.log(`max_anterior_5m: ${max_anterior_5m}`);
                console.log(`max_anterior2_5m: ${max_anterior2_5m}`);
                console.log(`min_anterior_5m: ${min_anterior_5m}`);
                console.log(`min_anterior2_5m: ${min_anterior2_5m}`);
                
                */


                cacheJson[`${cryptSymbol}`] = await carregarCache(cryptSymbol);


                if (cacheJson[`${cryptSymbol}`].positMaxPercent == undefined) {

                    cacheJson[`${cryptSymbol}`].positMaxPercent = parseFloat(percent);
                    //salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);

                }

                if (cacheJson[`${cryptSymbol}`].positMinPercent == undefined) {

                    cacheJson[`${cryptSymbol}`].positMinPercent = parseFloat(percent);
                    //salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);

                }

                if (cacheJson[`${cryptSymbol}`].positLimitPercent == undefined) {

                    cacheJson[`${cryptSymbol}`].positLimitPercent = parseFloat(percent);
                    //salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);

                }


                var openOrdDir = '';
                var mediaRef = '';
                var mediaPrice = null;
                var mediaStopPrice = null;
                var mediaStopRef = '';

                var mmUpRef = '';
                var mmDownRef = '';
                var mmUp = null;
                var mmDown = null;
                var mmUpPrv = null;
                var mmDownPrv = null;

                var mmUpRef2 = '';
                var mmDownRef2 = '';
                var mmUp2 = null;
                var mmDown2 = null;
                var mmUp2Prv = null;
                var mmDown2Prv = null;


                if (
                    sma5m50p.preco >= sma5m60p.preco
                ) {
                    mmUp = estaProximoDaLinha(cryptSymbol, sma5m50p.preco, preco_atual);
                    mmDown = estaProximoDaLinha(cryptSymbol, sma5m60p.preco, preco_atual);
                    mmUpPrv = estaProximoDaLinha(cryptSymbol, sma5m50prev.preco, preco_atual);
                    mmDownPrv = estaProximoDaLinha(cryptSymbol, sma5m60prev.preco, preco_atual);

                    mmUpRef = 'sma5m50p';
                    mmDownRef = 'sma5m60p';

                } else {
                    mmUp = estaProximoDaLinha(cryptSymbol, sma5m60p.preco, preco_atual);
                    mmDown = estaProximoDaLinha(cryptSymbol, sma5m50p.preco, preco_atual);
                    mmUpPrv = estaProximoDaLinha(cryptSymbol, sma5m60prev.preco, preco_atual);
                    mmDownPrv = estaProximoDaLinha(cryptSymbol, sma5m50prev.preco, preco_atual);

                    mmUpRef = 'sma5m60p';
                    mmDownRef = 'sma5m50p';

                }

                if (
                    sma1m50p.preco >= sma1m60p.preco
                ) {
                    mmUp2 = estaProximoDaLinha(cryptSymbol, sma1m50p.preco, preco_atual);
                    mmDown2 = estaProximoDaLinha(cryptSymbol, sma1m60p.preco, preco_atual);
                    mmUp2Prv = estaProximoDaLinha(cryptSymbol, sma1m50prev.preco, preco_atual);
                    mmDown2Prv = estaProximoDaLinha(cryptSymbol, sma1m60prev.preco, preco_atual);

                    mmUpRef2 = 'sma1m50p';
                    mmDownRef2 = 'sma1m60p';

                } else {
                    mmUp2 = estaProximoDaLinha(cryptSymbol, sma1m60p.preco, preco_atual);
                    mmDown2 = estaProximoDaLinha(cryptSymbol, sma1m50p.preco, preco_atual);
                    mmUp2Prv = estaProximoDaLinha(cryptSymbol, sma1m60prev.preco, preco_atual);
                    mmDown2Prv = estaProximoDaLinha(cryptSymbol, sma1m50prev.preco, preco_atual);


                    mmUpRef2 = 'sma1m60p';
                    mmDownRef2 = 'sma1m50p';

                }

                /*
                console.log("");
                if (atr_atual_1m >= atr_anterior_1m) {
                    console.log("atr_atual_1m:", parseFloat(atr_atual_1m.toFixed(6)));
                    console.log("atr_anterior_1m:", parseFloat(atr_anterior_1m.toFixed(6)));
                } else {
                    console.log("atr_anterior_1m:", parseFloat(atr_anterior_1m.toFixed(6)));
                    console.log("atr_atual_1m:", parseFloat(atr_atual_1m.toFixed(6)));
                }
            
                console.log("");
                if (atr_anterior_1m >= atr_anterior2_1m) {
                    console.log("atr_anterior_1m:", parseFloat(atr_anterior_1m.toFixed(6)));
                    console.log("atr_anterior2_1m:", parseFloat(atr_anterior2_1m.toFixed(6)));
                } else {
                    console.log("atr_anterior2_1m:", parseFloat(atr_anterior2_1m.toFixed(6)));
                    console.log("atr_anterior_1m:", parseFloat(atr_anterior_1m.toFixed(6)));
                }
            
                    console.log("");
                if (atr_atual_3m >= atr_anterior_3m) {
                    console.log("atr_atual_3m:", parseFloat(atr_atual_3m.toFixed(6)));
                    console.log("atr_anterior_3m:", parseFloat(atr_anterior_3m.toFixed(6)));
                } else {
                    console.log("atr_anterior_3m:", parseFloat(atr_anterior_3m.toFixed(6)));
                    console.log("atr_atual_3m:", parseFloat(atr_atual_3m.toFixed(6)));
                }
            
                *
            
                console.log("");
                if (
                    parseFloat(objSendcalc.stoch1h.k) >= parseFloat(objSendcalc.stoch1hprev.k)
                ) {
                    console.log("stoch1h.k:", parseFloat(objSendcalc.stoch1h.k.toFixed(2)));
                    console.log("stoch1hprev.k:", parseFloat(objSendcalc.stoch1hprev.k.toFixed(2)));
                } else {
                    console.log("stoch1hprev.k:", parseFloat(objSendcalc.stoch1hprev.k.toFixed(2)));
                    console.log("stoch1h.k:", parseFloat(objSendcalc.stoch1h.k.toFixed(2)));
                }
            
                *
            
                console.log("");
                if (
                    parseFloat(objSendcalc.stoch30m.k) >= parseFloat(objSendcalc.stoch30mprev.k)
                ) {
                    console.log("stoch30m.k:", parseFloat(objSendcalc.stoch30m.k.toFixed(2)));
                    console.log("stoch30mprev.k:", parseFloat(objSendcalc.stoch30mprev.k.toFixed(2)));
                } else {
                    console.log("stoch30mprev.k:", parseFloat(objSendcalc.stoch30mprev.k.toFixed(2)));
                    console.log("stoch30m.k:", parseFloat(objSendcalc.stoch30m.k.toFixed(2)));
                }
            
                
        
                console.log("");
                if (
                    parseFloat(objSendcalc.stoch15m.k) >= parseFloat(objSendcalc.stoch15m.d)
                ) {
                    console.log("stoch15m.k:", parseFloat(objSendcalc.stoch15m.k.toFixed(2)));
                    console.log("stoch15m.d:", parseFloat(objSendcalc.stoch15m.d.toFixed(2)));
                } else {
                    console.log("stoch15m.d:", parseFloat(objSendcalc.stoch15m.d.toFixed(2)));
                    console.log("stoch15m.k:", parseFloat(objSendcalc.stoch15m.k.toFixed(2)));
                }
        
        
                console.log("");
                if (
                    parseFloat(objSendcalc.stoch15m.k) >= parseFloat(objSendcalc.stoch15mprev.k)
                ) {
                    console.log("stoch15m.k:", parseFloat(objSendcalc.stoch15m.k.toFixed(2)));
                    console.log("stoch15mprev.k:", parseFloat(objSendcalc.stoch15mprev.k.toFixed(2)));
                } else {
                    console.log("stoch15mprev.k:", parseFloat(objSendcalc.stoch15mprev.k.toFixed(2)));
                    console.log("stoch15m.k:", parseFloat(objSendcalc.stoch15m.k.toFixed(2)));
                }
        
                
                    console.log("");
                    if (
                        parseFloat(objSendcalc.stoch5m.k) >= parseFloat(objSendcalc.stoch5mprev.k)
                    ) {
                        console.log("stoch5m.k:", parseFloat(objSendcalc.stoch5m.k.toFixed(2)));
                        console.log("stoch5mprev.k:", parseFloat(objSendcalc.stoch5mprev.k.toFixed(2)));
                    } else {
                        console.log("stoch5mprev.k:", parseFloat(objSendcalc.stoch5mprev.k.toFixed(2)));
                        console.log("stoch5m.k:", parseFloat(objSendcalc.stoch5m.k.toFixed(2)));
                    }
                    /*
                        console.log("");
                        if (
                            parseFloat(objSendcalc.stoch3m.k) >= parseFloat(objSendcalc.stoch3mprev.k)
                        ) {
                            console.log("stoch3m.k:", parseFloat(objSendcalc.stoch3m.k.toFixed(2)));
                            console.log("stoch3mprev.k:", parseFloat(objSendcalc.stoch3mprev.k.toFixed(2)));
                        } else {
                            console.log("stoch3mprev.k:", parseFloat(objSendcalc.stoch3mprev.k.toFixed(2)));
                            console.log("stoch3m.k:", parseFloat(objSendcalc.stoch3m.k.toFixed(2)));
                        }
                    */

                /*
                        console.log("");
                
                        if (
                            parseFloat(stoch15m.k) >= parseFloat(stoch15mprev.k)
                        ) {
                            console.log("stoch15m.k:", parseFloat(stoch15m.k.toFixed(2)));
                            console.log("stoch15mprev.k:", parseFloat(stoch15mprev.k.toFixed(2)));
                        } else {
                            console.log("stoch15mprev.k:", parseFloat(stoch15mprev.k.toFixed(2)));
                            console.log("stoch15m.k:", parseFloat(stoch15m.k.toFixed(2)));
                        }
                
                */
                /*
                        var sigStoch = "N";
                        if (parseFloat(stoch5m.k) >= parseFloat(stoch5m.d)
                            && parseFloat(stoch15m.k) >= parseFloat(stoch15m.d)
                        ) {
                            sigStoch = "C";
                
                        }
                        if (parseFloat(stoch5m.k) <= parseFloat(stoch5m.d)
                            && parseFloat(stoch15m.k) <= parseFloat(stoch15m.d)
                        ) {
                            sigStoch = "V";
                
                        }
                
                        console.log("");
                        console.log(`<< - STOCH_${cryptSymbol}/${sigStoch} - >>`);
                        console.log("");
                
                
                
                
                        console.log("");
                        console.log(`<< - STOCH_${cryptSymbol}/${sigStoch} - >>`);
                        console.log("");
                        if (
                            parseFloat(stoch5m.k) >= parseFloat(stoch5m.d)
                        ) {
                            console.log("stoch5m.k:", parseFloat(stoch5m.k.toFixed(2)));
                            console.log("stoch5m.d:", parseFloat(stoch5m.d.toFixed(2)));
                        } else {
                            console.log("stoch5m.d:", parseFloat(stoch5m.d.toFixed(2)));
                            console.log("stoch5m.k:", parseFloat(stoch5m.k.toFixed(2)));
                        }
                        console.log("");
                        if (
                            parseFloat(stoch15m.k) >= parseFloat(stoch15m.d)
                        ) {
                            console.log("stoch15m.k:", parseFloat(stoch15m.k.toFixed(2)));
                            console.log("stoch15m.d:", parseFloat(stoch15m.d.toFixed(2)));
                        } else {
                            console.log("stoch15m.d:", parseFloat(stoch15m.d.toFixed(2)));
                            console.log("stoch15m.k:", parseFloat(stoch15m.k.toFixed(2)));
                
                        }
                */





                //console.log("");

                //console.log(`<< - STOCH_${cryptSymbol}/${sigStoch} - >>`);

                //console.log("");
                // 
                //         /// C alter 2

                //console.log("max_atual_3m: ", parseFloat(max_atual_3m));
                //console.log("min_atual_3m: ", parseFloat(min_atual_3m));
                //console.log("max_anterior_3m: ", parseFloat(max_anterior_3m));
                //console.log("min_anterior_3m: ", parseFloat(min_anterior_3m));
                //console.log("");

                /*
                        var sigMacd = "N";
                        if (parseFloat(macd3m.last.MACD) > parseFloat(macd3m.last2.MACD)
                            && parseFloat(macd15m.last.MACD) > 0.000
                        ) {
                            sigMacd = "C";
                
                        }
                        if (parseFloat(macd3m.last.MACD) < parseFloat(macd3m.last2.MACD)
                            && parseFloat(macd15m.last.MACD) < 0.000
                        ) {
                            sigMacd = "V";
                
                        }
                
                        console.log("");
                        console.log(`<< - MACD_${cryptSymbol}/${sigMacd} - >>`);
                        console.log("");
                */
                /*
                        var sigSmaBB = "N";
                        if (
                            (parseFloat(preco_atual) >= parseFloat(sma1h20p.preco))
                            || (
                                (parseFloat(min_atual_30m) <= parseFloat(bb1hLowProx.margemSuperior)
                                    || parseFloat(min_anterior_30m) <= parseFloat(bb1hLowProx.margemSuperior)
                                )
                                && parseFloat(preco_atual) > parseFloat(bb1hLowProx.preco)
                
                            )
                        ) {
                            sigSmaBB = "C";
                
                        }
                        if (
                            (parseFloat(preco_atual) <= parseFloat(sma1h20p.preco))
                            || (
                                (parseFloat(max_atual_30m) >= parseFloat(bb1hUpProx.margemInferior)
                                    || parseFloat(max_anterior_30m) >= parseFloat(bb1hUpProx.margemInferior)
                                )
                                && parseFloat(preco_atual) < parseFloat(bb1hUpProx.preco)
                
                
                            )
                
                        ) {
                            sigSmaBB = "V";
                
                        }
                
                        console.log(`<< - BBSMA_${cryptSymbol}/${sigSmaBB} - >>`);
                        console.log("");
                */
                /*
                        if (
                
                            //(
                            //parseFloat(objSendcalc.stoch1h.k) >= parseFloat(objSendcalc.stoch1hprev.k)
                            //&& parseFloat(objSendcalc.stoch30m.k) >= parseFloat(objSendcalc.stoch30mprev.k)
                            //&& 
                
                            //parseFloat(objSendcalc.stoch1h.k) >= parseFloat(objSendcalc.stoch1h.d)
                
                            //parseFloat(objSendcalc.stoch30m.k) >= parseFloat(objSendcalc.stoch30m.d)
                            //parseFloat(objSendcalc.stoch15m.k) > parseFloat(objSendcalc.stoch15m.d)
                            //parseFloat(objSendcalc.stoch30m.k) >= parseFloat(objSendcalc.stoch30mprev.k)
                            //parseFloat(objSendcalc.stoch15m.k) >= parseFloat(objSendcalc.stoch15mprev.k)
                            //&& parseFloat(objSendcalc.stoch5m.k) >= parseFloat(objSendcalc.stoch5mprev.k)
                            //&& parseFloat(objSendcalc.stoch3m.k) >= parseFloat(objSendcalc.stoch3mprev.k)
                            //)
                            /*
                                        (
                                            (parseFloat(mmUp.preco) >= parseFloat(mmUp2.preco)
                                                /*
                                                && ((min_anterior_1m <= mmUp.margemSuperior
                                                    && min_anterior_1m >= mmDown.margemInferior
                                                    && max_anterior_1m > mmUp.preco
                                                    && parseFloat(preco_atual) > (parseFloat(max_anterior_1m) + parseFloat('0.0001'))
                                                )
                                                    || (min_anterior2_1m <= mmUp.margemSuperior
                                                        && min_anterior2_1m >= mmDown.margemInferior
                                                        && max_anterior2_1m > mmUp.preco
                                                        && max_anterior_1m > mmUp.preco
                                                        && parseFloat(preco_atual) > (parseFloat(max_anterior_1m))
                                                    )
                                                )
                                                *
                                                //&& parseFloat(min_anterior_3m) <= parseFloat(mmUpPrv.margemSuperior)
                            
                                                //&& parseFloat(max_anterior_3m) > parseFloat(mmUpPrv.preco)
                                                //&& parseFloat(preco_atual) > (parseFloat(max_anterior_3m))
                                                //&& mmUp.estaProximo
                            
                                                &&
                                                (parseFloat(min_atual_3m) <= parseFloat(mmUp.margemSuperior)
                                                    || parseFloat(min_anterior_3m) <= parseFloat(mmUp.margemSuperior)
                                                )
                                                && parseFloat(preco_anterior_3m) >= parseFloat(mmUp.preco)
                                                && parseFloat(preco_atual) > parseFloat(max_anterior_3m)
                                                && parseFloat(preco_atual) > parseFloat(mmUp.preco)
                            
                                            )
                            
                                            || (parseFloat(mmUp2.preco) > parseFloat(mmUp.preco)
                                                /*
                                                && ((min_anterior_1m <= mmUp2.margemSuperior
                                                    && min_anterior_1m >= mmDown2.margemInferior
                                                    && max_anterior_1m > mmUp2.preco
                                                    && parseFloat(preco_atual) > (parseFloat(max_anterior_1m) + parseFloat('0.0001'))
                                                )
                                                    || (min_anterior2_1m <= mmUp2.margemSuperior
                                                        && min_anterior2_1m >= mmDown2.margemInferior
                                                        && max_anterior2_1m > mmUp2.preco
                                                        && max_anterior_1m > mmUp2.preco
                                                        && parseFloat(preco_atual) > (parseFloat(max_anterior_1m))
                                                    )
                                                )
                                                *
                                                //&& parseFloat(min_anterior2_3m) <= parseFloat(mmUp2Prv.margemSuperior)
                            
                            
                                                //&& parseFloat(max_anterior2_3m) > parseFloat(mmUp2Prv.preco)
                                                //&& parseFloat(preco_atual) > (parseFloat(max_anterior2_3m))
                            
                                                //&& mmUp2.estaProximo
                            
                                                &&
                                                (parseFloat(min_atual_3m) <= parseFloat(mmUp2.margemSuperior)
                                                    || parseFloat(min_anterior_3m) <= parseFloat(mmUp2.margemSuperior)
                                                )
                                                && parseFloat(preco_anterior_3m) >= parseFloat(mmUp2.preco)
                                                && parseFloat(preco_atual) > parseFloat(max_anterior_3m)
                                                && parseFloat(preco_atual) > parseFloat(mmUp2.preco)
                            
                            
                            
                                            )
                                        )
                                        //)
                            
                                        && (parseFloat(preco_atual) > parseFloat(mmUp.preco)
                                            && parseFloat(preco_atual) > parseFloat(mmDown.preco)
                                        )
                                        && (parseFloat(preco_atual) > parseFloat(mmUp2.preco)
                                            && parseFloat(preco_atual) > parseFloat(mmDown2.preco)
                                        )
                                        && parseFloat(sma1m50p.preco) >= parseFloat(sma1m60p.preco)
                                        && parseFloat(sma1m50p.preco) >= parseFloat(sma1m50prev.preco)
                            
                                        //&& parseFloat(stoch5m.k) >= parseFloat(stoch5m.d)
                                        //&& parseFloat(stoch15m.k) >= parseFloat(stoch15m.d)
                            
                                        //&& parseFloat(atr_atual_1m.toFixed(6)) > parseFloat(atr_anterior_1m.toFixed(6))
                            
                                        //&& sma1m5p.preco >= sma1m5prev.preco
                                        //&& sma1m10p.preco >= sma1m10prev.preco
                                        //&& sma1m20p.preco >= sma1m20prev.preco
                                        //&& sma1m10p.preco >= sma1m20p.preco
                            *
                
                            (
                                (parseFloat(preco_atual) >= parseFloat(sma15m20p.preco))
                                || (
                                    (parseFloat(min_atual_30m) <= parseFloat(bb1hLowProx.margemSuperior)
                                        || parseFloat(min_anterior_30m) <= parseFloat(bb1hLowProx.margemSuperior)
                                    )
                                    && parseFloat(preco_atual) > parseFloat(bb1hLowProx.preco)
                
                                )
                            )
                
                            && parseFloat(macd3m.last.MACD) > parseFloat(macd3m.last2.MACD)
                            //&& parseFloat(macd15m.last.MACD) > 0.00
                            //&& bbUpProx == true
                            //&& pcUpProx == true
                
                            &&
                            (parseFloat(min_atual_3m) <= parseFloat(sma1m20p.margemSuperior)
                                || parseFloat(min_anterior_3m) <= parseFloat(sma1m20p.margemSuperior)
                            )
                
                            && parseFloat(preco_anterior_3m) >= parseFloat(sma1m20p.preco)
                            && parseFloat(preco_atual) > parseFloat(max_anterior_3m)
                            && parseFloat(preco_atual) > parseFloat(sma1m20p.preco)
                
                
                            /*
                                        &&
                                        (parseFloat(min_atual_3m) <= parseFloat(pclowProx.margemSuperior)
                                            || parseFloat(min_anterior_3m) <= parseFloat(pclowProx.margemSuperior)
                                        )
                                        && parseFloat(preco_anterior_3m) >= parseFloat(pclowProx.preco)
                                        && parseFloat(preco_atual) > parseFloat(max_anterior_3m)
                                        && parseFloat(preco_atual) > parseFloat(pclowProx.preco)
                            *
                
                            && parseFloat(sma15m20p.preco) >= parseFloat(sma1h20p.preco)
                            && parseFloat(preco_atual) >= parseFloat(sma1m20p.preco)
                            && parseFloat(preco_atual) >= parseFloat(sma3m20p.preco)
                            && parseFloat(preco_atual) >= parseFloat(sma15m20p.preco)
                
                        ) {
                            //console.log("C1-MMregUP: ", mmUpRef);
                
                            //if (
                            //preco_atual > mmUp2.preco
                            //) {
                
                            console.log("C2A-MMregUPout: ", mmUpRef);
                
                            openOrdDir = 'C';
                            mediaRef = mmUpRef2;
                            mediaPrice = mmUp2.preco;
                            mediaStopRef = mmDownRef;
                            mediaStopPrice = mmDown.preco;
                            //}
                
                            /*
                            if (
                                preco_atual > mmDown.preco
                            ) {
                    
                                console.log("C2B-MMregUPout: ", mmUpRef);
                    
                                openOrdDir = 'C';
                                mediaRef = mmDownRef;
                                mediaPrice = mmDown.preco;
                                mediaStopRef = mmDownRef;
                                mediaStopPrice = mmDown.preco;
                            }
                            *
                
                
                        }
                
                
                
                
                        /// V alter 2
                        if (
                
                            //(
                            //parseFloat(objSendcalc.stoch1h.k) <= parseFloat(objSendcalc.stoch1hprev.k)
                
                            //&& parseFloat(objSendcalc.stoch30m.k) <= parseFloat(objSendcalc.stoch30mprev.k)
                            //&& 
                            //parseFloat(objSendcalc.stoch1h.k) <= parseFloat(objSendcalc.stoch1h.d)
                
                            //parseFloat(objSendcalc.stoch30m.k) <= parseFloat(objSendcalc.stoch30m.d)
                            //parseFloat(objSendcalc.stoch30m.k) <= parseFloat(objSendcalc.stoch30mprev.k)
                            //parseFloat(objSendcalc.stoch15m.k) < parseFloat(objSendcalc.stoch15m.d)
                            //parseFloat(objSendcalc.stoch15m.k) <= parseFloat(objSendcalc.stoch15mprev.k)
                            //&& parseFloat(objSendcalc.stoch5m.k) <= parseFloat(objSendcalc.stoch5mprev.k)
                            //&& parseFloat(objSendcalc.stoch3m.k) <= parseFloat(objSendcalc.stoch3mprev.k)
                
                            //)
                
                            /*
                            (
                                (parseFloat(mmDown.preco) <= parseFloat(mmDown2.preco)
                                    /*
                                    && ((max_anterior_1m >= mmDown.margemInferior
                                        && max_anterior_1m <= mmUp.margemSuperior
                                        && min_anterior_1m < mmDown.preco
                                        && parseFloat(preco_atual) < (parseFloat(min_anterior_1m) + parseFloat('0.0001'))
                                    )
                                        || (max_anterior2_1m >= mmDown.margemInferior
                                            && max_anterior2_1m <= mmUp.margemSuperior
                                            && min_anterior2_1m < mmDown.preco
                                            && min_anterior_1m < mmDown.preco
                                            && parseFloat(preco_atual) < (parseFloat(min_anterior_1m))
                                        )
                                    )
                                    *
                                    //&& parseFloat(max_anterior_3m) >= parseFloat(mmDownPrv.margemInferior)
                
                                    //&& parseFloat(min_anterior_3m) < parseFloat(mmDownPrv.preco)
                                    //&& parseFloat(preco_atual) < (parseFloat(min_anterior_3m))
                
                                    //&& mmDown.estaProximo
                                    &&
                                    (parseFloat(max_atual_3m) >= parseFloat(mmDown.margemInferior)
                                        || parseFloat(max_anterior_3m) >= parseFloat(mmDown.margemInferior)
                                    )
                
                                    && parseFloat(preco_anterior_3m) <= parseFloat(mmDown.preco)
                                    && parseFloat(preco_atual) < parseFloat(min_anterior_3m)
                                    && parseFloat(preco_atual) < parseFloat(mmDown.preco)
                
                                )
                
                                || (parseFloat(mmDown2.preco) < parseFloat(mmDown.preco)
                                    /*
                                    && ((max_anterior_1m >= mmDown2.margemInferior
                                        && max_anterior_1m <= mmUp2.margemSuperior
                                        && min_anterior_1m < mmDown2.preco
                                        && parseFloat(preco_atual) < (parseFloat(min_anterior_1m) + parseFloat('0.0001'))
                                    )
                                        || (max_anterior2_1m >= mmDown2.margemInferior
                                            && max_anterior2_1m <= mmUp2.margemSuperior
                                            && min_anterior2_1m < mmDown2.preco
                                            && min_anterior_1m < mmDown2.preco
                                            && parseFloat(preco_atual) < (parseFloat(min_anterior_1m))
                                        )
                                    )
                                    *
                                    //&& parseFloat(max_anterior2_3m) >= parseFloat(mmDown2Prv.margemInferior)
                
                                    //&& parseFloat(min_anterior2_3m) < parseFloat(mmDown2Prv.preco)
                                    //&& parseFloat(preco_atual) < (parseFloat(min_anterior2_3m))
                
                                    //&& mmDown2.estaProximo
                                    &&
                                    (parseFloat(max_atual_3m) >= parseFloat(mmDown2.margemInferior)
                                        || parseFloat(max_anterior_3m) >= parseFloat(mmDown2.margemInferior)
                                    )
                
                                    && parseFloat(preco_anterior_3m) <= parseFloat(mmDown2.preco)
                                    && parseFloat(preco_atual) < parseFloat(min_anterior_3m)
                                    && parseFloat(preco_atual) < parseFloat(mmDown2.preco)
                
                
                                )
                
                
                
                            )
                            *
                
                            && (parseFloat(preco_atual) < parseFloat(mmUp.preco)
                                && parseFloat(preco_atual) < parseFloat(mmDown.preco)
                            )
                            && (parseFloat(preco_atual) < parseFloat(mmUp2.preco)
                                && parseFloat(preco_atual) < parseFloat(mmDown2.preco)
                            )
                            *
                            && parseFloat(preco_atual) > parseFloat(mmDown2.preco)
                            && parseFloat(sma1m50p.preco) <= parseFloat(sma1m60p.preco)
                            && parseFloat(sma1m50p.preco) <= parseFloat(sma1m50prev.preco)
                        *
                            //&& parseFloat(stoch5m.k) <= parseFloat(stoch5m.d)
                            //&& parseFloat(stoch15m.k) <= parseFloat(stoch15m.d)
                
                            //&& sma1m5p.preco <= sma1m5prev.preco
                            //&& sma1m10p.preco <= sma1m10prev.preco
                            //&& sma1m20p.preco <= sma1m20prev.preco
                            //&& sma1m10p.preco <= sma1m20p.preco
                            (
                                (parseFloat(preco_atual) <= parseFloat(sma15m20p.preco))
                                || (
                                    (parseFloat(max_atual_30m) >= parseFloat(bb1hUpProx.margemInferior)
                                        || parseFloat(max_anterior_30m) >= parseFloat(bb1hUpProx.margemInferior)
                                    )
                                    && parseFloat(preco_atual) < parseFloat(bb1hUpProx.preco)
                
                
                                )
                            )
                
                            && parseFloat(macd3m.last.MACD) < parseFloat(macd3m.last2.MACD)
                            //&& parseFloat(macd15m.last.MACD) < 0.00
                            //&& bbUpProx == true
                            //&& pcUpProx == true
                
                            &&
                            (parseFloat(max_atual_3m) >= parseFloat(sma1m20p.margemInferior)
                                || parseFloat(max_anterior_3m) >= parseFloat(sma1m20p.margemInferior)
                            )
                
                            && parseFloat(preco_anterior_3m) <= parseFloat(sma3m20p.preco)
                            && parseFloat(preco_atual) < parseFloat(min_anterior_3m)
                            && parseFloat(preco_atual) < parseFloat(sma3m20p.preco)
                
                            /*
                            &&
                            (parseFloat(max_atual_3m) >= parseFloat(pcUpProx.margemInferior)
                                || parseFloat(max_anterior_3m) >= parseFloat(pcUpProx.margemInferior)
                            )
                
                            && parseFloat(preco_anterior_3m) <= parseFloat(pcUpProx.preco)
                            && parseFloat(preco_atual) < parseFloat(min_anterior_3m)
                            && parseFloat(preco_atual) < parseFloat(pcUpProx.preco)
                            *
                
                        ) {
                            //console.log("V1-MMregDown: ", mmDownRef);
                
                            //if (
                            //preco_atual < mmDown2.preco
                            //) {
                            console.log("V2A-MMregDownOut: ", mmDownRef);
                
                            openOrdDir = 'V';
                            mediaRef = mmDownRef2;
                            mediaPrice = mmDown2.preco;
                            mediaStopRef = mmUpRef2;
                            mediaStopPrice = mmUp2.preco;
                            //}
                
                            /*
                            if (
                                preco_atual < mmUp.preco
                            ) {
                                console.log("V2B-MMregDownOut: ", mmDownRef);
                    
                                openOrdDir = 'V';
                                mediaRef = mmUpRef;
                                mediaPrice = mmUp.preco;
                                mediaStopRef = mmUpRef;
                                mediaStopPrice = mmUp.preco;
                            }
                            *
                
                
                        }
                // */

                console.log("preco_atual: ", preco_atual);
                //console.log("sma15m20p: ", sma15m20p.preco);
                //console.log("sma3m20p: ", sma3m20p.preco);
                console.log(" ");
                console.log(`cacheJson[${cryptSymbol}].positMaxPercent: `, cacheJson[`${cryptSymbol}`].positMaxPercent);
                console.log(`cacheJson[${cryptSymbol}].plus: `, cacheJson[`${cryptSymbol}`].plus);
                console.log(" ");

                var mm4UP = null;
                var mm4DW = null;
                var mm4UP2 = null;
                var mm4DW2 = null;
                var mm4UP3 = null;
                var mm4DW3 = null;
                var mm4max = null;
                var mm4min = null;

                //fibo_d3618 = estaProximoDaLinha(cryptSymbol, fibo[12], preco_atual);
                //const maiorValor = Math.max(var1, var2, var3, var4);
                //console.log(maiorValor);

                //var maiorMM = Math.max(/*parseFloat(sma1m20p.preco),*/ parseFloat(sma1m100p.preco), parseFloat(sma3m20p.preco)/*, parseFloat(sma15m20p.preco)/*, parseFloat(sma1h20p.preco)*/);
                //var menorMM = Math.min(/*parseFloat(sma1m20p.preco), */ parseFloat(sma1m100p.preco), parseFloat(sma3m20p.preco)/* , parseFloat(sma15m20p.preco)/*, parseFloat(sma1h20p.preco)*/);

                //var maiorMM = Math.max(parseFloat(sma3m20p.preco), parseFloat(sma1m100p.preco), parseFloat(sma5m50p.preco), parseFloat(sma15m20p.preco));
                //var menorMM = Math.min(parseFloat(sma3m20p.preco), parseFloat(sma1m100p.preco), parseFloat(sma5m50p.preco), parseFloat(sma15m20p.preco));
                /*
                        var maiorMM = Math.max(parseFloat(sma1m20p.preco), parseFloat(sma1m100p.preco), parseFloat(sma3m20p.preco));
                        var menorMM = Math.min(parseFloat(sma1m20p.preco), parseFloat(sma1m100p.preco), parseFloat(sma3m20p.preco));
                
                        var maiorMMPrev = Math.max(parseFloat(sma1m20prev.preco), parseFloat(sma1m100prev.preco), parseFloat(sma3m20prev.preco));
                        var menorMMPrev = Math.min(parseFloat(sma1m20prev.preco), parseFloat(sma1m100prev.preco), parseFloat(sma3m20prev.preco));
                *
                var maiorMM = Math.max(parseFloat(sma1m100p.preco), parseFloat(sma3m20p.preco));
                var menorMM = Math.min(parseFloat(sma1m100p.preco), parseFloat(sma3m20p.preco));
        
                var maiorMMPrev = Math.max(parseFloat(sma1m100prev.preco), parseFloat(sma3m20prev.preco));
                var menorMMPrev = Math.min(parseFloat(sma1m100prev.preco), parseFloat(sma3m20prev.preco));
        *
                var maiorMM = Math.max(parseFloat(sma5m50p.preco), parseFloat(sma15m20p.preco));
                var menorMM = Math.min(parseFloat(sma5m50p.preco), parseFloat(sma15m20p.preco));
        
                var maiorMMPrev = Math.max(parseFloat(sma5m50prev.preco), parseFloat(sma15m20prev.preco));
                var menorMMPrev = Math.min(parseFloat(sma5m50prev.preco), parseFloat(sma15m20prev.preco));
        
                var maiorMM = Math.max(/* parseFloat(sma1m60p.preco), parseFloat(sma1m100p.preco), * parseFloat(sma15m20p.preco), parseFloat(sma1h20p.preco));
                var menorMM = Math.min(/* parseFloat(sma1m60p.preco), parseFloat(sma1m100p.preco), * parseFloat(sma15m20p.preco), parseFloat(sma1h20p.preco));
        
                var maiorMMPrev = Math.max(/* parseFloat(sma1m60prev.preco), parseFloat(sma1m100prev.preco), * parseFloat(sma15m20prev.preco), parseFloat(sma1h20prev.preco));
                var menorMMPrev = Math.min(/* parseFloat(sma1m60prev.preco), parseFloat(sma1m100prev.preco), * parseFloat(sma15m20prev.preco), parseFloat(sma1h20prev.preco));
        *
        
                var maiorMM = Math.max(/* parseFloat(sma1m60p.preco), parseFloat(sma1m100p.preco), * parseFloat(sma1m100p.preco), parseFloat(sma15m20p.preco));
                var menorMM = Math.min(/* parseFloat(sma1m60p.preco), parseFloat(sma1m100p.preco), * parseFloat(sma1m100p.preco), parseFloat(sma15m20p.preco));
        
                var maiorMMPrev = Math.max(/* parseFloat(sma1m60prev.preco), parseFloat(sma1m100prev.preco), * parseFloat(sma1m100prev.preco), parseFloat(sma15m20prev.preco));
                var menorMMPrev = Math.min(/* parseFloat(sma1m60prev.preco), parseFloat(sma1m100prev.preco), * parseFloat(sma1m100prev.preco), parseFloat(sma15m20prev.preco));
        
        *
                var maiorMM = Math.max(parseFloat(sma1m60p.preco), parseFloat(sma1m100p.preco));
                var menorMM = Math.min(parseFloat(sma1m60p.preco), parseFloat(sma1m100p.preco));
        
                var maiorMMPrev = Math.max(parseFloat(sma1m60prev.preco), parseFloat(sma1m100prev.preco));
                var menorMMPrev = Math.min(parseFloat(sma1m60prev.preco), parseFloat(sma1m100prev.preco));
        *
                var maiorMM = Math.max(parseFloat(ema5m100p.preco), parseFloat(sma5m100p.preco), parseFloat(ema1h10p.preco), parseFloat(sma1h10p.preco));
                var menorMM = Math.min(parseFloat(ema5m100p.preco), parseFloat(sma5m100p.preco), parseFloat(ema1h10p.preco), parseFloat(sma1h10p.preco));
        
                var maiorMMPrev = Math.max(parseFloat(ema5m100prev.preco), parseFloat(sma5m100prev.preco), parseFloat(ema1h10prev.preco), parseFloat(sma1h10prev.preco));
                var menorMMPrev = Math.min(parseFloat(ema5m100prev.preco), parseFloat(sma5m100prev.preco), parseFloat(ema1h10prev.preco), parseFloat(sma1h10prev.preco));
        *
                var maiorMM = Math.max(parseFloat(ema5m100p.preco), parseFloat(sma5m100p.preco), parseFloat(ema5m50p.preco), parseFloat(sma5m50p.preco));
                var menorMM = Math.min(parseFloat(ema5m100p.preco), parseFloat(sma5m100p.preco), parseFloat(ema5m50p.preco), parseFloat(sma5m50p.preco));
        
                var maiorMMPrev = Math.max(parseFloat(ema5m100prev.preco), parseFloat(sma5m100prev.preco), parseFloat(ema5m50prev.preco), parseFloat(sma5m50prev.preco));
                var menorMMPrev = Math.min(parseFloat(ema5m100prev.preco), parseFloat(sma5m100prev.preco), parseFloat(ema5m50prev.preco), parseFloat(sma5m50prev.preco));
        */

                //var maiorMM = Math.max(parseFloat(ema15m50p.preco), parseFloat(ema1h25p.preco));
                //var menorMM = Math.min(parseFloat(ema15m50p.preco), parseFloat(ema1h25p.preco));

                //var maiorMMPrev = Math.max(parseFloat(ema15m50prev.preco), parseFloat(ema1h25pre.preco), parseFloat(ema5m50prev.preco), parseFloat(sma5m50prev.preco));
                //var menorMMPrev = Math.min(parseFloat(ema15m50prev.preco), parseFloat(sma5m100prev.preco), parseFloat(ema5m50prev.preco), parseFloat(sma5m50prev.preco));


                //var maiorMM = Math.max(parseFloat(ema15m20p.preco), parseFloat(ema15m25p.preco));
                //var menorMM = Math.min(parseFloat(ema15m20p.preco), parseFloat(ema15m25p.preco));

                //var maiorMM = Math.max(parseFloat(ema15m20p.preco), parseFloat(ema15m25p.preco));
                //var menorMM = Math.min(parseFloat(ema15m20p.preco), parseFloat(ema15m25p.preco));

                //var maiorMM = Math.max(parseFloat(ema15m20p.preco), parseFloat(ema15m50p.preco), parseFloat(ema15m100p.preco));
                //var menorMM = Math.min(parseFloat(ema15m20p.preco), parseFloat(ema15m50p.preco), parseFloat(ema15m100p.preco));

                //var maiorMM = Math.max(parseFloat(ema3m100p.preco), parseFloat(ema3m120p.preco));
                //var menorMM = Math.min(parseFloat(ema3m100p.preco), parseFloat(ema3m120p.preco));

                //var maiorMM = Math.max(parseFloat(ema1m100p.preco), parseFloat(ema1m120p.preco));
                //var menorMM = Math.min(parseFloat(ema1m100p.preco), parseFloat(ema1m120p.preco));

                //var maiorMM = Math.max(parseFloat(ema1h50p.preco), parseFloat(ema1h60p.preco), parseFloat(ema1h20p.preco), parseFloat(ema1h25p.preco));
                //var menorMM = Math.min(parseFloat(ema1h50p.preco), parseFloat(ema1h60p.preco), parseFloat(ema1h20p.preco), parseFloat(ema1h25p.preco));

                //var maiorMM2 = Math.max(parseFloat(ema1m20p.preco), parseFloat(ema1m25p.preco));
                //var menorMM2 = Math.min(parseFloat(ema1m20p.preco), parseFloat(ema1m25p.preco));


                ///---------**----

                //var maiorMM2 = Math.max(parseFloat(ema1h50p.preco), parseFloat(ema1h60p.preco));
                //var menorMM2 = Math.min(parseFloat(ema1h50p.preco), parseFloat(ema1h60p.preco));


                //var maiorMM3 = Math.max(parseFloat(ema1h100p.preco), parseFloat(ema1h120p.preco));
                //var menorMM3 = Math.min(parseFloat(ema1h100p.preco), parseFloat(ema1h120p.preco));



                //---------**///----

                //var maiorMM = Math.max(parseFloat(ema15m20p.preco), parseFloat(ema15m25p.preco));
                //var menorMM = Math.min(parseFloat(ema15m20p.preco), parseFloat(ema15m25p.preco));


                //var maiorMM = Math.max(parseFloat(ema15m20p.preco), parseFloat(ema15m25p.preco));
                //var menorMM = Math.min(parseFloat(ema15m20p.preco), parseFloat(ema15m25p.preco));

                //var maiorMM = Math.max(parseFloat(ema5m20p.preco), parseFloat(ema5m25p.preco), parseFloat(ema15m20p.preco), parseFloat(ema15m25p.preco));
                //var menorMM = Math.min(parseFloat(ema5m20p.preco), parseFloat(ema5m25p.preco), parseFloat(ema15m20p.preco), parseFloat(ema15m25p.preco));



                //var maiorMM = Math.max(parseFloat(ema5m20p.preco), parseFloat(ema5m25p.preco), parseFloat(ema1m20p.preco), parseFloat(ema1m25p.preco));
                //var menorMM = Math.min(parseFloat(ema5m20p.preco), parseFloat(ema5m25p.preco), parseFloat(ema1m20p.preco), parseFloat(ema1m25p.preco));


                //var maiorMM = Math.max(parseFloat(sma5m20p.preco), parseFloat(ema5m20p.preco), parseFloat(ema5m25p.preco));
                //var menorMM = Math.min(parseFloat(sma5m20p.preco), parseFloat(ema5m20p.preco), parseFloat(ema5m25p.preco));


                //var maiorMM = Math.max(parseFloat(sma5m20p.preco), parseFloat(ema5m20p.preco), parseFloat(ema5m25p.preco));
                //var menorMM = Math.min(parseFloat(sma5m20p.preco), parseFloat(ema5m20p.preco), parseFloat(ema5m25p.preco));


                //var maiorMM = Math.max(parseFloat(ema1h20p.preco), parseFloat(ema1h25p.preco));
                //var menorMM = Math.min(parseFloat(ema1h20p.preco), parseFloat(ema1h25p.preco));

                //var maiorMM = Math.max(parseFloat(ema1m20p.preco), parseFloat(ema1m25p.preco));
                //var menorMM = Math.min(parseFloat(ema1m20p.preco), parseFloat(ema1m25p.preco));


                //var maiorMM = Math.max(parseFloat(ema5m20p.preco), parseFloat(ema5m25p.preco));
                //var menorMM = Math.min(parseFloat(ema5m20p.preco), parseFloat(ema5m25p.preco));


                //---------**----*/



                //var maiorMM = Math.max(parseFloat(sma5m50p.preco), parseFloat(sma5m60p.preco));
                //var menorMM = Math.min(parseFloat(sma5m50p.preco), parseFloat(sma5m60p.preco));


                //var maiorMM2 = Math.max(parseFloat(ema5m20p.preco), parseFloat(ema5m25p.preco));
                //var menorMM2 = Math.min(parseFloat(ema5m20p.preco), parseFloat(ema5m25p.preco));

                /*//---------**----
    
                var maiorMM = Math.max(parseFloat(sma5m50p.preco), parseFloat(sma5m60p.preco), parseFloat(ema5m20p.preco), parseFloat(ema5m25p.preco));
                var menorMM = Math.min(parseFloat(sma5m50p.preco), parseFloat(sma5m60p.preco), parseFloat(ema5m20p.preco), parseFloat(ema5m25p.preco));
    
                var maiorMM2 = Math.max(parseFloat(sma1m50p.preco), parseFloat(sma1m60p.preco));
                var menorMM2 = Math.min(parseFloat(sma1m50p.preco), parseFloat(sma1m60p.preco));
    
                //---------**----*/

                /*//---------**----
    
                var maiorMM = Math.max(parseFloat(sma5m50p.preco), parseFloat(sma5m60p.preco));
                var menorMM = Math.min(parseFloat(sma5m50p.preco), parseFloat(sma5m60p.preco));
    
                var maiorMM2 = Math.max(parseFloat(ema5m20p.preco), parseFloat(ema5m25p.preco));
                var menorMM2 = Math.min(parseFloat(ema5m20p.preco), parseFloat(ema5m25p.preco));
    
                //---------**----*/

                ///---------**----

                //resTend4h.valor


                //var maiorMM = Math.max( /* parseFloat(resTend15m.lta.valor), */ parseFloat(resTend1h.lta.valor), parseFloat(resTend4h.lta.valor), parseFloat(sma5m50p.preco), parseFloat(sma5m60p.preco), parseFloat(ema5m50p.preco), parseFloat(ema5m60p.preco));
                //var menorMM = Math.min( /* parseFloat(resTend15m.ltb.valor), */ parseFloat(resTend1h.ltb.valor), parseFloat(resTend4h.ltb.valor), parseFloat(sma5m50p.preco), parseFloat(sma5m60p.preco), parseFloat(ema5m50p.preco), parseFloat(ema5m60p.preco));

                //var maiorMM = Math.max( /* parseFloat(resTend15m.lta.valor), */ parseFloat(resTend1h.lta.valor), parseFloat(resTend4h.lta.valor)); //, parseFloat(sma5m50p.preco), parseFloat(sma5m60p.preco), parseFloat(ema5m50p.preco), parseFloat(ema5m60p.preco));
                //var menorMM = Math.min( /* parseFloat(resTend15m.ltb.valor), */ parseFloat(resTend1h.ltb.valor), parseFloat(resTend4h.ltb.valor)); //, parseFloat(sma5m50p.preco), parseFloat(sma5m60p.preco), parseFloat(ema5m50p.preco), parseFloat(ema5m60p.preco));


                //var maiorMM = Math.max(parseFloat(resTend1h.ltb.valor), parseFloat(resTend1h.lta.valor)); //, parseFloat(resTend4h.lta.valor)); //, parseFloat(sma5m50p.preco), parseFloat(sma5m60p.preco), parseFloat(ema5m50p.preco), parseFloat(ema5m60p.preco));
                //var menorMM = Math.min(parseFloat(resTend1h.lta.valor), parseFloat(resTend1h.ltb.valor)); //, parseFloat(resTend4h.ltb.valor)); //, parseFloat(sma5m50p.preco), parseFloat(sma5m60p.preco), parseFloat(ema5m50p.preco), parseFloat(ema5m60p.preco));

                var maiorMM = Math.max(parseFloat(sma5m50p.preco), parseFloat(sma5m60p.preco), parseFloat(ema5m50p.preco), parseFloat(ema5m60p.preco));

                var menorMM = Math.min(parseFloat(sma5m50p.preco), parseFloat(sma5m60p.preco), parseFloat(ema5m50p.preco), parseFloat(ema5m60p.preco));

                //   var maiorMM2 = Math.max(parseFloat(ema5m20p.preco), parseFloat(ema5m25p.preco));
                //   var menorMM2 = Math.min(parseFloat(ema5m20p.preco), parseFloat(ema5m25p.preco));

                //---------**----*/


                mm4UP = estaProximoDaLinha(cryptSymbol, maiorMM, preco_atual);
                mm4DW = estaProximoDaLinha(cryptSymbol, menorMM, preco_atual);
                //   mm4UP2 = estaProximoDaLinha(cryptSymbol, maiorMM2, preco_atual);
                //    mm4DW2 = estaProximoDaLinha(cryptSymbol, menorMM2, preco_atual);

                //mm4UP3 = estaProximoDaLinha(cryptSymbol, maiorMM3, preco_atual);
                //mm4DW3 = estaProximoDaLinha(cryptSymbol, menorMM3, preco_atual);

                //mm4UP2 = estaProximoDaLinha(cryptSymbol, maiorMMPrev, preco_atual);
                //mm4DW2 = estaProximoDaLinha(cryptSymbol, menorMMPrev, preco_atual);

                /*
                console.log("mm4UP: ", mm4UP);
                console.log("mm4DW: ", mm4DW);
                console.log("");
     
                /*
                console.log("mm4UP2: ", mm4UP2);
                console.log("mm4DW2: ", mm4DW2);
                console.log("");
    
                /*
                console.log("mm4UP3: ", mm4UP3);
                console.log("mm4DW3: ", mm4DW3);
                console.log("");    
                */

                //console.log(`ema15m20p: [${cryptSymbol}]: `, ema15m20p.preco);
                //console.log(`ema15m25p: [${cryptSymbol}]: `, ema15m25p.preco);
                //console.log(`sma15m20p: [${cryptSymbol}]: `, sma15m20p.preco);
                console.log("");

                var sigSar = "N";
                var sigSar1 = "N";
                var sigSar2 = "N";
                var sigSar3 = "N";

                if (parseFloat(preco_atual) >= parseFloat(p1Sar2)
                ) {

                    sigSar1 = "C";
                }

                if (parseFloat(preco_atual) <= parseFloat(p1Sar2)
                ) {

                    sigSar1 = "V";
                }

                if (parseFloat(preco_atual) >= parseFloat(p2Sar2)
                ) {

                    sigSar2 = "C";
                }

                if (parseFloat(preco_atual) <= parseFloat(p2Sar2)
                ) {

                    sigSar2 = "V";
                }

                if (parseFloat(preco_atual) >= parseFloat(p3Sar2)
                ) {

                    sigSar3 = "C";
                }

                if (parseFloat(preco_atual) <= parseFloat(p3Sar2)
                ) {

                    sigSar3 = "V";
                }

                //console.log(`sar2Par1[${cryptSymbol}/${sigSar1}](1m):_`, p1Sar2);

                //console.log(`sar1Par1[${cryptSymbol}](1m):_`, p1Sar1);
                //console.log(`sar2Par1[${cryptSymbol}](1m):_`, p1Sar2);
                //console.log(`sar1Par2[${cryptSymbol}](3m):_`, p2Sar1);

                //console.log(`sar2Par2[${cryptSymbol}/${sigSar2}](3m):_`, p2Sar2);
                //console.log("");
                //console.log(`sar1Par3[${cryptSymbol}](5m):_`, p3Sar1);
                //console.log(`sar2Par3[${cryptSymbol}/${sigSar3}](5m):_`, p3Sar2);

                //console.log(`sar1Par4[${cryptSymbol}](15m):_`, p4Sar1);
                //console.log(`sar2Par4[${cryptSymbol}](15m):_`, p4Sar2);

                console.log("");
                console.log("preco_atual: ", preco_atual);
                console.log("");

                //console.log("mm4UP2: ", mm4UP2);
                //console.log("mm4DW2: ", mm4DW2);

                var sigStoch = "N";

                if (parseFloat(stoch5m.k) >= parseFloat(stoch5m.d)
                    && parseFloat(stoch1m.k) >= parseFloat(stoch1m.d)

                ) {

                    sigStoch = "C";
                }



                if (parseFloat(stoch5m.k) <= parseFloat(stoch5m.d)
                    && parseFloat(stoch1m.k) <= parseFloat(stoch1m.d)

                ) {

                    sigStoch = "V";
                }


                /*
                        console.log("stoch5m.k: ", parseFloat(stoch5m.k.toFixed(2)));
                        console.log("stoch5m.d: ", parseFloat(stoch5m.d.toFixed(2)));
                        console.log("");
                
                        console.log("stoch1m.k: ", parseFloat(stoch1m.k.toFixed(2)));
                        console.log("stoch1m.d: ", parseFloat(stoch1m.d.toFixed(2)));
                
                        console.log("");
                        console.log(`<< - STOCH_${cryptSymbol}/${sigStoch} - >>`);
                        console.log("");
                        */

                /*
                        console.log("stoch3m.k: ", stoch3m.k);
                        console.log("stochmp.k: ", stoch3mprev.k);
                        console.log("stoch5m.k: ", stoch5m.k);
                        console.log("stoch5mp.k: ", stoch5mprev.k);
                        console.log("stoch15m.k: ", stoch15m.k);
                        console.log("stoch15mp.k: ", stoch15mprev.k);
                        //console.log("stoch30m.k: ", stoch30m.k);
                        */
                console.log("");
                /*
                        console.log(`ifr3m: [${cryptSymbol}]`, ifr3m);
                        console.log(`ifr3mprev: [${cryptSymbol}]`, ifr3mprev);
                        console.log(`ifr5m: [${cryptSymbol}]`, ifr5m);
                        console.log(`ifr5mprev: [${cryptSymbol}]`, ifr5mprev);
                        console.log(`ifr15m: [${cryptSymbol}]`, ifr15m);
                        console.log(`ifr15mprev: [${cryptSymbol}]`, ifr15mprev);
                */
                //fibo786.preco;

                /*
        
                var fibo1618 = estaProximoDaLinha(cryptSymbol, fiboRetrac.retr1618, preco_atual);
                var fibo2618 = estaProximoDaLinha(cryptSymbol, fiboRetrac.retr2618, preco_atual);
                var fibo3618 = estaProximoDaLinha(cryptSymbol, fiboRetrac.retr3618, preco_atual);
                var fibo4236 = estaProximoDaLinha(cryptSymbol, fiboRetrac.retr4236, preco_atual);
                var fibo_d1618 = estaProximoDaLinha(cryptSymbol, fiboRetrac.retr0618Neg, preco_atual);
                var fibo_d3618 = estaProximoDaLinha(cryptSymbol, fiboRetrac.retr1618Neg, preco_atual);
                var fibo_d3618 = estaProximoDaLinha(cryptSymbol, fiboRetrac.retr2618Neg, preco_atual);
                var fibo_d4236 = estaProximoDaLinha(cryptSymbol, fiboRetrac.retr3236Neg, preco_atual);
        
                */

                //console.log("PSAR", pSar);
                //console.log("PSAR2", pSar2);
                //console.log("");
                console.log(`<<---[${cryptSymbol}]--->>`);
                console.log("");

                //console.log("resTend15m:", resTend15m);
                console.log("resTend1h:", resTend1h);
                //console.log("resTend4h:", resTend4h);
                console.log("");

                //console.log("sma5m50p.preco:", sma5m50p.preco);
                //console.log("sma5m60p.preco:", sma5m60p.preco);
                //console.log("ema5m50p.preco:", ema5m50p.preco);
                //console.log("ema5m60p.preco:", ema5m60p.preco);

                console.log("");

                //sma5m50p.preco

                console.log("mm4UP: ", mm4UP);
                console.log("mm4DW: ", mm4DW);

                //console.log("");
                console.log(`<<---[${cryptSymbol}]--->>`);
                console.log("");
                console.log("");


                // if (
                /*
                                (
                
                                    (
                                        (
                                            parseFloat(preco_atual) <= parseFloat(mm4UP.preco)
                                            && parseFloat(preco_atual) >= parseFloat(mm4DW.preco)
                                        )
                                        || (
                                            (
                                                parseFloat(min_anterior_1m) <= parseFloat(mm4UP.preco)
                                                || parseFloat(min_atual_1m) <= parseFloat(mm4UP.preco)
                                            )
                                            && (
                                                parseFloat(max_anterior_1m) >= parseFloat(mm4UP.preco)
                                                || parseFloat(max_atual_1m) >= parseFloat(mm4UP.preco)
                                            )
                
                                            && parseFloat(preco_atual) >= parseFloat(mm4DW.preco)
                                            && parseFloat(sma1m3p.preco) >= parseFloat(sma1m5p.preco)
                
                
                                        )
                                    )
                
                                    && (
                                        parseFloat(stoch15m.k) >= parseFloat(stoch15m.d)
                
                                        || (
                                            parseFloat(stoch15m.k) <= parseFloat(stoch15m.d)
                                            && parseFloat(stoch15mprev.k) >= parseFloat(stoch15mprev.k)
                
                                        )
                
                                    )
                
                                    && (
                                        parseFloat(stoch30m.k) >= parseFloat(stoch30m.d)
                                        || (
                                            parseFloat(stoch30m.k) <= parseFloat(stoch30m.d)
                                            && parseFloat(stoch30mprev.k) >= parseFloat(stoch30mprev.k)
                
                                        )
                
                                    )
                
                                    && (
                                        parseFloat(stoch1h.k) >= parseFloat(stoch1h.d)
                
                                        //|| (
                                            //parseFloat(stoch1h.k) <= parseFloat(stoch1h.d)
                                            //&& parseFloat(stoch1hprev.k) >= parseFloat(stoch1hprev.k)
                    
                                        //)
                
                                    )
                
                                )
                *
                (
                    (
                        parseFloat(min_atual_1m) <= parseFloat(mm4UP.preco) && parseFloat(min_atual_1m) >= parseFloat(mm4DW.preco)
                        // || parseFloat(min_atual_1m) <= parseFloat(mm4UP2.preco) && parseFloat(min_atual_1m) >= parseFloat(mm4DW2.preco)
                        || parseFloat(min_anterior_1m) <= parseFloat(mm4UP.preco) && parseFloat(min_anterior_1m) >= parseFloat(mm4DW.preco)
                        //|| parseFloat(min_anterior_1m) <= parseFloat(mm4UP2.preco) && parseFloat(min_anterior_1m) >= parseFloat(mm4DW2.preco)
                    )
                    && (parseFloat(preco_atual) > parseFloat(mm4UP.preco)
                        //&& parseFloat(preco_atual) > parseFloat(resTend15m.lta.valor)
                        //&& parseFloat(preco_atual) > parseFloat(resTend1h.lta.valor)
                        //&& parseFloat(preco_atual) > parseFloat(resTend4h.lta.valor)
                    )
                    && parseFloat(preco_atual) > parseFloat(preco_anterior_1m)

                    && parseFloat(min_atual_1m) >= parseFloat(min_anterior_1m)
                    //&& parseFloat(min_anterior_1m) >= parseFloat(min_anterior2_1m)

                    && parseFloat(max_atual_1m) >= parseFloat(max_anterior_1m)
                    //&& parseFloat(max_anterior_1m) >= parseFloat(max_anterior2_1m)

                    //&& parseFloat(sma1m3p.preco) >= parseFloat(sma1m5p.preco)
                    //&& parseFloat(ema1m20p.preco) >= parseFloat(ema1m20prev.preco)
                    //&& parseFloat(ema1m25p.preco) >= parseFloat(ema1m25prev.preco)

                )
                */
                /*
                 (
                     (
                         parseFloat(min_atual_3m) <= parseFloat(mm4UP.preco) && parseFloat(min_atual_3m) >= parseFloat(mm4UP.preco)
                         || parseFloat(min_anterior_3m) <= parseFloat(mm4UP.preco) && parseFloat(min_anterior_3m) >= parseFloat(mm4UP.preco)
                         || parseFloat(min_anterior2_3m) <= parseFloat(mm4UP.preco) && parseFloat(min_anterior2_3m) >= parseFloat(mm4UP.preco)
                     )
                     && (parseFloat(preco_atual) > parseFloat(mm4UP.preco)
                         //&& parseFloat(preco_atual) > parseFloat(resTend15m.lta.valor)
                         //&& parseFloat(preco_atual) > parseFloat(resTend1h.lta.valor)
                         //&& parseFloat(preco_atual) > parseFloat(resTend4h.lta.valor)
                     )
 
                     //&& parseFloat(min_atual_3m) >= parseFloat(min_anterior_3m)
                     //&& parseFloat(min_anterior_3m) >= parseFloat(min_anterior2_3m)
 
                     //&& parseFloat(max_atual_3m) >= parseFloat(max_anterior_3m)
                     //&& parseFloat(max_anterior_3m) >= parseFloat(max_anterior2_3m)
 
                     /*
                     && (
                         parseFloat(preco_anterior2_3m) < parseFloat(abertura_anterior2_3m)       //candle vermelho
                         && parseFloat(preco_anterior_3m) > parseFloat(abertura_anterior_3m)       //candle verde
                         && parseFloat(preco_atual) > parseFloat(preco_anterior_3m)
                     )
                     *
 
                 )
                 *
                (
                    (
                        (
                            //(//parseFloat(min_atual_3m) <= parseFloat(resTend1h.lta.valor) // && parseFloat(min_atual_3m) >= parseFloat(resTend1h.lta.valor)
                            //|| 
                          //  parseFloat(min_anterior_5m) <= parseFloat(resTend1h.lta.valor) && parseFloat(max_anterior_5m) >= parseFloat(resTend1h.lta.valor)// && parseFloat(min_anterior_5m) >= parseFloat(resTend1h.lta.valor)
                            //|| parseFloat(min_anterior2_3m) <= parseFloat(resTend1h.lta.valor) // && parseFloat(min_anterior2_3m) >= parseFloat(resTend1h.lta.valor)
                    /*    
                    )
                     && ((
                         parseFloat(preco_anterior2_5m) < parseFloat(abertura_anterior2_5m)       //candle vermelho
                         && parseFloat(preco_anterior_5m) > parseFloat(abertura_anterior_5m))       //candle verde
                        &&((
parseFloat(preco_anterior2_5m) > parseFloat(resTend1h.lta.valor)
                          )

                        && (
                            parseFloat(preco_anterior_5m) > parseFloat(resTend1h.lta.valor))

                        
                            && parseFloat(preco_atual) > parseFloat(resTend1h.lta.valor)
                            //&& parseFloat(preco_atual) > parseFloat(preco_anterior_3m)
                            && parseFloat(preco_atual) > parseFloat(max_anterior_1m)
                        )
                        
                            /*|| (
                                parseFloat(preco_atual) > parseFloat(max_anterior_5m)
                            )*

                        )
                    )
                    */

                /*
                ||
                (
                    (
                        //parseFloat(min_atual_3m) <= parseFloat(resTend1h.ltb.valor) // && parseFloat(min_atual_3m) >= parseFloat(resTend1h.ltb.valor)
                        //|| 
                        parseFloat(min_anterior_5m) <= parseFloat(resTend1h.ltb.valor) && parseFloat(max_anterior_5m) >= parseFloat(resTend1h.ltb.valor) // && parseFloat(min_anterior_5m) >= parseFloat(resTend1h.ltb.valor)
                        //|| parseFloat(min_anterior2_3m) <= parseFloat(resTend1h.ltb.valor) // && parseFloat(min_anterior2_3m) >= parseFloat(resTend1h.ltb.valor)
                    )
                                            &&(
parseFloat(preco_anterior2_5m) < parseFloat(resTend1h.ltb.valor)
                      )
                    && ((
                        parseFloat(preco_anterior_5m) > parseFloat(resTend1h.ltb.valor)

                        && parseFloat(preco_atual) > parseFloat(resTend1h.ltb.valor)
                        //&& parseFloat(preco_atual) > parseFloat(preco_anterior_3m)
                        && parseFloat(preco_atual) > parseFloat(max_anterior_1m))
                        || (
                            parseFloat(preco_atual) > parseFloat(max_anterior_5m)
                        )



                    )
                )
                */


                //)
                if (

                    /* (
                       (parseFloat(min_anterior_3m) <= parseFloat(mm4UP.preco) 
                       && parseFloat(max_anterior_3m) >= parseFloat(mm4UP.preco))
                       || (parseFloat(min_anterior2_3m) <= parseFloat(mm4UP.preco) 
                       && parseFloat(max_anterior2_3m) >= parseFloat(mm4UP.preco))
                     ) 
                     
                     (
                       parseFloat(stoch15m.k) >= parseFloat(stoch15m.d)
                       && parseFloat(stoch5m.k) >= parseFloat(stoch5m.d)
                                                         
                     )
                     
                     && */
                    ((
                        parseFloat(min_anterior_3m) >= parseFloat(mm4DW.preco)
                        && parseFloat(min_anterior_3m) <= parseFloat(mm4UP.preco)
                        && parseFloat(max_anterior_3m) > parseFloat(mm4UP.preco)
                    )
                        || (
                            parseFloat(min_anterior2_3m) >= parseFloat(mm4DW.preco)
                            && parseFloat(min_anterior2_3m) <= parseFloat(mm4UP.preco)
                            && parseFloat(max_anterior2_3m) > parseFloat(mm4UP.preco)
                        ))

                    && ((parseFloat(abertura_anterior_3m) >= parseFloat(mm4UP.preco)
                        && parseFloat(preco_anterior_3m) >= parseFloat(mm4UP.preco))
                        /*&& (parseFloat(abertura_anterior2_3m) >= parseFloat(mm4UP.preco)
                        && parseFloat(preco_anterior2_3m) >= parseFloat(mm4UP.preco))*/
                    )


                    //&& parseFloat(preco_anterior2_5m) < parseFloat(abertura_anterior2_5m)       //candle vermelho
                    //&& parseFloat(preco_anterior_5m) >= parseFloat(abertura_anterior_5m)       //candle verde
                    /*
                    && parseFloat(min_anterior_5m) >= parseFloat(min_anterior2_5m)
                    && parseFloat(max_anterior_5m) > parseFloat(max_anterior2_5m)
                    */
                    && parseFloat(min_anterior_3m) >= parseFloat(min_anterior2_3m)
                    && parseFloat(max_anterior_3m) > parseFloat(max_anterior2_3m)

                    && parseFloat(min_anterior_1m) >= parseFloat(min_anterior2_1m)
                    && parseFloat(max_anterior_1m) > parseFloat(max_anterior2_1m)

                    //&& (parseFloat(preco_anterior2_1m) >= parseFloat(mm4UP.preco)

                    //&& parseFloat(preco_anterior_1m) >= parseFloat(mm4UP.preco))

                    //&& parseFloat(preco_atual) > parseFloat(mm4UP.preco)

                    //&& parseFloat(preco_atual) > parseFloat(max_anterior_1m)

                    && parseFloat(preco_atual) > parseFloat(min_anterior_15m)


                    //if(
                    //parseFloat(preco_atual) > parseFloat(mm4UP.preco)
                    //&& parseFloat(preco_atual) > parseFloat(mm4DW.preco)
                ) {
                    console.log("");
                    console.log("C2A-MMregUPout: ", mm4UP.preco);
                    console.log("");

                    openOrdDir = 'C3';
                    //openOrdDir = 'V';
                    mediaRef = mmUpRef2;
                    mediaPrice = mmUp2.preco;
                    mediaStopRef = mmDownRef;
                    mediaStopPrice = mmDown.preco;

                    console.log('Elite/onOff: ', onOff);
                    console.log('Elite/simulation: ', simulation);

                    if (onOff == 'ON'
                        && simulation == true
                        //&&
                    ) {

                        //await salvarCache(cacheSimul, 'SIMUL');
                        cacheSimul = await carregarCache('SIMUL');

                        var countSimulPos = Object.keys(cryptSymbols).filter(key => cacheSimul[cryptSymbols[key]] !== undefined).length;
                        console.log('Elite/countsimul:', countSimulPos);

                        var positSml = undefined;

                        console.log(`Elite/cacheSimul[${cryptSymbol}]: `, cacheSimul[`${cryptSymbol}`]);

                        if (cacheSimul[`${cryptSymbol}`] !== undefined
                        ) {
                            positSml = cacheSimul[`${cryptSymbol}`].position;
                        }
                        console.log('Elite/positSml:', positSml);

                        if (positSml !== undefined) {
                            flagLockSimul[cryptSymbol] = true;
                        } else {
                            flagLockSimul[cryptSymbol] = false;
                        }
                        console.log(`Elite/flagLockSimul[${cryptSymbol}]:`, flagLockSimul[cryptSymbol]);

                        if (flagLockSimul[cryptSymbol] === false
                            && countSimulPos < process.env.TRDSIMULT
                        ) {
                            simulateOpenPos(preco_atual, cryptSymbol, 'C', pontosMarg);
                            //await timeout(5000);

                        }
                    }
                    if (onOff == 'ON'
                        && simulation == false) {

                        cacheJson[`${cryptSymbol}`] = await carregarCache(cryptSymbol);



                        var countLivePos = Object.keys(position).filter(key => position[key][0] !== undefined).length;
                        console.log('Elite/Livepos:', countLivePos);

                        var positLv = undefined;

                        //console.log(`Elite/cacheJson[${cryptSymbol}]: `, cacheJson[`${cryptSymbol}`]);

                        if (cacheJson[`${cryptSymbol}`] !== undefined
                        ) {

                            if (objSendcalc.positions !== undefined
                            ) {
                                positLv = cacheJson[`${cryptSymbol}`].objSendcalc.positions.find((pos) => pos.symbol === cryptSymbol);
                                console.log('Elite/positionJson:', countLivePos);
                            }
                        }
                        console.log('Elite/positLv:', positLv);

                        if (positLv !== undefined) {
                            flagLockLive[cryptSymbol] = true;
                        } else {
                            flagLockLive[cryptSymbol] = false;

                            var allOpOrd = await api.openOrders(timestamp);

                            if (allOpOrd !== undefined) {
                                console.log('allOpOrd------------------>>>>>', allOpOrd);

                                var contOrdFltrLmt = allOpOrd.filter((trade) => trade.type === 'LIMIT' && trade.side === 'BUY' && trade.symbol == cryptSymbol).length;

                                var contOrdFltrLmtOld = allOpOrd.filter((trade) => trade.type === 'LIMIT' && trade.side === 'BUY' && trade.symbol == cryptSymbol && parseFloat(trade.price) !== parseFloat(mm4UP.preco)).length;

                                var contOrdFltrLmtNew = allOpOrd.filter((trade) => trade.type === 'LIMIT' && trade.side === 'BUY' && trade.symbol == cryptSymbol && parseFloat(trade.price) == parseFloat(mm4UP.preco)).length;


                                var ordFltrLmt = [];

                                if (contOrdFltrLmtNew >= 2
                                    || contOrdFltrLmtOld >= 1) {

                                    if (contOrdFltrLmtNew >= 2) {
                                        ordFltrLmt = allOpOrd.filter((trade) => trade.type === 'LIMIT' && trade.side === 'BUY' && trade.symbol == cryptSymbol && parseFloat(trade.price) == parseFloat(mm4UP.preco));
                                    }

                                    if (contOrdFltrLmtOld >= 1) {
                                        ordFltrLmt = allOpOrd.filter((trade) => trade.type === 'LIMIT' && trade.side === 'BUY' && trade.symbol == cryptSymbol && parseFloat(trade.price) !== parseFloat(mm4UP.preco));
                                    }

                                    console.log('ordFltrLmtBUY------------------>>>>>', ordFltrLmt);

                                    //await timeout(5000);

                                    var closedOrdIdLmt = await api.cancelOrder(cryptSymbol, ordFltrLmt[0].orderId);
                                    console.log('closedOrdIdLmt-------------->>>>>', closedOrdIdLmt);


                                } else if (posit == undefined && contOrdFltrLmtNew == 0
                                    && countLivePos < process.env.TRDSIMULT) {

                                    //await timeout(1000);

                                    var quantity = await getQntbyBalance(preco_atual, cryptSymbol);
                                    var quntPlus = quantity * pontosMarg;

                                    //console.log('max_atual_3m-placeLimitBuy---------------->>>>>', max_atual_3m);

                                    console.log('mm4UP-placeLimitBuy---------------->>>>>', mm4UP.preco);

                                    var orderPositionLimit = await api.newOrderLimit('BUY', timestamp, parseInt(quntPlus), cryptSymbol, parseFloat(mm4UP.preco));

                                    if (orderPositionLimit !== undefined) {

                                        if (cacheJson[`${cryptSymbol}`] !== undefined
                                        ) {
                                            cacheJson[`${cryptSymbol}`].positMaxPercent = parseFloat(0);
                                            cacheJson[`${cryptSymbol}`].positMinPercent = parseFloat(0);
                                            cacheJson[`${cryptSymbol}`].positLimitPercent = parseFloat(0);


                                            cacheJson[`${cryptSymbol}`].flagLock = flagLock;
                                            //cacheJson[`${cryptSymbol}`].objSendcalc.flag = "St03C";
                                            await salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                                            await notificWin(preco_atual, cryptSymbol, 'open', 'C');
                                        }
                                    }
                                    //var stopPriceLmt = min_anterior_15m;
                                    var stopPriceLmt = mm4DW.preco;
                                    var returnLossLmt = await api.newStopLossSell(timestamp, timestamp + "sl", stopPriceLmt, cryptSymbol);
                                    console.log('returnLossLmt-placeLimitBuy---------------->>>>>', returnLossLmt);
                                }
                            }
                        }

                        console.log(`Elite/flagLockLive[${cryptSymbol}]:`, flagLockLive[cryptSymbol]);

                        if (flagLockLive[cryptSymbol] === false
                            && countLivePos < process.env.TRDSIMULT
                        ) {
                            var retOPCompra = undefined;
                            //var retOPCompra = await openPosition("C", preco_atual, pontosMarg, cryptSymbol, timestamp);

                            if (retOPCompra == "OK") {

                                if (cacheJson[`${cryptSymbol}`] !== undefined) {
                                    cacheJson[`${cryptSymbol}`].positMaxPercent = parseFloat(0);
                                    cacheJson[`${cryptSymbol}`].positMinPercent = parseFloat(0);
                                    cacheJson[`${cryptSymbol}`].positLimitPercent = parseFloat(0);


                                    cacheJson[`${cryptSymbol}`].flagLock = flagLock;
                                    cacheJson[`${cryptSymbol}`].objSendcalc.flag = "St03C";
                                    await salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                                }
                            }
                        }
                    }
                    await timeout(7000);
                }

                // if (
                /*
                (

                    (
                        (
                            parseFloat(preco_atual) <= parseFloat(mm4UP.preco)
                            && parseFloat(preco_atual) >= parseFloat(mm4DW.preco)
                        )
                        || (
                            (
                                parseFloat(max_anterior_1m) >= parseFloat(mm4DW.preco)
                                || parseFloat(max_atual_1m) >= parseFloat(mm4DW.preco)
                            )
                            && (
                                parseFloat(min_anterior_1m) <= parseFloat(mm4DW.preco)
                                || parseFloat(min_atual_1m) <= parseFloat(mm4DW.preco)
                            )


                            && parseFloat(preco_atual) <= parseFloat(mm4UP.preco)
                            && parseFloat(sma1m3p.preco) <= parseFloat(sma1m5p.preco)


                        )
                    )

                    && (
                        parseFloat(stoch15m.k) <= parseFloat(stoch15m.d)

                        || (
                            parseFloat(stoch15m.k) >= parseFloat(stoch15m.d)
                            && parseFloat(stoch15mprev.k) <= parseFloat(stoch15mprev.k)

                        )

                    )

                    && (
                        parseFloat(stoch30m.k) <= parseFloat(stoch30m.d)
                        || (
                            parseFloat(stoch30m.k) >= parseFloat(stoch30m.d)
                            && parseFloat(stoch30mprev.k) <= parseFloat(stoch30mprev.k)

                        )

                    )

                    && (
                        parseFloat(stoch1h.k) <= parseFloat(stoch1h.d)

                        //|| (
                            //parseFloat(stoch1h.k) <= parseFloat(stoch1h.d)
                            //&& parseFloat(stoch1hprev.k) >= parseFloat(stoch1hprev.k)
    
                        //)

                    )

                )
                *

                (
                    (
                        parseFloat(max_atual_1m) <= parseFloat(mm4UP.preco) && parseFloat(max_atual_1m) >= parseFloat(mm4DW.preco)
                        //|| parseFloat(max_atual_1m) <= parseFloat(mm4UP2.preco) && parseFloat(max_atual_1m) >= parseFloat(mm4DW2.preco)
                        || parseFloat(max_anterior_1m) <= parseFloat(mmUp.preco) && parseFloat(max_anterior_1m) >= parseFloat(mm4DW.preco)
                        //|| parseFloat(max_anterior_1m) <= parseFloat(mmUp2.preco) && parseFloat(max_anterior_1m) >= parseFloat(mm4DW2.preco)
                    )
                    && (parseFloat(preco_atual) < parseFloat(mm4DW.preco)
                        //&& parseFloat(preco_atual) < parseFloat(resTend15m.lta.valor)
                        //&& parseFloat(preco_atual) < parseFloat(resTend1h.lta.valor)
                        //&& parseFloat(preco_atual) < parseFloat(resTend4h.lta.valor)
                    )
                    && parseFloat(preco_atual) < parseFloat(preco_anterior_1m)

                    && parseFloat(max_atual_1m) <= parseFloat(max_anterior_1m)
                    //&& parseFloat(max_anterior_1m) <= parseFloat(max_anterior2_1m)

                    && parseFloat(min_atual_1m) <= parseFloat(min_anterior_1m)
                    //&& parseFloat(min_anterior_1m) <= parseFloat(min_anterior2_1m)

                    //&& parseFloat(sma1m3p.preco) <= parseFloat(sma1m5p.preco)
                    //&& parseFloat(ema1m20p.preco) <= parseFloat(ema1m20prev.preco)
                    //&& parseFloat(ema1m25p.preco) <= parseFloat(ema1m25prev.preco)

                )
                */
                /*
                                (
                                    (
                                        parseFloat(max_atual_3m) >= parseFloat(mm4DW.preco) && parseFloat(max_atual_3m) <= parseFloat(mm4DW.preco)
                                        || parseFloat(max_anterior_3m) >= parseFloat(mm4DW.preco) && parseFloat(max_anterior_3m) <= parseFloat(mm4DW.preco)
                                        || parseFloat(min_anterior_3m) >= parseFloat(mm4DW.preco) && parseFloat(min_anterior_3m) <= parseFloat(mm4DW.preco)
                                    )
                                    && (parseFloat(preco_atual) < parseFloat(mm4DW.preco)
                                        //&& parseFloat(preco_atual) < parseFloat(resTend15m.lta.valor)
                                        //&& parseFloat(preco_atual) < parseFloat(resTend1h.lta.valor)
                                        //&& parseFloat(preco_atual) < parseFloat(resTend4h.lta.valor)
                                    )
                
                                    //&& parseFloat(min_atual_3m) <= parseFloat(min_anterior_3m)
                                    //&& parseFloat(min_anterior_3m) <= parseFloat(min_anterior2_3m)
                
                                    //&& parseFloat(max_atual_3m) <= parseFloat(max_anterior_3m)
                                    //&& parseFloat(max_anterior_3m) <= parseFloat(max_anterior2_3m)
                
                                    /*
                                    && (
                                        parseFloat(preco_anterior2_3m) > parseFloat(abertura_anterior2_3m)
                                        && parseFloat(preco_anterior_3m) < parseFloat(abertura_anterior_3m)
                                        && parseFloat(preco_atual) < parseFloat(preco_anterior_3m)
                                    )
                                    *
                
                                )
                                */
                /*
                                (
                                    (
                                        (
                                            //parseFloat(max_atual_3m) >= parseFloat(resTend1h.ltb.valor) // && parseFloat(max_atual_3m) <= parseFloat(resTend1h.ltb.valor)
                                            //|| 
                                            parseFloat(max_anterior_5m) >= parseFloat(resTend1h.ltb.valor) && parseFloat(min_anterior_5m) <= parseFloat(resTend1h.ltb.valor) // && parseFloat(max_anterior_5m) <= parseFloat(resTend1h.ltb.valor)
                                            //|| parseFloat(min_anterior_3m) >= parseFloat(resTend1h.ltb.valor) // && parseFloat(min_anterior_3m) <= parseFloat(resTend1h.ltb.valor)
                                        )
                                        
                                     && (
                                         parseFloat(preco_anterior2_5m) > parseFloat(abertura_anterior2_5m)       //candle verde
                                         && parseFloat(preco_anterior_5m) < parseFloat(abertura_anterior_5m))       //candle vermelho
                                        
                                        &&(
                parseFloat(preco_anterior2_5m) < parseFloat(resTend1h.ltb.valor)
                                          )
                                        
                                        && (
                                            parseFloat(preco_anterior_5m) < parseFloat(resTend1h.ltb.valor)
                                            && parseFloat(preco_atual) < parseFloat(resTend1h.ltb.valor)
                                            //&& parseFloat(preco_atual) < parseFloat(preco_anterior_3m)
                                            && parseFloat(preco_atual) < parseFloat(min_anterior_1m)
                                            
                                            /*|| (
                                                parseFloat(preco_atual) < parseFloat(min_anterior_5m)
                                            )*
                
                
                                        )
                                    )
                                    
                                  
                                    /*
                                    ||
                                    (
                                        (
                                            //parseFloat(max_atual_3m) >= parseFloat(resTend1h.lta.valor) // && parseFloat(max_atual_3m) <= parseFloat(resTend1h.lta.valor)
                                            //|| 
                                            parseFloat(max_anterior_5m) >= parseFloat(resTend1h.lta.valor) && parseFloat(min_anterior_5m) <= parseFloat(resTend1h.lta.valor) // && parseFloat(max_anterior_5m) <= parseFloat(resTend1h.lta.valor)
                                            //|| parseFloat(min_anterior_3m) >= parseFloat(resTend1h.lta.valor) // && parseFloat(min_anterior_3m) <= parseFloat(resTend1h.lta.valor)
                                        )
                                                                &&(
                parseFloat(preco_anterior2_5m) > parseFloat(resTend1h.lta.valor)
                                          )
                                        
                                        && (
                                            (parseFloat(preco_anterior_5m) < parseFloat(resTend1h.lta.valor)
                
                                                && parseFloat(preco_atual) < parseFloat(resTend1h.lta.valor)
                                                //&& parseFloat(preco_atual) < parseFloat(preco_anterior_3m)
                                                && parseFloat(preco_atual) < parseFloat(min_anterior_1m))
                                            || (
                                                parseFloat(preco_atual) < parseFloat(min_anterior_5m)
                                            )
                
                
                
                                        )
                                    )
                                    */


                //  )
                if (
                    /*               
                     (
                       (parseFloat(min_anterior_3m) <= parseFloat(mm4DW.preco) 
                       && parseFloat(max_anterior_3m) >= parseFloat(mm4DW.preco))
                       || (parseFloat(min_anterior2_3m) <= parseFloat(mm4DW.preco) 
                       && parseFloat(max_anterior2_3m) >= parseFloat(mm4DW.preco))
                     )
                     
                     (
                       parseFloat(stoch15m.k) <= parseFloat(stoch15m.d)
                       && parseFloat(stoch5m.k) <= parseFloat(stoch5m.d)
                     )
                     
                     && */
                    ((
                        parseFloat(max_anterior_3m) <= parseFloat(mm4UP.preco)
                        && parseFloat(max_anterior_3m) >= parseFloat(mm4DW.preco)
                        && parseFloat(min_anterior_3m) < parseFloat(mm4DW.preco)
                    )
                        /*
                        ||(
                          parseFloat(max_anterior2_3m) <= parseFloat(mm4UP.preco) 
                          && parseFloat(max_anterior2_3m) >= parseFloat(mm4DW.preco) 
                          && parseFloat(min_anterior2_3m) < parseFloat(mm4DW.preco)
                        )
                        */
                    )

                    && ((parseFloat(abertura_anterior_3m) <= parseFloat(mm4DW.preco)
                        && parseFloat(preco_anterior_3m) <= parseFloat(mm4DW.preco))
                        && (parseFloat(abertura_anterior2_3m) <= parseFloat(mm4DW.preco)
                            && parseFloat(preco_anterior2_3m) <= parseFloat(mm4DW.preco))
                    )

                    //&& parseFloat(preco_anterior2_5m) < parseFloat(abertura_anterior2_5m)       //candle vermelho
                    //&& parseFloat(preco_anterior_5m) >= parseFloat(abertura_anterior_5m)       //candle verde
                    /*
                    && parseFloat(min_anterior_5m) < parseFloat(min_anterior2_5m)
                    && parseFloat(max_anterior_5m) <= parseFloat(max_anterior2_5m)
                    */

                    && parseFloat(min_anterior_3m) < parseFloat(min_anterior2_3m)
                    && parseFloat(max_anterior_3m) <= parseFloat(max_anterior2_3m)

                    && parseFloat(min_anterior_1m) < parseFloat(min_anterior2_1m)
                    && parseFloat(max_anterior_1m) <= parseFloat(max_anterior2_1m)

                    //&& (parseFloat(preco_anterior2_1m) <= parseFloat(mm4DW.preco)

                    //&& parseFloat(preco_anterior_1m) <= parseFloat(mm4DW.preco))

                    //&& parseFloat(preco_atual) < parseFloat(mm4DW.preco)

                    //&& parseFloat(preco_atual) < parseFloat(min_anterior_1m)

                    && parseFloat(preco_atual) < parseFloat(max_anterior_15m)

                    //if(
                    //parseFloat(preco_atual) < parseFloat(mm4DW.preco)
                    //&& parseFloat(preco_atual) > parseFloat(mm4DW.preco)
                ) {
                    console.log("");
                    console.log("V2A-MMregDownOut: ", mm4DW.preco);
                    console.log("");

                    openOrdDir = 'V3';
                    //openOrdDir = 'C';
                    mediaRef = mmDownRef2;
                    mediaPrice = mmDown2.preco;
                    mediaStopRef = mmUpRef2;
                    mediaStopPrice = mmUp2.preco;

                    console.log('Elite/onOff: ', onOff);
                    console.log('Elite/simulation: ', simulation);

                    if (onOff == 'ON'
                        && simulation == true
                        //&&
                    ) {

                        //await salvarCache(cacheSimul, 'SIMUL');
                        cacheSimul = await carregarCache('SIMUL');

                        var countSimulPos = Object.keys(cryptSymbols).filter(key => cacheSimul[cryptSymbols[key]] !== undefined).length;
                        console.log('Elite/countsimul:', countSimulPos);

                        var positSml = undefined;

                        console.log(`Elite/cacheSimul[${cryptSymbol}]: `, cacheSimul[`${cryptSymbol}`]);

                        if (cacheSimul[`${cryptSymbol}`] !== undefined
                        ) {
                            positSml = cacheSimul[`${cryptSymbol}`].position;
                        }
                        console.log('Elite/positSml:', positSml);

                        if (positSml !== undefined) {
                            flagLockSimul[cryptSymbol] = true;
                        } else {
                            flagLockSimul[cryptSymbol] = false;
                        }
                        console.log(`Elite/flagLockSimul[${cryptSymbol}]:`, flagLockSimul[cryptSymbol]);

                        if (flagLockSimul[cryptSymbol] === false
                            && countSimulPos < process.env.TRDSIMULT
                        ) {
                            simulateOpenPos(preco_atual, cryptSymbol, 'V', pontosMarg);
                            //await timeout(5000);

                        }
                    }
                    if (onOff == 'ON'
                        && simulation == false) {

                        cacheJson[`${cryptSymbol}`] = await carregarCache(cryptSymbol);

                        var countLivePos = Object.keys(position).filter(key => position[key][0] !== undefined).length;
                        console.log('Elite/Livepos:', countLivePos);

                        var positLv = undefined;

                        //console.log(`Elite/cacheJson[${cryptSymbol}]: `, cacheJson[`${cryptSymbol}`]);

                        if (cacheJson[`${cryptSymbol}`] !== undefined
                        ) {

                            if (objSendcalc.positions !== undefined
                            ) {
                                positLv = cacheJson[`${cryptSymbol}`].objSendcalc.positions.find((pos) => pos.symbol === cryptSymbol);
                                console.log('Elite/positionJson:', countLivePos);
                            }
                        }
                        console.log('Elite/positLv:', positLv);

                        if (positLv !== undefined) {
                            flagLockLive[cryptSymbol] = true;
                        } else {
                            flagLockLive[cryptSymbol] = false;

                            var allOpOrd = await api.openOrders(timestamp);

                            if (allOpOrd !== undefined) {
                                console.log('allOpOrd------------------>>>>>', allOpOrd);

                                var contOrdFltrLmt = allOpOrd.filter((trade) => trade.type === 'LIMIT' && trade.side === 'SELL' && trade.symbol == cryptSymbol).length;

                                var contOrdFltrLmtOld = allOpOrd.filter((trade) => trade.type === 'LIMIT' && trade.side === 'SELL' && trade.symbol == cryptSymbol && parseFloat(trade.price) !== parseFloat(mm4DW.preco)).length;

                                var contOrdFltrLmtNew = allOpOrd.filter((trade) => trade.type === 'LIMIT' && trade.side === 'SELL' && trade.symbol == cryptSymbol && parseFloat(trade.price) == parseFloat(mm4DW.preco)).length;


                                var ordFltrLmt = [];

                                if (contOrdFltrLmtNew >= 2
                                    || contOrdFltrLmtOld >= 1) {

                                    if (contOrdFltrLmtNew >= 2) {
                                        ordFltrLmt = allOpOrd.filter((trade) => trade.type === 'LIMIT' && trade.side === 'SELL' && trade.symbol == cryptSymbol && parseFloat(trade.price) == parseFloat(mm4DW.preco));
                                    }

                                    if (contOrdFltrLmtOld >= 1) {
                                        ordFltrLmt = allOpOrd.filter((trade) => trade.type === 'LIMIT' && trade.side === 'SELL' && trade.symbol == cryptSymbol && parseFloat(trade.price) !== parseFloat(mm4DW.preco));
                                    }

                                    console.log('ordFltrLmtSELL------------------>>>>>', ordFltrLmt);

                                    //await timeout(5000);

                                    var closedOrdIdLmt = await api.cancelOrder(cryptSymbol, ordFltrLmt[0].orderId);
                                    console.log('closedOrdIdLmt-------------->>>>>', closedOrdIdLmt);


                                } else if (posit == undefined && contOrdFltrLmtNew == 0
                                    && countLivePos < process.env.TRDSIMULT) {

                                    //await timeout(1000);

                                    var quantity = await getQntbyBalance(preco_atual, cryptSymbol);
                                    var quntPlus = quantity * pontosMarg;

                                    //console.log('max_atual_3m-placeLimitBuy---------------->>>>>', max_atual_3m);

                                    console.log('mm4DW-placeLimitSELL---------------->>>>>', mm4DW.preco);

                                    var orderPositionLimit = await api.newOrderLimit('SELL', timestamp, parseInt(quntPlus), cryptSymbol, parseFloat(mm4DW.preco));

                                    if (orderPositionLimit !== undefined) {

                                        if (cacheJson[`${cryptSymbol}`] !== undefined
                                        ) {
                                            cacheJson[`${cryptSymbol}`].positMaxPercent = parseFloat(0);
                                            cacheJson[`${cryptSymbol}`].positMinPercent = parseFloat(0);
                                            cacheJson[`${cryptSymbol}`].positLimitPercent = parseFloat(0);


                                            cacheJson[`${cryptSymbol}`].flagLock = flagLock;
                                            //cacheJson[`${cryptSymbol}`].objSendcalc.flag = "St03C";
                                            await salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                                            await notificWin(preco_atual, cryptSymbol, 'open', 'V');
                                        }
                                    }
                                    //var stopPriceLmt = min_anterior_15m;
                                    var stopPriceLmt = mm4UP.preco;
                                    var returnLossLmt = await api.newStopLossBuy(timestamp, timestamp + "sl", stopPriceLmt, cryptSymbol);
                                    console.log('returnLossLmt-placeLimitSell---------------->>>>>', returnLossLmt);
                                }
                            }
                        }

                        console.log(`Elite/flagLockLive[${cryptSymbol}]:`, flagLockLive[cryptSymbol]);

                        if (flagLockLive[cryptSymbol] === false
                            && countLivePos < process.env.TRDSIMULT
                        ) {
                            var retOPCompra = undefined;
                            //var retOPCompra = await openPosition("C", preco_atual, pontosMarg, cryptSymbol, timestamp);

                            if (retOPCompra == "OK") {

                                if (cacheJson[`${cryptSymbol}`] !== undefined) {
                                    cacheJson[`${cryptSymbol}`].positMaxPercent = parseFloat(0);
                                    cacheJson[`${cryptSymbol}`].positMinPercent = parseFloat(0);
                                    cacheJson[`${cryptSymbol}`].positLimitPercent = parseFloat(0);


                                    cacheJson[`${cryptSymbol}`].flagLock = flagLock;
                                    cacheJson[`${cryptSymbol}`].objSendcalc.flag = "St03V";
                                    await salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                                }
                            }
                        }
                    }
                    await timeout(7000);
                }

                cacheJson[`${cryptSymbol}`] = await carregarCache(cryptSymbol);

                if (posit !== undefined) {
                    //console.log("posit: ", posit);
                    //console.log("positSymbol: ", posit.symbol);

                }

                var priceRefOp = {

                    timestamp: timestamp,
                    price: priceRef,
                    priceAT: preco_atual,
                    name: priceRef_name,
                    //zzdir: zigzag.dir,
                    pontos: pontosMarg,
                    plus: 0,
                    momentum: 0.00,
                    momentumPrice: 0.00,
                    stop: -10.00,
                    refMMname: mediaRef,
                    refMMprice: mediaPrice,
                    stopMMname: mediaStopRef,
                    stopMMprice: parseFloat(mediaStopPrice)

                }

                if (cacheJson[`${cryptSymbol}`].priceRefOp !== undefined
                    && cacheJson[`${cryptSymbol}`].priceRefOp !== null
                ) {
                    priceRefOp = cacheJson[`${cryptSymbol}`].priceRefOp;
                }
                //if(){}

                if (/*posit !== undefined 
        && flag !== undefined && flag !== ""
        && cacheJson[`${cryptSymbol}`].priceRefOp !== null
        && cacheJson[`${cryptSymbol}`].priceRefOp !== undefined*/

                    posit !== undefined
                    && posit.symbol == cryptSymbol
                    && flag !== undefined
                    && flag !== ""
                    && cacheJson[`${cryptSymbol}`].priceRefOp !== null
                    && cacheJson[`${cryptSymbol}`].priceRefOp !== undefined
                    && cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname !== undefined

                ) {

                    var margem = Number.parseFloat(posit.positionInitialMargin).toFixed(2);
                    var profit = Number.parseFloat(posit.unrealizedProfit).toFixed(2);

                    var percent = percentage(posit.unrealizedProfit, posit.positionInitialMargin).toFixed(2);
                    var percentAbs = Math.abs(percent);


                    if (flag.charAt(4) === "C") {

                        //update refs

                        if (cacheJson[`${cryptSymbol}`].priceRefOp.refMMname == "" || cacheJson[`${cryptSymbol}`].priceRefOp.refMMname == null) {
                            if (mmDown.preco < mmDown2.preco) {

                                cacheJson[`${cryptSymbol}`].priceRefOp.refMMname = mmDownRef;
                                cacheJson[`${cryptSymbol}`].priceRefOp.refMMprice = mmDown.preco;
                            } else {
                                cacheJson[`${cryptSymbol}`].priceRefOp.refMMname = mmDownRef2;
                                cacheJson[`${cryptSymbol}`].priceRefOp.refMMprice = mmDown2.preco;

                            }

                        }

                        if (mmDown.preco < mmDown2.preco) {

                            cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname = mmDownRef;
                            cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice = parseFloat(mmDown.preco);
                            if (cacheJson[`${cryptSymbol}`] !== undefined) {

                                salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                            }


                        } else {

                            cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname = mmDownRef2;
                            cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice = parseFloat(mmDown2.preco);
                            if (cacheJson[`${cryptSymbol}`] !== undefined) {

                                salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                            }

                        }


                        /*
                        //update refs
                        if (cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname !== mmUpRef && cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname !== mmDownRef) {
            
                            if (cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname == mmUpRef) {
            
                                cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname = mmDownRef;
                                cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice = parseFloat(mmDown.preco);
                                salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
            
                            } else if (cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname == '') {
            
                                cacheJson[`${cryptSymbol}`].priceRefOp.refMMname = mmUpRef;
                                cacheJson[`${cryptSymbol}`].priceRefOp.refMMprice = mmUp.preco;
                                cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname = mmDownRef;
                                cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice = parseFloat(mmDown.preco);
                                salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
            
                            }
                        }
                        */

                        if (cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice !== null) {

                            //if (cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname == mmUpRef2 || cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname == mmDownRef2) {

                            //var atrBuyStop = (parseFloat(posit.entryPrice) - (parseFloat(atr_atual_1m) * 3));
                            //console.log("atrBuyStop: ", atrBuyStop);
                            console.log("percent: ", percent);
                            console.log(`cacheJson[${cryptSymbol}].priceRefOp.stop: `, cacheJson[`${cryptSymbol}`].priceRefOp.stop);

                            if (
                                //ema1m5p.preco < ema1m5prev.preco
                                //parseFloat(preco_atual) < (parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice) - parseFloat('0.0002'))
                                //|| 
                                parseFloat(percent) < parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.stop)
                                && parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(20)
                                && parseFloat(posit.entryPrice) > parseFloat(sma1m20p.preco)


                                //parseFloat(preco_atual) <= parseFloat(atrBuyStop)

                            ) {

                                var tag = 'C:SL';
                                if (cacheJson[`${cryptSymbol}`].priceRefOp == undefined) {
                                    cacheJson[`${cryptSymbol}`].priceRefOp = priceRefOp;
                                }

                                if (cacheJson[`${cryptSymbol}`].priceRefOp !== undefined) {
                                    tag = 'C:SL+' + cacheJson[`${cryptSymbol}`].priceRefOp.pontos + cacheJson[`${cryptSymbol}`].plus;

                                }

                                var retClC0 = null;
                                //retClC0 = await closePosition("C", preco_atual, tag, cryptSymbol);
                                if (retClC0 == "OK") {

                                    if (cacheJson[`${cryptSymbol}`].priceRefOp !== null
                                        && cacheJson[`${cryptSymbol}`].priceRefOp !== undefined
                                    ) {
                                        cacheJson[`${cryptSymbol}`].objMarket.priceRefOp2 = cacheJson[`${cryptSymbol}`].priceRefOp;
                                        //cacheJson[`${cryptSymbol}`].priceRefOp.momentum = parseFloat(0.00);

                                        cacheJson[`${cryptSymbol}`].priceRefOp.stop = parseFloat(-10.00);
                                        cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice = null;
                                    }
                                    flag = "";
                                    if (cacheJson[`${cryptSymbol}`] !== undefined) {
                                        cacheJson[`${cryptSymbol}`].objSendcalc.flag = "";
                                        salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                                    }

                                }
                            }

                            if (
                                //ema1m5p.preco < ema1m5prev.preco
                                //parseFloat(preco_atual) < (parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice) - parseFloat('0.0002'))
                                //|| 
                                //parseFloat(percent) >= parseFloat(60)
                                //parseFloat(preco_atual) <= parseFloat(atrBuyStop)
                                /*
                                (parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.momentum) >= parseFloat(20)
                                    && (
                                        //parseFloat(preco_atual) < (parseFloat(min_anterior_3m)) //- parseFloat(tsVariation))
                                        parseFloat(percent) < parseFloat(0)
                                    ))
        
                                ||
                                */
                                //(
                                /*
                                parseFloat(percent) > parseFloat(0.00)
                                //&& (
                                //parseFloat(posit.entryPrice) <= parseFloat(sma1m20p.preco)
                                //parseFloat(posit.entryPrice) < parseFloat(sma1m100p.preco)
                                //parseFloat(posit.entryPrice) < parseFloat(sma3m20p.preco)
                                //&& parseFloat(posit.entryPrice) < parseFloat(sma3m20p.preco)
                                //|| parseFloat(posit.entryPrice) < parseFloat(sma15m20p.preco)
                                //)
                                && (
                                    //parseFloat(preco_atual) <= parseFloat(sma1m20p.margemInferior)
                                    //parseFloat(preco_atual) <= parseFloat(sma1m100p.margemInferior)
                                    //parseFloat(preco_atual) <= parseFloat(sma1m20p.margemInferior)
                                    parseFloat(preco_atual) <= parseFloat(sma3m20p.margemInferior)
                                    //|| parseFloat(preco_atual) <= parseFloat(sma15m20p.margemInferior)
                                )
        */
                                /*
                                                            //parseFloat(percent) > parseFloat(30.00)
                                                            (parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(30.00)
                                                                && parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) <= parseFloat(70.00)
                                                                && (
                                                                    (parseFloat(posit.entryPrice) < parseFloat(sma3m20p.preco)
                                                                        && parseFloat(preco_atual) <= parseFloat(sma3m20p.preco)
                                                                        //&& parseFloat(sma1m20p.preco) >= parseFloat(mm4DW.preco)
                                
                                                                        //&& parseFloat(sma1m20p.preco) >= parseFloat(sma1m20prev.preco)
                                                                        && parseFloat(posit.entryPrice) > parseFloat(sma5m10p.preco)
                                                                    )
                                
                                                                    || (parseFloat(posit.entryPrice) < parseFloat(sma5m10p.preco)
                                                                        && parseFloat(preco_atual) <= parseFloat(sma5m10p.preco)
                                                                    )
                                
                                                                    || parseFloat(percent) < parseFloat(-5.00)
                                
                                
                                                                ))
                                                            || (
                                                                parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(50.00)
                                                                //&& parseFloat(percent) < parseFloat(20)
                                                                && parseFloat(preco_atual) < parseFloat(sma5m10p.preco)
                                
                                                            )
                                                            || (
                                                                parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(70.00)
                                                                //&& parseFloat(percent) < parseFloat(40)
                                                                && parseFloat(preco_atual) < parseFloat(sma5m10p.preco)
                                
                                                            )
                                                            || (
                                                                parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(100.00)
                                                                //&& parseFloat(percent) < parseFloat(70)
                                                                && parseFloat(preco_atual) < parseFloat(sma5m10p.preco)
                                
                                                            )
                                                            || (
                                                                parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(150.00)
                                                                && parseFloat(percent) < parseFloat(100)
                                                                && parseFloat(preco_atual) < parseFloat(sma5m10p.preco)
                                
                                                            )
                                                            || (
                                                                parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(200.00)
                                                                && parseFloat(percent) < parseFloat(150)
                                                                && parseFloat(preco_atual) < parseFloat(sma5m10p.preco)
                                
                                                            )
                                                            || (
                                                                parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(250.00)
                                                                && parseFloat(percent) < parseFloat(200)
                                                                && parseFloat(preco_atual) < parseFloat(sma5m10p.preco)
                                
                                                            )
                                                            || (
                                                                parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(300.00)
                                                                && parseFloat(percent) < parseFloat(250)
                                                                && parseFloat(preco_atual) < parseFloat(sma5m10p.preco)
                                
                                                            )
                                                            || (
                                                                parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(350.00)
                                                                && parseFloat(percent) < parseFloat(300)
                                                                && parseFloat(preco_atual) < parseFloat(sma5m10p.preco)
                                
                                                            )
                                                            
                                                            || (
                                                                parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(10.00)
                                                                && parseFloat(preco_atual) < parseFloat(min_anterior_5m.preco)
                                
                                                            )
                                                            
                                *
                                
                                
                                                        //)
                                
                                
                                                            (parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(30.00)
                                                                && (
                                                                   parseFloat(percent) < parseFloat(-5.00)
                                
                                
                                                                ))
                                                            || (
                                                                */

                                /*////////////--------------------/////////
                
                                        (parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(350.00)
                                            && (parseFloat(preco_atual) < parseFloat(min_anterior_3m)
                                                || parseFloat(preco_atual) < parseFloat(min_anterior2_3m)
                                                || parseFloat(percent) < parseFloat(300.00)
                
                                            )
                                        )
                                        || (parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(300.00)
                                            && (parseFloat(preco_atual) < parseFloat(min_anterior_3m)
                                                || parseFloat(preco_atual) < parseFloat(min_anterior2_3m)
                                                || parseFloat(percent) < parseFloat(250.00)
                
                                            )
                                        )
                                        || (parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(250.00)
                                            && (parseFloat(preco_atual) < parseFloat(min_anterior_3m)
                                                || parseFloat(preco_atual) < parseFloat(min_anterior2_3m)
                                                || parseFloat(percent) < parseFloat(200.00)
                
                                            )
                                        )
                                        || (parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(200.00)
                                            && ((parseFloat(preco_atual) < parseFloat(min_anterior_3m)
                                                && parseFloat(preco_atual) < parseFloat(min_anterior2_3m))
                                                || parseFloat(percent) < parseFloat(170.00)
                
                                            )
                                        )
                                        || (parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(130.00)
                                            && ((parseFloat(preco_atual) < parseFloat(min_anterior_3m)
                                                && parseFloat(preco_atual) < parseFloat(min_anterior2_3m))
                                                || parseFloat(percent) < parseFloat(100.00)
                
                                            )
                                        )
                                        || (parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(90.00)
                                            && (parseFloat(preco_atual) < parseFloat(min_anterior_3m)
                                                && parseFloat(preco_atual) < parseFloat(min_anterior2_3m)
                                                && parseFloat(percent) < parseFloat(65.00)
                
                                            )
                                        )
                                        || (parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(70.00)
                                            && parseFloat(percent) < parseFloat(40.00)
                                            //&& parseFloat(preco_atual) < parseFloat(min_anterior_30m)
                                            && parseFloat(preco_atual) < parseFloat(min_anterior_5m)
                                        )
                
                                        ////////////--------------------/////////*/
                                /*
                                || (parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(50.00)
                                    //&& parseFloat(percent) < parseFloat(20.00)
                                    //&& parseFloat(preco_atual) < parseFloat(sma5m10p.preco)
                                    //&& parseFloat(preco_atual) < parseFloat(min_anterior_15m)
                                    && parseFloat(preco_atual) < parseFloat(posit.entryPrice)
        
                                )
                                
                                || (parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(20.00)
                                    //&& parseFloat(preco_anterior_5m) < parseFloat(posit.entryPrice)
                                    && parseFloat(preco_atual) < parseFloat(min_anterior_5m)
                                    //&& parseFloat(preco_atual) < parseFloat(min_anterior_30m)
                                    && (
                                        (
                                            //parseFloat(percent) < parseFloat(-10.00)
                                            parseFloat(preco_atual) < parseFloat(posit.entryPrice)
                                        )
                                        || (
                                            parseFloat(preco_atual) < parseFloat(p4Sar2)
                                        )
                                    )
                                )
                                */
                                /*
                                        || (
                
                                            parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(15.00)
                                            //&& parseFloat(preco_atual) < parseFloat(sma15m20p.preco) 
                                            && parseFloat(preco_anterior_3m) > parseFloat(p1Sar2)
                                            && parseFloat(preco_atual) < parseFloat(p1Sar2)
                
                                        )
                                        /*
                                    || (
        
                                        parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(25.00)
                                        && parseFloat(preco_atual) < parseFloat(posit.entryPrice)
                                        && parseFloat(preco_atual) < parseFloat(sma15m20p.preco)
        
                                    )
                                        */

                                /*|| (
        
                                    parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(50.00)
                                    //parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(50.00)
                                    //|| parseFloat(preco_atual) < parseFloat(p3Sar2)
        
                                    /*
            
                                    ||(
                                        parseFloat(stoch3m.k) <= parseFloat(stoch3m.d)
                                        && parseFloat(stoch3m.k) <= parseFloat(80)
                                        && parseFloat(preco_atual) < parseFloat(preco_anterior_3m)
            
                                    )
                                    /
        
                                )*/

                                (
                                    parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(process.env.TAKEPROFIT))

                                /*  || ((parseFloat(percent) <= (parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent)- parseFloat(process.env.RANGE)))
                                 &&(
  parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(20)
                                   ) 
                                  )
                                  */
                                //|| parseFloat(percent) >= parseFloat(40.00)


                                //parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(70.00)

                                //parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(15.00)
                                //parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(25.00)
                                //&& parseFloat(percent) <= parseFloat(cacheJson[`${cryptSymbol}`].positLimitPercent)

                                //&& parseFloat(preco_atual) < parseFloat(posit.entryPrice)


                                //)

                                /*
                                                            || (
                                                                parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(30.00)
                                                                && parseFloat(percent) < parseFloat(0.00)
                                
                                                            )
                                
                                                            /*
                                                            || (
                                                                parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(0.00)                            //parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(50.00)
                                                                && parseFloat(cacheJson[`${cryptSymbol}`].positMinPercent) <= parseFloat(-15.00)
                                                                && parseFloat(preco_atual) < parseFloat(sma5m20p.preco)
                                                                //&& parseFloat(preco_atual) < parseFloat(p1Sar2)
                                                            )
                                                                */
                                || (

                                    parseFloat(cacheJson[`${cryptSymbol}`].positMinPercent) <= parseFloat(process.env.STOPLOSS)
                                    //|| parseFloat(percent) <= parseFloat(-30.00)

                                    //|| parseFloat(preco_atual) <= parseFloat(mm4DW.preco)

                                    //parseFloat(cacheJson[`${cryptSymbol}`].positMinPercent) <= parseFloat(-25.00)
                                    //&& parseFloat(percent) < parseFloat(-30.00)

                                )


                            ) {

                                var tag = 'C:TK';
                                if (cacheJson[`${cryptSymbol}`].priceRefOp == undefined) {
                                    cacheJson[`${cryptSymbol}`].priceRefOp = priceRefOp;
                                }

                                if (cacheJson[`${cryptSymbol}`].priceRefOp !== undefined) {
                                    tag = 'C:TK+' + cacheJson[`${cryptSymbol}`].priceRefOp.pontos + cacheJson[`${cryptSymbol}`].plus;

                                }

                                console.log("tag:", tag);

                                var retClC1 = null;
                                if (posit !== undefined) {
                                    //retClC1 = await closePosition("C", preco_atual, tag, cryptSymbol);
                                }
                                if (retClC1 == "OK") {

                                    if (cacheJson[`${cryptSymbol}`].priceRefOp !== null
                                        && cacheJson[`${cryptSymbol}`].priceRefOp !== undefined
                                    ) {
                                        cacheJson[`${cryptSymbol}`].objMarket.priceRefOp2 = cacheJson[`${cryptSymbol}`].priceRefOp;
                                        //cacheJson[`${cryptSymbol}`].priceRefOp.momentum = parseFloat(0.00);

                                        cacheJson[`${cryptSymbol}`].priceRefOp.stop = parseFloat(-10.00);
                                        cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice = null;
                                    }
                                    flag = "";
                                    if (cacheJson[`${cryptSymbol}`] !== undefined) {
                                        cacheJson[`${cryptSymbol}`].objSendcalc.flag = "";
                                        salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                                    }

                                }
                            }

                            /* } else {
            
            
            
                            */


                            if (
                                //parseFloat(min_anterior_3m) < parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice)
                                //&& parseFloat(preco_atual) < parseFloat(min_anterior_3m)

                                (//(parseFloat(preco_anterior_3m) < parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice))
                                    //&& 
                                    parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.momentum) > parseFloat(0)

                                    // || (parseFloat(min_anterior2_1m) < parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice))
                                )
                                //&& (parseFloat(objSendcalc.stoch30m.k) <= parseFloat(objSendcalc.stoch30mprev.k)
                                //&& (parseFloat(objSendcalc.stoch15m.k) < parseFloat(objSendcalc.stoch15m.d)
                                //&& parseFloat(objSendcalc.stoch15m.k) < parseFloat(objSendcalc.stoch15mprev.k)
                                //|| parseFloat(preco_atual) < parseFloat(mmDown.margemInferior)
                                //)


                            ) {
                                //console.log("");
                                //console.log("----->> CTS0-MMregDown: ", parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice));
                                //console.log("----->> CTS1-Min3: ", (parseFloat(min_anterior_3m) - parseFloat(tsVariation)));
                                //console.log("");


                                var calcDown = null;

                                if (parseFloat(mmDown.preco) <= parseFloat(mmDown2.preco)) {
                                    calcDown = parseFloat(mmDown.preco);
                                } else {
                                    calcDown = parseFloat(mmDown2.preco);
                                }

                                if (
                                    /* 
                                    || (
                                        (parseFloat(min_anterior2_1m) < parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice))
                                        && parseFloat(preco_atual) < (parseFloat(min_anterior_15m) - parseFloat('0.0001'))
                                        //parseFloat(preco_atual) < (parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice) - parseFloat('0.0002'))
            
                                    )
                                    *
                                    (
                                        (parseFloat(preco_anterior_3m) < parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice))
                                        && parseFloat(preco_atual) < (parseFloat(min_anterior_3m) - parseFloat(tsVariation))
                                        //parseFloat(preco_atual) < (parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice) - parseFloat('0.0002'))
        
                                    )
                                    */

                                    parseFloat(preco_atual) < parseFloat(calcDown)


                                ) {

                                    console.log("----->> C:TSMM: ", (parseFloat(calcDown)));

                                    var tag = 'C:TSMM';

                                    if (cacheJson[`${cryptSymbol}`].priceRefOp == undefined
                                        || cacheJson[`${cryptSymbol}`].priceRefOp == null
                                    ) {
                                        cacheJson[`${cryptSymbol}`].priceRefOp = priceRefOp;
                                    }

                                    if (cacheJson[`${cryptSymbol}`].priceRefOp !== undefined
                                        && cacheJson[`${cryptSymbol}`].priceRefOp !== null
                                    ) {
                                        tag = 'C:TSMM+' + cacheJson[`${cryptSymbol}`].priceRefOp.pontos + cacheJson[`${cryptSymbol}`].plus;
                                    }

                                    console.log("tag:", tag);

                                    var retClC2 = null;
                                    //retClC2 = await closePosition("C", preco_atual, tag, cryptSymbol);
                                    if (retClC2 == "OK") {

                                        if (cacheJson[`${cryptSymbol}`].priceRefOp !== null
                                            && cacheJson[`${cryptSymbol}`].priceRefOp !== undefined
                                        ) {
                                            cacheJson[`${cryptSymbol}`].objMarket.priceRefOp2 = cacheJson[`${cryptSymbol}`].priceRefOp;
                                            //cacheJson[`${cryptSymbol}`].priceRefOp.momentum = parseFloat(0.00);

                                            cacheJson[`${cryptSymbol}`].priceRefOp.stop = parseFloat(-10.00);
                                            cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice = null;
                                        }
                                        flag = "";
                                        if (cacheJson[`${cryptSymbol}`] !== undefined) {
                                            cacheJson[`${cryptSymbol}`].objSendcalc.flag = "";
                                            salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                                        }

                                    }
                                }
                            }
                            //}
                        }
                    }

                    if (flag.charAt(4) === "V") {

                        //update refs

                        if (cacheJson[`${cryptSymbol}`].priceRefOp.refMMname == "" || cacheJson[`${cryptSymbol}`].priceRefOp.refMMname == null) {
                            if (parseFloat(mmUp.preco) < parseFloat(mmUp2.preco)) {

                                cacheJson[`${cryptSymbol}`].priceRefOp.refMMname = mmUpRef;
                                cacheJson[`${cryptSymbol}`].priceRefOp.refMMprice = mmUp.preco;
                                if (cacheJson[`${cryptSymbol}`] !== undefined) {

                                    salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                                }

                            } else {
                                cacheJson[`${cryptSymbol}`].priceRefOp.refMMname = mmUpRef2;
                                cacheJson[`${cryptSymbol}`].priceRefOp.refMMprice = mmUp2.preco;
                                if (cacheJson[`${cryptSymbol}`] !== undefined) {

                                    salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                                }

                            }

                        }

                        if (parseFloat(mmUp.preco) < parseFloat(mmUp2.preco)) {

                            cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname = mmUpRef;
                            cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice = parseFloat(mmUp.preco);
                            if (cacheJson[`${cryptSymbol}`] !== undefined) {

                                salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                            }

                        } else {

                            cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname = mmUpRef2;
                            cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice = parseFloat(mmUp2.preco);
                            if (cacheJson[`${cryptSymbol}`] !== undefined) {

                                salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                            }

                        }

                        /*
                        //update refs
                        if (cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname !== mmUpRef && cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname !== mmDownRef) {
            
                            if (cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname == mmDownRef) {
            
                                cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname = mmUpRef;
                                cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice = parseFloat(mmUp.preco);
                                salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
            
            
                            } else if (cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname == '') {
            
                                cacheJson[`${cryptSymbol}`].priceRefOp.refMMname = mmDownRef;
                                cacheJson[`${cryptSymbol}`].priceRefOp.refMMprice = mmDown.preco;
                                cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname = mmUpRef;
                                cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice = parseFloat(mmUp.preco);
                                salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
            
                            }
                        }
                        */
                        if (cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice !== null) {
                            /*
                            if (cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname == mmUpRef2 || cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname == mmDownRef2) {
            
                                var atrSellStop = (parseFloat(posit.entryPrice) + (parseFloat(atr_atual_1m) * 3));
                                console.log("atrSellStop: ", atrSellStop);
                            */

                            console.log("percent: ", percent);
                            console.log(`cacheJson[${cryptSymbol}].priceRefOp.stop: `, cacheJson[`${cryptSymbol}`].priceRefOp.stop);
                            console.log(`cacheJson[${cryptSymbol}].positMaxPercent: `, cacheJson[`${cryptSymbol}`].positMaxPercent);

                            if (//ema1m5p.preco > ema1m5prev.preco
                                //parseFloat(preco_atual) > (parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice) + parseFloat('0.0002'))
                                //|| 
                                (parseFloat(percent) < parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.stop))
                                && parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(20)
                                && parseFloat(posit.entryPrice) < parseFloat(sma1m20p.preco)

                                //parseFloat(preco_atual) >= parseFloat(atrSellStop)

                            ) {

                                var tag = 'V:SL';
                                if (cacheJson[`${cryptSymbol}`].priceRefOp == undefined) {
                                    cacheJson[`${cryptSymbol}`].priceRefOp = priceRefOp;
                                }

                                if (cacheJson[`${cryptSymbol}`].priceRefOp !== undefined) {
                                    tag = 'V:SL+' + cacheJson[`${cryptSymbol}`].priceRefOp.pontos + cacheJson[`${cryptSymbol}`].plus;

                                }

                                var retClV0 = null;
                                //retClV0 = await closePosition("V", preco_atual, tag, cryptSymbol);
                                if (retClV0 == "OK") {

                                    if (cacheJson[`${cryptSymbol}`].priceRefOp !== null
                                        && cacheJson[`${cryptSymbol}`].priceRefOp !== undefined
                                    ) {
                                        cacheJson[`${cryptSymbol}`].objMarket.priceRefOp2 = cacheJson[`${cryptSymbol}`].priceRefOp;
                                        //cacheJson[`${cryptSymbol}`].priceRefOp.momentum = parseFloat(0.00);

                                        cacheJson[`${cryptSymbol}`].priceRefOp.stop = parseFloat(-10.00);
                                        cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice = null;
                                    }
                                    flag = "";
                                    if (cacheJson[`${cryptSymbol}`] !== undefined) {
                                        cacheJson[`${cryptSymbol}`].objSendcalc.flag = "";
                                        salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                                    }

                                }

                            }


                            if (//ema1m5p.preco > ema1m5prev.preco
                                //parseFloat(preco_atual) > (parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice) + parseFloat('0.0002'))
                                //|| 
                                //(parseFloat(percent) > parseFloat(60))

                                //parseFloat(preco_atual) >= parseFloat(atrSellStop)

                                /*
                                (parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.momentum) >= parseFloat(20)
                                    && (
                                        //parseFloat(preco_atual) > (parseFloat(min_anterior_3m)) //+ parseFloat(tsVariation))
                                        parseFloat(percent) < parseFloat(0)
                                    ))
                                ||
                                *
                                (
                                    parseFloat(percent) > parseFloat(0.00)
                                    //&& (
                                    //parseFloat(posit.entryPrice) >= parseFloat(sma1m20p.preco)
                                    //parseFloat(posit.entryPrice) > parseFloat(sma1m100p.preco)
                                    ///parseFloat(posit.entryPrice) > parseFloat(sma3m20p.preco)
                                    //|| parseFloat(posit.entryPrice) > parseFloat(sma15m20p.preco)
                                    //)
                                    && (
                                        //parseFloat(preco_atual) >= parseFloat(sma1m20p.margemSuperior)
        
                                        //parseFloat(preco_atual) >= parseFloat(sma1m20p.margemSuperior)
                                        parseFloat(preco_atual) >= parseFloat(sma3m20p.margemSuperior)
                                        //|| parseFloat(preco_atual) >= parseFloat(sma15m20p.margemSuperior)
                                    )
                                )
        */
                                /*
                                                        //parseFloat(percent) > parseFloat(30.00)
                                                        (parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(30.00)
                                                            && parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) <= parseFloat(70.00)
                                                            && (
                                                                (
                                                                    parseFloat(posit.entryPrice) > parseFloat(sma3m20p.preco)
                                                                    && parseFloat(preco_atual) >= parseFloat(sma3m20p.preco)
                                                                    //&& parseFloat(sma1m20p.preco) <= parseFloat(mm4UP.margemInferior)
                                
                                                                    //&& parseFloat(sma1m20p.preco) >= parseFloat(sma1m20prev.preco)
                                                                    && parseFloat(posit.entryPrice) < parseFloat(sma5m10p.preco)
                                                                )
                                                                || (parseFloat(posit.entryPrice) > parseFloat(sma5m10p.preco)
                                                                    && parseFloat(preco_atual) >= parseFloat(sma5m10p.preco)
                                                                )
                                                                || parseFloat(percent) < parseFloat(-5.00)
                                
                                                            ))
                                                        || (
                                                            parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(50.00)
                                                            //&& parseFloat(percent) < parseFloat(20.00)
                                                            //&& parseFloat(preco_atual) > parseFloat(sma5m10p.preco)
                                
                                                        )
                                                        || (
                                                            parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(70.00)
                                                            //&& parseFloat(percent) < parseFloat(40.00)
                                                            && parseFloat(preco_atual) > parseFloat(sma5m10p.preco)
                                
                                                        )
                                                        || (
                                                            parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(100.00)
                                                            //&& parseFloat(percent) < parseFloat(70.00)
                                                            && parseFloat(preco_atual) > parseFloat(sma5m10p.preco)
                                
                                                        )
                                                        || (
                                                            parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(150.00)
                                                            && parseFloat(percent) < parseFloat(100.00)
                                                            && parseFloat(preco_atual) > parseFloat(sma5m10p.preco)
                                
                                                        )
                                                        || (
                                                            parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(200.00)
                                                            && parseFloat(percent) < parseFloat(150.00)
                                                            && parseFloat(preco_atual) > parseFloat(sma5m10p.preco)
                                
                                                        )
                                                        || (
                                                            parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(250.00)
                                                            && parseFloat(percent) < parseFloat(200.00)
                                                            && parseFloat(preco_atual) > parseFloat(sma5m10p.preco)
                                
                                                        )
                                                        || (
                                                            parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(300.00)
                                                            && parseFloat(percent) < parseFloat(250.00)
                                                            && parseFloat(preco_atual) > parseFloat(sma5m10p.preco)
                                
                                                        )
                                                        || (
                                                            parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(350.00)
                                                            && parseFloat(percent) < parseFloat(300.00)
                                                            && parseFloat(preco_atual) > parseFloat(sma5m10p.preco)
                                
                                                        )
                                                        
                                                        || (
                                                            parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(10.00)
                                                            && parseFloat(preco_atual) > parseFloat(max_anterior_5m.preco)
                                
                                                        )
                                                        
                                                        */
                                /*///////////--------------------//////////
        
                                (parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(350.00)
                                    && (parseFloat(preco_atual) > parseFloat(max_anterior_3m)
                                        || parseFloat(preco_atual) > parseFloat(max_anterior2_3m)
                                        || parseFloat(percent) < parseFloat(300.00)
        
                                    )
                                )
                                || (parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(300.00)
                                    && (parseFloat(preco_atual) > parseFloat(max_anterior_3m)
                                        || parseFloat(preco_atual) > parseFloat(max_anterior2_3m)
                                        || parseFloat(percent) < parseFloat(250.00)
        
                                    )
                                )
                                || (parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(250.00)
                                    && (parseFloat(preco_atual) > parseFloat(max_anterior_3m)
                                        || parseFloat(preco_atual) > parseFloat(max_anterior2_3m)
                                        || parseFloat(percent) < parseFloat(200.00)
        
                                    )
                                )
                                || (parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(200.00)
                                    && ((parseFloat(preco_atual) > parseFloat(max_anterior_3m)
                                        && parseFloat(preco_atual) > parseFloat(max_anterior2_3m))
                                        || parseFloat(percent) < parseFloat(170.00)
        
                                    )
                                )
                                || (parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(130.00)
                                    && ((parseFloat(preco_atual) > parseFloat(max_anterior_3m)
                                        && parseFloat(preco_atual) > parseFloat(max_anterior2_3m))
                                        || parseFloat(percent) < parseFloat(100.00)
        
                                    )
                                )
                                || (parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(90.00)
                                    && (parseFloat(preco_atual) > parseFloat(max_anterior_3m)
                                        && parseFloat(preco_atual) > parseFloat(max_anterior2_3m)
                                        && parseFloat(percent) < parseFloat(65.00)
        
                                    )
                                )
                                || (parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(70.00)
                                    && parseFloat(percent) < parseFloat(40.00)
                                    //&& parseFloat(preco_atual) > parseFloat(preco_anterior_30m)
                                    && parseFloat(preco_atual) > parseFloat(preco_anterior_5m)
        
        
                                )
                        ////////////--------------------/////////*/

                                /*
                                || (parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(50.00)
                                    //&& parseFloat(percent) < parseFloat(20.00)
                                    //&& parseFloat(preco_atual) > parseFloat(sma5m10p.preco)
                                    //&& parseFloat(preco_atual) > parseFloat(preco_anterior_15m)
                                    && parseFloat(preco_atual) > parseFloat(posit.entryPrice)
        
        
                                )
                                
                                || (parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(20.00)
                                    && parseFloat(percent) < parseFloat(0.00)
                                    //&& parseFloat(preco_anterior_5m) > parseFloat(posit.entryPrice)
                                    //&& parseFloat(preco_atual) > parseFloat(preco_anterior_5m)
                                    //&& parseFloat(preco_atual) > parseFloat(preco_anterior_30m)
                                    && (
                                        (
                                            parseFloat(percent) < parseFloat(-10.00)
                                            //&& parseFloat(preco_atual) > parseFloat(posit.entryPrice)
                                        )
                                        || (
                                            parseFloat(preco_atual) > parseFloat(p4Sar2)
                                        )
                                    )
                                )
                                /*
        
                                || (
        
                                    parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(15.00)
                                    //&& parseFloat(preco_atual) > parseFloat(sma15m20p.preco)
        
                                    && parseFloat(preco_anterior_3m) < parseFloat(p1Sar2)
                                    && parseFloat(preco_atual) > parseFloat(p1Sar2)
        
                                )
        
                                /*
        
                                || (
        
                                    parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(25.00)
        
                                    && parseFloat(preco_atual) > parseFloat(posit.entryPrice)
                                    && parseFloat(preco_atual) > parseFloat(sma15m20p.preco)
        
                                )
        
                                    */

                                /*|| (
        
        
                                    parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(50.00)                            //parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(50.00)
        
                                    //|| parseFloat(preco_atual) > parseFloat(p3Sar2)
                                    /*
        
                                    ||(
        
                                        parseFloat(stoch3m.k) >= parseFloat(stoch3m.d)
                                        && parseFloat(stoch3m.k) >= parseFloat(20)
                                        && parseFloat(preco_atual) > parseFloat(preco_anterior_3m)
        
        
                                    )
        
                                    /
        
                                )*/

                                (
                                    parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(process.env.TAKEPROFIT))
                                /*    || ((parseFloat(percent) <= (parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) - parseFloat(process.env.RANGE)))
   &&(
parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(20)
     )             ) */
                                //|| parseFloat(percent) >= parseFloat(40.00)


                                //parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(70.00)

                                //parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(15.00)
                                //parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(25.00)
                                //&& parseFloat(percent) <= parseFloat(cacheJson[`${cryptSymbol}`].positLimitPercent)

                                //&& parseFloat(preco_atual) < parseFloat(posit.entryPrice)



                                //)

                                /*
                                                            || (
                                                                parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(30.00)
                                                                && parseFloat(percent) < parseFloat(0.00)
                                
                                                            )
                                                            /*
                                                                                    || (
                                                                                        parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(0.00)                            //parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(50.00)
                                                                                        && parseFloat(cacheJson[`${cryptSymbol}`].positMinPercent) <= parseFloat(-10.00)
                                                                                        && parseFloat(preco_atual) > parseFloat(sma5m20p.preco)
                                                                                        //&& parseFloat(preco_atual) > parseFloat(p1Sar2)
                                                                                    )
                                                                                        */
                                || (

                                    parseFloat(cacheJson[`${cryptSymbol}`].positMinPercent) <= parseFloat(process.env.STOPLOSS)
                                    //|| parseFloat(percent) <= parseFloat(-30.00)

                                    //|| parseFloat(preco_atual) <= parseFloat(mm4DW.preco)

                                    //parseFloat(cacheJson[`${cryptSymbol}`].positMinPercent) <= parseFloat(-25.00)
                                    //|| parseFloat(percent) < parseFloat(-20.00)

                                )




                            ) {
                                var tag = 'V:TK';

                                if (cacheJson[`${cryptSymbol}`].priceRefOp == undefined
                                    || cacheJson[`${cryptSymbol}`].priceRefOp == null
                                ) {
                                    cacheJson[`${cryptSymbol}`].priceRefOp = priceRefOp;
                                }

                                if (cacheJson[`${cryptSymbol}`].priceRefOp !== undefined
                                    && cacheJson[`${cryptSymbol}`].priceRefOp !== null
                                ) {
                                    tag = 'V:TK+' + cacheJson[`${cryptSymbol}`].priceRefOp.pontos + cacheJson[`${cryptSymbol}`].plus;
                                }

                                console.log("tag:", tag);

                                var retClV1 = null;
                                if (posit !== undefined) {

                                    //retClV1 = await closePosition("V", preco_atual, tag, cryptSymbol);
                                }
                                if (retClV1 == "OK") {

                                    if (cacheJson[`${cryptSymbol}`].priceRefOp !== null
                                        && cacheJson[`${cryptSymbol}`].priceRefOp !== undefined
                                    ) {
                                        cacheJson[`${cryptSymbol}`].objMarket.priceRefOp2 = cacheJson[`${cryptSymbol}`].priceRefOp;
                                        //cacheJson[`${cryptSymbol}`].priceRefOp.momentum = parseFloat(0.00);

                                        cacheJson[`${cryptSymbol}`].priceRefOp.stop = parseFloat(-10.00);
                                        cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice = null;
                                    }
                                    flag = "";
                                    if (cacheJson[`${cryptSymbol}`] !== undefined) {
                                        cacheJson[`${cryptSymbol}`].objSendcalc.flag = "";
                                        salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                                    }

                                }

                            }

                            /* } else {
                                */
                            if
                                (
                                //parseFloat(max_anterior_3m) > parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice)
                                //&& parseFloat(preco_atual) > parseFloat(max_anterior_3m)

                                (//parseFloat(preco_anterior_3m) > parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice)
                                    //&& 
                                    parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.momentum) > parseFloat(0)
                                    //  || parseFloat(max_anterior2_1m) > parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice)
                                )
                                //&& (parseFloat(objSendcalc.stoch30m.k) >= parseFloat(objSendcalc.stoch30mprev.k)
                                //&& (parseFloat(objSendcalc.stoch15m.k) > parseFloat(objSendcalc.stoch15m.d)
                                //&& parseFloat(objSendcalc.stoch15m.k) > parseFloat(objSendcalc.stoch15mprev.k)
                                //|| parseFloat(preco_atual) > parseFloat(mmUp.margemSuperior)
                                //)

                            ) {
                                //console.log("");
                                //console.log("----->> VTS0-MMregUp: ", parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice));
                                //console.log("----->> VTS1-Max3: ", (parseFloat(max_anterior_3m) + parseFloat(tsVariation)));
                                //console.log("");

                                var calcUp = null;

                                if (parseFloat(mmUp.preco) >= parseFloat(mmUp2.preco)) {
                                    calcUp = parseFloat(mmUp.preco);
                                } else {
                                    calcUp = parseFloat(mmUp2.preco);
                                }


                                if (
                                    /*
                                    || (
                                        parseFloat(max_anterior2_1m) > parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice)
                                        && parseFloat(preco_atual) > (parseFloat(max_anterior_15m) + parseFloat('0.0001'))
                                        //parseFloat(preco_atual) > (parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice) + parseFloat('0.0002'))
            
                                    )
                                    *
                                    (
                                        parseFloat(preco_anterior_3m) > parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice)
                                        && parseFloat(preco_atual) > (parseFloat(max_anterior_3m) + parseFloat(tsVariation))
                                        //parseFloat(preco_atual) > (parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice) + parseFloat('0.0002'))
                                    )
                                    */

                                    parseFloat(preco_atual) > parseFloat(calcUp)
                                ) {

                                    console.log("----->> VTSMM: ", (parseFloat(calcUp)));

                                    var tag = 'V:TSMM';

                                    if (cacheJson[`${cryptSymbol}`].priceRefOp == undefined
                                        || cacheJson[`${cryptSymbol}`].priceRefOp == null
                                    ) {
                                        cacheJson[`${cryptSymbol}`].priceRefOp = priceRefOp;
                                    }

                                    if (cacheJson[`${cryptSymbol}`].priceRefOp !== undefined
                                        && cacheJson[`${cryptSymbol}`].priceRefOp !== null
                                    ) {
                                        tag = 'V:TSMM+' + cacheJson[`${cryptSymbol}`].priceRefOp.pontos + cacheJson[`${cryptSymbol}`].plus;
                                    }

                                    console.log("tag:", tag);
                                    var retClV2 = null;
                                    //retClV2 = await closePosition("V", preco_atual, tag, cryptSymbol);
                                    if (retClV2 == "OK") {

                                        if (cacheJson[`${cryptSymbol}`].priceRefOp !== null
                                            && cacheJson[`${cryptSymbol}`].priceRefOp !== undefined
                                        ) {
                                            cacheJson[`${cryptSymbol}`].objMarket.priceRefOp2 = cacheJson[`${cryptSymbol}`].priceRefOp;
                                            //cacheJson[`${cryptSymbol}`].priceRefOp.momentum = parseFloat(0.00);

                                            cacheJson[`${cryptSymbol}`].priceRefOp.stop = parseFloat(-10.00);
                                            cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice = null;
                                        }
                                        flag = "";
                                        if (cacheJson[`${cryptSymbol}`] !== undefined) {
                                            cacheJson[`${cryptSymbol}`].objSendcalc.flag = "";
                                            salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                                        }
                                    }
                                }
                            }
                            //}
                        }
                    }

                    //cacheJson[`${cryptSymbol}`] = await carregarCache(cryptSymbol);
                }
                /*
                        var priceRefOp = {
                
                            timestamp: timestamp,
                            price: priceRef,
                            priceAT: preco_atual,
                            name: priceRef_name,
                            //zzdir: zigzag.dir,
                            pontos: pontos,
                            plus: 0,
                            momentum: 0.00,
                            momentumPrice: 0.00,
                            stop: -20.00,
                            refMMname: mediaRef,
                            refMMprice: mediaPrice,
                            stopMMname: mediaStopRef,
                            stopMMprice: parseFloat(mediaStopPrice)
                
                        }
                */
                if (posit === undefined
                    //&& (flag === undefined || flag === null || flag === "")
                    && flagLock === true) {

                    flagLock === false;

                }

                var count = null;

                //console.log('position:', positSimul);

                countLivePos = Object.keys(position).filter(key => position[key][0] !== undefined).length;
                console.log('position.length:', countLivePos);

                const countpcrypt2 = Object.keys(cryptSymbols).filter(key => cryptSymbols[key] !== null).length;
                console.log('cryptSymbols.length:', countpcrypt2);
                /*
                            if (countLivePos == countpcrypt) {
                                count = Object.keys(positSimul).filter(key => positSimul[key].length > 0).length;
                            }
                */
                count = countLivePos;
                //countsimul = undefined;
                if (simulation == true) {
                    cacheSimul = await carregarCache('SIMUL');
                    countSimulPos = Object.keys(cryptSymbols).filter(key => cacheSimul[cryptSymbols[key]] !== undefined).length;
                    console.log('countsimul.length:', countSimulPos);

                    count = countSimulPos;
                }
                console.log('count:', count);
                var closedOrd = undefined;
                //if(count !== null && position[`${cryptSymbol}`] == []){
                if (count !== null) {
                    //console.log('position[`${cryptSymbol}`]', positSimul[`${cryptSymbol}`][0]);
                    //if (positSimul[`${cryptSymbol}`][0] == undefined) {
                    if ((positSimul[`${cryptSymbol}`] == undefined
                        && simulation == true)
                        || (posit == [] && simulation == false)) {
                        //console.log('position[`${cryptSymbol}`]', positSimul[`${cryptSymbol}`]);
                        if (simulation == false) {
                            closedOrd = await api.closeAllsltpBySymbol(timestamp, 1000, cryptSymbol);
                            console.log('closedOrd-------A----------->>>>>', closedOrd);
                        }
                    }

                }

                if (count !== null) {
                    if (count < simultPos) {
                        if (
                            openOrdDir == 'V'

                        ) {
                            console.log('');
                            console.log(`Exec: V [${cryptSymbol}]`);

                            console.log('');
                            //await notificWin(preco_atual, cryptSymbol, 'open', 'V');

                            if (timeValidate >= timestamp
                                //timeValidateClose >= timestamp
                            ) {
                                const resultado = calcularTempoRestante(timestamp, timeValidate);
                                //console.log(resultado);

                                console.log('');
                                console.log(`timeValidateClose: Trade fechado ha < 5s, Análise desativada, ${resultado}`);

                                //const timestamp = 1621865434000; // Exemplo de carimbo de data e hora
                                console.log('');

                            } else {

                                if (onOff == 'ON'
                                    //&& estaProximo == true
                                ) {

                                    var positionJson = undefined;
                                    if (objSendcalc.positions !== undefined) {
                                        positionJson = cacheJson[`${cryptSymbol}`].objSendcalc.positions.find((pos) => pos.symbol === cryptSymbol);
                                    }

                                    var positSimul = undefined;
                                    if (cacheSimul[`${cryptSymbol}`] !== undefined) {
                                        positSimul = cacheSimul[`${cryptSymbol}`].position;
                                    }

                                    if ((posit !== undefined && flag !== undefined && flag !== "" && simulation == false)
                                        || (cacheSimul[`${cryptSymbol}`] !== undefined && simulation == true)) {

                                        if ((flag.charAt(4) === "C" && simulation == false)
                                        ) {

                                            var tag = 'C:ReverV';
                                            if (cacheJson[`${cryptSymbol}`].priceRefOp == undefined) {
                                                cacheJson[`${cryptSymbol}`].priceRefOp = priceRefOp;
                                            }

                                            if (cacheJson[`${cryptSymbol}`].priceRefOp !== undefined) {
                                                tag = 'C:ReverV+' + cacheJson[`${cryptSymbol}`].priceRefOp.pontos + cacheJson[`${cryptSymbol}`].plus;

                                            }
                                            var retClC3 = null;
                                            if (simulation == false) {


                                                var retClC3 = undefined;
                                                //retClC3 = await closePosition("C", preco_atual, tag, cryptSymbol);
                                                if (retClC3 == "OK") {

                                                    if (cacheJson[`${cryptSymbol}`].priceRefOp !== null
                                                        && cacheJson[`${cryptSymbol}`].priceRefOp !== undefined
                                                    ) {
                                                        cacheJson[`${cryptSymbol}`].objMarket.priceRefOp2 = cacheJson[`${cryptSymbol}`].priceRefOp;
                                                        //cacheJson[`${cryptSymbol}`].priceRefOp.momentum = parseFloat(0.00);

                                                        cacheJson[`${cryptSymbol}`].priceRefOp.stop = parseFloat(-10.00);
                                                        cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice = null;
                                                    }
                                                    flag = "";
                                                    if (cacheJson[`${cryptSymbol}`] !== undefined) {
                                                        cacheJson[`${cryptSymbol}`].objSendcalc.flag = "";
                                                        salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                                                    }
                                                }

                                                var retOPV3A = undefined;                    //retOPV3A = await openPosition("V", preco_atual, pontosMarg, cryptSymbol, timestamp);
                                                if (retOPV3A == "OK") {

                                                    priceRefOp.name = mediaRef;
                                                    cacheJson[`${cryptSymbol}`].priceRefOp = priceRefOp;
                                                    cacheJson[`${cryptSymbol}`].objMarket.priceRefOp = cacheJson[`${cryptSymbol}`].priceRefOp;
                                                    cacheJson[`${cryptSymbol}`].priceRefOp.timestamp = timestamp;
                                                    cacheJson[`${cryptSymbol}`].plus = 0;
                                                    cacheJson[`${cryptSymbol}`].priceRefOp.refMMname = mediaRef;
                                                    cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname = mediaStopRef;
                                                    cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice = mediaStopPrice;

                                                    if (cacheJson[`${cryptSymbol}`] !== undefined) {
                                                        cacheJson[`${cryptSymbol}`].positMaxPercent = parseFloat(0);
                                                        cacheJson[`${cryptSymbol}`].positMinPercent = parseFloat(0);
                                                        cacheJson[`${cryptSymbol}`].positLimitPercent = parseFloat(0);


                                                        cacheJson[`${cryptSymbol}`].flagLock = flagLock;
                                                        cacheJson[`${cryptSymbol}`].objSendcalc.flag = "St02V";
                                                        salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                                                    }

                                                    await timeout(7000);

                                                }

                                            }
                                        }
                                        if (positSimul !== undefined) {


                                            if (positSimul.side == 'C' && simulation == true
                                            ) {

                                                /*            if (simulation == true) {
                
                                                                var calcTake = parseFloat(positSimul.take);
                                                                var calcStop = parseFloat(positSimul.stop);
                                                                let alav = calcLeverage(cryptSymbol);
                
                                                                //let result = calcPnlFutBinance(positSimul.entryPrice, calcTake, alav, positSimul.qtt, positSimul.side);
                                                                let result = calcPnlFutBinance(positSimul.entryPrice, preco_atual, alav, positSimul.qtt, positSimul.side);
                
                                                                positSimul.pnl = parseFloat(result.pnl);
                                                                positSimul.roi = parseFloat(result.roi);
                
                                                                positSimul.lastUpdate = formatTime(Date.now());
                                                                positSimul.status = "ReverV";
                                                                cacheSimul['Hist']?.push(positSimul) ?? (cacheSimul['Hist'] = [positSimul]);
                                                                //cacheSimul[`${cryptSymbol}`].position = {};
                                                                await notificWin(preco_atual, cryptSymbol, 'smlReverV', 'C');
                
                                                                cacheSimul[`${cryptSymbol}`] = undefined;
                                                                cacheSimul[`WALLET`].coin[0].walletBalance = parseFloat(cacheSimul[`WALLET`].coin[0].walletBalance) + parseFloat(positSimul.pnl);
                                                                cacheSimul[`WALLET`].coin[0].availableBalance = parseFloat(cacheSimul[`WALLET`].coin[0].availableBalance) + parseFloat(positSimul.margemInicial) + parseFloat(positSimul.pnl);
                
                                                                salvarCache(cacheSimul, 'SIMUL');
                
                                                                simulateOpenPos(preco_atual, cryptSymbol, 'V', pontosMarg);
                
                
                                                            }
                                                            */
                                            }
                                        }

                                    } else if (posit === undefined
                                        //&& (flag === undefined || flag === null || flag === "")
                                        //&& cacheJson[`${cryptSymbol}`].priceRefOp == null
                                        && flagLock === false
                                        //&& cacheJson[`${cryptSymbol}`].objSendcalc.positions !== undefined
                                        && !positionJson
                                    ) {
                                        flagLock = true;

                                        var retOPV3 = null;
                                        cacheJson[`${cryptSymbol}`].objSendcalc.flag = "St02V";
                                        cacheJson[`${cryptSymbol}`].positMaxPercent = parseFloat(0);
                                        cacheJson[`${cryptSymbol}`].positMinPercent = parseFloat(0);
                                        cacheJson[`${cryptSymbol}`].positLimitPercent = parseFloat(0);

                                        salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                                        if (simulation == true) {
                                            simulateOpenPos(preco_atual, cryptSymbol, 'V', pontosMarg);
                                        } else if (simulation == false) {
                                            retOPV3 = await openPosition("V", preco_atual, pontosMarg, cryptSymbol, timestamp);
                                        }
                                        if (retOPV3 == "OK") {

                                            priceRefOp.name = mediaRef;
                                            cacheJson[`${cryptSymbol}`].priceRefOp = priceRefOp;
                                            cacheJson[`${cryptSymbol}`].objMarket.priceRefOp = cacheJson[`${cryptSymbol}`].priceRefOp;
                                            cacheJson[`${cryptSymbol}`].priceRefOp.timestamp = timestamp;
                                            cacheJson[`${cryptSymbol}`].plus = 0;
                                            cacheJson[`${cryptSymbol}`].priceRefOp.refMMname = mediaRef;
                                            cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname = mediaStopRef;
                                            cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice = mediaStopPrice;

                                            if (cacheJson[`${cryptSymbol}`] !== undefined) {
                                                cacheJson[`${cryptSymbol}`].positMaxPercent = parseFloat(0);
                                                cacheJson[`${cryptSymbol}`].positMinPercent = parseFloat(0);
                                                cacheJson[`${cryptSymbol}`].positLimitPercent = parseFloat(0);


                                                cacheJson[`${cryptSymbol}`].flagLock = flagLock;
                                                cacheJson[`${cryptSymbol}`].objSendcalc.flag = "St02V";
                                                salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                                            }

                                            await timeout(7000);

                                        }
                                    }
                                }
                            }
                        }

                        if (
                            openOrdDir == 'C'

                        ) {
                            console.log('');
                            console.log(`Exec: C [${cryptSymbol}]`);
                            console.log('');

                            //await notificWin(preco_atual, cryptSymbol, 'open', 'C');

                            if (timeValidate >= timestamp
                                //timeValidateClose >= timestamp
                            ) {
                                const resultado = calcularTempoRestante(timestamp, timeValidate);
                                //console.log(resultado);

                                console.log('');
                                console.log(`timeValidateClose: Trade fechado ha < 5m, Análise desativada, ${resultado}`);

                                //const timestamp = 1621865434000; // Exemplo de carimbo de data e hora
                                console.log('');

                            } else {


                                if (onOff == 'ON'
                                    //&& estaProximo == true
                                ) {

                                    var positionJson = undefined;
                                    if (objSendcalc.positions !== undefined) {
                                        positionJson = cacheJson[`${cryptSymbol}`].objSendcalc.positions.find((pos) => pos.symbol === cryptSymbol);
                                    }

                                    var positSimul = undefined;
                                    if (cacheSimul[`${cryptSymbol}`] !== undefined) {
                                        positSimul = cacheSimul[`${cryptSymbol}`].position;
                                    }

                                    if ((posit !== undefined && flag !== undefined && flag !== "" && simulation == false)
                                        || (cacheSimul[`${cryptSymbol}`] !== undefined && simulation == true)
                                    ) {
                                        if (
                                            (flag.charAt(4) === "V" && simulation == false)
                                        ) {



                                            var tag = 'V:ReverC';
                                            if (cacheJson[`${cryptSymbol}`].priceRefOp == undefined) {
                                                cacheJson[`${cryptSymbol}`].priceRefOp = priceRefOp;
                                            }

                                            if (cacheJson[`${cryptSymbol}`].priceRefOp !== undefined) {
                                                tag = 'V:ReverC+' + cacheJson[`${cryptSymbol}`].priceRefOp.pontos + cacheJson[`${cryptSymbol}`].plus;

                                            }
                                            if (simulation == false) {

                                                var retClV3 = undefined;
                                                //retClV3 = await closePosition("V", preco_atual, tag, cryptSymbol);
                                                if (retClV3 == "OK") {

                                                    if (cacheJson[`${cryptSymbol}`].priceRefOp !== null
                                                        && cacheJson[`${cryptSymbol}`].priceRefOp !== undefined
                                                    ) {
                                                        cacheJson[`${cryptSymbol}`].objMarket.priceRefOp2 = cacheJson[`${cryptSymbol}`].priceRefOp;
                                                        //cacheJson[`${cryptSymbol}`].priceRefOp.momentum = parseFloat(0.00);

                                                        cacheJson[`${cryptSymbol}`].priceRefOp.stop = parseFloat(-10.00);
                                                        cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice = null;
                                                    }
                                                    flag = "";
                                                    if (cacheJson[`${cryptSymbol}`] !== undefined) {
                                                        cacheJson[`${cryptSymbol}`].objSendcalc.flag = "";
                                                        salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                                                    }


                                                }

                                                var retOpC3A = undefined;
                                                //retOpC3A = await openPosition("C", preco_atual, pontosMarg, cryptSymbol, timestamp);
                                                if (retOpC3A == "OK") {

                                                    priceRefOp.name = mediaRef;

                                                    cacheJson[`${cryptSymbol}`].priceRefOp = priceRefOp;
                                                    cacheJson[`${cryptSymbol}`].objMarket.priceRefOp = cacheJson[`${cryptSymbol}`].priceRefOp;
                                                    cacheJson[`${cryptSymbol}`].priceRefOp.timestamp = timestamp;
                                                    cacheJson[`${cryptSymbol}`].plus = 0;
                                                    cacheJson[`${cryptSymbol}`].priceRefOp.refMMname = mediaRef;
                                                    cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname = mediaStopRef;
                                                    cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice = mediaStopPrice;

                                                    if (cacheJson[`${cryptSymbol}`] !== undefined) {

                                                        cacheJson[`${cryptSymbol}`].positMaxPercent = parseFloat(0);
                                                        cacheJson[`${cryptSymbol}`].positMinPercent = parseFloat(0);
                                                        cacheJson[`${cryptSymbol}`].positLimitPercent = parseFloat(0);

                                                        cacheJson[`${cryptSymbol}`].flagLock = flagLock;
                                                        cacheJson[`${cryptSymbol}`].objSendcalc.flag = "St02C";

                                                        salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                                                    }
                                                    await timeout(7000);


                                                }


                                            }
                                        }
                                        if (positSimul !== undefined) {


                                            if (positSimul.side == 'V' && simulation == true
                                            ) {

                                                /*            if (simulation == true) {
                
                                                                var calcTake = parseFloat(positSimul.take);
                                                                var calcStop = parseFloat(positSimul.stop);
                                                                let alav = calcLeverage(cryptSymbol);
                
                
                                                                //let result = calcPnlFutBinance(positSimul.entryPrice, calcTake, alav, positSimul.qtt, positSimul.side);
                                                                let result = calcPnlFutBinance(positSimul.entryPrice, preco_atual, alav, positSimul.qtt, positSimul.side);
                
                                                                positSimul.pnl = parseFloat(result.pnl);
                                                                positSimul.roi = parseFloat(result.roi);
                
                                                                positSimul.lastUpdate = formatTime(Date.now());
                                                                positSimul.status = "ReverC";
                                                                cacheSimul['Hist']?.push(positSimul) ?? (cacheSimul['Hist'] = [positSimul]);
                                                                //cacheSimul[`${cryptSymbol}`].position = {};
                                                                await notificWin(preco_atual, cryptSymbol, 'smlReverC', 'V');
                
                                                                cacheSimul[`${cryptSymbol}`] = undefined;
                                                                cacheSimul[`WALLET`].coin[0].walletBalance = parseFloat(cacheSimul[`WALLET`].coin[0].walletBalance) + parseFloat(positSimul.pnl);
                                                                cacheSimul[`WALLET`].coin[0].availableBalance = parseFloat(cacheSimul[`WALLET`].coin[0].availableBalance) + parseFloat(positSimul.margemInicial) + parseFloat(positSimul.pnl);
                
                                                                salvarCache(cacheSimul, 'SIMUL');
                                                                simulateOpenPos(preco_atual, cryptSymbol, 'C', pontosMarg);
                
                                                            }
                                               */
                                            }
                                        }


                                    } else if (posit === undefined
                                        //&& (flag === undefined || flag === null || flag === "")
                                        && flagLock === false
                                        //&& cacheJson[`${cryptSymbol}`].priceRefOp == null
                                        //&& cacheJson[`${cryptSymbol}`].objSendcalc.positions !== undefined
                                        && !positionJson

                                    ) {
                                        flagLock = true;
                                        var retOpC3 = null;
                                        cacheJson[`${cryptSymbol}`].objSendcalc.flag = "St02C";
                                        cacheJson[`${cryptSymbol}`].positMaxPercent = parseFloat(0);
                                        cacheJson[`${cryptSymbol}`].positMinPercent = parseFloat(0);
                                        cacheJson[`${cryptSymbol}`].positLimitPercent = parseFloat(0);

                                        salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);

                                        if (simulation == true) {
                                            simulateOpenPos(preco_atual, cryptSymbol, 'C', pontosMarg);
                                        } else if (simulation == false) {
                                            retOpC3 = await openPosition("C", preco_atual, pontosMarg, cryptSymbol, timestamp);
                                        }

                                        if (retOpC3 == "OK") {

                                            priceRefOp.name = mediaRef;
                                            cacheJson[`${cryptSymbol}`].priceRefOp = priceRefOp;
                                            cacheJson[`${cryptSymbol}`].objMarket.priceRefOp = cacheJson[`${cryptSymbol}`].priceRefOp;
                                            cacheJson[`${cryptSymbol}`].priceRefOp.timestamp = timestamp;
                                            cacheJson[`${cryptSymbol}`].plus = 0;
                                            cacheJson[`${cryptSymbol}`].priceRefOp.refMMname = mediaRef;
                                            cacheJson[`${cryptSymbol}`].priceRefOp.stopMMname = mediaStopRef;
                                            cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice = mediaStopPrice;

                                            if (cacheJson[`${cryptSymbol}`] !== undefined) {

                                                cacheJson[`${cryptSymbol}`].positMaxPercent = parseFloat(0);
                                                cacheJson[`${cryptSymbol}`].positMinPercent = parseFloat(0);
                                                cacheJson[`${cryptSymbol}`].positLimitPercent = parseFloat(0);

                                                cacheJson[`${cryptSymbol}`].flagLock = flagLock;
                                                cacheJson[`${cryptSymbol}`].objSendcalc.flag = "St02C";

                                                salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                                            }
                                            await timeout(7000);


                                        }

                                    }
                                }
                            }
                        }
                    }
                }
                console.log('');

                if (positSimul !== null
                    && positSimul !== undefined
                    && posit !== undefined
                    //&& position.length !== 0 
                    && positSimul[`${cryptSymbol}`] !== null
                    && positSimul[`${cryptSymbol}`] !== undefined
                    //&& position[`${cryptSymbol}`].length !== 0
                ) {
                    flagLock = false;

                    if (cacheJson[`${cryptSymbol}`].priceRefOp === undefined || cacheJson[`${cryptSymbol}`].priceRefOp === null) {
                        //cacheJson[`${cryptSymbol}`] = await carregarCache(cryptSymbol);

                        cacheJson[`${cryptSymbol}`].priceRefOp = priceRefOp;
                        salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                    } else {

                        await calcRangeProfitLoss(posit, cacheJson[`${cryptSymbol}`], cryptSymbol);


                    }

                    var margem = Number.parseFloat(posit.positionInitialMargin).toFixed(2);
                    var profit = Number.parseFloat(posit.unrealizedProfit).toFixed(2);

                    var percent = percentage(posit.unrealizedProfit, posit.positionInitialMargin).toFixed(2);


                    posCalc = positSimul[`${cryptSymbol}`][0];
                    //await fixFlag(posCalc);  


                    //console.log(`posit-[${cryptSymbol}]--------->>>>>`, posit);

                    if (posit !== undefined
                        && posit.length === 0
                        && posit.symbol !== undefined

                    ) {

                        //console.log("posit: ", posit);

                        //console.log("positSymbol: ", posit.symbol);
                        /*
                                        let precoEntrada = parseFloat(56.876);
                                        let alavancagem = 75;
                                        let margemInicial = 100;
                                        let result = calcularPrecoAlvo(precoEntrada, alavancagem, margemInicial);
                                        if (result !== null) {
                                            console.log(`O preço alvo será: R$ ${result.precoAlvo}`);
                                            console.log(`Quando a margem inicial atingir 150%, o preço será: R$ ${result.margemInicialAtingida}`);
                                        } else {
                                            console.log('Houve um erro no cálculo do preço alvo.');
                                        }
                                            */



                        const userTrades = await api.userTrades(timestamp, cryptSymbol);
                        //const userTrades = [];
                        //console.log('userTrades', userTrades);
                        var userTradesObj = userTrades;


                        if (userTrades !== null && userTrades !== undefined && userTrades.length > 0) {

                            //var historico = criarHistoricoDeTransacoes(userTradesObj, cryptSymbol);
                            //console.log(`CalcPosElite/userTradesObj`, userTradesObj);
                            //console.log(`CalcPosElite/historico`, historico);
                            /*
                                                const filtroPorTime = (time) => {
                                                    return userTradesObj.filter((trade) => trade.time === time);
                                                };
                            
                                                const filtroPorSide = (side) => {
                                                    return userTradesObj.filter((trade) => trade.side === side);
                                                };
                            */
                            const filtroPorTime = (time) => {
                                return userTrades.filter((trade) => trade.time === time).map((trade) => ({
                                    orderId: trade.orderId,
                                    side: trade.side
                                }));
                            };

                            //console.log("userTrades~~~~", userTrades);


                            const objFiltr = filtroPorTime(posit.entryTime)[0];

                            //console.log("filtroPorTime(posit.updateTime)~~~~", filtroPorTime(posit.updateTime));
                            //console.log("objFiltr~~~~", objFiltr);

                            //const side = filtroPorSide(posit.updateTime)[0].side;
                            if (objFiltr !== undefined) { //|| objFiltr !== null) {
                                console.log(`objFiltr~~${cryptSymbol}~~`, objFiltr);
                                //console.log("orderId~~~~", objFiltr.orderId);
                                //console.log("side~~~~", objFiltr.side);
                                await new Promise(resolve => setTimeout(resolve, 5000));
                                //await timeout(5000);
                                var openedOrds = await api.openOrders(timestamp);
                                //console.log('openedOrds------------------>>>>>', openedOrds);

                                var filtrOpenedOrds = undefined;
                                if (openedOrds !== undefined) {
                                    filtrOpenedOrds = (clientOrderId) => {
                                        return openedOrds.filter((ordOps) => parseInt(ordOps.clientOrderId) === parseInt(clientOrderId));
                                    };
                                }
                                var objFiltrOpOrds = undefined;
                                if (objFiltr !== undefined) {
                                    if (typeof filtrOpenedOrds === 'function') {
                                        objFiltrOpOrds = filtrOpenedOrds(objFiltr.orderId)[0];
                                    } else {
                                        console.error('filtrOpenedOrds não é uma função');
                                    }                            //console.log('objFiltrOpOrds------------------>>>>>', objFiltrOpOrds);
                                }

                                //if (objFiltrOpOrds == undefined || objFiltrOpOrds == null) {


                                //var precoMargem50 = precoMargem(posit, cryptSymbol, preco_atual);

                                //var stopPrice = calcularPrecoAlvo("V", -40.0, parseFloat(posit.entryPrice), parseFloat(posit.leverage), parseFloat(posit.initialMargin));
                                //var stopPrice = await calcularPrecoAlvo(objFiltr.side, parseFloat(process.env.STOPLOSS), parseFloat(posit.entryPrice), cryptSymbol);




                                //var stopPrice = await calcularPrecoAlvo(objFiltr.side, parseFloat(process.env.STOPLOSS), parseFloat(posit.entryPrice), cryptSymbol);

                                //var stopPrice = await calcularPrecoAlvo(objFiltr.side, (parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent)- parseFloat(process.env.RANGE)), parseFloat(posit.entryPrice), cryptSymbol);

                                var takePrice = await calcularPrecoAlvo(objFiltr.side, parseFloat(process.env.TAKEPROFIT), parseFloat(posit.entryPrice), cryptSymbol);

                                //parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent)

                                var stopPrice = undefined;

                                var maxSl1m = Math.max(parseFloat(max_anterior2_1m), parseFloat(max_anterior_1m), parseFloat(max_atual_1m));
                                var minSl1m = Math.min(parseFloat(min_anterior2_1m), parseFloat(min_anterior_1m), parseFloat(min_atual_1m));

                                var maxSl3m = Math.max( //parseFloat(max_anterior2_3m), 
                                    parseFloat(max_anterior_3m), parseFloat(max_atual_3m));
                                var minSl3m = Math.min( //parseFloat(min_anterior2_3m), 
                                    parseFloat(min_anterior_3m), parseFloat(min_atual_3m));

                                var maxSl5m = Math.max( //parseFloat(max_anterior2_5m), 
                                    parseFloat(max_anterior_5m), parseFloat(max_atual_5m));
                                var minSl5m = Math.min( //parseFloat(min_anterior2_5m), 
                                    parseFloat(min_anterior_5m), parseFloat(min_atual_5m));

                                var maxSl15 = Math.max(parseFloat(max_anterior_15m), parseFloat(max_anterior2_15m));
                                var minSl15 = Math.min(parseFloat(min_anterior_15m), parseFloat(min_anterior2_15m));

                                if (objFiltr.side == "SELL") {

                                    //if(parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(process.env.TAKEPROFIT)){
                                    stopPrice = parseFloat(mm4UP.preco);
                                    /*
                                  if(parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(5.0)
                                  ){
                                    stopPrice = parseFloat(max_anterior_15m);
                                    
                                    if(parseFloat(max_anterior_15m) < parseFloat(mm4DW.preco)
                                    ){
                                      stopPrice = parseFloat(max_anterior_15m);
                                    }else{
                                      stopPrice = parseFloat(mm4DW.preco);
                                    }
                                    
                                  }
                                  else{
                                    stopPrice = parseFloat(mm4DW.preco);
                                  }
                                  */

                                    if (parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(20.0)
                                    ) {
                                        stopPrice = parseFloat(maxSl5m);
                                        /*
                                        if(parseFloat(maxSl5m) < parseFloat(mm4DW.preco)
                                        ){
                                          stopPrice = parseFloat(maxSl5m);
                                        }else{
                                          stopPrice = parseFloat(mm4DW.preco);
                                        }
                                      }else{
                                        stopPrice = parseFloat(mm4DW.preco);
                                      }
                                      */
                                    }
                                    if (parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(50.0)
                                    ) {
                                        stopPrice = parseFloat(maxSl3m);
                                        /*
                                        if(parseFloat(maxSl3m) < parseFloat(mm4DW.preco)
                                        ){
                                          stopPrice = parseFloat(maxSl3m);
                                        }else{
                                          stopPrice = parseFloat(mm4DW.preco);
                                        }
                                      }else{
                                        stopPrice = parseFloat(mm4DW.preco);
                                      }
                                      */
                                    }
                                } else if (objFiltr.side == "BUY") {
                                    stopPrice = parseFloat(mm4DW.preco);
                                    /*
                                      if(parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(5.0)
                                      ){
                                        stopPrice = parseFloat(min_anterior_15m);
                                        
                                        if(parseFloat(min_anterior_15m) > parseFloat(mm4UP.preco)
                                        ){
                                          stopPrice = parseFloat(min_anterior_15m);
                                        }else{
                                          stopPrice = parseFloat(mm4UP.preco);
                                        }
                                        
                                      }
                                      else{
                                        stopPrice = parseFloat(mm4UP.preco);
                                      }
                                      */
                                    if (parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(20.0)
                                    ) {
                                        stopPrice = parseFloat(minSl5m);
                                        /*
                                        if(parseFloat(minSl5m) > parseFloat(mm4UP.preco)
                                        ){
                                          stopPrice = parseFloat(minSl5m);
                                        }else{
                                          stopPrice = parseFloat(mm4UP.preco);
                                        }
                                        */
                                    }
                                    //else{
                                    //stopPrice = parseFloat(mm4UP.preco);
                                    //}

                                    if (parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent) >= parseFloat(50.0)
                                    ) {

                                        stopPrice = parseFloat(minSl3m);
                                        /*
                                        if(parseFloat(minSl3m) > parseFloat(mm4UP.preco)
                                        ){
                                          stopPrice = parseFloat(minSl3m);
                                        }else{
                                          stopPrice = parseFloat(mm4UP.preco);
                                        }
                                      }
                                      //else{
                                        //stopPrice = parseFloat(mm4UP.preco);
                                      //}
                                      */
                                    }
                                }


                                //var stopPrice = undefined;

                                await timeout(10);
                                var returnLoss = null;
                                //if (stopPrice !== undefined && stopPrice !== null) {

                                var allOpOrd = await api.openOrders(timestamp);
                                if (allOpOrd !== undefined) {
                                    //console.log('allOpOrd------------------>>>>>', allOpOrd);

                                    var contOrdFltrsl = allOpOrd.filter((trade) => trade.type === 'STOP_MARKET' && trade.symbol == cryptSymbol).length;
                                    var ordFltrsl = allOpOrd.filter((trade) => trade.type === 'STOP_MARKET' && trade.symbol == cryptSymbol);

                                    var contOrdFltrslOld = allOpOrd.filter((trade) => trade.type === 'STOP_MARKET' && trade.symbol == cryptSymbol && parseFloat(trade.stopPrice) !== parseInt(stopPrice)).length;
                                    var ordFltrslOld = allOpOrd.filter((trade) => trade.type === 'STOP_MARKET' && trade.symbol == cryptSymbol && parseFloat(trade.stopPrice) !== parseFloat(stopPrice));

                                    var contOrdFltrslNew = allOpOrd.filter((trade) => trade.type === 'STOP_MARKET' && trade.symbol == cryptSymbol && parseFloat(trade.stopPrice) == parseFloat(stopPrice)).length;
                                    var ordFltrslNew = allOpOrd.filter((trade) => trade.type === 'STOP_MARKET' && trade.symbol == cryptSymbol && parseFloat(trade.stopPrice) == parseFloat(stopPrice));

                                    var ordFltrtk = allOpOrd.filter((trade) => trade.type === 'TAKE_PROFIT_MARKET' && trade.symbol == cryptSymbol);

                                    console.log('ordFltrsl------------------>>>>>', ordFltrsl);
                                    console.log('ordFltrtk------------------>>>>>', ordFltrtk);

                                    var closedOrd = null;

                                    console.log('stopPrice------------------>>>>>', stopPrice);

                                    //if(parseFloat(stopPrice) !== parseFloat(ordFltrsl[0].stopPrice)){
                                    if (simulation == false
                                        && contOrdFltrsl !== undefined
                                    ) {
                                        if (contOrdFltrsl == 0
                                            || contOrdFltrslNew == 0
                                        ) {
                                            if (objFiltr.side == "SELL") {

                                                returnLoss = await api.newStopLossBuy(timestamp, timestamp + "sl", stopPrice, cryptSymbol);

                                            } else if (objFiltr.side == "BUY"
                                            ) {

                                                returnLoss = await api.newStopLossSell(timestamp, timestamp + "sl", stopPrice, cryptSymbol);

                                            }
                                        }
                                    }



                                    //} 

                                    if (ordFltrsl[0] !== undefined
                                        //&& ordFltrtk[0] !== undefined
                                        && contOrdFltrslOld >= 0
                                    ) {
                                        var ordFltrsl_oldId = ordFltrsl.filter((trade) => trade.type === 'STOP_MARKET' && parseFloat(trade.stopPrice) !== parseFloat(stopPrice));
                                        console.log('ordFltrsl_oldId---------------->>>>>', ordFltrsl_oldId);
                                        //await timeout(5000);
                                        if (ordFltrsl_oldId[0] !== undefined) {
                                            var closedOrdId = await api.cancelOrder(cryptSymbol, ordFltrsl_oldId[0].orderId);
                                            //console.log('closedOrd-------------->>>>>', closedOrdId);

                                        }

                                        if ((parseFloat(stopPrice) !== parseFloat(ordFltrsl[0].stopPrice)) //|| (parseFloat(takePrice) !== parseFloat(ordFltrtk[0].stopPrice)) 
                                        ) {

                                            if (simulation == false) {
                                                //closedOrd = await api.closeAllsltpBySymbol(timestamp, 1, cryptSymbol);
                                                //console.log('closedOrd-----B------------->>>>>', closedOrd);
                                            }
                                        }


                                        await timeout(500);


                                        //var quantity = await getQntbyBalance(preco_atual, cryptSymbol);
                                        //var qtt = Math.round(quantity) * 10;

                                        if (objFiltr.side == "SELL") {


                                            //var tsMax = Math.max(parseFloat(max_anterior_1m), parseFloat(max_anterior2_1m));

                                            if (parseFloat(stoch5m.k) < parseFloat(stoch5m.d)) {

                                                //tsMax = Math.max(parseFloat(max_anterior_5m), parseFloat(max_anterior2_5m));
                                                //tsMax = Math.max(parseFloat(max_anterior_3m)/*, parseFloat(max_anterior2_1m)*/);
                                            }

                                            if (parseFloat(stoch30m.k) < parseFloat(stoch30m.d)) {
                                                //tsMax = Math.max(parseFloat(max_anterior_5m)/*, parseFloat(max_anterior2_5m)*/);
                                            }


                                            if (parseFloat(mm4DW.preco) < parseFloat(posit.entryPrice)
                                                && parseFloat(preco_atual) > parseFloat(mm4DW.preco)) {
                                                //tsMax = parseFloat(mm4UP2.preco);
                                            }

                                            //stopPrice = await calcularPrecoAlvo(objFiltr.side, -30.0, parseFloat(posit.entryPrice), parseFloat(posit.leverage), parseFloat(posit.initialMargin), cacheJson, cryptSymbol);

                                            //stopPrice = await calcularPrecoAlvo(objFiltr.side, 0.0, parseFloat(tsMax), parseFloat(posit.leverage), /*parseFloat(posit.initialMargin),*/ cacheJson, cryptSymbol);
                                            console.log('stopPriceMax------------------>>>>>', stopPrice);

                                            var slOrdOp = undefined;
                                            if (allOpOrd !== undefined && allOpOrd !== null) {
                                                if (allOpOrd[0] !== undefined && allOpOrd[0] !== null) {

                                                    //var contOrdOp = Object.keys(allOpOrd).filter(key => parseFloat(allOpOrd[key].stopPrice)  !== parseFloat(min_anterior_5m)).length;
                                                    slOrdOp = parseFloat(allOpOrd[0].stopPrice);
                                                    console.log('slOrdOp------------------>>>>>', slOrdOp);

                                                    /*
             
                                                    if (parseFloat(slOrdOp) > parseFloat(stopPrice) && parseFloat(preco_atual) < parseFloat(stopPrice)) {
             
                                                        var closedOrd = await api.closeAllsltpBySymbol(timestamp, 1, cryptSymbol);
                                                        console.log('closedOrd------------------>>>>>', closedOrd);
             
                                                        await timeout(3000);
             
                                                        returnLoss = await api.newStopLossBuy(timestamp, objFiltr.orderId + "sl", stopPrice, cryptSymbol);
                                                        //returnLoss = await api.newStopLossBuy(timestamp, timestamp + "sl", stopPrice, cryptSymbol);
             
                                                        //var returnLossMod = await api.modifyStopLossBuy(timestamp, allOpOrd[0].orderId, stopPrice, cryptSymbol, qtt);
                                                        //console.log('returnLossMod------------------>>>>>', returnLossMod);
             
                                                    }
                                                    */
                                                }
                                            }
                                            //else {
                                        }
                                        //if (allOpOrd == undefined || allOpOrd[0] == undefined /*|| slOrdOp == undefined*/) {



                                        if ((ordFltrsl == undefined || ordFltrsl[0] == undefined) && posit !== undefined) {

                                            if (simulation == false) {
                                                returnLoss = await api.newStopLossBuy(timestamp, timestamp + "sl", stopPrice, cryptSymbol);
                                            }

                                            //returnLoss = await api.newStopLossBuy(timestamp, timestamp + "sl", stopPrice, cryptSymbol);
                                            //returnLoss = await api.modifyStopLossSell(timestamp, allOpOrd[0].orderId, stopPrice, cryptSymbol, qtt);
                                        }

                                    } else if (objFiltr.side == "BUY") {
                                        //var tsMin = Math.min(parseFloat(min_anterior_1m), parseFloat(min_anterior2_1m));

                                        if (parseFloat(stoch5m.k) > parseFloat(stoch5m.d)) {

                                            //tsMin = Math.min(parseFloat(min_anterior_5m), parseFloat(min_anterior2_5m));
                                            //tsMin = Math.min(parseFloat(min_anterior_3m)/*, parseFloat(min_anterior2_3m) */);

                                        }

                                        if (parseFloat(stoch30m.k) > parseFloat(stoch30m.d)) {
                                            //tsMin = Math.min(parseFloat(min_anterior_5m)/*, parseFloat(min_anterior2_5m)*/);
                                        }

                                        if (parseFloat(mm4UP.preco) > parseFloat(posit.entryPrice)
                                            && parseFloat(preco_atual) > parseFloat(mm4UP.preco)) {
                                            //tsMax = parseFloat(mm4DW2.preco);
                                        }

                                        //stopPrice = await calcularPrecoAlvo(objFiltr.side, -30.0, parseFloat(posit.entryPrice), parseFloat(posit.leverage), parseFloat(posit.initialMargin), cacheJson, cryptSymbol);

                                        //stopPrice = await calcularPrecoAlvo(objFiltr.side, 0.0, parseFloat(tsMin), parseFloat(posit.leverage), /*parseFloat(posit.initialMargin), */ cacheJson, cryptSymbol);
                                        console.log('stopPriceMin------------------>>>>>', stopPrice);

                                        var slOrdOp = undefined;
                                        if (allOpOrd !== undefined && allOpOrd !== null) {
                                            if (allOpOrd[0] !== undefined && allOpOrd[0] !== null) {

                                                //var contOrdOp = Object.keys(allOpOrd).filter(key => parseFloat(allOpOrd[key].stopPrice)  !== parseFloat(min_anterior_5m)).length;
                                                slOrdOp = parseFloat(allOpOrd[0].stopPrice);
                                                console.log('slOrdOp------------------>>>>>', slOrdOp);


                                                if (parseFloat(slOrdOp) < parseFloat(stopPrice) && parseFloat(preco_atual) > parseFloat(stopPrice)) {
                                                    //var closedOrd = await api.closeAllsltpBySymbol(timestamp, 1, cryptSymbol);
                                                    //console.log('closedOrd------------------>>>>>', closedOrd);

                                                    await timeout(3000);

                                                    //returnLoss = await api.newStopLossSell(timestamp, objFiltr.orderId + "sl", stopPrice, cryptSymbol);
                                                    ////returnLoss = await api.newStopLossSell(timestamp, timestamp + "sl", stopPrice, cryptSymbol);

                                                    //var returnLossMod = await api.modifyStopLossSell(timestamp, allOpOrd[0].orderId, stopPrice, cryptSymbol, qtt);
                                                    //console.log('returnLossMod------------------>>>>>', returnLossMod);


                                                }

                                            }



                                        }
                                        //if (allOpOrd == undefined || allOpOrd[0] == undefined /*|| slOrdOp == undefined*/) {

                                        if (
                                            ordFltrsl == undefined || ordFltrsl[0] == undefined) {

                                            if (simulation == false) {
                                                //returnLoss = await api.newStopLossSell(timestamp, objFiltr.orderId + "sl", stopPrice, cryptSymbol);
                                            }   /////returnLoss = await api.newStopLossSell(timestamp, timestamp + "sl", stopPrice, cryptSymbol);
                                            // returnLoss = await api.modifyStopLossBuy(timestamp, allOpOrd[0].orderId, stopPrice, cryptSymbol, qtt);

                                        }
                                    }

                                    console.log('returnLoss', returnLoss);



                                }
                                cacheJson[`${cryptSymbol}`].sl = parseFloat(stopPrice);
                                //}

                                console.log('');
                                var takePrice = undefined;
                                if (ordFltrtk[0] == undefined) {

                                    takePrice = await calcularPrecoAlvo(objFiltr.side, parseFloat(process.env.TAKEPROFIT), parseFloat(posit.entryPrice), cryptSymbol);
                                    //takePrice = await calcularPrecoAlvo(objFiltr.side, 15.0, parseFloat(posit.entryPrice), parseFloat(posit.leverage), parseFloat(posit.initialMargin), cacheJson, cryptSymbol);

                                    if (takePrice !== undefined && takePrice !== null) {
                                        await timeout(2000);
                                        var returnTake = null;
                                        if (objFiltr.side == "SELL") {
                                            //returnTake = await api.newTakeProfitBuy(timestamp, objFiltr.orderId + "tk", takePrice, cryptSymbol);
                                            if (simulation == false) {
                                                //returnTake = await api.newTakeProfitBuy(timestamp, timestamp + "tk", takePrice, cryptSymbol);
                                            }
                                        } else if (objFiltr.side == "BUY") {
                                            //returnTake = await api.newTakeProfitSell(timestamp, objFiltr.orderId + "tk", takePrice, cryptSymbol);
                                            if (simulation == false) {
                                                //returnTake = await api.newTakeProfitSell(timestamp, timestamp + "tk", takePrice, cryptSymbol);
                                            }
                                        }
                                        console.log('returnTake', returnTake);
                                        cacheJson[`${cryptSymbol}`].tk = parseFloat(takePrice);
                                    }
                                }
                                /*
                                                    if (cacheJson[`${cryptSymbol}`].tk == undefined) {
                                
                                                        await timeout(2000);
                                                        var returnTake = null;
                                                        if (objFiltr.side == "SELL") {
                                                            returnTake = await api.newTakeProfitBuy(timestamp, objFiltr.orderId, takePrice, cryptSymbol);
                                                        } else if (objFiltr.side == "BUY") {
                                                            returnTake = await api.newTakeProfitSell(timestamp, objFiltr.orderId, takePrice, cryptSymbol);
                                                        }
                                                        console.log('returnTake', returnTake);
                                                        cacheJson[`${cryptSymbol}`].tk = parseFloat(takePrice);
                                
                                                    }else{
                                
                                                        if (cacheJson[`${cryptSymbol}`].tk !== parseFloat(takePrice)) {
                                
                                                            await timeout(2000);
                                                            var returnTake = null;
                                                            if (objFiltr.side == "SELL") {
                                                                returnTake = await api.newTakeProfitBuy(timestamp, objFiltr.orderId, takePrice, cryptSymbol);
                                                            } else if (objFiltr.side == "BUY") {
                                                                returnTake = await api.newTakeProfitSell(timestamp, objFiltr.orderId, takePrice, cryptSymbol);
                                                            }
                                                            console.log('returnTake', returnTake);
                                                            cacheJson[`${cryptSymbol}`].tk = parseFloat(takePrice);
                                    
                                                        }
                                
                                                    }
                                                      */
                                //}
                            }

                            salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);

                        }
                        //console.log('precoMargem50', precoMargem50);

                        //console.log('position',position);

                        if (parseFloat(percent) > parseFloat(cacheJson[`${cryptSymbol}`].positMaxPercent)) {

                            cacheJson[`${cryptSymbol}`].positMaxPercent = percent;
                            salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);


                        }



                        console.log('');

                        console.log(`<<--- calcOPE[${cryptSymbol}] --->>`);

                        console.log(`preco_atual:           ${preco_atual}`);

                        console.log(`entryPrice:            ${posit.entryPrice}`);

                        console.log(`initPosit:             ${margem}`);

                        console.log(`pnl:                   ${profit}`);

                        console.log(`%:                     ${percent}%`);

                        console.log(`flag:                  ${flag}`);

                        console.log(`TakePrice:  ${takePrice}`);
                        console.log(`StopPrice:  ${stopPrice}`);
                        console.log(`mm4UP:  ${mm4UP.preco}`);
                        console.log(`mm4DW:  ${mm4DW.preco}`);
                        //console.log(`max_anterior_30m:  ${max_anterior_30m}`);
                        //console.log(`min_anterior_30m:  ${min_anterior_30m}`);
                        console.log('');
                        //console.log(`maxSl15:  ${maxSl15}`);
                        //console.log(`minSl15:  ${minSl15}`);
                        console.log(`maxSl3m:  ${maxSl3m}`);
                        console.log(`minSl3m:  ${minSl3m}`);
                        console.log('');
                        console.log(`positMaxPercent:`, cacheJson[`${cryptSymbol}`].positMaxPercent);
                        console.log(`positMinPercent:`, cacheJson[`${cryptSymbol}`].positMinPercent);
                        console.log(`positLimitPercent:`, cacheJson[`${cryptSymbol}`].positLimitPercent);

                        console.log('<<--- calcOPE --->>');

                        console.log('');



                        //console.log(`calcStopTake / posit:        ${JSON.stringify(posit)}`);

                        //console.log('');



                    }


                    //var closedOrd = await api.closeAllsltpBySymbol(timestamp, 5000, cryptSymbol);
                    //console.log('closedOrd------------------>>>>>', closedOrd);

                    /*
                    var priceRefOpTest = {
                
                        timestamp: 1707112626090,
                        price: 0.4968,
                        priceAT: 0.4968,
                        name: 'sma4h100p',
                        zzdir: 1,
                        pontos: 2,
                        momentum: 20.00,
                        stop: -20,
                        refMMname: null,
                        stopMMname: null,
                        stopMMprice: ''
                
                    }
                
                    //cacheJson[`${cryptSymbol}`].priceRefOp = priceRefOpTest;
                    //salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);  
                    */

                    cacheJson[`${cryptSymbol}`] = await carregarCache(cryptSymbol);

                    cacheJson[`${cryptSymbol}`].objSendcalc.flag = flag;
                    //console.log("MMstop", parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice));


                    if (cacheJson[`${cryptSymbol}`].priceRefOp !== null
                        && cacheJson[`${cryptSymbol}`].priceRefOp !== undefined) {

                        /*
                                    if (parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.momentum) > parseFloat(percentTake)
                        
                                    ) {
                        
                        
                                        //if (flagpos[`${cryptSymbol}`] == "St00V" || flagpos[`${cryptSymbol}`] == "St01V" || flagpos[`${cryptSymbol}`] == "St02V" || flagpos[`${cryptSymbol}`] == "St00V15m" || flagpos[`${cryptSymbol}`] == "St00V1h" || flagpos[`${cryptSymbol}`] == "St00V4h" || flagpos[`${cryptSymbol}`] == "1mV" || flagpos[`${cryptSymbol}`] == "5mV" || flagpos[`${cryptSymbol}`] == "15mV" || flagpos[`${cryptSymbol}`] == "1hV"){     
                                        if (posit !== undefined
                                            //&& cacheJson[`${cryptSymbol}`] !== undefined
                                            //&& cacheJson[`${cryptSymbol}`].flagpos !== undefined
                                            && flag !== undefined
                                            && flag !== ""
                                        ) {
                                            if (flag.charAt(4) === "V"
                                                && (parseFloat(preco_anterior_1m) > parseFloat(sma1m50prev.preco)
                                                    || parseFloat(preco_atual) > parseFloat(sma1m50p.margemSuperior)
                                                )
                                                && (preco_atual > max_anterior_1m)
                                                //&& (preco_atual > sma1m50p.preco)
                                                //&& (preco_atual > sma1m60p.preco)
                                            ) {
                        
                                                var ret = null;
                                                if (cacheJson[`${cryptSymbol}`].priceRefOp !== null && cacheJson[`${cryptSymbol}`].priceRefOp !== undefined) {
                                                    ret = await closePosition("V", preco_atual, 'V:' + cacheJson[`${cryptSymbol}`].priceRefOp.name + '-TK+' + cacheJson[`${cryptSymbol}`].plus, cryptSymbol);
                                                } else {
                                                    ret = await closePosition("V", preco_atual, 'V:Elite-TK', cryptSymbol);
                                                }
                        
                                                if (ret == "OK") {
                        
                                                    cacheJson[`${cryptSymbol}`].objMarket.priceRefOp2 = cacheJson[`${cryptSymbol}`].priceRefOp;
                                                    //cacheJson[`${cryptSymbol}`].priceRefOp = null;
                                                    flag = "";
                                                    salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                        
                                                    //await CooldownTimer(5);
                        
                                                }
                                            }
                        
                                            if (flag.charAt(4) === "C"
                                                && (parseFloat(preco_anterior_1m) < parseFloat(sma1m50prev.preco)
                                                    || parseFloat(preco_atual) < parseFloat(sma1m50p.margemInferior))
                        
                                                && (preco_atual < min_anterior_1m)
                                                //&& (preco_atual < sma1m50p.preco)
                                                //&& (preco_atual < sma1m60p.preco)
                        
                                            ) {
                                                var ret = null;
                                                if (cacheJson[`${cryptSymbol}`].priceRefOp !== null && cacheJson[`${cryptSymbol}`].priceRefOp !== undefined) {
                                                    ret = await closePosition("C", preco_atual, 'C:' + cacheJson[`${cryptSymbol}`].priceRefOp.name + '-TK+' + cacheJson[`${cryptSymbol}`].plus, cryptSymbol);
                                                } else {
                                                    ret = await closePosition("C", preco_atual, 'C:Elite-TK', cryptSymbol);
                                                }
                        
                                                if (ret == "OK") {
                        
                                                    cacheJson[`${cryptSymbol}`].objMarket.priceRefOp2 = cacheJson[`${cryptSymbol}`].priceRefOp;
                                                    //cacheJson[`${cryptSymbol}`].priceRefOp = null;
                                                    flag = "";
                        
                                                    salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                        
                                                    //await CooldownTimer(5);
                        
                                                }
                        
                                            }
                        
                                        }
                        
                                    }
                        */

                        //console.log("MMstop", parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice));

                        if (posit !== undefined
                            && flag !== undefined
                            && flag !== ""
                            && cacheJson[`${cryptSymbol}`].priceRefOp !== null
                            && (parseFloat(percent) < parseFloat(percentStop)

                                /*
                                || (
                                    //parseFloat(percent) < parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.stop)
                                    //&& 
                
                                    (
                                        (flag.charAt(4) === "V"
                                            && parseFloat(preco_atual) > parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice)
                                        )
                                        || (flag.charAt(4) === "C"
                                            && parseFloat(preco_atual) < parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice)
                
                                        )
                                    )
                
                                )
                
                                /*
                                || (
                
                                    parseFloat(cacheJson[`${cryptSymbol}`].priceRefOp.stop) > parseFloat(-10)
                                    && parseFloat(percent) < parseFloat(-10)
                                )
                                */
                            )


                        ) {
                            if (
                                flag.charAt(4) === "V"
                            ) {
                                var retClV00 = null;
                                if (cacheJson[`${cryptSymbol}`].priceRefOp !== null && cacheJson[`${cryptSymbol}`].priceRefOp !== undefined) {
                                    //retClV00 = await closePosition("V", preco_atual, 'V:SLF+' + cacheJson[`${cryptSymbol}`].priceRefOp.pontos + cacheJson[`${cryptSymbol}`].plus, cryptSymbol);
                                } else {
                                    //retClV00 = await closePosition("V", preco_atual, 'V:Elite-SL', cryptSymbol);
                                }

                                if (retClV00 == "OK") {

                                    if (cacheJson[`${cryptSymbol}`].priceRefOp !== null
                                        && cacheJson[`${cryptSymbol}`].priceRefOp !== undefined
                                    ) {
                                        cacheJson[`${cryptSymbol}`].objMarket.priceRefOp2 = cacheJson[`${cryptSymbol}`].priceRefOp;
                                        //cacheJson[`${cryptSymbol}`].priceRefOp.momentum = parseFloat(0.00);

                                        cacheJson[`${cryptSymbol}`].priceRefOp.stop = parseFloat(-10.00);
                                        cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice = null;
                                    }
                                    flag = "";
                                    if (cacheJson[`${cryptSymbol}`] !== undefined) {
                                        cacheJson[`${cryptSymbol}`].objSendcalc.flag = "";
                                        salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                                    }
                                }

                            }


                            if (
                                flag.charAt(4) === "C"
                            ) {
                                var retClC00 = null;
                                if (cacheJson[`${cryptSymbol}`].priceRefOp !== null && cacheJson[`${cryptSymbol}`].priceRefOp !== undefined) {
                                    //retClC00 = await closePosition("C", preco_atual, 'C:SLF+' + cacheJson[`${cryptSymbol}`].priceRefOp.pontos + cacheJson[`${cryptSymbol}`].plus, cryptSymbol);
                                } else {
                                    //retClC00 = await closePosition("C", preco_atual, 'C:Elite-SL', cryptSymbol);
                                }

                                if (retClC00 == "OK") {

                                    if (cacheJson[`${cryptSymbol}`].priceRefOp !== null
                                        && cacheJson[`${cryptSymbol}`].priceRefOp !== undefined
                                    ) {
                                        cacheJson[`${cryptSymbol}`].objMarket.priceRefOp2 = cacheJson[`${cryptSymbol}`].priceRefOp;
                                        //cacheJson[`${cryptSymbol}`].priceRefOp.momentum = parseFloat(0.00);

                                        cacheJson[`${cryptSymbol}`].priceRefOp.stop = parseFloat(-10.00);
                                        cacheJson[`${cryptSymbol}`].priceRefOp.stopMMprice = null;
                                    }
                                    flag = "";
                                    if (cacheJson[`${cryptSymbol}`] !== undefined) {
                                        cacheJson[`${cryptSymbol}`].objSendcalc.flag = "";
                                        salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                                    }
                                }
                            }

                        }

                    }

                } else {
                    cacheJson[`${cryptSymbol}`].priceRefOp = null;
                    salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
                }
            }
        }
        console.log(`calcOpenPositionElite_end[${cryptSymbol}]`);

    } else {
        console.log('Sem conexão com a internet. Pausando operações...');
    }
}


function encontrarFiboMaisProximo(fibo, preco_entrada) {
    let fiboMaisProximo = fibo[0];
    let diferencaMaisProxima = Math.abs(preco_entrada - fibo[0]);
    let nameMaisProximo = "fibo0";

    var fibo0 = estaProximoDaLinha(cryptSymbol, fibo[0], preco_atual);
    var fibo236 = estaProximoDaLinha(cryptSymbol, fibo[1], preco_atual);
    var fibo382 = estaProximoDaLinha(cryptSymbol, fibo[2], preco_atual);
    var fibo50 = estaProximoDaLinha(cryptSymbol, fibo[3], preco_atual);
    var fibo618 = estaProximoDaLinha(cryptSymbol, fibo[4], preco_atual);
    var fibo786 = estaProximoDaLinha(cryptSymbol, fibo[5], preco_atual);
    var fibo1 = estaProximoDaLinha(cryptSymbol, fibo[6], preco_atual);
    var fibo1618 = estaProximoDaLinha(cryptSymbol, fibo[7], preco_atual);
    var fibo2618 = estaProximoDaLinha(cryptSymbol, fibo[8], preco_atual);
    var fibo3618 = estaProximoDaLinha(cryptSymbol, fibo[9], preco_atual);
    var fibo4236 = estaProximoDaLinha(cryptSymbol, fibo[10], preco_atual);
    var fibo_d1618 = estaProximoDaLinha(cryptSymbol, fibo[11], preco_atual);
    var fibo_d3618 = estaProximoDaLinha(cryptSymbol, fibo[12], preco_atual);
    var fibo_d3618 = estaProximoDaLinha(cryptSymbol, fibo[13], preco_atual);
    var fibo_d4236 = estaProximoDaLinha(cryptSymbol, fibo[14], preco_atual);


    for (let i = 1; i < fibo.length; i++) {
        const diferenca = Math.abs(preco_entrada - fibo[i]);
        if (diferenca < diferencaMaisProxima) {
            fiboMaisProximo = fibo[i];
            diferencaMaisProxima = diferenca;
            nameMaisProximo = "fibo" + i;
        }
    }

    if (fiboMaisProximo == fibo0.preco) {
        nameMaisProximo = "fibo0";
    }
    if (fiboMaisProximo == fibo236.preco) {
        nameMaisProximo = "fibo236";
    }
    if (fiboMaisProximo == fibo382.preco) {
        nameMaisProximo = "fibo382";
    }
    if (fiboMaisProximo == fibo50.preco) {
        nameMaisProximo = "fibo50";
    }
    if (fiboMaisProximo == fibo618.preco) {
        nameMaisProximo = "fibo618";
    }
    if (fiboMaisProximo == fibo786.preco) {
        nameMaisProximo = "fibo786";
    }
    if (fiboMaisProximo == fibo1.preco) {
        nameMaisProximo = "fibo1";
    }
    if (fiboMaisProximo == fibo1618.preco) {
        nameMaisProximo = "fibo1618";
    }
    if (fiboMaisProximo == fibo2618.preco) {
        nameMaisProximo = "fibo2618";
    }
    if (fiboMaisProximo == fibo3618.preco) {
        nameMaisProximo = "fibo3618";
    }
    if (fiboMaisProximo == fibo4236.preco) {
        nameMaisProximo = "fibo4236";
    }
    if (fiboMaisProximo == fibo_d1618.preco) {
        nameMaisProximo = "fibo_d1618";
    }
    if (fiboMaisProximo == fibo_d3618.preco) {
        nameMaisProximo = "fibo_d3618";
    }
    if (fiboMaisProximo == fibo_d3618.preco) {
        nameMaisProximo = "fibo_d3618";
    }
    if (fiboMaisProximo == fibo_d4236.preco) {
        nameMaisProximo = "fibo_d4236";
    }

    return { preco: fiboMaisProximo, name: nameMaisProximo };
}
function calcPnlFutBinance(precoEntrada, precoSaida, alavancagem, tamanhoPosicao, tipoTrade) {
    // 1. Calcular a margem inicial
    const margemInicial = (precoEntrada * tamanhoPosicao) / alavancagem;


    // 2. Calcular o PNL (Lucro ou Perda)
    let pnl;
    if (tipoTrade === 'C') {
        pnl = (precoSaida - precoEntrada) * tamanhoPosicao;
    } else if (tipoTrade === 'V') {
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

async function getQntbyBalance(preco_atual, symbol, simulate = false) {

    console.log('');
    console.log('[ getQntbyBalance_Start ]');

    var cacheJson = [];
    var cacheSimul = [];

    var oldBalance = undefined;

    cacheJson[`${symbol}`] = await carregarCache(cryptSymbol);
    if (cacheJson !== undefined
        && cacheJson[`${symbol}`] !== undefined
        // && cacheJson[`${cryptSymbol}`].oldBalance !== undefined
    ) {

        //oldBalance = cacheJson[`${cryptSymbol}`].oldBalance;
    }

    const carteira = await api.accountFutures(timestamp);

    if (carteira !== undefined) {
        var coin = undefined;

        if (simulate == false) {
            coin = await carteira.assets.filter(b => b.asset === 'USDT'); // || b.asset === 'USDT');
        } else {

            cacheSimul = await carregarCache('SIMUL');
            if (cacheSimul['WALLET'] !== undefined) {
                coin = cacheSimul['WALLET'].coin;

                if (coin[0] == undefined) {
                    coin = await carteira.assets.filter(b => b.asset === 'USDT'); // || b.asset === 'USDT');
                }
            } else {
                coin = await carteira.assets.filter(b => b.asset === 'USDT'); // || b.asset === 'USDT');

            }
        }
        console.log('');
        console.log('[ coin0 ]: ', coin[0]);

        //var symbol = process.env.SYMBOL;
        var maxleverage = await calcLeverage(cryptSymbol);


        /*
                if (symbol == "XMRUSDT" || symbol == "1000PEPEUSDT" || symbol == "KLAYUSDT" || symbol == "FLMUSDT" || symbol == "MTLUSDT" || symbol == "XTZUSDT") {
        
                    maxleverage = 20;
        
                } else if (symbol == "SANDUSDT" || symbol == "VETUSDT" || symbol == "GALAUSDT" || symbol == "DOGSUSDT" || symbol == "MYROUSDT" || symbol == "1000SHIBUSDT" || symbol == "XRPUSDT" || symbol == "UNIUSDT" || symbol == "ADAUSDT" || symbol == "WLDUSDT" || symbol == "KAIAUSDT") {
        
                    maxleverage = 75;
        
                } else if (symbol == "VETUSDT" || symbol == "USTCUSDT" || symbol == "REZUSDT") {
        
                    maxleverage = 50;
        
                } else if (symbol == "BTCUSDT") {
        
                    maxleverage = 125;
        
                }
        */

        var availableBalance = coin[0].availableBalance;
        var balance = coin[0].walletBalance;
        var qnttyX = null;

        if (oldBalance !== undefined) {

            if (oldBalance < balance) {
                balance = oldBalance;
            }
        }



        qnttyX = parseFloat(balance) / 20;
        //qnttyX = parseFloat(availableBalance) / 15;
        //qnttyX = parseFloat(availableBalance);

        //var qntty = Math.round((qnttyX / preco_atual) * maxleverage);
        //var qntty = Math.ceil((qnttyX / preco_atual) * maxleverage);
        var qntty = (qnttyX / preco_atual) * maxleverage;
        if (qntty < 1) {
            qntty = 1;
        }

        console.log('');
        //console.log(`availableBalance: ${availableBalance}`);
        console.log(`symbol: ${symbol}`);
        console.log(`balance: ${balance}`);
        console.log(`qnttyX: ${qnttyX}`);
        console.log(`qntty: ${qntty}`);
        console.log('');

        console.log('[ getQntbyBalance_End ]');

        return qntty;

    } else {

        console.log('[ getQntbyBalance_End ]');

        return null;
    }
}

/**
 * Fun o de callback chamada ap s abertura de uma ordem. Atualiza o cache com a informa o da ordem aberta.
 * @param {object} orderPosition - Informa es da ordem aberta.
 * @returns {string} - "OK".
 */
function callbackOrderOpen(orderPosition) {

    if (orderPosition !== null && orderPosition !== undefined) {

        //await api.newStopBuy(slMin5-0.0001, timestamp);   
        //await api.newTakeBuy(tMax5, timestamp);   
        if (side == "C") {
            flag = "St02C";
        } else if (side == "V") {
            flag = "St02V";
        }

        if (cacheJson[`${cryptSymbol}`].priceRefOp !== null && cacheJson[`${cryptSymbol}`].priceRefOp !== undefined) {
            //flag += "-"+cacheJson[`${cryptSymbol}`].priceRefOp.name;
        }
        //objSendcalc.flag = flag;
        //objSendcalc.flagpos[`${cryptSymbol}`] = flag;
        if (cacheJson[`${cryptSymbol}`].flagpos !== undefined) {
            cacheJson[`${cryptSymbol}`].flagpos[`${cryptSymbol}`] = flag;
        }

        //db.set(db.ref(database, `objData/${cryptSymbol}/log/lastopen${flag}`), orderPosition);

        let orderId = orderPosition.orderId;
        //db.set(db.ref(database, `objData/${cryptSymbol}/log/idOpen${flag}`), orderId);

        let obj = {
            symbol: cryptSymbol,
            initialMargin: "0",
            maintMargin: "0",
            unrealizedProfit: "0.00",
            positionInitialMargin: "0",
            openOrderInitialMargin: "0",
            leverage: "125",
            isolated: true,
            entryPrice: "00000.0",
            maxNotional: "0",
            positionSide: "BOTH",
            positionAmt: "0.000",
            notional: "0.0",
            isolatedWallet: "0.0",
            updateTime: timestamp,
            bidNotional: "0",
            askNotional: "0"
        }

        db.set(db.ref(database, `objData/${cryptSymbol}/positions/${cryptSymbol}`), obj);

        //let pos = await objSendcalc.positions.filter(b => b.symbol === cryptSymbol);
        //objSendcalc.positions[`${cryptSymbol}`] = obj;

        objSendcalc.positions = [];
        objSendcalc.positions[0] = obj;
        //await CooldownTimer(3);

        //cache.set("objSendcalc", objSendcalc);
        cacheJson[`${cryptSymbol}`].objSendcalc = objSendcalc;
        salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);

        /*

        console.log('');
                console.log('StartCoolDown 3m');
                await CooldownTimer(3);
                    console.log('');
                    console.log('EndCoolDown');
        console.log('');

        */

        /*

        console.log('');
        console.log('StartCoolDown 3m');
        //await timeout(900000); // 15m
        await timeout(180000); // 3m
        console.log('EndCoolDown');
        console.log('');

        */

        return "OK";

    }

}

"use strict";
async function openPosition(side, preco_atual, pontos = 1, cryptSymbol, timestamp = Date.now()) {

    timestamp = await Date.now()
    /*
    if(position !== null 
        && position !== undefined 
        //&& position.length !== 0 
        && position[`${cryptSymbol}`] !== null 
        //&& position[`${cryptSymbol}`] !== undefined 
        //&& position[`${cryptSymbol}`].length !== 0
        ){
        var posCalc = position[`${cryptSymbol}`][0];
        await fixFlag(posCalc);
    }
    */


    cacheJson[`${cryptSymbol}`] = await carregarCache(cryptSymbol);

    var flag = cacheJson[`${cryptSymbol}`].objSendcalc.flag;
    var objSendcalc = cacheJson[`${cryptSymbol}`].objSendcalc;

    var oldFlag = flag;
    var orderPosition = undefined;
    var orderPositionStatus = null;
    var quantity = await getQntbyBalance(preco_atual, cryptSymbol);
    var quntPlus = quantity * pontos;
    //var quntPlus = quantity;
    const now = Date.now();

    var mm4UP = cacheJson[`${cryptSymbol}`].objMarket.mm4UP;
    var mm4DW = cacheJson[`${cryptSymbol}`].objMarket.mm4DW;

    var ret = "";
    //if (flag === "" || flag === null || flag === undefined){
    var position = [];
    position[`${cryptSymbol}`] = {};
    var cachePos = await carregarCache('POSITIONS');
    var positions = undefined
    //const timeApi = await api.time();
    //timestamp = timeApi.data.serverTime;
    var carteira = await api.accountFutures(timestamp);

    if (carteira !== undefined) {

        var coin = await carteira.assets.filter(b => b.asset === 'USDT');
        //positions = await carteira.positions.filter(b => b.unrealizedProfit !== '0.00000000'); // || b.asset === 'USDT');
        positions = await carteira.positions.filter(b => b.initialMargin !== '0'); // || b.asset === 'USDT');
        //console.log(`TEST:positions[${cryptSymbol}]:  ${JSON.stringify(positions)}`);
    }
    console.log(`positions[${cryptSymbol}]`, positions);
    if (positions !== undefined) {

        position[`${cryptSymbol}`] = await positions.filter(b => b.symbol == cryptSymbol);
    }

    console.log(`position[${cryptSymbol}]`, position[`${cryptSymbol}`][0]);

    if (position[`${cryptSymbol}`][0] == undefined) {
        if (quantity !== null) {
            if (side == "C") {
                //if (pontos >= 5){
                //orderPosition = await api.newOrderBuy(timestamp, quntPlus);
                orderPosition = await api.newOrderBuy(timestamp, parseInt(quntPlus), cryptSymbol);
                //console.log("orderPositionStatus", orderPositionStatus);
                //}else{
                //orderPosition = await api.newOrderBuy(timestamp, parseInt(quntPlus));
                //}

            } else if (side == "V") {
                //if (pontos <= -5){
                //orderPosition = await api.newOrderSell(timestamp, quntPlus);
                orderPosition = await api.newOrderSell(timestamp, parseInt(quntPlus), cryptSymbol);

                //}else{
                //orderPosition = await api.newOrderSell(timestamp, parseInt(quntPlus));
                //}

            }
        }
    }
    //}


    if (orderPosition !== null && orderPosition !== undefined) {
        if (simulation == false) {
            var closedOrd = await api.closeAllsltpBySymbol(timestamp, 1000, cryptSymbol);
            console.log('closedOrd--------C---------->>>>>', closedOrd);
        }
        let orderId = orderPosition.orderId;
        console.log('orderPosition------------------>>>>>', orderPosition);

        await notificWin(preco_atual, cryptSymbol, 'open', side);

        //rice = await calcularPrecoAlvo(side, parseFloat(process.env.STOPLOSS), parseFloat(preco_atual), cryptSymbol);


        var stopPrice = undefined;
        if (side == "V") {
            stopPrice = parseFloat(mm4UP.preco);
        } else if (side == "C") {
            stopPrice = parseFloat(mm4DW.preco);
        }
        //await api.newStopBuy(slMin5-0.0001, timestamp);   
        //await api.newTakeBuy(tMax5, timestamp);   

        var returnLoss = null;

        if (side == "C") {
            if (simulation == false) {
                returnLoss = await api.newStopLossSell(timestamp, timestamp + "sl", stopPrice, cryptSymbol);
            }
            //stopPrice = await calcularPrecoAlvo("BUY", 30.0, parseFloat(preco_atual), parseFloat(orderPosition.leverage), /*parseFloat(posit.initialMargin),*/ cacheJson, cryptSymbol);
            returnLossOP = await api.newStopLossBuy(timestamp, timestamp + "sl", stopPrice, cryptSymbol);
            console.log('returnLossOP------------------>>>>>', returnLossOP);

            flag = "St02C";
            /*
                        var stopPrice = await calcularPrecoAlvo(side, -40.0, parseFloat(orderPosition.entryPrice), parseFloat(orderPosition.leverage), parseFloat(orderPosition.initialMargin));
                        await timeout(2000);
                        var returnLoss = await api.newStopLossBuy(timestamp, orderId, stopPrice, cryptSymbol);
                        console.log('returnLoss', returnLoss);
            
                        var takePrice = await calcularPrecoAlvo(side, 80.0, parseFloat(orderPosition.entryPrice), parseFloat(orderPosition.leverage), parseFloat(orderPosition.initialMargin));
                        await timeout(2000);
                        var returnTake = await api.newTakeProfitBuy(timestamp, orderId, takePrice, cryptSymbol);
                        console.log('returnTake', returnTake);
            */
        } else if (side == "V") {

            if (simulation == false) {
                //returnLoss = await api.newStopLossBuy(timestamp, orderId + "sl", stopPrice, cryptSymbol);
            }

            //stopPrice = await calcularPrecoAlvo("SELL", 30.0, parseFloat(preco_atual), parseFloat(orderPosition.leverage), /*parseFloat(posit.initialMargin), */ cacheJson, cryptSymbol);
            returnLossOP = await api.newStopLossBuy(timestamp, timestamp + "sl", stopPrice, cryptSymbol);
            console.log('returnLossOP------------------>>>>>', returnLossOP);

            flag = "St02V";
            /*
            console.log("orderPosition: ", orderPosition)
            var stopPrice = calcularPrecoAlvo(side, -40.0, parseFloat(orderPosition.entryPrice), parseFloat(orderPosition.leverage), parseFloat(orderPosition.initialMargin));
            console.log("stopPrice: ", stopPrice)

            await timeout(2000);
            var returnLoss = await api.newStopLossSell(timestamp, orderId, stopPrice, cryptSymbol);
            console.log('returnLoss', returnLoss);

            var takePrice = calcularPrecoAlvo(side, 80.0, parseFloat(orderPosition.entryPrice), parseFloat(orderPosition.leverage), parseFloat(orderPosition.initialMargin));
            await timeout(2000);
            var returnTake = await api.newTakeProfitSell(timestamp, orderId, takePrice, cryptSymbol);
            console.log('returnTake', returnTake);
*/
        }

        if (cacheJson[`${cryptSymbol}`].priceRefOp !== null && cacheJson[`${cryptSymbol}`].priceRefOp !== undefined) {
            //flag += "-"+cacheJson[`${cryptSymbol}`].priceRefOp.name;
        }
        /////////////////objSendcalc.flag = flag;
        //objSendcalc.flagpos[`${cryptSymbol}`] = flag;
        if (cacheJson[`${cryptSymbol}`].flagpos !== undefined) {
            cacheJson[`${cryptSymbol}`].flagpos[`${cryptSymbol}`] = flag;
        }

        //db.set(db.ref(database, `objData/${cryptSymbol}/log/lastopen${flag}`), orderPosition);

        //db.set(db.ref(database, `objData/${cryptSymbol}/log/idOpen${flag}`), orderId);

        let obj = {
            orderId: orderId,
            symbol: cryptSymbol,
            initialMargin: "0",
            maintMargin: "0",
            unrealizedProfit: "0.00",
            positionInitialMargin: "0",
            openOrderInitialMargin: "0",
            leverage: "125",
            isolated: true,
            entryPrice: "00000.0",
            maxNotional: "0",
            positionSide: "BOTH",
            positionAmt: "0.000",
            notional: "0.0",
            isolatedWallet: "0.0",
            entryTime: 0,
            updateTime: timestamp,
            bidNotional: "0",
            askNotional: "0"
        }

        await db.set(db.ref(database, `objData/${cryptSymbol}/positions/${cryptSymbol}`), obj);

        //let histOrd = await createHistObj(orderPosition, cryptSymbol, "tag");

        //await db.set(db.ref(database, `objData/${cryptSymbol}/hist/${orderPosition.orderId}`), histOrd);
        //await db.set(db.ref(database, `rsidata/hist/${orderPosition.orderId}`), histOrd);

        //let pos = await objSendcalc.positions.filter(b => b.symbol === cryptSymbol);
        //objSendcalc.positions[`${cryptSymbol}`] = obj;
        //--//
        objSendcalc.positions = [];
        objSendcalc.positions[0] = obj;
        //--//

        //await CooldownTimer(3);

        //cache.set("objSendcalc", objSendcalc);
        cacheJson[`${cryptSymbol}`].objSendcalc = objSendcalc;
        cacheJson[`${cryptSymbol}`].timeValidate = now + (60 * 1000)
        cacheJson[`${cryptSymbol}`].positMaxPercent = parseFloat(0);
        cacheJson[`${cryptSymbol}`].positMinPercent = parseFloat(0);
        cacheJson[`${cryptSymbol}`].positLimitPercent = parseFloat(0);

        salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);

        //notificWin(preco_atual, cryptSymbol, 'open');

        /*

        console.log('');
                console.log('StartCoolDown 3m');
                await CooldownTimer(3);
                    console.log('');
                    console.log('EndCoolDown');
        console.log('');

        */

        /*

        console.log('');
        console.log('StartCoolDown 3m');
        //await timeout(900000); // 15m
        await timeout(180000); // 3m
        console.log('EndCoolDown');
        console.log('');

        */
        //await timeout(5000); // 5s


    }

    if (oldFlag !== flag) {

        console.log('');
        console.log(`${flag} ABERTO! (${preco_atual})`);
        console.log('');
        //cache.set("objSendcalc", undefined);

    }
    ret = "OK";

    await writeUserData(objSendcalc, cryptSymbol);
    await histFix(timestamp, cryptSymbol);
    await timeout(15000);

    return ret;

}

async function closePosition(position, preco_atual, sufx, cryptSymbol) {

    cacheJson[`${cryptSymbol}`] = await carregarCache(cryptSymbol);

    var objSendcalc = cacheJson[`${cryptSymbol}`].objSendcalc;
    var flag = null;
    var tag = null;

    if (objSendcalc !== undefined) {
        flag = cacheJson[`${cryptSymbol}`].objSendcalc.flag;
    }

    var oldFlag = flag;

    let result = null;

    var quantity = await getQntbyBalance(preco_atual, cryptSymbol);

    var ret = "";
    if (simulation == false) {
        if (quantity !== null) {

            var qtt = quantity * 100;

            if (position == "C") {
                result = await api.closePositionBuy(timestamp, parseInt(qtt), cryptSymbol);

            } else if (position == "V") {
                result = await api.closePositionSell(timestamp, parseInt(qtt), cryptSymbol);
            }

            // correção de sentido caso errada
            if (result === null || result === undefined) {
                if (position == "V") {
                    result = await api.closePositionBuy(timestamp, parseInt(qtt), cryptSymbol);

                } else if (position == "C") {
                    result = await api.closePositionSell(timestamp, parseInt(qtt), cryptSymbol);
                }
            }
        }


        //result = await api.closePositionBuy(timestamp);
        console.log('result', result);
        if (result !== null && result !== undefined) {

            var closedOrd = await api.closeAllsltpBySymbol(timestamp, 1000, cryptSymbol);
            console.log('closedOrd-----D------------->>>>>', closedOrd);

            //flag = flagpos[`${cryptSymbol}`] + sufx;
            tag = sufx;

            //db.set(db.ref(database, `objData/${cryptSymbol}/log/lastclose${tag}`), result);

            let ordIdC = result.orderId;
            //db.set(db.ref(database, `objData/${cryptSymbol}/log/idClose${tag}`), ordIdC);

            //let histOrd = await createHistObj(result, cryptSymbol, tag);

            //var chList = [];
            //var chListOld = [];

            //chListOld = cacheJson[`${cryptSymbol}`].hist;
            //chList[`${result.orderId}`] = histOrd;

            //cacheJson[`${cryptSymbol}`].hist[`${result.orderId}`] = histOrd;
            //salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);

            //await db.set(db.ref(database, `objData/${cryptSymbol}/hist/${result.orderId}`), histOrd);
            //await db.set(db.ref(database, `rsidata/hist/${result.orderId}`), histOrd);

            //oldFlag = flag;
            flag = "";
            objSendcalc.flagpos[`${cryptSymbol}`] = flag;
            objSendcalc.flag = flag;

            cacheJson[`${cryptSymbol}`] = await carregarCache(cryptSymbol);

            if (cacheJson[`${cryptSymbol}`].flagpos !== undefined) {
                //cacheJson[`${cryptSymbol}`].flagpos[`${cryptSymbol}`] = flag;
                cacheJson[`${cryptSymbol}`].flagpos[`${cryptSymbol}`] = null;
            }

            objSendcalc.positions[`${cryptSymbol}`] = null;
            //set(ref(database, 'objData/${cryptSymbol}/obj/positions'), null);
            //cache.set("objSendcalc", objSendcalc);

            cacheJson[`${cryptSymbol}`].objSendcalc = objSendcalc;
            cacheJson[`${cryptSymbol}`].ltOrd = null;

            //cacheJson[`${cryptSymbol}`].timeValidate = now + (60 * 1000)
            cacheJson[`${cryptSymbol}`].positMaxPercent = parseFloat(0);
            cacheJson[`${cryptSymbol}`].positMinPercent = parseFloat(0);
            cacheJson[`${cryptSymbol}`].positLimitPercent = parseFloat(0);


            salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
            //notificWin(cryptSymbol, 'close');

            ret = "OK";

        }
    }
    //await notificWin(preco_atual, cryptSymbol, 'close', position);

    await writeUserData(objSendcalc, cryptSymbol);

    if (oldFlag !== flag) {

        console.log('');
        console.log(`${oldFlag} FECHADO! (${preco_atual})`);
        console.log('');
        //cache.set("objSendcalc", undefined);
        await histFix(timestamp, cryptSymbol);
        //await timeout(1000); // 1s

    }

    return ret;

}

async function CooldownTimer(tmp) {

    console.log(`StartCoolDown ${tmp}m`);
    for (var i = 0; i < tmp; i++) {

        console.log(`Restam ${tmp - i}m`);
        await timeout(60000);

    }

    console.log('EndCoolDown');

}

function ordenarHistoricoPorTime() {

    const cacheFilePath = path.join(__dirname, 'cache/cache_HIST.json');
    var data = null;
    try {
        var data = fs.readFileSync(cacheFilePath, 'utf-8');
        // ...
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.log(`File not found: ${cacheFilePath}`);
            // You can also create the file here if you want
        } else {
            throw err;
        }
    }
    //const cacheFilePath = path.join(__dirname, 'cache/cache_HIST.json');
    //const data = fs.readFileSync(cacheFilePath, 'utf-8');
    if (data !== "" && data !== null) {
        const historico = JSON.parse(data);

        const objetosOrdenados = [];

        Object.keys(historico).forEach((symbol) => {
            if (symbol !== 'All') {
                const objetosDaMoeda = historico[symbol];
                if (Array.isArray(objetosDaMoeda)) {
                    objetosDaMoeda.forEach((objeto) => {
                        //objetosOrdenados.push(objeto);
                        objetosOrdenados.push(objeto);
                        //console.log("objeto", objeto);
                    });
                } else {
                    Object.values(objetosDaMoeda).forEach((objeto) => {
                        //objetosOrdenados.push(objeto);
                        objetosOrdenados.push(objeto);
                        //console.log("objeto", objeto);

                    });
                }
            }
        });

        objetosOrdenados.sort((a, b) => a.time - b.time).reverse();
        //objetosOrdenados.sort((a, b) => a.time - b.time);

        return objetosOrdenados;
    }
    return undefined;

}

function criarHistoricoDeTransacoes(trades, symbol) {

    let idsUtilizados = [];
    const historico = {};
    const transacoes = {};
    const transacoesEnum = {};
    var historicoList = [];

    historicoList = carregarCache('HIST');

    var maxleverage = calcLeverage(cryptSymbol);


    /*
        if (symbol == "XMRUSDT" || symbol == "1000PEPEUSDT" || symbol == "KLAYUSDT" || symbol == "FLMUSDT" || symbol == "MTLUSDT" || symbol == "XTZUSDT") {
    
            maxleverage = 20;
    
        } else if (symbol == "SANDUSDT" || symbol == "VETUSDT" || symbol == "GALAUSDT" || symbol == "DOGSUSDT" || symbol == "MYROUSDT" || symbol == "1000SHIBUSDT" || symbol == "XRPUSDT" || symbol == "UNIUSDT" || symbol == "ADAUSDT" || symbol == "WLDUSDT" || symbol == "KAIAUSDT") {
    
            maxleverage = 75;
    
        } else if (symbol == "USTCUSDT" || symbol == "REZUSDT") {
    
            maxleverage = 50;
    
        } else if (symbol == "BTCUSDT") {
    
            maxleverage = 125;
    
        }
    */

    //const listaInvertida = trades.reverse();

    //trades = listaInvertida;

    // Ordena a lista de entrada pelo campo time
    trades.sort((a, b) => a.time - b.time);

    //console.log("trades:", trades);

    //trades filter


    trades.forEach((trade) => {

        if (trade !== undefined) {
            //var obFilter = Object.keys(trades).filter(key => !Object.keys(trade.orderId).includes(key));
            var obFilter = trades.filter(b => b.orderId === trade.orderId);
            //console.log("obFilter:", obFilter);

            //var obOrder = undefined;
            var obOrder = {
                qty: 0,
                realizedPnl: 0,
                commission: 0,
                time: 0,

                symbol: obFilter[0].symbol,

                id: obFilter[0].id,
                orderId: obFilter[0].orderId,
                side: obFilter[0].side,
                price: obFilter[0].price,
                quoteQty: obFilter[0].quoteQty,
                commissionAsset: obFilter[0].commissionAsset,
                positionSide: obFilter[0].positionSide,
                maker: obFilter[0].maker,
                buyer: obFilter[0].buyer

            };
            /*
                        var obOrder = obFilter.reduce((acc, ob) => {
                            acc.qty = (acc.qty || 0) + parseFloat(ob.qty);
                            acc.realizedPnl = (acc.realizedPnl || 0) + parseFloat(ob.realizedPnl);
                            acc.commission = (acc.commission || 0) + parseFloat(ob.commission);
                            acc.time = Math.max(acc.time || 0, ob.time);
                            // inclua os outros campos que você precisa aqui
                            // por exemplo:
                            acc.symbol = ob.symbol;
                            acc.id = ob.id;
                            acc.side = ob.side;
                            acc.price = ob.price;
                            acc.quoteQty = ob.quoteQty;
                            acc.commissionAsset = ob.commissionAsset;
                            acc.positionSide = ob.positionSide;
                            acc.maker = ob.maker;
                            acc.buyer = ob.buyer;
                            // ...
                            return acc;
                        }, {});
            
                        obOrder.realizedPnl = obOrder.realizedPnl.toFixed(2);
                        */
            /*

            obOrder: {
  symbol: 'XRPUSDT',
  id: 2083324862,
  orderId: 85773465570,
  side: 'SELL',
  price: '2.7109',
  qty: '9',
  realizedPnl: '0.23',
  quoteQty: '24.39810',
  commission: '0.01219905',
  commissionAsset: 'USDT',
  time: 1738618333545,
  positionSide: 'BOTH',
  maker: false,
  buyer: false
}
  */
            obFilter.forEach((ob) => {
                //if (transacoes[trade.orderId] == undefined) {
                if (obOrder == undefined) {

                    obOrder = ob;
                    obOrder.realizedPnl = parseFloat(ob.realizedPnl);
                    obOrder.realizedPnl = obOrder.realizedPnl.toFixed(2);

                } else {

                    //trade.qty
                    obOrder.qty = parseFloat(obOrder.qty) + parseFloat(ob.qty);
                    obOrder.realizedPnl = parseFloat(obOrder.realizedPnl) + parseFloat(ob.realizedPnl);
                    obOrder.commission = parseFloat(obOrder.commission) + parseFloat(ob.commission);
                    obOrder.realizedPnl = obOrder.realizedPnl.toFixed(2);

                    if (ob.time >= obOrder.time) {
                        obOrder.time = ob.time;
                    }
                }
                //obOrder.realizedPnl = obOrder.realizedPnl.toFixed(2);
                //}

            });
            obOrder.realizedPnl = parseFloat(obOrder.realizedPnl).toFixed(2);


            //console.log("obOrder:", obOrder);
            if (trade.symbol !== undefined) {
                if (trade.symbol === symbol) {
                    //if(obOrder.realizedPnl !== '0.00'){
                    transacoes[trade.orderId] = obOrder;
                    //}
                }
            }
            /*
            if (trade.symbol === symbol) {
                if (transacoes[trade.orderId] !== undefined) {
                    var realizedPnlAux = parseFloat(transacoes[trade.orderId].realizedPnl) + parseFloat(trade.realizedPnl);
                    transacoes[trade.orderId].realizedPnl = realizedPnlAux.toFixed(5);
                } else {
                    transacoes[trade.orderId] = trade;
                }
            }
                */
        }
    });


    Object.values(transacoes).sort((a, b) => a.time - b.time).forEach((trade) => {
        if (trade.symbol === symbol) {
            transacoes[trade.orderId] = trade;
        }
    });

    //console.log("transacoes:", transacoes);

    //var transacoesInver = inverterLista(transacoes);

    //trades = listaInvertida;

    //console.log("transacoesInver:", transacoesInver);

    //transacoes.sort((a, b) => a.time - b.time);

    i = 0;
    Object.keys(transacoes).forEach((orderId) => {
        transacoesEnum[i] = transacoes[orderId];
        //transacoesEnum[orderId] = transacoes[orderId];
        i++;
    });

    //console.log("transacoesEnum", transacoesEnum);
    var contx = -1;

    Object.keys(transacoes).forEach((orderId) => {
        contx++;
        var trade = transacoes[orderId];
        //if (!idsUtilizados.includes(trade.orderId)) {

        if (trade.realizedPnl !== undefined && trade.realizedPnl !== '0.00') {
            //console.log("indiceAtual(contx):", contx);

            var indiceAtual = -1;

            for (var i = 0; i < transacoesEnum.length; i++) {
                if (transacoesEnum[i].orderId === trade.orderId) {
                    indiceAtual = i;
                    //console.log("indiceAtual", indiceAtual);

                    break;
                }
            }
            var abertura = transacoesEnum[contx - 1];
            for (var y = 2; y < transacoesEnum.length; y++) {

            }

            if (abertura) {

                if (!historico[trade.symbol]) {
                    historico[trade.symbol] = {};
                }
                const id = `${trade.orderId}`;

                if (!historico[trade.symbol][id]) {

                    const partes1 = trade.realizedPnl.split('.');
                    const casasDecimais1 = partes1[1].slice(0, 2);

                    //var realizedPnl = parseFloat(trade.realizedPnl);
                    var realizedPnl = partes1[0].toString() + '.' + casasDecimais1.toString();
                    var realizedPnlComm = parseFloat(trade.realizedPnl) - parseFloat(trade.commission) - parseFloat(abertura.commission);

                    const partes2 = realizedPnlComm.toString().split('.');
                    const casasDecimais2 = partes2[1].slice(0, 2);

                    const realizedPnlCommArred = partes2[0].toString() + '.' + casasDecimais2.toString();

                    var isolatedMargin = parseFloat((abertura.price * trade.qty) / maxleverage) - parseFloat(abertura.commission);
                    const historicoItem = {
                        orderId: trade.orderId,
                        abertura: abertura.orderId,
                        fechamento: trade.orderId,
                        time: trade.time,
                        firstUpdate: abertura.time,
                        lastUpdate: trade.time,
                        pnl: realizedPnl, // trade.realizedPnl,  //realizedPnlArred.toFixed(2), //.replace(/\.00$/, ''),
                        symbol: trade.symbol,
                        entryPrice: abertura.price,
                        closePrice: trade.price,
                        commission: trade.commission,
                        commissionAsset: trade.commissionAsset,
                        qty: trade.qty,
                        qtyOrder: 0,
                        flag: abertura.side,
                        highPnl: '-0.01',
                        lowPnl: '-0.01',
                        isolatedMargin: isolatedMargin.toFixed(2),
                        side: abertura.side,
                        realizedPnl: realizedPnlCommArred, //realizedPnlComm.toFixed(2), //.replace(/\.00$/, '')
                    };

                    idsUtilizados.push(abertura.orderId);
                    idsUtilizados.push(trade.orderId);

                    historico[trade.symbol][id] = historicoItem;
                    //historicoList['All'][id] = historicoItem;

                    if (historicoList['All'] === undefined) {
                        historicoList['All'] = {};
                    }

                    if (historicoList !== undefined
                        && historicoList['All'] !== undefined
                    ) {
                        if (!historicoList['All'][id]) {
                            historicoList['All'][id] = historicoItem;
                        }
                    }
                    //historicoList['ALL'] = Object.assign({}, historicoList['ALL'], historicoItem);
                } else {

                    console.log("transacoesXXXXXXXXXXXXXXXXXXXXInver:");


                    console.log(historico[trade.symbol][id].pnl);

                    const partes1 = trade.realizedPnl.split('.');
                    const casasDecimais1 = partes1[1].slice(0, 2);

                    //var realizedPnl = parseFloat(trade.realizedPnl);
                    var realizedPnl = partes1[0].toString() + '.' + casasDecimais1.toString();

                    historico[trade.symbol][id].pnl = + parseFloat(realizedPnl);

                    var realizedPnlComm = parseFloat(trade.realizedPnl) - parseFloat(trade.commission) - parseFloat(abertura.commission);
                    const partes2 = realizedPnlComm.toString().split('.');
                    const casasDecimais2 = partes2[1].slice(0, 2);

                    const realizedPnlCommArred = partes2[0].toString() + '.' + casasDecimais2.toString();

                    historico[trade.symbol][id].realizedPnl = + parseFloat(realizedPnlCommArred);


                    var isolatedMargin = parseFloat((trade.price * trade.qty) / maxleverage) - parseFloat(trade.commission);

                    const partes3 = isolatedMargin.toString().split('.');
                    const casasDecimais3 = partes3[1].slice(0, 2);

                    const MargemNew = partes2[0].toString() + '.' + casasDecimais3.toString();

                    historico[trade.symbol][id].isolatedMargin = + parseFloat(MargemNew);


                }
            }
        }
        //}
    });
    //historicoList[`${symbol}`] = historico;
    //historicoList = historico;
    historicoList[`${symbol}`] = historico[`${symbol}`];
    //salvarCache(historicoList, 'HIST');
    //historicoList['ALL'] = Object.assign({}, historicoList['ALL'], historico[`${symbol}`]);
    //historicoList['All'] = ordenarHistoricoPorTime();
    salvarCache(historicoList, 'HIST');

    //return historico;
    return historicoList['All'];
}


async function histFix(timestamp, cryptSymbol) {

    //console.log('histFix');
    //var histFixObj = [];

    //const timeApi = await api.time();
    //if (timeApi !== undefined && timeApi !== null) {
    //timestamp = timeApi.data.serverTime;


    var cacheJson = [];
    cacheJson[`${cryptSymbol}`] = await carregarCache(cryptSymbol);
    cacheJson[`${cryptSymbol}`].histListBySymbol = [];
    preco_atual = cacheJson[`${cryptSymbol}`].preco_atual


    var userTradesApiCh = [];
    userTradesApiCh[`${cryptSymbol}`] = {};
    var userTradesApiChObj = {
        timestamp: Date.now(),
        data: null
    };

    userTradesApiCh[`${cryptSymbol}`] = userTradesApiChObj;

    //const userTrades = await api.userTrades(timestamp, cryptSymbol);
    const userTrades = undefined;

    await salvarCache(userTradesApiCh, 'userTrades');

    //console.log('userTrades', userTrades[userTrades.length-1]);

    //var userTradesObj = userTrades;
    var userTradesObj = undefined;

    var pnlTradesObj = null;
    var histFixObj = null;
    var histFixObjOld = null;
    var lastObjhist = null;
    var histEnum = [];
    //console.log('userTradesObj:', userTradesObj);

    if (userTrades !== null && userTrades !== undefined) {

        var historico = criarHistoricoDeTransacoes(userTradesObj, cryptSymbol);
        //console.log(`rsidata/hist/historico`, historico);

        //var i = 0;
        if (historico !== undefined) {
            Object.keys(historico).forEach((orderId) => {
                var trade = historico[orderId];
                histEnum[trade.orderId] = trade;
                //i++;
            });
            //console.log("histEnum", histEnum);
        }

        //await db.get(db.child(dbRef, `objData/${cryptSymbol}/hist`)).then((snapshot) => {
        await db.get(db.child(dbRef, `rsidata/hist`)).then((snapshot) => {

            if (snapshot.exists()) {
                const data = snapshot.val();

                if (data) {
                    //console.log(`rsidata/hist/data`, data);

                    //histFixObjOld = Object.entries(data);
                    histFixObjOld = data;

                    //console.log(`rsidata/hist/histFixObjOld`, histFixObjOld);

                }

            } else {

                //db.set(db.ref(database, `objData/${cryptSymbol}/log/errorhistFix`), "histFixObj Nulo");
                db.set(db.ref(database, `rsidata/log/errorhistFix`), "histFixObj Nulo");
            }

        }).catch((error) => {
            console.error(error);
        });
        //console.log(`rsidata/hist/histEnum`, histEnum);

        //histFixObj = Object.entries(histEnum);
        histFixObj = histEnum;

        if (histFixObj !== null) {

            for (let i = 0; i < userTradesObj.length; i++) {

                if (histFixObj[userTradesObj[i].orderId]) {

                    //histFixObj[userTradesObj[i].orderId].realizedPnl = "0.0";
                }
            }

            var objhlist = [];
            var objhlistAux = [];
            var objh = {};

            for (let i = 0; i < userTradesObj.length; i++) {

                /* 
                            var floatplush = null;
                            if (
                                objhlist[userTradesObj[i].orderId] !== null
                                && objhlist[userTradesObj[i].orderId] !== undefined
                                && objhlist[userTradesObj[i].orderId].realizedPnl !== null
                                && objhlist[userTradesObj[i].orderId].realizedPnl !== undefined
                            ) {
                                floatplush = parseFloat(objhlist[userTradesObj[i].orderId].realizedPnl) + parseFloat(userTradesObj[i].realizedPnl) - parseFloat(userTradesObj[i].commission);
                            
                            } else {
                                floatplush = parseFloat(userTradesObj[i].realizedPnl) - parseFloat(userTradesObj[i].commission);
                                objh.entryPrice = userTradesObj[i].price;
                                objh.closePrice = userTradesObj[i].price;
                                objh.commission = userTradesObj[i].commission;
                                objh.commissionAsset = userTradesObj[i].commissionAsset;
                                objh.orderId = userTradesObj[i].orderId;
                                objh.qty = userTradesObj[i].qty;
                                objh.symbol = userTradesObj[i].symbol;
                                objh.side = userTradesObj[i].side;
                                objh.lastUpdate = userTradesObj[i].time;
            
                            }
        
                            var strDoubleh = toNumberString(floatplush);
                            objh.realizedPnl = strDoubleh;
        
                            if(userTradesObj[i].realizedPnl !== '0'){
                                objhlist[userTradesObj[i].orderId] = objh;
                            }
                
                    */

                // ------------------- // 
                /*
                                    if (histFixObj[userTradesObj[i].orderId]) {
                                        //if (histFixObj[userTradesObj[i].orderId] !== undefined) {
                                        if (
                                            histFixObj[userTradesObj[i].orderId] !== undefined
                                            && histFixObj[userTradesObj[i].orderId].realizedPnl !== undefined
                
                                        ) {
                                            //contOrdens
                                            if (objhlist[userTradesObj[i].symbol] == undefined) {
                                                objhlist[userTradesObj[i].symbol] = [];
                                            }
                
                                            var floatplus = parseFloat(histFixObj[userTradesObj[i].orderId].realizedPnl) + parseFloat(userTradesObj[i].realizedPnl) - parseFloat(userTradesObj[i].commission);
                                            //var floatplus = parseFloat(userTradesObj[i].realizedPnl) - parseFloat(userTradesObj[i].commission);
                                            var strDouble = toNumberString(floatplus);
                
                                            histFixObj[userTradesObj[i].orderId].realizedPnl = strDouble;
                
                                        }
                                        histFixObj[userTradesObj[i].orderId].closePrice = userTradesObj[i].price;
                                        histFixObj[userTradesObj[i].orderId].commission = userTradesObj[i].commission;
                                        histFixObj[userTradesObj[i].orderId].commissionAsset = userTradesObj[i].commissionAsset;
                                        histFixObj[userTradesObj[i].orderId].orderId = userTradesObj[i].orderId;
                                        histFixObj[userTradesObj[i].orderId].qty = userTradesObj[i].qty;
                                        histFixObj[userTradesObj[i].orderId].symbol = userTradesObj[i].symbol;
                                        histFixObj[userTradesObj[i].orderId].side = userTradesObj[i].side;
                                        histFixObj[userTradesObj[i].orderId].lastUpdate = userTradesObj[i].time;
                
                                        lastObjhist = histFixObj[userTradesObj[i].orderId];
                
                                        //objhlistAux[userTradesObj[i].orderId] = histFixObj[userTradesObj[i].orderId];
                                        //objhlist[userTradesObj[i].symbol] = objhlistAux;
                
                                        //objhlist[userTradesObj[i].symbol].push(lastObjhist);
                                        objhlist[userTradesObj[i].symbol][userTradesObj[i].orderId] = histFixObj[userTradesObj[i].orderId];
                
                                        //}
                                        //console.log('test');
                
                                        //var v = userTradesObj.filter(b => b.orderId === histFixObj[i].orderId);
                
                                        //histFixObj[i].closePrice = v.price;
                                        //histFixObj[i].realizedPnl = v.realizedPnl;
                
                                    }
                                    // ------------------- // */

                /*/ ------------------- // 
                                     if (histFixObj2) {
                                         //if (histFixObj2 !== undefined) {
                                         if (
                                             histFixObj2 !== undefined
                                             && histFixObj2.realizedPnl !== undefined
                                         
                                         ) {
                                             //contOrdens
                                             if (objhlist[userTradesObj[i].symbol] == undefined) {
                                                 objhlist[userTradesObj[i].symbol] = [];
                                             }
                 
                                             var floatplus = parseFloat(histFixObj2.realizedPnl) + parseFloat(userTradesObj[i].realizedPnl) - parseFloat(userTradesObj[i].commission);
                                             //var floatplus = parseFloat(userTradesObj[i].realizedPnl) - parseFloat(userTradesObj[i].commission);
                                             var strDouble = toNumberString(floatplus);
                 
                                             histFixObj2.realizedPnl = strDouble;
                 
                                         //}
                 
                                             histFixObj2.closePrice = userTradesObj[i].price;
                                             histFixObj2.commission = userTradesObj[i].commission;
                                             histFixObj2.commissionAsset = userTradesObj[i].commissionAsset;
                                             histFixObj2.orderId = userTradesObj[i].orderId;
                                             histFixObj2.qty = userTradesObj[i].qty;
                                             histFixObj2.symbol = userTradesObj[i].symbol;
                                             histFixObj2.side = userTradesObj[i].side;
                                             histFixObj2.lastUpdate = userTradesObj[i].time;
                 
                                             lastObjhist = histFixObj2;
                 
                                             //objhlistAux[userTradesObj[i].orderId] = histFixObj2[userTradesObj[i].orderId];
                                             //objhlist[userTradesObj[i].symbol] = objhlistAux;
                 
                                             //objhlist[userTradesObj[i].symbol].push(lastObjhist);
                 
                                             if(
                                                 parseFloat(histFixObj2.realizedPnl) > parseFloat(10)
                                             ){
                                                 objhlist[userTradesObj[i].symbol][userTradesObj[i].orderId] = histFixObj2[userTradesObj[i].orderId];
                                             }
                                         }
                 
                                         //console.log('test');
                 
                                         //var v = userTradesObj.filter(b => b.orderId === histFixObj2[i].orderId);
                 
                                         //histFixObj2[i].closePrice = v.price;
                                         //histFixObj2[i].realizedPnl = v.realizedPnl;
                 
                                     }
                                         
    // ------------------- // */

            }

            //objhlist = historico;

            //console.log('objhlist:', objhlist);

            //var lastObjshist = histFixObj.slice(-2);

            //histFixObj = objhlist;
            //if(objhlist !== undefined && objhlist == ENOTEMPTY){
            cacheJson[`${cryptSymbol}`].histListBySymbol = objhlist;
            salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);
            //}

            //console.log("lastObjshist", lastObjshist);

            //console.log(penultimoObjeto, ultimoObjeto); // Output: 4 5



            //histFixObj = historico;



            //await db.set(db.child(dbRef, `objData/${cryptSymbol}/hist`), histFixObj);








            //histFixObj.sort((a, b) => a.time - b.time);

            histFixObj.sort((a, b) => a.lastUpdate - b.lastUpdate);



            //console.log(`rsidata/hist/histFixObj`, histFixObj);

            //console.log(`rsidata/hist/histFixObjOld`, histFixObjOld);





            if (histFixObjOld !== null && histFixObjOld !== undefined) {



                Object.values(histFixObjOld).sort((a, b) => a.lastUpdate - b.lastUpdate);

                if (histFixObj !== null) {





                    histFixObj.sort((a, b) => a.lastUpdate - b.lastUpdate);                        //console.log(`rsidata/hist/histFixObj2`, histFixObj);

                }

            } else {



                //const newList1 = histFixObj.filter(([key, value]) => key !== 'undefined');

                //console.log("newList", newList1);

                //histFixObj = newList1;



                //histFixObj.sort((a, b) => a.orderid - b.orderid);

            }
            //histFixObj
            if (objhlist[`${cryptSymbol}`] !== undefined) {

                /*
                var copiaDaLista = Object.entries(objhlist[`${cryptSymbol}`]); //.map(([chave, valor]) => ({chave, valor}));
                //var copiaDaLista = Object.entries(histFixObj); //.map(([chave, valor]) => ({chave, valor}));
                var copiaComSort = Object.entries(histFixObj); //.map(([chave, valor]) => ({chave, valor}));

                const last1 = copiaDaLista.pop();
                const last2 = copiaDaLista.pop();
                const last3 = copiaDaLista.pop();
                const last4 = copiaDaLista.pop();
                const last5 = copiaDaLista.pop();
                const last6 = copiaDaLista.pop();
                const last7 = copiaDaLista.pop();
                const last8 = copiaDaLista.pop();
                const last9 = copiaDaLista.pop();
                const last10 = copiaDaLista.pop();
                const last11 = copiaDaLista.pop();
                const last12 = copiaDaLista.pop();
                const last13 = copiaDaLista.pop();
                const last14 = copiaDaLista.pop();
                const last15 = copiaDaLista.pop();
                const last16 = copiaDaLista.pop();
                const last17 = copiaDaLista.pop();
                const last18 = copiaDaLista.pop();
                const last19 = copiaDaLista.pop();
                */

                var lastObjshist = {

                    last1: histFixObj[histFixObj.length - 1],
                    last2: histFixObj[histFixObj.length - 2],
                    last3: histFixObj[histFixObj.length - 3],
                    last4: histFixObj[histFixObj.length - 4],
                    last5: histFixObj[histFixObj.length - 5],
                    last6: histFixObj[histFixObj.length - 6],
                    last7: histFixObj[histFixObj.length - 7],
                    last8: histFixObj[histFixObj.length - 8],
                    last9: histFixObj[histFixObj.length - 9],
                    last10: histFixObj[histFixObj.length - 10],
                    last11: histFixObj[histFixObj.length - 11],
                    last12: histFixObj[histFixObj.length - 12],
                    last13: histFixObj[histFixObj.length - 13],
                    last14: histFixObj[histFixObj.length - 14],
                    last15: histFixObj[histFixObj.length - 15],
                    last16: histFixObj[histFixObj.length - 16],
                    last17: histFixObj[histFixObj.length - 17],
                    last18: histFixObj[histFixObj.length - 18],
                    last19: histFixObj[histFixObj.length - 19]

                };

                //copiaComSort.sort(compare);
                //var objDoSort = Object.assign({}, copiaComSort);

            }


            if (histFixObjOld !== null && histFixObjOld !== undefined) {

                if (compararListas(histFixObj, histFixObjOld) === false) {

                    //histFixObj.sort((a, b) => a.time - b.time);

                    histFixObj.sort((a, b) => a.lastUpdate - b.lastUpdate);

                    await db.set(db.child(dbRef, `rsidata/hist`), histFixObj);

                }
            }
        }

        //await db.set(db.child(dbRef, 'objData/${cryptSymbol}/userTrades'), userTradesObj);   

        //db.set(db.child(dbRef, `objData/${cryptSymbol}/userTrades`), userTradesObj);

        //db.set(db.child(dbRef, `rsidata/userTrades`), userTradesObj);

    }

    return { lastHist: lastObjhist, lastHists: lastObjshist, histList: histFixObj, histListBySymbol: objhlist };
    //}

}
function compare(a, b) {

    return a.lastUpdate - b.lastUpdate;

}

function compararListas(lista1, lista2) {

    var result = true;
    if (Object.keys(lista1).length !== Object.keys(lista2).length) {
        console.log(`Listas têm tamanhos diferentes: ${lista1.length} vs ${lista2.length}`);
        //return false;
        result = false;
    }

    if (Object.keys(lista1).length !== Object.keys(lista2).length) {
        console.log(`Objetos têm números de chaves diferentes: ${Object.keys(lista1).length} vs ${Object.keys(lista2).length}`);
        console.log(`Chaves adicionais em obj1: ${Object.keys(lista1).filter(key => !Object.keys(lista2).includes(key))}`);
        console.log(`Chaves adicionais em obj2: ${Object.keys(lista2).filter(key => !Object.keys(lista1).includes(key))}`);

        //return false;
        result = false;

    }


    for (let i = 0; i < lista1.length; i++) {
        const obj1 = lista1[i];
        const obj2 = lista2[i];


        for (const key in obj1) {
            if (obj1[key] !== obj2[key]) {
                console.log(`Valores diferentes para chave ${key}: ${obj1[key]} vs ${obj2[key]}`);

                //return false;
                result = false;

            }
        }
    }

    return result;
}

function compararListasOld(lista1, lista2) {

    if (lista1.length !== lista2.length) {
        return false;
    }


    for (let i = 0; i < lista1.length; i++) {
        const obj1 = lista1[i];
        const obj2 = lista2[i];

        if (Object.keys(obj1).length !== Object.keys(obj2).length) {
            return false;
        }

        for (const key in obj1) {
            if (obj1[key] !== obj2[key]) {
                return false;
            }
        }
    }

    return true;
}
function toNumberString(num) {
    if (Number.isInteger(num)) {
        return num + ".0"
    } else {
        return num.toString();
    }
}

async function createHistObj(result, cryptSymbol, tag) {
    //var histObj = {};
    //const userTrades = await api.userTrades(timestamp); //nao descomentar com os outros
    //const lastTrade = userTrades.filter(b => b.orderId === result.orderId);
    //let pnlrealized = lastTrade[0].realizedPnl;

    //const income = await api.income(timestamp);
    //if (income !== undefined){
    //var pnlHist = income.filter(b => b.incomeType === 'REALIZED_PNL'); // || b.asset === 'USDT');
    //let pnlrealized = pnlHist[pnlHist.length-1].income;

    //cacheJson[`${cryptSymbol}`].priceRefOp = priceRefOp;
    //salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);

    var firstUpdate = "";
    var symbol = "";
    var entryPrice = "";
    var isolatedMargin = "";
    var highPnl = "";
    var lowPnl = "";
    //var cacheJson = carregarCache(cryptSymbol);
    var cacheJson = [];
    cacheJson[`${cryptSymbol}`] = await carregarCache(cryptSymbol);

    if (position[`${cryptSymbol}`][0] !== undefined) {

        if (cacheJson[`${cryptSymbol}`].objMarket !== undefined) {
            if (cacheJson[`${cryptSymbol}`].objMarket.priceRefOp !== null) {

                firstUpdate = cacheJson[`${cryptSymbol}`].objMarket.priceRefOp.timestamp;
            } else {

                firstUpdate = position[`${cryptSymbol}`][0].updateTime;
            }
        } else {

            firstUpdate = position[`${cryptSymbol}`][0].updateTime;
        }

        symbol = position[`${cryptSymbol}`][0].symbol;
        entryPrice = position[`${cryptSymbol}`][0].entryPrice;
        isolatedMargin = position[`${cryptSymbol}`][0].isolatedWallet;
        highPnl = position[`${cryptSymbol}`][0].unrealizedProfit;
        lowPnl = position[`${cryptSymbol}`][0].unrealizedProfit;

    }

    const histObj = {

        orderId: result.orderId,
        firstUpdate: firstUpdate,
        lastUpdate: result.updateTime,
        symbol: symbol,
        entryPrice: entryPrice,
        //closePrice: lastTrade[0].price,
        closePrice: objSendcalc.tick,
        isolatedMargin: isolatedMargin,
        highPnl: highPnl,
        lowPnl: lowPnl,
        //realizedPnl: pnlrealized, // position[0].unrealizedProfit,
        realizedPnl: "0.0", // position[0].unrealizedProfit,
        flag: tag,
        qtyOrder: 0

    }
    console.log(`histObj: ${JSON.stringify(histObj)}`);
    //}
    return histObj;

}

function calcSignals(objSendcalc) {

    //const app = initializeApp(firebaseConfig);
    //const database = getDatabase(app);

    const rsi1mdif = objSendcalc.stoch1m.k - objSendcalc.stoch1m.d;
    const rsi1mdif2 = objSendcalc.stoch1mprev.k - objSendcalc.stoch1mprev.d;
    const sig1m = calcFlag(objSendcalc.stoch1m, rsi1mdif, rsi1mdif2);

    //db.set(db.ref(database, 'objData/${cryptSymbol}/obj/signals/rsi1m'), sig1m);

    const rsi3mdif = objSendcalc.stoch3m.k - objSendcalc.stoch3m.d;
    const rsi3mdif2 = objSendcalc.stoch3mprev.k - objSendcalc.stoch3mprev.d;
    const sig3m = calcFlag(objSendcalc.stoch3m, rsi3mdif, rsi3mdif2);

    //db.set(db.ref(database, 'objData/${cryptSymbol}/obj/signals/rsi3m'), sig3m);

    const rsi5mdif = objSendcalc.stoch5m.k - objSendcalc.stoch5m.d;
    const rsi5mdif2 = objSendcalc.stoch5mprev.k - objSendcalc.stoch5mprev.d;
    const sig5m = calcFlag(objSendcalc.stoch5m, rsi5mdif, rsi5mdif2);

    //db.set(db.ref(database, 'objData/${cryptSymbol}/obj/signals/rsi5m'), sig5m);

    const rsi15mdif = objSendcalc.stoch15m.k - objSendcalc.stoch15m.d;
    const rsi15mdif2 = objSendcalc.stoch15mprev.k - objSendcalc.stoch15mprev.d;
    const sig15m = calcFlag(objSendcalc.stoch15m, rsi15mdif, rsi15mdif2);

    //db.set(db.ref(database, 'objData/${cryptSymbol}/obj/signals/rsi15m'), sig15m);

    const rsi30mdif = objSendcalc.stoch30m.k - objSendcalc.stoch30m.d;
    const rsi30mdif2 = objSendcalc.stoch30mprev.k - objSendcalc.stoch30mprev.d;
    const sig30m = calcFlag(objSendcalc.stoch30m, rsi30mdif, rsi30mdif2);

    //db.set(db.ref(database, 'objData/${cryptSymbol}/obj/signals/rsi30m'), sig30m);

    const rsi1hdif = objSendcalc.stoch1h.k - objSendcalc.stoch1h.d;
    const rsi1hdif2 = objSendcalc.stoch1hprev.k - objSendcalc.stoch1hprev.d;
    const sig1h = calcFlag(objSendcalc.stoch1h, rsi1hdif, rsi1hdif2);

    //db.set(db.ref(database, 'objData/${cryptSymbol}/obj/signals/rsi1h'), sig1h);

    const rsi4hdif = objSendcalc.stoch4h.k - objSendcalc.stoch4h.d;
    const rsi4hdif2 = objSendcalc.stoch4hprev.k - objSendcalc.stoch4hprev.d;
    const sig4h = calcFlag(objSendcalc.stoch4h, rsi4hdif, rsi4hdif2);

    //db.set(db.ref(database, 'objData/${cryptSymbol}/obj/signals/rsi4h'), sig4h);
    //if(objSendcalc.stoch1d !== undefined){
    //const rsi1ddif = objSendcalc.stoch1d.k - objSendcalc.stoch1d.d;
    //const rsi1ddif2 = objSendcalc.stoch1dprev.k - objSendcalc.stoch1dprev.d;
    //const sig1d = calcFlag(objSendcalc.stoch1d, rsi1ddif, rsi1ddif2);

    //db.set(db.ref(database, 'objData/${cryptSymbol}/obj/signals/rsi1d'), sig1d);

    //const rsi1wdif = objSendcalc.stoch1w.k - objSendcalc.stoch1w.d;
    //const rsi1wdif2 = objSendcalc.stoch1wprev.k - objSendcalc.stoch1wprev.d;
    //const sig1w = calcFlag(objSendcalc.stoch1w, rsi1wdif, rsi1wdif2);
    //}
    //db.set(db.ref(database, 'objData/${cryptSymbol}/obj/signals/rsi1w'), sig1w);

    const sig = {

        rsi1m: sig1m,
        rsi3m: sig3m,
        rsi5m: sig5m,
        rsi15m: sig15m,
        rsi30m: sig30m,
        rsi1h: sig1h,
        rsi4h: sig4h,
        //rsi1d: sig1d,
        //rsi1w: sig1w,
        dif1m: rsi1mdif,
        dif3m: rsi3mdif,
        dif5m: rsi5mdif,
        dif15m: rsi15mdif,
        dif30m: rsi30mdif,
        dif1h: rsi1hdif,
        dif4h: rsi4hdif,
        //dif1d: rsi1ddif,
        //dif1w: rsi1wdif,
        dif1m2: rsi1mdif2,
        dif3m2: rsi3mdif2,
        dif5m2: rsi5mdif2,
        dif15m2: rsi15mdif2,
        dif30m2: rsi30mdif2,
        dif1h2: rsi1hdif2,
        dif4h2: rsi4hdif2,
        //dif1d2: rsi1ddif2,
        //dif1w2: rsi1wdif2
    }

    return sig;
}

function calcFlag(item, dif, dif2) {

    var flag = 0;  // 0 = neutro; 1 = Pré-compra; 2 = comprar; -1 = Pré-venda; -2 = vender

    if (item.k > 70 && item.d > 70) {                                        // sobrecomprado
        if (dif > 0) {                                                        // subindo
            if (dif < dif2) {                                                 // revertendo para baixo ex.: (4 < 5) = true
                if (dif < 2) {
                    flag = -1; // Pré-venda
                }
            }
        } else if (dif < 0) {                                                  // caindo
            flag = -2; // vender
        }
    } else
        if (item.k < 30 && item.d < 30) {                                        // sobrevendido
            if (dif > 0) {                                                        // subindo
                flag = 2; // comprar
            } else if (dif < 0) {                                                  // caindo

                if (dif > dif2) {                                                 // revertendo para cima  ex.: (-4 > -5) = true
                    if (dif > -2) {
                        flag = 1; // Pré-compra
                    }
                }
            }
        } else {
            flag = 0; // neutro
        }

    return flag;
}

function isInternetConnectionAvailable() {

    //db.set(db.ref(database, `objData/${cryptSymbol}/obj`), objSendcalc);

    return new Promise((resolve, reject) => {
        db.get(db.ref(database, `objData`)).then((snapshot) => {
            if (snapshot.exists()) {
                resolve(true);
            } else {
                resolve(false);
            }
        }).catch((error) => {
            console.error("Erro ao verificar conexão:", error);
            resolve(false);
        });
    });
}

async function writeUserData(objSendcalc, cryptSymbol) {

    if (objSendcalc !== null
        && objSendcalc !== undefined
        //&& objSendcalc.positions !== null
        //&& objSendcalc.positions !== undefined
        //&& objSendcalc.positions.length > 0
    ) {
        //histObj
        if (objSendcalc !== undefined) {
            flagpos[`${cryptSymbol}`] = flag;
            objSendcalc.flagpos = flagpos;
        }

        //cache.set("objSendcalc", objSendcalc);
        if (cacheJson[`${cryptSymbol}`] !== undefined
            && cacheJson[`${cryptSymbol}`].flagpos !== undefined
            && cacheJson[`${cryptSymbol}`].flagpos[`${cryptSymbol}`] !== undefined
            && flag !== undefined
            && cacheJson[`${cryptSymbol}`].objSendcalc.symbol == cryptSymbol
        ) {
            cacheJson[`${cryptSymbol}`].objSendcalc = objSendcalc;
            cacheJson[`${cryptSymbol}`].flagpos[`${cryptSymbol}`] = flag;
            salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);

        }

        //isInternetConnectionAvailable().then((isConnected) => {
        //conectado = await verificarConexao();
        if (conectado) {
            //console.log("Conexão com o banco de dados do Firebase está disponível");

            //outAPP
            //db.set(db.ref(database, `objData/${cryptSymbol}/obj`), objSendcalc);

            //se tirar trava o sistema!!
            //outAPP
            //db.set(db.ref(database, `rsidata/obj`), objSendcalc);
            //db.set(db.ref(database, `rsidata/positions`), position);

            if (position !== undefined) {
                //db.set(db.ref(database, `objData/${cryptSymbol}/positions`), position);
            }

        } else {
            console.log("Conexão com o banco de dados do Firebase não está disponível");
        }

        //});
    }



    //objSendcalc.flag = flag;
    //objSendcalc.flagpos[`${cryptSymbol}`] = flag;
    /*
    await db.set(db.ref(database, 'objData/${cryptSymbol}/obj'), objSendcalc, (error) => {
        if (error) {
          console.log('objData/${cryptSymbol}/obj could not be saved.' + error);
        } else {
          console.log('objData/${cryptSymbol}/obj saved successfully.');
        }
      });
      /*
    await db.set(db.ref(database, 'objData/${cryptSymbol}/positions'), position, (error) => {
        if (error) {
          console.log('objData/${cryptSymbol}/positions could not be saved.' + error);
        } else {
          console.log('objData/${cryptSymbol}/positions saved successfully.');
        }
      });
      */
}

function criarObj1m(data = undefined, cryptSymbol = 'ADAUSDT') {

    dateArr1m[`${cryptSymbol}`] = [];
    timestampArr1m[`${cryptSymbol}`] = [];
    openArr1m[`${cryptSymbol}`] = [];
    closeArr1m[`${cryptSymbol}`] = [];
    highArr1m[`${cryptSymbol}`] = [];
    lowArr1m[`${cryptSymbol}`] = [];
    volArr1m[`${cryptSymbol}`] = [];

    let dateArr1m_LOCAL = [];
    dateArr1m_LOCAL[`${cryptSymbol}`] = [];

    let timestampArr1m_LOCAL = [];
    timestampArr1m_LOCAL[`${cryptSymbol}`] = [];

    let openArr1m_LOCAL = [];
    openArr1m_LOCAL[`${cryptSymbol}`] = [];

    let closeArr1m_LOCAL = [];
    closeArr1m_LOCAL[`${cryptSymbol}`] = [];

    let highArr1m_LOCAL = [];
    highArr1m_LOCAL[`${cryptSymbol}`] = [];

    let lowArr1m_LOCAL = [];
    lowArr1m_LOCAL[`${cryptSymbol}`] = [];

    let volArr1m_LOCAL = [];
    volArr1m_LOCAL[`${cryptSymbol}`] = [];

    //console.log("criarObj1m/data", data);

    for (let i = 0; i < data.length; i++) {
        //criarObj1m(result1m[`${cryptSymbol}`].data[i], cryptSymbol);
        let itemL = data[i];

        let unix_timestamp = itemL[0]
        var formattedTime = formatTime(unix_timestamp);

        dateArr1m_LOCAL[`${cryptSymbol}`].push(formattedTime);
        timestampArr1m_LOCAL[`${cryptSymbol}`].push(unix_timestamp);
        openArr1m_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[1]));
        closeArr1m_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[4]));
        highArr1m_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[2]));
        lowArr1m_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[3]));
        volArr1m_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[5]));

    }

    dateArr1m[`${cryptSymbol}`] = dateArr1m_LOCAL[`${cryptSymbol}`];
    timestampArr1m[`${cryptSymbol}`] = timestampArr1m_LOCAL[`${cryptSymbol}`];
    openArr1m[`${cryptSymbol}`] = openArr1m_LOCAL[`${cryptSymbol}`];
    closeArr1m[`${cryptSymbol}`] = closeArr1m_LOCAL[`${cryptSymbol}`];
    highArr1m[`${cryptSymbol}`] = highArr1m_LOCAL[`${cryptSymbol}`];
    lowArr1m[`${cryptSymbol}`] = lowArr1m_LOCAL[`${cryptSymbol}`];
    volArr1m[`${cryptSymbol}`] = volArr1m_LOCAL[`${cryptSymbol}`];

    //console.log("criarObj1m/dateArr1m_LOCAL:", dateArr1m_LOCAL[`${cryptSymbol}`]);
}

function criarObj3m(data = undefined, cryptSymbol = 'ADAUSDT') {
    dateArr3m[`${cryptSymbol}`] = [];
    timestampArr3m[`${cryptSymbol}`] = [];
    openArr3m[`${cryptSymbol}`] = [];
    closeArr3m[`${cryptSymbol}`] = [];
    highArr3m[`${cryptSymbol}`] = [];
    lowArr3m[`${cryptSymbol}`] = [];
    volArr3m[`${cryptSymbol}`] = [];

    let dateArr3m_LOCAL = [];
    dateArr3m_LOCAL[`${cryptSymbol}`] = [];

    let timestampArr3m_LOCAL = [];
    timestampArr3m_LOCAL[`${cryptSymbol}`] = [];

    let openArr3m_LOCAL = [];
    openArr3m_LOCAL[`${cryptSymbol}`] = [];

    let closeArr3m_LOCAL = [];
    closeArr3m_LOCAL[`${cryptSymbol}`] = [];

    let highArr3m_LOCAL = [];
    highArr3m_LOCAL[`${cryptSymbol}`] = [];

    let lowArr3m_LOCAL = [];
    lowArr3m_LOCAL[`${cryptSymbol}`] = [];

    let volArr3m_LOCAL = [];
    volArr3m_LOCAL[`${cryptSymbol}`] = [];

    for (let i = 0; i < data.length; i++) {
        let itemL = data[i];

        let unix_timestamp = itemL[0]
        var formattedTime = formatTime(unix_timestamp);

        dateArr3m_LOCAL[`${cryptSymbol}`].push(formattedTime);
        timestampArr3m_LOCAL[`${cryptSymbol}`].push(unix_timestamp);
        openArr3m_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[1]));
        closeArr3m_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[4]));
        highArr3m_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[2]));
        lowArr3m_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[3]));
        volArr3m_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[5]));
    }

    dateArr3m[`${cryptSymbol}`] = dateArr3m_LOCAL[`${cryptSymbol}`];
    timestampArr3m[`${cryptSymbol}`] = timestampArr3m_LOCAL[`${cryptSymbol}`];
    openArr3m[`${cryptSymbol}`] = openArr3m_LOCAL[`${cryptSymbol}`];
    closeArr3m[`${cryptSymbol}`] = closeArr3m_LOCAL[`${cryptSymbol}`];
    highArr3m[`${cryptSymbol}`] = highArr3m_LOCAL[`${cryptSymbol}`];
    lowArr3m[`${cryptSymbol}`] = lowArr3m_LOCAL[`${cryptSymbol}`];
    volArr3m[`${cryptSymbol}`] = volArr3m_LOCAL[`${cryptSymbol}`];
}
function criarObj5m(data = undefined, cryptSymbol = 'ADAUSDT') {
    dateArr5m[`${cryptSymbol}`] = [];
    timestampArr5m[`${cryptSymbol}`] = [];
    openArr5m[`${cryptSymbol}`] = [];
    closeArr5m[`${cryptSymbol}`] = [];
    highArr5m[`${cryptSymbol}`] = [];
    lowArr5m[`${cryptSymbol}`] = [];
    volArr5m[`${cryptSymbol}`] = [];

    let dateArr5m_LOCAL = [];
    dateArr5m_LOCAL[`${cryptSymbol}`] = [];

    let timestampArr5m_LOCAL = [];
    timestampArr5m_LOCAL[`${cryptSymbol}`] = [];

    let openArr5m_LOCAL = [];
    openArr5m_LOCAL[`${cryptSymbol}`] = [];

    let closeArr5m_LOCAL = [];
    closeArr5m_LOCAL[`${cryptSymbol}`] = [];

    let highArr5m_LOCAL = [];
    highArr5m_LOCAL[`${cryptSymbol}`] = [];

    let lowArr5m_LOCAL = [];
    lowArr5m_LOCAL[`${cryptSymbol}`] = [];

    let volArr5m_LOCAL = [];
    volArr5m_LOCAL[`${cryptSymbol}`] = [];

    for (let i = 0; i < data.length; i++) {
        let itemL = data[i];

        let unix_timestamp = itemL[0]
        var formattedTime = formatTime(unix_timestamp);

        dateArr5m_LOCAL[`${cryptSymbol}`].push(formattedTime);
        timestampArr5m_LOCAL[`${cryptSymbol}`].push(unix_timestamp);
        openArr5m_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[1]));
        closeArr5m_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[4]));
        highArr5m_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[2]));
        lowArr5m_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[3]));
        volArr5m_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[5]));
    }

    dateArr5m[`${cryptSymbol}`] = dateArr5m_LOCAL[`${cryptSymbol}`];
    timestampArr5m[`${cryptSymbol}`] = timestampArr5m_LOCAL[`${cryptSymbol}`];
    openArr5m[`${cryptSymbol}`] = openArr5m_LOCAL[`${cryptSymbol}`];
    closeArr5m[`${cryptSymbol}`] = closeArr5m_LOCAL[`${cryptSymbol}`];
    highArr5m[`${cryptSymbol}`] = highArr5m_LOCAL[`${cryptSymbol}`];
    lowArr5m[`${cryptSymbol}`] = lowArr5m_LOCAL[`${cryptSymbol}`];
    volArr5m[`${cryptSymbol}`] = volArr5m_LOCAL[`${cryptSymbol}`];
}

function criarObj15m(data = undefined, cryptSymbol = 'ADAUSDT') {
    dateArr15m[`${cryptSymbol}`] = [];
    timestampArr15m[`${cryptSymbol}`] = [];
    openArr15m[`${cryptSymbol}`] = [];
    closeArr15m[`${cryptSymbol}`] = [];
    highArr15m[`${cryptSymbol}`] = [];
    lowArr15m[`${cryptSymbol}`] = [];
    volArr15m[`${cryptSymbol}`] = [];

    let dateArr15m_LOCAL = [];
    dateArr15m_LOCAL[`${cryptSymbol}`] = [];

    let timestampArr15m_LOCAL = [];
    timestampArr15m_LOCAL[`${cryptSymbol}`] = [];

    let openArr15m_LOCAL = [];
    openArr15m_LOCAL[`${cryptSymbol}`] = [];

    let closeArr15m_LOCAL = [];
    closeArr15m_LOCAL[`${cryptSymbol}`] = [];

    let highArr15m_LOCAL = [];
    highArr15m_LOCAL[`${cryptSymbol}`] = [];

    let lowArr15m_LOCAL = [];
    lowArr15m_LOCAL[`${cryptSymbol}`] = [];

    let volArr15m_LOCAL = [];
    volArr15m_LOCAL[`${cryptSymbol}`] = [];

    for (let i = 0; i < data.length; i++) {
        let itemL = data[i];

        let unix_timestamp = itemL[0]
        var formattedTime = formatTime(unix_timestamp);

        dateArr15m_LOCAL[`${cryptSymbol}`].push(formattedTime);
        timestampArr15m_LOCAL[`${cryptSymbol}`].push(unix_timestamp);
        openArr15m_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[1]));
        closeArr15m_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[4]));
        highArr15m_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[2]));
        lowArr15m_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[3]));
        volArr15m_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[5]));
    }

    dateArr15m[`${cryptSymbol}`] = dateArr15m_LOCAL[`${cryptSymbol}`];
    timestampArr15m[`${cryptSymbol}`] = timestampArr15m_LOCAL[`${cryptSymbol}`];
    openArr15m[`${cryptSymbol}`] = openArr15m_LOCAL[`${cryptSymbol}`];
    closeArr15m[`${cryptSymbol}`] = closeArr15m_LOCAL[`${cryptSymbol}`];
    highArr15m[`${cryptSymbol}`] = highArr15m_LOCAL[`${cryptSymbol}`];
    lowArr15m[`${cryptSymbol}`] = lowArr15m_LOCAL[`${cryptSymbol}`];
    volArr15m[`${cryptSymbol}`] = volArr15m_LOCAL[`${cryptSymbol}`];
}

function criarObj30m(data = undefined, cryptSymbol = 'ADAUSDT') {
    dateArr30m[`${cryptSymbol}`] = [];
    timestampArr30m[`${cryptSymbol}`] = [];
    openArr30m[`${cryptSymbol}`] = [];
    closeArr30m[`${cryptSymbol}`] = [];
    highArr30m[`${cryptSymbol}`] = [];
    lowArr30m[`${cryptSymbol}`] = [];
    volArr30m[`${cryptSymbol}`] = [];

    let dateArr30m_LOCAL = [];
    dateArr30m_LOCAL[`${cryptSymbol}`] = [];

    let timestampArr30m_LOCAL = [];
    timestampArr30m_LOCAL[`${cryptSymbol}`] = [];

    let openArr30m_LOCAL = [];
    openArr30m_LOCAL[`${cryptSymbol}`] = [];

    let closeArr30m_LOCAL = [];
    closeArr30m_LOCAL[`${cryptSymbol}`] = [];

    let highArr30m_LOCAL = [];
    highArr30m_LOCAL[`${cryptSymbol}`] = [];

    let lowArr30m_LOCAL = [];
    lowArr30m_LOCAL[`${cryptSymbol}`] = [];

    let volArr30m_LOCAL = [];
    volArr30m_LOCAL[`${cryptSymbol}`] = [];

    for (let i = 0; i < data.length; i++) {
        let itemL = data[i];

        let unix_timestamp = itemL[0]
        var formattedTime = formatTime(unix_timestamp);

        dateArr30m_LOCAL[`${cryptSymbol}`].push(formattedTime);
        timestampArr30m_LOCAL[`${cryptSymbol}`].push(unix_timestamp);
        openArr30m_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[1]));
        closeArr30m_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[4]));
        highArr30m_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[2]));
        lowArr30m_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[3]));
        volArr30m_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[5]));
    }

    dateArr30m[`${cryptSymbol}`] = dateArr30m_LOCAL[`${cryptSymbol}`];
    timestampArr30m[`${cryptSymbol}`] = timestampArr30m_LOCAL[`${cryptSymbol}`];
    openArr30m[`${cryptSymbol}`] = openArr30m_LOCAL[`${cryptSymbol}`];
    closeArr30m[`${cryptSymbol}`] = closeArr30m_LOCAL[`${cryptSymbol}`];
    highArr30m[`${cryptSymbol}`] = highArr30m_LOCAL[`${cryptSymbol}`];
    lowArr30m[`${cryptSymbol}`] = lowArr30m_LOCAL[`${cryptSymbol}`];
    volArr30m[`${cryptSymbol}`] = volArr30m_LOCAL[`${cryptSymbol}`];
}

function criarObj1h(data = undefined, cryptSymbol = 'ADAUSDT') {
    dateArr1h[`${cryptSymbol}`] = [];
    timestampArr1h[`${cryptSymbol}`] = [];
    openArr1h[`${cryptSymbol}`] = [];
    closeArr1h[`${cryptSymbol}`] = [];
    highArr1h[`${cryptSymbol}`] = [];
    lowArr1h[`${cryptSymbol}`] = [];
    volArr1h[`${cryptSymbol}`] = [];

    let dateArr1h_LOCAL = [];
    dateArr1h_LOCAL[`${cryptSymbol}`] = [];

    let timestampArr1h_LOCAL = [];
    timestampArr1h_LOCAL[`${cryptSymbol}`] = [];

    let openArr1h_LOCAL = [];
    openArr1h_LOCAL[`${cryptSymbol}`] = [];

    let closeArr1h_LOCAL = [];
    closeArr1h_LOCAL[`${cryptSymbol}`] = [];

    let highArr1h_LOCAL = [];
    highArr1h_LOCAL[`${cryptSymbol}`] = [];

    let lowArr1h_LOCAL = [];
    lowArr1h_LOCAL[`${cryptSymbol}`] = [];

    let volArr1h_LOCAL = [];
    volArr1h_LOCAL[`${cryptSymbol}`] = [];

    for (let i = 0; i < data.length; i++) {
        let itemL = data[i];

        let unix_timestamp = itemL[0]
        var formattedTime = formatTime(unix_timestamp);

        dateArr1h_LOCAL[`${cryptSymbol}`].push(formattedTime);
        timestampArr1h_LOCAL[`${cryptSymbol}`].push(unix_timestamp);
        openArr1h_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[1]));
        closeArr1h_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[4]));
        highArr1h_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[2]));
        lowArr1h_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[3]));
        volArr1h_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[5]));
    }

    dateArr1h[`${cryptSymbol}`] = dateArr1h_LOCAL[`${cryptSymbol}`];
    timestampArr1h[`${cryptSymbol}`] = timestampArr1h_LOCAL[`${cryptSymbol}`];
    openArr1h[`${cryptSymbol}`] = openArr1h_LOCAL[`${cryptSymbol}`];
    closeArr1h[`${cryptSymbol}`] = closeArr1h_LOCAL[`${cryptSymbol}`];
    highArr1h[`${cryptSymbol}`] = highArr1h_LOCAL[`${cryptSymbol}`];
    lowArr1h[`${cryptSymbol}`] = lowArr1h_LOCAL[`${cryptSymbol}`];
    volArr1h[`${cryptSymbol}`] = volArr1h_LOCAL[`${cryptSymbol}`];
}

function criarObj4h(data = undefined, cryptSymbol = 'ADAUSDT') {
    dateArr4h[`${cryptSymbol}`] = [];
    timestampArr4h[`${cryptSymbol}`] = [];
    openArr4h[`${cryptSymbol}`] = [];
    closeArr4h[`${cryptSymbol}`] = [];
    highArr4h[`${cryptSymbol}`] = [];
    lowArr4h[`${cryptSymbol}`] = [];
    volArr4h[`${cryptSymbol}`] = [];

    let dateArr4h_LOCAL = [];
    dateArr4h_LOCAL[`${cryptSymbol}`] = [];

    let timestampArr4h_LOCAL = [];
    timestampArr4h_LOCAL[`${cryptSymbol}`] = [];

    let openArr4h_LOCAL = [];
    openArr4h_LOCAL[`${cryptSymbol}`] = [];

    let closeArr4h_LOCAL = [];
    closeArr4h_LOCAL[`${cryptSymbol}`] = [];

    let highArr4h_LOCAL = [];
    highArr4h_LOCAL[`${cryptSymbol}`] = [];

    let lowArr4h_LOCAL = [];
    lowArr4h_LOCAL[`${cryptSymbol}`] = [];

    let volArr4h_LOCAL = [];
    volArr4h_LOCAL[`${cryptSymbol}`] = [];

    for (let i = 0; i < data.length; i++) {
        let itemL = data[i];

        let unix_timestamp = itemL[0]
        var formattedTime = formatTime(unix_timestamp);

        dateArr4h_LOCAL[`${cryptSymbol}`].push(formattedTime);
        timestampArr4h_LOCAL[`${cryptSymbol}`].push(unix_timestamp);
        openArr4h_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[1]));
        closeArr4h_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[4]));
        highArr4h_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[2]));
        lowArr4h_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[3]));
        volArr4h_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[5]));
    }

    dateArr4h[`${cryptSymbol}`] = dateArr4h_LOCAL[`${cryptSymbol}`];
    timestampArr4h[`${cryptSymbol}`] = timestampArr4h_LOCAL[`${cryptSymbol}`];
    openArr4h[`${cryptSymbol}`] = openArr4h_LOCAL[`${cryptSymbol}`];
    closeArr4h[`${cryptSymbol}`] = closeArr4h_LOCAL[`${cryptSymbol}`];
    highArr4h[`${cryptSymbol}`] = highArr4h_LOCAL[`${cryptSymbol}`];
    lowArr4h[`${cryptSymbol}`] = lowArr4h_LOCAL[`${cryptSymbol}`];
    volArr4h[`${cryptSymbol}`] = volArr4h_LOCAL[`${cryptSymbol}`];
}

function criarObj1d(data = undefined, cryptSymbol = 'ADAUSDT') {
    dateArr1d[`${cryptSymbol}`] = [];
    timestampArr1d[`${cryptSymbol}`] = [];
    openArr1d[`${cryptSymbol}`] = [];
    closeArr1d[`${cryptSymbol}`] = [];
    highArr1d[`${cryptSymbol}`] = [];
    lowArr1d[`${cryptSymbol}`] = [];
    volArr1d[`${cryptSymbol}`] = [];

    let dateArr1d_LOCAL = [];
    dateArr1d_LOCAL[`${cryptSymbol}`] = [];

    let timestampArr1d_LOCAL = [];
    timestampArr1d_LOCAL[`${cryptSymbol}`] = [];

    let openArr1d_LOCAL = [];
    openArr1d_LOCAL[`${cryptSymbol}`] = [];

    let closeArr1d_LOCAL = [];
    closeArr1d_LOCAL[`${cryptSymbol}`] = [];

    let highArr1d_LOCAL = [];
    highArr1d_LOCAL[`${cryptSymbol}`] = [];

    let lowArr1d_LOCAL = [];
    lowArr1d_LOCAL[`${cryptSymbol}`] = [];

    let volArr1d_LOCAL = [];
    volArr1d_LOCAL[`${cryptSymbol}`] = [];

    for (let i = 0; i < data.length; i++) {
        let itemL = data[i];

        let unix_timestamp = itemL[0]
        var formattedTime = formatTime(unix_timestamp);

        dateArr1d_LOCAL[`${cryptSymbol}`].push(formattedTime);
        timestampArr1d_LOCAL[`${cryptSymbol}`].push(unix_timestamp);
        openArr1d_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[1]));
        closeArr1d_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[4]));
        highArr1d_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[2]));
        lowArr1d_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[3]));
        volArr1d_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[5]));
    }

    dateArr1d[`${cryptSymbol}`] = dateArr1d_LOCAL[`${cryptSymbol}`];
    timestampArr1d[`${cryptSymbol}`] = timestampArr1d_LOCAL[`${cryptSymbol}`];
    openArr1d[`${cryptSymbol}`] = openArr1d_LOCAL[`${cryptSymbol}`];
    closeArr1d[`${cryptSymbol}`] = closeArr1d_LOCAL[`${cryptSymbol}`];
    highArr1d[`${cryptSymbol}`] = highArr1d_LOCAL[`${cryptSymbol}`];
    lowArr1d[`${cryptSymbol}`] = lowArr1d_LOCAL[`${cryptSymbol}`];
    volArr1d[`${cryptSymbol}`] = volArr1d_LOCAL[`${cryptSymbol}`];
}

function criarObj1w(data = undefined, cryptSymbol = 'ADAUSDT') {
    dateArr1w[`${cryptSymbol}`] = [];
    timestampArr1w[`${cryptSymbol}`] = [];
    openArr1w[`${cryptSymbol}`] = [];
    closeArr1w[`${cryptSymbol}`] = [];
    highArr1w[`${cryptSymbol}`] = [];
    lowArr1w[`${cryptSymbol}`] = [];
    volArr1w[`${cryptSymbol}`] = [];

    let dateArr1w_LOCAL = [];
    dateArr1w_LOCAL[`${cryptSymbol}`] = [];

    let timestampArr1w_LOCAL = [];
    timestampArr1w_LOCAL[`${cryptSymbol}`] = [];

    let openArr1w_LOCAL = [];
    openArr1w_LOCAL[`${cryptSymbol}`] = [];

    let closeArr1w_LOCAL = [];
    closeArr1w_LOCAL[`${cryptSymbol}`] = [];

    let highArr1w_LOCAL = [];
    highArr1w_LOCAL[`${cryptSymbol}`] = [];

    let lowArr1w_LOCAL = [];
    lowArr1w_LOCAL[`${cryptSymbol}`] = [];

    let volArr1w_LOCAL = [];
    volArr1w_LOCAL[`${cryptSymbol}`] = [];

    for (let i = 0; i < data.length; i++) {
        let itemL = data[i];

        let unix_timestamp = itemL[0]
        var formattedTime = formatTime(unix_timestamp);

        dateArr1w_LOCAL[`${cryptSymbol}`].push(formattedTime);
        timestampArr1w_LOCAL[`${cryptSymbol}`].push(unix_timestamp);
        openArr1w_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[1]));
        closeArr1w_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[4]));
        highArr1w_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[2]));
        lowArr1w_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[3]));
        volArr1w_LOCAL[`${cryptSymbol}`].push(parseFloat(itemL[5]));
    }

    dateArr1w[`${cryptSymbol}`] = dateArr1w_LOCAL[`${cryptSymbol}`];
    timestampArr1w[`${cryptSymbol}`] = timestampArr1w_LOCAL[`${cryptSymbol}`];
    openArr1w[`${cryptSymbol}`] = openArr1w_LOCAL[`${cryptSymbol}`];
    closeArr1w[`${cryptSymbol}`] = closeArr1w_LOCAL[`${cryptSymbol}`];
    highArr1w[`${cryptSymbol}`] = highArr1w_LOCAL[`${cryptSymbol}`];
    lowArr1w[`${cryptSymbol}`] = lowArr1w_LOCAL[`${cryptSymbol}`];
    volArr1w[`${cryptSymbol}`] = volArr1w_LOCAL[`${cryptSymbol}`];
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

    //console.log('agora',agora);
    //console.log('dataDesejada',dataDesejada);
    //console.log('diferenca',diferenca);
    //console.log('minutos',minutos);

    if (dataDesejada < agora) {
        return `Passaram-se ${Math.abs(horas)} horas e ${Math.abs(minutosRestantes)} minutos`;
    } else {
        return `Restam ${horas} horas e ${minutosRestantes} minutos`;
    }
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

function percentage(partialValue, totalValue) {
    return (100 * partialValue) / totalValue;
}
