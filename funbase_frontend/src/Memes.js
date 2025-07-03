import React, { useState, useEffect, useRef } from "react";
import "./Memes.css";

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
        ) : memes.length === 0 ? (
          <div className="memes-nodata">No memes found. Try uploading or changing your search!</div>
        ) : (
          <div className="memes-grid">
            {memes.map((meme) => (
              <MemeCard
                key={meme.id}
                meme={meme}
                user={user}
                onAction={handleMemeAction}
                onTagClick={handleTagClick}
              />
            ))}
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
