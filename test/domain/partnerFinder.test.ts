import {
  findPartners,
  evaluatePositionCompatibility,
  evaluateHandCompatibility,
} from "../../src/domain/partnerFinder/findPartners";
import { calculatePartnerQueryBounds } from "../../src/domain/partnerFinder/query";
import { UserProfile } from "../../src/domain/types";
import { RATING_CONFIG } from "../../src/config/rating";

describe("Partner Finder Domain Algorithm (WBS 3.1 & CR-02)", () => {
  // Helper tạo mock user nhanh
  const createMockUser = (overrides: Partial<UserProfile> = {}): UserProfile => ({
    uid: "user-default",
    displayName: "Người chơi mẫu",
    gender: "M",
    areaLabel: "Hải Châu",
    position: "both",
    dominantHand: "right",
    selfDeclaredLevel: 3,
    role: "player",
    skill: {
      rating: 1450,
      matchesPlayed: 10,
      reliability: 85,
      isProvisional: false,
    },
    fcmTokens: [],
    schemaVersion: 1,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  });

  describe("1. Ca biên độ lệch Elo (150 vs 151 điểm)", () => {
    const seeker = createMockUser({
      uid: "seeker-1",
      skill: { rating: 1500, matchesPlayed: 12, reliability: 90, isProvisional: false },
    });

    it("chấp nhận ứng viên có độ lệch Elo đúng bằng 150 điểm", () => {
      const candidate150Above = createMockUser({
        uid: "cand-1650",
        skill: { rating: 1650, matchesPlayed: 10, reliability: 80, isProvisional: false },
      });
      const candidate150Below = createMockUser({
        uid: "cand-1350",
        skill: { rating: 1350, matchesPlayed: 10, reliability: 80, isProvisional: false },
      });

      const results = findPartners(seeker, [candidate150Above, candidate150Below]);
      expect(results).toHaveLength(2);
      expect(results.map((r) => r.user.uid)).toContain("cand-1650");
      expect(results.map((r) => r.user.uid)).toContain("cand-1350");
    });

    it("loại bỏ ứng viên có độ lệch Elo từ 151 điểm trở lên", () => {
      const candidate151Above = createMockUser({
        uid: "cand-1651",
        skill: { rating: 1651, matchesPlayed: 10, reliability: 80, isProvisional: false },
      });
      const candidate151Below = createMockUser({
        uid: "cand-1349",
        skill: { rating: 1349, matchesPlayed: 10, reliability: 80, isProvisional: false },
      });

      const results = findPartners(seeker, [candidate151Above, candidate151Below]);
      expect(results).toHaveLength(0);
    });

    it("hỗ trợ nới lỏng biên cho ứng viên Provisional nếu bật allowProvisionalExpansion", () => {
      const provisionalCandidate = createMockUser({
        uid: "cand-prov-170",
        skill: { rating: 1680, matchesPlayed: 2, reliability: 80, isProvisional: true },
      });

      // Mặc định không nới -> bị loại vì lệch 180 > 150
      const standardResults = findPartners(seeker, [provisionalCandidate], {
        allowProvisionalExpansion: false,
      });
      expect(standardResults).toHaveLength(0);

      // Khi bật nới lỏng (tối đa 150 + 50 = 200 điểm) -> được nhận
      const expandedResults = findPartners(seeker, [provisionalCandidate], {
        allowProvisionalExpansion: true,
      });
      expect(expandedResults).toHaveLength(1);
      expect(expandedResults[0].isProvisional).toBe(true);
      expect(expandedResults[0].warnings.length).toBeGreaterThan(0);
    });
  });

  describe("2. Ca cơ bản & Lọc danh sách (Edge cases)", () => {
    const seeker = createMockUser({ uid: "seeker-main" });

    it("trả về mảng rỗng khi danh sách ứng viên rỗng", () => {
      const results = findPartners(seeker, []);
      expect(results).toEqual([]);
    });

    it("tự loại trừ chính mình (seeker không thể ghép với chính mình)", () => {
      const myself = createMockUser({ uid: "seeker-main" });
      const results = findPartners(seeker, [myself]);
      expect(results).toHaveLength(0);
    });

    it("loại bỏ ứng viên đã bị xóa mềm (isDeleted = true)", () => {
      const deletedUser = createMockUser({ uid: "cand-deleted", isDeleted: true });
      const results = findPartners(seeker, [deletedUser]);
      expect(results).toHaveLength(0);
    });

    it("loại bỏ ứng viên nằm trong danh sách excludeUids (block list)", () => {
      const blockedUser = createMockUser({ uid: "cand-blocked" });
      const results = findPartners(seeker, [blockedUser], {
        excludeUids: ["cand-blocked"],
      });
      expect(results).toHaveLength(0);
    });

    it("lọc chính xác theo dải cấp độ levelMin và levelMax", () => {
      const userLevel1 = createMockUser({ uid: "u1", selfDeclaredLevel: 1, skill: { rating: 1400, matchesPlayed: 5, reliability: 80, isProvisional: false } });
      const userLevel3 = createMockUser({ uid: "u3", selfDeclaredLevel: 3, skill: { rating: 1420, matchesPlayed: 5, reliability: 80, isProvisional: false } });
      const userLevel5 = createMockUser({ uid: "u5", selfDeclaredLevel: 5, skill: { rating: 1480, matchesPlayed: 5, reliability: 80, isProvisional: false } });

      const results = findPartners(seeker, [userLevel1, userLevel3, userLevel5], {
        levelMin: 2,
        levelMax: 4,
      });
      expect(results).toHaveLength(1);
      expect(results[0].user.uid).toBe("u3");
    });
  });

  describe("3. Ràng buộc giới tính theo nội dung đánh đôi (Skill badminton-domain-rules)", () => {
    const maleSeeker = createMockUser({ uid: "male-seeker", gender: "M" });
    const femaleSeeker = createMockUser({ uid: "female-seeker", gender: "F" });

    const maleCandidate = createMockUser({ uid: "male-cand", gender: "M" });
    const femaleCandidate = createMockUser({ uid: "female-cand", gender: "F" });

    it("nội dung 'men' (Đôi nam): Chỉ ghép Nam với Nam", () => {
      const resultsFromMale = findPartners(maleSeeker, [maleCandidate, femaleCandidate], {
        category: "men",
      });
      expect(resultsFromMale).toHaveLength(1);
      expect(resultsFromMale[0].user.uid).toBe("male-cand");

      // Nếu Seeker là Nữ tìm đôi nam -> Không hợp lệ
      const resultsFromFemale = findPartners(femaleSeeker, [maleCandidate], {
        category: "men",
      });
      expect(resultsFromFemale).toHaveLength(0);
    });

    it("nội dung 'women' (Đôi nữ): Chỉ ghép Nữ với Nữ", () => {
      const resultsFromFemale = findPartners(femaleSeeker, [maleCandidate, femaleCandidate], {
        category: "women",
      });
      expect(resultsFromFemale).toHaveLength(1);
      expect(resultsFromFemale[0].user.uid).toBe("female-cand");

      // Nếu Seeker là Nam tìm đôi nữ -> Không hợp lệ
      const resultsFromMale = findPartners(maleSeeker, [femaleCandidate], {
        category: "women",
      });
      expect(resultsFromMale).toHaveLength(0);
    });

    it("nội dung 'mixed' (Đôi nam nữ): Bắt buộc khác giới tính", () => {
      // Nam tìm bạn nữ
      const resultsMale = findPartners(maleSeeker, [maleCandidate, femaleCandidate], {
        category: "mixed",
      });
      expect(resultsMale).toHaveLength(1);
      expect(resultsMale[0].user.uid).toBe("female-cand");

      // Nữ tìm bạn nam
      const resultsFemale = findPartners(femaleSeeker, [maleCandidate, femaleCandidate], {
        category: "mixed",
      });
      expect(resultsFemale).toHaveLength(1);
      expect(resultsFemale[0].user.uid).toBe("male-cand");
    });
  });

  describe("4. Ma trận bù trừ vị trí thi đấu (docs/06-rating-scale.md)", () => {
    it("đạt điểm tối đa (30 điểm) cho cặp Front + Back hoặc Back + Front", () => {
      const res1 = evaluatePositionCompatibility("front", "back", 30);
      expect(res1.score).toBe(30);
      expect(res1.reason).toContain("Bù trừ vị trí hoàn hảo");

      const res2 = evaluatePositionCompatibility("back", "front", 30);
      expect(res2.score).toBe(30);
      expect(res2.reason).toContain("Bù trừ vị trí hoàn hảo");
    });

    it("đạt 22 điểm khi 1 người Toàn diện (both) và 1 người chuyên Front/Back", () => {
      const resFront = evaluatePositionCompatibility("both", "front", 30);
      expect(resFront.score).toBe(22);
      expect(resFront.reason).toContain("Lối chơi bổ trợ rất tốt");

      const resBack = evaluatePositionCompatibility("back", "both", 30);
      expect(resBack.score).toBe(22);
    });

    it("đạt 18 điểm khi cả 2 người cùng Toàn diện (both + both)", () => {
      const res = evaluatePositionCompatibility("both", "both", 30);
      expect(res.score).toBe(18);
      expect(res.reason).toContain("Lối chơi toàn diện");
    });

    it("nhận 0 điểm và gắn cảnh báo khi cả 2 cùng Front hoặc cùng Back", () => {
      const resFront = evaluatePositionCompatibility("front", "front", 30);
      expect(resFront.score).toBe(0);
      expect(resFront.warning).toContain("Cả hai cùng thích cầu trước");

      const resBack = evaluatePositionCompatibility("back", "back", 30);
      expect(resBack.score).toBe(0);
      expect(resBack.warning).toContain("Cả hai cùng thích cầu sau");
    });

    it("xử lý an toàn khi thiếu dữ liệu vị trí (undefined/null)", () => {
      const resMissing = evaluatePositionCompatibility(undefined, "front", 30);
      expect(resMissing.score).toBe(10);
      expect(resMissing.warning).toBeUndefined();
    });
  });

  describe("5. Ma trận bù trừ tay thuận (docs/06-rating-scale.md)", () => {
    it("thưởng tối đa 15 điểm cho Cặp đôi vàng (Tay phải + Tay trái)", () => {
      const resRL = evaluateHandCompatibility("right", "left", 15);
      expect(resRL.score).toBe(15);
      expect(resRL.reason).toContain("Cặp đôi vàng");

      const resLR = evaluateHandCompatibility("left", "right", 15);
      expect(resLR.score).toBe(15);
      expect(resLR.reason).toContain("Cặp đôi vàng");
    });

    it("cho điểm mức chuẩn (5 điểm) cho 2 người cùng tay", () => {
      const resRR = evaluateHandCompatibility("right", "right", 15);
      expect(resRR.score).toBe(5);

      const resLL = evaluateHandCompatibility("left", "left", 15);
      expect(resLL.score).toBe(5);
    });
  });

  describe("6. Điểm cộng khu vực và uy tín", () => {
    const seeker = createMockUser({
      uid: "seeker-hc",
      areaLabel: "Hải Châu",
      dominantHand: "right",
      position: "front",
      skill: { rating: 1500, matchesPlayed: 20, reliability: 95, isProvisional: false },
    });

    it("cộng 10 điểm khi cùng quận Hải Châu", () => {
      const candSameArea = createMockUser({
        uid: "cand-hc",
        areaLabel: "Hải Châu",
        skill: { rating: 1500, matchesPlayed: 20, reliability: 80, isProvisional: false },
      });
      const candDiffArea = createMockUser({
        uid: "cand-st",
        areaLabel: "Sơn Trà",
        skill: { rating: 1500, matchesPlayed: 20, reliability: 80, isProvisional: false },
      });

      const results = findPartners(seeker, [candSameArea, candDiffArea]);
      const resSame = results.find((r) => r.user.uid === "cand-hc");
      const resDiff = results.find((r) => r.user.uid === "cand-st");

      expect(resSame?.breakdown.areaScore).toBe(10);
      expect(resDiff?.breakdown.areaScore).toBe(0);
      expect(resSame!.matchScore).toBeGreaterThan(resDiff!.matchScore);
    });

    it("gắn cảnh báo đối với người chơi có điểm uy tín thấp (< 50)", () => {
      const lowRepCandidate = createMockUser({
        uid: "cand-low-rep",
        skill: { rating: 1500, matchesPlayed: 20, reliability: 30, isProvisional: false },
      });

      const results = findPartners(seeker, [lowRepCandidate]);
      expect(results[0].warnings.some((w) => w.includes("Uy tín cần lưu ý"))).toBe(true);
      expect(results[0].breakdown.reliabilityScore).toBe(0);
    });
  });

  describe("7. Quy tắc Tie-break xác định (Deterministic Sorting)", () => {
    const seeker = createMockUser({
      uid: "seeker-tie",
      position: "front",
      dominantHand: "right",
      areaLabel: "Hải Châu",
      skill: { rating: 1500, matchesPlayed: 10, reliability: 90, isProvisional: false },
    });

    it("sắp xếp theo thứ tự ưu tiên: MatchScore -> EloDiff -> Reliability -> MatchesPlayed -> UID", () => {
      // 3 ứng viên có tất cả các chỉ số giống hệt nhau, chỉ khác UID
      const candC = createMockUser({ uid: "cand-c", skill: { rating: 1500, matchesPlayed: 10, reliability: 80, isProvisional: false } });
      const candA = createMockUser({ uid: "cand-a", skill: { rating: 1500, matchesPlayed: 10, reliability: 80, isProvisional: false } });
      const candB = createMockUser({ uid: "cand-b", skill: { rating: 1500, matchesPlayed: 10, reliability: 80, isProvisional: false } });

      const results = findPartners(seeker, [candC, candA, candB]);
      expect(results.map((r) => r.user.uid)).toEqual(["cand-a", "cand-b", "cand-c"]);
    });

    it("ưu tiên người có chênh lệch Elo thấp hơn nếu cùng điểm MatchScore", () => {
      // Giả sử có cấu hình tùy chỉnh để có điểm tương đương
      const candCloseElo = createMockUser({
        uid: "cand-close",
        position: "back",
        dominantHand: "right",
        skill: { rating: 1500, matchesPlayed: 10, reliability: 80, isProvisional: false }, // eloDiff = 0
      });
      const candFarElo = createMockUser({
        uid: "cand-far",
        position: "back",
        dominantHand: "right",
        skill: { rating: 1520, matchesPlayed: 10, reliability: 80, isProvisional: false }, // eloDiff = 20
      });

      const results = findPartners(seeker, [candFarElo, candCloseElo]);
      expect(results[0].user.uid).toBe("cand-close");
    });
  });

  describe("8. Helper Query Bounds (Firestore Query Preparation)", () => {
    it("tính đúng biên khoảng điểm Elo và giới tính mục tiêu", () => {
      const seekerMale = createMockUser({
        gender: "M",
        skill: { rating: 1400, matchesPlayed: 15, reliability: 85, isProvisional: false },
      });

      // Đôi nam
      const boundsMen = calculatePartnerQueryBounds(seekerMale, { category: "men" });
      expect(boundsMen.minRating).toBe(1250);
      expect(boundsMen.maxRating).toBe(1550);
      expect(boundsMen.targetGender).toBe("M");

      // Đôi nam nữ
      const boundsMixed = calculatePartnerQueryBounds(seekerMale, { category: "mixed" });
      expect(boundsMixed.targetGender).toBe("F");
    });

    it("chặn không vượt quá floor 800 và ceiling 2200 của hệ thống", () => {
      const beginner = createMockUser({
        skill: { rating: 850, matchesPlayed: 10, reliability: 80, isProvisional: false },
      });
      const boundsBeginner = calculatePartnerQueryBounds(beginner);
      expect(boundsBeginner.minRating).toBe(RATING_CONFIG.MIN_RATING_FLOOR); // 800

      const pro = createMockUser({
        skill: { rating: 2150, matchesPlayed: 50, reliability: 95, isProvisional: false },
      });
      const boundsPro = calculatePartnerQueryBounds(pro);
      expect(boundsPro.maxRating).toBe(RATING_CONFIG.MAX_RATING_CEILING); // 2200
    });
  });

  describe("9. Benchmark hiệu năng (1.000 ứng viên dưới 200 ms)", () => {
    const seeker = createMockUser({
      uid: "seeker-perf",
      position: "front",
      dominantHand: "right",
      areaLabel: "Hải Châu",
      skill: { rating: 1500, matchesPlayed: 15, reliability: 90, isProvisional: false },
    });

    it("xử lý 1.000 ứng viên dưới 200ms", () => {
      const candidates: UserProfile[] = [];
      const positions = ["front", "back", "both"] as const;
      const hands = ["right", "left"] as const;
      const districts = ["Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn", "Liên Chiểu"];

      for (let i = 0; i < 1000; i++) {
        candidates.push(
          createMockUser({
            uid: `candidate-${i.toString().padStart(4, "0")}`,
            displayName: `Player ${i}`,
            position: positions[i % 3],
            dominantHand: hands[i % 2],
            areaLabel: districts[i % districts.length],
            skill: {
              rating: 1400 + (i % 200), // từ 1400 đến 1600 (trong dải ±150)
              matchesPlayed: i % 30,
              reliability: 50 + (i % 50),
              isProvisional: (i % 10) === 0,
            },
          })
        );
      }

      const start = performance.now();
      const results = findPartners(seeker, candidates, { category: "men" });
      const durationMs = performance.now() - start;

      expect(results.length).toBeGreaterThan(0);
      expect(durationMs).toBeLessThan(200);
      // Kết quả phải được sắp xếp hoàn toàn xác định
      for (let j = 0; j < results.length - 1; j++) {
        expect(results[j].matchScore).toBeGreaterThanOrEqual(results[j + 1].matchScore);
      }
    });
  });
});

