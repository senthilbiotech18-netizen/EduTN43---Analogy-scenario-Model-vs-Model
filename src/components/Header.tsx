import React, { useState, useEffect } from "react";
import { GraduationCap, Users, Sparkles, CheckCircle2, Monitor, Key } from "lucide-react";

interface HeaderProps {
  activeTab: "student" | "teacher" | "api";
  setActiveTab: (tab: "student" | "teacher" | "api") => void;
  currentPhase: number;
  onOpenDesktopModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentPhase,
  onOpenDesktopModal,
}) => {
  const [hasCustomKey, setHasCustomKey] = useState<boolean>(false);

  useEffect(() => {
    const checkKey = () => {
      const saved = localStorage.getItem("edutn43_custom_api_key");
      setHasCustomKey(Boolean(saved && saved.trim()));
    };
    checkKey();
    window.addEventListener("storage", checkKey);
    return () => window.removeEventListener("storage", checkKey);
  }, [activeTab]);
  return (
    <header className="border-b-2 border-blue-900/80 pb-4 mb-6">
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-600 mb-1">
            <span className="bg-blue-600 text-white font-extrabold px-2 py-0.5 rounded text-[11px] tracking-wider shadow-sm">
              EduTN43
            </span>
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>MYP Sciences · AI-Integrated Summative</span>
          </div>
          <h1 className="font-serif font-bold text-3xl md:text-4xl text-blue-950 tracking-tight flex items-center gap-2">
            <span>Model vs Model</span>
            <span className="text-xs font-sans font-semibold text-blue-700 bg-blue-100/80 border border-blue-200 px-2.5 py-0.5 rounded-full">
              Diagnostic Console
            </span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Desktop App Download / Install button */}
          <button
            onClick={onOpenDesktopModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm cursor-pointer"
            title="Download or Install as Desktop App"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>App Install</span>
          </button>

          {/* Navigation Tabs */}
          <div className="inline-flex p-1 bg-white border border-slate-300 shadow-sm rounded-full">
            <button
              onClick={() => setActiveTab("student")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "student"
                  ? "bg-blue-900 text-white shadow-sm"
                  : "text-slate-700 hover:text-blue-700"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Student Console</span>
            </button>
            <button
              onClick={() => setActiveTab("teacher")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "teacher"
                  ? "bg-blue-900 text-white shadow-sm"
                  : "text-slate-700 hover:text-blue-700"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Teacher Summary</span>
            </button>
            <button
              onClick={() => setActiveTab("api")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "api"
                  ? "bg-blue-900 text-white shadow-sm"
                  : "text-slate-700 hover:text-blue-700"
              }`}
            >
              <Key className="w-3.5 h-3.5 text-yellow-400" />
              <span>API Key &amp; Traffic</span>
              {hasCustomKey && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Custom API key active" />
              )}
            </button>
          </div>

          {/* Phase Trackers (for Student mode) */}
          {activeTab === "student" && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-300 shadow-sm px-3 py-1.5 rounded-lg">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] transition-colors ${
                  currentPhase > 1
                    ? "bg-emerald-600 text-white"
                    : currentPhase === 1
                    ? "bg-blue-900 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {currentPhase > 1 ? <CheckCircle2 className="w-3 h-3" /> : "1"}
              </div>
              <span className={currentPhase === 1 ? "font-semibold text-slate-900" : ""}>Identify</span>
              <div className="w-3 h-px bg-slate-300" />
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] transition-colors ${
                  currentPhase > 2
                    ? "bg-emerald-600 text-white"
                    : currentPhase === 2
                    ? "bg-blue-900 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {currentPhase > 2 ? <CheckCircle2 className="w-3 h-3" /> : "2"}
              </div>
              <span className={currentPhase === 2 ? "font-semibold text-slate-900" : ""}>Correct</span>
              <div className="w-3 h-px bg-slate-300" />
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] transition-colors ${
                  currentPhase === 3
                    ? "bg-blue-900 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                3
              </div>
              <span className={currentPhase === 3 ? "font-semibold text-slate-900" : ""}>Reflect</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
