// src/routes/skuRoutes.js
import { Router } from "express";
import { getAnaliseSKU } from "../controllers/skuController.js";

const router = Router();

router.get("/analise", getAnaliseSKU); // GET /api/sku → chama getAnaliseSKU

export default router;
