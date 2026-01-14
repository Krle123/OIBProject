import { AlgorithmType } from "../enums/AlgorithmType";
import { PerformanceReport } from "../models/PerformanceReport";
import { PerformanceReportDTO } from "../DTOs/PerformanceReportDTO";

export interface IPerformanceAnalysisService {
    runSimulation(algorithm: AlgorithmType): Promise<PerformanceReportDTO>;
    getAllReports(): Promise<PerformanceReportDTO[]>;
    getReportById(id: number): Promise<PerformanceReportDTO | null>;
}
