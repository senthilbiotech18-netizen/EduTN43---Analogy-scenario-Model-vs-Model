import React, { useState, useEffect } from "react";
import {
  Monitor,
  Download,
  X,
  CheckCircle2,
  Laptop,
  Terminal,
  Sparkles,
  BookOpen
} from "lucide-react";
import JSZip from "jszip";

interface DesktopInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  setDeferredPrompt: (prompt: any) => void;
}

export const DesktopInstallModal: React.FC<DesktopInstallModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  setDeferredPrompt,
}) => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [isChromebook, setIsChromebook] = useState(false);

  useEffect(() => {
    // Check ChromeOS / Chromebook user agent
    if (typeof navigator !== "undefined" && /CrOS/.test(navigator.userAgent)) {
      setIsChromebook(true);
    }

    // Check if running in standalone window (installed PWA)
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
    }
  }, []);

  if (!isOpen) return null;

  const handlePwaInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      alert(
        "To install Model vs Model on your Chromebook / Desktop:\n\n" +
          "1. Click the 'Install' icon (⊕ or ⬇) on the right side of Chrome's address bar.\n" +
          "2. Or click the 3 dots menu (⋮) -> 'Save and share' -> 'Install Model vs Model'.\n\n" +
          "This will pin the app directly to your Chromebook shelf and launcher!"
      );
    }
  };

  const handleDownloadElectronPackage = async () => {
    setIsDownloadingZip(true);
    try {
      const zip = new JSZip();

      // Electron main.js
      const mainJsContent = `const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 850,
    title: 'Model vs Model — Diagnostic Console',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  win.loadURL('${window.location.origin}');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
`;

      const packageJsonContent = `{
  "name": "model-vs-model-desktop",
  "version": "1.0.0",
  "description": "Model vs Model — Desktop Application Launcher",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build:win": "electron-builder --win",
    "build:mac": "electron-builder --mac",
    "build:linux": "electron-builder --linux"
  },
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-builder": "^24.9.0"
  }
}
`;

      const readmeContent = `# Model vs Model — Desktop Application Launcher

This desktop package allows you to run Model vs Model as a standalone desktop application on Windows, macOS, or Linux.

For Chromebooks, install directly from the browser window using ChromeOS Web App installation.
`;

      zip.file("main.js", mainJsContent);
      zip.file("package.json", packageJsonContent);
      zip.file("README.md", readmeContent);

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Model_vs_Model_Desktop_Package.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Zip generation error:", err);
      alert("Failed to build desktop package.");
    } finally {
      setIsDownloadingZip(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border-2 border-blue-900 rounded-lg max-w-lg w-full p-6 shadow-2xl space-y-5 text-slate-900 font-mono relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-slate-100 hover:bg-blue-900 hover:text-white rounded border border-slate-300 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
          <div className="p-2.5 bg-blue-900 text-white rounded-md shadow-sm">
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-blue-800 bg-blue-100 px-2 py-0.5 rounded text-[10px] tracking-wider">EduTN43</span>
              <h3 className="font-serif font-bold text-xl text-blue-950">
                Install App
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              Optimized for Chromebooks (ChromeOS), Windows, Mac, and Linux.
            </p>
          </div>
        </div>

        {/* Chromebook Highlight Banner */}
        {isChromebook && (
          <div className="p-3 bg-blue-50 border border-blue-300 rounded-lg text-xs text-blue-950 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-700 shrink-0" />
            <span>
              <strong>Chromebook Detected!</strong> ChromeOS supports 1-click installation directly to your Chromebook launcher and shelf.
            </span>
          </div>
        )}

        {/* Chromebook / ChromeOS Direct PWA App Installation */}
        <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-blue-900">
              <Laptop className="w-4 h-4 text-blue-600" />
              <span>Chromebook &amp; Web App Installation</span>
            </div>
            {isInstalled && (
              <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Installed
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Installs EduTN43 Model vs Model as a standalone app on your Chromebook launcher/shelf or PC desktop window.
          </p>

          <button
            onClick={handlePwaInstall}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>
              {deferredPrompt
                ? "Install on Chromebook / Desktop Now"
                : "Install App on Chromebook / Desktop"}
            </span>
          </button>
        </div>

        {/* Option 2: Standalone Electron Desktop Package */}
        <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-blue-900">
            <Terminal className="w-4 h-4 text-blue-700" />
            <span>Windows / Mac Desktop Package (.zip)</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Download pre-configured Electron desktop runner wrapper for PC &amp; Mac offline packaging.
          </p>

          <button
            onClick={handleDownloadElectronPackage}
            disabled={isDownloadingZip}
            className="w-full bg-white border border-slate-300 hover:border-blue-600 text-blue-900 font-bold py-2.5 px-4 rounded text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>
              {isDownloadingZip
                ? "Generating Desktop Package..."
                : "Download PC / Mac Package (.zip)"}
            </span>
          </button>
        </div>

        {/* Chromebook Instructions */}
        <div className="text-[11px] text-slate-600 bg-blue-50/50 border border-blue-200 rounded p-3 space-y-1">
          <strong className="text-blue-900 block">How to Install on Chromebooks:</strong>
          <div>1. Click <strong>Install App on Chromebook</strong> above.</div>
          <div>2. Or look at Chrome's address bar for the ⊕ <strong>Install</strong> icon.</div>
          <div>3. Once installed, search for <strong>EduTN43 Model vs Model</strong> in your Chromebook Launcher or pin it to your shelf!</div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="bg-blue-900 text-white font-semibold text-xs py-1.5 px-4 rounded cursor-pointer hover:bg-blue-950 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
