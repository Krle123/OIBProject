import { Request, Response, Router } from 'express';
import jwt from "jsonwebtoken";
import { ILogService } from '../../Domain/services/ILogService';
import { LogDTO } from '../../Domain/DTO/LogDTO';

export class LogController {
  private router: Router;
  private readonly logService: ILogService;
  private readonly jwtSecret: string;

  constructor(logService: ILogService) {
    this.router = Router();
    this.logService = logService;
    this.jwtSecret = process.env.JWT_SECRET ?? "";
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/logs/add', this.addLog.bind(this));
    this.router.put('/logs/update/:id', this.updateLog.bind(this));
    this.router.delete('/logs/:id', this.deleteLog.bind(this));
    this.router.get('/logs', this.searchLogs.bind(this));
  }

  private async addLog(req: Request, res: Response): Promise<void> {
    try {
      const { type, description } = req.body;
      await this.logService.addLog(type, description);
      res.status(201).json({ success: true, message: "Log added successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  private async updateLog(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const { description } = req.body;
      await this.logService.updateLog(id, description);
      res.status(200).json({ success: true, message: "Log updated successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
  private async deleteLog(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await this.logService.deleteLog(id);
      res.status(200).json({ success: true, message: "Log deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  private async searchLogs(req: Request, res: Response): Promise<void> {
    try {
      const { type, fromTs, toTs } = req.query;
      const logs: LogDTO[] = await this.logService.searchLogs(
        type as string | undefined,
        fromTs as string | undefined,
        toTs as string | undefined
      );
      res.status(200).json({ success: true, logs });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}