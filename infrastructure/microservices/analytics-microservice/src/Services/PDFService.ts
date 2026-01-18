import PDFDocument from "pdfkit";
import { IPDFService } from "../Domain/services/IPDFService";
import { FiscalReceiptDTO } from "../Domain/DTOs/FiscalReceiptDTO";
import { AnalysisReportDTO } from "../Domain/DTOs/AnalysisReportDTO";

export class PDFService implements IPDFService {
    async generateFiscalReceiptPDF(receipt: FiscalReceiptDTO): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ size: 'A4', margin: 50 });
                const chunks: Buffer[] = [];

                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                // Header
                doc.fontSize(20).text("O'Sinjel De Or Parfumerie", { align: 'center' });
                doc.fontSize(16).text('FISKALNI RACUN', { align: 'center' });
                doc.moveDown();

                // Receipt details
                doc.fontSize(10);
                doc.text(`Broj racuna: ${receipt.receiptNumber}`);
                doc.text(`Datum: ${this.formatDate(new Date(receipt.saleDate))}`);
                doc.text(`Tip prodaje: ${receipt.saleType === 'RETAIL' ? 'Maloprodaja' : 'Veleprodaja'}`);
                doc.text(`Nacin placanja: ${this.getPaymentMethodText(receipt.paymentMethod)}`);
                if (receipt.sellerId) {
                    doc.text(`ID prodavca: ${receipt.sellerId}`);
                }
                doc.moveDown();

                // Line separator
                doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
                doc.moveDown();

                // Table header
                doc.fontSize(10).font('Helvetica-Bold');
                doc.text('Parfem', 50, doc.y, { width: 200, continued: true });
                doc.text('Kol.', 250, doc.y, { width: 50, continued: true });
                doc.text('Cena', 300, doc.y, { width: 100, continued: true });
                doc.text('Ukupno', 400, doc.y, { width: 100 });
                doc.moveDown();

                doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
                doc.moveDown(0.5);

                // Items
                doc.font('Helvetica');
                receipt.soldPerfumes.forEach((perfume) => {
                    const total = perfume.quantity * Number(perfume.pricePerUnit);
                    doc.text(perfume.name, 50, doc.y, { width: 200, continued: true });
                    doc.text(perfume.quantity.toString(), 250, doc.y, { width: 50, continued: true });
                    doc.text(`${Number(perfume.pricePerUnit).toFixed(2)} RSD`, 300, doc.y, { width: 100, continued: true });
                    doc.text(`${total.toFixed(2)} RSD`, 400, doc.y, { width: 100 });
                    doc.moveDown();
                });

                doc.moveDown();
                doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
                doc.moveDown();

                // Total
                doc.fontSize(12).font('Helvetica-Bold');
                doc.text(`UKUPNO: ${Number(receipt.totalAmount).toFixed(2)} RSD`, { align: 'right' });

                doc.moveDown(2);
                doc.fontSize(8).font('Helvetica');
                doc.text('Hvala na kupovini!', { align: 'center' });
                doc.text("O'Sinjel De Or Parfumerie - Vasa parfimerija", { align: 'center' });

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    async generateAnalysisReportPDF(report: AnalysisReportDTO): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ size: 'A4', margin: 50 });
                const chunks: Buffer[] = [];

                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                // Header
                doc.fontSize(20).text("O'Sinjel De Or Parfumerie", { align: 'center' });
                doc.fontSize(16).text('IZVESTAJ ANALIZE', { align: 'center' });
                doc.moveDown();

                // Report details
                doc.fontSize(12).font('Helvetica-Bold');
                doc.text(report.title);
                doc.moveDown();

                doc.fontSize(10).font('Helvetica');
                if (report.description) {
                    doc.text(report.description);
                    doc.moveDown();
                }

                doc.text(`Datum kreiranja: ${this.formatDate(new Date(report.createdAt))}`);
                if (report.periodStart && report.periodEnd) {
                    doc.text(`Period: ${this.formatDateShort(new Date(report.periodStart))} - ${this.formatDateShort(new Date(report.periodEnd))}`);
                }
                doc.moveDown(2);

                // Data section based on analysis type
                this.renderAnalysisData(doc, report);

                doc.moveDown(2);
                doc.fontSize(8);
                doc.text(`Broj izvestaja: ${report.id}`, { align: 'center' });
                doc.text("O'Sinjel De Or Parfumerie - Sistem za analizu podataka", { align: 'center' });

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    private renderAnalysisData(doc: PDFKit.PDFDocument, report: AnalysisReportDTO): void {
        const data = report.data;

        switch (report.analysisType) {
            case 'SALES_BY_MONTH':
            case 'SALES_BY_WEEK':
            case 'SALES_BY_YEAR':
                doc.fontSize(11).font('Helvetica-Bold').text('Rezultati:');
                doc.fontSize(10).font('Helvetica');
                doc.text(`Ukupna prodaja: ${data.totalSales} RSD`);
                doc.text(`Broj transakcija: ${data.totalTransactions}`);
                if (data.averageTransaction) {
                    doc.text(`Prosecna transakcija: ${data.averageTransaction} RSD`);
                }
                break;

            case 'TOTAL_SALES':
                doc.fontSize(11).font('Helvetica-Bold').text('Ukupni rezultati:');
                doc.fontSize(10).font('Helvetica');
                doc.text(`Ukupna prodaja: ${data.totalSales} RSD`);
                doc.text(`Ukupan broj transakcija: ${data.totalTransactions}`);
                doc.text(`Prosecna vrednost transakcije: ${data.averageTransaction} RSD`);
                break;

            case 'TOP_10_PERFUMES':
                doc.fontSize(11).font('Helvetica-Bold').text('Top 10 najprodavanijih parfema:');
                doc.moveDown();
                data.top10Perfumes.forEach((perfume: any) => {
                    doc.fontSize(10).font('Helvetica');
                    doc.text(`${perfume.rank}. ${perfume.name} (${perfume.serialNumber})`);
                    doc.text(`   Prodato: ${perfume.totalQuantitySold} komada`);
                    doc.moveDown(0.5);
                });
                break;

            case 'TOP_10_REVENUE':
                doc.fontSize(11).font('Helvetica-Bold').text('Top 10 parfema po prihodu:');
                doc.moveDown();
                data.top10ByRevenue.forEach((perfume: any) => {
                    doc.fontSize(10).font('Helvetica');
                    doc.text(`${perfume.rank}. ${perfume.name} (${perfume.serialNumber})`);
                    doc.text(`   Prihod: ${perfume.totalRevenue} RSD | Prodato: ${perfume.quantitySold} komada`);
                    doc.moveDown(0.5);
                });
                doc.moveDown();
                doc.font('Helvetica-Bold').text(`Ukupan prihod top 10: ${data.totalRevenueFromTop10} RSD`);
                break;

            case 'SALES_TREND':
                doc.fontSize(11).font('Helvetica-Bold').text('Analiza trenda prodaje:');
                doc.fontSize(10).font('Helvetica');
                doc.text(`Ukupna prodaja: ${data.totalSales} RSD`);
                doc.text(`Prosecna dnevna prodaja: ${data.averageDailySales} RSD`);
                break;

            default:
                doc.fontSize(10).font('Helvetica');
                doc.text(JSON.stringify(data, null, 2));
        }
    }

    private getPaymentMethodText(method: string): string {
        switch (method) {
            case 'CASH': return 'Gotovina';
            case 'CARD': return 'Kartica';
            case 'MIXED': return 'Mesovito';
            default: return method;
        }
    }

    private formatDate(date: Date): string {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${day}.${month}.${year}. ${hours}:${minutes}:${seconds}`;
    }

    private formatDateShort(date: Date): string {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}.`;
    }
}
