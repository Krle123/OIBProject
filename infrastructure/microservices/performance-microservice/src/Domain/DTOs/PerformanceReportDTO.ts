import { PerformanceReport } from "../models/PerformanceReport";
import { PerformanceAlgorithmType } from "../enums/PerformanceAlgorithmType";

export class PerformanceReportDTO {
    id: number;
    algorithmType: PerformanceAlgorithmType;
    title: string;
    simulationData: any;
    efficiencyMetrics: any;
    conclusions: string | null;
    createdAt: Date;
    createdBy: number | null;
    packagesProcessed: number;
    averageProcessingTime: number;
    totalSimulationTime: number;

    constructor(report: PerformanceReport) {
        this.id = report.id;
        this.algorithmType = report.algorithmType;
        this.title = report.title;
        this.simulationData = report.simulationData;
        this.efficiencyMetrics = report.efficiencyMetrics;
        this.conclusions = report.conclusions;
        this.createdAt = report.createdAt;
        this.createdBy = report.createdBy;
        this.packagesProcessed = report.packagesProcessed;
        this.averageProcessingTime = report.averageProcessingTime;
        this.totalSimulationTime = report.totalSimulationTime;
    }
}
