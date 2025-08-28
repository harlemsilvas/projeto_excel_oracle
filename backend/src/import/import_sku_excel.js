// src/import/import_sku_excel.js
import dotenv from "dotenv";
import oracledb from "oracledb";
import XLSX from "xlsx";
import path from "path";
import fs from "fs"; // ✅ Import fs para verificar existência de arquivo
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

// Validação
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

// ✅ Função para converter valor para número de forma segura
function parseNumero(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }
  // Converte para string primeiro para lidar com números e strings
  let strValor = String(valor).trim();

  // Se for string vazia após trim
  if (strValor === "") {
    return null;
  }

  // ✅ Sanitização: remove símbolos comuns de moeda/formatação
  const valorOriginal = strValor;
  strValor = strValor
    .replace(/[^\d,.-]/g, "") // Remove tudo que NÃO for dígito, vírgula, ponto ou traço
    .replace(/\.(?=.*\.)/g, "") // Remove pontos extras (mantém apenas o último, assumindo formato BR)
    .replace(",", "."); // Substitui vírgula decimal por ponto

  // Tenta converter para número
  const numero = parseFloat(strValor);

  // Verifica se é um número válido
  if (isNaN(numero)) {
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

// ... (imports e configuração iniciais) ...

async function importarProdutosExcel() {
  let connection;

  try {
    // --- Conexão com o Banco de Dados ---
    console.log("🔌 Tentando conectar ao Oracle...");
    connection = await oracledb.getConnection(dbConfig);
    console.log("✅ Conectado ao Oracle");

    // --- Leitura do Arquivo Excel ---
    const caminhoArquivo = path.join(__dirname, "../saida/produtos_sku.xls");
    console.log(`📂 Tentando ler o arquivo: ${caminhoArquivo}`);

    if (!fs.existsSync(caminhoArquivo)) {
      throw new Error(`Arquivo não encontrado: ${caminhoArquivo}`);
    }

    const workbook = XLSX.readFile(caminhoArquivo);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // ✅ Lê os dados como uma matriz (array de arrays)
    const dadosBrutos = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: null,
    });
    console.log(
      `\n📊 Linhas brutas encontradas no Excel: ${dadosBrutos.length}`
    );

    if (dadosBrutos.length < 2) {
      console.log("⚠️ Arquivo Excel vazio ou sem cabeçalhos.");
      process.exit(0);
    }

    // ✅ Assume que a primeira linha é o cabeçalho (mesmo que inválido)
    // e as linhas subsequentes são os dados
    const linhasDados = dadosBrutos.slice(1); // Remove o cabeçalho
    console.log(
      `📊 Linhas de dados após remover cabeçalho: ${linhasDados.length}`
    );

    // ✅ Filtra linhas totalmente vazias
    const dados = linhasDados.filter((linha) => {
      // Verifica se pelo menos uma célula não é nula
      return linha.some(
        (celula) =>
          celula !== null &&
          celula !== undefined &&
          String(celula).trim() !== ""
      );
    });
    console.log(`📊 Linhas de dados após filtrar vazias: ${dados.length}`);

    if (dados.length === 0) {
      console.log("⚠️ Nenhum dado válido encontrado para importar.");
      process.exit(0);
    }

    // --- Limpeza das Tabelas ---
    console.log("\n🗑️ Limpando tabelas antes da importação...");
    try {
      await connection.execute("TRUNCATE TABLE PRODUTO_IMAGENS");
      console.log("✅ Tabela PRODUTO_IMAGENS limpa.");
      await connection.execute("TRUNCATE TABLE PRODUTOS");
      console.log("✅ Tabela PRODUTOS limpa.");
    } catch (truncateError) {
      console.error("❌ Erro ao limpar tabelas:", truncateError.message);
      throw truncateError;
    }

    // --- Preparação da Instrução SQL para PRODUTOS ---
    const insertProdutoSQL = `
      INSERT INTO PRODUTOS (
        ID_SISTEMA, CODIGO_SKU, DESCRICAO, UNIDADE, CLASSIFICACAO_FISCAL, ORIGEM,
        PRECO, VALOR_IPI_FIXO, OBSERVACOES, SITUACAO, ESTOQUE, PRECO_CUSTO,
        COD_FORNECEDOR, FORNECEDOR, LOCALIZACAO, ESTOQUE_MAXIMO, ESTOQUE_MINIMO,
        PESO_LIQUIDO_KG, PESO_BRUTO_KG, GTIN_EAN, GTIN_EAN_TRIBUTAVEL,
        DESCRICAO_COMPLEMENTAR, CEST, CATEGORIA, MARCA, GARANTIA, SOB_ENCOMENDA,
        PRECO_PROMOCIONAL
      ) VALUES (
        :id_sistema, :codigo_sku, :descricao, :unidade, :classificacao_fiscal, :origem,
        :preco, :valor_ipi_fixo, :observacoes, :situacao, :estoque, :preco_custo,
        :cod_fornecedor, :fornecedor, :localizacao, :estoque_maximo, :estoque_minimo,
        :peso_liquido_kg, :peso_bruto_kg, :gtin_ean, :gtin_ean_tributavel,
        :descricao_complementar, :cest, :categoria, :marca, :garantia, :sob_encomenda,
        :preco_promocional
      )
    `;

    // --- Preparação da Instrução SQL para PRODUTO_IMAGENS ---
    const insertImagemSQL = `
      INSERT INTO PRODUTO_IMAGENS (SKU_PRODUTO, URL_IMAGEM, TIPO_IMAGEM, ORDEM_IMAGEM)
      VALUES (:sku_produto, :url_imagem, :tipo_imagem, :ordem_imagem)
    `;

    // --- Processamento em Lotes ---
    const batchSize = 50;
    const totalBatches = Math.ceil(dados.length / batchSize);

    console.log(
      `📦 Dividindo importação em ${totalBatches} lote(s) de ${batchSize} registros.\n`
    );

    let totalProdutosInseridos = 0;
    let totalImagensInseridas = 0;

    for (let i = 0; i < dados.length; i += batchSize) {
      const batch = dados.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      let produtosInseridosNoLote = 0;
      let imagensInseridasNoLote = 0;

      console.log(
        `--- Iniciando processamento do Lote ${batchNumber}/${totalBatches} ---`
      );

      try {
        for (const linha of batch) {
          // ✅ Mapeamento por índice fixo (baseado na estrutura do Excel)
          // Ajuste os índices conforme a posição real das colunas no Excel
          const bindsProduto = {
            id_sistema: parseNumero(linha[0]), // Coluna A
            codigo_sku: linha[1] ? String(linha[1]).trim() : null, // Coluna B
            descricao: linha[2] ? String(linha[2]).substring(0, 3999) : null, // Coluna C
            unidade: linha[3] ? String(linha[3]).substring(0, 9) : null, // Coluna D
            classificacao_fiscal: linha[4]
              ? String(linha[4]).substring(0, 19)
              : null, // Coluna E
            origem: linha[5] ? String(linha[5]).substring(0, 254) : null, // Coluna F
            preco: parseNumero(linha[6]), // Coluna G
            valor_ipi_fixo: parseNumero(linha[7]), // Coluna H
            observacoes: linha[8] ? String(linha[8]).substring(0, 3999) : null, // Coluna I
            situacao: linha[9] ? String(linha[9]).substring(0, 49) : null, // Coluna J
            estoque: parseNumero(linha[10]), // Coluna K
            preco_custo: parseNumero(linha[11]), // Coluna L
            cod_fornecedor: linha[12]
              ? String(linha[12]).substring(0, 99)
              : null, // Coluna M
            fornecedor: linha[13] ? String(linha[13]).substring(0, 254) : null, // Coluna N
            localizacao: linha[14] ? String(linha[14]).substring(0, 254) : null, // Coluna O
            estoque_maximo: parseNumero(linha[15]), // Coluna P
            estoque_minimo: parseNumero(linha[16]), // Coluna Q
            peso_liquido_kg: parseNumero(linha[17]), // Coluna R
            peso_bruto_kg: parseNumero(linha[18]), // Coluna S
            gtin_ean: linha[19] ? String(linha[19]).substring(0, 13) : null, // Coluna T
            gtin_ean_tributavel: linha[20]
              ? String(linha[20]).substring(0, 13)
              : null, // Coluna U
            descricao_complementar: linha[21]
              ? String(linha[21]).substring(0, 3999)
              : null, // Coluna V
            cest: linha[22] ? String(linha[22]).substring(0, 9) : null, // Coluna W
            categoria: linha[23] ? String(linha[23]).substring(0, 499) : null, // Coluna X
            marca: linha[24] ? String(linha[24]).substring(0, 99) : null, // Coluna Y
            garantia: linha[25] ? String(linha[25]).substring(0, 99) : null, // Coluna Z
            sob_encomenda:
              linha[26] === "Sim" ? "S" : linha[26] === "Não" ? "N" : null, // Coluna AA  coluna é kit ou não é kit
            preco_promocional: parseNumero(linha[27]), // Coluna AB
          };

          // --- Log para depuração (opcional) ---
          // console.log(`   📥 [Lote ${batchNumber}] Preparando binds para SKU ${bindsProduto.codigo_sku}:`, bindsProduto);

          // --- Inserção do Produto ---
          try {
            await connection.execute(insertProdutoSQL, bindsProduto, {
              autoCommit: false,
            });
            produtosInseridosNoLote++;
            totalProdutosInseridos++;

            // --- Inserção das Imagens (se existirem) ---
            const skuProduto = bindsProduto.codigo_sku;
            if (skuProduto) {
              // Array para armazenar as URLs de imagem desta linha
              const urlsImagem = [];
              // Assume que as URLs de imagem estão nas colunas AC (28) a AH (33)
              for (let j = 28; j <= 33; j++) {
                const url = linha[j];
                if (url && String(url).trim() !== "") {
                  urlsImagem.push(String(url).trim());
                }
              }

              // Se houver URLs, insere na tabela PRODUTO_IMAGENS
              for (let k = 0; k < urlsImagem.length; k++) {
                const bindsImagem = {
                  sku_produto: skuProduto,
                  url_imagem: urlsImagem[k].substring(0, 499), // Limita para VARCHAR2(500)
                  tipo_imagem: k === 0 ? "Principal" : "Secundária", // Exemplo simples
                  ordem_imagem: k + 1,
                };
                await connection.execute(insertImagemSQL, bindsImagem, {
                  autoCommit: false,
                });
                imagensInseridasNoLote++;
                totalImagensInseridas++;
                // console.log(`      🖼️ [Lote ${batchNumber}] Imagem inserida para ${skuProduto}: ${urlsImagem[k].substring(0, 50)}...`);
              }
            }
          } catch (insertError) {
            console.error(
              `\n❌ [Lote ${batchNumber}] Erro ao inserir produto (ID Sist: ${bindsProduto.id_sistema} | SKU: ${bindsProduto.codigo_sku}):`,
              insertError.message
            );
            continue;
          }
        }

        // --- Commit do Lote ---
        await connection.commit();
        console.log(
          `✅ [Lote ${batchNumber}] Commit realizado. Produtos inseridos: ${produtosInseridosNoLote}, Imagens inseridas: ${imagensInseridasNoLote}.`
        );
      } catch (batchError) {
        await connection.rollback();
        console.error(
          `\n💥 [Lote ${batchNumber}] Erro FATAL ao processar lote:`,
          batchError.message
        );
        console.warn(`⚠️ [Lote ${batchNumber}] Lote pulado devido a erro.`);
      }

      console.log(
        `--- Finalizado processamento do Lote ${batchNumber}/${totalBatches} ---\n`
      );
    }

    console.log(`\n🎉 Importação concluída!`);
    console.log(`   📦 Total de produtos inseridos: ${totalProdutosInseridos}`);
    console.log(`   🖼️ Total de imagens inseridas: ${totalImagensInseridas}`);

    process.exit(0);
  } catch (error) {
    console.error("\n💥 Erro ao importar dados:", error.message || error);
    process.exit(1);
  } finally {
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

importarProdutosExcel();
