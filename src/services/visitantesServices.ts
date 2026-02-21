import {http} from "@/lib/http";
import { MOCK_VISITANTES, MOCK_GRUPOS_UTN, MOCK_TIPOS_VISITA, MOCK_PROCEDENCIAS, type Visitante } from "./mockData";

const STORAGE_KEY = "gidas_visitantes";
const GRUPOS_KEY = "gidas_grupos_utn";
const TIPOS_KEY = "gidas_tipos_visita";
const PROCEDENCIAS_KEY = "gidas_procedencias";

const getLocalStorageData = (): Visitante[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) return JSON.parse(data);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_VISITANTES));
  return MOCK_VISITANTES;
};

const saveToLocalStorage = (data: Visitante[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const generateLocalId = (): number => {
  const data = getLocalStorageData();
  const maxId = data.reduce((max, item) => Math.max(max, Math.abs(item.id)), 0);
  return -(maxId + 1);
};

export interface VisitantePayload {
  razon: string;
  fecha: string;
  procedencia_visita_id: number;
  tipo_visita_id: number;
  grupo_utn_id: number;
}

export const getVisitantes = async (): Promise<Visitante[]> => {
  try {
    return await http<Visitante[]>("/visitas-academicas", { method: "GET" });
  } catch (error) {
    console.warn("Error fetching visitantes, using local data:", error);
    return getLocalStorageData();
  }
};

export const getVisitanteById = async (id: number): Promise<Visitante> => {
  try {
    return await http<Visitante>(`/visitas-academicas/${id}`, { method: "GET" });
  } catch (error) {
    console.warn("Error fetching visitante by id, using local data:", error);
    const data = getLocalStorageData();
    const item = data.find(v => v.id === id);
    if (!item) throw new Error("Visitante no encontrado");
    return item;
  }
};

export const crearVisitante = async (payload: VisitantePayload): Promise<Visitante> => {
  try {
    return await http<Visitante>("/visitas-academicas", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.warn("Error creating visitante, saving locally:", error);
    const data = getLocalStorageData();
    const procedencia = MOCK_PROCEDENCIAS.find(p => p.id === payload.procedencia_visita_id);
    const tipo = MOCK_TIPOS_VISITA.find(t => t.id === payload.tipo_visita_id);
    const grupo = MOCK_GRUPOS_UTN.find(g => g.id === payload.grupo_utn_id);
    
    const newItem: Visitante = {
      id: generateLocalId(),
      razon: payload.razon,
      fecha: payload.fecha,
      procedencia_visita_id: payload.procedencia_visita_id,
      visita_procedencia: procedencia ? { id: procedencia.id, nombre: procedencia.nombre } : undefined,
      tipo_visita_id: payload.tipo_visita_id,
      tipo_visita: tipo ? { id: tipo.id, nombre: tipo.nombre } : undefined,
      grupo_utn_id: payload.grupo_utn_id,
      grupo: grupo?.nombre || "GIDAS",
    };
    data.push(newItem);
    saveToLocalStorage(data);
    return newItem;
  }
};

export const actualizarVisitante = async (
  id: number,
  payload: Partial<VisitantePayload>
): Promise<Visitante> => {
  try {
    return await http<Visitante>(`/visitas-academicas/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.warn("Error updating visitante, saving locally:", error);
    const data = getLocalStorageData();
    const index = data.findIndex(v => v.id === id);
    if (index === -1) throw new Error("Visitante no encontrado");
    
    const procedencia = payload.procedencia_visita_id
      ? MOCK_PROCEDENCIAS.find(p => p.id === payload.procedencia_visita_id)
      : undefined;
    const tipo = payload.tipo_visita_id
      ? MOCK_TIPOS_VISITA.find(t => t.id === payload.tipo_visita_id)
      : undefined;
    const grupo = payload.grupo_utn_id
      ? MOCK_GRUPOS_UTN.find(g => g.id === payload.grupo_utn_id)?.nombre
      : data[index].grupo;
    
    const updated: Visitante = {
      ...data[index],
      ...payload,
      visita_procedencia: procedencia ? { id: procedencia.id, nombre: procedencia.nombre } : data[index].visita_procedencia,
      tipo_visita: tipo ? { id: tipo.id, nombre: tipo.nombre } : data[index].tipo_visita,
      grupo: grupo,
    };
    data[index] = updated;
    saveToLocalStorage(data);
    return updated;
  }
};

export const eliminarVisitante = async (id: number): Promise<{ message: string }> => {
  try {
    return await http<{ message: string }>(`/visitas-academicas/${id}`, { method: "DELETE" });
  } catch (error) {
    console.warn("Error deleting visitante, deleting locally:", error);
    const data = getLocalStorageData();
    const filtered = data.filter(v => v.id !== id);
    saveToLocalStorage(filtered);
    return { message: "Eliminado correctamente (local)" };
  }
};

export const getGruposUtn = async () => {
  try {
    return await http<typeof MOCK_GRUPOS_UTN>("/grupos-utn", { method: "GET" });
  } catch (error) {
    console.warn("Error fetching grupos utn, using local data:", error);
    localStorage.setItem(GRUPOS_KEY, JSON.stringify(MOCK_GRUPOS_UTN));
    return MOCK_GRUPOS_UTN;
  }
};

export const getTiposVisita = async () => {
  try {
    return await http<typeof MOCK_TIPOS_VISITA>("/tipos-visita", { method: "GET" });
  } catch (error) {
    console.warn("Error fetching tipos visita, using local data:", error);
    localStorage.setItem(TIPOS_KEY, JSON.stringify(MOCK_TIPOS_VISITA));
    return MOCK_TIPOS_VISITA;
  }
};

export const getProcedencias = async () => {
  try {
    return await http<typeof MOCK_PROCEDENCIAS>("/procedencias", { method: "GET" });
  } catch (error) {
    console.warn("Error fetching procedencias, using local data:", error);
    localStorage.setItem(PROCEDENCIAS_KEY, JSON.stringify(MOCK_PROCEDENCIAS));
    return MOCK_PROCEDENCIAS;
  }
};
