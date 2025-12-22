import axios, { AxiosInstance } from "axios";
import { IGatewayService } from "../Domain/services/IGatewayService";
import { LoginUserDTO } from "../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../Domain/DTOs/RegistrationUserDTO";
import { AuthResponseType } from "../Domain/types/AuthResponse";
import { UserDTO } from "../Domain/DTOs/UserDTO";
import { LogDTO } from "../Domain/DTOs/LogDTO";

export class GatewayService implements IGatewayService {
  private readonly authClient: AxiosInstance;
  private readonly userClient: AxiosInstance;

  constructor() {
    const authBaseURL = process.env.AUTH_SERVICE_API;
    const userBaseURL = process.env.USER_SERVICE_API;

    this.authClient = axios.create({
      baseURL: authBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    this.userClient = axios.create({
      baseURL: userBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    // TODO: ADD MORE CLIENTS
  }

  // Auth microservice
  async login(data: LoginUserDTO): Promise<AuthResponseType> {
    try {
      const response = await this.authClient.post<AuthResponseType>("/auth/login", data);
      return response.data;
    } catch {
      return { authenificated: false };
    }
  }

  async register(data: RegistrationUserDTO): Promise<AuthResponseType> {
    try {
      const response = await this.authClient.post<AuthResponseType>("/auth/register", data);
      return response.data;
    } catch {
      return { authenificated: false };
    }
  }

  // User microservice
  async getAllUsers(): Promise<UserDTO[]> {
    const response = await this.userClient.get<UserDTO[]>("/users");
    return response.data;
  }

  async getUserById(id: number): Promise<UserDTO> {
    const response = await this.userClient.get<UserDTO>(`/users/${id}`);
    return response.data;
  }

  // Log microservice
  async addLog(type: string, description: string): Promise<void> {
    const response = await this.userClient.post<void>("/logs/add", { type, description });
  }

  async updateLog(id: number, description: string): Promise<void> {
    const response = await this.userClient.put<void>(`/logs/update/${id}`, { description });
  }

  async deleteLog(id: number): Promise<void> {
    const response = await this.userClient.delete<void>(`/logs/${id}`);
  }

  async searchLogs(type?: string, fromTs?: string, toTs?: string): Promise<LogDTO[]> {
    const params: any = {};
    if (type) params.type = type;
    if (fromTs) params.fromTs = fromTs;
    if (toTs) params.toTs = toTs;

    const response = await this.userClient.get<LogDTO[]>("/logs", { params });
    return response.data;
  }
  // TODO: ADD MORE API CALLS
}
