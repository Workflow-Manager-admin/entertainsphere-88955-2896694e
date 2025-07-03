import React, { useEffect, useState } from "react";
import "./TrendingFunNow.css";

/**
 * PUBLIC_INTERFACE
 * TrendingFunNow: Fetches and displays a fun feed: memes, facts, jokes, quotes, and a random photo in a playful, scrollable layout.
 */
function TrendingFunNow() {
  // State for all content blocks
  const [memes, setMemes] = useState([]);
  const [facts, setFacts] = useState([]);
  const [joke, setJoke] = useState(null);
  const [quote, setQuote] = useState(null);
  const [randomPhoto, setRandomPhoto] = useState("");
  const [errors, setErrors] = useState({});

  // Load all fun content
  useEffect(() => {
    fetchMemes();
    fetchFacts();
    fetchJoke();
    fetchQuote();
    fetchPhoto();
  }, []);

  // Fetches 1-3 random memes (Gimme API)
  function fetchMemes() {
    fetch("https://meme-api.com/gimme/3")
      .then((res) => res.json())
      .then((data) => {
        if (data.memes) setMemes(data.memes);
        else if (data.url && data.title)
          setMemes([{ url: data.url, title: data.title, author: data.author, subreddit: data.subreddit }]);
        else setMemes([]);
      })
      .catch(() => setErrors((e) => ({ ...e, memes: "Couldn't load memes!" })));
  }

  // Fetches 1-2 weird facts (Useless Facts)
  function fetchFacts() {
    Promise.all([
      fetch("https://uselessfacts.jsph.pl/random.json?language=en").then((r) => r.json()),
      fetch("https://uselessfacts.jsph.pl/random.json?language=en").then((r) => r.json())
    ])
      .then((arr) => setFacts([arr[0], arr[1]].filter((f, i, a) => a.findIndex(x => x.id === f.id) === i)))
      .catch(() => setErrors((e) => ({ ...e, facts: "No facts found!" })));
  }

  // Fetches a clean joke (JokeAPI)
  function fetchJoke() {
    fetch("https://v2.jokeapi.dev/joke/Any?type=single,twopart&safe-mode")
      .then((res) => res.json())
      .then((data) => setJoke(data))
      .catch(() => setErrors((e) => ({ ...e, joke: "Joke not found!" })));
  }

  // Fetches a quote (Quotable)
  function fetchQuote() {
    fetch("https://api.quotable.io/random")
      .then((res) => res.json())
      .then((data) => setQuote(data))
      .catch(() => setErrors((e) => ({ ...e, quote: "Quote not found!" })));
  }

  // Gets a random photos image URL (picsum.photos)
  function fetchPhoto() {
    // Give it a random value so it's different on every load
    const w = 510 + Math.floor(Math.random() * 180);
    const h = 300 + Math.floor(Math.random() * 100);
    setRandomPhoto(`https://picsum.photos/${w}/${h}?random=${Date.now()}`);
  }

  // Helpers for components
  const MemeTile = ({ meme }) => (
    <div className="trfn-meme-card">
      <img src={meme.url} alt={meme.title || "Meme"} className="trfn-meme-img" loading="lazy" />
      <div className="trfn-meme-meta">
        <div className="trfn-meme-title">{meme.title}</div>
        {meme.subreddit && <span className="trfn-meme-subreddit">r/{meme.subreddit}</span>}
        {meme.author && <span className="trfn-meme-author">by {meme.author}</span>}
      </div>
    </div>
  );

  const FactBlock = ({ fact }) => (
    <div className="trfn-fact-card">
      <span className="trfn-fact-icon">🤪</span>
      <span className="trfn-fact-text">{fact.text}</span>
    </div>
  );

  return (
    <main className="trfn-main">
      <h1 className="trfn-title">Trending Fun Now <span role="img" aria-label="sunglasses emoji">😎</span></h1>
      <div className="trfn-intro-sub">
        Dive into instant fun — scroll for fresh trending memes, wild facts, a joke, quote, and a surprise photo!
      </div>
      <div className="trfn-scroll-wrap">
        {/* MEMES */}
        <section className="trfn-section trfn-memes">
          <h2><span role="img" aria-label="joy emoji">😂</span> Meme-moment</h2>
          <div className="trfn-meme-grid">
            {memes.length
              ? memes.map((meme, i) => <MemeTile meme={meme} key={meme.url + i} />)
              : (errors.memes ? <div className="trfn-err">{errors.memes}</div> : <div className="trfn-loading">Loading memes…</div>)
            }
          </div>
        </section>
        {/* FAST FACTS */}
        <section className="trfn-section trfn-facts">
          <h2><span role="img" aria-label="lightbulb emoji">💡</span> Weird Facts</h2>
          <div className="trfn-fact-grid">
            {facts.length
              ? facts.map((fact, i) => <FactBlock fact={fact} key={fact.id + i} />)
              : (errors.facts ? <div className="trfn-err">{errors.facts}</div> : <div className="trfn-loading">Loading facts…</div>)
            }
          </div>
        </section>
        {/* CLEAN JOKE */}
        <section className="trfn-section trfn-joke">
          <h2><span role="img" aria-label="lol emoji">🤣</span> Clean Joke</h2>
          <div className="trfn-joke-card">
            {!joke
              ? (errors.joke ? <div className="trfn-err">{errors.joke}</div> : <div className="trfn-loading">Fetching a clean joke…</div>)
              : joke.type === "twopart"
                ? (<><div className="trfn-joke-setup">{joke.setup}</div>
                      <div className="trfn-joke-delim">—</div>
                      <div className="trfn-joke-delivery">{joke.delivery}</div></>)
                : (<div className="trfn-joke-setup">{joke.joke}</div>)
            }
          </div>
        </section>
        {/* QUOTE */}
        <section className="trfn-section trfn-quote">
          <h2><span role="img" aria-label="sparkles emoji">✨</span> Daily Quote</h2>
          <div className="trfn-quote-card">
            {!quote
              ? (errors.quote ? <div className="trfn-err">{errors.quote}</div> : <div className="trfn-loading">Grabbing a brilliant quote…</div>)
              : (<>
                  <span className="trfn-quote-text">“{quote.content}”</span>
                  <div className="trfn-quote-author">— {quote.author}</div>
                </>)
            }
          </div>
        </section>
        {/* VISUAL BREAK */}
        <section className="trfn-section trfn-photo">
          <h2><span role="img" aria-label="camera emoji">📸</span> Surprise Visual</h2>
          <div className="trfn-photo-area">
            {randomPhoto
              ? <img src={randomPhoto} alt="Random visual break" className="trfn-photo-img" loading="lazy" />
              : <div className="trfn-loading">Loading visual fun…</div>
            }
          </div>
        </section>
      </div>
    </main>
  );
}

export default TrendingFunNow;
