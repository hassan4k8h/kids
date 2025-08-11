import { useState, useEffect, useCallback } from "react";
import { Button } from "../ui/button";
import { GameProps } from "./GameEngine";
import { motion, AnimatePresence } from "framer-motion";
import { levelIndex, cyclePick, rotateArray, uniqueIndex } from "../../utils/deterministic";
import { CheckCircle, XCircle, Cloud, Sun, Thermometer } from "lucide-react";

interface WeatherCondition {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  temperature: string;
  description: string;
  descriptionAr: string;
  clothing: string[];
  clothingAr: string[];
}

interface WeatherChallenge {
  type: 'identify-weather' | 'choose-clothing' | 'temperature-range' | 'weather-sequence';
  weather?: WeatherCondition;
  options: string[] | WeatherCondition[];
  question: string;
  questionAr: string;
  correctAnswer: string | string[];
}

const weatherConditions: WeatherCondition[] = [
  {
    id: 'sunny',
    name: 'Sunny',
    nameAr: 'مشمس',
    icon: '☀️',
    temperature: '25°C',
    description: 'Bright and warm',
    descriptionAr: 'مشرق ودافئ',
    clothing: ['T-shirt', 'Shorts', 'Sunglasses', 'Hat'],
    clothingAr: ['تي شيرت', 'شورت', 'نظارة شمسية', 'قبعة']
  },
  {
    id: 'rainy',
    name: 'Rainy',
    nameAr: 'ممطر',
    icon: '🌧️',
    temperature: '18°C',
    description: 'Wet and cool',
    descriptionAr: 'رطب وبارد',
    clothing: ['Raincoat', 'Umbrella', 'Boots', 'Long pants'],
    clothingAr: ['معطف مطر', 'مظلة', 'حذاء مطر', 'بنطال طويل']
  },
  {
    id: 'snowy',
    name: 'Snowy',
    nameAr: 'مثلج',
    icon: '❄️',
    temperature: '-2°C',
    description: 'Cold and white',
    descriptionAr: 'بارد وأبيض',
    clothing: ['Winter coat', 'Gloves', 'Scarf', 'Warm boots'],
    clothingAr: ['معطف شتوي', 'قفازات', 'وشاح', 'حذاء دافئ']
  },
  {
    id: 'cloudy',
    name: 'Cloudy',
    nameAr: 'غائم',
    icon: '☁️',
    temperature: '20°C',
    description: 'Gray and mild',
    descriptionAr: 'رمادي ومعتدل',
    clothing: ['Light jacket', 'Jeans', 'Sneakers', 'Light sweater'],
    clothingAr: ['جاكيت خفيف', 'جينز', 'حذاء رياضي', 'كنزة خفيفة']
  },
  {
    id: 'windy',
    name: 'Windy',
    nameAr: 'عاصف',
    icon: '💨',
    temperature: '22°C',
    description: 'Breezy and fresh',
    descriptionAr: 'عليل ومنعش',
    clothing: ['Windbreaker', 'Secure hat', 'Closed shoes', 'Light layers'],
    clothingAr: ['كسارة رياح', 'قبعة محكمة', 'حذاء مغلق', 'طبقات خفيفة']
  },
  {
    id: 'stormy',
    name: 'Stormy',
    nameAr: 'عاصف رعدي',
    icon: '⛈️',
    temperature: '16°C',
    description: 'Thunder and lightning',
    descriptionAr: 'رعد وبرق',
    clothing: ['Raincoat', 'Waterproof boots', 'Umbrella', 'Warm layers'],
    clothingAr: ['معطف مطر', 'حذاء مقاوم للماء', 'مظلة', 'طبقات دافئة']
  }
];

const seasons = [
  { name: 'Spring', nameAr: 'الربيع', icon: '🌸', weather: ['sunny', 'rainy', 'windy'] },
  { name: 'Summer', nameAr: 'الصيف', icon: '🌞', weather: ['sunny', 'windy'] },
  { name: 'Autumn', nameAr: 'الخريف', icon: '🍂', weather: ['cloudy', 'windy', 'rainy'] },
  { name: 'Winter', nameAr: 'الشتاء', icon: '❄️', weather: ['snowy', 'cloudy', 'stormy'] }
];

