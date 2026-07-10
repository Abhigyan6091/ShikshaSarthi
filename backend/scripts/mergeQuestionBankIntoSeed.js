const fs = require("fs");
const path = require("path");
const { EJSON, ObjectId } = require("bson");
const { buildQuestionBankDocuments } = require("./importQuestionBank");

const seedPath = path.resolve(process.argv[2] || path.join(__dirname, "..", "data", "school-seed.ejson"));
const questionBankDir = path.resolve(process.argv[3] || path.join(__dirname, "..", "..", "question_bank"));

function normalizeId(id) {
  if (!id) return null;
  if (typeof id === "string") return id;
  if (id.$oid) return String(id.$oid);
  if (typeof id.toHexString === "function") return id.toHexString();
  if (id._id && id._id !== id) return normalizeId(id._id);
  const value = String(id);
  return value === "[object Object]" ? null : value;
}

function sourceKeys(record = {}) {
  return [
    record.sourceQuestionBankKey,
    record.sourceQuestionBankBaseKey,
    record.sourceQuestionBankFile && record.sourceQuestionBankId && record.sourceQuestionBankOccurrence
      ? `${record.sourceQuestionBankFile}:${record.sourceQuestionBankId}:${record.sourceQuestionBankOccurrence}`
      : null,
    record.sourceQuestionBankFile && record.sourceQuestionBankId
      ? `${record.sourceQuestionBankFile}:${record.sourceQuestionBankId}`
      : null,
  ].filter(Boolean).map(String);
}

function indexExistingQuestions(questions) {
  const bySourceKey = new Map();
  for (const question of questions) {
    for (const key of sourceKeys(question)) {
      if (!bySourceKey.has(key)) {
        bySourceKey.set(key, question);
      }
    }
  }
  return bySourceKey;
}

function mergeQuestion(existing, incoming, timestamp) {
  return {
    ...existing,
    ...incoming,
    _id: normalizeId(existing && existing._id) || normalizeId(incoming._id) || new ObjectId().toHexString(),
    createdAt: (existing && existing.createdAt) || incoming.createdAt || timestamp,
    updatedAt: timestamp,
    isDeleted: false,
    synced: true,
    _sync: {
      ...((existing && existing._sync) || {}),
      source: "packaged-question-bank",
      cloudUpdatedAt: timestamp,
    },
  };
}

function main() {
  if (!fs.existsSync(seedPath)) {
    throw new Error(`Seed file not found: ${seedPath}`);
  }

  const seed = EJSON.parse(fs.readFileSync(seedPath, "utf8"));
  if (!seed || seed.type !== "shiksha-sarthi-school-seed" || !seed.collections) {
    throw new Error(`Invalid ShikshaSarthi seed file: ${seedPath}`);
  }

  const existingQuestions = Array.isArray(seed.collections.questions)
    ? seed.collections.questions
    : [];
  const { documents, sourceCounts } = buildQuestionBankDocuments(questionBankDir);
  const bySourceKey = indexExistingQuestions(existingQuestions);
  const byId = new Map(existingQuestions.map((question) => [normalizeId(question._id), question]).filter(([id]) => id));
  const now = new Date().toISOString();
  const baseTime = Date.now();
  let timestampOffset = 0;

  let inserted = 0;
  let updated = 0;

  for (const document of documents) {
    const keys = sourceKeys(document);
    const existing = keys.map((key) => bySourceKey.get(key)).find(Boolean);
    const timestamp = new Date(baseTime + timestampOffset).toISOString();
    timestampOffset += 1;
    const merged = mergeQuestion(existing, document, timestamp);
    const id = normalizeId(merged._id);

    if (existing) {
      updated += 1;
    } else {
      inserted += 1;
    }

    byId.set(id, merged);
    for (const key of sourceKeys(merged)) {
      bySourceKey.set(key, merged);
    }
  }

  seed.collections.questions = [...byId.values()].sort((left, right) =>
    String(left.updatedAt || "").localeCompare(String(right.updatedAt || ""))
  );
  seed.questionBankMergedAt = now;

  fs.writeFileSync(seedPath, EJSON.stringify(seed, null, 2));
  console.log(JSON.stringify({
    ok: true,
    seedPath,
    questionBankDir,
    sourceCounts,
    fileQuestions: documents.length,
    inserted,
    updated,
    totalQuestions: seed.collections.questions.length,
  }, null, 2));
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  mergeQuestion,
  sourceKeys,
};
