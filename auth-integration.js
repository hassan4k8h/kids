// ملف ربط صفحات إعادة تعيين كلمة المرور مع AuthService

// محاكاة AuthService للاستخدام في صفحات HTML المنفصلة
class AuthServiceIntegration {
  constructor() {
    this.users = JSON.parse(localStorage.getItem('skilloo_users') || '[]');
    this.resetTokens = JSON.parse(localStorage.getItem('skilloo_reset_tokens') || '[]');
    this.cleanupExpiredTokens();
  }

  // Generate a secure reset token
  generateResetToken() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) + 
           Date.now().toString(36);
  }

  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  validatePassword(password) {
    if (password.length < 8) {
      return { valid: false, message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' };
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return { valid: false, message: 'كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل' };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return { valid: false, message: 'كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل' };
    }
    if (!/(?=.*\d)/.test(password)) {
      return { valid: false, message: 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل' };
    }
    return { valid: true, message: 'كلمة المرور قوية' };
  }

  // Send password reset email
  async sendPasswordResetEmail(email) {
    try {
      if (!this.isValidEmail(email)) {
        throw new Error('البريد الإلكتروني غير صحيح');
      }

      // Find user by email
      const user = this.users.find(u => u.email === email);
      if (!user) {
        throw new Error('البريد الإلكتروني غير مسجل في النظام');
      }

      // Generate reset token
      const resetToken = this.generateResetToken();
      
      // Store token with expiry (24 hours)
      const resetData = {
        email,
        token: resetToken,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        used: false,
        createdAt: Date.now()
      };
      
      // Remove any existing tokens for this email
      this.resetTokens = this.resetTokens.filter(token => token.email !== email);
      this.resetTokens.push(resetData);
      localStorage.setItem('skilloo_reset_tokens', JSON.stringify(this.resetTokens));
      
      // Simulate email sending (in real app, this would call EmailService)
      console.log(`🔐 Password reset email sent to: ${email}`);
      console.log(`Reset token: ${resetToken}`);
      console.log(`Reset URL: ${window.location.origin}/reset-password.html?token=${resetToken}&email=${encodeURIComponent(email)}`);
      
      return {
        success: true,
        message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني',
        token: resetToken // إضافة التوكن للاستجابة لاستخدامه في وضع التطوير
      };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Verify reset token
  verifyResetToken(token, email) {
    const resetData = this.resetTokens.find(t => 
      t.token === token && 
      t.email === email && 
      !t.used && 
      t.expiresAt > Date.now()
    );
    
    if (!resetData) {
      return {
        valid: false,
        message: 'الرمز غير صحيح أو منتهي الصلاحية'
      };
    }
    
    return {
      valid: true,
      message: 'الرمز صحيح',
      expiresAt: resetData.expiresAt
    };
  }

  // Reset password
  async resetPassword(token, email, newPassword) {
    try {
      // Validate password strength
      const passwordValidation = this.validatePassword(newPassword);
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.message);
      }

      // Verify token first
      const tokenVerification = this.verifyResetToken(token, email);
      if (!tokenVerification.valid) {
        throw new Error(tokenVerification.message);
      }

      // Find and update user
      const userIndex = this.users.findIndex(u => u.email === email);
      if (userIndex === -1) {
        throw new Error('المستخدم غير موجود');
      }

      // Update password
      this.users[userIndex].password = newPassword;
      this.users[userIndex].lastPasswordChange = Date.now();
      localStorage.setItem('skilloo_users', JSON.stringify(this.users));

      // Mark token as used
      const tokenIndex = this.resetTokens.findIndex(t => t.token === token && t.email === email);
      if (tokenIndex !== -1) {
        this.resetTokens[tokenIndex].used = true;
        this.resetTokens[tokenIndex].usedAt = Date.now();
        localStorage.setItem('skilloo_reset_tokens', JSON.stringify(this.resetTokens));
      }

      console.log(`✅ Password reset successful for: ${email}`);
      
      return {
        success: true,
        message: 'تم تغيير كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.'
      };
    } catch (error) {
      console.error('Error resetting password:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Clean up expired tokens
  cleanupExpiredTokens() {
    const now = Date.now();
    const initialCount = this.resetTokens.length;
    this.resetTokens = this.resetTokens.filter(token => token.expiresAt > now);
    const cleanedCount = initialCount - this.resetTokens.length;
    
    if (cleanedCount > 0) {
      localStorage.setItem('skilloo_reset_tokens', JSON.stringify(this.resetTokens));
      console.log(`🧹 Cleaned up ${cleanedCount} expired reset tokens`);
    }
  }

  // Get user by email
  getUserByEmail(email) {
    return this.users.find(u => u.email === email);
  }

  // Register new user
  async registerUser(userData) {
    try {
      if (!this.isValidEmail(userData.email)) {
        throw new Error('البريد الإلكتروني غير صحيح');
      }

      if (this.getUserByEmail(userData.email)) {
        throw new Error('البريد الإلكتروني مسجل مسبقاً');
      }

      const passwordValidation = this.validatePassword(userData.password);
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.message);
      }

      const newUser = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        password: userData.password,
        createdAt: Date.now(),
        isActive: true
      };

      this.users.push(newUser);
      localStorage.setItem('skilloo_users', JSON.stringify(this.users));

      console.log(`✅ User registered successfully: ${userData.email}`);
      
      return {
        success: true,
        message: 'تم تسجيل الحساب بنجاح!',
        user: { id: newUser.id, name: newUser.name, email: newUser.email }
      };
    } catch (error) {
      console.error('Error registering user:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // تمييز الرمز كمستخدم
  markTokenAsUsed(token) {
    try {
      const resetTokens = JSON.parse(localStorage.getItem('skilloo_reset_tokens') || '{}');
      if (resetTokens[token]) {
        resetTokens[token].used = true;
        localStorage.setItem('skilloo_reset_tokens', JSON.stringify(resetTokens));
      }
    } catch (error) {
      console.error('❌ Error marking token as used:', error);
    }
  }

  // التحقق من صحة البريد الإلكتروني
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// إنشاء مثيل من الخدمة
const authServiceIntegration = new AuthServiceIntegration();

// تصدير للاستخدام العام
if (typeof window !== 'undefined') {
  window.AuthServiceIntegration = authServiceIntegration;
}

// تصدير للاستخدام في Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthServiceIntegration;
}