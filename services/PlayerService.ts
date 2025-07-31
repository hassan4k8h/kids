import { Player } from '../types/Player';
import { PlayerService as SupabasePlayerService, PlayerProfile, ScoreService, supabase } from './SupabaseService';

class PlayerService {
  private static readonly STORAGE_KEY = 'kids_game_players';
  private static useSupabase = true; // تبديل بين Supabase والتخزين المحلي

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
          const players = (profiles || []).map(this.profileToPlayer);
          console.log(`✅ Loaded ${players.length} players for user ${userId}`);
          return players;
        } else {
          console.warn('⚠️ getPlayers called without userId - this may be a security issue');
          return [];
        }
      } catch (error) {
        console.error('Error loading players from Supabase:', error);
        // العودة للتخزين المحلي في حالة الخطأ مع تمرير userId
        return this.getPlayersLocal(userId);
      }
    } else {
      return this.getPlayersLocal(userId);
    }
  }

  private static getPlayersLocal(userId?: string): Player[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const allPlayers = stored ? JSON.parse(stored) : [];
      
      // إذا تم تمرير userId، فلتر اللاعبين حسب المستخدم
      if (userId) {
        return allPlayers.filter((player: Player) => player.userId === userId);
      }
      
      return allPlayers;
    } catch (error) {
      console.error('Error loading players:', error);
      return [];
    }
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
      } catch (error) {
        console.error('Error saving player to Supabase:', error);
        // العودة للتخزين المحلي في حالة الخطأ
        this.savePlayerLocal(player);
      }
    } else {
      this.savePlayerLocal(player);
    }
  }

  private static savePlayerLocal(player: Player): void {
    try {
      const players = this.getPlayersLocal();
      const existingIndex = players.findIndex(p => p.id === player.id);
      
      if (existingIndex >= 0) {
        players[existingIndex] = player;
      } else {
        players.push(player);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(players));
    } catch (error) {
      console.error('Error saving player:', error);
    }
  }

  static async deletePlayer(playerId: string): Promise<void> {
    if (this.useSupabase) {
      try {
        // في Supabase، الحذف يتم عبر CASCADE
        // نحتاج لتنفيذ حذف مخصص أو استخدام RPC
        console.log('Delete player from Supabase:', playerId);
        // TODO: تنفيذ حذف اللاعب من Supabase
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
        return this.getPlayersLocal().find(p => p.id === playerId);
      }
    }
    return this.getPlayersLocal().find(p => p.id === playerId);
  }

  static async updatePlayerProgress(playerId: string, gameType: string, score: number, userId?: string): Promise<void> {
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
              level: 1,
              score: 0,
              completedLevels: 0
            };
          }
          player.gameProgress[gameType].score = Math.max(player.gameProgress[gameType].score, score);
          
          await this.savePlayer(player);
        }
      } catch (error) {
        console.error('Error updating player progress in Supabase:', error);
        // العودة للطريقة المحلية
        this.updatePlayerProgressLocal(playerId, gameType, score);
      }
    } else {
      this.updatePlayerProgressLocal(playerId, gameType, score);
    }
  }

  private static updatePlayerProgressLocal(playerId: string, gameType: string, score: number): void {
    try {
      const players = this.getPlayersLocal();
      const player = players.find(p => p.id === playerId);
      if (!player) return;

      // تحديث النتيجة الإجمالية وعدد الألعاب المكتملة
      player.totalScore += score;
      player.gamesCompleted += 1;
      
      // تحديث تقدم اللعبة
      if (!player.gameProgress[gameType]) {
        player.gameProgress[gameType] = {
          level: 1,
          score: 0,
          completedLevels: 0
        };
      }
      
      player.gameProgress[gameType].score = Math.max(player.gameProgress[gameType].score, score);
      player.gameProgress[gameType].completedLevels += 1;

      this.savePlayerLocal(player);
    } catch (error) {
      console.error('Error updating player progress:', error);
    }
  }

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
      
      const player = await this.getPlayer(playerId);
      if (player && player.userId === userId) {
        console.log(`🎮 Current player loaded: ${player.name}`);
        return player;
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