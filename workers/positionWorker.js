// workers/positionWorker.js

const WebSocket = require('ws');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const api = require('../api');

require('dotenv').config();

const { parentPort } = require('worker_threads');

const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;

const BASE_URL = 'https://fapi.binance.com';

const GLOBAL_AXIOS_TIMEOUT =
  parseInt(process.env.GLOBAL_AXIOS_TIMEOUT, 10) || 1000;

axios.defaults.timeout = GLOBAL_AXIOS_TIMEOUT;

const https = require('https');

function possuiInternet(timeout = 5000) {
    return new Promise((resolve) => {
        const req = https.get(
            'https://fapi.binance.com/fapi/v1/time',
            {
                timeout
            },
            (res) => {
                res.resume();

                // Qualquer resposta HTTP significa que existe conexão
                resolve(res.statusCode >= 200 && res.statusCode < 500);
            }
        );

        req.on('error', () => resolve(false));

        req.on('timeout', () => {
            req.destroy();
            resolve(false);
        });
    });
}

async function verificarInternet() {
    const online = await possuiInternet();

    if (!online) {
        console.log(
            `[${new Date().toISOString()}] Sem conexão com a internet. Encerrando worker...`
        );

        if (parentPort) {
            parentPort.postMessage({
                tipo: 'SEM_INTERNET',
                reiniciarEm: 5 * 60 * 1000
            });
        }

        // Dá um pequeno tempo para a mensagem chegar ao processo principal
        setTimeout(() => {
            process.exit(1);
        }, 100);

        return false;
    }

    setTimeout(() => {
        verificarInternet();
    }, 30000);
}


if (!API_KEY || !SECRET_KEY) {
  console.error(
    '[positionsWorker] ERRO: API_KEY e SECRET_KEY devem estar no .env'
  );
  process.exit(1);
}

/*
|--------------------------------------------------------------------------
| CONFIGURAÇÃO
|--------------------------------------------------------------------------
*/

const CACHE_DIR = path.resolve(__dirname, 'cache');
const CACHE_PATH = path.resolve(CACHE_DIR, 'cachepos.json');

const CACHE_TMP_PATH = `${CACHE_PATH}.tmp`;

const REST_SYNC_INTERVAL_MINUTES = 1;

const LISTEN_KEY_RENEW_INTERVAL = 25 * 60 * 1000;

const WS_RECONNECT_DELAY = 4000;

/*
|--------------------------------------------------------------------------
| ESTADO
|--------------------------------------------------------------------------
*/

let ws = null;
let listenKey = null;

let periodicStarted = false;
let listenKeyRenewTimer = null;

let positions = {};
let lastPNL = [];
let coin = null;

let wsStarting = false;

/*
|--------------------------------------------------------------------------
| CACHE
|--------------------------------------------------------------------------
*/

function garantirCache() {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, {
        recursive: true
      });
    }

    if (!fs.existsSync(CACHE_PATH)) {
      fs.writeFileSync(
        CACHE_PATH,
        '{}',
        'utf8'
      );
    }
  } catch (err) {
    console.error(
      '[positionsWorker] Erro ao garantir cache:',
      err.message
    );
  }
}

garantirCache();

/*
|--------------------------------------------------------------------------
| LEITURA DO CACHE
|--------------------------------------------------------------------------
*/

function readCacheFromFile() {
  try {
    if (!fs.existsSync(CACHE_PATH)) {
      return {};
    }

    const raw = fs.readFileSync(
      CACHE_PATH,
      'utf8'
    );

    if (!raw || !raw.trim()) {
      return {};
    }

    const parsed = JSON.parse(raw);

    if (
      !parsed ||
      typeof parsed !== 'object' ||
      Array.isArray(parsed)
    ) {
      return {};
    }

    return parsed;

  } catch (err) {
    console.error(
      '[positionsWorker] Erro ao ler cache:',
      err.message
    );

    return {};
  }
}

/*
|--------------------------------------------------------------------------
| CARREGAMENTO INICIAL
|--------------------------------------------------------------------------
*/

function carregarCacheLocal() {
  try {
    const data = readCacheFromFile();

    positions = data;

    console.log(
      `[positionsWorker] Cache local carregado (${Object.keys(positions).length} posições).`
    );

  } catch (err) {

    console.error(
      '[positionsWorker] Erro ao carregar cache local:',
      err.message
    );

    positions = {};
  }
}

