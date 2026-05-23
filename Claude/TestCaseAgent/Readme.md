Fully automated test generation the moment a Jira story pops up—you need an asynchronous event-driven architecture.

Here is how that exact enterprise pipeline is built:

[ Jira Webhook Trigger ] 
         │  (Triggers when a ticket moves to "In Progress" or "Ready for QA")
         ▼
[ Python API Gateway (FastAPI) ]
         │  (Extracts the Jira Summary & Description)
         ▼
[ Agent 1: Requirement-to-Gherkin (Claude) ] ──> Saves .feature file
         │
         ▼
[ Agent 2: Gherkin-to-Playwright (Claude) ]
         │  (Parses Gherkin and writes actual TypeScript/Python Playwright code)
         ▼
[ Automated PR / Code Commit ] ──> Pushes code to GitHub/GitLab repository