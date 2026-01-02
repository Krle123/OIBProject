import { IProductionService } from "../Domain/services/IProductionService";
import { FieldPlant } from "../Domain/models/FieldPlant";
import { PlantState } from "../Domain/enums/PlantState";
import { FieldPlantDTO } from "../Domain/DTOs/FieldPlantDTO";
import { Plant } from "../Domain/models/Plant";
import { getRandomAromaticPower } from "../Helpers/Random";
import { Repository } from "typeorm";


export class ProductionService implements IProductionService {
    constructor(private fieldPlantRepository: Repository<FieldPlant>, private plantRepository: Repository<Plant>) {}

    async plantHerb(plantId: number, quantity: number): Promise<number[]> 
    {
        const plantIds: number[] = [];
        const plant = await this.plantRepository.findOne({ where: { id: plantId } });
        if (!plant) {
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
        return plantIds;
    }

    async changeAromaticPower(plantId: number, changePercentage: number): Promise<boolean> 
    {
        const plant = await this.fieldPlantRepository.findOne({ where: { id: plantId } });
        if (!plant) {
            return false;
        }
        plant.aromaticPower = plant.aromaticPower * (changePercentage / 100);
        await this.fieldPlantRepository.save(plant);
        return true;
    }

    async harvestPlant(plantId: number, quantity: number): Promise<FieldPlantDTO[]> 
    {
        const plant = await this.plantRepository.findOne({ where: { id: plantId } });
        if (!plant) {
            return [];
        }
        const harvestedPlants: FieldPlantDTO[] = [];
        const fieldPlants = await this.fieldPlantRepository.find({ where: { plantId: plantId, state: PlantState.PLANTED }, take: quantity });
        if (fieldPlants.length < quantity) {
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
        return harvestedPlants;
    }

    async processPlant(plantId: number): Promise<boolean> {
        const plant = await this.fieldPlantRepository.findOne({ where: { id: plantId } });
        if (!plant) {
            return false;
        }
        plant.state = PlantState.PROCESSED;
        await this.fieldPlantRepository.save(plant);
        return true;
    }
}
