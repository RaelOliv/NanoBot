module.exports = {
  apps: [
    {
      name: "bot-dev",
      script: "npm",
      args: "run start",
      interpreter: "bash",

      // Reinicia automaticamente a cada 5 minutos
      cron_restart: "*/5 * * * *",

      // (Opcional) log separado
      out_file: "./logs/bot-out.log",
      error_file: "./logs/bot-error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    }
  ]
}