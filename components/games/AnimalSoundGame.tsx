import { useState, useEffect, useCallback } from "react";
import { Button } from "../ui/button";
import { GameProps } from "./GameEngine";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Volume2, VolumeX, Star, Trophy, Crown, Play, Pause } from "lucide-react";
import { audioService } from "../../services/AudioService";
import { formatNumber } from "../../utils/locale.ts";
import { levelIndex, cyclePick, rotateArray, uniqueIndex } from "../../utils/deterministic";

interface AnimalChallenge {
  type: 'sound-to-animal' | 'animal-to-sound' | 'name-recognition' | 'category-match' | 'sound-sequence' | 'mixed-challenge';
  targetAnimal: {
    id: string;
    name: string;
    nameAr: string;
    emoji: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  options: Array<{
    id: string;
    name: string;
    nameAr: string;
    emoji: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
  question: string;
  questionAr: string;
  correctAnswer: string;
  level: number;
  stars: number;
  soundPlayed: boolean;
  hint?: string;
  hintAr?: string;
}

// قاعدة بيانات شاملة للحيوانات مع الرموز التعبيرية
const animalDatabase = [
  // الحيوانات الأليفة (المستويات 1-20)
  { id: 'cat', name: 'Cat', nameAr: 'قطة', emoji: '🐱', category: 'pets', difficulty: 'easy' as const },
  { id: 'dog', name: 'Dog', nameAr: 'كلب', emoji: '🐶', category: 'pets', difficulty: 'easy' as const },
  { id: 'bird', name: 'Bird', nameAr: 'عصفور', emoji: '🐦', category: 'pets', difficulty: 'easy' as const },
  { id: 'rabbit', name: 'Rabbit', nameAr: 'أرنب', emoji: '🐰', category: 'pets', difficulty: 'easy' as const },
  { id: 'hamster', name: 'Hamster', nameAr: 'همستر', emoji: '🐹', category: 'pets', difficulty: 'medium' as const },

  // حيوانات المزرعة (المستويات 21-50)
  { id: 'cow', name: 'Cow', nameAr: 'بقرة', emoji: '🐄', category: 'farm', difficulty: 'easy' as const },
  { id: 'horse', name: 'Horse', nameAr: 'حصان', emoji: '🐴', category: 'farm', difficulty: 'easy' as const },
  { id: 'sheep', name: 'Sheep', nameAr: 'خروف', emoji: '🐑', category: 'farm', difficulty: 'easy' as const },
  { id: 'goat', name: 'Goat', nameAr: 'ماعز', emoji: '🐐', category: 'farm', difficulty: 'medium' as const },
  { id: 'pig', name: 'Pig', nameAr: 'خنزير', emoji: '🐷', category: 'farm', difficulty: 'medium' as const },
  { id: 'chicken', name: 'Chicken', nameAr: 'دجاجة', emoji: '🐔', category: 'farm', difficulty: 'easy' as const },
  { id: 'duck', name: 'Duck', nameAr: 'بطة', emoji: '🦆', category: 'farm', difficulty: 'easy' as const },
  { id: 'turkey', name: 'Turkey', nameAr: 'ديك رومي', emoji: '🦃', category: 'farm', difficulty: 'medium' as const },
  { id: 'rooster', name: 'Rooster', nameAr: 'ديك', emoji: '🐓', category: 'farm', difficulty: 'medium' as const },

  // الحيوانات البرية (المستويات 51-80)
  { id: 'lion', name: 'Lion', nameAr: 'أسد', emoji: '🦁', category: 'wild', difficulty: 'medium' as const },
  { id: 'tiger', name: 'Tiger', nameAr: 'نمر', emoji: '🐅', category: 'wild', difficulty: 'medium' as const },
  { id: 'elephant', name: 'Elephant', nameAr: 'فيل', emoji: '🐘', category: 'wild', difficulty: 'medium' as const },
  { id: 'wolf', name: 'Wolf', nameAr: 'ذئب', emoji: '🐺', category: 'wild', difficulty: 'hard' as const },
  { id: 'bear', name: 'Bear', nameAr: 'دب', emoji: '🐻', category: 'wild', difficulty: 'medium' as const },
  { id: 'monkey', name: 'Monkey', nameAr: 'قرد', emoji: '🐵', category: 'wild', difficulty: 'medium' as const },
  { id: 'zebra', name: 'Zebra', nameAr: 'حمار وحشي', emoji: '🦓', category: 'wild', difficulty: 'medium' as const },
  { id: 'giraffe', name: 'Giraffe', nameAr: 'زرافة', emoji: '🦒', category: 'wild', difficulty: 'hard' as const },
  { id: 'hippo', name: 'Hippo', nameAr: 'فرس النهر', emoji: '🦛', category: 'wild', difficulty: 'hard' as const },
  { id: 'rhino', name: 'Rhino', nameAr: 'وحيد القرن', emoji: '🦏', category: 'wild', difficulty: 'hard' as const },

  // الطيور (المستويات 81-100)
  { id: 'owl', name: 'Owl', nameAr: 'بومة', emoji: '🦉', category: 'flying', difficulty: 'medium' as const },
  { id: 'eagle', name: 'Eagle', nameAr: 'نسر', emoji: '🦅', category: 'flying', difficulty: 'hard' as const },
  { id: 'parrot', name: 'Parrot', nameAr: 'ببغاء', emoji: '🦜', category: 'flying', difficulty: 'medium' as const },
  { id: 'penguin', name: 'Penguin', nameAr: 'بطريق', emoji: '🐧', category: 'flying', difficulty: 'medium' as const },
  { id: 'flamingo', name: 'Flamingo', nameAr: 'فلامنجو', emoji: '🦩', category: 'flying', difficulty: 'hard' as const },
  { id: 'peacock', name: 'Peacock', nameAr: 'طاووس', emoji: '🦚', category: 'flying', difficulty: 'hard' as const },

  // الحيوانات المائية (المستويات 101-120)
  { id: 'whale', name: 'Whale', nameAr: 'حوت', emoji: '🐋', category: 'marine', difficulty: 'hard' as const },
  { id: 'dolphin', name: 'Dolphin', nameAr: 'دولفين', emoji: '🐬', category: 'marine', difficulty: 'hard' as const },
  { id: 'seal', name: 'Seal', nameAr: 'فقمة', emoji: '🦭', category: 'marine', difficulty: 'hard' as const },
  { id: 'shark', name: 'Shark', nameAr: 'قرش', emoji: '🦈', category: 'marine', difficulty: 'hard' as const },
  { id: 'octopus', name: 'Octopus', nameAr: 'أخطبوط', emoji: '🐙', category: 'marine', difficulty: 'hard' as const },

  // الحشرات والزواحف (المستويات المتقدمة)
  { id: 'bee', name: 'Bee', nameAr: 'نحلة', emoji: '🐝', category: 'insects', difficulty: 'medium' as const },
  { id: 'butterfly', name: 'Butterfly', nameAr: 'فراشة', emoji: '🦋', category: 'insects', difficulty: 'easy' as const },
  { id: 'cricket', name: 'Cricket', nameAr: 'صرصور الليل', emoji: '🦗', category: 'insects', difficulty: 'hard' as const },
  { id: 'snake', name: 'Snake', nameAr: 'ثعبان', emoji: '🐍', category: 'reptiles', difficulty: 'hard' as const },
  { id: 'lizard', name: 'Lizard', nameAr: 'سحلية', emoji: '🦎', category: 'reptiles', difficulty: 'hard' as const },
  { id: 'turtle', name: 'Turtle', nameAr: 'سلحفاة', emoji: '🐢', category: 'reptiles', difficulty: 'medium' as const },
  { id: 'frog', name: 'Frog', nameAr: 'ضفدع', emoji: '🐸', category: 'amphibians', difficulty: 'medium' as const }
];

export function AnimalSoundGame({ isRTL, onGameComplete, onScoreUpdate, onLivesUpdate, onLevelUpdate, initialLevel }: GameProps) {
  const MAX_LEVEL = animalDatabase.length;
  const [currentChallenge, setCurrentChallenge] = useState<AnimalChallenge | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(initialLevel || 1);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong' | null; message: string }>({ type: null, message: '' });
  const [isAnswering, setIsAnswering] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());
  const [unlockedAnimals, setUnlockedAnimals] = useState<Set<string>>(new Set(['cat', 'dog', 'cow']));
  const [achievementUnlocked, setAchievementUnlocked] = useState<string | null>(null);
  const [perfectStreak, setPerfectStreak] = useState(0);
  const [flashingAnimal, setFlashingAnimal] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [autoPlayCount, setAutoPlayCount] = useState(0);

  // تحديد الحيوانات المتاحة حسب المستوى
  const getAvailableAnimals = useCallback((currentLevel: number) => {
    if (currentLevel <= 20) return animalDatabase.filter(a => a.category === 'pets');
    if (currentLevel <= 50) return animalDatabase.filter(a => ['pets', 'farm'].includes(a.category));
    if (currentLevel <= 80) return animalDatabase.filter(a => ['pets', 'farm', 'wild'].includes(a.category));
    if (currentLevel <= 100) return animalDatabase.filter(a => ['pets', 'farm', 'wild', 'flying'].includes(a.category));
    return animalDatabase; // جميع الحيوانات للمستويات 101-120
  }, []);

  // إعدادات الصعوبة حسب المستوى
  const getDifficultySettings = useCallback((level: number) => {
    // جميع المستويات تستخدم سؤال الصوت→الحيوان لضمان تشغيل الصوت فور فتح السؤال
    const optionsCount = level <= 40 ? 3 : 4;
    return {
      optionsCount,
      challengeTypes: ['sound-to-animal'],
      allowedDifficulties: ['easy', 'medium', 'hard'],
      autoPlaySound: Math.max(0, 2 - Math.floor(level / 40))
    };
  }, []);

  // إنشاء تحدي جديد
  const generateChallenge = useCallback((currentLevel: number): AnimalChallenge => {
    const availableAnimals = getAvailableAnimals(currentLevel);
    const { optionsCount, challengeTypes, allowedDifficulties } = getDifficultySettings(currentLevel);
    
    const filteredAnimals = availableAnimals.filter(animal => 
      allowedDifficulties.includes(animal.difficulty)
    );
    
    const challengeType = 'sound-to-animal' as AnimalChallenge['type'];
    
    // تصفية الأسئلة المستخدمة مؤخراً
    const unusedAnimals = filteredAnimals.filter(animal => 
      !usedQuestions.has(`${challengeType}-${animal.id}`)
    );
    
    if (unusedAnimals.length === 0) {
      setUsedQuestions(new Set());
      return generateChallenge(currentLevel);
    }

    const getStarRating = (level: number) => {
      if (level % 30 === 0) return 3;
      if (level % 15 === 0) return 2;
      return 1;
    };

    // ربط المستوى بحيوان فريد داخل المجموعة المتاحة
    const targetAnimal = unusedAnimals[(currentLevel - 1) % unusedAnimals.length];
    const pool = filteredAnimals.filter(a => a.id !== targetAnimal.id);
    const base = ((currentLevel - 1) * 3) % pool.length;
    const wrongAnimals = [
      pool[base % pool.length],
      pool[(base + 1) % pool.length],
      pool[(base + 2) % pool.length]
    ].slice(0, optionsCount - 1);
    
    const options = rotateArray([targetAnimal, ...wrongAnimals], currentLevel % optionsCount);

    switch (challengeType) {
      case 'sound-to-animal': {
        return {
          type: challengeType,
          targetAnimal,
          options,
          question: 'Which animal makes this sound?',
          questionAr: 'أي حيوان يصدر هذا الصوت؟',
          correctAnswer: targetAnimal.id,
          level: currentLevel,
          stars: getStarRating(currentLevel),
          soundPlayed: false,
          hint: 'Listen carefully to the sound pattern',
          hintAr: 'استمع بعناية لنمط الصوت'
        };
      }

      case 'animal-to-sound': {
        return {
          type: challengeType,
          targetAnimal,
          options,
          question: `What sound does a ${targetAnimal.name} make?`,
          questionAr: `ما الصوت الذي تصدره ${targetAnimal.nameAr}؟`,
          correctAnswer: targetAnimal.id,
          level: currentLevel,
          stars: getStarRating(currentLevel),
          soundPlayed: false,
          hint: `Think about the sound a ${targetAnimal.name} typically makes`,
          hintAr: `فكر في الصوت الذي تصدره ${targetAnimal.nameAr} عادة`
        };
      }

      case 'name-recognition': {
        return {
          type: challengeType,
          targetAnimal,
          options,
          question: `Find the ${isRTL ? targetAnimal.nameAr : targetAnimal.name}`,
          questionAr: `ابحث عن ${targetAnimal.nameAr}`,
          correctAnswer: targetAnimal.id,
          level: currentLevel,
          stars: getStarRating(currentLevel),
          soundPlayed: false,
          hint: 'Look for the animal that matches the name',
          hintAr: 'ابحث عن الحيوان الذي يطابق الاسم'
        };
      }

      case 'category-match': {
        const categoryAnimals = filteredAnimals.filter(a => a.category === targetAnimal.category);
        const otherAnimals = filteredAnimals.filter(a => a.category !== targetAnimal.category);
        const mixedOptions = rotateArray([
          ...categoryAnimals.slice(0, Math.min(2, optionsCount - 1)),
          ...otherAnimals.slice(0, Math.max(0, optionsCount - 2))
        ], currentLevel % optionsCount);

        return {
          type: challengeType,
          targetAnimal,
          options: mixedOptions,
          question: `Which animals are ${targetAnimal.category} animals?`,
          questionAr: `أي حيوانات تنتمي إلى فئة ${getCategoryNameAr(targetAnimal.category)}؟`,
          correctAnswer: targetAnimal.category,
          level: currentLevel,
          stars: getStarRating(currentLevel),
          soundPlayed: false,
          hint: `Look for animals that belong to the same group`,
          hintAr: 'ابحث عن الحيوانات التي تنتمي لنفس المجموعة'
        };
      }

      default:
        return generateChallenge(currentLevel);
    }
  }, [getAvailableAnimals, getDifficultySettings, usedQuestions, isRTL]);

  // ترجمة أسماء الفئات
  const getCategoryNameAr = (category: string): string => {
    const categoryNames: Record<string, string> = {
      'pets': 'الحيوانات الأليفة',
      'farm': 'حيوانات المزرعة',
      'wild': 'الحيوانات البرية',
      'flying': 'الطيور',
      'marine': 'الحيوانات المائية',
      'insects': 'الحشرات',
      'reptiles': 'الزواحف',
      'amphibians': 'البرمائيات'
    };
    return categoryNames[category] || category;
  };

  // تشغيل صوت الحيوان مع تأثيرات بصرية
  const playAnimalSound = useCallback(async (animalId: string, showVisualFeedback: boolean = true) => {
    if (!soundEnabled) return;

    setIsPlayingSound(true);
    
    if (showVisualFeedback) {
      setFlashingAnimal(animalId);
    }

    try {
      await audioService.playAnimalSound(animalId, isRTL ? 'ar' : 'en');
      
      // تشغيل اسم الحيوان أيضاً للمستويات السهلة
      if (level <= 30) {
        setTimeout(() => {
          audioService.speakAnimalName(animalId, isRTL ? 'ar' : 'en');
        }, 1000);
      }
    } catch (error) {
      console.error('Error playing animal sound:', error);
    }

    setTimeout(() => {
      setIsPlayingSound(false);
      if (showVisualFeedback) {
        setFlashingAnimal(null);
      }
    }, 2000);
  }, [soundEnabled, isRTL, level]);

  // تشغيل تلقائي للصوت عند فتح السؤال (مرة واحدة)
  useEffect(() => {
    if (currentChallenge && !currentChallenge.soundPlayed && currentChallenge.type === 'sound-to-animal') {
      const { autoPlaySound } = getDifficultySettings(level);
      const idsToPreload = [currentChallenge.targetAnimal.id, ...currentChallenge.options.map(o => o.id)];
      audioService.preloadAnimalSounds(idsToPreload).catch(() => {});
      const playSound = async () => {
        await playAnimalSound(currentChallenge.targetAnimal.id, false);
        setCurrentChallenge(prev => prev ? { ...prev, soundPlayed: true } : null);
      };
      playSound();
      if (autoPlaySound > 1) {
        const t = setTimeout(playSound, 2500);
        return () => clearTimeout(t);
      }
    }
  }, [currentChallenge, level, getDifficultySettings, playAnimalSound]);

  // إيقاف أي صوت عند تفكيك اللعبة (مغادرة الصفحة/اللعبة)
  useEffect(() => {
    return () => {
      audioService.stopAllSounds();
    };
  }, []);

  // معالجة الإجابة
  const handleAnswer = useCallback(async (selectedAnimal: typeof animalDatabase[0]) => {
    if (isAnswering || !currentChallenge) return;
    
    setIsAnswering(true);
    
    const isCorrect = selectedAnimal.id === currentChallenge.correctAnswer ||
                     (currentChallenge.type === 'category-match' && selectedAnimal.category === currentChallenge.correctAnswer);
    
    // تسجيل السؤال كمستخدم
    setUsedQuestions(prev => new Set([...prev, `${currentChallenge.type}-${currentChallenge.targetAnimal.id}`]));
    
    if (isCorrect) {
      const basePoints = 40 + (currentChallenge.stars * 20);
      const levelBonus = Math.floor(level / 10) * 15;
      const streakBonus = Math.min(perfectStreak * 5, 50);
      const speedBonus = isPlayingSound ? 0 : 10; // مكافأة السرعة
      const points = basePoints + levelBonus + streakBonus + speedBonus;
      
      setScore(prev => {
        const newScore = prev + points;
        onScoreUpdate(newScore);
        return newScore;
      });

      setPerfectStreak(prev => prev + 1);
      
      // فتح حيوانات جديدة
      setUnlockedAnimals(prev => new Set([...prev, selectedAnimal.id]));
      
      // لا نعيد تشغيل الصوت بعد الإجابة؛ تشغيل الصوت عند فتح السؤال فقط
      setFlashingAnimal(selectedAnimal.id);
      
      setFeedback({
        type: 'correct',
        message: isRTL ? `ممتاز! +${points} نقطة!` : `Excellent! +${points} points!`
      });
      
      // إنجازات خاصة
      if (perfectStreak > 0 && perfectStreak % 10 === 0) {
        setAchievementUnlocked(isRTL ? `خبير الحيوانات! ${perfectStreak} إجابات صحيحة!` : `Animal Expert! ${perfectStreak} correct answers!`);
      }
      
      // كل سؤال = مستوى
      const newLevel = Math.min(level + 1, 120);
      setLevel(newLevel);
      onLevelUpdate(newLevel);
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      onLivesUpdate(newLives);
      setPerfectStreak(0);
      
      // لا نعيد تشغيل الصوت بعد الإجابة الخاطئة
      
      setFeedback({
        type: 'wrong',
        message: isRTL ? 
          `الإجابة الصحيحة: ${currentChallenge.targetAnimal.nameAr}` : 
          `Correct answer: ${currentChallenge.targetAnimal.name}`
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
        }, 3000);
        return;
      }
    }

    setQuestionsAnswered(prev => prev + 1);
    setAutoPlayCount(0);
    
    // استخدم المستوى التالي إن تمت الإجابة الصحيحة
    const nextLevel = isCorrect ? Math.min(level + 1, MAX_LEVEL) : level;
    setTimeout(() => {
      setFeedback({ type: null, message: '' });
      setAchievementUnlocked(null);
      setFlashingAnimal(null);
      setCurrentChallenge(generateChallenge(nextLevel));
      setIsAnswering(false);
    }, 3000);
  }, [isAnswering, currentChallenge, level, questionsAnswered, lives, score, perfectStreak, isRTL, isPlayingSound, onScoreUpdate, onLevelUpdate, onLivesUpdate, onGameComplete, generateChallenge, playAnimalSound]);

