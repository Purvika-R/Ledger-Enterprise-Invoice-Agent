import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, FileImage, FileText, Sparkles, UploadCloud } from "lucide-react";

import api from "../../services/api";

type Props = { onProcessed: (data: any) => void; setProcessing: (value: boolean) => void; clearProgress: () => void };

export default function UploadCard({ onProcessed, setProcessing, clearProgress }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState("");
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  async function upload(file?: File) {
    if (!file) return;
    clearProgress(); setProcessing(true); setUploaded(false); setFileName(file.name);
    setPreview(file.type.startsWith("image/") ? URL.createObjectURL(file) : "");
    const formData = new FormData(); formData.append("file", file);
    try { const response = await api.post("/process-invoice", formData, { headers: { "Content-Type": "multipart/form-data" } }); onProcessed(response.data); setUploaded(true); }
    catch (error) { console.error(error); alert("Processing failed"); }
    finally { setProcessing(false); }
  }

  return <section className="premium-card rounded-3xl p-5 sm:p-6"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">New document</p><h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Upload invoice</h2><p className="mt-1 text-sm text-slate-500">PNG, JPG, or PDF up to your workspace limits.</p></div><div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20"><Sparkles size={20} /></div></div><motion.div onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); upload(event.dataTransfer.files?.[0]); }} whileHover={{ y: -2 }} onClick={() => inputRef.current?.click()} className={`mt-6 cursor-pointer rounded-2xl border-2 border-dashed p-7 text-center transition sm:p-10 ${dragging ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-slate-50/80 hover:border-indigo-300 hover:bg-indigo-50/40"}`}><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-indigo-600 shadow-sm"><UploadCloud size={27} /></div><h3 className="mt-4 font-semibold text-slate-800">Drop your invoice here</h3><p className="mt-1 text-sm text-slate-500">or <span className="font-semibold text-indigo-600">browse files</span> from your device</p><input ref={inputRef} type="file" accept=".png,.jpg,.jpeg,.pdf" className="hidden" onChange={(event) => upload(event.target.files?.[0])} /></motion.div>{fileName && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600">{preview ? <FileImage size={19} /> : <FileText size={19} />}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{fileName}</p><p className="text-xs text-slate-500">Sent to the intelligent processing workflow</p></div>{uploaded && <CheckCircle2 size={20} className="text-emerald-500" />}</motion.div>}{preview && <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"><img src={preview} alt="Invoice preview" className="max-h-85 w-full object-contain p-3" /></div>}</section>;
}
