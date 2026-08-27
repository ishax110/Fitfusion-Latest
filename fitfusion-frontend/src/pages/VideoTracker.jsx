import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Spinner } from "@/components/ui/Spinner";
import Navbar from "@/components/Navbar";
import {
  Video, Upload, Play, Check, TrendingUp, Target,
  Clock, BarChart2, RefreshCw, X, StopCircle, Camera,
  ChevronRight, Award, Zap, AlertTriangle, History
} from "lucide-react";
import api from "@/services/api";

/* ════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════ */

const EXERCISES = [
  { key: "squat",          label: "Squat",          icon: "🦵", instructions: "Stand hip-width apart. Squat until thighs are parallel. Keep chest up." },
  { key: "pushup",         label: "Push-up",         icon: "💪", instructions: "Face sideways to camera. Keep body straight. Lower chest to ground." },
  { key: "bicep_curl",     label: "Bicep Curl",      icon: "🏋️", instructions: "Stand sideways. Keep elbow pinned to side. Curl all the way up and down." },
  { key: "lunge",          label: "Lunge",           icon: "🚶", instructions: "Step forward, lower back knee toward floor. Keep torso upright." },
  { key: "shoulder_press", label: "Shoulder Press",  icon: "🙌", instructions: "Face camera. Press dumbbells overhead until arms lock out. Keep core tight." },
  { key: "plank",          label: "Plank (holds)",   icon: "🧘", instructions: "Face sideways. Hold straight body line. Each 10 frames = 1 hold second." },
];

