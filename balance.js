// binance-balances.js
require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');

const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;

if (!API_KEY || !SECRET_KEY) {
  console.error('ERRO: verifique se as variáveis API_KEY e SECRET_KEY estão definidas no .env');
  process.exit(1);
}

function sign(queryString) {
  return crypto.createHmac('sha256', SECRET_KEY).update(queryString).digest('hex');
}

async function getSpotBalances() {
  try {
    const ts = Date.now();
    const qs = `timestamp=${ts}&recvWindow=60000`;
    const signature = sign(qs);
    const url = `https://api.binance.com/api/v3/account?${qs}&signature=${signature}`;

    const res = await axios.get(url, { headers: { 'X-MBX-APIKEY': API_KEY } });
    // res.data.balances => array { asset, free, locked }
    return res.data.balances;
  } catch (err) {
    throw new Error('Spot error: ' + (err.response ? `${err.response.status} ${JSON.stringify(err.response.data)}` : err.message));
  }
}

async function getFuturesBalances() {
  try {
    const ts = Date.now();
    const qs = `timestamp=${ts}&recvWindow=60000`;
    const signature = sign(qs);
    const url = `https://fapi.binance.com/fapi/v2/balance?${qs}&signature=${signature}`;

    const res = await axios.get(url, { headers: { 'X-MBX-APIKEY': API_KEY } });
    // res.data => array of { asset, balance } for USDⓈ-M futures
    return res.data;
  } catch (err) {
    throw new Error('Futures error: ' + (err.response ? `${err.response.status} ${JSON.stringify(err.response.data)}` : err.message));
  }
}

async function getFundingWalletBalances() {
  try {
    const ts = Date.now();
    const qs = `timestamp=${ts}&recvWindow=60000`;
    const signature = sign(qs);
    const url = `https://api.binance.com/sapi/v1/asset/get-funding-asset?${qs}&signature=${signature}`;

    // POST request (endpoint expects signed POST; body can be empty)
    const res = await axios.post(url, null, {
      headers: {
        'X-MBX-APIKEY': API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    // res.data => array of funding assets (or object)
    return res.data;
  } catch (err) {
    throw new Error('Funding wallet error: ' + (err.response ? `${err.response.status} ${JSON.stringify(err.response.data)}` : err.message));
  }
}

function printSpot(balances) {
  console.log('=== SPOT WALLET (non-zero) ===');
  const nonZero = balances.filter(b => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0);
  if (!nonZero.length) {
    console.log('Nenhum saldo não-zero encontrado na Spot.');
    return;
  }
  nonZero.forEach(b => {
    console.log(`${b.asset} — free: ${b.free} — locked: ${b.locked}`);
  });
}

function printFutures(balances) {
  console.log('\n=== FUTURES WALLET (USDⓈ-M) ===');
  if (!Array.isArray(balances) || balances.length === 0) {
    console.log('Nenhum dado retornado para Futures.');
    return;
  }
  // Each item typically has { asset, balance } (strings)
  balances.forEach(b => {
    if (b.balance && parseFloat(b.balance) !== 0) {
      console.log(`${b.asset} — balance: ${b.balance}`);
    }
  });
}

function printFunding(fundingData) {
  console.log('\n=== FUNDING WALLET ===');
  if (!fundingData || (Array.isArray(fundingData) && fundingData.length === 0)) {
    console.log('Nenhum saldo na Funding Wallet ou permissão não habilitada.');
    return;
  }
  // fundingData shape may vary by account; try to print useful fields
  if (Array.isArray(fundingData)) {
    fundingData.forEach(item => {
      if (item && (item.asset || item.free || item.locked)) {
        console.log(JSON.stringify(item));
      }
    });
  } else {
    console.log(JSON.stringify(fundingData));
  }
}

(async () => {
  try {
    const [spot, futures, funding] = await Promise.allSettled([
      getSpotBalances(),
      getFuturesBalances(),
      getFundingWalletBalances()
    ]);

    if (spot.status === 'fulfilled') {
      printSpot(spot.value);
    } else {
      console.error('\nErro ao obter Spot:', spot.reason.message);
    }

    if (futures.status === 'fulfilled') {
      printFutures(futures.value);
    } else {
      console.error('\nErro ao obter Futures:', futures.reason.message);
    }

    if (funding.status === 'fulfilled') {
      printFunding(funding.value);
    } else {
      console.error('\nErro ao obter Funding Wallet:', funding.reason.message);
    }
  } catch (err) {
    console.error('Erro geral:', err.message);
  }
})();