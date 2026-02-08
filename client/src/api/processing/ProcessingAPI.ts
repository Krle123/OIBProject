import { PerfumeDTO } from "../../models/perfume/PerfumeDTO";
import { IProcessingAPI } from "./IProcessingAPI";

export class ProcessingAPI implements IProcessingAPI {
    private apiUrl: string;

    constructor(apiUrl: string = "http://localhost:3002") {
        this.apiUrl = apiUrl;
    }

    async getAllPerfumes(token: string): Promise<PerfumeDTO[]> {
        try {
            const response = await fetch(`${this.apiUrl}/api/perfumes`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch perfumes: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error fetching perfumes:", error);
            throw error;
        }
    }

    async getPerfumeById(id: number, token: string): Promise<PerfumeDTO> {
        try {
            const response = await fetch(`${this.apiUrl}/api/perfumes/${id}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch perfume: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error fetching perfume:", error);
            throw error;
        }
    }

    async createPerfume(perfume: PerfumeDTO, token: string): Promise<PerfumeDTO> {
        try {
            const response = await fetch(`${this.apiUrl}/api/perfumes`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(perfume)
            });

            if (!response.ok) {
                throw new Error(`Failed to create perfume: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error creating perfume:", error);
            throw error;
        }
    }

    async updatePerfume(id: number, perfume: PerfumeDTO, token: string): Promise<PerfumeDTO> {
        try {
            const response = await fetch(`${this.apiUrl}/api/perfumes/${id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(perfume)
            });

            if (!response.ok) {
                throw new Error(`Failed to update perfume: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error updating perfume:", error);
            throw error;
        }
    }

    async deletePerfume(id: number, token: string): Promise<void> {
        try {
            const response = await fetch(`${this.apiUrl}/api/perfumes/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to delete perfume: ${response.statusText}`);
            }
        } catch (error) {
            console.error("Error deleting perfume:", error);
            throw error;
        }
    }

    async startProcessing(perfume: PerfumeDTO, token: string): Promise<PerfumeDTO> {
        try {
            const response = await fetch(`${this.apiUrl}/api/perfumes/${perfume.id}/start-processing`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(perfume)
            });

            if (!response.ok) {
                throw new Error(`Failed to start processing: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error starting processing:", error);
            throw error;
        }
    }
}
