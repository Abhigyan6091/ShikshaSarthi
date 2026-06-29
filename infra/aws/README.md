# ShikshaSarthi AWS Control Plane

This SAM project provides the AWS control layer for school registration metadata, version manifests, presigned uploads, sync status logs, and cloud-mediated record sync.

It does not host the live application database and does not replace the local school server. There is no EC2, RDS, ECS, Kubernetes, or NAT Gateway in this phase.

## Services

- S3 updates bucket: `releases/latest.json`, release packages, Docker image tar files, installer packages
- S3 school data bucket: `schools/SCHOOL_ID/backups`, `videos`, `sync`, `logs`, plus `cloud-sync/SCOPE/collections/*.json`
- DynamoDB `Schools`, `Versions`, `SyncLogs`
- Lambda handlers on Node.js 20.x
- API Gateway HTTP API

## Setup

Install and configure AWS CLI and SAM CLI:

```bash
aws configure
sam --version
```

Copy the example config and replace the API key:

```bash
cp samconfig.example.toml samconfig.toml
```

Deploy:

```bash
sam build
sam deploy --guided
```

Pass a long random `ControlApiKey` when prompted. It becomes the `CONTROL_API_KEY` Lambda environment variable and is required through `x-api-key` on protected endpoints.

## Outputs

After deployment:

```bash
aws cloudformation describe-stacks \
  --stack-name shiksha-sarthi-control-plane \
  --query "Stacks[0].Outputs"
```

Use the outputs for:

- `ApiEndpoint`
- `UpdatesBucketName`
- `SchoolDataBucketName`

## Test

```bash
curl https://<api-id>.execute-api.ap-south-1.amazonaws.com/health
curl https://<api-id>.execute-api.ap-south-1.amazonaws.com/version/latest
curl -X POST https://<api-id>.execute-api.ap-south-1.amazonaws.com/school/register \
  -H "content-type: application/json" \
  -H "x-api-key: $CONTROL_API_KEY" \
  -d '{"schoolId":"SCHOOL001","schoolName":"Demo School","syncEnabled":false}'
curl -X POST https://<api-id>.execute-api.ap-south-1.amazonaws.com/backup/request-upload-url \
  -H "content-type: application/json" \
  -H "x-api-key: $CONTROL_API_KEY" \
  -d '{"schoolId":"SCHOOL001","fileName":"backup.zip","contentType":"application/zip","sha256":"demo"}'
curl -X POST https://<api-id>.execute-api.ap-south-1.amazonaws.com/sync/push \
  -H "content-type: application/json" \
  -H "x-api-key: $CONTROL_API_KEY" \
  -d '{"schoolId":"SCHOOL001","nodeId":"SCHOOL001-LAB-01","scope":"global","collections":{"students":[]}}'
curl -X POST https://<api-id>.execute-api.ap-south-1.amazonaws.com/sync/pull \
  -H "content-type: application/json" \
  -H "x-api-key: $CONTROL_API_KEY" \
  -d '{"schoolId":"SCHOOL001","nodeId":"SCHOOL001-LAB-01","scope":"global","since":null,"limit":500}'
```

## S3 Layout

```text
releases/latest.json
releases/1.0.0/manifest.json
releases/1.0.0/shiksha-sarthi-1.0.0.zip
releases/1.0.0/shiksha-sarthi-1.0.0.tar
releases/1.0.0/sha256.txt

schools/SCHOOL001/backups/
schools/SCHOOL001/videos/
schools/SCHOOL001/sync/
schools/SCHOOL001/logs/

cloud-sync/global/collections/students.json
cloud-sync/global/collections/questions.json
```

## Cloud Record Sync

School and master nodes do not connect to each other directly. Each node pushes pending local records to `/sync/push`, where Lambda merges them into S3 collection state using last-write-wins by `updatedAt`. Each node then calls `/sync/pull` with its last successful cloud pull timestamp and applies returned records locally as synced.

Default `AWS_SYNC_SCOPE=global` means all school and master nodes exchange through the same cloud dataset. Use `AWS_SYNC_SCOPE=school` only if a deployment must isolate one school per dataset.

## Destroy Development Stack

```bash
sam delete
```

Never commit real AWS keys or the real control API key.
