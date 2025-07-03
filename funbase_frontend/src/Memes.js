import React, { useState, useEffect, useRef } from "react";
import "./Memes.css";

// --- Default memes as fallback ---
// These CAN be placed in a util file but for this scope, in-module is suitable.
const DEFAULT_MEMES = [
  {
    id: "default1",
    image_url: "https://i.imgur.com/7FVqB2D.jpg",
    caption: "When you drop your phone but it lands screen up.",
    tags: "funny,relief,phone",
    uploader: "AutoMemer",
    timestamp: Date.now() - 600000, // 10m ago
    likes: [],
  },
  {
    id: "default2",
    image_url: "https://i.imgur.com/AaQLFri.jpeg",
    caption: "Coding at 3am like:",
    tags: "programming,relatable,night",
    uploader: "MemeBot",
    timestamp: Date.now() - 1700000,
    likes: ["Alex"],
  },
  {
    id: "default3",
    image_url: "https://i.imgur.com/qkdpN.jpg",
    caption: "Me trying to eat healthy for one day.",
    tags: "food,life,funny",
    uploader: "MemeTeam",
    timestamp: Date.now() - 3500000,
    likes: [],
  },
  {
    id: "default4",
    image_url: "https://i.imgur.com/8B7VsXW.jpg",
    caption: "When WiFi finally reconnects.",
    tags: "wifi,celebrate,joy",
    uploader: "LOL",
    timestamp: Date.now() - 800000,
    likes: ["Joy"],
  },
  {
    id: "default5",
    image_url: "https://i.imgur.com/Oi4J1co.jpeg",
    caption: "That Friday feeling.",
    tags: "friday,weekend,party",
    uploader: "TGIF",
    timestamp: Date.now() - 4200000,
    likes: [],
  },
  {
    id: "default6",
    image_url: "https://i.imgur.com/BkFiUzy.jpeg",
    caption: "When you realize it’s Monday tomorrow...",
    tags: "monday,sad,week",
    uploader: "MemeBot",
    timestamp: Date.now() - 9000000,
    likes: [],
  },
  {
    id: "default7",
    image_url: "https://i.imgur.com/bYqFwl5.jpeg",
    caption: "Trying to act normal in a video call.",
    tags: "awkward,video call",
    uploader: "MemeTeam",
    timestamp: Date.now() - 6730000,
    likes: [],
  },
  {
    id: "default8",
    image_url: "https://i.imgur.com/6bdz6Er.jpg",
    caption: "That 'one more episode' promise.",
    tags: "series,tv,funny",
    uploader: "AutoMemer",
    timestamp: Date.now() - 10400000,
    likes: [],
  }
];

// Returns a shuffled copy (Fisher-Yates) of the array, sampled to 'count' items
function randomSample(array, count) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}
/**
 * PUBLIC_INTERFACE
 * Memes page for FunBase: trending meme grid, upload, filter & actions (like/save/share), themed and responsive.
 */
