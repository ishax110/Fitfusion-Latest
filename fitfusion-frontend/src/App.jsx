import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute   from "@/components/ProtectedRoute";
import TrainerRoute     from "@/components/TrainerRoute";

import Index              from "@/pages/Index";
import Login              from "@/pages/Login";
import Register           from "@/pages/Register";
import Dashboard          from "@/pages/Dashboard";
import TrainerDashboard   from "@/pages/TrainerDashboard";
import Workouts           from "@/pages/Workouts";
import Nutrition          from "@/pages/Nutrition";
import AIRecommendations  from "@/pages/AIRecommendations";
import Profile            from "@/pages/Profile";
import VideoTracker       from "@/pages/VideoTracker";
import WorkoutGenerator   from "@/pages/WorkoutGenerator";
import WorkoutHistory     from "@/pages/WorkoutHistory";
import NotFound           from "@/pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"         element={<Index />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected — User */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/workouts" element={
          <ProtectedRoute><Workouts /></ProtectedRoute>
        } />
        <Route path="/nutrition" element={
          <ProtectedRoute><Nutrition /></ProtectedRoute>
        } />
        <Route path="/ai-recommendations" element={
          <ProtectedRoute><AIRecommendations /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="/track-video" element={
          <ProtectedRoute><VideoTracker /></ProtectedRoute>
        } />
        <Route path="/generate-workout" element={
          <ProtectedRoute><WorkoutGenerator /></ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute><WorkoutHistory /></ProtectedRoute>
        } />

        {/* Protected — Trainer only */}
        <Route path="/trainer" element={
          <TrainerRoute><TrainerDashboard /></TrainerRoute>
        } />

        {/* Legacy redirect */}
        <Route path="/recommendations" element={<Navigate to="/nutrition" replace />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
