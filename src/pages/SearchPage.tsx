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
            onClick={() => setShowAdvanced((s) => !s)}
            aria-expanded={showAdvanced}
            aria-controls="advanced-panel"
            title="Búsqueda avanzada"
          >
            <Filter className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-100"
            onClick={clearAll}
            title="Limpiar búsqueda"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filtros avanzados */}
        {showAdvanced && (
          <div id="advanced-panel" className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-2">
              <div className="text-sm text-slate-600">Tipo de registro</div>
              <div className="flex flex-wrap gap-2">
                {typeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleType(opt.value)}
                    className={[
                      "px-3 py-1.5 rounded-full border text-sm",
                      types.includes(opt.value as any)
                        ? "bg-slate-900 text-white border-slate-900"
                        : "border-slate-300 hover:bg-slate-100",
                    ].join(" ")}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-slate-600">Ordenar por</div>
              <select
                className="input"
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
              >
                <option value="date_desc">Fecha: recientes → antiguos</option>
                <option value="date_asc">Fecha: antiguos → recientes</option>
                <option value="alpha_asc">Alfabético: A → Z</option>
                <option value="alpha_desc">Alfabético: Z → A</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-slate-600">Desde</div>
              <input
                type="date"
                className="input"
                value={dateFrom ?? ""}
                onChange={(e) => setDateFrom(e.target.value || undefined)}
              />
            </div>
            <div className="space-y-2">
              <div className="text-sm text-slate-600">Hasta</div>
              <input
                type="date"
                className="input"
                value={dateTo ?? ""}
                onChange={(e) => setDateTo(e.target.value || undefined)}
              />
            </div>
          </div>
        )}
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
