export function calculatePageCount(total, pageSize) {
  // 由于total是可靠的，所以只校验是否在初始化状态
  if (total === undefined || total === null) return Infinity;
  let count = parseInt(total / pageSize) + 1;
  if (total % pageSize !== 0) {
    count += 1;
  }
  return isNaN(count) ? 1 : count;
}

export function correctPageSize(pageSize, defaultValue) {
  const size = parseInt(pageSize);
  return Number.isInteger(size) ? Math.abs(size) : (defaultValue || 10);
}

export function correctPageIndex(pageIndex, total, pageSize) {
  let pg = parseInt(pageIndex);
  if (!Number.isInteger(pg) || pg < 0) {
    pg = 1;
  }
  const max = calculatePageCount(total, pageSize);
  return Math.min(pg, max);
}

export function getCorrectPager({ pageIndex, pageSize, total }) {
  const size = correctPageSize(pageSize, 10);
  const pg = correctPageIndex(pageIndex, total, size);
  return {
    pageIndex: pg,
    pageSize: size
  };
}

export default {
  calculatePageCount,
  correctPageSize,
  correctPageIndex,
  getCorrectPager
};
