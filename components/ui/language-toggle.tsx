import { motion } from "framer-motion";
import { Button } from "./button";
import { Globe, Check, Languages } from "lucide-react";

interface LanguageToggleProps {
  isRTL: boolean;
  onToggle: (isRTL: boolean) => void;
  className?: string;
  variant?: 'default' | 'welcome' | 'minimal';
}

export function LanguageToggle({ 
  isRTL, 
  onToggle, 
  className = "",
  variant = 'default'
}: LanguageToggleProps) {
  
  // Welcome variant for the welcome screen
  if (variant === 'welcome') {
    return (
      <motion.div 
        className={`inline-flex bg-white/20 backdrop-blur-xl rounded-3xl p-1 shadow-large border-2 border-white/30 ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Arabic Option */}
        <motion.div
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          <Button
            variant="ghost"
            onClick={() => onToggle(true)}
            className={`
              relative px-6 py-3 rounded-2xl transition-all duration-300 font-ultra-bold text-medium-pro min-h-[60px]
              ${isRTL 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg border-2 border-white/40' 
                : 'text-white/90 hover:text-white hover:bg-white/20'
              }
            `}
          >
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <span className="text-2xl">🇮🇶</span>
              <span className="font-ultra-bold text-super-clear">عربي</span>
              {isRTL && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <Check className="w-5 h-5" />
                </motion.div>
              )}
            </div>
            
            {/* Animated background for active state */}
            {isRTL && (
              <motion.div
                layoutId="activeLanguageBgWelcome"
                className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl -z-10"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </Button>
        </motion.div>

        {/* English Option */}
        <motion.div
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          <Button
            variant="ghost"
            onClick={() => onToggle(false)}
            className={`
              relative px-6 py-3 rounded-2xl transition-all duration-300 font-ultra-bold text-medium-pro min-h-[60px]
              ${!isRTL 
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg border-2 border-white/40' 
                : 'text-white/90 hover:text-white hover:bg-white/20'
              }
            `}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🇺🇸</span>
              <span className="font-ultra-bold text-super-clear">English</span>
              {!isRTL && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <Check className="w-5 h-5" />
                </motion.div>
              )}
            </div>
            
            {/* Animated background for active state */}
            {!isRTL && (
              <motion.div
                layoutId="activeLanguageBgWelcome"
                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl -z-10"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </Button>
        </motion.div>

        {/* Central globe icon */}
        <motion.div
          animate={{ rotate: isRTL ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center shadow-md border-2 border-white/30">
            <Languages className="w-5 h-5 text-white" />
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Minimal variant for small spaces
  if (variant === 'minimal') {
    return (
      <div className={`inline-flex bg-white/90 backdrop-blur-sm rounded-xl p-0.5 shadow-md border border-white/30 ${className}`}>
        <Button
          variant="ghost"
          onClick={() => onToggle(true)}
          className={`px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
            isRTL ? 'bg-purple-500 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          🇮🇶
        </Button>
        <Button
          variant="ghost"
          onClick={() => onToggle(false)}
          className={`px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
            !isRTL ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          🇺🇸
        </Button>
      </div>
    );
  }

  // Default variant (existing implementation)
  return (
    <div className={`inline-flex bg-white/90 backdrop-blur-sm rounded-2xl p-1 shadow-lg border border-white/30 ${className}`}>
      {/* Arabic Option */}
      <motion.div
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        <Button
          variant="ghost"
          onClick={() => onToggle(true)}
          className={`
            relative px-4 py-2 rounded-xl transition-all duration-300 font-extra-bold text-sm
            ${isRTL 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md' 
              : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
            }
          `}
        >
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <span className="text-lg">🇮🇶</span>
            <span className="font-extra-bold">عربي</span>
            {isRTL && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                <Check className="w-4 h-4" />
              </motion.div>
            )}
          </div>
          
          {/* Animated background for active state */}
          {isRTL && (
            <motion.div
              layoutId="activeLanguageBg"
              className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl -z-10"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </Button>
      </motion.div>

      {/* English Option */}
      <motion.div
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        <Button
          variant="ghost"
          onClick={() => onToggle(false)}
          className={`
            relative px-4 py-2 rounded-xl transition-all duration-300 font-extra-bold text-sm
            ${!isRTL 
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md' 
              : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
            }
          `}
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">🇺🇸</span>
            <span className="font-extra-bold">English</span>
            {!isRTL && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                <Check className="w-4 h-4" />
              </motion.div>
            )}
          </div>
          
          {/* Animated background for active state */}
          {!isRTL && (
            <motion.div
              layoutId="activeLanguageBg"
              className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl -z-10"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </Button>
      </motion.div>

      {/* Global icon in the center */}
      <motion.div
        animate={{ rotate: isRTL ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center shadow-sm">
          <Globe className="w-4 h-4 text-white" />
        </div>
      </motion.div>
    </div>
  );
}
