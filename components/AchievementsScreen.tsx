import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { ArrowLeft, ArrowRight, Star, Trophy, Target, Zap } from "lucide-react";

interface AchievementsScreenProps {
  onBack: () => void;
  isRTL: boolean;
}

const achievementCategories = [
  {
    id: "learning",
    name: "Learning Master",
    nameAr: "سيد التعلم",
    icon: "🎓",
    color: "from-blue-500 to-purple-500",
    achievements: [
      { name: "First Steps", nameAr: "الخطوات الأولى", description: "Complete your first lesson", descriptionAr: "أكمل درسك الأول", progress: 100, total: 1, earned: true },
      { name: "Quick Learner", nameAr: "متعلم سريع", description: "Complete 10 lessons", descriptionAr: "أكمل 10 دروس", progress: 7, total: 10, earned: false },
      { name: "Scholar", nameAr: "عالم", description: "Complete 50 lessons", descriptionAr: "أكمل 50 درساً", progress: 7, total: 50, earned: false },
    ]
  },
  {
    id: "gaming",
    name: "Game Champion",
    nameAr: "بطل الألعاب",
    icon: "🏆",
    color: "from-yellow-500 to-orange-500",
    achievements: [
      { name: "First Victory", nameAr: "أول انتصار", description: "Win your first game", descriptionAr: "اربح أول لعبة لك", progress: 100, total: 1, earned: true },
      { name: "Winning Streak", nameAr: "سلسلة انتصارات", description: "Win 5 games in a row", descriptionAr: "اربح 5 ألعاب متتالية", progress: 3, total: 5, earned: false },
      { name: "Unbeatable", nameAr: "لا يُقهر", description: "Win 25 games", descriptionAr: "اربح 25 لعبة", progress: 8, total: 25, earned: false },
    ]
  },
  {
    id: "social",
    name: "Social Star",
    nameAr: "نجم اجتماعي",
    icon: "⭐",
    color: "from-pink-500 to-red-500",
    achievements: [
      { name: "Friendly", nameAr: "ودود", description: "Play with a friend", descriptionAr: "العب مع صديق", progress: 0, total: 1, earned: false },
      { name: "Popular", nameAr: "محبوب", description: "Play with 5 different friends", descriptionAr: "العب مع 5 أصدقاء مختلفين", progress: 0, total: 5, earned: false },
      { name: "Social Butterfly", nameAr: "فراشة اجتماعية", description: "Play with 10 different friends", descriptionAr: "العب مع 10 أصدقاء مختلفين", progress: 0, total: 10, earned: false },
    ]
  },
  {
    id: "exploration",
    name: "Explorer",
    nameAr: "مستكشف",
    icon: "🔍",
    color: "from-green-500 to-teal-500",
    achievements: [
      { name: "Curious", nameAr: "فضولي", description: "Try 5 different games", descriptionAr: "جرب 5 ألعاب مختلفة", progress: 3, total: 5, earned: false },
      { name: "Adventurer", nameAr: "مغامر", description: "Try all 20 games", descriptionAr: "جرب جميع الألعاب العشرين", progress: 3, total: 20, earned: false },
      { name: "Master Explorer", nameAr: "مستكشف خبير", description: "Complete all games at least once", descriptionAr: "أكمل جميع الألعاب مرة واحدة على الأقل", progress: 1, total: 20, earned: false },
    ]
  }
];

export function AchievementsScreen({ onBack, isRTL }: AchievementsScreenProps) {
  const totalAchievements = achievementCategories.reduce((acc, cat) => acc + cat.achievements.length, 0);
  const earnedAchievements = achievementCategories.reduce((acc, cat) => acc + cat.achievements.filter(a => a.earned).length, 0);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 to-indigo-200 ${isRTL ? 'rtl' : ''}`}>
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
            {isRTL ? "الإنجازات" : "Achievements"}
          </h2>
          <div className="w-8"></div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Overall Progress */}
        <div className="bg-white/90 rounded-2xl p-4 text-center">
          <div className="text-4xl mb-2">🏅</div>
          <h3 className="font-bold text-xl text-gray-800 mb-2">
            {isRTL ? "التقدم الإجمالي" : "Overall Progress"}
          </h3>
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {earnedAchievements}/{totalAchievements}
          </div>
          <p className="text-gray-600 mb-3">
            {isRTL ? "إنجازات مكتملة" : "Achievements Unlocked"}
          </p>
          <Progress value={(earnedAchievements / totalAchievements) * 100} className="h-3" />
          <p className="text-sm text-gray-500 mt-2">
            {Math.round((earnedAchievements / totalAchievements) * 100)}% {isRTL ? "مكتمل" : "Complete"}
          </p>
        </div>

        {/* Achievement Categories */}
        {achievementCategories.map((category) => {
          const categoryEarned = category.achievements.filter(a => a.earned).length;
          const categoryTotal = category.achievements.length;
          
          return (
            <div key={category.id} className="space-y-3">
              {/* Category Header */}
              <div className={`bg-gradient-to-r ${category.color} rounded-2xl p-4 text-white`}>
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="text-3xl">{category.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">
                      {isRTL ? category.nameAr : category.name}
                    </h3>
                    <p className="text-white/90 text-sm">
                      {categoryEarned}/{categoryTotal} {isRTL ? "مكتمل" : "Completed"}
                    </p>
                  </div>
                  <div className="text-right rtl:text-left">
                    <div className="text-2xl font-bold">{Math.round((categoryEarned / categoryTotal) * 100)}%</div>
                  </div>
                </div>
                <Progress 
                  value={(categoryEarned / categoryTotal) * 100} 
                  className="mt-3 h-2 bg-white/20" 
                />
              </div>

              {/* Category Achievements */}
              <div className="space-y-2">
                {category.achievements.map((achievement, index) => (
                  <div 
                    key={index}
                    className={`bg-white/90 rounded-xl p-3 ${
                      achievement.earned ? "border-l-4 border-green-500" : "border-l-4 border-gray-300"
                    }`}
                  >
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        achievement.earned 
                          ? "bg-green-100 text-green-600" 
                          : "bg-gray-100 text-gray-400"
                      }`}>
                        {achievement.earned ? (
                          <Trophy className="w-5 h-5" />
                        ) : (
                          <Target className="w-5 h-5" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className={`font-bold ${
                          achievement.earned ? "text-gray-800" : "text-gray-600"
                        }`}>
                          {isRTL ? achievement.nameAr : achievement.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {isRTL ? achievement.descriptionAr : achievement.description}
                        </p>
                        
                        {!achievement.earned && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                              <span>{achievement.progress}/{achievement.total}</span>
                              <span>{Math.round((achievement.progress / achievement.total) * 100)}%</span>
                            </div>
                            <Progress value={(achievement.progress / achievement.total) * 100} className="h-1" />
                          </div>
                        )}
                      </div>

                      {achievement.earned && (
                        <div className="text-green-500">
                          <Star className="w-6 h-6 fill-current" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Motivational Message */}
        <div className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl p-4 text-center text-white">
          <div className="text-3xl mb-2">🌟</div>
          <h3 className="font-bold text-lg mb-2">
            {isRTL ? "استمر في التقدم!" : "Keep Going!"}
          </h3>
          <p className="text-white/90">
            {isRTL 
              ? "كل لعبة تلعبها تجعلك أذكى وأقوى!" 
              : "Every game you play makes you smarter and stronger!"
            }
          </p>
        </div>
      </div>
    </div>
  );
}