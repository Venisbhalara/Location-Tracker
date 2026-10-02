import { useState, useEffect } from "react";

// Symmetrically balanced 5-6 letter words to guarantee absolute layout stability
const WORDS = [
  {
    text: "Phone",
    gradient: "from-indigo-300 via-sky-300 to-indigo-400",
    glow: "rgba(99, 102, 241, 0.35)",
  },
  {
    text: "Family",
    gradient: "from-purple-300 via-pink-300 to-indigo-300",
    glow: "rgba(168, 85, 247, 0.35)",
  },
  {
    text: "Friend",
    gradient: "from-cyan-300 via-teal-200 to-indigo-300",
    glow: "rgba(45, 212, 191, 0.35)",
  },
  {
    text: "Worker",
    gradient: "from-amber-300 via-orange-300 to-rose-300",
    glow: "rgba(251, 146, 60, 0.35)",
  },
  {
    text: "Driver",
    gradient: "from-blue-300 via-indigo-200 to-cyan-300",
    glow: "rgba(59, 130, 246, 0.35)",
  },
  {
    text: "Device",
    gradient: "from-emerald-300 via-cyan-300 to-indigo-300",
    glow: "rgba(16, 185, 129, 0.35)",
  },
];

/**
 * MorphingHeadline Component
 * 
 * Sized with refined proportions (not overwhelmingly large),
 * with 100% zero-layout-shift vertical stability.
 */
export default function MorphingHeadline() {
  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      // Trigger slide out
      setIsAnimating(true);

      // Switch word and slide in
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % WORDS.length);
        setIsAnimating(false);
      }, 250);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const currentWord = WORDS[index];

  return (
    <h1
      className="max-w-4xl mx-auto mb-6 text-center select-none font-display"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Track Any Phone's Live GPS. Just Send a Link. No App Needed."
    >
      {/* Primary Headline: Fixed height line ensuring ZERO vertical jump */}
      <div className="flex items-center justify-center whitespace-nowrap text-[22px] xs:text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-bold text-white tracking-tight leading-normal">
        <span className="shrink-0 text-white">Track Any</span>

        {/* Stable Morph Slot: Fixed height & width container prevents all jumping */}
        <span
          className="relative inline-flex items-center justify-center mx-1.5 sm:mx-2 px-2.5 sm:px-3 rounded-lg border border-white/[0.12] bg-white/[0.04] backdrop-blur-md shadow-sm h-[1.32em] min-w-[4.6ch] overflow-hidden align-middle transition-colors duration-500"
          style={{
            boxShadow: `0 0 20px -3px ${currentWord.glow}, inset 0 1px 0 rgba(255, 255, 255, 0.08)`,
          }}
        >
          {/* Subtle colored aura backlight */}
          <span
            className="absolute inset-0 opacity-20 blur-sm transition-colors duration-500 pointer-events-none"
            style={{ backgroundColor: currentWord.glow }}
          />

          {/* Morphing Word */}
          <span
            key={currentWord.text}
            className={`relative z-10 text-transparent bg-clip-text bg-gradient-to-r ${currentWord.gradient} font-bold whitespace-nowrap ${
              isAnimating ? "word-morph-out" : "word-morph-in"
            }`}
          >
            {currentWord.text}
          </span>
        </span>

        <span className="shrink-0 text-white">'s Live GPS.</span>
      </div>

      {/* Sub-tagline: Tasteful proportional size with elegant light shimmer */}
      <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-purple-200 to-cyan-200 mt-2 sm:mt-2.5 animate-text-shimmer tracking-normal">
        Just Send a Link. No App Needed.
      </div>
    </h1>
  );
}
