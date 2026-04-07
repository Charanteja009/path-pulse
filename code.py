import os
import json
import re
from typing import List, TypedDict
from fastapi import FastAPI, Header, HTTPException
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, BaseMessage, HumanMessage
from langgraph.graph import StateGraph, END
from langchain_community.tools.tavily_search import TavilySearchResults
import requests
from typing import Annotated
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage
from langgraph.checkpoint.sqlite import SqliteSaver
load_dotenv(dotenv_path="../../.env")

app = FastAPI(title="PathPulse Final Fix")
repo_explainer_app = None  # Global placeholder
# 2. LLM Setup (Temperature 0 is your best friend for JSON)
llm = ChatGroq(temperature=0, model_name="llama-3.3-70b-versatile", groq_api_key=os.getenv("GROQ_API_KEY"))


## --- 1. THE STATE ---
class ExplainerState(TypedDict):
    repo_url: str
    readme: str
    file_tree: List[str]
    tech_stack: str
    logic_breakdown: str
    # 'add_messages' ensures history is kept, not overwritten
    messages: Annotated[list[BaseMessage], add_messages] 
    next_step: str

# --- 2. THE NODES (The Workers) ---

def scraper_node(state: ExplainerState):
    """Fetches the README and File List from GitHub"""
    print("🚀 [AGENT] Scraper: Fetching Repo Data...")
    repo_path = state["repo_url"].replace("https://github.com/", "").strip("/")
    headers = {"Authorization": f"token {os.getenv('GITHUB_TOKEN')}"}
    
    # Get File Tree
    tree_url = f"https://api.github.com/repos/{repo_path}/contents"
    files_res = requests.get(tree_url, headers=headers).json()
    files = [f["name"] for f in files_res] if isinstance(files_res, list) else []
    
    # Get README
    readme_url = f"https://api.github.com/repos/{repo_path}/readme"
    readme_res = requests.get(readme_url, headers={"Accept": "application/vnd.github.v3.raw", **headers})
    
    return {
        "file_tree": files,
        "readme": readme_res.text[:3000] # Limit size for AI
    }

def analyst_node(state: ExplainerState):
    """Identifies the tools and languages"""
    print("🧪 [AGENT] Analyst: Identifying Tech Stack...")
    prompt = f"Identify the tech stack for these files: {state['file_tree']}"
    res = llm.invoke([SystemMessage(content=prompt)])
    return {"tech_stack": res.content}

def architect_node(state: ExplainerState):
    """Explains how the code actually works"""
    print("🏗️ [AGENT] Architect: Explaining Logic...")
    prompt = f"""
    Analyze this repo based on:
    Files: {state['file_tree']}
    README: {state['readme']}
    User Question: {state['messages'][-1].content}
    """
    res = llm.invoke([SystemMessage(content=prompt)] + state['messages'])
    return {"logic_breakdown": res.content, "messages": [res]}

# --- 3. THE SUPERVISOR (The Boss) ---

def supervisor_node(state: ExplainerState):
    """Decides if we need to scrape or just talk"""
    # Use .get() to safely access repo_url without crashing
    repo = state.get("repo_url", "Unknown Repository")
    print(f"👑 [SUPERVISOR] Checking progress for: {repo}")
    
    # 1. If README is missing -> Go to Scraper
    if not state.get("readme"):
        return {"next_step": "scraper"}
    
    # 2. If Tech Stack hasn't been identified -> Go to Analyst
    if not state.get("tech_stack"):
        return {"next_step": "analyst"}
        
    # 3. Everything is ready -> Go to Architect/Chat to answer the user
    return {"next_step": "architect"}

# --- 4. BUILD THE GRAPH ---

workflow = StateGraph(ExplainerState)

workflow.add_node("supervisor", supervisor_node)
workflow.add_node("scraper", scraper_node)
workflow.add_node("analyst", analyst_node)
workflow.add_node("architect", architect_node)

workflow.set_entry_point("supervisor")

workflow.add_conditional_edges(
    "supervisor",
    lambda x: x["next_step"],
    {
        "scraper": "scraper",
        "analyst": "analyst",
        "architect": "architect",
        "finish": END
    }
)

workflow.add_edge("scraper", "supervisor")
workflow.add_edge("analyst", "supervisor")
workflow.add_edge("architect", END) # End after architect answers

DB_PATH = "checkpoints.db"


