import React, { useState, useEffect, useRef } from "react";
import "./Quotes.css";

/**
 * PUBLIC_INTERFACE
 * Quotes page for FunBase — 6-card grid, mood/category filter, search, like/save/share, and user quotes.
 * Backend API paths assumed:
 *   - GET /api/quotes?mood=<>&search=<> — fetch quotes, optionally filtered
 *   - POST /api/quotes/<id>/like, /save, /share — like/save/share quote
 *   - POST /api/quotes — add new quote (by user)
 */
const MOODS = [
  { name: "All", emoji: "🌈" },
  { name: "Motivation", emoji: "🚀" },
  { name: "Funny", emoji: "😂" },
  { name: "Love", emoji: "💖" },
  { name: "Life", emoji: "🌱" },
  { name: "Wisdom", emoji: "🧐" },
  { name: "Friendship", emoji: "🤗" },
  { name: "Success", emoji: "🏆" },
  { name: "Random", emoji: "🎲" }
];

// Demo user
const DEMO_USER = { username: "Alex" };

// Returns a shuffled copy (Fisher-Yates), used to pad to grid count
function randomSample(array, count) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

// Static fallback quotes for safety/offline/demo
const DEFAULT_QUOTES = [
  { id: "def1", text: "Laughter is timeless, imagination has no age.", author: "Walt Disney", mood: "Life", likes: [], saves: [], shares: 0, user: "System" },
  { id: "def2", text: "Why be moody when you can shake your booty!", author: "Unknown", mood: "Funny", likes: [], saves: [], shares: 0, user: "System" },
  { id: "def3", text: "Play is the highest form of research.", author: "Albert Einstein", mood: "Wisdom", likes: [], saves: [], shares: 0, user: "System" },
  { id: "def4", text: "The best way to cheer yourself up is to try to cheer somebody else up.", author: "Mark Twain", mood: "Motivation", likes: [], saves: [], shares: 0, user: "System" },
  { id: "def5", text: "Do what makes your soul shine!", author: "Unknown", mood: "Life", likes: [], saves: [], shares: 0, user: "System" },
  { id: "def6", text: "A day without laughter is a day wasted.", author: "Charlie Chaplin", mood: "Funny", likes: [], saves: [], shares: 0, user: "System" },
  { id: "def7", text: "Success is not in what you have, but who you are.", author: "Bo Bennett", mood: "Success", likes: [], saves: [], shares: 0, user: "System" },
  { id: "def8", text: "Friends are the family we choose.", author: "Edna Buchanan", mood: "Friendship", likes: [], saves: [], shares: 0, user: "System" },
  { id: "def9", text: "To love and be loved is to feel the sun from both sides.", author: "David Viscott", mood: "Love", likes: [], saves: [], shares: 0, user: "System" }
];

