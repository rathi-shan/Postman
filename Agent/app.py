import streamlit as st
import os
import pandas as pd
import gspread
from google.oauth2.service_account import Credentials
from langchain_ollama import ChatOllama  # Purely local
from langchain_experimental.agents.agent_toolkits import create_pandas_dataframe_agent

# --- 1. PAGE CONFIGURATION ---
st.set_page_config(page_title="Private Financial Agent", page_icon="🔒", layout="wide")

st.title("🔒 Private Financial Analysis Agent")
st.markdown("""
    **Local Mode:** Your data stays on this computer. No API keys, no rate limits.
    *Example: "Compare my total principal in Liabilities to my total Book Value in Investments."*
""")

# --- 2. DATA & AGENT INITIALIZATION ---
@st.cache_resource
def initialize_local_system():
    # Path setup
    base_path = os.path.dirname(os.path.abspath(__file__))
    creds_path = os.path.join(base_path, "credentials.json")
    scopes = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]

    # Google Sheets Authentication
    creds = Credentials.from_service_account_file(creds_path, scopes=scopes)
    gc = gspread.authorize(creds)
    spreadsheet = gc.open("Financial_Agent_Training_Data_V1")

    # Load Dataframes
    df_trans = pd.DataFrame(spreadsheet.worksheet("Transactions").get_all_records())
    df_liab  = pd.DataFrame(spreadsheet.worksheet("Liabilities").get_all_records())
    df_invest = pd.DataFrame(spreadsheet.worksheet("Investments").get_all_records())

    # Initialize Local Brain (Ensure you ran 'ollama run llama3.1' in terminal first)
   # llm = ChatOllama(model="llama3.1", temperature=0)
    llm = ChatOllama(model="llama3.2:3b", temperature=0)

    # Create Agent
    agent = create_pandas_dataframe_agent(
        llm, 
        [df_trans, df_liab, df_invest], 
        verbose=True, 
        allow_dangerous_code=True,
        handle_parsing_errors=True 
    )
    
    return {
        "agent": agent,
        "transactions": df_trans,
        "liabilities": df_liab,
        "investments": df_invest
    }

# Load the system
try:
    data_bundle = initialize_local_system()
    st.sidebar.success("✅ Running Locally on Ollama")
except Exception as e:
    st.error(f"Initialization Error: {e}")
    st.info("Check if Ollama is running in your system tray and you have run 'ollama run llama3.1' in your terminal.")
    st.stop()

# --- 3. CHAT INTERFACE ---
user_query = st.text_input("Enter your financial question:", placeholder="e.g., What is my total net worth?")

if user_query:
    with st.spinner("Local AI is analyzing... (This may be slower than the cloud but is 100% private)"):
        try:
            result = data_bundle["agent"].invoke(user_query)
            st.success("Analysis Complete!")
            st.markdown("### Agent Answer")
            st.write(result["output"])
        except Exception as e:
            st.error(f"Analysis Error: {e}")

# --- 4. DATA AUDIT ---
st.divider()
with st.expander("📊 Audit Local Data Tables"):
    col1, col2, col3 = st.columns(3)
    with col1:
        st.write("**Transactions**")
        st.dataframe(data_bundle["transactions"], hide_index=True)
    with col2:
        st.write("**Liabilities**")
        st.dataframe(data_bundle["liabilities"], hide_index=True)
    with col3:
        st.write("**Investments**")
        st.dataframe(data_bundle["investments"], hide_index=True)