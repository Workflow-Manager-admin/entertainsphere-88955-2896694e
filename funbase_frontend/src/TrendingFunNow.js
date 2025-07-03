import React, { useEffect, useState } from "react";
import "./TrendingFunNow.css";

/**
 * PUBLIC_INTERFACE
 * TrendingFunNow: Interactive "time-travel" fun discovery page.
 * - User picks a date (calendar or quick options: Today, Random, Same Day Last Year)
 * - Fetches <fun events> for selected day: facts, memes, videos, holidays, news (via backend APIs)
 * - Sectioned, playful card UI for each event type.
 * - Cards show type, description, optional media, and sources.
 */
function TrendingFunNow() {
  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const [loadKey, setLoadKey] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [funEvents, setFunEvents] = useState([]);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Load fun events feed for selected day from backend on loadKey or date change
  useEffect(() => {
    setLoading(true);
    setErr(null);
    setFunEvents([]);
    fetch(`/api/fun-events?date=${selectedDate}`)
      .then(res => res.json())
      .then(data => {
        if (!data || data.error) throw new Error(data?.error || "No data");
        setFunEvents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(e => {
        setLoading(false);
        setErr("Couldn't load fun events for this date.");
      });
  }, [selectedDate, loadKey]);

  // Date/time quick pick functions
  function handleToday() {
    setSelectedDate(getTodayISO());
    setLoadKey(Date.now());
  }
  function handleRandom() {
    setSelectedDate(getRandomPastISO());
    setLoadKey(Date.now());
  }
  function handleLastYear() {
    setSelectedDate(getSameDayLastYearISO());
    setLoadKey(Date.now());
  }

  // Calendar change
  function handleDateChange(e) {
    setSelectedDate(e.target.value);
    setLoadKey(Date.now());
  }

  // Fun helper: date labeling
  function displayFriendlyDate(date) {
    const dt = new Date(date);
    const today = getTodayISO();
    const same = dt.toISOString().slice(0,10) === today;
    if (same) return "Today";
    return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  // Main sections—group by event type
  const grouped = groupByType(funEvents);

  return (
    <main className="trfn-main">
      <h1 className="trfn-title">Trending Fun Now <span role="img" aria-label="sparkles">✨</span></h1>
      <div className="trfn-intro-sub">
        Time-travel for fun! Pick a date to discover memes, facts, videos, holidays, and headlines from that day.<br />
        <span style={{ fontSize: "1.33em" }}>Go playful <span role="img" aria-label="party">🎉</span> — relive or randomize history.</span>
      </div>

      {/* Date Picker + Quick Options */}
      <section style={{ textAlign: "center", marginBottom: "1.8em" }}>
        <div style={{ display: "inline-flex", flexWrap: "wrap", gap: "0.7em", alignItems: "center" }}>
          <label className="trfn-date-label" htmlFor="date-picker" style={{
            fontWeight: 700,
            fontSize: "1.11em"
          }}>
            Pick a date:
          </label>
          <input
            id="date-picker"
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            max={getTodayISO()}
            className="trfn-date-input"
            style={{
              borderRadius: "1.2em",
              padding: "0.28em 1em",
              border: "2px solid #ffe2fa",
              fontWeight: 600,
              fontSize: "1.03em",
              outline: "none",
              boxShadow: "0 1px 10px #ffd4ff14"
            }}
          />
          <button className="trfn-picker-btn" onClick={handleToday} title="Go to today">Today</button>
          <button className="trfn-picker-btn" onClick={handleRandom} title="Jump to random date">Random</button>
          <button className="trfn-picker-btn" onClick={handleLastYear} title="Travel to this day, last year">Same Day Last Year</button>
        </div>
        <div style={{
          marginTop: "0.65em", fontSize: "1.02em", color: "#b38dd8", fontWeight: 600
        }}>
          Showing fun for: <span style={{ color: "#e45cbe" }}>{displayFriendlyDate(selectedDate)}</span>
        </div>
      </section>

      {/* Loading/error */}
      {loading ? (
        <div className="trfn-loading">Fetching fun for {displayFriendlyDate(selectedDate)}…</div>
      ) : err ? (
        <div className="trfn-err">{err}</div>
      ) : (
        <div className="trfn-scroll-wrap">
          {/* Fun Cards grouped by type. Each block is playful, colorful. */}
          {["holiday", "meme", "fact", "news", "video"].map(type =>
            grouped[type]?.length ? (
              <FunSection key={type} type={type} cards={grouped[type]} />
            ) : null
          )}
          {/* If NO content at all for day, show a fallback */}
          {Object.values(grouped).flat().length === 0 && (
            <section className="trfn-section">
              <div style={{
                fontSize: "1.29em",
                fontWeight: 700,
                color: "#ae4bea",
                textAlign: "center",
                padding: "2em 0"
              }}>
                No fun events found for this date. Pick another day!
                <br /> <span style={{ fontSize: "2em" }}>🥲</span>
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}

// Helpers
function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}
function getRandomPastISO() {
  // Random day in the past 12 years, ignoring leap day for simplicity.
  const today = new Date();
  const minYear = today.getFullYear() - 12;
  const year = randBetween(minYear, today.getFullYear());
  const month = randBetween(0, 11);
  let day = randBetween(1, 28); // all months safely
  return new Date(year, month, day).toISOString().slice(0,10);
}
function getSameDayLastYearISO() {
  const today = new Date();
  const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
  return lastYear.toISOString().slice(0, 10);
}
function randBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function groupByType(events) {
  const map = {};
  events.forEach(ev => {
    if (!map[ev.type]) map[ev.type] = [];
    map[ev.type].push(ev);
  });
  return map;
}

// Section cards
function FunSection({ type, cards }) {
  let title, emoji;
  switch (type) {
    case "holiday":
      title = "Notable Holidays";
      emoji = "🎈";
      break;
    case "meme":
      title = "Epic Memes";
      emoji = "😂";
      break;
    case "fact":
      title = "Bizarre Facts";
      emoji = "💡";
      break;
    case "news":
      title = "Viral News";
      emoji = "📰";
      break;
    case "video":
      title = "Fun Videos";
      emoji = "🎬";
      break;
    default:
      title = "Fun";
      emoji = "🎉";
  }
  return (
    <section className={`trfn-section trfn-${type}`}>
      <h2>
        <span role="img" aria-label={title}>{emoji}</span> {title}
      </h2>
      <div
        className={[
          type === "meme" ? "trfn-meme-grid"
          : type === "fact" ? "trfn-fact-grid"
          : "trfn-card-flex"
        ].join(" ")}>
        {cards.map((card, idx) =>
          <FunEventCard key={card.id || idx} event={card} type={type} />
        )}
      </div>
    </section>
  );
}

// Fun Content Card (core renderer)
function FunEventCard({ event, type }) {
  // General variables
  const sourceMap = (event.sources || []).filter(Boolean);
  // The card visuals depend on type
  if (type === "meme") {
    return (
      <div className="trfn-meme-card" tabIndex={0}>
        {event.media_url &&
          <img src={event.media_url} alt="Meme" className="trfn-meme-img" loading="lazy" />
        }
        <div className="trfn-meme-meta">
          <div className="trfn-meme-title">{event.title || event.description || "Meme"}</div>
          {event.author && <span className="trfn-meme-author">by {event.author}</span>}
          {sourceMap.map(src => (
            <a
              key={src}
              href={src}
              className="trfn-meme-subreddit"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Source
            </a>
          ))}
        </div>
      </div>
    );
  }
  if (type === "fact") {
    return (
      <div className="trfn-fact-card" tabIndex={0}>
        <span className="trfn-fact-icon">🤪</span>
        <span className="trfn-fact-text">{event.description}</span>
        {sourceMap.length > 0 && (
          <span style={{ fontSize: ".93em", color: "#1a8", paddingLeft: 8 }}>
            <a href={sourceMap[0]} target="_blank" rel="noopener noreferrer" style={{ color: "#1a8" }}>Source</a>
          </span>
        )}
      </div>
    );
  }
  if (type === "video") {
    return (
      <div className="trfn-card-flex" style={{ maxWidth: 350, margin: 4 }}>
        {event.media_url && event.media_url.includes("youtube")
          ? <iframe
              width="100%"
              height="180"
              src={embedYoutube(event.media_url)}
              title={event.title || "Video"}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ borderRadius: "1.1em" }}
            />
          : (event.media_url ? <video controls src={event.media_url} style={{ width: "100%", borderRadius: "1.1em", minHeight: 120 }} /> : null)
        }
        <div style={{ paddingTop: 8, fontWeight: "700", color: "#c24dab" }}>{event.title || "Video"}</div>
        <div style={{ fontSize: ".98em", color: "#525" }}>{event.description}</div>
        {event.author && <span style={{ color: "#385" }}>By {event.author}</span>}
        {sourceMap.map((src, i) => (
          <a key={src} href={src} target="_blank" rel="noopener noreferrer" style={{
            color: "#0b8", fontSize: "0.93em", display: "block", marginTop: 3
          }}>Source</a>
        ))}
      </div>
    );
  }
  if (type === "holiday") {
    return (
      <div className="trfn-fact-card" tabIndex={0} style={{ background: "#f3eaff", color: "#622bb7" }}>
        <span className="trfn-fact-icon" role="img" aria-label="Holiday">🎈</span>
        <div style={{ fontWeight: 800 }}>
          {event.title || event.description || "Holiday"}
        </div>
        {event.description && event.title && (
          <div style={{ fontWeight: 600, fontSize: ".98em", marginTop: 3 }}>{event.description}</div>
        )}
        {sourceMap.map((src, i) => (
          <a key={src} href={src} target="_blank" rel="noopener noreferrer" style={{ color: "#de57f5", fontSize: ".98em", marginLeft: 6 }}>Source</a>
        ))}
      </div>
    );
  }
  if (type === "news") {
    return (
      <div className="trfn-fact-card" tabIndex={0} style={{ background: "#fffde7", color: "#712" }}>
        <span className="trfn-fact-icon" role="img" aria-label="News">📰</span>
        <div style={{ fontWeight: 800 }}>
          {event.title || event.description || "News"}
        </div>
        {event.description && event.title && (
          <div style={{ fontWeight: 600, fontSize: ".98em", marginTop: 2 }}>{event.description}</div>
        )}
        {sourceMap.map((src, i) => (
          <a key={src} href={src} target="_blank" rel="noopener noreferrer" style={{ color: "#2973dd", fontSize: ".97em", marginLeft: 6 }}>Source</a>
        ))}
      </div>
    );
  }

  // Default fun fallback
  return (
    <div className="trfn-fact-card">
      <span className="trfn-fact-icon">🎉</span>
      <span className="trfn-fact-text">{event.title || event.description || "Surprise Fun!"}</span>
    </div>
  );
}

// Embed Youtube (simplified for plain URLs)
function embedYoutube(url) {
  if (!url) return "";
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=|v\/|shorts\/))([A-Za-z0-9_-]{11})/);
  if (!match) return url;
  return `https://www.youtube.com/embed/${match[1]}`;
}

export default TrendingFunNow;
