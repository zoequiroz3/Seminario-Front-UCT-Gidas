import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUct } from "@/hooks/useUct";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/Button";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function Home() {
  const { uct, isLoading, isError, remove, removing } = useUct();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [showConfirm, setShowConfirm] = useState(false);

  if (isLoading) {
    return (
      <div className="grid place-items-center min-h-[50vh]">
        Cargando…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="grid place-items-center min-h-[50vh] text-center space-y-3">
        <p>No se pudo contactar al servidor.</p>
        <Button onClick={() => navigate("/uct/nueva")}>
          Agregar una nueva UCT
        </Button>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold">
        Unidad Científico Tecnológica
      </h1>

      {uct ? (
        <article className="card">
          <dl className="grid sm:grid-cols-2 gap-6 text-sm">
            <Field label="Facultad Regional" value={uct.facultadRegional} />
            <Field label="Nombre y Sigla" value={uct.nombreSigla} />
            <Field label="Director/a" value={uct.director} />
            <Field label="Vicedirector/a" value={uct.vicedirector} />
            <Field label="Correo" value={uct.correo} />
            <Field
              label="Objetivos y desarrollo"
              value={uct.objetivos}
              className="sm:col-span-2"
            />
          </dl>

          <div className="mt-6 flex gap-2">
            <Link
              to="/uct/nueva"
              className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300"
            >
              Editar
            </Link>

            <Button
              variant="secondary"
              onClick={() => setShowConfirm(true)}
            >
              Eliminar UCT
            </Button>
          </div>
        </article>
      ) : (
        <div className="text-center py-10 border-2 border-dashed rounded-lg space-y-4">
          <p>No hay una UCT cargada en el sistema.</p>
          <Button onClick={() => navigate("/uct/nueva")}>
            Agregar Nueva UCT
          </Button>
        </div>
      )}

      <div className="pt-4 border-t border-slate-200">
        <Button variant="secondary" onClick={logout}>
          Cerrar Sesión
        </Button>
      </div>

      {/* POPUP CONFIRMACIÓN */}
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
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium">{value || "—"}</dd>
    </div>
  );
}
