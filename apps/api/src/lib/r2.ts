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
