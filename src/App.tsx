import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { StudentConsole } from "./components/StudentConsole";
import { TeacherSummary } from "./components/TeacherSummary";
import { ApiSettings } from "./components/ApiSettings";
import { DesktopInstallModal } from "./components/DesktopInstallModal";

export default function App() {
  const [activeTab, setActiveTab] = useState<"student" | "teacher" | "api">("student");
  const [currentPhase, setCurrentPhase] = useState<number>(1);
  const [isDesktopModalOpen, setIsDesktopModalOpen] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-slate-50 to-blue-100/40 text-slate-900 font-mono p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentPhase={currentPhase}
          onOpenDesktopModal={() => setIsDesktopModalOpen(true)}
        />

        <main>
          {activeTab === "student" ? (
            <StudentConsole
              onPhaseChange={setCurrentPhase}
              onNavigateToApiPage={() => setActiveTab("api")}
            />
          ) : activeTab === "teacher" ? (
            <TeacherSummary />
          ) : (
            <ApiSettings onNavigateToStudent={() => setActiveTab("student")} />
          )}
        </main>

        <footer className="border-t border-slate-300/80 pt-4 mt-8 flex flex-wrap justify-between items-center text-xs text-slate-600 gap-2 font-sans">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-blue-800 bg-blue-100 px-2 py-0.5 rounded text-[11px] tracking-wider">EduTN43</span>
            <span><strong>Model vs Model</strong> — Diagnostic Console · MYP Sciences Criterion A Assessment</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDesktopModalOpen(true)}
              className="text-blue-700 hover:text-blue-900 font-bold hover:underline transition-all"
            >
              💻 Install Chromebook &amp; Desktop App
            </button>
            <span>•</span>
            <span>Powered by Server-Side Gemini 3.6 Flash</span>
          </div>
        </footer>
      </div>

      <DesktopInstallModal
        isOpen={isDesktopModalOpen}
        onClose={() => setIsDesktopModalOpen(false)}
        deferredPrompt={deferredPrompt}
        setDeferredPrompt={setDeferredPrompt}
      />
    </div>
  );
}
