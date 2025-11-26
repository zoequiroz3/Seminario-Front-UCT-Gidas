import { useEffect, useMemo, useState } from "react";
import { searchAll, type SearchParams, type SearchResult, type RecordType } from "@/services/searchService";

function useDebounce<T>(value: T, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => { const id = setTimeout(() => setV(value), ms); return () => clearTimeout(id); }, [value, ms]);
  return v;
}

export function useSearch() {
  const [q, setQ] = useState("");
  const [types, setTypes] = useState<RecordType[]>([]);
  const [dateFrom, setDateFrom] = useState<string | undefined>();
  const [dateTo, setDateTo] = useState<string | undefined>();
  const [sort, setSort] = useState<SearchParams["sort"]>("date_desc");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const debounced = useDebounce({ q, types, dateFrom, dateTo, sort }, 300);
  const params = useMemo<SearchParams>(() => debounced, [debounced]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true); setError(null);
      try {
        const r = await searchAll(params);
        if (!cancelled) setResults(r);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Error de búsqueda");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [params]);

  function clearAll() {
    setQ("");
    setTypes([]);
    setDateFrom(undefined);
    setDateTo(undefined);
    setSort("date_desc");
  }

  return {
    q, setQ,
    types, setTypes,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    sort, setSort,
    loading, results, error,
    clearAll,
  };
}
