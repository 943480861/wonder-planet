/**
 * 打乱副本的顺序，不改关卡原数据。
 * 只改变位置，不改变哪一个是正确答案。
 * @param list 原列表
 */
export function shuffle<T>(list: readonly T[]): T[] {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const cur = arr[i]!
    arr[i] = arr[j]!
    arr[j] = cur
  }
  return arr
}

/** 数量点点对应的口语，最多说到十 */
const COUNT_WORD = ['零', '一', '两', '三', '四', '五', '六', '七', '八', '九', '十']

/**
 * 把个数说成口语。两用“两”，更像对小朋友说话。
 * @param n 个数
 */
export function countWord(n: number): string {
  return COUNT_WORD[n] ?? String(n)
}
