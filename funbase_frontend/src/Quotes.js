import React from "react";

/**
 * PUBLIC_INTERFACE
 * Quotes page for FunBase – featuring motivational and funny quotes.
 * This will become the component shown when navigating to /quotes via the navigation bar.
 */
function Quotes() {
  const QUOTES = [
    { text: "Laughter is timeless, imagination has no age.", author: "Walt Disney" },
    { text: "Why be moody when you can shake your booty!", author: "Unknown" },
    { text: "Play is the highest form of research.", author: "Albert Einstein" },
    { text: "The best way to cheer yourself up is to try to cheer somebody else up.", author: "Mark Twain" },
    { text: "Do what makes your soul shine!", author: "Unknown" }
  ];

  return (
    <main className="funbase-quotes-page" style={{ minHeight: "90vh", padding: "2.1em 0.4em" }}>
      <h1 style={{
        fontSize: "2.5em",
        fontWeight: "900",
        color: "#ee45ba",
        marginBottom: "1.2em",
        textAlign: "center"
      }}>
        💬 Inspiring Quotes
      </h1>
      <div style={{
        maxWidth: 680,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "1.4em"
      }}>
        {QUOTES.map((q, i) => (
          <blockquote key={q.text} style={{
            background: "linear-gradient(92deg, #fff2fd 60%, #fffbcf 110%)",
            borderLeft: "6px solid #ee45ba",
            borderRadius: "1.1em",
            padding: "1.23em 1.7em 1em 1.6em",
            margin: 0,
            boxShadow: "0 2px 14px #ffeaff24",
            fontSize: "1.22em",
            position: "relative",
            color: "#3a1654",
            fontStyle: "italic"
          }}>
            “{q.text}”
            <footer style={{
              fontStyle: "normal",
              fontWeight: "bold",
              opacity: 0.82,
              marginTop: "0.7em",
              color: "#ae3af6",
              textAlign: "right"
            }}>
              — {q.author}
            </footer>
          </blockquote>
        ))}
      </div>
    </main>
  );
}

export default Quotes;