  // عرض التحدي
  const renderChallenge = useCallback(() => {
    if (!currentChallenge) return null;

    return (
      <div className="space-y-6">
        {/* منطقة السؤال */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card-fun text-center bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200"
        >
          {/* الحيوان المستهدف للأسئلة البصرية */}
          {currentChallenge.type !== 'sound-to-animal' && (
            <div className={`text-8xl mb-4 transition-all duration-500 ${
              flashingAnimal === currentChallenge.targetAnimal.id ? 
              'animate-bounce scale-125 brightness-150 drop-shadow-lg' : ''
            }`}>
              {currentChallenge.targetAnimal.emoji}
            </div>
          )}
          
          {/* أيقونة السماعة للأسئلة الصوتية */}
          {currentChallenge.type === 'sound-to-animal' && (
            <motion.div
              animate={{ 
                scale: isPlayingSound ? [1, 1.2, 1] : 1,
                rotate: isPlayingSound ? [0, 10, -10, 0] : 0
              }}
              transition={{ duration: 0.5, repeat: isPlayingSound ? Infinity : 0 }}
              className="text-8xl mb-4"
            >
              🔊
            </motion.div>
          )}
          
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            {isRTL ? currentChallenge.questionAr : currentChallenge.question}
          </h3>
          
          {/* أزرار التحكم بالصوت */}
          <div className="flex justify-center space-x-4 rtl:space-x-reverse mb-4">
            {currentChallenge.type === 'sound-to-animal' && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => playAnimalSound(currentChallenge.targetAnimal.id)}
                  disabled={isPlayingSound}
                  className={`btn-fun ${isPlayingSound ? 'bg-orange-500' : 'bg-green-500'} hover:bg-green-600 text-white px-6 py-3`}
                >
                  {isPlayingSound ? (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      {isRTL ? 'يتم التشغيل...' : 'Playing...'}
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      {isRTL ? 'إعادة تشغيل الصوت' : 'Replay Sound'}
                    </>
                  )}
                </Button>
              </motion.div>
            )}
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => setSoundEnabled(!soundEnabled)}
                variant="outline"
                className="border-2 border-gray-300 hover:border-gray-400"
              >
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-green-600" />
                ) : (
                  <VolumeX className="w-5 h-5 text-red-600" />
                )}
              </Button>
            </motion.div>
          </div>
          
          <div className="flex justify-center space-x-1 rtl:space-x-reverse">
            {[...Array(currentChallenge.stars)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
            ))}
          </div>
        </motion.div>

        {/* خيارات الإجابة */}
        <div className="grid grid-cols-2 gap-4">
          {currentChallenge.options.map((animal, index) => (
            <motion.div
              key={animal.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                onClick={() => handleAnswer(animal)}
                disabled={isAnswering}
                className={`w-full h-auto min-h-[120px] p-6 bg-white hover:bg-blue-50 text-gray-800 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg ${
                  flashingAnimal === animal.id ? 
                  'animate-pulse scale-110 border-yellow-400 bg-yellow-50 shadow-yellow-200 shadow-2xl' : ''
                }`}
              >
                <div className="text-center space-y-3">
                  <motion.div 
                    className={`text-6xl transition-all duration-300 ${
                      flashingAnimal === animal.id ? 'animate-bounce' : ''
                    }`}
                    animate={{
                      scale: flashingAnimal === animal.id ? [1, 1.3, 1] : 1,
                      rotate: flashingAnimal === animal.id ? [0, 5, -5, 0] : 0
                    }}
                    transition={{ duration: 0.6, repeat: flashingAnimal === animal.id ? 2 : 0 }}
                  >
                    {animal.emoji}
                  </motion.div>
                  <div>
                    <p className="font-bold text-lg text-gray-800">
                      {isRTL ? animal.nameAr : animal.name}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {isRTL ? getCategoryNameAr(animal.category) : animal.category}
                    </p>
                  </div>
                  
                  {/* زر تشغيل صوت الحيوان */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      playAnimalSound(animal.id);
                    }}
                    className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4 text-blue-600" />
                  </motion.div>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }, [currentChallenge, isRTL, isAnswering, flashingAnimal, isPlayingSound, soundEnabled, handleAnswer, playAnimalSound, getCategoryNameAr]);

  // مزامنة مستوى البدء مع المحفوظ
  useEffect(() => {
    if (initialLevel && initialLevel > level) {
      setLevel(initialLevel);
    }
  }, [initialLevel]);

  // تهيئة التحدي الأول
  useEffect(() => {
    if (!currentChallenge) {
      setCurrentChallenge(generateChallenge(level));
    }
  }, [currentChallenge, generateChallenge, level]);

  if (!currentChallenge) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-8xl"
        >
          🐾
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* إحصائيات اللعبة المحسنة */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="font-bold text-yellow-600">{formatNumber(score, isRTL)}</span>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Crown className="w-5 h-5 text-purple-500" />
            <span className="font-bold text-purple-600">{formatNumber(level, isRTL)}/{formatNumber(MAX_LEVEL, isRTL)}</span>
          </div>
          <div className="flex items-center space-x-1 rtl:space-x-reverse">
            {[...Array(3)].map((_, i) => (
              <motion.span
                key={i}
                animate={{ scale: i < lives ? 1.1 : 0.9, opacity: i < lives ? 1 : 0.3 }}
                className={`text-xl transition-all duration-300`}
              >
                🐾
              </motion.span>
            ))}
          </div>
        </div>

        {/* شريط التقدم */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
            <motion.div
            className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(level / MAX_LEVEL) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-600">
          <span>{isRTL ? "السلسلة المثالية" : "Perfect Streak"}: {formatNumber(perfectStreak, isRTL)}</span>
          <span>{isRTL ? "الحيوانات المكتشفة" : "Animals Discovered"}: {formatNumber(unlockedAnimals.size, isRTL)}</span>
        </div>
      </div>

      {/* محتوى التحدي */}
      {renderChallenge()}

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
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, repeat: 3 }}
                className="text-6xl mb-4"
              >
                🏆
              </motion.div>
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
            initial={{ scale: 0, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: -50 }}
            className={`card-fun text-center ${
              feedback.type === 'correct' 
                ? 'bg-green-50 border-2 border-green-200' 
                : 'bg-red-50 border-2 border-red-200'
            }`}
          >
            <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
              {feedback.type === 'correct' ? (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                >
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </motion.div>
              ) : (
                <motion.div
                  animate={{ x: [0, -10, 10, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <XCircle className="w-8 h-8 text-red-500" />
                </motion.div>
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