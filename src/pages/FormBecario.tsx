import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/Button";
import Field from "@/components/Field";
import { useUct } from "@/hooks/useUct";
import { useTiposFormacion } from "@/hooks/useTiposFormacion";
import { useFuentesFinanciamiento } from "@/hooks/useFuenteFinanciamiento";
import {
  crearBecario,
  actualizarBecario,
} from "@/services/becarioServices";
import { useQueryClient } from "@tanstack/react-query";
import { useBecas } from "@/hooks/useBecas";
import { vincularBecarioABeca, desvincularBecarioDeBeca } from "@/services/becasService";
import { Trash2 } from "lucide-react";

interface Props {
  initialData?: any;
  onCancel: () => void;
}

export default function FormBecario({
  initialData,
  onCancel,
}: Props) {
  const navigate = useNavigate();
  const { uct } = useUct();
  const { data: tiposFormacion = [] } = useTiposFormacion();
  const { fuentes = [] } = useFuentesFinanciamiento();
  const qc = useQueryClient();
  const { data: becasLista = [] } = useBecas();

  const isEdit = Boolean(initialData);

  const [nombreApellido, setNombre] = useState("");
  const [horasSemanales, setHoras] = useState<number | "">("");
  const [tipoFormacionId, setTipoFormacionId] = useState<number | "">("");
  const [activo, setActivo] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sub-form para vincular becas
  const [nuevoVinculoBecaId, setNuevoVinculoBecaId] = useState<number | "">("");
  const [nuevoVinculoFechaInicio, setNuevoVinculoFechaInicio] = useState("");
  const [nuevoVinculoFechaFin, setNuevoVinculoFechaFin] = useState("");
  const [nuevoVinculoMonto, setNuevoVinculoMonto] = useState<number | "">("");
  const [vinculoError, setVinculoError] = useState("");

  useEffect(() => {
    if (!initialData) return;

    setNombre(initialData.nombre_apellido);
    setHoras(initialData.horas_semanales);
    setActivo(initialData.activo ?? true);

    if (initialData.relaciones?.tipo_formacion)
      setTipoFormacionId(initialData.relaciones.tipo_formacion.id);

    // Initial data load doesn't populate the "nuevo vinculo" form 
    // unless we want to edit a single one, but currently we just list them.
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

    if (!tipoFormacionId)
      newErrors.tipoFormacion =
        "Debe seleccionar tipo de formación";

    if (!isEdit) {
      if (!nuevoVinculoBecaId) newErrors.beca = "Debe seleccionar una beca inicial";
      if (!nuevoVinculoFechaInicio) newErrors.fechaInicio = "Debe ingresar una fecha de inicio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      nombre_apellido: nombreApellido,
      horas_semanales: Number(horasSemanales),
      tipo_formacion_id: Number(tipoFormacionId),
      grupo_utn_id: uct!.id,
      activo,
    };

    if (isEdit && initialData?.id) {
      await actualizarBecario(initialData.id, payload);

      navigate(`/personal/becario/${initialData.id}`, {
        state: { successMessage: "Actualizado con éxito!" },
      });

      return;
    }

    // Creating initial Becario
    const newBecario: any = await crearBecario(payload);
    const createdId = newBecario.id;

    // Link the initial Beca
    if (createdId && nuevoVinculoBecaId) {
      try {
        await vincularBecarioABeca(Number(nuevoVinculoBecaId), {
          id_becario: createdId,
          fecha_inicio: nuevoVinculoFechaInicio,
          fecha_fin: nuevoVinculoFechaFin || undefined,
          monto_percibido: nuevoVinculoMonto ? Number(nuevoVinculoMonto) : undefined,
        });
      } catch (err: any) {
        console.error("Error linking initial beca", err);
        // We could handle this differently, but for now we proceed since the becario was created.
      }
    }

    navigate("/personal", {
      state: { successMessage: "Creado con éxito!" },
    });
  };

  const handleVincularBeca = async () => {
    if (!nuevoVinculoBecaId || !nuevoVinculoFechaInicio) {
      setVinculoError("Debe seleccionar una beca y fecha de inicio.");
      return;
    }
    setVinculoError("");
    try {
      await vincularBecarioABeca(Number(nuevoVinculoBecaId), {
        id_becario: initialData.id,
        fecha_inicio: nuevoVinculoFechaInicio,
        fecha_fin: nuevoVinculoFechaFin || undefined,
        monto_percibido: nuevoVinculoMonto ? Number(nuevoVinculoMonto) : undefined,
      });
      // limpiar form y recargar datos
      setNuevoVinculoBecaId("");
      setNuevoVinculoFechaInicio("");
      setNuevoVinculoFechaFin("");
      setNuevoVinculoMonto("");
      qc.invalidateQueries({ queryKey: ["personal"] });
      // si tenemos un endpoint para recargar becario por id en este mismo Form se podría, 
      // pero invalidating 'personal' forzará la recarga si dependemos de react-query en el parent.
    } catch (error: any) {
      setVinculoError(error.message || "Error al vincular la beca.");
    }
  };

  const handleDesvincularBeca = async (becaId: number) => {
    if (!window.confirm("¿Está seguro de desvincular esta beca?")) return;
    try {
      await desvincularBecarioDeBeca(becaId, initialData.id);
      qc.invalidateQueries({ queryKey: ["personal"] });
    } catch (error: any) {
      alert(error.message || "Error al desvincular la beca.");
    }
  };

  return (
    <>
      <form
        onSubmit={submit}
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 space-y-6"
      >
        {/* Nombre */}
        <Field label="Nombre y apellido">
          <>
            <input
              className={`input ${errors.nombre
                ? "!border-red-500 !ring-2 !ring-red-500"
                : ""
                }`}
              value={nombreApellido}
              onChange={(e) => {
                setNombre(e.target.value);
                if (e.target.value.trim())
                  clearError("nombre");
              }}
            />
            {errors.nombre && (
              <p className="text-red-500 text-sm mt-1">
                {errors.nombre}
              </p>
            )}
          </>
        </Field>

        {/* Horas */}
        <Field label="Horas semanales">
          <>
            <input
              type="number"
              className={`input ${errors.horas
                ? "!border-red-500 !ring-2 !ring-red-500"
                : ""
                }`}
              value={horasSemanales}
              onChange={(e) => {
                const value =
                  e.target.value === ""
                    ? ""
                    : +e.target.value;
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

        {/* Tipo Formación */}
        <Field label="Tipo de formación">
          <>
            <select
              className={`input ${errors.tipoFormacion
                ? "!border-red-500 !ring-2 !ring-red-500"
                : ""
                } ${!tipoFormacionId
                  ? "text-slate-400"
                  : "text-slate-900"
                }`}
              value={tipoFormacionId}
              onChange={(e) => {
                const value = e.target.value
                  ? +e.target.value
                  : "";
                setTipoFormacionId(value);
                if (value) clearError("tipoFormacion");
              }}
            >
              <option value="" disabled>
                Seleccionar tipo de formación
              </option>
              {tiposFormacion.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
            {errors.tipoFormacion && (
              <p className="text-red-500 text-sm mt-1">
                {errors.tipoFormacion}
              </p>
            )}
          </>
        </Field>

        {/* Initial Beca fields strictly when creating */}
        {!isEdit && (
          <div className="border border-slate-200 p-4 rounded-lg bg-slate-50 space-y-4">
            <h4 className="font-medium text-slate-700 text-sm border-b pb-2">Beca Inicial</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <Field label="Beca">
                <>
                  <select
                    className={`input py-2 text-sm text-slate-900 ${errors.beca ? "!border-red-500 !ring-2 !ring-red-500" : ""}`}
                    value={nuevoVinculoBecaId}
                    onChange={(e) => {
                      setNuevoVinculoBecaId(e.target.value === "" ? "" : Number(e.target.value));
                      if (e.target.value) clearError("beca");
                    }}
                  >
                    <option value="" disabled>Seleccionar beca</option>
                    {becasLista.map((b: any) => (
                      <option key={b.id} value={b.id}>{b.nombre_beca}</option>
                    ))}
                  </select>
                  {errors.beca && <p className="text-red-500 text-xs mt-1">{errors.beca}</p>}
                </>
              </Field>
              <Field label="Fecha inicio">
                <>
                  <input
                    type="date"
                    className={`input py-2 text-sm ${errors.fechaInicio ? "!border-red-500 !ring-2 !ring-red-500" : ""}`}
                    value={nuevoVinculoFechaInicio}
                    onChange={(e) => {
                      setNuevoVinculoFechaInicio(e.target.value);
                      if (e.target.value) clearError("fechaInicio");
                    }}
                  />
                  {errors.fechaInicio && <p className="text-red-500 text-xs mt-1">{errors.fechaInicio}</p>}
                </>
              </Field>
              <Field label="Fecha fin (Opcional)">
                <input
                  type="date"
                  className="input py-2 text-sm"
                  value={nuevoVinculoFechaFin}
                  onChange={(e) => setNuevoVinculoFechaFin(e.target.value)}
                />
              </Field>
              <Field label="Monto (Opcional)">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ej. 15000"
                  className="input py-2 text-sm"
                  value={nuevoVinculoMonto}
                  onChange={(e) => {
                    const value = e.target.value === "" ? "" : +e.target.value;
                    setNuevoVinculoMonto(value);
                  }}
                />
              </Field>
            </div>
          </div>
        )}

        {/* Botones */}
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

      {/* SECCIÓN BECAS VINCULADAS */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
        <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Becas Vinculadas</h3>

        {isEdit && (
          <div className="space-y-4">
            {/* Lista actual rápida */}
            {initialData.becas && initialData.becas.length > 0 ? (
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <table className="w-full text-sm text-left">
                  <thead className="text-slate-500 border-b">
                    <tr>
                      <th className="pb-2">Beca</th>
                      <th className="pb-2">Inicio</th>
                      <th className="pb-2">Fin</th>
                      <th className="pb-2">Monto</th>
                      <th className="pb-2 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {initialData.becas.map((b: any) => (
                      <tr key={b.id} className="border-b last:border-0 border-slate-100">
                        <td className="py-2 font-medium">{b.nombre_beca}</td>
                        <td className="py-2">{b.fecha_inicio}</td>
                        <td className="py-2">{b.fecha_fin || "—"}</td>
                        <td className="py-2">{b.monto_percibido ? `$${b.monto_percibido}` : "—"}</td>
                        <td className="py-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleDesvincularBeca(b.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Desvincular"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500 text-sm">El becario no tiene becas vinculadas.</p>
            )}

            {/* Formulario de Alta Vincular */}
            <div className="bg-slate-50 border-slate-200 border p-4 rounded-lg">
              <h4 className="font-medium text-slate-700 mb-4 text-sm">Vincular nueva beca</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <Field label="Beca">
                  <select
                    className="input py-2 text-sm text-slate-900"
                    value={nuevoVinculoBecaId}
                    onChange={(e) => setNuevoVinculoBecaId(e.target.value === "" ? "" : Number(e.target.value))}
                  >
                    <option value="" disabled>Seleccionar beca</option>
                    {becasLista.map((b: any) => (
                      <option key={b.id} value={b.id}>{b.nombre_beca}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Fecha inicio">
                  <input
                    type="date"
                    className="input py-2 text-sm"
                    value={nuevoVinculoFechaInicio}
                    onChange={(e) => setNuevoVinculoFechaInicio(e.target.value)}
                  />
                </Field>
                <Field label="Fecha fin (Opcional)">
                  <input
                    type="date"
                    className="input py-2 text-sm"
                    value={nuevoVinculoFechaFin}
                    onChange={(e) => setNuevoVinculoFechaFin(e.target.value)}
                  />
                </Field>
                <Field label="Monto (Opcional)">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ej. 15000"
                    className="input py-2 text-sm"
                    value={nuevoVinculoMonto}
                    onChange={(e) => {
                      const value = e.target.value === "" ? "" : +e.target.value;
                      setNuevoVinculoMonto(value);
                    }}
                  />
                </Field>
              </div>
              {vinculoError && <p className="text-red-500 text-sm mt-2">{vinculoError}</p>}
              <div className="mt-4 flex justify-end">
                <Button type="button" size="sm" onClick={handleVincularBeca}>
                  Vincular beca
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

