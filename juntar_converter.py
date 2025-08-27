# Executar no terminal: py juntar_converter.py 
# Requisitos: pip install pandas pywin32 openpyxl   
# Script para converter arquivos .xls para .xlsx e juntar todos em um único arquivo Excel.
import os
import glob
import pandas as pd
import win32com.client as win32

# Pastas
pasta_entrada = "entrada"
pasta_saida = "saida"
nome_saida = "todos_sku.xlsx"

# Criar pastas se não existirem
os.makedirs(pasta_entrada, exist_ok=True)
os.makedirs(pasta_saida, exist_ok=True)

# Caminho do arquivo final
arquivo_saida = os.path.join(pasta_saida, nome_saida)

# ---- 1. Converter todos os .xls para .xlsx temporariamente ----
excel = win32.Dispatch("Excel.Application")
excel.Visible = False

arquivos_xls = glob.glob(os.path.join(pasta_entrada, "*.xls"))
arquivos_convertidos = []

for arquivo in arquivos_xls:
    nome_arquivo = os.path.basename(arquivo)
    
    # Ignora arquivos temporários do Excel
    if nome_arquivo.startswith("~$"):
        continue

    # Nome temporário para o .xlsx
    caminho_xlsx_temp = os.path.join(pasta_entrada, nome_arquivo.replace(".xls", ".xlsx"))
    
    try:
        wb = excel.Workbooks.Open(os.path.abspath(arquivo))
        wb.SaveAs(os.path.abspath(caminho_xlsx_temp), FileFormat=51)  # 51 = XLSX
        wb.Close()
        arquivos_convertidos.append(caminho_xlsx_temp)
        print(f"✅ Convertido: {nome_arquivo} → {os.path.basename(caminho_xlsx_temp)}")
    except Exception as e:
        print(f"❌ Erro ao converter {nome_arquivo}: {e}")

excel.Quit()

# ---- 2. Juntar todos os .xlsx em um único arquivo ----
arquivos_xlsx = glob.glob(os.path.join(pasta_entrada, "*.xlsx"))
arquivos_xlsx = [f for f in arquivos_xlsx if os.path.basename(f) != nome_saida and not os.path.basename(f).startswith("~$")]

if not arquivos_xlsx:
    print("⚠ Nenhum arquivo .xlsx encontrado para juntar.")
else:
    dfs = []
    for arquivo in arquivos_xlsx:
        try:
            df = pd.read_excel(arquivo)
            dfs.append(df)
            print(f"📄 Lido: {os.path.basename(arquivo)}")
        except Exception as e:
            print(f"❌ Erro ao ler {os.path.basename(arquivo)}: {e}")

    if dfs:
        df_final = pd.concat(dfs, ignore_index=True)
        df_final.to_excel(arquivo_saida, index=False)
        print(f"\n🏁 Arquivo consolidado criado em: {arquivo_saida}")
    else:
        print("⚠ Nenhum dado válido encontrado para juntar.")
