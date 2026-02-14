import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const endpoint = process.env.DO_SPACES_ENDPOINT;
const region = process.env.DO_SPACES_REGION ?? "sgp1";
const bucket = process.env.DO_SPACES_BUCKET;
const accessKeyId = process.env.DO_SPACES_KEY;
const secretAccessKey = process.env.DO_SPACES_SECRET;

function getClient(): S3Client {
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("DO_SPACES_* env vars required for file storage");
  }
  return new S3Client({
    endpoint,
    region,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: false,
  });
}

export function getPresignedPutUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  const client = getClient();
  if (!bucket) throw new Error("DO_SPACES_BUCKET is required");
  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(client, cmd, { expiresIn });
}

export function getPresignedGetUrl(key: string, expiresIn = 900): Promise<string> {
  const client = getClient();
  if (!bucket) throw new Error("DO_SPACES_BUCKET is required");
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, cmd, { expiresIn });
}

export async function deleteObject(key: string): Promise<void> {
  const client = getClient();
  if (!bucket) throw new Error("DO_SPACES_BUCKET is required");
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

export function buildFileKey(
  userId: string,
  roadmapId: string,
  subModuleId: string,
  fileName: string
): string {
  const uuid = crypto.randomUUID();
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `files/${userId}/${roadmapId}/${subModuleId}/${uuid}_${safe}`;
}
