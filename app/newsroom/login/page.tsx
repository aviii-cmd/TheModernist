"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "@/lib/actions/auth";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/newsroom";
  const [state, formAction, pending] = useActionState(signIn, { error: null });

  return (
    <form action={formAction} className="space-y-4 rounded-md border border-border p-6">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded border border-border bg-paper px-3 py-2 text-[15px] text-ink focus:border-accent"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded border border-border bg-paper px-3 py-2 text-[15px] text-ink focus:border-accent"
        />
      </div>

      {state.error && <p className="text-sm text-red-700">{state.error}</p>}

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-ink900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink900/90 disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
        <a href="/newsroom/forgot-password" className="text-sm text-accent hover:underline">
          Forgot password?
        </a>
      </div>
    </form>
  );
}

export default function NewsroomLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-serif text-2xl font-semibold text-ink">The Modernist</p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-ink-secondary">
            Newsroom
          </p>
        </div>

        <Suspense fallback={<div className="h-[276px] rounded-md border border-border" />}>
          <LoginForm />
        </Suspense>

        <p className="mt-6 text-center text-[13px] text-ink-secondary">
          Newsroom accounts are provisioned by an editor. Contact your editor if you need access.
        </p>
      </div>
    </div>
  );
}
