// src/config/db.js
import oracledb from "oracledb";

const dbConfig = {
  user: "HARLEM", // Use o usuário correto
  // process.env.DB_USER,
  password: "010101", // Use a senha correta
  // process.env.DB_PASSWORD,
  connectString: "//192.168.0.102:1521/XEPDB1", // Use o connectString correto
  poolMin: 2,
  poolMax: 10,
  poolIncrement: 1,
  poolTimeout: 60,
};

// if (
//   !process.env.DB_USER ||
//   !process.env.DB_PASSWORD ||
//   !process.env.DB_CONNECT_STRING
// ) {
//   console.error(
//     "❌ Variáveis de ambiente DB_USER, DB_PASSWORD ou DB_CONNECT_STRING não estão definidas."
//   );
//   process.exit(1);
// }

async function initialize() {
  try {
    await oracledb.createPool(dbConfig);
    console.log("✅ Pool de conexões Oracle criado com sucesso");
  } catch (err) {
    console.error("❌ Erro ao criar pool de conexões Oracle:", err);
    process.exit(1);
  }
}

async function query(sql, binds = [], opts = {}) {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const defaultOpts = {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true,
      ...opts,
    };

    const result = await connection.execute(sql, binds, defaultOpts);
    return result;
  } catch (err) {
    console.error("❌ Erro na query Oracle:", err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("❌ Erro ao fechar conexão:", err);
      }
    }
  }
}

async function close() {
  try {
    await oracledb.getPool().close(10);
    console.log("✅ Pool de conexões Oracle fechado");
  } catch (err) {
    console.error("❌ Erro ao fechar pool:", err);
  }
}

// ✅ Exportação padrão
export default {
  initialize,
  query,
  close,
};
