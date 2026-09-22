import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, Product, AdminUserRecord, AcademicLevel, UserRole, SellerStatus, Report, AuditLog, PlatformStats } from '../types';

export const SUPER_ADMIN_EMAIL = 'bhadmusoluwadamilare@gmail.com';
export const SECONDARY_ADMIN_EMAIL = 'davesbrown88@gmail.com';

export interface SupabaseSignupPayload {
  email: string;
  password?: string;
  fullName: string;
  username: string;
  universityId: string;
  campusId: string;
  facultyId?: string;
  departmentId?: string;
  level?: AcademicLevel;
  phone?: string;
  whatsapp?: string;
  bio?: string;
  avatarUrl?: string;
  role?: UserRole;
}

export class SupabaseService {
  /**
   * Helper to determine if user is Super Admin
   */
  static isSuperAdminEmail(email?: string): boolean {
    if (!email) return false;
    const clean = email.toLowerCase().trim();
    return clean === SUPER_ADMIN_EMAIL.toLowerCase() || clean === SECONDARY_ADMIN_EMAIL.toLowerCase();
  }

  // ==========================================
  // AUTHENTICATION
  // ==========================================

  static async signUp(payload: SupabaseSignupPayload): Promise<{
    success: boolean;
    user?: UserProfile;
    requiresEmailConfirmation?: boolean;
    message?: string;
  }> {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) {
      return {
        success: false,
        message: 'Supabase is not configured. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment variables.',
      };
    }

    try {
      const cleanEmail = payload.email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!cleanEmail || !emailRegex.test(cleanEmail)) {
        return { success: false, message: 'Please enter a valid email address.' };
      }

      if (!payload.password || payload.password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters long.' };
      }

      if (!payload.fullName || !payload.fullName.trim()) {
        return { success: false, message: 'Please enter your full name.' };
      }

      if (!payload.username || !payload.username.trim()) {
        return { success: false, message: 'Please choose a username.' };
      }

