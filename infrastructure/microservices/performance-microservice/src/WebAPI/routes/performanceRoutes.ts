import { Router } from "express";
import { PerformanceController } from "../controllers/PerformanceController";

export const createPerformanceRoutes = (controller: PerformanceController): Router => {
    const router = Router();

    // Simulation
    router.post("/simulate", controller.runSimulation);

    // Reports management
    router.get("/reports", controller.getAllReports);
    router.get("/reports/:id", controller.getReportById);
    router.get("/reports/algorithm/:algorithmType", controller.getReportsByAlgorithmType);
    router.get("/reports/:id/pdf", controller.downloadReportPDF);

    return router;
};
