import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { 
  ArrowLeft, ArrowRight, BookOpen, Search, Filter, 
  Play, Pause, RotateCcw, Volume2, VolumeX, 
  Star, Heart, Award, Sparkles, Home, Clock,
  Users, Calendar, Trophy, Gift, Crown, Lock
} from "lucide-react";
import { Player } from "../../types/Player";
import { audioService } from "../../services/AudioService";
import { subscriptionService } from "../../services/SubscriptionService";
import { 
  getAvailableStories, 
  getStoriesByCategory, 
  getStoriesByAgeGroup, 
  searchStories, 
  personalizeStory,
  StoryTemplate,
  StoryCharacter,
  StoryContent,
  STORY_CATEGORIES,
  AGE_GROUPS,
  STORY_CHARACTERS
} from "../../constants/stories";

interface StoryEngineProps {
  player: Player;
  isRTL: boolean;
  onComplete: (stats: { storiesRead: number; pointsEarned: number; timeSpent: number }) => void;
  onBack: () => void;
}

type StoryEngineState = 'selection' | 'reading' | 'completed';

interface StoryStats {
  storiesRead: number;
  pointsEarned: number;
  timeSpent: number;
  currentStreak: number;
  favoriteStories: string[];
  unlockedCharacters: string[];
}

export function StoryEngine({ player, isRTL, onComplete, onBack }: StoryEngineProps) {
  const [engineState, setEngineState] = useState<StoryEngineState>('selection');
  const [selectedStory, setSelectedStory] = useState<StoryTemplate | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('all');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [storyStats, setStoryStats] = useState<StoryStats>({
    storiesRead: 0,
    pointsEarned: 0,
    timeSpent: 0,
    currentStreak: 0,
    favoriteStories: [],
    unlockedCharacters: []
  });
  const [startTime, setStartTime] = useState<number>(0);
  const [subscriptionState, setSubscriptionState] = useState(subscriptionService.getSubscriptionState());
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const readingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // مراقبة حالة الاشتراك
  useEffect(() => {
    const unsubscribe = subscriptionService.subscribe((newState) => {
      setSubscriptionState(newState);
    });
    return unsubscribe;
  }, []);

  // تشغيل الموسيقى الخلفية
  useEffect(() => {
    if (engineState === 'reading' && isPlaying && !isMuted) {
      audioService.playBackgroundMusic(true);
    } else {
      audioService.stopBackgroundMusic();
    }

    return () => {
      audioService.stopBackgroundMusic();
    };
  }, [engineState, isPlaying, isMuted]);

  // تنظيف المؤقتات عند إلغاء المكون
  useEffect(() => {
    return () => {
      if (readingTimerRef.current) {
        clearTimeout(readingTimerRef.current);
      }
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current);
      }
    };
  }, []);

  // الحصول على القصص المتاحة
  const getFilteredStories = (): StoryTemplate[] => {
    const isPremium = subscriptionState.activePlan?.id !== 'free';
    let stories = getAvailableStories(isPremium);

    // تطبيق البحث
    if (searchQuery) {
      stories = searchStories(searchQuery, isPremium);
    }

    // تطبيق فلتر الفئة
    if (selectedCategory !== 'all') {
      stories = getStoriesByCategory(selectedCategory, isPremium);
    }

    // تطبيق فلتر العمر
    if (selectedAgeGroup !== 'all') {
      stories = getStoriesByAgeGroup(selectedAgeGroup, isPremium);
    }

    return stories;
  };

  // معالج اختيار القصة
  const handleStorySelect = (story: StoryTemplate) => {
    // فحص إمكانية الوصول للقصة
    const canAccess = subscriptionService.canAccessContent('story');
    if (!canAccess.canAccess) {
      setShowUpgradePrompt(true);
      return;
    }

    audioService.playClick();
    const personalizedStory = personalizeStory(story, player.name);
    setSelectedStory(personalizedStory);
    setCurrentPage(0);
    setEngineState('reading');
    setIsPlaying(true);
    setStartTime(Date.now());
    setReadingProgress(0);

    // تشغيل صوت بدء القصة
    audioService.playStoryPage();
  };

  // معالج الانتقال للصفحة التالية
  const handleNextPage = () => {
    if (!selectedStory) return;

    audioService.playStoryPage();
    
    if (currentPage < selectedStory.content.length - 1) {
      setCurrentPage(currentPage + 1);
      setReadingProgress(((currentPage + 1) / selectedStory.content.length) * 100);
    } else {
      handleStoryComplete();
    }
  };

  // معالج الانتقال للصفحة السابقة
  const handlePrevPage = () => {
    if (currentPage > 0) {
      audioService.playClick();
      setCurrentPage(currentPage - 1);
      setReadingProgress(((currentPage - 1) / selectedStory!.content.length) * 100);
    }
  };

  // معالج إتمام القصة
  const handleStoryComplete = () => {
    if (!selectedStory) return;

    const endTime = Date.now();
    const timeSpent = Math.floor((endTime - startTime) / 1000 / 60); // بالدقائق
    const pointsEarned = selectedStory.content.length * 10; // 10 نقاط لكل صفحة

    // تحديث إحصائيات القصة
    const newStats = {
      ...storyStats,
      storiesRead: storyStats.storiesRead + 1,
      pointsEarned: storyStats.pointsEarned + pointsEarned,
      timeSpent: storyStats.timeSpent + timeSpent,
      currentStreak: storyStats.currentStreak + 1
    };

    setStoryStats(newStats);
    setEngineState('completed');
    audioService.playStoryComplete();

    // تسجيل استخدام القصة
    subscriptionService.recordUsage(player.id, 'story');

    // إرسال الإحصائيات للمكون الأب
    setTimeout(() => {
      onComplete({
        storiesRead: 1,
        pointsEarned,
        timeSpent
      });
    }, 3000);
  };

  // معالج إعادة تشغيل القصة
  const handleRestartStory = () => {
    audioService.playClick();
    setCurrentPage(0);
    setReadingProgress(0);
    setEngineState('reading');
    setIsPlaying(true);
    setStartTime(Date.now());
  };

  // معالج كتم الصوت
  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    audioService.setSoundEnabled(!isMuted);
    audioService.playClick();
  };

  // معالج تشغيل/إيقاف القراءة التلقائية
  const handleToggleAutoPlay = () => {
    setIsPlaying(!isPlaying);
    audioService.playClick();
  };

  // عرض شاشة اختيار القصة
  const renderStorySelection = () => {
    const filteredStories = getFilteredStories();
    const isPremium = subscriptionState.activePlan?.id !== 'free';

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center space-x-3 rtl:space-x-reverse mb-4"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extra-bold text-white text-bold-shadow">
                {isRTL ? `مكتبة ${player.name}` : `${player.name}'s Library`}
              </h1>
              <p className="text-white/90 font-bold">
                {isRTL ? 'اكتشف عالم المغامرات اللا نهائية' : 'Discover a world of endless adventures'}
              </p>
            </div>
          </motion.div>
        </div>

        {/* إحصائيات سريعة */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-4 mb-6"
        >
          <Card className="p-4 text-center bg-white/95 backdrop-blur-sm border border-white/20">
            <div className="text-2xl font-extra-bold text-purple-600 mb-1">
              {storyStats.storiesRead}
            </div>
            <div className="text-sm font-bold text-gray-600">
              {isRTL ? 'قصص مقروءة' : 'Stories Read'}
            </div>
          </Card>
          <Card className="p-4 text-center bg-white/95 backdrop-blur-sm border border-white/20">
            <div className="text-2xl font-extra-bold text-blue-600 mb-1">
              {storyStats.pointsEarned}
            </div>
            <div className="text-sm font-bold text-gray-600">
              {isRTL ? 'نقاط' : 'Points'}
            </div>
          </Card>
          <Card className="p-4 text-center bg-white/95 backdrop-blur-sm border border-white/20">
            <div className="text-2xl font-extra-bold text-green-600 mb-1">
              {storyStats.currentStreak}
            </div>
            <div className="text-sm font-bold text-gray-600">
              {isRTL ? 'متتالية' : 'Streak'}
            </div>
          </Card>
        </motion.div>

        {/* أدوات البحث والتصفية */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
        >
          <div className="grid md:grid-cols-3 gap-4">
            {/* شريط البحث */}
            <div className="relative">
              <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder={isRTL ? 'ابحث عن قصة...' : 'Search stories...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rtl:pr-10 rtl:pl-3 font-bold"
              />
            </div>

            {/* فلتر الفئة */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">{isRTL ? 'جميع الفئات' : 'All Categories'}</option>
              {STORY_CATEGORIES.map(category => (
                <option key={category.id} value={category.id}>
                  {isRTL ? category.nameAr : category.name}
                </option>
              ))}
            </select>

            {/* فلتر العمر */}
            <select
              value={selectedAgeGroup}
              onChange={(e) => setSelectedAgeGroup(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">{isRTL ? 'جميع الأعمار' : 'All Ages'}</option>
              {AGE_GROUPS.map(ageGroup => (
                <option key={ageGroup.id} value={ageGroup.id}>
                  {isRTL ? ageGroup.nameAr : ageGroup.name}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* قائمة القصص */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredStories.map((story, index) => (
            <StoryCard
              key={story.id}
              story={story}
              character={STORY_CHARACTERS.find(c => c.id === story.characterId)}
              player={player}
              isRTL={isRTL}
              isPremium={isPremium}
              onSelect={() => handleStorySelect(story)}
              animationDelay={index * 0.1}
            />
          ))}
        </motion.div>

        {/* رسالة عدم وجود قصص */}
        {filteredStories.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-extra-bold text-white mb-2">
              {isRTL ? 'لا توجد قصص' : 'No Stories Found'}
            </h3>
            <p className="text-white/80 font-bold">
              {isRTL ? 'جرب تغيير معايير البحث' : 'Try changing your search criteria'}
            </p>
          </motion.div>
        )}

        {/* معلومات الاشتراك */}
        {!isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-center"
          >
            <Crown className="w-12 h-12 text-white mx-auto mb-4" />
            <h3 className="text-xl font-extra-bold text-white mb-2">
              {isRTL ? 'اكتشف المزيد من القصص!' : 'Discover More Stories!'}
            </h3>
            <p className="text-white/90 font-bold mb-4">
              {isRTL 
                ? 'ترقى للباقة المميزة للوصول لأكثر من 200 قصة إضافية'  
                : 'Upgrade to premium for access to 200+ additional stories'
              }
            </p>
            <Button
              onClick={() => setShowUpgradePrompt(true)}
              className="bg-white text-orange-600 hover:bg-gray-100 font-extra-bold"
            >
              {isRTL ? 'ترقية الآن' : 'Upgrade Now'}
            </Button>
          </motion.div>
        )}
      </motion.div>
    );
  };

  // عرض صفحة القراءة
  const renderStoryReading = () => {
    if (!selectedStory) return null;

    const currentContent = selectedStory.content[currentPage];
    const progress = ((currentPage + 1) / selectedStory.content.length) * 100;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col"
      >
        {/* شريط التقدم والتحكم */}
        <div className="bg-white/95 backdrop-blur-sm p-4 border-b border-white/20">
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={() => setEngineState('selection')}
              variant="ghost"
              size="sm"
              className="text-purple-600 hover:bg-purple-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Button
                onClick={handleToggleAutoPlay}
                variant="ghost"
                size="sm"
                className="text-purple-600 hover:bg-purple-100"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              
              <Button
                onClick={handleToggleMute}
                variant="ghost"
                size="sm"
                className="text-purple-600 hover:bg-purple-100"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              
              <Button
                onClick={handleRestartStory}
                variant="ghost"
                size="sm"
                className="text-purple-600 hover:bg-purple-100"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-gray-600">
                  {isRTL ? selectedStory.titleAr : selectedStory.title}
                </span>
                <span className="text-sm font-bold text-gray-600">
                  {currentPage + 1} / {selectedStory.content.length}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </div>

        {/* محتوى القصة */}
        <div className="flex-1 p-6 bg-gradient-to-br from-purple-50 to-pink-50">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 50 : -50 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="p-8 bg-white/95 backdrop-blur-sm border border-white/20 shadow-lg">
              {/* صورة الصفحة */}
              {currentContent.image && (
                <div className="relative mb-6 rounded-2xl overflow-hidden">
                  <img
                    src={currentContent.image}
                    alt={`${isRTL ? selectedStory.titleAr : selectedStory.title} - صفحة ${currentPage + 1}`}
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      // إذا فشل تحميل الصورة، استخدم صورة افتراضية
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop';
                    }}
                  />
                  
                  {/* صورة الطفل المدمجة */}
                  {currentContent.childImagePlacement && player.avatar && (
                    <div className={`absolute ${
                      currentContent.childImagePlacement === 'hero' ? 'top-4 left-4' :
                      currentContent.childImagePlacement === 'side' ? 'top-4 right-4' :
                      currentContent.childImagePlacement === 'background' ? 'bottom-4 left-4' :
                      currentContent.childImagePlacement === 'main' ? 'center' :
                      'top-4 left-4'
                    } ${currentContent.childImagePlacement === 'main' ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' : ''} w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg`}>
                      {player.avatar.startsWith('data:') || player.avatar.startsWith('http') ? (
                        <img
                          src={player.avatar}
                          alt={player.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-2xl">
                          {player.avatar}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* نص القصة */}
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-800 leading-relaxed font-bold text-lg">
                  {isRTL ? currentContent.textAr : currentContent.text}
                </p>
              </div>

              {/* أزرار التنقل */}
              <div className="flex justify-between items-center mt-8">
                <Button
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  variant="outline"
                  className="flex items-center space-x-2 rtl:space-x-reverse"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-bold">{isRTL ? 'السابق' : 'Previous'}</span>
                </Button>

                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <div className="flex space-x-1 rtl:space-x-reverse">
                    {Array.from({ length: selectedStory.content.length }, (_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i === currentPage ? 'bg-purple-600' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleNextPage}
                  className="flex items-center space-x-2 rtl:space-x-reverse btn-fun text-white"
                >
                  <span className="font-bold">
                    {currentPage === selectedStory.content.length - 1 
                      ? (isRTL ? 'إنهاء' : 'Finish')
                      : (isRTL ? 'التالي' : 'Next')
                    }
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  // عرض شاشة إتمام القصة
  const renderStoryCompleted = () => {
    if (!selectedStory) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen flex items-center justify-center p-6"
      >
        <Card className="max-w-2xl w-full p-8 text-center bg-white/95 backdrop-blur-sm border border-white/20">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-extra-bold text-gray-800 mb-2">
              {isRTL ? `أحسنت، ${player.name}!` : `Well Done, ${player.name}!`}
            </h2>
            <p className="text-gray-600 font-bold">
              {isRTL ? 'لقد أنهيت قصة رائعة!' : 'You\'ve completed an amazing story!'}
            </p>
          </motion.div>

          {/* إحصائيات القصة */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-extra-bold text-blue-600 mb-1">
                {selectedStory.content.length}
              </div>
              <div className="text-sm font-bold text-gray-600">
                {isRTL ? 'صفحات' : 'Pages'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-extra-bold text-green-600 mb-1">
                {selectedStory.content.length * 10}
              </div>
              <div className="text-sm font-bold text-gray-600">
                {isRTL ? 'نقاط' : 'Points'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-extra-bold text-purple-600 mb-1">
                {selectedStory.duration}
              </div>
              <div className="text-sm font-bold text-gray-600">
                {isRTL ? 'دقائق' : 'Minutes'}
              </div>
            </div>
          </div>

          {/* العبرة من القصة */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-purple-600 mr-2" />
              <h3 className="font-extra-bold text-purple-800">
                {isRTL ? 'العبرة من القصة' : 'Story Moral'}
              </h3>
            </div>
            <p className="text-purple-700 font-bold text-center">
              {isRTL ? selectedStory.moralAr : selectedStory.moral}
            </p>
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleRestartStory}
              variant="outline"
              className="flex items-center space-x-2 rtl:space-x-reverse"
            >
              <RotateCcw className="w-5 h-5" />
              <span className="font-bold">{isRTL ? 'إعادة قراءة' : 'Read Again'}</span>
            </Button>
            
            <Button
              onClick={() => setEngineState('selection')}
              className="flex items-center space-x-2 rtl:space-x-reverse btn-fun text-white"
            >
              <BookOpen className="w-5 h-5" />
              <span className="font-bold">{isRTL ? 'قصة جديدة' : 'New Story'}</span>
            </Button>
            
            <Button
              onClick={onBack}
              variant="outline"
              className="flex items-center space-x-2 rtl:space-x-reverse"
            >
              <Home className="w-5 h-5" />
              <span className="font-bold">{isRTL ? 'العودة للرئيسية' : 'Back to Home'}</span>
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 ${isRTL ? 'rtl' : ''}`}>
      <div className="container-responsive py-6">
        {/* Header للاختيار فقط */}
        {engineState === 'selection' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8 safe-area-top"
          >
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-white hover:bg-white/20 p-3 rounded-xl font-bold"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            
            <div className="text-center">
              <h1 className="text-white text-2xl font-extra-bold text-bold-shadow">
                {isRTL ? "عالم القصص" : "Story World"}
              </h1>
            </div>
            
            <div className="w-12" />
          </motion.div>
        )}

        {/* المحتوى الرئيسي */}
        <AnimatePresence mode="wait">
          {engineState === 'selection' && renderStorySelection()}
          {engineState === 'reading' && renderStoryReading()}
          {engineState === 'completed' && renderStoryCompleted()}
        </AnimatePresence>
      </div>
    </div>
  );
}

// مكون بطاقة القصة المحسن
interface StoryCardProps {
  story: StoryTemplate;
  character?: StoryCharacter;
  player: Player;
  isRTL: boolean;
  isPremium: boolean;
  onSelect: () => void;
  animationDelay: number;
}

function StoryCard({ story, character, player, isRTL, isPremium, onSelect, animationDelay }: StoryCardProps) {
  const canAccess = !story.isPremium || isPremium;
  
  // تخصيص العنوان باسم الطفل الفعلي
  const personalizedTitle = isRTL 
    ? story.titleAr.replace(/{childName}/g, player.name)
    : story.title.replace(/{childName}/g, player.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="relative cursor-pointer"
      onClick={canAccess ? onSelect : undefined}
    >
      {/* شارة Premium */}
      {story.isPremium && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full font-extra-bold text-xs flex items-center space-x-1">
            <Crown className="w-3 h-3" />
            <span>{isRTL ? 'مميز' : 'Premium'}</span>
          </div>
        </div>
      )}

      {/* قفل للقصص المدفوعة */}
      {story.isPremium && !isPremium && (
        <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center z-10">
          <div className="text-center">
            <Lock className="w-8 h-8 text-white mx-auto mb-2" />
            <div className="text-white font-bold text-sm">
              {isRTL ? 'اشتراك مطلوب' : 'Premium Required'}
            </div>
          </div>
        </div>
      )}

      <Card className="overflow-hidden bg-white/95 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
        {/* صورة الغلاف */}
        <div className="relative aspect-video">
          <img
            src={character?.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'}
            alt={personalizedTitle}
            className="w-full h-full object-cover"
            onError={(e) => {
              // إذا فشل تحميل الصورة، استخدم صورة افتراضية
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop';
            }}
          />
          
          {/* صورة الطفل كبطل */}
          <div className="absolute top-3 left-3 w-12 h-12 rounded-full overflow-hidden border-3 border-white shadow-lg">
            {player.avatar.startsWith('data:') || player.avatar.startsWith('http') ? (
              <img
                src={player.avatar}
                alt={player.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-xl">
                {player.avatar}
              </div>
            )}
          </div>

          {/* معلومات إضافية */}
          <div className="absolute bottom-3 right-3 flex items-center space-x-2 rtl:space-x-reverse">
            <Badge variant="secondary" className="text-xs font-bold">
              {story.ageGroup}
            </Badge>
            <Badge variant="secondary" className="text-xs font-bold">
              {story.duration}م
            </Badge>
          </div>
        </div>

        {/* محتوى البطاقة */}
        <div className="p-4">
          <h3 className="font-extra-bold text-gray-800 text-lg leading-tight mb-2">
            {personalizedTitle}
          </h3>
          
          <p className="text-gray-600 text-sm font-bold mb-3 line-clamp-2">
            {isRTL ? character?.descriptionAr : character?.description}
          </p>

          {/* معلومات القصة */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <Clock className="w-3 h-3" />
              <span className="font-bold">{story.duration} {isRTL ? 'دقائق' : 'min'}</span>
            </div>
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <BookOpen className="w-3 h-3" />
              <span className="font-bold">{story.content.length} {isRTL ? 'صفحات' : 'pages'}</span>
            </div>
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <Award className="w-3 h-3" />
              <span className="font-bold">{story.content.length * 10} {isRTL ? 'نقاط' : 'pts'}</span>
            </div>
          </div>

          {/* الكلمات المفتاحية */}
          <div className="flex flex-wrap gap-1 mt-3">
            {(isRTL ? story.keywordsAr : story.keywords).slice(0, 3).map((keyword, index) => (
              <Badge key={index} variant="outline" className="text-xs font-bold">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}