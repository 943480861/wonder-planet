<script setup lang="ts">
/**
 * 用圆点表示个数。数字只是旁边的小标记，不靠认数字过关。
 */
withDefaults(defineProps<{ n: number; numeral?: boolean }>(), { numeral: true })
</script>

<template>
  <!-- 数量点点 -->
  <span class="dots" :aria-label="`${n}个`">
    <i v-for="i in n" :key="i" />
    <small v-if="numeral">{{ n }}</small>
  </span>
</template>

<style scoped>
.dots {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 22px;
}
.dots i {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ff9f43;
  box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.08);
}
.dots small { color: #5d6b7e; font-size: 14px; margin-left: 2px; }
</style>
