import { ratingToLevel, levelToRange } from "../domain/rating/initialRating";
import { RATING_CONFIG } from "../config/rating";

describe("Functions: Shared Domain Logic Integration", () => {
  it("Functions phải import và thực thi được logic từ src/domain", () => {
    const levelNumber = ratingToLevel(1450);
    const levelDetails = levelToRange(levelNumber);
    expect(levelNumber).toBe(3);
    expect(levelDetails.name).toBe("TB");
  });

  it("Functions phải đọc được cấu hình RATING_CONFIG từ src/config", () => {
    expect(RATING_CONFIG.LEVELS).toHaveLength(6);
    expect(RATING_CONFIG.PROVISIONAL_MATCHES_THRESHOLD).toBe(5);
  });
});
