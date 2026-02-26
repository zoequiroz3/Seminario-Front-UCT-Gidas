// hooks/useAuditoria.ts
import { useUsuario } from "@/hooks/useUsuario";

type AuditData = {
  created_by?: number | string | null;
  deleted_by?: number | string | null;
};

export function useAuditoria(data?: AuditData | null) {
  // 🔥 Convertimos SIEMPRE a number si existe
  const createdId =
    data?.created_by != null
      ? Number(data.created_by)
      : undefined;

  const deletedId =
    data?.deleted_by != null
      ? Number(data.deleted_by)
      : undefined;

  // 🔥 Ejecuta query solo si hay id válido
  const {
    data: creador,
    isLoading: loadingCreador,
  } = useUsuario(createdId);

  const {
    data: eliminador,
    isLoading: loadingEliminador,
  } = useUsuario(deletedId);

  return {
    nombreCreador: loadingCreador
      ? "Cargando..."
      : creador?.nombre_usuario ?? "—",

    nombreEliminador: loadingEliminador
      ? "Cargando..."
      : eliminador?.nombre_usuario ?? "—",
  };
}