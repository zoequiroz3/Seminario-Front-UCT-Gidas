import { http } from "@/lib/http";

export interface ArticuloDivulgacion {
  id: number;
  titulo: string;
  descripcion: string;
  fecha_publicacion: string;
  grupo_utn_id: number;
  grupo_utn?: {
    id: number;
    nombre: string;
  };
}

export interface ArticuloPayload {
  titulo: string;
  descripcion: string;
  fecha_publicacion: string;
  grupo_utn_id: number;
}

// 🔹 GET ALL
export const getArticulosDivulgacion = async (
  grupoId?: number
): Promise<ArticuloDivulgacion[]> => {
  const query = grupoId ? `?grupo_utn_id=${grupoId}` : "";

  return http<ArticuloDivulgacion[]>(
    `/articulos-divulgacion/${query}`,
    { method: "GET" }
  );
};

// 🔹 GET BY ID
export const getArticuloById = async (
  id: number
): Promise<ArticuloDivulgacion> => {
  return http<ArticuloDivulgacion>(
    `/articulos-divulgacion/${id}`,
    { method: "GET" }
  );
};

// 🔹 CREATE
export const createArticulo = async (
  payload: ArticuloPayload
): Promise<ArticuloDivulgacion> => {
  return http<ArticuloDivulgacion>(
    "/articulos-divulgacion/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
};

// 🔹 UPDATE
export const updateArticulo = async (
  id: number,
  payload: Partial<ArticuloPayload>
): Promise<ArticuloDivulgacion> => {
  return http<ArticuloDivulgacion>(
    `/articulos-divulgacion/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
};

// 🔹 DELETE
export const deleteArticulo = async (
  id: number
) => {
  return http(
    `/articulos-divulgacion/${id}`,
    { method: "DELETE" }
  );
};