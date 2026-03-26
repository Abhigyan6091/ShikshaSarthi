ShikshaSarthi Offline-First Setup (Pendrive Friendly)
=====================================================

This project now supports local-first usage with delta sync.

Key behavior
------------
1. Backend writes data to local MongoDB first.
2. Records are tracked with:
   - updatedAt
   - isDeleted (soft delete)
   - synced (local sync flag)
3. Media uploads are stored locally in:
   - uploads/images
   - uploads/videos
   - uploads/audios
4. Sync uses delta only (updatedAt-based), not full DB compare.
5. Cloudinary media URLs are auto-downloaded into `uploads/` and rewritten to local URLs for offline playback.

Important endpoints
-------------------
Local media
- POST /media/upload
  Body: { base64Data, fileName, mimeType, mediaType }

Delta sync
- POST /sync/upload
  Accepts records in { collections } or { records } format.
  Uses conflict rule: latest updatedAt wins.

- GET /sync/download?lastSync=<ISO_TIMESTAMP>
  Returns records with updatedAt > lastSync.
  If lastSync is not provided, first-time full snapshot is returned.

Local sync helpers
- GET /sync/pending
  Returns local records where synced=false.

- POST /sync/mark-synced
  Marks uploaded local records as synced=true.

App version
- GET /app/version

Environment files
-----------------
Backend: backend/.env
- USE_LOCAL_DB=true
- MONGO_URI_LOCAL=mongodb://127.0.0.1:27017/app
- MONGO_URI=<cloud-uri> (optional)
- SYNC_REMOTE_URL=<cloud-backend-url> (must be backend API URL, not frontend URL)
- APP_VERSION=1.0.0
- CLOUDINARY_CLOUD_NAME / CLOUDINARY_UPLOAD_PRESET (optional for cloud media sync)

Frontend: .env
- VITE_API_URL=http://localhost:5000
- VITE_SYNC_SERVER_URL=<cloud-backend-url>
- VITE_SYNC_ENABLED=true

Run (manual)
------------
1. Start MongoDB:
   mongod --dbpath ./mongodb/data --port 27017
2. Start backend:
   cd backend
   npm install
   npm start
3. Start frontend:
   cd ..
   npm install
   npm run dev

Run (one click on Windows)
--------------------------
- Double-click start.bat

Notes
-----
- Existing APIs were preserved; sync APIs are added separately.
- Delete endpoints now soft-delete records (isDeleted=true).
- Frontend sync manager triggers sync when internet returns and periodically while online.
- Check `GET /sync/status` on local backend to inspect sync health and last error.
- Manual bootstrap is no longer required: backend auto-runs startup bootstrap and retries on login when local data is missing.
- Media sync is automatic: Cloudinary assets are downloaded to `uploads/images|videos|audios` during sync cycles.
