import { Request, Response, Router } from 'express';
import jwt from "jsonwebtoken";
import { ILogService } from '../../Domain/services/ILogService';
import { LogDTO } from '../../Domain/DTO/LogDTO';
import { LogType } from '../../Domain/enums/LogType';

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
      console.log("LogController.addLog called with:", { type, description });

      // Basic validation
      if (!type || !description) {
        res.status(400).json({ success: false, message: "Missing 'type' or 'description' in body" });
        return;
      }

      const validTypes = Object.values(LogType);
      if (!validTypes.includes(type as LogType)) {
        res.status(400).json({ success: false, message: `Invalid log type. Valid types: ${validTypes.join(",")}` });
        return;
      }

      await this.logService.addLog(type, description);
      console.log("LogController.addLog: Log added successfully");
      res.status(201).json({ success: true, message: "Log added successfully" });
    } catch (error) {
      console.error("LogController.addLog error:", error);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  private async updateLog(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const { description } = req.body;
      await this.logService.updateLog(id, description);
      res.status(200).json({ success: true, message: "Log updated successfully" });
    } catch (error) {
      console.error("LogController.updateLog error:", error);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }
  private async deleteLog(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await this.logService.deleteLog(id);
      res.status(200).json({ success: true, message: "Log deleted successfully" });
    } catch (error) {
      console.error("LogController.deleteLog error:", error);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
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
      console.error("LogController.searchLogs error:", error);
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}