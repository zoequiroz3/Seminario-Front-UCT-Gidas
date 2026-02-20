import { useQuery } from "@tanstack/react-query";
import { getPlanificaciones } from "@/services/planificacionGrupoServices";

export function usePlanificaciones() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["planificaciones"],
    queryFn: getPlanificaciones,
  });

  return {
    list: data ?? [],
    isLoading,
    isError,
  };
}