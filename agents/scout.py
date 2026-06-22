import os
from google import genai
from google.genai import types
from pydantic import BaseModel

# Structured Output Schema
class ScoutReport(BaseModel):
    people_count: int
    density: str
    blocked_paths: int

def analyze_crowd_frame(image_path: str) -> str:
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    
    # Upload image directly using File API
    print(f"[*] Scout: Uploading {image_path} to visual cortex...")
    uploaded_file = client.files.upload(file=image_path)
    
    prompt = """Analyze this security camera/drone footage. 
    Focus ONLY on crowd management. Estimate the number of people, 
    assess the density (low/medium/high/critical), and count any visible blocked paths or exits."""
    
    response = client.models.generate_content(
        model='gemini-2.5-pro',
        contents=[uploaded_file, prompt],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ScoutReport,
            temperature=0.1 # Low temp for analytical accuracy
        ),
    )
    return response.text