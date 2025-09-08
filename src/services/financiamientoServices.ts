// src/services/financiamientoServices.ts
import { http } from "@/lib/http";

// ----------------- Tipos -----------------
/**
 * Formato recomendado para la fecha: "YYYY-MM-DD"
 * (coincide con lo que envía el formulario).
 */
export type Financiamiento = {
  id: string;                  // generado en el mock si no existe
  denominacion: string;        // nombre del bien o servicio
  cantidadAdquirida: number;   // entero
  montoInvertido: number;      // puede ser decimal
  fechaIncorporacion: string;  // YYYY-MM-DD
  descripcionBreve: string;
  fuenteFinanciamiento: string;
  destinatario: string;
};

// ----------------- Config API / Mock -----------------
const BASE = import.meta.env.VITE_API_URL ?? "";
const MOCK_KEY = "gidas_financiamiento_lista_mock";

function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms));
}

// ----------------- MOCK (sin backend) -----------------
async function mockList(): Promise<Financiamiento[]> {
  await delay();
  const raw = localStorage.getItem(MOCK_KEY);
  return raw ? (JSON.parse(raw) as Financiamiento[]) : [];
}

async function mockUpsert(payload: Financiamiento): Promise<Financiamiento> {
  await delay();
  const lista = await mockList();

  // generar id si no viene
  if (!payload.id) {
    payload.id = crypto.randomUUID?.() ?? String(Date.now());
  }

  const exists = lista.some((i) => i.id === payload.id);
  const updated = exists
    ? lista.map((i) => (i.id === payload.id ? payload : i))
    : [...lista, payload];

  localStorage.setItem(MOCK_KEY, JSON.stringify(updated));
  return payload;
}

async function mockDelete(id: string): Promise<void> {
  await delay();
  const lista = await mockList();
  const updated = lista.filter((i) => i.id !== id);
  localStorage.setItem(MOCK_KEY, JSON.stringify(updated));
}

// ----------------- API real -----------------
export async function getFinanciamientos() {
  if (!BASE) return mockList();
  return http<Financiamiento[]>("/api/financiamientos"); // ajustá la ruta si tu API usa otra
}

export async function upsertFinanciamiento(payload: Financiamiento) {
  if (!BASE) return mockUpsert(payload);
  return http<Financiamiento>(payload.id ? `/api/financiamientos/${payload.id}` : "/api/financiamientos", {
    method: payload.id ? "PUT" : "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteFinanciamiento(id: string) {
  if (!BASE) return mockDelete(id);
  return http<void>(`/api/financiamientos/${id}`, { method: "DELETE" });
}
