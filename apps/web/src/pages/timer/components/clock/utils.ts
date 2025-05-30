/**
 * @description: 剩余时间转换为显示数组
 */
export function getTimeArr(time?: number): number[] {
  if (time !== undefined) {
    // time是秒数，需要转换为时分秒
    const totalSeconds = Math.max(0, Math.floor(time));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return [
      ...toArr(hours),
      ...toArr(minutes),
      ...toArr(seconds),
    ];
  }
  
  // 如果没有传入时间，返回当前时间的时分秒
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();
  return [
    ...toArr(h),
    ...toArr(m),
    ...toArr(s),
  ];
}

// 更换数组类型
function toArr(n: number) {
  return n >= 10 ? ("" + n).split("").map((item) => Number(item)) : [0, n];
}
