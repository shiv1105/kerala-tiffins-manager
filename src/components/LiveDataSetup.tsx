import { KeyRound, LockKeyhole, LogOut, RotateCcw } from "lucide-react";
import type { SetupValues } from "./SetupScreen";

export function LiveDataSetup({
  values,
  status,
  error,
  isConnecting,
  onChange,
  onConnect,
  onClear,
  onBackToLogin,
}: {
  values: SetupValues;
  status: string;
  error: string;
  isConnecting: boolean;
  onChange: (values: SetupValues) => void;
  onConnect: () => void;
  onClear: () => void;
  onBackToLogin: () => void;
}) {
  const canConnect = Boolean(values.owner.trim() && values.repo.trim() && values.branch.trim() && values.token.trim());

  return (
    <main className="flex min-h-screen items-center justify-center bg-coconut px-4 py-8 text-ink">
      <section className="panel w-full max-w-xl p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-leaf text-white">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <div>
              <p className="label">Live Storage</p>
              <h1 className="text-xl font-black">Connect GitHub data</h1>
            </div>
          </div>
          <button className="secondary-button h-9" onClick={onBackToLogin}>
            <LogOut className="h-4 w-4" />
            Login
          </button>
        </div>

        <div className="grid gap-4">
          <label className="grid gap-1">
            <span className="label">Owner</span>
            <input className="input" value={values.owner} onChange={(event) => onChange({ ...values, owner: event.target.value })} />
          </label>
          <label className="grid gap-1">
            <span className="label">Repository</span>
            <input className="input" value={values.repo} onChange={(event) => onChange({ ...values, repo: event.target.value })} />
          </label>
          <label className="grid gap-1">
            <span className="label">Branch</span>
            <input className="input" value={values.branch} onChange={(event) => onChange({ ...values, branch: event.target.value })} />
          </label>
          <label className="grid gap-1">
            <span className="label">GitHub token</span>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
              <input
                className="input pl-9"
                type="password"
                value={values.token}
                onChange={(event) => onChange({ ...values, token: event.target.value.trim(), rememberToken: true })}
                placeholder="github_pat_..."
              />
            </div>
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-ink/70">
            <input
              type="checkbox"
              checked={values.rememberToken}
              onChange={(event) => onChange({ ...values, rememberToken: event.target.checked })}
            />
            Remember live storage on this device
          </label>
          {error ? (
            <div className="rounded-md border border-spice/25 bg-spice/10 px-3 py-3 text-sm font-semibold leading-6 text-spice">
              {error}
              <div className="mt-2 text-ink/70">
                Use a fine-grained token for <span className="font-black">shiv1105/kerala-tiffins-data</span> with <span className="font-black">Contents: Read and write</span>.
              </div>
            </div>
          ) : null}
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <button className="primary-button" onClick={onConnect} disabled={!canConnect || isConnecting}>
              {isConnecting ? "Connecting..." : "Connect Live Storage"}
            </button>
            <button className="secondary-button" onClick={onClear}>
              <RotateCcw className="h-4 w-4" />
              Clear
            </button>
          </div>
          <p className="text-sm font-semibold text-ink/60">{status}</p>
        </div>
      </section>
    </main>
  );
}
