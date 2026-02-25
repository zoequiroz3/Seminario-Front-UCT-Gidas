import { http } from "@/lib/http";
import type { Rol } from "./authService";

export type Usuario = {
  id: number;
  nombre_usuario: string;
  mail: string;
  rol: Rol;
  activo: boolean;
  primer_login: boolean;
  fecha_creacion?: string;
};

export type CrearUsuarioPayload = {
  nombre_usuario: string;
  mail: string;
  password: string;
  rol: Rol;
};

export type ActualizarUsuarioPayload = {
  mail?: string;
  rol?: Rol;
  activo?: boolean;
};

// Listar todos los usuarios (solo ADMIN)
export async function getUsuarios(): Promise<Usuario[]> {
  return http<Usuario[]>("/usuarios", {
    method: "GET",
  });
}

// Obtener un usuario por ID (solo ADMIN)
export async function getUsuario(id: number): Promise<Usuario> {
  return http<Usuario>(`/usuarios/${id}`, {
    method: "GET",
  });
}

// Crear nuevo usuario (solo ADMIN)
export async function crearUsuario(payload: CrearUsuarioPayload): Promise<Usuario> {
  return http<Usuario>("/usuarios", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Actualizar usuario (solo ADMIN)
export async function actualizarUsuario(
  id: number, 
  payload: ActualizarUsuarioPayload
): Promise<Usuario> {
  return http<Usuario>(`/usuarios/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// Eliminar usuario (solo ADMIN)
export async function eliminarUsuario(id: number): Promise<void> {
  await http(`/usuarios/${id}`, {
    method: "DELETE",
  });
}
