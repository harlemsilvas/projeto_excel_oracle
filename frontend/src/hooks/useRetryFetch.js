// src/hooks/useRetryFetch.js
import { useState, useEffect, useRef } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const DEFAULT_DEBOUNCE_MS = 300; // 300ms padrão
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutos de cache

/**
 * Hook personalizado para buscar dados com retry, debounce e cache opcional.
 *
 * @param {string} endpoint - O endpoint da API (ex: '/api/resumo').
 * @param {Object} options - Opções de configuração.
 * @param {number} [options.debounceMs=300] - Tempo de debounce em milissegundos.
 * @param {string} [options.cacheKey] - Chave para caching. Se fornecida, ativa o cache.
 * @param {Object} [options.fetchOptions={}] - Opções extras para fetch (headers, etc).
 * @returns {Object} - Objeto com { data, loading, error }.
 */
export function useRetryFetch(endpoint, options = {}) {
  const {
    debounceMs = DEFAULT_DEBOUNCE_MS,
    cacheKey,
    fetchOptions = {},
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    // Cancela requisição anterior se ainda estiver pendente
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Limpa o timer de debounce anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const fetchData = async () => {
      // Se uma cacheKey foi fornecida, tenta ler do cache primeiro
      if (cacheKey) {
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          try {
            const { data: cachedResult, timestamp } = JSON.parse(cachedData);
            const now = new Date().getTime();
            if (now - timestamp < CACHE_DURATION_MS) {
              console.log(`[useRetryFetch] Usando cache para ${cacheKey}`);
              setData(cachedResult);
              setLoading(false);
              setError(null);
              return; // Não faz a requisição se o cache for válido
            } else {
              console.log(`[useRetryFetch] Cache expirado para ${cacheKey}`);
              localStorage.removeItem(cacheKey); // Remove cache expirado
            }
          } catch (e) {
            console.error("[useRetryFetch] Erro ao ler cache:", e);
            localStorage.removeItem(cacheKey);
          }
        }
      }

      // Se não usou o cache, faz a requisição
      setLoading(true);
      setError(null);

      const maxRetries = 3;
      const baseDelay = 1000; // 1s

      const attemptFetch = async (retries = 0) => {
        try {
          // Cria um novo AbortController para esta tentativa
          abortControllerRef.current = new AbortController();
          const signal = abortControllerRef.current.signal;

          const fullUrl = `${API_URL}${endpoint}`;
          console.log(`[useRetryFetch] Buscando: ${fullUrl}`);

          const res = await fetch(fullUrl, {
            ...fetchOptions,
            signal, // Passa o signal para poder abortar
          });

          if (!res.ok) {
            // Se for 429 (Too Many Requests), força retry
            if (res.status === 429 && retries < maxRetries) {
              throw new Error(`HTTP 429 - Tentando novamente...`);
            }
            throw new Error(`HTTP ${res.status}`);
          }

          const contentType = res.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Resposta não é JSON");
          }

          const result = await res.json();

          // Se uma cacheKey foi fornecida, salva no cache
          if (cacheKey) {
            const cacheData = {
              data: result,
              timestamp: new Date().getTime(),
            };
            try {
              localStorage.setItem(cacheKey, JSON.stringify(cacheData));
              console.log(
                `[useRetryFetch] Dados salvos no cache para ${cacheKey}`
              );
            } catch (e) {
              console.warn(
                "[useRetryFetch] Não foi possível salvar no cache:",
                e
              );
            }
          }

          setData(result);
          setLoading(false);
        } catch (err) {
          // Se o fetch foi abortado, não trata como erro
          if (err.name === "AbortError") {
            console.log("[useRetryFetch] Requisição abortada");
            return;
          }

          if (retries < maxRetries) {
            const delay = baseDelay * Math.pow(2, retries); // Exponential backoff
            console.warn(
              `[useRetryFetch] Tentativa ${retries + 1} falhou: ${
                err.message
              }. Tentando em ${delay}ms...`
            );
            setTimeout(() => attemptFetch(retries + 1), delay);
          } else {
            console.error("[useRetryFetch] Todas as tentativas falharam:", err);
            setError(err.message);
            setLoading(false);
          }
        }
      };

      attemptFetch();
    };

    // Aplica o debounce
    debounceTimerRef.current = setTimeout(fetchData, debounceMs);

    // Cleanup: limpa timer e aborta requisição ao desmontar ou mudar dependências
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [endpoint, debounceMs, cacheKey, JSON.stringify(fetchOptions)]); // Re-executa se endpoint, debounce ou fetchOptions mudarem

  return { data, loading, error };
}
