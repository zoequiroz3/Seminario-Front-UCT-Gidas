import { http } from "@/lib/http";

export type User = {
  id: number;
  nombre_usuario: string;
  mail: string;
};

export type AuthResponse = {
  user: User;
  token: string;
  refresh_token?: string;
};

type BackendLoginResponse = {
  access_token: string;
  refresh_token: string;
  user: User;
};

const AUTH_KEY = "gidas_auth_current_session";

// Guardar sesión
function storeAuth(auth: AuthResponse) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

// Leer sesión (usada por el Contexto)
export function getStoredAuth(): AuthResponse | null {
  const raw = localStorage.getItem(AUTH_KEY);
  return raw ? (JSON.parse(raw) as AuthResponse) : null;
}

// LOGIN: Envía nombre_usuario y password
export async function login(usuario: string, password: string): Promise<AuthResponse> {
  const responseBack = await http<BackendLoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ 
      nombre_usuario: usuario, 
      password: password 
    }),
  });

  const auth: AuthResponse = {
    user: responseBack.user,
    token: responseBack.access_token,
    refresh_token: responseBack.refresh_token,
  };

  storeAuth(auth);
  return auth;
}

// REGISTRO: Envía nombre_usuario, mail y password
export async function register(usuario: string, email: string, password: string): Promise<void> {
  await http("/auth/register", {
    method: "POST",
    body: JSON.stringify({ 
      nombre_usuario: usuario, 
      mail: email, 
      password: password 
    }),
  });
}

// LOGOUT: Esta es la función que faltaba
export function logout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = "/login";
}