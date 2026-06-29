const { dynamo, GetCommand } = require("../lib/aws");
const { json, requireApiKey, sanitizeSchoolId } = require("../lib/response");

exports.handler = async (event) => {
  const auth = requireApiKey(event);
  if (!auth.ok) return auth.response;

  const schoolId = sanitizeSchoolId(event.pathParameters?.schoolId);
  const result = await dynamo.send(new GetCommand({
    TableName: process.env.SCHOOLS_TABLE,
    Key: { schoolId },
  }));

  if (!result.Item) {
    return json(404, { ok: false, error: "School not found" });
  }

  return json(200, { ok: true, school: result.Item });
};