## -----------------------------------------------------------------------------------
# THE STATE - We will use ONLY ONE KEY for the roadmap to avoid confusion
class AgentState(TypedDict):
    goal: str
    research: str
    github_repos: str
    roadmap: str  
    next_step: str

# --- 👑 THE SUPERVISOR ---
def supervisor_node(state: AgentState):
    print(f"\n[SUPERVISOR] Checking progress for: {state['goal']}")
    
    # 1. Check for Research (Theory/Docs)
    if not state.get("research"):
        print("[SUPERVISOR] -> Needs Research")
        return {"next_step": "researcher"}
    
    # 2. Check for GitHub Repos (Practical Projects)
    if not state.get("github_repos"):
        print("[SUPERVISOR] -> Needs GitHub Projects")
        return {"next_step": "github_projects"}
    
    # 3. Check for JSON Roadmap (Final Formatting)
    if not state.get("roadmap"):
        print("[SUPERVISOR] -> Needs Structuring")
        return {"next_step": "structurer"}
    
    # 4. If all data is present, finish
    print("[SUPERVISOR] -> Roadmap & Projects exist. Finishing.")
    return {"next_step": "finish"}

# --- 🔍 THE RESEARCHER ---
search_tool = TavilySearchResults(max_results=5)

def researcher_node(state: AgentState):
    print(f"--- [RESEARCHER] Deep-Diving into {state['goal']} ---")
    
    # 1. Search for 2026-relevant data
    search_query = f"complete roadmap and best free resources for {state['goal']} 2026"
    search_results = search_tool.invoke({"query": search_query})
    
    # 2. The High-Authority Prompt
    prompt = f"""
    You are a Senior Learning Architect. 
    RESEARCH DATA: {search_results}
    GOAL: {state['goal']}

    TASK:
    1. Identify exactly 5 core pillars of this subject.
    2. For each pillar, find 1 specific, working URL (Official Docs or GitHub) from the search data.
    3. Determine the 'Prerequisites' a student needs before starting.
    4. Suggest a 'Capstone Project' idea for Week 8.

    INSTRUCTION: Focus on 'Industry-Standard' tools. Do not suggest generic blog posts; 
    prioritize documentation, specialized courses, or reputable GitHub repos.
    """
    
    response = llm.invoke([SystemMessage(content=prompt)])
    return {"research": response.content}

# --- 🏗️ THE STRUCTURER ---
def structurer_node(state: AgentState):
    print("[AGENT] Structurer: Merging Research and GitHub Repos into 8-week JSON...")
    
    # We combine the theory research and the practical github links
    prompt = f"""
    You are a Senior Curriculum Architect. 
    GOAL: {state['goal']}
    THEORY RESEARCH: {state['research']}
    PRACTICAL GITHUB PROJECTS: {state['github_repos']}

    TASK:
    Create an intensive 8-week JSON roadmap. 
    - Use the Theory Research for the learning objectives in Weeks 1-6.
    - Integrate the Practical GitHub Projects specifically in Weeks 7 and 8 as Capstone/Hands-on assignments.

    STRICT RULES:
    1. Return ONLY raw JSON. No introductory text, no markdown code blocks (```json).
    2. Every week MUST have exactly 3 "tasks" and 2 "resources".
    3. Ensure exactly 8 weeks are generated.

    JSON SCHEMA:
    {{
      "goal": "{state['goal']}",
      "weeks": [
        {{
          "week": 1,
          "topic": "Topic Name",
          "tasks": ["Task 1", "Task 2", "Task 3"],
          "resources": [
            {{ "name": "Resource Name", "url": "URL" }},
            {{ "name": "Resource Name", "url": "URL" }}
          ]
        }}
      ]
    }}
    """
    
    response = llm.invoke([SystemMessage(content=prompt)])
    raw_content = response.content.strip()
    
    # Enhanced cleaning to ensure no text exists outside the JSON braces
    try:
        start_index = raw_content.find("{")
        end_index = raw_content.rfind("}") + 1
        if start_index == -1 or end_index == 0:
            raise ValueError("No JSON found in response")
            
        clean_json = raw_content[start_index:end_index]
        print(f"[DEBUG] JSON successfully structured. Length: {len(clean_json)}")
        
        return {"roadmap": clean_json}
    except Exception as e:
        print(f"[ERROR] Structurer failed to format JSON: {e}")
        # Fallback to an empty but valid structure to prevent graph crash
        return {"roadmap": '{"weeks": []}'}
    
