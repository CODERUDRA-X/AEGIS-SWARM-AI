"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ── Types ──────────────────────────────────────────────────────────── */

type AgentName = "SCOUT" | "RISK" | "CRITIC" | "CMD";
type Highlight  = "override" | "warn" | "cmd" | "normal";

interface LogEntry {
  ts:        string;
  agent:     AgentName;
  msg:       string;
  highlight: Highlight;
}

interface ReportData {
  scout_data: {
    people_count:     number;
    blocked_paths:    number;
    environment_type: string;
    hazard_factors:   string[];
  };
  risk_assessment:  { threat_level: string };
  critic_review:    { adjusted_threat_level: string; critic_reasoning: string };
  commander_plan:   { immediate_actions: string[] };
}

/* ── Constants ───────────────────────────────────────────────────────── */

const AGENT_STYLES: Record<AgentName, { border: string; text: string; bg: string }> = {
  SCOUT:  { border: "#58a6ff", text: "#58a6ff", bg: "rgba(88,166,255,0.09)"   },
  RISK:   { border: "#3fb950", text: "#3fb950", bg: "rgba(63,185,80,0.09)"    },
  CRITIC: { border: "#f85149", text: "#f85149", bg: "rgba(248,81,73,0.13)"    },
  CMD:    { border: "#a371f7", text: "#a371f7", bg: "rgba(163,113,247,0.09)"  },
};

const LOG_DATA: LogEntry[] = [
  { ts:"14:21:58", agent:"SCOUT",  highlight:"normal",   msg:"Detected 0 civilians, 4+ vehicles. Highway interchange." },
  { ts:"14:21:59", agent:"SCOUT",  highlight:"normal",   msg:"Terrain: urban highway. Hazards: merging lanes, large vehicles." },
  { ts:"14:22:01", agent:"RISK",   highlight:"normal",   msg:"People count = 0. Baseline threat: LOW. Confidence: 0.72." },
  { ts:"14:22:02", agent:"RISK",   highlight:"normal",   msg:"Open ground assumption applied. No crowd density trigger." },
  { ts:"14:22:04", agent:"CRITIC", highlight:"warn",     msg:"Challenging Risk. Highway environment type unaccounted in baseline." },
  { ts:"14:22:05", agent:"CRITIC", highlight:"override", msg:"OVERRIDE: LOW → CRITICAL. Heavy traffic + collision risk = 1.8× multiplier." },
  { ts:"14:22:06", agent:"RISK",   highlight:"normal",   msg:"Accepting Critic override. Revised assessment: CRITICAL." },
  { ts:"14:22:07", agent:"CMD",    highlight:"cmd",      msg:"Consensus received. Generating 3-step response plan…" },
];

const REPORT: ReportData = {
  scout_data: {
    people_count:     0,
    blocked_paths:    5,
    environment_type: "highway and road interchange",
    hazard_factors:   ["heavy traffic congestion","merging lanes","large vehicles","collision risk","limited visibility"],
  },
  risk_assessment:  { threat_level: "LOW" },
  critic_review: {
    adjusted_threat_level: "CRITICAL",
    critic_reasoning: "Environment type 'highway' and 'heavy traffic' create severe collision risks even with zero pedestrian count. Risk agent's open-ground assumption was incorrect.",
  },
  commander_plan: {
    immediate_actions: [
      "Deploy traffic control personnel at all entry points to prevent unauthorized pedestrian access.",
      "Establish safe zones off active roadways for any stranded individuals.",
      "Utilize public address systems to broadcast urgent safety warnings.",
    ],
  },
};

/* ── useUtcTime ──────────────────────────────────────────────────────── */

