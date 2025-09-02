import { http } from "@/lib/http";

// ----------------- Tipos -----------------
export type PersonalType =
  | "INVESTIGADOR"
  | "PROFESIONAL"
  | "PTAA"        // Personal Técnico, Administrativo y de Apoyo
  | "BECARIO";


export type Categoria = "Resolución A" | "Resolución B" | "Resolución D" | "Resolución E" | "Resolución F" | "Resolución G";

export type Dedicacion = "Simple" | "Exclusiva" | "Semiexclusiva";

export type Incentivos = "I" | "II";

export type TipoPersonal = "Técnico" | "Administrativo" | "Apoyo";

export type TipoFormacion = "Becario" | "Personal en Formación";

export type PersonalBase = {
  id: string;                     // generado en el mock si no existe
  nombreApellido: string;
  horasSemanales: number;
  tipo: PersonalType;
};

// Extensiones por tipo (campos opcionales)
export type PersonalInvestigador = PersonalBase & {
  tipo: "INVESTIGADOR";
  categoriaUtn?: Categoria;
  programaIncentivos?: Incentivos;
  dedicacion?: Dedicacion;
  proyectoCoordinaId?: string | null; // puede no coordinar
};

export type PersonalProfesional = PersonalBase & {
  tipo: "PROFESIONAL";
};

export type PersonalPTAA = PersonalBase & {
  tipo: "PTAA";
  tipoPersonal: TipoPersonal;
};

export type PersonalBecario = PersonalBase & {
  tipo: "BECARIO";
  fuenteFinanciamiento: string | null
  tipoFormacion: TipoFormacion
};

export type Personal =
  | PersonalInvestigador
  | PersonalProfesional
  | PersonalPTAA
  | PersonalBecario;

// ----------------- Config API / Mock -----------------
const BASE = import.meta.env.VITE_API_URL ?? "";
const MOCK_KEY = "gidas_personal_lista_mock";

function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms));
}

// ----------------- MOCK (sin backend) -----------------
async function mockList(): Promise<Personal[]> {
  await delay();
  const raw = localStorage.getItem(MOCK_KEY);
  return raw ? (JSON.parse(raw) as Personal[]) : [];
}

async function mockUpsert(payload: Personal): Promise<Personal> {
  await delay();
  const lista = await mockList();
  let updated: Personal[];

  if (!payload.id) {
    payload.id = crypto.randomUUID?.() ?? String(Date.now());
  }
  const exists = lista.some((p) => p.id === payload.id);
  updated = exists
    ? lista.map((p) => (p.id === payload.id ? payload : p))
    : [...lista, payload];

  localStorage.setItem(MOCK_KEY, JSON.stringify(updated));
  return payload;
}

async function mockDelete(id: string): Promise<void> {
  await delay();
  const lista = await mockList();
  const updated = lista.filter((p) => p.id !== id);
  localStorage.setItem(MOCK_KEY, JSON.stringify(updated));
}

// ----------------- API real -----------------
export async function getPersonal() {
  if (!BASE) return mockList();
  return http<Personal[]>("/api/personal");
}

export async function upsertPersonal(payload: Personal) {
  if (!BASE) return mockUpsert(payload);
  return http<Personal>("/api/personal", {
    method: payload.id ? "PUT" : "POST",
    body: JSON.stringify(payload),
  });
}

export async function deletePersonal(id: string) {
  if (!BASE) return mockDelete(id);
  return http<void>(`/api/personal/${id}`, { method: "DELETE" });
}
