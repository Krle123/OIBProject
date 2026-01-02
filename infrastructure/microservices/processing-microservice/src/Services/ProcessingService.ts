import { IProcessingService } from "../Domain/services/IProcessingService";
import { ICommunicationService } from "../Domain/services/ICommunicationService";
import { Repository } from "typeorm";
import { Perfume } from "../Domain/models/Perfume";
import { PerfumeDTO } from "../Domain/DTOs/PerfumeDTO";
import { FieldPlantDTO } from "../Domain/DTOs/FieldPlantDTO";
import { PlantState } from "../Domain/enums/PlantState";
import { PerfumeType } from "../Domain/enums/PerfumeType";
import { PerfumeState } from "../Domain/enums/PerfumeState";

export class ProcessingService implements IProcessingService {
    constructor(private communicationService: ICommunicationService, private perfumeRepository: Repository<Perfume>) { }

    async beginPlantProcessing(plantId: number, quantity: number): Promise<boolean> {
        const harvestedPlants = await this.communicationService.harvestPlant(Number(plantId), quantity);
        for (const plant of harvestedPlants) {
            const processed = await this.communicationService.processPlant(plant.id);
            if (!processed) {
                return false;
            }
        }
        return true;
    }

    async createPerfumeBatch(perfume: PerfumeDTO, numberOfBottles: number): Promise<PerfumeDTO[]> {
        const perfumes: PerfumeDTO[] = [];
        for (let i = 0; i < numberOfBottles; i++) {
            const processed = await this.beginPlantProcessing(perfume.plantId, perfume.quantity/50);
            if (!processed) {
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

        return perfumes;
    }
}