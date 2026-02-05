"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { jobsAPI } from "@/lib/api";
import { Briefcase, Plus, Calendar, Users, Eye } from "lucide-react";
import type { Job } from "@/types";

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return; // wait for auth
    if (user.role !== "employer") {
      router.push("/talent/dashboard");
      return;
    }
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchJobs = async () => {
    try {
      const data = await jobsAPI.getJobsForEmployer();
      if (Array.isArray(data)) setJobs(data);
      else if (data?.jobs && Array.isArray(data.jobs)) setJobs(data.jobs);
      else if (Array.isArray(data?.data)) setJobs(data.data);
      else setJobs([]);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const isJobExpired = (deadline: string) => new Date(deadline) < new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
            <p className="text-gray-600 mt-2">Manage your job postings</p>
          </div>
          <button
            onClick={() => router.push("/employer/jobs/create")}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Post New Job
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading your jobs...</p>
          </div>
        ) : (
          <>
            {/* {process.env.NODE_ENV === "development" && (
              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="text-sm font-semibold text-yellow-800 mb-2">
                  Debug Info:
                </h3>
                <div className="text-xs text-yellow-700 space-y-1">
                  <p>Jobs type: {typeof jobs}</p>
                  <p>Jobs length: {jobs?.length ?? "undefined"}</p>
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(jobs, null, 2)}
                  </pre>
                </div>
              </div>
            )} */}

            <div className="grid gap-6 mt-6">
              {jobs.map((job, index) => {
                const expired = isJobExpired(job.application_deadline);
                return (
                  <div
                    key={job.id}
                    className="card hover:shadow-md transition-all duration-200 animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {job.title}
                          </h3>
                          {expired && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                              Expired
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            Deadline:{" "}
                            {new Date(
                              job.application_deadline,
                            ).toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 mr-2" />
                            {job.total_applications} applications
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Briefcase className="h-4 w-4 mr-2" />
                            {job.status}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() =>
                            router.push(`/employer/jobs/${job.id}/applicants`)
                          }
                          className="btn btn-secondary"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Applicants
                        </button>
                        <button
                          onClick={() =>
                            router.push(`/employer/jobs/${job.id}/matches`)
                          }
                          className="btn btn-secondary"
                        >
                          Find Matches
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
