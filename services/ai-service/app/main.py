import os
import json
import re
import requests
from typing import List, TypedDict, Annotated
from fastapi import FastAPI, Header, HTTPException
from dotenv import load_dotenv
# LangChain / LangGraph Imports
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, BaseMessage, HumanMessage
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.sqlite import SqliteSaver
from langchain_community.tools.tavily_search import TavilySearchResults

load_dotenv(dotenv_path="../../.env")
print(f"DEBUG: GITHUB_TOKEN loaded? {'Yes' if os.getenv('GITHUB_TOKEN') else 'No'}")

app = FastAPI(title="PathPulse Dual Engine")
repo_explainer_app = None  # Global placeholder

# LLM Setup
llm = ChatGroq(
    temperature=0, 
    model_name="llama-3.3-70b-versatile", 
    groq_api_key=os.getenv("GROQ_API_KEY")
)

# ===================================================================================
# ENGINE 1: REPO EXPLAINER (With Persistence/Memory)
# ===================================================================================

class ExplainerState(TypedDict):
    repo_url: str
    readme: str
    file_tree: List[str]
    tech_stack: str
    logic_breakdown: str
    messages: Annotated[list[BaseMessage], add_messages] 
    next_step: str
    is_scraped: bool 

def repo_supervisor(state: ExplainerState):
    repo = state.get("repo_url", "Unknown")
    # ✅ LOGIC: If the last message is from the AI, we are DONE. Stop the loop.
    if state.get("messages") and not isinstance(state["messages"][-1], HumanMessage):
        print(f"🏁 [TERMINATING] Analysis complete for: {repo}")
        return {"next_step": "finish"}

    print(f"👑 [REPO-SUPERVISOR] Checking: {repo}")
    
    if not state.get("is_scraped"):
        return {"next_step": "scraper"}
        
    if not state.get("tech_stack"):
        return {"next_step": "analyst"}
        
    return {"next_step": "architect"}

def analyst_node(state: ExplainerState):
    print("🧪 [AGENT] Analyst: Identifying Tech Stack...")
    prompt = f"Identify the tech stack for these files: {state['file_tree']}"
    res = llm.invoke([SystemMessage(content=prompt)])
    # Return updates to state
    return {"tech_stack": res.content}

def architect_node(state: ExplainerState):
    print("🏗️ [AGENT] Architect: Thinking...")
    
    system_instructions = (
        "You are an Expert Code Architect. You have analyzed the repository's "
        "file structure and README. Use this context to answer the user's "
        "questions accurately. If the user asks a follow-up, refer back to "
        "previous parts of the conversation when helpful."
    )
    
    repo_context = (
        f"CONTEXT FOR THIS REPOSITORY:\n"
        f"File Tree: {state['file_tree']}\n"
        f"README Snippet: {state['readme']}\n"
        f"Tech Stack: {state['tech_stack']}"
    )

    full_prompt = [
        SystemMessage(content=system_instructions),
        SystemMessage(content=repo_context)
    ] + state['messages']

    res = llm.invoke(full_prompt)
    
    # Return the response and the message object to append to history
    return {"logic_breakdown": res.content, 
        "messages": [res], # This appends the AI response to history
        "next_step": "finish" # Force a hint to the supervisor
        }

def scraper_node(state):
    print("🚀 [AGENT] Scraper: Fetching Data...")
    
    # ✅ FIX: Use .get() and provide a fallback to prevent KeyError
    repo_url = state.get("repo_url")
    
    if not repo_url:
        # If repo_url is missing, we can't scrape. 
        # Return a flag to tell the supervisor to stop or move on.
        print("❌ Error: repo_url missing from state")
        return {"is_scraped": True, "error": "Missing URL"}

    repo_url = repo_url.rstrip("/")
    repo_path = repo_url.replace("https://github.com/", "").strip("/")
    
    token = os.getenv('GITHUB_TOKEN')
    headers = {"Authorization": f"token {token}"} if token else {}
    
    files_res = requests.get(f"https://api.github.com/repos/{repo_path}/contents", headers=headers)
    files = [f["name"] for f in files_res.json()] if files_res.status_code == 200 else []
    
    readme_res = requests.get(f"https://api.github.com/repos/{repo_path}/readme", 
                              headers={"Accept": "application/vnd.github.v3.raw", **headers})
    
    readme_content = readme_res.text[:3000] if readme_res.status_code == 200 else ""
    
    return {"file_tree": files, "readme": readme_content, "is_scraped": True}

# Build Repo Graph
repo_flow = StateGraph(ExplainerState)
repo_flow.add_node("supervisor", repo_supervisor)
repo_flow.add_node("scraper", scraper_node)
repo_flow.add_node("analyst", analyst_node)
repo_flow.add_node("architect", architect_node)

repo_flow.set_entry_point("supervisor")

# Conditional edges from supervisor
repo_flow.add_conditional_edges(
    "supervisor", 
    lambda x: x["next_step"], 
    {
        "scraper": "scraper", 
        "analyst": "analyst", 
        "architect": "architect", 
        "finish": END
    }
)

# Core flow edges
repo_flow.add_edge("scraper", "supervisor")
repo_flow.add_edge("analyst", "supervisor")
repo_flow.add_edge("architect", "supervisor") # architect now goes to supervisor to check for "finish"
# ===================================================================================
# ENGINE 2: ROADMAP GENERATOR (Stateless Logic)
# ===================================================================================

class AgentState(TypedDict):
    goal: str
    research: str
    github_repos: str
    roadmap: str  
    next_step: str

