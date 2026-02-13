import Button from "@/components/Button";

export type Autor = {
  id: number;
  nombre_apellido: string;
};

type AutoresFieldProps = {
  value: Autor[];
  onChange: (autores: Autor[]) => void;
  label?: string;
};

export default function AutoresField({
  value,
  onChange,
  label,
}: AutoresFieldProps) {
  const changeAutor = (index: number, nombre: string) => {
    const next = [...value];
    next[index] = { ...next[index], nombre_apellido: nombre };
    onChange(next);
  };

  const addAutor = () => {
    onChange([...value, { id: -Date.now(), nombre_apellido: "" }]);
  };

  const removeAutor = (index: number) => {
    if (value.length === 1) {
      onChange([{ id: -Date.now(), nombre_apellido: "" }]);
      return;
    }
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {label && (
        <label className="block text-sm font-medium">{label}</label>
      )}

      {value.map((autor, index) => (
        <div key={autor.id} className="flex gap-2 items-center">
          <input
            className="input flex-1"
            value={autor.nombre_apellido}
            onChange={(e) => changeAutor(index, e.target.value)}
            placeholder="Nombre del autor"
          />
          <Button
            variant="secondary"
            size="sm"
            className="px-3 py-1 text-xs"
            onClick={() => removeAutor(index)}
          >
            ✕
          </Button>
        </div>
      ))}

      <Button type="button"
            variant="secondary"
            size="sm"
            className="px-3 py-1 text-xs"
            onClick={addAutor}>
        + Agregar autor
      </Button>
    </div>
  );
}