function useUtcTime(): string {
  const [time, setTime] = useState<string>("");
  useEffect(() => {
    const tick = () => {
      const d  = new Date();
      const hh = String(d.getUTCHours()).padStart(2,"0");
      const mm = String(d.getUTCMinutes()).padStart(2,"0");
      const ss = String(d.getUTCSeconds()).padStart(2,"0");
      setTime(`${hh}:${mm}:${ss} UTC`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

/* ── AgentBadge ──────────────────────────────────────────────────────── */

function AgentBadge({ agent }: { agent: AgentName }) {
  const s = AGENT_STYLES[agent];
  return (
    <span style={{
      display:        "inline-flex",
      alignItems:     "center",
      justifyContent: "center",
      fontSize:       "8px",
      fontWeight:     600,
      letterSpacing:  "0.08em",
      border:         `1px solid ${s.border}`,
      color:          s.text,
      background:     s.bg,
      borderRadius:   "2px",
      height:         "18px",
      minWidth:       "42px",
      flexShrink:     0,
      fontFamily:     "var(--font-mono, monospace)",
    }}>
      {agent}
    </span>
  );
}

/* ── DebateLog ───────────────────────────────────────────────────────── */

function DebateLog({ entries }: { entries: LogEntry[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [entries]);

  const msgColor = (h: Highlight): string => {
    if (h === "override") return "#f85149";
    if (h === "warn")     return "#e2936a";
    if (h === "cmd")      return "#a371f7";
    return "#5a7a90";
  };

  return (
    <div ref={ref} style={{ flex:1, overflowY:"auto", paddingRight:"4px", fontSize:"10px" }}>
      {entries.filter(Boolean).map((entry, i) => (
        <div key={i} style={{ display:"grid", gridTemplateColumns:"52px 46px 1fr", gap:"8px", marginBottom:"10px", animation:"logIn 0.25s ease" }}>
          <span style={{ color:"#1e3a52", paddingTop:"2px", fontFamily:"monospace" }}>{entry.ts}</span>
          <AgentBadge agent={entry.agent} />
          <span style={{ lineHeight:1.6, color:msgColor(entry.highlight), fontWeight: entry.highlight==="override" ? 600 : 400 }}>
            {entry.msg}
          </span>
        </div>
      ))}

      {/* blinking cursor line */}
      <div style={{ display:"flex", alignItems:"center", gap:"8px", marginTop:"6px", paddingTop:"6px", borderTop:"1px solid #0e1f2e" }}>
        <span style={{ display:"inline-block", width:6, height:12, background:"#1e4a6a", animation:"blink 1s step-end infinite" }} />
        <span style={{ fontSize:"8px", letterSpacing:"0.12em", color:"#1a3a52" }}>PIPELINE ACTIVE</span>
      </div>
    </div>
  );
}

/* ── SwarmTopology ───────────────────────────────────────────────────── */

function SwarmTopology() {
  return (
    <svg viewBox="0 0 260 210" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%" }}>
      <defs>
        <marker id="a1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="#1e4a6a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </marker>
        <marker id="a2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="#f85149" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </marker>
      </defs>

      {/* flow lines */}
      <line x1="130" y1="38" x2="52"  y2="98"  stroke="#1e4a6a" strokeWidth="1" markerEnd="url(#a1)"/>
      <line x1="130" y1="38" x2="208" y2="98"  stroke="#1e4a6a" strokeWidth="1" markerEnd="url(#a1)"/>
      <line x1="52"  y1="118" x2="125" y2="170" stroke="#0e2030" strokeWidth="0.5" strokeDasharray="4 3"/>
      <line x1="208" y1="118" x2="135" y2="170" stroke="#0e2030" strokeWidth="0.5" strokeDasharray="4 3"/>

      {/* animated debate edge */}
      <line x1="72" y1="108" x2="188" y2="108"
        stroke="#f85149" strokeWidth="1.5" opacity="0.7"
        strokeDasharray="6 4"
        markerEnd="url(#a2)" markerStart="url(#a2)"
        style={{ animation:"debateDash 1s linear infinite" }}
      />
      <text x="130" y="103" fill="#7a2020" fontSize="7" textAnchor="middle" letterSpacing="2" fontFamily="monospace">DEBATE</text>

      {/* SCOUT */}
      <rect x="90" y="14" width="80" height="32" rx="3" fill="rgba(88,166,255,0.06)" stroke="#58a6ff" strokeWidth="0.7"/>
      <text x="130" y="27" textAnchor="middle" fill="#58a6ff" fontSize="9" fontWeight="500" letterSpacing="1.5" fontFamily="monospace">SCOUT</text>
      <text x="130" y="40" textAnchor="middle" fill="#2a6a8a" fontSize="7" letterSpacing="1" fontFamily="monospace">DONE ✓</text>

      {/* RISK */}
      <rect x="14" y="90" width="76" height="32" rx="3" fill="rgba(63,185,80,0.04)" stroke="#3fb950" strokeWidth="0.7"/>
      <text x="52" y="103" textAnchor="middle" fill="#3fb950" fontSize="9" fontWeight="500" letterSpacing="1.5" fontFamily="monospace">RISK</text>
      <text x="52" y="116" textAnchor="middle" fill="#2a5a2a" fontSize="7" letterSpacing="1" fontFamily="monospace">LOW→CRIT</text>

      {/* CRITIC — active, glowing */}
      <rect x="170" y="90" width="76" height="32" rx="3" fill="rgba(248,81,73,0.08)" stroke="#f85149" strokeWidth="1"
        style={{ filter:"drop-shadow(0 0 6px rgba(248,81,73,0.3))" }}/>
      <text x="208" y="103" textAnchor="middle" fill="#f85149" fontSize="9" fontWeight="500" letterSpacing="1.5" fontFamily="monospace">CRITIC</text>
      <text x="208" y="116" textAnchor="middle" fill="#9a2020" fontSize="7" letterSpacing="1" fontFamily="monospace">ACTIVE ●</text>

      {/* COMMANDER — pending */}
      <rect x="90" y="162" width="80" height="32" rx="3" fill="#060f1a" stroke="#1e2a38" strokeWidth="0.5"/>
      <text x="130" y="175" textAnchor="middle" fill="#2a3a4a" fontSize="9" letterSpacing="1.5" fontFamily="monospace">COMMAND</text>
      <text x="130" y="188" textAnchor="middle" fill="#1a2a3a" fontSize="7" letterSpacing="1" fontFamily="monospace">PENDING…</text>
    </svg>
  );
}

/* ── ImageZone ───────────────────────────────────────────────────────── */

function ImageZone({ src, onUpload, analyzing }: { src:string|null; onUpload:(f:File)=>void; analyzing:boolean }) {
  const inputRef  = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("image/")) onUpload(f);
  }, [onUpload]);

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}
      style={{
        height:       "220px",
        background:   "#03070c",
        border:       `1px solid ${drag ? "#58a6ff" : "#1e2a38"}`,
        borderRadius: "4px",
        position:     "relative",
        overflow:     "hidden",
        cursor:       "pointer",
        flexShrink:   0,
        transition:   "border-color 0.2s",
      }}
    >
      {/* grid overlay */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none",
        backgroundImage:"linear-gradient(rgba(30,80,120,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(30,80,120,.05) 1px,transparent 1px)",
        backgroundSize:"28px 28px",
      }}/>

      {/* corner reticles */}
      {([["3px","3px","border-top","border-left"],["3px","auto","border-top","border-right"],["auto","3px","border-bottom","border-left"],["auto","auto","border-bottom","border-right"]] as const).map(([t,r,b,l],i)=>(
        <div key={i} style={{
          position:"absolute",
          top:  i < 2 ? "12px" : undefined,
          bottom: i >= 2 ? "12px" : undefined,
          left:  i % 2 === 0 ? "12px" : undefined,
          right: i % 2 === 1 ? "12px" : undefined,
          width:"14px", height:"14px",
          borderTop:    (i < 2)         ? "1px solid #2a5a7a" : undefined,
          borderBottom: (i >= 2)        ? "1px solid #2a5a7a" : undefined,
          borderLeft:   (i % 2 === 0)   ? "1px solid #2a5a7a" : undefined,
          borderRight:  (i % 2 === 1)   ? "1px solid #2a5a7a" : undefined,
        }}/>
      ))}

      {/* scan line while analyzing */}
      {analyzing && <div style={{
        position:"absolute", left:0, right:0, height:"1px",
        background:"linear-gradient(90deg,transparent,rgba(88,166,255,0.4),transparent)",
        animation:"scan 2s linear infinite",
      }}/>}

      {src
        ? <img src={src} alt="feed" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"contain" }}/>
        : (
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"8px" }}>
            <svg style={{ width:28, height:28, color:"#1e4a6a" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span style={{ fontSize:"9px", letterSpacing:"0.2em", color:"#1e4a6a" }}>
              {drag ? "DROP IMAGE" : "DRONE / CCTV FEED — CLICK OR DROP"}
            </span>
          </div>
        )
      }
      <input ref={inputRef} type="file" accept="image/*" style={{ display:"none" }}
        onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); }}/>
    </div>
  );
}

