const BASE = import.meta.env.VITE_API_URL ?? "";
const AUTH_KEY = "gidas_auth_current_session";

// Función local para leer el token sin depender de otros archivos
function getLocalAuth() {
  const raw = localStorage.getItem(AUTH_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = "/login";
}

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
  const url = `${BASE}${path}`;
  
  // 1. Leemos el token aquí mismo
  const auth = getLocalAuth();
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> || {}),
  };

  // 2. Si existe token, lo pegamos en la cabecera
  if (auth?.token) {
    headers["Authorization"] = `Bearer ${auth.token}`;
  }

  const res = await fetch(url, {
    ...init,
    headers,
  });

  if (res.status === 204) return undefined as T;
  if (res.status === 404) return null as T;

  // Si el token venció (401), sacamos al usuario
  if (res.status === 401) {
    if (!window.location.pathname.includes("/login")) {
      logout();
    }
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    if (res.ok) return undefined as T;
  }

  if (!res.ok) {
  console.error("ERROR BACKEND:", data);
  throw new HttpError(res.status, res.statusText, data);
}

  return data as T;
}