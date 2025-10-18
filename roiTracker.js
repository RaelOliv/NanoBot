// roiTracker.js
// ROI máximo/mínimo de posições abertas + histórico em JSON (com ROI final + ID incremental)

const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, 'roiTracker.json');

// Carregar dados salvos
function loadStore() {
  try {
    if (fs.existsSync(FILE_PATH)) {
      return JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));
    }
    return { positions: {}, history: [], lastId: 0 };
  } catch (err) {
    console.error("Erro ao carregar ROI store:", err);
    return { positions: {}, history: [], lastId: 0 };
  }
}

// Salvar dados no JSON
function saveStore(store) {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(store, null, 2));
  } catch (err) {
    console.error("Erro ao salvar ROI store:", err);
  }
}

let roiStore = loadStore();

// Inicializa posição
function initPosition(symbol, roiAtual = 0) {
  
  if(roiStore.positions[symbol] == null || roiStore.positions[symbol] == undefined){
  roiStore.positions[symbol] = {
    roiMax: roiAtual,
    roiMin: roiAtual,
    roiFinal: roiAtual,   // ROI atual será atualizado até fechar
    isOpen: true,
    openedAt: Date.now(),
  };
  saveStore(roiStore);
  }else{
    return;
  }
  
}

// Atualiza ROI
function updateRoi(symbol, roiAtual) {
  const pos = roiStore.positions[symbol];
  
  if(!pos){
    initPosition(symbol, roiAtual = 0);
  }
  if (pos === null || pos === undefined) return;
  if (!pos) return;
  if (!pos.isOpen) return;

  if (parseFloat(roiAtual) > parseFloat(pos.roiMax)){ pos.roiMax = roiAtual;}
  if (parseFloat(roiAtual) < parseFloat(pos.roiMin)){ pos.roiMin = roiAtual;}

  pos.roiFinal = roiAtual; // sempre guarda o último ROI

  roiStore.positions[symbol] = pos;
  saveStore(roiStore);
  
}

// Fecha posição e registra no histórico
function closePosition(symbol) {
  
  const pos = roiStore.positions[symbol];
  if (!pos) return null;

  // Gera novo ID incremental
  roiStore.lastId = (roiStore.lastId || 0) + 1;

  const closedPos = {
    tradeId: roiStore.lastId,
    symbol,
    roiMax: pos.roiMax,
    roiMin: pos.roiMin,
    roiFinal: pos.roiFinal,
    openedAt: pos.openedAt,
    closedAt: Date.now(),
  };

  // adiciona ao histórico
  roiStore.history.push(closedPos);

  // reseta posição
  //roiStore.positions[symbol] = { roiMax: 0, roiMin: 0, roiFinal: 0, isOpen: false };
  
  // reseta posição
  roiStore.positions[symbol] = undefined;
  saveStore(roiStore);

  return closedPos;
}

// Consulta estado atual da posição
function getRoi(symbol, posOp) {
  
  if(posOp == undefined || posOp == null){
    closePosition(symbol);
    return null;
  }else{
    initPosition(symbol, roiAtual = 0);
  }
  
  return roiStore.positions[symbol] || null;
}

// Consulta histórico completo
function getHistory(symbol = null) {
  if (symbol) {
    return roiStore.history.filter(h => h.symbol === symbol);
  }
  return roiStore.history;
}

module.exports = {
  initPosition,
  updateRoi,
  closePosition,
  getRoi,
  getHistory,
};