import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { Filter, X, BookOpen, Gamepad2, Zap, Target, Lightbulb, Calculator, Palette, Puzzle, Brain } from "lucide-react";

interface GameFiltersProps {
  selectedCategory: string;
  selectedDifficulty: string;
  onCategoryChange: (category: string) => void;
  onDifficultyChange: (difficulty: string) => void;
  categoryNames: Record<string, { name: string; nameAr: string }>;
  difficultyNames: Record<string, { name: string; nameAr: string; color: string }>;
  isRTL: boolean;
}

const categoryIcons: Record<string, any> = {
  all: Gamepad2,
  educational: BookOpen,
  puzzle: Puzzle,
  action: Zap,
  creative: Palette,
  language: BookOpen,
  math: Calculator,
  science: Lightbulb,
  memory: Brain
};

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  all: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  educational: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  puzzle: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  action: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  creative: { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-300' },
  language: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300' },
  math: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  science: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-300' },
  memory: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' }
};

const difficultyColors: Record<string, { bg: string; text: string; border: string }> = {
  all: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  easy: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  hard: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' }
};

export function GameFilters({
  selectedCategory, 
  selectedDifficulty, 
  onCategoryChange, 
  onDifficultyChange,
  categoryNames,
  difficultyNames,
  isRTL
}: GameFiltersProps) {
  const hasActiveFilters = selectedCategory !== "all" || selectedDifficulty !== "all";

  const clearAllFilters = () => {
    onCategoryChange("all");
    onDifficultyChange("all");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/50"
    >
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {isRTL ? "فلترة الألعاب" : "Filter Games"}
            </h3>
            <p className="text-sm text-gray-600">
              {isRTL ? "ابحث عن ألعابك المفضلة" : "Find your favorite games"}
            </p>
          </div>
        </div>
        
        {hasActiveFilters && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="text-gray-600 hover:text-red-600 border-gray-300 hover:border-red-300 rounded-xl"
            >
              <X className="w-4 h-4 mr-2" />
              {isRTL ? "مسح الكل" : "Clear All"}
            </Button>
          </motion.div>
        )}
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-3 flex items-center space-x-2 rtl:space-x-reverse">
          <Target className="w-4 h-4" />
          <span>{isRTL ? "الفئة" : "Category"}</span>
        </h4>
        <div className="flex flex-wrap gap-2">
          {/* All Categories */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              onClick={() => onCategoryChange("all")}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 border-2 ${
                selectedCategory === "all"
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-lg"
                  : `${categoryColors.all.bg} ${categoryColors.all.text} ${categoryColors.all.border} hover:shadow-md`
              }`}
            >
              <Gamepad2 className="w-4 h-4 mr-2" />
              {isRTL ? "جميع الألعاب" : "All Games"}
            </Button>
          </motion.div>

          {/* Individual Categories */}
          {Object.entries(categoryNames)
            .filter(([key]) => key !== "all")
            .map(([category, names], index) => {
              const IconComponent = categoryIcons[category] || Gamepad2;
              const colors = categoryColors[category] || categoryColors.all;
              
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    onClick={() => onCategoryChange(category)}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 border-2 ${
                      selectedCategory === category
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-lg"
                        : `${colors.bg} ${colors.text} ${colors.border} hover:shadow-md`
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {isRTL ? names.nameAr : names.name}
                  </Button>
                </motion.div>
              );
            })}
        </div>
      </div>

      {/* Difficulty Filter */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-3 flex items-center space-x-2 rtl:space-x-reverse">
          <Zap className="w-4 h-4" />
          <span>{isRTL ? "مستوى الصعوبة" : "Difficulty Level"}</span>
        </h4>
        <div className="flex flex-wrap gap-2">
          {/* All Difficulties */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              onClick={() => onDifficultyChange("all")}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 border-2 ${
                selectedDifficulty === "all"
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-lg"
                  : `${difficultyColors.all.bg} ${difficultyColors.all.text} ${difficultyColors.all.border} hover:shadow-md`
              }`}
            >
              <Target className="w-4 h-4 mr-2" />
              {isRTL ? "جميع المستويات" : "All Levels"}
            </Button>
          </motion.div>

          {/* Individual Difficulties */}
          {Object.entries(difficultyNames).map(([difficulty, names], index) => {
            const colors = difficultyColors[difficulty] || difficultyColors.all;
            
            return (
              <motion.div
                key={difficulty}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (index + 4) * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  onClick={() => onDifficultyChange(difficulty)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 border-2 ${
                    selectedDifficulty === difficulty
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-lg"
                      : `${colors.bg} ${colors.text} ${colors.border} hover:shadow-md`
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    difficulty === 'easy' ? 'bg-green-500' :
                    difficulty === 'medium' ? 'bg-yellow-500' :
                    difficulty === 'hard' ? 'bg-red-500' : 'bg-gray-500'
                  }`} />
                  {isRTL ? names.nameAr : names.name}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 pt-4 border-t border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600">
              <span>{isRTL ? "المرشحات النشطة:" : "Active filters:"}</span>
              {selectedCategory !== "all" && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg font-medium">
                  {isRTL ? categoryNames[selectedCategory]?.nameAr : categoryNames[selectedCategory]?.name}
                </span>
              )}
              {selectedDifficulty !== "all" && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg font-medium">
                  {isRTL ? difficultyNames[selectedDifficulty]?.nameAr : difficultyNames[selectedDifficulty]?.name}
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {isRTL ? "إجمالي النتائج:" : "Total results:"} <span className="font-bold text-blue-600">5</span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}