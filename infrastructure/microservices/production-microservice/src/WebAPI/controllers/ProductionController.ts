import {Request, Response, Router} from 'express';
import jwt from "jsonwebtoken";
import {IProductionService} from '../../Domain/services/IProductionService';
import {PlantState} from '../../Domain/enums/PlantState';
import {FieldPlantDTO} from '../../Domain/DTOs/FieldPlantDTO';
import {PlantDTO} from '../../Domain/DTOs/PlantDTO';
import { IPlantService } from '../../Domain/services/IPlantService';

export class ProductionController {
    private router: Router;
    private readonly productionService: IProductionService;
    private readonly plantService: IPlantService;
    private readonly jwtSecret: string;

    constructor(productionService: IProductionService, plantService: IPlantService) {
        this.router = Router();
        this.productionService = productionService;
        this.plantService = plantService;
        this.jwtSecret = process.env.JWT_SECRET ?? "";
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post('/production/plant', this.plantHerb.bind(this));
        this.router.put('/production/aromatic-power/:id', this.changeAromaticPower.bind(this));
        this.router.post('/production/harvest', this.harvestPlant.bind(this));
        this.router.get('/plants/:id', this.getPlantsById.bind(this));
        this.router.get('/plants', this.getAllPlants.bind(this));
        this.router.get('/field-plants/state/:state', this.getPlantsByState.bind(this));
        this.router.get('/field-plants', this.getAllFieldPlants.bind(this));
    }

    private async plantHerb(req: Request, res: Response): Promise<void> 
    {
        try {
            const { plantId, quantity } = req.body;
            const result = await this.productionService.plantHerb(plantId, quantity);
            if (result) {
                res.status(201).json({ success: true, message: "Herb planted successfully" });
            } else {
                res.status(400).json({ success: false, message: "Failed to plant herb" });
            }
        } catch (error) {
            console.error("ProductionController.plantHerb error:", error);
            res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
        }
    }

    private async changeAromaticPower(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { changePercentage } = req.body;
            const result = await this.productionService.changeAromaticPower(parseInt(id), changePercentage);
            if (result) {
                res.status(200).json({ success: true, message: "Aromatic power changed successfully" });
            } else {
                res.status(400).json({ success: false, message: "Failed to change aromatic power" });
            }
        } catch (error) {
            console.error("ProductionController.changeAromaticPower error:", error);
            res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
        }
    }

    private async harvestPlant(req: Request, res: Response): Promise<void> {
        try {
            const { plantId, quantity } = req.body;
            const harvestedPlants = await this.productionService.harvestPlant(plantId, quantity);
            if (harvestedPlants.length > 0) {
                res.status(200).json({ success: true, harvestedPlants });
            } else {
                res.status(400).json({ success: false, message: "Failed to harvest plants" });
            }
        } catch (error) {
            console.error("ProductionController.harvestPlant error:", error);
            res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
        }
    }

    private async getPlantsById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const plants = await this.plantService.getPlantsById(parseInt(id));
            res.status(200).json({ success: true, plants });
        } catch (error) {
            console.error("ProductionController.getPlantsById error:", error);
            res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
        }
    }

    private async getPlantsByState(req: Request, res: Response): Promise<void> {
        try {
            const { state } = req.params;
            const plants = await this.plantService.getPlantsByState(state as PlantState);
            res.status(200).json({ success: true, plants });
        } catch (error) {
            console.error("ProductionController.getPlantsByState error:", error);
            res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
        }
    }

    private async getAllPlants(req: Request, res: Response): Promise<void> {
        try {
            const plants = await this.plantService.getAllPlants();
            res.status(200).json({ success: true, plants });
        } catch (error) {
            console.error("ProductionController.getAllPlants error:", error);
            res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
        }
    }

    private async getAllFieldPlants(req: Request, res: Response): Promise<void> {
        try {
            const plants = await this.plantService.getAllFieldPlants();
            res.status(200).json({ success: true, plants });
        } catch (error) {
            console.error("ProductionController.getAllFieldPlants error:", error);
            res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}