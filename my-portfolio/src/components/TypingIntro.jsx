import { useState, useEffect, useRef } from "react";
import "./TypingIntro.css";

// Ambil plain text dari HTML rich-text bio (buang semua tag)
function stripHtml(html) {
  if (!html) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || "").replace(/\s+/g, " ").trim();
}

// Susun teks kode dari data profile
function buildCodeText(profile) {
  const role = profile?.current_role || "Software Engineer";
  const focus = profile?.focus || "Web & Mobile Development";
  const bioPlain = stripHtml(profile?.bio);
  const bioShort = bioPlain.length > 200 ? bioPlain.slice(0, 200).trim() + "..." : bioPlain;

  return `const developer = {
  role: "${role}",
  focus: "${focus}",
  about: "${bioShort || "Building thoughtful digital experiences."}"
};`;
}

const TYPE_SPEED_MS = 16;

function TypingIntro({ profile }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isDone, setIsDone] = useState(false);
  const indexRef = useRef(0);

  const fullText = buildCodeText(profile);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayedText("");
    setIsDone(false);

    const interval = setInterval(() => {
      indexRef.current += 1;
      setDisplayedText(fullText.slice(0, indexRef.current));
      if (indexRef.current >= fullText.length) {
        clearInterval(interval);
        setIsDone(true);
      }
    }, TYPE_SPEED_MS);

    return () => clearInterval(interval);
  }, [fullText]);

  return (
    <div className="typing-code-box">
      <div className="typing-code-header">
        <span className="typing-dot red" />
        <span className="typing-dot yellow" />
        <span className="typing-dot green" />
        <span className="typing-filename">AboutMe.js</span>
      </div>
      <pre className="typing-code-body">
        <code>
          {displayedText}
          <span className={`typing-cursor ${isDone ? "blink" : ""}`}>▍</span>
        </code>
      </pre>
    </div>
  );
}

export default TypingIntro;