import { useState, useEffect } from "react";
import Button from "@/components/Button";
import { useUct } from "@/hooks/useUct";
import { useTiposPersonal } from "@/hooks/useTiposPersonal";
import {
  upsertPersonal,
  actualizarPersonal,
} from "@/services/personalServices";

interface Props {
  tipo: "PTAA" | "PROFESIONAL";
  initialData?: any;
  onCancel: () => void;
}

export default function FormPTAAProfesional({
  tipo,
  initialData,
  onCancel,
}: Props) {

  const { uct } = useUct();
  const { data: tiposPersonal = [] } = useTiposPersonal();

  const isEdit = Boolean(initialData);

  const [nombreApellido, setNombre] = useState("");
  const [horasSemanales, setHoras] = useState<number | "">("");
  const [tipoPersonalId, setTipoPersonalId] = useState<number | "">("");
  const [activo, setActivo] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!initialData) return;

    setNombre(initialData.nombre_apellido);
    setHoras(initialData.horas_semanales);
    setActivo(initialData.activo ?? true);

    if (initialData.relaciones?.tipo_personal) {
      setTipoPersonalId(initialData.relaciones.tipo_personal.id);
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!nombreApellido.trim())
      newErrors.nombre = "Debe ingresar nombre y apellido";

    if (!horasSemanales || Number(horasSemanales) <= 0)
      newErrors.horas = "Debe ingresar horas válidas";

    if (!tipoPersonalId)
      newErrors.tipoPersonal = "Debe seleccionar tipo de personal";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field: string) => {
    setErrors(prev => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      nombre_apellido: nombreApellido,
      horas_semanales: Number(horasSemanales),
      tipo_personal_id: Number(tipoPersonalId),
      grupo_utn_id: uct!.id,
      activo,
    };

    if (isEdit && initialData?.id) {
      await actualizarPersonal(initialData.id, payload, "personal");
    } else {
      await upsertPersonal(payload);
    }

    onCancel();
  };

  return (
    <form onSubmit={submit} className="space-y-6">

      {/* Nombre */}
      <div>
        <input
          className={`input ${errors.nombre ? "border-red-500 ring-2 ring-red-500" : ""}`}
          placeholder="Nombre y apellido"
          value={nombreApellido}
          onChange={(e) => {
            setNombre(e.target.value);
            if (e.target.value.trim()) clearError("nombre");
          }}
        />
        {errors.nombre && (
          <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
        )}
      </div>

      {/* Horas */}
      <div>
        <input
          type="number"
          className={`input ${errors.horas ? "border-red-500 ring-2 ring-red-500" : ""}`}
          placeholder="Horas semanales"
          value={horasSemanales}
          onChange={(e) => {
            const value = e.target.value === "" ? "" : +e.target.value;
            setHoras(value);
            if (value) clearError("horas");
          }}
        />
        {errors.horas && (
          <p className="text-red-500 text-sm mt-1">{errors.horas}</p>
        )}
      </div>

      {/* Tipo Personal */}
      <div>
        <select
          className={`input ${errors.tipoPersonal ? "border-red-500 ring-2 ring-red-500" : ""}`}
          value={tipoPersonalId}
          onChange={(e) => {
            const value = e.target.value ? +e.target.value : "";
            setTipoPersonalId(value);
            if (value) clearError("tipoPersonal");
          }}
        >
          <option value="">Seleccionar tipo de personal</option>
          {tiposPersonal.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
        </select>
        {errors.tipoPersonal && (
          <p className="text-red-500 text-sm mt-1">{errors.tipoPersonal}</p>
        )}
      </div>

      {/* Botones */}
      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="px-3 py-1 text-xs"
          onClick={onCancel}
        >
          Volver
        </Button>

        <Button
          type="submit"
          size="sm"
          className="px-3 py-1 text-xs"
        >
          {isEdit ? "Actualizar" : "Guardar"}
        </Button>
      </div>

    </form>
  );
}
