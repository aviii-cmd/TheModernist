"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/newsroom/reset-password`,
    });
    setPending(false);
    // Always show the same confirmation, whether or not the email is registered —
    // this avoids revealing which addresses have newsroom accounts.
    setSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-serif text-2xl font-semibold text-ink">The Modernist</p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-ink-secondary">
            Newsroom
          </p>
        </div>

        {sent ? (
          <div className="rounded-md border border-border p-6 text-center">
            <p className="text-[15px] text-ink">
              If an account exists for that email, a reset link is on its way.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-md border border-border p-6">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full rounded border border-border bg-paper px-3 py-2 text-[15px] text-ink focus:border-accent"
              />
            </div>
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded bg-ink900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink900/90 disabled:opacity-60"
            >
              {pending ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-[13px] text-ink-secondary">
          <a href="/newsroom/login" className="text-accent hover:underline">
            Back to sign in
          </a>
        </p>
      </div>
    </div>
  );
}
