import { http } from "@/lib/http";

/* ───────────────────────────────────────────
   Tipos que devuelve el BACKEND
   GET /search?q=...&orden=...
   ─────────────────────────────────────────── */

export type Orden = "alf_asc" | "alf_desc" | "fecha_asc" | "fecha_desc";

/** Cada resultado que devuelve la API */
export type BackendResult = {
  tipo: string;
  id: number;
  titulo: string;
  subtitulo?: string | null;
  fecha?: string | null;
  url: string;
  extra?: Record<string, unknown>;
  activo?: boolean;
};

/** Wrapper de la respuesta completa */
type SearchResponse = {
  query: string;
  orden: Orden;
  total_resultados: number;
  resultados: BackendResult[];
};

/* ───────────────────────────────────────────
   Tipo normalizado que usa la UI
   ─────────────────────────────────────────── */
export type SearchResult = {
  id: number;
  tipo: string;          // "Persona", "Proyecto de Investigación", etc.
  titulo: string;
  subtitulo: string;
  fecha: string | null;
  href: string;          // ruta de frontend
  extra?: Record<string, unknown>;
};

/* ───────────────────────────────────────────
   Mapeo de URLs backend → frontend
   ─────────────────────────────────────────── */
const URL_MAP: [RegExp, string][] = [
  // Con detalle individual
  [/^\/personal\/(\d+)$/, "/personal/personal/$1"],
  [/^\/actividades-docencia\/(\d+)$/, "/docenciaInvestigador/$1"],
  [/^\/documentacion-bibliografica\/(\d+)$/, "/documentacion/$1"],
  [/^\/participaciones-relevantes\/(\d+)$/, "/participaciones/$1"],
  [/^\/articulos-divulgacion\/(\d+)$/, "/articulos-divulgacion/$1"],
  
  // Sin detalle individual - redirigir a listados
  [/^\/tipos-proyecto\/.+$/, "/proyectos"],
  [/^\/tipos-erogacion\/.+$/, "/erogaciones"],
  [/^\/tipos-registro\/.+$/, "/registros-propiedad"],
  [/^\/tipos-contrato\/.+$/, "/transferencias"],
  [/^\/tipos-personal\/.+$/, "/personal"],
  [/^\/fuentes-financiamiento\/.+$/, "/proyectos"],
  [/^\/autores\/.+$/, "/documentacion"],
  [/^\/directivos\/.+$/, "/personal"],
  
  // Visitas académicas - mapear a la ruta correcta del frontend
  [/^\/visitas-academicas\/(\d+)$/, "/visitantes/$1"],
];

function mapUrl(backendUrl: string): string {
  for (const [re, replacement] of URL_MAP) {
    if (re.test(backendUrl)) {
      return backendUrl.replace(re, replacement);
    }
  }
  // Para el resto (proyectos, becarios, investigadores, equipamiento,
  // erogaciones, registros-propiedad, transferencias, trabajos-reunion,
  // trabajos-revistas) la URL ya coincide con el front.
  return backendUrl;
}

/* ───────────────────────────────────────────
   Función principal
   ─────────────────────────────────────────── */
export async function searchAll(
  q: string,
  orden: Orden = "alf_asc",
): Promise<SearchResult[]> {
  // El backend rechaza queries < 2 caracteres
  if (q.trim().length < 2) return [];

  const qs = new URLSearchParams({ q, orden }).toString();
  const data = await http<SearchResponse>(`/search/?${qs}`);

  if (!data?.resultados) return [];

  return data.resultados.map((r) => ({
    id: r.id,
    tipo: r.tipo,
    titulo: r.titulo,
    subtitulo: r.subtitulo ?? "",
    fecha: r.fecha ? String(r.fecha) : null,
    href: mapUrl(r.url),
    extra: r.extra,
  }));
}
