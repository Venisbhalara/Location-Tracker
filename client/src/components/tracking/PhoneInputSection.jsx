import { useState, useEffect, useRef, useMemo, memo } from "react";
import { 
  getCountries, 
  getCountryCallingCode, 
  AsYouType, 
  isValidPhoneNumber,
  getExampleNumber
} from "libphonenumber-js/min";
import examples from "libphonenumber-js/mobile/examples";

/**
 * PhoneInputSection Component — Light Luxury Edition
 */
const PhoneInputSection = ({ onChange }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("IN");
  const [dialCode, setDialCode] = useState("91");
  const [isDetected, setIsDetected] = useState(false);
  const [isValid, setIsValid] = useState(false);
  
  const [label, setLabel] = useState("");
  const MAX_LABEL_LENGTH = 30;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  const getFlagEmoji = (code) => {
    if (!code) return "🌐";
    return code
      .toUpperCase()
      .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt()));
  };

  const getCountryName = (code) => {
    try {
      return new Intl.DisplayNames(["en"], { type: "region" }).of(code);
    } catch {
      return code;
    }
  };

  const countries = useMemo(() => {
    return getCountries().map((code) => ({
      code,
      name: getCountryName(code),
      dialCode: getCountryCallingCode(code),
      flag: getFlagEmoji(code),
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const filteredCountries = useMemo(() => {
    if (!isDropdownOpen) return [];
    const q = searchQuery.toLowerCase().trim();
    if (!q) return countries;
    return countries.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.dialCode.includes(q) ||
      c.code.toLowerCase().includes(q)
    );
  }, [countries, searchQuery, isDropdownOpen]);
  
  const placeholder = useMemo(() => {
    try {
      const example = getExampleNumber(countryCode, examples);
      return example ? example.formatNational() : "Enter phone number";
    } catch {
      return "Enter phone number";
    }
  }, [countryCode]);

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
      } catch {
        setCountryCode("IN");
        setDialCode("91");
      }
    };
    detectCountry();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePhoneChange = (e) => {
    const rawInput = e.target.value;
    const formatter = new AsYouType(countryCode);
    const formatted = formatter.input(rawInput);
    setPhoneNumber(formatted);

    const valid = isValidPhoneNumber(formatted, countryCode);
    setIsValid(valid);

    let fullInternationalNumber = "";
    if (valid) {
      try {
        fullInternationalNumber = `+${dialCode}${formatted.replace(/\D/g, "")}`;
      } catch {
        fullInternationalNumber = "";
      }
    }

    if (onChange) {
      onChange({
        phoneNumber: fullInternationalNumber,
        countryCode,
        label,
        isValid: valid,
      });
    }
  };

  const handleLabelChange = (e) => {
    const val = e.target.value.slice(0, MAX_LABEL_LENGTH);
    setLabel(val);

    let fullInternationalNumber = "";
    if (isValid) {
      fullInternationalNumber = `+${dialCode}${phoneNumber.replace(/\D/g, "")}`;
    }

    if (onChange) {
      onChange({
        phoneNumber: fullInternationalNumber,
        countryCode,
        label: val,
        isValid,
      });
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Phone Number Input Group */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-stone-700 flex items-center justify-between">
          <span>Target Phone Number *</span>
          {phoneNumber && (
            <span className={`text-[10px] font-medium flex items-center gap-1 ${isValid ? "text-emerald-700" : "text-rose-600"}`}>
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
              className="h-full px-3 flex items-center gap-1.5 border-r border-stone-200 hover:bg-stone-50 transition-colors rounded-l-xl text-stone-800 outline-none"
            >
              <span className="text-lg">{getFlagEmoji(countryCode)}</span>
              <span className="text-xs font-semibold text-stone-700">+{dialCode}</span>
              <svg 
                className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} 
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div 
                className="absolute top-full left-0 mt-2 w-72 max-h-80 rounded-xl flex flex-col z-50 bg-white border border-stone-200 shadow-xl"
                onWheel={(e) => e.stopPropagation()}
              >
                <div className="p-2.5 border-b border-stone-100">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">🔍</span>
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search country..."
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-indigo-500 transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") setIsDropdownOpen(false);
                      }}
                    />
                  </div>
                </div>
                <div 
                  data-lenis-prevent
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
                          const formatter = new AsYouType(c.code);
                          const reformatted = formatter.input(phoneNumber);
                          setPhoneNumber(reformatted);
                          const valid = isValidPhoneNumber(reformatted, c.code);
                          setIsValid(valid);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2 hover:bg-stone-50 transition-all text-left text-xs ${countryCode === c.code ? "bg-indigo-50 text-indigo-900 font-semibold" : "text-stone-700"}`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="text-base shrink-0">{c.flag}</span>
                          <span className="truncate">{c.name}</span>
                        </div>
                        <span className="text-xs font-mono text-stone-400 shrink-0 ml-2">+{c.dialCode}</span>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-stone-400 text-xs">No countries found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Phone Input */}
          <input
            type="tel"
            className={`input pl-26 pr-4 py-2.5 w-full text-sm ${
              phoneNumber && !isValid ? "border-rose-400 focus:border-rose-500" : ""
            } ${phoneNumber && isValid ? "border-emerald-400 focus:border-emerald-500" : ""}`}
            placeholder={placeholder}
            value={phoneNumber}
            onChange={handlePhoneChange}
          />
        </div>

        {/* Helpers */}
        <div className="flex flex-col gap-0.5">
          {phoneNumber && !isValid && (
            <p className="text-xs text-rose-600">
              Enter a valid {dialCode === "91" ? "10-digit" : ""} mobile number for {getCountryName(countryCode)}
            </p>
          )}
          {isDetected && (
            <p className="text-[10px] text-stone-500 font-medium flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
              Detected automatically based on your network location
            </p>
          )}
        </div>
      </div>

      {/* Label / Nickname Field */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-stone-700 block">
          Label / Recipient Name <span className="text-stone-400 font-normal">(Optional)</span>
        </label>
        <div className="relative">
          <input
            type="text"
            className="input pr-16 py-2.5 text-sm"
            placeholder="e.g. Courier #04, Alex commute"
            value={label}
            onChange={handleLabelChange}
          />
          <span className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono ${label.length >= MAX_LABEL_LENGTH ? "text-amber-600" : "text-stone-400"}`}>
            {label.length}/{MAX_LABEL_LENGTH}
          </span>
        </div>
      </div>
    </div>
  );
};

export default memo(PhoneInputSection);
