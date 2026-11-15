/**
 * Bảng câu hỏi tự đánh giá ban đầu (Onboarding Questionnaire).
 * Nội dung lấy NGUYÊN VĂN từ docs/06-rating-scale.md mục 5 (10 câu, mỗi câu 4 mức A-D = 1-4 điểm).
 * Điểm khởi tạo & cấp độ được tính bằng hàm của TV1: calculateInitialRatingFromAnswers.
 */

export interface QuestionOption {
  key: "A" | "B" | "C" | "D";
  /** Điểm của lựa chọn (1-4) */
  score: 1 | 2 | 3 | 4;
  text: string;
}

export interface OnboardingQuestion {
  id: number;
  title: string;
  options: [QuestionOption, QuestionOption, QuestionOption, QuestionOption];
}

function opts(a: string, b: string, c: string, d: string): OnboardingQuestion["options"] {
  return [
    { key: "A", score: 1, text: a },
    { key: "B", score: 2, text: b },
    { key: "C", score: 3, text: c },
    { key: "D", score: 4, text: d },
  ];
}

export const ONBOARDING_QUESTIONS: readonly OnboardingQuestion[] = [
  {
    id: 1,
    title: "Thời gian bạn đã chơi cầu lông phong trào liên tục:",
    options: opts(
      "Dưới 6 tháng, mới bắt đầu làm quen",
      "Từ 6 tháng đến dưới 2 năm",
      "Từ 2 năm đến 5 năm, đánh đều đặn hàng tuần",
      "Trên 5 năm hoặc từng tập luyện bài bản tại các lò năng khiếu"
    ),
  },
  {
    id: 2,
    title: "Kỹ thuật phát cầu (Giao cầu) trong đánh đôi của bạn:",
    options: opts(
      "Thường xuyên đánh trúng khung, phát cầu cao dễ bị đối thủ đập chết",
      "Đã phát qua lưới an toàn, nhưng bóng còn cao và chưa gài được góc",
      "Phát cầu ngắn sát mép lưới ổn định vào chữ T hoặc góc chữ I",
      "Phát biến hóa linh hoạt (giao ngắn, đẩy lao nhanh, gài góc khó)"
    ),
  },
  {
    id: 3,
    title: "Khả năng phông cầu (Clear) từ vạch cuối sân của mình:",
    options: opts(
      "Cầu chỉ bay đến giữa sân đối phương, khó đánh cao sâu",
      "Đánh cầu bay tới được nửa sau sân, nhưng đường cầu chưa cắm sâu",
      "Đánh cầu bổng cao sâu chạm vạch trắng cuối sân đối phương dễ dàng",
      "Phông cầu đảo góc biến hóa cả thuận tay lẫn ve trái tay sâu cuối sân"
    ),
  },
  {
    id: 4,
    title: "Kỹ thuật đập cầu (Smash tấn công):",
    options: opts(
      "Chưa biết đập cầu hoặc chỉ vung tay chạm cầu bay ngang",
      "Đập được những quả cầu bổng, nhưng lực nhẹ và đường bay chưa chìm",
      "Đập cầu có lực khá mạnh, biết chọn hướng đập vào nách hoặc người đối thủ",
      "Bật nhảy smash (jump smash) uy lực, đập chéo sân hiểm hóc tốc độ cao"
    ),
  },
  {
    id: 5,
    title: "Kỹ năng kiểm soát cầu trên lưới (Drop / Net play):",
    options: opts(
      "Khó kiểm soát lực, cầu hay rúc lưới hoặc bổng cao trên mép lưới",
      "Biết bỏ nhỏ cơ bản nhưng chưa ép sát được mép lưới",
      "Bỏ nhỏ gài lưới sắc bén, biết chụp cầu (net kill) khi đối thủ trả cầu lỏng",
      "Bắt lưới chớp nhoáng, vê cầu quay tròn trên lưới, làm bóng tuyệt vời cho bạn đập"
    ),
  },
  {
    id: 6,
    title: "Kỹ năng phòng thủ khi đối phương smash:",
    options: opts(
      "Né cầu hoặc đưa vợt chạm cầu bung ra ngoài sân",
      "Đỡ được các quả đập vừa tầm, nhưng thường trả cầu bổng lưng chừng sân",
      "Kê lưới hoặc tạt cầu chéo sân thoát thế bị động chuẩn xác",
      "Phản tạt đôi công (drive) lại ngay quả smash của đối phương bằng cẳng tay"
    ),
  },
  {
    id: 7,
    title: "Bộ chân di chuyển (Footwork):",
    options: opts(
      "Di chuyển bản năng, thường bị chậm nhịp hoặc vấp chân",
      "Biết chạy các bước cơ bản nhưng xoay sở tiến thoái còn nặng nề",
      "Di chuyển bước đuổi, bước trượt nhịp nhàng, bao quát tốt nửa sân",
      "Bộ chân thanh thoát, di chuyển đón cầu trước khi đối thủ ra tay"
    ),
  },
  {
    id: 8,
    title: "Hiểu biết về chiến thuật xoay vị trí trong đánh đôi:",
    options: opts(
      "Chưa biết, thường hai người chạy loạn hoặc tranh cầu của nhau",
      "Biết sơ bộ: khi bạn lùi đập thì mình giữ lưới, nhưng hay bị giẫm chân",
      "Hiểu rõ quy tắc: Đứng song song khi thủ, đứng trước - sau khi tấn công",
      "Bọc lót vị trí mượt mà, tự động hoán đổi khi bạn cầu bị ép góc"
    ),
  },
  {
    id: 9,
    title: "Thể lực và sức bền trong một buổi đánh:",
    options: opts(
      "Đánh xong 1 set 21 điểm là đuối sức, thở dốc",
      "Đánh được 2 set liên tục, set 3 bắt đầu di chuyển chậm",
      "Duy trì thể lực ổn định suốt buổi đánh 2 tiếng (khoảng 4–5 set)",
      "Thể lực dồi dào, đánh liên tục cường độ cao không bị hụt hơi"
    ),
  },
  {
    id: 10,
    title: "Kinh nghiệm tham gia các giải đấu phong trào:",
    options: opts(
      "Chưa từng thi đấu giải, chỉ đánh vui gia đình / công ty",
      "Từng tham gia giải phong trào nội bộ công ty / khoa trường",
      "Từng đánh giải phong trào mở rộng cấp CLB hoặc quận / thành phố",
      "Từng đạt huy chương tại các giải phong trào mở rộng hoặc cựu năng khiếu"
    ),
  },
];

