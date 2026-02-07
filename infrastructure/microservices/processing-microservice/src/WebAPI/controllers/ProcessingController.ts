import { Request, Response, Router } from "express";
import { IProcessingService } from "../../Domain/services/IProcessingService";
import { PerfumeDTO } from "../../Domain/DTOs/PerfumeDTO";
import { IPackagingService } from "../../Domain/services/IPackagingService";

export class ProcessingController {
    private router: Router;
    private readonly processingService: IProcessingService;
    private readonly packagingService: IPackagingService;

    constructor(processingService: IProcessingService, packagingService: IPackagingService) {
        this.router = Router();
        this.processingService = processingService;
        this.packagingService = packagingService
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post('/processing/perfumes/create', this.createPerfumeBatch.bind(this));
        this.router.post('/processing/packaging/send-to-storage', this.sendPackagingToStorage.bind(this));
        this.router.post('/processing/packaging/package-perfume', this.packagePerfume.bind(this));
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

    private async sendPackagingToStorage(req: Request, res: Response): Promise<void> {
        try {
            const storageId: number = req.body.storageId;
            console.log("ProcessingController.sendPackagingToStorage called with:", { storageId });
            const packaging = await this.packagingService.sendPackagingToStoraging(storageId);
            res.status(200).json({ success: true, packaging });
        } catch (error) {
            console.error("ProcessingController.sendPackagingToStorage error:", error);
            res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
        }
    }

    private async packagePerfume(req: Request, res: Response): Promise<void> {
        try {
            const serialNumber: string = req.body.serialNumber;
            const numberOfBottles: number = req.body.numberOfBottles;
            console.log("ProcessingController.packagePerfume called with:", { serialNumber, numberOfBottles });
            const packaging = await this.packagingService.packagePerfume(serialNumber, numberOfBottles);
            res.status(200).json({ success: true, packaging });
        } catch (error) {
            console.error("ProcessingController.packagePerfume error:", error);
            res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}