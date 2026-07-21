import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <main className="min-h-screen bg-slate-950 p-5 text-white"><div className="mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl md:grid-cols-2"><section className="hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-12 md:block"><div className="flex items-center gap-2 text-xl font-semibold"><Sparkles /> Ledger AI</div><h1 className="mt-28 text-5xl font-bold">Finance intelligence, elevated.</h1><p className="mt-6 text-lg text-blue-100">A secure workspace for extraction, validation, review, and auditability.</p></section><motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center p-8 sm:p-12">{children}</motion.section></div></main>;
}
