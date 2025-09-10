// services/docenciaServices.ts
const BASE = import.meta.env.VITE_API_URL ?? "";
const MOCK_KEY = "gidas_docencia_lista_mock";

export type GradoAcademico = "Grado" | "Posgrado" | "Pregrado";
export type RolDocencia = "Titular" | "Adjunto" | "JTP" | "Ayudante";

export type Docencia = {
  id: string;
  investigadorId: string;     // relación a Personal (INVESTIGADOR)
  denominacionCatedra: string;
  institucionDictada: string;
  gradoAcademico: GradoAcademico;
  rolActividad: RolDocencia;
  fechaInicio: string;        // ISO
  fechaFin: string;           // ISO
};

function delay(ms=250){ return new Promise(r=>setTimeout(r,ms)); }
async function mockList(): Promise<Docencia[]> {
  await delay(); const raw = localStorage.getItem(MOCK_KEY);
  return raw ? JSON.parse(raw) as Docencia[] : [];
}
async function mockSave(item: Docencia){ 
  const list = await mockList();
  const id = item.id || (crypto.randomUUID?.() ?? String(Date.now()));
  const upd = { ...item, id };
  const out = list.some(x=>x.id===id) ? list.map(x=>x.id===id?upd:x) : [...list, upd];
  localStorage.setItem(MOCK_KEY, JSON.stringify(out));
  return upd;
}
async function mockDelete(id: string){
  const list = await mockList();
  localStorage.setItem(MOCK_KEY, JSON.stringify(list.filter(x=>x.id!==id)));
}

export async function getDocencia(params?: { investigadorId?: string }) {
  if (!BASE) {
    const all = await mockList();
    return params?.investigadorId ? all.filter(x=>x.investigadorId===params.investigadorId) : all;
  }
  // API real (ajustá paths/params cuando estén)
  const qs = params?.investigadorId ? `?investigadorId=${encodeURIComponent(params.investigadorId)}` : "";
  const res = await fetch(`/api/docencia${qs}`);
  return res.json() as Promise<Docencia[]>;
}

export async function upsertDocencia(payload: Docencia) {
  if (!BASE) return mockSave(payload);
  const res = await fetch(`/api/docencia`, {
    method: payload.id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json() as Promise<Docencia>;
}

export async function deleteDocencia(id: string) {
  if (!BASE) return mockDelete(id);
  await fetch(`/api/docencia/${id}`, { method: "DELETE" });
}
