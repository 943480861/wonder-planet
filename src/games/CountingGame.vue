<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CountingLevel } from '../types'
import { playDing } from '../audio'
import { speak } from '../audio'
import { hitZones, useDrag } from '../composables/useDrag'
import { useRound } from '../composables/useRound'
import Picture from '../components/art/Picture.vue'
import Dots from '../components/art/Dots.vue'

const props = defineProps<{ level: CountingLevel; assistTick: number; attempt: number }>()
const emit = defineEmits<{ wrong: []; right: []; complete: []; note: [text: string]; instruction: [text: string] }>()

const root = ref<HTMLElement | null>(null)
const { ghost, ghostStyle, start } = useDrag()
const { assist, finished, wrong, complete } = useRound(emit, () => props.assistTick)
const stepIndex = ref(0)
const basket = ref<string[]>([])
const selected = ref<string | null>(null)
const tapped = ref<number[]>([])
const held = ref<Record<string, string[]>>({})
const slotHeld = ref<Record<string, string[]>>({})
let timer = 0

const step = computed(() => props.level.steps?.[stepIndex.value])
const target = computed(() => step.value?.need ?? props.level.target ?? 0)
const supplyArt = computed(() => step.value?.supplyArt ?? props.level.supplyArt ?? props.level.foodArt ?? 'apple')
const supplyLabel = computed(() => step.value?.supplyLabel ?? props.level.supplyLabel ?? props.level.foodLabel ?? '东西')
const supplyCount = computed(() => {
  if (step.value) return step.value.supply
  if (props.level.mode === 'each') return (props.level.animals ?? []).reduce((sum, animal) => sum + animal.need, 0)
  if (props.level.mode === 'slots') return (props.level.slots ?? []).reduce((sum, slot) => sum + slot.count, 0)
  return props.level.supply ?? 0
})
const pool = computed(() => {
  const used = new Set<string>([
    ...basket.value,
    ...Object.values(held.value).flat(),
    ...Object.values(slotHeld.value).flat(),
  ])
  return Array.from({ length: supplyCount.value }, (_, i) => `item-${stepIndex.value}-${i}`).filter((id) => !used.has(id))
})
const ghostOn = computed(() => !!ghost.value)

const words = ['', '一', '二', '三', '四', '五', '六']

/**
 * 数量刚好时，稍等一下再过关，方便孩子拿回来。
 * @param ready 是不是已经刚好
 * @param after 过关前还要做的事
 */
function finishIf(ready: boolean, after?: () => void): void {
  window.clearTimeout(timer)
  if (!ready) return
  timer = window.setTimeout(() => {
    if (after) after()
    else complete()
  }, 650)
}

/**
 * 往篮子里放一件。多了就提醒，可以点掉拿回。
 * @param id 物品
 */
function addToBasket(id: string): void {
  if (finished.value || basket.value.includes(id)) return
  if (basket.value.length >= target.value) {
    emit('note', props.level.overflowText || '已经够啦')
    return
  }
  basket.value = [...basket.value, id]
  playDing()
  if (basket.value.length === 1 && target.value === 2) emit('note', '再来一个')
  const goal = target.value
  finishIf(basket.value.length === goal, () => {
    if (basket.value.length !== goal) return
    if (step.value && props.level.steps && stepIndex.value < props.level.steps.length - 1) {
      stepIndex.value += 1
      basket.value = []
      const next = props.level.steps[stepIndex.value]
      if (next) emit('instruction', next.voice)
      return
    }
    complete()
  })
}

/**
 * 从篮子里拿回来。
 * @param id 物品
 */
function removeFromBasket(id: string): void {
  basket.value = basket.value.filter((item) => item !== id)
  window.clearTimeout(timer)
}

/**
 * 点一只小鸭，每只只数一次。
 * @param index 第几只
 */
function tapDuck(index: number): void {
  if (finished.value || tapped.value.includes(index)) return
  tapped.value = [...tapped.value, index]
  playDing()
  speak(words[tapped.value.length] ?? '')
  if (tapped.value.length === (props.level.target ?? 3)) complete(700)
}

/**
 * 选出数量符合的那一组。
 * @param id 那一组
 */
function chooseGroup(id: string): void {
  if (finished.value) return
  if (id === props.level.answerGroupId) complete()
  else wrong()
}

/**
 * 食物分给动物。多给同一只时会退回。
 * @param foodId 食物
 * @param animalId 动物
 */
