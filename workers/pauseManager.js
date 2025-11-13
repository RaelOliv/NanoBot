// pauseManager.js
const fs = require("fs");
const path = require("path");

const FLAG_PATH = path.join(__dirname, "cache", "pauseFlag.json");

// Garante que a pasta e o arquivo existam
function ensureFile() {
  const dir = path.dirname(FLAG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(FLAG_PATH)) fs.writeFileSync(FLAG_PATH, JSON.stringify({ pausedUntil: 0 }));
}

// Define pausa de 30 minutos
function activatePause(minutes = 30) {
  ensureFile();
  const until = Date.now() + minutes * 60 * 1000;
  fs.writeFileSync(FLAG_PATH, JSON.stringify({ pausedUntil: until }, null, 2));
  console.log(`⏸️ Sistema pausado por ${minutes} minutos (até ${new Date(until).toLocaleTimeString()})`);
}

// Verifica se o sistema ainda está em pausa
function isPaused() {
  ensureFile();
  const { pausedUntil } = JSON.parse(fs.readFileSync(FLAG_PATH, "utf8"));
  return Date.now() < pausedUntil;
}

// Retorna o tempo restante da pausa em minutos
function remainingMinutes() {
  ensureFile();
  const { pausedUntil } = JSON.parse(fs.readFileSync(FLAG_PATH, "utf8"));
  const diff = pausedUntil - Date.now();
  return diff > 0 ? Math.ceil(diff / 60000) : 0;
}

// Reseta a flag
function clearPause() {
  ensureFile();
  fs.writeFileSync(FLAG_PATH, JSON.stringify({ pausedUntil: 0 }, null, 2));
  console.log("▶️ Pausa removida, sistema retomado.");
}

module.exports = { activatePause, isPaused, remainingMinutes, clearPause };