// src/produtos/routes/produtosRoutes.js
import { Router } from "express";
import {
  getProdutos,
  getProdutoPorSku,
  getImagensPorSku,
} from "../controllers/produtosController.js";

const router = Router();

// GET /api/produtos -> lista produtos com filtros
router.get("/", getProdutos);

// GET /api/produtos/:sku -> detalhe de um produto
router.get("/:sku", getProdutoPorSku);

// GET /api/produtos/:sku/imagens -> lista imagens de um produto
router.get("/:sku/imagens", getImagensPorSku);

export default router;
