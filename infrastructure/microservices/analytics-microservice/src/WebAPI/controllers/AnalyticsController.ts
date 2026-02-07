import { Request, Response, Router } from "express";
import { IAnalyticsService } from "../../Domain/services/IAnalyticsService";
import { IPDFService } from "../../Domain/services/IPDFService";
import { AnalysisType } from "../../Domain/enums/AnalysisType";
import { IFiscalReceiptService } from "../../Domain/services/IFiscalReceiptService";

export class AnalyticsController {
    private router: Router;
    constructor(
        private readonly analyticsService: IAnalyticsService,
        private readonly pdfService: IPDFService,
        private readonly fiscalReceiptService: IFiscalReceiptService
    ) 
    {
        this.router = Router();
        this.initializeRoutes();    
    }

    private initializeRoutes(): void {
        this.router.get("/analytics/sales/by-month", this.calculateSalesByMonth.bind(this));
        this.router.get("/analytics/sales/by-week", this.calculateSalesByWeek.bind(this));
        this.router.get("/analytics/sales/by-year", this.calculateSalesByYear.bind(this));
        this.router.get("/analytics/sales/total", this.calculateTotalSales.bind(this));
        this.router.get("/analytics/sales/trend", this.analyzeSalesTrend.bind(this));

        this.router.get("/analytics/top-10/best-selling", this.getTop10BestSellingPerfumes.bind(this));
        this.router.get("/analytics/top-10/revenue", this.getTop10RevenueByPerfume.bind(this));

        this.router.get("/analytics/reports", this.getAllReports.bind(this));
        this.router.get("/analytics/reports/:id", this.getReportById.bind(this));
        this.router.get("/analytics/reports/type/:type", this.getReportsByType.bind(this));
        this.router.get("/analytics/reports/:id/pdf", this.downloadReportPDF.bind(this));

        this.router.post("/analytics/receipts", this.createFiscalReceipt.bind(this));
        this.router.get("/analytics/receipts", this.getAllReceipts.bind(this));
        this.router.get("/analytics/receipts/:id", this.getReceiptById.bind(this));
        this.router.get("/analytics/receipts/number/:number", this.getReceiptByNumber.bind(this));
        this.router.get("/analytics/receipts/:id/pdf", this.downloadReceiptPDF.bind(this));
    }

    private async calculateSalesByMonth (req: Request, res: Response): Promise<void> {
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

            res.status(200).json({ success: true, data: report });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    private async calculateSalesByWeek (req: Request, res: Response): Promise<void> {
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

            res.status(200).json({ success: true, data: report });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    private async calculateSalesByYear (req: Request, res: Response): Promise<void> {
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

            res.status(200).json({ success: true, data: report });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    private async calculateTotalSales (req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            const report = await this.analyticsService.calculateTotalSales(userId);
            res.status(200).json({ success: true, data: report });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    private async analyzeSalesTrend (req: Request, res: Response): Promise<void> {
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

            res.status(200).json({ success: true, data: report });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    private async getTop10BestSellingPerfumes (req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            const report = await this.analyticsService.getTop10BestSellingPerfumes(userId);
            res.status(200).json({ success: true, data: report });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    private async getTop10RevenueByPerfume (req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            const report = await this.analyticsService.getTop10RevenueByPerfume(userId);
            res.status(200).json({ success: true, data: report });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    private async getAllReports (req: Request, res: Response): Promise<void> {
        try {
            const reports = await this.analyticsService.getAllReports();
            res.status(200).json({ success: true, data: reports });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    private async getReportById (req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const report = await this.analyticsService.getReportById(id);

            if (!report) {
                res.status(404).json({ success: false, error: "Report not found" });
                return;
            }

            res.status(200).json({ success: true, data: report });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    private async getReportsByType (req: Request, res: Response): Promise<void> {
        try {
            const type = req.params.type as AnalysisType;
            const reports = await this.analyticsService.getReportsByType(type);
            res.status(200).json({ success: true, data: reports });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    private async downloadReportPDF (req: Request, res: Response): Promise<void> {
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
    private async createFiscalReceipt (req: Request, res: Response): Promise<void> {
        try {
            const saleData = req.body;
            const receipt = await this.fiscalReceiptService.createFiscalReceipt(saleData);
            res.status(201).json({ success: true, data: receipt });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    private async getAllReceipts (req: Request, res: Response): Promise<void> {
        try {
            const receipts = await this.fiscalReceiptService.getAllReceipts();
            res.status(200).json({ success: true, data: receipts });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    private async getReceiptById (req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const receipt = await this.fiscalReceiptService.getReceiptById(id);

            if (!receipt) {
                res.status(404).json({ success: false, error: "Receipt not found" });
                return;
            }

            res.status(200).json({ success: true, data: receipt });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    private async getReceiptByNumber (req: Request, res: Response): Promise<void> {
        try {
            const receiptNumber = req.params.number;
            const receipt = await this.fiscalReceiptService.getReceiptByNumber(receiptNumber);

            if (!receipt) {
                res.status(404).json({ success: false, error: "Receipt not found" });
                return;
            }

            res.status(200).json({ success: true, data: receipt });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    private async downloadReceiptPDF (req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const receipt = await this.fiscalReceiptService.getReceiptById(id);

            if (!receipt) {
                res.status(404).json({ error: "Receipt not found" });
                return;
            }

            const pdfBuffer = await this.pdfService.generateFiscalReceiptPDF(receipt);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=receipt-${receipt.receiptNumber}.pdf`);
            res.send(pdfBuffer);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    public getRouter(): Router {
        return this.router;
    }
}
