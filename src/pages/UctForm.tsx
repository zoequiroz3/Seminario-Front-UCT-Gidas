import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/Button";
import Field from "@/components/Field";
import ErrorText from "@/components/ErrorText";
import { useUct } from "@/hooks/useUct";
import type { Uct } from "@/services/uctServices";

type UctPayload = Omit<Uct, "id">;

export default function UctForm() {
  const { uct, save, saving } = useUct();
  const navigate = useNavigate();
  const isEdit = !!uct;

  const [data, setData] = useState<UctPayload>({
    facultadRegional: "",
    nombreSigla: "",
    director: "",
    vicedirector: "",
    correo: "",
    objetivos: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (uct) {
      setData({
        facultadRegional: uct.facultadRegional ?? "",
        nombreSigla: uct.nombreSigla ?? "",
        director: uct.director ?? "",
        vicedirector: uct.vicedirector ?? "",
        correo: uct.correo ?? "",
        objetivos: uct.objetivos ?? "",
      });
    }
  }, [uct]);

  const clearError = (field: string) => {
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  const change =
    (k: keyof UctPayload) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value;
        setData((d) => ({ ...d, [k]: value }));
        if (value.trim()) clearError(k);
      };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!data.facultadRegional.trim())
      newErrors.facultadRegional = "Debe ingresar la facultad regional";

    if (!data.nombreSigla.trim())
      newErrors.nombreSigla = "Debe ingresar nombre y sigla";

    if (!data.director.trim())
      newErrors.director = "Debe ingresar director/a";

    if (!data.vicedirector.trim())
      newErrors.vicedirector = "Debe ingresar vicedirector/a";

    if (!data.correo.trim())
      newErrors.correo = "Debe ingresar correo electrónico";
    else if (!/^\S+@\S+\.\S+$/.test(data.correo))
      newErrors.correo = "Formato de correo inválido";

    if (!data.objetivos.trim())
      newErrors.objetivos = "Debe ingresar objetivos";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await save({
      ...data,
      facultadRegional: data.facultadRegional.trim(),
      nombreSigla: data.nombreSigla.trim(),
      director: data.director.trim(),
      vicedirector: data.vicedirector.trim(),
      correo: data.correo.trim(),
      objetivos: data.objetivos.trim(),
    });

    navigate("/", {
      state: {
        successMessage: isEdit
          ? "UCT actualizada con éxito!"
          : "UCT creada con éxito!",
      },
    });
  };

  const inputClass = (field: string) =>
    `input ${errors[field]
      ? "!border-red-500 !ring-2 !ring-red-500"
      : ""
    }`;

  return (
    <section className="w-full">
      <h2 className="text-3xl font-semibold mb-6">
        Configuración de la UCT
      </h2>

      <form
        onSubmit={onSubmit}
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 space-y-6"
      >
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

        <Field label="Director/a">
          <input
            className={inputClass("director")}
            value={data.director}
            onChange={change("director")}
          />
          {errors.director && (
            <ErrorText>{errors.director}</ErrorText>
          )}
        </Field>

        <Field label="Vicedirector/a">
          <input
            className={inputClass("vicedirector")}
            value={data.vicedirector}
            onChange={change("vicedirector")}
          />
          {errors.vicedirector && (
            <ErrorText>{errors.vicedirector}</ErrorText>
          )}
        </Field>

        <Field label="Correo electrónico">
          <input
            type="email"
            className={inputClass("correo")}
            value={data.correo}
            onChange={change("correo")}
          />
          {errors.correo && (
            <ErrorText>{errors.correo}</ErrorText>
          )}
        </Field>

        <Field label="Objetivos y desarrollo">
          <textarea
            rows={6}
            className={`${inputClass("objetivos")} resize-y`}
            value={data.objetivos}
            onChange={change("objetivos")}
          />
          {errors.objetivos && (
            <ErrorText>{errors.objetivos}</ErrorText>
          )}
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
