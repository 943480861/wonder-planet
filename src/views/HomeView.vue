<script setup lang="ts">
import { useRouter } from 'vue-router'
import { GAMES } from '../catalog'
import { useProgress } from '../progress'
import { validateLevels } from '../levels/validate'
import SceneBg from '../components/art/SceneBg.vue'
import StarBear from '../components/art/StarBear.vue'
import Picture from '../components/art/Picture.vue'

const router = useRouter()
const progress = useProgress()
const problems = import.meta.env.DEV ? validateLevels() : []

/**
 * 进入某一款游戏的选关页。
 * @param id 游戏标识
 */
function openGame(id: string): void {
  router.push(`/game/${id}`)
}
</script>

<template>
  <!-- 首页：星星小熊和六个游戏入口 -->
  <div class="scroll-page">
    <div class="page home-page">
      <SceneBg theme="welcome" />
      <header class="hero">
        <StarBear mood="wave" :size="168" />
        <h1>奇妙小星球</h1>
        <p>星星带你去冒险！</p>
        <p class="hello">嗨！小朋友，我们一起玩游戏吧！</p>
        <p class="star-count">星星 {{ progress.state.stars }}</p>
      </header>
      <button
        v-if="progress.state.lastGameId"
        class="btn btn-primary continue"
        type="button"
        @click="openGame(progress.state.lastGameId)"
      >
        接着玩
      </button>
      <div class="cards">
        <button
          v-for="game in GAMES"
          :key="game.id"
          class="card"
          type="button"
          :style="{ background: game.tint }"
          @click="openGame(game.id)"
        >
          <span class="icon"><Picture :name="game.icon" /></span>
          <strong>{{ game.title }}</strong>
          <small>{{ game.desc }}</small>
          <em>{{ progress.doneCount(game.id) }} / 10</em>
        </button>
      </div>
      <button class="btn btn-ghost parent" type="button" @click="router.push('/settings')">家长</button>
      <p v-if="problems.length" class="problems">{{ problems.join('；') }}</p>
    </div>
  </div>
</template>

<style scoped>
.home-page { position: relative; padding: 12px 16px 28px; }
.hero, .cards, .continue, .parent { position: relative; z-index: 1; }
.hero { text-align: center; }
.hero h1 { margin: 0; font-size: 36px; }
.hero p { margin: 4px 0; font-size: 18px; font-weight: 700; }
.hello { color: var(--ink-soft); font-size: 16px !important; }
.star-count { color: #e09a2b; }
.continue { display: flex; margin: 8px auto 12px; min-width: 160px; }
.cards { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.card {
  border-radius: 24px; min-height: 168px; padding: 12px; text-align: left;
  box-shadow: var(--shadow); display: flex; flex-direction: column; gap: 2px;
}
.icon { width: 72px; height: 72px; background: rgba(255,255,255,.75); border-radius: 20px; padding: 6px; }
.card strong { font-size: 18px; }
.card small, .card em { font-style: normal; color: var(--ink-soft); font-size: 14px; }
.parent { margin: 16px auto 0; display: flex; min-width: 96px; }
.problems { color: #a33; font-size: 14px; }
</style>
