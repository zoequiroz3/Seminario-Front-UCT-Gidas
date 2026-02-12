import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

import FormPTAAProfesional from "./FormPTAAProfesional";
import FormBecario from "./FormBecario";
import FormInvestigador from "./FormInvestigador";

import { getPersonalCompletoByRolAndId } from "@/services/personalCompletoServices";

type Tipo = "" | "PTAA" | "PROFESIONAL" | "BECARIO" | "INVESTIGADOR";

export default function PersonalForm() {

  const { rol, id } = useParams<{ rol?: string; id?: string }>();
  const navigate = useNavigate();

  const isEdit = Boolean(id && rol);

  const { data: initialData, isLoading } = useQuery({
    queryKey: ["personal-edit", rol, id],
    queryFn: () =>
      getPersonalCompletoByRolAndId(rol!, Number(id)),
    enabled: Boolean(rol && id),
  });

  // 🔥 SIN VALOR POR DEFECTO
  const [tipo, setTipo] = useState<Tipo>("");

  const [errorTipo, setErrorTipo] = useState(false);

  // 🔥 En edición setea automáticamente
  useEffect(() => {
    if (!initialData?.rol) return;

    const rolMap: Record<string, Tipo> = {
      personal: "PTAA",
      profesional: "PROFESIONAL",
      becario: "BECARIO",
      investigador: "INVESTIGADOR",
    };

    const mapped = rolMap[initialData.rol.toLowerCase()];
    if (mapped) setTipo(mapped);

  }, [initialData]);

  if (isLoading) return <p>Cargando…</p>;

  const handleTipoChange = (value: Tipo) => {
    setTipo(value);
    if (value) setErrorTipo(false);
  };

  return (
    <section className="w-full">
      <h2 className="text-2xl md:text-3xl font-semibold leading-none">
        {isEdit ? "Editar personal" : "Nuevo personal"}
      </h2>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm space-y-6">

        {!isEdit && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Tipo de personal
            </label>

            <select
              className={`input text-sm md:text-base ${
                errorTipo ? "border-red-500 ring-2 ring-red-500 bg-red-50" : ""
              }`}
              value={tipo}
              onChange={(e) => handleTipoChange(e.target.value as Tipo)}
              onBlur={() => {
                if (!tipo) setErrorTipo(true);
              }}
            >
              <option value="">
                Selecciona el rol del personal
              </option>
              <option value="PTAA">PTAA</option>
              <option value="PROFESIONAL">Personal Profesional</option>
              <option value="BECARIO">Becario</option>
              <option value="INVESTIGADOR">Investigador</option>
            </select>

            {errorTipo && (
              <p className="text-red-500 text-sm mt-1">
                Debe seleccionar el rol del personal
              </p>
            )}
          </div>
        )}

        {/* 🔥 SOLO SE MUESTRA SI HAY TIPO */}
        {(tipo === "PTAA" || tipo === "PROFESIONAL") && (
          <FormPTAAProfesional
            tipo={tipo}
            initialData={initialData}
            onCancel={() => navigate(-1)}
          />
        )}

        {tipo === "BECARIO" && (
          <FormBecario
            initialData={initialData}
            onCancel={() => navigate(-1)}
          />
        )}

        {tipo === "INVESTIGADOR" && (
          <FormInvestigador
            initialData={initialData}
            onCancel={() => navigate(-1)}
          />
        )}

      </div>
    </section>
  );
}
