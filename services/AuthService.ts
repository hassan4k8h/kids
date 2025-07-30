import { User, AuthState } from '../types/Auth';
import emailService from './EmailService';
import { supabase } from './SupabaseService';

export interface LoginResult {
  success: boolean;
  user?: User;
  error?: string;
}

export interface SignupResult {
  success: boolean;
  user?: User;
  error?: string;
}

export interface PasswordResetRequestResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface PasswordResetResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface TokenValidationResult {
  valid: boolean;
  expired: boolean;
  user?: User;
  error?: string;
}

class AuthService {
  private currentUser: User | null = null;
  private listeners: Array<(authState: AuthState) => void> = [];
  private resetTokens: Map<string, { userId: string; email: string; expiresAt: number }> = new Map();
  private useSupabase: boolean = true; // التحكم في استخدام Supabase

  constructor() {
    this.loadSavedUser();
    this.initSupabaseAuth();
  }

  private async initSupabaseAuth(): Promise<void> {
    if (!this.useSupabase) return;
    
    try {
      // التحقق من وجود جلسة حالية
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await this.handleSupabaseAuth(session.user);
      }

      // الاستماع لتغييرات حالة المصادقة
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await this.handleSupabaseAuth(session.user);
        } else if (event === 'SIGNED_OUT') {
          this.currentUser = null;
          localStorage.removeItem('skilloo_current_user');
          this.notifyListeners();
        }
      });
    } catch (error) {
      console.error('❌ Error initializing Supabase auth:', error);
      this.useSupabase = false; // العودة للطريقة المحلية
    }
  }

  private async handleSupabaseAuth(supabaseUser: any): Promise<void> {
    try {
      // البحث عن المستخدم في قاعدة البيانات
      let { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      let user: User;
      
      if (error && error.code === 'PGRST116') {
        // المستخدم غير موجود، إنشاء سجل جديد
        const newUser = {
          id: supabaseUser.id,
          email: supabaseUser.email,
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'مستخدم',
          avatar: supabaseUser.user_metadata?.avatar_url,
          provider: 'email',
          is_email_verified: supabaseUser.email_confirmed_at !== null,
          preferences: {
            language: 'ar',
            notifications: true,
            soundEnabled: true,
            parentalControls: {
              maxPlayTime: 120,
              allowedGames: [],  
              reportingEnabled: true
            }
          },
          subscription_type: 'free',
          last_login: new Date().toISOString()
        };

        const { data: insertedUser, error: insertError } = await supabase
          .from('users')
          .insert([newUser])
          .select()
          .single();

        if (insertError) throw insertError;
        userData = insertedUser;
      } else if (error) {
        throw error;
      }

      // تحويل بيانات المستخدم من قاعدة البيانات إلى تنسيق التطبيق
      user = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        avatar: userData.avatar,
        provider: userData.provider as 'email' | 'google' | 'apple',
        isEmailVerified: userData.is_email_verified,
        createdAt: userData.created_at,
        lastLogin: userData.last_login || new Date().toISOString(),
        preferences: userData.preferences || {
          language: 'ar',
          notifications: true,
          soundEnabled: true,
          parentalControls: {
            maxPlayTime: 120,
            allowedGames: [],
            reportingEnabled: true
          }
        },
        children: [], // سيتم تحميلها من جدول اللاعبين
        subscription: {
          type: userData.subscription_type || 'free',
          features: []
        }
      };

      // تحميل بيانات الأطفال/اللاعبين
      const { data: playersData } = await supabase
        .from('players')
        .select('id')
        .eq('user_id', user.id);

      user.children = playersData?.map(p => p.id) || [];

      // تحديث آخر تسجيل دخول
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);

      this.currentUser = user;
      this.saveUser(user);
      this.notifyListeners();

    } catch (error) {
      console.error('❌ Error handling Supabase auth:', error);
    }
  }

  private loadSavedUser(): void {
    try {
      const savedUser = localStorage.getItem('skilloo_current_user');
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
        console.log('🔐 Loaded saved user:', this.currentUser?.email);
      }
    } catch (error) {
      console.error('❌ Error loading saved user:', error);
      localStorage.removeItem('skilloo_current_user');
    }
  }

  private saveUser(user: User): void {
    try {
      localStorage.setItem('skilloo_current_user', JSON.stringify(user));
      console.log('💾 User saved to localStorage:', user.email);
    } catch (error) {
      console.error('❌ Error saving user:', error);
    }
  }

  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateResetToken(): string {
    return `reset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSecureCode(): string {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  private notifyListeners(): void {
    const authState = this.getAuthState();
    this.listeners.forEach(listener => listener(authState));
  }

  public async login(email: string, password: string): Promise<LoginResult> {
    try {
      console.log('🔐 Attempting login for:', email);
      
      if (this.useSupabase) {
        // استخدام Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          console.log('❌ Supabase login error:', error.message);
          return {
            success: false,
            error: this.translateAuthError(error.message)
          };
        }

        if (data.user) {
          // سيتم التعامل مع المستخدم تلقائياً في handleSupabaseAuth
          console.log('✅ Login successful for:', email);
          return {
            success: true,
            user: this.currentUser
          };
        }
      } else {
        // استخدام localStorage (النظام القديم)
        return this.loginWithLocalStorage(email, password);
      }
      
      return {
        success: false,
        error: 'Login failed'
      };
      
    } catch (error) {
      console.error('❌ Login error:', error);
      return {
        success: false,
        error: 'Login failed'
      };
    }
  }

  private async loginWithLocalStorage(email: string, password: string): Promise<LoginResult> {
    // النظام القديم للتوافق مع الإصدار السابق
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get all users from localStorage
    const usersData = localStorage.getItem('skilloo_users');
    const users: User[] = usersData ? JSON.parse(usersData) : [];
    
    // Find user by email
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      console.log('❌ User not found:', email);
      return {
        success: false,
        error: 'User not found'
      };
    }
    
    // Check password (in real app, this would be hashed)
    const passwords = JSON.parse(localStorage.getItem('skilloo_passwords') || '{}');
    if (passwords[user.id] !== password) {
      console.log('❌ Invalid password for:', email);
      return {
        success: false,
        error: 'Invalid password'
      };
    }
    
    // Update last login
    user.lastLogin = new Date().toISOString();
    
    // Save updated user data
    const updatedUsers = users.map(u => u.id === user.id ? user : u);
    localStorage.setItem('skilloo_users', JSON.stringify(updatedUsers));
    
    // Set current user
    this.currentUser = user;
    this.saveUser(user);
    
    console.log('✅ Login successful for:', email);
    
    // Notify listeners
    this.notifyListeners();
    
    return {
      success: true,
      user: user
    };
  }

  public async signup(email: string, password: string, name: string): Promise<SignupResult> {
    try {
      console.log('👤 Attempting signup for:', email);
      
      if (this.useSupabase) {
        // استخدام Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name
            }
          }
        });

        if (error) {
          console.log('❌ Supabase signup error:', error.message);
          return {
            success: false,
            error: this.translateAuthError(error.message)
          };
        }

        if (data.user) {
          console.log('✅ Signup successful for:', email);
          
          // إرسال بريد الترحيب
          try {
            console.log('📧 Sending welcome email to:', email);
            const emailSent = await emailService.sendWelcomeEmail({
              userName: name,
              userEmail: email
            });
            
            if (emailSent) {
              console.log('✅ Welcome email sent successfully to:', email);
            } else {
              console.warn('⚠️ Failed to send welcome email to:', email);
            }
          } catch (emailError) {
            console.error('❌ Error sending welcome email:', emailError);
          }

          return {
            success: true,
            user: this.currentUser
          };
        }
      } else {
        // استخدام localStorage (النظام القديم)
        return this.signupWithLocalStorage(email, password, name);
      }
      
      return {
        success: false,
        error: 'Signup failed'
      };
      
    } catch (error) {
      console.error('❌ Signup error:', error);
      return {
        success: false,
        error: 'Signup failed'
      };
    }
  }

  private async signupWithLocalStorage(email: string, password: string, name: string): Promise<SignupResult> {
    // النظام القديم للتوافق مع الإصدار السابق
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get all users from localStorage
    const usersData = localStorage.getItem('skilloo_users');
    const users: User[] = usersData ? JSON.parse(usersData) : [];
    
    // Check if user already exists
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return {
        success: false,
        error: 'User already exists'
      };
    }
    
    // Create new user
    const userId = this.generateUserId();
    const newUser: User = {
      id: userId,
      email: email.toLowerCase(),
      name: name,
      provider: 'email',
      isEmailVerified: false,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      preferences: {
        language: 'ar',
        notifications: true,
        soundEnabled: true,
        parentalControls: {
          maxPlayTime: 120, // 2 hours per day
          allowedGames: [],
          reportingEnabled: true
        }
      },
      children: [],
      subscription: {
        type: 'free',
        features: []
      }
    };
    
    // Save user
    users.push(newUser);
    localStorage.setItem('skilloo_users', JSON.stringify(users));
    
    // Save password separately (in real app, this would be hashed)
    const passwords = JSON.parse(localStorage.getItem('skilloo_passwords') || '{}');
    passwords[userId] = password;
    localStorage.setItem('skilloo_passwords', JSON.stringify(passwords));
    
    // Set current user
    this.currentUser = newUser;
    this.saveUser(newUser);
    
    console.log('✅ Signup successful for:', email);
    
    // إرسال بريد الترحيب للمستخدم الجديد
    try {
      console.log('📧 Sending welcome email to:', email);
      const emailSent = await emailService.sendWelcomeEmail({
        userName: name,
        userEmail: email
      });
      
      if (emailSent) {
        console.log('✅ Welcome email sent successfully to:', email);
      } else {
        console.warn('⚠️ Failed to send welcome email to:', email);
      }
    } catch (emailError) {
      console.error('❌ Error sending welcome email:', emailError);
      // لا نفشل التسجيل إذا فشل إرسال البريد
    }
    
    // Notify listeners
    this.notifyListeners();
    
    return {
      success: true,
      user: newUser
    };
  }

  public async logout(): Promise<void> {
    console.log('👋 Logging out user:', this.currentUser?.email);
    
    if (this.useSupabase) {
      // تسجيل الخروج من Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Supabase logout error:', error);
      }
    }
    
    this.currentUser = null;
    localStorage.removeItem('skilloo_current_user');
    
    // Notify listeners
    this.notifyListeners();
    
    console.log('✅ Logout successful');
  }

  private translateAuthError(errorMessage: string): string {
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'بيانات تسجيل الدخول غير صحيحة',
      'Email not confirmed': 'يرجى تأكيد بريدك الإلكتروني أولاً',
      'User already registered': 'المستخدم مسجل مسبقاً',
      'Invalid email': 'البريد الإلكتروني غير صالح',
      'Password should be at least 6 characters': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
      'Unable to validate email address: invalid format': 'تنسيق البريد الإلكتروني غير صحيح',
      'Email rate limit exceeded': 'تم تجاوز الحد المسموح لإرسال الإيميلات، يرجى المحاولة لاحقاً',
      'Too many requests': 'عدد كبير من المحاولات، يرجى المحاولة لاحقاً'
    };

    return errorMap[errorMessage] || errorMessage;
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public getAuthState(): AuthState {
    return {
      isAuthenticated: this.currentUser !== null,
      user: this.currentUser,
      isLoading: false,
      error: null
    };
  }

  public subscribe(listener: (authState: AuthState) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public updateUserProfile(updates: Partial<User>): void {
    if (!this.currentUser) return;
    
    // Update current user
    this.currentUser = { ...this.currentUser, ...updates };
    this.saveUser(this.currentUser);
    
    // Update in users array
    const usersData = localStorage.getItem('skilloo_users');
    if (usersData) {
      const users: User[] = JSON.parse(usersData);
      const updatedUsers = users.map(u => 
        u.id === this.currentUser!.id ? this.currentUser! : u
      );
      localStorage.setItem('skilloo_users', JSON.stringify(updatedUsers));
    }
    
    // Notify listeners
    this.notifyListeners();
  }

  public isEmailTaken(email: string): boolean {
    const usersData = localStorage.getItem('skilloo_users');
    if (!usersData) return false;
    
    const users: User[] = JSON.parse(usersData);
    return users.some(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public getAllUsers(): User[] {
    const usersData = localStorage.getItem('skilloo_users');
    return usersData ? JSON.parse(usersData) : [];
  }

  /**
   * طلب إعادة تعيين كلمة المرور
   */
  public async requestPasswordReset(email: string): Promise<PasswordResetRequestResult> {
    try {
      console.log('🔐 Requesting password reset for:', email);
      
      // محاكاة تأخير API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // البحث عن المستخدم
      const users = this.getAllUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        console.log('❌ User not found for password reset:', email);
        // لأغراض الأمان، لا نكشف أن المستخدم غير موجود
        return {
          success: true,
          message: 'إذا كان هذا البريد الإلكتروني مسجلاً لدينا، ستتلقى رابط إعادة التعيين قريباً.'
        };
      }
      
      // إنشاء رمز إعادة التعيين
      const resetToken = this.generateResetToken();
      const secureCode = this.generateSecureCode();
      const expiresAt = Date.now() + (30 * 60 * 1000); // 30 دقيقة
      
      // حفظ الرمز المميز
      this.resetTokens.set(resetToken, {
        userId: user.id,
        email: user.email,
        expiresAt
      });
      
      // إنشاء رابط إعادة التعيين
      const resetUrl = `${window.location.origin}/#/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;
      
      // إرسال بريد إعادة التعيين
      try {
        console.log('📧 Sending password reset email to:', user.email);
        const emailSent = await emailService.sendPasswordResetEmail({
          userName: user.name,
          userEmail: user.email,
          resetToken: secureCode,
          resetUrl: resetUrl,
          expiresIn: '30 دقيقة'
        });
        
        if (emailSent) {
          console.log('✅ Password reset email sent successfully to:', user.email);
        } else {
          console.warn('⚠️ Failed to send password reset email to:', user.email);
        }
      } catch (emailError) {
        console.error('❌ Error sending password reset email:', emailError);
        // لا نفشل العملية إذا فشل إرسال البريد
      }
      
      console.log('✅ Password reset requested successfully for:', email);
      
      return {
        success: true,
        message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد.'
      };
      
    } catch (error) {
      console.error('❌ Password reset request error:', error);
      return {
        success: false,
        error: 'حدث خطأ أثناء معالجة طلب إعادة التعيين'
      };
    }
  }

  /**
   * التحقق من صحة رمز إعادة التعيين
   */
  public async validateResetToken(token: string): Promise<TokenValidationResult> {
    try {
      console.log('🔍 Validating reset token:', token);
      
      // محاكاة تأخير API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const tokenData = this.resetTokens.get(token);
      
      if (!tokenData) {
        console.log('❌ Invalid reset token:', token);
        return {
          valid: false,
          expired: false,
          error: 'رمز إعادة التعيين غير صالح'
        };
      }
      
      // التحقق من انتهاء الصلاحية
      if (Date.now() > tokenData.expiresAt) {
        console.log('❌ Reset token expired:', token);
        this.resetTokens.delete(token); // حذف الرمز المنتهي الصلاحية
        return {
          valid: false,
          expired: true,
          error: 'رمز إعادة التعيين منتهي الصلاحية'
        };
      }
      
      // البحث عن المستخدم
      const users = this.getAllUsers();
      const user = users.find(u => u.id === tokenData.userId);
      
      if (!user) {
        console.log('❌ User not found for reset token:', token);
        this.resetTokens.delete(token);
        return {
          valid: false,
          expired: false,
          error: 'المستخدم غير موجود'
        };
      }
      
      console.log('✅ Reset token is valid:', token);
      
      return {
        valid: true,
        expired: false,
        user: user
      };
      
    } catch (error) {
      console.error('❌ Token validation error:', error);
      return {
        valid: false,
        expired: false,
        error: 'حدث خطأ أثناء التحقق من الرمز المميز'
      };
    }
  }

  /**
   * إعادة تعيين كلمة المرور
   */
  public async resetPassword(token: string, newPassword: string): Promise<PasswordResetResult> {
    try {
      console.log('🔐 Resetting password with token:', token);
      
      // محاكاة تأخير API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // التحقق من صحة الرمز المميز
      const validation = await this.validateResetToken(token);
      
      if (!validation.valid || !validation.user) {
        return {
          success: false,
          error: validation.error || 'رمز إعادة التعيين غير صالح'
        };
      }
      
      // تحديث كلمة المرور
      const users = this.getAllUsers();
      const userIndex = users.findIndex(u => u.id === validation.user!.id);
      
      if (userIndex === -1) {
        return {
          success: false,
          error: 'المستخدم غير موجود'
        };
      }
      
      // تحديث كلمة المرور (يتم التعامل معها بشكل منفصل عن بيانات المستخدم)
      // في التطبيق الحقيقي، ستكون كلمة المرور مشفرة ومحفوظة بشكل آمن
      const passwords = JSON.parse(localStorage.getItem('skilloo_passwords') || '{}');
      passwords[users[userIndex].id] = newPassword; // في التطبيق الحقيقي، ستكون مشفرة
      localStorage.setItem('skilloo_passwords', JSON.stringify(passwords));
      
      // حفظ التغييرات
      localStorage.setItem('skilloo_users', JSON.stringify(users));
      
      // حذف الرمز المميز المستخدم
      this.resetTokens.delete(token);
      
      console.log('✅ Password reset successfully for user:', validation.user.email);
      
      // إرسال بريد تأكيد إعادة التعيين
      try {
        await emailService.sendNotificationEmail({
          userName: validation.user.name,
          userEmail: validation.user.email,
          message: 'تم إعادة تعيين كلمة المرور الخاصة بحسابك بنجاح! إذا لم تقم بهذا الإجراء، يرجى التواصل معنا فوراً.',
          type: 'general'
        });
      } catch (emailError) {
        console.error('❌ Error sending password reset confirmation email:', emailError);
        // لا نفشل العملية إذا فشل إرسال بريد التأكيد
      }
      
      return {
        success: true,
        message: 'تم إعادة تعيين كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.'
      };
      
    } catch (error) {
      console.error('❌ Password reset error:', error);
      return {
        success: false,
        error: 'حدث خطأ أثناء إعادة تعيين كلمة المرور'
      };
    }
  }

  /**
   * تنظيف الرموز المميزة المنتهية الصلاحية
   */
  public cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [token, data] of this.resetTokens.entries()) {
      if (now > data.expiresAt) {
        this.resetTokens.delete(token);
        console.log('🧹 Cleaned up expired reset token:', token);
      }
    }
  }

  /**
   * الحصول على إحصائيات الرموز المميزة
   */
  public getResetTokenStats(): { active: number; expired: number } {
    this.cleanupExpiredTokens();
    return {
      active: this.resetTokens.size,
      expired: 0 // تم حذف المنتهية الصلاحية
    };
  }

  public deleteUser(userId: string): void {
    const usersData = localStorage.getItem('skilloo_users');
    if (!usersData) return;
    
    const users: User[] = JSON.parse(usersData);
    const updatedUsers = users.filter(u => u.id !== userId);
    localStorage.setItem('skilloo_users', JSON.stringify(updatedUsers));
    
    // If current user is deleted, logout
    if (this.currentUser?.id === userId) {
      this.logout();
    }
  }
}

export const authService = new AuthService();