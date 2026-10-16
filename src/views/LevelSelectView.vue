<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { GameId } from '../types'
import { gameMeta } from '../catalog'
import { levelsOf } from '../levels'
import { useProgress } from '../progress'
import SceneBg from '../components/art/SceneBg.vue'
import Picture from '../components/art/Picture.vue'

const route = useRoute()
const router = useRouter()
const progress = useProgress()
const tip = ref('')

const gameId = computed(() => String(route.params.gameId) as GameId)
const meta = computed(() => gameMeta(gameId.value))
const levels = computed(() => levelsOf(gameId.value) ?? [])

/**
 * 打开已解锁的关卡。锁住的关只说一句怎么打开。
 * @param index 关卡序号
 */
function openLevel(index: number): void {
  if (!progress.isUnlocked(gameId.value, index)) {
    tip.value = '完成前一关就能打开哦'
    window.setTimeout(() => { tip.value = '' }, 1600)
    return
  }
  router.push(`/play/${gameId.value}/${index}`)
}
</script>

<template>
  <!-- 选关：完成的有星星，没开的有小锁 -->
  <div class="scroll-page">
    <div class="page select">
      <SceneBg :theme="gameId" />
      <header class="bar">
        <button class="btn btn-ghost back" type="button" @click="router.push('/')">←</button>
        <div>
          <h1>{{ meta.title }}</h1>
          <p>选择一个小任务吧！</p>
        </div>
      </header>
      <div class="grid">
        <button
          v-for="level in levels"
          :key="level.id"
          class="level"
          type="button"
          :class="{ locked: !progress.isUnlocked(gameId, level.index), done: progress.isDone(level.id) }"
          @click="openLevel(level.index)"
        >
          <span class="pic"><Picture :name="level.icon" /></span>
          <strong>{{ level.index }}</strong>
          <em v-if="progress.isDone(level.id)">★</em>
          <em v-else-if="!progress.isUnlocked(gameId, level.index)">锁</em>
        </button>
      </div>
      <p v-if="tip" class="tip">{{ tip }}</p>
    </div>
  </div>
</template>

<style scoped>
.select { position: relative; min-height: 100%; padding: 12px 16px 24px; }
.bar, .grid, .tip { position: relative; z-index: 1; }
.bar { display: flex; gap: 10px; align-items: center; }
.back { width: 48px; height: 48px; font-size: 22px; }
.bar h1 { margin: 0; font-size: 26px; }
.bar p { margin: 2px 0 0; font-weight: 700; }
.grid { margin-top: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.level {
  min-height: 132px; border-radius: 24px; background: rgba(255,255,255,.9);
  box-shadow: var(--shadow); position: relative; padding: 8px;
}
.pic { width: 72px; height: 72px; margin: 0 auto; display: block; }
.level strong { display: block; font-size: 18px; }
.level em { position: absolute; top: 8px; right: 10px; font-style: normal; font-weight: 800; color: #e09a2b; }
.locked { opacity: .72; }
.tip {
  margin: 14px auto 0; text-align: center; font-weight: 800; background: #fff;
  display: inline-block; padding: 8px 14px; border-radius: 999px;
}
</style>
