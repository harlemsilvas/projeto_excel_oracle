import os
import pandas as pd
from sqlalchemy import create_engine, text
import sys
from wait_for_db import *  # apenas executa a espera

# Variáveis de ambiente
host = os.environ.get("POSTGRES_HOST", "db")
port = os.environ.get("POSTGRES_PORT", "5432")
user = os.environ.get("POSTGRES_USER", "appuser")
password = os.environ.get("POSTGRES_PASSWORD", "apppass")
dbname = os.environ.get("POSTGRES_DB", "appdb")

excel_path = "/data/todos.xlsx"

engine = create_engine(f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{dbname}")

# Ler Excel
if not os.path.exists(excel_path):
    print(f"❌ Não encontrei {excel_path}. Monte a pasta 'saida' corretamente.")
    sys.exit(1)

df = pd.read_excel(excel_path)

# Normalizar nomes de colunas esperadas
colmap = {
    "Id": "id",
    "Integração": "integracao",
    "Identificador": "identificador",
    "Título": "titulo",
    "Produto (SKU)": "produto_sku",
    "Preço de custo": "preco_custo",
    "Preço": "preco",
    "Tipo do anúncio": "tipo_anuncio",
}

# Validação de colunas
missing = [k for k in colmap.keys() if k not in df.columns]
if missing:
    raise ValueError(f"Colunas ausentes no Excel: {missing}")

df = df[list(colmap.keys())].rename(columns=colmap)

# Tipagem / limpeza básica
df["id"] = pd.to_numeric(df["id"], errors="coerce").astype("Int64")
df["preco_custo"] = pd.to_numeric(df["preco_custo"], errors="coerce").fillna(0).round(2)
df["preco"] = pd.to_numeric(df["preco"], errors="coerce").fillna(0).round(2)

# UPSERT usando ON CONFLICT (chave unique em 'identificador')
rows = df.to_dict(orient="records")

insert_sql = text("""
INSERT INTO public.anuncios
  (id, integracao, identificador, titulo, produto_sku, preco_custo, preco, tipo_anuncio)
VALUES
  (:id, :integracao, :identificador, :titulo, :produto_sku, :preco_custo, :preco, :tipo_anuncio)
ON CONFLICT (identificador) DO UPDATE SET
  id = EXCLUDED.id,
  integracao = EXCLUDED.integracao,
  titulo = EXCLUDED.titulo,
  produto_sku = EXCLUDED.produto_sku,
  preco_custo = EXCLUDED.preco_custo,
  preco = EXCLUDED.preco,
  tipo_anuncio = EXCLUDED.tipo_anuncio;
""")

with engine.begin() as conn:
    # garantia de que a tabela existe (caso init não tenha rodado por algum motivo)
    conn.execute(text("""
    CREATE TABLE IF NOT EXISTS public.anuncios (
      id BIGINT,
      integracao TEXT,
      identificador TEXT UNIQUE,
      titulo TEXT,
      produto_sku TEXT,
      preco_custo NUMERIC(12,2),
      preco NUMERIC(12,2),
      tipo_anuncio TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
    """))
    for chunk_start in range(0, len(rows), 1000):
        chunk = rows[chunk_start:chunk_start+1000]
        conn.execute(insert_sql, chunk)

print(f"✅ Ingestão concluída. Linhas processadas: {len(rows)}")
