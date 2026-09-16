export type AppViewMode =
  | 'home'
  | 'explore'
  | 'study'
  | 'marketplace'
  | 'accommodation'
  | 'roommates'
  | 'orders'
  | 'wallet'
  | 'messages'
  | 'dashboard'
  | 'admin'
  | 'services'
  | 'jobs'
  | 'events'
  | 'communities'
  | 'businesses'
  | 'ads';

export type UserRole = 'USER' | 'STUDENT' | 'SELLER' | 'ADMIN' | 'SUPER_ADMIN' | 'student' | 'seller' | 'admin' | 'super_admin';
export type SellerStatus = 'NOT_SELLER' | 'SELLER' | 'VERIFIED_SELLER' | 'RESTRICTED_SELLER' | 'SUSPENDED_SELLER';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'RESTRICTED' | 'DELETED' | 'active' | 'suspended' | 'pending' | 'banned';
export type VerificationBadge = 'unverified' | 'verified_student' | 'trusted_seller';

export type AdminRoleType =
  | 'SUPER_ADMIN'
  | 'OPERATIONS_ADMIN'
  | 'MARKETPLACE_ADMIN'
  | 'STUDY_ADMIN'
  | 'COMMUNITY_SUPPORT_ADMIN';

export interface AdminPermissions {
  canManageUsers: boolean;
  canSuspendUsers: boolean;
  canManageListings: boolean;
  canFeatureListings: boolean;
  canModerateReports: boolean;
  canManageFinance: boolean;
  canReviewDisputes: boolean;
  canManageEvents: boolean;
  canManageJobs: boolean;
  canModerateCommunities: boolean;
  canManageSupport: boolean;
  canManageSettings: boolean;
  canManageStudy?: boolean;
  canManageAnnouncements?: boolean;
  canManageHostels?: boolean;
}

export interface AdminUserRecord {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  adminRoleType?: AdminRoleType;
  adminRoleTitle?: string;
  permissions: AdminPermissions;
  assignedBy: string;
  assignedByName?: string;
  assignedAt: string;
  status: 'active' | 'revoked';
}

export interface University {
  id: string;
  name: string;
  abbreviation: string;
  country: string;
  state: string;
  city: string;
  logoUrl?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Campus {
  id: string;
  universityId: string;
  name: string;
  location: string;
  code?: string;
  status: 'active' | 'inactive';
}

export interface Faculty {
  id: string;
  universityId: string;
  name: string;
  status: 'active' | 'inactive';
}

export interface Department {
  id: string;
  facultyId: string;
  name: string;
  status: 'active' | 'inactive';
}

export type AcademicLevel = '100L' | '200L' | '300L' | '400L' | '500L' | 'Postgraduate' | 'Alumni';

export interface UserProfile {
  id: string;
  authUserId: string;
  fullName: string;
  username: string;
  email: string;
  avatarUrl: string;
  avatar?: string;
  role: UserRole;
  gender?: string;
  universityId: string;
  universityName?: string;
  campusId: string;
  campusName?: string;
  facultyId?: string;
  facultyName?: string;
  departmentId?: string;
  departmentName?: string;
  department?: string;
  level?: AcademicLevel | string;
  bio?: string;
  phone?: string;
  whatsapp?: string;
  telegram?: string;
  plan?: string | SubscriptionPlanTier;
  subscriptionTier?: SubscriptionPlanTier;
  showPhonePublicly: boolean;
  showDepartmentPublicly: boolean;
  privacySettings?: {
    showPhonePublicly?: boolean;
    showDepartmentPublicly?: boolean;
  };
  verificationBadge: VerificationBadge;
  sellerStatus?: SellerStatus;
  sellerBio?: string;
  sellerCategory?: string;
  sellerPickupLocations?: string[];
  sellerOnboardingCompleted?: boolean;
  adminPermissions?: AdminPermissions;
  matricNumber?: string;
  totalCompletedSales?: number;
  totalOrdersBought?: number;
  rating?: number;
  totalRatings?: number;
  accountStatus: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export type User = UserProfile;

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  itemCount?: number;
  status: 'active' | 'disabled';
  createdAt: string;
}

export type ProductCondition = 'New' | 'Like New' | 'Used' | 'Fair' | 'Refurbished';
export type ProductStatus = 'draft' | 'active' | 'sold' | 'paused' | 'removed' | 'pending';
export type TradeMode = 'contact_only' | 'buy_now_only' | 'both';

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  displayOrder: number;
}