/*
|--------------------------------------------------------------------------
| SALVAMENTO ATÔMICO
|--------------------------------------------------------------------------
|
| Evita que o telegramWorker leia cachepos.json exatamente no momento
| em que ele está sendo escrito.
|
| Em vez de:
|
| writeFile(cachepos.json)
|
| fazemos:
|
| writeFile(cachepos.json.tmp)
| rename(cachepos.json.tmp -> cachepos.json)
|
|--------------------------------------------------------------------------
*/

function salvarCache() {
  try {

    const json = JSON.stringify(
      positions,
      null,
      2
    );

    fs.writeFileSync(
      CACHE_TMP_PATH,
      json,
      'utf8'
    );

    fs.renameSync(
      CACHE_TMP_PATH,
      CACHE_PATH
    );

  } catch (err) {

    console.error(
      '[positionsWorker] Erro ao salvar cache:',
      err.message
    );

    try {
      if (fs.existsSync(CACHE_TMP_PATH)) {
        fs.unlinkSync(CACHE_TMP_PATH);
      }
    } catch (_) {}
  }
}

/*
|--------------------------------------------------------------------------
| CACHE AUXILIAR
|--------------------------------------------------------------------------
*/

function carregarCache(currencyPair) {

  const cacheFilePath = path.join(
    CACHE_DIR,
    `${currencyPair}.json`
  );

  try {

    const data = fs.readFileSync(
      cacheFilePath,
      'utf8'
    );

    return JSON.parse(data);

  } catch (error) {

    return {};
  }
}

/*
|--------------------------------------------------------------------------
| DADOS DE RESULTADO DA POSIÇÃO
|--------------------------------------------------------------------------
*/

function getCachedPlusMinus(symbol) {

  try {

    if (positions && positions[symbol]) {

      return {

        plus:
          Number(positions[symbol].plus) || 0,

        minus:
          Number(positions[symbol].minus) || 0,

        percent:
          Number(positions[symbol].percent) || 0,

        maxPercent:
          Number(positions[symbol].maxPercent) || 0,

        minPercent:
          Number(positions[symbol].minPercent) || 0
      };
    }

    const disk = readCacheFromFile();

    if (disk && disk[symbol]) {

      return {

        plus:
          Number(disk[symbol].plus) || 0,

        minus:
          Number(disk[symbol].minus) || 0,

        percent:
          Number(disk[symbol].percent) || 0,

        maxPercent:
          Number(disk[symbol].maxPercent) || 0,

        minPercent:
          Number(disk[symbol].minPercent) || 0
      };
    }

  } catch (_) {}

  return {
    plus: 0,
    minus: 0,
    percent: 0,
    maxPercent: 0,
    minPercent: 0
  };
}

/*
|--------------------------------------------------------------------------
| CÁLCULO DE MARGEM
|--------------------------------------------------------------------------
*/

function calcularInitialMargin({
  isolatedMargin,
  positionAmt,
  entryPrice,
  leverage,
  marginType
}) {

  const im = Math.abs(
    Number(isolatedMargin) || 0
  );

  const amt = Math.abs(
    Number(positionAmt) || 0
  );

  const ep =
    Math.abs(Number(entryPrice) || 0);

  const lev =
    Math.abs(Number(leverage) || 0);

  /*
   * Em isolated, quando a Binance fornece isolatedMargin,
   * utilizamos o valor real informado pela API.
   */

  if (
    String(marginType).toLowerCase() === 'isolated' &&
    im > 0
  ) {
    return im;
  }

  /*
   * Para Cross não temos uma margem individual exata
   * por posição através desse campo.
   *
   * Usamos notional / leverage como aproximação.
   */

  if (
    amt > 0 &&
    ep > 0 &&
    lev > 0
  ) {
    return (amt * ep) / lev;
  }

  return 0;
}

/*
|--------------------------------------------------------------------------
| CÁLCULO DO PERCENTUAL
|--------------------------------------------------------------------------
*/

