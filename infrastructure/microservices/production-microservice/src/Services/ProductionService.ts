import { IProductionService } from "../Domain/services/IProductionService";
import { FieldPlant } from "../Domain/models/FieldPlant";
import { PlantState } from "../Domain/enums/PlantState";
import { FieldPlantDTO } from "../Domain/DTOs/FieldPlantDTO";
import { Plant } from "../Domain/models/Plant";
import { getRandomAromaticPower } from "../Helpers/Random";
import { Repository } from "typeorm";
import { ILogerService } from "../Domain/services/ILogerService";


export class ProductionService implements IProductionService {
    constructor(private fieldPlantRepository: Repository<FieldPlant>, private plantRepository: Repository<Plant>, private logServiceApi: ILogerService) {}

    async plantHerb(plantId: number, quantity: number): Promise<number[]> 
    {
        const plantIds: number[] = [];
        await this.logServiceApi.logEvent("INFO", `Planting ${quantity} herbs with plant ID: ${plantId}`);
        const plant = await this.plantRepository.findOne({ where: { id: plantId } });
        if (!plant) {
            await this.logServiceApi.logEvent("ERROR", `Plant with ID ${plantId} not found`);
            return plantIds;
        }
        for (let i = 0; i < quantity; i++) {
            const newFieldPlant = this.fieldPlantRepository.create({
                plantId: plantId,
                name: plant.name,
                aromaticPower: getRandomAromaticPower(),
                latinName: plant.latinName,
                countryOrigin: plant.countryOrigin,
                state: PlantState.PLANTED
            });
            await this.fieldPlantRepository.save(newFieldPlant);
            plantIds.push(newFieldPlant.id);
            if (newFieldPlant.aromaticPower > 4)
            {
                this.changeAromaticPower(newFieldPlant.id, (5-newFieldPlant.aromaticPower) * 100);
            }
        }
        await this.logServiceApi.logEvent("INFO", `Successfully planted ${quantity} herbs with plant ID: ${plantId}`);
        return plantIds;
    }

    async changeAromaticPower(plantId: number, changePercentage: number): Promise<boolean> 
    {
        await this.logServiceApi.logEvent("INFO", `Changing aromatic power of plant ID: ${plantId} by ${changePercentage}%`);
        const plant = await this.fieldPlantRepository.findOne({ where: { id: plantId } });
        if (!plant) {
            await this.logServiceApi.logEvent("ERROR", `Field plant with ID ${plantId} not found`);
            return false;
        }
        plant.aromaticPower = plant.aromaticPower * (changePercentage / 100);
        await this.fieldPlantRepository.save(plant);
        await this.logServiceApi.logEvent("INFO", `Successfully changed aromatic power of plant ID: ${plantId} to ${plant.aromaticPower}`);
        return true;
    }

    async harvestPlant(plantId: number, quantity: number): Promise<FieldPlantDTO[]> 
    {
        await this.logServiceApi.logEvent("INFO", `Harvesting ${quantity} plants with plant ID: ${plantId}`);
        const plant = await this.plantRepository.findOne({ where: { id: plantId } });
        if (!plant) {
            await this.logServiceApi.logEvent("ERROR", `Plant with ID ${plantId} not found`);
            return [];
        }
        const harvestedPlants: FieldPlantDTO[] = [];
        const fieldPlants = await this.fieldPlantRepository.find({ where: { plantId: plantId, state: PlantState.PLANTED }, take: quantity });
        if (fieldPlants.length < quantity) {
            await this.logServiceApi.logEvent("WARNING", `Only found ${fieldPlants.length} plants to harvest with plant ID: ${plantId}, needed ${quantity}, planting...`);
            await this.plantHerb(plantId, quantity - fieldPlants.length);
            const additionalFieldPlants = await this.fieldPlantRepository.find({ where: { plantId: plantId, state: PlantState.PLANTED }, order: { id: "DESC" }, take: quantity - fieldPlants.length });
            fieldPlants.push(...additionalFieldPlants);
        }
        for (const fieldPlant of fieldPlants) {
            fieldPlant.state = PlantState.HARVESTED;
            await this.fieldPlantRepository.save(fieldPlant);
            harvestedPlants.push({
                id: fieldPlant.id,
                name: fieldPlant.name,
                aromaticPower: fieldPlant.aromaticPower,
                latinName: fieldPlant.latinName,
                countryOrigin: fieldPlant.countryOrigin,
                state: fieldPlant.state
            });
        }
        await this.logServiceApi.logEvent("INFO", `Successfully harvested ${harvestedPlants.length} plants with plant ID: ${plantId}`);
        return harvestedPlants;
    }

    async processPlant(plantId: number): Promise<boolean> {
        await this.logServiceApi.logEvent("INFO", `Processing plant with ID: ${plantId}`);
        const plant = await this.fieldPlantRepository.findOne({ where: { id: plantId } });
        if (!plant) {
            await this.logServiceApi.logEvent("ERROR", `Field plant with ID ${plantId} not found`);
            return false;
        }
        plant.state = PlantState.PROCESSED;
        await this.fieldPlantRepository.save(plant);
        await this.logServiceApi.logEvent("INFO", `Successfully processed plant with ID: ${plantId}`);
        return true;
    }
}
