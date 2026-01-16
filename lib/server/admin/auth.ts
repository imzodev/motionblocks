/**
 * Admin Authentication Service
 * Single Responsibility: Handles admin credential validation
 */

export interface AdminCredentials {
  username: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}

/**
 * Interface for credential validation (Dependency Inversion)
 */
export interface CredentialValidator {
  validate(credentials: AdminCredentials): AuthResult;
}

/**
 * Environment-based credential validator
 * Open/Closed: Can be extended with different validators without modification
 */
export class EnvCredentialValidator implements CredentialValidator {
  private readonly expectedUsername: string;
  private readonly expectedPassword: string;

  constructor() {
    this.expectedUsername = process.env.ADMIN_USERNAME || "";
    this.expectedPassword = process.env.ADMIN_PASSWORD || "";
  }

  validate(credentials: AdminCredentials): AuthResult {
    if (!this.expectedUsername || !this.expectedPassword) {
      return { success: false, error: "Admin credentials not configured" };
    }

    if (!credentials.username || !credentials.password) {
      return { success: false, error: "Username and password required" };
    }

    const isValid =
      credentials.username === this.expectedUsername &&
      credentials.password === this.expectedPassword;

    if (!isValid) {
      return { success: false, error: "Invalid credentials" };
    }

    return { success: true };
  }
}

/**
 * Admin Auth Service
 * Single Responsibility: Orchestrates authentication flow
 */
export class AdminAuthService {
  constructor(private readonly validator: CredentialValidator) {}

  authenticate(credentials: AdminCredentials): AuthResult {
    return this.validator.validate(credentials);
  }
}

/**
 * Factory function for default admin auth service
 */
export function createAdminAuthService(): AdminAuthService {
  return new AdminAuthService(new EnvCredentialValidator());
}

/**
 * Generate a simple session token (for cookie-based auth)
 */
export function generateSessionToken(): string {
  return `admin_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Validate session token format
 */
export function isValidSessionToken(token: string): boolean {
  return typeof token === "string" && token.startsWith("admin_") && token.length > 20;
}
