import { http } from "@/lib/http";

export type Rol = "ADMIN" | "GESTOR";

export type User = {
  id: number;
  nombre_usuario: string;
  mail: string;
  rol: Rol;
  primer_login: boolean;
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

// Verificar si es el primer usuario (sistema vacío)
export async function esPrimerUsuario(): Promise<boolean> {
  try {
    const response = await http<{ existe: boolean }>("/auth/primer-usuario", {
      method: "GET",
    });
    return !response.existe;
  } catch {
    // Si el endpoint no existe, asumimos que no es el primer usuario (más seguro)
    return false;
  }
}

// Cambiar contraseña
export async function cambiarPassword(
  passwordActual: string, 
  passwordNueva: string
): Promise<void> {
  await http("/auth/cambiar-password", {
    method: "POST",
    body: JSON.stringify({
      password_actual: passwordActual,
      password_nueva: passwordNueva,
      password_confirmacion: passwordNueva,
    }),
  });
}

// LOGOUT
export function logout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = "/login";
}
