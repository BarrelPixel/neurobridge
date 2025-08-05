-- NeuroBridge Multi-Tenant Database Schema
-- Run this SQL in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'org_admin', 
  'supervisor',
  'therapist',
  'family',
  'educator'
);

CREATE TYPE organization_type AS ENUM (
  'clinic',
  'school', 
  'private_practice',
  'agency'
);

CREATE TYPE session_type AS ENUM (
  'individual_therapy',
  'group_therapy',
  'assessment',
  'consultation',
  'supervision'
);

CREATE TYPE session_status AS ENUM (
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
  'no_show'
);

CREATE TYPE data_type AS ENUM (
  'frequency',
  'duration',
  'percentage',
  'discrete_trial',
  'rating_scale'
);

-- Organizations table (top-level tenant isolation)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type organization_type NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role user_role NOT NULL DEFAULT 'therapist',
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_email_per_org UNIQUE (email, organization_id)
);

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  primary_therapist_id UUID REFERENCES users(id) ON DELETE SET NULL,
  supervisor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  diagnosis TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- minutes
  session_type session_type NOT NULL DEFAULT 'individual_therapy',
  location VARCHAR(255) NOT NULL,
  notes TEXT,
  status session_status NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Programs table
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Targets table
CREATE TABLE targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  data_type data_type NOT NULL DEFAULT 'frequency',
  mastery_criteria TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data points table
CREATE TABLE data_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES targets(id) ON DELETE CASCADE,
  value JSONB NOT NULL, -- flexible storage for different data types
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  collected_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_clients_organization_id ON clients(organization_id);
CREATE INDEX idx_clients_therapist_id ON clients(primary_therapist_id);
CREATE INDEX idx_sessions_organization_id ON sessions(organization_id);
CREATE INDEX idx_sessions_client_id ON sessions(client_id);
CREATE INDEX idx_sessions_therapist_id ON sessions(therapist_id);
CREATE INDEX idx_sessions_start_time ON sessions(start_time);
CREATE INDEX idx_data_points_session_id ON data_points(session_id);
CREATE INDEX idx_data_points_client_id ON data_points(client_id);
CREATE INDEX idx_data_points_timestamp ON data_points(timestamp);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_points ENABLE ROW LEVEL SECURITY;

-- RLS Policies for multi-tenant isolation

-- Organizations: Only super_admins can see all, others see their own
CREATE POLICY "Organizations isolation" ON organizations FOR ALL 
  USING (
    id = (auth.jwt() ->> 'organization_id')::UUID
    OR (auth.jwt() ->> 'role') = 'super_admin'
  );

-- Users: Organization-scoped access
CREATE POLICY "Users organization isolation" ON users FOR ALL 
  USING (organization_id = (auth.jwt() ->> 'organization_id')::UUID);

-- Clients: Organization-scoped, with role-based restrictions
CREATE POLICY "Clients organization isolation" ON clients FOR ALL 
  USING (
    organization_id = (auth.jwt() ->> 'organization_id')::UUID
    AND (
      -- Admins and supervisors can see all clients
      (auth.jwt() ->> 'role') IN ('org_admin', 'supervisor')
      -- Therapists can see assigned clients
      OR primary_therapist_id = auth.uid()
      OR supervisor_id = auth.uid()
      -- Families can see their own children (implement via client_families table)
      OR EXISTS (
        SELECT 1 FROM client_families cf 
        WHERE cf.client_id = clients.id AND cf.family_user_id = auth.uid()
      )
    )
  );

-- Sessions: Organization-scoped with participant access
CREATE POLICY "Sessions organization isolation" ON sessions FOR ALL 
  USING (
    organization_id = (auth.jwt() ->> 'organization_id')::UUID
    AND (
      (auth.jwt() ->> 'role') IN ('org_admin', 'supervisor')
      OR therapist_id = auth.uid()
      OR client_id IN (
        SELECT id FROM clients 
        WHERE primary_therapist_id = auth.uid() 
        OR supervisor_id = auth.uid()
      )
    )
  );

-- Programs: Access through client relationship
CREATE POLICY "Programs access through clients" ON programs FOR ALL 
  USING (
    client_id IN (
      SELECT id FROM clients 
      WHERE organization_id = (auth.jwt() ->> 'organization_id')::UUID
    )
  );

-- Targets: Access through programs
CREATE POLICY "Targets access through programs" ON targets FOR ALL 
  USING (
    program_id IN (
      SELECT p.id FROM programs p
      JOIN clients c ON p.client_id = c.id
      WHERE c.organization_id = (auth.jwt() ->> 'organization_id')::UUID
    )
  );

-- Data points: Access through session relationship
CREATE POLICY "Data points access through sessions" ON data_points FOR ALL 
  USING (
    session_id IN (
      SELECT id FROM sessions 
      WHERE organization_id = (auth.jwt() ->> 'organization_id')::UUID
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_targets_updated_at BEFORE UPDATE ON targets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Optional: Client-Family relationship table for family access control
CREATE TABLE client_families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  family_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  relationship VARCHAR(50) NOT NULL, -- 'parent', 'guardian', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_client_family UNIQUE (client_id, family_user_id)
);

ALTER TABLE client_families ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Client families organization isolation" ON client_families FOR ALL 
  USING (
    client_id IN (
      SELECT id FROM clients 
      WHERE organization_id = (auth.jwt() ->> 'organization_id')::UUID
    )
  );

-- Sample data for testing (optional)
-- Uncomment the following lines to insert sample data

/*
-- Insert sample organization
INSERT INTO organizations (id, name, type) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Demo Clinic', 'clinic');

-- Note: Users are automatically created when they sign up through Supabase Auth
-- You'll need to update the users table after authentication
*/
