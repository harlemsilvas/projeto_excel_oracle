// src/import/criar_tabela.js
import dotenv from "dotenv";
import oracledb from "oracledb";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega variáveis de ambiente
dotenv.config({ path: path.join(__dirname, "../../.env") });

// Configuração do banco Oracle
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING,
};

async function criarTabela() {
  let connection;

  try {
    // Conecta ao banco
    connection = await oracledb.getConnection(dbConfig);
    console.log("✅ Conectado ao Oracle");

    // Verifica se a tabela já existe
    const result = await connection.execute(
      `SELECT COUNT(*) AS count FROM user_tables WHERE table_name = :tableName`,
      { tableName: "ANUNCIOS" }
    );

    const exists = result.rows[0].COUNT > 0;

    if (exists) {
      console.log('✅ Tabela "ANUNCIOS" já existe.');
      process.exit(0);
    }

    // Cria a tabela (Oracle)
    const createTableQuery = `
      CREATE TABLE ANUNCIOS (
        ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        INTEGRACAO VARCHAR2(255),
        IDENTIFICADOR VARCHAR2(255) UNIQUE NOT NULL,
        TITULO VARCHAR2(255),
        PRODUTO_SKU VARCHAR2(255),
        PRECO_CUSTO NUMBER(10, 2),
        PRECO NUMBER(10, 2),
        TIPO_ANUNCIO VARCHAR2(50),
        DATA_CRIACAO TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await connection.execute(createTableQuery);
    console.log('✅ Tabela "ANUNCIOS" criada com sucesso.');
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao criar tabela:", error.message);
    process.exit(1);
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log("✅ Conexão fechada");
      } catch (err) {
        console.error("❌ Erro ao fechar conexão:", err.message);
      }
    }
  }
}

criarTabela();
