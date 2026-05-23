import os
import pandas as pd
import gspread
from google.oauth2.service_account import Credentials
from langchain_groq import ChatGroq
from langchain_experimental.agents.agent_toolkits import create_pandas_dataframe_agent

# 1. SETUP
os.environ["GROQ_API_KEY"] = "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"
base_path = os.path.dirname(os.path.abspath(__file__))
creds_path = os.path.join(base_path, "credentials.json")
scopes = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]

# 2. DATA ACQUISITION
creds = Credentials.from_service_account_file(creds_path, scopes=scopes)
gc = gspread.authorize(creds)
spreadsheet = gc.open("Financial_Agent_Training_Data_V1")

# Load each tab into its own dataframe
df_trans = pd.DataFrame(spreadsheet.worksheet("Transactions").get_all_records())
df_liab  = pd.DataFrame(spreadsheet.worksheet("Liabilities").get_all_records())
df_invest = pd.DataFrame(spreadsheet.worksheet("Investments").get_all_records())

# 3. INITIALIZE AGENT
llm = ChatGroq(model_name="llama-3.3-70b-versatile", temperature=0)

# We pass a list of dataframes. 
# df[0] will be Transactions, df[1] will be Liabilities, df[2] will be Investments
agent = create_pandas_dataframe_agent(
    llm, 
    [df_trans, df_liab, df_invest], 
    verbose=True, 
    allow_dangerous_code=True
)

# 4. EXECUTION
query = "Based on the Transactions sheet, how has my monthly spending on 'Housing' changed between 2024 and 2025?"
agent.invoke(query)