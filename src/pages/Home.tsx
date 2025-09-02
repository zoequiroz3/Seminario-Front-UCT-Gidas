import { Link } from "react-router-dom";
import { useUct } from "@/hooks/useUct";

export default function Home() {
  const { uct, isLoading, isError } = useUct();

  if (isLoading) return <div className="grid place-items-center min-h-[50vh]">Cargando…</div>;

  if (isError) {
    return (
      <div className="grid place-items-center min-h-[50vh] text-center space-y-3">
        <p>No se pudo contactar al servidor.</p>
        <Link to="/uct/nueva" className="inline-flex items-center rounded-full bg-slate-900 text-white px-5 py-2 hover:opacity-90">
          Agregar una nueva UCT
        </Link>
      </div>
    );
  }

  if (!uct) {
    return (
      <div className="pt-10">
        <Link to="/uct/nueva" className="inline-flex items-center rounded-full bg-slate-900 text-white px-5 py-2 hover:opacity-90">
          Agregar una nueva UCT
        </Link>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold">Unidad Científico Tecnológica</h1>
      <article className="card">
        <dl className="grid sm:grid-cols-2 gap-6 text-sm">
          <Field label="Facultad Regional" value={uct.facultadRegional} />
          <Field label="Nombre y Sigla" value={uct.nombreSigla} />
          <Field label="Director/a" value={uct.director} />
          <Field label="Vicedirector/a" value={uct.vicedirector} />
          <Field label="Correo" value={uct.correo} />
          <Field label="Objetivos y desarrollo" value={uct.objetivos} className="sm:col-span-2" />
        </dl>
        <div className="mt-6">
          <Link to="/uct/nueva" className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300">Editar</Link>
        </div>
      </article>
    </section>
  );
}

function Field({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium">{value || "—"}</dd>
    </div>
  );
}
