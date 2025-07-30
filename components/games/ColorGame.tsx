import { useState, useEffect, useCallback } from "react";
import { Button } from "../ui/button";
import { GameProps } from "./GameEngine";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Palette, Sparkles } from "lucide-react";

interface ColorChallenge {
  targetColor: {
    name: string;
    nameAr: string;
    hex: string;
    rgb: string;
  };
  options: Array<{
    name: string;
    nameAr: string;
    hex: string;
    rgb: string;
  }>;
  type: 'name-to-color' | 'color-to-name' | 'mix-colors';
}

const colors = [
  { name: "Red", nameAr: "أحمر", hex: "#ef4444", rgb: "rgb(239, 68, 68)" },
  { name: "Blue", nameAr: "أزرق", hex: "#3b82f6", rgb: "rgb(59, 130, 246)" },
  { name: "Green", nameAr: "أخضر", hex: "#10b981", rgb: "rgb(16, 185, 129)" },
  { name: "Yellow", nameAr: "أصفر", hex: "#f59e0b", rgb: "rgb(245, 158, 11)" },
  { name: "Purple", nameAr: "بنفسجي", hex: "#8b5cf6", rgb: "rgb(139, 92, 246)" },
  { name: "Orange", nameAr: "برتقالي", hex: "#f97316", rgb: "rgb(249, 115, 22)" },
  { name: "Pink", nameAr: "وردي", hex: "#ec4899", rgb: "rgb(236, 72, 153)" },
  { name: "Teal", nameAr: "أزرق مخضر", hex: "#14b8a6", rgb: "rgb(20, 184, 166)" },
  { name: "Brown", nameAr: "بني", hex: "#a3a3a3", rgb: "rgb(163, 163, 163)" },
  { name: "Black", nameAr: "أسود", hex: "#1f2937", rgb: "rgb(31, 41, 55)" },
];

