# NeuroBridge

An AI-powered ABA and multidisciplinary care platform for autism and IDD education, built with enterprise-scale architecture and modern AI capabilities for next-generation therapy management.

## 🎯 MVP Strategy (Built for Scale)

This project implements a **minimum viable product** with **scalable architecture foundations**:

### Core MVP Features
- **Multi-tenant architecture** - Organization-scoped data isolation
- **Role-based access control** - Granular permissions (BCBA, RBT, Family, Admin)
- **Client/Student management** - Basic profiles and assignments  
- **Session tracking** - Data collection and progress monitoring
- **Basic reporting** - Progress summaries and analytics

### Scalable Architecture Components

#### 🏗️ **Database Layer** (`src/lib/database.ts`)
- Repository pattern with organization-scoped queries
- Multi-tenant data isolation (every query includes `organizationId`)
- Audit logging for healthcare compliance
- Type-safe database operations

#### 🔐 **Authentication & Authorization** (`src/lib/auth.ts`)
- Role-based permission system with 20+ granular permissions
- Multi-organization user support
- Session management with expiration
- Client-specific access control (important for family users)

#### 📊 **Type System** (`src/types/index.ts`)
- Comprehensive domain models (User, Client, Session, Program, etc.)
- Healthcare-specific data structures
- API response types with pagination
- Compile-time safety for sensitive healthcare data

## 🚀 Getting Started

This is a [Next.js](https://nextjs.org) project with TypeScript, Tailwind CSS, and enterprise-ready architecture.

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Supabase account (for database)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/neurobridge.git
cd neurobridge
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```
Then edit `.env.local` with your Supabase credentials (see [Supabase Setup Guide](./SUPABASE_SETUP.md))

4. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router
├── components/          # Reusable UI components
├── lib/                 # Core business logic
│   ├── database.ts      # Multi-tenant data layer
│   └── auth.ts          # Authentication & RBAC
├── types/               # TypeScript definitions
└── hooks/               # Custom React hooks
```

## 🔧 Key Architecture Decisions

### Why Multi-Tenant from Day 1?
- **Scalability**: Single codebase serves unlimited organizations
- **Cost Efficiency**: Shared infrastructure, isolated data
- **Compliance**: Organization-level data boundaries for HIPAA
- **Enterprise Ready**: No architectural rewrites needed for growth

### Why Repository Pattern?
- **Testability**: Easy to mock data layer
- **Consistency**: Standardized data access patterns
- **Security**: Organization scoping built into every query
- **Maintainability**: Clear separation of concerns

### Why Role-Based Access Control?
- **Healthcare Compliance**: Granular data access controls
- **Flexibility**: Easy to add new roles and permissions
- **Security**: Principle of least privilege
- **Multi-disciplinary**: Supports BCBAs, RBTs, families, educators

## 🏥 Healthcare-Specific Features

- **HIPAA Compliance Ready**: Audit logging, access controls, data encryption
- **ABA Domain Models**: Programs, targets, data collection, mastery criteria
- **Multi-disciplinary Support**: BCBAs, RBTs, families, school teams
- **Progress Tracking**: Real-time data collection with analytics

## 🎯 Next Development Steps

### 🚀 Immediate Setup (Start Here!)
1. **[Connect Supabase](./SUPABASE_SETUP.md)** - 5-minute database setup
2. **Authentication UI** - Login/signup forms
3. **Dashboard Layout** - Main navigation structure
4. **Client Management** - Basic CRUD operations

### Short-term Development (Weeks 2-4)
1. **Session Management** - Schedule and track therapy sessions
2. **Data Collection UI** - ABA-specific data entry forms
3. **User Management** - Team member invitations and roles
4. **Basic Reporting** - Progress summaries and charts

### Medium-term Features (Months 2-3)
1. **Advanced Analytics** - AI-powered insights and recommendations
2. **Program Management** - Detailed ABA programs and target tracking
3. **Family Portal** - Parent access and communication tools
4. **Mobile Optimization** - Responsive design for tablets/phones

## 🔗 Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
