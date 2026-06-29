# Phase 3 Update And Sync

Phase 3 adds guarded update staging/rollback and a real AWS manual sync export flow. The app remains offline-first: local login, dashboards, quizzes, reports, and uploads still work without internet.

## What Is Implemented

- Manual AWS sync exports local records to JSON.
- Sync JSON uploads to S3 under `schools/SCHOOL001/sync/`.
- AWS `SyncLogsTable` receives a `manual-record-export` completion log.
- Update state can be inspected with `/api/update/state`.
- Verified update packages can be staged with `/api/update/apply`.
- Rollback can be requested with `/api/update/rollback`.
- Host scripts exist for applying/rolling back staged releases:
  - `scripts/apply-update.sh`
  - `scripts/rollback-update.sh`

## Safety Defaults

These defaults intentionally prevent silent destructive updates:

```env
UPDATE_INSTALL_ENABLED=false
AWS_SYNC_MARK_UPLOADED_RECORDS=true
```

With `UPDATE_INSTALL_ENABLED=false`, `/api/update/apply` only stages the verified package. It does not overwrite the running app.

With `AWS_SYNC_MARK_UPLOADED_RECORDS=true`, uploaded sync records are marked as synced locally after S3 upload succeeds, which prevents the school server from repeatedly uploading the same initial database snapshot.

## APIs

```bash
curl http://localhost:6050/api/update/state
curl -X POST http://localhost:6050/api/update/apply
curl -X POST http://localhost:6050/api/update/rollback
curl -X POST http://localhost:6050/api/aws/sync/manual
```

To allow the backend to call host scripts, set:

```env
UPDATE_INSTALL_ENABLED=true
```

Then an install still requires explicit confirmation:

```bash
curl -X POST http://localhost:6050/api/update/apply \
  -H "Content-Type: application/json" \
  -d '{"confirmInstall":true}'
```

Rollback also requires explicit confirmation:

```bash
curl -X POST http://localhost:6050/api/update/rollback \
  -H "Content-Type: application/json" \
  -d '{"confirmRollback":true}'
```

## Manual Sync

Enable sync export:

```env
AWS_SYNC_ENABLED=true
```

Run:

```bash
curl -X POST http://localhost:6050/api/aws/sync/manual
```

Expected result:

```json
{
  "ok": true,
  "uploaded": true,
  "export": {
    "key": "schools/SCHOOL001/sync/sync-SCHOOL001-..."
  }
}
```

Verify S3:

```bash
aws s3 ls s3://shiksha-sarthi-control-shikshaschooldatabucket-s3uqfy75e4ai/schools/SCHOOL001/sync/ --region ap-south-1
```

Verify logs:

```bash
aws dynamodb scan \
  --table-name shiksha-sarthi-control-SyncLogsTable-BMRWR2JQ4H7U \
  --region ap-south-1
```

## Remaining Hardening

- Automatic unattended update install should wait until signed packages are added.
- Full bidirectional cloud merge should wait for conflict policy approval per collection.
- Rollback should be tested on a Windows school server with Docker Desktop before shipping.
