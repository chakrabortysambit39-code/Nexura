import React from 'react';
import { createRoot } from 'react-dom/client';
import { Search, Bell, User, Sparkles, Play, Film, Music2, Gamepad2, Flame, Bot, ChevronRight } from 'lucide-react';
import './styles.css';

const cards = [
  { icon: Play, title: 'Watch', subtitle: 'Videos & creators', badge: 'Explore' },
  { icon: Film, title: 'Movies', subtitle: 'Trailers & discovery', badge: 'Discover' },
  { icon: Music2, title: 'Music', subtitle: 'Songs & playlists', badge: 'Listen' },
  { icon: Gamepad2, title: 'Play', subtitle: 'Games & experiences', badge: 'Play' },
];

function App() {
  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">N</div>
          <div>
            <div className="brand">NEXURA</div>
            <div className="tagline">Entertainment, reimagined.</div>
          </div>
        </div>

        <nav className="nav">
          <a className="active" href="#home">Home</a>
          <a href="#watch">Watch</a>
          <a href="#movies">Movies</a>
          <a href="#music">Music</a>
          <a href="#play">Play</a>
          <a href="#trending">Trending</a>
        </nav>

        <div className="top-actions">
          <button className="icon-btn" aria-label="Search"><Search size={19} /></button>
          <button className="icon-btn" aria-label="Notifications"><Bell size={19} /></button>
          <button className="profile-btn" aria-label="Profile"><User size={18} /></button>
        </div>
      </header>

      <main id="home">
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><Sparkles size={16} /> YOUR ENTERTAINMENT UNIVERSE</div>
            <h1>One place for<br /><span>everything you love.</span></h1>
            <p>Discover videos, movies, music and games — with NOVA ready to make every moment more personal.</p>
            <div className="hero-actions">
              <button className="primary-btn"><Play size={18} fill="currentColor" /> Explore now</button>
              <button className="secondary-btn"><Bot size={18} /> Meet NOVA</button>
            </div>
          </div>

          <div className="nova-card">
            <div className="nova-orb"><Sparkles size={30} /></div>
            <div>
              <div className="nova-label">NOVA AI</div>
              <div className="nova-title">Your entertainment companion.</div>
              <div className="nova-text">“Tell me your mood. I’ll find the vibe.”</div>
            </div>
            <button className="mini-arrow" aria-label="Open NOVA"><ChevronRight size={20} /></button>
          </div>
        </section>

        <section className="section" id="trending">
          <div className="section-head">
            <div>
              <div className="section-kicker"><Flame size={15} /> LIVE DISCOVERY</div>
              <h2>What are you in the mood for?</h2>
            </div>
            <button className="text-btn">View all <ChevronRight size={16} /></button>
          </div>

          <div className="card-grid">
            {cards.map(({ icon: Icon, title, subtitle, badge }) => (
              <article className="media-card" key={title}>
                <div className="card-icon"><Icon size={24} /></div>
                <div className="card-title">{title}</div>
                <div className="card-subtitle">{subtitle}</div>
                <div className="card-footer"><span>{badge}</span><ChevronRight size={16} /></div>
              </article>
            ))}
          </div>
        </section>

        <section className="nova-banner">
          <div className="nova-banner-orb"><Bot size={28} /></div>
          <div className="nova-banner-copy">
            <div className="section-kicker">POWERED BY NOVA</div>
            <h3>“I'm bored.” is a perfectly valid prompt.</h3>
            <p>NOVA can turn a feeling into a personalized entertainment session.</p>
          </div>
          <button className="primary-btn compact">Ask NOVA <ChevronRight size={17} /></button>
        </section>
      </main>

      <footer>© 2026 NEXURA · Built for entertainment.</footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
