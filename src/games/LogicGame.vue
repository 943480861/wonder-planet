<script setup lang="ts">
import { computed, ref } from 'vue'
import type { LogicChoice, LogicLevel, LogicNode } from '../types'
import { isBigRedApple } from '../rules'
import { hitZones, useDrag } from '../composables/useDrag'
import { useRound } from '../composables/useRound'
import { shuffle } from '../utils'
import Picture from '../components/art/Picture.vue'
import StarBear from '../components/art/StarBear.vue'

const props = defineProps<{ level: LogicLevel; assistTick: number; attempt: number }>()
const emit = defineEmits<{ wrong: []; right: []; complete: []; note: [text: string]; instruction: [text: string] }>()

const root = ref<HTMLElement | null>(null)
const { ghost, ghostStyle, start } = useDrag()
const { assist, finished, wrong, right, complete } = useRound(emit, () => props.assistTick)
const selected = ref<string | null>(null)
const placed = ref<Record<string, string>>({})
const questStep = ref(0)
const here = ref('start')
const moved = ref(false)
const choices = ref(shuffle(props.level.choices ?? []))
const items = ref(shuffle(props.level.items ?? []))
const options = ref(shuffle(props.level.options ?? []))

const quest = computed(() => props.level.quest?.[questStep.value])
const nodes = computed(() => props.level.nodes ?? [])
const ghostItem = computed(() => items.value.find((item) => item.id === ghost.value?.id))

/**
 * 点选是否正确。第 9 关必须又大又红。
 * @param item 候选
 */
function correctPick(item: LogicChoice): boolean {
  if (props.level.id === 'logic-09') return isBigRedApple(item)
  return !!item.correct
}

/**
 * 这一小步做完。寻宝关要等三步都完才发一次奖励。
 */
function stepDone(): void {
  const steps = props.level.quest
  if (props.level.mode === 'quest' && steps && questStep.value < steps.length - 1) {
    questStep.value += 1
    here.value = 'start'
    const next = steps[questStep.value]
    if (next) emit('instruction', next.voice)
    right()
    return
  }
  complete()
}

/**
 * 选中一个答案。
 * @param item 候选
 */
function pick(item: LogicChoice): void {
  if (finished.value) return
  if (correctPick(item)) stepDone()
  else wrong()
}

/**
 * 补上规律的下一项。
 * @param id 选项
 */
function answerPattern(id: string): void {
  if (finished.value) return
  const expect = props.level.mode === 'quest' ? quest.value?.answerId : props.level.answerId
  if (id === expect) stepDone()
  else wrong()
}

/**
 * 大球小球分开放，或按从小到大放进格子。
 * @param item 物品
 * @param zone 区域
 */
function dropSize(item: LogicChoice, zone: string): void {
  if (finished.value || placed.value[item.id]) return
  const expect = props.level.mode === 'lineup' ? ['s', 'm', 'l'][Number(zone)] : zone
  if (item.size !== expect) {
    wrong()
    return
  }
  placed.value = { ...placed.value, [item.id]: zone }
  const source = props.level.mode === 'lineup' ? items.value : items.value
  if (source.every((one) => placed.value[one.id])) complete()
  else right()
}

/**
 * 沿着路点下一颗石头。走错小路不算失败。
 * @param node 石头
 */
function walk(node: LogicNode): void {
  if (finished.value) return
  const current = nodes.value.find((one) => one.id === here.value)
  if (!current) return
  if (node.dead || node.id === current.side) {
    emit('note', '这条小路没有胡萝卜哦')
    return
  }
  if (node.id !== current.next) {
    emit('note', '沿着亮亮的路走哦')
    return
  }
  here.value = node.id
  if (node.goal) stepDone()
}

/**
 * 寻宝最后一步的三颗石头。
 * @param id 石头
 */
function walkQuest(id: string): void {
  const map: Record<string, string> = { start: 'mid', mid: 'end' }
  if (map[here.value] !== id) {
    emit('note', '沿着亮亮的路走哦')
    return
  }
  here.value = id
  if (id === 'end') stepDone()
}

/**
 * 方向箭头。只有向右才走到星星旁边。
 * @param dir 左或右
 */
function move(dir: 'left' | 'right'): void {
  if (finished.value) return
  if (dir === 'right') {
    moved.value = true
    complete(600)
  } else {
    emit('note', '往右边走一步吧！')
  }
}

/**
 * 拖动大小物品。
 * @param event 指针
 * @param item 物品
 */
function onDown(event: PointerEvent, item: LogicChoice): void {
  if (finished.value || placed.value[item.id]) return
  start(event, item.id, (result) => {
    if (!result) return
    if (!result.moved) {
      selected.value = selected.value === item.id ? null : item.id
      return
    }
    const zone = hitZones(root.value, result.x, result.y)
    if (zone) dropSize(item, zone)
  })
}

