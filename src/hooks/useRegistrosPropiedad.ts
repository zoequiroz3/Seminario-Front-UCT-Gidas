import { useQuery } from "@tanstack/react-query";
import { getRegistrosPropiedad } from "@/services/registrosPropiedadServices";

export function useRegistrosPropiedad() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["registros-propiedad"],
    queryFn: getRegistrosPropiedad,
  });

  return {
    list: data ?? [],
    isLoading,
    isError,
  };
}
