import { runFullBalancingBenchmark } from "../../scripts/benchmark-balancing";

describe("Balancing Algorithm Performance Benchmark (P15 & M10)", () => {
  it("Toàn bộ các tác vụ chia sân và điều phối phải hoàn thành dưới 1.000 ms (thực tế < 1 ms)", () => {
    const results = runFullBalancingBenchmark(500); // 500 iterations cho mỗi tác vụ

    expect(results.length).toBeGreaterThanOrEqual(8);

    for (const row of results) {
      const avgMs = parseFloat(row["TB / lần (ms)"]);
      expect(avgMs).toBeLessThan(1000); // Tiêu chuẩn kỹ thuật P15 < 1.000 ms (1 giây)
      expect(avgMs).toBeLessThan(10.0); // Hiệu năng cao in-memory: Dưới 10 ms
      expect(row["Chuẩn < 1.000ms"]).toContain("✔ ĐẠT");
    }
  });
});
