import { Player } from '../types/Player';
import { PlayerService as SupabasePlayerService, PlayerProfile, ScoreService, supabase } from './SupabaseService';

class PlayerService {
  private static readonly STORAGE_KEY = 'kids_game_players';
  private static useSupabase = true; // تبديل بين Supabase والتخزين المحلي
  private static readonly CURRENT_PLAYER_OBJ_PREFIX = 'current_player_obj_';
  private static readonly PROGRESS_KEY_PREFIX = 'progress_';

  // تحويل PlayerProfile إلى Player
  private static profileToPlayer(profile: PlayerProfile & { user_id?: string }): Player {
    return {
      id: profile.id,
      userId: profile.user_id || '',
      name: profile.name,
      avatar: profile.avatar,
      createdAt: profile.created_at,
      lastPlayed: profile.updated_at,
      totalScore: profile.experience || 0,
      gamesCompleted: 0, // يمكن حسابها من game_scores
      storiesCompleted: 0,
      achievements: profile.achievements,
      gameProgress: (profile as any).game_progress || {},
      storyProgress: (profile as any).story_progress || {},
      preferences: (profile as any).preferences || {
        language: 'ar',
        soundEnabled: true,
        musicEnabled: true,
        difficulty: 'easy'
      }
    };
  }

  // تحويل Player إلى PlayerProfile مع البيانات الإضافية
  private static playerToProfile(player: Player): any {
    const maxLevel = Math.max(1, ...Object.values(player.gameProgress).map(p => p.level));
    return {
      user_id: player.userId,
      name: player.name,
      age: 5, // افتراضي - يمكن إضافة age للـ Player interface لاحقاً
      avatar: player.avatar,
      level: maxLevel,
      experience: player.totalScore,
      coins: Math.floor(player.totalScore / 10),
      achievements: player.achievements,
      game_progress: player.gameProgress,
      story_progress: player.storyProgress,
      preferences: player.preferences,
      last_played: player.lastPlayed
    };
  }

  static async getPlayers(userId?: string): Promise<Player[]> {
    if (this.useSupabase) {
      try {
        // يجب دائماً تمرير userId للتأكد من الأمان
        if (userId) {
          // الحصول على لاعبي مستخدم معين
          const { data: profiles, error } = await supabase
            .from('players')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (error) throw error;
          // إزالة أي تكرار غير مقصود
          const uniqueProfiles = new Map<string, any>();
          (profiles || []).forEach((p: any) => uniqueProfiles.set(p.id, p));
          const players = Array.from(uniqueProfiles.values()).map(this.profileToPlayer);
          console.log(`✅ Loaded ${players.length} players for user ${userId}`);
          return players;
        } else {
          console.warn('⚠️ getPlayers called without userId - this may be a security issue');
          return [];
        }
      } catch (error) {
        console.error('Error loading players from Supabase:', error);
        return [];
      }
    } else {
      return this.getPlayersLocal(userId);
    }
  }

  private static getPlayersLocal(userId?: string): Player[] {
    // التخزين المحلي معطل نهائيًا لضمان الاعتماد الكامل على Supabase
    return [];
  }

  static async savePlayer(player: Player): Promise<void> {
    if (this.useSupabase) {
      try {
        const profileData = this.playerToProfile(player);
        
        if (player.id && !player.id.startsWith('temp')) {
          // تحديث لاعب موجود
          const { error } = await supabase
            .from('players')
            .update(profileData)
            .eq('id', player.id);
            
          if (error) throw error;
          console.log('✅ Player updated in Supabase:', player.name);
        } else {
          // إنشاء لاعب جديد
          const { data: newProfile, error } = await supabase
            .from('players')
            .insert([profileData])
            .select()
            .single();
            
          if (error) throw error;
          if (newProfile) {
            player.id = newProfile.id;
            console.log('✅ New player created in Supabase:', player.name);
          }
        }
        // تحديث الكاش المحلي للّاعب الحالي
        if (player.userId) {
          this.setCurrentPlayerObject(player.userId, player);
        }
      } catch (error) {
        console.error('Error saving player to Supabase:', error);
      }
    } else {
      // التخزين المحلي معطل
    }
  }

  private static savePlayerLocal(player: Player): void {}

  static async deletePlayer(playerId: string): Promise<void> {
    if (this.useSupabase) {
      try {
        console.log('Delete player from Supabase:', playerId);
        const { error } = await supabase
          .from('players')
          .delete()
          .eq('id', playerId);
        if (error) throw error;
        // إزالة من التخزين المحلي إن وجد
        try {
          const all = this.getPlayersLocal();
          const filtered = all.filter(p => p.id !== playerId);
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
        } catch {}
      } catch (error) {
        console.error('Error deleting player from Supabase:', error);
      }
    } else {
      this.deletePlayerLocal(playerId);
    }
  }

  private static deletePlayerLocal(playerId: string): void {
    try {
      const players = this.getPlayersLocal().filter(p => p.id !== playerId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(players));
    } catch (error) {
      console.error('Error deleting player:', error);
    }
  }

