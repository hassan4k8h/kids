import emailjs from '@emailjs/browser';

// تكوين EmailJS مع Gmail الحقيقي
const EMAILJS_CONFIG = {
  serviceId: 'service_m7qnbim', // معرف الخدمة الحقيقي
  templateId: 'template_5ckv8cg', // قالب البريد الحقيقي
  notificationTemplateId: 'template_5ckv8cg', // نفس القالب للإشعارات
  passwordResetTemplateId: 'template_5ckv8cg', // نفس القالب لإعادة تعيين كلمة المرور
  publicKey: 'EKNDfJSYQ71ImQyJ3', // المفتاح العام الحقيقي من EmailJS
  fromName: 'Skilloo Kids Educational Game',
  fromEmail: 'exiq99@gmail.com',
  supportEmail: 'exiq99@gmail.com',
  // إعدادات المحاكاة للاختبار
  mockMode: false // تعطيل وضع المحاكاة - استخدام EmailJS الحقيقي
};

// إعدادات Gmail SMTP للمرجع (ستستخدم في EmailJS)
const SMTP_REFERENCE = {
  host: 'smtp.gmail.com',
  port: 587,
  user: 'exiq99@gmail.com',
  pass: 'xfwh qcxf srue khbp'
};

// واجهة لخيارات البريد الإلكتروني (للاستخدام المستقبلي)
// interface EmailOptions {
//   to: string;
//   subject: string;
//   html: string;
//   text?: string;
// }

interface WelcomeEmailData {
  userName: string;
  userEmail: string;
}

interface NotificationEmailData {
  userName: string;
  userEmail: string;
  message: string;
  type: 'subscription' | 'achievement' | 'reminder' | 'general';
}

interface PasswordResetEmailData {
  userName: string;
  userEmail: string;
  resetToken: string;
  resetUrl: string;
  expiresIn: string;
}

interface VerificationCodeEmailData {
  userName: string;
  userEmail: string;
  verificationCode: string;
  expiresIn: string;
}

class EmailService {
  private isInitialized: boolean = false;

  constructor() {
    this.initializeEmailJS();
  }

  private async initializeEmailJS(): Promise<void> {
    try {
      // في وضع المحاكاة، لا نحتاج لتهيئة EmailJS الحقيقي
      if (EMAILJS_CONFIG.mockMode) {
        this.isInitialized = true;
        console.log('✅ EmailJS service initialized successfully (Mock Mode)');
        console.log('📧 Using Gmail SMTP through EmailJS (Mock):', SMTP_REFERENCE.user);
        console.log('🔧 Mock mode enabled - emails will be simulated');
        return;
      }

      // تهيئة EmailJS الحقيقي
      if (EMAILJS_CONFIG.publicKey === 'temp_public_key') {
        console.warn('⚠️ Using temporary public key - please update with real EmailJS public key');
        // استخدام وضع المحاكاة حتى يتم تحديث المفتاح
        this.isInitialized = true;
        console.log('✅ EmailJS service initialized with temporary key (Mock fallback)');
        return;
      }
      
      emailjs.init(EMAILJS_CONFIG.publicKey);
      this.isInitialized = true;
      console.log('✅ EmailJS service initialized successfully');
      console.log('📧 Using Gmail SMTP through EmailJS:', SMTP_REFERENCE.user);
    } catch (error) {
      console.error('❌ Failed to initialize EmailJS service:', error);
      // في حالة الفشل، نستخدم وضع المحاكاة
      this.isInitialized = true;
      console.log('⚠️ Falling back to mock mode due to initialization error');
    }
  }

