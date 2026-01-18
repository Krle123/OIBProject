import axios from "axios";
import { IAnalyticsAPI } from "./IAnalyticsAPI";

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || "http://localhost:4000/api/v1";

export class AnalyticsAPI implements IAnalyticsAPI {
    async getSalesByMonth(token: string, month: number, year: number): Promise<any> {
        try {
            const response = await axios.get(`${GATEWAY_URL}/analytics/sales/by-month`, {
                params: { month, year },
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data?.data || response.data;
        } catch (error) {
            console.error("Failed to get sales by month:", error);
            throw error;
        }
    }

    async getSalesByWeek(token: string, week: number, year: number): Promise<any> {
        try {
            const response = await axios.get(`${GATEWAY_URL}/analytics/sales/by-week`, {
                params: { week, year },
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data?.data || response.data;
        } catch (error) {
            console.error("Failed to get sales by week:", error);
            throw error;
        }
    }

    async getSalesByYear(token: string, year: number): Promise<any> {
        try {
            const response = await axios.get(`${GATEWAY_URL}/analytics/sales/by-year`, {
                params: { year },
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data?.data || response.data;
        } catch (error) {
            console.error("Failed to get sales by year:", error);
            throw error;
        }
    }

    async getTotalSales(token: string): Promise<any> {
        try {
            const response = await axios.get(`${GATEWAY_URL}/analytics/sales/total`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data?.data || response.data;
        } catch (error) {
            console.error("Failed to get total sales:", error);
            throw error;
        }
    }

    async getSalesTrend(token: string, startDate: string, endDate: string): Promise<any> {
        try {
            const response = await axios.get(`${GATEWAY_URL}/analytics/sales/trend`, {
                params: { startDate, endDate },
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data?.data || response.data;
        } catch (error) {
            console.error("Failed to get sales trend:", error);
            throw error;
        }
    }

    async getTop10BestSelling(token: string): Promise<any> {
        try {
            const response = await axios.get(`${GATEWAY_URL}/analytics/top-10/best-selling`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data?.data || response.data;
        } catch (error) {
            console.error("Failed to get top 10 best selling:", error);
            throw error;
        }
    }

    async getTop10Revenue(token: string): Promise<any> {
        try {
            const response = await axios.get(`${GATEWAY_URL}/analytics/top-10/revenue`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data?.data || response.data;
        } catch (error) {
            console.error("Failed to get top 10 revenue:", error);
            throw error;
        }
    }

    async getAllReports(token: string): Promise<any[]> {
        try {
            const response = await axios.get(`${GATEWAY_URL}/analytics/reports`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = response.data?.data?.data || response.data?.data || [];
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Failed to get reports:", error);
            return [];
        }
    }

    async getReportById(token: string, id: number): Promise<any> {
        try {
            const response = await axios.get(`${GATEWAY_URL}/analytics/reports/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data?.data || response.data;
        } catch (error) {
            console.error("Failed to get report:", error);
            throw error;
        }
    }

    async downloadReportPDF(token: string, id: number): Promise<Blob> {
        try {
            const response = await axios.get(`${GATEWAY_URL}/analytics/reports/${id}/pdf`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error("Failed to download report PDF:", error);
            throw error;
        }
    }

    async getReceipts(token: string): Promise<any[]> {
        try {
            const response = await axios.get(`${GATEWAY_URL}/analytics/receipts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = response.data?.data?.data || response.data?.data || [];
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Failed to get receipts:", error);
            return [];
        }
    }

    async downloadReceiptPDF(token: string, id: number): Promise<Blob> {
        try {
            const response = await axios.get(`${GATEWAY_URL}/analytics/receipts/${id}/pdf`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error("Failed to download receipt PDF:", error);
            throw error;
        }
    }
}
