import { useState, useEffect, useCallback } from "react";
import { Button } from "../ui/button";
import { GameProps } from "./GameEngine";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Star, Trophy, Crown, Shapes } from "lucide-react";

interface Shape {
  id: string;
  name: string;
  nameAr: string;
  emoji: string;
  svgPath: string;
  sides: number;
  category: 'basic' | 'advanced' | 'complex' | '3d';
  color: string;
  properties: string[];
  propertiesAr: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

interface ShapeChallenge {
  type: 'identify-shape' | 'count-sides' | 'shape-properties' | 'shape-matching' | 'shape-patterns' | 'shape-composition' | 'real-world-shapes';
  targetShape?: Shape;
  shapes: Shape[];
  options: Shape[] | string[] | number[];
  question: string;
  questionAr: string;
  correctAnswer: string | number | string[];
  level: number;
  stars: number;
  hint?: string;
  hintAr?: string;
}

// قاعدة بيانات شاملة للأشكال
const shapeDatabase: Shape[] = [
  // أشكال أساسية (المستويات 1-25)
  {
    id: 'circle',
    name: 'Circle',
    nameAr: 'دائرة',
    emoji: '⭕',
    svgPath: 'M50,50 m-40,0 a40,40 0 1,0 80,0 a40,40 0 1,0 -80,0',
    sides: 0,
    category: 'basic',
    color: '#3B82F6',
    properties: ['Round', 'No corners', 'No sides'],
    propertiesAr: ['مستدير', 'بلا زوايا', 'بلا أضلاع'],
    difficulty: 'easy'
  },
  {
    id: 'square',
    name: 'Square',
    nameAr: 'مربع',
    emoji: '🟩',
    svgPath: 'M20,20 L80,20 L80,80 L20,80 Z',
    sides: 4,
    category: 'basic',
    color: '#10B981',
    properties: ['4 equal sides', '4 right angles', 'Equal sides'],
    propertiesAr: ['4 أضلاع متساوية', '4 زوايا قائمة', 'أضلاع متساوية'],
    difficulty: 'easy'
  },
  {
    id: 'triangle',
    name: 'Triangle',
    nameAr: 'مثلث',
    emoji: '🔺',
    svgPath: 'M50,15 L85,75 L15,75 Z',
    sides: 3,
    category: 'basic',
    color: '#F59E0B',
    properties: ['3 sides', '3 corners', '3 angles'],
    propertiesAr: ['3 أضلاع', '3 زوايا', '3 أركان'],
    difficulty: 'easy'
  },
  {
    id: 'rectangle',
    name: 'Rectangle',
    nameAr: 'مستطيل',
    emoji: '🟦',
    svgPath: 'M15,30 L85,30 L85,70 L15,70 Z',
    sides: 4,
    category: 'basic',
    color: '#8B5CF6',
    properties: ['4 sides', '2 long sides', '2 short sides', '4 right angles'],
    propertiesAr: ['4 أضلاع', 'ضلعان طويلان', 'ضلعان قصيران', '4 زوايا قائمة'],
    difficulty: 'easy'
  },
  {
    id: 'oval',
    name: 'Oval',
    nameAr: 'بيضاوي',
    emoji: '🥚',
    svgPath: 'M50,15 C70,15 85,30 85,50 C85,70 70,85 50,85 C30,85 15,70 15,50 C15,30 30,15 50,15 Z',
    sides: 0,
    category: 'basic',
    color: '#EC4899',
    properties: ['Elongated circle', 'No corners', 'Curved'],
    propertiesAr: ['دائرة مطولة', 'بلا زوايا', 'منحني'],
    difficulty: 'medium'
  },

  // أشكال متقدمة (المستويات 26-50)
  {
    id: 'pentagon',
    name: 'Pentagon',
    nameAr: 'خماسي',
    emoji: '⬟',
    svgPath: 'M50,10 L80,35 L70,70 L30,70 L20,35 Z',
    sides: 5,
    category: 'advanced',
    color: '#EF4444',
    properties: ['5 sides', '5 corners', '5 angles'],
    propertiesAr: ['5 أضلاع', '5 زوايا', '5 أركان'],
    difficulty: 'medium'
  },
  {
    id: 'hexagon',
    name: 'Hexagon',
    nameAr: 'سداسي',
    emoji: '⬢',
    svgPath: 'M50,10 L75,30 L75,60 L50,80 L25,60 L25,30 Z',
    sides: 6,
    category: 'advanced',
    color: '#06B6D4',
    properties: ['6 sides', '6 corners', 'Like honeycomb'],
    propertiesAr: ['6 أضلاع', '6 زوايا', 'مثل خلية النحل'],
    difficulty: 'medium'
  },
  {
    id: 'diamond',
    name: 'Diamond',
    nameAr: 'معين',
    emoji: '💎',
    svgPath: 'M50,15 L75,50 L50,85 L25,50 Z',
    sides: 4,
    category: 'advanced',
    color: '#A855F7',
    properties: ['4 equal sides', 'Looks like a gem', 'Pointed top'],
    propertiesAr: ['4 أضلاع متساوية', 'يشبه الجوهرة', 'رأس مدبب'],
    difficulty: 'medium'
  },
  {
    id: 'octagon',
    name: 'Octagon',
    nameAr: 'ثماني',
    emoji: '🛑',
    svgPath: 'M35,15 L65,15 L85,35 L85,65 L65,85 L35,85 L15,65 L15,35 Z',
    sides: 8,
    category: 'advanced',
    color: '#DC2626',
    properties: ['8 sides', '8 corners', 'Stop sign shape'],
    propertiesAr: ['8 أضلاع', '8 زوايا', 'شكل إشارة قف'],
    difficulty: 'hard'
  },

  // أشكال معقدة (المستويات 51-75)
  {
    id: 'star',
    name: 'Star',
    nameAr: 'نجمة',
    emoji: '⭐',
    svgPath: 'M50,15 L55,35 L75,35 L60,50 L65,70 L50,60 L35,70 L40,50 L25,35 L45,35 Z',
    sides: 10,
    category: 'complex',
    color: '#FBBF24',
    properties: ['5 points', '10 sides', 'Shiny in sky'],
    propertiesAr: ['5 رؤوس', '10 أضلاع', 'يضيء في السماء'],
    difficulty: 'hard'
  },
  {
    id: 'heart',
    name: 'Heart',
    nameAr: 'قلب',
    emoji: '❤️',
    svgPath: 'M50,75 C50,75 20,50 20,35 C20,25 30,15 40,15 C45,15 50,20 50,20 C50,20 55,15 60,15 C70,15 80,25 80,35 C80,50 50,75 50,75 Z',
    sides: 0,
    category: 'complex',
    color: '#F87171',
    properties: ['Symbol of love', 'Curved shape', 'Two rounded tops'],
    propertiesAr: ['رمز الحب', 'شكل منحني', 'قمتان مستديرتان'],
    difficulty: 'hard'
  },
  {
    id: 'crescent',
    name: 'Crescent',
    nameAr: 'هلال',
    emoji: '🌙',
    svgPath: 'M25,50 C25,25 40,5 60,5 C45,5 35,25 35,50 C35,75 45,95 60,95 C40,95 25,75 25,50 Z',
    sides: 0,
    category: 'complex',
    color: '#FBBF24',
    properties: ['Moon shape', 'Curved like C', 'Two points'],
    propertiesAr: ['شكل القمر', 'منحني مثل C', 'نقطتان'],
    difficulty: 'hard'
  },

  // أشكال ثلاثية الأبعاد (المستويات 76-100)
  {
    id: 'cube',
    name: 'Cube',
    nameAr: 'مكعب',
    emoji: '🧊',
    svgPath: 'M25,35 L55,35 L55,65 L25,65 Z M35,25 L65,25 L65,55 L55,55 L55,35 L35,35 Z M55,35 L65,25 M55,55 L65,45 M35,35 L35,25',
    sides: 12,
    category: '3d',
    color: '#60A5FA',
    properties: ['6 faces', '12 edges', '8 corners', '3D square'],
    propertiesAr: ['6 وجوه', '12 حافة', '8 أركان', 'مربع ثلاثي الأبعاد'],
    difficulty: 'hard'
  },
  {
    id: 'sphere',
    name: 'Sphere',
    nameAr: 'كرة',
    emoji: '⚽',
    svgPath: 'M50,50 m-35,0 a35,35 0 1,0 70,0 a35,35 0 1,0 -70,0 M20,50 Q50,30 80,50 M20,50 Q50,70 80,50',
    sides: 0,
    category: '3d',
    color: '#34D399',
    properties: ['3D circle', 'Perfectly round', 'Like a ball'],
    propertiesAr: ['دائرة ثلاثية الأبعاد', 'مستدير تماماً', 'مثل الكرة'],
    difficulty: 'hard'
  },
  {
    id: 'pyramid',
    name: 'Pyramid',
    nameAr: 'هرم',
    emoji: '🔺',
    svgPath: 'M50,15 L80,75 L20,75 Z M50,15 L65,60 L50,75 M35,60 L65,60',
    sides: 8,
    category: '3d',
    color: '#F59E0B',
    properties: ['Triangle faces', 'Square base', 'Point at top'],
    propertiesAr: ['وجوه مثلثية', 'قاعدة مربعة', 'نقطة في الأعلى'],
    difficulty: 'hard'
  }
];

// أشكال من العالم الحقيقي
const realWorldShapes = [
  { shape: 'circle', examples: ['Wheel', 'Clock', 'Pizza'], examplesAr: ['عجلة', 'ساعة', 'بيتزا'] },
  { shape: 'square', examples: ['Window', 'Book', 'Stamp'], examplesAr: ['نافذة', 'كتاب', 'طابع'] },
  { shape: 'triangle', examples: ['Roof', 'Pizza slice', 'Mountain'], examplesAr: ['سطح', 'قطعة بيتزا', 'جبل'] },
  { shape: 'rectangle', examples: ['Door', 'Phone', 'TV'], examplesAr: ['باب', 'هاتف', 'تلفزيون'] },
  { shape: 'star', examples: ['Star in sky', 'Badge', 'Christmas tree top'], examplesAr: ['نجمة في السماء', 'شارة', 'قمة شجرة الميلاد'] }
];

export function ShapeGame({ isRTL, onGameComplete, onScoreUpdate, onLivesUpdate, onLevelUpdate }: GameProps) {
  const [currentChallenge, setCurrentChallenge] = useState<ShapeChallenge | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong' | null; message: string }>({ type: null, message: '' });
  const [isAnswering, setIsAnswering] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());
  const [unlockedShapes, setUnlockedShapes] = useState<Set<string>>(new Set(['circle', 'square', 'triangle']));
  const [achievementUnlocked, setAchievementUnlocked] = useState<string | null>(null);
  const [perfectStreak, setPerfectStreak] = useState(0);
  const [flashingShape, setFlashingShape] = useState<string | null>(null);

