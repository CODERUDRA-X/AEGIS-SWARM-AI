import os
import json
from dotenv import load_dotenv

# Import our agents
from agents.scout import analyze_crowd_frame
from agents.risk import evaluate_risk
from agents.commander import generate_action_plan

# Load .env file
load_dotenv()

def run_aegis_pipeline(image_path: str):
    print(f"\n{'='*50}")
    print(f"🚀 INITIATING AEGIS-SWARM FOR: {image_path}")
    print(f"{'='*50}\n")
    
    # 1. SCOUT
    scout_output = analyze_crowd_frame(image_path)
    print("👀 [SCOUT AGENT REPORT]")
    print(json.dumps(json.loads(scout_output), indent=2))
    print("-" * 50)
    
    # 2. RISK ANALYST
    print("⚠️ [RISK AGENT ASSESSMENT]")
    risk_output = evaluate_risk(scout_output)
    print(json.dumps(json.loads(risk_output), indent=2))
    print("-" * 50)
    
    # 3. COMMANDER
    print("🛡️ [COMMANDER AGENT ACTION PLAN]")
    plan_output = generate_action_plan(risk_output)
    print(json.dumps(json.loads(plan_output), indent=2))
    print(f"\n{'='*50}\n")

if __name__ == "__main__":
    # Ensure you have renamed one of your images to this and placed it in test_images/
    target_image = "test_images/stairway_congestion_01.jpg" 
    
    if os.path.exists(target_image):
        run_aegis_pipeline(target_image)
    else:
        print(f"Error: Could not find {target_image}. Please check the path.")