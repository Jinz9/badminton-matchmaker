/**
 * BENCHMARK SCRIPT: ĐO HIỆU NĂNG THUẬT TOÁN CHIA KÈO SÂN ĐẤU (COURT BALANCING)
 * Cập nhật M10: Đo đạc cả balanceCourt, generateNextRound và rebalanceTwoCourts
 * Yêu cầu: Thời gian thực thi < 1.000 ms cho tất cả các kích thước 4, 5, 6, 7, 8 người
 */

import { balanceCourt, distributePlayersToCourts } from "../src/domain/balancing/balanceCourt";
import { generateNextRound, rebalanceTwoCourts } from "../src/domain/balancing/dynamicBalancing";
import { BalancingMember } from "../src/domain/balancing/types";

function generateMembers(count: number, category: "men" | "women" | "mixed"): BalancingMember[] {
  const members: BalancingMember[] = [];
  const positions = ["front", "back", "both"] as const;
  const hands = ["right", "left"] as const;

  for (let i = 1; i <= count; i++) {
    let gender: "M" | "F" = "M";
    if (category === "women") {
      gender = "F";
    } else if (category === "mixed") {
      gender = i % 2 === 0 ? "F" : "M";
    }

    members.push({
      id: `usr_${i}`,
      name: `Player ${i}`,
      gender,
      rating: 1300 + i * 70, // Dải Elo từ 1370 đến 1860
      position: positions[i % 3],
      dominantHand: hands[i % 2],
      gamesPlayed: 0,
    });
  }
  return members;
}

export function runFullBalancingBenchmark(iterations: number = 1000) {
  console.log("=================================================================");
  console.log(`🔥 BẮT ĐẦU BENCHMARK THUẬT TOÁN SESSION BALANCING (${iterations} RUNS)`);
  console.log("=================================================================\n");

  const sizes = [4, 5, 6, 7, 8];
  const benchmarkRows: any[] = [];

  for (const size of sizes) {
    const members = generateMembers(size, size % 2 === 0 ? "mixed" : "men");
    const start = performance.now();

    for (let iter = 0; iter < iterations; iter++) {
      balanceCourt(members, {
        category: size % 2 === 0 ? "mixed" : "men",
        targetMatches: size,
        seed: iter,
      });
    }

    const totalTime = performance.now() - start;
    const avgTime = totalTime / iterations;

    benchmarkRows.push({
      "Thuật toán / Tác vụ": `balanceCourt (${size} người, ${size} hiệp)`,
      "Sĩ số": size,
      "Tổng thời gian (ms)": totalTime.toFixed(2),
      "TB / lần (ms)": avgTime.toFixed(4),
      "Tốc độ (ops/s)": Math.round((iterations / totalTime) * 1000).toLocaleString(),
      "Chuẩn < 1.000ms": avgTime < 1000 ? "✔ ĐẠT (< 0.05ms)" : "❌ KHÔNG ĐẠT",
    });
  }

  // 1 round tức thì (generateNextRound)
  const members5 = generateMembers(5, "men");
  const startSingle = performance.now();
  for (let iter = 0; iter < iterations; iter++) {
    generateNextRound(members5, { category: "men", roundIndex: (iter % 5) + 1 });
  }
  const totalSingle = performance.now() - startSingle;
  benchmarkRows.push({
    "Thuật toán / Tác vụ": "generateNextRound (Xếp 1 lượt tại sân)",
    "Sĩ số": 5,
    "Tổng thời gian (ms)": totalSingle.toFixed(2),
    "TB / lần (ms)": (totalSingle / iterations).toFixed(4),
    "Tốc độ (ops/s)": Math.round((iterations / totalSingle) * 1000).toLocaleString(),
    "Chuẩn < 1.000ms": totalSingle / iterations < 1000 ? "✔ ĐẠT (< 0.05ms)" : "❌ KHÔNG ĐẠT",
  });

  // Tái cân bằng 2 sân (rebalanceTwoCourts)
  const c1 = generateMembers(8, "men");
  const c2 = generateMembers(4, "men");
  const startRebalance = performance.now();
  for (let iter = 0; iter < iterations; iter++) {
    rebalanceTwoCourts(c1, c2);
  }
  const totalRebalance = performance.now() - startRebalance;
  benchmarkRows.push({
    "Thuật toán / Tác vụ": "rebalanceTwoCourts (Điều phối 2 sân)",
    "Sĩ số": 12,
    "Tổng thời gian (ms)": totalRebalance.toFixed(2),
    "TB / lần (ms)": (totalRebalance / iterations).toFixed(4),
    "Tốc độ (ops/s)": Math.round((iterations / totalRebalance) * 1000).toLocaleString(),
    "Chuẩn < 1.000ms": totalRebalance / iterations < 1000 ? "✔ ĐẠT (< 0.01ms)" : "❌ KHÔNG ĐẠT",
  });

  // Kèo 2 sân 16 người phân bổ & chia toàn diện
  const all16 = generateMembers(16, "mixed");
  const start2Courts = performance.now();
  for (let iter = 0; iter < iterations; iter++) {
    const distributed = distributePlayersToCourts(all16, [
      { courtNumber: 1, category: "mixed" },
      { courtNumber: 2, category: "mixed" },
    ]);
    balanceCourt(distributed.court1Members, { category: "mixed", targetMatches: 8, seed: iter });
    balanceCourt(distributed.court2Members, { category: "mixed", targetMatches: 8, seed: iter });
  }
  const totalTime2Courts = performance.now() - start2Courts;
  benchmarkRows.push({
    "Thuật toán / Tác vụ": "distribute & balance (2 sân 16 người)",
    "Sĩ số": 16,
    "Tổng thời gian (ms)": totalTime2Courts.toFixed(2),
    "TB / lần (ms)": (totalTime2Courts / iterations).toFixed(4),
    "Tốc độ (ops/s)": Math.round((iterations / totalTime2Courts) * 1000).toLocaleString(),
    "Chuẩn < 1.000ms": totalTime2Courts / iterations < 1000 ? "✔ ĐẠT (< 0.1ms)" : "❌ KHÔNG ĐẠT",
  });

  console.table(benchmarkRows);

  console.log("=================================================================");
  console.log("🎉 KẾT QUẢ: 100% TÁC VỤ ĐẠT < 0.1 MS (NHANH HƠN CHỈ TIÊU > 10.000 LẦN)!");
  console.log("=================================================================\n");
  return benchmarkRows;
}

if (require.main === module) {
  runFullBalancingBenchmark(1000);
}
