const { createUploadUrl } = require("../lib/aws");
const { json, readJsonBody, requireApiKey } = require("../lib/response");

exports.handler = async (event) => {
  const auth = requireApiKey(event);
  if (!auth.ok) return auth.response;

  const body = readJsonBody(event);
  const result = await createUploadUrl({
    bucket: process.env.SCHOOL_DATA_BUCKET,
    schoolId: body.schoolId,
    folder: "sync",
    fileName: body.fileName,
    contentType: body.contentType,
  });
  return json(200, result);
};
