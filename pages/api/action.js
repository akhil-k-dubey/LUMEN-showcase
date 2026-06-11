export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { command, currentState = 'STANDBY' } = req.body;
  
  if (!command) {
    return res.status(400).json({ error: 'Command is required' });
  }

  const normalized = command.toLowerCase().trim();
  let responseText = "";
  let newState = currentState;
  let actionTriggered = null;
  let actionOutput = null;

  if (normalized === "wake up lumen" || normalized === "wake up" || normalized === "wake" || normalized === "wake lumen") {
    responseText = "Lumen online. Core cognitive engines restored. Systems online and listening.";
    newState = "AWAKE";
  } else if (normalized === "shutdown" || normalized === "exit" || normalized === "quit" || normalized === "sleep" || normalized === "go to sleep") {
    responseText = "Powering down cognitive subroutines. Entering standby. Goodbye.";
    newState = "STANDBY";
  } else if (currentState === "STANDBY" && !normalized.includes("wake")) {
    responseText = "Lumen is currently in standby. Click the 'Wake Lumen' button or type 'wake up' to activate.";
  } else {
    newState = "AWAKE";

    if (normalized === "help" || normalized === "commands") {
      responseText = "I can execute desktop automation, read your active windows, check system hardware load, control speakers, or recall vector memories. Click any of the Quick Command chips below to start.";
    } else if (normalized.includes("list skills") || normalized.includes("show skills") || normalized.includes("what can you do") || normalized === "skills") {
      responseText = "I have 12 automation features loaded:\n- Application Launcher\n- Task Manager\n- Active Screen Reader\n- Web Intelligence Search\n- Smart Clipboard Log\n- Audio Adjuster Level\n- Live Weather Radar\n- Active Screen Capture\n- WhatsApp Link Macro\n- Alarms & Countdown\n- SQLite Context Memory\n- System Health Status";
    } else if (normalized === "status" || normalized.includes("system status") || normalized === "system" || normalized === "hardware") {
      actionTriggered = "skill_system_info";
      actionOutput = "OS: Active Windows | CPU Load: 4.5% | Memory Usage: 14.2% | Inference Engine: Local (Running)";
      responseText = `Action Triggered: System Health Status\nHost statistics successfully analyzed:\n${actionOutput}`;
    } else if (normalized.includes("weather")) {
      actionTriggered = "skill_weather";
      let loc = "London";
      if (normalized.includes("nyc") || normalized.includes("new york")) {
        loc = "New York City";
      }
      actionOutput = `Location: ${loc} | Temp: 68F / 20C | Conditions: Light Breeze | Humidity: 55%`;
      responseText = `Action Triggered: Live Weather Radar\nForecast resolved for ${loc}:\n${actionOutput}`;
    } else if (normalized.includes("screenshot") || normalized.includes("capture")) {
      actionTriggered = "skill_screenshot";
      actionOutput = "Desktop screenshot captured successfully.";
      responseText = "Action Triggered: Active Screen Capture\nViewport frame grab complete. Rendering image attachment:";
    } else if (normalized.includes("whatsapp") || normalized.includes("message")) {
      actionTriggered = "skill_whatsapp";
      actionOutput = "Opened WhatsApp Web communication thread.";
      responseText = `Action Triggered: WhatsApp Link Macro\nDrafting chat overlay:\n${actionOutput}`;
    } else if (normalized.includes("volume") || normalized.includes("sound") || normalized.includes("speaker")) {
      actionTriggered = "skill_volume";
      const match = normalized.match(/\d+/);
      const level = match ? match[0] : "60";
      actionOutput = `System master speaker volume adjusted to ${level}%`;
      responseText = `Action Triggered: Audio Adjuster Level\nVolume scale updated:\n${actionOutput}`;
    } else if (normalized.includes("timer") || normalized.includes("alarm")) {
      actionTriggered = "skill_timer";
      actionOutput = "Scheduled countdown alarm trigger.";
      responseText = `Action Triggered: Alarms & Countdown\nTimer initialized:\n${actionOutput}`;
    } else if (normalized.includes("remember") || normalized.includes("store")) {
      actionTriggered = "skill_remember";
      const info = command.replace(/(remember|store)/i, "").trim() || "Setup verified";
      actionOutput = `Stored text snippet: "${info}"`;
      responseText = `Action Triggered: SQLite Context Memory\nCommitted context block to local database:\n${actionOutput}`;
    } else if (normalized.includes("diagnostics") || normalized.includes("diagnose")) {
      actionTriggered = "skill_system_diagnostics";
      actionOutput = "Operational diagnostic suite completed. SQLite indexes optimized. Audio drivers connected.";
      responseText = `Action Triggered: System Health Status\nDiagnosing local controllers:\n${actionOutput}`;
    } else if (normalized.includes("read screen") || normalized.includes("screen text")) {
      actionTriggered = "skill_read_screen";
      actionOutput = "Scanned active handles. Primary window: Browser. Text contents resolved.";
      responseText = `Action Triggered: Active Screen Reader\nScreen oracle translation finished:\n${actionOutput}`;
    } else if (normalized.includes("hello") || normalized.includes("hi ") || normalized === "hi") {
      responseText = "Hello! I am Lumen, your offline AI companion. I run completely locally on your hardware to automate task macros. How can I help you?";
    } else {
      responseText = `I understand you are asking about: "${command}". Since I run completely locally, I can help you automate actions or files related to it! Say 'what can you do' to explore features.`;
    }
  }

  res.status(200).json({
    response: responseText,
    state: newState,
    action: actionTriggered,
    actionResult: actionOutput,
    timestamp: new Date().toLocaleTimeString(),
  });
}
