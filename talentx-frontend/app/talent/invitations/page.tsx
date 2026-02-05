'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Invitation } from '@/types';
import { invitationsAPI } from '@/lib/api';
import { Bell, Calendar, Mail, Building, Check, X, Users, Clock } from 'lucide-react';

export default function TalentInvitationsPage() {
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
    fetchInvitations();
  }, [user, router]);

  const fetchInvitations = async () => {
    try {
      const data = await invitationsAPI.getInvitations();
      setInvitations(data);
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvitationResponse = async (invitationId: string, status: 'accepted' | 'declined') => {
    setRespondingToInvitation(invitationId);
    try {
      await invitationsAPI.respondToInvitation(invitationId, status);
      
      // Update local state
      setInvitations(prev => 
        prev.map(inv => 
          inv.id === invitationId ? { ...inv, status } : inv
        )
      );
    } catch (error) {
      console.error('Failed to respond to invitation:', error);
      alert('Failed to respond to invitation. Please try again.');
    } finally {
      setRespondingToInvitation(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'accepted':
        return <Check className="h-4 w-4" />;
      case 'declined':
        return <X className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
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
            <p className="mt-4 text-gray-600">Loading invitations...</p>
          </div>
        </div>
      </div>
    );
  }

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');
  const respondedInvitations = invitations.filter(inv => inv.status !== 'pending');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Job Invitations</h1>
          <p className="text-gray-600 mt-2">
            Employers who want you to apply for their positions
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{pendingInvitations.length}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {invitations.filter(inv => inv.status === 'accepted').length}
              </p>
              <p className="text-sm text-gray-600">Accepted</p>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {invitations.filter(inv => inv.status === 'declined').length}
              </p>
              <p className="text-sm text-gray-600">Declined</p>
            </div>
          </div>
        </div>

        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Bell className="h-5 w-5 mr-2 text-yellow-600" />
              Pending Invitations ({pendingInvitations.length})
            </h2>
            <div className="space-y-6">
              {pendingInvitations.map((invitation, index) => {
                const expired = invitation.job ? isJobExpired(invitation.job.application_deadline) : false;
                
                return (
                  <div
                    key={invitation.id}
                    className="card hover:shadow-md transition-all duration-200 animate-slide-up border-l-4 border-yellow-500"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Bell className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {invitation.job?.title || 'Unknown Position'}
                            </h3>
                            <span className={`px-2 py-1 text-xs rounded-full flex items-center ${getStatusColor(invitation.status)}`}>
                              {getStatusIcon(invitation.status)}
                              <span className="ml-1">{invitation.status}</span>
                            </span>
                            {expired && (
                              <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                                Expired
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Building className="h-4 w-4 mr-2" />
                              {invitation.job?.company || 'Unknown Company'}
                            </div>
                            {invitation.job && (
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                Deadline: {new Date(invitation.job.application_deadline).toLocaleDateString()}
                                {expired && (
                                  <span className="ml-2 text-red-600 font-medium">(Application period ended)</span>
                                )}
                              </div>
                            )}
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-2" />
                              Invited {new Date(invitation.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleInvitationResponse(invitation.id, 'accepted')}
                          disabled={respondingToInvitation === invitation.id || expired}
                          className="btn btn-primary"
                        >
                          {respondingToInvitation === invitation.id ? (
                            'Processing...'
                          ) : expired ? (
                            'Expired'
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Accept
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleInvitationResponse(invitation.id, 'declined')}
                          disabled={respondingToInvitation === invitation.id}
                          className="btn btn-secondary"
                        >
                          {respondingToInvitation === invitation.id ? (
                            'Processing...'
                          ) : (
                            <>
                              <X className="h-4 w-4 mr-2" />
                              Decline
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Responded Invitations */}
        {respondedInvitations.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Users className="h-5 w-5 mr-2 text-gray-600" />
              Previous Invitations ({respondedInvitations.length})
            </h2>
            <div className="space-y-6">
              {respondedInvitations.map((invitation, index) => (
                <div
                  key={invitation.id}
                  className="card hover:shadow-md transition-all duration-200 animate-slide-up opacity-75"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {invitation.job?.title || 'Unknown Position'}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded-full flex items-center ${getStatusColor(invitation.status)}`}>
                            {getStatusIcon(invitation.status)}
                            <span className="ml-1">{invitation.status}</span>
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-2" />
                            {invitation.job?.company || 'Unknown Company'}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {invitation.status === 'accepted' ? 'Accepted on' : 'Declined on'} {new Date(invitation.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {invitation.job && (
                        <button
                          onClick={() => router.push(`/jobs/${invitation.job.id}`)}
                          className="btn btn-secondary"
                        >
                          View Job
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {invitations.length === 0 && (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invitations yet</h3>
            <p className="text-gray-600 mb-6">Employers will invite you to apply for relevant positions</p>
            <button
              onClick={() => router.push('/talent/jobs')}
              className="btn btn-primary"
            >
              Browse Jobs
            </button>
          </div>
        )}
      </div>
    </div>
  );
}