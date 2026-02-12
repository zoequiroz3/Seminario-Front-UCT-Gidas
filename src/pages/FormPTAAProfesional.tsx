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

  const clearError = (field: string) => {
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!nombreApellido.trim())
      newErrors.nombre = "Debe ingresar nombre y apellido";

    if (!horasSemanales || Number(horasSemanales) <= 0)
      newErrors.horas = "Debe ingresar horas válidas";

    if (!tipoPersonalId)
      newErrors.tipoPersonal = "Debe seleccionar tipo de personal";

    if (!uct?.id)
      newErrors.uct = "Error interno: UCT no cargada";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

    onCancel?.();
  };

  const inputClass = (field: string) =>
    `input ${
      errors[field]
        ? "!border-red-500 !ring-2 !ring-red-500 text-red-600 placeholder:text-red-500"
        : ""
    }`;

  const selectClass = (field: string) =>
    `input ${
      errors[field]
        ? "!border-red-500 !ring-2 !ring-red-500"
        : ""
    }`;

  return (
    <form onSubmit={submit} className="space-y-6">

      {/* NOMBRE */}
      <input
        className={inputClass("nombre")}
        placeholder={errors.nombre ?? "Nombre y apellido"}
        value={nombreApellido}
        onChange={(e) => {
          const value = e.target.value;
          setNombre(value);
          if (value.trim()) clearError("nombre");
        }}
      />

      {/* HORAS */}
      <input
        type="number"
        className={inputClass("horas")}
        placeholder={errors.horas ?? "Horas semanales"}
        value={horasSemanales}
        onChange={(e) => {
          const value = e.target.value;
          setHoras(value === "" ? "" : +value);
          if (value && Number(value) > 0) clearError("horas");
        }}
      />

      {/* TIPO PERSONAL */}
      <select
        className={selectClass("tipoPersonal")}
        value={tipoPersonalId}
        onChange={(e) => {
          const value = e.target.value ? +e.target.value : "";
          setTipoPersonalId(value);
          if (value) clearError("tipoPersonal");
        }}
      >
        <option value="">
          {errors.tipoPersonal ?? "Tipo de personal"}
        </option>
        {tiposPersonal.map((t) => (
          <option key={t.id} value={t.id}>
            {t.nombre}
          </option>
        ))}
      </select>

    
      {/* BOTONES */}
      <div className="flex justify-between pt-6">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Volver
        </Button>
        <Button type="submit">
          {isEdit ? "Actualizar" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
