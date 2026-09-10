import React, { useEffect, useState } from 'react';
import { Download, Share, PlusSquare, Smartphone, Monitor, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePwaInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Detect standalone mode
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

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
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
        return true;
      }
    } catch (e) {
      console.warn('Install prompt error:', e);
    }
    return false;
  };

  return {
    canInstall: !isStandalone,
    isStandalone,
    isIOS,
    isAndroid,
    hasNativePrompt: !!deferredPrompt,
    triggerInstall,
  };
};

export const InstallModal: React.FC<{ isOpen: boolean; onClose: () => void; isIOS: boolean; isAndroid: boolean }> = ({
  isOpen,
  onClose,
  isIOS,
  isAndroid,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-center relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mx-auto text-white shadow-xl shadow-blue-500/30">
          <Download className="w-7 h-7" />
        </div>

        <div>
          <h3 className="text-lg font-black text-white">Install Bingo App</h3>
          <p className="text-xs text-slate-400 mt-1">
            Install on your phone or desktop for full-screen play without address bars.
          </p>
        </div>

        {isIOS ? (
          <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-4 text-left space-y-3 text-xs text-slate-200">
            <div className="font-bold text-indigo-300 mb-1 flex items-center space-x-1.5">
              <Smartphone className="w-4 h-4 text-indigo-400" />
              <span>iPhone / iPad (Safari)</span>
            </div>
            <div className="flex items-start space-x-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">1</span>
              <span>Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline mx-1 text-blue-400" /> at bottom of Safari</span>
            </div>
            <div className="flex items-start space-x-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">2</span>
              <span>Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-emerald-400" /></span>
            </div>
          </div>
        ) : isAndroid ? (
          <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-4 text-left space-y-3 text-xs text-slate-200">
            <div className="font-bold text-indigo-300 mb-1 flex items-center space-x-1.5">
              <Smartphone className="w-4 h-4 text-indigo-400" />
              <span>Android (Chrome / Edge)</span>
            </div>
            <div className="flex items-start space-x-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">1</span>
              <span>Tap the <strong>three dots (⋮)</strong> menu in the top-right</span>
            </div>
            <div className="flex items-start space-x-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">2</span>
              <span>Tap <strong>Install app</strong> or <strong>Add to Home screen</strong></span>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-4 text-left space-y-3 text-xs text-slate-200">
            <div className="font-bold text-indigo-300 mb-1 flex items-center space-x-1.5">
              <Monitor className="w-4 h-4 text-indigo-400" />
              <span>Desktop (Chrome / Edge)</span>
            </div>
            <div className="flex items-start space-x-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">1</span>
              <span>Click the <strong>Install icon</strong> in your browser address bar</span>
            </div>
            <div className="flex items-start space-x-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">2</span>
              <span>Or click <strong>Menu (⋮) &gt; Save and share &gt; Install Bingo Multiplayer</strong></span>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-blue-500/25 transition"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export const InstallPwaCard: React.FC = () => {
  const { canInstall, isStandalone, isIOS, isAndroid, hasNativePrompt, triggerInstall } = usePwaInstall();
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isStandalone || !canInstall || dismissed) return null;

  const handleClick = async () => {
    if (hasNativePrompt) {
      const accepted = await triggerInstall();
      if (!accepted) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600/20 via-indigo-600/25 to-blue-700/20 border border-blue-500/40 rounded-3xl p-4 shadow-xl shadow-blue-500/10">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-3 right-3 p-1 text-slate-400 hover:text-white rounded-lg transition"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 text-white shadow-lg shadow-blue-500/30">
            <Download className="w-5 h-5 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0 pr-3">
            <div className="text-sm font-black text-white flex items-center space-x-1.5">
              <span>Install Bingo App</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-full border border-blue-500/30">
                PWA
              </span>
            </div>
            <div className="text-xs text-blue-200/80 mt-0.5 truncate">
              Play fullscreen on phone or desktop
            </div>
          </div>
          <button
            onClick={handleClick}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold transition shadow-lg shadow-blue-500/30 flex-shrink-0"
          >
            Install
          </button>
        </div>
      </div>

      <InstallModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        isIOS={isIOS}
        isAndroid={isAndroid}
      />
    </>
  );
};

export const InstallNavbarButton: React.FC = () => {
  const { canInstall, isStandalone, isIOS, isAndroid, hasNativePrompt, triggerInstall } = usePwaInstall();
  const [showModal, setShowModal] = useState(false);

  if (isStandalone || !canInstall) return null;

  const handleClick = async () => {
    if (hasNativePrompt) {
      const accepted = await triggerInstall();
      if (!accepted) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-blue-500/20 transition transform active:scale-95"
        title="Install App"
      >
        <Download className="w-3.5 h-3.5 animate-pulse" />
        <span>Install App</span>
      </button>

      <InstallModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        isIOS={isIOS}
        isAndroid={isAndroid}
      />
    </>
  );
};
