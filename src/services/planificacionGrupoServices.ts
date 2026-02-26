import { http } from "@/lib/http";

export interface PlanificacionGrupo {
  id: number;
  descripcion: string;
  anio: number;
  grupo_id: number;
  grupo?: string;
  created_at?: string;
  creator_name?: string;
  deleted_at?: string;
  deleter_name?: string;
  activo?: boolean;
}

export interface PlanificacionGrupoPayload {
  descripcion: string;
  anio: number;
  grupo_id: number;
}

// 🔹 GET ALL
export const getPlanificaciones = async (): Promise<PlanificacionGrupo[]> => {
  return http<PlanificacionGrupo[]>("/planificaciones/", {
    method: "GET",
  });
};

// 🔹 GET BY ID
export const getPlanificacionById = async (
  id: number
): Promise<PlanificacionGrupo> => {
  return http<PlanificacionGrupo>(`/planificaciones/${id}`, {
    method: "GET",
  });
};

// 🔹 CREATE
export const createPlanificacion = async (
  data: PlanificacionGrupoPayload
): Promise<PlanificacionGrupo> => {
  return http<PlanificacionGrupo>("/planificaciones/", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// 🔹 UPDATE
export const updatePlanificacion = async (
  id: number,
  data: Partial<PlanificacionGrupoPayload>
): Promise<PlanificacionGrupo> => {
  return http<PlanificacionGrupo>(`/planificaciones/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

// 🔹 DELETE
export const deletePlanificacion = async (id: number) => {
  return http(`/planificaciones/${id}`, {
    method: "DELETE",
  });
};