export function WeatherGame({ isRTL, onGameComplete, onScoreUpdate, onLivesUpdate, onLevelUpdate }: GameProps) {
  const [currentChallenge, setCurrentChallenge] = useState<WeatherChallenge | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong' | null; message: string }>({ type: null, message: '' });
  const [isAnswering, setIsAnswering] = useState(false);

  // Use useEffect to sync internal state with parent callbacks
  useEffect(() => {
    onScoreUpdate(score);
  }, [score, onScoreUpdate]);

  useEffect(() => {
    onLivesUpdate(lives);
  }, [lives, onLivesUpdate]);

  useEffect(() => {
    onLevelUpdate(level);
  }, [level, onLevelUpdate]);

  const generateChallenge = useCallback((difficulty: number): WeatherChallenge => {
    const challengeTypes: WeatherChallenge['type'][] = ['identify-weather', 'choose-clothing', 'temperature-range'];
    if (difficulty > 2) challengeTypes.push('weather-sequence');

    const type = challengeTypes[levelIndex(level, challengeTypes.length)];
    const take = Math.min(3 + difficulty, weatherConditions.length);
    const start = (level - 1) % Math.max(1, weatherConditions.length - take + 1);
    const availableWeather = weatherConditions.slice(start, start + take);

    switch (type) {
      case 'identify-weather': {
        const targetWeather = availableWeather[(level - 1) % availableWeather.length];
        const pool = availableWeather.filter(w => w.id !== targetWeather.id);
        const wrongOptions = [
          pool[0],
          pool[1 % pool.length],
          pool[2 % pool.length]
        ].map(w => w.name);
        const options = rotateArray([targetWeather.name, ...wrongOptions], level % 4);

        return {
          type,
          weather: targetWeather,
          options,
          question: `What weather is this?`,
          questionAr: `ما نوع الطقس هذا؟`,
          correctAnswer: targetWeather.name
        };
      }

      case 'choose-clothing': {
        const targetWeather = availableWeather[(level - 1) % availableWeather.length];
        const correctClothing = targetWeather.clothing[0]; // First item is always appropriate
        const wrongClothing = weatherConditions
          .filter(w => w.id !== targetWeather.id)
          .map(w => w.clothing[0])
          .slice(0, 3);
        
        const options = rotateArray([correctClothing, ...wrongClothing], level % 4);

        return {
          type,
          weather: targetWeather,
          options,
          question: `What should you wear in ${targetWeather.name.toLowerCase()} weather?`,
          questionAr: `ماذا يجب أن ترتدي في الطقس ${targetWeather.nameAr}؟`,
          correctAnswer: correctClothing
        };
      }

      case 'temperature-range': {
        const targetWeather = availableWeather[(level - 1) % availableWeather.length];
        const temp = parseInt(targetWeather.temperature);
        const ranges = [
          'Very Cold (below 0°C)',
          'Cold (0-10°C)', 
          'Cool (10-20°C)',
          'Warm (20-30°C)',
          'Hot (above 30°C)'
        ];
        const rangesAr = [
          'بارد جداً (أقل من 0°س)',
          'بارد (0-10°س)',
          'معتدل (10-20°س)', 
          'دافئ (20-30°س)',
          'حار (أعلى من 30°س)'
        ];
        
        let correctIndex = 2; // Default cool
        if (temp < 0) correctIndex = 0;
        else if (temp < 10) correctIndex = 1;
        else if (temp < 20) correctIndex = 2;
        else if (temp < 30) correctIndex = 3;
        else correctIndex = 4;

        return {
          type,
          weather: targetWeather,
          options: ranges,
          question: `What temperature range is ${targetWeather.temperature}?`,
          questionAr: `ما نطاق درجة الحرارة ${targetWeather.temperature}؟`,
          correctAnswer: ranges[correctIndex]
        };
      }

      case 'weather-sequence': {
        const season = seasons[levelIndex(level, seasons.length)];
        const seasonWeather = season.weather.map(id => 
          weatherConditions.find(w => w.id === id)!
        );
        
        return {
          type,
          options: seasonWeather,
          question: `Which weather belongs to ${season.name}?`,
          questionAr: `أي طقس ينتمي إلى ${season.nameAr}؟`,
          correctAnswer: season.weather
        };
      }

      default:
        return generateChallenge(1);
    }
  }, []);

  const handleAnswer = useCallback((answer: string) => {
    if (isAnswering || !currentChallenge) return;
    
    setIsAnswering(true);
    
    let isCorrect = false;
    
    if (Array.isArray(currentChallenge.correctAnswer)) {
      isCorrect = currentChallenge.correctAnswer.includes(answer);
    } else {
      isCorrect = answer === currentChallenge.correctAnswer;
    }
    
    if (isCorrect) {
      const points = 20 + (level * 5);
      // Update score without directly calling callback in setState
      setScore(prev => prev + points);
      
      setFeedback({
        type: 'correct',
        message: isRTL ? `ممتاز! +${points} نقطة` : `Great! +${points} points`
      });
      
      // كل سؤال = مستوى
      setLevel(prev => prev + 1);
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      
      setFeedback({
        type: 'wrong',
        message: isRTL ? "حاول مرة أخرى!" : "Try again!"
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
  }, [isAnswering, currentChallenge, level, questionsAnswered, lives, score, isRTL, onGameComplete, generateChallenge]);

  const renderChallenge = useCallback(() => {
    if (!currentChallenge) return null;

    switch (currentChallenge.type) {
      case 'identify-weather':
      case 'temperature-range':
        return (
          <div className="space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="card-fun text-center bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200"
            >
              <div className="text-6xl mb-4">{currentChallenge.weather?.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {currentChallenge.weather?.temperature}
              </h3>
              <p className="text-gray-600 mb-4">
                {isRTL 
                  ? currentChallenge.weather?.descriptionAr 
                  : currentChallenge.weather?.description
                }
              </p>
              <h4 className="text-lg font-bold text-blue-600">
                {isRTL ? currentChallenge.questionAr : currentChallenge.question}
              </h4>
            </motion.div>

            <div className="grid grid-cols-1 gap-3">
              {(currentChallenge.options as string[]).map((option, index) => (
                <motion.div
                  key={option}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    onClick={() => handleAnswer(option)}
                    disabled={isAnswering}
                    className="w-full h-14 text-lg font-bold bg-white hover:bg-blue-50 text-gray-800 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
                  >
                    {option}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'choose-clothing':
        return (
          <div className="space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="card-fun text-center bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200"
            >
              <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse mb-4">
                <div className="text-4xl">{currentChallenge.weather?.icon}</div>
                <Thermometer className="w-8 h-8 text-blue-500" />
                <div className="text-2xl font-bold text-blue-600">
                  {currentChallenge.weather?.temperature}
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-800">
                {isRTL ? currentChallenge.questionAr : currentChallenge.question}
              </h3>
            </motion.div>

            <div className="grid grid-cols-2 gap-3">
              {(currentChallenge.options as string[]).map((option, index) => (
                <motion.div
                  key={option}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    onClick={() => handleAnswer(option)}
                    disabled={isAnswering}
                    className="w-full h-16 flex flex-col items-center justify-center bg-white hover:bg-green-50 text-gray-800 border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
                  >
                    <div className="text-2xl mb-1">👕</div>
                    <div className="text-sm font-bold">{option}</div>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'weather-sequence':
        return (
          <div className="space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="card-fun text-center bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200"
            >
              <Cloud className="w-12 h-12 mx-auto mb-4 text-purple-500" />
              <h3 className="text-xl font-bold text-gray-800">
                {isRTL ? currentChallenge.questionAr : currentChallenge.question}
              </h3>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              {(currentChallenge.options as WeatherCondition[]).map((weather, index) => (
                <motion.div
                  key={weather.id}
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.1, type: "spring" }}
                >
                  <Button
                    onClick={() => handleAnswer(weather.id)}
                    disabled={isAnswering}
                    className="w-full h-20 flex flex-col items-center justify-center bg-white hover:bg-purple-50 text-gray-800 border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
                  >
                    <div className="text-3xl mb-1">{weather.icon}</div>
                    <div className="text-sm font-bold">
                      {isRTL ? weather.nameAr : weather.name}
                    </div>
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
        <div className="text-6xl animate-pulse">🌤️</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Game Stats */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Sun className="w-5 h-5 text-yellow-500" />
          <span className="font-bold text-yellow-600">{score}</span>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Cloud className="w-5 h-5 text-blue-500" />
          <span className="font-bold text-blue-600">{questionsAnswered}</span>
        </div>
        <div className="flex items-center space-x-1 rtl:space-x-reverse">
          {[...Array(3)].map((_, i) => (
            <span
              key={i}
              className={`text-xl ${i < lives ? 'opacity-100' : 'opacity-20'}`}
            >
              🌤️
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
            className="bg-gradient-to-r from-blue-500 via-cyan-500 to-yellow-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${((questionsAnswered % 4) / 4) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}