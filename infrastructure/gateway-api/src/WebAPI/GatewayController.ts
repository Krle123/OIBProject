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
import { AnalysisType } from "../Domain/enums/AnalysisType";
import { PerformanceAlgorithmType } from "../Domain/enums/PerformanceAlgorithmType";
import { StorageDTO } from "../Domain/DTOs/StorageDTO";
import { SaleType } from "../Domain/enums/SaleType";
import { PaymentMethod } from "../Domain/enums/PaymentMethod";

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
    this.router.get("/users/:id", authenticate, authorize("admin", "manager", "seller"), this.getUserById.bind(this));

    // Logs
    this.router.post("/logs/add", authenticate, authorize("admin"), this.addLog.bind(this));
    this.router.put("/logs/update/:id", authenticate, authorize("admin"), this.updateLog.bind(this));
    this.router.delete("/logs/:id", authenticate, authorize("admin"), this.deleteLog.bind(this));
    this.router.get("/logs", authenticate, authorize("admin"), this.searchLogs.bind(this));

    // Production
    this.router.get("/plants/:id", authenticate, authorize("admin", "seller", "manager"), this.getPlantsById.bind(this));
    this.router.get("/plants", authenticate, authorize("admin", "seller", "manager"), this.getAllPlants.bind(this));
    this.router.get("/field-plants/state/:state", authenticate, authorize("admin", "seller", "manager"), this.getPlantsByState.bind(this));
    this.router.get("/field-plants", authenticate, authorize("admin", "seller", "manager"), this.getAllFieldPlants.bind(this));
    this.router.post("/production/plant", authenticate, authorize("manager", "seller"), this.plantHerb.bind(this));
    this.router.put("/production/aromatic-power/:id", authenticate, authorize("manager", "seller"), this.changeAromaticPower.bind(this));
    this.router.post("/production/harvest", authenticate, authorize("manager", "seller"), this.harvestPlant.bind(this));

    // Processing
    this.router.post("/processing/perfumes/create", authenticate, authorize("manager", "seller"), this.createPerfumeBatch.bind(this));
    this.router.post('/processing/packaging/send-to-storage', authenticate, authorize("manager", "seller"), this.sendPackagingToStorage.bind(this));
    this.router.post('/processing/packaging/package-perfume', authenticate, authorize("manager", "seller"), this.packagePerfume.bind(this));
    this.router.get('/processing/perfumes', authenticate, authorize("manager", "seller"), this.getCatalogPerfumes.bind(this));

    // Analytics
    this.router.get("/analytics/sales/by-month", authenticate, authorize("admin"), this.calculateSalesByMonth.bind(this));
    this.router.get("/analytics/sales/by-year", authenticate, authorize("admin"), this.calculateSalesByYear.bind(this));
    this.router.get("/analytics/sales/by-week", authenticate, authorize("admin"), this.calculateSalesByWeek.bind(this));
    this.router.get("/analytics/sales/total", authenticate, authorize("admin"), this.calculateTotalSales.bind(this));
    this.router.get("/analytics/sales/trend", authenticate, authorize("admin"), this.analyzeSalesTrend.bind(this));

    this.router.get("/analytics/sales/top-10/best-selling", authenticate, authorize("admin"), this.getTop10BestSellingPerfumes.bind(this));

    this.router.get("/analytics/reports", authenticate, authorize("admin"), this.getAllAnalysisReports.bind(this));
    this.router.get("/analytics/reports/:id", authenticate, authorize("admin"), this.getAnalysisReportById.bind(this));
    this.router.get("/analytics/reports/type/:type", authenticate, authorize("admin"), this.getAnalysisReportsByType.bind(this));

    // Performance
    this.router.post("/simulate", authenticate, authorize("admin"), this.runSimulation.bind(this));

    this.router.get("/performance/reports", authenticate, authorize("admin"), this.getAllPerformanceReports.bind(this));
    this.router.get("/performance/reports/:id", authenticate, authorize("admin"), this.getPerformanceReportById.bind(this));
    this.router.get("/performance/reports/algorithm/:algorithmType", authenticate, authorize("admin"), this.getPerformanceReportsByAlgorithmType.bind(this));
    this.router.get("/performance/reports/:id/pdf", authenticate, authorize("admin"), this.downloadPerformanceReportPDF.bind(this));

    // Storage
    this.router.get("/storage/all", authenticate, authorize("manager", "seller"), this.getAllStorages.bind(this));
    this.router.get("/storage/:id", authenticate, authorize("manager", "seller"), this.getStorageById.bind(this));
    this.router.post("/storage/create", authenticate, authorize("manager"), this.createStorage.bind(this));
    this.router.put("/storage/:id/capacity", authenticate, authorize("manager", "seller"), this.updateStorageCapacity.bind(this));

    // Sales
    this.router.post("/sales/process", authenticate, authorize("manager", "seller"), this.processSale.bind(this));
    this.router.get("/sales/receipts", authenticate, authorize("manager", "seller", "admin"), this.getAllReceipts.bind(this));
    this.router.get("/sales/receipt/:id", authenticate, authorize("manager", "seller"), this.getReceiptById.bind(this));
    this.router.get("/sales/catalog", authenticate, authorize("manager", "seller"), this.getCatalog.bind(this));
  }

  // Auth
  private async login(req: Request, res: Response): Promise<void> {
    await this.gatewayService.addLog("INFO", `Login attempt for user: ${req.body.username}`);
    const data: LoginUserDTO = req.body;
    const result = await this.gatewayService.login(data);
    await this.gatewayService.addLog("INFO", `User logged in: ${data.username}`);
    res.status(200).json(result);
  }

  private async register(req: Request, res: Response): Promise<void> {
    await this.gatewayService.addLog("INFO", `Registration attempt for user: ${req.body.username}`);
    const data: RegistrationUserDTO = req.body;
    console.log("GatewayController.register - Request body:", req.body);
    const result = await this.gatewayService.register(data);
    console.log("GatewayController.register - Registration result:", result);
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
      res.status(200).json({ success: true, data: plants });
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
      res.status(200).json({ success: true, data: plants });
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
      res.status(200).json({ success: true, data:plants });
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
      res.status(200).json({ success: true, data:plants });
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
      console.log(`Received harvest request for plantId: ${plantId}, quantity: ${quantity}`);
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
        res.status(201).json({ success: true, data: perfumes });
      } else {
        res.status(400).json({ success: false, message: "Failed to create perfume batch" });
      }
    } catch (error) {
      console.error("GatewayController.createPerfumeBatch error:", error);
      await this.gatewayService.addLog("ERROR", `Error creating perfume batch: ${(error as Error).message}`);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  private async sendPackagingToStorage(req: Request, res: Response): Promise<void> {
    try {
      const { storageId } = req.body;
      const packaging = await this.gatewayService.sendPackagingToStorage(storageId);
      if (packaging) {
        await this.gatewayService.addLog("INFO", `Sent packaging to storage ID: ${storageId} by user ID: ${req.user?.id}`);
        res.status(200).json({ success: true, data: packaging });
      } else {
        res.status(400).json({ success: false, message: "Failed to send packaging to storage" });
      }
    } catch (error) {
      console.error("GatewayController.sendPackagingToStorage error:", error);
      await this.gatewayService.addLog("ERROR", `Error sending packaging to storage: ${(error as Error).message}`);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  private async packagePerfume(req: Request, res: Response): Promise<void> {
    try {
      const { serialNumber, numberOfBottles } = req.body;
      const packaging = await this.gatewayService.packagePerfume(serialNumber, numberOfBottles);
      if (packaging) {
        await this.gatewayService.addLog("INFO", `Packaged perfume with serial number: ${serialNumber} and quantity: ${numberOfBottles} by user ID: ${req.user?.id}`);
        res.status(200).json({ success: true, data: packaging });
      } else {
        res.status(400).json({ success: false, message: "Failed to package perfume" });
      }
    } catch (error) {
      console.error("GatewayController.packagePerfume error:", error);
      await this.gatewayService.addLog("ERROR", `Error packaging perfume: ${(error as Error).message}`);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  async getCatalogPerfumes(req: Request, res: Response): Promise<void> {
    try {
      const perfumes = await this.gatewayService.getCatalogPerfumes();
      await this.gatewayService.addLog("INFO", `Fetched catalog perfumes requested by user ID: ${req.user?.id}`);
      res.status(200).json({ success: true, data: perfumes });
    } catch (error) {
      console.error("GatewayController.getCatalogPerfumes error:", error);
      await this.gatewayService.addLog("ERROR", `Error fetching catalog perfumes: ${(error as Error).message}`);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  // Analytics
  private async calculateSalesByMonth(req: Request, res: Response): Promise<void> {
    try {
      const { month, year } = req.query;
      const userId = req.user?.id;
      const report = await this.gatewayService.calculateSalesByMonth(parseInt(month as string), parseInt(year as string), userId);
      res.status(200).json({ success: true, data: report });
    } catch (error) {
      console.error("GatewayController.calculateSalesByMonth error:", error);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  private async calculateSalesByYear(req: Request, res: Response): Promise<void> {
    try {
      const { year } = req.query;
      const userId = req.user?.id;
      const report = await this.gatewayService.calculateSalesByYear(parseInt(year as string), userId);
      res.status(200).json({ success: true, data: report });
    } catch (error) {
      console.error("GatewayController.calculateSalesByYear error:", error);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  private async calculateSalesByWeek(req: Request, res: Response): Promise<void> {
    try {
      const { weekNumber, year } = req.query;
      const userId = req.user?.id;
      const report = await this.gatewayService.calculateSalesByWeek(parseInt(weekNumber as string), parseInt(year as string), userId);
      res.status(200).json({ success: true, data: report });
    } catch (error) {
      console.error("GatewayController.calculateSalesByWeek error:", error);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  private async calculateTotalSales(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const report = await this.gatewayService.calculateTotalSales(userId);
      res.status(200).json({ success: true, data: report });
    } catch (error) {
      console.error("GatewayController.calculateTotalSales error:", error);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  private async analyzeSalesTrend(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      const userId = req.user?.id;
      const report = await this.gatewayService.analyzeSalesTrend(startDate as string, endDate as string, userId);
      res.status(200).json({ success: true, data: report });
    } catch (error) {
      console.error("GatewayController.analyzeSalesTrend error:", error);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  private async getTop10BestSellingPerfumes(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const reports = await this.gatewayService.getTop10BestSellingPerfumes(userId);
      res.status(200).json({ success: true, data: reports });
    } catch (error) {
      console.error("GatewayController.getTop10BestSellingPerfumes error:", error);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  private async getTop10RevenueByPerfume(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const reports = await this.gatewayService.getTop10RevenueByPerfume(userId);
      res.status(200).json({ success: true, data: reports });
    } catch (error) {
      console.error("GatewayController.getTop10RevenueByPerfume error:", error);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  private async getAllAnalysisReports(req: Request, res: Response): Promise<void> {
    try {
      const reports = await this.gatewayService.getAllAnalysisReports();
      res.status(200).json({ success: true, data: reports });
    } catch (error) {
      console.error("GatewayController.getAllAnalysisReports error:", error);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  private async getAnalysisReportById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const report = await this.gatewayService.getAnalysisReportById(parseInt(id));
      res.status(200).json({ success: true, data: report });
    } catch (error) {
      console.error("GatewayController.getAnalysisReportById error:", error);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  private async getAnalysisReportsByType(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.params;
      const reports = await this.gatewayService.getAnalysisReportsByType(type as AnalysisType);
      res.status(200).json({ success: true, data: reports });
    } catch (error) {
      console.error("GatewayController.getAnalysisReportsByType error:", error);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  private async downloadAnalysisReportPDF(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const pdfBuffer = await this.gatewayService.downloadAnalysisReportPDF(parseInt(id));
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=report_${id}.pdf`);
      res.status(200).send(pdfBuffer);
    } catch (error) {
      console.error("GatewayController.downloadAnalysisReportPDF error:", error);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  // Performance
  private async runSimulation(req: Request, res: Response): Promise<void> {
    try {
      const { algorithmType, numberOfPackages } = req.body;
      const userId = req.user?.id;
      const report = await this.gatewayService.runSimulation(algorithmType, numberOfPackages, userId);
      res.status(200).json({ success: true, data: report });
    } catch (error) {
      console.error("GatewayController.runSimulation error:", error);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  } 

  private async getAllPerformanceReports(req: Request, res: Response): Promise<void> {
    try {
      const reports = await this.gatewayService.getAllPerformanceReports();
      res.status(200).json({ success: true, data: reports });
    } catch (error) {
      console.error("GatewayController.getAllPerformanceReports error:", error);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  private async getPerformanceReportById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const report = await this.gatewayService.getPerformanceReportById(parseInt(id));
      res.status(200).json({ success: true, data: report });
    } catch (error) {
      console.error("GatewayController.getPerformanceReportById error:", error);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  private async getPerformanceReportsByAlgorithmType(req: Request, res: Response): Promise<void> {
    try {
      const { algorithmType } = req.params;
      const reports = await this.gatewayService.getPerformanceReportsByAlgorithmType(algorithmType as PerformanceAlgorithmType);
      res.status(200).json({ success: true, data: reports });
    } catch (error) {
      console.error("GatewayController.getPerformanceReportsByAlgorithmType error:", error);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  private async downloadPerformanceReportPDF(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const pdfBuffer = await this.gatewayService.downloadPerformanceReportPDF(parseInt(id));
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=performance_report_${id}.pdf`);
      res.status(200).send(pdfBuffer);
    } catch (error) {
      console.error("GatewayController.downloadPerformanceReportPDF error:", error);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  // Storage
  private async getAllStorages(req: Request, res: Response): Promise<void> {
    try {
      await this.gatewayService.addLog("INFO", `Fetching all storages requested by user ID: ${req.user?.id}`);
      const storages = await this.gatewayService.getAllStorages();
      res.status(200).json({ success: true, data: storages });
    } catch (error) {
      console.error("GatewayController.getAllStorages error:", error);
      await this.gatewayService.addLog("ERROR", `Error fetching all storages: ${(error as Error).message}`);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  private async getStorageById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.gatewayService.addLog("INFO", `Fetching storage ID: ${id} requested by user ID: ${req.user?.id}`);
      const storage = await this.gatewayService.getStorageById(parseInt(id));
      res.status(200).json({ success: true, data: storage });
    } catch (error) {
      console.error("GatewayController.getStorageById error:", error);
      await this.gatewayService.addLog("ERROR", `Error fetching storage: ${(error as Error).message}`);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  private async createStorage(req: Request, res: Response): Promise<void> {
    try {
      const { name, location, maxCapacity, type } = req.body;
      await this.gatewayService.addLog("INFO", `Creating storage: ${name} by user ID: ${req.user?.id}`);
      const storage = await this.gatewayService.createStorage({ name, location, maxCapacity, type, currentCapacity: 0 });
      await this.gatewayService.addLog("INFO", `Storage created successfully: ${name}`);
      res.status(201).json({ success: true, data: storage });
    } catch (error) {
      console.error("GatewayController.createStorage error:", error);
      await this.gatewayService.addLog("ERROR", `Error creating storage: ${(error as Error).message}`);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  private async updateStorageCapacity(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { increment } = req.body;
      await this.gatewayService.addLog("INFO", `Updating storage capacity for ID: ${id} by user ID: ${req.user?.id}`);
      const storage = await this.gatewayService.updateStorageCapacity(parseInt(id), increment);
      await this.gatewayService.addLog("INFO", `Storage capacity updated for ID: ${id}`);
      res.status(200).json({ success: true, data: storage });
    } catch (error) {
      console.error("GatewayController.updateStorageCapacity error:", error);
      await this.gatewayService.addLog("ERROR", `Error updating storage capacity: ${(error as Error).message}`);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  // Sales
  private async processSale(req: Request, res: Response): Promise<void> {
    try {
      const { perfumeSerialNumber, quantity, saleType, paymentMethod, sellerId } = req.body;
      await this.gatewayService.addLog("INFO", `Processing sale for perfume: ${perfumeSerialNumber} by user ID: ${req.user?.id}`);
      const receipt = await this.gatewayService.processSale(
        perfumeSerialNumber,
        quantity,
        saleType as SaleType,
        paymentMethod as PaymentMethod,
        sellerId || req.user?.id,
        req.user?.role || "SELLER"
      );
      await this.gatewayService.addLog("INFO", `Sale processed successfully for perfume: ${perfumeSerialNumber}`);
      res.status(201).json({ success: true, data: receipt });
    } catch (error) {
      console.error("GatewayController.processSale error:", error);
      await this.gatewayService.addLog("ERROR", `Error processing sale: ${(error as Error).message}`);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  private async getAllReceipts(req: Request, res: Response): Promise<void> {
    try {
      await this.gatewayService.addLog("INFO", `Fetching all receipts requested by user ID: ${req.user?.id}`);
      const receipts = await this.gatewayService.getAllReceipts();
      res.status(200).json({ success: true, data: receipts });
    } catch (error) {
      console.log("GatewayController.getAllReceipts body:", req.body);
      await this.gatewayService.addLog("ERROR", `Error fetching receipts: ${(error as Error).message}`);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  private async getReceiptById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.gatewayService.addLog("INFO", `Fetching receipt ID: ${id} requested by user ID: ${req.user?.id}`);
      const receipt = await this.gatewayService.getReceiptById(parseInt(id));
      res.status(200).json({ success: true, data: receipt });
    } catch (error) {
      console.error("GatewayController.getReceiptById error:", error);
      await this.gatewayService.addLog("ERROR", `Error fetching receipt: ${(error as Error).message}`);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  private async getCatalog(req: Request, res: Response): Promise<void> {
    try {
      await this.gatewayService.addLog("INFO", `Fetching perfume catalog requested by user ID: ${req.user?.id}`);
      const catalog = await this.gatewayService.getCatalog();
      res.status(200).json({ success: true, data: catalog });
    } catch (error) {
      console.error("GatewayController.getCatalog error:", error);
      await this.gatewayService.addLog("ERROR", `Error fetching catalog: ${(error as Error).message}`);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
