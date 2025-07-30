import { useState, useEffect, useCallback } from "react";
import { Button } from "../ui/button";
import { GameProps } from "./GameEngine";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Music, Play, Pause, Volume2 } from "lucide-react";

interface MusicNote {
  id: string;
  note: string;
  frequency: number;
  color: string;
  position: number;
}

interface MusicChallenge {
  type: 'repeat-sequence' | 'identify-instrument' | 'rhythm-match';
  sequence?: MusicNote[];
  targetInstrument?: string;
  rhythm?: number[];
  options: string[] | MusicNote[];
  question: string;
  questionAr: string;
  correctAnswer: string | MusicNote[];
}

const musicNotes: MusicNote[] = [
  { id: 'C', note: 'C', frequency: 261.63, color: 'bg-red-400', position: 1 },
  { id: 'D', note: 'D', frequency: 293.66, color: 'bg-orange-400', position: 2 },
  { id: 'E', note: 'E', frequency: 329.63, color: 'bg-yellow-400', position: 3 },
  { id: 'F', note: 'F', frequency: 349.23, color: 'bg-green-400', position: 4 },
  { id: 'G', note: 'G', frequency: 392.00, color: 'bg-blue-400', position: 5 },
  { id: 'A', note: 'A', frequency: 440.00, color: 'bg-indigo-400', position: 6 },
  { id: 'B', note: 'B', frequency: 493.88, color: 'bg-purple-400', position: 7 },
];

const instruments = [
  { name: "Piano", nameAr: "بيانو", emoji: "🎹", sound: "piano" },
  { name: "Guitar", nameAr: "جيتار", emoji: "🎸", sound: "guitar" },
  { name: "Drums", nameAr: "طبول", emoji: "🥁", sound: "drums" },
  { name: "Violin", nameAr: "كمان", emoji: "🎻", sound: "violin" },
  { name: "Flute", nameAr: "فلوت", emoji: "🪈", sound: "flute" },
  { name: "Trumpet", nameAr: "بوق", emoji: "🎺", sound: "trumpet" },
];

