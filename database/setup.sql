-- إنشاء جداول قاعدة البيانات للعبة التعليمية
-- يجب تنفيذ هذا الملف في Supabase SQL Editor

-- جدول المستخدمين (الآباء)
CREATE TABLE IF NOT EXISTS users (
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

-- جدول اللاعبين (الأطفال) - مرتبط بالمستخدمين
CREATE TABLE IF NOT EXISTS players (
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

-- جدول نتائج الألعاب
CREATE TABLE IF NOT EXISTS game_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    game_type VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    difficulty VARCHAR(20) DEFAULT 'easy',
    duration INTEGER NOT NULL, -- بالثواني
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الإنجازات
CREATE TABLE IF NOT EXISTS achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    requirement INTEGER DEFAULT 1,
    reward_coins INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول إنجازات اللاعبين
CREATE TABLE IF NOT EXISTS player_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(player_id, achievement_id)
);

-- جدول إعدادات اللاعبين
CREATE TABLE IF NOT EXISTS player_settings (
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

-- جدول جلسات اللعب
CREATE TABLE IF NOT EXISTS play_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    total_duration INTEGER, -- بالثواني
    games_played INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0
);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_game_scores_player_id ON game_scores(player_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_game_type ON game_scores(game_type);
CREATE INDEX IF NOT EXISTS idx_game_scores_score ON game_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_player_achievements_player_id ON player_achievements(player_id);
CREATE INDEX IF NOT EXISTS idx_play_sessions_player_id ON play_sessions(player_id);

-- إنشاء وظائف مساعدة

-- وظيفة لإضافة العملات
CREATE OR REPLACE FUNCTION add_coins(player_id UUID, coins_to_add INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE players 
    SET coins = coins + coins_to_add,
        updated_at = NOW()
    WHERE id = player_id;
END;
$$ LANGUAGE plpgsql;

-- وظيفة لإضافة الخبرة وتحديث المستوى
CREATE OR REPLACE FUNCTION add_experience(player_id UUID, exp_to_add INTEGER)
RETURNS VOID AS $$
DECLARE
    current_exp INTEGER;
    current_level INTEGER;
    new_level INTEGER;
BEGIN
    -- الحصول على الخبرة والمستوى الحاليين
    SELECT experience, level INTO current_exp, current_level
    FROM players WHERE id = player_id;
    
    -- إضافة الخبرة الجديدة
    current_exp := current_exp + exp_to_add;
    
    -- حساب المستوى الجديد (كل 100 نقطة خبرة = مستوى واحد)
    new_level := GREATEST(1, current_exp / 100 + 1);
    
    -- تحديث اللاعب
    UPDATE players 
    SET experience = current_exp,
        level = new_level,
        updated_at = NOW()
    WHERE id = player_id;
    
    -- إضافة عملات إضافية عند الترقية
    IF new_level > current_level THEN
        UPDATE players 
        SET coins = coins + (new_level - current_level) * 50
        WHERE id = player_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- وظيفة لحساب إحصائيات اللاعب
CREATE OR REPLACE FUNCTION get_player_stats(player_id UUID)
RETURNS TABLE(
    total_games INTEGER,
    total_score INTEGER,
    average_score NUMERIC,
    favorite_game TEXT,
    total_playtime INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_games,
        SUM(gs.score)::INTEGER as total_score,
        ROUND(AVG(gs.score), 2) as average_score,
        MODE() WITHIN GROUP (ORDER BY gs.game_type) as favorite_game,
        SUM(gs.duration)::INTEGER as total_playtime
    FROM game_scores gs
    WHERE gs.player_id = get_player_stats.player_id;
END;
$$ LANGUAGE plpgsql;

-- إدراج بيانات الإنجازات الأساسية
INSERT INTO achievements (name, description, icon, requirement, reward_coins) VALUES
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
ON CONFLICT DO NOTHING;

-- إنشاء سياسات الأمان (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_sessions ENABLE ROW LEVEL SECURITY;

-- سياسات للقراءة والكتابة (مفتوحة للجميع في البداية)
CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON users FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON users FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON players FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON players FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON players FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON game_scores FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON game_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON game_scores FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON game_scores FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON achievements FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON player_achievements FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON player_achievements FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON player_achievements FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON player_achievements FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON player_settings FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON player_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON player_settings FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON player_settings FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON play_sessions FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON play_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON play_sessions FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON play_sessions FOR DELETE USING (true);

-- إنشاء triggers لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_settings_updated_at BEFORE UPDATE ON player_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- رسالة تأكيد
DO $$
BEGIN
    RAISE NOTICE 'تم إنشاء جداول قاعدة البيانات بنجاح! 🎉';
    RAISE NOTICE 'يمكنك الآن البدء في استخدام اللعبة التعليمية.';
END $$;