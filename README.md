# 🎓 ShikshaSarthi

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-Backend-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

**An offline-first, resilient school learning and assessment platform engineered for classrooms with intermittent or zero internet connectivity.**

[Features](#-key-features) • [Architecture](#-system-architecture) • [Deployment](#-deployment-options) • [Quickstart](#-local-development) • [API Routes](#-key-api-routes) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

**ShikshaSarthi** solves the digital divide in education by providing a comprehensive learning, testing, and grading platform that operates 100% locally on a school server. 

- ⚡ **Zero Cloud Dependency for Day-to-Day Learning**: Teachers build quizzes, students take adaptive tests, and administrators manage rosters completely on the school LAN.
- 🔄 **Bidirectional AWS Cloud Sync**: Whenever an internet connection is available, local records sync securely with AWS cloud for multi-school analytics, centralized question bank updates, and automated backups.
- 📦 **Atomic & Verified Updates**: Cloud updates are checksummed and cryptographically verified before installation, ensuring school data is never touched or corrupted.

---

## 🏛️ System Architecture

```mermaid
flowchart TB
    subgraph School_LAN ["🏫 Local School Network (Air-Gapped / Offline)"]
        direction TB
        subgraph School_Server ["School Server Instance"]
            Nginx["Nginx Reverse Proxy\n(:6050 / :6091)"]
            ReactApp["React 18 + Vite Frontend\n(Shadcn UI / Tailwind CSS)"]
            NodeAPI["Node.js / Express API\n(:5000)"]
            LocalDB[("Local MongoDB\n(:27017)")]
            SyncAgent["Local Sync & Media Manager"]

            Nginx --> ReactApp
            Nginx --> NodeAPI
            NodeAPI --> LocalDB
            NodeAPI --> SyncAgent
        end

        StudentDevices["📱 Student Tablets / PCs"] -->|Local WiFi / LAN| Nginx
        TeacherDevices["💻 Teacher Laptops"] -->|Local WiFi / LAN| Nginx
        AdminDevices["🖥️ Admin Console"] -->|Local WiFi / LAN| Nginx
    end

    subgraph AWS_Cloud ["☁️ Central AWS Cloud Hub (Optional Sync & Backups)"]
        CloudAPI["AWS API Gateway + Lambda"]
        CloudS3["Amazon S3\n(Media & Update Bundles)"]
        CloudDB[("Amazon DynamoDB\n(Central Store)")]

        CloudAPI --> CloudDB
        CloudAPI --> CloudS3
    end

    SyncAgent <-->|Periodic / On-Demand Sync\n(When Internet is Available)| CloudAPI
```

---

## 👥 Role-Based Access Control

| Role | Scope | Key Capabilities |
|---|---|---|
| **Super Admin** | Platform-Wide | Registers schools & initial School Admins, triggers cloud sync, deploys verified app updates. |
| **School Admin** | School-Level | Enrols/manages teacher and student accounts, monitors school-wide participation and feedback. |
| **Teacher** | Classroom | Creates classes, generates custom or bank-backed quizzes, monitors real-time quiz analytics and student progress. |
| **Student** | Learner | Solves interactive quizzes, takes adaptive difficulty assessments, explores multimedia modules (MAT, audio, puzzles, simulations). |

---

## ✨ Key Features

### 🎓 For Students
- **Adaptive Assessments**: Algorithmic tests that dynamically adjust difficulty based on student performance.
- **Multimodal Learning**: Mental Ability Tests (MAT), Audio/Video quizzes, interactive science simulation experiments, and puzzle modules (*Gyan Ki Yatra*, *Memory Match*).
- **Instant Offline Scoring**: Comprehensive report cards and question reviews available immediately without an internet connection.

### 👩‍🏫 For Teachers
- **Interactive Quiz Builder**: Drag-and-drop quiz creation with rich-text math formulas (KaTeX), audio questions, and video questions.
- **In-Depth Class Analytics**: Performance distributions, accuracy charts, per-question analysis, and individual student progress tracking.
- **Classroom Hub**: Digital announcements, student roster administration, and resource sharing.

### 🏢 For School & Super Administrators
- **Full Operational Autonomy**: Complete platform management behind an institutional firewall.
- **Seamless Cloud Backup**: Automated single-click snapshots to AWS S3.
- **Granular Update Control**: Super Admins preview changelogs, inspect checksums, and approve version upgrades safely.

---

## 🚀 Deployment Options

### 🐳 1. Local School Server (Docker - Recommended)

Ideal for production deployments in school labs and server PCs:

```bash
# Copy local school environment configuration
cp .env.local-school.example .env

# Launch application stack and MongoDB
docker compose up -d --build
```

- **Access locally**: `http://localhost:6050`
- **Access across school LAN**: `http://<SERVER_IP>:6050`

#### Useful School Management Commands:
```bash
./scripts/health-check.sh        # Verify container and database health
./scripts/backup-local-school.sh # Generate an encrypted offline backup
./scripts/restart-local-school.sh# Gracefully restart school services
./scripts/stop-local-school.sh   # Stop local school services
```

---

### 💻 2. Local Development Setup

#### Prerequisites
- **Node.js**: v18+ or v20+
- **MongoDB**: v6+ (Local service or MongoDB Atlas)
- **Git**

#### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Abhigyan6091/ShikshaSarthi.git
   cd ShikshaSarthi
   ```

2. **Install Dependencies**:
   ```bash
   # Install Frontend dependencies
   npm install

   # Install Backend dependencies
   cd backend && npm install && cd ..
   ```

3. **Configure Environment Variables**:
   - In `backend/.env`:
     ```env
     MONGO_URI=mongodb://127.0.0.1:27017/shikshasarthi
     PORT=5000
     JWT_SECRET=your_development_secret_key
     ```
   - In root `.env`:
     ```env
     VITE_API_URL=http://localhost:5000
     ```

4. **Run Development Servers**:
   - **Quick Start (Windows)**: Run `Start.bat` to launch MongoDB, backend, and frontend concurrently.
   - **Manual Start**:
     ```bash
     # Terminal 1: Backend
     cd backend && npm start

     # Terminal 2: Frontend
     npm run dev
     ```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Shadcn UI, Lucide Icons, Recharts, KaTeX |
| **Backend API** | Node.js, Express.js, Mongoose ODM, JWT Authentication |
| **Database** | MongoDB (Edge instance per school) |
| **Cloud Bridge** | AWS Lambda, Amazon API Gateway, Amazon DynamoDB, Amazon S3 |
| **Containerization** | Docker, Docker Compose, Nginx |

---

## 📡 Key API Routes

### 🔐 Authentication
- `POST /superadmin/login` — Super Admin authentication
- `POST /schooladmin/login` — School Administrator login
- `POST /teachers/login` — Teacher login
- `POST /students/login` — Student authentication

### 📚 Classes & Question Banks
- `GET /questions` — Query centralized or local question banks
- `POST /questions` — Author new questions
- `POST /quizzes` — Create targeted assessments
- `POST /classes` — Provision class rosters

### 🔄 Sync & Maintenance
- `GET /sync/status` — Inspect current sync health and pending queues
- `POST /sync/run` — Manually trigger bidirectional cloud sync
- `GET /api/updates/manifest` — Verify remote version release updates

---

## 📚 Documentation

Detailed documentation is available in the [`docs/`](docs/) directory:
- [🏫 Local School Deployment Guide](docs/LOCAL_SCHOOL_DEPLOYMENT.md)
- [🔄 Phase 3 Update & Sync Specification](docs/PHASE_3_UPDATE_AND_SYNC.md)
- [📋 Phase 1 Release Checklist](docs/PHASE_1_RELEASE_CHECKLIST.md)
- [☁️ AWS Infrastructure Setup](docs/PHASE_2_AWS_SETUP.md)
- [🪟 Windows Installer Workflow](docs/PHASE_2_WINDOWS_INSTALLER.md)

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, branching model, and pull request submission process.

---

## 💬 Support & Contact

For issues, questions, bug reports, or contributions, please open an issue on [GitHub Issues](https://github.com/Abhigyan6091/ShikshaSarthi/issues) or contact the maintainers directly.

---

## 🔒 Security

For security vulnerabilities and disclosure instructions, please refer to [SECURITY.md](SECURITY.md).

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
