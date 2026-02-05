# TalentX Frontend

A modern, AI-powered job marketplace frontend built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

### 🎯 Core Functionality
- **Role-based authentication** (Employer/Talent)
- **Public job discovery** with search and filtering
- **AI-powered job matching** for talents
- **Application tracking** for both roles
- **Invitation system** for employers to recruit talent

### 🎨 Modern UI/UX
- **Responsive design** with Tailwind CSS
- **Smooth animations** with Framer Motion
- **Beautiful components** with Tailwind styling
- **Mobile-first** responsive layout
- **Dark mode ready** (if needed)

### 🚀 Tech Stack
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **Axios** for API calls

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- TalentX backend running on `http://localhost:5000`

### Installation

1. Clone the repository and navigate to the frontend:
```bash
cd talentx-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
talentx-frontend/
├── app/                    # Next.js app router pages
│   ├── employer/           # Employer-specific pages
│   ├── talent/            # Talent-specific pages
│   ├── jobs/              # Public job pages
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   └── Navbar.tsx         # Navigation component
├── contexts/             # React contexts
│   └── AuthContext.tsx    # Authentication context
├── lib/                   # Utilities and API
│   └── api.ts            # API client configuration
├── types/                 # TypeScript definitions
│   └── index.ts          # Core types
└── public/               # Static assets
```

## Key Features Explained

### 🔐 Authentication Flow
- Users can register as either **Employer** or **Talent**
- Role-based routing redirects users to appropriate dashboards
- JWT token-based authentication with auto-refresh
- Protected routes with role enforcement

### 🏢 Employer Features
- **Dashboard** with job and application statistics
- **Job Management** with AI-powered description generation
- **Applicant Tracking** with status management
- **AI Matching** to find top talent candidates
- **Invitation System** to recruit specific talents

### 👨‍💻 Talent Features
- **Personalized Job Feed** with AI recommendations
- **Application Tracking** with real-time status updates
- **Invitation Management** to respond to employer invitations
- **Skill-based Matching** algorithm
- **Application History** with source tracking

### 🤖 AI Integration
- **Job Description Generation** from title + tech stack
- **Talent-Job Matching** with relevance scoring
- **Personalized Recommendations** for talents
- **Smart Filtering** based on skills and preferences

## API Integration

The frontend is fully integrated with the TalentX backend REST API:

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Job Endpoints
- `GET /api/jobs` - Get all jobs (public)
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create job (employer)
- `GET /api/jobs/employer/my-jobs` - Get employer's jobs
- `GET /api/jobs/recommended` - Get recommended jobs (talent)

### Application Endpoints
- `POST /api/applications` - Submit application
- `GET /api/applications` - Get user applications
- `GET /api/applications/job/:jobId` - Get job applicants

### Invitation Endpoints
- `POST /api/invitations` - Send invitation
- `GET /api/invitations` - Get user invitations
- `PUT /api/invitations/:id` - Respond to invitation
- `GET /api/invitations/top-matches/:jobId` - Get top talent matches

### AI Endpoints
- `POST /api/ai/generate-job-description` - Generate JD
- `POST /api/ai/calculate-match` - Calculate match score

## Responsive Design

The application is fully responsive with:
- **Mobile-first** approach
- **Tablet and desktop** optimizations
- **Touch-friendly** interactions
- **Flexible grid layouts**
- **Adaptive typography**

## Animations

Smooth animations throughout the app:
- **Page transitions** with fade and slide effects
- **Card hover states** with elevation changes
- **Loading spinners** for async operations
- **Micro-interactions** on buttons and forms
- **Stagger animations** for lists

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Quality
- **TypeScript** for type safety
- **ESLint** for code quality
- **Tailwind** for consistent styling
- **Component-based** architecture
- **Custom hooks** for reusable logic

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- Build the project: `npm run build`
- Deploy the `.next` folder to your hosting platform
- Ensure environment variables are properly configured

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.