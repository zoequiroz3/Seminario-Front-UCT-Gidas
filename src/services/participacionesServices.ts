import {http} from "@/lib/http";

export interface Participacion {
  id: number;
  nombre_evento: string;
  forma_participacion: string;
  fecha: string;
  investigador_id: number;
  investigador?: string;
}

export interface ParticipacionPayload {
  nombre_evento: string;
  forma_participacion: string;
  fecha: string;
  investigador_id: number;
}

export const getParticipaciones = async (
  investigadorId?: number,
  orden: "asc" | "desc" = "asc"
): Promise<Participacion[]> => {
  const params = new URLSearchParams();
  if (investigadorId) params.append("investigador_id", String(investigadorId));
  params.append("orden", orden);
  
  const query = params.toString() ? `?${params.toString()}` : "";
  return http<Participacion[]>(`/participaciones-relevantes${query}`, {
    method: "GET",
  });
};

export const getParticipacionById = async (
  id: number
): Promise<Participacion> => {
  return http<Participacion>(`/participaciones-relevantes/${id}`, {
    method: "GET",
  });
};

export const crearParticipacion = async (
  payload: ParticipacionPayload
): Promise<Participacion> => {
  return http<Participacion>("/participaciones-relevantes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const actualizarParticipacion = async (
  id: number,
  payload: Partial<ParticipacionPayload>
): Promise<Participacion> => {
  return http<Participacion>(`/participaciones-relevantes/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const eliminarParticipacion = async (
  id: number
): Promise<{ message: string }> => {
  return http<{ message: string }>(`/participaciones-relevantes/${id}`, {
    method: "DELETE",
  });
};
