import { MathGame } from "./MathGame";
import { AlphabetGame } from "./AlphabetGame";
import { AnimalSoundGame } from "./AnimalSoundGame";
import { ColorGame } from "./ColorGame";
import { ShapeGame } from "./ShapeGame";
import { HealthyEatingGame } from "./HealthyEatingGame";
import { WeatherGame } from "./WeatherGame";
import { MemoryGame } from "./MemoryGame";
import { PuzzleGame } from "./PuzzleGame";

export interface GameStats {
  score: number;
  correct: number;
  total: number;
  timeSpent: number;
  level: number;
}

export interface GameProps {
  isRTL: boolean;
  onGameComplete: (stats: GameStats) => void;
  onScoreUpdate: (score: number) => void;
  onLivesUpdate: (lives: number) => void;
  onLevelUpdate: (level: number) => void;
}

interface GameEngineProps extends GameProps {
  gameId: string;
}

export function GameEngine({ gameId, ...props }: GameEngineProps) {
  const renderGame = () => {
    switch (gameId) {
      case "math":
        return <MathGame {...props} />;
      case "abc":
        return <AlphabetGame {...props} />;
      case "animals":
        return <AnimalSoundGame {...props} />;
      case "colors":
        return <ColorGame {...props} />;
      case "shapes":
        return <ShapeGame {...props} />;
      case "healthy-eating":
        return <HealthyEatingGame {...props} />;
      case "weather":
        return <WeatherGame {...props} />;
      case "memory":
        return <MemoryGame {...props} />;
      case "puzzle":
        return <PuzzleGame {...props} />;
      default:
        return (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {props.isRTL ? "قريباً!" : "Coming Soon!"}
              </h3>
              <p className="text-gray-600">
                {props.isRTL 
                  ? "نعمل على تطوير هذه اللعبة الرائعة!"
                  : "We're working on this amazing game!"
                }
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full grid place-items-stretch content-stretch">
      {renderGame()}
    </div>
  );
}