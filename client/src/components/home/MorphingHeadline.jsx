import { useState, useEffect, useRef, memo } from "react";

// Symmetrically balanced 5-6 letter words with calm, refined deep-contrast palettes
const WORDS = [
  {
    text: "Phone",
    color: "text-indigo-700",
    bg: "bg-indigo-50/70 border-indigo-200",
  },
  {
    text: "Family",
    color: "text-purple-700",
    bg: "bg-purple-50/70 border-purple-200",
  },
  {
    text: "Friend",
    color: "text-teal-700",
    bg: "bg-teal-50/70 border-teal-200",
  },
  {
    text: "Worker",
    color: "text-amber-800",
    bg: "bg-amber-50/70 border-amber-200",
  },
  {
    text: "Driver",
    color: "text-blue-700",
    bg: "bg-blue-50/70 border-blue-200",
  },
  {
    text: "Device",
    color: "text-emerald-700",
    bg: "bg-emerald-50/70 border-emerald-200",
  },
];

/**
 * MorphingHeadline Component — Light Luxury Edition
 * Balanced proportions with zero-layout-shift stability.
 */
function MorphingHeadline() {
  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef(null);
  const headlineRef = useRef(null);

  useEffect(() => {
    let interval = null;
    let isVisible = !document.hidden;
    let isInView = true;

    const start = () => {
      if (interval || isPaused || !isVisible || !isInView) return;
      interval = setInterval(() => {
        setIsAnimating(true);
        timeoutRef.current = setTimeout(() => {
          setIndex((prev) => (prev + 1) % WORDS.length);
          setIsAnimating(false);
        }, 200);
      }, 3200);
    };

    const stop = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    const handleVisibility = () => {
      isVisible = !document.hidden;
      if (isVisible && isInView && !isPaused) start();
      else stop();
    };

    document.addEventListener("visibilitychange", handleVisibility);

    let observer = null;
    if (typeof IntersectionObserver !== "undefined" && headlineRef.current) {
      observer = new IntersectionObserver(([entry]) => {
        isInView = entry.isIntersecting;
        if (isInView && isVisible && !isPaused) start();
        else stop();
      });
      observer.observe(headlineRef.current);
    } else {
      start();
    }

    if (!isPaused && isVisible && isInView) start();

    return () => {
      stop();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (observer) observer.disconnect();
    };
  }, [isPaused]);

  const currentWord = WORDS[index];

  return (
    <h1
      ref={headlineRef}
      className="max-w-4xl mx-auto mb-6 text-center select-none font-display"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Track Any Phone's Live GPS. Just Send a Link. No App Needed."
    >
      {/* Primary Headline: Fixed height line ensuring ZERO vertical jump */}
      <div className="flex items-center justify-center whitespace-nowrap text-[24px] xs:text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-bold text-stone-900 tracking-tight leading-normal">
        <span className="shrink-0 text-stone-900">Track Any</span>

        {/* Stable Morph Slot */}
        <span
          className={`relative inline-flex items-center justify-center mx-1.5 sm:mx-2 px-3 rounded-lg border shadow-xs h-[1.32em] min-w-[4.6ch] overflow-hidden align-middle transition-colors duration-300 ${currentWord.bg}`}
        >
          {/* Morphing Word */}
          <span
            key={currentWord.text}
            className={`relative z-10 font-bold whitespace-nowrap ${currentWord.color} ${
              isAnimating ? "word-morph-out" : "word-morph-in"
            }`}
          >
            {currentWord.text}
          </span>
        </span>

        <span className="shrink-0 text-stone-900">'s Live GPS.</span>
      </div>

      {/* Sub-tagline */}
      <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-stone-600 mt-2 sm:mt-3 tracking-normal">
        Just Send a Link. No App Needed.
      </div>
    </h1>
  );
}

export default memo(MorphingHeadline);
