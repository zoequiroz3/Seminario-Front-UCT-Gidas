import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useUct } from "@/hooks/useUct";
import { useAuth } from "@/context/AuthContext";
import { useDirectivos } from "@/hooks/useDirectivos";
import Button from "@/components/Button";
import ConfirmDialog from "@/components/ConfirmDialog";
import SuccessToast from "@/components/SuccessToast";

export default function Home() {
  const { uct, isLoading, isError, remove } = useUct();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const grupoId = uct?.id;
  const { data: directivos = [] } = useDirectivos(grupoId);

  const director = directivos.find(
    (d) => d.cargo === "Director"
  );

  const vicedirector = directivos.find(
    (d) => d.cargo === "Vicedirector"
  );

  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setShowSuccess(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  if (isLoading) {
    return (
      <div className="grid place-items-center min-h-[60vh] text-slate-500">
        Cargando configuración…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="grid place-items-center min-h-[60vh] text-center space-y-4">
        <p className="text-slate-600">
          No se pudo contactar al servidor.
        </p>
        <Button onClick={() => navigate("/uct/nueva")}>
          Crear configuración
        </Button>
      </div>
    );
  }

  return (
    <section className="space-y-10">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Unidad Científico Tecnológica
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configuración institucional
          </p>
        </div>

        {uct && (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate("/uct/nueva")}
            >
              Editar
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowConfirm(true)}
            >
              Eliminar
            </Button>
          </div>
        )}
      </div>

      {uct ? (
        <article className="rounded-2xl border border-slate-200 bg-white shadow-sm p-8">
          <dl className="grid md:grid-cols-2 gap-y-8 gap-x-12 text-sm">
            <Field
              label="Facultad Regional"
              value={uct.facultadRegional}
            />

            <Field
              label="Nombre y Sigla"
              value={uct.nombreSigla}
            />

            <Field
              label="Director/a"
              value={
                director
                  ? `${director.nombre_apellido}`
                  : "—"
              }
            />

            <Field
              label="Vicedirector/a"
              value={
                vicedirector
                  ? `${vicedirector.nombre_apellido}`
                  : "—"
              }
            />

            <Field
              label="Correo electrónico"
              value={uct.correo}
            />

            <Field
              label="Objetivos y desarrollo"
              value={uct.objetivos}
              className="md:col-span-2"
            />
          </dl>
        </article>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white/60 p-12 text-center space-y-4">
          <p className="text-slate-600">
            No hay una UCT configurada en el sistema.
          </p>
          <Button onClick={() => navigate("/uct/nueva")}>
            Crear configuración inicial
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={showConfirm}
        title="Eliminar Unidad Científico Tecnológica"
        message="¿Estás seguro de eliminar la UCT configurada?"
        items={
          uct
            ? [`${uct.nombreSigla} — ${uct.facultadRegional}`]
            : []
        }
        onCancel={() => setShowConfirm(false)}
        onConfirm={async () => {
          await remove();
          setShowConfirm(false);
          setSuccessMessage("Eliminado con éxito!");
          setShowSuccess(true);
        }}
      />

      <SuccessToast
        open={showSuccess}
        message={successMessage}
        onClose={() => setShowSuccess(false)}
      />
    </section>
  );
}

function Field({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-slate-500 text-xs uppercase tracking-wide">
        {label}
      </dt>
      <dd className="mt-1 text-base font-medium text-slate-900 whitespace-pre-wrap">
        {value || "—"}
      </dd>
    </div>
  );
}