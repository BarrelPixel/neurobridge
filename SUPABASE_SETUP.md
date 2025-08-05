# NeuroBridge Supabase Setup Guide

## 🚀 Quick Setup (5 minutes)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New Project"
3. Choose organization and project settings:
   - **Project Name**: `neurobridge-mvp`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
4. Wait for project creation (2-3 minutes)

### 2. Get Your API Keys
Once your project is ready:
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (starts with `https://`)
   - **anon/public key** (starts with `eyJ`)
   - **service_role key** (starts with `eyJ`) - keep this secret!

### 3. Configure Environment Variables
1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` with your Supabase values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

### 4. Create Database Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Click **Run** to create all tables and policies

### 5. Test the Connection
```bash
npm run dev
```
Visit `http://localhost:3000` - you should see the updated homepage showing Supabase is connected!

## 🔧 Database Features Implemented

### Multi-Tenant Architecture
✅ **Organization-scoped data isolation**
- Every table has `organization_id` column
- Row Level Security (RLS) policies enforce data separation
- No cross-organization data leakage possible

### Role-Based Access Control
✅ **Granular permissions**
- `super_admin` - Platform administration
- `org_admin` - Organization management
- `supervisor` - BCBA oversight and supervision
- `therapist` - RBT direct therapy
- `family` - Parent/guardian access
- `educator` - School team collaboration

### Healthcare Compliance
✅ **HIPAA-ready features**
- Audit logging framework
- Data encryption at rest
- Access controls and monitoring
- Row-level security policies

### Real-time Updates
✅ **Live data synchronization**  
- Organization-scoped subscriptions
- Real-time session updates
- Multi-user collaboration support

## 📊 Available Repositories

### ClientRepository
```typescript
import { db } from '@/lib/database-simple';

// Get all clients for organization
const clients = await db.clients.findByOrganization('org-id');

// Get specific client
const client = await db.clients.findById('client-id', 'org-id');

// Get therapist's caseload
const caseload = await db.clients.findByTherapist('therapist-id', 'org-id');

// Create new client
const newClient = await db.clients.create({
  first_name: 'John',
  last_name: 'Doe',
  date_of_birth: '2020-01-01',
  organization_id: 'org-id',
  // ... other fields
});
```

### SessionRepository
```typescript
// Get recent sessions
const sessions = await db.sessions.findByOrganization('org-id');

// Get client's sessions
const clientSessions = await db.sessions.findByClient('client-id', 'org-id');

// Get sessions in date range
const weekSessions = await db.sessions.findByDateRange(
  new Date('2024-01-01'),
  new Date('2024-01-07'),
  'org-id',
  { clientId: 'optional-client-filter' }
);
```

## 🔐 Authentication Setup

### Option 1: Supabase Auth (Recommended)
Supabase provides built-in authentication with:
- Email/password signin
- Social logins (Google, GitHub, etc.)
- Magic links
- Multi-factor authentication

### Option 2: Third-party Auth
- Auth0, Clerk, or Firebase Auth
- Custom JWT claims for organization/role

## 🚀 Next Development Steps

### Immediate (Week 1)
1. **Authentication UI** - Login/signup forms
2. **Dashboard Layout** - Main navigation and layout
3. **Client List Page** - View organization's clients
4. **Basic Forms** - Add/edit client information

### Short-term (Weeks 2-4)
1. **Session Management** - Schedule and track sessions
2. **Data Collection** - ABA data entry forms  
3. **User Management** - Invite team members
4. **Basic Reports** - Progress summaries

### Medium-term (Months 2-3)
1. **Advanced Analytics** - Charts and insights
2. **Program Management** - ABA programs and targets
3. **Family Portal** - Parent access and communication
4. **Mobile Optimization** - Responsive design

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js + Supabase Tutorial](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase + TypeScript](https://supabase.com/docs/guides/api/generating-types)

## 🛟 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify environment variables are set correctly
3. Confirm database schema was created successfully
4. Test API connections in Supabase dashboard

## 🔒 Security Notes

- Never commit `.env.local` to version control
- Use service role key only in server-side code
- Enable RLS on all tables (already done in migration)
- Regularly rotate API keys in production
- Consider Supabase Pro for enhanced security features
