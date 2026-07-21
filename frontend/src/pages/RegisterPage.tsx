import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, ShieldCheck } from "lucide-react";

import { useAuth } from "../context/AuthContext";

type Props = {
  onLogin: () => void;
};

export default function RegisterPage({ onLogin }: Props) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const strength = Math.min(password.length * 10, 100);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || password.length < 8) {
      setError("Complete all fields. Passwords must contain at least 8 characters.");
      return;
    }

    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
    } catch {
      setError("Unable to create account. That email may already be registered.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-5 text-white">
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        onSubmit={submit}
        className="mx-auto my-8 max-w-lg rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-2xl backdrop-blur sm:p-10"
      >
        <button
          type="button"
          onClick={onLogin}
          className="flex items-center gap-2 text-sm font-medium text-blue-400 transition hover:text-blue-300"
        >
          <ArrowLeft size={16} />
          Back to sign in
        </button>

        <div className="mt-8 flex items-center gap-3">
          <div className="rounded-xl bg-blue-500/15 p-3 text-blue-300">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-400">GET STARTED</p>
            <h1 className="text-3xl font-bold">Create your workspace</h1>
          </div>
        </div>

        <p className="mt-4 text-slate-400">
          New accounts start with the Uploader role. Your organization can grant review access later.
        </p>

        {error && (
          <p className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200" role="alert">
            {error}
          </p>
        )}

        <label className="mt-6 block text-sm font-medium">
          Full name
          <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20" />
        </label>

        <label className="mt-4 block text-sm font-medium">
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20" />
        </label>

        <label className="mt-4 block text-sm font-medium">
          Password
          <div className="mt-2 flex rounded-xl border border-slate-700 bg-slate-800 px-3 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20">
            <input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" className="w-full bg-transparent p-3 outline-none" />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label="Toggle password visibility">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>

        <div className="mt-2 h-1.5 rounded-full bg-slate-700">
          <div className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all" style={{ width: `${strength}%` }} />
        </div>

        <label className="mt-4 block text-sm font-medium">
          Confirm password
          <input type={showPassword ? "text" : "password"} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20" />
        </label>

        <button disabled={loading} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 p-3 font-semibold shadow-lg shadow-blue-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50">
          {loading ? "Creating account…" : <><CheckCircle2 size={18} /> Create account</>}
        </button>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account? <button type="button" onClick={onLogin} className="font-semibold text-blue-400 hover:text-blue-300">Sign in</button>
        </p>
      </motion.form>
    </main>
  );
}
