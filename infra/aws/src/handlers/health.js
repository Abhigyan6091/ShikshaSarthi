const { json, nowIso } = require("../lib/response");

exports.handler = async () => json(200, {
  ok: true,
  service: "ShikshaSarthi AWS Control Plane",
  timestamp: nowIso(),
});
