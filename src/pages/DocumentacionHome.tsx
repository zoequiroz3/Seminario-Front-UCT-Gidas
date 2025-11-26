import { useNavigate } from "react-router-dom";
import Button from "@/components/Button";
import { useDocumentacion } from "@/hooks/useDocumentacion";

export default function DocumentacionLanding() {
  const navigate = useNavigate();
  const { list, isLoading, isError } = useDocumentacion();

  return (
    <section className="w-full min-h-[calc(100vh-96px)] px-10 md:px-5 lg:px-1 py-2 flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[38px] md:text-[45px] font-semibold leading-none">
          Documentación
        </h2>

        <Button variant="primary" onClick={() => navigate("/documentacion/nuevo")}>
          Agregar Documento
        </Button>
      </div>

      {/* Contenido */}
      <div className="mt-6 flex-1">
        {isLoading && <p className="text-slate-500">Cargando…</p>}
        {isError && <p className="text-red-600">No se pudo cargar la documentación.</p>}

        {!isLoading && !isError && (
          list.length === 0 ? (
            <p className="text-slate-500">Aún no hay documentos cargados.</p>
          ) : (
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">

              {list.map((d) => (
                <div
                  key={d.id}
                  onClick={() => navigate(`/documentacion/${d.id}`)}
                  className="cursor-pointer p-6 rounded-2xl border border-slate-200 bg-white/80 hover:shadow-md transition"
                >
                  <h3 className="text-xl md:text-2xl font-semibold">{d.titulo}</h3>
                  <p className="text-base md:text-lg text-slate-600 mt-2">
                    Año: {d.anio}
                  </p>
                </div>
              ))}

            </div>
          )
        )}
      </div>

      {/* Footer */}
      <div className="pt-10">
        <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </div>
    </section>
  );
}
