export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Hardcoded standard specs to represent a real local desktop experience on web hosts
  const systemOS = "Windows 11 Pro";
  const systemCPU = "Intel Core i7-12700H";
  const systemRAM = "16 GB";

  res.status(200).json({
    name: "Lumen",
    project: "LUMEN",
    version: "1.4.0",
    status: "online",
    model: "Qwen 2.5 (Local Model)",
    speechEngine: "Neural Kokoro-ONNX",
    earEngine: "Local Whisper",
    specs: {
      os: systemOS,
      cpu: systemCPU,
      ram: systemRAM
    },
    skills: [
      { name: "Application Launcher", category: "System", desc: "Launches local programs cleanly on your active desktop." },
      { name: "Task Manager", category: "System", desc: "Shuts down background application processes safely." },
      { name: "Active Screen Reader", category: "Automation", desc: "Translates current window visual structures using the screen oracle." },
      { name: "Web Intelligence Search", category: "Web", desc: "Searches Google/DuckDuckGo and summarizes page texts." },
      { name: "Smart Clipboard Log", category: "Utility", desc: "Listens to copy events and monitors clipboard history stacks." },
      { name: "Audio Adjuster Level", category: "Hardware", desc: "Controls master volume percentages and speaker mute configurations." },
      { name: "Live Weather Radar", category: "Web", desc: "Queries dynamic weather indexes and temperatures." },
      { name: "Active Screen Capture", category: "Utility", desc: "Grabs your actual desktop screen and sends an image preview." },
      { name: "WhatsApp Link Macro", category: "Communication", desc: "Drafts and sends chat thread overlays using UI macros." },
      { name: "Alarms & Countdown", category: "Utility", desc: "Schedules custom wake timers and background alerts." },
      { name: "SQLite Context Memory", category: "Memory", desc: "Stores conversational dialogue details inside vector indexing databases." },
      { name: "System Health Status", category: "System", desc: "Analyzes operating system diagnostics and resource logs." }
    ]
  });
}
