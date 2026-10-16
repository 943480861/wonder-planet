import { computed, ref } from 'vue'

/** 跟着手指走的浮层，避免被下面的框裁切 */
export interface Ghost {
  id: string
  x: number
  y: number
  w: number
  h: number
}

export interface DragEnd {
  id: string
  moved: boolean
  x: number
  y: number
}

/**
 * 指针拖拽。鼠标、触摸、触控笔共用一套。
 * 松手时告诉外面落在哪里；几乎没移动则当成点击。
 */
export function useDrag() {
  const ghost = ref<Ghost | null>(null)
  const moved = ref(false)
  let pointerId = -1
  let offsetX = 0
  let offsetY = 0
  let startX = 0
  let startY = 0
  let onEnd: ((result: DragEnd | null) => void) | null = null

  const ghostStyle = computed(() => {
    if (!ghost.value) return undefined
    return {
      left: `${ghost.value.x}px`,
      top: `${ghost.value.y}px`,
      width: `${ghost.value.w}px`,
      height: `${ghost.value.h}px`,
    }
  })

  /**
   * 卸下窗口上的移动和松手监听。
   */
  function detach(move: (e: PointerEvent) => void, up: (e: PointerEvent) => void): void {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', up)
    window.removeEventListener('pointercancel', up)
  }

  /**
   * 开始拖。
   * @param e 指针按下
   * @param id 被拖动物品的 id
   * @param done 松手或取消时回调
   */
  function start(e: PointerEvent, id: string, done: (result: DragEnd | null) => void): void {
    if (ghost.value) return
    const el = e.currentTarget as HTMLElement
    const rect = el.getBoundingClientRect()
    try {
      el.setPointerCapture(e.pointerId)
    } catch {
      /* 某些内置浏览器不支持时，仍靠 window 监听 */
    }
    pointerId = e.pointerId
    offsetX = e.clientX - rect.left
    offsetY = e.clientY - rect.top
    startX = e.clientX
    startY = e.clientY
    moved.value = false
    onEnd = done
    ghost.value = { id, x: rect.left, y: rect.top, w: rect.width, h: rect.height }

    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId || !ghost.value) return
      ev.preventDefault()
      if (Math.hypot(ev.clientX - startX, ev.clientY - startY) > 8) moved.value = true
      ghost.value = {
        ...ghost.value,
        x: ev.clientX - offsetX,
        y: ev.clientY - offsetY,
      }
    }
    const up = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return
      detach(move, up)
      const result = ghost.value
        ? { id: ghost.value.id, moved: moved.value, x: ev.clientX, y: ev.clientY }
        : null
      ghost.value = null
      pointerId = -1
      const cb = onEnd
      onEnd = null
      cb?.(ev.type === 'pointercancel' ? null : result)
    }
    window.addEventListener('pointermove', move, { passive: false })
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }

  return { ghost, moved, ghostStyle, start }
}

/**
 * 找手指下面的投放区。热区向外扩一圈，孩子放得不太准也能放进去。
 * @param root 只在当前游戏里找，避开弹窗
 * @param x 指针横坐标
 * @param y 指针纵坐标
 * @param slop 向外扩大的像素
 */
export function hitZones(root: HTMLElement | null, x: number, y: number, slop = 32): string | null {
  if (!root) return null
  const zones = [...root.querySelectorAll<HTMLElement>('[data-drop-id]')]
  let best: { id: string; area: number } | null = null
  for (const zone of zones) {
    const rect = zone.getBoundingClientRect()
    const inside =
      x >= rect.left - slop &&
      x <= rect.right + slop &&
      y >= rect.top - slop &&
      y <= rect.bottom + slop
    if (!inside) continue
    const id = zone.dataset.dropId
    if (!id) continue
    const area = rect.width * rect.height
    if (!best || area < best.area) best = { id, area }
  }
  return best?.id ?? null
}
