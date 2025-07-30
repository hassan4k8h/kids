export interface Game {
  id: string;
  completed: boolean;
  locked: boolean;
  difficulty: "easy" | "medium" | "hard";
  category: "educational" | "puzzle" | "action" | "creative" | "language" | "math" | "science" | "memory";
  estimatedTime: number; // in minutes
  maxLevel: number;
  description: string;
  descriptionAr: string;
  order: number; // ترتيب اللعبة
  prerequisites?: string[]; // الألعاب المطلوبة لفتح هذه اللعبة
  featured?: boolean; // مميزة أم لا
}

// الألعاب مرتبة بناءً على الصعوبة والتقدم التعليمي
export const games: Game[] = [
  // ====== المستوى الأول: الألعاب الأساسية (سهل) ======
  
  // الأحرف والكلمات - الأساس
  {
    id: "abc",
    completed: false,
    locked: false,
    difficulty: "easy",
    category: "language",
    estimatedTime: 10,
    maxLevel: 120,
    description: "Learn Arabic letters and words through interactive games",
    descriptionAr: "تعلم الحروف العربية والكلمات من خلال ألعاب تفاعلية",
    order: 1,
    featured: true
  },

  // الأرقام والحساب البسيط
  {
    id: "math",
    completed: false,
    locked: false,
    difficulty: "easy",
    category: "math",
    estimatedTime: 15,
    maxLevel: 120,
    description: "Practice basic math skills with fun exercises",
    descriptionAr: "تدرب على مهارات الرياضيات الأساسية مع تمارين ممتعة",
    order: 2,
    featured: true
  },

  // الألوان - التعلم البصري
  {
    id: "colors",
    completed: false,
    locked: false,
    difficulty: "easy",
    category: "educational",
    estimatedTime: 8,
    maxLevel: 120,
    description: "Explore the world of colors through engaging activities",
    descriptionAr: "استكشف عالم الألوان من خلال أنشطة جذابة",
    order: 3,
    featured: true
  },

  // الحيوانات - المعرفة العامة
  {
    id: "animals",
    completed: false,
    locked: false,
    difficulty: "easy",
    category: "educational",
    estimatedTime: 12,
    maxLevel: 120,
    description: "Discover animals and their sounds in this interactive adventure",
    descriptionAr: "اكتشف الحيوانات وأصواتها في هذه المغامرة التفاعلية",
    order: 4
  },

  // الأكل الصحي - تعليم القيم
  {
    id: "healthy-eating",
    completed: false,
    locked: false,
    difficulty: "easy",
    category: "educational",
    estimatedTime: 12,
    maxLevel: 120,
    description: "Learn about nutrition and healthy food choices",
    descriptionAr: "تعلم عن التغذية والخيارات الغذائية الصحية",
    order: 5
  },

  // الموسيقى - الإبداع البسيط
  {
    id: "music",
    completed: false,
    locked: false,
    difficulty: "easy",
    category: "creative",
    estimatedTime: 18,
    maxLevel: 120,
    description: "Create music and learn about rhythm and melody",
    descriptionAr: "أنشئ الموسيقى وتعلم عن الإيقاع واللحن",
    order: 6
  },

  // ====== المستوى الثاني: الألعاب المتوسطة ======

  // الأشكال الهندسية
  {
    id: "shapes",
    completed: false,
    locked: true,
    difficulty: "medium",
    category: "educational",
    estimatedTime: 10,
    maxLevel: 120,
    description: "Hunt for shapes and learn geometry concepts",
    descriptionAr: "اصطاد الأشكال وتعلم مفاهيم الهندسة",
    order: 7,
    prerequisites: ["colors", "math"]
  },

  // الذاكرة والتركيز
  {
    id: "memory",
    completed: false,
    locked: true,
    difficulty: "medium",
    category: "memory",
    estimatedTime: 20,
    maxLevel: 120,
    description: "Challenge your memory with card matching games",
    descriptionAr: "تحدى ذاكرتك مع ألعاب مطابقة البطاقات",
    order: 8,
    prerequisites: ["abc", "animals"]
  },

  // الألغاز
  {
    id: "puzzle",
    completed: false,
    locked: true,
    difficulty: "medium",
    category: "puzzle",
    estimatedTime: 25,
    maxLevel: 120,
    description: "Solve jigsaw puzzles of varying difficulty",
    descriptionAr: "حل ألغاز الصور المقطعة بمستويات صعوبة متنوعة",
    order: 9,
    prerequisites: ["shapes", "memory"]
  },

  // الطقس والفصول
  {
    id: "weather",
    completed: false,
    locked: true,
    difficulty: "medium",
    category: "science",
    estimatedTime: 15,
    maxLevel: 120,
    description: "Explore different weather patterns and seasons",
    descriptionAr: "استكشف أنماط الطقس المختلفة والفصول",
    order: 10,
    prerequisites: ["animals", "colors"]
  },

  // الوقت والجدولة
  {
    id: "time-keeper",
    completed: false,
    locked: true,
    difficulty: "medium",
    category: "educational",
    estimatedTime: 20,
    maxLevel: 120,
    description: "Master time-telling and daily schedules",
    descriptionAr: "أتقن قراءة الوقت والجداول اليومية",
    order: 11,
    prerequisites: ["math", "shapes"]
  },

  // مهمة المحيط
  {
    id: "ocean-quest",
    completed: false,
    locked: true,
    difficulty: "medium",
    category: "science",
    estimatedTime: 22,
    maxLevel: 120,
    description: "Dive deep into ocean mysteries and marine life",
    descriptionAr: "اغطس في أعماق البحار وأسرار الحياة البحرية",
    order: 12,
    prerequisites: ["weather", "animals"],
    featured: true
  },

  // سباق المركبات
  {
    id: "vehicle-race",
    completed: false,
    locked: true,
    difficulty: "medium",
    category: "action",
    estimatedTime: 15,
    maxLevel: 120,
    description: "Race vehicles while learning about transportation",
    descriptionAr: "تسابق بالمركبات وتعلم عن وسائل النقل",
    order: 13,
    prerequisites: ["shapes", "time-keeper"]
  },

  // بيت الأحلام
  {
    id: "dream-house",
    completed: false,
    locked: true,
    difficulty: "medium",
    category: "creative",
    estimatedTime: 35,
    maxLevel: 120,
    description: "Design and build your perfect dream house",
    descriptionAr: "صمم وابن بيت أحلامك المثالي",
    order: 14,
    prerequisites: ["shapes", "colors", "music"]
  },

  // الطباخ الصغير
  {
    id: "little-chef",
    completed: false,
    locked: true,
    difficulty: "medium",
    category: "creative",
    estimatedTime: 28,
    maxLevel: 120,
    description: "Cook delicious recipes and learn kitchen skills",
    descriptionAr: "اطبخ وصفات لذيذة وتعلم مهارات المطبخ",
    order: 15,
    prerequisites: ["healthy-eating", "time-keeper"]
  },

  // ====== المستوى الثالث: الألعاب المتقدمة ======

  // نمو الحديقة
  {
    id: "garden-grow",
    completed: false,
    locked: true,
    difficulty: "easy", // سهل لكن متأخر في الترتيب
    category: "science",
    estimatedTime: 18,
    maxLevel: 120,
    description: "Learn about plants, growth, and gardening",
    descriptionAr: "تعلم عن النباتات والنمو والبستنة",
    order: 16,
    prerequisites: ["weather", "healthy-eating"]
  },

  // متعة الرياضة
  {
    id: "sports-fun",
    completed: false,
    locked: true,
    difficulty: "easy", // سهل لكن متأخر
    category: "action",
    estimatedTime: 20,
    maxLevel: 120,
    description: "Play various sports and learn about fitness",
    descriptionAr: "العب رياضات متنوعة وتعلم عن اللياقة البدنية",
    order: 17,
    prerequisites: ["vehicle-race", "healthy-eating"]
  },

  // استوديو الفن
  {
    id: "art-studio",
    completed: false,
    locked: true,
    difficulty: "medium",
    category: "creative",
    estimatedTime: 30,
    maxLevel: 120,
    description: "Express creativity through digital art and drawing",
    descriptionAr: "عبر عن إبداعك من خلال الفن الرقمي والرسم",
    order: 18,
    prerequisites: ["colors", "shapes", "dream-house"],
    featured: true
  },

  // ====== المستوى الرابع: الألعاب الخبيرة (صعب) ======

  // مستكشف الفضاء
  {
    id: "space-explorer",
    completed: false,
    locked: true,
    difficulty: "hard",
    category: "science",
    estimatedTime: 25,
    maxLevel: 120,
    description: "Journey through space and learn about planets",
    descriptionAr: "ارحل عبر الفضاء وتعلم عن الكواكب",
    order: 19,
    prerequisites: ["weather", "math", "puzzle"],
    featured: true
  },

  // مختبر العلوم
  {
    id: "science-lab",
    completed: false,
    locked: true,
    difficulty: "hard",
    category: "science",
    estimatedTime: 30,
    maxLevel: 120,
    description: "Conduct safe experiments and discover science",
    descriptionAr: "أجر تجارب آمنة واكتشف العلوم",
    order: 20,
    prerequisites: ["space-explorer", "garden-grow", "ocean-quest"],
    featured: true
  }
];

