import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { Response } from "express";

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, {
        provide: JwtService,
        useValue: {
          sign: jest.fn()
        }
      }],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isValidEmail', () => {
    it('should return true if is a valid email', async () => {
      expect(service.isValidEmail('ryan@ryan.com')).toBe(true);
    });

    it('should return false if not a valid email', async () => {
      expect(service.isValidEmail('ryan')).toBe(false);
    });

    it('should return true if email contains chinese characters', async () => {
      expect(service.isValidEmail('测试@测试.com')).toBe(true);
    });
  });

  describe('isValidPassword', () => {
    it('should return false if the password is invalid', async () => {
      expect(service.isValidPassword('1234')).toBe(false);
    });

    it('should return true if the password is valid', async () => {
      expect(service.isValidPassword('password')).toBe(true);
    });
  });

  describe('hashPassword', () => {
    it('should hash the password', async () => {
      const hashed = await service.hashPassword('password');
      expect(hashed).not.toBeNull();
    });
  });

  describe('isAuthorized', () => {
    it('should return true with the user is properly authorized', async () => {
      const password = 'password';
      const hashed = await service.hashPassword(password);
      const isAuthorized = await service.isAuthorized(password, hashed);
      expect(isAuthorized).toBe(true);
    });

    it('should return false when the user it not properly authorized', async () => {
      const hash = await service.hashPassword('password');
      const isAuthorized = await service.isAuthorized('differentpassword', hash);
      expect(isAuthorized).toBe(false);
    });
  });

  describe('respondSuccess', () => {
    const res = {
      cookie: jest.fn(),
      send: jest.fn()
    } as any;

    it('should send a token in the response', async () => {
      await service.respondSuccess(res, 'd404615a-cf92-478d-a754-758774a99866');
      expect(res.cookie).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalled();
    });
  })

});
