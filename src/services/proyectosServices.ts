// src/services/financiamientoServices.ts
import { http } from "@/lib/http";

// ----------------- Tipos -----------------
/**
 * Formato recomendado para la fecha: "YYYY-MM-DD"
 * (coincide con lo que envía el formulario).
 */
export type Proyecto = {
  id: string;                  // generado en el mock si no existe
  tipoProyecto: string;        // 
  codigoProyecto: string;
  fechaInicio: string;  // YYYY-MM-DD
  fechaFinalizacion: string;
  nombreProyecto: string;
  fuenteFinanciamiento: string;
};

// ----------------- Config API / Mock -----------------
const BASE = import.meta.env.VITE_API_URL ?? "";
const MOCK_KEY = "gidas_proyecto_lista_mock";

function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms));
}

// ----------------- MOCK (sin backend) -----------------
async function mockList(): Promise<Proyecto[]> {
  await delay();
  const raw = localStorage.getItem(MOCK_KEY);
  return raw ? (JSON.parse(raw) as Proyecto[]) : [];
}

async function mockUpsert(payload: Proyecto): Promise<Proyecto> {
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
export async function getProyectos() {
  if (!BASE) return mockList();
  return http<Proyecto[]>("/api/proyectos"); // ajustá la ruta si tu API usa otra
}

export async function upsertProyectos(payload: Proyecto) {
  if (!BASE) return mockUpsert(payload);
  return http<Proyecto>(payload.id ? `/api/proyectos/${payload.id}` : "/api/proyectos", {
    method: payload.id ? "PUT" : "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteProyectos(id: string) {
  if (!BASE) return mockDelete(id);
  return http<void>(`/api/proyectos/${id}`, { method: "DELETE" });
}
