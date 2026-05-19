import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { eventsData } from '../../assets/eventsData';
import './CalendrierPage.css';

const MONTHS_AR = {
  'يناير':0,'فبراير':1,'مارس':2,'أبريل':3,'ماي':4,'يونيو':5,
  'يوليوز':6,'غشت':7,'شتنبر':8,'أكتوبر':9,'نونبر':10,'دجنبر':11,
};
const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAYS_FR   = ['L','M','M','J','V','S','D'];

function parseArDate(str) {
  if (!str) return null;
  let day=null, month=null;
  for (const p of str.trim().split(/\s+/)) {
    const n=parseInt(p,10);
    if(!isNaN(n)) day=n;
    else if(MONTHS_AR[p]!==undefined) month=MONTHS_AR[p];
  }
  return (day&&month!==null)?{day,month}:null;
}

function buildEventMap(events) {
  const map={};
  events.forEach(evt=>{
    const p=parseArDate(evt.date);
    if(!p) return;
    const k=`${p.month}-${p.day}`;
    if(!map[k]) map[k]=[];
    map[k].push(evt);
  });
  return map;
}

const DOT_COLORS=['#e8944a','#3a9e6e','#e05555','#4a90d9','#9b59b6','#e67e22','#1abc9c'];

export default function CalendrierPage() {
  const today=new Date();
  const [month,setMonth]=useState(today.getMonth());
  const [year,setYear]=useState(today.getFullYear());
  const [active,setActive]=useState(null);

  const eventMap=useMemo(()=>buildEventMap(eventsData),[]);

  const prev=()=>{if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1);setActive(null);};
  const next=()=>{if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1);setActive(null);};

  const cells=useMemo(()=>{
    const firstDay = new Date(year,month,1).getDay();
    const first = (firstDay + 6) % 7; // Convert so Monday is 0, Sunday is 6
    const days=new Date(year,month+1,0).getDate();
    const g=[];
    for(let i=0;i<first;i++) g.push(null);
    for(let d=1;d<=days;d++) g.push(d);
    return g;
  },[month,year]);

  // Events shown on the right panel
  const panelEvents=useMemo(()=>{
    if(active) return (eventMap[`${month}-${active}`]||[]).map(e=>({...e,day:active}));
    const res=[];
    for(let d=1;d<=31;d++) (eventMap[`${month}-${d}`]||[]).forEach(e=>res.push({...e,day:d}));
    return res;
  },[month,active,eventMap]);

  return (
    <div className="cp-page page-enter">
      <Navbar />

      {/* ── Hero ── */}
      <header className="desc-hero">
        <div className="desc-hero-bg"><div className="desc-hero-overlay"></div></div>
        <div className="evts-container desc-hero-content">
          <div className="badge-identity">Agenda AJCM</div>
          <h1 className="animate-title">Calendrier des Événements</h1>
          <p className="desc-subtitle animate-subtitle">Cliquez sur une date pour voir les événements associés.</p>
        </div>
      </header>

      {/* ── Split Section ── */}
      <section className="cp-split">

        {/* LEFT — Calendar */}
        <div className="cp-left">
          <div className="cp-cal-card">
            {/* Header */}
            <div className="cp-cal-header">
              <button className="cp-nav-btn" onClick={prev}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <div className="cp-cal-month">
                <span className="cp-cal-month-name">{MONTHS_FR[month]}</span>
                <span className="cp-cal-year">{year}</span>
              </div>
              <button className="cp-nav-btn" onClick={next}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>

            {/* Day Labels */}
            <div className="cp-day-labels">
              {DAYS_FR.map((d,i)=><div key={i} className="cp-day-label">{d}</div>)}
            </div>

            {/* Grid */}
            <div className="cp-grid">
              {cells.map((day,idx)=>{
                if(!day) return <div key={`_${idx}`} className="cp-cell cp-cell--empty"/>;
                const evts=eventMap[`${month}-${day}`]||[];
                const hasEvts=evts.length>0;
                const isToday=day===today.getDate()&&month===today.getMonth()&&year===today.getFullYear();
                const isActive=day===active;
                return (
                  <div
                    key={day}
                    className={`cp-cell${hasEvts?' cp-cell--has':''}${isToday?' cp-cell--today':''}${isActive?' cp-cell--active':''}`}
                    onClick={()=>hasEvts&&setActive(isActive?null:day)}
                  >
                    <span className="cp-cell-num">{day}</span>
                    {hasEvts&&(
                      <div className="cp-dots">
                        {evts.slice(0,3).map((_,ci)=>(
                          <span key={ci} className="cp-dot" style={{background:DOT_COLORS[ci%DOT_COLORS.length]}}/>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="cp-cal-footer">
              <div className="cp-cal-stat">
                <strong>{panelEvents.length}</strong>
                <span>événement(s) {active?`le ${active}`:`en ${MONTHS_FR[month]}`}</span>
              </div>
              {active&&(
                <button className="cp-clear-btn" onClick={()=>setActive(null)}>Tout le mois</button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — Events */}
        <div className="cp-right">
          <div className="cp-right-header">
            <h2 className="cp-right-title">
              {active?`${active} ${MONTHS_FR[month]} ${year}`:`${MONTHS_FR[month]} ${year}`}
            </h2>
            <p className="cp-right-sub">{panelEvents.length} événement(s) trouvé(s)</p>
          </div>

          {panelEvents.length===0?(
            <div className="cp-empty">
              <div className="cp-empty-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <p>Aucun événement.<br/>Cliquez sur un jour marqué d'un point pour en voir les détails.</p>
            </div>
          ):(
            <div className="cp-event-list">
              {panelEvents.map((evt,i)=>{
                const slug=encodeURIComponent(evt.folder);
                const color=DOT_COLORS[i%DOT_COLORS.length];
                return (
                  <Link to={`/evenements/${slug}`} key={i} className="cp-evt-card">
                    <div className="cp-evt-poster" style={{borderLeftColor:color}}>
                      <img
                        src={`/Events/${evt.folder}/poster.jpg`}
                        alt={evt.title}
                        onError={e=>{e.target.style.display='none';}}
                      />
                    </div>
                    <div className="cp-evt-body">
                      <div className="cp-evt-day-badge" style={{background:color}}>
                        {String(evt.day).padStart(2,'0')} {MONTHS_FR[month].slice(0,3).toUpperCase()}
                      </div>
                      <h3 className="cp-evt-title">{evt.title}</h3>
                      <p className="cp-evt-desc">{evt.desc}</p>
                      {evt.lieu&&(
                        <div className="cp-evt-lieu">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          {evt.lieu}
                        </div>
                      )}
                      <div className="cp-evt-link">
                        Voir l'événement
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </section>

      <Footer />
    </div>
  );
}
