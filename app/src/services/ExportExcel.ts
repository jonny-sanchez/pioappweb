
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export async function exportVisitasExcel(
  visitas: any[],
  supervisorName: string,
  fechaInicio: string,
  fechaFin: string,
  logoBase64: string
) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Historial de Visitas");

  const imageId = workbook.addImage({
    base64: logoBase64,
    extension: "png",
  });
  sheet.addImage(imageId, {
    tl: { col: 0, row: 0 },
    ext: { width: 150, height: 100 },
  });
  sheet.mergeCells("A1", "A5");

  const headerCell = sheet.getCell("B1");
  headerCell.value = `Historial de visitas para el supervisor: ${supervisorName}`;
  headerCell.font = { size: 16, bold: true };
  headerCell.alignment = { vertical: "middle", horizontal: "left" };

  sheet.getCell("B3").value = `Fecha Inicio: ${fechaInicio}`;
  sheet.getCell("B4").value = `Fecha Fin: ${fechaFin}`;
  sheet.getCell("B3").font = { bold: true };
  sheet.getCell("B4").font = { bold: true };

  sheet.addRow([]);
  sheet.addRow([]);

  const headerRowIndex = 7;

  const headers = ["Tienda", "Dirección", "Fecha", "Comentarios"];
  sheet.getRow(headerRowIndex).values = headers;

  headers.forEach((_, colIndex) => {
    const cell = sheet.getCell(headerRowIndex, colIndex + 1);
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF000000" },
    };
    cell.alignment = { horizontal: "center" };
  });

  sheet.columns = [
    { key: "nombre_tienda", width: 25 },
    { key: "direccion_tienda", width: 50 },
    { key: "fecha_hora_visita", width: 20 },
    { key: "comentario_visita", width: 40 },
  ];

  visitas.forEach((v, i) => {
    sheet.getRow(headerRowIndex + 1 + i).values = [
      v.nombre_tienda,
      v.direccion_tienda,
      v.fecha_hora_visita,
      v.comentario_visita,
    ];
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `Visitas_${supervisorName}_${fechaInicio}_${fechaFin}.xlsx`);
}