# FIXED: Renamed to roadmap_supervisor to avoid clash
def roadmap_supervisor(state: AgentState):
    print(f"\n[ROADMAP-SUPERVISOR] Checking progress for: {state['goal']}")
    if not state.get("research"): return {"next_step": "researcher"}
    if not state.get("github_repos"): return {"next_step": "github_projects"}
    if not state.get("roadmap"): return {"next_step": "structurer"}
    return {"next_step": "finish"}

search_tool = TavilySearchResults(max_results=5)

def researcher_node(state: AgentState):
    print(f"--- [RESEARCHER] Deep-Diving into {state['goal']} ---")
    search_query = f"complete roadmap for {state['goal']} 2026"
    search_results = search_tool.invoke({"query": search_query})
    prompt = f"Create learning pillars for {state['goal']} based on: {search_results}"
    response = llm.invoke([SystemMessage(content=prompt)])
    return {"research": response.content}

def github_project_node(state: AgentState):
    print("--- [NODE] GitHub Project Hunter ---")
    query = f"{state['goal']} projects stars:>500"
    url = f"https://api.github.com/search/repositories?q={query}&sort=stars&order=desc"
    try:
        response = requests.get(url).json()
        repos = [f"- {r['full_name']}: {r['html_url']}" for r in response.get("items", [])[:3]]
        return {"github_repos": "\n".join(repos)}
    except:
        return {"github_repos": "No repos found."}

import json
import re
from langchain_core.messages import SystemMessage, HumanMessage

def structurer_node(state: AgentState):
    print("[AGENT] Structurer: Creating JSON...")
    
    system_prompt = (
        "You are a strict JSON generator. Your output must be ONLY a valid JSON object. "
        "Do NOT include any introductory text, markdown code blocks (```json), or summary text. "
        "The response must start with '{' and end with '}'.\n\n"
        "Required Structure:\n"
        "{\n"
        "  'weeks': [\n"
        "    { 'week': 1, 'topic': '...', 'subtopics': [], 'resources': [], 'projects': [] }\n"
        "  ]\n"
        "}"
    )
    
    human_content = (
        f"Create an 8-week JSON roadmap for the goal: {state['goal']}.\n"
        f"Research Data: {state['research']}\n"
        f"GitHub Repos: {state['github_repos']}"
    )

    # 1. Invoke LLM with strict instructions
    response = llm.invoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=human_content)
    ])
    
    raw_content = response.content.strip()

    # 2. Extract and Parse JSON
    try:
        # This regex finds the first { and last } just in case the LLM still adds text
        match = re.search(r"\{.*\}", raw_content, re.DOTALL)
        if match:
            json_str = match.group()
            # Convert string to a real Python dictionary
            roadmap_dict = json.loads(json_str)
            return {"roadmap": roadmap_dict}
        else:
            raise ValueError("No JSON block found in LLM response")
            
    except Exception as e:
        print(f"❌ Structurer Error: {str(e)}")
        # Fallback: if it fails, return a basic structure so the app doesn't crash
        return {"roadmap": {"error": "JSON Generation Failed", "raw": raw_content}}

# Build Roadmap Graph
road_flow = StateGraph(AgentState)
road_flow.add_node("supervisor", roadmap_supervisor)
road_flow.add_node("researcher", researcher_node)
road_flow.add_node("github_projects", github_project_node)
road_flow.add_node("structurer", structurer_node)
road_flow.set_entry_point("supervisor")
road_flow.add_conditional_edges("supervisor", lambda x: x["next_step"], {"researcher": "researcher", "github_projects": "github_projects", "structurer": "structurer", "finish": END})
road_flow.add_edge("researcher", "supervisor")
road_flow.add_edge("github_projects", "supervisor")
road_flow.add_edge("structurer", "supervisor")

agent_app = road_flow.compile()

# ===================================================================================
# ENDPOINTS
# ===================================================================================

@app.post("/api/ai/generate")
async def generate_roadmap(data: dict):
    target = data.get("target", "Machine Learning")
    initial_state = {"goal": target, "research": "", "github_repos": "", "roadmap": "", "next_step": ""}
    final_state = agent_app.invoke(initial_state)
    return {"goal": target, "roadmap": final_state.get("roadmap")}

@app.post("/api/ai/explain")
async def explain_repo(data: dict):
    repo_url = data.get("url")
    user_id = data.get("user_id", "default")
    user_message = data.get("message")
    
    if not repo_url:
        return {"error": "No URL provided"}

    import hashlib
    url_hash = hashlib.md5(repo_url.encode()).hexdigest()[:10]
    thread_id = f"repo_{url_hash}_{user_id}"
    
    config = {"configurable": {"thread_id": thread_id}, "recursion_limit": 20}
    
    # ✅ FIX: Always include repo_url in the inputs for every call.
    # This ensures it is always available in the 'state' variable.
    if not user_message or user_message == "Analyze this repository.":
        inputs = {
            "repo_url": repo_url, 
            "messages": [HumanMessage(content="Initial Scan")]
        }
    else:
        inputs = {
            "repo_url": repo_url, # Pass it here too!
            "messages": [HumanMessage(content=user_message)]
        }

    try:
        result = repo_explainer_app.invoke(inputs, config)
        # Final safety check on the result
        output_msg = result.get("messages", [])[-1].content if result.get("messages") else "No response generated."
        return {"response": output_msg}
    except Exception as e:
        print(f"🔥 Graph Execution Error: {e}")
        return {"response": "System error during analysis. Please try again."}
# ===================================================================================
# MAIN RUNNER
# ===================================================================================

if __name__ == "__main__":
    DB_PATH = "checkpoints.db"
    print("🚀 Connecting to SQLite Memory...")
    with SqliteSaver.from_conn_string(DB_PATH) as memory:
        # We only need persistence for the Repo Explainer
        repo_explainer_app = repo_flow.compile(checkpointer=memory)
        
        print("✅ PathPulse: Persistent Memory Active")
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=8000)