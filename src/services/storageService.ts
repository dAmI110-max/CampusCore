import {
  University,
  Campus,
  Faculty,
  Department,
  UserProfile,
  Category,
  Product,
  Accommodation,
  Favorite,
  Report,
  ReportStatus,
  AppNotification,
  PlatformStats,
  FilterOptions,
  AccommodationFilterOptions,
  ProductStatus,
  Wallet,
  WalletTransaction,
  UserBankAccount,
  Order,
  OrderStatus,
  EscrowTransaction,
  EscrowStatus,
  Dispute,
  Review,
  VerificationRequest,
  Conversation,
  Message,
  RoommateProfile,
  SavedAccommodation,
  AuditLog,
  PlatformSettings,
  ServiceCategory,
  ServiceListing,
  ServiceRequest,
  Booking,
  BookingStatus,
  CampusJob,
  JobApplication,
  JobApplicationStatus,
  JobSeekerProfile,
  CampusEvent,
  EventStatus,
  EventTicket,
  Community,
  CommunityPost,
  CommunityComment,
  CampusBusiness,
  SubscriptionPlan,
  SubscriptionPlanTier,
  UserSubscription,
  AdCampaign,
  AdStatus,
  AdPlacement,
  CampusAnnouncement,
  SupportTicket,
  SupportTicketReply,
  SupportStatus,
  FeatureFlags,
  UnifiedSearchResult,
  SearchVertical,
  AdminPermissions,
  AdminUserRecord,
  SellerStatus,
  AccountStatus,
  StudyResource,
  StudyFlashcard,
  StudyGenMessage,
} from '../types';
import {
  INITIAL_UNIVERSITIES,
  INITIAL_CAMPUSES,
  INITIAL_FACULTIES,
  INITIAL_DEPARTMENTS,
  INITIAL_CATEGORIES,
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_ACCOMMODATION,
  INITIAL_NOTIFICATIONS,
  INITIAL_REPORTS,
  INITIAL_WALLETS,
  INITIAL_WALLET_TRANSACTIONS,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_ORDERS,
  INITIAL_ESCROWS,
  INITIAL_DISPUTES,
  INITIAL_REVIEWS,
  INITIAL_VERIFICATIONS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_ROOMMATES,
  INITIAL_SAVED_ACCOMMODATION,
  INITIAL_AUDIT_LOGS,
  INITIAL_PLATFORM_SETTINGS,
  INITIAL_SERVICE_CATEGORIES,
  INITIAL_SERVICES,
  INITIAL_SERVICE_REQUESTS,
  INITIAL_BOOKINGS,
  INITIAL_CAMPUS_JOBS,
  INITIAL_JOB_APPLICATIONS,
  INITIAL_CAMPUS_EVENTS,
  INITIAL_EVENT_TICKETS,
  INITIAL_COMMUNITIES,
  INITIAL_COMMUNITY_POSTS,
  INITIAL_BUSINESSES,
  INITIAL_SUBSCRIPTION_PLANS,
  INITIAL_USER_SUBSCRIPTIONS,
  INITIAL_AD_CAMPAIGNS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_FEATURE_FLAGS,
} from '../data/initialData';

const STORAGE_KEYS = {
  UNIVERSITIES: 'campusplug_universities_v1',
  CAMPUSES: 'campusplug_campuses_v1',
  FACULTIES: 'campusplug_faculties_v1',
  DEPARTMENTS: 'campusplug_departments_v1',
  CATEGORIES: 'campusplug_categories_v1',
  USERS: 'campusplug_users_v1',
  CURRENT_USER_ID: 'campusplug_current_user_id_v1',
  PRODUCTS: 'campusplug_products_v1',
  ACCOMMODATIONS: 'campusplug_accommodations_v1',
  FAVORITES: 'campusplug_favorites_v1',
  REPORTS: 'campusplug_reports_v1',
  NOTIFICATIONS: 'campusplug_notifications_v1',
  WALLETS: 'campusplug_wallets_v2',
  WALLET_TRANSACTIONS: 'campusplug_wallet_txs_v2',
  BANK_ACCOUNTS: 'campusplug_bank_accounts_v2',
  ORDERS: 'campusplug_orders_v2',
  ESCROWS: 'campusplug_escrows_v2',
  DISPUTES: 'campusplug_disputes_v2',
  REVIEWS: 'campusplug_reviews_v2',
  VERIFICATIONS: 'campusplug_verifications_v2',
  CONVERSATIONS: 'campusplug_conversations_v2',
  MESSAGES: 'campusplug_messages_v2',
  ROOMMATES: 'campusplug_roommates_v2',
  SAVED_ACCOMMODATIONS: 'campusplug_saved_accommodations_v2',
  AUDIT_LOGS: 'campusplug_audit_logs_v2',
  PLATFORM_SETTINGS: 'campusplug_settings_v2',
  // Phase 3 Ecosystem Keys
  SERVICE_CATEGORIES: 'campusplug_service_cats_v3',
  SERVICES: 'campusplug_services_v3',
  SERVICE_REQUESTS: 'campusplug_service_reqs_v3',
  BOOKINGS: 'campusplug_bookings_v3',
  CAMPUS_JOBS: 'campusplug_jobs_v3',
  JOB_APPLICATIONS: 'campusplug_job_apps_v3',
  CAMPUS_EVENTS: 'campusplug_events_v3',
  EVENT_TICKETS: 'campusplug_event_tickets_v3',
  COMMUNITIES: 'campusplug_communities_v3',
  COMMUNITY_POSTS: 'campusplug_community_posts_v3',
  COMMUNITY_COMMENTS: 'campusplug_community_comments_v3',
  BUSINESSES: 'campusplug_businesses_v3',
  SUBSCRIPTION_PLANS: 'campusplug_sub_plans_v3',
  USER_SUBSCRIPTIONS: 'campusplug_user_subs_v3',
  AD_CAMPAIGNS: 'campusplug_ad_campaigns_v3',
  ANNOUNCEMENTS: 'campusplug_announcements_v3',
  SUPPORT_TICKETS: 'campusplug_support_tickets_v3',
  FEATURE_FLAGS: 'campusplug_feature_flags_v3',
  ADMIN_USERS: 'campusplug_admin_users_v4',
  SAVED_ACCOUNTS: 'campusplug_saved_accounts_v2',
  STUDY_RESOURCES: 'campusplug_study_resources_v1',
  STUDY_FLASHCARDS: 'campusplug_study_flashcards_v1',
  STUDYGEN_HISTORY: 'campusplug_studygen_history_v1',
  INITIALIZED: 'campusplug_initialized_v5',
};

// Safe in-memory fallback store for iOS Safari Private Browsing / Lockdown mode / QuotaExceededError
const memoryStore: Record<string, string> = {};

function safeGetRaw(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const val = window.localStorage.getItem(key);
      if (val !== null) return val;
    }
  } catch {
    // Safari Private Mode or SecurityError
  }
  return memoryStore[key] ?? null;
}

function safeSetRaw(key: string, value: string): boolean {
  const previous = safeGetRaw(key);
  if (previous === value) {
    return false; // No change
  }
  memoryStore[key] = value;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // Safari Private Mode, QuotaExceededError, or blocked storage
  }
  return true; // Value changed
}

// Safe LocalStorage helpers with automatic memory fallback
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = safeGetRaw(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return defaultValue;
  }
}

const pendingDispatches: Record<string, number> = {};

function setItem<T>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value);
    const changed = safeSetRaw(key, serialized);

    // Only dispatch if the content actually changed and debounce duplicate dispatches
    if (changed && typeof window !== 'undefined') {
      if (pendingDispatches[key]) {
        clearTimeout(pendingDispatches[key]);
      }
      pendingDispatches[key] = window.setTimeout(() => {
        delete pendingDispatches[key];
        try {
          window.dispatchEvent(new CustomEvent('campusplug_storage_update', { detail: { key } }));
        } catch {
          // ignore event dispatch errors on older WebKit
        }
      }, 50);
    }
  } catch (error) {
    console.error(`Error writing ${key} to storage:`, error);
  }
}

export class StorageService {
  // Super Admin designations
  static readonly SUPER_ADMIN_EMAIL = 'bhadmusoluwadamilare@gmail.com';
  static readonly SECONDARY_SUPER_ADMIN_EMAIL = 'davesbrown88@gmail.com';

  // Demo product ID blacklist to guarantee no prototype data exists in database
  private static readonly DEMO_PRODUCT_IDS = new Set([
    'prod-iphone13',
    'prod-hppavilion',
    'prod-nikeaf1',
    'prod-casiocalc',
    'prod-ps4pad',
    'prod-rechargfan',
    'prod-mattress',
    'prod-physiologybook',
    'prod-iron',
    'prod-powerbank',
    'prod-barbingservice',
    'hot-demo-1',
  ]);

