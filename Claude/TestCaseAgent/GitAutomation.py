import os
from git import Repo

script_dir = os.path.dirname(os.path.abspath(__file__))


def push_to_git_repository(issue_key: str, feature_file: str, spec_file: str):
    """
    Automates Git staging, branching, and committing.
    """
    print(f"📦 [Git Agent] Preparing to commit automation assets for {issue_key}...")
    try:
        repo = Repo(script_dir)

        if not os.path.exists(feature_file) or not os.path.exists(spec_file):
            print("❌ Git upload skipped: Missing files.")
            return

        repo.index.add([feature_file, spec_file])

        commit_message = f"chore(automation): auto-generated test suite for {issue_key} [skip ci]"
        repo.index.commit(commit_message)
        print(f"🗄️ Locally committed {feature_file} and {spec_file}!")

        # 4. Optional Remote Push (Uncomment and replace 'origin' if connected to a real GitHub repo)
        # origin = repo.remote(name='origin')
        # origin.push()
        print("🚀 [Git Agent] Changes successfully locked into repository history.")

    except Exception as git_err:
        print(f"⚠️ Git automation encountered an error (Check if directory is initialized via 'git init'): {git_err}")
