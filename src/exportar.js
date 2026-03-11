/**
 * EnfescalSol - Módulo de exportación
 * Genera informes en formato DOCX y ODT
 * Usa docx.js via CDN (cargado en index.html)
 */

// ─── DATOS DE ESCALAS (importados desde el componente principal) ──────────────
const COLORES_INTERPRETACION = {
  success: "2DC653",
  warning: "F4A261",
  danger:  "E63946",
  primary: "0077B6",
};

/**
 * Genera y descarga un informe DOCX del paciente
 * @param {Object} patient - Datos del paciente
 * @param {Object} escalasData - Definiciones de las escalas
 */
export async function exportarDOCX(patient, escalasData) {
  // docx.js debe estar cargado como UMD global via CDN
  const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
    ShadingType, VerticalAlign, PageNumber, PageBreak, LevelFormat,
  } = window.docx;

  const edad = patient.nacimiento
    ? new Date().getFullYear() - new Date(patient.nacimiento).getFullYear()
    : null;

  const hoy = new Date().toLocaleDateString("es-ES", {
    day: "2-digit", month: "long", year: "numeric"
  });

  const borderThin  = { style: BorderStyle.SINGLE, size: 4,  color: "CCDDEE" };
  const borderNone  = { style: BorderStyle.NONE,   size: 0,  color: "FFFFFF" };
  const borderBlue  = { style: BorderStyle.SINGLE, size: 12, color: "0077B6" };

  const bordersTable = {
    top: borderThin, bottom: borderThin, left: borderThin, right: borderThin,
    insideH: borderThin, insideV: borderThin
  };

  const cellMargin = { top: 80, bottom: 80, left: 120, right: 120 };

  // ── HELPERS ──────────────────────────────────────────────────────────────
  const txt = (text, opts = {}) => new TextRun({
    text: String(text ?? ""),
    font: "Calibri",
    size: opts.size || 20,
    bold: opts.bold || false,
    color: opts.color || "1A2B3C",
    italics: opts.italic || false,
  });

  const para = (children, opts = {}) => new Paragraph({
    alignment: opts.align || AlignmentType.LEFT,
    spacing: { before: opts.spaceBefore || 0, after: opts.spaceAfter || 80 },
    border: opts.borderBottom ? { bottom: borderBlue } : undefined,
    children: Array.isArray(children) ? children : [children],
  });

  const heading = (text, level = 1) => new Paragraph({
    heading: level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({
      text, font: "Calibri", bold: true,
      size: level === 1 ? 28 : 24,
      color: level === 1 ? "0077B6" : "005A8E",
    })],
  });

  const cell = (children, opts = {}) => new TableCell({
    borders: bordersTable,
    margins: cellMargin,
    width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    shading: opts.shade ? { fill: opts.shade, type: ShadingType.CLEAR } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    children: Array.isArray(children) ? children : [para(children)],
  });

  const row = (cells) => new TableRow({ children: cells });

  const tableWidth = 9026; // A4 con márgenes 1 pulgada

  // ── PORTADA Y DATOS DEL PACIENTE ─────────────────────────────────────────
  const seccionPaciente = [
    para([txt("🌞  EnfescalSol", { size: 32, bold: true, color: "0077B6" })],
      { align: AlignmentType.CENTER, spaceAfter: 60 }),
    para([txt("Informe de Valoraciones de Enfermería", { size: 22, italic: true, color: "5A7A8A" })],
      { align: AlignmentType.CENTER, spaceAfter: 200 }),

    heading("Datos del Paciente", 1),

    new Table({
      width: { size: tableWidth, type: WidthType.DXA },
      columnWidths: [2500, 3763, 2763],
      rows: [
        row([
          cell([para([txt("Nombre:", { bold: true, color: "0077B6" })])], { shade: "E8F4FD", width: 2500 }),
          cell([para([txt(patient.nombre, { bold: true, size: 22 })])], { width: 3763 }),
          cell([para([txt("Fecha del informe:", { bold: true, color: "0077B6" }), txt(`  ${hoy}`, { size: 18 })])], { width: 2763 }),
        ]),
        row([
          cell([para([txt("NHC:", { bold: true, color: "0077B6" })])], { shade: "E8F4FD", width: 2500 }),
          cell([para([txt(patient.nhc, { bold: true, size: 20 })])], { width: 3763 }),
          cell([para([txt("Edad:", { bold: true, color: "0077B6" }), txt(edad ? `  ${edad} años` : "  —")])], { width: 2763 }),
        ]),
        row([
          cell([para([txt("Centro:", { bold: true, color: "0077B6" })])], { shade: "E8F4FD", width: 2500 }),
          cell([para([txt(patient.centro || "—")])], { width: 3763 }),
          cell([para([txt("Sexo:", { bold: true, color: "0077B6" }), txt(`  ${patient.sexo || "—"}`)])], { width: 2763 }),
        ]),
      ]
    }),
    para([], { spaceBefore: 200 }),
  ];

  // ── RESUMEN DE ESCALAS ────────────────────────────────────────────────────
  const seccionResumen = [
    heading("Resumen de Valoraciones", 1),
    new Table({
      width: { size: tableWidth, type: WidthType.DXA },
      columnWidths: [3000, 1800, 2226, 2000],
      rows: [
        row([
          cell([para([txt("Escala", { bold: true, color: "FFFFFF" })])], { shade: "0077B6", width: 3000 }),
          cell([para([txt("Puntuación", { bold: true, color: "FFFFFF" })])], { shade: "0077B6", width: 1800 }),
          cell([para([txt("Interpretación", { bold: true, color: "FFFFFF" })])], { shade: "0077B6", width: 2226 }),
          cell([para([txt("Fecha", { bold: true, color: "FFFFFF" })])], { shade: "0077B6", width: 2000 }),
        ]),
        ...Object.values(escalasData).map((esc, i) => {
          const vList = patient.valoraciones?.[esc.id] || [];
          const last = vList[0];
          const interp = last ? esc.interpretacion(last.total) : null;
          const colorFondo = i % 2 === 0 ? "F0F7FF" : "FFFFFF";
          const total = last ? String(last.total) : "Sin valorar";
          const nivel = interp?.nivel || "—";
          const fecha = last ? new Date(last.fecha).toLocaleDateString("es-ES") : "—";

          return row([
            cell([para([txt(esc.icono + "  " + esc.nombre, { bold: !!last })])], { shade: colorFondo, width: 3000 }),
            cell([para([txt(total, { bold: !!last, size: 22, color: last ? esc.color.replace("#","") : "999999" })], { align: AlignmentType.CENTER })], { shade: colorFondo, width: 1800 }),
            cell([para([txt(nivel, { color: interp ? interp.color.replace("#","") : "999999", bold: !!last })])], { shade: colorFondo, width: 2226 }),
            cell([para([txt(fecha, { size: 18, color: "5A7A8A" })])], { shade: colorFondo, width: 2000 }),
          ]);
        }),
      ]
    }),
    para([], { spaceBefore: 200 }),
  ];

  // ── DETALLE POR ESCALA ────────────────────────────────────────────────────
  const seccionesDetalle = [];

  for (const esc of Object.values(escalasData)) {
    const vList = patient.valoraciones?.[esc.id] || [];
    if (vList.length === 0) continue;

    seccionesDetalle.push(heading(`${esc.icono}  ${esc.nombre}`, 1));
    seccionesDetalle.push(para([txt(esc.descripcion, { italic: true, color: "5A7A8A" })]));
    seccionesDetalle.push(para([], { spaceBefore: 80 }));

    // Últimas 3 valoraciones
    for (const [idx, val] of vList.slice(0, 3).entries()) {
      const interp = esc.interpretacion(val.total);
      const fechaStr = new Date(val.fecha).toLocaleDateString("es-ES", {
        day: "2-digit", month: "long", year: "numeric"
      });

      seccionesDetalle.push(heading(`Valoración ${idx + 1} — ${fechaStr}`, 2));

      // Tabla de respuestas
      seccionesDetalle.push(new Table({
        width: { size: tableWidth, type: WidthType.DXA },
        columnWidths: [5026, 2000, 2000],
        rows: [
          row([
            cell([para([txt("Ítem", { bold: true, color: "FFFFFF" })])], { shade: "005A8E", width: 5026 }),
            cell([para([txt("Respuesta", { bold: true, color: "FFFFFF" })], { align: AlignmentType.CENTER })], { shade: "005A8E", width: 2000 }),
            cell([para([txt("Puntos", { bold: true, color: "FFFFFF" })], { align: AlignmentType.CENTER })], { shade: "005A8E", width: 2000 }),
          ]),
          ...esc.items.map((item, ii) => {
            const respVal = val.respuestas[item.id];
            const opcion = item.opciones.find(o => o.valor === respVal);
            const colorFondo = ii % 2 === 0 ? "F8FBFF" : "FFFFFF";
            return row([
              cell([para([txt(item.label, { size: 19 })])], { shade: colorFondo, width: 5026 }),
              cell([para([txt(opcion?.texto || "—", { size: 18, italic: true })], { align: AlignmentType.CENTER })], { shade: colorFondo, width: 2000 }),
              cell([para([txt(String(respVal ?? "—"), { bold: true, size: 20 })], { align: AlignmentType.CENTER })], { shade: colorFondo, width: 2000 }),
            ]);
          }),
          row([
            cell([para([txt("PUNTUACIÓN TOTAL", { bold: true, size: 22, color: "0077B6" })])], { shade: "D6EAF8", width: 5026 }),
            cell([para([txt("")])], { shade: "D6EAF8", width: 2000 }),
            cell([para([txt(String(val.total), { bold: true, size: 26, color: esc.color.replace("#","") })], { align: AlignmentType.CENTER })], { shade: "D6EAF8", width: 2000 }),
          ]),
          row([
            cell([para([txt("INTERPRETACIÓN", { bold: true, color: "0077B6" })])], { shade: "D6EAF8", width: 5026 }),
            cell([
              para([txt(interp.nivel, { bold: true, size: 20, color: interp.color.replace("#","") })], { align: AlignmentType.CENTER })
            ], { shade: "D6EAF8", width: 4000 }),
          ]),
        ]
      }));
      seccionesDetalle.push(para([], { spaceBefore: 240 }));
    }
  }

  // ── FIRMA / PIE ───────────────────────────────────────────────────────────
  const seccionFirma = [
    para([], { spaceBefore: 400 }),
    para([txt("─".repeat(40), { color: "CCCCCC" })]),
    para([txt("Valoración realizada por: ___________________________", { color: "5A7A8A" })]),
    para([txt("Firma y sello: ", { color: "5A7A8A" })], { spaceAfter: 160 }),
    para([txt(`EnfescalSol · Hospital Universitario Costa del Sol · Servicio de Radiodiagnóstico`, { size: 16, color: "AAAAAA", italic: true })],
      { align: AlignmentType.CENTER }),
    para([txt(`Informe generado el ${hoy}`, { size: 16, color: "AAAAAA", italic: true })],
      { align: AlignmentType.CENTER }),
  ];

  // ── DOCUMENTO ─────────────────────────────────────────────────────────────
  const doc = new Document({
    creator: "EnfescalSol",
    title: `Informe de Valoraciones - ${patient.nombre}`,
    description: `NHC: ${patient.nhc} | ${hoy}`,
    styles: {
      default: { document: { run: { font: "Calibri", size: 20 } } },
      paragraphStyles: [
        {
          id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 28, bold: true, font: "Calibri", color: "0077B6" },
          paragraph: { spacing: { before: 300, after: 120 }, outlineLevel: 0 }
        },
        {
          id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 24, bold: true, font: "Calibri", color: "005A8E" },
          paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 1 }
        },
      ]
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 }, // A4
          margin: { top: 1440, right: 1134, bottom: 1440, left: 1134 }
        }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "0077B6", space: 1 } },
              spacing: { after: 120 },
              children: [
                new TextRun({ text: "🌞 EnfescalSol  |  ", font: "Calibri", size: 18, color: "0077B6", bold: true }),
                new TextRun({ text: `${patient.nombre}  ·  NHC: ${patient.nhc}`, font: "Calibri", size: 18, color: "5A7A8A" }),
              ]
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 1 } },
              spacing: { before: 80 },
              children: [
                new TextRun({ text: "Sistema Sanitario Público Andaluz · Atención Primaria  |  Página ", font: "Calibri", size: 16, color: "999999" }),
                new TextRun({ children: [PageNumber.CURRENT], font: "Calibri", size: 16, color: "999999" }),
                new TextRun({ text: " de ", font: "Calibri", size: 16, color: "999999" }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], font: "Calibri", size: 16, color: "999999" }),
              ]
            })
          ]
        })
      },
      children: [
        ...seccionPaciente,
        ...seccionResumen,
        new Paragraph({ children: [new PageBreak()] }),
        ...seccionesDetalle,
        ...seccionFirma,
      ]
    }]
  });

  // ── GENERAR Y DESCARGAR ───────────────────────────────────────────────────
  const buffer = await Packer.toBlob(doc);
  const url = URL.createObjectURL(buffer);
  const a = document.createElement("a");
  a.href = url;
  a.download = `EnfescalSol_${patient.nombre.replace(/\s+/g, "_")}_NHC${patient.nhc}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Genera y descarga un informe ODT (OpenDocument)
 * Usa la misma lógica pero genera XML ODT nativo en un ZIP
 * @param {Object} patient
 * @param {Object} escalasData
 */
export async function exportarODT(patient, escalasData) {
  const JSZip = window.JSZip;
  if (!JSZip) {
    alert("Error: JSZip no está cargado. Verifica la conexión.");
    return;
  }

  const hoy = new Date().toLocaleDateString("es-ES", {
    day: "2-digit", month: "long", year: "numeric"
  });

  const edad = patient.nacimiento
    ? new Date().getFullYear() - new Date(patient.nacimiento).getFullYear()
    : null;

  const esc = (str) => (str ?? "").toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  // ── CONTENT.XML ──────────────────────────────────────────────────────────
  let body = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content
  xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
  xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"
  xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
  xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  office:version="1.3">
<office:automatic-styles>
  <style:style style:name="tableHdr" style:family="table-cell">
    <style:table-cell-properties fo:background-color="#0077B6" fo:padding="0.1cm"/>
  </style:style>
  <style:style style:name="tableAlt" style:family="table-cell">
    <style:table-cell-properties fo:background-color="#F0F7FF" fo:padding="0.1cm"/>
  </style:style>
  <style:style style:name="tableNorm" style:family="table-cell">
    <style:table-cell-properties fo:background-color="#FFFFFF" fo:padding="0.1cm"/>
  </style:style>
  <style:style style:name="tableTotal" style:family="table-cell">
    <style:table-cell-properties fo:background-color="#D6EAF8" fo:padding="0.1cm"/>
  </style:style>
  <style:style style:name="P_normal" style:family="paragraph">
    <style:paragraph-properties fo:margin-bottom="0.2cm"/>
    <style:text-properties fo:font-size="11pt" fo:font-family="Calibri"/>
  </style:style>
  <style:style style:name="P_h1" style:family="paragraph" style:parent-style-name="P_normal">
    <style:paragraph-properties fo:margin-top="0.4cm" fo:margin-bottom="0.15cm"
      fo:border-bottom="0.05cm solid #0077B6" fo:padding-bottom="0.1cm"/>
    <style:text-properties fo:font-size="14pt" fo:font-weight="bold" fo:color="#0077B6" fo:font-family="Calibri"/>
  </style:style>
  <style:style style:name="P_h2" style:family="paragraph" style:parent-style-name="P_normal">
    <style:paragraph-properties fo:margin-top="0.3cm" fo:margin-bottom="0.1cm"/>
    <style:text-properties fo:font-size="12pt" fo:font-weight="bold" fo:color="#005A8E" fo:font-family="Calibri"/>
  </style:style>
  <style:style style:name="P_hdrBold" style:family="paragraph">
    <style:text-properties fo:color="#FFFFFF" fo:font-weight="bold" fo:font-family="Calibri" fo:font-size="11pt"/>
  </style:style>
</office:automatic-styles>
<office:body><office:text>

<text:p text:style-name="P_h1">🌞 EnfescalSol — Informe de Valoraciones de Enfermería</text:p>

<text:p text:style-name="P_h1">Datos del Paciente</text:p>
<table:table>
  <table:table-column table:number-columns-repeated="2"/>
  <table:table-row>
    <table:table-cell table:style-name="tableAlt"><text:p><text:span text:style-name="">Nombre: </text:span>${esc(patient.nombre)}</text:p></table:table-cell>
    <table:table-cell table:style-name="tableNorm"><text:p>NHC: ${esc(patient.nhc)}</text:p></table:table-cell>
  </table:table-row>
  <table:table-row>
    <table:table-cell table:style-name="tableAlt"><text:p>Centro: ${esc(patient.centro || "—")}</text:p></table:table-cell>
    <table:table-cell table:style-name="tableNorm"><text:p>Edad: ${edad ? `${edad} años` : "—"} | Sexo: ${esc(patient.sexo || "—")}</text:p></table:table-cell>
  </table:table-row>
  <table:table-row>
    <table:table-cell table:style-name="tableAlt"><text:p>Fecha del informe:</text:p></table:table-cell>
    <table:table-cell table:style-name="tableNorm"><text:p>${hoy}</text:p></table:table-cell>
  </table:table-row>
</table:table>

<text:p text:style-name="P_h1">Resumen de Valoraciones</text:p>
<table:table>
  <table:table-column table:number-columns-repeated="4"/>
  <table:table-row>
    <table:table-cell table:style-name="tableHdr"><text:p text:style-name="P_hdrBold">Escala</text:p></table:table-cell>
    <table:table-cell table:style-name="tableHdr"><text:p text:style-name="P_hdrBold">Puntuación</text:p></table:table-cell>
    <table:table-cell table:style-name="tableHdr"><text:p text:style-name="P_hdrBold">Interpretación</text:p></table:table-cell>
    <table:table-cell table:style-name="tableHdr"><text:p text:style-name="P_hdrBold">Fecha</text:p></table:table-cell>
  </table:table-row>
`;

  for (const [i, escalaObj] of Object.values(escalasData).entries()) {
    const vList = patient.valoraciones?.[escalaObj.id] || [];
    const last = vList[0];
    const interp = last ? escalaObj.interpretacion(last.total) : null;
    const cellStyle = i % 2 === 0 ? "tableAlt" : "tableNorm";
    body += `  <table:table-row>
    <table:table-cell table:style-name="${cellStyle}"><text:p>${esc(escalaObj.icono)} ${esc(escalaObj.nombre)}</text:p></table:table-cell>
    <table:table-cell table:style-name="${cellStyle}"><text:p>${last ? last.total : "Sin valorar"}</text:p></table:table-cell>
    <table:table-cell table:style-name="${cellStyle}"><text:p>${esc(interp?.nivel || "—")}</text:p></table:table-cell>
    <table:table-cell table:style-name="${cellStyle}"><text:p>${last ? new Date(last.fecha).toLocaleDateString("es-ES") : "—"}</text:p></table:table-cell>
  </table:table-row>\n`;
  }

  body += `</table:table>\n`;

  // Detalle por escala
  for (const escalaObj of Object.values(escalasData)) {
    const vList = patient.valoraciones?.[escalaObj.id] || [];
    if (vList.length === 0) continue;

    body += `<text:p text:style-name="P_h1">${esc(escalaObj.icono)} ${esc(escalaObj.nombre)}</text:p>\n`;
    body += `<text:p text:style-name="P_normal">${esc(escalaObj.descripcion)}</text:p>\n`;

    for (const [idx, val] of vList.slice(0, 3).entries()) {
      const interp = escalaObj.interpretacion(val.total);
      const fechaStr = new Date(val.fecha).toLocaleDateString("es-ES", {
        day: "2-digit", month: "long", year: "numeric"
      });

      body += `<text:p text:style-name="P_h2">Valoración ${idx + 1} — ${fechaStr}</text:p>\n`;
      body += `<table:table>
  <table:table-column table:number-columns-repeated="3"/>
  <table:table-row>
    <table:table-cell table:style-name="tableHdr"><text:p text:style-name="P_hdrBold">Ítem</text:p></table:table-cell>
    <table:table-cell table:style-name="tableHdr"><text:p text:style-name="P_hdrBold">Respuesta</text:p></table:table-cell>
    <table:table-cell table:style-name="tableHdr"><text:p text:style-name="P_hdrBold">Puntos</text:p></table:table-cell>
  </table:table-row>\n`;

      for (const [ii, item] of escalaObj.items.entries()) {
        const respVal = val.respuestas[item.id];
        const opcion = item.opciones.find(o => o.valor === respVal);
        const cs = ii % 2 === 0 ? "tableAlt" : "tableNorm";
        body += `  <table:table-row>
    <table:table-cell table:style-name="${cs}"><text:p>${esc(item.label)}</text:p></table:table-cell>
    <table:table-cell table:style-name="${cs}"><text:p>${esc(opcion?.texto || "—")}</text:p></table:table-cell>
    <table:table-cell table:style-name="${cs}"><text:p>${respVal ?? "—"}</text:p></table:table-cell>
  </table:table-row>\n`;
      }

      body += `  <table:table-row>
    <table:table-cell table:style-name="tableTotal" table:number-columns-spanned="2"><text:p>PUNTUACIÓN TOTAL: ${val.total} / ${escalaObj.maxPuntos}</text:p></table:table-cell>
    <table:table-cell table:style-name="tableTotal"><text:p>INTERPRETACIÓN: ${esc(interp.nivel)}</text:p></table:table-cell>
  </table:table-row>
</table:table>\n`;
    }
  }

  body += `
<text:p text:style-name="P_normal"> </text:p>
<text:p text:style-name="P_normal">Valoración realizada por: _____________________________</text:p>
<text:p text:style-name="P_normal">Firma y sello:</text:p>
<text:p text:style-name="P_normal"> </text:p>
<text:p text:style-name="P_normal">EnfescalSol · Sistema Sanitario Público Andaluz · ${hoy}</text:p>

</office:text></office:body></office:document-content>`;

  // ── MANIFEST.XML ─────────────────────────────────────────────────────────
  const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.3">
  <manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.text" manifest:version="1.3"/>
  <manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
  <manifest:file-entry manifest:full-path="styles.xml" manifest:media-type="text/xml"/>
  <manifest:file-entry manifest:full-path="meta.xml" manifest:media-type="text/xml"/>
