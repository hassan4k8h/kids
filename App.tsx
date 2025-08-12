import React, { useState, useEffect, useRef, Suspense } from "react";
import { formatNumber } from "./utils/locale.ts";
import { WelcomeScreen } from "./components/WelcomeScreen.tsx";
import { UpgradePrompt } from "./components/subscription/UpgradePrompt.tsx";
import { audioService } from "./services/AudioService.ts";

// Lazy-loaded screens to reduce initial bundle size
const LoginScreen = React.lazy(() => import("./components/auth/LoginScreen.tsx").then(m => ({ default: m.LoginScreen })));
const SignupScreen = React.lazy(() => import("./components/auth/SignupScreen.tsx").then(m => ({ default: m.SignupScreen })));
const ForgotPasswordScreen = React.lazy(() => import("./components/auth/ForgotPasswordScreen.tsx").then(m => ({ default: m.ForgotPasswordScreen })));
const ResetPasswordScreen = React.lazy(() => import("./components/auth/ResetPasswordScreen.tsx").then(m => ({ default: m.ResetPasswordScreen })));
const PlayerSetupScreen = React.lazy(() => import("./components/PlayerSetupScreen.tsx").then(m => ({ default: m.PlayerSetupScreen })));
const PlayerSelectionScreen = React.lazy(() => import("./components/PlayerSelectionScreen.tsx").then(m => ({ default: m.PlayerSelectionScreen })));
const MainMenu = React.lazy(() => import("./components/MainMenu.tsx").then(m => ({ default: m.MainMenu })));
const GameScreen = React.lazy(() => import("./components/GameScreen.tsx").then(m => ({ default: m.GameScreen })));
const RewardsScreen = React.lazy(() => import("./components/RewardsScreen.tsx").then(m => ({ default: m.RewardsScreen })));
const SettingsScreen = React.lazy(() => import("./components/SettingsScreen.tsx").then(m => ({ default: m.SettingsScreen })));
const AchievementsScreen = React.lazy(() => import("./components/AchievementsScreen.tsx").then(m => ({ default: m.AchievementsScreen })));
const StoryEngine = React.lazy(() => import("./components/stories/StoryEngine.tsx").then(m => ({ default: m.StoryEngine })));
const SubscriptionScreen = React.lazy(() => import("./components/subscription/SubscriptionScreen.tsx").then(m => ({ default: m.SubscriptionScreen })));
const EmailTest = React.lazy(() => import("./components/EmailTest.tsx").then(m => ({ default: m.EmailTest })));
const EmailTestFull = React.lazy(() => import("./components/EmailTestFull.tsx").then(m => ({ default: m.EmailTestFull })));
import { gameNames } from "./constants/games.ts";
import { Player } from "./types/Player.ts";
import { User, AuthState } from "./types/Auth.ts";
import { SubscriptionState } from "./types/Subscription.ts";
import PlayerService from "./services/PlayerService.ts";
import { authService } from "./services/AuthService.ts";
import { subscriptionService } from "./services/SubscriptionService.ts";
import { usePWAInstall } from "./hooks/usePWAInstall";

type Screen = 
  | "welcome"
  | "login"
  | "signup"
  | "forgotPassword"
  | "resetPassword"
  | "subscription"
  | "playerSelection"
  | "playerSetup" 
  | "mainMenu" 
  | "game" 
  | "rewards" 
  | "settings" 
  | "achievements"
  | "stories"
  | "emailTest"
  | "emailTestFull";

interface GameInfo {
  id: string;
  name: string;
  nameAr: string;
}

interface UpgradePromptState {
  isOpen: boolean;
  trigger: 'game_limit' | 'story_limit' | 'level_limit' | 'general';
  level?: number;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [authState, setAuthState] = useState<AuthState>(authService.getAuthState());
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>(subscriptionService.getSubscriptionState());
  const [isRTL, setIsRTL] = useState(true);
  const [currentGame, setCurrentGame] = useState<GameInfo | null>(null);
  const [upgradePrompt, setUpgradePrompt] = useState<UpgradePromptState>({
    isOpen: false,
    trigger: 'general'
  });
  
  const [resetEmail, setResetEmail] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const lastPushedScreenRef = useRef<Screen | null>(null);

  // PWA install prompt
  const { canInstall, install, autoPrompt, isIOS, isStandalone, dismissed } = usePWAInstall();

