import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import { CampusJob } from '../../types';
import {
  X,
  Send,
  Upload,
  Link,
  Briefcase,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'motion/react';

interface ApplyJobModalProps {
  job: CampusJob | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApplyJobModal: React.FC<ApplyJobModalProps> = ({
  job,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [coverNote, setCoverNote] = useState(
    `Hello ${job?.companyName || 'Team'}, I am a student at ${currentUser?.universityName || 'UNIOSUN'} interested in this role. I have relevant experience and strong commitment.`
  );
  const [skillsInput, setSkillsInput] = useState('Communication, Time Management, Teamwork');
  const [resumeUrl, setResumeUrl] = useState('https://drive.google.com/file/d/campuscore-student-cv');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !job || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverNote.trim() || coverNote.length < 20) {
      toastError('Please write a brief cover pitch (at least 20 characters).');
      return;
    }

    setSubmitting(true);
    try {
      const skills = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const res = StorageService.applyForJob({
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.companyName,
        employerId: job.employerId,
        studentId: currentUser.id,
        studentName: currentUser.fullName,
        studentAvatar: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        studentEmail: currentUser.email,
        studentPhone: currentUser.phone || '08012345678',
        studentCampus: currentUser.campusName || 'Osogbo Main Campus',
        studentDepartment: currentUser.department || 'Computer Science',
        studentLevel: currentUser.level || '300L',
        coverMessage: coverNote.trim(),
        coverNote: coverNote.trim(),
        applicantId: currentUser.id,
        applicantName: currentUser.fullName,
        applicantAvatar: currentUser.avatarUrl,
        applicantEmail: currentUser.email as any,
        applicantPhone: currentUser.phone,
        applicantDepartment: currentUser.department,
        applicantLevel: currentUser.level,
        cvUrl: resumeUrl.trim() || undefined,
        resumeUrl: resumeUrl.trim() || undefined,
        portfolioUrl: portfolioUrl.trim() || undefined,
        skills,
      });

      if (!res.success) {
        toastError(res.error || 'Failed to submit application.');
        return;
      }

      success('Application submitted successfully to employer!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toastError(err.message || 'Error submitting application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 text-base">Submit Application</h2>
              <p className="text-[11px] text-slate-500">Applying to: {job.title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-900">{job.companyName}</span>
              <span className="text-slate-500 block text-[11px]">{job.location} • {job.salaryRate}</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
              {job.jobType}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Pitch / Why are you a great fit? *
            </label>
            <textarea
              required
              rows={4}
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              placeholder="Highlight your availability, course of study, relevant project work..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Key Skills (comma-separated)
            </label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="e.g. Sales, Python, Video Editing, Social Media"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Resume / CV Link
              </label>
              <div className="relative">
                <Link className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="url"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Portfolio / LinkedIn URL
              </label>
              <div className="relative">
                <Link className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Submitting...' : 'Send Application'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
