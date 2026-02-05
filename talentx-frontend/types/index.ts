export interface User {
  id: string;
  email: string;
  name: string;
  role: 'employer' | 'talent';
  created_at: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  tech_stack: string[];
  description: string;
  application_deadline: string;
  employer_id: string;
  created_at: string;
  total_applications: number;
  status: 'active' | 'closed';
}

export interface Application {
  id: string;
  job_id: string;
  talent_id: string;
  source: 'manual' | 'invitation';
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  created_at: string;
  job?: Job;
  talent?: User;
}

export interface Invitation {
  id: string;
  job_id: string;
  employer_id: string;
  talent_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  job?: Job;
  talent?: User;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface JobMatch {
  talent: User;
  match_score: number;
}