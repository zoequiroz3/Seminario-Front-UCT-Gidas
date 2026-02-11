
import { http } from "@/lib/http";


export interface PersonalCompleto {
  id: number;
  nombre_apellido: string;
  horas_semanales: number;
    activo: boolean;
    tipo_personal_id: number;
  rol: "personal" | "becario" | "investigador";
  grupo?: {
    id: number;
    nombre: string;
  } | null;
  relaciones?: any;
}

export const getPersonalCompletoByRolAndId = (
  rol: string,
  id: number
) => {
  return http<PersonalCompleto>(`/personal/${rol}/${id}`);
};


export function getPersonalCompletoById(id: number) {
  return http<PersonalCompleto>(`/personal-all/${id}`);
}

