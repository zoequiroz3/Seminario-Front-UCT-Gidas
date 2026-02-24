import { http } from "@/lib/http";
import { MOCK_PARTICIPACIONES, MOCK_INVESTIGADORES, type Participacion } from "./mockData";

const STORAGE_KEY = "gidas_participaciones";

const getLocalStorageData = (): Participacion[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) return JSON.parse(data);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_PARTICIPACIONES));
  return MOCK_PARTICIPACIONES;
};

const saveToLocalStorage = (data: Participacion[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const generateLocalId = (): number => {
  const data = getLocalStorageData();
  const maxId = data.reduce((max, item) => Math.max(max, Math.abs(item.id)), 0);
  return -(maxId + 1);
};

export interface ParticipacionPayload {
  nombre_evento: string;
  forma_participacion: string;
  fecha: string;
  investigador_id: number;
}

export const getParticipaciones = async (
  investigadorId?: number,
  orden: "asc" | "desc" = "asc"
): Promise<Participacion[]> => {
  try {
    const params = new URLSearchParams();
    if (investigadorId) params.append("investigador_id", String(investigadorId));
    params.append("orden", orden);
    const query = params.toString() ? `?${params.toString()}` : "";
    return await http<Participacion[]>(`/participaciones-relevantes/${query}`, { method: "GET" });
  } catch (error) {
    console.warn("Error fetching participaciones, using local data:", error);
    let data = getLocalStorageData();
    if (investigadorId) {
      data = data.filter(p => p.investigador_id === investigadorId);
    }
    if (orden === "desc") {
      data = [...data].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    } else {
      data = [...data].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    }
    return data;
  }
};

export const getParticipacionById = async (id: number): Promise<Participacion> => {
  try {
    return await http<Participacion>(`/participaciones-relevantes/${id}`, { method: "GET" });
  } catch (error) {
    console.warn("Error fetching participacion by id, using local data:", error);
    const data = getLocalStorageData();
    const item = data.find(p => p.id === id);
    if (!item) throw new Error("Participación no encontrada");
    return item;
  }
};

export const crearParticipacion = async (payload: ParticipacionPayload): Promise<Participacion> => {
  try {
    return await http<Participacion>("/participaciones-relevantes/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.warn("Error creating participacion, saving locally:", error);
    const data = getLocalStorageData();
    const investigador = MOCK_INVESTIGADORES.find(i => i.id === payload.investigador_id);
    const newItem: Participacion = {
      id: generateLocalId(),
      nombre_evento: payload.nombre_evento,
      forma_participacion: payload.forma_participacion,
      fecha: payload.fecha,
      investigador_id: payload.investigador_id,
      investigador: investigador?.nombre_apellido || "Desconocido",
    };
    data.push(newItem);
    saveToLocalStorage(data);
    return newItem;
  }
};

export const actualizarParticipacion = async (
  id: number,
  payload: Partial<ParticipacionPayload>
): Promise<Participacion> => {
  try {
    return await http<Participacion>(`/participaciones-relevantes/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.warn("Error updating participacion, saving locally:", error);
    const data = getLocalStorageData();
    const index = data.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Participación no encontrada");

    const investigador = payload.investigador_id
      ? (MOCK_INVESTIGADORES.find(i => i.id === payload.investigador_id)?.nombre_apellido || data[index].investigador)
      : data[index].investigador;

    const updated: Participacion = {
      ...data[index],
      ...payload,
      investigador: investigador,
    };
    data[index] = updated;
    saveToLocalStorage(data);
    return updated;
  }
};

export const eliminarParticipacion = async (id: number): Promise<{ message: string }> => {
  try {
    return await http<{ message: string }>(`/participaciones-relevantes/${id}`, { method: "DELETE" });
  } catch (error) {
    console.warn("Error deleting participacion, deleting locally:", error);
    const data = getLocalStorageData();
    const filtered = data.filter(p => p.id !== id);
    saveToLocalStorage(filtered);
    return { message: "Eliminado correctamente (local)" };
  }
};
