import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import Button from "@/components/Button";
import {
  createErogacion,
  getErogacionById,
  updateErogacion,
} from "@/services/erogacionesServices";
import { useUct } from "@/hooks/useUct";
import { useTiposErogacion } from "@/hooks/useTipoErogacion";
import { useFuentesFinanciamiento } from "@/hooks/useFuenteFinanciamiento";

export default function ErogacionesForm() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { uct } = useUct();
  const { id } = useParams<{ id: string }>();

  const isEdit = !!id;

  const { tipos, isLoading: loadingTipos, isError } = useTiposErogacion();
  const { fuentes, isLoading: loadingFuentes } =
    useFuentesFinanciamiento();

  const [data, setData] = useState({
    numeroErogacion: "",
    tipoErogacionId: "",
    fuenteFinanciamientoId: "",
    ingresos: "",
    egresos: "",
  });

  /* =========================
     CARGA DE DATOS (EDICIÓN)
     ========================= */
  const { data: erogacion, isLoading: loadingErogacion } = useQuery({
    queryKey: ["erogaciones", id],
    queryFn: () => getErogacionById(Number(id)),
    enabled: isEdit,
  });

  useEffect(() => {
    if (erogacion) {
      setData({
        numeroErogacion: erogacion.numeroErogacion?.toString() ?? "",
        tipoErogacionId:
          erogacion.tipo_erogacion?.id?.toString() ?? "",
        fuenteFinanciamientoId:
          erogacion.fuente?.id?.toString() ?? "",
        ingresos: erogacion.ingresos?.toString() ?? "",
        egresos: erogacion.egresos?.toString() ?? "",
      });
    }
  }, [erogacion]);

  /* =========================
     MUTACIÓN
     ========================= */
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: any) =>
      isEdit
        ? updateErogacion(Number(id), payload)
        : createErogacion(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["erogaciones"] });
      navigate("/erogaciones");
    },
  });

  /* =========================
     SUBMIT
     ========================= */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uct) return;

    if (!data.tipoErogacionId) {
      alert("Debe seleccionar un tipo de erogación");
      return;
    }

    await mutateAsync({
      numeroErogacion: Number(data.numeroErogacion),
      tipo_erogacion_id: Number(data.tipoErogacionId),
      ingresos: data.ingresos === "" ? 0 : Number(data.ingresos),
      egresos: data.egresos === "" ? 0 : Number(data.egresos),
      fuente_financiamiento_id: data.fuenteFinanciamientoId
        ? Number(data.fuenteFinanciamientoId)
        : undefined,
      grupo_utn_id: uct.id,
    });
  };

  if (isEdit && loadingErogacion) {
    return <p className="text-slate-500">Cargando erogación…</p>;
  }

  return (
    <section className="w-full">
      <h2 className="text-2xl md:text-3xl font-semibold leading-none">
        {isEdit ? "Editar erogación" : "Nueva erogación"}
      </h2>

      <form
        onSubmit={submit}
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 space-y-6"
      >
        {/* Número */}
        <Field label="Número de erogación">
          <input
            className="input"
            type="number"
            value={data.numeroErogacion}
            onChange={(e) =>
              setData({ ...data, numeroErogacion: e.target.value })
            }
            required
          />
        </Field>

        {/* Tipo de erogación */}
        <Field label="Tipo de erogación">
          {loadingTipos ? (
            <p className="text-sm text-slate-500">
              Cargando tipos…
            </p>
          ) : isError ? (
            <p className="text-sm text-red-600">
              Error al cargar tipos
            </p>
          ) : (
            <select
              className={`input ${
                !data.tipoErogacionId
                  ? "text-slate-400"
                  : "text-slate-900"
              }`}
              value={data.tipoErogacionId}
              onChange={(e) =>
                setData({
                  ...data,
                  tipoErogacionId: e.target.value,
                })
              }
            >
              <option value="" disabled>
                Seleccionar tipo de erogación
              </option>
              {tipos.map((t) => (
                <option
                  key={t.id}
                  value={t.id}
                  className="text-slate-900"
                >
                  {t.nombre}
                </option>
              ))}
            </select>
          )}
        </Field>

        {/* Ingresos */}
        <Field label="Ingresos">
          <input
            className="input"
            type="number"
            value={data.ingresos}
            onChange={(e) =>
              setData({ ...data, ingresos: e.target.value })
            }
          />
        </Field>

        {/* Egresos */}
        <Field label="Egresos">
          <input
            className="input"
            type="number"
            value={data.egresos}
            onChange={(e) =>
              setData({ ...data, egresos: e.target.value })
            }
          />
        </Field>

        {/* Fuente de financiamiento */}
        <Field label="Fuente de financiamiento">
          {loadingFuentes ? (
            <p className="text-sm text-slate-500">
              Cargando fuentes…
            </p>
          ) : (
            <select
              className={`input ${
                !data.fuenteFinanciamientoId
                  ? "text-slate-400"
                  : "text-slate-900"
              }`}
              value={data.fuenteFinanciamientoId}
              onChange={(e) =>
                setData({
                  ...data,
                  fuenteFinanciamientoId: e.target.value,
                })
              }
            >
              <option value="" disabled>
                Seleccionar fuente
              </option>
              {fuentes.map((f) => (
                <option
                  key={f.id}
                  value={f.id}
                  className="text-slate-900"
                >
                  {f.nombre}
                </option>
              ))}
            </select>
          )}
        </Field>

        {/* Acciones */}
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
            disabled={isPending}
          >
            {isPending ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </form>
    </section>
  );
}

/* =========================
   FIELD COMPONENT
   ========================= */
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
