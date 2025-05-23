// Mock implementation of AuthService for testing
const AuthService = {
  TOKEN_KEY: 'auth.token',
  _token: null,

  storeToken: jest.fn(async (token) => {
    AuthService._token = token;
    return Promise.resolve();
  }),

  getToken: jest.fn(async () => {
    return Promise.resolve(AuthService._token);
  }),

  isAuthenticated: jest.fn(async () => {
    return Promise.resolve(!!AuthService._token);
  }),

  removeToken: jest.fn(async () => {
    AuthService._token = null;
    return Promise.resolve();
  }),

  signIn: jest.fn(async (email, password) => {
    // Mock successful login
    AuthService._token = 'mock-jwt-token';
    return Promise.resolve();
  }),

  signUp: jest.fn(async (username, email, password) => {
    // Mock successful signup
    AuthService._token = 'mock-jwt-token';
    return Promise.resolve();
  }),

  signOut: jest.fn(async () => {
    AuthService._token = null;
    return Promise.resolve();
  }),

  getAuthHeaders: jest.fn(async () => {
    if (!AuthService._token) return Promise.resolve(null);
    return Promise.resolve({
      'Authorization': `Bearer ${AuthService._token}`
    });
  }),

  withToken: jest.fn(async (callback) => {
    if (!AuthService._token) {
      return Promise.reject(new Error('No authentication token found'));
    }
    return Promise.resolve(callback(AuthService._token));
  }),

  // Helper for tests to set the token state
  __setToken: (token) => {
    AuthService._token = token;
  },

  // Helper for tests to reset all mocks
  __resetAllMocks: () => {
    AuthService._token = null;
    Object.values(AuthService).forEach(value => {
      if (typeof value === 'function' && value.mockClear) {
        value.mockClear();
      }
    });
  }
};

export default AuthService;