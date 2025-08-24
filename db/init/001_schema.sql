-- Tabela principal
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

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_anuncios_sku ON public.anuncios (produto_sku);
CREATE INDEX IF NOT EXISTS idx_anuncios_tipo ON public.anuncios (tipo_anuncio);

-- View com métricas (lucro, margem)
CREATE OR REPLACE VIEW public.anuncios_view AS
SELECT
  a.*,
  (COALESCE(preco,0) - COALESCE(preco_custo,0))       AS lucro,
  CASE WHEN COALESCE(preco,0) = 0
       THEN NULL
       ELSE ROUND(((COALESCE(preco,0) - COALESCE(preco_custo,0)) / NULLIF(preco,0)) * 100, 2)
  END                                                 AS margem_pct
FROM public.anuncios a;