</manifest:manifest>`;

  // ── STYLES.XML ────────────────────────────────────────────────────────────
  const styles = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-styles
  xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
  xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
  office:version="1.3">
<office:styles>
  <style:default-style style:family="paragraph">
    <style:text-properties fo:font-family="Calibri" fo:font-size="11pt" fo:language="es" fo:country="ES"/>
    <style:paragraph-properties fo:margin-bottom="0.2cm"/>
  </style:default-style>
  <style:style style:name="Standard" style:family="paragraph" style:class="text"/>
</office:styles>
<office:master-styles>
  <style:master-page style:name="Standard" style:page-layout-name="pm1">
    <style:header>
      <text:p xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0">EnfescalSol | ${esc(patient.nombre)} | NHC: ${esc(patient.nhc)}</text:p>
    </style:header>
    <style:footer>
      <text:p xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0">Sistema Sanitario Público Andaluz · Atención Primaria</text:p>
    </style:footer>
  </style:master-page>
</office:master-styles>
<office:automatic-styles>
  <style:page-layout style:name="pm1">
    <style:page-layout-properties fo:page-width="21cm" fo:page-height="29.7cm"
      fo:margin-top="2cm" fo:margin-bottom="2cm" fo:margin-left="2cm" fo:margin-right="2cm"/>
    <style:header-style><style:header-footer-properties fo:min-height="0.6cm"/></style:header-style>
    <style:footer-style><style:header-footer-properties fo:min-height="0.6cm"/></style:footer-style>
  </style:page-layout>
</office:automatic-styles>
</office:document-styles>`;

  // ── META.XML ──────────────────────────────────────────────────────────────
  const meta = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-meta
  xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  office:version="1.3">
<office:meta>
  <dc:title>Informe EnfescalSol - ${esc(patient.nombre)}</dc:title>
  <dc:subject>Valoraciones de Enfermería - NHC: ${esc(patient.nhc)}</dc:subject>
  <meta:creation-date>${new Date().toISOString()}</meta:creation-date>
  <meta:generator>EnfescalSol 1.0</meta:generator>
</office:meta>
</office:document-meta>`;

  // ── CONSTRUIR ZIP ODT ─────────────────────────────────────────────────────
  const zip = new JSZip();
  zip.file("mimetype", "application/vnd.oasis.opendocument.text", { compression: "STORE" });
  zip.folder("META-INF").file("manifest.xml", manifest);
  zip.file("content.xml", body);
  zip.file("styles.xml", styles);
  zip.file("meta.xml", meta);

  const blob = await zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.oasis.opendocument.text",
    compression: "DEFLATE",
    compressionOptions: { level: 6 }
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `EnfescalSol_${patient.nombre.replace(/\s+/g,"_")}_NHC${patient.nhc}.odt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
