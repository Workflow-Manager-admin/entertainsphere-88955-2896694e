import React, { useEffect, useState } from "react";
import "./TrendingFunNow.css";

/**
 * PUBLIC_INTERFACE
 * TrendingFunNow: Enhanced time-travel fun discovery page!
 * - User picks a date: calendar, "Today", "Random", "Same Day Last Year" (playful controls)
 * - Fetches multiple types (facts, memes, holidays, news, videos) from fun events backend API for the chosen day
 * - Results are presented as responsive, visually themed, colorful sectioned cards per event type
 */
function TrendingFunNow() {
  // States for date picker, events, UI status, etc
  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const [reloadKey, setReloadKey] = useState(Date.now());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [events, setEvents] = useState([]);

  // Fetch fun events each time date or reload requested
  useEffect(() => {
    setLoading(true);
    setError("");
    setEvents([]);
    fetch(`/api/fun-events?date=${selectedDate}`)
      .then(r => r.json())
      .then(data => {
        if (!data || data.error) throw new Error(data.error || "No events.");
        setEvents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(e => {
        setError("Unable to load fun events for this date.");
        setLoading(false);
      });
  }, [selectedDate, reloadKey]);

  // Quick date controls
  function pickToday() {
    setSelectedDate(getTodayISO());
    setReloadKey(Date.now());
  }
  function pickRandom() {
    setSelectedDate(getRandomPastISO());
    setReloadKey(Date.now());
  }
  function pickLastYear() {
    setSelectedDate(getSameDayLastYearISO());
    setReloadKey(Date.now());
  }
  function chooseDate(e) {
    setSelectedDate(e.target.value);
    setReloadKey(Date.now());
  }

  // Render-friendly date label
  function prettyDateLabel(dateStr) {
    try {
      const today = getTodayISO();
      if (dateStr === today) return "Today";
      const dt = new Date(dateStr);
      return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  }

  // Cards grouped by event type
  const grouped = groupFunEvents(events);

  // Main UI
  return (
    <main className="trfn-main">
      <h1 className="trfn-title">Trending Fun Now <span role="img" aria-label="sparkles">✨</span></h1>
      <div className="trfn-intro-sub">
        Hop across time for fun! <br />
        Choose a date and discover epic memes, curious facts, zany holidays, viral news, and videos that trended on that day.<br />
        <span style={{ fontSize: "1.37em" }}>
          Play with time-travel! <span role="img" aria-label="party popper">🎉</span>
        </span>
      </div>
      {/* Time-travel controls: Date picker UI + themed buttons */}
      <section style={{ textAlign: "center", marginBottom: "1.9em" }}>
        <div style={{ display: "inline-flex", flexWrap: "wrap", gap: "0.77em", alignItems: "center" }}>
          <label className="trfn-date-label" htmlFor="date-picker" style={{
            fontWeight: 700,
            fontSize: "1.15em"
          }}>
            Pick a date:
          </label>
          <input
            id="date-picker"
            type="date"
            className="trfn-date-input"
            value={selectedDate}
            onChange={chooseDate}
            max={getTodayISO()}
          />
          <button className="trfn-picker-btn" onClick={pickToday} title="Jump to Today">Today</button>
          <button className="trfn-picker-btn" onClick={pickRandom} title="Random fun date">Random</button>
          <button className="trfn-picker-btn" onClick={pickLastYear} title="This day, last year">Same Day Last Year</button>
        </div>
        <div style={{
          marginTop: "0.7em",
          fontSize: "1.07em",
          color: "#b38dd8",
          fontWeight: 600
        }}>
          Showing fun for: <span style={{ color: "#e45cbe" }}>{prettyDateLabel(selectedDate)}</span>
        </div>
      </section>

      {/* Loader / error state */}
      {loading ? (
        <div className="trfn-loading">Fetching fun for {prettyDateLabel(selectedDate)}…</div>
      ) : error ? (
        <div className="trfn-err">{error}</div>
      ) : (
        <div className="trfn-scroll-wrap">
          {/* Show each event section in playful colors */}
          {["holiday", "meme", "fact", "news", "video"].map((type) =>
            grouped[type]?.length ? (
              <FunEventSection key={type} type={type} events={grouped[type]} />
            ) : null
          )}
          {/* Show fallback when nothing returned */}
          {Object.values(grouped).flat().length === 0 && (
            <section className="trfn-section">
              <div style={{
                fontSize: "1.32em",
                fontWeight: 700,
                color: "#ae4bea",
                textAlign: "center",
                padding: "2.2em 0"
              }}>
                No fun events for this date! Try another adventure.<br />
                <span style={{ fontSize: "2.1em" }}>🙃</span>
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}

/** Helper: today as yyyy-mm-dd ISO string */
function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** Helper: random day in last 12 years, always valid date */
function getRandomPastISO() {
  const today = new Date();
  const minYear = today.getFullYear() - 12;
  const year = randBetween(minYear, today.getFullYear());
  const month = randBetween(0, 11);
  const day = randBetween(1, 28); // Safe for all months
  return new Date(year, month, day).toISOString().slice(0, 10);
}

/** Helper: same day, last year */
function getSameDayLastYearISO() {
  const now = new Date();
  const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  return lastYear.toISOString().slice(0, 10);
}

function randBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Group array of events into { type: [events] } bucket */
function groupFunEvents(evts) {
  const map = {};
  (evts || []).forEach(ev => {
    if (!map[ev.type]) map[ev.type] = [];
    map[ev.type].push(ev);
  });
  return map;
}

/**
 * Section for event type: shows all cards for one type (facts, memes, ...)
 * @param {object} props
 * @param {string} props.type   - event type
 * @param {array}  props.events - fun events array
 */
function FunEventSection({ type, events }) {
  const { title, emoji } = getSectionMeta(type);
  let gridClass = "trfn-card-flex";
  if (type === "meme") gridClass = "trfn-meme-grid";
  else if (type === "fact" || type === "holiday" || type === "news") gridClass = "trfn-fact-grid";
  return (
    <section className={`trfn-section trfn-${type}`}>
      <h2>
        <span role="img" aria-label={title}>{emoji}</span> {title}
      </h2>
      <div className={gridClass}>
        {events.map((ev, idx) => (
          <FunEventCard key={ev.id || idx} event={ev} type={type} />
        ))}
      </div>
    </section>
  );
}

// Section titles and emoji per type
function getSectionMeta(type) {
  switch (type) {
    case "holiday": return { title: "Notable Holidays", emoji: "🎈" };
    case "meme": return { title: "Epic Memes", emoji: "😂" };
    case "fact": return { title: "Bizarre Facts", emoji: "💡" };
    case "news": return { title: "Viral News", emoji: "📰" };
    case "video": return { title: "Fun Videos", emoji: "🎬" };
    default: return { title: "Fun", emoji: "🎉" };
  }
}

/**
 * Card for each fun event. Visual treatment depends on type.
 * @param {object} props
 * @param {object} props.event
 * @param {string} props.type
 */
function FunEventCard({ event, type }) {
  const sourceLinks = (event.sources || []).filter(Boolean);

  // Meme cards
  if (type === "meme") {
    return (
      <div className="trfn-meme-card" tabIndex={0}>
        {event.media_url &&
          <img src={event.media_url} alt="Meme" className="trfn-meme-img" loading="lazy" />}
        <div className="trfn-meme-meta">
          <div className="trfn-meme-title">{event.title || event.description || "Meme"}</div>
          {event.author && <span className="trfn-meme-author">by {event.author}</span>}
          {sourceLinks.map(src => (
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

  // Fact cards (and reused for holiday/news)
  if (type === "fact" || type === "holiday" || type === "news") {
    let bg = undefined, color = undefined, icon = "💡";
    if (type === "holiday") {
      bg = "#f3eaff"; color = "#622bb7"; icon = "🎈";
    }
    if (type === "news") {
      bg = "#fffde7"; color = "#712"; icon = "📰";
    }
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

  // Video cards
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

  // Default fallback fun
  return (
    <div className="trfn-fact-card">
      <span className="trfn-fact-icon">🎉</span>
      <span className="trfn-fact-text">{event.title || event.description || "Surprise Fun!"}</span>
    </div>
  );
}

/** Helper: Convert YouTube standard/watch/shorts URLs to embed */
function embedYoutube(url) {
  if (!url) return "";
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=|v\/|shorts\/))([A-Za-z0-9_-]{11})/);
  if (!match) return url;
  return `https://www.youtube.com/embed/${match[1]}`;
}

export default TrendingFunNow;
