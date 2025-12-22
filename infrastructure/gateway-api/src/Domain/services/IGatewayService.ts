import { LogDTO } from "../DTOs/LogDTO";
import { LoginUserDTO } from "../DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../DTOs/RegistrationUserDTO";
import { UserDTO } from "../DTOs/UserDTO";
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
}
