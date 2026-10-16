<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AcceptRule, ShapeItem, ShapeLevel } from '../types'
import { matchRule } from '../rules'
import { hitZones, useDrag } from '../composables/useDrag'
import { useRound } from '../composables/useRound'
import { shuffle } from '../utils'
import Picture from '../components/art/Picture.vue'

const props = defineProps<{ level: ShapeLevel; assistTick: number; attempt: number }>()
const emit = defineEmits<{ wrong: []; right: []; complete: [] }>()

/** 这一轮要找的形状或颜色规则 */
const activeRule = computed<AcceptRule | undefined>(() => {
  if (props.level.rotateShapes?.length) {
    const shape = props.level.rotateShapes[props.attempt % props.level.rotateShapes.length]
    return { shape }
  }
  return props.level.pickRule
})

const root = ref<HTMLElement | null>(null)
const { ghost, ghostStyle, start } = useDrag()
const { assist, finished, wrong, right, complete } = useRound(emit, () => props.assistTick)
const selected = ref<string | null>(null)
const placed = ref<Record<string, string>>({})
const shaken = ref('')
const tray = ref(shuffle(props.level.items))

const ghostItem = computed(() => props.level.items.find((item) => item.id === ghost.value?.id))
const needCount = computed(() => props.level.items.filter((item) => item.required).length)
const doneCount = computed(() => props.level.items.filter((item) => item.required && placed.value[item.id]).length)

/**
 * 某个筐里已经放好的物品。
 * @param binId 筐的 id
 */
function itemsIn(binId: string): ShapeItem[] {
  return props.level.items.filter((item) => placed.value[item.id] === binId)
}

/**
 * 提示时，下一个该进这个筐。
 * @param binRule 筐的规则
 */
function binHot(binRule: AcceptRule): boolean {
  if (!assist.value) return false
  const next = props.level.items.find((item) => item.required && !placed.value[item.id])
  return !!next && matchRule(next, binRule)
}

/**
 * 把物品放进筐。规则不符就送回去。
 * @param item 物品
 * @param binId 筐
 */
function tryPlace(item: ShapeItem, binId: string): void {
  if (finished.value || placed.value[item.id]) return
  const bin = props.level.bins.find((one) => one.id === binId)
  if (!bin || !matchRule(item, bin.rule)) {
    shaken.value = binId
    window.setTimeout(() => { if (shaken.value === binId) shaken.value = '' }, 450)
    wrong()
    return
  }
  placed.value = { ...placed.value, [item.id]: binId }
  selected.value = null
  const allIn = props.level.items.filter((it) => it.required).every((it) => {
    const home = props.level.bins.find((b) => b.id === placed.value[it.id])
    return !!home && matchRule(it, home.rule)
  })
  if (allIn) complete()
  else right()
}

/**
 * 点选唯一答案。
 * @param item 被点的物品
 */
function pick(item: ShapeItem): void {
  if (finished.value || !activeRule.value) return
  if (!matchRule(item, activeRule.value)) {
    shaken.value = item.id
    window.setTimeout(() => { if (shaken.value === item.id) shaken.value = '' }, 450)
    wrong()
    return
  }
  selected.value = item.id
  complete()
}

/**
 * 按下物品：拖到筐上，或轻点选中。
 * @param event 指针
 * @param item 物品
 */
function onDown(event: PointerEvent, item: ShapeItem): void {
  if (finished.value || placed.value[item.id]) return
  start(event, item.id, (result) => {
    if (!result) return
    if (!result.moved) {
      if (props.level.mode === 'pick') pick(item)
      else selected.value = selected.value === item.id ? null : item.id
      return
    }
    if (props.level.mode !== 'sort') return
    const binId = hitZones(root.value, result.x, result.y)
    if (binId) tryPlace(item, binId)
  })
}

/**
 * 先点物品再点筐。
 * @param binId 筐
 */
function onBin(binId: string): void {
  if (ghost.value || !selected.value) return
  const item = props.level.items.find((one) => one.id === selected.value)
  if (item) tryPlace(item, binId)
}
</script>