function calcularPercent(unrealizedProfit, initialMargin) {

  const pnl =
    Number(unrealizedProfit) || 0;

  const margin =
    Number(initialMargin) || 0;

  if (margin <= 0) {
    return 0;
  }

  return (pnl / margin) * 100;
}

/*
|--------------------------------------------------------------------------
| CRIAÇÃO DOS DADOS DA POSIÇÃO
|--------------------------------------------------------------------------
*/

function criarDadosPosicao({
  symbol,
  positionAmt,
  entryPrice,
  markPrice,
  unrealizedProfit,
  liquidationPrice,
  leverage,
  marginType,
  isolatedMargin,
  positionSide,
  previousPosition
}) {

  const amt =
    Number(positionAmt) || 0;

  const up =
    Number(unrealizedProfit) || 0;

  const ep =
    Number(entryPrice) || 0;

  const lev =
    Number(leverage) || 0;

  const initialMargin =
    calcularInitialMargin({
      isolatedMargin,
      positionAmt: amt,
      entryPrice: ep,
      leverage: lev,
      marginType
    });

  const percent =
    calcularPercent(
      up,
      initialMargin
    );

  const saved =
    getCachedPlusMinus(symbol);

  let maxPercent =
    Number(
      previousPosition?.maxPercent ??
      saved.maxPercent ??
      percent
    );

  let minPercent =
    Number(
      previousPosition?.minPercent ??
      saved.minPercent ??
      percent
    );

  if (percent > maxPercent) {
    maxPercent = percent;
  }

  if (percent < minPercent) {
    minPercent = percent;
  }

  /*
   * IMPORTANTE:
   *
   * Se já existia uma posição, preservamos openedAt.
   *
   * Se não existia, significa que esta é uma nova abertura.
   */

  let openedAt =
    previousPosition?.openedAt || null;

  if (!openedAt) {
    openedAt = Date.now();
  }

  return {

    symbol,

    positionAmt:
      String(positionAmt ?? '0'),

    entryPrice:
      String(entryPrice ?? '0'),

    markPrice:
      String(markPrice ?? '0'),

    unRealizedProfit:
      String(unrealizedProfit ?? '0'),

    liquidationPrice:
      String(liquidationPrice ?? '0'),

    leverage:
      String(leverage ?? '0'),

    marginType:
      marginType || 'isolated',

    isolatedMargin:
      String(isolatedMargin ?? '0'),

    initialMargin:
      Number(initialMargin.toFixed(8)),

    percent:
      Number(percent.toFixed(3)),

    maxPercent:
      Number(maxPercent.toFixed(3)),

    minPercent:
      Number(minPercent.toFixed(3)),

    positionSide:
      positionSide || 'BOTH',

    plus:
      Number(
        previousPosition?.plus ??
        saved.plus ??
        0
      ),

    minus:
      Number(
        previousPosition?.minus ??
        saved.minus ??
        0
      ),

    openedAt,

    updateTime:
      Date.now()
  };
}

/*
|--------------------------------------------------------------------------
| ASSINATURA BINANCE
|--------------------------------------------------------------------------
*/

function signQuery(paramsObj, secret) {

  const params =
    new URLSearchParams(
      paramsObj
    ).toString();

  const signature =
    crypto
      .createHmac(
        'sha256',
        secret
      )
      .update(params)
      .digest('hex');

  return `${params}&signature=${signature}`;
}

/*
|--------------------------------------------------------------------------
| SINCRONIZAÇÃO REST
|--------------------------------------------------------------------------
*/

