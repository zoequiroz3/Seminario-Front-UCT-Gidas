import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "@/components/Button";
import DatePicker from "@/components/Calendar";
import { useUct } from "@/hooks/useUct";
import {
  createArticulo,
  getArticuloById,
  updateArticulo,
} from "@/services/articulosDivulgacionServices";

export default function ArticulosDivulgacionForm() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { uct } = useUct();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [data, setData] = useState({
    titulo: "",
    descripcion: "",
    fecha_publicacion: null as Date | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: articulo, isLoading } = useQuery({
    queryKey: ["articulos-divulgacion", id],
    queryFn: () => getArticuloById(Number(id)),
    enabled: isEdit,
  });

  // 🔹 Cargar datos en modo edición
  useEffect(() => {
    if (articulo) {
      setData({
        titulo: articulo.titulo,
        descripcion: articulo.descripcion,
        fecha_publicacion: new Date(articulo.fecha_publicacion),
      });
    }
  }, [articulo]);

  // 🔹 Limpiar error individual
  const clearError = (field: string) => {
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  // 🔹 Validación general
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!data.titulo || data.titulo.trim().length < 5)
      newErrors.titulo =
        "El título debe tener al menos 5 caracteres";

    if (!data.descripcion || data.descripcion.trim().length < 10)
      newErrors.descripcion =
        "La descripción debe tener al menos 10 caracteres";

    if (!data.fecha_publicacion)
      newErrors.fecha =
        "Debe seleccionar fecha";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: any) =>
      isEdit
        ? updateArticulo(Number(id), payload)
        : createArticulo(payload),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["articulos-divulgacion"],
      });
    },
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uct) return;
    if (!validate()) return;

    await mutateAsync({
      titulo: data.titulo.trim(),
      descripcion: data.descripcion.trim(),
      fecha_publicacion:
        data.fecha_publicacion?.toISOString().split("T")[0],
      grupo_utn_id: uct.id,
    });

    if (isEdit) {
      navigate(`/articulos-divulgacion/${id}`, {
        state: {
          successMessage:
            "Artículo actualizado con éxito!",
        },
      });
    } else {
      navigate("/articulos-divulgacion", {
        state: {
          successMessage:
            "Artículo creado con éxito!",
        },
      });
    }
  };

  const inputClass = (field: string) =>
    `input ${
      errors[field]
        ? "!border-red-500 !ring-2 !ring-red-500"
        : ""
    }`;

  if (isEdit && isLoading)
    return (
      <p className="text-slate-500">
        Cargando artículo…
      </p>
    );

  return (
    <section className="w-full">
      <h2 className="text-2xl md:text-3xl font-semibold leading-none">
        {isEdit
          ? "Editar artículo de divulgación"
          : "Nuevo artículo de divulgación"}
      </h2>

      <form
        onSubmit={submit}
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 space-y-6"
      >
        {/* Título */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Título
          </label>

          <input
            className={inputClass("titulo")}
            value={data.titulo}
            onChange={(e) => {
              const value = e.target.value;
              setData({ ...data, titulo: value });

              if (value.trim().length >= 5) {
                clearError("titulo");
              }
            }}
          />

          {errors.titulo && (
            <p className="text-red-500 text-sm mt-1">
              {errors.titulo}
            </p>
          )}
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Descripción
          </label>

          <textarea
            rows={4}
            className={inputClass("descripcion")}
            value={data.descripcion}
            onChange={(e) => {
              const value = e.target.value;
              setData({ ...data, descripcion: value });

              if (value.trim().length >= 10) {
                clearError("descripcion");
              }
            }}
          />

          {errors.descripcion && (
            <p className="text-red-500 text-sm mt-1">
              {errors.descripcion}
            </p>
          )}
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Fecha de publicación
          </label>

          <DatePicker
            value={data.fecha_publicacion}
            onChange={(date) => {
              setData({
                ...data,
                fecha_publicacion: date,
              });

              if (date) clearError("fecha");
            }}
          />

          {errors.fecha && (
            <p className="text-red-500 text-sm mt-1">
              {errors.fecha}
            </p>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate(-1)}
          >
            Volver
          </Button>

          <Button
            type="submit"
            size="sm"
            disabled={isPending}
          >
            {isPending
              ? "Guardando…"
              : isEdit
              ? "Actualizar"
              : "Guardar"}
          </Button>
        </div>
      </form>
    </section>
  );
}