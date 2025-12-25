import { PlantDTO } from "../DTOs/PlantDTO";
import { FieldPlantDTO } from "../DTOs/FieldPlantDTO";

export interface IPlantService {
    getPlantsById(plantId: number): Promise<FieldPlantDTO[]>;
    getPlantsByState(state: string): Promise<FieldPlantDTO[]>;
    getAllPlants(): Promise<PlantDTO[]>;
    getAllFieldPlants(): Promise<FieldPlantDTO[]>;
}