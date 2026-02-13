import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteUct,
  getUct,
  upsertUct,
  type Uct,
} from "@/services/uctServices";

export function useUct() {
  const qc = useQueryClient();

  // ======================
  // Query: obtener UCT
  // ======================
  const uctQuery = useQuery<Uct | null>({
    queryKey: ["uct"],
    queryFn: getUct,
    staleTime: 60_000 // 1 minuto
    
  });

  // ======================
  // Mutation: crear / actualizar
  // ======================
  const saveMutation = useMutation({
    mutationFn: (data: Uct) =>
      upsertUct(data, Boolean(uctQuery.data)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["uct"] });
    },
  });

  // ======================
  // Mutation: eliminar
  // ======================
  const deleteMutation = useMutation({
    mutationFn: deleteUct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["uct"] });
    },
  });

  return {
    // ----------------------
    // estado
    // ----------------------
    uct: uctQuery.data ?? null,
    isLoading: uctQuery.isLoading,
    isError: uctQuery.isError,

    // ----------------------
    // acciones
    // ----------------------
    save: saveMutation.mutateAsync,
    saving: saveMutation.isPending,

    remove: deleteMutation.mutateAsync,
    removing: deleteMutation.isPending,
  };
}
