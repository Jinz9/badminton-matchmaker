import {
  calculateInitialRatingFromAnswers,
  levelToRange,
  ratingToLevel,
} from "../../src/domain/rating/initialRating";
import { RATING_CONFIG } from "../../src/config/rating";

describe("Domain: Tính toán trình độ ban đầu (initialRating)", () => {
  describe("1. Kiểm tra quy đổi từ Cấp độ sang Dải điểm (levelToRange)", () => {
    test("Cấu hình thang điểm phải có đủ 6 cấp", () => {
      expect(RATING_CONFIG.LEVELS.length).toBe(6);
      expect(RATING_CONFIG.PARTNER_FINDER_MAX_ELO_DIFF).toBe(150);
    });

    test("Hợp lệ cho cả 6 cấp độ", () => {
      for (let lvl = 1; lvl <= 6; lvl++) {
        const range = levelToRange(lvl);
        expect(range.level).toBe(lvl);
        expect(range.minRating).toBeLessThan(range.maxRating);
        expect(range.defaultRating).toBeGreaterThanOrEqual(range.minRating);
        expect(range.defaultRating).toBeLessThanOrEqual(range.maxRating);
      }
    });

    test("Cấp độ không hợp lệ (< 1 hoặc > 6) phải ném ngoại lệ", () => {
      expect(() => levelToRange(0)).toThrow();
      expect(() => levelToRange(7)).toThrow();
      expect(() => levelToRange(2.5)).toThrow();
    });
  });

  describe("2. Kiểm tra quy đổi từ Điểm Elo sang Cấp độ (ratingToLevel)", () => {
    test("Điểm biên chính xác của từng cấp", () => {
      expect(ratingToLevel(1000)).toBe(1);
      expect(ratingToLevel(1199)).toBe(1);

      expect(ratingToLevel(1200)).toBe(2);
      expect(ratingToLevel(1349)).toBe(2);

      expect(ratingToLevel(1350)).toBe(3);
      expect(ratingToLevel(1499)).toBe(3);

      expect(ratingToLevel(1500)).toBe(4);
      expect(ratingToLevel(1649)).toBe(4);

      expect(ratingToLevel(1650)).toBe(5);
      expect(ratingToLevel(1799)).toBe(5);

      expect(ratingToLevel(1800)).toBe(6);
      expect(ratingToLevel(2000)).toBe(6);
    });

    test("Điểm ngoài dải (dưới 1000 hoặc trên 2000)", () => {
      expect(ratingToLevel(800)).toBe(1);  // Dưới min -> Cấp 1
      expect(ratingToLevel(2150)).toBe(6); // Trên max -> Cấp 6
    });

    test("Điểm không hợp lệ phải ném ngoại lệ", () => {
      expect(() => ratingToLevel(NaN)).toThrow();
    });
  });

  describe("3. Kiểm tra tính điểm khởi tạo từ Bảng câu hỏi (calculateInitialRatingFromAnswers)", () => {
    test("Biên điểm cấp 1: Tổng 10 điểm (toàn 1) và 14 điểm -> Cấp 1 (1100)", () => {
      const all1 = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]; // 10 điểm
      const res1 = calculateInitialRatingFromAnswers(all1);
      expect(res1.level).toBe(1);
      expect(res1.initialRating).toBe(1100);
      expect(res1.isProvisional).toBe(true);

      const score14 = [2, 2, 2, 2, 1, 1, 1, 1, 1, 1]; // 14 điểm
      expect(calculateInitialRatingFromAnswers(score14).level).toBe(1);
    });

    test("Biên điểm cấp 2: Tổng 15 điểm và 20 điểm -> Cấp 2 (1275)", () => {
      const score15 = [2, 2, 2, 2, 2, 1, 1, 1, 1, 1]; // 15 điểm
      expect(calculateInitialRatingFromAnswers(score15).level).toBe(2);
      expect(calculateInitialRatingFromAnswers(score15).initialRating).toBe(1275);

      const score20 = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2]; // 20 điểm
      expect(calculateInitialRatingFromAnswers(score20).level).toBe(2);
    });

    test("Biên điểm cấp 3: Tổng 21 điểm và 27 điểm -> Cấp 3 (1425)", () => {
      const score21 = [3, 2, 2, 2, 2, 2, 2, 2, 2, 2]; // 21 điểm
      expect(calculateInitialRatingFromAnswers(score21).level).toBe(3);
      expect(calculateInitialRatingFromAnswers(score21).initialRating).toBe(1425);

      const score27 = [3, 3, 3, 3, 3, 3, 3, 2, 2, 2]; // 27 điểm
      expect(calculateInitialRatingFromAnswers(score27).level).toBe(3);
    });

    test("Biên điểm cấp 4: Tổng 28 điểm và 33 điểm -> Cấp 4 (1575)", () => {
      const score28 = [3, 3, 3, 3, 3, 3, 3, 3, 2, 2]; // 28 điểm
      expect(calculateInitialRatingFromAnswers(score28).level).toBe(4);
      expect(calculateInitialRatingFromAnswers(score28).initialRating).toBe(1575);

      const score33 = [4, 4, 4, 3, 3, 3, 3, 3, 3, 3]; // 33 điểm
      expect(calculateInitialRatingFromAnswers(score33).level).toBe(4);
    });

    test("Biên điểm cấp 5: Tổng 34 điểm và 38 điểm -> Cấp 5 (1725)", () => {
      const score34 = [4, 4, 4, 4, 3, 3, 3, 3, 3, 3]; // 34 điểm
      expect(calculateInitialRatingFromAnswers(score34).level).toBe(5);
      expect(calculateInitialRatingFromAnswers(score34).initialRating).toBe(1725);

      const score38 = [4, 4, 4, 4, 4, 4, 4, 4, 3, 3]; // 38 điểm
      expect(calculateInitialRatingFromAnswers(score38).level).toBe(5);
    });

    test("Biên điểm cấp 6: Tổng 39 điểm và 40 điểm (toàn 4) -> Cấp 6 (1900)", () => {
      const score39 = [4, 4, 4, 4, 4, 4, 4, 4, 4, 3]; // 39 điểm
      expect(calculateInitialRatingFromAnswers(score39).level).toBe(6);
      expect(calculateInitialRatingFromAnswers(score39).initialRating).toBe(1900);

      const all4 = [4, 4, 4, 4, 4, 4, 4, 4, 4, 4]; // 40 điểm
      expect(calculateInitialRatingFromAnswers(all4).level).toBe(6);
    });
  });

  describe("4. Kiểm tra xử lý đầu vào lỗi", () => {
    test("Mảng không đủ 10 câu -> Ném ngoại lệ", () => {
      expect(() => calculateInitialRatingFromAnswers([1, 2, 3])).toThrow(
        "Bảng câu hỏi tự đánh giá yêu cầu đúng 10 câu trả lời."
      );
      expect(() => calculateInitialRatingFromAnswers([])).toThrow();
    });

    test("Câu trả lời ngoài khoảng 1..4 -> Ném ngoại lệ", () => {
      expect(() =>
        calculateInitialRatingFromAnswers([1, 2, 3, 4, 5, 1, 2, 3, 4, 1])
      ).toThrow("không hợp lệ");

      expect(() =>
        calculateInitialRatingFromAnswers([1, 2, 3, 0, 2, 1, 2, 3, 4, 1])
      ).toThrow("không hợp lệ");
    });

    test("Câu trả lời chứa số thập phân hoặc không phải số -> Ném ngoại lệ", () => {
      expect(() =>
        calculateInitialRatingFromAnswers([1, 2, 3, 2.5, 2, 1, 2, 3, 4, 1])
      ).toThrow();
    });
  });

  describe("5. Kiểm tra tính đơn điệu (Monotonicity)", () => {
    test("Khi điểm trả lời tăng lên từng câu, tổng điểm và level không được giảm", () => {
      const baseAnswers = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
      let previousScore = calculateInitialRatingFromAnswers(baseAnswers).totalScore;
      let previousLevel = calculateInitialRatingFromAnswers(baseAnswers).level;

      for (let i = 0; i < 10; i++) {
        for (let val = 2; val <= 4; val++) {
          baseAnswers[i] = val;
          const current = calculateInitialRatingFromAnswers(baseAnswers);
          expect(current.totalScore).toBeGreaterThanOrEqual(previousScore);
          expect(current.level).toBeGreaterThanOrEqual(previousLevel);
          previousScore = current.totalScore;
          previousLevel = current.level;
        }
      }
    });
  });
});
