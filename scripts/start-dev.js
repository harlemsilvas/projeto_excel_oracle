cd; // scripts/start-dev.js
const { exec } = require("child_process");

console.log("🚀 Iniciando API e Frontend...");

exec("cd api && npm run dev", (err) => {
  if (err) console.error("Erro ao iniciar API:", err);
});

exec("cd frontend && npm run dev", (err) => {
  if (err) console.error("Erro ao iniciar Frontend:", err);
});
