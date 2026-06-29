const { createDownloadUrl } = require("../lib/aws");
const { json, readJsonBody, requireApiKey, sanitizeFileName, sanitizeSchoolId } = require("../lib/response");

exports.handler = async (event) => {
  const auth = requireApiKey(event);
  if (!auth.ok) return auth.response;

  const body = readJsonBody(event);
  const schoolId = sanitizeSchoolId(body.schoolId);
  const fileName = sanitizeFileName(body.fileName || "sync-export.json");
  const key = `schools/${schoolId}/sync/${fileName}`;
  const downloadUrl = await createDownloadUrl({ bucket: process.env.SCHOOL_DATA_BUCKET, key });
  return json(200, { downloadUrl, bucket: process.env.SCHOOL_DATA_BUCKET, key, expiresIn: 900 });
};
