import AuthService from '../services/AuthService';
import * as SecureStore from 'expo-secure-store';
import SpacedApi from '@/api/spaced';

// Mock dependencies
jest.mock('expo-secure-store');
jest.mock('@/api/spaced');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('storeToken', () => {
    it('should store token in secure storage', async () => {
      await AuthService.storeToken('test-token');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('auth.token', 'test-token');
    });
  });

  describe('getToken', () => {
    it('should retrieve token from secure storage', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('test-token');
      const token = await AuthService.getToken();
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('auth.token');
      expect(token).toBe('test-token');
    });

    it('should return null if no token exists', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      const token = await AuthService.getToken();
      expect(token).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if token exists', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('test-token');
      const isAuth = await AuthService.isAuthenticated();
      expect(isAuth).toBe(true);
    });

    it('should return false if no token exists', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      const isAuth = await AuthService.isAuthenticated();
      expect(isAuth).toBe(false);
    });
  });

  describe('removeToken', () => {
    it('should remove token from secure storage', async () => {
      await AuthService.removeToken();
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth.token');
    });
  });

  describe('signIn', () => {
    it('should sign in user and store token', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({ token: 'test-token' })
      };
      (SpacedApi.login as jest.Mock).mockResolvedValue(mockResponse);
      
      await AuthService.signIn('test@example.com', 'password');
      
      expect(SpacedApi.login).toHaveBeenCalledWith('test@example.com', 'password');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('auth.token', 'test-token');
    });

    it('should throw error if token is not provided', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({ success: true }) // No token
      };
      (SpacedApi.login as jest.Mock).mockResolvedValue(mockResponse);
      
      await expect(AuthService.signIn('test@example.com', 'password'))
        .rejects.toThrow('Token was not provided by login endpoint.');
    });
  });

  describe('withToken', () => {
    it('should execute callback with token', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('test-token');
      const callback = jest.fn().mockResolvedValue('result');
      
      const result = await AuthService.withToken(callback);
      
      expect(callback).toHaveBeenCalledWith('test-token');
      expect(result).toBe('result');
    });
    
    it('should throw error if no token exists', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      const callback = jest.fn();
      
      await expect(AuthService.withToken(callback))
        .rejects.toThrow('No authentication token found');
      expect(callback).not.toHaveBeenCalled();
    });
  });
});