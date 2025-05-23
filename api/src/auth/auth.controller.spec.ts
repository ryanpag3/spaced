import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { CreateUserDto } from 'src/users/dto/CreateUserDto';
import { UserDto } from 'src/users/dto/UserDto';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

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
            respondSuccess: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            getAuthDetails: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    res = {
      send: jest.fn((body) => body),
    } as unknown as Response;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    const userDto: CreateUserDto = {
      email: 'ryan@ryan.com',
      username: 'ryan',
      password: 'p4ssw0rd',
    };

    it('should hash password, create user, and respond with success', async () => {
      const createdUser: UserDto = {
        id: '9c0eee95-c0e7-4876-8dba-27af8a719c54',
        username: 'ryan',
        email: 'ryan@ryan.com',
        password: 'p4ssw0rd',
      };

      (usersService.create as jest.Mock).mockResolvedValue(createdUser);
      (authService.hashPassword as jest.Mock).mockResolvedValue(
        userDto.password,
      );

      await controller.signup({ ...userDto }, res);
      expect(authService.hashPassword).toHaveBeenCalledWith(userDto.password);
      expect(usersService.create).toHaveBeenCalledWith(userDto);
      expect(authService.respondSuccess).toHaveBeenCalledWith(
        res,
        createdUser.id,
        createdUser.username,
      );
    });

    it('should throw ConflictException when code is 23505', async () => {
      const error: any = new Error('duplicate');
      error.code = '23505';
      (usersService.create as jest.Mock).mockRejectedValue(error);

      await expect(
        controller.signup({ ...userDto }, res),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    const loginCredentials = { email: 'ryan@ryan.com', password: 'p4ssw0rd' };

    it('should check if the user exists, check if the user is authorized, and then respond success', async () => {
      (usersService.getAuthDetails as jest.Mock).mockResolvedValue({
        id: '6cb1502c-2a84-41f8-9156-1d908316fc3b',
        username: 'ryan',
        email: 'ryan@ryan.com',
        password: 'p4ssw0rd',
      });

      (authService.isAuthorized as jest.Mock).mockResolvedValue(true);

      await controller.login(loginCredentials, res);

      expect(authService.respondSuccess).toHaveBeenCalled();
    });

    it('should throw an error if the user does not exist', async () => {
      (usersService.getAuthDetails as jest.Mock).mockResolvedValue(null);

      await expect(
        controller.login(loginCredentials, res),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('should throw an error if the user is not authorized', async () => {
      (usersService.getAuthDetails as jest.Mock).mockResolvedValue({
        id: '6cb1502c-2a84-41f8-9156-1d908316fc3b',
        username: 'ryan',
        email: 'ryan@ryan.com',
        password: 'p4ssw0rd',
      });

      (authService.isAuthorized as jest.Mock).mockResolvedValue(false);

      await expect(
        controller.login(loginCredentials, res),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
