from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import subprocess
import os
import json
import asyncio
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import glob



app = FastAPI(title="Script Manager API", version="1.0.0")

# Enable CORS for your React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Add your server IP here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Base directories
BASE_OUTPUT_DIR = "/opt/telephony-monitoring/GUI/outputs/users"
SCRIPT_BASE_DIR = "/opt/telephony-monitoring"

# Script configuration - pointing to your actual scripts
# Configuration paths
CONFIG_BASE_DIR = "/opt/telephony-monitoring/GUI/configs"
CATEGORIES_CONFIG = f"{CONFIG_BASE_DIR}/categories/categories.json"
SCRIPTS_CONFIG_DIR = f"{CONFIG_BASE_DIR}/scripts"

def load_categories():
    """Load category configuration from JSON file."""
    try:
        if os.path.exists(CATEGORIES_CONFIG):
            with open(CATEGORIES_CONFIG, 'r') as f:
                data = json.load(f)
                return data.get('categories', [])
        else:
            print(f"Categories config not found: {CATEGORIES_CONFIG}")
            return []
    except Exception as e:
        print(f"Error loading categories: {e}")
        return []

def load_scripts():
    """Load all script configurations from JSON files."""
    scripts = {}
    
    try:
        # Get all script config files
        config_files = glob.glob(f"{SCRIPTS_CONFIG_DIR}/*.json")
        
        for config_file in config_files:
            try:
                with open(config_file, 'r') as f:
                    data = json.load(f)
                    category = data.get('category')
                    script_list = data.get('scripts', [])
                    
                    for script in script_list:
                        if script.get('enabled', True):  # Only load enabled scripts
                            script_id = script['id']
                            
                            # Convert to the format expected by the existing API
                            scripts[script_id] = {
                                "name": script['name'],
                                "path": script['path'],
                                "interpreter": script['interpreter'],
                                "output_subdir": script['output_subdir'],
                                "description": script['description'],
                                "category": category.replace('-', ' ').title(),  # Convert "data-collection" to "Data Collection"
                                "file": script['file'],
                                "auto_run": script.get('auto_run', False),
                                "inputs": script.get('inputs', [])
                            }
                            
                            # Handle inputs configuration file path (legacy support)
                            if script.get('inputs'):
                                # Create a temporary inputs config file if needed
                                inputs_config_path = f"{CONFIG_BASE_DIR}/inputs/script_{script_id}_input.json"
                                if not os.path.exists(inputs_config_path):
                                    os.makedirs(os.path.dirname(inputs_config_path), exist_ok=True)
                                    with open(inputs_config_path, 'w') as input_file:
                                        json.dump(script['inputs'], input_file, indent=2)
                                scripts[script_id]["inputs_config"] = inputs_config_path
                                        
            except Exception as e:
                print(f"Error loading script config {config_file}: {e}")
                continue
                
    except Exception as e:
        print(f"Error loading scripts: {e}")
    
    return scripts

# Load configurations at startup
SCRIPT_CONFIG = load_scripts()
CATEGORIES_CONFIG_DATA = load_categories()

print(f"Loaded {len(SCRIPT_CONFIG)} scripts across categories")
for script_id, config in SCRIPT_CONFIG.items():
    print(f"  Script {script_id}: {config['name']} ({config['category']})")

# Pydantic models
class ScriptRunRequest(BaseModel):
    user_id: str
    requester: str = ""
    output_prefix: str = ""
    inputs: Optional[Dict[str, Any]] = None

class ScriptRunResponse(BaseModel):
    status: str
    message: str
    script_id: int
    output_dir: str
    files: List[Dict[str, Any]]
    execution_log: str

class FileInfo(BaseModel):
    name: str
    path: str
    size: int
    modified: str
    type: str

# Store running processes
running_processes: Dict[str, subprocess.Popen] = {}

def get_user_output_dir(user_id: str, script_id: int) -> str:
    """Get the output directory for a user and script."""
    script = SCRIPT_CONFIG.get(script_id)
    if not script:
        raise HTTPException(status_code=404, detail="Script not found")
    
    output_dir = os.path.join(BASE_OUTPUT_DIR, user_id, script["output_subdir"])
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    return output_dir

def list_files_in_directory(directory: str) -> List[Dict[str, Any]]:
    """List all files in a directory with metadata."""
    files = []
    if not os.path.exists(directory):
        return files
    
    for file_path in glob.glob(os.path.join(directory, "*")):
        if os.path.isfile(file_path):
            stat = os.stat(file_path)
            files.append({
                "name": os.path.basename(file_path),
                "path": file_path,
                "size": stat.st_size,
                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                "type": get_file_type(file_path)
            })
    
    # Sort by modification time, newest first
    files.sort(key=lambda x: x["modified"], reverse=True)
    return files

def get_file_type(file_path: str) -> str:
    """Determine file type based on extension."""
    ext = os.path.splitext(file_path)[1].lower()
    type_map = {
        '.csv': 'CSV',
        '.txt': 'Text',
        '.log': 'Log',
        '.json': 'JSON',
        '.xml': 'XML',
        '.pdf': 'PDF',
        '.xlsx': 'Excel',
        '.zip': 'Archive'
    }
    return type_map.get(ext, 'Unknown')

