// src/services/optionsService.ts
import { http } from "@/lib/http";

export type Option = {
  id: number;
  nombre: string;
};

export function getTiposPersonal(): Promise<Option[]> {
  return http("/tipo-personal/");
}

export function getCategoriasUtn(): Promise<Option[]> {
  return http("/categoria-utn/");
}

export function getProgramasIncentivos(): Promise<Option[]> {
  return http("/programas-incentivos/");
}

export function getTiposDedicacion(): Promise<Option[]> {
  return http("/tipo-dedicacion/");
}

export function getTiposFormacion(): Promise<Option[]> {
  return http("/tipo-formacion/");
}

export function getFuentesFinanciamiento(): Promise<Option[]> {
    return http("/fuente-financiamiento/");
}
