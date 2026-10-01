import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const SUPER_ADMIN_EMAILS = [
  'bhadmusoluwadamilare@gmail.com',
  'davesbrown88@gmail.com',
];

function isSuperAdminEmail(email?: string): boolean {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export default async function adminUsersHandler(req: Request, res: Response) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !anonKey) {
    return res.status(500).json({
      success: false,
      error: 'Supabase URL and Anon Key are not configured in server environment.',
      data: [],
    });
  }

  // Verify caller authorization if authorization header provided
  const authHeader = req.headers.authorization;
  let callerEmail: string | undefined;
  let callerIsAdmin = false;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const authClient = createClient(supabaseUrl, anonKey);
      const { data: userData, error: userError } = await authClient.auth.getUser(token);
      if (!userError && userData?.user) {
        callerEmail = userData.user.email;
        callerIsAdmin = isSuperAdminEmail(callerEmail);
      }
    } catch (e) {
      // Failed to verify token
    }
  }

  // 1. If service role key is available, use privileged admin client
  if (serviceRoleKey && serviceRoleKey.length > 20) {
    try {
      const adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      // Fetch all auth users directly from Supabase Auth
      const { data: authUsersData, error: authUsersError } = await adminClient.auth.admin.listUsers();
      if (authUsersError) {
        console.error('admin.listUsers error:', authUsersError.message);
      }

      const authUsers = authUsersData?.users || [];

      // Also fetch public.profiles if table exists
      let dbProfiles: any[] = [];
      let isTableMissing = false;
      const { data: profilesData, error: profilesError } = await adminClient
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        if (profilesError.code === 'PGRST205' || profilesError.message.includes('schema cache')) {
          isTableMissing = true;
        }
      } else {
        dbProfiles = profilesData || [];
      }

      // Map combined list: Every user in auth.users MUST appear
      const profileMap = new Map(dbProfiles.map((p) => [p.id, p]));

      const combinedUsers = authUsers.map((u) => {
        const p = profileMap.get(u.id);
        const meta = u.user_metadata || {};
        const email = u.email || p?.email || '';
        const isSuper = isSuperAdminEmail(email);

        const fullName = p?.full_name || meta.full_name || meta.name || email.split('@')[0] || 'Campus Student';
        const username = p?.username || meta.username || email.split('@')[0] || `user_${u.id.substring(0, 6)}`;
        const campusId = p?.campus_id || meta.campus_id || 'campus-osogbo';
        const campusName = p?.campus_name || meta.campus_name || 'Osogbo Main Campus';
        const facultyId = p?.faculty_id || meta.faculty_id;
        const facultyName = p?.faculty_name || meta.faculty_name;
        const departmentId = p?.department_id || meta.department_id;
        const departmentName = p?.department_name || meta.department_name;
        const level = p?.level || meta.level || '100L';

        return {
          id: u.id,
          authUserId: u.id,
          fullName,
          username,
          email,
          avatarUrl: p?.avatar_url || meta.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
          role: isSuper ? 'SUPER_ADMIN' : (p?.role || meta.role || 'STUDENT'),
          universityId: p?.university_id || meta.university_id || 'uni-uniosun',
          universityName: p?.university_name || meta.university_name || 'Osun State University',
          campusId,
          campusName,
          facultyId,
          facultyName,
          departmentId,
          departmentName,
          level,
          bio: p?.bio || meta.bio || (isSuper ? 'Founder & Super Administrator of CampusCore.' : 'Student at Osun State University.'),
          phone: p?.phone || meta.phone,
          whatsapp: p?.whatsapp || meta.whatsapp,
          verificationBadge: isSuper ? 'trusted_seller' : (p?.verification_badge || 'unverified'),
          sellerStatus: isSuper ? 'VERIFIED_SELLER' : (p?.seller_status || 'NOT_SELLER'),
          sellerOnboardingCompleted: isSuper ? true : Boolean(p?.seller_onboarding_completed || meta.seller_onboarding_completed),
          accountStatus: p?.account_status || 'active',
          totalCompletedSales: p?.total_completed_sales || 0,
          totalOrdersBought: p?.total_orders_bought || 0,
          rating: Number(p?.rating) || 5.0,
          totalRatings: p?.total_ratings || 0,
          createdAt: u.created_at || p?.created_at || new Date().toISOString(),
          updatedAt: u.updated_at || p?.updated_at || new Date().toISOString(),
        };
      });

      return res.json({
        success: true,
        source: 'supabase_auth_and_profiles',
        totalUsers: combinedUsers.length,
        isTableMissing,
        data: combinedUsers,
      });
    } catch (err: any) {
      console.error('admin client error:', err);
    }
  }

  // 2. Standard client query against public.profiles
  try {
    const supabase = createClient(supabaseUrl, anonKey);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      const isMissing = error.code === 'PGRST205' || error.message.includes('schema cache');
      return res.status(isMissing ? 404 : 400).json({
        success: false,
        error: error.message,
        isTableMissing: isMissing,
        data: [],
      });
    }

    const mapped = (data || []).map((db: any) => {
      const isSuper = isSuperAdminEmail(db.email) || db.role === 'SUPER_ADMIN';
      return {
        id: db.id,
        authUserId: db.auth_user_id || db.id,
        fullName: db.full_name || 'Campus Student',
        username: db.username || `user_${db.id.substring(0, 6)}`,
        email: db.email,
        avatarUrl: db.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        role: isSuper ? 'SUPER_ADMIN' : (db.role || 'STUDENT'),
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
        verificationBadge: isSuper ? 'trusted_seller' : (db.verification_badge || 'unverified'),
        sellerStatus: isSuper ? 'VERIFIED_SELLER' : (db.seller_status || 'NOT_SELLER'),
        sellerOnboardingCompleted: isSuper ? true : Boolean(db.seller_onboarding_completed),
        accountStatus: db.account_status || 'active',
        createdAt: db.created_at || new Date().toISOString(),
        updatedAt: db.updated_at || new Date().toISOString(),
      };
    });

    return res.json({
      success: true,
      source: 'supabase_profiles',
      totalUsers: mapped.length,
      isTableMissing: false,
      data: mapped,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || 'Server error querying Supabase profiles',
      isTableMissing: false,
      data: [],
    });
  }
}
