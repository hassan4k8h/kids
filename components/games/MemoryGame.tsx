import { useState, useEffect, useCallback } from "react";
import { Button } from "../ui/button";
import { GameProps } from "./GameEngine";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Star, Trophy, Crown, Zap, RotateCcw } from "lucide-react";

interface MemoryCard {
  id: string;
  emoji: string;
  category: string;
  isFlipped: boolean;
  isMatched: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface MemoryChallenge {
  type: 'card-matching' | 'sequence-memory' | 'pattern-memory' | 'color-sequence' | 'sound-sequence';
  cards: MemoryCard[];
  gridSize: number;
  targetSequence?: string[];
  level: number;
  stars: number;
  timeLimit?: number;
}

// قاعدة بيانات شاملة للرموز
const memoryDatabase = {
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐯', '🦁', '🐸', '🐵', '🐔', '🐧', '🐦', '🦆', '🦅', '🦉', '🐺', '🐗'],
  food: ['🍎', '🍌', '🍇', '🍓', '🍑', '🍒', '🥭', '🍍', '🥥', '🥝', '🍅', '🥕', '🌽', '🥒', '🥬', '🥦', '🍆', '🥔', '🧄', '🧅'],
  objects: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏓', '🏸', '🥍', '🏑', '🏒', '🥅', '⛳', '🪀', '🪁', '🎯', '🎮', '🕹️', '🎲', '♠️'],
  nature: ['🌸', '🌺', '🌻', '🌷', '🌹', '🌿', '🍀', '🍃', '🌾', '🌵', '🌲', '🌳', '🌴', '🌱', '🌰', '🍄', '🌊', '💧', '🔥', '❄️'],
  transport: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🚁', '✈️'],
  space: ['🌞', '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '⭐', '🌟', '💫', '✨', '☄️', '🪐', '🌍', '🌎', '🌏', '🌌'],
  emotions: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥲', '☺️', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗'],
  shapes: ['⚪', '⚫', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤', '🔺', '🔻', '🔶', '🔷', '🔸', '🔹', '🔘', '⭕', '❌', '✅', '❎']
};

export function MemoryGame({ isRTL, onGameComplete, onScoreUpdate, onLivesUpdate, onLevelUpdate }: GameProps) {
  const [currentChallenge, setCurrentChallenge] = useState<MemoryChallenge | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong' | null; message: string }>({ type: null, message: '' });
  const [isAnswering, setIsAnswering] = useState(false);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [perfectStreak, setPerfectStreak] = useState(0);
  const [showingSequence, setShowingSequence] = useState(false);
  const [playerSequence, setPlayerSequence] = useState<string[]>([]);
  const [achievementUnlocked, setAchievementUnlocked] = useState<string | null>(null);

  // إعدادات الصعوبة حسب المستوى
  const getDifficultySettings = useCallback((level: number) => {
    if (level <= 30) return { 
      gridSize: 3, // 3x3 = 9 كروت (4-5 أزواج)
      pairs: 4,
      timeLimit: 60,
      challengeTypes: ['card-matching'],
      categories: ['animals', 'food'],
      cardSize: 'large' // أحجام كبيرة للمبتدئين
    };
    if (level <= 60) return { 
      gridSize: 4, // 4x4 = 16 كروت (8 أزواج)
      pairs: 6,
      timeLimit: 90,
      challengeTypes: ['card-matching', 'sequence-memory'],
      categories: ['animals', 'food', 'objects'],
      cardSize: 'large'
    };
    if (level <= 90) return { 
      gridSize: 4, // 4x4 مع المزيد من الأزواج
      pairs: 8,
      timeLimit: 120,
      challengeTypes: ['card-matching', 'sequence-memory', 'pattern-memory'],
      categories: ['animals', 'food', 'objects', 'nature'],
      cardSize: 'medium'
    };
    return { 
      gridSize: 5, // 5x5 للمستويات المتقدمة
      pairs: 10,
      timeLimit: 150,
      challengeTypes: ['card-matching', 'sequence-memory', 'pattern-memory', 'color-sequence'],
      categories: Object.keys(memoryDatabase),
      cardSize: 'medium'
    };
  }, []);

  // إنشاء تحدي جديد
  const generateChallenge = useCallback((currentLevel: number): MemoryChallenge => {
    const { gridSize, pairs, timeLimit, challengeTypes, categories, cardSize } = getDifficultySettings(currentLevel);
    const challengeType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)] as MemoryChallenge['type'];
    
    const getStarRating = (level: number) => {
      if (level % 30 === 0) return 3;
      if (level % 15 === 0) return 2;
      return 1;
    };

    switch (challengeType) {
      case 'card-matching': {
        // اختيار رموز عشوائية من فئات مختلفة
        const allEmojis = categories.flatMap(cat => memoryDatabase[cat as keyof typeof memoryDatabase]);
        const selectedEmojis = allEmojis
          .sort(() => Math.random() - 0.5)
          .slice(0, pairs);

        // إنشاء أزواج الكروت
        const cards: MemoryCard[] = [];
        selectedEmojis.forEach((emoji, index) => {
          cards.push({
            id: `${emoji}-1`,
            emoji,
            category: categories[index % categories.length],
            isFlipped: false,
            isMatched: false,
            difficulty: currentLevel <= 30 ? 'easy' : currentLevel <= 60 ? 'medium' : 'hard'
          });
          cards.push({
            id: `${emoji}-2`,
            emoji,
            category: categories[index % categories.length],
            isFlipped: false,
            isMatched: false,
            difficulty: currentLevel <= 30 ? 'easy' : currentLevel <= 60 ? 'medium' : 'hard'
          });
        });

        // خلط الكروت
        const shuffledCards = cards.sort(() => Math.random() - 0.5);

        // إضافة كروت فارغة إذا لزم الأمر لملء الشبكة
        while (shuffledCards.length < gridSize * gridSize) {
          shuffledCards.push({
            id: `empty-${shuffledCards.length}`,
            emoji: '',
            category: 'empty',
            isFlipped: false,
            isMatched: true,
            difficulty: 'easy'
          });
        }

        return {
          type: challengeType,
          cards: shuffledCards,
          gridSize,
          level: currentLevel,
          stars: getStarRating(currentLevel),
          timeLimit
        };
      }

      case 'sequence-memory': {
        const sequenceLength = Math.min(3 + Math.floor(currentLevel / 20), 8);
        const category = categories[Math.floor(Math.random() * categories.length)];
        const categoryEmojis = memoryDatabase[category as keyof typeof memoryDatabase];
        const targetSequence = Array.from({ length: sequenceLength }, () => 
          categoryEmojis[Math.floor(Math.random() * categoryEmojis.length)]
        );

        return {
          type: challengeType,
          cards: [],
          gridSize: 0,
          targetSequence,
          level: currentLevel,
          stars: getStarRating(currentLevel),
          timeLimit: timeLimit / 2
        };
      }

      default:
        return generateChallenge(currentLevel);
    }
  }, [getDifficultySettings]);

