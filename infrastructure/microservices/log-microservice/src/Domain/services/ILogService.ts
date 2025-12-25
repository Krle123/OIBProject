import type { LogDTO } from "../DTOs/LogDTO";


export interface ILogService {
    addLog(type: string, description: string): Promise<void>;
    updateLog(id: number, description: string): Promise<void>;
    deleteLog(id: number): Promise<void>;
    searchLogs(type?: string, fromTs?: string, toTs?: string): Promise<LogDTO[]>;
}