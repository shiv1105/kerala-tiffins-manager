import { KeyRound, LockKeyhole, LogIn, UserRound } from "lucide-react";
import { useState } from "react";
import banner from "../assets/kerala-tiffins-banner.png";

export interface SetupValues {
  owner: string;
  repo: string;
  branch: string;
  token: string;
  rememberToken: boolean;
}

export function SetupScreen({
  onContinueDemo,
}: {
  onContinueDemo: () => void;
}) {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const credentialsValid = adminId.trim().toLowerCase() === "admin" && password === "admin";

  const requireLogin = (next: () => void) => {
    if (!credentialsValid) {
      setError("Enter admin as the login ID and password.");
      return;
    }
    setError("");
    next();
  };

  return (
    <main className="min-h-screen bg-coconut text-ink">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_30rem]">
        <section className="flex items-center px-5 py-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-3xl">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-leaf font-black text-white">KT</div>
              <div>
                <p className="text-sm font-black">Kerala Tiffins</p>
                <p className="text-xs text-ink/55">Operations dashboard</p>
              </div>
            </div>

            <h1 className="max-w-2xl text-4xl font-black leading-tight text-ink sm:text-5xl">Kerala Tiffins</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-ink/68">
              Log in to manage daily schedules, customer profiles, invoices, and kitchen operations.
            </p>
          </div>
        </section>

        <aside className="relative overflow-hidden border-l border-black/10 bg-white">
          <img src={banner} alt="Packed Kerala tiffin meals" className="h-44 w-full object-cover sm:h-56 lg:h-64" />
          <div className="p-5 sm:p-7">
            <div className="mb-5 flex items-center gap-2">
              <LockKeyhole className="h-5 w-5 text-leaf" />
              <h2 className="text-lg font-black">Admin Login</h2>
            </div>
            <div className="grid gap-4">
              <label className="grid gap-1">
                <span className="label">Admin login ID</span>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
                  <input className="input pl-9" value={adminId} onChange={(event) => setAdminId(event.target.value)} placeholder="admin" />
                </div>
              </label>
              <label className="grid gap-1">
                <span className="label">Password</span>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
                  <input
                    className="input pl-9"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="admin"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") requireLogin(onContinueDemo);
                    }}
                  />
                </div>
              </label>
              {error ? <p className="rounded-md border border-spice/25 bg-spice/10 px-3 py-2 text-sm font-semibold text-spice">{error}</p> : null}
              <button className="primary-button" onClick={() => requireLogin(onContinueDemo)}>
                <LogIn className="h-4 w-4" />
                Enter Dashboard
              </button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
