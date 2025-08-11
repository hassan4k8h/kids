import { useState, useEffect, useCallback } from "react";
import { Button } from "../ui/button";
import { GameProps } from "./GameEngine";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Volume2, Star, Trophy, Crown } from "lucide-react";
import { levelIndex, cyclePick, rotateArray } from "../../utils/deterministic";

interface AlphabetWord {
  id: string;
  letter: string;
  word: string;
  wordAr: string;
  emoji: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'animals' | 'objects' | 'food' | 'nature' | 'vehicles';
}

interface AlphabetChallenge {
  type: 'letter-word' | 'word-letter' | 'missing-letter' | 'letter-sound' | 'alphabetical-order' | 'letter-writing' | 'word-building';
  targetLetter: string;
  targetWord?: AlphabetWord;
  options: AlphabetWord[] | string[];
  question: string;
  questionAr: string;
  correctAnswer: string | string[];
  level: number;
  stars: number;
  hint?: string;
  hintAr?: string;
}

// قاعدة بيانات شاملة للحروف والكلمات (مصححة بعناية)
const alphabetDatabase: AlphabetWord[] = [
  // حرف الألف
  { id: 'alef-asad', letter: 'أ', word: 'أسد', wordAr: 'أسد', emoji: '🦁', difficulty: 'easy', category: 'animals' },
  { id: 'alef-arz', letter: 'أ', word: 'أرز', wordAr: 'أرز', emoji: '🌾', difficulty: 'easy', category: 'food' },
  { id: 'alef-arnab', letter: 'أ', word: 'أرنب', wordAr: 'أرنب', emoji: '🐰', difficulty: 'easy', category: 'animals' },
  { id: 'alef-anf', letter: 'أ', word: 'أنف', wordAr: 'أنف', emoji: '👃', difficulty: 'medium', category: 'objects' },

  // حرف الباء
  { id: 'baa-baqara', letter: 'ب', word: 'بقرة', wordAr: 'بقرة', emoji: '🐄', difficulty: 'easy', category: 'animals' },
  // تصحيح: كانت الكلمة "موز" لا تبدأ بحرف الباء. استبدلناها بكلمة صحيحة تبدأ بـ "ب"
  { id: 'baa-burtuqal', letter: 'ب', word: 'برتقال', wordAr: 'برتقال', emoji: '🍊', difficulty: 'easy', category: 'food' },
  { id: 'baa-bayt', letter: 'ب', word: 'بيت', wordAr: 'بيت', emoji: '🏠', difficulty: 'easy', category: 'objects' },
  { id: 'baa-bahr', letter: 'ب', word: 'بحر', wordAr: 'بحر', emoji: '🌊', difficulty: 'medium', category: 'nature' },

  // حرف التاء
  { id: 'taa-tuffaha', letter: 'ت', word: 'تفاحة', wordAr: 'تفاحة', emoji: '🍎', difficulty: 'easy', category: 'food' },
  { id: 'taa-tamr', letter: 'ت', word: 'تمر', wordAr: 'تمر', emoji: '🫐', difficulty: 'easy', category: 'food' },
  { id: 'taa-taj', letter: 'ت', word: 'تاج', wordAr: 'تاج', emoji: '👑', difficulty: 'medium', category: 'objects' },

  // حرف الثاء
  { id: 'thaa-thalab', letter: 'ث', word: 'ثعلب', wordAr: 'ثعلب', emoji: '🦊', difficulty: 'medium', category: 'animals' },
  { id: 'thaa-thalj', letter: 'ث', word: 'ثلج', wordAr: 'ثلج', emoji: '❄️', difficulty: 'medium', category: 'nature' },

  // حرف الجيم
  { id: 'jeem-jamal', letter: 'ج', word: 'جمل', wordAr: 'جمل', emoji: '🐪', difficulty: 'easy', category: 'animals' },
  { id: 'jeem-jazar', letter: 'ج', word: 'جزر', wordAr: 'جزر', emoji: '🥕', difficulty: 'easy', category: 'food' },
  { id: 'jeem-jabal', letter: 'ج', word: 'جبل', wordAr: 'جبل', emoji: '⛰️', difficulty: 'medium', category: 'nature' },

  // حرف الحاء
  { id: 'haa-hisan', letter: 'ح', word: 'حصان', wordAr: 'حصان', emoji: '🐴', difficulty: 'easy', category: 'animals' },
  { id: 'haa-hut', letter: 'ح', word: 'حوت', wordAr: 'حوت', emoji: '🐋', difficulty: 'medium', category: 'animals' },

  // حرف الخاء
  { id: 'khaa-kharuf', letter: 'خ', word: 'خروف', wordAr: 'خروف', emoji: '🐑', difficulty: 'easy', category: 'animals' },
  { id: 'khaa-khubz', letter: 'خ', word: 'خبز', wordAr: 'خبز', emoji: '🍞', difficulty: 'easy', category: 'food' },

  // حرف الدال
  { id: 'dal-dajaja', letter: 'د', word: 'دجاجة', wordAr: 'دجاجة', emoji: '🐔', difficulty: 'easy', category: 'animals' },
  { id: 'dal-dub', letter: 'د', word: 'دب', wordAr: 'دب', emoji: '🐻', difficulty: 'easy', category: 'animals' },

  // حرف الذال
  { id: 'thal-dhib', letter: 'ذ', word: 'ذئب', wordAr: 'ذئب', emoji: '🐺', difficulty: 'medium', category: 'animals' },

  // حرف الراء
  { id: 'raa-raas', letter: 'ر', word: 'رأس', wordAr: 'رأس', emoji: '🗣️', difficulty: 'medium', category: 'objects' },
  { id: 'raa-rumman', letter: 'ر', word: 'رمان', wordAr: 'رمان', emoji: '🍓', difficulty: 'medium', category: 'food' },

  // حرف الزين
  { id: 'zay-zahra', letter: 'ز', word: 'زهرة', wordAr: 'زهرة', emoji: '🌸', difficulty: 'easy', category: 'nature' },
  { id: 'zay-zaytun', letter: 'ز', word: 'زيتون', wordAr: 'زيتون', emoji: '🫒', difficulty: 'medium', category: 'food' },

  // حرف السين
  { id: 'seen-samak', letter: 'س', word: 'سمك', wordAr: 'سمك', emoji: '🐟', difficulty: 'easy', category: 'animals' },
  { id: 'seen-sayara', letter: 'س', word: 'سيارة', wordAr: 'سيارة', emoji: '🚗', difficulty: 'easy', category: 'vehicles' },

  // حرف الشين
  { id: 'sheen-shams', letter: 'ش', word: 'شمس', wordAr: 'شمس', emoji: '☀️', difficulty: 'easy', category: 'nature' },
  { id: 'sheen-shajar', letter: 'ش', word: 'شجرة', wordAr: 'شجرة', emoji: '🌳', difficulty: 'easy', category: 'nature' },

  // حرف الصاد
  { id: 'sad-saqr', letter: 'ص', word: 'صقر', wordAr: 'صقر', emoji: '🦅', difficulty: 'medium', category: 'animals' },

  // حرف الضاد
  { id: 'dad-difda', letter: 'ض', word: 'ضفدع', wordAr: 'ضفدع', emoji: '🐸', difficulty: 'medium', category: 'animals' },

  // حرف الطاء
  { id: 'taa-tayr', letter: 'ط', word: 'طائر', wordAr: 'طائر', emoji: '🐦', difficulty: 'easy', category: 'animals' },
  { id: 'taa-tomatim', letter: 'ط', word: 'طماطم', wordAr: 'طماطم', emoji: '🍅', difficulty: 'medium', category: 'food' },

  // حرف الظاء
  { id: 'dhaa-dharf', letter: 'ظ', word: 'ظرف', wordAr: 'ظرف', emoji: '✉️', difficulty: 'hard', category: 'objects' },

  // حرف العين
  { id: 'ayn-anab', letter: 'ع', word: 'عنب', wordAr: 'عنب', emoji: '🍇', difficulty: 'easy', category: 'food' },
  { id: 'ayn-asfur', letter: 'ع', word: 'عصفور', wordAr: 'عصفور', emoji: '🐦', difficulty: 'medium', category: 'animals' },

  // حرف الغين
  { id: 'ghayn-ghazal', letter: 'غ', word: 'غزال', wordAr: 'غزال', emoji: '🦌', difficulty: 'medium', category: 'animals' },

  // حرف الفاء - هنا المشكلة المذكورة
  { id: 'faa-fil', letter: 'ف', word: 'فيل', wordAr: 'فيل', emoji: '🐘', difficulty: 'easy', category: 'animals' },
  { id: 'faa-farawla', letter: 'ف', word: 'فراولة', wordAr: 'فراولة', emoji: '🍓', difficulty: 'medium', category: 'food' },
  { id: 'faa-faras', letter: 'ف', word: 'فرس', wordAr: 'فرس', emoji: '🐎', difficulty: 'medium', category: 'animals' },

  // حرف القاف
  { id: 'qaf-qitt', letter: 'ق', word: 'قطة', wordAr: 'قطة', emoji: '🐱', difficulty: 'easy', category: 'animals' },
  { id: 'qaf-qamar', letter: 'ق', word: 'قمر', wordAr: 'قمر', emoji: '🌙', difficulty: 'easy', category: 'nature' },

  // حرف الكاف
  { id: 'kaf-kalb', letter: 'ك', word: 'كلب', wordAr: 'كلب', emoji: '🐕', difficulty: 'easy', category: 'animals' },
  { id: 'kaf-kura', letter: 'ك', word: 'كرة', wordAr: 'كرة', emoji: '⚽', difficulty: 'easy', category: 'objects' },

  // حرف اللام
  { id: 'lam-layth', letter: 'ل', word: 'ليث', wordAr: 'ليث', emoji: '🦁', difficulty: 'hard', category: 'animals' },
  { id: 'lam-limun', letter: 'ل', word: 'ليمون', wordAr: 'ليمون', emoji: '🍋', difficulty: 'medium', category: 'food' },

  // حرف الميم
  { id: 'meem-mawz', letter: 'م', word: 'موز', wordAr: 'موز', emoji: '🍌', difficulty: 'easy', category: 'food' },
  { id: 'meem-masjid', letter: 'م', word: 'مسجد', wordAr: 'مسجد', emoji: '🕌', difficulty: 'medium', category: 'objects' },
  { id: 'meem-miftah', letter: 'م', word: 'مفتاح', wordAr: 'مفتاح', emoji: '🔑', difficulty: 'easy', category: 'objects' },
  { id: 'meem-malak', letter: 'م', word: 'ملك', wordAr: 'ملك', emoji: '👑', difficulty: 'medium', category: 'objects' },
  { id: 'meem-maa', letter: 'م', word: 'ماء', wordAr: 'ماء', emoji: '💧', difficulty: 'easy', category: 'nature' },

  // حرف النون
  { id: 'noon-naml', letter: 'ن', word: 'نمل', wordAr: 'نمل', emoji: '🐜', difficulty: 'easy', category: 'animals' },
  { id: 'noon-nahr', letter: 'ن', word: 'نهر', wordAr: 'نهر', emoji: '🏞️', difficulty: 'medium', category: 'nature' },

  // حرف الهاء
  { id: 'haa-hilal', letter: 'ه', word: 'هلال', wordAr: 'هلال', emoji: '🌙', difficulty: 'medium', category: 'nature' },

  // حرف الواو
  { id: 'waw-ward', letter: 'و', word: 'وردة', wordAr: 'وردة', emoji: '🌹', difficulty: 'easy', category: 'nature' },
  { id: 'waw-walad', letter: 'و', word: 'ولد', wordAr: 'ولد', emoji: '👦', difficulty: 'easy', category: 'objects' },

  // حرف الياء
  { id: 'yaa-yasmin', letter: 'ي', word: 'ياسمين', wordAr: 'ياسمين', emoji: '🌼', difficulty: 'medium', category: 'nature' },
  { id: 'yaa-yad', letter: 'ي', word: 'يد', wordAr: 'يد', emoji: '🤚', difficulty: 'easy', category: 'objects' }
  ,
  // إضافات كبيرة لزيادة التنوع (حيوانات/نباتات/أشياء/مركبات)
  // الألف
  { id: 'alef-asafir', letter: 'أ', word: 'أصابع', wordAr: 'أصابع', emoji: '🖐️', difficulty: 'easy', category: 'objects' },
  { id: 'alef-afaa', letter: 'أ', word: 'أفعى', wordAr: 'أفعى', emoji: '🐍', difficulty: 'medium', category: 'animals' },
  { id: 'alef-asmaa', letter: 'أ', word: 'أسماء', wordAr: 'أسماء', emoji: '🧑‍🏫', difficulty: 'hard', category: 'objects' },
  
  // الباء
  { id: 'baa-bab', letter: 'ب', word: 'باب', wordAr: 'باب', emoji: '🚪', difficulty: 'easy', category: 'objects' },
  { id: 'baa-burtuq', letter: 'ب', word: 'بطيخ', wordAr: 'بطيخ', emoji: '🍉', difficulty: 'easy', category: 'food' },
  { id: 'baa-bustaan', letter: 'ب', word: 'بستان', wordAr: 'بستان', emoji: '🌿', difficulty: 'medium', category: 'nature' },

  // التاء
  { id: 'taa-timsah', letter: 'ت', word: 'تمساح', wordAr: 'تمساح', emoji: '🐊', difficulty: 'medium', category: 'animals' },
  { id: 'taa-tabaq', letter: 'ت', word: 'طبق', wordAr: 'طبق', emoji: '🍽️', difficulty: 'easy', category: 'objects' },
  { id: 'taa-toot', letter: 'ت', word: 'توت', wordAr: 'توت', emoji: '🫐', difficulty: 'easy', category: 'food' },

  // الثاء
  { id: 'thaa-thawb', letter: 'ث', word: 'ثوب', wordAr: 'ثوب', emoji: '👗', difficulty: 'easy', category: 'objects' },
  { id: 'thaa-thum', letter: 'ث', word: 'ثوم', wordAr: 'ثوم', emoji: '🧄', difficulty: 'easy', category: 'food' },
  { id: 'thaa-thimar', letter: 'ث', word: 'ثمار', wordAr: 'ثمار', emoji: '🍇', difficulty: 'medium', category: 'food' },

  // الجيم
  { id: 'jeem-jaras', letter: 'ج', word: 'جرس', wordAr: 'جرس', emoji: '🔔', difficulty: 'easy', category: 'objects' },
  { id: 'jeem-jamal2', letter: 'ج', word: 'جميلة', wordAr: 'جميلة', emoji: '😊', difficulty: 'hard', category: 'objects' },

  // الحاء
  { id: 'haa-himar', letter: 'ح', word: 'حمار', wordAr: 'حمار', emoji: '🐴', difficulty: 'medium', category: 'animals' },
  { id: 'haa-hummus', letter: 'ح', word: 'حمص', wordAr: 'حمص', emoji: '🫘', difficulty: 'easy', category: 'food' },

  // الخاء
  { id: 'khaa-khiyar', letter: 'خ', word: 'خيار', wordAr: 'خيار', emoji: '🥒', difficulty: 'easy', category: 'food' },
  { id: 'khaa-khuffash', letter: 'خ', word: 'خفاش', wordAr: 'خفاش', emoji: '🦇', difficulty: 'medium', category: 'animals' },

  // الدال
  { id: 'dal-daraja', letter: 'د', word: 'دراجة', wordAr: 'دراجة', emoji: '🚲', difficulty: 'easy', category: 'vehicles' },
  { id: 'dal-dulfyn', letter: 'د', word: 'دلفين', wordAr: 'دلفين', emoji: '🐬', difficulty: 'medium', category: 'animals' },

  // الذال
  { id: 'thal-thahab', letter: 'ذ', word: 'ذهب', wordAr: 'ذهب', emoji: '🥇', difficulty: 'medium', category: 'objects' },
  { id: 'thal-thura', letter: 'ذ', word: 'ذرة', wordAr: 'ذرة', emoji: '🌽', difficulty: 'easy', category: 'food' },

  // الراء
  { id: 'raa-robot', letter: 'ر', word: 'روبوت', wordAr: 'روبوت', emoji: '🤖', difficulty: 'medium', category: 'objects' },
  { id: 'raa-rasm', letter: 'ر', word: 'رسم', wordAr: 'رسم', emoji: '🖌️', difficulty: 'easy', category: 'objects' },

  // الزاي
  { id: 'zay-zarafa', letter: 'ز', word: 'زرافة', wordAr: 'زرافة', emoji: '🦒', difficulty: 'medium', category: 'animals' },
  { id: 'zay-zayt', letter: 'ز', word: 'زيت', wordAr: 'زيت', emoji: '🛢️', difficulty: 'medium', category: 'food' },

  // السين
  { id: 'seen-safina', letter: 'س', word: 'سفينة', wordAr: 'سفينة', emoji: '🚢', difficulty: 'medium', category: 'vehicles' },
  { id: 'seen-sama', letter: 'س', word: 'سماء', wordAr: 'سماء', emoji: '☁️', difficulty: 'easy', category: 'nature' },
  { id: 'seen-sulhufah', letter: 'س', word: 'سلحفاة', wordAr: 'سلحفاة', emoji: '🐢', difficulty: 'medium', category: 'animals' },

  // الشين
  { id: 'sheen-sham3a', letter: 'ش', word: 'شمعة', wordAr: 'شمعة', emoji: '🕯️', difficulty: 'easy', category: 'objects' },
  { id: 'sheen-shay', letter: 'ش', word: 'شاي', wordAr: 'شاي', emoji: '🍵', difficulty: 'easy', category: 'food' },

  // الصاد
  { id: 'sad-sabun', letter: 'ص', word: 'صابون', wordAr: 'صابون', emoji: '🧼', difficulty: 'easy', category: 'objects' },
  { id: 'sad-sadafa', letter: 'ص', word: 'صدفة', wordAr: 'صدفة', emoji: '🐚', difficulty: 'medium', category: 'nature' },

  // الضاد
  { id: 'dad-daw', letter: 'ض', word: 'ضوء', wordAr: 'ضوء', emoji: '💡', difficulty: 'easy', category: 'objects' },
  { id: 'dad-dabaan', letter: 'ض', word: 'ضبع', wordAr: 'ضبع', emoji: '🦡', difficulty: 'hard', category: 'animals' },

  // الطاء
  { id: 'taa-taira', letter: 'ط', word: 'طائرة', wordAr: 'طائرة', emoji: '✈️', difficulty: 'medium', category: 'vehicles' },
  { id: 'taa-tabl', letter: 'ط', word: 'طبل', wordAr: 'طبل', emoji: '🥁', difficulty: 'easy', category: 'objects' },

  // الظاء
  { id: 'dhaa-zabi', letter: 'ظ', word: 'ظبي', wordAr: 'ظبي', emoji: '🦌', difficulty: 'hard', category: 'animals' },
  { id: 'dhaa-zill', letter: 'ظ', word: 'ظل', wordAr: 'ظل', emoji: '🌳', difficulty: 'medium', category: 'nature' },

  // العين
  { id: 'ayn-asal', letter: 'ع', word: 'عسل', wordAr: 'عسل', emoji: '🍯', difficulty: 'easy', category: 'food' },
  { id: 'ayn-elm', letter: 'ع', word: 'علم', wordAr: 'علم', emoji: '🏳️', difficulty: 'easy', category: 'objects' },

  // الغين
  { id: 'ghayn-ghayma', letter: 'غ', word: 'غيمة', wordAr: 'غيمة', emoji: '☁️', difficulty: 'easy', category: 'nature' },
  { id: 'ghayn-ghurab', letter: 'غ', word: 'غراب', wordAr: 'غراب', emoji: '🐦‍⬛', difficulty: 'hard', category: 'animals' },

  // الفاء
  { id: 'faa-fasoulia', letter: 'ف', word: 'فاصوليا', wordAr: 'فاصوليا', emoji: '🫘', difficulty: 'easy', category: 'food' },
  { id: 'faa-farasha', letter: 'ف', word: 'فراشة', wordAr: 'فراشة', emoji: '🦋', difficulty: 'easy', category: 'animals' },

  // القاف
  { id: 'qaf-qalam', letter: 'ق', word: 'قلم', wordAr: 'قلم', emoji: '✏️', difficulty: 'easy', category: 'objects' },
  { id: 'qaf-qitar', letter: 'ق', word: 'قطار', wordAr: 'قطار', emoji: '🚆', difficulty: 'medium', category: 'vehicles' },

  // الكاف
  { id: 'kaf-kitab', letter: 'ك', word: 'كتاب', wordAr: 'كتاب', emoji: '📖', difficulty: 'easy', category: 'objects' },
  { id: 'kaf-kousa', letter: 'ك', word: 'كوسا', wordAr: 'كوسا', emoji: '🥒', difficulty: 'easy', category: 'food' },

  // اللام
  { id: 'lam-laban', letter: 'ل', word: 'لبن', wordAr: 'لبن', emoji: '🥛', difficulty: 'easy', category: 'food' },
  { id: 'lam-loaba', letter: 'ل', word: 'لعبة', wordAr: 'لعبة', emoji: '🧸', difficulty: 'easy', category: 'objects' },

  // الميم
  { id: 'meem-madrasa', letter: 'م', word: 'مدرسة', wordAr: 'مدرسة', emoji: '🏫', difficulty: 'medium', category: 'objects' },
  { id: 'meem-matar', letter: 'م', word: 'مطر', wordAr: 'مطر', emoji: '🌧️', difficulty: 'easy', category: 'nature' },

  // النون
  { id: 'noon-nahla', letter: 'ن', word: 'نحلة', wordAr: 'نحلة', emoji: '🐝', difficulty: 'easy', category: 'animals' },
  { id: 'noon-nakhl', letter: 'ن', word: 'نخل', wordAr: 'نخل', emoji: '🌴', difficulty: 'easy', category: 'nature' },

  // الهاء
  { id: 'haa-hudahud', letter: 'ه', word: 'هدهد', wordAr: 'هدهد', emoji: '🐦', difficulty: 'medium', category: 'animals' },
  { id: 'haa-hawa', letter: 'ه', word: 'هواء', wordAr: 'هواء', emoji: '🌬️', difficulty: 'easy', category: 'nature' },

  // الواو
  { id: 'waw-waraqa', letter: 'و', word: 'ورقة', wordAr: 'ورقة', emoji: '📄', difficulty: 'easy', category: 'objects' },
  { id: 'waw-wisada', letter: 'و', word: 'وسادة', wordAr: 'وسادة', emoji: '🛏️', difficulty: 'easy', category: 'objects' },

  // الياء
  { id: 'yaa-yamama', letter: 'ي', word: 'يمامة', wordAr: 'يمامة', emoji: '🕊️', difficulty: 'easy', category: 'animals' },
  { id: 'yaa-yoyou', letter: 'ي', word: 'يويو', wordAr: 'يويو', emoji: '🪀', difficulty: 'easy', category: 'objects' }
];

