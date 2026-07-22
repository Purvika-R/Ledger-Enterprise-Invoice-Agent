import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

import AuthLayout from "../components/auth/AuthLayout";
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
    setError("");
    setLoading(true);
    try { await login(email, password); }
    catch { setError("Unable to sign in. Check your credentials and try again."); }
    finally { setLoading(false); }
  }

  return <AuthLayout><motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} onSubmit={submit} className="m-auto w-full max-w-md"><p className="text-sm font-semibold text-blue-400">WELCOME BACK</p><h2 className="mt-2 text-3xl font-bold">Sign in to Ledger</h2>{error && <p className="mt-5 rounded-xl bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}<label className="mt-6 block text-sm">Email<div className="mt-2 flex rounded-xl border border-slate-700 bg-slate-800 px-3 focus-within:border-blue-400"><Mail size={18} className="my-auto text-slate-400" /><input autoFocus type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent p-3 outline-none" placeholder="you@company.com" /></div></label><label className="mt-4 block text-sm">Password<div className="mt-2 flex rounded-xl border border-slate-700 bg-slate-800 px-3 focus-within:border-blue-400"><Lock size={18} className="my-auto text-slate-400" /><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent p-3 outline-none" /><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label><div className="mt-4 flex justify-between text-sm"><label><input type="checkbox" className="mr-2 accent-blue-500" />Remember me</label><button type="button" className="text-blue-400">Forgot password?</button></div><button disabled={loading} className="mt-7 w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 p-3 font-semibold disabled:opacity-50">{loading ? "Signing in…" : "Sign in"}</button><p className="mt-6 text-center text-sm text-slate-400">Don't have an account? <button type="button" onClick={onRegister} className="font-semibold text-blue-400">Create one</button></p></motion.form></AuthLayout>;
}
