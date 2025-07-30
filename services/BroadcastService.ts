// Broadcast Service - Using Resend API
// Manage email broadcasts to audiences

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;
const RESEND_BROADCASTS_URL = 'https://api.resend.com/broadcasts';

export interface BroadcastOptions {
  audienceId: string;
  from: string;
  subject: string;
  html: string;
  scheduledAt?: string; // Optional: 'in 1 min', '2024-08-05T11:52:01.858Z', etc.
}

export interface BroadcastUpdateOptions {
  id: string;
  html?: string;
  subject?: string;
  from?: string;
  scheduledAt?: string;
}

export interface BroadcastSendOptions {
  scheduledAt?: string; // 'in 1 min', 'in 1 hour', etc.
}

export interface BroadcastResponse {
  id: string;
  object: string;
  from: string;
  subject: string;
  html: string;
  audienceId: string;
  status: string;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
}

export class BroadcastService {
  private static defaultFrom = import.meta.env.VITE_FROM_EMAIL || 'Kids Educational Game <noreply@kidsgame.com>';

  /**
   * Create a new broadcast
   */
  static async createBroadcast(options: BroadcastOptions): Promise<BroadcastResponse | null> {
    try {
      const response = await fetch(RESEND_BROADCASTS_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audienceId: options.audienceId,
          from: options.from || this.defaultFrom,
          subject: options.subject,
          html: options.html,
          ...(options.scheduledAt && { scheduledAt: options.scheduledAt })
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Broadcast created successfully:', data.id);
        return data;
      } else {
        const errorData = await response.text();
        throw new Error(`Failed to create broadcast: ${errorData}`);
      }
    } catch (error) {
      console.error('Failed to create broadcast:', error);
      return null;
    }
  }

  /**
   * Retrieve a broadcast by ID
   */
  static async getBroadcast(broadcastId: string): Promise<BroadcastResponse | null> {
    try {
      const response = await fetch(`${RESEND_BROADCASTS_URL}/${broadcastId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Broadcast retrieved successfully:', data.id);
        return data;
      } else {
        const errorData = await response.text();
        throw new Error(`Failed to retrieve broadcast: ${errorData}`);
      }
    } catch (error) {
      console.error('Failed to retrieve broadcast:', error);
      return null;
    }
  }

  /**
   * Update an existing broadcast
   */
  static async updateBroadcast(options: BroadcastUpdateOptions): Promise<BroadcastResponse | null> {
    try {
      const updateData: any = { id: options.id };
      
      if (options.html) updateData.html = options.html;
      if (options.subject) updateData.subject = options.subject;
      if (options.from) updateData.from = options.from;
      if (options.scheduledAt) updateData.scheduledAt = options.scheduledAt;

      const response = await fetch(RESEND_BROADCASTS_URL, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Broadcast updated successfully:', data.id);
        return data;
      } else {
        const errorData = await response.text();
        throw new Error(`Failed to update broadcast: ${errorData}`);
      }
    } catch (error) {
      console.error('Failed to update broadcast:', error);
      return null;
    }
  }

  /**
   * Send a broadcast immediately or schedule it
   */
  static async sendBroadcast(broadcastId: string, options?: BroadcastSendOptions): Promise<boolean> {
    try {
      const sendData: any = {};
      if (options?.scheduledAt) {
        sendData.scheduledAt = options.scheduledAt;
      }

      const response = await fetch(`${RESEND_BROADCASTS_URL}/${broadcastId}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sendData),
      });

