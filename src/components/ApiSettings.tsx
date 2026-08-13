import React, { useState, useEffect } from "react";
import {
  Key,
  Zap,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Loader2,
  Activity,
  Check,
  Info,
  Server,
  UserCheck
} from "lucide-react";

interface ApiSettingsProps {
  onNavigateToStudent?: () => void;
}

export const ApiSettings: React.FC<ApiSettingsProps> = ({ onNavigateToStudent }) => {
  const [apiKey, setApiKey] = useState<string>("");
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    keyType?: string;
    latencyMs?: number;
  } | null>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem("edutn43_custom_api_key") || "";
    setApiKey(savedKey);
    setIsSaved(Boolean(savedKey.trim()));
  }, []);

  const handleSave = () => {
    const trimmed = apiKey.trim();
    if (trimmed) {
      localStorage.setItem("edutn43_custom_api_key", trimmed);
      setIsSaved(true);
      setTestResult({
        success: true,
        message: "Personal API Key saved successfully to browser storage!"
      });
    } else {
      handleClear();
    }
  };

  const handleClear = () => {
    localStorage.removeItem("edutn43_custom_api_key");
    setApiKey("");
    setIsSaved(false);
    setTestResult(null);
  };

  const handleTestKey = async () => {
    setIsTesting(true);
    setTestResult(null);
    const start = performance.now();

    try {
      const res = await fetch("/api/test-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-custom-api-key": apiKey.trim()
        },
        body: JSON.stringify({ customApiKey: apiKey.trim() })
      });

      const latencyMs = Math.round(performance.now() - start);
      const contentType = res.headers.get("content-type") || "";
      let data: any = null;

      if (contentType.includes("application/json")) {
        try {
          data = await res.json();
        } catch (e) {
          // ignore
        }
      }

      if (res.ok && data && data.success) {
        setTestResult({
          success: true,
          message: `Connection Verified! Response: "${data.reply}"`,
          keyType: data.keyType,
          latencyMs
        });
      } else {
        const rawText = !data ? await res.text().catch(() => "") : "";
        const cleanText = rawText.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
        setTestResult({
          success: false,
          message:
            (data && data.error) ||
            (cleanText ? `Server Error (${res.status}): ${cleanText.slice(0, 120)}` : "Failed to verify API key. Please check your key string and try again.")
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Network error while reaching the server test endpoint."
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner Header */}
      <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-900 text-white rounded-lg shadow-sm">
            <Key className="w-6 h-6 text-yellow-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-bold text-xl text-blue-950">
                Personal API Key &amp; Traffic Optimization
              </h2>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                Traffic Relief
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Connect your personal Google AI Studio key to bypass shared school server quotas and eliminate traffic delays.
            </p>
          </div>
        </div>

        {/* Current Status Badge */}
        <div className="flex items-center gap-2">
          {isSaved ? (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold px-3.5 py-2 rounded-lg shadow-xs">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Personal Key Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-lg shadow-xs">
              <Server className="w-4 h-4 text-blue-600" />
              <span>Shared Server Key Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-sm space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <h3 className="font-serif font-bold text-lg text-blue-950 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <span>Configure Personal Gemini API Key</span>
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Enter your Google Gemini API key below. It will be stored exclusively in your browser and used for all diagnostic tasks.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex justify-between items-center">
              <span>Google Gemini API Key</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold flex items-center gap-1 hover:underline lowercase"
              >
                <span>Get a free key at Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </label>

            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setIsSaved(false);
                }}
                placeholder="Paste key starting with AIzaSy..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-3.5 pr-11 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded"
                title={showKey ? "Hide key" : "Show key"}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Standard format: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">AIzaSy...</code>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={handleTestKey}
              disabled={isTesting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Testing Connection...</span>
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  <span>Test API Key</span>
                </>
              )}
            </button>

            <button
              onClick={handleSave}
              disabled={!apiKey.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>Save &amp; Use Key</span>
            </button>

            {isSaved && (
              <button
                onClick={handleClear}
                className="bg-rose-50 border border-rose-300 text-rose-700 hover:bg-rose-600 hover:text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-all flex items-center gap-2 shadow-xs cursor-pointer ml-auto"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Remove Key (Use Default)</span>
              </button>
            )}
          </div>

          {/* Test Result Message */}
          {testResult && (
            <div
              className={`p-4 rounded-lg border text-xs font-mono space-y-1 ${
                testResult.success
                  ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                  : "bg-rose-50 border-rose-300 text-rose-900"
              }`}
            >
              <div className="flex items-center gap-2 font-bold font-sans">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
              {testResult.keyType && (
                <div className="text-[11px] opacity-80 pt-1 border-t border-black/10 flex justify-between">
                  <span>Active Client Mode: <strong>{testResult.keyType}</strong></span>
                  {testResult.latencyMs && <span>Latency: <strong>{testResult.latencyMs} ms</strong></span>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Instructional Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Why Use Personal API Key? */}
        <div className="bg-white border border-blue-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-blue-900 font-serif font-bold text-base">
            <Info className="w-5 h-5 text-blue-600" />
            <span>Why Add Your Own Key?</span>
          </div>
          <ul className="text-xs text-slate-700 space-y-2 leading-relaxed font-sans">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Zero Class Traffic Delays:</strong> Prevents 429 rate-limit errors when all students submit diagnostic tasks at the exact same moment.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Higher Quota Allocation:</strong> Google AI Studio provides generous free tier requests per minute for individual user keys.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Instant Responses:</strong> Priority API execution using model <code>gemini-3.6-flash</code>.</span>
            </li>
          </ul>
        </div>

        {/* How to Get a Free Key */}
        <div className="bg-white border border-blue-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-blue-900 font-serif font-bold text-base">
            <Key className="w-5 h-5 text-blue-600" />
            <span>How to Get a Free Key (1 Min)</span>
          </div>
          <ol className="text-xs text-slate-700 space-y-2 leading-relaxed font-sans list-decimal list-inside">
            <li>
              Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-700 font-bold underline">aistudio.google.com/app/apikey</a>.
            </li>
            <li>Sign in with any standard Google or school account.</li>
            <li>Click <strong>"Create API key"</strong> in a new or existing project.</li>
            <li>Copy the generated key (starts with <code>AIzaSy...</code>) and paste it above!</li>
          </ol>
        </div>
      </div>

      {/* Privacy & Security Box */}
      <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-700 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-900">Privacy &amp; Security Assurance</p>
          <p className="leading-relaxed">
            Your personal API key is stored locally in your browser's private <code className="bg-white border px-1 rounded font-mono">localStorage</code>.
            It is never written to disk, stored on our database, or shared with other users. It is passed strictly via encrypted HTTPS headers to generate your diagnostic assessment.
          </p>
        </div>
      </div>

      {/* Return to Student Console button if provided */}
      {onNavigateToStudent && (
        <div className="text-center pt-2">
          <button
            onClick={onNavigateToStudent}
            className="bg-blue-900 hover:bg-blue-950 text-white font-bold py-2.5 px-6 rounded-lg text-xs transition-all shadow-sm cursor-pointer"
          >
            ← Return to Diagnostic Console
          </button>
        </div>
      )}
    </div>
  );
};