  // تحديد الأشكال المتاحة حسب المستوى
  const getAvailableShapes = useCallback((currentLevel: number): Shape[] => {
    if (currentLevel <= 25) return shapeDatabase.filter(s => s.category === 'basic');
    if (currentLevel <= 50) return shapeDatabase.filter(s => ['basic', 'advanced'].includes(s.category));
    if (currentLevel <= 75) return shapeDatabase.filter(s => ['basic', 'advanced', 'complex'].includes(s.category));
    return shapeDatabase; // جميع الأشكال للمستويات 76-120
  }, []);

  // إعدادات الصعوبة حسب المستوى
  const getDifficultySettings = useCallback((level: number) => {
    if (level <= 25) return { 
      optionsCount: 3, 
      challengeTypes: ['identify-shape', 'count-sides'],
      allowedDifficulties: ['easy']
    };
    if (level <= 50) return { 
      optionsCount: 4, 
      challengeTypes: ['identify-shape', 'count-sides', 'shape-properties'],
      allowedDifficulties: ['easy', 'medium']
    };
    if (level <= 75) return { 
      optionsCount: 4, 
      challengeTypes: ['identify-shape', 'count-sides', 'shape-properties', 'shape-matching'],
      allowedDifficulties: ['easy', 'medium']
    };
    return { 
      optionsCount: 5, 
      challengeTypes: ['identify-shape', 'count-sides', 'shape-properties', 'shape-matching', 'real-world-shapes', 'shape-patterns'],
      allowedDifficulties: ['easy', 'medium', 'hard']
    };
  }, []);