export const gameNames: Record<string, { name: string; nameAr: string; emoji: string }> = {
  math: { name: "Math Adventure", nameAr: "مغامرة الرياضيات", emoji: "🔢" },
  abc: { name: "ABC Adventure", nameAr: "مغامرة الحروف", emoji: "📝" },
  animals: { name: "Animal Friends", nameAr: "أصدقاء الحيوانات", emoji: "🐾" },
  colors: { name: "Color Magic", nameAr: "سحر الألوان", emoji: "🎨" },
  shapes: { name: "Shape Hunter", nameAr: "صائد الأشكال", emoji: "🔺" },
  "healthy-eating": { name: "Healthy Eating", nameAr: "الأكل الصحي", emoji: "🥗" },
  weather: { name: "Weather Wizard", nameAr: "ساحر الطقس", emoji: "🌤️" },
  memory: { name: "Memory Game", nameAr: "لعبة الذاكرة", emoji: "🧠" },
  puzzle: { name: "Puzzle Fun", nameAr: "متعة الألغاز", emoji: "🧩" },
  music: { name: "Music Maker", nameAr: "صانع الموسيقى", emoji: "🎵" },
  "art-studio": { name: "Art Studio", nameAr: "استوديو الفن", emoji: "🎨" },
  "time-keeper": { name: "Time Keeper", nameAr: "حارس الوقت", emoji: "⏰" },
  "space-explorer": { name: "Space Explorer", nameAr: "مستكشف الفضاء", emoji: "🚀" },
  "ocean-quest": { name: "Ocean Quest", nameAr: "مهمة المحيط", emoji: "🌊" },
  "garden-grow": { name: "Garden Grow", nameAr: "نمو الحديقة", emoji: "🌱" },
  "vehicle-race": { name: "Vehicle Race", nameAr: "سباق المركبات", emoji: "🏎️" },
  "dream-house": { name: "Dream House", nameAr: "بيت الأحلام", emoji: "🏠" },
  "sports-fun": { name: "Sports Fun", nameAr: "متعة الرياضة", emoji: "⚽" },
  "little-chef": { name: "Little Chef", nameAr: "الطباخ الصغير", emoji: "👨‍🍳" },
  "science-lab": { name: "Science Lab", nameAr: "مختبر العلوم", emoji: "🔬" }
};

