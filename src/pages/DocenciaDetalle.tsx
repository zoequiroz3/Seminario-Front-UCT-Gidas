// src/pages/DocenciaDetalle.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "@/components/Button";
import DatePicker from "@/components/Calendar";
import InvestigadorSelect from "@/components/InvestigadorSelect";
import type { Personal } from "@/services/personalServices";
import { usePersonal } from "@/hooks/usePersonal";
import {
  getDocencia,
  upsertDocencia,
  type Docencia,
  type GradoAcademico,
  type RolDocencia,
} from "@/services/docenciaServices";

// ----------------- Constantes de catálogo -----------------
const GRADOS: GradoAcademico[] = ["Grado", "Posgrado", "Pregrado"];
const ROLES: RolDocencia[] = ["Titular", "Adjunto", "JTP", "Ayudante"];

// ----------------- Helpers de fecha (sin desfases) -----------------
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
const fmtES = (ymd?: string) => {
  if (!ymd) return "—";
  const [y, m, d] = ymd.split("-");
  return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
};

// Draft local (todos opcionales)
type DocenciaDraft = Partial<Docencia>;

export default function DocenciaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Traemos lista de actividades (mock o API real)
  const { data: list = [], isLoading, isError } = useQuery({
    queryKey: ["docencia", "all"],
    queryFn: () => getDocencia(),
    staleTime: 60_000,
  });

  const item = list.find((x) => x.id === id);

  const { list: investigadores = [] } = usePersonal("INVESTIGADOR");
  const invNameById = useMemo<Map<string, string>>(
    () => new Map((investigadores as Personal[]).map((p) => [p.id, p.nombreApellido])),
    [investigadores]
  );

  const [editing, setEditing] = useState(false);
  const [data, setData] = useState<DocenciaDraft | null>(null);

  useEffect(() => {
    if (item) setData({ ...item });
  }, [item]);

  // Mutación de guardado
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: Docencia) => upsertDocencia(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["docencia"] }),
  });

  // ----------------- Handlers -----------------
  const changeText =
    (k: keyof DocenciaDraft) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const v = e.currentTarget.value as any;
      setData((d) => (d ? { ...d, [k]: v } : d));
    };

  const setDateField = (k: "fechaInicio" | "fechaFin", dt: Date | null) =>
    setData((d) => (d ? { ...d, [k]: toYMD(dt) } : d));

  // ----------------- Guardar -----------------
  const save = async () => {
    if (!data || !item) return;

    // Validaciones mínimas
    if (!data.investigadorId) return alert("Seleccione un/a investigador/a.");
    if (!data.denominacionCatedra?.trim()) return alert("Complete 'Denominación de Cátedra'.");
    if (!data.institucionDictada?.trim()) return alert("Complete 'Institución'.");
    if (!data.gradoAcademico) return alert("Seleccione 'Grado Académico'.");
    if (!data.rolActividad) return alert("Seleccione 'Rol'.");
    if (!data.fechaInicio || !data.fechaFin) return alert("Complete fechas de inicio y fin.");

    const ini = parseYMD(data.fechaInicio)!;
    const fin = parseYMD(data.fechaFin)!;
    if (ini > fin) return alert("La 'Fecha fin' debe ser posterior o igual a la 'Fecha inicio'.");

    const payload: Docencia = {
      id: item.id,
      investigadorId: data.investigadorId,
      denominacionCatedra: data.denominacionCatedra!,
      institucionDictada: data.institucionDictada!,
      gradoAcademico: data.gradoAcademico!,
      rolActividad: data.rolActividad!,
      fechaInicio: data.fechaInicio!,
      fechaFin: data.fechaFin!,
    };

    await mutateAsync(payload);
    setEditing(false);
  };

  // ----------------- UI -----------------
  if (isLoading) return <div className="grid place-items-center min-h-[50vh]">Cargando…</div>;
  if (isError) return <div className="grid place-items-center min-h-[50vh]">Error al cargar.</div>;
  if (!item || !data) {
    return (
      <section>
        <h2 className="text-[38px] md:text-[45px] font-semibold leading-none">Actividades en Docencia</h2>
        <div className="rounded-xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          No se encontró la actividad.
          <div className="mt-6">
            <Button variant="secondary" onClick={() => navigate(-1)}>Volver</Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-[38px] md:text-[45px] font-semibold leading-none">Actividades en Docencia</h2>

      {!editing ? (
        // --------- VISTA (detalle) ---------
        <article className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <h3 className="md:text-[25px] text-lg font-semibold mb-2">{item.denominacionCatedra}</h3>

          <dl className="text-sm space-y-2">
            <Field label="Investigador/a" value={invNameById.get(item.investigadorId) ?? "—"} />
            <Field label="Institución" value={item.institucionDictada || "—"} />
            <Field label="Grado Académico" value={item.gradoAcademico || "—"} />
            <Field label="Rol" value={item.rolActividad || "—"} />
            <Field label="Fecha inicio" value={fmtES(item.fechaInicio)} />
            <Field label="Fecha fin" value={fmtES(item.fechaFin)} />
          </dl>

          <div className="mt-8 flex items-center justify-between font-medium">
            <Button variant="secondary" onClick={() => navigate(-1)}>Volver</Button>
            <Button onClick={() => setEditing(true)}>Editar</Button>
          </div>
        </article>
      ) : (
        // --------- EDICIÓN (form inline) ---------
        <form
          onSubmit={(e) => { e.preventDefault(); void save(); }}
          className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm space-y-6"
        >
          <Field label="Investigador/a *">
            <InvestigadorSelect
              value={data.investigadorId}
              onChange={(id) => setData((d) => (d ? { ...d, investigadorId: id } : d))}
              className="input"
            />
          </Field>

          <Field label="Denominación de Cátedra *">
            <input
              className="input"
              value={data.denominacionCatedra ?? ""}
              onChange={changeText("denominacionCatedra")}
              placeholder=""
            />
          </Field>

          <Field label="Institución *">
            <input
              className="input"
              value={data.institucionDictada ?? ""}
              onChange={changeText("institucionDictada")}
              placeholder=""
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Grado Académico *">
              <select
                className="input"
                value={data.gradoAcademico}
                onChange={changeText("gradoAcademico")}
              >
                {GRADOS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Rol *">
              <select
                className="input"
                value={data.rolActividad}
                onChange={changeText("rolActividad")}
              >
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
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => { setEditing(false); setData({ ...item }); }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando…" : "Guardar cambios"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </section>
  );
}

function Field({
  label,
  value,
  className = "",
  children,
}: {
  label: string;
  value?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={className}>
      <dt className="md:text-[20px] font-medium mt-7">{label}</dt>
      <dd className="md:text-[18px] text-slate-500 mt-2">{children ?? value ?? "—"}</dd>
    </div>
  );
}
