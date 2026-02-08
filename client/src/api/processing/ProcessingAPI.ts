import axios, { AxiosInstance, AxiosResponse } from "axios";
import { PerfumeDTO } from "../../models/perfume/PerfumeDTO";
import { IProcessingAPI } from "./IProcessingAPI";

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

  async getAllPerfumes(token: string): Promise<PerfumeDTO[]> {
    const response: AxiosResponse<{ success: boolean; data: PerfumeDTO[] }> = await this.axiosInstance.get("/processing/perfumes", {
      headers: this.getAuthHeaders(token),
    });
    return response.data.data;
  }

  async getPerfumeById(id: number, token: string): Promise<PerfumeDTO> {
    const response: AxiosResponse<{ success: boolean; data: PerfumeDTO }> = await this.axiosInstance.get(`/processing/perfumes/${id}`, {
      headers: this.getAuthHeaders(token),
    });
    return response.data.data;
  }

  async createPerfume(perfume: PerfumeDTO, token: string): Promise<PerfumeDTO> {
    const response: AxiosResponse<{ success: boolean; data: PerfumeDTO }> = await this.axiosInstance.post("/processing/perfumes", perfume, {
      headers: this.getAuthHeaders(token),
    });
    return response.data.data;
  }

  async updatePerfume(id: number, perfume: PerfumeDTO, token: string): Promise<PerfumeDTO> {
    const response: AxiosResponse<{ success: boolean; data: PerfumeDTO }> = await this.axiosInstance.put(`/processing/perfumes/${id}`, perfume, {
      headers: this.getAuthHeaders(token),
    });
    return response.data.data;
  }

  async deletePerfume(id: number, token: string): Promise<void> {
    await this.axiosInstance.delete(`/processing/perfumes/${id}`, {
      headers: this.getAuthHeaders(token),
    });
  }

  async startProcessing(perfume: PerfumeDTO, token: string): Promise<PerfumeDTO> {
    const response: AxiosResponse<{ success: boolean; data: PerfumeDTO }> = await this.axiosInstance.post(`/processing/perfumes/${perfume.id}/start-processing`, perfume, {
      headers: this.getAuthHeaders(token),
    });
    return response.data.data;
  }
}
