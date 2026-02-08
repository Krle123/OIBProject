import { AnalysisReportDTO } from "../../models/analysis/AnalysisReportDTO";

export interface IPerformanceAPI {
    runSimulation(token: string, algorithmType: string, numberOfPackages: number): Promise<AnalysisReportDTO>;
    getAllReports(token: string): Promise<AnalysisReportDTO[]>;
    getReportById(token: string, id: number): Promise<AnalysisReportDTO>;
    getReportsByAlgorithmType(token: string, algorithmType: string): Promise<AnalysisReportDTO[]>;
    downloadReportPDF(token: string, id: number): Promise<Blob>;
}
