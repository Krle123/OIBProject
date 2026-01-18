import { PerformanceReportDTO } from "../DTOs/PerformanceReportDTO";
import { PerformanceAlgorithmType } from "../enums/PerformanceAlgorithmType";

export interface IPerformanceService {
    // Simulation
    runSimulation(algorithmType: PerformanceAlgorithmType, numberOfPackages: number, userId?: number): Promise<PerformanceReportDTO>;
    
    // Report management
    getAllReports(): Promise<PerformanceReportDTO[]>;
    getReportById(id: number): Promise<PerformanceReportDTO | null>;
    getReportsByAlgorithmType(algorithmType: PerformanceAlgorithmType): Promise<PerformanceReportDTO[]>;
}
