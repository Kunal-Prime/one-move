import { motion } from "framer-motion";
import { Check, Copy, RefreshCw, Loader2 } from "lucide-react";
import type { Move } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

interface OutputCardProps {
  move: Move;
  onComplete: () => void;
  isCompleting: boolean;
  onRestart: () => void;
}

export function OutputCard({ move, onComplete, isCompleting, onRestart }: OutputCardProps) {
  const { toast } = useToast();
  
  // Parse the JSON string for control factors if it's a string
  const controlFactors = typeof move.controlFactors === 'string' 
    ? JSON.parse(move.controlFactors) 
    : move.controlFactors;

  const handleCopy = () => {
    const text = `Core Problem: ${move.coreProblem}\n\nWhat You Control:\n${controlFactors.control.join('\n')}\n\nWhat You Don't:\n${controlFactors.noControl.join('\n')}\n\nYour Next 60-Minute Move: ${move.nextMove}`;
    navigator.clipboard.writeText(text);
    toast({
      description: "Guidance copied to clipboard",
    });
  };

  const handleMarkDone = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#667EEA', '#ffffff', '#A0A6B3'],
      zIndex: 1000,
    });
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[800px] bg-[#1A1D23] border border-white/5 rounded-[2rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Check className="w-24 h-24" />
      </div>

      {/* Core Problem Section */}
      <div className="mb-8">
        <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mb-4">
          🧠 Core Problem
        </h3>
        <p className="text-xl sm:text-2xl text-[#EAEAF0] leading-tight font-semibold tracking-tight">
          {move.coreProblem}
        </p>
      </div>

      {/* Control / No Control Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mb-4">
            ✅ What You Control
          </h3>
          <ul className="space-y-3">
            {controlFactors.control.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-[#A0A6B3]">
                <span className="text-base leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5">
          <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mb-4">
            ❌ What You Don't
          </h3>
          <ul className="space-y-3">
            {controlFactors.noControl.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-white/20">
                <span className="text-base leading-snug italic">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Next Move Section */}
      <div className="mb-10 p-8 rounded-[1.5rem] bg-[#667EEA]/5 border border-[#667EEA]/20 glow-indigo relative group">
        <div className="absolute inset-0 bg-[#667EEA]/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <h3 className="text-[10px] font-bold text-[#667EEA] uppercase tracking-[0.3em] mb-4 relative z-10">
          ⚡ OneMove (Next 60 Minutes)
        </h3>
        <p className="text-2xl sm:text-3xl text-white font-black leading-tight tracking-tighter relative z-10">
          {move.nextMove}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={handleMarkDone}
          disabled={isCompleting || (move.isCompleted ?? false)}
          className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-primary text-white font-bold hover:bg-primary/90 shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all duration-300 active:scale-95 disabled:opacity-50"
        >
          {isCompleting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Check className="w-5 h-5" />
              <span>{move.isCompleted ? "Completed" : "Mark Done"}</span>
            </>
          )}
        </button>

        <button
          onClick={handleCopy}
          className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all duration-300 active:scale-95"
        >
          <Copy className="w-5 h-5" />
          <span>Copy Guidance</span>
        </button>

        <button
          onClick={onRestart}
          className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-white/5 border border-white/10 text-slate-400 font-bold hover:bg-white/10 hover:text-white transition-all duration-300 active:scale-95"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Restart</span>
        </button>
      </div>
    </motion.div>
  );
}
