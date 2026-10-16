<script setup lang="ts">
import { computed, ref } from 'vue'
import type { LevelBase } from '../types'
import { gameMeta } from '../catalog'
import { useProgress } from '../progress'
import SceneBg from './art/SceneBg.vue'
import StarBear from './art/StarBear.vue'

const props = defineProps<{
  level: LevelBase
  instruction: string
  toast: string
  success: boolean
}>()

const emit = defineEmits<{
  hint: []
  restart: []
  home: []
  next: []
  replay: []
}>()

const progress = useProgress()
const paused = ref(false)
const meta = computed(() => gameMeta(props.level.gameId))
const bursts = [
  { dx: '-80px', dy: '-110px', c: '#ff8fb8' },
  { dx: '70px', dy: '-120px', c: '#ffd23f' },
  { dx: '-120px', dy: '-40px', c: '#7ec8f0' },
  { dx: '110px', dy: '-30px', c: '#5dca8a' },
  { dx: '-40px', dy: '-140px', c: '#ff9f43' },
  { dx: '30px', dy: '-150px', c: '#b794f6' },
  { dx: '-140px', dy: '-90px', c: '#ffd23f' },
  { dx: '140px', dy: '-80px', c: '#ff8fb8' },
]

/**
 * 返回先问一句，避免不小心离开。
 */
function askLeave(): void {
  paused.value = true
}
</script>

<template>
  <div class="page play">
    <SceneBg :theme="level.gameId" />
    <!-- 顶部：返回、名字、第几关 -->
    <header class="topbar">
      <button class="btn btn-ghost back" type="button" aria-label="返回" @click="askLeave">←</button>
      <div class="titles">
        <strong>{{ meta.title }}</strong>
        <span>{{ level.index }} / 10</span>
      </div>
      <div class="pips" aria-hidden="true">
        <i v-for="n in 10" :key="n" :class="{ on: n < level.index, now: n === level.index }" />
      </div>
    </header>

    <!-- 任务：只说一件事，可以再听一遍 -->
    <div class="instruction">
      <StarBear mood="happy" :size="64" />
      <p>{{ instruction }}</p>
      <button class="btn btn-ghost speak" type="button" @click="emit('replay')">听一听</button>
    </div>

    <!-- 游戏区 -->
    <div class="stage">
      <slot />
    </div>

    <!-- 再听、提示、重来 -->
    <footer class="tools">
      <button class="btn btn-ghost" type="button" @click="emit('replay')">再听</button>
      <button class="btn btn-ghost" type="button" @click="emit('hint')">提示</button>
      <button class="btn btn-ghost" type="button" @click="emit('restart')">重来</button>
    </footer>

    <Transition name="fade">
      <div v-if="toast && !success && !paused" class="toast">{{ toast }}</div>
    </Transition>

    <!-- 休息确认：继续玩不会丢掉这一关 -->
    <div v-if="paused" class="modal-mask">
      <div class="modal-card">
        <StarBear mood="think" :size="120" />
        <h2>要先休息一下吗？</h2>
        <p>我们可以休息一下，下次再来。</p>
        <div class="modal-actions">
          <button class="btn btn-primary" type="button" @click="paused = false">继续玩</button>
          <button class="btn btn-ghost" type="button" @click="emit('home')">回到首页</button>
        </div>
      </div>
    </div>

    <!-- 过关 -->
    <div v-if="success" class="modal-mask">
      <div class="modal-card">
        <span
          v-for="(bit, index) in bursts"
          :key="index"
          class="confetti"
          :style="{ background: bit.c, '--dx': bit.dx, '--dy': bit.dy }"
        />
        <StarBear mood="cheer" :size="140" />
        <h2>{{ level.index === 10 ? '你点亮了这一组星星！' : '太棒啦！这一关完成啦！' }}</h2>
        <p>{{ level.index === 10 ? '要不要换个地方继续探险？' : level.successText }}</p>
        <p class="stars">星星 {{ progress.state.stars }}</p>
        <div class="modal-actions">
          <button v-if="level.index < 10" class="btn btn-primary" type="button" @click="emit('next')">下一关</button>
          <button v-else class="btn btn-primary" type="button" @click="emit('home')">选其他游戏</button>
          <button class="btn btn-mint" type="button" @click="emit('restart')">再玩一次</button>
          <button class="btn btn-ghost" type="button" @click="emit('home')">{{ level.index === 10 ? '休息一下' : '回首页' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.play { position: relative; }
.topbar, .instruction, .stage, .tools { position: relative; z-index: 1; }
.topbar { display: flex; align-items: center; gap: 8px; padding: 8px 10px 0; }
.back { width: 48px; height: 48px; font-size: 22px; }
.titles { display: flex; flex-direction: column; min-width: 0; }
.titles strong { font-size: 18px; }
.titles span { font-size: 14px; color: var(--ink-soft); }
.pips { margin-left: auto; display: flex; gap: 4px; }
.pips i { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,.75); }
.pips i.on, .pips i.now { background: #ff9f43; }
.instruction {
  display: flex; align-items: center; gap: 8px; margin: 8px 12px;
  background: rgba(255,255,255,.9); border-radius: 20px; padding: 6px 8px 6px 4px;
  box-shadow: var(--shadow);
}
.instruction p { flex: 1; margin: 0; font-size: 18px; font-weight: 800; line-height: 1.35; }
.speak { min-height: 44px; font-size: 16px; }
.stage { flex: 1; min-height: 0; position: relative; }
.tools {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;
  padding: 8px 12px calc(8px + var(--safe-bottom));
}
.stars { font-weight: 800; color: #e09a2b; }
.modal-card { position: relative; overflow: hidden; }
</style>
