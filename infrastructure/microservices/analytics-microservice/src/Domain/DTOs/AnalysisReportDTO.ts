import { AnalysisReport } from "../models/AnalysisReport";
import { AnalysisType } from "../enums/AnalysisType";

export class AnalysisReportDTO {
    id: number;
    analysisType: AnalysisType;
    title: string;
    data: any;
    description: string | null;
    createdAt: Date;
    createdBy: number | null;
    periodStart: Date | null;
    periodEnd: Date | null;

    constructor(report: AnalysisReport) {
        this.id = report.id;
        this.analysisType = report.analysisType;
        this.title = report.title;
        this.data = report.data;
        this.description = report.description;
        this.createdAt = report.createdAt;
        this.createdBy = report.createdBy;
        this.periodStart = report.periodStart;
        this.periodEnd = report.periodEnd;
    }
}
