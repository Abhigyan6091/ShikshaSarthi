# ShikshaSarthi - NMMS Prep Platform

## Overview

ShikshaSarthi is a comprehensive educational platform designed for NMMS (National Means cum Merit Scholarship) exam preparation. The platform implements a complete role-based system with hierarchical user management.

## Project Info

**URL**: https://lovable.dev/projects/72247004-dddd-4e96-a82a-7bb4dca9503a

## User Roles

### 🔐 Four-Tier Role System

1. **Super Admin**
   - Manages all schools, school admins, teachers, and students
   - Full system access and question bank management
   - Dashboard: `/superadmin`

2. **School Admin**
   - Manages teachers and students within their school
   - School-level administration
   - Dashboard: `/schooladmin`

3. **Teacher**
   - Creates and manages classes (Class + Subject)
   - Manages student enrollment in classes
   - Creates quizzes and views analytics
   - Dashboard: `/teacher`

4. **Student**
   - Practices questions by subject/topic
   - Attempts quizzes and views reports
   - Dashboard: `/student`

## Quick Start

## Local School Server Deployment

Phase 1 supports running ShikshaSarthi as an offline-first school LAN server. AWS sync, Tailscale, Gemini, and Cloudinary are not required for this phase. Internet is optional after Docker images and dependencies are installed.

```sh
cp .env.local-school.example .env
docker compose up -d --build
```

Open the app on the server:

```text
http://localhost:6050
```

Teachers and students on the same LAN can open:

```text
http://<server-ip>:6050
```

In local-school mode, Gemini AI hints and Cloudinary uploads are disabled by default. Uploads, MongoDB data, backups, and audio cache are stored in Docker volumes so restarts do not delete school data.

Useful commands:

```sh
./scripts/health-check.sh
./scripts/backup-local-school.sh
./scripts/logs-local-school.sh
./scripts/stop-local-school.sh
```

See `docs/LOCAL_SCHOOL_DEPLOYMENT.md` for the full school IT guide and `docs/PHASE_1_RELEASE_CHECKLIST.md` for release testing.

### Prerequisites

- Node.js & npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- MongoDB database
- Gemini API key (optional; disabled by default in local-school mode)

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd ShikshaSarthi

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Set up environment variables
# Create .env in backend directory with:
# MONGO_URI=your_mongodb_connection_string
# PORT=5000
# GEMINI_API_KEY=your_gemini_api_key

# Create .env in root directory with:
# VITE_API_URL=/.
```

### Running the Application

```sh
# Start backend server (from backend directory)
npm start
# or with nodemon
npx nodemon index.js

# Start frontend dev server (from root directory)
npm run dev
```

### Initial Setup

After starting the backend, create the first super admin:

```sh
node create-superadmin.js
```

Default credentials:
- Username: `admin`
- Password: `admin123`

⚠️ **Change these credentials after first login!**

## Features

### 🎓 For Students
- Subject-wise practice (Math, Science, Social Science, Mental Ability)
- Vocabulary comprehension exercises
- Quiz attempts with instant scoring
- Detailed performance reports
- Hint system for difficult questions

### 👨‍🏫 For Teachers
- **Class Management**: Create classes (Class + Subject combinations)
- **Student Management**: Add/remove students from classes
- **Quiz Creation**: Design custom quizzes with question bank
- **Analytics**: View student performance and question difficulty
- **Custom Questions**: Add your own questions

### 🏫 For School Admins
- Register teachers and students for their school
- View all teachers in the school
- Monitor student enrollment by class
- School-level statistics

### 👑 For Super Admins
- Register schools, school admins, teachers, and students
- System-wide statistics and monitoring
- View all schools with teacher and student breakdowns
- Manage question bank
- Upload bulk questions

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **UI Library**: Shadcn/ui with Tailwind CSS
- **Backend**: Express.js + Node.js
- **Database**: MongoDB with Mongoose ODM
- **State Management**: React Context API
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **AI Integration**: Google Gemini API

## Project Structure

```
ShikshaSarthi/
├── backend/
│   ├── models/          # Database models
│   │   ├── SuperAdmin.js
│   │   ├── SchoolAdmin.js
│   │   ├── School.js
│   │   ├── Teacher.js
│   │   ├── Student.js
│   │   ├── Class.js
│   │   ├── Question.js
│   │   ├── Quiz.js
│   │   └── Report.js
│   ├── routes/          # API routes
│   │   ├── superadmin.js
│   │   ├── schooladmin.js
│   │   ├── class.js
│   │   ├── teacher.js
│   │   ├── student.js
│   │   ├── question.js
│   │   ├── quiz.js
│   │   └── report.js
│   └── index.js         # Backend entry point
├── src/
│   ├── components/      # Reusable components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── ui/         # Shadcn components
│   ├── pages/
│   │   ├── superadmin/ # Super admin pages
│   │   ├── schooladmin/# School admin pages
│   │   ├── teacher/    # Teacher pages
│   │   ├── student/    # Student pages
│   │   ├── Login.tsx   # Role-based login
│   │   └── Register.tsx# Role-based registration
│   └── contexts/       # React contexts
├── create-superadmin.js # Initial setup script
├── IMPLEMENTATION_GUIDE.md # Detailed implementation guide
└── README.md


## API Endpoints

### Authentication
- `POST /superadmin/login` - Super admin login
- `POST /schooladmin/login` - School admin login
- `POST /teachers/login` - Teacher login
- `POST /students/login` - Student login

### Super Admin
- `POST /superadmin/register/school` - Register school
- `POST /superadmin/register/schooladmin` - Register school admin
- `POST /superadmin/register/teacher` - Register teacher
- `POST /superadmin/register/student` - Register student
- `GET /superadmin/stats` - Get system statistics
- `GET /superadmin/schools` - Get all schools

### School Admin
- `POST /schooladmin/register/teacher` - Register teacher
- `POST /schooladmin/register/student` - Register student
- `GET /schooladmin/:username/stats` - Get school stats
- `GET /schooladmin/:username/teachers` - Get teachers
- `GET /schooladmin/:username/students` - Get students

### Teacher
- `POST /teachers/register/student` - Register student
- `GET /teachers/:teacherId/classes` - Get teacher's classes
- `POST /classes` - Create new class
- `POST /classes/:classId/students` - Add student to class

### Questions & Quizzes
- `GET /questions` - Get all questions
- `POST /questions` - Create question (with AI hint)
- `GET /questions/:class/:subject/:topic` - Get questions by topic
- `POST /quizzes` - Create quiz
- `GET /quizzes/:id` - Get quiz by ID

## Development

### Project built with Lovable

Visit [Lovable Project](https://lovable.dev/projects/72247004-dddd-4e96-a82a-7bb4dca9503a) to edit via prompts.

### Local Development

```sh
# Frontend
npm run dev

# Backend
cd backend
npm start
```

### Building for Production

```sh
npm run build
```

## Deployment

### Frontend
Simply open [Lovable](https://lovable.dev/projects/72247004-dddd-4e96-a82a-7bb4dca9503a) and click Share → Publish.

### Backend
The backend is configured for Vercel deployment with `backend/vercel.json`.

## Documentation

- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - Detailed implementation guide with workflows and examples
- **[API Documentation](#api-endpoints)** - Complete API reference above

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Built with ❤️ for NMMS aspirants**
### Phase 3 Update And Sync

Phase 3 adds guarded update staging/rollback and manual AWS sync export upload.

See [docs/PHASE_3_UPDATE_AND_SYNC.md](docs/PHASE_3_UPDATE_AND_SYNC.md).
