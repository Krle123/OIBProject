import axios, { AxiosInstance, AxiosResponse } from "axios";
import { PlantDTO } from "../../models/plants/PlantDTO";
import { IPlantAPI } from "./IPlantAPI";

export class PlantAPI implements IPlantAPI {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_GATEWAY_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  private getAuthHeaders(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  async getAllPlants(token: string): Promise<PlantDTO[]> {
    const response: AxiosResponse<{ success: boolean; data: PlantDTO[] }> = await this.axiosInstance.get("/plants", {
      headers: this.getAuthHeaders(token),
    });
    return response.data.data;
  }

  async getAllFieldPlants(token: string): Promise<PlantDTO[]> {
    const response: AxiosResponse<{ success: boolean; data: PlantDTO[] }> = await this.axiosInstance.get("/field-plants", {
      headers: this.getAuthHeaders(token),
    });
    console.log("PlantAPI.getAllFieldPlants response data:", response.data);
    console.log("PlantAPI.getAllFieldPlants response:", response);
    return response.data.data;
  }

  async getPlantById(id: number, token: string): Promise<PlantDTO> {
    const response: AxiosResponse<PlantDTO> = await this.axiosInstance.get(`/plants/${id}`, {
      headers: this.getAuthHeaders(token),
    });
    return response.data;
  }

  async plantHerb(plantId: number, quantity: number, token: string): Promise<boolean> {
    const response: AxiosResponse<{ success: boolean; data: boolean }> = await this.axiosInstance.post("/production/plant", {
      plantId,
      quantity,
    }, {
      headers: this.getAuthHeaders(token),
    });
    return response.data.data;
  }

  async changeAromaticPower(id: number, changePercentage: number, token: string): Promise<boolean> {
    const response: AxiosResponse<{ success: boolean; data: boolean }> = await this.axiosInstance.put(`/production/aromatic-power/${id}`, {
      changePercentage,
    }, {
      headers: this.getAuthHeaders(token),
    });
    return response.data.data;
  }

  async harvestPlant(plantId: number, quantity: number, token: string): Promise<boolean> {
    const response: AxiosResponse<{ success: boolean; message: string }> = await this.axiosInstance.post(`/production/harvest`, { plantId, quantity }, {
      headers: this.getAuthHeaders(token),
    });
    return response.data.success;
  }

  async getProductionLogs(token: string): Promise<any[]> {
    const response: AxiosResponse<{ success: boolean; data: any[] }> = await this.axiosInstance.get(`/production/logs`, {
      headers: this.getAuthHeaders(token),
    });
    return response.data.data || [];
  }
}