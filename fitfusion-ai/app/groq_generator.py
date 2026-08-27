"""
groq_generator.py
Generates a personalised workout plan using the Groq LLM API.
"""

import os
import json
import re
from pathlib import Path
from groq import Groq

# Load .env from the project root (fitfusion-ai/.env) if it exists
try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")
except ImportError:
    pass  # dotenv not installed — fall back to system environment variable

_client: Groq | None = None


def _get_client() -> Groq:
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError(
                "GROQ_API_KEY environment variable is not set"
            )
        _client = Groq(api_key=api_key)
    return _client


def generate_workout_plan(request: dict) -> dict:
    """
    request keys:
        goal            – e.g. WEIGHT_LOSS / MUSCLE_GAIN / MAINTENANCE / ENDURANCE
        experience_level – BEGINNER / INTERMEDIATE / ADVANCED
        activity_level  – SEDENTARY / LIGHTLY_ACTIVE / MODERATELY_ACTIVE /
                          VERY_ACTIVE / EXTREMELY_ACTIVE
        age             – int
        gender          – MALE / FEMALE
        weight_kg       – float
        height_cm       – float
        medical_conditions – str or None
        preferences     – free-text from the user (optional)
        days_per_week   – int  1-7 (default 4)
    """

    goal             = request.get("goal", "MAINTENANCE")
    experience       = request.get("experience_level", "BEGINNER")
    activity         = request.get("activity_level", "MODERATELY_ACTIVE")
    age              = request.get("age", 25)
    gender           = request.get("gender", "MALE")
    weight           = request.get("weight_kg", 70)
    height           = request.get("height_cm", 170)
    conditions       = request.get("medical_conditions") or "None"
    preferences      = request.get("preferences") or "No specific preferences"
    days             = int(request.get("days_per_week", 4))

    system_prompt = (
        "You are FitFusion AI, an expert certified personal trainer and sports scientist. "
        "You create personalised, science-backed weekly workout plans. "
        "Always respond ONLY with a valid JSON object — no markdown fences, no prose outside JSON."
    )

    user_prompt = f"""
Create a personalised {days}-day weekly workout plan for this person:

- Goal: {goal.replace("_", " ").title()}
- Experience Level: {experience}
- Activity Level: {activity.replace("_", " ").title()}
- Age: {age}
- Gender: {gender}
- Weight: {weight} kg
- Height: {height} cm
- Medical Conditions: {conditions}
- User Preferences: {preferences}
- Days per Week: {days}

Return EXACTLY this JSON structure (no extra keys, no markdown):
{{
  "plan_name": "<short descriptive name>",
  "goal": "{goal}",
  "experience_level": "{experience}",
  "duration_weeks": 4,
  "days_per_week": {days},
  "estimated_calories_per_session": <integer>,
  "overview": "<2-3 sentence overview of the plan>",
  "workouts": [
    {{
      "day": "<e.g. Monday>",
      "name": "<workout name>",
      "category": "<STRENGTH|CARDIO|FLEXIBILITY|HIIT>",
      "duration_minutes": <integer>,
      "difficulty": "<BEGINNER|INTERMEDIATE|ADVANCED>",
      "estimated_calories": <integer>,
      "focus": "<primary muscle group or focus>",
      "exercises": [
        {{
          "name": "<exercise name>",
          "sets": <integer or null>,
          "reps": "<e.g. 10-12 or 30 sec>",
          "rest_seconds": <integer>,
          "notes": "<form tip or modification>"
        }}
      ]
    }}
  ],
  "rest_days": ["<day>"],
  "tips": ["<tip1>", "<tip2>", "<tip3>"]
}}
""".strip()

    client = _get_client()

    # Try models in order of preference — first available on your plan is used
    MODELS = [
        "llama-3.3-70b-versatile",    # Enterprise plan
        "openai/gpt-oss-120b",         # Free/Developer plan, fast
        "openai/gpt-oss-20b",          # Free/Developer plan, fastest
        "qwen/qwen3.6-27b",            # Free/Developer plan, fallback
    ]

    last_error = None
    for model_id in MODELS:
        try:
            chat_completion = client.chat.completions.create(
                model=model_id,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user",   "content": user_prompt},
                ],
                temperature=0.7,
                max_tokens=4096,
            )
            break  # success — stop trying
        except Exception as e:
            last_error = e
            if "model_not_found" in str(e) or "does not exist" in str(e) or "access" in str(e).lower():
                continue  # try next model
            raise  # different error — raise immediately
    else:
        raise RuntimeError(
            f"No available Groq model could be reached. Last error: {last_error}"
        )

    raw = chat_completion.choices[0].message.content.strip()

    # Strip accidental markdown code fences if the model adds them
    raw = re.sub(r"^```[a-z]*\n?", "", raw)
    raw = re.sub(r"\n?```$", "", raw)

    try:
        plan = json.loads(raw)
    except json.JSONDecodeError:
        # Last-resort: extract first {...} block
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if match:
            plan = json.loads(match.group())
        else:
            raise ValueError(f"Groq returned non-JSON response: {raw[:200]}")

    return plan
