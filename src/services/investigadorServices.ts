import { http } from "@/lib/http";

export interface InvestigadorPayload {
  nombre_apellido: string;
  horas_semanales: number;
  grupo_utn_id: number;
  tipo_dedicacion_id: number;   // 🔥 CORREGIDO
  categoria_utn_id?: number;
  programa_incentivos_id?: number;
  activo: boolean;
}

export function crearInvestigador(payload: InvestigadorPayload) {
  return http("/investigadores/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function actualizarInvestigador(id: number, payload: any) {
  return http(`/investigadores/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}