import { http } from "@/lib/http";

export type User = {
  id: string;
  nombre: string;
  email: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};

const BASE = import.meta.env.VITE_API_URL ?? "";

// claves para modo mock
const USERS_KEY = "gidas_auth_users_mock";
const AUTH_KEY = "gidas_auth_current_mock";

/* ---------- helpers mock ---------- */

function loadUsers(): User[] & { password?: string }[] {
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveUsers(users: any[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

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

/* ---------- login / register ---------- */

export async function login(email: string, password: string): Promise<AuthResponse> {
  if (!BASE) {
    // MODO MOCK
    const users = loadUsers();
    const user = users.find((u: any) => u.email === email && u.password === password);
    if (!user) {
      throw new Error("Credenciales inválidas");
    }
    const auth: AuthResponse = {
      user: { id: user.id, nombre: user.nombre, email: user.email },
      token: "mock-token-" + user.id,
    };
    storeAuth(auth);
    return auth;
  }

  // MODO BACKEND REAL
  return http<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(nombre: string, email: string, password: string): Promise<AuthResponse> {
  if (!BASE) {
    // MODO MOCK: guardamos en localStorage
    const users = loadUsers();
    if (users.some((u: any) => u.email === email)) {
      throw new Error("Ya existe un usuario con ese email");
    }
    const newUser: any = {
      id: crypto.randomUUID(),
      nombre,
      email,
      password, // solo para mock
    };
    users.push(newUser);
    saveUsers(users);

    const auth: AuthResponse = {
      user: { id: newUser.id, nombre: newUser.nombre, email: newUser.email },
      token: "mock-token-" + newUser.id,
    };
    storeAuth(auth);
    return auth;
  }

  // MODO BACKEND REAL
  return http<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ nombre, email, password }),
  });
}

export function logout() {
  if (!BASE) {
    clearStoredAuth();
    return;
  }
  clearStoredAuth(); 
}
