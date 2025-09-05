import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "@/components/Button";
import DatePicker from "@/components/Calendar";
import {
  getPersonal,
  upsertPersonal,
  type Personal,
  type PersonalType,
  type Dedicacion,
  type Categoria,
  type Incentivos,
  type TipoPersonal,
  type TipoFormacion,
} from "@/services/personalServices";

// ---------- helpers ----------
const roleLabel = (p: Personal) => {
  switch (p.tipo) {
    case "INVESTIGADOR": return "Investigador/a";
    case "PROFESIONAL":  return "Personal Profesional";
    case "PTAA":         return "Personal Administrativo, Técnico y de Apoyo";
    case "BECARIO": {
      const tf = (p as any).tipoFormacion;
      return tf === "Personal en Formación" ? "Personal en Formación" : "Becario/a";
    }
  }
};

const MONTHS_ES = ["01","02","03","04","05","06","07","08","09","10","11","12"];
const fmtES = (ymd?: string) => {
  if (!ymd) return "—";
  const [y,m,d] = ymd.split("-");
  return `${d.padStart(2,"0")}/${m.padStart(2,"0")}/${y}`;
};

// Campos por tipo (strings simples)
const fieldsByType: Record<PersonalType, string[]> = {
  INVESTIGADOR: ["categoriaUtn", "programaIncentivos", "dedicacion", "proyectoCoordinaId"],
  PROFESIONAL: [],
  PTAA: ["tipoPersonal", "fechaInicio", "fechaFin"],
  BECARIO: ["fuenteFinanciamiento", "tipoFormacion"],
};

// Selects
const options = {
  tipoPersonal: [
    { value: "INVESTIGADOR" as const, label: "Investigador/a" },
    { value: "PROFESIONAL"  as const, label: "Personal Profesional" },
    { value: "PTAA"         as const, label: "Personal Administrativo, Técnico y de Apoyo" },
    { value: "BECARIO"      as const, label: "Becarios y/o Personal en formación" },
  ],
  categoria: [
    "Resolución A","Resolución B","Resolución D","Resolución E","Resolución F","Resolución G",
  ] as Categoria[],
  incentivos: ["I","II"] as Incentivos[],
  dedicacion: ["Simple","Exclusiva","Semiexclusiva"] as Dedicacion[],
  ptaa: ["Técnico","Administrativo","Apoyo"] as TipoPersonal[],
  tipoFormacion: ["Becario","Personal en Formación"] as TipoFormacion[],
};

// Draft local con fechas opcionales
type PersonalDraft = Partial<Personal> & { fechaInicio?: string; fechaFin?: string };

