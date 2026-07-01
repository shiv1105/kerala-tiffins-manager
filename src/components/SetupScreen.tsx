import { KeyRound, LockKeyhole, LogIn, UserRound } from "lucide-react";
import { useState } from "react";
import banner from "../assets/kerala-tiffins-banner.png";

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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-coconut px-4 py-8 text-ink">
      <img src={banner} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
      <div className="absolute inset-0 bg-coconut/78" />
      <section className="panel relative w-full max-w-md bg-white/92 p-6 shadow-soft backdrop-blur-sm sm:p-8">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-leaf font-black text-white">KT</div>
          <h1 className="text-2xl font-black leading-tight sm:text-3xl">Kerala Tiffin Operations</h1>
          <p className="mt-2 text-sm leading-6 text-ink/62">Log in to manage daily schedules and customer profiles.</p>
        </div>

        <div className="mb-5 flex items-center justify-center gap-2">
          <LockKeyhole className="h-5 w-5 text-leaf" />
          <h2 className="text-lg font-black">Admin Login</h2>
        </div>
        <div className="grid gap-4">
          <label className="grid gap-1">
            <span className="label">Login ID</span>
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
            Submit
          </button>
        </div>
      </section>
    </main>
  );
}
