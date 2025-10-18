// lockManager.js
// Robust file-backed lock manager para Node.js/Termux.
// - Corrige lockfile “preso” (stale).
// - Escrita atômica com fsync + rename.
// - Contagem estrita de true.
// - Ferramentas: forceUnlock(), normalizeFile().

const fs = require('fs');
const path = require('path');

const LOCK_FILE = path.join(__dirname, 'positions.lock');
const LOCK_LOCKFILE = path.join(__dirname, 'positions.lock.lck');

// Tunáveis
const RETRY_BASE_MS = 20;
const MAX_RETRIES = 300;                 // ~6s
const FAIL_ON_LOCK_TIMEOUT = false;      // mantém compat: não lança ao estourar timeout
const STALE_LOCK_MS = 60_000;            // 60s: considera .lck obsoleto se parado há mais que isso

// ---------- utils ----------
const _now = () => Date.now();
function _sleepBusy(ms) { const end = _now() + ms; while (_now() < end) {} }

function _readRaw() {
  try {
    if (!fs.existsSync(LOCK_FILE)) return {};
    const raw = fs.readFileSync(LOCK_FILE, 'utf8');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Aceita formatos antigos e sempre devolve {version, locks}
function _readState() {
  const parsed = _readRaw();
  if (parsed && typeof parsed === 'object') {
    if (parsed.locks && typeof parsed.locks === 'object') {
      return { version: parsed.version || 1, locks: parsed.locks };
    }
    // compat plano
    if (!parsed.locks) return { version: 1, locks: parsed };
  }
  return { version: 1, locks: {} };
}

function _writeStateAtomic(state) {
  const dir = path.dirname(LOCK_FILE);
  const base = path.basename(LOCK_FILE);
  const tmp = path.join(dir, `.${base}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`);

  const payload = JSON.stringify({ version: 1, locks: state.locks });

  const fd = fs.openSync(tmp, 'w');
  try {
    fs.writeFileSync(fd, payload, { encoding: 'utf8' });
    try { fs.fsyncSync(fd); } catch {}  // alguns FS em Android podem não suportar; ignorar erro
  } finally {
    try { fs.closeSync(fd); } catch {}
  }
  fs.renameSync(tmp, LOCK_FILE);
}

// Remove lockfile se ele estiver “velho”
function _cleanupStaleLockfile() {
  try {
    if (!fs.existsSync(LOCK_LOCKFILE)) return false;
    const st = fs.statSync(LOCK_LOCKFILE);
    const age = _now() - Math.max(st.mtimeMs || 0, st.ctimeMs || 0);
    if (age >= STALE_LOCK_MS) {
      fs.unlinkSync(LOCK_LOCKFILE);
      return true;
    }
  } catch {}
  return false;
}

function _tryAcquireLockOnce() {
  try {
    return fs.openSync(LOCK_LOCKFILE, 'wx');
  } catch (err) {
    if (err && err.code === 'EEXIST') {
      // verifica e limpa .lck obsoleto
      const removed = _cleanupStaleLockfile();
      if (removed) {
        try { return fs.openSync(LOCK_LOCKFILE, 'wx'); } catch (e2) {
          if (e2 && e2.code === 'EEXIST') return null;
          throw e2;
        }
      }
      return null;
    }
    throw err;
  }
}

function _acquireLockWithRetry(timeoutMs = RETRY_BASE_MS * MAX_RETRIES) {
  const start = _now();
  let attempt = 0;
  while (true) {
    attempt++;
    const fd = _tryAcquireLockOnce();
    if (fd !== null) return fd;

    if (_now() - start >= timeoutMs) {
      if (FAIL_ON_LOCK_TIMEOUT) throw new Error('Timeout acquiring lockfile');
      return null;
    }
    const waitMs = Math.min(RETRY_BASE_MS + attempt, 200);
    _sleepBusy(waitMs);
  }
}

function _releaseLockfile(fd) {
  try { if (typeof fd === 'number') fs.closeSync(fd); } catch {}
  try { if (fs.existsSync(LOCK_LOCKFILE)) fs.unlinkSync(LOCK_LOCKFILE); } catch {}
}

// ---------- núcleo atômico ----------
function withLock(fn, opts = {}) {
  if (typeof fn !== 'function') throw new Error('withLock(fn) requer função');
  const timeoutMs = opts.timeoutMs || (RETRY_BASE_MS * MAX_RETRIES);

  const fd = _acquireLockWithRetry(timeoutMs);
  if (fd === null) return null; // não conseguiu (mantém compat)

  try {
    const state = _readState();
    const original = state.locks;
    const maybe = fn(original);

    state.locks = (maybe && typeof maybe === 'object' && maybe !== original)
      ? maybe
      : original;

    _writeStateAtomic(state);
    return { ...state.locks };
  } finally {
    _releaseLockfile(fd);
  }
}

// ---------- API pública ----------

function setLock(symbol, state = true) {
  if (!symbol || typeof symbol !== 'string') throw new Error('symbol string required');
  if (typeof state !== 'boolean') throw new Error('state boolean required');

  const res = withLock((locks) => {
    locks[symbol] = state;
    return locks;
  });
  return res; // pode ser null se não obteve lock (p.ex. .lck preso e timeout)
}

function releaseLock(symbol) {
  if (!symbol || typeof symbol !== 'string') throw new Error('symbol string required');

  return withLock((locks) => {
    if (Object.prototype.hasOwnProperty.call(locks, symbol)) delete locks[symbol];
    return locks;
  });
}

function hasLock(symbol) {
  if (!symbol || typeof symbol !== 'string') return false;
  const { locks } = _readState();
  return !!locks[symbol];
}

function hasAnyLock() {
  const { locks } = _readState();
  for (const k in locks) {
    if (Object.prototype.hasOwnProperty.call(locks, k) && locks[k] === true) return true;
  }
  return false;
}

function countLocks() {
  const { locks } = _readState();
  let c = 0;
  for (const v of Object.values(locks)) if (v === true) c++;
  return c;
}

function listLocks() {
  const { locks } = _readState();
  return Object.keys(locks).filter(k => locks[k] === true);
}

function getConsistentSnapshot() {
  const res = withLock((locks) => ({ ...locks }));
  return res === null ? {} : res;
}

// Ferramentas auxiliares

// Remove .lck de forma explícita (use somente se tiver certeza)
function forceUnlock() {
  try { if (fs.existsSync(LOCK_LOCKFILE)) fs.unlinkSync(LOCK_LOCKFILE); } catch {}
  return true;
}

// Converte valores não-booleanos para booleano estrito (true/false) e regrava
function normalizeFile() {
  return withLock((locks) => {
    const norm = {};
    for (const [k,v] of Object.entries(locks)) {
      // só mantém boolean; tudo que não for boolean vira false
      norm[k] = (v === true);
    }
    return norm;
  });
}

// Reescreve 100% a partir de um snapshot plano
function rewriteFromSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
    throw new Error('snapshot object required');
  }
  return withLock(() => {
    const state = { version: 1, locks: {} };
    for (const [k,v] of Object.entries(snapshot)) {
      state.locks[k] = (v === true);
    }
    _writeStateAtomic(state);
    return state.locks;
  });
}

module.exports = {
  setLock,
  releaseLock,
  hasLock,
  hasAnyLock,
  countLocks,
  listLocks,
  withLock,
  getConsistentSnapshot,
  rewriteFromSnapshot,
  forceUnlock,
  normalizeFile,
  _internal: { LOCK_FILE, LOCK_LOCKFILE }
};