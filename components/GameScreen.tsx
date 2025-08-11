import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { ArrowLeft, ArrowRight, Pause, Play, Home, RotateCcw, Trophy, Clock } from "lucide-react";
import { GameEngine, GameStats } from "./games/GameEngine";
import PlayerService from "../services/PlayerService";
import { motion, AnimatePresence } from "framer-motion";
import { formatNumber, formatPercent, formatTimeMMSS, formatFraction } from "../utils/locale.ts";

interface GameScreenProps {
  gameId: string;
  gameName: string;
  gameNameAr: string;
  onBack: () => void;
  onHome: () => void;
  isRTL: boolean;
  userId: string;
  playerId: string;
}

export function GameScreen({ gameId, gameName, gameNameAr, onBack, onHome, isRTL, userId, playerId }: GameScreenProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isPaused, setIsPaused] = useState(false);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameResult, setGameResult] = useState<GameStats | null>(null);
  const [showCountdown, setShowCountdown] = useState(true);
  const [countdown, setCountdown] = useState(3);

  // Countdown before game starts
  useEffect(() => {
    if (showCountdown && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showCountdown && countdown === 0) {
      setShowCountdown(false);
      setGameStarted(true);
    }
  }, [showCountdown, countdown]);

  // Game timer
  useEffect(() => {
    if (gameStarted && !isPaused && !gameCompleted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameCompleted) {
      handleGameComplete({
        score,
        correct: 0,
        total: 1,
        timeSpent: 300000,
        level
      });
    }
  }, [timeLeft, isPaused, gameStarted, gameCompleted]);

  const handleGameComplete = async (result: GameStats) => {
    setGameResult(result);
    setGameCompleted(true);

    try {
      // حفظ نتيجة اللعبة والتقدم في Supabase
      await PlayerService.updatePlayerProgress(playerId, gameId, result.score, userId, level);
    } catch (err) {
      console.error('Failed to persist game progress:', err);
    }
  };

  const resetGame = () => {
    setScore(0);
    setTimeLeft(300);
    setLevel(1);
    setLives(3);
    setIsPaused(false);
    setGameStarted(false);
    setGameCompleted(false);
    setGameResult(null);
    setShowCountdown(true);
    setCountdown(3);
  };

  const formatTime = (seconds: number) => formatTimeMMSS(seconds, isRTL);

  if (showCountdown) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center ${isRTL ? 'rtl' : ''}`}>
        <motion.div
          key={countdown}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="text-center"
        >
          {countdown > 0 ? (
            <div className="text-9xl font-bold text-white drop-shadow-lg">
              {countdown}
            </div>
          ) : (
            <div className="text-6xl font-bold text-white drop-shadow-lg animate-pulse">
              {isRTL ? "ابدأ!" : "GO!"}
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  if (gameCompleted && gameResult) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-yellow-200 via-orange-200 to-red-200 ${isRTL ? 'rtl' : ''}`}>
        <div className="container-responsive safe-area-padding">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pt-4">
            <Button
              variant="ghost"
              onClick={onHome}
              className="p-3 hover:bg-white/20 text-gray-700"
            >
              <Home className="w-6 h-6" />
            </Button>
            <h2 className="font-bold text-2xl text-gray-800">
              {isRTL ? "انتهت اللعبة!" : "Game Over!"}
            </h2>
            <div className="w-12"></div>
          </div>

          {/* Results */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-6"
          >
            {/* Trophy */}
            <div className="text-center">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-8xl mb-4"
              >
                🏆
              </motion.div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">
                {gameResult.score > 100 
                  ? (isRTL ? "أداء ممتاز!" : "Excellent Performance!")
                  : gameResult.score > 50
                  ? (isRTL ? "أداء جيد!" : "Good Job!")
                  : (isRTL ? "حاول مرة أخرى!" : "Try Again!")
                }
              </h3>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="card-fun text-center bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
              <div className="text-2xl font-bold text-yellow-700">{formatNumber(gameResult.score, isRTL)}</div>
                <div className="text-sm text-yellow-600">{isRTL ? "النقاط" : "Score"}</div>
              </div>
              
              <div className="card-fun text-center bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200">
                <div className="text-2xl mb-2">✅</div>
                <div className="text-2xl font-bold text-green-700">{formatFraction(gameResult.correct, gameResult.total, isRTL)}</div>
                <div className="text-sm text-green-600">{isRTL ? "صحيح" : "Correct"}</div>
              </div>
            </div>

            {/* Achievement badges */}
            <div className="space-y-3">
              {gameResult.score > 200 && (
                <div className="card-fun bg-gradient-to-r from-purple-400 to-pink-400 text-white text-center">
                  <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                    <span className="text-2xl">🌟</span>
                    <span className="font-bold">{isRTL ? "نجم ذهبي - أداء استثنائي!" : "Gold Star - Outstanding!"}</span>
                  </div>
                </div>
              )}
              
              {gameResult.score > 100 && (
                <div className="card-fun bg-gradient-to-r from-blue-400 to-teal-400 text-white text-center">
                  <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                    <span className="text-2xl">🎯</span>
                    <span className="font-bold">{isRTL ? "خبير في اللعبة!" : "Game Expert!"}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={resetGame}
                className="w-full btn-fun bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                {isRTL ? "العب مرة أخرى" : "Play Again"}
              </Button>
              
              <Button
                onClick={onHome}
                variant="outline"
                className="w-full btn-fun border-2 border-gray-300 hover:border-gray-400"
              >
                <Home className="w-5 h-5 mr-2" />
                {isRTL ? "الصفحة الرئيسية" : "Home"}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 ${isRTL ? 'rtl' : ''}`}>
      <div className="container-responsive safe-area-padding">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm shadow-sm rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-xl"
            >
              {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            </Button>
            
            <h2 className="font-bold text-lg text-gray-800 text-center">
              {isRTL ? gameNameAr : gameName}
            </h2>
            
            <Button
              variant="ghost"
              onClick={onHome}
              className="p-2 hover:bg-gray-100 rounded-xl"
            >
              <Home className="w-5 h-5" />
            </Button>
          </div>

          {/* Game stats */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-yellow-50 rounded-xl p-3 text-center border border-yellow-200">
              <div className="text-yellow-600 font-bold text-lg">{formatNumber(score, isRTL)}</div>
              <div className="text-xs text-yellow-700">{isRTL ? "النقاط" : "Score"}</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-200">
              <div className="text-blue-600 font-bold text-lg">{formatNumber(level, isRTL)}</div>
              <div className="text-xs text-blue-700">{isRTL ? "المستوى" : "Level"}</div>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center border border-red-200">
              <div className="text-red-600 font-bold text-lg">{"❤️".repeat(lives)}</div>
              <div className="text-xs text-red-700">{isRTL ? "الحياة" : "Lives"}</div>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center border border-green-200">
              <div className="text-green-600 font-bold text-sm flex items-center justify-center space-x-1 rtl:space-x-reverse">
                <Clock className="w-3 h-3" />
                <span>{formatTime(timeLeft)}</span>
              </div>
              <div className="text-xs text-green-700">{isRTL ? "الوقت" : "Time"}</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <Progress value={(300 - timeLeft) / 300 * 100} className="h-2" />
          </div>
        </div>

        {/* Game Area */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 min-h-[500px] shadow-lg border border-white/20">
          <GameEngine
            gameId={gameId}
            isRTL={isRTL}
            onGameComplete={handleGameComplete}
            onScoreUpdate={setScore}
            onLivesUpdate={setLives}
            onLevelUpdate={setLevel}
          />
        </div>

        {/* Game controls */}
        <div className="flex justify-center space-x-4 rtl:space-x-reverse mt-6">
          <Button
            onClick={() => setIsPaused(!isPaused)}
            className="btn-fun bg-white text-purple-600 hover:bg-gray-50 shadow-lg border border-purple-200"
          >
            {isPaused ? <Play className="w-5 h-5 mr-2" /> : <Pause className="w-5 h-5 mr-2" />}
            {isPaused ? (isRTL ? "استئناف" : "Resume") : (isRTL ? "إيقاف" : "Pause")}
          </Button>
          <Button
            onClick={resetGame}
            className="btn-fun bg-white text-red-600 hover:bg-gray-50 shadow-lg border border-red-200"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            {isRTL ? "إعادة تشغيل" : "Restart"}
          </Button>
        </div>
      </div>
    </div>
  );
}