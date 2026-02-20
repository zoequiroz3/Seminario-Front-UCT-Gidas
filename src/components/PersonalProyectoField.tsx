import Button from "@/components/Button";

export type PersonaOption = {
  id: number;
  nombre_apellido: string;
};

type Props = {
  value: number[]; // ids seleccionados
  options: PersonaOption[]; // opciones disponibles
  onChange: (ids: number[]) => void;
  label?: string;
};

export default function PersonalProyectoField({
  value,
  options,
  onChange,
  label,
}: Props) {

  const addField = () => {
    onChange([...value, 0]);
  };

  const removeField = (index: number) => {
    const next = value.filter((_, i) => i !== index);
    onChange(next.length ? next : []);
  };

  const changeValue = (index: number, id: number) => {
    const next = [...value];
    next[index] = id;
    onChange(next);
  };

  const usedIds = value.filter(Boolean);

  return (
    <div className="space-y-4">
      {label && (
        <label className="block text-sm font-medium">
          {label}
        </label>
      )}

      {value.map((selectedId, index) => {
        const availableOptions = options.filter(
          (o) =>
            !usedIds.includes(o.id) || o.id === selectedId
        );

        return (
          <div key={index} className="flex gap-2 items-center">
            <select
              className="input flex-1"
              value={selectedId || ""}
              onChange={(e) =>
                changeValue(index, Number(e.target.value))
              }
            >
              <option value="" disabled>
                Seleccionar
              </option>
              {availableOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nombre_apellido}
                </option>
              ))}
            </select>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="px-3 py-1 text-xs"
              onClick={() => removeField(index)}
            >
              ✕
            </Button>
          </div>
        );
      })}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="px-3 py-1 text-xs"
        onClick={addField}
      >
        + Agregar
      </Button>
    </div>
  );
}
