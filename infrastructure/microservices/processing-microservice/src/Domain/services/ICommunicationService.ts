import { FieldPlantDTO } from "../DTOs/FieldPlantDTO";


export interface ICommunicationService {
    plantHerb(id: number, quantity: number): Promise<number[]>;
    changeAromaticPower(plantId: number, changePercentage: number): Promise<boolean>;
    harvestPlant(plantId: number, quantity: number): Promise<FieldPlantDTO[]>;
    processPlant(plantId: number): Promise<boolean>;
}