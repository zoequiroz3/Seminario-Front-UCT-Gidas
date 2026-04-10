import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDirectivosActuales,
  createDirectivo,
  asignarDirectivo,
  finalizarDirectivo,
} from "@/services/directivosServices";

export function useDirectivos(grupoId?: number) {
  return useQuery({
    queryKey: ["directivos", grupoId],
    queryFn: () => getDirectivosActuales(grupoId!),
    enabled: !!grupoId,
  });
}

export function useCrearYAsignarDirectivo(grupoId: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      nombre_apellido: string;
      id_cargo: number;
      fecha_inicio: string;
    }) => {
      const nuevo = await createDirectivo({
        nombre_apellido: data.nombre_apellido,
      });

      await asignarDirectivo({
        id_directivo: nuevo.id,
        id_grupo_utn: grupoId,
        id_cargo: data.id_cargo,
        fecha_inicio: data.fecha_inicio,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["directivos", grupoId] });
    },
  });
}

export function useFinalizarDirectivo() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id_directivo,
      fecha_fin,
    }: {
      id_directivo: number;
      fecha_fin: string;
    }) => finalizarDirectivo(id_directivo, fecha_fin),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["uct"] });
    },
  });
}