import { Button } from "./ui/button";
import { LanguageToggle } from "./ui/language-toggle";
import { Play, Star, Sparkles, Trophy, Heart, Zap, Crown, Shield, Rocket, Globe } from "lucide-react";
import { motion } from "framer-motion";

interface WelcomeScreenProps {
  onStart: () => void;
  isRTL: boolean;
  onLanguageChange: (isRTL: boolean) => void;
}

export function WelcomeScreen({ onStart, isRTL, onLanguageChange }: WelcomeScreenProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 flex flex-col items-center justify-center safe-area-padding ${isRTL ? 'rtl' : ''} relative overflow-hidden`}>
      {/* Language Toggle - Top Right */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute top-6 right-6 z-20"
      >
        <LanguageToggle 
          isRTL={isRTL} 
          onToggle={onLanguageChange}
          variant="welcome"
          className="transform scale-90 hover:scale-100 transition-transform duration-300"
        />
      </motion.div>

      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            y: [0, -25, 0],
            rotate: [0, 15, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-16 left-12"
        >
          <Star className="w-12 h-12 text-yellow-300 fill-current drop-shadow-lg" />
        </motion.div>
        
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, -12, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.7
          }}
          className="absolute top-24 right-20"
        >
          <Sparkles className="w-10 h-10 text-white drop-shadow-lg" />
        </motion.div>
        
        <motion.div
          animate={{
            y: [0, -30, 0],
            rotate: [0, 20, 0],
            scale: [1, 1.15, 1]
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.2
          }}
          className="absolute bottom-40 left-10"
        >
          <Heart className="w-10 h-10 text-pink-200 fill-current drop-shadow-lg" />
        </motion.div>
        
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, -8, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.8
          }}
          className="absolute bottom-48 right-16"
        >
          <Trophy className="w-12 h-12 text-yellow-200 drop-shadow-lg" />
        </motion.div>

        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 1, 0.6],
            rotate: [0, 360]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/3 left-1/4"
        >
          <Crown className="w-8 h-8 text-yellow-300 drop-shadow-lg" />
        </motion.div>

        <motion.div
          animate={{
            x: [0, 15, 0],
            y: [0, -12, 0],
            rotate: [0, 25, 0]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2.5
          }}
          className="absolute top-1/2 right-1/4"
        >
          <Shield className="w-7 h-7 text-blue-200 drop-shadow-lg" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{
            duration: 4.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
          className="absolute bottom-32 right-1/3"
        >
          <Rocket className="w-9 h-9 text-cyan-200 drop-shadow-lg" />
        </motion.div>

        {/* Additional Floating Elements */}
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-20 left-1/3"
        >
          <Globe className="w-6 h-6 text-cyan-300 drop-shadow-lg" />
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="text-center space-y-10 max-w-2xl z-10 container-pro">
        {/* Logo Section */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 150 }}
          className="space-y-6"
        >
          <motion.div
            whileHover={{ scale: 1.08, rotate: 8 }}
            whileTap={{ scale: 0.95 }}
            className="mx-auto w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-large border-4 border-white/30 backdrop-blur-sm"
          >
            <div className="text-8xl">🎓</div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white font-ultra-bold drop-shadow-lg text-ultra-clear"
            style={{ fontSize: 'clamp(3rem, 8vw, 5rem)' }}
          >
            Skilloo
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-white/95 font-bold text-super-clear"
            style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}
          >
            {isRTL 
              ? "تطبيق تعليمي ممتع واحترافي للأطفال" 
              : "Professional Fun Learning App for Kids"
            }
          </motion.p>
        </motion.div>

        {/* Enhanced Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-3 gap-6 text-white/95"
        >
          <motion.div 
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white/25 backdrop-blur-lg rounded-3xl p-6 border-2 border-white/40 shadow-large hover:shadow-glow transition-all duration-300"
          >
            <div className="text-4xl mb-3">🎮</div>
            <div className="font-ultra-bold text-ultra-clear text-3xl mb-1">20+</div>
            <div className="font-bold text-super-clear text-large-pro">
              {isRTL ? "ألعاب تفاعلية" : "Interactive Games"}
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white/25 backdrop-blur-lg rounded-3xl p-6 border-2 border-white/40 shadow-large hover:shadow-glow transition-all duration-300"
          >
            <div className="text-4xl mb-3">🏆</div>
            <div className="font-ultra-bold text-ultra-clear text-3xl mb-1">2000+</div>
            <div className="font-bold text-super-clear text-large-pro">
              {isRTL ? "مستوى تعليمي" : "Learning Levels"}
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white/25 backdrop-blur-lg rounded-3xl p-6 border-2 border-white/40 shadow-large hover:shadow-glow transition-all duration-300"
          >
            <div className="text-4xl mb-3">⭐</div>
            <div className="font-ultra-bold text-ultra-clear text-3xl mb-1">∞</div>
            <div className="font-bold text-super-clear text-large-pro">
              {isRTL ? "متعة لا محدودة" : "Unlimited Fun"}
            </div>
          </motion.div>
        </motion.div>

        {/* Enhanced Start Button */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={onStart}
            variant="fun"
            size="xl"
            className="relative overflow-hidden group shadow-glow hover:shadow-glow border-4 border-white/40"
            style={{
              minHeight: 'clamp(80px, 15vw, 120px)',
              minWidth: 'clamp(280px, 40vw, 360px)',
              fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
              color: 'transparent'
            }}
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-15 transition-all duration-500 rounded-3xl" />
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse relative z-10">
              <motion.div
                animate={{ 
                  rotate: [0, 15, 0, -15, 0],
                  scale: [1, 1.2, 1, 1.2, 1]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Play className="w-10 h-10 text-purple-600 fill-current" />
              </motion.div>
              
              <span 
                className="font-ultra-bold text-ultra-clear"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                  letterSpacing: '0.03em',
                  lineHeight: '1.2'
                }}
              >
                {isRTL ? "ابدأ المغامرة" : "Start Adventure"}
              </span>
              
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                <Sparkles className="w-8 h-8 text-yellow-500" />
              </motion.div>
            </div>

            {/* Animated glow */}
            <motion.div
              className="absolute inset-0 rounded-3xl"
              animate={{
                background: [
                  'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
                  'radial-gradient(circle at 80% 50%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)',
                  'radial-gradient(circle at 50% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
                  'radial-gradient(circle at 50% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
                ]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </Button>
        </motion.div>

        {/* Enhanced Footer Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="space-y-6"
        >
          <p className="text-white/95 font-bold text-super-clear text-xl-pro">
            {isRTL 
              ? "تعلم واستمتع واكتشف عالماً جديداً من المرح والمعرفة!"
              : "Learn, play, and discover a new world of fun and knowledge!"
            }
          </p>
          
          {/* Professional badge */}
          <motion.div
            animate={{ 
              y: [0, -8, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-flex items-center space-x-3 rtl:space-x-reverse bg-white/30 backdrop-blur-lg rounded-full px-8 py-4 border-2 border-white/40 shadow-large"
          >
            <Trophy className="w-6 h-6 text-yellow-300" />
            <span className="text-white font-bold text-super-clear text-large-pro">
              {isRTL 
                ? "تطبيق آمن ومُخصص ومُطور احترافياً للأطفال" 
                : "Safe, Professional & Kid-Friendly App"
              }
            </span>
            <Heart className="w-6 h-6 text-pink-300 fill-current" />
          </motion.div>

          {/* Additional features badges */}
          <div className="flex flex-wrap justify-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 rtl:space-x-reverse bg-white/20 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/30"
            >
              <Shield className="w-5 h-5 text-blue-300" />
              <span className="text-white font-bold text-super-clear">
                {isRTL ? "آمن 100%" : "100% Safe"}
              </span>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 rtl:space-x-reverse bg-white/20 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/30"
            >
              <Zap className="w-5 h-5 text-yellow-300" />
              <span className="text-white font-bold text-super-clear">
                {isRTL ? "تفاعلي" : "Interactive"}
              </span>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 rtl:space-x-reverse bg-white/20 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/30"
            >
              <Star className="w-5 h-5 text-yellow-300 fill-current" />
              <span className="text-white font-bold text-super-clear">
                {isRTL ? "تعليمي" : "Educational"}
              </span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 rtl:space-x-reverse bg-white/20 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/30"
            >
              <Globe className="w-5 h-5 text-green-300" />
              <span className="text-white font-bold text-super-clear">
                {isRTL ? "متعدد اللغات" : "Multilingual"}
              </span>
            </motion.div>
          </div>

          {/* Language Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
          >
            <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse">
              <Globe className="w-5 h-5 text-cyan-300" />
              <span className="text-white/90 font-bold text-medium-pro">
                {isRTL 
                  ? "متوفر باللغتين العربية والإنجليزية" 
                  : "Available in Arabic and English"
                }
              </span>
              <motion.div
                animate={{ rotate: isRTL ? 180 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-lg">{isRTL ? "🇸🇦" : "🇺🇸"}</span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}