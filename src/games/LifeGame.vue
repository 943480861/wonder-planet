<script setup lang="ts">
import { computed, ref } from 'vue'
import type { LifeLevel, LifeOption } from '../types'
import { hitZones, useDrag } from '../composables/useDrag'
import { useRound } from '../composables/useRound'
import { shuffle } from '../utils'
import Picture from '../components/art/Picture.vue'
import Dots from '../components/art/Dots.vue'
import StarBear from '../components/art/StarBear.vue'

const props = defineProps<{ level: LifeLevel; assistTick: number; attempt: number }>()
const emit = defineEmits<{ wrong: []; right: []; complete: []; instruction: [text: string] }>()

const root = ref<HTMLElement | null>(null)
const { ghost, ghostStyle, start } = useDrag()
const { assist, finished, wrong, right, complete } = useRound(emit, () => props.assistTick)
const selected = ref<string | null>(null)
const acting = ref(false)
const worn = ref(false)
const step = ref(0)
const doneIds = ref<string[]>([])
const slotOf = ref<Record<number, string>>({})
const binOf = ref<Record<string, string>>({})
const cards = ref(shuffle(props.level.options ?? []))
const things = ref(shuffle(props.level.items ?? []))

const dragItems = computed(() => {
  const list: LifeOption[] = []
  if (props.level.tool) list.push(props.level.tool)
  if (props.level.mode === 'drag') list.push(...(props.level.options ?? []))
  return list
})
const ghostArt = computed(() => {
  const id = ghost.value?.id
  const found = dragItems.value.find((item) => item.id === id) || cards.value.find((item) => item.id === id) || things.value.find((item) => item.id === id)
  return found?.art
})

/**
 * 牙刷或衣服放到小熊身上。别的东西会轻轻退回。
 * @param id 物品
 */
function dropOnBear(id: string): void {
  if (finished.value) return
  if (props.level.tool?.id !== id) {
    wrong()
    return
  }
  acting.value = true
  worn.value = true
  if (props.level.scene === 'bath') complete(1700)
  else complete(700)
}

/**
 * 点选唯一正确的物品。
 * @param option 物品
 */
function pick(option: LifeOption): void {
  if (finished.value) return
  if (option.correct) complete()
  else wrong()
}

/**
 * 按顺序点下一张图。
 * @param option 图卡
 */
function tapNext(option: LifeOption): void {
  if (finished.value || doneIds.value.includes(option.id)) return
  const expect = props.level.orderIds?.[step.value]
  if (option.id !== expect) {
    wrong()
    return
  }
  doneIds.value = [...doneIds.value, option.id]
  step.value += 1
  const voice = props.level.stepVoices?.[step.value]
  if (voice) emit('instruction', voice)
  if (step.value >= (props.level.orderIds?.length ?? 0)) complete()
  else right()
}

/**
 * 把步骤卡放进对应的点点格。
 * @param option 图卡
 * @param index 格子序号
 */
function sortInto(option: LifeOption, index: number): void {
  if (finished.value || slotOf.value[index]) return
  if (option.order !== index) {
    wrong()
    return
  }
  slotOf.value = { ...slotOf.value, [index]: option.id }
  const voice = props.level.stepVoices?.[index + 1]
  if (voice) emit('instruction', voice)
  if (Object.keys(slotOf.value).length >= cards.value.length) complete()
  else right()
}

/**
 * 玩具或垃圾放进对应的箱子。
 * @param itemId 物品
 * @param binId 箱子
 */
function tidy(itemId: string, binId: string): void {
  if (finished.value || binOf.value[itemId]) return
  const item = props.level.items?.find((one) => one.id === itemId)
  if (!item || item.binId !== binId) {
    wrong()
    return
  }
  binOf.value = { ...binOf.value, [itemId]: binId }
  const all = (props.level.items ?? []).every((one) => binOf.value[one.id] === one.binId)
  if (all) complete()
  else right()
}

