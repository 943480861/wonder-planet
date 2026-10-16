import type { AcceptRule, LogicChoice, ShapeItem } from './types'

/**
 * 判断物品是否符合筐或题目的规则。
 * 写了的颜色、形状、指定物品要同时满足。
 * @param item 被拖动或点选的物品
 * @param rule 正确答案规则
 */
export function matchRule(
  item: Pick<ShapeItem, 'id' | 'color' | 'shape'>,
  rule: AcceptRule,
): boolean {
  if (!rule.itemId && !rule.color && !rule.shape) return false
  if (rule.itemId && item.id !== rule.itemId) return false
  if (rule.color && item.color !== rule.color) return false
  if (rule.shape && item.shape !== rule.shape) return false
  return true
}

/**
 * 第 9 关专用：必须又红又圆，红方块和蓝圆都不算。
 * @param item 候选积木
 */
export function isRedCircle(item: Pick<ShapeItem, 'color' | 'shape'>): boolean {
  return item.color === 'red' && item.shape === 'circle'
}

/**
 * 逻辑第 9 关：又大又红的苹果，只满足一个条件不算对。
 * @param item 候选水果
 */
export function isBigRedApple(item: Pick<LogicChoice, 'color' | 'size' | 'shape'>): boolean {
  return item.color === 'red' && item.size === 'l' && item.shape === 'apple'
}

/**
 * 数量是否正好等于目标。用整数，避免动画中途误判。
 * @param count 已经放入的件数
 * @param target 这一关需要的件数
 */
export function countReached(count: number, target: number): boolean {
  return Number.isInteger(count) && Number.isInteger(target) && count === target
}
