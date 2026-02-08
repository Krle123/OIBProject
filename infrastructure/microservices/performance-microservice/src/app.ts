import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Db } from "./Database/DbConnectionPool";
import { PerformanceReport } from "./Domain/models/PerformanceReport";
import { CommunicationService } from "./Services/CommunicationService";
import { PerformanceService } from "./Services/PerformanceService";
import { PDFService } from "./Services/PDFService";
import { PerformanceController } from "./WebAPI/controllers/PerformanceController";
import { initialize_database } from "./Database/InitializeConnection";

dotenv.config({ quiet: true });

const app = express();

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Read CORS settings from environment
const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const corsMethods = process.env.CORS_METHODS?.split(",").map(m => m.trim()) ?? ["POST"];

// Protected microservice from unauthorized access
app.use(cors({
  origin: corsOrigin,
  methods: corsMethods,
}));

    initialize_database();

    // Repositories
    const reportRepository = Db.getRepository(PerformanceReport);

    // Services
    const communicationService = new CommunicationService();
    const performanceService = new PerformanceService(reportRepository, communicationService);
    const pdfService = new PDFService();

    // Controllers
    const performanceController = new PerformanceController(performanceService, pdfService);

    // Public routes - gateway handles authentication
    app.use("/api/v1", performanceController.getRouter());

export default app;
