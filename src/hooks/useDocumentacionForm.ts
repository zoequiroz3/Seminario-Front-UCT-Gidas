import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createDocumentacion,
  updateDocumentacion,
  addAutorToDocumento,
  removeAutorFromDocumento,
  type Documentacion,
  type DocumentacionPayload,
} from "@/services/documentacionServices";
import {
  createAutor,
  type Autor,
} from "@/services/autoresService";

const YEARS = Array.from({ length: 2030 - 1900 + 1 }, (_, i) => 1900 + i);

export function useDocumentacionForm(initial?: Documentacion) {
  const qc = useQueryClient();

  // --------------------
  // State
  // --------------------
  const [data, setData] = useState<{
    titulo: string;
    editorial: string;
    anio: number | undefined;
  }>({
    titulo: initial?.titulo ?? "",
    editorial: initial?.editorial ?? "",
    anio: initial?.anio ?? undefined,
  });

  const [autores, setAutores] = useState<Autor[]>(
    initial?.autores ?? [{ id: -1, nombre_apellido: "" }]
  );

  // --------------------
  // Validación (CORREGIDA)
  // --------------------
  const isValid = useMemo(
    () =>
      data.titulo.trim() !== "" &&
      data.editorial.trim() !== "" &&
      data.anio !== undefined &&
      autores.length > 0 &&
      autores.every(
        (a) =>
          typeof a.nombre_apellido === "string" &&
          a.nombre_apellido.trim() !== ""
      ),
    [data, autores]
  );

  // --------------------
  // Mutation principal
  // --------------------
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async () => {
      const payload: DocumentacionPayload = {
        titulo: data.titulo.trim(),
        editorial: data.editorial.trim(),
        anio: Number(data.anio),
      };

      // 1️⃣ Crear o actualizar documento
      const doc = initial?.id
        ? await updateDocumentacion(initial.id, payload)
        : await createDocumentacion(payload);

      // 2️⃣ Asegurar que todos los autores existan en backend
      const autoresPersistidos: Autor[] = [];

      for (const autor of autores) {
        if (autor.id > 0) {
          // ya existe
          autoresPersistidos.push(autor);
        } else {
          // autor nuevo → crear
          const creado = await createAutor(
            autor.nombre_apellido.trim()
          );
          autoresPersistidos.push(creado);
        }
      }

      // 3️⃣ Sincronizar relaciones documento ↔ autor
      const prevIds = initial?.autores?.map((a) => a.id) ?? [];
      const nextIds = autoresPersistidos.map((a) => a.id);

      const toAdd = nextIds.filter((id) => !prevIds.includes(id));
      const toRemove = prevIds.filter((id) => !nextIds.includes(id));

      for (const autorId of toAdd) {
        await addAutorToDocumento(doc.id, autorId);
      }

      for (const autorId of toRemove) {
        await removeAutorFromDocumento(doc.id, autorId);
      }

      return doc;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["documentacion"] }),
  });

  const submit = async () => {
    if (!isValid || isPending) return;
    await mutateAsync();
  };

  return {
    data,
    setData,
    autores,
    setAutores,
    submit,
    isPending,
    years: YEARS,
  };
}
