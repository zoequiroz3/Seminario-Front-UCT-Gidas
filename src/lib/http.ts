const BASE = import.meta.env.VITE_API_URL ?? "";
const AUTH_KEY = "gidas_auth_current_session";

// Función local para leer el token sin depender de otros archivos
function getLocalAuth() {
  const raw = localStorage.getItem(AUTH_KEY);
  return raw ? JSON.parse(raw) : null;
}

function updateStoredToken(newAccessToken: string) {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return;
  const auth = JSON.parse(raw);
  auth.token = newAccessToken;
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
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

let refreshPromise: Promise<string | null> | null = null;

async function tryRefreshToken(): Promise<string | null> {
  // Si ya hay un refresh en curso, esperar ese mismo
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const auth = getLocalAuth();
    if (!auth?.refresh_token) return null;

    try {
      const res = await fetch(`${BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: auth.refresh_token }),
      });

      if (!res.ok) return null;

      const data = await res.json();
      if (data.access_token) {
        updateStoredToken(data.access_token);
        return data.access_token as string;
      }
      return null;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function http<T>(
  path: string,
  init: RequestInit = {},
  _isRetry = false
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

  // Si el token venció (401), intentar refresh antes de deslogear
  if (res.status === 401 && !_isRetry) {
    const newToken = await tryRefreshToken();
    if (newToken) {
      // Reintentar la petición original con el nuevo token
      return http<T>(path, init, true);
    }
    // Si el refresh falló, ahora sí deslogeamos
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