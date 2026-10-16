<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { MatchCard, MatchingLevel } from '../types'
import { playAnimal } from '../audio'
import { hitZones, useDrag } from '../composables/useDrag'
import { useRound } from '../composables/useRound'
import { useProgress } from '../progress'
import { shuffle } from '../utils'
import Picture from '../components/art/Picture.vue'

const props = defineProps<{ level: MatchingLevel; assistTick: number; attempt: number }>()
const emit = defineEmits<{ wrong: []; right: []; complete: []; note: [text: string] }>()

const root = ref<HTMLElement | null>(null)
const { ghost, ghostStyle, start } = useDrag()
const { assist, finished, wrong, right, complete } = useRound(emit, () => props.assistTick)
const progress = useProgress()
const locked = ref<string[]>([])
const openIds = ref<string[]>([])
const busy = ref(false)
const selected = ref<string | null>(null)
const preview = ref(false)
const heard = ref(false)

const left = ref(shuffle(props.level.cards.filter((card) => card.side === 'left')))
const rightCards = ref(shuffle(props.level.cards.filter((card) => card.side === 'right')))
const board = ref(shuffle(props.level.cards.filter((card) => !card.side)))

const answerSound = computed(() => {
  const order = props.level.soundOrder ?? ['duck']
  return order[props.attempt % order.length]!
})
const ghostCard = computed(() => {
  const id = ghost.value?.id
  if (!id) return undefined
  if (id === props.level.prompt?.id) return props.level.prompt
  return props.level.cards.find((card) => card.id === id)
})

onMounted(() => {
  if (props.level.mode === 'memory' && props.level.previewMs && progress.state.memoryPreview) {
    preview.value = true
    window.setTimeout(() => { preview.value = false }, props.level.previewMs)
  }
})

/**
 * 提示时翻开还没配上的一对，并锁定。不算失败。
 */
function revealPair(): void {
  const groups = new Map<string, MatchCard[]>()
  for (const card of props.level.cards) {
    const list = groups.get(card.pairId) ?? []
    list.push(card)
    groups.set(card.pairId, list)
  }
  for (const cards of groups.values()) {
    if (cards.every((card) => locked.value.includes(card.id))) continue
    locked.value = [...locked.value, ...cards.map((card) => card.id)]
    openIds.value = []
    busy.value = false
    right()
    maybeWin()
    return
  }
}

watch(() => props.assistTick, (n, prev) => {
  if (!n || n === prev) return
  if (props.level.mode === 'memory' || props.level.mode === 'faceup') revealPair()
})

/**
 * 配够了就过关，只触发一次。
 */
function maybeWin(): void {
  const pairs = locked.value.length / 2
  if (pairs >= props.level.pairsNeeded) complete()
}

/**
 * 翻开或点中一张牌。快速连点不会把同一张算两次。
 * @param card 卡片
 */
function flip(card: MatchCard): void {
  if (finished.value || busy.value || preview.value) return
  if (locked.value.includes(card.id) || openIds.value.includes(card.id)) return
  openIds.value = [...openIds.value, card.id]
  if (openIds.value.length < 2) return
  const [a, b] = openIds.value
  const ca = props.level.cards.find((item) => item.id === a)
  const cb = props.level.cards.find((item) => item.id === b)
  busy.value = true
  if (ca && cb && ca.pairId === cb.pairId) {
    locked.value = [...locked.value, ca.id, cb.id]
    openIds.value = []
    busy.value = false
    right()
    maybeWin()
    return
  }
  window.setTimeout(() => {
    openIds.value = []
    busy.value = false
    wrong()
  }, 800)
}

/**
 * 点一张候选，或把目标拖到它上面。
 * @param card 候选卡
 */
function choose(card: MatchCard): void {
  if (finished.value) return
  if (card.pairId === props.level.prompt?.pairId) {
    locked.value = [card.id]
    complete()
  } else {
    wrong()
  }
}

/**
 * 左边和右边 pairId 相同才配上。
 * @param card 右边的卡
 */
function linkRight(card: MatchCard): void {
  if (finished.value || locked.value.includes(card.id)) return
  const leftId = selected.value
  if (!leftId) return
  const leftCard = left.value.find((item) => item.id === leftId)
  if (!leftCard) return
  if (leftCard.pairId === card.pairId) {
    locked.value = [...locked.value, leftCard.id, card.id]
    selected.value = null
    right()
    maybeWin()
  } else {
    selected.value = null
    wrong()
  }
}

/**
 * 听一听当前这只动物。必须是孩子自己点的。
 */
function listen(): void {
  heard.value = true
  playAnimal(answerSound.value)
}

/**
 * 选出和声音一样的动物。
 * @param card 动物卡
 */
function pickSound(card: MatchCard): void {
  if (finished.value) return
  if (card.sound === answerSound.value) complete()
  else wrong()
}

/**
 * 拖动左边或目标卡。
 * @param event 指针
 * @param id 卡片 id
 * @param kind 用来区分玩法
 */
