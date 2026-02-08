import axios, { AxiosInstance, AxiosResponse } from "axios";
import { PerfumeDTO } from "../../models/perfume/PerfumeDTO";
import { IProcessingAPI } from "./IProcessingAPI";
import { CatalogPerfumeDTO } from "../../models/perfume/CatalogPerfumeDTO";

export class ProcessingAPI implements IProcessingAPI {
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

  async createPerfumeBatch(perfume: PerfumeDTO, numberOfBottles: number, token: string): Promise<PerfumeDTO[]> {
    const response: AxiosResponse<{ success: boolean; data: PerfumeDTO[] }> = await this.axiosInstance.post("/processing/perfumes/create", {
      perfume,
      numberOfBottles,
    }, {
      headers: this.getAuthHeaders(token),
    });
    return response.data.data;
  }

  async sendPackagingToStorage(storageId: number, token: string): Promise<any> {
    const response: AxiosResponse<{ success: boolean; data: any }> = await this.axiosInstance.post("/processing/packaging/send-to-storage", {
      storageId,
    }, {
      headers: this.getAuthHeaders(token),
    });
    return response.data.data;
  }

  async packagePerfume(serialNumber: string, numberOfBottles: number, token: string): Promise<any> {
    const response: AxiosResponse<{ success: boolean; data: any }> = await this.axiosInstance.post("/processing/packaging/package-perfume", {
      serialNumber,
      numberOfBottles,
    }, {
      headers: this.getAuthHeaders(token),
    });
    return response.data.data;
  }

  async getCatalogPerfumes(token: string): Promise<CatalogPerfumeDTO[]> {
    const response: AxiosResponse<{ success: boolean; data: CatalogPerfumeDTO[] }> = await this.axiosInstance.get("/processing/perfumes", {
      headers: this.getAuthHeaders(token),
    });
    return response.data.data;
  }
}
