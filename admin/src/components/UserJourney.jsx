import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const useCounter = (end, duration = 1000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const easeOut = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(easeOut * end));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration]);
  return count;
};

const NumberAnimated = ({ value, color = "#1c1b18" }) => {
  const n = useCounter(value);
  return (
    <div
      className="text-3xl sm:text-4xl font-serif font-normal leading-none"
      style={{ color }}
    >
      {n}
    </div>
  );
};

export const UserJourney = ({ journeyData }) => {
  if (!journeyData || journeyData.length === 0) return null;

  const first = journeyData[0].count;
  const last = journeyData[journeyData.length - 1].count;
  const conversionRate = first > 0 ? (last / first * 100).toFixed(1) : "0.0";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full flex flex-col bg-white border border-[#ded7ca] rounded-2xl p-6 sm:p-7 shadow-sm"
    >
      <div className="mb-6">
        <div className="text-base font-serif font-normal text-[#1c1b18]">User Journey Funnel</div>
        <div className="text-xs text-[#6e685f] mt-0.5">Progression through acquisition, handshakes, and retention</div>
      </div>

      <div className="flex flex-col sm:flex-row w-full gap-y-6 sm:gap-y-0">
        {journeyData.map((item, index) => {
          const isLast = index === journeyData.length - 1;
          const isFirst = index === 0;
          return (
            <div
              key={item.step}
              className={`flex-1 flex flex-col ${
                !isLast ? "border-b sm:border-b-0 sm:border-r pb-4 sm:pb-0" : ""
              } border-[#f0eae1]`}
              style={{
                paddingLeft: isFirst ? "0" : "20px",
                paddingRight: isLast ? "0" : "20px",
              }}
            >
              <NumberAnimated value={item.count} color="#1c1b18" />
              <div className="text-xs font-medium text-[#6e685f] mt-2">
                {item.step}
              </div>
              <div
                className={`text-[11px] font-mono mt-1 font-semibold ${
                  item.drop ? "text-[#c84032]" : "text-[#2d7a4f]"
                }`}
              >
                {item.drop ? item.drop : item.status}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-[#ded7ca] pt-4 mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-y-2 sm:gap-y-0">
        <div className="text-xs text-[#6e685f]">End-to-End Retention Rate · First Visited → Retained Active</div>
        <div className="text-sm font-semibold font-mono text-[#1c1b18] bg-[#f0eae1] px-3 py-1 rounded-full border border-[#ded7ca]">
          {conversionRate}% Conversion
        </div>
      </div>
    </motion.div>
  );
};
