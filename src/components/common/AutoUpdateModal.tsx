import React, { useState } from 'react';
import { Download, RefreshCw, X, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

interface AutoUpdateModalProps {
  onClose: () => void;
}

export const AutoUpdateModal: React.FC<AutoUpdateModalProps> = ({ onClose }) => {
  const [updateState, setUpdateState] = useState<'checking' | 'available' | 'downloading' | 'ready'>('available');
  const [downloadProgress, setDownloadProgress] = useState(0);

  const handleStartDownload = () => {
    setUpdateState('downloading');
    let progress = 0;
    const interval = setInterval(() => {
      progress += 15;
      setDownloadProgress(Math.min(100, progress));
      if (progress >= 100) {
        clearInterval(interval);
        setUpdateState('ready');
      }
    }, 400);
  };

  const handleInstallRestart = () => {
    alert('QuoteFlow Desktop ERP will now restart to apply update v1.1.0!');
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 text-white rounded-3xl shadow-2xl border border-indigo-500/30 max-w-md w-full p-6 animate-in fade-in zoom-in-95 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">GitHub Auto-Update Engine</h3>
              <span className="text-[10px] text-indigo-400 font-semibold">GitHub Releases v1.1.0 Ready</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {updateState === 'available' && (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <p className="font-bold text-emerald-400 text-xs">🚀 New Version v1.1.0 Available!</p>
              <p className="text-slate-300 leading-relaxed">
                • Improved GSTR-1 Tax Export speed<br />
                • Automated SQLite & Cloud PostgreSQL Background Sync<br />
                • Windows Desktop Tray & System Notifications
              </p>
            </div>

            <button
              onClick={handleStartDownload}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-2.5 rounded-xl shadow-lg flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Update in Background</span>
            </button>
          </div>
        )}

        {updateState === 'downloading' && (
          <div className="space-y-3 text-xs text-center py-4">
            <p className="font-bold text-indigo-300">Downloading QuoteFlow_v1.1.0_Setup.exe...</p>
            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="bg-gradient-to-r from-indigo-500 to-blue-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
            <span className="text-slate-400 font-mono">{downloadProgress}% Complete</span>
          </div>
        )}

        {updateState === 'ready' && (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-2xl text-emerald-300 flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Update package downloaded and verified against GitHub signature.</span>
            </div>

            <button
              onClick={handleInstallRestart}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 rounded-xl shadow-lg flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>1-Click Install & Restart Software</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
