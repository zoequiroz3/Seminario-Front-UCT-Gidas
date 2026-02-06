import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Button from "@/components/Button";
import { createErogacion } from "@/services/erogacionesServices";
import { useUct } from "@/hooks/useUct";

export default function ErogacionesForm() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { uct } = useUct(); // ✅ tenemos la UCT

  const [data, setData] = useState({
    numeroErogacion: "",
    tipoErogacion: "",
    fuenteErogaciones: "",
    ingresos: "",
    egresos: "",
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: createErogacion,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["erogaciones"] }),
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uct) return;

    await mutateAsync({
      numeroErogacion: Number(data.numeroErogacion),
      tipoErogacion: data.tipoErogacion.trim(),
      fuenteErogaciones: data.fuenteErogaciones.trim(),
      ingresos: data.ingresos === "" ? 0 : Number(data.ingresos),
      egresos: data.egresos === "" ? 0 : Number(data.egresos),
      grupo_utn_id: uct.id, // ✅ AHORA FUNCIONA
    });

    navigate("/erogaciones");
  };

  return (
    <section>
      <h2 className="text-2xl md:text-3xl font-semibold">
        Nueva Erogación
      </h2>

      <form
        onSubmit={submit}
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 space-y-6"
      >
        <input
          className="input"
          placeholder="Número"
          value={data.numeroErogacion}
          onChange={(e) =>
            setData({ ...data, numeroErogacion: e.target.value })
          }
        />

        <input
          className="input"
          placeholder="Tipo"
          value={data.tipoErogacion}
          onChange={(e) =>
            setData({ ...data, tipoErogacion: e.target.value })
          }
        />

        <input
          className="input"
          placeholder="Fuente"
          value={data.fuenteErogaciones}
          onChange={(e) =>
            setData({ ...data, fuenteErogaciones: e.target.value })
          }
        />

        <input
          className="input"
          placeholder="Ingresos"
          type="number"
          value={data.ingresos}
          onChange={(e) =>
            setData({ ...data, ingresos: e.target.value })
          }
        />

        <input
          className="input"
          placeholder="Egresos"
          type="number"
          value={data.egresos}
          onChange={(e) =>
            setData({ ...data, egresos: e.target.value })
          }
        />

        <div className="flex justify-between">
          <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
            Volver
          </Button>
          <Button type="submit" disabled={isPending}>
            Guardar
          </Button>
        </div>
      </form>
    </section>
  );
}
