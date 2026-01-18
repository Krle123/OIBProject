import PDFDocument from "pdfkit";
import { IPDFService } from "../Domain/services/IPDFService";
import { PerformanceReportDTO } from "../Domain/DTOs/PerformanceReportDTO";

export class PDFService implements IPDFService {
    // Helper function to safely convert any value to number
    private toNumber(value: any): number {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') return parseFloat(value) || 0;
        return 0;
    }

    // Convert Serbian characters to ASCII equivalents for PDF compatibility
    private toAscii(text: string): string {
        const map: { [key: string]: string } = {
            'č': 'c', 'Č': 'C',
            'ć': 'c', 'Ć': 'C',
            'ž': 'z', 'Ž': 'Z',
            'š': 's', 'Š': 'S',
            'đ': 'd', 'Đ': 'D'
        };
        return text.replace(/[čćžšđČĆŽŠĐ]/g, (char) => map[char] || char);
    }

    async generatePerformanceReportPDF(report: PerformanceReportDTO): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ size: 'A4', margin: 50 });
                const chunks: Buffer[] = [];

                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                // Header
                doc.fontSize(20).text(this.toAscii("O'Sinjel De Or Parfumerie"), { align: 'center' });
                doc.fontSize(16).text(this.toAscii('IZVESTAJ ANALIZE PERFORMANSI'), { align: 'center' });
                doc.moveDown();

                // Report details
                doc.fontSize(12).font('Helvetica-Bold');
                doc.text(this.toAscii(report.title));
                doc.moveDown();

                doc.fontSize(10).font('Helvetica');
                doc.text(this.toAscii(`Tip algoritma: ${this.getAlgorithmName(report.algorithmType)}`));
                doc.text(this.toAscii(`Datum kreiranja: ${this.formatDate(new Date(report.createdAt))}`));
                if (report.createdBy) {
                    doc.text(this.toAscii(`Kreirao korisnik ID: ${report.createdBy}`));
                }
                doc.moveDown();

                // Metrics section
                doc.fontSize(11).font('Helvetica-Bold').text(this.toAscii('Metrije Performansi:'));
                doc.fontSize(10).font('Helvetica');
                doc.text(this.toAscii(`Procesirano paketa: ${report.packagesProcessed || 0}`));
                doc.text(this.toAscii(`Ukupno vreme simulacije: ${this.toNumber(report.totalSimulationTime).toFixed(2)} sekundi`));
                doc.text(this.toAscii(`Prosecno vreme po paketu: ${this.toNumber(report.averageProcessingTime).toFixed(2)} sekundi`));
                
                if (report.efficiencyMetrics) {
                    doc.moveDown();
                    doc.fontSize(11).font('Helvetica-Bold').text(this.toAscii('Detaljne Metrije:'));
                    doc.fontSize(10).font('Helvetica');
                    const efficiency = this.toNumber((report.efficiencyMetrics as any).efficiency);
                    const throughput = this.toNumber((report.efficiencyMetrics as any).throughput);
                    if (efficiency > 0) {
                        doc.text(this.toAscii(`Efikasnost: ${efficiency.toFixed(2)}%`));
                    }
                    if (throughput > 0) {
                        doc.text(this.toAscii(`Throughput: ${throughput.toFixed(2)} paketa/sekundi`));
                    }
                }

                doc.moveDown(2);

                // Simulation data
                if (report.simulationData) {
                    doc.fontSize(11).font('Helvetica-Bold').text(this.toAscii('Podaci Simulacije:'));
                    doc.fontSize(10).font('Helvetica');
                    doc.text(this.toAscii(`Broj paketa: ${report.simulationData.numberOfPackages || 'N/A'}`));
                    doc.text(this.toAscii(`Vreme simulacije: ${report.simulationData.timestamp ? this.formatDate(new Date(report.simulationData.timestamp)) : 'N/A'}`));
                    doc.moveDown();
                }

                // Conclusions
                if (report.conclusions) {
                    doc.fontSize(11).font('Helvetica-Bold').text(this.toAscii('Zakljucci i Preporuke:'));
                    doc.fontSize(10).font('Helvetica');
                    const conclusions = report.conclusions.split('\n');
                    conclusions.forEach(line => {
                        if (line.trim()) {
                            doc.text(this.toAscii(line));
                        }
                    });
                }

                doc.moveDown(2);
                doc.fontSize(8);
                doc.text(this.toAscii(`Broj izvestaja: ${report.id}`), { align: 'center' });
                doc.text(this.toAscii("O'Sinjel De Or Parfumerie - Sistem za analizu performansi"), { align: 'center' });

                doc.end();
            } catch (error: any) {
                console.error("PDF Generation Error:", error.message);
                reject(error);
            }
        });
    }

    private getAlgorithmName(algorithmType: string): string {
        switch (algorithmType) {
            case 'DISTRIBUTIVE_CENTER':
                return 'Distributivni Centar Skladista';
            case 'WAREHOUSE_CENTER':
                return 'Magacinski Centar Skladista';
            default:
                return algorithmType;
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
}
