import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Db } from "./Database/DbConnectionPool";
import { initialize_database } from "./Database/InitializeConnection";
import { FiscalReceipt } from "./Domain/models/FiscalReceipt";
import { AnalysisReport } from "./Domain/models/AnalysisReport";
import { CommunicationService } from "./Services/CommunicationService";
import { FiscalReceiptService } from "./Services/FiscalReceiptService";
import { AnalyticsService } from "./Services/AnalyticsService";
import { AnalyticsController } from "./WebAPI/controllers/AnalyticsController";

dotenv.config({ quiet: true });

const app = express();

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
    const receiptRepository = Db.getRepository(FiscalReceipt);
    const reportRepository = Db.getRepository(AnalysisReport);

    // Services
    const communicationService = new CommunicationService();
    const fiscalReceiptService = new FiscalReceiptService(receiptRepository, communicationService);
    const analyticsService = new AnalyticsService(receiptRepository, reportRepository, communicationService);

    // Controllers
    const analyticsController = new AnalyticsController(analyticsService, fiscalReceiptService);

    app.use("/api/v1", analyticsController.getRouter());

export default app;
