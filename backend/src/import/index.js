import express from "express";
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import rateLimit from "express-rate-limit";

const app = express();

console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD); // Veja se aparece o valor

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300, // um pouco mais alto para desenvolvimento
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const port = process.env.NODE_PORT || 3000;

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "projeto_excel",
  user: process.env.DB_USER || "admin",
  password: process.env.DB_PASSWORD ?? "senha123", // fallback seguro
});

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "API Projeto Excel Rodando!" });
});

// ---------- RESUMO (com números, não strings) ----------
app.get("/resumo", async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        COUNT(*)::int                                AS total_anuncios,
        COALESCE(AVG(preco)::float8, 0)             AS preco_medio,
        COALESCE(AVG(preco - preco_custo)::float8,0) AS lucro_medio,
        COALESCE(SUM(preco - preco_custo)::float8,0) AS lucro_total
      FROM public.anuncios;
    `);
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro no banco de dados" });
  }
});

/**
 * ---------- LISTAGEM COM FILTROS + PAGINAÇÃO ----------
 * GET /anuncios?tipo=Premium&sku=61461&q=óleo&page=1&limit=50
 * - Todos os filtros são opcionais (combináveis).
 * - Retorna { data, page, limit, total, total_pages }.
 */
app.get("/anuncios", async (req, res) => {
  try {
    let {
      tipo,
      sku,
      q,
      page = 1,
      limit = 10,
      ordenarPor = "id",
      ordem = "asc",
    } = req.query;

    // Garantir que valores numéricos sejam números
    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 10;

    // Lista branca de colunas que podem ser ordenadas
    const colunasPermitidas = ["id", "preco", "titulo"];
    if (!colunasPermitidas.includes(ordenarPor)) ordenarPor = "id";

    // Ordem segura
    ordem = ordem.toLowerCase() === "desc" ? "desc" : "asc";

    // Montar SQL dinamicamente
    let query = `SELECT * FROM anuncios WHERE 1=1`;
    let params = [];

    if (tipo) {
      params.push(tipo);
      query += ` AND tipo = $${params.length}`;
    }

    if (sku) {
      params.push(sku);
      query += ` AND sku = $${params.length}`;
    }

    if (q) {
      params.push(`%${q}%`);
      query += ` AND titulo ILIKE $${params.length}`;
    }

    // Ordenação
    query += ` ORDER BY ${ordenarPor} ${ordem}`;

    // Paginação
    params.push(limit);
    query += ` LIMIT $${params.length}`;
    params.push((page - 1) * limit);
    query += ` OFFSET $${params.length}`;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar anúncios" });
  }
});

// --------- Endpoints antigos (mantidos p/ compatibilidade) ---------
app.get("/filtro/tipo/:tipo", async (req, res) => {
  const tipo = req.params.tipo;
  try {
    const { rows } = await pool.query(
      `
      SELECT id, integracao, identificador, titulo, produto_sku,
             preco_custo::float8 AS preco_custo,
             preco::float8 AS preco,
             tipo_anuncio
      FROM public.anuncios
      WHERE tipo_anuncio = $1
      LIMIT 100
      `,
      [tipo]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro no banco de dados" });
  }
});

app.get("/filtro/sku/:sku", async (req, res) => {
  const sku = req.params.sku;
  try {
    const { rows } = await pool.query(
      `
      SELECT id, integracao, identificador, titulo, produto_sku,
             preco_custo::float8 AS preco_custo,
             preco::float8 AS preco,
             tipo_anuncio
      FROM public.anuncios
      WHERE produto_sku = $1
      LIMIT 100
      `,
      [sku]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro no banco de dados" });
  }
});

app.get("/filtro/titulo/:palavra", async (req, res) => {
  const palavra = (req.params.palavra || "").toLowerCase();
  try {
    const { rows } = await pool.query(
      `
      SELECT id, integracao, identificador, titulo, produto_sku,
             preco_custo::float8 AS preco_custo,
             preco::float8 AS preco,
             tipo_anuncio
      FROM public.anuncios
      WHERE LOWER(titulo) LIKE $1
      LIMIT 100
      `,
      [`%${palavra}%`]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro no banco de dados" });
  }
});

app.listen(port, () => {
  console.log(`🚀 API rodando na porta ${port}`);
});
