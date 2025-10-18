const { parentPort, workerData } = require('worker_threads');
const WebSocket = require('ws');

const symbol = workerData.symbol; // Ex: BTCUSDT

let mediaSuperior = 100;
let mediaInferior = 95;

let lastCandle = null;
let ws = null;

function monitorarGatilho() {
  console.log(`Conectando WebSocket gatilho para ${symbol.toUpperCase()}...`);

  ws = new WebSocket(`wss://fstream.binance.com/ws/${symbol.toLowerCase()}@kline_3m`);

  ws.on('open', () => {
    console.log(`[${symbol}] WebSocket gatilho conectado.`);
  });

  ws.on('message', (data) => {
    const payload = JSON.parse(data);
    const k = payload.k;

    if (k.x) {
      const candle = {
        openTime: k.t,
        open: parseFloat(k.o),
        high: parseFloat(k.h),
        low: parseFloat(k.l),
        close: parseFloat(k.c),
        closeTime: k.T
      };

      if (lastCandle) {
        const anterior = lastCandle;
        const atual = candle;

        if (
          anterior.low < mediaSuperior &&
          anterior.low >= mediaInferior &&
          anterior.open > mediaSuperior &&
          anterior.close > mediaSuperior
        ) {
          parentPort.postMessage({
            trigger: "buy",
            candle: atual
          });
        }

        if (
          anterior.high > mediaInferior &&
          anterior.high <= mediaSuperior &&
          anterior.open < mediaInferior &&
          anterior.close < mediaInferior
        ) {
          parentPort.postMessage({
            trigger: "sell",
            candle: atual
          });
        }
      }

      lastCandle = candle;
    }
  });

  ws.on('close', (code, reason) => {
    console.log(`[${symbol}] WebSocket fechado. Código: ${code}, Motivo: ${reason}`);
    retryConnection();
  });

  ws.on('error', (err) => {
    console.error(`[${symbol}] Erro no WebSocket:`, err.message);
    ws.terminate();
    retryConnectionGatilho();
  });
}

function retryConnectionGatilho() {
  const retryDelayMs = 3000; // espera 3 segundos para reconectar
  console.log(`[${symbol}] Tentando reconectar gatilho em ${retryDelayMs / 1000}s...`);
  setTimeout(monitorarGatilho, retryDelayMs);
}

monitorarGatilho();