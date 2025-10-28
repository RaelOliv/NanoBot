const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const api = require('./api');
const { DateTime } = require('luxon');

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.SECRET_KEY;
const BASE_URL = 'https://fapi.binance.com';

let timestamp = null;
/*
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
    *
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
    
       //nxpc: 'NXPCUSDT'

};
*/
const cryptSymbols = {
    aave: 'AAVEUSDT',
    ach: 'ACHUSDT',
    ada: 'ADAUSDT',
    //adx: 'ADXUSDT',
    aergo: 'AERGOUSDT',
    ain: 'AINUSDT',
    algorand: 'ALGOUSDT',
    //aleph: 'AZEROUSDT',
    apt: 'APTUSDT',
    arb: 'ARBUSDT',
    aster: 'ASTERUSDT',
    bas: 'BASUSDT',
    bat: 'BATUSDT',
    bnb: 'BNBUSDT',
    bonk: '1000BONKUSDT',
    coti: 'COTIUSDT',
    cvx: 'CVXUSDT',
    dexe: 'DEXEUSDT',
    doge: 'DOGEUSDT',
    dot: 'DOTUSDT',
    ena: 'ENAUSDT',
    eth: 'ETHUSDT',
    //fantom: 'FTMUSDT',
    fet: 'FETUSDT',
    hbar: 'HBARUSDT',
    idol: 'IDOLUSDT',
    jto: 'JTOUSDT',
    jup: 'JUPUSDT',
    kaito: 'KAITOUSDT',
    layer: 'LAYERUSDT',
    ldo: 'LDOUSDT',
    //lilpepe: 'LILPEPEUSDT',
    link: 'LINKUSDT',
    m: 'MUSDT',
    //matic: 'MATICUSDT',
    nmr: 'NMRUSDT',
    nxpc: 'NXPCUSDT',
    //ocean: 'OCEANUSDT',
    ondo: 'ONDOUSDT',
    op: 'OPUSDT',
    paxg: 'PAXGUSDT',
    pepe: '1000PEPEUSDT',
    pump: 'PUMPUSDT',
    pyth: 'PYTHUSDT',
    //render: 'RNDRUSDT',
    //rexas: 'RXSUSDT',
    sand: 'SANDUSDT',
    sei: 'SEIUSDT',
    shib: '1000SHIBUSDT',
    sol: 'SOLUSDT',
    stellar: 'XLMUSDT',
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
};



const SYMBOLS = Object.values(cryptSymbols);
//const START_TIME = new Date('2025-05-01T00:00:00Z').getTime();
const START_TIME = new Date('2025-07-23T00:00:00Z').getTime();

const END_TIME = Date.now();

function sign(query, secret) {
    return crypto.createHmac('sha256', secret).update(query).digest('hex');
}

