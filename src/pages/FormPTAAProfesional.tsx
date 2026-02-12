import { useState, useEffect } from "react";
import Button from "@/components/Button";
import { useUct } from "@/hooks/useUct";
import { useTiposPersonal } from "@/hooks/useTiposPersonal";
import {
  upsertPersonal,
  actualizarPersonal,
} from "@/services/personalServices";
import { PersonalCompleto } from "@/services/personalCompletoServices";
import { useParams } from "react-router-dom";

interface Props {
  tipo: "PTAA" | "PROFESIONAL";
  initialData?: PersonalCompleto;
  onCancel?: () => void;
}

export default function FormPTAAProfesional({
  tipo,
  initialData,
  onCancel,
}: Props) {
  const { uct } = useUct();
  const { data: tiposPersonal = [] } = useTiposPersonal();

  const isEdit = Boolean(initialData);
  const { rol } = useParams<{ rol: string }>();

  const [nombreApellido, setNombre] = useState("");
  const [horasSemanales, setHoras] = useState(0);
  const [tipoPersonalId, setTipoPersonalId] = useState<number>();
  const [activo, setActivo] = useState(true);

  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre_apellido);
      setHoras(initialData.horas_semanales);
      setActivo(initialData.activo ?? true);
      setTipoPersonalId(initialData.tipo_personal_id);
    }
  }, [initialData]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uct || !tipoPersonalId) return;

    const payload = {
      nombre_apellido: nombreApellido,
      horas_semanales: horasSemanales,
      tipo_personal_id: tipoPersonalId,
      activo,
      grupo_utn_id: uct.id,
    };

    if (isEdit && initialData?.id) {
      await actualizarPersonal(initialData.id, payload, rol!);
    } else {
      await upsertPersonal(payload);
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
        value={tipoPersonalId ?? ""}
        onChange={(e) => setTipoPersonalId(+e.target.value)}
      >
        <option value="">Tipo de personal</option>
        {tiposPersonal.map((t) => (
          <option key={t.id} value={t.id}>
            {t.nombre}
          </option>
        ))}
      </select>

      <div className="flex justify-between pt-6">
        <Button type="button" variant="secondary" onClick={() => onCancel?.()}>
          Volver
        </Button>
        <Button type="submit">
          {isEdit ? "Actualizar" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
