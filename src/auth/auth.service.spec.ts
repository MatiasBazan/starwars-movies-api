import { ConflictException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { Role } from '../users/entities/role.enum';
import { User } from '../users/entities/user.entity';

const mockUser: User = {
  id: 'uuid-1',
  email: 'test@example.com',
  username: 'testuser',
  password: 'hashed_password',
  role: Role.USER,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock_token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      });

      expect(result.access_token).toBe('mock_token');
      expect(result.user).not.toHaveProperty('password');
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test@example.com' }),
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('registerAdmin', () => {
    const adminDto = {
      email: 'admin@example.com',
      username: 'adminuser',
      password: 'password123',
      adminSecret: 'correct-secret',
    };

    beforeEach(() => {
      process.env.ADMIN_SECRET = 'correct-secret';
    });

    afterEach(() => {
      delete process.env.ADMIN_SECRET;
    });

    it('should register an admin user successfully', async () => {
      const adminUser = { ...mockUser, role: Role.ADMIN };
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(adminUser);

      const result = await service.registerAdmin(adminDto);

      expect(result.access_token).toBe('mock_token');
      expect(result.user).not.toHaveProperty('password');
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: adminDto.email, role: Role.ADMIN }),
      );
    });

    it('should throw ForbiddenException if adminSecret is wrong', async () => {
      await expect(
        service.registerAdmin({ ...adminDto, adminSecret: 'wrong-secret' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if ADMIN_SECRET env var is not set', async () => {
      delete process.env.ADMIN_SECRET;

      await expect(service.registerAdmin(adminDto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException if email already exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.registerAdmin(adminDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      usersService.findByEmail.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.access_token).toBe('mock_token');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException with incorrect password', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      usersService.findByEmail.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });

      await expect(
        service.login({ email: 'test@example.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException with non-existent email', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
