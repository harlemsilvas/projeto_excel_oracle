// src/controllers/resumoController.js
import db from "../config/db.js";

export async function getResumo(req, res) {
  try {
    const { tipo_anuncio, produto_sku, q } = req.query;

    // Query adaptada para Oracle
    let sql = `
      SELECT 
        COUNT(*) AS TOTAL_ANUNCIOS,
        COALESCE(AVG(PRECO), 0) AS PRECO_MEDIO,
        COALESCE(AVG(PRECO - PRECO_CUSTO), 0) AS LUCRO_MEDIO,
        COALESCE(SUM(PRECO - PRECO_CUSTO), 0) AS LUCRO_TOTAL
      FROM ANUNCIOS
      WHERE 1 = 1
    `;

    const binds = {};

    if (tipo_anuncio) {
      sql += ` AND TIPO_ANUNCIO = :tipo_anuncio`;
      binds.tipo_anuncio = tipo_anuncio;
    }
    if (produto_sku) {
      sql += ` AND PRODUTO_SKU = :produto_sku`;
      binds.produto_sku = produto_sku;
    }
    if (q) {
      sql += ` AND TITULO LIKE '%' || :q || '%'`;
      binds.q = q;
    }

    const result = await db.query(sql, binds);

    // Oracle retorna colunas em maiúsculo
    const row = result.rows[0];

    res.json({
      total_anuncios: parseInt(row.TOTAL_ANUNCIOS, 10),
      preco_medio: parseFloat(row.PRECO_MEDIO),
      lucro_medio: parseFloat(row.LUCRO_MEDIO),
      lucro_total: parseFloat(row.LUCRO_TOTAL),
    });
  } catch (error) {
    console.error("Erro ao buscar resumo:", error);
    res.status(500).json({ error: "Erro ao buscar resumo" });
  }
}
/*
O que foi corrigido
Acesso a
row.total_anuncios
Alterado para
row.TOTAL_ANUNCIOS
(maiúsculo)
Conversão de tipos
Adicionado
parseInt
para
total_anuncios
Remoção do
next
Não é mais necessário pois o controller trata o erro
✅ Recursos utilizados
✅ Parâmetros nomeados (:tipo_anuncio, :produto_sku, :q)
✅ COALESCE para tratar valores nulos
✅ LIKE com concatenação ('%' || :q || '%') para buscas textuais
✅ Acesso correto às colunas em maiúsculo (row.TOTAL_ANUNCIOS)
✅ Conversão explícita de tipos (parseInt, parseFloat)
*/
