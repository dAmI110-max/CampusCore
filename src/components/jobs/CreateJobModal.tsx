import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import { CampusJobCategory, CampusJobType } from '../../types';
import {
  X,
  Briefcase,
  DollarSign,
  MapPin,
  Calendar,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'motion/react';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateJobModal: React.FC<CreateJobModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();
  const campuses = StorageService.getCampuses();

  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState(currentUser?.fullName ? `${currentUser.fullName}'s Venture` : 'Campus Recruiter');
  const [category, setCategory] = useState<CampusJobCategory>('tutoring');
  const [jobType, setJobType] = useState<CampusJobType>('part_time');
  const [campusId, setCampusId] = useState(currentUser?.campusId || campuses[0]?.id || 'campus-osogbo');
  const [isRemote, setIsRemote] = useState(false);
  const [salaryRate, setSalaryRate] = useState('₦25,000 / month');
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [requirementsInput, setRequirementsInput] = useState('300L+ Student, Good academic standing, Laptop required');
  const [description, setDescription] = useState('');
  const [applicationInstructions, setApplicationInstructions] = useState('Please apply directly through CampusCore with your CV.');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toastError('Please enter job title.');
      return;
    }
    if (!description.trim() || description.length < 20) {
      toastError('Please provide a detailed description of the role (at least 20 characters).');
      return;
    }

    setSubmitting(true);
    try {
      const selectedCampus = campuses.find((c) => c.id === campusId);
      const reqs = requirementsInput
        .split(',')
        .map((r) => r.trim())
        .filter((r) => r.length > 0);

      StorageService.createJob({
        employerId: currentUser.id,
        employerName: currentUser.fullName,
        employerAvatar: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        employerVerified: currentUser.verificationBadge !== 'unverified',
        companyName: companyName.trim(),
        category: category as any,
        title: title.trim(),
        description: description.trim(),
        requirements: reqs.length > 0 ? reqs : ['Enrolled student', 'Punctuality'],
        salaryRate: salaryRate.trim(),
        location: isRemote ? 'Remote / Online' : selectedCampus?.name || 'Main Campus',
        campusId,
        universityId: currentUser.universityId || 'uni-uniosun',
        isRemote,
        deadline,
        contactEmail: currentUser.email,
        contactPhone: currentUser.phone,
        status: 'open',
        featured: false,
      });

      success('Job posting published successfully!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toastError(err.message || 'Failed to post job.');
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
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 text-base">Post a Campus Opportunity</h2>
              <p className="text-[11px] text-slate-500">Hire talented students on your campus</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Job / Gig Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Organic Chemistry Tutor, Social Media Manager"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Company / Organization Name *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Ace Studios / Student Union"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CampusJobCategory)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium outline-none focus:border-indigo-500"
              >
                <option value="tutoring">Tutoring & Academics</option>
                <option value="tech_dev">Tech & Coding</option>
                <option value="brand_ambassador">Brand Ambassador</option>
                <option value="event_staff">Event Staff / Usher</option>
                <option value="design_media">Design & Media</option>
                <option value="delivery">Delivery & Errand</option>
                <option value="administrative">Admin & Office</option>
                <option value="research">Research Assistant</option>
                <option value="other">General Gig</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Job Type *
              </label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value as CampusJobType)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium outline-none focus:border-indigo-500"
              >
                <option value="part_time">Part Time</option>
                <option value="gig">One-time Gig</option>
                <option value="internship">Student Internship</option>
                <option value="freelance">Freelance</option>
                <option value="full_time">Full Time</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Campus *
              </label>
              <select
                value={campusId}
                onChange={(e) => setCampusId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium outline-none focus:border-indigo-500"
              >
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Pay Rate / Salary *
              </label>
              <input
                type="text"
                required
                value={salaryRate}
                onChange={(e) => setSalaryRate(e.target.value)}
                placeholder="e.g. ₦30,000 / month, ₦5,000 / day"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Application Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="isRemote"
              checked={isRemote}
              onChange={(e) => setIsRemote(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <label htmlFor="isRemote" className="text-xs font-semibold text-slate-700 cursor-pointer">
              This is a Remote / Work-from-Hostel position
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Requirements (comma-separated)
            </label>
            <input
              type="text"
              value={requirementsInput}
              onChange={(e) => setRequirementsInput(e.target.value)}
              placeholder="e.g. Must have a smartphone, Available on weekends, 200L+"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Role Description & Expectations *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe day-to-day duties, working hours, deliverables, and performance incentives..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 text-sm outline-none"
            />
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
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Publish Job Listing'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
