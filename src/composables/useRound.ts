import { ref, watch } from 'vue'

/**
 * 一关里的对错和结束。错两次就加强提示；结束只发出一次。
 * @param emit 交给页面去播放声音和弹窗
 * @param assistTick 家长或孩子点了“提示”的次数
 */
export function useRound(
  emit: {
    (event: 'wrong'): void
    (event: 'right'): void
    (event: 'complete'): void
  },
  assistTick: () => number,
) {
  const wrongs = ref(0)
  const assist = ref(false)
  const finished = ref(false)

  watch(assistTick, (n) => {
    if (n > 0) assist.value = true
  })

  /**
   * 放错了。不扣星，只请外面说一句温和的话。
   */
  function wrong(): void {
    if (finished.value) return
    wrongs.value += 1
    if (wrongs.value >= 2) assist.value = true
    emit('wrong')
  }

  /**
   * 中间做对一步。
   */
  function right(): void {
    if (finished.value) return
    emit('right')
  }

  /**
   * 整关完成。delay 用来等一小段动画。
   * @param delay 多少毫秒后告诉外面
   */
  function complete(delay = 480): void {
    if (finished.value) return
    finished.value = true
    window.setTimeout(() => emit('complete'), delay)
  }

  return { wrongs, assist, finished, wrong, right, complete }
}
