import axios from "axios";
import { IPerformanceAPI } from "./IPerformanceAPI";

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || "http://localhost:4000/api/v1";

export class PerformanceAPI implements IPerformanceAPI {
    async runSimulation(token: string, algorithmType: string, numberOfPackages: number): Promise<any> {
        try {
            const response = await axios.post(`${GATEWAY_URL}/performance/simulate`, {
                algorithmType,
                numberOfPackages
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data?.data || response.data;
        } catch (error: any) {
            console.error("Failed to run simulation:", error);
            throw error;
        }
    }

    async getAllReports(token: string): Promise<any[]> {
        try {
            const response = await axios.get(`${GATEWAY_URL}/performance/reports`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = response.data?.data || response.data || [];
            return Array.isArray(data) ? data : [];
        } catch (error: any) {
            console.error("Failed to get reports:", error);
            return [];
        }
    }

    async getReportById(token: string, id: number): Promise<any> {
        try {
            const response = await axios.get(`${GATEWAY_URL}/performance/reports/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data?.data || response.data;
        } catch (error) {
            console.error("Failed to get report:", error);
            throw error;
        }
    }

    async getReportsByAlgorithmType(token: string, algorithmType: string): Promise<any[]> {
        try {
            const response = await axios.get(`${GATEWAY_URL}/performance/reports/algorithm/${algorithmType}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = response.data?.data?.data || response.data?.data || [];
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Failed to get reports by algorithm type:", error);
            return [];
        }
    }

    async downloadReportPDF(token: string, id: number): Promise<Blob> {
        try {
            const response = await axios.get(`${GATEWAY_URL}/performance/reports/${id}/pdf`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error("Failed to download report PDF:", error);
            throw error;
        }
    }
}
