import { useState, useEffect, useCallback } from "react";
import { Button } from "../ui/button";
import { GameProps } from "./GameEngine";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Apple, Heart, Star, Trophy, Crown } from "lucide-react";
import { levelIndex, cyclePick, rotateArray } from "../../utils/deterministic";

interface Food {
  id: string;
  name: string;
  nameAr: string;
  emoji: string;
  category: 'fruits' | 'vegetables' | 'grains' | 'proteins' | 'dairy' | 'junk' | 'sweets' | 'beverages';
  healthLevel: 'very-healthy' | 'healthy' | 'moderate' | 'unhealthy' | 'very-unhealthy';
  nutrients: string[];
  nutrientsAr: string[];
  benefits: { en: string; ar: string }[];
  calories: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
  origin: string;
  originAr: string;
}

interface HealthyEatingChallenge {
  type: 'identify-healthy' | 'food-pyramid' | 'nutrient-match' | 'meal-planning' | 'calorie-counting' | 'seasonal-foods' | 'cooking-steps';
  foods: Food[];
  correctAnswer: string | string[];
  question: string;
  questionAr: string;
  options: string[] | Food[];
  level: number;
  stars: number;
  targetCalories?: number;
}

const foodDatabase: Food[] = [
  // Fruits (Levels 1-20)
  {
    id: 'apple',
    name: 'Apple',
    nameAr: 'تفاحة',
    emoji: '🍎',
    category: 'fruits',
    healthLevel: 'very-healthy',
    nutrients: ['Fiber', 'Vitamin C', 'Antioxidants'],
    nutrientsAr: ['ألياف', 'فيتامين ج', 'مضادات الأكسدة'],
    benefits: [{ en: 'Good for heart health', ar: 'مفيد لصحة القلب' }],
    calories: 95,
    rarity: 'common',
    season: 'autumn',
    origin: 'Global',
    originAr: 'عالمي'
  },
  {
    id: 'banana',
    name: 'Banana',
    nameAr: 'موزة',
    emoji: '🍌',
    category: 'fruits',
    healthLevel: 'very-healthy',
    nutrients: ['Potassium', 'Vitamin B6', 'Fiber'],
    nutrientsAr: ['بوتاسيوم', 'فيتامين ب6', 'ألياف'],
    benefits: [{ en: 'Provides quick energy', ar: 'يوفر طاقة سريعة' }],
    calories: 105,
    rarity: 'common',
    origin: 'Tropical',
    originAr: 'استوائي'
  },
  {
    id: 'orange',
    name: 'Orange',
    nameAr: 'برتقالة',
    emoji: '🍊',
    category: 'fruits',
    healthLevel: 'very-healthy',
    nutrients: ['Vitamin C', 'Folate', 'Fiber'],
    nutrientsAr: ['فيتامين ج', 'حمض الفوليك', 'ألياف'],
    benefits: [{ en: 'Boosts immune system', ar: 'يقوي جهاز المناعة' }],
    calories: 62,
    rarity: 'common',
    season: 'winter',
    origin: 'Mediterranean',
    originAr: 'البحر المتوسط'
  },
  {
    id: 'strawberry',
    name: 'Strawberry',
    nameAr: 'فراولة',
    emoji: '🍓',
    category: 'fruits',
    healthLevel: 'very-healthy',
    nutrients: ['Vitamin C', 'Manganese', 'Antioxidants'],
    nutrientsAr: ['فيتامين ج', 'المنغنيز', 'مضادات الأكسدة'],
    benefits: [{ en: 'Supports skin health', ar: 'يدعم صحة البشرة' }],
    calories: 32,
    rarity: 'rare',
    season: 'spring',
    origin: 'Europe',
    originAr: 'أوروبا'
  },
  {
    id: 'mango',
    name: 'Mango',
    nameAr: 'مانجو',
    emoji: '🥭',
    category: 'fruits',
    healthLevel: 'very-healthy',
    nutrients: ['Vitamin A', 'Vitamin C', 'Fiber'],
    nutrientsAr: ['فيتامين أ', 'فيتامين ج', 'ألياف'],
    benefits: [{ en: 'Good for eye health', ar: 'مفيد لصحة العين' }],
    calories: 107,
    rarity: 'epic',
    season: 'summer',
    origin: 'Asia',
    originAr: 'آسيا'
  },
  {
    id: 'dragon-fruit',
    name: 'Dragon Fruit',
    nameAr: 'فاكهة التنين',
    emoji: '🐉',
    category: 'fruits',
    healthLevel: 'very-healthy',
    nutrients: ['Vitamin C', 'Iron', 'Magnesium'],
    nutrientsAr: ['فيتامين ج', 'حديد', 'مغنيسيوم'],
    benefits: [{ en: 'Rich in antioxidants', ar: 'غني بمضادات الأكسدة' }],
    calories: 60,
    rarity: 'legendary',
    season: 'summer',
    origin: 'Central America',
    originAr: 'أمريكا الوسطى'
  },

  // Vegetables (Levels 21-40)
  {
    id: 'carrot',
    name: 'Carrot',
    nameAr: 'جزر',
    emoji: '🥕',
    category: 'vegetables',
    healthLevel: 'very-healthy',
    nutrients: ['Beta-carotene', 'Fiber', 'Vitamin K'],
    nutrientsAr: ['بيتا كاروتين', 'ألياف', 'فيتامين ك'],
    benefits: [{ en: 'Improves vision', ar: 'يحسن البصر' }],
    calories: 25,
    rarity: 'common',
    origin: 'Global',
    originAr: 'عالمي'
  },
  {
    id: 'broccoli',
    name: 'Broccoli',
    nameAr: 'بروكلي',
    emoji: '🥦',
    category: 'vegetables',
    healthLevel: 'very-healthy',
    nutrients: ['Vitamin C', 'Vitamin K', 'Folate'],
    nutrientsAr: ['فيتامين ج', 'فيتامين ك', 'حمض الفوليك'],
    benefits: [{ en: 'Cancer fighting properties', ar: 'خصائص مقاومة السرطان' }],
    calories: 25,
    rarity: 'rare',
    origin: 'Mediterranean',
    originAr: 'البحر المتوسط'
  },
  {
    id: 'spinach',
    name: 'Spinach',
    nameAr: 'سبانخ',
    emoji: '🥬',
    category: 'vegetables',
    healthLevel: 'very-healthy',
    nutrients: ['Iron', 'Vitamin K', 'Folate'],
    nutrientsAr: ['حديد', 'فيتامين ك', 'حمض الفوليك'],
    benefits: [{ en: 'Builds strong muscles', ar: 'يقوي العضلات' }],
    calories: 7,
    rarity: 'common',
    origin: 'Persia',
    originAr: 'فارس'
  },

  // Grains (Levels 41-60)
  {
    id: 'brown-rice',
    name: 'Brown Rice',
    nameAr: 'أرز بني',
    emoji: '🍚',
    category: 'grains',
    healthLevel: 'healthy',
    nutrients: ['Fiber', 'Manganese', 'Selenium'],
    nutrientsAr: ['ألياف', 'المنغنيز', 'السيلينيوم'],
    benefits: [{ en: 'Provides sustained energy', ar: 'يوفر طاقة مستدامة' }],
    calories: 218,
    rarity: 'common',
    origin: 'Asia',
    originAr: 'آسيا'
  },
  {
    id: 'quinoa',
    name: 'Quinoa',
    nameAr: 'كينوا',
    emoji: '🌾',
    category: 'grains',
    healthLevel: 'very-healthy',
    nutrients: ['Complete Protein', 'Fiber', 'Magnesium'],
    nutrientsAr: ['بروتين كامل', 'ألياف', 'مغنيسيوم'],
    benefits: [{ en: 'Complete amino acid profile', ar: 'محتوى أحماض أمينية كامل' }],
    calories: 222,
    rarity: 'epic',
    origin: 'South America',
    originAr: 'أمريكا الجنوبية'
  },

  // Proteins (Levels 61-80)
  {
    id: 'salmon',
    name: 'Salmon',
    nameAr: 'سلمون',
    emoji: '🐟',
    category: 'proteins',
    healthLevel: 'very-healthy',
    nutrients: ['Omega-3', 'Protein', 'Vitamin D'],
    nutrientsAr: ['أوميغا 3', 'بروتين', 'فيتامين د'],
    benefits: [{ en: 'Brain and heart health', ar: 'صحة الدماغ والقلب' }],
    calories: 206,
    rarity: 'legendary',
    origin: 'North Atlantic',
    originAr: 'شمال الأطلسي'
  },

  // Junk Food (What to avoid - Levels 81-100)
  {
    id: 'candy',
    name: 'Candy',
    nameAr: 'حلوى',
    emoji: '🍬',
    category: 'sweets',
    healthLevel: 'very-unhealthy',
    nutrients: ['Sugar', 'Artificial Colors'],
    nutrientsAr: ['سكر', 'ألوان صناعية'],
    benefits: [{ en: 'Provides quick sugar rush', ar: 'يوفر طاقة سكر سريعة' }],
    calories: 150,
    rarity: 'common',
    origin: 'Global',
    originAr: 'عالمي'
  },
  {
    id: 'soda',
    name: 'Soda',
    nameAr: 'مشروب غازي',
    emoji: '🥤',
    category: 'beverages',
    healthLevel: 'very-unhealthy',
    nutrients: ['Sugar', 'Caffeine', 'Artificial Flavors'],
    nutrientsAr: ['سكر', 'كافيين', 'نكهات صناعية'],
    benefits: [{ en: 'Temporary energy boost', ar: 'دفعة طاقة مؤقتة' }],
    calories: 140,
    rarity: 'common',
    origin: 'Global',
    originAr: 'عالمي'
  }
  ,
  { id: 'grape', name: 'Grapes', nameAr: 'عنب', emoji: '🍇', category: 'fruits', healthLevel: 'very-healthy', nutrients: ['Antioxidants', 'Vitamin K', 'Potassium'], nutrientsAr: ['مضادات الأكسدة', 'فيتامين ك', 'بوتاسيوم'], benefits: [{ en: 'Heart-friendly', ar: 'ودود للقلب' }], calories: 62, rarity: 'common', season: 'autumn', origin: 'Mediterranean', originAr: 'البحر المتوسط' },
  { id: 'pear', name: 'Pear', nameAr: 'كمثرى', emoji: '🍐', category: 'fruits', healthLevel: 'very-healthy', nutrients: ['Fiber', 'Vitamin C'], nutrientsAr: ['ألياف', 'فيتامين ج'], benefits: [{ en: 'Aids digestion', ar: 'يساعد على الهضم' }], calories: 101, rarity: 'common', origin: 'Europe', originAr: 'أوروبا' },
  { id: 'watermelon', name: 'Watermelon', nameAr: 'بطيخ', emoji: '🍉', category: 'fruits', healthLevel: 'very-healthy', nutrients: ['Water', 'Vitamin C', 'Lycopene'], nutrientsAr: ['ماء', 'فيتامين ج', 'ليكوبين'], benefits: [{ en: 'Hydration', ar: 'يروي الجسم' }], calories: 46, rarity: 'common', season: 'summer', origin: 'Africa', originAr: 'أفريقيا' },
  { id: 'blueberry', name: 'Blueberries', nameAr: 'توت أزرق', emoji: '🫐', category: 'fruits', healthLevel: 'very-healthy', nutrients: ['Antioxidants', 'Vitamin C'], nutrientsAr: ['مضادات الأكسدة', 'فيتامين ج'], benefits: [{ en: 'Supports brain health', ar: 'يدعم صحة الدماغ' }], calories: 57, rarity: 'rare', season: 'summer', origin: 'North America', originAr: 'أمريكا الشمالية' },
  { id: 'kiwi', name: 'Kiwi', nameAr: 'كيوي', emoji: '🥝', category: 'fruits', healthLevel: 'very-healthy', nutrients: ['Vitamin C', 'Fiber'], nutrientsAr: ['فيتامين ج', 'ألياف'], benefits: [{ en: 'Immune support', ar: 'يدعم المناعة' }], calories: 42, rarity: 'common', origin: 'New Zealand', originAr: 'نيوزيلندا' },
  { id: 'dates', name: 'Dates', nameAr: 'تمر', emoji: '🌴', category: 'fruits', healthLevel: 'healthy', nutrients: ['Fiber', 'Potassium', 'Magnesium'], nutrientsAr: ['ألياف', 'بوتاسيوم', 'مغنيسيوم'], benefits: [{ en: 'Quick natural energy', ar: 'طاقة طبيعية سريعة' }], calories: 66, rarity: 'common', origin: 'Middle East', originAr: 'الشرق الأوسط' },
  { id: 'fig', name: 'Fig', nameAr: 'تين', emoji: '🫓', category: 'fruits', healthLevel: 'healthy', nutrients: ['Fiber', 'Calcium'], nutrientsAr: ['ألياف', 'كالسيوم'], benefits: [{ en: 'Good for bones', ar: 'جيد للعظام' }], calories: 47, rarity: 'rare', season: 'summer', origin: 'Mediterranean', originAr: 'البحر المتوسط' },
  { id: 'pomegranate', name: 'Pomegranate', nameAr: 'رمان', emoji: '🫐', category: 'fruits', healthLevel: 'very-healthy', nutrients: ['Antioxidants', 'Vitamin C'], nutrientsAr: ['مضادات الأكسدة', 'فيتامين ج'], benefits: [{ en: 'Anti-inflammatory', ar: 'مضاد للالتهاب' }], calories: 83, rarity: 'epic', season: 'autumn', origin: 'Persia', originAr: 'فارس' },
  { id: 'apricot', name: 'Apricot', nameAr: 'مشمش', emoji: '🍑', category: 'fruits', healthLevel: 'healthy', nutrients: ['Vitamin A', 'Fiber'], nutrientsAr: ['فيتامين أ', 'ألياف'], benefits: [{ en: 'Good for skin', ar: 'جيد للبشرة' }], calories: 48, rarity: 'common', season: 'summer', origin: 'Central Asia', originAr: 'آسيا الوسطى' },
  { id: 'peach', name: 'Peach', nameAr: 'خوخ', emoji: '🍑', category: 'fruits', healthLevel: 'healthy', nutrients: ['Vitamin C', 'Fiber'], nutrientsAr: ['فيتامين ج', 'ألياف'], benefits: [{ en: 'Hydrating and sweet', ar: 'مرطب وحلو' }], calories: 58, rarity: 'common', season: 'summer', origin: 'China', originAr: 'الصين' },
  { id: 'tomato', name: 'Tomato', nameAr: 'طماطم', emoji: '🍅', category: 'vegetables', healthLevel: 'very-healthy', nutrients: ['Lycopene', 'Vitamin C'], nutrientsAr: ['ليكوبين', 'فيتامين ج'], benefits: [{ en: 'Good for heart', ar: 'مفيد للقلب' }], calories: 22, rarity: 'common', season: 'summer', origin: 'South America', originAr: 'أمريكا الجنوبية' },
  { id: 'cucumber', name: 'Cucumber', nameAr: 'خيار', emoji: '🥒', category: 'vegetables', healthLevel: 'very-healthy', nutrients: ['Water', 'Vitamin K'], nutrientsAr: ['ماء', 'فيتامين ك'], benefits: [{ en: 'Hydrating', ar: 'يرطب الجسم' }], calories: 16, rarity: 'common', season: 'summer', origin: 'India', originAr: 'الهند' },
  { id: 'lettuce', name: 'Lettuce', nameAr: 'خس', emoji: '🥬', category: 'vegetables', healthLevel: 'very-healthy', nutrients: ['Vitamin K', 'Folate'], nutrientsAr: ['فيتامين ك', 'حمض الفوليك'], benefits: [{ en: 'Light and fresh', ar: 'خفيف ومنعش' }], calories: 15, rarity: 'common', origin: 'Mediterranean', originAr: 'البحر المتوسط' },
  { id: 'pepper', name: 'Bell Pepper', nameAr: 'فلفل رومي', emoji: '🫑', category: 'vegetables', healthLevel: 'very-healthy', nutrients: ['Vitamin C', 'Fiber'], nutrientsAr: ['فيتامين ج', 'ألياف'], benefits: [{ en: 'Immune boost', ar: 'تقوية المناعة' }], calories: 31, rarity: 'common', season: 'summer', origin: 'Central America', originAr: 'أمريكا الوسطى' },
  { id: 'potato', name: 'Potato', nameAr: 'بطاطس', emoji: '🥔', category: 'vegetables', healthLevel: 'moderate', nutrients: ['Carbs', 'Potassium'], nutrientsAr: ['كربوهيدرات', 'بوتاسيوم'], benefits: [{ en: 'Energy source', ar: 'مصدر طاقة' }], calories: 161, rarity: 'common', origin: 'South America', originAr: 'أمريكا الجنوبية' },
  { id: 'sweet-potato', name: 'Sweet Potato', nameAr: 'بطاطا حلوة', emoji: '🍠', category: 'vegetables', healthLevel: 'healthy', nutrients: ['Beta-carotene', 'Fiber'], nutrientsAr: ['بيتا كاروتين', 'ألياف'], benefits: [{ en: 'Supports vision', ar: 'يدعم النظر' }], calories: 103, rarity: 'common', origin: 'Central America', originAr: 'أمريكا الوسطى' },
  { id: 'eggplant', name: 'Eggplant', nameAr: 'باذنجان', emoji: '🍆', category: 'vegetables', healthLevel: 'healthy', nutrients: ['Fiber', 'Antioxidants'], nutrientsAr: ['ألياف', 'مضادات الأكسدة'], benefits: [{ en: 'Gut-friendly', ar: 'مفيد للأمعاء' }], calories: 35, rarity: 'common', origin: 'India', originAr: 'الهند' },
  { id: 'cabbage', name: 'Cabbage', nameAr: 'كرنب', emoji: '🥬', category: 'vegetables', healthLevel: 'healthy', nutrients: ['Vitamin C', 'Fiber'], nutrientsAr: ['فيتامين ج', 'ألياف'], benefits: [{ en: 'Supports digestion', ar: 'يدعم الهضم' }], calories: 25, rarity: 'common', origin: 'Europe', originAr: 'أوروبا' },
  { id: 'cauliflower', name: 'Cauliflower', nameAr: 'قرنبيط', emoji: '🥦', category: 'vegetables', healthLevel: 'healthy', nutrients: ['Vitamin C', 'Choline'], nutrientsAr: ['فيتامين ج', 'كولين'], benefits: [{ en: 'Low-carb alternative', ar: 'بديل منخفض الكربوهيدرات' }], calories: 27, rarity: 'common', origin: 'Mediterranean', originAr: 'البحر المتوسط' },
  { id: 'beetroot', name: 'Beetroot', nameAr: 'بنجر', emoji: '🧉', category: 'vegetables', healthLevel: 'healthy', nutrients: ['Folate', 'Nitrates'], nutrientsAr: ['حمض الفوليك', 'نترات'], benefits: [{ en: 'May lower blood pressure', ar: 'قد يخفض ضغط الدم' }], calories: 44, rarity: 'common', origin: 'Europe', originAr: 'أوروبا' },
  { id: 'onion', name: 'Onion', nameAr: 'بصل', emoji: '🧅', category: 'vegetables', healthLevel: 'healthy', nutrients: ['Antioxidants', 'Vitamin C'], nutrientsAr: ['مضادات الأكسدة', 'فيتامين ج'], benefits: [{ en: 'Anti-inflammatory', ar: 'مضاد للالتهاب' }], calories: 40, rarity: 'common', origin: 'Asia', originAr: 'آسيا' },
  { id: 'garlic', name: 'Garlic', nameAr: 'ثوم', emoji: '🧄', category: 'vegetables', healthLevel: 'healthy', nutrients: ['Allicin', 'Manganese'], nutrientsAr: ['الأليسين', 'منغنيز'], benefits: [{ en: 'Immune boosting', ar: 'يعزز المناعة' }], calories: 5, rarity: 'common', origin: 'Central Asia', originAr: 'آسيا الوسطى' },
  { id: 'oats', name: 'Oats', nameAr: 'شوفان', emoji: '🥣', category: 'grains', healthLevel: 'healthy', nutrients: ['Fiber', 'Manganese'], nutrientsAr: ['ألياف', 'منغنيز'], benefits: [{ en: 'Good for breakfast', ar: 'جيد للإفطار' }], calories: 150, rarity: 'common', origin: 'Global', originAr: 'عالمي' },
  { id: 'barley', name: 'Barley', nameAr: 'شعير', emoji: '🌾', category: 'grains', healthLevel: 'healthy', nutrients: ['Fiber', 'Selenium'], nutrientsAr: ['ألياف', 'سيلينيوم'], benefits: [{ en: 'Supports digestion', ar: 'يدعم الهضم' }], calories: 193, rarity: 'common', origin: 'Middle East', originAr: 'الشرق الأوسط' },
  { id: 'whole-bread', name: 'Whole Wheat Bread', nameAr: 'خبز أسمر', emoji: '🍞', category: 'grains', healthLevel: 'moderate', nutrients: ['Carbs', 'Fiber'], nutrientsAr: ['كربوهيدرات', 'ألياف'], benefits: [{ en: 'Energy source', ar: 'مصدر طاقة' }], calories: 69, rarity: 'common', origin: 'Global', originAr: 'عالمي' },
  { id: 'corn', name: 'Corn', nameAr: 'ذرة', emoji: '🌽', category: 'grains', healthLevel: 'moderate', nutrients: ['Carbs', 'Fiber'], nutrientsAr: ['كربوهيدرات', 'ألياف'], benefits: [{ en: 'Provides energy', ar: 'يوفر طاقة' }], calories: 96, rarity: 'common', origin: 'Americas', originAr: 'الأمريكيتان' },
  { id: 'bulgur', name: 'Bulgur', nameAr: 'برغل', emoji: '🌾', category: 'grains', healthLevel: 'healthy', nutrients: ['Fiber', 'Protein'], nutrientsAr: ['ألياف', 'بروتين'], benefits: [{ en: 'Whole grain option', ar: 'حبوب كاملة' }], calories: 151, rarity: 'common', origin: 'Middle East', originAr: 'الشرق الأوسط' },
  { id: 'chicken-breast', name: 'Chicken Breast', nameAr: 'صدر دجاج', emoji: '🍗', category: 'proteins', healthLevel: 'healthy', nutrients: ['Protein', 'B Vitamins'], nutrientsAr: ['بروتين', 'فيتامينات ب'], benefits: [{ en: 'Lean protein', ar: 'بروتين قليل الدهن' }], calories: 165, rarity: 'common', origin: 'Global', originAr: 'عالمي' },
  { id: 'egg', name: 'Egg', nameAr: 'بيض', emoji: '🥚', category: 'proteins', healthLevel: 'healthy', nutrients: ['Protein', 'Choline'], nutrientsAr: ['بروتين', 'كولين'], benefits: [{ en: 'Supports growth', ar: 'يدعم النمو' }], calories: 78, rarity: 'common', origin: 'Global', originAr: 'عالمي' },
  { id: 'lentils', name: 'Lentils', nameAr: 'عدس', emoji: '🥣', category: 'proteins', healthLevel: 'very-healthy', nutrients: ['Protein', 'Iron', 'Fiber'], nutrientsAr: ['بروتين', 'حديد', 'ألياف'], benefits: [{ en: 'Plant-based protein', ar: 'بروتين نباتي' }], calories: 230, rarity: 'common', origin: 'Middle East', originAr: 'الشرق الأوسط' },
  { id: 'chickpeas', name: 'Chickpeas', nameAr: 'حمص', emoji: '🫘', category: 'proteins', healthLevel: 'very-healthy', nutrients: ['Protein', 'Fiber'], nutrientsAr: ['بروتين', 'ألياف'], benefits: [{ en: 'Filling and nutritious', ar: 'مشبع ومغذي' }], calories: 269, rarity: 'common', origin: 'Middle East', originAr: 'الشرق الأوسط' },
  { id: 'beans', name: 'Beans', nameAr: 'فاصوليا', emoji: '🫘', category: 'proteins', healthLevel: 'healthy', nutrients: ['Protein', 'Fiber'], nutrientsAr: ['بروتين', 'ألياف'], benefits: [{ en: 'Budget-friendly protein', ar: 'بروتين اقتصادي' }], calories: 240, rarity: 'common', origin: 'Global', originAr: 'عالمي' },
  { id: 'tofu', name: 'Tofu', nameAr: 'توفو', emoji: '🍱', category: 'proteins', healthLevel: 'healthy', nutrients: ['Protein', 'Calcium'], nutrientsAr: ['بروتين', 'كالسيوم'], benefits: [{ en: 'Vegetarian option', ar: 'خيار نباتي' }], calories: 144, rarity: 'common', origin: 'Asia', originAr: 'آسيا' },
  { id: 'milk', name: 'Milk', nameAr: 'حليب', emoji: '🥛', category: 'dairy', healthLevel: 'healthy', nutrients: ['Calcium', 'Protein', 'Vitamin D'], nutrientsAr: ['كالسيوم', 'بروتين', 'فيتامين د'], benefits: [{ en: 'Strengthens bones', ar: 'يقوي العظام' }], calories: 122, rarity: 'common', origin: 'Global', originAr: 'عالمي' },
  { id: 'yogurt', name: 'Yogurt', nameAr: 'زبادي', emoji: '🥣', category: 'dairy', healthLevel: 'healthy', nutrients: ['Probiotics', 'Protein', 'Calcium'], nutrientsAr: ['بروبيوتيك', 'بروتين', 'كالسيوم'], benefits: [{ en: 'Good for gut health', ar: 'مفيد للأمعاء' }], calories: 100, rarity: 'common', origin: 'Global', originAr: 'عالمي' },
  { id: 'cheese', name: 'Cheese', nameAr: 'جبن', emoji: '🧀', category: 'dairy', healthLevel: 'moderate', nutrients: ['Protein', 'Calcium', 'Fat'], nutrientsAr: ['بروتين', 'كالسيوم', 'دهون'], benefits: [{ en: 'Tasty in moderation', ar: 'لذيذ باعتدال' }], calories: 113, rarity: 'common', origin: 'Global', originAr: 'عالمي' },
  { id: 'water', name: 'Water', nameAr: 'ماء', emoji: '💧', category: 'beverages', healthLevel: 'very-healthy', nutrients: ['Hydration'], nutrientsAr: ['ترطيب'], benefits: [{ en: 'Essential for life', ar: 'أساسي للحياة' }], calories: 0, rarity: 'common', origin: 'Global', originAr: 'عالمي' },
  { id: 'fresh-juice', name: 'Fresh Juice', nameAr: 'عصير طازج', emoji: '🧃', category: 'beverages', healthLevel: 'moderate', nutrients: ['Vitamins', 'Sugar'], nutrientsAr: ['فيتامينات', 'سكر'], benefits: [{ en: 'Vitamins boost', ar: 'تعزيز الفيتامينات' }], calories: 110, rarity: 'common', origin: 'Global', originAr: 'عالمي' },
  { id: 'chocolate', name: 'Chocolate', nameAr: 'شوكولاتة', emoji: '🍫', category: 'sweets', healthLevel: 'unhealthy', nutrients: ['Sugar', 'Fat'], nutrientsAr: ['سكر', 'دهون'], benefits: [{ en: 'Tasty treat', ar: 'حلوى لذيذة' }], calories: 240, rarity: 'common', origin: 'Global', originAr: 'عالمي' },
  { id: 'donut', name: 'Donut', nameAr: 'دونات', emoji: '🍩', category: 'sweets', healthLevel: 'very-unhealthy', nutrients: ['Sugar', 'Fat'], nutrientsAr: ['سكر', 'دهون'], benefits: [{ en: 'Occasional dessert', ar: 'تحلية بين فترة وأخرى' }], calories: 280, rarity: 'common', origin: 'Global', originAr: 'عالمي' },
  { id: 'ice-cream', name: 'Ice Cream', nameAr: 'آيس كريم', emoji: '🍨', category: 'sweets', healthLevel: 'unhealthy', nutrients: ['Sugar', 'Fat'], nutrientsAr: ['سكر', 'دهون'], benefits: [{ en: 'Cool treat', ar: 'تحلية باردة' }], calories: 207, rarity: 'common', origin: 'Global', originAr: 'عالمي' },
  { id: 'burger', name: 'Burger', nameAr: 'برغر', emoji: '🍔', category: 'junk', healthLevel: 'very-unhealthy', nutrients: ['Fat', 'Sodium'], nutrientsAr: ['دهون', 'صوديوم'], benefits: [{ en: 'High energy but unhealthy', ar: 'طاقة عالية لكن غير صحي' }], calories: 354, rarity: 'common', origin: 'Global', originAr: 'عالمي' },
  { id: 'pizza', name: 'Pizza', nameAr: 'بيتزا', emoji: '🍕', category: 'junk', healthLevel: 'unhealthy', nutrients: ['Carbs', 'Fat', 'Sodium'], nutrientsAr: ['كربوهيدرات', 'دهون', 'صوديوم'], benefits: [{ en: 'Tasty but occasional', ar: 'لذيذة لكن باعتدال' }], calories: 285, rarity: 'common', origin: 'Italy', originAr: 'إيطاليا' },
  { id: 'fries', name: 'French Fries', nameAr: 'بطاطس مقلية', emoji: '🍟', category: 'junk', healthLevel: 'very-unhealthy', nutrients: ['Fat', 'Sodium'], nutrientsAr: ['دهون', 'صوديوم'], benefits: [{ en: 'Crispy snack', ar: 'وجبة خفيفة مقرمشة' }], calories: 312, rarity: 'common', origin: 'Global', originAr: 'عالمي' },
  { id: 'chips', name: 'Potato Chips', nameAr: 'شيبس', emoji: '🥔', category: 'junk', healthLevel: 'very-unhealthy', nutrients: ['Fat', 'Sodium'], nutrientsAr: ['دهون', 'صوديوم'], benefits: [{ en: 'Snack food', ar: 'وجبة خفيفة' }], calories: 152, rarity: 'common', origin: 'Global', originAr: 'عالمي' }
];

