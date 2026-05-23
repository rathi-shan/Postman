import os
from anthropic import Anthropic
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

def generate_gherkin_tests(user_story: str) -> str:
    """
    Sends a raw user story to Claude and receives structured Gherkin test scenarios.
    """
    # 1. Initialize the official Anthropic client
    # It automatically looks for the 'ANTHROPIC_API_KEY' environment variable.
    client = Anthropic()

    # 2. Define the exact, hyper-focused QA System Prompt
    system_prompt = """
You are an expert Principal Quality Engineering (QE) Agent. Your task is to analyze raw software requirements or User Stories, identify hidden risks, boundary conditions, and edge cases, and output comprehensive automated test scenarios.

You must output your response strictly using Gherkin syntax (Given, When, Then). 

Follow these structural requirements:
1. Start with the 'Feature:' keyword and a brief description.
2. Include at least 2 'Happy Path' scenarios (the ideal, successful user journeys).
3. Include at least 2 'Sad Path / Edge Case' scenarios (input validations, error handling, or boundary values).
4. Use descriptive scenario names.
5. Do not include any conversational filler, introductory remarks, or concluding notes. Output ONLY the raw Gherkin text block so it can be saved directly as a .feature file.
"""

    # 3. Create the payload and invoke Claude
    # We use 'claude-3-5-sonnet-20241022' as it is the industry standard for logic, 
    # structure, and coding accuracy.
    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2500,
            temperature=0.2, # Low temperature ensures focused, logical, and repeatable test cases
            system=system_prompt,
            messages=[
                {
                    "role": "user",
                    "content": f"Please turn this user story into Gherkin test scenarios:\n\n{user_story}"
                }
            ]
        )
        
        # 4. Extract and return the text block from Claude's response
        return response.content[0].text

    except Exception as e:
        return f"An error occurred while communicating with Claude: {e}"


# --- Execution Example ---
if __name__ == "__main__":
    # Simulate a messy, real-world user story a business analyst might write
    sample_user_story = """
    As a premium user of the e-commerce app, I want to be able to apply a 15% discount coupon 
    code (PREMIUM15) at checkout so that I can save money on my order. 
    Notes: The coupon only works if the user is logged in and has a 'Premium' account status. 
    It shouldn't apply to items that are already on clearance. The minimum cart value to use 
    the coupon is $50.
    """
    
    print("🤖 Processing requirement with Claude...")
    gherkin_output = generate_gherkin_tests(sample_user_story)
    
    print("\n✨ Generated Gherkin Feature File:\n")
    print(gherkin_output)
    
    # Optional: Save the output directly into a test file for Cucumber/Playwright
    with open("coupon_validation.feature", "w") as f:
        f.write(gherkin_output)
    print("\n💾 Saved output to 'coupon_validation.feature'")