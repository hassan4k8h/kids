import { useState, useEffect, useCallback } from "react";
import { Button } from "../ui/button";
import { GameProps } from "./GameEngine";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Puzzle, RotateCw, Shuffle } from "lucide-react";

interface PuzzlePiece {
  id: number;
  correctPosition: number;
  currentPosition: number;
  image: string;
  color: string;
}

interface PuzzleChallenge {
  type: 'jigsaw' | 'sliding' | 'pattern-complete';
  pieces: PuzzlePiece[];
  gridSize: number;
  targetPattern?: string[];
  question: string;
  questionAr: string;
}

const puzzleImages = [
  { emoji: "🌟", color: "bg-yellow-400" },
  { emoji: "🌈", color: "bg-purple-400" },
  { emoji: "🦄", color: "bg-pink-400" },
  { emoji: "🎈", color: "bg-red-400" },
  { emoji: "🎁", color: "bg-green-400" },
  { emoji: "🍎", color: "bg-red-500" },
  { emoji: "🌺", color: "bg-pink-500" },
  { emoji: "🦋", color: "bg-blue-400" },
  { emoji: "🎨", color: "bg-orange-400" },
];

export function PuzzleGame({ isRTL, onGameComplete, onScoreUpdate, onLivesUpdate, onLevelUpdate }: GameProps) {
  const [currentChallenge, setCurrentChallenge] = useState<PuzzleChallenge | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong' | null; message: string }>({ type: null, message: '' });
  const [isAnswering, setIsAnswering] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);

  const generateChallenge = useCallback((difficulty: number): PuzzleChallenge => {
    const challengeTypes: PuzzleChallenge['type'][] = ['sliding', 'jigsaw'];
    if (difficulty > 2) challengeTypes.push('pattern-complete');

    const type = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
    const gridSize = Math.min(2 + Math.floor(difficulty / 2), 4);
    const totalPieces = gridSize * gridSize;

    switch (type) {
      case 'sliding': {
        const pieces: PuzzlePiece[] = [];
        const usedImages = puzzleImages.slice(0, totalPieces - 1); // One less for empty space
        
        for (let i = 0; i < totalPieces - 1; i++) {
          pieces.push({
            id: i,
            correctPosition: i,
            currentPosition: i,
            image: usedImages[i].emoji,
            color: usedImages[i].color
          });
        }
        
        // Add empty space
        pieces.push({
          id: totalPieces - 1,
          correctPosition: totalPieces - 1,
          currentPosition: totalPieces - 1,
          image: "",
          color: "bg-gray-200"
        });

        // Shuffle pieces
        for (let i = 0; i < 100; i++) {
          const emptyIndex = pieces.findIndex(p => p.image === "");
          const neighbors = getNeighbors(emptyIndex, gridSize);
          if (neighbors.length > 0) {
            const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
            const emptyPiece = pieces[emptyIndex];
            const neighborPiece = pieces[randomNeighbor];
            
            // Swap positions
            const tempPos = emptyPiece.currentPosition;
            emptyPiece.currentPosition = neighborPiece.currentPosition;
            neighborPiece.currentPosition = tempPos;
            
            pieces[emptyIndex] = neighborPiece;
            pieces[randomNeighbor] = emptyPiece;
          }
        }

        return {
          type,
          pieces,
          gridSize,
          question: `Arrange the puzzle pieces in order`,
          questionAr: `رتب قطع الأحجية بالترتيب الصحيح`
        };
      }

      case 'jigsaw': {
        const pieces: PuzzlePiece[] = [];
        const usedImages = puzzleImages.slice(0, totalPieces);
        
        for (let i = 0; i < totalPieces; i++) {
          pieces.push({
            id: i,
            correctPosition: i,
            currentPosition: i,
            image: usedImages[i].emoji,
            color: usedImages[i].color
          });
        }
        
        // Shuffle pieces
        const shuffledPositions = Array.from({ length: totalPieces }, (_, i) => i);
        for (let i = shuffledPositions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledPositions[i], shuffledPositions[j]] = [shuffledPositions[j], shuffledPositions[i]];
        }
        
        pieces.forEach((piece, index) => {
          piece.currentPosition = shuffledPositions[index];
        });

        return {
          type,
          pieces,
          gridSize,
          question: `Put each piece in its correct place`,
          questionAr: `ضع كل قطعة في مكانها الصحيح`
        };
      }

      case 'pattern-complete': {
        const patternSize = 3;
        const pattern = ['🌟', '🌈', '🌟', '🌈', '🌟', '🌈', '?', '🌈', '🌟'];
        const pieces: PuzzlePiece[] = [];
        
        pattern.forEach((item, index) => {
          pieces.push({
            id: index,
            correctPosition: index,
            currentPosition: index,
            image: item,
            color: item === '🌟' ? 'bg-yellow-400' : item === '🌈' ? 'bg-purple-400' : 'bg-gray-200'
          });
        });

        return {
          type,
          pieces,
          gridSize: patternSize,
          targetPattern: pattern,
          question: `Complete the pattern`,
          questionAr: `أكمل النمط`
        };
      }

      default:
        return generateChallenge(1);
    }
  }, []);

  const getNeighbors = (index: number, gridSize: number): number[] => {
    const neighbors: number[] = [];
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;

    // Up
    if (row > 0) neighbors.push((row - 1) * gridSize + col);
    // Down
    if (row < gridSize - 1) neighbors.push((row + 1) * gridSize + col);
    // Left
    if (col > 0) neighbors.push(row * gridSize + (col - 1));
    // Right
    if (col < gridSize - 1) neighbors.push(row * gridSize + (col + 1));

    return neighbors;
  };

  const handlePieceClick = useCallback((pieceIndex: number) => {
    if (!currentChallenge || isAnswering) return;

    if (currentChallenge.type === 'sliding') {
      const pieces = [...currentChallenge.pieces];
      const emptyIndex = pieces.findIndex(p => p.image === "");
      const clickedPiece = pieces[pieceIndex];
      
      if (getNeighbors(emptyIndex, currentChallenge.gridSize).includes(pieceIndex)) {
        // Swap with empty space
        const emptyPiece = pieces[emptyIndex];
        const tempPos = emptyPiece.currentPosition;
        emptyPiece.currentPosition = clickedPiece.currentPosition;
        clickedPiece.currentPosition = tempPos;
        
        pieces[emptyIndex] = clickedPiece;
        pieces[pieceIndex] = emptyPiece;
        
        setCurrentChallenge(prev => prev ? { ...prev, pieces } : null);
        setMoves(prev => prev + 1);
        
        // Check if solved
        const isSolved = pieces.every(piece => piece.currentPosition === piece.correctPosition);
        if (isSolved) {
          handlePuzzleSolved();
        }
      }
    } else if (currentChallenge.type === 'jigsaw') {
      if (selectedPiece === null) {
        setSelectedPiece(pieceIndex);
      } else if (selectedPiece === pieceIndex) {
        setSelectedPiece(null);
      } else {
        // Swap pieces
        const pieces = [...currentChallenge.pieces];
        const piece1 = pieces[selectedPiece];
        const piece2 = pieces[pieceIndex];
        
        const tempPos = piece1.currentPosition;
        piece1.currentPosition = piece2.currentPosition;
        piece2.currentPosition = tempPos;
        
        pieces[selectedPiece] = piece2;
        pieces[pieceIndex] = piece1;
        
        setCurrentChallenge(prev => prev ? { ...prev, pieces } : null);
        setSelectedPiece(null);
        setMoves(prev => prev + 1);
        
        // Check if solved
        const isSolved = pieces.every(piece => piece.currentPosition === piece.correctPosition);
        if (isSolved) {
          handlePuzzleSolved();
        }
      }
    }
  }, [currentChallenge, isAnswering, selectedPiece]);

  const handlePuzzleSolved = useCallback(() => {
    setIsAnswering(true);
    
    const basePoints = 40;
    const moveBonus = Math.max(0, 20 - moves);
    const points = basePoints + moveBonus + (level * 10);
    
    setScore(prev => {
      const newScore = prev + points;
      onScoreUpdate(newScore);
      return newScore;
    });
    
    setFeedback({
      type: 'correct',
      message: isRTL ? `ممتاز! +${points} نقطة` : `Excellent! +${points} points`
    });
    
    if ((questionsAnswered + 1) % 2 === 0) {
      setLevel(prev => {
        const newLevel = prev + 1;
        onLevelUpdate(newLevel);
        return newLevel;
      });
    }
    
    setQuestionsAnswered(prev => prev + 1);
    setMoves(0);
    
    setTimeout(() => {
      setFeedback({ type: null, message: '' });
      setCurrentChallenge(generateChallenge(level));
      setIsAnswering(false);
    }, 2000);
  }, [moves, level, questionsAnswered, score, isRTL, onScoreUpdate, onLevelUpdate, generateChallenge]);

  const shufflePieces = useCallback(() => {
    if (!currentChallenge || isAnswering) return;
    
    const pieces = [...currentChallenge.pieces];
    
    if (currentChallenge.type === 'sliding') {
      // Perform random valid moves
      for (let i = 0; i < 20; i++) {
        const emptyIndex = pieces.findIndex(p => p.image === "");
        const neighbors = getNeighbors(emptyIndex, currentChallenge.gridSize);
        if (neighbors.length > 0) {
          const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
          const emptyPiece = pieces[emptyIndex];
          const neighborPiece = pieces[randomNeighbor];
          
          const tempPos = emptyPiece.currentPosition;
          emptyPiece.currentPosition = neighborPiece.currentPosition;
          neighborPiece.currentPosition = tempPos;
          
          pieces[emptyIndex] = neighborPiece;
          pieces[randomNeighbor] = emptyPiece;
        }
      }
    } else {
      // Random shuffle for jigsaw
      for (let i = pieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tempPos = pieces[i].currentPosition;
        pieces[i].currentPosition = pieces[j].currentPosition;
        pieces[j].currentPosition = tempPos;
        [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
      }
    }
    
    setCurrentChallenge(prev => prev ? { ...prev, pieces } : null);
    setMoves(0);
  }, [currentChallenge, isAnswering]);

  // Initialize first challenge
  useEffect(() => {
    if (!currentChallenge) {
      setCurrentChallenge(generateChallenge(1));
    }
  }, [currentChallenge, generateChallenge]);

  if (!currentChallenge) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-6xl animate-pulse">🧩</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Game Stats */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Puzzle className="w-5 h-5 text-blue-500" />
          <span className="font-bold text-blue-600">{score}</span>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <RotateCw className="w-5 h-5 text-green-500" />
          <span className="font-bold text-green-600">{moves}</span>
        </div>
        <div className="flex items-center space-x-1 rtl:space-x-reverse">
          {[...Array(3)].map((_, i) => (
            <span
              key={i}
              className={`text-xl ${i < lives ? 'opacity-100' : 'opacity-20'}`}
            >
              🧩
            </span>
          ))}
        </div>
      </div>

      {/* Challenge Header */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="card-fun text-center bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200"
      >
        <Puzzle className="w-12 h-12 mx-auto mb-4 text-blue-500" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {isRTL ? currentChallenge.questionAr : currentChallenge.question}
        </h3>
        <p className="text-gray-600 text-sm">
          {isRTL ? `الحركات: ${moves}` : `Moves: ${moves}`}
        </p>
      </motion.div>

      {/* Puzzle Grid */}
      <div className="bg-white rounded-2xl p-4 shadow-lg">
        <div 
          className="grid gap-2 mx-auto"
          style={{ 
            gridTemplateColumns: `repeat(${currentChallenge.gridSize}, 1fr)`,
            maxWidth: '300px'
          }}
        >
          {Array.from({ length: currentChallenge.gridSize * currentChallenge.gridSize }).map((_, index) => {
            const piece = currentChallenge.pieces.find(p => p.currentPosition === index);
            const isEmpty = piece?.image === "";
            const isSelected = selectedPiece !== null && currentChallenge.pieces[selectedPiece] === piece;
            
            return (
              <motion.div
                key={index}
                whileHover={!isEmpty ? { scale: 1.05 } : {}}
                whileTap={!isEmpty ? { scale: 0.95 } : {}}
                onClick={() => piece && handlePieceClick(currentChallenge.pieces.indexOf(piece))}
                className={`aspect-square rounded-lg flex items-center justify-center text-2xl font-bold cursor-pointer transition-all duration-300 ${
                  isEmpty 
                    ? 'bg-gray-100 border-2 border-dashed border-gray-300' 
                    : `${piece.color} shadow-lg hover:shadow-xl border-2 ${
                        isSelected ? 'border-yellow-400 scale-110' : 'border-white'
                      }`
                }`}
              >
                {piece?.image}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4 rtl:space-x-reverse">
        <Button
          onClick={shufflePieces}
          disabled={isAnswering}
          className="btn-fun bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Shuffle className="w-5 h-5 mr-2" />
          {isRTL ? "خلط" : "Shuffle"}
        </Button>
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

      {/* Progress */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{isRTL ? "المستوى" : "Level"} {level}</span>
          <span>{isRTL ? "الألغاز" : "Puzzles"}: {questionsAnswered}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${((questionsAnswered % 2) / 2) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}