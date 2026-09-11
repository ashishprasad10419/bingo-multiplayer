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

export const InstallModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  isIOS: boolean;
  isAndroid: boolean;
}> = ({ isOpen, onClose, isIOS, isAndroid }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-5 text-center relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mx-auto text-white shadow-lg shadow-blue-500/25">
          <Download className="w-7 h-7" />
        </div>

        <div>
          <h3 className="text-xl font-black text-slate-900">Install Bingo App</h3>
          <p className="text-xs text-slate-500 mt-1">
            Install on your device for full-screen play without address bars.
          </p>
        </div>

        {isIOS ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3 text-xs text-slate-700">
            <div className="font-bold text-indigo-700 mb-1 flex items-center space-x-1.5">
              <Smartphone className="w-4 h-4 text-indigo-600" />
              <span>iPhone / iPad (Safari)</span>
            </div>
            <div className="flex items-start space-x-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">1</span>
              <span>Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline mx-1 text-blue-600" /> at the bottom</span>
            </div>
            <div className="flex items-start space-x-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">2</span>
              <span>Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-emerald-600" /></span>
            </div>
          </div>
        ) : isAndroid ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3 text-xs text-slate-700">
            <div className="font-bold text-indigo-700 mb-1 flex items-center space-x-1.5">
              <Smartphone className="w-4 h-4 text-indigo-600" />
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
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3 text-xs text-slate-700">
            <div className="font-bold text-indigo-700 mb-1 flex items-center space-x-1.5">
              <Monitor className="w-4 h-4 text-indigo-600" />
              <span>Desktop (Chrome / Edge)</span>
            </div>
            <div className="flex items-start space-x-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">1</span>
              <span>Click the <strong>Install / Open in app</strong> icon in the address bar</span>
            </div>
            <div className="flex items-start space-x-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">2</span>
              <span>Or click <strong>Menu (⋮) &gt; Save and share &gt; Install Bingo Multiplayer</strong></span>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-blue-500/25 transition cursor-pointer"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

// Subtle button for Login screen footer
export const InstallPwaInline: React.FC = () => {
  const { canInstall, isStandalone, isIOS, isAndroid, hasNativePrompt, triggerInstall } = usePwaInstall();
  const [showModal, setShowModal] = useState(false);

  if (isStandalone || !canInstall) return null;

  const handleClick = async () => {
    if (hasNativePrompt) {
      const accepted = await triggerInstall();
      if (!accepted) setShowModal(true);
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 text-xs shadow-2xs transition cursor-pointer"
      >
        <Smartphone className="w-3.5 h-3.5 text-blue-600" />
        <span>Install App on your device</span>
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

// Clean settings row for Profile screen
export const InstallProfileCard: React.FC = () => {
  const { canInstall, isStandalone, isIOS, isAndroid, hasNativePrompt, triggerInstall } = usePwaInstall();
  const [showModal, setShowModal] = useState(false);

  if (isStandalone || !canInstall) return null;

  const handleClick = async () => {
    if (hasNativePrompt) {
      const accepted = await triggerInstall();
      if (!accepted) setShowModal(true);
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <div className="bg-white/95 border border-slate-200/90 rounded-3xl p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-black text-slate-900">Install Bingo App</div>
            <div className="text-xs text-slate-500 mt-0.5">Add to Home Screen for clean fullscreen play</div>
          </div>
        </div>
        <button
          onClick={handleClick}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition shadow-md shadow-blue-500/20 cursor-pointer"
        >
          Install
        </button>
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
