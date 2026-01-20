/**
 * 音效生成器 - 使用 Web Audio API 动态生成音效
 * 用于在没有音效文件时提供备用方案
 */
class AudioGenerator {
  constructor() {
    this.audioContext = null;
  }

  /**
   * 初始化音频上下文
   */
  initContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioContext;
  }

  /**
   * 生成落子音效（短促的哔声）
   * @returns {AudioBuffer}
   */
  generatePlaceSound() {
    const context = this.initContext();
    const duration = 0.08;
    const sampleRate = context.sampleRate;
    const frameCount = sampleRate * duration;
    const buffer = context.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);

    const frequency = 800; // 800Hz - 清脆的落子声
    for (let i = 0; i < frameCount; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 25); // 快速衰减
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
    }

    return buffer;
  }

  /**
   * 生成胜利音效（上升的三音符旋律）
   * @returns {AudioBuffer}
   */
  generateWinSound() {
    const context = this.initContext();
    const duration = 1.0;
    const sampleRate = context.sampleRate;
    const frameCount = sampleRate * duration;
    const buffer = context.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);

    // 三个音符：C5(523Hz), E5(659Hz), G5(784Hz) - 大三和弦
    const notes = [523.25, 659.25, 783.99];
    const noteDuration = 0.3;
    const gapDuration = 0.03;

    for (let i = 0; i < frameCount; i++) {
      const t = i / sampleRate;
      let sample = 0;

      for (let n = 0; n < notes.length; n++) {
        const noteStart = n * (noteDuration + gapDuration);
        const noteEnd = noteStart + noteDuration;

        if (t >= noteStart && t < noteEnd) {
          const noteTime = t - noteStart;
          const frequency = notes[n];
          const envelope = Math.max(0, 1 - noteTime / noteDuration);
          sample += Math.sin(2 * Math.PI * frequency * noteTime) * envelope;
        }
      }

      data[i] = sample * 0.25;
    }

    return buffer;
  }

  /**
   * 生成点击音效（极短的高频滴声）
   * @returns {AudioBuffer}
   */
  generateClickSound() {
    const context = this.initContext();
    const duration = 0.04;
    const sampleRate = context.sampleRate;
    const frameCount = sampleRate * duration;
    const buffer = context.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);

    const frequency = 1200; // 1200Hz - 清脆的点击声
    for (let i = 0; i < frameCount; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 50); // 极快衰减
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.2;
    }

    return buffer;
  }

  /**
   * 播放音效缓冲区
   * @param {AudioBuffer} buffer
   */
  playBuffer(buffer) {
    const context = this.initContext();
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(0);
  }

  /**
   * 创建可播放的音频元素（从AudioBuffer）
   * @param {AudioBuffer} buffer
   * @returns {HTMLAudioElement}
   */
  bufferToAudio(buffer) {
    // 将 AudioBuffer 转换为 WAV 数据
    const wav = this.bufferToWav(buffer);
    const blob = new Blob([wav], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);

    const audio = new Audio(url);
    audio.preload = 'auto';

    return audio;
  }

  /**
   * AudioBuffer 转 WAV 格式
   */
  bufferToWav(buffer) {
    const length = buffer.length * buffer.numberOfChannels * 2;
    const arrayBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(arrayBuffer);

    // WAV 文件头
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, buffer.numberOfChannels, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * buffer.numberOfChannels * 2, true);
    view.setUint16(32, buffer.numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    this.writeString(view, 36, 'data');
    view.setUint32(40, length, true);

    // 写入音频数据
    const channels = [];
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    let offset = 44;
    let pos = 0;
    while (pos < buffer.length) {
      for (let i = 0; i < buffer.numberOfChannels; i++) {
        const sample = Math.max(-1, Math.min(1, channels[i][pos]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
      pos++;
    }

    return arrayBuffer;
  }

  writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}

// 导出到全局
if (typeof window !== 'undefined') {
  window.AudioGenerator = AudioGenerator;
}
