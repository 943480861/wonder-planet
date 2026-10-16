<script setup lang="ts">
import { computed } from 'vue'

/**
 * 绘本物品。按名字画原创插画，颜色用 color，大小用 size。
 * 不认识的名字会画出占位小伙伴，避免空白。
 */
const props = withDefaults(
  defineProps<{
    name: string
    color?: string
    size?: 's' | 'm' | 'l'
    shadow?: boolean
  }>(),
  { color: 'red', size: 'm', shadow: false },
)

const PALETTE: Record<string, string> = {
  red: '#ff5a6a',
  blue: '#4c8dff',
  yellow: '#ffd23f',
  green: '#3dce7a',
  orange: '#ff9f43',
  purple: '#b794f6',
  pink: '#ff8fb8',
  brown: '#d0924c',
  gray: '#9aa5b5',
}

/** 颜色名转成填充色 */
const tone = computed(() => PALETTE[props.color || ''] || PALETTE.red)
/** 球的半径，用来区分大球小球 */
const ballR = computed(() => (props.size === 's' ? 20 : props.size === 'l' ? 46 : 32))
/** 积木边长 */
const block = computed(() => (props.size === 's' ? 36 : props.size === 'l' ? 80 : 58))
const bx = computed(() => 60 - block.value / 2)
const by = computed(() => 64 - block.value / 2)
</script>

