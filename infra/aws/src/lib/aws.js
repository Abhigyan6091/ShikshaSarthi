const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { GetObjectCommand, PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { sanitizeFileName, sanitizeSchoolId } = require("./response");

const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "ap-south-1";
const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({ region }));
const s3 = new S3Client({ region });

function schoolScopedKey(schoolId, folder, fileName) {
  const safeSchoolId = sanitizeSchoolId(schoolId);
  const safeFileName = sanitizeFileName(fileName);
  return `schools/${safeSchoolId}/${folder}/${safeFileName}`;
}

async function createUploadUrl({ bucket, schoolId, folder, fileName, contentType }) {
  const key = schoolScopedKey(schoolId, folder, fileName);
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType || "application/octet-stream",
  });
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });
  return { uploadUrl, bucket, key, expiresIn: 900 };
}

async function createDownloadUrl({ bucket, key }) {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(s3, command, { expiresIn: 900 });
}

async function latestVersion(channel = "stable") {
  const response = await dynamo.send(new ScanCommand({
    TableName: process.env.VERSIONS_TABLE,
    FilterExpression: "channel = :channel",
    ExpressionAttributeValues: { ":channel": channel },
  }));

  const items = response.Items || [];
  return items.sort((a, b) => String(b.releaseDate || b.createdAt || "").localeCompare(String(a.releaseDate || a.createdAt || "")))[0] || null;
}

module.exports = {
  createDownloadUrl,
  createUploadUrl,
  dynamo,
  GetCommand,
  latestVersion,
  PutCommand,
  ScanCommand,
  UpdateCommand,
};
