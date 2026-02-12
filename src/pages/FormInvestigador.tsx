import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Button from "@/components/Button";
import { useUct } from "@/hooks/useUct";
import { useDedicaciones } from "@/hooks/useDedicaciones";
import { useCategoriasUtn } from "@/hooks/useCategoriasUtn";
import { useProgramasIncentivos } from "@/hooks/useProgramasIncentivos";
import {
  crearInvestigador,
  actualizarInvestigador,
} from "@/services/investigadorServices";

interface Props {
  initialData?: any;
  onCancel?: () => void;
}

export default function FormInvestigador({
  initialData,
  onCancel,
}: Props) {
  const { rol } = useParams<{ rol: string }>();

  const { uct } = useUct();
  const { data: dedicaciones = [] } = useDedicaciones();
  const { data: categorias = [] } = useCategoriasUtn();
  const { data: programas = [] } = useProgramasIncentivos();

  const isEdit = Boolean(initialData);

  const [nombreApellido, setNombre] = useState("");
  const [horasSemanales, setHoras] = useState(0);
  const [dedicacionId, setDedicacionId] = useState<number>();
  const [categoriaId, setCategoriaId] = useState<number>();
  const [programaId, setProgramaId] = useState<number>();
  const [activo, setActivo] = useState(true);

  // 🔥 Cargar datos cuando es edición
  useEffect(() => {
    if (!initialData) return;

    setNombre(initialData.nombre_apellido);
    setHoras(initialData.horas_semanales);
    setActivo(initialData.activo ?? true);

    if (initialData.relaciones?.tipo_dedicacion) {
      setDedicacionId(initialData.relaciones.tipo_dedicacion.id);
    }

    if (initialData.relaciones?.categoria_utn) {
      setCategoriaId(initialData.relaciones.categoria_utn.id);
    }

    if (initialData.relaciones?.programa_incentivos) {
      setProgramaId(initialData.relaciones.programa_incentivos.id);
    }
  }, [initialData]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("SUBMIT INVESTIGADOR");

    if (!uct) {
      console.error("UCT undefined");
      return;
    }

    if (!dedicacionId) {
      console.error("Dedicación no seleccionada");
      return;
    }

    const payload = {
      nombre_apellido: nombreApellido,
      horas_semanales: horasSemanales,
      tipo_dedicacion_id: dedicacionId,
      categoria_utn_id: categoriaId,
      programa_incentivos_id: programaId,
      activo,
      grupo_utn_id: uct.id,
    };

    console.log("PAYLOAD:", payload);

    try {
      if (isEdit && initialData?.id && rol) {
        await actualizarInvestigador(initialData.id, payload, rol);
      } else {
        await crearInvestigador(payload);
      }

      onCancel?.();
    } catch (error) {
      console.error("ERROR ACTUALIZANDO INVESTIGADOR:", error);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <input
        className="input"
        placeholder="Nombre y apellido"
        value={nombreApellido}
        onChange={(e) => setNombre(e.target.value)}
      />

      <input
        type="number"
        className="input"
        placeholder="Horas semanales"
        min={0}
        value={horasSemanales}
        onChange={(e) => setHoras(+e.target.value)}
      />

      <select
        className="input"
        value={dedicacionId ?? ""}
        onChange={(e) => setDedicacionId(+e.target.value)}
      >
        <option value="">Dedicación</option>
        {dedicaciones.map((d) => (
          <option key={d.id} value={d.id}>
            {d.nombre}
          </option>
        ))}
      </select>

      <select
        className="input"
        value={categoriaId ?? ""}
        onChange={(e) => setCategoriaId(+e.target.value)}
      >
        <option value="">Categoría UTN</option>
        {categorias.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
          </option>
        ))}
      </select>

      <select
        className="input"
        value={programaId ?? ""}
        onChange={(e) => setProgramaId(+e.target.value)}
      >
        <option value="">Programa de incentivos</option>
        {programas.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nombre}
          </option>
        ))}
      </select>

      <label className="flex gap-2 items-center">
        <input
          type="checkbox"
          checked={activo}
          onChange={(e) => setActivo(e.target.checked)}
        />
        Activo
      </label>

      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={() => onCancel?.()}
        >
          Volver
        </Button>

        <Button type="submit">
          {isEdit ? "Actualizar" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
