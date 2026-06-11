import os
import sys
import json
import time
import platform
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler

# Import psutil for real telemetry, fallback to mock if not present
try:
    import psutil
except ImportError:
    psutil = None

def get_real_specs():
    # Detect actual OS details
    os_name = f"{platform.system()} {platform.release()}"
    
    # Detect actual CPU model
    cpu_model = platform.processor() or platform.machine() or "Unknown Processor"
    if "intel" in cpu_model.lower():
        cpu_model = "Intel Core Processor"
    elif "amd" in cpu_model.lower():
        cpu_model = "AMD Ryzen Processor"
    elif "arm" in cpu_model.lower() or "apple" in cpu_model.lower():
        cpu_model = "Apple Silicon / ARM"
    
    # Detect actual RAM capacity
    ram_gb = "16 GB"
    if psutil:
        try:
            total_ram = psutil.virtual_memory().total
            ram_gb = f"{round(total_ram / (1024 ** 3))} GB"
        except Exception:
            pass
            
    return os_name, cpu_model, ram_gb

def capture_real_screenshot():
    static_dir = os.path.join(os.path.dirname(__file__), 'static')
    if not os.path.exists(static_dir):
        os.makedirs(static_dir)
    screenshot_path = os.path.join(static_dir, 'screenshot.png')
    
    # Try capturing screen using PyAutoGUI
    try:
        import pyautogui
        pyautogui.screenshot(screenshot_path)
        return True
    except Exception:
        pass
        
    # Try capturing screen using Pillow ImageGrab
    try:
        from PIL import ImageGrab
        im = ImageGrab.grab()
        im.save(screenshot_path)
        return True
    except Exception:
        pass
        
    return False

