import { useState, useEffect, useCallback } from "react";
import { Button } from "../ui/button";
import { GameProps } from "./GameEngine";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Puzzle, RotateCw, Shuffle } from "lucide-react";
import { formatNumber } from "../../utils/locale.ts";
import { levelIndex, rotateArray } from "../../utils/deterministic";

interface PuzzlePiece {
  id: number;
  correctPosition: number;
  currentPosition: number;
  image: string;
  color: string;
  isTarget?: boolean; // للأنماط الخاصة مثل odd-one-out
}

interface PuzzleChallenge {
  id: string;
  type: 'jigsaw' | 'sliding' | 'pattern-complete' | 'odd-one-out' | 'sequence-order' | 'shape-order';
  pieces: PuzzlePiece[];
  gridSize: number;
  targetPattern?: string[];
  question: string;
  questionAr: string;
  help?: string;
  helpAr?: string;
  options?: string[]; // لخيارات التفاعل في بعض الأنماط مثل pattern-complete
  reference?: string[]; // ترتيب مرجعي للعرض (مثل jigsaw)
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
  const MAX_LEVEL = 20;
  const [currentChallenge, setCurrentChallenge] = useState<PuzzleChallenge | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong' | null; message: string }>({ type: null, message: '' });
  const [isAnswering, setIsAnswering] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [usedChallengeIds, setUsedChallengeIds] = useState<Set<string>>(new Set());
  const [sessionSeed] = useState<number>(() => Math.floor(Math.random() * 10000));
  const [endlessMode] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  const generateUniqueId = (base: string) => {
    let attempt = 0;
    let id = `${base}`;
    while (usedChallengeIds.has(id) && attempt < 10) {
      attempt += 1;
      id = `${base}-${attempt}`;
    }
    return id;
  };