export const categoryNames: Record<string, { name: string; nameAr: string; icon: string; color: string }> = {
  educational: { name: "Educational", nameAr: "تعليمية", icon: "🎓", color: "from-blue-500 to-indigo-600" },
  puzzle: { name: "Puzzle", nameAr: "ألغاز", icon: "🧩", color: "from-purple-500 to-violet-600" },
  action: { name: "Action", nameAr: "حركة", icon: "⚡", color: "from-red-500 to-orange-600" },
  creative: { name: "Creative", nameAr: "إبداعية", icon: "🎨", color: "from-pink-500 to-rose-600" },
  language: { name: "Language", nameAr: "لغة", icon: "📝", color: "from-green-500 to-emerald-600" },
  math: { name: "Math", nameAr: "رياضيات", icon: "🔢", color: "from-blue-600 to-cyan-600" },
  science: { name: "Science", nameAr: "علوم", icon: "🔬", color: "from-teal-500 to-blue-600" },
  memory: { name: "Memory", nameAr: "ذاكرة", icon: "🧠", color: "from-indigo-500 to-purple-600" }
};

export const difficultyNames: Record<string, { name: string; nameAr: string; color: string; bgColor: string; icon: string }> = {
  easy: { 
    name: "Easy", 
    nameAr: "سهل", 
    color: "text-green-600", 
    bgColor: "bg-green-100 border-green-200",
    icon: "🟢"
  },
  medium: { 
    name: "Medium", 
    nameAr: "متوسط", 
    color: "text-yellow-600", 
    bgColor: "bg-yellow-100 border-yellow-200",
    icon: "🟡"
  },
  hard: { 
    name: "Hard", 
    nameAr: "صعب", 
    color: "text-red-600", 
    bgColor: "bg-red-100 border-red-200",
    icon: "🔴"
  }
};

// دالة مساعدة للحصول على الألعاب المرتبة
export const getSortedGames = (): Game[] => {
  return [...games].sort((a, b) => a.order - b.order);
};

// دالة مساعدة للحصول على الألعاب المميزة
export const getFeaturedGames = (): Game[] => {
  return games.filter(game => game.featured);
};

// دالة مساعدة لفحص إمكانية فتح لعبة
export const canUnlockGame = (gameId: string, completedGames: string[]): boolean => {
  const game = games.find(g => g.id === gameId);
  if (!game || !game.prerequisites) return true;
  
  return game.prerequisites.every(prereq => completedGames.includes(prereq));
};

// دالة مساعدة للحصول على الألعاب حسب الفئة مع الترتيب
export const getGamesByCategory = (category: string): Game[] => {
  return games
    .filter(game => category === "all" || game.category === category)
    .sort((a, b) => a.order - b.order);
};

// دالة مساعدة للحصول على الألعاب حسب الصعوبة مع الترتيب
export const getGamesByDifficulty = (difficulty: string): Game[] => {
  return games
    .filter(game => difficulty === "all" || game.difficulty === difficulty)
    .sort((a, b) => a.order - b.order);
};