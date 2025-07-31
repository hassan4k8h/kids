import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { 
  ArrowLeft, 
  Plus, 
  Crown, 
  Star, 
  Trophy, 
  Users, 
  Sparkles,
  Heart,
  Lock,
  LogOut
} from "lucide-react";
import { Player } from "../types/Player";
import PlayerService from "../services/PlayerService";
import { subscriptionService } from "../services/SubscriptionService";
import { audioService } from "../services/AudioService";

interface PlayerSelectionScreenProps {
  onPlayerSelect: (player: Player) => void;
  onAddPlayer: () => void;
  onBack: () => void;
  onLogout: () => void;
  isRTL: boolean;
  userId: string;
}

export function PlayerSelectionScreen({ 
  onPlayerSelect, 
  onAddPlayer, 
  onBack, 
  onLogout,
  isRTL, 
  userId 
}: PlayerSelectionScreenProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionState, setSubscriptionState] = useState(subscriptionService.getSubscriptionState());

  // تحميل قائمة اللاعبين للمستخدم
  useEffect(() => {
    const loadPlayers = async () => {  
      try {
        const userPlayers = await PlayerService.getPlayers(userId);
        setPlayers(userPlayers);
        
        // تعيين اللاعب المحدد حالياً إذا كان هناك لاعب واحد فقط
        if (userPlayers.length === 1) {
          setSelectedPlayerId(userPlayers[0].id);
        }
        
        console.log(`🎮 Loaded ${userPlayers.length} players for user ${userId}`);
      } catch (error) {
        console.error('Error loading players:', error);
        setPlayers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlayers();
  }, [userId]);

  // مراقبة حالة الاشتراك
  useEffect(() => {
    const unsubscribe = subscriptionService.subscribe((newState) => {
      setSubscriptionState(newState);
    });

    return unsubscribe;
  }, []);

  // تشغيل الأصوات عند التحميل
  useEffect(() => {
    try {
      audioService.playPageTransition();
    } catch (error) {
      console.warn('Failed to play page transition sound:', error);
    }
  }, []);

  const handlePlayerSelect = (player: Player) => {
    // منع الضغط المتكرر
    if (selectedPlayerId === player.id) {
      return;
    }

    // التأكد من أن اللاعب ينتمي للمستخدم الحالي أو أن userId فارغ (للتخزين المحلي)
    if (player.userId && player.userId !== userId) {
      console.error('❌ Security violation: Player does not belong to current user');
      return;
    }

    try {
      audioService.playClick();
    } catch (error) {
      console.warn('Failed to play click sound:', error);
    }
    
    setSelectedPlayerId(player.id);
    
    // تأخير قصير لإظهار التحديد
    setTimeout(() => {
      onPlayerSelect(player);
    }, 200);
    
    console.log(`✅ Player selected: ${player.name} (${player.id})`);
  };

  const handleAddPlayer = () => {
    // فحص حدود الاشتراك
    const maxPlayers = subscriptionState.activePlan?.limits?.maxPlayers || 2; // الباقة المجانية تسمح بطفلين
    
    if (maxPlayers !== -1 && players.length >= maxPlayers) {
      console.log(`❌ Player limit reached: ${players.length}/${maxPlayers}`);
      // عدم السماح بالانتقال - المستخدم سيرى رسالة في PlayerSetupScreen
      return;
    }
    
    try {
      audioService.playClick();
    } catch (error) {
      console.warn('Failed to play click sound:', error);
    }
    
    onAddPlayer();
  };

  const handleBack = () => {
    try {
      audioService.playClick();
    } catch (error) {
      console.warn('Failed to play click sound:', error);
    }
    onBack();
  };

  const getPlayerStats = (player: Player) => {
    const totalGames = Object.values(player.gameProgress).length;
    const totalScore = player.totalScore;
    const level = Math.max(1, ...Object.values(player.gameProgress).map(p => p.level));
    
    return { totalGames, totalScore, level };
  };

  const getPlayerBadge = (player: Player) => {
    const stats = getPlayerStats(player);
    
    if (stats.totalScore >= 10000) {
      return { icon: Crown, color: 'text-yellow-500', bg: 'bg-yellow-100', name: isRTL ? 'أسطورة' : 'Legend' };
    } else if (stats.totalScore >= 5000) {
      return { icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-100', name: isRTL ? 'بطل' : 'Champion' };
    } else if (stats.totalScore >= 1000) {
      return { icon: Star, color: 'text-blue-500', bg: 'bg-blue-100', name: isRTL ? 'نجم' : 'Star' };
    } else {
      return { icon: Sparkles, color: 'text-green-500', bg: 'bg-green-100', name: isRTL ? 'مبتدئ' : 'Beginner' };
    }
  };

  const canAddMorePlayers = () => {
    const maxPlayers = subscriptionState.activePlan?.limits?.maxPlayers || 2;
    return maxPlayers === -1 || players.length < maxPlayers;
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center ${isRTL ? 'rtl' : ''}`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-bold text-lg">
            {isRTL ? 'جاري تحميل اللاعبين...' : 'Loading players...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 ${isRTL ? 'rtl' : ''}`}>
      <div className="container-responsive py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 safe-area-top"
        >
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-white hover:bg-white/20 p-3 rounded-xl font-bold"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          
          <div className="text-center">
            <h1 className="text-white text-3xl font-extra-bold text-bold-shadow">
              {isRTL ? "اختر اللاعب" : "Choose Player"}
            </h1>
            <p className="text-white/90 font-bold">
              {isRTL ? `${players.length} من ${subscriptionState.activePlan?.limits?.maxPlayers === -1 ? '∞' : subscriptionState.activePlan?.limits?.maxPlayers} لاعب` 
                     : `${players.length} of ${subscriptionState.activePlan?.limits?.maxPlayers === -1 ? '∞' : subscriptionState.activePlan?.limits?.maxPlayers} players`}
            </p>
          </div>

          <Button
            variant="ghost"
            onClick={onLogout}
            className="text-white hover:bg-white/20 p-3 rounded-xl font-bold"
            title={isRTL ? "تسجيل الخروج" : "Logout"}
          >
            <LogOut className="w-6 h-6" />
          </Button>
        </motion.div>

        {/* محتوى الشاشة */}
        <div className="space-y-6">
          {/* قائ��ة اللاعبين */}
          {players.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              <AnimatePresence>
                {players.map((player, index) => {
                  const stats = getPlayerStats(player);
                  const badge = getPlayerBadge(player);
                  const isSelected = selectedPlayerId === player.id;
                  const isImageAvatar = player.avatar.startsWith('data:') || player.avatar.startsWith('http');

                  return (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all duration-300 overflow-hidden ${
                          isSelected 
                            ? 'ring-4 ring-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50' 
                            : 'hover:shadow-xl bg-white/95 backdrop-blur-sm'
                        }`}
                        onClick={() => handlePlayerSelect(player)}
                      >
                        <div className="relative p-6">
                          {/* شارة الحالة */}
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-3 right-3 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
                            >
                              <Heart className="w-4 h-4 text-white" fill="currentColor" />
                            </motion.div>
                          )}

                          {/* شارة المستوى */}
                          <div className={`absolute top-3 left-3 px-2 py-1 rounded-full ${badge.bg} flex items-center space-x-1 rtl:space-x-reverse`}>
                            <badge.icon className={`w-3 h-3 ${badge.color}`} />
                            <span className={`text-xs font-bold ${badge.color}`}>
                              {badge.name}
                            </span>
                          </div>

                          {/* صورة اللاعب */}
                          <div className="text-center mb-4">
                            <div className={`w-20 h-20 rounded-full overflow-hidden border-4 mx-auto mb-3 ${
                              isSelected ? 'border-yellow-400' : 'border-white'
                            } shadow-lg`}>
                              {isImageAvatar ? (
                                <img 
                                  src={player.avatar} 
                                  alt={player.name} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.parentElement!.innerHTML = `
                                      <div class="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-3xl">
                                        👤
                                      </div>
                                    `;
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-3xl">
                                  {player.avatar}
                                </div>
                              )}
                            </div>
                            
                            <h3 className="font-extra-bold text-gray-800 text-xl mb-1">
                              {player.name}
                            </h3>
                            
                            <p className="text-gray-600 font-bold text-sm">
                              {isRTL ? `المستوى ${stats.level}` : `Level ${stats.level}`}
                            </p>
                          </div>

                          {/* إحصائيات اللاعب */}
                          <div className="grid grid-cols-2 gap-3 text-center">
                            <div className="bg-blue-50 rounded-xl p-3">
                              <div className="text-lg font-extra-bold text-blue-600 mb-1">
                                {stats.totalScore.toLocaleString()}
                              </div>
                              <div className="text-xs font-bold text-blue-800">
                                {isRTL ? 'نقاط' : 'Points'}
                              </div>
                            </div>
                            
                            <div className="bg-green-50 rounded-xl p-3">
                              <div className="text-lg font-extra-bold text-green-600 mb-1">
                                {stats.totalGames}
                              </div>
                              <div className="text-xs font-bold text-green-800">
                                {isRTL ? 'ألعاب' : 'Games'}
                              </div>
                            </div>
                          </div>

                          {/* تاريخ آخر لعب */}
                          <div className="mt-4 text-center">
                            <p className="text-xs text-gray-500 font-bold">
                              {isRTL ? 'آخر لعب: ' : 'Last played: '}
                              {new Date(player.lastPlayed).toLocaleDateString(isRTL ? 'ar' : 'en')}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}

          {/* زر إضافة لاعب جديد */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: players.length * 0.1 + 0.2 }}
          >
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
                canAddMorePlayers() 
                  ? 'bg-white/95 backdrop-blur-sm hover:bg-white' 
                  : 'bg-gray-100 cursor-not-allowed opacity-60'
              }`}
              onClick={canAddMorePlayers() ? handleAddPlayer : undefined}
            >
              <div className="p-8 text-center">
                {canAddMorePlayers() ? (
                  <>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                    >
                      <Plus className="w-10 h-10 text-white" />
                    </motion.div>
                    
                    <h3 className="font-extra-bold text-gray-800 text-xl mb-2">
                      {isRTL ? 'إضافة لاعب جديد' : 'Add New Player'}
                    </h3>
                    
                    <p className="text-gray-600 font-bold">
                      {isRTL ? 'انشئ ملف شخصي جديد للعب' : 'Create a new profile to play'}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-10 h-10 text-gray-500" />
                    </div>
                    
                    <h3 className="font-extra-bold text-gray-600 text-xl mb-2">
                      {isRTL ? 'وصلت للحد الأقصى' : 'Maximum Players Reached'}
                    </h3>
                    
                    <p className="text-gray-500 font-bold">
                      {isRTL 
                        ? `يمكنك إنشاء حتى ${subscriptionState.activePlan?.limits?.maxPlayers} لاعب في باقتك الحالية`
                        : `You can create up to ${subscriptionState.activePlan?.limits?.maxPlayers} players in your current plan`
                      }
                    </p>
                  </>
                )}
              </div>
            </Card>
          </motion.div>

          {/* رسالة عدم وجود لاعبين */}
          {players.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-16 h-16 text-white" />
              </div>
              
              <h2 className="text-white text-2xl font-extra-bold text-bold-shadow mb-4">
                {isRTL ? 'لا يوجد لاعبين بعد' : 'No Players Yet'}
              </h2>
              
              <p className="text-white/90 font-bold mb-8 max-w-md mx-auto">
                {isRTL 
                  ? 'أنشئ أول لاعب لك لبدء رحلة التعلم الممتعة!'
                  : 'Create your first player to start the fun learning journey!'
                }
              </p>
              
              <Button
                onClick={handleAddPlayer}
                className="btn-fun text-white font-extra-bold"
              >
                <Plus className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" />
                {isRTL ? 'إنشاء لاعب جديد' : 'Create New Player'}
              </Button>
            </motion.div>
          )}

          {/* معلومات الاشتراك */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white/20 backdrop-blur-sm rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-extra-bold text-lg mb-1">
                  {subscriptionState.activePlan?.name || (isRTL ? 'باقة غير معروفة' : 'Unknown Plan')}
                </h3>
                <p className="text-white/80 font-bold">
                  {isRTL 
                    ? `${players.length} من ${subscriptionState.activePlan?.limits?.maxPlayers === -1 ? '∞' : subscriptionState.activePlan?.limits?.maxPlayers} لاعب`
                    : `${players.length} of ${subscriptionState.activePlan?.limits?.maxPlayers === -1 ? '∞' : subscriptionState.activePlan?.limits?.maxPlayers} players`
                  }
                </p>
              </div>
              
              {subscriptionState.activePlan?.id === 'free' && (
                <div className="text-center">
                  <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-white/80 text-sm font-bold">
                    {isRTL ? 'ترقى للمزيد' : 'Upgrade for more'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}