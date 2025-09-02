import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/Button";
import { useUct } from "@/hooks/useUct";
import type { Uct } from "@/services/uctServices";

export default function UctForm() {
  const { uct, save, saving } = useUct();
  const navigate = useNavigate();

  const [data, setData] = useState<Uct>({
    facultadRegional: uct?.facultadRegional ?? "",
    nombreSigla:      uct?.nombreSigla ?? "",
    director:         uct?.director ?? "",
    vicedirector:     uct?.vicedirector ?? "",
    correo:           uct?.correo ?? "",
    objetivos:        uct?.objetivos ?? "",
  });

  useEffect(() => {
    if (uct) {
      setData({
        facultadRegional: uct.facultadRegional,
        nombreSigla: uct.nombreSigla,
        director: uct.director,
        vicedirector: uct.vicedirector,
        correo: uct.correo,
        objetivos: uct.objetivos,
      });
    }
  }, [uct]);

  const change =
    (k: keyof Uct) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setData((d) => ({ ...d, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await save(data);
    navigate("/");
  };

  return (
    <section>
      <h2 className="text-3xl font-semibold mb-6">
        {uct ? "Editar UCT" : "Carga de datos de la UCT"}
      </h2>

      <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm space-y-6">
        <Field label="Facultad Regional">
          <input className="input" value={data.facultadRegional} onChange={change("facultadRegional")} />
        </Field>

        <Field label="Nombre y Sigla del Grupo">
          <input className="input" value={data.nombreSigla} onChange={change("nombreSigla")} />
        </Field>

        <Field label="Director/a">
          <input className="input" value={data.director} onChange={change("director")} />
        </Field>

        <Field label="Vicedirector/a">
          <input className="input" value={data.vicedirector} onChange={change("vicedirector")} />
        </Field>

        <Field label="Correo electrónico">
          <input type="email" className="input" value={data.correo} onChange={change("correo")} />
        </Field>

        <Field label="Objetivos y desarrollo">
          <textarea rows={6} className="input resize-y" value={data.objetivos} onChange={change("objetivos")} />
        </Field>

        <div className="mt-8 flex items-center justify-between">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Volver</Button>
          <Button type="submit" disabled={saving}>{saving ? "Guardando…" : uct ? "Guardar" : "Crear UCT"}</Button>
        </div>
      </form>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      {children}
    </div>
  );
}
