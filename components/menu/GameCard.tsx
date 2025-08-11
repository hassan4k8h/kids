import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { Lock, Star, Trophy, Play, Clock, Target } from "lucide-react";
import { Game } from "../../constants/games";

interface GameCardProps {
  game: Game;
  gameName: { name: string; nameAr: string; emoji: string };
  onSelect: () => void;
  isRTL: boolean;
  viewMode: 'grid' | 'list';
  animationDelay: number;
}

// خريطة الألوان لكل لعبة - مع نصوص سوداء
const gameColors: Record<string, {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  gradient: string;
  textColor: string;
  lightTextColor: string;
}> = {
  math: {
    primary: '#3B82F6',
    secondary: '#60A5FA', 
    accent: '#DBEAFE',
    background: 'from-blue-400 to-blue-600',
    gradient: 'from-blue-50 to-cyan-50',
    textColor: '#1f2937',
    lightTextColor: '#374151'
  },
  abc: {
    primary: '#8B5CF6',
    secondary: '#A78BFA',
    accent: '#EDE9FE', 
    background: 'from-purple-400 to-purple-600',
    gradient: 'from-purple-50 to-pink-50',
    textColor: '#1f2937',
    lightTextColor: '#374151'
  },
  animals: {
    primary: '#10B981',
    secondary: '#34D399',
    accent: '#D1FAE5',
    background: 'from-green-400 to-green-600', 
    gradient: 'from-green-50 to-emerald-50',
    textColor: '#1f2937',
    lightTextColor: '#374151'
  },
  colors: {
    primary: '#F59E0B',
    secondary: '#FBBF24',
    accent: '#FEF3C7',
    background: 'from-yellow-400 to-orange-500',
    gradient: 'from-yellow-50 to-orange-50',
    textColor: '#1f2937',
    lightTextColor: '#374151'
  },
  shapes: {
    primary: '#EF4444',
    secondary: '#F87171',
    accent: '#FEE2E2',
    background: 'from-red-400 to-red-600',
    gradient: 'from-red-50 to-rose-50',
    textColor: '#1f2937',
    lightTextColor: '#374151'
  },
  'healthy-eating': {
    primary: '#06B6D4',
    secondary: '#22D3EE',
    accent: '#CFFAFE',
    background: 'from-cyan-400 to-cyan-600',
    gradient: 'from-cyan-50 to-teal-50',
    textColor: '#1f2937',
    lightTextColor: '#374151'
  },
  weather: {
    primary: '#6366F1',
    secondary: '#818CF8',
    accent: '#E0E7FF',
    background: 'from-indigo-400 to-indigo-600',
    gradient: 'from-indigo-50 to-blue-50',
    textColor: '#1f2937',
    lightTextColor: '#374151'
  },
  memory: {
    primary: '#EC4899',
    secondary: '#F472B6',
    accent: '#FCE7F3',
    background: 'from-pink-400 to-pink-600',
    gradient: 'from-pink-50 to-rose-50',
    textColor: '#1f2937',
    lightTextColor: '#374151'
  },
  puzzle: {
    primary: '#8B5CF6',
    secondary: '#A78BFA',
    accent: '#EDE9FE',
    background: 'from-violet-400 to-purple-600',
    gradient: 'from-violet-50 to-purple-50',
    textColor: '#1f2937',
    lightTextColor: '#374151'
  },
  music: {
    primary: '#F97316',
    secondary: '#FB923C',
    accent: '#FED7AA',
    background: 'from-orange-400 to-orange-600',
    gradient: 'from-orange-50 to-amber-50',
    textColor: '#1f2937',
    lightTextColor: '#374151'
  },
  'time-keeper': {
    primary: '#0EA5E9',
    secondary: '#38BDF8',
    accent: '#BAE6FD',
    background: 'from-sky-400 to-sky-600',
    gradient: 'from-sky-50 to-blue-50',
    textColor: '#1f2937',
    lightTextColor: '#374151'
  },
  'space-explorer': {
    primary: '#7C3AED',
    secondary: '#8B5CF6',
    accent: '#DDD6FE',
    background: 'from-violet-500 to-purple-600',
    gradient: 'from-violet-50 to-indigo-50',
    textColor: '#1f2937',
    lightTextColor: '#374151'
  },
  'ocean-quest': {
    primary: '#0891B2',
    secondary: '#0E7490',
    accent: '#A7F3D0',
    background: 'from-cyan-500 to-teal-600',
    gradient: 'from-cyan-50 to-teal-50',
    textColor: '#1f2937',
    lightTextColor: '#374151'
  },
  'garden-grow': {
    primary: '#059669',
    secondary: '#10B981',
    accent: '#A7F3D0',
    background: 'from-emerald-500 to-green-600',
    gradient: 'from-emerald-50 to-green-50',
    textColor: '#1f2937',
    lightTextColor: '#374151'
  },
  'vehicle-race': {
    primary: '#DC2626',
    secondary: '#EF4444',
    accent: '#FEE2E2',
    background: 'from-red-500 to-red-600',
    gradient: 'from-red-50 to-orange-50',
    textColor: '#1f2937',
    lightTextColor: '#374151'
  },
  'dream-house': {
    primary: '#7C2D12',
    secondary: '#EA580C',
    accent: '#FED7AA',
    background: 'from-orange-600 to-amber-600',
    gradient: 'from-orange-50 to-yellow-50',
    textColor: '#1f2937',
    lightTextColor: '#374151'
  },
  'sports-fun': {
    primary: '#16A34A',
    secondary: '#22C55E',
    accent: '#DCFCE7',
    background: 'from-green-500 to-lime-600',
    gradient: 'from-green-50 to-lime-50',
    textColor: '#1f2937',
    lightTextColor: '#374151'
  },
  'little-chef': {
    primary: '#C2410C',
    secondary: '#EA580C',
    accent: '#FFEDD5',
    background: 'from-orange-600 to-red-600',
    gradient: 'from-orange-50 to-red-50',
    textColor: '#1f2937',
    lightTextColor: '#374151'
  },
  'science-lab': {
    primary: '#4338CA',
    secondary: '#6366F1',
    accent: '#E0E7FF',
    background: 'from-indigo-600 to-blue-600',
    gradient: 'from-indigo-50 to-blue-50',
    textColor: '#1f2937',
    lightTextColor: '#374151'
  },
  'art-studio': {
    primary: '#BE185D',
    secondary: '#EC4899',
    accent: '#FCE7F3',
    background: 'from-pink-600 to-rose-600',
    gradient: 'from-pink-50 to-rose-50',
    textColor: '#1f2937',
    lightTextColor: '#374151'
  }
};

