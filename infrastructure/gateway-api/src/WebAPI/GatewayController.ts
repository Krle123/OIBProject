import { Request, Response, Router } from "express";
import { IGatewayService } from "../Domain/services/IGatewayService";
import { LoginUserDTO } from "../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../Domain/DTOs/RegistrationUserDTO";
import { authenticate } from "../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../Middlewares/authorization/AuthorizeMiddleware";

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
  }

  // Auth
  private async login(req: Request, res: Response): Promise<void> {
    const data: LoginUserDTO = req.body;
    const result = await this.gatewayService.login(data);
    res.status(200).json(result);
  }

  private async register(req: Request, res: Response): Promise<void> {
    const data: RegistrationUserDTO = req.body;
    const result = await this.gatewayService.register(data);
    res.status(200).json(result);
  }

  // Users
  private async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.gatewayService.getAllUsers();
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (!req.user || req.user.id !== id) {
        res.status(401).json({ message: "You can only access your own data!" });
        return;
      }

      const user = await this.gatewayService.getUserById(id);
      res.status(200).json(user);
    } catch (err) {
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

  public getRouter(): Router {
    return this.router;
  }
}
