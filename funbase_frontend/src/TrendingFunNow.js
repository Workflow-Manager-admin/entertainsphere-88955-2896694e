import React, { useEffect, useState } from "react";
import "./TrendingFunNow.css";

// Optionally replace these with icons or add playful emoji
const QUICK_FILTERS = [
  { label: "Today", getValue: () => getTodayISO() },
  { label: "Random", getValue: () => getRandomPastISO() },
  { label: "Same Day Last Year", getValue: () => getSameDayLastYearISO() }
];

// PUBLIC_INTERFACE
// TrendingFunNow polished version adds: filter bar, themed cards, playful time travel controls
function TrendingFunNow() {
  // UI state
  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const [viewLabel, setViewLabel] = useState("Today");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [funContent, setFunContent] = useState({
    memes: [],
    facts: [],
    holidays: [],
    news: [],
    videos: []
  });

  // Backend fetches are done per-date
  useEffect(() => {
    loadContent(selectedDate);
    // eslint-disable-next-line
  }, [selectedDate]);

  // PUBLIC_INTERFACE
  function loadContent(dateStr) {
    setLoading(true);
    setError("");
    setFunContent({
      memes: [],
      facts: [],
      holidays: [],
      news: [],
      videos: []
    });

    fetch(`/api/fun-events?date=${dateStr}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data || data.error) throw new Error(data.error || "No results.");
        // Expected: an array of fun events with type ('meme', 'fact', etc)
        const grouped = { memes: [], facts: [], holidays: [], news: [], videos: [] };
        (Array.isArray(data) ? data : []).forEach((ev) => {
          if (ev.type === "meme") grouped.memes.push(ev);
          else if (ev.type === "fact") grouped.facts.push(ev);
          else if (ev.type === "holiday") grouped.holidays.push(ev);
          else if (ev.type === "news") grouped.news.push(ev);
          else if (ev.type === "video") grouped.videos.push(ev);
        });
        setFunContent(grouped);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to load fun content for this date!");
        setLoading(false);
      });
  }

  // PUBLIC_INTERFACE
  function handleFilterQuick(label) {
    const picker = QUICK_FILTERS.find((f) => f.label === label);
    if (picker) {
      setSelectedDate(picker.getValue());
      setViewLabel(label);
    }
  }

  function handleDateChange(e) {
    setSelectedDate(e.target.value);
    setViewLabel("");
  }

  // Helper: render date label
  function prettyDate(dateStr) {
    try {
      if (dateStr === getTodayISO()) return "Today";
      const dt = new Date(dateStr);
      return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  }

  // Card renderers per type
  return (
    <main className="trfn-main">
      <h1 className="trfn-title">
        Trending Fun Now <span aria-label="sparkles" role="img">✨</span>
      </h1>
      <div className="trfn-intro-sub">
        <span>🎲 Play with time-travel for fun!</span>
        <br />
        Pick a date or try quick options to see trending memes, quirky holidays, wild facts, viral news, and videos from that day!
      </div>
      {/* --- Time-travel filter bar --- */}
      <section style={{ textAlign: "center", marginBottom: "1.9em" }}>
        <div style={{ display: "inline-flex", flexWrap: "wrap", gap: "0.67em", alignItems: "center", marginBottom: 7 }}>
          <label className="trfn-date-label" htmlFor="date-picker" style={{ fontWeight: 700, fontSize: "1.12em" }}>
            Pick a date:
          </label>
          <input
            id="date-picker"
            type="date"
            className="trfn-date-input"
            value={selectedDate}
            onChange={handleDateChange}
            max={getTodayISO()}
            aria-label="Pick date"
          />
          {QUICK_FILTERS.map((q) =>
            <button
              className="trfn-picker-btn"
              key={q.label}
              onClick={() => handleFilterQuick(q.label)}
              title={q.label === "Random" ? "Go on a random adventure!" : q.label}
              aria-pressed={viewLabel === q.label}
            >
              {q.label}
            </button>
          )}
        </div>
        <div style={{
          marginTop: "0.55em",
          fontSize: "1.09em",
          color: "#b38dd8",
          fontWeight: 600
        }}>
          Showing fun for: <span style={{ color: "#e45cbe" }}>{prettyDate(selectedDate)}</span>
        </div>
      </section>
      {/* --- Main results, colorful themed sections --- */}
      {loading ? (
        <div className="trfn-loading">
          Fetching fun content for {prettyDate(selectedDate)} <span aria-label="wait" role="img">🌀</span>
        </div>
      ) : error ? (
        <div className="trfn-err">{error}</div>
      ) : (
        <div className="trfn-scroll-wrap">
          {funContent.holidays.length > 0 && (
            <SectionWrap type="holiday" events={funContent.holidays} />
          )}
          {funContent.memes.length > 0 && (
            <SectionWrap type="meme" events={funContent.memes} />
          )}
          {funContent.facts.length > 0 && (
            <SectionWrap type="fact" events={funContent.facts} />
          )}
          {funContent.news.length > 0 && (
            <SectionWrap type="news" events={funContent.news} />
          )}
          {funContent.videos.length > 0 && (
            <SectionWrap type="video" events={funContent.videos} />
          )}
          {(funContent.holidays.length +
            funContent.memes.length +
            funContent.facts.length +
            funContent.news.length +
            funContent.videos.length === 0) && (
              <section className="trfn-section">
                <div style={{
                  fontSize: "1.33em",
                  fontWeight: 700,
                  color: "#ae4bea",
                  textAlign: "center",
                  padding: "2.1em 0"
                }}>
                  No fun content for this date, try another! <span style={{ fontSize: "2em" }}>🛸</span>
                </div>
              </section>
          )}
        </div>
      )}
    </main>
  );
}

// Section renderer: themed for per-type | fun section
function SectionWrap({ type, events }) {
  const lookup = {
    holiday: { label: "Funky Holidays", emoji: "🎈" },
    meme: { label: "Epic Memes", emoji: "😂" },
    fact: { label: "Wacky Facts", emoji: "💡" },
    news: { label: "Viral News", emoji: "📰" },
    video: { label: "Fun Videos", emoji: "🎬" },
  };
  const info = lookup[type] || { label: "Fun Time", emoji: "🎉" };
  let gridClass = "trfn-card-flex";
  if (type === "meme") gridClass = "trfn-meme-grid";
  else if (type === "fact" || type === "holiday" || type === "news") gridClass = "trfn-fact-grid";
  return (
    <section className={`trfn-section trfn-${type}`}>
      <h2>
        <span aria-label={info.label} role="img">{info.emoji}</span> {info.label}
      </h2>
      <div className={gridClass}>
        {events.map((item, idx) => (
          <FunCard key={item.id || idx} event={item} type={type} />
        ))}
      </div>
    </section>
  );
}

// Per-card visual depending on type
function FunCard({ event, type }) {
  const sourceLinks = (event.sources || []).filter(Boolean);

  // Meme card
  if (type === "meme") {
    return (
      <div className="trfn-meme-card" tabIndex={0}>
        {event.media_url &&
          <img src={event.media_url} alt="Meme" className="trfn-meme-img" loading="lazy" />}
        <div className="trfn-meme-meta">
          <div className="trfn-meme-title">{event.title || event.description || "Meme"}</div>
          {event.author && <span className="trfn-meme-author">by {event.author}</span>}
          {sourceLinks.map((src) => (
            <a
              key={src}
              href={src}
              className="trfn-meme-subreddit"
              target="_blank"
              rel="noopener noreferrer"
            >Source</a>
          ))}
        </div>
      </div>
    );
  }

  // Fact, holiday, news - decorated info card
  if (type === "holiday" || type === "fact" || type === "news") {
    let bg, color, icon = "💡";
    if (type === "holiday") { bg = "#f3eaff"; color = "#622bb7"; icon = "🎈"; }
    if (type === "news") { bg = "#fffde7"; color = "#712"; icon = "📰"; }
    return (
      <div
        className="trfn-fact-card"
        tabIndex={0}
        style={{
          background: bg,
          color,
        }}
      >
        <span className="trfn-fact-icon" role="img" aria-label={type}>{icon}</span>
        <div style={{ fontWeight: 800 }}>{event.title || event.description || (type === "news" ? "News" : type === "holiday" ? "Holiday" : "Fun Fact")}</div>
        {event.description && event.title && (
          <div style={{ fontWeight: 600, fontSize: ".98em", marginTop: 3 }}>{event.description}</div>
        )}
        {sourceLinks.map((src, i) => (
          <a
            key={src}
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: type === "holiday" ? "#de57f5" : type === "news" ? "#2973dd" : "#1a8",
              fontSize: ".98em",
              marginLeft: 6
            }}
          >
            Source
          </a>
        ))}
      </div>
    );
  }

  // Video
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
          : (event.media_url ? (
            <video controls src={event.media_url} style={{ width: "100%", borderRadius: "1.1em", minHeight: 120 }} />
          ) : null)
        }
        <div style={{ paddingTop: 8, fontWeight: "700", color: "#c24dab" }}>{event.title || "Video"}</div>
        <div style={{ fontSize: ".98em", color: "#525" }}>{event.description}</div>
        {event.author && <span style={{ color: "#385" }}>By {event.author}</span>}
        {sourceLinks.map((src, i) => (
          <a
            key={src}
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#0b8",
              fontSize: "0.93em",
              display: "block",
              marginTop: 3
            }}
          >Source</a>
        ))}
      </div>
    );
  }

  // Default fallback card
  return (
    <div className="trfn-fact-card">
      <span className="trfn-fact-icon">🎉</span>
      <span className="trfn-fact-text">{event.title || event.description || "Surprise Fun!"}</span>
    </div>
  );
}

// --- DATE HELPERS --- //
function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}
function getRandomPastISO() {
  const today = new Date();
  const minYear = today.getFullYear() - 12;
  const year = randBetween(minYear, today.getFullYear());
  const month = randBetween(0, 11);
  const day = randBetween(1, 28);
  return new Date(year, month, day).toISOString().slice(0, 10);
}
function getSameDayLastYearISO() {
  const now = new Date();
  const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  return lastYear.toISOString().slice(0, 10);
}
function randBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
// YouTube embed helper
function embedYoutube(url) {
  if (!url) return "";
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=|v\/|shorts\/))([A-Za-z0-9_-]{11})/);
  if (!match) return url;
  return `https://www.youtube.com/embed/${match[1]}`;
}

export default TrendingFunNow;
