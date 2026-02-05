'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Application } from '@/types';
import { applicationsAPI } from '@/lib/api';
import { Users, Calendar, Mail, Briefcase, User } from 'lucide-react';

export default function JobApplicantsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState('');
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (user?.role !== 'employer') {
      router.push('/talent/dashboard');
      return;
    }
    if (params.jobId) {
      fetchApplications();
    }
  }, [user, router, params.jobId]);

  const fetchApplications = async () => {
    try {
      const data = await applicationsAPI.getJobApplications(params.jobId as string);
      setApplications(data);
      
      // Extract job title from first application
      if (data.length > 0) {
        setJobTitle(data[0].job?.title || 'Unknown Job');
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      // This would be an API call to update status
      // await applicationsAPI.updateStatus(applicationId, status);
      
      // For now, just update locally
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId ? { ...app, status } : app
        )
      );
    } catch (error) {
      console.error('Failed to update application status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading applicants...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/employer/jobs')}
            className="btn btn-ghost mb-4"
          >
            ← Back to Jobs
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Applicants for {jobTitle}</h1>
          <p className="text-gray-600 mt-2">
            {applications.length} {applications.length === 1 ? 'application' : 'applications'} received
          </p>
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-600">Applications will appear here once talents start applying</p>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((application, index) => (
              <div
                key={application.id}
                className="card hover:shadow-md transition-all duration-200 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {application.talent?.name || 'Unknown Talent'}
                        </h3>
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
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          {application.talent?.email || 'No email available'}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Applied {new Date(application.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-2" />
                          Source: {application.source === 'invitation' ? 'Invited' : 'Manual Application'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {application.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateApplicationStatus(application.id, 'reviewed')}
                          className="btn btn-secondary"
                        >
                          Mark as Reviewed
                        </button>
                        <button
                          onClick={() => updateApplicationStatus(application.id, 'accepted')}
                          className="btn btn-primary"
                        >
                          Accept
                        </button>
                      </>
                    )}
                    {application.status === 'reviewed' && (
                      <>
                        <button
                          onClick={() => updateApplicationStatus(application.id, 'accepted')}
                          className="btn btn-primary"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => updateApplicationStatus(application.id, 'rejected')}
                          className="btn btn-secondary"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}