export function MusicGame({ isRTL, onGameComplete, onScoreUpdate, onLivesUpdate, onLevelUpdate }: GameProps) {
  const [currentChallenge, setCurrentChallenge] = useState<MusicChallenge | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong' | null; message: string }>({ type: null, message: '' });
  const [isAnswering, setIsAnswering] = useState(false);
  const [userSequence, setUserSequence] = useState<MusicNote[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  // Audio context for playing notes
  const playNote = useCallback((frequency: number, duration: number = 500) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.log('Audio not available');
    }
  }, []);

  const generateChallenge = useCallback((difficulty: number): MusicChallenge => {
    const challengeTypes: MusicChallenge['type'][] = ['repeat-sequence', 'identify-instrument'];
    if (difficulty > 2) challengeTypes.push('rhythm-match');

    const type = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];

    switch (type) {
      case 'repeat-sequence': {
        const sequenceLength = Math.min(2 + difficulty, 6);
        const sequence = Array.from({ length: sequenceLength }, () => 
          musicNotes[Math.floor(Math.random() * musicNotes.length)]
        );

        return {
          type,
          sequence,
          options: musicNotes,
          question: `Listen and repeat the sequence`,
          questionAr: `استمع وكرر التسلسل`,
          correctAnswer: sequence
        };
      }

      case 'identify-instrument': {
        const targetInstrument = instruments[Math.floor(Math.random() * instruments.length)];
        const wrongOptions = instruments
          .filter(i => i.name !== targetInstrument.name)
          .slice(0, 3)
          .map(i => i.name);
        
        const options = [targetInstrument.name, ...wrongOptions].sort(() => Math.random() - 0.5);

        return {
          type,
          targetInstrument: targetInstrument.name,
          options,
          question: `What instrument is this?`,
          questionAr: `ما هذه الآلة الموسيقية؟`,
          correctAnswer: targetInstrument.name
        };
      }

      case 'rhythm-match': {
        const rhythmLength = Math.min(3 + difficulty, 8);
        const rhythm = Array.from({ length: rhythmLength }, () => Math.random() > 0.5 ? 1 : 0);

        return {
          type,
          rhythm,
          options: ['Match', 'Different'],
          question: `Does this rhythm match?`,
          questionAr: `هل هذا الإيقاع متطابق؟`,
          correctAnswer: 'Match'
        };
      }

      default:
        return generateChallenge(1);
    }
  }, []);

  const playSequence = useCallback(async (sequence: MusicNote[]) => {
    setIsPlaying(true);
    
    for (let i = 0; i < sequence.length; i++) {
      const note = sequence[i];
      setCurrentlyPlaying(note.id);
      playNote(note.frequency, 400);
      
      await new Promise(resolve => setTimeout(resolve, 600));
      setCurrentlyPlaying(null);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setIsPlaying(false);
  }, [playNote]);

  const handleNoteClick = useCallback((note: MusicNote) => {
    if (!currentChallenge || currentChallenge.type !== 'repeat-sequence' || isAnswering) return;
    
    playNote(note.frequency, 300);
    setUserSequence(prev => [...prev, note]);
  }, [currentChallenge, isAnswering, playNote]);

  const handleAnswer = useCallback((answer: string | MusicNote[]) => {
    if (isAnswering || !currentChallenge) return;
    
    setIsAnswering(true);
    
    let isCorrect = false;
    
    if (currentChallenge.type === 'repeat-sequence') {
      const targetSequence = currentChallenge.sequence!;
      const userSeq = userSequence;
      isCorrect = userSeq.length === targetSequence.length && 
                  userSeq.every((note, index) => note.id === targetSequence[index].id);
    } else if (typeof answer === 'string') {
      isCorrect = answer === currentChallenge.correctAnswer;
    }
    
    if (isCorrect) {
      const points = 25 + (level * 8);
      setScore(prev => {
        const newScore = prev + points;
        onScoreUpdate(newScore);
        return newScore;
      });
      
      setFeedback({
        type: 'correct',
        message: isRTL ? `موسيقي رائع! +${points} نقطة` : `Great music! +${points} points`
      });
      
      if ((questionsAnswered + 1) % 3 === 0) {
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
    setUserSequence([]);
    
    setTimeout(() => {
      setFeedback({ type: null, message: '' });
      setCurrentChallenge(generateChallenge(level));
      setIsAnswering(false);
    }, 1500);
  }, [isAnswering, currentChallenge, userSequence, level, questionsAnswered, lives, score, isRTL, onScoreUpdate, onLevelUpdate, onLivesUpdate, onGameComplete, generateChallenge]);

  const renderChallenge = useCallback(() => {
    if (!currentChallenge) return null;

    switch (currentChallenge.type) {
      case 'repeat-sequence':
        return (
          <div className="space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="card-fun text-center bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200"
            >
              <Music className="w-12 h-12 mx-auto mb-4 text-purple-500" />
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {isRTL ? currentChallenge.questionAr : currentChallenge.question}
              </h3>
              
              <div className="space-y-4">
                <Button
                  onClick={() => playSequence(currentChallenge.sequence!)}
                  disabled={isPlaying}
                  className="btn-fun bg-purple-500 hover:bg-purple-600 text-white"
                >
                  <Volume2 className="w-5 h-5 mr-2" />
                  {isRTL ? "استمع للتسلسل" : "Play Sequence"}
                </Button>
                
                {userSequence.length > 0 && (
                  <div className="flex justify-center space-x-2 rtl:space-x-reverse">
                    {userSequence.map((note, index) => (
                      <div
                        key={index}
                        className={`w-8 h-8 rounded-full ${note.color} border-2 border-white shadow-sm flex items-center justify-center text-white font-bold text-sm`}
                      >
                        {note.note}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Music Notes */}
            <div className="grid grid-cols-4 gap-3">
              {musicNotes.slice(0, 4 + level).map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    onClick={() => handleNoteClick(note)}
                    disabled={isAnswering || isPlaying}
                    className={`w-full h-16 rounded-2xl ${note.color} hover:scale-105 transition-all duration-300 text-white font-bold text-xl shadow-lg border-4 ${
                      currentlyPlaying === note.id ? 'border-yellow-400 scale-110' : 'border-white'
                    }`}
                  >
                    {note.note}
                  </Button>
                </motion.div>
              ))}
            </div>

            {userSequence.length === currentChallenge.sequence?.length && (
              <Button
                onClick={() => handleAnswer(userSequence)}
                className="w-full btn-fun bg-green-500 hover:bg-green-600 text-white"
              >
                {isRTL ? "تحقق من الإجابة" : "Check Answer"}
              </Button>
            )}
          </div>
        );

      case 'identify-instrument':
        const targetInst = instruments.find(i => i.name === currentChallenge.targetInstrument);
        return (
          <div className="space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="card-fun text-center"
            >
              <div className="text-6xl mb-4">{targetInst?.emoji}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {isRTL ? currentChallenge.questionAr : currentChallenge.question}
              </h3>
              <Button
                onClick={() => {/* Play instrument sound */}}
                className="btn-fun bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Play className="w-5 h-5 mr-2" />
                {isRTL ? "استمع للصوت" : "Play Sound"}
              </Button>
            </motion.div>

            <div className="grid grid-cols-2 gap-3">
              {(currentChallenge.options as string[]).map((option, index) => {
                const inst = instruments.find(i => i.name === option);
                return (
                  <motion.div
                    key={option}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Button
                      onClick={() => handleAnswer(option)}
                      disabled={isAnswering}
                      className="w-full h-16 flex items-center space-x-3 rtl:space-x-reverse bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 hover:border-blue-400 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
                    >
                      <span className="text-2xl">{inst?.emoji}</span>
                      <span className="font-bold">
                        {isRTL ? inst?.nameAr : inst?.name}
                      </span>
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  }, [currentChallenge, isPlaying, userSequence, currentlyPlaying, isAnswering, isRTL, playSequence, handleNoteClick, handleAnswer, level]);

  // Initialize first challenge
  useEffect(() => {
    if (!currentChallenge) {
      setCurrentChallenge(generateChallenge(1));
    }
  }, [currentChallenge, generateChallenge]);

  if (!currentChallenge) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-6xl animate-pulse">🎵</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Game Stats */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Music className="w-5 h-5 text-purple-500" />
          <span className="font-bold text-purple-600">{score}</span>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse" />
          <span className="font-bold text-pink-600">{questionsAnswered}</span>
        </div>
        <div className="flex items-center space-x-1 rtl:space-x-reverse">
          {[...Array(3)].map((_, i) => (
            <span
              key={i}
              className={`text-xl ${i < lives ? 'opacity-100' : 'opacity-20'}`}
            >
              🎵
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
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${((questionsAnswered % 3) / 3) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}