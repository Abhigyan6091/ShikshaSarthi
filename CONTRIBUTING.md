# Contributing to ShikshaSarthi

Thank you for your interest in contributing to **ShikshaSarthi**! We welcome contributions from developers, educators, designers, and testers of all skill levels.

---

## 🌟 Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for everyone. Please be respectful, constructive, and supportive of all community members.

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js**: v18.x or v20.x ([Node.js Downloads](https://nodejs.org/))
- **MongoDB**: v6.x or higher (Local daemon or MongoDB Atlas)
- **Git**: Installed and configured

### 2. Fork and Clone
```bash
# Clone your fork
git clone https://github.com/<your-username>/ShikshaSarthi.git
cd ShikshaSarthi

# Add upstream remote
git remote add upstream https://github.com/Abhigyan6091/ShikshaSarthi.git
```

### 3. Install Dependencies
```bash
# Install root frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..
```

### 4. Setup Environment Variables
- Create `.env` in the root:
  ```env
  VITE_API_URL=http://localhost:5000
  ```
- Create `backend/.env`:
  ```env
  MONGO_URI=mongodb://127.0.0.1:27017/shikshasarthi
  PORT=5000
  JWT_SECRET=your_dev_jwt_secret_key_change_in_production
  ```

### 5. Start Development Servers
- **Windows**: Double-click `Start.bat` to launch MongoDB, backend, and frontend concurrently.
- **Manual**:
  ```bash
  # Terminal 1 - Backend
  cd backend && npm start

  # Terminal 2 - Frontend
  npm run dev
  ```

---

## 🌿 Branching & Git Workflow

1. Create a feature or fix branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```
2. Make atomic, well-tested commits following Conventional Commits format:
   - `feat: add new adaptive quiz question type`
   - `fix: resolve teacher analytics chart overflow`
   - `docs: update deployment instructions for local schools`
   - `chore: update dependencies and build scripts`

3. Sync with upstream `main` before submitting:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

4. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

5. Open a Pull Request on GitHub with a clear description and screenshots/recordings if applicable.

---

## 🧪 Code Quality & Testing

- Run the linter:
  ```bash
  npm run lint
  ```
- Verify frontend production build:
  ```bash
  npm run build
  ```
- Ensure backend JavaScript syntax validity:
  ```bash
  node -c backend/index.js
  ```

---

## 💡 Areas Where You Can Help

- 📚 **Question Bank Expansion**: Adding bilingual questions across Class 6–12 for Science, Maths, and Social Studies.
- 🎨 **UI/UX Polish**: Enhancing responsiveness, accessibility (a11y), and interactive components in Shadcn/Tailwind.
- ⚡ **Offline Performance**: Optimizing client-side caching, local storage, and media preloading.
- 🔄 **Sync & Edge Resilience**: Improving fault-tolerance during packet loss or intermittent school LAN disconnects.
