import { http } from "@/lib/http";

// Tipos del frontend (lo que la UI espera)
export type RecordType = "persona" | "proyecto" | "publicacion" | "compra" | "section";

export type SearchParams = {
  q: string;
  types?: RecordType[];
  dateFrom?: string;
  dateTo?: string;
  sort?: "date_desc" | "date_asc" | "alpha_asc" | "alpha_desc";
};

export type SearchResult = {
  id?: string;
  type: RecordType;
  title: string;
  snippet: string;
  date?: string;
  href: string;
};

// Tipo del backend (lo que la API devuelve)
type ApiSearchResult = {
  type: RecordType;
  subtype?: string;
  id?: number;
  title: string;
  description: string;
  extra?: Record<string, any>;
  url: string;
};

export async function searchAll(params: SearchParams): Promise<SearchResult[]> {
  const { q } = params;

  // El backend ignora búsquedas de menos de 2 caracteres.
  // Hacemos la validación aquí para evitar una llamada innecesaria.
  if (q.trim().length < 2) {
    return [];
  }

  // Construimos la URL para el endpoint GET /search
  const url = `/search?q=${encodeURIComponent(q)}`;

  // Llamamos a la API
  const results = await http<ApiSearchResult[]>(url);

  if (!results) {
    return [];
  }

  // Mapeamos la respuesta del backend al formato que la UI necesita
  return results.map((res) => ({
    id: res.id?.toString(),
    type: res.type,
    title: res.title,
    snippet: res.description, // Mapeo de description -> snippet
    href: res.url,            // Mapeo de url -> href
    // El campo 'date' no viene en la respuesta global, se deja undefined
  }));
}
