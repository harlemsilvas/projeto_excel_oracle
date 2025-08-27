// src/routes/integracaoRoutes.js
import { Router } from "express";
import { getIntegracoes } from "../controllers/integracaoController.js";

const router = Router();

// ✅ Com o novo registro em index.js, esta linha cria: GET /api/integracoes
// Se quiser manter o plural "integracoes"
router.get("/integracoes", getIntegracoes);

// Outra opção (menos comum para um "get all"):
// router.get("/", getIntegracoes); // Isto criaria GET /api/

export default router;
