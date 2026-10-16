import type { GameId } from './types'

/** 首页六张入口卡用的名字、介绍色和主题 */
export interface GameMeta {
  id: GameId
  title: string
  desc: string
  tint: string
  deep: string
  icon: string
}

export const GAMES: GameMeta[] = [
  { id: 'shape', title: '形状魔法屋', desc: '颜色和形状真有趣', tint: '#ffb4c8', deep: '#ff7f9f', icon: 'apple' },
  { id: 'puzzle', title: '动物拼拼乐', desc: '帮动物拼完整', tint: '#ffe08a', deep: '#f5c542', icon: 'cat' },
  { id: 'matching', title: '动物找朋友', desc: '找到一样的小伙伴', tint: '#b8e6c8', deep: '#5dca8a', icon: 'rabbit' },
  { id: 'counting', title: '数字小农场', desc: '一起数一数', tint: '#ffd0a8', deep: '#ff9f43', icon: 'duck' },
  { id: 'life', title: '宝宝生活家', desc: '学习生活小本领', tint: '#c5d8ff', deep: '#7aa2ff', icon: 'toothbrush' },
  { id: 'logic', title: '逻辑探险队', desc: '动动小脑筋', tint: '#e3d0ff', deep: '#b794f6', icon: 'star' },
]

/**
 * 按 id 取游戏介绍。
 * @param id 游戏标识
 */
export function gameMeta(id: GameId): GameMeta {
  return GAMES.find((g) => g.id === id) ?? GAMES[0]
}
