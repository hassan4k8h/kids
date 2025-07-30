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

export interface VerificationCodeResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface CodeValidationResult {
  valid: boolean;
  expired: boolean;
  email?: string;
  error?: string;
}

class AuthService {
  private currentUser: User | null = null;
  private listeners: Array<(authState: AuthState) => void> = [];
  private resetTokens: Map<string, { userId: string; email: string; expiresAt: number }> = new Map();
  private verificationCodes: Map<string, { email: string; code: string; expiresAt: number }> = new Map();
  private useSupabase: boolean = true; // التحكم في استخدام Supabase
  private supabaseHealthy: boolean = true; // حالة صحة Supabase

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
      console.log('🔄 Processing Supabase auth for user:', supabaseUser.email);
      
      // إنشاء مستخدم أساسي من بيانات Supabase مباشرة كـ fallback
      const fallbackUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'مستخدم',
        avatar: supabaseUser.user_metadata?.avatar_url,
        provider: 'email',
        isEmailVerified: supabaseUser.email_confirmed_at !== null,
        createdAt: supabaseUser.created_at || new Date().toISOString(),
        lastLogin: new Date().toISOString(),
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
        children: [],
        subscription: {
          type: 'free',
          features: []
        }
      };

      try {
        // محاولة البحث في قاعدة البيانات مع timeout قصير
        const searchPromise = supabase
          .from('users')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Database timeout')), 5000); // 5 ثوان فقط
        });

        const { data: userData, error } = await Promise.race([searchPromise, timeoutPromise]);

        if (error && error.code === 'PGRST116') {
          // المستخدم غير موجود، محاولة الإنشاء
          console.log('👤 User not found, creating new user in database');
          try {
            const { data: insertedUser, error: insertError } = await supabase
              .from('users')
              .insert([{
                id: supabaseUser.id,
                email: supabaseUser.email,
                name: fallbackUser.name,
                avatar: fallbackUser.avatar,
                provider: 'email',
                is_email_verified: fallbackUser.isEmailVerified,
                preferences: fallbackUser.preferences,
                subscription_type: 'free',
                last_login: new Date().toISOString()
              }])
              .select()
              .single();

            if (!insertError && insertedUser) {
              console.log('✅ User created in database successfully');
              // تحديث fallbackUser بالبيانات من قاعدة البيانات
              fallbackUser.subscription.type = insertedUser.subscription_type || 'free';
            } else {
              console.warn('⚠️ Failed to create user in database, using fallback:', insertError);
            }
          } catch (insertError) {
            console.warn('⚠️ Database insert failed, using fallback user:', insertError);
          }
        } else if (!error && userData) {
          // تحديث fallbackUser ببيانات قاعدة البيانات
          console.log('✅ User found in database, updating from DB');
          fallbackUser.name = userData.name || fallbackUser.name;
          fallbackUser.avatar = userData.avatar || fallbackUser.avatar;
          fallbackUser.preferences = userData.preferences || fallbackUser.preferences;
          fallbackUser.subscription.type = userData.subscription_type || 'free';
          fallbackUser.lastLogin = userData.last_login || fallbackUser.lastLogin;
          
          // تحديث آخر تسجيل دخول في الخلفية
          (async () => {
            try {
              await supabase
                .from('users')
                .update({ last_login: new Date().toISOString() })
                .eq('id', supabaseUser.id);
              console.log('✅ Last login updated');
            } catch (err) {
              console.warn('⚠️ Failed to update last login:', err);
            }
          })();
        } else if (error) {
          console.warn('⚠️ Database query failed, using fallback user:', error);
        }

      } catch (dbError) {
        console.warn('⚠️ Database operations failed, using fallback user:', dbError);
      }

      // تعيين المستخدم (سواء من قاعدة البيانات أو fallback)
      this.currentUser = fallbackUser;
      this.saveUser(fallbackUser);
      this.notifyListeners();
      
      console.log('✅ User authenticated successfully:', fallbackUser.email);

    } catch (error) {
      console.error('❌ Error handling Supabase auth:', error);
      
      // في حالة فشل كامل، إنشاء مستخدم أساسي من بيانات Supabase
      const emergencyUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'مستخدم',
        avatar: supabaseUser.user_metadata?.avatar_url,
        provider: 'email',
        isEmailVerified: supabaseUser.email_confirmed_at !== null,
        createdAt: supabaseUser.created_at || new Date().toISOString(),
        lastLogin: new Date().toISOString(),
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
        children: [],
        subscription: {
          type: 'free',
          features: []
        }
      };
      
      this.currentUser = emergencyUser;
      this.saveUser(emergencyUser);
      this.notifyListeners();
      
      console.log('🚨 Emergency user created for:', emergencyUser.email);
    }
  }

  private loadSavedUser(): void {
    try {
      const savedUser = localStorage.getItem('skilloo_current_user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        
        // التحقق من أن البيانات المحفوظة صحيحة
        if (parsedUser && parsedUser.id && parsedUser.email) {
          this.currentUser = parsedUser;
          console.log('🔐 Loaded saved user:', this.currentUser.email);
        } else {
          console.warn('⚠️ Invalid saved user data, removing from storage');
          localStorage.removeItem('skilloo_current_user');
        }
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

  private generateVerificationCode(): string {
    // إنشاء كود من 6 أرقام
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private notifyListeners(): void {
    const authState = this.getAuthState();
    this.listeners.forEach(listener => listener(authState));
  }

  public async login(email: string, password: string): Promise<LoginResult> {
    try {
      console.log('🔐 Attempting login for:', email);
      
      // تعيين timeout للعملية
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Login timeout')), 10000); // 10 ثوان
      });
      
      if (this.useSupabase && this.supabaseHealthy) {
        try {
          // استخدام Supabase Auth مع timeout
          const loginPromise = supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password
          });

          const { data, error } = await Promise.race([loginPromise, timeoutPromise]);

          if (error) {
            console.log('❌ Supabase login error:', error.message);
            
            // إذا كان خطأ في الشبكة أو الخادم، تحول للنظام المحلي
            if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('timeout')) {
              console.warn('⚠️ Supabase appears unhealthy, falling back to localStorage');
              this.supabaseHealthy = false;
              return await this.loginWithLocalStorage(email, password);
            }
            
            return {
              success: false,
              error: this.translateAuthError(error.message)
            };
          }

          if (data.user) {
            // انتظار تحديث المستخدم مع timeout أقصر وإنشاء مستخدم طوارئ إذا لزم الأمر
            let waitCount = 0;
            while (!this.currentUser && waitCount < 30) { // انتظار 3 ثوان كحد أقصى
              await new Promise(resolve => setTimeout(resolve, 100));
              waitCount++;
            }
            
            // إذا لم يتم تحديث currentUser، إنشاء مستخدم طوارئ
            if (!this.currentUser) {
              console.warn('⚠️ currentUser not set by handleSupabaseAuth, creating emergency user');
              const emergencyUser: User = {
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'مستخدم',
                avatar: data.user.user_metadata?.avatar_url,
                provider: 'email',
                isEmailVerified: data.user.email_confirmed_at !== null,
                createdAt: data.user.created_at || new Date().toISOString(),
                lastLogin: new Date().toISOString(),
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
                children: [],
                subscription: {
                  type: 'free',
                  features: []
                }
              };
              
              this.currentUser = emergencyUser;
              this.saveUser(emergencyUser);
              this.notifyListeners();
            }
            
            console.log('✅ Login successful for:', email);
            return {
              success: true,
              user: this.currentUser
            };
          }
        } catch (networkError) {
          console.warn('⚠️ Network error with Supabase, falling back to localStorage:', networkError);
          this.supabaseHealthy = false;
          return await this.loginWithLocalStorage(email, password);
        }
      } else {
        // استخدام localStorage (محسن للسرعة)
        return await Promise.race([this.loginWithLocalStorage(email, password), timeoutPromise]);
      }
      
      return {
        success: false,
        error: 'تسجيل الدخول فشل. يرجى المحاولة مرة أخرى.'
      };
      
    } catch (error) {
      console.error('❌ Login error:', error);
      
      if (error.message === 'Login timeout') {
        return {
          success: false,
          error: 'انتهت مهلة تسجيل الدخول. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.'
        };
      }
      
      return {
        success: false,
        error: 'حدث خطأ في تسجيل الدخول. يرجى المحاولة مرة أخرى.'
      };
    }
  }

  private async loginWithLocalStorage(email: string, password: string): Promise<LoginResult> {
    // النظام المحلي المحسن (بدون تأخير غير ضروري)
    await new Promise(resolve => setTimeout(resolve, 200)); // تأخير قصير فقط لتحسين UX
    
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
      
      // تعيين timeout للعملية
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Signup timeout')), 15000); // 15 ثانية للتسجيل
      });
      
      if (this.useSupabase && this.supabaseHealthy) {
        try {
          // استخدام Supabase Auth مع timeout
          const signupPromise = supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password,
            options: {
              data: {
                name: name.trim()
              }
            }
          });

          const { data, error } = await Promise.race([signupPromise, timeoutPromise]);

          if (error) {
            console.log('❌ Supabase signup error:', error.message);
            
            // إذا كان خطأ في الشبكة أو الخادم، تحول للنظام المحلي
            if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('timeout')) {
              console.warn('⚠️ Supabase appears unhealthy, falling back to localStorage');
              this.supabaseHealthy = false;
              return await this.signupWithLocalStorage(email, password, name);
            }
            
            return {
              success: false,
              error: this.translateAuthError(error.message)
            };
          }

          if (data.user) {
            console.log('✅ Signup successful for:', email);
            
            // إرسال بريد الترحيب في الخلفية (بدون انتظار)
            this.sendWelcomeEmailAsync(name, email);

            // انتظار تحديث المستخدم مع timeout أقصر
            let waitCount = 0;
            while (!this.currentUser && waitCount < 30) { // انتظار 3 ثوان كحد أقصى
              await new Promise(resolve => setTimeout(resolve, 100));
              waitCount++;
            }

            // إذا لم يتم تحديث currentUser، إنشاء مستخدم طوارئ
            if (!this.currentUser) {
              console.warn('⚠️ currentUser not set by handleSupabaseAuth during signup, creating emergency user');
              const emergencyUser: User = {
                id: data.user.id,
                email: data.user.email,
                name: name.trim() || data.user.email?.split('@')[0] || 'مستخدم',
                avatar: data.user.user_metadata?.avatar_url,
                provider: 'email',
                isEmailVerified: data.user.email_confirmed_at !== null,
                createdAt: data.user.created_at || new Date().toISOString(),
                lastLogin: new Date().toISOString(),
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
                children: [],
                subscription: {
                  type: 'free',
                  features: []
                }
              };
              
              this.currentUser = emergencyUser;
              this.saveUser(emergencyUser);
              this.notifyListeners();
            }

            return {
              success: true,
              user: this.currentUser
            };
          }
        } catch (networkError) {
          console.warn('⚠️ Network error with Supabase, falling back to localStorage:', networkError);
          this.supabaseHealthy = false;
          return await this.signupWithLocalStorage(email, password, name);
        }
      } else {
        // استخدام localStorage (محسن للسرعة)
        return await Promise.race([this.signupWithLocalStorage(email, password, name), timeoutPromise]);
      }
      
      return {
        success: false,
        error: 'فشل في إنشاء الحساب. يرجى المحاولة مرة أخرى.'
      };
      
    } catch (error) {
      console.error('❌ Signup error:', error);
      
      if (error.message === 'Signup timeout') {
        return {
          success: false,
          error: 'انتهت مهلة إنشاء الحساب. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.'
        };
      }
      
      return {
        success: false,
        error: 'حدث خطأ في إنشاء الحساب. يرجى المحاولة مرة أخرى.'
      };
    }
  }

  // إرسال بريد الترحيب في الخلفية لتسريع التجربة
  private async sendWelcomeEmailAsync(name: string, email: string): Promise<void> {
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
      // لا نفشل العملية إذا فشل إرسال البريد
    }
  }

  private async signupWithLocalStorage(email: string, password: string, name: string): Promise<SignupResult> {
    // النظام المحلي المحسن (بدون تأخير غير ضروري)
    await new Promise(resolve => setTimeout(resolve, 200)); // تأخير قصير فقط لتحسين UX
    
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
      'Invalid login credentials': 'بيانات تسجيل الدخول غير صحيحة. تحقق من الإيميل وكلمة المرور.',
      'Email not confirmed': 'يرجى تأكيد بريدك الإلكتروني أولاً من خلال الرسالة المرسلة إليك.',
      'User already registered': 'هذا البريد الإلكتروني مسجل مسبقاً. يمكنك تسجيل الدخول مباشرة.',
      'Invalid email': 'البريد الإلكتروني غير صالح. يرجى التحقق من التنسيق.',
      'Password should be at least 6 characters': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.',
      'Unable to validate email address: invalid format': 'تنسيق البريد الإلكتروني غير صحيح. مثال: user@example.com',
      'Email rate limit exceeded': 'تم تجاوز الحد المسموح لإرسال الإيميلات. يرجى المحاولة بعد دقائق.',
      'Too many requests': 'عدد كبير من المحاولات. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.',
      'Signup requires a valid password': 'يرجى إدخال كلمة مرور صالحة.',
      'Database error': 'خطأ في الخادم. يرجى المحاولة لاحقاً.',
      'Network error': 'خطأ في الاتصال. تحقق من اتصال الإنترنت.',
      'Weak password': 'كلمة المرور ضعيفة. استخدم أحرف وأرقام ورموز.',
      'Email already exists': 'هذا الإيميل مستخدم بالفعل. جرب إيميل آخر أو سجل الدخول.',
      'Login timeout': 'انتهت مهلة تسجيل الدخول. تحقق من اتصال الإنترنت.',
      'Signup timeout': 'انتهت مهلة إنشاء الحساب. تحقق من اتصال الإنترنت.',
      'Database timeout': 'انتهت مهلة الاتصال بالخادم. يرجى المحاولة مرة أخرى.',
      'Insert timeout': 'انتهت مهلة إنشاء الحساب في قاعدة البيانات.',
      'PGRST116': 'المستخدم غير موجود في قاعدة البيانات.',
      '400': 'خطأ في بيانات الطلب. يرجى المحاولة مرة أخرى.',
      'Failed to fetch': 'مشكلة في الاتصال بالخادم. تحقق من الإنترنت.',
      'fetch': 'مشكلة في الاتصال بالخادم.'
    };

    // البحث عن أخطاء جزئية
    for (const [key, value] of Object.entries(errorMap)) {
      if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    // إذا لم نجد ترجمة محددة، نعطي رسالة عامة مفيدة
    if (errorMessage.toLowerCase().includes('password')) {
      return 'مشكلة في كلمة المرور. تأكد من أنها صحيحة وقوية.';
    }
    if (errorMessage.toLowerCase().includes('email')) {
      return 'مشكلة في البريد الإلكتروني. تأكد من صحة التنسيق.';
    }
    if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('timeout')) {
      return 'مشكلة في الاتصال. تحقق من الإنترنت وحاول مرة أخرى.';
    }
    if (errorMessage.toLowerCase().includes('400') || errorMessage.toLowerCase().includes('bad request')) {
      return 'خطأ في البيانات المرسلة. يرجى المحاولة مرة أخرى.';
    }
    if (errorMessage.toLowerCase().includes('pgrst') || errorMessage.toLowerCase().includes('postgrest')) {
      return 'مشكلة مؤقتة في قاعدة البيانات. يرجى المحاولة مرة أخرى.';
    }
    if (errorMessage.toLowerCase().includes('database') || errorMessage.toLowerCase().includes('db')) {
      return 'مشكلة في الخادم. يرجى المحاولة بعد قليل.';
    }

    return errorMessage || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
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
  /**
   * طلب كود التوثيق لإعادة تعيين كلمة المرور
   */
  public async requestVerificationCode(email: string): Promise<VerificationCodeResult> {
    try {
      console.log('🔐 Requesting verification code for:', email);
      
      // محاكاة تأخير API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // البحث عن المستخدم
      const users = this.getAllUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        console.log('❌ User not found for verification code:', email);
        // لأغراض الأمان، لا نكشف أن المستخدم غير موجود
        return {
          success: true,
          message: 'إذا كان هذا البريد الإلكتروني مسجلاً لدينا، ستتلقى كود التوثيق قريباً.'
        };
      }
      
      // إنشاء كود التوثيق
      const verificationCode = this.generateVerificationCode();
      const expiresAt = Date.now() + (10 * 60 * 1000); // 10 دقائق
      
      // حذف أي كود سابق لنفس البريد الإلكتروني
      for (const [key, data] of this.verificationCodes.entries()) {
        if (data.email === email) {
          this.verificationCodes.delete(key);
        }
      }
      
      // حفظ كود التوثيق الجديد
      const codeId = `code_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.verificationCodes.set(codeId, {
        email: user.email,
        code: verificationCode,
        expiresAt
      });
      
      // إرسال بريد كود التوثيق
      try {
        console.log('📧 Sending verification code email to:', user.email);
        const emailSent = await emailService.sendVerificationCodeEmail({
          userName: user.name,
          userEmail: user.email,
          verificationCode: verificationCode,
          expiresIn: '10 دقائق'
        });
        
        if (emailSent) {
          console.log('✅ Verification code email sent successfully to:', user.email);
        } else {
          console.warn('⚠️ Failed to send verification code email to:', user.email);
        }
      } catch (emailError) {
        console.error('❌ Error sending verification code email:', emailError);
        // لا نفشل العملية إذا فشل إرسال البريد
      }
      
      console.log('✅ Verification code requested successfully for:', email);
      
      return {
        success: true,
        message: 'تم إرسال كود التوثيق إلى بريدك الإلكتروني. الكود صالح لمدة 10 دقائق.'
      };
      
    } catch (error) {
      console.error('❌ Verification code request error:', error);
      return {
        success: false,
        error: 'حدث خطأ أثناء معالجة طلب كود التوثيق'
      };
    }
  }

  /**
   * التحقق من صحة كود التوثيق
   */
  public async validateVerificationCode(email: string, code: string): Promise<CodeValidationResult> {
    try {
      console.log('🔍 Validating verification code for:', email);
      
      // محاكاة تأخير API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // البحث عن الكود
      let foundCodeData = null;
      let foundCodeId = null;
      
      for (const [codeId, codeData] of this.verificationCodes.entries()) {
        if (codeData.email === email && codeData.code === code) {
          foundCodeData = codeData;
          foundCodeId = codeId;
          break;
        }
      }
      
      if (!foundCodeData) {
        console.log('❌ Invalid verification code:', code);
        return {
          valid: false,
          expired: false,
          error: 'كود التوثيق غير صحيح'
        };
      }
      
      // التحقق من انتهاء الصلاحية
      if (Date.now() > foundCodeData.expiresAt) {
        console.log('❌ Verification code expired:', code);
        this.verificationCodes.delete(foundCodeId!);
        return {
          valid: false,
          expired: true,
          error: 'كود التوثيق منتهي الصلاحية'
        };
      }
      
      console.log('✅ Verification code is valid:', code);
      
      return {
        valid: true,
        expired: false,
        email: foundCodeData.email
      };
      
    } catch (error) {
      console.error('❌ Code validation error:', error);
      return {
        valid: false,
        expired: false,
        error: 'حدث خطأ أثناء التحقق من الكود'
      };
    }
  }

  /**
   * إعادة تعيين كلمة المرور باستخدام كود التوثيق
   */
  public async resetPasswordWithCode(email: string, code: string, newPassword: string): Promise<PasswordResetResult> {
    try {
      console.log('🔐 Resetting password with verification code for:', email);
      
      // التحقق من صحة الكود
      const validation = await this.validateVerificationCode(email, code);
      
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error || 'كود التوثيق غير صالح'
        };
      }
      
      // البحث عن المستخدم
      const users = this.getAllUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        return {
          success: false,
          error: 'المستخدم غير موجود'
        };
      }
      
      // تحديث كلمة المرور
      const passwords = JSON.parse(localStorage.getItem('skilloo_passwords') || '{}');
      passwords[user.id] = newPassword;
      localStorage.setItem('skilloo_passwords', JSON.stringify(passwords));
      
      // حذف كود التوثيق المستخدم
      for (const [codeId, codeData] of this.verificationCodes.entries()) {
        if (codeData.email === email && codeData.code === code) {
          this.verificationCodes.delete(codeId);
          break;
        }
      }
      
      console.log('✅ Password reset successfully for user:', user.email);
      
      // إرسال بريد تأكيد إعادة التعيين
      try {
        await emailService.sendNotificationEmail({
          userName: user.name,
          userEmail: user.email,
          message: 'تم إعادة تعيين كلمة المرور الخاصة بحسابك بنجاح! إذا لم تقم بهذا الإجراء، يرجى التواصل معنا فوراً.',
          type: 'general'
        });
      } catch (emailError) {
        console.error('❌ Error sending password reset confirmation email:', emailError);
      }
      
      return {
        success: true,
        message: 'تم إعادة تعيين كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.'
      };
      
    } catch (error) {
      console.error('❌ Password reset with code error:', error);
      return {
        success: false,
        error: 'حدث خطأ أثناء إعادة تعيين كلمة المرور'
      };
    }
  }

  public async requestPasswordReset(email: string): Promise<PasswordResetRequestResult> {
    try {
      console.log('🔐 Requesting password reset for:', email);
      
      if (this.useSupabase) {
        // استخدام Supabase لإعادة تعيين كلمة المرور
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/#/reset-password`
        });
        
        if (error) {
          console.error('❌ Supabase password reset error:', error);
          return {
            success: false,
            error: 'حدث خطأ أثناء إرسال رابط إعادة التعيين'
          };
        }
        
        console.log('✅ Supabase password reset email sent to:', email);
        return {
          success: true,
          message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد.'
        };
      }
      
      // النظام المحلي (LocalStorage)
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
        const emailSent = await emailService.sendVerificationCodeEmail({
          userName: user.name,
          userEmail: user.email,
          verificationCode: secureCode,
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
      
      if (this.useSupabase) {
        // استخدام Supabase لإعادة تعيين كلمة المرور
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });
        
        if (error) {
          console.error('❌ Supabase password update error:', error);
          return {
            success: false,
            error: 'حدث خطأ أثناء تحديث كلمة المرور'
          };
        }
        
        console.log('✅ Supabase password updated successfully');
        return {
          success: true,
          message: 'تم إعادة تعيين كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.'
        };
      }
      
      // النظام المحلي (LocalStorage)
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