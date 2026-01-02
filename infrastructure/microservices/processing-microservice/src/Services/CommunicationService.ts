import { ICommunicationService } from "../Domain/services/ICommunicationService";
import { FieldPlantDTO } from "../Domain/DTOs/FieldPlantDTO";
import axios, { AxiosInstance } from "axios";

export class CommunicationService implements ICommunicationService {
    private readonly productionClient: AxiosInstance;

    constructor() {
        const productionBaseURL = process.env.PRODUCTION_SERVICE_API;

        this.productionClient = axios.create({
            baseURL: productionBaseURL,
            headers: { "Content-Type": "application/json" },
            timeout: 5000,
        });
    }

        async plantHerb(id: number, quantity: number): Promise<number[]> {
        try {
            const response = await this.productionClient.post<number[]>("/production/plant", { id, quantity });
            return response.data;
        }
        catch {
            return [];
        }
    }

    async changeAromaticPower(plantId: number, changePercentage: number): Promise<boolean> {
        try {
            const response = await this.productionClient.put<boolean>("/production/aromatic-power", { plantId, changePercentage });
            return response.data;
        }
        catch {
            return false;
        }
    }

    async harvestPlant(plantId: number, quantity: number): Promise<FieldPlantDTO[]> {
        try {
            const response = await this.productionClient.post<FieldPlantDTO[]>("/production/harvest", { plantId, quantity });
            return response.data;
        }
        catch {
            return [];
        }
    }

    async processPlant(plantId: number): Promise<boolean> {
        try {
            const response = await this.productionClient.post<boolean>("/production/process", { plantId });
            return response.data;
        }
        catch {
            return false;
        }
    }
}
