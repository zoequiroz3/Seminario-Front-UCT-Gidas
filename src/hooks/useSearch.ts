import { useMemo, useState } from "react";
import { searchAll, type SearchResult, type Orden } from "@/services/searchService";

/* ─── hook principal ─── */
export function useSearch() {
  const [q, setQ] = useState("");
  const [orden, setOrden] = useState<Orden>("alf_asc");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<string | undefined>();
  const [dateTo, setDateTo] = useState<string | undefined>();

  const [loading, setLoading] = useState(false);
  const [rawResults, setRawResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  /** 
   * Ejecuta la búsqueda de forma manual.
   * Se llama desde la UI (ej. al presionar Enter o cambiar el orden).
   */
  async function executeSearch(queryOverride?: string, ordenOverride?: Orden) {
    const queryToUse = (queryOverride ?? q).trim();
    const ordenToUse = ordenOverride ?? orden;

    if (queryToUse.length < 2) {
      setRawResults([]);
      setError(null);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    // No reseteamos hasSearched aquí para no parpadear la UI si ya había resultados,
    // pero lo haremos al final del proceso.

    try {
      const r = await searchAll(queryToUse, ordenToUse);
      setRawResults(r);
      setHasSearched(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error de búsqueda";
      setError(msg);
      setHasSearched(false);
    } finally {
      setLoading(false);
    }
  }

  // Tipos únicos para las pills (basado en todos los resultados del backend)
  const availableTypes = useMemo(() => {
    const set = new Set(rawResults.map((r) => r.tipo));
    return Array.from(set).sort();
  }, [rawResults]);

  // Resultados filtrados (client-side)
  const results = useMemo(() => {
    let filtered = rawResults;

    // Filtro por tipo
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((r) => selectedTypes.includes(r.tipo));
    }

    // Filtro por fecha desde
    if (dateFrom) {
      filtered = filtered.filter((r) => r.fecha && r.fecha >= dateFrom);
    }

    // Filtro por fecha hasta
    if (dateTo) {
      filtered = filtered.filter((r) => r.fecha && r.fecha <= dateTo);
    }

    return filtered;
  }, [rawResults, selectedTypes, dateFrom, dateTo]);

  function toggleType(t: string) {
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  function clearAll() {
    setQ("");
    setSelectedTypes([]);
    setDateFrom(undefined);
    setDateTo(undefined);
    setRawResults([]);
    setError(null);
    setHasSearched(false);
  }

  return {
    q, setQ,
    orden, setOrden,
    selectedTypes, setSelectedTypes,
    toggleType,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    availableTypes,
    loading,
    results,
    totalRaw: rawResults.length,
    error,
    clearAll,
    executeSearch,
    hasSearched, // Exportamos esto
  };
}
