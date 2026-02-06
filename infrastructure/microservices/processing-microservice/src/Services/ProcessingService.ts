import { IProcessingService } from "../Domain/services/IProcessingService";
import { ICommunicationService } from "../Domain/services/ICommunicationService";
import { Repository } from "typeorm";
import { Perfume } from "../Domain/models/Perfume";
import { PerfumeDTO } from "../Domain/DTOs/PerfumeDTO";
import { FieldPlantDTO } from "../Domain/DTOs/FieldPlantDTO";
import { PlantState } from "../Domain/enums/PlantState";
import { PerfumeType } from "../Domain/enums/PerfumeType";
import { PerfumeState } from "../Domain/enums/PerfumeState";
import { ILogerService } from "../Domain/services/ILogerService";

export class ProcessingService implements IProcessingService {
    constructor(private communicationService: ICommunicationService, private perfumeRepository: Repository<Perfume>, private logerService: ILogerService) { }

    async beginPlantProcessing(plantId: number, quantity: number): Promise<boolean> {
        const harvestedPlants = await this.communicationService.harvestPlant(Number(plantId), quantity);
        await this.logerService.logEvent("INFO", `Started processing plant with ID ${plantId}`);
        for (const plant of harvestedPlants) {
            const processed = await this.communicationService.processPlant(plant.id);
            if (!processed) {
                await this.logerService.logEvent("ERROR", `Failed to process plant with ID ${plant.id}`);
                return false;
            }
        }
        await this.logerService.logEvent("INFO", `Finished processing plant with ID ${plantId}`);
        return true;
    }

    async createPerfumeBatch(perfume: PerfumeDTO, numberOfBottles: number): Promise<PerfumeDTO[]> {
        const perfumes: PerfumeDTO[] = [];
        await this.logerService.logEvent("INFO", `Creating perfume batch: ${perfume.name}, Quantity: ${numberOfBottles}`);
        for (let i = 0; i < numberOfBottles; i++) {
            const processed = await this.beginPlantProcessing(perfume.plantId, perfume.quantity/50);
            if (!processed) {
                await this.logerService.logEvent("ERROR", `Failed to process plant with ID ${perfume.plantId}`);
                return [];
            }
            const newPerfume = this.perfumeRepository.create({
                serialNumber: perfume.serialNumber,
                name: perfume.name,
                type: perfume.type as PerfumeType,
                quantity: perfume.quantity,
                plantId: perfume.plantId,
                state: PerfumeState.PRODUCED,
                expirationDate: perfume.expirationDate
            });
            await this.perfumeRepository.save(newPerfume);
            perfumes.push(newPerfume);
        }
        await this.logerService.logEvent("INFO", `Finished creating perfume batch: ${perfume.name}, Quantity: ${numberOfBottles}`);
        return perfumes;
    }
}