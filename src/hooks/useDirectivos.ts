// src/hooks/useDirectivos.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDirectivosActuales,
  createDirectivo,
  asignarDirectivo,
} from "@/services/directivosServices";

export function useDirectivos(grupoId?: number) {
  return useQuery({
    queryKey: ["directivos", grupoId],
    queryFn: () => getDirectivosActuales(grupoId!),
    enabled: !!grupoId,
  });
}

// ------------------------------------
// Crear + asignar en un solo paso
// ------------------------------------
export function useCrearYAsignarDirectivo(grupoId: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      nombre_apellido: string;
      id_cargo: number;
      fecha_inicio: string;
    }) => {
      // 1️⃣ crear directivo
      const nuevo = await createDirectivo({
        nombre_apellido: data.nombre_apellido,
      });

      // 2️⃣ asignarlo al grupo
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