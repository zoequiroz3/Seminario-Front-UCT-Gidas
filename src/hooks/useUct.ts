import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteUct, getUct, upsertUct, type Uct } from "@/services/uctServices";

export function useUct() {
  const qc = useQueryClient();

  const uctQuery = useQuery({
    queryKey: ["uct"],
    queryFn: getUct,
    staleTime: 60_000,  // 1 min
  });

  const saveMutation = useMutation({
    mutationFn: (data: Uct) => upsertUct(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["uct"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUct,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["uct"] }),
  });

  return {
    // datos
    uct: uctQuery.data ?? null,
    isLoading: uctQuery.isLoading,
    isError: uctQuery.isError,

    // acciones
    save: saveMutation.mutateAsync,
    saving: saveMutation.isPending,

    remove: deleteMutation.mutateAsync,
    removing: deleteMutation.isPending,
  };
}
