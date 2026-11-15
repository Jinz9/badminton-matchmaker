# Sơ Đồ Điều Hướng Toàn Ứng Dụng (End-to-End Navigation Map)

**Scheme Deep Link (`app.json`):** `badminton://`  
**Router:** `expo-router` (File-based Routing: `src/app/`)

---

## 1. Sơ đồ luồng điều hướng (Mermaid Flowchart)

```mermaid
flowchart TD
    Root["Root Stack (_layout.tsx)"] --> AuthGroup["Nhóm Xác Thực /(auth)"]
    Root --> TabsGroup["4 Tab Chính /(tabs)"]
    Root --> CourtFlow["Luồng Tại Sân /court/*"]
    Root --> LobbyFlow["Luồng Sảnh Kèo /lobby/*"]
    Root --> DevScreen["Màn Dev /dev/ui-kit"]

    subgraph Auth ["Nhóm Xác Thực & Hồ Sơ (P0)"]
        Login["/(auth)/login"] --> Register["/(auth)/register"]
        Login --> Forgot["/(auth)/forgot-password"]
        Register --> Otp["/(auth)/otp"]
        Otp --> Onboarding["/(auth)/onboarding (10 câu hỏi)"]
        Onboarding --> TabsGroup
    end

    subgraph Tabs ["4 Tab Điều Hướng Chính (P0/P1)"]
        TabCourt["/(tabs)/index -> Home Sân Đấu"]
        TabPartners["/(tabs)/partners -> Tìm Bạn & BXH Elo"]
        TabHistory["/(tabs)/history -> Lịch Sử, Thống Kê & Đồng Đội Ăn Ý"]
        TabProfile["/(tabs)/profile -> Hồ Sơ Cá Nhân"]
    end

    subgraph OnCourt ["Luồng Tại Sân 3 Chạm (P0 Core)"]
        TabCourt -->|"Chạm 1: Bắt đầu chia"| SelectPlayers["/court/select-players (Chạm 2/3)"]
        SelectPlayers -->|"Chạm 2: Xem kèo cân bằng"| BalanceConfirm["/court/balance-confirm (Chạm 3/3)"]
        BalanceConfirm -->|"Chạm 3: Vào sân ngay"| ScoreMatch["/court/score (Chấm điểm 1 tay)"]
        ScoreMatch -->|"Kết thúc & Chốt Elo"| EloSummary["Tổng kết Elo 4 VĐV"]
        EloSummary -->|"Chia lượt tiếp theo"| TabCourt
        EloSummary -->|"Xem hồ sơ"| TabProfile
    end

    subgraph Lobby ["Luồng Sảnh Kèo & Waitlist (P0)"]
        TabCourt -->|"Nút Kèo Giao Lưu"| LobbyList["/lobby (Danh sách kèo ĐN)"]
        LobbyList -->|"Bấm + Tạo kèo"| CreateLobby["/lobby/create (1-2 sân, CR-01)"]
        LobbyList -->|"Chạm thẻ kèo"| LobbyDetail["/lobby/[id] (Chi tiết, Duyệt, Waitlist)"]
        CreateLobby -->|"Tạo xong"| LobbyDetail
    end

    TabProfile -->|"Mở Dev Showcase"| DevScreen
    TabProfile -->|"Đăng xuất"| Login
```

---

## 2. Danh mục Route & Deep Link nội bộ

| Nhóm | Route Expo Router | Deep Link (`badminton://`) | Mức độ | Nút quay lại |
|---|---|---|---|---|
| **Xác thực** | `/(auth)/login`, `register`, `otp`, `forgot-password`, `onboarding` | `badminton://login` | P0 | Có (`Header` / `router.back()`) |
| **Tab 1: Sân Đấu** | `/(tabs)` & `/court` | `badminton://court` | P0 | Tab gốc |
| **Tab 2: Tìm Bạn** | `/(tabs)/partners` | `badminton://partners` | P0/P1 | Tab gốc |
| **Tab 3: Lịch Sử** | `/(tabs)/history` | `badminton://history` | P0 | Tab gốc |
| **Tab 4: Cá Nhân** | `/(tabs)/profile` | `badminton://profile` | P0 | Tab gốc |
| **Chọn Người (Chạm 2)** | `/court/select-players` | `badminton://court/select-players?sessionId=...&courtId=1` | P0 | `Header.onBackPress` -> `router.back()` |
| **Xác Nhận Kèo (Chạm 3)** | `/court/balance-confirm` | `badminton://court/balance-confirm?sessionId=...&courtId=1` | P0 | `Header.onBackPress` -> `router.back()` |
| **Chấm Điểm & Elo** | `/court/score` | `badminton://court/score?matchId=...&sessionId=...` | P0 | `Header.onBackPress` -> `router.back()` |
| **Danh Sách Kèo** | `/lobby` | `badminton://lobby` | P0 | `Header.onBackPress` -> `router.back()` |
| **Tạo Kèo Mới** | `/lobby/create` | `badminton://lobby/create` | P0 | `Header.onBackPress` -> `router.back()` |
| **Chi Tiết Kèo & Waitlist** | `/lobby/[id]` | `badminton://lobby/session_tienson_05` | P0 | `Header.onBackPress` -> `router.back()` |
| **Dev Showcase** | `/dev/ui-kit` | `badminton://dev/ui-kit` | Dev | `Header.onBackPress` -> `router.back()` |

> **Phạm vi P2 đã loại bỏ khỏi MVP:** Màn `05/06` (Thu tiền/QR), `14/15` (Cảm biến vợt/Smash Velocity/Smartwatch), `17` (Apple Watch/Garmin), `18/19/20` (Giải đấu Mini CLB & Cây nhánh đấu).

