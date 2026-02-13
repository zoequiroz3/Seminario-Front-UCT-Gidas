import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUct } from "@/hooks/useUct";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/Button";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function Home() {
  const { uct, isLoading, isError, remove } = useUct();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

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

      {/* HEADER */}
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

      {/* CONTENIDO */}
      {uct ? (
        <article className="rounded-2xl border border-slate-200 bg-white shadow-sm p-8">

          <dl className="grid md:grid-cols-2 gap-y-8 gap-x-12 text-sm">
            <Field label="Facultad Regional" value={uct.facultadRegional} />
            <Field label="Nombre y Sigla" value={uct.nombreSigla} />
            <Field label="Director/a" value={uct.director} />
            <Field label="Vicedirector/a" value={uct.vicedirector} />
            <Field label="Correo electrónico" value={uct.correo} />
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

      

      {/* CONFIRM DIALOG */}
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
        }}
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
