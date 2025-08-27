// src/produtos/controllers/produtosController.js
import db from "../../config/db.js";

/**
 * @swagger
 * /api/produtos:
 *   get:
 *     summary: Retorna uma lista paginada de produtos
 *     description: Busca produtos com filtros opcionais por SKU, descrição, categoria, marca, etc.
 *     parameters:
 *       - in: query
 *         name: sku
 *         schema:
 *           type: string
 *         description: Filtra por SKU do produto.
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Busca textual na descrição (case-insensitive).
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *         description: Filtra por categoria.
 *       - in: query
 *         name: marca
 *         schema:
 *           type: string
 *         description: Filtra por marca.
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
 *           enum: [id, codigo_sku, descricao, preco_custo, preco]
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
 *         description: Uma lista de produtos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Produto'
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

export async function getProdutos(req, res) {
  try {
    let {
      sku,
      q,
      categoria,
      marca,
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

    if (sku) {
      params.push(sku);
      whereClause.push(`CODIGO_SKU = :p${idx++}`);
    }
    if (q) {
      params.push(`%${q}%`);
      whereClause.push(`DESCRICAO LIKE '%' || :p${idx++} || '%'`);
    }
    if (categoria) {
      params.push(`%${categoria}%`);
      whereClause.push(`CATEGORIA LIKE '%' || :p${idx++} || '%'`);
    }
    if (marca) {
      params.push(`%${marca}%`);
      whereClause.push(`MARCA LIKE '%' || :p${idx++} || '%'`);
    }

    const whereSql =
      whereClause.length > 0 ? "WHERE " + whereClause.join(" AND ") : "";

    // Contagem total
    const countQuery = `SELECT COUNT(*) AS TOTAL FROM PRODUTOS ${whereSql}`;
    const countParams = params.reduce((acc, val, i) => {
      acc[`p${i + 1}`] = val;
      return acc;
    }, {});
    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].TOTAL);
    const totalPages = Math.ceil(total / limitNum);

    // Consulta paginada
    const query = `
      SELECT * FROM PRODUTOS
      ${whereSql}
      ORDER BY ${sortColumn} ${sortOrder}
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `;

    // Adiciona parâmetros de paginação
    const finalParams = {
      ...params.reduce((acc, val, i) => {
        acc[`p${i + 1}`] = val;
        return acc;
      }, {}),
      offset: offset,
      limit: limitNum,
    };

    console.log("Executing query with params:", JSON.stringify(finalParams));

    let result;
    try {
      result = await db.query(query, finalParams);
      console.log("Query executed successfully");
    } catch (queryError) {
      console.error("Database query error:", queryError);
      throw queryError;
    }

    // Debug: Check what we got from database
    console.log("Database result type:", typeof result);
    console.log("Has rows property:", "rows" in result);
    console.log("Rows is array:", Array.isArray(result.rows));
    console.log("Number of rows:", result.rows ? result.rows.length : 0);

    // Safely extract and normalize data to prevent circular references
    let produtos = [];
    try {
      if (result.rows && Array.isArray(result.rows)) {
        produtos = result.rows.map((produto) => {
          // Create a clean object with only the data we need
          const cleanProduto = {
            id: produto.ID || null,
            id_sistema: produto.ID_SISTEMA || null,
            codigo_sku: produto.CODIGO_SKU || null,
            descricao: produto.DESCRICAO || null,
            unidade: produto.UNIDADE || null,
            classificacao_fiscal: produto.CLASSIFICACAO_FISCAL || null,
            origem: produto.ORIGEM || null,
            preco: produto.PRECO || null,
            valor_ipi_fixo: produto.VALOR_IPI_FIXO || null,
            observacoes: produto.OBSERVACOES || null,
            situacao: produto.SITUACAO || null,
            estoque: produto.ESTOQUE || null,
            preco_custo: produto.PRECO_CUSTO || null,
            cod_fornecedor: produto.COD_FORNECEDOR || null,
            fornecedor: produto.FORNECEDOR || null,
            localizacao: produto.LOCALIZACAO || null,
            estoque_maximo: produto.ESTOQUE_MAXIMO || null,
            estoque_minimo: produto.ESTOQUE_MINIMO || null,
            peso_liquido_kg: produto.PESO_LIQUIDO_KG || null,
            peso_bruto_kg: produto.PESO_BRUTO_KG || null,
            gtin_ean: produto.GTIN_EAN || null,
            gtin_ean_tributavel: produto.GTIN_EAN_TRIBUTAVEL || null,
            descricao_complementar: produto.DESCRICAO_COMPLEMENTAR || null,
            cest: produto.CEST || null,
            categoria: produto.CATEGORIA || null,
            marca: produto.MARCA || null,
            garantia: produto.GARANTIA || null,
            sob_encomenda: produto.SOB_ENCOMENDA || null,
            preco_promocional: produto.PRECO_PROMOCIONAL || null,
          };

          // Deep clone to eliminate any potential circular references
          return JSON.parse(JSON.stringify(cleanProduto));
        });
      }
    } catch (mappingError) {
      console.error("Error mapping produtos:", mappingError);
      produtos = [];
    }

    // Create clean response object
    const responseData = {
      data: produtos,
      page: pageNum,
      limit: limitNum,
      total: total,
      total_pages: totalPages,
    };

    // Final safety check - deep clone the entire response
    const cleanResponse = JSON.parse(JSON.stringify(responseData));

    console.log("Sending response with", cleanResponse.data.length, "produtos");
    res.json(cleanResponse);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
}

/**
 * @swagger
 * /api/produtos/{sku}:
 *   get:
 *     summary: Retorna os detalhes de um produto específico
 *     description: Busca um produto pelo seu código SKU.
 *     parameters:
 *       - in: path
 *         name: sku
 *         required: true
 *         schema:
 *           type: string
 *         description: O código SKU do produto.
 *     responses:
 *       200:
 *         description: Detalhes do produto.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Produto'
 *       404:
 *         description: Produto não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */
