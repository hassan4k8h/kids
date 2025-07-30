import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "../ui/button";
import { GameProps } from "./GameEngine";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Star, Zap } from "lucide-react";

interface MathQuestion {
  question: string;
  questionAr: string;
  answer: number;
  options: number[];
  difficulty: number;
}

export function MathGame({ isRTL, onGameComplete, onScoreUpdate, onLivesUpdate, onLevelUpdate }: GameProps) {
  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong' | null; message: string }>({ type: null, message: '' });
  const [isAnswering, setIsAnswering] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  // Use refs to track when we need to call callbacks
  const scoreUpdateRef = useRef<number | null>(null);
  const livesUpdateRef = useRef<number | null>(null);
  const levelUpdateRef = useRef<number | null>(null);

  // Effect to handle callback calls outside of render
  useEffect(() => {
    if (scoreUpdateRef.current !== null) {
      onScoreUpdate(scoreUpdateRef.current);
      scoreUpdateRef.current = null;
    }
  }, [score, onScoreUpdate]);

  useEffect(() => {
    if (livesUpdateRef.current !== null) {
      onLivesUpdate(livesUpdateRef.current);
      livesUpdateRef.current = null;
    }
  }, [lives, onLivesUpdate]);

  useEffect(() => {
    if (levelUpdateRef.current !== null) {
      onLevelUpdate(levelUpdateRef.current);
      levelUpdateRef.current = null;
    }
  }, [level, onLevelUpdate]);

  const generateQuestion = useCallback((difficulty: number): MathQuestion => {
    const operations = ['+', '-', '×'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, answer, questionText, questionTextAr;
    
    const maxNum = Math.min(10 + (difficulty * 5), 50);
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * maxNum) + 1;
        num2 = Math.floor(Math.random() * maxNum) + 1;
        answer = num1 + num2;
        questionText = `${num1} + ${num2} = ?`;
        questionTextAr = `${num1} + ${num2} = ؟`;
        break;
      case '-':
        num1 = Math.floor(Math.random() * maxNum) + 10;
        num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
        answer = num1 - num2;
        questionText = `${num1} - ${num2} = ?`;
        questionTextAr = `${num1} - ${num2} = ؟`;
        break;
      case '×':
        num1 = Math.floor(Math.random() * Math.min(10, maxNum / 2)) + 1;
        num2 = Math.floor(Math.random() * Math.min(10, maxNum / 2)) + 1;
        answer = num1 * num2;
        questionText = `${num1} × ${num2} = ?`;
        questionTextAr = `${num1} × ${num2} = ؟`;
        break;
      default:
        num1 = 1; num2 = 1; answer = 2;
        questionText = "1 + 1 = ?";
        questionTextAr = "1 + 1 = ؟";
    }

    // Generate wrong options
    const wrongOptions: number[] = [];
    while (wrongOptions.length < 3) {
      const wrongAnswer = answer + (Math.floor(Math.random() * 10) - 5);
      if (wrongAnswer !== answer && wrongAnswer > 0 && !wrongOptions.includes(wrongAnswer)) {
        wrongOptions.push(wrongAnswer);
      }
    }

    // Mix correct answer with wrong options
    const options = [answer, ...wrongOptions].sort(() => Math.random() - 0.5);

    return {
      question: questionText,
      questionAr: questionTextAr,
      answer,
      options,
      difficulty
    };
  }, []);

  const handleAnswer = useCallback(async (selectedAnswer: number) => {
    if (isAnswering || !currentQuestion) return;
    
    setIsAnswering(true);
    
    const isCorrect = selectedAnswer === currentQuestion.answer;
    
    if (isCorrect) {
      const points = 10 + (streak * 2) + (level * 5);
      
      // Update score and mark for callback
      setScore(prev => {
        const newScore = prev + points;
        scoreUpdateRef.current = newScore;
        return newScore;
      });
      
      setStreak(prev => prev + 1);
      setFeedback({
        type: 'correct',
        message: isRTL ? `ممتاز! +${points} نقطة` : `Excellent! +${points} points`
      });
      
      // Check for level up
      const newQuestionsAnswered = questionsAnswered + 1;
      if (newQuestionsAnswered % 5 === 0) {
        setLevel(prev => {
          const newLevel = prev + 1;
          levelUpdateRef.current = newLevel;
          return newLevel;
        });
      }
    } else {
      const newLives = lives - 1;
      
      // Update lives and mark for callback
      setLives(newLives);
      livesUpdateRef.current = newLives;
      
      setStreak(0);
      setFeedback({
        type: 'wrong',
        message: isRTL 
          ? `الإجابة الصحيحة هي ${currentQuestion.answer}` 
          : `Correct answer was ${currentQuestion.answer}`
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
    
    // Show feedback for 1.5 seconds then generate new question
    setTimeout(() => {
      setFeedback({ type: null, message: '' });
      setCurrentQuestion(generateQuestion(level));
      setIsAnswering(false);
    }, 1500);
  }, [isAnswering, currentQuestion, streak, level, questionsAnswered, lives, score, isRTL, onGameComplete, generateQuestion]);

  // Initialize first question
  useEffect(() => {
    if (!currentQuestion) {
      setCurrentQuestion(generateQuestion(1));
    }
  }, [currentQuestion, generateQuestion]);

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-6xl animate-bounce">🔢</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Game Stats */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Star className="w-5 h-5 text-yellow-500" />
          <span className="font-bold text-yellow-600">{score}</span>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Zap className="w-5 h-5 text-orange-500" />
          <span className="font-bold text-orange-600">{streak}</span>
        </div>
        <div className="flex items-center space-x-1 rtl:space-x-reverse">
          {[...Array(3)].map((_, i) => (
            <span
              key={i}
              className={`text-xl ${i < lives ? 'opacity-100' : 'opacity-20'}`}
            >
              ❤️
            </span>
          ))}
        </div>
      </div>

      {/* Question Display */}
      <motion.div
        key={currentQuestion.question}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="card-fun text-center bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200"
      >
        <div className="text-4xl mb-4">🤔</div>
        <h3 className="text-3xl font-bold text-gray-800 mb-2">
          {isRTL ? currentQuestion.questionAr : currentQuestion.question}
        </h3>
        <p className="text-gray-600">
          {isRTL ? "اختر الإجابة الصحيحة" : "Choose the correct answer"}
        </p>
      </motion.div>

      {/* Answer Options */}
      <div className="grid grid-cols-2 gap-4">
        <AnimatePresence>
          {currentQuestion.options.map((option, index) => (
            <motion.div
              key={`${currentQuestion.question}-${option}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                onClick={() => handleAnswer(option)}
                disabled={isAnswering}
                className={`w-full h-16 text-2xl font-bold transition-all duration-300 ${
                  isAnswering
                    ? option === currentQuestion.answer
                      ? "bg-green-500 hover:bg-green-500 text-white scale-110"
                      : "bg-gray-300 hover:bg-gray-300 text-gray-500"
                    : "bg-white hover:bg-purple-50 text-purple-600 border-2 border-purple-200 hover:border-purple-400 hover:scale-105 active:scale-95"
                } shadow-lg`}
              >
                {option}
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

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

      {/* Progress Indicator */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{isRTL ? "المستوى" : "Level"} {level}</span>
          <span>{isRTL ? "الأسئلة" : "Questions"}: {questionsAnswered}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((questionsAnswered % 5) / 5) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}