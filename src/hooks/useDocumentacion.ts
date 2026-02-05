import { useQuery } from "@tanstack/react-query";
import {
  getDocumentacion,
  type Documentacion,
} from "@/services/documentacionServices";

export function useDocumentacion() {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery<Documentacion[]>({
    queryKey: ["documentacion"],
    queryFn: getDocumentacion,
    staleTime: 60_000,
  });

  return {
    list: data ?? [],
    total: data?.length ?? 0,
    isLoading,
    isError,
    refetch,
  };
}
