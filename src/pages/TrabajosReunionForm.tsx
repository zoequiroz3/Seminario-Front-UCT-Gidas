import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Button from "@/components/Button";
import Calendar from "@/components/Calendar";
import PersonalProyectoField from "@/components/PersonalProyectoField";

import {
  createTrabajoReunion,
  updateTrabajoReunion,
  getTrabajoReunionById,
  vincularInvestigadoresTrabajo,
} from "@/services/trabajosReunionServices";

import { useTiposReunion } from "@/hooks/useTiposReunion";
import { useInvestigadores } from "@/hooks/useInvestigadores";
import { useUct } from "@/hooks/useUct";

export default function TrabajoReunionForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = Boolean(id);

  const { uct } = useUct();
  const { tipos = [] } = useTiposReunion();
  const { data: investigadores = [] } = useInvestigadores();

  const { data: initialData, isLoading } = useQuery({
    queryKey: ["trabajo-reunion", id],
    queryFn: () =>
      id ? getTrabajoReunionById(Number(id)) : Promise.resolve(null),
    enabled: isEdit,
  });

  // ---------------- STATE ----------------

  const [titulo, setTitulo] = useState("");
  const [nombreReunion, setNombreReunion] = useState("");
  const [procedencia, setProcedencia] = useState("");
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [tipoId, setTipoId] = useState<number | null>(null);
  const [investigadoresIds, setInvestigadoresIds] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ---------------- LOAD EDIT ----------------

  useEffect(() => {
    if (!initialData) return;

    setTitulo(initialData.titulo_trabajo ?? "");
    setNombreReunion(initialData.nombre_reunion ?? "");
    setProcedencia(initialData.procedencia ?? "");

    if (initialData.fecha_inicio)
      setFechaInicio(new Date(initialData.fecha_inicio));

    setTipoId(initialData.tipo_reunion?.id ?? null);

    setInvestigadoresIds(
      initialData.investigadores?.map((i: any) => i.id) ?? []
    );
  }, [initialData]);

  // ---------------- MUTATION ----------------

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      // 1️⃣ Crear o actualizar
      const trabajo: any = isEdit
        ? await updateTrabajoReunion(Number(id), payload)
        : await createTrabajoReunion(payload);

      const trabajoId = trabajo?.id ?? payload.id;

      // 2️⃣ Vincular investigadores
      if (investigadoresIds.length > 0) {
        await vincularInvestigadoresTrabajo(
          trabajoId,
          investigadoresIds
        );
      }

      return trabajo;
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trabajos-reunion"] });
      navigate(-1);
    },
  });

  // ---------------- VALIDACIÓN ----------------

  const clearError = (field: string) => {
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!titulo.trim())
      newErrors.titulo = "Debe ingresar título";

    if (!nombreReunion.trim())
      newErrors.nombreReunion = "Debe ingresar nombre de reunión";

    if (!procedencia.trim())
      newErrors.procedencia = "Debe ingresar procedencia";

    if (!tipoId)
      newErrors.tipoId = "Debe seleccionar tipo de reunión";

    if (!fechaInicio)
      newErrors.fechaInicio = "Debe seleccionar fecha";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uct) return;
    if (!validate()) return;

    mutation.mutate({
      id: id ?? undefined,
      titulo_trabajo: titulo,
      nombre_reunion: nombreReunion,
      procedencia,
      fecha_inicio: fechaInicio!.toISOString().split("T")[0],
      tipo_reunion_id: tipoId!,
      grupo_utn_id: uct.id,
    });
  };

  if (isEdit && isLoading)
    return <p>Cargando trabajo…</p>;

  const inputClass = (field: string) =>
    `input ${
      errors[field]
        ? "!border-red-500 !ring-2 !ring-red-500"
        : ""
    }`;

  // ---------------- UI ----------------

  return (
    <section className="w-full">
      <h2 className="text-2xl md:text-3xl font-semibold leading-none">
        {isEdit ? "Editar trabajo" : "Nuevo trabajo"}
      </h2>

      <form
        onSubmit={submit}
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 space-y-6"
      >
        <Field label="Título del trabajo">
          <>
            <input
              className={inputClass("titulo")}
              value={titulo}
              onChange={(e) => {
                setTitulo(e.target.value);
                if (e.target.value.trim())
                  clearError("titulo");
              }}
            />
            {errors.titulo && (
              <p className="text-red-500 text-sm mt-1">
                {errors.titulo}
              </p>
            )}
          </>
        </Field>

        <Field label="Nombre de la reunión">
          <>
            <input
              className={inputClass("nombreReunion")}
              value={nombreReunion}
              onChange={(e) => {
                setNombreReunion(e.target.value);
                if (e.target.value.trim())
                  clearError("nombreReunion");
              }}
            />
            {errors.nombreReunion && (
              <p className="text-red-500 text-sm mt-1">
                {errors.nombreReunion}
              </p>
            )}
          </>
        </Field>

        <Field label="Procedencia">
          <>
            <input
              className={inputClass("procedencia")}
              value={procedencia}
              onChange={(e) => {
                setProcedencia(e.target.value);
                if (e.target.value.trim())
                  clearError("procedencia");
              }}
            />
            {errors.procedencia && (
              <p className="text-red-500 text-sm mt-1">
                {errors.procedencia}
              </p>
            )}
          </>
        </Field>

        <Field label="Tipo de reunión">
          <>
            <select
              className={inputClass("tipoId")}
              value={tipoId ?? ""}
              onChange={(e) => {
                const value = e.target.value
                  ? Number(e.target.value)
                  : null;
                setTipoId(value);
                if (value) clearError("tipoId");
              }}
            >
              <option value="" disabled>
                Seleccionar tipo
              </option>
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
            {errors.tipoId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.tipoId}
              </p>
            )}
          </>
        </Field>

        {/* 🔵 VINCULACIÓN INVESTIGADORES */}
        <Field label="Investigadores">
          <PersonalProyectoField
            value={investigadoresIds}
            options={investigadores}
            onChange={setInvestigadoresIds}
          />
        </Field>

        <Field label="Fecha inicio">
          <>
            <Calendar
              value={fechaInicio}
              onChange={(date) => {
                setFechaInicio(date);
                if (date) clearError("fechaInicio");
              }}
              className={inputClass("fechaInicio")}
              helperText={
                errors.fechaInicio ?? "DD/MM/AAAA"
              }
            />
            {errors.fechaInicio && (
              <p className="text-red-500 text-sm mt-1">
                {errors.fechaInicio}
              </p>
            )}
          </>
        </Field>

        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate(-1)}
          >
            Volver
          </Button>

          <Button
            type="submit"
            size="sm"
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? "Guardando…"
              : isEdit
              ? "Actualizar"
              : "Guardar"}
          </Button>
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}