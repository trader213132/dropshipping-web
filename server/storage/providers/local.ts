import fs from "fs/promises";
import path from "path";
import type { StorageProvider, UploadResult, StorageFile } from "../index";

export class LocalStorageProvider implements StorageProvider {
  private basePath: string;

  constructor(basePath = "./uploads") {
    this.basePath = path.resolve(basePath);
  }

  private async ensureDir(dir: string) {
    await fs.mkdir(dir, { recursive: true });
  }

  private filePath(key: string): string {
    // Prevent path traversal
    const safe = key.replace(/\.\./g, "").replace(/^\/+/, "");
    return path.join(this.basePath, safe);
  }

  async upload(key: string, data: Buffer | Uint8Array, options?: { contentType?: string }): Promise<UploadResult> {
    const filePath = this.filePath(key);
    await this.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, data);

    // Write metadata sidecar
    if (options?.contentType) {
      await fs.writeFile(`${filePath}.meta`, JSON.stringify({ contentType: options.contentType }));
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    return {
      key,
      url: `${appUrl}/api/storage/${key}`,
      size: data.length,
    };
  }

  async download(key: string): Promise<Buffer> {
    return fs.readFile(this.filePath(key));
  }

  async delete(key: string): Promise<void> {
    const filePath = this.filePath(key);
    await fs.unlink(filePath).catch(() => {});
    await fs.unlink(`${filePath}.meta`).catch(() => {});
  }

  async exists(key: string): Promise<boolean> {
    try {
      await fs.access(this.filePath(key));
      return true;
    } catch {
      return false;
    }
  }

  async getMetadata(key: string): Promise<StorageFile | null> {
    try {
      const filePath = this.filePath(key);
      const stat = await fs.stat(filePath);
      let contentType = "application/octet-stream";
      try {
        const meta = await fs.readFile(`${filePath}.meta`, "utf8");
        contentType = (JSON.parse(meta) as { contentType: string }).contentType;
      } catch {}
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      return {
        key,
        url: `${appUrl}/api/storage/${key}`,
        size: stat.size,
        contentType,
        lastModified: stat.mtime,
      };
    } catch {
      return null;
    }
  }
}
