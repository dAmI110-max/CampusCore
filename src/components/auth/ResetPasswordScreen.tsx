import React, { useState } from 'react';
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CampusCoreLogo } from '../common/CampusCoreLogo';

export const ResetPasswordScreen: React.FC = () => {
  const { updatePassword, clearPasswordRecovery } = useAuth();
  const { error: toastError } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toastError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      toastError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    const res = await updatePassword(password);
    setIsSubmitting(false);

    if (res.success) {
      setDone(true);
    } else {
      toastError(res.message || 'Could not update your password. The reset link may have expired — request a new one.');
    }
  };

  const handleContinue = () => {
    clearPasswordRecovery();
    // Clean the URL so a refresh doesn't re-trigger recovery mode.
    window.history.replaceState({}, '', '/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
        <div className="flex justify-center mb-6">
          <CampusCoreLogo className="h-10" />
        </div>

        {!done ? (
          <>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-1">
              Set a new password
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
              Choose a new password for your CampusCore account.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition"
              >
                {isSubmitting ? 'Updating...' : 'Update Password'}
                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Password updated</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              You're signed in with your new password. Continue to CampusCore.
            </p>
            <button
              onClick={handleContinue}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition"
            >
              Continue to CampusCore
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
