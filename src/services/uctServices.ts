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
const MOCK_KEY = "gidas_uct_singleton_mock";

// delay artificial para simular red
function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms));
}

// ------- MODO MOCK (sin backend) usando localStorage -------
async function mockGet(): Promise<Uct | null> {
  await delay();
  const raw = localStorage.getItem(MOCK_KEY);
  return raw ? (JSON.parse(raw) as Uct) : null;
}

async function mockPut(payload: Uct): Promise<Uct> {
  await delay();
  localStorage.setItem(MOCK_KEY, JSON.stringify(payload));
  return payload;
}

async function mockDelete(): Promise<void> {
  await delay();
  localStorage.removeItem(MOCK_KEY);
}

// ------- API real (cuando VITE_API_URL esté definido) -------
export async function getUct() {
  if (!BASE) return mockGet();
  return http<Uct | null>("/api/uct");
}

export async function upsertUct(payload: Uct) {
  if (!BASE) return mockPut(payload);
  return http<Uct>("/api/uct", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteUct() {
  if (!BASE) return mockDelete();
  return http<void>("/api/uct", { method: "DELETE" });
}
