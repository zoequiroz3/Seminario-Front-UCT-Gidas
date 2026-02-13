import { useQuery } from "@tanstack/react-query";
import { getErogaciones, type Erogaciones } from "@/services/erogacionesServices";

export function useErogaciones() {
  const { data = [], isLoading, isError } = useQuery<Erogaciones[]>({
    queryKey: ["erogaciones"],
    queryFn: getErogaciones,
    staleTime: 60_000,
  });

  return { list: data, isLoading, isError };
}
