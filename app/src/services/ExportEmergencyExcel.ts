import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { VwDetalleVisitaEmergencia } from "../types/VisitaEmergencia";

export async function exportVisitasEmergenciaExcel(
    visitas: VwDetalleVisitaEmergencia[],
    division: string,
    estado: string,
    logoBase64: string
) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Visitas de Emergencia");
    const imageId = workbook.addImage({
      base64: logoBase64,
      extension: "png",
    });

    sheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      ext: { width: 100, height: 100 },
    });

    sheet.mergeCells("A1", "A4");

    const rows = 5;
    const rowHeight = 100 / rows;
    for (let i = 1; i <= rows; i++) {
      sheet.getRow(i).height = rowHeight;
    }

    const headerCell = sheet.getCell("B1");
    headerCell.value = `Visitas de Emergencia - División ${division}`;
    headerCell.font = { size: 16, bold: true };
    headerCell.alignment = { vertical: "middle", horizontal: "left" };

    sheet.getCell("B3").value = `Estado: ${estado === "all" ? "Todos" : estado}`;
    sheet.getCell("B3").font = { bold: true };

    sheet.getCell("B4").value = `Fecha de Exportación: ${new Date().toLocaleDateString()}`;
    sheet.getCell("B4").font = { bold: true };

    sheet.addRow([]);
    sheet.addRow([]);

    const headerRowIndex = 7;

    const headers = [
        "ID Visita",
        "Estado",
        "Supervisor",
        "Tienda",
        "Tipo Visita",
        "Fecha Programada",
        "Comentario",
    ];

    sheet.getRow(headerRowIndex).values = headers;

    headers.forEach((_, colIndex) => {
        const cell = sheet.getCell(headerRowIndex, colIndex + 1);
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF000000" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
    });

    sheet.columns = [
        { key: "id_visita", width: 15 },
        { key: "estado", width: 15 },
        { key: "nombre_user_asignado", width: 30 },
        { key: "tienda_nombre", width: 30 },
        { key: "tipo_visita", width: 20 },
        { key: "fecha_programacion", width: 25 },
        { key: "comentario", width: 60 },
    ];

    visitas.forEach((v, i) => {
        sheet.getRow(headerRowIndex + 1 + i).values = [
            v.id_visita,
            v.estado,
            v.nombre_user_asignado,
            v.tienda_nombre,
            v.tipo_visita,
            v.fecha_programacion
            ? new Date(v.fecha_programacion).toLocaleString() : "No programada",
            v.comentario,
        ];
    });

    const buffer = await workbook.xlsx.writeBuffer();

    saveAs(
      new Blob([buffer]),
      `VisitasEmergencia_Division${division}_${estado}_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`
    );
}