import axios from "axios";
import { ISalesAPI } from "./ISalesAPI";

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || "http://localhost:4000/api/v1";

export class SalesAPI implements ISalesAPI {
    async getCatalog(token: string): Promise<any[]> {
        try {
            const response = await axios.get(`${GATEWAY_URL}/sales/catalog`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Handle nested response: {success, data: {success, data: [...]}}
            const data = response.data?.data?.data || response.data?.data || [];
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Failed to get catalog:", error);
            return [];
        }
    }

    async getStorages(token: string): Promise<any[]> {
        try {
            const response = await axios.get(`${GATEWAY_URL}/storages`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Handle nested response: {success, data: {success, data: [...]}}
            const data = response.data?.data?.data || response.data?.data || [];
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Failed to get storages:", error);
            return [];
        }
    }

    async processSale(token: string, saleData: any): Promise<any> {
        try {
            console.log("SalesAPI.processSale - GATEWAY_URL:", GATEWAY_URL);
            console.log("SalesAPI.processSale - Full URL:", `${GATEWAY_URL}/sales/process`);
            console.log("SalesAPI.processSale - Token:", token ? `${token.substring(0, 20)}...` : "NO TOKEN");
            console.log("SalesAPI.processSale - Sale data:", saleData);

            const response = await axios.post(`${GATEWAY_URL}/sales/process`, saleData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("SalesAPI.processSale - Response:", response.data);
            return response.data;
        } catch (error: any) {
            console.error("SalesAPI.processSale - Error:", error);
            console.error("SalesAPI.processSale - Error message:", error.message);
            console.error("SalesAPI.processSale - Error response:", error.response);
            throw error;
        }
    }

    async getReceipts(token: string): Promise<any[]> {
        try {
            const response = await axios.get(`${GATEWAY_URL}/sales/receipts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Handle nested response: {success, data: {success, data: [...]}}
            const data = response.data?.data?.data || response.data?.data || [];
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Failed to get receipts:", error);
            return [];
        }
    }
}