<template>
  <!-- 单件物品插画，父级决定显示多大 -->
  <div class="wrap" :class="{ shadow }">
    <svg v-if="name === 'apple'" class="pic" viewBox="0 0 120 120">
      <ellipse cx="60" cy="108" rx="26" ry="6" fill="rgba(80,60,40,.12)" />
      <path d="M60 34c20 0 34 16 34 36 0 22-14 38-34 40S26 92 26 70c0-20 14-36 34-36z" :fill="tone" stroke="#4a5568" stroke-width="3" />
      <path d="M60 36c2-14 12-20 20-22" fill="none" stroke="#6b8f71" stroke-width="3" stroke-linecap="round" />
      <path d="M78 16c10 2 16 12 12 18-8-2-16-8-18-14 2-2 4-3 6-4z" fill="#7dcea0" stroke="#4a5568" stroke-width="3" />
      <ellipse cx="46" cy="58" rx="8" ry="12" fill="#fff" opacity=".4" />
    </svg>
    <svg v-else-if="name === 'strawberry'" class="pic" viewBox="0 0 120 120">
      <path d="M60 28c22 8 36 28 32 52-4 22-18 32-32 32S32 102 28 80C24 56 38 36 60 28z" fill="#ff4d6d" stroke="#4a5568" stroke-width="3" />
      <path d="M40 36c6-12 14-16 20-16s14 4 20 16c-8 2-14 2-20 0s-12-2-20 0z" fill="#3dce7a" stroke="#4a5568" stroke-width="3" />
      <g fill="#ffd23f">
        <circle cx="48" cy="62" r="2.4" /><circle cx="64" cy="70" r="2.4" /><circle cx="52" cy="82" r="2.4" /><circle cx="72" cy="86" r="2.4" />
      </g>
    </svg>
    <svg v-else-if="name === 'berry'" class="pic" viewBox="0 0 120 120">
      <circle cx="60" cy="66" r="28" fill="#4c6fff" stroke="#4a5568" stroke-width="3" />
      <path d="M60 40c8-16 18-18 22-14" fill="none" stroke="#6b8f71" stroke-width="3" stroke-linecap="round" />
      <ellipse cx="50" cy="58" rx="6" ry="8" fill="#fff" opacity=".4" />
      <circle cx="52" cy="70" r="2" fill="#243056" /><circle cx="66" cy="74" r="2" fill="#243056" />
    </svg>
    <svg v-else-if="name === 'banana'" class="pic" viewBox="0 0 120 120">
      <path d="M34 78c8-28 28-46 52-46 4 10-2 18-8 24 18 4 28 18 26 32-16 6-36 2-52-4-6 10-16 12-22 6 2-4 4-8 4-12z" fill="#ffe14a" stroke="#4a5568" stroke-width="3" />
      <path d="M40 74c16 2 34-4 46-16" fill="none" stroke="#f5c542" stroke-width="4" stroke-linecap="round" />
    </svg>
    <svg v-else-if="name === 'lemon'" class="pic" viewBox="0 0 120 120">
      <ellipse cx="60" cy="64" rx="30" ry="26" fill="#fff176" stroke="#4a5568" stroke-width="3" />
      <ellipse cx="48" cy="56" rx="8" ry="10" fill="#fff" opacity=".45" />
    </svg>
    <svg v-else-if="name === 'orange'" class="pic" viewBox="0 0 120 120">
      <circle cx="60" cy="66" r="30" fill="#ff9f43" stroke="#4a5568" stroke-width="3" />
      <path d="M60 36c4-10 12-14 16-12" fill="none" stroke="#6b8f71" stroke-width="3" stroke-linecap="round" />
      <ellipse cx="48" cy="58" rx="8" ry="10" fill="#fff" opacity=".35" />
    </svg>
    <svg v-else-if="name === 'grapes'" class="pic" viewBox="0 0 120 120">
      <path d="M60 24c6 8 6 14 2 18" fill="none" stroke="#6b8f71" stroke-width="3" stroke-linecap="round" />
      <circle cx="48" cy="52" r="12" fill="#b06cff" stroke="#4a5568" stroke-width="3" />
      <circle cx="70" cy="52" r="12" fill="#c084fc" stroke="#4a5568" stroke-width="3" />
      <circle cx="58" cy="70" r="12" fill="#a855f7" stroke="#4a5568" stroke-width="3" />
      <circle cx="44" cy="84" r="11" fill="#c084fc" stroke="#4a5568" stroke-width="3" />
      <circle cx="68" cy="86" r="11" fill="#9333ea" stroke="#4a5568" stroke-width="3" />
    </svg>
    <svg v-else-if="name === 'pear'" class="pic" viewBox="0 0 120 120">
      <ellipse cx="60" cy="78" rx="26" ry="24" fill="#d6e04a" stroke="#4a5568" stroke-width="3" />
      <circle cx="60" cy="50" r="16" fill="#e4ee6a" stroke="#4a5568" stroke-width="3" />
      <path d="M60 34c2-10 8-14 14-14" fill="none" stroke="#6b8f71" stroke-width="3" stroke-linecap="round" />
    </svg>
    <svg v-else-if="name === 'carrot'" class="pic" viewBox="0 0 120 120">
      <path d="M60 34c16 18 22 40 16 62-4 8-12 8-16 0-6-22 0-44 16-62z" fill="#ff8a3d" stroke="#4a5568" stroke-width="3" />
      <path d="M48 36c-8-14 2-24 10-22 2 8-2 16-10 22z" fill="#3dce7a" stroke="#4a5568" stroke-width="3" />
      <path d="M70 32c10-12 20-8 18 2-8 2-14 2-18-2z" fill="#7dcea0" stroke="#4a5568" stroke-width="3" />
    </svg>
    <svg v-else-if="name === 'seed'" class="pic" viewBox="0 0 120 120">
      <ellipse cx="60" cy="66" rx="16" ry="22" fill="#e7c36a" stroke="#4a5568" stroke-width="3" />
      <path d="M60 46v40" stroke="#c9a24a" stroke-width="2" />
    </svg>
    <svg v-else-if="name === 'ball'" class="pic" viewBox="0 0 120 120">
      <ellipse cx="60" cy="104" rx="28" ry="6" fill="rgba(80,60,40,.12)" />
      <circle cx="60" cy="62" :r="ballR" :fill="tone" stroke="#4a5568" stroke-width="3" />
      <ellipse :cx="60 - ballR * 0.28" :cy="62 - ballR * 0.28" :rx="ballR * 0.22" :ry="ballR * 0.16" fill="#fff" opacity=".55" />
    </svg>
    <svg v-else-if="name === 'circle'" class="pic" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="36" :fill="tone" stroke="#4a5568" stroke-width="3" />
      <ellipse cx="46" cy="48" rx="8" ry="10" fill="#fff" opacity=".4" />
    </svg>
    <svg v-else-if="name === 'square'" class="pic" viewBox="0 0 120 120">
      <rect x="26" y="26" width="68" height="68" rx="14" :fill="tone" stroke="#4a5568" stroke-width="3" />
      <rect x="36" y="34" width="22" height="14" rx="7" fill="#fff" opacity=".35" />
    </svg>
    <svg v-else-if="name === 'triangle'" class="pic" viewBox="0 0 120 120">
      <path d="M60 18l40 78H20z" :fill="tone" stroke="#4a5568" stroke-width="3" stroke-linejoin="round" />
      <path d="M52 48l6-10 4 8" fill="none" stroke="#fff" stroke-width="4" opacity=".6" stroke-linecap="round" />
    </svg>
    <svg v-else-if="name === 'block-square'" class="pic" viewBox="0 0 120 120">
      <ellipse cx="60" cy="108" rx="30" ry="6" fill="rgba(80,60,40,.12)" />
      <rect :x="bx" :y="by" :width="block" :height="block" rx="12" :fill="tone" stroke="#4a5568" stroke-width="3" />
      <path :d="`M${bx + 8} ${by + 14}h${block * 0.35}`" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".55" />
    </svg>
    <svg v-else-if="name === 'block-round'" class="pic" viewBox="0 0 120 120">
      <ellipse cx="60" cy="108" rx="30" ry="6" fill="rgba(80,60,40,.12)" />
      <circle cx="60" cy="62" :r="block / 2" :fill="tone" stroke="#4a5568" stroke-width="3" />
      <ellipse cx="48" cy="50" rx="8" ry="10" fill="#fff" opacity=".4" />
    </svg>
    <svg v-else-if="name === 'star'" class="pic" viewBox="0 0 120 120">
      <path d="M60 16l12 28 30 3-23 18 7 29-26-16-26 16 7-29-23-18 30-3z" fill="#ffd23f" stroke="#4a5568" stroke-width="3" stroke-linejoin="round" />
    </svg>
    <svg v-else-if="name === 'basket'" class="pic" viewBox="0 0 120 120">
      <path d="M24 48h72l-8 48a16 16 0 0 1-16 12H48a16 16 0 0 1-16-12z" fill="#f4d7a6" stroke="#4a5568" stroke-width="3" />
      <path d="M30 64h60M34 80h52M38 96h44" stroke="#e0b878" stroke-width="3" />
      <path d="M20 48h80" :stroke="tone" stroke-width="10" stroke-linecap="round" />
      <ellipse cx="60" cy="48" rx="36" ry="10" :fill="tone" stroke="#4a5568" stroke-width="3" />
    </svg>
    <svg v-else-if="name === 'box'" class="pic" viewBox="0 0 120 120">
      <path d="M24 50l36-16 36 16-36 16z" :fill="tone" stroke="#4a5568" stroke-width="3" />
      <path d="M24 50v36l36 16V66z" fill="#fff" opacity=".35" stroke="#4a5568" stroke-width="3" />
      <path d="M96 50v36L60 102V66z" :fill="tone" stroke="#4a5568" stroke-width="3" />
    </svg>
    <svg v-else-if="name === 'hoop-circle'" class="pic" viewBox="0 0 120 120">
      <ellipse cx="60" cy="78" rx="40" ry="16" fill="none" stroke="#7aa2ff" stroke-width="6" stroke-dasharray="6 5" />
      <ellipse cx="60" cy="70" rx="40" ry="16" fill="#e7f0ff" stroke="#4a5568" stroke-width="3" />
    </svg>
    <svg v-else-if="name === 'hoop-square'" class="pic" viewBox="0 0 120 120">
      <rect x="24" y="58" width="72" height="36" rx="8" fill="#fff4d6" stroke="#4a5568" stroke-width="3" />
      <rect x="32" y="40" width="56" height="28" rx="6" fill="none" stroke="#f5c542" stroke-width="6" stroke-dasharray="6 5" />
    </svg>
    <svg v-else-if="name === 'duck' || name === 'duckling'" class="pic" viewBox="0 0 120 120">
      <ellipse cx="62" cy="78" :rx="name === 'duckling' ? 26 : 32" ry="20" fill="#ffd23f" stroke="#4a5568" stroke-width="3" />
      <circle :cx="name === 'duckling' ? 78 : 84" cy="58" :r="name === 'duckling' ? 16 : 18" fill="#ffe14a" stroke="#4a5568" stroke-width="3" />
      <circle :cx="name === 'duckling' ? 84 : 90" cy="54" r="2.2" fill="#3d4a5c" />
      <path :d="name === 'duckling' ? 'M92 60h12l-6 5z' : 'M100 60h16l-8 6z'" fill="#ff9f43" stroke="#4a5568" stroke-width="3" />
      <ellipse cx="48" cy="96" rx="8" ry="4" fill="#ff9f43" />
    </svg>
    <svg v-else-if="name === 'hen'" class="pic" viewBox="0 0 120 120">
      <ellipse cx="60" cy="78" rx="32" ry="22" fill="#fff" stroke="#4a5568" stroke-width="3" />
      <circle cx="86" cy="58" r="16" fill="#fff" stroke="#4a5568" stroke-width="3" />
      <path d="M80 44l6-10 6 10 6-8 4 10" fill="#ff5a6a" stroke="#4a5568" stroke-width="2" />
      <circle cx="92" cy="56" r="2" fill="#3d4a5c" />
      <path d="M100 62h12l-6 5z" fill="#ff9f43" stroke="#4a5568" stroke-width="3" />
    </svg>
    <svg v-else-if="name === 'chick'" class="pic" viewBox="0 0 120 120">
      <circle cx="60" cy="70" r="26" fill="#ffe14a" stroke="#4a5568" stroke-width="3" />
      <circle cx="70" cy="64" r="2" fill="#3d4a5c" />
      <path d="M78 70h12l-6 5z" fill="#ff9f43" stroke="#4a5568" stroke-width="3" />
      <path d="M48 48l6-8 8 8" fill="none" stroke="#ff9f43" stroke-width="3" />
    </svg>
    <svg v-else-if="name === 'cat'" class="pic" viewBox="0 0 120 120">
      <path d="M34 58l8-24 14 16" fill="#ffb067" stroke="#4a5568" stroke-width="3" />
      <path d="M86 58l-8-24-14 16" fill="#ffb067" stroke="#4a5568" stroke-width="3" />
      <circle cx="60" cy="70" r="30" fill="#ffb067" stroke="#4a5568" stroke-width="3" />
      <ellipse cx="48" cy="70" rx="6" ry="7" fill="#fff" />
      <ellipse cx="72" cy="70" rx="6" ry="7" fill="#fff" />
      <circle cx="48" cy="71" r="2.4" fill="#3d4a5c" /><circle cx="72" cy="71" r="2.4" fill="#3d4a5c" />
      <path d="M56 80h8l-4 4z" fill="#ff8fab" />
      <path d="M30 78h16M74 78h16" stroke="#4a5568" stroke-width="2" stroke-linecap="round" />
    </svg>
    <svg v-else-if="name === 'rabbit'" class="pic" viewBox="0 0 120 120">
      <ellipse cx="46" cy="36" rx="8" ry="20" fill="#f4f1ea" stroke="#4a5568" stroke-width="3" />
      <ellipse cx="74" cy="36" rx="8" ry="20" fill="#f4f1ea" stroke="#4a5568" stroke-width="3" />
      <ellipse cx="46" cy="38" rx="3" ry="12" fill="#ffb7c8" />
      <ellipse cx="74" cy="38" rx="3" ry="12" fill="#ffb7c8" />
      <circle cx="60" cy="74" r="28" fill="#f7f4ee" stroke="#4a5568" stroke-width="3" />
      <circle cx="50" cy="70" r="3" fill="#3d4a5c" /><circle cx="70" cy="70" r="3" fill="#3d4a5c" />
      <path d="M56 80h8l-4 3z" fill="#ff8fab" />
    </svg>
    <svg v-else-if="name === 'bear'" class="pic" viewBox="0 0 120 120">
      <circle cx="36" cy="48" r="12" fill="#e0a868" stroke="#4a5568" stroke-width="3" />
      <circle cx="84" cy="48" r="12" fill="#e0a868" stroke="#4a5568" stroke-width="3" />
      <circle cx="60" cy="72" r="30" fill="#f3c7a1" stroke="#4a5568" stroke-width="3" />
      <ellipse cx="60" cy="80" rx="12" ry="8" fill="#fff" />
      <circle cx="50" cy="68" r="3" fill="#3d4a5c" /><circle cx="70" cy="68" r="3" fill="#3d4a5c" />
      <path d="M56 78h8l-4 4z" fill="#7a4b32" />
    </svg>
    <svg v-else-if="name === 'lion'" class="pic" viewBox="0 0 120 120">
      <circle cx="60" cy="66" r="34" fill="#f0b429" stroke="#4a5568" stroke-width="3" />
      <circle cx="60" cy="70" r="20" fill="#f6d3b0" stroke="#4a5568" stroke-width="3" />
      <circle cx="52" cy="68" r="2.4" fill="#3d4a5c" /><circle cx="68" cy="68" r="2.4" fill="#3d4a5c" />
      <path d="M56 78h8l-4 3z" fill="#ff8fab" />
    </svg>
    <svg v-else-if="name === 'cow'" class="pic" viewBox="0 0 120 120">
      <ellipse cx="60" cy="74" rx="34" ry="26" fill="#fff" stroke="#4a5568" stroke-width="3" />
      <circle cx="40" cy="62" r="10" fill="#4a5568" /><circle cx="78" cy="58" r="8" fill="#4a5568" />
      <circle cx="60" cy="50" r="16" fill="#fff" stroke="#4a5568" stroke-width="3" />
      <path d="M50 40l-6-12M70 40l6-12" stroke="#4a5568" stroke-width="3" stroke-linecap="round" />
      <circle cx="54" cy="50" r="2" fill="#3d4a5c" /><circle cx="66" cy="50" r="2" fill="#3d4a5c" />
      <ellipse cx="60" cy="58" rx="6" ry="4" fill="#ffb7c8" />
    </svg>
    <svg v-else-if="name === 'monkey'" class="pic" viewBox="0 0 120 120">
      <circle cx="40" cy="70" r="12" fill="#e0a868" stroke="#4a5568" stroke-width="3" />
      <circle cx="80" cy="70" r="12" fill="#e0a868" stroke="#4a5568" stroke-width="3" />
      <circle cx="60" cy="64" r="26" fill="#f3c7a1" stroke="#4a5568" stroke-width="3" />
      <ellipse cx="60" cy="72" rx="12" ry="10" fill="#f6d3b0" stroke="#4a5568" stroke-width="3" />
      <circle cx="50" cy="60" r="3" fill="#3d4a5c" /><circle cx="70" cy="60" r="3" fill="#3d4a5c" />
    </svg>
    <svg v-else-if="name === 'bird'" class="pic" viewBox="0 0 120 120">
      <ellipse cx="58" cy="70" rx="28" ry="20" fill="#7ec8f0" stroke="#4a5568" stroke-width="3" />
      <circle cx="82" cy="58" r="14" fill="#b9e3fb" stroke="#4a5568" stroke-width="3" />
      <path d="M94 60h14l-8 5z" fill="#ff9f43" stroke="#4a5568" stroke-width="3" />
      <circle cx="86" cy="54" r="2" fill="#3d4a5c" />
      <path d="M30 66c10-16 20-8 24 2" fill="none" stroke="#4a5568" stroke-width="3" />
    </svg>
    <svg v-else-if="name === 'fish'" class="pic" viewBox="0 0 120 120">
      <ellipse cx="58" cy="62" rx="32" ry="20" :fill="tone" stroke="#4a5568" stroke-width="3" />
      <path d="M88 62l22-16v32z" :fill="tone" stroke="#4a5568" stroke-width="3" />
      <circle cx="40" cy="58" r="3" fill="#3d4a5c" />
      <path d="M52 48c6 6 6 14 0 20" fill="none" stroke="#fff" stroke-width="3" opacity=".7" />
    </svg>
    <svg v-else-if="name === 'umbrella'" class="pic" viewBox="0 0 120 120">
      <path d="M20 62c0-24 18-40 40-40s40 16 40 40z" fill="#4c8dff" stroke="#4a5568" stroke-width="3" />
      <path d="M20 62h80" stroke="#4a5568" stroke-width="3" />
      <path d="M60 62v28a10 10 0 0 0 14 8" fill="none" stroke="#4a5568" stroke-width="3" stroke-linecap="round" />
    </svg>
    <svg v-else-if="name === 'sunglasses'" class="pic" viewBox="0 0 120 120">
      <rect x="16" y="48" width="36" height="26" rx="8" fill="#3d4a5c" stroke="#4a5568" stroke-width="3" />
      <rect x="68" y="48" width="36" height="26" rx="8" fill="#3d4a5c" stroke="#4a5568" stroke-width="3" />
      <path d="M52 58h16" stroke="#4a5568" stroke-width="3" />
    </svg>
    <svg v-else-if="name === 'coat'" class="pic" viewBox="0 0 120 120">
      <path d="M40 36l20 12 20-12 16 18-10 8v40H34V62l-10-8z" fill="#ff7f9f" stroke="#4a5568" stroke-width="3" />
      <circle cx="60" cy="40" r="8" fill="#f6d3b0" stroke="#4a5568" stroke-width="3" />
    </svg>
    <svg v-else-if="name === 'swimsuit'" class="pic" viewBox="0 0 120 120">
      <path d="M40 40h40l-6 48H46z" fill="#4c8dff" stroke="#4a5568" stroke-width="3" />
      <path d="M48 40c4 10 20 10 24 0" fill="none" stroke="#4a5568" stroke-width="3" />
    </svg>
    <svg v-else-if="name === 'sandal'" class="pic" viewBox="0 0 120 120">
      <path d="M28 70c8-18 56-18 68 0v12H28z" fill="#ffb067" stroke="#4a5568" stroke-width="3" />
      <path d="M42 62c6-12 28-12 36 0" fill="none" stroke="#4a5568" stroke-width="3" />
    </svg>
    <svg v-else-if="name === 'shoe'" class="pic" viewBox="0 0 120 120">
      <path d="M24 72c8-20 28-28 48-20l24 8v16H24z" fill="#7aa2ff" stroke="#4a5568" stroke-width="3" />
      <path d="M28 76h68" stroke="#fff" stroke-width="3" opacity=".6" />
    </svg>
    <svg v-else-if="name === 'bag'" class="pic" viewBox="0 0 120 120">
      <rect x="32" y="48" width="56" height="44" rx="12" fill="#ffb067" stroke="#4a5568" stroke-width="3" />
      <path d="M46 48c0-12 8-20 14-20s14 8 14 20" fill="none" stroke="#4a5568" stroke-width="3" />
    </svg>
    <svg v-else-if="name === 'door'" class="pic" viewBox="0 0 120 120">
      <rect x="34" y="24" width="52" height="76" rx="8" fill="#e7b878" stroke="#4a5568" stroke-width="3" />
      <circle cx="74" cy="64" r="4" fill="#ffd23f" stroke="#4a5568" stroke-width="2" />
      <path d="M46 36h28M46 86h28" stroke="#d7a35a" stroke-width="3" />
    </svg>
    <svg v-else-if="name === 'toothbrush'" class="pic" viewBox="0 0 120 120">
      <rect x="28" y="52" width="64" height="12" rx="6" fill="#7ec8f0" stroke="#4a5568" stroke-width="3" />
      <rect x="78" y="40" width="18" height="28" rx="6" fill="#fff" stroke="#4a5568" stroke-width="3" />
      <path d="M82 48v4M88 48v4M94 48v4" stroke="#4a5568" stroke-width="2" />
    </svg>
    <svg v-else-if="name === 'cup'" class="pic" viewBox="0 0 120 120">
      <path d="M36 40h40l-6 48H42z" fill="#d7eefb" stroke="#4a5568" stroke-width="3" />
      <path d="M76 48h12a12 12 0 0 1 0 24H74" fill="none" stroke="#4a5568" stroke-width="3" />
    </svg>
    <svg v-else-if="name === 'faucet'" class="pic" viewBox="0 0 120 120">
      <rect x="28" y="36" width="28" height="16" rx="6" fill="#c5d0dc" stroke="#4a5568" stroke-width="3" />
      <path d="M48 44h28v10H56" fill="none" stroke="#4a5568" stroke-width="6" stroke-linecap="round" />
      <path d="M70 54c0 16 4 28 4 28" fill="none" stroke="#7ec8f0" stroke-width="4" stroke-linecap="round" />
      <ellipse cx="60" cy="92" rx="22" ry="8" fill="#e7f0ff" stroke="#4a5568" stroke-width="3" />
    </svg>
    <svg v-else-if="name === 'hands'" class="pic" viewBox="0 0 120 120">
      <ellipse cx="46" cy="70" rx="18" ry="24" fill="#f6d3b0" stroke="#4a5568" stroke-width="3" />
      <ellipse cx="74" cy="70" rx="18" ry="24" fill="#f6d3b0" stroke="#4a5568" stroke-width="3" />
      <circle cx="46" cy="86" r="6" fill="#fff" opacity=".7" /><circle cx="70" cy="80" r="5" fill="#fff" opacity=".7" />
    </svg>
    <svg v-else-if="name === 'towel'" class="pic" viewBox="0 0 120 120">
      <rect x="34" y="28" width="52" height="68" rx="10" fill="#9ad7ff" stroke="#4a5568" stroke-width="3" />
      <path d="M34 46h52" stroke="#fff" stroke-width="6" />
    </svg>
    <svg v-else-if="name === 'doll'" class="pic" viewBox="0 0 120 120">
      <circle cx="60" cy="40" r="16" fill="#f6d3b0" stroke="#4a5568" stroke-width="3" />
      <path d="M44 58h32l-4 40H48z" fill="#ff8fb8" stroke="#4a5568" stroke-width="3" />
      <circle cx="54" cy="38" r="2" fill="#3d4a5c" /><circle cx="66" cy="38" r="2" fill="#3d4a5c" />
      <path d="M48 28c4-8 20-8 24 0" fill="#ffd23f" stroke="#4a5568" stroke-width="3" />
    </svg>
    <svg v-else-if="name === 'toybox'" class="pic" viewBox="0 0 120 120">
      <path d="M22 48h76v12H22z" fill="#ffd23f" stroke="#4a5568" stroke-width="3" />
      <path d="M26 60h68l-6 36H32z" fill="#ff9f43" stroke="#4a5568" stroke-width="3" />
      <circle cx="60" cy="78" r="6" fill="#fff" stroke="#4a5568" stroke-width="2" />
    </svg>
    <svg v-else-if="name === 'trash'" class="pic" viewBox="0 0 120 120">
      <path d="M36 44h48l-4 52H40z" fill="#9aa5b5" stroke="#4a5568" stroke-width="3" />
      <path d="M32 40h56" stroke="#4a5568" stroke-width="4" stroke-linecap="round" />
      <path d="M50 32h20" stroke="#4a5568" stroke-width="4" stroke-linecap="round" />
    </svg>
    <svg v-else-if="name === 'paper'" class="pic" viewBox="0 0 120 120">
      <path d="M40 36h28l16 16v36H40z" fill="#fff" stroke="#4a5568" stroke-width="3" />
      <path d="M68 36v16h16" fill="#e7eef6" stroke="#4a5568" stroke-width="3" />
    </svg>
    <svg v-else-if="name === 'stone'" class="pic" viewBox="0 0 120 120">
      <ellipse cx="60" cy="70" rx="32" ry="22" fill="#b7c0cc" stroke="#4a5568" stroke-width="3" />
      <ellipse cx="48" cy="64" rx="8" ry="5" fill="#fff" opacity=".4" />
    </svg>
    <svg v-else-if="name === 'bed'" class="pic" viewBox="0 0 120 120">
      <path d="M22 70h76v22H22z" fill="#7aa2ff" stroke="#4a5568" stroke-width="3" />
      <rect x="26" y="54" width="24" height="16" rx="6" fill="#fff" stroke="#4a5568" stroke-width="3" />
      <path d="M22 92v8M98 92v8" stroke="#4a5568" stroke-width="4" stroke-linecap="round" />
    </svg>
    <svg v-else-if="name === 'slide'" class="pic" viewBox="0 0 120 120">
      <path d="M30 30h10v28" stroke="#4a5568" stroke-width="4" />
      <path d="M30 58c28 0 40 10 62 28" fill="none" stroke="#ff9f43" stroke-width="10" stroke-linecap="round" />
      <path d="M24 34h22" stroke="#5dca8a" stroke-width="6" stroke-linecap="round" />
    </svg>
    <svg v-else-if="name === 'nest'" class="pic" viewBox="0 0 120 120">
      <path d="M24 70c8 22 64 22 72 0-10 8-62 8-72 0z" fill="#e0a868" stroke="#4a5568" stroke-width="3" />
      <circle cx="48" cy="66" r="7" fill="#fff" stroke="#4a5568" stroke-width="2" />
      <circle cx="66" cy="64" r="7" fill="#fff6e0" stroke="#4a5568" stroke-width="2" />
      <path d="M40 40c10-16 28-8 30 6" fill="none" stroke="#6b8f71" stroke-width="3" />
    </svg>
    <svg v-else-if="name === 'pond'" class="pic" viewBox="0 0 120 120">
      <ellipse cx="60" cy="70" rx="40" ry="22" fill="#7ec8f0" stroke="#4a5568" stroke-width="3" />
      <path d="M36 70c6-6 10-6 16 0s10 6 16 0 10-6 16 0" fill="none" stroke="#fff" stroke-width="3" />
    </svg>
    <svg v-else-if="name === 'grass'" class="pic" viewBox="0 0 120 120">
      <path d="M10 78c16-8 24 8 40 0s24 8 40 0 20 6 24 0v22H10z" fill="#7dcea0" stroke="#4a5568" stroke-width="3" />
      <circle cx="40" cy="70" r="5" fill="#ff8fb8" /><circle cx="78" cy="66" r="5" fill="#ffd23f" />
    </svg>
    <svg v-else-if="name === 'car'" class="pic" viewBox="0 0 120 120">
      <path d="M22 70l12-22h40l16 22z" fill="#ff7f9f" stroke="#4a5568" stroke-width="3" />
      <rect x="18" y="68" width="84" height="18" rx="6" fill="#4c8dff" stroke="#4a5568" stroke-width="3" />
      <circle cx="40" cy="90" r="8" fill="#3d4a5c" /><circle cx="82" cy="90" r="8" fill="#3d4a5c" />
    </svg>
    <svg v-else-if="name === 'barn'" class="pic" viewBox="0 0 120 120">
      <path d="M20 56l40-26 40 26v40H20z" fill="#ff6b6b" stroke="#4a5568" stroke-width="3" />
      <rect x="48" y="70" width="24" height="26" fill="#f4d7a6" stroke="#4a5568" stroke-width="3" />
    </svg>
    <svg v-else-if="name === 'rocket'" class="pic" viewBox="0 0 120 120">
      <path d="M60 16c18 16 22 40 18 62H42c-4-22 0-46 18-62z" fill="#f7fbff" stroke="#4a5568" stroke-width="3" />
      <circle cx="60" cy="48" r="8" fill="#7ec8f0" stroke="#4a5568" stroke-width="3" />
      <path d="M42 70l-12 16 16-4M78 70l12 16-16-4" fill="#ff7f9f" stroke="#4a5568" stroke-width="3" />
      <path d="M52 84c4 14 12 14 16 0" fill="#ff9f43" />
    </svg>
    <!-- 没有对应插画时，画一个微笑占位，避免空白 -->
    <svg v-else class="pic" viewBox="0 0 120 120">
      <circle cx="60" cy="62" r="36" fill="#fff8ef" stroke="#4a5568" stroke-width="3" />
      <circle cx="48" cy="56" r="4" fill="#4a5568" /><circle cx="72" cy="56" r="4" fill="#4a5568" />
      <path d="M46 74c8 8 20 8 28 0" fill="none" stroke="#4a5568" stroke-width="3" stroke-linecap="round" />
    </svg>
  </div>
</template>

<style scoped>
.wrap { width: 100%; height: 100%; }
.wrap.shadow { filter: brightness(0.38) saturate(0.2); }
.pic { width: 100%; height: 100%; display: block; overflow: visible; }
</style>
