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

    async getPackagingsFromStorage(storageId: number, numberOfPackages: number, perfumeSerialNumber: string): Promise<any[]> {
        try {
            console.log(`[CommunicationService.getPackagingsFromStorage] Requesting ${numberOfPackages} packages from storage ${storageId} with perfumeSerialNumber: ${perfumeSerialNumber}`);
            const response = await this.processingClient.post("/processing/packaging/send-to-storage", {
                storageId,
                numberOfPackages,
                perfumeSerialNumber
            });
            await this.logEvent("INFO", `Retrieved ${numberOfPackages} packages from storage ${storageId}`);
            // Processing service returns a single package object, wrap it in an array
            const data = response.data.data;
            return Array.isArray(data) ? data : [data];
        } catch (error: any) {
            await this.logEvent("ERROR", `Failed to get packages from storage: ${error.message}`);
            throw new Error("Failed to get packages from storage");
        }
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
