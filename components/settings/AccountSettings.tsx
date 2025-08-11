import { Button } from "../ui/button";
import { Users, LogOut, Crown } from "lucide-react";
import { Player } from "../../types/Player";
import { User } from "../../types/Auth";

interface AccountSettingsProps {
  isRTL: boolean;
  player: Player;
  user: User;
  onSwitchPlayer: () => void;
  onShowLogoutConfirm: () => void;
}

export function AccountSettings({ 
  isRTL, 
  player, 
  user, 
  onSwitchPlayer, 
  onShowLogoutConfirm 
}: AccountSettingsProps) {
  // فحص دفاعي للتأكد من وجود البيانات
  if (!player || !user) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100">
          <div className="text-center">
            <p className="text-red-600 font-bold">
              {isRTL ? "خطأ في تحميل بيانات الحساب" : "Error loading account data"}
            </p>
            <p className="text-red-500 text-sm mt-2">
              {isRTL ? "يرجى إعادة تحميل الصفحة" : "Please reload the page"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // تحقق من وجود avatar وتعيين قيمة افتراضية
  const playerAvatar = player.avatar || '👤';
  const isImageAvatar = playerAvatar.startsWith('data:') || playerAvatar.startsWith('http');

  return (
    <div className="space-y-6">
      {/* User Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center space-x-4 rtl:space-x-reverse mb-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg">
            {isImageAvatar ? (
              <img 
                src={playerAvatar} 
                alt={player.name || 'Player Avatar'} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // إذا فشل تحميل الصورة، استخدم رمزاً افتراضياً
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `
                    <div class="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-2xl">
                      👤
                    </div>
                  `;
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-2xl">
                {playerAvatar}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {player.name || (isRTL ? 'لاعب غير معروف' : 'Unknown Player')}
            </h3>
            <p className="text-gray-600">
              {user.email || (isRTL ? 'بريد إلكتروني غير متاح' : 'Email not available')}
            </p>
            <div className="flex items-center space-x-2 rtl:space-x-reverse mt-2">
              <Crown className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-600">
                {user.subscription?.type === 'premium' ? (isRTL ? 'مميز' : 'Premium') : (isRTL ? 'مجاني' : 'Free')}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {player.totalScore || 0}
            </div>
            <div className="text-xs text-gray-600">
              {isRTL ? 'النقاط' : 'Points'}
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {player.gamesCompleted || 0}
            </div>
            <div className="text-xs text-gray-600">
              {isRTL ? 'ألعاب' : 'Games'}
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="text-2xl font-bold text-purple-600">
              {player.storiesCompleted || 0}
            </div>
            <div className="text-xs text-gray-600">
              {isRTL ? 'قصص' : 'Stories'}
            </div>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={onSwitchPlayer}
          className="w-full justify-start h-12 border-2 border-blue-200 hover:border-blue-400"
        >
          <Users className="w-5 h-5 mr-3 rtl:ml-3 rtl:mr-0 text-blue-600" />
          {isRTL ? "تبديل الطفل" : "Switch Child"}
        </Button>

        <Button
          variant="outline"
          onClick={onShowLogoutConfirm}
          className="w-full justify-start h-12 border-2 border-orange-200 hover:border-orange-400"
        >
          <LogOut className="w-5 h-5 mr-3 rtl:ml-3 rtl:mr-0 text-orange-600" />
          {isRTL ? "تسجيل الخروج" : "Sign Out"}
        </Button>
      </div>
    </div>
  );
}