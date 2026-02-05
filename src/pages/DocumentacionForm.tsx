import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/Button";
import AutoresField from "@/components/AutoresField";
import { useDocumentacionForm } from "@/hooks/useDocumentacionForm";
import { getDocumentacionById } from "@/services/documentacionServices";

export default function DocumentacionForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: initial, isLoading } = useQuery({
    queryKey: ["documentacion", id],
    queryFn: () => (id ? getDocumentacionById(Number(id)) : null),
    enabled: Boolean(id),
  });

  const {
    data,
    setData,
    autores,
    setAutores,
    submit,
    isPending,
    years,
  } = useDocumentacionForm(initial ?? undefined);

  if (isLoading) return <p>Cargando…</p>;

  return (
    <section className="w-full">
      <h2 className="text-2xl md:text-3xl font-semibold leading-none">
        Documentación
      </h2>

      {/* CARD IGUAL AL DETALLE */}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await submit();
          navigate("/documentacion");
        }}
        className="mt-8 rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-sm space-y-8"
      >
        <Field label="Título">
          <input
            className="input md:text-[18px]"
            value={data.titulo}
            onChange={(e) =>
              setData((d) => ({ ...d, titulo: e.target.value }))
            }
          />
        </Field>

        <AutoresField
          value={autores}
          onChange={setAutores}
          label="Autores"
        />

        <Field label="Editorial">
          <input
            className="input md:text-[18px]"
            value={data.editorial}
            onChange={(e) =>
              setData((d) => ({ ...d, editorial: e.target.value }))
            }
          />
        </Field>

        <Field label="Año">
          <select
            className="input md:text-[18px]"
            value={data.anio ?? ""}
            onChange={(e) =>
              setData((d) => ({
                ...d,
                anio: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          >
            <option value="">Seleccione un año</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </Field>

        {/* ACCIONES – MISMO PESO VISUAL QUE DETALLE */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="px-3 py-1 text-xs"
            onClick={() => navigate(-1)}
          >
            Volver
          </Button>

          <Button
            type="submit"
            size="sm"
            className="px-3 py-1 text-xs"
            disabled={isPending}
          >
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
      <label className="block text-sm font-medium mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}
