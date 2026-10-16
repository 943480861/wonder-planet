<script setup lang="ts">
/**
 * 每款游戏背后的天空、云朵和小山。
 * 只做气氛，不挡住可以点击的东西。
 */
defineProps<{ theme?: string }>()
</script>

<template>
  <!-- 背景层：慢悠悠的云，不闪烁 -->
  <div class="sky" :class="theme" aria-hidden="true">
    <div class="sun" />
    <span class="cloud c1" />
    <span class="cloud c2" />
    <span class="cloud c3" />
    <div class="hills" />
  </div>
</template>

<style scoped>
.sky {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  background: linear-gradient(180deg, #8ed4f8 0%, #d8f3ff 46%, #fff6e8 100%);
}
.sun {
  position: absolute;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  right: 28px;
  top: 18px;
  background: radial-gradient(circle at 35% 35%, #fff, #ffe082 42%, #ffc46b);
  box-shadow: 0 0 0 10px rgba(255, 224, 130, 0.35);
}
.cloud {
  position: absolute;
  height: 28px;
  border-radius: 20px;
  background: #fff;
  opacity: 0.9;
  animation: drift 18s linear infinite;
}
.cloud::before, .cloud::after {
  content: "";
  position: absolute;
  background: #fff;
  border-radius: 50%;
}
.cloud::before { width: 28px; height: 28px; left: 12px; top: -14px; }
.cloud::after { width: 36px; height: 36px; left: 32px; top: -18px; }
.c1 { width: 86px; top: 36px; left: -20px; }
.c2 { width: 70px; top: 90px; left: 40%; animation-duration: 26s; }
.c3 { width: 54px; top: 58px; right: -10px; animation-duration: 22s; }
.hills {
  position: absolute;
  left: -10%;
  right: -10%;
  bottom: 0;
  height: 28%;
  background: radial-gradient(120% 100% at 20% 100%, #b7e7c5 40%, transparent 42%),
    radial-gradient(120% 100% at 80% 100%, #9ad7b0 38%, transparent 40%),
    linear-gradient(#c6edcf, #c6edcf);
  border-radius: 50% 50% 0 0;
}
.logic { background: linear-gradient(180deg, #c9b6f5 0%, #efe7ff 48%, #fff6e8 100%); }
.counting { background: linear-gradient(180deg, #ffd9a8 0%, #fff1d6 46%, #fff6e8 100%); }
.life { background: linear-gradient(180deg, #b9d4ff 0%, #e7f1ff 50%, #fff6e8 100%); }
@keyframes drift {
  from { transform: translateX(0); }
  to { transform: translateX(36px); }
}
</style>