async function sincronizarPosicoesAtuais() {

  if (!SECRET_KEY) {

    console.error(
      '[positionsWorker] SECRET_KEY não encontrado.'
    );

    return;
  }

  try {

    const timestamp =
      Date.now();

    const paramsObj = {
      timestamp
    };

    const q =
      signQuery(
        paramsObj,
        SECRET_KEY
      );

    const url =
      `${BASE_URL}/fapi/v2/positionRisk?${q}`;

    const res =
      await axios.get(
        url,
        {
          headers: {
            'X-MBX-APIKEY': API_KEY
          },

          timeout:
            GLOBAL_AXIOS_TIMEOUT
        }
      );

    const todas =
      Array.isArray(res.data)
        ? res.data
        : [];

    const abertas =
      todas.filter(
        p =>
          Number(p.positionAmt) !== 0
      );

    /*
     * Mapa das posições atuais.
     */

    const novas = {};

    for (const p of abertas) {

      const symbol =
        p.symbol;

      const previous =
        positions[symbol];

      const positionAmt =
        Number(p.positionAmt) || 0;

      const up =
        Number(p.unRealizedProfit) || 0;

      const entryPrice =
        Number(p.entryPrice) || 0;

      const markPrice =
        Number(p.markPrice) || 0;

      const liquidationPrice =
        Number(p.liquidationPrice) || 0;

      const leverage =
        Number(p.leverage) || 0;

      const marginType =
        p.marginType || 'isolated';

      const isolatedMargin =
        Number(p.isolatedMargin) || 0;

      const positionSide =
        p.positionSide || 'BOTH';

      novas[symbol] =
        criarDadosPosicao({

          symbol,

          positionAmt,

          entryPrice,

          markPrice,

          unrealizedProfit: up,

          liquidationPrice,

          leverage,

          marginType,

          isolatedMargin,

          positionSide,

          previousPosition: previous
        });
    }

    const antigos =
      Object.keys(positions);

    const novosKeys =
      Object.keys(novas);

    const removidos =
      antigos.filter(
        symbol =>
          !novosKeys.includes(symbol)
      );

    const adicionados =
      novosKeys.filter(
        symbol =>
          !antigos.includes(symbol)
      );

    positions =
      novas;

    salvarCache();

    console.log(
      `[positionsWorker] 🔄 Sincronização REST concluída. Abertas: ${novosKeys.length}`
    );

    if (removidos.length) {

      console.log(
        `  - Removidas: ${removidos.join(', ')}`
      );
    }

    if (adicionados.length) {

      console.log(
        `  - Novas: ${adicionados.join(', ')}`
      );
    }

  } catch (err) {

    if (
      err.response &&
      err.response.data
    ) {

      console.error(
        '[positionsWorker] Erro API:',
        err.response.status,
        JSON.stringify(
          err.response.data
        )
      );

    } else {

      console.error(
        '[positionsWorker] Erro ao sincronizar posições:',
        err.message
      );
    }
  }
}

/*
|--------------------------------------------------------------------------
| LISTEN KEY
|--------------------------------------------------------------------------
*/

function iniciarRenovacaoListenKey() {

  if (listenKeyRenewTimer) {
    return;
  }

  listenKeyRenewTimer =
    setInterval(
      async () => {

        if (!listenKey) {
          return;
        }

        try {

          await axios.put(
            `${BASE_URL}/fapi/v1/listenKey`,
            null,
            {
              headers: {
                'X-MBX-APIKEY': API_KEY
              },

              timeout:
                GLOBAL_AXIOS_TIMEOUT
            }
          );

          console.log(
            '[positionsWorker] listenKey renovada.'
          );

        } catch (err) {

          console.error(
            '[positionsWorker] Erro ao renovar listenKey:',
            err.message
          );
        }

      },
      LISTEN_KEY_RENEW_INTERVAL
    );
}

/*
|--------------------------------------------------------------------------
| CRIAR LISTEN KEY
|--------------------------------------------------------------------------
*/

async function criarListenKey() {

  try {

    const res =
      await axios.post(
        `${BASE_URL}/fapi/v1/listenKey`,
        null,
        {
          headers: {
            'X-MBX-APIKEY': API_KEY
          },

          timeout: 10_000
        }
      );

    return res.data.listenKey;

  } catch (err) {

    if (
      err.response &&
      err.response.data
    ) {

      console.error(
        '[positionsWorker] Erro criando listenKey:',
        err.response.status,
        JSON.stringify(
          err.response.data
        )
      );

    } else {

      console.error(
        '[positionsWorker] Erro criando listenKey:',
        err.message
      );
    }

    throw err;
  }
}

/*
|--------------------------------------------------------------------------
| VERIFICAÇÃO REST PERIÓDICA
|--------------------------------------------------------------------------
*/

