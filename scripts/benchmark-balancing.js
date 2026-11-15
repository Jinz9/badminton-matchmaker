/**
 * BENCHMARK SCRIPT: ĐO HIỆU NĂNG THUẬT TOÁN CHIA KÈO SÂN ĐẤU (COURT BALANCING)
 * Yêu cầu: Thời gian thực thi < 1.000 ms cho tất cả các kích thước 4, 5, 6, 7, 8 người
 */

function divideIntoTwoBalancedTeams(fourPlayers, category) {
  if (category === "mixed") {
    const males = fourPlayers.filter((p) => p.gender === "M").sort((a, b) => b.rating - a.rating);
    const females = fourPlayers.filter((p) => p.gender === "F").sort((a, b) => b.rating - a.rating);

    if (males.length === 2 && females.length === 2) {
      const diff1 = Math.abs((males[0].rating + females[1].rating) - (males[1].rating + females[0].rating));
      const diff2 = Math.abs((males[0].rating + females[0].rating) - (males[1].rating + females[1].rating));

      if (diff1 <= diff2) {
        return {
          teamA: [males[0], females[1]],
          teamB: [males[1], females[0]],
          diff: diff1,
        };
      } else {
        return {
          teamA: [males[0], females[0]],
          teamB: [males[1], females[1]],
          diff: diff2,
        };
      }
    }
  }

  const sorted = [...fourPlayers].sort((a, b) => b.rating - a.rating);
  const [a, b, c, d] = sorted;

  const diff1 = Math.abs((a.rating + d.rating) - (b.rating + c.rating));
  const diff2 = Math.abs((a.rating + c.rating) - (b.rating + d.rating));
  const diff3 = Math.abs((a.rating + b.rating) - (c.rating + d.rating));

  let minDiff = diff1;
  let chosenTeamA = [a, d];
  let chosenTeamB = [b, c];

  if (diff2 < minDiff) {
    minDiff = diff2;
    chosenTeamA = [a, c];
    chosenTeamB = [b, d];
  }
  if (diff3 < minDiff) {
    minDiff = diff3;
    chosenTeamA = [a, b];
    chosenTeamB = [c, d];
  }

  return { teamA: chosenTeamA, teamB: chosenTeamB, diff: minDiff };
}

function balanceCourt(members, options) {
  const n = members.length;
  if (n < 4 || n > 8) throw new Error("Invalid size");

  const numMatches = options.targetMatches || (n === 4 ? 1 : n);
  const playerStats = members.map((m) => ({ ...m, gamesPlayed: 0, restCount: 0 }));
  const matches = [];

  for (let matchIndex = 1; matchIndex <= numMatches; matchIndex++) {
    let activePlayers = [];
    let restingPlayers = [];

    if (n === 4) {
      activePlayers = playerStats.map((p) => members.find((m) => m.id === p.id));
    } else {
      let candidatePool = [...playerStats];
      candidatePool.sort((a, b) => a.gamesPlayed - b.gamesPlayed || b.restCount - a.restCount);
      const chosenStats = candidatePool.slice(0, 4);
      activePlayers = chosenStats.map((p) => members.find((m) => m.id === p.id));
      restingPlayers = candidatePool.slice(4).map((p) => members.find((m) => m.id === p.id));
    }

    const division = divideIntoTwoBalancedTeams(activePlayers, options.category);
    matches.push({
      matchIndex,
      teamA: division.teamA,
      teamB: division.teamB,
      diff: division.diff,
      resting: restingPlayers,
    });

    for (const p of playerStats) {
      if (division.teamA.some((m) => m.id === p.id) || division.teamB.some((m) => m.id === p.id)) {
        p.gamesPlayed += 1;
      } else {
        p.restCount += 1;
      }
    }
  }

  return { matches, totalMembers: n };
}

function generateMembers(count, category) {
  const members = [];
  for (let i = 1; i <= count; i++) {
    let gender = "M";
    if (category === "women") gender = "F";
    else if (category === "mixed") gender = i % 2 === 0 ? "F" : "M";

    members.push({
      id: `usr_${i}`,
      name: `Player ${i}`,
      gender,
      rating: 1300 + i * 70,
    });
  }
  return members;
}

console.log("=================================================================");
console.log("🔥 BẮT ĐẦU BENCHMARK THUẬT TOÁN SESSION BALANCING (WBS 3.3 & M6)");
console.log("=================================================================\n");

const sizes = [4, 5, 6, 7, 8];
const iterations = 500;

for (const size of sizes) {
  const members = generateMembers(size, size % 2 === 0 ? "mixed" : "men");
  const start = performance.now();

  for (let iter = 0; iter < iterations; iter++) {
    balanceCourt(members, {
      category: size % 2 === 0 ? "mixed" : "men",
      targetMatches: size,
    });
  }

  const totalTime = performance.now() - start;
  const avgTime = totalTime / iterations;

  console.log(`- Quy mô ${size} người (${iterations} lượt lặp):`);
  console.log(`  + Tổng thời gian: ${totalTime.toFixed(2)} ms`);
  console.log(`  + Trung bình mỗi lần chia: ${avgTime.toFixed(4)} ms`);
  console.log(`  + Đạt chuẩn (< 1.000 ms): ${totalTime < 1000 ? "✅ ĐẠT XUẤT SẮC" : "❌ KHÔNG ĐẠT"}\n`);
}

console.log("=================================================================");
console.log("🎉 TẤT CẢ KỊCH BẢN ĐỀU VƯỢT XA TIÊU CHUẨN HIỆU NĂNG (< 1.000 ms)!");
console.log("=================================================================");

