-- إصلاح شامل لجميع مشاكل قاعدة البيانات
-- يجب تنفيذ هذا الملف في Supabase SQL Editor

-- حذف الجداول الموجودة إذا كانت تحتوي على أخطاء
DROP TABLE IF EXISTS play_sessions CASCADE;
DROP TABLE IF EXISTS player_settings CASCADE;
DROP TABLE IF EXISTS player_achievements CASCADE;
DROP TABLE IF EXISTS game_scores CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- إنشاء جدول المستخدمين (الآباء)
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    avatar VARCHAR(255),
    provider VARCHAR(20) DEFAULT 'email',
    is_email_verified BOOLEAN DEFAULT false,
    preferences JSONB DEFAULT '{}',
    subscription_type VARCHAR(20) DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- إنشاء جدول اللاعبين (الأطفال)
CREATE TABLE players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    age INTEGER CHECK (age >= 3 AND age <= 12),
    avatar VARCHAR(255) DEFAULT 'default-avatar.png',
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    coins INTEGER DEFAULT 100,
    achievements TEXT[] DEFAULT '{}',
    game_progress JSONB DEFAULT '{}',
    story_progress JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_played TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول نتائج الألعاب
CREATE TABLE game_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    game_type VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    difficulty VARCHAR(20) DEFAULT 'easy',
    duration INTEGER NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول الإنجازات
CREATE TABLE achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    requirement INTEGER DEFAULT 1,
    reward_coins INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول إنجازات اللاعبين
CREATE TABLE player_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(player_id, achievement_id)
);

-- إنشاء جدول إعدادات اللاعبين
CREATE TABLE player_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE UNIQUE,
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

-- إنشاء جدول جلسات اللعب
CREATE TABLE play_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    total_duration INTEGER,
    games_played INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0
);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX idx_game_scores_player_id ON game_scores(player_id);
CREATE INDEX idx_game_scores_game_type ON game_scores(game_type);
CREATE INDEX idx_game_scores_score ON game_scores(score DESC);
CREATE INDEX idx_player_achievements_player_id ON player_achievements(player_id);
CREATE INDEX idx_play_sessions_player_id ON play_sessions(player_id);
CREATE INDEX idx_players_user_id ON players(user_id);
CREATE INDEX idx_users_email ON users(email);

-- تفعيل Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_sessions ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات أمان مؤقتة (للتطوير)
CREATE POLICY "Enable all access for users" ON users FOR ALL USING (true);
CREATE POLICY "Enable all access for players" ON players FOR ALL USING (true);
CREATE POLICY "Enable all access for game_scores" ON game_scores FOR ALL USING (true);
CREATE POLICY "Enable all access for achievements" ON achievements FOR ALL USING (true);
CREATE POLICY "Enable all access for player_achievements" ON player_achievements FOR ALL USING (true);
CREATE POLICY "Enable all access for player_settings" ON player_settings FOR ALL USING (true);
CREATE POLICY "Enable all access for play_sessions" ON play_sessions FOR ALL USING (true);

-- إدراج بيانات الإنجازات الأساسية
INSERT INTO achievements (name, description, icon, requirement, reward_coins) VALUES
('أول لعبة', 'أكمل أول لعبة لك', '🎮', 1, 10),
('عاشق الألعاب', 'العب 10 ألعاب', '❤️', 10, 50),
('محترف الألعاب', 'العب 50 لعبة', '🏆', 50, 100),
('عبقري الرياضيات', 'احصل على 100 نقطة في لعبة الرياضيات', '🧮', 100, 25),
('خبير الحروف', 'احصل على 100 نقطة في لعبة الحروف', '📝', 100, 25),
('ملك الألوان', 'احصل على 100 نقطة في لعبة الألوان', '🎨', 100, 25),
('أسطورة الأشكال', 'احصل على 100 نقطة في لعبة الأشكال', '🔷', 100, 25),
('جامع العملات', 'اجمع 500 عملة', '💰', 500, 75),
('ثري صغير', 'اجمع 1000 عملة', '💎', 1000, 150),
('نجم اليوم', 'العب لمدة ساعة متواصلة', '⭐', 3600, 30),
('مثابر', 'العب لمدة 5 أيام متتالية', '🔥', 5, 100),
('بطل الأسبوع', 'العب كل يوم لمدة أسبوع', '👑', 7, 200),
('مستكشف', 'جرب جميع الألعاب', '🗺️', 4, 80),
('سريع البرق', 'أكمل لعبة في أقل من دقيقة', '⚡', 60, 40),
('دقيق الهدف', 'احصل على نتيجة مثالية', '🎯', 1, 60),
('عبقري صغير', 'احصل على المستوى 10', '🧠', 10, 300);

-- إنشاء وظائف مساعدة
CREATE OR REPLACE FUNCTION add_coins(player_id UUID, coins_to_add INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE players 
    SET coins = coins + coins_to_add,
        updated_at = NOW()
    WHERE id = player_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION add_experience(player_id UUID, exp_to_add INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE players 
    SET experience = experience + exp_to_add,
        level = CASE 
            WHEN (experience + exp_to_add) >= level * 100 THEN level + 1
            ELSE level
        END,
        updated_at = NOW()
    WHERE id = player_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_player_stats(player_id UUID)
RETURNS TABLE(
    total_games INTEGER,
    total_score INTEGER,
    avg_score NUMERIC,
    best_score INTEGER,
    total_playtime INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_games,
        SUM(score)::INTEGER as total_score,
        AVG(score) as avg_score,
        MAX(score)::INTEGER as best_score,
        SUM(duration)::INTEGER as total_playtime
    FROM game_scores 
    WHERE game_scores.player_id = get_player_stats.player_id;
END;
$$ LANGUAGE plpgsql;

-- رسالة نجاح
SELECT 'تم إنشاء قاعدة البيانات بنجاح! ✅' as status;