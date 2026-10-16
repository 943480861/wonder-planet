<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { PuzzleLevel, PuzzlePiece } from '../types'
import { hitZones, useDrag } from '../composables/useDrag'
import { useRound } from '../composables/useRound'
import { shuffle } from '../utils'
import PuzzleArt from '../components/art/PuzzleArt.vue'

const props = defineProps<{ level: PuzzleLevel; assistTick: number; attempt: number }>()
const emit = defineEmits<{ wrong: []; right: []; complete: [] }>()

const root = ref<HTMLElement | null>(null)
const { ghost, ghostStyle, start } = useDrag()
const { assist, finished, wrong, right, complete } = useRound(emit, () => props.assistTick)
const placed = ref<Record<string, string>>({})
const selected = ref<string | null>(null)
const shaken = ref('')
const preview = ref(true)
const launching = ref(false)
const order = ref(shuffle(props.level.pieces))

const ghostPiece = computed(() => props.level.pieces.find((piece) => piece.id === ghost.value?.id))
const tray = computed(() => order.value.filter((piece) => !Object.values(placed.value).includes(piece.id)))

onMounted(() => {
  window.setTimeout(() => { preview.value = false }, 1800)
})

/**
 * 槽位上应该画哪一块。
 * @param slotId 槽位
 * @param expected 期望的拼片 id
 */
function artOf(slotId: string, expected: string): string {
  const id = placed.value[slotId] || expected
  return props.level.pieces.find((piece) => piece.id === id)?.art || expected
}

/**
 * 拼片放进槽位。必须 id 对上，不能只靠挨得近。
 * @param piece 拼片
 * @param slotId 槽位
 */
function tryPlace(piece: PuzzlePiece, slotId: string): void {
  if (finished.value || !piece.slotId) {
    if (!piece.slotId) {
      shaken.value = slotId
      wrong()
    }
    return
  }
  const slot = props.level.slots.find((one) => one.id === slotId)
  if (!slot || slot.prefill) return
  if (piece.id !== slot.expectedPieceId) {
    shaken.value = slotId
    window.setTimeout(() => { if (shaken.value === slotId) shaken.value = '' }, 450)
    wrong()
    return
  }
  placed.value = { ...placed.value, [slotId]: piece.id }
  selected.value = null
  const needed = props.level.slots.filter((one) => !one.prefill)
  const done = needed.every((one) => placed.value[one.id] === one.expectedPieceId)
  if (!done) {
    right()
    return
  }
  if (props.level.scene === 'rocket') {
    launching.value = true
    complete(1400)
  } else {
    complete()
  }
}

/**
 * 拖动拼片，或轻点后选中。
 * @param event 指针
 * @param piece 拼片
 */
function onDown(event: PointerEvent, piece: PuzzlePiece): void {
  if (finished.value) return
  start(event, piece.id, (result) => {
    if (!result) return
    if (!result.moved) {
      selected.value = selected.value === piece.id ? null : piece.id
      return
    }
    const slotId = hitZones(root.value, result.x, result.y)
    if (slotId) tryPlace(piece, slotId)
  })
}

/**
 * 先点拼片，再点空位。
 * @param slotId 槽位
 */
function onSlot(slotId: string): void {
  if (ghost.value || !selected.value) return
  const piece = props.level.pieces.find((one) => one.id === selected.value)
  if (piece) tryPlace(piece, slotId)
}

/** 再看一眼完整图片 */
function showFull(): void {
  preview.value = true
  window.setTimeout(() => { preview.value = false }, 1600)
}
</script>

<template>
  <div ref="root" class="puzzle">
    <button class="btn btn-ghost look" type="button" @click="showFull">看完整图片</button>
    <!-- 拼图板 -->
    <div class="board" :class="[level.layout, { launch: launching }]">
      <div
        v-for="slot in level.slots"
        :key="slot.id"
        class="slot"
        :class="{ shake: shaken === slot.id, 'hint-glow': assist && !placed[slot.id] && !slot.prefill }"
        :data-drop-id="placed[slot.id] || slot.prefill ? undefined : slot.id"
        :aria-label="slot.label"
        @pointerup="onSlot(slot.id)"
      >
        <PuzzleArt
          v-if="slot.prefill || placed[slot.id]"
          :scene="level.scene"
          :part="slot.prefill?.art || artOf(slot.id, slot.expectedPieceId)"
        />
        <PuzzleArt
          v-else-if="level.alwaysGhost || assist"
          class="ghost"
          :scene="level.scene"
          :part="artOf(slot.id, slot.expectedPieceId)"
        />
      </div>
      <!-- 开场先看完整的样子 -->
      <div v-if="preview" class="preview" :class="level.layout">
        <div v-for="slot in level.slots" :key="slot.id" class="slot">
          <PuzzleArt :scene="level.scene" :part="slot.prefill?.art || artOf(slot.id, slot.expectedPieceId)" />
        </div>
      </div>
    </div>
    <!-- 下方托盘 -->
    <div class="tray">
      <button
        v-for="piece in tray"
        :key="piece.id"
        class="piece"
        :class="{ selected: selected === piece.id, 'is-hidden': ghost?.id === piece.id }"
        :aria-label="piece.label"
        @pointerdown.prevent="onDown($event, piece)"
      >
        <PuzzleArt :scene="level.scene" :part="piece.art" />
      </button>
    </div>
    <div v-if="ghostPiece" class="drag-ghost" :style="ghostStyle">
      <PuzzleArt :scene="level.scene" :part="ghostPiece.art" />
    </div>
  </div>
</template>

<style scoped>
.puzzle { height: 100%; display: flex; flex-direction: column; gap: 8px; padding: 0 12px 8px; min-height: 0; }
.look { align-self: center; min-height: 42px; font-size: 16px; }
.board {
  position: relative; flex: 1; min-height: 180px; background: #fff; border-radius: 24px;
  overflow: hidden; box-shadow: var(--shadow); display: flex;
}
.board.col { flex-direction: column; }
.board.row { flex-direction: row; }
.board.grid { display: grid; grid-template-columns: 1fr 1fr; }
.slot { flex: 1; min-height: 64px; min-width: 0; position: relative; }
.ghost { opacity: 0.28; }
.preview {
  position: absolute; inset: 0; background: #fff; display: flex; z-index: 2;
}
.preview.col { flex-direction: column; }
.preview.grid { display: grid; grid-template-columns: 1fr 1fr; }
.tray { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
.piece { width: 88px; height: 78px; padding: 4px; overflow: hidden; }
.launch { animation: liftoff 1.3s ease-in forwards; }
@keyframes liftoff { to { transform: translateY(-90px) scale(0.86); } }
</style>
