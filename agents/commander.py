import os
from google import genai
from google.genai import types
from pydantic import BaseModel

class ActionPlan(BaseModel):
    immediate_actions: list[str]
    personnel_required: bool

def generate_action_plan(risk_json_data: str) -> str:
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    
    prompt = f"""You are the Commander Agent. 
    Review this Risk Assessment: {risk_json_data}
    
    Create a highly specific, tactical action plan to mitigate the crowd risk. 
    List 2-3 immediate actionable steps."""
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ActionPlan,
            temperature=0.3
        ),
    )
    return response.text