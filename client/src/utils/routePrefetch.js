/**
 * Route Prefetching and Warming Utility
 *
 * Implements intent-based (hover/focus/touch) route preloading and idle-time
 * warming to eliminate navigation latency and prevent Suspense layout flashing.
 */

const staticRouteLoaders = {
  "/": () => import("../pages/public/Home"),
  "/pricing": () => import("../pages/public/Pricing"),
  "/about": () => import("../pages/public/About"),
  "/blog": () => import("../pages/public/Blog"),
  "/contact": () => import("../pages/public/Contact"),
  "/login": () => import("../pages/auth/Login"),
  "/register": () => import("../pages/auth/Register"),
  "/privacy-policy": () => import("../pages/legal/PrivacyPolicy"),
  "/terms": () => import("../pages/legal/Terms"),
  "/dashboard": () => import("../pages/user/Dashboard"),
  "/profile": () => import("../pages/user/Profile"),
  "/tracking/create": () => import("../pages/tracking/CreateTracking"),
  "/groups": () => import("../pages/tracking/GroupDashboard"),
};

const dynamicLoaders = [
  { match: (p) => p.startsWith("/blog/"), loader: () => import("../pages/public/BlogArticle") },
  { match: (p) => p.startsWith("/tracking/map/"), loader: () => import("../pages/tracking/LiveMap") },
  { match: (p) => p.startsWith("/groups/") && p.endsWith("/map"), loader: () => import("../pages/tracking/GroupMap") },
  { match: (p) => p.startsWith("/groups/") && !p.endsWith("/map"), loader: () => import("../pages/tracking/GroupDetail") },
];

const prefetchedRoutes = new Set();

/**
 * Preload a route component chunk on user interaction intent.
 * Safe and idempotent.
 *
 * @param {string} path - Target path e.g. "/pricing", "/blog/how-gps-works"
 */
export function preloadRoute(path) {
  if (!path || typeof path !== "string") return;

  const cleanPath = path.split("?")[0].split("#")[0];
  if (prefetchedRoutes.has(cleanPath)) return;

  let loader = staticRouteLoaders[cleanPath];
  if (!loader) {
    const matchedDynamic = dynamicLoaders.find((d) => d.match(cleanPath));
    if (matchedDynamic) {
      loader = matchedDynamic.loader;
    }
  }

  if (loader) {
    prefetchedRoutes.add(cleanPath);
    loader().catch(() => {
      // Allow retry if network dropped
      prefetchedRoutes.delete(cleanPath);
    });
  }
}

/**
 * Background idle-time warming for key public routes
 *
 * @param {string[]} paths - Array of route paths to warm up
 */
export function scheduleIdlePrefetch(paths = ["/pricing", "/about", "/login"]) {
  if (typeof window === "undefined") return;

  const warm = () => {
    paths.forEach((p) => {
      preloadRoute(p);
    });
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(warm, { timeout: 3500 });
  } else {
    setTimeout(warm, 1800);
  }
}
