const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { EJSON } = require("bson");

// Inverse of backend/scripts/prepareCloudSyncSeed.js's COLLECTION_NAME_MAP:
// cloud-sync collection name (as written by infra/aws/src/lib/cloudSyncStore.js,
// matching backend/sync/modelRegistry.js's SYNC_MODELS keys) -> Mongo collection name.
const CLOUD_SYNC_TO_MONGO_COLLECTION = {
  questions: "questions",
  quizzes: "quizzes",
  students: "students",
  teachers: "teachers",
  schools: "schools",
  schoolAdmins: "schooladmins",
  superAdmins: "superadmins",
  classes: "classes",
  videoQuestions: "videoquestions",
  audioQuestions: "audioquestions",
  audioQuizAttempts: "audioquizattempts",
  puzzleResults: "puzzleresults",
  matQuestions: "matquestions",
  matTests: "mattests",
  matProgress: "matprogresses",
  experimentQuestions: "experimentquestions",
  experimentAttempts: "experimentattempts",
  feedbackForms: "feedbackforms",
  feedbackResponses: "feedbackresponses",
  studentReports: "studentreports",
  quizReports: "quizreports",
  vocabularyChapters: "vocabularychapters",
  classDocuments: "classdocuments",
  classAnnouncements: "classannouncements",
};

const bucket = process.argv[2] || process.env.AWS_SCHOOL_DATA_BUCKET;
const scope = process.argv[3] || process.env.AWS_SYNC_SCOPE || "global";
const outputPath = path.resolve(
  process.argv[4] || process.env.SEED_OUTPUT || path.join(__dirname, "..", "data", "school-seed.ejson")
);

function fetchCollectionJson(collectionName) {
  const key = `cloud-sync/${scope}/collections/${collectionName}.json`;
  try {
    const raw = execFileSync("aws", ["s3", "cp", `s3://${bucket}/${key}`, "-"], {
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 256,
      stdio: ["ignore", "pipe", "pipe"],
    });
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.records) ? parsed.records : [];
  } catch (_error) {
    // Collection not synced yet (no object in S3) - treat as empty, not fatal.
    return [];
  }
}

function main() {
  if (!bucket) {
    throw new Error("AWS_SCHOOL_DATA_BUCKET is required (arg 1 or env var).");
  }

  const payload = {
    type: "shiksha-sarthi-school-seed",
    dbName: "app",
    scope,
    createdAt: new Date().toISOString(),
    collections: {},
  };

  const counts = {};
  for (const [cloudSyncName, mongoCollectionName] of Object.entries(CLOUD_SYNC_TO_MONGO_COLLECTION)) {
    const records = fetchCollectionJson(cloudSyncName);
    payload.collections[mongoCollectionName] = records;
    counts[mongoCollectionName] = records.length;
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, EJSON.stringify(payload, null, 2));

  console.log(JSON.stringify({ ok: true, outputPath, bucket, scope, counts }, null, 2));
}

main();
