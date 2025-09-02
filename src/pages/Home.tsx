import { Link } from "react-router-dom";
import { useUct } from "@/hooks/useUct";

export default function Home() {
  const { uct, isLoading, isError } = useUct();

  if (isLoading) return <p>Cargando…</p>;
  if (isError)   return <p>Error al cargar la UCT.</p>;

  if (!uct) {
    return (
      <section className="relative min-h-[60vh]">
        <div className="flex justify-center pt-10">
          <Link
            to="/uct/nueva"
            className="inline-flex items-center rounded-full bg-slate-900 text-white px-5 py-2 shadow-sm hover:opacity-90"
          >
            Agregar una nueva UCT
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold">Unidad Científico Tecnológica</h1>

      <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <Field label="Facultad Regional" value={uct.facultadRegional} />
          <Field label="Nombre y Sigla" value={uct.nombreSigla} />
          <Field label="Director/a" value={uct.director} />
          <Field label="Vicedirector/a" value={uct.vicedirector} />
          <Field label="Correo" value={uct.correo} />
          <div className="sm:col-span-2">
            <Field label="Objetivos y desarrollo" value={uct.objetivos} />
          </div>
        </div>

        <div className="mt-6">
          <Link to="/uct/nueva" className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300">
            Editar
          </Link>
        </div>
      </article>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-slate-500">{label}</div>
      <div className="font-medium">{value || "—"}</div>
    </div>
  );
}
