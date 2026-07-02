import axios from 'axios';

// Attaches the logged-in user's session token (set by Login.tsx / LoginStudent.tsx
// on successful login) to every outgoing axios request, app-wide. The backend
// only enforces this for a handful of admin-sensitive routes (update/aws/backup);
// other routes ignore the header if present, so this is safe to send everywhere.
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
