import { useNavigate } from "react-router-dom";
import Button from "@/components/Button";

export default function PersonalLanding() {
  const navigate = useNavigate();

  return (
    <section className="flex flex-col gap-8">
      {/* Header: Título + Agregar */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-semibold">Personal</h2>
        <Button
          variant="primary"
          onClick={() => navigate("/personal/nuevo")} // <- ruta del formulario
        >
          Agregar Personal
        </Button>
      </div>

      {/* Espaciado central opcional */}
      <div className="grow" />

      {/* Footer: Volver */}
      <div className="pt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate(-1)}
        >
          Volver
        </Button>
      </div>
    </section>
  );
}