  // معالج الأخطاء العام
  const handleError = (error: any, context: string) => {
    console.error(`❌ Error in ${context}:`, error);
    setError(`حدث خطأ في ${context}. يرجى المحاولة مرة أخرى.`);
    
    // إخفاء رسالة الخطأ بعد 5 ثوان
    setTimeout(() => setError(null), 5000);
  };

  // معالج الإشعارات العام
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };



  // الاشتراك في تغييرات حالة المصادقة
  useEffect(() => {
    let isMounted = true; // تجنب تحديث الحالة إذا تم إلغاء المكون
    
    const unsubscribe = authService.subscribe((newAuthState) => {
      if (!isMounted) return;
      
      try {
        setAuthState(newAuthState);
        setCurrentUser(newAuthState.user);
        
        if (newAuthState.user) {
          // تعيين المستخدم الحالي في خدمات أخرى
          subscriptionService.setCurrentUser(newAuthState.user.id);
          
          // ملاحظة: لا نغير اللغة تلقائياً - فقط عند الضغط على زر تبديل اللغة
          
          console.log(`👤 User authenticated: ${newAuthState.user.email} (${newAuthState.user.id})`);
        } else {
          // تنظيف البيانات عند عدم وجود مستخدم
          subscriptionService.setCurrentUser(null);
          setCurrentPlayer(null);
          console.log('👤 User logged out');
        }
      } catch (error) {
        handleError(error, 'تحديث حالة المصادقة');
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // الاشتراك في تغييرات حالة الاشتراك
  useEffect(() => {
    let isMounted = true;
    
    const unsubscribe = subscriptionService.subscribe((newSubscriptionState) => {
      if (!isMounted) return;
      
      try {
        setSubscriptionState(newSubscriptionState);
        console.log('💳 Subscription state updated:', {
          plan: newSubscriptionState.activePlan?.name,
          gamesLeft: newSubscriptionState.activePlan?.limits?.maxGamesPerDay === -1 
            ? 'unlimited' 
            : (newSubscriptionState.activePlan?.limits?.maxGamesPerDay || 0) - newSubscriptionState.usage.gamesPlayedToday,
          storiesLeft: newSubscriptionState.activePlan?.limits?.maxStoriesPerWeek === -1 
            ? 'unlimited' 
            : (newSubscriptionState.activePlan?.limits?.maxStoriesPerWeek || 0) - newSubscriptionState.usage.storiesReadThisWeek
        });
      } catch (error) {
        handleError(error, 'تحديث حالة الاشتراك');
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // تحميل البيانات المحفوظة عند بدء التطبيق
  useEffect(() => {
    let mounted = true;
    let hasLoaded = false; // منع التحميل المتكرر
    
    const loadUserData = async () => {
      if (hasLoaded) {
        console.log('🔄 Data already loaded, skipping');
        return;
      }
      
      hasLoaded = true;
      console.log('📱 Starting app initialization');
      
      const savedUser = authService.getCurrentUser();
      if (!mounted) return;
      
      if (savedUser) {
        setCurrentUser(savedUser);
        
        // تعيين المستخدم في الخدمات
        subscriptionService.setCurrentUser(savedUser.id, {
          email: savedUser.email,
          name: savedUser.name
        });
        
        // التأكد من وجود اشتراك صالح
        const isSubscribed = subscriptionService.isSubscriptionValid(savedUser.id);
        console.log('📋 Subscription check:', {
          userId: savedUser.id,
          isValid: isSubscribed,
          plan: subscriptionService.getUserSubscriptionState(savedUser.id).activePlan?.name
        });
        
        // تحميل اللاعب الحالي المحفوظ
        const savedPlayer = await PlayerService.getCurrentPlayer(savedUser.id);
        if (!mounted) return;
        
        if (savedPlayer) {
          setCurrentPlayer(savedPlayer);
          setCurrentScreen("mainMenu");
          console.log(`🎮 Current player loaded: ${savedPlayer.name}`);
        } else {
          // التحقق من وجود لاعبين للمستخدم
          const userPlayers = await PlayerService.getPlayers(savedUser.id);
          if (!mounted) return;
          
          if (userPlayers.length > 0) {
            setCurrentScreen("playerSelection");
            console.log(`🎮 Found ${userPlayers.length} players for user`);
          } else {
            setCurrentScreen("playerSetup");
            console.log('🎮 No players found, redirecting to setup');
          }
        }
      } else {
        // فقط قم بتعيين الشاشة إذا لم تكن welcome بالفعل
        if (currentScreen !== "welcome") {
          setCurrentScreen("welcome");
          console.log('👋 No authenticated user, showing welcome screen');
        }
      }
    };
    
    loadUserData().finally(() => {
      // إخفاء loading screen بعد تحميل البيانات
      setTimeout(() => {
        if (mounted) {
          setIsAppLoading(false);
        }
      }, 800);
    });
    
    return () => {
      mounted = false;
    };
  }, []); // إزالة أي dependencies لتجنب إعادة التشغيل

  // تكامل زر الرجوع في الجهاز والمتصفح باستخدام history API
  useEffect(() => {
    try {
      // عند أول تحميل، ادفع الحالة الحالية
      if (!lastPushedScreenRef.current) {
        window.history.replaceState({ screen: currentScreen }, "", `#${currentScreen}`);
        lastPushedScreenRef.current = currentScreen;
      }

      const onPopState = (e: PopStateEvent) => {
        const state = (e.state || {}) as { screen?: Screen };
        if (state.screen) {
          setCurrentScreen(state.screen);
        } else {
          // رجوع بدون حالة: عد إلى القائمة الرئيسية إن وُجد لاعب، وإلا شاشة الترحيب
          setCurrentScreen(currentPlayer ? "mainMenu" : "welcome");
        }
      };
      window.addEventListener("popstate", onPopState);
      return () => window.removeEventListener("popstate", onPopState);
    } catch {}
  }, [currentPlayer]);

  // ادفع حالة جديدة كلما تغيّرت الشاشة
  useEffect(() => {
    try {
      if (lastPushedScreenRef.current !== currentScreen) {
        window.history.pushState({ screen: currentScreen }, "", `#${currentScreen}`);
        lastPushedScreenRef.current = currentScreen;
      }
      // ضمان قابلية التمرير للصفحة الحالية
      document.documentElement.style.overflowY = 'auto';
      document.body.style.overflowY = 'auto';
    } catch {}
  }, [currentScreen]);

  // تطبيق إعدادات RTL على المستند مع النصوص السوداء
  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = isRTL ? "ar" : "en";
    
    // تطبيق النصوص السوداء على الجسم
    document.body.style.color = '#000000';
    document.body.classList.add('font-semi-bold');
    // منع السحب الأفقي وإظهار انزلاقات غير مقصودة
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.overflowX = 'hidden';
    document.body.style.overscrollBehaviorX = 'none';
    document.body.style.touchAction = 'pan-y';
  }, [isRTL]);

  // ملاحظة: تم إزالة معالجة URL parameters لأن النظام الجديد يستخدم كود التوثيق بدلاً من الروابط

  // معالج بدء التطبيق من الشاشة الترحيبية
  const handleStart = async () => {
    // منع التشغيل المتعدد
    if (currentScreen !== "welcome") {
      console.log('🚫 handleStart blocked - not on welcome screen');
      return;
    }
    
    console.log('🚀 handleStart called');
    console.log('🔐 Auth state:', authState);
    console.log('👤 Current user:', currentUser);
    
    if (authState.isAuthenticated && currentUser) {
      // التأكد من وجود اشتراك
      const isSubscribed = subscriptionService.isSubscriptionValid(currentUser.id);
      console.log(`🚀 App start - subscription valid: ${isSubscribed}`);
      
      // الانتقال لاختيار اللاعب
      const allPlayers = await PlayerService.getPlayers(currentUser.id);
      if (allPlayers.length > 0) {
        console.log('🎮 Navigating to player selection');
        setCurrentScreen("playerSelection");
      } else {
        console.log('🎮 Navigating to player setup');
        setCurrentScreen("playerSetup");
      }
    } else {
      // المستخدم غير مسجل، اذهب لتسجيل الدخول
      console.log('🔐 User not authenticated, navigating to login');
      setCurrentScreen("login");
    }
  };

  // معالجات المصادقة
  const handleLoginSuccess = async () => {
    if (!currentUser) return;
    
    console.log(`✅ Login successful for user: ${currentUser.email}`);
    
    // تعيين المستخدم في خدمة الاشتراكات
    subscriptionService.setCurrentUser(currentUser.id, {
      email: currentUser.email,
      name: currentUser.name
    });
    
    // التأكد من وجود اشتراك
    subscriptionService.isSubscriptionValid(currentUser.id);
    
    const allPlayers = await PlayerService.getPlayers(currentUser.id);
    if (allPlayers.length > 0) {
      setCurrentScreen("playerSelection");
    } else {
      setCurrentScreen("playerSetup");
    }
  };

  const handleSignupSuccess = async () => {
    // بعد إنشاء الحساب، انقل المستخدم إلى صفحة تسجيل الدخول واملأ البريد تلقائياً
    console.log('✅ Signup completed. Redirecting to login with prefilled email');
    setCurrentScreen("login");
    // تخزين البريد المؤقت لملئه في شاشة تسجيل الدخول
    try {
      const lastEmail = authService.getCurrentUser()?.email;
      if (lastEmail) localStorage.setItem('prefill_login_email', lastEmail);
    } catch {}
  };

  const handleSwitchToSignup = () => {
    setCurrentScreen("signup");
  };

  const handleSwitchToLogin = () => {
    setCurrentScreen("login");
  };

  const handleForgotPassword = () => {
    setCurrentScreen("forgotPassword");
  };

  const handleResetSent = (email: string) => {
    setResetEmail(email);
    setCurrentScreen("resetPassword"); // الانتقال إلى صفحة إدخال كود التوثيق
  };

  const handleResetPassword = (token?: string, email?: string) => {
    if (token) setVerificationCode(token);
    if (email) setResetEmail(email);
    setCurrentScreen("resetPassword");
  };

  const handleResetComplete = () => {
    setVerificationCode('');
    setResetEmail('');
    setCurrentScreen("login");
  };

  // معالج إتمام الاشتراك
  const handleSubscriptionComplete = () => {
    console.log('🎉 Subscription completed successfully!');
    
    // تحديث حالة الاشتراك
    if (currentUser) {
      const newSubscriptionState = subscriptionService.getUserSubscriptionState(currentUser.id);
      setSubscriptionState(newSubscriptionState);
    }
    
    // إغلاق نافذة الترقية
    setUpgradePrompt({ isOpen: false, trigger: 'general' });
    
    // العودة للشاشة الرئيسية
    setCurrentScreen("mainMenu");
  };

  // معالجات اللاعب
  const handlePlayerSelect = async (player: Player) => {
    try {
      if (!currentUser) {
        handleError(new Error('لا يوجد مستخدم مسجل'), 'اختيار اللاعب');
        return;
      }
      
      // التأكد من أن اللاعب ينتمي للمستخدم الحالي أو تحديث userId إذا كان فارغاً
      if (player.userId && player.userId !== currentUser.id) {
        console.error('❌ Player does not belong to current user');
        handleError(new Error('هذا اللاعب لا ينتمي لحسابك'), 'اختيار اللاعب');
        return;
      }
      
      // تحديث userId للاعب إذا كان فارغاً (للتوافق مع البيانات القديمة)
      if (!player.userId) {
        player.userId = currentUser.id;
        console.log(`🔄 Updated player userId: ${player.name} -> ${currentUser.id}`);
      }
      
      // تعيين اللاعب الحالي
      await PlayerService.savePlayer(player);
      PlayerService.setCurrentPlayer(currentUser.id, player.id); // حفظ اللاعب الحالي
      setCurrentPlayer(player);
      
      // ملاحظة: لا نغير اللغة تلقائياً عند اختيار لاعب
      
      setCurrentScreen("mainMenu");
      console.log(`🎮 Player selected: ${player.name} (${player.id})`);
    } catch (error) {
      handleError(error, 'اختيار اللاعب');
    }
  };

  const handleAddPlayer = async () => {
    try {
      if (!currentUser) {
        handleError(new Error('لا يوجد مستخدم مسجل'), 'إضافة لاعب');
        return;
      }
      
      // فحص إمكانية إضافة لاعب جديد
      const userPlayers = await PlayerService.getPlayers(currentUser.id);
      const subscription = subscriptionService.getUserSubscriptionState(currentUser.id);
      const maxPlayers = subscription.activePlan?.limits?.maxPlayers || 2; // الباقة المجانية تسمح بطفلين
      
      if (maxPlayers !== -1 && userPlayers.length >= maxPlayers) {
        setUpgradePrompt({
          isOpen: true,
          trigger: 'general'
        });
        console.log(`❌ Player limit reached: ${userPlayers.length}/${maxPlayers}`);
        return;
      }
      
      setCurrentScreen("playerSetup");
      console.log(`➕ Adding new player (${userPlayers.length + 1}/${maxPlayers === -1 ? '∞' : maxPlayers})`);
    } catch (error) {
      handleError(error, 'إضافة لاعب');
    }
  };

  const handlePlayerSetupComplete = async (name: string, avatar: string) => {
    if (!currentUser) return;
    
    const newPlayer = await PlayerService.createPlayer(currentUser.id, name, avatar, isRTL ? 'ar' : 'en');
    PlayerService.setCurrentPlayer(currentUser.id, newPlayer.id); // حفظ اللاعب الجديد كـ current
    setCurrentPlayer(newPlayer);
    
    // تحديث إحصائيات الاستخدام
    const usage = subscriptionService.getUserUsageStats(currentUser.id);
    usage.totalPlayersCreated++;
    
    setCurrentScreen("mainMenu");
    console.log(`✅ Player created: ${newPlayer.name} for user ${currentUser.id}`);
  };

  // معالجات اللعبة مع فحص الحدود
  const handleGameSelect = (gameId: string, level: number = 1) => {
    if (!currentUser) return;
    try { localStorage.setItem('scroll_pos_main', String(window.scrollY || 0)); } catch {}
    // إيقاف أي أصوات قبل الدخول للعبة
    try { audioService.stopAllSounds(); } catch {}
    
    // تسجيل استخدام اللعبة
    subscriptionService.recordUsage(currentUser.id, 'game', level);
    
    const gameInfo = gameNames[gameId];
    setCurrentGame({
      id: gameId,
      name: gameInfo.name,
      nameAr: gameInfo.nameAr
    });
    setCurrentScreen("game");
    
    console.log(`🎮 Game started: ${gameInfo.name} (Level ${level}) for user ${currentUser.id}`);
  };

  const handleStoriesSelect = () => {
    if (!currentUser) return;
    try { localStorage.setItem('scroll_pos_main', String(window.scrollY || 0)); } catch {}
    // إيقاف أي أصوات قبل فتح القصص
    try { audioService.stopAllSounds(); } catch {}
    
    setCurrentScreen("stories");
    console.log(`📚 Stories opened for user ${currentUser.id}`);
  };

  // معالج إتمام القصة
  const handleStoryComplete = async (stats: { storiesRead: number; pointsEarned: number; timeSpent: number }) => {
    if (currentUser && currentPlayer && stats.storiesRead > 0) {
      subscriptionService.recordUsage(currentUser.id, 'story');
      
      // تحديث إحصائيات اللاعب
      await PlayerService.updateStoryStats(currentUser.id, currentPlayer.id, {
        totalRead: stats.storiesRead,
        readingTime: stats.timeSpent
      });
      
      console.log(`📚 Story completed:`, stats);
    }
    handleBackToMainMenu();
  };

  // معالجات الإعدادات
  const handleLanguageChange = async (newIsRTL: boolean) => {
    setIsRTL(newIsRTL);
    
    // تحديث تفضيلات اللاعب الحالي
    if (currentPlayer && currentUser) {
      const updatedPlayer: Player = {
        ...currentPlayer,
        preferences: {
          ...currentPlayer.preferences,
          language: newIsRTL ? 'ar' as const : 'en' as const
        }
      };
      setCurrentPlayer(updatedPlayer);
      await PlayerService.updatePlayer(updatedPlayer);
    }

    // تحديث تفضيلات المستخدم
    if (currentUser) {
      authService.updateUserProfile({
        preferences: {
          ...currentUser.preferences,
          language: newIsRTL ? 'ar' as const : 'en' as const
        }
      });
    }
    
    console.log(`🌐 Language changed to: ${newIsRTL ? 'Arabic' : 'English'}`);
  };

  const handleSwitchPlayer = () => {
    try { audioService.stopAllSounds(); } catch {}
    setCurrentScreen("playerSelection");
    console.log('🔄 Switching to player selection');
  };

  const handleBackToMainMenu = () => {
    try { audioService.stopAllSounds(); } catch {}
    // ارجع دائماً للقائمة الرئيسية لضمان استقرار التمرير
    setCurrentScreen("mainMenu");
    setCurrentGame(null);
    // استعادة موضع التمرير بعد أن يتم تركيب القائمة
    setTimeout(() => {
      try {
        const y = parseInt(localStorage.getItem('scroll_pos_main') || '0', 10);
        document.documentElement.style.overflowY = 'auto';
        document.body.style.overflowY = 'auto';
        document.body.classList.add('main-scroll-restored');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.scrollTo(0, isNaN(y) ? 0 : y);
            setTimeout(() => document.body.classList.remove('main-scroll-restored'), 100);
          });
        });
      } catch {}
    }, 0);
  };

  // تسجيل الخروج
  const handleLogout = async () => {
    console.log('👋 Logging out user...');
    try { audioService.stopAllSounds(); } catch {}
    
    await authService.logout();
    setCurrentPlayer(null);
    setCurrentUser(null);
    setCurrentScreen("welcome");
    
    console.log('✅ User logged out successfully');
  };

  // العودة من شاشات المصادقة
  const handleBackFromAuth = async () => {
    if (authState.isAuthenticated && currentUser) {
      const allPlayers = await PlayerService.getPlayers();
      if (allPlayers.length > 0) {
        setCurrentScreen("playerSelection");
      } else {
        setCurrentScreen("playerSetup");
      }
    } else {
      setCurrentScreen("welcome");
    }
  };

  // العودة من شاشة الاشتراك
  const handleBackFromSubscription = () => {
    if (authState.isAuthenticated) {
      setCurrentScreen("mainMenu");
    } else {
      setCurrentScreen("login");
    }
  };

  // معالج الترقية
  const handleUpgrade = () => {
    setUpgradePrompt({ isOpen: false, trigger: 'general' });
    setCurrentScreen("subscription");
    console.log('💳 Redirecting to subscription upgrade');
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case "welcome":
        return (
          <WelcomeScreen 
            onStart={handleStart} 
            isRTL={isRTL}
            onLanguageChange={handleLanguageChange}
          />
        );

      case "login":
        return (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onSwitchToSignup={handleSwitchToSignup}
            onForgotPassword={handleForgotPassword}
            onBack={handleBackFromAuth}
            isRTL={isRTL}
            onLanguageChange={handleLanguageChange}
          />
        );

      case "signup":
        return (
          <SignupScreen
            onSignupSuccess={handleSignupSuccess}
            onSwitchToLogin={handleSwitchToLogin}
            onBack={handleBackFromAuth}
            isRTL={isRTL}
            onLanguageChange={handleLanguageChange}
          />
        );

      case "forgotPassword":
        return (
          <ForgotPasswordScreen
            onBack={handleSwitchToLogin}
            onResetSent={handleResetSent}
            isRTL={isRTL}
            onLanguageChange={handleLanguageChange}
          />
        );

      case "resetPassword":
        return (
          <ResetPasswordScreen
            onBack={handleSwitchToLogin}
            onResetComplete={handleResetComplete}
            verificationCode={verificationCode}
            userEmail={resetEmail}
            isRTL={isRTL}
            onLanguageChange={handleLanguageChange}
          />
        );

      case "subscription":
        return currentUser ? (
          <SubscriptionScreen
            user={currentUser}
            onBack={handleBackFromSubscription}
            onSubscriptionComplete={handleSubscriptionComplete}
            isRTL={isRTL}
          />
        ) : null;

      case "playerSelection":
        return currentUser ? (
          <PlayerSelectionScreen
            onPlayerSelect={handlePlayerSelect}
            onAddPlayer={handleAddPlayer}
            onBack={() => {
              if (authState.isAuthenticated) {
                setCurrentScreen("welcome");
              } else {
                setCurrentScreen("login");
              }
            }}
            onLogout={async () => {
              try {
                if (currentUser) {
                  PlayerService.clearCurrentPlayer(currentUser.id); // مسح اللاعب الحالي المحفوظ
                }
                await authService.logout();
                setCurrentUser(null);
                setCurrentPlayer(null);
                setCurrentScreen("welcome");
                console.log('✅ User logged out successfully');
              } catch (error) {
                console.error('❌ Logout error:', error);
              }
            }}
            isRTL={isRTL}
            userId={currentUser.id}
          />
        ) : null;
      
      case "playerSetup":
        return currentUser ? (
          <PlayerSetupScreen
            onComplete={handlePlayerSetupComplete}
            onBack={async () => {
              if (authState.isAuthenticated) {
                const allPlayers = await PlayerService.getPlayers(currentUser.id);
                if (allPlayers.length > 0) {
                  setCurrentScreen("playerSelection");
                } else {
                  setCurrentScreen("welcome");
                }
              } else {
                setCurrentScreen("login");
              }
            }}
            onUpgradeRequired={() => setCurrentScreen("subscription")}
            isRTL={isRTL}
          />
        ) : null;
      
      case "mainMenu":
        return currentPlayer && currentUser ? (
          <MainMenu
            playerName={currentPlayer.name}
            playerAvatar={currentPlayer.avatar}
            onGameSelect={(gameId, level) => handleGameSelect(gameId, level || 1)}
            onStoriesSelect={handleStoriesSelect}
            onRewards={() => setCurrentScreen("rewards")}
            onAchievements={() => setCurrentScreen("achievements")}
            onSettings={() => setCurrentScreen("settings")}
            onSwitchPlayer={handleSwitchPlayer}
            isRTL={isRTL}
            points={currentPlayer.totalScore}
            achievementsCount={currentPlayer.achievements.length}
            streakDays={subscriptionService.getUserUsageStats(currentUser.id).streakDays}
            currentLevel={Object.values(currentPlayer.gameProgress).reduce((max, g) => Math.max(max, g.level), 1)}
            levelProgressPercent={
              (() => {
                const levels = Object.values(currentPlayer.gameProgress);
                if (levels.length === 0) return 0;
                const avg = levels.reduce((sum, g) => sum + (g.completedLevels || 0), 0) / levels.length;
                return Math.max(0, Math.min(100, Math.round((avg / 10) * 100)));
              })()
            }
            gameProgressById={currentPlayer.gameProgress as any}
          />
        ) : null;
      
      case "game":
        return currentGame && currentPlayer && currentUser ? (
          <GameScreen
            gameId={currentGame.id}
            gameName={isRTL ? currentGame.nameAr : currentGame.name}
            gameNameAr={currentGame.nameAr}
            onBack={handleBackToMainMenu}
            onHome={handleBackToMainMenu}
            isRTL={isRTL}
            userId={currentUser.id}
            playerId={currentPlayer.id}
          />
        ) : null;

      case "stories":
        return currentPlayer ? (
          <StoryEngine
            player={currentPlayer}
            isRTL={isRTL}
            onComplete={handleStoryComplete}
            onBack={handleBackToMainMenu}
          />
        ) : null;
      
      case "rewards":
        return currentPlayer ? (
          <RewardsScreen
            onBack={handleBackToMainMenu}
            isRTL={isRTL}
          />
        ) : null;
      
      case "settings":
        return currentPlayer && currentUser ? (
          <SettingsScreen
            player={currentPlayer}
            user={currentUser}
            onBack={handleBackToMainMenu}
            onSwitchPlayer={handleSwitchPlayer}
            onLogout={handleLogout}
            isRTL={isRTL}
            onLanguageChange={handleLanguageChange}
          />
        ) : null;
      
      case "achievements":
        return currentPlayer ? (
          <AchievementsScreen
            onBack={handleBackToMainMenu}
            isRTL={isRTL}
          />
        ) : null;
      
      default:
        return null;
        
      case "emailTest":
        return <EmailTest isRTL={isRTL} />;
        
      case "emailTestFull":
        return <EmailTestFull isRTL={isRTL} />;
    }
  };

  // عرض loading screen
  if (isAppLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h1 className="text-white text-3xl font-bold mb-2">
            {isRTL ? 'سكيلو' : 'Skilloo'}
          </h1>
          <p className="text-white/90 text-lg font-medium">
            {isRTL ? 'جاري التحميل...' : 'Loading...'}
          </p>
          <div className="mt-4 flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-background font-semi-bold antialiased" 
      style={{ color: '#000000' }}
    >
      {/* بانر تثبيت يظهر فور فتح الرابط بشكل احترافي (يختفي بعد التثبيت أو الإخفاء) */}
      {!isStandalone && !dismissed && (
        <div className="fixed bottom-4 inset-x-4 z-50">
          <div className="bg-white/95 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-3 text-sm text-gray-800 flex items-center justify-between gap-3">
            <div className="flex-1">
              {isIOS
                ? 'أضف التطبيق إلى الشاشة الرئيسية: اضغط مشاركة ثم "أضف إلى الشاشة الرئيسية"'
                : 'ثبّت التطبيق للاستعمال السريع دون متصفح'}
            </div>
            {!isIOS && (
              <button
                onClick={install}
                disabled={!canInstall}
                className={`px-3 py-2 rounded-lg text-white ${canInstall ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400 cursor-not-allowed'} `}
                title={canInstall ? 'تثبيت التطبيق' : 'جاري التحضير للتثبيت...'}
              >
                {canInstall ? 'تثبيت' : 'لحظة...'}
              </button>
            )}
            <button
              onClick={() => { try { localStorage.setItem('pwa_dismissed_v1','1'); } catch {}; }}
              className="px-2 py-1 rounded-lg bg-gray-200 hover:bg-gray-300"
            >
              إخفاء
            </button>
          </div>
        </div>
      )}
      <div style={{ color: '#000000' }}>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-gray-300 border-t-primary-500 rounded-full animate-spin" /></div>}>
          {renderCurrentScreen()}
        </Suspense>
      </div>
      
      {/* عرض رسائل الأخطاء */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
          <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg border border-red-600">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{error}</span>
              <button 
                onClick={() => setError(null)}
                className="ml-3 text-white hover:text-gray-200 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full mx-4">
          <div className={`p-4 rounded-lg shadow-lg border transform transition-all duration-300 ${
            toast.type === 'success' ? 'bg-green-500 border-green-600 text-white' :
            toast.type === 'error' ? 'bg-red-500 border-red-600 text-white' :
            'bg-blue-500 border-blue-600 text-white'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                {toast.type === 'success' && <span>✅</span>}
                {toast.type === 'error' && <span>❌</span>}
                {toast.type === 'info' && <span>ℹ️</span>}
                <span className="text-sm font-medium">{toast.message}</span>
              </div>
              <button 
                onClick={() => setToast(null)}
                className="ml-3 text-white hover:text-gray-200 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة الترقية */}
      <UpgradePrompt
        isOpen={upgradePrompt.isOpen}
        onClose={() => setUpgradePrompt({ isOpen: false, trigger: 'general' })}
        onUpgrade={handleUpgrade}
        isRTL={isRTL}
        trigger={upgradePrompt.trigger}
        level={upgradePrompt.level}
      />
      
      {/* عرض معلومات الاشتراك - يمكن تفعيلها بوضع VITE_SHOW_DEBUG=true */}
      {import.meta.env.VITE_SHOW_DEBUG === 'true' && currentUser && (
        <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-2xl text-sm font-mono z-50 max-w-xs backdrop-blur-md border border-white/20 shadow-large">
          <div className="space-y-1">
            <div className="text-white"><strong className="text-white">User:</strong> <span className="text-white">{currentUser.email}</span></div>
            <div className="text-white"><strong className="text-white">ID:</strong> <span className="text-white">{currentUser.id.slice(-8)}</span></div>
            <div className="text-white"><strong className="text-white">Plan:</strong> <span className="text-white">{subscriptionState.activePlan?.name || 'None'}</span></div>
            <div className="text-white"><strong className="text-white">Games Today:</strong> <span className="text-white">{subscriptionState.usage.gamesPlayedToday}/{subscriptionState.activePlan?.limits?.maxGamesPerDay === -1 ? '∞' : subscriptionState.activePlan?.limits?.maxGamesPerDay || 0}</span></div>
            <div className="text-white"><strong className="text-white">Stories Week:</strong> <span className="text-white">{subscriptionState.usage.storiesReadThisWeek}/{subscriptionState.activePlan?.limits?.maxStoriesPerWeek === -1 ? '∞' : subscriptionState.activePlan?.limits?.maxStoriesPerWeek || 0}</span></div>
            <div className="text-white"><strong className="text-white">Max Level:</strong> <span className="text-white">{subscriptionState.usage.currentMaxLevel}</span></div>
            <div className="text-white"><strong className="text-white">Screen:</strong> <span className="text-white">{currentScreen}</span></div>
            {currentPlayer && <div className="text-white"><strong className="text-white">Player:</strong> <span className="text-white">{currentPlayer.name}</span></div>}
            <div className="flex gap-2 mt-2">
              <button 
                onClick={() => setCurrentScreen("emailTest")}
                className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs flex-1 transition-colors"
              >
                📧 Email Test
              </button>
              <button 
                onClick={() => setCurrentScreen("emailTestFull")}
                className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs flex-1 transition-colors"
              >
                🧪 Full Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}