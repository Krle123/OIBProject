import { Repository } from "typeorm";
import { PerformanceReport } from "../Domain/models/PerformanceReport";
import { PerformanceReportDTO } from "../Domain/DTOs/PerformanceReportDTO";
import { IPerformanceService } from "../Domain/services/IPerformanceService";
import { ICommunicationService } from "../Domain/services/ICommunicationService";
import { PerformanceAlgorithmType } from "../Domain/enums/PerformanceAlgorithmType";

interface SimulationResult {
    algorithmType: PerformanceAlgorithmType;
    numberOfPackages: number;
    packagesProcessed: number;
    totalTime: number;
    averageTimePerPackage: number;
    efficiency: number;
    throughput: number;
    details: {
        packageProcessingTimes: number[];
        bottlenecks: string[];
        recommendations: string[];
    };
}

export class PerformanceService implements IPerformanceService {
    constructor(
        private readonly reportRepository: Repository<PerformanceReport>,
        private readonly communicationService: ICommunicationService
    ) {}

    async runSimulation(
        algorithmType: PerformanceAlgorithmType,
        numberOfPackages: number,
        userId?: number
    ): Promise<PerformanceReportDTO> {
        try {
            await this.communicationService.logEvent(
                "INFO",
                `Pokrenuta simulacija performansi za algoritam: ${algorithmType}, broj paketa: ${numberOfPackages}`
            );

            const simulationResult = await this.simulateAlgorithm(algorithmType, numberOfPackages);

            const report = new PerformanceReport();
            report.algorithmType = algorithmType;
            report.title = `Simulacija performansi - ${this.getAlgorithmName(algorithmType)}`;
            report.simulationData = {
                numberOfPackages,
                algorithmType,
                timestamp: new Date().toISOString()
            };
            report.efficiencyMetrics = {
                totalTime: simulationResult.totalTime,
                averageTimePerPackage: simulationResult.averageTimePerPackage,
                efficiency: simulationResult.efficiency,
                throughput: simulationResult.throughput,
                packagesProcessed: simulationResult.packagesProcessed
            };
            report.conclusions = this.generateConclusions(simulationResult);
            report.createdBy = userId || null;
            report.packagesProcessed = simulationResult.packagesProcessed;
            report.averageProcessingTime = simulationResult.averageTimePerPackage;
            report.totalSimulationTime = simulationResult.totalTime;

            const savedReport = await this.reportRepository.save(report);

            await this.communicationService.logEvent(
                "INFO",
                `Simulacija performansi zavrsena uspesno. ID izvestaja: ${savedReport.id}`
            );

            return new PerformanceReportDTO(savedReport);
        } catch (error: any) {
            await this.communicationService.logEvent(
                "ERROR",
                `Greska pri pokretanju simulacije performansi: ${error.message}`
            );
            throw error;
        }
    }

    private async simulateAlgorithm(
        algorithmType: PerformanceAlgorithmType,
        numberOfPackages: number
    ): Promise<SimulationResult> {
        // Simulacija logističkog algoritma
        const config = this.getAlgorithmConfig(algorithmType);
        const packageProcessingTimes: number[] = [];
        const bottlenecks: string[] = [];
        const recommendations: string[] = [];

        let totalTime = 0;
        let packagesProcessed = 0;

        // Simulacija procesiranja paketa
        for (let i = 0; i < numberOfPackages; i++) {
            const processingTime = config.processingTimePerPackage;
            
            // Dodaj varijaciju u vremenu procesiranja (±20%)
            const variation = 1 + (Math.random() - 0.5) * 0.4;
            const actualTime = processingTime * variation;
            
            packageProcessingTimes.push(actualTime);
            totalTime += actualTime;
            packagesProcessed++;

            // Simulacija bottleneck-a
            if (actualTime > config.processingTimePerPackage * 1.3) {
                bottlenecks.push(`Paket ${i + 1} ima duže vreme procesiranja: ${actualTime.toFixed(2)}s`);
            }
        }

        const averageTimePerPackage = totalTime / packagesProcessed;
        const efficiency = this.calculateEfficiency(config, averageTimePerPackage, packagesProcessed);
        const throughput = packagesProcessed / totalTime; // paketa po sekundi

        // Generisanje preporuka
        if (averageTimePerPackage > config.processingTimePerPackage * 1.2) {
            recommendations.push("Preporučuje se optimizacija procesa obrade paketa");
        }
        if (throughput < config.expectedThroughput) {
            recommendations.push("Potrebno je povećati kapacitet sistema");
        }
        if (bottlenecks.length > numberOfPackages * 0.1) {
            recommendations.push("Identifikovani su bottleneck-i u sistemu - potrebna analiza");
        }

        return {
            algorithmType,
            numberOfPackages,
            packagesProcessed,
            totalTime,
            averageTimePerPackage,
            efficiency,
            throughput,
            details: {
                packageProcessingTimes,
                bottlenecks,
                recommendations
            }
        };
    }

