// Simplified database layer with Supabase integration
// Multi-tenant, type-safe data access for NeuroBridge

import { supabase } from './supabase';
import type { Tables, TablesInsert, TablesUpdate } from './database.types';

// Type-safe repository for clients
export class ClientRepository {
  async findByOrganization(organizationId: string): Promise<Tables<'clients'>[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true);
    
    if (error) throw new Error(error.message);
    return data || [];
  }
  
  async findById(id: string, organizationId: string): Promise<Tables<'clients'> | null> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(error.message);
    }
    return data;
  }
  
  async create(clientData: TablesInsert<'clients'>): Promise<Tables<'clients'>> {
    const { data, error } = await supabase
      .from('clients')
      .insert(clientData)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }
  
  async update(
    id: string, 
    organizationId: string, 
    updates: TablesUpdate<'clients'>
  ): Promise<Tables<'clients'>> {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }
  
  async findByTherapist(therapistId: string, organizationId: string): Promise<Tables<'clients'>[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('primary_therapist_id', therapistId)
      .eq('is_active', true);
    
    if (error) throw new Error(error.message);
    return data || [];
  }
}

// Type-safe repository for sessions
export class SessionRepository {
  async findByOrganization(organizationId: string): Promise<Tables<'sessions'>[]> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('organization_id', organizationId)
      .order('start_time', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data || [];
  }
  
  async findById(id: string, organizationId: string): Promise<Tables<'sessions'> | null> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(error.message);
    }
    return data;
  }
  
  async create(sessionData: TablesInsert<'sessions'>): Promise<Tables<'sessions'>> {
    const { data, error } = await supabase
      .from('sessions')
      .insert(sessionData)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }
  
  async findByClient(clientId: string, organizationId: string): Promise<Tables<'sessions'>[]> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('client_id', clientId)
      .order('start_time', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data || [];
  }
  
  async findByDateRange(
    startDate: Date,
    endDate: Date,
    organizationId: string,
    filters?: { clientId?: string; therapistId?: string }
  ): Promise<Tables<'sessions'>[]> {
    let query = supabase
      .from('sessions')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('start_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString());
    
    if (filters?.clientId) {
      query = query.eq('client_id', filters.clientId);
    }
    
    if (filters?.therapistId) {
      query = query.eq('therapist_id', filters.therapistId);
    }
    
    const { data, error } = await query.order('start_time', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data || [];
  }
}

// Type-safe repository for users
export class UserRepository {
  async findByOrganization(organizationId: string): Promise<Tables<'users'>[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true);
    
    if (error) throw new Error(error.message);
    return data || [];
  }
  
  async findById(id: string, organizationId: string): Promise<Tables<'users'> | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(error.message);
    }
    return data;
  }
  
  async findByRole(role: string, organizationId: string): Promise<Tables<'users'>[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('role', role)
      .eq('is_active', true);
    
    if (error) throw new Error(error.message);
    return data || [];
  }
}

// Organization repository
export class OrganizationRepository {
  async findById(id: string): Promise<Tables<'organizations'> | null> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(error.message);
    }
    return data;
  }
  
  async create(orgData: TablesInsert<'organizations'>): Promise<Tables<'organizations'>> {
    const { data, error } = await supabase
      .from('organizations')
      .insert(orgData)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }
}

// Database service singleton
export class DatabaseService {
  private static instance: DatabaseService;
  
  public readonly clients = new ClientRepository();
  public readonly sessions = new SessionRepository();
  public readonly users = new UserRepository();
  public readonly organizations = new OrganizationRepository();
  
  private constructor() {}
  
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }
  
  // Audit logging for healthcare compliance
  async logActivity(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    organizationId: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    // Would implement audit_logs table
    console.log('Audit log:', {
      userId,
      action,
      resource,
      resourceId,
      organizationId,
      metadata,
      timestamp: new Date().toISOString(),
    });
  }
}

// Export singleton instance
export const db = DatabaseService.getInstance();
