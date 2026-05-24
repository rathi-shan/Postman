Where are our AI agents defined and how do they communicate with the server?              

  Searched for 2 patterns, read 7 files, listed 1 directory (ctrl+o to expand)

● Here's the layout:

  Agents (all defined in Python, all call Claude via the Anthropic SDK):
  - Agent 1 — Requirement → Gherkin: TestCaseGeneration.py:9 (generate_gherkin_tests),
  system prompt at line 19, model claude-sonnet-4-6, temp 0.2.
  - Agent 2 — Gherkin → Playwright TS: GherkinToPlaywright.py:8
  (translate_gherkin_to_playwright), system prompt at line 24, same model, temp 0.1.
  - Agent 3 — Self-Healing: app.py:57 (heal_broken_code), invoked only when Playwright run
  fails with a SyntaxError. Same model, temp 0.1.
  - Git Agent (non-LLM): app.py:26 (push_to_git_repository), stages and commits the
  generated .feature + .spec.ts using GitPython.

  Server / orchestration — app.py:
  - FastAPI app declared at app.py:19, run via uvicorn on 127.0.0.1:8000 (app.py:144).
  - Single endpoint POST /webhook/jira-story at app.py:137, validated by the
  JiraWebhookPayload model (app.py:21: issue_key, summary, description).
  - The endpoint queues run_agent_pipeline (app.py:76) as a FastAPI BackgroundTask and
  returns 202-style {"status": "Accepted"} immediately — so the Jira webhook is
  non-blocking.
  - run_agent_pipeline orchestrates: Agent 1 → write .feature → Agent 2 → write .spec.ts →
  subprocess.run("npx playwright test …") → if syntax error, Agent 3 heals → re-run → on
  success, Git Agent commits.

  How agents talk to the server:
  - They don't talk to the server — the server imports them directly (app.py:16-17) and
  calls them as in-process Python functions. The shared key is MASTER_API_KEY loaded from
  .env (app.py:14) and passed into each agent call.
  - External communication into the server is HTTP only: simulate_jira_webhook.py POSTs a
  mock Jira payload to http://127.0.0.1:8000/webhook/jira-story — that's also how a real
  Jira webhook would reach it.
  - Each agent talks outbound to Anthropic via client.messages.create(...) from the
  anthropic SDK.

  Diagram in Readme.md:5 matches this flow.

✻ Churned for 41s

────────────────────────────────────────────────────────────────────────────────────────────
❯  
────────────────────────────────────────────────────────────────────────────────────────────
  ? for shortcuts · ← for agents