export function AlphabetGame({ isRTL, onGameComplete, onScoreUpdate, onLivesUpdate, onLevelUpdate }: GameProps) {
  const [currentChallenge, setCurrentChallenge] = useState<AlphabetChallenge | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong' | null; message: string }>({ type: null, message: '' });
  const [isAnswering, setIsAnswering] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());
  const [unlockedLetters, setUnlockedLetters] = useState<Set<string>>(new Set(['أ', 'ب', 'ت']));
  const [achievementUnlocked, setAchievementUnlocked] = useState<string | null>(null);
  const [perfectStreak, setPerfectStreak] = useState(0);
  const [flashingAnswer, setFlashingAnswer] = useState<string | null>(null);
  // منع التكرار: حافظ على قائمة أهداف وقائمة حروف حديثة
  const [recentTargets, setRecentTargets] = useState<string[]>([]); // word.id
  const [recentLetters, setRecentLetters] = useState<string[]>([]);

  const pushRecent = (arr: string[], value: string, max: number) => {
    const next = [...arr, value];
    if (next.length > max) next.splice(0, next.length - max);
    return next;
  };

  const sample = <T,>(array: T[], n: number, seed: number = level): T[] => {
    // اختيار حتمي: ندوّر المصفوفة حسب المستوى ثم نأخذ n
    const rotated = rotateArray(array, seed % Math.max(1, array.length));
    return rotated.slice(0, Math.max(0, n));
  };

  // تحديد الحروف المتاحة حسب المستوى
  const getAvailableLetters = useCallback((currentLevel: number): string[] => {
    // ترتيب الحروف حسب الأهمية والاستخدام الشائع
    const allLetters = ['أ', 'ب', 'ت', 'م', 'ن', 'ل', 'ر', 'س', 'ع', 'ف', 'ق', 'ك', 'ه', 'و', 'ي', 'ج', 'ح', 'خ', 'د', 'ذ', 'ز', 'ش', 'ص', 'ض', 'ط', 'ظ', 'غ', 'ث'];
    
    if (currentLevel <= 20) return allLetters.slice(0, 8); // أول 8 حروف (تشمل الميم)
    if (currentLevel <= 40) return allLetters.slice(0, 14); // أول 14 حرف
    if (currentLevel <= 60) return allLetters.slice(0, 20); // أول 20 حرف
    if (currentLevel <= 80) return allLetters.slice(0, 25); // أول 25 حرف
    return allLetters; // جميع الحروف للمستويات 81-120
  }, []);

  // إعدادات الصعوبة حسب المستوى
  const getDifficultySettings = useCallback((level: number) => {
    if (level <= 30) return { 
      optionsCount: 3, 
      challengeTypes: ['letter-word', 'word-letter'],
      allowedDifficulties: ['easy']
    };
    if (level <= 60) return { 
      optionsCount: 4, 
      challengeTypes: ['letter-word', 'word-letter', 'missing-letter'],
      allowedDifficulties: ['easy', 'medium']
    };
    if (level <= 90) return { 
      optionsCount: 4, 
      challengeTypes: ['letter-word', 'word-letter', 'missing-letter', 'letter-sound'],
      allowedDifficulties: ['easy', 'medium']
    };
    return { 
      optionsCount: 5, 
      challengeTypes: ['letter-word', 'word-letter', 'missing-letter', 'letter-sound', 'alphabetical-order', 'word-building'],
      allowedDifficulties: ['easy', 'medium', 'hard']
    };
  }, []);

  // قاعدة بيانات الكلمات المفلترة حسب المستوى
  const getAvailableWords = useCallback((currentLevel: number): AlphabetWord[] => {
    const availableLetters = getAvailableLetters(currentLevel);
    const { allowedDifficulties } = getDifficultySettings(currentLevel);
    
    return alphabetDatabase.filter(word => 
      availableLetters.includes(word.letter) && 
      allowedDifficulties.includes(word.difficulty)
    );
  }, [getAvailableLetters, getDifficultySettings]);

  // إنشاء تحدي جديد مع منع التكرار
  const generateChallenge = useCallback((currentLevel: number): AlphabetChallenge => {
    const availableWords = getAvailableWords(currentLevel);
    const { optionsCount, challengeTypes } = getDifficultySettings(currentLevel);
    // اختيار نوع التحدي بشكل حتمي للمستوى
    const challengeType = challengeTypes[levelIndex(currentLevel, challengeTypes.length)] as AlphabetChallenge['type'];
    
    // تصفية الكلمات المستخدمة مؤخرًا ومنع تكرار الحرف المستهدف (أقوى)
    let pool = availableWords.filter(word => 
      !usedQuestions.has(`${challengeType}-${word.id}`) &&
      !usedQuestions.has(word.id) &&
      !usedQuestions.has(`letter-${word.letter}`)
    );
    let filteredByRecent = pool.filter(w => !recentTargets.includes(w.id) && !recentLetters.includes(w.letter));
    let candidateWords = filteredByRecent.length >= optionsCount ? filteredByRecent : (pool.length > 0 ? pool : availableWords);
    if (candidateWords.length === 0) candidateWords = availableWords;
    
    // إذا استنفدنا جميع الكلمات، نعيد تعيين القائمة
    if (candidateWords.length === 0) {
      setUsedQuestions(new Set());
      return generateChallenge(currentLevel);
    }

    const getStarRating = (level: number) => {
      if (level % 30 === 0) return 3; // مستويات الملوك
      if (level % 15 === 0) return 2; // مستويات متوسطة
      return 1; // مستويات عادية
    };

    switch (challengeType) {
      case 'letter-word': {
        // ربط المستوى بكلمة فريدة عبر المرور الدوري على قاعدة الكلمات
        const targetWord = candidateWords[(currentLevel - 1) % candidateWords.length];
        let wrongWords = pool.filter(w => w.letter !== targetWord.letter);
        
        // إذا لم تكن هناك كلمات خاطئة كافية، استخدم كلمات من جميع المستويات
        if (wrongWords.length < optionsCount - 1) {
          const allAvailableWords = alphabetDatabase.filter(word => 
            getAvailableLetters(currentLevel).includes(word.letter) && 
            word.letter !== targetWord.letter
          );
          wrongWords = sample(allAvailableWords, optionsCount - 1);
        } else {
          wrongWords = sample(wrongWords, optionsCount - 1);
        }
        
        const options = rotateArray([targetWord, ...wrongWords], currentLevel % optionsCount);

        return {
          type: challengeType,
          targetLetter: targetWord.letter,
          targetWord,
          options,
          question: `Which word starts with the letter "${targetWord.letter}"?`,
          questionAr: `أي كلمة تبدأ بحرف "${targetWord.letter}"؟`,
          correctAnswer: targetWord.id,
          level: currentLevel,
          stars: getStarRating(currentLevel),
          hint: `Look for words that begin with the sound of "${targetWord.letter}"`,
          hintAr: `ابحث عن الكلمات التي تبدأ بصوت "${targetWord.letter}"`
        };
      }

      case 'word-letter': {
        const targetWord = candidateWords[(currentLevel - 1) % candidateWords.length];
        const availableLetters = getAvailableLetters(currentLevel);
        const wrongLetters = sample(
          availableLetters.filter(l => l !== targetWord.letter),
          optionsCount - 1,
          currentLevel
        );
        
        let options = rotateArray([targetWord.letter, ...wrongLetters], currentLevel % optionsCount);
        // ضمان تضمين الحرف الصحيح دائمًا
        if (!options.includes(targetWord.letter)) {
          options = [targetWord.letter, ...options.filter(l => l !== targetWord.letter)].slice(0, optionsCount);
          options = rotateArray(options, currentLevel % optionsCount);
        }

        return {
          type: challengeType,
          targetLetter: targetWord.letter,
          targetWord,
          options,
          question: `What letter does "${targetWord.wordAr}" start with?`,
          questionAr: `بأي حرف تبدأ كلمة "${targetWord.wordAr}"؟`,
          correctAnswer: targetWord.letter,
          level: currentLevel,
          stars: getStarRating(currentLevel),
          hint: `Say the word out loud and listen to the first sound`,
          hintAr: `انطق الكلمة بصوت عالٍ واستمع للصوت الأول`
        };
      }

      case 'missing-letter': {
        const targetWord = candidateWords[(currentLevel - 1) % candidateWords.length];
        const availableLetters = getAvailableLetters(currentLevel);
        const wrongLetters = sample(
          availableLetters.filter(l => l !== targetWord.letter),
          optionsCount - 1,
          currentLevel
        );
        
        let options = rotateArray([targetWord.letter, ...wrongLetters], currentLevel % optionsCount);
        // ضمان تضمين الحرف الصحيح دائمًا
        if (!options.includes(targetWord.letter)) {
          options = [targetWord.letter, ...options.filter(l => l !== targetWord.letter)].slice(0, optionsCount);
          options = rotateArray(options, currentLevel % optionsCount);
        }
        
        // إخفاء الحرف الأول
        const hiddenWord = '_' + targetWord.wordAr.slice(1);

        return {
          type: challengeType,
          targetLetter: targetWord.letter,
          targetWord,
          options,
          question: `Complete the word: ${hiddenWord}`,
          questionAr: `أكمل الكلمة: ${hiddenWord}`,
          correctAnswer: targetWord.letter,
          level: currentLevel,
          stars: getStarRating(currentLevel),
          hint: `Think about what this emoji represents: ${targetWord.emoji}`,
          hintAr: `فكر فيما يمثله هذا الرمز: ${targetWord.emoji}`
        };
      }

      case 'letter-sound': {
        const targetWord = candidateWords[levelIndex(currentLevel, candidateWords.length)];
        let wrongWords = pool.filter(w => w.letter !== targetWord.letter);
        
        // إذا لم تكن هناك كلمات خاطئة كافية، استخدم كلمات من جميع المستويات
        if (wrongWords.length < optionsCount - 1) {
          const allAvailableWords = alphabetDatabase.filter(word => 
            getAvailableLetters(currentLevel).includes(word.letter) && 
            word.letter !== targetWord.letter
          );
          wrongWords = sample(allAvailableWords, optionsCount - 1);
        } else {
          wrongWords = sample(wrongWords, optionsCount - 1);
        }
        
        const options = rotateArray([targetWord, ...wrongWords], currentLevel % optionsCount);

        return {
          type: challengeType,
          targetLetter: targetWord.letter,
          targetWord,
          options,
          question: `Listen to the letter sound and choose the matching word`,
          questionAr: `استمع لصوت الحرف واختر الكلمة المطابقة`,
          correctAnswer: targetWord.id,
          level: currentLevel,
          stars: getStarRating(currentLevel),
          hint: `The sound is "${targetWord.letter}"`,
          hintAr: `الصوت هو "${targetWord.letter}"`
        };
      }

      case 'alphabetical-order': {
        const lettersAll = getAvailableLetters(currentLevel);
        const start = (currentLevel - 1) % Math.max(1, lettersAll.length - 3);
        const randomLetters = lettersAll.slice(start, start + 4);
        
        const correctOrder = [...randomLetters].sort();
        const shuffledOrder = rotateArray([...randomLetters], currentLevel % Math.max(1, randomLetters.length));

        return {
          type: challengeType,
          targetLetter: '',
          options: shuffledOrder,
          question: `Arrange these letters in alphabetical order`,
          questionAr: `رتب هذه الحروف بالترتيب الأبجدي`,
          correctAnswer: correctOrder,
          level: currentLevel,
          stars: getStarRating(currentLevel),
          hint: `Remember the alphabet song!`,
          hintAr: `تذكر أغنية الحروف الأبجدية!`
        };
      }

      default:
        return generateChallenge(currentLevel);
    }
  }, [getAvailableWords, getDifficultySettings, getAvailableLetters, usedQuestions]);

  // تشغيل صوت الحرف
  const playLetterSound = useCallback((letter: string) => {
    // في التطبيق الحقيقي، سيتم تشغيل ملف صوتي
    console.log(`Playing sound for letter: ${letter}`);
    
    // محاكاة ومض بصري قوي
    setFlashingAnswer(letter);
    setTimeout(() => setFlashingAnswer(null), 800);
  }, []);

  // معالجة الإجابة
  const handleAnswer = useCallback((answer: string | AlphabetWord | string[]) => {
    if (isAnswering || !currentChallenge) return;
    
    setIsAnswering(true);
    
    let isCorrect = false;
    let answerValue: string | string[];
    if (Array.isArray(answer)) {
      answerValue = answer;
    } else {
      answerValue = typeof answer === 'string' ? answer : answer.id;
    }
    
    if (Array.isArray(currentChallenge.correctAnswer)) {
      // للترتيب الأبجدي
      isCorrect = Array.isArray(answerValue) && JSON.stringify(answerValue) === JSON.stringify(currentChallenge.correctAnswer);
    } else {
      isCorrect = answerValue === currentChallenge.correctAnswer;
    }
    
    // تسجيل السؤال كمستخدم
    setUsedQuestions(prev => {
      const targetId = currentChallenge.targetWord?.id || currentChallenge.targetLetter;
      const targetLetter = currentChallenge.targetWord?.letter || currentChallenge.targetLetter;
      const newEntries = [
        `${currentChallenge.type}-${targetId}`,
        `${targetId}`,
        `letter-${targetLetter}`
      ];
      return new Set([...prev, ...newEntries]);
    });
    
    // المستوى التالي الذي سنستخدمه لتوليد السؤال القادم
    let nextChallengeLevel = level;

    if (isCorrect) {
      const basePoints = 30 + (currentChallenge.stars * 20);
      const levelBonus = Math.floor(level / 10) * 10;
      const streakBonus = Math.min(perfectStreak * 5, 50);
      const points = basePoints + levelBonus + streakBonus;
      
      setScore(prev => {
        const newScore = prev + points;
        onScoreUpdate(newScore);
        return newScore;
      });

      setPerfectStreak(prev => prev + 1);
      
      // فتح حروف جديدة
      if (currentChallenge.targetWord) {
        setUnlockedLetters(prev => new Set([...prev, currentChallenge.targetWord!.letter]));
      }
      
      setFeedback({
        type: 'correct',
        message: isRTL ? `ممتاز! +${points} نقطة!` : `Excellent! +${points} points!`
      });
      
      // إنجازات خاصة
      if (perfectStreak > 0 && perfectStreak % 10 === 0) {
        setAchievementUnlocked(isRTL ? `سلسلة مثالية! ${perfectStreak} إجابات صحيحة!` : `Perfect streak! ${perfectStreak} correct answers!`);
      }
      
      // كل سؤال = مستوى
      const newLevel = Math.min(level + 1, 120);
      setLevel(newLevel);
      onLevelUpdate(newLevel);
      nextChallengeLevel = newLevel;
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
      if (currentChallenge?.targetWord) {
        setRecentTargets(prev => pushRecent(prev, currentChallenge.targetWord!.id, 8));
        setRecentLetters(prev => pushRecent(prev, currentChallenge.targetWord!.letter, 5));
      }
      setCurrentChallenge(generateChallenge(nextChallengeLevel));
      setIsAnswering(false);
    }, 2000);
  }, [isAnswering, currentChallenge, level, questionsAnswered, lives, score, perfectStreak, isRTL, onScoreUpdate, onLevelUpdate, onLivesUpdate, onGameComplete, generateChallenge]);

  // عرض التحدي
  const renderChallenge = useCallback(() => {
    if (!currentChallenge) return null;

    const targetWord = currentChallenge.targetWord;

    switch (currentChallenge.type) {
      case 'letter-word':
      case 'word-letter':
      case 'missing-letter':
        return (
          <div className="space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="card-fun text-center bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200"
            >
              {targetWord && (
                <div className={`text-8xl mb-4 transition-all duration-300 ${
                  flashingAnswer === targetWord.letter ? 'animate-pulse scale-125 brightness-150' : ''
                }`}>
                  {targetWord.emoji}
                </div>
              )}
              
              <div className="text-6xl font-bold text-purple-600 mb-4">
                {currentChallenge.type === 'missing-letter' 
                  ? '_' + (targetWord?.wordAr.slice(1) || '')
                  : currentChallenge.type === 'word-letter' 
                    ? targetWord?.wordAr
                    : currentChallenge.targetLetter
                }
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

            <div className="grid grid-cols-2 gap-4">
              {(currentChallenge.options as (AlphabetWord | string)[]).map((option, index) => {
                const isWord = typeof option === 'object';
                const displayText = isWord ? option.wordAr : option;
                const emoji = isWord ? option.emoji : '';
                const optionValue = isWord ? option.id : option;
                
                return (
                  <motion.div
                    key={optionValue}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Button
                      onClick={() => handleAnswer(option)}
                      disabled={isAnswering}
                      className={`w-full h-20 flex flex-col items-center justify-center bg-white hover:bg-blue-50 text-gray-800 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg ${
                        flashingAnswer === optionValue ? 'animate-pulse scale-110 border-yellow-400 bg-yellow-50' : ''
                      }`}
                    >
                      {emoji && <span className="text-3xl mb-1">{emoji}</span>}
                      <span className="text-lg font-bold">
                        {displayText}
                      </span>
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );

      case 'letter-sound':
        return (
          <div className="space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="card-fun text-center bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200"
            >
              <div className="text-8xl mb-4">🔊</div>
              
              <div className="text-6xl font-bold text-green-600 mb-4">
                {currentChallenge.targetLetter}
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {isRTL ? currentChallenge.questionAr : currentChallenge.question}
              </h3>
              
              <Button
                onClick={() => playLetterSound(currentChallenge.targetLetter)}
                className="btn-fun bg-green-500 hover:bg-green-600 text-white mb-4"
              >
                <Volume2 className="w-5 h-5 mr-2" />
                {isRTL ? "استمع للصوت" : "Play Sound"}
              </Button>
              
              <div className="flex justify-center space-x-1 rtl:space-x-reverse">
                {[...Array(currentChallenge.stars)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                ))}
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
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
                    className={`w-full h-20 flex items-center justify-center bg-white hover:bg-green-50 text-gray-800 border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg ${
                      flashingAnswer === option ? 'animate-pulse scale-110 border-yellow-400 bg-yellow-50' : ''
                    }`}
                  >
                    <span className="text-3xl font-bold">
                      {option}
                    </span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'alphabetical-order':
        return (
          <div className="space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="card-fun text-center bg-gradient-to-r from-green-50 to-yellow-50 border-2 border-green-200"
            >
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {isRTL ? currentChallenge.questionAr : currentChallenge.question}
              </h3>
              <div className="flex justify-center space-x-2 rtl:space-x-reverse text-3xl">
                {(currentChallenge.options as string[]).map((letter, index) => (
                  <span key={index} className="font-bold text-green-600">
                    {letter}
                  </span>
                ))}
              </div>
            </motion.div>

            <div className="text-center">
              <p className="text-gray-600 mb-4">
                {isRTL ? "اسحب الحروف لترتيبها:" : "Drag letters to arrange them:"}
              </p>
              {/* سيتم تطوير واجهة السحب والإفلات لاحقاً */}
              <Button
                onClick={() => {
                  // للترتيب الأبجدي، نرسل المصفوفة نفسها
                  const answer = Array.isArray(currentChallenge.correctAnswer)
                    ? (currentChallenge.correctAnswer as string[])
                    : [String(currentChallenge.correctAnswer)];
                  handleAnswer(answer);
                }}
                className="btn-fun bg-green-500 hover:bg-green-600 text-white"
              >
                {isRTL ? "عرض الترتيب الصحيح" : "Show Correct Order"}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  }, [currentChallenge, isRTL, isAnswering, flashingAnswer, handleAnswer, playLetterSound]);

  // تهيئة التحدي الأول
  useEffect(() => {
    if (!currentChallenge) {
      setCurrentChallenge(generateChallenge(1));
    }
  }, [currentChallenge, generateChallenge]);

  if (!currentChallenge) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-6xl animate-pulse">📝</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* إحصائيات اللعبة المحسنة */}
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
                📝
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
          <span>{isRTL ? "الحروف المفتوحة" : "Letters Unlocked"}: {unlockedLetters.size}</span>
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