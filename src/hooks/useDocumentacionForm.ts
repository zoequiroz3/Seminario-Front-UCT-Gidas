// hooks/useDocumentacionForm.ts
import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  upsertDocumentacion,
  type Documentacion,
  type DocumentacionPayload,
} from "@/services/documentacionServices";

const YEARS = Array.from({ length: 2030 - 1900 + 1 }, (_, i) => 1900 + i);

export function useDocumentacionForm(initial?: Documentacion) {
  const qc = useQueryClient();

  // ------- state -------
  const [data, setData] = useState<{
    titulo: string;
    autores: string[];
    editorial: string;
    anio: number | undefined | "";
  }>({
    titulo: initial?.titulo ?? "",
    autores: initial?.autores ?? [""],
    editorial: initial?.editorial ?? "",
    anio: initial?.anio ?? undefined,   // ✔ FIX
  });

  // ------- setters -------
  const change =
    (key: keyof typeof data) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      let val: any = e.target.value;

      if (key === "anio") {
        val = val === "" ? "" : Number(val);
      }

      setData((d) => ({ ...d, [key]: val }));
    };

  const changeAutor = (index: number, value: string) => {
    setData((d) => {
      const c = [...d.autores];
      c[index] = value;
      return { ...d, autores: c };
    });
  };

  const addAutor = () => {
    setData((d) => ({ ...d, autores: [...d.autores, ""] }));
  };

  const removeAutor = (index: number) => {
    setData((d) => {
      if (d.autores.length === 1) return { ...d, autores: [""] };
      return { ...d, autores: d.autores.filter((_, i) => i !== index) };
    });
  };

  const setAutores = (arr: string[]) => {
    setData((d) => ({ ...d, autores: arr }));
  };

  // ------- validación -------
  const autoresLimpios = useMemo(
    () => data.autores.map((a) => a.trim()).filter((a) => a !== ""),
    [data.autores]
  );

  const isValid =
    data.titulo.trim() !== "" &&
    data.editorial.trim() !== "" &&
    autoresLimpios.length > 0 &&
    data.anio !== "" &&
    data.anio !== undefined;

  // ------- mutation -------
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async () => {
      const payload: DocumentacionPayload = {
        titulo: data.titulo.trim(),
        autores: autoresLimpios,
        editorial: data.editorial.trim(),
        anio: Number(data.anio),
      };

      return upsertDocumentacion(
        initial?.id ? { ...payload, id: initial.id } : (payload as any)
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documentacion"] }),
  });

  const submit = async () => {
    if (!isValid || isPending) return;
    await mutateAsync();
  };

  return {
    data,
    change,
    changeAutor,
    addAutor,
    removeAutor,
    setAutores,   // ✔ necesario para AutoresField
    submit,
    isPending,
    years: YEARS,
  };
}