<template>
  <div ref="root" class="shape">
    <!-- 目标：对照图或形状轮廓 -->
    <div v-if="level.mode === 'pick'" class="goal">
      <div v-if="level.sample" class="goal-card">
        <Picture :name="level.sample.art" :color="level.sample.color" />
      </div>
      <div v-else-if="level.pickRule?.color && level.pickRule?.shape" class="goal-card dual">
        <i class="swatch" :class="level.pickRule.color" />
        <Picture :name="level.pickRule.shape" color="gray" />
      </div>
      <div v-else-if="activeRule?.shape" class="goal-card">
        <Picture :name="activeRule.shape" color="yellow" />
      </div>
    </div>

    <!-- 分类筐 -->
    <div v-else class="bins">
      <div
        v-for="bin in level.bins"
        :key="bin.id"
        class="bin"
        :class="[bin.rule.color, { shake: shaken === bin.id, 'hint-glow': binHot(bin.rule) }]"
        :data-drop-id="bin.id"
        role="button"
        tabindex="0"
        :aria-label="bin.label"
        @pointerup="onBin(bin.id)"
      >
        <Picture :name="bin.art" :color="bin.rule.color || 'yellow'" />
        <div class="inside">
          <div v-for="item in itemsIn(bin.id)" :key="item.id" class="mini pop">
            <Picture :name="item.art" :color="item.color" :size="item.shape ? 'm' : 'm'" />
          </div>
        </div>
      </div>
    </div>

    <p v-if="level.mode === 'sort' && needCount > 1" class="count">放好了 {{ doneCount }} / {{ needCount }}</p>

    <!-- 可以拖或点的物品 -->
    <div class="tray">
      <button
        v-for="item in tray"
        v-show="!placed[item.id]"
        :key="item.id"
        class="piece"
        :class="{ selected: selected === item.id, 'is-hidden': ghost?.id === item.id, shake: shaken === item.id, 'hint-glow': level.mode === 'pick' && assist && activeRule && matchRule(item, activeRule) }"
        :aria-label="item.label"
        @pointerdown.prevent="onDown($event, item)"
      >
        <Picture :name="item.art" :color="item.color" :size="item.art === 'ball' || item.art.startsWith('block') ? 'm' : 'm'" />
      </button>
    </div>

    <div v-if="ghostItem" class="drag-ghost" :style="ghostStyle">
      <Picture :name="ghostItem.art" :color="ghostItem.color" />
    </div>
  </div>
</template>

<style scoped>
.shape { height: 100%; display: flex; flex-direction: column; gap: 8px; padding: 4px 12px 8px; min-height: 0; }
.goal { display: flex; justify-content: center; }
.goal-card {
  width: 120px; height: 120px; background: rgba(255,255,255,.9); border-radius: 28px;
  box-shadow: var(--shadow); padding: 10px;
}
.goal-card.dual { display: flex; align-items: center; gap: 4px; }
.swatch { width: 28px; height: 28px; border-radius: 50%; border: 3px solid #4a5568; flex: none; }
.swatch.red { background: #ff5a6a; }
.swatch.blue { background: #4c8dff; }
.swatch.yellow { background: #ffd23f; }
.bins { display: flex; gap: 10px; flex: 1; min-height: 0; }
.bin {
  flex: 1; min-height: 150px; border-radius: 24px; background: rgba(255,255,255,.88);
  box-shadow: var(--shadow); position: relative; padding: 8px; display: flex; flex-direction: column;
}
.bin.red { background: #ffe8ec; }
.bin.blue { background: #e7f0ff; }
.bin.yellow { background: #fff6d4; }
.bin.green { background: #e5f8ec; }
.bin :deep(.wrap) { height: 96px; }
.inside { display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; }
.mini { width: 48px; height: 48px; }
.count { margin: 0; text-align: center; font-weight: 800; color: #5d6b7e; }
.tray { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; padding-bottom: 4px; }
.piece { width: 96px; height: 96px; padding: 8px; }
</style>
