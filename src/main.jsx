import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Search, Bell, User, Sparkles, Play, Film, Music2, Gamepad2, Flame,
  Bot, ChevronRight, Heart, Clock3, Star, X, Send, Home, Compass,
  ListMusic, Trophy, Settings, Mic
} from 'lucide-react';
import './styles.css';

const sections = {
  Home: [
    { icon: Play, title: 'Watch', subtitle: 'Videos & creators', badge: 'Explore' },
    { icon: Film, title: 'Movies', subtitle: 'Discover your next story', badge: 'Discover' },
    { icon: Music2, title: 'Music', subtitle: 'Songs & playlists', badge: 'Listen' },
    { icon: Gamepad2, title: 'Play', subtitle: 'Games & experiences', badge: 'Play' },
  ],
  Watch: ['Creator picks', 'Tech & science', 'Comedy', 'Gaming'],
  Movies: ['Trending now', 'Action', 'Sci-fi', 'Animation'],
  Music: ['Focus', 'Chill', 'Workout', 'Discover'],
  Play: ['Arcade', 'Puzzle', 'Strategy', 'Challenge'],
  Trending: ['Hot today', 'Most saved', 'Rising', 'NOVA picks'],
};

function App() {
  const [active, setActive] = useState('Home');
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [novaOpen, setNovaOpen] = useState(false);
  const [messages, setMessages] = useState([{from:'nova', text:'Hey! I’m NOVA. Tell me what kind of entertainment you feel like right now. ✨'}]);
  const [draft, setDraft] = useState('');

  const items = useMemo(() => {
    const base = active === 'Home' ? sections.Home : sections[active].map((title, i) => ({
      icon: [Play, Film, Music2, Gamepad2][i % 4],
      title,
      subtitle: active + ' discovery',
      badge: 'Explore'
    }));
    return base.filter(x => (x.title + x.subtitle).toLowerCase().includes(search.toLowerCase()));
  }, [active, search]);

  const toggleFavorite = (title) => setFavorites(f => f.includes(title) ? f.filter(x => x !== title) : [...f, title]);

  const askNova = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages(m => [...m, {from:'user', text}]);
    setDraft('');
    const lower = text.toLowerCase();
    let reply = 'Nice. I’d start with something fresh from your Trending and Discover sections. Want a funny, exciting, relaxing, or mind-blowing vibe?';
    if (lower.includes('bored')) reply = 'Say no more 😄 Try a fast game, a short comedy video, or let me build you a surprise entertainment session.';
    if (lower.includes('funny') || lower.includes('comedy')) reply = 'Comedy mode activated 😂 Head to Watch for comedy picks, and I’ll keep your recommendations light and fun.';
    if (lower.includes('movie') || lower.includes('film')) reply = 'Movie night! 🎬 Try Movies → Trending now, then save anything interesting to your favorites.';
    if (lower.includes('music') || lower.includes('song')) reply = 'Music it is 🎵 Choose Chill, Focus, Workout, or Discover and I’ll help you find the right vibe.';
    setTimeout(() => setMessages(m => [...m, {from:'nova', text:reply}]), 350);
  };

  return <div className="app-shell">
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <header className="topbar">
      <button className="brand-wrap brand-button" onClick={() => setActive('Home')}>
        <div className="brand-mark">N</div><div><div className="brand">NEXURA</div><div className="tagline">Entertainment, reimagined.</div></div>
      </button>
      <nav className="nav">{Object.keys(sections).map(name => <button key={name} className={active===name?'active':''} onClick={()=>setActive(name)}>{name}</button>)}</nav>
      <div className="top-actions">
        <div className="search-wrap"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Nexura"/></div>
        <button className="icon-btn"><Bell size={19}/></button><button className="profile-btn"><User size={18}/></button>
      </div>
    </header>

    <main>
      {active === 'Home' && <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={16}/> YOUR ENTERTAINMENT UNIVERSE</div>
          <h1>One place for<br/><span>everything you love.</span></h1>
          <p>Discover videos, movies, music and games — with NOVA ready to make every moment more personal.</p>
          <div className="hero-actions"><button className="primary-btn" onClick={()=>setActive('Trending')}><Compass size={18}/> Explore now</button><button className="secondary-btn" onClick={()=>setNovaOpen(true)}><Bot size={18}/> Meet NOVA</button></div>
        </div>
        <div className="nova-card"><div className="nova-orb"><Sparkles size={30}/></div><div className="nova-label">NOVA AI</div><div className="nova-title">Your entertainment companion.</div><div className="nova-text">“Tell me your mood. I’ll find the vibe.”</div><button className="mini-arrow" onClick={()=>setNovaOpen(true)}><ChevronRight size={20}/></button></div>
      </section>}

      <section className="section">
        <div className="section-head"><div><div className="section-kicker"><Flame size={15}/> {active === 'Home' ? 'LIVE DISCOVERY' : active.toUpperCase()}</div><h2>{active === 'Home' ? 'What are you in the mood for?' : active + ' Hub'}</h2></div>
          <div className="stats"><span><Heart size={14}/> {favorites.length} saved</span><span><Clock3 size={14}/> session active</span></div></div>
        <div className="card-grid">{items.map(({icon:Icon,title,subtitle,badge}) => <article className="media-card" key={title}>
          <button className={'favorite '+(favorites.includes(title)?'saved':'')} onClick={()=>toggleFavorite(title)}><Heart size={16} fill={favorites.includes(title)?'currentColor':'none'}/></button>
          <div className="card-icon"><Icon size={24}/></div><div className="card-title">{title}</div><div className="card-subtitle">{subtitle}</div>
          <button className="card-footer" onClick={()=>setNovaOpen(true)}><span>{badge}</span><ChevronRight size={16}/></button>
        </article>)}</div>
        {items.length===0 && <div className="empty-state">No results found for “{search}”. Try another search.</div>}
      </section>

      <section className="continue-grid">
        <div className="mini-panel"><Clock3/><div><b>Continue exploring</b><p>Your next NEXURA session starts here.</p></div><button onClick={()=>setActive('Trending')}>Open <ChevronRight size={15}/></button></div>
        <div className="mini-panel"><Trophy/><div><b>Achievements</b><p>Entertainment explorer — Level 1.</p></div><Star size={18}/></div>
        <div className="mini-panel"><ListMusic/><div><b>Your library</b><p>{favorites.length ? favorites.join(', ') : 'Save things you love to build it.'}</p></div><Heart size={18}/></div>
      </section>

      <section className="nova-banner"><div className="nova-banner-orb"><Bot size={28}/></div><div className="nova-banner-copy"><div className="section-kicker">POWERED BY NOVA</div><h3>“I'm bored.” is a perfectly valid prompt.</h3><p>NOVA turns a feeling into an entertainment session.</p></div><button className="primary-btn compact" onClick={()=>setNovaOpen(true)}>Ask NOVA <ChevronRight size={17}/></button></section>
    </main>

    <div className="mobile-nav">{[[Home,'Home'],[Play,'Watch'],[Film,'Movies'],[Music2,'Music'],[Bot,'NOVA']].map(([Icon,name]) => <button key={name} className={active===name?'active':''} onClick={()=>name==='NOVA'?setNovaOpen(true):setActive(name)}><Icon size={19}/><span>{name}</span></button>)}</div>

    {novaOpen && <div className="modal-backdrop" onClick={()=>setNovaOpen(false)}><section className="nova-modal" onClick={e=>e.stopPropagation()}>
      <div className="nova-modal-head"><div><div className="nova-label">NOVA AI · ONLINE</div><h3>Your entertainment companion</h3></div><button className="icon-btn" onClick={()=>setNovaOpen(false)}><X size={19}/></button></div>
      <div className="chat">{messages.map((m,i)=><div key={i} className={'message '+m.from}>{m.from==='nova' && <Bot size={17}/>}<span>{m.text}</span></div>)}</div>
      <div className="quick-prompts"><button onClick={()=>{setDraft("I'm bored");}}>I'm bored</button><button onClick={()=>{setDraft("Recommend a funny movie");}}>Make me laugh</button><button onClick={()=>{setDraft("I want relaxing music");}}>Relax me</button></div>
      <div className="chat-input"><button><Mic size={18}/></button><input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>e.key==='Enter'&&askNova()} placeholder="Ask NOVA anything..."/><button className="send" onClick={askNova}><Send size={18}/></button></div>
    </section></div>}
    <footer>© 2026 NEXURA · Entertainment without limits · <Settings size={12}/> Settings</footer>
  </div>
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