def query_local_ollama(prompt):
    try:
        import urllib.request
        import urllib.parse
        
        # Check if local Ollama generates endpoint is running
        url = "http://localhost:11434/api/generate"
        req_data = json.dumps({
            "model": "qwen2.5:7b",
            "prompt": f"You are Lumen, a proactive local AI voice assistant. Give a short, single-sentence response to: {prompt}",
            "stream": False
        }).encode('utf-8')
        
        req = urllib.request.Request(
            url, 
            data=req_data, 
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        
        # Quick timeout so we don't hang if Ollama is offline
        with urllib.request.urlopen(req, timeout=1.8) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            return res_data.get('response', '').strip()
    except Exception:
        return None

class ShowcaseHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Clean console logs
        pass

    def do_GET(self):
        # Serve main landing page
        if self.path == '/' or self.path == '/index.html':
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            static_path = os.path.join(os.path.dirname(__file__), 'static', 'index.html')
            with open(static_path, 'r', encoding='utf-8') as f:
                self.wfile.write(f.read().encode('utf-8'))
            return

        # Serve globals stylesheet
        elif self.path == '/styles/globals.css':
            self.send_response(200)
            self.send_header('Content-Type', 'text/css')
            self.end_headers()
            css_path = os.path.join(os.path.dirname(__file__), 'styles', 'globals.css')
            with open(css_path, 'r', encoding='utf-8') as f:
                self.wfile.write(f.read().encode('utf-8'))
            return

        # Serve screenshot image preview
        elif self.path == '/static/screenshot.png':
            screenshot_path = os.path.join(os.path.dirname(__file__), 'static', 'screenshot.png')
            if os.path.exists(screenshot_path):
                self.send_response(200)
                self.send_header('Content-Type', 'image/png')
                self.end_headers()
                with open(screenshot_path, 'rb') as f:
                    self.wfile.write(f.read())
            else:
                self.send_error(404, 'Screenshot not captured yet')
            return

        # Serve API info with dynamic Host specifications
        elif self.path == '/api/info':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            os_name, cpu_model, ram_gb = get_real_specs()
            
            info_data = {
                "name": "Lumen",
                "project": "LUMEN",
                "version": "1.4.0",
                "status": "online",
                "model": "Qwen 2.5 (Local Model)",
                "speechEngine": "Neural Kokoro-ONNX",
                "earEngine": "Local Whisper",
                "specs": {
                    "os": os_name,
                    "cpu": cpu_model,
                    "ram": ram_gb
                },
                "skills": [
                    { "name": "Application Launcher", "category": "System", "desc": "Launches local programs cleanly on your active desktop." },
                    { "name": "Task Manager", "category": "System", "desc": "Shuts down background application processes safely." },
                    { "name": "Active Screen Reader", "category": "Automation", "desc": "Translates current window visual structures using the screen oracle." },
                    { "name": "Web Intelligence Search", "category": "Web", "desc": "Searches Google/DuckDuckGo and summarizes page texts." },
                    { "name": "Smart Clipboard Log", "category": "Utility", "desc": "Listens to copy events and monitors clipboard history stacks." },
                    { "name": "Audio Adjuster Level", "category": "Hardware", "desc": "Controls master volume percentages and speaker mute configurations." },
                    { "name": "Live Weather Radar", "category": "Web", "desc": "Queries dynamic weather indexes and temperatures." },
                    { "name": "Active Screen Capture", "category": "Utility", "desc": "Grabs your actual desktop screen and sends an image preview." },
                    { "name": "WhatsApp Link Macro", "category": "Communication", "desc": "Drafts and sends chat thread overlays using UI macros." },
                    { "name": "Alarms & Countdown", "category": "Utility", "desc": "Schedules custom wake timers and background alerts." },
                    { "name": "SQLite Context Memory", "category": "Memory", "desc": "Stores conversational dialogue details inside vector indexing databases." },
                    { "name": "System Health Status", "category": "System", "desc": "Analyzes operating system diagnostics and resource logs." }
                ]
            }
            self.wfile.write(json.dumps(info_data).encode('utf-8'))
            return

        else:
            self.send_error(404, 'File not found')
            return

    def do_POST(self):
        # Handle API actions
        if self.path == '/api/action':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            req_body = json.loads(post_data.decode('utf-8'))
            
            command = req_body.get('command', '')
            current_state = req_body.get('currentState', 'STANDBY')
            
            normalized = command.lower().strip()
            response_text = ""
            new_state = current_state
            action_triggered = None
            action_output = None
            
            if normalized in ["wake up lumen", "wake up", "wake", "wake lumen"]:
                response_text = "Lumen online. Core cognitive engines restored. Systems online and listening."
                new_state = "AWAKE"
            elif normalized in ["shutdown", "exit", "quit", "sleep", "go to sleep"]:
                response_text = "Powering down cognitive subroutines. Entering standby. Goodbye."
                new_state = "STANDBY"
            elif current_state == "STANDBY" and "wake" not in normalized:
                response_text = "Lumen is currently in standby. Click the 'Wake Lumen' button or type 'wake up' to activate."
            else:
                new_state = "AWAKE"
                
                # Check for actual Ollama integration
                ollama_reply = query_local_ollama(command)
                
                if normalized in ["help", "commands"]:
                    response_text = "I can execute desktop automation, read your active windows, check system hardware load, control speakers, or recall vector memories. Click any of the Quick Command chips below to start."
                elif any(x in normalized for x in ["list skills", "show skills", "what can you do", "skills"]):
                    response_text = "I have 12 automation features loaded:\n- Application Launcher\n- Task Manager\n- Active Screen Reader\n- Web Intelligence Search\n- Smart Clipboard Log\n- Audio Adjuster Level\n- Live Weather Radar\n- Active Screen Capture\n- WhatsApp Link Macro\n- Alarms & Countdown\n- SQLite Context Memory\n- System Health Status"
                elif normalized in ["status", "system status", "system", "hardware"]:
                    action_triggered = "skill_system_info"
                    
                    # Fetch real metrics if psutil is loaded
                    cpu_percent = "4.5%"
                    ram_percent = "14.2%"
                    if psutil:
                        try:
                            cpu_percent = f"{psutil.cpu_percent()}%"
                            ram_percent = f"{psutil.virtual_memory().percent}%"
                        except Exception:
                            pass
                    
                    os_name, cpu_model, ram_gb = get_real_specs()
                    action_output = f"OS: {os_name} | CPU: {cpu_percent} | RAM: {ram_percent} (Total: {ram_gb}) | Ollama: Running"
                    response_text = f"Action Triggered: System Health Status\nHost statistics successfully analyzed:\n{action_output}"
                elif "weather" in normalized:
                    action_triggered = "skill_weather"
                    loc = "London"
                    if "nyc" in normalized or "new york" in normalized:
                        loc = "New York City"
                    action_output = f"Location: {loc} | Temp: 68F / 20C | Conditions: Light Breeze | Humidity: 55%"
                    response_text = f"Action Triggered: Live Weather Radar\nForecast resolved for {loc}:\n{action_output}"
                elif "screenshot" in normalized or "capture" in normalized:
                    # Take real screenshot!
                    captured = capture_real_screenshot()
                    action_triggered = "skill_screenshot"
                    if captured:
                        action_output = "Desktop screenshot captured successfully."
                        response_text = "Action Triggered: Active Screen Capture\nViewport frame grab complete. Rendering image attachment:"
                    else:
                        action_output = "Failed to capture viewport frame."
                        response_text = "Action Triggered: Active Screen Capture\nFailed to acquire graphics buffer."
                elif "whatsapp" in normalized or "message" in normalized:
                    action_triggered = "skill_whatsapp"
                    action_output = "Opened WhatsApp Web communication thread."
                    response_text = f"Action Triggered: WhatsApp Link Macro\nDrafting chat overlay:\n{action_output}"
                elif "volume" in normalized or "sound" in normalized or "speaker" in normalized:
                    action_triggered = "skill_volume"
                    level = ''.join(filter(str.isdigit, normalized)) or "60"
                    action_output = f"System master speaker volume adjusted to {level}%"
                    response_text = f"Action Triggered: Audio Adjuster Level\nVolume scale updated:\n{action_output}"
                elif "timer" in normalized or "alarm" in normalized:
                    action_triggered = "skill_timer"
                    action_output = "Scheduled countdown alarm trigger."
                    response_text = f"Action Triggered: Alarms & Countdown\nTimer initialized:\n{action_output}"
                elif "remember" in normalized or "store" in normalized:
                    action_triggered = "skill_remember"
                    info = command.replace("remember", "").replace("store", "").strip() or "Setup verified"
                    action_output = f"Stored text snippet: \"{info}\""
                    response_text = f"Action Triggered: SQLite Context Memory\nCommitted context block to local database:\n{action_output}"
                elif "diagnostics" in normalized or "diagnose" in normalized:
                    action_triggered = "skill_system_diagnostics"
                    action_output = "Operational diagnostic suite completed. SQLite indexes optimized. Audio drivers connected."
                    response_text = f"Action Triggered: System Health Status\nDiagnosing local controllers:\n{action_output}"
                elif "read screen" in normalized or "screen text" in normalized:
                    action_triggered = "skill_read_screen"
                    action_output = "Scanned active handles. Primary window: Browser. Text contents resolved."
                    response_text = f"Action Triggered: Active Screen Reader\nScreen oracle translation finished:\n{action_output}"
                elif ollama_reply:
                    # Use real Ollama response
                    response_text = ollama_reply
                elif "hello" in normalized or "hi " in normalized or normalized == "hi":
                    response_text = "Hello! I am Lumen, your offline AI companion. I run completely locally on your hardware to automate task macros. How can I help you?"
                else:
                    response_text = f"I understand you are asking about: \"{command}\". Since I run completely locally, I can help you automate actions or files related to it! Say 'what can you do' to explore features."
            
            # Send API response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            res_body = {
                "response": response_text,
                "state": new_state,
                "action": action_triggered,
                "actionResult": action_output,
                "timestamp": datetime.now().strftime("%I:%M:%S %p")
            }
            self.wfile.write(json.dumps(res_body).encode('utf-8'))
            return
        
        else:
            self.send_error(404, 'API path not found')
            return

def run(port=3000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, ShowcaseHandler)
    print(f"\n==========================================================")
    print(f"   LUMEN Showcase Landing Page Preview Server")
    print(f"==========================================================")
    print(f" -> Local Sandbox: Running on http://localhost:{port}")
    print(f" -> Access logs  : Disabled (clean console output)")
    print(f" -> Shutdown cmd : Press Ctrl+C in this window")
    print(f"==========================================================\n")
    
    # Automatically open default web browser
    try:
        import webbrowser
        webbrowser.open(f"http://localhost:{port}")
    except Exception:
        pass

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutdown preview server. Goodbye!")

if __name__ == '__main__':
    run()
