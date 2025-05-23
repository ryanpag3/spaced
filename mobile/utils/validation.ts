/**
 * Validates an email address using basic regex pattern
 */
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validates password complexity requirements
 */
export function validatePassword(password: string): { valid: boolean; message: string } {
  if (!password) {
    return { valid: false, message: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }
  
  return { valid: true, message: '' };
}

/**
 * Validates that passwords match
 */
export function validatePasswordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}

/**
 * Validates username requirements
 */
export function validateUsername(username: string): { valid: boolean; message: string } {
  if (!username) {
    return { valid: false, message: 'Username is required' };
  }
  
  if (username.length < 3) {
    return { valid: false, message: 'Username must be at least 3 characters long' };
  }
  
  return { valid: true, message: '' };
}