function carregarCache(currencyPair) {
    const cacheFilePath = path.join(__dirname, `cache/cache_${currencyPair}.json`);
    try {
        const data = fs.readFileSync(cacheFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

async function salvarCache(cache, currencyPair) {
    const cacheFilePath = path.join(__dirname, `cache/cache_${currencyPair}.json`);
    try {
        fs.writeFileSync(cacheFilePath, JSON.stringify(cache), { flag: 'w' });
    } catch (err) {
        console.error("Erro ao salvar cache:", err);
    }
}

async function fetchUserTrades(symbol) {
    const allTrades = [];
    let fromId = null;
    let hasMore = true;
    let pagina = 1;

    console.log(`🔍 Buscando trades para ${symbol}`);

    while (hasMore) {
        const params = new URLSearchParams({
            symbol,
            limit: '1000',
            timestamp: timestamp
        });

        if (fromId !== null) {
            params.append('fromId', fromId.toString());
        }

        const signature = sign(params.toString(), API_SECRET);
        params.append('signature', signature);

        try {
            const { data } = await axios.get(`${BASE_URL}/fapi/v1/userTrades?${params.toString()}`, {
                headers: { 'X-MBX-APIKEY': API_KEY }
            });

            console.log(`📄 Página ${pagina++}: recebidos ${data.length} trades. Último ID: ${data[data.length - 1]?.id}`);

            if (data.length === 0) {
                hasMore = false;
            } else {
                allTrades.push(...data);
                fromId = data[data.length - 1].id + 1;

                if (data[data.length - 1].time > END_TIME || data.length < 1000) {
                    hasMore = false;
                }
            }
        } catch (err) {
            console.error(`❌ Erro ao buscar trades de ${symbol}:`, err.response?.data || err.message);
            hasMore = false;
        }

        await new Promise(r => setTimeout(r, 200));
    }

    return allTrades
        .filter(t => t.time >= START_TIME && t.time <= END_TIME)
        .sort((a, b) => a.time - b.time);
}

function agruparPorSessao(trades) {
    const grupos = [];
    let atual = [];
    let entradaQty = 0;
    let saidaQty = 0;

    for (const t of trades) {
        atual.push(t);
        const qty = parseFloat(t.qty);

        if (t.side === 'BUY') entradaQty += qty;
        else saidaQty += qty;

        if (entradaQty === saidaQty) {
            grupos.push(atual);
            atual = [];
            entradaQty = 0;
            saidaQty = 0;
        }
    }

    if (atual.length > 0) grupos.push(atual);
    return grupos;
}

function calcularDirecao(grupo) {
    if (!grupo.length) return 'NEUTRO';
    return grupo[0].side === 'BUY' ? 'COMPRA' : 'VENDA';
}

function formatarDataBrasilia(timestamp) {
    return DateTime.fromMillis(timestamp).setZone('America/Sao_Paulo').toFormat('yyyy-MM-dd HH:mm:ss');
}

async function obterAlavancagem(symbol) {
    const timestamp = Date.now();
    const params = new URLSearchParams({ timestamp: timestamp.toString() });
    const signature = sign(params.toString(), API_SECRET);
    params.append('signature', signature);

    try {
        const { data } = await axios.get(`${BASE_URL}/fapi/v2/positionRisk?${params.toString()}`, {
            headers: { 'X-MBX-APIKEY': API_KEY }
        });

        const pos = data.find(p => p.symbol === symbol);
        return pos ? parseFloat(pos.leverage) : 1;
    } catch (err) {
        console.error(`Erro ao buscar alavancagem de ${symbol}:`, err.response?.data || err.message);
        return 1;
    }
}

function calcularPnL(grupo, precoAtual, leverage, pricePrecision = 4) {
    const realized = grupo.reduce((acc, t) => acc + parseFloat(t.realizedPnl), 0);
    const entradaQty = grupo.filter(t => t.side === 'BUY').reduce((sum, t) => sum + parseFloat(t.qty), 0);
    const saidaQty = grupo.filter(t => t.side === 'SELL').reduce((sum, t) => sum + parseFloat(t.qty), 0);

    const precoAbertura = grupo[0]?.price ? parseFloat(grupo[0].price) : null;
    const precoFechamento = grupo[grupo.length - 1]?.price ? parseFloat(grupo[grupo.length - 1].price) : null;

    const direcao = calcularDirecao(grupo);
    const emAberto = entradaQty !== saidaQty;

    let lucro = realized;
    let percentual = 0;
    let margem = 0;

    if (emAberto) {
        const qtyAberta = Math.abs(entradaQty - saidaQty);
        const precoBase = precoAbertura;
        const variacao = direcao === 'LONG'
            ? precoAtual - precoBase
            : precoBase - precoAtual;

        lucro += variacao * qtyAberta;
        margem = (precoBase * qtyAberta) / leverage;
    } else {
        margem = (precoAbertura * entradaQty) / leverage;
    }

    if (margem > 0) {
        percentual = (lucro / margem) * 100;
    }

    const openTime = grupo[0]?.time || 0;
    const closeTime = grupo[grupo.length - 1]?.time || 0;

    return {
        lucro: parseFloat(lucro.toFixed(2)),
        direcao,
        percentual: parseFloat(percentual.toFixed(2)),
        margem: parseFloat(margem.toFixed(2)),
        status: emAberto ? 'ABERTA' : 'FECHADA',
        abertura: formatarDataBrasilia(openTime),
        fechamento: formatarDataBrasilia(closeTime),
        preco_abertura: precoAbertura?.toFixed(pricePrecision),
        preco_fechamento: precoFechamento?.toFixed(pricePrecision),
        timestamp: closeTime
    };
}

async function obterPrecoAtual(symbol) {
    const { data } = await axios.get(`${BASE_URL}/fapi/v1/ticker/price?symbol=${symbol}`);
    return parseFloat(data.price);
}

async function obterPrecisaoSimbolos() {
    const precisao = {};
    try {
        const { data } = await axios.get(`${BASE_URL}/fapi/v1/exchangeInfo`);
        for (const symbol of SYMBOLS) {
            const info = data.symbols.find(s => s.symbol === symbol);
            if (info) {
                precisao[symbol] = {
                    pricePrecision: info.pricePrecision,
                    quantityPrecision: info.quantityPrecision
                };
            }
        }
    } catch (err) {
        console.error("Erro ao obter precisão dos símbolos:", err.response?.data || err.message);
    }
    return precisao;
}

async function analisarSimbolo(symbol, precisao) {
    const cryptSymbol = symbol;

    // Carregar cache existente
    const cacheJson = [];
    cacheJson[`${cryptSymbol}`] = await carregarCache(cryptSymbol);

    const trades = await fetchUserTrades(symbol);
    if (trades.length === 0) return [];

    const precoAtual = await obterPrecoAtual(symbol);
    const leverage = await obterAlavancagem(symbol);

    const grupos = agruparPorSessao(trades);
    const resultados = [];

    const p = precisao[symbol] || { pricePrecision: 4, quantityPrecision: 3 };

    for (const grupo of grupos) {
        const resultado = calcularPnL(grupo, precoAtual, leverage, p.pricePrecision);
        resultados.push({
            ativo: symbol,
            ...resultado
        });
    }

    // Atualizar cache: resultados + objMarket
    //cacheJson[`${cryptSymbol}`].resultados = resultados;
    cacheJson[`${cryptSymbol}`].objRisk = {
        pricePrecision: p.pricePrecision,
        quantityPrecision: p.quantityPrecision,
        leverage: leverage
    };

    // Salvar cache
    await salvarCache(cacheJson[`${cryptSymbol}`], cryptSymbol);

    return resultados;
}
async function configRisk(cryptSymbol){
  var positRisk = await api.getPositRisk(cryptSymbol);
          console.log(`positRisk_MrgIsol-[${cryptSymbol}]`, positRisk[0].isolated);
          console.log(`positRisk_Lev-[${cryptSymbol}]`, positRisk[0].leverage);
          
          var maxLev = await api.getMaxLeverage(cryptSymbol);
          console.log(`maxLev-[${cryptSymbol}]`, maxLev[0].brackets[0].initialLeverage);
          
          if(parseInt(positRisk[0].leverage) !== parseInt(maxLev[0].brackets[0].initialLeverage)){
        var setLev = await api.setLeverage(cryptSymbol, maxLev[0].brackets[0].initialLeverage);
          console.log(`setLeverage-[${cryptSymbol}]`, setLev);
          }
          
         // if(positRisk[0].isolated == false){
        var setMargIsolated = await api.setMargIsolated(cryptSymbol);
          console.log(`setMargIsolated-[${cryptSymbol}]`, setMargIsolated);  
         // }

}

async function main() {
  /*
  const res = await apiAxiosSpot.get('/api/v3/time');
  const serverTime = res.data.serverTime;
  const localTime = Date.now();
  offset = serverTime - localTime;
  
  timestamp = Date.now() + offset;
  */
    const resultados = [];
    const precisaoSimbolos = await obterPrecisaoSimbolos();

    for (const symbol of SYMBOLS) {
        await configRisk(symbol);
    }
    
    for (const symbol of SYMBOLS) {
        //await configRisk(symbol);
        const res = await analisarSimbolo(symbol, precisaoSimbolos);
        resultados.push(...res);
    }

    resultados.sort((a, b) => b.timestamp - a.timestamp);

    for (const r of resultados) {
        console.log("");
        console.log(`Ativo: ${r.ativo} | Direção: ${r.direcao}`);
        console.log(`| Margem: ${r.margem} | PnL: ${r.lucro} ( ${r.percentual}% )`);
        console.log(`| Status: ${r.status}`);
        console.log(`| Abertura: ${r.abertura}`);
        console.log(`| Fechamento: ${r.fechamento}`);
        console.log(`| Preço Abertura: ${r.preco_abertura}`);
        console.log(`| Preço Fechamento: ${r.preco_fechamento}`);
        console.log("");
    }
}

main().catch(console.error);