const PROG_META = {
  INCREASE: { icon: "📈", label: "Increase Difficulty", cls: "border-green-500/30 bg-green-500/5",   color: "text-green-400",  btn: "bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20" },
  MAINTAIN: { icon: "⚖️", label: "Maintain Level",      cls: "border-primary/30 bg-primary/5",      color: "text-primary",    btn: "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20" },
  DECREASE: { icon: "📉", label: "Reduce Difficulty",   cls: "border-yellow-500/30 bg-yellow-500/5", color: "text-yellow-400", btn: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20" },
};

function gradeScore(s) {
  if (s >= 85) return { label: "Excellent Form!", emoji: "🏆", ring: "border-green-500/50",  num: "text-green-400",  bar: "from-green-500 to-green-400" };
  if (s >= 65) return { label: "Good Work!",      emoji: "👍", ring: "border-primary/50",    num: "text-primary",    bar: "from-primary to-primary/60"   };
  return              { label: "Needs Work",      emoji: "💪", ring: "border-yellow-500/50", num: "text-yellow-400", bar: "from-yellow-500 to-yellow-400" };
}

function fmtSize(b) {
  return b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;
}

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

/* ════════════════════════════════════════════════
   BROWSER-SIDE POSE ANALYSIS HELPERS
   (mirrors fitness_app/templates/monitor.html logic)
═══════════════════════════════════════════════════ */

function getAngle(a, b, c) {
  const rad = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(rad * 180 / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

function smooth(val, buf, maxLen = 5) {
  buf.push(val);
  if (buf.length > maxLen) buf.shift();
  return buf.reduce((a, b) => a + b, 0) / buf.length;
}

function vis(lm, ...indices) {
  return indices.every(i => lm[i] && (lm[i].visibility === undefined || lm[i].visibility > 0.45));
}

function analyzeFrame(lm, exercise, state) {
  /* Returns { repCounted, formScore, phase, feedback } */
  let repCounted = false;
  let formScore  = 100;
  let phase      = state.phase || "START";
  let feedback   = [];
  const HOLD = 2; // frames to hold a position before counting

  switch (exercise) {

    case "pushup": {
      if (!vis(lm, 11, 13, 15)) break;
      const ea = smooth(getAngle(lm[11], lm[13], lm[15]), state.ebuf = state.ebuf || []);
      const ba = vis(lm, 11, 23, 25) ? getAngle(lm[11], lm[23], lm[25]) : null;

      if (!state.down && ea < 95) {
        state.df = (state.df || 0) + 1;
        if (state.df >= HOLD) { state.down = true; state.df = 0; state.uf = 0; phase = "PUSH UP ↑"; }
      } else if (state.down && ea > 155) {
        state.uf = (state.uf || 0) + 1;
        if (state.uf >= HOLD) { state.down = false; state.uf = 0; repCounted = true; phase = "GO DOWN ↓"; }
      } else {
        if (!state.down) phase = "GO DOWN ↓";
        state.df = Math.max(0, (state.df || 0) - 1);
      }

      if (ea < 95) feedback.push({ text: `Good depth — elbow ${Math.round(ea)}°`, type: "good" });
      else if (ea < 130) feedback.push({ text: `Go lower — elbow ${Math.round(ea)}°`, type: "warn" });
      else feedback.push({ text: "Lower chest to ground", type: "warn" });

      if (ba !== null) {
        if (ba > 155) feedback.push({ text: "Body straight ✓", type: "good" });
        else if (ba > 130) feedback.push({ text: "Raise hips — tighten core", type: "warn" });
        else feedback.push({ text: "Hips too low", type: "error" });
      }

      formScore = Math.max(0, Math.min(100,
        (ea < 95 ? 50 : ea < 130 ? 25 : 0) +
        (ba !== null ? (ba > 155 ? 50 : ba > 130 ? 25 : 0) : 50)
      ));
      break;
    }

    case "squat": {
      const uL = vis(lm, 23, 25, 27), uR = vis(lm, 24, 26, 28);
      if (!uL && !uR) break;
      const kaL = uL ? getAngle(lm[23], lm[25], lm[27]) : null;
      const kaR = uR ? getAngle(lm[24], lm[26], lm[28]) : null;
      const ka = smooth(
        kaL !== null && kaR !== null ? (kaL + kaR) / 2 : kaL ?? kaR,
        state.kbuf = state.kbuf || []
      );
      const ta = vis(lm, 11, 23) ?
        Math.abs(Math.atan2(lm[23].x - lm[11].x, lm[23].y - lm[11].y) * 180 / Math.PI) : null;

      if (!state.down && ka < 100) {
        state.df = (state.df || 0) + 1;
        if (state.df >= HOLD) { state.down = true; state.df = 0; state.uf = 0; phase = "STAND UP ↑"; }
      } else if (state.down && ka > 155) {
        state.uf = (state.uf || 0) + 1;
        if (state.uf >= HOLD) { state.down = false; state.uf = 0; repCounted = true; phase = "SQUAT DOWN ↓"; }
      } else {
        if (!state.down) phase = "SQUAT DOWN ↓";
        state.df = Math.max(0, (state.df || 0) - 1);
      }

      if (ka < 100) feedback.push({ text: `Parallel depth ✓ (${Math.round(ka)}°)`, type: "good" });
      else if (ka < 130) feedback.push({ text: `Go deeper (${Math.round(ka)}°)`, type: "warn" });
      else feedback.push({ text: "Bend knees and sit back", type: "warn" });

      if (ta !== null) {
        if (ta < 30) feedback.push({ text: "Torso upright ✓", type: "good" });
        else feedback.push({ text: "Lean chest forward less", type: "warn" });
      }

      formScore = Math.max(0, Math.min(100,
        (ka < 100 ? 60 : ka < 130 ? 30 : 0) +
        (ta !== null ? (ta < 30 ? 40 : 20) : 40)
      ));
      break;
    }

    case "bicep_curl": {
      const uR = vis(lm, 12, 14, 16), uL = vis(lm, 11, 13, 15);
      if (!uR && !uL) break;
      const s = uR ? lm[12] : lm[11];
      const e = uR ? lm[14] : lm[13];
      const w = uR ? lm[16] : lm[15];
      const ea = smooth(getAngle(s, e, w), state.ebuf = state.ebuf || []);

      if (!state.down && ea > 155) {
        state.df = (state.df || 0) + 1;
        if (state.df >= HOLD) { state.down = true; state.df = 0; state.uf = 0; phase = "CURL UP ↑"; }
      } else if (state.down && ea < 45) {
        state.uf = (state.uf || 0) + 1;
        if (state.uf >= HOLD) { state.down = false; state.uf = 0; repCounted = true; phase = "LOWER DOWN ↓"; }
      }

      if (ea < 45) feedback.push({ text: `Full curl ✓ (${Math.round(ea)}°)`, type: "good" });
      else if (ea < 90) feedback.push({ text: `Curl higher (${Math.round(ea)}°)`, type: "warn" });
      else feedback.push({ text: "Keep elbow still and curl up", type: "warn" });

      const drift = Math.abs(e.x - s.x);
      if (drift < 0.08) feedback.push({ text: "Elbow fixed ✓", type: "good" });
      else feedback.push({ text: "Keep elbow pinned to side", type: "warn" });

      formScore = ea < 45 ? 90 : ea < 90 ? 60 : 30;
      break;
    }

    case "lunge": {
      const uL = vis(lm, 23, 25, 27), uR = vis(lm, 24, 26, 28);
      if (!uL && !uR) break;
      const kaL = uL ? getAngle(lm[23], lm[25], lm[27]) : null;
      const kaR = uR ? getAngle(lm[24], lm[26], lm[28]) : null;
      const ka = Math.min(kaL ?? 999, kaR ?? 999);
      const sKa = smooth(ka === 999 ? 170 : ka, state.kbuf = state.kbuf || []);

      if (!state.down && sKa < 100) {
        state.df = (state.df || 0) + 1;
        if (state.df >= HOLD) { state.down = true; state.df = 0; state.uf = 0; phase = "STAND UP ↑"; }
      } else if (state.down && sKa > 155) {
        state.uf = (state.uf || 0) + 1;
        if (state.uf >= HOLD) { state.down = false; state.uf = 0; repCounted = true; phase = "LUNGE DOWN ↓"; }
      } else {
        if (!state.down) phase = "LUNGE DOWN ↓";
        state.df = Math.max(0, (state.df || 0) - 1);
      }

      if (sKa < 100) feedback.push({ text: `Good depth ✓ (${Math.round(sKa)}°)`, type: "good" });
      else feedback.push({ text: "Step forward and lower more", type: "warn" });

      formScore = sKa < 100 ? 90 : sKa < 130 ? 60 : 30;
      break;
    }

    case "shoulder_press": {
      const uL = vis(lm, 11, 13, 15), uR = vis(lm, 12, 14, 16);
      if (!uL && !uR) break;
      const sL = uL ? lm[11] : null, eL = uL ? lm[13] : null, wL = uL ? lm[15] : null;
      const sR = uR ? lm[12] : null, eR = uR ? lm[14] : null, wR = uR ? lm[16] : null;
      const eal = uL ? getAngle(sL, eL, wL) : null;
      const ear = uR ? getAngle(sR, eR, wR) : null;
      const ea = smooth(eal !== null && ear !== null ? (eal + ear) / 2 : eal ?? ear ?? 90, state.ebuf = state.ebuf || []);

      if (!state.down && ea < 90) {
        state.df = (state.df || 0) + 1;
        if (state.df >= HOLD) { state.down = true; state.df = 0; state.uf = 0; phase = "PRESS UP ↑"; }
      } else if (state.down && ea > 155) {
        state.uf = (state.uf || 0) + 1;
        if (state.uf >= HOLD) { state.down = false; state.uf = 0; repCounted = true; phase = "LOWER DOWN ↓"; }
      }

      if (ea > 155) feedback.push({ text: "Full lockout ✓", type: "good" });
      else if (ea > 130) feedback.push({ text: `Press higher (${Math.round(ea)}°)`, type: "warn" });
      else feedback.push({ text: "Press arms all the way up", type: "warn" });

      formScore = ea > 155 ? 90 : ea > 130 ? 60 : 35;
      break;
    }

    case "plank": {
      if (!vis(lm, 11, 23, 27)) break;
      const ba = getAngle(lm[11], lm[23], lm[27]);
      const dev = Math.abs(180 - ba);
      state.frameCount = (state.frameCount || 0) + 1;

      phase = "HOLD ✓";
      if (state.frameCount % 10 === 0) {
        repCounted = true; // each 10 frames = 1 hold second
      }

      if (dev < 6)  feedback.push({ text: "Perfect alignment ✓", type: "good" });
      else if (dev < 15) feedback.push({ text: "Keep body straighter", type: "warn" });
      else if (ba > 180) feedback.push({ text: "Lower hips — avoid piking", type: "error" });
      else feedback.push({ text: "Raise hips — body sagging", type: "error" });

      formScore = Math.max(0, 100 - dev * 4);
      break;
    }

    default:
      break;
  }

  state.phase = phase;
  return { repCounted, formScore: Math.round(formScore), phase, feedback };
}

/* ════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════ */

export default function VideoTracker() {
  const [params]  = useSearchParams();
  const navigate  = useNavigate();

  /* ── Shared state ── */
  const [activeTab,  setActiveTab]  = useState("live");   // "live" | "upload"
  const [exercise,   setExercise]   = useState(params.get("exercise") || "squat");
  const [targetReps, setTargetReps] = useState(parseInt(params.get("reps") || "10"));

  /* ── Live camera state ── */
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError,  setCameraError]  = useState("");
  const [liveReps,     setLiveReps]     = useState(0);
  const [liveCorrect,  setLiveCorrect]  = useState(0);
  const [liveScore,    setLiveScore]    = useState(0);
  const [livePhase,    setLivePhase]    = useState("START");
  const [liveFeedback, setLiveFeedback] = useState([]);
  const [liveTimer,    setLiveTimer]    = useState(0);
  const [liveScoreHistory, setLiveScoreHistory] = useState([]);
  const [sessionDone,  setSessionDone]  = useState(false);

  /* ── Upload state ── */
  const [file,       setFile]       = useState(null);
  const [drag,       setDrag]       = useState(false);
  const [analysing,  setAnalysing]  = useState(false);
  const [uploadCancelled, setUploadCancelled] = useState(false);
  const [results,    setResults]    = useState(null);
  const [uploadError, setUploadError] = useState("");

  /* ── Save state (shared) ── */
  const [saving,    setSaving]   = useState(false);
  const [saved,     setSaved]    = useState(null);
  const [saveErr,   setSaveErr]  = useState("");

  /* ── Refs ── */
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const fileRef     = useRef(null);
  const poseRef     = useRef(null);
  const cameraObjRef = useRef(null);
  const timerRef    = useRef(null);
  const stateRef    = useRef({});       // mutable pose analysis state (no re-render)
  const scoresRef   = useRef([]);       // rolling form score history
  const repsRef     = useRef(0);
  const correctRef  = useRef(0);
  const abortRef    = useRef(null);     // AbortController for upload cancellation

  const exInfo = EXERCISES.find(e => e.key === exercise) || EXERCISES[0];

  /* ── Stop live session ── */
  const stopLive = useCallback(() => {
    if (cameraObjRef.current) { cameraObjRef.current.stop(); cameraObjRef.current = null; }
    if (poseRef.current)       { poseRef.current.close?.(); poseRef.current = null; }
    if (timerRef.current)      { clearInterval(timerRef.current); timerRef.current = null; }
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setSessionDone(true);
  }, []);

  /* ── Start live camera with browser-side MediaPipe ── */
  const startCamera = useCallback(async () => {
    setCameraError("");
    setLiveReps(0); setLiveCorrect(0); setLiveScore(0);
    setLivePhase("START"); setLiveFeedback([]); setLiveTimer(0);
    setLiveScoreHistory([]); setSessionDone(false); setSaved(null); setSaveErr("");
    stateRef.current = {}; scoresRef.current = []; repsRef.current = 0; correctRef.current = 0;

    try {
      /* Dynamically import to avoid SSR / bundler issues */
      const { Pose }    = await import("@mediapipe/pose");
      const { Camera }  = await import("@mediapipe/camera_utils");
      const { drawConnectors, drawLandmarks } = await import("@mediapipe/drawing_utils");

      const POSE_CONNECTIONS = (await import("@mediapipe/pose")).POSE_CONNECTIONS;

      const pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`,
      });
      pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });

      pose.onResults((results) => {
        const canvas = canvasRef.current;
        const video  = videoRef.current;
        if (!canvas || !video) return;

        const ctx = canvas.getContext("2d");
        canvas.width  = video.videoWidth  || 640;
        canvas.height = video.videoHeight || 480;

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

        if (results.poseLandmarks) {
          drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, { color: "rgba(0,255,200,0.6)", lineWidth: 2 });
          drawLandmarks(ctx, results.poseLandmarks, { color: "rgba(0,255,200,0.9)", lineWidth: 1, radius: 3 });

          const analysis = analyzeFrame(results.poseLandmarks, exercise, stateRef.current);

          if (analysis.repCounted) {
            repsRef.current += 1;
            const avg = scoresRef.current.length > 0
              ? scoresRef.current.reduce((a, b) => a + b, 0) / scoresRef.current.length
              : analysis.formScore;
            if (avg >= 70) correctRef.current += 1;

            /* Flash +1 overlay */
            ctx.fillStyle = "rgba(0,255,200,0.15)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "hsl(173,80%,50%)";
            ctx.font = "bold 96px Space Grotesk, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("+1", canvas.width / 2, canvas.height / 2);
          }

          scoresRef.current.push(analysis.formScore);
          if (scoresRef.current.length > 10) scoresRef.current.shift();
          const rollingAvg = Math.round(scoresRef.current.reduce((a, b) => a + b, 0) / scoresRef.current.length);

          setLiveReps(repsRef.current);
          setLiveCorrect(correctRef.current);
          setLiveScore(rollingAvg);
          setLivePhase(analysis.phase);
          setLiveFeedback(analysis.feedback);
          setLiveScoreHistory(prev => [...prev.slice(-19), rollingAvg]);

          /* Auto-stop when target reached */
          if (repsRef.current >= targetReps) {
            stopLive();
          }
        }
        ctx.restore();
      });

      poseRef.current = pose;

      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: "user" } });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      const cam = new Camera(videoRef.current, {
        onFrame: async () => { if (poseRef.current) await poseRef.current.send({ image: videoRef.current }); },
        width: 640, height: 480,
      });
      cam.start();
      cameraObjRef.current = cam;
      setCameraActive(true);

      /* Timer */
      timerRef.current = setInterval(() => setLiveTimer(t => t + 1), 1000);

    } catch (err) {
      if (err.name === "NotAllowedError") {
        setCameraError("Camera permission denied. Please allow camera access and try again.");
      } else {
        setCameraError(`Could not start camera: ${err.message}`);
      }
    }
  }, [exercise, targetReps, stopLive]);

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      stopLive();
      if (abortRef.current) abortRef.current.abort();
    };
  }, [stopLive]);

  /* Reset live state when exercise changes */
  useEffect(() => {
    if (cameraActive) stopLive();
  }, [exercise]); // eslint-disable-line

  /* ── Upload analysis ── */
  const pick   = f  => { setFile(f); setResults(null); setSaved(null); setUploadError(""); setUploadCancelled(false); };
  const remove = () => { setFile(null); setResults(null); setSaved(null); if (fileRef.current) fileRef.current.value = ""; };

  const cancelUpload = () => {
    if (abortRef.current) abortRef.current.abort();
    setAnalysing(false); setUploadCancelled(true);
  };

  const analyseUpload = async () => {
    if (!file) return;
    setUploadError(""); setResults(null); setSaved(null); setSaveErr(""); setUploadCancelled(false); setAnalysing(true);
    abortRef.current = new AbortController();

    const fd = new FormData();
    fd.append("exercise", exercise);
    fd.append("target_reps", String(targetReps));
    fd.append("video", file);

    try {
      const r = await api.post("/api/workouts/track-video", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 300000,
        signal:  abortRef.current.signal,
      });
      setResults(r.data);
    } catch (err) {
      if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
        setUploadCancelled(true);
      } else {
        setUploadError(
          err.response?.data?.message ||
          err.response?.data?.detail  ||
          err.message ||
          "Analysis failed. Make sure all services are running (ports 8000, 8001, 8080)."
        );
      }
    } finally { setAnalysing(false); }
  };

  /* ── Save session (used by both live + upload) ── */
  const saveSession = useCallback(async ({
    completedReps, correctReps, avgFormScore, completionRate, durationSeconds
  }) => {
    setSaving(true); setSaveErr("");
    try {
      const r = await api.post("/api/sessions", {
        exercise,
        targetReps,
        completedReps,
        correctReps,
        averageFormScore:       avgFormScore,
        completionRate,
        workoutDurationSeconds: durationSeconds,
      });
      setSaved(r.data);
    } catch (err) {
      setSaveErr(err.response?.data?.message || "Could not save session. Please try again.");
    } finally { setSaving(false); }
  }, [exercise, targetReps]);

  /* ── Build live session summary ── */
  const liveSummaryData = {
    completedReps:  liveReps,
    correctReps:    liveCorrect,
    avgFormScore:   liveScore,
    completionRate: Math.min(Math.round((liveReps / Math.max(targetReps, 1)) * 100), 100),
    durationSeconds: liveTimer,
  };

  /* ── Build upload session summary ── */
  const uploadSummaryData = results ? {
    completedReps:  results.completed_reps,
    correctReps:    results.correct_reps,
    avgFormScore:   results.average_form_score,
    completionRate: results.completion_rate,
    durationSeconds: results.workout_duration_s,
  } : null;

  const showSaveSection = (sessionDone && !saved) || (results && !saved);
  const summaryData     = sessionDone ? liveSummaryData : uploadSummaryData;
  const scoreForGrade   = summaryData?.avgFormScore ?? 0;
  const g               = gradeScore(scoreForGrade);
  const p               = saved ? (PROG_META[saved.progressionAction] || PROG_META.MAINTAIN) : null;

  /* ════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen hero-gradient">
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-5xl">

          {/* ── Page header ── */}
          <div className="mb-6 animate-fade-in flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Video className="h-6 w-6 text-primary" />
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold">Workout Tracker</h1>
              </div>
              <p className="text-muted-foreground">
                Live camera analysis or upload a video — both count reps, score form, and log to your history.
              </p>
            </div>
            <Link to="/history">
              <Button variant="glass" size="sm" className="gap-2">
                <History className="h-4 w-4" /> View History
              </Button>
            </Link>
          </div>

          {/* ── Exercise selector ── */}
          <Card className="card-gradient border-border/50 mb-6 animate-fade-in">
            <CardContent className="p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Select Exercise
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {EXERCISES.map(ex => (
                  <button key={ex.key}
                    onClick={() => { setExercise(ex.key); setResults(null); setSaved(null); setSessionDone(false); }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                      ${exercise === ex.key
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}>
                    {ex.icon} {ex.label}
                  </button>
                ))}
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">{exInfo.instructions}</p>
              </div>
            </CardContent>
          </Card>

          {/* ── Target reps ── */}
          <div className="mb-6 animate-fade-in flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Label className="text-sm font-semibold whitespace-nowrap">Target Reps:</Label>
              <Input type="number" min={1} max={200} value={targetReps}
                     onChange={e => setTargetReps(Math.max(1, parseInt(e.target.value) || 1))}
                     className="w-24 h-9 text-center font-bold text-lg" />
            </div>
            <p className="text-xs text-muted-foreground">
              The session ends automatically when you hit your target.
            </p>
          </div>

          {/* ── Mode tabs ── */}
          <div className="flex gap-2 mb-6">
            {[
              { id: "live", icon: Camera, label: "Live Camera" },
              { id: "upload", icon: Upload, label: "Upload Video" },
            ].map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all
                  ${activeTab === id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/50"}`}>
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>

          {/* ═══════════════════════════
              LIVE CAMERA TAB
          ════════════════════════════ */}
          {activeTab === "live" && (
            <div className="space-y-5 animate-fade-in">
              {cameraError && <Alert type="error">{cameraError}</Alert>}

              <div className="grid lg:grid-cols-[1fr_300px] gap-5">

                {/* Camera + canvas */}
                <div>
                  <div className="relative bg-secondary/30 rounded-2xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
                    <video ref={videoRef} className="w-full h-full object-cover" style={{ transform: "scaleX(-1)", display: cameraActive ? "block" : "none" }} autoPlay muted playsInline />
                    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ transform: "scaleX(-1)" }} />

                    {/* Overlay when not started */}
                    {!cameraActive && !sessionDone && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/80 text-center p-8">
                        <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-4xl mb-4">📷</div>
                        <h3 className="font-display font-bold text-xl mb-2">Ready to Track</h3>
                        <p className="text-sm text-muted-foreground max-w-xs mb-6">
                          Allow camera access and position your full body in frame. Stand 6–8 feet from the camera.
                        </p>
                        <Button variant="hero" className="gap-2" onClick={startCamera}>
                          <Camera className="h-4 w-4" /> Start Camera
                        </Button>
                      </div>
                    )}

                    {/* Session done overlay */}
                    {sessionDone && !saved && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/90 text-center p-8">
                        <div className="text-6xl mb-3">🎉</div>
                        <h3 className={`font-display font-bold text-2xl mb-2 ${g.num}`}>{g.emoji} Session Complete!</h3>
                        <p className="text-muted-foreground text-sm mb-1">{liveReps} reps · {liveCorrect} good form · {Math.round(liveScore)}% avg score</p>
                        <Button variant="ghost" size="sm" className="mt-4 text-muted-foreground" onClick={() => { setSessionDone(false); stateRef.current = {}; scoresRef.current = []; repsRef.current = 0; correctRef.current = 0; setLiveReps(0); setLiveCorrect(0); setLiveScore(0); setLiveTimer(0); }}>
                          <RefreshCw className="h-4 w-4 mr-2" /> Redo
                        </Button>
                      </div>
                    )}

                    {/* Phase badge (top overlay while active) */}
                    {cameraActive && (
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-primary/90 text-primary-foreground">
                          {livePhase}
                        </span>
                      </div>
                    )}

                    {/* Stop button (bottom overlay while active) */}
                    {cameraActive && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                        <Button variant="destructive" size="sm" className="gap-2 backdrop-blur-md" onClick={stopLive}>
                          <StopCircle className="h-4 w-4" /> End Session
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Form score bar */}
                  {(cameraActive || sessionDone) && (
                    <div className="mt-3 p-3 rounded-xl bg-secondary/40 border border-border/50">
                      <div className="flex justify-between items-center mb-2 text-xs font-semibold">
                        <span className="text-muted-foreground uppercase tracking-wider">Form Quality</span>
                        <span className={g.num}>{liveScore}%</span>
                      </div>
                      <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${g.bar} transition-all duration-300`}
                             style={{ width: `${liveScore}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Live feedback */}
                  {(cameraActive || sessionDone) && liveFeedback.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {liveFeedback.slice(0, 3).map((f, i) => (
                        <div key={i}
                             className={`flex items-start gap-2 px-3 py-2 rounded-lg text-xs font-medium
                               ${f.type === "good"  ? "bg-green-500/10 border border-green-500/20 text-green-400"
                               : f.type === "error" ? "bg-red-500/10 border border-red-500/20 text-red-400"
                               : "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"}`}>
                          <span>{f.type === "good" ? "✅" : f.type === "error" ? "❌" : "⚠️"}</span>
                          <span>{f.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right panel — live stats */}
                <div className="flex flex-col gap-4">
                  {/* Rep counter */}
                  <Card className="card-gradient border-primary/20 text-center">
                    <CardContent className="p-5">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                        {exercise === "plank" ? "HOLD SECONDS" : "REPS"}
                      </p>
                      <p className="font-display text-7xl font-black text-primary leading-none my-2">
                        {liveReps}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        of <strong className="text-foreground">{targetReps}</strong> target
                      </p>
                      {/* Mini progress ring */}
                      <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-300"
                             style={{ width: `${Math.min((liveReps / targetReps) * 100, 100)}%` }} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Session stats grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Clock,   label: "Time",       val: fmtTime(liveTimer), color: "text-accent" },
                      { icon: Award,   label: "Good Reps",  val: liveCorrect,        color: "text-green-400" },
                      { icon: Target,  label: "Avg Score",  val: `${liveScore}%`,    color: "text-primary" },
                      { icon: Zap,     label: "Completion", val: `${Math.min(Math.round((liveReps/Math.max(targetReps,1))*100),100)}%`, color: "text-accent" },
                    ].map(({ icon: Icon, label, val, color }) => (
                      <div key={label} className="glass-card rounded-xl p-3 text-center">
                        <Icon className={`h-4 w-4 ${color} mx-auto mb-1`} />
                        <p className={`font-display text-lg font-bold ${color}`}>{val}</p>
                        <p className="text-xs text-muted-foreground">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Coach feedback panel */}
                  <Card className="card-gradient border-border/50 flex-1">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" /> Live Coach
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1.5">
                      {liveFeedback.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Waiting for movement…</p>
                      ) : liveFeedback.map((f, i) => (
                        <div key={i} className={`flex items-start gap-2 text-xs
                          ${f.type === "good" ? "text-green-400" : f.type === "error" ? "text-red-400" : "text-yellow-400"}`}>
                          <span className="mt-0.5">{f.type === "good" ? "✅" : f.type === "error" ? "❌" : "⚠️"}</span>
                          <span>{f.text}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Start button (when not active) */}
                  {!cameraActive && !sessionDone && (
                    <Button variant="hero" className="w-full gap-2" onClick={startCamera}>
                      <Camera className="h-4 w-4" /> Start Session
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════
              UPLOAD VIDEO TAB
          ════════════════════════════ */}
          {activeTab === "upload" && (
            <div className="space-y-5 animate-fade-in">
              <Card className="card-gradient border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Upload className="h-5 w-5 text-primary" /> Upload Video for Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">

                  {/* File preview */}
                  {file && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-primary/20">
                      <Video className="h-5 w-5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{fmtSize(file.size)}</p>
                      </div>
                      <button onClick={remove} className="p-1 rounded hover:bg-secondary transition-colors">
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  )}

                  {/* Drop zone */}
                  {!file && (
                    <div onClick={() => fileRef.current?.click()}
                         onDragOver={e => { e.preventDefault(); setDrag(true); }}
                         onDragLeave={() => setDrag(false)}
                         onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f?.type.startsWith("video/")) pick(f); }}
                         className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all
                           ${drag ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-secondary/30"}`}>
                      <input ref={fileRef} type="file" accept="video/mp4,video/webm,video/quicktime,video/avi"
                             className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) pick(f); }} />
                      <Upload className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="font-semibold mb-1">Drop video here or click to browse</p>
                      <p className="text-sm text-muted-foreground mb-3">Record yourself performing {exInfo.label}</p>
                      <Badge variant="secondary" className="text-xs">MP4 · WebM · MOV · AVI — up to 200 MB</Badge>
                    </div>
                  )}

                  {uploadError      && <Alert type="error">{uploadError}</Alert>}
                  {uploadCancelled  && <Alert type="info">Analysis cancelled.</Alert>}

                  <div className="flex gap-3">
                    <Button variant="hero" className="flex-1 gap-2" onClick={analyseUpload} disabled={!file || analysing}>
                      {analysing
                        ? <><Spinner size="sm" className="border-primary-foreground" /> Analysing…</>
                        : <><Play className="h-4 w-4" /> Analyse Video</>}
                    </Button>
                    {analysing && (
                      <Button variant="destructive" className="gap-2 shrink-0" onClick={cancelUpload}>
                        <StopCircle className="h-4 w-4" /> Stop
                      </Button>
                    )}
                  </div>

                  {analysing && (
                    <div className="space-y-2">
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-primary/50 rounded-full w-full animate-pulse" />
                      </div>
                      <p className="text-xs text-center text-muted-foreground">Running MediaPipe pose detection on your video…</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upload results */}
              {results && (
                <div className="space-y-5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl font-bold">Analysis Results</h2>
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={() => { setResults(null); setFile(null); setSaved(null); if (fileRef.current) fileRef.current.value = ""; }}>
                      <RefreshCw className="h-4 w-4" /> New Analysis
                    </Button>
                  </div>

                  {/* Score banner */}
                  <Card className={`card-gradient border-2 ${g.ring}`}>
                    <CardContent className="p-6 flex items-center gap-6 flex-wrap">
                      <div className={`w-24 h-24 rounded-full border-4 ${g.ring} flex flex-col items-center justify-center shrink-0`}>
                        <span className={`font-display text-3xl font-bold ${g.num}`}>{Math.round(results.average_form_score)}</span>
                        <span className="text-xs text-muted-foreground">/100</span>
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-display font-bold text-2xl ${g.num} mb-1`}>{g.emoji} {g.label}</h3>
                        <p className="text-sm text-muted-foreground">{results.summary}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { icon: Check,    label: "Reps Done",   value: results.completed_reps,  color: "text-green-400",  bg: "bg-green-500/10"  },
                      { icon: Target,   label: "Good Form",   value: results.correct_reps,    color: "text-primary",    bg: "bg-primary/10"    },
                      { icon: Clock,    label: "Duration",    value: results.workout_duration_s >= 60 ? `${Math.floor(results.workout_duration_s/60)}m ${Math.round(results.workout_duration_s%60)}s` : `${Math.round(results.workout_duration_s)}s`, color: "text-accent", bg: "bg-accent/10" },
                      { icon: BarChart2,label: "Avg Score",   value: results.average_form_score.toFixed(1)+"%", color: "text-primary", bg: "bg-primary/10" },
                    ].map(({ icon: Icon, label, value, color, bg }) => (
                      <div key={label} className="glass-card rounded-xl p-4">
                        <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                          <Icon className={`h-5 w-5 ${color}`} />
                        </div>
                        <p className={`font-display text-xl font-bold ${color}`}>{value}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Completion bar */}
                  <Card className="card-gradient border-border/50">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-center mb-3 text-sm">
                        <span className="font-medium">Completion — {results.completed_reps}/{results.target_reps} reps</span>
                        <span className="font-bold text-primary">{results.completion_rate}%</span>
                      </div>
                      <div className="h-3 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                             style={{ width: `${results.completion_rate}%`, background: results.completion_rate >= 80 ? "linear-gradient(90deg,hsl(150 80% 45%),hsl(160 70% 55%))" : results.completion_rate >= 50 ? "linear-gradient(90deg,hsl(45 100% 55%),hsl(35 100% 55%))" : "linear-gradient(90deg,hsl(0 84% 60%),hsl(15 90% 60%))" }} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Per-rep table */}
                  {results.rep_details?.length > 0 && (
                    <Card className="card-gradient border-border/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <BarChart2 className="h-4 w-4 text-primary" /> Per-Rep Breakdown
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="grid grid-cols-[44px_1fr_100px_1fr] px-5 py-3 bg-secondary/30 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50">
                          <div>Rep</div><div>Score</div><div>Rating</div><div className="hidden sm:block">Feedback</div>
                        </div>
                        {results.rep_details.map(rep => {
                          const s = rep.form_score;
                          const badge = s >= 90 ? "✓ Perfect" : s >= 65 ? "👍 Good" : "⚠ Improve";
                          const bCls  = s >= 90 ? "bg-green-500/20 text-green-400" : s >= 65 ? "bg-primary/20 text-primary" : "bg-red-500/20 text-red-400";
                          const nCls  = s >= 80 ? "bg-green-500/20 text-green-400" : s >= 55 ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400";
                          return (
                            <div key={rep.rep} className="grid grid-cols-[44px_1fr_100px_1fr] px-5 py-3.5 border-b border-border/50 last:border-0 hover:bg-secondary/20 items-center">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${nCls}`}>{rep.rep}</div>
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden max-w-24">
                                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60" style={{ width: `${s}%` }} />
                                </div>
                                <span className="text-xs font-bold w-8">{s.toFixed(0)}</span>
                              </div>
                              <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${bCls}`}>{badge}</span>
                              <div className="hidden sm:block text-xs text-muted-foreground">{rep.feedback}</div>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════
              SAVE SESSION + ML CARD
              shown after live OR upload completes
          ════════════════════════════ */}
          {showSaveSection && summaryData && !saving && !saved && (
            <Card className="card-gradient border-primary/30 mt-6 animate-scale-in">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-display font-bold text-lg mb-1">Save Session &amp; Get AI Recommendation</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {summaryData.completedReps} reps · {summaryData.correctReps} good form · {Math.round(summaryData.avgFormScore)}% avg score
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  The ML model will analyse your performance and recommend whether to increase, maintain, or decrease intensity.
                </p>
                {saveErr && <Alert type="error" className="mb-4">{saveErr}</Alert>}
                <Button variant="hero" className="gap-2" onClick={() => saveSession(summaryData)} disabled={saving}>
                  💾 Save &amp; Get ML Recommendation
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ═══════════════════════════
              ML PROGRESSION RESULT CARD
          ════════════════════════════ */}
          {saved && p && (
            <Card className={`card-gradient border-2 ${p.cls} mt-6 animate-scale-in`}>
              <CardContent className="p-6 space-y-5">

                {/* Header */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-secondary/50 border border-border flex items-center justify-center text-3xl shrink-0">
                    {p.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      🤖 ML Progression Recommendation
                    </p>
                    <p className={`font-display font-bold text-2xl ${p.color}`}>{p.label}</p>
                  </div>
                  <Badge variant="outline" className={`ml-auto ${p.btn}`}>
                    {saved.progressionAction}
                  </Badge>
                </div>

                {/* Reason */}
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <p className="text-sm text-muted-foreground leading-relaxed">{saved.progressionReason}</p>
                </div>

                {/* Stats summary */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: saved.completedReps, label: "Reps Done" },
                    { val: saved.correctReps,   label: "Good Form" },
                    { val: `${saved.averageFormScore?.toFixed(1)}%`, label: "Avg Score" },
                  ].map(({ val, label }) => (
                    <div key={label} className="text-center p-3 rounded-xl bg-secondary/30 border border-border/50">
                      <p className={`font-display text-xl font-bold ${p.color}`}>{val}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Next session recommendation */}
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Next Session Recommendation
                  </p>
                  <p className="text-sm font-semibold">
                    {saved.progressionAction === "INCREASE"
                      ? `Try ${(saved.targetReps || targetReps) + 2} reps of ${exercise.replace(/_/g, " ")} next time`
                      : saved.progressionAction === "DECREASE"
                        ? `Scale back to ${Math.max((saved.targetReps || targetReps) - 2, 5)} reps — focus on form first`
                        : `Repeat ${saved.targetReps || targetReps} reps — aim to improve form score above ${Math.round((saved.averageFormScore || 0) + 5)}%`}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button variant="hero" size="sm" className="gap-2 flex-1" onClick={() => {
                    setSessionDone(false); setResults(null); setSaved(null); setSaveErr("");
                    setLiveReps(0); setLiveCorrect(0); setLiveScore(0); setLiveTimer(0);
                    stateRef.current = {}; scoresRef.current = []; repsRef.current = 0; correctRef.current = 0;
                    const recs = saved.progressionAction === "INCREASE" ? (saved.targetReps || targetReps) + 2 : Math.max((saved.targetReps || targetReps) - 2, 5);
                    if (saved.progressionAction !== "MAINTAIN") setTargetReps(recs);
                  }}>
                    <Play className="h-4 w-4" /> Track Again
                  </Button>
                  <Link to="/history" className="flex-1">
                    <Button variant="glass" size="sm" className="gap-2 w-full">
                      <History className="h-4 w-4" /> View History
                    </Button>
                  </Link>
                  <Link to="/ai-recommendations" className="flex-1">
                    <Button variant="glass" size="sm" className="gap-2 w-full">
                      <BarChart2 className="h-4 w-4" /> AI Insights
                    </Button>
                  </Link>
                </div>

              </CardContent>
            </Card>
          )}

        </div>
      </main>
    </div>
  );
}
