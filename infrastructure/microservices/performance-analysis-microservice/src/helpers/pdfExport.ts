import { Response } from "express";
import { PerformanceReportDTO } from "../Domain/DTOs/PerformanceReportDTO";
import PDFDocument from "pdfkit";

export function exportReportToPDF(res: Response, report: PerformanceReportDTO) {
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=performance_report_${report.id || 'new'}.pdf`);
    doc.pipe(res);

    doc.fontSize(18).text('Izvestaj o performansama', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Algoritam: ${report.algorithm}`);
    doc.text(`Efikasnost: ${report.efficiency.toFixed(2)}%`);
    doc.text(`Datum: ${report.createdAt ? new Date(report.createdAt).toLocaleString('sr-RS') : ''}`);
    doc.moveDown();
    doc.text('Zakljucci:', { underline: true });
    doc.text(report.conclusions);

    doc.end();
}
