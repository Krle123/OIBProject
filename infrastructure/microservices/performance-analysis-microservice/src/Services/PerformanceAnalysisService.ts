import { Repository } from "typeorm";
import { PerformanceReport } from "../Domain/models/PerformanceReport";
import { PerformanceReportDTO } from "../Domain/DTOs/PerformanceReportDTO";
import { AlgorithmType } from "../Domain/enums/AlgorithmType";

export class PerformanceAnalysisService {
    constructor(private reportRepository: Repository<PerformanceReport>) {}

    async runSimulation(algorithm: AlgorithmType): Promise<PerformanceReportDTO> {
        // TODO: Implement simulation logic for the algorithm
        // Example dummy data:
        const efficiency = Math.random() * 100;
        const conclusions = `Simulacija za ${algorithm} završena. Efikasnost: ${efficiency.toFixed(2)}%`;
        const report = this.reportRepository.create({
            algorithm,
            efficiency,
            conclusions,
        });
        const saved = await this.reportRepository.save(report);
        return this.toDTO(saved);
    }

    async getAllReports(): Promise<PerformanceReportDTO[]> {
        const reports = await this.reportRepository.find({ order: { createdAt: "DESC" } });
        return reports.map(this.toDTO);
    }

    async getReportById(id: number): Promise<PerformanceReportDTO | null> {
        const report = await this.reportRepository.findOne({ where: { id } });
        return report ? this.toDTO(report) : null;
    }

    private toDTO(report: PerformanceReport): PerformanceReportDTO {
        return {
            id: report.id,
            algorithm: report.algorithm,
            efficiency: report.efficiency,
            conclusions: report.conclusions,
            createdAt: report.createdAt,
        };
    }
}
