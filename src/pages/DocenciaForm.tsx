// src/pages/DocenciaForm.tsx
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "@/components/Button";
import DatePicker from "@/components/Calendar";
import InvestigadorSelect from "@/components/InvestigadorSelect";
import {
  upsertDocencia,
  type Docencia,
  type GradoAcademico,
  type RolDocencia,
} from "@/services/docenciaServices";

const GRADOS: GradoAcademico[] = ["Grado", "Posgrado", "Pregrado"];
const ROLES: RolDocencia[] = ["Titular", "Adjunto", "JTP", "Ayudante"];

// helpers fechas (mismo patrón que Personal.tsx)
const parseYMD = (s?: string | null): Date | null => {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};
const toYMD = (date: Date | null): string => {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

type DocenciaDraft = Partial<Docencia>;

export default function DocenciaForm() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [sp] = useSearchParams();
  const presetId = sp.get("investigadorId") ?? undefined;

  const [data, setData] = useState<DocenciaDraft>({
    id: "",
    investigadorId: presetId,
    denominacionCatedra: "",
    institucionDictada: "",
    gradoAcademico: "Grado",
    rolActividad: "Titular",
    fechaInicio: "",
    fechaFin: "",
  });

  const change =
    (k: keyof DocenciaDraft) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setData((d) => ({ ...d, [k]: e.target.value as any }));

  const setDateField = (k: "fechaInicio" | "fechaFin", dt: Date | null) =>
    setData((d) => ({ ...d, [k]: toYMD(dt) }));

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: Docencia) => upsertDocencia(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["docencia"] }),
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.investigadorId) return alert("Seleccione un/a investigador/a.");
    if (!data.denominacionCatedra?.trim()) return alert("Complete 'Denominación de Cátedra'.");
    if (!data.institucionDictada?.trim()) return alert("Complete 'Institución'.");
    if (!data.fechaInicio || !data.fechaFin) return alert("Complete fechas de inicio y fin.");

    await mutateAsync(data as Docencia);
    navigate("/docenciaInvestigador", { replace: true });
  };

  useEffect(() => {}, []);

  return (
    <section>
      <h2 className="text-[38px] md:text-[45px] font-semibold leading-none">Nueva Actividad en Docencia</h2>

      <form
        onSubmit={onSubmit}
        className="mt-8 rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-sm space-y-8"
      >
        <Field label="Investigador/a *">
          <InvestigadorSelect
            value={data.investigadorId}
            onChange={(id) => setData((d) => ({ ...d, investigadorId: id }))}
            className="input" // 👈 mismo tamaño que Personal.tsx
          />
        </Field>

        <Field label="Denominación de Cátedra *">
          <input
            className="input"
            value={data.denominacionCatedra ?? ""}
            onChange={change("denominacionCatedra")}
            placeholder=""
          />
        </Field>

        <Field label="Institución *">
          <input
            className="input"
            value={data.institucionDictada ?? ""}
            onChange={change("institucionDictada")}
            placeholder=""
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Grado Académico *">
            <select
              className="input"
              value={data.gradoAcademico}
              onChange={change("gradoAcademico")}
            >
              {GRADOS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Rol *">
            <select className="input" value={data.rolActividad} onChange={change("rolActividad")}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DatePicker
            label="Fecha inicio *"
            value={parseYMD(data.fechaInicio)}
            onChange={(dt) => setDateField("fechaInicio", dt)}
            helperText="DD/MM/AAAA"
            className="input"
          />
          <DatePicker
            label="Fecha fin *"
            value={parseYMD(data.fechaFin)}
            onChange={(dt) => setDateField("fechaFin", dt)}
            minDate={parseYMD(data.fechaInicio) || undefined}
            helperText="DD/MM/AAAA"
            className="input"
          />
        </div>

        <div className="mt-8 flex items-center justify-between">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Volver
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </form>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="md:text-[17px] block text-sm font-medium mb-4">{label}</label>
      {children}
    </div>
  );
}
