import { KeyRound, LockKeyhole } from "lucide-react";
import type { SetupValues } from "./SetupScreen";

export function LiveDataSetup({
  values,
  status,
  onChange,
  onConnect,
}: {
  values: SetupValues;
  status: string;
  onChange: (values: SetupValues) => void;
  onConnect: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-coconut px-4 py-8 text-ink">
      <section className="panel w-full max-w-xl p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-leaf text-white">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <div>
            <p className="label">Live Storage</p>
            <h1 className="text-xl font-black">Connect GitHub data</h1>
          </div>
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
                onChange={(event) => onChange({ ...values, token: event.target.value, rememberToken: true })}
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
          <button className="primary-button" onClick={onConnect} disabled={!values.owner || !values.repo || !values.branch || !values.token}>
            Connect Live Storage
          </button>
          <p className="text-sm font-semibold text-ink/60">{status}</p>
        </div>
      </section>
    </main>
  );
}
