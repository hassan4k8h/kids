-- إصلاح قاعدة البيانات - إنشاء الجداول المفقودة
-- يجب تنفيذ هذا الملف في Supabase SQL Editor

-- التحقق من وجود الجداول وإنشاؤها إذا لم تكن موجودة

-- جدول اللاعبين
CREATE TABLE IF NOT EXISTS public.players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INTEGER CHECK (age >= 3 AND age <= 12),
    avatar VARCHAR(255) DEFAULT 'default-avatar.png',
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    coins INTEGER DEFAULT 100,
    achievements TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول نتائج الألعاب
CREATE TABLE IF NOT EXISTS public.game_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
    game_type VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    difficulty VARCHAR(20) DEFAULT 'easy',
    duration INTEGER NOT NULL, -- بالثواني
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الإنجازات
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    requirement INTEGER DEFAULT 1,
    reward_coins INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول إنجازات اللاعبين
CREATE TABLE IF NOT EXISTS public.player_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(player_id, achievement_id)
);

-- جدول إعدادات اللاعبين
CREATE TABLE IF NOT EXISTS public.player_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE UNIQUE,
    sound_enabled BOOLEAN DEFAULT true,
    music_enabled BOOLEAN DEFAULT true,
    sound_volume INTEGER DEFAULT 80 CHECK (sound_volume >= 0 AND sound_volume <= 100),
    music_volume INTEGER DEFAULT 60 CHECK (music_volume >= 0 AND music_volume <= 100),
    language VARCHAR(10) DEFAULT 'ar',
    difficulty_preference VARCHAR(20) DEFAULT 'auto',
    parental_controls JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول جلسات اللعب
CREATE TABLE IF NOT EXISTS public.play_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    total_duration INTEGER, -- بالثواني
    games_played INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0
);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_game_scores_player_id ON public.game_scores(player_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_game_type ON public.game_scores(game_type);
CREATE INDEX IF NOT EXISTS idx_game_scores_score ON public.game_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_player_achievements_player_id ON public.player_achievements(player_id);
CREATE INDEX IF NOT EXISTS idx_play_sessions_player_id ON public.play_sessions(player_id);

-- تفعيل Row Level Security
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.play_sessions ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان الأساسية (يمكن للجميع القراءة والكتابة في وضع التطوير)
CREATE POLICY "Enable read access for all users" ON public.players FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.players FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.players FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.players FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.game_scores FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.game_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.game_scores FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.game_scores FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.achievements FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.achievements FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.achievements FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.player_achievements FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.player_achievements FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.player_achievements FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.player_achievements FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.player_settings FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.player_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.player_settings FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.player_settings FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.play_sessions FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.play_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.play_sessions FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.play_sessions FOR DELETE USING (true);

-- إدراج بيانات الإنجازات الأساسية
INSERT INTO public.achievements (name, description, icon, requirement, reward_coins) VALUES
('أول لعبة', 'أكمل أول لعبة لك', '🎮', 1, 10),
('عاشق الألعاب', 'العب 10 ألعاب', '❤️', 10, 50),
('خبير الألعاب', 'العب 50 لعبة', '🏆', 50, 100),
('ماستر الألعاب', 'العب 100 لعبة', '👑', 100, 200),
('جامع النقاط', 'احصل على 1000 نقطة', '💎', 1000, 75),
('ملك النقاط', 'احصل على 5000 نقطة', '💰', 5000, 150),
('عبقري الرياضيات', 'احصل على 100 نقطة في لعبة الرياضيات', '🔢', 100, 30),
('خبير الحروف', 'احصل على 100 نقطة في لعبة الحروف', '📝', 100, 30),
('فنان الألوان', 'احصل على 100 نقطة في لعبة الألوان', '🎨', 100, 30),
('عالم الأشكال', 'احصل على 100 نقطة في لعبة الأشكال', '🔷', 100, 30),
('محب الحيوانات', 'احصل على 100 نقطة في لعبة أصوات الحيوانات', '🐾', 100, 30),
('خبير الذاكرة', 'احصل على 100 نقطة في لعبة الذاكرة', '🧠', 100, 30),
('موسيقار صغير', 'احصل على 100 نقطة في لعبة الموسيقى', '🎵', 100, 30),
('خبير الطقس', 'احصل على 100 نقطة في لعبة الطقس', '🌤️', 100, 30),
('محب الطعام الصحي', 'احصل على 100 نقطة في لعبة الطعام الصحي', '🥗', 100, 30),
('ملك الألغاز', 'احصل على 100 نقطة في لعبة الألغاز', '🧩', 100, 30)
ON CONFLICT (name) DO NOTHING;

-- إنشاء بعض اللاعبين التجريبيين
INSERT INTO public.players (name, age, avatar, level, experience, coins) VALUES
('أحمد', 6, 'boy1.png', 3, 250, 150),
('فاطمة', 5, 'girl1.png', 2, 180, 120),
('محمد', 7, 'boy2.png', 4, 320, 200),
('عائشة', 4, 'girl2.png', 1, 50, 100)
ON CONFLICT DO NOTHING;

SELECT 'تم إنشاء قاعدة البيانات بنجاح! ✅' as status;