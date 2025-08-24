// src/controllers/tipoController.js
import db from "../config/db.js";

export async function getTiposAnuncio(req, res) {
  try {
    // Query adaptada para Oracle
    const query = `
      SELECT DISTINCT TIPO_ANUNCIO 
      FROM ANUNCIOS 
      WHERE TIPO_ANUNCIO IS NOT NULL 
      ORDER BY TIPO_ANUNCIO
    `;

    const result = await db.query(query);

    // No Oracle, as colunas vem em maiúsculo por padrão
    const tipos = result.rows.map((row) => row.TIPO_ANUNCIO);

    res.json(tipos);
  } catch (error) {
    console.error("Erro ao buscar tipos de anúncio:", error);
    res.status(500).json({ error: "Erro ao buscar tipos de anúncio" });
  }
}
/*
 Principais diferenças adaptadas
pool.query()
db.query()
✅ Usando o novo pool do Oracle
tipo_anuncio
TIPO_ANUNCIO
✅ Colunas em maiúsculo (padrão Oracle)
rows.map(row => row.tipo_anuncio)
rows.map(row => row.TIPO_ANUNCIO)
✅ Acesso correto à coluna
*/
