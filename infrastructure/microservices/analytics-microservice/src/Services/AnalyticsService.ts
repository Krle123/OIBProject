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

            const data = {
                period: `${year}-${String(month).padStart(2, '0')}`,
                totalSales: totalSales.toFixed(2),
                totalTransactions,
                averageTransaction: averageTransaction.toFixed(2),
                receipts: receipts.map(r => ({
                    receiptNumber: r.receiptNumber,
                    date: r.saleDate,
                    amount: r.totalAmount
                }))
            };

            const report = this.reportRepository.create({
                analysisType: AnalysisType.SALES_BY_MONTH,
                title: `Sales Analysis - ${startDate.toLocaleString('default', { month: 'long' })} ${year}`,
                data: data,
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

            return new AnalysisReportDTO(savedReport);
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
            // Calculate start and end dates for the week
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

            const data = {
                period: `Week ${weekNumber}, ${year}`,
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                totalSales: totalSales.toFixed(2),
                totalTransactions
            };

            const report = this.reportRepository.create({
                analysisType: AnalysisType.SALES_BY_WEEK,
                title: `Sales Analysis - Week ${weekNumber}, ${year}`,
                data: data,
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

            return new AnalysisReportDTO(savedReport);
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

            const data = {
                year: year,
                totalSales: totalSales.toFixed(2),
                totalTransactions,
                monthlyBreakdown: monthlyData
            };

            const report = this.reportRepository.create({
                analysisType: AnalysisType.SALES_BY_YEAR,
                title: `Sales Analysis - Year ${year}`,
                data: data,
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

            return new AnalysisReportDTO(savedReport);
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

            const data = {
                totalSales: totalSales.toFixed(2),
                totalTransactions,
                averageTransaction: totalTransactions > 0 ? (totalSales / totalTransactions).toFixed(2) : "0.00"
            };

            const report = this.reportRepository.create({
                analysisType: AnalysisType.TOTAL_SALES,
                title: `Total Sales - All Time`,
                data: data,
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

            return new AnalysisReportDTO(savedReport);
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

            const data = {
                period: {
                    start: startDate.toISOString().split('T')[0],
                    end: endDate.toISOString().split('T')[0]
                },
                totalSales: totalSales.toFixed(2),
                averageDailySales: avgDailySales.toFixed(2),
                dailyTrend: trendData
            };

            const report = this.reportRepository.create({
                analysisType: AnalysisType.SALES_TREND,
                title: `Sales Trend Analysis`,
                data: data,
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

            return new AnalysisReportDTO(savedReport);
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

            // Aggregate perfume quantities
            const perfumeStats = new Map<string, { name: string; serialNumber: string; totalQuantity: number }>();

            receipts.forEach(receipt => {
                receipt.soldPerfumes.forEach(perfume => {
                    const existing = perfumeStats.get(perfume.serialNumber) || {
                        name: perfume.name,
                        serialNumber: perfume.serialNumber,
                        totalQuantity: 0
                    };
                    perfumeStats.set(perfume.serialNumber, {
                        ...existing,
                        totalQuantity: existing.totalQuantity + perfume.quantity
                    });
                });
            });

            // Sort and get top 10
            const top10 = Array.from(perfumeStats.values())
                .sort((a, b) => b.totalQuantity - a.totalQuantity)
                .slice(0, 10)
                .map((item, index) => ({
                    rank: index + 1,
                    serialNumber: item.serialNumber,
                    name: item.name,
                    totalQuantitySold: item.totalQuantity
                }));

            const data = {
                top10Perfumes: top10,
                generatedAt: new Date().toISOString()
            };

            const report = this.reportRepository.create({
                analysisType: AnalysisType.TOP_10_PERFUMES,
                title: `Top 10 Best-Selling Perfumes`,
                data: data,
                description: `Top 10 perfumes by quantity sold`,
                createdBy: userId || null,
                periodStart: null,
                periodEnd: null
            });

            const savedReport = await this.reportRepository.save(report);

            await this.communicationService.logEvent(
                "INFO",
                `Top 10 best-selling perfumes analysis created`
            );

            return new AnalysisReportDTO(savedReport);
        } catch (error: any) {
            await this.communicationService.logEvent(
                "ERROR",
                `Failed to get top 10 best-selling perfumes: ${error.message}`
            );
            throw error;
        }
    }

    async getTop10RevenueByPerfume(userId?: number): Promise<AnalysisReportDTO> {
        try {
            const receipts = await this.receiptRepository.find();

            // Aggregate perfume revenue
            const perfumeRevenue = new Map<string, { name: string; serialNumber: string; totalRevenue: number; quantitySold: number }>();

            receipts.forEach(receipt => {
                receipt.soldPerfumes.forEach(perfume => {
                    const existing = perfumeRevenue.get(perfume.serialNumber) || {
                        name: perfume.name,
                        serialNumber: perfume.serialNumber,
                        totalRevenue: 0,
                        quantitySold: 0
                    };
                    const revenue = perfume.quantity * Number(perfume.pricePerUnit);
                    perfumeRevenue.set(perfume.serialNumber, {
                        ...existing,
                        totalRevenue: existing.totalRevenue + revenue,
                        quantitySold: existing.quantitySold + perfume.quantity
                    });
                });
            });

            // Sort and get top 10
            const top10 = Array.from(perfumeRevenue.values())
                .sort((a, b) => b.totalRevenue - a.totalRevenue)
                .slice(0, 10)
                .map((item, index) => ({
                    rank: index + 1,
                    serialNumber: item.serialNumber,
                    name: item.name,
                    totalRevenue: item.totalRevenue.toFixed(2),
                    quantitySold: item.quantitySold
                }));

            const totalRevenue = top10.reduce((sum, item) => sum + parseFloat(item.totalRevenue), 0);

            const data = {
                top10ByRevenue: top10,
                totalRevenueFromTop10: totalRevenue.toFixed(2),
                generatedAt: new Date().toISOString()
            };

            const report = this.reportRepository.create({
                analysisType: AnalysisType.TOP_10_REVENUE,
                title: `Top 10 Perfumes by Revenue`,
                data: data,
                description: `Top 10 perfumes generating highest revenue`,
                createdBy: userId || null,
                periodStart: null,
                periodEnd: null
            });

            const savedReport = await this.reportRepository.save(report);

            await this.communicationService.logEvent(
                "INFO",
                `Top 10 revenue by perfume analysis created`
            );

            return new AnalysisReportDTO(savedReport);
        } catch (error: any) {
            await this.communicationService.logEvent(
                "ERROR",
                `Failed to get top 10 revenue by perfume: ${error.message}`
            );
            throw error;
        }
    }

    async getAllReports(): Promise<AnalysisReportDTO[]> {
        const reports = await this.reportRepository.find({
            order: { createdAt: "DESC" }
        });
        return reports.map(report => new AnalysisReportDTO(report));
    }

    async getReportById(id: number): Promise<AnalysisReportDTO | null> {
        const report = await this.reportRepository.findOne({ where: { id } });
        return report ? new AnalysisReportDTO(report) : null;
    }

    async getReportsByType(type: AnalysisType): Promise<AnalysisReportDTO[]> {
        const reports = await this.reportRepository.find({
            where: { analysisType: type },
            order: { createdAt: "DESC" }
        });
        return reports.map(report => new AnalysisReportDTO(report));
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
}
