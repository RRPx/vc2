# TalentX - AI-Powered Job Marketplace

A modern job marketplace that connects AI & Data Talents with Employers using AI-powered matching.

## Features

### For Employers
- Post jobs with AI-generated descriptions
- View applicant tracking
- Invite top-matched talents
- Manage job postings

### For Talents
- Discover AI-matched job opportunities
- Apply to jobs manually or via invitations
- Track application history
- Receive and manage invitations

### Public Features
- Browse available jobs
- Search by job title/role
- View job details
- Real-time application counters

## Architecture

- **Backend**: Node.js + Express + Supabase
- **Frontend**: Next.js + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI API for job description generation and matching

## Setup Instructions

### 1. Backend Setup

1. Navigate to backend directory:
   ```bash
   cd talentx-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your credentials:
   ```
   PORT=3001
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_KEY=your-supabase-service-key
   OPENAI_API_KEY=your-openai-api-key
   ```

4. Set up Supabase database:
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL in `schema.sql` in your Supabase SQL editor
   - Get your project URL and service key from settings

5. Seed the database with sample data:
   ```bash
   node seed.js
   ```

6. Start the backend server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd talentx-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```
   Save this as `.env.local`

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Sample Login Credentials

After seeding the database, you can use these credentials:

### Employers:
- **Email**: employer1@techcorp.com, **Password**: password123
- **Email**: employer2@innovateco.com, **Password**: password123
- **Email**: employer3@datapro.com, **Password**: password123

### Talents:
- **Email**: talent1@dev.com, **Password**: password123
- **Email**: talent2@dev.com, **Password**: password123
- **Email**: talent3@dev.com, **Password**: password123

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Jobs
- `GET /api/jobs` - Get all jobs (public)
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create job (employer only)
- `GET /api/jobs/employer/my-jobs` - Get employer jobs
- `GET /api/jobs/talent/matched` - Get matched jobs for talent

### Applications
- `POST /api/applications` - Apply to job
- `GET /api/applications/job/:jobId` - Get job applicants (employer only)
- `GET /api/applications/my-applications` - Get talent applications

### Invitations
- `POST /api/invitations` - Create invitation (employer only)
- `GET /api/invitations/my-invitations` - Get talent invitations
- `PUT /api/invitations/:id/respond` - Respond to invitation (talent only)
- `GET /api/invitations/matched-talents/:jobId` - Get matched talents for job

## Project Structure

### Backend (`talentx-backend/`)
```
├── config/
│   └── database.js          # Supabase configuration
├── middleware/
│   └── auth.js              # Authentication middleware
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── jobs.js              # Job management routes
│   ├── applications.js      # Application routes
│   └── invitations.js       # Invitation routes
├── services/
│   └── aiService.js         # AI integration (OpenAI)
├── schema.sql               # Database schema
├── seed.js                  # Sample data generator
└── index.js                 # Express server entry point
```

### Frontend (`talentx-frontend/`)
```
├── app/
│   ├── jobs/[id]/           # Job detail page
│   ├── apply/[id]/          # Apply to job page
│   ├── employer/            # Employer dashboard
│   ├── talent/              # Talent dashboard
│   ├── login/               # Login page
│   ├── register/            # Registration page
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page (job listings)
├── components/
│   ├── Navbar.js            # Navigation component
│   └── AuthGuard.js         # Route protection component
├── context/
│   └── AuthContext.js       # Authentication state management
└── lib/
    └── api.js               # API utility functions
```

## Testing the Application

1. Start both servers (backend on port 3001, frontend on port 3000)
2. Open http://localhost:3000 in your browser
3. Browse jobs as a guest
4. Register as an employer or talent
5. Test the full workflow:
   - **Employer**: Post jobs → View applicants → Invite talents
   - **Talent**: View matched jobs → Apply to jobs → Respond to invitations

## AI Features

### Job Description Generation
- Uses OpenAI API to generate professional job descriptions based on title and tech stack
- Falls back to template if API is unavailable

### Talent-Job Matching
- Calculates compatibility scores between talent profiles and job requirements
- Considers skill alignment, experience level, and bio relevance
- Falls back to algorithmic scoring if AI is unavailable

## Key Features Demonstrated

✅ **Authentication & Authorization**
- Role-based access control (Employer vs Talent)
- JWT token-based authentication
- Protected routes and API endpoints

✅ **Real-time Data**
- Application counters that update instantly
- Invitation status tracking
- Live matching scores

✅ **AI Integration**
- Job description generation
- Smart talent-job matching
- Graceful fallbacks when AI is unavailable

✅ **Full CRUD Operations**
- Complete job lifecycle management
- Application tracking
- Invitation management

✅ **Modern UI/UX**
- Responsive design with Tailwind CSS
- Clean, professional interface
- Smooth user workflows

✅ **Database Design**
- Proper relational schema
- Indexes for performance
- Triggers for timestamp updates

This MVP demonstrates a complete, working full-stack application with modern development practices, AI integration, and real-time features.
