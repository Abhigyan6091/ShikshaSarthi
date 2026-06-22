# ShikshaSarthi: Launcher Maintenance & Update Guide

This document explains how to maintain, update, and sync the ShikshaSarthi School Server system using the Desktop Launcher and Tailscale.

---

## 1. Core Development Workflow
If you modify the source code in `backend/` or `src/` (frontend), follow these steps to update the offline launcher:

1.  **Clean Build**:
    ```bash
    # In the root ShikshaSarthi directory
    npm run build
    ```
2.  **Refresh Launcher Context**:
    Because the Launcher uses `extraResources` from the parent directories, it will automatically "see" the new `dist/` and `backend/` files.
3.  **Generate New EXE**:
    ```bash
    cd shikshasarthi-launcher/desktop-wrapper
    npm run build  # On Windows to get the .exe
    ```

---

## 2. Pushing Updates via Tailscale (Remote)
To update schools remotely without giving them a new EXE, you use the **Update Agent**:

1.  **Publish New Image**:
    Build your lean image and push it to your registry (e.g., Docker Hub):
    ```bash
    docker build -t your-username/shikshasarthi:latest -f Dockerfile.lean .
    docker push your-username/shikshasarthi:latest
    ```
2.  **Update Hub Manifest**:
    On your **College Hub Server (100.111.94.52:8080)**, update the version in the manifest API:
    ```js
    // Endpoint: GET /api/update/manifest
    {
      "version": "1.1.0",
      "releaseDate": "2026-06-20"
    }
    ```
3.  **Automatic Deployment**:
    The `update-agent` on the school server will detect the version mismatch, run `docker compose pull`, and restart the specific containers without user intervention.

---

## 3. Database & Quiz Synchronization
The **Sync Agent** is designed to bridge the gap between the offline school server and the online college hub.

### How it works:
- **Hourly Cron**: Every hour, the `sync-agent` checks for a connection to `http://100.111.94.52:8080`.
- **Push (Analytics)**: It queries the local MongoDB for any `StudentReport` where `synced: false`. These are uploaded to the Hub and then marked as `synced: true` locally.
- **Pull (Content)**: It requests new `Questions` from the Hub that don't exist locally and inserts them into the school's database.

### Manual Force Sync:
If you want to force a sync immediately (e.g., when you know the internet is available):
```bash
docker restart shikshasarthi-sync-agent
```

---

## 4. Handling Persistent Data
School data is stored in the `shikshasarthi-launcher/data/db` folder on the Master Server.
- **Backups**: To backup student records, simply copy this `data/db` folder.
- **Software Resets**: You can delete the containers or the EXE, and the data will remain safe as long as the `data/` folder exists.
