import { Request, Response } from "express";
import { IAnalyticsService } from "../../Domain/services/IAnalyticsService";
import { IPDFService } from "../../Domain/services/IPDFService";
import { AnalysisType } from "../../Domain/enums/AnalysisType";

export class AnalyticsController {
    constructor(
        private readonly analyticsService: IAnalyticsService,
        private readonly pdfService: IPDFService
    ) {}

    calculateSalesByMonth = async (req: Request, res: Response): Promise<void> => {
        try {
            const { month, year } = req.query;
            const userId = (req as any).user?.id;

            if (!month || !year) {
                res.status(400).json({ error: "Month and year are required" });
                return;
            }

            const report = await this.analyticsService.calculateSalesByMonth(
                parseInt(month as string),
                parseInt(year as string),
                userId
            );

            res.status(200).json(report);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    calculateSalesByWeek = async (req: Request, res: Response): Promise<void> => {
        try {
            const { week, year } = req.query;
            const userId = (req as any).user?.id;

            if (!week || !year) {
                res.status(400).json({ error: "Week and year are required" });
                return;
            }

            const report = await this.analyticsService.calculateSalesByWeek(
                parseInt(week as string),
                parseInt(year as string),
                userId
            );

            res.status(200).json(report);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    calculateSalesByYear = async (req: Request, res: Response): Promise<void> => {
        try {
            const { year } = req.query;
            const userId = (req as any).user?.id;

            if (!year) {
                res.status(400).json({ error: "Year is required" });
                return;
            }

            const report = await this.analyticsService.calculateSalesByYear(
                parseInt(year as string),
                userId
            );

            res.status(200).json(report);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    calculateTotalSales = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user?.id;
            const report = await this.analyticsService.calculateTotalSales(userId);
            res.status(200).json(report);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    analyzeSalesTrend = async (req: Request, res: Response): Promise<void> => {
        try {
            const { startDate, endDate } = req.query;
            const userId = (req as any).user?.id;

            if (!startDate || !endDate) {
                res.status(400).json({ error: "Start date and end date are required" });
                return;
            }

            const report = await this.analyticsService.analyzeSalesTrend(
                new Date(startDate as string),
                new Date(endDate as string),
                userId
            );

            res.status(200).json(report);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    getTop10BestSellingPerfumes = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user?.id;
            const report = await this.analyticsService.getTop10BestSellingPerfumes(userId);
            res.status(200).json(report);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    getTop10RevenueByPerfume = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user?.id;
            const report = await this.analyticsService.getTop10RevenueByPerfume(userId);
            res.status(200).json(report);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    getAllReports = async (req: Request, res: Response): Promise<void> => {
        try {
            const reports = await this.analyticsService.getAllReports();
            res.status(200).json(reports);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    getReportById = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            const report = await this.analyticsService.getReportById(id);

            if (!report) {
                res.status(404).json({ error: "Report not found" });
                return;
            }

            res.status(200).json(report);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    getReportsByType = async (req: Request, res: Response): Promise<void> => {
        try {
            const type = req.params.type as AnalysisType;
            const reports = await this.analyticsService.getReportsByType(type);
            res.status(200).json(reports);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    downloadReportPDF = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            const report = await this.analyticsService.getReportById(id);

            if (!report) {
                res.status(404).json({ error: "Report not found" });
                return;
            }

            const pdfBuffer = await this.pdfService.generateAnalysisReportPDF(report);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=report-${report.id}.pdf`);
            res.send(pdfBuffer);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };
}
