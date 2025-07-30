import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { 
  ArrowLeft, Settings, User, Volume2, Shield, Database, 
  Crown, Languages, Users, LogOut, Info
} from "lucide-react";
import { Player } from "../types/Player";
import { User as AuthUser } from "../types/Auth";
import { GeneralSettings } from "./settings/GeneralSettings";
import { AccountSettings } from "./settings/AccountSettings";
import { AudioSettings } from "./settings/AudioSettings";
import { ParentalControls } from "./settings/ParentalControls";
import { DataSettings } from "./settings/DataSettings";
import { SubscriptionSettings } from "./settings/SubscriptionSettings";

interface SettingsScreenProps {
  player: Player;
  user: AuthUser;
  onBack: () => void;
  onSwitchPlayer: () => void;
  onLogout: () => void;
  isRTL: boolean;
  onLanguageChange: (isRTL: boolean) => void;
}

type SettingsCategory = 'general' | 'account' | 'subscription' | 'audio' | 'parental' | 'data';

interface SettingsCategoryInfo {
  id: SettingsCategory;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const SETTINGS_CATEGORIES: SettingsCategoryInfo[] = [
  {
    id: 'general',
    name: 'General',
    nameAr: 'عام',
    description: 'Language, theme, and basic preferences',
    descriptionAr: 'اللغة والشكل والتفضيلات الأساسية',
    icon: Settings,
    color: 'from-blue-500 to-cyan-600'
  },
  {
    id: 'account',
    name: 'Account',
    nameAr: 'الحساب',
    description: 'Profile, email, and account management',
    descriptionAr: 'الملف الشخصي والبريد وإدارة الحساب',
    icon: User,
    color: 'from-purple-500 to-pink-600'
  },
  {
    id: 'subscription',
    name: 'Subscription',
    nameAr: 'الاشتراك',
    description: 'Manage your premium subscription',
    descriptionAr: 'إدارة اشتراكك المميز',
    icon: Crown,
    color: 'from-yellow-500 to-orange-600'
  },
  {
    id: 'audio',
    name: 'Audio & Sound',
    nameAr: 'الصوت والموسيقى',
    description: 'Volume, sound effects, and music settings',
    descriptionAr: 'مستوى الصوت والمؤثرات والموسيقى',
    icon: Volume2,
    color: 'from-green-500 to-teal-600'
  },
  {
    id: 'parental',
    name: 'Parental Controls',
    nameAr: 'الرقابة الأبوية',
    description: 'Safety settings and content filtering',
    descriptionAr: 'إعدادات الأمان وتصفية المحتوى',
    icon: Shield,
    color: 'from-red-500 to-rose-600'
  },
  {
    id: 'data',
    name: 'Data & Privacy',
    nameAr: 'البيانات والخصوصية',
    description: 'Data usage, backup, and privacy settings',
    descriptionAr: 'استخدام البيانات والنسخ الاحتياطي والخصوصية',
    icon: Database,
    color: 'from-indigo-500 to-purple-600'
  }
];

export function SettingsScreen({
  player,
  user,
  onBack,
  onSwitchPlayer,
  onLogout,
  isRTL,
  onLanguageChange
}: SettingsScreenProps) {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // فحص دفاعي للتأكد من وجود البيانات
  if (!player || !user) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center ${isRTL ? 'rtl' : ''}`}>
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {isRTL ? "خطأ في تحميل البيانات" : "Error Loading Data"}
          </h2>
          <p className="text-gray-600 font-bold mb-6">
            {isRTL ? "يرجى إعادة تحميل الصفحة أو تسجيل الدخول مرة أخرى" : "Please reload the page or login again"}
          </p>
          <Button onClick={onBack} className="btn-fun text-white">
            {isRTL ? "العودة" : "Go Back"}
          </Button>
        </div>
      </div>
    );
  }

  // تحقق من وجود avatar مع قيمة افتراضية
  const playerAvatar = player.avatar || '👤';
  const isImageAvatar = playerAvatar.startsWith('data:') || playerAvatar.startsWith('http');

  // معالج ترقية الاشتراك
  const handleUpgradeSubscription = () => {
    // يمكن إضافة منطق لفتح شاشة الاشتراك
    console.log('Upgrade subscription requested');
  };

  // معالج تأكيد تسجيل الخروج
  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(true);
  };

  const handleActualLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  // عرض قائمة الفئات الرئيسية
  const renderCategoriesList = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* معلومات اللاعب */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg mx-auto mb-4">
          {isImageAvatar ? (
            <img 
              src={playerAvatar} 
              alt="Profile" 
              className="w-full h-full object-cover"
              onError={(e) => {
                // إذا فشل تحميل الصورة، استخدم رمزاً افتراضياً
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = `
                  <div class="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-4xl">
                    👤
                  </div>
                `;
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-4xl">
              {playerAvatar}
            </div>
          )}
        </div>
        <h1 className="text-white text-3xl font-extra-bold text-bold-shadow mb-2">
          {isRTL ? `إعدادات ${player.name || 'اللاعب'}` : `${player.name || 'Player'}'s Settings`}
        </h1>
        <p className="text-white/90 text-lg font-bold">
          {isRTL ? 'خصص تجربتك التعليمية' : 'Customize your learning experience'}
        </p>
      </motion.div>

      {/* فئات الإعدادات */}
      <div className="grid gap-4">
        {SETTINGS_CATEGORIES.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              onClick={() => setActiveCategory(category.id)}
              className="w-full h-auto p-0 bg-transparent border-0 shadow-none hover:shadow-none"
            >
              <div className="w-full bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg`}>
                    <category.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <div className="flex-1 text-left rtl:text-right">
                    <h3 className="font-extra-bold text-lg text-gray-800 mb-1">
                      {isRTL ? category.nameAr : category.name}
                    </h3>
                    <p className="text-sm font-bold text-gray-600">
                      {isRTL ? category.descriptionAr : category.description}
                    </p>
                  </div>

                  <div className="text-gray-400">
                    <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>

      {/* أزرار الإجراءات السريعة */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="space-y-4"
      >
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
          <h3 className="text-white font-extra-bold text-lg mb-4">
            {isRTL ? 'إجراءات سريعة' : 'Quick Actions'}
          </h3>
          
          <div className="grid gap-3">
            <Button
              onClick={onSwitchPlayer}
              variant="ghost"
              className="w-full justify-start font-bold text-white hover:bg-white/20"
            >
              <Users className="w-5 h-5 mr-3 rtl:ml-3 rtl:mr-0" />
              {isRTL ? 'تبديل اللاعب' : 'Switch Player'}
            </Button>
            
            <Button
              onClick={() => setActiveCategory('general')}
              variant="ghost"
              className="w-full justify-start font-bold text-white hover:bg-white/20"
            >
              <Languages className="w-5 h-5 mr-3 rtl:ml-3 rtl:mr-0" />
              {isRTL ? 'تغيير اللغة' : 'Change Language'}
            </Button>
            
            <Button
              onClick={handleLogoutConfirm}
              variant="ghost"
              className="w-full justify-start font-bold text-red-200 hover:bg-red-500/20"
            >
              <LogOut className="w-5 h-5 mr-3 rtl:ml-3 rtl:mr-0" />
              {isRTL ? 'تسجيل الخروج' : 'Logout'}
            </Button>
          </div>
        </div>

        {/* معلومات الإصدار */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse text-white/70 font-bold">
            <Info className="w-4 h-4" />
            <span>{isRTL ? 'سكيلو الإصدار' : 'Skilloo Version'} 1.0.0</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  // عرض فئة الإعدادات المحددة
  const renderActiveCategory = () => {
    if (!activeCategory) return null;

    const categoryInfo = SETTINGS_CATEGORIES.find(cat => cat.id === activeCategory);
    if (!categoryInfo) return null;

    return (
      <motion.div
        initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: isRTL ? 50 : -50 }}
        className="min-h-screen"
      >
        {/* Header الفئة */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 safe-area-top"
        >
          <Button
            variant="ghost"
            onClick={() => setActiveCategory(null)}
            className="text-white hover:bg-white/20 p-3 rounded-xl font-bold"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          
          <div className="text-center">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${categoryInfo.color} flex items-center justify-center`}>
                <categoryInfo.icon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-white text-2xl font-extra-bold text-bold-shadow">
                {isRTL ? categoryInfo.nameAr : categoryInfo.name}
              </h1>
            </div>
          </div>
          
          <div className="w-12" />
        </motion.div>

        {/* محتوى الفئة */}
        <div className="bg-white/95 backdrop-blur-sm rounded-t-3xl min-h-screen p-6">
          {activeCategory === 'general' && (
            <GeneralSettings
              player={player}
              user={user}
              isRTL={isRTL}
              onLanguageChange={onLanguageChange}
            />
          )}
          
          {activeCategory === 'account' && (
            <AccountSettings
              player={player}
              user={user}
              isRTL={isRTL}
              onSwitchPlayer={onSwitchPlayer}
              onShowLogoutConfirm={handleLogoutConfirm}
            />
          )}
          
          {activeCategory === 'subscription' && (
            <SubscriptionSettings
              user={user}
              isRTL={isRTL}
              onUpgrade={handleUpgradeSubscription}
            />
          )}
          
          {activeCategory === 'audio' && (
            <AudioSettings
              isRTL={isRTL}
              settings={{
                soundEnabled: true,
                musicEnabled: true
              }}
              onSettingsChange={(key, value) => {
                console.log(`Audio setting changed: ${key} = ${value}`);
              }}
            />
          )}
          
          {activeCategory === 'parental' && (
            <ParentalControls
              isRTL={isRTL}
              user={user}
              settings={{
                maxPlayTime: 60,
                reportingEnabled: true
              }}
              onSettingsChange={(key, value) => {
                console.log(`Parental setting changed: ${key} = ${value}`);
              }}
            />
          )}
          
          {activeCategory === 'data' && (
            <DataSettings
              player={player}
              isRTL={isRTL}
              onExportData={() => {
                console.log('Exporting player data...');
              }}
              onShowDeleteConfirm={() => {
                console.log('Showing delete confirmation...');
              }}
            />
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 ${isRTL ? 'rtl' : ''}`}>
      <div className="container-responsive py-6">
        <AnimatePresence mode="wait">
          {!activeCategory ? (
            <motion.div key="categories">
              {/* Header الرئيسي */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-8 safe-area-top"
              >
                <Button
                  variant="ghost"
                  onClick={onBack}
                  className="text-white hover:bg-white/20 p-3 rounded-xl font-bold"
                >
                  <ArrowLeft className="w-6 h-6" />
                </Button>
                
                <div className="text-center">
                  <h1 className="text-white text-3xl font-extra-bold text-bold-shadow">
                    {isRTL ? "الإعدادات" : "Settings"}
                  </h1>
                </div>
                
                <div className="w-12" />
              </motion.div>

              {renderCategoriesList()}
            </motion.div>
          ) : (
            <motion.div key={activeCategory}>
              {renderActiveCategory()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* مودال تأكيد تسجيل الخروج */}
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-extra-bold text-gray-800 mb-2">
                {isRTL ? "تأكيد تسجيل الخروج" : "Confirm Logout"}
              </h3>
              
              <p className="text-gray-600 font-bold mb-6">
                {isRTL 
                  ? "هل أنت متأكد من أنك تريد تسجيل الخروج؟"
                  : "Are you sure you want to logout?"
                }
              </p>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowLogoutConfirm(false)}
                  variant="outline"
                  className="flex-1 font-bold"
                >
                  {isRTL ? "إلغاء" : "Cancel"}
                </Button>
                
                <Button
                  onClick={handleActualLogout}
                  className="flex-1 font-bold bg-red-500 hover:bg-red-600 text-white"
                >
                  {isRTL ? "تسجيل الخروج" : "Logout"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}