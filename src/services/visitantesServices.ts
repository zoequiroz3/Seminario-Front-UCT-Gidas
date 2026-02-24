import { http } from "@/lib/http";
import { MOCK_VISITANTES, MOCK_GRUPOS_UTN, MOCK_TIPOS_VISITA, type Visitante } from "./mockData";

const STORAGE_KEY = "gidas_visitantes";
const GRUPOS_KEY = "gidas_grupos_utn";
const TIPOS_KEY = "gidas_tipos_visita";

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
  procedencia: string;
  tipo_visita_id: number;
  grupo_utn_id: number;
}

export const getVisitantes = async (): Promise<Visitante[]> => {
  try {
    const data = await http<Visitante[]>("/visitas-academicas/", { method: "GET" });
    return data ?? getLocalStorageData();
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
    return await http<Visitante>("/visitas-academicas/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.warn("Error creating visitante, saving locally:", error);
    const data = getLocalStorageData();
    const tipo = MOCK_TIPOS_VISITA.find(t => t.id === payload.tipo_visita_id);
    const grupo = MOCK_GRUPOS_UTN.find(g => g.id === payload.grupo_utn_id);

    const newItem: Visitante = {
      id: generateLocalId(),
      razon: payload.razon,
      fecha: payload.fecha,
      procedencia: payload.procedencia,
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

    const tipo = payload.tipo_visita_id
      ? MOCK_TIPOS_VISITA.find(t => t.id === payload.tipo_visita_id)
      : undefined;
    const grupo = payload.grupo_utn_id
      ? MOCK_GRUPOS_UTN.find(g => g.id === payload.grupo_utn_id)?.nombre
      : data[index].grupo;

    const updated: Visitante = {
      ...data[index],
      ...payload,
      procedencia: payload.procedencia ?? data[index].procedencia,
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
    const data = await http<any>("/grupo-utn/", { method: "GET" });
    const arrayData = Array.isArray(data) ? data : [data];
    return arrayData.map((g) => ({
      id: g.id,
      nombre: g.nombre_sigla_grupo || g.nombre,
    }));
  } catch (error) {
    console.warn("Error fetching grupos utn, using local data:", error);
    localStorage.setItem(GRUPOS_KEY, JSON.stringify(MOCK_GRUPOS_UTN));
    return MOCK_GRUPOS_UTN;
  }
};

export const getTiposVisita = async () => {
  try {
    const data = await http<typeof MOCK_TIPOS_VISITA>("/tipos-reunion-cientifica/", { method: "GET" });
    return data ?? MOCK_TIPOS_VISITA;
  } catch (error) {
    console.warn("Error fetching tipos visita, using local data:", error);
    localStorage.setItem(TIPOS_KEY, JSON.stringify(MOCK_TIPOS_VISITA));
    return MOCK_TIPOS_VISITA;
  }
};
