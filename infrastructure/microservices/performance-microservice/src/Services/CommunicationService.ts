import axios, { AxiosInstance } from "axios";
import { ICommunicationService } from "../Domain/services/ICommunicationService";

export class CommunicationService implements ICommunicationService {
    private readonly logClient: AxiosInstance;

    constructor() {
        const logBaseURL = process.env.LOG_SERVICE_API || "http://localhost:3004/api/v1";

        this.logClient = axios.create({
            baseURL: logBaseURL,
            headers: { "Content-Type": "application/json" },
            timeout: 5000,
        });
    }

    async logEvent(type: string, description: string): Promise<void> {
        try {
            await this.logClient.post("/logs/add", {
                type,
                description,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            console.error("Failed to log event:", error.message);
        }
    }
}
