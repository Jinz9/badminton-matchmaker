import { computeSlots, isRecruitmentOpen } from "@domain/slot";

describe("Domain: Tính toán suất tuyển vãng lai (computeSlots)", () => {
  test("S1: Sân có 4 người mặc định -> Tuyển tối đa 4 vãng lai", () => {
    expect(computeSlots(4)).toBe(4);
  });

  test("S2: Sân có 5 người mặc định -> Tuyển 3 vãng lai", () => {
    expect(computeSlots(5)).toBe(3);
  });

  test("S3: Sân có 6 người mặc định -> Tuyển 2 vãng lai", () => {
    expect(computeSlots(6)).toBe(2);
  });

  test("S4: Sân có 7 người mặc định -> Tuyển 1 vãng lai", () => {
    expect(computeSlots(7)).toBe(1);
  });

  test("S5: Sân đã đủ 8 người mặc định -> Không mở tuyển (0 suất)", () => {
    expect(computeSlots(8)).toBe(0);
  });

  test("S6: Sân vượt quá 8 người mặc định -> Trả về 0 suất", () => {
    expect(computeSlots(9)).toBe(0);
  });

  test("S7: Sân có ít người (ví dụ 1, 2, 3) -> Vẫn tối đa 4 suất vãng lai", () => {
    expect(computeSlots(1)).toBe(4);
    expect(computeSlots(2)).toBe(4);
    expect(computeSlots(3)).toBe(4);
  });

  test("S8: Số người âm -> Ném lỗi ngoại lệ", () => {
    expect(() => computeSlots(-1)).toThrow("Số người mặc định không thể âm");
  });

  test("Kiểm tra suất còn lại khi đã có vãng lai đăng ký", () => {
    // 6 mặc định -> max 2 vãng lai, đã có 1 vãng lai được duyệt -> còn 1 suất
    expect(isRecruitmentOpen(6, 1)).toBe(1);
    // 6 mặc định -> max 2 vãng lai, đã có 2 vãng lai -> còn 0 suất
    expect(isRecruitmentOpen(6, 2)).toBe(0);
  });
});
