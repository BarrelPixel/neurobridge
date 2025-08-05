// Core domain types for NeuroBridge MVP

export interface Organization {
  id: string;
  name: string;
  type: 'clinic' | 'school' | 'private_practice' | 'agency';
  settings: OrganizationSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationSettings {
  timezone: string;
  currency: string;
  sessionDurationDefault: number; // minutes
  billingEnabled: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 
  | 'super_admin'      // Platform admin
  | 'org_admin'        // Organization administrator
  | 'supervisor'       // BCBA, supervisor
  | 'therapist'        // RBT, direct therapist
  | 'family'           // Parent/guardian
  | 'educator';        // Teacher, school staff

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  organizationId: string;
  primaryTherapistId?: string;
  supervisorId?: string;
  diagnosis: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  clientId: string;
  therapistId: string;
  organizationId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // minutes
  sessionType: SessionType;
  location: string;
  notes?: string;
  status: SessionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type SessionType = 
  | 'individual_therapy'
  | 'group_therapy'
  | 'assessment'
  | 'consultation'
  | 'supervision';

export type SessionStatus = 
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

// Data collection for ABA programs
export interface DataPoint {
  id: string;
  sessionId: string;
  clientId: string;
  programId: string;
  targetId: string;
  value: string | number | boolean;
  timestamp: Date;
  collectedBy: string; // userId
  notes?: string;
}

export interface Program {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  targets: Target[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Target {
  id: string;
  programId: string;
  name: string;
  description?: string;
  dataType: 'frequency' | 'duration' | 'percentage' | 'discrete_trial' | 'rating_scale';
  mastery_criteria?: string;
  isActive: boolean;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
