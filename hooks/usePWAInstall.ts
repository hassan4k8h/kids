import { useEffect, useMemo, useState } from 'react';

const PROMPTED_KEY = 'pwa_prompted_v1';
const DISMISSED_KEY = 'pwa_dismissed_v1';

export function usePWAInstall() {
  const [deferred, setDeferred] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [hasPrompted, setHasPrompted] = useState<boolean>(() => {
    try { return localStorage.getItem(PROMPTED_KEY) === '1'; } catch { return false; }
  });
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try { return localStorage.getItem(DISMISSED_KEY) === '1'; } catch { return false; }
  });

  const isStandalone = useMemo(() => {
    // Chrome/Edge
    const displayModeStandalone = window.matchMedia('(display-mode: standalone)').matches;
    // iOS Safari
    const iosStandalone = (window.navigator as any).standalone === true;
    return displayModeStandalone || iosStandalone;
  }, []);

  const isIOS = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    return /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferred(e);
      setCanInstall(true);
      // حاول التحفيز التلقائي مرة واحدة فقط وبشكل محترم
      if (!hasPrompted && !dismissed) {
        setTimeout(() => {
          autoPrompt();
        }, 600);
      }
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [hasPrompted, dismissed]);

  const markPrompted = () => {
    try { localStorage.setItem(PROMPTED_KEY, '1'); } catch {}
    setHasPrompted(true);
  };

  const markDismissed = () => {
    try { localStorage.setItem(DISMISSED_KEY, '1'); } catch {}
    setDismissed(true);
  };

  const autoPrompt = async () => {
    if (!deferred) return false;
    markPrompted();
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome !== 'accepted') markDismissed();
    setDeferred(null);
    setCanInstall(false);
    return outcome === 'accepted';
  };

  const install = async () => {
    if (!deferred) return false;
    markPrompted();
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome !== 'accepted') markDismissed();
    setDeferred(null);
    setCanInstall(false);
    return outcome === 'accepted';
  };

  return { canInstall, install, autoPrompt, isIOS, isStandalone, dismissed };
}