  const generateChallenge = useCallback((difficulty: number): PuzzleChallenge => {
    const challengeTypes: PuzzleChallenge['type'][] = ['sliding', 'jigsaw', 'pattern-complete', 'odd-one-out', 'sequence-order', 'shape-order'];
    const type = challengeTypes[levelIndex(level + sessionSeed, challengeTypes.length)];
    // اجعل جميع الأوضاع سهلة: شبكات صغيرة وواضحة
    const gridBase = level <= 5 ? 2 : 3; // 2x2 للمستويات الأولى ثم 3x3
    const gridSize = type === 'sliding' || type === 'jigsaw' ? gridBase : (type === 'pattern-complete' ? 3 : 1);
    const totalPieces = gridSize * gridSize;

    switch (type) {
      case 'sliding': {
        const pieces: PuzzlePiece[] = [];
        const usedImages = rotateArray(puzzleImages, (level + sessionSeed) % puzzleImages.length).slice(0, totalPieces - 1);
        
        for (let i = 0; i < totalPieces - 1; i++) {
          pieces.push({
            id: i,
            correctPosition: i,
            currentPosition: i,
            image: usedImages[i]?.emoji || '⬜',
            color: usedImages[i]?.color || 'bg-gray-200'
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
        // تحريك حتمي بعدد خطوات يعتمد على المستوى
        const shuffleSteps = Math.min(20, 6 + Math.floor(level * 1.5));
        for (let i = 0; i < shuffleSteps; i++) {
          const emptyIndex = pieces.findIndex(p => p.image === "");
          const neighbors = getNeighbors(emptyIndex, gridSize);
          if (neighbors.length > 0) {
            const stepIndex = neighbors[levelIndex(level + sessionSeed + i, neighbors.length)];
            const emptyPiece = pieces[emptyIndex];
            const neighborPiece = pieces[stepIndex];
            const tempPos = emptyPiece.currentPosition;
            emptyPiece.currentPosition = neighborPiece.currentPosition;
            neighborPiece.currentPosition = tempPos;
            pieces[emptyIndex] = neighborPiece;
            pieces[stepIndex] = emptyPiece;
          }
        }

        return {
          id: generateUniqueId(`sliding-${gridSize}-${level + sessionSeed}`),
          type,
          pieces,
          gridSize,
          question: `Arrange the puzzle pieces in order`,
          questionAr: `رتب قطع الأحجية بالترتيب الصحيح`,
          help: 'Tap a tile next to the empty cell to move it. Correct order means tiles go left-to-right, top-to-bottom, with the empty cell in the last bottom-right slot.',
          helpAr: 'انقر قطعة مجاورة للمربع الفارغ لتحريكها. الترتيب الصحيح يعني أن القطع تُرتّب من اليسار إلى اليمين ثم من الأعلى إلى الأسفل، مع بقاء المربع الفارغ في الزاوية السفلية اليمنى.'
        };
      }

      case 'jigsaw': {
        const pieces: PuzzlePiece[] = [];
        const usedImages2 = rotateArray(puzzleImages, (level + sessionSeed) % puzzleImages.length).slice(0, totalPieces);
        
        for (let i = 0; i < totalPieces; i++) {
          pieces.push({
            id: i,
            correctPosition: i,
            currentPosition: i,
            image: usedImages2[i]?.emoji || '⬜',
            color: usedImages2[i]?.color || 'bg-gray-200'
          });
        }
        
        // Shuffle pieces
        const shuffledPositions = rotateArray(Array.from({ length: totalPieces }, (_, i) => i), (level + sessionSeed) % Math.max(1, totalPieces));
        
        pieces.forEach((piece, index) => {
          piece.currentPosition = shuffledPositions[index];
        });

        return {
          id: generateUniqueId(`jigsaw-${gridSize}-${level + sessionSeed}`),
          type,
          pieces,
          gridSize,
          question: `Put each piece in its correct place`,
          questionAr: `ضع كل قطعة في مكانها الصحيح`,
          help: 'Select two tiles to swap. Match the emoji and background color to the faint reference above each cell.',
          helpAr: 'اختر قطعتين للتبديل. طابِق الرمز مع لون الخلفية مع الدليل الخافت فوق كل خلية.',
          reference: usedImages2.map(u => `${u?.emoji || ''}|${u?.color || 'bg-gray-200'}`)
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
          id: generateUniqueId(`pattern-${level + sessionSeed}`),
          type,
          pieces,
          gridSize: patternSize,
          targetPattern: pattern,
          question: `Complete the pattern`,
          questionAr: `أكمل النمط`,
          help: 'Find the missing item that completes the pattern.',
          helpAr: 'اكتشف العنصر المفقود لإكمال النمط.',
          options: ['🌟', '🌈']
        };
      }

      case 'odd-one-out': {
        const size = 3; // شبكة 3x3
        const base = puzzleImages[levelIndex(level + sessionSeed, puzzleImages.length)];
        const odd = puzzleImages[levelIndex(level + sessionSeed + 3, puzzleImages.length)];
        const pieces: PuzzlePiece[] = [];
        const total = size * size;
        const targetIndex = (level + sessionSeed) % total;
        for (let i = 0; i < total; i++) {
          const isTarget = i === targetIndex;
          const img = isTarget ? odd : base;
          pieces.push({
            id: i,
            correctPosition: i,
            currentPosition: i,
            image: img.emoji,
            color: img.color,
            isTarget
          });
        }
        return {
          id: generateUniqueId(`odd-${base.emoji}-${odd.emoji}-${targetIndex}`),
          type: 'odd-one-out',
          pieces,
          gridSize: size,
          question: `Find the different tile`,
          questionAr: `أوجد القطعة المختلفة`,
          help: 'Only one tile is different from the others. Tap it.',
          helpAr: 'هناك قطعة واحدة مختلفة عن الباقي، اضغط عليها.'
        };
      }

      case 'sequence-order': {
        const size = 1; // صف واحد
        const count = Math.min(3 + Math.floor(level / 3), 6);
        const numbers = Array.from({ length: count }, (_, i) => i + 1);
        const shuffled = rotateArray(numbers, (level + sessionSeed) % count);
        const pieces: PuzzlePiece[] = shuffled.map((n, idx) => ({
          id: idx,
          correctPosition: n - 1,
          currentPosition: idx,
          image: String(n),
          color: 'bg-blue-200'
        }));
        return {
          id: generateUniqueId(`seq-${count}-${level + sessionSeed}`),
          type: 'sequence-order',
          pieces,
          gridSize: count, // شبكة 1xN
          question: `Arrange numbers in ascending order`,
          questionAr: `رتب الأرقام ترتيبًا تصاعديًا`,
          help: 'Swap any two tiles until the order becomes 1 → N.',
          helpAr: 'بدّل بين أي قطعتين حتى يصبح الترتيب 1 ← إلى N.'
        };
      }

      case 'shape-order': {
        // رتب الأشكال من الأقل أضلاعًا إلى الأكثر (سهل وواضح) كصف واحد قابل للتبديل
        const count = 4;
        const shapeSeq = [
          { emoji: '⭕', sides: 0, color: 'bg-gray-200' },
          { emoji: '🔺', sides: 3, color: 'bg-yellow-200' },
          { emoji: '🟩', sides: 4, color: 'bg-green-200' },
          { emoji: '⬟', sides: 5, color: 'bg-red-200' }
        ];
        const order = rotateArray(shapeSeq, (level + sessionSeed) % count);
        const pieces: PuzzlePiece[] = order.map((s, idx) => ({
          id: idx,
          correctPosition: shapeSeq.findIndex(x => x.emoji === s.emoji),
          currentPosition: idx,
          image: s.emoji,
          color: s.color
        }));
        return {
          id: generateUniqueId(`shape-order-${level + sessionSeed}`),
          type: 'shape-order',
          pieces,
          gridSize: count,
          question: `Arrange shapes from fewest sides to most sides`,
          questionAr: `رتب الأشكال من الأقل أضلاعًا إلى الأكثر`,
          help: 'Swap adjacent tiles until the order becomes: circle → triangle → square → pentagon.',
          helpAr: 'بدّل القطع حتى يصبح الترتيب: دائرة ← مثلث ← مربع ← خماسي.'
        };
      }

      default:
        return generateChallenge(1);
    }
  }, [level, sessionSeed, usedChallengeIds]);

  // توليد تحدٍ جديد غير مستخدم قدر الإمكان
  const createNextChallenge = useCallback((difficulty: number): PuzzleChallenge => {
    for (let attempt = 0; attempt < 8; attempt++) {
      const ch = generateChallenge(difficulty + attempt % 2); // حاول تغيير بسيط
      if (!usedChallengeIds.has(ch.id)) return ch;
    }
    // إذا استهلكنا معظم الأنماط، نظّف السجل لإتاحة التكرار البعيد
    setUsedChallengeIds(new Set());
    return generateChallenge(difficulty);
  }, [generateChallenge, usedChallengeIds]);

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

  const handlePuzzleSolved = useCallback(() => {
    setIsAnswering(true);
    
    const basePoints = 40;
    const moveBonus = Math.max(0, 20 - moves);
    const points = basePoints + moveBonus + (level * 10);
    
    setScore(prev => prev + points);
    
    setFeedback({
      type: 'correct',
      message: isRTL ? `ممتاز! +${points} نقطة` : `Excellent! +${points} points`
    });
    
    // كل لغز يرفع المستوى حتى الحد الأقصى المخفّض
    setLevel(prev => Math.min(prev + 1, MAX_LEVEL));
    
    setQuestionsAnswered(prev => prev + 1);
    setMoves(0);
    
    setTimeout(() => {
      setFeedback({ type: null, message: '' });
      // تسجيل معرف التحدي المستخدم لمنع التكرار
      if (currentChallenge?.id) setUsedChallengeIds(prev => new Set(prev).add(currentChallenge.id));
      setCurrentChallenge(createNextChallenge(level + 1));
      setIsAnswering(false);
    }, 2000);
  }, [moves, level, questionsAnswered, isRTL, onScoreUpdate, onLevelUpdate, currentChallenge, createNextChallenge, endlessMode]);

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
    } else if (currentChallenge.type === 'jigsaw' || currentChallenge.type === 'sequence-order' || currentChallenge.type === 'shape-order') {
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
    } else if (currentChallenge.type === 'odd-one-out') {
        const piece = currentChallenge.pieces[pieceIndex];
      setMoves(prev => prev + 1);
        if (piece && piece.isTarget) {
        handlePuzzleSolved();
      } else {
        // تغذية خاطئة بدون خصم حياة
        setFeedback({
          type: 'wrong',
          message: isRTL ? 'ليست القطعة المختلفة!' : 'Not the odd one!'
        });
        setTimeout(() => setFeedback({ type: null, message: '' }), 1000);
      }
    } else if (currentChallenge.type === 'pattern-complete') {
      // تحويل النقر على الخلية التي تحتوي على '?' للتبديل بين الخيارات
      const pieces = [...currentChallenge.pieces];
      const missingIndex = pieces.findIndex(p => p.image === '?');
      if (missingIndex === -1) return;
      const options = currentChallenge.options || ['🌟', '🌈'];
      const current = options.indexOf(pieces[missingIndex].color === 'bg-yellow-400' ? '🌟' : '🌈');
      const nextSymbol = options[(current + 1) % options.length];
      pieces[missingIndex] = {
        ...pieces[missingIndex],
        image: nextSymbol,
        color: nextSymbol === '🌟' ? 'bg-yellow-400' : 'bg-purple-400'
      };
      setCurrentChallenge(prev => prev ? { ...prev, pieces } : null);
      setMoves(prev => prev + 1);
      // تحقق من اكتمال النمط
      const expected = ['🌟', '🌈', '🌟', '🌈', '🌟', '🌈', nextSymbol, '🌈', '🌟'];
      const isCorrect = pieces.every((p, i) => p.image === expected[i]);
      if (isCorrect) handlePuzzleSolved();
    }
  }, [currentChallenge, isAnswering, selectedPiece, isRTL, handlePuzzleSolved]);

