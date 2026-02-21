import { http } from "@/lib/http";

export interface TrabajoRevista {
  id: number;
  titulo_trabajo: string;
  nombre_revista: string;
  editorial: string;
  issn: string;
  pais: string;
  fecha: string;
  grupo: string | null;
  tipo_reunion?: {
    id: number;
    nombre: string;
  };
  investigadores?: {
    id: number;
    nombre_apellido: string;
  }[];
}

export const getTrabajosRevistas = async () =>
  http<TrabajoRevista[]>("/trabajos-revistas/");

export const getTrabajoRevistaById = async (id: number) =>
  http<TrabajoRevista>(`/trabajos-revistas/${id}`);

export const createTrabajoRevista = async (data: any) =>
  http("/trabajos-revistas/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateTrabajoRevista = async (
  id: number,
  data: any
) =>
  http(`/trabajos-revistas/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteTrabajoRevista = async (id: number) =>
  http(`/trabajos-revistas/${id}`, {
    method: "DELETE",
  });

export const vincularInvestigadoresRevista = async (
  trabajoId: number,
  investigadoresIds: number[]
) =>
  http(`/trabajos-revistas/${trabajoId}/investigadores`, {
    method: "POST",
    body: JSON.stringify({
      investigadores_ids: investigadoresIds,
    }),
  });

export const desvincularInvestigadoresRevista =
  async (trabajoId: number, investigadoresIds: number[]) =>
    http(
      `/trabajos-revistas/${trabajoId}/investigadores`,
      {
        method: "DELETE",
        body: JSON.stringify({
          investigadores_ids: investigadoresIds,
        }),
      }
    );