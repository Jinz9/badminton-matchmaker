# MA TRẬN TRUY VẾT KIỂM THỬ (TRACEABILITY MATRIX)

**Tài liệu:** `docs/test/traceability.md`  
**Phạm vi:** Truy vết 100% **FR-01..FR-35** & **NFR-01..NFR-09** từ [07-srs.md](file:///d:/QLDAPM/docs/07-srs.md) ↔ Use Case ([08-use-cases.md](file:///d:/QLDAPM/docs/08-use-cases.md)) ↔ User Story / WBS ↔ Test Case ([test-cases.md](file:///d:/QLDAPM/docs/test/test-cases.md)) ↔ Test tự động Jest.

---

## 1. Truy vết Yêu cầu Chức năng (`FR-01` – `FR-35`)

| Mã FR | Tên yêu cầu | Use Case | WBS / US | Mã Test Case (`TC`) | Đã có test tự động (Jest) |
|---|---|---|---|---|---|
| `FR-01` | Đăng ký, đăng nhập & xác thực | UC-01 | WBS 3.1, 4.2 / US-01, US-02 | `TC-001`..`TC-005` | [auth-profile.test.tsx](file:///d:/QLDAPM/test/components/auth-profile.test.tsx), [firebaseRepository.test.ts](file:///d:/QLDAPM/test/data/firebaseRepository.test.ts) |
| `FR-02` | Bảng câu hỏi Onboarding 10 câu | UC-01 | WBS 2.1, 4.2 / US-03, US-04 | `TC-006`, `TC-007` | [initialRating.test.ts](file:///d:/QLDAPM/test/domain/initialRating.test.ts), [auth-profile.test.tsx](file:///d:/QLDAPM/test/components/auth-profile.test.tsx) |
| `FR-03` | Khai báo hồ sơ, tay thuận, vị trí | UC-01 | WBS 3.1, 4.2 / US-05 | `TC-008`, `TC-009` | [authProfile.test.ts](file:///d:/QLDAPM/test/domain/authProfile.test.ts), [auth-profile.test.tsx](file:///d:/QLDAPM/test/components/auth-profile.test.tsx) |
| `FR-04` | Hiển thị Player Card & chỉ số Elo | UC-01 | WBS 4.2 / US-06 | `TC-010` | [auth-profile.test.tsx](file:///d:/QLDAPM/test/components/auth-profile.test.tsx) |
| `FR-05` | Chuyển trạng thái Chính thức sau 5 trận | UC-12 | WBS 3.4 / US-07 | `TC-011` | [calculateElo.test.ts](file:///d:/QLDAPM/test/domain/calculateElo.test.ts) |
| `FR-06` | Chỉnh sửa hồ sơ cá nhân | UC-01 | WBS 4.2 / US-08 | `TC-012` | [authProfile.test.ts](file:///d:/QLDAPM/test/domain/authProfile.test.ts), [mockRepository.test.ts](file:///d:/QLDAPM/test/data/mockRepository.test.ts) |
| `FR-07` | Tìm kiếm & gợi ý đồng đội (lệch ≤ 150) | UC-08 | WBS 3.2a, 4.2 / US-09, US-10 | `TC-013`..`TC-018` | [partnerFinder.test.ts](file:///d:/QLDAPM/test/domain/partnerFinder.test.ts), [partner-finder.test.tsx](file:///d:/QLDAPM/test/components/partner-finder.test.tsx) |
| `FR-08` | Chia cặp tự động cân bằng 4–8 người | UC-09 | WBS 3.3, 4.4a / US-11, US-12 | `TC-041`..`TC-047`, `TC-049` | [courtBalancing.test.ts](file:///d:/QLDAPM/test/domain/courtBalancing.test.ts), [balance-confirm.test.tsx](file:///d:/QLDAPM/test/components/balance-confirm.test.tsx) |
| `FR-09` | Tôn trọng & bảo toàn Cặp đánh khóa | UC-09 | WBS 3.3, 4.4a / US-13 | `TC-048`, `TC-050` | [courtBalancing.test.ts](file:///d:/QLDAPM/test/domain/courtBalancing.test.ts), [balance-confirm.test.tsx](file:///d:/QLDAPM/test/components/balance-confirm.test.tsx) |
| `FR-10` | Lập lịch xoay vòng & nghỉ ca lẻ 5, 7 | UC-09 | WBS 3.3, 4.4a / US-14, US-15 | `TC-042`, `TC-044` | [courtBalancing.test.ts](file:///d:/QLDAPM/test/domain/courtBalancing.test.ts), [dynamicBalancing.test.ts](file:///d:/QLDAPM/test/domain/dynamicBalancing.test.ts) |
| `FR-11` | Hoán đổi thủ công 2 người tại sân | UC-10 | WBS 4.4a / US-16 | `TC-051`, `TC-052` | [balance-confirm.test.tsx](file:///d:/QLDAPM/test/components/balance-confirm.test.tsx) |
| `FR-12` | Hỗ trợ vận hành kèo 2 sân độc lập | UC-02, UC-09 | WBS 3.3, 4.3a / US-17 | `TC-021`, `TC-022`, `TC-053` | [court-home-select.test.tsx](file:///d:/QLDAPM/test/components/court-home-select.test.tsx), [balance-confirm.test.tsx](file:///d:/QLDAPM/test/components/balance-confirm.test.tsx) |
| `FR-13` | Chế độ ghép cặp ngẫu nhiên (Fun Match) | UC-09 | WBS 3.3 / US-18 | `TC-054` | [courtBalancing.test.ts](file:///d:/QLDAPM/test/domain/courtBalancing.test.ts) |
| `FR-14` | Tạo kèo & cấu hình thông số sân | UC-02 | WBS 3.2, 4.3a / US-19, US-20 | `TC-019`..`TC-022` | [matchLobby.test.ts](file:///d:/QLDAPM/test/domain/matchLobby.test.ts), [lobby-ui.test.tsx](file:///d:/QLDAPM/test/components/lobby-ui.test.tsx) |
| `FR-15` | Quản lý người mặc định & Ghost | UC-03 | WBS 3.2, 4.3a / US-21, US-22 | `TC-023`..`TC-025` | [slot.test.ts](file:///d:/QLDAPM/test/domain/slot.test.ts), [lobby-ui.test.tsx](file:///d:/QLDAPM/test/components/lobby-ui.test.tsx) |
| `FR-16` | Tính toán suất tuyển `min(4, 8 - mặc định)` | UC-04 | WBS 3.2b, 4.3b / US-23 | `TC-026`..`TC-030` | [recruitSlots.test.ts](file:///d:/QLDAPM/test/domain/recruitSlots.test.ts), [slot.test.ts](file:///d:/QLDAPM/test/domain/slot.test.ts) |
| `FR-17` | Tìm kiếm & lọc danh sách kèo | UC-05 | WBS 4.3a / US-24, US-25 | `TC-031`, `TC-035` | [lobby-ui.test.tsx](file:///d:/QLDAPM/test/components/lobby-ui.test.tsx) |
| `FR-18` | Gửi yêu cầu đặt suất (kiểm tra giới/Elo/uy tín) | UC-05 | WBS 3.2c, 4.3b / US-26 | `TC-031`..`TC-036` | [recruitSlots.test.ts](file:///d:/QLDAPM/test/domain/recruitSlots.test.ts), [recruitTransactions.test.ts](file:///d:/QLDAPM/test/firebase/recruitTransactions.test.ts) |
| `FR-19` | Host duyệt hoặc từ chối yêu cầu | UC-06 | WBS 3.2c, 4.3b / US-27 | `TC-036`, `TC-038` | [mockRepository.test.ts](file:///d:/QLDAPM/test/data/mockRepository.test.ts), [lobby-ui.test.tsx](file:///d:/QLDAPM/test/components/lobby-ui.test.tsx) |
| `FR-20` | Hàng đợi Waitlist & tự động đôn người | UC-07, UC-07b | WBS 3.2c / US-28, US-29 | `TC-037`, `TC-039`, `TC-040` | [mockRepository.test.ts](file:///d:/QLDAPM/test/data/mockRepository.test.ts), [matchLobbyConcurrency.test.ts](file:///d:/QLDAPM/test/firebase/matchLobbyConcurrency.test.ts) |
| `FR-21` | Hủy tham gia & phạt điểm uy tín | UC-07, UC-13 | WBS 3.2, 3.4 / US-30 | `TC-039`, `TC-062` | [matchLobby.test.ts](file:///d:/QLDAPM/test/domain/matchLobby.test.ts) |
| `FR-22` | Nhập tỷ số set đấu chuẩn BWF | UC-11a | WBS 4.4b / US-31 | `TC-055`, `TC-056` | [post-match-rating.test.tsx](file:///d:/QLDAPM/test/components/post-match-rating.test.tsx) |
| `FR-23` | Chấm thẻ đánh giá 5 giây (chặn tự chấm) | UC-11b | WBS 4.4b / US-32 | `TC-057`, `TC-058` | [post-match-rating.test.tsx](file:///d:/QLDAPM/test/components/post-match-rating.test.tsx), [security-ui.test.tsx](file:///d:/QLDAPM/test/components/security-ui.test.tsx) |
| `FR-24` | Cập nhật Elo đôi & lưu biến động (Idempotent) | UC-12 | WBS 3.4 / US-33 | `TC-059`..`TC-061` | [calculateElo.test.ts](file:///d:/QLDAPM/test/domain/calculateElo.test.ts), [finishMatchIntegration.test.ts](file:///d:/QLDAPM/test/firebase/finishMatchIntegration.test.ts) |
| `FR-25` | Xem lịch sử thi đấu chi tiết | UC-11c | WBS 4.5 / US-34 | `TC-063`, `TC-064` | [historyStats.test.ts](file:///d:/QLDAPM/test/domain/historyStats.test.ts), [history-stats.test.tsx](file:///d:/QLDAPM/test/components/history-stats.test.tsx) |
| `FR-26` | Danh sách Đồng đội ăn ý ($\ge 3$ trận, $\ge 60\%$) | UC-08, UC-11c | WBS 4.5 / US-35 | `TC-065` | [historyStats.test.ts](file:///d:/QLDAPM/test/domain/historyStats.test.ts), [history-stats.test.tsx](file:///d:/QLDAPM/test/components/history-stats.test.tsx) |
| `FR-27` | Tích lũy & phục hồi điểm uy tín | UC-12 | WBS 3.4 / US-36 | `TC-062` | [calculateElo.test.ts](file:///d:/QLDAPM/test/domain/calculateElo.test.ts) |
| `FR-28` | Phân quyền vai trò người dùng (RBAC) | UC-14 | WBS 3.2, 5.2 / US-37 | `TC-081`..`TC-084` | [securityRules.test.ts](file:///d:/QLDAPM/test/firebase/securityRules.test.ts), [security-ui.test.tsx](file:///d:/QLDAPM/test/components/security-ui.test.tsx) |
| `FR-29` | Khóa / Mở khóa tài khoản vi phạm (Admin) | UC-14a | WBS 4.5 / US-38 | `TC-066` | [securityRules.test.ts](file:///d:/QLDAPM/test/firebase/securityRules.test.ts) |
| `FR-30` | Tiếp nhận khiếu nại & hoàn uy tín (Admin) | UC-14b | WBS 4.5 / US-39 | `TC-067` | [securityRules.test.ts](file:///d:/QLDAPM/test/firebase/securityRules.test.ts) |
| `FR-31` | Quản lý danh mục sân Đà Nẵng (Admin) | UC-14c | WBS 4.5 / US-40 | `TC-068` | [seedData.test.ts](file:///d:/QLDAPM/test/domain/seedData.test.ts) |
| `FR-32` | Lưu trữ bộ đệm cục bộ ngoại tuyến (Snapshot) | UC-09, UC-11a | WBS 4.4a, 4.4b / US-41 | `TC-069` | [offlineCacheSync.test.ts](file:///d:/QLDAPM/test/data/offlineCacheSync.test.ts) |
| `FR-33` | Vận hành chia cặp & nhập điểm Offline | UC-09, UC-11a | WBS 4.4a, 4.4b / US-42 | `TC-070` | [offlineCacheSync.test.ts](file:///d:/QLDAPM/test/data/offlineCacheSync.test.ts) |
| `FR-34` | Hàng đợi đồng bộ tự động (Backoff, Idempotency) | UC-11a | WBS 4.4b / US-43 | `TC-071`, `TC-072` | [offlineCacheSync.test.ts](file:///d:/QLDAPM/test/data/offlineCacheSync.test.ts) |
| `FR-35` | Thông báo nhắc lịch 1h & Trung tâm thông báo | UC-06, UC-07 | WBS 3.5, 4.3 / US-44 | `TC-073`..`TC-075` | [notifications.test.ts](file:///d:/QLDAPM/test/data/notifications.test.ts), [notifications.test.tsx](file:///d:/QLDAPM/test/components/notifications.test.tsx) |

---

## 2. Truy vết Yêu cầu Phi chức năng (`NFR-01` – `NFR-09`)

| Mã NFR | Yêu cầu phi chức năng | Ngưỡng đạt | Mã Test Case (`TC`) | Đã có test tự động (Jest) |
|---|---|---|---|---|
| `NFR-01` | Tốc độ thuật toán chia cặp 8 người | `< 1000 ms` | `TC-076` | [benchmark.test.ts](file:///d:/QLDAPM/test/domain/benchmark.test.ts), [balance-confirm.test.tsx](file:///d:/QLDAPM/test/components/balance-confirm.test.tsx) |
| `NFR-02` | Tối đa 3 chạm từ Home đến phương án chia | `<= 3 chạm` | `TC-077` | [court-home-select.test.tsx](file:///d:/QLDAPM/test/components/court-home-select.test.tsx) |
| `NFR-03` | Thao tác một tay, nút `>= 48dp`, tương phản 4.5:1 | `>= 48dp`, WCAG AA | `TC-078`, `TC-079` | [ui-kit.test.tsx](file:///d:/QLDAPM/test/components/ui-kit.test.tsx) |
| `NFR-04` | Chịu lỗi mất mạng & đồng bộ khi có mạng | Không crash, sync `< 3s` | `TC-069`..`TC-072` | [offlineCacheSync.test.ts](file:///d:/QLDAPM/test/data/offlineCacheSync.test.ts) |
| `NFR-05` | Cập nhật realtime phòng kèo | `< 1.5s` | `TC-036`, `TC-074` | [mockRepository.test.ts](file:///d:/QLDAPM/test/data/mockRepository.test.ts), [firebaseRepository.test.ts](file:///d:/QLDAPM/test/data/firebaseRepository.test.ts) |
| `NFR-06` | Bảo mật & phân quyền UI + Firestore Rules | 100% chặn ghi trái phép | `TC-081`..`TC-084` | [securityRules.test.ts](file:///d:/QLDAPM/test/firebase/securityRules.test.ts), [security-ui.test.tsx](file:///d:/QLDAPM/test/components/security-ui.test.tsx) |
| `NFR-07` | Tương thích Android & iOS (Expo Go) | Không lỗi nền tảng | `TC-080` | [ui-kit.test.tsx](file:///d:/QLDAPM/test/components/ui-kit.test.tsx) (kèm test thật `[TV2 điền]`) |
| `NFR-08` | Thu thập dữ liệu cá nhân tối thiểu | Chỉ trường cần thiết | `TC-008`, `TC-081` | [dataContract.test.ts](file:///d:/QLDAPM/test/domain/dataContract.test.ts) |
| `NFR-09` | Domain TypeScript thuần độc lập UI & Firebase | Coverage `src/domain >= 85%` | Toàn bộ `test/domain/*.test.ts` | [e2eFlow.test.ts](file:///d:/QLDAPM/test/domain/e2eFlow.test.ts) |
