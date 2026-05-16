import { useState, useEffect } from "react";

const FONT = "'Inter', sans-serif";
const PARK_NAMES = { mk:"Magic Kingdom", ep:"EPCOT", hs:"Hollywood Studios", ak:"Animal Kingdom" };
const PARK_ICONS = { mk:"🏰", ep:"🌍", hs:"🎬", ak:"🦁" };
const PARK_IDS   = ["mk","ep","hs","ak"];
const DAY_LABELS = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function crowdLevel(avg) {
  if (avg == null) return null;
  if (avg < 20) return { label:"Low",      color:"#22c55e", bg:"#dcfce7", darkBg:"#052e16", darkFg:"#4ade80" };
  if (avg < 35) return { label:"Moderate", color:"#eab308", bg:"#fef9c3", darkBg:"#422006", darkFg:"#fbbf24" };
  if (avg < 50) return { label:"High",     color:"#f97316", bg:"#ffedd5", darkBg:"#431407", darkFg:"#fb923c" };
  return               { label:"Peak",     color:"#ef4444", bg:"#fee2e2", darkBg:"#3b0a0a", darkFg:"#f87171" };
}

async function fetchCalendar(parkId, days) {
  const res = await fetch(`/api/crowd-calendar?parkId=${parkId}&days=${days}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

function buildGrid(calendar) {
  if (!calendar?.length) return [];
  const firstDow = calendar[0].dow;
  const padded = [...Array(firstDow).fill(null), ...calendar];
  const weeks = [];
  for (let i=0; i<padded.length; i+=7) weeks.push(padded.slice(i, i+7));
  return weeks;
}

function mergeParks(parks) {
  if (!parks) return [];
  const allDates = parks.mk || [];
  return allDates.map((day, i) => {
    const avgs = PARK_IDS.map(pid => parks[pid]?.[i]?.avg).filter(v => v != null);
    const isReal = PARK_IDS.some(pid => parks[pid]?.[i]?.isReal);
    return { ...day, avg: avgs.length ? Math.round(avgs.reduce((a,b)=>a+b,0)/avgs.length) : null, isReal };
  });
}

export default function CrowdCalendar({ T, dark, accent, accentLight, accentDark, onClose }) {
  const [selectedPark, setSelectedPark] = useState("all");
  const [days, setDays]   = useState(30);
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true); setError(null);
    fetchCalendar(selectedPark, days)
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [selectedPark, days]);

  const isAll    = selectedPark === "all";
  const calData  = isAll ? mergeParks(data?.parks) : (data?.parks?.[selectedPark] || []);
  const weeks    = buildGrid(calData);
  const realDays = calData.filter(d => d.avg != null);
  const bestDay  = realDays.length ? [...realDays].sort((a,b)=>a.avg-b.avg)[0] : null;
  const worstDay = realDays.length ? [...realDays].sort((a,b)=>b.avg-a.avg)[0] : null;
  const today    = new Date().toISOString().slice(0,10);

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:T.bg,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:500,maxHeight:"90vh",overflow:"auto",boxShadow:"0 -4px 32px rgba(0,0,0,0.3)" }}>

        {/* Sticky header */}
        <div style={{ padding:"20px 20px 0",position:"sticky",top:0,background:T.bg,zIndex:1 }}>
          <div style={{ width:36,height:4,borderRadius:2,background:T.border,margin:"0 auto 16px" }} />
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
            <div style={{ color:T.text,fontWeight:700,fontSize:18,fontFamily:FONT }}>📅 Crowd Calendar</div>
            <button onClick={onClose} style={{ background:"none",border:"none",color:T.textMuted,fontSize:22,cursor:"pointer" }}>✕</button>
          </div>

          {/* Park selector */}
          <div style={{ display:"flex",gap:6,overflowX:"auto",paddingBottom:2,marginBottom:12 }}>
            {[{id:"all",label:"🏳️ All"},...PARK_IDS.map(pid=>({id:pid,label:`${PARK_ICONS[pid]} ${pid.toUpperCase()}`}))].map(({id,label})=>(
              <button key={id} onClick={()=>setSelectedPark(id)} style={{ background:selectedPark===id?accent:T.surface,color:selectedPark===id?"#fff":T.textSub,border:`1px solid ${selectedPark===id?accent:T.border}`,borderRadius:20,padding:"5px 14px",fontSize:12,fontWeight:selectedPark===id?700:400,cursor:"pointer",whiteSpace:"nowrap",fontFamily:FONT }}>{label}</button>
            ))}
          </div>

          {/* Days range */}
          <div style={{ display:"flex",gap:6,marginBottom:14 }}>
            {[14,30,60,90].map(d=>(
              <button key={d} onClick={()=>setDays(d)} style={{ flex:1,background:days===d?accent:T.surface,color:days===d?"#fff":T.textSub,border:`1px solid ${days===d?accent:T.border}`,borderRadius:10,padding:"6px 0",fontSize:12,fontWeight:days===d?700:400,cursor:"pointer",fontFamily:FONT }}>{d}d</button>
            ))}
          </div>

          {/* Legend */}
          <div style={{ display:"flex",gap:10,marginBottom:14,flexWrap:"wrap" }}>
            {[{label:"Low",avg:10},{label:"Moderate",avg:28},{label:"High",avg:42},{label:"Peak",avg:58}].map(({label,avg})=>{
              const lvl = crowdLevel(avg);
              return (
                <div key={label} style={{ display:"flex",alignItems:"center",gap:4 }}>
                  <div style={{ width:12,height:12,borderRadius:3,background:dark?lvl.darkFg:lvl.color }} />
                  <span style={{ color:T.textMuted,fontSize:10,fontFamily:FONT }}>{label}</span>
                </div>
              );
            })}
            <div style={{ display:"flex",alignItems:"center",gap:4 }}>
              <div style={{ width:12,height:12,borderRadius:3,background:T.border,opacity:0.6 }} />
              <span style={{ color:T.textMuted,fontSize:10,fontFamily:FONT }}>Estimated</span>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div style={{ padding:"0 20px 32px" }}>
          {loading && <div style={{ textAlign:"center",padding:"40px 0",color:T.textMuted,fontFamily:FONT }}>Loading calendar…</div>}
          {error   && <div style={{ background:dark?"#3b0a0a":"#fee2e2",borderRadius:12,padding:"12px 16px",color:dark?"#f87171":"#991b1b",fontFamily:FONT,fontSize:13 }}>⚠️ {error}</div>}

          {!loading && !error && weeks.length > 0 && (
            <>
              {/* Day header */}
              <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:6 }}>
                {DAY_LABELS.map(d=><div key={d} style={{ textAlign:"center",color:T.textMuted,fontSize:11,fontFamily:FONT,fontWeight:600 }}>{d}</div>)}
              </div>

              {/* Weeks */}
              {weeks.map((week,wi) => {
                const firstReal = week.find(d=>d!=null);
                const showMonth = firstReal && (wi===0 || week.find(d=>d!=null)?.date?.slice(8,10)==="01");
                return (
                  <div key={wi}>
                    {showMonth && firstReal && (
                      <div style={{ color:T.textSub,fontSize:11,fontFamily:FONT,fontWeight:600,marginBottom:4,marginTop:wi>0?8:0 }}>
                        {MONTH_NAMES[parseInt(firstReal.date.slice(5,7))-1]} {firstReal.date.slice(0,4)}
                      </div>
                    )}
                    <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:4 }}>
                      {Array.from({length:7},(_,di)=>{
                        const day = week[di];
                        if (!day) return <div key={di} />;
                        const lvl = day.avg!=null ? crowdLevel(day.avg) : null;
                        const isToday = day.date === today;
                        const cellBg = lvl ? (dark?lvl.darkBg:lvl.bg) : T.surface;
                        const cellFg = lvl ? (dark?lvl.darkFg:lvl.color) : T.textMuted;
                        return (
                          <div key={di} title={`${day.date}: ${lvl?.label??"No data"} (~${day.avg??'?'}m avg)`} style={{ background:cellBg,borderRadius:8,padding:"6px 2px",textAlign:"center",border:isToday?`2px solid ${accent}`:`1px solid ${day.isReal?"transparent":T.border}`,opacity:day.isReal?1:0.65,minHeight:44,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2 }}>
                            <div style={{ color:isToday?accent:T.textSub,fontSize:11,fontWeight:isToday?800:500,fontFamily:FONT }}>{parseInt(day.date.slice(8,10))}</div>
                            {lvl && <>
                              <div style={{ width:8,height:8,borderRadius:"50%",background:dark?lvl.darkFg:lvl.color }} />
                              <div style={{ color:cellFg,fontSize:8,fontFamily:FONT,fontWeight:600,lineHeight:1 }}>{lvl.label[0]}</div>
                            </>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Best / worst */}
              {bestDay && worstDay && (
                <div style={{ display:"flex",gap:10,marginTop:14 }}>
                  {[
                    { day:bestDay,  bg:dark?"#052e16":"#dcfce7", border:dark?"#166534":"#86efac", color:dark?"#4ade80":"#15803d", label:"⭐ Least Crowded" },
                    { day:worstDay, bg:dark?"#3b0a0a":"#fee2e2", border:dark?"#7f1d1d":"#fecaca", color:dark?"#f87171":"#991b1b", label:"⚠️ Most Crowded" },
                  ].map(({day,bg,border,color,label})=>(
                    <div key={label} style={{ flex:1,background:bg,borderRadius:14,padding:"12px 14px",border:`1px solid ${border}` }}>
                      <div style={{ color,fontWeight:700,fontSize:12,fontFamily:FONT,marginBottom:4 }}>{label}</div>
                      <div style={{ color,fontWeight:800,fontSize:15,fontFamily:FONT }}>{new Date(day.date+"T12:00:00").toLocaleDateString([],{weekday:"short",month:"short",day:"numeric"})}</div>
                      <div style={{ color,fontSize:11,fontFamily:FONT,opacity:0.8 }}>~{day.avg}m avg wait</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Per-park comparison for "all" view */}
              {isAll && data?.parks && (
                <div style={{ marginTop:14 }}>
                  <div style={{ color:T.textSub,fontSize:11,fontFamily:FONT,fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:10 }}>Park Comparison</div>
                  {PARK_IDS.map(pid=>{
                    const parkCal  = data.parks[pid]||[];
                    const parkReal = parkCal.filter(d=>d.avg!=null);
                    if (!parkReal.length) return null;
                    const parkAvg = Math.round(parkReal.reduce((s,d)=>s+d.avg,0)/parkReal.length);
                    const lvl = crowdLevel(parkAvg);
                    return (
                      <div key={pid} style={{ background:T.surface,borderRadius:14,border:`1px solid ${T.border}`,padding:"12px 16px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                          <span style={{ fontSize:20 }}>{PARK_ICONS[pid]}</span>
                          <div>
                            <div style={{ color:T.text,fontWeight:600,fontSize:13,fontFamily:FONT }}>{PARK_NAMES[pid]}</div>
                            <div style={{ color:T.textMuted,fontSize:11,fontFamily:FONT }}>Avg ~{parkAvg}m wait</div>
                          </div>
                        </div>
                        <span style={{ background:dark?lvl.darkBg:lvl.bg,color:dark?lvl.darkFg:lvl.color,borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:700,fontFamily:FONT,border:`1px solid ${(dark?lvl.darkFg:lvl.color)}33` }}>{lvl.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