/* ── Main Dashboard ──────────────────────────────────────────────────── */

export default function AegisDashboard() {
  const utcTime   = useUtcTime();
  const [src, setSrc]         = useState<string|null>(null);
  const [analyzing, setAn]    = useState(false);
  const [frame, setFrame]     = useState(47);
  const [logEntries, setLog]  = useState<LogEntry[]>([]);

  /* animate log entries one-by-one */
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      if (i < LOG_DATA.length) {
        setLog(prev => [...prev, LOG_DATA[i]]);
        i++;
      } else {
        clearInterval(id);
      }
    }, 420);
    return () => clearInterval(id);
  }, []);

  /* frame counter */
  useEffect(() => {
    const id = setInterval(() => setFrame(f => f + 1), 900);
    return () => clearInterval(id);
  }, []);

  const handleUpload = useCallback((file: File) => {
    setSrc(URL.createObjectURL(file));
    setAn(true);
    setTimeout(() => setAn(false), 3000);
  }, []);

  const threat = REPORT.critic_review.adjusted_threat_level;
  const threatColor = threat === "CRITICAL" ? "#f85149" : threat === "HIGH" ? "#f0883e" : threat === "MEDIUM" ? "#e3b341" : "#3fb950";

  return (
    <>
      {/* ── keyframes injected once ── */}
      <style>{`
        @keyframes blink      { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes logIn      { from{opacity:0;transform:translateY(3px)} to{opacity:1;transform:none} }
        @keyframes scan       { from{top:0%} to{top:100%} }
        @keyframes debateDash { to{stroke-dashoffset:-20} }
        @keyframes criticGlow { 0%,100%{box-shadow:0 0 8px rgba(248,81,73,.15)} 50%{box-shadow:0 0 22px rgba(248,81,73,.35)} }
        ::-webkit-scrollbar       { width:3px; height:3px }
        ::-webkit-scrollbar-track { background:transparent }
        ::-webkit-scrollbar-thumb { background:#1e2a38; border-radius:2px }
      `}</style>

      <div style={{ height:"100vh", background:"#050c14", color:"#b8cfe0", fontFamily:"'Geist Mono',ui-monospace,monospace", fontSize:"12px", display:"flex", flexDirection:"column", overflow:"hidden" }}>

        {/* ── TOPBAR ── */}
        <header style={{ height:"40px", flexShrink:0, background:"#040b12", borderBottom:"1px solid #0e1f2e", display:"flex", alignItems:"center", padding:"0 20px", gap:"14px" }}>
          <span style={{ fontSize:"13px", fontWeight:600, letterSpacing:"0.22em", color:"#e0edf8" }}>AEGIS–SWARM</span>
          <div style={{ width:"1px", height:"16px", background:"#0e1f2e" }}/>
          <span style={{ fontSize:"9px", display:"flex", alignItems:"center", gap:"5px", letterSpacing:"0.1em", color:"#3fb950" }}>
            <span style={{ width:5, height:5, borderRadius:"50%", background:"#3fb950", display:"inline-block", animation:"blink 1s step-end infinite" }}/>
            LIVE ANALYSIS
          </span>
          <div style={{ marginLeft:"auto", display:"flex", gap:"20px", alignItems:"center" }}>
            <span style={{ fontSize:"9px", letterSpacing:"0.12em", color:"#1a4060" }}>NEURAL MESH / 4-AGENT PIPELINE</span>
            <span style={{ fontSize:"9px", color:"#1a3a52", fontFamily:"monospace" }}>
              FRAME <span style={{ color:"#1e4a6a" }}>{String(frame).padStart(4,"0")}</span>
            </span>
            <span style={{ fontSize:"9px", color:"#1a3052", fontFamily:"monospace" }}>{utcTime}</span>
          </div>
        </header>

        {/* ── MAIN GRID ── */}
        <div style={{ flex:1, display:"grid", gridTemplateColumns:"238px 1fr 278px", overflow:"hidden" }}>

          {/* ─── LEFT COLUMN ─── */}
          <div style={{ borderRight:"1px solid #0e1f2e", display:"flex", flexDirection:"column", overflow:"hidden" }}>

            {/* Topology */}
            <div style={{ padding:"12px 14px", borderBottom:"1px solid #0e1f2e", flexShrink:0 }}>
              <div style={{ fontSize:"8px", letterSpacing:"0.18em", color:"#1a4060", marginBottom:"10px" }}>SWARM TOPOLOGY</div>
              <div style={{ height:"208px" }}>
                <SwarmTopology/>
              </div>
            </div>

            {/* Scout data */}
            <div style={{ padding:"10px 14px", borderBottom:"1px solid #0e1f2e", flexShrink:0 }}>
              <div style={{ fontSize:"8px", letterSpacing:"0.18em", color:"#1a4060", marginBottom:"8px" }}>SCOUT EXTRACTION</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"5px" }}>
                {[
                  { k:"ENTITIES",  v:String(REPORT.scout_data.people_count),  c:"#b8cfe0" },
                  { k:"PATHS OUT", v:String(REPORT.scout_data.blocked_paths), c:"#f0883e" },
                  { k:"TERRAIN",   v:"Highway",                               c:"#58a6ff" },
                  { k:"HAZARDS",   v:String(REPORT.scout_data.hazard_factors.length), c:"#f85149" },
                ].map(({ k, v, c }) => (
                  <div key={k} style={{ padding:"7px 9px", background:"#040b12", border:"1px solid #0e1f2e", borderRadius:"3px" }}>
                    <div style={{ fontSize:"7px", letterSpacing:"0.12em", color:"#1a4060" }}>{k}</div>
                    <div style={{ fontSize:"15px", color:c, marginTop:"2px" }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Threat display */}
            <div style={{ margin:"10px 14px", padding:"12px", background:"rgba(248,81,73,0.04)", border:"1px solid rgba(248,81,73,0.25)", borderRadius:"4px", flexShrink:0, animation:"criticGlow 2.5s ease-in-out infinite" }}>
              <div style={{ fontSize:"8px", letterSpacing:"0.14em", color:"#4a2020", marginBottom:"4px" }}>RESOLVED THREAT</div>
              <div style={{ fontSize:"26px", color:threatColor, fontWeight:600, letterSpacing:"0.04em" }}>{threat}</div>
              <div style={{ fontSize:"9px", color:"#6a3030", marginTop:"4px", lineHeight:1.5 }}>
                Critic override — {REPORT.scout_data.environment_type}
              </div>
            </div>

            {/* Hazard list */}
            <div style={{ padding:"0 14px 14px", flex:1, overflowY:"auto" }}>
              <div style={{ fontSize:"8px", letterSpacing:"0.18em", color:"#1a4060", marginBottom:"8px" }}>HAZARD FACTORS</div>
              {REPORT.scout_data.hazard_factors.map((h, i) => (
                <div key={i} style={{ display:"flex", gap:"7px", alignItems:"flex-start", fontSize:"9px", marginBottom:"5px" }}>
                  <span style={{ color:"#f85149", flexShrink:0, marginTop:"1px" }}>▸</span>
                  <span style={{ color:"#4a6a80", lineHeight:1.5, textTransform:"capitalize" }}>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ─── CENTER COLUMN ─── */}
          <div style={{ display:"flex", flexDirection:"column", overflow:"hidden" }}>

            {/* Image feed */}
            <div style={{ padding:"12px 14px", borderBottom:"1px solid #0e1f2e", flexShrink:0 }}>
              <div style={{ fontSize:"8px", letterSpacing:"0.18em", color:"#1a4060", marginBottom:"8px", display:"flex", alignItems:"center", gap:"12px" }}>
                INPUT FEED
                {analyzing && <span style={{ color:"#f0883e", fontSize:"8px", animation:"blink 0.6s step-end infinite" }}>● ANALYZING…</span>}
              </div>
              <ImageZone src={src} onUpload={handleUpload} analyzing={analyzing}/>
            </div>

            {/* Commander plan */}
            <div style={{ padding:"12px 14px", flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
              <div style={{ fontSize:"8px", letterSpacing:"0.18em", color:"#1a4060", marginBottom:"10px", flexShrink:0 }}>COMMANDER — 3-STEP PLAN</div>
              <div style={{ display:"flex", flexDirection:"column", gap:"7px", flex:1, overflowY:"auto" }}>
                {REPORT.commander_plan.immediate_actions.map((action, i) => (
                  <div key={i} style={{
                    display:"flex", gap:"12px", padding:"10px 12px",
                    background: i === 0 ? "rgba(248,81,73,0.04)" : "#040b12",
                    border:     `1px solid ${i === 0 ? "rgba(248,81,73,0.3)" : "#0e1f2e"}`,
                    borderRadius:"3px", alignItems:"flex-start", flexShrink:0,
                  }}>
                    <span style={{ fontSize:"9px", fontWeight:600, color: i === 0 ? "#f85149" : "#1a4060", minWidth:"20px", marginTop:"1px" }}>
                      {String(i+1).padStart(2,"0")}
                    </span>
                    <p style={{ fontSize:"11px", lineHeight:1.6, color: i === 0 ? "#c06050" : i === 1 ? "#4a8aaa" : "#3a6a80", margin:0 }}>
                      {action}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Status bar */}
            <div style={{ height:"32px", borderTop:"1px solid #0e1f2e", background:"#040b12", display:"flex", alignItems:"center", padding:"0 14px", gap:"22px", flexShrink:0 }}>
              {[["PIPELINE","4-AGENT SWARM"],["BASE THREAT", REPORT.risk_assessment.threat_level],["CONFIDENCE","0.94"],["LATENCY","1.2s"]].map(([k,v])=>(
                <span key={k} style={{ fontSize:"8px", letterSpacing:"0.08em", color:"#1a3a52" }}>
                  {k} <span style={{ color:"#1e5a7a" }}>{v}</span>
                </span>
              ))}
            </div>
          </div>

          {/* ─── RIGHT COLUMN ─── */}
          <div style={{ borderLeft:"1px solid #0e1f2e", display:"flex", flexDirection:"column", overflow:"hidden" }}>

            {/* Debate log */}
            <div style={{ flex:"0 0 55%", borderBottom:"1px solid #0e1f2e", padding:"12px 14px", display:"flex", flexDirection:"column", overflow:"hidden" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"10px", flexShrink:0 }}>
                <span style={{ fontSize:"8px", letterSpacing:"0.18em", color:"#1a4060" }}>AGENT DEBATE LOG</span>
                <span style={{ fontSize:"7px", letterSpacing:"0.1em", border:"1px solid rgba(248,81,73,0.5)", color:"#f85149", padding:"1px 6px", borderRadius:"2px" }}>LIVE</span>
              </div>
              <DebateLog entries={logEntries}/>
            </div>

            {/* JSON output */}
            <div style={{ flex:1, padding:"12px 14px", overflowY:"auto" }}>
              <div style={{ fontSize:"8px", letterSpacing:"0.18em", color:"#1a4060", marginBottom:"8px" }}>RAW JSON OUTPUT</div>
              <div style={{ background:"#030a10", border:"1px solid #0e1f2e", borderRadius:"3px", padding:"10px 12px", fontSize:"10px", lineHeight:1.9, fontFamily:"monospace" }}>
                <span style={{ color:"#2a5a7a" }}>{"{"}</span><br/>
                {([
                  ["threat",          `"${threat}"`,                              "#f85149"],
                  ["base_threat",     `"${REPORT.risk_assessment.threat_level}"`, "#5a8aaa"],
                  ["entities",        String(REPORT.scout_data.people_count),      "#e0a050"],
                  ["critic_override", "true",                                      "#3fb950"],
                  ["confidence",      "0.94",                                      "#e0a050"],
                  ["plan_steps",      `["perimeter","safe_zones","broadcast"]`,    "#5a8aaa"],
                ] as const).map(([k,v,c]) => (
                  <span key={k}>
                    {"  "}
                    <span style={{ color:"#3a7aaa" }}>&quot;{k}&quot;</span>
                    <span style={{ color:"#2a5a7a" }}>: </span>
                    <span style={{ color:c }}>{v}</span>
                    <span style={{ color:"#2a5a7a" }}>,</span><br/>
                  </span>
                ))}
                <span style={{ color:"#2a5a7a" }}>{"}"}</span>
              </div>

              {/* Critic reasoning */}
              <div style={{ marginTop:"8px", padding:"9px 12px", background:"rgba(248,81,73,0.03)", border:"1px solid rgba(248,81,73,0.18)", borderRadius:"3px" }}>
                <div style={{ fontSize:"7px", letterSpacing:"0.14em", color:"#5a2020", marginBottom:"5px" }}>CRITIC REASONING</div>
                <p style={{ fontSize:"9px", color:"#7a4040", lineHeight:1.6, margin:0 }}>
                  {REPORT.critic_review.critic_reasoning}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}