import { http } from "@/lib/http";

export type Erogaciones = {
  id: number;
  egresos: number;
  ingresos: number;
  numeroErogacion: number;
  tipoErogacion: string;
  fuenteErogaciones: string;
  grupo_utn_id: number;
};

export async function getErogaciones() {
  return http<Erogaciones[]>("/erogaciones/");
}

export async function getErogacionById(id: number) {
  return http<Erogaciones>(`/erogaciones/${id}`);
}

export async function createErogacion(
  payload: Omit<Erogaciones, "id">
) {
  return http<Erogaciones>("/erogaciones/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}



export async function updateErogacion(id: number, payload: Partial<Erogaciones>) {
  return http<Erogaciones>(`/erogaciones/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteErogaciones(id: number) {
  return http<void>(`/erogaciones/${id}`, {
    method: "DELETE",
  });
}
