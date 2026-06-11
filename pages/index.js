import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { 
  Activity, 
  Play, 
  Power, 
  Send, 
  Mic, 
  Layers, 
  CheckCircle2, 
  Cpu, 
  Shield, 
  Eye, 
  Database
} from 'lucide-react';

export default function Home() {
  // UI states
  const [commandInput, setCommandInput] = useState('');
  const [terminalLines, setTerminalLines] = useState([
    { text: 'SYSTEM INITIALIZATION: SUCCESSFUL', type: 'system' },
    { text: 'LUMEN Proactive Brain Active.', type: 'system' },
    { text: 'Lumen is currently in standby. Click "Wake Lumen" or type "wake up" to interact.', type: 'reply' }
  ]);
  const [agentState, setAgentState] = useState('STANDBY'); // STANDBY, AWAKE, PROCESSING
  const [voiceWaveActive, setVoiceWaveActive] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  
  // Configuration states from API
  const [projectInfo, setProjectInfo] = useState({
    name: "Lumen",
    project: "LUMEN",
    version: "1.4.0",
    model: "Qwen 2.5 (Local)",
    specs: { os: "Detecting...", cpu: "Detecting..." }
  });
  const [skillsList, setSkillsList] = useState([]);
  const [telemetry, setTelemetry] = useState({ cpu: '3.0%', ram: '12.8%' });

  const terminalEndRef = useRef(null);

  // Scroll terminal to bottom on new output
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLines]);

  // Fetch telemetry details and skills meta on mount
  useEffect(() => {
    fetch('/api/info')
      .then(res => res.json())
      .then(data => {
        setProjectInfo({
          name: data.name,
          project: data.project,
          version: data.version,
          model: data.model,
          specs: data.specs || { os: "Unknown OS", cpu: "Unknown CPU" }
        });
        setSkillsList(data.skills || []);
      })
      .catch(err => {
        console.error("Failed to fetch initial settings", err);
      });
  }, []);

  // Telemetry fluctuation simulator
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => {
        const cpuNum = parseFloat(prev.cpu) + (Math.random() * 2 - 1);
        const ramNum = parseFloat(prev.ram) + (Math.random() * 0.4 - 0.2);
        return {
          cpu: `${Math.max(1, Math.min(25, cpuNum)).toFixed(1)}%`,
          ram: `${Math.max(8, Math.min(32, ramNum)).toFixed(1)}%`
        };
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Run command handler
  const executeCommand = async (cmdText) => {
    if (!cmdText.trim()) return;

    setTerminalLines(prev => [...prev, { text: `> ${cmdText}`, type: 'user' }]);
    setCommandInput('');
    setAgentState('PROCESSING');
    setVoiceWaveActive(true);

    try {
      const response = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmdText, currentState: agentState })
      });
      const data = await response.json();

      setTimeout(() => {
        setTerminalLines(prev => {
          const newLines = [...prev, { text: data.response, type: 'reply', timestamp: data.timestamp }];
          // If a screenshot was taken, add image attachment
          if (data.action === 'skill_screenshot' && data.actionResult) {
            newLines.push({ text: '/static/screenshot.png', type: 'image' });
          }
          return newLines;
        });
        
        setAgentState(data.state);

        const duration = Math.min(4000, Math.max(1500, data.response.length * 40));
        setTimeout(() => {
          setVoiceWaveActive(false);
        }, duration);

      }, 500);

    } catch (err) {
      console.error(err);
      setTerminalLines(prev => [...prev, { text: 'ERROR: Connection to Lumen server failed.', type: 'system' }]);
      setAgentState('AWAKE');
      setVoiceWaveActive(false);
    }
  };

  // Clicking preset shortcuts
  const handlePresetClick = (presetText) => {
    executeCommand(presetText);
  };

  // Toggle awake states
  const handleWakeToggle = () => {
    if (agentState === 'STANDBY') {
      executeCommand('wake up');
    } else {
      executeCommand('shutdown');
    }
  };

  // Filter skills list
  const filteredSkills = activeTab === 'All' 
    ? skillsList 
    : skillsList.filter(s => s.category.toLowerCase() === activeTab.toLowerCase());

  // Map category to color classes
  const getCategoryColor = (cat) => {
    switch (cat.toLowerCase()) {
      case 'system': return { text: 'hsl(var(--color-cyan))', bg: 'hsla(var(--color-cyan)/0.1)', border: 'hsla(var(--color-cyan)/0.2)' };
      case 'web': return { text: 'hsl(var(--color-purple))', bg: 'hsla(var(--color-purple)/0.1)', border: 'hsla(var(--color-purple)/0.2)' };
      case 'hardware': return { text: 'hsl(var(--color-pink))', bg: 'hsla(var(--color-pink)/0.1)', border: 'hsla(var(--color-pink)/0.2)' };
      case 'memory': return { text: 'hsl(var(--color-emerald))', bg: 'hsla(var(--color-emerald)/0.1)', border: 'hsla(var(--color-emerald)/0.2)' };
      default: return { text: 'hsl(var(--color-amber))', bg: 'hsla(var(--color-amber)/0.1)', border: 'hsla(var(--color-amber)/0.2)' };
    }
  };

  return (
    <>
      <Head>
        <title>LUMEN — Proactive Local Voice AI Showcase</title>
        <meta name="description" content="Explore LUMEN - a state-of-the-art local voice assistant with proactive automation, screen reading, clipboard buffers, and hardware telemetry integrations." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>" />
      </Head>

      {/* Decorative Animated Grids */}
      <div className="bg-decor">
        <div className="bg-grid"></div>
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>
      </div>

      {/* Navigation Header */}
      <header className="nav">
        <div className="container nav-container">
          <a href="#" className="logo">
            <span className="logo-dot"></span>
            LUMEN <span style={{ opacity: 0.5, fontWeight: 300, fontSize: '1rem', marginLeft: '6px' }}>LOCAL VOICE AI</span>
          </a>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="status-badge">
              <span className="status-badge-dot"></span>
              AI ASSISTANT: ONLINE
            </div>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-secondary"
              style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '6px' }}
            >
              View Repository
            </a>
          </div>
        </div>
      </header>

      <main className="container">
        {/* HERO HEADER */}
        <section className="section" style={{ textAlign: 'center', paddingBottom: '30px', paddingTop: '50px' }}>
          <span style={{ 
            fontSize: '0.8rem', 
            fontWeight: 700, 
            letterSpacing: '0.2em', 
            textTransform: 'uppercase', 
            color: 'hsl(var(--color-cyan))',
            background: 'hsla(var(--color-cyan)/0.1)',
            padding: '6px 16px',
            borderRadius: '50px',
            border: '1px solid hsla(var(--color-cyan)/0.2)'
          }}>
            Local Voice & Proactive Automation
          </span>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginTop: '20px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Your computer. Your AI.<br />
            <span className="text-gradient">No cloud required.</span>
          </h1>
          <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '1.2rem', maxWidth: '680px', margin: '20px auto 0', fontWeight: 300 }}>
            An offline, personal AI assistant that integrates speech control, active screen reading, and proactive desktop tools directly on your computer.
          </p>
        </section>

        {/* INTERACTIVE PLAYGROUND (Core & Terminal) */}
        <section className="section" style={{ paddingTop: '20px', paddingBottom: '60px' }}>
          <div className="grid-split" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.4fr', gap: '30px' }}>
            
            {/* LEFT COLUMN: Pulse Core & Telemetry */}
            <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '450px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--text-muted))', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '25px' }}>
                  <Activity size={16} color="hsl(var(--color-cyan))" />
                  Lumen Core Engine
                </h3>
                
                {/* AI Pulse Orb container */}
                <div style={{ padding: '20px 0' }}>
                  <div className={`orb-container orb-${agentState.toLowerCase()}`}>
                    <div className="ai-orb-ring-2"></div>
                    <div className="ai-orb-ring-1"></div>
                    <div className="ai-orb" style={{ cursor: 'pointer' }} onClick={handleWakeToggle}></div>
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>ASSISTANT STATE</div>
                  <div style={{ 
                    fontSize: '1.3rem', 
                    fontWeight: 800, 
                    color: agentState === 'AWAKE' ? 'hsl(var(--color-cyan))' : agentState === 'PROCESSING' ? 'hsl(var(--color-pink))' : 'hsl(var(--color-purple))',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    marginTop: '2px'
                  }}>
                    {agentState}
                  </div>
                </div>
              </div>

              {/* Dynamic Waveform Visualizer */}
              <div style={{ margin: '25px 0' }}>
                <div className={`voice-wave ${voiceWaveActive ? 'wave-active' : ''}`}>
                  {[...Array(15)].map((_, i) => (
                    <div key={i} className="wave-bar"></div>
                  ))}
                </div>
                <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '6px' }}>
                  {voiceWaveActive ? "Lumen is speaking..." : "Voice feedback channel closed"}
                </div>
              </div>

              {/* Telemetry panel */}
              <div>
                <div style={{ borderTop: '1px solid hsl(var(--border-muted))', paddingTop: '20px' }}>
                  <div className="telemetry-grid">
                    <div className="telemetry-item">
                      <div className="telemetry-label">CPU LOAD</div>
                      <div className="telemetry-value" style={{ color: 'hsl(var(--color-cyan))' }}>{telemetry.cpu}</div>
                    </div>
                    <div className="telemetry-item">
                      <div className="telemetry-label">RAM USAGE</div>
                      <div className="telemetry-value" style={{ color: 'hsl(var(--color-purple))' }}>{telemetry.ram}</div>
                    </div>
                    <div className="telemetry-item">
                      <div className="telemetry-label">HOST SYSTEM</div>
                      <div className="telemetry-value" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={projectInfo.specs.os}>{projectInfo.specs.os}</div>
                    </div>
                    <div className="telemetry-item">
                      <div className="telemetry-label">HARDWARE CPU</div>
                      <div className="telemetry-value" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={projectInfo.specs.cpu}>{projectInfo.specs.cpu}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <button 
                      onClick={handleWakeToggle} 
                      className={`btn ${agentState === 'STANDBY' ? 'btn-primary' : 'btn-danger'}`}
                      style={{ flex: 1, padding: '10px' }}
                    >
                      {agentState === 'STANDBY' ? <Play size={16} /> : <Power size={16} />}
                      {agentState === 'STANDBY' ? 'Wake Lumen' : 'Go Standby'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Terminal Sandbox */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="terminal-window" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="terminal-header">
                  <div className="terminal-dots">
                    <div className="terminal-dot red"></div>
                    <div className="terminal-dot yellow"></div>
                    <div className="terminal-dot green"></div>
                  </div>
                  <div className="terminal-title">LUMEN_CORE@DESKTOP</div>
                  <div style={{ width: '38px' }}></div>
                </div>

                <div className="terminal-body">
                  {terminalLines.map((line, idx) => {
                    if (line.type === 'image') {
                      return (
                        <div key={idx} style={{ 
                          marginTop: '10px', 
                          marginBottom: '10px', 
                          border: '1px solid hsl(var(--border-muted))', 
                          borderRadius: '8px', 
                          overflow: 'hidden',
                          maxWidth: '100%',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                        }}>
                          <img src={`${line.text}?t=${new Date().getTime()}`} alt="Desktop Capture" style={{ width: '100%', display: 'block' }} />
                        </div>
                      );
                    }
                    return (
                      <div key={idx} style={{ 
                        color: line.type === 'user' ? 'hsl(var(--text-primary))' : line.type === 'system' ? 'hsl(var(--text-muted))' : 'hsl(var(--color-cyan))',
                        fontSize: '0.85rem',
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.5',
                        marginTop: '4px'
                      }}>
                        {line.text}
                        {line.timestamp && (
                          <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', marginLeft: '10px' }}>
                            [{line.timestamp}]
                          </span>
                        )}
                      </div>
                    );
                  })}
                  <div ref={terminalEndRef} />
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    executeCommand(commandInput);
                  }}
                  className="terminal-input-line" 
                  style={{ 
                    borderTop: '1px solid hsl(var(--border-muted))', 
                    padding: '12px 16px',
                    background: '#070709'
                  }}
                >
                  <span className="terminal-prompt">&gt;</span>
                  <input 
                    type="text" 
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    placeholder={agentState === 'STANDBY' ? "Wake up Lumen first..." : "Ask Lumen to do something..."}
                    className="terminal-input"
                    disabled={agentState === 'PROCESSING'}
                  />
                  <button 
                    type="submit" 
                    disabled={!commandInput.trim() || agentState === 'PROCESSING'} 
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: commandInput.trim() ? 1 : 0.3 }}
                  >
                    <Send size={16} color="hsl(var(--color-cyan))" />
                  </button>
                </form>
              </div>

              {/* Preset Shortcuts Panel */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--text-secondary))', marginBottom: '12px' }}>
                  Quick Commands
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {[
                    "system status",
                    "diagnostics",
                    "screenshot",
                    "weather in London",
                    "whatsapp message",
                    "adjust volume",
                    "remember my setting",
                    "what can you do"
                  ].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handlePresetClick(preset)}
                      className="btn btn-secondary"
                      disabled={agentState === 'PROCESSING'}
                      style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* PIPELINE WORKFLOW */}
        <section className="section" style={{ borderTop: '1px solid hsl(var(--border-muted))' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Pipeline Infrastructure</h2>
            <p style={{ color: 'hsl(var(--text-secondary))', marginTop: '10px' }}>
              How speech and automation actions route securely to execute local actions.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }} className="grid-split">
            {[
              {
                step: "01",
                name: "Inputs Processing",
                icon: <Mic size={24} color="hsl(var(--color-cyan))" />,
                desc: "Microphone capture tracks active voice prompts, while background checkers follow clipboard copy buffers."
              },
              {
                step: "02",
                name: "Local AI Brain",
                icon: <Cpu size={24} color="hsl(var(--color-purple))" />,
                desc: "User commands combine with conversation memory contexts, routing straight to local model parameters."
              },
              {
                step: "03",
                name: "Action Interceptor",
                icon: <Layers size={24} color="hsl(var(--color-pink))" />,
                desc: "Decoders process model streams, matching instructions to automated task routines without exposing source scripts."
              },
              {
                step: "04",
                name: "System Automation",
                icon: <CheckCircle2 size={24} color="hsl(var(--color-emerald))" />,
                desc: "System controllers command desktop automation: opening windows, adjusting levels, or fetching live telemetry."
              }
            ].map((item, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '25px', position: 'relative' }}>
                <div style={{ 
                  position: 'absolute', 
                  right: '20px', 
                  top: '15px', 
                  fontSize: '2.5rem', 
                  fontWeight: 900, 
                  opacity: 0.05,
                  fontFamily: 'var(--font-heading)'
                }}>
                  {item.step}
                </div>
                <div style={{ 
                  width: '44px', 
                  height: '44px', 
                  borderRadius: '8px', 
                  background: 'rgba(255,255,255,0.02)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '1px solid hsl(var(--border-muted))',
                  marginBottom: '20px'
                }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>{item.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURE MATRIX REGISTRY */}
        <section className="section" style={{ borderTop: '1px solid hsl(var(--border-muted))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Lumen Feature Catalog</h2>
              <p style={{ color: 'hsl(var(--text-secondary))', marginTop: '6px' }}>
                Explore the automation components integrated inside Lumen.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '8px', border: '1px solid hsl(var(--border-muted))' }}>
              {['All', 'System', 'Web', 'Utility', 'Memory'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="btn"
                  style={{ 
                    padding: '6px 14px', 
                    fontSize: '0.75rem', 
                    borderRadius: '6px',
                    background: activeTab === tab ? 'rgba(255,255,255,0.06)' : 'transparent',
                    border: 'none',
                    color: activeTab === tab ? 'hsl(var(--text-primary))' : 'hsl(var(--text-muted))'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }} className="grid-split">
            {filteredSkills.length > 0 ? (
              filteredSkills.map((skill, idx) => {
                const colors = getCategoryColor(skill.category);
                return (
                  <div key={idx} className="glass-card skill-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <code style={{ 
                        fontFamily: 'var(--font-mono)', 
                        color: 'hsl(var(--text-primary))',
                        fontWeight: 600,
                        fontSize: '0.9rem'
                      }}>
                        {skill.name}
                      </code>
                      <span style={{ 
                        fontSize: '0.65rem', 
                        fontWeight: 700, 
                        textTransform: 'uppercase', 
                        padding: '3px 8px', 
                        borderRadius: '20px', 
                        color: colors.text,
                        background: colors.bg,
                        border: `1px solid ${colors.border}`,
                        letterSpacing: '0.05em'
                      }}>
                        {skill.category}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', lineHeight: 1.5 }}>
                      {skill.desc}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px', fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'hsl(var(--color-emerald))' }}></span>
                      Operational Module
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '40px', color: 'hsl(var(--text-muted))' }}>
                Loading available features...
              </div>
            )}
          </div>
        </section>

        {/* SECURE LOCAL INTEGRATION */}
        <section className="section" style={{ borderTop: '1px solid hsl(var(--border-muted))', paddingBottom: '100px' }}>
          <div className="glass-card" style={{ padding: '40px', background: 'radial-gradient(ellipse at bottom right, rgba(177, 104, 255, 0.05), transparent 60%), rgba(20, 20, 23, 0.6)' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '16px' }}>Local offline security</h2>
            <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '24px', maxWidth: '750px', fontSize: '0.95rem' }}>
              Lumen operates with strict client-side privacy, running all components locally on your host environment.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' }} className="grid-split">
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={20} color="hsl(var(--color-cyan))" />
                  Zero Cloud Dependencies
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', lineHeight: 1.4, marginTop: '8px' }}>
                  No remote database tracking or external API keys needed. Speech recognition, synthesis, and text inference execute locally.
                </p>
              </div>
              
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Eye size={20} color="hsl(var(--color-purple))" />
                  Screen Context Privacy
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', lineHeight: 1.4, marginTop: '8px' }}>
                  Lumen's active screen scanner works with client window handles strictly inside your active desktop environment, never transferring screen data.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Database size={20} color="hsl(var(--color-pink))" />
                  SQLite Vector Storage
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', lineHeight: 1.4, marginTop: '8px' }}>
                  Lumen maintains a local database instance to index reminders and dialogue contexts, offering fast SQLite indexing on your own hard drive.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ borderTop: '1px solid hsl(var(--border-muted))', padding: '40px 0', background: '#070709', color: 'hsl(var(--text-muted))' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', fontSize: '0.85rem' }}>
          <div>
            © {new Date().getFullYear()} LUMEN Project. Built for local offline desktop automation.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" style={{ color: 'hsl(var(--text-muted))', textDecoration: 'none' }}>
              Deploy on Vercel
            </a>
            <span style={{ opacity: 0.2 }}>|</span>
            <span>Local Voice AI</span>
          </div>
        </div>
      </footer>
    </>
  );
}