@app.get("/api/scripts")
async def get_scripts():
    """Get list of available scripts."""
    scripts = []
    
    # Reload scripts for fresh data
    current_scripts = load_scripts()
    
    for script_id, config in current_scripts.items():
        inputs = []
        if config.get("inputs_config") and os.path.exists(config["inputs_config"]):
            try:
                with open(config["inputs_config"]) as f:
                    inputs = json.load(f)
            except Exception as e:
                print(f"Failed to load inputs_config for script {script_id}: {e}")
        elif config.get("inputs"):
            # Direct inputs from config
            inputs = config["inputs"]
            
        scripts.append({
            "id": script_id,
            "name": config["name"],
            "file": config["file"],
            "description": config["description"],
            "category": config["category"],
            "inputs": inputs,
            "auto_run": config.get("auto_run", False)
        })
    
    return {"scripts": scripts}
@app.post("/api/scripts/{script_id}/run")
async def run_script(script_id: int, request: ScriptRunRequest, background_tasks: BackgroundTasks):
    """Execute a script in the background."""
    if script_id not in SCRIPT_CONFIG:
        raise HTTPException(status_code=404, detail="Script not found")
    
    script = SCRIPT_CONFIG[script_id]
    process_key = f"{request.user_id}_{script_id}_{datetime.now().timestamp()}"
    
    # Check if script file exists
    if not os.path.exists(script["path"]):
        raise HTTPException(status_code=404, detail=f"Script file not found: {script['path']}")
    
    # Get output directory
    output_dir = get_user_output_dir(request.user_id, script_id)
    
    # Prepare environment variables
    env = os.environ.copy()
    env.update({
        "OUTPUT_USER": request.user_id,
        "REQUESTER": request.requester or request.user_id,
        "OUTPUT_PREFIX": request.output_prefix or script["name"].replace(" ", "_"),
        "SCRIPT_ID": str(script_id),
        "OUTPUT_DIR": output_dir
    })
    
    # Add script inputs as environment variables
    if hasattr(request, 'inputs') and request.inputs:
        print(f"Script {script_id} inputs: {request.inputs}")
        for key, value in request.inputs.items():
            print(f"Setting env var {key}={value}")
            env[key] = str(value)
    
    try:
        # Execute script
        process = subprocess.Popen([
            script["interpreter"], 
            script["path"]
        ], 
        env=env, 
        stdout=subprocess.PIPE, 
        stderr=subprocess.PIPE, 
        text=True,
        cwd=os.path.dirname(script["path"])
        )
        
        # Store process for potential cancellation
        running_processes[process_key] = process
        
        # Wait for completion
        stdout, stderr = process.communicate()
        
        # Remove from running processes
        running_processes.pop(process_key, None)
        
        # Get generated files
        files = list_files_in_directory(output_dir)
        
        return ScriptRunResponse(
            status="success" if process.returncode == 0 else "error",
            message=f"Script executed {'successfully' if process.returncode == 0 else 'with errors'}",
            script_id=script_id,
            output_dir=output_dir,
            files=files,
            execution_log=f"STDOUT:\n{stdout}\n\nSTDERR:\n{stderr}"
        )
        
    except Exception as e:
        running_processes.pop(process_key, None)
        raise HTTPException(status_code=500, detail=f"Script execution failed: {str(e)}")

@app.post("/api/scripts/{script_id}/stop")
async def stop_script(script_id: int, user_id: str):
    """Stop a running script."""
    # Find and terminate running processes for this user and script
    keys_to_remove = []
    for key, process in running_processes.items():
        if key.startswith(f"{user_id}_{script_id}_"):
            try:
                process.terminate()
                keys_to_remove.append(key)
            except:
                pass
    
    for key in keys_to_remove:
        running_processes.pop(key, None)
    
    return {"status": "stopped", "message": "Script execution stopped"}
@app.get("/api/logs/{user_id}")
async def get_user_logs(user_id: str, hours: int = 24):
    """Get execution logs for a user from the last X hours."""
    try:
        # This is a simple file-based log storage
        log_file = f"/opt/telephony-monitoring/GUI/outputs/users/{user_id}/execution_logs.json"
        
        if not os.path.exists(log_file):
            return {"logs": {}}
        
        with open(log_file, 'r') as f:
            all_logs = json.load(f)
        
        # Filter logs by time
        cutoff_time = datetime.now() - timedelta(hours=hours)
        filtered_logs = {}
        
        for script_id, logs in all_logs.items():
            recent_logs = []
            for log in logs:
                try:
                    log_time = datetime.fromisoformat(log['timestamp'].replace('Z', '+00:00'))
                    if log_time >= cutoff_time:
                        recent_logs.append(log)
                except:
                    # If timestamp parsing fails, include the log anyway
                    recent_logs.append(log)
            if recent_logs:
                filtered_logs[script_id] = recent_logs
        
        return {"logs": filtered_logs}
        
    except Exception as e:
        print(f"Error fetching logs: {e}")
        return {"logs": {}}

