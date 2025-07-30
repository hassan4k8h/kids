export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'email' | 'google' | 'apple';
  isEmailVerified: boolean;
  createdAt: string;
  lastLogin: string;
  subscription?: {
    type: 'free' | 'premium' | 'family';
    expiresAt?: string;
    features: string[];
  };
  preferences: {
    language: 'ar' | 'en';
    notifications: boolean;
    soundEnabled: boolean;
    parentalControls: {
      maxPlayTime: number; // دقائق في اليوم
      allowedGames: string[];
      reportingEnabled: boolean;
    };
  };
  children: string[]; // مصفوفة من معرفات الأطفال
  parentEmail?: string; // إيميل الوالدين إذا كان هذا حساب طفل
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  parentEmail?: string; // للأطفال تحت 13 سنة
  birthDate?: string;
  country?: string;
}

export interface SocialAuthResult {
  user: User;
  isNewUser: boolean;
  token: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface EmailVerificationData {
  email: string;
  code: string;
}