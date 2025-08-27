// src/import/import_sku_excel.js
import dotenv from "dotenv";
import oracledb from "oracledb";
import XLSX from "xlsx";
import path from "path";
import fs from "fs"; // ✅ Adicione esta linha
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
    connection = await oracledb.getConnection(dbConfig);
    console.log("✅ Conectado ao Oracle");

    // --- Leitura do Arquivo Excel ---
    // Assumindo que o arquivo está em src/saida/produtos_*.xls
    // Você pode modificar esse caminho conforme necessário
    const caminhoArquivo = path.join(__dirname, "../saida/produtos_sku.xls");
    console.log(`📂 Tentando ler o arquivo: ${caminhoArquivo}`);

    if (!fs.existsSync(caminhoArquivo)) {
      throw new Error(`Arquivo não encontrado: ${caminhoArquivo}`);
    }

    const workbook = XLSX.readFile(caminhoArquivo);
    const sheetName = workbook.SheetNames[0]; // Assume que os dados estão na primeira aba
    const sheet = workbook.Sheets[sheetName];

    // Converte para JSON, começando da linha 2 (linha 1 é o cabeçalho)
    const dados = XLSX.utils.sheet_to_json(sheet, { defval: null, range: 1 });
    console.log(`\n📊 Registros encontrados no Excel: ${dados.length}`);

    if (dados.length === 0) {
      console.log("⚠️ Nenhum dado encontrado para importar.");
      process.exit(0);
    }

    // --- Preparação da Instrução SQL para PRODUTOS ---
    // Note que ID é auto-incrementado, então não o incluímos
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

    for (let i = 0; i < dados.length; i += batchSize) {
      const batch = dados.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      let produtosInseridosNoLote = 0;
      let imagensInseridasNoLote = 0;

      console.log(
        `--- Iniciando processamento do Lote ${batchNumber}/${totalBatches} ---`
      );

      try {
        // Inicia uma transação para o lote
        await connection.execute("BEGIN", [], { autoCommit: false });

        for (const linha of batch) {
          // --- Mapeamento dos dados da planilha para as colunas da tabela ---
          const bindsProduto = {
            id_sistema: parseNumero(linha["ID"]),
            codigo_sku: linha["Código (SKU)"]
              ? String(linha["Código (SKU)"]).trim()
              : null,
            descricao: linha["Descrição"]
              ? String(linha["Descrição"]).substring(0, 3999)
              : null, // Limita para VARCHAR2
            unidade: linha["Unidade"]
              ? String(linha["Unidade"]).substring(0, 9)
              : null,
            classificacao_fiscal: linha["Classificação fiscal"]
              ? String(linha["Classificação fiscal"]).substring(0, 19)
              : null,
            origem: linha["Origem"]
              ? String(linha["Origem"]).substring(0, 254)
              : null,
            preco: parseNumero(linha["Preço"]),
            valor_ipi_fixo: parseNumero(linha["Valor IPI fixo"]),
            observacoes: linha["Observações"]
              ? String(linha["Observações"]).substring(0, 3999)
              : null, // Limita para VARCHAR2
            situacao: linha["Situação"]
              ? String(linha["Situação"]).substring(0, 49)
              : null,
            estoque: parseNumero(linha["Estoque"]),
            preco_custo: parseNumero(linha["Preço de custo"]),
            cod_fornecedor: linha["Cód do Fornecedor"]
              ? String(linha["Cód do Fornecedor"]).substring(0, 99)
              : null,
            fornecedor: linha["Fornecedor"]
              ? String(linha["Fornecedor"]).substring(0, 254)
              : null,
            localizacao: linha["Localização"]
              ? String(linha["Localização"]).substring(0, 254)
              : null,
            estoque_maximo: parseNumero(linha["Estoque máximo"]),
            estoque_minimo: parseNumero(linha["Estoque mínimo"]),
            peso_liquido_kg: parseNumero(linha["Peso líquido (Kg)"]),
            peso_bruto_kg: parseNumero(linha["Peso bruto (Kg)"]),
            gtin_ean: linha["GTIN/EAN"]
              ? String(linha["GTIN/EAN"]).substring(0, 13)
              : null,
            gtin_ean_tributavel: linha["GTIN/EAN tributável"]
              ? String(linha["GTIN/EAN tributável"]).substring(0, 13)
              : null,
            descricao_complementar: linha["Descrição complementar"]
              ? String(linha["Descrição complementar"]).substring(0, 3999)
              : null, // Limita para VARCHAR2
            cest: linha["CEST"] ? String(linha["CEST"]).substring(0, 9) : null,
            categoria: linha["Categoria"]
              ? String(linha["Categoria"]).substring(0, 499)
              : null,
            marca: linha["Marca"]
              ? String(linha["Marca"]).substring(0, 99)
              : null,
            garantia: linha["Garantia"]
              ? String(linha["Garantia"]).substring(0, 99)
              : null,
            sob_encomenda:
              linha["Sob encomenda"] === "Sim"
                ? "S"
                : linha["Sob encomenda"] === "Não"
                ? "N"
                : null,
            preco_promocional: parseNumero(linha["Preço promocional"]),
          };

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
              for (let j = 1; j <= 6; j++) {
                const url = linha[`URL imagem ${j}`];
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
              }
            }
          } catch (insertError) {
            // Log do erro mas continua com o lote
            console.error(
              `\n❌ Erro ao inserir produto (ID Sist: ${bindsProduto.id_sistema} | SKU: ${bindsProduto.codigo_sku}):`,
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