  static async getPlayer(playerId: string): Promise<Player | undefined> {
    if (this.useSupabase) {
      try {
        const profile = await SupabasePlayerService.getPlayer(playerId);
        return profile ? this.profileToPlayer(profile) : undefined;
      } catch (error) {
        console.error('Error getting player from Supabase:', error);
        return undefined;
      }
    }
    return undefined;
  }

  static async updatePlayerProgress(playerId: string, gameType: string, score: number, userId?: string, level?: number): Promise<void> {
    if (this.useSupabase) {
      try {
        // التحقق من ملكية اللاعب إذا تم تمرير userId
        if (userId) {
          const player = await this.getPlayer(playerId);
          if (!player || player.userId !== userId) {
            console.error('❌ Security violation: Player does not belong to current user');
            throw new Error('غير مسموح: اللاعب لا ينتمي للمستخدم الحالي');
          }
        }

        // حفظ النتيجة
        await ScoreService.saveScore({
          player_id: playerId,
          game_type: gameType,
          score: score,
          difficulty: 'normal',
          duration: 60, // افتراضي
          completed_at: new Date().toISOString()
        });

        // تحديث خبرة اللاعب
        // استخدام RPC functions لتحديث الخبرة والعملات
        // هذا يتطلب تنفيذ الوظائف في قاعدة البيانات
        
        const player = await this.getPlayer(playerId);
        if (player) {
          player.totalScore += score;
          player.gamesCompleted += 1;
          
          // تحديث تقدم اللعبة
          if (!player.gameProgress[gameType]) {
            player.gameProgress[gameType] = {
              level: level || 1,
              score: 0,
              completedLevels: level || 0
            } as any;
          }
          player.gameProgress[gameType].score = Math.max(player.gameProgress[gameType].score, score);
          if (level) {
            player.gameProgress[gameType].level = Math.max(player.gameProgress[gameType].level, level);
            player.gameProgress[gameType].completedLevels = Math.max(
              player.gameProgress[gameType].completedLevels || 0,
              level
            );
          }
          
          await this.savePlayer(player);
          if (player.userId) {
            this.setCurrentPlayerObject(player.userId, player);
          }
        }
      } catch (error) {
        console.error('Error updating player progress in Supabase:', error);
      }
    } else {
      // التخزين المحلي معطل
    }
  }

  // حفظ تقدم المستوى فورياً بدون إنشاء سجل score جديد
  static async persistGameLevel(playerId: string, gameType: string, level: number, userId?: string): Promise<void> {
    try {
      // حفظ محلياً دائماً
      this.setLocalProgress(userId || 'anon', playerId, gameType, { level });

      if (!this.useSupabase) return;

      // التحقق من ملكية اللاعب إذا تم تمرير userId
      if (userId) {
        const player = await this.getPlayer(playerId);
        if (!player || player.userId !== userId) {
          console.error('❌ Security violation: Player does not belong to current user');
          return;
        }
      }

      const player = await this.getPlayer(playerId);
      if (!player) return;

      if (!player.gameProgress[gameType]) {
        player.gameProgress[gameType] = { level: 1, score: 0, completedLevels: 0 } as any;
      }
      player.gameProgress[gameType].level = Math.max(player.gameProgress[gameType].level || 1, level);
      player.gameProgress[gameType].completedLevels = Math.max(player.gameProgress[gameType].completedLevels || 0, level);

      await this.savePlayer(player);
      if (player.userId) {
        this.setCurrentPlayerObject(player.userId, player);
      }
    } catch (error) {
      console.error('Error persisting game level:', error);
    }
  }

  // قراءة/كتابة تقدم محلي خفيف
  static setLocalProgress(userId: string, playerId: string, gameType: string, data: { level?: number; score?: number }): void {
    try {
      const key = `${this.PROGRESS_KEY_PREFIX}${userId}_${playerId}_${gameType}`;
      const existing = localStorage.getItem(key);
      const current = existing ? JSON.parse(existing) : {};
      const merged = { ...current, ...data };
      localStorage.setItem(key, JSON.stringify(merged));
    } catch (error) {
      console.error('Error saving local progress:', error);
    }
  }

  static getLocalProgress(userId: string, playerId: string, gameType: string): { level?: number; score?: number } | null {
    try {
      const key = `${this.PROGRESS_KEY_PREFIX}${userId}_${playerId}_${gameType}`;
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error('Error reading local progress:', error);
      return null;
    }
  }

  private static updatePlayerProgressLocal(playerId: string, gameType: string, score: number): void {}

  // تبديل بين Supabase والتخزين المحلي
  static setUseSupabase(use: boolean): void {
    this.useSupabase = use;
  }

  // التحقق من حالة الاتصال بـ Supabase
  static async checkSupabaseConnection(): Promise<boolean> {
    try {
      const { DatabaseService } = await import('./SupabaseService');
      return await DatabaseService.checkConnection();
    } catch (error) {
      console.error('Supabase connection check failed:', error);
      return false;
    }
  }

