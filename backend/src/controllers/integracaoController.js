// src/controllers/integracaoController.js
import db from "../config/db.js";

export async function getIntegracoes(req, res) {
  try {
    // Query para buscar todas as integrações distintas
    const query = `
      SELECT DISTINCT INTEGRACAO
      FROM ANUNCIOS
      WHERE INTEGRACAO IS NOT NULL
      ORDER BY INTEGRACAO
    `;

    const result = await db.query(query);
    // Extrai os valores e envia como array de strings
    const integracoes = result.rows.map((row) => row.INTEGRACAO);

    res.json(integracoes);
  } catch (error) {
    console.error("Erro ao buscar integrações:", error);
    res.status(500).json({ error: "Erro ao buscar integrações" });
  }
}
