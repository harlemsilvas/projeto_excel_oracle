import pandas as pd
import os

# Caminho do arquivo de entrada
arquivo = os.path.join("saida", "todos.xlsx")

# Função para carregar dados
def carregar_dados():
    if not os.path.exists(arquivo):
        print(f"❌ Arquivo {arquivo} não encontrado.")
        return None
    df = pd.read_excel(arquivo)
    if "Preço" in df.columns and "Preço de custo" in df.columns:
        df["Lucro"] = df["Preço"] - df["Preço de custo"]
        df["Margem (%)"] = (df["Lucro"] / df["Preço"]) * 100
    else:
        print("❌ Colunas 'Preço' e 'Preço de custo' não encontradas no arquivo.")
        return None
    return df

# Resumo geral
def resumo_geral(df):
    print("\n📊 RESUMO GERAL")
    print(f"Total de anúncios: {len(df)}")
    print(f"Preço médio: R$ {df['Preço'].mean():.2f}")
    print(f"Lucro médio: R$ {df['Lucro'].mean():.2f}")
    print(f"Lucro total: R$ {df['Lucro'].sum():.2f}")

# Filtrar por tipo de anúncio
def filtrar_tipo(df):
    tipos = df["Tipo do anúncio"].dropna().unique()
    print("\nTipos disponíveis:", ", ".join(tipos))
    tipo = input("Digite o tipo desejado: ").strip()
    filtrado = df[df["Tipo do anúncio"] == tipo]
    salvar_filtro(filtrado, f"filtro_tipo_{tipo}.xlsx")

# Filtrar por SKU
def filtrar_sku(df):
    sku = input("Digite o SKU: ").strip()
    filtrado = df[df["Produto (SKU)"].astype(str) == sku]
    salvar_filtro(filtrado, f"filtro_sku_{sku}.xlsx")

# Filtrar por palavra no título
def filtrar_titulo(df):
    palavra = input("Digite palavra para buscar no título: ").strip().lower()
    filtrado = df[df["Título"].str.lower().str.contains(palavra, na=False)]
    salvar_filtro(filtrado, f"filtro_titulo_{palavra}.xlsx")

# Salvar arquivo filtrado
def salvar_filtro(df_filtrado, nome_arquivo):
    if df_filtrado.empty:
        print("⚠ Nenhum resultado encontrado.")
        return
    caminho = os.path.join("saida", nome_arquivo)
    df_filtrado.to_excel(caminho, index=False)
    print(f"✅ Arquivo salvo: {caminho}")

# Menu interativo
def menu():
    df = carregar_dados()
    if df is None:
        return

    while True:
        print("\n=== MENU ANÁLISE ===")
        print("1 - Resumo geral")
        print("2 - Filtrar por tipo de anúncio")
        print("3 - Filtrar por SKU")
        print("4 - Filtrar por palavra no título")
        print("0 - Sair")
        
        opcao = input("Escolha uma opção: ").strip()

        if opcao == "1":
            resumo_geral(df)
        elif opcao == "2":
            filtrar_tipo(df)
        elif opcao == "3":
            filtrar_sku(df)
        elif opcao == "4":
            filtrar_titulo(df)
        elif opcao == "0":
            print("👋 Saindo...")
            break
        else:
            print("❌ Opção inválida.")

if __name__ == "__main__":
    menu()
