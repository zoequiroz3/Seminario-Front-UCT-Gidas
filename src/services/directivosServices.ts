// src/services/directivoServices.ts
import { http } from "@/lib/http";

export type Directivo = {
  id: number;
  nombre_apellido: string;
};

export type DirectivoActual = {
  id_directivo: number;
  nombre_apellido: string;
  cargo: string;
  fecha_inicio: string;
};

// ------------------------------
// Obtener todos los directivos
// ------------------------------
export function getDirectivos() {
  return http<Directivo[]>("/directivos", {
    method: "GET",
  });
}

// ------------------------------
// Crear directivo
// ------------------------------
export function createDirectivo(payload: {
  nombre_apellido: string;
}) {
  return http<Directivo>("/directivos/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ------------------------------
// Asignar directivo a grupo
// ------------------------------
export function asignarDirectivo(payload: {
  id_directivo: number;
  id_grupo_utn: number;
  id_cargo: number;
  fecha_inicio: string;
}) {
  return http<{ message: string }>("/directivos/asignar", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ------------------------------
// Obtener actuales por grupo
// ------------------------------
export function getDirectivosActuales(grupoId: number) {
  return http<DirectivoActual[]>(
    `/directivos/grupo/${grupoId}/actuales`,
    {
      method: "GET",
    }
  );
}

// En tu archivo de servicios de directivos
export async function finalizarDirectivo(id_directivo: number, fecha_fin: string) {
  const response = await fetch("/api/directivos/finalizar", { // Ajusta la URL a tu API
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_directivo, fecha_fin }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al finalizar cargo");
  }

  return response.json();
}