/**
 * JEST SUITE: KỊCH BẢN E2E INTEGRATION FLOW TOÀN HỆ THỐNG (WBS 5.1 & M8)
 */

import { runE2EIntegrationFlow } from "../../scripts/e2e-flow";

describe("E2E Integration Flow: Full Application Lifecycle (M8 Feature Freeze)", () => {
  it("Chạy thành công kịch bản E2E toàn diện từ Đăng ký, Tạo kèo, Đặt suất, Waitlist, Cân kèo, Chốt Elo đến Thống kê", async () => {
    await expect(runE2EIntegrationFlow()).resolves.not.toThrow();
  });
});