@app.post("/api/logs/{user_id}")
async def save_user_log(user_id: str, log_data: dict):
    """Save an execution log for a user."""
    try:
        log_dir = f"/opt/telephony-monitoring/GUI/outputs/users/{user_id}"
        os.makedirs(log_dir, exist_ok=True)
        log_file = f"{log_dir}/execution_logs.json"
        
        # Load existing logs
        if os.path.exists(log_file):
            with open(log_file, 'r') as f:
                all_logs = json.load(f)
        else:
            all_logs = {}
        
        script_id = str(log_data['script_id'])
        if script_id not in all_logs:
            all_logs[script_id] = []
        
        # Add new log entry
        all_logs[script_id].append({
            'timestamp': datetime.now().isoformat(),
            'status': log_data['status'],
            'message': log_data['message'],
            'files': log_data.get('files', []),
            'output': log_data.get('output', '')
        })
        
        # Keep only last 50 logs per script to prevent file growth
        all_logs[script_id] = all_logs[script_id][-50:]
        
        # Save back to file
        with open(log_file, 'w') as f:
            json.dump(all_logs, f, indent=2)
        
        return {"status": "saved"}
        
    except Exception as e:
        print(f"Error saving log: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save log: {str(e)}")
@app.get("/api/files/{user_id}")
async def get_user_files(user_id: str, script_id: int = None):
    """Get list of files for a user, optionally filtered by script."""
    if script_id:
        # Get files for specific script
        output_dir = get_user_output_dir(user_id, script_id)
        files = list_files_in_directory(output_dir)
    else:
        # Get all files for user
        user_dir = os.path.join(BASE_OUTPUT_DIR, user_id)
        files = []
        if os.path.exists(user_dir):
            for root, dirs, filenames in os.walk(user_dir):
                for filename in filenames:
                    file_path = os.path.join(root, filename)
                    stat = os.stat(file_path)
                    files.append({
                        "name": filename,
                        "path": file_path,
                        "size": stat.st_size,
                        "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                        "type": get_file_type(file_path),
                        "relative_path": os.path.relpath(file_path, user_dir)
                    })
        files.sort(key=lambda x: x["modified"], reverse=True)
    
    return {"files": files}

@app.get("/api/files/{user_id}/download")
async def download_file(user_id: str, file_path: str):
    """Download a file for a user."""
    # Security: Ensure file is within user's directory
    user_base_dir = os.path.join(BASE_OUTPUT_DIR, user_id)
    full_file_path = os.path.join(user_base_dir, file_path)
    
    # Resolve path and check if it's within user directory
    try:
        resolved_path = os.path.realpath(full_file_path)
        resolved_base = os.path.realpath(user_base_dir)
        
        if not resolved_path.startswith(resolved_base):
            raise HTTPException(status_code=403, detail="Access denied")
        
        if not os.path.exists(resolved_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        return FileResponse(
            path=resolved_path,
            filename=os.path.basename(resolved_path),
            media_type='application/octet-stream'
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")

@app.get("/api/scripts/{script_id}/status")
async def get_script_status(script_id: int, user_id: str):
    """Check if a script is currently running for a user."""
    running = any(key.startswith(f"{user_id}_{script_id}_") for key in running_processes.keys())
    
    # Also get recent files
    try:
        output_dir = get_user_output_dir(user_id, script_id)
        files = list_files_in_directory(output_dir)
    except:
        files = []
    
    return {
        "running": running,
        "recent_files": files[:5]  # Last 5 files
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/categories")
async def get_categories():
    """Get list of available categories."""
    categories = []
    
    # Reload categories from file for fresh data
    category_data = load_categories()
    
    for category in category_data:
        if category.get('enabled', True):
            # Count scripts in this category
            script_count = sum(1 for script in SCRIPT_CONFIG.values() 
                             if script['category'].lower().replace(' ', '-') == category['id'])
            
            categories.append({
                "id": category['id'],
                "name": category['name'],
                "description": category['description'],
                "icon": category['icon'],
                "color": category['color'],
                "script_count": script_count,
                "order": category.get('order', 999)
            })
    
    # Sort by order
    categories.sort(key=lambda x: x['order'])
    
    return {"categories": categories}

@app.post("/api/reload-config")
async def reload_configuration():
    """Reload script and category configurations from files."""
    global SCRIPT_CONFIG, CATEGORIES_CONFIG_DATA
    
    try:
        SCRIPT_CONFIG = load_scripts()
        CATEGORIES_CONFIG_DATA = load_categories()
        
        return {
            "status": "success",
            "message": f"Reloaded {len(SCRIPT_CONFIG)} scripts and {len(CATEGORIES_CONFIG_DATA)} categories",
            "scripts": len(SCRIPT_CONFIG),
            "categories": len(CATEGORIES_CONFIG_DATA)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reload configuration: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)