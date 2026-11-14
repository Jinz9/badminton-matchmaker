/**
 * Firebase Cloud Functions Entry Point
 * Hệ thống Ghép đội và Cân bằng Kèo Cầu lông (Đà Nẵng)
 */

import * as admin from "firebase-admin";
import { setGlobalOptions } from "firebase-functions/v2";
import { onRequest } from "firebase-functions/v2/https";
import { RATING_CONFIG } from "./config/rating";
import { ratingToLevel, levelToRange } from "./domain/rating/initialRating";

// Cấu hình vị trí máy chủ cố định tại Singapore (asia-southeast1) theo ADR-001
setGlobalOptions({
  region: "asia-southeast1",
  maxInstances: 10,
});

if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Health check endpoint xác thực Cloud Functions đang hoạt động bình thường
 * và kiểm tra khả năng chia sẻ logic từ domain
 */
export const healthCheck = onRequest((req, res) => {
  const sampleRating = 1450;
  const levelNumber = ratingToLevel(sampleRating);
  const levelDetails = levelToRange(levelNumber);

  res.status(200).json({
    status: "ok",
    service: "badminton-matchmaker-functions",
    region: "asia-southeast1",
    timestamp: new Date().toISOString(),
    domainCheck: {
      sampleRating,
      resolvedLevel: levelNumber,
      levelName: levelDetails.name,
      totalLevels: RATING_CONFIG.LEVELS.length,
    },
  });
});
