// src/routes/index.js
import { Router } from "express";
import resumoRoutes from "./resumo.js";
import anunciosRoutes from "./anuncios.js";
import tipoRoutes from "./tipoRoutes.js";
import skuRoutes from "./skuRoutes.js";

const router = Router();

// Rota raiz da API
router.get("/", (_req, res) => {
  res.json({ message: "API Projeto Excel Rodando!" });
});

// Rotas principais (sem duplicar /api)
router.use("/resumo", resumoRoutes);
router.use("/anuncios", anunciosRoutes);
router.use("/tipos", tipoRoutes); // ✅ /api/tipos
// router.use("/sku", skuRoutes); // ✅ /api/sku/analise
router.use("/sku", skuRoutes);

export default router;
