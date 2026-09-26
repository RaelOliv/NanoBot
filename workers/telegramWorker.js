const fs = require("fs");
const path = require("path");
const axios = require("axios");
const crypto = require("crypto");

require("dotenv").config();

// ============================================================
// CONFIGURAÇÕES
// ============================================================

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_API =
  `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;

const BASE_URL =
  "https://fapi.binance.com";

const CACHE_DIR =
  path.resolve(__dirname, "cache");

const CACHE_PATH =
  path.resolve(
    CACHE_DIR,
    "cachepos.json"
  );

const USERS_PATH =
  path.resolve(
    CACHE_DIR,
    "users.json"
  );

const MESSAGES_PATH =
  path.resolve(
    CACHE_DIR,
    "telegramMessages.json"
  );

// ============================================================
// PREPARAÇÃO DOS ARQUIVOS
// ============================================================

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(
    CACHE_DIR,
    {
      recursive: true
    }
  );
}

if (!fs.existsSync(USERS_PATH)) {
  fs.writeFileSync(
    USERS_PATH,
    "{}"
  );
}

if (!fs.existsSync(MESSAGES_PATH)) {
  fs.writeFileSync(
    MESSAGES_PATH,
    "{}"
  );
}

// ============================================================
// ESTADO
// ============================================================

let ultimoCache =
  carregarCache();

let usuarios = {};

let mensagensAtivas =
  carregarMensagens();

// Evita duas verificações simultâneas
let monitorando = false;

// Evita duas confirmações de fechamento
// simultâneas para o mesmo símbolo
const fechamentosPendentes =
  new Map();

// ============================================================
// CACHE DE POSIÇÕES
// ============================================================

function carregarCache() {

  try {

    if (!fs.existsSync(CACHE_PATH)) {
      return {};
    }

    const data =
      fs.readFileSync(
        CACHE_PATH,
        "utf8"
      );

    return JSON.parse(
      data || "{}"
    );

  } catch (err) {

    console.error(
      "[telegramWorker] " +
      "Erro ao carregar cache:",
      err.message
    );

    return {};
  }
}

// ============================================================
// USUÁRIOS
// ============================================================

function carregarUsuarios() {

  try {

    const data =
      fs.readFileSync(
        USERS_PATH,
        "utf8"
      );

    return JSON.parse(
      data || "{}"
    );

  } catch (err) {

    console.error(
      "[telegramWorker] " +
      "Erro ao carregar usuários:",
      err.message
    );

    return {};
  }
}

function salvarUsuarios(users) {

  try {

    fs.writeFileSync(
      USERS_PATH,
      JSON.stringify(
        users,
        null,
        2
      )
    );

  } catch (err) {

    console.error(
      "[telegramWorker] " +
      "Erro ao salvar usuários:",
      err.message
    );
  }
}

// ============================================================
// MENSAGENS TELEGRAM ATIVAS
// ============================================================

function carregarMensagens() {

  try {

    const data =
      fs.readFileSync(
        MESSAGES_PATH,
        "utf8"
      );

    return JSON.parse(
      data || "{}"
    );

  } catch (err) {

    console.error(
      "[telegramWorker] " +
      "Erro ao carregar mensagens:",
      err.message
    );

    return {};
  }
}

function salvarMensagens() {

  try {

    fs.writeFileSync(
      MESSAGES_PATH,
      JSON.stringify(
        mensagensAtivas,
        null,
        2
      )
    );

  } catch (err) {

    console.error(
      "[telegramWorker] " +
      "Erro ao salvar mensagens:",
      err.message
    );
  }
}

function registrarMensagem(
  symbol,
  uid,
  messageId,
  openedAt
) {

  if (
    !mensagensAtivas[symbol]
  ) {
    mensagensAtivas[symbol] = {};
  }

  mensagensAtivas[symbol][uid] = {
    message_id: messageId,
    openedAt: openedAt || Date.now()
  };

  salvarMensagens();
}

function obterMensagem(
  symbol,
  uid
) {

  if (
    !mensagensAtivas[symbol]
  ) {
    return null;
  }

  return (
    mensagensAtivas[symbol][uid] ||
    null
  );
}

function removerMensagem(
  symbol,
  uid
) {

  if (
    !mensagensAtivas[symbol]
  ) {
    return;
  }

  delete mensagensAtivas[symbol][uid];

  if (
    Object.keys(
      mensagensAtivas[symbol]
    ).length === 0
  ) {

    delete mensagensAtivas[symbol];
  }

  salvarMensagens();
}

// ============================================================
// DESCOBRIR USUÁRIOS
// ============================================================

async function obterUsuarios() {

  try {

    const res =
      await axios.get(
        `${TELEGRAM_API}/getUpdates`,
        {
          timeout: 10000
        }
      );

    const updates =
      res.data?.result || [];

    const users =
      carregarUsuarios();

    for (
      const update of updates
    ) {

      const msg =
        update.message;

      if (
        !msg ||
        !msg.chat ||
        !msg.chat.id
      ) {
        continue;
      }

      const id =
        String(msg.chat.id);

      if (!users[id]) {

        users[id] = {

          first_name:
            msg.chat.first_name ||
            "Usuário",

          username:
            msg.chat.username ||
            null,

          active: true
        };

        console.log(
          `👤 Novo usuário detectado: ` +
          `${users[id].first_name} (${id})`
        );
      }
    }

    salvarUsuarios(users);

    return users;

  } catch (err) {

    console.error(
      "[telegramWorker] " +
      "Erro ao obter usuários:",
      err.message
    );

    return carregarUsuarios();
  }
}

// ============================================================
// TELEGRAM - ENVIAR
// ============================================================

async function enviarMensagem(
  uid,
  texto
) {

  try {

    const res =
      await axios.post(
        `${TELEGRAM_API}/sendMessage`,
        {
          chat_id: uid,
          text: texto,
          parse_mode: "HTML"
        },
        {
          timeout: 10000
        }
      );

    return (
      res.data?.result ||
      null
    );

  } catch (err) {

    const status =
      err.response?.status;

    if (
      status === 429 ||
      status === 418
    ) {

      const retryAfter =
        err.response?.data
          ?.parameters
          ?.retry_after || 5;

      console.error(
        `[Telegram] Rate limit ` +
        `para ${uid}. ` +
        `Aguardando ${retryAfter}s.`
      );

      await sleep(
        (retryAfter + 1) * 1000
      );

      return null;
    }

    console.error(
      `[Telegram] Erro enviando ` +
      `para ${uid}:`,
      err.response?.data ||
      err.message
    );

    return null;
  }
}

// ============================================================
// TELEGRAM - EDITAR
// ============================================================

async function editarMensagem(
  uid,
  messageId,
  texto
) {

  try {

    await axios.post(
      `${TELEGRAM_API}/editMessageText`,
      {
        chat_id: uid,
        message_id: messageId,
        text: texto,
        parse_mode: "HTML"
      },
      {
        timeout: 10000
      }
    );

    return true;

  } catch (err) {

    const description =
      err.response?.data
        ?.description || "";

    // Telegram informa isso quando
    // o conteúdo não mudou.
    if (
      description.includes(
        "message is not modified"
      )
    ) {

      return true;
    }

    console.error(
      `[Telegram] Falha editando ` +
      `mensagem ${messageId} ` +
      `para ${uid}:`,
      description ||
      err.message
    );

    return false;
  }
}

// ============================================================
// MENSAGEM DE ABERTURA
// ============================================================

function gerarMensagemInicial(
  pos
) {

  return (
    `━━━━━━━━━━━━━━━\n` +
    `📊 <b>${pos.symbol}</b>\n` +
    `━━━━━━━━━━━━━━━\n` +
    `🟢 <b>Posição Aberta</b>\n` +
    `💵 Preço de entrada: ${pos.entryPrice}\n` +
    `📈 Lado: ${pos.positionSide}\n` +
    `📊 Quantidade: ${pos.positionAmt}\n` +
    `⚙️ Alavancagem: ${pos.leverage}x\n` +
    `🕒 Abertura: ` +
    `${new Date(
      pos.openedAt
    ).toLocaleString()}\n` +
    `━━━━━━━━━━━━━━━`
  );
}

// ============================================================
// MENSAGEM ATIVA
// ============================================================

function calcularPnL(
  pos
) {

  const pnl =
    Number(
      pos.unRealizedProfit || 0
    );

  const percent =
    Number(
      pos.percent || 0
    );

  return {
    pnl,
    percent
  };
}

function gerarMensagemAtiva(
  pos
) {

  const resultado =
    calcularPnL(pos);

  const pnlFmt =
    resultado.pnl >= 0
      ? `🟩 +${resultado.pnl.toFixed(4)} USDT`
      : `🟥 ${resultado.pnl.toFixed(4)} USDT`;

  const pctFmt =
    resultado.percent >= 0
      ? `📈 +${resultado.percent.toFixed(2)}%`
      : `📉 ${resultado.percent.toFixed(2)}%`;

  return (
    `━━━━━━━━━━━━━━━\n` +
    `📊 <b>${pos.symbol}</b>\n` +
    `━━━━━━━━━━━━━━━\n` +
    `🟡 <b>Posição Ativa</b>\n` +
    `💵 Entrada: ${pos.entryPrice}\n` +
    `💰 Preço atual: ${pos.markPrice}\n` +
    `📊 Lucro atual: ${pnlFmt}\n` +
    `📉 Variação: ${pctFmt}\n` +
    `🕒 Abertura: ` +
    `${new Date(
      pos.openedAt
    ).toLocaleString()}\n` +
    `━━━━━━━━━━━━━━━`
  );
}

// ============================================================
// MENSAGEM FINAL
// ============================================================

function gerarMensagemFinal(
  symbol,
  pos,
  fechamento
) {

  const entry =
    Number(
      pos.entryPrice || 0
    );

  const exitPrice =
    Number(
      fechamento?.exitPrice ||
      pos.markPrice ||
      entry
    );

  const pnl =
    Number(
      fechamento?.pnl || 0
    );

  const percent =
    Number(
      fechamento?.percent ??
      pos.percent ??
      0
    );

  const openedAt =
    pos.openedAt
      ? new Date(pos.openedAt)
      : new Date();

  const closedAt =
    fechamento?.closedAt
      ? new Date(fechamento.closedAt)
      : new Date();

  const duration =
    Math.max(
      0,
      closedAt - openedAt
    );

  const durationMin =
    Math.floor(
      duration / 60000
    );

  const durationHr =
    Math.floor(
      durationMin / 60
    );

  const durationFmt =
    durationHr > 0
      ? `${durationHr}h ` +
        `${durationMin % 60}min`
      : `${durationMin}min`;

  const pnlFmt =
    pnl >= 0
      ? `🟩 +${pnl.toFixed(4)} USDT`
      : `🟥 ${pnl.toFixed(4)} USDT`;

  const pctFmt =
    percent >= 0
      ? `📈 +${percent.toFixed(2)}%`
      : `📉 ${percent.toFixed(2)}%`;

  return (
    `━━━━━━━━━━━━━━━\n` +
    `📊 <b>${symbol}</b>\n` +
    `━━━━━━━━━━━━━━━\n` +
    `⚫ <b>Posição Encerrada</b>\n` +
    `💵 Entrada: ${entry}\n` +
    `💸 Saída: ${exitPrice.toFixed(4)}\n` +
    `📊 Resultado: ${pnlFmt}\n` +
    `📉 Variação: ${pctFmt}\n` +
    `⏱️ Duração: ${durationFmt}\n` +
    `🕒 Abertura: ` +
    `${openedAt.toLocaleString()}\n` +
    `🕒 Fechamento: ` +
    `${closedAt.toLocaleString()}\n` +
    `━━━━━━━━━━━━━━━`
  );
}

// ============================================================
// BINANCE - ASSINATURA
// ============================================================

function assinar(
  query
) {

  return crypto
    .createHmac(
      "sha256",
      SECRET_KEY
    )
    .update(query)
    .digest("hex");
}

// ============================================================
// BINANCE - POSITION RISK
// ============================================================

async function obterPosicaoBinance(
  symbol
) {

  try {

    const timestamp =
      Date.now();

    const query =
      `symbol=${encodeURIComponent(symbol)}` +
      `&timestamp=${timestamp}`;

    const signature =
      assinar(query);

    const url =
      `${BASE_URL}/fapi/v2/positionRisk?` +
      `${query}&signature=${signature}`;

    const res =
      await axios.get(
        url,
        {
          headers: {
            "X-MBX-APIKEY": API_KEY
          },
          timeout: 5000
        }
      );

    if (
      !Array.isArray(res.data)
    ) {
      return null;
    }

    return (
      res.data.find(
        p => p.symbol === symbol
      ) || null
    );

  } catch (err) {

    console.error(
      `[telegramWorker] Erro ` +
      `consultando ${symbol}:`,
      err.response?.data ||
      err.message
    );

    return null;
  }
}

// ============================================================
// NORMALIZAR DIREÇÃO DO TRADE
// ============================================================

function obterDeltaPosicao(
  trade
) {

  const qty =
    Number(
      trade.qty || 0
    );

  if (!qty) {
    return 0;
  }

  const side =
    String(
      trade.side || ""
    ).toUpperCase();

  const positionSide =
    String(
      trade.positionSide ||
      "BOTH"
    ).toUpperCase();

  /*
   * BOTH:
   *
   * BUY  = +qty
   * SELL = -qty
   *
   * LONG:
   *
   * BUY  = +qty
   * SELL = -qty
   *
   * SHORT:
   *
   * SELL = +qty
   * BUY  = -qty
   */

  if (
    positionSide === "SHORT"
  ) {

    return side === "SELL"
      ? qty
      : -qty;
  }

  return side === "BUY"
    ? qty
    : -qty;
}

// ============================================================
// IDENTIFICAR SE TRADE É DE FECHAMENTO
// ============================================================

function tradeReduzPosicao(
  delta,
  positionBefore
) {

  if (!positionBefore) {
    return false;
  }

  // posição positiva sendo reduzida
  if (
    positionBefore > 0 &&
    delta < 0
  ) {
    return true;
  }

  // posição negativa sendo reduzida
  if (
    positionBefore < 0 &&
    delta > 0
  ) {
    return true;
  }

  return false;
}

// ============================================================
// RECONSTRUIR ÚLTIMO FECHAMENTO
// ============================================================

async function obterUltimoFechamento(
  symbol,
  posAnterior
) {

  try {

    const timestamp =
      Date.now();

    /*
     * Binance Futures permite até 1000
     * userTrades por consulta.
     *
     * Não usamos somente o último trade.
     * Reconstruímos os ciclos de posição.
     */

    const query =
      `symbol=${encodeURIComponent(symbol)}` +
      `&timestamp=${timestamp}` +
      `&limit=1000`;

    const signature =
      assinar(query);

    const url =
      `${BASE_URL}/fapi/v1/userTrades?` +
      `${query}&signature=${signature}`;

    const res =
      await axios.get(
        url,
        {
          headers: {
            "X-MBX-APIKEY": API_KEY
          },
          timeout: 10000
        }
      );

    let trades =
      Array.isArray(res.data)
        ? res.data
        : [];

    if (!trades.length) {
      return null;
    }

    // Mais antigo → mais recente
    trades.sort(
      (a, b) =>
        Number(a.time || 0) -
        Number(b.time || 0)
    );

    /*
     * Agrupamos por positionSide.
     *
     * Isso é importante caso a conta esteja
     * em Hedge Mode.
     */

    const grupos = {};

    for (
      const trade of trades
    ) {

      const positionSide =
        String(
          trade.positionSide ||
          "BOTH"
        ).toUpperCase();

      if (
        !grupos[positionSide]
      ) {
        grupos[positionSide] = [];
      }

      grupos[positionSide].push(
        trade
      );
    }

    const fechamentos = [];

    // ========================================================
    // RECONSTRUÇÃO DE CADA POSITION SIDE
    // ========================================================

    for (
      const positionSide
      of Object.keys(grupos)
    ) {

      const lista =
        grupos[positionSide];

      let positionQty = 0;

      let fechamentoAtual = null;

      for (
        const trade of lista
      ) {

        const delta =
          obterDeltaPosicao(
            trade
          );

        const before =
          positionQty;

        const reduzindo =
          tradeReduzPosicao(
            delta,
            before
          );

        // ====================================================
        // FILL DE FECHAMENTO
        // ====================================================

        if (reduzindo) {

          if (
            !fechamentoAtual
          ) {

            fechamentoAtual = {
              symbol,
              positionSide,
              pnl: 0,
              quantity: 0,
              exitNotional: 0,
              firstTime:
                Number(
                  trade.time || 0
                ),
              lastTime:
                Number(
                  trade.time || 0
                ),
              trades: []
            };
          }

          const qty =
            Math.abs(
              Number(
                trade.qty || 0
              )
            );

          const price =
            Number(
              trade.price || 0
            );

          const realizedPnl =
            Number(
              trade.realizedPnl || 0
            );

          fechamentoAtual.pnl +=
            realizedPnl;

          fechamentoAtual.quantity +=
            qty;

          fechamentoAtual.exitNotional +=
            qty * price;

          fechamentoAtual.lastTime =
            Number(
              trade.time || 0
            );

          fechamentoAtual.trades.push(
            trade
          );
        }

        // Atualiza posição
        positionQty += delta;

        /*
         * Normalização de pequenos erros
         * de ponto flutuante.
         */
        if (
          Math.abs(positionQty) < 1e-12
        ) {
          positionQty = 0;
        }

        // ====================================================
        // POSIÇÃO TOTALMENTE FECHADA
        // ====================================================

        if (
          positionQty === 0 &&
          fechamentoAtual
        ) {

          fechamentoAtual.exitPrice =
            fechamentoAtual.quantity > 0
              ? fechamentoAtual.exitNotional /
                fechamentoAtual.quantity
              : 0;

          fechamentoAtual.closedAt =
            new Date(
              fechamentoAtual.lastTime
            );

          fechamentoAtual.pnl =
            Number(
              fechamentoAtual.pnl.toFixed(8)
            );

          fechamentoAtual.exitPrice =
            Number(
              fechamentoAtual.exitPrice.toFixed(8)
            );

          fechamentos.push(
            fechamentoAtual
          );

          fechamentoAtual = null;
        }
      }
    }

    if (
      !fechamentos.length
    ) {

      console.log(
        `[telegramWorker] ` +
        `Nenhum ciclo completo de ` +
        `fechamento encontrado para ${symbol}.`
      );

      return null;
    }

    // Mais recente primeiro
    fechamentos.sort(
      (a, b) =>
        b.lastTime -
        a.lastTime
    );

    /*
     * O primeiro fechamento é o mais recente.
     */
    const fechamento =
      fechamentos[0];

    /*
     * Percentual:
     *
     * Se o positionWorker já calculou
     * o percentual da posição anterior,
     * usamos esse valor como referência.
     *
     * Caso contrário calculamos a partir
     * do PNL e margem aproximada.
     */

    let percent =
      Number(
        posAnterior?.percent || 0
      );

    if (
      !Number.isFinite(percent)
    ) {
      percent = 0;
    }

    return {
      symbol,
      positionSide:
        fechamento.positionSide,

      pnl:
        fechamento.pnl,

      quantity:
        fechamento.quantity,

      exitPrice:
        fechamento.exitPrice,

      percent,

      closedAt:
        fechamento.closedAt,

      tradeCount:
        fechamento.trades.length
    };

  } catch (err) {

    console.error(
      `[telegramWorker] Erro reconstruindo ` +
      `fechamento de ${symbol}:`,
      err.response?.data ||
      err.message
    );

    return null;
  }
}

// ============================================================
// PROCESSAR ABERTURA
// ============================================================

async function processarAbertura(
  symbol,
  pos
) {

  for (
    const uid of Object.keys(
      usuarios
    )
  ) {

    const usuario =
      usuarios[uid];

    if (
      !usuario ||
      !usuario.active
    ) {
      continue;
    }

    /*
     * Se já existe mensagem para esse
     * usuário/símbolo, não criamos outra.
     */

    if (
      obterMensagem(
        symbol,
        uid
      )
    ) {
      continue;
    }

    const texto =
      gerarMensagemInicial(
        pos
      );

    const msg =
      await enviarMensagem(
        uid,
        texto
      );

    if (
      msg &&
      msg.message_id
    ) {

      registrarMensagem(
        symbol,
        uid,
        msg.message_id,
        pos.openedAt
      );

      console.log(
        `[telegramWorker] ` +
        `Mensagem criada: ` +
        `${symbol} → ${uid} → ` +
        `${msg.message_id}`
      );
    }
  }
}

// ============================================================
// PROCESSAR ATUALIZAÇÃO
// ============================================================

async function processarAtualizacao(
  symbol,
  pos
) {

  const texto =
    gerarMensagemAtiva(
      pos
    );

  for (
    const uid of Object.keys(
      usuarios
    )
  ) {

    const usuario =
      usuarios[uid];

    if (
      !usuario ||
      !usuario.active
    ) {
      continue;
    }

    const registro =
      obterMensagem(
        symbol,
        uid
      );

    /*
     * Se por algum motivo não existe
     * message_id, criamos uma mensagem
     * inicial e passamos a controlá-la.
     */

    if (!registro) {

      await processarAbertura(
        symbol,
        pos
      );

      continue;
    }

    await editarMensagem(
      uid,
      registro.message_id,
      texto
    );
  }
}

// ============================================================
// PROCESSAR FECHAMENTO
// ============================================================

async function processarFechamento(
  symbol,
  posAnterior
) {

  if (
    fechamentosPendentes.has(
      symbol
    )
  ) {

    return;
  }

  const promise =
    (async () => {

      /*
       * Pequeno intervalo para permitir
       * que a Binance consolide ACCOUNT_UPDATE.
       */

      await sleep(1500);

      const posAtual =
        await obterPosicaoBinance(
          symbol
        );

      // ======================================================
      // AINDA ESTÁ ABERTA
      // ======================================================

      if (
        posAtual &&
        Number(
          posAtual.positionAmt
        ) !== 0
      ) {

        console.log(
          `[telegramWorker] ` +
          `${symbol} ainda está aberta ` +
          `(${posAtual.positionAmt}).`
        );

        return;
      }

      // ======================================================
      // NÃO FOI POSSÍVEL CONFIRMAR
      // ======================================================

      if (
        posAtual === null
      ) {

        console.log(
          `[telegramWorker] ` +
          `Não foi possível confirmar ` +
          `o fechamento de ${symbol}.`
        );

        return;
      }

      console.log(
        `[telegramWorker] 🔴 ` +
        `Fechamento confirmado: ${symbol}`
      );

      // ======================================================
      // RECONSTRUIR FECHAMENTO
      // ======================================================

      const fechamento =
        await obterUltimoFechamento(
          symbol,
          posAnterior
        );

      /*
       * Se não conseguimos reconstruir
       * o fechamento, NÃO devemos declarar
       * um resultado falso.
       */

      if (!fechamento) {

        console.log(
          `[telegramWorker] ` +
          `Fechamento de ${symbol} ` +
          `confirmado, porém o histórico ` +
          `ainda não permitiu reconstruir ` +
          `PNL/saída.`
        );

        return;
      }

      const texto =
        gerarMensagemFinal(
          symbol,
          posAnterior,
          fechamento
        );

      // ======================================================
      // EDITAR A MESMA MENSAGEM
      // ======================================================

      for (
        const uid of Object.keys(
          usuarios
        )
      ) {

        const usuario =
          usuarios[uid];

        if (
          !usuario ||
          !usuario.active
        ) {
          continue;
        }

        const registro =
          obterMensagem(
            symbol,
            uid
          );

        if (registro) {

          await editarMensagem(
            uid,
            registro.message_id,
            texto
          );

          console.log(
            `[telegramWorker] ` +
            `Mensagem final editada: ` +
            `${symbol} → ${uid} → ` +
            `${registro.message_id}`
          );

        } else {

          /*
           * Fallback para o caso de o worker
           * ter reiniciado e perdido o message_id.
           */

          const msg =
            await enviarMensagem(
              uid,
              texto
            );

          if (
            msg &&
            msg.message_id
          ) {

            console.log(
              `[telegramWorker] ` +
              `Mensagem final criada ` +
              `como fallback: ${symbol}`
            );
          }
        }

        /*
         * A operação terminou.
         * O message_id deixa de ser uma
         * mensagem ativa.
         */

        removerMensagem(
          symbol,
          uid
        );
      }

    })();

  fechamentosPendentes.set(
    symbol,
    promise
  );

  try {

    await promise;

  } finally {

    fechamentosPendentes.delete(
      symbol
    );
  }
}

// ============================================================
// MONITORAMENTO DO CACHE
// ============================================================

async function verificarAlteracoes() {

  if (monitorando) {
    return;
  }

  monitorando = true;

  try {

    const novoCache =
      carregarCache();

    // ========================================================
    // POSIÇÕES EXISTENTES NO NOVO CACHE
    // ========================================================

    for (
      const symbol of Object.keys(
        novoCache
      )
    ) {

      const nova =
        novoCache[symbol];

      const antiga =
        ultimoCache[symbol];

      const novaAberta =
        Number(
          nova.positionAmt || 0
        ) !== 0;

      const antigaAberta =
        !!(
          antiga &&
          Number(
            antiga.positionAmt || 0
          ) !== 0
        );

      // ======================================================
      // NOVA POSIÇÃO
      // ======================================================

      if (
        novaAberta &&
        !antigaAberta
      ) {

        console.log(
          `[telegramWorker] 🟢 ` +
          `Nova posição: ${symbol}`
        );

        await processarAbertura(
          symbol,
          nova
        );

        continue;
      }

      // ======================================================
      // POSIÇÃO CONTINUA ABERTA
      // ======================================================

      if (
        novaAberta &&
        antigaAberta
      ) {

        const mudou =
          String(
            nova.markPrice
          ) !==
          String(
            antiga.markPrice
          ) ||

          String(
            nova.unRealizedProfit
          ) !==
          String(
            antiga.unRealizedProfit
          ) ||

          String(
            nova.percent
          ) !==
          String(
            antiga.percent
          );

        if (mudou) {

          await processarAtualizacao(
            symbol,
            nova
          );
        }
      }
    }
// ========================================================
    // POSIÇÕES QUE DESAPARECERAM
    // ========================================================

    for (
      const symbol of Object.keys(
        ultimoCache
      )
    ) {

      const antiga =
        ultimoCache[symbol];

      const existiaAberta =
        Number(
          antiga.positionAmt || 0
        ) !== 0;

      const aindaExiste =
        novoCache[symbol] &&
        Number(
          novoCache[symbol]
            .positionAmt || 0
        ) !== 0;

      if (
        existiaAberta &&
        !aindaExiste
      ) {

        console.log(
          `[telegramWorker] ⚠️ ` +
          `${symbol} desapareceu do cache. ` +
          `Confirmando fechamento...`
        );

        await processarFechamento(
          symbol,
          antiga
        );
      }
    }

    ultimoCache =
      novoCache;

  } catch (err) {

    console.error(
      "[telegramWorker] " +
      "Erro no monitoramento:",
      err.message
    );

  } finally {

    monitorando = false;
  }
}

// ============================================================
// SLEEP
// ============================================================

function sleep(ms) {

  return new Promise(
    resolve =>
      setTimeout(
        resolve,
        ms
      )
  );
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================

(async () => {

  if (!TELEGRAM_TOKEN) {

    console.error(
      "❌ TELEGRAM_TOKEN não definido no .env"
    );

    process.exit(1);
  }

  if (
    !API_KEY ||
    !SECRET_KEY
  ) {

    console.error(
      "❌ API_KEY/SECRET_KEY não definidos no .env"
    );

    process.exit(1);
  }

  usuarios =
    await obterUsuarios();

  if (
    Object.keys(
      usuarios
    ).length === 0
  ) {

    console.log(
      "⚠️ Nenhum usuário detectado. " +
      "Envie uma mensagem ao bot."
    );

    process.exit(1);
  }

  console.log(
    `✅ Telegram Worker iniciado ` +
    `(${Object.keys(usuarios).length} usuários)`
  );

  /*
   * Importante:
   *
   * O cache inicial NÃO é tratado como
   * novas operações. Isso evita que o
   * restart do worker envie mensagens
   * duplicadas para posições que já
   * estavam abertas.
   */

  ultimoCache =
    carregarCache();

  setInterval(
    async () => {

      usuarios =
        await obterUsuarios();

      await verificarAlteracoes();

    },
    4000
  );

})();