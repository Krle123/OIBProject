import { exportReportToPDF } from "../helpers/pdfExport";
router.get("/reports/:id/pdf", async (req: Request, res: Response) => {
    try {
        const report = await service.getReportById(Number(req.params.id));
        if (!report) return res.status(404).json({ error: "Report not found" });
        exportReportToPDF(res, report);
    } catch (err) {
        res.status(500).json({ error: "Failed to export PDF" });
    }
});
import { Request, Response, Router } from "express";

import { getPerformanceReportRepository } from "../Database/repositories";
import { PerformanceAnalysisService } from "../Services/PerformanceAnalysisService";
import { AlgorithmType } from "../Domain/enums/AlgorithmType";

const router = Router();
const service = new PerformanceAnalysisService(getPerformanceReportRepository());

router.post("/simulate", async (req: Request, res: Response) => {
    const { algorithm } = req.body;
    if (!algorithm || !Object.values(AlgorithmType).includes(algorithm)) {
        return res.status(400).json({ error: "Invalid algorithm type" });
    }
    try {
        const report = await service.runSimulation(algorithm);
        res.status(201).json(report);
    } catch (err) {
        res.status(500).json({ error: "Simulation failed", details: err });
    }
});

router.get("/reports", async (_req: Request, res: Response) => {
    try {
        const reports = await service.getAllReports();
        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch reports" });
    }
});

router.get("/reports/:id", async (req: Request, res: Response) => {
    try {
        const report = await service.getReportById(Number(req.params.id));
        if (!report) return res.status(404).json({ error: "Report not found" });
        res.json(report);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch report" });
    }
});

export default router;
