// src/routes/tipoRoutes.js
import { Router } from "express";
import { getTiposAnuncio } from "../controllers/tipoController.js";

const router = Router();

router.get("/", getTiposAnuncio);

export default router;
