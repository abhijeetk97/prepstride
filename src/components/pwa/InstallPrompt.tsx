import { useCallback, useEffect, useState } from 'react';
import { Modal } from '../common';
import { Pip } from '../mascot/Pip';
import { Plus } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'prepstride_a2hs_dismissed_at';
const NEVER_KEY = 'prepstride_a2hs_never';
const AUTO_DELAY_MS = 6000;
const COOLDOWN_MS = 7 * 86_400_000; // re-offer weekly unless refused forever

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

const isIOS =
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/**
 * "Add to Home Screen" guide — auto popup (once a week, skippable) + manual
 * trigger from the More tab. Uses the native install prompt where available
 * (Android/Chrome) and friendly step-by-step instructions on iOS Safari.
 */
export function InstallPrompt({ allowAuto }: { allowAuto: boolean }) {
  const [open, setOpen] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone());

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setOpen(false);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  // Manual trigger from anywhere in the app
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener('prepstride:show-install', show);
    return () => window.removeEventListener('prepstride:show-install', show);
  }, []);

  // Auto-popup only after onboarding and two distinct study days, then at most weekly.
  useEffect(() => {
    if (!allowAuto || installed || isStandalone()) return;
    if (localStorage.getItem(NEVER_KEY)) return;
    const last = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
    if (Date.now() - last < COOLDOWN_MS) return;
    const t = setTimeout(() => setOpen(true), AUTO_DELAY_MS);
    return () => clearTimeout(t);
  }, [installed, allowAuto]);

  const dismiss = useCallback((never: boolean) => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    if (never) localStorage.setItem(NEVER_KEY, '1');
    setOpen(false);
  }, []);

  const nativeInstall = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === 'accepted') {
      setInstalled(true);
      setOpen(false);
    } else {
      setDeferred(null);
    }
  }, [deferred]);

  if (installed) return null;

  return (
    <Modal open={open} onClose={() => dismiss(false)} title="Take PrepStride offline 📲">
      <div className="flex flex-col items-center gap-3 text-center">
        <Pip mood="wave" size={84} />
        <p className="text-sm text-ink">
          Install Pip on the home screen — the app then opens instantly, works in airplane mode, and lives
          right beside her books (no app store needed).
        </p>

        {deferred ? (
          <button className="btn-primary w-full py-3" onClick={() => void nativeInstall()}>
            Install PrepStride
          </button>
        ) : isIOS ? (
          <ol className="w-full space-y-2.5 text-left">
            <Step n={1}>
              Open this page in <b>Safari</b> (if you're inside another browser app, tap the <b>···</b> menu →
              "Open in Safari" first).
            </Step>
            <Step n={2}>
              Tap the <b>Share</b> button{' '}
              <span className="inline-flex translate-y-[3px] items-center justify-center rounded-md border border-line bg-surface2 p-0.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" strokeLinecap="round" />
                  <path d="M16 6l-4-4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 2v13" strokeLinecap="round" />
                </svg>
              </span>{' '}
              in the toolbar at the bottom.
            </Step>
            <Step n={3}>
              Scroll down and tap <b>Add to Home Screen</b>{' '}
              <span className="inline-flex translate-y-[3px] items-center gap-0.5 rounded-md border border-line bg-surface2 px-1 text-[11px] font-bold">
                <Plus size={10} /> Add to Home Screen
              </span>
              , then <b>Add</b>.
            </Step>
          </ol>
        ) : (
          <ol className="w-full space-y-2.5 text-left">
            <Step n={1}>
              <b>Android (Chrome):</b> tap the <b>⋮</b> menu at the top-right → <b>Install app</b> /{" "}
              <b>Add to Home screen</b>.
            </Step>
            <Step n={2}>
              <b>Desktop (Chrome/Edge):</b> click the <b>install ⊕</b> icon in the address bar.
            </Step>
          </ol>
        )}

        <div className="flex w-full gap-2 pt-1">
          <button className="btn-primary flex-1" onClick={() => dismiss(false)}>
            Got it
          </button>
          <button className="btn-ghost" onClick={() => dismiss(true)}>
            Don't ask again
          </button>
        </div>
        <p className="text-[10px] text-inksoft">Pip will gently re-offer in a week unless you say never.</p>
      </div>
    </Modal>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 rounded-xl bg-surface2 px-3 py-2.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-extrabold text-white">
        {n}
      </span>
      <span className="text-[13px] leading-snug text-ink">{children}</span>
    </li>
  );
}
