# Local School Deployment

## What Phase 1 Provides

Phase 1 turns ShikshaSarthi into a local school server application. The school master server runs the web app, backend API, MongoDB database, uploaded files, backups, and local configuration. Teachers, students, school admins, and super admins open the app from browsers on the same LAN.

Internet is optional after Docker images and dependencies are installed. AWS sync, Tailscale, Gemini, Cloudinary, and auto-update are not required for Phase 1.

## How The School Server Works

The server runs two Docker services:

- `app`: React frontend, nginx, and the Node/Express backend
- `mongo`: local MongoDB database

The app is available on:

- Local server browser: `http://localhost:6050`
- Other LAN devices: `http://<server-ip>:6050`

## Suggested Machine Specs

- CPU: 4 cores or better
- RAM: 8 GB minimum, 16 GB recommended
- Disk: 100 GB free space or more
- OS: Ubuntu LTS or Windows 10/11 with Docker Desktop
- Network: wired LAN recommended for the master server

## Install Docker

Ubuntu:

```sh
sudo apt update
sudo apt install docker.io docker-compose-plugin
sudo systemctl enable --now docker
```

Windows:

1. Install Docker Desktop.
2. Start Docker Desktop.
3. Open PowerShell or Command Prompt in the project folder.

## Configure Environment

From the repository root:

```sh
cp .env.local-school.example .env
```

The default `.env` uses local MongoDB, local uploads, disabled sync, disabled AI hints, disabled Cloudinary, and enabled backups.

## Start The App

Linux/macOS:

```sh
./scripts/start-local-school.sh
```

Or manually:

```sh
docker compose up -d --build
```

Windows:

```bat
installer\windows\start-shiksha-sarthi.bat
```

Open:

```text
http://localhost:6050
```

## LAN Access

Find the server IP.

Ubuntu:

```sh
hostname -I
```

Windows:

```bat
ipconfig
```

Ask teachers and students to open:

```text
http://<server-ip>:6050
```

All devices must be connected to the same local network.

## Health Check

```sh
./scripts/health-check.sh
```

Manual URLs:

```text
http://localhost:6050/health
http://localhost:6050/app/version
http://localhost:6050/app/status
```

## Backups

Create a backup:

```sh
./scripts/backup-local-school.sh
```

List backups:

```sh
curl -H "x-user-role: superadmin" http://localhost:6050/api/backup/list
```

Backups are stored in the Docker `backups_data` volume and mapped inside the app container at `/app/backend/backups`.

## Stop Or Restart

Stop:

```sh
./scripts/stop-local-school.sh
```

Restart:

```sh
./scripts/restart-local-school.sh
```

View logs:

```sh
./scripts/logs-local-school.sh
```

## What Works Offline

- Login and dashboards
- School, teacher, and student management
- Question practice
- Quizzes and reports
- Local media uploads
- Local uploaded media access
- Manual backups

## What Is Disabled Offline

- Gemini AI hint generation
- Cloudinary upload/sync
- AWS sync
- Auto-update
- Tailscale-specific access

If a teacher creates a question without a hint, the backend stores: `AI hints are unavailable in offline mode.`

## Phase 2 Later

Future phases can add AWS sync, central server publishing, update delivery, and optional remote access. Phase 1 intentionally keeps the school server independent and usable without internet.
