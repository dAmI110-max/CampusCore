import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import {
  CampusJob,
  CampusJobCategory,
  CampusJobType,
  JobApplication,
} from '../../types';
import { JobCard } from './JobCard';
import { JobDetailModal } from './JobDetailModal';
import { CreateJobModal } from './CreateJobModal';
import { ApplyJobModal } from './ApplyJobModal';
import { JobApplicationsModal } from './JobApplicationsModal';
import { EmptyState } from '../common/EmptyState';
import {
  Search,
  Plus,
  Briefcase,
  Layers,
  MapPin,
  Clock,
  Sparkles,
  Users,
  CheckCircle2,
  FileText,
  Filter,
  ArrowLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface JobsViewProps {
  onBack?: () => void;
  onOpenChat?: (userId: string) => void;
  onNavigateToChat?: (userId: string) => void;
  onOpenAuth?: () => void;
}

export const JobsView: React.FC<JobsViewProps> = ({
  onBack,
  onOpenChat,
  onNavigateToChat,
  onOpenAuth,
}) => {
  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();
  const handleChat = onOpenChat || onNavigateToChat;

  const [activeTab, setActiveTab] = useState<'explore' | 'my_applications' | 'my_postings'>('explore');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCampus, setSelectedCampus] = useState('all');
  const [remoteOnly, setRemoteOnly] = useState(false);

  // Modals
  const [selectedJob, setSelectedJob] = useState<CampusJob | null>(null);
  const [applyJob, setApplyJob] = useState<CampusJob | null>(null);
  const [createJobOpen, setCreateJobOpen] = useState(false);
  const [viewApplicationsJob, setViewApplicationsJob] = useState<CampusJob | null>(null);

  // Data
  const [jobs, setJobs] = useState<CampusJob[]>([]);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<JobApplication[]>([]);

  const loadData = () => {
    setCampuses(StorageService.getCampuses());
    setJobs(
      StorageService.getJobs({
        category: selectedCategory,
        jobType: selectedType,
        campusId: selectedCampus,
        isRemote: remoteOnly ? true : undefined,
        search: searchQuery,
      })
    );
    if (currentUser) {
      setMyApplications(StorageService.getApplicationsForUser(currentUser.id));
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('campuscore_storage_update', handleUpdate);
    return () => window.removeEventListener('campuscore_storage_update', handleUpdate);
  }, [selectedCategory, selectedType, selectedCampus, remoteOnly, searchQuery, currentUser?.id]);

  const myPostedJobs = jobs.filter((j) => j.posterId === currentUser?.id);

  return (
    <div className="min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Back Navigation Bar */}
      {onBack && (
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Back</span>
          </button>
          <span className="text-xs text-slate-400">/ Jobs & Gigs</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 overflow-hidden shadow-xl border border-indigo-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold backdrop-blur-sm border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Student Employment & Gig Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Campus Jobs & Opportunities
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Find part-time work, remote gigs, campus brand ambassador positions, tutoring roles, and student internships that fit around your class schedule.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="post-job-btn"
              onClick={() => {
                if (!currentUser) {
                  if (onOpenAuth) onOpenAuth();
                  return;
                }
                setCreateJobOpen(true);
              }}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Post a Campus Job
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10 overflow-x-auto">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'explore'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Explore Jobs ({jobs.length})
          </button>

          {currentUser && (
            <>
              <button
                onClick={() => setActiveTab('my_applications')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'my_applications'
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> My Applications ({myApplications.length})
              </button>

              <button
                onClick={() => setActiveTab('my_postings')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'my_postings'
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" /> My Posted Opportunities ({myPostedJobs.length})
              </button>
            </>
          )}
        </div>
      </div>

      {/* EXPLORE TAB */}
      {activeTab === 'explore' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs by title, company, or skills..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500"
              >
                <option value="all">All Fields</option>
                <option value="tutoring">Tutoring</option>
                <option value="tech_dev">Tech & Coding</option>
                <option value="brand_ambassador">Brand Rep</option>
                <option value="event_staff">Event Staff</option>
                <option value="design_media">Design</option>
                <option value="delivery">Delivery</option>
                <option value="administrative">Admin</option>
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500"
              >
                <option value="all">All Types</option>
                <option value="part_time">Part Time</option>
                <option value="gig">One-time Gig</option>
                <option value="internship">Internship</option>
                <option value="freelance">Freelance</option>
                <option value="full_time">Full Time</option>
              </select>

              <select
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500"
              >
                <option value="all">All Campuses</option>
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setRemoteOnly(!remoteOnly)}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                  remoteOnly
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Remote Only
              </button>
            </div>
          </div>

          {/* Job Cards Grid */}
          {jobs.length === 0 ? (
            <EmptyState
              title="No campus jobs found"
              description="Be the first to post a student gig or job opening on your campus."
              actionLabel="Post a Job"
              onAction={() => setCreateJobOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onSelect={(j) => setSelectedJob(j)}
                  onApply={(j) => setApplyJob(j)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* MY APPLICATIONS TAB */}
      {activeTab === 'my_applications' && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-900">
            My Submitted Applications ({myApplications.length})
          </h2>

          {myApplications.length === 0 ? (
            <EmptyState
              title="No job applications yet"
              description="Apply to student jobs, tutor requests, and brand ambassador openings to view your application status here."
              actionLabel="Explore Jobs"
              onAction={() => setActiveTab('explore')}
            />
          ) : (
            <div className="space-y-3">
              {myApplications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">Job #{app.jobId}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          app.status === 'hired'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.status === 'shortlisted'
                            ? 'bg-purple-100 text-purple-800'
                            : app.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Applied on {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl line-clamp-2 max-w-xl">
                      "{app.coverNote}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const targetJob = jobs.find((j) => j.id === app.jobId);
                        if (targetJob) setSelectedJob(targetJob);
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                    >
                      View Role
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MY POSTED JOBS TAB */}
      {activeTab === 'my_postings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">
              My Job Postings ({myPostedJobs.length})
            </h2>
            <button
              onClick={() => setCreateJobOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Post New Job
            </button>
          </div>

          {myPostedJobs.length === 0 ? (
            <EmptyState
              title="You haven't posted any jobs yet"
              description="Looking for tutors, designers, interns, or event staff? Post an opening for campus students."
              actionLabel="Post Your First Opening"
              onAction={() => setCreateJobOpen(true)}
            />
          ) : (
            <div className="space-y-3">
              {myPostedJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{job.title}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                        {job.jobType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {job.salaryRate} • {job.location} • Posted {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewApplicationsJob(job)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5" /> View Applicants ({job.applicantsCount || 0})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApply={(j) => setApplyJob(j)}
        />
      )}

      <ApplyJobModal
        job={applyJob}
        isOpen={!!applyJob}
        onClose={() => setApplyJob(null)}
        onSuccess={loadData}
      />

      <CreateJobModal
        isOpen={createJobOpen}
        onClose={() => setCreateJobOpen(false)}
        onSuccess={loadData}
      />

      <JobApplicationsModal
        job={viewApplicationsJob}
        isOpen={!!viewApplicationsJob}
        onClose={() => setViewApplicationsJob(null)}
        onRefresh={loadData}
        onNavigateToChat={onNavigateToChat}
      />
    </div>
  );
};