/**
 * 拖动。没拖动就当成选中，再点目标。
 * @param event 指针
 * @param id 物品
 */
function onDown(event: PointerEvent, id: string): void {
  if (finished.value) return
  start(event, id, (result) => {
    if (!result) return
    if (!result.moved) {
      selected.value = selected.value === id ? null : id
      return
    }
    const zone = hitZones(root.value, result.x, result.y)
    if (!zone) return
    if (props.level.mode === 'drag' && zone === 'bear') dropOnBear(id)
    if (props.level.mode === 'tidy') tidy(id, zone)
    if (props.level.mode === 'sort-slots') {
      const card = cards.value.find((item) => item.id === id)
      if (card) sortInto(card, Number(zone))
    }
  })
}

/**
 * 点一下目标，放下已经选中的东西。
 * @param zone 目标
 */
function onZone(zone: string): void {
  if (ghost.value || !selected.value) return
  const id = selected.value
  selected.value = null
  if (props.level.mode === 'drag') dropOnBear(id)
  if (props.level.mode === 'tidy') tidy(id, zone)
  if (props.level.mode === 'sort-slots') {
    const card = cards.value.find((item) => item.id === id)
    if (card) sortInto(card, Number(zone))
  }
}
</script>

<template>
  <div ref="root" class="life" :class="level.scene">
    <!-- 小熊场景：刷牙或穿衣 -->
    <div v-if="level.mode === 'drag'" class="stage-bear" data-drop-id="bear" @pointerup="onZone('bear')">
      <div v-if="level.scene === 'bath'" class="sink" aria-hidden="true" />
      <StarBear :mood="worn ? 'cheer' : 'happy'" :size="150" />
      <div v-if="acting && level.scene === 'bath'" class="brush brushing"><Picture name="toothbrush" /></div>
      <div v-if="worn && level.scene === 'cold'" class="coat-on"><Picture name="coat" /></div>
      <p v-if="level.scene === 'rain'" class="rain" aria-hidden="true" />
    </div>

    <!-- 点选 -->
    <div v-else-if="level.mode === 'pick'" class="pick">
      <div class="mascot">
        <Picture v-if="level.scene === 'lunch'" name="rabbit" />
      </div>
      <div v-if="level.scene === 'rain'" class="drops" aria-hidden="true" />
      <div class="tray">
        <button
          v-for="option in level.options"
          :key="option.id"
          class="piece"
          :class="{ 'hint-glow': assist && option.correct }"
          :aria-label="option.label"
          @click="pick(option)"
        >
          <Picture :name="option.art" />
        </button>
      </div>
    </div>

    <!-- 按顺序点 -->
    <div v-else-if="level.mode === 'tap-order'" class="order">
      <div class="done">
        <div v-for="id in doneIds" :key="id" class="mini pop">
          <Picture :name="cards.find(card => card.id === id)?.art || 'star'" />
        </div>
      </div>
      <div class="tray">
        <button
          v-for="option in cards"
          v-show="!doneIds.includes(option.id)"
          :key="option.id"
          class="piece"
          :class="{ 'hint-glow': assist && option.id === level.orderIds?.[step] }"
          :aria-label="option.label"
          @click="tapNext(option)"
        >
          <Picture :name="option.art" />
        </button>
      </div>
    </div>

    <!-- 放进点点格 -->
    <template v-else-if="level.mode === 'sort-slots'">
      <div class="slots">
        <div
          v-for="(option, index) in cards"
          :key="option.id"
          class="slot"
          :data-drop-id="slotOf[index] ? undefined : String(index)"
          :class="{ 'hint-glow': assist && !slotOf[index] }"
          @pointerup="onZone(String(index))"
        >
          <Dots :n="index + 1" />
          <div v-if="slotOf[index]" class="mini pop">
            <Picture :name="cards.find(card => card.id === slotOf[index])?.art || 'star'" />
          </div>
        </div>
      </div>
      <div class="tray">
        <button
          v-for="option in cards"
          v-show="!Object.values(slotOf).includes(option.id)"
          :key="option.id"
          class="piece"
          :class="{ selected: selected === option.id, 'is-hidden': ghost?.id === option.id }"
          :aria-label="option.label"
          @pointerdown.prevent="onDown($event, option.id)"
        >
          <Picture :name="option.art" />
        </button>
      </div>
    </template>

    <!-- 收进箱子 -->
    <template v-else>
      <div class="bins">
        <div
          v-for="bin in level.bins"
          :key="bin.id"
          class="bin"
          :data-drop-id="bin.id"
          :class="{ 'hint-glow': assist }"
          @pointerup="onZone(bin.id)"
        >
          <Picture :name="bin.art" />
          <div class="inside">
            <div v-for="item in things.filter(thing => binOf[thing.id] === bin.id)" :key="item.id" class="mini pop">
              <Picture :name="item.art" :color="item.art === 'ball' ? 'red' : 'orange'" />
            </div>
          </div>
        </div>
      </div>
      <div class="tray">
        <button
          v-for="item in things"
          v-show="!binOf[item.id]"
          :key="item.id"
          class="piece"
          :class="{ selected: selected === item.id, 'is-hidden': ghost?.id === item.id }"
          :aria-label="item.label"
          @pointerdown.prevent="onDown($event, item.id)"
        >
          <Picture :name="item.art" :color="item.art === 'ball' ? 'red' : 'orange'" />
        </button>
      </div>
    </template>

    <div v-if="level.mode === 'drag'" class="tray">
      <button
        v-for="item in dragItems"
        v-show="!(worn && item.id === level.tool?.id)"
        :key="item.id"
        class="piece"
        :class="{ selected: selected === item.id, 'is-hidden': ghost?.id === item.id, 'hint-glow': assist && item.id === level.tool?.id }"
        :aria-label="item.label"
        @pointerdown.prevent="onDown($event, item.id)"
      >
        <Picture :name="item.art" />
      </button>
      <div v-if="level.scene === 'bath'" class="piece decoration" aria-hidden="true"><Picture name="cup" /></div>
    </div>

    <div v-if="ghostArt" class="drag-ghost" :style="ghostStyle">
      <Picture :name="ghostArt" />
    </div>
  </div>