  // إنشاء لاعب جديد
  static async createPlayer(userId: string, name: string, avatar: string, language: string): Promise<Player> {
    const newPlayer: Player = {
      id: 'temp_' + Date.now(),
      userId,
      name,
      avatar,
      createdAt: new Date().toISOString(),
      lastPlayed: new Date().toISOString(),
      totalScore: 0,
      gamesCompleted: 0,
      storiesCompleted: 0,
      achievements: [],
      gameProgress: {},
      storyProgress: {},
      preferences: {
        language: language as 'ar' | 'en',
        soundEnabled: true,
        musicEnabled: true,
        difficulty: 'easy'
      }
    };

    await this.savePlayer(newPlayer);
    return newPlayer;
  }

  // تحديث لاعب
  static async updatePlayer(player: Player): Promise<void> {
    await this.savePlayer(player);
  }

  // تحديث إحصائيات القراءة
  static async updateStoryStats(userId: string, playerId: string, stats: { totalRead: number; readingTime: number }): Promise<void> {
    const player = await this.getPlayer(playerId);
    if (player) {
      // التحقق من ملكية اللاعب
      if (player.userId !== userId) {
        console.error('❌ Security violation: Player does not belong to current user');
        throw new Error('غير مسموح: اللاعب لا ينتمي للمستخدم الحالي');
      }
      
      // تحديث إحصائيات القراءة
      player.storiesCompleted += stats.totalRead;
      
      // تحديث تقدم القصص
      if (!player.storyProgress['general']) {
        player.storyProgress['general'] = {
          completed: false,
          score: 0,
          choices: []
        };
      }
      
      player.storyProgress['general'].score += stats.readingTime;
      
      // إضافة نقاط للقراءة
      const pointsEarned = stats.totalRead * 10;
      player.totalScore += pointsEarned;
      
      await this.savePlayer(player);
      console.log(`✅ Story stats updated for player: ${player.name} (User: ${userId})`);
    }
  }

  // حفظ معرف اللاعب الحالي للمستخدم
  static setCurrentPlayer(userId: string, playerId: string): void {
    try {
      localStorage.setItem(`current_player_${userId}`, playerId);
      console.log(`💾 Current player saved: ${playerId} for user ${userId}`);
    } catch (error) {
      console.error('Error saving current player:', error);
    }
  }

  // حفظ كائن اللاعب الحالي في الكاش المحلي
  static setCurrentPlayerObject(userId: string, player: Player): void {
    try {
      localStorage.setItem(`${this.CURRENT_PLAYER_OBJ_PREFIX}${userId}`, JSON.stringify(player));
    } catch (error) {
      console.error('Error caching current player object:', error);
    }
  }

  // إرجاع كائن اللاعب الحالي من الكاش المحلي
  private static getCachedCurrentPlayer(userId: string): Player | null {
    try {
      const raw = localStorage.getItem(`${this.CURRENT_PLAYER_OBJ_PREFIX}${userId}`);
      return raw ? (JSON.parse(raw) as Player) : null;
    } catch (error) {
      console.error('Error reading cached current player:', error);
      return null;
    }
  }

  // استرداد معرف اللاعب الحالي للمستخدم
  static getCurrentPlayerId(userId: string): string | null {
    try {
      const playerId = localStorage.getItem(`current_player_${userId}`);
      console.log(`🔍 Current player retrieved: ${playerId} for user ${userId}`);
      return playerId;
    } catch (error) {
      console.error('Error getting current player:', error);
      return null;
    }
  }

  // استرداد اللاعب الحالي للمستخدم
  static async getCurrentPlayer(userId: string): Promise<Player | null> {
    try {
      const playerId = this.getCurrentPlayerId(userId);
      if (!playerId) return null;
      
      let player = await this.getPlayer(playerId);
      if (player && player.userId === userId) {
        console.log(`🎮 Current player loaded: ${player.name}`);
        return player;
      }
      
      // استخدام الكاش المحلي عند الفشل أو في حال عدم التطابق
      const cached = this.getCachedCurrentPlayer(userId);
      if (cached && cached.id === playerId) {
        console.log(`🎮 Using cached current player: ${cached.name}`);
        return cached;
      }

      // إذا لم يعد اللاعب موجود أو لا ينتمي للمستخدم، امحُ الحفظ
      this.clearCurrentPlayer(userId);
      return null;
    } catch (error) {
      console.error('Error getting current player:', error);
      return null;
    }
  }

  // مسح اللاعب الحالي المحفوظ
  static clearCurrentPlayer(userId: string): void {
    try {
      localStorage.removeItem(`current_player_${userId}`);
      console.log(`🧹 Current player cleared for user ${userId}`);
    } catch (error) {
      console.error('Error clearing current player:', error);
    }
  }
}

export default PlayerService;