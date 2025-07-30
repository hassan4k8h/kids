class AudioService {
  private audioContext: AudioContext | null = null;
  private audioCache: Map<string, AudioBuffer> = new Map();
  private soundEnabled: boolean = true;
  private volume: number = 0.7;
  private currentBackgroundMusic: HTMLAudioElement | null = null;

  constructor() {
    this.initializeAudio();
    this.loadSounds();
  }

  private async initializeAudio(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context on user interaction
      document.addEventListener('click', () => {
        if (this.audioContext?.state === 'suspended') {
          this.audioContext.resume();
        }
      }, { once: true });

    } catch (error) {
      console.warn('Audio context not supported:', error);
    }
  }

  private async loadSounds(): Promise<void> {
    const soundUrls = {
      click: this.generateTone(800, 0.1, 'sine'),
      success: this.generateTone(1200, 0.3, 'sine'),
      failure: this.generateTone(300, 0.5, 'sawtooth'),
      levelComplete: this.generateMelody([523, 659, 784, 1047], 0.2),
      gameStart: this.generateMelody([440, 554, 659], 0.15),
      correctAnswer: this.generateTone(880, 0.2, 'sine'),
      wrongAnswer: this.generateTone(220, 0.3, 'sawtooth'),
      buttonHover: this.generateTone(600, 0.05, 'sine'),
      reward: this.generateMelody([523, 659, 784, 1047, 1319], 0.15),
      storyPage: this.generateTone(500, 0.1, 'triangle'),
      storyComplete: this.generateMelody([392, 523, 659, 784, 1047], 0.25),
      pop: this.generateTone(1000, 0.05, 'sine'),
      whoosh: this.generateTone(400, 0.2, 'sawtooth'),
      ding: this.generateTone(1500, 0.1, 'sine'),
      chime: this.generateMelody([659, 784, 1047], 0.1),
      celebration: this.generateMelody([523, 659, 784, 1047, 1319, 1568], 0.2),
      pageTransition: this.generateMelody([440, 523, 659], 0.1),
      swipe: this.generateTone(600, 0.15, 'triangle'),
      slide: this.generateMelody([392, 440, 523], 0.08)
    };

    // Load all sounds
    for (const [name, generator] of Object.entries(soundUrls)) {
      try {
        const audioBuffer = await generator;
        this.audioCache.set(name, audioBuffer);
      } catch (error) {
        console.warn(`Failed to load sound: ${name}`, error);
      }
    }
  }

  private async generateTone(frequency: number, duration: number, type: OscillatorType): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error('Audio context not available');
    }

    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      let sample = 0;

      // Generate waveform
      switch (type) {
        case 'sine':
          sample = Math.sin(2 * Math.PI * frequency * t);
          break;
        case 'sawtooth':
          sample = 2 * (t * frequency - Math.floor(t * frequency + 0.5));
          break;
        case 'triangle':
          sample = 2 * Math.abs(2 * (t * frequency - Math.floor(t * frequency + 0.5))) - 1;
          break;
        case 'square':
          sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
          break;
      }

      // Apply envelope (fade in/out)
      const envelope = Math.min(1, Math.min(t * 10, (duration - t) * 10));
      data[i] = sample * envelope * 0.3;
    }

    return buffer;
  }

  private async generateMelody(frequencies: number[], noteDuration: number): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error('Audio context not available');
    }

    const sampleRate = this.audioContext.sampleRate;
    const totalDuration = frequencies.length * noteDuration;
    const buffer = this.audioContext.createBuffer(1, sampleRate * totalDuration, sampleRate);
    const data = buffer.getChannelData(0);

    frequencies.forEach((frequency, index) => {
      const startSample = index * noteDuration * sampleRate;
      const endSample = startSample + noteDuration * sampleRate;

      for (let i = startSample; i < endSample && i < data.length; i++) {
        const t = (i - startSample) / sampleRate;
        const sample = Math.sin(2 * Math.PI * frequency * t);
        const envelope = Math.min(1, Math.min(t * 20, (noteDuration - t) * 20));
        data[i] = sample * envelope * 0.2;
      }
    });

    return buffer;
  }

  // تشغيل الأصوات
  play(soundName: string, volume: number = 1): void {
    if (!this.soundEnabled || !this.audioContext) return;

    const audioBuffer = this.audioCache.get(soundName);
    if (!audioBuffer) {
      console.warn(`Sound not found: ${soundName}`);
      return;
    }

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = audioBuffer;
      gainNode.gain.value = volume * this.volume;
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start();
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }

  // أصوات محددة للأحداث
  playClick(): void {
    this.play('click', 0.5);
  }

  playHover(): void {
    this.play('buttonHover', 0.3);
  }

  playSuccess(): void {
    this.play('success', 0.8);
  }

  playFailure(): void {
    this.play('failure', 0.6);
  }

  playCorrectAnswer(): void {
    this.play('correctAnswer', 0.7);
  }

  playWrongAnswer(): void {
    this.play('wrongAnswer', 0.5);
  }

  playLevelComplete(): void {
    this.play('levelComplete', 0.9);
  }

  playGameStart(): void {
    this.play('gameStart', 0.8);
  }

  playReward(): void {
    this.play('reward', 0.9);
  }

  playStoryPage(): void {
    this.play('storyPage', 0.4);
  }

  playStoryComplete(): void {
    this.play('storyComplete', 0.8);
  }

  playPop(): void {
    this.play('pop', 0.6);
  }

  playWhoosh(): void {
    this.play('whoosh', 0.5);
  }

  playDing(): void {
    this.play('ding', 0.7);
  }

  playChime(): void {
    this.play('chime', 0.6);
  }

  playCelebration(): void {
    this.play('celebration', 1.0);
  }

  // إضافة الدوال المفقودة
  playPageTransition(): void {
    this.play('pageTransition', 0.4);
  }

  playSwipe(): void {
    this.play('swipe', 0.5);
  }

  playSlide(): void {
    this.play('slide', 0.3);
  }

  // موسيقى الخلفية
  async playBackgroundMusic(loop: boolean = true): Promise<void> {
    if (!this.soundEnabled) return;

    try {
      // إيقاف الموسيقى الحالية
      this.stopBackgroundMusic();

      // إنشاء موسيقى خلفية هادئة
      this.currentBackgroundMusic = new Audio();
      this.currentBackgroundMusic.loop = loop;
      this.currentBackgroundMusic.volume = this.volume * 0.3;
      
      // موسيقى محاكية (يمكن استبدالها بملف صوتي حقيقي)
      const backgroundTone = await this.generateMelody([
        523, 659, 784, 659, 523, 392, 523, 659
      ], 0.8);
      
      // تحويل AudioBuffer إلى بيانات قابلة للتشغيل
      const audioBlob = this.audioBufferToBlob(backgroundTone);
      this.currentBackgroundMusic.src = URL.createObjectURL(audioBlob);
      this.currentBackgroundMusic.play();
    } catch (error) {
      console.warn('Error playing background music:', error);
    }
  }

  stopBackgroundMusic(): void {
    if (this.currentBackgroundMusic) {
      this.currentBackgroundMusic.pause();
      this.currentBackgroundMusic.currentTime = 0;
      this.currentBackgroundMusic = null;
    }
  }

  private audioBufferToBlob(buffer: AudioBuffer): Blob {
    const numberOfChannels = buffer.numberOfChannels;
    const length = buffer.length * numberOfChannels * 2;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    
    let offset = 0;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  // إعدادات الصوت
  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    if (!enabled) {
      this.stopBackgroundMusic();
    }
  }

  getSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.currentBackgroundMusic) {
      this.currentBackgroundMusic.volume = this.volume * 0.3;
    }
  }

  getVolume(): number {
    return this.volume;
  }

  // تشغيل سلسلة من الأصوات
  async playSequence(sounds: string[], interval: number = 200): Promise<void> {
    for (let i = 0; i < sounds.length; i++) {
      this.play(sounds[i]);
      if (i < sounds.length - 1) {
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
  }

  // تشغيل أصوات عشوائية للتفاعل
  playRandomPositiveSound(): void {
    const positiveSounds = ['success', 'correctAnswer', 'ding', 'chime', 'pop'];
    const randomSound = positiveSounds[Math.floor(Math.random() * positiveSounds.length)];
    this.play(randomSound);
  }

  // دوال إضافية للتفاعل المحسن
  playMenuSelect(): void {
    this.play('chime', 0.6);
  }

  playMenuBack(): void {
    this.play('whoosh', 0.4);
  }

  playCardFlip(): void {
    this.play('swipe', 0.5);
  }

  playButtonPress(): void {
    this.playClick();
  }

  playNotification(): void {
    this.play('ding', 0.8);
  }

  playError(): void {
    this.playFailure();
  }

  playConfirm(): void {
    this.playSuccess();
  }

  // تشغيل أصوات الحيوانات
  async playAnimalSound(animalId: string, language: string = 'en'): Promise<void> {
    // محاكاة أصوات الحيوانات باستخدام ترددات مختلفة
    const animalSounds: Record<string, { frequency: number; duration: number; type: OscillatorType }> = {
      'cat': { frequency: 800, duration: 0.3, type: 'sine' },
      'dog': { frequency: 400, duration: 0.5, type: 'sawtooth' },
      'cow': { frequency: 200, duration: 0.8, type: 'square' },
      'horse': { frequency: 300, duration: 0.6, type: 'sawtooth' },
      'sheep': { frequency: 600, duration: 0.4, type: 'sine' },
      'pig': { frequency: 250, duration: 0.5, type: 'square' },
      'chicken': { frequency: 1000, duration: 0.2, type: 'sine' },
      'duck': { frequency: 500, duration: 0.3, type: 'triangle' },
      'lion': { frequency: 150, duration: 1.0, type: 'sawtooth' },
      'elephant': { frequency: 100, duration: 1.2, type: 'square' },
      'bird': { frequency: 1200, duration: 0.2, type: 'sine' },
      'owl': { frequency: 400, duration: 0.6, type: 'triangle' },
      'frog': { frequency: 300, duration: 0.4, type: 'square' }
    };

    const sound = animalSounds[animalId] || animalSounds['cat'];
    
    try {
      if (this.audioContext && this.soundEnabled) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = sound.frequency;
        oscillator.type = sound.type;
        
        gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + sound.duration);
      }
    } catch (error) {
      console.warn('Error playing animal sound:', error);
    }
  }

  // نطق أسماء الحيوانات
  async speakAnimalName(animalId: string, language: string = 'en'): Promise<void> {
    if (!this.soundEnabled || !('speechSynthesis' in window)) {
      return;
    }

    const animalNames: Record<string, { en: string; ar: string }> = {
      'cat': { en: 'Cat', ar: 'قطة' },
      'dog': { en: 'Dog', ar: 'كلب' },
      'cow': { en: 'Cow', ar: 'بقرة' },
      'horse': { en: 'Horse', ar: 'حصان' },
      'sheep': { en: 'Sheep', ar: 'خروف' },
      'pig': { en: 'Pig', ar: 'خنزير' },
      'chicken': { en: 'Chicken', ar: 'دجاجة' },
      'duck': { en: 'Duck', ar: 'بطة' },
      'lion': { en: 'Lion', ar: 'أسد' },
      'elephant': { en: 'Elephant', ar: 'فيل' },
      'bird': { en: 'Bird', ar: 'عصفور' },
      'owl': { en: 'Owl', ar: 'بومة' },
      'frog': { en: 'Frog', ar: 'ضفدع' }
    };

    const name = animalNames[animalId]?.[language as 'en' | 'ar'] || animalNames[animalId]?.en || animalId;
    
    try {
      const utterance = new SpeechSynthesisUtterance(name);
      utterance.lang = language === 'ar' ? 'ar-SA' : 'en-US';
      utterance.volume = this.volume;
      utterance.rate = 0.8;
      utterance.pitch = 1.2;
      
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.warn('Error speaking animal name:', error);
    }
  }

  // تنظيف الذاكرة
  dispose(): void {
    this.stopBackgroundMusic();
    this.audioCache.clear();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

export const audioService = new AudioService();