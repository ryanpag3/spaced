import * as SecureStore from 'expo-secure-store';
import SpacedApi from '@/api/spaced';

/**
 * A singleton service for handling authentication token operations
 */
export default class AuthService {
  private static readonly TOKEN_KEY = 'auth.token';

  /**
   * Store the authentication token securely
   * @param token Authentication token to store
   * @returns Promise resolving when token has been stored
   */
  public static async storeToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(this.TOKEN_KEY, token);
  }

  /**
   * Retrieve the authentication token
   * @returns Promise resolving to the token string or null if not found
   */
  public static async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(this.TOKEN_KEY);
  }

  /**
   * Check if a user is authenticated
   * @returns Promise resolving to a boolean indicating authentication status
   */
  public static async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  /**
   * Delete the authentication token
   * @returns Promise resolving when token has been deleted
   */
  public static async removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync(this.TOKEN_KEY);
  }

  /**
   * Sign in user and store the token
   * @param email User's email
   * @param password User's password
   * @returns Promise resolving when login is successful
   * @throws Error if login fails
   */
  public static async signIn(email: string, password: string): Promise<void> {
    const response = await SpacedApi.login(email, password);
    const data = await response.json();

    if (!data.token) {
      throw new Error('Token was not provided by login endpoint.');
    }

    await this.storeToken(data.token);
  }

  /**
   * Create a new user account and store the token
   * @param username Username for the new account
   * @param email Email for the new account
   * @param password Password for the new account
   * @returns Promise resolving when signup is successful
   * @throws Error if signup fails
   */
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

  /**
   * Sign out the current user
   * @returns Promise resolving when sign out is complete
   */
  public static async signOut(): Promise<void> {
    await this.removeToken();
  }

  /**
   * Get an authorization header with the current token
   * @returns Promise resolving to the headers object or null if no token found
   */
  public static async getAuthHeaders(): Promise<Record<string, string> | null> {
    const token = await this.getToken();
    if (!token) return null;
    
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Execute a function with an auth token, handling token retrieval
   * @param callback Function that requires an auth token
   * @returns Promise resolving to the result of the callback
   * @throws Error if no auth token is available
   */
  public static async withToken<T>(callback: (token: string) => Promise<T>): Promise<T> {
    const token = await this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    return await callback(token);
  }
}
