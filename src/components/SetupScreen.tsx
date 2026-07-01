import { Github, KeyRound, ShieldCheck } from "lucide-react";
import banner from "../assets/kerala-tiffins-banner.png";

export interface SetupValues {
  owner: string;
  repo: string;
  branch: string;
  token: string;
  rememberToken: boolean;
}

export function SetupScreen({
  values,
  onChange,
  onContinueDemo,
  onConnect,
}: {
  values: SetupValues;
  onChange: (values: SetupValues) => void;
  onContinueDemo: () => void;
  onConnect: () => void;
}) {
  return (
    <main className="min-h-screen bg-coconut text-ink">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_30rem]">
        <section className="flex items-center px-5 py-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-3xl">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-leaf font-black text-white">KT</div>
              <div>
                <p className="text-sm font-black">Kerala Tiffins Manager</p>
                <p className="text-xs text-ink/55">GitHub-only operations dashboard</p>
              </div>
            </div>

            <h1 className="max-w-2xl text-4xl font-black leading-tight text-ink sm:text-5xl">
              Daily tiffin operations, billing, and packing checks in one place
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-ink/68">
              Public app shell, private GitHub data repo, JSON-first records, no paid backend.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ["Private data", "No customer data in source"],
                ["SHA checks", "Blocks silent overwrites"],
                ["JSON + Excel", "Live records with backups"],
              ].map(([title, body]) => (
                <div className="panel p-4" key={title}>
                  <ShieldCheck className="mb-3 h-5 w-5 text-leaf" />
                  <p className="font-bold">{title}</p>
                  <p className="mt-1 text-sm text-ink/60">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="relative overflow-hidden border-l border-black/10 bg-white">
          <img src={banner} alt="Packed Kerala tiffin meals" className="h-44 w-full object-cover sm:h-56 lg:h-64" />
          <div className="p-5 sm:p-7">
            <div className="mb-5 flex items-center gap-2">
              <Github className="h-5 w-5 text-leaf" />
              <h2 className="text-lg font-black">Data repo setup</h2>
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
                <span className="label">Fine-grained token</span>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
                  <input
                    className="input pl-9"
                    type="password"
                    value={values.token}
                    onChange={(event) => onChange({ ...values, token: event.target.value })}
                  />
                </div>
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold text-ink/70">
                <input
                  type="checkbox"
                  checked={values.rememberToken}
                  onChange={(event) => onChange({ ...values, rememberToken: event.target.checked })}
                />
                Remember token on this device
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                <button className="primary-button" onClick={onConnect} disabled={!values.owner || !values.repo || !values.branch || !values.token}>
                  Connect
                </button>
                <button className="secondary-button" onClick={onContinueDemo}>
                  Demo Data
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
