import { useQuery } from "@tanstack/react-query";
import { getTrabajosRevistas } from "@/services/trabajosRevistasServices";

export function useTrabajosRevistas() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["trabajos-revistas"],
    queryFn: getTrabajosRevistas,
  });

  return {
    list: data ?? [],
    isLoading,
    isError,
  };
}