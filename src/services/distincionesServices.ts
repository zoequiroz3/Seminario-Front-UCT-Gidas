import {http} from "@/lib/http";

export interface Distincion {
  id: number;
  fecha: string;
  descripcion: string;
  proyecto_investigacion_id?: number;
  proyecto?: {
    id: number;
    codigo: string;
    nombre: string;
  };
}

export interface DistincionPayload {
  fecha: string;
  descripcion: string;
  proyecto_investigacion_id?: number;
}

export const getDistinciones = async (
  proyectoId?: number,
  orden: "asc" | "desc" = "asc"
): Promise<Distincion[]> => {
  const params = new URLSearchParams();
  if (proyectoId) params.append("proyecto_id", String(proyectoId));
  params.append("orden", orden);
  
  const query = params.toString() ? `?${params.toString()}` : "";
  return http<Distincion[]>(`/distinciones${query}`, {
    method: "GET",
  });
};

export const getDistincionById = async (
  id: number
): Promise<Distincion> => {
  return http<Distincion>(`/distinciones/${id}`, {
    method: "GET",
  });
};

export const crearDistincion = async (
  payload: DistincionPayload
): Promise<Distincion> => {
  return http<Distincion>("/distinciones", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const actualizarDistincion = async (
  id: number,
  payload: Partial<DistincionPayload>
): Promise<Distincion> => {
  return http<Distincion>(`/distinciones/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const eliminarDistincion = async (
  id: number
): Promise<{ message: string }> => {
  return http<{ message: string }>(`/distinciones/${id}`, {
    method: "DELETE",
  });
};
