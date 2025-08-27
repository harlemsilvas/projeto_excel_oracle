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

// --- Função Principal de Importação ---

async function importarProdutosExcel() {
  let connection;

  try {
    // --- Conexão com o Banco de Dados ---
    console.log("🔌 Tentando conectar ao Oracle...");
    connection = await oracledb.getConnection(dbConfig);
    console.log("✅ Conectado ao Oracle");

    // --- Leitura do Arquivo Excel ---
    // Caminho do arquivo Excel
    const caminhoArquivo = path.join(__dirname, "../saida/produtos_sku.xls");
    console.log(`📂 Tentando ler o arquivo: ${caminhoArquivo}`);

    // ✅ Verifica se o arquivo existe
    if (!fs.existsSync(caminhoArquivo)) {
      throw new Error(`Arquivo não encontrado: ${caminhoArquivo}`);
    }

    const workbook = XLSX.readFile(caminhoArquivo);
    const sheetName = workbook.SheetNames[0]; // Assume que os dados estão na primeira aba
    const sheet = workbook.Sheets[sheetName];

    // O arquivo tem cabeçalhos válidos na primeira linha
    const dadosBrutos = XLSX.utils.sheet_to_json(sheet, {
      defval: null,
      range: 1, // Pula a primeira linha (headers) e lê os dados
    });
    console.log(
      `\n📊 Registros encontrados no Excel (brutos): ${dadosBrutos.length}`
    );

    // ✅ DEBUG: Vamos inspecionar a estrutura dos dados
    if (dadosBrutos.length > 0) {
      console.log("\n🔍 DEBUG: Inspecionando estrutura dos dados...");
      console.log("📋 Colunas encontradas:", Object.keys(dadosBrutos[0]));
      console.log("\n📄 Primeiras 3 linhas de exemplo:");
      dadosBrutos.slice(0, 3).forEach((linha, index) => {
        console.log(`   Linha ${index + 1}:`);
        const chaves = Object.keys(linha);
        chaves.slice(0, 8).forEach((chave) => {
          console.log(`     ${chave}: ${linha[chave]}`);
        });
        console.log(`     ... (${chaves.length} colunas no total)`);
      });
    }

    // ✅ Filtra registros com SKU vazio ou nulo
    // Baseado no debug, o SKU está na coluna com chave '7000000'
    const dados = dadosBrutos.filter((linha) => {
      const sku = linha["7000000"]; // Esta é a coluna que contém os SKUs
      return sku !== null && sku !== undefined && String(sku).trim() !== "";
    });
    console.log(`📊 Registros após filtrar SKUs vazios: ${dados.length}`);

    if (dados.length === 0) {
      console.log("⚠️ Nenhum dado válido encontrado para importar.");
      process.exit(0);
    }

    // --- Limpeza das Tabelas (TRUNCATE) ---
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
    const batchSize = 50; // Tamanho do lote para inserção
    const totalBatches = Math.ceil(dados.length / batchSize);

    console.log(
      `📦 Dividindo importação em ${totalBatches} lote(s) de ${batchSize} registros.\n`
    );

    let totalProdutosInseridos = 0;
    let totalImagensInseridas = 0;

    // Loop principal para processar os lotes
    for (let i = 0; i < dados.length; i += batchSize) {
      const batch = dados.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      let produtosInseridosNoLote = 0;
      let imagensInseridasNoLote = 0;

      console.log(
        `--- Iniciando processamento do Lote ${batchNumber}/${totalBatches} ---`
      );

      try {
        // Não precisamos do BEGIN manual, o autoCommit: false já gerencia a transação
        console.log(
          `   🔁 [Lote ${batchNumber}] Transação iniciada (autoCommit: false).`
        );

        // Processa cada linha do lote
        for (const linha of batch) {
          // --- Mapeamento dos dados da planilha para as colunas da tabela ---
          // Como o Excel não tem headers válidos, usamos as chaves que a biblioteca XLSX criou
          const bindsProduto = {
            id_sistema: parseNumero(linha["612377483"]), // Esta coluna contém IDs
            codigo_sku: linha["7000000"]
              ? String(linha["7000000"]).trim()
              : null, // SKU
            descricao: linha[
              "4 Uni Tampa Plástica Para Metalon 30x30 3x3 3cm 30mm Interna - Preto"
            ]
              ? String(
                  linha[
                    "4 Uni Tampa Plástica Para Metalon 30x30 3x3 3cm 30mm Interna - Preto"
                  ]
                ).substring(0, 3999)
              : null, // Descrição
            unidade: linha["Pç"] ? String(linha["Pç"]).substring(0, 9) : null, // Unidade
            classificacao_fiscal: linha["8714.10.00"]
              ? String(linha["8714.10.00"]).substring(0, 19)
              : null, // CF
            origem: linha["0 - Nacional, exceto as indicadas nos códigos 3 a 5"]
              ? String(
                  linha["0 - Nacional, exceto as indicadas nos códigos 3 a 5"]
                ).substring(0, 254)
              : null, // Origem
            preco: parseNumero(linha["19.9"]), // Preço
            valor_ipi_fixo: parseNumero(linha["__EMPTY"]), // IPI (pode estar vazio)
            observacoes: null, // Não identificada
            situacao: linha["Ativo"]
              ? String(linha["Ativo"]).substring(0, 49)
              : null, // Situação
            estoque: parseNumero(linha["-12"]), // Estoque
            preco_custo: parseNumero(linha["0_1"]), // Preço de custo
            cod_fornecedor: linha["__EMPTY_1"]
              ? String(linha["__EMPTY_1"]).substring(0, 99)
              : null, // Cód Fornecedor
            fornecedor: linha["__EMPTY_2"]
              ? String(linha["__EMPTY_2"]).substring(0, 254)
              : null, // Fornecedor
            localizacao: linha["__EMPTY_3"]
              ? String(linha["__EMPTY_3"]).substring(0, 254)
              : null, // Localização
            estoque_maximo: parseNumero(linha["0_2"]), // Estoque máximo
            estoque_minimo: parseNumero(linha["0_3"]), // Estoque mínimo
            peso_liquido_kg: parseNumero(linha["0_4"]), // Peso líquido
            peso_bruto_kg: parseNumero(linha["0_5"]), // Peso bruto
            gtin_ean: null, // Não identificada claramente
            gtin_ean_tributavel: null, // Não identificada
            descricao_complementar: null, // Não identificada
            cest: null, // Não identificada
            categoria: null, // Não identificada
            marca: null, // Não identificada
            garantia: null, // Não identificada
            sob_encomenda:
              linha["S"] === "S" ? "S" : linha["S"] === "N" ? "N" : null, // Sob encomenda
            preco_promocional: null, // Não identificada
          };

          // --- Log para depuração de binds (ativado para debug) ---
          console.log(
            `   📥 [Lote ${batchNumber}] Preparando binds para SKU ${bindsProduto.codigo_sku}:`
          );
          console.log("     ID:", bindsProduto.id_sistema);
          console.log("     SKU:", bindsProduto.codigo_sku);
          console.log(
            "     Descrição:",
            bindsProduto.descricao
              ? bindsProduto.descricao.substring(0, 50) + "..."
              : "null"
          );
          console.log("     Unidade:", bindsProduto.unidade);
          console.log("     Preço:", bindsProduto.preco);

          // --- Inserção do Produto ---
          try {
            await connection.execute(insertProdutoSQL, bindsProduto, {
              autoCommit: false,
            });
            produtosInseridosNoLote++;
            totalProdutosInseridos++;
            // console.log(`   ✅ [Lote ${batchNumber}] Produto inserido: ${bindsProduto.codigo_sku}`);

            // --- Inserção das Imagens (se existirem) ---
            const skuProduto = bindsProduto.codigo_sku;
            if (skuProduto) {
              // Array para armazenar as URLs de imagem desta linha
              // Como não identificamos colunas de imagem na estrutura atual,
              // vamos pular a inserção de imagens por enquanto
              const urlsImagem = [];

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
            // Log do erro mas continua com o lote
            console.error(
              `\n❌ [Lote ${batchNumber}] Erro ao inserir produto (ID Sist: ${bindsProduto.id_sistema} | SKU: ${bindsProduto.codigo_sku}):`,
              insertError.message
            );
            // Opcional: Interromper o lote ou pular o registro?
            // throw insertError; // Para interromper o lote
            continue; // Para pular o registro com erro e continuar
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
        // Decide se aborta a importação inteira ou continua com os próximos lotes
        // throw batchError; // Para abortar
        console.warn(`⚠️ [Lote ${batchNumber}] Lote pulado devido a erro.`);
      }

      console.log(
        `--- Finalizado processamento do Lote ${batchNumber}/${totalBatches} ---\n`
      );
    } // Fim do loop principal for (let i = 0; i < dados.length; i += batchSize)

    console.log(`\n🎉 Importação concluída!`);
    console.log(`   📦 Total de produtos inseridos: ${totalProdutosInseridos}`);
    console.log(`   🖼️ Total de imagens inseridas: ${totalImagensInseridas}`);

    process.exit(0);
  } catch (error) {
    // --- Tratamento de Erro Geral ---
    console.error("\n💥 Erro ao importar dados:", error.message || error);

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
importarProdutosExcel();
