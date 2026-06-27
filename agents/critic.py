import os
from google import genai
from google.genai import types
from pydantic import BaseModel

class CriticReview(BaseModel):
    agrees_with_risk_level: bool
    adjusted_threat_level: str
    critic_reasoning: str

def challenge_risk_assessment(scout_json: str, risk_json: str) -> str:
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    
    prompt = f"""You are the Critic Agent. 
    Review the raw data: {scout_json}
    Review the Risk Agent's assessment: {risk_json}
    
    Challenge the Risk Agent. If the environment type (e.g., stairs) or hazard factors 
    increase the danger, elevate the threat level. Do you agree with the initial risk level?"""
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=CriticReview,
            temperature=0.2
        ),
    )
    return response.text