function onDown(event: PointerEvent, id: string, kind: 'prompt' | 'left' | 'choice'): void {
  if (finished.value || locked.value.includes(id)) return
  start(event, id, (result) => {
    if (!result) return
    if (!result.moved) {
      if (kind === 'left') selected.value = selected.value === id ? null : id
      if (kind === 'choice') {
        const card = props.level.cards.find((item) => item.id === id)
        if (card) choose(card)
      }
      return
    }
    const hit = hitZones(root.value, result.x, result.y)
    if (!hit) return
    if (kind === 'prompt' || kind === 'choice') {
      const card = props.level.cards.find((item) => item.id === hit)
      if (card) choose(card)
    }
    if (kind === 'left') {
      selected.value = id
      const card = rightCards.value.find((item) => item.id === hit)
      if (card) linkRight(card)
    }
  })
}

/**
 * 牌面现在该不该翻开。
 * @param card 卡片
 */
function faceUp(card: MatchCard): boolean {
  if (props.level.mode === 'faceup') return true
  return preview.value || locked.value.includes(card.id) || openIds.value.includes(card.id)
}
</script>

<template>
  <div ref="root" class="match">
    <!-- 听声音 -->
    <template v-if="level.mode === 'sound'">
      <button class="btn btn-primary listen" type="button" @click="listen">听一听</button>
      <p v-if="!heard" class="tip">点上面，听听是谁</p>
      <div class="grid">
        <button v-for="card in board" :key="card.id" class="piece tall" :aria-label="card.label" @click="pickSound(card)">
          <Picture :name="card.art" />
        </button>
      </div>
    </template>

    <!-- 看目标，找一样的 -->
    <template v-else-if="level.mode === 'choose' && level.prompt">
      <button
        class="piece prompt"
        :class="{ 'is-hidden': ghost?.id === level.prompt.id, 'hint-glow': assist }"
        :aria-label="level.prompt.label"
        @pointerdown.prevent="onDown($event, level.prompt.id, 'prompt')"
      >
        <Picture :name="level.prompt.art" />
      </button>
      <div class="grid">
        <button
          v-for="card in board"
          :key="card.id"
          class="piece tall"
          :class="{ good: locked.includes(card.id), 'hint-glow': assist && card.pairId === level.prompt.pairId }"
          :data-drop-id="card.id"
          :aria-label="card.label"
          @pointerdown.prevent="onDown($event, card.id, 'choice')"
        >
          <Picture :name="card.art" />
        </button>
      </div>
    </template>

    <!-- 左右配对 -->
    <template v-else-if="level.mode === 'links'">
      <div class="cols">
        <div class="col">
          <button
            v-for="card in left"
            :key="card.id"
            class="piece tall"
            :class="{ selected: selected === card.id, good: locked.includes(card.id), 'is-hidden': ghost?.id === card.id }"
            :aria-label="card.label"
            @pointerdown.prevent="onDown($event, card.id, 'left')"
          >
            <Picture :name="card.art" />
          </button>
        </div>
        <div class="col">
          <button
            v-for="card in rightCards"
            :key="card.id"
            class="piece tall"
            :class="{ good: locked.includes(card.id), 'hint-glow': assist && selected && left.find(item => item.id === selected)?.pairId === card.pairId }"
            :data-drop-id="locked.includes(card.id) ? undefined : card.id"
            :aria-label="card.label"
            @pointerup="!ghost && linkRight(card)"
          >
            <Picture :name="card.art" :shadow="card.shadow" />
          </button>
        </div>
      </div>
    </template>

    <!-- 明牌或翻牌 -->
    <div v-else class="grid" :class="{ eight: board.length > 4 }">
      <button
        v-for="card in board"
        :key="card.id"
        class="card"
        :class="{ up: faceUp(card), locked: locked.includes(card.id), picked: openIds.includes(card.id) }"
        :aria-label="faceUp(card) ? card.label : '盖着的卡片'"
        @click="flip(card)"
      >
        <span class="inner">
          <span class="face back"><Picture name="star" /></span>
          <span class="face front"><Picture :name="card.art" /></span>
        </span>
      </button>
    </div>

    <div v-if="ghostCard" class="drag-ghost" :style="ghostStyle">
      <Picture :name="ghostCard.art" :shadow="ghostCard.shadow" />
    </div>
  </div>
</template>

<style scoped>
.match { height: 100%; display: flex; flex-direction: column; gap: 10px; padding: 0 12px 8px; min-height: 0; }
.listen { align-self: center; min-width: 160px; }
.tip { margin: 0; text-align: center; font-weight: 700; }
.prompt { width: 110px; height: 110px; align-self: center; padding: 8px; }
.grid { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.grid.eight { display: grid; grid-template-columns: repeat(4, 1fr); }
.tall { width: 104px; height: 104px; padding: 8px; }
.cols { flex: 1; display: flex; gap: 12px; min-height: 0; }
.col { flex: 1; display: flex; flex-direction: column; gap: 8px; align-items: center; }
.good, .picked { box-shadow: 0 0 0 4px #ffd23f, var(--shadow); }
.good { box-shadow: 0 0 0 4px #5dca8a, var(--shadow); }
.card {
  width: 100%; aspect-ratio: 1; max-width: 120px; perspective: 600px; border-radius: 18px;
}
.inner { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; transition: transform .45s ease; display: block; }
.card.up .inner, .card.locked .inner { transform: rotateY(180deg); }
.face {
  position: absolute; inset: 0; border-radius: 18px; background: #fff; box-shadow: var(--shadow);
  backface-visibility: hidden; display: grid; place-items: center; padding: 8px;
}
.back { background: #ffe9a8; }
.front { transform: rotateY(180deg); }
</style>
