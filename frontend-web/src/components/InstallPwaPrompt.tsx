import React, { useEffect, useState } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePwaInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed / running in standalone window
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const triggerInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    canInstall: !isStandalone && (!!deferredPrompt || isIOS),
    isStandalone,
    isIOS,
    hasNativePrompt: !!deferredPrompt,
    triggerInstall,
  };
};

export const InstallPwaCard: React.FC = () => {
  const { canInstall, isStandalone, isIOS, hasNativePrompt, triggerInstall } = usePwaInstall();
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isStandalone || !canInstall || dismissed) return null;

  const handleInstallClick = async () => {
    if (hasNativePrompt) {
      await triggerInstall();
    } else if (isIOS) {
      setShowIosGuide(true);
    }
  };

  return (
    <>
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600/20 via-indigo-600/25 to-blue-700/20 border border-blue-500/40 rounded-2xl p-4 shadow-lg">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-white rounded-lg transition"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 text-white shadow-md shadow-blue-500/30">
            <Download className="w-5 h-5 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0 pr-4">
            <div className="text-sm font-extrabold text-white">Install Bingo App</div>
            <div className="text-xs text-blue-200/80 mt-0.5 truncate">
              {isIOS ? 'Add to Home Screen for full screen play' : 'Install on phone for instant access'}
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-500/30 flex-shrink-0"
          >
            Install
          </button>
        </div>
      </div>

      {/* iOS Safari Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
              <Share className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Install on iPhone / iPad</h3>
              <p className="text-xs text-slate-400 mt-1">
                Safari requires installing via the browser menu:
              </p>
            </div>

            <div className="bg-slate-800/60 rounded-xl p-3 text-left space-y-2 text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">1</span>
                <span>Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline mx-1 text-blue-400" /> at bottom</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">2</span>
                <span>Scroll and tap <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-emerald-400" /></span>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const InstallNavbarButton: React.FC = () => {
  const { canInstall, isStandalone, isIOS, hasNativePrompt, triggerInstall } = usePwaInstall();
  const [showIosGuide, setShowIosGuide] = useState(false);

  if (isStandalone || !canInstall) return null;

  const handleClick = async () => {
    if (hasNativePrompt) {
      await triggerInstall();
    } else if (isIOS) {
      setShowIosGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition transform active:scale-95"
        title="Install PWA"
      >
        <Download className="w-3.5 h-3.5 animate-pulse" />
        <span className="hidden xs:inline">App</span>
      </button>

      {showIosGuide && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
              <Share className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Install on iPhone / iPad</h3>
              <p className="text-xs text-slate-400 mt-1">
                In Safari, tap <Share className="w-3.5 h-3.5 inline mx-1 text-blue-400" /> Share, then tap <strong>Add to Home Screen</strong>.
              </p>
            </div>
            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
