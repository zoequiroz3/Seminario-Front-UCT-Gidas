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
export type TipoPersonal = "Técnico" | "Administrativo" | "Apoyo"; // sub-tipo de PTAA
export type TipoFormacion = "Becario" | "Personal en Formación";

export type PersonalBase = {
  id: string;
  nombreApellido: string;
  horasSemanales: number;
  tipo: PersonalType;
};

export type PersonalInvestigador = PersonalBase & {
  tipo: "INVESTIGADOR";
  categoriaUtn?: Categoria;
  programaIncentivos?: Incentivos;
  dedicacion?: Dedicacion;
  proyectoCoordinaId?: string | null;
};

export type PersonalProfesional = PersonalBase & { tipo: "PROFESIONAL" };

export type PersonalPTAA = PersonalBase & {
  tipo: "PTAA";
  tipoPersonal: TipoPersonal;
};

export type PersonalBecario = PersonalBase & {
  tipo: "BECARIO";
  fuenteFinanciamiento: string | null;
  tipoFormacion: TipoFormacion;
};

export type Personal =
  | PersonalInvestigador
  | PersonalProfesional
  | PersonalPTAA
  | PersonalBecario;

// ----------------- Config API / Mock -----------------
const BASE = import.meta.env.VITE_API_URL ?? "";
const MOCK_KEY = "gidas_personal_lista_mock";
const SERVER_FILTER_ENABLED =
  (import.meta as any)?.env?.VITE_SERVER_FILTER_PERSONAL === "true";

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
  if (!payload.id) {
    payload.id = crypto.randomUUID?.() ?? String(Date.now());
  }
  const updated = lista.some((p) => p.id === payload.id)
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

// ----------------- API real (hoy y mañana) -----------------
type GetPersonalParams = { tipo?: PersonalType };

/**
 * Obtiene personal. Si se pasa { tipo }, intenta filtrar en server cuando
 * VITE_SERVER_FILTER_PERSONAL=true. Si no, trae todo y filtra en front.
 */
export async function getPersonal(params?: GetPersonalParams): Promise<Personal[]> {
  const tipo = params?.tipo;

  // MOCK: sin backend -> siempre front-filter
  if (!BASE) {
    const all = await mockList();
    return tipo ? all.filter((p) => p.tipo === tipo) : all;
  }

  // API REAL: si el server soporta filtro y lo activaste por flag, filtra en server
  if (SERVER_FILTER_ENABLED && tipo) {
    const qs = new URLSearchParams({ tipo }).toString();
    return http<Personal[]>(`/api/personal?${qs}`);
    // Si tu http soporta { params }, podrías usar:
    // return http<Personal[]>("/api/personal", { params: { tipo } });
  }

  // Fallback: trae todo (el front decidirá si filtrar)
  return http<Personal[]>("/api/personal");
}

// Helpers convenientes (opcionales)
export const getPersonalAll = () => getPersonal();
export const getPersonalByTipo = (tipo: PersonalType) => getPersonal({ tipo });

// ----------------- Upsert / Delete -----------------
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
