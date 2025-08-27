// src/controllers/skuController.js
import db from "../config/db.js";

export async function getAnaliseSKU(req, res) {
  try {
    const { q, duplicados, min, max, page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(Math.min(parseInt(limit, 10) || 10, 100), 1);
    const offset = (pageNum - 1) * limitNum;

    let whereClause = [];
    let params = {};
    let paramIndex = 1;

    if (q) {
      params[`p${paramIndex}`] = `%${q}%`;
      whereClause.push(`produto_sku LIKE :p${paramIndex}`);
      paramIndex++;
    }

    // Subquery para contar duplicados
    const duplicadosSubquery = `(SELECT COUNT(*) FROM ANUNCIOS a2 WHERE a2.PRODUTO_SKU = ANUNCIOS.PRODUTO_SKU)`;

    if (duplicados === "true") {
      whereClause.push(`${duplicadosSubquery} > 1`);
    }

    if (min) {
      const minVal = parseInt(min, 10);
      if (!isNaN(minVal)) {
        params[`p${paramIndex}`] = minVal;
        whereClause.push(`${duplicadosSubquery} >= :p${paramIndex}`);
        paramIndex++;
      }
    }

    if (max) {
      const maxVal = parseInt(max, 10);
      if (!isNaN(maxVal)) {
        params[`p${paramIndex}`] = maxVal;
        whereClause.push(`${duplicadosSubquery} <= :p${paramIndex}`);
        paramIndex++;
      }
    }

    const whereSql =
      whereClause.length > 0 ? "WHERE " + whereClause.join(" AND ") : "";

    // Contagem total
    const countQuery = `
      SELECT COUNT(DISTINCT PRODUTO_SKU) AS TOTAL
      FROM ANUNCIOS
      ${whereSql}
    `;

    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].TOTAL);
    const totalPages = Math.ceil(total / limitNum);

    // Consulta paginada com LISTAGG para agregação
    const query = `
      SELECT * FROM (
        SELECT 
          PRODUTO_SKU AS SKU,
          (SELECT COUNT(*) FROM ANUNCIOS a2 WHERE a2.PRODUTO_SKU = ANUNCIOS.PRODUTO_SKU) AS TOTAL_ANUNCIOS,
          -- Agregando IDs e títulos com LISTAGG
          (SELECT LISTAGG(ID, ',') WITHIN GROUP (ORDER BY ID) 
           FROM ANUNCIOS a2 
           WHERE a2.PRODUTO_SKU = ANUNCIOS.PRODUTO_SKU) AS ANUNCIOS_IDS,
          (SELECT LISTAGG(TITULO, ' | ') WITHIN GROUP (ORDER BY ID) 
           FROM ANUNCIOS a2 
           WHERE a2.PRODUTO_SKU = ANUNCIOS.PRODUTO_SKU) AS TITULOS
        FROM ANUNCIOS
        ${whereSql}
        GROUP BY PRODUTO_SKU
        ORDER BY TOTAL_ANUNCIOS DESC, PRODUTO_SKU
      )
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `;

    // Adiciona parâmetros de paginação
    const finalParams = {
      ...params,
      offset: offset,
      limit: limitNum,
    };

    const result = await db.query(query, finalParams);
    const rows = result.rows.map((row) => ({
      // ✅ Converte nomes das propriedades para lowercase para compatibilidade com frontend
      sku: row.SKU,
      total_anuncios: row.TOTAL_ANUNCIOS,
      anuncios_ids: row.ANUNCIOS_IDS
        ? row.ANUNCIOS_IDS.split(",").map((id) => parseInt(id))
        : [],
      titulos: row.TITULOS ? row.TITULOS.split(" | ") : [],
    }));

    res.json({
      data: rows,
      stats: {
        total_skus: total,
        total_duplicados: rows.filter((r) => r.TOTAL_ANUNCIOS > 1).length,
        total_pages: totalPages,
      },
    });
  } catch (error) {
    console.error("Erro ao analisar SKUs:", error);
    res.status(500).json({ error: "Erro ao analisar SKUs" });
  }
}
/*
✅ Principais diferenças entre PostgreSQL e Oracle
produto_sku ILIKE $1
PRODUTO_SKU LIKE :p1
ARRAY_AGG(id)
LISTAGG(ID, ',') WITHIN GROUP (ORDER BY ID)
LIMIT $1 OFFSET $2
OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
pool.query()
db.query()
rows[0].total
rows[0].TOTAL
(maiúsculo)

✅ Observações importantes
✅ LISTAGG é usado para concatenar valores em uma string (equivalente ao ARRAY_AGG do PostgreSQL)
✅ Nomes de colunas em maiúsculo - Oracle retorna colunas em maiúsculo por padrão
✅ Parâmetros nomeados - Oracle usa :nome em vez de $1, $2
✅ Paginação com OFFSET/FETCH - disponível no Oracle 12c+
✅ Conversão de strings para arrays - feita no JavaScript após receber os dados
*/