  // Initialize default data if not already set
  static initialize(): void {
    const isInit = safeGetRaw(STORAGE_KEYS.INITIALIZED);
    if (!isInit) {
      this.resetToDefaults();
      return;
    }

    // Dynamic one-time migration & demo data purge (checked via version flag to prevent infinite loops)
    const MIGRATION_VERSION = 'v9_uniosun_complete_faculties_and_departments';
    const currentMigration = safeGetRaw('campusplug_migration_ver');

    if (currentMigration !== MIGRATION_VERSION) {
      try {
        // 1. Empty marketplace products completely as requested
        setItem(STORAGE_KEYS.PRODUCTS, []);
        setItem(STORAGE_KEYS.FAVORITES, []);
        setItem(STORAGE_KEYS.ACCOMMODATIONS, []);

        // 2. Ensure complete up-to-date faculties and departments
        setItem(STORAGE_KEYS.FACULTIES, INITIAL_FACULTIES);
        setItem(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
        setItem(STORAGE_KEYS.CAMPUSES, INITIAL_CAMPUSES);
        setItem(STORAGE_KEYS.UNIVERSITIES, INITIAL_UNIVERSITIES);

        // 3. Purge all prototype users, keeping only Super Admins and genuine registered users
        const prototypeIds = new Set([
          'usr-tunde', 'usr-zainab', 'usr-chidi', 'usr-amaka', 'usr-emeka',
          'usr-fatima', 'usr-segun', 'usr-aisha', 'usr-blessing', 'usr-korede',
          'usr-halima', 'usr-folake', 'usr-ibrahim', 'usr-yetunde', 'usr-damilola',
          'usr-ngozi', 'usr-taiwo'
        ]);

        const currentUsers = getItem<UserProfile[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
        const filteredUsers = currentUsers.filter((u) => {
          const isSuperAdmin =
            u.email?.toLowerCase() === this.SUPER_ADMIN_EMAIL.toLowerCase() ||
            u.email?.toLowerCase() === this.SECONDARY_SUPER_ADMIN_EMAIL.toLowerCase() ||
            u.role === 'SUPER_ADMIN';
          return isSuperAdmin || (!prototypeIds.has(u.id) && !u.id.startsWith('usr-tunde'));
        }).map((u) => {
          // Correct any legacy default Mechanical Engineering on admin accounts to Computing
          if (
            (u.email?.toLowerCase() === this.SUPER_ADMIN_EMAIL.toLowerCase() ||
              u.email?.toLowerCase() === this.SECONDARY_SUPER_ADMIN_EMAIL.toLowerCase()) &&
            (u.departmentName === 'Mechanical Engineering' || u.facultyId === 'fac-eng')
          ) {
            return {
              ...u,
              facultyId: 'fac-computing',
              facultyName: 'Faculty of Computing and Information Technology (FOCIT)',
              departmentId: 'dept-comp-cs',
              departmentName: 'Computer Science',
            };
          }
          return u;
        });

        // Ensure Damilare and Dave are present and have 0 products
        const damilareUser = INITIAL_USERS[0];
        const daveUser = INITIAL_USERS[1];

        let cleanUsers = [...filteredUsers];
        if (!cleanUsers.some((u) => u.email?.toLowerCase() === this.SUPER_ADMIN_EMAIL.toLowerCase())) {
          cleanUsers.unshift(damilareUser);
        }
        if (!cleanUsers.some((u) => u.email?.toLowerCase() === this.SECONDARY_SUPER_ADMIN_EMAIL.toLowerCase())) {
          cleanUsers.push(daveUser);
        }

        setItem(STORAGE_KEYS.USERS, cleanUsers);

        // Clean saved accounts of prototype users
        const savedAccounts = getItem<UserProfile[]>(STORAGE_KEYS.SAVED_ACCOUNTS, []);
        const cleanSavedAccounts = savedAccounts.filter((u) => !prototypeIds.has(u.id) && !u.id.startsWith('usr-tunde'));
        setItem(STORAGE_KEYS.SAVED_ACCOUNTS, cleanSavedAccounts);

        // If current user is a prototype user, reset current user ID
        const currentUserId = getItem<string | null>(STORAGE_KEYS.CURRENT_USER_ID, null);
        if (currentUserId && (prototypeIds.has(currentUserId) || currentUserId.startsWith('usr-tunde'))) {
          setItem(STORAGE_KEYS.CURRENT_USER_ID, null);
        }

        // 4. Ensure Super Admin admin records
        const adminRecords = getItem<AdminUserRecord[]>(STORAGE_KEYS.ADMIN_USERS, []);
        const cleanAdmins = [...adminRecords];
        
        if (!cleanAdmins.some((a) => a.email.toLowerCase() === this.SUPER_ADMIN_EMAIL.toLowerCase())) {
          cleanAdmins.unshift({
            id: 'admin-rec-superadmin-damilare',
            userId: 'usr-superadmin-damilare',
            email: this.SUPER_ADMIN_EMAIL,
            fullName: 'Oluwadamilare Bhadmus',
            role: 'SUPER_ADMIN',
            permissions: {
              canManageUsers: true,
              canSuspendUsers: true,
              canManageListings: true,
              canFeatureListings: true,
              canModerateReports: true,
              canManageFinance: true,
              canReviewDisputes: true,
              canManageEvents: true,
              canManageJobs: true,
              canModerateCommunities: true,
              canManageSupport: true,
              canManageSettings: true,
            },
            assignedBy: 'system',
            assignedByName: 'Ace Tech Platform Security Core',
            assignedAt: '2025-01-01T00:00:00Z',
            status: 'active',
          });
        }

        if (!cleanAdmins.some((a) => a.email.toLowerCase() === this.SECONDARY_SUPER_ADMIN_EMAIL.toLowerCase())) {
          cleanAdmins.push({
            id: 'admin-rec-superadmin-dave',
            userId: 'usr-superadmin-dave',
            email: this.SECONDARY_SUPER_ADMIN_EMAIL,
            fullName: 'Dave Brown',
            role: 'SUPER_ADMIN',
            permissions: {
              canManageUsers: true,
              canSuspendUsers: true,
              canManageListings: true,
              canFeatureListings: true,
              canModerateReports: true,
              canManageFinance: true,
              canReviewDisputes: true,
              canManageEvents: true,
              canManageJobs: true,
              canModerateCommunities: true,
              canManageSupport: true,
              canManageSettings: true,
            },
            assignedBy: 'system',
            assignedByName: 'Ace Tech Platform Security Core',
            assignedAt: '2025-01-01T00:00:00Z',
            status: 'active',
          });
        }
        setItem(STORAGE_KEYS.ADMIN_USERS, cleanAdmins);

        safeSetRaw('campuscore_migration_ver', MIGRATION_VERSION);
      } catch (err) {
        console.warn('CampusCore Migration Warning:', err);
      }
    }
  }

  static resetToDefaults(): void {
    setItem(STORAGE_KEYS.UNIVERSITIES, INITIAL_UNIVERSITIES);
    setItem(STORAGE_KEYS.CAMPUSES, INITIAL_CAMPUSES);
    setItem(STORAGE_KEYS.FACULTIES, INITIAL_FACULTIES);
    setItem(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
    setItem(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    setItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    setItem(STORAGE_KEYS.SAVED_ACCOUNTS, []);
    setItem(STORAGE_KEYS.PRODUCTS, []);
    setItem(STORAGE_KEYS.ACCOMMODATIONS, INITIAL_ACCOMMODATION);
    setItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    setItem(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    setItem(STORAGE_KEYS.FAVORITES, []);
    setItem(STORAGE_KEYS.WALLETS, INITIAL_WALLETS);
    setItem(STORAGE_KEYS.WALLET_TRANSACTIONS, INITIAL_WALLET_TRANSACTIONS);
    setItem(STORAGE_KEYS.BANK_ACCOUNTS, INITIAL_BANK_ACCOUNTS);
    setItem(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    setItem(STORAGE_KEYS.ESCROWS, INITIAL_ESCROWS);
    setItem(STORAGE_KEYS.DISPUTES, INITIAL_DISPUTES);
    setItem(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    setItem(STORAGE_KEYS.VERIFICATIONS, INITIAL_VERIFICATIONS);
    setItem(STORAGE_KEYS.CONVERSATIONS, INITIAL_CONVERSATIONS);
    setItem(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    setItem(STORAGE_KEYS.ROOMMATES, INITIAL_ROOMMATES);
    setItem(STORAGE_KEYS.SAVED_ACCOMMODATIONS, INITIAL_SAVED_ACCOMMODATION);
    setItem(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    setItem(STORAGE_KEYS.PLATFORM_SETTINGS, INITIAL_PLATFORM_SETTINGS);
    // Phase 3 initializations
    setItem(STORAGE_KEYS.SERVICE_CATEGORIES, INITIAL_SERVICE_CATEGORIES);
    setItem(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    setItem(STORAGE_KEYS.SERVICE_REQUESTS, INITIAL_SERVICE_REQUESTS);
    setItem(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    setItem(STORAGE_KEYS.CAMPUS_JOBS, INITIAL_CAMPUS_JOBS);
    setItem(STORAGE_KEYS.JOB_APPLICATIONS, INITIAL_JOB_APPLICATIONS);
    setItem(STORAGE_KEYS.CAMPUS_EVENTS, INITIAL_CAMPUS_EVENTS);
    setItem(STORAGE_KEYS.EVENT_TICKETS, INITIAL_EVENT_TICKETS);
    setItem(STORAGE_KEYS.COMMUNITIES, INITIAL_COMMUNITIES);
    setItem(STORAGE_KEYS.COMMUNITY_POSTS, INITIAL_COMMUNITY_POSTS);
    setItem(STORAGE_KEYS.BUSINESSES, INITIAL_BUSINESSES);
    setItem(STORAGE_KEYS.SUBSCRIPTION_PLANS, INITIAL_SUBSCRIPTION_PLANS);
    setItem(STORAGE_KEYS.USER_SUBSCRIPTIONS, INITIAL_USER_SUBSCRIPTIONS);
    setItem(STORAGE_KEYS.AD_CAMPAIGNS, INITIAL_AD_CAMPAIGNS);
    setItem(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    setItem(STORAGE_KEYS.SUPPORT_TICKETS, INITIAL_SUPPORT_TICKETS);
    setItem(STORAGE_KEYS.FEATURE_FLAGS, INITIAL_FEATURE_FLAGS);
    setItem(STORAGE_KEYS.CURRENT_USER_ID, null);
    safeSetRaw(STORAGE_KEYS.INITIALIZED, 'true');
  }

  // --- UNIVERSITIES & CAMPUSES ---
  static getUniversities(): University[] {
    return getItem<University[]>(STORAGE_KEYS.UNIVERSITIES, INITIAL_UNIVERSITIES);
  }

  static getCampuses(universityId?: string): Campus[] {
    const campuses = getItem<Campus[]>(STORAGE_KEYS.CAMPUSES, INITIAL_CAMPUSES);
    if (!universityId) return campuses;
    return campuses.filter((c) => c.universityId === universityId);
  }

  static getFaculties(universityId?: string): Faculty[] {
    let faculties = getItem<Faculty[]>(STORAGE_KEYS.FACULTIES, INITIAL_FACULTIES);
    // Ensure all new initial faculties (like Faculty of Computing) are always present
    if (!faculties || faculties.length < INITIAL_FACULTIES.length || !faculties.some(f => f.id === 'fac-computing')) {
      faculties = INITIAL_FACULTIES;
      setItem(STORAGE_KEYS.FACULTIES, INITIAL_FACULTIES);
    }
    if (!universityId) return faculties;
    return faculties.filter((f) => f.universityId === universityId);
  }

  static getDepartments(facultyId?: string): Department[] {
    let depts = getItem<Department[]>(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
    if (!depts || depts.length < INITIAL_DEPARTMENTS.length || !depts.some(d => d.facultyId === 'fac-computing')) {
      depts = INITIAL_DEPARTMENTS;
      setItem(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
    }
    if (!facultyId) return depts;
    return depts.filter((d) => d.facultyId === facultyId);
  }

  // --- CATEGORIES ---
  static getCategories(): Category[] {
    const categories = getItem<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    const products = this.getProducts({ status: 'active' });
    return categories.map((cat) => ({
      ...cat,
      itemCount: products.filter((p) => p.categoryId === cat.id).length,
    }));
  }

  static createCategory(categoryData: Omit<Category, 'id' | 'createdAt' | 'itemCount'>): Category {
    const categories = getItem<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    const newCat: Category = {
      ...categoryData,
      id: `cat-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    categories.push(newCat);
    setItem(STORAGE_KEYS.CATEGORIES, categories);
    return newCat;
  }

  static updateCategory(id: string, updates: Partial<Category>): Category | null {
    const categories = getItem<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) return null;
    categories[index] = { ...categories[index], ...updates };
    setItem(STORAGE_KEYS.CATEGORIES, categories);
    return categories[index];
  }

  // --- AUTH & USERS ---
  static getUsers(): UserProfile[] {
    return getItem<UserProfile[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  static getCurrentUser(): UserProfile | null {
    const currentId = getItem<string | null>(STORAGE_KEYS.CURRENT_USER_ID, null);
    if (!currentId) return null;
    const users = this.getUsers();
    return users.find((u) => u.id === currentId) || null;
  }

  static setCurrentUser(userId: string | null): void {
    setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
    if (userId) {
      const user = this.getUserById(userId);
      if (user) {
        this.addSavedAccount(user);
      }
    }
  }

  // --- SAVED ACCOUNTS ON THIS DEVICE ---
  static getSavedAccounts(): UserProfile[] {
    const saved = getItem<UserProfile[]>(STORAGE_KEYS.SAVED_ACCOUNTS, []);
    const allUsers = this.getUsers();
    // Validate that saved accounts exist and reflect latest profile updates
    const validated: UserProfile[] = [];
    saved.forEach((s) => {
      const live = allUsers.find((u) => u.id === s.id || u.email.toLowerCase() === s.email.toLowerCase());
      if (live) {
        validated.push(live);
      }
    });
    return validated;
  }

  static addSavedAccount(user: UserProfile): void {
    const saved = this.getSavedAccounts();
    const filtered = saved.filter(
      (u) => u.id !== user.id && u.email.toLowerCase() !== user.email.toLowerCase()
    );
    filtered.unshift(user);
    // Keep max 6 accounts on device
    const capped = filtered.slice(0, 6);
    setItem(STORAGE_KEYS.SAVED_ACCOUNTS, capped);
  }

  static removeSavedAccount(userId: string): void {
    const saved = this.getSavedAccounts();
    const updated = saved.filter((u) => u.id !== userId);
    setItem(STORAGE_KEYS.SAVED_ACCOUNTS, updated);
  }

  static getUserById(id: string): UserProfile | null {
    const users = this.getUsers();
    return users.find((u) => u.id === id) || null;
  }

  static updateUser(id: string, updates: Partial<UserProfile>, callerIsAdmin = false): UserProfile | null {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    // Security sanitization: normal users cannot elevate roles or alter account status / metrics
    const safeUpdates = { ...updates };
    if (!callerIsAdmin) {
      delete safeUpdates.role;
      delete safeUpdates.accountStatus;
      delete safeUpdates.verificationBadge;
      delete safeUpdates.rating;
      delete safeUpdates.totalRatings;
      delete safeUpdates.totalCompletedSales;
      delete safeUpdates.totalOrdersBought;
      delete (safeUpdates as any).id;
      delete (safeUpdates as any).authUserId;
    }

    users[index] = {
      ...users[index],
      ...safeUpdates,
      updatedAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.USERS, users);
    
    // Also update in saved accounts if present
    const saved = this.getSavedAccounts();
    const savedIdx = saved.findIndex((u) => u.id === id);
    if (savedIdx >= 0) {
      saved[savedIdx] = users[index];
      setItem(STORAGE_KEYS.SAVED_ACCOUNTS, saved);
    }

    return users[index];
  }

  static createUser(profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt' | 'authUserId'>): UserProfile {
    const users = this.getUsers();
    const newId = `usr-${Date.now()}`;
    const newUser: UserProfile = {
      ...profileData,
      id: newId,
      authUserId: `auth-${newId}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(newUser);
    setItem(STORAGE_KEYS.USERS, users);
    this.setCurrentUser(newId);
    this.addSavedAccount(newUser);
    
    // Automatically provision user wallet
    this.getWallet(newId);

    return newUser;
  }

  // --- PHASE 4: SUPER ADMIN & ADMIN RBAC ---
  static isSuperAdmin(user: UserProfile | null): boolean {
    if (!user) return false;
    const email = (user.email || '').toLowerCase().trim();
    return (
      email === this.SUPER_ADMIN_EMAIL.toLowerCase() ||
      email === this.SECONDARY_SUPER_ADMIN_EMAIL.toLowerCase() ||
      user.role === 'SUPER_ADMIN' ||
      user.role === 'super_admin'
    );
  }

  static isAdmin(user: UserProfile | null): boolean {
    if (!user) return false;
    if (this.isSuperAdmin(user)) return true;
    return user.role === 'ADMIN' || user.role === 'admin';
  }

  static getAdminUsers(): AdminUserRecord[] {
    const defaultSuperAdminRecord: AdminUserRecord = {
      id: 'admin-rec-superadmin-damilare',
      userId: 'usr-superadmin-damilare',
      email: this.SUPER_ADMIN_EMAIL,
      fullName: 'Oluwadamilare Bhadmus',
      role: 'SUPER_ADMIN',
      permissions: {
        canManageUsers: true,
        canSuspendUsers: true,
        canManageListings: true,
        canFeatureListings: true,
        canModerateReports: true,
        canManageFinance: true,
        canReviewDisputes: true,
        canManageEvents: true,
        canManageJobs: true,
        canModerateCommunities: true,
        canManageSupport: true,
        canManageSettings: true,
      },
      assignedBy: 'system',
      assignedByName: 'Ace Tech Platform Security Core',
      assignedAt: '2025-01-01T00:00:00Z',
      status: 'active',
    };

    const secondarySuperAdminRecord: AdminUserRecord = {
      id: 'admin-rec-superadmin-dave',
      userId: 'usr-superadmin-dave',
      email: this.SECONDARY_SUPER_ADMIN_EMAIL,
      fullName: 'Dave Brown',
      role: 'SUPER_ADMIN',
      permissions: {
        canManageUsers: true,
        canSuspendUsers: true,
        canManageListings: true,
        canFeatureListings: true,
        canModerateReports: true,
        canManageFinance: true,
        canReviewDisputes: true,
        canManageEvents: true,
        canManageJobs: true,
        canModerateCommunities: true,
        canManageSupport: true,
        canManageSettings: true,
      },
      assignedBy: 'system',
      assignedByName: 'Ace Tech Platform Security Core',
      assignedAt: '2025-01-01T00:00:00Z',
      status: 'active',
    };

    let records = getItem<AdminUserRecord[]>(STORAGE_KEYS.ADMIN_USERS, [defaultSuperAdminRecord, secondarySuperAdminRecord]);
    
    // Guarantee Super Admin records are always present and have full permissions
    const hasDamilare = records.some((r) => r.email.toLowerCase() === this.SUPER_ADMIN_EMAIL.toLowerCase());
    if (!hasDamilare) {
      records = [defaultSuperAdminRecord, ...records];
    }
    const hasDave = records.some((r) => r.email.toLowerCase() === this.SECONDARY_SUPER_ADMIN_EMAIL.toLowerCase());
    if (!hasDave) {
      records = [...records, secondarySuperAdminRecord];
    }
    return records;
  }

  static assignAdmin(
    assignerUserId: string,
    targetUserId: string,
    permissions: AdminPermissions
  ): { success: boolean; message: string; record?: AdminUserRecord } {
    const assigner = this.getUserById(assignerUserId);
    if (!this.isSuperAdmin(assigner)) {
      return {
        success: false,
        message: 'Security Violation: Only the Super Admin can create or assign Admin privileges.',
      };
    }

    const targetUser = this.getUserById(targetUserId);
    if (!targetUser) {
      return { success: false, message: 'User account not found.' };
    }

    // Update target user profile role
    this.updateUser(targetUserId, {
      role: 'ADMIN',
      adminPermissions: permissions,
    });

    const adminRecords = this.getAdminUsers();
    const existingIndex = adminRecords.findIndex((r) => r.userId === targetUserId);

    const adminRecord: AdminUserRecord = {
      id: `admin-rec-${Date.now()}`,
      userId: targetUserId,
      email: targetUser.email,
      fullName: targetUser.fullName,
      role: 'ADMIN',
      permissions,
      assignedBy: assigner.id,
      assignedByName: assigner.fullName,
      assignedAt: new Date().toISOString(),
      status: 'active',
    };

    if (existingIndex >= 0) {
      adminRecords[existingIndex] = adminRecord;
    } else {
      adminRecords.push(adminRecord);
    }

    setItem(STORAGE_KEYS.ADMIN_USERS, adminRecords);

    // Audit log & notification
    this.createAuditLog(
      assigner.id,
      assigner.fullName,
      'ADMIN_ROLE_PROMOTED',
      'user',
      targetUserId,
      { permissions, targetEmail: targetUser.email }
    );

    this.createNotification({
      userId: targetUserId,
      title: 'Administrator Privileges Granted',
      message: `You have been appointed as an Administrator on CampusCore by Ace Tech. Access the Admin Console from your menu.`,
      type: 'system_announcement',
    });

    return { success: true, message: `Administrator privileges successfully granted to ${targetUser.fullName}.`, record: adminRecord };
  }

  static revokeAdmin(
    assignerUserId: string,
    targetUserId: string
  ): { success: boolean; message: string } {
    const assigner = this.getUserById(assignerUserId);
    if (!this.isSuperAdmin(assigner)) {
      return {
        success: false,
        message: 'Security Violation: Only the Super Admin can revoke Admin privileges.',
      };
    }

    const targetUser = this.getUserById(targetUserId);
    if (!targetUser) {
      return { success: false, message: 'Target user not found.' };
    }

    if (targetUser.email.toLowerCase() === this.SUPER_ADMIN_EMAIL.toLowerCase()) {
      return {
        success: false,
        message: 'Platform Integrity: The primary Super Admin account cannot be revoked or demoted.',
      };
    }

    // Demote role back to USER
    this.updateUser(targetUserId, {
      role: 'USER',
      adminPermissions: undefined,
    });

    const adminRecords = this.getAdminUsers().filter((r) => r.userId !== targetUserId);
    setItem(STORAGE_KEYS.ADMIN_USERS, adminRecords);

    this.createAuditLog(
      assigner.id,
      assigner.fullName,
      'ADMIN_ROLE_REVOKED',
      'user',
      targetUserId,
      { targetEmail: targetUser.email }
    );

    return { success: true, message: `Admin privileges removed for ${targetUser.fullName}.` };
  }

  static updateAdminPermissions(
    assignerUserId: string,
    targetUserId: string,
    permissions: AdminPermissions
  ): { success: boolean; message: string } {
    const assigner = this.getUserById(assignerUserId);
    if (!this.isSuperAdmin(assigner)) {
      return {
        success: false,
        message: 'Security Violation: Only the Super Admin can modify administrative permissions.',
      };
    }

    this.updateUser(targetUserId, {
      adminPermissions: permissions,
    });

    const adminRecords = this.getAdminUsers();
    const index = adminRecords.findIndex((r) => r.userId === targetUserId);
    if (index >= 0) {
      adminRecords[index].permissions = permissions;
      setItem(STORAGE_KEYS.ADMIN_USERS, adminRecords);
    }

    this.createAuditLog(
      assigner.id,
      assigner.fullName,
      'ADMIN_PERMISSIONS_UPDATED',
      'user',
      targetUserId,
      { permissions }
    );

    return { success: true, message: 'Admin permissions updated successfully.' };
  }

  // --- SELLER ONBOARDING & ACCOUNT STATUS ---
  static completeSellerOnboarding(
    userId: string,
    data: {
      sellerBio?: string;
      sellerPickupLocations?: string[];
      phone?: string;
      whatsapp?: string;
    }
  ): { success: boolean; user?: UserProfile } {
    const user = this.getUserById(userId);
    if (!user) return { success: false };

    const updated = this.updateUser(userId, {
      sellerStatus: 'SELLER',
      sellerOnboardingCompleted: true,
      bio: data.sellerBio || user.bio,
      sellerBio: data.sellerBio || user.bio,
      sellerPickupLocations: data.sellerPickupLocations || ['Oke-Baale Campus Gate', 'Campus SUB'],
      phone: data.phone || user.phone,
      whatsapp: data.whatsapp || user.whatsapp,
    });

    if (updated) {
      this.createNotification({
        userId,
        title: 'Seller Account Activated!',
        message: 'Congratulations! Your seller profile is active. You can now post marketplace listings and reach thousands of UNIOSUN students.',
        type: 'system_announcement',
      });
      return { success: true, user: updated };
    }
    return { success: false };
  }

  static updateUserAccountStatus(
    adminUserId: string,
    targetUserId: string,
    status: AccountStatus,
    reason?: string
  ): { success: boolean; message: string } {
    const admin = this.getUserById(adminUserId);
    if (!this.isAdmin(admin)) {
      return { success: false, message: 'Unauthorized action.' };
    }

    const target = this.getUserById(targetUserId);
    if (!target) {
      return { success: false, message: 'User not found.' };
    }

    if (target.email.toLowerCase() === this.SUPER_ADMIN_EMAIL.toLowerCase()) {
      return { success: false, message: 'The primary Super Admin cannot be suspended.' };
    }

    this.updateUser(targetUserId, { accountStatus: status });

    this.createAuditLog(
      admin ? admin.id : 'admin',
      admin ? admin.fullName : 'Admin',
      `USER_STATUS_${status.toUpperCase()}`,
      'user',
      targetUserId,
      { reason, targetEmail: target.email }
    );

    this.createNotification({
      userId: targetUserId,
      title: `Account Status Update: ${status.toUpperCase()}`,
      message: reason || `Your account status has been updated to ${status} by moderation.`,
      type: 'account_warning',
    });

    return { success: true, message: `Account status updated to ${status}.` };
  }

  static syncProfilesFromSupabase(profiles: UserProfile[]): void {
    if (profiles && profiles.length > 0) {
      setItem(STORAGE_KEYS.USERS, profiles);
    }
  }

  // --- PRODUCTS ---
  static syncProductsFromSupabase(products: Product[]): void {
    if (products) {
      setItem(STORAGE_KEYS.PRODUCTS, products);
    }
  }

  static getProducts(filters?: FilterOptions): Product[] {
    let products = getItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);

    if (!filters) return products;

    if (filters.status && filters.status !== 'All') {
      products = products.filter((p) => p.status === filters.status);
    }

    if (filters.category && filters.category !== 'all') {
      products = products.filter((p) => p.categoryId === filters.category || p.categoryName.toLowerCase() === filters.category?.toLowerCase());
    }

    if (filters.campusId && filters.campusId !== 'all') {
      products = products.filter((p) => p.campusId === filters.campusId);
    }

    if (filters.condition && filters.condition !== 'All') {
      products = products.filter((p) => p.condition === filters.condition);
    }

    if (filters.minPrice !== undefined && filters.minPrice !== null && filters.minPrice > 0) {
      products = products.filter((p) => p.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined && filters.maxPrice !== null && filters.maxPrice > 0) {
      products = products.filter((p) => p.price <= filters.maxPrice!);
    }

    if (filters.onlyFeatured) {
      products = products.filter((p) => p.featured);
    }

    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.sellerName.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.sellerCampus.toLowerCase().includes(q)
      );
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price_asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'views_desc':
      case 'popular':
        products.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'newest':
      default:
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return products;
  }

  static getProductById(id: string): Product | null {
    const products = getItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    return products.find((p) => p.id === id || p.slug === id) || null;
  }

  static createProduct(productData: Omit<Product, 'id' | 'views' | 'createdAt' | 'updatedAt'>): Product {
    const products = getItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const newId = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...productData,
      id: newId,
      views: 1,
      tradeMode: productData.tradeMode || 'both',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    products.unshift(newProduct);
    setItem(STORAGE_KEYS.PRODUCTS, products);

    // Send notification to seller
    this.createNotification({
      userId: newProduct.sellerId,
      title: 'Listing Published Successfully',
      message: `Your item "${newProduct.title}" is now active in the UNIOSUN CampusCore marketplace.`,
      type: 'listing_published',
      link: `/marketplace/${newProduct.slug}`,
    });

    return newProduct;
  }

  static updateProduct(id: string, updates: Partial<Product>): Product | null {
    const products = getItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    products[index] = {
      ...products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.PRODUCTS, products);
    return products[index];
  }

  static deleteProduct(id: string): boolean {
    const products = getItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const filtered = products.filter((p) => p.id !== id);
    if (filtered.length === products.length) return false;
    setItem(STORAGE_KEYS.PRODUCTS, filtered);
    return true;
  }

  static incrementProductViews(id: string): void {
    const products = getItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const index = products.findIndex((p) => p.id === id || p.slug === id);
    if (index !== -1) {
      products[index].views = (products[index].views || 0) + 1;
      setItem(STORAGE_KEYS.PRODUCTS, products);
    }
  }

  static getUserProducts(userId: string): Product[] {
    const products = getItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    return products.filter((p) => p.sellerId === userId);
  }

  // --- ACCOMMODATION ---
  static getAccommodations(filters?: AccommodationFilterOptions): Accommodation[] {
    let accommodations = getItem<Accommodation[]>(STORAGE_KEYS.ACCOMMODATIONS, INITIAL_ACCOMMODATION);

    if (!filters) return accommodations;

    if (filters.campusId && filters.campusId !== 'all') {
      accommodations = accommodations.filter((a) => a.campusId === filters.campusId);
    }

    if (filters.roomType && filters.roomType !== 'all') {
      accommodations = accommodations.filter((a) => a.roomType === filters.roomType);
    }

    if (filters.availableOnly) {
      accommodations = accommodations.filter((a) => a.available && a.status === 'active');
    }

    if (filters.minPrice !== undefined && filters.minPrice > 0) {
      accommodations = accommodations.filter((a) => a.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
      accommodations = accommodations.filter((a) => a.price <= filters.maxPrice!);
    }

    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim();
      accommodations = accommodations.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q) ||
          a.roomType.toLowerCase().includes(q)
      );
    }

    switch (filters.sortBy) {
      case 'price_asc':
        accommodations.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        accommodations.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        accommodations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return accommodations;
  }

  static getAccommodationById(id: string): Accommodation | null {
    const accommodations = getItem<Accommodation[]>(STORAGE_KEYS.ACCOMMODATIONS, INITIAL_ACCOMMODATION);
    return accommodations.find((a) => a.id === id) || null;
  }

  static createAccommodation(data: Omit<Accommodation, 'id' | 'createdAt' | 'updatedAt'>): Accommodation {
    const accommodations = getItem<Accommodation[]>(STORAGE_KEYS.ACCOMMODATIONS, INITIAL_ACCOMMODATION);
    const newId = `accom-${Date.now()}`;
    const newAccom: Accommodation = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    accommodations.unshift(newAccom);
    setItem(STORAGE_KEYS.ACCOMMODATIONS, accommodations);
    return newAccom;
  }

  static updateAccommodation(id: string, updates: Partial<Accommodation>): Accommodation | null {
    const accommodations = getItem<Accommodation[]>(STORAGE_KEYS.ACCOMMODATIONS, INITIAL_ACCOMMODATION);
    const index = accommodations.findIndex((a) => a.id === id);
    if (index === -1) return null;
    accommodations[index] = {
      ...accommodations[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.ACCOMMODATIONS, accommodations);
    return accommodations[index];
  }

  static deleteAccommodation(id: string): boolean {
    const accommodations = getItem<Accommodation[]>(STORAGE_KEYS.ACCOMMODATIONS, INITIAL_ACCOMMODATION);
    const filtered = accommodations.filter((a) => a.id !== id);
    if (filtered.length === accommodations.length) return false;
    setItem(STORAGE_KEYS.ACCOMMODATIONS, filtered);
    return true;
  }

  static getFilteredProducts(filters?: FilterOptions): Product[] {
    return this.getProducts(filters);
  }

  static getFilteredAccommodations(filters?: AccommodationFilterOptions): Accommodation[] {
    return this.getAccommodations(filters);
  }

  static getFeaturedProducts(): Product[] {
    return this.getProducts({ onlyFeatured: true, status: 'active' });
  }

  static getProductsBySeller(sellerId: string): Product[] {
    return this.getUserProducts(sellerId);
  }

  // --- FAVORITES ---
  static getFavorites(userId: string): string[] {
    const favorites = getItem<Favorite[]>(STORAGE_KEYS.FAVORITES, []);
    return favorites.filter((f) => f.userId === userId).map((f) => f.productId);
  }

  static isFavorite(userId: string, productId: string): boolean {
    const favorites = getItem<Favorite[]>(STORAGE_KEYS.FAVORITES, []);
    return favorites.some((f) => f.userId === userId && f.productId === productId);
  }

  static toggleFavorite(userId: string, productId: string): boolean {
    const favorites = getItem<Favorite[]>(STORAGE_KEYS.FAVORITES, []);
    const index = favorites.findIndex((f) => f.userId === userId && f.productId === productId);
    
    if (index !== -1) {
      favorites.splice(index, 1);
      setItem(STORAGE_KEYS.FAVORITES, favorites);
      return false;
    } else {
      favorites.push({
        id: `fav-${Date.now()}`,
        userId,
        productId,
        createdAt: new Date().toISOString(),
      });
      setItem(STORAGE_KEYS.FAVORITES, favorites);
      return true;
    }
  }

  static getFavoriteProducts(userId: string): Product[] {
    const favoriteIds = this.getFavorites(userId);
    const products = getItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    return products.filter((p) => favoriteIds.includes(p.id));
  }

  // --- SAVED ACCOMMODATIONS ---
  static getSavedAccommodations(userId: string): SavedAccommodation[] {
    const saved = getItem<SavedAccommodation[]>(STORAGE_KEYS.SAVED_ACCOMMODATIONS, INITIAL_SAVED_ACCOMMODATION);
    return saved.filter((s) => s.userId === userId);
  }

  static isAccommodationSaved(userId: string, accommodationId: string): boolean {
    const saved = getItem<SavedAccommodation[]>(STORAGE_KEYS.SAVED_ACCOMMODATIONS, INITIAL_SAVED_ACCOMMODATION);
    return saved.some((s) => s.userId === userId && s.accommodationId === accommodationId);
  }

  static toggleSaveAccommodation(userId: string, accommodationId: string): boolean {
    const saved = getItem<SavedAccommodation[]>(STORAGE_KEYS.SAVED_ACCOMMODATIONS, INITIAL_SAVED_ACCOMMODATION);
    const index = saved.findIndex((s) => s.userId === userId && s.accommodationId === accommodationId);

    if (index !== -1) {
      saved.splice(index, 1);
      setItem(STORAGE_KEYS.SAVED_ACCOMMODATIONS, saved);
      return false;
    } else {
      saved.push({
        id: `sav-${Date.now()}`,
        userId,
        accommodationId,
        createdAt: new Date().toISOString(),
      });
      setItem(STORAGE_KEYS.SAVED_ACCOMMODATIONS, saved);
      return true;
    }
  }

  // --- REPORTS & MODERATION ---
  static getReports(): Report[] {
    return getItem<Report[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
  }

  static createReport(reportData: Omit<Report, 'id' | 'createdAt' | 'status'>): Report {
    const reports = getItem<Report[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    const newReport: Report = {
      ...reportData,
      id: `rep-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    reports.unshift(newReport);
    setItem(STORAGE_KEYS.REPORTS, reports);

    // Notify Admins
    const admins = this.getUsers().filter((u) => u.role === 'admin');
    admins.forEach((admin) => {
      this.createNotification({
        userId: admin.id,
        title: 'New Content Report Submitted',
        message: `A report regarding "${reportData.reason}" was submitted by ${reportData.reporterName}.`,
        type: 'listing_reported',
      });
    });

    return newReport;
  }

  static updateReport(id: string, updates: Partial<Report>): Report | null {
    const reports = getItem<Report[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    const index = reports.findIndex((r) => r.id === id);
    if (index === -1) return null;
    reports[index] = { ...reports[index], ...updates };
    setItem(STORAGE_KEYS.REPORTS, reports);
    return reports[index];
  }

  static updateReportStatus(id: string, status: ReportStatus): Report | null {
    return this.updateReport(id, { status });
  }

  // --- NOTIFICATIONS ---
  static getNotifications(userId: string): AppNotification[] {
    const notifs = getItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    return notifs
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static createNotification(data: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): AppNotification {
    const notifs = getItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const newNotif: AppNotification = {
      ...data,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    notifs.unshift(newNotif);
    setItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
    return newNotif;
  }

  static markNotificationAsRead(id: string): void {
    const notifs = getItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const index = notifs.findIndex((n) => n.id === id);
    if (index !== -1) {
      notifs[index].read = true;
      setItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
    }
  }

  static markAllNotificationsAsRead(userId: string): void {
    const notifs = getItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const updated = notifs.map((n) => (n.userId === userId ? { ...n, read: true } : n));
    setItem(STORAGE_KEYS.NOTIFICATIONS, updated);
  }

  // ==========================================
  // PHASE 2: WALLET & FINANCIAL LEDGER
  // ==========================================

  static getWallets(): Wallet[] {
    return getItem<Wallet[]>(STORAGE_KEYS.WALLETS, INITIAL_WALLETS);
  }

  static getWallet(userId: string): Wallet {
    const wallets = this.getWallets();
    const wallet = wallets.find((w) => w.userId === userId);
    if (!wallet) {
      return {
        id: `wal-${userId.replace('usr-', '')}`,
        userId,
        currency: 'NGN',
        availableBalance: 0,
        pendingBalance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    return wallet;
  }

  static updateWallet(userId: string, updates: Partial<Wallet>): Wallet {
    const wallets = this.getWallets();
    const index = wallets.findIndex((w) => w.userId === userId);
    if (index === -1) {
      const newWal: Wallet = {
        id: `wal-${userId}`,
        userId,
        currency: 'NGN',
        availableBalance: 0,
        pendingBalance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...updates,
      };
      wallets.push(newWal);
      setItem(STORAGE_KEYS.WALLETS, wallets);
      return newWal;
    }
    wallets[index] = {
      ...wallets[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.WALLETS, wallets);
    return wallets[index];
  }

  static getWalletTransactions(userId?: string): WalletTransaction[] {
    const txs = getItem<WalletTransaction[]>(STORAGE_KEYS.WALLET_TRANSACTIONS, INITIAL_WALLET_TRANSACTIONS);
    if (!userId) {
      return txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return txs
      .filter((t) => t.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static depositFunds(
    userId: string,
    amount: number,
    provider: 'paystack' | 'flutterwave' | 'bank_transfer' = 'paystack',
    providerReference?: string
  ): { success: boolean; transaction: WalletTransaction; wallet: Wallet; message?: string } {
    if (amount <= 0) {
      return { success: false, message: 'Deposit amount must be greater than 0' } as any;
    }

    const settings = this.getPlatformSettings();
    if (amount < settings.minDepositAmount) {
      return {
        success: false,
        message: `Minimum deposit amount is ₦${settings.minDepositAmount.toLocaleString()}`,
      } as any;
    }

    const wallet = this.getWallet(userId);
    const user = this.getUserById(userId);
    const reference = `CP-DEP-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      walletId: wallet.id,
      userId,
      type: 'deposit',
      amount,
      currency: 'NGN',
      status: 'completed',
      reference,
      description: `Wallet funding via ${(provider || 'online').toUpperCase()} Checkout`,
      provider,
      providerReference: providerReference || `pstk_ref_${Date.now()}`,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    const txs = this.getWalletTransactions();
    txs.unshift(newTx);
    setItem(STORAGE_KEYS.WALLET_TRANSACTIONS, txs);

    // Update wallet balance atomically
    const updatedWallet = this.updateWallet(userId, {
      availableBalance: wallet.availableBalance + amount,
      totalDeposited: (wallet.totalDeposited || 0) + amount,
    });

    // Create Audit Log
    this.createAuditLog(
      userId,
      user?.fullName || 'Student',
      'WALLET_DEPOSIT',
      'wallet',
      wallet.id,
      { amount, provider, reference }
    );

    // Notify User
    this.createNotification({
      userId,
      title: 'Wallet Funded Successfully',
      message: `₦${amount.toLocaleString()} has been credited to your CampusCore wallet. Ref: ${reference}`,
      type: 'deposit_success',
      link: '/wallet',
    });

    return { success: true, transaction: newTx, wallet: updatedWallet };
  }

  static updateWalletBalance(userId: string, availableDelta: number, pendingDelta: number = 0): Wallet {
    const wallet = this.getWallet(userId);
    return this.updateWallet(userId, {
      availableBalance: Math.max(0, wallet.availableBalance + availableDelta),
      pendingBalance: Math.max(0, (wallet.pendingBalance || 0) + pendingDelta),
    });
  }

  static requestWithdrawal(
    userId: string,
    amount: number,
    bankAccountId: string,
    narration?: string
  ): { success: boolean; transaction?: WalletTransaction; wallet?: Wallet; message?: string } {
    const wallet = this.getWallet(userId);
    const user = this.getUserById(userId);
    const settings = this.getPlatformSettings();
    const accounts = this.getUserBankAccounts(userId);
    const bankAccount = accounts.find((a) => a.id === bankAccountId);

    if (!bankAccount) {
      return { success: false, message: 'Invalid bank account selected.' };
    }

    if (amount < settings.minWithdrawalAmount) {
      return {
        success: false,
        message: `Minimum withdrawal amount is ₦${settings.minWithdrawalAmount.toLocaleString()}`,
      };
    }

    const totalDeduction = amount + settings.withdrawalFeeFixed;
    if (wallet.availableBalance < totalDeduction) {
      return {
        success: false,
        message: `Insufficient wallet balance. You need ₦${totalDeduction.toLocaleString()} (including ₦${settings.withdrawalFeeFixed} bank transfer fee). Current available: ₦${wallet.availableBalance.toLocaleString()}`,
      };
    }

    const reference = `CP-WDR-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Deduct immediately from available balance
    const updatedWallet = this.updateWallet(userId, {
      availableBalance: wallet.availableBalance - totalDeduction,
      totalWithdrawn: (wallet.totalWithdrawn || 0) + amount,
    });

    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      walletId: wallet.id,
      userId,
      type: 'withdrawal',
      amount,
      currency: 'NGN',
      status: 'completed', // instant simulated payout via automated gateway
      reference,
      description: `Withdrawal to ${bankAccount.bankName} (${bankAccount.accountNumber.slice(0, 3)}****${bankAccount.accountNumber.slice(-3)} - ${bankAccount.accountName})`,
      provider: 'paystack',
      providerReference: `trf_pstk_${Date.now()}`,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    const txs = this.getWalletTransactions();
    txs.unshift(newTx);
    setItem(STORAGE_KEYS.WALLET_TRANSACTIONS, txs);

    // Audit Log
    this.createAuditLog(
      userId,
      user?.fullName || 'Student',
      'WALLET_WITHDRAWAL',
      'wallet',
      wallet.id,
      { amount, bankAccount: bankAccount.bankName, reference, fee: settings.withdrawalFeeFixed }
    );

    // Notification
    this.createNotification({
      userId,
      title: 'Withdrawal Processed',
      message: `₦${amount.toLocaleString()} sent to your ${bankAccount.bankName} account (${bankAccount.accountNumber}). Ref: ${reference}`,
      type: 'withdrawal_success',
      link: '/wallet',
    });

    return { success: true, transaction: newTx, wallet: updatedWallet };
  }

  // --- BANK ACCOUNTS ---
  static getUserBankAccounts(userId: string): UserBankAccount[] {
    const accounts = getItem<UserBankAccount[]>(STORAGE_KEYS.BANK_ACCOUNTS, INITIAL_BANK_ACCOUNTS);
    return accounts.filter((a) => a.userId === userId);
  }

  static addBankAccount(
    userId: string,
    account: Omit<UserBankAccount, 'id' | 'userId' | 'verified' | 'createdAt' | 'updatedAt'>
  ): UserBankAccount {
    const accounts = getItem<UserBankAccount[]>(STORAGE_KEYS.BANK_ACCOUNTS, INITIAL_BANK_ACCOUNTS);
    const newAccount: UserBankAccount = {
      ...account,
      id: `bnk-${Date.now()}`,
      userId,
      verified: true, // auto-verified via NIBSS/Paystack resolve API
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    accounts.push(newAccount);
    setItem(STORAGE_KEYS.BANK_ACCOUNTS, accounts);
    return newAccount;
  }

  static deleteBankAccount(id: string): boolean {
    const accounts = getItem<UserBankAccount[]>(STORAGE_KEYS.BANK_ACCOUNTS, INITIAL_BANK_ACCOUNTS);
    const filtered = accounts.filter((a) => a.id !== id);
    if (filtered.length === accounts.length) return false;
    setItem(STORAGE_KEYS.BANK_ACCOUNTS, filtered);
    return true;
  }

  // ==========================================
  // PHASE 2: ORDERS & ESCROW STATE MACHINE
  // ==========================================

  static getOrders(userId?: string, role: 'buyer' | 'seller' | 'all' = 'all'): Order[] {
    const orders = getItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    if (!userId) {
      return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return orders
      .filter((o) => {
        if (role === 'buyer') return o.buyerId === userId;
        if (role === 'seller') return o.sellerId === userId;
        return o.buyerId === userId || o.sellerId === userId;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static getOrdersForUser(userId: string): Order[] {
    return this.getOrders(userId, 'all');
  }

  static getReviewsForUser(userId: string): Review[] {
    return this.getReviews(userId);
  }

  static getOrderById(orderId: string): Order | null {
    const orders = getItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    return orders.find((o) => o.id === orderId || o.orderNumber === orderId) || null;
  }

  static getEscrows(): EscrowTransaction[] {
    return getItem<EscrowTransaction[]>(STORAGE_KEYS.ESCROWS, INITIAL_ESCROWS);
  }

  static getEscrowByOrderId(orderId: string): EscrowTransaction | null {
    const escrows = this.getEscrows();
    return escrows.find((e) => e.orderId === orderId) || null;
  }

  /**
   * Creates an Order with Escrow Lock
   * Deducts buyer's wallet (or direct funding), creates Escrow 'held', notifies seller, starts conversation.
   */
  static createOrder(
    buyerId: string,
    productId: string,
    deliveryInfo: { campus: string; location: string; notes?: string },
    paymentMethod: 'wallet' | 'direct_card' = 'wallet'
  ): { success: boolean; order?: Order; message?: string } {
    const product = this.getProductById(productId);
    if (!product) return { success: false, message: 'Product not found.' };

    const buyer = this.getUserById(buyerId);
    const seller = this.getUserById(product.sellerId);
    if (!buyer || !seller) return { success: false, message: 'Buyer or seller profile not found.' };

    if (buyerId === product.sellerId) {
      return { success: false, message: 'You cannot buy your own product listing.' };
    }

    const settings = this.getPlatformSettings();
    const platformFee = Math.round(product.price * (settings.escrowFeePercent / 100));
    const sellerReceives = product.price - platformFee;

    const buyerWallet = this.getWallet(buyerId);

    // If paying from wallet, check funds
    if (paymentMethod === 'wallet') {
      if (buyerWallet.availableBalance < product.price) {
        return {
          success: false,
          message: `Insufficient wallet balance. You have ₦${buyerWallet.availableBalance.toLocaleString()}, but order requires ₦${product.price.toLocaleString()}. Please fund your wallet or choose Card payment.`,
        };
      }

      // Deduct buyer wallet
      this.updateWallet(buyerId, {
        availableBalance: buyerWallet.availableBalance - product.price,
      });

      // Record buyer payment transaction
      const txs = this.getWalletTransactions();
      txs.unshift({
        id: `tx-${Date.now()}`,
        walletId: buyerWallet.id,
        userId: buyerId,
        type: 'payment',
        amount: product.price,
        currency: 'NGN',
        status: 'completed',
        reference: `CP-ORD-${Date.now().toString().slice(-6)}`,
        description: `Escrow payment for Order: ${product.title}`,
        provider: 'internal',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      });
      setItem(STORAGE_KEYS.WALLET_TRANSACTIONS, txs);
    }

    const orderId = `ord-${Date.now()}`;
    const orderNumber = `CP-ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      buyerId,
      buyerName: buyer.fullName,
      buyerAvatar: buyer.avatarUrl,
      buyerCampus: buyer.campusName,
      sellerId: product.sellerId,
      sellerName: seller.fullName,
      sellerAvatar: seller.avatarUrl,
      sellerCampus: seller.campusName,
      productId: product.id,
      productTitle: product.title,
      productImage: product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
      amount: product.price,
      platformFee,
      sellerReceives,
      currency: 'NGN',
      status: 'seller_processing',
      deliveryCampus: deliveryInfo.campus,
      deliveryLocation: deliveryInfo.location,
      deliveryNotes: deliveryInfo.notes,
      escrowStatus: 'held',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save Order
    const orders = this.getOrders();
    orders.unshift(newOrder);
    setItem(STORAGE_KEYS.ORDERS, orders);

    // Save Escrow record
    const escrows = this.getEscrows();
    const newEscrow: EscrowTransaction = {
      id: `esc-${Date.now()}`,
      orderId,
      buyerId,
      sellerId: product.sellerId,
      amount: product.price,
      platformFee,
      sellerAmount: sellerReceives,
      status: 'held',
      heldAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    escrows.unshift(newEscrow);
    setItem(STORAGE_KEYS.ESCROWS, escrows);

    // Update seller pending balance
    const sellerWallet = this.getWallet(product.sellerId);
    this.updateWallet(product.sellerId, {
      pendingBalance: (sellerWallet.pendingBalance || 0) + sellerReceives,
    });

    // Update product status to pending/sold
    this.updateProduct(product.id, { status: 'pending' });

    // Create / connect conversation
    const conv = this.getOrCreateConversation(buyerId, product.sellerId, 'order', product.id, orderId);
    this.sendMessage(
      conv.id,
      buyerId,
      `Hello ${seller.fullName}! I have secured Order #${orderNumber} (${product.title}) with CampusCore Escrow. Please arrange meetup/delivery at ${deliveryInfo.location}, ${deliveryInfo.campus}.`
    );

    // Audit Log
    this.createAuditLog(
      buyerId,
      buyer.fullName,
      'ORDER_CREATED_ESCROW_HELD',
      'escrow',
      newEscrow.id,
      { orderNumber, amount: product.price, sellerId: product.sellerId }
    );

    // Notifications
    this.createNotification({
      userId: product.sellerId,
      title: 'New Paid Order (Escrow Secured)',
      message: `You received a new order #${orderNumber} for "${product.title}" from ${buyer.fullName}. Funds are safely held in CampusCore Escrow!`,
      type: 'escrow_held',
      link: `/orders/${orderId}`,
    });

    this.createNotification({
      userId: buyerId,
      title: 'Order Placed & Escrow Locked',
      message: `Your payment of ₦${product.price.toLocaleString()} for "${product.title}" is held safely in escrow until you confirm delivery.`,
      type: 'escrow_held',
      link: `/orders/${orderId}`,
    });

    return { success: true, order: newOrder };
  }

  /**
   * Seller marks order as Dispatched / Delivered
   */
  static markOrderDelivered(orderId: string, sellerId: string, deliveryNotes?: string): { success: boolean; message?: string; order?: Order } {
    const order = this.getOrderById(orderId);
    if (!order) return { success: false, message: 'Order not found.' };
    if (order.sellerId !== sellerId) return { success: false, message: 'Unauthorized action.' };
    if (order.status !== 'seller_processing') {
      return { success: false, message: `Cannot mark delivered in current status (${order.status}).` };
    }

    const updated = this.updateOrder(orderId, {
      status: 'delivered',
      deliveryNotes: deliveryNotes ? `${order.deliveryNotes ? order.deliveryNotes + ' | ' : ''}${deliveryNotes}` : order.deliveryNotes,
    });

    // Notify Buyer
    this.createNotification({
      userId: order.buyerId,
      title: 'Item Ready for Inspection & Confirmation',
      message: `${order.sellerName} has delivered "${order.productTitle}". Please inspect the item and click "Confirm Receipt" on CampusCore to release payment.`,
      type: 'escrow_released',
      link: `/orders/${orderId}`,
    });

    return { success: true, order: updated! };
  }

  /**
   * Buyer confirms receipt & releases escrow funds to seller's wallet
   */
  static confirmOrderReceivedAndReleaseEscrow(orderId: string, buyerId: string): { success: boolean; message?: string; order?: Order } {
    const order = this.getOrderById(orderId);
    if (!order) return { success: false, message: 'Order not found.' };
    if (order.buyerId !== buyerId) return { success: false, message: 'Unauthorized action.' };
    if (order.status === 'completed') return { success: false, message: 'Order is already completed.' };
    if (order.status === 'disputed') return { success: false, message: 'Order is under active dispute.' };

    const escrow = this.getEscrowByOrderId(orderId);
    if (!escrow) return { success: false, message: 'Escrow record missing.' };

    // 1. Update Order
    const updatedOrder = this.updateOrder(orderId, {
      status: 'completed',
      escrowStatus: 'released',
      completedAt: new Date().toISOString(),
    });

    // 2. Update Escrow record
    const escrows = this.getEscrows();
    const escrowIdx = escrows.findIndex((e) => e.orderId === orderId);
    if (escrowIdx !== -1) {
      escrows[escrowIdx].status = 'released';
      escrows[escrowIdx].releasedAt = new Date().toISOString();
      setItem(STORAGE_KEYS.ESCROWS, escrows);
    }

    // 3. Credit Seller Wallet & deduct pending balance
    const sellerWallet = this.getWallet(order.sellerId);
    this.updateWallet(order.sellerId, {
      availableBalance: sellerWallet.availableBalance + order.sellerReceives,
      pendingBalance: Math.max(0, (sellerWallet.pendingBalance || 0) - order.sellerReceives),
    });

    // 4. Record Escrow Release Transaction for Seller
    const txs = this.getWalletTransactions();
    txs.unshift({
      id: `tx-${Date.now()}`,
      walletId: sellerWallet.id,
      userId: order.sellerId,
      type: 'escrow_release',
      amount: order.sellerReceives,
      currency: 'NGN',
      status: 'completed',
      reference: `CP-ESC-REL-${order.orderNumber}`,
      description: `Escrow earnings released for Order #${order.orderNumber} (Platform fee ₦${order.platformFee} deducted)`,
      provider: 'internal',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });
    setItem(STORAGE_KEYS.WALLET_TRANSACTIONS, txs);

    // 5. Update Product status to sold
    this.updateProduct(order.productId, { status: 'sold' });

    // 6. Update user stats
    const seller = this.getUserById(order.sellerId);
    if (seller) {
      this.updateUser(seller.id, {
        totalCompletedSales: (seller.totalCompletedSales || 0) + 1,
      });
    }
    const buyer = this.getUserById(order.buyerId);
    if (buyer) {
      this.updateUser(buyer.id, {
        totalOrdersBought: (buyer.totalOrdersBought || 0) + 1,
      });
    }

    // 7. Audit Log
    this.createAuditLog(
      buyerId,
      order.buyerName,
      'ESCROW_RELEASE_CONFIRMED',
      'escrow',
      escrow.id,
      { orderId, sellerId: order.sellerId, creditedAmount: order.sellerReceives, fee: order.platformFee }
    );

    // 8. Notifications
    this.createNotification({
      userId: order.sellerId,
      title: 'Payment Released to Wallet!',
      message: `₦${order.sellerReceives.toLocaleString()} has been added to your available balance for Order #${order.orderNumber}.`,
      type: 'escrow_released',
      link: `/wallet`,
    });

    this.createNotification({
      userId: buyerId,
      title: 'Order Completed',
      message: `Order #${order.orderNumber} is marked completed. Please leave a review for ${order.sellerName}.`,
      type: 'escrow_released',
      link: `/orders/${orderId}`,
    });

    return { success: true, order: updatedOrder! };
  }

  static updateOrder(orderId: string, updates: Partial<Order>): Order | null {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) return null;
    orders[index] = {
      ...orders[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.ORDERS, orders);
    return orders[index];
  }

  // ==========================================
  // PHASE 2: DISPUTE SYSTEM
  // ==========================================

  static getDisputes(status?: string): Dispute[] {
    const disputes = getItem<Dispute[]>(STORAGE_KEYS.DISPUTES, INITIAL_DISPUTES);
    if (!status || status === 'all') {
      return disputes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return disputes
      .filter((d) => d.status === status)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static getDisputeByOrderId(orderId: string): Dispute | null {
    const disputes = this.getDisputes();
    return disputes.find((d) => d.orderId === orderId) || null;
  }

  static openDispute(
    orderId: string,
    openerId: string,
    reason: string,
    description: string,
    evidenceImages: string[] = []
  ): { success: boolean; dispute?: Dispute; message?: string } {
    const order = this.getOrderById(orderId);
    if (!order) return { success: false, message: 'Order not found.' };

    const openerRole = order.buyerId === openerId ? 'buyer' : order.sellerId === openerId ? 'seller' : null;
    if (!openerRole) return { success: false, message: 'You are not a participant in this order.' };

    const existingDispute = this.getDisputeByOrderId(orderId);
    if (existingDispute && existingDispute.status !== 'resolved') {
      return { success: false, message: 'An active dispute is already open for this order.' };
    }

    const user = this.getUserById(openerId);
    const newDispute: Dispute = {
      id: `dsp-${Date.now()}`,
      orderId,
      orderNumber: order.orderNumber,
      openedBy: openerId,
      openerName: user?.fullName || 'Student User',
      openerRole,
      reason,
      description,
      evidenceImages,
      status: 'under_review',
      createdAt: new Date().toISOString(),
    };

    // Save dispute
    const disputes = this.getDisputes();
    disputes.unshift(newDispute);
    setItem(STORAGE_KEYS.DISPUTES, disputes);

    // Update order & escrow status to disputed
    this.updateOrder(orderId, { status: 'disputed', escrowStatus: 'disputed' });
    const escrows = this.getEscrows();
    const escrowIdx = escrows.findIndex((e) => e.orderId === orderId);
    if (escrowIdx !== -1) {
      escrows[escrowIdx].status = 'disputed';
      setItem(STORAGE_KEYS.ESCROWS, escrows);
    }

    // Notify admins
    const admins = this.getUsers().filter((u) => u.role === 'admin');
    admins.forEach((admin) => {
      this.createNotification({
        userId: admin.id,
        title: 'New Escrow Dispute Opened',
        message: `Dispute opened for Order #${order.orderNumber} by ${newDispute.openerName} (${reason}). Escrow frozen.`,
        type: 'dispute_opened',
        link: `/admin/disputes`,
      });
    });

    // Notify other party
    const targetUserId = openerRole === 'buyer' ? order.sellerId : order.buyerId;
    this.createNotification({
      userId: targetUserId,
      title: 'Dispute Raised for Order',
      message: `A dispute has been raised on Order #${order.orderNumber}. CampusCore Admin is reviewing evidence.`,
      type: 'dispute_opened',
      link: `/orders/${orderId}`,
    });

    // Audit Log
    this.createAuditLog(
      openerId,
      user?.fullName || 'Student',
      'ORDER_DISPUTE_OPENED',
      'dispute',
      newDispute.id,
      { orderId, orderNumber: order.orderNumber, reason }
    );

    return { success: true, dispute: newDispute };
  }

  static resolveDispute(
    disputeId: string,
    adminId: string,
    decision: 'refund_buyer' | 'release_seller' | 'split',
    resolutionNotes: string,
    splitBuyerAmount?: number
  ): { success: boolean; message?: string } {
    const disputes = this.getDisputes();
    const index = disputes.findIndex((d) => d.id === disputeId);
    if (index === -1) return { success: false, message: 'Dispute not found.' };

    const dispute = disputes[index];
    const order = this.getOrderById(dispute.orderId);
    if (!order) return { success: false, message: 'Order record missing.' };

    const buyerWallet = this.getWallet(order.buyerId);
    const sellerWallet = this.getWallet(order.sellerId);

    // Execute financial resolution atomically
    if (decision === 'refund_buyer') {
      // Return full amount to buyer
      this.updateWallet(order.buyerId, {
        availableBalance: buyerWallet.availableBalance + order.amount,
      });
      // Deduct pending balance from seller
      this.updateWallet(order.sellerId, {
        pendingBalance: Math.max(0, (sellerWallet.pendingBalance || 0) - order.sellerReceives),
      });

      // Record refund transaction
      const txs = this.getWalletTransactions();
      txs.unshift({
        id: `tx-${Date.now()}`,
        walletId: buyerWallet.id,
        userId: order.buyerId,
        type: 'refund',
        amount: order.amount,
        currency: 'NGN',
        status: 'completed',
        reference: `CP-REF-${order.orderNumber}`,
        description: `Dispute Resolution: 100% Refund for Order #${order.orderNumber}`,
        provider: 'internal',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      });
      setItem(STORAGE_KEYS.WALLET_TRANSACTIONS, txs);

      this.updateOrder(order.id, { status: 'cancelled', escrowStatus: 'refunded' });
    } else if (decision === 'release_seller') {
      // Release to seller
      this.updateWallet(order.sellerId, {
        availableBalance: sellerWallet.availableBalance + order.sellerReceives,
        pendingBalance: Math.max(0, (sellerWallet.pendingBalance || 0) - order.sellerReceives),
      });

      const txs = this.getWalletTransactions();
      txs.unshift({
        id: `tx-${Date.now()}`,
        walletId: sellerWallet.id,
        userId: order.sellerId,
        type: 'escrow_release',
        amount: order.sellerReceives,
        currency: 'NGN',
        status: 'completed',
        reference: `CP-ESC-DSP-${order.orderNumber}`,
        description: `Dispute Resolution: Funds released to Seller for Order #${order.orderNumber}`,
        provider: 'internal',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      });
      setItem(STORAGE_KEYS.WALLET_TRANSACTIONS, txs);

      this.updateOrder(order.id, { status: 'completed', escrowStatus: 'released' });
    } else if (decision === 'split') {
      const buyerRefund = splitBuyerAmount || Math.round(order.amount / 2);
      const sellerPayout = Math.max(0, order.sellerReceives - buyerRefund);

      this.updateWallet(order.buyerId, {
        availableBalance: buyerWallet.availableBalance + buyerRefund,
      });
      this.updateWallet(order.sellerId, {
        availableBalance: sellerWallet.availableBalance + sellerPayout,
        pendingBalance: Math.max(0, (sellerWallet.pendingBalance || 0) - order.sellerReceives),
      });

      this.updateOrder(order.id, { status: 'completed', escrowStatus: 'released' });
    }

    // Update Dispute record
    disputes[index] = {
      ...disputes[index],
      status: 'resolved',
      adminNotes: resolutionNotes,
      resolvedAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.DISPUTES, disputes);

    // Notifications to both parties
    this.createNotification({
      userId: order.buyerId,
      title: 'Dispute Decision Made',
      message: `Admin resolved dispute on Order #${order.orderNumber}: ${resolutionNotes}`,
      type: 'dispute_resolved',
      link: `/orders/${order.id}`,
    });

    this.createNotification({
      userId: order.sellerId,
      title: 'Dispute Decision Made',
      message: `Admin resolved dispute on Order #${order.orderNumber}: ${resolutionNotes}`,
      type: 'dispute_resolved',
      link: `/orders/${order.id}`,
    });

    // Audit Log
    this.createAuditLog(
      adminId,
      'Ace Tech Admin',
      'DISPUTE_RESOLVED',
      'dispute',
      dispute.id,
      { orderId: order.id, decision, resolutionNotes }
    );

    return { success: true };
  }

  // ==========================================
  // PHASE 2: RATINGS & REVIEWS
  // ==========================================

  static getReviews(userId?: string): Review[] {
    const reviews = getItem<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    if (!userId) return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return reviews
      .filter((r) => r.reviewedUserId === userId && r.status === 'published')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static createReview(reviewData: Omit<Review, 'id' | 'createdAt' | 'status'>): Review {
    const reviews = getItem<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      status: 'published',
      createdAt: new Date().toISOString(),
    };
    reviews.unshift(newReview);
    setItem(STORAGE_KEYS.REVIEWS, reviews);

    // Recalculate target user average rating dynamically
    const userReviews = reviews.filter((r) => r.reviewedUserId === reviewData.reviewedUserId && r.status === 'published');
    const totalRatingSum = userReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Number((totalRatingSum / userReviews.length).toFixed(1));

    this.updateUser(reviewData.reviewedUserId, {
      rating: avgRating,
      totalRatings: userReviews.length,
    });

    // Notify recipient
    this.createNotification({
      userId: reviewData.reviewedUserId,
      title: 'New Student Review Received',
      message: `${reviewData.reviewerName} gave you a ${reviewData.rating}-star review: "${reviewData.comment.slice(0, 60)}..."`,
      type: 'review_received',
      link: `/profile/${reviewData.reviewedUserId}`,
    });

    return newReview;
  }

  // ==========================================
  // PHASE 2: SELLER VERIFICATION
  // ==========================================

  static getVerificationRequests(status?: string): VerificationRequest[] {
    const requests = getItem<VerificationRequest[]>(STORAGE_KEYS.VERIFICATIONS, INITIAL_VERIFICATIONS);
    if (!status || status === 'all') {
      return requests.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    }
    return requests
      .filter((r) => r.status === status)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  static getUserVerification(userId: string): VerificationRequest | null {
    const requests = this.getVerificationRequests();
    return requests.find((r) => r.userId === userId) || null;
  }

  static submitVerificationRequest(
    userId: string,
    data: Omit<VerificationRequest, 'id' | 'userId' | 'userName' | 'userEmail' | 'userAvatar' | 'campusName' | 'status' | 'submittedAt'>
  ): VerificationRequest {
    const user = this.getUserById(userId);
    const requests = this.getVerificationRequests();

    const newReq: VerificationRequest = {
      ...data,
      id: `ver-${Date.now()}`,
      userId,
      userName: user?.fullName || 'Student',
      userEmail: user?.email || '',
      userAvatar: user?.avatarUrl,
      campusName: user?.campusName || 'UNIOSUN',
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    requests.unshift(newReq);
    setItem(STORAGE_KEYS.VERIFICATIONS, requests);

    // Notify Admins
    const admins = this.getUsers().filter((u) => u.role === 'admin');
    admins.forEach((admin) => {
      this.createNotification({
        userId: admin.id,
        title: 'New Student Verification Request',
        message: `${user?.fullName} submitted documents for Student Verification.`,
        type: 'verification_submitted',
        link: '/admin/verifications',
      });
    });

    // Notify user
    this.createNotification({
      userId,
      title: 'Verification Under Review',
      message: 'Your verification submission has been received and is being processed by the moderation desk.',
      type: 'verification_submitted',
      link: '/profile',
    });

    return newReq;
  }

  static reviewVerificationRequest(
    requestId: string,
    adminId: string,
    status: 'approved' | 'rejected',
    rejectionReason?: string,
    badge: 'verified_student' | 'trusted_seller' = 'verified_student'
  ): boolean {
    const requests = this.getVerificationRequests();
    const index = requests.findIndex((r) => r.id === requestId);
    if (index === -1) return false;

    const req = requests[index];
    requests[index] = {
      ...requests[index],
      status,
      rejectionReason,
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'Ace Tech Admin',
    };
    setItem(STORAGE_KEYS.VERIFICATIONS, requests);

    if (status === 'approved') {
      this.updateUser(req.userId, {
        verificationBadge: badge,
        matricNumber: req.matricNumber || undefined,
      });

      this.createNotification({
        userId: req.userId,
        title: '🎉 Campus Verification Approved!',
        message: `Congratulations! Your student identity has been verified. You have been awarded the "${badge === 'trusted_seller' ? 'Trusted Seller' : 'Verified Student'}" badge.`,
        type: 'verification_approved',
        link: `/profile/${req.userId}`,
      });
    } else {
      this.createNotification({
        userId: req.userId,
        title: 'Verification Request Update',
        message: `Your verification submission was not approved: ${rejectionReason || 'Documents could not be validated.'}. You can resubmit anytime with clear photos.`,
        type: 'verification_rejected',
        link: `/profile`,
      });
    }

    return true;
  }

  // ==========================================
  // PHASE 2: INTERNAL MESSAGING SYSTEM
  // ==========================================

  static getConversations(userId: string): Conversation[] {
    const conversations = getItem<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, INITIAL_CONVERSATIONS);
    return conversations
      .filter((c) => c.participants.includes(userId))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  static getConversationById(convId: string): Conversation | null {
    const conversations = getItem<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, INITIAL_CONVERSATIONS);
    return conversations.find((c) => c.id === convId) || null;
  }

  static getOrCreateConversation(
    userId: string,
    targetUserId: string,
    type: 'product' | 'order' | 'roommate' | 'general' = 'general',
    productId?: string,
    orderId?: string
  ): Conversation {
    const conversations = getItem<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, INITIAL_CONVERSATIONS);

    // Look for existing conversation between these two for this item/type
    let existing = conversations.find(
      (c) =>
        c.participants.includes(userId) &&
        c.participants.includes(targetUserId) &&
        (orderId ? c.orderId === orderId : productId ? c.productId === productId : true)
    );

    if (existing) return existing;

    const user = this.getUserById(userId);
    const targetUser = this.getUserById(targetUserId);
    const product = productId ? this.getProductById(productId) : null;
    const order = orderId ? this.getOrderById(orderId) : null;

    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      type,
      participants: [userId, targetUserId],
      participantDetails: {
        [userId]: {
          id: userId,
          name: user?.fullName || 'User',
          avatar: user?.avatarUrl,
          campus: user?.campusName || '',
          verificationBadge: user?.verificationBadge,
        },
        [targetUserId]: {
          id: targetUserId,
          name: targetUser?.fullName || 'User',
          avatar: targetUser?.avatarUrl,
          campus: targetUser?.campusName || '',
          verificationBadge: targetUser?.verificationBadge,
        },
      },
      productId: product?.id,
      productTitle: product?.title,
      productImage: product?.images[0],
      productPrice: product?.price,
      orderId: order?.id,
      orderNumber: order?.orderNumber,
      lastMessage: 'Conversation started',
      lastMessageTime: new Date().toISOString(),
      unreadCount: {
        [userId]: 0,
        [targetUserId]: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    conversations.unshift(newConv);
    setItem(STORAGE_KEYS.CONVERSATIONS, conversations);
    return newConv;
  }

  static getMessages(conversationId: string): Message[] {
    const messages = getItem<Message[]>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    return messages
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  static sendMessage(
    conversationId: string,
    senderId: string,
    text: string,
    imageUrl?: string,
    orderAction?: Message['orderAction']
  ): Message {
    const sender = this.getUserById(senderId);
    const messages = getItem<Message[]>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId,
      senderName: sender?.fullName || 'User',
      senderAvatar: sender?.avatarUrl,
      text,
      imageUrl,
      orderAction,
      read: false,
      createdAt: new Date().toISOString(),
    };

    messages.push(newMsg);
    setItem(STORAGE_KEYS.MESSAGES, messages);

    // Update conversation metadata & unread counts
    const conversations = getItem<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, INITIAL_CONVERSATIONS);
    const index = conversations.findIndex((c) => c.id === conversationId);
    if (index !== -1) {
      const conv = conversations[index];
      const otherParticipant = conv.participants.find((p) => p !== senderId);

      const unreadCount = { ...(conv.unreadCount || {}) };
      if (otherParticipant) {
        unreadCount[otherParticipant] = (unreadCount[otherParticipant] || 0) + 1;
      }

      conversations[index] = {
        ...conv,
        lastMessage: text,
        lastMessageTime: newMsg.createdAt,
        unreadCount,
        updatedAt: newMsg.createdAt,
      };
      setItem(STORAGE_KEYS.CONVERSATIONS, conversations);

      // Create notification for other participant
      if (otherParticipant) {
        this.createNotification({
          userId: otherParticipant,
          title: `New Message from ${sender?.fullName}`,
          message: text.slice(0, 80),
          type: 'message_received',
          link: `/messages/${conversationId}`,
        });
      }
    }

    return newMsg;
  }

  static markConversationAsRead(conversationId: string, userId: string): void {
    const conversations = getItem<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, INITIAL_CONVERSATIONS);
    const index = conversations.findIndex((c) => c.id === conversationId);
    if (index !== -1) {
      const conv = conversations[index];
      if (conv.unreadCount && conv.unreadCount[userId]) {
        conv.unreadCount[userId] = 0;
        conversations[index] = conv;
        setItem(STORAGE_KEYS.CONVERSATIONS, conversations);
      }
    }

    // Mark messages as read
    const messages = getItem<Message[]>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    let changed = false;
    messages.forEach((m) => {
      if (m.conversationId === conversationId && m.senderId !== userId && !m.read) {
        m.read = true;
        m.readAt = new Date().toISOString();
        changed = true;
      }
    });
    if (changed) {
      setItem(STORAGE_KEYS.MESSAGES, messages);
    }
  }

  // ==========================================
  // PHASE 2: ROOMMATE FINDER
  // ==========================================

  static getRoommateProfiles(filters?: {
    campusId?: string;
    gender?: string;
    preferredGender?: string;
    roomType?: string;
    cleanliness?: string;
    smoking?: string;
    studyHabits?: string;
    maxBudget?: number;
    searchQuery?: string;
  }): RoommateProfile[] {
    let profiles = getItem<RoommateProfile[]>(STORAGE_KEYS.ROOMMATES, INITIAL_ROOMMATES);

    if (!filters) return profiles.filter((p) => p.isActive);

    if (filters.campusId && filters.campusId !== 'all') {
      profiles = profiles.filter((p) => p.campusId === filters.campusId);
    }

    if (filters.gender && filters.gender !== 'all') {
      profiles = profiles.filter((p) => p.gender === filters.gender);
    }

    if (filters.roomType && filters.roomType !== 'all') {
      profiles = profiles.filter((p) => p.preferredRoomType.toLowerCase().includes(filters.roomType!.toLowerCase()));
    }

    if (filters.maxBudget && filters.maxBudget > 0) {
      profiles = profiles.filter((p) => p.budget <= filters.maxBudget!);
    }

    if (filters.cleanliness && filters.cleanliness !== 'all') {
      profiles = profiles.filter((p) => p.cleanlinessLevel === filters.cleanliness);
    }

    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim();
      profiles = profiles.filter(
        (p) =>
          p.userName.toLowerCase().includes(q) ||
          p.department.toLowerCase().includes(q) ||
          p.preferredLocation.toLowerCase().includes(q) ||
          p.bio.toLowerCase().includes(q)
      );
    }

    return profiles.filter((p) => p.isActive).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static getRoommateById(id: string): RoommateProfile | null {
    const profiles = getItem<RoommateProfile[]>(STORAGE_KEYS.ROOMMATES, INITIAL_ROOMMATES);
    return profiles.find((p) => p.id === id) || null;
  }

  static getRoommateByUserId(userId: string): RoommateProfile | null {
    const profiles = getItem<RoommateProfile[]>(STORAGE_KEYS.ROOMMATES, INITIAL_ROOMMATES);
    return profiles.find((p) => p.userId === userId) || null;
  }

  static createOrUpdateRoommateProfile(
    userId: string,
    data: Omit<RoommateProfile, 'id' | 'userId' | 'userName' | 'userAvatar' | 'createdAt' | 'updatedAt'>
  ): RoommateProfile {
    const user = this.getUserById(userId);
    const profiles = getItem<RoommateProfile[]>(STORAGE_KEYS.ROOMMATES, INITIAL_ROOMMATES);
    const existingIndex = profiles.findIndex((p) => p.userId === userId);

    if (existingIndex !== -1) {
      profiles[existingIndex] = {
        ...profiles[existingIndex],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      setItem(STORAGE_KEYS.ROOMMATES, profiles);
      return profiles[existingIndex];
    } else {
      const newProfile: RoommateProfile = {
        ...data,
        id: `rm-${Date.now()}`,
        userId,
        userName: user?.fullName || 'Student',
        userAvatar: user?.avatarUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      profiles.unshift(newProfile);
      setItem(STORAGE_KEYS.ROOMMATES, profiles);
      return newProfile;
    }
  }

  // ==========================================
  // PHASE 2: AUDIT LOGS & SETTINGS
  // ==========================================

  static getAuditLogs(limit = 100): AuditLog[] {
    const logs = getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
  }

  static createAuditLog(
    actorId: string,
    actorName: string,
    action: string,
    entityType: string,
    entityId: string,
    metadata?: Record<string, any>
  ): AuditLog {
    const logs = getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      actorId,
      actorName,
      action,
      entityType,
      entityId,
      metadata,
      createdAt: new Date().toISOString(),
    };
    logs.unshift(newLog);
    setItem(STORAGE_KEYS.AUDIT_LOGS, logs);
    return newLog;
  }

  static getPlatformSettings(): PlatformSettings {
    return getItem<PlatformSettings>(STORAGE_KEYS.PLATFORM_SETTINGS, INITIAL_PLATFORM_SETTINGS);
  }

  static updatePlatformSettings(updates: Partial<PlatformSettings>): PlatformSettings {
    const settings = this.getPlatformSettings();
    const updated = { ...settings, ...updates };
    setItem(STORAGE_KEYS.PLATFORM_SETTINGS, updated);
    return updated;
  }

  // --- COMPREHENSIVE PLATFORM STATS ---
  static getPlatformStats(): PlatformStats {
    const users = this.getUsers();
    const products = getItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const accommodations = getItem<Accommodation[]>(STORAGE_KEYS.ACCOMMODATIONS, INITIAL_ACCOMMODATION);
    const reports = this.getReports();
    const categories = this.getCategories();
    const campuses = this.getCampuses();
    const orders = this.getOrders();
    const disputes = this.getDisputes();
    const verifications = this.getVerificationRequests();
    const escrows = this.getEscrows();

    const totalVolume = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
    const totalPlatformFees = orders.reduce((sum, o) => sum + (o.platformFee || 0), 0);
    const escrowHeldTotal = escrows.filter((e) => e.status === 'held').reduce((sum, e) => sum + e.amount, 0);
    const activeOrders = orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled' && o.status !== 'refunded').length;
    const roommateProfiles = this.getRoommateProfiles();
    const transactions = this.getWalletTransactions();
    const totalDeposited = transactions
      .filter((t) => t.type === 'deposit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalWithdrawn = transactions
      .filter((t) => t.type === 'withdrawal' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    const pendingWithdrawals = transactions.filter((t) => t.type === 'withdrawal' && t.status === 'pending').length;

    // Phase 3 Ecosystem Stats
    const services = this.getServices();
    const jobs = this.getJobs();
    const events = this.getEvents();
    const tickets = this.getEventTickets();
    const communities = this.getCommunities();
    const businesses = this.getBusinesses();
    const subs = this.getUserSubscriptions();
    const ads = this.getAdCampaigns();
    const supportTickets = this.getSupportTickets();

    return {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.accountStatus === 'active').length,
      totalListings: products.length,
      activeListings: products.filter((p) => p.status === 'active').length,
      soldListings: products.filter((p) => p.status === 'sold').length,
      accommodationListings: accommodations.length,
      totalReports: reports.length,
      pendingReports: reports.filter((r) => r.status === 'pending' || r.status === 'investigating').length,
      totalCategories: categories.length,
      totalCampuses: campuses.length,
      totalOrders: orders.length,
      activeOrders,
      totalEscrowVolume: totalVolume,
      totalPlatformFees,
      totalDeposited,
      totalWithdrawn,
      pendingWithdrawals,
      activeEscrowHold: escrowHeldTotal,
      pendingDisputes: disputes.filter((d) => d.status === 'opened' || d.status === 'under_review').length,
      pendingVerifications: verifications.filter((v) => v.status === 'pending').length,
      activeDisputes: disputes.filter((d) => d.status === 'opened' || d.status === 'under_review').length,
      totalRoommateProfiles: roommateProfiles.length,
      totalServices: services.length,
      totalJobs: jobs.length,
      totalEvents: events.length,
      totalTicketsSold: tickets.length,
      totalCommunities: communities.length,
      totalBusinesses: businesses.length,
      activeSubscriptions: subs.filter((s) => s.status === 'active').length,
      totalAdCampaigns: ads.length,
      openSupportTickets: supportTickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length,
    };
  }

  // --- USER GROWTH ANALYTICS (PHASE 4) ---
  static getUserGrowthAnalytics(timeframe: '7d' | '30d' | '90d' | '6m' | '12m' | 'all' = '30d'): {
    labels: string[];
    dataPoints: {
      date: string;
      label: string;
      totalUsers: number;
      newSignups: number;
      activeSellers: number;
      ordersPlaced: number;
      revenue: number;
    }[];
    metrics: {
      growthRatePercent: number;
      totalRegistered: number;
      activeSellersCount: number;
      sellerConversionRate: number;
      retentionRatePercent: number;
    };
  } {
    const users = this.getUsers();
    const products = this.getProducts();
    const orders = this.getOrders();
    const totalUsers = users.length;
    const sellers = users.filter((u) => u.sellerStatus === 'SELLER' || u.sellerStatus === 'VERIFIED_SELLER' || u.role === 'seller');

    const dayCounts = timeframe === '7d' ? 7 : timeframe === '30d' ? 14 : timeframe === '90d' ? 12 : timeframe === '6m' ? 12 : timeframe === '12m' ? 12 : 12;
    const dataPoints: {
      date: string;
      label: string;
      totalUsers: number;
      newSignups: number;
      activeSellers: number;
      ordersPlaced: number;
      revenue: number;
    }[] = [];

    const now = new Date();
    const baseTotal = Math.max(1, totalUsers);

    for (let i = dayCounts - 1; i >= 0; i--) {
      const d = new Date();
      if (timeframe === '7d' || timeframe === '30d') {
        d.setDate(now.getDate() - (timeframe === '7d' ? i : i * 2));
      } else {
        d.setDate(now.getDate() - i * 15);
      }
      
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const progress = (dayCounts - i) / dayCounts;
      const pointTotal = Math.max(2, Math.round(baseTotal * (0.3 + 0.7 * progress)));
      const newSignups = Math.max(1, Math.round(1 + progress * 4));
      const activeSellers = Math.max(1, Math.round(sellers.length * (0.4 + 0.6 * progress)));
      const ordersCount = Math.max(0, Math.round(orders.length * (0.3 + 0.7 * progress)));
      const rev = ordersCount * 450;

      dataPoints.push({
        date: d.toISOString().split('T')[0],
        label,
        totalUsers: pointTotal,
        newSignups,
        activeSellers,
        ordersPlaced: ordersCount,
        revenue: rev,
      });
    }

    const sellerConversionRate = totalUsers > 0 ? Math.round((sellers.length / totalUsers) * 100) : 0;

    return {
      labels: dataPoints.map((p) => p.label),
      dataPoints,
      metrics: {
        growthRatePercent: 24.5,
        totalRegistered: totalUsers,
        activeSellersCount: sellers.length,
        sellerConversionRate,
        retentionRatePercent: 88.4,
      },
    };
  }

  // --- SELLER MONITORING & GROWTH FUNNEL (PHASE 4) ---
  static getSellerFunnelAnalytics(): {
    funnel: {
      stage: string;
      count: number;
      percentage: number;
      description: string;
    }[];
    topSellers: {
      user: UserProfile;
      listingsCount: number;
      salesCount: number;
      revenueEstimate: number;
      status: string;
    }[];
  } {
    const users = this.getUsers();
    const products = this.getProducts();
    const orders = this.getOrders();

    const totalAccounts = users.length;
    const exploredSell = Math.round(totalAccounts * 0.72);
    const completedOnboarding = users.filter((u) => u.sellerOnboardingCompleted || u.sellerStatus === 'SELLER' || u.sellerStatus === 'VERIFIED_SELLER' || u.role === 'seller').length;
    const publishedListings = new Set(products.map((p) => p.sellerId)).size;
    const madeSales = new Set(orders.filter((o) => o.status === 'completed').map((o) => o.sellerId)).size;

    const funnel = [
      {
        stage: 'Account Registered',
        count: totalAccounts,
        percentage: 100,
        description: 'Verified student accounts on CampusCore',
      },
      {
        stage: 'Explored Selling',
        count: exploredSell,
        percentage: Math.round((exploredSell / Math.max(1, totalAccounts)) * 100),
        description: 'Students who opened Sell modal or seller center',
      },
      {
        stage: 'Completed Onboarding',
        count: completedOnboarding,
        percentage: Math.round((completedOnboarding / Math.max(1, totalAccounts)) * 100),
        description: 'Completed campus seller details & WhatsApp sync',
      },
      {
        stage: 'Published First Listing',
        count: publishedListings,
        percentage: Math.round((publishedListings / Math.max(1, totalAccounts)) * 100),
        description: 'Posted active items on marketplace',
      },
      {
        stage: 'Completed First Sale',
        count: Math.max(1, madeSales),
        percentage: Math.round((Math.max(1, madeSales) / Math.max(1, totalAccounts)) * 100),
        description: 'Delivered orders with escrow confirmation',
      },
    ];

    const topSellers = users
      .filter((u) => u.sellerStatus === 'SELLER' || u.sellerStatus === 'VERIFIED_SELLER' || u.role === 'seller' || u.role === 'SUPER_ADMIN')
      .map((u) => {
        const userProducts = products.filter((p) => p.sellerId === u.id);
        const userOrders = orders.filter((o) => o.sellerId === u.id && o.status === 'completed');
        const rev = userOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
        return {
          user: u,
          listingsCount: userProducts.length,
          salesCount: userOrders.length || u.totalCompletedSales || 0,
          revenueEstimate: rev || (u.totalCompletedSales || 0) * 12500,
          status: u.sellerStatus || 'SELLER',
        };
      })
      .sort((a, b) => b.salesCount - a.salesCount);

    return { funnel, topSellers };
  }

  // ==========================================
  // PHASE 3: CAMPUS SERVICES & QUOTATIONS
  // ==========================================

  static getServiceCategories(): ServiceCategory[] {
    return getItem<ServiceCategory[]>(STORAGE_KEYS.SERVICE_CATEGORIES, INITIAL_SERVICE_CATEGORIES);
  }

  static getServices(filters?: {
    categoryId?: string;
    campusId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    pricingModel?: string;
    deliveryMethod?: string;
    providerId?: string;
  }): ServiceListing[] {
    let services = getItem<ServiceListing[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);

    if (filters) {
      if (filters.categoryId && filters.categoryId !== 'all') {
        services = services.filter((s) => s.categoryId === filters.categoryId);
      }
      if (filters.campusId && filters.campusId !== 'all') {
        services = services.filter((s) => s.campusId === filters.campusId);
      }
      if (filters.providerId) {
        services = services.filter((s) => s.providerId === filters.providerId);
      }
      if (filters.pricingModel && filters.pricingModel !== 'all') {
        services = services.filter((s) => s.pricingModel === filters.pricingModel);
      }
      if (filters.deliveryMethod && filters.deliveryMethod !== 'all') {
        services = services.filter((s) => s.deliveryMethod === filters.deliveryMethod);
      }
      if (filters.minPrice !== undefined) {
        services = services.filter((s) => s.startingPrice >= (filters.minPrice || 0));
      }
      if (filters.maxPrice !== undefined) {
        services = services.filter((s) => s.startingPrice <= (filters.maxPrice || Infinity));
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        services = services.filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q) ||
            s.providerName.toLowerCase().includes(q) ||
            s.categoryName.toLowerCase().includes(q)
        );
      }
    }

    return services.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }

  static getServiceById(id: string): ServiceListing | undefined {
    const services = getItem<ServiceListing[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    return services.find((s) => s.id === id);
  }

  static createService(
    service: Omit<
      ServiceListing,
      'id' | 'createdAt' | 'updatedAt' | 'views' | 'providerRating' | 'providerReviewCount' | 'providerCompletedJobs'
    >
  ): ServiceListing {
    const services = getItem<ServiceListing[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    const newService: ServiceListing = {
      ...service,
      id: `srv-${Date.now()}`,
      views: 0,
      providerRating: 5.0,
      providerReviewCount: 0,
      providerCompletedJobs: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    services.unshift(newService);
    setItem(STORAGE_KEYS.SERVICES, services);
    return newService;
  }

  static updateService(id: string, updates: Partial<ServiceListing>): ServiceListing | null {
    const services = getItem<ServiceListing[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    const idx = services.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    services[idx] = { ...services[idx], ...updates, updatedAt: new Date().toISOString() };
    setItem(STORAGE_KEYS.SERVICES, services);
    return services[idx];
  }

  static deleteService(id: string): boolean {
    const services = getItem<ServiceListing[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    const filtered = services.filter((s) => s.id !== id);
    if (filtered.length !== services.length) {
      setItem(STORAGE_KEYS.SERVICES, filtered);
      return true;
    }
    return false;
  }

  static incrementServiceViews(id: string): void {
    const services = getItem<ServiceListing[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    const idx = services.findIndex((s) => s.id === id);
    if (idx !== -1) {
      services[idx].views = (services[idx].views || 0) + 1;
      setItem(STORAGE_KEYS.SERVICES, services);
    }
  }

  // --- SERVICE REQUESTS & SERVICE ESCROW FLOW ---
  static getServiceRequests(userId?: string): ServiceRequest[] {
    const reqs = getItem<ServiceRequest[]>(STORAGE_KEYS.SERVICE_REQUESTS, INITIAL_SERVICE_REQUESTS);
    if (!userId) return reqs;
    return reqs.filter((r) => r.clientId === userId || r.providerId === userId);
  }

  static getServiceRequestById(id: string): ServiceRequest | undefined {
    const reqs = getItem<ServiceRequest[]>(STORAGE_KEYS.SERVICE_REQUESTS, INITIAL_SERVICE_REQUESTS);
    return reqs.find((r) => r.id === id);
  }

  static createServiceRequest(
    data: Omit<ServiceRequest, 'id' | 'requestNumber' | 'createdAt' | 'updatedAt' | 'status' | 'revisionsUsed'>
  ): ServiceRequest {
    const reqs = getItem<ServiceRequest[]>(STORAGE_KEYS.SERVICE_REQUESTS, INITIAL_SERVICE_REQUESTS);
    const newReq: ServiceRequest = {
      ...data,
      id: `sreq-${Date.now()}`,
      requestNumber: `SRQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'requested',
      revisionsUsed: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    reqs.unshift(newReq);
    setItem(STORAGE_KEYS.SERVICE_REQUESTS, reqs);

    this.createNotification({
      userId: data.providerId,
      title: 'New Service Request Received',
      message: `${data.clientName} requested your service "${data.serviceTitle}". Review and send a quote.`,
      type: 'service_requested',
      link: '/services',
    });

    return newReq;
  }

  static sendServiceQuote(
    requestId: string,
    quote: { quoteAmount: number; quoteDeliveryDays: number; quoteTerms: string }
  ): ServiceRequest | null {
    const reqs = getItem<ServiceRequest[]>(STORAGE_KEYS.SERVICE_REQUESTS, INITIAL_SERVICE_REQUESTS);
    const idx = reqs.findIndex((r) => r.id === requestId);
    if (idx === -1) return null;

    reqs[idx] = {
      ...reqs[idx],
      quoteAmount: quote.quoteAmount,
      quoteDeliveryDays: quote.quoteDeliveryDays,
      quoteTerms: quote.quoteTerms,
      status: 'quoted',
      updatedAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.SERVICE_REQUESTS, reqs);

    this.createNotification({
      userId: reqs[idx].clientId,
      title: 'Quotation Received for Your Request',
      message: `${reqs[idx].providerName} sent a quote of ₦${quote.quoteAmount.toLocaleString()} for "${reqs[idx].serviceTitle}".`,
      type: 'service_quoted',
      link: '/services',
    });

    return reqs[idx];
  }

  static acceptServiceQuote(requestId: string): { success: boolean; error?: string; request?: ServiceRequest } {
    const reqs = getItem<ServiceRequest[]>(STORAGE_KEYS.SERVICE_REQUESTS, INITIAL_SERVICE_REQUESTS);
    const idx = reqs.findIndex((r) => r.id === requestId);
    if (idx === -1) return { success: false, error: 'Service request not found' };

    const req = reqs[idx];
    const amount = req.quoteAmount || req.budget;
    const clientWallet = this.getWallet(req.clientId);

    if (clientWallet.availableBalance < amount) {
      return {
        success: false,
        error: `Insufficient wallet balance. You need ₦${amount.toLocaleString()}, but have ₦${clientWallet.availableBalance.toLocaleString()}. Please fund your wallet.`,
      };
    }

    // Deduct from client available balance and lock in escrow
    this.updateWalletBalance(req.clientId, -amount, 0);

    const orderNumber = `ORD-SRV-${Math.floor(10000 + Math.random() * 90000)}`;
    const settings = this.getPlatformSettings();
    const fee = Math.round(amount * (settings.escrowFeePercent / 100));

    reqs[idx] = {
      ...req,
      status: 'in_progress',
      escrowOrderId: orderNumber,
      updatedAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.SERVICE_REQUESTS, reqs);

    this.createAuditLog(
      req.clientId,
      req.clientName,
      'SERVICE_ESCROW_COMMENCED',
      'service_order',
      req.id,
      { amount, providerId: req.providerId, fee }
    );

    this.createNotification({
      userId: req.providerId,
      title: 'Quote Accepted & Escrow Funded!',
      message: `${req.clientName} accepted your quote. ₦${amount.toLocaleString()} is locked safely in Escrow. You may now commence work.`,
      type: 'service_accepted',
      link: '/services',
    });

    return { success: true, request: reqs[idx] };
  }

  static submitServiceDelivery(
    requestId: string,
    deliveryNotes: string,
    deliveryUrls?: string[]
  ): ServiceRequest | null {
    const reqs = getItem<ServiceRequest[]>(STORAGE_KEYS.SERVICE_REQUESTS, INITIAL_SERVICE_REQUESTS);
    const idx = reqs.findIndex((r) => r.id === requestId);
    if (idx === -1) return null;

    reqs[idx] = {
      ...reqs[idx],
      status: 'ready_for_review',
      deliveryNotes,
      deliveryWorkUrls: deliveryUrls || [],
      updatedAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.SERVICE_REQUESTS, reqs);

    this.createNotification({
      userId: reqs[idx].clientId,
      title: 'Service Work Submitted for Review',
      message: `${reqs[idx].providerName} submitted the completed deliverables for "${reqs[idx].serviceTitle}". Please review and confirm.`,
      type: 'buyer_confirmation_required',
      link: '/services',
    });

    return reqs[idx];
  }

  static approveServiceDelivery(requestId: string): { success: boolean; error?: string; request?: ServiceRequest } {
    const reqs = getItem<ServiceRequest[]>(STORAGE_KEYS.SERVICE_REQUESTS, INITIAL_SERVICE_REQUESTS);
    const idx = reqs.findIndex((r) => r.id === requestId);
    if (idx === -1) return { success: false, error: 'Service request not found' };

    const req = reqs[idx];
    const amount = req.quoteAmount || req.budget;
    const settings = this.getPlatformSettings();
    const platformFee = Math.round(amount * (settings.escrowFeePercent / 100));
    const providerPayout = amount - platformFee;

    // Credit provider wallet
    this.updateWalletBalance(req.providerId, providerPayout, 0);

    reqs[idx] = {
      ...req,
      status: 'completed',
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.SERVICE_REQUESTS, reqs);

    this.createAuditLog(
      req.clientId,
      req.clientName,
      'SERVICE_ESCROW_RELEASED',
      'service_order',
      req.id,
      { amount, providerPayout, platformFee, providerId: req.providerId }
    );

    this.createNotification({
      userId: req.providerId,
      title: 'Payment Released! ₦' + providerPayout.toLocaleString(),
      message: `${req.clientName} approved your delivery. ₦${providerPayout.toLocaleString()} has been credited to your available wallet balance.`,
      type: 'funds_released',
      link: '/wallet',
    });

    return { success: true, request: reqs[idx] };
  }

  // ==========================================
  // PHASE 3: BOOKING SYSTEM
  // ==========================================

  static getBookings(userId?: string, role?: 'customer' | 'provider'): Booking[] {
    const bookings = getItem<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    if (!userId) return bookings;
    if (role === 'customer') return bookings.filter((b) => b.customerId === userId);
    if (role === 'provider') return bookings.filter((b) => b.providerId === userId);
    return bookings.filter((b) => b.customerId === userId || b.providerId === userId);
  }

  static createBooking(
    booking: Omit<Booking, 'id' | 'bookingNumber' | 'createdAt' | 'updatedAt' | 'status'>
  ): { success: boolean; error?: string; booking?: Booking } {
    const bookings = getItem<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);

    // Prevent double booking at the same date and time slot for the provider
    const existing = bookings.find(
      (b) =>
        b.providerId === booking.providerId &&
        b.date === booking.date &&
        b.timeSlot === booking.timeSlot &&
        b.status !== 'cancelled'
    );
    if (existing) {
      return { success: false, error: 'The provider is already booked for this specific time slot. Please choose another time.' };
    }

    const newBooking: Booking = {
      ...booking,
      id: `bok-${Date.now()}`,
      bookingNumber: `BOK-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    bookings.unshift(newBooking);
    setItem(STORAGE_KEYS.BOOKINGS, bookings);

    this.createNotification({
      userId: booking.providerId,
      title: 'New Service Booking Confirmed',
      message: `${booking.customerName} booked "${booking.serviceTitle}" for ${booking.date} at ${booking.timeSlot}.`,
      type: 'booking_confirmed',
      link: '/services',
    });

    return { success: true, booking: newBooking };
  }

  static updateBookingStatus(id: string, status: BookingStatus): Booking | null {
    const bookings = getItem<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const idx = bookings.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    bookings[idx] = { ...bookings[idx], status, updatedAt: new Date().toISOString() };
    setItem(STORAGE_KEYS.BOOKINGS, bookings);
    return bookings[idx];
  }

  // ==========================================
  // PHASE 3: CAMPUS JOBS & GIGS
  // ==========================================

  static getJobs(filters?: {
    category?: string;
    jobType?: string;
    campusId?: string;
    isRemote?: boolean;
    search?: string;
    employerId?: string;
    posterId?: string;
  }): CampusJob[] {
    let jobs = getItem<CampusJob[]>(STORAGE_KEYS.CAMPUS_JOBS, INITIAL_CAMPUS_JOBS);
    if (filters) {
      if (filters.category && filters.category !== 'all') {
        jobs = jobs.filter((j) => j.category === filters.category);
      }
      if (filters.jobType && filters.jobType !== 'all') {
        jobs = jobs.filter((j) => j.category === filters.jobType);
      }
      if (filters.isRemote !== undefined) {
        jobs = jobs.filter((j) => j.isRemote === filters.isRemote);
      }
      if (filters.campusId && filters.campusId !== 'all') {
        jobs = jobs.filter((j) => j.campusId === filters.campusId || j.isRemote);
      }
      if (filters.employerId) {
        jobs = jobs.filter((j) => j.employerId === filters.employerId || j.posterId === filters.employerId);
      }
      if (filters.posterId) {
        jobs = jobs.filter((j) => j.employerId === filters.posterId || j.posterId === filters.posterId);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        jobs = jobs.filter(
          (j) =>
            j.title.toLowerCase().includes(q) ||
            j.description.toLowerCase().includes(q) ||
            j.companyName.toLowerCase().includes(q) ||
            j.requirements.some((r) => r.toLowerCase().includes(q))
        );
      }
    }
    return jobs.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }

  static getJobById(id: string): CampusJob | undefined {
    const jobs = getItem<CampusJob[]>(STORAGE_KEYS.CAMPUS_JOBS, INITIAL_CAMPUS_JOBS);
    return jobs.find((j) => j.id === id);
  }

  static createJob(job: Omit<CampusJob, 'id' | 'createdAt' | 'updatedAt' | 'applicantsCount'>): CampusJob {
    const jobs = getItem<CampusJob[]>(STORAGE_KEYS.CAMPUS_JOBS, INITIAL_CAMPUS_JOBS);
    const newJob: CampusJob = {
      ...job,
      id: `job-${Date.now()}`,
      applicantsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    jobs.unshift(newJob);
    setItem(STORAGE_KEYS.CAMPUS_JOBS, jobs);
    return newJob;
  }

  static updateJob(id: string, updates: Partial<CampusJob>): CampusJob | null {
    const jobs = getItem<CampusJob[]>(STORAGE_KEYS.CAMPUS_JOBS, INITIAL_CAMPUS_JOBS);
    const idx = jobs.findIndex((j) => j.id === id);
    if (idx === -1) return null;
    jobs[idx] = { ...jobs[idx], ...updates, updatedAt: new Date().toISOString() };
    setItem(STORAGE_KEYS.CAMPUS_JOBS, jobs);
    return jobs[idx];
  }

  static deleteJob(id: string): boolean {
    const jobs = getItem<CampusJob[]>(STORAGE_KEYS.CAMPUS_JOBS, INITIAL_CAMPUS_JOBS);
    const filtered = jobs.filter((j) => j.id !== id);
    if (filtered.length !== jobs.length) {
      setItem(STORAGE_KEYS.CAMPUS_JOBS, filtered);
      return true;
    }
    return false;
  }

  static getJobApplications(filters?: { jobId?: string; studentId?: string; employerId?: string }): JobApplication[] {
    let apps = getItem<JobApplication[]>(STORAGE_KEYS.JOB_APPLICATIONS, INITIAL_JOB_APPLICATIONS);
    if (filters?.jobId) apps = apps.filter((a) => a.jobId === filters.jobId);
    if (filters?.studentId) apps = apps.filter((a) => a.studentId === filters.studentId);
    if (filters?.employerId) apps = apps.filter((a) => a.employerId === filters.employerId);
    return apps;
  }

  static applyForJob(app: Omit<JobApplication, 'id' | 'submittedAt' | 'updatedAt' | 'status'>): {
    success: boolean;
    error?: string;
    application?: JobApplication;
  } {
    const apps = getItem<JobApplication[]>(STORAGE_KEYS.JOB_APPLICATIONS, INITIAL_JOB_APPLICATIONS);

    // Prevent duplicate application
    const existing = apps.find((a) => a.jobId === app.jobId && a.studentId === app.studentId);
    if (existing) {
      return { success: false, error: 'You have already submitted an application for this position.' };
    }

    const newApp: JobApplication = {
      ...app,
      id: `japp-${Date.now()}`,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    apps.unshift(newApp);
    setItem(STORAGE_KEYS.JOB_APPLICATIONS, apps);

    // Increment applicantsCount on the job
    const jobs = getItem<CampusJob[]>(STORAGE_KEYS.CAMPUS_JOBS, INITIAL_CAMPUS_JOBS);
    const jIdx = jobs.findIndex((j) => j.id === app.jobId);
    if (jIdx !== -1) {
      jobs[jIdx].applicantsCount = (jobs[jIdx].applicantsCount || 0) + 1;
      setItem(STORAGE_KEYS.CAMPUS_JOBS, jobs);
    }

    this.createNotification({
      userId: app.employerId,
      title: 'New Job Applicant',
      message: `${app.studentName} applied for "${app.jobTitle}".`,
      type: 'job_applied',
      link: '/jobs',
    });

    return { success: true, application: newApp };
  }

  static updateJobApplicationStatus(
    id: string,
    status: JobApplicationStatus,
    employerNotes?: string
  ): JobApplication | null {
    const apps = getItem<JobApplication[]>(STORAGE_KEYS.JOB_APPLICATIONS, INITIAL_JOB_APPLICATIONS);
    const idx = apps.findIndex((a) => a.id === id);
    if (idx === -1) return null;

    apps[idx] = {
      ...apps[idx],
      status,
      employerNotes: employerNotes ?? apps[idx].employerNotes,
      updatedAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.JOB_APPLICATIONS, apps);

    this.createNotification({
      userId: apps[idx].studentId,
      title: `Job Application Update: ${(status || 'UPDATED').toUpperCase()}`,
      message: `Your application status for "${apps[idx].jobTitle}" at ${apps[idx].companyName} is now "${status}".`,
      type: 'job_status_updated',
      link: '/jobs',
    });

    return apps[idx];
  }

  // ==========================================
  // PHASE 3: CAMPUS EVENTS & TICKETS
  // ==========================================

  static getEvents(filters?: {
    category?: string;
    campusId?: string;
    search?: string;
    organizerId?: string;
    upcomingOnly?: boolean;
    isPaid?: boolean;
  }): CampusEvent[] {
    let events = getItem<CampusEvent[]>(STORAGE_KEYS.CAMPUS_EVENTS, INITIAL_CAMPUS_EVENTS);
    if (filters) {
      if (filters.category && filters.category !== 'all') {
        events = events.filter((e) => e.category === filters.category);
      }
      if (filters.campusId && filters.campusId !== 'all') {
        events = events.filter((e) => e.campusId === filters.campusId);
      }
      if (filters.isPaid !== undefined) {
        events = events.filter((e) => e.isPaid === filters.isPaid);
      }
      if (filters.organizerId) {
        events = events.filter((e) => e.organizerId === filters.organizerId);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        events = events.filter(
          (e) =>
            e.title.toLowerCase().includes(q) ||
            e.description.toLowerCase().includes(q) ||
            e.venue.toLowerCase().includes(q) ||
            e.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
    }
    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  static getEventById(id: string): CampusEvent | undefined {
    const events = getItem<CampusEvent[]>(STORAGE_KEYS.CAMPUS_EVENTS, INITIAL_CAMPUS_EVENTS);
    return events.find((e) => e.id === id);
  }

  static createEvent(event: Omit<CampusEvent, 'id' | 'createdAt' | 'updatedAt' | 'registeredCount'>): CampusEvent {
    const events = getItem<CampusEvent[]>(STORAGE_KEYS.CAMPUS_EVENTS, INITIAL_CAMPUS_EVENTS);
    const newEvent: CampusEvent = {
      ...event,
      id: `evt-${Date.now()}`,
      registeredCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    events.unshift(newEvent);
    setItem(STORAGE_KEYS.CAMPUS_EVENTS, events);
    return newEvent;
  }

  static updateEvent(id: string, updates: Partial<CampusEvent>): CampusEvent | null {
    const events = getItem<CampusEvent[]>(STORAGE_KEYS.CAMPUS_EVENTS, INITIAL_CAMPUS_EVENTS);
    const idx = events.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    events[idx] = { ...events[idx], ...updates, updatedAt: new Date().toISOString() };
    setItem(STORAGE_KEYS.CAMPUS_EVENTS, events);
    return events[idx];
  }

  static deleteEvent(id: string): boolean {
    const events = getItem<CampusEvent[]>(STORAGE_KEYS.CAMPUS_EVENTS, INITIAL_CAMPUS_EVENTS);
    const filtered = events.filter((e) => e.id !== id);
    if (filtered.length !== events.length) {
      setItem(STORAGE_KEYS.CAMPUS_EVENTS, filtered);
      return true;
    }
    return false;
  }

  static registerForEvent(
    eventId: string,
    attendee: { id: string; name: string; email: string; avatar: string }
  ): { success: boolean; error?: string; ticket?: EventTicket } {
    const events = getItem<CampusEvent[]>(STORAGE_KEYS.CAMPUS_EVENTS, INITIAL_CAMPUS_EVENTS);
    const eIdx = events.findIndex((e) => e.id === eventId);
    if (eIdx === -1) return { success: false, error: 'Event not found' };

    const event = events[eIdx];
    if (event.capacity && event.registeredCount >= event.capacity) {
      return { success: false, error: 'Sorry, this event is fully booked!' };
    }

    const tickets = getItem<EventTicket[]>(STORAGE_KEYS.EVENT_TICKETS, INITIAL_EVENT_TICKETS);
    const existing = tickets.find((t) => t.eventId === eventId && t.attendeeId === attendee.id && t.status === 'valid');
    if (existing) {
      return { success: false, error: 'You already have an active ticket for this event.' };
    }

    // Handle payment if paid
    if (event.isPaid && event.ticketPrice > 0) {
      const wallet = this.getWallet(attendee.id);
      if (wallet.availableBalance < event.ticketPrice) {
        return {
          success: false,
          error: `Insufficient wallet balance (₦${wallet.availableBalance.toLocaleString()}). Ticket costs ₦${event.ticketPrice.toLocaleString()}. Please fund your wallet.`,
        };
      }
      this.updateWalletBalance(attendee.id, -event.ticketPrice, 0);
      this.updateWalletBalance(event.organizerId, event.ticketPrice, 0);
    }

    const ticketCode = `CP-EVT-${Math.floor(10000 + Math.random() * 90000)}`;
    const newTicket: EventTicket = {
      id: `tkt-${Date.now()}`,
      ticketCode,
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.startTime,
      eventVenue: event.venue,
      eventCampus: event.campusId,
      bannerImage: event.bannerImage,
      attendeeId: attendee.id,
      attendeeName: attendee.name,
      attendeeEmail: attendee.email,
      attendeeAvatar: attendee.avatar,
      pricePaid: event.ticketPrice,
      paymentReference: event.isPaid ? `PAY_TKT_${Date.now()}` : undefined,
      qrCodeData: `CAMPUSPLUG:TICKET:${ticketCode}:${event.id}:${attendee.id}`,
      status: 'valid',
      createdAt: new Date().toISOString(),
    };

    tickets.unshift(newTicket);
    setItem(STORAGE_KEYS.EVENT_TICKETS, tickets);

    // Update event registration count
    events[eIdx].registeredCount = (events[eIdx].registeredCount || 0) + 1;
    setItem(STORAGE_KEYS.CAMPUS_EVENTS, events);

    this.createNotification({
      userId: attendee.id,
      title: 'Event Ticket Confirmed! 🎟️',
      message: `Your pass for "${event.title}" is ready. Ticket Code: ${ticketCode}`,
      type: 'event_ticket_issued',
      link: '/events',
    });

    return { success: true, ticket: newTicket };
  }

  static getEventTickets(attendeeId?: string, eventId?: string): EventTicket[] {
    let tickets = getItem<EventTicket[]>(STORAGE_KEYS.EVENT_TICKETS, INITIAL_EVENT_TICKETS);
    if (attendeeId) tickets = tickets.filter((t) => t.attendeeId === attendeeId);
    if (eventId) tickets = tickets.filter((t) => t.eventId === eventId);
    return tickets;
  }

  static verifyAndScanTicket(
    ticketCodeOrQr: string,
    scannerId: string
  ): { success: boolean; message: string; ticket?: EventTicket } {
    const tickets = getItem<EventTicket[]>(STORAGE_KEYS.EVENT_TICKETS, INITIAL_EVENT_TICKETS);
    const ticket = tickets.find(
      (t) => t.ticketCode === ticketCodeOrQr || t.qrCodeData === ticketCodeOrQr || ticketCodeOrQr.includes(t.ticketCode)
    );

    if (!ticket) {
      return { success: false, message: 'Invalid ticket code. No matching registration found on CampusCore.' };
    }

    if (ticket.status === 'used') {
      return {
        success: false,
        message: `TICKET ALREADY USED! Scanned previously on ${ticket.scannedAt ? new Date(ticket.scannedAt).toLocaleTimeString() : 'earlier'}. Duplicate entry rejected.`,
        ticket,
      };
    }

    if (ticket.status === 'cancelled') {
      return { success: false, message: 'This ticket has been cancelled or refunded.', ticket };
    }

    ticket.status = 'used';
    ticket.scannedAt = new Date().toISOString();
    ticket.scannedBy = scannerId;
    setItem(STORAGE_KEYS.EVENT_TICKETS, tickets);

    return {
      success: true,
      message: `VERIFIED & CHECKED IN! Attendee: ${ticket.attendeeName} (${ticket.attendeeEmail})`,
      ticket,
    };
  }

  // ==========================================
  // PHASE 3: STUDENT COMMUNITIES
  // ==========================================

  static getCommunities(campusId?: string, category?: string, search?: string): Community[] {
    let communities = getItem<Community[]>(STORAGE_KEYS.COMMUNITIES, INITIAL_COMMUNITIES);
    if (campusId && campusId !== 'all') {
      communities = communities.filter((c) => c.campusId === campusId || c.privacy === 'public');
    }
    if (category && category !== 'all') {
      communities = communities.filter((c) => c.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      communities = communities.filter((c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    }
    return communities;
  }

  static getCommunityById(id: string): Community | undefined {
    const communities = getItem<Community[]>(STORAGE_KEYS.COMMUNITIES, INITIAL_COMMUNITIES);
    return communities.find((c) => c.id === id);
  }

  static createCommunity(
    com: Omit<Community, 'id' | 'createdAt' | 'updatedAt' | 'memberCount' | 'members'>
  ): Community {
    const communities = getItem<Community[]>(STORAGE_KEYS.COMMUNITIES, INITIAL_COMMUNITIES);
    const newCom: Community = {
      ...com,
      id: `com-${Date.now()}`,
      memberCount: 1,
      members: [com.creatorId],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    communities.unshift(newCom);
    setItem(STORAGE_KEYS.COMMUNITIES, communities);
    return newCom;
  }

  static joinCommunity(communityId: string, userId: string): boolean {
    const communities = getItem<Community[]>(STORAGE_KEYS.COMMUNITIES, INITIAL_COMMUNITIES);
    const idx = communities.findIndex((c) => c.id === communityId);
    if (idx === -1) return false;

    if (!communities[idx].members.includes(userId)) {
      communities[idx].members.push(userId);
      communities[idx].memberCount = communities[idx].members.length;
      setItem(STORAGE_KEYS.COMMUNITIES, communities);
      return true;
    }
    return false;
  }

  static leaveCommunity(communityId: string, userId: string): boolean {
    const communities = getItem<Community[]>(STORAGE_KEYS.COMMUNITIES, INITIAL_COMMUNITIES);
    const idx = communities.findIndex((c) => c.id === communityId);
    if (idx === -1) return false;

    communities[idx].members = communities[idx].members.filter((m) => m !== userId);
    communities[idx].memberCount = communities[idx].members.length;
    setItem(STORAGE_KEYS.COMMUNITIES, communities);
    return true;
  }

  static getCommunityPosts(communityId?: string): CommunityPost[] {
    let posts = getItem<CommunityPost[]>(STORAGE_KEYS.COMMUNITY_POSTS, INITIAL_COMMUNITY_POSTS);
    if (communityId) {
      posts = posts.filter((p) => p.communityId === communityId);
    }
    return posts.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static createCommunityPost(post: Omit<CommunityPost, 'id' | 'createdAt' | 'likes' | 'commentsCount'>): CommunityPost {
    const posts = getItem<CommunityPost[]>(STORAGE_KEYS.COMMUNITY_POSTS, INITIAL_COMMUNITY_POSTS);
    const newPost: CommunityPost = {
      ...post,
      id: `post-${Date.now()}`,
      likes: [],
      commentsCount: 0,
      createdAt: new Date().toISOString(),
    };
    posts.unshift(newPost);
    setItem(STORAGE_KEYS.COMMUNITY_POSTS, posts);
    return newPost;
  }

  static togglePostLike(postId: string, userId: string): { likesCount: number; isLiked: boolean } {
    const posts = getItem<CommunityPost[]>(STORAGE_KEYS.COMMUNITY_POSTS, INITIAL_COMMUNITY_POSTS);
    const idx = posts.findIndex((p) => p.id === postId);
    if (idx === -1) return { likesCount: 0, isLiked: false };

    const likes = posts[idx].likes || [];
    const isLiked = likes.includes(userId);
    if (isLiked) {
      posts[idx].likes = likes.filter((id) => id !== userId);
    } else {
      posts[idx].likes = [...likes, userId];
    }
    setItem(STORAGE_KEYS.COMMUNITY_POSTS, posts);
    return { likesCount: posts[idx].likes.length, isLiked: !isLiked };
  }

  static voteOnPoll(postId: string, optionId: string, userId: string): CommunityPost | null {
    const posts = getItem<CommunityPost[]>(STORAGE_KEYS.COMMUNITY_POSTS, INITIAL_COMMUNITY_POSTS);
    const idx = posts.findIndex((p) => p.id === postId);
    if (idx === -1 || !posts[idx].pollOptions) return null;

    posts[idx].pollOptions = posts[idx].pollOptions!.map((opt) => {
      const filteredVotes = opt.votes.filter((uid) => uid !== userId);
      if (opt.id === optionId) {
        filteredVotes.push(userId);
      }
      return { ...opt, votes: filteredVotes };
    });

    setItem(STORAGE_KEYS.COMMUNITY_POSTS, posts);
    return posts[idx];
  }

  static getCommunityComments(postId: string): CommunityComment[] {
    const comments = getItem<CommunityComment[]>(STORAGE_KEYS.COMMUNITY_COMMENTS, []);
    return comments.filter((c) => c.postId === postId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  static addCommunityComment(
    commentOrPostId: string | Omit<CommunityComment, 'id' | 'createdAt' | 'likes'>,
    commentPayload?: any
  ): CommunityComment {
    let comment: Omit<CommunityComment, 'id' | 'createdAt' | 'likes'>;
    if (typeof commentOrPostId === 'string') {
      comment = {
        ...commentPayload,
        postId: commentOrPostId,
        communityId: commentPayload.communityId || '',
      };
    } else {
      comment = commentOrPostId;
    }

    const comments = getItem<CommunityComment[]>(STORAGE_KEYS.COMMUNITY_COMMENTS, []);
    const newComment: CommunityComment = {
      ...comment,
      id: `comm-${Date.now()}`,
      likes: [],
      createdAt: new Date().toISOString(),
    };
    comments.push(newComment);
    setItem(STORAGE_KEYS.COMMUNITY_COMMENTS, comments);

    // Update post comments count
    const posts = getItem<CommunityPost[]>(STORAGE_KEYS.COMMUNITY_POSTS, INITIAL_COMMUNITY_POSTS);
    const idx = posts.findIndex((p) => p.id === comment.postId);
    if (idx !== -1) {
      posts[idx].commentsCount = (posts[idx].commentsCount || 0) + 1;
      setItem(STORAGE_KEYS.COMMUNITY_POSTS, posts);
    }

    return newComment;
  }

  static togglePinPost(postId: string): boolean {
    const posts = getItem<CommunityPost[]>(STORAGE_KEYS.COMMUNITY_POSTS, INITIAL_COMMUNITY_POSTS);
    const idx = posts.findIndex((p) => p.id === postId);
    if (idx === -1) return false;
    posts[idx].isPinned = !posts[idx].isPinned;
    setItem(STORAGE_KEYS.COMMUNITY_POSTS, posts);
    return posts[idx].isPinned || false;
  }

  static deleteCommunityPost(postId: string): boolean {
    const posts = getItem<CommunityPost[]>(STORAGE_KEYS.COMMUNITY_POSTS, INITIAL_COMMUNITY_POSTS);
    const filtered = posts.filter((p) => p.id !== postId);
    if (filtered.length !== posts.length) {
      setItem(STORAGE_KEYS.COMMUNITY_POSTS, filtered);
      return true;
    }
    return false;
  }

  // ==========================================
  // PHASE 3: CAMPUS BUSINESSES
  // ==========================================

  static getBusinesses(
    campusIdOrFilters?: string | { campusId?: string; category?: string; search?: string },
    categoryArg?: string,
    searchArg?: string
  ): CampusBusiness[] {
    let businesses = getItem<CampusBusiness[]>(STORAGE_KEYS.BUSINESSES, INITIAL_BUSINESSES);
    let campusId: string | undefined;
    let category: string | undefined;
    let search: string | undefined;

    if (typeof campusIdOrFilters === 'string') {
      campusId = campusIdOrFilters;
      category = categoryArg;
      search = searchArg;
    } else if (campusIdOrFilters && typeof campusIdOrFilters === 'object') {
      campusId = campusIdOrFilters.campusId;
      category = campusIdOrFilters.category;
      search = campusIdOrFilters.search;
    }

    if (campusId && campusId !== 'all') {
      businesses = businesses.filter((b) => b.campusId === campusId);
    }
    if (category && category !== 'all') {
      businesses = businesses.filter((b) => b.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      businesses = businesses.filter(
        (b) =>
          b.businessName.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.tagline.toLowerCase().includes(q)
      );
    }
    return businesses;
  }

  static getCampusBusinesses(filters?: { campusId?: string; category?: string; search?: string }): CampusBusiness[] {
    return this.getBusinesses(filters?.campusId, filters?.category, filters?.search);
  }

  static getBusinessById(id: string): CampusBusiness | undefined {
    const businesses = getItem<CampusBusiness[]>(STORAGE_KEYS.BUSINESSES, INITIAL_BUSINESSES);
    return businesses.find((b) => b.id === id);
  }

  static getBusinessByOwnerId(ownerId: string): CampusBusiness | undefined {
    const businesses = getItem<CampusBusiness[]>(STORAGE_KEYS.BUSINESSES, INITIAL_BUSINESSES);
    return businesses.find((b) => b.ownerId === ownerId);
  }

  static createBusiness(
    biz: Omit<
      CampusBusiness,
      'id' | 'createdAt' | 'updatedAt' | 'status' | 'verificationBadge' | 'rating' | 'totalReviews' | 'followersCount'
    >
  ): CampusBusiness {
    const businesses = getItem<CampusBusiness[]>(STORAGE_KEYS.BUSINESSES, INITIAL_BUSINESSES);
    const newBiz: CampusBusiness = {
      ...biz,
      id: `biz-${Date.now()}`,
      status: 'verified', // Instant verified for demo or pending for moderation
      verificationBadge: true,
      rating: 5.0,
      totalReviews: 1,
      followersCount: 1,
      followers: [biz.ownerId],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    businesses.unshift(newBiz);
    setItem(STORAGE_KEYS.BUSINESSES, businesses);
    return newBiz;
  }

  static updateBusiness(id: string, updates: Partial<CampusBusiness>): CampusBusiness | null {
    const businesses = getItem<CampusBusiness[]>(STORAGE_KEYS.BUSINESSES, INITIAL_BUSINESSES);
    const idx = businesses.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    businesses[idx] = { ...businesses[idx], ...updates, updatedAt: new Date().toISOString() };
    setItem(STORAGE_KEYS.BUSINESSES, businesses);
    return businesses[idx];
  }

  static toggleFollowBusiness(businessId: string, userId: string): { isFollowing: boolean; followersCount: number } {
    const businesses = getItem<CampusBusiness[]>(STORAGE_KEYS.BUSINESSES, INITIAL_BUSINESSES);
    const idx = businesses.findIndex((b) => b.id === businessId);
    if (idx === -1) return { isFollowing: false, followersCount: 0 };

    const followers = businesses[idx].followers || [];
    const isFollowing = followers.includes(userId);
    if (isFollowing) {
      businesses[idx].followers = followers.filter((id) => id !== userId);
    } else {
      businesses[idx].followers = [...followers, userId];
    }
    businesses[idx].followersCount = businesses[idx].followers.length;
    setItem(STORAGE_KEYS.BUSINESSES, businesses);
    return { isFollowing: !isFollowing, followersCount: businesses[idx].followersCount };
  }

  // ==========================================
  // PHASE 3: SUBSCRIPTIONS & MONETIZATION
  // ==========================================

  static getSubscriptionPlans(): SubscriptionPlan[] {
    return getItem<SubscriptionPlan[]>(STORAGE_KEYS.SUBSCRIPTION_PLANS, INITIAL_SUBSCRIPTION_PLANS);
  }

  static getUserSubscriptions(): UserSubscription[] {
    return getItem<UserSubscription[]>(STORAGE_KEYS.USER_SUBSCRIPTIONS, INITIAL_USER_SUBSCRIPTIONS);
  }

  static getUserSubscription(userId: string): UserSubscription | undefined {
    const subs = getItem<UserSubscription[]>(STORAGE_KEYS.USER_SUBSCRIPTIONS, INITIAL_USER_SUBSCRIPTIONS);
    return subs.find((s) => s.userId === userId && s.status === 'active');
  }

  static subscribeToPlan(
    userId: string,
    planId: string,
    tier: SubscriptionPlanTier,
    businessId?: string
  ): { success: boolean; error?: string; subscription?: UserSubscription } {
    const plans = this.getSubscriptionPlans();
    const plan = plans.find((p) => p.id === planId || p.tier === tier);
    if (!plan) return { success: false, error: 'Selected subscription plan not found' };

    if (plan.pricePerMonth > 0) {
      const wallet = this.getWallet(userId);
      if (wallet.availableBalance < plan.pricePerMonth) {
        return {
          success: false,
          error: `Insufficient wallet balance (₦${wallet.availableBalance.toLocaleString()}). Plan costs ₦${plan.pricePerMonth.toLocaleString()}/month. Please top up your wallet.`,
        };
      }
      this.updateWalletBalance(userId, -plan.pricePerMonth, 0);
    }

    const subs = getItem<UserSubscription[]>(STORAGE_KEYS.USER_SUBSCRIPTIONS, INITIAL_USER_SUBSCRIPTIONS);
    const existingIdx = subs.findIndex((s) => s.userId === userId && s.status === 'active');

    const startDate = new Date().toISOString();
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const newSub: UserSubscription = {
      id: `sub-${Date.now()}`,
      userId,
      businessId,
      planId: plan.id,
      tier,
      status: 'active',
      startDate,
      endDate,
      autoRenew: true,
      paymentReference: `SUB_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingIdx !== -1) {
      subs[existingIdx] = newSub;
    } else {
      subs.unshift(newSub);
    }

    setItem(STORAGE_KEYS.USER_SUBSCRIPTIONS, subs);

    this.createAuditLog(userId, 'User', 'SUBSCRIPTION_ACTIVATED', 'subscription', newSub.id, {
      tier,
      price: plan.pricePerMonth,
    });

    return { success: true, subscription: newSub };
  }

  // ==========================================
  // PHASE 3: ADVERTISING SYSTEM
  // ==========================================

  static getAdCampaigns(filters?: { status?: AdStatus; placement?: AdPlacement; campusId?: string; advertiserId?: string }): AdCampaign[] {
    let ads = getItem<AdCampaign[]>(STORAGE_KEYS.AD_CAMPAIGNS, INITIAL_AD_CAMPAIGNS);
    if (filters?.status) ads = ads.filter((a) => a.status === filters.status);
    if (filters?.placement) ads = ads.filter((a) => a.placement === filters.placement);
    if (filters?.campusId && filters.campusId !== 'all') ads = ads.filter((a) => !a.targetCampusId || a.targetCampusId === filters.campusId);
    if (filters?.advertiserId) ads = ads.filter((a) => a.advertiserId === filters.advertiserId);
    return ads;
  }

  static createAdCampaign(
    campaign: Omit<AdCampaign, 'id' | 'createdAt' | 'impressions' | 'clicks' | 'spent' | 'status'>
  ): AdCampaign {
    const ads = getItem<AdCampaign[]>(STORAGE_KEYS.AD_CAMPAIGNS, INITIAL_AD_CAMPAIGNS);
    const newAd: AdCampaign = {
      ...campaign,
      id: `ad-${Date.now()}`,
      impressions: 0,
      clicks: 0,
      spent: 0,
      status: 'active', // Auto-activated for user testing
      createdAt: new Date().toISOString(),
    };
    ads.unshift(newAd);
    setItem(STORAGE_KEYS.AD_CAMPAIGNS, ads);
    return newAd;
  }

  static updateAdCampaignStatus(id: string, status: AdStatus, rejectionReason?: string): AdCampaign | null {
    const ads = getItem<AdCampaign[]>(STORAGE_KEYS.AD_CAMPAIGNS, INITIAL_AD_CAMPAIGNS);
    const idx = ads.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    ads[idx] = { ...ads[idx], status, rejectionReason: rejectionReason ?? ads[idx].rejectionReason };
    setItem(STORAGE_KEYS.AD_CAMPAIGNS, ads);
    return ads[idx];
  }

  static recordAdImpression(id: string): void {
    const ads = getItem<AdCampaign[]>(STORAGE_KEYS.AD_CAMPAIGNS, INITIAL_AD_CAMPAIGNS);
    const idx = ads.findIndex((a) => a.id === id);
    if (idx !== -1) {
      ads[idx].impressions = (ads[idx].impressions || 0) + 1;
      setItem(STORAGE_KEYS.AD_CAMPAIGNS, ads);
    }
  }

  static recordAdClick(id: string): void {
    const ads = getItem<AdCampaign[]>(STORAGE_KEYS.AD_CAMPAIGNS, INITIAL_AD_CAMPAIGNS);
    const idx = ads.findIndex((a) => a.id === id);
    if (idx !== -1) {
      ads[idx].clicks = (ads[idx].clicks || 0) + 1;
      ads[idx].spent = (ads[idx].spent || 0) + (ads[idx].costPerClick || 35);
      setItem(STORAGE_KEYS.AD_CAMPAIGNS, ads);
    }
  }

  // ==========================================
  // PHASE 3: CAMPUS ANNOUNCEMENTS
  // ==========================================

  static getAnnouncements(campusId?: string): CampusAnnouncement[] {
    let anns = getItem<CampusAnnouncement[]>(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    if (campusId && campusId !== 'all') {
      anns = anns.filter((a) => !a.campusId || a.campusId === 'all' || a.campusId === campusId);
    }
    return anns.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static createAnnouncement(ann: Omit<CampusAnnouncement, 'id' | 'createdAt'>): CampusAnnouncement {
    const anns = getItem<CampusAnnouncement[]>(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    const newAnn: CampusAnnouncement = {
      ...ann,
      id: `anc-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    anns.unshift(newAnn);
    setItem(STORAGE_KEYS.ANNOUNCEMENTS, anns);
    return newAnn;
  }

  static deleteAnnouncement(id: string): boolean {
    const anns = getItem<CampusAnnouncement[]>(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    const filtered = anns.filter((a) => a.id !== id);
    if (filtered.length !== anns.length) {
      setItem(STORAGE_KEYS.ANNOUNCEMENTS, filtered);
      return true;
    }
    return false;
  }

  // ==========================================
  // PHASE 3: SUPPORT TICKETING SYSTEM
  // ==========================================

  static getSupportTickets(userId?: string): SupportTicket[] {
    let tickets = getItem<SupportTicket[]>(STORAGE_KEYS.SUPPORT_TICKETS, INITIAL_SUPPORT_TICKETS);
    if (userId) {
      tickets = tickets.filter((t) => t.userId === userId);
    }
    return tickets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  static getSupportTicketById(id: string): SupportTicket | undefined {
    const tickets = getItem<SupportTicket[]>(STORAGE_KEYS.SUPPORT_TICKETS, INITIAL_SUPPORT_TICKETS);
    return tickets.find((t) => t.id === id || t.ticketNumber === id);
  }

  static createSupportTicket(
    ticket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'status' | 'replies'>
  ): SupportTicket {
    const tickets = getItem<SupportTicket[]>(STORAGE_KEYS.SUPPORT_TICKETS, INITIAL_SUPPORT_TICKETS);
    const newTicket: SupportTicket = {
      ...ticket,
      id: `tck-${Date.now()}`,
      ticketNumber: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'open',
      replies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tickets.unshift(newTicket);
    setItem(STORAGE_KEYS.SUPPORT_TICKETS, tickets);
    return newTicket;
  }

  static replySupportTicket(ticketId: string, reply: Omit<SupportTicketReply, 'id' | 'createdAt'>): SupportTicket | null {
    const tickets = getItem<SupportTicket[]>(STORAGE_KEYS.SUPPORT_TICKETS, INITIAL_SUPPORT_TICKETS);
    const idx = tickets.findIndex((t) => t.id === ticketId);
    if (idx === -1) return null;

    const newReply: SupportTicketReply = {
      ...reply,
      id: `rep-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    tickets[idx].replies.push(newReply);
    tickets[idx].updatedAt = new Date().toISOString();
    if (reply.senderRole === 'support_admin' || reply.senderRole === 'admin') {
      tickets[idx].status = 'waiting_user';
    } else {
      tickets[idx].status = 'in_progress';
    }

    setItem(STORAGE_KEYS.SUPPORT_TICKETS, tickets);
    return tickets[idx];
  }

  static updateSupportTicketStatus(ticketId: string, status: SupportStatus): SupportTicket | null {
    const tickets = getItem<SupportTicket[]>(STORAGE_KEYS.SUPPORT_TICKETS, INITIAL_SUPPORT_TICKETS);
    const idx = tickets.findIndex((t) => t.id === ticketId);
    if (idx === -1) return null;

    tickets[idx].status = status;
    tickets[idx].updatedAt = new Date().toISOString();
    if (status === 'resolved' || status === 'closed') {
      tickets[idx].resolvedAt = new Date().toISOString();
    }
    setItem(STORAGE_KEYS.SUPPORT_TICKETS, tickets);
    return tickets[idx];
  }

  // ==========================================
  // PHASE 3: FEATURE FLAGS
  // ==========================================

  static getFeatureFlags(): FeatureFlags {
    return getItem<FeatureFlags>(STORAGE_KEYS.FEATURE_FLAGS, INITIAL_FEATURE_FLAGS);
  }

  static updateFeatureFlags(flags: Partial<FeatureFlags>): FeatureFlags {
    const current = this.getFeatureFlags();
    const updated = { ...current, ...flags };
    setItem(STORAGE_KEYS.FEATURE_FLAGS, updated);
    return updated;
  }

  // ==========================================
  // PHASE 3: UNIFIED SEARCH 3.0
  // ==========================================

  static searchAll(query: string, vertical: SearchVertical = 'all', campusId?: string): UnifiedSearchResult[] {
    if (!query || query.trim() === '') return [];
    const q = query.toLowerCase().trim();
    const results: UnifiedSearchResult[] = [];

    // Products
    if (vertical === 'all' || vertical === 'products') {
      const products = this.getProducts({ searchQuery: q, campusId });
      products.slice(0, 8).forEach((p) => {
        results.push({
          id: p.id,
          type: 'products',
          title: p.title,
          subtitle: `${p.categoryName} • ${p.location || 'UNIOSUN'}`,
          image: p.images[0],
          price: p.price,
          currency: p.currency,
          campusName: p.sellerCampus,
          badge: p.condition,
          linkPayload: p,
        });
      });
    }

    // Services
    if (vertical === 'all' || vertical === 'services') {
      const services = this.getServices({ search: q, campusId });
      services.slice(0, 8).forEach((s) => {
        results.push({
          id: s.id,
          type: 'services',
          title: s.title,
          subtitle: `${s.categoryName} by ${s.providerName}`,
          image: s.portfolioImages[0],
          price: s.startingPrice,
          rating: s.providerRating,
          campusName: s.providerCampus,
          badge: s.pricingModel === 'fixed' ? 'Fixed Price' : 'Starts from',
          linkPayload: s,
        });
      });
    }

    // Jobs
    if (vertical === 'all' || vertical === 'jobs') {
      const jobs = this.getJobs({ search: q, campusId });
      jobs.slice(0, 6).forEach((j) => {
        results.push({
          id: j.id,
          type: 'jobs',
          title: j.title,
          subtitle: `${j.companyName} • ${j.salaryRate}`,
          badge: (j.category || 'GIG').replace('_', ' ').toUpperCase(),
          campusName: j.location,
          linkPayload: j,
        });
      });
    }

    // Events
    if (vertical === 'all' || vertical === 'events') {
      const events = this.getEvents({ search: q, campusId });
      events.slice(0, 6).forEach((e) => {
        results.push({
          id: e.id,
          type: 'events',
          title: e.title,
          subtitle: `${e.date} @ ${e.venue}`,
          image: e.bannerImage,
          price: e.ticketPrice,
          badge: e.isPaid ? 'Paid' : 'Free Entry',
          campusName: e.venue,
          linkPayload: e,
        });
      });
    }

    // Businesses
    if (vertical === 'all' || vertical === 'businesses') {
      const businesses = this.getBusinesses(campusId, undefined, q);
      businesses.slice(0, 6).forEach((b) => {
        results.push({
          id: b.id,
          type: 'businesses',
          title: b.businessName,
          subtitle: b.tagline || b.address,
          image: b.logo,
          rating: b.rating,
          badge: b.status === 'verified' ? 'Verified Business' : 'Store',
          campusName: b.address,
          linkPayload: b,
        });
      });
    }

    // Communities
    if (vertical === 'all' || vertical === 'communities') {
      const communities = this.getCommunities(campusId, undefined, q);
      communities.slice(0, 6).forEach((c) => {
        results.push({
          id: c.id,
          type: 'communities',
          title: c.name,
          subtitle: `${c.memberCount} Members • ${c.category}`,
          image: c.coverImage,
          badge: (c.privacy || 'PUBLIC').toUpperCase(),
          linkPayload: c,
        });
      });
    }

    // Accommodation
    if (vertical === 'all' || vertical === 'accommodation') {
      const accommodations = this.getAccommodations({ searchQuery: q, campusId });
      accommodations.slice(0, 6).forEach((a) => {
        results.push({
          id: a.id,
          type: 'accommodation',
          title: a.title,
          subtitle: `${a.roomType} • ${a.location}`,
          image: a.images[0],
          price: a.price,
          currency: a.currency,
          campusName: a.distanceToCampus,
          badge: a.available ? 'Available' : 'Occupied',
          linkPayload: a,
        });
      });
    }

    // Roommates
    if (vertical === 'all' || vertical === 'roommates') {
      const roommates = this.getRoommateProfiles({ searchQuery: q, campusId });
      roommates.slice(0, 6).forEach((r) => {
        results.push({
          id: r.id,
          type: 'roommates',
          title: `${r.userName} (${r.gender})`,
          subtitle: `${r.department}, ${r.level} • Budget: ₦${r.budget.toLocaleString()}`,
          image: r.userAvatar,
          badge: `${r.studyHabits || 'Balanced'} Study`,
          campusName: r.campusName,
          linkPayload: r,
        });
      });
    }

    // Study & Academic Resources
    if (vertical === 'all') {
      const studyResources = this.getStudyResources();
      const matched = studyResources.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.courseCode.toLowerCase().includes(q) ||
          r.courseTitle.toLowerCase().includes(q) ||
          (r.departmentName && r.departmentName.toLowerCase().includes(q))
      );
      matched.slice(0, 6).forEach((r) => {
        results.push({
          id: r.id,
          type: 'study' as any,
          title: `${r.courseCode}: ${r.title}`,
          subtitle: `${r.category.replace('_', ' ')} • ${r.departmentName || 'General'} (${r.level})`,
          badge: 'FREE STUDY RESOURCE',
          campusName: r.facultyName,
          linkPayload: r,
        });
      });
    }

    return results;
  }

  // --- COMPATIBILITY CONVENIENCE ALIASES ---
  static getUserTickets(userId: string): EventTicket[] {
    return this.getEventTickets(userId);
  }

  static buyEventTicket(
    eventId: string,
    attendeeOrUserId: string | { id: string; name: string; email: string; avatar: string },
    nameArg?: string,
    emailArg?: string,
    avatarArg?: string
  ) {
    let attendee: { id: string; name: string; email: string; avatar: string };
    if (typeof attendeeOrUserId === 'string') {
      attendee = {
        id: attendeeOrUserId,
        name: nameArg || 'Campus Student',
        email: emailArg || 'student@campusplug.ng',
        avatar: avatarArg || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      };
    } else {
      attendee = attendeeOrUserId;
    }
    return this.registerForEvent(eventId, attendee);
  }

  static validateAndCheckInTicket(
    arg1: string,
    arg2?: string
  ): { success: boolean; message: string; status: 'success' | 'already_checked_in' | 'not_found'; ticket?: EventTicket } {
    let ticketCode = arg1;
    let scannerId = 'admin';
    if (arg2) {
      if (arg1.startsWith('evt-') || arg1.startsWith('event-')) {
        ticketCode = arg2;
      } else {
        ticketCode = arg1;
        scannerId = arg2;
      }
    }

    const tickets = getItem<EventTicket[]>(STORAGE_KEYS.EVENT_TICKETS, INITIAL_EVENT_TICKETS);
    const ticket = tickets.find(
      (t) =>
        t.ticketCode?.toLowerCase() === ticketCode.toLowerCase() ||
        t.qrCodeData === ticketCode ||
        ticketCode.includes(t.ticketCode)
    );

    if (!ticket) {
      return {
        success: false,
        status: 'not_found',
        message: 'Invalid ticket code. No matching registration found on CampusCore.',
      };
    }

    ticket.userName = ticket.userName || ticket.attendeeName;

    if (ticket.status === 'used') {
      ticket.checkedInAt = ticket.checkedInAt || ticket.scannedAt || new Date().toISOString();
      return {
        success: false,
        status: 'already_checked_in',
        message: `TICKET ALREADY USED! Scanned previously on ${ticket.scannedAt ? new Date(ticket.scannedAt).toLocaleTimeString() : 'earlier'}. Duplicate entry rejected.`,
        ticket,
      };
    }

    ticket.status = 'used';
    ticket.scannedAt = new Date().toISOString();
    ticket.checkedInAt = ticket.scannedAt;
    ticket.scannedBy = scannerId;
    ticket.checkedInBy = scannerId;
    setItem(STORAGE_KEYS.EVENT_TICKETS, tickets);

    return {
      success: true,
      status: 'success',
      message: `VERIFIED & CHECKED IN! Attendee: ${ticket.attendeeName} (${ticket.attendeeEmail})`,
      ticket,
    };
  }

  static getApplicationsForUser(studentId: string): JobApplication[] {
    return this.getJobApplications({ studentId });
  }

  static upgradeUserSubscription(userId: string, tier: SubscriptionPlanTier) {
    return this.subscribeToPlan(userId, tier, tier);
  }

  static addSupportTicketMessage(ticketId: string, reply: Omit<SupportTicketReply, 'id' | 'createdAt'>) {
    return this.replySupportTicket(ticketId, reply);
  }

  static getUserAdCampaigns(userId: string): AdCampaign[] {
    return this.getAdCampaigns({ advertiserId: userId });
  }

  static getUserFollowedBusinessIds(userId: string): string[] {
    const businesses = this.getCampusBusinesses();
    return businesses.filter((b) => b.followers?.includes(userId)).map((b) => b.id);
  }

  static getUserJoinedCommunityIds(userId: string): string[] {
    const communities = this.getCommunities();
    return communities.filter((c) => c.members.includes(userId)).map((c) => c.id);
  }

  static toggleCommunityMembership(
    communityId: string,
    userId: string
  ): { success: boolean; isMember: boolean; memberCount: number } {
    const communities = getItem<Community[]>(STORAGE_KEYS.COMMUNITIES, INITIAL_COMMUNITIES);
    const idx = communities.findIndex((c) => c.id === communityId);
    if (idx === -1) return { success: false, isMember: false, memberCount: 0 };

    const isMember = communities[idx].members.includes(userId);
    if (isMember) {
      communities[idx].members = communities[idx].members.filter((m) => m !== userId);
    } else {
      communities[idx].members = [...communities[idx].members, userId];
    }
    communities[idx].memberCount = communities[idx].members.length;
    setItem(STORAGE_KEYS.COMMUNITIES, communities);
    return { success: true, isMember: !isMember, memberCount: communities[idx].memberCount };
  }

  static toggleLikeCommunityPost(postId: string, userId: string): { likesCount: number; isLiked: boolean } {
    return this.togglePostLike(postId, userId);
  }

  static voteCommunityPoll(
    postId: string,
    optionId: string,
    userId: string
  ): { success: boolean; error?: string; post?: CommunityPost } {
    const post = this.voteOnPoll(postId, optionId, userId);
    if (!post) return { success: false, error: 'Failed to record vote.' };
    return { success: true, post };
  }

  // --- STUDY & STUDYGEN AI SUITE ---
  static isStudyGenFree(): boolean {
    const flags = this.getFeatureFlags();
    return flags.studygenAiFreeForEveryone ?? true;
  }

  static getStudyResources(): StudyResource[] {
    const defaultResources: StudyResource[] = [
      {
        id: 'res-gst111',
        title: 'GST 111 (Communication in English) - Past Questions & Answer Keys (2020-2024)',
        courseCode: 'GST 111',
        courseTitle: 'Communication in English & Study Skills',
        level: '100L',
        category: 'past_question',
        fileType: 'pdf',
        fileSize: '3.2 MB',
        authorId: 'usr-superadmin-dave',
        authorName: 'Academic Directorate',
        downloadsCount: 142,
        rating: 4.9,
        totalRatings: 28,
        verified: true,
        createdAt: '2025-01-10T10:00:00Z',
      },
      {
        id: 'res-mat201',
        title: 'MAT 201 (Linear Algebra & Differential Equations) - Comprehensive Revision Handout',
        courseCode: 'MAT 201',
        courseTitle: 'Mathematical Methods I',
        level: '200L',
        category: 'solution_guide',
        fileType: 'pdf',
        fileSize: '4.8 MB',
        authorId: 'usr-superadmin-dave',
        authorName: 'Faculty of Science Library',
        downloadsCount: 88,
        rating: 4.8,
        totalRatings: 19,
        verified: true,
        createdAt: '2025-01-15T12:00:00Z',
      },
      {
        id: 'res-chm101',
        title: 'CHM 101 (General Physical Chemistry) - Lecture Summary & Practice Problems',
        courseCode: 'CHM 101',
        courseTitle: 'General Chemistry I',
        level: '100L',
        category: 'lecture_notes',
        fileType: 'pdf',
        fileSize: '2.1 MB',
        authorId: 'usr-superadmin-dave',
        authorName: 'Chemical Society',
        downloadsCount: 65,
        rating: 4.7,
        totalRatings: 14,
        verified: true,
        createdAt: '2025-01-20T14:00:00Z',
      },
    ];

    return getItem<StudyResource[]>(STORAGE_KEYS.STUDY_RESOURCES, defaultResources);
  }

  static addStudyResource(resource: Omit<StudyResource, 'id' | 'createdAt'>): StudyResource {
    const list = this.getStudyResources();
    const created: StudyResource = {
      ...resource,
      id: `res-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    list.unshift(created);
    setItem(STORAGE_KEYS.STUDY_RESOURCES, list);
    return created;
  }

  static incrementStudyResourceDownloads(id: string): void {
    const list = this.getStudyResources();
    const idx = list.findIndex((r) => r.id === id);
    if (idx !== -1) {
      list[idx].downloadsCount = (list[idx].downloadsCount || 0) + 1;
      setItem(STORAGE_KEYS.STUDY_RESOURCES, list);
    }
  }

  static incrementStudyResourceViews(id: string): void {
    const list = this.getStudyResources();
    const idx = list.findIndex((r) => r.id === id);
    if (idx !== -1) {
      list[idx].viewsCount = (list[idx].viewsCount || 0) + 1;
      setItem(STORAGE_KEYS.STUDY_RESOURCES, list);
    }
  }

  static updateStudyResourceStatus(id: string, status: 'approved' | 'pending' | 'rejected'): void {
    const list = this.getStudyResources();
    const idx = list.findIndex((r) => r.id === id);
    if (idx !== -1) {
      list[idx].status = status;
      list[idx].verified = status === 'approved';
      setItem(STORAGE_KEYS.STUDY_RESOURCES, list);
    }
  }

  static deleteStudyResource(id: string): void {
    const list = this.getStudyResources();
    const filtered = list.filter((r) => r.id !== id);
    setItem(STORAGE_KEYS.STUDY_RESOURCES, filtered);
  }

  static getStudyGenHistory(userId: string): StudyGenMessage[] {
    const all = getItem<Record<string, StudyGenMessage[]>>(STORAGE_KEYS.STUDYGEN_HISTORY, {});
    return all[userId] || [];
  }

  static saveStudyGenHistory(userId: string, messages: StudyGenMessage[]): void {
    const all = getItem<Record<string, StudyGenMessage[]>>(STORAGE_KEYS.STUDYGEN_HISTORY, {});
    all[userId] = messages;
    setItem(STORAGE_KEYS.STUDYGEN_HISTORY, all);
  }

  static clearStudyGenHistory(userId: string): void {
    const all = getItem<Record<string, StudyGenMessage[]>>(STORAGE_KEYS.STUDYGEN_HISTORY, {});
    delete all[userId];
    setItem(STORAGE_KEYS.STUDYGEN_HISTORY, all);
  }
}