export function ColorGame({ isRTL, onGameComplete, onScoreUpdate, onLivesUpdate, onLevelUpdate }: GameProps) {
  const [currentChallenge, setCurrentChallenge] = useState<ColorChallenge | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong' | null; message: string }>({ type: null, message: '' });
  const [isAnswering, setIsAnswering] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  const generateChallenge = useCallback((difficulty: number): ColorChallenge => {
    const challengeTypes: ColorChallenge['type'][] = ['name-to-color', 'color-to-name'];
    if (difficulty > 2) challengeTypes.push('mix-colors');
    
    const type = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
    const targetColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Generate wrong options
    const wrongOptions = colors
      .filter(c => c.hex !== targetColor.hex)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const options = [targetColor, ...wrongOptions].sort(() => Math.random() - 0.5);

    return {
      targetColor,
      options,
      type
    };
  }, []);

  const handleAnswer = useCallback(async (selectedColor: typeof colors[0]) => {
    if (isAnswering || !currentChallenge) return;
    
    setIsAnswering(true);
    
    const isCorrect = selectedColor.hex === currentChallenge.targetColor.hex;
    
    if (isCorrect) {
      const points = 15 + (streak * 3) + (level * 5);
      setScore(prev => {
        const newScore = prev + points;
        onScoreUpdate(newScore);
        return newScore;
      });
      setStreak(prev => prev + 1);
      setFeedback({
        type: 'correct',
        message: isRTL ? `رائع! +${points} نقطة` : `Great! +${points} points`
      });
      
      if ((questionsAnswered + 1) % 4 === 0) {
        setLevel(prev => {
          const newLevel = prev + 1;
          onLevelUpdate(newLevel);
          return newLevel;
        });
      }
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      onLivesUpdate(newLives);
      setStreak(0);
      setFeedback({
        type: 'wrong',
        message: isRTL 
          ? `الإجابة الصحيحة هي ${currentChallenge.targetColor.nameAr}` 
          : `Correct answer was ${currentChallenge.targetColor.name}`
      });
      
      if (newLives <= 0) {
        setTimeout(() => {
          onGameComplete({
            score,
            correct: questionsAnswered - (3 - newLives),
            total: questionsAnswered + 1,
            timeSpent: Date.now(),
            level
          });
        }, 2000);
        return;
      }
    }

    setQuestionsAnswered(prev => prev + 1);
    
    setTimeout(() => {
      setFeedback({ type: null, message: '' });
      setCurrentChallenge(generateChallenge(level));
      setIsAnswering(false);
    }, 1500);
  }, [isAnswering, currentChallenge, streak, level, questionsAnswered, lives, score, isRTL, onScoreUpdate, onLevelUpdate, onLivesUpdate, onGameComplete, generateChallenge]);

  const renderChallenge = useCallback(() => {
    if (!currentChallenge) return null;

    switch (currentChallenge.type) {
      case 'name-to-color':
        return (
          <div className="space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="card-fun text-center bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200"
            >
              <Palette className="w-12 h-12 mx-auto mb-4 text-purple-500" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {isRTL 
                  ? `اختر اللون: ${currentChallenge.targetColor.nameAr}`
                  : `Choose the color: ${currentChallenge.targetColor.name}`
                }
              </h3>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              {currentChallenge.options.map((option, index) => (
                <motion.div
                  key={option.hex}
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.1, type: "spring" }}
                >
                  <Button
                    onClick={() => handleAnswer(option)}
                    disabled={isAnswering}
                    className="w-full h-24 p-0 overflow-hidden border-4 border-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                    style={{ backgroundColor: option.hex }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="bg-white/90 px-3 py-1 rounded-full text-gray-800 font-bold shadow-sm">
                        {isRTL ? option.nameAr : option.name}
                      </span>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'color-to-name':
        return (
          <div className="space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="card-fun text-center"
            >
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {isRTL ? "ما اسم هذا اللون؟" : "What is the name of this color?"}
              </h3>
              <div 
                className="w-32 h-32 mx-auto rounded-full border-4 border-white shadow-lg"
                style={{ backgroundColor: currentChallenge.targetColor.hex }}
              />
            </motion.div>

            <div className="grid grid-cols-1 gap-3">
              {currentChallenge.options.map((option, index) => (
                <motion.div
                  key={option.hex}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    onClick={() => handleAnswer(option)}
                    disabled={isAnswering}
                    className="w-full h-14 text-lg font-bold bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 hover:border-purple-400 transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    {isRTL ? option.nameAr : option.name}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  }, [currentChallenge, isRTL, isAnswering, handleAnswer]);

  // Initialize first challenge
  useEffect(() => {
    if (!currentChallenge) {
      setCurrentChallenge(generateChallenge(1));
    }
  }, [currentChallenge, generateChallenge]);

  if (!currentChallenge) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-6xl animate-pulse">🎨</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Game Stats */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full" />
          <span className="font-bold text-orange-600">{score}</span>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse" />
          <span className="font-bold text-purple-600">{streak}</span>
        </div>
        <div className="flex items-center space-x-1 rtl:space-x-reverse">
          {[...Array(3)].map((_, i) => (
            <span
              key={i}
              className={`text-xl ${i < lives ? 'opacity-100' : 'opacity-20'}`}
            >
              💖
            </span>
          ))}
        </div>
      </div>

      {/* Challenge Content */}
      {renderChallenge()}

      {/* Feedback Display */}
      <AnimatePresence>
        {feedback.type && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={`card-fun text-center ${
              feedback.type === 'correct' 
                ? 'bg-green-50 border-2 border-green-200' 
                : 'bg-red-50 border-2 border-red-200'
            }`}
          >
            <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
              {feedback.type === 'correct' ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : (
                <XCircle className="w-8 h-8 text-red-500" />
              )}
              <p className={`font-bold text-lg ${
                feedback.type === 'correct' ? 'text-green-700' : 'text-red-700'
              }`}>
                {feedback.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{isRTL ? "المستوى" : "Level"} {level}</span>
          <span>{isRTL ? "الأسئلة" : "Questions"}: {questionsAnswered}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${((questionsAnswered % 4) / 4) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}