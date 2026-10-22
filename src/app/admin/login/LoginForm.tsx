"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/server/actions";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-smoke px-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm shadow-ink/5">
        <p className="mb-2 text-center font-mono text-[11px] tracking-[0.3em] text-ash">
          Out Take Studio
        </p>
        <h1 className="mb-8 text-center font-display text-2xl font-black tracking-tight">
          Admin login
        </h1>

        <form action={formAction} className="flex flex-col gap-5">
          <label className="flex flex-col gap-2">
            <span className="font-mono text-[11px] tracking-[0.14em] text-ash">Email</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="username"
              className="w-full border-0 border-b border-ash/40 bg-transparent py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="font-mono text-[11px] tracking-[0.14em] text-ash">Password</span>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="w-full border-0 border-b border-ash/40 bg-transparent py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink"
            />
          </label>

          {state?.error && (
            <p className="font-mono text-xs text-red-600" role="alert">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 flex items-center justify-center rounded-full bg-signal px-8 py-3.5 font-mono text-xs font-semibold tracking-[0.14em] text-ink transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {pending ? "Logging in..." : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}
