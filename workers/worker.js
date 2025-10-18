const { parentPort } = require('worker_threads');
require('dotenv').config();
//const initDados = require('../index');

parentPort.on('message', async (symbol, preco) => {
    try {
console.log(`Iniciando worker para: ${symbol}`);
await initDados(symbol, preco);
console.log(`Finalizado initDados para: ${symbol}`);
        
        parentPort.postMessage(`Finalizado ${symbol}`);
    } catch (err) {
        console.error(`Erro com ${symbol}:`, err);
        parentPort.postMessage(`Erro em ${symbol}`);
    }
});