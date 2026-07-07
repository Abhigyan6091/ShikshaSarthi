const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const SchoolAdmin = require("../models/SchoolAdmin");
const School = require("../models/School");
const Question = require("../models/Question");

// Map a grade class number to a graduation batch year: class 12 → 2026,
// class 11 → 2027, … i.e. batch = 2038 - class.
function classToBatch(classValue) {
  const n = parseInt(String(classValue), 10);
  if (!Number.isFinite(n) || n < 1 || n > 12) return null;
  return String(2038 - n);
}

// One-time backfill: give every existing student a `batch` derived from their
// legacy `class`. Saving marks the record unsynced so the new value propagates
// to the cloud (and thus all other school instances) on the next sync.
async function backfillStudentBatches() {
  const students = await Student.find({
    $or: [{ batch: { $exists: false } }, { batch: null }, { batch: "" }],
  });

  let updated = 0;
  for (const student of students) {
    const batch = classToBatch(student.class);
    if (!batch) continue; // non-numeric class (e.g. "NMMS") — leave as-is
    student.batch = batch;
    await student.save(); // pre-save hook sets updatedAt + synced:false
    updated += 1;
  }
  if (updated) console.log(`Migration: backfilled batch for ${updated} student(s).`);
  return updated;
}

// Soft-delete the teachers / school admins / students of any school that has
// already been (soft-)deleted, so a deleted school doesn't leave orphans.
async function cleanupOrphanedProfiles() {
  const deletedSchools = await School.find({ isDeleted: true })
    .setOptions({ includeDeleted: true })
    .select("schoolId")
    .lean();
  const ids = deletedSchools.map((s) => s.schoolId).filter(Boolean);
  if (!ids.length) return 0;

  let total = 0;
  for (const Model of [Student, Teacher, SchoolAdmin]) {
    const result = await Model.updateMany(
      { schoolId: { $in: ids } },
      { $set: { isDeleted: true, synced: false, updatedAt: new Date() } }
    );
    total += result.modifiedCount || 0;
  }
  if (total) console.log(`Migration: soft-deleted ${total} orphaned profile(s) of deleted schools.`);
  return total;
}

// Tag single-lingual questions: fill missing Hindi fields with "NA" so it's
// explicit that no Hindi translation exists yet.
async function backfillQuestionBilingual() {
  const missingText = await Question.updateMany(
    { $or: [{ questionHindi: { $exists: false } }, { questionHindi: null }, { questionHindi: "" }] },
    { $set: { questionHindi: "NA" } }
  );
  // optionsHindi = one "NA" per option, only where absent.
  const missingOptions = await Question.updateMany(
    { optionsHindi: { $exists: false } },
    [{ $set: { optionsHindi: { $map: { input: "$options", as: "o", in: "NA" } } } }]
  );
  const touched = (missingText.modifiedCount || 0) + (missingOptions.modifiedCount || 0);
  if (touched) console.log(`Migration: tagged single-lingual questions with NA (${touched} updates).`);
  return touched;
}

async function runStartupMigrations() {
  try {
    await backfillStudentBatches();
    await cleanupOrphanedProfiles();
    await backfillQuestionBilingual();
  } catch (error) {
    console.error("Startup migrations error:", error.message);
  }
}

module.exports = {
  runStartupMigrations,
  backfillStudentBatches,
  cleanupOrphanedProfiles,
  backfillQuestionBilingual,
  classToBatch,
};
