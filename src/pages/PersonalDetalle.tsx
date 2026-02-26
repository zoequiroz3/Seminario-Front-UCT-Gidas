import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Button from "@/components/Button";
import SuccessToast from "@/components/SuccessToast";
import { getPersonalCompletoByRolAndId } from "@/services/personalCompletoServices";
import { useAuditoria } from "@/hooks/useAuditoria";

export default function PersonalDetalle() {
  const { rol: paramRol, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const rol = (() => {
    if (paramRol) return paramRol;
    const path = location.pathname;
    if (path.includes("/becarios/")) return "becario";
    if (path.includes("/investigadores/")) return "investigador";
    if (path.includes("/ptaa/")) return "personal";
    if (path.includes("/profesionales/")) return "profesional";
    return undefined;
  })();

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setShowSuccess(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["personal-detalle", rol, id],
    queryFn: () => getPersonalCompletoByRolAndId(rol!, Number(id)),
    enabled: !!rol && !!id,
  });

  const auditoria = useAuditoria({
    created_by: data?.created_by ?? null,
    deleted_by: data?.deleted_by ?? null,
  });

  if (isLoading) return <p className="text-slate-500 text-center py-10">Cargando…</p>;
  if (isError || !data) return <p className="text-slate-500 text-center py-10">No encontrado</p>;

  const relaciones = data.relaciones || {};

  const formatearLabel = (key: string) => {
    return key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l: string) => l.toUpperCase());
  };

  const renderArray = (arr: any[]) => {
    if (!arr || arr.length === 0) return null;
    return arr
      .map((v) => v.nombre_apellido || v.nombre || v.titulo || "")
      .join(", ");
  };

  const formatFechaHora = (fecha?: string | null) => {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleString("es-AR");
  };

  return (
    <>
      <section className="flex flex-col gap-6">
        {/* 🔵 HEADER CON EDITAR ARRIBA */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl md:text-3xl font-semibold leading-none">
              {data?.nombre_apellido ?? "Detalle"}
            </h2>

            {rol && (
              <span className="w-fit px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider border border-slate-200">
                {rol === "personal" ? "PTAA" : rol}
              </span>
            )}
          </div>

          <Button
            size="sm"
            onClick={() => {
              if (rol === "becario") navigate(`/becarios/${id}/editar`);
              else if (rol === "investigador") navigate(`/investigadores/${id}/editar`);
              else navigate(`/personal/${rol}/${id}/editar`);
            }}
          >
            Editar
          </Button>
        </div>

        {/* ================= TARJETA PRINCIPAL ================= */}
        <article className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <div className="space-y-2 text-sm md:text-base text-slate-500">
            {/* Relaciones Explícitas */}
            {relaciones.tipo_personal?.nombre && (
              <p><span className="font-medium text-slate-700">Tipo de Personal:</span> {relaciones.tipo_personal.nombre}</p>
            )}
            {relaciones.tipo_formacion?.nombre && (
              <p><span className="font-medium text-slate-700">Grado de Formación:</span> {relaciones.tipo_formacion.nombre}</p>
            )}
            {relaciones.categoria_utn?.nombre && (
              <p><span className="font-medium text-slate-700">Categoría UTN:</span> {relaciones.categoria_utn.nombre}</p>
            )}
            {relaciones.programa_incentivos?.nombre && (
              <p><span className="font-medium text-slate-700">Programa de Incentivos:</span> {relaciones.programa_incentivos.nombre}</p>
            )}
            {relaciones.tipo_dedicacion?.nombre && (
              <p><span className="font-medium text-slate-700">Tipo de Dedicación:</span> {relaciones.tipo_dedicacion.nombre}</p>
            )}
            {relaciones.proyectos?.length > 0 && (
              <p><span className="font-medium text-slate-700">Proyectos:</span> {renderArray(relaciones.proyectos)}</p>
            )}
            {relaciones.actividades_docencia?.length > 0 && (
              <p><span className="font-medium text-slate-700">Actividades de Docencia:</span> {renderArray(relaciones.actividades_docencia)}</p>
            )}
            {relaciones.trabajos_reunion_cientifica?.length > 0 && (
              <p><span className="font-medium text-slate-700">Trabajos en Reunión Científica:</span> {renderArray(relaciones.trabajos_reunion_cientifica)}</p>
            )}
            {relaciones.participaciones_relevantes?.length > 0 && (
              <p><span className="font-medium text-slate-700">Participaciones Relevantes:</span> {renderArray(relaciones.participaciones_relevantes)}</p>
            )}

            {/* Mapeo Dinámico de Resto de Propiedades */}
            {Object.entries(data)
              .filter(
                ([key, value]) =>
                  ![
                    "id",
                    "nombre_apellido",
                    "activo",
                    "rol",
                    "relaciones",
                    "grupo",
                    "created_by",
                    "deleted_by",
                    "created_at",
                    "deleted_at",
                  ].includes(key) && 
                  value !== null &&
                  typeof value !== "object" // 🔥 SOLUCIÓN: Evita que objetos (como proyectos) rompan React
              )
              .map(([key, value]) => {
                if (key.endsWith("_id")) {
                  const relacionKey = key.replace("_id", "");
                  const nombreRelacion = relaciones?.[relacionKey]?.nombre;

                  if (nombreRelacion) {
                    return (
                      <p key={key}>
                        <span className="font-medium text-slate-700">
                          {formatearLabel(relacionKey)}:
                        </span>{" "}
                        {nombreRelacion}
                      </p>
                    );
                  }
                  return null;
                }

                return (
                  <p key={key}>
                    <span className="font-medium text-slate-700">
                      {formatearLabel(key)}:
                    </span>{" "}
                    {String(value) ?? "—"}
                  </p>
                );
              })}
          </div>
        </article>

        {/* ================= TARJETA AUDITORÍA ================= */}
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-700">Auditoría</h3>
            <p className="text-xs text-slate-500 mt-1">{data.nombre_apellido}</p>
          </div>

          <div className="space-y-2 text-sm md:text-base text-slate-500">
            <p>
              <span className="font-medium text-slate-700">Creado por:</span>{" "}
              {auditoria.nombreCreador}
            </p>
            <p>
              <span className="font-medium text-slate-700">Fecha de creación:</span>{" "}
              {formatFechaHora(data.created_at)}
            </p>
            <p>
              <span className="font-medium text-slate-700">Eliminado por:</span>{" "}
              {auditoria.nombreEliminador}
            </p>
            <p>
              <span className="font-medium text-slate-700">Fecha de eliminación:</span>{" "}
              {formatFechaHora(data.deleted_at)}
            </p>
          </div>
        </article>

        {/* 🔵 VOLVER ABAJO DE TODO */}
        <div className="flex justify-start pt-4">
          <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
            Volver
          </Button>
        </div>
      </section>

      <SuccessToast
        open={showSuccess}
        message={successMessage}
        onClose={() => setShowSuccess(false)}
      />
    </>
  );
}