"use client";

import { useEffect, useState } from "react";

export function InstallHint() {
  const [show, setShow] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true;

    if (standalone) return;

    const dismissed = sessionStorage.getItem("mn-install-dismissed");
    if (dismissed) return;

    const ua = window.navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua);
    setIsIos(ios);
    setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div className="mb-4 rounded-2xl border border-line bg-panel/80 px-4 py-3 text-sm text-cream-dim animate-rise">
      <div className="flex items-start justify-between gap-3">
        <p>
          {isIos
            ? "Install on iPhone: tap Share, then Add to Home Screen."
            : "Install as an app: open the browser menu and choose Install / Add to Home Screen."}
        </p>
        <button
          type="button"
          className="shrink-0 text-cream/70 hover:text-cream"
          onClick={() => {
            sessionStorage.setItem("mn-install-dismissed", "1");
            setShow(false);
          }}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