  // معالجة نقرة الكارت
  const handleCardClick = useCallback((cardId: string) => {
    if (isAnswering || !currentChallenge || showingSequence) return;
    
    const card = currentChallenge.cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched || card.emoji === '') return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);
    setMoves(prev => prev + 1);

    // تحديث حالة الكارت
    const updatedCards = currentChallenge.cards.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    );

    setCurrentChallenge(prev => prev ? { ...prev, cards: updatedCards } : null);

    if (newFlippedCards.length === 2) {
      const [firstCardId, secondCardId] = newFlippedCards;
      const firstCard = updatedCards.find(c => c.id === firstCardId);
      const secondCard = updatedCards.find(c => c.id === secondCardId);

      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        // مطابقة صحيحة
        setTimeout(() => {
          const matchedCards = updatedCards.map(c => 
            c.id === firstCardId || c.id === secondCardId 
              ? { ...c, isMatched: true } 
              : c
          );
          
          setCurrentChallenge(prev => prev ? { ...prev, cards: matchedCards } : null);
          setMatchedPairs(prev => prev + 1);
          setFlippedCards([]);

          // تحقق من اكتمال اللعبة
          const totalPairs = matchedCards.filter(c => c.emoji !== '' && !c.isMatched).length / 2;
          if (totalPairs === 0) {
            handleLevelComplete();
          }
        }, 1000);
      } else {
        // مطابقة خاطئة
        setTimeout(() => {
          const resetCards = updatedCards.map(c => 
            c.id === firstCardId || c.id === secondCardId 
              ? { ...c, isFlipped: false } 
              : c
          );
          
          setCurrentChallenge(prev => prev ? { ...prev, cards: resetCards } : null);
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [isAnswering, currentChallenge, flippedCards, showingSequence, matchedPairs]);

  // معالجة اكتمال المستوى
  const handleLevelComplete = useCallback(() => {
    setIsAnswering(true);
    
    const basePoints = 100;
    const timeBonus = timeLeft ? Math.max(0, timeLeft * 2) : 0;
    const moveBonus = Math.max(0, 50 - moves);
    const levelBonus = level * 10;
    const points = basePoints + timeBonus + moveBonus + levelBonus;
    
    setScore(prev => {
      const newScore = prev + points;
      onScoreUpdate(newScore);
      return newScore;
    });

    setPerfectStreak(prev => prev + 1);
    
    setFeedback({
      type: 'correct',
      message: isRTL ? `ممتاز! +${points} نقطة!` : `Excellent! +${points} points!`
    });
    
    // إنجازات خاصة
    if (moves <= matchedPairs * 2) {
      setAchievementUnlocked(isRTL ? "ذاكرة مثالية!" : "Perfect Memory!");
    }
    
    if ((questionsAnswered + 1) % 3 === 0) {
      const newLevel = Math.min(level + 1, 120);
      setLevel(newLevel);
      onLevelUpdate(newLevel);
    }

    setQuestionsAnswered(prev => prev + 1);
    
    setTimeout(() => {
      setFeedback({ type: null, message: '' });
      setAchievementUnlocked(null);
      resetGame();
      setCurrentChallenge(generateChallenge(level));
      setIsAnswering(false);
    }, 3000);
  }, [timeLeft, moves, level, matchedPairs, score, perfectStreak, questionsAnswered, isRTL, onScoreUpdate, onLevelUpdate, generateChallenge]);

  // إعادة تعيين اللعبة
  const resetGame = useCallback(() => {
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setTimeLeft(null);
    setGameStarted(false);
    setShowingSequence(false);
    setPlayerSequence([]);
  }, []);

  // عداد الوقت
  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && gameStarted && !isAnswering) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev! - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      // انتهى الوقت
      const newLives = lives - 1;
      setLives(newLives);
      onLivesUpdate(newLives);
      
      setFeedback({
        type: 'wrong',
        message: isRTL ? "انتهى الوقت!" : "Time's up!"
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

      setTimeout(() => {
        setFeedback({ type: null, message: '' });
        resetGame();
        setCurrentChallenge(generateChallenge(level));
      }, 2000);
    }
  }, [timeLeft, gameStarted, isAnswering, lives, onLivesUpdate, isRTL, onGameComplete, score, questionsAnswered, level, resetGame, generateChallenge]);

  // بدء اللعبة
  const startGame = useCallback(() => {
    if (currentChallenge?.timeLimit) {
      setTimeLeft(currentChallenge.timeLimit);
    }
    setGameStarted(true);
  }, [currentChallenge]);

  // عرض الكارت بحجم كبير
  const renderCard = useCallback((card: MemoryCard, index: number) => {
    const { cardSize } = getDifficultySettings(level);
    const size = cardSize === 'large' ? 'w-20 h-20' : 'w-16 h-16';
    const textSize = cardSize === 'large' ? 'text-4xl' : 'text-3xl';
    
    if (card.emoji === '') {
      return <div key={index} className={`${size} invisible`} />;
    }

    return (
      <motion.div
        key={card.id}
        initial={{ scale: 0, rotateY: 180 }}
        animate={{ scale: 1, rotateY: card.isFlipped || card.isMatched ? 0 : 180 }}
        transition={{ duration: 0.6, type: "spring" }}
        whileHover={{ scale: card.isFlipped || card.isMatched ? 1 : 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`${size} cursor-pointer perspective-1000`}
        onClick={() => handleCardClick(card.id)}
      >
        <div className="relative w-full h-full preserve-3d transition-transform duration-600">
          {/* وجه الكارت الخلفي */}
          <div className="absolute inset-0 backface-hidden rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 border-4 border-white shadow-lg flex items-center justify-center rotate-y-180">
            <div className="text-2xl text-white">❓</div>
          </div>
          
          {/* وجه الكارت الأمامي */}
          <div className={`absolute inset-0 backface-hidden rounded-2xl border-4 shadow-lg flex items-center justify-center ${
            card.isMatched 
              ? 'bg-gradient-to-br from-green-100 to-green-200 border-green-400' 
              : 'bg-gradient-to-br from-white to-gray-50 border-blue-400'
          }`}>
            <span className={`${textSize} ${card.isMatched ? 'opacity-75' : ''}`}>
              {card.emoji}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }, [level, getDifficultySettings, handleCardClick]);

  // عرض لعبة تسلسل الذاكرة
  const renderSequenceMemory = useCallback(() => {
    if (!currentChallenge || !currentChallenge.targetSequence) return null;

    return (
      <div className="space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card-fun text-center bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200"
        >
          <div className="text-4xl mb-4">🧠</div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            {isRTL ? "احفظ التسلسل" : "Remember the Sequence"}
          </h3>
          
          {showingSequence ? (
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                {isRTL ? "احفظ هذا التسلسل..." : "Remember this sequence..."}
              </p>
              <div className="flex justify-center space-x-2 rtl:space-x-reverse">
                {currentChallenge.targetSequence.map((emoji, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.5 }}
                    className="w-16 h-16 bg-white rounded-2xl border-2 border-purple-300 flex items-center justify-center text-3xl shadow-lg"
                  >
                    {emoji}
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">
                {isRTL ? "اكتب التسلسل بالترتيب الصحيح:" : "Type the sequence in correct order:"}
              </p>
              
              {/* عرض تسلسل اللاعب */}
              <div className="flex justify-center space-x-2 rtl:space-x-reverse mb-4">
                {playerSequence.map((emoji, index) => (
                  <div
                    key={index}
                    className="w-12 h-12 bg-blue-100 rounded-xl border-2 border-blue-300 flex items-center justify-center text-2xl"
                  >
                    {emoji}
                  </div>
                ))}
              </div>

              {/* أزرار الرموز */}
              <div className="grid grid-cols-4 gap-2">
                {Array.from(new Set(currentChallenge.targetSequence)).map((emoji, index) => (
                  <Button
                    key={index}
                    onClick={() => {
                      const newSequence = [...playerSequence, emoji];
                      setPlayerSequence(newSequence);
                      
                      if (newSequence.length === currentChallenge.targetSequence!.length) {
                        // تحقق من الإجابة
                        const isCorrect = newSequence.every((e, i) => e === currentChallenge.targetSequence![i]);
                        if (isCorrect) {
                          handleLevelComplete();
                        } else {
                          setFeedback({
                            type: 'wrong',
                            message: isRTL ? "تسلسل خاطئ! حاول مرة أخرى" : "Wrong sequence! Try again"
                          });
                          setTimeout(() => {
                            setPlayerSequence([]);
                            setFeedback({ type: null, message: '' });
                          }, 2000);
                        }
                      }
                    }}
                    className="w-12 h-12 bg-white hover:bg-blue-50 border-2 border-blue-200 rounded-xl text-2xl"
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
              
              <Button
                onClick={() => setPlayerSequence([])}
                variant="outline"
                className="mt-4"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {isRTL ? "إعادة تعيين" : "Reset"}
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }, [currentChallenge, showingSequence, playerSequence, isRTL, handleLevelComplete]);

  // تهيئة التحدي الأول
  useEffect(() => {
    if (!currentChallenge) {
      setCurrentChallenge(generateChallenge(1));
    }
  }, [currentChallenge, generateChallenge]);

  // بدء عرض التسلسل
  useEffect(() => {
    if (currentChallenge?.type === 'sequence-memory' && !gameStarted) {
      setShowingSequence(true);
      setTimeout(() => {
        setShowingSequence(false);
        startGame();
      }, currentChallenge.targetSequence!.length * 1000 + 2000);
    }
  }, [currentChallenge, gameStarted, startGame]);

  if (!currentChallenge) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-6xl animate-pulse">🧠</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* إحصائيات اللعبة */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="font-bold text-yellow-600">{score}</span>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Crown className="w-5 h-5 text-purple-500" />
            <span className="font-bold text-purple-600">{level}/120</span>
          </div>
          <div className="flex items-center space-x-1 rtl:space-x-reverse">
            {[...Array(3)].map((_, i) => (
              <span
                key={i}
                className={`text-xl transition-all duration-300 ${
                  i < lives ? 'opacity-100 scale-110' : 'opacity-20 scale-90'
                }`}
              >
                🧠
              </span>
            ))}
          </div>
        </div>

        {/* معلومات اللعبة */}
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{isRTL ? "الحركات" : "Moves"}: {moves}</span>
          {timeLeft !== null && (
            <span className={timeLeft <= 10 ? 'text-red-500 font-bold' : ''}>
              ⏰ {timeLeft}s
            </span>
          )}
          <span>{isRTL ? "الأزواج" : "Pairs"}: {matchedPairs}</span>
        </div>

        {/* شريط التقدم */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(level / 120) * 100}%` }}
          />
        </div>
      </div>

      {/* محتوى اللعبة */}
      {currentChallenge.type === 'sequence-memory' ? (
        renderSequenceMemory()
      ) : (
        <div className="space-y-6">
          {/* زر البداية */}
          {!gameStarted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <Button
                onClick={startGame}
                className="btn-fun bg-purple-500 hover:bg-purple-600 text-white text-lg px-8 py-4"
              >
                <Zap className="w-5 h-5 mr-2" />
                {isRTL ? "ابدأ اللعبة!" : "Start Game!"}
              </Button>
            </motion.div>
          )}

          {/* شبكة الكروت */}
          {gameStarted && currentChallenge.cards.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl"
            >
              <div 
                className="grid gap-3 justify-center"
                style={{ 
                  gridTemplateColumns: `repeat(${currentChallenge.gridSize}, 1fr)`,
                  maxWidth: '400px',
                  margin: '0 auto'
                }}
              >
                {currentChallenge.cards.map((card, index) => renderCard(card, index))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* عرض الإنجازات */}
      <AnimatePresence>
        {achievementUnlocked && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
          >
            <div className="bg-white rounded-3xl p-8 text-center max-w-sm mx-4 shadow-2xl">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {isRTL ? "إنجاز جديد!" : "New Achievement!"}
              </h3>
              <p className="text-gray-600">{achievementUnlocked}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* عرض التغذية الراجعة */}
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
    </div>
  );
}