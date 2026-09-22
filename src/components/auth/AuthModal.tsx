import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StorageService } from '../../services/storageService';
import { AcademicLevel, UserProfile } from '../../types';
import { X, Mail, Lock, Phone, ArrowRight, ShieldCheck, CheckCircle2, User, Trash2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CampusCoreLogo } from '../common/CampusCoreLogo';
import { ALL_UNIOSUN_FACULTIES, getUNIOSUNDepartmentsByFaculty } from '../../data/uniosunAcademicData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'reset';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, signup, googleLogin, savedAccounts, removeSavedAccount, resetPassword, isSupabaseConnected } = useAuth();
  const { success, error, info } = useToast();

  // Security: Never display Super Admin accounts in shared device saved lists
  const visibleSavedAccounts = (savedAccounts || []).filter(
    (a) => !StorageService.isSuperAdmin(a) && a.role !== 'SUPER_ADMIN' && a.role !== 'ADMIN'
  );

  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>(initialMode);
  const [loading, setLoading] = useState(false);

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup Form
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [universityId, setUniversityId] = useState('uni-uniosun');
  const [campusId, setCampusId] = useState('campus-osogbo');
  const [facultyId, setFacultyId] = useState('fac-computing');
  const [departmentId, setDepartmentId] = useState('dept-comp-cs');
  const [level, setLevel] = useState<AcademicLevel>('300L');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  // Reset Form
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const universities = StorageService.getUniversities();
  const campuses = StorageService.getCampuses(universityId);
  const faculties = universityId === 'uni-uniosun' ? ALL_UNIOSUN_FACULTIES : StorageService.getFaculties(universityId);
  const departments = universityId === 'uni-uniosun' ? getUNIOSUNDepartmentsByFaculty(facultyId) : StorageService.getDepartments(facultyId);

  const handleUniversityChange = (newUniId: string) => {
    setUniversityId(newUniId);
    const newCampuses = StorageService.getCampuses(newUniId);
    if (newCampuses.length > 0) setCampusId(newCampuses[0].id);
    const newFacs = newUniId === 'uni-uniosun' ? ALL_UNIOSUN_FACULTIES : StorageService.getFaculties(newUniId);
    if (newFacs.length > 0) {
      setFacultyId(newFacs[0].id);
      const newDepts = newUniId === 'uni-uniosun' ? getUNIOSUNDepartmentsByFaculty(newFacs[0].id) : StorageService.getDepartments(newFacs[0].id);
      if (newDepts.length > 0) setDepartmentId(newDepts[0].id);
    }
  };

  const handleFacultyChange = (newFacId: string) => {
    setFacultyId(newFacId);
    const newDepts = universityId === 'uni-uniosun' ? getUNIOSUNDepartmentsByFaculty(newFacId) : StorageService.getDepartments(newFacId);
    if (newDepts.length > 0) {
      setDepartmentId(newDepts[0].id);
    }
  };

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      error('Please enter your student email or username.');
      return;
    }

    setLoading(true);
    const res = await login(loginEmail, loginPassword);
    setLoading(false);

    if (res.success) {
      success('Logged in successfully! Welcome back to CampusCore.');
      onClose();
    } else {
      error(res.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const res = await googleLogin();
    setLoading(false);

    if (res.success) {
      success(res.message || 'Connecting with Google...');
    } else {
      error(res.message || 'Google sign-in failed. Please try again.');
    }
  };

  const handleSavedAccountClick = (account: UserProfile) => {
    setLoginEmail(account.email || account.username);
    setLoginPassword('');
    setMode('login');
    info(`Selected ${account.fullName}. Please enter your password to sign in.`);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !username.trim() || !signupEmail.trim()) {
      error('Please fill in your full name, username, and email.');
      return;
    }

    if (!signupPassword || signupPassword.length < 6) {
      error('Password must be at least 6 characters long.');
      return;
    }

    if (!phone.trim()) {
      error('Please provide a WhatsApp or phone number so buyers can reach you.');
      return;
    }

    if (!facultyId || !departmentId) {
      error('Please select your Faculty and Department.');
      return;
    }

    setLoading(true);
    const res = await signup({
      fullName: fullName.trim(),
      username: username.trim(),
      email: signupEmail.trim(),
      password: signupPassword,
      universityId,
      campusId,
      facultyId,
      departmentId,
      level,
      phone: phone.trim(),
      whatsapp: (whatsapp || phone).replace(/[^0-9]/g, ''),
    });
    setLoading(false);

    if (res.success) {
      if (res.requiresEmailConfirmation) {
        success(res.message || 'Account created! Please check your email to confirm your address before logging in.');
        setLoginEmail(signupEmail.trim());
        setMode('login');
      } else {
        success('Account created successfully! Welcome to UNIOSUN CampusCore.');
        onClose();
      }
    } else {
      error(res.message || 'Signup failed. Please try again.');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      error('Please enter your registered email address.');
      return;
    }
    setLoading(true);
    const res = await resetPassword(resetEmail.trim());
    setLoading(false);
    if (res.success) {
      setResetSent(true);
      success(res.message || `Password reset link sent to ${resetEmail}. Check your inbox.`);
    } else {
      error(res.message || 'Failed to send password reset link.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white dark:bg-[#130b21] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-purple-950/70 relative my-8 text-slate-900 dark:text-slate-100 transition-colors"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-purple-950/50 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo & Header */}
          <div className="flex flex-col items-start gap-2 mb-6">
            <CampusCoreLogo variant="full" theme="auto" size="lg" />
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                {mode === 'login' && 'Sign in to CampusCore'}
                {mode === 'signup' && 'Create Student / Seller Account'}
                {mode === 'reset' && 'Reset Your Password'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {mode === 'login' && 'Access your campus dashboard, orders, messages & listings'}
                {mode === 'signup' && 'Join the UNIOSUN student super-app powered by Ace Tech'}
                {mode === 'reset' && 'Enter your student email for a secure password reset link'}
              </p>
            </div>
          </div>

          {!isSupabaseConnected && (
            <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs">
              <div className="font-bold flex items-center gap-1.5 mb-0.5">
                <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                Supabase Environment Variables Required
              </div>
              <p className="text-[11px] leading-relaxed">
                Supabase Auth is not connected. Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your deployment environment variables to enable live authentication and user registration.
              </p>
            </div>
          )}

          {/* Mode Switcher Tabs */}
          {mode !== 'reset' && (
            <div className="flex p-1 bg-slate-100 dark:bg-purple-950/40 rounded-2xl mb-5">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white dark:bg-purple-900/60 text-purple-600 dark:text-purple-200 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-white dark:bg-purple-900/60 text-purple-600 dark:text-purple-200 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Register (Sign Up)
              </button>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <div className="space-y-4">
              {/* Google Sign In Button */}
              <div>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleGoogleSignIn}
                  className="w-full py-2.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-xs hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>

              {/* OR Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
                  Or student credentials
                </span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              {/* Standard Email & Password Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Student Email / Username
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. yourname@student.uniosun.edu.ng or username"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => setMode('reset')}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-all shadow-md shadow-purple-600/20 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer"
                >
                  {loading ? 'Signing In...' : 'Sign In to CampusCore'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Personalized Saved Accounts on this Device */}
              {visibleSavedAccounts && visibleSavedAccounts.length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
                    <span>Saved accounts on this device:</span>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {visibleSavedAccounts.map((account) => {
                      return (
                        <div
                          key={account.id}
                          className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-2 hover:border-purple-300 dark:hover:border-purple-600 transition-colors group"
                        >
                          <button
                            type="button"
                            onClick={() => handleSavedAccountClick(account)}
                            className="flex items-center gap-2.5 truncate flex-1 text-left cursor-pointer"
                          >
                            <img
                              src={account.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                              alt={account.fullName}
                              className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-600"
                            />
                            <div className="truncate">
                              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                                {account.fullName}
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                {account.email || `@${account.username}`}
                              </div>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSavedAccount(account.id)}
                            title="Remove account from device"
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SIGNUP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dave Brown"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="e.g. davesbrown"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as AcademicLevel)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="100L">100 Level</option>
                    <option value="200L">200 Level</option>
                    <option value="300L">300 Level</option>
                    <option value="400L">400 Level</option>
                    <option value="500L">500 Level</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Student / Personal Email</label>
                <input
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="e.g. yourname@student.uniosun.edu.ng"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08012345678"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">WhatsApp Number</label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="08012345678"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Campus</label>
                  <select
                    value={campusId}
                    onChange={(e) => setCampusId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    {campuses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.location || 'Campus'})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Faculty / College</label>
                  <select
                    value={facultyId}
                    onChange={(e) => handleFacultyChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    {faculties.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Department / Programme</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Department not listed? Contact CampusCore Support.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Choose a strong password"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-all shadow-md shadow-purple-600/20 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 mt-3 cursor-pointer"
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* RESET PASSWORD */}
          {mode === 'reset' && (
            <div className="space-y-4">
              {resetSent ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-emerald-950 dark:text-emerald-200 text-sm">Reset Link Sent</h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    We sent a secure password reset token to <strong>{resetEmail}</strong>. Check your inbox or webmail.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setResetSent(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="e.g. yourname@student.uniosun.edu.ng"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-sm shadow-purple-600/20"
                    >
                      Send Reset Link
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
