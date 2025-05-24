import * as SecureStore from 'expo-secure-store';
import SpacedApi from '@/api/spaced';
import { jwtDecode } from 'jwt-decode';

export default class AuthService {
  private static readonly TOKEN_KEY = 'auth.token';

  private static parseToken(token: string): any {
    try {
      const decoded = jwtDecode(token);
      return decoded;
    } catch (e) {
      console.error('Error parsing JWT token:', e);
      return null;
    }
  }

  public static async getUserInfo(): Promise<{id: string, username?: string} | null> {
    const token = await this.getToken();
    if (!token) return null;
    
    const payload = this.parseToken(token);
    if (!payload) return null;

    return {
      id: payload.sub,
      username: payload.username
    };
  }

  public static async storeToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(this.TOKEN_KEY, token);
  }

  public static async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(this.TOKEN_KEY);
  }

  public static async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  public static async removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync(this.TOKEN_KEY);
  }

  public static async signIn(email: string, password: string): Promise<void> {
    const response = await SpacedApi.login(email, password);
    const data = await response.json();

    if (!data.token) {
      throw new Error('Token was not provided by login endpoint.');
    }

    await this.storeToken(data.token);
  }

  public static async signUp(username: string, email: string, password: string): Promise<void> {
    const result = await SpacedApi.signUp({
      username,
      email,
      password
    });

    if (result.status !== 201) {
      throw new Error('An error occurred while signing up for Spaced.');
    }

    const body = await result.json() as { token: string };
    await this.storeToken(body.token);
  }

  public static async signOut(): Promise<void> {
    await this.removeToken();
  }

  public static async getAuthHeaders(): Promise<Record<string, string> | null> {
    const token = await this.getToken();
    if (!token) return null;
    
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  public static async withToken<T>(callback: (token: string) => Promise<T>): Promise<T> {
    const token = await this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    return await callback(token);
  }
}
