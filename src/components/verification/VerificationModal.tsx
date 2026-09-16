import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StorageService } from '../../services/storageService';
import {
  ShieldCheck,
  X,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building,
  GraduationCap,
  Sparkles,
  FileText,
  Info,
} from 'lucide-react';
import { motion } from 'motion/react';

interface VerificationModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({ onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const { success, error: showError } = useToast();

  const existingRequest = currentUser ? StorageService.getUserVerification(currentUser.id) : null;

  const [matricNumber, setMatricNumber] = useState(currentUser?.matricNumber || '2021/CS/4019');
  const [department, setDepartment] = useState(currentUser?.departmentName || 'Computer Science');
  const [level, setLevel] = useState(currentUser?.level || '300L');
  const [studentIdImage, setStudentIdImage] = useState(
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80'
  );
  const [portalScreenshot, setPortalScreenshot] = useState(
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80'
  );
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricNumber.trim()) {
      showError('Please provide your UNIOSUN Matriculation Number');
      return;
    }
    if (!agreedToTerms) {
      showError('Please confirm your academic details are authentic');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      StorageService.submitVerificationRequest(currentUser.id, {
        studentIdCardUrl: studentIdImage,
        portalScreenshotUrl: portalScreenshot,
        matricNumber: matricNumber.trim(),
        department,
        level,
      });

      setIsSubmitting(false);
      success('Verification documents submitted for moderation desk review!');
      if (onSuccess) onSuccess();
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">Student Identity Verification</h2>
              <span className="text-xs text-slate-500">Unlock "Verified Student" & "Trusted Seller" badges</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold"
          >
            &times;
          </button>
        </div>

        {/* Existing Status Notice */}
        {existingRequest && (
          <div className="mb-5">
            {existingRequest.status === 'pending' && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold block text-sm">Verification Under Review</span>
                  <span>
                    Your documents submitted on{' '}
                    {new Date(existingRequest.submittedAt).toLocaleDateString('en-NG')} are currently being reviewed by the CampusCore safety team.
                  </span>
                </div>
              </div>
            )}

            {existingRequest.status === 'approved' && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold block text-sm">Identity Verified!</span>
                  <span>
                    You have active "Verified Student" standing. Your listings display the blue trust badge across UNIOSUN campuses.
                  </span>
                </div>
              </div>
            )}

            {existingRequest.status === 'rejected' && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-900">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold block text-sm">Verification Needs Attention</span>
                  <span>Reason: {existingRequest.rejectionReason || 'Documents were unclear'}. You can submit updated photos below.</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Verification Benefits */}
        <div className="grid grid-cols-3 gap-2.5 mb-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-center text-xs">
          <div>
            <ShieldCheck className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
            <span className="font-bold text-slate-900 block text-[11px]">Trust Badge</span>
            <span className="text-[10px] text-slate-400">Boosts sales 3x</span>
          </div>
          <div>
            <Sparkles className="w-4 h-4 text-amber-500 mx-auto mb-1" />
            <span className="font-bold text-slate-900 block text-[11px]">Instant Escrow</span>
            <span className="text-[10px] text-slate-400">Faster payouts</span>
          </div>
          <div>
            <GraduationCap className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
            <span className="font-bold text-slate-900 block text-[11px]">UNIOSUN Only</span>
            <span className="text-[10px] text-slate-400">Anti-scam verified</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              UNIOSUN Matriculation Number
            </label>
            <input
              type="text"
              value={matricNumber}
              onChange={(e) => setMatricNumber(e.target.value)}
              placeholder="e.g. 2021/CS/4019"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-500 uppercase tracking-wider"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Academic Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as any)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
              >
                <option value="100L">100L</option>
                <option value="200L">200L</option>
                <option value="300L">300L</option>
                <option value="400L">400L</option>
                <option value="500L">500L</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
            </div>
          </div>

          {/* Simulated File Uploads */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Student ID Card (Front Photo)
              </label>
              <div className="p-3 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-between gap-3 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <img
                    src={studentIdImage}
                    alt="ID card preview"
                    className="w-12 h-10 object-cover rounded-lg border border-slate-200"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">uniosun_student_id.jpg</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Ready for verification</span>
                  </div>
                </div>
                <span className="text-xs text-indigo-600 font-bold">Uploaded</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                UNIOSUN Portal Course Registration Screenshot
              </label>
              <div className="p-3 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-between gap-3 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <img
                    src={portalScreenshot}
                    alt="Portal screenshot preview"
                    className="w-12 h-10 object-cover rounded-lg border border-slate-200"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">portal_course_form.png</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Matched with matric number</span>
                  </div>
                </div>
                <span className="text-xs text-indigo-600 font-bold">Uploaded</span>
              </div>
            </div>
          </div>

          {/* Checkbox agreement */}
          <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>
              I attest that I am an actively enrolled student at Osun State University (UNIOSUN). Submitting false credentials results in immediate ban and report to campus security.
            </span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting || !agreedToTerms}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Submit Verification Documents
          </button>
        </form>
      </motion.div>
    </div>
  );
};
