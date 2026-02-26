import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/Button";
import Field from "@/components/Field";
import { useUct } from "@/hooks/useUct";
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
  const navigate = useNavigate();
  const { uct } = useUct();

  const isEdit = Boolean(initialData);

  const [nombreApellido, setNombre] = useState("");
  const [horasSemanales, setHoras] = useState<number | "">("");
  const [tipoPersonalId, setTipoPersonalId] = useState<number>(tipo === "PTAA" ? 3 : 4);
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
  }, [initialData, tipo]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!nombreApellido.trim())
      newErrors.nombre = "Debe ingresar nombre y apellido";

    if (!horasSemanales || Number(horasSemanales) <= 0)
      newErrors.horas = "Debe ingresar horas válidas";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field: string) => {
    setErrors((prev) => {
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

      navigate(`/personal/personal/${initialData.id}`, {
        state: { successMessage: "Actualizado con éxito!" },
      });

      return;
    }

    await upsertPersonal(payload);

    navigate("/personal", {
      state: { successMessage: "Creado con éxito!" },
    });
  };

  return (
    <form
      onSubmit={submit}
      className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 space-y-6"
    >
      <Field label="Nombre y apellido">
        <>
          <input
            className={`input ${errors.nombre ? "!border-red-500 !ring-2 !ring-red-500" : ""
              }`}
            value={nombreApellido}
            onChange={(e) => {
              setNombre(e.target.value);
              if (e.target.value.trim()) clearError("nombre");
            }}
          />
          {errors.nombre && (
            <p className="text-red-500 text-sm mt-1">
              {errors.nombre}
            </p>
          )}
        </>
      </Field>

      <Field label="Horas semanales">
        <>
          <input
            type="number"
            className={`input ${errors.horas ? "!border-red-500 !ring-2 !ring-red-500" : ""
              }`}
            value={horasSemanales}
            onChange={(e) => {
              const value = e.target.value === "" ? "" : +e.target.value;
              setHoras(value);
              if (value) clearError("horas");
            }}
          />
          {errors.horas && (
            <p className="text-red-500 text-sm mt-1">
              {errors.horas}
            </p>
          )}
        </>
      </Field>

      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCancel}
        >
          Volver
        </Button>

        <Button type="submit" size="sm">
          {isEdit ? "Actualizar" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