# ---  THE PROJECT SUGGEST ---

def github_project_node(state: AgentState):
    print("--- [NODE] GitHub Project Hunter: Searching for repos ---")
    
    # We use the goal to find high-quality repos
    query = f"{state['goal']} projects stars:>500"
    url = f"https://api.github.com/search/repositories?q={query}&sort=stars&order=desc"
    
    try:
        response = requests.get(url).json()
        repos = response.get("items", [])[:3] # Get top 3
        
        repo_list = []
        for r in repos:
            repo_list.append(f"- {r['full_name']}: {r['html_url']} ({r['stargazers_count']} stars)")
        
        repo_str = "\n".join(repo_list)
        return {"github_repos": repo_str}
    except Exception as e:
        return {"github_repos": "No repos found."}

# 4. BUILD THE GRAPH
workflow = StateGraph(AgentState)

# Add all 4 nodes
workflow.add_node("supervisor", supervisor_node)
workflow.add_node("researcher", researcher_node)
workflow.add_node("github_projects", github_project_node) # The new worker
workflow.add_node("structurer", structurer_node)

workflow.set_entry_point("supervisor")

# The Supervisor's Decision Logic
workflow.add_conditional_edges(
    "supervisor",
    lambda x: x["next_step"],
    {
        "researcher": "researcher", 
        "github_projects": "github_projects", # Routing to new node
        "structurer": "structurer", 
        "finish": END
    }
)

# Every worker MUST report back to the supervisor after finishing their task
workflow.add_edge("researcher", "supervisor")
workflow.add_edge("github_projects", "supervisor")
workflow.add_edge("structurer", "supervisor")

agent_app = workflow.compile()

# 5. THE ENDPOINT
@app.post("/api/ai/generate")
async def generate_roadmap(data: dict, authorization: str = Header(None)):
    if not authorization: raise HTTPException(status_code=401)
    
    target = data.get("target", "Machine Learning")
    # INITIAL STATE: All keys must be initialized
    initial_state = {"goal": target, "research": "", "roadmap": "", "next_step": ""}
    
    # Run Graph
    final_state = agent_app.invoke(initial_state)
    
    # Extract the roadmap from the FINAL STATE
    raw_roadmap = final_state.get("roadmap", "")
    
    if not raw_roadmap:
        return {"error": "The graph finished but 'roadmap' key was empty!"}

    try:
        return {
            "goal": target,
            "final_roadmap": json.loads(raw_roadmap) # Converts string to real JSON
        }
    except Exception as e:
        return {"error": "JSON Parse Error", "raw": raw_roadmap}


@app.post("/api/ai/generate")
async def generate_roadmap(data: dict, authorization: str = Header(None)):
    # ... (Your existing graph execution code) ...
    
    final_state = agent_app.invoke(inputs)
    roadmap_json = json.loads(final_state["roadmap"])

    # SAVE TO DATABASE
    db = SessionLocal()
    new_roadmap = Roadmap(
        user_id="temporary_user_id", # We will extract real ID from JWT next!
        goal=target,
        roadmap_data=roadmap_json
    )
    db.add(new_roadmap)
    db.commit()
    db.close()

    return {"status": "Saved", "data": roadmap_json}

@app.post("/api/ai/explain")
async def explain_repo(data: dict):
    global repo_explainer_app
    if repo_explainer_app is None:
        raise HTTPException(status_code=503, detail="AI Service Initializing...")

    thread_id = data.get("thread_id", "default_user")
    config = {"configurable": {"thread_id": thread_id}}
    
    inputs = {"messages": [HumanMessage(content=data.get("message", "Explain this"))]}
    if data.get("url"):
        inputs["repo_url"] = data.get("url")

    result = repo_explainer_app.invoke(inputs, config)
    return {
        "response": result["messages"][-1].content,
        "thread_id": thread_id
    }


if __name__ == "__main__":
    DB_PATH = "checkpoints.db"
    
    print("🚀 Connecting to SQLite Memory...")
    with SqliteSaver.from_conn_string(DB_PATH) as memory:
        
        # 3. Officially compile the app USING the open memory
        repo_explainer_app = workflow.compile(checkpointer=memory)
        
        print("✅ PathPulse: Persistent Memory Active")
        import uvicorn
        # We run uvicorn INSIDE the 'with' block so 'memory' stays open
        uvicorn.run(app, host="0.0.0.0", port=8000)