// src/import/import_excel.js
import dotenv from "dotenv";
import oracledb from "oracledb";
import XLSX from "xlsx";
import path from "path";
import { fileURLToPath } from "url";

// --- Configuração e Validação Inicial ---

// Configura o dotenv e garante o caminho correto
dotenv.config({
  path: path.join(path.dirname(fileURLToPath(import.meta.url)), "../../.env"),
});

// Debug: verifique as variáveis
console.log("DB_USER:", process.env.DB_USER);
console.log(
  "DB_PASSWORD:",
  process.env.DB_PASSWORD ? "✅ definido" : "❌ não definido"
);
console.log(
  "DB_CONNECT_STRING:",
  process.env.DB_CONNECT_STRING ? "✅ definido" : "❌ não definido"
);

// Validação de variáveis de ambiente
if (
  !process.env.DB_USER ||
  !process.env.DB_PASSWORD ||
  !process.env.DB_CONNECT_STRING
) {
  console.error(
    "❌ Variáveis de ambiente DB_USER, DB_PASSWORD ou DB_CONNECT_STRING não estão definidas."
  );
  process.exit(1);
}

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING,
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Funções Auxiliares ---

// ✅ Função aprimorada para converter valor para número de forma segura
function parseNumero(valor) {
  // Trata casos obviamente não numéricos ou vazios
  if (valor === null || valor === undefined || valor === "" || valor === " ") {
    return null;
  }

  // Converte para string primeiro para manipulação uniforme
  let strValor = String(valor).trim();

  // Se for string vazia após trim
  if (strValor === "") {
    return null;
  }

  // ✅ Sanitização: remove símbolos comuns de moeda/formatação
  // Esta etapa tenta extrair o número de strings como "R$ 100,50" ou "1.000,00"
  const valorOriginal = strValor;
  strValor = strValor
    .replace(/[^\d,.-]/g, "") // Remove tudo que NÃO for dígito, vírgula, ponto ou traço
    .replace(/\.(?=.*\.)/g, "") // Remove pontos extras (mantém apenas o último, assumindo formato BR)
    .replace(",", "."); // Substitui vírgula decimal por ponto

  // Tenta converter para número
  const numero = parseFloat(strValor);

  // Verifica se é um número válido
  if (isNaN(numero)) {
    // ✅ Log detalhado para ajudar a identificar o problema
    // console.warn(`⚠️ [ParseNumero] Valor inválido para número: Original="${valorOriginal}", Processado="${strValor}". Convertendo para NULL.`);
    return null;
  }

  // ✅ Verificação extra: se o número for Infinity ou -Infinity
  if (!isFinite(numero)) {
    // console.warn(`⚠️ [ParseNumero] Valor resultou em Infinity: Original="${valorOriginal}", Processado="${strValor}". Convertendo para NULL.`);
    return null;
  }

  return numero;
}

// --- Função Principal de Importação ---

