import { useNavigate } from "react-router-dom";

const BackButton = ({ to = "/admin", label = "Back to Dashboard" }) => {
  const navigate = useNavigate();

  return (
    <button 
      onClick={() => navigate(to)} 
      className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group w-fit"
    >
      <svg 
        className="w-5 h-5 group-hover:-translate-x-1 transition-transform" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      <span className="font-medium">{label}</span>
    </button>
  );
};

export default BackButton;
