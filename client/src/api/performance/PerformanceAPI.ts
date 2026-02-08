import axios, { AxiosInstance, AxiosResponse } from "axios";
import { IPerformanceAPI } from "./IPerformanceAPI";
import { AnalysisReportDTO } from "../../models/analysis/AnalysisReportDTO";

export class PerformanceAPI implements IPerformanceAPI {
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

  async runSimulation(token: string, algorithmType: string, numberOfPackages: number): Promise<AnalysisReportDTO> {
    const response: AxiosResponse<{ success: boolean; data: AnalysisReportDTO }> = await this.axiosInstance.post("/simulate", {
      algorithmType,
      numberOfPackages,
    }, {
      headers: this.getAuthHeaders(token),
    });
    return response.data.data;
  }

  async getAllReports(token: string): Promise<AnalysisReportDTO[]> {
    const response: AxiosResponse<{ success: boolean; data: AnalysisReportDTO[] }> = await this.axiosInstance.get("/performance/reports", {
      headers: this.getAuthHeaders(token),
    });
    const data = response.data.data;
    return Array.isArray(data) ? data : [];
  }

  async getReportById(token: string, id: number): Promise<AnalysisReportDTO> {
    const response: AxiosResponse<{ success: boolean; data: AnalysisReportDTO }> = await this.axiosInstance.get(`/performance/reports/${id}`, {
      headers: this.getAuthHeaders(token),
    });
    return response.data.data;
  }

  async getReportsByAlgorithmType(token: string, algorithmType: string): Promise<AnalysisReportDTO[]> {
    const response: AxiosResponse<{ success: boolean; data: AnalysisReportDTO[] }> = await this.axiosInstance.get(`/performance/reports/algorithm/${algorithmType}`, {
      headers: this.getAuthHeaders(token),
    });
    const data = response.data.data;
    return Array.isArray(data) ? data : [];
  }

  async downloadReportPDF(token: string, id: number): Promise<Blob> {
    const response: AxiosResponse<Blob> = await this.axiosInstance.get(`/performance/reports/${id}/pdf`, {
      headers: this.getAuthHeaders(token),
      responseType: 'blob',
    });
    return response.data;
  }
}
