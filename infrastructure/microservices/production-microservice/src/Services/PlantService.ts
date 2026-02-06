import { Repository } from "typeorm";
import { FieldPlant } from "../Domain/models/FieldPlant";
import { IPlantService } from "../Domain/services/IPlantService";
import { PlantDTO } from "../Domain/DTOs/PlantDTO";
import { Plant } from "../Domain/models/Plant";
import { FieldPlantDTO } from "../Domain/DTOs/FieldPlantDTO";
import { PlantState } from "../Domain/enums/PlantState";
import { ILogerService } from "../Domain/services/ILogerService";

export class PlantService implements IPlantService {
    constructor(private plantRepository: Repository<Plant>, private fieldPlantRepository: Repository<FieldPlant>, private logServiceApi: ILogerService) {}

    async getPlantsById(plantId: number): Promise<FieldPlantDTO[]> 
    {
        await this.logServiceApi.logEvent("INFO", `Fetching plants with ID: ${plantId}`);
        const plants = await this.fieldPlantRepository.find({ where: { plantId: plantId } });
        if (plants.length > 0) {
            await this.logServiceApi.logEvent("INFO", `Found ${plants.length} plants with ID: ${plantId}`);
            return plants.map(plant => ({
                id: plant.id,
                name: plant.name,
                aromaticPower: plant.aromaticPower,
                latinName: plant.latinName,
                countryOrigin: plant.countryOrigin,
                state: plant.state,
            }));
        }
        await this.logServiceApi.logEvent("WARNING", `No plants found with ID: ${plantId}`);
        return [];
    }

    async getPlantsByState(plantState: PlantState): Promise<FieldPlantDTO[]> 
    {
        await this.logServiceApi.logEvent("INFO", `Fetching plants with state: ${plantState}`);
        const plants = await this.fieldPlantRepository.find({ where: { state: plantState } });
        if (plants.length > 0) {
            await this.logServiceApi.logEvent("INFO", `Found ${plants.length} plants with state: ${plantState}`);
            return plants.map(plant => ({
                id: plant.id,
                name: plant.name,
                aromaticPower: plant.aromaticPower,
                latinName: plant.latinName,
                countryOrigin: plant.countryOrigin,
                state: plant.state,
            }));
        }
        await this.logServiceApi.logEvent("WARNING", `No plants found with state: ${plantState}`);
        return [];
    }

    async getAllPlants(): Promise<PlantDTO[]> 
    {
        await this.logServiceApi.logEvent("INFO", "Fetching all plants");
        const plants = await this.plantRepository.find();
        if (plants.length > 0) {
            await this.logServiceApi.logEvent("INFO", `Found ${plants.length} plants in total`);
            return plants.map(plant => ({
                id: plant.id,
                name: plant.name,
                latinName: plant.latinName,
                countryOrigin: plant.countryOrigin
            }));
        }
        await this.logServiceApi.logEvent("WARNING", "No plants found in the database");
        return [];
    }

    async getAllFieldPlants(): Promise<FieldPlantDTO[]> 
    {
        await this.logServiceApi.logEvent("INFO", "Fetching all field plants");
        const plants = await this.fieldPlantRepository.find();
        if (plants.length > 0) {
            await this.logServiceApi.logEvent("INFO", `Found ${plants.length} field plants in total`);
            return plants.map(plant => ({
                id: plant.id,
                name: plant.name,
                aromaticPower: plant.aromaticPower,
                latinName: plant.latinName,
                countryOrigin: plant.countryOrigin,
                state: plant.state,
            }));
        }
        await this.logServiceApi.logEvent("WARNING", "No field plants found in the database");
        return [];
    }
}