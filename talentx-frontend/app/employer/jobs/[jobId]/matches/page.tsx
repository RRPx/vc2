'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { JobMatch, User } from '@/types';
import { invitationsAPI } from '@/lib/api';
import { Users, Star, Mail, Send, TrendingUp } from 'lucide-react';

export default function JobMatchesPage() {
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState('');
  const [inviting, setInviting] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (user?.role !== 'employer') {
      router.push('/talent/dashboard');
      return;
    }
    if (params.jobId) {
      fetchMatches();
    }
  }, [user, router, params.jobId]);

  const fetchMatches = async () => {
    try {
      const data = await invitationsAPI.getTopMatches(params.jobId as string);
      setMatches(data);
      
      // We'd get the job title from the API in a real implementation
      // For now, using a placeholder
      setJobTitle('Senior Data Scientist');
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (talentId: string) => {
    setInviting(talentId);
    try {
      await invitationsAPI.invite(params.jobId as string, talentId);
      // Remove from matches after inviting
      setMatches(prev => prev.filter(match => match.talent.id !== talentId));
    } catch (error) {
      console.error('Failed to invite talent:', error);
      alert('Failed to send invitation. Please try again.');
    } finally {
      setInviting(null);
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getStars = (score: number) => {
    const stars = Math.round(score / 20);
    return Array.from({ length: 5 }, (_, i) => i < stars);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Finding top matches...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Top Matches for {jobTitle}</h1>
          <p className="text-gray-600 mt-2">
            AI-powered talent recommendations for your job posting
          </p>
        </div>

        {/* AI Matching Info */}
        <div className="card mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI-Powered Matching</h3>
              <p className="text-gray-600">
                These talents are ranked by relevance based on skills, experience, and job requirements
              </p>
            </div>
          </div>
        </div>

        {/* Matches List */}
        {matches.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-600">Try adjusting your job requirements or wait for more talents to join</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {matches.map((match, index) => (
              <div
                key={match.talent.id}
                className="card hover:shadow-md transition-all duration-200 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl font-bold">
                        {match.talent.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {match.talent.name}
                        </h3>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchScoreColor(match.match_score)}`}>
                          {match.match_score}% Match
                        </div>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <Mail className="h-4 w-4 mr-2" />
                        {match.talent.email}
                      </div>

                      {/* Match Score Stars */}
                      <div className="flex items-center mb-3">
                        {getStars(match.match_score).map((filled, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${filled ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">
                          {match.match_score}% match score
                        </span>
                      </div>

                      {/* Skills placeholder */}
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          Python
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          Machine Learning
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          Data Science
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleInvite(match.talent.id)}
                      disabled={inviting === match.talent.id}
                      className="btn btn-primary"
                    >
                      {inviting === match.talent.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Inviting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Invite to Apply
                        </>
                      )}
                    </button>
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