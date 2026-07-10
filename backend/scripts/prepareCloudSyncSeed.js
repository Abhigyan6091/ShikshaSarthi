const fs = require("fs");
const path = require("path");
const { EJSON } = require("bson");

const seedPath = path.resolve(process.argv[2] || path.join(__dirname, "..", "data", "school-seed.ejson"));
const outDir = path.resolve(process.argv[3] || path.join(__dirname, "..", "..", "dist-release", "cloud-sync-seed"));
const scope = process.argv[4] || process.env.AWS_SYNC_SCOPE || "global";

const COLLECTION_NAME_MAP = {
  questions: "questions",
  quizzes: "quizzes",
  students: "students",
  teachers: "teachers",
  schools: "schools",
  schooladmins: "schoolAdmins",
  superadmins: "superAdmins",
  classes: "classes",
  videoquestions: "videoQuestions",
  audioquestions: "audioQuestions",
  audioquizattempts: "audioQuizAttempts",
  puzzleresults: "puzzleResults",
  matquestions: "matQuestions",
  mattests: "matTests",
  matprogresses: "matProgress",
  experimentquestions: "experimentQuestions",
  experimentattempts: "experimentAttempts",
  feedbackforms: "feedbackForms",
  feedbackresponses: "feedbackResponses",
  studentreports: "studentReports",
  quizreports: "quizReports",
  vocabularychapters: "vocabularyChapters",
  classdocuments: "classDocuments",
  classannouncements: "classAnnouncements",
};

function normalizeId(id) {
  if (!id) return null;
  if (typeof id === "string") return id;
  if (id.$oid) return String(id.$oid);
  if (typeof id.toHexString === "function") return id.toHexString();
  if (id.id && id.id !== id) return normalizeId(id.id);
  if (id._id && id._id !== id) return normalizeId(id._id);
  const value = String(id);
  return value === "[object Object]" ? null : value;
}

function normalizeValue(value) {
  if (!value) return value;
  if (value instanceof Date) return value.toISOString();

  const id = normalizeId(value);
  if (id && typeof value === "object" && (value.toHexString || value.$oid || value.buffer)) {
    return id;
  }

  if (Array.isArray(value)) return value.map(normalizeValue);
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, normalizeValue(entry)])
    );
  }
  return value;
}

function normalizeRecord(record, now) {
  const normalized = normalizeValue(record);
  const id = normalizeId(record && record._id);
  if (!id) return null;

  return {
    ...normalized,
    _id: id,
    updatedAt: normalized.updatedAt || normalized.createdAt || now,
    isDeleted: Boolean(normalized.isDeleted),
    synced: true,
    _sync: {
      ...(normalized._sync || {}),
      seededAt: now,
      source: "school-seed",
    },
  };
}

function main() {
  if (!fs.existsSync(seedPath)) {
    throw new Error(`Seed file not found: ${seedPath}`);
  }

  const seed = EJSON.parse(fs.readFileSync(seedPath, "utf8"));
  const sourceCollections = seed.collections || {};
  const now = new Date().toISOString();
  const outputRoot = path.join(outDir, "cloud-sync", scope, "collections");
  fs.mkdirSync(outputRoot, { recursive: true });

  const summary = {};
  for (const [sourceName, records] of Object.entries(sourceCollections)) {
    const targetName = COLLECTION_NAME_MAP[sourceName.toLowerCase()];
    if (!targetName || !Array.isArray(records)) continue;

    const normalizedRecords = records
      .map((record) => normalizeRecord(record, now))
      .filter(Boolean)
      .sort((left, right) => String(left.updatedAt || "").localeCompare(String(right.updatedAt || "")));

    const payload = {
      type: "shiksha-sarthi-cloud-sync-collection",
      scope,
      collectionName: targetName,
      updatedAt: now,
      totalRecords: normalizedRecords.length,
      records: normalizedRecords,
    };

    fs.writeFileSync(
      path.join(outputRoot, `${targetName}.json`),
      JSON.stringify(payload)
    );
    summary[targetName] = normalizedRecords.length;
  }

  console.log(JSON.stringify({
    ok: true,
    seedPath,
    outputRoot,
    scope,
    collections: summary,
  }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
