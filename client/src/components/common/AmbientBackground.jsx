import React, { memo } from "react";

/**
 * Reusable light ambient background layer.
 * Uses z-0 (paired with z-10 on MainLayout) so it is never hidden behind body background.
 */
const AmbientBackground = memo(() => {
  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden select-none z-0 bg-[#fcfaf6]"
      aria-hidden="true"
    >
      {/* Very gentle warm ivory-amber diffused glow in upper header zone */}
      <div
        className="absolute -top-28 left-1/2 -translate-x-1/2 w-[760px] h-[380px] rounded-full opacity-55 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(245, 238, 225, 0.85) 0%, rgba(238, 230, 214, 0.28) 50%, transparent 75%)",
        }}
      />

      {/* Subtle soft slate-indigo aura in lower area */}
      <div
        className="absolute -bottom-28 right-[6%] w-[560px] h-[340px] rounded-full opacity-40 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(232, 234, 246, 0.75) 0%, rgba(232, 234, 246, 0.18) 50%, transparent 75%)",
        }}
      />
    </div>
  );
});

AmbientBackground.displayName = "AmbientBackground";

export default AmbientBackground;

