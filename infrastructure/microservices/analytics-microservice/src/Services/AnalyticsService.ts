import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from "typeorm";
import { FiscalReceipt } from "../Domain/models/FiscalReceipt";
import { AnalysisReport } from "../Domain/models/AnalysisReport";
import { AnalysisReportDTO } from "../Domain/DTOs/AnalysisReportDTO";
import { IAnalyticsService } from "../Domain/services/IAnalyticsService";
import { ICommunicationService } from "../Domain/services/ICommunicationService";
import { AnalysisType } from "../Domain/enums/AnalysisType";

export class AnalyticsService implements IAnalyticsService {
    constructor(
        private readonly receiptRepository: Repository<FiscalReceipt>,
        private readonly reportRepository: Repository<AnalysisReport>,
        private readonly communicationService: ICommunicationService
    ) {}

    async calculateSalesByMonth(month: number, year: number, userId?: number): Promise<AnalysisReportDTO> {
        try {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);

            const receipts = await this.receiptRepository.find({
                where: {
                    saleDate: Between(startDate, endDate)
                }
            });

            const totalSales = receipts.reduce((sum, r) => sum + Number(r.totalAmount), 0);
            const totalTransactions = receipts.length;
            const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;

            const report = this.reportRepository.create({
                analysisType: AnalysisType.SALES_BY_MONTH,
                title: `Sales Analysis - ${startDate.toLocaleString('default', { month: 'long' })} ${year}`,
                total: Number(totalSales.toFixed(2)),
                receipts: receipts.map(r => ({
                    receiptNumber: r.receiptNumber,
                    date: r.saleDate,
                    amount: Number(r.totalAmount)
                })),
                extraData: Number(averageTransaction.toFixed(2)),
                description: `Total sales and transactions for ${startDate.toLocaleString('default', { month: 'long' })} ${year}`,
                createdBy: userId || null,
                periodStart: startDate,
                periodEnd: endDate
            });

            const savedReport = await this.reportRepository.save(report);

            await this.communicationService.logEvent(
                "INFO",
                `Sales by month analysis created: ${month}/${year}`
            );
            const reportDTO = savedReport as AnalysisReportDTO;
            return reportDTO;
        } catch (error: any) {
            await this.communicationService.logEvent(
                "ERROR",
                `Failed to calculate sales by month: ${error.message}`
            );
            throw error;
        }
    }

    async calculateSalesByWeek(weekNumber: number, year: number, userId?: number): Promise<AnalysisReportDTO> {
        try {
            const startDate = this.getDateOfWeek(weekNumber, year);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
            endDate.setHours(23, 59, 59);

            const receipts = await this.receiptRepository.find({
                where: {
                    saleDate: Between(startDate, endDate)
                }
            });

            const totalSales = receipts.reduce((sum, r) => sum + Number(r.totalAmount), 0);
            const totalTransactions = receipts.length;

            const report = this.reportRepository.create({
                analysisType: AnalysisType.SALES_BY_WEEK,
                title: `Sales Analysis - Week ${weekNumber}, ${year}`,
                total: Number(totalSales.toFixed(2)),
                extraData: totalTransactions,
                description: `Sales analysis for week ${weekNumber} of ${year}`,
                createdBy: userId || null,
                periodStart: startDate,
                periodEnd: endDate
            });

            const savedReport = await this.reportRepository.save(report);

            await this.communicationService.logEvent(
                "INFO",
                `Sales by week analysis created: Week ${weekNumber}/${year}`
            );
            const reportDTO = savedReport as AnalysisReportDTO;
            return reportDTO;
        } catch (error: any) {
            await this.communicationService.logEvent(
                "ERROR",
                `Failed to calculate sales by week: ${error.message}`
            );
            throw error;
        }
    }

    async calculateSalesByYear(year: number, userId?: number): Promise<AnalysisReportDTO> {
        try {
            const startDate = new Date(year, 0, 1);
            const endDate = new Date(year, 11, 31, 23, 59, 59);

            const receipts = await this.receiptRepository.find({
                where: {
                    saleDate: Between(startDate, endDate)
                }
            });

            const totalSales = receipts.reduce((sum, r) => sum + Number(r.totalAmount), 0);
            const totalTransactions = receipts.length;

            // Group by month
            const monthlyData = Array.from({ length: 12 }, (_, i) => {
                const monthReceipts = receipts.filter(r => {
                    const receiptMonth = new Date(r.saleDate).getMonth();
                    return receiptMonth === i;
                });
                const monthTotal = monthReceipts.reduce((sum, r) => sum + Number(r.totalAmount), 0);
                return {
                    month: i + 1,
                    monthName: new Date(year, i, 1).toLocaleString('default', { month: 'long' }),
                    totalSales: monthTotal.toFixed(2),
                    transactions: monthReceipts.length
                };
            });

            const report = this.reportRepository.create({
                analysisType: AnalysisType.SALES_BY_YEAR,
                title: `Sales Analysis - Year ${year}`,
                total: Number(totalSales.toFixed(2)),
                extraData: totalTransactions,
                description: `Complete sales analysis for ${year}`,
                createdBy: userId || null,
                periodStart: startDate,
                periodEnd: endDate
            });

            const savedReport = await this.reportRepository.save(report);

            await this.communicationService.logEvent(
                "INFO",
                `Sales by year analysis created: ${year}`
            );
            const reportDTO = savedReport as AnalysisReportDTO;
            return reportDTO;
        } catch (error: any) {
            await this.communicationService.logEvent(
                "ERROR",
                `Failed to calculate sales by year: ${error.message}`
            );
            throw error;
        }
    }

    async calculateTotalSales(userId?: number): Promise<AnalysisReportDTO> {
        try {
            const receipts = await this.receiptRepository.find();

            const totalSales = receipts.reduce((sum, r) => sum + Number(r.totalAmount), 0);
            const totalTransactions = receipts.length;

            const report = this.reportRepository.create({
                analysisType: AnalysisType.TOTAL_SALES,
                title: `Total Sales - All Time`,
                total: Number(totalSales.toFixed(2)),
                extraData: totalTransactions,
                description: `Complete sales summary across all periods`,
                createdBy: userId || null,
                periodStart: null,
                periodEnd: null
            });

            const savedReport = await this.reportRepository.save(report);

            await this.communicationService.logEvent(
                "INFO",
                `Total sales analysis created`
            );
            const reportDTO = savedReport as AnalysisReportDTO;
            return reportDTO;
        } catch (error: any) {
            await this.communicationService.logEvent(
                "ERROR",
                `Failed to calculate total sales: ${error.message}`
            );
            throw error;
        }
    }

    async analyzeSalesTrend(startDate: Date, endDate: Date, userId?: number): Promise<AnalysisReportDTO> {
        try {
            const receipts = await this.receiptRepository.find({
                where: {
                    saleDate: Between(startDate, endDate)
                },
                order: {
                    saleDate: "ASC"
                }
            });

            // Group by day
            const dailyData = new Map<string, { sales: number; count: number }>();

            receipts.forEach(receipt => {
                const dateKey = new Date(receipt.saleDate).toISOString().split('T')[0];
                const existing = dailyData.get(dateKey) || { sales: 0, count: 0 };
                dailyData.set(dateKey, {
                    sales: existing.sales + Number(receipt.totalAmount),
                    count: existing.count + 1
                });
            });

            const trendData = Array.from(dailyData.entries()).map(([date, data]) => ({
                date,
                totalSales: data.sales.toFixed(2),
                transactions: data.count
            }));

            // Calculate trend direction
            const totalSales = receipts.reduce((sum, r) => sum + Number(r.totalAmount), 0);
            const avgDailySales = trendData.length > 0 ? totalSales / trendData.length : 0;

            const report = this.reportRepository.create({
                analysisType: AnalysisType.SALES_TREND,
                title: `Sales Trend Analysis`,
                total: Number(totalSales.toFixed(2)),
                trend: trendData.map(t => ({ date: t.date, value: Number(t.totalSales) })),
                extraData: Number(avgDailySales.toFixed(2)),
                description: `Sales trend from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
                createdBy: userId || null,
                periodStart: startDate,
                periodEnd: endDate
            });

            const savedReport = await this.reportRepository.save(report);

            await this.communicationService.logEvent(
                "INFO",
                `Sales trend analysis created`
            );
            const reportDTO = savedReport as AnalysisReportDTO;
            return reportDTO;
        } catch (error: any) {
            await this.communicationService.logEvent(
                "ERROR",
                `Failed to analyze sales trend: ${error.message}`
            );
            throw error;
        }
    }

    async getTop10BestSellingPerfumes(userId?: number): Promise<AnalysisReportDTO> {
        try {
            const receipts = await this.receiptRepository.find();

            const aggregates = this.computePerfumeAggregates(receipts);

            const topByQuantity = aggregates
                .slice()
                .sort((a, b) => b.quantitySold - a.quantitySold)
                .slice(0, 10);

            const perfumesPayload = topByQuantity.map(p => ({ name: p.name, serialNumber: p.serialNumber}));

            const totalRevenue = aggregates.reduce((sum, a) => sum + a.totalRevenue, 0);

            const report = this.reportRepository.create({
                analysisType: AnalysisType.TOP_10_PERFUMES,
                title: `Top 10 Best-Selling Perfumes`,
                perfumes: perfumesPayload,
                extraData: Number(totalRevenue.toFixed(2)),
                description: `Top 10 perfumes by quantity sold`,
                createdBy: userId || null,
                periodStart: null,
                periodEnd: null
            });

            const savedReport = await this.reportRepository.save(report);

            await this.communicationService.logEvent("INFO", `Top 10 best-selling perfumes analysis created`);
            return savedReport as AnalysisReportDTO;
        } catch (error: any) {
            await this.communicationService.logEvent(
                "ERROR",
                `Failed to get top 10 best-selling perfumes: ${error.message}`
            );
            throw error;
        }
    }

    async getAllReports(): Promise<AnalysisReportDTO[]> {
        const reports = await this.reportRepository.find({
            order: { createdAt: "DESC" }
        });
        return reports.map(report => report as AnalysisReportDTO);
    }

    async getReportById(id: number): Promise<AnalysisReportDTO | null> {
        const report = await this.reportRepository.findOne({ where: { id } });
        return report ? report as AnalysisReportDTO : null;
    }

    async getReportsByType(type: AnalysisType): Promise<AnalysisReportDTO[]> {
        const reports = await this.reportRepository.find({
            where: { analysisType: type },
            order: { createdAt: "DESC" }
        });
        return reports.map(report => report as AnalysisReportDTO);
    }

    // Helper method to get the start date of a week
    private getDateOfWeek(weekNumber: number, year: number): Date {
        const simple = new Date(year, 0, 1 + (weekNumber - 1) * 7);
        const dayOfWeek = simple.getDay();
        const isoWeekStart = simple;
        if (dayOfWeek <= 4)
            isoWeekStart.setDate(simple.getDate() - simple.getDay() + 1);
        else
            isoWeekStart.setDate(simple.getDate() + 8 - simple.getDay());
        isoWeekStart.setHours(0, 0, 0, 0);
        return isoWeekStart;
    }

    private computePerfumeAggregates(receipts: FiscalReceipt[]) {
        const map = new Map<string, { name: string; serialNumber: string; totalRevenue: number; quantitySold: number }>();

        receipts.forEach(receipt => {
            receipt.soldPerfumes.forEach(perfume => {
                const existing = map.get(perfume.serialNumber) || {
                    name: perfume.name,
                    serialNumber: perfume.serialNumber,
                    totalRevenue: 0,
                    quantitySold: 0
                };
                const revenue = Number(perfume.pricePerUnit) * Number(perfume.quantity);
                map.set(perfume.serialNumber, {
                    ...existing,
                    totalRevenue: existing.totalRevenue + revenue,
                    quantitySold: existing.quantitySold + Number(perfume.quantity)
                });
            });
        });

        return Array.from(map.values());
    }
}
