import { http } from "@/lib/http";

export interface DocumentacionBase {
  titulo: string;
  autores: string[];
  editorial: string;
  anio: number;
}

export interface Documentacion extends DocumentacionBase {
  id: string;
}

export interface DocumentacionPayload extends DocumentacionBase {}

const BASE = import.meta.env.VITE_API_URL ?? "";
const MOCK_KEY = "gidas_documentacion_mock";

function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms));
}

// -------- MOCK LIST --------
async function mockList(): Promise<Documentacion[]> {
  await delay();
  const raw = localStorage.getItem(MOCK_KEY);
  return raw ? JSON.parse(raw) : [];
}

// -------- MOCK UPSERT --------
async function mockUpsert(payload: Documentacion): Promise<Documentacion> {
  await delay();

  const list = await mockList();

  // ---------------- FIX DEFINITIVO ----------------
  const id =
    payload.id
      ? payload.id
      : (typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now()));

  const updated = { ...payload, id };

  const out = list.some((d) => d.id === id)
    ? list.map((d) => (d.id === id ? updated : d))
    : [...list, updated];

  localStorage.setItem(MOCK_KEY, JSON.stringify(out));
  return updated;
}

// -------- MOCK DELETE --------
async function mockDelete(id: string): Promise<void> {
  await delay();
  const list = await mockList();
  localStorage.setItem(
    MOCK_KEY,
    JSON.stringify(list.filter((d) => d.id !== id))
  );
}

// -------- API REAL --------
export async function getDocumentacion(): Promise<Documentacion[]> {
  if (!BASE) return mockList();
  return http<Documentacion[]>("/api/documentacion");
}

export async function getDocumentacionById(id: string): Promise<Documentacion> {
  if (!BASE) {
    const list = await mockList();
    return list.find((d) => d.id === id)!;
  }
  return http<Documentacion>(`/api/documentacion/${id}`);
}

export async function upsertDocumentacion(payload: Documentacion) {
  if (!BASE) return mockUpsert(payload);

  return http<Documentacion>("/api/documentacion", {
    method: payload.id ? "PUT" : "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteDocumentacion(id: string) {
  if (!BASE) return mockDelete(id);
  return http<void>(`/api/documentacion/${id}`, { method: "DELETE" });
}
