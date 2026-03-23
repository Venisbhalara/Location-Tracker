import { updateLocation } from "./api";
import io from "socket.io-client";

// In development with Vite, we want the socket to go through the same host + port as the UI
// so that Vite's proxy (defined in vite.config.js) can route it to the backend.
// This works perfectly with tunnels like ngrok.
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:3000");

// Auto-refresh interval: 10 minutes (in milliseconds)
const AUTO_REFRESH_INTERVAL_MS = 1000; // every second

/**
 * LocationTrackingService
 * Handles continuous location capture and sending coordinates
 * to the backend (via REST + Socket.IO) for the target user.
 *
 * Features:
 *  - watchPosition for real-time movement tracking
 *  - 10-minute interval to force a fresh fix even when stationary
 *  - Emits 'register-sharer' so the server knows who is sharing
 *  - Stops automatically when server emits 'tracking-stopped'
 */
class LocationTrackingService {
  constructor() {
    this.watchId = null;
    this.intervalId = null;
    this.socket = null;
    this.token = null;
    this.onPosition = null;
    this.onError = null;
    this.onStopped = null;
    this.lastSentAt = null;
    this.lastLatitude = null; // ← ADD THIS
    this.lastLongitude = null; // ← ADD THIS
  }

  // ── Start tracking: request permission → send coords ─────────
  start({ token, onPosition, onError, onPermissionDenied, onStopped }) {
    this.token = token;
    this.onPosition = onPosition;
    this.onError = onError;
    this.onStopped = onStopped;

    if (!("geolocation" in navigator)) {
      onError?.("Geolocation is not supported by your browser.");
      return;
    }

    // Connect to Socket.IO and register as the sharer for this token
    this.socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    this.socket.emit("join-tracking", token);
    this.socket.emit("register-sharer", token);

    // Listen for the viewer deleting the connection
    this.socket.on("tracking-stopped", () => {
      this.stop();
      this.onStopped?.();
    });

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 5000, // reduced from 15000 — faster per-second response
      maximumAge: 0, // never use cached position
    };

    // watchPosition still runs — catches immediate movement
    this.watchId = navigator.geolocation.watchPosition(
      (position) => this._handlePosition(position),
      (err) => this._handleError(err, onPermissionDenied),
      geoOptions,
    );

    // 1-second interval — forces a fresh GPS fix every second
    // even when the user is completely stationary
    this.intervalId = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => this._handlePosition(position),
        (err) => {
          // Don't surface timeout errors to user — just log them
          // Timeouts happen normally when GPS signal is briefly lost
          if (err.code !== err.TIMEOUT) {
            this._handleError(err, onPermissionDenied);
          }
        },
        geoOptions,
      );
    }, 1000); // ← 1000ms = every second
  }

  // ── Handle a new position fix ─────────────────────────────────
  async _handlePosition(position) {
    const { latitude, longitude, accuracy } = position.coords;
    const timestamp = new Date();

    // ── Deduplication check ──────────────────────────────────────
    // If coordinates haven't changed at all, only emit via socket
    // but skip the REST call to avoid hammering the database
    const sameAsBefore =
      this.lastLatitude === latitude && this.lastLongitude === longitude;

    this.lastLatitude = latitude;
    this.lastLongitude = longitude;

    // Always notify the UI so the timestamp stays fresh
    this.onPosition?.({ latitude, longitude, accuracy, timestamp });
    this.lastSentAt = timestamp;

    // Only write to DB if position actually changed
    if (!sameAsBefore) {
      try {
        await updateLocation({
          token: this.token,
          latitude,
          longitude,
          accuracy,
        });
      } catch (err) {
        console.warn("REST update failed, socket still active:", err.message);
      }
    }

    // Always emit via socket — viewer sees live "heartbeat" every second
    if (this.socket?.connected) {
      this.socket.emit("send-location", {
        token: this.token,
        latitude,
        longitude,
        accuracy,
        timestamp: timestamp.toISOString(),
      });
    }
  }
  // ── Handle geolocation error ──────────────────────────────────
  _handleError(err, onPermissionDenied) {
    if (err.code === err.PERMISSION_DENIED) {
      this.stop();
      onPermissionDenied?.();
      this.onError?.("Location permission was denied.");
    } else if (err.code === err.POSITION_UNAVAILABLE) {
      this.stop();
      this.onError?.("Location information is unavailable.");
    } else if (err.code === err.TIMEOUT) {
      this.onError?.("Location request timed out.");
    } else {
      this.stop();
      this.onError?.("Unknown error while getting location.");
    }
  }

  // ── Stop tracking and clean up ────────────────────────────────
  stop() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // ── Returns seconds until next auto-refresh ───────────────────
  getSecondsUntilNextRefresh() {
    if (!this.lastSentAt || !this.intervalId)
      return AUTO_REFRESH_INTERVAL_MS / 1000;
    const elapsed = (Date.now() - this.lastSentAt.getTime()) / 1000;
    return Math.max(0, AUTO_REFRESH_INTERVAL_MS / 1000 - elapsed);
  }
}

export default new LocationTrackingService();
