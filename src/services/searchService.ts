import { http } from "@/lib/http";

export type RecordType = "persona" | "proyecto" | "publicacion" | "compra";

export type SearchParams = {
  q: string;
  types?: RecordType[];      
  dateFrom?: string;         // "YYYY-MM-DD"
  dateTo?: string;           // "YYYY-MM-DD"
  sort?: "date_desc" | "date_asc" | "alpha_asc" | "alpha_desc";
};

export type SearchResult = {
  id: string;
  type: RecordType;
  title: string;
  snippet: string;
  date?: string;            // ISO
  href: string;             // ruta interna para navegar
};

const BASE = import.meta.env.VITE_API_URL ?? "";

/* ---------------- MOCK local (sin backend) ---------------- */
const MOCK: SearchResult[] = [
  { id: "p1", type: "persona", title: "Ana Pérez", snippet: "Investigadora CONICET en materiales", date: "2024-10-01", href: "/personal/p1/editar" },
  { id: "p2", type: "proyecto", title: "Proyecto GIDAS-UCT", snippet: "I+D+i: gestión integral y desarrollo", date: "2025-01-15", href: "/actividades/proyectos/p2" },
  { id: "p3", type: "publicacion", title: "Publicación: Nanomateriales aplicados", snippet: "Artículo en revista indexada", date: "2023-06-05", href: "/actividades/publicaciones/p3" },
  { id: "p4", type: "compra", title: "Compra #4821", snippet: "Microscopio digital – proveedor TecnoLab", date: "2025-03-20", href: "/objetos/compra/p4" },
];

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

function match(item: SearchResult, q: string) {
  if (!q.trim()) return true;
  const n = norm(q);
  return [item.title, item.snippet, item.type].some((v) => norm(String(v)).includes(n));
}

function within(item: SearchResult, from?: string, to?: string) {
  if (!from && !to) return true;
  if (!item.date) return false;
  const d = item.date;
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}

function sortItems(items: SearchResult[], sort?: SearchParams["sort"]) {
  const arr = [...items];
  switch (sort) {
    case "date_asc":
      return arr.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    case "date_desc":
      return arr.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    case "alpha_desc":
      return arr.sort((a, b) => b.title.localeCompare(a.title));
    case "alpha_asc":
    default:
      return arr.sort((a, b) => a.title.localeCompare(b.title));
  }
}

export async function searchAll(params: SearchParams): Promise<SearchResult[]> {
  // MOCK por ahora
  if (!BASE) {
    const { q, types, dateFrom, dateTo, sort } = params;
    const filtered = MOCK
      .filter((r) => (types?.length ? types.includes(r.type) : true))
      .filter((r) => within(r, dateFrom, dateTo))
      .filter((r) => match(r, q));
    return sortItems(filtered, sort);
  }

  // Back real (ejemplo)
  return http<SearchResult[]>("/api/search", {
    method: "POST",
    body: JSON.stringify(params),
  });
}
