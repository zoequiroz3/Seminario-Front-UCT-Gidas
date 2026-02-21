import {http} from "@/lib/http";

export interface Visitante {
  id: number;
  razon: string;
  fecha: string;
  grupo_utn_id: number;
  grupo?: string;
  procedencia_visita_id: number;
  visita_procedencia?: {
    id: number;
    nombre: string;
  };
  tipo_visita_id: number;
  tipo_visita?: {
    id: number;
    nombre: string;
  };
}

export interface VisitantePayload {
  razon: string;
  fecha: string;
  procedencia_visita_id: number;
  tipo_visita_id: number;
  grupo_utn_id: number;
}

export const getVisitantes = async (): Promise<Visitante[]> => {
  return http<Visitante[]>("/visitas-academicas", {
    method: "GET",
  });
};

export const getVisitanteById = async (
  id: number
): Promise<Visitante> => {
  return http<Visitante>(`/visitas-academicas/${id}`, {
    method: "GET",
  });
};

export const crearVisitante = async (
  payload: VisitantePayload
): Promise<Visitante> => {
  return http<Visitante>("/visitas-academicas", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const actualizarVisitante = async (
  id: number,
  payload: Partial<VisitantePayload>
): Promise<Visitante> => {
  return http<Visitante>(`/visitas-academicas/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const eliminarVisitante = async (
  id: number
): Promise<{ message: string }> => {
  return http<{ message: string }>(`/visitas-academicas/${id}`, {
    method: "DELETE",
  });
};