// PUBLIC_INTERFACE
function Quotes() {
  const [quotes, setQuotes] = useState([]);
  const [search, setSearch] = useState("");
  const [mood, setMood] = useState("All");
  const [loading, setLoading] = useState(false);
  const [user] = useState(DEMO_USER);
  const [showAdd, setShowAdd] = useState(false);
  const [addText, setAddText] = useState("");
  const [addAuthor, setAddAuthor] = useState("");
  const [addMood, setAddMood] = useState("");
  const [addErr, setAddErr] = useState("");
  const [addPending, setAddPending] = useState(false);
  const [myQuotes, setMyQuotes] = useState([]);
  const [copyMsg, setCopyMsg] = useState("");
  const addRef = useRef(null);

  // Load quotes
  useEffect(() => {
    fetchQuotes();
    // eslint-disable-next-line
  }, [mood, search]);

  useEffect(() => {
    fetchMyQuotes();
    // eslint-disable-next-line
  }, []);

  // PUBLIC_INTERFACE: fetches main grid quotes from backend
  function fetchQuotes() {
    setLoading(true);
    let url = "/api/quotes";
    if (mood && mood !== "All" && mood !== "Random") url += `?mood=${encodeURIComponent(mood)}`;
    else if (mood === "Random") url += "?random=6";
    if (search) url += `${url.includes("?") ? "&" : "?"}search=${encodeURIComponent(search)}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setQuotes(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setQuotes([]);
        setLoading(false);
      });
  }

  // PUBLIC_INTERFACE: fetch quotes added by the user (for user section)
  function fetchMyQuotes() {
    fetch(`/api/quotes?user=${encodeURIComponent(user.username)}`)
      .then(res => res.json())
      .then(data => setMyQuotes(Array.isArray(data) ? data : []))
      .catch(() => setMyQuotes([]));
  }

  // Fallback grid if empty or offline — always show 6 or more
  function getGridQuotes() {
    if (quotes.length === 0) {
      return randomSample(DEFAULT_QUOTES, 6);
    }
    if (quotes.length >= 6) return quotes.slice(0, 12);
    // supplement to make 6+
    const qids = new Set(quotes.map(q => q.id));
    const supplement = randomSample(DEFAULT_QUOTES.filter(dq => !qids.has(dq.id)), 6 - quotes.length);
    return [...quotes, ...supplement];
  }

  // PUBLIC_INTERFACE: search/filter
  function onSearch(e) {
    e.preventDefault();
    fetchQuotes();
  }

  // PUBLIC_INTERFACE: like/save/share actions for quote
  function handleQuoteAction(id, action) {
    fetch(`/api/quotes/${id}/${action}`, {
      method: "POST",
      credentials: "include"
    })
      .then(res => res.json())
      .then(updated => {
        setQuotes(prev => prev.map(q => q.id === id ? { ...q, ...updated } : q));
        if (myQuotes.some(q => q.id === id)) {
          setMyQuotes(prev => prev.map(q => q.id === id ? { ...q, ...updated } : q));
        }
      });
  }

  // PUBLIC_INTERFACE: share handler (copies to clipboard)
  function handleShare(quote) {
    const text = `“${quote.text}” —${quote.author}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopyMsg("Copied!");
      setTimeout(() => setCopyMsg(""), 1200);
    });
    handleQuoteAction(quote.id, "share");
  }

  // PUBLIC_INTERFACE: add quote by user
  function handleAddQuote(e) {
    e.preventDefault();
    setAddErr("");
    if (!addText.trim()) { setAddErr("Quote text cannot be empty."); return; }
    if (!addAuthor.trim()) { setAddErr("Author is required."); return; }
    if (!addMood.trim()) { setAddErr("Please pick a mood/category."); return; }
    setAddPending(true);
    fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: addText,
        author: addAuthor,
        mood: addMood,
        user: user.username
      }),
      credentials: "include"
    })
      .then(res => res.json())
      .then(resp => {
        if (resp && resp.id) {
          setShowAdd(false);
          setAddText("");
          setAddAuthor("");
          setAddMood("");
          fetchQuotes();
          fetchMyQuotes();
        } else {
          setAddErr(resp.error || "Failed to add quote. Try again.");
        }
        setAddPending(false);
      })
      .catch(() => {
        setAddErr("Failed to add quote. Try again.");
        setAddPending(false);
      });
  }

  // Anyone can scroll to add form
  function scrollToAdd() {
    setShowAdd(true);
    setTimeout(() => {
      if (addRef.current) addRef.current.scrollIntoView({ behavior: "smooth" });
    }, 140);
  }

  // Mood/category quick select
  function handleMoodSelect(name) {
    setMood(name);
  }

  // Search bar auto-clear
  function clearSearch() {
    setSearch("");
    fetchQuotes();
  }

  return (
    <main className="funbase-quotes-page">
      {/* Filter + Search Bar */}
      <section className="quotes-topbar">
        <div className="quotes-moods">
          {MOODS.map(({ name, emoji }) => (
            <button
              key={name}
              aria-label={name}
              className={`quotes-mood-btn${mood === name ? " active" : ""}`}
              onClick={() => handleMoodSelect(name)}
              tabIndex={0}
            >{emoji} {name}</button>
          ))}
        </div>
        <form className="quotes-search-form" onSubmit={onSearch} autoComplete="off">
          <input
            className="quotes-search"
            type="text"
            placeholder="🔍 Search quotes, authors…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search quotes"
          />
          <button className="quotes-btn" type="submit" disabled={loading || !search}>Search</button>
          {search && <button className="quotes-btn cancel" type="button" onClick={clearSearch}>Clear</button>}
        </form>
        <button className="quotes-btn add-cta" type="button" onClick={scrollToAdd}>➕ Add Quote</button>
      </section>

      {/* Quotes Grid */}
      <section className="quotes-grid-area">
        <h2 className="quotes-grid-title">💬 Explore Quotes</h2>
        {loading ? (
          <div className="quotes-loading">Loading quotes...</div>
        ) : (
          <div className="quotes-grid">
            {getGridQuotes().map(q => (
              <QuoteCard
                key={q.id || q.text}
                quote={q}
                user={user}
                onAction={handleQuoteAction}
                onShare={handleShare}
                copyMsg={copyMsg}
              />
            )
            )}
          </div>
        )}
      </section>

      {/* User Quotes Section */}
      <section className="my-quotes-area">
        <h3 className="my-quotes-title">📝 My Quotes</h3>
        {myQuotes && myQuotes.length ? (
          <div className="my-quotes-list">
            {myQuotes.map(q => (
              <QuoteCard
                key={q.id || q.text}
                quote={q}
                user={user}
                onAction={handleQuoteAction}
                onShare={handleShare}
                isMine
                copyMsg={copyMsg}
              />
            ))}
          </div>
        ) : (
          <div className="my-quotes-none">You haven't added any quotes yet.</div>
        )}
      </section>

      {/* Add Quote */}
      <section className={`quotes-add-area${showAdd ? " show" : ""}`} ref={addRef}>
        <h3 className="quotes-add-title">➕ Add Your Quote</h3>
        <form className="quotes-add-form" onSubmit={handleAddQuote}>
          <label className="quotes-add-label">
            Quote Text:
            <textarea
              value={addText}
              onChange={e => setAddText(e.target.value)}
              placeholder="e.g. The journey of a thousand miles begins with a single step."
              disabled={addPending}
            />
          </label>
          <label className="quotes-add-label">
            Author:
            <input
              type="text"
              value={addAuthor}
              onChange={e => setAddAuthor(e.target.value)}
              placeholder="Albert Einstein"
              disabled={addPending}
            />
          </label>
          <label className="quotes-add-label">
            Mood/Category:
            <select value={addMood} onChange={e => setAddMood(e.target.value)} disabled={addPending}>
              <option value="">Pick one</option>
              {MOODS.filter(m => m.name !== "All" && m.name !== "Random").map(m => (
                <option value={m.name} key={m.name}>{m.emoji} {m.name}</option>
              ))}
            </select>
          </label>
          <button className="quotes-btn" type="submit" disabled={addPending}>Submit</button>
          {addErr && <div className="quotes-add-err">{addErr}</div>}
          <button className="quotes-btn cancel" type="button" onClick={() => setShowAdd(false)} disabled={addPending}>Cancel</button>
        </form>
      </section>
    </main>
  );
}

