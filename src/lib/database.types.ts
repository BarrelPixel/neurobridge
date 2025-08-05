// Generated Supabase database types
// These would normally be auto-generated from your Supabase schema

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          type: 'clinic' | 'school' | 'private_practice' | 'agency';
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>;
      };
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          role: 'super_admin' | 'org_admin' | 'supervisor' | 'therapist' | 'family' | 'educator';
          organization_id: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      clients: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          date_of_birth: string;
          organization_id: string;
          primary_therapist_id: string | null;
          supervisor_id: string | null;
          diagnosis: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['clients']['Insert']>;
      };
      sessions: {
        Row: {
          id: string;
          client_id: string;
          therapist_id: string;
          organization_id: string;
          start_time: string;
          end_time: string | null;
          duration: number | null;
          session_type: 'individual_therapy' | 'group_therapy' | 'assessment' | 'consultation' | 'supervision';
          location: string;
          notes: string | null;
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sessions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['sessions']['Insert']>;
      };
      programs: {
        Row: {
          id: string;
          client_id: string;
          name: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['programs']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['programs']['Insert']>;
      };
      targets: {
        Row: {
          id: string;
          program_id: string;
          name: string;
          description: string | null;
          data_type: 'frequency' | 'duration' | 'percentage' | 'discrete_trial' | 'rating_scale';
          mastery_criteria: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['targets']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['targets']['Insert']>;
      };
      data_points: {
        Row: {
          id: string;
          session_id: string;
          client_id: string;
          program_id: string;
          target_id: string;
          value: string | number | boolean;
          timestamp: string;
          collected_by: string;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['data_points']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['data_points']['Insert']>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'super_admin' | 'org_admin' | 'supervisor' | 'therapist' | 'family' | 'educator';
      session_type: 'individual_therapy' | 'group_therapy' | 'assessment' | 'consultation' | 'supervision';
      session_status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
      data_type: 'frequency' | 'duration' | 'percentage' | 'discrete_trial' | 'rating_scale';
      organization_type: 'clinic' | 'school' | 'private_practice' | 'agency';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Helper types
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Specific table types for easier use
export type Organization = Tables<'organizations'>;
export type User = Tables<'users'>;
export type Client = Tables<'clients'>;
export type Session = Tables<'sessions'>;
export type Program = Tables<'programs'>;
export type Target = Tables<'targets'>;
export type DataPoint = Tables<'data_points'>;

// Real-time payload types
export interface RealtimePayload<T = any> {
  commit_timestamp: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  schema: string;
  table: string;
  columns: Array<{
    name: string;
    type: string;
  }>;
  record: T;
  old_record: T | null;
}

// Query builder types
export interface SupabaseQueryBuilder {
  eq: (column: string, value: any) => SupabaseQueryBuilder;
  neq: (column: string, value: any) => SupabaseQueryBuilder;
  in: (column: string, values: any[]) => SupabaseQueryBuilder;
  select: (columns?: string) => SupabaseQueryBuilder;
  insert: (data: any) => SupabaseQueryBuilder;
  update: (data: any) => SupabaseQueryBuilder;
  delete: () => SupabaseQueryBuilder;
}
