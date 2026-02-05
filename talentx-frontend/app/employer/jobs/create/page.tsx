'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { jobsAPI, aiAPI } from '@/lib/api';
import { Briefcase, ArrowLeft, Wand2 } from 'lucide-react';

export default function CreateJobPage() {
  const [formData, setFormData] = useState({
    title: '',
    tech_stack: '',
    application_deadline: ''
  });
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  // Check if user is employer
  if (user?.role !== 'employer') {
    router.push('/talent/dashboard');
    return null;
  }

  const handleGenerateDescription = async () => {
    if (!formData.title || !formData.tech_stack) {
      setError('Please fill in job title and tech stack first');
      return;
    }
    
    setGeneratingDescription(true);
    setError('');
    try {
      const techStackArray = formData.tech_stack.split(',').map(t => t.trim());
      console.log('Generating description for:', formData.title, techStackArray);
      const description = await aiAPI.generateJobDescription(formData.title, techStackArray);
      console.log('Generated description:', description);
      // In a real app, you'd add this description to the form
      alert(`Generated Description: ${description.substring(0, 200)}...`);
    } catch (error: any) {
      console.error('Failed to generate description:', error);
      setError('Failed to generate description. Please try again.');
    } finally {
      setGeneratingDescription(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const techStackArray = formData.tech_stack.split(',').map(t => t.trim());
      console.log('Submitting job creation with:', {
        title: formData.title,
        tech_stack: techStackArray,
        application_deadline: formData.application_deadline
      });
      
      const result = await jobsAPI.createJob({
        title: formData.title,
        tech_stack: techStackArray,
        application_deadline: formData.application_deadline
      });
      
      console.log('Job creation result:', result);
      
      // Redirect to jobs page after successful creation
      router.push('/employer/jobs');
    } catch (error: any) {
      console.error('Failed to create job:', error);
      setError(error.message || 'Failed to create job. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Set minimum date to tomorrow
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="btn btn-ghost mb-4 flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Job</h1>
          <p className="text-gray-600 mt-2">
            Post a new position to attract top talent
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Create Job Form */}
        <div className="card animate-scale-in">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Job Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                    placeholder="e.g. Senior Data Scientist"
                  />
                </div>

                {/* Tech Stack */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tech Stack (comma-separated)
                  </label>
                  <textarea
                    name="tech_stack"
                    value={formData.tech_stack}
                    onChange={handleInputChange}
                    className="input-field"
                    rows={4}
                    required
                    placeholder="e.g. Python, Machine Learning, TensorFlow, AWS"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter technologies separated by commas
                  </p>
                </div>

                {/* Application Deadline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    name="application_deadline"
                    value={formData.application_deadline}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                    min={minDate.toISOString().split('T')[0]}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Candidates can apply until this date
                  </p>
                </div>
              </div>

              {/* Right Column - AI Description */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-4">
                    <Wand2 className="h-6 w-6 text-blue-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">AI-Powered Description</h3>
                  </div>
                  
                  <p className="text-gray-700 mb-4">
                    Let our AI generate a professional job description based on your title and tech stack.
                  </p>
                  
                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={generatingDescription || !formData.title || !formData.tech_stack}
                    className="btn btn-primary w-full"
                  >
                    {generatingDescription ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Generate Description
                      </>
                    )}
                  </button>
                  
                  <p className="text-sm text-gray-500 mt-2">
                    AI will create a professional description including responsibilities, requirements, and qualifications.
                  </p>
                </div>

                {/* Job Creation Tips */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Tips</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Be specific about the role and seniority level
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Include both hard skills and soft skills
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Set a reasonable application deadline
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Use AI to save time on description writing
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Job...
                  </>
                ) : (
                  <>
                    <Briefcase className="h-4 w-4 mr-2" />
                    Create Job
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}