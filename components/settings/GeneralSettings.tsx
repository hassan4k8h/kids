import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Globe, Bell } from "lucide-react";
import { LANGUAGE_OPTIONS } from "../../constants/settings";
import { Player } from "../../types/Player";
import { User } from "../../types/Auth";

interface GeneralSettingsProps {
  player: Player;
  user: User;
  isRTL: boolean;
  onLanguageChange: (isRTL: boolean) => void;
}

export function GeneralSettings({ player, user, isRTL, onLanguageChange }: GeneralSettingsProps) {
  // الحصول على اللغة الحالية مع قيم افتراضية آمنة
  const currentLanguage = user?.preferences?.language || player?.preferences?.language || (isRTL ? 'ar' : 'en');
  const notificationsEnabled = user?.preferences?.notifications ?? true;

  const handleLanguageChange = (newLanguage: 'ar' | 'en') => {
    const newIsRTL = newLanguage === 'ar';
    onLanguageChange(newIsRTL);
  };

  const handleNotificationToggle = (enabled: boolean) => {
    // يمكن إضافة منطق تحديث إعدادات الإشعارات هنا
    console.log('Notifications toggled:', enabled);
  };

  return (
    <div className="space-y-6">
      {/* Language Setting */}
      <div className="flex items-center justify-between py-4 border-b border-gray-100">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Globe className="w-6 h-6 text-blue-500" />
          <div>
            <h3 className="font-semibold text-gray-800">
              {isRTL ? "اللغة" : "Language"}
            </h3>
            <p className="text-sm text-gray-600">
              {isRTL ? "اختر لغة التطبيق" : "Choose app language"}
            </p>
          </div>
        </div>
        <Select 
          value={currentLanguage} 
          onValueChange={handleLanguageChange}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGE_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Notifications */}
      <div className="flex items-center justify-between py-4 border-b border-gray-100">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Bell className="w-6 h-6 text-yellow-500" />
          <div>
            <h3 className="font-semibold text-gray-800">
              {isRTL ? "الإشعارات" : "Notifications"}
            </h3>
            <p className="text-sm text-gray-600">
              {isRTL ? "تلقي إشعارات التطبيق" : "Receive app notifications"}
            </p>
          </div>
        </div>
        <Switch
          checked={notificationsEnabled}
          onCheckedChange={handleNotificationToggle}
        />
      </div>

      {/* Theme Setting (Future) */}
      <div className="flex items-center justify-between py-4 border-b border-gray-100 opacity-50">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
          <div>
            <h3 className="font-semibold text-gray-800">
              {isRTL ? "المظهر" : "Theme"}
            </h3>
            <p className="text-sm text-gray-600">
              {isRTL ? "قريباً - اختر مظهر التطبيق" : "Coming Soon - Choose app theme"}
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-400 font-medium">
          {isRTL ? "قريباً" : "Coming Soon"}
        </div>
      </div>

      {/* Sound Setting (Future) */}
      <div className="flex items-center justify-between py-4 border-b border-gray-100 opacity-50">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-teal-500" />
          <div>
            <h3 className="font-semibold text-gray-800">
              {isRTL ? "الأصوات" : "Sounds"}
            </h3>
            <p className="text-sm text-gray-600">
              {isRTL ? "قريباً - إعدادات الصوت والموسيقى" : "Coming Soon - Sound and music settings"}
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-400 font-medium">
          {isRTL ? "قريباً" : "Coming Soon"}
        </div>
      </div>

      {/* User Information Display */}
      <div className="mt-8 p-4 bg-gray-50 rounded-xl">
        <h4 className="font-semibold text-gray-800 mb-3">
          {isRTL ? "معلومات المستخدم" : "User Information"}
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">{isRTL ? "البريد الإلكتروني:" : "Email:"}</span>
            <span className="font-medium text-gray-800">{user?.email || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{isRTL ? "اللاعب الحالي:" : "Current Player:"}</span>
            <span className="font-medium text-gray-800">{player?.name || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{isRTL ? "اللغة المفضلة:" : "Preferred Language:"}</span>
            <span className="font-medium text-gray-800">
              {currentLanguage === 'ar' ? (isRTL ? 'العربية' : 'Arabic') : (isRTL ? 'الإنجليزية' : 'English')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}