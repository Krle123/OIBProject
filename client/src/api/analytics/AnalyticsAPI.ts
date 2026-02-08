import axios, { AxiosInstance, AxiosResponse } from "axios";
import { IAnalyticsAPI } from "./IAnalyticsAPI";

export class AnalyticsAPI implements IAnalyticsAPI {
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

  async getSalesByMonth(token: string, month: number, year: number): Promise<any> {
    const response: AxiosResponse<{ success: boolean; data: any }> = await this.axiosInstance.get("/analytics/sales/by-month", {
      params: { month, year },
      headers: this.getAuthHeaders(token),
    });
    return response.data.data;
  }

  async getSalesByWeek(token: string, week: number, year: number): Promise<any> {
    const response: AxiosResponse<{ success: boolean; data: any }> = await this.axiosInstance.get("/analytics/sales/by-week", {
      params: { week, year },
      headers: this.getAuthHeaders(token),
    });
    return response.data.data;
  }

  async getSalesByYear(token: string, year: number): Promise<any> {
    const response: AxiosResponse<{ success: boolean; data: any }> = await this.axiosInstance.get("/analytics/sales/by-year", {
      params: { year },
      headers: this.getAuthHeaders(token),
    });
    return response.data.data;
  }

  async getTotalSales(token: string): Promise<any> {
    const response: AxiosResponse<{ success: boolean; data: any }> = await this.axiosInstance.get("/analytics/sales/total", {
      headers: this.getAuthHeaders(token),
    });
    return response.data.data;
  }

  async getSalesTrend(token: string, startDate: string, endDate: string): Promise<any> {
    const response: AxiosResponse<{ success: boolean; data: any }> = await this.axiosInstance.get("/analytics/sales/trend", {
      params: { startDate, endDate },
      headers: this.getAuthHeaders(token),
    });
    return response.data.data;
  }

  async getTop10BestSelling(token: string): Promise<any> {
    const response: AxiosResponse<{ success: boolean; data: any }> = await this.axiosInstance.get("/analytics/top-10/best-selling", {
      headers: this.getAuthHeaders(token),
    });
    return response.data.data;
  }

  async getTop10Revenue(token: string): Promise<any> {
    const response: AxiosResponse<{ success: boolean; data: any }> = await this.axiosInstance.get("/analytics/top-10/revenue", {
      headers: this.getAuthHeaders(token),
    });
    return response.data.data;
  }

  async getAllReports(token: string): Promise<any[]> {
    const response: AxiosResponse<{ success: boolean; data: any[] }> = await this.axiosInstance.get("/analytics/reports", {
      headers: this.getAuthHeaders(token),
    });
    const data = response.data.data;
    return Array.isArray(data) ? data : [];
  }

  async getReportById(token: string, id: number): Promise<any> {
    const response: AxiosResponse<{ success: boolean; data: any }> = await this.axiosInstance.get(`/analytics/reports/${id}`, {
      headers: this.getAuthHeaders(token),
    });
    return response.data.data;
  }

  async downloadReportPDF(token: string, id: number): Promise<Blob> {
    const response: AxiosResponse<Blob> = await this.axiosInstance.get(`/analytics/reports/${id}/pdf`, {
      headers: this.getAuthHeaders(token),
      responseType: 'blob',
    });
    return response.data;
  }

  async getReceipts(token: string): Promise<any[]> {
    const response: AxiosResponse<{ success: boolean; data: any[] }> = await this.axiosInstance.get("/analytics/receipts", {
      headers: this.getAuthHeaders(token),
    });
    const data = response.data.data;
    return Array.isArray(data) ? data : [];
  }

  async downloadReceiptPDF(token: string, id: number): Promise<Blob> {
    const response: AxiosResponse<Blob> = await this.axiosInstance.get(`/analytics/receipts/${id}/pdf`, {
      headers: this.getAuthHeaders(token),
      responseType: 'blob',
    });
    return response.data;
  }
}
