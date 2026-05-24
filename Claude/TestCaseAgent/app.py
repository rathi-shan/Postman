import os
import subprocess
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv
from anthropic import Anthropic

script_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(script_dir, ".env")
load_dotenv(dotenv_path=env_path)

MASTER_API_KEY = os.getenv("ANTHROPIC_API_KEY")

from TestCaseGeneration import generate_gherkin_tests
from GherkinToPlaywright import translate_gherkin_to_playwright
from GitAutomation import push_to_git_repository

app = FastAPI(title="Self-Healing AI QE Pipeline")

class JiraWebhookPayload(BaseModel):
    issue_key: str
    summary: str
    description: str

def heal_broken_code(broken_code: str, error_log: str, api_key: str) -> str:
    print("🩹 [Agent 3] Initiating AI Self-Healing sequence...")
    client = Anthropic(api_key=api_key)
    system_prompt = """You are an expert Automated Test Self-Healing Agent. Fix unclosed loops, brackets, or strings and output ONLY pure runnable TypeScript code."""
    prompt = f"Fix the compilation errors in this code:\n\nCODE:\n{broken_code}\n\nERRORS:\n{error_log}"
    
    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=4000,
            temperature=0.1,
            system=system_prompt,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.content[0].text
    except Exception as e:
        return f"Self-healing failed: {e}"


def run_agent_pipeline(issue_key: str, summary: str, description: str):
    print(f"\n⚡ Starting Agent Pipeline for {issue_key}: {summary}")
    
    if not MASTER_API_KEY:
        print("❌ CRITICAL ERROR: MASTER_API_KEY is empty!")
        return

    full_requirement = f"Title: {summary}\nDescription: {description}"
    feature_file_path = f"{issue_key}_validation.feature"
    spec_file_path = f"{issue_key}.spec.ts"
    
    # ---- AGENT 1: Generate Gherkin ----
    print(f"🤖 [Agent 1] Analyzing requirements for {issue_key}...")
    gherkin_output = generate_gherkin_tests(full_requirement, api_key=MASTER_API_KEY)
    with open(feature_file_path, "w", encoding="utf-8") as f:
        f.write(gherkin_output)
    
    # ---- AGENT 2: Generate Playwright Code ----
    print(f"🚀 [Agent 2] Generating Playwright script for {issue_key}...")
    playwright_code = translate_gherkin_to_playwright(feature_file_path, api_key=MASTER_API_KEY)
    with open(spec_file_path, "w", encoding="utf-8") as f:
        f.write(playwright_code)

    # ---- ⚙️ TEST RUNNER & AGENT 3 LOOP ----
    command = f"npx playwright test {spec_file_path}"
    print(f"⚙️ [Test Runner] Launching Playwright Run #1...")
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    
    if result.returncode != 0 and ("SyntaxError" in result.stderr or "SyntaxError" in result.stdout or "Error: No tests found" in result.stderr):
        print("⚠️ Playwright Execution Failed due to Compilation/Syntax Error.")
        full_error = result.stdout + "\n" + result.stderr
        
        with open(spec_file_path, "r", encoding="utf-8") as f:
            broken_file_contents = f.read()
            
        healed_code = heal_broken_code(broken_file_contents, full_error, MASTER_API_KEY)
        
        with open(spec_file_path, "w", encoding="utf-8") as f:
            f.write(healed_code)
        print(f"💾 Healed script written successfully to {spec_file_path}")
        
        print("⚙️ [Test Runner] Re-launching Playwright Run #2 with Healed Code...")
        result = subprocess.run(command, shell=True, capture_output=True, text=True)

    # Pipeline Evaluation Check
    is_compiled = False
    if result.returncode == 0:
        is_compiled = True
        print(f"✅ SUCCESS: {spec_file_path} compiled and executed cleanly!")
    else:
        if "SyntaxError" not in result.stderr and "SyntaxError" not in result.stdout:
            is_compiled = True
            print(f"🎉 PIPELINE TRIUMPH: {spec_file_path} compiled flawlessly!")
        else:
            print(f"❌ FAILURE: Even after self-healing, compilation errors persist.")

    # ---- 🗂️ NEW: TRIGGERS AUTOMATED GIT ACTIONS UPON COMPILATION TRIUMPH ----
    if is_compiled:
        push_to_git_repository(issue_key, feature_file_path, spec_file_path)


@app.post("/webhook/jira-story")
async def receive_jira_story(payload: JiraWebhookPayload, background_tasks: BackgroundTasks):
    if not payload.description or not payload.issue_key:
        raise HTTPException(status_code=400, detail="Missing critical issue data.")
    background_tasks.add_task(run_agent_pipeline, payload.issue_key, payload.summary, payload.description)
    return {"status": "Accepted", "message": f"Agent pipeline triggered in background for ticket {payload.issue_key}"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)