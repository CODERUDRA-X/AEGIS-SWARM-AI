import os
from google import genai
from google.genai import types
from pydantic import BaseModel

# UPGRADED SCHEMA
class ScoutReport(BaseModel):
    people_count: int
    density: str
    blocked_paths: int
    environment_type: str  # e.g., "stairway", "crosswalk", "hallway"
    hazard_factors: list[str] # e.g., "carrying heavy objects", "narrow path"

def analyze_crowd_frame(image_path: str) -> str:
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    
    print(f"[*] Scout: Uploading {image_path} to visual cortex...")
    uploaded_file = client.files.upload(file=image_path)
    
    prompt = """Analyze this security camera/drone footage. 
    Estimate the number of people and density. 
    Crucially, identify the environment type (e.g., stairs, open street, corridor) 
    and list any visual hazard factors (e.g., carrying large items, uneven terrain)."""
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=[uploaded_file, prompt],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ScoutReport,
            temperature=0.1
        ),
    )
    return response.text