function Memes() {
  // State for memes
  const [memes, setMemes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const [preview, setPreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [tags, setTags] = useState("");
  const [user] = useState({ username: "Alex" }); // Demo: current logged-in user
  const [loading, setLoading] = useState(false);

  // Fetch memes from backend
  useEffect(() => {
    fetchMemes();
    // eslint-disable-next-line
  }, []);

  // PUBLIC_INTERFACE
  function fetchMemes(query = "") {
    setLoading(true);
    let url = "/api/memes";
    if (query) url += `?search=${encodeURIComponent(query)}`;
    fetch(url)
      .then((res) => res.json())
      .then((memes) => {
        setMemes(Array.isArray(memes) ? memes : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  // PUBLIC_INTERFACE: handle search/filter
  function handleSearch(e) {
    e.preventDefault();
    fetchMemes(searchTerm);
  }

  // PUBLIC_INTERFACE: handle like/save/share actions
  const handleMemeAction = (id, action) => {
    fetch(`/api/memes/${id}/${action}`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((updated) => {
        setMemes((prev) =>
          prev.map((m) => (m.id === id ? { ...m, ...updated } : m))
        );
      });
  };

  // PUBLIC_INTERFACE: handle image selection and preview for upload
  function handleImageChange(e) {
    setUploadErr("");
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadErr("Please select a valid image.");
      setSelectedImage(null);
      setPreview(null);
      return;
    }
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }

  // PUBLIC_INTERFACE: handle meme upload
  function handleUpload(e) {
    e.preventDefault();
    setUploadErr("");
    if (!selectedImage) {
      setUploadErr("Image is required.");
      return;
    }
    setUploading(true);
    const form = new FormData();
    form.append("image", selectedImage);
    form.append("tags", tags);
    form.append("uploader", user.username);
    fetch("/api/memes/upload", {
      method: "POST",
      body: form,
      credentials: "include",
    })
      .then((res) => res.json())
      .then((resp) => {
        if (resp.error) {
          setUploadErr(resp.error);
        } else {
          setShowUpload(false);
          setTags("");
          setSelectedImage(null);
          setPreview(null);
          fetchMemes(); // refresh grid
        }
        setUploading(false);
      })
      .catch(() => {
        setUploadErr("Failed to upload. Try again.");
        setUploading(false);
      });
  }

  // PUBLIC_INTERFACE: responsive scroll to upload
  const uploadRef = useRef(null);
  function scrollToUpload() {
    if (uploadRef.current) uploadRef.current.scrollIntoView({ behavior: "smooth" });
  }

  // Tag-based quick filter
  function handleTagClick(tag) {
    setSearchTerm(tag);
    fetchMemes(tag);
  }

  return (
    <main className="funbase-memes-page">
      {/* Topbar: Filter/Search */}
      <section className="memes-topbar">
        <form className="memes-search-form" onSubmit={handleSearch} autoComplete="off">
          <input
            className="memes-search"
            type="text"
            placeholder="🔎 Search memes, tags or users"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search memes"
          />
          <button className="memes-btn" type="submit">Search</button>
        </form>
        {user && (
          <button className="memes-btn upload-cta" type="button" onClick={() => { setShowUpload((v) => !v); setTimeout(scrollToUpload, 150); }}>
            <span className="emoji">⬆️</span> Upload Meme
          </button>
        )}
      </section>

      {/* Meme Grid Feed */}
      <section className="memes-grid-area">
        <h2 className="memes-grid-title">😂 Trending Memes</h2>
        {loading ? (
          <div className="memes-loading">Loading memes...</div>
        ) : (memes.length === 0) ? (
          // Even if zero backend memes: display 6 defaults
          <div className="memes-grid">
            {randomSample(DEFAULT_MEMES, 6).map((meme) => (
              <MemeCard
                key={meme.id}
                meme={meme}
                user={user}
                onAction={() => {}} // no-op for defaults
                onTagClick={handleTagClick}
              />
            ))}
          </div>
        ) : (
          // If <6 real memes, supplement with random defaults to make 6
          <div className="memes-grid">
            {(() => {
              if (memes.length >= 6) {
                return memes.slice(0, 12).map((meme) => (
                  <MemeCard
                    key={meme.id}
                    meme={meme}
                    user={user}
                    onAction={handleMemeAction}
                    onTagClick={handleTagClick}
                  />
                ));
              }
              // Use only those defaults whose id does not clash with real memes
              const usedIds = new Set(memes.map(m => m.id));
              const availableDefaults = DEFAULT_MEMES.filter(def => !usedIds.has(def.id));
              const needed = 6 - memes.length;
              const supplementDefaults = randomSample(availableDefaults, needed);
              // Render real memes first, then defaults
              const allMemes = [...memes, ...supplementDefaults];
              return allMemes.map((meme) => (
                <MemeCard
                  key={meme.id}
                  meme={meme}
                  user={user}
                  onAction={
                    usedIds.has(meme.id) ? handleMemeAction : () => {}
                  }
                  onTagClick={handleTagClick}
                />
              ));
            })()}
          </div>
        )}
      </section>

      {/* Upload Meme Section */}
      {user && (
        <section className={`memes-upload-area${showUpload ? " show" : ""}`} ref={uploadRef}>
          <h3 className="memes-upload-title">Upload New Meme</h3>
          <form className="memes-upload-form" onSubmit={handleUpload} encType="multipart/form-data">
            <label className="memes-upload-label">
              Meme Image:
              <input type="file" accept="image/*" onChange={handleImageChange} disabled={uploading}/>
            </label>
            {preview && (
              <img className="memes-upload-preview" src={preview} alt="Preview" />
            )}
            <label className="memes-upload-label">
              Tags (comma separated):
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="funny, cat, viral"
                disabled={uploading}
              />
            </label>
            <button className="memes-btn" type="submit" disabled={uploading}>Submit</button>
            {uploadErr && <div className="memes-upload-err">{uploadErr}</div>}
            <button className="memes-btn cancel" type="button" onClick={() => setShowUpload(false)} disabled={uploading}>Cancel</button>
          </form>
        </section>
      )}
    </main>
  );
}

/**
 * MemeCard component – fun meme card with image, user/tags, like/save/share
 * @param {object} props
 * @param {object} props.meme
 * @param {object} props.user
 * @param {(id: string, action: string) => void} props.onAction
 * @param {(tag: string) => void} props.onTagClick
 */
function MemeCard({ meme, user, onAction, onTagClick }) {
  const [copied, setCopied] = useState(false);
  const isLiked = meme.likes?.includes?.(user?.username);

  // PUBLIC_INTERFACE: handle share (copy to clipboard)
  function handleShare() {
    const url = window.location.origin + "/memes/" + meme.id;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  }

  return (
    <div className="meme-card">
      <img className="meme-img" src={meme.image_url || meme.url} alt={meme.caption || "FunBase Meme"} loading="lazy" />
      <div className="meme-meta">
        <div className="meme-user">{meme.uploader || "anon"} <span className="meme-time">{friendlyTime(meme.timestamp)}</span></div>
        <div className="meme-tags">
          {meme.tags?.split(",").map((tag) =>
            tag.trim() ? (
              <span key={tag.trim()} className="meme-tag" onClick={() => onTagClick(tag.trim())}>
                #{tag.trim()}
              </span>
            ) : null
          )}
        </div>
        <div className="meme-actions">
          <button
            className={`meme-action-btn${isLiked ? " liked" : ""}`}
            title={isLiked ? "Unlike" : "Like"}
            aria-label="Like meme"
            onClick={() => onAction(meme.id, "like")}
          >
            {isLiked ? "❤️" : "🤍"} <span>{meme.likes?.length || 0}</span>
          </button>
          <button
            className="meme-action-btn"
            title="Save"
            aria-label="Save meme"
            onClick={() => onAction(meme.id, "save")}
          >⭐</button>
          <button
            className="meme-action-btn"
            title="Share"
            aria-label="Share meme"
            onClick={handleShare}
          >
            📤
            {copied && <span className="meme-share-hint">Copied!</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper: friendly time display (e.g. "2m ago")
function friendlyTime(ts) {
  if (!ts) return "";
  const date = typeof ts === "string" || typeof ts === "number" ? new Date(ts) : ts;
  const now = new Date();
  const diff = (now - date) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${date.toLocaleDateString()}`;
}

export default Memes;
