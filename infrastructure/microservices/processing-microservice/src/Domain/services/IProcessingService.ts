import { PerfumeType } from "../enums/PerfumeType";
import { Perfume } from "../models/Perfume";

export interface IProcessingService {
    beginPlantProcessing(plantId: string): Promise<void>;
    createPerfumeBatch(serialNumber: string, numberOfBottles: number, quantity: number, type: PerfumeType): Promise<Perfume[]>;
}
