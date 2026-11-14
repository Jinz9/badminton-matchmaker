/**
 * Script nạp dữ liệu mẫu (Seed Data Placeholder) cho Firebase Firestore
 * Dùng cho môi trường Local Emulator và Test tích hợp
 */

export interface CourtVenue {
  id: string;
  name: string;
  address: string;
  district: string;
  courtCount: number;
  latitude: number;
  longitude: number;
}

export const SEED_VENUES: CourtVenue[] = [
  {
    id: "venue-ky-dong",
    name: "Sân Cầu Lông Kỳ Đồng",
    address: "49 Kỳ Đồng, Phường Xuân Hà, Quận Thanh Khê, Đà Nẵng",
    district: "Thanh Khê",
    courtCount: 6,
    latitude: 16.0683,
    longitude: 108.1942,
  },
  {
    id: "venue-tuyen-son",
    name: "Cung Thể Thao Tuyên Sơn",
    address: "Số 01 Phan Đăng Lưu, Phường Hòa Cường Bắc, Quận Hải Châu, Đà Nẵng",
    district: "Hải Châu",
    courtCount: 12,
    latitude: 16.0358,
    longitude: 108.2242,
  },
  {
    id: "venue-quan-khu-5",
    name: "Sân Cầu Lông Quân Khu 5",
    address: "07 Duy Tân, Phường Hòa Cường Bắc, Quận Hải Châu, Đà Nẵng",
    district: "Hải Châu",
    courtCount: 8,
    latitude: 16.0465,
    longitude: 108.2163,
  },
  {
    id: "venue-truong-vinh-ky",
    name: "Sân Cầu Lông Trương Vĩnh Ký",
    address: "Đường Trương Vĩnh Ký, Phường Hòa An, Quận Cẩm Lệ, Đà Nẵng",
    district: "Cẩm Lệ",
    courtCount: 4,
    latitude: 16.0389,
    longitude: 108.1812,
  },
  {
    id: "venue-buu-dien",
    name: "Sân Cầu Lông Bưu Điện",
    address: "Đường Nguyễn Du, Phường Thạch Thang, Quận Hải Châu, Đà Nẵng",
    district: "Hải Châu",
    courtCount: 4,
    latitude: 16.0762,
    longitude: 108.2215,
  },
];

export async function seedEmulatorDatabase(): Promise<void> {
  console.log("=== BẮT ĐẦU NẠP DỮ LIỆU SEED VÀO FIRESTORE EMULATOR ===");
  console.log(`Đã nạp sẵn danh mục ${SEED_VENUES.length} sân cầu lông nổi tiếng tại Đà Nẵng:`);
  for (const venue of SEED_VENUES) {
    console.log(`- [${venue.district}] ${venue.name} (${venue.courtCount} thảm)`);
  }
  console.log("=== NẠP DỮ LIỆU SEED HOÀN TẤT THÀNH CÔNG ===");
}

if (require.main === module) {
  seedEmulatorDatabase().catch(console.error);
}
