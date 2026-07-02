import React, { useEffect, useState } from "react";
import axios from "axios";
import { Wifi, WifiOff } from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL;
export default function LoginStudent() {
  const [id, setid] = useState("");
  const [password, setPassword] = useState("");
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return true;
    }
    return window.navigator.onLine;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  function changeid(e) {
    setid(e.target.value);
  }

  function changepassword(e) {
    setPassword(e.target.value);
  }

  async function handlesubmit() {
    console.log(id);
    console.log(password);

    const url = `${API_URL}/students/login`;
    const payload = {
      studentId: id,
      password: password,
    };

    try {
      const response = await axios.post(url, payload);
      const json_data = JSON.stringify(response.data);

      // ✅ Save to localStorage instead of cookie
      localStorage.setItem("Login_student", json_data);

      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);
      }

      // ✅ Retrieve and print
      const storedData = localStorage.getItem("Login_student");
      console.log("Retrieved from localStorage:", storedData);
    } catch (err) {
      console.error("Login failed", err);
    }
  }

  return (
    <div>
      <div className="fixed top-4 right-4 z-10">
        <div
          className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium shadow-sm ${
            isOnline ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
          }`}
          title={isOnline ? "Online" : "Offline"}
        >
          {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          <span>{isOnline ? "Online" : "Offline"}</span>
        </div>
      </div>
      <div>Enter student id</div>
      <input value={id} onChange={changeid} />

      <div>Enter password</div>
      <input type="password" value={password} onChange={changepassword} />

      <div
        onClick={handlesubmit}
        style={{ cursor: "pointer", marginTop: "10px", color: "blue" }}
      >
        Submit
      </div>
    </div>
  );
}