export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  sellerCampus: string;
  sellerWhatsapp?: string;
  sellerTelegram?: string;
  sellerPhone?: string;
  sellerRating?: number;
  sellerTotalSales?: number;
  sellerVerification?: VerificationBadge;
  categoryId: string;
  categoryName: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  condition: ProductCondition;
  tradeMode?: TradeMode;
  location: string;
  campusId: string;
  universityId: string;
  status: ProductStatus;
  views: number;
  viewsCount?: number;
  favoritesCount?: number;
  negotiable?: boolean;
  deliveryAvailable?: boolean;
  featured: boolean;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export type RoomType =
  | 'Self-contain'
  | 'Single Room'
  | '2-Bedroom Flat'
  | 'Shared Apartment'
  | 'Off-Campus Hostel'
  | 'Self-Contained Mini-Flat'
  | string;

export type RentalPeriod = 'Per Session' | 'Per Year' | 'Per Semester' | 'Per Month';

export interface Accommodation {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  ownerPhone: string;
  ownerWhatsapp: string;
  ownerVerified?: boolean;
  title: string;
  description: string;
  location: string;
  distanceToCampus: string;
  campusId: string;
  universityId: string;
  price: number;
  currency: string;
  rentalPeriod: RentalPeriod;
  roomType: RoomType;
  available: boolean;
  verifiedLodge?: boolean;
  images: string[];
  amenities: string[];
  status: 'active' | 'occupied' | 'paused' | 'removed';
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
}

export interface SavedAccommodation {
  id: string;
  userId: string;
  accommodationId: string;
  createdAt: string;
}

export type ReportReason =
  | 'Scam or Fraud'
  | 'Fake / Counterfeit Item'
  | 'Prohibited / Illegal Item'
  | 'Misleading Information'
  | 'Wrong / Deceptive Price'
  | 'Harassment / Inappropriate Behavior'
  | 'Spam or Duplicate'
  | 'Other';

export type ReportStatus = 'pending' | 'investigating' | 'resolved' | 'dismissed';

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  reportedUserId?: string;
  reportedUserName?: string;
  productId?: string;
  productTitle?: string;
  accommodationId?: string;
  accommodationTitle?: string;
  reason: ReportReason;
  description: string;
  details?: string;
  status: ReportStatus;
  adminNotes?: string;
  actionTaken?: string;
  createdAt: string;
  resolvedAt?: string;
}

// --- PHASE 2: WALLET & FINANCIAL TYPES ---
export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'escrow_hold'
  | 'escrow_release'
  | 'refund'
  | 'payment'
  | 'adjustment';

export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface Wallet {
  id: string;
  userId: string;
  currency: string;
  availableBalance: number;
  pendingBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  status: 'active' | 'frozen' | 'restricted';
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  reference: string;
  description: string;
  provider: 'paystack' | 'flutterwave' | 'internal' | 'manual' | 'bank_transfer';
  providerReference?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  completedAt?: string;
}

