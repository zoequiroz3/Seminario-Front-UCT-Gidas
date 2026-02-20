import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/Button";
import {
  getProyectoById,
  type Proyecto,
} from "@/services/proyectosServices";

export default function ProyectoDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery<Proyecto | null>({
    queryKey: ["proyecto", id],
    queryFn: () =>
      id ? getProyectoById(Number(id)) : Promise.resolve(null),
    enabled: !!id,
  });

  if (isLoading) return <p>Cargando…</p>;
  if (!data) return <p>No se encontró el proyecto.</p>;

  const formatFecha = (fecha?: string) => {
    if (!fecha) return "—";
    const date = new Date(fecha);
    return date.toLocaleDateString("es-AR");
  };
const proyecto: any = data;

const investigadores = data.investigadores?.length
  ? data.investigadores.map((a)=> a.nombre_apellido).join(", ")
  : "—";

const becarios = data.becarios?.length
  ? data.becarios.map((a)=> a.nombre_apellido).join(", ")
  : "—";

  return (
    <section className="flex flex-col gap-6">

      <h2 className="text-2xl md:text-3xl font-semibold leading-none">
        {data.nombreProyecto}
      </h2>

      <article className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col gap-6">

<div className="flex flex-col gap-3 text-[16px]">

  <p>
    <span className="font-medium">Código del proyecto:</span>{" "}
    {data.codigoProyecto}
  </p>
{/* INVESTIGADORES */}
<div>
  <p>
    <span className="font-medium text-slate-700">Investigadores:</span>{" "}
    {investigadores}
  </p>
</div>

{/* BECARIOS */}
<div>
  <p>
    <span className="font-medium text-slate-700">Becarios:</span>{" "}
    {becarios}
  </p>
</div>

  <p>
    <span className="font-medium">Descripción:</span>{" "}
    {data.descripcionProyecto || "—"}
  </p>

  <p>
    <span className="font-medium">Tipo de proyecto:</span>{" "}
    {data.tipoProyectoNombre || "—"}
  </p>

  <p>
    <span className="font-medium">Fuente de financiamiento:</span>{" "}
    {data.fuenteFinanciamientoNombre || "—"}
  </p>

  <p>
    <span className="font-medium">Fecha inicio:</span>{" "}
    {formatFecha(data.fechaInicio)}
  </p>

  <p>
    <span className="font-medium">Fecha fin:</span>{" "}
    {formatFecha(data.fechaFinalizacion)}
  </p>

</div>



        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate(-1)}
          >
            Volver
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() =>
              navigate(`/proyectos/editar/${data.id}`)
            }
          >
            Editar
          </Button>
        </div>

      </article>
    </section>
  );
}