function feed(foodId: string, animalId: string): void {
  if (finished.value) return
  const animal = props.level.animals?.find((one) => one.id === animalId)
  if (!animal) return
  const mine = held.value[animalId] ?? []
  if (mine.length >= animal.need) {
    emit('note', '这只小兔已经有啦')
    return
  }
  held.value = { ...held.value, [animalId]: [...mine, foodId] }
  selected.value = null
  playDing()
  const done = (props.level.animals ?? []).every((one) => (held.value[one.id]?.length ?? 0) === one.need)
  if (done) complete()
}

/**
 * 把食物从动物身边拿回来。
 * @param animalId 动物
 * @param foodId 食物
 */
function unfeed(animalId: string, foodId: string): void {
  held.value = { ...held.value, [animalId]: (held.value[animalId] ?? []).filter((id) => id !== foodId) }
}

/**
 * 按点点把水果放进格子。
 * @param foodId 水果
 * @param slotId 格子
 */
function fillSlot(foodId: string, slotId: string): void {
  if (finished.value) return
  const slot = props.level.slots?.find((one) => one.id === slotId)
  if (!slot) return
  const mine = slotHeld.value[slotId] ?? []
  if (mine.length >= slot.count) {
    emit('note', '这里已经够啦')
    return
  }
  slotHeld.value = { ...slotHeld.value, [slotId]: [...mine, foodId] }
  selected.value = null
  playDing()
  const done = (props.level.slots ?? []).every((one) => (slotHeld.value[one.id]?.length ?? 0) === one.count)
  if (done) complete()
}

/**
 * 格子里多点一下就拿出来。
 * @param slotId 格子
 * @param foodId 水果
 */
function unslot(slotId: string, foodId: string): void {
  slotHeld.value = { ...slotHeld.value, [slotId]: (slotHeld.value[slotId] ?? []).filter((id) => id !== foodId) }
  window.clearTimeout(timer)
}

/**
 * 拖动物品，松手后看落在哪个区域。
 * @param event 指针
 * @param id 物品
 */
function onDown(event: PointerEvent, id: string): void {
  if (finished.value) return
  start(event, id, (result) => {
    if (!result) return
    if (!result.moved) {
      if (props.level.mode === 'fill' || props.level.mode === 'steps' || props.level.mode === 'collect') addToBasket(id)
      else selected.value = selected.value === id ? null : id
      return
    }
    const zone = hitZones(root.value, result.x, result.y)
    if (!zone) return
    if (props.level.mode === 'fill' || props.level.mode === 'steps') addToBasket(id)
    else if (props.level.mode === 'each') feed(id, zone)
    else if (props.level.mode === 'slots') fillSlot(id, zone)
    else if (props.level.mode === 'collect') addToBasket(id)
  })
}

</script>

