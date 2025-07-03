import React, { useState, useEffect } from "react";
import "./MovieSong.css";

// Mood and Genre options
const MOODS = [
  { name: "Happy", emoji: "😃" },
  { name: "Sad", emoji: "😢" },
  { name: "Romantic", emoji: "💖" },
  { name: "Energetic", emoji: "⚡" },
  { name: "Chill", emoji: "😎" },
  { name: "Angry", emoji: "😠" },
  { name: "Inspiring", emoji: "🚀" },
];
const GENRES = ["Pop", "Rock", "Rap", "Classical", "EDM", "Jazz", "Comedy", "Action", "Drama", "Family"];

// Helper: deduplicate array by id
function uniqueById(arr) {
  const seen = {};
  return arr.filter(item => {
    if (!item || !item.id) return false;
    if (seen[item.id]) return false;
    seen[item.id] = true;
    return true;
  });
}

/**
 * PUBLIC_INTERFACE
 * FunBase Movie & Song suggestion hub (mood or genre-based). Includes:
 * - Mood/genre selectors (vertical and horizontal scroll)
 * - Suggestion Card for movie or song (with details, image, actions)
 * - Next/similar navigation
 * - Search/filter bar
 * - Favorites management
 */
function MovieSong() {
  const [tab, setTab] = useState("movies"); // "movies" or "songs"
  const [mood, setMood] = useState("Happy");
  const [genre, setGenre] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showFav, setShowFav] = useState(false);
  const [search, setSearch] = useState("");
  const [err, setErr] = useState("");

  // Fetch suggestions when mood, genre, tab, or search changes
  useEffect(() => {
    fetchSuggestions();
    // eslint-disable-next-line
  }, [mood, genre, tab, search]);

  // Load favorites on mount
  useEffect(() => {
    fetch("/api/favorites?type=" + tab)
      .then(res => res.json())
      .then(data => setFavorites(Array.isArray(data) ? data : []))
      .catch(() => setFavorites([]));
  }, [tab]);

  /** PUBLIC_INTERFACE: fetch movie/song suggestion(s) from backend */
  function fetchSuggestions() {
    setLoading(true);
    setErr("");
    let url = `/api/${tab}/suggestions?mood=${encodeURIComponent(mood)}&genre=${encodeURIComponent(genre)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    fetch(url)
      .then(res => res.json())
      .then(list => {
        setSuggestions(Array.isArray(list) ? list : []);
        setSelected(Array.isArray(list) && list.length ? list[0] : null);
        setLoading(false);
      })
      .catch(() => {
        setErr("Failed to fetch suggestions.");
        setLoading(false);
      });
  }

  /** PUBLIC_INTERFACE: next/prev navigation for suggestion list */
  function showNext(dir = 1) {
    if (!suggestions.length) return;
    const idx = selected ? suggestions.findIndex(s => s.id === selected.id) : 0;
    let nextIdx = (idx + dir + suggestions.length) % suggestions.length;
    setSelected(suggestions[nextIdx]);
  }

  /** PUBLIC_INTERFACE: take a random suggestion */
  function randomizePick() {
    if (!suggestions.length) return;
    const idx = Math.floor(Math.random() * suggestions.length);
    setSelected(suggestions[idx]);
  }

  /** PUBLIC_INTERFACE: Save or unsave from favorites */
  function toggleFavorite(item) {
    if (!item || !item.id) return;
    const isFav = favorites.some(f => f.id === item.id);
    const endpoint = `/api/favorites/${isFav ? "remove" : "add"}`;
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, type: tab }),
      credentials: "include",
    })
      .then(r => r.json())
      .then(resp => {
        // Refresh favorites
        fetch("/api/favorites?type=" + tab)
          .then(res => res.json())
          .then(data => setFavorites(Array.isArray(data) ? data : []));
      });
  }

  /** PUBLIC_INTERFACE: handle mood/genre selection */
  function handleMoodSelect(name) {
    setMood(name);
    setGenre("");
    setSearch("");
    setErr("");
  }
  function handleGenreSelect(name) {
    setGenre(name);
    setSearch("");
    setErr("");
  }
  function handleSearch(e) {
    e.preventDefault();
    fetchSuggestions();
  }

  /** PUBLIC_INTERFACE: show favorites list UI */
  function toggleShowFav() {
    setShowFav(v => !v);
  }
  /** PUBLIC_INTERFACE: view a favorite from the list */
  function handleSelectFav(item) {
    setSelected(item);
    setShowFav(false);
  }

  // Convenience: Get localized tab label
  const tabLabel = tab === "movies" ? "Movies" : "Songs";
  const placeholderText =
    tab === "movies" ? "e.g. action, family, Pixar, Tom Hanks" : "e.g. pop, rap, Taylor Swift, 90s feel";

  // Main render
  return (
    <main className="funbase-movie-song-page">
      <section className="mvs-topbar">
        <TabSwitcher tab={tab} setTab={setTab} />
        <form className="mvs-search-form" onSubmit={handleSearch} autoComplete="off">
          <input
            className="mvs-search"
            type="text"
            placeholder={"🔎 Search " + tabLabel + ", genres, artists, ..."}
            value={search}
            onChange={e => { setSearch(e.target.value); setGenre(""); setMood(""); }}
            aria-label={`Search ${tabLabel}`}
          />
          <button className="mvs-btn" type="submit">Search</button>
        </form>
        <button className="mvs-btn mvs-fav-btn" type="button" onClick={toggleShowFav}>
          {showFav ? "Hide" : "Favorites"} ⭐
        </button>
      </section>
      {/* Mood & genre filter bar */}
      <section className="mvs-moodbar">
        <div className="mvs-moods">
          {MOODS.map(({ name, emoji }) => (
            <button
              key={name}
              className={`mvs-mood-btn${mood === name ? " active" : ""}`}
              title={name}
              onClick={() => handleMoodSelect(name)}
              aria-label={name}
            >{emoji} {name}</button>
          ))}
        </div>
        <div className="mvs-genres">
          {GENRES.map(g => (
            <button
              key={g}
              className={`mvs-genre-btn${genre === g ? " active" : ""}`}
              onClick={() => handleGenreSelect(g)}
              aria-label={g}
            >{g}</button>
          ))}
        </div>
      </section>
      {/* Suggestion/main card */}
      <section className="mvs-center">
        {err && <div className="mvs-error">{err}</div>}
        {loading ? (
          <div className="mvs-loading">Loading {tabLabel}...</div>
        ) : showFav ? (
          <FavoritesList
            tab={tab}
            favorites={uniqueById(favorites)}
            onSelect={handleSelectFav}
            onRemove={item => toggleFavorite(item)}
          />
        ) : selected ? (
          <SuggestionCard
            item={selected}
            tab={tab}
            isFavorite={favorites.some(f => f.id === selected.id)}
            onLike={() => toggleFavorite(selected)}
            onNext={showNext}
            onSimilar={() => randomizePick()}
            canNext={suggestions.length > 1}
          />
        ) : (
          <div className="mvs-nodata">
            No {tabLabel.toLowerCase()} found for
            {(mood && ` mood "${mood}"`) || ""}
            {(genre && ` genre "${genre}"`) || ""}
            {(search && ` query "${search}"`) || ""}.
          </div>
        )}
      </section>
    </main>
  );
}

/** SuggestionCard: displays movie/song suggestion w/ details, actions */
function SuggestionCard({ item, tab, isFavorite, onLike, onNext, onSimilar, canNext }) {
  // The card presentation
  const isMovie = tab === "movies";
  return (
    <div className="mvs-suggest-card">
      <div className="mvs-card-image">
        {item.image_url ? (
          <img src={item.image_url} alt={item.title || item.name} loading="lazy"/>
        ) : (
          <div className="mvs-img-placeholder">{isMovie ? "🎬" : "🎵"}</div>
        )}
      </div>
      <div className="mvs-card-content">
        <h2 className="mvs-card-title">{item.title || item.name || "Untitled"}</h2>
        <div className="mvs-card-info">
          {isMovie && item.year && <span>({item.year})</span>}
          {item.artist && <span>By {item.artist}</span>}
          {item.genre && <span className="mvs-card-genre">{item.genre}</span>}
        </div>
        {item.description && <div className="mvs-card-desc">{item.description}</div>}
        <div className="mvs-card-actions">
          <button className={`mvs-btn${isFavorite ? " active" : ""}`} onClick={onLike}>
            {isFavorite ? "Remove from ⭐" : "Add to ⭐"}
          </button>
          {canNext && (
            <button className="mvs-btn" onClick={() => onNext(1)} title="Show next suggestion">Next ➡️</button>
          )}
          <button className="mvs-btn" onClick={onSimilar} title="Random similar">🎲 Random</button>
        </div>
      </div>
    </div>
  );
}

/** FavoritesList: shows all favorites, allow remove/select */
function FavoritesList({ tab, favorites, onSelect, onRemove }) {
  if (!favorites || !favorites.length)
    return <div className="mvs-fav-nodata">No favorites yet.</div>;
  return (
    <div className="mvs-favorites-list">
      <h3>⭐ My {tab === "movies" ? "Movies" : "Songs"} Favorites</h3>
      <div className="mvs-fav-grid">
        {favorites.map(item => (
          <div key={item.id} className="mvs-fav-card">
            <div className="mvs-fav-img">
              {item.image_url ? <img src={item.image_url} alt={item.title || item.name} /> : <span>{tab === "movies" ? "🎬" : "🎵"}</span>}
            </div>
            <div className="mvs-fav-content">
              <div className="mvs-fav-title">{item.title || item.name || "Untitled"}</div>
              <div className="mvs-fav-actions">
                <button className="mvs-btn" onClick={() => onSelect(item)}>Open</button>
                <button className="mvs-btn" onClick={() => onRemove(item)} title="Remove from favorites">❌</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** PUBLIC_INTERFACE
 * TabSwitcher: toggles between Movies and Songs suggestion views.
 */
function TabSwitcher({ tab, setTab }) {
  return (
    <div className="mvs-tab-switcher">
      <button
        className={`mvs-btn mvs-tab-btn${tab === "movies" ? " active" : ""}`}
        onClick={() => setTab("movies")}
        aria-selected={tab === "movies"}
      >
        🎬 Movies
      </button>
      <button
        className={`mvs-btn mvs-tab-btn${tab === "songs" ? " active" : ""}`}
        onClick={() => setTab("songs")}
        aria-selected={tab === "songs"}
      >
        🎵 Songs
      </button>
    </div>
  );
}

export default MovieSong;
