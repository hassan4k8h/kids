import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ImageUpload } from "./ui/image-upload";
import { ArrowRight, ArrowLeft, Sparkles, User, Camera, Palette, Crown, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "../services/AuthService";
import PlayerService from "../services/PlayerService";
import { subscriptionService } from "../services/SubscriptionService";
import { checkUsageLimits } from "../types/Subscription";

interface PlayerSetupScreenProps {
  onComplete: (name: string, avatar: string) => void;
  onBack: () => void;
  onUpgradeRequired: () => void;
  isRTL: boolean;
}

const avatarEmojis = [
  { emoji: "👦", name: "Boy", nameAr: "ولد" },
  { emoji: "👧", name: "Girl", nameAr: "بنت" },
  { emoji: "🐱", name: "Cat", nameAr: "قطة" },
  { emoji: "🐶", name: "Dog", nameAr: "كلب" },
  { emoji: "🦁", name: "Lion", nameAr: "أسد" },
  { emoji: "🐸", name: "Frog", nameAr: "ضفدع" },
  { emoji: "🐨", name: "Koala", nameAr: "كوالا" },
  { emoji: "🦊", name: "Fox", nameAr: "ثعلب" },
  { emoji: "🐼", name: "Panda", nameAr: "باندا" },
  { emoji: "🐵", name: "Monkey", nameAr: "قرد" },
  { emoji: "🦄", name: "Unicorn", nameAr: "يونيكورن" },
  { emoji: "🦋", name: "Butterfly", nameAr: "فراشة" }
];

export function PlayerSetupScreen({ onComplete, onBack, onUpgradeRequired, isRTL }: PlayerSetupScreenProps) {
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(avatarEmojis[0]);
  const [profileImage, setProfileImage] = useState<string>("");
  const [avatarType, setAvatarType] = useState<'emoji' | 'photo'>('emoji');
  const [step, setStep] = useState(1);
  const [canCreatePlayer, setCanCreatePlayer] = useState(true);
  const [currentPlayerCount, setCurrentPlayerCount] = useState(0);
  const [maxPlayersAllowed, setMaxPlayersAllowed] = useState(2);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkPlayerLimits();
  }, []);

  const checkPlayerLimits = async () => {
    try {
      setIsLoading(true);
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        setCanCreatePlayer(false);
        return;
      }

      // الحصول على عدد الأطفال الحاليين
      const players = await PlayerService.getPlayers(currentUser.id);
      const playerCount = players.length;
      setCurrentPlayerCount(playerCount);

      // الحصول على حالة الاشتراك
      const subscriptionState = subscriptionService.getUserSubscriptionState(currentUser.id);
      const activePlan = subscriptionState.activePlan;
      
      if (activePlan?.limits) {
        setMaxPlayersAllowed(activePlan.limits.maxPlayers);
        const limits = checkUsageLimits(activePlan, subscriptionState.usage);
        setCanCreatePlayer(limits.canCreatePlayer);
      } else {
        // الباقة المجانية - اسمح بطفلين
        setMaxPlayersAllowed(2);
        setCanCreatePlayer(playerCount < 2);
      }
    } catch (error) {
      console.error('Error checking player limits:', error);
      setCanCreatePlayer(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!canCreatePlayer) {
      onUpgradeRequired();
      return;
    }

    if (name.trim()) {
      const finalAvatar = avatarType === 'photo' && profileImage ? profileImage : selectedAvatar.emoji;
      onComplete(name.trim(), finalAvatar);
    }  
  };

  const nextStep = () => {
    if (step === 1 && name.trim()) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
    } else {
      onBack();
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-400 via-teal-400 to-green-400 flex flex-col p-6 ${isRTL ? 'rtl' : ''}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8 safe-area-top"
      >
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            variant="ghost"
            onClick={prevStep}
            className="text-white hover:bg-white/20 p-3 rounded-xl"
          >
            {isRTL ? <ArrowRight className="w-6 h-6" /> : <ArrowLeft className="w-6 h-6" />}
          </Button>
        </motion.div>
        
        <div className="text-center">
          <h2 className="text-white text-2xl font-bold">
            {isRTL ? "إعداد الملف الشخصي" : "Player Setup"}
          </h2>
          <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse mt-2">
            <div className={`w-3 h-3 rounded-full ${step === 1 ? 'bg-white' : 'bg-white/50'}`} />
            <div className={`w-3 h-3 rounded-full ${step === 2 ? 'bg-white' : 'bg-white/50'}`} />
            <div className={`w-3 h-3 rounded-full ${step === 3 ? 'bg-white' : 'bg-white/50'}`} />
          </div>
        </div>
        
        <div className="w-12" />
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 max-w-md mx-auto w-full">
        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center space-y-4"
          >
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="text-white text-lg">
              {isRTL ? "جاري التحقق من الحساب..." : "Checking account limits..."}
            </p>
          </motion.div>
        )}

        {/* Upgrade Required Screen */}
        {!isLoading && !canCreatePlayer && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center space-y-6"
          >
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Crown className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <div>
              <h3 className="text-white text-2xl font-bold mb-4">
                {isRTL ? "الحد الأقصى للأطفال!" : "Maximum Children Reached!"}
              </h3>
              <p className="text-white/90 text-lg">
                {isRTL 
                  ? `لديك ${currentPlayerCount} من ${maxPlayersAllowed} أطفال مسموح بهم في الباقة المجانية`
                  : `You have ${currentPlayerCount} of ${maxPlayersAllowed} children allowed in the free plan`
                }
              </p>
            </div>

            <div className="bg-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse">
                <Sparkles className="w-6 h-6 text-yellow-400" />
                <span className="text-white font-semibold text-lg">
                  {isRTL ? "احصل على الباقة المميزة!" : "Get Premium Plan!"}
                </span>
              </div>
              <ul className="text-white/90 text-sm space-y-2">
                <li className="flex items-center space-x-2 rtl:space-x-reverse">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span>{isRTL ? "أطفال غير محدودين" : "Unlimited Children"}</span>
                </li>
                <li className="flex items-center space-x-2 rtl:space-x-reverse">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span>{isRTL ? "جميع الألعاب والقصص" : "All Games & Stories"}</span>
                </li>
                <li className="flex items-center space-x-2 rtl:space-x-reverse">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span>{isRTL ? "بدون إعلانات" : "Ad-Free Experience"}</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col space-y-3">
              <Button
                onClick={onUpgradeRequired}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-4 rounded-2xl shadow-xl"
              >
                <Crown className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" />
                {isRTL ? "اشتراك مميز - $3/شهر" : "Get Premium - $3/month"}
              </Button>
              <Button
                onClick={onBack}
                variant="ghost"
                className="text-white hover:bg-white/20 py-3 rounded-2xl"
              >
                {isRTL ? "العودة" : "Go Back"}
              </Button>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {!isLoading && canCreatePlayer && step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full space-y-6"
            >
              {/* Name Input */}
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto"
                >
                  <User className="w-10 h-10 text-white" />
                </motion.div>
                
                <h3 className="text-white text-2xl font-bold">
                  {isRTL ? "ما اسمك؟" : "What's Your Name?"}
                </h3>
                
                <p className="text-white/90">
                  {isRTL ? "أدخل اسمك لنبدأ المغامرة!" : "Enter your name to start the adventure!"}
                </p>
              </div>

              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder={isRTL ? "أدخل اسمك هنا" : "Enter your name here"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/90 border-0 rounded-2xl px-6 py-4 text-lg text-center placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-white/50"
                  maxLength={20}
                  dir={isRTL ? "rtl" : "ltr"}
                />
                
                {name && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <div className="inline-flex items-center space-x-2 rtl:space-x-reverse bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                      <Sparkles className="w-5 h-5 text-white" />
                      <span className="text-white font-bold">{name}</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {!isLoading && canCreatePlayer && step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full space-y-6"
            >
              {/* Avatar Type Selection */}
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto"
                >
                  <Palette className="w-10 h-10 text-white" />
                </motion.div>
                
                <h3 className="text-white text-2xl font-bold">
                  {isRTL ? "اختر نوع الصورة الرمزية" : "Choose Avatar Type"}
                </h3>
                
                <p className="text-white/90">
                  {isRTL ? "هل تريد استخدام صورتك أم الرموز التعبيرية؟" : "Use your photo or fun emoji characters?"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAvatarType('photo')}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                    avatarType === 'photo'
                      ? 'bg-white border-white shadow-xl scale-105'
                      : 'bg-white/20 border-white/50 hover:bg-white/30'
                  }`}
                >
                  <Camera className={`w-8 h-8 mx-auto mb-3 ${avatarType === 'photo' ? 'text-teal-600' : 'text-white'}`} />
                  <div className={`font-bold ${avatarType === 'photo' ? 'text-teal-600' : 'text-white'}`}>
                    {isRTL ? "صورتي" : "My Photo"}
                  </div>
                  <div className={`text-sm mt-1 ${avatarType === 'photo' ? 'text-teal-500' : 'text-white/80'}`}>
                    {isRTL ? "استخدم صورة حقيقية" : "Use real photo"}
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAvatarType('emoji')}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                    avatarType === 'emoji'
                      ? 'bg-white border-white shadow-xl scale-105'
                      : 'bg-white/20 border-white/50 hover:bg-white/30'
                  }`}
                >
                  <div className={`text-3xl mx-auto mb-3 ${avatarType === 'emoji' ? '' : 'opacity-70'}`}>
                    😊
                  </div>
                  <div className={`font-bold ${avatarType === 'emoji' ? 'text-teal-600' : 'text-white'}`}>
                    {isRTL ? "رموز ممتعة" : "Fun Emoji"}
                  </div>
                  <div className={`text-sm mt-1 ${avatarType === 'emoji' ? 'text-teal-500' : 'text-white/80'}`}>
                    {isRTL ? "شخصيات كرتونية" : "Cartoon characters"}
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {!isLoading && canCreatePlayer && step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full space-y-6"
            >
              {/* Avatar Selection */}
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto"
                >
                  {avatarType === 'photo' && profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="text-4xl">{selectedAvatar.emoji}</div>
                  )}
                </motion.div>
                
                <h3 className="text-white text-2xl font-bold">
                  {avatarType === 'photo' 
                    ? (isRTL ? "أضف صورتك" : "Add Your Photo")
                    : (isRTL ? "اختر شخصيتك" : "Choose Your Character")
                  }
                </h3>
                
                <p className="text-white/90">
                  {avatarType === 'photo'
                    ? (isRTL ? "ارفع صورة جميلة لك!" : "Upload a nice photo of yourself!")
                    : (isRTL ? "اختر الشخصية التي تمثلك!" : "Pick the character that represents you!")
                  }
                </p>
              </div>

              {avatarType === 'photo' ? (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <ImageUpload
                    currentImage={profileImage}
                    onImageChange={setProfileImage}
                    onImageRemove={() => setProfileImage("")}
                    isRTL={isRTL}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {avatarEmojis.map((avatar, index) => (
                    <motion.button
                      key={avatar.emoji}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`aspect-square rounded-2xl bg-white flex items-center justify-center text-3xl transition-all duration-300 ${
                        selectedAvatar.emoji === avatar.emoji 
                          ? "ring-4 ring-yellow-400 scale-110 shadow-xl" 
                          : "hover:bg-gray-50 shadow-lg"
                      }`}
                    >
                      {avatar.emoji}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Selected Avatar Info */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="inline-flex items-center space-x-3 rtl:space-x-reverse bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                  {avatarType === 'photo' && profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-8 h-8 object-cover rounded-full" />
                  ) : (
                    <span className="text-2xl">{selectedAvatar.emoji}</span>
                  )}
                  <div className="text-left rtl:text-right">
                    <div className="text-white font-bold">{name}</div>
                    <div className="text-white/80 text-sm">
                      {avatarType === 'photo' 
                        ? (isRTL ? "صورة شخصية" : "Personal Photo")
                        : (isRTL ? selectedAvatar.nameAr : selectedAvatar.name)
                      }
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continue Button */}
        {!isLoading && canCreatePlayer && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full max-w-xs"
          >
            <Button
              onClick={nextStep}
              disabled={
                (step === 1 && !name.trim()) || 
                (step === 3 && avatarType === 'photo' && !profileImage)
              }
              className="btn-fun bg-white text-teal-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed w-full font-bold text-lg py-4 rounded-2xl border-0 shadow-xl"
            >
              <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                <span>
                  {step === 3 
                    ? (isRTL ? "ابدأ اللعب!" : "Start Playing!") 
                    : (isRTL ? "التالي" : "Next")
                  }
                </span>
                {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
              </div>
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}