import { Request, Response } from "express";
import { IPerformanceService } from "../../Domain/services/IPerformanceService";
import { IPDFService } from "../../Domain/services/IPDFService";
import { PerformanceAlgorithmType } from "../../Domain/enums/PerformanceAlgorithmType";

export class PerformanceController {
    constructor(
        private readonly performanceService: IPerformanceService,
        private readonly pdfService: IPDFService
    ) {}

    runSimulation = async (req: Request, res: Response): Promise<void> => {
        try {
            const { algorithmType, numberOfPackages } = req.body;
            const userId = (req as any).user?.userId;

            if (!algorithmType || !numberOfPackages) {
                res.status(400).json({
                    error: "Nedostaju obavezni parametri: algorithmType i numberOfPackages"
                });
                return;
            }

            if (!Object.values(PerformanceAlgorithmType).includes(algorithmType)) {
                res.status(400).json({
                    error: `Nevažeći tip algoritma. Dozvoljeni tipovi: ${Object.values(PerformanceAlgorithmType).join(", ")}`
                });
                return;
            }

            if (numberOfPackages <= 0 || numberOfPackages > 1000) {
                res.status(400).json({
                    error: "Broj paketa mora biti između 1 i 1000"
                });
                return;
            }

            const report = await this.performanceService.runSimulation(
                algorithmType,
                numberOfPackages,
                userId
            );

            res.status(201).json(report);
        } catch (error: any) {
            console.error("Error running simulation:", error);
            res.status(500).json({
                error: "Greška pri pokretanju simulacije",
                message: error.message
            });
        }
    };

    getAllReports = async (req: Request, res: Response): Promise<void> => {
        try {
            const reports = await this.performanceService.getAllReports();
            res.status(200).json(reports);
        } catch (error: any) {
            console.error("Error getting all reports:", error);
            res.status(500).json({
                error: "Greška pri dohvatanju izveštaja",
                message: error.message
            });
        }
    };

    getReportById = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: "Nevažeći ID izveštaja" });
                return;
            }

            const report = await this.performanceService.getReportById(id);
            if (!report) {
                res.status(404).json({ error: "Izveštaj nije pronađen" });
                return;
            }

            res.status(200).json(report);
        } catch (error: any) {
            console.error("Error getting report by ID:", error);
            res.status(500).json({
                error: "Greška pri dohvatanju izveštaja",
                message: error.message
            });
        }
    };

    getReportsByAlgorithmType = async (req: Request, res: Response): Promise<void> => {
        try {
            const { algorithmType } = req.params;

            if (!Object.values(PerformanceAlgorithmType).includes(algorithmType as PerformanceAlgorithmType)) {
                res.status(400).json({
                    error: `Nevažeći tip algoritma. Dozvoljeni tipovi: ${Object.values(PerformanceAlgorithmType).join(", ")}`
                });
                return;
            }

            const reports = await this.performanceService.getReportsByAlgorithmType(
                algorithmType as PerformanceAlgorithmType
            );
            res.status(200).json(reports);
        } catch (error: any) {
            console.error("Error getting reports by algorithm type:", error);
            res.status(500).json({
                error: "Greška pri dohvatanju izveštaja",
                message: error.message
            });
        }
    };

    downloadReportPDF = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: "Nevažeći ID izveštaja" });
                return;
            }

            const report = await this.performanceService.getReportById(id);
            if (!report) {
                res.status(404).json({ error: "Izveštaj nije pronađen" });
                return;
            }

            const pdfBuffer = await this.pdfService.generatePerformanceReportPDF(report);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="performance-report-${id}.pdf"`);
            res.status(200).send(pdfBuffer);
        } catch (error: any) {
            console.error("PDF Generation Error:", error.message);
            res.status(500).json({
                error: "Greška pri generisanju PDF izveštaja",
                message: error.message
            });
        }
    };
}