export function GameCard({ game, gameName, onSelect, isRTL, viewMode, animationDelay }: GameCardProps) {
  const colors = gameColors[game.id] || gameColors.math;
  const isLocked = game.locked;
  const isCompleted = game.completed;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    const difficulties: Record<string, { ar: string; en: string }> = {
      easy: { ar: 'سهل', en: 'Easy' },
      medium: { ar: 'متوسط', en: 'Medium' },
      hard: { ar: 'صعب', en: 'Hard' }
    };
    return isRTL ? difficulties[difficulty]?.ar : difficulties[difficulty]?.en;
  };

  const getCategoryText = (category: string) => {
    const categories: Record<string, { ar: string; en: string }> = {
      educational: { ar: 'تعليمية', en: 'Educational' },
      puzzle: { ar: 'ألغاز', en: 'Puzzle' },
      action: { ar: 'حركة', en: 'Action' },
      creative: { ar: 'إبداعية', en: 'Creative' },
      language: { ar: 'لغة', en: 'Language' },
      math: { ar: 'رياضيات', en: 'Math' },
      science: { ar: 'علوم', en: 'Science' },
      memory: { ar: 'ذاكرة', en: 'Memory' }
    };
    return isRTL ? categories[category]?.ar : categories[category]?.en;
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: animationDelay, duration: 0.5 }}
        className={`relative ${isLocked ? 'opacity-60' : ''}`}
      >
        <Button
          onClick={onSelect}
          disabled={isLocked}
          className="w-full h-auto p-0 bg-transparent border-0 shadow-none hover:shadow-none"
        >
          <div className={`w-full bg-gradient-to-r ${colors.gradient} rounded-2xl p-4 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${!isLocked ? 'hover:border-white/80' : ''}`}>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {/* Game Icon */}
              <div className={`relative w-16 h-16 bg-gradient-to-br ${colors.background} rounded-xl flex items-center justify-center shadow-lg`}>
                <span className="text-3xl filter drop-shadow-sm">
                  {gameName.emoji}
                </span>
                {isLocked && (
                  <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>

              {/* Game Info */}
              <div className="flex-1 text-left rtl:text-right">
                <h3 className="font-ultra-bold text-xl mb-1" style={{ color: colors.textColor }}>
                  {isRTL ? gameName.nameAr : gameName.name}
                </h3>
                {/* شريط متابعة سريع */}
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold" style={{ color: colors.lightTextColor }}>
                    {isRTL ? `آخر مستوى: ${game.progressLevel || 1}` : `Last level: ${game.progressLevel || 1}`}
                  </div>
                  {!isLocked && (
                    <Button size="sm" className="px-3 py-1" onClick={(e)=>{e.stopPropagation(); onSelect();}}>
                      {isRTL ? 'متابعة' : 'Continue'}
                    </Button>
                  )}
                </div>
                <p className="text-base mb-2" style={{ color: colors.lightTextColor }}>
                  {isRTL ? game.descriptionAr : game.description}
                </p>
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(game.difficulty)}`}>
                    {getDifficultyText(game.difficulty)}
                  </span>
                  <span className="text-xs font-bold" style={{ color: colors.lightTextColor }}>
                    {getCategoryText(game.category)}
                  </span>
                  <div className="flex items-center space-x-1 rtl:space-x-reverse text-xs" style={{ color: colors.lightTextColor }}>
                    <Clock className="w-3 h-3" />
                    <span className="font-bold">{game.estimatedTime} {isRTL ? 'دقيقة' : 'min'}</span>
                  </div>
                </div>
              </div>

              {/* Status Icons */}
              <div className="flex flex-col items-center space-y-2">
                {isCompleted && (
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-yellow-800" />
                  </div>
                )}
                {!isLocked && (
                  <div className={`w-8 h-8 bg-gradient-to-br ${colors.background} rounded-full flex items-center justify-center shadow-md`}>
                    <Play className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Button>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        delay: animationDelay, 
        duration: 0.6,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`relative group ${isLocked ? 'opacity-70' : ''}`}
    >
      <Button
        onClick={onSelect}
        disabled={isLocked}
        className="w-full h-auto p-0 bg-transparent border-0 shadow-none hover:shadow-none"
      >
        <div className={`w-full bg-gradient-to-br ${colors.gradient} rounded-3xl border-2 border-white/60 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden relative group-hover:border-white/80`}>
          {/* Background Decoration */}
          <div className={`absolute inset-0 bg-gradient-to-br ${colors.background} opacity-5`}></div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>

          <div className="relative p-6 text-center">
            {/* Game Icon */}
            <div className="relative mb-4">
              <motion.div 
                className={`w-20 h-20 mx-auto bg-gradient-to-br ${colors.background} rounded-2xl flex items-center justify-center shadow-xl relative overflow-hidden`}
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                {/* Icon Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <span className="text-4xl filter drop-shadow-md relative z-10">
                  {gameName.emoji}
                </span>
                
                {isLocked && (
                  <div className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Lock className="w-8 h-8 text-white drop-shadow-md" />
                  </div>
                )}
              </motion.div>

              {isCompleted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    <Trophy className="w-4 h-4 text-yellow-800" />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Game Title */}
            <h3 className="font-ultra-bold text-xl mb-2 leading-tight text-on-light" style={{ color: colors.textColor }}>
              {isRTL ? gameName.nameAr : gameName.name}
            </h3>

            {/* شريط متابعة سريع أعلى البطاقة */}
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold text-on-light" style={{ color: colors.lightTextColor }}>
                {isRTL ? `آخر مستوى: ${game.progressLevel || 1}` : `Last level: ${game.progressLevel || 1}`}
              </div>
              {!isLocked && (
                <Button size="sm" className="px-3 py-1" onClick={(e)=>{e.stopPropagation(); onSelect();}}>
                  {isRTL ? 'متابعة' : 'Continue'}
                </Button>
              )}
            </div>

            {/* Game Stats */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(game.difficulty)}`}>
                  {getDifficultyText(game.difficulty)}
                </span>
              </div>

              <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse text-xs font-bold text-on-light" style={{ color: colors.lightTextColor }}>
                <div className="flex items-center space-x-1 rtl:space-x-reverse">
                  <Clock className="w-3 h-3" />
                  <span>{game.estimatedTime} {isRTL ? 'د' : 'min'}</span>
                </div>
                <div className="flex items-center space-x-1 rtl:space-x-reverse">
                  <Target className="w-3 h-3" />
                  <span>{game.maxLevel} {isRTL ? 'مستوى' : 'levels'}</span>
                </div>
              </div>

              <div className="text-xs font-bold bg-white/90 rounded-lg px-3 py-2 badge-contrast" style={{ color: colors.textColor }}>
                {getCategoryText(game.category)}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
              <motion.div
                className={`h-2 bg-gradient-to-r ${colors.background} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: isCompleted ? '100%' : '0%' }}
                transition={{ duration: 1, delay: animationDelay + 0.5 }}
              />
            </div>

            {/* Action Button */}
              {!isLocked && (
                <motion.div
                  className={`inline-flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-white text-black rounded-xl font-bold text-sm shadow-lg border border-gray-300`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-4 h-4" />
                  <span>{isRTL ? 'ابدأ اللعبة' : 'Start Game'}</span>
                </motion.div>
              )}

            {isLocked && (
              <div className="text-xs font-bold" style={{ color: colors.lightTextColor }}>
                {isRTL ? 'مقفل - أكمل الألعاب السابقة' : 'Locked - Complete previous games'}
              </div>
            )}
          </div>
        </div>
      </Button>
    </motion.div>
  );
}