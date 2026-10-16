import { useProgress } from './progress'

let ctx: AudioContext | null = null
let unlocked = false
let speakTimer = 0

/**
 * 第一次手指点击后再出声，兼容微信里的自动播放限制。
 */
export function unlockAudio(): void {
  unlocked = true
  try {
    if (!ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (Ctx) ctx = new Ctx()
    }
    if (ctx && ctx.state === 'suspended') void ctx.resume()
  } catch {
    ctx = null
  }
  try {
    window.speechSynthesis?.getVoices()
  } catch {
    /* 没有语音也不影响玩游戏 */
  }
}

/**
 * 当前是否允许播放音效。
 */
function soundOn(): boolean {
  return unlocked && useProgress().state.soundEnabled
}

/**
 * 播放一个很轻的音调。
 * @param freq 频率
 * @param dur 秒
 * @param type 波形
 * @param gain 音量，保持很轻
 * @param delay 相对当前时间的延迟
 */
function tone(freq: number, dur: number, type: OscillatorType, gain: number, delay = 0): void {
  if (!soundOn() || !ctx) return
  const start = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  const amp = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  amp.gain.setValueAtTime(gain, start)
  amp.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  osc.connect(amp)
  amp.connect(ctx.destination)
  osc.start(start)
  osc.stop(start + dur + 0.02)
}

/** 放对时的一声轻叮 */
export function playDing(): void {
  tone(660, 0.12, 'sine', 0.05)
  tone(880, 0.16, 'sine', 0.04, 0.08)
}

/** 过关时的一小段上行音 */
export function playSuccess(): void {
  tone(523, 0.14, 'sine', 0.05, 0)
  tone(659, 0.14, 'sine', 0.05, 0.12)
  tone(784, 0.22, 'sine', 0.05, 0.24)
}

/** 放错时的轻声，不刺耳、不吓到孩子 */
export function playSoft(): void {
  tone(320, 0.12, 'sine', 0.03)
}

/**
 * 动物叫声：语音说“喵 / 嘎 / 哞”，再配一个简单音调。
 * 必须由按钮点击触发。
 * @param kind 猫、鸭或牛
 */
export function playAnimal(kind: 'cat' | 'duck' | 'cow'): void {
  const line = kind === 'cat' ? '喵喵' : kind === 'duck' ? '嘎嘎嘎' : '哞——'
  if (kind === 'cat') {
    tone(520, 0.18, 'triangle', 0.04)
    tone(380, 0.22, 'triangle', 0.04, 0.16)
  } else if (kind === 'duck') {
    tone(700, 0.08, 'square', 0.03)
    tone(680, 0.08, 'square', 0.03, 0.12)
    tone(710, 0.08, 'square', 0.03, 0.24)
  } else {
    tone(180, 0.45, 'sawtooth', 0.02)
  }
  speak(line)
}

/**
 * 朗读一句中文。语音关了、或浏览器没有语音时，直接跳过。
 * @param text 要说的话
 */
export function speak(text: string): void {
  if (!unlocked) return
  if (!useProgress().state.voiceEnabled) return
  if (!text || !window.speechSynthesis) return
  window.clearTimeout(speakTimer)
  try {
    window.speechSynthesis.cancel()
  } catch {
    return
  }
  speakTimer = window.setTimeout(() => {
    try {
      const utter = new SpeechSynthesisUtterance(text)
      utter.lang = 'zh-CN'
      utter.rate = 0.92
      utter.pitch = 1.05
      const voices = window.speechSynthesis.getVoices()
      const voice = voices.find((v) => v.lang === 'zh-CN') || voices.find((v) => v.lang.toLowerCase().startsWith('zh'))
      if (voice) utter.voice = voice
      window.speechSynthesis.speak(utter)
    } catch {
      /* 语音失败时游戏仍然可以玩 */
    }
  }, 60)
}

/** 离开页面或换关时停掉还在说的话 */
export function stopSpeak(): void {
  window.clearTimeout(speakTimer)
  try {
    window.speechSynthesis?.cancel()
  } catch {
    /* 忽略 */
  }
}