export async function getProdutoPorSku(req, res) {
  try {
    const { sku } = req.params;

    if (!sku) {
      return res.status(400).json({ error: "SKU é obrigatório." });
    }

    const query = `SELECT * FROM PRODUTOS WHERE CODIGO_SKU = :sku`;

    console.log("Executing single product query for SKU:", sku);

    let result;
    try {
      result = await db.query(query, { sku });
      console.log("Single product query executed successfully");
      console.log("Result type:", typeof result);
      console.log("Has rows:", "rows" in result);
      console.log("Rows count:", result.rows ? result.rows.length : 0);
    } catch (queryError) {
      console.error("Database query error:", queryError);
      throw queryError;
    }

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    const produto = result.rows[0];
    console.log("Raw produto keys:", Object.keys(produto));

    // Function to safely extract primitive values from Oracle results
    const extractValue = (value) => {
      if (value === null || value === undefined) return null;

      // Handle objects (convert to JSON string if possible, otherwise null)
      if (typeof value === "object") {
        try {
          // If it's a plain object or array, stringify it
          if (value.constructor === Object || Array.isArray(value)) {
            return JSON.stringify(value);
          }
          // For other objects (like Oracle metadata), return null
          return null;
        } catch (e) {
          return null;
        }
      }

      // Convert to string first, then back to appropriate type if needed
      const stringValue = String(value);
      if (stringValue === "null" || stringValue === "undefined") return null;
      return stringValue;
    };

    // Create completely clean object with aggressive primitive extraction
    const produtoNormalizado = {
      id: extractValue(produto.ID),
      id_sistema: extractValue(produto.ID_SISTEMA),
      codigo_sku: extractValue(produto.CODIGO_SKU),
      descricao: extractValue(produto.DESCRICAO),
      unidade: extractValue(produto.UNIDADE),
      classificacao_fiscal: extractValue(produto.CLASSIFICACAO_FISCAL),
      origem: extractValue(produto.ORIGEM),
      preco: extractValue(produto.PRECO),
      valor_ipi_fixo: extractValue(produto.VALOR_IPI_FIXO),
      observacoes: extractValue(produto.OBSERVACOES),
      situacao: extractValue(produto.SITUACAO),
      estoque: extractValue(produto.ESTOQUE),
      preco_custo: extractValue(produto.PRECO_CUSTO),
      cod_fornecedor: extractValue(produto.COD_FORNECEDOR),
      fornecedor: extractValue(produto.FORNECEDOR),
      localizacao: extractValue(produto.LOCALIZACAO),
      estoque_maximo: extractValue(produto.ESTOQUE_MAXIMO),
      estoque_minimo: extractValue(produto.ESTOQUE_MINIMO),
      peso_liquido_kg: extractValue(produto.PESO_LIQUIDO_KG),
      peso_bruto_kg: extractValue(produto.PESO_BRUTO_KG),
      gtin_ean: extractValue(produto.GTIN_EAN),
      gtin_ean_tributavel: extractValue(produto.GTIN_EAN_TRIBUTAVEL),
      descricao_complementar: extractValue(produto.DESCRICAO_COMPLEMENTAR),
      cest: extractValue(produto.CEST),
      categoria: extractValue(produto.CATEGORIA),
      marca: extractValue(produto.MARCA),
      garantia: extractValue(produto.GARANTIA),
      sob_encomenda: extractValue(produto.SOB_ENCOMENDA),
      preco_promocional: extractValue(produto.PRECO_PROMOCIONAL),
    };

    // Now it should be safe to JSON stringify as all values are primitive strings
    const cleanResponse = produtoNormalizado;

    console.log("Sending clean product response for SKU:", sku);
    res.json(cleanResponse);
  } catch (error) {
    console.error("Erro ao buscar produto por SKU:", error);
    res.status(500).json({ error: "Erro ao buscar produto por SKU" });
  }
}

