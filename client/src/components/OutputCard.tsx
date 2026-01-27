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
    // Multi-shot confetti for full screen effect
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    // Audio cue
    const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/clown_horn_echo.ogg");
    audio.volume = 0.5;
    audio.play().catch(() => {}); // Ignore silent play blocks

    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[800px] bg-[#1A1D23] border border-white/5 rounded-[2rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Check className="w-24 h-24" />
      </div>

      <div className="mb-8">
        <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mb-4">
          🧠 Core Problem
        </h3>
        <p className="text-xl sm:text-2xl text-[#EAEAF0] leading-tight font-semibold tracking-tight">
          {move.coreProblem}
        </p>
      </div>

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

      <div className="mb-10 p-8 rounded-[1.5rem] bg-[#667EEA]/5 border border-[#667EEA]/20 glow-indigo relative group">
        <div className="absolute inset-0 bg-[#667EEA]/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <h3 className="text-[10px] font-bold text-[#667EEA] uppercase tracking-[0.3em] mb-4 relative z-10">
          ⚡ OneMove (Next 60 Minutes)
        </h3>
        <p className="text-2xl sm:text-3xl text-white font-black leading-tight tracking-tighter relative z-10">
          {move.nextMove}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={handleMarkDone}
          disabled={isCompleting || (move.isCompleted ?? false)}
          className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-primary text-white font-bold hover:bg-primary/90 shadow-[0_0_30px_rgba(102,126,234,0.3)] transition-all duration-200 active:scale-95 disabled:opacity-50"
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
          className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all duration-200 active:scale-95"
        >
          <Copy className="w-5 h-5" />
          <span>Copy Guidance</span>
        </button>

        <button
          onClick={onRestart}
          className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-white/5 border border-white/10 text-slate-400 font-bold hover:bg-white/10 hover:text-white transition-all duration-200 active:scale-95"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Restart</span>
        </button>
      </div>
    </motion.div>
  );
}
