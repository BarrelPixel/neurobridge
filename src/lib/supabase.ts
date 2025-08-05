// Supabase configuration for NeuroBridge
// Multi-tenant setup with organization-scoped data access
import { createClient } from '@supabase/supabase-js';
import type { Database, RealtimePayload, SupabaseQueryBuilder } from './database.types';

// Environment variables for Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'neurobridge@1.0.0',
    },
  },
});

// Server-side client (for API routes)
export const createServerClient = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Multi-tenant helper functions
export const withOrganizationScope = (query: SupabaseQueryBuilder, organizationId: string) => {
  return query.eq('organization_id', organizationId);
};

export const withUserScope = (query: SupabaseQueryBuilder, userId: string, organizationId: string) => {
  return query.eq('organization_id', organizationId).eq('user_id', userId);
};

// Row Level Security (RLS) helper for multi-tenancy
export const createRLSPolicy = (tableName: string, policyName: string, policy: string) => {
  return `
    CREATE POLICY "${policyName}" ON "${tableName}"
    FOR ALL USING (${policy});
  `;
};

// Database initialization scripts
export const initializeDatabase = async () => {
  // This would be run once during setup to create the multi-tenant schema
  const initSQL = `
    -- Enable Row Level Security on all tables
    ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
    ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
    ALTER TABLE data_points ENABLE ROW LEVEL SECURITY;
    
    -- Organization-scoped RLS policies
    ${createRLSPolicy('users', 'users_organization_isolation', 'organization_id = auth.jwt() ->> \'organization_id\'')}
    ${createRLSPolicy('clients', 'clients_organization_isolation', 'organization_id = auth.jwt() ->> \'organization_id\'')}
    ${createRLSPolicy('sessions', 'sessions_organization_isolation', 'organization_id = auth.jwt() ->> \'organization_id\'')}
    
    -- Additional policies for role-based access
    ${createRLSPolicy('clients', 'therapists_can_view_assigned_clients', `
      organization_id = auth.jwt() ->> 'organization_id' 
      AND (
        primary_therapist_id = auth.uid() 
        OR supervisor_id = auth.uid()
        OR auth.jwt() ->> 'role' = 'org_admin'
      )
    `)}
  `;
  
  console.log('Database initialization SQL:', initSQL);
  // In production, you'd execute this SQL through Supabase dashboard or migration
  
  return { success: true };
};

// Real-time subscriptions with organization scoping
export const subscribeToOrganizationChanges = (
  table: string,
  organizationId: string,
  callback: (payload: RealtimePayload) => void
) => {
  return supabase
    .channel(`${table}-changes-${organizationId}`)
    .on(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'postgres_changes' as any,
      {
        event: '*',
        schema: 'public',
        table,
        filter: `organization_id=eq.${organizationId}`,
      },
      callback
    )
    .subscribe();
};

// Database error type
interface DatabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

// Utility for safe database operations
export const safeQuery = async <T>(
  queryFn: () => Promise<{ data: T | null; error: DatabaseError | null }>,
  context: { organizationId: string; userId?: string }
) => {
  try {
    const result = await queryFn();
    
    if (result.error) {
      console.error('Database query error:', result.error, context);
      throw new Error(result.error.message);
    }
    
    return result.data;
  } catch (error) {
    console.error('Safe query failed:', error, context);
    throw error;
  }
};