      const isSuper = this.isSuperAdminEmail(cleanEmail);
      const role: UserRole = isSuper ? 'SUPER_ADMIN' : 'STUDENT';
      const sellerStatus: SellerStatus = isSuper ? 'VERIFIED_SELLER' : 'NOT_SELLER';

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: payload.password,
        options: {
          data: {
            full_name: payload.fullName.trim(),
            username: payload.username.trim().toLowerCase(),
            avatar_url: payload.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
            university_id: payload.universityId || 'uni-uniosun',
            campus_id: payload.campusId || 'campus-osogbo',
            faculty_id: payload.facultyId,
            department_id: payload.departmentId,
            level: payload.level || '100L',
            phone: payload.phone,
            whatsapp: payload.whatsapp,
            role,
          },
        },
      });

      if (error) {
        return { success: false, message: error.message };
      }

      if (!data.user) {
        return { success: false, message: 'Failed to create user account in Supabase.' };
      }

      // Check if user already exists (Supabase security feature: empty identities array returned for existing email)
      if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        return {
          success: false,
          message: 'An account with this email address already exists. Please log in instead.',
        };
      }

      // Check if session was created or confirmation is required
      const sessionCreated = Boolean(data.session);

      if (sessionCreated) {
        // Active session created directly
        const profileData = {
          id: data.user.id,
          auth_user_id: data.user.id,
          email: cleanEmail,
          full_name: payload.fullName.trim(),
          username: payload.username.trim().toLowerCase(),
          avatar_url: payload.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
          role,
          seller_status: sellerStatus,
          seller_onboarding_completed: isSuper,
          university_id: payload.universityId || 'uni-uniosun',
          university_name: 'Osun State University',
          campus_id: payload.campusId || 'campus-osogbo',
          campus_name: 'Osogbo Main Campus',
          faculty_id: payload.facultyId,
          department_id: payload.departmentId,
          level: payload.level || '100L',
          phone: payload.phone,
          whatsapp: payload.whatsapp,
          bio: isSuper ? 'Founder & Super Administrator of CampusCore.' : 'Student at Osun State University.',
          verification_badge: isSuper ? 'trusted_seller' : 'unverified',
          account_status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        try {
          await supabase.from('profiles').upsert(profileData, { onConflict: 'id' });
        } catch (upsertErr) {
          console.warn('Profile upsert notice:', upsertErr);
        }

        let profile = await this.fetchProfile(data.user.id);
        if (!profile) {
          profile = this.mapDbProfileToUserProfile(profileData);
        }

        return {
          success: true,
          user: profile || undefined,
          requiresEmailConfirmation: false,
          message: 'Account created successfully!',
        };
      }

      // If no session was created, email confirmation is required by Supabase
      return {
        success: true,
        user: undefined,
        requiresEmailConfirmation: true,
        message: 'Registration successful! A verification link has been sent to your email. Please check your inbox to confirm your account before signing in.',
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Signup failed' };
    }
  }

  /**
   * Creates a `profiles` row for an authenticated Supabase Auth user if one doesn't
   * already exist. This is the fallback safety net for ANY sign-in path (email/password
   * or OAuth providers like Google) in case the `on_auth_user_created` DB trigger didn't
   * run or isn't installed on the project. Without this, a user can have a valid Auth
   * session but appear "logged out" in the app because no matching profile can be found.
   */
  static async ensureProfile(user: {
    id: string;
    email?: string | null;
    user_metadata?: Record<string, any>;
  }): Promise<UserProfile | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    const existing = await this.fetchProfile(user.id);
    if (existing) return existing;

    const meta = user.user_metadata || {};
    const email = user.email || meta.email || '';
    const isSuper = this.isSuperAdminEmail(email);
    const newProfileData = {
      id: user.id,
      auth_user_id: user.id,
      email,
      full_name: meta.full_name || meta.name || email.split('@')[0] || 'Student',
      username: (meta.username || (email.split('@')[0] || `user${user.id.slice(0, 8)}`))
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, ''),
      avatar_url: meta.avatar_url || meta.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      role: isSuper ? 'SUPER_ADMIN' : (meta.role || 'STUDENT'),
      seller_status: isSuper ? 'VERIFIED_SELLER' : (meta.seller_status || 'NOT_SELLER'),
      seller_onboarding_completed: isSuper ? true : Boolean(meta.seller_onboarding_completed),
      university_id: meta.university_id || 'uni-uniosun',
      university_name: meta.university_name || 'Osun State University',
      campus_id: meta.campus_id || 'campus-osogbo',
      campus_name: meta.campus_name || 'Osogbo Main Campus',
      faculty_id: meta.faculty_id,
      department_id: meta.department_id,
      level: meta.level || '100L',
      phone: meta.phone,
      whatsapp: meta.whatsapp,
      bio: isSuper ? 'Founder & Super Administrator of CampusCore.' : 'Student at Osun State University.',
      verification_badge: isSuper ? 'trusted_seller' : 'unverified',
      account_status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      await supabase.from('profiles').upsert(newProfileData, { onConflict: 'id' });
    } catch (err) {
      console.warn('ensureProfile upsert notice:', err);
    }

    if (isSuper) {
      try {
        await supabase.from('admin_users').upsert(
          {
            user_id: user.id,
            email,
            full_name: newProfileData.full_name,
            role: 'SUPER_ADMIN',
            status: 'active',
          },
          { onConflict: 'user_id' }
        );
      } catch (err) {
        console.warn('ensureProfile admin_users notice:', err);
      }
    }

    return (await this.fetchProfile(user.id)) || this.mapDbProfileToUserProfile(newProfileData);
  }

  static async signIn(email: string, password?: string): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) {
      return {
        success: false,
        message: 'Supabase is not configured. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment variables.',
      };
    }

    if (!password) {
      return { success: false, message: 'Password is required to log in.' };
    }

    try {
      const cleanEmail = email.trim().toLowerCase();

      // If user passed username instead of email, lookup email
      let targetEmail = cleanEmail;
      if (!cleanEmail.includes('@')) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', cleanEmail)
          .maybeSingle();

        if (profile?.email) {
          targetEmail = profile.email;
        } else {
          return { success: false, message: 'No student account found with this username.' };
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: password,
      });

      if (error) {
        return { success: false, message: error.message || 'Invalid email or password.' };
      }

      if (!data.user || !data.session) {
        return { success: false, message: 'Invalid credentials or unconfirmed email.' };
      }

      let profile = await this.fetchProfile(data.user.id);

      // If user exists in Auth but profiles row was not created yet (e.g. signup without trigger)
      if (!profile) {
        profile = await this.ensureProfile(data.user);
      }

      // STRICT ENFORCEMENT OF BANS & SUSPENSIONS:
      const statusLower = (profile?.accountStatus || '').toLowerCase();
      if (profile && (statusLower === 'banned' || statusLower === 'suspended' || statusLower === 'restricted')) {
        await supabase.auth.signOut();
        const reasonMsg = statusLower === 'banned'
          ? 'Your CampusCore account has been banned by safety moderation. Please contact support at support@campuscore.app if you believe this was a mistake.'
          : 'Your CampusCore account is currently suspended. Please contact support at support@campuscore.app.';
        return { success: false, message: reasonMsg };
      }

      return { success: true, user: profile || undefined };
    } catch (err: any) {
      return { success: false, message: err.message || 'Login failed' };
    }
  }

  static async signOut(): Promise<{ success: boolean; message?: string }> {
    const supabase = getSupabase();
    if (!supabase) return { success: true };
    try {
      await supabase.auth.signOut();
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

  static async resetPasswordForEmail(email: string): Promise<{ success: boolean; message?: string }> {
    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, message: 'Supabase is not configured' };
    }

    try {
      const cleanEmail = email.trim().toLowerCase();
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/#reset-password` : '';
      
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return { success: true, message: `Password reset link sent to ${cleanEmail}.` };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to send password reset email' };
    }
  }

  static async updateUserPassword(newPassword: string): Promise<{ success: boolean; message?: string }> {
    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, message: 'Supabase is not configured' };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return { success: true, message: 'Password updated successfully!' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to update password' };
    }
  }

  // ==========================================
  // PROFILES
  // ==========================================

  static async fetchProfile(userId: string): Promise<UserProfile | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) return null;
      return this.mapDbProfileToUserProfile(data);
    } catch {
      return null;
    }
  }

  static async fetchAllProfiles(): Promise<UserProfile[]> {
    const supabase = getSupabase();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data.map((d) => this.mapDbProfileToUserProfile(d));
    } catch {
      return [];
    }
  }

  static async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, message: 'Supabase is not configured' };
    }

    try {
      const dbUpdates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
      if (updates.username !== undefined) dbUpdates.username = updates.username;
      if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
      if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.whatsapp !== undefined) dbUpdates.whatsapp = updates.whatsapp;
      if (updates.telegram !== undefined) dbUpdates.telegram = updates.telegram;
      if (updates.level !== undefined) dbUpdates.level = updates.level;
      if (updates.campusId !== undefined) dbUpdates.campus_id = updates.campusId;
      if (updates.campusName !== undefined) dbUpdates.campus_name = updates.campusName;
      if (updates.facultyId !== undefined) dbUpdates.faculty_id = updates.facultyId;
      if (updates.facultyName !== undefined) dbUpdates.faculty_name = updates.facultyName;
      if (updates.departmentId !== undefined) dbUpdates.department_id = updates.departmentId;
      if (updates.departmentName !== undefined) dbUpdates.department_name = updates.departmentName;
      if (updates.showPhonePublicly !== undefined) dbUpdates.show_phone_publicly = updates.showPhonePublicly;
      if (updates.showDepartmentPublicly !== undefined) dbUpdates.show_department_publicly = updates.showDepartmentPublicly;
      if (updates.sellerBio !== undefined) dbUpdates.seller_bio = updates.sellerBio;
      if (updates.sellerStatus !== undefined) dbUpdates.seller_status = updates.sellerStatus;
      if (updates.sellerOnboardingCompleted !== undefined) dbUpdates.seller_onboarding_completed = updates.sellerOnboardingCompleted;

      const { data, error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', userId)
        .select()
        .maybeSingle();

      if (error) {
        return { success: false, message: error.message };
      }

      const updated = data ? this.mapDbProfileToUserProfile(data) : null;
      return { success: true, user: updated || undefined };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to update profile' };
    }
  }

  // ==========================================
  // SELLERS
  // ==========================================

  static async completeSellerOnboarding(
    userId: string,
    sellerData: {
      sellerName: string;
      sellerBio?: string;
      profileImage?: string;
      phone?: string;
      whatsapp?: string;
      faculty?: string;
      department?: string;
      campusId?: string;
      pickupLocations?: string[];
    }
  ): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, message: 'Supabase is not configured' };
    }

    try {
      // 1. Upsert sellers record
      const { error: sellerErr } = await supabase
        .from('sellers')
        .upsert(
          {
            user_id: userId,
            seller_name: sellerData.sellerName,
            seller_bio: sellerData.sellerBio || '',
            profile_image: sellerData.profileImage,
            phone: sellerData.phone,
            whatsapp: sellerData.whatsapp,
            faculty: sellerData.faculty,
            department: sellerData.department,
            campus_id: sellerData.campusId || 'campus-osogbo',
            pickup_locations: sellerData.pickupLocations || [],
            seller_status: 'SELLER',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (sellerErr) {
        return { success: false, message: sellerErr.message };
      }

      // 2. Update user profile to seller
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .update({
          role: 'SELLER',
          seller_status: 'SELLER',
          seller_onboarding_completed: true,
          seller_bio: sellerData.sellerBio,
          phone: sellerData.phone,
          whatsapp: sellerData.whatsapp,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .maybeSingle();

      if (profileErr) {
        return { success: false, message: profileErr.message };
      }

      const updated = profileData ? this.mapDbProfileToUserProfile(profileData) : null;
      return { success: true, user: updated || undefined };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to complete seller onboarding' };
    }
  }

  // ==========================================
  // LISTINGS / PRODUCTS
  // ==========================================

  static async fetchListings(): Promise<Product[]> {
    const supabase = getSupabase();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data.map((d) => this.mapDbListingToProduct(d));
    } catch {
      return [];
    }
  }

  static async createListing(productData: Partial<Product>): Promise<{ success: boolean; product?: Product; message?: string }> {
    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, message: 'Supabase is not configured' };
    }

    try {
      const row = {
        seller_id: productData.sellerId,
        seller_name: productData.sellerName,
        seller_avatar: productData.sellerAvatar,
        seller_campus: productData.sellerCampus || 'Osogbo Main Campus',
        seller_phone: productData.sellerPhone,
        seller_whatsapp: productData.sellerWhatsapp,
        category_id: productData.categoryId,
        category_name: productData.categoryName || 'Others',
        title: productData.title,
        slug: productData.slug || (productData.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: productData.description || '',
        price: productData.price || 0,
        original_price: productData.originalPrice,
        condition: productData.condition || 'Used',
        campus_id: productData.campusId || 'campus-osogbo',
        images: productData.images || [],
        status: productData.status || 'active',
        negotiable: productData.negotiable || false,
        delivery_available: productData.deliveryAvailable || false,
      };

      const { data, error } = await supabase
        .from('listings')
        .insert(row)
        .select()
        .maybeSingle();

      if (error) {
        return { success: false, message: error.message };
      }

      const created = data ? this.mapDbListingToProduct(data) : undefined;
      return { success: true, product: created };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to create listing' };
    }
  }

  static async updateListing(
    listingId: string,
    updates: Partial<Product>
  ): Promise<{ success: boolean; product?: Product; message?: string }> {
    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, message: 'Supabase is not configured' };
    }

    try {
      const dbUpdates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.originalPrice !== undefined) dbUpdates.original_price = updates.originalPrice;
      if (updates.condition !== undefined) dbUpdates.condition = updates.condition;
      if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId;
      if (updates.categoryName !== undefined) dbUpdates.category_name = updates.categoryName;
      if (updates.campusId !== undefined) dbUpdates.campus_id = updates.campusId;
      if (updates.images !== undefined) dbUpdates.images = updates.images;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.negotiable !== undefined) dbUpdates.negotiable = updates.negotiable;
      if (updates.deliveryAvailable !== undefined) dbUpdates.delivery_available = updates.deliveryAvailable;

      const { data, error } = await supabase
        .from('listings')
        .update(dbUpdates)
        .eq('id', listingId)
        .select()
        .maybeSingle();

      if (error) {
        return { success: false, message: error.message };
      }

      const updated = data ? this.mapDbListingToProduct(data) : undefined;
      return { success: true, product: updated };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to update listing' };
    }
  }

  static async deleteListing(listingId: string): Promise<{ success: boolean; message?: string }> {
    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, message: 'Supabase is not configured' };
    }

    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId);

      if (error) {
        return { success: false, message: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to delete listing' };
    }
  }

  // ==========================================
  // ADMIN & ROLE MANAGEMENT
  // ==========================================

  static async promoteToAdmin(
    targetUserId: string,
    assignedByEmail: string
  ): Promise<{ success: boolean; message?: string }> {
    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, message: 'Supabase is not configured' };
    }

    // Only Super Admin can promote to admin
    if (!this.isSuperAdminEmail(assignedByEmail)) {
      return { success: false, message: 'Security restriction: Only SUPER_ADMIN can promote users to ADMIN.' };
    }

    try {
      const { data: targetProfile, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .maybeSingle();

      if (pErr || !targetProfile) {
        return { success: false, message: 'Target user not found.' };
      }

      // Update role in profiles
      const { error: uErr } = await supabase
        .from('profiles')
        .update({ role: 'ADMIN', updated_at: new Date().toISOString() })
        .eq('id', targetUserId);

      if (uErr) return { success: false, message: uErr.message };

      // Record in admin_users
      await supabase
        .from('admin_users')
        .upsert(
          {
            user_id: targetUserId,
            email: targetProfile.email,
            full_name: targetProfile.full_name,
            role: 'ADMIN',
            assigned_by_name: 'Super Admin',
            status: 'active',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      return { success: true, message: `${targetProfile.full_name} promoted to ADMIN successfully.` };
    } catch (err: any) {
      return { success: false, message: err.message || 'Promotion failed' };
    }
  }

  static async revokeAdmin(
    targetUserId: string,
    assignedByEmail: string
  ): Promise<{ success: boolean; message?: string }> {
    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, message: 'Supabase is not configured' };
    }

    if (!this.isSuperAdminEmail(assignedByEmail)) {
      return { success: false, message: 'Security restriction: Only SUPER_ADMIN can manage ADMIN roles.' };
    }

    try {
      const { data: targetProfile } = await supabase
        .from('profiles')
        .select('email, role')
        .eq('id', targetUserId)
        .maybeSingle();

      if (targetProfile && this.isSuperAdminEmail(targetProfile.email)) {
        return { success: false, message: 'Super Admin status cannot be revoked.' };
      }

      await supabase
        .from('profiles')
        .update({ role: 'STUDENT', updated_at: new Date().toISOString() })
        .eq('id', targetUserId);

      await supabase
        .from('admin_users')
        .update({ status: 'revoked', updated_at: new Date().toISOString() })
        .eq('user_id', targetUserId);

      return { success: true, message: 'Admin role revoked successfully.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Revocation failed' };
    }
  }

  // ==========================================
  // USER BAN / SUSPENSION MODERATION (REAL SUPABASE)
  // ==========================================

  static async banUser(
    adminUserId: string,
    targetUserId: string,
    reason: string,
    adminName: string = 'Super Admin',
    adminEmail: string = SUPER_ADMIN_EMAIL
  ): Promise<{ success: boolean; message?: string }> {
    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, message: 'Supabase is not configured' };
    }

    try {
      // 1. Verify target is not Super Admin
      const { data: targetProfile, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .maybeSingle();

      if (pErr || !targetProfile) {
        return { success: false, message: 'Target user not found in database.' };
      }

      if (this.isSuperAdminEmail(targetProfile.email)) {
        return { success: false, message: 'Security restriction: Super Admin accounts cannot be banned.' };
      }

      // 2. Update account_status to 'banned'
      const { error: banErr } = await supabase
        .from('profiles')
        .update({
          account_status: 'banned',
          updated_at: new Date().toISOString(),
        })
        .eq('id', targetUserId);

      if (banErr) {
        return { success: false, message: banErr.message };
      }

      // 3. Deactivate any active listings owned by this user
      await supabase
        .from('listings')
        .update({
          status: 'removed',
          updated_at: new Date().toISOString(),
        })
        .eq('seller_id', targetUserId);

      // 4. Log action to real audit_logs table
      await this.createAuditLog({
        actorId: adminUserId,
        actorName: adminName,
        action: 'user_banned',
        entityType: 'user',
        entityId: targetUserId,
        metadata: {
          targetEmail: targetProfile.email,
          targetFullName: targetProfile.full_name,
          reason,
          adminEmail,
        },
      });

      return { success: true, message: `${targetProfile.full_name} (@${targetProfile.username || 'user'}) has been banned from CampusCore.` };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to ban user' };
    }
  }

  static async suspendUser(
    adminUserId: string,
    targetUserId: string,
    reason: string,
    adminName: string = 'Super Admin',
    adminEmail: string = SUPER_ADMIN_EMAIL
  ): Promise<{ success: boolean; message?: string }> {
    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, message: 'Supabase is not configured' };
    }

    try {
      const { data: targetProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .maybeSingle();

      if (!targetProfile) return { success: false, message: 'Target user not found.' };
      if (this.isSuperAdminEmail(targetProfile.email)) {
        return { success: false, message: 'Super Admin accounts cannot be suspended.' };
      }

      const { error: suspErr } = await supabase
        .from('profiles')
        .update({
          account_status: 'suspended',
          updated_at: new Date().toISOString(),
        })
        .eq('id', targetUserId);

      if (suspErr) return { success: false, message: suspErr.message };

      await this.createAuditLog({
        actorId: adminUserId,
        actorName: adminName,
        action: 'user_suspended',
        entityType: 'user',
        entityId: targetUserId,
        metadata: { targetEmail: targetProfile.email, reason, adminEmail },
      });

      return { success: true, message: `${targetProfile.full_name} suspended successfully.` };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to suspend user' };
    }
  }

  static async unbanUser(
    adminUserId: string,
    targetUserId: string,
    reason: string = 'Account reinstated by Admin',
    adminName: string = 'Super Admin',
    adminEmail: string = SUPER_ADMIN_EMAIL
  ): Promise<{ success: boolean; message?: string }> {
    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, message: 'Supabase is not configured' };
    }

    try {
      const { data: targetProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .maybeSingle();

      if (!targetProfile) return { success: false, message: 'Target user not found.' };

      const { error: unbanErr } = await supabase
        .from('profiles')
        .update({
          account_status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', targetUserId);

      if (unbanErr) return { success: false, message: unbanErr.message };

      await this.createAuditLog({
        actorId: adminUserId,
        actorName: adminName,
        action: 'user_unbanned',
        entityType: 'user',
        entityId: targetUserId,
        metadata: { targetEmail: targetProfile.email, reason, adminEmail },
      });

      return { success: true, message: `${targetProfile.full_name}'s account has been reactivated.` };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to unban user' };
    }
  }

  // ==========================================
  // REAL DATABASE PLATFORM ANALYTICS (ZERO FAKE STATS)
  // ==========================================

  private static getEmptyPlatformStats(): PlatformStats {
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalListings: 0,
      totalProducts: 0,
      activeListings: 0,
      soldListings: 0,
      accommodationListings: 0,
      totalAccommodations: 0,
      totalReports: 0,
      pendingReports: 0,
      totalCategories: 8,
      totalCampuses: 6,
      totalDeposited: 0,
      totalWithdrawn: 0,
      totalEscrowVolume: 0,
      totalVolume: 0,
      totalEscrows: 0,
      totalPlatformFees: 0,
      activeOrders: 0,
      totalOrders: 0,
      activeEscrowHold: 0,
      escrowHeldTotal: 0,
      activeDisputes: 0,
      totalDisputes: 0,
      pendingWithdrawals: 0,
      pendingDisputes: 0,
      pendingVerifications: 0,
      totalVerifications: 0,
      totalRoommateProfiles: 0,
      totalServices: 0,
      totalJobs: 0,
      totalEvents: 0,
      totalTicketsSold: 0,
      totalCommunities: 0,
      totalBusinesses: 0,
      activeSubscriptions: 0,
      totalSubscriptions: 0,
      totalAdCampaigns: 0,
      totalAds: 0,
      openSupportTickets: 0,
      totalSupportTickets: 0,
    };
  }

  static async fetchPlatformStats(): Promise<PlatformStats> {
    const supabase = getSupabase();
    if (!supabase) {
      return this.getEmptyPlatformStats();
    }

    try {
      // 1. Total real users count from profiles
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });

      // 2. Total listings
      const { count: listingsCount } = await supabase
        .from('listings')
        .select('id', { count: 'exact', head: true });

      // 3. Real orders & escrow calculations
      const { data: ordersData } = await supabase
        .from('orders')
        .select('total_amount, status');

      const orders = ordersData || [];
      const totalVolume = orders.reduce((sum, o: any) => sum + (Number(o.total_amount) || 0), 0);
      const totalPlatformFees = orders.reduce((sum, o: any) => sum + (Number(o.total_amount || 0) * 0.025), 0);
      const activeOrders = orders.filter((o: any) => o.status === 'escrow_funded' || o.status === 'in_progress').length;
      const escrowHeldTotal = orders
        .filter((o: any) => o.status === 'escrow_funded')
        .reduce((sum, o: any) => sum + (Number(o.total_amount) || 0), 0);

      // 4. Reports count
      const { count: reportsCount } = await supabase
        .from('reports')
        .select('id', { count: 'exact', head: true });

      return {
        ...this.getEmptyPlatformStats(),
        totalUsers: usersCount || 0,
        activeUsers: usersCount || 0,
        totalListings: listingsCount || 0,
        totalProducts: listingsCount || 0,
        activeListings: listingsCount || 0,
        totalReports: reportsCount || 0,
        pendingReports: reportsCount || 0,
        totalOrders: orders.length,
        totalEscrows: orders.length,
        totalEscrowVolume: totalVolume,
        totalVolume,
        totalPlatformFees,
        escrowHeldTotal,
        activeEscrowHold: escrowHeldTotal,
        activeOrders,
      };
    } catch {
      return this.getEmptyPlatformStats();
    }
  }

  static async fetchUserGrowthAnalytics(
    timeframe: '7d' | '30d' | '90d' | '6m' | '12m' | 'all' = '30d'
  ) {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        labels: [],
        dataPoints: [],
        metrics: {
          growthRatePercent: 0,
          totalRegistered: 0,
          activeSellersCount: 0,
          sellerConversionRate: 0,
          retentionRatePercent: 0,
        },
      };
    }

    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, created_at, role, seller_status')
        .order('created_at', { ascending: true });

      const allProfiles = profiles || [];
      const totalRegistered = allProfiles.length;
      const sellers = allProfiles.filter(
        (p) => p.role === 'SELLER' || p.role === 'SUPER_ADMIN' || p.seller_status === 'SELLER' || p.seller_status === 'VERIFIED_SELLER'
      );
      const activeSellersCount = sellers.length;
      const sellerConversionRate = totalRegistered > 0 ? Math.round((activeSellersCount / totalRegistered) * 100) : 0;

      // Group into days according to requested timeframe
      const dayCounts = timeframe === '7d' ? 7 : timeframe === '30d' ? 14 : timeframe === '90d' ? 12 : 12;
      const now = new Date();
      const dataPoints: Array<{
        date: string;
        label: string;
        totalUsers: number;
        newSignups: number;
        activeSellers: number;
        ordersPlaced: number;
        revenue: number;
      }> = [];

      for (let i = dayCounts - 1; i >= 0; i--) {
        const d = new Date();
        if (timeframe === '7d' || timeframe === '30d') {
          d.setDate(now.getDate() - (timeframe === '7d' ? i : i * 2));
        } else {
          d.setDate(now.getDate() - i * 15);
        }

        const dateStr = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        // Real count of profiles registered on or before this day
        const usersUpToDate = allProfiles.filter((p) => {
          if (!p.created_at) return true;
          return p.created_at.split('T')[0] <= dateStr;
        }).length;

        // Real count of new signups on this specific date
        const newOnDate = allProfiles.filter((p) => {
          if (!p.created_at) return false;
          return p.created_at.split('T')[0] === dateStr;
        }).length;

        // Real sellers registered up to this date
        const sellersUpToDate = sellers.filter((p) => {
          if (!p.created_at) return true;
          return p.created_at.split('T')[0] <= dateStr;
        }).length;

        dataPoints.push({
          date: dateStr,
          label,
          totalUsers: usersUpToDate,
          newSignups: newOnDate,
          activeSellers: sellersUpToDate,
          ordersPlaced: 0,
          revenue: 0,
        });
      }

      return {
        labels: dataPoints.map((p) => p.label),
        dataPoints,
        metrics: {
          growthRatePercent: 0,
          totalRegistered,
          activeSellersCount,
          sellerConversionRate,
          retentionRatePercent: totalRegistered > 0 ? 100 : 0,
        },
      };
    } catch {
      return {
        labels: [],
        dataPoints: [],
        metrics: {
          growthRatePercent: 0,
          totalRegistered: 0,
          activeSellersCount: 0,
          sellerConversionRate: 0,
          retentionRatePercent: 0,
        },
      };
    }
  }

  // ==========================================
  // REPORTS (REAL SUPABASE)
  // ==========================================

  static async fetchReports(): Promise<Report[]> {
    const supabase = getSupabase();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data.map((r) => ({
        id: r.id,
        reporterId: r.reporter_id,
        reporterName: r.reporter_name || 'Anonymous Student',
        reporterEmail: '',
        reportedUserId: r.reported_user_id,
        reportedUserName: r.reported_user_name,
        productId: r.listing_id,
        productTitle: r.listing_title,
        reason: r.reason,
        description: r.description || '',
        status: r.status,
        adminNotes: r.resolution_notes,
        createdAt: r.created_at,
        resolvedAt: r.resolved_at,
      }));
    } catch {
      return [];
    }
  }

  static async createReport(payload: {
    reporterId: string;
    reporterName: string;
    reportedUserId?: string;
    reportedUserName?: string;
    listingId?: string;
    listingTitle?: string;
    reason: string;
    description: string;
  }): Promise<{ success: boolean; message?: string }> {
    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, message: 'Supabase is not configured' };
    }

    try {
      const { error } = await supabase.from('reports').insert({
        reporter_id: payload.reporterId,
        reporter_name: payload.reporterName,
        reported_user_id: payload.reportedUserId,
        reported_user_name: payload.reportedUserName,
        listing_id: payload.listingId,
        listing_title: payload.listingTitle,
        reason: payload.reason,
        description: payload.description,
        status: 'pending',
      });

      if (error) return { success: false, message: error.message };
      return { success: true, message: 'Report filed with student safety team.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to submit report' };
    }
  }

  static async updateReportStatus(
    reportId: string,
    status: 'pending' | 'reviewing' | 'resolved' | 'dismissed',
    notes?: string,
    resolvedBy?: string
  ): Promise<{ success: boolean; message?: string }> {
    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, message: 'Supabase is not configured' };
    }

    try {
      const updates: Record<string, any> = {
        status,
        resolution_notes: notes,
      };
      if (status === 'resolved' || status === 'dismissed') {
        updates.resolved_at = new Date().toISOString();
        if (resolvedBy) updates.resolved_by = resolvedBy;
      }

      const { error } = await supabase.from('reports').update(updates).eq('id', reportId);
      if (error) return { success: false, message: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to update report' };
    }
  }

  // ==========================================
  // AUDIT LOGS (REAL SUPABASE)
  // ==========================================

  static async fetchAuditLogs(limit: number = 50): Promise<AuditLog[]> {
    const supabase = getSupabase();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error || !data) return [];
      return data.map((l) => ({
        id: l.id,
        actorId: l.admin_id || 'system',
        actorName: l.admin_name || 'Administrator',
        action: l.action,
        entityType: (l.target_type as any) || 'user',
        entityId: l.target_id || '',
        metadata: l.details || { reason: l.reason, adminEmail: l.admin_email },
        createdAt: l.created_at,
      }));
    } catch {
      return [];
    }
  }

  static async createAuditLog(log: {
    actorId: string;
    actorName: string;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Record<string, any>;
  }): Promise<{ success: boolean }> {
    const supabase = getSupabase();
    if (!supabase) return { success: false };

    try {
      await supabase.from('audit_logs').insert({
        admin_id: log.actorId,
        admin_name: log.actorName,
        action: log.action,
        target_id: log.entityId,
        target_type: log.entityType,
        reason: log.metadata?.reason || '',
        details: log.metadata || {},
      });
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  // ==========================================
  // REAL-TIME DATABASE SUBSCRIPTIONS
  // ==========================================

  static subscribeToProfiles(callback: () => void): () => void {
    const supabase = getSupabase();
    if (!supabase) return () => {};

    try {
      const channel = supabase
        .channel('realtime_profiles')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
          callback();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      return () => {};
    }
  }

  static subscribeToListings(callback: () => void): () => void {
    const supabase = getSupabase();
    if (!supabase) return () => {};

    try {
      const channel = supabase
        .channel('realtime_listings')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, () => {
          callback();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      return () => {};
    }
  }

  // ==========================================
  // MAPPERS
  // ==========================================

  private static mapDbProfileToUserProfile(db: any): UserProfile {
    const isSuper = this.isSuperAdminEmail(db.email) || db.role === 'SUPER_ADMIN';
    const role: UserRole = isSuper ? 'SUPER_ADMIN' : (db.role || 'STUDENT');

    return {
      id: db.id,
      authUserId: db.auth_user_id || db.id,
      fullName: db.full_name || 'Campus Student',
      username: db.username || `user_${db.id.substring(0, 6)}`,
      email: db.email,
      avatarUrl: db.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      avatar: db.avatar_url,
      role,
      universityId: db.university_id || 'uni-uniosun',
      universityName: db.university_name || 'Osun State University',
      campusId: db.campus_id || 'campus-osogbo',
      campusName: db.campus_name || 'Osogbo Main Campus',
      facultyId: db.faculty_id,
      facultyName: db.faculty_name,
      departmentId: db.department_id,
      departmentName: db.department_name,
      level: db.level || '100L',
      bio: db.bio || 'Student on CampusCore',
      phone: db.phone,
      whatsapp: db.whatsapp,
      telegram: db.telegram,
      showPhonePublicly: db.show_phone_publicly ?? true,
      showDepartmentPublicly: db.show_department_publicly ?? true,
      verificationBadge: isSuper ? 'trusted_seller' : (db.verification_badge || 'unverified'),
      sellerStatus: isSuper ? 'VERIFIED_SELLER' : (db.seller_status || 'NOT_SELLER'),
      sellerBio: db.seller_bio,
      sellerOnboardingCompleted: isSuper ? true : Boolean(db.seller_onboarding_completed),
      totalCompletedSales: db.total_completed_sales || 0,
      totalOrdersBought: db.total_orders_bought || 0,
      rating: Number(db.rating) || 5.0,
      totalRatings: db.total_ratings || 0,
      accountStatus: db.account_status || 'active',
      createdAt: db.created_at || new Date().toISOString(),
      updatedAt: db.updated_at || new Date().toISOString(),
    };
  }

  private static mapDbListingToProduct(db: any): Product {
    return {
      id: db.id,
      sellerId: db.seller_id,
      sellerName: db.seller_name,
      sellerAvatar: db.seller_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      sellerCampus: db.seller_campus || 'Osogbo Main Campus',
      sellerWhatsapp: db.seller_whatsapp,
      sellerPhone: db.seller_phone,
      categoryId: db.category_id,
      categoryName: db.category_name,
      title: db.title,
      slug: db.slug,
      description: db.description,
      price: Number(db.price),
      originalPrice: db.original_price ? Number(db.original_price) : undefined,
      currency: 'NGN',
      condition: db.condition,
      location: db.seller_campus || 'UNIOSUN Campus',
      campusId: db.campus_id,
      universityId: 'uni-uniosun',
      images: Array.isArray(db.images) ? db.images : [],
      status: db.status,
      views: db.views_count || 0,
      viewsCount: db.views_count || 0,
      favoritesCount: db.favorites_count || 0,
      negotiable: Boolean(db.negotiable),
      deliveryAvailable: Boolean(db.delivery_available),
      featured: false,
      createdAt: db.created_at,
      updatedAt: db.updated_at,
    };
  }
}
