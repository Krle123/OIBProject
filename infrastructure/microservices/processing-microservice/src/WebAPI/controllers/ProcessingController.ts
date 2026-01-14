import { Request, Response, Router } from "express";
import { IProcessingService } from "../../Domain/services/IProcessingService";
import { PerfumeDTO } from "../../Domain/DTOs/PerfumeDTO";

export class ProcessingController {
    private router: Router;
    private readonly processingService: IProcessingService;

    constructor(processingService: IProcessingService) {
        this.router = Router();
        this.processingService = processingService;
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post('/processing/perfumes/create', this.createPerfumeBatch.bind(this));
    }

    private async createPerfumeBatch(req: Request, res: Response): Promise<void> {
        try {
            const perfumeData: PerfumeDTO = req.body.perfume;
            const numberOfBottles: number = req.body.numberOfBottles;
            console.log("ProcessingController.createPerfumeBatch called with:", { perfumeData, numberOfBottles });

            const perfumes = await this.processingService.createPerfumeBatch(perfumeData, numberOfBottles);
            if (perfumes.length === 0) {
                res.status(500).json({ success: false, message: "Failed to create perfume batch" });
                return;
            }
            res.status(201).json({ success: true, perfumes });
        } catch (error) {
            console.error("ProcessingController.createPerfumeBatch error:", error);
            res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}