/**
 * QuoteCard – interactive quote card with like/save/share and style
 * @param {object} props
 * - quote, user, onAction, onShare, isMine
 */
function QuoteCard({ quote, user, onAction, onShare, isMine, copyMsg }) {
  const isLiked = quote.likes?.includes?.(user?.username);
  const isSaved = quote.saves?.includes?.(user?.username);

  return (
    <div className="quote-card">
      <div className="quote-text">
        <span className="quote-symbol">“</span>{quote.text}<span className="quote-symbol">”</span>
      </div>
      <div className="quote-author">— {quote.author || "Unknown"}</div>
      <div className="quote-meta">
        <span className={`quote-tag quote-mood mood-${quote.mood?.toLowerCase?.() || "any"}`}>{quote.mood || "General"}</span>
        {quote.user && <span className="quote-tag quote-user">by {quote.user}</span>}
        {isMine && <span className="quote-tag my-own">My Quote</span>}
      </div>
      <div className="quote-actions">
        <button
          className={`quote-action-btn${isLiked ? " liked" : ""}`}
          title={isLiked ? "Unlike" : "Like"}
          aria-label="Like quote"
          onClick={() => onAction?.(quote.id, "like")}
        >
          {isLiked ? "❤️" : "🤍"} <span>{quote.likes?.length || 0}</span>
        </button>
        <button
          className={`quote-action-btn${isSaved ? " saved" : ""}`}
          title={isSaved ? "Unsave" : "Save"}
          aria-label="Save quote"
          onClick={() => onAction?.(quote.id, "save")}
        >
          ⭐
        </button>
        <button
          className="quote-action-btn"
          title="Share"
          aria-label="Share quote"
          onClick={() => onShare?.(quote)}
        >
          📤
          {copyMsg && <span className="quote-share-hint">{copyMsg}</span>}
        </button>
      </div>
    </div>
  );
}

export default Quotes;
