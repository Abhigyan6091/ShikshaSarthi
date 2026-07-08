const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { MongoClient, ObjectId } = require("mongodb");

const uri = process.env.MONGO_URI || process.env.MONGO_URI_LOCAL || "mongodb://127.0.0.1:27017/app";
const dbName = process.env.MONGO_DB_NAME || "app";
const defaultQuestionBankDir = path.resolve(process.argv[2] || path.join(__dirname, "..", "..", "question_bank"));

const SUBJECT_LABELS = {
  maths: "गणित",
  mathematics: "गणित",
  science: "विज्ञान",
  social: "सामाजिक विज्ञान",
};

function normalizeText(value) {
  return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function normalizeOptions(options) {
  return Array.isArray(options) ? options.map(normalizeText).join("~") : "";
}

function loadBankFile(filePath) {
  let code = fs.readFileSync(filePath, "utf8");
  const exportMatch = code.match(/export\s+\{\s*([A-Za-z0-9_$]+)\s*\}/);
  if (!exportMatch) {
    throw new Error(`No named export found in ${filePath}`);
  }

  code = code.replace(
    /^\s*export\s+\{\s*([A-Za-z0-9_$]+)\s*\};?\s*$/gm,
    "module.exports = { $1 };"
  );

  const sandbox = {
    module: { exports: {} },
    exports: {},
    console: { log() {}, warn() {}, error() {} },
  };
  vm.runInNewContext(code, sandbox, { filename: filePath, timeout: 5000 });

  const bank = sandbox.module.exports[exportMatch[1]];
  if (!Array.isArray(bank)) {
    throw new Error(`Export ${exportMatch[1]} in ${filePath} is not a question bank array`);
  }

  return { exportName: exportMatch[1], bank };
}

function subjectFromSubjectId(subjectId) {
  const subjectPart = String(subjectId || "").split("-").slice(1).join("-");
  return SUBJECT_LABELS[subjectPart] || subjectPart || "General";
}

function classFromSubjectId(subjectId, fallback) {
  const classPart = String(subjectId || "").split("-")[0];
  return String(fallback || classPart || "").trim();
}

function toQuestionDocument(question, chapter, sourceFile, occurrence) {
  const optionsHindi = Array.isArray(question.optionsHindi) ? question.optionsHindi : null;
  const optionsEnglish = Array.isArray(question.options) ? question.options : [];
  const options = optionsEnglish.length ? optionsEnglish : (optionsHindi || []);
  const answerIndex = Number(question.correctAnswer);
  const correctAnswer = Number.isInteger(answerIndex) && options[answerIndex] != null
    ? options[answerIndex]
    : String(question.correctAnswer || "");
  const hintsHindi = Array.isArray(question.hintsHindi) ? question.hintsHindi : null;
  const hintsEnglish = Array.isArray(question.hints) ? question.hints : null;

  return {
    _id: new ObjectId(),
    subject: subjectFromSubjectId(question.subjectId),
    class: classFromSubjectId(question.subjectId, question.class),
    topic: chapter.chapterTitleHindi || chapter.chapterTitle || question.topicId || "General",
    question: question.question || question.questionHindi || "",
    questionHindi: question.questionHindi || "NA",
    questionImage: "",
    localPath: null,
    cloudUrl: null,
    options,
    optionsHindi: optionsHindi && optionsHindi.length ? optionsHindi : options.map(() => "NA"),
    correctAnswer,
    hint: {
      text: (hintsHindi && hintsHindi[0]) || (hintsEnglish && hintsEnglish[0]) || question.explanationHindi || question.explanation || "",
      image: "",
      video: "",
    },
    synced: true,
    sourceQuestionBankBaseKey: `${sourceFile}:${question.id}`,
    sourceQuestionBankKey: `${sourceFile}:${question.id}:${occurrence}`,
    sourceQuestionBankId: question.id,
    sourceQuestionBankFile: sourceFile,
    sourceQuestionBankOccurrence: occurrence,
    sourceSubjectId: question.subjectId,
    sourceTopicId: question.topicId,
    chapterNumber: chapter.chapterNumber,
    questionEnglish: question.question,
    optionsEnglish,
    correctAnswerIndex: Number.isInteger(answerIndex) ? answerIndex : null,
    explanation: question.explanation,
    explanationHindi: question.explanationHindi,
    difficulty: question.difficulty,
    tags: Array.isArray(question.tags) ? question.tags : [],
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function buildQuestionBankDocuments(questionBankDir = defaultQuestionBankDir) {
  if (!fs.existsSync(questionBankDir)) {
    throw new Error(`Question bank directory not found: ${questionBankDir}`);
  }

  const files = fs.readdirSync(questionBankDir).filter((file) => file.endsWith(".js") && file !== "index.js").sort();
  const documents = [];
  const sourceCounts = {};
  const sourceOccurrences = new Map();

  for (const file of files) {
    const { bank } = loadBankFile(path.join(questionBankDir, file));
    let count = 0;
    for (const chapter of bank) {
      for (const question of chapter.questions || []) {
        const baseKey = `${file}:${question.id}`;
        const occurrence = (sourceOccurrences.get(baseKey) || 0) + 1;
        sourceOccurrences.set(baseKey, occurrence);
        documents.push(toQuestionDocument(question, chapter, file, occurrence));
        count += 1;
      }
    }
    sourceCounts[file] = count;
  }

  return { documents, sourceCounts };
}

async function importQuestionBank({ collection, questionBankDir = defaultQuestionBankDir } = {}) {
  if (!collection) throw new Error("MongoDB questions collection is required");
  const { documents, sourceCounts } = buildQuestionBankDocuments(questionBankDir);

  const before = await collection.countDocuments();
  const existingQuestionKeys = new Set(
    (await collection.find(
      {},
      { projection: { class: 1, subject: 1, topic: 1, question: 1, options: 1, correctAnswer: 1 } }
    ).toArray()).map((record) => [
      normalizeText(record.class),
      normalizeText(record.subject),
      normalizeText(record.topic),
      normalizeText(record.question),
      normalizeOptions(record.options),
      normalizeText(record.correctAnswer),
    ].join("|"))
  );
  const strictTextDedupe = ["1", "true", "yes", "on"].includes(
    String(process.env.QUESTION_BANK_STRICT_TEXT_DEDUPE || "").toLowerCase()
  );

  const operations = [];
  let duplicateQuestionText = 0;

  for (const document of documents) {
    const questionKey = [
      normalizeText(document.class),
      normalizeText(document.subject),
      normalizeText(document.topic),
      normalizeText(document.question),
      normalizeOptions(document.options),
      normalizeText(document.correctAnswer),
    ].join("|");
    if (strictTextDedupe && existingQuestionKeys.has(questionKey)) {
      duplicateQuestionText += 1;
      continue;
    }

    const { _id, createdAt, ...setDocument } = document;
    const filter = document.sourceQuestionBankOccurrence === 1
      ? { $or: [
        { sourceQuestionBankKey: document.sourceQuestionBankKey },
        { sourceQuestionBankKey: document.sourceQuestionBankBaseKey },
      ] }
      : { sourceQuestionBankKey: document.sourceQuestionBankKey };

    operations.push({
      updateOne: {
        filter,
        update: {
          $set: { ...setDocument, updatedAt: new Date(), isDeleted: false },
          $setOnInsert: { _id, createdAt: createdAt || new Date() },
        },
        upsert: true,
      },
    });
    existingQuestionKeys.add(questionKey);
  }

  let bulkResult = null;
  if (operations.length) {
    bulkResult = await collection.bulkWrite(operations, { ordered: false });
  }

  const after = await collection.countDocuments();
  const distribution = await collection.aggregate([
    { $group: { _id: { class: "$class", subject: "$subject" }, count: { $sum: 1 } } },
    { $sort: { "_id.class": 1, "_id.subject": 1 } },
  ]).toArray();

  return {
    ok: true,
    questionBankDir,
    sourceCounts,
    totalQuestionBankRecords: documents.length,
    inserted: bulkResult?.upsertedCount || 0,
    updated: bulkResult?.modifiedCount || 0,
    matched: bulkResult?.matchedCount || 0,
    skipped: {
      duplicateQuestionText,
    },
    before,
    after,
    distribution,
  };
}

async function main() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  await client.connect();

  try {
    const result = await importQuestionBank({
      collection: client.db(dbName).collection("questions"),
      questionBankDir: defaultQuestionBankDir,
    });
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  buildQuestionBankDocuments,
  importQuestionBank,
  loadBankFile,
  toQuestionDocument,
};