async function importarExcel() {
  let connection;

  try {
    // --- Conexão com o Banco de Dados ---
    connection = await oracledb.getConnection(dbConfig);
    console.log("✅ Conectado ao Oracle");

    // --- Truncar a tabela ANUNCIOS ---
    try {
      await connection.execute(`TRUNCATE TABLE ANUNCIOS`);
      console.log("🗑️ Tabela ANUNCIOS truncada com sucesso.");
    } catch (truncateError) {
      console.error(
        "❌ Erro ao truncar a tabela ANUNCIOS:",
        truncateError.message
      );
      console.warn("⚠️ Continuando a importação mesmo com erro no TRUNCATE.");
      // Se quiser abortar em caso de falha no TRUNCATE, descomente a linha abaixo:
      // throw truncateError;
    }

    // --- Leitura do Arquivo Excel ---
    const caminhoArquivo = path.join(__dirname, "../saida/todos.xlsx");
    const workbook = XLSX.readFile(caminhoArquivo);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const dados = XLSX.utils.sheet_to_json(sheet, { defval: null });
    console.log(`\n📂 Registros encontrados no Excel: ${dados.length}`);

    // --- Preparação da Instrução SQL ---
    const mergeSQL = `
      MERGE INTO ANUNCIOS t
      USING (SELECT :integracao as integracao,
                    :identificador as identificador,
                    :titulo as titulo,
                    :produto_sku as produto_sku,
                    :preco_custo as preco_custo,
                    :preco as preco,
                    :tipo_anuncio as tipo_anuncio
             FROM DUAL) s
      ON (t.IDENTIFICADOR = s.IDENTIFICADOR)
      WHEN MATCHED THEN
        UPDATE SET
          INTEGRACAO = s.INTEGRACAO,
          TITULO = s.TITULO,
          PRODUTO_SKU = s.PRODUTO_SKU,
          PRECO_CUSTO = s.PRECO_CUSTO,
          PRECO = s.PRECO,
          TIPO_ANUNCIO = s.TIPO_ANUNCIO
      WHEN NOT MATCHED THEN
        INSERT (INTEGRACAO, IDENTIFICADOR, TITULO, PRODUTO_SKU, PRECO_CUSTO, PRECO, TIPO_ANUNCIO)
        VALUES (
          s.INTEGRACAO,
          s.IDENTIFICADOR,
          s.TITULO,
          s.PRODUTO_SKU,
          s.PRECO_CUSTO,
          s.PRECO,
          s.TIPO_ANUNCIO
        )
    `;

    // --- Processamento em Lotes ---
    const batchSize = 100;
    const totalBatches = Math.ceil(dados.length / batchSize);

    console.log(
      `📦 Dividindo importação em ${totalBatches} lote(s) de ${batchSize} registros.\n`
    );

    for (let i = 0; i < dados.length; i += batchSize) {
      const batch = dados.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      let registrosProcessadosComSucesso = 0;
      let registrosComErro = 0;

      console.log(
        `--- Iniciando processamento do Lote ${batchNumber}/${totalBatches} ---`
      );

      // --- Processamento Individual com Tolerância a Falhas ---
      for (const linha of batch) {
        const {
          Integração,
          Identificador,
          Título,
          "Produto (SKU)": produto_sku,
          "Preço de custo": preco_custo,
          Preço: preco,
          "Tipo do anúncio": tipo_anuncio,
        } = linha;

        // ✅ Validação: pula se identificador for vazio
        if (!Identificador || Identificador.toString().trim() === "") {
          // console.warn(`⚠️ [Lote ${batchNumber}] Linha ignorada: Identificador vazio.`);
          registrosComErro++;
          continue;
        }

        // ✅ Preparação dos binds com parse seguro
        const binds = {
          integracao: Integração || null,
          identificador: Identificador || null,
          titulo: Título || null,
          produto_sku: produto_sku || null,
          preco_custo: parseNumero(preco_custo),
          preco: parseNumero(preco),
          tipo_anuncio: tipo_anuncio || null,
        };

        // ✅ Processamento individual com tolerância a falhas
        try {
          await connection.execute(mergeSQL, binds, { autoCommit: false });
          registrosProcessadosComSucesso++;
        } catch (registroError) {
          registrosComErro++;
          console.error(
            `\n❌ [Lote ${batchNumber}] Erro ao processar registro (Identificador: ${
              Identificador || "N/A"
            }):`,
            registroError.message
          );

          // Dica específica para ORA-01722
          if (registroError.errorNum === 1722) {
            console.error(
              `   💡 Dica: Verifique os valores de PRECO_CUSTO='${preco_custo}' e PRECO='${preco}' para este registro no Excel.`
            );
            // console.error(`   Linha completa:`, linha); // Opcional: Mostra os dados problemáticos
          }
          // Continue para o próximo registro do lote
          continue;
        }
      } // Fim do loop for (const linha of batch)

      // --- Commit do Lote ---
      try {
        if (registrosProcessadosComSucesso > 0) {
          await connection.commit();
          console.log(
            `✅ [Lote ${batchNumber}] Commit realizado. Sucessos: ${registrosProcessadosComSucesso}, Erros/Ignorados: ${registrosComErro}.`
          );
        } else {
          console.log(
            `⚠️ [Lote ${batchNumber}] Nenhum registro foi processado com sucesso. Commit não realizado.`
          );
        }
      } catch (commitError) {
        console.error(
          `\n💥 [Lote ${batchNumber}] Erro FATAL ao fazer COMMIT:`,
          commitError.message
        );
        throw commitError; // Relança para o catch externo abortar
      }

      console.log(
        `--- Finalizado processamento do Lote ${batchNumber}/${totalBatches} ---\n`
      );
    } // Fim do loop principal for (let i = 0; i < dados.length; i += batchSize)

    console.log(
      "\n🎉 Importação concluída! Verifique os logs acima para possíveis erros em registros individuais."
    );
    process.exit(0);
  } catch (error) {
    // --- Tratamento de Erro Geral ---
    console.error("\n💥 Erro ao importar dados:", error.message || error);

    if (error.errorNum === 1722) {
      console.error(
        "\n💡 Dica: ORA-01722 significa que um valor não numérico foi passado para uma coluna NUMBER."
      );
      console.error(
        "   Verifique as colunas PRECO_CUSTO e PRECO nos seus dados de origem (Excel)."
      );
      console.error(
        "   Valores como 'N/A', 'R$ 100', '-' ou células vazias podem causar isso."
      );
    }

    process.exit(1);
  } finally {
    // --- Fechamento da Conexão ---
    if (connection) {
      try {
        await connection.close();
        console.log("✅ Conexão com o banco fechada.");
      } catch (closeError) {
        console.error("❌ Erro ao fechar conexão:", closeError.message);
      }
    }
  }
}

// --- Inicia a importação ---
importarExcel();
