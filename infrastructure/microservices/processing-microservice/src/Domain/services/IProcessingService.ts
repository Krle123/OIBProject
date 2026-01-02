import { PerfumeDTO } from "../DTOs/PerfumeDTO";
import { Perfume } from "../models/Perfume";

export interface IProcessingService {
    beginPlantProcessing(plantId: number, quantity: number): Promise<boolean>;
    createPerfumeBatch(perfume: PerfumeDTO, numberOfBottles: number): Promise<Perfume[]>;
}
