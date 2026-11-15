/**
 * MODULE TRUY VẤN VÀ TỐI ƯU HÓA TÌM BẠN CHƠI PHÍA FIRESTORE
 *
 * Chiến lược tối ưu chi phí & hiệu năng (CR-02 & WBS 3.1):
 * - Thay vì load toàn bộ Users về client rồi lọc (tốn read quota Firestore),
 *   ta lọc range điểm Elo [Rating - 150, Rating + 150] và `gender` ngay tại server.
 * - Sử dụng Firestore Composite Index (đã khai báo trong firestore.indexes.json).
 * - Sau đó áp dụng hàm thuần `findPartners` để tính toán bù trừ vị trí và tie-break.
 */

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  Firestore,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { UserProfile, Gender } from "../types";
import { RATING_CONFIG } from "../../config/rating";
import { PartnerFinderFilters, PartnerMatchItem } from "./types";
import { findPartners } from "./findPartners";

export interface PartnerQueryBounds {
  minRating: number;
  maxRating: number;
  targetGender?: Gender;
}

/**
 * Tính toán biên truy vấn Elo và giới tính mục tiêu
 */
export function calculatePartnerQueryBounds(
  seeker: UserProfile,
  filters: PartnerFinderFilters = {}
): PartnerQueryBounds {
  const maxDiff = filters.maxEloDiff ?? RATING_CONFIG.PARTNER_FINDER_MAX_ELO_DIFF;
  const expansion = filters.allowProvisionalExpansion && seeker.skill.isProvisional ? 50 : 0;
  const effectiveMaxDiff = maxDiff + expansion;

  const minRating = Math.max(
    RATING_CONFIG.MIN_RATING_FLOOR,
    seeker.skill.rating - effectiveMaxDiff
  );
  const maxRating = Math.min(
    RATING_CONFIG.MAX_RATING_CEILING,
    seeker.skill.rating + effectiveMaxDiff
  );

  let targetGender: Gender | undefined;
  if (filters.category === "men") {
    targetGender = "M";
  } else if (filters.category === "women") {
    targetGender = "F";
  } else if (filters.category === "mixed") {
    targetGender = seeker.gender === "M" ? "F" : "M";
  }

  return { minRating, maxRating, targetGender };
}

export interface FetchPartnersOptions {
  limitCount?: number;
  lastVisibleDoc?: QueryDocumentSnapshot<DocumentData>;
}

export interface FetchPartnersResult {
  items: PartnerMatchItem[];
  lastVisibleDoc?: QueryDocumentSnapshot<DocumentData>;
  hasMore: boolean;
}

/**
 * Truy vấn Firestore để lấy danh sách ứng viên trong khoảng Elo và tính điểm tương thích
 *
 * @param db Firestore instance
 * @param seeker Người dùng hiện tại
 * @param filters Bộ lọc nâng cao (category, areaLabel, level,...)
 * @param options Tùy chọn phân trang
 */
export async function fetchRecommendedPartners(
  db: Firestore,
  seeker: UserProfile,
  filters: PartnerFinderFilters = {},
  options: FetchPartnersOptions = {}
): Promise<FetchPartnersResult> {
  const pageSize = options.limitCount ?? 20;
  const bounds = calculatePartnerQueryBounds(seeker, filters);

  const usersRef = collection(db, "users");
  const queryConstraints: any[] = [
    where("isDeleted", "==", false),
  ];

  if (bounds.targetGender) {
    queryConstraints.push(where("gender", "==", bounds.targetGender));
  }

  if (filters.areaLabel) {
    queryConstraints.push(where("areaLabel", "==", filters.areaLabel));
  }

  queryConstraints.push(where("skill.rating", ">=", bounds.minRating));
  queryConstraints.push(where("skill.rating", "<=", bounds.maxRating));
  queryConstraints.push(orderBy("skill.rating", "desc"));
  queryConstraints.push(limit(pageSize + 1)); // Lấy dư 1 để kiểm tra hasMore

  if (options.lastVisibleDoc) {
    queryConstraints.push(startAfter(options.lastVisibleDoc));
  }

  const q = query(usersRef, ...queryConstraints);
  const snapshot = await getDocs(q);

  const candidateDocs = snapshot.docs;
  const hasMore = candidateDocs.length > pageSize;
  const docsToProcess = hasMore ? candidateDocs.slice(0, pageSize) : candidateDocs;

  const candidates: UserProfile[] = docsToProcess.map((doc) => ({
    ...(doc.data() as UserProfile),
    uid: doc.id,
  }));

  // Áp dụng thuật toán xếp hạng và tính điểm bù trừ vị trí
  const rankedItems = findPartners(seeker, candidates, filters);

  const newLastVisibleDoc =
    docsToProcess.length > 0 ? docsToProcess[docsToProcess.length - 1] : undefined;

  return {
    items: rankedItems,
    lastVisibleDoc: newLastVisibleDoc,
    hasMore,
  };
}