</template>

<style scoped>
.life { height: 100%; display: flex; flex-direction: column; gap: 8px; padding: 0 12px 8px; min-height: 0; }
.stage-bear {
  flex: 1; min-height: 180px; display: grid; place-items: center; position: relative;
  background: rgba(255,255,255,.45); border-radius: 28px;
}
.bath { }
.sink {
  position: absolute; bottom: 16px; width: 140px; height: 36px; border-radius: 0 0 20px 20px;
  background: #d7eefb; border: 3px solid #4a5568;
}
.brush { position: absolute; width: 72px; height: 72px; top: 42%; }
.brushing { animation: brush .28s linear infinite; }
.coat-on { position: absolute; width: 90px; height: 90px; top: 46%; }
.drops { height: 28px; background: radial-gradient(circle, #7ec8f0 3px, transparent 4px); background-size: 18px 14px; }
.tray, .pick .tray { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.piece { width: 96px; height: 96px; padding: 8px; }
.decoration { pointer-events: none; }
.mascot { width: 120px; height: 120px; margin: 0 auto; }
.done, .slots, .bins { display: flex; gap: 8px; justify-content: center; min-height: 72px; }
.slot, .bin {
  flex: 1; min-height: 110px; background: rgba(255,255,255,.88); border-radius: 20px; padding: 6px;
  box-shadow: var(--shadow);
}
.inside { display: flex; gap: 4px; flex-wrap: wrap; justify-content: center; }
.mini { width: 48px; height: 48px; }
.order, .pick { display: flex; flex-direction: column; gap: 10px; flex: 1; }
@keyframes brush { 50% { transform: translateX(10px) rotate(-8deg); } }
</style>