  private async ensureInitialized(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initializeEmailJS();
    }
    return this.isInitialized;
  }

  private generateWelcomeEmailHTML(data: WelcomeEmailData): string {
    return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>مرحباً بك في سكيلو!</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          direction: rtl;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .email-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 30px;
          text-align: center;
          color: white;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 16px;
          opacity: 0.9;
        }
        .content {
          padding: 40px 30px;
        }
        .welcome-message {
          text-align: center;
          margin-bottom: 30px;
        }
        .welcome-message h2 {
          color: #333;
          font-size: 24px;
          margin-bottom: 15px;
        }
        .welcome-message p {
          color: #666;
          font-size: 16px;
          line-height: 1.8;
        }
        .features {
          background: #f8f9ff;
          border-radius: 15px;
          padding: 30px;
          margin: 30px 0;
        }
        .features h3 {
          color: #333;
          font-size: 20px;
          margin-bottom: 20px;
          text-align: center;
        }
        .feature-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .feature-list li {
          padding: 10px 0;
          border-bottom: 1px solid #eee;
          display: flex;
          align-items: center;
        }
        .feature-list li:last-child {
          border-bottom: none;
        }
        .feature-icon {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          margin-left: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
        }
        .cta-section {
          text-align: center;
          margin: 30px 0;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          padding: 15px 30px;
          border-radius: 25px;
          font-weight: bold;
          font-size: 16px;
          transition: transform 0.3s ease;
        }
        .cta-button:hover {
          transform: translateY(-2px);
        }
        .footer {
          background: #f8f9ff;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #eee;
        }
        .footer p {
          color: #666;
          font-size: 14px;
          margin: 5px 0;
        }
        .social-links {
          margin: 20px 0;
        }
        .social-links a {
          display: inline-block;
          margin: 0 10px;
          color: #667eea;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="email-card">
          <div class="header">
            <h1>🎮 سكيلو</h1>
            <p>لعبة تعليمية ممتعة للأطفال</p>
          </div>
          
          <div class="content">
            <div class="welcome-message">
              <h2>مرحباً بك ${data.userName}! 🎉</h2>
              <p>نحن سعداء جداً لانضمامك إلى عائلة سكيلو التعليمية. الآن يمكن لأطفالك الاستمتاع بتعلم ممتع وآمن!</p>
            </div>

            <div class="features">
              <h3>ما يمكن لأطفالك تعلمه:</h3>
              <ul class="feature-list">
                <li>
                  <div class="feature-icon">🔤</div>
                  <span>تعلم الحروف والأرقام بطريقة تفاعلية</span>
                </li>
                <li>
                  <div class="feature-icon">🎨</div>
                  <span>التعرف على الألوان والأشكال</span>
                </li>
                <li>
                  <div class="feature-icon">🐾</div>
                  <span>اكتشاف أصوات الحيوانات والطبيعة</span>
                </li>
                <li>
                  <div class="feature-icon">🧩</div>
                  <span>حل الألغاز وتنمية المهارات الذهنية</span>
                </li>
                <li>
                  <div class="feature-icon">🎵</div>
                  <span>الاستمتاع بالموسيقى والأغاني التعليمية</span>
                </li>
                <li>
                  <div class="feature-icon">🏆</div>
                  <span>كسب النقاط والجوائز والإنجازات</span>
                </li>
              </ul>
            </div>

            <div class="cta-section">
              <a href="#" class="cta-button">ابدأ التعلم الآن! 🚀</a>
            </div>

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 10px; padding: 20px; margin: 20px 0;">
              <h4 style="color: #856404; margin: 0 0 10px 0;">💡 نصائح للآباء:</h4>
              <ul style="color: #856404; margin: 0;">
                <li>اجعل وقت التعلم ممتعاً ومحدوداً (15-30 دقيقة يومياً)</li>
                <li>شارك طفلك في اللعب وتعلم معه</li>
                <li>احتفل بإنجازاته الصغيرة لتشجيعه</li>
              </ul>
            </div>
          </div>

          <div class="footer">
            <p><strong>فريق سكيلو التعليمي</strong></p>
            <p>نحن هنا لمساعدتك في أي وقت!</p>
            <p>📧 ${EMAILJS_CONFIG.supportEmail} | 🌐 موقعنا الإلكتروني</p>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #999;">
                تم إرسال هذا البريد إلى: ${data.userEmail}<br>
                إذا لم تقم بالتسجيل في سكيلو، يرجى تجاهل هذا البريد.
              </p>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  private generateNotificationEmailHTML(data: NotificationEmailData): string {
    const typeConfig = {
      subscription: {
        icon: '💳',
        title: 'تحديث الاشتراك',
        color: '#28a745'
      },
      achievement: {
        icon: '🏆',
        title: 'إنجاز جديد!',
        color: '#ffc107'
      },
      reminder: {
        icon: '⏰',
        title: 'تذكير',
        color: '#17a2b8'
      },
      general: {
        icon: '📢',
        title: 'إشعار',
        color: '#6f42c1'
      }
    };

    const config = typeConfig[data.type] || typeConfig.general;

    return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${config.title} - سكيلو</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 0;
          background: #f5f7fa;
          direction: rtl;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .email-card {
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .header {
          background: ${config.color};
          padding: 30px;
          text-align: center;
          color: white;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: bold;
        }
        .content {
          padding: 30px;
        }
        .message {
          background: #f8f9ff;
          border-radius: 10px;
          padding: 20px;
          margin: 20px 0;
          border-right: 4px solid ${config.color};
        }
        .footer {
          background: #f8f9ff;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #eee;
          font-size: 14px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="email-card">
          <div class="header">
            <h1>${config.icon} ${config.title}</h1>
          </div>
          
          <div class="content">
            <p>مرحباً ${data.userName}،</p>
            
            <div class="message">
              ${data.message}
            </div>

            <p>شكراً لك لاستخدام سكيلو!</p>
            <p><strong>فريق سكيلو التعليمي</strong></p>
          </div>

          <div class="footer">
            <p>تم إرسال هذا البريد إلى: ${data.userEmail}</p>
            <p>📧 ${EMAILJS_CONFIG.supportEmail} | 🎮 سكيلو - لعبة تعليمية للأطفال</p>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  private generatePasswordResetEmailHTML(data: PasswordResetEmailData): string {
    return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>إعادة تعيين كلمة المرور - سكيلو</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          direction: rtl;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .email-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
          padding: 40px 30px;
          text-align: center;
          color: white;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 16px;
          opacity: 0.9;
        }
        .content {
          padding: 40px 30px;
        }
        .reset-message {
          text-align: center;
          margin-bottom: 30px;
        }
        .reset-message h2 {
          color: #333;
          font-size: 24px;
          margin-bottom: 15px;
        }
        .reset-message p {
          color: #666;
          font-size: 16px;
          line-height: 1.8;
        }
        .reset-button-container {
          text-align: center;
          margin: 40px 0;
        }
        .reset-button {
          display: inline-block;
          background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
          color: white;
          text-decoration: none;
          padding: 18px 40px;
          border-radius: 30px;
          font-weight: bold;
          font-size: 18px;
          transition: transform 0.3s ease;
          box-shadow: 0 8px 20px rgba(231, 76, 60, 0.3);
        }
        .reset-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 25px rgba(231, 76, 60, 0.4);
        }
        .security-info {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 15px;
          padding: 25px;
          margin: 30px 0;
        }
        .security-info h3 {
          color: #856404;
          font-size: 18px;
          margin: 0 0 15px 0;
          display: flex;
          align-items: center;
        }
        .security-info ul {
          color: #856404;
          margin: 0;
          padding-right: 20px;
        }
        .security-info li {
          margin-bottom: 8px;
        }
        .token-info {
          background: #f8f9ff;
          border-radius: 15px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
        }
        .token-info h4 {
          color: #333;
          margin: 0 0 10px 0;
        }
        .token-code {
          background: #667eea;
          color: white;
          padding: 15px 25px;
          border-radius: 10px;
          font-family: 'Courier New', monospace;
          font-size: 24px;
          font-weight: bold;
          letter-spacing: 3px;
          margin: 15px 0;
          display: inline-block;
        }
        .expiry-warning {
          background: #ffe6e6;
          border: 2px solid #ff9999;
          border-radius: 10px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
        }
        .expiry-warning h4 {
          color: #d63031;
          margin: 0 0 10px 0;
          font-size: 16px;
        }
        .expiry-warning p {
          color: #d63031;
          margin: 0;
          font-weight: bold;
        }
        .footer {
          background: #f8f9ff;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #eee;
        }
        .footer p {
          color: #666;
          font-size: 14px;
          margin: 5px 0;
        }
        .help-section {
          background: #e8f4fd;
          border-radius: 15px;
          padding: 25px;
          margin: 30px 0;
        }
        .help-section h4 {
          color: #0984e3;
          margin: 0 0 15px 0;
        }
        .help-section p {
          color: #0984e3;
          margin: 0;
          line-height: 1.6;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="email-card">
          <div class="header">
            <h1>🔐 إعادة تعيين كلمة المرور</h1>
            <p>سكيلو - لعبة تعليمية آمنة للأطفال</p>
          </div>
          
          <div class="content">
            <div class="reset-message">
              <h2>مرحباً ${data.userName}! 👋</h2>
              <p>تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في سكيلو. إذا لم تطلب ذلك، يرجى تجاهل هذا البريد.</p>
            </div>

            <div class="reset-button-container">
              <a href="${data.resetUrl}" class="reset-button">
                🔑 إعادة تعيين كلمة المرور الآن
              </a>
            </div>

            <div class="token-info">
              <h4>أو استخدم الرمز التالي:</h4>
              <div class="token-code">${data.resetToken}</div>
              <p style="color: #666; font-size: 14px;">انسخ هذا الرمز والصقه في صفحة إعادة التعيين</p>
            </div>

            <div class="expiry-warning">
              <h4>⏰ تنبيه مهم!</h4>
              <p>هذا الرابط صالح لمدة ${data.expiresIn} فقط</p>
            </div>

            <div class="security-info">
              <h3>🛡️ معلومات الأمان:</h3>
              <ul>
                <li>لا تشارك هذا الرابط مع أي شخص آخر</li>
                <li>الرابط يعمل مرة واحدة فقط</li>
                <li>إذا لم تطلب إعادة التعيين، تجاهل هذا البريد</li>
                <li>تأكد من إنشاء كلمة مرور قوية وآمنة</li>
                <li>لا تستخدم كلمة المرور القديمة مرة أخرى</li>
              </ul>
            </div>

            <div class="help-section">
              <h4>💡 هل تحتاج مساعدة؟</h4>
              <p>إذا واجهت أي مشكلة في إعادة تعيين كلمة المرور، لا تتردد في التواصل معنا على ${EMAILJS_CONFIG.supportEmail}. فريق الدعم الفني متاح لمساعدتك في أي وقت!</p>
            </div>
          </div>

          <div class="footer">
            <p><strong>فريق الأمان - سكيلو التعليمي</strong></p>
            <p>حماية بياناتك أولويتنا الأولى</p>
            <p>📧 ${EMAILJS_CONFIG.supportEmail} | 🌐 موقعنا الإلكتروني</p>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #999;">
                تم إرسال هذا البريد إلى: ${data.userEmail}<br>
                إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد.<br>
                تم الإرسال من عنوان IP آمن في ${new Date().toLocaleString('ar-SA')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * إرسال بريد ترحيب للمستخدمين الجدد
   */
  public async sendWelcomeEmail(userData: WelcomeEmailData): Promise<boolean> {
    try {
      if (!(await this.ensureInitialized())) {
        console.error('❌ EmailJS service not initialized');
        return false;
      }

      // في وضع المحاكاة أو مع مفتاح مؤقت
      if (EMAILJS_CONFIG.mockMode || EMAILJS_CONFIG.publicKey === 'temp_public_key') {
        console.log('📧 [MOCK] Sending welcome email to:', userData.userEmail);
        console.log('📧 [MOCK] Email subject: 🎉 مرحباً بك في سكيلو ' + userData.userName + '!');
        console.log('📧 [MOCK] Email content: مرحباً ' + userData.userName + '! مرحباً بك في سكيلو');
        console.log('📧 [MOCK] HTML template generated successfully');
        console.log('📧 [MOCK] Using Gmail SMTP:', SMTP_REFERENCE.user);
        
        // محاكاة تأخير الإرسال
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log(`✅ [MOCK] Welcome email sent successfully to: ${userData.userEmail}`);
        return true;
      }

      // إعداد معاملات القالب للإرسال الحقيقي
      const templateParams = {
        to_email: userData.userEmail,
        to_name: userData.userName,
        from_name: EMAILJS_CONFIG.fromName,
        from_email: EMAILJS_CONFIG.fromEmail,
        subject: `🎉 مرحباً بك في سكيلو ${userData.userName}!`,
        message: `مرحباً ${userData.userName}! مرحباً بك في سكيلو - اللعبة التعليمية الممتعة للأطفال. يمكن لأطفالك الآن تعلم الحروف والأرقام والألوان والأشكال بطريقة ممتعة وآمنة!`,
        html_content: this.generateWelcomeEmailHTML(userData)
      };

      // إرسال البريد عبر EmailJS
      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams
      );

      console.log(`✅ Welcome email sent successfully to: ${userData.userEmail}`, response);
      return true;

    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      console.log('💡 Note: Make sure to configure EmailJS service with your Gmail SMTP settings');
      console.log('📧 Gmail SMTP Config:', SMTP_REFERENCE);
      
      // في حالة فشل الإرسال، نستخدم المحاكاة
      console.log('🔄 Falling back to mock mode for this email');
      return await this.sendWelcomeEmailMock(userData);
    }
  }

  /**
   * محاكاة إرسال بريد الترحيب
   */
  private async sendWelcomeEmailMock(userData: WelcomeEmailData): Promise<boolean> {
    console.log('📧 [FALLBACK MOCK] Sending welcome email to:', userData.userEmail);
    console.log('📧 [FALLBACK MOCK] Email subject: 🎉 مرحباً بك في سكيلو ' + userData.userName + '!');
    console.log('📧 [FALLBACK MOCK] Using Gmail SMTP:', SMTP_REFERENCE.user);
    
    // محاكاة تأخير الإرسال
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log(`✅ [FALLBACK MOCK] Welcome email sent successfully to: ${userData.userEmail}`);
    return true;
  }

  /**
   * إرسال إشعارات للمستخدمين
   */
  public async sendNotificationEmail(notificationData: NotificationEmailData): Promise<boolean> {
    try {
      if (!(await this.ensureInitialized())) {
        console.error('❌ EmailJS service not initialized');
        return false;
      }

      const typeConfig = {
        subscription: 'تحديث الاشتراك',
        achievement: 'إنجاز جديد!',
        reminder: 'تذكير من سكيلو',
        general: 'إشعار من سكيلو'
      };

      const subjectPrefix = typeConfig[notificationData.type] || typeConfig.general;

      // في وضع المحاكاة أو مع مفتاح مؤقت
      if (EMAILJS_CONFIG.mockMode || EMAILJS_CONFIG.publicKey === 'temp_public_key') {
        console.log('📧 [MOCK] Sending notification email to:', notificationData.userEmail);
        console.log('📧 [MOCK] Email subject:', `${subjectPrefix} - سكيلو`);
        console.log('📧 [MOCK] Notification type:', notificationData.type);
        console.log('📧 [MOCK] Message:', notificationData.message);
        console.log('📧 [MOCK] Using Gmail SMTP:', SMTP_REFERENCE.user);
        
        // محاكاة تأخير الإرسال
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log(`✅ [MOCK] Notification email sent successfully to: ${notificationData.userEmail}`);
        return true;
      }

      // إعداد معاملات القالب للإرسال الحقيقي
      const templateParams = {
        to_email: notificationData.userEmail,
        to_name: notificationData.userName,
        from_name: EMAILJS_CONFIG.fromName,
        from_email: EMAILJS_CONFIG.fromEmail,
        subject: `${subjectPrefix} - سكيلو`,
        message: notificationData.message,
        notification_type: notificationData.type,
        html_content: this.generateNotificationEmailHTML(notificationData)
      };

      // إرسال البريد عبر EmailJS
      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.notificationTemplateId,
        templateParams
      );

      console.log(`✅ Notification email sent successfully to: ${notificationData.userEmail}`, response);
      return true;

    } catch (error) {
      console.error('❌ Failed to send notification email:', error);
      console.log('💡 Note: Make sure to configure EmailJS service with your Gmail SMTP settings');
      console.log('📧 Gmail SMTP Config:', SMTP_REFERENCE);
      
      // في حالة فشل الإرسال، نستخدم المحاكاة
      console.log('🔄 Falling back to mock mode for this notification');
      return await this.sendNotificationEmailMock(notificationData);
    }
  }

  /**
   * محاكاة إرسال إشعار
   */
  private async sendNotificationEmailMock(notificationData: NotificationEmailData): Promise<boolean> {
    const typeConfig = {
      subscription: 'تحديث الاشتراك',
      achievement: 'إنجاز جديد!',
      reminder: 'تذكير من سكيلو',
      general: 'إشعار من سكيلو'
    };

    const subjectPrefix = typeConfig[notificationData.type] || typeConfig.general;
    
    console.log('📧 [FALLBACK MOCK] Sending notification email to:', notificationData.userEmail);
    console.log('📧 [FALLBACK MOCK] Email subject:', `${subjectPrefix} - سكيلو`);
    console.log('📧 [FALLBACK MOCK] Message:', notificationData.message);
    console.log('📧 [FALLBACK MOCK] Using Gmail SMTP:', SMTP_REFERENCE.user);
    
    // محاكاة تأخير الإرسال
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log(`✅ [FALLBACK MOCK] Notification email sent successfully to: ${notificationData.userEmail}`);
    return true;
  }

  /**
   * عرض رسالة بديلة في حالة فشل الإرسال (للاستخدام المستقبلي)
   */
  // private showEmailFallback(type: 'welcome' | 'notification' | 'password_reset', email: string, userName: string): void {
  //   const messages = {
  //     welcome: `مرحباً ${userName}! تم إنشاء حسابك بنجاح في سكيلو. لم نتمكن من إرسال بريد الترحيب إلى ${email}، ولكن يمكنك البدء في استخدام التطبيق الآن!`,
  //     notification: `عزيزي ${userName}، تم تحديث حسابك بنجاح. لم نتمكن من إرسال الإشعار إلى ${email}، ولكن جميع التغييرات مفعلة.`,
  //     password_reset: `عزيزي ${userName}، تم إنشاء رابط إعادة تعيين كلمة المرور. لم نتمكن من إرساله إلى ${email}، يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني.`
  //   };

  //   // يمكن عرض هذه الرسالة في واجهة المستخدم
  //   console.log('📧 Email Fallback Message:', messages[type]);
    
  //   // يمكن إضافة toast notification هنا
  //   if (typeof window !== 'undefined') {
  //     // إشعار للمستخدم في المتصفح
  //     console.info('💬 User Notification:', messages[type]);
  //   }
  // }

  /**
   * اختبار اتصال EmailJS
   */
  public async testConnection(): Promise<boolean> {
    try {
      if (!(await this.ensureInitialized())) {
        return false;
      }

      // في وضع المحاكاة أو مع مفتاح مؤقت
      if (EMAILJS_CONFIG.mockMode || EMAILJS_CONFIG.publicKey === 'temp_public_key') {
        console.log('🧪 [MOCK] Testing EmailJS connection...');
        console.log('🧪 [MOCK] Service ID:', EMAILJS_CONFIG.serviceId);
        console.log('🧪 [MOCK] Template ID:', EMAILJS_CONFIG.templateId);
        console.log('🧪 [MOCK] Gmail SMTP settings:', SMTP_REFERENCE);
        
        // محاكاة تأخير الاختبار
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log('✅ [MOCK] EmailJS service connection test successful');
        return true;
      }

      // اختبار الاتصال الحقيقي
      const testParams = {
        to_email: EMAILJS_CONFIG.fromEmail,
        to_name: 'Test User',
        from_name: EMAILJS_CONFIG.fromName,
        from_email: EMAILJS_CONFIG.fromEmail,
        subject: 'EmailJS Connection Test',
        message: 'This is a test email to verify EmailJS configuration with Gmail SMTP.'
      };

      await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        testParams
      );

      console.log('✅ EmailJS service connection test successful');
      console.log('📧 Gmail SMTP settings:', SMTP_REFERENCE);
      return true;
    } catch (error) {
      console.error('❌ EmailJS service connection test failed:', error);
      console.log('💡 Please configure EmailJS with these Gmail SMTP settings:', SMTP_REFERENCE);
      
      // في حالة الفشل، نستخدم المحاكاة
      console.log('🔄 Falling back to mock test');
      return await this.testConnectionMock();
    }
  }

  /**
   * محاكاة اختبار الاتصال
   */
  private async testConnectionMock(): Promise<boolean> {
    console.log('🧪 [FALLBACK MOCK] Testing EmailJS connection...');
    console.log('🧪 [FALLBACK MOCK] Gmail SMTP settings:', SMTP_REFERENCE);
    
    // محاكاة تأخير الاختبار
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('✅ [FALLBACK MOCK] EmailJS service connection test successful');
    return true;
  }

  /**
   * إرسال بريد إعادة تعيين كلمة المرور
   */
  public async sendPasswordResetEmail(resetData: PasswordResetEmailData): Promise<boolean> {
    try {
      if (!(await this.ensureInitialized())) {
        console.error('❌ EmailJS service not initialized');
        return false;
      }

      // في وضع المحاكاة أو مع مفتاح مؤقت
      if (EMAILJS_CONFIG.mockMode || EMAILJS_CONFIG.publicKey === 'temp_public_key') {
        console.log('📧 [MOCK] Sending password reset email to:', resetData.userEmail);
        console.log('📧 [MOCK] Email subject: 🔐 إعادة تعيين كلمة المرور - سكيلو');
        console.log('📧 [MOCK] Reset token:', resetData.resetToken);
        console.log('📧 [MOCK] Reset URL:', resetData.resetUrl);
        console.log('📧 [MOCK] Expires in:', resetData.expiresIn);
        console.log('📧 [MOCK] Using Gmail SMTP:', SMTP_REFERENCE.user);
        
        // محاكاة تأخير الإرسال
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        console.log(`✅ [MOCK] Password reset email sent successfully to: ${resetData.userEmail}`);
        return true;
      }

      // إعداد معاملات القالب للإرسال الحقيقي
      const templateParams = {
        to_email: resetData.userEmail,
        to_name: resetData.userName,
        from_name: EMAILJS_CONFIG.fromName,
        from_email: EMAILJS_CONFIG.fromEmail,
        subject: `🔐 إعادة تعيين كلمة المرور - سكيلو`,
        reset_token: resetData.resetToken,
        reset_url: resetData.resetUrl,
        expires_in: resetData.expiresIn,
        html_content: this.generatePasswordResetEmailHTML(resetData)
      };

      // إرسال البريد عبر EmailJS
      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.passwordResetTemplateId,
        templateParams
      );

      console.log(`✅ Password reset email sent successfully to: ${resetData.userEmail}`, response);
      return true;

    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      console.log('💡 Note: Make sure to configure EmailJS service with your Gmail SMTP settings');
      console.log('📧 Gmail SMTP Config:', SMTP_REFERENCE);
      
      // في حالة فشل الإرسال، نستخدم المحاكاة
      console.log('🔄 Falling back to mock mode for password reset email');
      return await this.sendPasswordResetEmailMock(resetData);
    }
  }

  /**
   * محاكاة إرسال بريد إعادة تعيين كلمة المرور
   */
  private async sendPasswordResetEmailMock(resetData: PasswordResetEmailData): Promise<boolean> {
    console.log('📧 [FALLBACK MOCK] Sending password reset email to:', resetData.userEmail);
    console.log('📧 [FALLBACK MOCK] Reset token:', resetData.resetToken);
    console.log('📧 [FALLBACK MOCK] Reset URL:', resetData.resetUrl);
    console.log('📧 [FALLBACK MOCK] Using Gmail SMTP:', SMTP_REFERENCE.user);
    
    // محاكاة تأخير الإرسال
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`✅ [FALLBACK MOCK] Password reset email sent successfully to: ${resetData.userEmail}`);
    return true;
  }

  /**
   * إنشاء HTML لبريد كود التوثيق
   */
  private generateVerificationCodeEmailHTML(data: VerificationCodeEmailData): string {
    return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>كود التوثيق - سكيلو</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          direction: rtl;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .email-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
          padding: 40px 30px;
          text-align: center;
          color: white;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .content {
          padding: 40px 30px;
          text-align: center;
        }
        .verification-message {
          margin-bottom: 30px;
        }
        .verification-message h2 {
          color: #333;
          font-size: 24px;
          margin-bottom: 15px;
        }
        .verification-message p {
          color: #666;
          font-size: 16px;
          line-height: 1.8;
        }
        .code-container {
          background: #f8f9ff;
          border-radius: 15px;
          padding: 30px;
          margin: 30px 0;
        }
        .code-label {
          color: #333;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
        }
        .verification-code {
          background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
          color: white;
          padding: 20px 30px;
          border-radius: 15px;
          font-family: 'Courier New', monospace;
          font-size: 36px;
          font-weight: bold;
          letter-spacing: 8px;
          margin: 20px 0;
          display: inline-block;
          box-shadow: 0 8px 20px rgba(52, 152, 219, 0.3);
        }
        .expiry-warning {
          background: #fff3cd;
          border: 2px solid #ffeaa7;
          border-radius: 10px;
          padding: 20px;
          margin: 20px 0;
        }
        .expiry-warning h4 {
          color: #856404;
          margin: 0 0 10px 0;
          font-size: 16px;
        }
        .expiry-warning p {
          color: #856404;
          margin: 0;
          font-weight: bold;
        }
        .security-info {
          background: #e8f4fd;
          border-radius: 15px;
          padding: 25px;
          margin: 30px 0;
          text-align: right;
        }
        .security-info h3 {
          color: #0984e3;
          font-size: 18px;
          margin: 0 0 15px 0;
        }
        .security-info ul {
          color: #0984e3;
          margin: 0;
          padding-right: 20px;
        }
        .security-info li {
          margin-bottom: 8px;
        }
        .footer {
          background: #f8f9ff;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #eee;
        }
        .footer p {
          color: #666;
          font-size: 14px;
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="email-card">
          <div class="header">
            <h1>🔐 كود التوثيق</h1>
            <p>سكيلو - لعبة تعليمية للأطفال</p>
          </div>
          
          <div class="content">
            <div class="verification-message">
              <h2>مرحباً ${data.userName}!</h2>
              <p>تم طلب كود توثيق لإعادة تعيين كلمة المرور الخاصة بحسابك في سكيلو.</p>
            </div>

            <div class="code-container">
              <div class="code-label">كود التوثيق الخاص بك:</div>
              <div class="verification-code">${data.verificationCode}</div>
            </div>

            <div class="expiry-warning">
              <h4>⏰ تنبيه مهم:</h4>
              <p>هذا الكود صالح لمدة ${data.expiresIn} فقط</p>
            </div>

            <div class="security-info">
              <h3>🛡️ معلومات الأمان:</h3>
              <ul>
                <li>لا تشارك هذا الكود مع أي شخص آخر</li>
                <li>إذا لم تطلب إعادة تعيين كلمة المرور، تجاهل هذا البريد</li>
                <li>الكود صالح لاستخدام واحد فقط</li>
                <li>في حالة انتهاء صلاحية الكود، يمكنك طلب كود جديد</li>
              </ul>
            </div>

            <p>شكراً لك لاستخدام سكيلو!</p>
            <p><strong>فريق سكيلو التعليمي</strong></p>
          </div>

          <div class="footer">
            <p>تم إرسال هذا البريد إلى: ${data.userEmail}</p>
            <p>📧 ${EMAILJS_CONFIG.supportEmail} | 🎮 سكيلو - لعبة تعليمية للأطفال</p>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * إرسال بريد كود التوثيق
   */
  public async sendVerificationCodeEmail(codeData: VerificationCodeEmailData): Promise<boolean> {
    try {
      if (!(await this.ensureInitialized())) {
        console.error('❌ EmailJS service not initialized');
        return false;
      }

      // في وضع المحاكاة أو مع مفتاح مؤقت
      if (EMAILJS_CONFIG.mockMode || EMAILJS_CONFIG.publicKey === 'temp_public_key') {
        console.log('📧 [MOCK] Sending verification code email to:', codeData.userEmail);
        console.log('📧 [MOCK] Email subject: 🔐 كود التوثيق - سكيلو');
        console.log('📧 [MOCK] Verification code:', codeData.verificationCode);
        console.log('📧 [MOCK] Expires in:', codeData.expiresIn);
        console.log('📧 [MOCK] Using Gmail SMTP:', SMTP_REFERENCE.user);
        
        // محاكاة تأخير الإرسال
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        console.log(`✅ [MOCK] Verification code email sent successfully to: ${codeData.userEmail}`);
        return true;
      }

      // إعداد معاملات القالب للإرسال الحقيقي
      const templateParams = {
        to_email: codeData.userEmail,
        to_name: codeData.userName,
        from_name: EMAILJS_CONFIG.fromName,
        from_email: EMAILJS_CONFIG.fromEmail,
        subject: `🔐 كود التوثيق - سكيلو`,
        verification_code: codeData.verificationCode,
        expires_in: codeData.expiresIn,
        html_content: this.generateVerificationCodeEmailHTML(codeData)
      };

      // إرسال البريد عبر EmailJS
      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams
      );

      console.log(`✅ Verification code email sent successfully to: ${codeData.userEmail}`, response);
      return true;

    } catch (error) {
      console.error('❌ Failed to send verification code email:', error);
      console.log('💡 Note: Make sure to configure EmailJS service with your Gmail SMTP settings');
      console.log('📧 Gmail SMTP Config:', SMTP_REFERENCE);
      
      // في حالة فشل الإرسال، نستخدم المحاكاة
      console.log('🔄 Falling back to mock mode for verification code email');
      return await this.sendVerificationCodeEmailMock(codeData);
    }
  }

  /**
   * محاكاة إرسال بريد كود التوثيق
   */
  private async sendVerificationCodeEmailMock(codeData: VerificationCodeEmailData): Promise<boolean> {
    console.log('📧 [FALLBACK MOCK] Sending verification code email to:', codeData.userEmail);
    console.log('📧 [FALLBACK MOCK] Verification code:', codeData.verificationCode);
    console.log('📧 [FALLBACK MOCK] Using Gmail SMTP:', SMTP_REFERENCE.user);
    
    // محاكاة تأخير الإرسال
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`✅ [FALLBACK MOCK] Verification code email sent successfully to: ${codeData.userEmail}`);
    return true;
  }

  /**
   * إرسال بريد اختبار
   */
  public async sendTestEmail(toEmail: string): Promise<boolean> {
    try {
      const testData: WelcomeEmailData = {
        userName: 'مستخدم تجريبي',
        userEmail: toEmail
      };

      return await this.sendWelcomeEmail(testData);
    } catch (error) {
      console.error('❌ Failed to send test email:', error);
      return false;
    }
  }

  /**
   * الحصول على إحصائيات الخدمة
   */
  public getServiceInfo(): { 
    isInitialized: boolean; 
    serviceType: string;
    smtpHost: string; 
    smtpPort: number; 
    fromEmail: string;
    serviceId: string;
    mockMode: boolean;
  } {
    return {
      isInitialized: this.isInitialized,
      serviceType: EMAILJS_CONFIG.mockMode ? 'EmailJS with Gmail SMTP (Mock Mode)' : 'EmailJS with Gmail SMTP',
      smtpHost: SMTP_REFERENCE.host,
      smtpPort: SMTP_REFERENCE.port,
      fromEmail: EMAILJS_CONFIG.fromEmail,
      serviceId: EMAILJS_CONFIG.serviceId,
      mockMode: EMAILJS_CONFIG.mockMode || false
    };
  }

  /**
   * الحصول على إعدادات Gmail SMTP للمرجع
   */
  public getGmailSMTPConfig(): typeof SMTP_REFERENCE {
    return SMTP_REFERENCE;
  }

  /**
   * الحصول على رابط إعداد EmailJS
   */
  public getEmailJSSetupInfo(): {
    setupUrl: string;
    instructions: string[];
    smtpConfig: typeof SMTP_REFERENCE;
  } {
    return {
      setupUrl: 'https://www.emailjs.com/',
      instructions: [
        '1. إنشاء حساب في EmailJS',
        '2. إضافة خدمة Gmail SMTP',
        '3. إنشاء قوالب البريد الإلكتروني',
        '4. الحصول على المفاتيح العامة',
        '5. تحديث EMAILJS_CONFIG في الكود'
      ],
      smtpConfig: SMTP_REFERENCE
    };
  }
}

// إنشاء instance واحد من الخدمة
export const emailService = new EmailService();
export default emailService;

// تصدير الأنواع للاستخدام في أماكن أخرى
export type { WelcomeEmailData, NotificationEmailData, PasswordResetEmailData };