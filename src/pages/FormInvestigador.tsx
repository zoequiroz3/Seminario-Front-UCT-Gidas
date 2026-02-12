import { useState, useEffect } from "react";
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
  onCancel: () => void;
}

export default function FormInvestigador({
  initialData,
  onCancel,
}: Props) {

  const { uct } = useUct();
  const { data: dedicaciones = [] } = useDedicaciones();
  const { data: categorias = [] } = useCategoriasUtn();
  const { data: programas = [] } = useProgramasIncentivos();

  const isEdit = Boolean(initialData);

  const [nombreApellido, setNombre] = useState("");
  const [horasSemanales, setHoras] = useState<number | "">("");
  const [dedicacionId, setDedicacionId] = useState<number | "">("");
  const [categoriaId, setCategoriaId] = useState<number | "">("");
  const [programaId, setProgramaId] = useState<number | "">("");
  const [activo, setActivo] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!initialData) return;

    setNombre(initialData.nombre_apellido);
    setHoras(initialData.horas_semanales);
    setActivo(initialData.activo ?? true);

    if (initialData.relaciones?.tipo_dedicacion)
      setDedicacionId(initialData.relaciones.tipo_dedicacion.id);

    if (initialData.relaciones?.categoria_utn)
      setCategoriaId(initialData.relaciones.categoria_utn.id);

    if (initialData.relaciones?.programa_incentivos)
      setProgramaId(initialData.relaciones.programa_incentivos.id);

  }, [initialData]);

  const clearError = (field: string) => {
    setErrors(prev => {
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

    if (!dedicacionId)
      newErrors.dedicacion = "Debe seleccionar dedicación";

    if (!categoriaId)
      newErrors.categoria = "Debe seleccionar categoría UTN";

    if (!programaId)
      newErrors.programa = "Debe seleccionar programa";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      nombre_apellido: nombreApellido,
      horas_semanales: Number(horasSemanales),
      tipo_dedicacion_id: Number(dedicacionId),
      categoria_utn_id: Number(categoriaId),
      programa_incentivos_id: Number(programaId),
      grupo_utn_id: uct!.id,
      activo,
    };

    if (isEdit && initialData?.id) {
      await actualizarInvestigador(initialData.id, payload, "investigador");
    } else {
      await crearInvestigador(payload);
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

      {/* Dedicación */}
      <div>
        <select
          className={`input ${errors.dedicacion ? "border-red-500 ring-2 ring-red-500" : ""}`}
          value={dedicacionId}
          onChange={(e) => {
            const value = e.target.value ? +e.target.value : "";
            setDedicacionId(value);
            if (value) clearError("dedicacion");
          }}
        >
          <option value="">Seleccionar dedicación</option>
          {dedicaciones.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nombre}
            </option>
          ))}
        </select>
        {errors.dedicacion && (
          <p className="text-red-500 text-sm mt-1">{errors.dedicacion}</p>
        )}
      </div>

      {/* Categoría */}
      <div>
        <select
          className={`input ${errors.categoria ? "border-red-500 ring-2 ring-red-500" : ""}`}
          value={categoriaId}
          onChange={(e) => {
            const value = e.target.value ? +e.target.value : "";
            setCategoriaId(value);
            if (value) clearError("categoria");
          }}
        >
          <option value="">Seleccionar categoría UTN</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        {errors.categoria && (
          <p className="text-red-500 text-sm mt-1">{errors.categoria}</p>
        )}
      </div>

      {/* Programa */}
      <div>
        <select
          className={`input ${errors.programa ? "border-red-500 ring-2 ring-red-500" : ""}`}
          value={programaId}
          onChange={(e) => {
            const value = e.target.value ? +e.target.value : "";
            setProgramaId(value);
            if (value) clearError("programa");
          }}
        >
          <option value="">Seleccionar programa</option>
          {programas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
        {errors.programa && (
          <p className="text-red-500 text-sm mt-1">{errors.programa}</p>
        )}
      </div>

      {/* Botones estilo detalle */}
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
