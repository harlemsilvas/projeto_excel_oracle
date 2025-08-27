// src/controllers/anunciosController.js
import db from "../config/db.js";

/**
 * @swagger
 * /api/anuncios:
 *   get:
 *     summary: Retorna uma lista paginada de anúncios
 *     description: Busca anúncios com filtros opcionais por tipo, SKU, título, integração e paginação.
 *     parameters:
 *       - in: query
 *         name: tipo_anuncio
 *         schema:
 *           type: string
 *         description: Filtra por tipo de anúncio.
 *       - in: query
 *         name: produto_sku
 *         schema:
 *           type: string
 *         description: Filtra por SKU do produto.
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Busca textual no título (case-insensitive).
 *       - in: query
 *         name: integracao
 *         schema:
 *           type: string
 *         description: Filtra por nome da integração.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Número de itens por página.
 *       - in: query
 *         name: ordenarPor
 *         schema:
 *           type: string
 *           enum: [id, preco, titulo, data_criacao]
 *           default: id
 *         description: Campo para ordenação.
 *       - in: query
 *         name: ordem
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *         description: Direção da ordenação.
 *     responses:
 *       200:
 *         description: Uma lista de anúncios.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Anuncio'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 total:
 *                   type: integer
 *                   example: 100
 *                 total_pages:
 *                   type: integer
 *                   example: 10
 *       500:
 *         description: Erro interno do servidor.
 */
export async function getAnuncios(req, res) {
  try {
    // Desestruturação dos parâmetros, incluindo o novo 'integracao'
    let {
      tipo_anuncio: tipo,
      produto_sku: sku,
      q,
      integracao, // ✅ Novo parâmetro
      page = 1,
      limit = 10,
      ordenarPor = "id",
      ordem = "ASC",
    } = req.query;

    // Validação de paginação
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(Math.min(parseInt(limit, 10) || 10, 100), 1);
    const offset = (pageNum - 1) * limitNum;

    // Ordenação segura
    const colunasPermitidas = ["id", "preco", "titulo", "data_criacao"];
    const sortColumn = colunasPermitidas.includes(ordenarPor)
      ? ordenarPor
      : "id";
    const sortOrder = ordem.toLowerCase() === "desc" ? "DESC" : "ASC";

    // Construção da query
    let whereClause = [];
    let params = [];
    let idx = 1;

    if (tipo) {
      params.push(tipo);
      whereClause.push(`TIPO_ANUNCIO = :p${idx++}`);
    }
    if (sku) {
      params.push(sku);
      whereClause.push(`PRODUTO_SKU = :p${idx++}`);
    }
    if (q) {
      params.push(`%${q}%`);
      whereClause.push(`TITULO LIKE '%' || :p${idx++} || '%'`);
    }
    // ✅ Adicionar filtro por integração
    if (integracao) {
      params.push(integracao);
      whereClause.push(`INTEGRACAO = :p${idx++}`);
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
      ...params.reduce((acc, val, i) => {
        acc[`p${i + 1}`] = val;
        return acc;
      }, {}),
      limit: limitNum,
      offset: offset,
    };

    // Consulta paginada com Oracle OFFSET/FETCH (Oracle 12c+)
    const query = `
      SELECT * FROM ANUNCIOS
      ${whereSql}
      ORDER BY ${sortColumn} ${sortOrder}
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `;

    const result = await db.query(query, finalParams);

    // Resposta no formato esperado
    res.json({
      data: result.rows,
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
