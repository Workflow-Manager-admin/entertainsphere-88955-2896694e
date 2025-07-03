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

      {/* ---------- LIVE/TRENDING FUN INTERACTIVE SECTION ---------- */}
      <LiveTrendingFunSection />
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


/*
  === LIVE/TRENDING FUN SECTION CODE ===
  Adds a full-featured "Live/Trending Fun" area at bottom of the page:
  - Playful time selector (Today, Yesterday, Last 7 Days, Part of Day, Custom)
  - Tabs for Memes, Tweets, Clips, Fun Facts
  - Fun randomizer button
  - Themed feed/cards per tab and time
  - All matching the modern playful/colorful design language
*/
const LIVETABS = [
  { label: "Memes", emoji: "😂" },
  { label: "Tweets", emoji: "🐦" },
  { label: "Clips", emoji: "🎬" },
  { label: "Fun Facts", emoji: "💡" },
];

const PARTS_OF_DAY = ["Morning", "Afternoon", "Evening", "Night"];

function LiveTrendingFunSection() {
  const [tab, setTab] = useState("Memes");
  const [timerange, setTimerange] = useState("Today");
  const [custom, setCustom] = useState({ from: "", to: "" });
  const [partOfDay, setPartOfDay] = useState("");
  const [loading, setLoading] = useState(false);
  const [funList, setFunList] = useState([]);
  const [error, setError] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);

  // On tab/time selector/part change – update feed
  useEffect(() => {
    fetchContent();
    // eslint-disable-next-line
  }, [tab, timerange, partOfDay, custom.from, custom.to]);

  // Optional: auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const t = setInterval(() => fetchContent(), 60000);
    return () => clearInterval(t);
    // eslint-disable-next-line
  }, [autoRefresh, tab, timerange, partOfDay, custom.from, custom.to]);

  // PUBLIC_INTERFACE
  // Fetch content for tab/time/part/custom options
  function fetchContent({ randomOne = false } = {}) {
    setLoading(true);
    setError("");
    let feedAPI = "";
    // For demo: public APIs and hardcoded for Clips
    if (tab === "Memes") {
      feedAPI = randomOne
        ? "https://meme-api.com/gimme/1"
        : "https://meme-api.com/gimme/8";
    } else if (tab === "Tweets") {
      // Not real tweets: simulate with famous/funny quote (there's no free tweet api)
      feedAPI = "https://api.quotable.io/random?tags=funny|famous";
    } else if (tab === "Clips") {
      feedAPI = ""; // Will fallback
    } else if (tab === "Fun Facts") {
      feedAPI = "https://uselessfacts.jsph.pl/random.json?language=en";
    }

    // Optionally factor timerange/part/custom into params (demo not wired to backend)
    if (feedAPI) {
      fetch(feedAPI)
        .then(resp => resp.json())
        .then(data => {
          let cards = [];
          if (tab === "Memes") {
            cards = (data.memes
              ? data.memes
              : data instanceof Array
                ? data
                : data && data.url
                  ? [data]
                  : []
            ).map(m => ({
              id: m.postLink || m.url || Math.random(),
              type: "meme",
              title: m.title || "",
              author: m.author || "",
              image: m.url,
              subreddit: m.subreddit || "",
              url: m.postLink,
            }));
          } else if (tab === "Tweets") {
            cards = [{
              id: data._id || Math.random(),
              type: "tweet",
              text: data.content || "Check out this fun tweet!",
              author: data.author || "user",
              avatar: "🐦"
            }];
          } else if (tab === "Fun Facts") {
            cards = [{
              id: data.id || Math.random(),
              type: "fact",
              text: data.text || "",
              source: data.source_url || ""
            }];
          }
          setFunList(cards);
          setLoading(false);
        })
        .catch(() => {
          setError("Couldn't fetch trending fun! Try again later.");
          setLoading(false);
        });
    } else if (tab === "Clips") {
      // Hardcoded demo: fun YouTube video list
      let CLIP_DEMOS = [
        {
          id: "clip1",
          type: "clip",
          ytId: "M1F81V-NhP0",
          title: "Cat Vibing",
          desc: "The internet's favorite dancing cat!",
        },
        {
          id: "clip2",
          type: "clip",
          ytId: "RP4abiHdQpc",
          title: "Happy Dog Showreel",
          desc: "Wholesome dog moments.",
        },
        {
          id: "clip3",
          type: "clip",
          ytId: "hzMgD0kT6Nw",
          title: "Ultimate Fails",
          desc: "Try not to laugh!",
        },
      ];
      setFunList(CLIP_DEMOS);
      setLoading(false);
    } else {
      setFunList([]);
      setLoading(false);
    }
  }

  // PUBLIC_INTERFACE: Show me something fun - randomizer feeder
  function handleShowMeFun() {
    fetchContent({ randomOne: true });
  }

  // UI: playful time selector
  function TimeSelector() {
    return (
      <div className="ltime-select-row">
        {["Today", "Yesterday", "Last 7 Days", "Part of Day", "Custom"].map(mode => (
          <button
            className={`ltime-btn${timerange === mode ? " active" : ""}`}
            key={mode}
            aria-pressed={timerange === mode}
            onClick={() => {
              setTimerange(mode);
              if (mode !== "Part of Day") setPartOfDay("");
            }}
          >
            {mode}
          </button>
        ))}
        {timerange === "Part of Day" && (
          <select
            className="ltime-part-select"
            value={partOfDay}
            onChange={e => setPartOfDay(e.target.value)}
          >
            <option value="">Part...</option>
            {PARTS_OF_DAY.map(part => (
              <option key={part} value={part}>{part}</option>
            ))}
          </select>
        )}
        {timerange === "Custom" && (
          <span className="ltime-custom-wrap">
            <input
              type="date"
              value={custom.from}
              onChange={e => setCustom(c => ({ ...c, from: e.target.value }))}
              className="ltime-custom-date"
              max={custom.to || getTodayISO()}
              aria-label="From date"
            />
            <span style={{ marginInline: 3 }}>to</span>
            <input
              type="date"
              value={custom.to}
              onChange={e => setCustom(c => ({ ...c, to: e.target.value }))}
              className="ltime-custom-date"
              min={custom.from || ""}
              max={getTodayISO()}
              aria-label="To date"
            />
          </span>
        )}
      </div>
    );
  }

  // UI: tab selector with playful emoji
  function TabFilter() {
    return (
      <div className="ltabs-row">
        {LIVETABS.map(item => (
          <button
            key={item.label}
            className={`ltab-btn${tab === item.label ? " active" : ""}`}
            onClick={() => setTab(item.label)}
            aria-pressed={tab === item.label}
          >{item.emoji} {item.label}</button>
        ))}
        <label className="live-autorefresh-toggle">
          <input type="checkbox" checked={autoRefresh} onChange={() => setAutoRefresh(v => !v)} />
          <span className="chex">🔁</span>
          <span className="autorefresh-label">Auto-refresh</span>
        </label>
      </div>
    );
  }

  // Themed feed/cards per active tab
  function CardGrid() {
    if (loading) return (
      <div className="livefun-loading">Fetching trending fun... <span role="img" aria-label="wait">🌈</span></div>
    );
    if (error) return <div className="livefun-err">{error}</div>;
    if (!funList.length) return (
      <div className="livefun-empty">
        Nothing fun here just yet! Try a different time or tab.
      </div>
    );
    return (
      <div className="livefun-feedcards">
        {funList.map(card => {
          if (tab === "Memes") {
            return (
              <div className="livefun-card meme" key={card.id}>
                <img src={card.image} alt={card.title || "Meme"} className="livefun-img" loading="lazy" />
                <div className="livefun-metabar">
                  <div className="lf-mt-title">{card.title}</div>
                  <div className="lf-mt-meta">
                    {card.subreddit && <span className="lf-meta lf-meta-subreddit">r/{card.subreddit}</span>}
                    {card.author && <span className="lf-meta lf-meta-author">{card.author}</span>}
                    {card.url && (
                      <a href={card.url} className="lf-meta lf-meta-link" target="_blank" rel="noopener noreferrer">
                        Source
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          }
          if (tab === "Tweets") {
            return (
              <div className="livefun-card tweet" key={card.id}>
                <span className="lf-emoji">{card.avatar}</span>
                <div className="lf-tweet-text">{card.text}</div>
                {card.author && <div className="lf-meta lf-tweet-author">— {card.author}</div>}
              </div>
            );
          }
          if (tab === "Clips") {
            return (
              <div className="livefun-card clip" key={card.id}>
                <iframe
                  src={`https://www.youtube.com/embed/${card.ytId}`}
                  title={card.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ borderRadius: "1.1em", width: "100%", minHeight: 145 }}
                ></iframe>
                <div className="lf-mt-title">{card.title}</div>
                <div className="lf-mt-meta">{card.desc}</div>
              </div>
            );
          }
          if (tab === "Fun Facts") {
            return (
              <div className="livefun-card funfact" key={card.id}>
                <span className="lf-emoji">💡</span>
                <div className="lf-fact-text">{card.text}</div>
                {card.source && <a href={card.source} className="lf-meta lf-meta-link" target="_blank" rel="noopener noreferrer">Source</a>}
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  }

  // PUBLIC_INTERFACE
  return (
    <section className="livefun-section">
      <h2 className="livefun-title">
        <span role="img" aria-label="zap" style={{ fontSize: "1.1em", marginRight: 7 }}>⚡</span>
        Live/Trending Fun
      </h2>
      <TimeSelector />
      <TabFilter />
      <button className="show-me-fun-btn" type="button" onClick={handleShowMeFun}>
        <span className="funbtn-emoji" role="img" aria-label="party popper">🎉</span> Show Me Something Fun!
      </button>
      <CardGrid />
    </section>
  );
}

export default TrendingFunNow;
