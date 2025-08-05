// Authentication and authorization service for NeuroBridge
// Designed for multi-tenant, role-based access control
import type { User, UserRole, Organization } from '@/types';

export interface AuthSession {
  user: User;
  organization: Organization;
  permissions: string[];
  expiresAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
  organizationId?: string; // For multi-org users
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string;
  inviteToken?: string;
}

// Permission constants for role-based access control
export const PERMISSIONS = {
  // Client management
  'clients.view': ['org_admin', 'supervisor', 'therapist', 'family'],
  'clients.create': ['org_admin', 'supervisor'],
  'clients.edit': ['org_admin', 'supervisor'],
  'clients.delete': ['org_admin', 'supervisor'],
  
  // Session management
  'sessions.view': ['org_admin', 'supervisor', 'therapist', 'family'],
  'sessions.create': ['org_admin', 'supervisor', 'therapist'],
  'sessions.edit': ['org_admin', 'supervisor', 'therapist'],
  'sessions.delete': ['org_admin', 'supervisor'],
  
  // Data collection
  'data.view': ['org_admin', 'supervisor', 'therapist', 'family'],
  'data.collect': ['org_admin', 'supervisor', 'therapist'],
  'data.edit': ['org_admin', 'supervisor', 'therapist'],
  
  // Reports and analytics
  'reports.view': ['org_admin', 'supervisor', 'therapist'],
  'reports.advanced': ['org_admin', 'supervisor'],
  
  // User management
  'users.view': ['org_admin', 'supervisor'],
  'users.create': ['org_admin'],
  'users.edit': ['org_admin'],
  'users.delete': ['org_admin'],
  
  // Organization settings
  'org.view': ['org_admin'],
  'org.edit': ['org_admin'],
} as const;

export class AuthService {
  private static instance: AuthService;
  
  private constructor() {}
  
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }
  
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    // MVP implementation - replace with actual auth provider
    console.log('Login attempt:', credentials.email);
    
    // TODO: Implement actual authentication
    const mockUser: User = {
      id: '1',
      email: credentials.email,
      firstName: 'Demo',
      lastName: 'User',
      role: 'therapist',
      organizationId: credentials.organizationId || 'org-1',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const mockOrg: Organization = {
      id: 'org-1',
      name: 'Demo Clinic',
      type: 'clinic',
      settings: {
        timezone: 'America/New_York',
        currency: 'USD',
        sessionDurationDefault: 60,
        billingEnabled: false,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    return {
      user: mockUser,
      organization: mockOrg,
      permissions: this.getUserPermissions(mockUser.role),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
  }
  
  async register(data: RegisterData): Promise<AuthSession> {
    console.log('Registration attempt:', data.email);
    // TODO: Implement registration with invite validation
    throw new Error('Registration not implemented');
  }
  
  async logout(sessionId: string): Promise<void> {
    console.log('Logout:', sessionId);
    // TODO: Invalidate session
  }
  
  async getCurrentSession(): Promise<AuthSession | null> {
    // TODO: Get session from secure storage/cookies
    return null;
  }
  
  hasPermission(session: AuthSession, permission: string): boolean {
    return session.permissions.includes(permission);
  }
  
  private getUserPermissions(role: UserRole): string[] {
    const permissions: string[] = [];
    
    for (const [permission, allowedRoles] of Object.entries(PERMISSIONS)) {
      if ((allowedRoles as readonly UserRole[]).includes(role)) {
        permissions.push(permission);
      }
    }
    
    return permissions;
  }
  
  // Multi-tenant access control
  canAccessOrganization(userId: string, organizationId: string): boolean {
    // TODO: Check if user belongs to organization
    console.log(`Access check: user ${userId} to org ${organizationId}`);
    return true;
  }
  
  // Client-specific access control (important for family users)
  canAccessClient(userId: string, clientId: string, organizationId: string): boolean {
    // TODO: Check therapist assignment, family relationships, etc.
    console.log(`Client access check: user ${userId} to client ${clientId} in org ${organizationId}`);
    return true;
  }
}

// Hook for React components
export function useAuth() {
  // TODO: Implement React hook with context
  return {
    session: null as AuthSession | null,
    login: async (credentials: LoginCredentials) => {
      return AuthService.getInstance().login(credentials);
    },
    logout: async () => {
      // Implementation
    },
    loading: false,
  };
}

// Middleware function for API routes
export function requireAuth(permission?: string) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return async (req: Request) => {
    // TODO: Implement middleware for API route protection
    console.log('Auth middleware check for permission:', permission);
    
    // Extract and validate session
    // Check permissions
    // Return user context
    
    return {
      user: null as User | null,
      organization: null as Organization | null,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      hasPermission: (perm: string) => false,
    };
  };
}
