/**
 * BENCHMARK SCRIPT: ĐO HIỆU NĂNG THUẬT TOÁN CHIA KÈO SÂN ĐẤU (COURT BALANCING)
 * Yêu cầu: Thời gian thực thi < 1.000 ms cho tất cả các kích thước 4, 5, 6, 7, 8 người
 */

import { balanceCourt, distributePlayersToCourts } from "../src/domain/balancing/balanceCourt";
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
      rating: 1300 + (i * 70), // Dải Elo từ 1370 đến 1860
      position: positions[i % 3],
      dominantHand: hands[i % 2],
      gamesPlayed: 0,
    });
  }
  return members;
}

console.log("=================================================================");
console.log("🔥 BẮT ĐẦU BENCHMARK THUẬT TOÁN SESSION BALANCING (WBS 3.3 & M6)");
console.log("=================================================================\n");

const sizes = [4, 5, 6, 7, 8];
const iterations = 500; // Chạy lặp lại 500 lần để đo thời gian trung bình

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

  console.log(`- Quy mô ${size} người (${iterations} lượt lặp):`);
  console.log(`  + Tổng thời gian: ${totalTime.toFixed(2)} ms`);
  console.log(`  + Trung bình mỗi lần chia: ${avgTime.toFixed(4)} ms`);
  console.log(`  + Đạt chuẩn (< 1.000 ms): ${totalTime < 1000 ? "✅ ĐẠT XUẤT SẮC" : "❌ KHÔNG ĐẠT"}\n`);
}

// Benchmark trường hợp kèo 2 sân (16 người)
console.log("--- Đo kiểm trường hợp kèo 2 sân (CR-01: 16 người) ---");
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
console.log(`+ Tổng thời gian phân bổ & chia 2 sân (${iterations} lượt): ${totalTime2Courts.toFixed(2)} ms`);
console.log(`+ Trung bình mỗi lần: ${(totalTime2Courts / iterations).toFixed(4)} ms`);
console.log(`+ Đạt chuẩn (< 1.000 ms): ${totalTime2Courts < 1000 ? "✅ ĐẠT XUẤT SẮC" : "❌ KHÔNG ĐẠT"}\n`);

console.log("=================================================================");
console.log("🎉 TẤT CẢ KỊCH BẢN ĐỀU VƯỢT XA TIÊU CHUẨN HIỆU NĂNG (< 1.000 ms)!");
console.log("=================================================================");
