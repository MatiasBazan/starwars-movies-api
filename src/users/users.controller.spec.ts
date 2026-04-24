import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Role } from './entities/role.enum';
import { User } from './entities/user.entity';

const mockUser: User = {
  id: 'uuid-1',
  email: 'test@example.com',
  username: 'testuser',
  password: 'hashed_password',
  role: Role.USER,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  describe('getMe', () => {
    it('should return the authenticated user', async () => {
      usersService.findById.mockResolvedValue(mockUser);

      const result = await controller.getMe({ id: 'uuid-1' });

      expect(result).toEqual(mockUser);
      expect(usersService.findById).toHaveBeenCalledWith('uuid-1');
    });

    it('should throw NotFoundException if user no longer exists', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(controller.getMe({ id: 'uuid-1' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
