// src/controllers/analiseController.js
import db from "../config/db.js";

// 1. Visão Geral
export async function getResumo(req, res) {
  try {
    const result = await db.query(`
      SELECT 
        COUNT(*) AS total_anuncios,
        AVG(preco) AS preco_medio,
        AVG(preco - preco_custo) AS lucro_medio,
        SUM(preco - preco_custo) AS lucro_total
      FROM anuncios
    `);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar resumo" });
  }
}

// 2. Análise por Integração
export async function getIntegracoes(req, res) {
  try {
    const result = await db.query(`
      SELECT 
        integracao,
        COUNT(*) AS total_anuncios
      FROM anuncios
      WHERE integracao IS NOT NULL
      GROUP BY integracao
      ORDER BY total_anuncios DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar integrações" });
  }
}

// 3. Tipos por Integração
export async function getTiposPorIntegracao(req, res) {
  const { integracao } = req.params;
  try {
    const result = await db.query(
      `
      SELECT 
        tipo_anuncio,
        COUNT(*) AS total_anuncios
      FROM anuncios
      WHERE integracao = :integracao
      GROUP BY tipo_anuncio
      ORDER BY total_anuncios DESC
      `,
      { integracao }
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar tipos" });
  }
}

// 4. SKUs por Integração e Tipo
export async function getSkusPorIntegracaoETipo(req, res) {
  const { integracao, tipo } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    // Contagem total
    const countResult = await db.query(
      `
      SELECT COUNT(DISTINCT produto_sku) AS total
      FROM anuncios
      WHERE integracao = :integracao AND tipo_anuncio = :tipo
      `,
      { integracao, tipo }
    );
    const total = parseInt(countResult.rows[0].TOTAL);
    const totalPages = Math.ceil(total / limit);

    // Dados paginados
    const result = await db.query(
      `
      SELECT 
        produto_sku,
        COUNT(*) AS total_anuncios,
        AVG(preco) AS preco_medio,
        AVG(preco - preco_custo) AS lucro_medio
      FROM anuncios
      WHERE integracao = :integracao AND tipo_anuncio = :tipo
      GROUP BY produto_sku
      ORDER BY total_anuncios DESC
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
      `,
      { integracao, tipo, offset, limit: parseInt(limit) }
    );

    res.json({
      data: result.rows, // ✅ Deve ser um array
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      total_pages: totalPages,
    });
  } catch (error) {
    console.error("Erro ao buscar SKUs:", error);
    res.status(500).json({ error: "Erro ao buscar SKUs" });
  }
}

// 5. Anúncios por SKU
export async function getAnunciosPorSku(req, res) {
  const { sku } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    // Contagem total
    const countResult = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM anuncios
      WHERE produto_sku = :sku
      `,
      { sku }
    );
    const total = parseInt(countResult.rows[0].TOTAL);
    const totalPages = Math.ceil(total / limit);

    // Dados paginados
    const result = await db.query(
      `
      SELECT 
        id,
        titulo,
        preco_custo,
        preco,
        (preco - preco_custo) AS lucro,
        integracao,
        tipo_anuncio
      FROM anuncios
      WHERE produto_sku = :sku
      ORDER BY id
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
      `,
      { sku, offset, limit: parseInt(limit) }
    );

    res.json({
      data: result.rows,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      total_pages: totalPages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar anúncios" });
  }
}
