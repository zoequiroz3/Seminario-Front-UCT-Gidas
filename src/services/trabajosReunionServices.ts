// services/trabajosReunionServices.ts
const BASE = import.meta.env.VITE_API_URL ?? "";
const MOCK_KEY = "gidas_trabajos_reunion_mock";

export type TipoParticipacion = "Poster" | "Oral" | "Otro";

export type TrabajoReunion = {
  id: string;
  investigadorId: string;
  titulo: string;
  evento: string;
  fecha: string;        // ISO
  lugar?: string;
  tipo: TipoParticipacion;
};

function delay(ms=250){ return new Promise(r=>setTimeout(r,ms)); }
async function mockList(): Promise<TrabajoReunion[]> {
  await delay(); const raw = localStorage.getItem(MOCK_KEY);
  return raw ? JSON.parse(raw) as TrabajoReunion[] : [];
}
async function mockSave(item: TrabajoReunion){
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

export async function getTrabajos(params?: { investigadorId?: string }) {
  if (!BASE) {
    const all = await mockList();
    return params?.investigadorId ? all.filter(x=>x.investigadorId===params.investigadorId) : all;
  }
  const qs = params?.investigadorId ? `?investigadorId=${encodeURIComponent(params.investigadorId)}` : "";
  const res = await fetch(`/api/trabajos-reunion${qs}`);
  return res.json() as Promise<TrabajoReunion[]>;
}

export async function upsertTrabajo(payload: TrabajoReunion) {
  if (!BASE) return mockSave(payload);
  const res = await fetch(`/api/trabajos-reunion`, {
    method: payload.id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json() as Promise<TrabajoReunion>;
}

export async function deleteTrabajo(id: string) {
  if (!BASE) return mockDelete(id);
  await fetch(`/api/trabajos-reunion/${id}`, { method: "DELETE" });
}
