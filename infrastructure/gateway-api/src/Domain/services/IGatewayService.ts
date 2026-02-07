import { AnalysisReportDTO } from "../DTOs/AnalysisReportDTO";
import { FieldPlantDTO } from "../DTOs/FieldPlantDTO";
import { FiscalReceiptDTO } from "../DTOs/FiscalReceiptDTO";
import { LogDTO } from "../DTOs/LogDTO";
import { LoginUserDTO } from "../DTOs/LoginUserDTO";
import { PerfumeDTO } from "../DTOs/PerfumeDTO";
import { PlantDTO } from "../DTOs/PlantDTO";
import { RegistrationUserDTO } from "../DTOs/RegistrationUserDTO";
import { UserDTO } from "../DTOs/UserDTO";
import { AnalysisType } from "../enums/AnalysisType";
import { PlantState } from "../enums/PlantState";
import { AuthResponseType } from "../types/AuthResponse";
import { PerformanceAlgorithmType } from "../enums/PerformanceAlgorithmType";
import { PerformanceReportDTO } from "../DTOs/PerformanceReportDTO";
import { SaleType } from "../enums/SaleType";
import { PaymentMethod } from "../enums/PaymentMethod";

export interface IGatewayService {
  // Auth
  login(data: LoginUserDTO): Promise<AuthResponseType>;
  register(data: RegistrationUserDTO): Promise<AuthResponseType>;

  // Users
  getAllUsers(): Promise<UserDTO[]>;
  getUserById(id: number): Promise<UserDTO>;

  // Logs
  searchLogs(type?: string, fromTs?: string, toTs?: string): Promise<LogDTO[]>;
  addLog(type: string, description: string): Promise<void>;
  updateLog(id: number, description: string): Promise<void>;
  deleteLog(id: number): Promise<void>;

  // Production
  getPlantsById(plantId: number): Promise<FieldPlantDTO[]>;
  getPlantsByState(plantState: PlantState): Promise<FieldPlantDTO[]>;
  getAllPlants(): Promise<PlantDTO[]>;
  getAllFieldPlants(): Promise<FieldPlantDTO[]>;
  plantHerb(plantId: number, quantity: number): Promise<boolean>;
  changeAromaticPower(fieldPlantId: number, changePercentage: number): Promise<boolean>;
  harvestPlant(fieldPlantId: number, quantity: number): Promise<boolean>;

  //Processing
  createPerfumeBatch(perfume: PerfumeDTO, numberOfBottles: number): Promise<PerfumeDTO[]>;

  //Analytics
  calculateSalesByMonth(month: number, year: number, userId?: number): Promise<AnalysisReportDTO>;
  calculateSalesByYear(year: number, userId?: number): Promise<AnalysisReportDTO>;
  calculateSalesByWeek(weekNumber: number, year: number, userId?: number): Promise<AnalysisReportDTO>;
  calculateTotalSales(userId?: number): Promise<AnalysisReportDTO>;

  analyzeSalesTrend(startDate: string, endDate: string, userId?: number): Promise<AnalysisReportDTO>;
  getTop10BestSellingPerfumes(userId?: number): Promise<AnalysisReportDTO[]>;
  getTop10RevenueByPerfume(userId?: number): Promise<AnalysisReportDTO[]>;

  getAllAnalysisReports(): Promise<AnalysisReportDTO[]>;
  getAnalysisReportById(reportId: number): Promise<AnalysisReportDTO>;
  getAnalysisReportsByType(type: AnalysisType): Promise<AnalysisReportDTO[]>;
  downloadAnalysisReportPDF(reportId: number): Promise<Buffer>;

  createFiscalReceipt(saleData: FiscalReceiptDTO): Promise<FiscalReceiptDTO>;
  getAllReceipts(): Promise<FiscalReceiptDTO[]>;
  getReceiptById(receiptId: number): Promise<FiscalReceiptDTO>;
  getReceiptByNumber(receiptNumber: string): Promise<FiscalReceiptDTO>;
  downloadReceiptPDF(receiptId: number): Promise<Buffer>;

  // Performance
  runSimulation(algorithmType: PerformanceAlgorithmType, numberOfPackages: number, userId?: number): Promise<PerformanceReportDTO>;
    
  getAllPerformanceReports(): Promise<PerformanceReportDTO[]>;
  getPerformanceReportById(id: number): Promise<PerformanceReportDTO | null>;
  getPerformanceReportsByAlgorithmType(algorithmType: PerformanceAlgorithmType): Promise<PerformanceReportDTO[]>;
  downloadPerformanceReportPDF(reportId: number): Promise<Buffer>;

  // Storage
  sendPackagingFromStorage(perfumeSerialNumber: string, quantity: number, userRole: string): Promise<any[]>;
  getAllStorages(): Promise<any[]>;
  getStorageById(id: number): Promise<any>;
  createStorage(storageData: any): Promise<any>;
  updateStorageCapacity(storageId: number, increment: number): Promise<any>;

  // Sales
  processSale(perfumeSerialNumber: string, quantity: number, saleType: SaleType, paymentMethod: PaymentMethod, sellerId?: number, userRole?: string): Promise<FiscalReceiptDTO>;
  getCatalog(): Promise<any[]>;

}
