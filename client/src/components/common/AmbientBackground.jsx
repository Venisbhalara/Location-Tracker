import React, { memo } from "react";

/**
 * Reusable ambient background layer.
 * Provides subtle spatial depth with clean grid texture and restrained,
 * non-distracting atmospheric lighting so content and typography maintain primary contrast.
 */
const AmbientBackground = memo(() => {
  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden select-none -z-10"
      aria-hidden="true"
    >
      {/* Subtle fine grid texture */}
      <div className="absolute inset-0 bg-ambient-pattern opacity-80" />

      {/* Gentle top focal radial glow */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] rounded-full opacity-25 blur-[120px]"
        style={{
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, rgba(139, 92, 246, 0.15) 50%, transparent 80%)",
        }}
      />

      {/* Subtle secondary ambient fill in bottom right */}
      <div
        className="absolute -bottom-40 right-[10%] w-[550px] h-[400px] rounded-full opacity-15 blur-[130px]"
        style={{
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, transparent 70%)",
        }}
      />
    </div>
  );
});

AmbientBackground.displayName = "AmbientBackground";

export default AmbientBackground;
