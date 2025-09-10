// hooks/useTrabajosReunion.ts
import { useQuery } from "@tanstack/react-query";
import { getTrabajos, type TrabajoReunion } from "@/services/trabajosReunionServices";

export function useTrabajosReunion(investigadorId?: string) {
  const { data = [], isLoading, isError, refetch } = useQuery<TrabajoReunion[]>({
    queryKey: ["trabajos-reunion", investigadorId ?? "all"],
    queryFn: () => getTrabajos(investigadorId ? { investigadorId } : undefined),
    staleTime: 60_000,
  });
  return { list: data, isLoading, isError, refetch };
}
