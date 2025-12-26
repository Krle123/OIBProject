import { FieldPlantDTO } from "../DTOs/FieldPlantDTO";
import { LogDTO } from "../DTOs/LogDTO";
import { LoginUserDTO } from "../DTOs/LoginUserDTO";
import { PlantDTO } from "../DTOs/PlantDTO";
import { RegistrationUserDTO } from "../DTOs/RegistrationUserDTO";
import { UserDTO } from "../DTOs/UserDTO";
import { PlantState } from "../enums/PlantState";
import { AuthResponseType } from "../types/AuthResponse";

export interface IGatewayService {
  // Auth
  login(data: LoginUserDTO): Promise<AuthResponseType>;
  register(data: RegistrationUserDTO): Promise<AuthResponseType>;

  // Users
  getAllUsers(): Promise<UserDTO[]>;
  getUserById(id: number): Promise<UserDTO>;

  // Logs
  searchLogs(type?: string, fromTs?: string, toTs?: string): Promise<LogDTO[]>;
  addLog(type: string, description: string): Promise<void>;
  updateLog(id: number, description: string): Promise<void>;
  deleteLog(id: number): Promise<void>;

  // Production
  getPlantsById(plantId: number): Promise<FieldPlantDTO[]>;
  getPlantsByState(plantState: PlantState): Promise<FieldPlantDTO[]>;
  getAllPlants(): Promise<PlantDTO[]>;
  getAllFieldPlants(): Promise<FieldPlantDTO[]>;
  plantHerb(plantId: number, quantity: number): Promise<boolean>;
  changeAromaticPower(fieldPlantId: number, changePercentage: number): Promise<boolean>;
  harvestPlant(plantId: number, quantity: number): Promise<boolean>;
}
