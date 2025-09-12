// src/pages/TrabajoReunionForm.tsx
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "@/components/Button";
import DatePicker from "@/components/Calendar";
import InvestigadorSelect from "@/components/InvestigadorSelect";
import {
  upsertTrabajo,
  type TrabajoReunion,
  type TipoParticipacion,
  type TipoNacionalidad,
} from "@/services/trabajosReunionServices";

// Tipos fijos
const NACIONALIDAD: TipoNacionalidad[] = ["Nacional", "Internacional"];
const TIPOS: TipoParticipacion[] = ["Poster", "Oral", "Otro"];

// Helpers para fechas ISO
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

type TrabajoDraft = Partial<TrabajoReunion>;

export default function TrabajoReunionForm() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [sp] = useSearchParams();
  const presetId = sp.get("investigadorId") ?? undefined;

  const [data, setData] = useState<TrabajoDraft>({
    id: "",
    investigadorId: presetId,
    titulo: "",
    evento: "",
    fecha: "",
    lugar: "",
    tipo: "Poster",
    tipoNacionalidad: "Nacional",
  });

  const change =
    (k: keyof TrabajoDraft) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setData((d) => ({ ...d, [k]: e.target.value as any }));

  const setDateField = (dt: Date | null) =>
    setData((d) => ({ ...d, fecha: toYMD(dt) }));

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: TrabajoReunion) => upsertTrabajo(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trabajos-reunion"] }),
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!data.investigadorId) return alert("Seleccione un/a investigador/a.");
    if (!data.titulo?.trim()) return alert("Complete el título del trabajo.");
    if (!data.evento?.trim()) return alert("Complete el nombre del evento.");
    if (!data.fecha) return alert("Seleccione la fecha del evento.");
    if (!data.tipo) return alert("Seleccione el tipo de participación.");

    await mutateAsync(data as TrabajoReunion);
    navigate("/trabajosCientInv", { replace: true });
  };

  return (
    <section>
      <h2 className="text-[38px] md:text-[45px] font-semibold leading-none">Nuevo Trabajo en Reunión Científica</h2>

      <form
        onSubmit={onSubmit}
        className="mt-8 rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-sm space-y-8"
      >
        <Field label="Investigador/a *">
          <InvestigadorSelect
            value={data.investigadorId}
            onChange={(id) => setData((d) => ({ ...d, investigadorId: id }))}
            className="input"
          />
        </Field>

        <Field label="Título del trabajo *">
          <input
            className="input"
            value={data.titulo ?? ""}
            onChange={change("titulo")}
            placeholder="Ej. Análisis de eficiencia energética en UTN"
          />
        </Field>

        <Field label="Nombre del evento *">
          <input
            className="input"
            value={data.evento ?? ""}
            onChange={change("evento")}
            placeholder="Ej. Congreso Nacional de Ingeniería"
          />
        </Field>

        <Field label="Lugar del evento">
          <input
            className="input"
            value={data.lugar ?? ""}
            onChange={change("lugar")}
            placeholder="Ej. La Plata, Argentina"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DatePicker
            label="Fecha del evento *"
            value={parseYMD(data.fecha)}
            onChange={setDateField}
            helperText="DD/MM/AAAA"
            className="input"
          />

          <Field label="Tipo de participación *">
            <select className="input" value={data.tipo} onChange={change("tipo")}>
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Procedencia del Trabajo *">
            <select className="input" value={data.tipoNacionalidad} onChange={change("tipoNacionalidad")}>
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
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
