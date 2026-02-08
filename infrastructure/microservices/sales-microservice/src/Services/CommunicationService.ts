import axios, { AxiosInstance } from "axios";
import { ICommunicationService } from "../Domain/services/ICommunicationService";

export class CommunicationService implements ICommunicationService {
    private readonly processingClient: AxiosInstance;
    private readonly logClient: AxiosInstance;
    private readonly analysisClient: AxiosInstance;
    private readonly storageClient: AxiosInstance;

    constructor() {
        const processingBaseURL = process.env.PROCESSING_SERVICE_API;
        const logBaseURL = process.env.LOG_SERVICE_API;
        const analysisBaseURL = process.env.ANALYSIS_SERVICE_API;
        const storageBaseURL = process.env.STORAGE_SERVICE_API;

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

        this.analysisClient = axios.create({
            baseURL: analysisBaseURL,
            headers: { "Content-Type": "application/json" },
            timeout: 5000,
        });

        this.storageClient = axios.create({
            baseURL: storageBaseURL,
            headers: { "Content-Type": "application/json" },
            timeout: 10000,
        });
    }

    async getAvailablePerfumes(): Promise<any[]> {
        try {
            const response = await this.processingClient.get("/perfumes/available");
            return response.data;
        } catch (error: any) {
            await this.logEvent("ERROR", `Failed to get available perfumes: ${error.message}`);
            throw new Error("Failed to fetch available perfumes from processing service");
        }
    }

    async requestPackaging(perfumeSerialNumber: string, quantity: number): Promise<any> {
        try {
            const response = await this.processingClient.post("/packaging/package", {
                serialNumber: perfumeSerialNumber,
                numberOfBottles: quantity,
            });
            await this.logEvent("INFO", `Packaging requested for perfume ${perfumeSerialNumber}, quantity: ${quantity}`);
            return response.data;
        } catch (error: any) {
            await this.logEvent("ERROR", `Failed to request packaging: ${error.message}`);
            throw new Error("Failed to request packaging from processing service");
        }
    }

    async sendPackagingToStorage(storageId: number): Promise<any> {
        try {
            const response = await this.processingClient.post("/packaging/send-to-storage", {
                storageId: storageId,
            });
            await this.logEvent("INFO", `Packaging sent to storage ${storageId}`);
            return response.data;
        } catch (error: any) {
            await this.logEvent("ERROR", `Failed to send packaging to storage: ${error.message}`);
            throw new Error("Failed to send packaging to storage");
        }
    }

    async getPackagingsFromStorage(storageId: number, numberOfPackages: number): Promise<any[]> {
        try {
            const response = await this.processingClient.get("/packaging/from-storage", {
                params: { storageId, numberOfPackages },
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
            await this.logClient.post("/logs/add", {
                type: type,
                description: description,
            });
        } catch (error: any) {
            console.error(`Failed to log event: ${error.message}`);
        }
    }

    async sendSaleToAnalysis(receiptData: any): Promise<void> {
        try {
            await this.analysisClient.post("/analysis/sales", receiptData);
            await this.logEvent("INFO", `Sale data sent to analysis service: Receipt ID ${receiptData.id}`);
        } catch (error: any) {
            await this.logEvent("WARNING", `Failed to send sale to analysis service: ${error.message}`);
        }
    }

    async sendPackagesToSales(perfumeSerialNumber: string, quantity: number, userRole: string): Promise<any[]> {
        try {
            const response = await this.storageClient.post("/storages/send-packaging", {
                perfumeSerialNumber: perfumeSerialNumber,
                quantity: quantity,
                userRole: userRole
            });
            await this.logEvent("INFO", `Successfully retrieved ${quantity} packages from storage for perfume ${perfumeSerialNumber}`);
            return response.data.data;
        } catch (error: any) {
            await this.logEvent("ERROR", `Failed to retrieve packages from storage: ${error.message}`);
            throw new Error("Failed to retrieve packages from storage for sale");
        }
    }
}
