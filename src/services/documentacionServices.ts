import { http } from "@/lib/http";

export interface Autor {
  id: number;
  nombre_apellido: string;
}

export interface Documentacion {
  id: number;
  titulo: string;
  editorial: string;
  anio: number;
  grupo_id: string | null;
  autores: Autor[];
  created_at?: string;
  creator_name?: string;
  deleted_at?: string;
  deleter_name?: string;
  activo?: boolean;
}

export interface DocumentacionPayload {
  titulo: string;
  editorial: string;
  anio: number;
  grupo_id?: number;
}

// GET ALL
export async function getDocumentacion(): Promise<Documentacion[]> {
  return http<Documentacion[]>("/documentacion-bibliografica/");
}

// GET BY ID
export async function getDocumentacionById(id: number): Promise<Documentacion> {
  return http<Documentacion>(`/documentacion-bibliografica/${id}`);
}

// CREATE
export async function createDocumentacion(
  payload: DocumentacionPayload
): Promise<Documentacion> {
  return http<Documentacion>("/documentacion-bibliografica/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// UPDATE
export async function updateDocumentacion(
  id: number,
  payload: DocumentacionPayload
): Promise<Documentacion> {
  return http<Documentacion>(`/documentacion-bibliografica/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// DELETE
export async function deleteDocumentacion(id: number): Promise<void> {
  return http<void>(`/documentacion-bibliografica/${id}`, {
    method: "DELETE",
  });
}

// -------- RELACIÓN DOCUMENTO - AUTOR --------

export async function addAutorToDocumento(
  docId: number,
  autorId: number
) {
  return http(`/documentacion-bibliografica/${docId}/autores`, {
    method: "POST",
    body: JSON.stringify({ autor_id: autorId }),
  });
}

export async function removeAutorFromDocumento(
  docId: number,
  autorId: number
) {
  return http(
    `/documentacion-bibliografica/${docId}/autores/${autorId}`,
    { method: "DELETE" }
  );
}


export const removeAutorFromDocumentacion = async (
  docId: number,
  autorId: number
) => {
  return http(
    `/documentacion-bibliografica/${docId}/autores/${autorId}`,
    {
      method: "DELETE",
    }
  );
};
