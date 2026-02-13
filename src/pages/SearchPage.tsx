import { useNavigate } from "react-router-dom";
import { useSearch } from "@/hooks/useSearch";
import { highlight } from "@/utils/highlight";
import { Filter, X } from "lucide-react";
import { useState } from "react";

const typeOptions = [
  { value: "persona", label: "Persona" },
  { value: "proyecto", label: "Proyecto" },
  { value: "publicacion", label: "Publicación" },
  { value: "compra", label: "Compra" },
] as const;

export default function SearchPage() {
  const nav = useNavigate();
  const {
    q, setQ,
    types, setTypes,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    sort, setSort,
    loading, results, error,
    clearAll,
  } = useSearch();

  const [showAdvanced, setShowAdvanced] = useState(false);

  const toggleType = (t: string) => {
    setTypes((prev) => prev.includes(t as any) ? prev.filter(x => x !== t) : [...prev, t as any]);
  };

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold">Búsqueda</h1>

      {/* caja de búsqueda principal */}
      <div className="card">
        <div className="flex items-center gap-2">
          <input
            className="input"
            placeholder='Buscar en todos los módulos (ej. "nanomateriales")'
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            type="button"
            className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-100"
            onClick={clearAll}
            title="Limpiar búsqueda"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* resultados */}
      <div className="card">
        {error && <p className="text-rose-600">Error: {error}</p>}
        {!error && (loading ? (
          <p className="text-slate-600">Buscando…</p>
        ) : results.length === 0 ? (
          <p className="text-slate-600">Sin resultados para la consulta actual.</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {results.map((r) => (
              <li
                key={`${r.type}-${r.id}`}
                className="py-3 cursor-pointer hover:bg-slate-50 rounded-lg px-2 -mx-2"
                onClick={() => nav(r.href)}
              >
                <div className="text-xs uppercase tracking-wide text-slate-500">{r.type}</div>
                <div className="font-medium">{highlight(r.title, q)}</div>
                <div className="text-sm text-slate-600">{highlight(r.snippet, q)}</div>
                {r.date && <div className="text-xs text-slate-400 mt-1">Fecha: {new Date(r.date).toLocaleDateString()}</div>}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
