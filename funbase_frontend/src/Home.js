import React from "react";
import "./Home.css";

// Feature list for the Highlights section
const FEATURES = [
  {
    emoji: "🎮",
    title: "Addictive Games",
    desc: "Fun and challenging web games for all ages.",
  },
  {
    emoji: "😂",
    title: "Trending Memes",
    desc: "Fresh memes & viral laughter updated daily.",
  },
  {
    emoji: "🎬",
    title: "Movie & Song Picks",
    desc: "Curated movies & music for your mood.",
  },
  {
    emoji: "💬",
    title: "Inspiring Quotes",
    desc: "Motivation and fun, one quote at a time.",
  },
  {
    emoji: "🧩",
    title: "Logic Puzzles",
    desc: "Tease your brain with logic & riddles.",
  },
  {
    emoji: "📊",
    title: "Fun Polls",
    desc: "Vote, predict, and see what’s trending.",
  }
];

const TOP_USERS = [
  { name: "Sammy", emoji: "🌟", score: 320 },
  { name: "Joy", emoji: "🔥", score: 300 },
  { name: "Leo", emoji: "🎯", score: 280 }
];

const QUOTES = [
  { text: "Laughter is timeless, imagination has no age.", author: "Walt Disney" },
  { text: "Why be moody when you can shake your booty!", author: "Unknown" },
  { text: "Play is the highest form of research.", author: "Albert Einstein" }
];

const FUN_POLL = {
  question: "Which is the ultimate comfort movie?",
  options: ["Shrek", "Toy Story", "The Lion King", "Home Alone"],
};

function getRandomQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

function getRandomPollOption() {
  return FUN_POLL.options[Math.floor(Math.random() * FUN_POLL.options.length)];
}

// PUBLIC_INTERFACE
function Home() {
  const quote = getRandomQuote();
  const pollPick = getRandomPollOption();

  // PUBLIC_INTERFACE
  const scrollToHighlights = (e) => {
    e.preventDefault();
    const h = document.querySelector("#highlights");
    if (h) {
      h.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <main className="funbase-home">
      {/* Hero Section */}
      <section className="hero-bg">
        <div className="hero-content">
          <div className="hero-collage" aria-hidden="true">
            {/* Playful illustrated/collage feel with layered emoji */}
            <span className="collage-emoji collage1">🎮</span>
            <span className="collage-emoji collage2">😂</span>
            <span className="collage-emoji collage3">🧩</span>
            <span className="collage-emoji collage4">🎬</span>
            <span className="collage-emoji collage5">🎉</span>
          </div>
          {/* Enhanced visually animated home-title */}
          <div className="heading-effect-wrapper">
            {/* Emoji/Fun Confetti for festive background */}
            <div className="confetti-emoji" aria-hidden="true">
              {["🎉", "🤣", "🕹️", "🤩", "💯", "🚀", "😎", "🤸‍♂️", "🎯", "😃", "🦄"].map((emo, i) => (
                <span className="confetti-emoji-float" key={i} style={{
                  left: `${10 + Math.random() * 80}%`,
                  animationDelay: `${Math.random() * 2.5}s`
                }}>{emo}</span>
              ))}
            </div>
            <h1 className="home-title animated-gradient-title">
              <span className="emoji-burst-left" role="img" aria-label="Party Popper">🎉</span>
              <span className="funbase-text-effect">
                Welcome to <span className="brand-glow">FunBase</span>!
              </span>
              <span className="emoji-burst-right" role="img" aria-label="Unicorn">🦄</span>
            </h1>
            <div className="animated-underline"></div>
          </div>
          <p className="home-subtext">
            Your one-stop playground for games, memes, movies, quotes, puzzles, and more.
            <br />
            *Make every click a joy!*
          </p>
          <button className="explore-btn bounce" onClick={scrollToHighlights}>
            🚀 Explore Now
          </button>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="highlights" id="highlights">
        <h2 className="section-title">✨ What makes FunBase awesome?</h2>
        <div className="highlights-grid">
          {FEATURES.map((feat, idx) => (
            <div className="feature-card" key={feat.title} style={{ animationDelay: `${0.12 + idx * 0.055}s` }}>
              <div className="feature-emoji">{feat.emoji}</div>
              <div className="feature-title">{feat.title}</div>
              <div className="feature-desc">{feat.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Optional: User Showcase Area */}
      <section className="showcase">
        <div className="showcase-block users">
          <h3>🏆 Top Players</h3>
          <ul className="userlist">
            {TOP_USERS.map(u => (
              <li key={u.name}>
                <span className="emoji">{u.emoji}</span>{" "}
                <span className="username">{u.name}</span>
                <span className="score">+{u.score}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="showcase-block quote">
          <h3>💡 Quote of the Day</h3>
          <p className="show-quote">"{quote.text}"</p>
          <span className="show-quote-author">- {quote.author}</span>
        </div>
        <div className="showcase-block poll">
          <h3>📊 Fun Poll</h3>
          <div className="poll-q">{FUN_POLL.question}</div>
          <div className="poll-pick">{pollPick} <span role="img" aria-label="vote">✅</span></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="funbase-footer">
        <div className="footer-links">
          <a href="#" className="footer-link">Home</a>
          <a href="#" className="footer-link">Games</a>
          <a href="#" className="footer-link">Memes</a>
          <a href="#" className="footer-link">Polls</a>
          <a href="#" className="footer-link">Profile</a>
        </div>
        <div className="footer-social">
          <a href="#" className="footer-social-ico" aria-label="Twitter">🐦</a>
          <a href="#" className="footer-social-ico" aria-label="Instagram">📸</a>
          <a href="#" className="footer-social-ico" aria-label="TikTok">🎶</a>
        </div>
        <div className="footer-copy">
          © {new Date().getFullYear()} FunBase • Made with <span style={{color:'#ff4fd8'}}>💖</span>
        </div>
      </footer>
    </main>
  );
}

export default Home;
