import { http } from "@/lib/http";

export interface RegistroPropiedad {
  grupo_utn_id: number;
  created_by: number | null;
  created_at: string | null | undefined;
  deleted_by: number | null;
  deleted_at: string | null | undefined;
  tipo_registro_id: any;
  id: number;
  nombre_articulo: string;
  organismo_registrante: string;
  fecha_registro: string;
  tipo_registro: string;
  grupo: string;
}

export interface RegistroPropiedadPayload {
  nombre_articulo: string;
  organismo_registrante: string;
  fecha_registro: string;
  tipo_registro_id: number;
  grupo_utn_id: number;
}

// GET ALL
export async function getRegistrosPropiedad(): Promise<RegistroPropiedad[]> {
  return http<RegistroPropiedad[]>("/registros-propiedad/");
}

// GET BY ID
export async function getRegistroPropiedadById(id: number): Promise<RegistroPropiedad> {
  return http<RegistroPropiedad>(`/registros-propiedad/${id}`);
}

// CREATE
export async function createRegistroPropiedad(payload: RegistroPropiedadPayload) {
  return http("/registros-propiedad/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// UPDATE
export async function updateRegistroPropiedad(id: number, payload: RegistroPropiedadPayload) {
  return http(`/registros-propiedad/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// DELETE
export async function deleteRegistroPropiedad(id: number) {
  return http(`/registros-propiedad/${id}`, {
    method: "DELETE",
  });
}
