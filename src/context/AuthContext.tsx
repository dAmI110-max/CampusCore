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
  signup: (data: SignupData) => Promise<{ success: boolean; message?: string }>;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [demoUsers, setDemoUsers] = useState<UserProfile[]>([]);
  const [savedAccounts, setSavedAccounts] = useState<UserProfile[]>([]);
  const isSupabaseConnected = isSupabaseConfigured();

  const refreshUser = useCallback(() => {
    StorageService.initialize();
    const user = StorageService.getCurrentUser();
    setCurrentUser(user);
    setDemoUsers(StorageService.getUsers());
    setSavedAccounts(StorageService.getSavedAccounts());
    setIsLoading(false);
  }, []);

  // Initialize session & Supabase auth listener
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      const client = getSupabase();
      if (client && isSupabaseConfigured()) {
        try {
          const { data: sessionData } = await client.auth.getSession();
          if (sessionData?.session?.user && mounted) {
            const profile = await SupabaseService.fetchProfile(sessionData.session.user.id);
            if (profile) {
              if (profile.accountStatus === 'banned' || profile.accountStatus === 'suspended') {
                await client.auth.signOut();
                setCurrentUser(null);
                StorageService.setCurrentUser(null);
                setIsLoading(false);
                return;
              }
              setCurrentUser(profile);
              StorageService.updateUser(profile.id, profile);
              StorageService.setCurrentUser(profile.id);
            }
          } else {
            refreshUser();
          }
        } catch {
          refreshUser();
        }
      } else {
        refreshUser();
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
          const profile = await SupabaseService.fetchProfile(session.user.id);
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
          }
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          StorageService.setCurrentUser(null);
        } else if (event === 'USER_UPDATED' && session?.user) {
          const profile = await SupabaseService.fetchProfile(session.user.id);
          if (profile) {
            if (profile.accountStatus === 'banned' || profile.accountStatus === 'suspended') {
              await client.auth.signOut();
              setCurrentUser(null);
              StorageService.setCurrentUser(null);
              return;
            }
            setCurrentUser(profile);
          }
        }
      });
      authSubscription = subscription;
    }

    // Local storage event listener
    const handleStorageUpdate = () => {
      refreshUser();
    };

    window.addEventListener('campusplug_storage_update', handleStorageUpdate);
    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
      window.removeEventListener('campusplug_storage_update', handleStorageUpdate);
    };
  }, [refreshUser]);

  const login = async (email: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);

    // 1. Try Supabase Auth if configured
    if (isSupabaseConfigured()) {
      const res = await SupabaseService.signIn(email, password);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        StorageService.updateUser(res.user.id, res.user);
        StorageService.setCurrentUser(res.user.id);
        StorageService.addSavedAccount(res.user);
        setSavedAccounts(StorageService.getSavedAccounts());
        setIsLoading(false);
        return { success: true };
      } else if (!res.success && password) {
        // If password was supplied to Supabase and failed, return error
        setIsLoading(false);
        return { success: false, message: res.message || 'Invalid email or password.' };
      }
    }

    // 2. Fallback to storage users
    await new Promise((resolve) => setTimeout(resolve, 250));
    const users = StorageService.getUsers();
    const clean = email.toLowerCase().trim();
    let user = users.find((u) => u.email.toLowerCase() === clean || u.username.toLowerCase() === clean);

    // Check if this is the super admin email logging in
    const isSuperAdminEmail = clean === SUPER_ADMIN_EMAIL.toLowerCase() || clean === SECONDARY_ADMIN_EMAIL.toLowerCase();

    if (!user && isSuperAdminEmail) {
      user = StorageService.createUser({
        fullName: clean.includes('damilare') ? 'Oluwadamilare Bhadmus' : 'Dave Brown',
        username: clean.split('@')[0],
        email: clean,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        role: 'SUPER_ADMIN',
        sellerStatus: 'VERIFIED_SELLER',
        sellerOnboardingCompleted: true,
        universityId: 'uni-uniosun',
        universityName: 'Osun State University',
        campusId: 'campus-osogbo',
        campusName: 'Osogbo Main Campus',
        facultyId: 'fac-computing',
        facultyName: 'Faculty of Computing and Information Technology (FOCIT)',
        departmentId: 'dept-comp-cs',
        departmentName: 'Computer Science',
        level: 'Postgraduate',
        bio: 'Founder & Super Administrator of CampusCore by Ace Tech.',
        phone: '+2348012345678',
        whatsapp: '2348012345678',
        showPhonePublicly: true,
        showDepartmentPublicly: true,
        verificationBadge: 'trusted_seller',
        accountStatus: 'active',
      });
    }

    if (!user) {
      setIsLoading(false);
      return { success: false, message: 'No account found with this email or username. Please check your credentials or create an account.' };
    }

    if (user.accountStatus === 'suspended' || user.accountStatus === 'banned' || user.accountStatus === 'SUSPENDED') {
      setIsLoading(false);
      return { success: false, message: 'This account has been suspended by CampusCore safety moderation.' };
    }

    // Ensure Super Admin privileges if email matches
    if (isSuperAdminEmail && user.role !== 'SUPER_ADMIN') {
      const updated = StorageService.updateUser(user.id, {
        role: 'SUPER_ADMIN',
        sellerStatus: 'VERIFIED_SELLER',
        sellerOnboardingCompleted: true,
      });
      if (updated) user = updated;
    }

    StorageService.setCurrentUser(user.id);
    StorageService.addSavedAccount(user);
    setCurrentUser(user);
    setSavedAccounts(StorageService.getSavedAccounts());
    setIsLoading(false);
    return { success: true };
  };

  const googleLogin = async (account?: {
    email: string;
    name?: string;
    avatarUrl?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const targetEmail = (account?.email || 'davesbrown88@gmail.com').toLowerCase().trim();
    const targetName = account?.name || (targetEmail.includes('damilare') ? 'Oluwadamilare Bhadmus' : 'Dave Brown');
    const targetAvatar =
      account?.avatarUrl ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';

    const users = StorageService.getUsers();
    let user = users.find((u) => u.email.toLowerCase() === targetEmail);

    const isSuperAdminEmail =
      targetEmail === SUPER_ADMIN_EMAIL.toLowerCase() ||
      targetEmail === SECONDARY_ADMIN_EMAIL.toLowerCase();

    if (!user) {
      const username = targetEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || `user_${Date.now()}`;
      user = StorageService.createUser({
        fullName: targetName,
        username: username,
        email: targetEmail,
        avatarUrl: targetAvatar,
        role: isSuperAdminEmail ? 'SUPER_ADMIN' : 'STUDENT',
        sellerStatus: isSuperAdminEmail ? 'VERIFIED_SELLER' : 'NOT_SELLER',
        sellerOnboardingCompleted: isSuperAdminEmail,
        universityId: 'uni-uniosun',
        universityName: 'Osun State University',
        campusId: 'campus-osogbo',
        campusName: 'Osogbo Main Campus',
        facultyId: 'fac-computing',
        facultyName: 'Faculty of Computing and Information Technology (FOCIT)',
        departmentId: 'dept-comp-cs',
        departmentName: 'Computer Science',
        level: '300L',
        bio: isSuperAdminEmail
          ? 'Founder & Super Administrator of CampusCore by Ace Tech.'
          : 'Student at Osun State University connected via Google.',
        phone: isSuperAdminEmail ? '+2348012345678' : undefined,
        whatsapp: isSuperAdminEmail ? '2348012345678' : undefined,
        showPhonePublicly: true,
        showDepartmentPublicly: true,
        rating: 5.0,
        totalRatings: 1,
        verificationBadge: isSuperAdminEmail ? 'trusted_seller' : 'verified_student',
        accountStatus: 'active',
      });
    } else {
      if (isSuperAdminEmail && user.role !== 'SUPER_ADMIN') {
        const updated = StorageService.updateUser(user.id, {
          role: 'SUPER_ADMIN',
          sellerStatus: 'VERIFIED_SELLER',
          sellerOnboardingCompleted: true,
        });
        if (updated) user = updated;
      }
    }

    if (user.accountStatus === 'suspended' || user.accountStatus === 'banned') {
      setIsLoading(false);
      return { success: false, message: 'This Google account has been suspended by CampusCore safety moderation.' };
    }

    StorageService.setCurrentUser(user.id);
    StorageService.addSavedAccount(user);
    setCurrentUser(user);
    setSavedAccounts(StorageService.getSavedAccounts());
    setIsLoading(false);

    return {
      success: true,
      message: isSuperAdminEmail
        ? `Signed in as Super Administrator.`
        : `Signed in as ${user.fullName}`,
    };
  };

  const loginWithSavedAccount = async (userId: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 200));

    const user = StorageService.getUserById(userId);
    if (!user) {
      StorageService.removeSavedAccount(userId);
      setSavedAccounts(StorageService.getSavedAccounts());
      setIsLoading(false);
      return { success: false, message: 'Saved account not found.' };
    }

    if (user.accountStatus === 'suspended' || user.accountStatus === 'banned') {
      setIsLoading(false);
      return { success: false, message: 'This account has been suspended by safety moderation.' };
    }

    StorageService.setCurrentUser(user.id);
    StorageService.addSavedAccount(user);
    setCurrentUser(user);
    setSavedAccounts(StorageService.getSavedAccounts());
    setIsLoading(false);
    return { success: true };
  };

  const removeSavedAccount = (userId: string) => {
    StorageService.removeSavedAccount(userId);
    setSavedAccounts(StorageService.getSavedAccounts());
  };

  const signup = async (data: SignupData): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);

    const isSuperAdminEmail = SupabaseService.isSuperAdminEmail(data.email);

    // 1. Supabase Signup if configured
    if (isSupabaseConfigured()) {
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
        role: isSuperAdminEmail ? 'SUPER_ADMIN' : 'STUDENT',
      });

      if (!supaRes.success) {
        setIsLoading(false);
        return { success: false, message: supaRes.message };
      }

      if (supaRes.user) {
        StorageService.updateUser(supaRes.user.id, supaRes.user);
        StorageService.setCurrentUser(supaRes.user.id);
        StorageService.addSavedAccount(supaRes.user);
        setCurrentUser(supaRes.user);
        setDemoUsers(StorageService.getUsers());
        setSavedAccounts(StorageService.getSavedAccounts());
        setIsLoading(false);
        return { success: true };
      }

      if (supaRes.message && (supaRes.message.toLowerCase().includes('confirm') || supaRes.message.toLowerCase().includes('email') || supaRes.message.toLowerCase().includes('verification'))) {
        setIsLoading(false);
        return { success: true, message: supaRes.message };
      }
    }

    // 2. Also register in local storage cache for offline development
    const universities = StorageService.getUniversities();
    const campuses = StorageService.getCampuses();
    const faculties = StorageService.getFaculties();
    const departments = StorageService.getDepartments();

    const selectedUni = universities.find((u) => u.id === data.universityId);
    const selectedCampus = campuses.find((c) => c.id === data.campusId);
    const selectedFaculty = faculties.find((f) => f.id === data.facultyId);
    const selectedDept = departments.find((d) => d.id === data.departmentId);

    const newUser = StorageService.createUser({
      fullName: data.fullName,
      username: data.username.toLowerCase().trim(),
      email: data.email.toLowerCase().trim(),
      avatarUrl:
        data.avatarUrl ||
        `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80`,
      role: isSuperAdminEmail ? 'SUPER_ADMIN' : 'STUDENT',
      sellerStatus: isSuperAdminEmail ? 'VERIFIED_SELLER' : 'NOT_SELLER',
      sellerOnboardingCompleted: isSuperAdminEmail,
      universityId: data.universityId,
      universityName: selectedUni?.name || 'Osun State University',
      campusId: data.campusId,
      campusName: selectedCampus?.name || 'Osogbo Main Campus',
      facultyId: data.facultyId,
      facultyName: selectedFaculty?.name,
      departmentId: data.departmentId,
      departmentName: selectedDept?.name,
      level: data.level || '100L',
      bio: data.bio || 'Student on CampusCore.',
      phone: data.phone,
      whatsapp: data.whatsapp || (data.phone ? data.phone.replace(/[^0-9]/g, '') : undefined),
      telegram: data.telegram,
      showPhonePublicly: true,
      showDepartmentPublicly: true,
      rating: 5.0,
      totalRatings: 1,
      verificationBadge: isSuperAdminEmail ? 'trusted_seller' : 'unverified',
      accountStatus: 'active',
    });

    StorageService.createNotification({
      userId: newUser.id,
      title: 'Welcome to CampusCore!',
      message: `Welcome ${newUser.fullName}! You are registered under ${newUser.universityName} (${newUser.campusName}).`,
      type: 'system_announcement',
    });

    StorageService.addSavedAccount(newUser);
    setCurrentUser(newUser);
    setDemoUsers(StorageService.getUsers());
    setSavedAccounts(StorageService.getSavedAccounts());
    setIsLoading(false);
    return { success: true };
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      await SupabaseService.signOut();
    }
    StorageService.setCurrentUser(null);
    setCurrentUser(null);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message?: string }> => {
    if (isSupabaseConfigured()) {
      return await SupabaseService.resetPasswordForEmail(email);
    }
    // Fallback simulation
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { success: true, message: `Password reset link sent to ${email}.` };
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
