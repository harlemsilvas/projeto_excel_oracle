import { Router } from "express";
import { getAnuncios } from "../controllers/anunciosController.js";
import { getIntegracoes } from "../controllers/integracaoController.js";

const router = Router();

router.get("/", getAnuncios);
router.get("/integracoes", getIntegracoes);

export default router;
