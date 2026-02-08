import { Repository } from "typeorm";
import bcrypt from "bcryptjs";
import { User } from "../Domain/models/User";
import { IAuthService } from "../Domain/services/IAuthService";
import { LoginUserDTO } from "../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../Domain/DTOs/RegistrationUserDTO";
import { AuthResponseType } from "../Domain/types/AuthResponse";
import { ILogerService } from "../Domain/services/ILogerService";
import { UserRole } from "../Domain/enums/UserRole";

export class AuthService implements IAuthService {
  private readonly saltRounds: number = parseInt(process.env.SALT_ROUNDS || "10", 10);

  constructor(private userRepository: Repository<User>, private logerService: ILogerService) {}

  /**
   * Login user
   */
  async login(data: LoginUserDTO): Promise<AuthResponseType> {
    await this.logerService.logEvent("INFO", `Attempting login for user: ${data.username}`);
    const user = await this.userRepository.findOne({ where: { username: data.username } });
    if (!user) {
      await this.logerService.logEvent("WARNING", `Failed login attempt for non-existent user: ${data.username}`);
      return { authenificated: false };
    }

    const passwordMatches = await bcrypt.compare(data.password, user.password);
    if (!passwordMatches) {
      await this.logerService.logEvent("WARNING", `Failed login attempt for user: ${data.username} - incorrect password`);
      return { authenificated: false };
    }

    await this.logerService.logEvent("INFO", `User logged in successfully: ${data.username}`);
    return {
      authenificated: true,
      userData: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  /**
   * Register new user
   */
  async register(data: RegistrationUserDTO): Promise<AuthResponseType> {
    // Check if username or email already exists
    await this.logerService.logEvent("INFO", `Attempting registration for user: ${data.username}`);
    const existingUser = await this.userRepository.findOne({
      where: [{ username: data.username }, { email: data.email }],
    });

    if (existingUser) {
      await this.logerService.logEvent("WARNING", `Failed registration attempt for existing user: ${data.username}`);
      return { authenificated: false };
    }

    const hashedPassword = await bcrypt.hash(data.password, this.saltRounds);

    await this.logerService.logEvent("INFO", `Registering new user: ${data.username}`);
    const newUser = this.userRepository.create({
      username: data.username,
      email: data.email,
      role: data.role,
      password: hashedPassword,
      profileImage: data.profileImage ?? null,
    });

    const savedUser = await this.userRepository.save(newUser);

    return {
      authenificated: true,
      userData: {
        id: savedUser.id,
        username: savedUser.username,
        role: savedUser.role,
      },
    };
  }

  async initializeUser(): Promise<void> {
    const newUser = this.userRepository.create({
      username: 'test',
      email: 'test@gmail.com',
      role: UserRole.SELLER,
      password: await bcrypt.hash('123456', this.saltRounds),
      profileImage: null,
    });
    await this.userRepository.save(newUser);
  }
}
