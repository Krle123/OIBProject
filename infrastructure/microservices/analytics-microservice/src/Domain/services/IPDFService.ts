import { FiscalReceiptDTO } from "../DTOs/FiscalReceiptDTO";
import { AnalysisReportDTO } from "../DTOs/AnalysisReportDTO";

export interface IPDFService {
    generateFiscalReceiptPDF(receipt: FiscalReceiptDTO): Promise<Buffer>;
    generateAnalysisReportPDF(report: AnalysisReportDTO): Promise<Buffer>;
}
