import { reactive, watch } from 'vue'
import type { GameId, GameProgress, LevelBase } from './types'

const KEY = 'wonder-planet-progress-v1'

const GAME_IDS: GameId[] = ['shape', 'puzzle', 'matching', 'counting', 'life', 'logic']

/**
 * 全新存档：每款游戏只打开第 1 关，声音默认开着。
 */
function fresh(): GameProgress {
  const unlockedLevelByGame = {} as Record<GameId, number>
  for (const id of GAME_IDS) unlockedLevelByGame[id] = 1
  return {
    completedLevelIds: [],
    unlockedLevelByGame,
    stars: 0,
    soundEnabled: true,
    voiceEnabled: true,
    memoryPreview: true,
  }
}

/**
 * 读取本机进度。数据坏了就回到新存档，不让页面白屏。
 */
function load(): GameProgress {
  const blank = fresh()
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return blank
    const parsed = JSON.parse(raw) as { v?: number; data?: Partial<GameProgress> }
    if (parsed.v !== 1 || !parsed.data) return blank
    const data = parsed.data
    return {
      ...blank,
      ...data,
      completedLevelIds: Array.isArray(data.completedLevelIds) ? data.completedLevelIds.filter((id) => typeof id === 'string') : [],
      unlockedLevelByGame: { ...blank.unlockedLevelByGame, ...(data.unlockedLevelByGame ?? {}) },
      stars: typeof data.stars === 'number' && data.stars >= 0 ? Math.floor(data.stars) : 0,
      soundEnabled: data.soundEnabled !== false,
      voiceEnabled: data.voiceEnabled !== false,
      memoryPreview: data.memoryPreview !== false,
    }
  } catch {
    return blank
  }
}

/** 全应用共用一份进度，刷新后还在 */
const state = reactive<GameProgress>(load())

/**
 * 写入本机。写失败时只留在内存里，游戏继续。
 */
function save(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ v: 1, data: state }))
  } catch {
    /* 无痕模式或空间满了时静默降级 */
  }
}

watch(state, save, { deep: true })

/**
 * 给页面用的进度操作。
 */
export function useProgress() {
  /**
   * 第一次完成关卡时加一颗星，并解锁下一关。
   * @param level 刚完成的关卡
   */
  function completeLevel(level: LevelBase): void {
    if (!state.completedLevelIds.includes(level.id)) {
      state.completedLevelIds.push(level.id)
      state.stars += 1
    }
    const next = Math.min(10, level.index + 1)
    if (state.unlockedLevelByGame[level.gameId] < next) {
      state.unlockedLevelByGame[level.gameId] = next
    }
    state.lastGameId = level.gameId
    state.lastLevelId = level.id
  }

  /**
   * 记住最近一次打开的关卡，方便首页“接着玩”。
   * @param level 当前关卡
   */
  function remember(level: LevelBase): void {
    state.lastGameId = level.gameId
    state.lastLevelId = level.id
  }

  /**
   * 这一关是否已经解锁。
   * @param gameId 游戏
   * @param index 关卡序号，从 1 开始
   */
  function isUnlocked(gameId: GameId, index: number): boolean {
    return index >= 1 && index <= state.unlockedLevelByGame[gameId]
  }

  /**
   * 这一关是否已经完成过。
   * @param levelId 关卡 id
   */
  function isDone(levelId: string): boolean {
    return state.completedLevelIds.includes(levelId)
  }

  /**
   * 某款游戏完成了几关。
   * @param gameId 游戏
   */
  function doneCount(gameId: GameId): number {
    return state.completedLevelIds.filter((id) => id.startsWith(`${gameId}-`)).length
  }

  /**
   * 家长确认后清空本机进度。
   */
  function resetAll(): void {
    const next = fresh()
    Object.assign(state, next)
    state.completedLevelIds = []
    save()
  }

  return { state, completeLevel, remember, isUnlocked, isDone, doneCount, resetAll }
}
