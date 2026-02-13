import { useQuery } from "@tanstack/react-query";
import { getPersonal } from "@/services/personalServices";
import type { PersonalItem, PersonalType } from "@/services/personalServices";

export function usePersonal(tipo?: PersonalType) {
  const { data, isLoading, isError } = useQuery<PersonalItem[]>({
    queryKey: ["personal", tipo],
    queryFn: () => getPersonal(tipo),
  });

  return {
    list: data ?? [],
    isLoading,
    isError,
  };
}
