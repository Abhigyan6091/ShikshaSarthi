# Phase 2 AWS Setup

## Architecture

Phase 2 uses only serverless AWS services:

- S3 for release packages, backups, videos, sync payloads, and logs
- Lambda for small control-plane handlers
- API Gateway HTTP API for school-server calls
- DynamoDB for Schools, Versions, and SyncLogs

There is no EC2, RDS, ECS, Kubernetes, or NAT Gateway. The local school server remains the live backend for login, dashboard, quizzes, reports, uploads, and local usage.

## Deploy

```bash
cd infra/aws
cp samconfig.example.toml samconfig.toml
sam build
sam deploy --guided
```

Use `ap-south-1` unless you have a reason to change region. Set `ControlApiKey` to a long random value. Rotate it by running `sam deploy --guided` again with a new parameter value, then updating each school server `.env`.

## Local Server Environment

```env
AWS_REGION=ap-south-1
AWS_CONTROL_API_URL=https://<api-id>.execute-api.ap-south-1.amazonaws.com
AWS_CONTROL_API_KEY=<secret>
AWS_SCHOOL_ID=SCHOOL001
AWS_SYNC_ENABLED=false
AWS_BACKUP_SYNC_ENABLED=true
AWS_VIDEO_SYNC_ENABLED=true
AWS_UPDATE_CHECK_ENABLED=true
AWS_UPDATE_CHANNEL=stable
```

If `AWS_CONTROL_API_URL` is empty, AWS is disabled. If the internet is down, the local server reports AWS as unreachable and keeps working offline.

## API Examples

```bash
curl https://<api-id>.execute-api.ap-south-1.amazonaws.com/health
curl https://<api-id>.execute-api.ap-south-1.amazonaws.com/version/latest
curl -X POST https://<api-id>.execute-api.ap-south-1.amazonaws.com/school/heartbeat \
  -H "content-type: application/json" \
  -H "x-api-key: $CONTROL_API_KEY" \
  -d '{"schoolId":"SCHOOL001","currentVersion":"1.0.0","syncEnabled":false}'
```

## Presigned Upload Test

```bash
curl -X POST "$AWS_CONTROL_API_URL/backup/request-upload-url" \
  -H "content-type: application/json" \
  -H "x-api-key: $AWS_CONTROL_API_KEY" \
  -d '{"schoolId":"SCHOOL001","fileName":"backup-2026-06-29.tar.gz","contentType":"application/gzip","sha256":"abc"}'
```

Upload with the returned `uploadUrl` using HTTP PUT. S3 objects are scoped under `schools/{schoolId}/`.

## DynamoDB Tables

- `Schools`: `schoolId` partition key; license, registration, last seen, current/target versions, sync flags, channel, notes
- `Versions`: `version` partition key; release date, channel, mandatory flag, package key, checksum, notes
- `SyncLogs`: `schoolId` partition key and `timestamp` sort key; sync/backup/video status log entries

## Security Notes

Do not commit AWS credentials, `CONTROL_API_KEY`, or production secrets. Buckets block public access. School servers use presigned URLs and never receive AWS credentials. Update downloads must pass SHA256 verification before any future installer step.
