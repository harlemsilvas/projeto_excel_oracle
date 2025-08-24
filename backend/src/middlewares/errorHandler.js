export function errorHandler(err, _req, res, _next) {
  console.error("Erro:", err);
  res.status(500).json({ error: "Erro interno no servidor" });
}
