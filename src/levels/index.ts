import type { GameId, Level } from '../types'
import { shapeLevels } from './shape'
import { puzzleLevels } from './puzzle'
import { matchingLevels } from './matching'
import { countingLevels } from './counting'
import { lifeLevels } from './life'
import { logicLevels } from './logic'

const ALL: Record<GameId, Level[]> = {
  shape: shapeLevels,
  puzzle: puzzleLevels,
  matching: matchingLevels,
  counting: countingLevels,
  life: lifeLevels,
  logic: logicLevels,
}

/**
 * 取出某一款游戏的全部关卡。
 * @param gameId 游戏标识
 */
export function levelsOf(gameId: GameId): Level[] {
  return ALL[gameId] ?? []
}

/**
 * 按序号取一关。序号从 1 开始。
 * @param gameId 游戏标识
 * @param index 关卡序号
 */
export function getLevel(gameId: GameId, index: number): Level | null {
  return ALL[gameId]?.find((level) => level.index === index) ?? null
}

export { shapeLevels, puzzleLevels, matchingLevels, countingLevels, lifeLevels, logicLevels }
