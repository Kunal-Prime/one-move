import { motion } from "framer-motion";
import { Check, Copy, RefreshCw } from "lucide-react";
import type { Move } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[800px] mt-8 bg-card/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-[0_0_80px_rgba(0,0,0,0.6)]"
    >
      {/* Core Problem Section */}
      <div className="mb-10">
        <h3 className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4">
          Core Problem
        </h3>
        <p className="text-2xl text-white leading-tight font-bold tracking-tight">
          {move.coreProblem}
        </p>
      </div>

      <div className="h-px bg-white/5 my-8" />

      {/* Control / No Control Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
        <div>
          <h3 className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-5">
            What You Control
          </h3>
          <ul className="space-y-3">
            {controlFactors.control.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-slate-300">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                <span className="text-lg leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-5">
            What You Don't
          </h3>
          <ul className="space-y-3">
            {controlFactors.noControl.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-slate-500">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700 mt-2 flex-shrink-0" />
                <span className="text-lg leading-snug italic">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="h-px bg-white/5 my-8" />

      {/* Next Move Section */}
      <div className="mb-12 p-8 rounded-3xl bg-blue-500/5 border border-blue-500/10">
        <h3 className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-4">
          Your Next 60-Minute Move
        </h3>
        <p className="text-3xl text-white font-black leading-tight tracking-tighter">
          {move.nextMove}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={onComplete}
          disabled={isCompleting || move.isCompleted}
          className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-primary text-white font-bold hover:bg-primary/90 shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all duration-300 active:scale-95 disabled:opacity-50"
        >
          <Check className="w-5 h-5" />
          <span>{move.isCompleted ? "Completed" : "Mark Done"}</span>
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
