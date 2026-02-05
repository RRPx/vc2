'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Job, Application } from '@/types';
import { jobsAPI, applicationsAPI } from '@/lib/api';
import { Briefcase, Users, Calendar, TrendingUp, Plus, Eye } from 'lucide-react';

export default function EmployerDashboard() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0
  });
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role !== 'employer') {
      router.push('/talent/dashboard');
      return;
    }
    fetchDashboardData();
  }, [user, router]);

  const fetchDashboardData = async () => {
    try {
      // Fetch jobs
      const jobs = await jobsAPI.getJobsForEmployer();
      setRecentJobs(jobs.slice(0, 3));
      
      // Calculate stats
      const activeJobs = jobs.filter(job => job.status === 'active' && new Date(job.application_deadline) >= new Date());
      
      // Fetch applications
      const applications = await applicationsAPI.getApplications();
      const pendingApplications = applications.filter(app => app.status === 'pending');
      setRecentApplications(applications.slice(0, 5));
      
      setStats({
        totalJobs: jobs.length,
        activeJobs: activeJobs.length,
        totalApplications: applications.length,
        pendingApplications: pendingApplications.length
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's an overview of your hiring activity
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card animate-scale-in">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
                <p className="text-sm text-gray-600">Total Jobs</p>
              </div>
            </div>
          </div>

          <div className="card animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.activeJobs}</p>
                <p className="text-sm text-gray-600">Active Jobs</p>
              </div>
            </div>
          </div>

          <div className="card animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
                <p className="text-sm text-gray-600">Total Applications</p>
              </div>
            </div>
          </div>

          <div className="card animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
                <p className="text-sm text-gray-600">Pending Review</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Applications */}
          <div className="card animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Applications</h2>
              <button
                onClick={() => router.push('/employer/applications')}
                className="btn btn-ghost"
              >
                View All
              </button>
            </div>
            
            {recentApplications.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No applications yet</p>
                <p className="text-sm text-gray-500">Post your first job to start receiving applications</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentApplications.map((application) => (
                  <div key={application.id} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {application.talent?.name || 'Unknown Talent'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Applied to {application.job?.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(application.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          application.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : application.status === 'reviewed'
                            ? 'bg-blue-100 text-blue-800'
                            : application.status === 'accepted'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {application.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Jobs */}
          <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Jobs</h2>
              <button
                onClick={() => router.push('/employer/jobs')}
                className="btn btn-ghost"
              >
                View All
              </button>
            </div>
            
            {recentJobs.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No jobs posted yet</p>
                <button
                  onClick={() => router.push('/employer/jobs/create')}
                  className="btn btn-primary mt-4"
                >
                  Post Your First Job
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <div key={job.id} className="border-l-4 border-green-500 pl-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{job.title}</p>
                        <p className="text-sm text-gray-600">
                          {job.total_applications} applications
                        </p>
                        <p className="text-xs text-gray-500">
                          Posted {new Date(job.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => router.push(`/employer/jobs/${job.id}`)}
                        className="btn btn-ghost p-2"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 card animate-scale-in" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/employer/jobs/create')}
              className="btn btn-primary flex items-center justify-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Post New Job
            </button>
            <button
              onClick={() => router.push('/employer/applications')}
              className="btn btn-secondary"
            >
              Review Applications
            </button>
            <button
              onClick={() => router.push('/employer/matches')}
              className="btn btn-secondary"
            >
              Find Top Matches
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}