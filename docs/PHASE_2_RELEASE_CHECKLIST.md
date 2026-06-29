# Phase 2 Release Checklist

## AWS

- [ ] `sam validate`
- [ ] `sam build`
- [ ] `sam deploy --guided`
- [ ] `/health` works
- [ ] `/version/latest` works
- [ ] School register works
- [ ] Heartbeat works
- [ ] Presigned backup upload works
- [ ] Presigned video upload works
- [ ] S3 buckets have no public write access
- [ ] No hardcoded secrets

## Local Server

- [ ] AWS disabled mode works
- [ ] AWS enabled but unreachable does not crash app
- [ ] `/api/aws/status` works
- [ ] `/api/aws/heartbeat` works when configured
- [ ] `/api/aws/version/latest` works when configured
- [ ] `/api/aws/backup/upload-latest` uploads a packaged backup
- [ ] `/api/update/check` works
- [ ] `/api/update/download` verifies SHA256 and does not install
- [ ] `/api/aws/sync/manual` returns the Phase 3 placeholder message
- [ ] Phase 3 manual sync exports upload to S3 when `AWS_SYNC_ENABLED=true`

## Installer

- [ ] Inno Setup script exists
- [ ] `build-installer.ps1` exists
- [ ] Shortcuts are created
- [ ] Firewall rule for `6050` is created
- [ ] App opens at `http://localhost:6050`
- [ ] Data is stored under `C:\ProgramData\ShikshaSarthi`
- [ ] No secrets are bundled

## Package

- [ ] `scripts/package-release.sh` creates `dist-release`
- [ ] `scripts/package-release.ps1` creates `dist-release`
- [ ] Package excludes `.env`, `node_modules`, `.git`, backups, uploads, database files, and secrets
- [ ] `manifest.json` includes package SHA256
