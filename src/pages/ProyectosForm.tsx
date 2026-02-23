import { useState, useEffect } from "react";
import { data, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Button from "@/components/Button";
import Calendar from "@/components/Calendar";
import Field from "@/components/Field";
import PersonalProyectoField from "@/components/PersonalProyectoField";

import {
  upsertProyectos,
  getProyectoById,
  type Proyecto,
  vincularBecarios,
  vincularInvestigadores,
} from "@/services/proyectosServices";

import { useTiposProyecto } from "@/hooks/useTiposProyecto";
import { useFuentesFinanciamiento } from "@/hooks/useFuenteFinanciamiento";
import { useInvestigadores } from "@/hooks/useInvestigadores";
import { useBecarios } from "@/hooks/useBecarios";

export default function ProyectosForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = Boolean(id);

  const tiposQuery = useTiposProyecto();
  const fuentesQuery = useFuentesFinanciamiento();
  const { data: investigadores = [] } = useInvestigadores();
  const { data: becarios = [] } = useBecarios();

  const tipos = tiposQuery.data || [];
  const { fuentes = [] } = fuentesQuery;

  const { data: initialData, isLoading } = useQuery<Proyecto | null>({
    queryKey: ["proyecto", id],
    queryFn: () =>
      id ? getProyectoById(Number(id)) : Promise.resolve(null),
    enabled: isEdit,
  });

  const [nombreProyecto, setNombreProyecto] = useState("");
  const [codigoProyecto, setCodigoProyecto] = useState("");
  const [descripcionProyecto, setDescripcionProyecto] = useState("");
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [fechaFin, setFechaFin] = useState<Date | null>(null);
  const [tipoProyectoId, setTipoProyectoId] = useState<number | null>(null);
  const [fuenteId, setFuenteId] = useState<number | null>(null);

  // 🔵 NUEVO
  const [investigadoresIds, setInvestigadoresIds] = useState<number[]>([]);
  const [becariosIds, setBecariosIds] = useState<number[]>([]);

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  useEffect(() => {
    if (!initialData) return;

    setNombreProyecto(initialData.nombreProyecto ?? "");
    setCodigoProyecto(initialData.codigoProyecto ?? "");
    setDescripcionProyecto(initialData.descripcionProyecto ?? "");

    if (initialData.fechaInicio)
      setFechaInicio(new Date(initialData.fechaInicio));

    if (initialData.fechaFinalizacion)
      setFechaFin(new Date(initialData.fechaFinalizacion));

    setTipoProyectoId(initialData.tipoProyectoId ?? null);
    setFuenteId(initialData.fuenteFinanciamientoId ?? null);

  }, [initialData]);

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      // 1️⃣ Crear / actualizar proyecto
      const proyecto: any = await upsertProyectos(payload);

      const proyectoId =
        proyecto?.id ?? payload.id;


      // 2️⃣ Vincular investigadores
      if (investigadoresIds.length > 0) {
        await vincularInvestigadores(
          proyectoId,
          investigadoresIds
        );
      }

      // 3️⃣ Vincular becarios
      if (becariosIds.length > 0) {
        await vincularBecarios(
          proyectoId,
          becariosIds
        );
      }

      return proyecto;
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["proyectos"] });
      navigate(-1);
    },
  });


  const clearError = (field: string) => {
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!codigoProyecto.trim())
      newErrors.codigoProyecto =
        "Debe ingresar código de proyecto";

    if (!nombreProyecto.trim())
      newErrors.nombreProyecto =
        "Debe ingresar nombre del proyecto";

    if (!tipoProyectoId)
      newErrors.tipoProyectoId =
        "Debe seleccionar tipo de proyecto";

    if (!fechaInicio)
      newErrors.fechaInicio =
        "Debe seleccionar fecha de inicio";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    mutation.mutate({
      id: id ?? undefined,
      nombreProyecto,
      codigoProyecto,
      descripcionProyecto,
      fechaInicio: fechaInicio!.toISOString().split("T")[0],
      fechaFinalizacion: fechaFin
        ? fechaFin.toISOString().split("T")[0]
        : undefined,
      tipoProyectoId: tipoProyectoId!,
      fuenteFinanciamientoId: fuenteId ?? undefined,

      // 🔵 NUEVO
      investigadoresIds,
      becariosIds,
    });
  };

  if (isEdit && isLoading)
    return <p>Cargando proyecto…</p>;

  const inputClass = (field: string) =>
    `input ${errors[field]
      ? "!border-red-500 !ring-2 !ring-red-500"
      : ""
    }`;

  return (
    <section className="w-full">
      <h2 className="text-2xl md:text-3xl font-semibold leading-none">
        {isEdit ? "Editar proyecto" : "Nuevo proyecto"}
      </h2>

      <form
        onSubmit={submit}
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 space-y-6"
      >

        <Field label="Código del proyecto">
          <>
            <input
              className={inputClass("codigoProyecto")}
              value={codigoProyecto}
              onChange={(e) => {
                setCodigoProyecto(e.target.value);
                if (e.target.value.trim())
                  clearError("codigoProyecto");
              }}
            />
            {errors.codigoProyecto && (
              <p className="text-red-500 text-sm mt-1">
                {errors.codigoProyecto}
              </p>
            )}
          </>
        </Field>

        <Field label="Nombre del proyecto">
          <>
            <input
              className={inputClass("nombreProyecto")}
              value={nombreProyecto}
              onChange={(e) => {
                setNombreProyecto(e.target.value);
                if (e.target.value.trim())
                  clearError("nombreProyecto");
              }}
            />
            {errors.nombreProyecto && (
              <p className="text-red-500 text-sm mt-1">
                {errors.nombreProyecto}
              </p>
            )}
          </>
        </Field>


        <Field label="Descripción del proyecto">
          <textarea
            className="input min-h-[100px]"
            value={descripcionProyecto ?? ""}
            onChange={(e) => setDescripcionProyecto(e.target.value)}
            placeholder="Describe detalladamente los objetivos, metodología y alcance del proyecto."
            required
          />
        </Field>

        <Field label="Tipo de proyecto">
          <>
            <select
              className={inputClass("tipoProyectoId")}
              value={tipoProyectoId ?? ""}
              onChange={(e) => {
                const value = e.target.value
                  ? Number(e.target.value)
                  : null;
                setTipoProyectoId(value);
                if (value)
                  clearError("tipoProyectoId");
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
            {errors.tipoProyectoId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.tipoProyectoId}
              </p>
            )}
          </>
        </Field>

        <Field label="Fuente de financiamiento">
          <select
            className="input"
            value={fuenteId ?? ""}
            onChange={(e) =>
              setFuenteId(
                e.target.value
                  ? Number(e.target.value)
                  : null
              )
            }
          >
            <option value="">Sin fuente</option>
            {fuentes.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nombre}
              </option>
            ))}
          </select>
        </Field>

        {/* 🔵 NUEVO BLOQUE */}

        <Field label="Investigadores">
          <PersonalProyectoField
            value={investigadoresIds}
            options={investigadores}
            onChange={setInvestigadoresIds}
          />
        </Field>


        <Field label="Becarios">
          <PersonalProyectoField
            value={becariosIds}
            options={becarios}
            onChange={setBecariosIds}
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Fecha inicio">
            <>
              <Calendar
                value={fechaInicio}
                onChange={(date) => {
                  setFechaInicio(date);
                  if (date)
                    clearError("fechaInicio");
                }}
                className={inputClass("fechaInicio")}
                helperText={
                  errors.fechaInicio ?? "DD/MM/AAAA"
                }
              />
            </>
          </Field>

          <Field label="Fecha fin">
            <Calendar
              value={fechaFin}
              onChange={setFechaFin}
              className="input"
            />
          </Field>
        </div>

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