  const shufflePieces = useCallback(() => {
    if (!currentChallenge || isAnswering) return;
    
    const pieces = [...currentChallenge.pieces];
    
    if (currentChallenge.type === 'sliding') {
      // تحريك حتمي يعتمد على المستوى الحالي وعدد الحركات
      for (let i = 0; i < 20; i++) {
        const emptyIndex = pieces.findIndex(p => p.image === "");
        const neighbors = getNeighbors(emptyIndex, currentChallenge.gridSize);
        if (neighbors.length > 0) {
          const idx = neighbors[(level + i) % neighbors.length];
          const emptyPiece = pieces[emptyIndex];
          const neighborPiece = pieces[idx];
          const tempPos = emptyPiece.currentPosition;
          emptyPiece.currentPosition = neighborPiece.currentPosition;
          neighborPiece.currentPosition = tempPos;
          pieces[emptyIndex] = neighborPiece;
          pieces[idx] = emptyPiece;
        }
      }
    } else {
      // خلط حتمي بالاعتماد على دوران المصفوفة
      for (let i = 0; i < pieces.length; i++) {
        const j = (i + level) % pieces.length;
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
      setCurrentChallenge(createNextChallenge(1));
    }
  }, [currentChallenge, createNextChallenge]);

  const skipChallenge = useCallback(() => {
    if (!currentChallenge || isAnswering) return;
    setSelectedPiece(null);
    setMoves(0);
    setFeedback({ type: null, message: '' });
    setCurrentChallenge(createNextChallenge(level));
  }, [currentChallenge, isAnswering, level, createNextChallenge]);

  const resetSession = useCallback(() => {
    setScore(0);
    setLevel(1);
    setQuestionsAnswered(0);
    setUsedChallengeIds(new Set());
    setSelectedPiece(null);
    setMoves(0);
    setFeedback({ type: null, message: '' });
    setCurrentChallenge(createNextChallenge(1));
  }, [createNextChallenge]);

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
          <span className="font-bold text-blue-600">{formatNumber(score, isRTL)}</span>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <RotateCw className="w-5 h-5 text-green-500" />
          <span className="font-bold text-green-600">{formatNumber(moves, isRTL)}</span>
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
          {isRTL ? `الحركات: ${formatNumber(moves, isRTL)}` : `Moves: ${formatNumber(moves, isRTL)}`}
          </p>
        {currentChallenge.help && (
          <p className="text-xs mt-2 text-gray-500">
            {isRTL ? currentChallenge.helpAr : currentChallenge.help}
          </p>
        )}
        {currentChallenge.type === 'sliding' && (
          <div className="grid grid-cols-3 gap-1 max-w-[140px] mx-auto mt-2 text-[10px] text-gray-500">
            <div>1</div><div>2</div><div>3</div>
            <div>4</div><div>5</div><div>6</div>
            <div>7</div><div>8</div><div>□</div>
          </div>
        )}
      </motion.div>

      {/* Puzzle Grid */}
      <div className="bg-white rounded-2xl p-4 shadow-lg">
        {/* مرجع خافت للمكان الصحيح في نمط jigsaw */}
        {currentChallenge.reference && (
          <div className="grid gap-1 mx-auto mb-3 opacity-40" style={{ gridTemplateColumns: `repeat(${currentChallenge.gridSize}, 1fr)`, maxWidth: '300px' }}>
            {Array.from({ length: currentChallenge.gridSize * currentChallenge.gridSize }).map((_, i) => {
              const ref = currentChallenge.reference![i]?.split('|') || [];
              const emoji = ref[0] || '';
              const color = ref[1] || 'bg-gray-100';
              return (
                <div key={`ref-${i}`} className={`aspect-square rounded-md border ${color} flex items-center justify-center text-xl`}>{emoji}</div>
              );
            })}
          </div>
        )}
        <div 
          className="grid gap-2 mx-auto"
          style={{ 
            gridTemplateColumns: `repeat(${currentChallenge.gridSize}, 1fr)`,
            maxWidth: '300px'
          }}
        >
          {Array.from({ length: ((currentChallenge.type === 'sequence-order' || currentChallenge.type === 'shape-order') ? currentChallenge.gridSize : currentChallenge.gridSize * currentChallenge.gridSize) }).map((_, index) => {
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
                    : `${piece?.color || 'bg-gray-200'} shadow-lg hover:shadow-xl border-2 ${
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
        <Button
          onClick={skipChallenge}
          disabled={isAnswering}
          className="btn-fun bg-blue-500 hover:bg-blue-600 text-white"
        >
          {isRTL ? "تخطي" : "Skip"}
        </Button>
        <Button
          onClick={resetSession}
          disabled={isAnswering}
          className="btn-fun bg-gray-600 hover:bg-gray-700 text-white"
        >
          {isRTL ? "إعادة" : "Reset"}
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
          <span>{isRTL ? "المستوى" : "Level"} {formatNumber(level, isRTL)}</span>
          <span>{isRTL ? "الألغاز" : "Puzzles"}: {formatNumber(questionsAnswered, isRTL)}</span>
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