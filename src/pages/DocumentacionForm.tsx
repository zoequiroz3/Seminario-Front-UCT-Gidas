// pages/DocumentacionForm.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/Button";
import AutoresField from "@/components/AutoresField";
import { useDocumentacionForm } from "@/hooks/useDocumentacionForm";
import { getDocumentacionById } from "@/services/documentacionServices";

export default function DocumentacionForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: initial, isLoading } = useQuery({
    queryKey: ["documentacion", id],
    queryFn: () => (id ? getDocumentacionById(id) : null),
    enabled: Boolean(id),
  });

  const {
    data,
    change,
    changeAutor,
    addAutor,
    removeAutor,
    setAutores,
    submit,
    isPending,
    years,
  } = useDocumentacionForm(initial ?? undefined);

  if (isLoading) return <p>Cargando…</p>;

  return (
    <section className="w-full">
      <h2 className="text-[38px] md:text-[45px] font-semibold leading-none">
        {id ? "Editar Documento" : "Nuevo Documento"}
      </h2>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await submit();
          navigate("/documentacion");
        }}
        className="mt-8 rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-sm space-y-8"
      >
        {/* Título */}
        <Field label="Título del libro / documento">
          <input
            className="input"
            value={data.titulo ?? ""}
            onChange={change("titulo")}
            placeholder="Ej: Introducción a la Ingeniería"
          />
        </Field>

        {/* Autores */}
        <AutoresField
          value={data.autores ?? [""]}
          onChange={(arr) => setAutores(arr)}
          label="Autores"
        />

        {/* Editorial */}
        <Field label="Editorial">
          <input
            className="input"
            value={data.editorial ?? ""}
            onChange={change("editorial")}
            placeholder="Ej: UTN"
          />
        </Field>

        {/* Año */}
        <Field label="Año de publicación">
          <select
            className="input"
            value={data.anio ?? ""}
            onChange={change("anio")}
          >
            <option value="">Seleccione un año</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </Field>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-between">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Volver
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Guardando…" : "Guardar"}
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
      <label className="md:text-[17px] block text-sm font-medium mb-4">
        {label}
      </label>
      {children}
    </div>
  );
}
