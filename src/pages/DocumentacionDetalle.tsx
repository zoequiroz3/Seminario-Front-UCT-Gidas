// pages/DocumentacionDetalle.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/Button";
import { getDocumentacionById } from "@/services/documentacionServices";

export default function DocumentacionDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["documentacion", id],
    queryFn: () => getDocumentacionById(id!),
    enabled: !!id,
  });

  if (isLoading) return <p>Cargando…</p>;
  if (!data) return <p>No se encontró el documento.</p>;

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-[38px] md:text-[45px] font-semibold leading-none">
        Documentación
      </h2>

      <article className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">

        {/* Título principal */}
        <h3 className="md:text-[25px] text-lg font-semibold mb-2">{data.titulo}</h3>

        <dl className="text-sm space-y-2">

          {/* Autores */}
          <Field label="Autores">
            <div className="flex flex-col">
              {data.autores?.length ? (
                data.autores.map((a, i) => (
                  <span key={i} className="md:text-[18px] text-slate-500 mt-2">
                    {a}
                  </span>
                ))
              ) : (
                <span className="md:text-[18px] text-slate-500 mt-2">—</span>
              )}
            </div>
          </Field>

          {/* Editorial */}
          <Field label="Editorial" value={data.editorial} />

          {/* Año */}
          <Field label="Año" value={String(data.anio ?? "—")} />

        </dl>

        <div className="mt-8 flex items-center justify-between font-medium">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Volver
          </Button>

          <Button onClick={() => navigate(`/documentacion/${id}/editar`)}>
            Editar
          </Button>
        </div>
      </article>
    </section>
  );
}

/* 🔥 COMPONENTE FIELD EXACTO AL DE PERSONALDETALLE */
function Field({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <dt className="md:text-[20px] font-medium mt-7">{label}</dt>
      <dd className="md:text-[18px] text-slate-500 mt-2">
        {children ?? value ?? "—"}
      </dd>
    </div>
  );
}
