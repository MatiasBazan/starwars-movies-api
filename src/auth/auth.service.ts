import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ user: Omit<User, 'password'>; access_token: string }> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email: dto.email,
      username: dto.username,
      password: hashedPassword,
    });
    const access_token = this.generateToken(user);
    const { password: _pw, ...userWithoutPassword } = user;
    return { user: userWithoutPassword as Omit<User, 'password'>, access_token };
  }

  async login(dto: LoginDto): Promise<{ access_token: string; user: Omit<User, 'password'> }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const access_token = this.generateToken(user);
    const { password: _pw, ...userWithoutPassword } = user;
    return { access_token, user: userWithoutPassword as Omit<User, 'password'> };
  }

  async registerAdmin(dto: RegisterAdminDto): Promise<{ user: Omit<User, 'password'>; access_token: string }> {
    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret || dto.adminSecret !== adminSecret) {
      throw new ForbiddenException('Invalid admin secret');
    }
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email: dto.email,
      username: dto.username,
      password: hashedPassword,
      role: Role.ADMIN,
    });
    const access_token = this.generateToken(user);
    const { password: _pw, ...userWithoutPassword } = user;
    return { user: userWithoutPassword as Omit<User, 'password'>, access_token };
  }

  private generateToken(user: User): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
