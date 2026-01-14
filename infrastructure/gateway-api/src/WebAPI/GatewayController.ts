import { Request, Response, Router } from "express";
import { IGatewayService } from "../Domain/services/IGatewayService";
import { LoginUserDTO } from "../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../Domain/DTOs/RegistrationUserDTO";
import { authenticate } from "../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../Middlewares/authorization/AuthorizeMiddleware";
import { PlantState } from "../Domain/enums/PlantState";
import { PerfumeDTO } from "../Domain/DTOs/PerfumeDTO";
import { PerfumeType } from "../Domain/enums/PerfumeType";
import { PerfumeState } from "../Domain/enums/PerfumeState";

export class GatewayController {
  private readonly router: Router;

  constructor(private readonly gatewayService: IGatewayService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Auth
    this.router.post("/login", this.login.bind(this));
    this.router.post("/register", this.register.bind(this));

    // Users
    this.router.get("/users", authenticate, authorize("admin"), this.getAllUsers.bind(this));
    this.router.get("/users/:id", authenticate, authorize("admin", "seller"), this.getUserById.bind(this));

    // Logs
    this.router.post("/logs/add", authenticate, authorize("admin", "seller"), this.addLog.bind(this));
    this.router.put("/logs/update/:id", authenticate, authorize("admin"), this.updateLog.bind(this));
    this.router.delete("/logs/:id", authenticate, authorize("admin"), this.deleteLog.bind(this));
    this.router.get("/logs", authenticate, authorize("admin"), this.searchLogs.bind(this));

    // Production
    this.router.get("/plants/:id", authenticate, authorize("admin", "seller"), this.getPlantsById.bind(this));
    this.router.get("/plants", authenticate, authorize("admin", "seller"), this.getAllPlants.bind(this));
    this.router.get("/field-plants/state/:state", authenticate, authorize("admin", "seller"), this.getPlantsByState.bind(this));
    this.router.get("/field-plants", authenticate, authorize("admin", "seller"), this.getAllFieldPlants.bind(this));
    this.router.post("/production/plant", authenticate, authorize("admin", "seller"), this.plantHerb.bind(this));
    this.router.put("/production/aromatic-power/:id", authenticate, authorize("admin", "seller"), this.changeAromaticPower.bind(this));
    this.router.post("/production/harvest", authenticate, authorize("admin", "seller"), this.harvestPlant.bind(this));

    this.router.post("/processing/perfumes/create", authenticate, authorize("admin", "seller"), this.createPerfumeBatch.bind(this));
  }

  // Auth
  private async login(req: Request, res: Response): Promise<void> {
    await this.gatewayService.addLog("INFO", `Login attempt for user: ${req.body.username}`);
    const data: LoginUserDTO = req.body;
    const result = await this.gatewayService.login(data);
    await this.gatewayService.addLog("INFO", `User logged in: ${data.username}`);
    await this.testProductionService();
    res.status(200).json(result);
  }

  private async register(req: Request, res: Response): Promise<void> {
    await this.gatewayService.addLog("INFO", `Registration attempt for user: ${req.body.username}`);
    const data: RegistrationUserDTO = req.body;
    const result = await this.gatewayService.register(data);
    await this.gatewayService.addLog("INFO", `User registered: ${data.username}`);
    res.status(200).json(result);
  }

  // Users
  private async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      await this.gatewayService.addLog("INFO", `Fetching all users by admin ID: ${req.user?.id}`);
      const users = await this.gatewayService.getAllUsers();
      await this.gatewayService.addLog("INFO", `All users fetched by admin ID: ${req.user?.id}`);
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await this.gatewayService.addLog("INFO", `Fetching user ID: ${id} by requester ID: ${req.user?.id}`);
      if (!req.user || req.user.id !== id) {
        await this.gatewayService.addLog("WARNING", `Unauthorized access attempt to user ID: ${id} by requester ID: ${req.user?.id}`);
        res.status(401).json({ message: "You can only access your own data!" });
        return;
      }

