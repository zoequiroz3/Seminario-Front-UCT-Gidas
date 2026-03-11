import { http } from "@/lib/http";

export type Uct = {
  id: number;
  facultadRegional: string;
  nombreSigla: string;
  director: string;
  vicedirector: string;
  correo: string;
  objetivos: string;

  directivos?: {
    id: number;
    nombre_apellido: string;
    cargo: string;
    fecha_inicio: string;
  }[];
};

const BASE = import.meta.env.VITE_API_URL;

export async function getUct() {
  if (!BASE) return null;

  try {
    const data = await http<any>("/grupo-utn/");

    if (!data) return null;

    return {
      id: data.id,
      facultadRegional: data.nombre_unidad_academica,
      nombreSigla: data.nombre_sigla_grupo,
      correo: data.mail,
      objetivos: data.objetivo_desarrollo,
      director: data.director,
      vicedirector: data.vicedirector,

      
      directivos: data.directivos ?? [],
    };

  } catch {
    return null;
  }
}


export async function upsertUct(payload: Uct, exists: boolean) {
  if (!BASE) return;

  const body = {
    nombre_unidad_academica: payload.facultadRegional,
    nombre_sigla_grupo: payload.nombreSigla,
    mail: payload.correo,
    objetivo_desarrollo: payload.objetivos,
    director: payload.director,
    vicedirector: payload.vicedirector
  };

  const method = exists ? "PUT" : "POST";

  return http("/grupo-utn/", { method, body: JSON.stringify(body) });
}

// DELETE UCT (grupo único)
export async function deleteUct() {
  return http<void>("/grupo-utn/", {
    method: "DELETE",
  });
}