function iniciarVerificacaoPeriodica(
  intervalMinutes = REST_SYNC_INTERVAL_MINUTES
) {

  if (periodicStarted) {
    return;
  }

  periodicStarted = true;

  setInterval(
    async () => {

      console.log(
        '[positionsWorker] Executando verificação REST periódica...'
      );

      await sincronizarPosicoesAtuais();

    },
    intervalMinutes * 60 * 1000
  );

  console.log(
    `[positionsWorker] Verificação REST automática ativada (a cada ${intervalMinutes} minutos).`
  );
}

/*
|--------------------------------------------------------------------------
| ASSINATURA PARA USER TRADES
|--------------------------------------------------------------------------
*/

function gerarAssinatura(params) {

  return crypto
    .createHmac(
      'sha256',
      SECRET_KEY
    )
    .update(params)
    .digest('hex');
}

/*
|--------------------------------------------------------------------------
| DIREÇÃO DO TRADE
|--------------------------------------------------------------------------
*/

function obterDeltaPosicao(
  trade,
  positionSide = 'BOTH'
) {

  const qty =
    Number(trade.qty) || 0;

  if (qty <= 0) {
    return 0;
  }

  const side =
    String(
      trade.side || ''
    ).toUpperCase();

  const ps =
    String(
      trade.positionSide ||
      positionSide ||
      'BOTH'
    ).toUpperCase();

  /*
   * One-way Mode:
   *
   * BUY  -> aumenta posição
   * SELL -> reduz posição
   */

  if (ps === 'BOTH') {

    return side === 'BUY'
      ? qty
      : -qty;
  }

  /*
   * Hedge Mode:
   *
   * LONG:
   * BUY  -> aumenta LONG
   * SELL -> reduz LONG
   *
   * SHORT:
   * SELL -> aumenta SHORT
   * BUY  -> reduz SHORT
   */

  if (ps === 'LONG') {

    return side === 'BUY'
      ? qty
      : -qty;
  }

  if (ps === 'SHORT') {

    return side === 'SELL'
      ? qty
      : -qty;
  }

  return side === 'BUY'
    ? qty
    : -qty;
}

/*
|--------------------------------------------------------------------------
| ÚLTIMO PNL FECHADO
|--------------------------------------------------------------------------
*/

