import { AnalysisReportDTO } from "../../models/analysis/AnalysisReportDTO";
import { FiscalReceiptDTO } from "../../models/analysis/FiscalReceiptDTO";

export interface IAnalyticsAPI {
    getSalesByMonth(token: string, month: number, year: number): Promise<AnalysisReportDTO>;
    getSalesByWeek(token: string, week: number, year: number): Promise<AnalysisReportDTO>;
    getSalesByYear(token: string, year: number): Promise<AnalysisReportDTO>;
    getTotalSales(token: string): Promise<AnalysisReportDTO>;
    getSalesTrend(token: string, startDate: string, endDate: string): Promise<AnalysisReportDTO>;
    getTop10BestSelling(token: string): Promise<AnalysisReportDTO>;
    getTop10Revenue(token: string): Promise<AnalysisReportDTO>;
    getAllReports(token: string): Promise<AnalysisReportDTO[]>;
    getReportById(token: string, id: number): Promise<AnalysisReportDTO>;
    downloadReportPDF(token: string, id: number): Promise<Blob>;
    getReceipts(token: string): Promise<FiscalReceiptDTO[]>;
    downloadReceiptPDF(token: string, id: number): Promise<Blob>;
    getReceiptById(token: string, id: number): Promise<FiscalReceiptDTO>;
}
