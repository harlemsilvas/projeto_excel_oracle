// src/routes/analiseRoutes.js
import { Router } from "express";
import {
  getResumo,
  getIntegracoes,
  getTiposPorIntegracao,
  getSkusPorIntegracaoETipo,
  getAnunciosPorSku,
} from "../controllers/analiseController.js";

const router = Router();

// 1. Visão Geral
// Com router.use("/analise", analiseRoutes), esta linha cria: GET /api/analise/resumo
router.get("/resumo", getResumo);

// 2. Integrações
// Com router.use("/analise", analiseRoutes), esta linha cria: GET /api/analise/integracoes
// ✅ Corrigido: Removido o "/analise" duplicado
router.get("/integracoes", getIntegracoes);

// 3. Tipos por Integração
// Esta linha cria: GET /api/analise/integracoes/:integracao/tipos
// ✅ Corrigido: Removido o "/analise" duplicado
router.get("/integracoes/:integracao/tipos", getTiposPorIntegracao);

// 4. SKUs por Integração e Tipo
// Esta linha cria: GET /api/analise/integracoes/:integracao/tipos/:tipo/skus
// ✅ Corrigido: Removido o "/analise" duplicado
router.get(
  "/integracoes/:integracao/tipos/:tipo/skus",
  getSkusPorIntegracaoETipo
);

// 5. Anúncios por SKU
// Esta linha cria: GET /api/analise/skus/:sku/anuncios
// ✅ Corrigido: Removido o "/analise" duplicado
router.get("/skus/:sku/anuncios", getAnunciosPorSku);

export default router;
