import json
import os
from datetime import datetime
from zoneinfo import ZoneInfo
from pathlib import Path

# Get the status text supplied by GitHub Actions
status_text = os.environ.get("STATUS_TEXT", "").strip()

if not status_text:
    raise ValueError("No status text was provided.")

# Get today's date in Pacific time
today = datetime.now(ZoneInfo("America/Los_Angeles")).strftime("%m/%d/%y")

# Locate the status history file
status_file = Path("statuses.json")

# Load existing statuses
with status_file.open("r", encoding="utf-8") as file:
    statuses = json.load(file)

# Add the new status to the beginning
statuses.insert(0, {
    "date": today,
    "text": status_text
})

# Save the updated history
with status_file.open("w", encoding="utf-8") as file:
    json.dump(statuses, file, indent=4, ensure_ascii=False)
    file.write("\n")
