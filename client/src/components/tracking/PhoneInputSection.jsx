import { useState, useEffect, useRef, useMemo } from "react";
import { 
  getCountries, 
  getCountryCallingCode, 
  AsYouType, 
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  getExampleNumber
} from "libphonenumber-js";
import examples from "libphonenumber-js/mobile/examples";

/**
 * PhoneInputSection Component
 * 
 * Features:
 * 1. Auto Country Code Detection via ipapi.co
 * 2. Real-Time Phone Number Validation & Formatting via libphonenumber-js
 * 3. Searchable Country Dropdown with Flags
 * 4. Optional Label/Nickname Field with Character Counter
 * 5. Dark Theme (Tailwind CSS)
 * 
 * @param {Object} props
 * @param {Function} props.onChange - Callback returns { phoneNumber, countryCode, label, isValid }
 */
const PhoneInputSection = ({ onChange }) => {
  // State for Phone Number & Country
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("IN");
  const [dialCode, setDialCode] = useState("91");
  const [isDetected, setIsDetected] = useState(false);
  const [isValid, setIsValid] = useState(false);
  
  // State for Label
  const [label, setLabel] = useState("");
  const MAX_LABEL_LENGTH = 30;

  // State for Dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  // Helper: Get Flag Emoji from Country Code
  const getFlagEmoji = (code) => {
    if (!code) return "🌐";
    return code
      .toUpperCase()
      .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt()));
  };

  // Helper: Get Country Name
  const getCountryName = (code) => {
    try {
      return new Intl.DisplayNames(["en"], { type: "region" }).of(code);
    } catch (e) {
      return code;
    }
  };

  // Memoized Country List
  const countries = useMemo(() => {
    return getCountries().map((code) => ({
      code,
      name: getCountryName(code),
      dialCode: getCountryCallingCode(code),
      flag: getFlagEmoji(code),
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Filtered Countries for Search
  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.dialCode.includes(searchQuery) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Dynamic Placeholder
  const placeholder = useMemo(() => {
    try {
      const example = getExampleNumber(countryCode, examples);
      return example ? example.formatNational() : "Enter phone number";
    } catch (e) {
      return "Enter phone number";
    }
  }, [countryCode]);

  // 1. Auto Country Code Detection
  useEffect(() => {
    const detectCountry = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        if (data.country_code) {
          setCountryCode(data.country_code);
          setDialCode(getCountryCallingCode(data.country_code));
          setIsDetected(true);
        }
      } catch (error) {
        console.error("Error detecting country:", error);
        // Fallback to India as default if detection fails
        setCountryCode("IN");
        setDialCode("91");
      }
    };
    detectCountry();
  }, []);

  // 2. Real-Time Validation & Formatting
  const handlePhoneChange = (e) => {
    const input = e.target.value;
    // Allow only digits and some formatting characters
    const digits = input.replace(/\D/g, "");
    
    // Format the number as the user types
    const formatter = new AsYouType(countryCode);
    const formatted = formatter.input(input);
    setPhoneNumber(formatted);

    // Validate
    const valid = isValidPhoneNumber(formatted, countryCode);
    setIsValid(valid);
  };

  // 3. Handle Label Change
  const handleLabelChange = (e) => {
    const value = e.target.value.slice(0, MAX_LABEL_LENGTH);
    setLabel(value);
  };

  // Emit changes to parent
  useEffect(() => {
    // Get full international number for output
    const fullNumber = phoneNumber ? parsePhoneNumberFromString(phoneNumber, countryCode)?.formatInternational() : "";
    
    onChange?.({
      phoneNumber: fullNumber || phoneNumber,
      countryCode,
      label,
      isValid
    });
  }, [phoneNumber, countryCode, label, isValid, onChange]);

  // 4. Lock body scroll when dropdown is open
  useEffect(() => {
    if (isDropdownOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    }
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    };
  }, [isDropdownOpen]);

  // Handle outside click for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-6 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Phone Number Input Group */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300 flex items-center justify-between">
          <span>Phone Number *</span>
          {phoneNumber && (
            <span className={`text-xs transition-all duration-300 flex items-center gap-1 ${isValid ? "text-emerald-400" : "text-red-400"}`}>
              {isValid ? (
                <><span>✅</span> Valid Number</>
              ) : (
                <><span>❌</span> Invalid Format</>
              )}
            </span>
          )}
        </label>
        
        <div className="relative flex items-center">
          {/* Country Selector Dropdown */}
          <div className="absolute left-0 top-0 bottom-0 z-10" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="h-full px-3 flex items-center gap-2 border-r border-slate-700/50 hover:bg-slate-800/50 transition-colors rounded-l-xl text-white outline-none focus:bg-slate-800"
            >
              <span className="text-xl">{getFlagEmoji(countryCode)}</span>
              <span className="text-sm font-semibold opacity-80">+{dialCode}</span>
              <svg 
                className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} 
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div 
                className="absolute top-full left-0 mt-2 w-72 max-h-80 glass-panel rounded-xl flex flex-col z-50 animate-in fade-in zoom-in-95 duration-200"
                onWheel={(e) => e.stopPropagation()}
              >
                <div className="p-3 border-b border-slate-700/50">
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors">🔍</span>
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search country..."
                      className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") setIsDropdownOpen(false);
                      }}
                    />
                  </div>
                </div>
                <div 
                  className="overflow-y-auto flex-1 nice-scrollbar py-1"
                  style={{ overscrollBehavior: "contain" }}
                >
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setCountryCode(c.code);
                          setDialCode(c.dialCode);
                          setIsDropdownOpen(false);
                          setIsDetected(false);
                          setSearchQuery("");
                          // Re-format and re-validate current number with new country
                          const formatter = new AsYouType(c.code);
                          const reformatted = formatter.input(phoneNumber);
                          setPhoneNumber(reformatted);
                          
                          const valid = isValidPhoneNumber(reformatted, c.code);
                          setIsValid(valid);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 hover:bg-indigo-500/10 transition-all text-left group ${countryCode === c.code ? "bg-indigo-500/15" : ""}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl shrink-0">{c.flag}</span>
                          <span className={`text-sm transition-colors ${countryCode === c.code ? "text-indigo-400 font-medium" : "text-slate-300 group-hover:text-white"}`}>
                            {c.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-slate-500">+{c.dialCode}</span>
                          {countryCode === c.code && (
                            <span className="text-indigo-400 animate-in zoom-in duration-300">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-slate-500 text-sm">No countries found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Phone Input */}
          <input
            type="tel"
            className={`input pl-28 pr-4 py-4 w-full transition-all duration-300 ${
              phoneNumber && !isValid ? "border-red-500/50 focus:border-red-500 ring-red-500/10" : ""
            } ${phoneNumber && isValid ? "border-emerald-500/50 focus:border-emerald-500 ring-emerald-500/10" : ""}`}
            placeholder={placeholder}
            value={phoneNumber}
            onChange={handlePhoneChange}
          />
        </div>

        {/* Helpers */}
        <div className="flex flex-col gap-1">
          {phoneNumber && !isValid && (
            <p className="text-xs text-red-400 animate-in fade-in slide-in-from-top-1 duration-300">
              Enter a valid {dialCode === "91" ? "10-digit" : ""} mobile number for {getCountryName(countryCode)}
            </p>
          )}
          {isDetected && (
            <p className="text-[10px] text-indigo-400/70 font-medium flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-indigo-400"></span>
              Detected automatically based on your IP
            </p>
          )}
        </div>
      </div>

      {/* Label / Nickname Field */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-300">Label (Optional)</label>
          <div className="group relative">
            <span className="cursor-help text-slate-500 hover:text-slate-300 transition-colors text-xs">
              ⓘ
            </span>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 border border-slate-700 rounded-lg text-[10px] text-slate-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20 shadow-xl">
              This label helps you identify this tracking link in your dashboard
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800"></div>
            </div>
          </div>
        </div>
        <div className="relative">
          <input
            type="text"
            className="input pr-16"
            placeholder="e.g. Mom's phone, Work device"
            value={label}
            onChange={handleLabelChange}
          />
          <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono ${label.length >= MAX_LABEL_LENGTH ? "text-amber-400" : "text-slate-500"}`}>
            {label.length}/{MAX_LABEL_LENGTH}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PhoneInputSection;
