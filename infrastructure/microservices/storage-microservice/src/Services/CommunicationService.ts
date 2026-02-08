import axios, { AxiosInstance } from "axios";
import { ICommunicationService } from "../Domain/services/ICommunicationService";

export class CommunicationService implements ICommunicationService {
    private readonly processingClient: AxiosInstance;
    private readonly logClient: AxiosInstance;

    constructor() {
        const processingBaseURL = process.env.PROCESSING_SERVICE_API;
        const logBaseURL = process.env.LOG_SERVICE_API;

        this.processingClient = axios.create({
            baseURL: processingBaseURL,
            headers: { "Content-Type": "application/json" },
            timeout: 10000,
        });

        this.logClient = axios.create({
            baseURL: logBaseURL,
            headers: { "Content-Type": "application/json" },
            timeout: 5000,
        });
    }

    async getPackagingsFromStorage(storageId: number, numberOfPackages: number, perfumeSerialNumber?: string): Promise<any[]> {
        try {
            const response = await this.processingClient.get("/packaging/send-to-storage", {
                params: { storageId, numberOfPackages, perfumeSerialNumber },
            });
            await this.logEvent("INFO", `Retrieved ${numberOfPackages} packages from storage ${storageId}`);
            return response.data;
        } catch (error: any) {
            await this.logEvent("ERROR", `Failed to get packages from storage: ${error.message}`);
            throw new Error("Failed to get packages from storage");
        }
    }

    async logEvent(type: string, description: string): Promise<void> {
        try {
            await this.logClient.post("/logs", {
                type: type,
                description: description,
            });
        } catch (error: any) {
            console.error(`Failed to log event: ${error.message}`);
        }
    }
}
