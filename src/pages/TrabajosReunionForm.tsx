import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Button from "@/components/Button";
import Calendar from "@/components/Calendar";
import PersonalProyectoField from "@/components/PersonalProyectoField";
import Field from "@/components/Field";
import ConfirmDialog from "@/components/ConfirmDialog";
import SuccessToast from "@/components/SuccessToast";

import {
  createTrabajoReunion,
  updateTrabajoReunion,
  getTrabajoReunionById,
  vincularInvestigadoresTrabajo,
  desvincularInvestigadoresTrabajo,
} from "@/services/trabajosReunionServices";

import { useTiposReunion } from "@/hooks/useTiposReunion";
import { useInvestigadores } from "@/hooks/useInvestigadores";
import { useUctGuard } from "@/hooks/useUctGuard";

export default function TrabajoReunionForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = Boolean(id);

  const { uct, uctGuard } = useUctGuard();
  const { tipos = [] } = useTiposReunion();
  const { data: investigadores = [] } = useInvestigadores();

  const { data: initialData, isLoading } = useQuery({
    queryKey: ["trabajo-reunion", id],
    queryFn: () =>
      id ? getTrabajoReunionById(Number(id)) : Promise.resolve(null),
    enabled: isEdit,
  });

  const [titulo, setTitulo] = useState("");
  const [nombreReunion, setNombreReunion] = useState("");
  const [procedencia, setProcedencia] = useState("");
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [tipoId, setTipoId] = useState<number | null>(null);
  const [investigadoresIds, setInvestigadoresIds] = useState<number[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [investigadorAEliminar, setInvestigadorAEliminar] =
    useState<{ id: number; nombre: string } | null>(null);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const trabajo: any = isEdit
        ? await updateTrabajoReunion(Number(id), payload)
        : await createTrabajoReunion(payload);

      const trabajoId = trabajo?.id ?? payload.id;

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

      if (isEdit) {
        navigate(`/trabajos-reunion/${id}`, {
          state: {
            successMessage:
              "Trabajo actualizado con éxito!",
          },
        });
      } else {
        navigate("/trabajos-reunion", {
          state: {
            successMessage:
              "Trabajo creado con éxito!",
          },
        });
      }
    },
  });

  const desvincularMutation = useMutation({
    mutationFn: async (investigadorId: number) => {
      return desvincularInvestigadoresTrabajo(
        Number(id),
        [investigadorId]
      );
    },
    onSuccess: (_, investigadorId) => {
      setInvestigadoresIds((prev) =>
        prev.filter((i) => i !== investigadorId)
      );

      setInvestigadorAEliminar(null);
      setSuccessMessage(
        "Investigador desvinculado con éxito!"
      );
      setShowSuccess(true);
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!titulo.trim())
      newErrors.titulo = "Debe ingresar título";

    if (!nombreReunion.trim())
      newErrors.nombreReunion =
        "Debe ingresar nombre de reunión";

    if (!procedencia.trim())
      newErrors.procedencia =
        "Debe ingresar procedencia";

    if (!tipoId)
      newErrors.tipoId =
        "Debe seleccionar tipo de reunión";

    if (!fechaInicio)
      newErrors.fechaInicio =
        "Debe seleccionar fecha";

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
      fecha_inicio: fechaInicio!
        .toISOString()
        .split("T")[0],
      tipo_reunion_id: tipoId!,
      grupo_utn_id: uct.id,
    });
  };

  if (isEdit && isLoading)
    return <p>Cargando trabajo…</p>;

  return (
    <section className="w-full">
      <h2 className="text-2xl md:text-3xl font-semibold leading-none">
        {isEdit ? "Editar trabajo" : "Nuevo trabajo"}
      </h2>

      <form
        onSubmit={submit}
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 space-y-6"
      >
        {/* TÍTULO */}
        <Field label="Título del trabajo">
          <input
            className="input"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </Field>

        {/* NOMBRE REUNIÓN */}
        <Field label="Nombre de la reunión">
          <input
            className="input"
            value={nombreReunion}
            onChange={(e) =>
              setNombreReunion(e.target.value)
            }
          />
        </Field>

        {/* PROCEDENCIA */}
        <Field label="Procedencia">
          <input
            className="input"
            value={procedencia}
            onChange={(e) =>
              setProcedencia(e.target.value)
            }
          />
        </Field>

        {/* TIPO */}
        <Field label="Tipo de reunión">
          <select
            className="input"
            value={tipoId ?? ""}
            onChange={(e) =>
              setTipoId(
                e.target.value
                  ? Number(e.target.value)
                  : null
              )
            }
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
        </Field>

        {/* INVESTIGADORES */}
        <Field label="Investigadores">
          <PersonalProyectoField
            value={investigadoresIds}
            options={investigadores}
            onChange={setInvestigadoresIds}
            isEdit={isEdit}
            onRemoveConfirm={(personaId) => {
              const inv = investigadores.find(
                (i) => i.id === personaId
              );

              if (inv) {
                setInvestigadorAEliminar({
                  id: inv.id,
                  nombre: inv.nombre_apellido,
                });
              }
            }}
          />
        </Field>

        {/* FECHA */}
        <Field label="Fecha de inicio">
          <Calendar
            value={fechaInicio}
            onChange={setFechaInicio}
          />
        </Field>

        {/* BOTONES */}
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

      {/* POPUP DESVINCULAR */}
      <ConfirmDialog
        open={!!investigadorAEliminar}
        title="Desvincular investigador"
        message={`¿Desea desvincular a ${investigadorAEliminar?.nombre}?`}
        items={[]}
        onCancel={() =>
          setInvestigadorAEliminar(null)
        }
        onConfirm={() =>
          desvincularMutation.mutate(
            investigadorAEliminar!.id
          )
        }
      />

      {/* TOAST */}
      <SuccessToast
        open={showSuccess}
        message={successMessage}
        onClose={() => setShowSuccess(false)}
      />
      {uctGuard}
    </section>
  );
}