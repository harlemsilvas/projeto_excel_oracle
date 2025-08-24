import { Router } from "express";
import { getAnuncios } from "../controllers/anunciosController.js";

const router = Router();

router.get("/", getAnuncios);

export default router;
