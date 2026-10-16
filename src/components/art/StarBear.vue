<script setup lang="ts">
/**
 * 星星小熊：圆润的小熊宇航员，原创形象。
 * mood 改变表情和手臂，用来欢迎、加油或想一想。
 */
withDefaults(
  defineProps<{
    mood?: 'happy' | 'cheer' | 'think' | 'wave'
    size?: number
  }>(),
  { mood: 'wave', size: 168 },
)
</script>

<template>
  <!-- 引导角色：头盔、星星徽章、挥手 -->
  <svg
    class="bear"
    :class="mood"
    :width="size"
    :height="size * 1.12"
    viewBox="0 0 200 224"
    aria-hidden="true"
  >
    <ellipse cx="100" cy="208" rx="46" ry="8" fill="rgba(80,70,50,.15)" />
    <circle cx="48" cy="78" r="22" fill="#e0a868" stroke="#4a5568" stroke-width="3" />
    <circle cx="152" cy="78" r="22" fill="#e0a868" stroke="#4a5568" stroke-width="3" />
    <circle cx="48" cy="78" r="12" fill="#f3c7a1" />
    <circle cx="152" cy="78" r="12" fill="#f3c7a1" />
    <path d="M70 150c-18 8-24 36-16 52 18 4 36-8 40-24" fill="#7ec8f0" stroke="#4a5568" stroke-width="3" />
    <path d="M130 150c18 8 24 36 16 52-18 4-36-8-40-24" fill="#7ec8f0" stroke="#4a5568" stroke-width="3" />
    <ellipse cx="100" cy="156" rx="48" ry="46" fill="#8ed4f8" stroke="#4a5568" stroke-width="3" />
    <circle cx="100" cy="118" r="46" fill="#f6d3b0" stroke="#4a5568" stroke-width="3" />
    <path d="M62 104c4-28 22-40 38-40s34 12 38 40" fill="none" stroke="#d7eefb" stroke-width="8" />
    <path d="M58 108c2-36 28-52 42-52s40 16 42 52c-10 8-22 12-42 12s-32-4-42-12z" fill="#f7fbff" stroke="#4a5568" stroke-width="3" />
    <path d="M78 96h44c2 16-8 26-22 26s-24-10-22-26z" fill="#c5ecff" opacity=".85" />
    <g class="eyes">
      <ellipse cx="86" cy="118" rx="5" ry="6" fill="#3d4a5c" />
      <ellipse cx="114" cy="118" rx="5" ry="6" fill="#3d4a5c" />
      <circle cx="88" cy="116" r="1.6" fill="#fff" />
      <circle cx="116" cy="116" r="1.6" fill="#fff" />
    </g>
    <ellipse cx="74" cy="130" rx="7" ry="4" fill="#ffb7c8" opacity=".8" />
    <ellipse cx="126" cy="130" rx="7" ry="4" fill="#ffb7c8" opacity=".8" />
    <path
      v-if="mood === 'think'"
      d="M90 138h20"
      fill="none"
      stroke="#4a5568"
      stroke-width="3"
      stroke-linecap="round"
    />
    <path
      v-else
      d="M88 136c6 8 18 8 24 0"
      fill="none"
      stroke="#4a5568"
      stroke-width="3"
      stroke-linecap="round"
    />
    <path d="M92 70l3 7 7 1-5 4 2 7-7-4-7 4 2-7-5-4 7-1z" fill="#ffd23f" stroke="#4a5568" stroke-width="2" />
    <circle cx="100" cy="162" r="10" fill="#ffd23f" stroke="#4a5568" stroke-width="2" />
    <path d="M100 156l1.6 3.4 3.6.4-2.7 2.4.8 3.6L100 164l-3.3 1.8.8-3.6-2.7-2.4 3.6-.4z" fill="#fff" />
    <g class="arm left">
      <path d="M58 150c-16 2-22 18-16 28" fill="none" stroke="#4a5568" stroke-width="8" stroke-linecap="round" />
      <circle cx="40" cy="180" r="8" fill="#f6d3b0" stroke="#4a5568" stroke-width="3" />
    </g>
    <g class="arm right">
      <path d="M142 150c16 2 22 18 16 28" fill="none" stroke="#4a5568" stroke-width="8" stroke-linecap="round" />
      <circle cx="160" cy="180" r="8" fill="#f6d3b0" stroke="#4a5568" stroke-width="3" />
    </g>
  </svg>
</template>

<style scoped>
.bear { display: block; overflow: visible; }
.eyes { transform-origin: 100px 118px; animation: blink 5.2s infinite; }
.wave .arm.right { transform-origin: 142px 150px; animation: wave 1.6s ease-in-out infinite; }
.cheer .arm.left { transform-origin: 58px 150px; transform: rotate(28deg); }
.cheer .arm.right { transform-origin: 142px 150px; transform: rotate(-28deg); }
@keyframes blink {
  0%, 46%, 52%, 100% { transform: scaleY(1); }
  49% { transform: scaleY(0.12); }
}
@keyframes wave {
  0%, 100% { transform: rotate(8deg); }
  50% { transform: rotate(-18deg); }
}
</style>
