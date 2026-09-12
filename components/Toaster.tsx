"use client";

import { useEffect, useState } from "react";
import { subscribeToasts, type ToastMessage } from "@/lib/toast";

const STYLES: Record<ToastMessage["variant"], string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-border bg-white text-ink",
};

export default function Toaster() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => subscribeToasts(setToasts), []);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-5">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto max-w-sm rounded-md border px-4 py-3 text-sm shadow-sm ${STYLES[t.variant]}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
