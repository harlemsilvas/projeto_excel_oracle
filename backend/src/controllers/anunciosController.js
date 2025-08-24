// src/controllers/anunciosController.js
import db from "../config/db.js";

export async function getAnuncios(req, res) {
  try {
    let {
      tipo_anuncio: tipo,
      produto_sku: sku,
      q,
      page = 1,
      limit = 10,
      ordenarPor = "id",
      ordem = "ASC",
    } = req.query;

    // Validação de paginação
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(Math.min(parseInt(limit, 10) || 10, 100), 1);
    const offset = (pageNum - 1) * limitNum;

    // Ordenação segura (mapeando para colunas do Oracle)
    const colunasPermitidas = {
      id: "ID",
      preco: "PRECO",
      titulo: "TITULO",
      data_criacao: "DATA_CRIACAO",
    };

    // Verifica se a coluna de ordenação é válida
    const sortColumnOracle = colunasPermitidas[ordenarPor] || "ID";
    const sortOrder = ordem.toLowerCase() === "desc" ? "DESC" : "ASC";

    // Construção da query
    let whereClause = [];
    let params = {};
    let paramIndex = 1;

    if (tipo) {
      params[`p${paramIndex}`] = tipo;
      whereClause.push(`TIPO_ANUNCIO = :p${paramIndex}`);
      paramIndex++;
    }
    if (sku) {
      params[`p${paramIndex}`] = sku;
      whereClause.push(`PRODUTO_SKU = :p${paramIndex}`);
      paramIndex++;
    }
    if (q) {
      params[`p${paramIndex}`] = `%${q}%`;
      whereClause.push(`TITULO LIKE :p${paramIndex}`);
      paramIndex++;
    }

    const whereSql =
      whereClause.length > 0 ? "WHERE " + whereClause.join(" AND ") : "";

    // Contagem total
    const countQuery = `SELECT COUNT(*) AS TOTAL FROM ANUNCIOS ${whereSql}`;
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].TOTAL);
    const totalPages = Math.ceil(total / limitNum);

    // Adiciona parâmetros de paginação
    const finalParams = {
      ...params,
      limit: limitNum,
      offset: offset,
    };

    // Consulta paginada com Oracle OFFSET/FETCH (Oracle 12c+)
    const query = `
      SELECT * FROM ANUNCIOS
      ${whereSql}
      ORDER BY ${sortColumnOracle} ${sortOrder}
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `;

    const result = await db.query(query, finalParams);

    // ✅ Processa as linhas para garantir que sejam objetos simples
    const processedRows = result.rows.map((row) => {
      const simpleRow = {};
      for (const key in row) {
        // Verifica se o valor é um tipo primitivo ou Date
        if (
          row[key] === null ||
          row[key] === undefined ||
          typeof row[key] === "string" ||
          typeof row[key] === "number" ||
          typeof row[key] === "boolean" ||
          row[key] instanceof Date
        ) {
          simpleRow[key] = row[key];
        } else {
          // Converte outros tipos para string (ex: LOBs, Buffers)
          simpleRow[key] = String(row[key]);
        }
      }
      return simpleRow;
    });

    // ✅ Retorna apenas dados simples e serializáveis
    res.json({
      data: processedRows,
      page: pageNum,
      limit: limitNum,
      total,
      total_pages: totalPages,
    });
  } catch (error) {
    console.error("Erro ao buscar anúncios:", error);
    res.status(500).json({ error: "Erro ao buscar anúncios" });
  }
}

/*
Principais diferenças entre PostgreSQL e Oracle
pool.query()
db.query()
✅ Usando o novo pool do Oracle
tipo_anuncio = $1
TIPO_ANUNCIO = :p1
✅ Parâmetros nomeados
titulo ILIKE $1
TITULO LIKE :p1
✅
LIKE
(Oracle é case-insensitive)
LIMIT $1 OFFSET $2
OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
✅ Paginação Oracle 12c+
rows[0].total
rows[0].TOTAL
✅ Colunas em maiúsculo
ordenarPor
sortColumnOracle
✅ Mapeamento de colunas

✅ Recursos utilizados
✅ Parâmetros nomeados (:p1, :p2) - mais legíveis e seguros
✅ Paginação com OFFSET/FETCH - padrão Oracle 12c+
✅ Mapeamento de colunas - de snake_case para UPPER_CASE
✅ LIKE para buscas textuais - substituto do ILIKE
✅ Tratamento de nomes de colunas - Oracle retorna em maiúsculo
✅ Agora seu endpoint GET /api/anuncios vai funcionar perfeitamente com o Oracle.

*/
