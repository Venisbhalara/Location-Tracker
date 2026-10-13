const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#fcfaf6]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-3 border-stone-300 border-t-stone-800 rounded-full animate-spin" />
      <p className="text-stone-600 text-xs font-medium tracking-wider uppercase animate-pulse">Loading NexTrack...</p>
    </div>
  </div>
);

export default LoadingScreen;
