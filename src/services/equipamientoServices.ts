import { http } from "@/lib/http";

export type Equipamiento = {
  id: number;
  denominacion: string;
  descripcion_breve: string;
  fecha_incorporacion: string; // YYYY-MM-DD
  monto_invertido: number;
  grupo_utn_id: number;
};

export async function getEquipamiento() {
  return http<Equipamiento[]>("/equipamiento/");
}

export async function getEquipamientoById(id: number) {
  return http<Equipamiento>(`/equipamiento/${id}`);
}

export async function createEquipamiento(payload: {
  denominacion: string;
  descripcion_breve: string;
  fecha_incorporacion: string;
  monto_invertido: number;
}) {
  return http("/equipamiento/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}



export async function updateEquipamiento(
  id: number,
  payload: Partial<Omit<Equipamiento, "id">>
) {
  return http<Equipamiento>(`/equipamiento/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteEquipamiento(id: number) {
  return http<void>(`/equipamiento/${id}`, {
    method: "DELETE",
  });
}

function toApiPayload(form: any) {
  return {
    denominacion: form.denominacion,
    descripcion_breve: form.descripcionBreve,
    fecha_incorporacion: form.fechaIncorporacion,
    monto_invertido: form.montoInvertido,
    grupo_utn_id: form.grupoUtnId,
  };
}
