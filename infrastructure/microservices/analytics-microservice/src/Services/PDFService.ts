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
                doc.fontSize(16).text('ФИСКАЛНИ РАЧУН', { align: 'center' });
                doc.moveDown();

                // Receipt details
                doc.fontSize(10);
                doc.text(`Број рачуна: ${receipt.receiptNumber}`);
                doc.text(`Датум: ${new Date(receipt.saleDate).toLocaleString('sr-RS')}`);
                doc.text(`Тип продаје: ${receipt.saleType === 'RETAIL' ? 'Мало' : 'Велико'}`);
                doc.text(`Начин плаћања: ${this.getPaymentMethodText(receipt.paymentMethod)}`);
                if (receipt.sellerId) {
                    doc.text(`ID продавца: ${receipt.sellerId}`);
                }
                doc.moveDown();

                // Line separator
                doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
                doc.moveDown();

                // Table header
                doc.fontSize(10).font('Helvetica-Bold');
                doc.text('Парфем', 50, doc.y, { width: 200, continued: true });
                doc.text('Кол.', 250, doc.y, { width: 50, continued: true });
                doc.text('Цена', 300, doc.y, { width: 100, continued: true });
                doc.text('Укупно', 400, doc.y, { width: 100 });
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
                doc.text(`УКУПНО: ${Number(receipt.totalAmount).toFixed(2)} RSD`, { align: 'right' });

                doc.moveDown(2);
                doc.fontSize(8).font('Helvetica');
                doc.text('Хвала на куповини!', { align: 'center' });
                doc.text("O'Sinjel De Or Parfumerie - Ваша парфимерија", { align: 'center' });

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
                doc.fontSize(16).text('ИЗВЕШТАЈ АНАЛИЗЕ', { align: 'center' });
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

                doc.text(`Датум креирања: ${new Date(report.createdAt).toLocaleString('sr-RS')}`);
                if (report.periodStart && report.periodEnd) {
                    doc.text(`Период: ${new Date(report.periodStart).toLocaleDateString('sr-RS')} - ${new Date(report.periodEnd).toLocaleDateString('sr-RS')}`);
                }
                doc.moveDown(2);

                // Data section based on analysis type
                this.renderAnalysisData(doc, report);

                doc.moveDown(2);
                doc.fontSize(8);
                doc.text(`Број извештаја: ${report.id}`, { align: 'center' });
                doc.text("O'Sinjel De Or Parfumerie - Систем за анализу података", { align: 'center' });

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
                doc.fontSize(11).font('Helvetica-Bold').text('Резултати:');
                doc.fontSize(10).font('Helvetica');
                doc.text(`Укупна продаја: ${data.totalSales} RSD`);
                doc.text(`Број трансакција: ${data.totalTransactions}`);
                if (data.averageTransaction) {
                    doc.text(`Просечна трансакција: ${data.averageTransaction} RSD`);
                }
                break;

            case 'TOTAL_SALES':
                doc.fontSize(11).font('Helvetica-Bold').text('Укупни резултати:');
                doc.fontSize(10).font('Helvetica');
                doc.text(`Укупна продаја: ${data.totalSales} RSD`);
                doc.text(`Укупан број трансакција: ${data.totalTransactions}`);
                doc.text(`Просечна вредност трансакције: ${data.averageTransaction} RSD`);
                break;

            case 'TOP_10_PERFUMES':
                doc.fontSize(11).font('Helvetica-Bold').text('Топ 10 најпродаванијих парфема:');
                doc.moveDown();
                data.top10Perfumes.forEach((perfume: any) => {
                    doc.fontSize(10).font('Helvetica');
                    doc.text(`${perfume.rank}. ${perfume.name} (${perfume.serialNumber})`);
                    doc.text(`   Продато: ${perfume.totalQuantitySold} комада`);
                    doc.moveDown(0.5);
                });
                break;

            case 'TOP_10_REVENUE':
                doc.fontSize(11).font('Helvetica-Bold').text('Топ 10 парфема по приходу:');
                doc.moveDown();
                data.top10ByRevenue.forEach((perfume: any) => {
                    doc.fontSize(10).font('Helvetica');
                    doc.text(`${perfume.rank}. ${perfume.name} (${perfume.serialNumber})`);
                    doc.text(`   Приход: ${perfume.totalRevenue} RSD | Продато: ${perfume.quantitySold} комада`);
                    doc.moveDown(0.5);
                });
                doc.moveDown();
                doc.font('Helvetica-Bold').text(`Укупан приход топ 10: ${data.totalRevenueFromTop10} RSD`);
                break;

            case 'SALES_TREND':
                doc.fontSize(11).font('Helvetica-Bold').text('Анализа тренда продаје:');
                doc.fontSize(10).font('Helvetica');
                doc.text(`Укупна продаја: ${data.totalSales} RSD`);
                doc.text(`Просечна дневна продаја: ${data.averageDailySales} RSD`);
                break;

            default:
                doc.fontSize(10).font('Helvetica');
                doc.text(JSON.stringify(data, null, 2));
        }
    }

    private getPaymentMethodText(method: string): string {
        switch (method) {
            case 'CASH': return 'Готовина';
            case 'CARD': return 'Картица';
            case 'MIXED': return 'Мешовито';
            default: return method;
        }
    }
}
