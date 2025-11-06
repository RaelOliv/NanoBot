// workers/positionCache.js
const positionCache = {
  positions: {},  // exemplo: { BTCUSDT: { positionAmt: '0.5', entryPrice: '68000' } }
  count: 0,
};

module.exports = positionCache;