async function getLastClosedPositionPnL(
  symbol = null,
  maxClosures = 5
) {

  try {

    const timestamp =
      Date.now();

    const params =
      new URLSearchParams();

    if (symbol) {
      params.set(
        'symbol',
        symbol
      );
    }

    params.set(
      'timestamp',
      String(timestamp)
    );

    params.set(
      'limit',
      '1000'
    );

    const query =
      params.toString();

    const signature =
      gerarAssinatura(query);

    const url =
      `${BASE_URL}/fapi/v1/userTrades?${query}&signature=${signature}`;

    const response =
      await axios.get(
        url,
        {
          headers: {
            'X-MBX-APIKEY': API_KEY
          },

          timeout: 10_000
        }
      );

    const trades =
      Array.isArray(response.data)
        ? response.data
        : [];

    if (!trades.length) {
      return [];
    }

    /*
     * Ordenamos cronologicamente.
     */

    trades.sort(
      (a, b) =>
        Number(a.time || 0) -
        Number(b.time || 0)
    );

    /*
     * Agrupamento por símbolo.
     */

    const bySymbol = {};

    for (const trade of trades) {

      const sym =
        trade.symbol;

      if (!sym) {
        continue;
      }

      if (!bySymbol[sym]) {
        bySymbol[sym] = [];
      }

      bySymbol[sym].push(trade);
    }

    const closures = [];

    /*
     * Reconstrução.
     */

    for (
      const sym of Object.keys(bySymbol)
    ) {

      const symbolTrades =
        bySymbol[sym];

      /*
       * Separação por positionSide.
       *
       * Isso evita misturar LONG e SHORT
       * caso a conta esteja em Hedge Mode.
       */

      const bySide = {};

      for (
        const trade of symbolTrades
      ) {

        const ps =
          trade.positionSide ||
          'BOTH';

        if (!bySide[ps]) {
          bySide[ps] = [];
        }

        bySide[ps].push(
          trade
        );
      }

      for (
        const ps of Object.keys(bySide)
      ) {

        const sideTrades =
          bySide[ps];

        let positionQty = 0;

        let pnlAcc = 0;

        let closeTrades = [];

        for (
          const trade of sideTrades
        ) {

          const delta =
            obterDeltaPosicao(
              trade,
              ps
            );

          const realized =
            Number(
              trade.realizedPnl || 0
            );

          const previousQty =
            positionQty;

          positionQty +=
            delta;

          pnlAcc +=
            realized;

          /*
           * Só consideramos fechamento quando
           * havia posição antes e ela chegou a zero.
           *
           * Isso evita tratar uma sequência
           * de trades de abertura como fechamento.
           */

          const positionClosed =
            previousQty !== 0 &&
            Math.abs(positionQty) < 1e-12;

          if (
            positionClosed
          ) {

            const lastTrade =
              trade;

            /*
             * Preço médio ponderado dos trades
             * que reduziram a posição.
             */

            let exitQty = 0;

            let exitValue = 0;

            for (
              const closeTrade
              of closeTrades
            ) {

              const closeQty =
                Number(
                  closeTrade.qty || 0
                );

              const closePrice =
                Number(
                  closeTrade.price || 0
                );

              if (
                closeQty > 0 &&
                closePrice > 0
              ) {

                exitQty +=
                  closeQty;

                exitValue +=
                  closeQty *
                  closePrice;
              }
            }

            /*
             * Inclui o trade atual.
             */

            const currentQty =
              Number(
                trade.qty || 0
              );

            const currentPrice =
              Number(
                trade.price || 0
              );

            if (
              currentQty > 0 &&
              currentPrice > 0
            ) {

              exitQty +=
                currentQty;

              exitValue +=
                currentQty *
                currentPrice;
            }

            const exitPrice =
              exitQty > 0
                ? exitValue / exitQty
                : currentPrice;

            closures.push({

              symbol: sym,

              positionSide: ps,

              pnl:
                Number(
                  pnlAcc.toFixed(8)
                ),

              exitPrice:
                Number(
                  exitPrice.toFixed(12)
                ),

              closedAt:
                new Date(
                  Number(
                    lastTrade.time
                  )
                ),

              tradeId:
                lastTrade.id ??
                null
            });

            /*
             * Reset para a próxima operação.
             */

            pnlAcc = 0;

            closeTrades = [];

            positionQty = 0;

          } else {

            /*
             * Se o trade está reduzindo a posição,
             * ele faz parte dos trades de saída.
             */

            if (
              previousQty !== 0 &&
              Math.abs(delta) <
                Math.abs(previousQty)
            ) {

              closeTrades.push(
                trade
              );

            } else if (
              previousQty !== 0 &&
              Math.sign(delta) !==
                Math.sign(previousQty)
            ) {

              closeTrades.push(
                trade
              );
            }

            /*
             * Se abriu uma nova posição,
             * limpamos a lista de fechamento.
             */

            if (
              previousQty === 0 &&
              positionQty !== 0
            ) {

              closeTrades = [];
            }
          }
        }
      }
    }

    /*
     * Mais recentes primeiro.
     */

    closures.sort(
      (a, b) =>
        Number(
          b.closedAt
        ) -
        Number(
          a.closedAt
        )
    );

    if (symbol) {

      return closures
        .filter(
          item =>
            item.symbol === symbol
        )
        .slice(
          0,
          maxClosures
        );
    }

    return closures.slice(
      0,
      maxClosures
    );

  } catch (err) {

    if (
      err.response &&
      err.response.data
    ) {

      console.error(
        '[positionsWorker] Erro API (userTrades):',
        err.response.status,
        JSON.stringify(
          err.response.data
        )
      );

    } else {

      console.error(
        '[positionsWorker] Erro ao buscar trades:',
        err.message
      );
    }

    return [];
  }
}

/*
|--------------------------------------------------------------------------
| SLEEP
|--------------------------------------------------------------------------
*/

function sleep(ms) {

  return new Promise(
    resolve =>
      setTimeout(
        resolve,
        ms
      )
  );
}

/*
|--------------------------------------------------------------------------
| OBTER SALDO
|--------------------------------------------------------------------------
*/

