import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, AcademicLevel, UserRole, SellerStatus, AdminPermissions } from '../types';
import { StorageService } from '../services/storageService';
import { SupabaseService, SUPER_ADMIN_EMAIL, SECONDARY_ADMIN_EMAIL } from '../services/supabaseService';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

interface SignupData {
  fullName: string;
  username: string;
  email: string;
  password?: string;
  universityId: string;
  campusId: string;
  facultyId?: string;
  departmentId?: string;
  level?: AcademicLevel;
  phone?: string;
  whatsapp?: string;
  telegram?: string;
  bio?: string;
  avatarUrl?: string;
  role?: UserRole;
}

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isSeller: boolean;
  sellerStatus: SellerStatus;
  isLoading: boolean;
  savedAccounts: UserProfile[];
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  googleLogin: (account?: { email: string; name?: string; avatarUrl?: string }) => Promise<{ success: boolean; message?: string }>;
  loginWithSavedAccount: (userId: string) => Promise<{ success: boolean; message?: string }>;
  removeSavedAccount: (userId: string) => void;
  signup: (data: SignupData) => Promise<{ success: boolean; message?: string; requiresEmailConfirmation?: boolean }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; message?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; message?: string }>;
  completeSellerOnboarding: (data: {
    sellerBio?: string;
    sellerPickupLocations?: string[];
    phone?: string;
    whatsapp?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  hasAdminPermission: (permission: keyof AdminPermissions) => boolean;
  switchDemoUser: (userId: string) => void;
  demoUsers: UserProfile[];
  refreshUser: () => void;
  isSupabaseConnected: boolean;
  isPasswordRecovery: boolean;
  clearPasswordRecovery: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [demoUsers, setDemoUsers] = useState<UserProfile[]>([]);
  const [savedAccounts, setSavedAccounts] = useState<UserProfile[]>([]);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState<boolean>(() => {
    // Fallback in case the PASSWORD_RECOVERY event fires before this listener
    // attaches, or the SDK doesn't surface it in some edge case: also check the
    // URL directly for Supabase's recovery marker on first load.
    if (typeof window === 'undefined') return false;
    return window.location.pathname === '/reset-password' || window.location.hash.includes('type=recovery');
  });
  const isSupabaseConnected = isSupabaseConfigured();

  const refreshUser = useCallback(async () => {
    const client = getSupabase();
    if (client && isSupabaseConfigured()) {
      try {
        const { data: sessionData } = await client.auth.getSession();
        if (sessionData?.session?.user) {
          let profile = await SupabaseService.fetchProfile(sessionData.session.user.id);
          if (!profile) {
            profile = await SupabaseService.ensureProfile(sessionData.session.user);
          }
          if (profile) {
            if (profile.accountStatus === 'banned' || profile.accountStatus === 'suspended') {
              await client.auth.signOut();
              setCurrentUser(null);
              StorageService.setCurrentUser(null);
              return;
            }
            setCurrentUser(profile);
            StorageService.updateUser(profile.id, profile);
            StorageService.setCurrentUser(profile.id);
            return;
          }
        }
      } catch (err) {
        console.warn('refreshUser Supabase notice:', err);
      }
    }

    // Local user fallback (handles demo users, super admins and offline storage)
    const localUser = StorageService.getCurrentUser();
    if (localUser) {
      if (localUser.accountStatus === 'banned' || localUser.accountStatus === 'suspended') {
        setCurrentUser(null);
        StorageService.setCurrentUser(null);
        return;
      }
      setCurrentUser(localUser);
      return;
    }

    setCurrentUser(null);
    StorageService.setCurrentUser(null);
  }, []);

  // Initialize session & Supabase auth listener
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      // Seed default saved accounts & demo users immediately
      const saved = StorageService.getSavedAccounts();
      if (mounted) {
        setSavedAccounts(saved);
        setDemoUsers(StorageService.getUsers());
      }

      const client = getSupabase();
      if (client && isSupabaseConfigured()) {
        try {
          const { data: sessionData, error: sessionError } = await client.auth.getSession();
          if (sessionError) {
            console.warn('Session check:', sessionError.message);
          }
          if (sessionData?.session?.user && mounted) {
            let profile = await SupabaseService.fetchProfile(sessionData.session.user.id);
            if (!profile) {
              profile = await SupabaseService.ensureProfile(sessionData.session.user);
            }
            if (profile) {
              if (profile.accountStatus === 'banned' || profile.accountStatus === 'suspended') {
                await client.auth.signOut();
                if (mounted) {
                  setCurrentUser(null);
                  StorageService.setCurrentUser(null);
                  setIsLoading(false);
                }
                return;
              }
              if (mounted) {
                setCurrentUser(profile);
                StorageService.updateUser(profile.id, profile);
                StorageService.setCurrentUser(profile.id);
                StorageService.addSavedAccount(profile);
                setSavedAccounts(StorageService.getSavedAccounts());
              }
            }
          } else if (mounted) {
            const localUser = StorageService.getCurrentUser();
            if (localUser) {
              setCurrentUser(localUser);
            } else {
              setCurrentUser(null);
            }
          }
        } catch (err) {
          console.error('Auth initialization error:', err);
          if (mounted) {
            const localUser = StorageService.getCurrentUser();
            if (localUser) {
              setCurrentUser(localUser);
            } else {
              setCurrentUser(null);
            }
          }
        }
      } else if (mounted) {
        const localUser = StorageService.getCurrentUser();
        if (localUser) {
          setCurrentUser(localUser);
        } else {
          setCurrentUser(null);
        }
      }

      if (mounted) {
        setIsLoading(false);
      }
    }

    initAuth();

    // Supabase Auth State Change Listener
    const client = getSupabase();
    let authSubscription: { unsubscribe: () => void } | null = null;

    if (client && isSupabaseConfigured()) {
      const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          let profile = await SupabaseService.fetchProfile(session.user.id);
          if (!profile) {
            profile = await SupabaseService.ensureProfile(session.user);
          }
          if (profile && mounted) {
            if (profile.accountStatus === 'banned' || profile.accountStatus === 'suspended') {
              await client.auth.signOut();
              setCurrentUser(null);
              StorageService.setCurrentUser(null);
              return;
            }
            setCurrentUser(profile);
            StorageService.updateUser(profile.id, profile);
            StorageService.setCurrentUser(profile.id);
            StorageService.addSavedAccount(profile);
            setSavedAccounts(StorageService.getSavedAccounts());
          }
        } else if (event === 'PASSWORD_RECOVERY') {
          // Fired when the user lands here via the "reset password" email link.
          // Show the "set a new password" screen instead of silently doing nothing —
          // this is the missing piece that made the reset link look like it did nothing.
          if (mounted) setIsPasswordRecovery(true);
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            setCurrentUser(null);
            StorageService.setCurrentUser(null);
          }
        } else if (event === 'USER_UPDATED' && session?.user) {
          const profile = await SupabaseService.fetchProfile(session.user.id);
          if (profile && mounted) {
            if (profile.accountStatus === 'banned' || profile.accountStatus === 'suspended') {
              await client.auth.signOut();
              setCurrentUser(null);
              StorageService.setCurrentUser(null);
              return;
            }
            setCurrentUser(profile);
            StorageService.updateUser(profile.id, profile);
          }
        }
      });
      authSubscription = subscription;
    }

    // Local storage event listener - ONLY react if the current user ID was changed
    const handleStorageUpdate = (e: any) => {
      const key = e?.detail?.key;
      if (key === 'campuscore_current_user_id_v1') {
        refreshUser();
      }
    };

    window.addEventListener('campuscore_storage_update', handleStorageUpdate);
    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
      window.removeEventListener('campuscore_storage_update', handleStorageUpdate);
    };
  }, [refreshUser]);

  const login = async (email: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);

    if (!email || !email.trim()) {
      setIsLoading(false);
      return { success: false, message: 'Please enter your email or username.' };
    }

    if (!password) {
      setIsLoading(false);
      return { success: false, message: 'Password is required to sign in.' };
    }

    const res = await SupabaseService.signIn(email, password);
    setIsLoading(false);

    if (!res.success || !res.user) {
      return {
        success: false,
        message: res.message || 'Invalid email or password. Please check your credentials.',
      };
    }

    setCurrentUser(res.user);
    StorageService.updateUser(res.user.id, res.user);
    StorageService.setCurrentUser(res.user.id);
    StorageService.addSavedAccount(res.user);
    setSavedAccounts(StorageService.getSavedAccounts());
    return { success: true };
  };

  const googleLogin = async (): Promise<{ success: boolean; message?: string }> => {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        message: 'Supabase authentication is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.',
      };
    }

    const client = getSupabase();
    if (!client) {
      return { success: false, message: 'Supabase client is not available.' };
    }

    try {
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Google sign-in failed' };
    }
  };

  const loginWithSavedAccount = async (userId: string): Promise<{ success: boolean; message?: string }> => {
    const user = StorageService.getUserById(userId);
    if (!user) {
      return {
        success: false,
        message: 'Account not found on this device.',
      };
    }

    if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || StorageService.isSuperAdmin(user)) {
      return {
        success: false,
        message: 'Please enter your password to sign in to this administrator account.',
      };
    }

    if (user.accountStatus === 'banned' || user.accountStatus === 'suspended') {
      return {
        success: false,
        message: 'This account has been suspended or restricted.',
      };
    }

    setCurrentUser(user);
    StorageService.setCurrentUser(user.id);
    StorageService.addSavedAccount(user);
    setSavedAccounts(StorageService.getSavedAccounts());
    return { success: true };
  };

  const removeSavedAccount = (userId: string) => {
    StorageService.removeSavedAccount(userId);
    setSavedAccounts(StorageService.getSavedAccounts());
  };

  const signup = async (data: SignupData): Promise<{
    success: boolean;
    message?: string;
    requiresEmailConfirmation?: boolean;
  }> => {
    setIsLoading(true);

    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      return {
        success: false,
        message: 'Supabase authentication is not configured. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment variables.',
      };
    }

    if (!data.password || data.password.length < 6) {
      setIsLoading(false);
      return {
        success: false,
        message: 'Password must be at least 6 characters long.',
      };
    }

    const supaRes = await SupabaseService.signUp({
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      username: data.username,
      universityId: data.universityId,
      campusId: data.campusId,
      facultyId: data.facultyId,
      departmentId: data.departmentId,
      level: data.level,
      phone: data.phone,
      whatsapp: data.whatsapp,
      bio: data.bio,
      avatarUrl: data.avatarUrl,
    });

    setIsLoading(false);

    if (!supaRes.success) {
      return {
        success: false,
        message: supaRes.message || 'Signup failed. Please try again.',
      };
    }

    if (supaRes.requiresEmailConfirmation || !supaRes.user) {
      return {
        success: true,
        requiresEmailConfirmation: true,
        message: supaRes.message || 'Registration successful! Please check your email to verify your account before logging in.',
      };
    }

    // Authenticated session created immediately
    setCurrentUser(supaRes.user);
    StorageService.updateUser(supaRes.user.id, supaRes.user);
    StorageService.setCurrentUser(supaRes.user.id);
    StorageService.addSavedAccount(supaRes.user);
    setSavedAccounts(StorageService.getSavedAccounts());

    return {
      success: true,
      requiresEmailConfirmation: false,
      message: supaRes.message,
    };
  };

  const logout = async () => {
    setIsLoading(true);
    const client = getSupabase();
    if (client && isSupabaseConfigured()) {
      try {
        await client.auth.signOut();
      } catch (err) {
        console.warn('Sign out notice:', err);
      }
    }
    StorageService.setCurrentUser(null);
    setCurrentUser(null);
    setIsLoading(false);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message?: string }> => {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        message: 'Supabase authentication is not configured. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are configured.',
      };
    }
    return await SupabaseService.resetPasswordForEmail(email);
  };

  const updatePassword = async (newPassword: string): Promise<{ success: boolean; message?: string }> => {
    if (isSupabaseConfigured()) {
      return await SupabaseService.updateUserPassword(newPassword);
    }
    return { success: true, message: 'Password updated successfully.' };
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ success: boolean; message?: string }> => {
    if (!currentUser) return { success: false, message: 'You must be logged in to update your profile.' };

    // 1. Supabase update if configured
    if (isSupabaseConfigured()) {
      const supaRes = await SupabaseService.updateProfile(currentUser.id, updates);
      if (!supaRes.success) {
        return {
          success: false,
          message: supaRes.message || 'Unable to update your profile. Please try again.',
        };
      }
      if (supaRes.user) {
        updates = { ...updates, ...supaRes.user };
      }
    }

    // 2. Local update
    const updated = StorageService.updateUser(currentUser.id, updates);
    if (updated) {
      setCurrentUser(updated);
      setDemoUsers(StorageService.getUsers());
      return { success: true };
    }
    return { success: false, message: 'Failed to update profile.' };
  };

  const completeSellerOnboarding = async (data: {
    sellerBio?: string;
    sellerPickupLocations?: string[];
    phone?: string;
    whatsapp?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    if (!currentUser) return { success: false, message: 'Please sign in first.' };

    // 1. Supabase seller onboarding
    if (isSupabaseConfigured()) {
      await SupabaseService.completeSellerOnboarding(currentUser.id, {
        sellerName: currentUser.fullName,
        sellerBio: data.sellerBio,
        profileImage: currentUser.avatarUrl,
        phone: data.phone || currentUser.phone,
        whatsapp: data.whatsapp || currentUser.whatsapp,
        faculty: currentUser.facultyName,
        department: currentUser.departmentName,
        campusId: currentUser.campusId,
        pickupLocations: data.sellerPickupLocations,
      });
    }

    // 2. Local storage seller onboarding
    const res = StorageService.completeSellerOnboarding(currentUser.id, data);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setDemoUsers(StorageService.getUsers());
      return { success: true, message: 'Seller profile activated! You can now create listings.' };
    }
    return { success: false, message: 'Failed to complete seller onboarding.' };
  };

  const switchDemoUser = (userId: string) => {
    const user = StorageService.getUserById(userId);
    if (user) {
      StorageService.setCurrentUser(user.id);
      setCurrentUser(user);
    }
  };

  const isSuperAdmin =
    currentUser?.role === 'SUPER_ADMIN' ||
    SupabaseService.isSuperAdminEmail(currentUser?.email);

  const isAdmin =
    isSuperAdmin ||
    currentUser?.role === 'ADMIN' ||
    StorageService.isAdmin(currentUser);

  const sellerStatus: SellerStatus =
    currentUser?.sellerStatus ||
    (currentUser?.role === 'SELLER' || currentUser?.role === 'seller' ? 'SELLER' : isSuperAdmin ? 'VERIFIED_SELLER' : 'NOT_SELLER');

  const isSeller =
    sellerStatus === 'SELLER' ||
    sellerStatus === 'VERIFIED_SELLER' ||
    currentUser?.sellerOnboardingCompleted === true ||
    isSuperAdmin;

  const hasAdminPermission = (permission: keyof AdminPermissions): boolean => {
    if (!currentUser) return false;
    if (isSuperAdmin) return true;
    if (!isAdmin) return false;
    if (!currentUser.adminPermissions) return true;
    return !!currentUser.adminPermissions[permission];
  };

  const isAuthenticated = !!currentUser;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isSuperAdmin,
        isAdmin,
        isSeller,
        sellerStatus,
        isLoading,
        savedAccounts,
        login,
        googleLogin,
        loginWithSavedAccount,
        removeSavedAccount,
        signup,
        logout,
        resetPassword,
        updatePassword,
        updateProfile,
        completeSellerOnboarding,
        hasAdminPermission,
        switchDemoUser,
        demoUsers,
        refreshUser,
        isSupabaseConnected,
        isPasswordRecovery,
        clearPasswordRecovery: () => setIsPasswordRecovery(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
