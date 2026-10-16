<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { GameId, ShapeLevel } from '../types'
import { getLevel } from '../levels'
import { useProgress } from '../progress'
import { playDing, playSoft, playSuccess, speak, stopSpeak } from '../audio'
import GameShell from '../components/GameShell.vue'
import ShapeGame from '../games/ShapeGame.vue'
import PuzzleGame from '../games/PuzzleGame.vue'
import MatchingGame from '../games/MatchingGame.vue'
import CountingGame from '../games/CountingGame.vue'
import LifeGame from '../games/LifeGame.vue'
import LogicGame from '../games/LogicGame.vue'

const route = useRoute()
const router = useRouter()
const progress = useProgress()
const round = ref(0)
const assistTick = ref(0)
const toast = ref('')
const success = ref(false)
const override = ref('')
let toastTimer = 0

const gameId = computed(() => String(route.params.gameId) as GameId)
const index = computed(() => Number(route.params.level))
const level = computed(() => getLevel(gameId.value, index.value))
const shapeLevel = computed(() => (level.value?.gameId === 'shape' ? level.value : null))
const puzzleLevel = computed(() => (level.value?.gameId === 'puzzle' ? level.value : null))
const matchingLevel = computed(() => (level.value?.gameId === 'matching' ? level.value : null))
const countingLevel = computed(() => (level.value?.gameId === 'counting' ? level.value : null))
const lifeLevel = computed(() => (level.value?.gameId === 'life' ? level.value : null))
const logicLevel = computed(() => (level.value?.gameId === 'logic' ? level.value : null))

/**
 * 形状第 8 关会轮换要找的形状，每一轮仍然只有一个答案。
 * @param current 形状关
 * @param attempt 第几次重玩
 */
function shapeLine(current: ShapeLevel, attempt: number): string {
  if (!current.rotateShapes?.length) return current.instructionText
  const shape = current.rotateShapes[attempt % current.rotateShapes.length]
  const word = shape === 'circle' ? '圆形' : shape === 'square' ? '方形' : '三角形'
  return `请把${word}送给星星！`
}

const instruction = computed(() => {
  if (override.value) return override.value
  if (shapeLevel.value) return shapeLine(shapeLevel.value, round.value)
  return level.value?.instructionText ?? ''
})

watch(instruction, (text) => {
  if (text) speak(text)
}, { immediate: true })

watch(() => route.fullPath, () => {
  round.value = 0
  assistTick.value = 0
  success.value = false
  override.value = ''
  toast.value = ''
  const current = level.value
  if (!current) {
    router.replace('/')
    return
  }
  if (!progress.isUnlocked(current.gameId, current.index)) router.replace(`/game/${current.gameId}`)
  else progress.remember(current)
}, { immediate: true })

/**
 * 短暂显示一句反馈。
 * @param text 给孩子看的话
 */
function showToast(text: string): void {
  toast.value = text
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => { toast.value = '' }, 1500)
}

/** 放错了：温和提醒，不扣星星 */
function onWrong(): void {
  playSoft()
  showToast('没关系，再试一次。')
  speak('没关系，我们再试一次。')
}

/** 做对一步 */
function onRight(): void {
  playDing()
  showToast('太棒啦！')
  speak('太棒啦！')
}

/**
 * 数量多了、或小路走不通时的提醒。不算失败。
 * @param text 要说的话
 */
function onNote(text: string): void {
  showToast(text)
  speak(text)
}

/**
 * 关卡中途换一句任务，比如寻宝的下一步。
 * @param text 新的一句话
 */
function onInstruction(text: string): void {
  override.value = text
}

/** 过关：第一次才加星星 */
function onComplete(): void {
  if (!level.value || success.value) return
  success.value = true
  progress.completeLevel(level.value)
  playSuccess()
  speak('这一关完成啦！你帮助了小伙伴！')
}

/** 只重来这一关，不清除别的记录 */
function onRestart(): void {
  stopSpeak()
  success.value = false
  override.value = ''
  toast.value = ''
  round.value += 1
}

/** 再听当前这句话 */
function onReplay(): void {
  speak(instruction.value)
}

/** 下一关。最后一关回到首页。 */
function onNext(): void {
  if (!level.value) return
  if (level.value.index >= 10) router.push('/')
  else router.push(`/play/${level.value.gameId}/${level.value.index + 1}`)
}
</script>

<template>
  <div v-if="!level" class="page missing">
    <p>有个小伙伴还没准备好</p>
    <button class="btn btn-primary" type="button" @click="router.push('/')">返回首页</button>
  </div>
  <GameShell
    v-else
    :level="level"
    :instruction="instruction"
    :toast="toast"
    :success="success"
    @hint="assistTick++"
    @restart="onRestart"
    @home="router.push('/')"
    @next="onNext"
    @replay="onReplay"
  >
    <ShapeGame
      v-if="shapeLevel"
      :key="`${shapeLevel.id}-${round}`"
      :level="shapeLevel"
      :attempt="round"
      :assist-tick="assistTick"
      @wrong="onWrong"
      @right="onRight"
      @complete="onComplete"
    />
    <PuzzleGame
      v-else-if="puzzleLevel"
      :key="`${puzzleLevel.id}-${round}`"
      :level="puzzleLevel"
      :attempt="round"
      :assist-tick="assistTick"
      @wrong="onWrong"
      @right="onRight"
      @complete="onComplete"
    />
    <MatchingGame
      v-else-if="matchingLevel"
      :key="`${matchingLevel.id}-${round}`"
      :level="matchingLevel"
      :attempt="round"
      :assist-tick="assistTick"
      @wrong="onWrong"
      @right="onRight"
      @complete="onComplete"
      @note="onNote"
    />
    <CountingGame
      v-else-if="countingLevel"
      :key="`${countingLevel.id}-${round}`"
      :level="countingLevel"
      :attempt="round"
      :assist-tick="assistTick"
      @wrong="onWrong"
      @right="onRight"
      @complete="onComplete"
      @note="onNote"
      @instruction="onInstruction"
    />
    <LifeGame
      v-else-if="lifeLevel"
      :key="`${lifeLevel.id}-${round}`"
      :level="lifeLevel"
      :attempt="round"
      :assist-tick="assistTick"
      @wrong="onWrong"
      @right="onRight"
      @complete="onComplete"
      @instruction="onInstruction"
    />
    <LogicGame
      v-else
      :key="`${logicLevel?.id}-${round}`"
      :level="logicLevel!"
      :attempt="round"
      :assist-tick="assistTick"
      @wrong="onWrong"
      @right="onRight"
      @complete="onComplete"
      @note="onNote"
      @instruction="onInstruction"
    />
  </GameShell>
</template>

<style scoped>
.missing { display: grid; place-items: center; gap: 12px; text-align: center; font-size: 20px; font-weight: 800; }
</style>