/**
 * 点格子，放下选中的物品。
 * @param zone 区域
 */
function onZone(zone: string): void {
  if (ghost.value || !selected.value) return
  const item = items.value.find((one) => one.id === selected.value)
  selected.value = null
  if (item) dropSize(item, zone)
}

const rabbit = computed(() => nodes.value.find((node) => node.id === here.value))
</script>

<template>
  <div ref="root" class="logic">
    <!-- 找一样 / 又大又红 -->
    <div v-if="level.mode === 'pick'" class="choices">
      <div v-if="level.index === 1" class="sample"><Picture name="ball" color="blue" /></div>
      <button
        v-for="item in choices"
        :key="item.id"
        class="piece"
        :class="{ 'hint-glow': assist && correctPick(item) }"
        :aria-label="item.label"
        @click="pick(item)"
      >
        <Picture :name="item.art" :color="item.color" :size="item.size || 'm'" />
      </button>
    </div>

    <!-- 大小分开，或从小到大 -->
    <template v-else-if="level.mode === 'sizes' || level.mode === 'lineup'">
      <div class="zones">
        <div
          v-for="zone in (level.mode === 'sizes' ? ['l', 's'] : ['s', 'm', 'l'])"
          :key="zone"
          class="zone"
          :data-drop-id="zone"
          :class="{ 'hint-glow': assist }"
          @pointerup="onZone(zone)"
        >
          <Picture name="ball" color="blue" :size="zone === 'l' ? 'l' : zone === 's' ? 's' : 'm'" />
          <div class="inside">
            <div v-for="item in items.filter(one => placed[one.id] === zone)" :key="item.id" class="mini pop">
              <Picture :name="item.art" :color="item.color" :size="item.size" />
            </div>
          </div>
        </div>
      </div>
      <div class="tray">
        <button
          v-for="item in items"
          v-show="!placed[item.id]"
          :key="item.id"
          class="piece"
          :class="{ selected: selected === item.id, 'is-hidden': ghost?.id === item.id }"
          :aria-label="item.label"
          @pointerdown.prevent="onDown($event, item)"
        >
          <Picture :name="item.art" :color="item.color" :size="item.size || 'm'" />
        </button>
      </div>
    </template>

    <!-- 规律 -->
    <div v-else-if="level.mode === 'pattern'" class="pattern">
      <div class="row">
        <div v-for="(bit, index) in level.pattern" :key="index" class="cell">
          <Picture :name="bit.art" :color="bit.color" />
        </div>
        <div class="cell hole" :class="{ 'hint-glow': assist }">?</div>
      </div>
      <div class="tray">
        <button
          v-for="item in options"
          :key="item.id"
          class="piece"
          :class="{ 'hint-glow': assist && item.correct }"
          :aria-label="item.label"
          @click="answerPattern(item.id)"
        >
          <Picture :name="item.art" :color="item.color" />
        </button>
      </div>
    </div>

    <!-- 少了什么 -->
    <div v-else-if="level.mode === 'missing'" class="pattern">
      <div class="row sample-row">
        <div v-for="(bit, index) in level.pattern" :key="'s' + index" class="cell">
          <Picture :name="bit.art" :color="bit.color" />
        </div>
      </div>
      <div class="row">
        <div v-for="(bit, index) in (level.pattern || []).slice(0, -1)" :key="'h' + index" class="cell">
          <Picture :name="bit.art" :color="bit.color" />
        </div>
        <div class="cell hole">?</div>
      </div>
      <div class="tray">
        <button
          v-for="item in options"
          :key="item.id"
          class="piece"
          :class="{ 'hint-glow': assist && item.correct }"
          :aria-label="item.label"
          @click="answerPattern(item.id)"
        >
          <Picture :name="item.art" :color="item.color" />
        </button>
      </div>
    </div>

    <!-- 小路 -->
    <div v-else-if="level.mode === 'path'" class="path">
      <svg viewBox="0 0 100 100" class="road">
        <polyline
          points="12,70 32,40 52,66 72,36 88,70"
          fill="none"
          stroke="#ffd23f"
          stroke-width="4"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <polyline points="52,66 54,18" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="2 2" />
      </svg>
      <button
        v-for="node in nodes"
        :key="node.id"
        class="stone"
        :class="{ here: here === node.id }"
        :style="{ left: node.x + '%', top: node.y + '%' }"
        :aria-label="node.goal ? '胡萝卜' : '路'"
        @click="walk(node)"
      >
        <Picture v-if="node.goal" name="carrot" />
        <Picture v-else-if="node.dead" name="stone" />
      </button>
      <div v-if="rabbit" class="walker" :style="{ left: rabbit.x + '%', top: `calc(${rabbit.y}% - 46px)` }">
        <Picture name="rabbit" />
      </div>
    </div>

    <!-- 向右走 -->
    <div v-else-if="level.mode === 'move'" class="move">
      <button class="btn arrow" type="button" aria-label="向左" @click="move('left')">←</button>
      <div class="lane">
        <div class="walker" :class="{ go: moved }"><StarBear mood="happy" :size="120" /></div>
        <div class="goal-star"><Picture name="star" /></div>
      </div>
      <button class="btn btn-primary arrow nudge" type="button" aria-label="向右" @click="move('right')">→</button>
    </div>

    <!-- 三步寻宝 -->
    <div v-else class="quest">
      <p class="step-no">第 {{ questStep + 1 }} 小步</p>
      <div v-if="quest?.type === 'pick'" class="choices">
        <button
          v-for="item in quest.choices"
          :key="item.id"
          class="piece"
          :class="{ 'hint-glow': assist && item.correct }"
          :aria-label="item.label"
          @click="pick(item)"
        >
          <Picture :name="item.art" :color="item.color" :size="item.size || 'm'" />
        </button>
      </div>
      <div v-else-if="quest?.type === 'pattern'" class="pattern">
        <div class="row">
          <div v-for="(bit, index) in quest.pattern" :key="index" class="cell">
            <Picture :name="bit.art" :color="bit.color" />
          </div>
          <div class="cell hole">?</div>
        </div>
        <div class="tray">
          <button
            v-for="item in quest.options"
            :key="item.id"
            class="piece"
            :class="{ 'hint-glow': assist && item.id === quest.answerId }"
            :aria-label="item.label"
            @click="answerPattern(item.id)"
          >
            <Picture :name="item.art" :color="item.color" />
          </button>
        </div>
      </div>
      <div v-else class="path short">
        <button class="stone" :class="{ here: here === 'start' }" style="left: 16%; top: 60%" @click="walkQuest('start')" />
        <button class="stone" :class="{ here: here === 'mid' }" style="left: 48%; top: 40%" @click="walkQuest('mid')" />
        <button class="stone" :class="{ here: here === 'end' }" style="left: 78%; top: 58%" @click="walkQuest('end')">
          <Picture name="star" />
        </button>
        <div class="walker" :style="{ left: here === 'start' ? '16%' : here === 'mid' ? '48%' : '78%', top: '28%' }">
          <Picture name="rabbit" />
        </div>
      </div>
    </div>

    <div v-if="ghostItem" class="drag-ghost" :style="ghostStyle">
      <Picture :name="ghostItem.art" :color="ghostItem.color" :size="ghostItem.size" />
    </div>
  </div>
