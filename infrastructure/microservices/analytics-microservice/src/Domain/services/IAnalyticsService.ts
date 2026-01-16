import { AnalysisReportDTO } from "../DTOs/AnalysisReportDTO";
import { AnalysisType } from "../enums/AnalysisType";

export interface IAnalyticsService {
    // Sales analysis by period
    calculateSalesByMonth(month: number, year: number, userId?: number): Promise<AnalysisReportDTO>;
    calculateSalesByWeek(weekNumber: number, year: number, userId?: number): Promise<AnalysisReportDTO>;
    calculateSalesByYear(year: number, userId?: number): Promise<AnalysisReportDTO>;
    calculateTotalSales(userId?: number): Promise<AnalysisReportDTO>;

    // Trend analysis
    analyzeSalesTrend(startDate: Date, endDate: Date, userId?: number): Promise<AnalysisReportDTO>;

    // Top performers
    getTop10BestSellingPerfumes(userId?: number): Promise<AnalysisReportDTO>;
    getTop10RevenueByPerfume(userId?: number): Promise<AnalysisReportDTO>;

    // Report management
    getAllReports(): Promise<AnalysisReportDTO[]>;
    getReportById(id: number): Promise<AnalysisReportDTO | null>;
    getReportsByType(type: AnalysisType): Promise<AnalysisReportDTO[]>;
}
