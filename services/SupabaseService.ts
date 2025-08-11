/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// تثبيت ربط Supabase على المشروع الجديد بشكل صريح لمنع أي إعدادات قديمة من .env أو الكاش
const supabaseUrl = 'https://fdnupbrklxkdwsdibalj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkbnVwYnJrbHhrZHdzZGliYWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MzQ3OTksImV4cCI6MjA3MDQxMDc5OX0.RgVMQdcJwp-DY5e4h8IixXEdxAVq5NBIeUCTPgZCOQY';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// أنواع البيانات
export interface PlayerProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  level: number;
  experience: number;
  coins: number;
  achievements: string[];
  created_at: string;
  updated_at: string;
}

export interface GameScore {
  id: string;
  player_id: string;
  game_type: string;
  score: number;
  difficulty: string;
  duration: number;
  completed_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  reward_coins: number;
}

// خدمات اللاعبين
export class PlayerService {
  // إنشاء ملف شخصي جديد للاعب
  static async createPlayer(playerData: Omit<PlayerProfile, 'id' | 'created_at' | 'updated_at'>): Promise<PlayerProfile | null> {
    try {
      const { data, error } = await supabase
        .from('players')
        .insert([playerData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating player:', error);
      return null;
    }
  }

  // الحصول على ملف شخصي للاعب
  static async getPlayer(playerId: string): Promise<PlayerProfile | null> {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching player:', error);
      return null;
    }
  }

  // تحديث ملف شخصي للاعب
  static async updatePlayer(playerId: string, updates: Partial<PlayerProfile>): Promise<PlayerProfile | null> {
    try {
      const { data, error } = await supabase
        .from('players')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', playerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating player:', error);
      return null;
    }
  }

  // الحصول على جميع اللاعبين
  static async getAllPlayers(): Promise<PlayerProfile[]> {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching players:', error);
      return [];
    }
  }
}

// خدمات النتائج
export class ScoreService {
  // حفظ نتيجة لعبة
  static async saveScore(scoreData: Omit<GameScore, 'id'>): Promise<GameScore | null> {
    try {
      const { data, error } = await supabase
        .from('game_scores')
        .insert([scoreData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving score:', error);
      return null;
    }
  }

  // الحصول على أفضل النتائج للاعب
  static async getPlayerBestScores(playerId: string, gameType?: string): Promise<GameScore[]> {
    try {
      let query = supabase
        .from('game_scores')
        .select('*')
        .eq('player_id', playerId)
        .order('score', { ascending: false });

      if (gameType) {
        query = query.eq('game_type', gameType);
      }

      const { data, error } = await query.limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching player scores:', error);
      return [];
    }
  }

  // الحصول على لوحة المتصدرين
  static async getLeaderboard(gameType: string, limit: number = 10): Promise<GameScore[]> {
    try {
      const { data, error } = await supabase
        .from('game_scores')
        .select(`
          *,
          players:player_id (
            name,
            avatar
          )
        `)
        .eq('game_type', gameType)
        .order('score', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }
}

// خدمات الإنجازات
export class AchievementService {
  // الحصول على جميع الإنجازات
  static async getAllAchievements(): Promise<Achievement[]> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('reward_coins', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  }

  // فتح إنجاز للاعب
  static async unlockAchievement(playerId: string, achievementId: string, userId?: string): Promise<boolean> {
    try {
      // التحقق من ملكية اللاعب إذا تم تمرير userId
      if (userId) {
        const { data: player } = await supabase
          .from('players')
          .select('user_id')
          .eq('id', playerId)
          .single();
        
        if (!player || player.user_id !== userId) {
          console.error('❌ Security violation: Player does not belong to current user');
          return false;
        }
      }

      // التحقق من عدم وجود الإنجاز مسبقاً
      const { data: existing } = await supabase
        .from('player_achievements')
        .select('id')
        .eq('player_id', playerId)
        .eq('achievement_id', achievementId)
        .single();

      if (existing) {
        console.log(`ℹ️ Achievement already unlocked: ${achievementId} for player ${playerId}`);
        return false; // الإنجاز موجود مسبقاً
      }

      // إضافة الإنجاز
      const { error } = await supabase
        .from('player_achievements')
        .insert([{
          player_id: playerId,
          achievement_id: achievementId,
          unlocked_at: new Date().toISOString()
        }]);

      if (error) throw error;

      // تحديث عملات اللاعب
      const achievement = await supabase
        .from('achievements')
        .select('reward_coins')
        .eq('id', achievementId)
        .single();

      if (achievement.data) {
        await supabase.rpc('add_coins', {
          player_id: playerId,
          coins_to_add: achievement.data.reward_coins
        });
        console.log(`🏆 Achievement unlocked: ${achievementId} for player ${playerId} (+${achievement.data.reward_coins} coins)`);
      }

      return true;
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      return false;
    }
  }

  // الحصول على إنجازات اللاعب
  static async getPlayerAchievements(playerId: string): Promise<Achievement[]> {
    try {
      const { data, error } = await supabase
        .from('player_achievements')
        .select(`
          achievements (*)
        `)
        .eq('player_id', playerId);

      if (error) throw error;
      return data?.map(item => item.achievements as unknown as Achievement) || [];
    } catch (error) {
      console.error('Error fetching player achievements:', error);
      return [];
    }
  }
}

// خدمات عامة
export class DatabaseService {
  // التحقق من حالة الاتصال
  static async checkConnection(): Promise<boolean> {
    try {
      const { error } = await supabase.from('players').select('id').limit(1);
      return !error;
    } catch (error) {
      console.error('Database connection error:', error);
      return false;
    }
  }

  // إنشاء الجداول الأساسية (للاستخدام في التطوير)
  static async initializeTables(): Promise<void> {
    try {
      // هذه الوظيفة تتطلب صلاحيات إدارية
      // يجب تنفيذ SQL commands في Supabase Dashboard
      console.log('Please run the SQL commands in Supabase Dashboard to create tables');
    } catch (error) {
      console.error('Error initializing tables:', error);
    }
  }
}

export default supabase;