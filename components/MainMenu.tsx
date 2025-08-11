import { useState } from "react";
import { Button } from "./ui/button";
import { MenuHeader } from "./menu/MenuHeader";
import { GameCard } from "./menu/GameCard";
import { GameFilters } from "./menu/GameFilters"; 
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Gamepad2, Star, Crown, TrendingUp, Award, Zap, Target, Sparkles, Filter, Grid3X3, List, Flame } from "lucide-react";
import { getSortedGames, getFeaturedGames, gameNames, categoryNames, difficultyNames, Game } from "../constants/games";
import { formatNumber, formatPercent } from "../utils/locale.ts";
import { subscriptionService } from "../services/SubscriptionService";

interface MainMenuProps {
  playerName: string;
  playerAvatar: string;
  onGameSelect: (gameId: string) => void;
  onStoriesSelect: () => void;
  onRewards: () => void;
  onAchievements: () => void;
  onSettings: () => void;
  onSwitchPlayer: () => void;
  isRTL: boolean;
  points: number;
  achievementsCount: number;
  streakDays: number;
  currentLevel: number;
  levelProgressPercent: number;
}

export function MainMenu({
  playerName,
  playerAvatar,
  onGameSelect,
  onStoriesSelect,
  onRewards,
  onAchievements,
  onSettings,
  onSwitchPlayer,
  isRTL,
  points,
  achievementsCount,
  streakDays,
  currentLevel,
  levelProgressPercent
}: MainMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showOnlyUnlocked, setShowOnlyUnlocked] = useState<boolean>(false);
  const [showFeatured, setShowFeatured] = useState<boolean>(false);

  // الحصول على جميع الألعاب مرتبة
  const allGames = getSortedGames();
  const featuredGames = getFeaturedGames();

  // تطبيق الفلاتر
  const filteredGames = allGames.filter(game => {
    const categoryMatch = selectedCategory === "all" || game.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === "all" || game.difficulty === selectedDifficulty;
    const unlockedMatch = !showOnlyUnlocked || !game.locked;
    const featuredMatch = !showFeatured || game.featured;
    
    return categoryMatch && difficultyMatch && unlockedMatch && featuredMatch;
  });

  // حساب الإحصائيات
  const completedGamesCount = allGames.filter(g => g.completed).length;
  const totalGamesCount = allGames.length;
  const unlockedGamesCount = allGames.filter(g => !g.locked).length;
  const featuredGamesCount = featuredGames.length;
  const progressPercentage = (completedGamesCount / totalGamesCount) * 100;

  // جلب معلومات العرض الديناميكية من الاستخدام الفعلي للمستخدم الحالي إن أمكن
  const usage = (() => {
    try {
      // هذا المكون لا يستقبل userId؛ يتم تمرير القيم النهائية من App. هنا نحافظ على التوافق فقط.
      return null as any;
    } catch {
      return null as any;
    }
  })();

  return (
    <div className={`min-h-screen bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 ${isRTL ? 'rtl' : ''}`}>
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-yellow-300/10 rounded-full blur-lg animate-pulse"></div>
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-pink-300/5 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-28 h-28 bg-blue-300/10 rounded-full blur-xl animate-bounce"></div>
      </div>

      <div className="container-professional safe-area-padding py-6 space-y-6 relative z-10">
        {/* Header */}
        <MenuHeader
          playerName={playerName}
          playerAvatar={playerAvatar}
          onRewards={onRewards}
          onAchievements={onAchievements}
          onSettings={onSettings}
          onSwitchPlayer={onSwitchPlayer}
          isRTL={isRTL}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          points={points}
          achievementsCount={achievementsCount}
          streakDays={streakDays}
          currentLevel={currentLevel}
          levelProgressPercent={levelProgressPercent}
        />

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-white font-ultra-bold mb-2 drop-shadow-lg text-ultra-clear" style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)' }}>
            {isRTL ? `أهلاً وسهلاً ${playerName}! 🌟` : `Welcome ${playerName}! 🌟`}
          </h1>
          <p className="text-white/95 font-bold text-super-clear" style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}>
            {isRTL ? "استعد لمغامرة تعليمية ممتعة!" : "Get ready for an amazing learning adventure!"}
          </p>
        </motion.div>

        {/* Stories Section - محسن */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-6 text-white shadow-2xl border-2 border-white/30 overflow-hidden relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full bg-white"
                    style={{
                      width: Math.random() * 4 + 2 + 'px',
                      height: Math.random() * 4 + 2 + 'px',
                      top: Math.random() * 100 + '%',
                      left: Math.random() * 100 + '%',
                      animationDelay: Math.random() * 3 + 's'
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4 rtl:space-x-reverse min-w-0">
                <motion.div 
                  className="w-[clamp(48px,12vw,80px)] h-[clamp(48px,12vw,80px)] bg-white/25 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <BookOpen className="w-[clamp(20px,6vw,40px)] h-[clamp(20px,6vw,40px)]" />
                </motion.div>
                <div className="min-w-0">
                  <h3 className="font-ultra-bold mb-2 text-ultra-clear truncate" style={{ fontSize: 'clamp(1.25rem, 4.5vw, 2rem)' }}>
                    {isRTL ? "قصص البطل المغامر" : "Hero Adventure Stories"}
                  </h3>
                  <p className="text-white/95 font-bold text-super-clear" style={{ fontSize: 'clamp(0.95rem, 3vw, 1.25rem)' }}>
                    {isRTL ? `كن البطل في قصتك يا ${playerName}!` : `Be the hero of your story, ${playerName}!`}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse text-yellow-300">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="font-extra-bold text-super-clear whitespace-nowrap">{isRTL ? "٢٠٠+ قصة تفاعلية" : "200+ Interactive Stories"}</span>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse text-pink-200">
                      <Crown className="w-5 h-5" />
                      <span className="font-extra-bold text-super-clear whitespace-nowrap">{isRTL ? "١٠ أبطال خارقين" : "10 Superheroes"}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <motion.div 
                whileHover={{ scale: 1.08 }} 
                whileTap={{ scale: 0.92 }}
                className="relative"
              >
                <Button
                  onClick={onStoriesSelect}
                  className="btn-fun bg-white hover:bg-gray-50 text-transparent border-3 border-white/90"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
                    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2), 0 8px 15px rgba(0, 0, 0, 0.1)',
                    minHeight: 'clamp(56px, 12vw, 80px)',
                    minWidth: 'clamp(160px, 40vw, 220px)',
                    padding: 'clamp(12px, 3vw, 20px) clamp(20px, 4vw, 32px)'
                  }}
                >
                  <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse">
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, 0, -10, 0],
                        scale: [1, 1.1, 1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2.5, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Zap className="w-6 h-6 text-purple-600 fill-current" />
                    </motion.div>
                    
                    <span 
                      className="font-ultra-bold text-ultra-clear"
                      style={{
                        fontSize: 'clamp(1rem, 3.5vw, 1.25rem)',
                        background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #3b82f6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        letterSpacing: '0.02em',
                        lineHeight: '1.2'
                      }}
                    >
                      {isRTL ? "ابدأ المغامرة" : "Start Adventure"}
                    </span>
                    
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5
                      }}
                    >
                      <Sparkles className="w-5 h-5 text-yellow-500" />
                    </motion.div>
                  </div>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Progress Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-ultra-bold text-gray-800 text-ultra-clear" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
                  {isRTL ? "لوحة التقدم" : "Progress Dashboard"}
                </h3>
                <p className="text-gray-600 font-bold text-super-clear">
                  {isRTL ? "تتبع إنجازاتك المذهلة!" : "Track your amazing achievements!"}
                </p>
              </div>
            </div>
            <div className="text-right rtl:text-left">
              <div className="font-ultra-bold text-blue-600 text-ultra-clear" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>{formatPercent(progressPercentage, isRTL)}</div>
              <div className="text-sm text-gray-500 font-bold text-super-clear">{isRTL ? "مكتمل" : "Complete"}</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-4 mb-6 overflow-hidden shadow-inner">
            <motion.div
              className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 h-4 rounded-full shadow-lg"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
          
          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="w-5 h-5 text-white" />
              </div>
               <div className="font-ultra-bold text-green-600 text-ultra-clear" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>{formatNumber(completedGamesCount, isRTL)}</div>
              <div className="text-sm text-gray-600 font-bold text-super-clear">{isRTL ? "ألعاب مكتملة" : "Games Completed"}</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl border border-blue-200">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="w-5 h-5 text-white" />
              </div>
               <div className="font-ultra-bold text-blue-600 text-ultra-clear" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>{formatNumber(unlockedGamesCount, isRTL)}</div>
              <div className="text-sm text-gray-600 font-bold text-super-clear">{isRTL ? "ألعاب مفتوحة" : "Games Unlocked"}</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
               <div className="font-ultra-bold text-purple-600 text-ultra-clear" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>{formatNumber(totalGamesCount, isRTL)}</div>
              <div className="text-sm text-gray-600 font-bold text-super-clear">{isRTL ? "إجمالي الألعاب" : "Total Games"}</div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border border-orange-200">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Flame className="w-5 h-5 text-white" />
              </div>
               <div className="font-ultra-bold text-orange-600 text-ultra-clear" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>{formatNumber(featuredGamesCount, isRTL)}</div>
              <div className="text-sm text-gray-600 font-bold text-super-clear">{isRTL ? "ألعاب مميزة" : "Featured Games"}</div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-bold text-gray-800 text-super-clear">
                {isRTL ? "الفلاتر:" : "Filters:"}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-md text-purple-600' : 'text-gray-500'}`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-md text-purple-600' : 'text-gray-500'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Filters */}
              <button
                onClick={() => setShowFeatured(!showFeatured)}
                className={`px-4 py-2 rounded-xl font-bold transition-all ${showFeatured ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <span className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Flame className="w-4 h-4" />
                  <span>{isRTL ? "مميزة" : "Featured"}</span>
                </span>
              </button>

              <button
                onClick={() => setShowOnlyUnlocked(!showOnlyUnlocked)}
                className={`px-4 py-2 rounded-xl font-bold transition-all ${showOnlyUnlocked ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {isRTL ? "مفتوحة فقط" : "Unlocked Only"}
              </button>
            </div>
          </div>

          {/* Traditional Filters */}
          <div className="mt-4">
            <GameFilters
              selectedCategory={selectedCategory}
              selectedDifficulty={selectedDifficulty}
              onCategoryChange={setSelectedCategory}
              onDifficultyChange={setSelectedDifficulty}
              categoryNames={categoryNames}
              difficultyNames={difficultyNames}
              isRTL={isRTL}
            />
          </div>
        </motion.div>

        {/* Enhanced Games Grid/List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedCategory}-${selectedDifficulty}-${viewMode}-${showOnlyUnlocked}-${showFeatured}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                  : 'space-y-4'
              }
            >
              {filteredGames.map((game, index) => (
                <GameCard
                  key={game.id}
                  game={game}
                  gameName={gameNames[game.id]}
                  onSelect={() => onGameSelect(game.id)}
                  isRTL={isRTL}
                  viewMode={viewMode}
                  animationDelay={index * 0.1}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredGames.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="text-8xl mb-6 opacity-50">🎮</div>
              <h3 className="text-white font-ultra-bold mb-4 drop-shadow-lg text-ultra-clear" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
                {isRTL ? "لا توجد ألعاب" : "No Games Found"}
              </h3>
              <p className="text-white/80 font-bold text-super-clear" style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>
                {isRTL 
                  ? "جرب تغيير الفلاتر للعثور على ألعاب مناسبة"
                  : "Try changing the filters to find suitable games"
                }
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Motivational Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-8"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-white font-ultra-bold mb-2 text-ultra-clear" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
              {isRTL ? `تابع التقدم يا ${playerName}! 🚀` : `Keep going ${playerName}! 🚀`}
            </h3>
            <p className="text-white/90 font-bold text-super-clear">
              {isRTL 
                ? "كل لعبة تلعبها تجعلك أذكى وأقوى!"
                : "Every game you play makes you smarter and stronger!"
              }
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}