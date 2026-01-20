/**
 * 音效管理器 - 赛博朋克五子棋游戏
 * 负责音效文件的加载、播放和控制
 */
class AudioManager {
  /**
   * 构造函数
   */
  constructor() {
    // 音效对象集合
    this.sounds = {
      place: null,    // 落子音效
      win: null,      // 胜利音效
      click: null     // 按钮点击音效
    };

    // 音效控制状态
    this.enabled = true;  // 音效开关（默认开启）
    this.volume = 0.5;    // 音量（0-1，默认50%）

    // 加载状态
    this.isLoaded = false;
    this.loadingPromise = null;

    // 音效生成器（备用方案）
    this.generator = null;
    this.useGeneratedSounds = false;
  }

  /**
   * 加载所有音效文件
   * @returns {Promise<void>}
   */
  async loadSounds() {
    // 如果已经在加载中，返回现有的Promise
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    // 创建加载Promise
    this.loadingPromise = (async () => {
      try {
        console.log('[AudioManager] 开始加载音效...');

        // 并行加载所有音效文件
        const loadPromises = [
          this.loadSound('place', 'assets/sounds/place.mp3'),
          this.loadSound('win', 'assets/sounds/win.mp3'),
          this.loadSound('click', 'assets/sounds/click.mp3')
        ];

        await Promise.all(loadPromises);

        // 检查是否有音效加载失败
        const failedSounds = Object.keys(this.sounds).filter(key => !this.sounds[key]);

        if (failedSounds.length > 0) {
          console.warn('[AudioManager] 部分音效文件加载失败，使用动态生成音效');
          await this.loadGeneratedSounds(failedSounds);
        }

        this.isLoaded = true;
        console.log('[AudioManager] 所有音效加载完成');
      } catch (error) {
        console.warn('[AudioManager] 音效加载失败:', error);
        // 尝试使用动态生成的音效
        await this.loadGeneratedSounds(['place', 'win', 'click']);
        this.isLoaded = true;
      }
    })();

    return this.loadingPromise;
  }

  /**
   * 加载单个音效文件
   * @param {string} name - 音效名称 (place/win/click)
   * @param {string} url - 音效文件路径
   * @returns {Promise<Audio>}
   */
  loadSound(name, url) {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.volume = this.volume;
      audio.preload = 'auto';

      // 监听加载成功事件
      audio.addEventListener('canplaythrough', () => {
        this.sounds[name] = audio;
        console.log(`[AudioManager] ${name} 音效加载成功`);
        resolve(audio);
      }, { once: true });

      // 监听加载错误事件
      audio.addEventListener('error', (e) => {
        console.warn(`[AudioManager] ${name} 音效加载失败:`, e);
        // 即使失败也resolve，避免阻塞其他音效加载
        resolve(null);
      }, { once: true });

      // 开始加载
      audio.src = url;
      audio.load();
    });
  }

  /**
   * 播放指定音效
   * @param {string} soundName - 音效名称 (place/win/click)
   * @returns {Promise<void>}
   */
  async play(soundName) {
    // 检查音效是否启用
    if (!this.enabled) {
      return;
    }

    // 检查音效是否存在
    if (!this.sounds[soundName]) {
      console.warn(`[AudioManager] 音效 ${soundName} 不存在或未加载`);
      return;
    }

    try {
      const sound = this.sounds[soundName];

      // 重置播放位置（支持快速连续播放）
      sound.currentTime = 0;

      // 更新音量
      sound.volume = this.volume;

      // 播放音效
      await sound.play();
    } catch (error) {
      // 捕获播放错误（如用户未交互导致的自动播放限制）
      console.warn(`[AudioManager] 播放 ${soundName} 失败:`, error.message);
    }
  }

  /**
   * 停止指定音效
   * @param {string} soundName - 音效名称
   */
  stop(soundName) {
    if (!this.sounds[soundName]) {
      return;
    }

    const sound = this.sounds[soundName];
    sound.pause();
    sound.currentTime = 0;
  }

  /**
   * 停止所有音效
   */
  stopAll() {
    Object.keys(this.sounds).forEach(name => {
      if (this.sounds[name]) {
        this.stop(name);
      }
    });
  }

  /**
   * 切换音效开关
   * @returns {boolean} 当前状态
   */
  toggle() {
    this.enabled = !this.enabled;
    console.log(`[AudioManager] 音效${this.enabled ? '开启' : '关闭'}`);

    // 如果关闭音效，停止所有正在播放的音效
    if (!this.enabled) {
      this.stopAll();
    }

    return this.enabled;
  }

  /**
   * 设置音量
   * @param {number} volume - 音量值 (0-1)
   */
  setVolume(volume) {
    // 限制音量范围
    this.volume = Math.max(0, Math.min(1, volume));

    // 更新所有已加载音效的音量
    Object.keys(this.sounds).forEach(name => {
      if (this.sounds[name]) {
        this.sounds[name].volume = this.volume;
      }
    });

    console.log(`[AudioManager] 音量设置为 ${Math.round(this.volume * 100)}%`);
  }

  /**
   * 获取音效开关状态
   * @returns {boolean}
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * 获取当前音量
   * @returns {number}
   */
  getVolume() {
    return this.volume;
  }

  /**
   * 加载动态生成的音效（备用方案）
   * @param {Array<string>} soundNames - 需要生成的音效名称数组
   */
  async loadGeneratedSounds(soundNames) {
    try {
      // 检查是否有 AudioGenerator
      if (typeof AudioGenerator === 'undefined') {
        console.warn('[AudioManager] AudioGenerator 未加载，无法生成音效');
        return;
      }

      if (!this.generator) {
        this.generator = new AudioGenerator();
      }

      console.log('[AudioManager] 生成音效:', soundNames);

      for (let name of soundNames) {
        let buffer;

        switch (name) {
          case 'place':
            buffer = this.generator.generatePlaceSound();
            break;
          case 'win':
            buffer = this.generator.generateWinSound();
            break;
          case 'click':
            buffer = this.generator.generateClickSound();
            break;
        }

        if (buffer) {
          // 将 AudioBuffer 转换为 Audio 元素
          this.sounds[name] = this.generator.bufferToAudio(buffer);
          this.sounds[name].volume = this.volume;
          this.useGeneratedSounds = true;
          console.log(`[AudioManager] ${name} 音效已动态生成`);
        }
      }
    } catch (error) {
      console.warn('[AudioManager] 动态生成音效失败:', error);
    }
  }

  /**
   * 预热音效（用户首次交互时调用，解决浏览器自动播放限制）
   */
  async warmup() {
    if (!this.isLoaded) {
      await this.loadSounds();
    }

    // 尝试播放静音的音效以激活音频上下文
    const originalVolume = this.volume;
    this.setVolume(0);

    for (let soundName in this.sounds) {
      if (this.sounds[soundName]) {
        try {
          await this.play(soundName);
          this.stop(soundName);
        } catch (e) {
          // 忽略错误
        }
      }
    }

    this.setVolume(originalVolume);
    console.log('[AudioManager] 音效系统预热完成');
  }
}

// 导出到全局（供其他模块使用）
if (typeof window !== 'undefined') {
  window.AudioManager = AudioManager;
}
