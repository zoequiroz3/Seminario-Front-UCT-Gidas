// hooks/useDocumentacion.ts
import { useQuery } from "@tanstack/react-query";
import { getDocumentacion, type Documentacion } from "@/services/documentacionServices";

export function useDocumentacion() {
  const {
    data: list = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Documentacion[]>({
    queryKey: ["documentacion"],
    queryFn: getDocumentacion,
    staleTime: 60_000,
  });

  const total = list.length;

  return { list, total, isLoading, isError, refetch };
}
