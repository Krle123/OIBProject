import { AlgorithmType } from "../enums/AlgorithmType";

export interface PerformanceReportDTO {
    id?: number;
    algorithm: AlgorithmType;
    efficiency: number;
    conclusions: string;
    createdAt?: Date;
}
