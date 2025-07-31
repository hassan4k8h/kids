-- تحسين سياسات الأمان لضمان فصل البيانات بين المستخدمين
-- يجب تنفيذ هذا الملف في Supabase SQL Editor بعد setup.sql

-- حذف السياسات القديمة المفتوحة للجميع
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert access for all users" ON users;
DROP POLICY IF EXISTS "Enable update access for all users" ON users;
DROP POLICY IF EXISTS "Enable delete access for all users" ON users;

DROP POLICY IF EXISTS "Enable read access for all users" ON players;
DROP POLICY IF EXISTS "Enable insert access for all users" ON players;
DROP POLICY IF EXISTS "Enable update access for all users" ON players;
DROP POLICY IF EXISTS "Enable delete access for all users" ON players;

DROP POLICY IF EXISTS "Enable read access for all users" ON game_scores;
DROP POLICY IF EXISTS "Enable insert access for all users" ON game_scores;
DROP POLICY IF EXISTS "Enable update access for all users" ON game_scores;
DROP POLICY IF EXISTS "Enable delete access for all users" ON game_scores;

DROP POLICY IF EXISTS "Enable read access for all users" ON player_achievements;
DROP POLICY IF EXISTS "Enable insert access for all users" ON player_achievements;
DROP POLICY IF EXISTS "Enable update access for all users" ON player_achievements;
DROP POLICY IF EXISTS "Enable delete access for all users" ON player_achievements;

DROP POLICY IF EXISTS "Enable read access for all users" ON player_settings;
DROP POLICY IF EXISTS "Enable insert access for all users" ON player_settings;
DROP POLICY IF EXISTS "Enable update access for all users" ON player_settings;
DROP POLICY IF EXISTS "Enable delete access for all users" ON player_settings;

DROP POLICY IF EXISTS "Enable read access for all users" ON play_sessions;
DROP POLICY IF EXISTS "Enable insert access for all users" ON play_sessions;
DROP POLICY IF EXISTS "Enable update access for all users" ON play_sessions;
DROP POLICY IF EXISTS "Enable delete access for all users" ON play_sessions;

-- إنشاء سياسات أمان محسنة

-- سياسات جدول المستخدمين - كل مستخدم يمكنه الوصول لبياناته فقط
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own data" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can delete own data" ON users
    FOR DELETE USING (auth.uid()::text = id::text);

-- سياسات جدول اللاعبين - كل مستخدم يمكنه الوصول لأطفاله فقط
CREATE POLICY "Users can view own players" ON players
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own players" ON players
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own players" ON players
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own players" ON players
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- سياسات جدول نتائج الألعاب - مرتبطة باللاعبين
CREATE POLICY "Users can view own players scores" ON game_scores
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM players 
            WHERE players.id = game_scores.player_id 
            AND players.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own players scores" ON game_scores
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM players 
            WHERE players.id = game_scores.player_id 
            AND players.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can update own players scores" ON game_scores
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM players 
            WHERE players.id = game_scores.player_id 
            AND players.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can delete own players scores" ON game_scores
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM players 
            WHERE players.id = game_scores.player_id 
            AND players.user_id::text = auth.uid()::text
        )
    );

-- سياسات جدول إنجازات اللاعبين - مرتبطة باللاعبين
CREATE POLICY "Users can view own players achievements" ON player_achievements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM players 
            WHERE players.id = player_achievements.player_id 
            AND players.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own players achievements" ON player_achievements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM players 
            WHERE players.id = player_achievements.player_id 
            AND players.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can update own players achievements" ON player_achievements
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM players 
            WHERE players.id = player_achievements.player_id 
            AND players.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can delete own players achievements" ON player_achievements
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM players 
            WHERE players.id = player_achievements.player_id 
            AND players.user_id::text = auth.uid()::text
        )
    );

-- سياسات جدول إعدادات اللاعبين - مرتبطة باللاعبين
CREATE POLICY "Users can view own players settings" ON player_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM players 
            WHERE players.id = player_settings.player_id 
            AND players.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own players settings" ON player_settings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM players 
            WHERE players.id = player_settings.player_id 
            AND players.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can update own players settings" ON player_settings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM players 
            WHERE players.id = player_settings.player_id 
            AND players.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can delete own players settings" ON player_settings
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM players 
            WHERE players.id = player_settings.player_id 
            AND players.user_id::text = auth.uid()::text
        )
    );

-- سياسات جدول جلسات اللعب - مرتبطة باللاعبين
CREATE POLICY "Users can view own players sessions" ON play_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM players 
            WHERE players.id = play_sessions.player_id 
            AND players.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own players sessions" ON play_sessions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM players 
            WHERE players.id = play_sessions.player_id 
            AND players.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can update own players sessions" ON play_sessions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM players 
            WHERE players.id = play_sessions.player_id 
            AND players.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can delete own players sessions" ON play_sessions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM players 
            WHERE players.id = play_sessions.player_id 
            AND players.user_id::text = auth.uid()::text
        )
    );

-- الحفاظ على سياسة القراءة المفتوحة للإنجازات (لأنها بيانات عامة)
CREATE POLICY "Everyone can view achievements" ON achievements
    FOR SELECT USING (true);

-- إنشاء وظيفة للتحقق من ملكية اللاعب
CREATE OR REPLACE FUNCTION user_owns_player(player_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM players 
        WHERE players.id = player_id 
        AND players.user_id::text = auth.uid()::text
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- تحديث وظيفة إضافة العملات للتحقق من الملكية
CREATE OR REPLACE FUNCTION add_coins(player_id UUID, coins_to_add INTEGER)
RETURNS VOID AS $$
BEGIN
    -- التحقق من ملكية اللاعب
    IF NOT user_owns_player(player_id) THEN
        RAISE EXCEPTION 'غير مسموح: اللاعب لا ينتمي للمستخدم الحالي';
    END IF;
    
    UPDATE players 
    SET coins = coins + coins_to_add,
        updated_at = NOW()
    WHERE id = player_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- تحديث وظيفة إضافة الخبرة للتحقق من الملكية
CREATE OR REPLACE FUNCTION add_experience(player_id UUID, exp_to_add INTEGER)
RETURNS VOID AS $$
DECLARE
    current_exp INTEGER;
    current_level INTEGER;
    new_level INTEGER;
BEGIN
    -- التحقق من ملكية اللاعب
    IF NOT user_owns_player(player_id) THEN
        RAISE EXCEPTION 'غير مسموح: اللاعب لا ينتمي للمستخدم الحالي';
    END IF;
    
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- رسالة تأكيد
DO $$
BEGIN
    RAISE NOTICE 'تم تحديث سياسات الأمان بنجاح! 🔒';
    RAISE NOTICE 'الآن كل مستخدم يمكنه الوصول فقط لبيانات أطفاله.';
END $$;