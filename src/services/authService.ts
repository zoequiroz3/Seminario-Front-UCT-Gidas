import { http } from "@/lib/http";

// TIPOS DE DATOS
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

// Respuesta esperada del Backend al hacer login
type BackendLoginResponse = {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    nombre_usuario: string;
    mail: string;
  };
};

const AUTH_KEY = "gidas_auth_current_session";

// Helpers de Persistencia (LocalStorage)

function storeAuth(auth: AuthResponse) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

export function getStoredAuth(): AuthResponse | null {
  const raw = localStorage.getItem(AUTH_KEY);
  return raw ? (JSON.parse(raw) as AuthResponse) : null;
}

export function clearStoredAuth() {
  localStorage.removeItem(AUTH_KEY);
}

//funciones de servicio

export async function login(usuarioInput: string, passwordInput: string): Promise<AuthResponse> {
  // Adaptar variables para comunicación con backend
  const body = { 
    nombre_usuario: usuarioInput, 
    contrasena: passwordInput 
  };

  // Petición POST a /login
  const responseBack = await http<BackendLoginResponse>("/login", {
    method: "POST",
    body: JSON.stringify(body),
  });

  // Adaptar variables recibidas del backend
  const auth: AuthResponse = {
    user: {
      id: responseBack.user.id,
      nombre_usuario: responseBack.user.nombre_usuario,
      mail: responseBack.user.mail,
    },
    token: responseBack.access_token,
    refresh_token: responseBack.refresh_token
  };

  // Guardamos sesión en localstorage
  storeAuth(auth);
  return auth;
}

export async function register(usuario: string, email: string, password: string): Promise<void> {
  // El registro espera: nombre_usuario, mail, contrasena
  const body = {
    nombre_usuario: usuario,
    mail: email,
    contrasena: password
  };

  // Petición POST a /usuario (Crear usuario)
  await http("/usuario", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function logout() {
  clearStoredAuth();
  window.location.href = "/login"; // Redirección forzada al salir
}