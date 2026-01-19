import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export async function exportCasosExcel(
    casos: any[],
    division: string,
    estado: string,
    logoBase64: string
) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Listado de Casos");

    const imageId = workbook.addImage({
        base64: logoBase64,
        extension: "png",
    });

    sheet.addImage(imageId, {
        tl: { col: 0, row: 0 },
        ext: { width: 100, height: 100 },
    });

    sheet.mergeCells("A1", "A4");

    const headerCell = sheet.getCell("B1");
    headerCell.value = `Listado de Casos - División ${division}`;
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
        "Caso",
        "Estado",
        "Urgencia",
        "Impacto",
        "Tienda",
        "Tipo Solicitud",
        "Categoría",
        "Subcategoría",
        "Mensaje",
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
        { key: "correlativo", width: 15 },
        { key: "estado", width: 15 },
        { key: "urgencia", width: 15 },
        { key: "impacto", width: 18 },
        { key: "tienda_nombre", width: 30 },
        { key: "tipo_solicitud", width: 25 },
        { key: "categoria", width: 20 },
        { key: "subcategoria", width: 25 },
        { key: "mensaje", width: 100 },
    ];

    casos.forEach((c, i) => {
        sheet.getRow(headerRowIndex + 1 + i).values = [
            c.correlativo,
            c.estado,
            c.urgencia,
            c.impacto,
            c.tienda_nombre,
            c.tipo_solicitud,
            c.categoria,
            c.subcategoria,
            c.mensaje,
        ];
    });

    const buffer = await workbook.xlsx.writeBuffer();

    saveAs(
        new Blob([buffer]),
            `Casos_Division${division}_${estado}_${new Date()
            .toISOString()
            .slice(0, 10)}.xlsx`
    );
}