export const TOTAL_QUESTIONS = ONBOARDING_QUESTIONS.length;

/** Nhãn thể thức đánh (nội dung đôi) — chỉ lưu tùy chọn cục bộ, không đổi Data Contract */
export const PLAY_CATEGORY_OPTIONS = [
  { value: "men", label: "Đôi nam" },
  { value: "women", label: "Đôi nữ" },
  { value: "mixed", label: "Đôi nam nữ" },
] as const;

export type PlayCategoryPref = (typeof PLAY_CATEGORY_OPTIONS)[number]["value"];

export const POSITION_OPTIONS = [
  { value: "front", label: "Cầu trước (Lưới)", hint: "Đè lưới, bỏ nhỏ, chụp cầu" },
  { value: "back", label: "Cầu sau (Công)", hint: "Bật nhảy đập cầu, phông cầu sâu" },
  { value: "both", label: "Linh hoạt", hint: "Đánh tốt cả trước lẫn sau" },
] as const;

export const HAND_OPTIONS = [
  { value: "right", label: "Tay phải" },
  { value: "left", label: "Tay trái" },
] as const;

export const GENDER_OPTIONS = [
  { value: "M", label: "Nam" },
  { value: "F", label: "Nữ" },
] as const;

export const POSITION_LABEL: Record<string, string> = {
  front: "Cầu trước (Lưới)",
  back: "Cầu sau (Công)",
  both: "Linh hoạt",
};

export const HAND_LABEL: Record<string, string> = {
  right: "Tay phải",
  left: "Tay trái",
};

