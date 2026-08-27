import { Navigate } from "react-router-dom";

function getRole() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[1])).role || null;
  } catch { return null; }
}

export default function TrainerRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  if (getRole() !== "TRAINER") return <Navigate to="/dashboard" replace />;
  return children;
}
