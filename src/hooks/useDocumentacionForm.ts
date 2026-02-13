import { useState, useMemo, useEffect } from "react";
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
  // Flags
  // --------------------
  const isEdit = Boolean(initial?.id);

  // --------------------
  // State
  // --------------------
  const [data, setData] = useState<{
    titulo: string;
    editorial: string;
    anio: number | undefined;
  }>({
    titulo: "",
    editorial: "",
    anio: undefined,
  });

  const [autores, setAutores] = useState<Autor[]>([]);

  // --------------------
  // Sync initial → state (FIX CRÍTICO)
  // --------------------
  useEffect(() => {
    if (!initial) return;

    setData({
      titulo: initial.titulo ?? "",
      editorial: initial.editorial ?? "",
      anio: initial.anio ?? undefined,
    });

    setAutores(initial.autores ?? []);
  }, [initial]);

  // --------------------
  // Validación
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
      const doc = isEdit
        ? await updateDocumentacion(initial!.id, payload)
        : await createDocumentacion(payload);

      // 2️⃣ Asegurar autores en backend
      const autoresPersistidos: Autor[] = [];

      for (const autor of autores) {
        if (autor.id > 0) {
          autoresPersistidos.push(autor);
        } else {
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
    onSuccess: (_, __, ___) => {
      qc.invalidateQueries({ queryKey: ["documentacion"] });
      if (isEdit && initial?.id) {
        qc.invalidateQueries({
          queryKey: ["documentacion", initial.id],
        });
      }
    },
  });

  // --------------------
  // Submit
  // --------------------
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
  