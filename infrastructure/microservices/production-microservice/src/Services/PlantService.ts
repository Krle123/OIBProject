import { Repository } from "typeorm";
import { FieldPlant } from "../Domain/models/FieldPlant";
import { IPlantService } from "../Domain/services/IPlantService";
import { PlantDTO } from "../Domain/DTOs/PlantDTO";
import { Plant } from "../Domain/models/Plant";
import { FieldPlantDTO } from "../Domain/DTOs/FieldPlantDTO";
import { PlantState } from "../Domain/enums/PlantState";

export class PlantService implements IPlantService {
    constructor(private plantRepository: Repository<Plant>, private fieldPlantRepository: Repository<FieldPlant>) {}

    async getPlantsById(plantId: number): Promise<FieldPlantDTO[]> 
    {
        const plants = await this.fieldPlantRepository.find({ where: { id: plantId } });
        if (plants.length > 0) {
            return plants.map(plant => ({
                id: plant.id,
                name: plant.name,
                aromaticPower: plant.aromaticPower,
                latinName: plant.latinName,
                countryOrigin: plant.countryOrigin,
                state: plant.state,
            }));
        }
        return [];
    }

    async getPlantsByState(plantState: PlantState): Promise<FieldPlantDTO[]> 
    {
        const plants = await this.fieldPlantRepository.find({ where: { state: plantState } });
        if (plants.length > 0) {
            return plants.map(plant => ({
                id: plant.id,
                name: plant.name,
                aromaticPower: plant.aromaticPower,
                latinName: plant.latinName,
                countryOrigin: plant.countryOrigin,
                state: plant.state,
            }));
        }
        return [];
    }

    async getAllPlants(): Promise<PlantDTO[]> 
    {
        const plants = await this.plantRepository.find();
        if (plants.length > 0) {
            return plants.map(plant => ({
                id: plant.id,
                name: plant.name,
                latinName: plant.latinName,
                countryOrigin: plant.countryOrigin
            }));
        }
        return [];
    }

    async getAllFieldPlants(): Promise<FieldPlantDTO[]> 
    {
        const plants = await this.fieldPlantRepository.find();
        if (plants.length > 0) {
            return plants.map(plant => ({
                id: plant.id,
                name: plant.name,
                aromaticPower: plant.aromaticPower,
                latinName: plant.latinName,
                countryOrigin: plant.countryOrigin,
                state: plant.state,
            }));
        }
        return [];
    }
}