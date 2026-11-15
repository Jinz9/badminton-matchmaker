/**
 * CẤU HÌNH DANH MỤC KHU VỰC & CỤM SÂN CẦU LÔNG TẠI ĐÀ NẴNG
 * Tài liệu tham chiếu: DECISIONS-PENDING.md mục 4, ADR-002
 * Dùng chung cho: Hồ sơ người chơi (UserProfile), Bộ lọc Sảnh (Lobby), Tạo kèo (Session), Tìm đồng đội (Partner Finder)
 */

export const DA_NANG_DISTRICTS = [
  'Hải Châu',
  'Thanh Khê',
  'Sơn Trà',
  'Ngũ Hành Sơn',
  'Cẩm Lệ',
  'Liên Chiểu',
  'Hòa Vang',
] as const;

export type DistrictLabel = typeof DA_NANG_DISTRICTS[number];

export interface BadmintonVenue {
  id: string;
  name: string;
  district: DistrictLabel;
  address: string;
  courtCount: number;
  latitude: number;
  longitude: number;
  popular: boolean;
}

/**
 * Danh sách 10 cụm sân cầu lông tiêu biểu tại Đà Nẵng
 * Phục vụ gợi ý chọn nhanh cho Host khi tạo phòng kèo
 */
export const DA_NANG_VENUES: readonly BadmintonVenue[] = [
  {
    id: 'venue_ky_dong',
    name: 'Sân Cầu Lông Kỳ Đồng',
    district: 'Thanh Khê',
    address: '49 Kỳ Đồng, Thanh Khê, Đà Nẵng',
    courtCount: 6,
    latitude: 16.0645,
    longitude: 108.1923,
    popular: true,
  },
  {
    id: 'venue_tuyen_son',
    name: 'Sân Cầu Lông Làng Thể Thao Tuyên Sơn',
    district: 'Hải Châu',
    address: 'Đường 2 Tháng 9, Hòa Cường Bắc, Hải Châu, Đà Nẵng',
    courtCount: 10,
    latitude: 16.0358,
    longitude: 108.2239,
    popular: true,
  },
  {
    id: 'venue_quan_khu_5',
    name: 'Sân Cầu Lông Trung Tâm Thể Thao Quân Khu 5',
    district: 'Hải Châu',
    address: '07 Duy Tân, Hòa Thuận Đông, Hải Châu, Đà Nẵng',
    courtCount: 8,
    latitude: 16.0502,
    longitude: 108.2145,
    popular: true,
  },
  {
    id: 'venue_buu_dien',
    name: 'Sân Cầu Lông Bưu Điện Đà Nẵng',
    district: 'Hải Châu',
    address: '271 Nguyễn Du, Thạch Thang, Hải Châu, Đà Nẵng',
    courtCount: 4,
    latitude: 16.0768,
    longitude: 108.2198,
    popular: false,
  },
  {
    id: 'venue_truong_vinh_ky',
    name: 'Sân Cầu Lông Trương Vĩnh Ký',
    district: 'Hải Châu',
    address: '02 Trương Vĩnh Ký, Hòa Cường Nam, Hải Châu, Đà Nẵng',
    courtCount: 4,
    latitude: 16.0315,
    longitude: 108.2212,
    popular: false,
  },
  {
    id: 'venue_da_phuoc',
    name: 'Sân Cầu Lông Đa Phước',
    district: 'Thanh Khê',
    address: 'Khu Đô Thị Đa Phước, Thuận Phước, Thanh Khê, Đà Nẵng',
    courtCount: 6,
    latitude: 16.0825,
    longitude: 108.2101,
    popular: false,
  },
  {
    id: 'venue_son_tra',
    name: 'Sân Cầu Lông Trung Tâm Văn Hóa Thể Thao Sơn Trà',
    district: 'Sơn Trà',
    address: 'Đường Trần Hưng Đạo, An Hải Tây, Sơn Trà, Đà Nẵng',
    courtCount: 6,
    latitude: 16.0612,
    longitude: 108.2325,
    popular: true,
  },
  {
    id: 'venue_cam_le',
    name: 'Sân Cầu Lông Trung Tâm TDTT Cẩm Lệ',
    district: 'Cẩm Lệ',
    address: '298 Cách Mạng Tháng 8, Khuê Trung, Cẩm Lệ, Đà Nẵng',
    courtCount: 4,
    latitude: 16.0195,
    longitude: 108.2045,
    popular: false,
  },
  {
    id: 'venue_hoa_xuan',
    name: 'Sân Cầu Lông CLB Hòa Xuân',
    district: 'Cẩm Lệ',
    address: 'Khu Đô Thị Sinh Thái Hòa Xuân, Cẩm Lệ, Đà Nẵng',
    courtCount: 6,
    latitude: 15.9982,
    longitude: 108.2185,
    popular: false,
  },
  {
    id: 'venue_bach_khoa',
    name: 'Sân Cầu Lông Nhà Thi Đấu Đại Học Bách Khoa',
    district: 'Liên Chiểu',
    address: '54 Nguyễn Lương Bằng, Hòa Khánh Bắc, Liên Chiểu, Đà Nẵng',
    courtCount: 4,
    latitude: 16.0745,
    longitude: 108.1532,
    popular: true,
  },
];

/**
 * Kiểm tra một nhãn quận/huyện có hợp lệ tại Đà Nẵng hay không
 */
export function isValidDistrict(district: string): district is DistrictLabel {
  return DA_NANG_DISTRICTS.includes(district as DistrictLabel);
}

/**
 * Lấy danh sách sân thi đấu theo quận/huyện
 */
export function getVenuesByDistrict(district: DistrictLabel): BadmintonVenue[] {
  return DA_NANG_VENUES.filter((venue) => venue.district === district);
}

/**
 * Tìm kiếm sân thi đấu theo tên hoặc địa chỉ
 */
export function searchVenues(query: string): BadmintonVenue[] {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return [...DA_NANG_VENUES];
  return DA_NANG_VENUES.filter(
    (venue) =>
      venue.name.toLowerCase().includes(normalized) ||
      venue.address.toLowerCase().includes(normalized) ||
      venue.district.toLowerCase().includes(normalized)
  );
}
