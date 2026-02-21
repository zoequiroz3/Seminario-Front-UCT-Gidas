import {http} from "@/lib/http";

export interface Proyecto {
  id: number;
  codigo: string;
  nombre: string;
}

export const getProyectos = async (): Promise<Proyecto[]> => {
  return http<Proyecto[]>("/proyecto-investigacion", {
    method: "GET",
  });
};
