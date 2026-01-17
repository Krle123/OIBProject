import { PerformanceReportDTO } from "../DTOs/PerformanceReportDTO";

export interface IPDFService {
    generatePerformanceReportPDF(report: PerformanceReportDTO): Promise<Buffer>;
}
