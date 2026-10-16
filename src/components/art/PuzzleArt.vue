<script setup lang="ts">
import type { PuzzleScene } from '../../types'

/**
 * 拼图的一块。scene 决定是哪只动物，part 决定是头、身体还是别的部位。
 * 同一关的几块拼在一起时，外轮廓是对齐的。
 */
defineProps<{ scene: PuzzleScene; part: string }>()
</script>

<template>
  <!-- 拼图片段 -->
  <svg class="pic" viewBox="0 0 200 140">
    <template v-if="scene === 'cat' && part === 'head'">
      <path d="M46 78 L62 28 l22 36" fill="#ffb067" stroke="#4a5568" stroke-width="3" />
      <path d="M154 78 L138 28 l-22 36" fill="#ffb067" stroke="#4a5568" stroke-width="3" />
      <ellipse cx="100" cy="92" rx="58" ry="42" fill="#ffb067" stroke="#4a5568" stroke-width="3" />
      <ellipse cx="78" cy="90" rx="8" ry="10" fill="#fff" /><ellipse cx="122" cy="90" rx="8" ry="10" fill="#fff" />
      <circle cx="78" cy="92" r="3" fill="#3d4a5c" /><circle cx="122" cy="92" r="3" fill="#3d4a5c" />
      <path d="M94 104h12l-6 6z" fill="#ff8fab" />
    </template>
    <template v-else-if="scene === 'cat' && part === 'body'">
      <ellipse cx="100" cy="58" rx="62" ry="40" fill="#ffb067" stroke="#4a5568" stroke-width="3" />
      <ellipse cx="70" cy="100" rx="16" ry="10" fill="#f3c7a1" stroke="#4a5568" stroke-width="3" />
      <ellipse cx="130" cy="100" rx="16" ry="10" fill="#f3c7a1" stroke="#4a5568" stroke-width="3" />
      <path d="M150 50c28 8 30 36 10 42" fill="none" stroke="#ffb067" stroke-width="10" stroke-linecap="round" />
    </template>
    <template v-else-if="scene === 'rabbit' && part === 'ears'">
      <ellipse cx="78" cy="78" rx="16" ry="52" fill="#f7f4ee" stroke="#4a5568" stroke-width="3" />
      <ellipse cx="122" cy="78" rx="16" ry="52" fill="#f7f4ee" stroke="#4a5568" stroke-width="3" />
      <ellipse cx="78" cy="84" rx="6" ry="32" fill="#ffb7c8" />
      <ellipse cx="122" cy="84" rx="6" ry="32" fill="#ffb7c8" />
    </template>
    <template v-else-if="scene === 'rabbit' && part === 'face'">
      <circle cx="100" cy="64" r="48" fill="#f7f4ee" stroke="#4a5568" stroke-width="3" />
      <circle cx="82" cy="60" r="5" fill="#3d4a5c" /><circle cx="118" cy="60" r="5" fill="#3d4a5c" />
      <path d="M92 78h16l-8 6z" fill="#ff8fab" />
      <ellipse cx="70" cy="74" rx="8" ry="5" fill="#ffb7c8" opacity=".7" />
      <ellipse cx="130" cy="74" rx="8" ry="5" fill="#ffb7c8" opacity=".7" />
    </template>
    <template v-else-if="scene === 'bear' && part === 'head'">
      <circle cx="52" cy="70" r="18" fill="#e0a868" stroke="#4a5568" stroke-width="3" />
      <circle cx="148" cy="70" r="18" fill="#e0a868" stroke="#4a5568" stroke-width="3" />
      <circle cx="100" cy="86" r="46" fill="#f3c7a1" stroke="#4a5568" stroke-width="3" />
      <circle cx="82" cy="84" r="5" fill="#3d4a5c" /><circle cx="118" cy="84" r="5" fill="#3d4a5c" />
      <ellipse cx="100" cy="102" rx="14" ry="10" fill="#fff" />
    </template>
    <template v-else-if="scene === 'bear' && part === 'body'">
      <ellipse cx="100" cy="70" rx="58" ry="46" fill="#8ed4f8" stroke="#4a5568" stroke-width="3" />
      <circle cx="100" cy="70" r="12" fill="#ffd23f" stroke="#4a5568" stroke-width="2" />
    </template>
    <template v-else-if="scene === 'bear' && part === 'feet'">
      <ellipse cx="70" cy="70" rx="28" ry="18" fill="#e0a868" stroke="#4a5568" stroke-width="3" />
      <ellipse cx="130" cy="70" rx="28" ry="18" fill="#e0a868" stroke="#4a5568" stroke-width="3" />
    </template>
    <template v-else-if="scene === 'car' && part === 'front'">
      <path d="M30 78h70l18 24H30z" fill="#4c8dff" stroke="#4a5568" stroke-width="3" />
      <path d="M48 78l16-28h28l8 28z" fill="#ff8fb8" stroke="#4a5568" stroke-width="3" />
      <circle cx="58" cy="108" r="14" fill="#3d4a5c" /><circle cx="58" cy="108" r="6" fill="#d7e0ea" />
    </template>
    <template v-else-if="scene === 'car' && part === 'mid'">
      <rect x="20" y="78" width="160" height="24" fill="#ff8fb8" stroke="#4a5568" stroke-width="3" />
      <rect x="50" y="40" width="70" height="38" rx="8" fill="#d7f1ff" stroke="#4a5568" stroke-width="3" />
      <circle cx="100" cy="108" r="14" fill="#3d4a5c" /><circle cx="100" cy="108" r="6" fill="#d7e0ea" />
    </template>
    <template v-else-if="scene === 'car' && part === 'back'">
      <path d="M20 78h120l-10 24H36z" fill="#4c8dff" stroke="#4a5568" stroke-width="3" />
      <rect x="40" y="48" width="46" height="30" rx="6" fill="#ffd0e0" stroke="#4a5568" stroke-width="3" />
      <circle cx="120" cy="108" r="14" fill="#3d4a5c" /><circle cx="120" cy="108" r="6" fill="#d7e0ea" />
    </template>
    <template v-else-if="scene === 'lion' && part === 'head'">
      <circle cx="100" cy="74" r="52" fill="#f0b429" stroke="#4a5568" stroke-width="3" />
      <circle cx="100" cy="80" r="32" fill="#f6d3b0" stroke="#4a5568" stroke-width="3" />
      <circle cx="88" cy="76" r="4" fill="#3d4a5c" /><circle cx="112" cy="76" r="4" fill="#3d4a5c" />
      <path d="M94 90h12l-6 5z" fill="#ff8fab" />
    </template>
    <template v-else-if="scene === 'lion' && part === 'body'">
      <ellipse cx="100" cy="70" rx="64" ry="42" fill="#f0b429" stroke="#4a5568" stroke-width="3" />
      <ellipse cx="70" cy="108" rx="16" ry="10" fill="#e0a868" stroke="#4a5568" stroke-width="3" />
      <ellipse cx="130" cy="108" rx="16" ry="10" fill="#e0a868" stroke="#4a5568" stroke-width="3" />
    </template>
    <template v-else-if="scene === 'lion' && part === 'body-bad'">
      <ellipse cx="100" cy="70" rx="64" ry="42" fill="#7aa2ff" stroke="#4a5568" stroke-width="3" />
      <ellipse cx="70" cy="108" rx="16" ry="10" fill="#4c8dff" stroke="#4a5568" stroke-width="3" />
      <ellipse cx="130" cy="108" rx="16" ry="10" fill="#4c8dff" stroke="#4a5568" stroke-width="3" />
    </template>
    <template v-else-if="scene === 'fish' && part === 'head'">
      <path d="M40 70c30-40 110-40 140 0c-30 28-110 28-140 0z" fill="#4c8dff" stroke="#4a5568" stroke-width="3" />
      <circle cx="150" cy="66" r="6" fill="#fff" /><circle cx="152" cy="66" r="3" fill="#3d4a5c" />
    </template>
    <template v-else-if="scene === 'fish' && part === 'body'">
      <path d="M10 70c40-36 150-36 180 0-40 28-140 28-180 0z" fill="#7ec8f0" stroke="#4a5568" stroke-width="3" />
      <path d="M40 70c10 8 16 8 26 0M90 70c10 8 16 8 26 0" fill="none" stroke="#fff" stroke-width="3" />
    </template>
    <template v-else-if="scene === 'fish' && part === 'tail'">
      <path d="M120 70c-40-28-70-28-90 0 30 24 60 24 90 0z" fill="#4c8dff" stroke="#4a5568" stroke-width="3" />
      <path d="M36 70 L8 36 v68z" fill="#7ec8f0" stroke="#4a5568" stroke-width="3" />
    </template>
    <template v-else-if="scene === 'cow' && part === 'head'">
      <circle cx="100" cy="78" r="40" fill="#fff" stroke="#4a5568" stroke-width="3" />
      <path d="M70 50l-16-24M130 50l16-24" stroke="#4a5568" stroke-width="6" stroke-linecap="round" />
      <circle cx="40" cy="78" r="16" fill="#4a5568" /><circle cx="160" cy="70" r="14" fill="#4a5568" />
      <circle cx="84" cy="78" r="4" fill="#3d4a5c" /><circle cx="116" cy="78" r="4" fill="#3d4a5c" />
      <ellipse cx="100" cy="94" rx="10" ry="7" fill="#ffb7c8" />
    </template>
    <template v-else-if="scene === 'cow' && part === 'body'">
      <ellipse cx="100" cy="70" rx="70" ry="42" fill="#fff" stroke="#4a5568" stroke-width="3" />
      <circle cx="70" cy="60" r="12" fill="#4a5568" /><circle cx="120" cy="78" r="10" fill="#4a5568" />
    </template>
    <template v-else-if="scene === 'cow' && part === 'legs'">
      <rect x="40" y="30" width="16" height="70" rx="8" fill="#fff" stroke="#4a5568" stroke-width="3" />
      <rect x="78" y="30" width="16" height="70" rx="8" fill="#fff" stroke="#4a5568" stroke-width="3" />
      <rect x="116" y="30" width="16" height="70" rx="8" fill="#fff" stroke="#4a5568" stroke-width="3" />
      <rect x="150" y="30" width="16" height="70" rx="8" fill="#fff" stroke="#4a5568" stroke-width="3" />
    </template>
    <template v-else-if="scene === 'farm' && part === 'sky'">
      <rect width="200" height="140" fill="#9fd8f8" />
      <circle cx="150" cy="42" r="18" fill="#ffd23f" stroke="#4a5568" stroke-width="3" />
      <ellipse cx="50" cy="46" rx="26" ry="12" fill="#fff" />
    </template>
    <template v-else-if="scene === 'farm' && part === 'barn'">
      <rect width="200" height="140" fill="#d8f3ff" />
      <path d="M30 70 L100 24 L170 70 V120 H30z" fill="#ff6b6b" stroke="#4a5568" stroke-width="3" />
      <rect x="82" y="84" width="36" height="36" fill="#f4d7a6" stroke="#4a5568" stroke-width="3" />
    </template>
    <template v-else-if="scene === 'farm' && part === 'grass'">
      <rect width="200" height="140" fill="#b7e7c5" />
      <circle cx="40" cy="40" r="8" fill="#ff8fb8" /><circle cx="90" cy="70" r="8" fill="#ffd23f" /><circle cx="150" cy="46" r="8" fill="#fff" />
    </template>
    <template v-else-if="scene === 'farm' && part === 'animal'">
      <rect width="200" height="140" fill="#9ad7b0" />
      <ellipse cx="100" cy="86" rx="40" ry="24" fill="#ffd23f" stroke="#4a5568" stroke-width="3" />
      <circle cx="140" cy="64" r="18" fill="#ffe14a" stroke="#4a5568" stroke-width="3" />
      <path d="M156 66h18l-8 6z" fill="#ff9f43" stroke="#4a5568" stroke-width="3" />
    </template>
    <template v-else-if="scene === 'shadow' && part === 'head'">
      <circle cx="100" cy="74" r="42" fill="#ffb067" stroke="#4a5568" stroke-width="3" />
      <path d="M70 60l-8-28 24 16M130 60l8-28-24 16" fill="#ffb067" stroke="#4a5568" stroke-width="3" />
      <circle cx="86" cy="74" r="4" fill="#3d4a5c" /><circle cx="114" cy="74" r="4" fill="#3d4a5c" />
    </template>
    <template v-else-if="scene === 'shadow' && part === 'body'">
      <ellipse cx="100" cy="70" rx="48" ry="40" fill="#ffb067" stroke="#4a5568" stroke-width="3" />
    </template>
    <template v-else-if="scene === 'shadow' && part === 'tail'">
      <path d="M40 80c40-50 90-20 120-40" fill="none" stroke="#ffb067" stroke-width="16" stroke-linecap="round" />
      <circle cx="160" cy="42" r="12" fill="#ffb067" stroke="#4a5568" stroke-width="3" />
    </template>
    <template v-else-if="scene === 'rocket' && part === 'nose'">
      <path d="M100 8c28 28 32 70 24 100H76C68 78 72 36 100 8z" fill="#fff" stroke="#4a5568" stroke-width="3" />
      <path d="M100 18l6 12 12 2-10 8 3 12-11-7-11 7 3-12-10-8 12-2z" fill="#ffd23f" />
    </template>
    <template v-else-if="scene === 'rocket' && part === 'window'">
      <rect x="76" y="10" width="48" height="120" fill="#f7fbff" stroke="#4a5568" stroke-width="3" />
      <circle cx="100" cy="60" r="18" fill="#7ec8f0" stroke="#4a5568" stroke-width="3" />
    </template>
    <template v-else-if="scene === 'rocket' && part === 'stripe'">
      <rect x="76" y="10" width="48" height="120" fill="#ff8fb8" stroke="#4a5568" stroke-width="3" />
      <rect x="76" y="50" width="48" height="18" fill="#fff" />
    </template>
    <template v-else-if="scene === 'rocket' && part === 'fire'">
      <path d="M76 10h48l12 28H64z" fill="#ff8fb8" stroke="#4a5568" stroke-width="3" />
      <path d="M86 40c8 28 20 28 28 0" fill="#ff9f43" stroke="#4a5568" stroke-width="3" />
      <path d="M94 48c4 16 10 16 14 0" fill="#ffd23f" />
    </template>
    <template v-else>
      <rect x="20" y="20" width="160" height="100" rx="16" fill="#fff8ef" stroke="#4a5568" stroke-width="3" />
    </template>
  </svg>
</template>

<style scoped>
.pic { width: 100%; height: 100%; display: block; }
</style>