      const user = await this.gatewayService.getUserById(id);
      await this.gatewayService.addLog("INFO", `User ID: ${id} fetched by requester ID: ${req.user?.id}`);
      res.status(200).json(user);
    } catch (err) {
      await this.gatewayService.addLog("ERROR", `User not found error: ${(err as Error).message}`);
      res.status(404).json({ message: (err as Error).message });
    }
  }

  // Logs
  private async addLog(req: Request, res: Response): Promise<void> {
    const { type, description } = req.body;
    await this.gatewayService.addLog(type, description);
    res.status(201).json({ message: "Log added successfully" });
  }

  private async updateLog(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    const { description } = req.body;
    await this.gatewayService.updateLog(id, description);
    res.status(200).json({ message: "Log updated successfully" });
  }

  private async deleteLog(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    await this.gatewayService.deleteLog(id);
    res.status(200).json({ message: "Log deleted successfully" });
  }
  
  private async searchLogs(req: Request, res: Response): Promise<void> {
    const { type, fromTs, toTs } = req.query;
    const logs = await this.gatewayService.searchLogs(
      type as string | undefined,
      fromTs as string | undefined,
      toTs as string | undefined
    );
    res.status(200).json(logs);
  }

  // Production
  private async getPlantsById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const plants = await this.gatewayService.getPlantsById(parseInt(id));
      await this.gatewayService.addLog("INFO", `Fetched plants by ID: ${id} requested by user ID: ${req.user?.id}`);
      res.status(200).json({ success: true, plants });
    } catch (error) {
      console.error("GatewayController.getPlantsById error:", error);
      await this.gatewayService.addLog("ERROR", `Error fetching plants by ID: ${(error as Error).message}`);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  private async getPlantsByState(req: Request, res: Response): Promise<void> {
    try {
      const { state } = req.params;
      const plants = await this.gatewayService.getPlantsByState(state as PlantState);
      await this.gatewayService.addLog("INFO", `Fetched plants by state: ${state} requested by user ID: ${req.user?.id}`);
      res.status(200).json({ success: true, plants });
    } catch (error) {
      console.error("GatewayController.getPlantsByState error:", error);
      await this.gatewayService.addLog("ERROR", `Error fetching plants by state: ${(error as Error).message}`);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  private async getAllPlants(req: Request, res: Response): Promise<void> {
    try {
      const plants = await this.gatewayService.getAllPlants();
      await this.gatewayService.addLog("INFO", `Fetched all plants requested by user ID: ${req.user?.id}`);
      res.status(200).json({ success: true, plants });
    } catch (error) {
      console.error("GatewayController.getAllPlants error:", error);
      await this.gatewayService.addLog("ERROR", `Error fetching all plants: ${(error as Error).message}`);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  private async getAllFieldPlants(req: Request, res: Response): Promise<void> {
    try {
      const plants = await this.gatewayService.getAllFieldPlants();
      await this.gatewayService.addLog("INFO", `Fetched all field plants requested by user ID: ${req.user?.id}`);
      res.status(200).json({ success: true, plants });
    } catch (error) {
      console.error("GatewayController.getAllFieldPlants error:", error);
      await this.gatewayService.addLog("ERROR", `Error fetching all field plants: ${(error as Error).message}`);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  private async plantHerb(req: Request, res: Response): Promise<void> {
    try {
      const { plantId, quantity } = req.body;
      const success = await this.gatewayService.plantHerb(plantId, quantity);
      if (success) {
        await this.gatewayService.addLog("INFO", `Planted herb ID: ${plantId} with quantity: ${quantity} by user ID: ${req.user?.id}`);
        res.status(200).json({ success: true, message: "Herb planted successfully" });
      } else {
        res.status(400).json({ success: false, message: "Failed to plant herb" });
      }
    } catch (error) {
      console.error("GatewayController.plantHerb error:", error);
      await this.gatewayService.addLog("ERROR", `Error planting herb: ${(error as Error).message}`);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  private async changeAromaticPower(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { changePercentage } = req.body;
      const success = await this.gatewayService.changeAromaticPower(parseInt(id), changePercentage);
      if (success) {
        await this.gatewayService.addLog("INFO", `Changed aromatic power for field plant ID: ${id} by user ID: ${req.user?.id}`);
        res.status(200).json({ success: true, message: "Aromatic power changed successfully" });
      } else {
        res.status(400).json({ success: false, message: "Failed to change aromatic power" });
      }
    } catch (error) {
      console.error("GatewayController.changeAromaticPower error:", error);
      await this.gatewayService.addLog("ERROR", `Error changing aromatic power: ${(error as Error).message}`);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  private async harvestPlant(req: Request, res: Response): Promise<void> {
    try {
      const { plantId, quantity } = req.body;
      const success = await this.gatewayService.harvestPlant(plantId, quantity);
      if (success) {
        await this.gatewayService.addLog("INFO", `Harvested plant ID: ${plantId} with quantity: ${quantity} by user ID: ${req.user?.id}`);
        res.status(200).json({ success: true, message: "Plant harvested successfully" });
      } else {
        res.status(400).json({ success: false, message: "Failed to harvest plant" });
      }
    } catch (error) {
      console.error("GatewayController.harvestPlant error:", error);
      await this.gatewayService.addLog("ERROR", `Error harvesting plant: ${(error as Error).message}`);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  // Processing
  private async createPerfumeBatch(req: Request, res: Response): Promise<void> {
    try {
      const { perfume, numberOfBottles } = req.body;
      const perfumes = await this.gatewayService.createPerfumeBatch(perfume, numberOfBottles);
      if (perfumes.length > 0) {
        await this.gatewayService.addLog("INFO", `Created perfume batch of size: ${numberOfBottles} by user ID: ${req.user?.id}`);
        res.status(201).json({ success: true, perfumes });
      } else {
        res.status(400).json({ success: false, message: "Failed to create perfume batch" });
      }
    } catch (error) {
      console.error("GatewayController.createPerfumeBatch error:", error);
      await this.gatewayService.addLog("ERROR", `Error creating perfume batch: ${(error as Error).message}`);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  private async testProductionService(): Promise<void> {
    try {
      const plants = await this.gatewayService.getAllPlants();
    } catch (error) {
      console.error("GatewayController.testProductionService error:", error);
    }
    try {
      const plants = await this.gatewayService.getAllFieldPlants();
    } catch (error) {
      console.error("GatewayController.testProductionService error:", error);
    }
    try {
      const success = await this.gatewayService.plantHerb(1, 5);
    } catch (error) {
      console.error("GatewayController.testProductionService error:", error);
    }
    try {
      const success = await this.gatewayService.changeAromaticPower(1, 10);
    } catch (error) {
      console.error("GatewayController.testProductionService error:", error);
    }
    try {
      const success = await this.gatewayService.harvestPlant(1, 3);
    } catch (error) {
      console.error("GatewayController.testProductionService error:", error);
    }
    try {
      const perfume = {
        id: 0,
        name: "Test Perfume",
        serialNumber: "PP-2025-0001",
        type: PerfumeType.PERFUME,
        quantity: 100,
        plantId: 1,
        state: PerfumeState.PRODUCED,
        expirationDate: "2026-12-31"
      } as PerfumeDTO;
      const perfumes = await this.gatewayService.createPerfumeBatch(perfume, 10);
    } catch (error) {
      console.error("GatewayController.testProductionService error:", error);
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
