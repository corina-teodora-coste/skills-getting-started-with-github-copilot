"""
High School Management System API

A super simple FastAPI application that allows students to view and sign up
for extracurricular activities at Mergington High School.
"""

from fastapi import FastAPI, HTTPException, Response
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
import os
from pathlib import Path

app = FastAPI(title="Mergington High School API",
              description="API for viewing and signing up for extracurricular activities")

# Mount the static files directory
current_dir = Path(__file__).parent
app.mount("/static", StaticFiles(directory=os.path.join(Path(__file__).parent,
          "static")), name="static")

# In-memory activity database
activities = {
    "Chess Club": {
        "description": "Learn strategies and compete in chess tournaments",
        "schedule": "Fridays, 3:30 PM - 5:00 PM",
        "max_participants": 12,
        "participants": ["michael@mergington.edu", "daniel@mergington.edu"]
    },
    "Programming Class": {
        "description": "Learn programming fundamentals and build software projects",
        "schedule": "Tuesdays and Thursdays, 3:30 PM - 4:30 PM",
        "max_participants": 20,
        "participants": ["emma@mergington.edu", "sophia@mergington.edu"]
    },
    "Gym Class": {
        "description": "Physical education and sports activities",
        "schedule": "Mondays, Wednesdays, Fridays, 2:00 PM - 3:00 PM",
        "max_participants": 30,
        "participants": ["john@mergington.edu", "olivia@mergington.edu"]
    },
    "Soccer Team": {
        "description": "Competitive soccer team, intramurals and regional matches",
        "schedule": "Tuesdays & Thursdays, 4:00 PM - 6:00 PM",
        "max_participants": 22,
        "participants": ["liam@mergington.edu", "noah@mergington.edu"]
    },
    "Basketball Team": {
        "description": "Practice and play games, focus on teamwork and fitness",
        "schedule": "Mondays, Wednesdays, Fridays, 5:00 PM - 7:00 PM",
        "max_participants": 15,
        "participants": ["ava@mergington.edu", "sophia@mergington.edu"]
    },
    "Choir": {
        "description": "Group singing for school concerts and competitions",
        "schedule": "Wednesdays, 3:30 PM - 5:00 PM",
        "max_participants": 40,
        "participants": ["isabella@mergington.edu", "mia@mergington.edu"]
    },
    "Art Club": {
        "description": "Explore painting, drawing, and mixed media projects",
        "schedule": "Thursdays, 3:30 PM - 5:00 PM",
        "max_participants": 25,
        "participants": ["charlotte@mergington.edu", "amelia@mergington.edu"]
    },
    "Debate Team": {
        "description": "Practice public speaking, research, and competitive debates",
        "schedule": "Tuesdays, 4:00 PM - 5:30 PM",
        "max_participants": 12,
        "participants": ["logan@mergington.edu", "ethan@mergington.edu"]
    },
    "Science Club": {
        "description": "Hands-on experiments, science fairs, and research projects",
        "schedule": "Fridays, 3:30 PM - 5:00 PM",
        "max_participants": 20,
        "participants": ["grace@mergington.edu", "chris@mergington.edu"]
    }
}


@app.get("/")
def root():
    return RedirectResponse(url="/static/index.html")


@app.get("/activities")
def get_activities():
    # Prevent caching
    return Response(content=activities_to_json(), media_type="application/json", headers={"Cache-Control": "no-store"})

# Helper to convert activities dict to JSON string
import json
def activities_to_json():
    return json.dumps(activities)

# Unregister endpoint
@app.post("/activities/{activity_name}/unregister")
def unregister_from_activity(activity_name: str, email: str):
    """Unregister a student from an activity"""
    if activity_name not in activities:
        raise HTTPException(status_code=404, detail="Activity not found")
    activity = activities[activity_name]
    if email not in activity.get("participants", []):
        raise HTTPException(status_code=400, detail="Student is not registered for this activity")
    activity["participants"].remove(email)
    return {"message": f"Unregistered {email} from {activity_name}"}


@app.post("/activities/{activity_name}/signup")
def signup_for_activity(activity_name: str, email: str):
    """Sign up a student for an activity"""
    # Validate activity exists
    if activity_name not in activities:
        raise HTTPException(status_code=404, detail="Activity not found")

    # Get the specific activity
    activity = activities[activity_name]

    # Check if the student is already signed up
    if email in activity.get("participants", []):
        raise HTTPException(status_code=400, detail="Student is already signed up for this activity")
    
    # Add student
    activity["participants"].append(email)
    return {"message": f"Signed up {email} for {activity_name}"}
