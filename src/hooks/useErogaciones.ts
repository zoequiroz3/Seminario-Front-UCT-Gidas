// src/hooks/useErogaciones.ts
import { useQuery } from "@tanstack/react-query";
import { getErogaciones, type Erogaciones } from "@/services/erogacionesServices";

/**
 * Hook reutilizable para obtener la lista de erogaciones.
 * - Puede usarse directamente para listar o refrescar desde componentes.
 */
export function useErogaciones() {
  const { data = [], isLoading, isError, refetch } = useQuery<Erogaciones[]>({
    queryKey: ["erogaciones", "all"],
    queryFn: () => getErogaciones(),
    staleTime: 60_000,
  });

  return { list: data, isLoading, isError, refetch };
}
