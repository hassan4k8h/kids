import { useState, useEffect } from "react";
import { WelcomeScreen } from "./components/WelcomeScreen.tsx";
import { LoginScreen } from "./components/auth/LoginScreen.tsx";
import { SignupScreen } from "./components/auth/SignupScreen.tsx";
import { ForgotPasswordScreen } from "./components/auth/ForgotPasswordScreen.tsx";
import { ResetPasswordScreen } from "./components/auth/ResetPasswordScreen.tsx";
import { PlayerSetupScreen } from "./components/PlayerSetupScreen.tsx";
import { PlayerSelectionScreen } from "./components/PlayerSelectionScreen.tsx";
import { MainMenu } from "./components/MainMenu.tsx";
import { GameScreen } from "./components/GameScreen.tsx";
import { RewardsScreen } from "./components/RewardsScreen.tsx";
import { SettingsScreen } from "./components/SettingsScreen.tsx";
import { AchievementsScreen } from "./components/AchievementsScreen.tsx";
import { StoryEngine } from "./components/stories/StoryEngine.tsx";
import { SubscriptionScreen } from "./components/subscription/SubscriptionScreen.tsx";
import { UpgradePrompt } from "./components/subscription/UpgradePrompt.tsx";
import { EmailTest } from "./components/EmailTest.tsx";
import { EmailTestFull } from "./components/EmailTestFull.tsx";
import { gameNames } from "./constants/games.ts";
import { Player } from "./types/Player.ts";
import { User, AuthState } from "./types/Auth.ts";
import { SubscriptionState } from "./types/Subscription.ts";
import PlayerService from "./services/PlayerService.ts";
import { authService } from "./services/AuthService.ts";
import { subscriptionService } from "./services/SubscriptionService.ts";

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
  const [isRTL, setIsRTL] = useState(false);
  const [currentGame, setCurrentGame] = useState<GameInfo | null>(null);
  const [upgradePrompt, setUpgradePrompt] = useState<UpgradePromptState>({
    isOpen: false,
    trigger: 'general'
  });
  
  const [resetEmail, setResetEmail] = useState<string>('');
  const [resetToken, setResetToken] = useState<string>('');

  // الاشتراك في تغييرات حالة المصادقة
  useEffect(() => {
    const unsubscribe = authService.subscribe((newAuthState) => {
      setAuthState(newAuthState);
      setCurrentUser(newAuthState.user);
      
      if (newAuthState.user) {
        // تعيين المستخدم الحالي في خدمات أخرى
        subscriptionService.setCurrentUser(newAuthState.user.id);
        
        // تحديث اللغة
        const userLanguage = newAuthState.user.preferences?.language || 'ar';
        setIsRTL(userLanguage === 'ar');
        
        console.log(`👤 User authenticated: ${newAuthState.user.email} (${newAuthState.user.id})`);
      } else {
        // تنظيف البيانات عند عدم وجود مستخدم
        subscriptionService.setCurrentUser(null);
        setCurrentPlayer(null);
        console.log('👤 User logged out');
      }
    });

    return unsubscribe;
  }, []);

  // الاشتراك في تغييرات حالة الاشتراك
  useEffect(() => {
    const unsubscribe = subscriptionService.subscribe((newSubscriptionState) => {
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
    });

    return unsubscribe;
  }, []);

  // تحميل البيانات المحفوظة عند بدء التطبيق
  useEffect(() => {
    let mounted = true;
    
    const loadUserData = async () => {
      const savedUser = authService.getCurrentUser();
      if (!mounted) return;
      
      if (savedUser) {
        setCurrentUser(savedUser);
        
        // تعيين المستخدم في الخدمات
        subscriptionService.setCurrentUser(savedUser.id, {
          email: savedUser.email,
          name: savedUser.name
        });
        
        // تحديث اللغة
        const userLanguage = savedUser.preferences?.language || 'ar';
        setIsRTL(userLanguage === 'ar');
        
        // التأكد من وجود اشتراك صالح
        const isSubscribed = subscriptionService.isSubscriptionValid(savedUser.id);
        console.log('📋 Subscription check:', {
          userId: savedUser.id,
          isValid: isSubscribed,
          plan: subscriptionService.getUserSubscriptionState(savedUser.id).activePlan?.name
        });
        
        // تحميل اللاعب الحالي
        const savedPlayer = await PlayerService.getPlayer(savedUser.id);
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
    
    loadUserData();
    
    return () => {
      mounted = false;
    };
  }, []); // إزالة أي dependencies لتجنب إعادة التشغيل

  // تطبيق إعدادات RTL على المستند مع النصوص السوداء
  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = isRTL ? "ar" : "en";
    
    // تطبيق النصوص السوداء على الجسم
    document.body.style.color = '#000000';
    document.body.classList.add('font-semi-bold');
  }, [isRTL]);

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
      const allPlayers = await PlayerService.getPlayers();
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
    
    const allPlayers = await PlayerService.getPlayers();
    if (allPlayers.length > 0) {
      setCurrentScreen("playerSelection");
    } else {
      setCurrentScreen("playerSetup");
    }
  };

  const handleSignupSuccess = async () => {
    console.log(`✅ Signup successful for user: ${currentUser?.email}`);
    
    // بعد التسجيل، المستخدمون الجدد يحصلون على باقة مجانية تلقائياً
    if (currentUser) {
      // تعيين المستخدم في خدمة الاشتراكات
      subscriptionService.setCurrentUser(currentUser.id, {
        email: currentUser.email,
        name: currentUser.name
      });
      const allPlayers = await PlayerService.getPlayers();
      if (allPlayers.length > 0) {
        setCurrentScreen("playerSelection");
      } else {
        setCurrentScreen("playerSetup");
      }
    }
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
    setCurrentScreen("login"); // العودة لصفحة تسجيل الدخول مع رسالة نجاح
  };

  const handleResetPassword = (token?: string, email?: string) => {
    if (token) setResetToken(token);
    if (email) setResetEmail(email);
    setCurrentScreen("resetPassword");
  };

  const handleResetComplete = () => {
    setResetToken('');
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
    if (!currentUser) return;
    
    // التأكد من أن اللاعب ينتمي للمستخدم الحالي
    if (player.userId !== currentUser.id) {
      console.error('❌ Player does not belong to current user');
      return;
    }
    
    // تعيين اللاعب الحالي
    await PlayerService.savePlayer(player);
    setCurrentPlayer(player);
    
    // تحديث اللغة حسب تفضيلات اللاعب
    const playerLanguage = player.preferences?.language || 'ar';
    setIsRTL(playerLanguage === 'ar');
    
    setCurrentScreen("mainMenu");
    console.log(`🎮 Player selected: ${player.name} (${player.id})`);
  };

  const handleAddPlayer = async () => {
    if (!currentUser) return;
    
    // فحص إمكانية إضافة لاعب جديد
    const userPlayers = await PlayerService.getPlayers();
    const subscription = subscriptionService.getUserSubscriptionState(currentUser.id);
    const maxPlayers = subscription.activePlan?.limits?.maxPlayers || 1;
    
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
  };

  const handlePlayerSetupComplete = async (name: string, avatar: string) => {
    if (!currentUser) return;
    
    const newPlayer = await PlayerService.createPlayer(currentUser.id, name, avatar, isRTL ? 'ar' : 'en');
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
    
    // فحص إمكانية الوصول للعبة
    const gameAccess = subscriptionService.canAccessContent('game');
    if (!gameAccess.canAccess) {
      setUpgradePrompt({
        isOpen: true,
        trigger: 'game_limit'
      });
      console.log(`❌ Game access denied: ${gameAccess.reason}`);
      return;
    }
    
    // فحص إمكانية الوصول للمستوى
    const levelAccess = subscriptionService.canAccessContent('level', level);
    if (!levelAccess.canAccess) {
      setUpgradePrompt({
        isOpen: true,
        trigger: 'level_limit',
        level
      });
      console.log(`❌ Level access denied: ${levelAccess.reason}`);
      return;
    }
    
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
    
    // فحص إمكانية الوصول للقصص
    const storyAccess = subscriptionService.canAccessContent('story');
    if (!storyAccess.canAccess) {
      setUpgradePrompt({
        isOpen: true,
        trigger: 'story_limit'
      });
      console.log(`❌ Story access denied: ${storyAccess.reason}`);
      return;
    }
    
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
      await PlayerService.updatePlayer(currentUser.id, updatedPlayer);
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
    setCurrentScreen("playerSelection");
    console.log('🔄 Switching to player selection');
  };

  const handleBackToMainMenu = () => {
    setCurrentScreen("mainMenu");
    setCurrentGame(null);
  };

  // تسجيل الخروج
  const handleLogout = async () => {
    console.log('👋 Logging out user...');
    
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
            resetToken={resetToken}
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
                const allPlayers = await PlayerService.getPlayers();
                if (allPlayers.length > 0) {
                  setCurrentScreen("playerSelection");
                } else {
                  setCurrentScreen("welcome");
                }
              } else {
                setCurrentScreen("login");
              }
            }}
            isRTL={isRTL}
          />
        ) : null;
      
      case "mainMenu":
        return currentPlayer && currentUser ? (
          <MainMenu
            playerName={currentPlayer.name}
            playerAvatar={currentPlayer.avatar}
            onGameSelect={(gameId) => handleGameSelect(gameId)}
            onStoriesSelect={handleStoriesSelect}
            onRewards={() => setCurrentScreen("rewards")}
            onAchievements={() => setCurrentScreen("achievements")}
            onSettings={() => setCurrentScreen("settings")}
            onSwitchPlayer={handleSwitchPlayer}
            isRTL={isRTL}
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

  return (
    <div 
      className="min-h-screen bg-background font-semi-bold antialiased" 
      style={{ color: '#000000' }}
    >
      <div style={{ color: '#000000' }}>
        {renderCurrentScreen()}
      </div>
      
      {/* نافذة الترقية */}
      <UpgradePrompt
        isOpen={upgradePrompt.isOpen}
        onClose={() => setUpgradePrompt({ isOpen: false, trigger: 'general' })}
        onUpgrade={handleUpgrade}
        isRTL={isRTL}
        trigger={upgradePrompt.trigger}
        level={upgradePrompt.level}
      />
      
      {/* عرض معلومات الاشتراك في وضع التطوير */}
      {process.env.NODE_ENV === 'development' && currentUser && (
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