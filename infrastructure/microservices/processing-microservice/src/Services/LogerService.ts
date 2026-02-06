import axios, { AxiosInstance } from "axios";
import { ILogerService } from "../Domain/services/ILogerService";

export class LogerService implements ILogerService {
    private readonly logClient: AxiosInstance;

    constructor() {
        const logBaseURL = process.env.LOG_SERVICE_API || "http://localhost:5566/api/v1";

        this.logClient = axios.create({
            baseURL: logBaseURL,
            headers: { "Content-Type": "application/json" },
            timeout: 5000,
        });
    }

    async logEvent(type: string, description: string): Promise<void> {
        try {
            await this.logClient.post("/logs/add", {
                type: type,
                description: description,
            });
        } catch (error: any) {
            console.error(`Failed to log event: ${error.message}`);
        }
    }
}
