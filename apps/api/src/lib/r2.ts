import {
  PutObjectCommand,
  S3Client,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { config } from "../config";

let client: S3Client | null = null;

function getClient() {
  if (!config.r2.endpoint || !config.r2.accessKeyId || !config.r2.secretAccessKey) {
    return null;
  }
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: config.r2.endpoint,
      credentials: {
        accessKeyId: config.r2.accessKeyId,
        secretAccessKey: config.r2.secretAccessKey,
      },
    });
  }
  return client;
}

export async function uploadBoardSnapshot(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType = "application/json"
) {
  const s3 = getClient();
  if (!s3 || !config.r2.bucketName) {
    return { ok: false as const, url: null, reason: "R2 not configured" };
  }

  await s3.send(
    new PutObjectCommand({
      Bucket: config.r2.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  const url = config.r2.publicBaseUrl
    ? `${config.r2.publicBaseUrl.replace(/\/$/, "")}/${key}`
    : `r2://${config.r2.bucketName}/${key}`;

  return { ok: true as const, url };
}

export async function listUserSnapshots(prefix: string) {
  const s3 = getClient();
  if (!s3 || !config.r2.bucketName) return [];
  const result = await s3.send(
    new ListObjectsV2Command({
      Bucket: config.r2.bucketName,
      Prefix: prefix,
      MaxKeys: 50,
    })
  );
  return result.Contents ?? [];
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

export async function getR2StorageStats() {
  const s3 = getClient();
  if (!s3 || !config.r2.bucketName) {
    return {
      status: "not_configured" as const,
      configured: false,
      bucket: config.r2.bucketName || "none",
      endpoint: config.r2.endpoint ? new URL(config.r2.endpoint).hostname : "not set",
      totalObjects: 0,
      totalBytes: 0,
      formattedSize: "0 B",
      avgObjectSize: "0 B",
      recentSnapshots: [],
      error: null,
    };
  }

  try {
    const command = new ListObjectsV2Command({
      Bucket: config.r2.bucketName,
      MaxKeys: 1000,
    });
    const response = await s3.send(command);
    const contents = response.Contents || [];
    const totalBytes = contents.reduce((acc, item) => acc + (item.Size || 0), 0);
    const totalObjects = contents.length;

    const recentSnapshots = contents
      .slice()
      .sort((a, b) => (b.LastModified?.getTime() || 0) - (a.LastModified?.getTime() || 0))
      .slice(0, 15)
      .map((item) => ({
        key: item.Key || "unknown",
        size: item.Size || 0,
        formattedSize: formatBytes(item.Size || 0),
        lastModified: item.LastModified?.toISOString() || null,
        storageClass: item.StorageClass || "STANDARD",
      }));

    return {
      status: "connected" as const,
      configured: true,
      bucket: config.r2.bucketName,
      endpoint: new URL(config.r2.endpoint).hostname,
      totalObjects,
      totalBytes,
      formattedSize: formatBytes(totalBytes),
      avgObjectSize: totalObjects > 0 ? formatBytes(Math.round(totalBytes / totalObjects)) : "0 B",
      recentSnapshots,
      error: null,
    };
  } catch (err) {
    return {
      status: "error" as const,
      configured: true,
      bucket: config.r2.bucketName,
      endpoint: config.r2.endpoint ? new URL(config.r2.endpoint).hostname : "error",
      totalObjects: 0,
      totalBytes: 0,
      formattedSize: "0 B",
      avgObjectSize: "0 B",
      recentSnapshots: [],
      error: err instanceof Error ? err.message : "Failed to connect to R2",
    };
  }
}

