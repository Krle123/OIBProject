import { FieldPlantDTO } from "../DTOs/FieldPlantDTO";

export interface IProductionService {
    plantHerb(id: number, quantity: number): Promise<boolean>;
    changeAromaticPower(plantId: number, changePercentage: number): Promise<boolean>;
    harvestPlant(plantId: number, quantity: number): Promise<FieldPlantDTO[]>;
}