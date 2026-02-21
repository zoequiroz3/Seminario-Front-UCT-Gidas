import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Button from "@/components/Button";
import SuccessToast from "@/components/SuccessToast";

import FormPTAAProfesional from "./FormPTAAProfesional";
import FormBecario from "./FormBecario";
import FormInvestigador from "./FormInvestigador";

import { getPersonalCompletoByRolAndId } from "@/services/personalCompletoServices";

type Tipo = "" | "PTAA" | "PROFESIONAL" | "BECARIO" | "INVESTIGADOR";

export default function PersonalForm() {
  const { rol, id } = useParams<{ rol?: string; id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const isEdit = Boolean(id && rol);

  const { data: initialData, isLoading } = useQuery({
    queryKey: ["personal-edit", rol, id],
    queryFn: () => getPersonalCompletoByRolAndId(rol!, Number(id)),
    enabled: Boolean(rol && id),
  });

  const [tipo, setTipo] = useState<Tipo>("");
  const [errorTipo, setErrorTipo] = useState(false);

  // 🔥 TOAST STATE
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // 🔥 Escuchar mensaje desde navigate(state)
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setShowSuccess(true);

      // limpiar state
      navigate(location.pathname, { replace: true });
    }
  }, [location.state]);

  useEffect(() => {
    if (!rol) return;

    const rolMap: Record<string, Tipo> = {
      personal: "PTAA",
      profesional: "PROFESIONAL",
      becario: "BECARIO",
      investigador: "INVESTIGADOR",
    };

    const mapped = rolMap[rol.toLowerCase()];
    if (mapped) setTipo(mapped);
  }, [rol]);

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
              className={`input ${
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

        {!tipo && !isEdit && (
          <div className="border-t border-slate-200 pt-6 flex justify-start">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="px-3 py-1 text-xs"
              onClick={() => navigate(-1)}
            >
              Volver
            </Button>
          </div>
        )}

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

      {/* 🔥 SUCCESS TOAST */}
      <SuccessToast
        open={showSuccess}
        message={successMessage}
        onClose={() => setShowSuccess(false)}
      />
    </section>
  );
}
