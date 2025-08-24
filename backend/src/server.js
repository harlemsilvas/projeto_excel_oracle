// src/server.js
import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import db from "./config/db.js";

const PORT = process.env.PORT || 3000;

db.initialize()
  .then(() => {
    console.log("🚀 Conexão com Oracle estabelecida");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Falha ao conectar ao Oracle:", err);
    process.exit(1);
  });

process.on("SIGINT", async () => {
  console.log("🛑 Recebido SIGINT. Fechando conexão com Oracle...");
  await db.close();
  process.exit(0);
});
