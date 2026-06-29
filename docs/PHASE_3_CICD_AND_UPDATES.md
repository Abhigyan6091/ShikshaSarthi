# Phase 3 CI/CD And Updates

This phase makes developer releases automatic while keeping every school server offline-first.

## Target Release Flow

Developer action:

```bash
git add .
git commit -m "release: describe change"
git push origin main
git tag v1.0.1
git push origin v1.0.1
```

Automation:

1. GitHub Actions builds the production Docker app.
2. GitHub Actions builds the Windows `.exe` launcher.
3. GitHub Actions builds the Linux `.deb` launcher.
4. GitHub Actions creates a full update bundle:
   - `shiksha-sarthi-update-<version>.zip`
   - `shiksha-sarthi-update-<version>.zip.sha256`
   - `aws-update-manifest.json`
5. GitHub Releases stores public/manual download artifacts.
6. AWS S3 stores the update package and `manifest.json` for school servers.

## School Update Flow

School server behavior:

1. App keeps running locally on LAN at port `6050`.
2. MongoDB stays local and persistent.
3. When internet is available, the app checks AWS for latest version metadata.
4. If a newer version exists, the Superadmin dashboard can show an update prompt.
5. On update apply:
   - create backup first
   - download and verify checksum
   - load the new Docker app image
   - recreate only the `app` container
   - preserve `mongo_data`, uploads, backups, updates, and audio cache volumes
   - restart on the same port, `6050`
6. If health check fails, rollback uses the previous release image.

## Important Data Rule

Public `.exe`, `.deb`, and app update packages must not include real MongoDB data or real hashed credentials.

Real credentials/questions/report data live in:

- local MongoDB volumes on each school server
- guarded AWS sync/backup data
- private seed/backup bundles only when explicitly created for an authorized school

App updates replace app code/image only. They do not drop, recreate, or overwrite MongoDB volumes.

## Workflow File

The intended GitHub Actions workflow is currently stored at:

```text
docs/ci-cd/release-workflow.yml
```

It should be copied to:

```text
.github/workflows/release.yml
```

The existing `.github` directory is currently owned by `nobody:nogroup` on this machine, so Codex could not write it directly. Fix once with:

```bash
sudo chown -R vikrant:vikrant .github shikshasarthi-launcher
```

Then move/copy the workflow into `.github/workflows/release.yml`.

## Required GitHub Settings

Repository variables:

```text
AWS_REGION=ap-south-1
AWS_UPDATES_BUCKET=<updates-bucket-name>
```

Repository secrets:

```text
AWS_ACCESS_KEY_ID=<ci-deploy-access-key>
AWS_SECRET_ACCESS_KEY=<ci-deploy-secret-key>
```

Alternative later: replace access keys with GitHub OIDC and `AWS_ROLE_TO_ASSUME`.

## Local Packaging Commands

Build Docker image:

```bash
docker build \
  --build-arg VITE_API_URL=/. \
  --build-arg VITE_CLOUDINARY_ENABLED=false \
  -t shiksha-sarthi:local-school \
  -t shiksha-sarthi:1.0.1 \
  .
```

Save image and create update bundle:

```bash
mkdir -p dist-release
docker save shiksha-sarthi:local-school -o dist-release/shiksha-sarthi-image-1.0.1.tar
scripts/package-update-bundle.sh 1.0.1
```

Apply a verified update bundle on a school server:

```bash
scripts/apply-update.sh dist-release/shiksha-sarthi-update-1.0.1.zip
```

Rollback:

```bash
scripts/rollback-update.sh
```

## Remaining Backend Sync Work

The app currently has AWS manual sync exports and local API-to-API sync support, but the final architecture needs AWS-backed bidirectional sync:

```text
School local MongoDB <-> AWS sync bridge <-> Master MongoDB
```

No school server should need a master IP or Tailscale.

Remaining sync hardening:

1. Per-school/node identity derived from school admin binding.
2. Upload local school changes to AWS while offline queue stays local.
3. Master imports school uploads from AWS.
4. Master publishes approved/global changes to AWS.
5. School servers download school-specific plus global master changes.
6. Preserve hashed passwords exactly during sync.
7. Add per-collection conflict rules.
