// src/middlewares/rateLimiter.js
import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // aumente de 10 para 100 requisições
  message: "Muitas requisições vindas deste IP, tente novamente mais tarde.",
  standardHeaders: true,
  legacyHeaders: false,
});
