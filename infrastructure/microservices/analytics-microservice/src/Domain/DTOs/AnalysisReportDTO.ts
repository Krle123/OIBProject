import { AnalysisType } from "../enums/AnalysisType";
import { FiscalReceiptDTO } from "../DTOs/FiscalReceiptDTO";
import { PerfumeDTO } from "./PerfumeDTO";

export interface AnalysisReportDTO {
    id: number;
    analysisType: AnalysisType;
    title: string;
    description: string | null;
    total?: number;
    receipts?: FiscalReceiptDTO[];
    perfumes?: PerfumeDTO[];
    extraData?: number;
    trend?: { date: string; value: number }[];
    createdAt: Date;
    createdBy: number | null;
    periodStart: Date | null;
    periodEnd: Date | null;
}
