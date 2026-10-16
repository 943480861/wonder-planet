<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProgress } from '../progress'
import SceneBg from '../components/art/SceneBg.vue'

const router = useRouter()
const progress = useProgress()
const asking = ref(false)

/**
 * 家长确认后才清除本机进度。
 */
function confirmReset(): void {
  progress.resetAll()
  asking.value = false
}
</script>

<template>
  <!-- 家长设置：声音、翻牌预览、清除进度 -->
  <div class="page settings">
    <SceneBg theme="welcome" />
    <header class="bar">
      <button class="btn btn-ghost back" type="button" @click="router.push('/')">←</button>
      <h1>家长</h1>
    </header>
    <div class="panel">
      <label class="row">
        <span>音效</span>
        <input v-model="progress.state.soundEnabled" type="checkbox" />
      </label>
      <label class="row">
        <span>语音</span>
        <input v-model="progress.state.voiceEnabled" type="checkbox" />
      </label>
      <label class="row">
        <span>翻牌前先看一眼</span>
        <input v-model="progress.state.memoryPreview" type="checkbox" />
      </label>
      <button class="btn btn-primary" type="button" @click="asking = true">重新开始</button>
    </div>

    <div v-if="asking" class="modal-mask">
      <div class="modal-card">
        <h2>确定要重新开始吗？</h2>
        <p>这会清除本机保存的游戏进度。</p>
        <div class="modal-actions">
          <button class="btn btn-ghost" type="button" @click="asking = false">取消</button>
          <button class="btn btn-primary" type="button" @click="confirmReset">确认重置</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings { position: relative; }
.bar, .panel { position: relative; z-index: 1; }
.bar { display: flex; align-items: center; gap: 10px; padding: 12px; }
.back { width: 48px; height: 48px; font-size: 22px; }
.bar h1 { margin: 0; font-size: 28px; }
.panel {
  margin: 12px; background: rgba(255,255,255,.92); border-radius: 24px; padding: 16px;
  display: flex; flex-direction: column; gap: 14px; box-shadow: var(--shadow);
}
.row { display: flex; justify-content: space-between; align-items: center; font-size: 20px; font-weight: 800; min-height: 48px; }
.row input { width: 28px; height: 28px; }
</style>