      if (response.ok) {
        console.log('Broadcast sent successfully:', broadcastId);
        return true;
      } else {
        const errorData = await response.text();
        throw new Error(`Failed to send broadcast: ${errorData}`);
      }
    } catch (error) {
      console.error('Failed to send broadcast:', error);
      return false;
    }
  }

  /**
   * Delete a broadcast
   */
  static async deleteBroadcast(broadcastId: string): Promise<boolean> {
    try {
      const response = await fetch(`${RESEND_BROADCASTS_URL}/${broadcastId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('Broadcast deleted successfully:', broadcastId);
        return true;
      } else {
        const errorData = await response.text();
        throw new Error(`Failed to delete broadcast: ${errorData}`);
      }
    } catch (error) {
      console.error('Failed to delete broadcast:', error);
      return false;
    }
  }

  /**
   * List all broadcasts
   */
  static async listBroadcasts(): Promise<BroadcastResponse[] | null> {
    try {
      const response = await fetch(RESEND_BROADCASTS_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Broadcasts listed successfully:', data.data?.length || 0, 'broadcasts');
        return data.data || [];
      } else {
        const errorData = await response.text();
        throw new Error(`Failed to list broadcasts: ${errorData}`);
      }
    } catch (error) {
      console.error('Failed to list broadcasts:', error);
      return null;
    }
  }

  /**
   * Create and send a welcome broadcast to new users
   */
  static async sendWelcomeBroadcast(audienceId: string): Promise<boolean> {
    try {
      const broadcast = await this.createBroadcast({
        audienceId,
        from: this.defaultFrom,
        subject: 'مرحباً بكم في لعبة الأطفال التعليمية! 🎮✨',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0f8ff;">
            <div style="background-color: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
              <h1 style="color: #4CAF50; text-align: center; margin-bottom: 30px; font-size: 28px;">🎮 مرحباً بكم في عالم التعلم الممتع!</h1>
              
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="font-size: 60px; margin-bottom: 15px;">🌟</div>
                <p style="font-size: 18px; color: #333; line-height: 1.6;">أهلاً وسهلاً بكم في لعبة الأطفال التعليمية!</p>
              </div>
              
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 12px; margin: 25px 0; color: white; text-align: center;">
                <h3 style="margin-top: 0; font-size: 22px;">🎯 ما ينتظركم في رحلة التعلم:</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 20px;">
                  <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px;">
                    <div style="font-size: 30px; margin-bottom: 8px;">🔤</div>
                    <p style="margin: 0; font-size: 14px;">تعلم الحروف والكلمات</p>
                  </div>
                  <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px;">
                    <div style="font-size: 30px; margin-bottom: 8px;">🔢</div>
                    <p style="margin: 0; font-size: 14px;">الرياضيات الممتعة</p>
                  </div>
                  <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px;">
                    <div style="font-size: 30px; margin-bottom: 8px;">🎨</div>
                    <p style="margin: 0; font-size: 14px;">الألوان والأشكال</p>
                  </div>
                  <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px;">
                    <div style="font-size: 30px; margin-bottom: 8px;">🐾</div>
                    <p style="margin: 0; font-size: 14px;">عالم الحيوانات</p>
                  </div>
                </div>
              </div>
              
              <div style="background-color: #e8f5e8; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #4CAF50;">
                <h3 style="color: #2e7d32; margin-top: 0; display: flex; align-items: center;">
                  <span style="margin-right: 10px;">🎁</span>
                  مميزات خاصة لأطفالكم:
                </h3>
                <ul style="color: #333; line-height: 1.8; margin: 15px 0;">
                  <li>🏆 نظام مكافآت وإنجازات محفز</li>
                  <li>📊 تتبع تقدم الطفل بشكل مفصل</li>
                  <li>🎵 أصوات وموسيقى تفاعلية</li>
                  <li>🌙 وضع آمن ومناسب للأطفال</li>
                  <li>📱 يعمل على جميع الأجهزة</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://your-app-domain.com" style="display: inline-block; background: linear-gradient(45deg, #4CAF50, #45a049); color: white; padding: 15px 35px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3); transition: all 0.3s ease;">🚀 ابدأ رحلة التعلم الآن</a>
              </div>
              
              <div style="background-color: #fff3e0; padding: 20px; border-radius: 10px; margin: 25px 0; text-align: center;">
                <p style="color: #f57c00; margin: 0; font-size: 16px; font-weight: bold;">💡 نصيحة: ابدأوا بالألعاب البسيطة وتدرجوا للمستويات الأصعب</p>
              </div>
              
              <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #f0f0f0;">
                <p style="color: #666; font-size: 14px; margin: 5px 0;">نتمنى لكم ولأطفالكم رحلة تعلم ممتعة ومفيدة! 🌟</p>
                <p style="color: #888; font-size: 12px; margin: 5px 0;">فريق لعبة الأطفال التعليمية</p>
                <div style="margin-top: 15px;">
                  <span style="font-size: 20px;">🎮📚✨</span>
                </div>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
              <p>يمكنكم إلغاء الاشتراك في أي وقت من خلال {{{RESEND_UNSUBSCRIBE_URL}}}</p>
            </div>
          </div>
        `
      });

      if (broadcast) {
        return await this.sendBroadcast(broadcast.id);
      }
      return false;
    } catch (error) {
      console.error('Failed to send welcome broadcast:', error);
      return false;
    }
  }

  /**
   * Create and send a weekly digest broadcast
   */
  static async sendWeeklyDigest(audienceId: string, scheduledAt?: string): Promise<boolean> {
    try {
      const broadcast = await this.createBroadcast({
        audienceId,
        from: this.defaultFrom,
        subject: 'ملخص الأسبوع: إنجازات رائعة في التعلم! 📊🌟',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
            <div style="background-color: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
              <h1 style="color: #2196F3; text-align: center; margin-bottom: 30px;">📊 ملخص الأسبوع التعليمي</h1>
              
              <div style="background: linear-gradient(135deg, #2196F3 0%, #21CBF3 100%); padding: 25px; border-radius: 12px; color: white; text-align: center; margin-bottom: 25px;">
                <h2 style="margin: 0; font-size: 24px;">🎉 أسبوع مليء بالإنجازات!</h2>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">شاهدوا ما حققه أطفالكم هذا الأسبوع</p>
              </div>
              
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 25px 0;">
                <div style="background-color: #e8f5e8; padding: 20px; border-radius: 10px; text-align: center;">
                  <div style="font-size: 40px; margin-bottom: 10px;">🏆</div>
                  <h3 style="color: #4CAF50; margin: 0 0 10px 0;">الإنجازات</h3>
                  <p style="color: #333; margin: 0;">تم فتح 5 شارات جديدة!</p>
                </div>
                
                <div style="background-color: #e3f2fd; padding: 20px; border-radius: 10px; text-align: center;">
                  <div style="font-size: 40px; margin-bottom: 10px;">⏱️</div>
                  <h3 style="color: #2196F3; margin: 0 0 10px 0;">وقت اللعب</h3>
                  <p style="color: #333; margin: 0;">45 دقيقة من التعلم الممتع</p>
                </div>
                
                <div style="background-color: #fff3e0; padding: 20px; border-radius: 10px; text-align: center;">
                  <div style="font-size: 40px; margin-bottom: 10px;">🎯</div>
                  <h3 style="color: #FF9800; margin: 0 0 10px 0;">الدقة</h3>
                  <p style="color: #333; margin: 0;">نسبة نجاح 85%</p>
                </div>
              </div>
              
              <div style="background-color: #f3e5f5; padding: 20px; border-radius: 10px; margin: 25px 0;">
                <h3 style="color: #9C27B0; margin-top: 0;">🌟 أبرز الألعاب هذا الأسبوع:</h3>
                <ul style="color: #333; line-height: 1.8;">
                  <li>🔤 لعبة الحروف - مستوى متقدم</li>
                  <li>🔢 الرياضيات الممتعة - الجمع والطرح</li>
                  <li>🎨 تعلم الألوان - الألوان المختلطة</li>
                  <li>🐾 أصوات الحيوانات - حيوانات المزرعة</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://your-app-domain.com" style="display: inline-block; background: linear-gradient(45deg, #2196F3, #1976D2); color: white; padding: 15px 35px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px;">📱 تابع التقدم الآن</a>
              </div>
              
              <div style="background-color: #e8f5e8; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #4CAF50;">
                <h3 style="color: #2e7d32; margin-top: 0;">💡 نصائح للأسبوع القادم:</h3>
                <p style="color: #333; line-height: 1.6; margin: 0;">جربوا تخصيص 15 دقيقة يومياً للألعاب التعليمية. الانتظام أهم من المدة!</p>
              </div>
              
              <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #f0f0f0;">
                <p style="color: #666; font-size: 14px;">استمروا في الرحلة التعليمية الرائعة! 🚀</p>
                <p style="color: #888; font-size: 12px;">فريق لعبة الأطفال التعليمية</p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
              <p>يمكنكم إلغاء الاشتراك في أي وقت من خلال {{{RESEND_UNSUBSCRIBE_URL}}}</p>
            </div>
          </div>
        `
      });

      if (broadcast) {
        if (scheduledAt) {
          return await this.sendBroadcast(broadcast.id, { scheduledAt });
        } else {
          return await this.sendBroadcast(broadcast.id);
        }
      }
      return false;
    } catch (error) {
      console.error('Failed to send weekly digest:', error);
      return false;
    }
  }
}

export default BroadcastService;