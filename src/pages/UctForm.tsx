import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/Button";
import Field from "@/components/Field";
import ErrorText from "@/components/ErrorText";
import { useUct } from "@/hooks/useUct";
import { useCargos } from "@/hooks/useCargos";
import { useCrearYAsignarDirectivo } from "@/hooks/useDirectivos";

export default function UctForm() {
  const { uct, save, saving } = useUct();
  const navigate = useNavigate();
  const isEdit = !!uct;

  const grupoId = uct?.id ?? 1;

  const { data: cargos = [] } = useCargos();
  const crearAsignar = useCrearYAsignarDirectivo(grupoId);

  const [data, setData] = useState({
    facultadRegional: "",
    nombreSigla: "",
    nombre1: "",
    cargo1: "",
    fecha1: "",
    nombre2: "",
    cargo2: "",
    fecha2: "",
    correo: "",
    objetivos: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (uct) {
    const director = uct.directivos?.find(
      (d) => d.cargo === "Director"
    );

    const vicedirector = uct.directivos?.find(
      (d) => d.cargo === "Vicedirector"
    );

      setData((prev) => ({
        ...prev,
        facultadRegional: uct.facultadRegional ?? "",
        nombreSigla: uct.nombreSigla ?? "",
        correo: uct.correo ?? "",
        objetivos: uct.objetivos ?? "",

      nombre1: director?.nombre_apellido ?? "",
      fecha1: director?.fecha_inicio ?? "",
      cargo1: director ? "1" : "",

      nombre2: vicedirector?.nombre_apellido ?? "",
      fecha2: vicedirector?.fecha_inicio ?? "",
      cargo2: vicedirector ? "2" : "",
      }));
    }
  }, [uct]);

  const change =
    (k: string) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const value = e.target.value;
      setData((d) => ({ ...d, [k]: value }));

      if (value.trim()) {
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy[k];
          return copy;
        });
      }
    };

  const validate = () => {
    const e: Record<string, string> = {};

    if (!data.facultadRegional.trim())
      e.facultadRegional = "Debe ingresar facultad regional";

    if (!data.nombreSigla.trim())
      e.nombreSigla = "Debe ingresar nombre y sigla";

    if (!data.nombre1.trim())
      e.nombre1 = "Ingrese nombre";

    if (!data.cargo1)
      e.cargo1 = "Seleccione cargo";

    if (!data.fecha1)
      e.fecha1 = "Ingrese fecha";

    if (!data.nombre2.trim())
      e.nombre2 = "Ingrese nombre";

    if (!data.cargo2)
      e.cargo2 = "Seleccione cargo";

    if (!data.fecha2)
      e.fecha2 = "Ingrese fecha";

    if (data.cargo1 && data.cargo2 && data.cargo1 === data.cargo2)
      e.cargo2 = "No puede repetir el mismo cargo";

    if (!data.correo.trim())
      e.correo = "Debe ingresar correo";

    if (!/^\S+@\S+\.\S+$/.test(data.correo))
      e.correo = "Formato de correo inválido";

    if (!data.objetivos.trim())
      e.objetivos = "Debe ingresar objetivos";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await save({
        facultadRegional: data.facultadRegional.trim(),
        nombreSigla: data.nombreSigla.trim(),
        correo: data.correo.trim(),
        objetivos: data.objetivos.trim(),
        director: "",
        vicedirector: "",
      });

      await crearAsignar.mutateAsync({
        nombre_apellido: data.nombre1.trim(),
        id_cargo: Number(data.cargo1),
        fecha_inicio: data.fecha1,
      });

      await crearAsignar.mutateAsync({
        nombre_apellido: data.nombre2.trim(),
        id_cargo: Number(data.cargo2),
        fecha_inicio: data.fecha2,
      });

      navigate("/", {
        state: {
          successMessage: isEdit
            ? "UCT actualizada correctamente"
            : "UCT creada correctamente",
        },
      });

    } catch (err: any) {
      alert(err.message || "Error al guardar");
    }
  };

  const inputClass = (field: string) =>
    `input ${errors[field] ? "!border-red-500 !ring-2 !ring-red-500" : ""}`;

  const cargosDisponibles1 = cargos.filter(
    (c) => c.id !== Number(data.cargo2)
  );

  const cargosDisponibles2 = cargos.filter(
    (c) => c.id !== Number(data.cargo1)
  );

  return (
    <section className="w-full">
      <h2 className="text-3xl font-semibold mb-6">
        Configuración de la UCT
      </h2>

      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 space-y-8"
      >
        {/* DATOS GENERALES */}
        <Field label="Facultad Regional">
          <input
            className={inputClass("facultadRegional")}
            value={data.facultadRegional}
            onChange={change("facultadRegional")}
          />
          {errors.facultadRegional && (
            <ErrorText>{errors.facultadRegional}</ErrorText>
          )}
        </Field>

        <Field label="Nombre y Sigla del Grupo">
          <input
            className={inputClass("nombreSigla")}
            value={data.nombreSigla}
            onChange={change("nombreSigla")}
          />
          {errors.nombreSigla && (
            <ErrorText>{errors.nombreSigla}</ErrorText>
          )}
        </Field>

        {/* BLOQUE DIRECTIVOS */}
        <div className="border border-slate-200 rounded-xl p-6 bg-slate-50 space-y-6">
          <h3 className="text-lg font-semibold text-slate-700">
            Equipo Directivo
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            {/* DIRECTIVO 1 */}
            <Field label="Nombre completo">
              <input
                className={inputClass("nombre1")}
                value={data.nombre1}
                onChange={change("nombre1")}
              />
              {errors.nombre1 && <ErrorText>{errors.nombre1}</ErrorText>}
            </Field>

            <Field label="Cargo">
              <select
                className={inputClass("cargo1")}
                value={data.cargo1}
                onChange={change("cargo1")}
              >
                <option value="">Seleccione cargo</option>
                {cargosDisponibles1.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              {errors.cargo1 && <ErrorText>{errors.cargo1}</ErrorText>}
            </Field>

            <Field label="Fecha de inicio">
              <input
                type="date"
                className={inputClass("fecha1")}
                value={data.fecha1}
                onChange={change("fecha1")}
              />
              {errors.fecha1 && <ErrorText>{errors.fecha1}</ErrorText>}
            </Field>

            {/* DIRECTIVO 2 */}
            <Field label="Nombre completo">
              <input
                className={inputClass("nombre2")}
                value={data.nombre2}
                onChange={change("nombre2")}
              />
              {errors.nombre2 && <ErrorText>{errors.nombre2}</ErrorText>}
            </Field>

            <Field label="Cargo">
              <select
                className={inputClass("cargo2")}
                value={data.cargo2}
                onChange={change("cargo2")}
              >
                <option value="">Seleccione cargo</option>
                {cargosDisponibles2.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              {errors.cargo2 && <ErrorText>{errors.cargo2}</ErrorText>}
            </Field>

            <Field label="Fecha de inicio">
              <input
                type="date"
                className={inputClass("fecha2")}
                value={data.fecha2}
                onChange={change("fecha2")}
              />
              {errors.fecha2 && <ErrorText>{errors.fecha2}</ErrorText>}
            </Field>
          </div>
        </div>

        <Field label="Correo electrónico">
          <input
            type="email"
            className={inputClass("correo")}
            value={data.correo}
            onChange={change("correo")}
          />
          {errors.correo && <ErrorText>{errors.correo}</ErrorText>}
        </Field>

        <Field label="Objetivos">
          <textarea
            rows={5}
            className={`${inputClass("objetivos")} resize-y`}
            value={data.objetivos}
            onChange={change("objetivos")}
          />
          {errors.objetivos && <ErrorText>{errors.objetivos}</ErrorText>}
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

          <Button type="submit" disabled={saving} size="sm">
            {saving ? "Guardando…" : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </section>
  );
}