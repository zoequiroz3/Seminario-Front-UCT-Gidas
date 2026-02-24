import { useNavigate } from "react-router-dom";
import { useSearch } from "@/hooks/useSearch";
import { highlight } from "@/utils/highlight";
import { Search, X, Filter } from "lucide-react";
import { useState } from "react";
import Button from "@/components/Button";
import Calendar from "@/components/Calendar";
import Field from "@/components/Field";
import type { SearchResult } from "@/services/searchService";

export default function SearchPage() {
  const nav = useNavigate();
  const {
    q, setQ,
    orden, setOrden,
    selectedTypes,
    toggleType,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    availableTypes,
    loading,
    results,
    totalRaw,
    error,
    clearAll,
    executeSearch,
    hasSearched,
  } = useSearch();

  const [showAdvanced, setShowAdvanced] = useState(false);

  const ORDEN_OPTIONS = [
    { value: "alf_asc", label: "Alfabético A → Z" },
    { value: "alf_desc", label: "Alfabético Z → A" },
    { value: "fecha_desc", label: "Más recientes primero" },
    { value: "fecha_asc", label: "Más antiguos primero" },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  };

  const handleOrdenChange = (newOrden: string) => {
    const val = newOrden as any;
    setOrden(val);
    executeSearch(q, val);
  };

  // Función para generar resumen del campo extra según el tipo de entidad
  const renderExtraSummary = (result: SearchResult): string | null => {
    if (!result.extra) return null;

    const { tipo, extra } = result;

    switch (tipo) {
      case "Autor":
        if (extra.cantidad_documentos) {
          return `${extra.cantidad_documentos} documento${extra.cantidad_documentos !== 1 ? "s" : ""}`;
        }
        return null;

      case "Proyecto de Investigación":
        const invCount = Array.isArray(extra.investigadores) ? extra.investigadores.length : 0;
        const becCount = Array.isArray(extra.becarios) ? extra.becarios.length : 0;
        if (invCount > 0 || becCount > 0) {
          const parts = [];
          if (invCount > 0) parts.push(`${invCount} investigador${invCount !== 1 ? "es" : ""}`);
          if (becCount > 0) parts.push(`${becCount} becario${becCount !== 1 ? "s" : ""}`);
          return parts.join(", ");
        }
        return null;

      case "Becario":
        if (extra.fuente_financiamiento) {
          return `Fuente: ${extra.fuente_financiamiento}`;
        }
        return null;

      case "Investigador":
        const projCount = Array.isArray(extra.proyectos) ? extra.proyectos.length : 0;
        const partCount = Array.isArray(extra.participaciones_relevantes) ? extra.participaciones_relevantes.length : 0;
        const trabCount = Array.isArray(extra.trabajos_reunion) ? extra.trabajos_reunion.length : 0;
        if (projCount > 0 || partCount > 0 || trabCount > 0) {
          const parts = [];
          if (projCount > 0) parts.push(`${projCount} proyecto${projCount !== 1 ? "s" : ""}`);
          if (partCount > 0) parts.push(`${partCount} participación${partCount !== 1 ? "es" : ""}`);
          if (trabCount > 0) parts.push(`${trabCount} trabajo${trabCount !== 1 ? "s" : ""}`);
          return parts.join(", ");
        }
        return null;

      case "Tipo de Proyecto":
      case "Tipo de Erogación":
      case "Tipo Registro Propiedad":
      case "Tipo de Contrato":
      case "Tipo Personal":
        const cantidad = extra.cantidad_proyectos || extra.cantidad_erogaciones || 
                        extra.cantidad_registros || extra.cantidad_transferencias || 
                        extra.cantidad_personal;
        if (cantidad) {
          const itemType = tipo.replace("Tipo de ", "").replace("Tipo ", "").toLowerCase();
          return `${cantidad} ${itemType}${cantidad !== 1 ? "s" : ""} asociado${cantidad !== 1 ? "s" : ""}`;
        }
        return null;

      case "Fuente de Financiamiento":
        if (extra.cantidad_proyectos) {
          return `Financia ${extra.cantidad_proyectos} proyecto${extra.cantidad_proyectos !== 1 ? "s" : ""}`;
        }
        return null;

      case "Documentación":
        const autCount = Array.isArray(extra.autores) ? extra.autores.length : 0;
        if (autCount > 0) {
          return `${autCount} autor${autCount !== 1 ? "es" : ""}`;
        }
        return null;

      case "Directivo":
        if (extra.cargo && extra.grupo_utn) {
          return `${extra.cargo} en ${extra.grupo_utn}`;
        }
        return null;

      case "Transferencia Socio Productiva":
        if (extra.monto) {
          return `Monto: $${Number(extra.monto).toLocaleString("es-AR")}`;
        }
        return null;

      case "Actividad de Docencia":
        if (extra.investigador) {
          return `Dictado por: ${extra.investigador}`;
        }
        return null;

      case "Equipamiento":
        if (extra.grupo) {
          return `Grupo: ${extra.grupo}`;
        }
        return null;

      case "Trabajo en Reunión Científica":
      case "Trabajo en Revista con Referato":
        const investigadoresCount = Array.isArray(extra.investigadores) ? extra.investigadores.length : 0;
        if (investigadoresCount > 0) {
          return `${investigadoresCount} investigador${investigadoresCount !== 1 ? "es" : ""}`;
        }
        return null;

      default:
        return null;
    }
  };

  // Función para extraer items relacionados con URLs del campo extra
  const extractRelatedItems = (result: SearchResult): Array<{ id: number; nombre: string; url: string }> => {
    if (!result.extra) return [];

    const items: Array<{ id: number; nombre: string; url: string }> = [];
    const extra = result.extra;

    // Buscar arrays que contengan objetos con id, nombre/título y url
    const possibleArrays = [
      extra.documentos,
      extra.proyectos,
      extra.becarios,
      extra.investigadores,
      extra.autores,
      extra.participaciones_relevantes,
      extra.trabajos_reunion,
      extra.erogaciones_recientes,
      extra.transferencias,
      extra.registros,
      extra.personal,
    ];

    possibleArrays.forEach((arr) => {
      if (Array.isArray(arr)) {
        arr.forEach((item: any) => {
          if (item && typeof item === "object" && item.id && item.url) {
            const nombre = item.nombre || item.titulo || item.nombre_apellido || item.articulo || item.descripcion || "Item";
            items.push({
              id: item.id,
              nombre: String(nombre).substring(0, 30), // Limitar longitud
              url: item.url,
            });
          }
        });
      }
    });

    // Eliminar duplicados por ID
    const uniqueItems = items.filter((item, index, self) =>
      index === self.findIndex((t) => t.id === item.id)
    );

    return uniqueItems.slice(0, 3); // Mostrar máximo 3 items
  };

  // Función para navegar a la URL mapeada del frontend
  const navigateToItem = (backendUrl: string) => {
    // Aplicar el mismo mapeo de URLs que se usa en searchService
    const urlMap: [RegExp, string][] = [
      [/^\/personal\/(\d+)$/, "/personal/personal/$1"],
      [/^\/actividades-docencia\/(\d+)$/, "/docenciaInvestigador/$1"],
      [/^\/documentacion-bibliografica\/(\d+)$/, "/documentacion/$1"],
      [/^\/participaciones-relevantes\/(\d+)$/, "/participaciones/$1"],
      [/^\/articulos-divulgacion\/(\d+)$/, "/articulos-divulgacion/$1"],
      [/^\/visitas-academicas\/(\d+)$/, "/visitantes/$1"],
      [/^\/tipos-proyecto\/.+$/, "/proyectos"],
      [/^\/tipos-erogacion\/.+$/, "/erogaciones"],
      [/^\/tipos-registro\/.+$/, "/registros-propiedad"],
      [/^\/tipos-contrato\/.+$/, "/transferencias"],
      [/^\/tipos-personal\/.+$/, "/personal"],
      [/^\/fuentes-financiamiento\/.+$/, "/proyectos"],
      [/^\/autores\/.+$/, "/documentacion"],
      [/^\/directivos\/.+$/, "/personal"],
    ];

    for (const [pattern, replacement] of urlMap) {
      if (pattern.test(backendUrl)) {
        const frontendUrl = backendUrl.replace(pattern, replacement);
        nav(frontendUrl);
        return;
      }
    }

    // Si no hay mapeo específico, usar la URL tal cual (probablemente ya coincida)
    nav(backendUrl);
  };

  // Tipo para items expandidos
  type ExpandedItem = {
    id: string; // ID único compuesto
    origin: SearchResult; // Resultado original (autor/investigador/etc)
    relatedItem: { id: number; nombre: string; url: string } | null; // Item relacionado o null si no hay
    fecha: string | null;
  };

  // Expandir resultados: cada resultado con relaciones se convierte en N items
  const expandResults = (searchResults: SearchResult[]): ExpandedItem[] => {
    const expanded: ExpandedItem[] = [];

    searchResults.forEach((result) => {
      const relatedItems = extractRelatedItems(result);

      if (relatedItems.length === 0) {
        // Sin relaciones: mostrar 1 tarjeta normal
        expanded.push({
          id: `${result.tipo}-${result.id}-main`,
          origin: result,
          relatedItem: null,
          fecha: result.fecha,
        });
      } else {
        // Con relaciones: mostrar N tarjetas (una por cada relación)
        relatedItems.forEach((item) => {
          expanded.push({
            id: `${result.tipo}-${result.id}-rel-${item.id}`,
            origin: result,
            relatedItem: item,
            fecha: result.fecha,
          });
        });
      }
    });

    return expanded;
  };

  // Expandir los resultados actuales
  const expandedResults = expandResults(results);

  return (
    <section className="w-full">
      <h2 className="text-2xl md:text-3xl font-semibold leading-none">
        Búsqueda
      </h2>

      {/* ─── BARRA DE BÚSQUEDA ─── */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <input
              className="input !pl-11 pr-10"
              placeholder='Buscar en todos los módulos y presiona Enter'
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
            />
            {q && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                onClick={clearAll}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="hidden sm:flex items-center gap-2"
            disabled={loading}
          >
            <Search className="w-4 h-4" />
            Buscar
          </Button>

          <Button
            type="button"
            variant={showAdvanced ? "primary" : "secondary"}
            size="md"
            className="flex items-center gap-2"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filtros</span>
          </Button>
        </form>

        {/* ─── FILTROS AVANZADOS ─── */}
        {showAdvanced && (
          <div className="pt-6 border-t border-slate-100 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Ordenamiento */}
            <Field label="Ordenar por">
              <select
                className="input"
                value={orden}
                onChange={(e) => handleOrdenChange(e.target.value)}
              >
                {ORDEN_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            {/* Fecha Desde */}
            <Calendar
              label="Desde"
              value={dateFrom ? new Date(dateFrom + "T12:00:00") : null}
              onChange={(d) => setDateFrom(d ? d.toISOString().split("T")[0] : undefined)}
              placeholder="Fecha desde"
            />

            {/* Fecha Hasta */}
            <Calendar
              label="Hasta"
              value={dateTo ? new Date(dateTo + "T12:00:00") : null}
              onChange={(d) => setDateTo(d ? d.toISOString().split("T")[0] : undefined)}
              placeholder="Fecha hasta"
            />

            {/* Filtro por tipo (pills) */}
            {availableTypes.length > 0 && (
              <div className="sm:col-span-2 lg:col-span-3">
                <Field label="Filtrar por tipo">
                  <div className="flex flex-wrap gap-2 mt-2">
                    {availableTypes.map((tipo) => {
                      const isActive = selectedTypes.includes(tipo);
                      return (
                        <button
                          key={tipo}
                          type="button"
                          onClick={() => toggleType(tipo)}
                          className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${isActive
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                            : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                          {tipo}
                        </button>
                      );
                    })}
                    {selectedTypes.length > 0 && (
                      <button
                        type="button"
                        onClick={clearAll}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 hover:underline"
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                </Field>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── RESULTADOS ─── */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading && (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-slate-200 rounded" />
                <div className="h-5 w-3/4 bg-slate-200 rounded" />
                <div className="h-4 w-1/2 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">
            Error al buscar: {error}
          </div>
        )}

        {!loading && !error && !hasSearched && (
          <div className="text-center py-10">
            <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Comienza tu búsqueda</p>
            <p className="text-slate-400 text-sm">Ingresa al menos 2 caracteres y presiona Enter para ver resultados.</p>
          </div>
        )}

        {!loading && !error && hasSearched && results.length === 0 && (
          <div className="text-center py-10">
            <p className="text-slate-500 font-medium">Sin resultados para "{q}"</p>
            <p className="text-slate-400 text-sm">Prueba ajustando los filtros o usando otras palabras clave.</p>
          </div>
        )}

        {!loading && !error && hasSearched && expandedResults.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
              <span className="text-sm font-medium text-slate-500">
                {expandedResults.length} resultado{expandedResults.length !== 1 ? "s" : ""} encontrados
              </span>
              {totalRaw > results.length && (
                <span className="text-xs text-slate-400 italic">
                  Mostrando {results.length} entidades ({expandedResults.length} items)
                </span>
              )}
            </div>

            <ul className="divide-y divide-slate-100">
              {expandedResults.map((item) => (
                <li
                  key={item.id}
                  className="group py-5 px-4 -mx-4 cursor-pointer hover:bg-slate-50 rounded-xl transition-all"
                  onClick={() => item.relatedItem ? navigateToItem(item.relatedItem.url) : nav(item.origin.href)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      {/* ORIGEN - Resultado principal (DESTACADO) */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-block text-[10px] uppercase tracking-wider font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded group-hover:bg-white transition-colors">
                            {item.origin.tipo}
                          </span>
                        </div>
                        <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight text-base">
                          {highlight(item.origin.titulo, q)}
                        </h3>
                        {item.origin.subtitulo && (
                          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                            {highlight(item.origin.subtitulo, q)}
                          </p>
                        )}
                      </div>

                      {/* ITEM RELACIONADO - Como chip visual NO clickeable */}
                      {item.relatedItem && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-full">
                            {highlight(item.relatedItem.nombre, q)}
                          </span>
                        </div>
                      )}
                    </div>

                    {item.fecha && (
                      <div className="text-xs font-medium text-slate-400 whitespace-nowrap pt-1">
                        {new Date(item.fecha + "T12:00:00").toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
