import { useQuery } from "@tanstack/react-query";
import { getArticulosDivulgacion } from "@/services/articulosDivulgacionServices";
import { useUct } from "@/hooks/useUct";

export const useArticulosDivulgacion = () => {
  const { uct } = useUct();

  const query = useQuery({
    queryKey: ["articulos-divulgacion"],
    queryFn: () => getArticulosDivulgacion(uct?.id),
    enabled: !!uct,
  });

  return {
    list: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
};