import { PlantDTO } from "../../models/plants/PlantDTO";
export interface IPlantAPI {
  getAllPlants(token: string): Promise<PlantDTO[]>;
  getAllFieldPlants(token: string): Promise<PlantDTO[]>;
  getPlantById(id: number, token: string): Promise<PlantDTO>;
  plantHerb(plantId: number, quantity: number, token: string): Promise<boolean>;
  changeAromaticPower(id: number, changePercentage: number, token: string): Promise<boolean>;
  harvestPlant(plantId: number, quantity: number, token: string): Promise<boolean>;
  getProductionLogs(token: string): Promise<any[]>;
}