import axios, { AxiosInstance } from "axios";
import { IGatewayService } from "../Domain/services/IGatewayService";
import { LoginUserDTO } from "../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../Domain/DTOs/RegistrationUserDTO";
import { AuthResponseType } from "../Domain/types/AuthResponse";
import { UserDTO } from "../Domain/DTOs/UserDTO";
import { LogDTO } from "../Domain/DTOs/LogDTO";
import { FieldPlantDTO } from "../Domain/DTOs/FieldPlantDTO";
import { PlantState } from "../Domain/enums/PlantState";
import { PlantDTO } from "../Domain/DTOs/PlantDTO";
import { PerfumeDTO } from "../Domain/DTOs/PerfumeDTO";
import { AnalysisReportDTO } from "../Domain/DTOs/AnalysisReportDTO";
import { AnalysisType } from "../Domain/enums/AnalysisType";
import { FiscalReceiptDTO } from "../Domain/DTOs/FiscalReceiptDTO";
import { PerformanceReportDTO } from "../Domain/DTOs/PerformanceReportDTO";
import { PerformanceAlgorithmType } from "../Domain/enums/PerformanceAlgorithmType";
import { StorageDTO } from "../Domain/DTOs/StorageDTO";
import { SaleType } from "../Domain/enums/SaleType";
import { PaymentMethod } from "../Domain/enums/PaymentMethod";

export class GatewayService implements IGatewayService {
  private readonly authClient: AxiosInstance;
  private readonly userClient: AxiosInstance;
  private readonly logClient: AxiosInstance;
  private readonly productionClient: AxiosInstance;
  private readonly processingClient: AxiosInstance;
  private readonly storageClient: AxiosInstance;
  private readonly salesClient: AxiosInstance;

