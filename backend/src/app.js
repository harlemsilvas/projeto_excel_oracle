// src/app.js
// src/app.js
import express from "express";
import cors from "cors"; // ✅ Importe o cors
import { limiter } from "./middlewares/rateLimiter.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import routes from "./routes/index.js";
import {} from "./routes/integracaoRoutes.js";

const app = express();

// ✅ Adicione o cors ANTES das rotas
app.use(
  cors({
    origin: "http://localhost:5173", // Permite apenas o frontend
    credentials: true, // Se usar cookies/sessões
  })
);

// app.use(limiter);
app.use(express.json());

app.use("/api", routes);

// Verifique as rotas registradas
app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(
      `[ROTA] ${Object.keys(r.route.methods).join(", ").toUpperCase()} /api${
        r.route.path
      }`
    );
  }
});

// Middleware de erro
app.use(errorHandler);

export default app;
// import express from "express";
// import cors from "cors";
// import { limiter } from "./middlewares/rateLimiter.js";
// import { errorHandler } from "./middlewares/errorHandler.js";
// import routes from "./routes/index.js";

// const app = express();

// const API_PREFIX = process.env.API_PREFIX || "/api"; // padrão: /api

// app.use(limiter);
// app.use(cors());
// app.use(express.json());

// // ✅ Usa o prefixo dinâmico
// app.use(API_PREFIX, routes);

// // Middleware de erro global
// app.use(errorHandler);

// // Após definir todas as rotas
// // app._router.stack.forEach((r) => {
// //   if (r.route && r.route.path) {
// //     console.log(r.route.path, r.route.stack.map((s) => s.method).join(", "));
// //   }
// // });

// export default app;
