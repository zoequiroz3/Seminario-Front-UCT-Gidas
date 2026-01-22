import { http } from "@/lib/http";

export type Uct = {
  facultadRegional: string;
  nombreSigla: string;
  director: string;
  vicedirector: string;
  correo: string;
  objetivos: string;
};

const BASE = import.meta.env.VITE_API_URL;

export async function getUct() {
  if (!BASE) return null;
  try {
      const data = await http<any>("/grupo-utn/");
      // Mapeo Back -> Front
      return {
        facultadRegional: data.nombre_unidad_academica,
        nombreSigla: data.nombre_sigla_grupo,
        correo: data.mail,
        objetivos: data.objetivo_desarrollo,
        director: "", // El back no envía director en este endpoint actualmente
        vicedirector: ""
      } as Uct;
  } catch {
      return null;
  }
}

export async function upsertUct(payload: Uct) {
  if (!BASE) return;
  
  const body = {
    nombre_unidad_academica: payload.facultadRegional,
    nombre_sigla_grupo: payload.nombreSigla,
    mail: payload.correo,
    objetivo_desarrollo: payload.objetivos
  };
  
  // El backend usa PUT sobre la raiz para actualizar el grupo único
  return http("/grupo-utn/", { method: "PUT", body: JSON.stringify(body) });
}

export async function deleteUct() {
    // No implementado borrar el grupo principal
    return;
}