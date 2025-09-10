// hooks/usePersonal.ts
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPersonal, type Personal, type PersonalType } from "@/services/personalServices";

const SERVER_FILTER_ENABLED =
  (import.meta as any)?.env?.VITE_SERVER_FILTER_PERSONAL === "true";

/**
 * Hook reutilizable para obtener la lista de Personal.
 * - Si pasás `tipo` y el flag está activo, consulta al server con ?tipo=...
 * - Si no, trae todo y filtra en front (transparente para el componente).
 */
export function usePersonal(tipo?: PersonalType) {
  const useServer = Boolean(tipo && SERVER_FILTER_ENABLED);

  const { data: raw = [], isLoading, isError, refetch } = useQuery<Personal[]>({
    queryKey: ["personal", useServer ? tipo : "all"],
    queryFn: () => getPersonal(useServer && tipo ? { tipo } : undefined),
    staleTime: 60_000,
  });

  // Front-filter (solo si no usamos filtro en server)
  const list = useMemo(() => {
    if (!tipo || useServer) return raw;
    return raw.filter((p) => p.tipo === tipo);
  }, [raw, tipo, useServer]);

  // Extras útiles (opcionales)
  const total = raw.length;
  const count = list.length;

  return { list, total, count, isLoading, isError, refetch };
}
