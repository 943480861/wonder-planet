import { isBigRedApple, isRedCircle, matchRule } from '../rules'
import { countingLevels } from './counting'
import { lifeLevels } from './life'
import { logicLevels } from './logic'
import { matchingLevels } from './matching'
import { puzzleLevels } from './puzzle'
import { shapeLevels } from './shape'
import type { GameId } from '../types'

/**
 * 检查 60 关的配置：数量、唯一答案、拼图对应关系。
 * 有问题就返回中文说明，游戏仍会启动，方便修数据。
 */
export function validateLevels(): string[] {
  const errors: string[] = []
  const ids = new Set<string>()

  const groups: Array<[GameId, { id: string; index: number; instructionText: string; hintText: string }[]]> = [
    ['shape', shapeLevels],
    ['puzzle', puzzleLevels],
    ['matching', matchingLevels],
    ['counting', countingLevels],
    ['life', lifeLevels],
    ['logic', logicLevels],
  ]

  for (const [gameId, levels] of groups) {
    if (levels.length !== 10) errors.push(`${gameId} 不是 10 关`)
    levels.forEach((level, i) => {
      if (level.index !== i + 1) errors.push(`${level.id} 序号不对`)
      if (!level.id.startsWith(`${gameId}-`)) errors.push(`${level.id} 前缀不对`)
      if (ids.has(level.id)) errors.push(`重复 id ${level.id}`)
      ids.add(level.id)
      if (!level.instructionText || !level.hintText) errors.push(`${level.id} 缺少提示`)
    })
  }

  for (const level of shapeLevels) {
    if (level.mode === 'pick') {
      const rules = level.rotateShapes?.map((shape) => ({ shape })) ?? (level.pickRule ? [level.pickRule] : [])
      if (!rules.length) errors.push(`${level.id} 没有点选规则`)
      for (const rule of rules) {
        const hits = level.items.filter((item) => matchRule(item, rule))
        if (hits.length !== 1) errors.push(`${level.id} 点选答案不是唯一`)
      }
    } else {
      for (const item of level.items.filter((it) => it.required)) {
        const bins = level.bins.filter((bin) => matchRule(item, bin.rule))
        if (bins.length !== 1) errors.push(`${level.id} ${item.id} 能进的筐不是一个`)
      }
    }
  }

  const redCircle = shapeLevels.find((level) => level.id === 'shape-09')
  if (redCircle) {
    const good = redCircle.items.filter((item) => isRedCircle(item))
    const marked = redCircle.items.filter((item) => item.color === 'red' && item.shape !== 'circle')
    if (good.length !== 1 || marked.some((item) => isRedCircle(item))) errors.push('形状第 9 关双条件不对')
  }

  for (const level of puzzleLevels) {
    for (const slot of level.slots) {
      if (slot.prefill) continue
      const piece = level.pieces.find((item) => item.id === slot.expectedPieceId)
      if (!piece || piece.slotId !== slot.id) errors.push(`${level.id} 槽位 ${slot.id} 对不上拼片`)
    }
  }

  for (const level of matchingLevels) {
    if (level.mode === 'choose' && level.prompt) {
      const hits = level.cards.filter((card) => card.pairId === level.prompt?.pairId)
      if (hits.length !== 1) errors.push(`${level.id} 选择答案不唯一`)
    }
    if (level.mode === 'links') {
      const left = level.cards.filter((card) => card.side === 'left')
      for (const card of left) {
        const hits = level.cards.filter((other) => other.side === 'right' && other.pairId === card.pairId)
        if (hits.length !== 1) errors.push(`${level.id} ${card.id} 配对不唯一`)
      }
      if (left.length !== level.pairsNeeded) errors.push(`${level.id} 对数不对`)
    }
    if (level.mode === 'memory' || level.mode === 'faceup') {
      const counts = new Map<string, number>()
      for (const card of level.cards) counts.set(card.pairId, (counts.get(card.pairId) ?? 0) + 1)
      const pairs = [...counts.values()].filter((n) => n === 2).length
      if (pairs !== level.pairsNeeded || [...counts.values()].some((n) => n !== 2)) {
        errors.push(`${level.id} 翻牌配对不完整`)
      }
    }
    if (level.mode === 'sound') {
      const sounds = new Set(level.cards.map((card) => card.sound))
      if (sounds.size !== level.cards.length) errors.push(`${level.id} 动物声音重复`)
      for (const sound of level.soundOrder ?? []) {
        if (!level.cards.some((card) => card.sound === sound)) errors.push(`${level.id} 缺少声音 ${sound}`)
      }
    }
  }

  for (const level of logicLevels) {
    if (level.mode === 'pick' && level.id !== 'logic-09') {
      const hits = (level.choices ?? []).filter((item) => item.correct)
      if (hits.length !== 1) errors.push(`${level.id} 答案不唯一`)
    }
    if (level.mode === 'pattern') {
      const hits = (level.options ?? []).filter((item) => item.correct)
      if (hits.length !== 1 || hits[0]?.id !== level.answerId) errors.push(`${level.id} 规律答案不对`)
    }
  }

  const apple = logicLevels.find((level) => level.id === 'logic-09')
  if (apple) {
    const hits = (apple.choices ?? []).filter((item) => isBigRedApple(item))
    const flagged = (apple.choices ?? []).filter((item) => item.correct)
    if (hits.length !== 1 || flagged.length !== 1 || !flagged[0] || !isBigRedApple(flagged[0])) {
      errors.push('逻辑第 9 关必须又大又红')
    }
  }

  return errors
}
