import { AnalysisType } from "../../enums/AnalysisType";
import { FiscalReceiptDTO } from "./FiscalReceiptDTO";
import { PerfumeDTO } from "../perfume/PerfumeDTO";

export interface AnalysisReportDTO {
    id: number;
    analysisType: AnalysisType;
    title: string;
    description: string | null;
    total?: number;
    receipts?: FiscalReceiptDTO[];
    perfumes?: PerfumeDTO[];
    trend?: { date: string; value: number }[];
    extraData?: number;
    createdAt: Date;
    createdBy: number | null;
    periodStart: Date | null;
    periodEnd: Date | null;
}
