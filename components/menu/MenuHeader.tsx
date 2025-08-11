import { Button } from "../ui/button";
import { Settings, Trophy, Star, Grid, List, Users, Bell, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { formatNumber } from "../../utils/locale";

interface MenuHeaderProps {
  playerName: string;
  playerAvatar: string;
  onRewards: () => void;
  onAchievements: () => void;
  onSettings: () => void;
  onSwitchPlayer: () => void;
  isRTL: boolean;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  points: number;
  achievementsCount: number;
  streakDays: number;
  currentLevel: number;
  levelProgressPercent: number; // 0-100
}

export function MenuHeader({ 
  playerName, 
  playerAvatar, 
  onRewards, 
  onAchievements, 
  onSettings, 
  onSwitchPlayer,
  isRTL,
  viewMode,
  onViewModeChange,
  points,
  achievementsCount,
  streakDays,
  currentLevel,
  levelProgressPercent
}: MenuHeaderProps) {
  const isImageAvatar = playerAvatar.startsWith('data:') || playerAvatar.startsWith('http');

  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 backdrop-blur-sm shadow-lg rounded-3xl p-6 mb-6 border border-white/50"
    >
      <div className="flex items-center justify-between">
        {/* Player Info Section */}
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center border-3 border-gradient-to-r from-purple-400 to-pink-400 overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 shadow-lg">
              {isImageAvatar ? (
                <img 
                  src={playerAvatar} 
                  alt="Profile" 
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <span className="text-3xl">{playerAvatar}</span>
              )}
            </div>
            {/* Online Status Indicator */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-md">
              <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </motion.div>
          
          <div>
            <motion.h2
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-gray-800 mb-1"
            >
              {isRTL ? `مرحباً ${playerName}! 👋` : `Hello ${playerName}! 👋`}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center space-x-3 rtl:space-x-reverse"
            >
              <p className="text-gray-600 font-medium">
                {isRTL ? "جاهز للتعلم والمرح!" : "Ready to learn and have fun!"}
              </p>
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 font-semibold">
                  {isRTL ? "متصل" : "Online"}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Controls Section */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 shadow-inner">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className={`p-3 rounded-lg transition-all duration-300 ${
                viewMode === 'grid' 
                  ? 'bg-white shadow-md text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChange('list')}
              className={`p-3 rounded-lg transition-all duration-300 ${
                viewMode === 'list' 
                  ? 'bg-white shadow-md text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {/* Switch Player Button */}
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={onSwitchPlayer}
                className="p-3 hover:bg-blue-50 rounded-xl shadow-md border border-blue-100 text-blue-600 hover:text-blue-700 transition-all duration-300"
                title={isRTL ? "تبديل اللاعب" : "Switch Player"}
              >
                <Users className="w-5 h-5" />
              </Button>
            </motion.div>
            
            {/* Rewards Button */}
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={onRewards}
                className="p-3 hover:bg-yellow-50 rounded-xl shadow-md border border-yellow-100 text-yellow-600 hover:text-yellow-700 transition-all duration-300 relative"
                title={isRTL ? "المكافآت" : "Rewards"}
              >
                <Gift className="w-5 h-5" />
                {/* Notification Badge */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full">
                  <div className="w-full h-full bg-red-400 rounded-full animate-ping"></div>
                </div>
              </Button>
            </motion.div>
            
            {/* Achievements Button */}
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={onAchievements}
                className="p-3 hover:bg-purple-50 rounded-xl shadow-md border border-purple-100 text-purple-600 hover:text-purple-700 transition-all duration-300"
                title={isRTL ? "الإنجازات" : "Achievements"}
              >
                <Trophy className="w-5 h-5" />
              </Button>
            </motion.div>
            
            {/* Settings Button */}
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={onSettings}
                className="p-3 hover:bg-gray-50 rounded-xl shadow-md border border-gray-200 text-gray-600 hover:text-gray-700 transition-all duration-300"
                title={isRTL ? "الإعدادات" : "Settings"}
              >
                <Settings className="w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4 pt-4 border-t border-gray-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 rtl:space-x-reverse">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-800">{formatNumber(points, isRTL)}</div>
                <div className="text-xs text-gray-500">{isRTL ? "نقاط" : "Points"}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-800">{formatNumber(achievementsCount, isRTL)}</div>
                <div className="text-xs text-gray-500">{isRTL ? "إنجازات" : "Achievements"}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{formatNumber(streakDays, isRTL)}</span>
                </div>
              <div>
                <div className="text-lg font-bold text-gray-800">{isRTL ? `يوم ${formatNumber(streakDays, isRTL)}` : `Day ${streakDays}`}</div>
                <div className="text-xs text-gray-500">{isRTL ? "سلسلة" : "Streak"}</div>
              </div>
            </div>
          </div>
          
          <div className="text-right rtl:text-left">
            <div className="text-sm text-gray-600 mb-1">
              {isRTL ? "المستوى الحالي" : "Current Level"}
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {formatNumber(currentLevel, isRTL)}
              </div>
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: `${Math.max(0, Math.min(100, levelProgressPercent))}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}