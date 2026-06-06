import { useState, useEffect } from "react";

const FONT = "'Inter', sans-serif";
const PARK_ICONS = { mk:"🏰", ep:"🌍", hs:"🎬", ak:"🦁" };
const PARK_NAMES = { mk:"Magic Kingdom", ep:"EPCOT", hs:"Hollywood Studios", ak:"Animal Kingdom" };
const HOURS = Array.from({length:14}, (_,i) => {
  const h = 9 + i;
  return { label: h < 12 ? `${h}:00 AM` : h === 12 ? "12:00 PM" : `${h-12}:00 PM`, value: h };
});

function loadPlans() {
  try { return JSON.parse(localStorage.getItem("dwt_plans") || "{}"); } catch { return {}; }
}
function savePlans(plans) {
  try { localStorage.setItem("dwt_plans", JSON.stringify(plans)); } catch {}
}

function todayKey() {
  return new Date().toISOString().slice(0,10);
}

export default function DayPlanner({ T, dark, accent, accentLight, accentDark, parks, onClose, token, prefill, activeParkId }) {
  const [plans, setPlans]           = useState(() => loadPlans());
  const [planDate, setPlanDate]     = useState(todayKey());
  const [showAddModal, setShowAddModal] = useState(null);

  // Auto-open add modal when coming from a ride card
  useEffect(() => {
    if (prefill) setShowAddModal(true);
  }, [prefill]);
  const [editItem, setEditItem]     = useState(null);
  const [syncing, setSyncing]       = useState(false);

  const plan = plans[planDate] || [];

  // Persist locally whenever plans change
  useEffect(() => { savePlans(plans); }, [plans]);

  // Sync to server
  async function syncToServer(updatedPlans) {
    if (!token) return;
    try {
      setSyncing(true);
      await fetch("/api/profile", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ plans: updatedPlans }),
      });
    } catch {} finally { setSyncing(false); }
  }

  function updatePlan(date, items) {
    const updated = { ...plans, [date]: items };
    setPlans(updated);
    syncToServer(updated);
  }

  function addItem(item) {
    const updated = [...plan, item].sort((a,b) => a.hour - b.hour || a.minute - b.minute);
    updatePlan(planDate, updated);
    setShowAddModal(null);
    setEditItem(null);
  }

  function removeItem(idx) {
    const updated = plan.filter((_,i) => i !== idx);
    updatePlan(planDate, updated);
  }

  function moveItem(idx, dir) {
    const updated = [...plan];
    const swap = idx + dir;
    if (swap < 0 || swap >= updated.length) return;
    [updated[idx], updated[swap]] = [updated[swap], updated[idx]];
    updatePlan(planDate, updated);
  }

  // Generate a week of dates starting today
  const dates = Array.from({length:7}, (_,i) => {
    const d = new Date(); d.setDate(d.getDate()+i);
    return { key: d.toISOString().slice(0,10), label: i===0?"Today":i===1?"Tomorrow":d.toLocaleDateString([],{weekday:"short",month:"short",day:"numeric"}) };
  });

  const typeConfig = {
    ride:  { icon:"🎢", color: dark?"#93c5fd":"#1d4ed8", bg: dark?"#1e3a5f":"#dbeafe" },
    show:  { icon:"🎭", color: dark?"#d8b4fe":"#6b21a8", bg: dark?"#2e1065":"#f3e8ff" },
    meal:  { icon:"🍽️", color: dark?"#6ee7b7":"#065f46", bg: dark?"#064e3b":"#d1fae5" },
    break: { icon:"⏸️", color: dark?"#fca5a5":"#991b1b", bg: dark?"#3b0a0a":"#fee2e2" },
    other: { icon:"📍", color: dark?"#fbbf24":"#854d0e", bg: dark?"#422006":"#fef9c3" },
  };

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:T.bg,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:500,maxHeight:"92vh",overflow:"auto",boxShadow:"0 -4px 32px rgba(0,0,0,0.3)" }}>

        {/* Header */}
        <div style={{ padding:"20px 20px 0",position:"sticky",top:0,background:T.bg,zIndex:1,borderBottom:`1px solid ${T.border}`,paddingBottom:14 }}>
          <div style={{ width:36,height:4,borderRadius:2,background:T.border,margin:"0 auto 16px" }} />
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
            <div style={{ color:T.text,fontWeight:700,fontSize:18,fontFamily:FONT }}>
              📋 Day Planner {syncing && <span style={{ color:T.textMuted,fontSize:11,fontWeight:400 }}>Saving…</span>}
            </div>
            <button onClick={onClose} style={{ background:"none",border:"none",color:T.textMuted,fontSize:22,cursor:"pointer" }}>✕</button>
          </div>

          {/* Date selector */}
          <div style={{ display:"flex",gap:6,overflowX:"auto",paddingBottom:2 }}>
            {dates.map(d => (
              <button key={d.key} onClick={()=>setPlanDate(d.key)} style={{
                background: planDate===d.key?accent:T.surface,
                color: planDate===d.key?"#fff":T.textSub,
                border:`1px solid ${planDate===d.key?accent:T.border}`,
                borderRadius:20,padding:"5px 14px",fontSize:12,
                fontWeight:planDate===d.key?700:400,cursor:"pointer",
                whiteSpace:"nowrap",fontFamily:FONT,
              }}>
                {d.label}
                {(plans[d.key]||[]).length > 0 && planDate!==d.key && (
                  <span style={{ marginLeft:5,background:accent,color:"#fff",borderRadius:10,padding:"0 5px",fontSize:10 }}>{(plans[d.key]||[]).length}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Plan body */}
        <div style={{ padding:"16px 20px 40px" }}>

          {/* Empty state */}
          {plan.length === 0 && (
            <div style={{ textAlign:"center",padding:"32px 20px",color:T.textMuted,fontFamily:FONT }}>
              <div style={{ fontSize:40,marginBottom:12 }}>📋</div>
              <div style={{ fontSize:15,fontWeight:600,color:T.textSub,marginBottom:8 }}>No plans yet</div>
              <div style={{ fontSize:13,marginBottom:20 }}>Tap + to add rides, shows, meals and more</div>
            </div>
          )}

          {/* Timeline */}
          {plan.map((item, idx) => {
            const tc = typeConfig[item.type] || typeConfig.other;
            const parkIcon = item.parkId ? PARK_ICONS[item.parkId] : "";
            const timeLabel = (() => {
              const h = item.hour, m = item.minute || 0;
              const ampm = h < 12 ? "AM" : "PM";
              const h12 = h === 0 ? 12 : h > 12 ? h-12 : h;
              return `${h12}:${String(m).padStart(2,"0")} ${ampm}`;
            })();
            return (
              <div key={idx} style={{ display:"flex",gap:12,marginBottom:12,alignItems:"flex-start" }}>
                {/* Time */}
                <div style={{ minWidth:60,textAlign:"right",paddingTop:12 }}>
                  <div style={{ color:accent,fontSize:11,fontWeight:700,fontFamily:FONT }}>{timeLabel}</div>
                </div>
                {/* Line + dot */}
                <div style={{ display:"flex",flexDirection:"column",alignItems:"center",paddingTop:14 }}>
                  <div style={{ width:10,height:10,borderRadius:"50%",background:tc.color,flexShrink:0 }} />
                  {idx < plan.length-1 && <div style={{ width:2,height:40,background:T.border,marginTop:2 }} />}
                </div>
                {/* Card */}
                <div style={{ flex:1,background:tc.bg,borderRadius:12,padding:"10px 14px",border:`1px solid ${tc.color}33` }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:3 }}>
                        <span style={{ fontSize:16 }}>{tc.icon}</span>
                        <span style={{ color:T.text,fontWeight:600,fontSize:14,fontFamily:FONT }}>{item.name}</span>
                      </div>
                      <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                        {item.parkId && (
                          <span style={{ color:tc.color,fontSize:11,fontFamily:FONT }}>{parkIcon} {PARK_NAMES[item.parkId]}</span>
                        )}
                        {item.duration && (
                          <span style={{ color:T.textMuted,fontSize:11,fontFamily:FONT }}>⏱ {item.duration} min</span>
                        )}
                        {item.note && (
                          <span style={{ color:T.textMuted,fontSize:11,fontFamily:FONT }}>📝 {item.note}</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display:"flex",gap:4,flexShrink:0,marginLeft:8 }}>
                      <button onClick={()=>moveItem(idx,-1)} disabled={idx===0} style={{ background:"none",border:"none",cursor:idx===0?"default":"pointer",color:T.textMuted,fontSize:14,opacity:idx===0?0.3:1,padding:"2px 4px" }}>↑</button>
                      <button onClick={()=>moveItem(idx,1)} disabled={idx===plan.length-1} style={{ background:"none",border:"none",cursor:idx===plan.length-1?"default":"pointer",color:T.textMuted,fontSize:14,opacity:idx===plan.length-1?0.3:1,padding:"2px 4px" }}>↓</button>
                      <button onClick={()=>removeItem(idx)} style={{ background:"none",border:"none",cursor:"pointer",color:"#ef4444",fontSize:14,padding:"2px 4px" }}>✕</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add button */}
          <button onClick={()=>setShowAddModal(true)} style={{ width:"100%",padding:"12px",borderRadius:14,border:`2px dashed ${accent}`,background:"transparent",color:accent,fontFamily:FONT,fontWeight:700,fontSize:14,cursor:"pointer",marginTop:plan.length?8:0 }}>
            + Add to Plan
          </button>
        </div>
      </div>

      {/* Add item modal */}
      {showAddModal && (
        <AddItemModal
          T={T} dark={dark} accent={accent} accentLight={accentLight}
          typeConfig={typeConfig} parks={parks}
          prefill={prefill} activeParkId={activeParkId}
          onAdd={addItem} onClose={()=>setShowAddModal(false)}
        />
      )}
    </div>
  );
}

function AddItemModal({ T, dark, accent, accentLight, typeConfig, parks, prefill, activeParkId, onAdd, onClose }) {
  const [type,     setType]     = useState(prefill?.type || "ride");
  const [name,     setName]     = useState(prefill?.name || "");
  const [parkId,   setParkId]   = useState(prefill?.parkId || activeParkId || "");
  const [hour,     setHour]     = useState(10);
  const [minute,   setMinute]   = useState(0);
  const [duration, setDuration] = useState(30);
  const [note,     setNote]     = useState("");
  const [search,   setSearch]   = useState("");

  // Compute best time suggestion from trend data
  const bestTimeSuggestion = (() => {
    if (!prefill?.name || !parks) return null;
    try {
      // Find the ride in live data to get its entity type
      for (const [pid, parkData] of Object.entries(parks)) {
        const entities = parkData?.liveData || [];
        const found = entities.find(e => e.name === prefill.name);
        if (found) {
          // Use typical curves as approximation (real trend via API not available here)
          const thrillMap = { high: "high", medium: "medium", low: "low" };
          const n = prefill.name.toLowerCase();
          const thrill = (n.includes("mountain") || n.includes("coaster") || n.includes("tower") || 
            n.includes("everest") || n.includes("resistance") || n.includes("slinky") || 
            n.includes("guardians") || n.includes("tron")) ? "high" :
            (n.includes("soarin") || n.includes("test track") || n.includes("frozen") || 
            n.includes("haunted") || n.includes("pirates")) ? "medium" : "low";
          const CURVES = {
            high:   [0.45,0.90,1.25,1.45,1.50,1.45,1.35,1.20,1.05,0.90,0.80,0.65,0.50,0.35],
            medium: [0.35,0.65,1.00,1.25,1.35,1.30,1.20,1.10,0.95,0.85,0.75,0.60,0.45,0.30],
            low:    [0.30,0.50,0.75,0.95,1.05,1.10,1.00,0.90,0.80,0.70,0.60,0.50,0.35,0.25],
          };
          const curve = CURVES[thrill];
          const HOUR_LABELS = ["9am","10am","11am","12pm","1pm","2pm","3pm","4pm","5pm","6pm","7pm","8pm","9pm","10pm"];
          const best = curve.map((v,i)=>({v,i,label:HOUR_LABELS[i],hour:9+i})).sort((a,b)=>a.v-b.v).slice(0,3);
          return best;
        }
      }
    } catch {}
    return null;
  })();

  // Pull ride/show names from all parks for autocomplete
  const suggestions = (() => {
    if (!parks || !search.trim()) return [];
    const q = search.toLowerCase();
    const results = [];
    for (const [pid, parkData] of Object.entries(parks)) {
      const entities = parkData?.liveData || [];
      for (const e of entities) {
        if (e.name.toLowerCase().includes(q)) {
          results.push({ name:e.name, parkId:pid, type: e.entityType==="SHOW"?"show":"ride" });
        }
      }
    }
    return results.slice(0,8);
  })();

  function handleSubmit() {
    if (!name.trim()) return;
    onAdd({ type, name:name.trim(), parkId:parkId||null, hour, minute, duration:duration||null, note:note.trim()||null });
  }

  const inputStyle = { width:"100%",padding:"10px 12px",borderRadius:10,border:`1px solid ${T.border}`,background:T.bg,color:T.text,fontFamily:FONT,fontSize:14,outline:"none",boxSizing:"border-box" };

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:T.surface,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:500,maxHeight:"85vh",overflow:"auto",padding:"24px 20px 44px",boxShadow:"0 -4px 24px rgba(0,0,0,0.3)" }}>
        <div style={{ width:36,height:4,borderRadius:2,background:T.border,margin:"0 auto 20px" }} />
        <div style={{ color:T.text,fontWeight:700,fontSize:17,fontFamily:FONT,marginBottom:16 }}>Add to Plan</div>

        {/* Type selector */}
        <div style={{ display:"flex",gap:6,marginBottom:16,flexWrap:"wrap" }}>
          {Object.entries(typeConfig).map(([id,tc])=>(
            <button key={id} onClick={()=>setType(id)} style={{ background:type===id?accent:T.bg,color:type===id?"#fff":T.textSub,border:`1px solid ${type===id?accent:T.border}`,borderRadius:20,padding:"5px 12px",fontSize:12,fontWeight:type===id?700:400,cursor:"pointer",fontFamily:FONT }}>
              {tc.icon} {id.charAt(0).toUpperCase()+id.slice(1)}
            </button>
          ))}
        </div>

        {/* Name with search */}
        <div style={{ marginBottom:12,position:"relative" }}>
          <label style={{ color:T.textSub,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:1,fontFamily:FONT,display:"block",marginBottom:6 }}>Name</label>
          <input value={name} onChange={e=>{setName(e.target.value);setSearch(e.target.value);}} placeholder={type==="ride"?"e.g. Space Mountain":type==="show"?"e.g. Festival of the Lion King":type==="meal"?"e.g. Be Our Guest":"e.g. Rest break"} style={inputStyle} />
          {suggestions.length > 0 && (
            <div style={{ position:"absolute",top:"100%",left:0,right:0,background:T.surface,borderRadius:10,border:`1px solid ${T.border}`,boxShadow:"0 4px 16px rgba(0,0,0,0.15)",zIndex:10,maxHeight:200,overflow:"auto" }}>
              {suggestions.map((s,i)=>(
                <div key={i} onClick={()=>{setName(s.name);setParkId(s.parkId);setType(s.type);setSearch("");}} style={{ padding:"10px 14px",cursor:"pointer",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:8 }}>
                  <span>{typeConfig[s.type]?.icon}</span>
                  <div>
                    <div style={{ color:T.text,fontSize:13,fontFamily:FONT }}>{s.name}</div>
                    <div style={{ color:T.textMuted,fontSize:11,fontFamily:FONT }}>{s.parkId?.toUpperCase()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Park */}
        <div style={{ marginBottom:12 }}>
          <label style={{ color:T.textSub,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:1,fontFamily:FONT,display:"block",marginBottom:6 }}>Park</label>
          <select value={parkId} onChange={e=>setParkId(e.target.value)} style={{ ...inputStyle,cursor:"pointer" }}>
            <option value="">Any / Not specified</option>
            {["mk","ep","hs","ak"].map(pid=><option key={pid} value={pid}>{PARK_ICONS[pid]} {PARK_NAMES[pid]}</option>)}
          </select>
        </div>

        {/* Best time suggestion */}
        {bestTimeSuggestion && (
          <div style={{ marginBottom:14, background:dark?"#052e16":"#dcfce7", borderRadius:12, padding:"12px 14px", border:`1px solid ${dark?"#166534":"#86efac"}` }}>
            <div style={{ color:dark?"#4ade80":"#15803d", fontWeight:700, fontSize:12, fontFamily:FONT, marginBottom:8 }}>
              ⭐ Suggested best times for {prefill?.name}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              {bestTimeSuggestion.map((b,i) => (
                <button key={i} onClick={()=>setHour(b.hour)} style={{
                  flex:1, padding:"8px 4px", borderRadius:10, border:`1.5px solid ${hour===b.hour?(dark?"#4ade80":"#15803d"):"transparent"}`,
                  background: hour===b.hour?(dark?"#166534":"#bbf7d0"):(dark?"#064e3b":"#f0fdf4"),
                  cursor:"pointer", textAlign:"center",
                }}>
                  <div style={{ color:dark?"#4ade80":"#15803d", fontWeight:700, fontSize:13, fontFamily:FONT }}>{b.label}</div>
                  <div style={{ color:dark?"#86efac":"#166534", fontSize:10, fontFamily:FONT }}>Low crowd</div>
                </button>
              ))}
            </div>
            <div style={{ color:dark?"#86efac":"#166534", fontSize:10, fontFamily:FONT, marginTop:6 }}>Tap a time to use it, or set your own below</div>
          </div>
        )}

        {/* Time */}
        <div style={{ display:"flex",gap:10,marginBottom:12 }}>
          <div style={{ flex:1 }}>
            <label style={{ color:T.textSub,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:1,fontFamily:FONT,display:"block",marginBottom:6 }}>Time</label>
            <select value={hour} onChange={e=>setHour(Number(e.target.value))} style={{ ...inputStyle,cursor:"pointer" }}>
              {HOURS.map(h=><option key={h.value} value={h.value}>{h.label}</option>)}
            </select>
          </div>
          <div style={{ flex:1 }}>
            <label style={{ color:T.textSub,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:1,fontFamily:FONT,display:"block",marginBottom:6 }}>Minutes</label>
            <select value={minute} onChange={e=>setMinute(Number(e.target.value))} style={{ ...inputStyle,cursor:"pointer" }}>
              {[0,15,30,45].map(m=><option key={m} value={m}>:{String(m).padStart(2,"0")}</option>)}
            </select>
          </div>
          <div style={{ flex:1 }}>
            <label style={{ color:T.textSub,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:1,fontFamily:FONT,display:"block",marginBottom:6 }}>Duration</label>
            <select value={duration} onChange={e=>setDuration(Number(e.target.value))} style={{ ...inputStyle,cursor:"pointer" }}>
              {[15,30,45,60,90,120].map(d=><option key={d} value={d}>{d} min</option>)}
            </select>
          </div>
        </div>

        {/* Note */}
        <div style={{ marginBottom:20 }}>
          <label style={{ color:T.textSub,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:1,fontFamily:FONT,display:"block",marginBottom:6 }}>Note (optional)</label>
          <input value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. Meet at entrance, grab Lightning Lane" style={inputStyle} />
        </div>

        <button onClick={handleSubmit} disabled={!name.trim()} style={{ width:"100%",padding:13,borderRadius:14,border:"none",background:name.trim()?accent:"#9ca3af",color:"#fff",fontFamily:FONT,fontWeight:700,fontSize:15,cursor:name.trim()?"pointer":"default" }}>
          Add to Plan
        </button>
      </div>
    </div>
  );
}
