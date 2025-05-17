import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { v4 as uuidv4 } from 'uuid'; 
import { UserDto } from 'src/users/dto/UserDto';
import { CreateUserDto } from 'src/users/dto/CreateUserDto';
import { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let usersService: UsersService;
  let res: Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            hashPassword: jest.fn(),
            isAuthorized: jest.fn(),
            respondSuccess: jest.fn()
          },
        },
        {
          provide: UsersService,
          useValue: {
            create: jest.fn().mockResolvedValue({ 
              id: uuidv4, 
              email: 'test@example.com',
              username: 'ryan',
              password: 'abcd1234'
            } as UserDto),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    res = {
      send: jest.fn((body) => body)
    } as unknown as Response;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    const userDto: CreateUserDto = { email: 'ryan@ryan.com', username: 'ryan', password: 'p4ssw0rd' };

    it('should hash password, create user, and respond with success', async () => {
      const createdUser: UserDto = { 
        id: '9c0eee95-c0e7-4876-8dba-27af8a719c54',
        username: 'ryan',
        email: 'ryan@ryan.com',
        password: 'p4ssw0rd'
      };

      (usersService.create as jest.Mock).mockResolvedValue(createdUser);
      (authService.hashPassword as jest.Mock).mockResolvedValue(userDto.password);

      await controller.signup({ ...userDto }, res);
      expect(authService.hashPassword).toHaveBeenCalledWith(userDto.password);
      expect(usersService.create).toHaveBeenCalledWith(userDto);
      expect(authService.respondSuccess).toHaveBeenCalledWith(res, createdUser.id);
    });
  });
});