</template>

<style scoped>
.logic { height: 100%; display: flex; flex-direction: column; gap: 8px; padding: 0 12px 8px; min-height: 0; }
.choices, .tray { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.piece { width: 104px; height: 104px; padding: 8px; }
.sample { width: 96px; height: 96px; margin: 0 auto 4px; background: #fff; border-radius: 24px; padding: 8px; box-shadow: var(--shadow); }
.zones { display: flex; gap: 8px; }
.zone { flex: 1; min-height: 140px; background: rgba(255,255,255,.88); border-radius: 22px; padding: 8px; box-shadow: var(--shadow); }
.zone :deep(.wrap) { height: 54px; }
.inside { display: flex; justify-content: center; }
.mini { width: 64px; height: 64px; }
.row { display: flex; gap: 8px; justify-content: center; align-items: center; }
.cell { width: 68px; height: 68px; background: #fff; border-radius: 18px; padding: 6px; box-shadow: var(--shadow); }
.hole { display: grid; place-items: center; font-size: 28px; font-weight: 800; color: #ff9f43; }
.sample-row { transform: scale(.86); }
.path { position: relative; flex: 1; min-height: 220px; background: rgba(255,255,255,.45); border-radius: 24px; }
.road { position: absolute; inset: 0; width: 100%; height: 100%; }
.stone {
  position: absolute; width: 54px; height: 54px; transform: translate(-50%, -50%);
  border-radius: 50%; background: #fff; box-shadow: var(--shadow);
}
.stone.here { box-shadow: 0 0 0 4px #ffd23f; }
.walker { position: absolute; width: 64px; height: 64px; transform: translateX(-50%); transition: left .35s ease, top .35s ease; pointer-events: none; }
.move { display: flex; align-items: center; gap: 8px; flex: 1; }
.arrow { width: 72px; height: 72px; font-size: 36px; border-radius: 50%; }
.nudge { animation: nudge-x 1.2s ease-in-out infinite; }
.lane { flex: 1; position: relative; height: 160px; }
.lane .walker { left: 0; top: 20px; width: 120px; height: 130px; transition: left .45s ease; }
.lane .walker.go { left: calc(100% - 120px); }
.goal-star { position: absolute; right: 0; top: 36px; width: 72px; height: 72px; }
.step-no { margin: 0; text-align: center; font-weight: 800; }
.short { min-height: 200px; }
@keyframes nudge-x { 50% { transform: translateX(6px); } }
</style>