async function getCoin() {

  try {

    if (parentPort) {
      parentPort.postMessage('');
      parentPort.postMessage(
        '[ getQntbyBalance_Start ]'
      );
    }

    const delay =
      Math.floor(
        Math.random() * 5000
      ) + 1000;

    console.log(
      `Aguardando ${delay} ms antes de consultar balanço...`
    );

    await sleep(delay);

    const carteira =
      await api.accountFutures(
        Date.now()
      );

    if (
      !carteira ||
      !Array.isArray(
        carteira.assets
      )
    ) {

      return null;
    }

    const usdt =
      carteira.assets.find(
        asset =>
          asset.asset === 'USDT'
      );

    if (!usdt) {

      console.warn(
        '[positionsWorker] USDT não encontrado no balanço.'
      );

      return null;
    }

    if (parentPort) {

      parentPort.postMessage('');

      parentPort.postMessage(
        `[ coin0 ]: ${JSON.stringify(usdt)}`
      );
    }

    return usdt;

  } catch (err) {

    console.error(
      '[positionsWorker] Erro ao obter saldo:',
      err.message
    );

    return null;
  }
}

/*
|--------------------------------------------------------------------------
| WEBSOCKET
|--------------------------------------------------------------------------
*/

async function iniciarWs() {

  if (wsStarting) {
    return;
  }

  wsStarting = true;

  try {

    /*
     * Fecha conexão anterior.
     */

    if (ws) {

      try {
        ws.removeAllListeners();
      } catch (_) {}

      try {
        ws.terminate();
      } catch (_) {}

      ws = null;
    }

    /*
     * Cria nova listenKey.
     */

    listenKey =
      await criarListenKey();

    const wsUrl =
      `wss://fstream.binance.com/ws/${listenKey}`;

    ws =
      new WebSocket(
        wsUrl,
        {
          handshakeTimeout: 10_000
        }
      );

    ws.on(
      'open',
      async () => {

        wsStarting = false;

        console.log(
          '[positionsWorker] WebSocket conectado.'
        );

        /*
         * Primeiro recuperamos o cache.
         */

        carregarCacheLocal();

        /*
         * Depois sincronizamos com Binance.
         *
         * Isso é importante para que o Telegram
         * receba o estado real da posição.
         */

        await sincronizarPosicoesAtuais();

        /*
         * Recupera último PNL conhecido.
         */

        try {

          const res =
            await getLastClosedPositionPnL();

          lastPNL =
            Array.isArray(res)
              ? res
              : [];

        } catch (err) {

          lastPNL = [];

          console.error(
            '[positionsWorker] Erro ao obter último PNL:',
            err.message
          );
        }

        /*
         * Atualiza saldo.
         */

        coin =
          await getCoin();

        /*
         * Inicia renovação da listenKey.
         */

        iniciarRenovacaoListenKey();

        /*
         * Inicia sincronização periódica.
         */

        iniciarVerificacaoPeriodica(
          REST_SYNC_INTERVAL_MINUTES
        );
      }
    );

    ws.on(
      'message',
      async msg => {

        try {

          const data =
            JSON.parse(
              msg.toString()
            );

          /*
           * ACCOUNT_UPDATE
           */

          if (
            data.e !==
            'ACCOUNT_UPDATE'
          ) {

            return;
          }

          const posicoes =
            data.a?.P || [];

          if (!Array.isArray(posicoes)) {
            return;
          }

          /*
           * Começamos com o estado atual.
           */

          const novas = {
            ...positions
          };

          /*
           * Processamos cada posição recebida.
           */

          for (
            const p of posicoes
          ) {

            const symbol =
              p.s;

            if (!symbol) {
              continue;
            }

            const positionAmt =
              Number(p.pa) || 0;

            const previous =
              positions[symbol];

            /*
             * posição zerada
             */

            if (
              Math.abs(positionAmt) === 0
            ) {

              delete novas[symbol];

              continue;
            }

            /*
             * IMPORTANTE:
             *
             * p.cr NÃO É ALAVANCAGEM.
             *
             * Portanto NÃO usamos p.cr aqui.
             *
             * Mantemos a alavancagem já obtida
             * pelo positionRisk REST.
             */

            let leverage =
              Number(
                previous?.leverage
              ) || 0;

            /*
             * Se não temos leverage no cache,
             * fazemos uma sincronização REST posteriormente.
             *
             * Não fazemos uma chamada REST para cada
             * ACCOUNT_UPDATE para evitar excesso de requests.
             */

            const entryPrice =
              Number(p.ep) || 0;

            const markPrice =
              Number(p.mp) || 0;

            const unrealizedProfit =
              Number(p.up) || 0;

            const liquidationPrice =
              Number(p.l) || 0;

            const marginType =
              p.mt ||
              previous?.marginType ||
              'isolated';

            const isolatedMargin =
              Number(p.iw) || 0;

            const positionSide =
              p.ps ||
              previous?.positionSide ||
              'BOTH';

            /*
             * Se por algum motivo não temos
             * leverage, usamos 1 apenas para
             * evitar NaN no cálculo.
             *
             * A sincronização REST corrigirá
             * esse valor.
             */

            if (
              leverage <= 0
            ) {

              leverage = 1;
            }

            const novaPosicao =
              criarDadosPosicao({

                symbol,

                positionAmt,

                entryPrice,

                markPrice,

                unrealizedProfit,

                liquidationPrice,

                leverage,

                marginType,

                isolatedMargin,

                positionSide,

                previousPosition:
                  previous
              });

            novas[symbol] =
              novaPosicao;
          }

          /*
           * Atualiza estado.
           */

          positions =
            novas;

          /*
           * Salva atomicamente.
           */

          salvarCache();

          console.log(
            `[positionsWorker] Cache atualizado via WS (${Object.keys(positions).length} posições).`
          );

          /*
           * Atualiza saldo.
           */

          coin =
            await getCoin();

          /*
           * Atualiza último PNL.
           *
           * Esta consulta só é feita quando
           * chega ACCOUNT_UPDATE.
           */

          try {

            const res =
              await getLastClosedPositionPnL();

            if (
              Array.isArray(res) &&
              res.length
            ) {

              lastPNL =
                res;

              if (parentPort) {

                parentPort.postMessage(
                  `lastPNL atualizado: ${JSON.stringify(lastPNL)}`
                );
              }

            } else {

              lastPNL = [];

              if (parentPort) {

                parentPort.postMessage(
                  'lastPNL: nenhum fechamento recente encontrado'
                );
              }
            }

          } catch (err) {

            if (parentPort) {

              parentPort.postMessage(
                `erro ao obter lastPNL: ${err.message || err}`
              );
            }

            console.error(
              '[positionsWorker] atualizarLastPnl error:',
              err
            );
          }

        } catch (err) {

          console.error(
            '[positionsWorker] Erro ao processar WS:',
            err.message
          );
        }
      }
    );

    ws.on(
      'close',
      (code, reason) => {

        console.warn(
          `[positionsWorker] WS fechado (code=${code}, reason=${reason ? reason.toString() : ''}). Reabrindo em ${WS_RECONNECT_DELAY / 1000}s...`
        );

        listenKey = null;

        ws = null;

        wsStarting = false;

        setTimeout(
          () => {

            iniciarWs()
              .catch(
                err =>
                  console.error(
                    '[positionsWorker] Erro na reconexão:',
                    err.message
                  )
              );

          },
          WS_RECONNECT_DELAY
        );
      }
    );

    ws.on(
      'error',
      err => {

        console.error(
          '[positionsWorker] WS erro:',
          err.message || err
        );

        try {
          ws.terminate();
        } catch (_) {}
      }
    );

  } catch (err) {

    wsStarting = false;

    console.error(
      '[positionsWorker] Erro ao iniciar WS:',
      err.message || err
    );

    /*
     * Tenta novamente.
     */

    setTimeout(
      () => {

        iniciarWs()
          .catch(
            retryErr =>
              console.error(
                '[positionsWorker] Erro na tentativa de reconexão:',
                retryErr.message
              )
          );

      },
      WS_RECONNECT_DELAY
    );
  }
}

/*
|--------------------------------------------------------------------------
| API PÚBLICA DO WORKER
|--------------------------------------------------------------------------
*/

function getPositions() {
  return positions;
}

async function getBalance() {
  return coin;
}

async function getLastPnL() {
  return lastPNL;
}

/*
|--------------------------------------------------------------------------
| INICIALIZAÇÃO
|--------------------------------------------------------------------------
*/
verificarInternet();

carregarCacheLocal();

iniciarWs();

/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/

module.exports = {

  getPositions,

  getLastPnL,

  getBalance

};