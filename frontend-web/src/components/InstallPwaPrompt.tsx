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
    <div className="fixed inset-0 z-50 bg-[#2a2050]/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm card-clay p-6 sm:p-7 shadow-[0_20px_50px_rgba(140,120,200,0.25)] space-y-5 text-center relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#7e749c] hover:text-[#2a2050] rounded-full bg-[#f4effc] hover:bg-[#ece5fa] transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 rounded-[22px] bg-gradient-to-tr from-[#f8788a] via-[#e271a5] to-[#8b7fe8] flex items-center justify-center mx-auto text-white shadow-[0_8px_20px_rgba(240,115,145,0.35)]">
          <Download className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-[#2a2050]">Install Bingo App</h3>
          <p className="text-xs text-[#7e749c] mt-1 font-medium">
            Install on your device for full-screen play without browser bars.
          </p>
        </div>

        {isIOS ? (
          <div className="bg-[#f7f4fc] border border-[#ede8f8] rounded-2xl p-4 text-left space-y-3 text-xs text-[#524872]">
            <div className="font-extrabold text-[#8b7fe8] mb-1 flex items-center space-x-1.5">
              <Smartphone className="w-4 h-4 text-[#8b7fe8]" />
              <span>iPhone / iPad (Safari)</span>
            </div>
            <div className="flex items-start space-x-2.5">
              <span className="w-5 h-5 rounded-full bg-[#8b7fe8] text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">1</span>
              <span>Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline mx-1 text-[#8b7fe8]" /> at the bottom</span>
            </div>
            <div className="flex items-start space-x-2.5">
              <span className="w-5 h-5 rounded-full bg-[#8b7fe8] text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">2</span>
              <span>Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-[#10b981]" /></span>
            </div>
          </div>
        ) : isAndroid ? (
          <div className="bg-[#f7f4fc] border border-[#ede8f8] rounded-2xl p-4 text-left space-y-3 text-xs text-slate-700">
            <div className="font-extrabold text-[#8b7fe8] mb-1 flex items-center space-x-1.5">
              <Smartphone className="w-4 h-4 text-[#8b7fe8]" />
              <span>Android (Chrome / Edge)</span>
            </div>
            <div className="flex items-start space-x-2.5">
              <span className="w-5 h-5 rounded-full bg-[#8b7fe8] text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">1</span>
              <span>Tap the <strong>three dots (⋮)</strong> menu in top-right</span>
            </div>
            <div className="flex items-start space-x-2.5">
              <span className="w-5 h-5 rounded-full bg-[#8b7fe8] text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">2</span>
              <span>Tap <strong>Install app</strong> or <strong>Add to Home screen</strong></span>
            </div>
          </div>
        ) : (
          <div className="bg-[#f7f4fc] border border-[#ede8f8] rounded-2xl p-4 text-left space-y-3 text-xs text-slate-700">
            <div className="font-extrabold text-[#8b7fe8] mb-1 flex items-center space-x-1.5">
              <Monitor className="w-4 h-4 text-[#8b7fe8]" />
              <span>Desktop (Chrome / Edge)</span>
            </div>
            <div className="flex items-start space-x-2.5">
              <span className="w-5 h-5 rounded-full bg-[#8b7fe8] text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">1</span>
              <span>Click the <strong>Install / Open in app</strong> icon in address bar</span>
            </div>
            <div className="flex items-start space-x-2.5">
              <span className="w-5 h-5 rounded-full bg-[#8b7fe8] text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">2</span>
              <span>Or click <strong>Menu (⋮) &gt; Save and share &gt; Install Bingo</strong></span>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3.5 btn-gradient text-sm cursor-pointer"
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
        className="btn-pill-outline text-xs px-4 py-2 space-x-2 cursor-pointer"
      >
        <Smartphone className="w-3.5 h-3.5 text-[#8b7fe8]" />
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
      <div className="card-clay p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#f0ecfc] border border-[#e2d7f8] flex items-center justify-center text-[#8b7fe8] shadow-xs">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-[#2a2050]">Install Bingo App</div>
            <div className="text-xs text-[#7e749c] mt-0.5 font-medium">Add to Home Screen for fullscreen play</div>
          </div>
        </div>
        <button
          onClick={handleClick}
          className="btn-gradient text-xs px-5 py-2.5 cursor-pointer"
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
