'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Job, Application } from '@/types';
import { jobsAPI, applicationsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Briefcase, MapPin, Clock, Users, Calendar, ArrowLeft } from 'lucide-react';

export default function JobDetailPage() {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (params.id) {
      fetchJobDetails();
    }
  }, [params.id]);

  const fetchJobDetails = async () => {
    try {
      const data = await jobsAPI.getJob(params.id as string);
      setJob(data);
      
      // Check if user has already applied
      if (user) {
        const applications = await applicationsAPI.getApplications();
        const alreadyApplied = applications.some(app => app.job_id === params.id);
        setHasApplied(alreadyApplied);
      }
    } catch (error) {
      console.error('Failed to fetch job details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      router.push(`/login?redirect=/jobs/${params.id}`);
      return;
    }

    setApplying(true);
    try {
      await applicationsAPI.apply(params.id as string);
      setHasApplied(true);
      // Refresh job data to get updated application count
      fetchJobDetails();
    } catch (error) {
      console.error('Failed to apply:', error);
    } finally {
      setApplying(false);
    }
  };

  const isJobExpired = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Job not found</h3>
            <p className="text-gray-600">This job may have been removed or is no longer available.</p>
            <button
              onClick={() => router.push('/jobs')}
              className="btn btn-primary mt-4"
            >
              Back to Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  const expired = isJobExpired(job.application_deadline);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Back Button */}
        <button
          onClick={() => router.push('/jobs')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="card animate-scale-in">
              {/* Job Header */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                <p className="text-xl text-gray-600 font-medium">{job.company}</p>
              </div>

              {/* Job Meta */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  Remote / Global
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2" />
                  {expired ? 'Expired' : `Deadline: ${new Date(job.application_deadline).toLocaleDateString()}`}
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-5 w-5 mr-2" />
                  {job.total_applications} applicants
                </div>
              </div>

              {/* Tech Stack */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {job.tech_stack.map((tech, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Job Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
                <div className="prose prose-gray max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: job.description }} />
                </div>
              </div>

              {/* Application Info */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Application deadline: {new Date(job.application_deadline).toLocaleDateString()}
                    </p>
                    {expired && (
                      <p className="text-sm text-red-600 font-medium mt-1">
                        This job is no longer accepting applications
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {job.total_applications} applicants
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-6 animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Apply for this Position</h3>
              
              {hasApplied ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Application Submitted!</h4>
                  <p className="text-gray-600">You've successfully applied for this position.</p>
                </div>
              ) : (
                <div>
                  <button
                    onClick={handleApply}
                    disabled={expired || applying}
                    className={`btn w-full text-lg py-4 ${expired ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'btn-primary'}`}
                  >
                    {applying ? 'Submitting...' : expired ? 'Application Closed' : 'Apply Now'}
                  </button>
                  
                  {!user && (
                    <p className="text-sm text-gray-600 mt-3 text-center">
                      You'll need to sign in to apply for this position.
                    </p>
                  )}
                </div>
              )}

              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium text-gray-900 mb-3">Quick Info</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Posted:</span>
                    <span className="text-gray-900">{new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Deadline:</span>
                    <span className="text-gray-900">{new Date(job.application_deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Applicants:</span>
                    <span className="text-gray-900">{job.total_applications}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}