  constructor() {
    const authBaseURL = process.env.AUTH_SERVICE_API;
    const userBaseURL = process.env.USER_SERVICE_API;
    const logBaseURL = process.env.LOG_SERVICE_API;
    const productionBaseURL = process.env.PRODUCTION_SERVICE_API;
    const processingBaseURL = process.env.PROCESSING_SERVICE_API;
    const storageBaseURL = process.env.STORAGE_SERVICE_API;
    const salesBaseURL = process.env.SALES_SERVICE_API;

    this.authClient = axios.create({
      baseURL: authBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    this.userClient = axios.create({
      baseURL: userBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    this.logClient = axios.create({
      baseURL: logBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    this.productionClient = axios.create({
      baseURL: productionBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    this.processingClient = axios.create({
      baseURL: processingBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    this.storageClient = axios.create({
      baseURL: storageBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    this.salesClient = axios.create({
      baseURL: salesBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });
  }

  // Auth microservice
  async login(data: LoginUserDTO): Promise<AuthResponseType> {
    try {
      const response = await this.authClient.post<AuthResponseType>("/auth/login", data);
      return response.data;
    } catch {
      return { authenificated: false };
    }
  }

  async register(data: RegistrationUserDTO): Promise<AuthResponseType> {
    try {
      const response = await this.authClient.post<AuthResponseType>("/auth/register", data);
      return response.data;
    } catch {
      return { authenificated: false };
    }
  }

  // User microservice
  async getAllUsers(): Promise<UserDTO[]> {
    const response = await this.userClient.get<UserDTO[]>("/users");
    return response.data;
  }

  async getUserById(id: number): Promise<UserDTO> {
    const response = await this.userClient.get<UserDTO>(`/users/${id}`);
    return response.data;
  }

  // Log microservice
  async addLog(type: string, description: string): Promise<void> {
    try {
      await this.logClient.post<void>("/logs/add", { type, description });
    } catch (err) {
      console.warn("GatewayService: failed to add log:", (err as Error).message);
    }
  }

  async updateLog(id: number, description: string): Promise<void> {
    try {
      await this.logClient.put<void>(`/logs/update/${id}`, { description });
    } catch (err) {
      console.warn("GatewayService: failed to update log:", (err as Error).message);
    }
  }

  async deleteLog(id: number): Promise<void> {
    try {
      await this.logClient.delete<void>(`/logs/${id}`);
    } catch (err) {
      console.warn("GatewayService: failed to delete log:", (err as Error).message);
    }
  }

  async searchLogs(type?: string, fromTs?: string, toTs?: string): Promise<LogDTO[]> {
    const params: any = {};
    if (type) params.type = type;
    if (fromTs) params.fromTs = fromTs;
    if (toTs) params.toTs = toTs;

    try {
      const response = await this.logClient.get<{ success: boolean; data: LogDTO[] }>("/logs", { params });
      return response.data.data;
    } catch (err) {
      console.warn("GatewayService: failed to search logs:", (err as Error).message);
      return [];
    }
  }

  //Production microservice
  async getPlantsById(plantId: number): Promise<FieldPlantDTO[]> {
    const response = await this.productionClient.get<{ success: boolean; data: FieldPlantDTO[] }>(`/plants/${plantId}`);
    return response.data.data;
  }

  async getPlantsByState(plantState: PlantState): Promise<FieldPlantDTO[]> {
    const response = await this.productionClient.get<{ success: boolean; data: FieldPlantDTO[] }>(`/field-plants/state/${plantState}`);
    return response.data.data;
  }

  async getAllPlants(): Promise<PlantDTO[]> {
    const response = await this.productionClient.get<{ success: boolean; data: PlantDTO[] }>(`/plants`);
    console.log("GatewayService.getAllPlants response:", response);
    console.log("GatewayService.getAllPlants response data:", response.data);
    return response.data.data;
  }

  async getAllFieldPlants(): Promise<FieldPlantDTO[]> {
    const response = await this.productionClient.get<{ success: boolean; data: FieldPlantDTO[] }>(`/field-plants`);
    return response.data.data;
  }

  async plantHerb(plantId: number, quantity: number): Promise<boolean> {
    const response = await this.productionClient.post<boolean>(`/production/plant`, { plantId, quantity });
    return response.data;
  }

  async changeAromaticPower(fieldPlantId: number, changePercentage: number): Promise<boolean> {
    const response = await this.productionClient.put<boolean>(`/production/aromatic-power/${fieldPlantId}`, { changePercentage });
    return response.data;
  }

  async harvestPlant(fieldPlantId: number, quantity: number): Promise<boolean> {
    const response = await this.productionClient.post<boolean>(`/production/harvest`, { fieldPlantId, quantity });
    return response.data;
  }

  //Processing microservice
  async createPerfumeBatch(perfume: PerfumeDTO, numberOfBottles: number): Promise<PerfumeDTO[]> {
    const response = await this.processingClient.post<{ success: boolean; data: PerfumeDTO[] }>(`/processing/perfumes/create`, { perfume, numberOfBottles });
    return response.data.data;
  }

  //Analytics microservice
  async calculateSalesByMonth(month: number, year: number, userId?: number) {
    const params: any = { month, year };
    if (userId) params.userId = userId;
    const response = await this.processingClient.get<{ success: boolean; data: AnalysisReportDTO }>(`/analytics/sales/by-month`, { params });
    return response.data.data;
  }
  
  async calculateSalesByYear(year: number, userId?: number) {
    const params: any = { year };
    if (userId) params.userId = userId;
    const response = await this.processingClient.get<{ success: boolean; data: AnalysisReportDTO }>(`/analytics/sales/by-year`, { params });
    return response.data.data;
  }

  async calculateSalesByWeek(weekNumber: number, year: number, userId?: number) {
    const params: any = { weekNumber, year };
    if (userId) params.userId = userId;
    const response = await this.processingClient.get<{ success: boolean; data: AnalysisReportDTO }>(`/analytics/sales/by-week`, { params });
    return response.data.data;
  }

  async calculateTotalSales(userId?: number) {
    const params: any = {};
    if (userId) params.userId = userId;
    const response = await this.processingClient.get<{ success: boolean; data: AnalysisReportDTO }>(`/analytics/sales/total`, { params });
    return response.data.data;
  }

  async analyzeSalesTrend(startDate: string, endDate: string, userId?: number) {
    const params: any = { startDate, endDate };
    if (userId) params.userId = userId;
    const response = await this.processingClient.get<{ success: boolean; data: AnalysisReportDTO }>(`/analytics/sales/trend`, { params });
    return response.data.data;
  }

  async getTop10BestSellingPerfumes(userId?: number) {
    const params: any = {};
    if (userId) params.userId = userId;
    const response = await this.processingClient.get<{ success: boolean; data: AnalysisReportDTO[] }>(`/analytics/top-10/best-selling`, { params });
    return response.data.data;
  }

  async getTop10RevenueByPerfume(userId?: number) {
    const params: any = {};
    if (userId) params.userId = userId;
    const response = await this.processingClient.get<{ success: boolean; data: AnalysisReportDTO[] }>(`/analytics/top-10/revenue`, { params });
    return response.data.data;
  }

  async getAllAnalysisReports(): Promise<AnalysisReportDTO[]> {
    const response = await this.processingClient.get<{ success: boolean; data: AnalysisReportDTO[] }>(`/analytics/reports`);
    return response.data.data;
  }

  async getAnalysisReportById(reportId: number): Promise<AnalysisReportDTO> {
    const response = await this.processingClient.get<{ success: boolean; data: AnalysisReportDTO }>(`/analytics/reports/${reportId}`);
    return response.data.data;
  }

  async getAnalysisReportsByType(type: AnalysisType): Promise<AnalysisReportDTO[]> {
    const response = await this.processingClient.get<{ success: boolean; data: AnalysisReportDTO[] }>(`/analytics/reports/type/${type}`);
    return response.data.data;
  }

  async downloadAnalysisReportPDF(reportId: number): Promise<Buffer> {
    const response = await this.processingClient.get(`/analytics/reports/${reportId}/pdf`, { responseType: "arraybuffer" });
    return Buffer.from(response.data);
  }

  async createFiscalReceipt(saleData: FiscalReceiptDTO): Promise<FiscalReceiptDTO> {
    const response = await this.processingClient.post<{ success: boolean; data: FiscalReceiptDTO }>(`/analytics/receipts`, saleData);
    return response.data.data;
  }

  async getAllReceipts(): Promise<FiscalReceiptDTO[]> {
    const response = await this.processingClient.get<{ success: boolean; data: FiscalReceiptDTO[] }>(`/analytics/receipts`);
    return response.data.data;
  }

  async getReceiptById(receiptId: number): Promise<FiscalReceiptDTO> {
    const response = await this.processingClient.get<{ success: boolean; data: FiscalReceiptDTO }>(`/analytics/receipts/${receiptId}`);
    return response.data.data;
  }

  async getReceiptByNumber(receiptNumber: string): Promise<FiscalReceiptDTO> {
    const response = await this.processingClient.get<{ success: boolean; data: FiscalReceiptDTO }>(`/analytics/receipts/number/${receiptNumber}`);
    return response.data.data;
  }

  async downloadReceiptPDF(receiptId: number): Promise<Buffer> {
    const response = await this.processingClient.get(`/analytics/receipts/${receiptId}/pdf`, { responseType: "arraybuffer" });
    return Buffer.from(response.data);
  }

  //performance
  async runSimulation(algorithmType: PerformanceAlgorithmType, numberOfPackages: number, userId?: number): Promise<PerformanceReportDTO> {
    const params: any = { algorithmType, numberOfPackages };
    if (userId) params.userId = userId;
    const response = await this.processingClient.post<{ success: boolean; data: PerformanceReportDTO }>(`/performance/simulate`, params);
    return response.data.data;
  }

  async getAllPerformanceReports(): Promise<PerformanceReportDTO[]> {
    const response = await this.processingClient.get<{ success: boolean; data: PerformanceReportDTO[] }>(`/performance/reports`);
    return response.data.data;
  }

  async getPerformanceReportById(id: number): Promise<PerformanceReportDTO | null> {
    try {
      const response = await this.processingClient.get<{ success: boolean; data: PerformanceReportDTO }>(`/performance/reports/${id}`);
      return response.data.data;
    } catch (err) {
      console.warn("GatewayService: failed to get performance report by id:", (err as Error).message);
      return null;
    }
  }

  async getPerformanceReportsByAlgorithmType(algorithmType: PerformanceAlgorithmType): Promise<PerformanceReportDTO[]> {
    const response = await this.processingClient.get<{ success: boolean; data: PerformanceReportDTO[] }>(`/performance/reports/algorithm/${algorithmType}`);
    return response.data.data;
  }

  async downloadPerformanceReportPDF(reportId: number): Promise<Buffer> {
    const response = await this.processingClient.get(`/performance/reports/${reportId}/pdf`, { responseType: "arraybuffer" });
    return Buffer.from(response.data);
  }

  // Storage microservice
  async getAllStorages(): Promise<StorageDTO[]> {
    const response = await this.storageClient.get<any>(`/api/v1/storages`);
    return response.data.data;
  }

  async getStorageById(id: number): Promise<StorageDTO> {
    const response = await this.storageClient.get<any>(`/api/v1/storages/${id}`);
    return response.data.data;
  }

  async createStorage(data: { name: string; location: string; maxCapacity: number; type?: string; currentCapacity?: number }): Promise<StorageDTO> {
    const response = await this.storageClient.post<any>(`/api/v1/storages`, data);
    return response.data.data;
  }

  async updateStorageCapacity(id: number, increment: number): Promise<StorageDTO> {
    const response = await this.storageClient.put<any>(`/api/v1/storages/${id}/capacity`, { increment });
    return response.data.data;
  }

  async sendPackagingFromStorage(perfumeSerialNumber: string, quantity: number, userRole: string): Promise<any[]> {
    const response = await this.storageClient.post<any>(`/api/v1/storages/send-packaging`, { perfumeSerialNumber, quantity, userRole });
    return response.data;
  }

  // Sales microservice
  async processSale(
    perfumeSerialNumber: string,
    quantity: number,
    saleType: SaleType,
    paymentMethod: PaymentMethod,
    sellerId?: number,
    userRole?: string
  ): Promise<FiscalReceiptDTO> {
    const response = await this.salesClient.post<any>(`/api/v1/sales/process`, {
      perfumeSerialNumber,
      quantity,
      saleType,
      paymentMethod,
      sellerId: sellerId || null,
      userRole: userRole || "SELLER"
    });
    return response.data.data;
  }

  async getCatalog(): Promise<any[]> {
    const response = await this.salesClient.get<any>(`/api/v1/sales/catalog`);
    return response.data.data;
  }
}