<template>
  <div ref="root" class="count">
    <!-- 给固定数量 -->
    <template v-if="level.mode === 'fill' || level.mode === 'steps'">
      <div class="hero">
        <Picture :name="step?.art || level.heroArt || 'rabbit'" />
      </div>
      <div class="basket" data-drop-id="basket" :class="{ 'hint-glow': assist }">
        <Dots :n="target" />
        <div class="inside">
          <button v-for="id in basket" :key="id" class="mini pop" type="button" @click="removeFromBasket(id)">
            <Picture :name="supplyArt" />
          </button>
        </div>
      </div>
    </template>

    <!-- 点点小鸭 -->
    <div v-else-if="level.mode === 'tap'" class="ducks">
      <button
        v-for="n in (level.target || 3)"
        :key="n"
        class="duck"
        :class="{ on: tapped.includes(n) }"
        :aria-label="`小鸭${n}`"
        @click="tapDuck(n)"
      >
        <Picture name="duck" />
        <span v-if="tapped.includes(n)" class="badge">{{ words[tapped.indexOf(n) + 1] }}</span>
      </button>
    </div>

    <!-- 哪一组数量对 -->
    <div v-else-if="level.mode === 'which'" class="groups">
      <div v-if="level.sampleCount" class="sample">
        <Picture :name="level.sampleArt || 'block-square'" />
        <Picture :name="level.sampleArt || 'block-square'" />
      </div>
      <button
        v-for="group in level.groups"
        :key="group.id"
        class="group"
        :class="{ 'hint-glow': assist && group.id === level.answerGroupId }"
        :aria-label="group.label"
        @click="chooseGroup(group.id)"
      >
        <span v-for="n in group.count" :key="n" class="mini">
          <Picture :name="group.art" color="orange" />
        </span>
        <Dots :n="group.count" />
      </button>
    </div>

    <!-- 每只一份 -->
    <div v-else-if="level.mode === 'each'" class="animals">
      <div
        v-for="animal in level.animals"
        :key="animal.id"
        class="animal"
        :data-drop-id="animal.id"
        :class="{ 'hint-glow': assist && (held[animal.id]?.length || 0) < animal.need }"
        @pointerup="!ghost && selected && feed(selected, animal.id)"
      >
        <Picture :name="animal.art" />
        <button v-for="id in held[animal.id] || []" :key="id" class="mini pop" type="button" @click.stop="unfeed(animal.id, id)">
          <Picture :name="level.foodArt || 'carrot'" />
        </button>
      </div>
    </div>

    <!-- 按点点排队 -->
    <div v-else-if="level.mode === 'slots'" class="slots">
      <div
        v-for="slot in level.slots"
        :key="slot.id"
        class="slot"
        :data-drop-id="slot.id"
        :class="{ 'hint-glow': assist && (slotHeld[slot.id]?.length || 0) < slot.count }"
        @pointerup="!ghost && selected && fillSlot(selected, slot.id)"
      >
        <Dots :n="slot.count" />
        <div class="inside">
          <button v-for="id in slotHeld[slot.id] || []" :key="id" class="mini pop" type="button" @click="unslot(slot.id, id)">
            <Picture :name="slot.art" />
          </button>
        </div>
      </div>
    </div>

    <!-- 捡星星 -->
    <div v-else class="night">
      <div class="jar" data-drop-id="basket" :class="{ 'hint-glow': assist }">
        <Dots :n="3" />
        <div class="inside">
          <button v-for="id in basket" :key="id" class="mini pop" type="button" @click="removeFromBasket(id)">
            <Picture name="star" />
          </button>
        </div>
      </div>
      <div class="sky-stars">
        <button
          v-for="n in (level.starCount || 5)"
          v-show="!basket.includes('star-' + n)"
          :key="n"
          class="star"
          :aria-label="'星星' + n"
          @pointerdown.prevent="onDown($event, 'star-' + n)"
        >
          <Picture name="star" />
        </button>
      </div>
    </div>

    <!-- 待放入的物品。收集星星用上面的天空 -->
    <div v-if="level.mode !== 'tap' && level.mode !== 'which' && level.mode !== 'collect'" class="tray">
      <button
        v-for="id in pool"
        :key="id"
        class="piece"
        :class="{ 'is-hidden': ghost?.id === id }"
        :aria-label="supplyLabel"
        @pointerdown.prevent="onDown($event, id)"
      >
        <Picture :name="supplyArt" />
      </button>
    </div>

    <div v-if="ghostOn" class="drag-ghost" :style="ghostStyle">
      <Picture :name="level.mode === 'collect' ? 'star' : supplyArt" />
    </div>
  </div>
</template>

<style scoped>
.count { height: 100%; display: flex; flex-direction: column; gap: 8px; padding: 0 12px 8px; min-height: 0; }
.hero { width: 96px; height: 96px; align-self: center; }
.basket, .jar, .slot, .animal, .group {
  background: rgba(255,255,255,.88); border-radius: 22px; box-shadow: var(--shadow); padding: 8px;
}
.basket, .jar { min-height: 120px; }
.inside { display: flex; flex-wrap: wrap; gap: 4px; min-height: 48px; }
.mini { width: 46px; height: 46px; background: transparent; box-shadow: none; }
.ducks, .animals, .slots, .groups { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
.duck, .animal { width: 104px; min-height: 110px; position: relative; }
.duck.on { box-shadow: 0 0 0 4px #ffd23f; border-radius: 24px; }
.badge {
  position: absolute; top: 4px; right: 4px; background: #ffd23f; border-radius: 50%;
  width: 28px; height: 28px; display: grid; place-items: center; font-weight: 800;
}
.group { min-width: 96px; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.sample { display: flex; gap: 4px; width: 100%; justify-content: center; }
.sample .wrap, .group .mini { width: 42px; height: 42px; }
.slot { flex: 1; min-width: 90px; min-height: 120px; }
.tray { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: auto; }
.piece { width: 84px; height: 84px; padding: 6px; }
.night { display: flex; flex-direction: column; gap: 8px; flex: 1; }
.sky-stars { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.star { width: 72px; height: 72px; background: transparent; box-shadow: none; }
</style>
