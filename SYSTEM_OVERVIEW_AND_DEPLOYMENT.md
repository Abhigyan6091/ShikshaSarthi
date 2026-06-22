# Shiksha Sarthi: System Overview & Deployment Guide

This document centralizes everything implemented for the **Password Recovery**, **Admin Management**, and **Automated Ship/Update System**.

---

## 1. Password Recovery System (Secure OTP)
We have implemented a multi-role password recovery system that works offline for local logins but can use the internet for email OTPs when available.

### Features:
- **Email OTP Reset**: Users (Students, Teachers, Admins) can request a 6-digit OTP to their registered email.
- **Admin Manual Reset**: School Admins and Super Admins can generate a temporary password for any student.
- **Forced Password Change**: Upon first login after a reset, users are redirected to `/change-password` to secure their account.

### Key Components:
- **Backend Routes**: `api/auth/request-otp`, `api/auth/reset-password`, `api/auth/admin/reset-student-password`.
- **Frontend Pages**: `ForgotPassword.tsx`, `ResetPassword.tsx`, `ForceChangePassword.tsx`.
- **Security**: Rate limiting (5 attempts/hour), generic error responses, and full audit logging for security transparency.

---

## 2. Automated Shipping & Updates (The Launcher)
The system is designed to be shipped as a lean **Portable EXE** while maintaining the ability to update remotely via Tailscale.

### Build Workflow:
1.  **Code Changes**: Modify backend/frontend source.
2.  **Core Build**: `npm run build` in root.
3.  **Desktop Wrapper**:
    ```bash
    cd shikshasarthi-launcher/desktop-wrapper
    npm run build
    ```
    This generates `ShikshaSarthi.exe`. This EXE bundles everything except heavy assets (which are pulled from the master server folder).

### Update System (Master Hub ↔ School Server):
We use a "Pull-based" update model to ensure stability in schools with intermittent internet.

1.  **The Master Hub**:
    - Stores the latest Docker images.
    - Exposes a **Manifest API** (`/api/updates/manifest`).
    - Endpoint for CI/CD to push new versions (`POST /api/updates/publish`).

2.  **The School Server (The EXE Environment)**:
    - Runs an **Update Agent** (`shikshasarthi-update-agent`).
    - Every hour, it checks the Master Hub over Tailscale.
    - If a new version exists, it runs `docker compose pull` and restarts the backend/frontend containers.

---

## 3. Remote Maintenance via Tailscale
Tailscale creates a secure "LAN" across all school servers.

- **Hub IP**: `100.70.80.90` (Standardized across all code).
- **Syncing**: The `sync-agent` pushes student analytics and pulls new question bank updates hourly.
- **Remote Access**: You can SSH into any school server using its Tailscale IP to debug or manual-fix without physical travel.

---

## 4. Final Verification Checklist
- [x] **OTP Delivery**: Confirmed `nodemailer` integration.
- [x] **Rate Limiting**: Confirmed `rate-limiter-flexible` protection.
- [x] **Admin Actions**: Reset button added to School Admin student list.
- [x] **Manifest Route**: Created `/api/updates/manifest` for the Update Agent.
- [x] **Desktop Compatibility**: Ensured paths in the EXE launcher match the local Docker Compose mounts.

---

**Note**: When deploying, ensure the `.env` file in `shikshasarthi-launcher` has the `SCHOOL_ID` correctly set so that data syncs to the correct school profile on the Master Hub.
