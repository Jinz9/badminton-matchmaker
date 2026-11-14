/**
 * Tính số suất tuyển vãng lai còn lại của một sân cầu lông.
 * Quy tắc nghiệp vụ (R3, R4 từ badminton-domain-rules):
 * - Mỗi sân tối đa 8 người (R2).
 * - Host chỉ tuyển vãng lai khi sân chưa đủ 8 người mặc định (R3).
 * - Tối đa 4 vãng lai trên một sân.
 * - Công thức: slot = min(4, max(0, 8 - coreCount)).
 *
 * @param coreCount Số người mặc định (core members) hiện có trên sân (0 <= coreCount <= 8)
 * @returns Số suất tuyển vãng lai được phép mở
 */
export function computeSlots(coreCount: number): number {
  if (coreCount < 0) {
    throw new Error("Số người mặc định không thể âm");
  }
  if (coreCount >= 8) {
    return 0;
  }
  return Math.min(4, 8 - coreCount);
}

/**
 * Kiểm tra xem sân có còn nhận thêm vãng lai được không.
 */
export function isRecruitmentOpen(coreCount: number, currentRecruitsCount: number): number {
  const maxSlots = computeSlots(coreCount);
  const remainingSlots = maxSlots - currentRecruitsCount;
  return Math.max(0, remainingSlots);
}

