import { Router } from "express";
import { getResumo } from "../controllers/resumoController.js";

const router = Router();

router.get("/", getResumo);

export default router;
