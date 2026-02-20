import {http} from "@/lib/http";

export interface ActividadDocencia {
  rol_actividad_id: null;
  grado_academico_id: null;
  id: number;
  curso: string;
  institucion: string;
  fecha_inicio: string;
  fecha_fin: string;
  grado_academico: string;
  rol_actividad: string;
  investigador_id: number;
  investigador?: string;
}

export interface ActividadDocenciaPayload {
  curso: string;
  institucion: string;
  fecha_inicio: string;
  fecha_fin: string;
  grado_academico: string;
  rol_actividad: string;
  investigador_id: number;
}

//
// 🔹 GET ALL (con filtro opcional por investigador)
//
export const getActividadesDocencia = async (
  investigadorId?: number
): Promise<ActividadDocencia[]> => {

  const query = investigadorId
    ? `?investigador_id=${investigadorId}`
    : "";

  return http<ActividadDocencia[]>(
    `/actividades-docencia/${query}`,
    {
      method: "GET",
    }
  );
};

//
// 🔹 GET BY ID
//
export const getActividadDocenciaById = async (
  id: number
): Promise<ActividadDocencia> => {

  return http<ActividadDocencia>(
    `/actividades-docencia/${id}`,
    {
      method: "GET",
    }
  );
};

//
// 🔹 CREATE
//
export const crearActividadDocencia = async (
  payload: ActividadDocenciaPayload
): Promise<ActividadDocencia> => {

  return http<ActividadDocencia>(
    `/actividades-docencia/`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
};

//
// 🔹 UPDATE
//
export const actualizarActividadDocencia = async (
  id: number,
  payload: Partial<ActividadDocenciaPayload>
): Promise<ActividadDocencia> => {

  return http<ActividadDocencia>(
    `/actividades-docencia/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
};

//
// 🔹 DELETE
//
export const eliminarActividadDocencia = async (
  id: number
): Promise<{ message: string }> => {

  return http<{ message: string }>(
    `/actividades-docencia/${id}`,
    {
      method: "DELETE",
    }
  );
};
