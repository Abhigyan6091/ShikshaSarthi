const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
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

async function latestVersionByScan(channel) {
  // Fallback path: full-table scan filtered client-side. Only used if the
  // channel-releaseDate-index GSI isn't available yet (e.g. mid-deploy while
  // the index backfills), so version checks never go fully down during a
  // rollout.
  const response = await dynamo.send(new ScanCommand({
    TableName: process.env.VERSIONS_TABLE,
    FilterExpression: "channel = :channel",
    ExpressionAttributeValues: { ":channel": channel },
  }));

  const items = response.Items || [];
  return items.sort((a, b) => String(b.releaseDate || b.createdAt || "").localeCompare(String(a.releaseDate || a.createdAt || "")))[0] || null;
}

async function latestVersion(channel = "stable") {
  try {
    const response = await dynamo.send(new QueryCommand({
      TableName: process.env.VERSIONS_TABLE,
      IndexName: "channel-releaseDate-index",
      KeyConditionExpression: "channel = :channel",
      ExpressionAttributeValues: { ":channel": channel },
      ScanIndexForward: false,
      Limit: 1,
    }));

    return (response.Items || [])[0] || null;
  } catch (error) {
    if (error.name === "ResourceNotFoundException" || error.name === "ValidationException") {
      return latestVersionByScan(channel);
    }
    throw error;
  }
}

module.exports = {
  createDownloadUrl,
  createUploadUrl,
  dynamo,
  GetObjectCommand,
  GetCommand,
  latestVersion,
  PutCommand,
  ScanCommand,
  s3,
  PutObjectCommand,
  UpdateCommand,
};
