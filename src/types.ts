/** 六款小游戏的稳定标识，存档和路由都用它，不靠中文名 */
export type GameId = 'shape' | 'puzzle' | 'matching' | 'counting' | 'life' | 'logic'

/** 难度只用于选关装饰，不给孩子打分 */
export type Difficulty = 'easy' | 'medium' | 'challenge'

/** 所有关卡共用的说明、语音和存档字段 */
export interface LevelBase {
  id: string
  gameId: GameId
  /** 从 1 到 10，用来解锁下一关 */
  index: number
  title: string
  learningGoal: string
  instructionText: string
  voiceText?: string
  difficulty: Difficulty
  hintText: string
  successText: string
  /** 选关页上的小图 */
  icon: string
}

/** 形状屋物品。颜色和形状是独立字段，判题不看文件名 */
export interface ShapeItem {
  id: string
  art: string
  label: string
  color?: string
  shape?: string
  /** 为 true 时必须放对才过关 */
  required: boolean
}

/** 投放筐的规则：写了的字段全部满足才算对 */
export interface AcceptRule {
  itemId?: string
  color?: string
  shape?: string
}

export interface ShapeBin {
  id: string
  art: string
  label: string
  rule: AcceptRule
}

export interface ShapeLevel extends LevelBase {
  gameId: 'shape'
  /** sort 拖进筐里；pick 点选唯一答案 */
  mode: 'sort' | 'pick'
  items: ShapeItem[]
  bins: ShapeBin[]
  /** pick 模式的与条件，例如又红又圆 */
  pickRule?: AcceptRule
  /** 对照物，例如黄色小鸭 */
  sample?: { art: string; color?: string; label: string }
  /** 重玩时轮换目标形状，每一轮仍然只有一个答案 */
  rotateShapes?: Array<'circle' | 'square' | 'triangle'>
}

export interface PuzzlePiece {
  id: string
  /** 正确槽位；干扰片留空 */
  slotId: string
  art: string
  label: string
}

export interface PuzzleSlot {
  id: string
  expectedPieceId: string
  label: string
  /** 已经放好、不能再拖的部分，例如狮子头 */
  prefill?: { art: string; label: string }
}

export type PuzzleScene =
  | 'cat'
  | 'rabbit'
  | 'bear'
  | 'car'
  | 'lion'
  | 'fish'
  | 'cow'
  | 'farm'
  | 'shadow'
  | 'rocket'

export interface PuzzleLevel extends LevelBase {
  gameId: 'puzzle'
  scene: PuzzleScene
  layout: 'col' | 'row' | 'grid'
  pieces: PuzzlePiece[]
  slots: PuzzleSlot[]
  /** 农场关始终显示淡色底图 */
  alwaysGhost?: boolean
}

export interface MatchCard {
  id: string
  pairId: string
  art: string
  label: string
  side?: 'left' | 'right'
  sound?: 'cat' | 'duck' | 'cow'
  shadow?: boolean
}

export type MatchMode = 'choose' | 'links' | 'faceup' | 'sound' | 'memory'

export interface MatchingLevel extends LevelBase {
  gameId: 'matching'
  mode: MatchMode
  prompt?: MatchCard
  cards: MatchCard[]
  /** 需要完成的配对数 */
  pairsNeeded: number
  /** 翻牌前展示正面的时间，0 表示不展示 */
  previewMs?: number
  /** 听声音关的轮换答案，每次只有一个正确动物 */
  soundOrder?: Array<'cat' | 'duck' | 'cow'>
}

export interface CountGroup {
  id: string
  count: number
  art: string
  label: string
}

export interface CountAnimal {
  id: string
  art: string
  label: string
  need: number
}

export interface CountStep {
  id: string
  title: string
  voice: string
  art: string
  label: string
  need: number
  supply: number
  supplyArt: string
  supplyLabel: string
}

export type CountMode = 'fill' | 'tap' | 'which' | 'each' | 'slots' | 'collect' | 'steps'

export interface CountingLevel extends LevelBase {
  gameId: 'counting'
  mode: CountMode
  target?: number
  supply?: number
  supplyArt?: string
  supplyLabel?: string
  heroArt?: string
  heroLabel?: string
  groups?: CountGroup[]
  answerGroupId?: string
  /** 对照数量，例如“和这边一样多” */
  sampleCount?: number
  sampleArt?: string
  animals?: CountAnimal[]
  foodArt?: string
  foodLabel?: string
  slots?: CountGroup[]
  starCount?: number
  steps?: CountStep[]
  /** 放多了时说的话 */
  overflowText?: string
}

export interface LifeOption {
  id: string
  art: string
  label: string
  correct?: boolean
  /** 排序时的正确位置，从 0 开始 */
  order?: number
}

export interface LifeBin {
  id: string
  art: string
  label: string
}

export interface LifeItem {
  id: string
  art: string
  label: string
  binId: string
}

export type LifeMode = 'drag' | 'pick' | 'tidy' | 'tap-order' | 'sort-slots'

export interface LifeLevel extends LevelBase {
  gameId: 'life'
  mode: LifeMode
  scene: 'bath' | 'wash' | 'toys' | 'lunch' | 'rain' | 'cold' | 'bed' | 'trash' | 'out'
  tool?: LifeOption
  targetLabel?: string
  options?: LifeOption[]
  items?: LifeItem[]
  bins?: LifeBin[]
  /** 点选顺序的正确 id 列表 */
  orderIds?: string[]
  /** 每一步做对后接着说的话 */
  stepVoices?: string[]
}

export interface LogicChoice {
  id: string
  art: string
  label: string
  color?: string
  shape?: string
  size?: 's' | 'm' | 'l'
  correct?: boolean
}

export interface LogicNode {
  id: string
  x: number
  y: number
  next?: string
  /** 从本节点岔出去的小路，走了会退回 */
  side?: string
  /** 岔路尽头，点了会轻轻退回，不算失败 */
  dead?: boolean
  goal?: boolean
}

export interface LogicQuestStep {
  type: 'pick' | 'pattern' | 'path'
  voice: string
  choices?: LogicChoice[]
  pattern?: Array<{ art: string; color?: string }>
  options?: LogicChoice[]
  answerId?: string
}

export type LogicMode = 'pick' | 'sizes' | 'lineup' | 'pattern' | 'missing' | 'path' | 'move' | 'quest'

export interface LogicLevel extends LevelBase {
  gameId: 'logic'
  mode: LogicMode
  /** 找一样时摆在上面给孩子对照的样子 */
  sample?: LogicChoice
  choices?: LogicChoice[]
  items?: LogicChoice[]
  pattern?: Array<{ art: string; color?: string; shape?: string }>
  options?: LogicChoice[]
  answerId?: string
  nodes?: LogicNode[]
  quest?: LogicQuestStep[]
}

export type Level =
  | ShapeLevel
  | PuzzleLevel
  | MatchingLevel
  | CountingLevel
  | LifeLevel
  | LogicLevel

/** 存在本机的进度。不包含姓名、生日等个人信息 */
export interface GameProgress {
  completedLevelIds: string[]
  /** 每个游戏已解锁到第几关（含） */
  unlockedLevelByGame: Record<GameId, number>
  stars: number
  lastGameId?: GameId
  lastLevelId?: string
  soundEnabled: boolean
  voiceEnabled: boolean
  /** 翻牌关开始时是否先看一眼正面 */
  memoryPreview: boolean
}
