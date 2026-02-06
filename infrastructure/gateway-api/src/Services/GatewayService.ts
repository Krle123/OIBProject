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

export class GatewayService implements IGatewayService {
  private readonly authClient: AxiosInstance;
  private readonly userClient: AxiosInstance;
  private readonly logClient: AxiosInstance;
  private readonly productionClient: AxiosInstance;
  private readonly processingClient: AxiosInstance;

  constructor() {
    const authBaseURL = process.env.AUTH_SERVICE_API;
    const userBaseURL = process.env.USER_SERVICE_API;
    const logBaseURL = process.env.LOG_SERVICE_API;
    const productionBaseURL = process.env.PRODUCTION_SERVICE_API;
    const processingBaseURL = process.env.PROCESSING_SERVICE_API;

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
      const response = await this.logClient.get<LogDTO[]>("/logs", { params });
      return response.data;
    } catch (err) {
      console.warn("GatewayService: failed to search logs:", (err as Error).message);
      return [];
    }
  }

  //Production microservice
  async getPlantsById(plantId: number): Promise<FieldPlantDTO[]> {
    const response = await this.productionClient.get<FieldPlantDTO[]>(`/plants/${plantId}`);
    return response.data;
  }

  async getPlantsByState(plantState: PlantState): Promise<FieldPlantDTO[]> {
    const response = await this.productionClient.get<FieldPlantDTO[]>(`/field-plants/state/${plantState}`);
    return response.data;
  }

  async getAllPlants(): Promise<PlantDTO[]> {
    const response = await this.productionClient.get<PlantDTO[]>(`/plants`);
    return response.data;
  }

  async getAllFieldPlants(): Promise<FieldPlantDTO[]> {
    const response = await this.productionClient.get<FieldPlantDTO[]>(`/field-plants`);
    return response.data;
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
    const response = await this.processingClient.post<PerfumeDTO[]>(`/processing/perfumes/create`, { perfume, numberOfBottles });
    return response.data;
  }

  //Analytics microservice
  async calculateSalesByMonth(month: number, year: number, userId?: number) {
    const params: any = { month, year };
    if (userId) params.userId = userId;
    const response = await this.processingClient.get<AnalysisReportDTO>(`/analytics/sales/by-month`, { params });
    return response.data;
  }
  
  async calculateSalesByYear(year: number, userId?: number) {
    const params: any = { year };
    if (userId) params.userId = userId;
    const response = await this.processingClient.get<AnalysisReportDTO>(`/analytics/sales/by-year`, { params });
    return response.data;
  }

  async calculateSalesByWeek(weekNumber: number, year: number, userId?: number) {
    const params: any = { weekNumber, year };
    if (userId) params.userId = userId;
    const response = await this.processingClient.get<AnalysisReportDTO>(`/analytics/sales/by-week`, { params });
    return response.data;
  }

  async calculateTotalSales(userId?: number) {
    const params: any = {};
    if (userId) params.userId = userId;
    const response = await this.processingClient.get<AnalysisReportDTO>(`/analytics/sales/total`, { params });
    return response.data;
  }

  async analyzeSalesTrend(startDate: string, endDate: string, userId?: number) {
    const params: any = { startDate, endDate };
    if (userId) params.userId = userId;
    const response = await this.processingClient.get<AnalysisReportDTO>(`/analytics/sales/trend`, { params });
    return response.data;
  }

  async getTop10BestSellingPerfumes(userId?: number) {
    const params: any = {};
    if (userId) params.userId = userId;
    const response = await this.processingClient.get<AnalysisReportDTO[]>(`/analytics/top-10/best-selling`, { params });
    return response.data;
  }

  async getTop10RevenueByPerfume(userId?: number) {
    const params: any = {};
    if (userId) params.userId = userId;
    const response = await this.processingClient.get<AnalysisReportDTO[]>(`/analytics/top-10/revenue`, { params });
    return response.data;
  }

  async getAllAnalysisReports(): Promise<AnalysisReportDTO[]> {
    const response = await this.processingClient.get<AnalysisReportDTO[]>(`/analytics/reports`);
    return response.data;
  }

  async getAnalysisReportById(reportId: number): Promise<AnalysisReportDTO> {
    const response = await this.processingClient.get<AnalysisReportDTO>(`/analytics/reports/${reportId}`);
    return response.data;
  }

  async getAnalysisReportsByType(type: AnalysisType): Promise<AnalysisReportDTO[]> {
    const response = await this.processingClient.get<AnalysisReportDTO[]>(`/analytics/reports/type/${type}`);
    return response.data;
  }

  async downloadAnalysisReportPDF(reportId: number): Promise<Buffer> {
    const response = await this.processingClient.get(`/analytics/reports/${reportId}/pdf`, { responseType: "arraybuffer" });
    return Buffer.from(response.data);
  }

  async createFiscalReceipt(saleData: FiscalReceiptDTO): Promise<FiscalReceiptDTO> {
    const response = await this.processingClient.post<FiscalReceiptDTO>(`/analytics/receipts`, saleData);
    return response.data;
  }

  async getAllReceipts(): Promise<FiscalReceiptDTO[]> {
    const response = await this.processingClient.get<FiscalReceiptDTO[]>(`/analytics/receipts`);
    return response.data;
  }

  async getReceiptById(receiptId: number): Promise<FiscalReceiptDTO> {
    const response = await this.processingClient.get<FiscalReceiptDTO>(`/analytics/receipts/${receiptId}`);
    return response.data;
  }

  async getReceiptByNumber(receiptNumber: string): Promise<FiscalReceiptDTO> {
    const response = await this.processingClient.get<FiscalReceiptDTO>(`/analytics/receipts/number/${receiptNumber}`);
    return response.data;
  }

  async downloadReceiptPDF(receiptId: number): Promise<Buffer> {
    const response = await this.processingClient.get(`/analytics/receipts/${receiptId}/pdf`, { responseType: "arraybuffer" });
    return Buffer.from(response.data);
  }

  //performance
  async runSimulation(algorithmType: PerformanceAlgorithmType, numberOfPackages: number, userId?: number): Promise<PerformanceReportDTO> {
    const params: any = { algorithmType, numberOfPackages };
    if (userId) params.userId = userId;
    const response = await this.processingClient.post<PerformanceReportDTO>(`/performance/simulate`, params);
    return response.data;
  }

  async getAllPerformanceReports(): Promise<PerformanceReportDTO[]> {
    const response = await this.processingClient.get<PerformanceReportDTO[]>(`/performance/reports`);
    return response.data;
  }

  async getPerformanceReportById(id: number): Promise<PerformanceReportDTO | null> {
    try {
      const response = await this.processingClient.get<PerformanceReportDTO>(`/performance/reports/${id}`);
      return response.data;
    } catch (err) {
      console.warn("GatewayService: failed to get performance report by id:", (err as Error).message);
      return null;
    }
  }

  async getPerformanceReportsByAlgorithmType(algorithmType: PerformanceAlgorithmType): Promise<PerformanceReportDTO[]> {
    const response = await this.processingClient.get<PerformanceReportDTO[]>(`/performance/reports/algorithm/${algorithmType}`);
    return response.data;
  }

  async downloadPerformanceReportPDF(reportId: number): Promise<Buffer> {
    const response = await this.processingClient.get(`/performance/reports/${reportId}/pdf`, { responseType: "arraybuffer" });
    return Buffer.from(response.data);
  }
  // TODO: ADD MORE API CALLS
}
