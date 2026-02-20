import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import Button from "@/components/Button";
import DatePicker from "@/components/Calendar";
import { useUct } from "@/hooks/useUct";
import { useTiposRegistroPropiedad } from "@/hooks/useTipoRegistroPropiedad";
import {
  createRegistroPropiedad,
  updateRegistroPropiedad,
  getRegistroPropiedadById,
} from "@/services/registrosPropiedadServices";

export default function RegistrosPropiedadForm() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { uct } = useUct();
  const { tipos } = useTiposRegistroPropiedad();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { data: initial, isLoading } = useQuery({
    queryKey: ["registros-propiedad", id],
    queryFn: () => getRegistroPropiedadById(Number(id)),
    enabled: isEdit,
  });

  const [data, setData] = useState({
    nombre_articulo: "",
    organismo_registrante: "",
    fecha_registro: "",
    tipo_registro_id: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!initial) return;

    setData({
      nombre_articulo: initial.nombre_articulo ?? "",
      organismo_registrante: initial.organismo_registrante ?? "",
      fecha_registro: initial.fecha_registro ?? "",
      tipo_registro_id: initial.tipo_registro_id?.toString() ?? "",
    });
  }, [initial]);

  const clearError = (field: string) => {
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!data.nombre_articulo.trim())
      newErrors.nombre_articulo = "Debe ingresar el nombre del artículo";

    if (!data.organismo_registrante.trim())
      newErrors.organismo_registrante =
        "Debe ingresar el organismo registrante";

    if (!data.fecha_registro)
      newErrors.fecha_registro = "Debe seleccionar una fecha";

    if (!data.tipo_registro_id)
      newErrors.tipo_registro_id =
        "Debe seleccionar un tipo de registro";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: any) =>
      isEdit
        ? updateRegistroPropiedad(Number(id), payload)
        : createRegistroPropiedad(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["registros-propiedad"] });
    },
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uct) return;
    if (!validate()) return;

    await mutateAsync({
      nombre_articulo: data.nombre_articulo.trim(),
      organismo_registrante: data.organismo_registrante.trim(),
      fecha_registro: data.fecha_registro,
      tipo_registro_id: Number(data.tipo_registro_id),
      grupo_utn_id: uct.id,
    });

    navigate("/registros-propiedad", {
      state: {
        successMessage: isEdit
          ? "Registro actualizado con éxito!"
          : "Registro creado con éxito!",
      },
    });
  };

  const inputClass = (field: string) =>
    `input text-sm md:text-base ${
      errors[field]
        ? "!border-red-500 !ring-2 !ring-red-500"
        : ""
    }`;

  if (isEdit && isLoading)
    return <p className="text-slate-500">Cargando…</p>;

  return (
    <section className="w-full">
      <h2 className="text-2xl md:text-3xl font-semibold leading-none">
        {isEdit ? "Editar registro" : "Nuevo registro"}
      </h2>

      <form
        onSubmit={submit}
        className="mt-8 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm space-y-6"
      >
        {/* Nombre del artículo */}
        <Field label="Nombre del artículo">
          <>
            <input
              className={inputClass("nombre_articulo")}
              value={data.nombre_articulo}
              onChange={(e) => {
                setData({
                  ...data,
                  nombre_articulo: e.target.value,
                });
                if (e.target.value.trim())
                  clearError("nombre_articulo");
              }}
            />
            {errors.nombre_articulo && (
              <p className="text-red-500 text-sm mt-1">
                {errors.nombre_articulo}
              </p>
            )}
          </>
        </Field>

        {/* Organismo */}
        <Field label="Organismo registrante">
          <>
            <input
              className={inputClass("organismo_registrante")}
              value={data.organismo_registrante}
              onChange={(e) => {
                setData({
                  ...data,
                  organismo_registrante: e.target.value,
                });
                if (e.target.value.trim())
                  clearError("organismo_registrante");
              }}
            />
            {errors.organismo_registrante && (
              <p className="text-red-500 text-sm mt-1">
                {errors.organismo_registrante}
              </p>
            )}
          </>
        </Field>

        {/* Fecha */}
        <Field label="Fecha de registro">
          <DatePicker
            value={
              data.fecha_registro
                ? new Date(data.fecha_registro)
                : null
            }
            onChange={(dt) => {
              setData({
                ...data,
                fecha_registro: dt
                  ? dt.toISOString().split("T")[0]
                  : "",
              });
              if (dt) clearError("fecha_registro");
            }}
            helperText={errors.fecha_registro ?? "DD/MM/AAAA"}
            className={inputClass("fecha_registro")}
          />
        </Field>

        {/* Tipo */}
        <Field label="Tipo de registro">
          <>
            <select
              className={`${inputClass("tipo_registro_id")} ${
                !data.tipo_registro_id
                  ? "text-slate-400"
                  : "text-slate-900"
              }`}
              value={data.tipo_registro_id}
              onChange={(e) => {
                setData({
                  ...data,
                  tipo_registro_id: e.target.value,
                });
                if (e.target.value)
                  clearError("tipo_registro_id");
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

            {errors.tipo_registro_id && (
              <p className="text-red-500 text-sm mt-1">
                {errors.tipo_registro_id}
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
            disabled={isPending}
          >
            {isPending
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
