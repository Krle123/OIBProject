import { Repository } from "typeorm";
import { IUsersService } from "../Domain/services/IUsersService";
import { User } from "../Domain/models/User";
import { UserDTO } from "../Domain/DTOs/UserDTO";
import { ILogerService } from "../Domain/services/ILogerService";

export class UsersService implements IUsersService {
  constructor(private userRepository: Repository<User>, private logServiceApi: ILogerService) {}

  /**
   * Get all users
   */
  async getAllUsers(): Promise<UserDTO[]> {
    const users = await this.userRepository.find();
    await this.logServiceApi.logEvent("INFO", `Fetched all users, count: ${users.length}`);
    return users.map(u => this.toDTO(u));
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<UserDTO> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      await this.logServiceApi.logEvent("ERROR", `User with ID ${id} not found`);
      throw new Error(`User with ID ${id} not found`);
    }
    await this.logServiceApi.logEvent("INFO", `Fetched user with ID: ${id}`);
    return this.toDTO(user);
  }

  /**
   * Convert User entity to UserDTO
   */
  private toDTO(user: User): UserDTO {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage ?? "",
    };
  }
}
