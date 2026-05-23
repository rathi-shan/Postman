import gspread
from google.oauth2.service_account import Credentials
import os

# This gets the exact directory where your script is located
base_path = os.path.dirname(os.path.abspath(__file__))
credentials_path = os.path.join(base_path, "credentials.json")

# Define the scope
scopes = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]

# Authenticate using the absolute path
try:
    creds = Credentials.from_service_account_file(credentials_path, scopes=scopes)
    client = gspread.authorize(creds)

    # Open the sheet by its name (Ensure the name matches exactly!)
    sheet = client.open("Financial_Agent_Training_Data_V1").sheet1
    print(f"✅ Successfully connected!")
    print(f"📊 First row of data: {sheet.row_values(1)}")
except FileNotFoundError:
    print(f"❌ Error: Could not find credentials.json at {credentials_path}")
except Exception as e:
    print(f"❌ An error occurred: {e}")