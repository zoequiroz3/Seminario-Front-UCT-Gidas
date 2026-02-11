import { useState, useEffect } from "react";
import Button from "@/components/Button";
import { useUct } from "@/hooks/useUct";
import { useTiposFormacion } from "@/hooks/useTiposFormacion";
import { useFuentesFinanciamiento } from "@/hooks/useFuenteFinanciamiento";
import {
  crearBecario,
  actualizarBecario,
} from "@/services/becarioServices";

interface Props {
  initialData?: any;
  onCancel?: () => void;
}

export default function FormBecario({
  initialData,
  onCancel,
}: Props) {
  const { uct } = useUct();
  const { data: tiposFormacion = [] } = useTiposFormacion();
  const { fuentes = [] } = useFuentesFinanciamiento();

  const isEdit = Boolean(initialData);

  const [nombreApellido, setNombre] = useState("");
  const [horasSemanales, setHoras] = useState(0);
  const [tipoFormacionId, setTipoFormacionId] = useState<number>();
  const [fuenteId, setFuenteId] = useState<number>();
  const [activo, setActivo] = useState(true);

  // 🔥 Cargar datos si es edición
  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre_apellido);
      setHoras(initialData.horas_semanales);
      setActivo(initialData.activo ?? true);

      if (initialData.relaciones?.tipo_formacion) {
        setTipoFormacionId(initialData.relaciones.tipo_formacion.id);
      }

      if (initialData.relaciones?.fuente_financiamiento) {
        setFuenteId(initialData.relaciones.fuente_financiamiento.id);
      }
    }
  }, [initialData]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uct || !tipoFormacionId) return;

    const payload = {
      nombre_apellido: nombreApellido,
      horas_semanales: horasSemanales,
      tipo_formacion_id: tipoFormacionId,
      fuente_financiamiento_id: fuenteId,
      activo,
      grupo_utn_id: uct.id,
    };

    if (isEdit && initialData?.id) {
      await actualizarBecario(initialData.id, payload);
    } else {
      await crearBecario(payload);
    }

    onCancel?.();
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
        value={tipoFormacionId ?? ""}
        onChange={(e) => setTipoFormacionId(+e.target.value)}
      >
        <option value="">Tipo de formación</option>
        {tiposFormacion.map((t) => (
          <option key={t.id} value={t.id}>
            {t.nombre}
          </option>
        ))}
      </select>

      <select
        className="input"
        value={fuenteId ?? ""}
        onChange={(e) => setFuenteId(+e.target.value)}
      >
        <option value="">Fuente de financiamiento</option>
        {fuentes.map((f) => (
          <option key={f.id} value={f.id}>
            {f.nombre}
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