  // إنشاء تحدي جديد
  const generateChallenge = useCallback((currentLevel: number): ShapeChallenge => {
    const availableShapes = getAvailableShapes(currentLevel);
    const { optionsCount, challengeTypes, allowedDifficulties } = getDifficultySettings(currentLevel);
    
    const filteredShapes = availableShapes.filter(shape => 
      allowedDifficulties.includes(shape.difficulty)
    );
    
    const challengeType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)] as ShapeChallenge['type'];
    
    // تصفية الأسئلة المستخدمة
    const unusedShapes = filteredShapes.filter(shape => 
      !usedQuestions.has(`${challengeType}-${shape.id}`)
    );
    
    if (unusedShapes.length === 0) {
      setUsedQuestions(new Set());
      return generateChallenge(currentLevel);
    }

    const getStarRating = (level: number) => {
      if (level % 25 === 0) return 3;
      if (level % 10 === 0) return 2;
      return 1;
    };

    switch (challengeType) {
      case 'identify-shape': {
        const targetShape = unusedShapes[Math.floor(Math.random() * unusedShapes.length)];
        const wrongShapes = filteredShapes
          .filter(s => s.id !== targetShape.id)
          .slice(0, optionsCount - 1);
        
        const options = [targetShape, ...wrongShapes].sort(() => Math.random() - 0.5);

        return {
          type: challengeType,
          targetShape,
          shapes: [targetShape],
          options,
          question: `What shape is this?`,
          questionAr: `ما هذا الشكل؟`,
          correctAnswer: targetShape.id,
          level: currentLevel,
          stars: getStarRating(currentLevel),
          hint: `This shape has ${targetShape.sides} sides`,
          hintAr: `هذا الشكل له ${targetShape.sides} أضلاع`
        };
      }

      case 'count-sides': {
        const targetShape = unusedShapes.filter(s => s.sides > 0)[Math.floor(Math.random() * unusedShapes.filter(s => s.sides > 0).length)];
        const wrongCounts = [targetShape.sides - 1, targetShape.sides + 1, targetShape.sides + 2]
          .filter(count => count > 0 && count !== targetShape.sides)
          .slice(0, optionsCount - 1);
        
        const options = [targetShape.sides, ...wrongCounts].sort(() => Math.random() - 0.5);

        return {
          type: challengeType,
          targetShape,
          shapes: [targetShape],
          options,
          question: `How many sides does this shape have?`,
          questionAr: `كم عدد أضلاع هذا الشكل؟`,
          correctAnswer: targetShape.sides,
          level: currentLevel,
          stars: getStarRating(currentLevel),
          hint: `Count each straight edge`,
          hintAr: `عد كل حافة مستقيمة`
        };
      }

      case 'shape-properties': {
        const targetShape = unusedShapes[Math.floor(Math.random() * unusedShapes.length)];
        const correctProperty = targetShape.properties[0];
        const wrongProperties = filteredShapes
          .filter(s => s.id !== targetShape.id)
          .map(s => s.properties[0])
          .filter(prop => prop !== correctProperty)
          .slice(0, optionsCount - 1);
        
        const options = [correctProperty, ...wrongProperties].sort(() => Math.random() - 0.5);

        return {
          type: challengeType,
          targetShape,
          shapes: [targetShape],
          options,
          question: `Which property describes this shape?`,
          questionAr: `أي خاصية تصف هذا الشكل؟`,
          correctAnswer: correctProperty,
          level: currentLevel,
          stars: getStarRating(currentLevel),
          hint: `Look at the shape's characteristics`,
          hintAr: `انظر إلى خصائص الشكل`
        };
      }

      case 'real-world-shapes': {
        const shapeCategory = realWorldShapes[Math.floor(Math.random() * realWorldShapes.length)];
        const targetShape = filteredShapes.find(s => s.id === shapeCategory.shape);
        if (!targetShape) return generateChallenge(currentLevel);
        
        const example = shapeCategory.examples[0];
        const wrongShapes = filteredShapes
          .filter(s => s.id !== targetShape.id)
          .slice(0, optionsCount - 1);
        
        const options = [targetShape, ...wrongShapes].sort(() => Math.random() - 0.5);

        return {
          type: challengeType,
          targetShape,
          shapes: [targetShape],
          options,
          question: `A ${example} is what shape?`,
          questionAr: `${isRTL ? shapeCategory.examplesAr[0] : example} أي شكل؟`,
          correctAnswer: targetShape.id,
          level: currentLevel,
          stars: getStarRating(currentLevel),
          hint: `Think about the object's outline`,
          hintAr: `فكر في الحدود الخارجية للشيء`
        };
      }

      default:
        return generateChallenge(currentLevel);
    }
  }, [getAvailableShapes, getDifficultySettings, usedQuestions, isRTL]);

  // إنشاء SVG للشكل مع تكبير الحجم
  const renderShapeSVG = useCallback((shape: Shape, size: number = 120, isGlowing: boolean = false) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`transition-all duration-300 ${isGlowing ? 'filter drop-shadow-lg' : ''}`}
      style={{ filter: isGlowing ? 'drop-shadow(0 0 10px currentColor)' : 'none' }}
    >
      <path
        d={shape.svgPath}
        fill={shape.color}
        stroke="white"
        strokeWidth="2"
        className={`transition-all duration-300 ${isGlowing ? 'animate-pulse' : ''}`}
        style={{ filter: isGlowing ? 'brightness(1.3) saturate(1.5)' : 'none' }}
      />
    </svg>
  ), []);

  // معالجة الإجابة
  const handleAnswer = useCallback((answer: Shape | string | number) => {
    if (isAnswering || !currentChallenge) return;
    
    setIsAnswering(true);
    
    let isCorrect = false;
    let answerValue: string | number;
    
    if (typeof answer === 'object') {
      answerValue = answer.id;
    } else {
      answerValue = answer;
    }
    
    isCorrect = answerValue === currentChallenge.correctAnswer;
    
    // تسجيل السؤال كمستخدم
    setUsedQuestions(prev => new Set([...prev, `${currentChallenge.type}-${currentChallenge.targetShape?.id}`]));
    
    if (isCorrect) {
      const basePoints = 25 + (currentChallenge.stars * 15);
      const levelBonus = Math.floor(level / 10) * 10;
      const streakBonus = Math.min(perfectStreak * 3, 30);
      const points = basePoints + levelBonus + streakBonus;
      
      setScore(prev => {
        const newScore = prev + points;
        onScoreUpdate(newScore);
        return newScore;
      });

      setPerfectStreak(prev => prev + 1);
      
      // فتح أشكال جديدة
      if (currentChallenge.targetShape) {
        setUnlockedShapes(prev => new Set([...prev, currentChallenge.targetShape!.id]));
      }
      
      // ومض بصري للإجابة الصحيحة
      setFlashingShape(currentChallenge.targetShape?.id || null);
      setTimeout(() => setFlashingShape(null), 1000);
      
      setFeedback({
        type: 'correct',
        message: isRTL ? `رائع! +${points} نقطة!` : `Great! +${points} points!`
      });
      
      // إنجازات خاصة
      if (perfectStreak > 0 && perfectStreak % 15 === 0) {
        setAchievementUnlocked(isRTL ? `عالم الأشكال! ${perfectStreak} إجابات صحيحة!` : `Shape Master! ${perfectStreak} correct answers!`);
      }
      
      if ((questionsAnswered + 1) % 3 === 0) {
        const newLevel = Math.min(level + 1, 120);
        setLevel(newLevel);
        onLevelUpdate(newLevel);
      }
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      onLivesUpdate(newLives);
      setPerfectStreak(0);
      
      setFeedback({
        type: 'wrong',
        message: isRTL ? 
          `حاول مرة أخرى! ${currentChallenge.hintAr || ''}` : 
          `Try again! ${currentChallenge.hint || ''}`
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
      setAchievementUnlocked(null);
      setCurrentChallenge(generateChallenge(level));
      setIsAnswering(false);
    }, 2000);
  }, [isAnswering, currentChallenge, level, questionsAnswered, lives, score, perfectStreak, isRTL, onScoreUpdate, onLevelUpdate, onLivesUpdate, onGameComplete, generateChallenge]);

  // عرض التحدي
  const renderChallenge = useCallback(() => {
    if (!currentChallenge || !currentChallenge.targetShape) return null;

    const targetShape = currentChallenge.targetShape;

    return (
      <div className="space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card-fun text-center bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200"
        >
          {/* عرض الشكل بحجم كبير */}
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ 
                scale: flashingShape === targetShape.id ? [1, 1.2, 1] : 1,
                rotate: flashingShape === targetShape.id ? [0, 10, -10, 0] : 0
              }}
              transition={{ duration: 0.6, repeat: flashingShape === targetShape.id ? 3 : 0 }}
              className={`p-4 rounded-3xl ${flashingShape === targetShape.id ? 'bg-yellow-100 shadow-lg' : 'bg-white shadow-md'}`}
            >
              {renderShapeSVG(targetShape, 150, flashingShape === targetShape.id)}
            </motion.div>
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            {isRTL ? currentChallenge.questionAr : currentChallenge.question}
          </h3>
          
          <div className="flex justify-center space-x-1 rtl:space-x-reverse">
            {[...Array(currentChallenge.stars)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
            ))}
          </div>
        </motion.div>

        {/* الخيارات بأحجام كبيرة */}
        <div className="grid grid-cols-2 gap-4">
          {(currentChallenge.options as (Shape | string | number)[]).map((option, index) => {
            let displayContent;
            let optionValue;
            
            if (typeof option === 'object') {
              // شكل
              displayContent = (
                <div className="flex flex-col items-center space-y-2">
                  {renderShapeSVG(option, 80)}
                  <span className="text-sm font-bold text-gray-700">
                    {isRTL ? option.nameAr : option.name}
                  </span>
                </div>
              );
              optionValue = option;
            } else {
              // نص أو رقم
              displayContent = (
                <div className="flex flex-col items-center justify-center h-20">
                  <span className="text-2xl font-bold text-gray-800">
                    {option}
                  </span>
                </div>
              );
              optionValue = option;
            }
            
            return (
              <motion.div
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  onClick={() => handleAnswer(optionValue)}
                  disabled={isAnswering}
                  className="w-full h-auto min-h-[120px] p-4 bg-white hover:bg-blue-50 text-gray-800 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
                >
                  {displayContent}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }, [currentChallenge, isRTL, isAnswering, flashingShape, handleAnswer, renderShapeSVG]);

  // تهيئة التحدي الأول
  useEffect(() => {
    if (!currentChallenge) {
      setCurrentChallenge(generateChallenge(1));
    }
  }, [currentChallenge, generateChallenge]);

  if (!currentChallenge) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-6xl animate-pulse">🔺</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
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
                🔺
              </span>
            ))}
          </div>
        </div>

        {/* شريط التقدم */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(level / 120) * 100}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-600">
          <span>{isRTL ? "السلسلة المثالية" : "Perfect Streak"}: {perfectStreak}</span>
          <span>{isRTL ? "الأشكال المفتوحة" : "Shapes Unlocked"}: {unlockedShapes.size}</span>
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