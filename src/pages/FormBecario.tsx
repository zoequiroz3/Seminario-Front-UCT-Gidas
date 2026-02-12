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
  onCancel: () => void;
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
  const [horasSemanales, setHoras] = useState<number | "">("");
  const [tipoFormacionId, setTipoFormacionId] = useState<number | "">("");
  const [fuenteId, setFuenteId] = useState<number | "">("");
  const [activo, setActivo] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!initialData) return;

    setNombre(initialData.nombre_apellido);
    setHoras(initialData.horas_semanales);
    setActivo(initialData.activo ?? true);

    if (initialData.relaciones?.tipo_formacion)
      setTipoFormacionId(initialData.relaciones.tipo_formacion.id);

    if (initialData.relaciones?.fuente_financiamiento)
      setFuenteId(initialData.relaciones.fuente_financiamiento.id);

  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!nombreApellido.trim())
      newErrors.nombre = "Debe ingresar nombre y apellido";

    if (!horasSemanales || Number(horasSemanales) <= 0)
      newErrors.horas = "Debe ingresar horas válidas";

    if (!tipoFormacionId)
      newErrors.tipoFormacion = "Debe seleccionar tipo de formación";

    if (!fuenteId)
      newErrors.fuente = "Debe seleccionar fuente";

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
      tipo_formacion_id: Number(tipoFormacionId),
      fuente_financiamiento_id: Number(fuenteId),
      grupo_utn_id: uct!.id,
      activo,
    };

    if (isEdit && initialData?.id) {
      await actualizarBecario(initialData.id, payload);
    } else {
      await crearBecario(payload);
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

      {/* Tipo Formación */}
      <div>
        <select
          className={`input ${errors.tipoFormacion ? "border-red-500 ring-2 ring-red-500" : ""}`}
          value={tipoFormacionId}
          onChange={(e) => {
            const value = e.target.value ? +e.target.value : "";
            setTipoFormacionId(value);
            if (value) clearError("tipoFormacion");
          }}
        >
          <option value="">Seleccionar tipo de formación</option>
          {tiposFormacion.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
        </select>
        {errors.tipoFormacion && (
          <p className="text-red-500 text-sm mt-1">{errors.tipoFormacion}</p>
        )}
      </div>

      {/* Fuente */}
      <div>
        <select
          className={`input ${errors.fuente ? "border-red-500 ring-2 ring-red-500" : ""}`}
          value={fuenteId}
          onChange={(e) => {
            const value = e.target.value ? +e.target.value : "";
            setFuenteId(value);
            if (value) clearError("fuente");
          }}
        >
          <option value="">Seleccionar fuente</option>
          {fuentes.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nombre}
            </option>
          ))}
        </select>
        {errors.fuente && (
          <p className="text-red-500 text-sm mt-1">{errors.fuente}</p>
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
