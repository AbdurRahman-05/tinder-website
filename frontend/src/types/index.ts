export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'USER';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';

export type ProfileVisibility = 'PUBLIC' | 'HIDDEN';

export type ProfileStatus = 'ACTIVE' | 'BLOCKED' | 'DELETED';

export type ReportStatus = 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'DISMISSED';

export type ReportReason =
  | 'SPAM'
  | 'FAKE_PROFILE'
  | 'HARASSMENT'
  | 'INAPPROPRIATE_CONTENT'
  | 'IMPERSONATION'
  | 'SCAM'
  | 'OFFENSIVE_CONTENT'
  | 'OTHER';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastLoginAt?: string;
  profile?: ProfileSummary;
}

export interface ProfilePhoto {
  id: string;
  url: string;
  isPrimary: boolean;
}

export interface Profile {
  id: string;
  userId?: string;
  name: string;
  age: number;
  gender: string;
  customGender?: string | null;
  pronouns?: string | null;
  lookingFor: string[];
  bio: string;
  location?: string | null;
  whatsapp?: string | null;
  whatsappVisible: boolean;
  instagram?: string | null;
  instagramVisible: boolean;
  visibility: ProfileVisibility;
  status: ProfileStatus;
  isVerified: boolean;
  isFeatured: boolean;
  photos: ProfilePhoto[];
  createdAt: string;
  isOwner?: boolean;
  isSaved?: boolean;
  isBlocked?: boolean;
}

export interface ProfileSummary {
  id: string;
  name: string;
  age: number;
  gender: string;
  visibility: ProfileVisibility;
  status: ProfileStatus;
  isVerified: boolean;
  photos?: { url: string }[];
}

export interface ProfilesResponse {
  profiles: Profile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface AdminDashboardData {
  kpi: {
    totalUsers: number;
    totalProfiles: number;
    activeProfiles: number;
    hiddenProfiles: number;
    blockedProfiles: number;
    pendingReports: number;
    newUsersToday: number;
    newProfilesToday: number;
  };
  charts: {
    genderDistribution: { name: string; count: number }[];
    lookingForDistribution: { name: string; count: number }[];
    ageDistribution: { range: string; count: number }[];
    reportStats: { status: string; count: number }[];
  };
}

export interface ReportItem {
  id: string;
  profileId: string;
  reporterUserId?: string | null;
  reporterIp?: string | null;
  reason: ReportReason;
  description?: string | null;
  status: ReportStatus;
  resolutionNotes?: string | null;
  createdAt: string;
  profile: {
    id: string;
    name: string;
    age: number;
    gender: string;
    status: ProfileStatus;
    photos?: { url: string }[];
  };
}

export interface AuditLogItem {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: any;
  timestamp: string;
  admin: {
    id: string;
    email: string;
    role: UserRole;
  };
}
