import { motion } from "framer-motion";
import { Check, Calendar } from "lucide-react";
import type { Move } from "@shared/schema";

interface OutputCardProps {
  move: Move;
  onComplete: () => void;
  isCompleting: boolean;
}

export function OutputCard({ move, onComplete, isCompleting }: OutputCardProps) {
  // Parse the JSON string for control factors if it's a string, otherwise it might already be parsed depending on API response handling
  const controlFactors = typeof move.controlFactors === 'string' 
    ? JSON.parse(move.controlFactors) 
    : move.controlFactors;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-[680px] mt-8 bg-white border-2 border-[#E2E8F0] rounded-xl p-8 shadow-sm"
    >
      {/* Core Problem Section */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">
          Core Problem
        </h3>
        <p className="text-lg text-foreground leading-relaxed font-medium">
          {move.coreProblem}
        </p>
      </div>

      <div className="h-px bg-border my-6" />

      {/* Control / No Control Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">
            What You Control
          </h3>
          <ul className="space-y-2">
            {controlFactors.control.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-foreground/90">
                <span className="text-primary mt-1.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-[#A0AEC0] uppercase tracking-wide mb-3">
            What You Don't
          </h3>
          <ul className="space-y-2">
            {controlFactors.noControl.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-muted-foreground">
                <span className="text-muted-foreground/50 mt-1.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="h-px bg-border my-6" />

      {/* Next Move Section */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">
          Your Next 60-Minute Move
        </h3>
        <p className="text-xl text-foreground font-medium leading-relaxed">
          {move.nextMove}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={() => window.alert("Calendar integration coming soon!")}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md border-2 border-primary text-primary font-medium hover:bg-primary hover:text-white transition-colors duration-200"
        >
          <Calendar className="w-4 h-4" />
          Add to Calendar
        </button>
        
        <button
          onClick={onComplete}
          disabled={isCompleting || move.isCompleted}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-[#FAFAFA] border-2 border-transparent text-[#48BB78] font-medium hover:bg-[#F0FFF4] hover:border-[#48BB78]/20 transition-all duration-200 disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          {move.isCompleted ? "Completed" : "Mark Done"}
        </button>
      </div>
    </motion.div>
  );
}
