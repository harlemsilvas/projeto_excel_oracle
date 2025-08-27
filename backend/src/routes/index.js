// src/routes/index.js
import { Router } from "express";
import resumoRoutes from "./resumo.js";
import anunciosRoutes from "./anuncios.js";
import tipoRoutes from "./tipoRoutes.js";
import skuRoutes from "./skuRoutes.js";
// ✅ Importe integracaoRoutes aqui
import integracaoRoutes from "./integracaoRoutes.js"; // <--- Esta linha estava faltando
import analiseRoutes from "./analiseRoutes.js";

const router = Router();

// Rota raiz da API
router.get("/", (_req, res) => {
  res.json({ message: "API Projeto Excel Rodando!" });
});

// Rotas principais
router.use("/resumo", resumoRoutes); // -> /api/resumo/...
router.use("/anuncios", anunciosRoutes); // -> /api/anuncios/...
router.use("/tipos", tipoRoutes); // -> /api/tipos/...
router.use("/sku", skuRoutes); // -> /api/sku/...
// ✅ Agora que está importado, você pode usá-lo aqui
router.use("/integracoes", integracaoRoutes); // -> /api/integracoes
router.use("/analise", analiseRoutes); // -> /api/analise/...

export default router;
