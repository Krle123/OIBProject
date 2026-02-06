import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./Database/DbConnectionPool";
import { FiscalReceipt } from "./Domain/models/FiscalReceipt";
import { AnalysisReport } from "./Domain/models/AnalysisReport";
import { CommunicationService } from "./Services/CommunicationService";
import { FiscalReceiptService } from "./Services/FiscalReceiptService";
import { AnalyticsService } from "./Services/AnalyticsService";
import { PDFService } from "./Services/PDFService";
import { AnalyticsController } from "./WebAPI/controllers/AnalyticsController";
import { authMiddleware } from "./Helpers/authMiddleware";

dotenv.config({ quiet: true });

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({
        status: "OK",
        service: "Analytics Microservice",
        timestamp: new Date().toISOString()
    });
});

// Initialize services and routes after DB connection
export const initializeApp = async (): Promise<Application> => {
    await AppDataSource.initialize();

    // Repositories
    const receiptRepository = AppDataSource.getRepository(FiscalReceipt);
    const reportRepository = AppDataSource.getRepository(AnalysisReport);

    // Services
    const communicationService = new CommunicationService();
    const fiscalReceiptService = new FiscalReceiptService(receiptRepository, communicationService);
    const analyticsService = new AnalyticsService(receiptRepository, reportRepository, communicationService);
    const pdfService = new PDFService();

    // Controllers
    const analyticsController = new AnalyticsController(analyticsService, pdfService, fiscalReceiptService);

    app.use("/api/v1", analyticsController.getRouter());

    return app;
};

export default app;