/**
 * @swagger
 * /api/produtos/{sku}/imagens:
 *   get:
 *     summary: Retorna as URLs das imagens de um produto
 *     description: Busca as URLs das imagens associadas a um produto pelo seu código SKU.
 *     parameters:
 *       - in: path
 *         name: sku
 *         required: true
 *         schema:
 *           type: string
 *         description: O código SKU do produto.
 *     responses:
 *       200:
 *         description: Lista de URLs das imagens.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   url:
 *                     type: string
 *                     example: "https://exemplo.com/imagem.jpg"
 *                   tipo:
 *                     type: string
 *                     example: "Principal"
 *                   ordem:
 *                     type: integer
 *                     example: 1
 *       500:
 *         description: Erro interno do servidor.
 */

export async function getImagensPorSku(req, res) {
  try {
    const { sku } = req.params;

    if (!sku) {
      return res.status(400).json({ error: "SKU é obrigatório." });
    }

    const query = `
      SELECT URL_IMAGEM AS url, TIPO_IMAGEM AS tipo, ORDEM_IMAGEM AS ordem
      FROM PRODUTO_IMAGENS
      WHERE SKU_PRODUTO = :sku
      ORDER BY ORDEM_IMAGEM ASC
    `;
    const result = await db.query(query, { sku });

    // Safely extract and normalize image data
    const imagens = Array.isArray(result.rows)
      ? result.rows.map((img) => ({
          url: img.URL || img.url,
          tipo: img.TIPO || img.tipo,
          ordem: img.ORDEM || img.ordem,
        }))
      : [];

    res.json(imagens);
  } catch (error) {
    console.error("Erro ao buscar imagens por SKU:", error);
    res.status(500).json({ error: "Erro ao buscar imagens por SKU" });
  }
}