export default function PersonalDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: list = [], isLoading, isError } = useQuery({
    queryKey: ["personal"],
    queryFn: getPersonal,
    staleTime: 60_000,
  });

  const persona = list.find((p) => p.id === id);

  const [editing, setEditing] = useState(false);
  const [data, setData] = useState<PersonalDraft | null>(null);

  useEffect(() => {
    if (persona) {
      // copiamos y traemos posibles fechas si existen
      const draft: PersonalDraft = { ...persona } as any;
      draft.fechaInicio = (persona as any).fechaInicio ?? "";
      draft.fechaFin    = (persona as any).fechaFin ?? "";
      setData(draft);
    }
  }, [persona]);

  // ------- edición -------
  const visibleFields = useMemo(() => {
    const t = (data?.tipo ?? persona?.tipo ?? "INVESTIGADOR") as PersonalType;
    return ["horasSemanales", "tipo", ...fieldsByType[t]];
  }, [data?.tipo, persona?.tipo]);

  const change =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const val = e.target.type === "number" ? Number(e.target.value) : (e.target.value as any);
      setData((d) => (d ? { ...d, [k]: val } : d));
    };

  const onTipoChange = (next: PersonalType) => {
    setData((prev) => {
      if (!prev) return prev;
      const clean: Record<string, undefined> = {};
      Object.values(fieldsByType).flat().forEach((k) => (clean[k] = undefined));
      return { ...prev, ...clean, tipo: next };
    });
  };

  // fechas seguras (YYYY-MM-DD ←→ Date local)
  const parseYMD = (s?: string | null): Date | null => {
    if (!s) return null;
    const [y,m,d] = s.split("-").map(Number);
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
  const setDateField = (k: "fechaInicio" | "fechaFin", dt: Date | null) =>
    setData((d) => (d ? { ...d, [k]: toYMD(dt) } : d));

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: Personal) => upsertPersonal(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["personal"] }),
  });

  const save = async () => {
    if (!data) return;
    // validaciones mínimas
    const horas = Number(data.horasSemanales);
    if (!Number.isInteger(horas) || horas < 0) {
      alert("Las horas semanales deben ser un entero ≥ 0.");
      return;
    }
    // nombre bloqueado: usamos el de persona original
    const payload: Personal = {
      ...(data as any),
      id: persona!.id,
      nombreApellido: persona!.nombreApellido,
      horasSemanales: horas,
      tipo: (data.tipo ?? persona!.tipo) as PersonalType,
    };
    await mutateAsync(payload);
    setEditing(false);
  };

  // ------- UI -------
  if (isLoading) return <div className="grid place-items-center min-h-[50vh]">Cargando…</div>;
  if (isError)   return <div className="grid place-items-center min-h-[50vh]">Error al cargar.</div>;
  if (!persona || !data) {
    return (
      <section>
        <h2 className="text-3xl font-semibold mb-6">Personal</h2>
        <div className="rounded-xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          No se encontró la persona.
          <div className="mt-6">
            <Button variant="secondary" onClick={() => navigate(-1)}>Volver</Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-3xl font-semibold">Personal</h2>

      {!editing ? (
        // --------- VISTA (detalle) ---------
        <article className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">{persona.nombreApellido}</h3>

          <dl className="text-sm space-y-2">
            <Field label="Horas semanales" value={String(persona.horasSemanales ?? "—")} />
            <Field label="Tipo de personal" value={roleLabel(persona)} />

            {persona.tipo === "PTAA" && (
              <>
                <Field label="Tipo" value={(persona as any).tipoPersonal ?? "—"} />
                <Field label="Fecha de inicio" value={fmtES((persona as any).fechaInicio)} />
                <Field label="Fecha de Fin" value={fmtES((persona as any).fechaFin)} />
              </>
            )}

            {persona.tipo === "INVESTIGADOR" && (
              <>
                <Field label="Categoría UTN" value={(persona as any).categoriaUtn ?? "—"} />
                <Field label="Programa de incentivos" value={(persona as any).programaIncentivos ?? "—"} />
                <Field label="Dedicación" value={(persona as any).dedicacion ?? "—"} />
                <Field label="Proyecto que coordina" value={(persona as any).proyectoCoordinaId ?? "—"} />
              </>
            )}

            {persona.tipo === "BECARIO" && (
              <>
                <Field label="Fuente de financiamiento" value={(persona as any).fuenteFinanciamiento ?? "—"} />
                <Field label="Tipo de formación" value={(persona as any).tipoFormacion ?? "—"} />
              </>
            )}
          </dl>

          <div className="mt-8 flex items-center justify-between">
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
          <Field label="Nombre y Apellido">
            <input className="input" value={persona.nombreApellido} disabled />
          </Field>

          <Field label="Horas semanales">
            <input
              type="number"
              inputMode="numeric"
              step={1}
              min={0}
              className="input"
              value={data.horasSemanales ?? ""}
              onChange={(e) => {
                const v = e.currentTarget.value;
                setData((d) => d ? { ...d, horasSemanales: v === "" ? undefined : Math.trunc(Number(v)) } : d);
              }}
              placeholder="Dedicadas al grupo"
            />
          </Field>

          <Field label="Tipo de personal">
            <select
              className="input"
              value={data.tipo ?? persona.tipo}
              onChange={(e) => onTipoChange(e.target.value as PersonalType)}
            >
              {options.tipoPersonal.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>

          {/* INVESTIGADOR */}
          {(data.tipo ?? persona.tipo) === "INVESTIGADOR" && (
            <>
              <Field label="Categoría UTN">
                <select
                  className="input"
                  value={(data as any).categoriaUtn ?? ""}
                  onChange={change("categoriaUtn")}
                >
                  <option value="" disabled>Seleccione una categoría</option>
                  {options.categoria.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>

              <Field label="Programa de incentivos">
                <select
                  className="input"
                  value={(data as any).programaIncentivos ?? ""}
                  onChange={change("programaIncentivos")}
                >
                  <option value="" disabled>Seleccione un programa</option>
                  {options.incentivos.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </Field>

              <Field label="Dedicación">
                <select
                  className="input"
                  value={(data as any).dedicacion ?? ""}
                  onChange={change("dedicacion")}
                >
                  <option value="" disabled>Seleccione un tipo de dedicación</option>
                  {options.dedicacion.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>

              <Field label="Proyecto que coordina">
                <input
                  className="input"
                  value={(data as any).proyectoCoordinaId ?? ""}
                  onChange={change("proyectoCoordinaId")}
                  placeholder="ID o nombre del proyecto (opcional)"
                />
              </Field>
            </>
          )}

          {/* PTAA */}
          {(data.tipo ?? persona.tipo) === "PTAA" && (
            <>
              <Field label="Tipo de personal (PTAA)">
                <select
                  className="input"
                  value={(data as any).tipoPersonal ?? ""}
                  onChange={change("tipoPersonal")}
                >
                  <option value="" disabled>Seleccione un tipo</option>
                  {options.ptaa.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DatePicker
                  label="Fecha de inicio"
                  value={parseYMD((data as any).fechaInicio)}
                  onChange={(dt) => setDateField("fechaInicio", dt)}
                  helperText="DD/MM/YYYY"
                  className="input"
                />
                <DatePicker
                  label="Fecha de finalización"
                  value={parseYMD((data as any).fechaFin)}
                  onChange={(dt) => setDateField("fechaFin", dt)}
                  minDate={parseYMD((data as any).fechaInicio) || undefined}
                  helperText="DD/MM/YYYY"
                  className="input"
                />
              </div>
            </>
          )}

          {/* BECARIO */}
          {(data.tipo ?? persona.tipo) === "BECARIO" && (
            <>
              <Field label="Fuente de financiamiento">
                <input
                  className="input"
                  value={(data as any).fuenteFinanciamiento ?? ""}
                  onChange={change("fuenteFinanciamiento")}
                />
              </Field>

              <Field label="Tipo de formación">
                <select
                  className="input"
                  value={(data as any).tipoFormacion ?? ""}
                  onChange={change("tipoFormacion")}
                >
                  <option value="" disabled>Seleccione una opción</option>
                  {options.tipoFormacion.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
            </>
          )}

          <div className="mt-8 flex items-center justify-between">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Volver</Button>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => { setEditing(false); setData({ ...persona } as any); }}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>{isPending ? "Guardando…" : "Guardar cambios"}</Button>
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
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium">
        {children ?? value ?? "—"}
      </dd>
    </div>
  );
}
