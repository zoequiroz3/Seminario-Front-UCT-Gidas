import { http } from "@/lib/http";

export type Uct = {
  facultadRegional: string;
  nombreSigla: string;
  director: string;
  vicedirector: string;
  correo: string;
  objetivos: string;
};

const BASE = import.meta.env.VITE_API_URL ?? "";

// Helper: simula respuesta de red con un delay
function mockGet<U>(value: U, ms = 400) {
  return new Promise<U>((resolve) => setTimeout(() => resolve(value), ms));
}

// Obtener UCT (si no hay backend, simula que no existe)
export async function getUct() {
  if (!BASE) {
    return mockGet<Uct | null>(null, 400); // devuelve null después de 400ms
  }
  return http<Uct | null>("/api/uct");
}

// Crear o actualizar UCT
export async function upsertUct(payload: Uct) {
  if (!BASE) {
    return mockGet<Uct>(payload, 400);
  }
  return http<Uct>("/api/uct", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// Eliminar UCT
export async function deleteUct() {
  if (!BASE) {
    return mockGet<void>(undefined, 400);
  }
  return http<void>("/api/uct", { method: "DELETE" });
}

