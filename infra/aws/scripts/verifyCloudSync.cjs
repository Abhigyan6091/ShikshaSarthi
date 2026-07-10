#!/usr/bin/env node
/**
 * Dependency-free verification of the cloud sync merge/delta correctness that
 * governs cross-instance replication of the question bank, credentials, and
 * DELETIONS. Exercises the real infra functions (no AWS SDK / no S3 needed).
 *
 * Run: node infra/aws/scripts/verifyCloudSync.js
 *
 * Simulates: school A pushes -> S3 store (mergeRecords) -> school B pulls
 * (filterDelta) -> school B applies. Asserts additions AND deletions propagate,
 * and that a delete is never dropped on a timestamp tie.
 */
const assert = require("assert");
const { mergeRecords, filterDelta, deltaTimestamp } = require("../src/lib/cloudSyncStore");

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log(`  ok - ${name}`);
}

const ctx = { schoolId: "SCHOOL-A", nodeId: "SCHOOL-A-node", now: "2026-07-10T10:00:00.000Z" };

console.log("Cloud sync merge/delta verification\n");

// 1. Insert propagates.
check("new record is inserted into the cloud store", () => {
  const merged = mergeRecords([], [{ _id: "q1", question: "Q1", updatedAt: "2026-07-10T09:00:00.000Z" }], ctx);
  assert.strictEqual(merged.inserted, 1);
  assert.strictEqual(merged.records.length, 1);
  assert.strictEqual(merged.records[0].isDeleted, false);
});

// 2. Newer update wins.
check("a strictly newer update replaces the existing record", () => {
  const existing = [{ _id: "q1", question: "old", updatedAt: "2026-07-10T09:00:00.000Z" }];
  const merged = mergeRecords(existing, [{ _id: "q1", question: "new", updatedAt: "2026-07-10T09:30:00.000Z" }], ctx);
  assert.strictEqual(merged.updated, 1);
  assert.strictEqual(merged.records[0].question, "new");
});

// 3. Deletion propagates (tombstone stored, not dropped).
check("a soft-delete (isDeleted:true) is stored as a tombstone", () => {
  const existing = [{ _id: "s1", schoolId: "X", updatedAt: "2026-07-10T09:00:00.000Z" }];
  const merged = mergeRecords(existing, [{ _id: "s1", schoolId: "X", isDeleted: true, updatedAt: "2026-07-10T09:30:00.000Z" }], ctx);
  assert.strictEqual(merged.records[0].isDeleted, true, "deletion must be stored");
});

// 4. THE regression guard: deletion wins a timestamp tie (clock skew / 1s res).
check("a deletion wins a timestamp tie against a still-active record", () => {
  const ts = "2026-07-10T09:00:00.000Z";
  const existing = [{ _id: "s2", schoolId: "Y", updatedAt: ts }];
  const merged = mergeRecords(existing, [{ _id: "s2", schoolId: "Y", isDeleted: true, updatedAt: ts }], ctx);
  assert.strictEqual(merged.records[0].isDeleted, true, "tombstone must win the tie, else deleted schools reappear");
});

// 5. An older active record does NOT resurrect a newer deletion.
check("an older active record cannot overwrite a newer deletion", () => {
  const existing = [{ _id: "s3", schoolId: "Z", isDeleted: true, updatedAt: "2026-07-10T09:30:00.000Z" }];
  const merged = mergeRecords(existing, [{ _id: "s3", schoolId: "Z", isDeleted: false, updatedAt: "2026-07-10T09:00:00.000Z" }], ctx);
  assert.strictEqual(merged.records[0].isDeleted, true, "stale un-delete must be rejected");
});

// 6. Delta pull returns deletions (tombstones are not filtered out).
check("filterDelta returns deleted records to pulling nodes", () => {
  const store = [
    { _id: "a", updatedAt: "2026-07-10T09:10:00.000Z", _sync: { cloudUpdatedAt: "2026-07-10T09:10:00.000Z" } },
    { _id: "b", isDeleted: true, updatedAt: "2026-07-10T09:20:00.000Z", _sync: { cloudUpdatedAt: "2026-07-10T09:20:00.000Z" } },
  ];
  const delta = filterDelta(store, { since: "2026-07-10T09:00:00.000Z", limit: 500 });
  assert.strictEqual(delta.length, 2);
  assert.ok(delta.some((r) => r._id === "b" && r.isDeleted), "deletion must be in the delta");
});

// 7. Delta cursor excludes records at/older than `since`.
check("filterDelta excludes records not newer than the cursor", () => {
  const store = [{ _id: "a", updatedAt: "2026-07-10T09:00:00.000Z", _sync: { cloudUpdatedAt: "2026-07-10T09:00:00.000Z" } }];
  const delta = filterDelta(store, { since: "2026-07-10T09:00:00.000Z", limit: 500 });
  assert.strictEqual(delta.length, 0);
});

// 8. deltaTimestamp prefers server-monotonic cloudUpdatedAt.
check("deltaTimestamp prefers cloudUpdatedAt over client updatedAt", () => {
  const t = deltaTimestamp({ updatedAt: "2020-01-01T00:00:00.000Z", _sync: { cloudUpdatedAt: "2026-07-10T09:00:00.000Z" } });
  assert.strictEqual(t.toISOString(), "2026-07-10T09:00:00.000Z");
});

console.log(`\nAll ${passed} cloud-sync checks passed. Additions and deletions replicate correctly.`);
