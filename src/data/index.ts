import { FirebaseRepository } from "./FirebaseRepository";
import { MockRepository } from "./MockRepository";
import { DataSourceMode, IDataRepository } from "./types";

export * from "./types";
export * from "./MockRepository";
export * from "./FirebaseRepository";

/** Đọc nguồn dữ liệu từ biến môi trường EXPO_PUBLIC_DATA_SOURCE (mặc định: "mock") */
export function getConfiguredDataSource(): DataSourceMode {
  const raw = process.env.EXPO_PUBLIC_DATA_SOURCE?.trim().toLowerCase();
  return raw === "firebase" ? "firebase" : "mock";
}

/** Khởi tạo Repository theo nguồn dữ liệu truyền vào hoặc biến môi trường */
export function createRepository(source?: DataSourceMode): IDataRepository {
  const mode = source ?? getConfiguredDataSource();
  return mode === "firebase" ? new FirebaseRepository() : new MockRepository();
}

let activeRepository: IDataRepository | null = null;

/** Trả về singleton Repository dùng chung cho toàn bộ hooks & màn hình */
export function getRepository(): IDataRepository {
  if (!activeRepository) {
    activeRepository = createRepository();
  }
  return activeRepository;
}

/** Cho phép ghi đè singleton khi chuyển nguồn hoặc trong Unit Test */
export function setRepository(repo: IDataRepository | null): void {
  activeRepository = repo;
}

export const repository: IDataRepository = getRepository();
