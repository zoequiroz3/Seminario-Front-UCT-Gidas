const BASE = import.meta.env.VITE_API_URL ?? "";

export class HttpError extends Error {
  status: number;
  body?: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export async function http<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    ...init,
  });

  // 204 No Content
  if (res.status === 204) return undefined as T;

  // 404 → devolvemos null cuando se espera recurso opcional
  if (res.status === 404) return null as T;

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    // Si la respuesta no es JSON
    if (res.ok) return undefined as T;
    throw new HttpError(res.status, res.statusText);
  }

  if (!res.ok) {
    throw new HttpError(res.status, res.statusText, data);
  }
  return data as T;
}
