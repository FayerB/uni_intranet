const svc = require('./reportes.service');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const wrap = (fn) => async (req, res, next) => {
  try { await fn(req, res, next); } catch (e) { next(e); }
};

const getResumen = wrap(async (_req, res) => {
  res.json(await svc.getResumen());
});

const exportarExcel = wrap(async (_req, res) => {
  const data = await svc.getResumen();
  const wb   = new ExcelJS.Workbook();

  const addSheet = (name, columns, rows) => {
    const ws = wb.addWorksheet(name);
    ws.columns = columns;
    ws.getRow(1).font = { bold: true };
    rows.forEach((r) => ws.addRow(r));
  };

  addSheet('Usuarios', [
    { header: 'Rol',      key: 'rol',       width: 14 },
    { header: 'Total',    key: 'total',     width: 10 },
    { header: 'Activos',  key: 'activos',   width: 10 },
    { header: 'Inactivos',key: 'inactivos', width: 10 },
  ], data.usuarios);

  addSheet('Noticias', [
    { header: 'Categoría',   key: 'categoria',  width: 20 },
    { header: 'Total',       key: 'total',      width: 10 },
    { header: 'Publicadas',  key: 'publicadas', width: 12 },
    { header: 'Ocultas',     key: 'ocultas',    width: 10 },
  ], data.noticias);

  addSheet('Cursos', [
    { header: 'Tipo',         key: 'tipo',               width: 16 },
    { header: 'Total',        key: 'total',              width: 10 },
    { header: 'Activos',      key: 'activos',            width: 10 },
    { header: 'Matriculados', key: 'total_matriculados', width: 14 },
  ], data.cursos);

  addSheet('Matrículas', [
    { header: 'Estado', key: 'estado', width: 14 },
    { header: 'Total',  key: 'total',  width: 10 },
  ], data.matriculas);

  addSheet('Notas', [
    { header: 'Estado',   key: 'estado',       width: 14 },
    { header: 'Total',    key: 'total',        width: 10 },
    { header: 'Promedio', key: 'promedio_nota', width: 12 },
  ], data.notas);

  addSheet('Asistencia', [
    { header: 'Estado', key: 'estado', width: 12 },
    { header: 'Total',  key: 'total',  width: 10 },
  ], data.asistencia);

  addSheet('Tareas', [
    { header: 'Estado', key: 'estado', width: 14 },
    { header: 'Total',  key: 'total',  width: 10 },
  ], data.tareas);

  addSheet('Pagos', [
    { header: 'Estado',      key: 'estado',      width: 12 },
    { header: 'Total',       key: 'total',       width: 10 },
    { header: 'Monto Total', key: 'monto_total', width: 14 },
  ], data.pagos);

  addSheet('Soporte', [
    { header: 'Estado',         key: 'estado',          width: 14 },
    { header: 'Total',          key: 'total',           width: 10 },
    { header: 'Urgentes',       key: 'urgentes',        width: 10 },
    { header: 'Alta Prioridad', key: 'alta_prioridad',  width: 14 },
  ], data.soporte);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="reporte-sistema.xlsx"');
  await wb.xlsx.write(res);
  res.end();
});

const exportarPDF = wrap(async (_req, res) => {
  const data = await svc.getResumen();
  const doc  = new PDFDocument({ margin: 50, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="reporte-sistema.pdf"');
  doc.pipe(res);

  const titulo = (txt) => {
    doc.moveDown(0.5)
       .fontSize(13).fillColor('#1e3a8a').font('Helvetica-Bold').text(txt)
       .moveDown(0.3).fillColor('#000000').font('Helvetica').fontSize(10);
  };

  const tabla = (headers, rows, keys) => {
    const colW = (doc.page.width - 100) / headers.length;
    const y0   = doc.y;
    doc.font('Helvetica-Bold');
    headers.forEach((h, i) => doc.text(h, 50 + i * colW, y0, { width: colW, align: 'left' }));
    doc.moveDown(0.5).font('Helvetica');
    rows.forEach((row) => {
      const y = doc.y;
      keys.forEach((k, i) => doc.text(String(row[k] ?? '-'), 50 + i * colW, y, { width: colW, align: 'left' }));
      doc.moveDown(0.4);
    });
  };

  doc.fontSize(18).font('Helvetica-Bold').fillColor('#1e3a8a')
     .text('Reporte del Sistema', { align: 'center' });
  doc.fontSize(10).font('Helvetica').fillColor('#555')
     .text(`Generado el ${new Date().toLocaleString('es-PE')}`, { align: 'center' });
  doc.moveDown();

  titulo('Usuarios por Rol');
  tabla(['Rol', 'Total', 'Activos', 'Inactivos'], data.usuarios, ['rol', 'total', 'activos', 'inactivos']);

  titulo('Noticias por Categoría');
  tabla(['Categoría', 'Total', 'Publicadas', 'Ocultas'], data.noticias, ['categoria', 'total', 'publicadas', 'ocultas']);

  titulo('Cursos por Tipo');
  tabla(['Tipo', 'Total', 'Activos', 'Matriculados'], data.cursos, ['tipo', 'total', 'activos', 'total_matriculados']);

  titulo('Matrículas por Estado');
  tabla(['Estado', 'Total'], data.matriculas, ['estado', 'total']);

  titulo('Notas');
  tabla(['Estado', 'Total', 'Promedio'], data.notas, ['estado', 'total', 'promedio_nota']);

  titulo('Asistencia');
  tabla(['Estado', 'Total'], data.asistencia, ['estado', 'total']);

  titulo('Tareas y Entregas');
  tabla(['Estado', 'Total'], data.tareas, ['estado', 'total']);

  titulo('Pagos');
  tabla(['Estado', 'Total', 'Monto Total S/.'], data.pagos, ['estado', 'total', 'monto_total']);

  titulo('Soporte / Tickets');
  tabla(['Estado', 'Total', 'Urgentes', 'Alta Prioridad'], data.soporte, ['estado', 'total', 'urgentes', 'alta_prioridad']);

  doc.end();
});

module.exports = { getResumen, exportarExcel, exportarPDF };