const mealPlans = [
  {
    name: 'Balanced Breakfast',
    nameAr: 'فطار متوازن',
    foods: ['banana', 'brown-rice', 'salmon'],
    totalCalories: 431,
    benefits: { en: 'Provides energy for the day', ar: 'يوفر طاقة لليوم' }
  },
  {
    name: 'Healthy Lunch',
    nameAr: 'غداء صحي',
    foods: ['spinach', 'quinoa', 'carrot'],
    totalCalories: 254,
    benefits: { en: 'Rich in nutrients', ar: 'غني بالعناصر الغذائية' }
  }
];

export function HealthyEatingGame({ isRTL, onGameComplete, onScoreUpdate, onLivesUpdate, onLevelUpdate }: GameProps) {
  const MAX_LEVEL = 40;
  const [currentChallenge, setCurrentChallenge] = useState<HealthyEatingChallenge | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong' | null; message: string }>({ type: null, message: '' });
  const [isAnswering, setIsAnswering] = useState(false);
  const [unlockedFoods, setUnlockedFoods] = useState<Set<string>>(new Set(['apple', 'banana', 'carrot']));
  const [nutritionPoints, setNutritionPoints] = useState(0);
  const [achievementUnlocked, setAchievementUnlocked] = useState<string | null>(null);
  const [selectedMealFoods, setSelectedMealFoods] = useState<Food[]>([]);
  // منع التكرار
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());
  const [recentFoodIds, setRecentFoodIds] = useState<string[]>([]);
  const pushRecent = (arr: string[], value: string, max: number) => {
    const next = [...arr, value];
    if (next.length > max) next.splice(0, next.length - max);
    return next;
  };

  const getAvailableFoods = useCallback((currentLevel: number): Food[] => {
    if (currentLevel <= 10) return foodDatabase.filter(f => f.category === 'fruits');
    if (currentLevel <= 20) return foodDatabase.filter(f => ['fruits', 'vegetables'].includes(f.category));
    if (currentLevel <= 30) return foodDatabase.filter(f => ['fruits', 'vegetables', 'grains', 'dairy', 'proteins'].includes(f.category));
    return foodDatabase; // 31..40 جميع الأطعمة (تشمل بعض الأطعمة غير الصحية لتعلم التمييز)
  }, []);

  const getDifficultySettings = useCallback((level: number) => {
    if (level <= 10) return { optionsCount: 3, challengeTypes: ['identify-healthy'] };
    if (level <= 20) return { optionsCount: 4, challengeTypes: ['identify-healthy', 'nutrient-match'] };
    if (level <= 30) return { optionsCount: 4, challengeTypes: ['identify-healthy', 'nutrient-match', 'seasonal-foods'] };
    return { optionsCount: 5, challengeTypes: ['identify-healthy', 'nutrient-match', 'seasonal-foods', 'meal-planning', 'calorie-counting'] };
  }, []);

  const generateChallenge = useCallback((currentLevel: number): HealthyEatingChallenge => {
    const availableFoods = getAvailableFoods(currentLevel);
    const { optionsCount, challengeTypes } = getDifficultySettings(currentLevel);
    const challengeType = challengeTypes[levelIndex(currentLevel, challengeTypes.length)] as HealthyEatingChallenge['type'];

    const getStarRating = (level: number) => {
      if (level % 10 === 0) return 3; // مستويات مميزة
      if (level % 5 === 0) return 2; // مستويات متوسطة
      return 1; // مستويات عادية
    };

    const pickIndex = (len: number) => levelIndex(currentLevel + usedQuestions.size + questionsAnswered + 1, Math.max(1, len));

    switch (challengeType) {
      case 'identify-healthy': {
        const healthyFoods = availableFoods.filter(f => f.healthLevel === 'very-healthy' || f.healthLevel === 'healthy');
        const unhealthyFoods = availableFoods.filter(f => f.healthLevel === 'unhealthy' || f.healthLevel === 'very-unhealthy');
        let pool = [...healthyFoods, ...unhealthyFoods].filter(f => !usedQuestions.has(`identify-healthy-${f.id}`) && !recentFoodIds.includes(f.id));
        if (pool.length === 0) pool = [...healthyFoods, ...unhealthyFoods];
        const targetFood = pool[pickIndex(pool.length)];
        const otherFoods = cyclePick(availableFoods.filter(f => f.id !== targetFood.id), currentLevel, optionsCount - 1);
        const options = rotateArray([targetFood, ...otherFoods], currentLevel % optionsCount);

        return {
          type: challengeType,
          foods: [targetFood],
          correctAnswer: targetFood.healthLevel === 'very-healthy' || targetFood.healthLevel === 'healthy' ? 'healthy' : 'unhealthy',
          question: `Is this food healthy or unhealthy?`,
          questionAr: `هل هذا الطعام صحي أم غير صحي؟`,
          options: ['healthy', 'unhealthy'],
          level: currentLevel,
          stars: getStarRating(currentLevel)
        };
      }

      case 'nutrient-match': {
        let pool = availableFoods.filter(f => !usedQuestions.has(`nutrient-${f.id}`) && !recentFoodIds.includes(f.id));
        if (pool.length === 0) pool = availableFoods;
        const targetFood = pool[pickIndex(pool.length)];
        const correctNutrient = targetFood.nutrients[0];
        const wrongNutrients = cyclePick(
          availableFoods
            .filter(f => f.id !== targetFood.id && !f.nutrients.includes(correctNutrient))
            .map(f => f.nutrients[0]),
          currentLevel,
          optionsCount - 1
        );
        const options = rotateArray([correctNutrient, ...wrongNutrients], currentLevel % Math.max(1, optionsCount));

        return {
          type: challengeType,
          foods: [targetFood],
          correctAnswer: correctNutrient,
          question: `What is the main nutrient in ${targetFood.name}?`,
          questionAr: `ما هو العنصر الغذائي الرئيسي في ${targetFood.nameAr}؟`,
          options: options,
          level: currentLevel,
          stars: getStarRating(currentLevel)
        };
      }

      case 'seasonal-foods': {
        const seasons = ['spring', 'summer', 'autumn', 'winter'];
        const targetSeason = seasons[levelIndex(currentLevel, seasons.length)] as 'spring' | 'summer' | 'autumn' | 'winter';
        const seasonalFoods = availableFoods.filter(f => f.season === targetSeason);
        const nonSeasonalFoods = availableFoods.filter(f => f.season && f.season !== targetSeason);
        
        if (seasonalFoods.length === 0) {
          return generateChallenge(currentLevel); // Fallback
        }
        
        let pool = seasonalFoods.filter(f => !usedQuestions.has(`season-${targetSeason}-${f.id}`) && !recentFoodIds.includes(f.id));
        if (pool.length === 0) pool = seasonalFoods;
        const correctFood = pool[pickIndex(pool.length)];
        const wrongFoods = cyclePick(nonSeasonalFoods, currentLevel, optionsCount - 1);
        const options = rotateArray([correctFood, ...wrongFoods], currentLevel % optionsCount);

        const seasonNames = {
          spring: { en: 'Spring', ar: 'الربيع' },
          summer: { en: 'Summer', ar: 'الصيف' },
          autumn: { en: 'Autumn', ar: 'الخريف' },
          winter: { en: 'Winter', ar: 'الشتاء' }
        };

        return {
          type: challengeType,
          foods: [correctFood],
          correctAnswer: correctFood.id,
          question: `Which food is in season during ${seasonNames[targetSeason as keyof typeof seasonNames].en}?`,
          questionAr: `أي طعام يكون في موسمه خلال ${seasonNames[targetSeason as keyof typeof seasonNames].ar}؟`,
          options: options,
          level: currentLevel,
          stars: getStarRating(currentLevel)
        };
      }

      case 'meal-planning': {
        const mealPlan = mealPlans[levelIndex(currentLevel + questionsAnswered, mealPlans.length)];
        const mealFoods = mealPlan.foods.map(id => availableFoods.find(f => f.id === id)!).filter(Boolean);
        const wrongFoods = cyclePick(availableFoods.filter(f => !mealPlan.foods.includes(f.id)), currentLevel, optionsCount - 1);
        const allOptions = rotateArray([...mealFoods, ...wrongFoods], currentLevel % Math.max(1, optionsCount));

        return {
          type: challengeType,
          foods: mealFoods,
          correctAnswer: mealFoods.map(f => f.id),
          question: `Select foods for a ${mealPlan.name}`,
          questionAr: `اختر الأطعمة لـ ${mealPlan.nameAr}`,
          options: allOptions,
          level: currentLevel,
          stars: getStarRating(currentLevel)
        };
      }

      case 'calorie-counting': {
        const targetCalories = 200 + (currentLevel * 10);
        const suitableFoods = availableFoods.filter(f => f.calories <= targetCalories);
        const pool = suitableFoods.filter(f => !usedQuestions.has(`cal-${f.id}`) && !recentFoodIds.includes(f.id));
        const pickPool = pool.length > 0 ? pool : suitableFoods;
        const targetFood = pickPool[pickIndex(pickPool.length)];

        return {
          type: challengeType,
          foods: [targetFood],
          correctAnswer: targetFood.calories.toString(),
          question: `How many calories are in ${targetFood.name}?`,
          questionAr: `كم عدد السعرات الحرارية في ${targetFood.nameAr}؟`,
          options: rotateArray([
            targetFood.calories.toString(),
            (targetFood.calories + 50).toString(),
            (targetFood.calories - 50).toString(),
            (targetFood.calories + 100).toString()
          ], currentLevel % 4),
          level: currentLevel,
          stars: getStarRating(currentLevel),
          targetCalories: targetCalories
        };
      }

      default:
        return generateChallenge(currentLevel);
    }
  }, [getAvailableFoods, getDifficultySettings]);

  const handleAnswer = useCallback((answer: string | Food) => {
    if (isAnswering || !currentChallenge) return;
    
    setIsAnswering(true);
    
    let isCorrect = false;
    const answerValue = typeof answer === 'string' ? answer : answer.id;
    
    if (Array.isArray(currentChallenge.correctAnswer)) {
      if (currentChallenge.type === 'meal-planning') {
        const currentSelection = [...selectedMealFoods, answer as Food];
        if (currentSelection.length === (currentChallenge.correctAnswer as string[]).length) {
          isCorrect = currentSelection.every(food => 
            (currentChallenge.correctAnswer as string[]).includes(food.id)
          );
          setSelectedMealFoods([]);
        } else {
          setSelectedMealFoods(currentSelection);
          setIsAnswering(false);
          return;
        }
      }
    } else {
      isCorrect = answerValue === currentChallenge.correctAnswer;
    }
    
    // سجّل السؤال المستخدم لتجنب التكرار
    if (currentChallenge.foods && currentChallenge.foods.length > 0) {
      const key = `${currentChallenge.type}-${currentChallenge.foods.map(f => f.id).join('-')}`;
      setUsedQuestions(prev => new Set([...prev, key]));
      setRecentFoodIds(prev => currentChallenge.foods.reduce((acc, f) => acc.length < 6 ? [...acc, f.id] : acc, prev));
    }

    if (isCorrect) {
      const basePoints = 30 + (currentChallenge.stars * 15);
      const levelBonus = Math.floor(level / 10) * 15;
      const nutritionBonus = currentChallenge.foods.every(f => f.healthLevel === 'very-healthy') ? 20 : 0;
      const points = basePoints + levelBonus + nutritionBonus;
      
      setScore(prev => {
        const newScore = prev + points;
        onScoreUpdate(newScore);
        return newScore;
      });

      setNutritionPoints(prev => prev + currentChallenge.stars * 10);
      
      // Unlock new foods
      currentChallenge.foods.forEach(food => {
        setUnlockedFoods(prev => new Set([...prev, food.id]));
      });
      
      setFeedback({
        type: 'correct',
        message: isRTL ? `ممتاز! +${points} نقطة!` : `Excellent! +${points} points!`
      });
      
      // Check for achievements
      if (level % 25 === 0) {
        setAchievementUnlocked(isRTL ? "خبير التغذية!" : "Nutrition Expert!");
      }
      
      // زيادة الصعوبة أسرع في البدايات، وكل سؤال يرفع مستوى تدريجيًا
      const newLevel = Math.min(level + 1, MAX_LEVEL);
      setLevel(newLevel);
      onLevelUpdate(newLevel);
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      onLivesUpdate(newLives);
      
      const food = currentChallenge.foods[0];
      const hint = isRTL ? food.benefits[0]?.ar : food.benefits[0]?.en;
      
      setFeedback({
        type: 'wrong',
        message: isRTL ? `حاول مرة أخرى! تلميح: ${hint || 'فكر في العناصر الغذائية'}` : `Try again! Hint: ${hint || 'Think about nutrients'}`
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
      // توليد تحدي المستوى التالي مباشرةً لمنع تكرار نفس السؤال
      setCurrentChallenge(generateChallenge(Math.min(level + 1, MAX_LEVEL)));
      setIsAnswering(false);
    }, 2000);
  }, [isAnswering, currentChallenge, selectedMealFoods, level, questionsAnswered, lives, score, isRTL, onScoreUpdate, onLevelUpdate, onLivesUpdate, onGameComplete, generateChallenge]);

  const renderChallenge = useCallback(() => {
    if (!currentChallenge) return null;

    const food = currentChallenge.foods[0];

    switch (currentChallenge.type) {
      case 'identify-healthy':
        return (
          <div className="space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="card-fun text-center bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200"
            >
              <div className="text-6xl mb-4 animate-bounce">{food.emoji}</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {isRTL ? food.nameAr : food.name}
              </h3>
              <div className="text-sm text-gray-600 mb-4">
                <div className="flex justify-center space-x-2 rtl:space-x-reverse">
                  <span>{isRTL ? 'السعرات:' : 'Calories:'} {food.calories}</span>
                  <span>•</span>
                  <span>{isRTL ? food.originAr : food.origin}</span>
                </div>
              </div>
              <h4 className="text-lg font-bold text-green-600 mb-4">
                {isRTL ? currentChallenge.questionAr : currentChallenge.question}
              </h4>
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
                    className={`w-full h-16 text-lg font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg ${
                      option === 'healthy' 
                        ? 'bg-green-100 hover:bg-green-200 text-green-800 border-2 border-green-300'
                        : 'bg-red-100 hover:bg-red-200 text-red-800 border-2 border-red-300'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className="text-2xl mb-1">
                        {option === 'healthy' ? '✅' : '❌'}
                      </div>
                      <span>{isRTL ? (option === 'healthy' ? 'صحي' : 'غير صحي') : option}</span>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* Food Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-green-200"
            >
              <h5 className="text-sm font-bold text-green-700 mb-2 flex items-center">
                <Heart className="w-4 h-4 mr-2" />
                {isRTL ? 'الفوائد:' : 'Benefits:'}
              </h5>
              <p className="text-sm text-gray-600">
                {isRTL ? food.benefits[0]?.ar : food.benefits[0]?.en}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {food.nutrients.map((nutrient, index) => (
                  <span
                    key={nutrient}
                    className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full"
                  >
                    {isRTL ? food.nutrientsAr[index] : nutrient}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        );

      case 'meal-planning':
        return (
          <div className="space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="card-fun text-center bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200"
            >
              <Apple className="w-12 h-12 mx-auto mb-4 text-orange-500" />
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {isRTL ? currentChallenge.questionAr : currentChallenge.question}
              </h3>
              
              {selectedMealFoods.length > 0 && (
                <div className="flex justify-center space-x-2 rtl:space-x-reverse mb-4">
                  <span className="text-sm text-gray-600 mr-2">
                    {isRTL ? 'اختيارك:' : 'Selected:'}
                  </span>
                  {selectedMealFoods.map((food, index) => (
                    <span key={index} className="text-2xl">{food.emoji}</span>
                  ))}
                </div>
              )}
            </motion.div>

            <div className="grid grid-cols-3 gap-3">
              {(currentChallenge.options as Food[]).map((option, index) => (
                <motion.div
                  key={option.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Button
                    onClick={() => handleAnswer(option)}
                    disabled={isAnswering}
                    className="w-full h-16 flex flex-col items-center justify-center bg-white hover:bg-orange-50 text-gray-800 border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
                  >
                    <span className="text-2xl mb-1">{option.emoji}</span>
                    <span className="text-xs font-bold truncate">
                      {isRTL ? option.nameAr : option.name}
                    </span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="card-fun text-center"
            >
              <div className="text-6xl mb-4">{food.emoji}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {isRTL ? currentChallenge.questionAr : currentChallenge.question}
              </h3>
              <div className="flex justify-center space-x-1 rtl:space-x-reverse">
                {[...Array(currentChallenge.stars)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                ))}
              </div>
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
    }
  }, [currentChallenge, isRTL, isAnswering, selectedMealFoods, handleAnswer]);

  // Initialize first challenge
  useEffect(() => {
    if (!currentChallenge) {
      setCurrentChallenge(generateChallenge(1));
    }
  }, [currentChallenge, generateChallenge]);

  if (!currentChallenge) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-6xl animate-pulse">🍎</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Enhanced Game Stats */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="font-bold text-yellow-600">{score}</span>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Crown className="w-5 h-5 text-green-500" />
            <span className="font-bold text-green-600">{level}/100</span>
          </div>
          <div className="flex items-center space-x-1 rtl:space-x-reverse">
            {[...Array(3)].map((_, i) => (
              <span
                key={i}
                className={`text-xl transition-all duration-300 ${
                  i < lives ? 'opacity-100 scale-110' : 'opacity-20 scale-90'
                }`}
              >
                🍎
              </span>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className="bg-gradient-to-r from-green-500 via-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(level / 100) * 100}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-600">
          <span>{isRTL ? "نقاط التغذية" : "Nutrition Points"}: {nutritionPoints}</span>
          <span>{isRTL ? "الأطعمة المفتوحة" : "Foods Unlocked"}: {unlockedFoods.size}</span>
        </div>
      </div>

      {/* Challenge Content */}
      {renderChallenge()}

      {/* Achievement Display */}
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
    </div>
  );
}