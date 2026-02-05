'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Job, Application } from '@/types';
import { jobsAPI, applicationsAPI } from '@/lib/api';
import { Briefcase, MapPin, Clock, Users, Search, TrendingUp, Star } from 'lucide-react';

export default function TalentJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [applying, setApplying] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role !== 'talent') {
      router.push('/employer/dashboard');
      return;
    }
    fetchData();
  }, [user, router]);

  useEffect(() => {
    const filtered = jobs.filter(job => 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.tech_stack.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredJobs(filtered);
  }, [searchTerm, jobs]);

  const fetchData = async () => {
    try {
      const [jobsData, applicationsData] = await Promise.all([
        jobsAPI.getRecommendedJobs(),
        applicationsAPI.getApplications()
      ]);
      setJobs(jobsData);
      setFilteredJobs(jobsData);
      setApplications(applicationsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    setApplying(jobId);
    try {
      await applicationsAPI.apply(jobId);
      
      // Update local state to reflect the application
      const newApplication: Application = {
        id: Date.now().toString(),
        job_id: jobId,
        talent_id: user?.id || '',
        source: 'manual',
        status: 'pending',
        created_at: new Date().toISOString(),
        job: jobs.find(j => j.id === jobId)
      };
      
      setApplications(prev => [newApplication, ...prev]);
      
      // Update job application count
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, total_applications: job.total_applications + 1 }
          : job
      ));
      
      // Increment the application counter in the job card
      const jobElement = document.getElementById(`job-${jobId}-count`);
      if (jobElement) {
        const currentCount = parseInt(jobElement.textContent || '0');
        jobElement.textContent = (currentCount + 1).toString();
      }
    } catch (error) {
      console.error('Failed to apply:', error);
      alert('Failed to apply. Please try again.');
    } finally {
      setApplying(null);
    }
  };

  const hasApplied = (jobId: string) => {
    return applications.some(app => app.job_id === jobId);
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
            <p className="mt-4 text-gray-600">Loading recommended jobs...</p>
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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Your AI-Powered Job Feed</h1>
          <p className="text-xl text-gray-600">Personalized opportunities based on your skills and preferences</p>
        </div>

        {/* AI Matching Banner */}
        <div className="card mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI-Powered Recommendations</h3>
              <p className="text-gray-600">
                These jobs are ranked by relevance to your profile and skills
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by title, company, or tech stack..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Jobs Count */}
        <div className="mb-8">
          <p className="text-gray-600">
            {filteredJobs.length} {filteredJobs.length === 1 ? 'recommended job' : 'recommended jobs'} for you
          </p>
        </div>

        {/* Jobs Grid */}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or check back later for new opportunities</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job, index) => {
              const applied = hasApplied(job.id);
              const expired = isJobExpired(job.application_deadline);
              const matchScore = 85 - (index * 5); // Simulated match scores
              
              return (
                <div
                  key={job.id}
                  className="card hover:shadow-md transition-all duration-200 animate-slide-up relative"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Match Score Badge */}
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm font-medium">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      {matchScore}% Match
                    </div>
                  </div>

                  <div className="mb-4 pr-16">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                    <p className="text-gray-600 font-medium">{job.company}</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      Remote / Global
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      Deadline: {new Date(job.application_deadline).toLocaleDateString()}
                      {expired && (
                        <span className="ml-2 text-red-600 font-medium">(Expired)</span>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span id={`job-${job.id}-count`}>{job.total_applications}</span> applicants
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {job.tech_stack.slice(0, 3).map((tech, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                      {job.tech_stack.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          +{job.tech_stack.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => router.push(`/jobs/${job.id}`)}
                      className="btn btn-secondary flex-1"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleApply(job.id)}
                      disabled={expired || applied || applying === job.id}
                      className={`btn flex-1 ${
                        applied 
                          ? 'bg-green-600 text-white' 
                          : expired 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'btn-primary'
                      }`}
                    >
                      {applying === job.id ? (
                        'Applying...'
                      ) : applied ? (
                        'Applied ✓'
                      ) : expired ? (
                        'Expired'
                      ) : (
                        'Apply Now'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}