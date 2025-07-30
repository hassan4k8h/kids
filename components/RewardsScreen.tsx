import { Button } from "./ui/button";
import { ArrowLeft, ArrowRight, Gift, Star, Trophy } from "lucide-react";

interface RewardsScreenProps {
  onBack: () => void;
  isRTL: boolean;
}

const rewards = [
  { id: 1, type: "star", icon: "⭐", name: "Gold Star", nameAr: "نجمة ذهبية", earned: true },
  { id: 2, type: "trophy", icon: "🏆", name: "Math Champion", nameAr: "بطل الرياضيات", earned: true },
  { id: 3, type: "gift", icon: "🎁", name: "Surprise Box", nameAr: "صندوق مفاجآت", earned: true },
  { id: 4, type: "star", icon: "⭐", name: "Silver Star", nameAr: "نجمة فضية", earned: true },
  { id: 5, type: "trophy", icon: "🏆", name: "Speed Reader", nameAr: "قارئ سريع", earned: false },
  { id: 6, type: "gift", icon: "🎁", name: "Magic Wand", nameAr: "عصا سحرية", earned: false },
  { id: 7, type: "star", icon: "⭐", name: "Bronze Star", nameAr: "نجمة برونزية", earned: false },
  { id: 8, type: "trophy", icon: "🏆", name: "Artist Pro", nameAr: "فنان محترف", earned: false },
];

const achievements = [
  { title: "First Game", titleAr: "أول لعبة", description: "Complete your first game", descriptionAr: "أكمل أول لعبة لك", progress: 100 },
  { title: "Score Master", titleAr: "سيد النقاط", description: "Reach 1000 points", descriptionAr: "احصل على 1000 نقطة", progress: 75 },
  { title: "Daily Player", titleAr: "لاعب يومي", description: "Play for 7 days straight", descriptionAr: "العب لمدة 7 أيام متتالية", progress: 43 },
  { title: "Speed Runner", titleAr: "عداء سريع", description: "Complete 10 games in one session", descriptionAr: "أكمل 10 ألعاب في جلسة واحدة", progress: 20 },
];

export function RewardsScreen({ onBack, isRTL }: RewardsScreenProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-yellow-200 via-orange-200 to-red-200 ${isRTL ? 'rtl' : ''}`}>
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-sm p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="p-2 hover:bg-gray-100"
          >
            {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </Button>
          <h2 className="font-bold text-xl text-gray-800">
            {isRTL ? "المكافآت والجوائز" : "Rewards & Prizes"}
          </h2>
          <div className="w-8"></div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/90 rounded-2xl p-4 text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="font-bold text-2xl text-gray-800">12</div>
            <div className="text-sm text-gray-600">{isRTL ? "نجوم" : "Stars"}</div>
          </div>
          <div className="bg-white/90 rounded-2xl p-4 text-center">
            <Trophy className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="font-bold text-2xl text-gray-800">4</div>
            <div className="text-sm text-gray-600">{isRTL ? "جوائز" : "Trophies"}</div>
          </div>
          <div className="bg-white/90 rounded-2xl p-4 text-center">
            <Gift className="w-8 h-8 text-pink-500 mx-auto mb-2" />
            <div className="font-bold text-2xl text-gray-800">8</div>
            <div className="text-sm text-gray-600">{isRTL ? "هدايا" : "Gifts"}</div>
          </div>
        </div>

        {/* Rewards Collection */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800">
            {isRTL ? "مجموعة المكافآت" : "Rewards Collection"}
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className={`card-fun text-center ${
                  reward.earned 
                    ? "bg-white shadow-lg scale-100" 
                    : "bg-gray-200 shadow-sm scale-95 opacity-60"
                }`}
              >
                <div className="text-3xl mb-2">{reward.icon}</div>
                <div className="text-xs font-medium leading-tight">
                  {isRTL ? reward.nameAr : reward.name}
                </div>
                {reward.earned && (
                  <div className="mt-1 text-green-500">✓</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Achievement Progress */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800">
            {isRTL ? "تقدم الإنجازات" : "Achievement Progress"}
          </h3>
          <div className="space-y-3">
            {achievements.map((achievement, index) => (
              <div key={index} className="bg-white/90 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-gray-800">
                    {isRTL ? achievement.titleAr : achievement.title}
                  </h4>
                  <span className="text-sm font-bold text-purple-600">
                    {achievement.progress}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {isRTL ? achievement.descriptionAr : achievement.description}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${achievement.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Virtual Gifts */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800">
            {isRTL ? "الهدايا الافتراضية" : "Virtual Gifts"}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl p-4 text-center text-white">
              <div className="text-4xl mb-2">🦄</div>
              <h4 className="font-bold">{isRTL ? "يونيكورن سحري" : "Magic Unicorn"}</h4>
              <p className="text-sm opacity-90">{isRTL ? "رفيقك السحري" : "Your magical companion"}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-teal-400 rounded-2xl p-4 text-center text-white">
              <div className="text-4xl mb-2">🌈</div>
              <h4 className="font-bold">{isRTL ? "قوس قزح" : "Rainbow Bridge"}</h4>
              <p className="text-sm opacity-90">{isRTL ? "جسر الألوان" : "Bridge of colors"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}