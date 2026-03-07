import { useMutation } from "@tanstack/react-query";
import { exportarExcelGrupo } from "@/services/uctServices";

export function useExportarExcelGrupo() {
  return useMutation({
    mutationFn: exportarExcelGrupo,
  });
}