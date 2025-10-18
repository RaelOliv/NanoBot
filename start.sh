#!/data/data/com.termux/files/usr/bin/bash
termux-wake-lock

SCRIPT_DIR="/data/data/com.termux/files/home/bot"
LOG_DIR="$SCRIPT_DIR/logs"
mkdir -p "$LOG_DIR"

# === Função que executa o ciclo do bot ===
executar_bot() {
  DATA=$(date +"%d%m%y")
  HORA=$(date +"%H")
  LOG_FILE="$LOG_DIR/loop_${DATA}_${HORA}.log"

  echo "== Iniciando execução do bot às $(date) ==" | tee -a "$LOG_FILE"

  echo "[$(date)] Matando instâncias anteriores de node/nodemon..." | tee -a "$LOG_FILE"
  pkill -f "nodemon"
  pkill -f "node"

  echo "[$(date)] Reiniciando npm run start" | tee -a "$LOG_FILE"
  cd "$SCRIPT_DIR" && npm run start >> "$LOG_FILE" 2>&1 &

  echo "[$(date)] Execução concluída. Aguardando próxima hora cheia..." | tee -a "$LOG_FILE"
}

# === Execução imediata ===
executar_bot

# === Agendador para rodar no minuto 00 de cada hora ===
while true; do
  MIN=$(date +%M)

  if [ "$MIN" -eq "00" ]; then
    executar_bot
    sleep 60  # evita reexecução dentro do mesmo minuto
  else
    sleep 20
  fi
done