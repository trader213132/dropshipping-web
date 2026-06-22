import { LocalStorageProvider } from "./providers/local";

export interface UploadResult {
  key: string;
  url: string;
  size: number;
}

export interface StorageFile {
  key: string;
  url: string;
  size: number;
  contentType: string;
  lastModified: Date;
}

export interface StorageProvider {
  upload(key: string, data: Buffer | Uint8Array, options?: { contentType?: string }): Promise<UploadResult>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  getMetadata(key: string): Promise<StorageFile | null>;
}

const globalStorage = globalThis as unknown as { storage: StorageProvider | undefined };

function createStorage(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER ?? "local";

  if (provider === "s3") {
    // TODO Phase 6: implement S3 provider
    // Requires: STORAGE_S3_BUCKET, STORAGE_S3_REGION, STORAGE_S3_ACCESS_KEY_ID, STORAGE_S3_SECRET_ACCESS_KEY
    throw new Error("S3 storage provider not yet implemented. Set STORAGE_PROVIDER=local for development.");
  }

  return new LocalStorageProvider(process.env.STORAGE_LOCAL_PATH ?? "./uploads");
}

export function getStorage(): StorageProvider {
  if (!globalStorage.storage) {
    globalStorage.storage = createStorage();
  }
  return globalStorage.storage;
}

export async function uploadFile(
  key: string,
  data: Buffer | Uint8Array,
  options?: { contentType?: string },
): Promise<UploadResult> {
  return getStorage().upload(key, data, options);
}

export async function downloadFile(key: string): Promise<Buffer> {
  return getStorage().download(key);
}

export async function deleteFile(key: string): Promise<void> {
  return getStorage().delete(key);
}

export async function fileExists(key: string): Promise<boolean> {
  return getStorage().exists(key);
}