    private getAlgorithmConfig(algorithmType: PerformanceAlgorithmType) {
        switch (algorithmType) {
            case PerformanceAlgorithmType.DISTRIBUTIVE_CENTER:
                return {
                    processingTimePerPackage: 0.5, // sekundi
                    maxPackagesPerBatch: 3,
                    expectedThroughput: 6 // paketa po sekundi
                };
            case PerformanceAlgorithmType.WAREHOUSE_CENTER:
                return {
                    processingTimePerPackage: 2.5, // sekundi
                    maxPackagesPerBatch: 1,
                    expectedThroughput: 0.4 // paketa po sekundi
                };
            default:
                throw new Error(`Nepoznat tip algoritma: ${algorithmType}`);
        }
    }

    private calculateEfficiency(
        config: any,
        averageTime: number,
        packagesProcessed: number
    ): number {
        // Efikasnost se računa kao odnos očekivanog i stvarnog vremena
        const expectedTime = config.processingTimePerPackage;
        const efficiency = (expectedTime / averageTime) * 100;
        return Math.max(0, Math.min(100, efficiency)); // Ograniči na 0-100%
    }

    private generateConclusions(result: SimulationResult): string {
        const config = this.getAlgorithmConfig(result.algorithmType);
        let conclusions = `Analiza performansi algoritma ${this.getAlgorithmName(result.algorithmType)}:\n\n`;
        
        conclusions += `Ukupno procesirano paketa: ${result.packagesProcessed}\n`;
        conclusions += `Ukupno vreme simulacije: ${result.totalTime.toFixed(2)} sekundi\n`;
        conclusions += `Prosečno vreme po paketu: ${result.averageTimePerPackage.toFixed(2)} sekundi\n`;
        conclusions += `Efikasnost: ${result.efficiency.toFixed(2)}%\n`;
        conclusions += `Throughput: ${result.throughput.toFixed(2)} paketa/sekundi\n\n`;

        if (result.details.bottlenecks.length > 0) {
            conclusions += `Identifikovani bottleneck-i: ${result.details.bottlenecks.length}\n`;
        }

        if (result.details.recommendations.length > 0) {
            conclusions += `Preporuke:\n`;
            result.details.recommendations.forEach((rec, index) => {
                conclusions += `${index + 1}. ${rec}\n`;
            });
        }

        if (result.efficiency >= 90) {
            conclusions += `\nZaključak: Algoritam pokazuje odlične performanse.`;
        } else if (result.efficiency >= 70) {
            conclusions += `\nZaključak: Algoritam pokazuje dobre performanse sa prostorom za poboljšanje.`;
        } else {
            conclusions += `\nZaključak: Algoritam zahteva optimizaciju performansi.`;
        }

        return conclusions;
    }

    private getAlgorithmName(algorithmType: PerformanceAlgorithmType): string {
        switch (algorithmType) {
            case PerformanceAlgorithmType.DISTRIBUTIVE_CENTER:
                return "Distributivni Centar Skladišta";
            case PerformanceAlgorithmType.WAREHOUSE_CENTER:
                return "Magacinski Centar Skladišta";
            default:
                return algorithmType;
        }
    }


    async getAllReports(): Promise<PerformanceReportDTO[]> {
        try {
            const reports = await this.reportRepository.find({
                order: { createdAt: "DESC" }
            });
            return reports.map(report => new PerformanceReportDTO(report));
        } catch (error: any) {
            await this.communicationService.logEvent(
                "ERROR",
                `Greska pri dohvatanju svih izvestaja performansi: ${error.message}`
            );
            throw error;
        }
    }

    async getReportById(id: number): Promise<PerformanceReportDTO | null> {
        try {
            const report = await this.reportRepository.findOne({ where: { id } });
            return report ? new PerformanceReportDTO(report) : null;
        } catch (error: any) {
            await this.communicationService.logEvent(
                "ERROR",
                `Greska pri dohvatanju izvestaja performansi po ID: ${error.message}`
            );
            throw error;
        }
    }

    async getReportsByAlgorithmType(
        algorithmType: PerformanceAlgorithmType
    ): Promise<PerformanceReportDTO[]> {
        try {
            const reports = await this.reportRepository.find({
                where: { algorithmType },
                order: { createdAt: "DESC" }
            });
            return reports.map(report => new PerformanceReportDTO(report));
        } catch (error: any) {
            await this.communicationService.logEvent(
                "ERROR",
                `Greska pri dohvatanju izvestaja performansi po tipu algoritma: ${error.message}`
            );
            throw error;
        }
    }
}
