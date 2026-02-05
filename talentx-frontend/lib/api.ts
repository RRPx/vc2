import axios from 'axios';
import { User, Job, Application, Invitation, JobMatch, AuthResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Debug logging
console.log('API_BASE_URL:', API_BASE_URL);
console.log('Environment:', process.env.NODE_ENV);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.method?.toUpperCase(), response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status, error.message);
    if (error.response?.status === 401) {
      // Token expired, clear and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Health check
export const healthCheck = async (): Promise<boolean> => {
  try {
    await api.get('/health');
    return true;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};

// Auth APIs
export const authAPI = {
  register: async (email: string, password: string, name: string, role: 'employer' | 'talent'): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/register', { email, password, name, role });
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },
  
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },
  
  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// Job APIs
export const jobsAPI = {
  getJobs: async (search?: string): Promise<Job[]> => {
    try {
      const params = search ? { search } : {};
      const response = await api.get('/jobs', { params });
      return response.data;
    } catch (error: any) {
      console.error('Get jobs error:', error);
      // Return mock data if API is down
      if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
        return getMockJobs();
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch jobs');
    }
  },
  
  getJob: async (id: string): Promise<Job> => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },
  
  createJob: async (jobData: {
    title: string;
    tech_stack: string[];
    application_deadline: string;
  }): Promise<Job> => {
    try {
      // Transform field names to match backend expectations
      const backendData = {
        title: jobData.title,
        techStack: jobData.tech_stack, // Backend expects 'techStack', not 'tech_stack'
        applicationDeadline: jobData.application_deadline // Backend expects 'applicationDeadline'
      };
      
      console.log('Creating job with data:', backendData);
      const response = await api.post('/jobs', backendData);
      console.log('Job created response:', response);
      // Handle the response format from backend
      if (response.data && response.data.job) {
        return response.data.job;
      } else if (response.data) {
        return response.data;
      }
      return response;
    } catch (error: any) {
      console.error('Create job error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to create job');
    }
  },
  
  getJobsForEmployer: async (): Promise<Job[]> => {
    const response = await api.get('/jobs/employer/my-jobs');
    return response.data;
  },
  
  getRecommendedJobs: async (): Promise<Job[]> => {
    const response = await api.get('/jobs/recommended');
    return response.data;
  },
};

// Application APIs
export const applicationsAPI = {
  apply: async (jobId: string, source: 'manual' | 'invitation' = 'manual'): Promise<Application> => {
    const response = await api.post(`/applications`, { job_id: jobId, source });
    return response.data;
  },
  
  getApplications: async (): Promise<Application[]> => {
    const response = await api.get('/applications');
    return response.data;
  },
  
  getJobApplications: async (jobId: string): Promise<Application[]> => {
    const response = await api.get(`/applications/job/${jobId}`);
    return response.data;
  },
};

// Invitation APIs
export const invitationsAPI = {
  invite: async (jobId: string, talentId: string): Promise<Invitation> => {
    const response = await api.post('/invitations', { job_id: jobId, talent_id: talentId });
    return response.data;
  },
  
  getInvitations: async (): Promise<Invitation[]> => {
    const response = await api.get('/invitations');
    return response.data;
  },
  
  respondToInvitation: async (invitationId: string, status: 'accepted' | 'declined'): Promise<Invitation> => {
    const response = await api.put(`/invitations/${invitationId}`, { status });
    return response.data;
  },
  
  getTopMatches: async (jobId: string): Promise<JobMatch[]> => {
    const response = await api.get(`/invitations/top-matches/${jobId}`);
    return response.data;
  },
};

// AI APIs
export const aiAPI = {
  generateJobDescription: async (title: string, techStack: string[]): Promise<string> => {
    const response = await api.post('/ai/generate-job-description', { title, tech_stack: techStack });
    return response.data.description;
  },
  
  calculateMatchScore: async (jobId: string, talentId: string): Promise<number> => {
    const response = await api.post('/ai/calculate-match', { job_id: jobId, talent_id: talentId });
    return response.data.score;
  },
};

// Mock data for fallback
const getMockJobs = (): Job[] => [
  {
    id: '1',
    title: 'Senior Data Scientist',
    company: 'TechCorp',
    tech_stack: ['Python', 'Machine Learning', 'TensorFlow'],
    description: 'Looking for an experienced Data Scientist...',
    application_deadline: '2024-12-31',
    employer_id: '1',
    created_at: '2024-01-01T00:00:00Z',
    total_applications: 5,
    status: 'active'
  },
  {
    id: '2',
    title: 'Frontend Developer',
    company: 'StartupXYZ',
    tech_stack: ['React', 'TypeScript', 'Tailwind'],
    description: 'Join our team as a Frontend Developer...',
    application_deadline: '2024-12-15',
    employer_id: '2',
    created_at: '2024-01-02T00:00:00Z',
    total_applications: 3,
    status: 'active'
  }
];