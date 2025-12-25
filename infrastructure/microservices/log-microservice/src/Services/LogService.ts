import { ILogService } from "../Domain/services/ILogService";
import { Repository } from "typeorm";
import { Log } from "../Domain/models/Log";
import { LogType } from "../Domain/enums/LogType";
import { LogDTO } from "../Domain/DTOs/LogDTO";

export class LogService implements ILogService {
    constructor(private logRepository: Repository<Log>) {}

    async addLog(type: string, description: string): Promise<void> 
    {
        const logEntry = this.logRepository.create({
            type: type as LogType,
            description: description,
        });
        console.log("LogService.addLog: Created log entry:", logEntry);
        await this.logRepository.save(logEntry);  
        console.log("LogService.addLog: Log entry saved to database"); 
    }

    async updateLog(id: number, description: string): Promise<void> 
    {
        await this.logRepository.update(id, { description });
    }

    async deleteLog(id: number): Promise<void> 
    {
        await this.logRepository.delete(id);
    }

    async searchLogs(type?: string, fromTs?: string, toTs?: string): Promise<LogDTO[]> {
        const query = this.logRepository.createQueryBuilder("log");

        if (type) {
            query.andWhere("log.type = :type", { type });
        }
        if (fromTs) {
            query.andWhere("log.ts >= :fromTs", { fromTs });
        }
        if (toTs) {
            query.andWhere("log.ts <= :toTs", { toTs });
        }
        const logs = await query.getMany();

        if (logs.length > 0) {
            return logs.map(log => ({
                id: log.id,
                ts: log.ts,
                type: log.type,
                description: log.description,
            }));
        }
        return [];
    }
}