import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProyectos,
  upsertProyectos,
  deleteProyectos,
    getProyectoById,
  type Proyecto,
} from "@/services/proyectosServices";

const QUERY_KEY = ["proyectos"];

/* =========================
   GET ALL
========================= */
export function useProyectos() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: getProyectos,
    staleTime: 60_000,
  });
}

/* =========================
   UPSERT (CREATE / UPDATE)
========================= */
export function useUpsertProyecto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Proyecto) => upsertProyectos(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

/* =========================
   DELETE
========================= */
export function useDeleteProyecto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProyectos(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useProyecto(id?: string) {
  return useQuery({
    queryKey: ["proyecto", id],
    queryFn: () =>
      id ? getProyectoById(Number(id)) : null,
    enabled: Boolean(id),
  });
}
