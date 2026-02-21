import { useQuery } from "@tanstack/react-query";
import { getTrabajosReunion } from "@/services/trabajosReunionServices";

export function useTrabajosReunion() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["trabajos-reunion"],
    queryFn: getTrabajosReunion,
  });

  return {
    list: data ?? [],
    isLoading,
    isError,
  };
}