// components/AutoresField.tsx
import React from "react";

interface AutoresFieldProps {
  value: string[];
  onChange: (autores: string[]) => void;
  label?: string;
}

const AutoresField: React.FC<AutoresFieldProps> = ({ value, onChange, label }) => {
  const autores = value.length ? value : [""];

  const updateAutor = (i: number, nuevo: string) => {
    const copia = [...autores];
    copia[i] = nuevo;
    onChange(copia);
  };

  const agregarAutor = () => {
    onChange([...autores, ""]);
  };

  const eliminarAutor = (i: number) => {
    if (autores.length === 1) {
      onChange([""]);
      return;
    }
    onChange(autores.filter((_, idx) => idx !== i));
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-medium text-sm mb-2">{label}</label>}

      {autores.map((autor, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            type="text"
            value={autor}
            placeholder={`Autor ${i + 1}`}
            onChange={(e) => updateAutor(i, e.target.value)}
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/60"
          />

          {autores.length > 1 && (
            <button
              type="button"
              onClick={() => eliminarAutor(i)}
              className="text-xs px-2 py-1 rounded-md border border-red-400 text-red-600 hover:bg-red-50"
            >
              Quitar
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={agregarAutor}
        className="self-start mt-1 text-xs px-3 py-1 rounded-full border border-black/30 hover:bg-black/5"
      >
        + Agregar autor
      </button>
    </div>
  );
};

export default AutoresField;
