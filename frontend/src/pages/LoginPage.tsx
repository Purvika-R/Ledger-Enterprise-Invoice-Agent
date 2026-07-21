import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

type Props = { onRegister: () => void };

export default function LoginPage({ onRegister }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!email || !password) return setError("Email and password are required.");
    setError(""); setLoading(true);
    try { await login(email, password); }
    catch { setError("Unable to sign in. Check your credentials and try again."); }
    finally { setLoading(false); }
  }

  return <main className="min-h-screen bg-slate-950 p-5 text-white md:p-8"><div className="mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl md:grid-cols-2"><section className="hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-12 md:block"><div className="flex items-center gap-2 text-xl font-semibold"><Sparkles /> Ledger AI</div><h1 className="mt-28 text-5xl font-bold leading-tight">Intelligence for every invoice.</h1><p className="mt-6 text-lg text-blue-100">Secure multi-agent processing, review, and auditability for enterprise finance teams.</p></section><motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} onSubmit={submit} className="m-auto w-full max-w-md p-8"><p className="text-sm font-semibold text-blue-400">WELCOME BACK</p><h2 className="mt-2 text-3xl font-bold">Sign in to Ledger</h2>{error && <p className="mt-5 rounded-xl bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}<label className="mt-6 block text-sm">Email<div className="mt-2 flex rounded-xl border border-slate-700 bg-slate-800 px-3 focus-within:border-blue-400"><Mail size={18} className="my-auto text-slate-400" /><input autoFocus type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent p-3 outline-none" placeholder="you@company.com" /></div></label><label className="mt-4 block text-sm">Password<div className="mt-2 flex rounded-xl border border-slate-700 bg-slate-800 px-3 focus-within:border-blue-400"><Lock size={18} className="my-auto text-slate-400" /><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent p-3 outline-none" /><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label><div className="mt-4 flex justify-between text-sm"><label><input type="checkbox" className="mr-2 accent-blue-500" />Remember me</label><button type="button" className="text-blue-400">Forgot password?</button></div><button disabled={loading} className="mt-7 w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 p-3 font-semibold disabled:opacity-50">{loading ? "Signing in…" : "Sign in"}</button><p className="mt-6 text-center text-sm text-slate-400">Don't have an account? <button type="button" onClick={onRegister} className="font-semibold text-blue-400">Create one</button></p></motion.form></div></main>;
}
