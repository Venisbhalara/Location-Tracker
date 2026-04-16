import { useState, useEffect, useCallback } from 'react';

/**
 * useGeolocation — captures GPS coordinates using the browser Geolocation API.
 * Requires explicit user consent. Supports watch mode for continuous updates.
 */
const useGeolocation = (options = {}) => {
  const {
    enableHighAccuracy = true,
    timeout = 15000,
    maximumAge = 0,
    watchMode = false,   // true = continuously watch, false = one-time fetch
  } = options;

  const [state, setState] = useState({
    loading: false,
    error: null,
    latitude: null,
    longitude: null,
    accuracy: null,
    altitude: null,
    timestamp: null,
    permissionStatus: 'idle', // idle | requesting | granted | denied | unavailable
  });

  const [watchId, setWatchId] = useState(null);

  // ── Check if Geolocation is supported ──────────────────────
  const isSupported = 'geolocation' in navigator;

  // ── Success handler ─────────────────────────────────────────
  const onSuccess = useCallback((position) => {
    setState((prev) => ({
      ...prev,
      loading: false,
      error: null,
      permissionStatus: 'granted',
      latitude:  position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy:  position.coords.accuracy,
      altitude:  position.coords.altitude,
      timestamp: position.timestamp,
    }));
  }, []);

  // ── Error handler ───────────────────────────────────────────
  const onError = useCallback((err) => {
    let message = 'Unable to retrieve location.';
    let status  = 'denied';

    switch (err.code) {
      case err.PERMISSION_DENIED:
        message = 'Location permission was denied. Please allow access in your browser settings.';
        status  = 'denied';
        break;
      case err.POSITION_UNAVAILABLE:
        message = 'Location information is unavailable. Check your GPS or network.';
        status  = 'unavailable';
        break;
      case err.TIMEOUT:
        message = 'Location request timed out. Please try again.';
        status  = 'unavailable';
        break;
      default:
        message = 'An unknown error occurred while retrieving location.';
    }

    setState((prev) => ({
      ...prev,
      loading: false,
      error: message,
      permissionStatus: status,
    }));
  }, []);

  // ── Geolocation options object ──────────────────────────────
  const geoOptions = { enableHighAccuracy, timeout, maximumAge };

  // ── Request location (one-time) ─────────────────────────────
  const getLocation = useCallback(() => {
    if (!isSupported) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser.',
        permissionStatus: 'unavailable',
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null, permissionStatus: 'requesting' }));
    navigator.geolocation.getCurrentPosition(onSuccess, onError, geoOptions);
  }, [isSupported, onSuccess, onError]);

  // ── Start watching location (continuous) ────────────────────
  const startWatch = useCallback(() => {
    if (!isSupported) return;
    if (watchId) return; // already watching

    setState((prev) => ({ ...prev, loading: true, error: null, permissionStatus: 'requesting' }));
    const id = navigator.geolocation.watchPosition(onSuccess, onError, geoOptions);
    setWatchId(id);
  }, [isSupported, watchId, onSuccess, onError]);

  // ── Stop watching location ──────────────────────────────────
  const stopWatch = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [watchId]);

  // ── Auto-start watch mode if enabled ───────────────────────
  useEffect(() => {
    if (watchMode) {
      startWatch();
    }
    return () => {
      if (watchMode) stopWatch();
    };
  }, [watchMode]);

  return {
    ...state,
    isSupported,
    getLocation,
    startWatch,
    stopWatch,
    isWatching: watchId !== null,
  };
};

export default useGeolocation;