export interface UserBankAccount {
  id: string;
  userId: string;
  bankCode: string;
  bankName: string;
  accountNumber: string; // full stored, masked on UI
  accountName: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- PHASE 2: ORDERS & ESCROW ---
export type OrderStatus =
  | 'created'
  | 'payment_pending'
  | 'paid'
  | 'funds_held'
  | 'seller_processing'
  | 'ready_for_delivery'
  | 'delivered'
  | 'buyer_confirmation_pending'
  | 'completed'
  | 'disputed'
  | 'refunded'
  | 'cancelled';

export type EscrowStatus = 'held' | 'released' | 'refunded' | 'disputed';

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar: string;
  buyerCampus: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  sellerCampus: string;
  productId: string;
  productTitle: string;
  productImage: string;
  amount: number;
  platformFee: number;
  sellerReceives: number;
  currency: string;
  status: OrderStatus;
  deliveryCampus: string;
  deliveryLocation: string;
  deliveryNotes?: string;
  escrowStatus: EscrowStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface EscrowTransaction {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  platformFee: number;
  sellerAmount: number;
  status: EscrowStatus;
  heldAt: string;
  releasedAt?: string;
  refundedAt?: string;
  createdAt: string;
}

// --- PHASE 2: DISPUTES & EVIDENCE ---
export type DisputeStatus =
  | 'opened'
  | 'under_review'
  | 'resolved'
  | 'resolved_refund'
  | 'resolved_release'
  | 'resolved_partial_refund'
  | 'dismissed';

export interface Dispute {
  id: string;
  orderId: string;
  orderNumber: string;
  openedBy: string;
  openerName: string;
  openerRole: 'buyer' | 'seller';
  reason: string;
  description: string;
  evidenceImages: string[];
  status: DisputeStatus;
  adminDecision?: string;
  adminNotes?: string;
  resolvedBy?: string;
  refundAmount?: number;
  createdAt: string;
  resolvedAt?: string;
}

// --- PHASE 2: RATINGS & REVIEWS ---
export interface Review {
  id: string;
  orderId?: string;
  orderNumber?: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string;
  reviewedUserId: string;
  role?: 'buyer_to_seller' | 'seller_to_buyer';
  rating: number; // 1 to 5
  comment: string;
  status?: 'published' | 'hidden';
  createdAt: string;
}

// --- PHASE 2: VERIFICATION SYSTEM ---
export type VerificationType = 'student_id' | 'matric_number' | 'portal_screenshot' | 'nin';
export type VerificationRequestStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  campusName: string;
  verificationType?: VerificationType;
  matricNumber?: string;
  department?: string;
  level?: string;
  studentIdCardUrl?: string;
  portalScreenshotUrl?: string;
  documentUrls?: string[];
  status: VerificationRequestStatus;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

// --- PHASE 2: INTERNAL MESSAGING ---
export interface Conversation {
  id: string;
  type: 'direct' | 'product' | 'order' | 'roommate' | 'general';
  participants: string[];
  participantDetails: Record<
    string,
    {
      id: string;
      name: string;
      avatar: string;
      campus: string;
      verificationBadge?: VerificationBadge;
    }
  >;
  productId?: string;
  productTitle?: string;
  productImage?: string;
  productPrice?: number;
  orderId?: string;
  orderNumber?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  text: string;
  read: boolean;
  readAt?: string;
  attachments?: string[];
  imageUrl?: string;
  orderAction?: string;
  createdAt: string;
}

// --- PHASE 2: ROOMMATE FINDER ---
export type SleepSchedule = 'early_bird' | 'night_owl' | 'flexible';
export type StudyHabits = 'quiet_study' | 'group_study' | 'flexible' | 'quiet' | 'balanced' | string;
export type CleanlinessLevel = 'very_clean' | 'moderate' | 'relaxed' | string;
export type SmokingPreference = 'non_smoker' | 'tolerant' | 'non_smoker_only' | 'outside_only' | 'smoker_friendly' | string;
export type GuestPolicy = 'no_overnight_guests' | 'weekends_only' | 'flexible' | string;

export interface RoommateProfile {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  universityId?: string;
  campusId: string;
  campusName: string;
  department: string;
  level: string;
  gender: 'male' | 'female' | string;
  preferredGender: 'male' | 'female' | 'same_gender' | 'any' | string;
  budget: number;
  currency?: string;
  preferredLocation: string;
  preferredRoomType: RoomType;
  moveInPeriod?: string;
  sleepSchedule?: SleepSchedule;
  studyHabits: StudyHabits;
  cleanlinessLevel: CleanlinessLevel;
  smokingTolerance?: string;
  smokingPreference?: SmokingPreference;
  guestPolicy?: GuestPolicy;
  bio: string;
  whatsapp?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoommateFilterOptions {
  searchQuery?: string;
  campusId?: string;
  gender?: string;
  roomType?: string;
  minBudget?: number;
  maxBudget?: number;
  sleepSchedule?: string;
  cleanlinessLevel?: string;
  cleanliness?: string;
  sortBy?: 'compatibility' | 'newest' | 'budget_asc' | 'budget_desc';
}

// --- PHASE 2: AUDIT LOGS & PLATFORM SETTINGS ---
export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: 'wallet' | 'order' | 'escrow' | 'withdrawal' | 'dispute' | 'verification' | 'user' | 'product' | string;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface PlatformSettings {
  supportEmail: string; // 'support@campuscore.app'
  platformName: string; // 'CampusCore'
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  marketplaceCommissionPercent: number; // default 2.5%
  escrowFeePercent: number; // default 2.0%
  minDepositAmount: number; // default 500
  minWithdrawalAmount: number; // default 1000
  withdrawalFeeFixed: number; // default 50
  featuredListingFee: number; // default 1000
  paymentProvider: 'paystack' | 'flutterwave';
  paystackPublicKey?: string;
  flutterwavePublicKey?: string;
  featureFlags?: FeatureFlags;
}

// --- NOTIFICATION TYPES 2.0 & 3.0 ---
export type NotificationType =
  | 'listing_published'
  | 'listing_approved'
  | 'listing_sold'
  | 'listing_favorited'
  | 'listing_reported'
  | 'listing_removed'
  | 'account_warning'
  | 'system_announcement'
  | 'accommodation_inquiry'
  | 'order_placed'
  | 'payment_successful'
  | 'seller_notified'
  | 'item_delivered'
  | 'buyer_confirmation_required'
  | 'order_completed'
  | 'deposit_successful'
  | 'deposit_success'
  | 'withdrawal_requested'
  | 'withdrawal_successful'
  | 'withdrawal_success'
  | 'withdrawal_failed'
  | 'funds_held'
  | 'funds_released'
  | 'escrow_held'
  | 'escrow_released'
  | 'dispute_opened'
  | 'dispute_resolved'
  | 'new_message'
  | 'message_received'
  | 'review_received'
  | 'roommate_interest'
  | 'verification_submitted'
  | 'verification_approved'
  | 'verification_rejected'
  | 'service_requested'
  | 'service_quoted'
  | 'service_accepted'
  | 'service_completed'
  | 'job_applied'
  | 'job_status_updated'
  | 'event_ticket_issued'
  | 'community_joined'
  | 'business_verified'
  | 'booking_confirmed'
  | 'booking_updated'
  | 'support_ticket_reply';

// --- PHASE 3: CAMPUS SERVICES MARKETPLACE & BOOKINGS ---
export type ServicePricingModel = 'fixed' | 'starting_from' | 'hourly' | 'custom_quote';
export type ServiceDeliveryMethod = 'on_campus' | 'online' | 'in_person' | 'hybrid';
export type ServiceStatus = 'active' | 'paused' | 'draft' | 'under_review' | 'removed';

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  itemCount?: number;
}

export interface ServiceListing {
  id: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  providerCampus: string;
  providerUniversity: string;
  providerRating: number;
  providerReviewCount: number;
  providerCompletedJobs: number;
  providerVerification: VerificationBadge;
  providerPhone?: string;
  providerWhatsapp?: string;
  categoryId: string;
  categoryName: string;
  title: string;
  slug: string;
  description: string;
  startingPrice: number;
  pricingModel: ServicePricingModel;
  deliveryMethod: ServiceDeliveryMethod;
  estimatedDeliveryDays: number;
  turnaroundTime?: string;
  packages?: { name: string; price: number; description?: string; features?: string[]; deliveryDays?: number }[];
  location: string;
  campusId: string;
  universityId: string;
  portfolioImages: string[];
  features: string[];
  status: ServiceStatus;
  views: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ServiceRequestStatus =
  | 'requested'
  | 'quoted'
  | 'accepted'
  | 'declined'
  | 'in_progress'
  | 'ready_for_review'
  | 'revision_requested'
  | 'completed'
  | 'disputed'
  | 'cancelled';

export interface ServiceRequest {
  id: string;
  requestNumber: string;
  serviceId: string;
  serviceTitle: string;
  clientId: string;
  clientName: string;
  clientAvatar: string;
  clientCampus: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  description: string;
  referenceImages?: string[];
  budget: number;
  deadlineDate: string;
  deadline?: string;
  status: ServiceRequestStatus;
  quoteAmount?: number;
  quoteDeliveryDays?: number;
  quoteTerms?: string;
  escrowOrderId?: string;
  revisionsUsed: number;
  maxRevisions: number;
  deliveryWorkUrls?: string[];
  deliveryNotes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export type BookingStatus =
  | 'requested'
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'disputed';

export interface Booking {
  id: string;
  bookingNumber: string;
  serviceId?: string;
  serviceTitle: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  customerPhone?: string;
  campusId: string;
  locationVenue: string;
  location?: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // "10:00 AM - 11:30 AM"
  durationMinutes: number;
  price: number;
  totalAmount?: number;
  currency: string;
  status: BookingStatus;
  notes?: string;
  escrowOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderAvailability {
  userId: string;
  workingDays: string[]; // ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  workingHoursStart: string; // "09:00"
  workingHoursEnd: string; // "18:00"
  breakStart?: string;
  breakEnd?: string;
  maxBookingsPerDay: number;
  holidays: string[];
}

// --- PHASE 3: CAMPUS JOBS & GIGS ---
export type JobType =
  | 'part_time'
  | 'internship'
  | 'freelance'
  | 'campus_work'
  | 'remote'
  | 'temporary'
  | 'weekend'
  | 'event_work'
  | 'tutoring'
  | 'other';

export type JobStatus = 'open' | 'reviewing' | 'closed' | 'filled';

export interface CampusJob {
  id: string;
  title: string;
  companyName: string;
  companyLogo?: string;
  employerId: string;
  posterId?: string;
  employerName: string;
  posterName?: string;
  employerAvatar: string;
  employerVerified: boolean;
  verifiedEmployer?: boolean;
  jobType?: string;
  category: JobType;
  description: string;
  applicationInstructions?: string;
  requirements: string[];
  salaryRate: string; // e.g. "₦15,000 / week" or "₦50,000 / month"
  location: string;
  campusId: string;
  universityId: string;
  isRemote: boolean;
  deadline: string;
  contactEmail: string;
  contactPhone?: string;
  status: JobStatus;
  applicantsCount: number;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type JobApplicationStatus =
  | 'submitted'
  | 'reviewing'
  | 'shortlisted'
  | 'interview'
  | 'accepted'
  | 'hired'
  | 'rejected';

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  employerId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  studentAvatar: string;
  studentCampus: string;
  studentDepartment: string;
  studentLevel: string;
  coverMessage: string;
  applicantId?: string;
  applicantName?: string;
  applicantAvatar?: string;
  applicantDepartment?: string;
  applicantLevel?: string;
  applicantPhone?: string;
  applicantEmail?: string;
  coverNote?: string;
  skills?: string[];
  resumeUrl?: string;
  cvUrl?: string;
  portfolioUrl?: string;
  status: JobApplicationStatus;
  employerNotes?: string;
  appliedAt?: string;
  submittedAt: string;
  updatedAt: string;
}

export type SubscriptionTier = SubscriptionPlanTier;
export type CampusJobCategory = JobType;
export type CampusJobType = JobType;
export type SupportTicketCategory = SupportCategory;
export type SupportTicketPriority = SupportPriority;
export type SupportTicketStatus = SupportStatus;

export interface JobSeekerProfile {
  userId: string;
  fullName: string;
  avatarUrl: string;
  university: string;
  campus: string;
  department: string;
  level: string;
  skills: string[];
  bio: string;
  experience: string[];
  certifications: string[];
  portfolioLinks: string[];
  cvUrl?: string;
  availability: 'immediate' | 'part_time' | 'weekends' | 'flexible';
  isDiscoverable: boolean;
  updatedAt: string;
}

// --- PHASE 3: CAMPUS EVENTS & TICKETING ---
export type EventCategory =
  | 'party'
  | 'seminar'
  | 'workshop'
  | 'conference'
  | 'religious'
  | 'sports'
  | 'club'
  | 'academic'
  | 'career'
  | 'networking'
  | 'tech'
  | 'cultural';

export type EventStatus = 'upcoming' | 'ongoing' | 'past' | 'cancelled';

export interface CampusEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  organizerId: string;
  organizerName: string;
  organizerAvatar: string;
  organizerVerified: boolean;
  organizerContact?: string;
  category: EventCategory;
  date: string; // YYYY-MM-DD
  startTime: string; // "16:00"
  endTime: string; // "20:00"
  time?: string;
  venue: string;
  campusId: string;
  universityId: string;
  bannerImage: string;
  images?: string[];
  capacity: number;
  registeredCount: number;
  attendeesCount?: number;
  ticketPrice: number; // 0 for Free
  currency: string;
  isPaid: boolean;
  status: EventStatus;
  featured?: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type BusinessProfile = CampusBusiness;
export type StudentCommunity = Community;
export type CampusEventCategory = EventCategory;

export interface EventTicket {
  id: string;
  ticketCode: string; // e.g. "CP-EVT-93821"
  ticketNumber?: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  eventCampus: string;
  bannerImage: string;
  attendeeId: string;
  attendeeName: string;
  userName?: string;
  attendeeEmail: string;
  attendeeAvatar: string;
  pricePaid: number;
  paymentReference?: string;
  qrCodeData: string;
  status: 'valid' | 'used' | 'cancelled' | 'checked_in';
  scannedAt?: string;
  checkedInAt?: string;
  scannedBy?: string;
  checkedInBy?: string;
  createdAt: string;
}

// --- PHASE 3: STUDENT COMMUNITIES ---
export type CommunityCategory =
  | 'programming'
  | 'cybersecurity'
  | 'tech'
  | 'football'
  | 'anime'
  | 'music'
  | 'entrepreneurship'
  | 'fashion'
  | 'gaming'
  | 'photography'
  | 'academics'
  | 'academic'
  | 'hostel'
  | 'creative'
  | 'sports'
  | 'general'
  | 'campus_clubs'
  | 'other';

export type CommunityPrivacy = 'public' | 'campus_only' | 'private';

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: CommunityCategory;
  icon: string;
  coverImage: string;
  avatarImage?: string;
  universityId: string;
  campusId: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  memberCount: number;
  rules: string[];
  privacy: CommunityPrivacy;
  members: string[]; // user IDs
  moderators: string[]; // user IDs
  featured?: boolean;
  verified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PostType = 'text' | 'image' | 'poll' | 'announcement';

export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // user IDs
}

export interface CommunityPost {
  id: string;
  communityId: string;
  communityName?: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorBadge?: VerificationBadge;
  authorVerification?: VerificationBadge | string;
  authorDepartment?: string;
  authorLevel?: string;
  title: string;
  content: string;
  images?: string[];
  postType: PostType;
  pollOptions?: PollOption[];
  poll?: any;
  likes: string[]; // user IDs
  likedBy?: string[];
  commentsCount: number;
  comments?: any[];
  isPinned?: boolean;
  pinned?: boolean;
  isAnnouncement?: boolean;
  isLocked?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  communityId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorBadge?: VerificationBadge;
  content: string;
  likes: string[]; // user IDs
  createdAt: string;
}

// --- PHASE 3: CAMPUS BUSINESS PAGES ---
export type BusinessCategory =
  | 'restaurant'
  | 'food'
  | 'tech_gadgets'
  | 'gadgets'
  | 'fashion'
  | 'salon_barber'
  | 'salon'
  | 'repair_shop'
  | 'printing_press'
  | 'print'
  | 'cafe'
  | 'supermarket'
  | 'groceries'
  | 'pharmacy'
  | 'tutoring'
  | 'event_service'
  | 'laundry'
  | 'other';

export type BusinessVerificationStatus = 'unverified' | 'pending' | 'verified' | 'suspended';

export interface CampusBusiness {
  id: string;
  ownerId: string;
  businessName: string;
  slug: string;
  tagline: string;
  description: string;
  category: BusinessCategory;
  logo: string;
  coverImage: string;
  banner?: string;
  address: string;
  campusId: string;
  universityId: string;
  phone: string;
  whatsapp?: string;
  email: string;
  website?: string;
  openingHours: string; // e.g. "Mon - Sat: 8:00 AM - 8:00 PM"
  status: BusinessVerificationStatus;
  verificationBadge: boolean;
  rating: number;
  totalReviews: number;
  reviewCount?: number;
  featuredProducts?: string[]; // Product IDs
  servicesOffered?: string[];
  followersCount: number;
  followers?: string[];
  createdAt: string;
  updatedAt: string;
}

// --- PHASE 3: SUBSCRIPTION SYSTEM ---
export type SubscriptionPlanTier = 'free' | 'pro' | 'business';
export type SubscriptionStatus = 'active' | 'trial' | 'expired' | 'cancelled' | 'failed';

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionPlanTier;
  name: string;
  description: string;
  pricePerMonth: number; // 0 for free, 2500 for Pro, 6000 for Business
  currency: string;
  features: string[];
  maxProductListings: number;
  maxServiceListings: number;
  featuredListingCredits: number;
  analyticsAccess: boolean;
  verifiedBusinessBadge: boolean;
  prioritySupport: boolean;
}

export interface UserSubscription {
  id: string;
  userId: string;
  businessId?: string;
  planId: string;
  tier: SubscriptionPlanTier;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentReference?: string;
  createdAt: string;
  updatedAt: string;
}

// --- PHASE 3: ADVERTISING SYSTEM ---
export type AdStatus = 'pending' | 'active' | 'paused' | 'completed' | 'rejected';
export type AdPlacement = 'marketplace_top' | 'feed_sponsor' | 'campus_sidebar' | 'events_banner';

export interface AdCampaign {
  id: string;
  advertiserId: string;
  ownerId?: string;
  advertiserName: string;
  advertiserEmail: string;
  campaignName: string;
  title: string;
  description: string;
  bannerImage: string;
  imageUrl?: string;
  destinationUrl: string;
  placement: AdPlacement;
  targetUniversityId?: string;
  targetCampusId?: string;
  targetCategory?: string;
  budget: number;
  spent: number;
  costPerClick: number;
  impressions: number;
  clicks: number;
  status: AdStatus;
  startDate: string;
  endDate: string;
  rejectionReason?: string;
  createdAt: string;
}

// --- PHASE 3: CAMPUS ANNOUNCEMENTS ---
export type AnnouncementPriority = 'normal' | 'important' | 'urgent' | 'highlight';
export type AnnouncementCategory = 'academic' | 'safety' | 'event' | 'platform' | 'campus_life';

export interface CampusAnnouncement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string; // e.g. "Ace Tech Lead" or "Student Union"
  authorAvatar?: string;
  universityId: string;
  campusId?: string; // 'all' or specific campus
  facultyId?: string;
  departmentId?: string;
  priority: AnnouncementPriority;
  category: AnnouncementCategory;
  pinned: boolean;
  actionUrl?: string;
  actionText?: string;
  createdAt: string;
  expiresAt?: string;
}

// --- PHASE 3: SUPPORT TICKETING SYSTEM ---
export type SupportCategory =
  | 'account'
  | 'payments'
  | 'wallet'
  | 'orders'
  | 'services'
  | 'events'
  | 'jobs'
  | 'communities'
  | 'disputes'
  | 'general';

export type SupportPriority = 'low' | 'medium' | 'high' | 'urgent';
export type SupportStatus = 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';

export interface SupportTicketReply {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'support_admin' | 'admin';
  senderAvatar?: string;
  message: string;
  attachments?: string[];
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string; // e.g. "TICK-8921"
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  category: SupportCategory;
  subject: string;
  description: string;
  priority: SupportPriority;
  status: SupportStatus;
  assignedTo?: string;
  replies: SupportTicketReply[];
  messages?: SupportTicketReply[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

// --- PHASE 3: FEATURE FLAGS ---
export interface FeatureFlags {
  servicesEnabled: boolean;
  jobsEnabled: boolean;
  eventsEnabled: boolean;
  communitiesEnabled: boolean;
  businessesEnabled: boolean;
  subscriptionsEnabled: boolean;
  advertisingEnabled: boolean;
  supportEnabled: boolean;
  roommateEnabled: boolean;
  escrowEnabled: boolean;
  studyEnabled: boolean;
  studygenAiFreeForEveryone: boolean;
}

// --- STUDY & STUDYGEN AI ---
export type StudyGenMode =
  | 'general'
  | 'past_questions'
  | 'assignment_help'
  | 'concept_explainer'
  | 'flashcards'
  | 'quiz_generator'
  | 'summary';

export interface StudyGenMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  mode?: StudyGenMode;
  courseCode?: string;
}

export type StudyResourceCategory =
  | 'past_question'
  | 'textbook_resource'
  | 'textbook'
  | 'lecture_notes'
  | 'course_material'
  | 'course_materials'
  | 'study_guide'
  | 'solution_guide'
  | 'textbook_summary'
  | 'handout';

export interface StudyResource {
  id: string;
  title: string;
  courseCode: string;
  courseTitle: string;
  facultyId?: string;
  facultyName?: string;
  departmentId?: string;
  departmentName?: string;
  level: AcademicLevel | string;
  category: StudyResourceCategory;
  fileType: 'pdf' | 'doc' | 'epub' | 'link';
  fileSize?: string;
  downloadUrl?: string;
  semester?: '1st Semester' | '2nd Semester' | string;
  session?: string;
  description?: string;
  authorId: string;
  authorName: string;
  downloadsCount: number;
  viewsCount?: number;
  rating: number;
  totalRatings: number;
  verified: boolean;
  status?: 'approved' | 'pending' | 'rejected';
  createdAt: string;
}

export interface StudyFlashcard {
  id: string;
  question: string;
  answer: string;
  courseCode?: string;
  topic?: string;
  mastered?: boolean;
}

// --- UNIFIED SEARCH 3.0 ---
export type SearchVertical =
  | 'all'
  | 'products'
  | 'services'
  | 'jobs'
  | 'events'
  | 'businesses'
  | 'communities'
  | 'accommodation'
  | 'roommates';

export interface UnifiedSearchResult {
  id: string;
  type: SearchVertical;
  title: string;
  subtitle: string;
  image?: string;
  badge?: string;
  price?: number;
  currency?: string;
  campusName?: string;
  rating?: number;
  linkPayload?: any;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  totalListings: number;
  totalProducts?: number;
  activeListings: number;
  soldListings: number;
  accommodationListings: number;
  totalAccommodations?: number;
  totalReports: number;
  pendingReports: number;
  totalCategories: number;
  totalCampuses: number;
  // Phase 2 Financials
  totalDeposited: number;
  totalWithdrawn: number;
  totalEscrowVolume: number;
  totalVolume?: number;
  totalEscrows?: number;
  totalPlatformFees: number;
  activeOrders: number;
  totalOrders?: number;
  activeEscrowHold?: number;
  escrowHeldTotal?: number;
  activeDisputes?: number;
  totalDisputes?: number;
  pendingWithdrawals: number;
  pendingDisputes: number;
  pendingVerifications: number;
  totalVerifications?: number;
  totalRoommateProfiles: number;
  // Phase 3 Ecosystem Stats
  totalServices?: number;
  totalJobs?: number;
  totalEvents?: number;
  totalTicketsSold?: number;
  totalCommunities?: number;
  totalBusinesses?: number;
  activeSubscriptions?: number;
  totalSubscriptions?: number;
  totalAdCampaigns?: number;
  totalAds?: number;
  openSupportTickets?: number;
  totalSupportTickets?: number;
}

export interface FilterOptions {
  searchQuery?: string;
  category?: string;
  campusId?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: ProductCondition | 'All';
  tradeMode?: TradeMode | 'All';
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'views_desc' | 'popular';
  status?: ProductStatus | 'All';
  onlyFeatured?: boolean;
}

export interface AccommodationFilterOptions {
  searchQuery?: string;
  campusId?: string;
  roomType?: string;
  minPrice?: number;
  maxPrice?: number;
  availableOnly?: boolean;
  sortBy?: 'newest' | 'price_asc' | 'price_desc';
}
