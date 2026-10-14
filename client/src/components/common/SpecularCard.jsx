import { useRef, useCallback, useEffect, memo } from "react";

/**
 * SpecularCard Component
 * Tactile luxury glass card with cursor-tracked radial specular lighting and subtle
 * 3D perspective micro-tilt (clamped to 1.4° max for editorial restraint).
 */
const SpecularCard = memo(
  ({
    children,
    className = "",
    enableTilt = true,
    maxTilt = 1.4,
    as: Component = "div",
    ...rest
  }) => {
    const cardRef = useRef(null);
    const rafRef = useRef(null);
    const rectRef = useRef(null);

    const handleMouseEnter = useCallback(() => {
      if (cardRef.current) {
        rectRef.current = cardRef.current.getBoundingClientRect();
      }
    }, []);

    const handleMouseMove = useCallback(
      (e) => {
        const el = cardRef.current;
        if (!el) return;

        if (!rectRef.current) {
          rectRef.current = el.getBoundingClientRect();
        }

        const rect = rectRef.current;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          el.style.setProperty("--mouse-x", `${x.toFixed(0)}px`);
          el.style.setProperty("--mouse-y", `${y.toFixed(0)}px`);

          if (enableTilt && rect.width > 0 && rect.height > 0) {
            const nx = (x / rect.width) * 2 - 1;
            const ny = (y / rect.height) * 2 - 1;
            const rotateX = (-ny * maxTilt).toFixed(2);
            const rotateY = (nx * maxTilt).toFixed(2);
            el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(0, -2px, 0)`;
          }
        });
      },
      [enableTilt, maxTilt]
    );

    const handleMouseLeave = useCallback(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rectRef.current = null;
      const el = cardRef.current;
      if (!el) return;
      el.style.transform = "";
    }, []);

    useEffect(() => {
      const handleScroll = () => {
        rectRef.current = null;
      };
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", handleScroll);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }, []);

    return (
      <Component
        ref={cardRef}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`specular-card transition-[transform,border-color,box-shadow] duration-300 ease-out ${className}`}
        {...rest}
      >
        <div className="relative z-10 h-full flex flex-col justify-between">
          {children}
        </div>
      </Component>
    );
  }
);

SpecularCard.displayName = "SpecularCard";

export default SpecularCard;
