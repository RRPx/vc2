'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Job, Application, Invitation } from '@/types';
import { jobsAPI, applicationsAPI, invitationsAPI } from '@/lib/api';
import { Briefcase, Calendar, TrendingUp, Bell, Check, X, Users } from 'lucide-react';

export default function TalentDashboard() {
  const [stats, setStats] = useState({
    recommendedJobs: 0,
    applicationsSent: 0,
    interviewsScheduled: 0,
    pendingInvitations: 0
  });
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingToInvitation, setRespondingToInvitation] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role !== 'talent') {
      router.push('/employer/dashboard');
      return;
    }
    fetchDashboardData();
  }, [user, router]);

  const fetchDashboardData = async () => {
    try {
      // Fetch recommended jobs
      const jobs = await jobsAPI.getRecommendedJobs();
      setRecommendedJobs(jobs.slice(0, 3));
      
      // Fetch applications
      const apps = await applicationsAPI.getApplications();
      setApplications(apps.slice(0, 5));
      const interviews = apps.filter(app => app.status === 'accepted');
      
      // Fetch invitations
      const invs = await invitationsAPI.getInvitations();
      const pendingInvitations = invs.filter(inv => inv.status === 'pending');
      setInvitations(pendingInvitations.slice(0, 5));
      
      setStats({
        recommendedJobs: jobs.length,
        applicationsSent: apps.length,
        interviewsScheduled: interviews.length,
        pendingInvitations: pendingInvitations.length
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvitationResponse = async (invitationId: string, status: 'accepted' | 'declined') => {
    setRespondingToInvitation(invitationId);
    try {
      await invitationsAPI.respondToInvitation(invitationId, status);
      // Refresh the invitations list
      const invs = await invitationsAPI.getInvitations();
      const pendingInvitations = invs.filter(inv => inv.status === 'pending');
      setInvitations(pendingInvitations.slice(0, 5));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pendingInvitations: pendingInvitations.length
      }));
    } catch (error) {
      console.error('Failed to respond to invitation:', error);
      alert('Failed to respond to invitation. Please try again.');
    } finally {
      setRespondingToInvitation(null);
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
            Here are your personalized job recommendations and updates
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card animate-scale-in">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.recommendedJobs}</p>
                <p className="text-sm text-gray-600">Recommended Jobs</p>
              </div>
            </div>
          </div>

          <div className="card animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.applicationsSent}</p>
                <p className="text-sm text-gray-600">Applications Sent</p>
              </div>
            </div>
          </div>

          <div className="card animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.interviewsScheduled}</p>
                <p className="text-sm text-gray-600">Interviews</p>
              </div>
            </div>
          </div>

          <div className="card animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Bell className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.pendingInvitations}</p>
                <p className="text-sm text-gray-600">New Invitations</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Pending Invitations */}
          <div className="lg:col-span-2">
            <div className="card animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Pending Invitations</h2>
                <button
                  onClick={() => router.push('/talent/invitations')}
                  className="btn btn-ghost"
                >
                  View All
                </button>
              </div>
              
              {invitations.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No pending invitations</p>
                  <p className="text-sm text-gray-500">Employers will invite you to apply for relevant positions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {invitations.map((invitation) => (
                    <div key={invitation.id} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {invitation.job?.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            {invitation.job?.company}
                          </p>
                          <p className="text-xs text-gray-500">
                            Deadline: {invitation.job ? new Date(invitation.job.application_deadline).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleInvitationResponse(invitation.id, 'accepted')}
                            disabled={respondingToInvitation === invitation.id}
                            className="btn btn-primary p-2"
                            title="Accept"
                          >
                            {respondingToInvitation === invitation.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleInvitationResponse(invitation.id, 'declined')}
                            disabled={respondingToInvitation === invitation.id}
                            className="btn btn-secondary p-2"
                            title="Decline"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Applications */}
          <div className="lg:col-span-1">
            <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Applications</h2>
                <button
                  onClick={() => router.push('/talent/applications')}
                  className="btn btn-ghost"
                >
                  View All
                </button>
              </div>
              
              {applications.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No applications yet</p>
                  <button
                    onClick={() => router.push('/talent/jobs')}
                    className="btn btn-primary mt-4"
                  >
                    Browse Jobs
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div key={application.id} className="border-l-4 border-green-500 pl-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {application.job?.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          {application.job?.company}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
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
                          <span className="text-xs text-gray-500">
                            {application.source === 'invitation' ? 'Invited' : 'Manual'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recommended Jobs */}
        {recommendedJobs.length > 0 && (
          <div className="mt-8 card animate-scale-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recommended for You</h2>
              <button
                onClick={() => router.push('/talent/jobs')}
                className="btn btn-ghost"
              >
                View All Jobs
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedJobs.map((job) => (
                <div key={job.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-medium text-gray-900 mb-2">{job.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{job.company}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {job.tech_stack.slice(0, 3).map((tech, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => router.push(`/jobs/${job.id}`)}
                    className="btn btn-primary w-full text-sm"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 card animate-scale-in" style={{ animationDelay: '0.5s' }}>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/talent/jobs')}
              className="btn btn-primary flex items-center justify-center"
            >
              <Briefcase className="h-5 w-5 mr-2" />
              Find Jobs
            </button>
            <button
              onClick={() => router.push('/talent/applications')}
              className="btn btn-secondary"
            >
              My Applications
            </button>
            <button
              onClick={() => router.push('/talent/invitations')}
              className="btn btn-secondary"
            >
              Invitations {stats.pendingInvitations > 0 && (
                <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                  {stats.pendingInvitations}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}