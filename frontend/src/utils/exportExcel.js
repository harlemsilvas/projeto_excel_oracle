// src/utils/exportExcel.js
import * as XLSX from "xlsx";

export function exportarParaExcel(dados, nomeArquivo = "dados") {
  if (!dados || dados.length === 0) {
    alert("Nenhum dado para exportar");
    return;
  }

  const ws = XLSX.utils.json_to_sheet(dados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Análise");

  const now = new Date().toISOString().split("T")[0];
  XLSX.writeFile(wb, `${nomeArquivo}_${now}.xlsx`);
}
