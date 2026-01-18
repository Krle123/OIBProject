import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./Database/DbConnectionPool";
import { PerformanceReport } from "./Domain/models/PerformanceReport";
import { CommunicationService } from "./Services/CommunicationService";
import { PerformanceService } from "./Services/PerformanceService";
import { PDFService } from "./Services/PDFService";
import { PerformanceController } from "./WebAPI/controllers/PerformanceController";
import { createPerformanceRoutes } from "./WebAPI/routes/performanceRoutes";

dotenv.config({ quiet: true });

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({
        status: "OK",
        service: "Performance Microservice",
        timestamp: new Date().toISOString()
    });
});

// Initialize services and routes after DB connection
export const initializeApp = async (): Promise<Application> => {
    await AppDataSource.initialize();

    // Repositories
    const reportRepository = AppDataSource.getRepository(PerformanceReport);

    // Services
    const communicationService = new CommunicationService();
    const performanceService = new PerformanceService(reportRepository, communicationService);
    const pdfService = new PDFService();

    // Controllers
    const performanceController = new PerformanceController(performanceService, pdfService);

    // Public routes - gateway handles authentication
    app.use("/api/v1/performance", createPerformanceRoutes(performanceController));

    return app;
};

export default app;
