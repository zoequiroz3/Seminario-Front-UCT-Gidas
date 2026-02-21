import {http} from "@/lib/http";
import { MOCK_PROYECTOS } from "./mockData";

export interface Proyecto {
  id: number;
  codigo: string;
  nombre: string;
}

export const getProyectos = async (): Promise<Proyecto[]> => {
  try {
    return await http<Proyecto[]>("/proyecto-investigacion", { method: "GET" });
  } catch (error) {
    console.warn("Error fetching proyectos, using local data:", error);
    localStorage.setItem("gidas_proyectos_v3", JSON.stringify(MOCK_PROYECTOS));
    return MOCK_PROYECTOS;
  }
};
