import { useNavigate } from "react-router-dom";

const BackButton = ({ to = "/admin", label = "Back to Control Center" }) => {
  const navigate = useNavigate();

  return (
    <button 
      onClick={() => navigate(to)} 
      className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors mb-6 group w-fit text-xs sm:text-sm font-semibold bg-white border border-[#ded7ca] px-3.5 py-1.5 rounded-xl shadow-xs hover:bg-[#f7f4ed]"
    >
      <svg 
        className="w-4 h-4 group-hover:-translate-x-1 transition-transform" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      <span>{label}</span>
    </button>
  );
};

export default BackButton;
